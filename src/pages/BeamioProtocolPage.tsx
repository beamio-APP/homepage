import React, { useEffect } from 'react'
import { ArrowRight, Blocks, Bot, Braces, CircleDot, Cloud, Coins, Cpu, Database, ExternalLink, Layers3, LockKeyhole, Network, Pickaxe, RadioTower, ServerCog, ShieldCheck } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { ConetSiteShell, ExternalLink as SiteExternalLink } from '../components/ConetSiteShell'

const gitbook = 'https://gitbook.conet.network/'

const layers = [
	{
		kicker: 'L0 · CoNET DePIN',
		title: 'Decentralized cloud infrastructure',
		copy: 'The foundational resource plane for TCP/UDP forwarding, encrypted storage, SaaS hosting adapters, and contributed CPU/GPU compute. Layer Minus is the privacy protocol that composes these resources; it is not L0 itself.',
		icon: Cloud,
		status: 'Implemented capability',
	},
	{
		kicker: 'L1 · CoNET Blockchain',
		title: 'Shared settlement and state',
		copy: 'A live EVM-compatible proof-of-stake network. Its target networking direction carries geth and Prysm peer traffic through Layer Minus by wallet locator instead of requiring peers to expose public IP:port identities.',
		icon: Blocks,
		status: 'Production L1 · wallet overlay under development',
	},
	{
		kicker: 'L2 · CoNET-DLE',
		title: 'Application-led execution research',
		copy: 'A specified parallel-ledger architecture loaded on CoNET DePIN. Control-plane and data-plane gossip use wallet addresses as network identities, with OpenPGP-encrypted traffic relayed through entry and mailbox nodes.',
		icon: Layers3,
		status: 'Normative design · laboratory evidence',
	},
]

const applications = [
	{
		title: 'web3:// Application Protocol',
		copy: 'Wallet-addressed locators, caller-signed requests, encrypted correlated responses, and persistent application streams over Layer Minus.',
		to: '/web3',
		icon: Braces,
		status: 'Under development',
	},
	{
		title: 'SilentPass',
		copy: 'Wallet-authorized privacy access to ordinary Internet services, composed over Layer Minus.',
		href: 'https://gitbook.conet.network/applications/silentpass-vpn.html',
		icon: ShieldCheck,
		status: 'Public application',
	},
	{
		title: 'Beamio',
		copy: 'Consumer wallet, Merchant OS, POS, and Cash and USDC workflows built with CoNET infrastructure.',
		href: 'https://beamio.app/',
		icon: CircleDot,
		status: 'Public application',
	},
	{
		title: 'DePIN Chat',
		copy: 'Wallet-addressed messages, delivery receipts, presence, and encrypted history over Layer Minus.',
		href: 'https://gitbook.conet.network/applications/depin-chat.html',
		icon: LockKeyhole,
		status: 'Integrated capability',
	},
]

const infrastructureFlow = [
	{
		kicker: 'Foundation',
		title: 'CoNET L0 decentralized cloud',
		copy: 'Independent nodes contribute TCP/UDP forwarding, ciphertext storage, service hosting, and CPU/GPU capacity.',
		icon: Cloud,
	},
	{
		kicker: 'Privacy protocol',
		title: 'Layer Minus',
		copy: 'Layer Minus uses L0 resources for encrypted, wallet-addressed private communication without treating a public IP as the application identity.',
		icon: ShieldCheck,
	},
	{
		kicker: 'Private gossip',
		title: 'CoNET L1 + CoNET-DLE L2',
		copy: 'The same communication plane can carry privacy-routed gossip for L1 peer networking and DLE application-led mining, with each deployment clearly labeled by maturity.',
		icon: Network,
	},
	{
		kicker: 'Application server',
		title: 'web3://',
		copy: 'A wallet-addressed private-server protocol: resolve a wallet or exact tag, authenticate the caller, and reach Web, API, AI, or TCP services through Layer Minus.',
		icon: ServerCog,
	},
]

const aiSeparation = [
	{
		title: 'Model builders',
		copy: 'Build and publish models without controlling the raw-data collection plane or the user-facing agent.',
		icon: Cpu,
	},
	{
		title: 'Raw-data acquisition',
		copy: 'Independent data contributors gather and attest inputs while encrypted fragmentation limits what any single operator can reconstruct.',
		icon: Database,
	},
	{
		title: 'AI agents',
		copy: 'User-authorized agents request work, protect private context, verify outputs, and return results encrypted to the user.',
		icon: Bot,
	},
]

const tokenEconomy = [
	{
		title: '1,000,000 hard cap',
		copy: '$CNET has an absolute maximum supply of 1,000,000 tokens. The model does not permit issuance beyond that ceiling.',
		icon: Coins,
	},
	{
		title: '38.4% full-network lock',
		copy: 'At the 12,000-node network limit, validator participation requires 384,000 $CNET to remain staked—38.4% of the maximum supply.',
		icon: LockKeyhole,
	},
	{
		title: 'Automatic slashing',
		copy: 'The security model penalizes prolonged downtime, inadequate bandwidth, and malicious behavior to protect consensus and commercial settlement.',
		icon: Pickaxe,
	},
]

const nodeIssuanceStages = [
	{
		stage: 'Early network',
		nodes: '3,000 nodes',
		annual: '≈ 43.68 $CNET / node / year',
		apr: 'Modelled APR ≈ 136.5%',
	},
	{
		stage: 'Network expansion',
		nodes: '6,000–8,000 nodes',
		annual: '≈ 30.88 $CNET / node / year',
		apr: 'Modelled APR ≈ 96.5%',
	},
	{
		stage: 'Full network',
		nodes: '12,000 nodes',
		annual: '≈ 21.84 $CNET / node / year',
		apr: 'Modelled APR ≈ 68.25%',
	},
]

const valuationScenarios = [
	{
		label: 'Base case',
		value: '$735 / $CNET',
		copy: 'Assumes US$36.75M mature annual net profit and a 20× SaaS earnings multiple, producing a US$735M fully diluted valuation.',
	},
	{
		label: 'Target case',
		value: '$1,500 / $CNET',
		copy: 'Uses a US$1.5B fully diluted valuation as a comparison case for a mature DePIN privacy-infrastructure network.',
	},
	{
		label: 'Supply-shock case',
		value: 'Dynamic',
		copy: 'Models additional scarcity when the 38.4% staking lock and recurring fee burns reduce freely circulating supply.',
	},
]

export default function BeamioProtocolPage() {
	const location = useLocation()

	useEffect(() => {
		document.title = 'CoNET | Wallet-addressed infrastructure'
	}, [])

	useEffect(() => {
		const targetId = location.hash.replace(/^#/, '').replace(/\/+$/, '')
		if (!targetId) {
			window.scrollTo({ top: 0, behavior: 'auto' })
			return
		}

		const frame = window.requestAnimationFrame(() => {
			document.getElementById(targetId)?.scrollIntoView({ block: 'start', behavior: 'auto' })
		})
		return () => window.cancelAnimationFrame(frame)
	}, [location.hash])

	return (
		<ConetSiteShell>
			<main>
				<section className="relative isolate overflow-hidden bg-black px-4 pb-20 pt-20 text-white sm:px-6 sm:pb-28 sm:pt-28 lg:px-8">
					<video
						className="absolute inset-0 -z-20 h-full w-full object-cover"
						src="/bg-home.mp4"
						autoPlay
						muted
						loop
						playsInline
						preload="metadata"
						aria-hidden="true"
						tabIndex={-1}
					/>
					<div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_20%,rgba(34,211,238,0.12),transparent_32%),radial-gradient(circle_at_85%_40%,rgba(192,132,252,0.18),transparent_34%),linear-gradient(180deg,rgba(0,0,0,0.62)_0%,rgba(16,17,21,0.86)_100%)]" />
					<div className="mx-auto max-w-7xl">
						<div className="max-w-4xl">
							<p className="mb-5 inline-flex rounded-full border border-cyan-200/30 bg-cyan-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-cyan-100">
								CoNET infrastructure
							</p>
							<h1 className="max-w-4xl text-4xl font-semibold leading-[1.04] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
								Decentralized cloud infrastructure addressed by wallets.
							</h1>
							<p className="mt-7 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
								CoNET L0 is a decentralized cloud resource plane for forwarding, storage, service hosting, and compute. Layer Minus composes those resources into private communications; CoNET L1 and CoNET-DLE use that path for wallet-addressed gossip, while web3:// exposes the same foundation as private application-server technology.
							</p>
							<div className="mt-9 flex flex-wrap gap-3">
								<Link to="/web3" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-300 to-purple-400 px-5 py-3 text-sm font-bold text-slate-950 shadow-[0_0_28px_rgba(103,232,249,0.18)] transition-transform hover:-translate-y-0.5">
									Explore web3:// <ArrowRight className="h-4 w-4" aria-hidden="true" />
								</Link>
								<SiteExternalLink href={gitbook} className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10">
									Read the GitBook <ExternalLink className="h-4 w-4" aria-hidden="true" />
								</SiteExternalLink>
							</div>
						</div>
					</div>
				</section>

				<section className="border-y border-white/10 bg-[#15161d] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
					<div className="mx-auto max-w-7xl">
						<div className="max-w-3xl">
							<p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">Infrastructure to applications</p>
							<h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">L0 is the cloud. Layer Minus is the privacy protocol. web3:// is the application surface.</h2>
							<p className="mt-5 leading-7 text-slate-400">These responsibilities compose into one stack, but they are not interchangeable names.</p>
						</div>
						<div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
							{infrastructureFlow.map(({ kicker, title, copy, icon: Icon }, index) => (
								<article key={title} className="relative rounded-2xl border border-white/10 bg-[#18191f] p-6">
									<div className="flex items-center justify-between">
										<Icon className="h-7 w-7 text-cyan-300" aria-hidden="true" />
										<span className="text-xs font-bold text-slate-600">0{index + 1}</span>
									</div>
									<p className="mt-7 text-xs font-bold uppercase tracking-[0.15em] text-cyan-200">{kicker}</p>
									<h3 className="mt-2 text-xl font-semibold text-white">{title}</h3>
									<p className="mt-3 text-sm leading-6 text-slate-400">{copy}</p>
								</article>
							))}
						</div>
					</div>
				</section>

				<section id="layers" className="scroll-mt-6 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
					<div className="mx-auto max-w-7xl">
						<div className="max-w-2xl">
							<p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">The stack</p>
							<h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">Three layers, clear boundaries.</h2>
							<p className="mt-4 leading-7 text-slate-400">CoNET is not a single application. The layers can be composed, while their responsibilities and implementation evidence remain distinct.</p>
						</div>
						<div className="mt-10 grid gap-4 lg:grid-cols-3">
							{layers.map(({ kicker, title, copy, icon: Icon, status }) => (
								<article key={kicker} className="rounded-2xl border border-white/10 bg-[#18191f] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-7">
									<Icon className="h-7 w-7 text-cyan-300" aria-hidden="true" />
									<p className="mt-7 text-xs font-bold uppercase tracking-[0.15em] text-cyan-200">{kicker}</p>
									<h3 className="mt-2 text-xl font-semibold tracking-tight text-white">{title}</h3>
									<p className="mt-3 text-sm leading-6 text-slate-400">{copy}</p>
									<p className="mt-6 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">{status}</p>
								</article>
							))}
						</div>
					</div>
				</section>

				<section className="border-y border-white/10 bg-[#15161d] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
					<div className="mx-auto max-w-7xl">
						<div className="max-w-3xl">
							<p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">The network difference</p>
							<h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">Wallet identity becomes network infrastructure.</h2>
							<p className="mt-5 leading-7 text-slate-400">A conventional Ethereum-style L1 normally discovers and connects peers through exposed IP addresses and ports. CoNET keeps EVM-compatible execution and proof-of-stake consensus, while developing a different transport direction: peer streams addressed by wallet identity and carried through the encrypted Layer Minus network.</p>
						</div>
						<div className="mt-10 grid gap-4 lg:grid-cols-2">
							<article className="rounded-2xl border border-white/10 bg-[#18191f] p-6 sm:p-7">
								<Blocks className="h-7 w-7 text-cyan-300" aria-hidden="true" />
								<p className="mt-6 text-xs font-bold uppercase tracking-[0.15em] text-cyan-200">CoNET L1 direction</p>
								<h3 className="mt-2 text-xl font-semibold text-white">Consensus peers by wallet locator</h3>
								<p className="mt-3 text-sm leading-6 text-slate-400">The destination architecture transports unmodified geth and Prysm peer connections through Layer Minus, so a wallet locator—not a stable public <code>IP:port</code>—can identify the peer destination. Laboratory tests have demonstrated this path; the public production join path still uses conventional hosts today.</p>
								<SiteExternalLink href="https://gitbook.conet.network/developers/l1-node.html" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-cyan-100">Read the L1 boundary <ArrowRight className="h-4 w-4" aria-hidden="true" /></SiteExternalLink>
							</article>
							<article className="rounded-2xl border border-white/10 bg-[#18191f] p-6 sm:p-7">
								<Network className="h-7 w-7 text-purple-300" aria-hidden="true" />
								<p className="mt-6 text-xs font-bold uppercase tracking-[0.15em] text-purple-200">CoNET-DLE foundation</p>
								<h3 className="mt-2 text-xl font-semibold text-white">Wallet-addressed encrypted gossip</h3>
								<p className="mt-3 text-sm leading-6 text-slate-400">DLE is designed on top of CoNET DePIN rather than as another IP overlay. Waiting-pool announcements, task offers, block proposals, votes, and other control or data messages use EOA identities and OpenPGP end-to-end encryption through the entry/mailbox routing model.</p>
								<SiteExternalLink href="https://gitbook.conet.network/l2/" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-cyan-100">Read the DLE design boundary <ArrowRight className="h-4 w-4" aria-hidden="true" /></SiteExternalLink>
							</article>
						</div>
					</div>
				</section>

				<section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
					<div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_1.15fr] lg:items-center">
						<div>
							<p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">Application protocol</p>
							<h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">web3:// is a protocol surface, not a browser promise.</h2>
							<p className="mt-5 leading-7 text-slate-400">It defines wallet-addressed resource and streaming interactions over CoNET infrastructure. URI resolution, signed requests, and encrypted responses are specified separately from the routing substrate.</p>
							<Link to="/web3" className="mt-7 inline-flex items-center gap-2 font-semibold text-cyan-300 hover:text-cyan-100">
								Read the protocol overview <ArrowRight className="h-4 w-4" aria-hidden="true" />
							</Link>
						</div>
						<div className="rounded-2xl border border-cyan-200/10 bg-black/40 p-6 text-slate-100 shadow-[0_0_48px_rgba(103,232,249,0.08)] sm:p-8">
							<div className="flex items-center gap-3 text-cyan-200"><Braces className="h-5 w-5" aria-hidden="true" /><span className="text-sm font-semibold">URI examples</span></div>
							<code className="mt-6 block overflow-x-auto rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-cyan-100">web3://0x1234…abcd/resource</code>
							<code className="mt-3 block overflow-x-auto rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-cyan-100">web3://ExactTag.web3/inbox</code>
							<p className="mt-5 text-sm leading-6 text-slate-300">Examples illustrate locator shape only. An exact tag must resolve unambiguously; this page does not execute these URIs.</p>
						</div>
					</div>
				</section>

				<section className="border-y border-white/10 bg-[#15161d] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
					<div className="mx-auto max-w-7xl">
						<div className="max-w-3xl">
							<p className="text-xs font-bold uppercase tracking-[0.16em] text-purple-300">Future direction · decentralized AI</p>
							<h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">Three independent powers above user privacy.</h2>
							<p className="mt-5 leading-7 text-slate-400">CoNET intends to use contributed L0 GPU capacity for decentralized AI while separating model construction, raw-data acquisition, and AI-agent operation. No single role should own the model, the complete private input, and the user relationship at once.</p>
						</div>
						<div className="mt-10 grid gap-4 md:grid-cols-3">
							{aiSeparation.map(({ title, copy, icon: Icon }) => (
								<article key={title} className="rounded-2xl border border-purple-300/15 bg-[#18191f] p-6 sm:p-7">
									<Icon className="h-7 w-7 text-purple-300" aria-hidden="true" />
									<h3 className="mt-6 text-xl font-semibold text-white">{title}</h3>
									<p className="mt-3 text-sm leading-6 text-slate-400">{copy}</p>
								</article>
							))}
						</div>
						<p className="mt-6 max-w-4xl text-sm leading-6 text-slate-500">This is a future architecture direction, not a claim that a general GPU marketplace or decentralized AI product is already in production.</p>
					</div>
				</section>

				<section id="applications" className="scroll-mt-6 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
					<div className="mx-auto max-w-7xl">
						<div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
							<div className="max-w-xl">
								<p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">Application ecosystem</p>
								<h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">Built for specialized applications.</h2>
							</div>
							<SiteExternalLink href="https://gitbook.conet.network/applications/" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-cyan-100">
								All applications <ArrowRight className="h-4 w-4" aria-hidden="true" />
							</SiteExternalLink>
						</div>
						<div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
							{applications.map(({ title, copy, icon: Icon, ...destination }) => {
								const content = <>
									<Icon className="h-6 w-6 text-cyan-300" aria-hidden="true" />
									<h3 className="mt-6 text-lg font-semibold text-white">{title}</h3>
									<p className="mt-2 text-sm leading-6 text-slate-400">{copy}</p>
									{'status' in destination ? <span className="mt-5 inline-flex rounded-full border border-cyan-200/20 bg-cyan-300/10 px-2.5 py-1 text-xs font-semibold text-cyan-100">{destination.status}</span> : null}
									<span className="mt-6 flex items-center gap-1.5 text-sm font-semibold text-cyan-300">Explore <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" /></span>
								</>
								const className = 'group flex flex-col rounded-2xl border border-white/10 bg-[#18191f] p-6 transition hover:-translate-y-1 hover:border-cyan-300/40 hover:shadow-[0_0_32px_rgba(103,232,249,0.08)]'
								return 'to' in destination
									? <Link key={title} to={destination.to} className={className}>{content}</Link>
									: <SiteExternalLink key={title} href={destination.href} className={className}>{content}</SiteExternalLink>
							})}
						</div>
					</div>
				</section>

				<section id="token-economy" className="border-y border-white/10 bg-[#15161d] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
					<div className="mx-auto max-w-7xl">
						<div className="max-w-3xl">
							<p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">$CNET macro token economics</p>
							<h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">Structural scarcity and the Web4 deflation model.</h2>
							<p className="mt-5 leading-7 text-slate-400">$CNET is the native governance and resource-accounting asset across CoNET L1 consensus, the Layer Minus physical network, and CoNET application protocols. Its macro model combines a fixed supply ceiling, validator staking, algorithmically declining node output, and permanent transaction-fee burns.</p>
						</div>
						<div className="mt-10 grid gap-4 md:grid-cols-3">
							{tokenEconomy.map(({ title, copy, icon: Icon }) => (
								<article key={title} className="rounded-2xl border border-white/10 bg-[#18191f] p-6 sm:p-7">
									<Icon className="h-7 w-7 text-cyan-300" aria-hidden="true" />
									<h3 className="mt-6 text-xl font-semibold text-white">{title}</h3>
									<p className="mt-3 text-sm leading-6 text-slate-400">{copy}</p>
								</article>
							))}
						</div>

						<div className="mt-10 rounded-2xl border border-blue-300/20 bg-blue-300/[0.07] p-6 sm:p-7">
							<div className="grid gap-7 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
								<div>
									<p className="text-xs font-bold uppercase tracking-[0.15em] text-blue-200">Current Genesis node entry</p>
									<p className="mt-3 text-4xl font-semibold tracking-tight text-blue-300">$4,000 USDC</p>
									<p className="mt-2 text-sm text-slate-400">Total entry threshold per infrastructure seat</p>
								</div>
								<div className="grid gap-3 sm:grid-cols-2">
									<div className="rounded-xl border border-white/10 bg-black/20 p-5">
										<p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Infrastructure allocation</p>
										<p className="mt-2 text-xl font-semibold text-white">$3,880 USDC</p>
										<p className="mt-2 text-xs leading-5 text-slate-400">Allocated to the Genesis node infrastructure seat.</p>
									</div>
									<div className="rounded-xl border border-white/10 bg-black/20 p-5">
										<p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">First-year OPEX</p>
										<p className="mt-2 text-xl font-semibold text-white">$120 USDC</p>
										<p className="mt-2 text-xs leading-5 text-slate-400">Included in the $4,000 USDC total; paid through the current Base external-wallet flow.</p>
									</div>
								</div>
							</div>
							<p className="mt-6 border-t border-white/10 pt-5 text-xs leading-5 text-slate-500">The current purchase flow is governed by the CoNET Genesis Node Early Contributor Exemption &amp; Digital Rights Confirmation Agreement and its smart-contract settlement terms. It is an infrastructure-rights confirmation, not a transaction with a corporate issuer.</p>
						</div>

						<div className="mt-10 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
							<article className="rounded-2xl border border-purple-300/15 bg-purple-300/[0.06] p-6 sm:p-7">
								<div className="flex items-center gap-3">
									<RadioTower className="h-6 w-6 text-purple-300" aria-hidden="true" />
									<h3 className="text-xl font-semibold text-white">Square-root declining node output</h3>
								</div>
								<p className="mt-3 text-sm leading-6 text-slate-400">Aggregate protocol emission grows in proportion to the square root of total staked $CNET, so per-node output declines as participation expands. At full capacity, the model caps aggregate annual output at approximately 262,000 $CNET—still within the absolute supply ceiling.</p>
								<div className="mt-6 grid gap-3 sm:grid-cols-3">
									{nodeIssuanceStages.map(({ stage, nodes, annual, apr }) => (
										<div key={stage} className="rounded-xl border border-white/10 bg-black/20 p-4">
											<p className="text-xs font-bold uppercase tracking-[0.12em] text-purple-200">{stage}</p>
											<p className="mt-3 text-sm font-semibold text-white">{nodes}</p>
											<p className="mt-2 text-xs leading-5 text-slate-300">{annual}</p>
											<p className="mt-1 text-xs leading-5 text-slate-500">{apr}</p>
										</div>
									))}
								</div>
							</article>

							<article className="rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.05] p-6 sm:p-7">
								<ServerCog className="h-6 w-6 text-cyan-300" aria-hidden="true" />
								<h3 className="mt-5 text-xl font-semibold text-white">Community return and Treasury flow</h3>
								<ul className="mt-4 space-y-4 text-sm leading-6 text-slate-400">
									<li><strong className="text-slate-200">300 historical genesis nodes:</strong> 100 $CNET each, initially locked and modelled to unlock linearly over six months from DEX trading activation.</li>
									<li><strong className="text-slate-200">2,000 official backbone nodes:</strong> before the public allocation is fully activated, their output is modelled to return 100% to active community nodes according to active-node days.</li>
									<li><strong className="text-slate-200">At full activation:</strong> the community-return phase becomes dormant and official-node output flows to the CoNET Treasury for protocol development, compliance, and decentralized liquidity reserves.</li>
								</ul>
							</article>
						</div>

						<div className="mt-4 rounded-2xl border border-orange-300/20 bg-orange-300/[0.06] p-6 sm:p-7">
							<div className="grid gap-7 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
								<div>
									<Coins className="h-7 w-7 text-orange-300" aria-hidden="true" />
									<p className="mt-5 text-xs font-bold uppercase tracking-[0.15em] text-orange-200">Permanent burn engine</p>
									<h3 className="mt-2 text-2xl font-semibold text-white">100% of the EIP-1559 base fee is burned.</h3>
									<p className="mt-4 text-sm leading-6 text-slate-400">Every commercial state write on CoNET L1—including Beamio SaaS activity, Silent Pass privacy services, and future AI-agent micro-settlement—pays a base network fee. The base-fee portion is permanently removed from supply.</p>
								</div>
								<div className="grid gap-3 sm:grid-cols-2">
									<div className="rounded-xl border border-white/10 bg-black/20 p-5">
										<p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Deflation crossover</p>
										<p className="mt-3 text-2xl font-semibold text-white">$31.50</p>
										<p className="mt-2 text-xs leading-5 text-slate-400">At an assumed US$8.25M annual burn budget, this price burns approximately 262,000 tokens—the modelled full-network annual output.</p>
									</div>
									<div className="rounded-xl border border-white/10 bg-black/20 p-5">
										<p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">High-deflation case</p>
										<p className="mt-3 text-2xl font-semibold text-white">$15.00</p>
										<p className="mt-2 text-xs leading-5 text-slate-400">The same assumed burn budget would remove approximately 550,000 $CNET in a year, exceeding the modelled annual output.</p>
									</div>
								</div>
							</div>
						</div>

						<div className="mt-4 rounded-2xl border border-white/10 bg-[#18191f] p-6 sm:p-7">
							<p className="text-xs font-bold uppercase tracking-[0.15em] text-cyan-300">Valuation sandbox</p>
							<h3 className="mt-2 text-2xl font-semibold text-white">From mature operating profit to modelled FDV.</h3>
							<p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">These scenarios translate a US$36.75M mature annual net-profit assumption into illustrative token values against the 1,000,000-token hard cap. They are sensitivity cases, not forecasts.</p>
							<div className="mt-6 grid gap-4 md:grid-cols-3">
								{valuationScenarios.map(({ label, value, copy }) => (
									<div key={label} className="rounded-xl border border-white/10 bg-black/20 p-5">
										<p className="text-xs font-bold uppercase tracking-[0.12em] text-cyan-200">{label}</p>
										<p className="mt-3 text-2xl font-semibold text-white">{value}</p>
										<p className="mt-2 text-xs leading-5 text-slate-400">{copy}</p>
									</div>
								))}
							</div>
							<p className="mt-6 border-t border-white/10 pt-5 text-xs leading-5 text-slate-500">All output, APR, burn, profit, valuation, price, unlock, and allocation figures above reproduce assumptions from the supplied macro-tokenomics model. They are not financial advice, guaranteed returns, a current sale, or evidence of realized revenue. Live contract state and published governance decisions take precedence.</p>
						</div>
					</div>
				</section>

				<section className="border-t border-white/10 bg-black px-4 py-16 text-white sm:px-6 lg:px-8">
					<div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_1fr]">
						<div>
							<RadioTower className="h-7 w-7 text-cyan-200" aria-hidden="true" />
							<h2 className="mt-5 text-3xl font-semibold tracking-tight">Participate with evidence in mind.</h2>
							<p className="mt-4 max-w-xl leading-7 text-slate-300">Run a node, build a client, or examine a protocol. Use the GitBook for operational prerequisites and treat maturity labels as constraints, not marketing shorthand.</p>
						</div>
						<div className="grid content-start gap-3 sm:grid-cols-2">
								<SiteExternalLink href="https://gitbook.conet.network/developers/l1-node.html" className="rounded-2xl border border-white/15 bg-white/5 p-5 hover:bg-white/10">Run an L1 node <ArrowRight className="mt-4 h-4 w-4 text-cyan-200" aria-hidden="true" /></SiteExternalLink>
								<SiteExternalLink href="https://gitbook.conet.network/developers/conet-l0d.html" className="rounded-2xl border border-white/15 bg-white/5 p-5 hover:bg-white/10">conet-l0d Linux runtime <ArrowRight className="mt-4 h-4 w-4 text-cyan-200" aria-hidden="true" /></SiteExternalLink>
								<SiteExternalLink href="https://gitbook.conet.network/developers/" className="rounded-2xl border border-white/15 bg-white/5 p-5 hover:bg-white/10">Developer guides <ArrowRight className="mt-4 h-4 w-4 text-cyan-200" aria-hidden="true" /></SiteExternalLink>
								<SiteExternalLink href="https://gitbook.conet.network/resources.html" className="rounded-2xl border border-white/15 bg-white/5 p-5 hover:bg-white/10">Endpoints and repositories <ArrowRight className="mt-4 h-4 w-4 text-cyan-200" aria-hidden="true" /></SiteExternalLink>
						</div>
					</div>
				</section>
			</main>
		</ConetSiteShell>
	)
}
