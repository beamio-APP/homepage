import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
	ArrowRight,
	ArrowUpRight,
	BadgeCheck,
	Building2,
	Check,
	CreditCard,
	Download,
	Gift,
	Globe2,
	Hexagon,
	MessageCircle,
	Nfc,
	ShieldCheck,
	ShoppingBag,
	Store,
	Tags,
	Users,
	Wallet,
	Zap,
} from 'lucide-react'
import BeamioBrandLogo from '../components/BeamioBrandLogo'
import { useScrollCapsuleOpacity } from '../hooks/useScrollCapsuleOpacity'

function ExternalLink({ href, children, className, style }: { href: string; children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
	return <a href={href} target="_blank" rel="noopener noreferrer" className={className} style={style}>{children}</a>
}

const consumerStoreLinks = {
	appStore: 'https://apps.apple.com/us/app/beamio-smart-local-pass/id6755375110',
	googlePlay: 'https://play.google.com/store/apps/details?id=com.beamio.app',
	apk: '/beamio-android.apk',
}

const posStoreLinks = {
	appStore: 'https://apps.apple.com/ca/app/beamio-softpos/id6763462151',
	googlePlay: 'https://play.google.com/store/apps/details?id=com.beamio.pos',
	apk: '/beamio-softpos.apk',
}

const productFeatures = [
	{
		icon: Wallet,
		title: 'Beamio Consumer',
		eyebrow: 'Wallet & local discovery',
		copy: 'A self-custody wallet and local marketplace for everyday commerce.',
		accent: 'bg-[#e9edff] text-[#0051d1]',
		items: [
			'EOA Wallet and Smart Wallet access',
			'Discover merchant programs and local offers',
			'Claim coupons and Business Catalogs',
			'Reward PT, membership passes and store credits',
			'Private messaging through Layer Minus',
		],
	},
	{
		icon: CreditCard,
		title: 'Beamio POS',
		eyebrow: 'Authorized in-store terminal',
		copy: 'Turn an iPhone or Android device into an authorized Beamio terminal.',
		accent: 'bg-blue-50 text-blue-700',
		items: [
			'Charge in the merchant program currency',
			'Top up customer store credits',
			'Check balances and membership status',
			'Issue memberships and higher paid tiers',
			'Claim, redeem and burn coupons in store',
		],
	},
	{
		icon: Store,
		title: 'Beamio Merchant OS',
		eyebrow: 'Merchant control plane',
		copy: 'The operating system for programs, staff, terminals and settlements.',
		accent: 'bg-[#f5ecff] text-[#8d3a8b]',
		items: [
			'Create and publish merchant programs',
			'Configure membership and Reward PT rules',
			'Issue coupons and Business Catalogs',
			'Authorize staff and POS terminals',
			'Review transactions, fuel and treasury activity',
		],
	},
]

function StoreBadges({ appStore, googlePlay }: { appStore: string; googlePlay: string }) {
	return (
		<div className="grid grid-cols-2 gap-2">
			<ExternalLink href={appStore} className="flex min-w-0 justify-center rounded-xl bg-black px-2 py-2 transition-opacity hover:opacity-80">
				<img src="/app-store-badge.png" alt="Download on the App Store" className="h-10 w-auto max-w-full object-contain" />
			</ExternalLink>
			<ExternalLink href={googlePlay} className="flex min-w-0 justify-center rounded-xl bg-black px-2 py-2 transition-opacity hover:opacity-80">
				<img src="/google-play-badge.png" alt="Get it on Google Play" className="h-10 w-auto max-w-full object-contain" />
			</ExternalLink>
		</div>
	)
}

export default function BeamioLandingPage() {
	const { opacity: capsuleOpacity } = useScrollCapsuleOpacity(true, 'window')
	const capsulePointerEvents = capsuleOpacity < 0.05 ? 'none' : 'auto'

	useEffect(() => {
		document.title = 'Beamio | Consumer, POS and Merchant OS'
	}, [])

	return (
		<div className="min-h-screen overflow-x-hidden bg-[#f8fafc] text-slate-900 selection:bg-[#0051d1]/15">
			<div
				className="pointer-events-none fixed left-4 right-4 z-40 flex items-center justify-between gap-3 transition-opacity duration-300"
				style={{ top: 'max(1rem, env(safe-area-inset-top, 0px))', opacity: capsuleOpacity }}
			>
				<Link
					to="/"
					className="pointer-events-auto inline-flex items-center gap-2.5 rounded-full border border-slate-100/90 bg-white py-2 pl-2 pr-4 shadow-[0_4px_24px_rgba(15,23,42,0.08)]"
					style={{ pointerEvents: capsulePointerEvents }}
					aria-label="Beamio home"
				>
					<BeamioBrandLogo className="h-10 w-10 rounded-full object-cover" />
					<span className="text-[15px] font-bold tracking-tight text-[#0f172a]">Beamio</span>
				</Link>
				<ExternalLink
					href="https://conet.network/"
					className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-[0_4px_24px_rgba(15,23,42,0.08)] transition-colors hover:text-[#0051d1]"
					style={{ pointerEvents: capsulePointerEvents }}
				>
					CoNET <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
				</ExternalLink>
			</div>

			<main>
				<section className="relative overflow-hidden bg-white">
					<div className="absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_18%_20%,rgba(0,81,209,0.15),transparent_36%),radial-gradient(circle_at_82%_12%,rgba(141,58,139,0.12),transparent_32%)]" aria-hidden />
					<div
						className="relative mx-auto grid max-w-7xl gap-12 px-4 pb-20 sm:px-6 sm:pb-28 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8"
						style={{ paddingTop: 'calc(max(1rem, env(safe-area-inset-top, 0px)) + 7.5rem)' }}
					>
						<div>
							<div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#0051d1]">
								<Hexagon className="h-3.5 w-3.5" aria-hidden />
								Commerce on CoNET
							</div>
							<h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-[1.03] tracking-[-0.05em] sm:text-6xl lg:text-7xl">
								One commerce network. Three focused apps.
							</h1>
							<p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
								Beamio connects people, merchant programs and authorized in-store terminals through a shared wallet identity and application network.
							</p>
							<div className="mt-9 flex flex-wrap gap-3">
								<ExternalLink href="https://beamio.app/app/" className="inline-flex items-center gap-2 rounded-full bg-[#0051d1] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-700/15 transition hover:bg-blue-800">
									Open Consumer App <ArrowUpRight className="h-4 w-4" aria-hidden />
								</ExternalLink>
								<ExternalLink href="https://biz.beamio.app/" className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold transition hover:border-slate-500">
									Open Merchant OS <ArrowUpRight className="h-4 w-4" aria-hidden />
								</ExternalLink>
							</div>
						</div>

						<div className="relative mx-auto w-full max-w-lg">
							<div className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-blue-200/50 via-purple-100/50 to-cyan-100/50 blur-3xl" aria-hidden />
							<div className="relative overflow-hidden rounded-[2rem] border border-white bg-[#071126] p-5 shadow-[0_30px_90px_rgba(15,23,42,0.24)] sm:p-7">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-cyan-200">
										<span className="h-2 w-2 rounded-full bg-emerald-400" />
										Beamio network
									</div>
									<ShieldCheck className="h-5 w-5 text-blue-300" aria-hidden />
								</div>
								<div className="mt-7 space-y-3">
									{[
										[Wallet, 'Consumer', 'Wallet · Discover · Rewards'],
										[CreditCard, 'POS', 'Charge · Top-up · Redeem'],
										[Store, 'Merchant OS', 'Programs · Staff · Ledger'],
									].map(([Icon, title, copy], index) => {
										const RowIcon = Icon as typeof Wallet
										return (
											<div key={title as string} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
												<div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${index === 2 ? 'bg-purple-400/15 text-purple-200' : 'bg-blue-400/15 text-blue-200'}`}>
													<RowIcon className="h-5 w-5" aria-hidden />
												</div>
												<div className="min-w-0">
													<p className="font-semibold text-white">{title as string}</p>
													<p className="mt-0.5 text-xs text-slate-400">{copy as string}</p>
												</div>
												<ArrowRight className="ml-auto h-4 w-4 shrink-0 text-slate-500" aria-hidden />
											</div>
										)
									})}
								</div>
								<p className="mt-6 text-xs leading-5 text-slate-400">
									Self-custody identity and program state on CoNET L1, with private application messaging through Layer Minus.
								</p>
							</div>
						</div>
					</div>
				</section>

				<section id="apps" className="border-y border-slate-200 bg-[#f8fafc] py-20 sm:py-24">
					<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
						<div className="max-w-3xl">
							<p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0051d1]">Choose your Beamio app</p>
							<h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-5xl">Every role has a dedicated surface.</h2>
							<p className="mt-5 text-base leading-7 text-slate-600">Install the mobile apps from Apple or Google, download the verified Android packages directly, or use the live web applications.</p>
						</div>

						<div className="mt-12 grid gap-5 lg:grid-cols-3">
							<article className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
								<div className="flex items-center justify-between gap-3">
									<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e9edff] text-[#0051d1]"><Wallet className="h-6 w-6" aria-hidden /></div>
									<span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">For people</span>
								</div>
								<h3 className="mt-6 text-2xl font-semibold tracking-tight">Beamio Consumer</h3>
								<p className="mt-3 flex-1 text-sm leading-6 text-slate-600">Your self-custody wallet, merchant discovery, coupons, memberships, Reward PT and private messaging.</p>
								<div className="mt-7 space-y-3">
									<StoreBadges appStore={consumerStoreLinks.appStore} googlePlay={consumerStoreLinks.googlePlay} />
									<a href={consumerStoreLinks.apk} download className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-[#0051d1] transition hover:bg-blue-100">
										<Download className="h-4 w-4" aria-hidden /> Download Android APK
									</a>
									<ExternalLink href="https://beamio.app/app/" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0051d1] px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-800">
										Open web app <ArrowUpRight className="h-4 w-4" aria-hidden />
									</ExternalLink>
								</div>
							</article>

							<article className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
								<div className="flex items-center justify-between gap-3">
									<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700"><CreditCard className="h-6 w-6" aria-hidden /></div>
									<span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">For terminals</span>
								</div>
								<h3 className="mt-6 text-2xl font-semibold tracking-tight">Beamio POS</h3>
								<p className="mt-3 flex-1 text-sm leading-6 text-slate-600">An authorized in-store terminal for Charge, Top-up, membership, Check Balance, coupon claim and redeem.</p>
								<div className="mt-7 space-y-3">
									<StoreBadges appStore={posStoreLinks.appStore} googlePlay={posStoreLinks.googlePlay} />
									<a href={posStoreLinks.apk} download className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-[#0051d1] transition hover:bg-blue-100">
										<Download className="h-4 w-4" aria-hidden /> Download Android APK
									</a>
									<ExternalLink href="https://pos.beamio.app/" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0051d1] px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-800">
										Open POS <ArrowUpRight className="h-4 w-4" aria-hidden />
									</ExternalLink>
								</div>
							</article>

							<article className="flex flex-col rounded-3xl border border-purple-200 bg-white p-6 shadow-sm sm:p-7">
								<div className="flex items-center justify-between gap-3">
									<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f5ecff] text-[#8d3a8b]"><Store className="h-6 w-6" aria-hidden /></div>
									<span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-[#8d3a8b]">For merchants</span>
								</div>
								<h3 className="mt-6 text-2xl font-semibold tracking-tight">Beamio Merchant OS</h3>
								<p className="mt-3 flex-1 text-sm leading-6 text-slate-600">The browser-based merchant control plane. Create programs, authorize terminals and manage the entire operating lifecycle.</p>
								<div className="mt-7 rounded-2xl bg-[#f5ecff] p-4">
									<div className="flex items-start gap-3">
										<Globe2 className="mt-0.5 h-5 w-5 shrink-0 text-[#8d3a8b]" aria-hidden />
										<div>
											<p className="text-sm font-bold text-slate-900">No installation required</p>
											<p className="mt-1 text-xs leading-5 text-slate-600">Use Merchant OS from a modern desktop or tablet browser.</p>
										</div>
									</div>
								</div>
								<ExternalLink href="https://biz.beamio.app/" className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#8d3a8b] px-4 py-3 text-sm font-bold text-white transition hover:bg-purple-900">
									Access Merchant OS <ArrowUpRight className="h-4 w-4" aria-hidden />
								</ExternalLink>
							</article>
						</div>
					</div>
				</section>

				<section className="bg-white py-20 sm:py-24">
					<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
						<div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
							<div className="lg:sticky lg:top-24">
								<p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0051d1]">A connected product suite</p>
								<h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-5xl">From discovery to the counter to the control room.</h2>
								<p className="mt-5 text-base leading-7 text-slate-600">The three products share one application model, while keeping consumer, terminal and merchant responsibilities clearly separated.</p>
							</div>
							<div className="space-y-4">
								{productFeatures.map(({ icon: Icon, title, eyebrow, copy, accent, items }) => (
									<article key={title} className="rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
										<div className="flex flex-col gap-5 sm:flex-row sm:items-start">
											<div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${accent}`}><Icon className="h-6 w-6" aria-hidden /></div>
											<div className="min-w-0 flex-1">
												<p className="text-xs font-bold uppercase tracking-[0.13em] text-slate-500">{eyebrow}</p>
												<h3 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h3>
												<p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p>
												<div className="mt-5 grid gap-2 sm:grid-cols-2">
													{items.map((item) => (
														<div key={item} className="flex items-start gap-2 text-sm leading-5 text-slate-700">
															<Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" strokeWidth={2.5} aria-hidden />
															<span>{item}</span>
														</div>
													))}
												</div>
											</div>
										</div>
									</article>
								))}
							</div>
						</div>
					</div>
				</section>

				<section className="border-y border-slate-200 bg-[#071126] py-20 text-white sm:py-24">
					<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
						<div className="grid gap-12 lg:grid-cols-2 lg:items-center">
							<div>
								<div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-cyan-200">
									<Nfc className="h-3.5 w-3.5" aria-hidden /> Physical + digital
								</div>
								<h2 className="mt-5 text-3xl font-semibold tracking-[-0.035em] sm:text-5xl">A merchant program customers can carry.</h2>
								<p className="mt-5 max-w-xl text-base leading-7 text-slate-300">Beamio brings wallet identity, memberships, rewards and issued assets into the store through mobile QR and supported NFC experiences.</p>
								<div className="mt-8 grid gap-3 sm:grid-cols-2">
									{[
										[BadgeCheck, 'Membership passes', 'Base membership and higher paid tiers live with the customer wallet.'],
										[Gift, 'Coupons & catalogs', 'Claim and present merchant-issued assets across app and POS.'],
										[Tags, 'Reward PT', 'Earn and use merchant-configured rewards without a separate plastic account.'],
										[MessageCircle, 'Private communication', 'Merchant and customer messaging can use Layer Minus routing.'],
									].map(([Icon, title, copy]) => {
										const ItemIcon = Icon as typeof BadgeCheck
										return (
											<div key={title as string} className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
												<ItemIcon className="h-5 w-5 text-cyan-200" aria-hidden />
												<h3 className="mt-3 text-sm font-semibold text-white">{title as string}</h3>
												<p className="mt-1 text-xs leading-5 text-slate-400">{copy as string}</p>
											</div>
										)
									})}
								</div>
							</div>

							<div className="relative mx-auto w-full max-w-lg py-8">
								<div className="absolute inset-8 rounded-full bg-blue-500/20 blur-3xl" aria-hidden />
								<div className="relative aspect-[1.6/1] rotate-[-4deg] rounded-[1.8rem] border border-white/15 bg-gradient-to-br from-slate-800 via-[#111827] to-black p-7 shadow-[0_32px_80px_rgba(0,0,0,0.45)] transition-transform duration-500 hover:rotate-0 sm:p-9">
									<div className="flex items-start justify-between">
										<div className="flex h-11 w-16 items-center justify-center rounded-lg border border-white/10 bg-white/10"><Nfc className="h-6 w-6 rotate-90 text-slate-300" aria-hidden /></div>
										<BeamioBrandLogo className="h-12 w-12 rounded-2xl" />
									</div>
									<div className="absolute bottom-7 left-7 right-7 sm:bottom-9 sm:left-9 sm:right-9">
										<p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">Merchant program</p>
										<p className="mt-2 text-2xl font-semibold tracking-[0.12em] text-white sm:text-3xl">BEAMIO PASS</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>

				<section className="bg-white py-20 sm:py-24">
					<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
						<div className="mx-auto max-w-3xl text-center">
							<p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0051d1]">Built for local commerce</p>
							<h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-5xl">Programs that continue beyond checkout.</h2>
							<p className="mt-5 text-base leading-7 text-slate-600">Merchant programs can connect discovery, membership, rewards, issued assets and in-store fulfillment without forcing every role into one oversized app.</p>
						</div>
						<div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
							{[
								[ShoppingBag, 'Discover', 'Help customers find merchant programs, offers and Business Catalogs.'],
								[Users, 'Membership', 'Publish a base membership and optional higher paid tiers.'],
								[Zap, 'Rewards', 'Configure Reward PT for Top-up, Charge and social engagement.'],
								[Building2, 'Operations', 'Connect staff, authorized terminals, ledger views and program controls.'],
							].map(([Icon, title, copy]) => {
								const FeatureIcon = Icon as typeof ShoppingBag
								return (
									<article key={title as string} className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
										<FeatureIcon className="h-6 w-6 text-[#0051d1]" aria-hidden />
										<h3 className="mt-5 text-lg font-semibold">{title as string}</h3>
										<p className="mt-2 text-sm leading-6 text-slate-600">{copy as string}</p>
									</article>
								)
							})}
						</div>
					</div>
				</section>

				<section className="border-y border-slate-200 bg-[#f8fafc] py-20 sm:py-24">
					<div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.15fr] lg:items-center lg:px-8">
						<div>
							<p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0051d1]">Why CoNET underneath</p>
							<h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-5xl">Wallet identity, application state and private routing.</h2>
							<p className="mt-5 text-base leading-7 text-slate-600">Beamio is the application suite. CoNET supplies the shared infrastructure used for account state, merchant programs and privacy-oriented communication.</p>
							<div className="mt-8 flex flex-wrap gap-3">
								<ExternalLink href="https://conet.network/" className="inline-flex items-center gap-2 rounded-full bg-[#071126] px-5 py-3 text-sm font-bold text-white">
									Explore CoNET <ArrowUpRight className="h-4 w-4" aria-hidden />
								</ExternalLink>
								<ExternalLink href="https://gitbook.conet.network/applications/beamio.html" className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold">
									Read Beamio whitepaper <ArrowUpRight className="h-4 w-4" aria-hidden />
								</ExternalLink>
							</div>
						</div>
						<div className="grid gap-3">
							{[
								['CoNET L1', 'Wallet, Smart Wallet, merchant program and issued-asset state.'],
								['Layer Minus', 'Private application messaging, POS authorization and mailbox routing.'],
								['Local-first apps', 'Trusted device state remains available while network refreshes happen in the background.'],
								['Gas-sponsored writes', 'Application relays precheck approved actions without receiving the user private key.'],
							].map(([title, copy], index) => (
								<div key={title} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5">
									<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-[#0051d1]">{index + 1}</span>
									<div><h3 className="font-semibold">{title}</h3><p className="mt-1 text-sm leading-6 text-slate-600">{copy}</p></div>
								</div>
							))}
						</div>
					</div>
				</section>

				<section className="bg-white py-20 sm:py-24">
					<div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
						<div className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0051d1] to-[#071126] p-8 text-white shadow-[0_28px_80px_rgba(0,81,209,0.2)] sm:p-12">
							<div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
								<div>
									<p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-200">Start with your role</p>
									<h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">Beamio is ready on mobile and web.</h2>
									<p className="mt-4 max-w-2xl text-sm leading-6 text-blue-100">Install Consumer or POS from your app store, download the Android APK directly, or open Merchant OS in the browser.</p>
								</div>
								<div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
									<ExternalLink href="https://beamio.app/app-download" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-[#0051d1]">
										Get Beamio <ArrowUpRight className="h-4 w-4" aria-hidden />
									</ExternalLink>
									<ExternalLink href="https://biz.beamio.app/" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-5 py-3 text-sm font-bold text-white">
										Merchant login <ArrowUpRight className="h-4 w-4" aria-hidden />
									</ExternalLink>
								</div>
							</div>
						</div>
					</div>
				</section>
			</main>

			<footer className="border-t border-slate-200 bg-[#f8fafc]">
				<div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.2fr_1fr_1fr] lg:px-8">
					<div>
						<div className="flex items-center gap-2.5"><BeamioBrandLogo className="h-9 w-9 rounded-xl" /><span className="font-bold">Beamio</span></div>
						<p className="mt-4 max-w-sm text-sm leading-6 text-slate-500">Consumer, merchant and POS applications built with CoNET infrastructure.</p>
					</div>
					<div>
						<h2 className="text-sm font-semibold">Products</h2>
						<div className="mt-3 flex flex-col items-start gap-2 text-sm text-slate-500">
							<ExternalLink href="https://beamio.app/app/" className="hover:text-slate-900">Consumer App</ExternalLink>
							<ExternalLink href="https://pos.beamio.app/" className="hover:text-slate-900">Beamio POS</ExternalLink>
							<ExternalLink href="https://biz.beamio.app/" className="hover:text-slate-900">Merchant OS</ExternalLink>
						</div>
					</div>
					<div>
						<h2 className="text-sm font-semibold">Company & protocol</h2>
						<div className="mt-3 flex flex-col items-start gap-2 text-sm text-slate-500">
							<ExternalLink href="https://conet.network/" className="hover:text-slate-900">CoNET</ExternalLink>
							<Link to="/contact" className="hover:text-slate-900">Contact</Link>
							<Link to="/terms" className="hover:text-slate-900">Terms</Link>
							<Link to="/privacy" className="hover:text-slate-900">Privacy</Link>
						</div>
					</div>
				</div>
				<div className="border-t border-slate-200 px-4 py-5 text-center text-xs text-slate-500">© {new Date().getFullYear()} Beamio. Product availability may vary by account, device and region.</div>
			</footer>
		</div>
	)
}
