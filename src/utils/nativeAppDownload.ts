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

/** True when running inside the Beamio iOS native WKWebView shell. */
export function isBeamioNativeShell(): boolean {
	if (typeof window === 'undefined') return false
	return Boolean((window as { CashTreesIOS?: unknown }).CashTreesIOS)
}

function normalizeSearch(search: string): string {
	return search.startsWith('?') ? search.slice(1) : search
}

function isBeamioAppPath(pathname: string): boolean {
	return pathname === '/app' || pathname === '/app/' || pathname.startsWith('/app/')
}

/** Inner SilentPassUI URL from `/app-download?target=…` (homepage share landing). */
export function resolveBeamioAppTargetFromSearch(search: string): string {
	const targetRaw = new URLSearchParams(normalizeSearch(search)).get('target')?.trim() ?? ''
	if (!targetRaw) return ''
	try {
		const url = new URL(targetRaw)
		if (url.origin !== 'https://beamio.app') return ''
		if (!isBeamioAppPath(url.pathname)) return ''
		return url.toString()
	} catch {
		return ''
	}
}

function unwrapAppDownloadTarget(decodedTarget: string): string {
	try {
		const url = new URL(decodedTarget)
		if (url.origin !== 'https://beamio.app') return decodedTarget
		if (url.pathname !== '/app-download' && !url.pathname.startsWith('/app-download/')) {
			return decodedTarget
		}
		const inner = url.searchParams.get('target')?.trim() ?? ''
		return inner || decodedTarget
	} catch {
		return decodedTarget
	}
}

/**
 * Build query string for `beamio://open?…` without nested `target=` encoding or cache-bust `v=`.
 * Prefer passthrough inner `/app/` params (`beamiocard`, `couponId`, `claim`) — matches iOS `BeamioDeepLink`.
 */
export function buildBeamioOpenQuery(search: string): string {
	const pageParams = new URLSearchParams(normalizeSearch(search))
	const targetRaw = pageParams.get('target')?.trim() ?? ''

	if (targetRaw) {
		const unwrapped = unwrapAppDownloadTarget(targetRaw)
		try {
			const inner = new URL(unwrapped)
			if (inner.origin === 'https://beamio.app' && isBeamioAppPath(inner.pathname)) {
				const passthrough = inner.searchParams.toString()
				if (passthrough) return passthrough
			}
			if (inner.origin === 'https://beamio.app') {
				return `target=${encodeURIComponent(unwrapped)}`
			}
		} catch {
			/* fall through */
		}
	}

	pageParams.delete('target')
	pageParams.delete('v')
	return pageParams.toString()
}

export function buildBeamioOpenUrl(search: string): string {
	const query = buildBeamioOpenQuery(search)
	return query ? `${IOS_OPEN_SCHEME}?${query}` : IOS_OPEN_SCHEME
}

/** Android Chrome: launch by package; Play Store fallback when app is missing. */
export function buildAndroidIntentOpenUrl(search: string): string {
	const query = buildBeamioOpenQuery(search)
	const intentPath = query ? `open?${query}` : 'open'
	const fallback = encodeURIComponent(BEAMIO_ANDROID_STORE_URL)
	return (
		`intent://${intentPath}#Intent;` +
		`scheme=${ANDROID_SCHEME};` +
		`package=${BEAMIO_ANDROID_PACKAGE};` +
		`action=android.intent.action.VIEW;` +
		`S.browser_fallback_url=${fallback};` +
		`end`
	)
}

function buildIosOpenUrl(search: string): string {
	return buildBeamioOpenUrl(search)
}

export type AttemptOpenNativeBeamioAppOptions = {
	/**
	 * iOS: use top-level navigation (needs user gesture; may show system "Open in Beamio").
	 * Default false — hidden iframe probe avoids Safari "invalid address" when app is missing.
	 */
	useLocationNavigation?: boolean
	timeoutMs?: number
	/**
	 * When true (default), Android uses Intent with Play Store `browser_fallback_url`.
	 * Set false for Discover merchant share landings — missing app must NOT open the store
	 * (caller typically falls back to web `/app/` instead).
	 */
	storeFallback?: boolean
}

function waitForIosNativeAppOpenOrTimeout(
	openUrl: string,
	timeoutMs: number,
	useLocationNavigation: boolean,
): Promise<NativeAppOpenResult> {
	return new Promise((resolve) => {
		let settled = false
		let iframe: HTMLIFrameElement | null = null

		const cleanup = () => {
			document.removeEventListener('visibilitychange', onVisibility)
			window.removeEventListener('pagehide', onPageHide)
			window.removeEventListener('blur', onBlur)
			iframe?.remove()
			iframe = null
		}

		const finish = (result: NativeAppOpenResult) => {
			if (settled) return
			settled = true
			window.clearTimeout(timer)
			cleanup()
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

		window.scrollTo(0, 0)
		if (useLocationNavigation) {
			window.location.href = openUrl
			return
		}

		iframe = document.createElement('iframe')
		iframe.style.cssText = 'display:none;border:0;width:0;height:0'
		iframe.setAttribute('aria-hidden', 'true')
		iframe.src = openUrl
		document.body.appendChild(iframe)
	})
}

/**
 * Mobile: try to open the native app; desktop callers should show store links instead.
 * Web cannot enumerate installed apps — we infer from custom-scheme / visibility probes (iOS)
 * or Android intent + Play Store fallback (unless `storeFallback: false`).
 */
export async function attemptOpenNativeBeamioApp(
	search: string,
	options: AttemptOpenNativeBeamioAppOptions = {},
): Promise<NativeAppOpenResult> {
	if (!isMobileDevice()) return 'desktop'

	const timeoutMs = options.timeoutMs ?? 2500
	const storeFallback = options.storeFallback !== false

	if (isAndroidDevice()) {
		if (storeFallback) {
			window.location.href = buildAndroidIntentOpenUrl(search)
			return 'opened'
		}
		// Soft probe — no Play Store fallback (Discover merchant / no-install UX).
		return waitForIosNativeAppOpenOrTimeout(
			buildBeamioOpenUrl(search),
			timeoutMs,
			Boolean(options.useLocationNavigation),
		)
	}

	if (isIosDevice()) {
		return waitForIosNativeAppOpenOrTimeout(
			buildIosOpenUrl(search),
			timeoutMs,
			Boolean(options.useLocationNavigation),
		)
	}

	return 'not_installed'
}

/** Open App Store / Play Store (HTTPS only — never shows Safari custom-scheme errors). */
export function openBeamioAppStore(): void {
	if (typeof window === 'undefined') return
	window.location.href = isIosDevice() ? BEAMIO_IOS_STORE_URL : BEAMIO_ANDROID_STORE_URL
}
