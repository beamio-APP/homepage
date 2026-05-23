/** Native Beamio apps — store listings (source of truth for /app-download). */
export const BEAMIO_ANDROID_PACKAGE = 'com.beamio.app'
export const BEAMIO_ANDROID_STORE_URL =
	'https://play.google.com/store/apps/details?id=com.beamio.app'
export const BEAMIO_IOS_STORE_URL =
	'https://apps.apple.com/us/app/beamio-smart-local-pass/id6755375110'

/** Custom schemes to probe / open when native handlers are registered. */
const IOS_OPEN_SCHEME = 'beamio://open'
const ANDROID_SCHEME = 'beamio'

export type NativeAppOpenResult = 'opened' | 'not_installed' | 'desktop'

export function isMobileDevice(): boolean {
	if (typeof navigator === 'undefined') return false
	const ua = navigator.userAgent || ''
	let coarse = false
	try {
		coarse =
			typeof window !== 'undefined' &&
			typeof window.matchMedia === 'function' &&
			window.matchMedia('(pointer: coarse)').matches
	} catch {
		coarse = false
	}
	if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) return true
	if (coarse && !/Windows NT|Macintosh|X11|Linux x86_64/i.test(ua)) return true
	return false
}

export function isAndroidDevice(): boolean {
	if (typeof navigator === 'undefined') return false
	return /Android/i.test(navigator.userAgent || '')
}

export function isIosDevice(): boolean {
	if (typeof navigator === 'undefined') return false
	if (!isMobileDevice()) return false
	return /iPhone|iPad|iPod/i.test(navigator.userAgent || '')
}

function buildDeepLinkSuffix(search: string): string {
	const q = search.startsWith('?') ? search.slice(1) : search
	return q ? `?${q}` : ''
}

/** Android Chrome: launch by package; Play Store fallback when app is missing. */
export function buildAndroidIntentOpenUrl(search: string): string {
	const suffix = buildDeepLinkSuffix(search)
	const fallback = encodeURIComponent(BEAMIO_ANDROID_STORE_URL)
	return (
		`intent://open${suffix}#Intent;` +
		`scheme=${ANDROID_SCHEME};` +
		`package=${BEAMIO_ANDROID_PACKAGE};` +
		`action=android.intent.action.VIEW;` +
		`S.browser_fallback_url=${fallback};` +
		`end`
	)
}

function buildIosOpenUrl(scheme: string, search: string): string {
	const suffix = buildDeepLinkSuffix(search)
	const base = scheme.endsWith('/') ? scheme.slice(0, -1) : scheme
	return `${base}${suffix}`
}

function waitForNativeAppOpenOrTimeout(search: string, timeoutMs: number): Promise<NativeAppOpenResult> {
	return new Promise((resolve) => {
		let settled = false
		const finish = (result: NativeAppOpenResult) => {
			if (settled) return
			settled = true
			window.clearTimeout(timer)
			document.removeEventListener('visibilitychange', onVisibility)
			window.removeEventListener('pagehide', onPageHide)
			window.removeEventListener('blur', onBlur)
			resolve(result)
		}

		const onVisibility = () => {
			if (document.visibilityState === 'hidden') finish('opened')
		}
		const onPageHide = () => finish('opened')
		const onBlur = () => finish('opened')
		const timer = window.setTimeout(() => finish('not_installed'), timeoutMs)

		document.addEventListener('visibilitychange', onVisibility)
		window.addEventListener('pagehide', onPageHide)
		window.addEventListener('blur', onBlur)

		window.location.href = buildIosOpenUrl(IOS_OPEN_SCHEME, search)
	})
}

/**
 * Mobile: try to open the native app; desktop callers should show store links instead.
 * Web cannot enumerate installed apps — we infer from custom-scheme / visibility probes (iOS)
 * or Android intent + Play Store fallback.
 */
export async function attemptOpenNativeBeamioApp(search: string): Promise<NativeAppOpenResult> {
	if (!isMobileDevice()) return 'desktop'

	if (isAndroidDevice()) {
		window.location.href = buildAndroidIntentOpenUrl(search)
		return 'opened'
	}

	if (isIosDevice()) {
		// Direct navigation counts as user gesture — try open first, then install UI on timeout.
		return waitForNativeAppOpenOrTimeout(search, 2500)
	}

	return 'not_installed'
}
