import React, { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowLeft, Download, Loader2, Smartphone } from 'lucide-react'
import BeamioBrandLogo from '../components/BeamioBrandLogo'
import {
	attemptOpenNativeBeamioApp,
	BEAMIO_ANDROID_STORE_URL,
	BEAMIO_IOS_STORE_URL,
	isAndroidDevice,
	isIosDevice,
	isMobileDevice,
} from '../utils/nativeAppDownload'

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

export default function AppDownloadPage() {
	const location = useLocation()
	const targetUrl = useMemo(() => resolveBeamioAppTarget(location.search), [location.search])
	const [phase, setPhase] = useState<PagePhase>(() => (isMobileDevice() ? 'checking' : 'desktop'))

	useEffect(() => {
		document.title = 'Get Beamio App'
	}, [])

	useEffect(() => {
		let cancelled = false

		async function run() {
			if (!isMobileDevice()) {
				setPhase('desktop')
				return
			}

			if (isIosDevice() && targetUrl && isIosEmbeddedWebView()) {
				window.location.replace(targetUrl)
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
	}, [location.search, targetUrl])

	const storeUrl = isIosDevice()
		? BEAMIO_IOS_STORE_URL
		: isAndroidDevice()
			? BEAMIO_ANDROID_STORE_URL
			: BEAMIO_ANDROID_STORE_URL

	return (
		<div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 selection:bg-[#1562f0]/20 antialiased">
			<nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 shadow-sm backdrop-blur-md">
				<div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
					<div className="flex items-center gap-6">
						<Link
							to="/home"
							className="flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-slate-900"
						>
							<ArrowLeft className="h-4 w-4" />
							<span className="hidden sm:inline">Back to Protocol</span>
						</Link>
						<div className="hidden h-6 w-px bg-slate-200 sm:block" />
						<Link to="/home" className="flex items-center gap-2.5">
							<BeamioBrandLogo className="h-8 w-8 rounded-lg object-cover shadow-sm" />
							<span className="text-xl font-bold tracking-tight text-slate-900">Beamio</span>
						</Link>
					</div>
				</div>
			</nav>

			<main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-lg flex-col items-center justify-center px-6 py-16 text-center">
				{phase === 'checking' && (
					<div className="space-y-6">
						<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1562f0]/10">
							<Loader2 className="h-8 w-8 animate-spin text-[#1562f0]" />
						</div>
						<div>
							<h1 className="text-2xl font-bold tracking-tight text-slate-900">Opening Beamio</h1>
							<p className="mt-3 text-slate-600">Checking for the Beamio app on your device…</p>
						</div>
					</div>
				)}

				{phase === 'install' && (
					<div className="space-y-8">
						<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg">
							<Download className="h-8 w-8" />
						</div>
						<div>
							<h1 className="text-3xl font-black tracking-tight text-slate-900">Install Beamio</h1>
							<p className="mt-4 text-lg leading-relaxed text-slate-600">
								The Beamio app is not installed on this device. Download it from your app store to
								manage balances, programs, and tap-to-pay features.
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
						<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 text-purple-700">
							<Smartphone className="h-8 w-8" />
						</div>
						<div>
							<h1 className="text-3xl font-black tracking-tight text-slate-900">Get Beamio on mobile</h1>
							<p className="mt-4 text-lg leading-relaxed text-slate-600">
								Open this page on your phone to launch the Beamio app, or install it from the stores
								below.
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
