import { ethers } from 'ethers'
import type { CouponClaimShareMeta } from './couponClaimShare'
import {
	fetchCardProgramSocialSummary,
	type CardProgramSocialSummary,
} from './cardProgramSocialStats'
import {
	resolveDiscoverMerchantInfoPanel,
	type DiscoverMerchantInfoPanel,
} from './discoverMerchantInfoPanel'

const BEAMIO_API = '/api'

export type DiscoverAboutFields = {
	aboutTitle?: string
	detail?: string
	openingHours?: string
	contact?: string
	location?: string
}

export type DiscoverMerchantCouponPreview = {
	id: string
	couponId: string
	tokenId: string
	title: string
	subtitle: string
	backgroundImage: string
	backgroundColorHex: string
	iconUrl: string
	expiresLabel: string
	supplySummary: string | null
}

export type DiscoverMerchantTierPreview = {
	name: string
	thresholdLabel: string
	discountLabel: string
}

export type DiscoverMerchantCouponSeriesRow = {
	title: string
	tokenId: string
	metadata: Record<string, unknown> | null
}

export type DiscoverMerchantLandingModel = {
	cardAddress: string
	title: string
	subtitle: string
	programName: string
	heroImage: string
	logoUrl: string | null
	currency: string
	categoryId: string | null
	cardOwner: string | null
	metadataRoot: Record<string, unknown> | null
	discoverAbout: DiscoverAboutFields | null
	merchantInfoPanel: DiscoverMerchantInfoPanel | null
	coupons: DiscoverMerchantCouponPreview[] | null
	couponSeries: DiscoverMerchantCouponSeriesRow[] | null
	rewardTiers: DiscoverMerchantTierPreview[] | null
	socialStats: CardProgramSocialSummary | null
	rechargeBonusPill: string | null
}

const asRecord = (v: unknown): Record<string, unknown> | null =>
	v && typeof v === 'object' ? (v as Record<string, unknown>) : null

const readString = (v: unknown): string => (typeof v === 'string' ? v.trim() : '')

function readShare(meta: Record<string, unknown> | null): Record<string, unknown> | null {
	if (!meta) return null
	return asRecord(meta.shareTokenMetadata)
}

function readBusinessName(meta: Record<string, unknown> | null): string {
	if (!meta) return ''
	const share = readShare(meta)
	return (
		readString(meta.businessName) ||
		readString(meta.storeName) ||
		readString(share?.displayName) ||
		readString(share?.businessName)
	)
}

function readCategoryId(meta: Record<string, unknown> | null): string | null {
	const share = readShare(meta)
	const categories = share?.categories
	if (!Array.isArray(categories) || categories.length === 0) return null
	const first = categories[0]
	return typeof first === 'string' && first.trim() ? first.trim() : null
}

function readProgramName(meta: Record<string, unknown> | null): string {
	const share = readShare(meta)
	return readString(share?.name) || readString(meta?.name) || 'Program'
}

function readProgramDescription(meta: Record<string, unknown> | null): string {
	const share = readShare(meta)
	return readString(share?.description) || readString(meta?.description) || readString(meta?.programDescription)
}

function readHeroFromMeta(meta: Record<string, unknown> | null): string {
	if (!meta) return ''
	const share = readShare(meta)
	return (
		readString(share?.merchantImage) ||
		readString(share?.backgroundImage) ||
		readString(share?.background) ||
		readString(meta.programBackgroundImage) ||
		readString(meta.merchantImage) ||
		''
	)
}

function readLogoFromMeta(meta: Record<string, unknown> | null): string | null {
	if (!meta) return null
	const share = readShare(meta)
	const icon =
		readString(share?.image) ||
		readString(share?.icon) ||
		readString(meta.programIconUrl) ||
		readString(meta.logoUrl)
	return icon || null
}

function parseDiscoverAbout(meta: Record<string, unknown> | null): DiscoverAboutFields | null {
	const share = readShare(meta)
	const about = asRecord(share?.discoverAbout)
	if (!about) return null
	const detail = readString(about.detail)
	const openingHours = readString(about.openingHours)
	const contact = readString(about.contact)
	const location = readString(about.location)
	const aboutTitle = readString(about.aboutTitle)
	if (!detail && !openingHours && !contact && !location && !aboutTitle) return null
	return { aboutTitle, detail, openingHours, contact, location }
}

function parseTierDiscountPct(description: string): number {
	const m = description.trim().match(/(\d+(?:\.\d+)?)\s*%\s*discount/i)
	return m ? Number.parseFloat(m[1]) : 0
}

function fiatPrefix(code: string): string {
	const c = code.toUpperCase()
	if (c === 'CAD') return 'CA$'
	if (c === 'EUR') return '€'
	if (c === 'JPY') return 'JP¥'
	if (c === 'TWD') return 'NT$'
	if (c === 'CNY') return 'CN¥'
	if (c === 'HKD') return 'HK$'
	if (c === 'SGD') return 'SG$'
	return '$'
}

function parseRewardTiers(meta: Record<string, unknown> | null, currency: string): DiscoverMerchantTierPreview[] {
	if (!meta) return []
	const raw = meta.tiers
	if (!Array.isArray(raw) || raw.length === 0) return []
	type Row = { name: string; minUsdc6: bigint; discountPct: number }
	const rows: Row[] = []
	for (const item of raw) {
		const o = asRecord(item)
		if (!o) continue
		const minRaw = o.minUsdc6 ?? o.min_usdc6
		let minUsdc6 = 0n
		try {
			if (typeof minRaw === 'bigint') minUsdc6 = minRaw
			else if (typeof minRaw === 'number' && Number.isFinite(minRaw)) minUsdc6 = BigInt(Math.trunc(minRaw))
			else if (typeof minRaw === 'string' && minRaw.trim()) minUsdc6 = BigInt(minRaw.trim())
		} catch {
			minUsdc6 = 0n
		}
		const nested = asRecord(o.properties)
		const nameRaw = o.name ?? nested?.name
		const tierName = typeof nameRaw === 'string' && nameRaw.trim() ? nameRaw.trim() : 'Tier'
		const descRaw = o.description ?? nested?.description
		const description = typeof descRaw === 'string' ? descRaw : ''
		rows.push({ name: tierName, minUsdc6, discountPct: parseTierDiscountPct(description) })
	}
	rows.sort((a, b) => (a.minUsdc6 < b.minUsdc6 ? -1 : a.minUsdc6 > b.minUsdc6 ? 1 : 0))
	if (rows.length <= 1) return []
	const baseMin = rows[0].minUsdc6
	const prefix = fiatPrefix(currency)
	return rows
		.filter((row) => row.minUsdc6 > baseMin)
		.map((row) => ({
			name: row.name,
			thresholdLabel:
				row.minUsdc6 > 0n
					? `${prefix}${Number(ethers.formatUnits(row.minUsdc6, 6)).toFixed(2)}`
					: '—',
			discountLabel:
				row.discountPct > 0 ? `${Math.round(row.discountPct)}% DISCOUNT` : 'Member pricing',
		}))
}

function readMetadataCouponId(meta: Record<string, unknown> | null): string {
	if (!meta) return ''
	const root = readString(meta.couponId)
	if (root) return root
	const props = asRecord(meta.properties)
	const beamioCoupon = asRecord(props?.beamioCoupon)
	return readString(beamioCoupon?.couponId)
}

function readMetadataTitle(meta: Record<string, unknown> | null): string {
	if (!meta) return ''
	const props = asRecord(meta.properties)
	const beamioCoupon = asRecord(props?.beamioCoupon)
	return (
		readString(meta.title) ||
		readString(meta.name) ||
		readString(beamioCoupon?.title) ||
		readString(beamioCoupon?.name)
	)
}

function readMetadataSubtitle(meta: Record<string, unknown> | null): string {
	if (!meta) return ''
	const props = asRecord(meta.properties)
	const beamioCoupon = asRecord(props?.beamioCoupon)
	const raw =
		readString(meta.subtitle) ||
		readString(meta.description) ||
		readString(beamioCoupon?.subtitle) ||
		readString(beamioCoupon?.description)
	if (!raw || raw === 'Gift voucher') return 'Add coupon details for members'
	return raw
}

function readMetadataStringFromKeys(src: Record<string, unknown> | null, keys: readonly string[]): string {
	if (!src) return ''
	for (const key of keys) {
		const v = readString(src[key])
		if (v) return v
	}
	return ''
}

const COUPON_BACKGROUND_IMAGE_KEYS = [
	'couponImage',
	'background',
	'backgroundImage',
	'backgroundImageUrl',
	'cover',
	'coverImage',
] as const

const COUPON_BACKGROUND_COLOR_KEYS = [
	'backgroundColor',
	'bgColor',
	'color',
	'backgroundColorHex',
	'background_color',
] as const

function readMetadataBackgroundImage(meta: Record<string, unknown> | null): string {
	if (!meta) return ''
	const props = asRecord(meta.properties)
	const beamioCoupon = asRecord(props?.beamioCoupon)
	return (
		readMetadataStringFromKeys(meta, COUPON_BACKGROUND_IMAGE_KEYS) ||
		readMetadataStringFromKeys(beamioCoupon, COUPON_BACKGROUND_IMAGE_KEYS)
	)
}

function readMetadataBackgroundColor(meta: Record<string, unknown> | null): string {
	if (!meta) return '#2B2E3A'
	const props = asRecord(meta.properties)
	const beamioCoupon = asRecord(props?.beamioCoupon)
	const c =
		readMetadataStringFromKeys(meta, COUPON_BACKGROUND_COLOR_KEYS) ||
		readMetadataStringFromKeys(beamioCoupon, COUPON_BACKGROUND_COLOR_KEYS)
	if (!c) return '#2B2E3A'
	return c.startsWith('#') ? c : `#${c}`
}

/** Align SilentPassUI ActiveCouponsScreen `readMetadataIconUrl`. */
function readMetadataIconUrl(meta: Record<string, unknown> | null): string {
	if (!meta) return ''
	const props = asRecord(meta.properties)
	const beamioCoupon = asRecord(props?.beamioCoupon)
	const shareTokenMetadata = asRecord(meta.shareTokenMetadata)
	const imageObj = asRecord(meta.image)
	return (
		readString(meta.iconUrl) ||
		readString(meta.icon) ||
		readString(meta.logoUrl) ||
		readString(meta.logo) ||
		readString(beamioCoupon?.iconUrl) ||
		readString(beamioCoupon?.icon) ||
		readString(beamioCoupon?.logoUrl) ||
		readString(beamioCoupon?.logo) ||
		readString(shareTokenMetadata?.logoUrl) ||
		readString(shareTokenMetadata?.logo) ||
		readString(imageObj?.url) ||
		readString(meta.image)
	)
}

function formatCouponExpiryFromSec(validBeforeSec: number | null): string {
	if (validBeforeSec == null || validBeforeSec <= 0) return 'VALID NOW'
	const nowSec = Math.floor(Date.now() / 1000)
	const diff = validBeforeSec - nowSec
	if (diff <= 0) return 'EXPIRED'
	const days = Math.floor(diff / 86400)
	if (days >= 1) return `EXPIRES IN ${days}D`
	const hours = Math.floor(diff / 3600)
	if (hours >= 1) return `EXPIRES IN ${hours}H`
	const mins = Math.max(1, Math.floor(diff / 60))
	return `EXPIRES IN ${mins}M`
}

function formatSupplySummary(row: Record<string, unknown>): string | null {
	const total = readString(row.issuedNftMaxSupply).replace(/,/g, '')
	const remaining = readString(row.issuedNftRemainingSupply).replace(/,/g, '')
	if (total && remaining) return `TOTAL ${total} · LEFT ${remaining}`
	if (total) return `TOTAL ${total} · LEFT --`
	if (remaining) return `LEFT ${remaining}`
	return null
}

async function fetchCardMetadata(cardAddress: string): Promise<{
	metadata: Record<string, unknown> | null
	currency: string
	cardOwner: string | null
}> {
	try {
		const res = await fetch(
			`${BEAMIO_API}/cardMetadata?cardAddress=${encodeURIComponent(cardAddress)}`,
		)
		if (!res.ok) return { metadata: null, currency: 'USD', cardOwner: null }
		const json = (await res.json()) as {
			metadata?: unknown
			currency?: string
			cardCurrency?: string
			cardOwner?: string
		}
		const currency =
			readString(json.cardCurrency) || readString(json.currency) || 'USD'
		let cardOwner: string | null = null
		const ownerRaw = readString(json.cardOwner)
		if (ownerRaw && ethers.isAddress(ownerRaw)) {
			try {
				cardOwner = ethers.getAddress(ownerRaw)
			} catch {
				cardOwner = null
			}
		}
		return { metadata: asRecord(json.metadata), currency, cardOwner }
	} catch {
		return { metadata: null, currency: 'USD', cardOwner: null }
	}
}

async function fetchLatestCardsMetadata(cardAddress: string): Promise<{
	metadata: Record<string, unknown> | null
	currency: string
}> {
	const target = cardAddress.toLowerCase()
	try {
		const res = await fetch(`${BEAMIO_API}/latestCards?limit=100`)
		if (!res.ok) return { metadata: null, currency: 'USD' }
		const json = (await res.json()) as { items?: unknown[] }
		const items = Array.isArray(json.items) ? json.items : []
		for (const raw of items) {
			const row = asRecord(raw)
			if (!row) continue
			const addr = readString(row.cardAddress)
			if (!addr || addr.toLowerCase() !== target) continue
			const meta =
				row.metadata != null && typeof row.metadata === 'object'
					? (row.metadata as Record<string, unknown>)
					: null
			const currency = readString(row.currency) || 'USD'
			return { metadata: meta, currency }
		}
	} catch {
		// untrusted
	}
	return { metadata: null, currency: 'USD' }
}

function parseCouponMetadata(raw: unknown): Record<string, unknown> | null {
	if (raw == null) return null
	if (typeof raw === 'string') {
		try {
			return asRecord(JSON.parse(raw))
		} catch {
			return null
		}
	}
	return asRecord(raw)
}

type MerchantCouponsFetchResult = {
	coupons: DiscoverMerchantCouponPreview[] | null
	series: DiscoverMerchantCouponSeriesRow[] | null
}

/** Align SilentPassUI `mapActiveCouponRow` + Discover merchant coupon list. */
async function fetchMerchantCoupons(cardAddress: string): Promise<MerchantCouponsFetchResult> {
	try {
		const res = await fetch(
			`${BEAMIO_API}/cardActiveIssuedCouponSeries?card=${encodeURIComponent(cardAddress)}&limit=50`,
		)
		if (!res.ok) return { coupons: null, series: null }
		const json = (await res.json()) as { items?: unknown[] }
		const items = Array.isArray(json.items) ? json.items : []
		const mapped: DiscoverMerchantCouponPreview[] = []
		const series: DiscoverMerchantCouponSeriesRow[] = []
		for (const raw of items) {
			const row = asRecord(raw)
			if (!row) continue
			const meta = parseCouponMetadata(row.metadata)
			const tokenId = String(row.tokenId ?? '').trim()
			const couponId = readMetadataCouponId(meta) || tokenId
			if (!couponId && !tokenId) continue
			const validBeforeNum = Number(row.issuedNftValidBefore ?? 0)
			const validBeforeSec =
				Number.isFinite(validBeforeNum) && validBeforeNum > 0 ? validBeforeNum : null
			const idKey = tokenId || couponId
			const title = readMetadataTitle(meta) || 'Coupon'
			mapped.push({
				id: `${cardAddress.toLowerCase()}:${idKey}`,
				couponId: couponId || idKey,
				tokenId,
				title,
				subtitle: readMetadataSubtitle(meta),
				backgroundImage: readMetadataBackgroundImage(meta),
				backgroundColorHex: readMetadataBackgroundColor(meta),
				iconUrl: readMetadataIconUrl(meta),
				expiresLabel: formatCouponExpiryFromSec(validBeforeSec),
				supplySummary: formatSupplySummary(row),
			})
			series.push({ title, tokenId, metadata: meta })
		}
		return { coupons: mapped, series }
	} catch {
		return { coupons: null, series: null }
	}
}

export async function loadDiscoverMerchantLanding(
	cardAddress: string,
	shareFallback: CouponClaimShareMeta | null,
): Promise<DiscoverMerchantLandingModel | null> {
	let addr: string
	try {
		addr = ethers.getAddress(cardAddress.trim())
	} catch {
		return null
	}

	const [latestRow, cardMetaRow, couponRows, socialStats] = await Promise.all([
		fetchLatestCardsMetadata(addr),
		fetchCardMetadata(addr),
		fetchMerchantCoupons(addr),
		fetchCardProgramSocialSummary(addr),
	])

	const metadata = cardMetaRow.metadata ?? latestRow.metadata
	const currency = cardMetaRow.currency || latestRow.currency || 'USD'
	const coupons = couponRows.coupons
	const couponSeries = couponRows.series

	const businessName = readBusinessName(metadata)
	const programName = readProgramName(metadata)
	const title =
		businessName ||
		shareFallback?.title?.trim() ||
		programName ||
		'Merchant'
	const subtitle =
		readProgramDescription(metadata) ||
		shareFallback?.subtitle?.trim() ||
		`${title} on Beamio`
	const heroImage =
		readHeroFromMeta(metadata) ||
		shareFallback?.backgroundImage?.trim() ||
		''
	const logoUrl = readLogoFromMeta(metadata) || shareFallback?.iconUrl?.trim() || null
	const discoverAbout = parseDiscoverAbout(metadata)
	const merchantInfoPanel = resolveDiscoverMerchantInfoPanel(title, discoverAbout)
	const rewardTiers = metadata ? parseRewardTiers(metadata, currency) : []
	const categoryId = readCategoryId(metadata)

	return {
		cardAddress: addr,
		title,
		subtitle,
		programName,
		heroImage,
		logoUrl,
		currency,
		categoryId,
		cardOwner: cardMetaRow.cardOwner,
		metadataRoot: metadata,
		discoverAbout,
		merchantInfoPanel,
		coupons,
		couponSeries,
		rewardTiers: rewardTiers.length > 0 ? rewardTiers : null,
		socialStats,
		rechargeBonusPill: null,
	}
}
