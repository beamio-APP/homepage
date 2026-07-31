import { ethers } from 'ethers'
import type { CardActiveIssuedCouponSeriesItem } from './discoverCouponOpenClaim'

const BEAMIO_API = '/api'

function asRecord(v: unknown): Record<string, unknown> | null {
	return v && typeof v === 'object' ? (v as Record<string, unknown>) : null
}

function readString(v: unknown): string {
	return typeof v === 'string' ? v.trim() : ''
}

function readMetadataCouponId(meta: Record<string, unknown> | null): string {
	if (!meta) return ''
	const root = readString(meta.couponId)
	if (root) return root
	const props = asRecord(meta.properties)
	const beamioCoupon = asRecord(props?.beamioCoupon)
	return readString(beamioCoupon?.couponId)
}

function formatSupplySummary(row: Record<string, unknown>): string | null {
	const total = readString(row.issuedNftMaxSupply).replace(/,/g, '')
	const remaining = readString(row.issuedNftRemainingSupply).replace(/,/g, '')
	if (total && remaining) return `TOTAL ${total} · LEFT ${remaining}`
	if (total) return `TOTAL ${total} · LEFT --`
	if (remaining) return `LEFT ${remaining}`
	return null
}

export type CouponShareSeriesExtras = {
	tokenId: string | null
	supplySummary: string | null
	seriesItem: CardActiveIssuedCouponSeriesItem | null
}

/** Match open-claim couponId to active series row for NFT capsule + TOTAL/LEFT + eligibility. */
export async function fetchCouponShareSeriesExtras(
	cardAddress: string,
	couponId: string,
): Promise<CouponShareSeriesExtras> {
	const empty: CouponShareSeriesExtras = { tokenId: null, supplySummary: null, seriesItem: null }
	const addr = cardAddress?.trim() ?? ''
	const wanted = couponId?.trim() ?? ''
	if (!addr || !wanted || !ethers.isAddress(addr)) return empty
	try {
		const card = ethers.getAddress(addr)
		const res = await fetch(
			`${BEAMIO_API}/cardActiveIssuedCouponSeries?card=${encodeURIComponent(card)}&limit=50`,
		)
		if (!res.ok) return empty
		const json = (await res.json()) as { items?: unknown[] }
		const items = Array.isArray(json.items) ? json.items : []
		for (const raw of items) {
			const row = asRecord(raw)
			if (!row) continue
			const meta = asRecord(row.metadata)
			const rowCouponId = readMetadataCouponId(meta) || String(row.tokenId ?? '').trim()
			if (rowCouponId !== wanted) continue
			const tokenId = String(row.tokenId ?? '').trim() || null
			if (!tokenId) continue
			return {
				tokenId,
				supplySummary: formatSupplySummary(row),
				seriesItem: {
					cardAddress: card,
					tokenId,
					metadata: meta,
					issuedNftValidBefore:
						typeof row.issuedNftValidBefore === 'string' ? row.issuedNftValidBefore : undefined,
				},
			}
		}
		return empty
	} catch {
		return empty
	}
}
