import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Calendar, Clock, Download, Loader2, Smartphone } from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'
import BeamioBrandLogo from '../components/BeamioBrandLogo'
import {
	attemptOpenNativeBeamioApp,
	BEAMIO_ANDROID_STORE_URL,
	BEAMIO_IOS_STORE_URL,
	isAndroidDevice,
	isBeamioNativeShell,
	isIosDevice,
	isMobileDevice,
} from '../utils/nativeAppDownload'
import {
	applyCouponClaimShareMeta,
	buildAppDownloadShareUrl,
	couponExpiryUsesUrgentVariant,
	fetchCouponClaimShareMeta,
	type CouponClaimShareMeta,
} from '../utils/couponClaimShare'

type PagePhase = 'checking' | 'install' | 'desktop'

function resolveBeamioAppTarget(search: string): string {
	const target = new URLSearchParams(search).get('target')?.trim() ?? ''
	if (!target) return ''
	try {
		const url = new URL(target)
		if (url.origin !== 'https://beamio.app') return ''
		if (url.pathname !== '/app/' && url.pathname !== '/app' && !url.pathname.startsWith('/app/')) return ''
		return url.toString()
	} catch {
		return ''
	}
}

function isIosEmbeddedWebView(): boolean {
	if (typeof navigator === 'undefined') return false
	const ua = navigator.userAgent || ''
	return isIosDevice() && !/Safari/i.test(ua)
}

/** In native shell or embedded WKWebView: jump straight to inner `/app/` claim URL. */
function shouldRedirectToInnerAppTarget(): boolean {
	return isBeamioNativeShell() || isIosEmbeddedWebView()
}

function CouponSharePreview({
	meta,
	shareUrl,
}: {
	meta: CouponClaimShareMeta
	shareUrl: string
}) {
	const expiryUrgent = couponExpiryUsesUrgentVariant(meta.expiresLabel)
	const ExpiryIcon = expiryUrgent ? Clock : Calendar

	const shareHeadline =
		meta.shareHeadline?.trim() ||
		(meta.merchantName?.trim()
			? `${meta.shareKind === 'redeem' ? 'Redeem' : 'Claim'} a ${meta.merchantName.trim()} Coupon`
			: '')

	return (
		<div className="mx-auto w-full max-w-xl text-left">
			{shareHeadline ? (
				<p className="mb-3 text-center font-manrope text-base font-extrabold tracking-tight text-slate-900 sm:text-lg">
					{shareHeadline}
				</p>
			) : null}
			<div className="relative w-full rounded-[1.75rem]">
				<div
					className="pointer-events-none absolute left-0 top-1/2 z-20 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f8fafc]"
					aria-hidden
				/>
				<div
					className="pointer-events-none absolute right-0 top-1/2 z-20 h-9 w-9 translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f8fafc]"
					aria-hidden
				/>
				<div className="relative min-h-[7.5rem] overflow-hidden rounded-[1.75rem] ring-1 ring-black/[0.08]">
					{meta.backgroundImage ? (
						<>
							<img
								src={meta.backgroundImage}
								alt=""
								className="absolute inset-0 h-full w-full object-cover"
								draggable={false}
							/>
							<div className="absolute inset-0 bg-gradient-to-r from-black/72 via-black/52 to-black/35" />
						</>
					) : (
						<div
							className="absolute inset-0"
							style={{ backgroundColor: meta.backgroundColorHex || '#2B2E3A' }}
						>
							<div
								className="pointer-events-none absolute inset-0 opacity-[0.12]"
								style={{
									backgroundImage:
										'repeating-linear-gradient(-26deg, #fff 0, #fff 1px, transparent 1px, transparent 8px)',
								}}
								aria-hidden
							/>
							<div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-black/30" />
						</div>
					)}

					<div className="relative z-[1] flex min-h-[7.5rem] items-center gap-3 px-7 py-4 pr-[6.25rem] sm:gap-4 sm:px-8 sm:py-5 sm:pr-[6.75rem]">
						<div className="relative flex h-[3.35rem] w-[3.35rem] shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white/40 bg-white/95 shadow-md ring-2 ring-black/10 sm:h-14 sm:w-14">
							{meta.iconUrl ? (
								<img src={meta.iconUrl} alt="" className="h-full w-full object-cover" draggable={false} />
							) : (
								<div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-white to-slate-200 text-base font-black text-[#2c2f31]/75 sm:text-lg">
									{meta.title.charAt(0).toUpperCase()}
								</div>
							)}
						</div>

						<div className="min-w-0 flex-1 text-white">
							<p className="truncate text-[1.05rem] font-extrabold leading-tight tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)] sm:text-lg">
								{meta.title}
							</p>
							<p className="mt-0.5 truncate text-sm font-semibold text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]">
								{meta.subtitle}
							</p>
							<div
								className={`mt-2 inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${
									expiryUrgent
										? 'bg-red-600 text-white shadow-sm shadow-red-900/25'
										: 'border border-white/25 bg-slate-950/65 text-white shadow-sm shadow-black/20 backdrop-blur-md'
								}`}
							>
								<ExpiryIcon className="h-3 w-3 shrink-0" strokeWidth={2.5} aria-hidden />
								<span className="truncate">{meta.expiresLabel}</span>
							</div>
						</div>

						<div className="absolute right-6 top-1/2 z-[2] -translate-y-1/2 rounded-2xl bg-white p-2 shadow-sm sm:right-8">
							<QRCodeCanvas value={shareUrl} size={96} level="M" includeMargin={false} />
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default function AppDownloadPage() {
	const location = useLocation()
	const targetUrl = useMemo(() => resolveBeamioAppTarget(location.search), [location.search])
	const shareUrl = useMemo(() => buildAppDownloadShareUrl(location.search), [location.search])
	const [phase, setPhase] = useState<PagePhase>(() => (isMobileDevice() ? 'checking' : 'desktop'))
	const [shareMeta, setShareMeta] = useState<CouponClaimShareMeta | null>(null)
	const redirectingToInnerTarget = Boolean(targetUrl && shouldRedirectToInnerAppTarget())

	useLayoutEffect(() => {
		if (!targetUrl || !shouldRedirectToInnerAppTarget()) return
		window.location.replace(targetUrl)
	}, [targetUrl])

	useEffect(() => {
		if (redirectingToInnerTarget) return
		if (!targetUrl || !shareUrl) {
			document.title = 'Get Beamio App'
			return
		}

		let cancelled = false
		void (async () => {
			const meta = await fetchCouponClaimShareMeta(shareUrl)
			if (cancelled) return
			if (meta) {
				setShareMeta(meta)
				applyCouponClaimShareMeta(meta)
				return
			}
			document.title = 'Get Beamio App'
		})()

		return () => {
			cancelled = true
		}
	}, [redirectingToInnerTarget, shareUrl, targetUrl])

	useEffect(() => {
		if (redirectingToInnerTarget) return

		let cancelled = false

		async function run() {
			if (!isMobileDevice()) {
				setPhase('desktop')
				return
			}

			if (isIosDevice() && !targetUrl) {
				window.location.replace(BEAMIO_IOS_STORE_URL)
				return
			}

			setPhase('checking')
			const result = await attemptOpenNativeBeamioApp(location.search)
			if (cancelled) return

			if (result === 'opened') return
			setPhase('install')
		}

		void run()
		return () => {
			cancelled = true
		}
	}, [location.search, redirectingToInnerTarget, targetUrl])

	const storeUrl = isIosDevice()
		? BEAMIO_IOS_STORE_URL
		: isAndroidDevice()
			? BEAMIO_ANDROID_STORE_URL
			: BEAMIO_ANDROID_STORE_URL

	const couponPreview =
		shareMeta && shareUrl ? <CouponSharePreview meta={shareMeta} shareUrl={shareUrl} /> : null

	return (
		<div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 selection:bg-[#1562f0]/20 antialiased">
			<nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 shadow-sm backdrop-blur-md">
				<div className="mx-auto flex h-16 max-w-7xl items-center px-6">
					<Link to="/home" className="flex items-center gap-2.5">
						<BeamioBrandLogo className="h-8 w-8 rounded-lg object-cover shadow-sm" />
						<span className="text-xl font-bold tracking-tight text-slate-900">Beamio</span>
					</Link>
				</div>
			</nav>

			<main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-lg flex-col items-center justify-center px-6 py-16 text-center">
				{phase === 'checking' && (
					<div className="space-y-6">
						{couponPreview}
						<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1562f0]/10">
							<Loader2 className="h-8 w-8 animate-spin text-[#1562f0]" />
						</div>
						<div>
							<h1 className="text-2xl font-bold tracking-tight text-slate-900">
								{shareMeta ? 'Opening Beamio Coupon' : 'Opening Beamio'}
							</h1>
							<p className="mt-3 text-slate-600">Checking for the Beamio app on your device…</p>
						</div>
					</div>
				)}

				{phase === 'install' && (
					<div className="space-y-8">
						{couponPreview}
						<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg">
							<Download className="h-8 w-8" />
						</div>
						<div>
							<h1 className="text-3xl font-black tracking-tight text-slate-900">
								{shareMeta ? 'Claim in Beamio' : 'Install Beamio'}
							</h1>
							<p className="mt-4 text-lg leading-relaxed text-slate-600">
								{shareMeta
									? 'Install the Beamio app on this device, then open this link again to claim your coupon.'
									: 'The Beamio app is not installed on this device. Download it from your app store to manage balances, programs, and tap-to-pay features.'}
							</p>
						</div>

						<div className="mx-auto w-full max-w-xs space-y-3">
							{isAndroidDevice() && (
								<a
									href={BEAMIO_ANDROID_STORE_URL}
									target="_blank"
									rel="noopener noreferrer"
									className="flex justify-center transition-opacity hover:opacity-80"
								>
									<img
										src="/google-play-badge.png"
										alt="Get it on Google Play"
										className="h-12 w-auto max-w-full"
									/>
								</a>
							)}
							<a
								href={storeUrl}
								className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1562f0] px-6 py-3.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-[#1250c4]"
							>
								<Download className="h-4 w-4" />
								Open app store
							</a>
						</div>
					</div>
				)}

				{phase === 'desktop' && (
					<div className="space-y-8">
						{couponPreview}
						{!shareMeta && (
							<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 text-purple-700">
								<Smartphone className="h-8 w-8" />
							</div>
						)}
						<div>
							<h1 className="text-3xl font-black tracking-tight text-slate-900">
								{shareMeta ? 'Claim on your phone' : 'Get Beamio on mobile'}
							</h1>
							<p className="mt-4 text-lg leading-relaxed text-slate-600">
								{shareMeta
									? 'Scan the QR on the coupon card or open this link on your phone to claim in Beamio.'
									: 'Open this page on your phone to launch the Beamio app, or install it from the stores below.'}
							</p>
						</div>

						<div className="mx-auto w-full max-w-xs space-y-3">
							<a
								href={BEAMIO_IOS_STORE_URL}
								target="_blank"
								rel="noopener noreferrer"
								className="flex justify-center transition-opacity hover:opacity-80"
							>
								<img
									src="/app-store-badge.png"
									alt="Download Beamio on the App Store"
									className="h-12 w-auto max-w-full"
								/>
							</a>
							<a
								href={BEAMIO_ANDROID_STORE_URL}
								target="_blank"
								rel="noopener noreferrer"
								className="flex justify-center transition-opacity hover:opacity-80"
							>
								<img
									src="/google-play-badge.png"
									alt="Get Beamio on Google Play"
									className="h-12 w-auto max-w-full"
								/>
							</a>
						</div>
					</div>
				)}
			</main>
		</div>
	)
}
