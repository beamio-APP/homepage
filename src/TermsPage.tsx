import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import BeamioBrandLogo from './components/BeamioBrandLogo'
import { ConetSiteShell, ExternalLink } from './components/ConetSiteShell'
import { getMarketingSite } from './utils/siteIdentity'

const updated = 'September 27, 2026'

function BeamioTerms() {
	return (
		<div className="min-h-screen bg-[#f5f5f2] text-[#171717]">
			<header className="border-b border-black/10 bg-white">
				<div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
					<Link to="/" className="flex items-center gap-2.5"><BeamioBrandLogo className="h-9 w-9 rounded-full object-cover" /><span className="font-bold">Beamio</span></Link>
					<Link to="/" className="text-sm font-semibold text-[#2f73e0]">Back to home</Link>
				</div>
			</header>
			<main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:py-24">
				<p className="text-xs font-black uppercase tracking-[0.2em] text-[#2f73e0]">Legal</p>
				<h1 className="mt-3 text-4xl font-black tracking-[-0.04em] sm:text-5xl">Beamio Terms of Use</h1>
				<p className="mt-4 text-sm text-black/45">Last updated: {updated}</p>
				<div className="mt-10 space-y-8 text-sm leading-7 text-black/65">
					<section><h2 className="text-xl font-bold text-black">1. Scope and acceptance</h2><p className="mt-3">These terms apply to beamio.app and Beamio-operated consumer, merchant, POS, program, relay, and support services. Additional merchant, payment-processor, wallet, app-store, chain, contract, or regional terms may apply to a specific flow.</p></section>
					<section><h2 className="text-xl font-bold text-black">2. Service role</h2><p className="mt-3">Beamio provides applications, APIs, program records, authorization checks, transaction routing, gas sponsorship, and merchant tooling. “Direct” describes the intended ownership and authorization boundary. It does not mean zero intermediaries, zero metadata, or that Beamio has no operational or legal responsibilities.</p></section>
					<section><h2 className="text-xl font-bold text-black">3. Wallets and authorization</h2><p className="mt-3">You are responsible for securing your device, wallet, recovery material, and signing authority and for reviewing each request before approval. Supported clients are designed not to request or transmit private keys or seed phrases to Beamio. Beamio cannot reverse immutable transactions or recover credentials it does not control.</p></section>
					<section><h2 className="text-xl font-bold text-black">4. Merchant programs and assets</h2><p className="mt-3">Store Credit, Reward PT, memberships, coupons, tickets, and other assets are governed by their issuing merchant, contracts, disclosures, eligibility rules, expiry, refund terms, and applicable law. Cross-store use exists only where a program expressly supports it. Displayed balances or labels are not bank deposits or guaranteed investment value.</p></section>
					<section><h2 className="text-xl font-bold text-black">5. Payments and third parties</h2><p className="mt-3">Stripe-powered flows use Stripe and the merchant&apos;s connected account. On-chain flows use disclosed networks, contracts, relays, RPC services, wallets, and other infrastructure. Availability, fees, settlement time, reversibility, refunds, and dispute rights vary by payment method and provider.</p></section>
					<section><h2 className="text-xl font-bold text-black">6. Fees, sponsorship, and availability</h2><p className="mt-3">Gas sponsorship, promotions, rewards, referral incentives, fees, limits, and supported regions may change and can be unavailable, rate-limited, or denied for security, compliance, capacity, or program reasons. Marketing examples are not guarantees of revenue, savings, uptime, performance, or return.</p></section>
					<section><h2 className="text-xl font-bold text-black">7. Acceptable use</h2><p className="mt-3">Do not use Beamio for unlawful activity, fraud, sanctions evasion, deceptive promotions, infringement, malware, spam, unauthorized access, abuse, or interference. Merchants are responsible for their goods, services, program terms, customer communications, taxes, refunds, and legally required disclosures.</p></section>
					<section><h2 className="text-xl font-bold text-black">8. Privacy and legal process</h2><p className="mt-3">Use is subject to the Beamio Privacy Policy. Beamio may preserve or disclose information when required by valid law and may act on abuse, security, fraud, or legal reports. Privacy-oriented design is not an anonymity or immunity guarantee.</p></section>
					<section><h2 className="text-xl font-bold text-black">9. Risk, disclaimers, and changes</h2><p className="mt-3">Digital assets, smart contracts, wallets, devices, networks, third-party services, and beta features involve technical, financial, and operational risk. Services are provided “as is” and “as available” to the extent permitted by law. Features and these terms may change; material revisions will carry a new date.</p></section>
					<section><h2 className="text-xl font-bold text-black">10. Contact</h2><p className="mt-3">Questions can be sent to <a className="font-semibold text-[#2f73e0] hover:underline" href="mailto:contact@conet.network">contact@conet.network</a>.</p></section>
				</div>
			</main>
		</div>
	)
}

function ConetTerms() {
	return (
		<ConetSiteShell>
			<main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:py-24">
				<p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">Legal</p>
				<h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">CoNET Terms of Use</h1>
				<p className="mt-4 text-sm text-slate-500">Last updated: {updated}</p>
				<div className="mt-10 space-y-8 text-sm leading-7 text-slate-300">
					<section><h2 className="text-xl font-semibold text-white">1. Scope</h2><p className="mt-3">These terms apply to this informational website and its public documentation links. They do not replace the terms, policies, or legal responsibilities of an application or independent operator.</p></section>
					<section><h2 className="text-xl font-semibold text-white">2. Status and target architecture</h2><p className="mt-3">Protocol status labels, examples, and roadmaps are not commitments. Permissionless resource admission is a target architecture; current Guardian admission, route registration, and some aggregation remain controlled or coordinated.</p></section>
					<section><h2 className="text-xl font-semibold text-white">3. Network and wallet risk</h2><p className="mt-3">Encryption and role separation reduce information available to an ordinary relay but do not eliminate IP, timing, volume, wallet, payment, chain, or endpoint metadata. Verify addresses, requests, signatures, software, and operator assumptions.</p></section>
					<section><h2 className="text-xl font-semibold text-white">4. No advice or warranty</h2><p className="mt-3">Nothing on this site is financial, investment, legal, or security advice. Materials are provided “as is” and “as available” without promises of uptime, audit status, anonymity, operator independence, or suitability.</p></section>
					<section><h2 className="text-xl font-semibold text-white">5. Contact</h2><p className="mt-3">Questions can be sent to <a className="font-semibold text-cyan-300 hover:underline" href="mailto:contact@conet.network">contact@conet.network</a>. Protocol details are maintained in the <ExternalLink href="https://gitbook.conet.network/" className="font-semibold text-cyan-300 hover:underline">CoNET GitBook</ExternalLink>.</p></section>
				</div>
			</main>
		</ConetSiteShell>
	)
}

export default function TermsPage() {
	const beamio = getMarketingSite() === 'beamio'
	useEffect(() => { document.title = `Terms of Use | ${beamio ? 'Beamio' : 'CoNET'}` }, [beamio])
	return beamio ? <BeamioTerms /> : <ConetTerms />
}
