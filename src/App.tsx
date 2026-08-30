//		APP.tsx

import React, { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Link, Routes, Route } from "react-router-dom"
import AppDownloadPage from './pages/AppDownloadPage'
import UsdcTopupPage from './pages/UsdcTopupPage'
import {
	CONET_NETWORK_ICON_DARK_OFFICIAL,
	CONET_NETWORK_ICON_DARK_SRC,
} from './components/ConetBrandMark'
import { getMarketingSite } from './utils/siteIdentity'

const BeamioProtocolPage = lazy(() => import('./pages/BeamioProtocolPage'))
const BeamioLandingPage = lazy(() => import('./pages/BeamioLandingPage'))
const HomeExample = lazy(() => import('./pages/homeExample'))
const Web3ProtocolPage = lazy(() => import('./pages/Web3ProtocolPage'))
const TermsPage = lazy(() => import('./TermsPage'))
const PrivacyPage = lazy(() => import('./PrivacyPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))



function RouteLoading() {
	const conet = getMarketingSite() === 'conet'
	return (
		<div className={conet
			? 'fixed inset-0 z-[2147483647] flex min-h-dvh items-center justify-center bg-[#071126] px-6 text-center text-white'
			: 'fixed inset-0 z-[2147483647] flex min-h-dvh items-center justify-center bg-[#f9f9fe] px-6 text-center text-[#1a1c1f]'}
		>
			<div className="flex flex-col items-center gap-4">
				{conet ? (
					<img
						src={CONET_NETWORK_ICON_DARK_OFFICIAL}
						alt=""
						width={76}
						height={76}
						className="h-[76px] w-[76px] object-contain"
						onError={(event) => {
							const img = event.currentTarget
							if (img.src.endsWith(CONET_NETWORK_ICON_DARK_SRC)) return
							img.src = CONET_NETWORK_ICON_DARK_SRC
						}}
					/>
				) : (
					<div className="grid h-[76px] w-[76px] place-items-center rounded-3xl bg-[#071126] text-2xl font-black text-white shadow-[0_22px_54px_rgba(37,99,235,0.32)]">
						B
					</div>
				)}
				<div className="text-[22px] font-extrabold leading-none tracking-[-0.03em]">{conet ? 'CoNET' : 'Beamio'}</div>
				<div className={conet ? 'text-[13px] font-semibold text-white/55' : 'text-[13px] font-semibold text-slate-500'}>Loading...</div>
				<div className={conet
					? 'h-[30px] w-[30px] animate-spin rounded-full border-[3px] border-cyan-300/20 border-t-cyan-300'
					: 'h-[30px] w-[30px] animate-spin rounded-full border-[3px] border-blue-600/20 border-t-blue-600'}
				/>
			</div>
		</div>
	)
}

function useMarketingColorMode() {
	useEffect(() => {
		const root = document.documentElement
		const applyColorMode = () => {
			const conet = getMarketingSite() === 'conet'
			root.classList.toggle('dark', conet)
			root.classList.toggle('light', !conet)
			root.classList.toggle('conet-site', conet)
			root.style.colorScheme = conet ? 'dark' : 'light'
		}

		applyColorMode()
		const observer = new MutationObserver(applyColorMode)
		observer.observe(root, { attributes: true, attributeFilter: ['class'] })
		return () => observer.disconnect()
	}, [])
}

function MarketingHome() {
	return getMarketingSite() === 'conet' ? <BeamioProtocolPage /> : <BeamioLandingPage />
}

function NotFound() {
	return (
		<div className="grid min-h-screen place-items-center bg-[#f7f9fc] px-6 text-center text-slate-900">
			<div>
				<p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-700">404</p>
				<h1 className="mt-3 text-3xl font-semibold tracking-tight">Page not found</h1>
				<Link to="/" className="mt-6 inline-flex rounded-full bg-[#071126] px-5 py-3 text-sm font-semibold text-white">Return home</Link>
			</div>
		</div>
	)
}

function useMarketingMetadata() {
	useEffect(() => {
		const conet = getMarketingSite() === 'conet'
		const description = conet
			? 'CoNET combines a live EVM-compatible L1 with wallet-addressed encrypted transport research, while CoNET-DLE is specified on the same DePIN gossip foundation.'
			: 'Beamio provides consumer, merchant, and POS application experiences built with CoNET infrastructure.'
		const descriptionTag = document.querySelector('meta[name="description"]')
		const ogTitle = document.querySelector('meta[property="og:title"]')
		const ogDescription = document.querySelector('meta[property="og:description"]')
		const ogUrl = document.querySelector('meta[property="og:url"]')

		document.title = conet ? 'CoNET | Wallet-addressed infrastructure' : 'Beamio | Commerce applications on CoNET'
		descriptionTag?.setAttribute('content', description)
		ogTitle?.setAttribute('content', conet ? 'CoNET | Wallet-addressed infrastructure' : 'Beamio | Commerce applications on CoNET')
		ogDescription?.setAttribute('content', description)
		ogUrl?.setAttribute('content', conet ? 'https://conet.network/' : 'https://beamio.app/')
	}, [])
}

const App: React.FC = () => {
	useMarketingColorMode()
	useMarketingMetadata()

	useEffect(() => {
		document.getElementById('boot-loading')?.remove()
	}, [])

	return (
		<BrowserRouter>
			<Suspense fallback={<RouteLoading />}>
				<Routes>
					<Route path="/" element={<MarketingHome />} />
					<Route path="/home" element={<MarketingHome />} />
					<Route path="/web3" element={<Web3ProtocolPage />} />
					<Route path="/homeExample" element={<HomeExample />} />
					<Route path="/app-download" element={<AppDownloadPage />} />
					<Route path="/contact" element={<ContactPage />} />
					<Route path="/terms" element={<TermsPage />} />
					<Route path="/privacy" element={<PrivacyPage />} />
					<Route path="/usdc-topup" element={<UsdcTopupPage />} />
					<Route path="*" element={<NotFound />} />
				</Routes>
			</Suspense>
		</BrowserRouter>
	)
}

export default App