import {
	buildPlayStoreUrlWithDeepLinkReferrer,
	stashPendingConsumerDeepLink,
} from './pendingConsumerDeepLink'

/** Native Beamio **Consumer** app — store listings (source of truth for /app-download). */
export const BEAMIO_ANDROID_PACKAGE = 'com.beamio.app'
export const BEAMIO_ANDROID_STORE_URL =
	'https://play.google.com/store/apps/details?id=com.beamio.app'
export const BEAMIO_IOS_STORE_URL =
	'https://apps.apple.com/us/app/beamio-smart-local-pass/id6755375110'

/**
 * Consumer custom scheme (`CashTrees_iOS` / CaehTrees, bundle `com.beamio.beamio`).
 * BeamioPOS must use `beamiopos://` only — iOS cannot pin a bundle ID on a custom scheme,
 * so a shared `beamio://` opens POS when Consumer is not installed.
 */
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

/**
 * In-app browsers (Telegram, Instagram, etc.): custom-scheme probes always show a system
 * “wants to open …” sheet and often bind SoftPOS / Beamio POS. Skip auto-probe there.
 *
 * Note: Telegram iOS WebView often still includes “Safari” in UA — do not rely on
 * `!Safari` alone; match Telegram (and peers) explicitly.
 */
export function isIosEmbeddedWebView(): boolean {
	if (typeof navigator === 'undefined') return false
	const ua = navigator.userAgent || ''
	if (!isIosDevice()) return false
	if (isKnownInAppBrowserUa(ua)) return true
	return !/Safari/i.test(ua)
}

/** Telegram / Instagram / WeChat / LINE / Facebook / Twitter in-app browsers. */
export function isKnownInAppBrowserUa(ua: string = typeof navigator !== 'undefined' ? navigator.userAgent || '' : ''): boolean {
	return (
		/Telegram/i.test(ua) ||
		/TelegramBot/i.test(ua) ||
		/\bFBAN\b|\bFBAV\b/i.test(ua) ||
		/Instagram/i.test(ua) ||
		/Line\//i.test(ua) ||
		/MicroMessenger/i.test(ua) ||
		/\bTwitter/i.test(ua) ||
		/\bLinkedInApp\b/i.test(ua)
	)
}

/**
 * Share landings: skip silent `beamio://` install probe.
 *
 * iOS: always skip. Custom schemes cannot pin Consumer (`com.beamio.beamio`).
 * Historic BeamioPOS also registered `beamio://`, so a silent probe opened POS
 * when Consumer was not installed. Incoming Universal Links (`/app`, `/app-download`)
 * open Consumer when installed; otherwise stay on this page / App Store.
 *
 * Telegram / in-app browsers: never auto-open custom scheme.
 */
export function shouldSkipSilentNativeAppProbe(): boolean {
	if (isBeamioNativeShell()) return true
	if (isIosDevice()) return true
	if (typeof navigator === 'undefined') return false
	const ua = navigator.userAgent || ''
	if (isKnownInAppBrowserUa(ua)) return true
	if (isIosEmbeddedWebView()) return true
	// Android system WebView marker (many messengers).
	if (isAndroidDevice() && /; wv\)/i.test(ua)) return true
	return false
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

/**
 * Android Chrome Intent — always pins **Consumer** package `com.beamio.app`
 * (never SoftPOS / `com.beamio.pos`).
 */
export function buildAndroidIntentOpenUrl(
	search: string,
	options: { storeFallback?: boolean } = {},
): string {
	const query = buildBeamioOpenQuery(search)
	const intentPath = query ? `open?${query}` : 'open'
	const storeFallback = options.storeFallback !== false
	const parts = [
		`intent://${intentPath}#Intent;`,
		`scheme=${ANDROID_SCHEME};`,
		`package=${BEAMIO_ANDROID_PACKAGE};`,
		`action=android.intent.action.VIEW;`,
	]
	if (storeFallback) {
		const deepLink = resolveBeamioAppTargetFromSearch(search)
		const storeUrl = deepLink
			? buildPlayStoreUrlWithDeepLinkReferrer(deepLink)
			: BEAMIO_ANDROID_STORE_URL
		parts.push(`S.browser_fallback_url=${encodeURIComponent(storeUrl)};`)
	}
	parts.push('end')
	return parts.join('')
}

export type AttemptOpenNativeBeamioAppOptions = {
	/**
	 * iOS: use top-level navigation (needs user gesture; may show system "Open in Beamio").
	 * Default false — hidden iframe probe avoids Safari "invalid address" when app is missing.
	 */
	useLocationNavigation?: boolean
	timeoutMs?: number
	/**
	 * When true (default), Android Intent includes Play Store `browser_fallback_url`.
	 * Set false for silent install probes — missing app must NOT jump to the store.
	 */
	storeFallback?: boolean
}

function waitForNativeAppOpenOrTimeout(
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
 * Mobile: try to open the **Consumer** Beamio native app (package / scheme above).
 * Desktop callers should show store links instead.
 */
export async function attemptOpenNativeBeamioApp(
	search: string,
	options: AttemptOpenNativeBeamioAppOptions = {},
): Promise<NativeAppOpenResult> {
	if (!isMobileDevice()) return 'desktop'

	const timeoutMs = options.timeoutMs ?? 2500
	const storeFallback = options.storeFallback !== false
	const useLocationNavigation = Boolean(options.useLocationNavigation)

	if (isAndroidDevice()) {
		const openUrl = buildAndroidIntentOpenUrl(search, { storeFallback })
		if (storeFallback && useLocationNavigation) {
			window.location.href = openUrl
			return 'opened'
		}
		return waitForNativeAppOpenOrTimeout(openUrl, timeoutMs, useLocationNavigation)
	}

	if (isIosDevice()) {
		// Do not navigate to `beamio://` on iOS. POS historically claimed the same
		// scheme; iOS would open BeamioPOS when Consumer was missing. Universal
		// Links + App Store are the Consumer-only paths.
		return 'not_installed'
	}

	return 'not_installed'
}

export type OpenBeamioAppStoreOptions = {
	/**
	 * Inner `https://beamio.app/app/?beamiocard=…[&ref=…]` (or app-download wrapper).
	 * Stashed for post-install so merchant/coupon + referrer survive App Store / Play open.
	 */
	deepLinkUrl?: string | null
	/** `/app-download` location.search — used when `deepLinkUrl` omitted. */
	pageSearch?: string
}

/**
 * Open Consumer App Store / Play Store (HTTPS only — never `beamio://` / web `/app/` PWA).
 * Before navigating, stash merchant/coupon deep link (incl. `ref=`) for post-install restore.
 */
export function openBeamioAppStore(options: OpenBeamioAppStoreOptions = {}): void {
	if (typeof window === 'undefined') return
	const fromOpt = options.deepLinkUrl?.trim() ?? ''
	const fromSearch = options.pageSearch
		? resolveBeamioAppTargetFromSearch(options.pageSearch)
		: resolveBeamioAppTargetFromSearch(window.location.search)
	const deepLink = stashPendingConsumerDeepLink(fromOpt || fromSearch)
	const url = isIosDevice()
		? BEAMIO_IOS_STORE_URL
		: deepLink
			? buildPlayStoreUrlWithDeepLinkReferrer(deepLink)
			: BEAMIO_ANDROID_STORE_URL
	// Prefer top-level HTTPS navigation so Telegram does not intercept a custom scheme.
	window.location.assign(url)
}

export type OpenBeamioAppOrStoreOptions = OpenBeamioAppStoreOptions & {
	/** How long to wait for the native app to take focus before falling back to the store. */
	probeTimeoutMs?: number
}

/**
 * 「Open in App」 CTA (user gesture):
 * 1. Stash deep link (merchant/coupon + `ref=`)
 * 2. Android: Intent `package=com.beamio.app`. iOS: skip custom scheme (App Store / Universal Links).
 * 3. Only if the page stays in the foreground → open App Store / Play Store
 *
 * Unlike page-load silent probe, this always attempts open (including Telegram) because the
 * user explicitly tapped Open in App.
 */
export async function openBeamioAppOrStore(
	pageSearch: string,
	options: OpenBeamioAppOrStoreOptions = {},
): Promise<'opened' | 'store' | 'desktop'> {
	if (typeof window === 'undefined') return 'desktop'
	if (!isMobileDevice()) {
		openBeamioAppStore(options)
		return 'desktop'
	}

	const fromOpt = options.deepLinkUrl?.trim() ?? ''
	const fromSearch = resolveBeamioAppTargetFromSearch(pageSearch)
	stashPendingConsumerDeepLink(fromOpt || fromSearch)

	const probeTimeoutMs = options.probeTimeoutMs ?? 1800
	const result = await attemptOpenNativeBeamioApp(pageSearch, {
		// User gesture: top-level navigation opens the installed app reliably.
		useLocationNavigation: true,
		timeoutMs: probeTimeoutMs,
		// Do not auto-jump to Play via Intent fallback — we only open the store if probe fails.
		storeFallback: false,
	})

	if (result === 'opened') return 'opened'
	if (result === 'desktop') {
		openBeamioAppStore({ ...options, pageSearch })
		return 'desktop'
	}

	openBeamioAppStore({ ...options, pageSearch })
	return 'store'
}
