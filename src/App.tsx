//		APP.tsx

import React, { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom"

const BeamioProtocolPage = lazy(() => import('./pages/BeamioProtocolPage'))
const HomeExample = lazy(() => import('./pages/homeExample'))
const TermsPage = lazy(() => import('./TermsPage'))
const PrivacyPage = lazy(() => import('./PrivacyPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const AppDownloadPage = lazy(() => import('./pages/AppDownloadPage'))

function RouteLoading() {
	return (
		<div className="fixed inset-0 z-[2147483647] flex min-h-dvh items-center justify-center bg-[#f9f9fe] px-6 text-center text-[#1a1c1f]">
			<div className="flex flex-col items-center gap-4">
				<img
					src={`${process.env.PUBLIC_URL}/logo192.png`}
					alt="Beamio"
					width={76}
					height={76}
					className="h-[76px] w-[76px] rounded-3xl object-contain shadow-[0_22px_54px_rgba(37,99,235,0.32)]"
				/>
				<div className="text-[22px] font-extrabold leading-none tracking-[-0.03em]">Beamio</div>
				<div className="text-[13px] font-semibold text-slate-500">Loading...</div>
				<div className="h-[30px] w-[30px] animate-spin rounded-full border-[3px] border-blue-600/20 border-t-blue-600" />
			</div>
		</div>
	)
}

function useForceLightMode() {
	useEffect(() => {
		const root = document.documentElement
		const forceLightMode = () => {
			if (root.classList.contains('dark')) root.classList.remove('dark')
			if (!root.classList.contains('light')) root.classList.add('light')
			if (root.style.colorScheme !== 'light') root.style.colorScheme = 'light'
		}

		forceLightMode()
		const observer = new MutationObserver(forceLightMode)
		observer.observe(root, { attributes: true, attributeFilter: ['class'] })
		return () => observer.disconnect()
	}, [])
}

const App: React.FC = () => {
	useForceLightMode()

	return (
		<BrowserRouter>
			<Suspense fallback={<RouteLoading />}>
				<Routes>
					<Route path="/" element={<BeamioProtocolPage />} />
					<Route path="/home" element={<BeamioProtocolPage />} />
					<Route path="/homeExample" element={<HomeExample />} />
					<Route path="/app-download" element={<AppDownloadPage />} />
					<Route path="/contact" element={<ContactPage />} />
					<Route path="/terms" element={<TermsPage />} />
					<Route path="/privacy" element={<PrivacyPage />} />
				</Routes>
			</Suspense>
		</BrowserRouter>
	)
}

export default App