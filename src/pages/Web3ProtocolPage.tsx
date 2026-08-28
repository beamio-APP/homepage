import React, { useEffect } from 'react'
import { Blocks, CheckCircle2, Cloud, FileKey2, Layers3, LockKeyhole, MessageSquareCode, RadioTower, ServerCog, ShieldAlert, Waypoints } from 'lucide-react'
import { ConetSiteShell, ExternalLink } from '../components/ConetSiteShell'

const protocolUrl = 'https://gitbook.conet.network/l0/web3-application-protocol.html'
const runtimeUrl = 'https://gitbook.conet.network/developers/conet-l0d.html'
const l1OverlayLabUrl = 'https://gitbook.conet.network/developers/conet-l0d-l1-overlay-lab.html'

const boundaries = [
	'web3:// is not a new Layer Minus /post command.',
	'It is not DNS, a public IP address, or an open port convention.',
	'It does not itself promise anonymity, an audit, an uptime SLA, or system-level URL-scheme registration on every platform.',
]

export default function Web3ProtocolPage() {
	useEffect(() => {
		document.title = 'web3:// Application Protocol | CoNET'
	}, [])

	return (
		<ConetSiteShell>
			<main>
				<section className="relative isolate overflow-hidden border-b border-white/10 bg-black px-4 py-16 text-white sm:px-6 sm:py-24 lg:px-8">
					<div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_22%,rgba(34,211,238,0.12),transparent_32%),radial-gradient(circle_at_82%_35%,rgba(192,132,252,0.18),transparent_34%),linear-gradient(180deg,#000_0%,#101115_100%)]" />
					<div className="mx-auto max-w-4xl">
						<p className="inline-flex rounded-full border border-cyan-200/25 bg-cyan-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.17em] text-cyan-100">Draft with implemented v1 components</p>
						<h1 className="mt-6 text-4xl font-semibold tracking-[-0.045em] sm:text-6xl">web3:// Application Protocol</h1>
						<p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">A wallet-addressed application protocol for resolving an EOA or exact tag, making caller-signed requests, and receiving request-correlated encrypted responses over CoNET Layer Minus.</p>
						<div className="mt-8 flex flex-wrap gap-3">
							<ExternalLink href={protocolUrl} className="rounded-xl bg-gradient-to-r from-cyan-300 to-purple-400 px-5 py-3 text-sm font-bold text-slate-950 shadow-[0_0_28px_rgba(103,232,249,0.18)] hover:brightness-110">Read the specification</ExternalLink>
							<ExternalLink href={runtimeUrl} className="rounded-full border border-white/25 px-5 py-3 text-sm font-semibold hover:bg-white/10">conet-l0d runtime guide</ExternalLink>
						</div>
					</div>
				</section>

				<section className="border-b border-white/10 bg-[#15161d] px-4 py-16 sm:px-6 lg:px-8">
					<div className="mx-auto max-w-5xl">
						<p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">Where web3:// fits</p>
						<h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-white">A private-server protocol built above the decentralized cloud.</h2>
						<p className="mt-5 max-w-3xl leading-7 text-slate-400">CoNET L0 supplies decentralized forwarding, ciphertext storage, service hosting, and compute resources. Layer Minus composes those resources into wallet-addressed private communication. web3:// then gives applications a portable way to address and authorize a server by wallet identity rather than exposing its public IP as the application name.</p>
						<div className="mt-9 grid gap-4 md:grid-cols-4">
							{[
								['L0 cloud', 'Forward · store · host · compute', Cloud],
								['Layer Minus', 'Private wallet-addressed communication', Waypoints],
								['L1 + DLE L2', 'Privacy-routed peer and mining gossip', Blocks],
								['web3://', 'Wallet-addressed private servers', ServerCog],
							].map(([title, copy, Icon]) => {
								const ContextIcon = Icon as typeof Cloud
								return <article key={title as string} className="rounded-2xl border border-white/10 bg-[#18191f] p-5">
									<ContextIcon className="h-6 w-6 text-cyan-300" aria-hidden="true" />
									<h3 className="mt-5 font-semibold text-white">{title as string}</h3>
									<p className="mt-2 text-sm leading-6 text-slate-400">{copy as string}</p>
								</article>
							})}
						</div>
						<div className="mt-6 flex items-start gap-3 rounded-2xl border border-purple-300/15 bg-purple-300/5 p-5">
							<Layers3 className="mt-0.5 h-5 w-5 shrink-0 text-purple-300" aria-hidden="true" />
							<p className="text-sm leading-6 text-slate-300">The L1 overlay and CoNET-DLE use Layer Minus for privacy-routed gossip. web3:// is the application-server contract on the same infrastructure; it is not a replacement for L0, Layer Minus, L1, or L2.</p>
						</div>
					</div>
				</section>

				<section className="px-4 py-16 sm:px-6 lg:px-8">
					<div className="mx-auto max-w-4xl">
						<div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
							<div>
								<p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">Addressing</p>
								<h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">A locator begins with identity.</h2>
								<p className="mt-4 leading-7 text-slate-400">The authority is an EOA address or an exact BeamioTag. Tags must resolve without ambiguity; clients must not guess a similarly named identity.</p>
							</div>
							<div className="space-y-3 rounded-2xl border border-white/10 bg-[#18191f] p-5">
								<code className="block overflow-x-auto rounded-xl border border-white/10 bg-black/40 p-4 text-sm text-cyan-100">web3://0x1234567890abcdef…/resource</code>
								<code className="block overflow-x-auto rounded-xl border border-white/10 bg-black/40 p-4 text-sm text-cyan-100">web3://ExactTag.web3/resource</code>
								<p className="px-1 text-sm leading-6 text-slate-400">These are non-executing examples. A client resolves the locator according to the protocol and local platform capabilities.</p>
							</div>
						</div>
					</div>
				</section>

				<section className="border-y border-white/10 bg-[#15161d] px-4 py-16 sm:px-6 lg:px-8">
					<div className="mx-auto max-w-5xl">
						<p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">Two interaction models</p>
						<h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">Resources and persistent duplex streams.</h2>
						<div className="mt-9 grid gap-4 md:grid-cols-2">
							<article className="rounded-2xl border border-white/10 bg-[#18191f] p-6">
								<MessageSquareCode className="h-7 w-7 text-cyan-300" aria-hidden="true" />
								<h3 className="mt-6 text-xl font-semibold text-white">Resource request</h3>
								<p className="mt-3 text-sm leading-6 text-slate-400">A client resolves a locator, signs the canonical request, and receives a request-correlated response encrypted to the caller&apos;s registered user PGP key.</p>
							</article>
							<article className="rounded-2xl border border-white/10 bg-[#18191f] p-6">
								<RadioTower className="h-7 w-7 text-purple-300" aria-hidden="true" />
								<h3 className="mt-6 text-xl font-semibold text-white">Persistent duplex stream</h3>
								<p className="mt-3 text-sm leading-6 text-slate-400">A long-lived interaction model for applications that need ongoing bidirectional exchange after protocol-level addressing and authorization.</p>
							</article>
						</div>
					</div>
				</section>

				<section className="px-4 py-16 sm:px-6 lg:px-8">
					<div className="mx-auto max-w-5xl">
						<p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">How a request is handled</p>
						<div className="mt-8 grid gap-4 md:grid-cols-4">
							{[
								['1', 'Resolve', 'Resolve the EOA or exact tag into the protocol routing context.', Waypoints],
								['2', 'Authorize', 'Bind a signed request to the caller identity and requested action.', FileKey2],
								['3', 'Route', 'Carry encrypted protocol traffic through the applicable CoNET path.', LockKeyhole],
								['4', 'Respond', 'Deliver an encrypted response or maintain an authorized stream.', CheckCircle2],
							].map(([step, title, copy, Icon]) => {
								const StepIcon = Icon as typeof Waypoints
								return <article key={step as string} className="rounded-2xl border border-white/10 bg-[#18191f] p-5">
									<span className="text-sm font-bold text-cyan-300">{step as string}</span>
									<StepIcon className="mt-5 h-5 w-5 text-white" aria-hidden="true" />
									<h3 className="mt-4 font-semibold text-white">{title as string}</h3>
									<p className="mt-2 text-sm leading-6 text-slate-400">{copy as string}</p>
								</article>
							})}
						</div>
					</div>
				</section>

				<section className="border-t border-white/10 bg-black px-4 py-16 sm:px-6 lg:px-8">
					<div className="mx-auto max-w-4xl rounded-2xl border border-amber-300/20 bg-amber-300/5 p-6 sm:p-8">
						<div className="flex items-center gap-3"><ShieldAlert className="h-6 w-6 text-amber-300" aria-hidden="true" /><h2 className="text-2xl font-semibold tracking-tight text-white">Security and status boundaries</h2></div>
						<ul className="mt-6 space-y-3 text-sm leading-6 text-slate-300">
							{boundaries.map((boundary) => <li key={boundary} className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300" aria-hidden="true" />{boundary}</li>)}
						</ul>
						<p className="mt-6 text-sm leading-6 text-slate-400">
							The public protocol specification and <ExternalLink href={runtimeUrl} className="font-semibold text-cyan-300 hover:underline">conet-l0d Linux runtime guide</ExternalLink> are the authoritative developer references. The separate <ExternalLink href={l1OverlayLabUrl} className="font-semibold text-cyan-300 hover:underline">wallet-addressed L1 overlay lab</ExternalLink> remains under development and laboratory-validated; it is not required for the current public L1 joining path.
						</p>
					</div>
				</section>
			</main>
		</ConetSiteShell>
	)
}
