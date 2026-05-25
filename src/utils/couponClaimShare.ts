export type CouponClaimShareMeta = {
	cardAddress: string
	couponId: string
	merchantName?: string
	shareHeadline?: string
	shareKind?: 'open_claim' | 'redeem'
	title: string
	subtitle: string
	iconUrl: string
	backgroundImage: string
	backgroundColorHex: string
	validBeforeSec: number | null
	expiresLabel: string
	shareUrl: string
	ogImageUrl: string
}

const BEAMIO_API = '/api'

function upsertMetaTag(attr: 'name' | 'property', key: string, content: string): void {
	if (typeof document === 'undefined') return
	const selector = `meta[${attr}="${key}"]`
	let el = document.head.querySelector(selector) as HTMLMetaElement | null
	if (!el) {
		el = document.createElement('meta')
		el.setAttribute(attr, key)
		document.head.appendChild(el)
	}
	el.setAttribute('content', content)
}

export function applyCouponClaimShareMeta(meta: CouponClaimShareMeta): void {
	if (typeof document === 'undefined') return
	const pageTitle = meta.shareHeadline?.trim()
		? `${meta.shareHeadline} — Beamio`
		: `${meta.title} — Beamio Coupon`
	document.title = pageTitle
	upsertMetaTag('name', 'description', meta.subtitle)
	upsertMetaTag('property', 'og:type', 'website')
	upsertMetaTag('property', 'og:site_name', 'Beamio')
	upsertMetaTag('property', 'og:title', meta.shareHeadline?.trim() || meta.title)
	upsertMetaTag('property', 'og:description', meta.subtitle)
	upsertMetaTag('property', 'og:url', meta.shareUrl)
	upsertMetaTag('property', 'og:image', meta.ogImageUrl)
	upsertMetaTag('property', 'og:image:width', '1200')
	upsertMetaTag('property', 'og:image:height', '630')
	upsertMetaTag('name', 'twitter:card', 'summary_large_image')
	upsertMetaTag('name', 'twitter:title', meta.shareHeadline?.trim() || meta.title)
	upsertMetaTag('name', 'twitter:description', meta.subtitle)
	upsertMetaTag('name', 'twitter:image', meta.ogImageUrl)
}

export function buildAppDownloadShareUrl(search: string): string {
	if (typeof window === 'undefined') return ''
	const normalized = search.startsWith('?') ? search : search ? `?${search}` : ''
	return `${window.location.origin}/app-download${normalized}`
}

export async function fetchCouponClaimShareMeta(shareUrl: string): Promise<CouponClaimShareMeta | null> {
	const url = shareUrl?.trim() ?? ''
	if (!url) return null
	try {
		const res = await fetch(
			`${BEAMIO_API}/share/coupon-claim-meta?target=${encodeURIComponent(url)}`
		)
		if (!res.ok) return null
		const json = (await res.json()) as { ok?: boolean; meta?: CouponClaimShareMeta }
		if (!json?.ok || !json.meta) return null
		return json.meta
	} catch {
		return null
	}
}

export function couponExpiryUsesUrgentVariant(expiresLabel: string): boolean {
	return expiresLabel === 'EXPIRED' || /\bEXPIRES IN \d+H\b|\bEXPIRES IN \d+M\b/.test(expiresLabel)
}
