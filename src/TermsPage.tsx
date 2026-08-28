import React, { useEffect } from 'react'
import { ConetSiteShell, ExternalLink } from './components/ConetSiteShell'

export default function TermsPage() {
	useEffect(() => { document.title = 'Terms of Use | CoNET' }, [])
	return (
		<ConetSiteShell>
			<main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:py-24">
				<p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">Legal</p>
				<h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">CoNET Terms of Use</h1>
				<p className="mt-4 text-sm text-slate-500">Last updated: August 28, 2026</p>
				<div className="mt-10 space-y-8 text-sm leading-7 text-slate-300">
					<section><h2 className="text-xl font-semibold text-white">1. Scope</h2><p className="mt-3">These terms apply to this informational website and its public documentation links. They do not replace the terms, policies, or protocol requirements of an application that you choose to use.</p></section>
					<section><h2 className="text-xl font-semibold text-white">2. Informational materials</h2><p className="mt-3">Technical materials are provided for general information. Protocol status labels, examples, and roadmaps are not a commitment to deliver a feature, operate an endpoint, or maintain a particular level of availability.</p></section>
					<section><h2 className="text-xl font-semibold text-white">3. Network and wallet risk</h2><p className="mt-3">Interactions with wallets, digital assets, node software, and decentralized networks involve technical and financial risk. You are responsible for verifying addresses, requests, signatures, and software before using them. CoNET does not ask for your private key or seed phrase.</p></section>
					<section><h2 className="text-xl font-semibold text-white">4. No advice or warranty</h2><p className="mt-3">Nothing on this site is financial, investment, legal, or security advice. The site and documentation are provided on an “as is” and “as available” basis, without a promise of uninterrupted service, audit status, anonymity, or suitability for a particular purpose.</p></section>
					<section><h2 className="text-xl font-semibold text-white">5. Third-party services</h2><p className="mt-3">Links may lead to third-party websites, applications, or network services. Their content and terms are their own. Review them before providing information or signing a transaction.</p></section>
					<section><h2 className="text-xl font-semibold text-white">6. Contact</h2><p className="mt-3">Questions about these website terms can be sent to <a className="font-semibold text-cyan-300 hover:underline" href="mailto:contact@conet.network">contact@conet.network</a>. Protocol details are maintained in the <ExternalLink href="https://gitbook.conet.network/" className="font-semibold text-cyan-300 hover:underline">CoNET GitBook</ExternalLink>.</p></section>
				</div>
			</main>
		</ConetSiteShell>
	)
}
