import React, { useEffect } from 'react'
import { ConetSiteShell } from './components/ConetSiteShell'

export default function PrivacyPage() {
	useEffect(() => { document.title = 'Privacy Policy | CoNET' }, [])
	return (
		<ConetSiteShell>
			<main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:py-24">
				<p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">Legal</p>
				<h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">CoNET Privacy Policy</h1>
				<p className="mt-4 text-sm text-slate-500">Last updated: August 28, 2026</p>
				<div className="mt-10 space-y-8 text-sm leading-7 text-slate-300">
					<section><h2 className="text-xl font-semibold text-white">1. This website</h2><p className="mt-3">This policy covers conet.network and information voluntarily provided through its public contact paths. It does not govern independent applications, wallets, node operators, or third-party websites linked from this site.</p></section>
					<section><h2 className="text-xl font-semibold text-white">2. Information we may receive</h2><p className="mt-3">We may receive information you provide in an email or contact message, along with basic technical information that web infrastructure commonly processes to serve and secure a site, such as request time, browser type, and IP address.</p></section>
					<section><h2 className="text-xl font-semibold text-white">3. How it is used</h2><p className="mt-3">Information may be used to respond to enquiries, maintain site security, diagnose technical issues, and improve documentation. Do not submit private keys, seed phrases, passwords, or other signing material.</p></section>
					<section><h2 className="text-xl font-semibold text-white">4. Wallet and protocol data</h2><p className="mt-3">Public blockchain activity and wallet addresses can be visible to network participants and explorers by design. This website does not change that property. Always review the privacy model of the application or protocol you use.</p></section>
					<section><h2 className="text-xl font-semibold text-white">5. Third parties and updates</h2><p className="mt-3">Third-party links operate under their own policies. We may update this policy as the site changes; the date above identifies the latest website-policy revision.</p></section>
					<section><h2 className="text-xl font-semibold text-white">6. Contact</h2><p className="mt-3">For privacy questions, email <a className="font-semibold text-cyan-300 hover:underline" href="mailto:contact@conet.network">contact@conet.network</a>.</p></section>
				</div>
			</main>
		</ConetSiteShell>
	)
}
