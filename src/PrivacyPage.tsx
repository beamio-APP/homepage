import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import BeamioBrandLogo from './components/BeamioBrandLogo'
import { ConetSiteShell } from './components/ConetSiteShell'
import { getMarketingSite } from './utils/siteIdentity'

const updated = 'September 27, 2026'

function BeamioPrivacyPolicy() {
	return (
		<div className="min-h-screen bg-[#f5f5f2] text-[#171717]">
			<header className="border-b border-black/10 bg-white">
				<div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
					<Link to="/" className="flex items-center gap-2.5"><BeamioBrandLogo className="h-9 w-9 rounded-full object-cover" /><span className="font-bold">Beamio</span></Link>
					<Link to="/" className="text-sm font-semibold text-[#2f73e0]">Back to home</Link>
				</div>
			</header>
			<main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:py-24">
				<p className="text-xs font-black uppercase tracking-[0.2em] text-[#2f73e0]">Legal and data transparency</p>
				<h1 className="mt-3 text-4xl font-black tracking-[-0.04em] sm:text-5xl">Beamio Privacy Policy</h1>
				<p className="mt-4 text-sm text-black/45">Last updated: {updated}</p>
				<div className="mt-10 space-y-8 text-sm leading-7 text-black/65">
					<section><h2 className="text-xl font-bold text-black">1. Scope</h2><p className="mt-3">This policy covers beamio.app and Beamio-operated consumer, merchant, POS, program, relay, and support services. Stripe, Base, CoNET, wallet providers, app stores, merchants, independent infrastructure operators, and linked services may process information under their own policies and roles.</p></section>
					<section><h2 className="text-xl font-bold text-black">2. Information processed</h2><p className="mt-3">Depending on the feature, Beamio may process wallet addresses, signatures and transaction identifiers; merchant, staff, terminal, membership, coupon, reward, referral, catalog, support, and program records; payment status and connected-account identifiers; and technical data such as IP address, device or browser information, timestamps, request size, security events, and error logs. Public-chain activity is visible by design and may be linked to other information.</p></section>
					<section><h2 className="text-xl font-bold text-black">3. Keys, card data, and custody</h2><p className="mt-3">Supported clients are designed not to transmit wallet private keys or seed phrases to Beamio. Users authorize supported actions locally. Card credentials are handled by Stripe for Stripe-powered flows; Beamio receives the payment and account information needed to coordinate the requested merchant-program action. This does not mean Beamio processes no personal data or that every flow has the same custody boundary.</p></section>
					<section><h2 className="text-xl font-bold text-black">4. Purposes</h2><p className="mt-3">Information may be used to provide accounts and programs, verify authorizations, route and sponsor transactions, coordinate payments and fulfillment, operate rewards and referrals, prevent abuse and fraud, secure and debug services, answer support requests, comply with law, and produce aggregated service measurements.</p></section>
					<section><h2 className="text-xl font-bold text-black">5. Relationship minimization</h2><p className="mt-3">Beamio aims to avoid unnecessary centralized relationship profiling and to minimize data by purpose. This is not a “zero metadata,” “no logs,” anonymous, or untraceable-service claim. Beamio necessarily operates application infrastructure and program records, while networks, processors, merchants, destinations, and public chains retain their own visibility.</p></section>
					<section><h2 className="text-xl font-bold text-black">6. Sharing and service providers</h2><p className="mt-3">Information may be shared with the merchant or customer involved in a requested program action; with Stripe and other disclosed payment providers; with hosting, security, messaging, analytics, support, and infrastructure providers; with wallet, chain, and contract systems needed to complete the action; and with authorities when valid law requires it. Beamio does not sell personal information as an unrelated data-broker product.</p></section>
					<section><h2 className="text-xl font-bold text-black">7. Retention and legal preservation</h2><p className="mt-3">Operational data is retained only for documented service, security, accounting, dispute, program, or legal purposes. Periods vary by record type and applicable merchant or processor obligations. A valid preservation duty may temporarily override routine deletion for data already in possession or control; it does not authorize creating new surveillance data.</p></section>
					<section><h2 className="text-xl font-bold text-black">8. Security and user choices</h2><p className="mt-3">Beamio applies safeguards appropriate to the data and service, but no system is completely secure. Protect wallet and device credentials, verify every signing request, and never send a private key or seed phrase. Applicable law may provide access, correction, deletion, objection, or complaint rights, subject to public-chain immutability and legal exceptions.</p></section>
					<section><h2 className="text-xl font-bold text-black">9. Children, international processing, and changes</h2><p className="mt-3">Beamio is not directed to children below the applicable minimum age. Information may be processed in other jurisdictions with safeguards required by applicable law. Material policy changes will be posted with a revised date.</p></section>
					<section><h2 className="text-xl font-bold text-black">10. Contact</h2><p className="mt-3">For privacy or data-rights questions, email <a className="font-semibold text-[#2f73e0] hover:underline" href="mailto:contact@conet.network">contact@conet.network</a>.</p></section>
				</div>
			</main>
		</div>
	)
}

function ConetPrivacyPolicy() {
	return (
		<ConetSiteShell>
			<main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:py-24">
				<p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">Legal</p>
				<h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">CoNET Privacy Policy</h1>
				<p className="mt-4 text-sm text-slate-500">Last updated: {updated}</p>
				<div className="mt-10 space-y-8 text-sm leading-7 text-slate-300">
					<section><h2 className="text-xl font-semibold text-white">1. This website</h2><p className="mt-3">This policy covers conet.network and information voluntarily provided through its public contact paths. It does not govern independent applications, wallets, node operators, or third-party websites linked from this site.</p></section>
					<section><h2 className="text-xl font-semibold text-white">2. Information we may receive</h2><p className="mt-3">We may receive information you provide in an email or contact message, along with technical information needed to serve and secure the site, such as request time, browser type, IP address, and error or security events.</p></section>
					<section><h2 className="text-xl font-semibold text-white">3. Data-minimization boundary</h2><p className="mt-3">CoNET aims not to build a centralized relationship graph. This is not a zero-metadata or anonymity guarantee. Entry, mailbox, egress, chain, payment, and application roles may each process information needed for their functions, and independent operators may have different lawful practices.</p></section>
					<section><h2 className="text-xl font-semibold text-white">4. Wallet and protocol data</h2><p className="mt-3">Public blockchain activity and wallet addresses can be visible and correlated by design. Different role names do not prove operator independence, and colluding roles or global observation can reduce expected privacy.</p></section>
					<section><h2 className="text-xl font-semibold text-white">5. Retention and legal process</h2><p className="mt-3">Routine information should be purpose-limited and retained only as necessary. Valid legal preservation may apply to information already in possession or control; it is not authority to proactively inspect private communications.</p></section>
					<section><h2 className="text-xl font-semibold text-white">6. Contact</h2><p className="mt-3">For privacy questions, email <a className="font-semibold text-cyan-300 hover:underline" href="mailto:contact@conet.network">contact@conet.network</a>.</p></section>
				</div>
			</main>
		</ConetSiteShell>
	)
}

export default function PrivacyPage() {
	const beamio = getMarketingSite() === 'beamio'
	useEffect(() => { document.title = `Privacy Policy | ${beamio ? 'Beamio' : 'CoNET'}` }, [beamio])
	return beamio ? <BeamioPrivacyPolicy /> : <ConetPrivacyPolicy />
}
