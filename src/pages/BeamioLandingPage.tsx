import React, { useEffect } from 'react'
import { ArrowUpRight, CreditCard, Store, Wallet } from 'lucide-react'
import BeamioBrandLogo from '../components/BeamioBrandLogo'

function ExternalLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
	return <a href={href} target="_blank" rel="noopener noreferrer" className={className}>{children}</a>
}

export default function BeamioLandingPage() {
	useEffect(() => {
		document.title = 'Beamio | Commerce applications on CoNET'
	}, [])

	return (
		<div className="min-h-screen bg-[#f8fafc] text-slate-900">
			<header className="border-b border-slate-200 bg-white">
				<div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
					<div className="flex items-center gap-2.5"><BeamioBrandLogo className="h-9 w-9 rounded-xl object-cover shadow-sm" /><span className="text-lg font-bold tracking-tight">Beamio</span></div>
					<ExternalLink href="https://conet.network/" className="text-sm font-semibold text-slate-600 hover:text-slate-950">About CoNET</ExternalLink>
				</div>
			</header>
			<main>
				<section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
					<p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Beamio application ecosystem</p>
					<h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-[1.05] tracking-[-0.045em] sm:text-6xl">Commerce and wallet experiences built with CoNET.</h1>
					<p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">Access consumer wallet, merchant operating surfaces, and POS flows. CoNET provides the underlying infrastructure; Beamio is an application ecosystem built on it.</p>
					<div className="mt-9 flex flex-wrap gap-3">
						<ExternalLink href="https://beamio.app/app/" className="inline-flex items-center gap-2 rounded-full bg-[#0051d1] px-5 py-3 text-sm font-bold text-white hover:bg-blue-800">Open the app <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></ExternalLink>
						<ExternalLink href="https://biz.beamio.app/" className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold hover:border-slate-500">Merchant OS <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></ExternalLink>
					</div>
				</section>
				<section className="border-y border-slate-200 bg-white px-4 py-16 sm:px-6 lg:px-8">
					<div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
						{[
							[Wallet, 'Consumer app', 'Manage a Beamio wallet and application experiences.'],
							[Store, 'Merchant OS', 'Configure programs and manage merchant operations.'],
							[CreditCard, 'POS', 'Run merchant terminal workflows with the POS PWA.'],
						].map(([Icon, title, copy]) => {
							const CardIcon = Icon as typeof Wallet
							return <article key={title as string} className="rounded-3xl bg-slate-50 p-6"><CardIcon className="h-6 w-6 text-[#0051d1]" aria-hidden="true" /><h2 className="mt-5 text-xl font-semibold">{title as string}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{copy as string}</p></article>
						})}
					</div>
				</section>
			</main>
			<footer className="px-4 py-8 text-center text-sm text-slate-500"><ExternalLink href="https://conet.network/web3/" className="hover:text-slate-900">Explore CoNET and web3://</ExternalLink></footer>
		</div>
	)
}
