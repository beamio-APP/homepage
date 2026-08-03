/**
 * Deferred deep link for Consumer App Store / Play install.
 * Stash merchant/coupon `/app/?…&ref=` before opening the store; after install,
 * native shell (clipboard) or same-origin PWA (localStorage) restores it — including referrer.
 */

const STORAGE_KEY = 'beamio:pendingConsumerDeepLink:v1'
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000

type StoredPending = {
	url: string
	savedAt: number
}

function isBeamioAppPath(pathname: string): boolean {
	return pathname === '/app' || pathname === '/app/' || pathname.startsWith('/app/')
}

/** True when URL carries merchant card / coupon / redeem (and optional `ref=`). */
export function isMeaningfulConsumerAppDeepLink(raw: string): boolean {
	const input = raw?.trim() ?? ''
	if (!input) return false
	try {
		const u = new URL(input)
		if (u.origin !== 'https://beamio.app' && u.origin !== 'https://www.beamio.app') return false
		if (!isBeamioAppPath(u.pathname)) return false
		const card =
			u.searchParams.get('beamiocard')?.trim() ||
			u.searchParams.get('Beamiocard')?.trim() ||
			''
		if (!card) return false
		const discover = (u.searchParams.get('discover') ?? '').trim().toLowerCase()
		const couponId = (u.searchParams.get('couponId') ?? u.searchParams.get('couponid') ?? '').trim()
		const redeem = (u.searchParams.get('redeemcode') ?? u.searchParams.get('Redeemcode') ?? '').trim()
		const claim = (u.searchParams.get('claim') ?? '').trim().toLowerCase()
		if (discover === 'open' || discover === '1' || discover === 'true') return true
		if (couponId && (!claim || claim === 'open' || claim === '1' || claim === 'true')) return true
		if (redeem) return true
		return false
	} catch {
		return false
	}
}

function unwrapToInnerAppUrl(raw: string): string {
	const input = raw?.trim() ?? ''
	if (!input) return ''
	try {
		const u = new URL(input)
		if (
			(u.origin === 'https://beamio.app' || u.origin === 'https://www.beamio.app') &&
			(u.pathname === '/app-download' || u.pathname.startsWith('/app-download/'))
		) {
			const target = u.searchParams.get('target')?.trim() ?? ''
			return target ? unwrapToInnerAppUrl(target) : ''
		}
		if (isMeaningfulConsumerAppDeepLink(u.toString())) {
			// Drop OG cache-bust from pending payload.
			u.searchParams.delete('v')
			return u.toString()
		}
		return ''
	} catch {
		return ''
	}
}

function readStored(): StoredPending | null {
	if (typeof localStorage === 'undefined') return null
	try {
		const raw = localStorage.getItem(STORAGE_KEY)
		if (!raw) return null
		const parsed = JSON.parse(raw) as StoredPending
		if (!parsed?.url || typeof parsed.savedAt !== 'number') return null
		if (Date.now() - parsed.savedAt > MAX_AGE_MS) {
			localStorage.removeItem(STORAGE_KEY)
			return null
		}
		if (!isMeaningfulConsumerAppDeepLink(parsed.url)) {
			localStorage.removeItem(STORAGE_KEY)
			return null
		}
		return parsed
	} catch {
		return null
	}
}

/** Persist inner `/app/?beamiocard=…[&ref=…]` for post-install open (localStorage + clipboard). */
export function stashPendingConsumerDeepLink(rawUrl: string): string {
	const url = unwrapToInnerAppUrl(rawUrl)
	if (!url || typeof window === 'undefined') return ''
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify({ url, savedAt: Date.now() } satisfies StoredPending))
	} catch {
		/* quota / private mode */
	}
	try {
		void navigator.clipboard?.writeText(url)
	} catch {
		/* clipboard may require gesture; Open-in-App click usually qualifies */
	}
	return url
}

export function peekPendingConsumerDeepLink(): string | null {
	return readStored()?.url ?? null
}

/** Read and clear pending deep link (if still valid). */
export function takePendingConsumerDeepLink(): string | null {
	const stored = readStored()
	if (!stored) return null
	try {
		localStorage.removeItem(STORAGE_KEY)
	} catch {
		/* ignore */
	}
	return stored.url
}

/** Play Store `referrer=` payload so Android can recover the deep link after install. */
export function buildPlayStoreUrlWithDeepLinkReferrer(deepLinkUrl: string): string {
	const base = 'https://play.google.com/store/apps/details?id=com.beamio.app'
	const url = unwrapToInnerAppUrl(deepLinkUrl) || deepLinkUrl.trim()
	if (!url) return base
	const referrer = `beamio_dl=${encodeURIComponent(url)}`
	return `${base}&referrer=${encodeURIComponent(referrer)}`
}
