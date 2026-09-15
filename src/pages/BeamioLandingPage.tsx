import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
	ArrowRight,
	ArrowUpRight,
	Check,
	CircleDollarSign,
	CreditCard,
	Download,
	Globe2,
	HeartHandshake,
	Link2,
	LockKeyhole,
	Nfc,
	Repeat2,
	Share2,
	ShieldCheck,
	ShoppingBag,
	Smartphone,
	Store,
	Users,
	Wallet,
	Zap,
} from 'lucide-react'
import BeamioBrandLogo from '../components/BeamioBrandLogo'
import { useScrollCapsuleOpacity } from '../hooks/useScrollCapsuleOpacity'

function ExternalLink({
	href,
	children,
	className,
	style,
}: {
	href: string
	children: React.ReactNode
	className?: string
	style?: React.CSSProperties
}) {
	return (
		<a href={href} target="_blank" rel="noopener noreferrer" className={className} style={style}>
			{children}
		</a>
	)
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

const valuePillars = [
	{
		icon: CircleDollarSign,
		number: '01',
		title: 'Stablecoin settlement',
		copy: 'Add USDC settlement without operating blockchain infrastructure or asking customers to become blockchain experts.',
	},
	{
		icon: CreditCard,
		number: '02',
		title: 'Stripe, online and in store',
		copy: 'Keep your Stripe account. Add hosted Checkout, Tap to Pay, or a compatible card reader to the same merchant program.',
	},
	{
		icon: Share2,
		number: '03',
		title: 'Reward PT and sharing',
		copy: 'Reward purchases, referrals, and engagement. Let eligible Reward PT travel across participating merchant programs.',
	},
]

const pointSteps = [
	{
		icon: Zap,
		title: 'Earn',
		copy: 'Merchants configure Reward PT for Top-up, Charge, referrals, and social engagement.',
	},
	{
		icon: Share2,
		title: 'Share',
		copy: 'Customer referrals and shared merchant links turn existing relationships into measurable growth.',
	},
	{
		icon: Repeat2,
		title: 'Use',
		copy: 'Reward PT can support same-store value or eligible cross-store top-ups in participating programs.',
	},
	{
		icon: ShoppingBag,
		title: 'Expand',
		copy: 'Each merchant keeps its own program while joining a broader reward economy on clear terms.',
	},
]

export default function BeamioLandingPage() {
	const { opacity: capsuleOpacity } = useScrollCapsuleOpacity(true, 'window')
	const capsulePointerEvents = capsuleOpacity < 0.05 ? 'none' : 'auto'

	useEffect(() => {
		document.title = 'Beamio | Direct Settlement and Merchant Relationships'
	}, [])

	return (
		<div className="min-h-screen overflow-x-hidden bg-[#f5f5f2] text-[#171717] selection:bg-[#2f73e0]/20">
			<div
				className="pointer-events-none fixed left-4 right-4 z-40 flex items-center justify-between gap-3 transition-opacity duration-300"
				style={{ top: 'max(1rem, env(safe-area-inset-top, 0px))', opacity: capsuleOpacity }}
			>
				<Link
					to="/"
					className="pointer-events-auto inline-flex items-center gap-2.5 rounded-full border border-black/[0.06] bg-white py-2 pl-2 pr-4 shadow-[0_4px_24px_rgba(15,23,42,0.08)]"
					style={{ pointerEvents: capsulePointerEvents }}
					aria-label="Beamio home"
				>
					<BeamioBrandLogo className="h-10 w-10 rounded-full object-cover" />
					<span className="text-[15px] font-bold tracking-tight">Beamio</span>
				</Link>
				<ExternalLink
					href="https://biz.beamio.app/"
					className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full bg-[#171717] px-4 py-3 text-sm font-semibold text-white shadow-[0_4px_24px_rgba(15,23,42,0.12)] transition-colors hover:bg-[#2f73e0]"
					style={{ pointerEvents: capsulePointerEvents }}
				>
					For merchants <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
				</ExternalLink>
			</div>

			<main>
				<section className="relative min-h-[92vh] overflow-hidden bg-[#f5f5f2]">
					<div className="absolute right-[-14rem] top-[-4rem] h-[28rem] w-[28rem] rounded-full bg-[#2f73e0] opacity-20 sm:right-[-3rem] sm:top-[-5rem] sm:h-[42rem] sm:w-[42rem] sm:opacity-95" aria-hidden />
					<div className="absolute right-[-1rem] top-[22rem] h-24 w-24 rounded-full bg-[#ffdd43] sm:right-[10%] sm:top-[35rem] sm:h-40 sm:w-40" aria-hidden />
					<div
						className="relative mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-between px-4 pb-12 sm:px-6 sm:pb-16 lg:px-8"
						style={{ paddingTop: 'calc(max(1rem, env(safe-area-inset-top, 0px)) + 7.5rem)' }}
					>
						<div className="relative z-10 max-w-5xl">
							<p className="text-xs font-black uppercase tracking-[0.2em] text-[#2f73e0]">Direct commerce infrastructure</p>
							<h1 className="mt-5 max-w-sm text-[3rem] font-black leading-[0.9] tracking-[-0.075em] sm:max-w-none sm:text-7xl lg:text-[7rem]">
								Own the relationship.
								<br />
								Move value directly.
							</h1>
							<p className="mt-8 max-w-2xl text-lg font-medium leading-8 text-black/65 sm:text-xl">
								Bring stablecoin settlement, Stripe payments, and Reward PT into one merchant program—without making Beamio the custodian, the counterparty, or the owner of the customer relationship.
							</p>
							<div className="mt-9 flex flex-wrap gap-3">
								<ExternalLink href="https://biz.beamio.app/" className="inline-flex items-center gap-2 rounded-full bg-[#171717] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#2f73e0]">
									Start with Merchant OS <ArrowRight className="h-4 w-4" aria-hidden />
								</ExternalLink>
								<ExternalLink href="https://beamio.app/app/" className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white px-6 py-3.5 text-sm font-bold transition hover:border-black/35">
									Open Consumer App <ArrowUpRight className="h-4 w-4" aria-hidden />
								</ExternalLink>
							</div>
						</div>

						<div className="relative z-10 mt-16 grid gap-px overflow-hidden rounded-3xl border border-black/10 bg-black/10 sm:grid-cols-3 lg:max-w-5xl">
							{[
								['No blockchain expertise required', 'Use managed applications and gas-sponsored writes.'],
								['Your Stripe account', 'Card proceeds settle to the connected merchant account.'],
								['Your customer relationship', 'Programs and assets connect merchants and customers directly.'],
							].map(([title, copy]) => (
								<div key={title} className="bg-white/95 p-5 backdrop-blur sm:p-6">
									<Check className="h-5 w-5 text-[#2f73e0]" strokeWidth={3} aria-hidden />
									<h2 className="mt-4 text-sm font-bold">{title}</h2>
									<p className="mt-1 text-xs leading-5 text-black/55">{copy}</p>
								</div>
							))}
						</div>
					</div>
				</section>

				<section className="bg-[#171717] py-20 text-white sm:py-28">
					<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
						<div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
							<div>
								<p className="text-xs font-black uppercase tracking-[0.2em] text-[#78a9ff]">One system, three growth levers</p>
								<h2 className="mt-5 text-4xl font-black leading-[0.96] tracking-[-0.055em] sm:text-6xl">
									Payments become the beginning of the relationship.
								</h2>
							</div>
							<p className="max-w-xl text-base leading-7 text-white/60 lg:justify-self-end">
								Like the strongest local payment platforms, Beamio connects settlement with retention. Unlike a closed stored-value operator, it keeps merchant programs, customer wallets, and asset ownership visible and distinct.
							</p>
						</div>
						<div className="mt-14 grid gap-px overflow-hidden rounded-[2rem] bg-white/15 lg:grid-cols-3">
							{valuePillars.map(({ icon: Icon, number, title, copy }) => (
								<article key={number} className="bg-[#202020] p-6 sm:p-8">
									<div className="flex items-center justify-between">
										<Icon className="h-7 w-7 text-[#78a9ff]" aria-hidden />
										<span className="text-sm font-black text-white/30">{number}</span>
									</div>
									<h3 className="mt-16 text-2xl font-bold tracking-tight">{title}</h3>
									<p className="mt-3 text-sm leading-6 text-white/55">{copy}</p>
								</article>
							))}
						</div>
					</div>
				</section>

				<section className="bg-white py-20 sm:py-28">
					<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
						<div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
							<div className="lg:sticky lg:top-24">
								<p className="text-xs font-black uppercase tracking-[0.2em] text-[#2f73e0]">Stablecoin, without the threshold</p>
								<h2 className="mt-5 text-4xl font-black leading-[0.96] tracking-[-0.055em] sm:text-6xl">Start with USDC. Keep the experience familiar.</h2>
								<p className="mt-6 max-w-xl text-base leading-7 text-black/60">
									Merchants do not need to deploy chain infrastructure or manage customer gas. Beamio applications prepare approved actions, customers sign locally, and sponsored relays submit them.
								</p>
							</div>
							<div className="space-y-4">
								{[
									[Wallet, 'Self-custody by design', 'Customer wallet material stays on the customer device. Merchant assets remain attached to the merchant program—not pooled in a Beamio balance.'],
									[ShieldCheck, 'Gas-sponsored application writes', 'Supported USDC actions use offline authorization and sponsored submission. Beamio relays the approved instruction without receiving the user private key.'],
									[Globe2, 'A practical path into on-chain settlement', 'Consumer, POS, and Merchant OS provide the workflows. The underlying contracts preserve verifiable ownership and program state.'],
								].map(([Icon, title, copy], index) => {
									const ItemIcon = Icon as typeof Wallet
									return (
										<article key={title as string} className="grid gap-5 rounded-3xl border border-black/10 bg-[#f5f5f2] p-6 sm:grid-cols-[auto_1fr] sm:p-8">
											<div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2f73e0] text-white"><ItemIcon className="h-5 w-5" aria-hidden /></div>
											<div>
												<p className="text-xs font-black uppercase tracking-[0.18em] text-black/35">Step {index + 1}</p>
												<h3 className="mt-2 text-xl font-bold">{title as string}</h3>
												<p className="mt-2 text-sm leading-6 text-black/60">{copy as string}</p>
											</div>
										</article>
									)
								})}
							</div>
						</div>
					</div>
				</section>

				<section className="border-y border-black/10 bg-[#f5f5f2] py-20 sm:py-28">
					<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
						<div className="mx-auto max-w-4xl text-center">
							<div className="inline-flex items-center gap-2 rounded-full bg-[#635bff]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#5148e5]">
								<CreditCard className="h-4 w-4" aria-hidden /> Stripe connected commerce
							</div>
							<h2 className="mt-6 text-4xl font-black leading-[0.96] tracking-[-0.055em] sm:text-6xl">Online or offline. One merchant relationship.</h2>
							<p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-black/60">
								Connect an existing Stripe account without learning a new payment stack. Beamio minimizes the payment data it handles and starts program fulfillment only after a trusted payment confirmation.
							</p>
						</div>
						<div className="mt-14 grid gap-5 lg:grid-cols-3">
							{[
								[Link2, 'Connect once', 'Authorize the merchant’s existing Stripe account. Beamio does not create a replacement merchant account.'],
								[Smartphone, 'Accept online', 'Use Stripe-hosted Checkout for eligible top-ups and membership purchases without collecting card details inside Beamio.'],
								[Nfc, 'Accept in store', 'Use Tap to Pay or a compatible Stripe Reader from an authorized Beamio POS terminal.'],
							].map(([Icon, title, copy]) => {
								const CardIcon = Icon as typeof Link2
								return (
									<article key={title as string} className="rounded-[2rem] bg-white p-6 shadow-[0_12px_45px_rgba(15,23,42,0.06)] sm:p-8">
										<div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#635bff] text-white"><CardIcon className="h-5 w-5" aria-hidden /></div>
										<h3 className="mt-10 text-2xl font-bold tracking-tight">{title as string}</h3>
										<p className="mt-3 text-sm leading-6 text-black/60">{copy as string}</p>
									</article>
								)
							})}
						</div>
						<div className="mt-5 flex items-start gap-3 rounded-2xl border border-[#635bff]/15 bg-[#635bff]/[0.06] px-5 py-4">
							<LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-[#5148e5]" aria-hidden />
							<p className="text-sm leading-6 text-black/65"><strong>Privacy-minimized verification:</strong> card credentials remain with Stripe, merchant proceeds settle to the merchant’s Connected Account, and Beamio uses payment status to coordinate the approved on-chain program action.</p>
						</div>
					</div>
				</section>

				<section className="overflow-hidden bg-[#2f73e0] py-20 text-white sm:py-28">
					<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
						<div className="grid gap-12 lg:grid-cols-[1fr_0.8fr] lg:items-end">
							<div>
								<p className="text-xs font-black uppercase tracking-[0.2em] text-blue-100">Reward PT + sharing economy</p>
								<h2 className="mt-5 text-4xl font-black leading-[0.94] tracking-[-0.06em] sm:text-6xl lg:text-7xl">Turn every customer action into reach.</h2>
							</div>
							<p className="max-w-xl text-base leading-7 text-blue-100/80">
								Reward PT connects buying, referring, sharing, and returning. Participating merchants can grow together without giving up ownership of their own Store Credit or customer program.
							</p>
						</div>
						<div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
							{pointSteps.map(({ icon: Icon, title, copy }, index) => (
								<article key={title} className="rounded-3xl border border-white/20 bg-white/[0.08] p-6 backdrop-blur-sm">
									<div className="flex items-center justify-between">
										<Icon className="h-6 w-6 text-[#ffdd43]" aria-hidden />
										<span className="text-xs font-black text-white/35">0{index + 1}</span>
									</div>
									<h3 className="mt-12 text-xl font-bold">{title}</h3>
									<p className="mt-2 text-sm leading-6 text-blue-100/75">{copy}</p>
								</article>
							))}
						</div>
						<div className="mt-5 rounded-2xl bg-white px-5 py-4 text-sm leading-6 text-black/70">
							<strong className="text-black">Clear asset boundaries:</strong> Store Credit remains specific to the issuing merchant. Cross-store use applies only to eligible Reward PT under participating program rules, with any remaining amount payable in USDC.
						</div>
					</div>
				</section>

				<section className="bg-white py-20 sm:py-28">
					<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
						<div className="mx-auto max-w-4xl text-center">
							<p className="text-xs font-black uppercase tracking-[0.2em] text-[#2f73e0]">Not the man in the middle</p>
							<h2 className="mt-5 text-4xl font-black leading-[0.96] tracking-[-0.055em] sm:text-6xl">Beamio supports the transaction. It does not become the transaction.</h2>
							<p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-black/60">
								Beamio provides applications, verification, routing, and gas sponsorship. It is not the merchant, the customer, or the beneficial owner of their assets.
							</p>
						</div>

						<div className="mx-auto mt-14 max-w-5xl rounded-[2rem] border border-black/10 bg-[#f5f5f2] p-5 sm:p-8">
							<div className="grid items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
								<div className="rounded-3xl bg-white p-6 text-center shadow-sm">
									<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#e9edff] text-[#0051d1]"><Users className="h-6 w-6" aria-hidden /></div>
									<h3 className="mt-4 text-xl font-bold">Customer</h3>
									<p className="mt-2 text-sm text-black/50">Owns wallet, identity, memberships, Store Credit, and Reward PT.</p>
								</div>
								<div className="flex items-center justify-center gap-2 text-[#2f73e0] md:flex-col">
									<ArrowRight className="h-7 w-7 md:rotate-0" aria-hidden />
									<span className="text-xs font-black uppercase tracking-[0.18em]">Direct value</span>
									<ArrowRight className="h-7 w-7 rotate-180 md:rotate-180" aria-hidden />
								</div>
								<div className="rounded-3xl bg-white p-6 text-center shadow-sm">
									<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f5ecff] text-[#8d3a8b]"><Store className="h-6 w-6" aria-hidden /></div>
									<h3 className="mt-4 text-xl font-bold">Merchant</h3>
									<p className="mt-2 text-sm text-black/50">Owns the program, connected payment account, rules, and customer relationship.</p>
								</div>
							</div>
							<div className="mt-4 rounded-3xl bg-[#171717] p-6 text-white sm:flex sm:items-center sm:justify-between sm:gap-8">
								<div>
									<p className="text-xs font-black uppercase tracking-[0.18em] text-[#78a9ff]">Beamio protocol layer</p>
									<p className="mt-2 text-sm leading-6 text-white/60">Applications · authorization checks · transaction routing · gas sponsorship · program tooling</p>
								</div>
								<div className="mt-5 flex shrink-0 flex-wrap gap-2 sm:mt-0">
									{['No pooled merchant funds', 'No Beamio-issued IOU', 'No user private keys'].map((item) => (
										<span key={item} className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-bold text-white/75">{item}</span>
									))}
								</div>
							</div>
						</div>
						<p className="mx-auto mt-5 max-w-3xl text-center text-xs leading-5 text-black/45">
							Card payments still use Stripe as the payment processor, and supported cross-chain flows use their documented contracts. “Direct” describes asset ownership and the merchant–customer relationship; it does not erase those disclosed technical service providers.
						</p>
					</div>
				</section>

				<section className="border-y border-black/10 bg-[#f5f5f2] py-20 sm:py-28">
					<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
						<div className="max-w-3xl">
							<p className="text-xs font-black uppercase tracking-[0.2em] text-[#2f73e0]">One relationship, three applications</p>
							<h2 className="mt-5 text-4xl font-black leading-[0.96] tracking-[-0.055em] sm:text-6xl">From discovery to counter to control room.</h2>
						</div>
						<div className="mt-14 grid gap-5 lg:grid-cols-3">
							<article className="flex flex-col rounded-[2rem] bg-white p-6 shadow-sm sm:p-8">
								<div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e9edff] text-[#0051d1]"><Wallet className="h-5 w-5" aria-hidden /></div>
								<p className="mt-8 text-xs font-black uppercase tracking-[0.18em] text-black/35">For customers</p>
								<h3 className="mt-2 text-2xl font-bold">Beamio Consumer</h3>
								<p className="mt-3 flex-1 text-sm leading-6 text-black/60">A self-custody wallet for merchant discovery, memberships, coupons, Store Credit, Reward PT, and direct relationships.</p>
								<div className="mt-7 space-y-3">
									<StoreBadges appStore={consumerStoreLinks.appStore} googlePlay={consumerStoreLinks.googlePlay} />
									<a href={consumerStoreLinks.apk} download className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#2f73e0]/20 bg-[#e9edff] px-4 py-3 text-sm font-bold text-[#0051d1]"><Download className="h-4 w-4" aria-hidden /> Download Android APK</a>
									<ExternalLink href="https://beamio.app/app/" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0051d1] px-4 py-3 text-sm font-bold text-white">Open Consumer App <ArrowUpRight className="h-4 w-4" aria-hidden /></ExternalLink>
								</div>
							</article>

							<article className="flex flex-col rounded-[2rem] bg-white p-6 shadow-sm sm:p-8">
								<div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-700"><CreditCard className="h-5 w-5" aria-hidden /></div>
								<p className="mt-8 text-xs font-black uppercase tracking-[0.18em] text-black/35">For the counter</p>
								<h3 className="mt-2 text-2xl font-bold">Beamio POS</h3>
								<p className="mt-3 flex-1 text-sm leading-6 text-black/60">An authorized Soft POS for Charge, Top-up, membership, redeem, Stripe Terminal, Tap to Pay, and compatible readers.</p>
								<div className="mt-7 space-y-3">
									<StoreBadges appStore={posStoreLinks.appStore} googlePlay={posStoreLinks.googlePlay} />
									<a href={posStoreLinks.apk} download className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#2f73e0]/20 bg-[#e9edff] px-4 py-3 text-sm font-bold text-[#0051d1]"><Download className="h-4 w-4" aria-hidden /> Download Android APK</a>
									<ExternalLink href="https://pos.beamio.app/" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0051d1] px-4 py-3 text-sm font-bold text-white">Open Beamio POS <ArrowUpRight className="h-4 w-4" aria-hidden /></ExternalLink>
								</div>
							</article>

							<article className="flex flex-col rounded-[2rem] bg-[#171717] p-6 text-white shadow-sm sm:p-8">
								<div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#8d3a8b] text-white"><Store className="h-5 w-5" aria-hidden /></div>
								<p className="mt-8 text-xs font-black uppercase tracking-[0.18em] text-white/35">For merchants</p>
								<h3 className="mt-2 text-2xl font-bold">Beamio Merchant OS</h3>
								<p className="mt-3 flex-1 text-sm leading-6 text-white/60">The browser control plane for programs, Stripe connections, Reward PT rules, staff, terminals, issued assets, and operations.</p>
								<div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
									<div className="flex items-start gap-3">
										<Globe2 className="mt-0.5 h-5 w-5 shrink-0 text-purple-300" aria-hidden />
										<div><p className="text-sm font-bold">No installation required</p><p className="mt-1 text-xs leading-5 text-white/50">Use Merchant OS from a modern desktop or tablet browser.</p></div>
									</div>
								</div>
								<ExternalLink href="https://biz.beamio.app/" className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#8d3a8b] px-4 py-3 text-sm font-bold text-white">Access Merchant OS <ArrowUpRight className="h-4 w-4" aria-hidden /></ExternalLink>
							</article>
						</div>
					</div>
				</section>

				<section className="bg-[#171717] py-20 text-white sm:py-28">
					<div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
						<div className="rounded-[2.25rem] bg-[#2f73e0] p-8 sm:p-12">
							<div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
								<div>
									<div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-blue-100"><HeartHandshake className="h-4 w-4" aria-hidden /> Build a direct merchant economy</div>
									<h2 className="mt-4 text-4xl font-black leading-[0.96] tracking-[-0.05em] sm:text-5xl">Settlement, loyalty, and ownership—without a payment middleman.</h2>
									<p className="mt-5 max-w-2xl text-sm leading-6 text-blue-100/80">Start with Merchant OS, explore the Consumer experience, or read the product whitepaper and trust boundaries.</p>
								</div>
								<div className="flex flex-col gap-3">
									<ExternalLink href="https://biz.beamio.app/" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-[#0051d1]">Start as a merchant <ArrowRight className="h-4 w-4" aria-hidden /></ExternalLink>
									<ExternalLink href="https://gitbook.conet.network/applications/beamio.html" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-5 py-3 text-sm font-bold text-white">Read the whitepaper <ArrowUpRight className="h-4 w-4" aria-hidden /></ExternalLink>
								</div>
							</div>
						</div>
					</div>
				</section>
			</main>

			<footer className="border-t border-white/10 bg-[#171717] text-white">
				<div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.2fr_1fr_1fr] lg:px-8">
					<div>
						<div className="flex items-center gap-2.5"><BeamioBrandLogo className="h-9 w-9 rounded-xl" /><span className="font-bold">Beamio</span></div>
						<p className="mt-4 max-w-sm text-sm leading-6 text-white/45">Direct settlement, merchant programs, and customer relationships built with CoNET infrastructure.</p>
					</div>
					<div>
						<h2 className="text-sm font-semibold">Products</h2>
						<div className="mt-3 flex flex-col items-start gap-2 text-sm text-white/45">
							<ExternalLink href="https://beamio.app/app/" className="hover:text-white">Consumer App</ExternalLink>
							<ExternalLink href="https://pos.beamio.app/" className="hover:text-white">Beamio POS</ExternalLink>
							<ExternalLink href="https://biz.beamio.app/" className="hover:text-white">Merchant OS</ExternalLink>
						</div>
					</div>
					<div>
						<h2 className="text-sm font-semibold">Company & protocol</h2>
						<div className="mt-3 flex flex-col items-start gap-2 text-sm text-white/45">
							<ExternalLink href="https://conet.network/" className="hover:text-white">CoNET</ExternalLink>
							<Link to="/contact" className="hover:text-white">Contact</Link>
							<Link to="/terms" className="hover:text-white">Terms</Link>
							<Link to="/privacy" className="hover:text-white">Privacy</Link>
						</div>
					</div>
				</div>
				<div className="border-t border-white/10 px-4 py-5 text-center text-xs text-white/35">© {new Date().getFullYear()} Beamio. Product availability may vary by account, device, and region.</div>
			</footer>
		</div>
	)
}
