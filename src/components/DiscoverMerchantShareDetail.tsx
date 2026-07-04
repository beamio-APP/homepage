import React, { useEffect, useMemo, useState } from 'react'
import {
	Building2,
	Calendar,
	Clock,
	Clapperboard,
	Dumbbell,
	ExternalLink,
	GraduationCap,
	Heart,
	HeartPulse,
	Loader2,
	MapPin,
	Phone,
	Radio,
	Share2,
	Store,
	UtensilsCrossed,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { CouponClaimShareMeta } from '../utils/couponClaimShare'
import {
	couponExpiryUsesUrgentVariant,
	shouldShowCouponExpiryPill,
} from '../utils/couponClaimShare'
import {
	formatProgramSocialStatCount,
	mergeCardProgramSocialSummary,
	type CardProgramSocialSummary,
} from '../utils/cardProgramSocialStats'
import { resolveBeamioUserCardAddressExplorerUrl } from '../utils/beamioUserCardChain'
import {
	hasDiscoverMerchantAboutPanel,
	type DiscoverMerchantInfoPanel,
} from '../utils/discoverMerchantInfoPanel'
import {
	loadDiscoverMerchantLanding,
	type DiscoverMerchantCouponPreview,
	type DiscoverMerchantLandingModel,
	type DiscoverMerchantTierPreview,
} from '../utils/discoverMerchantLandingData'

const TIER_MEDALS = ['🥉', '🥈', '🥇', '💎'] as const

const CATEGORY_ICONS: Record<string, LucideIcon> = {
	'food-beverage': UtensilsCrossed,
	retail: Store,
	'education-training': GraduationCap,
	'health-beauty': HeartPulse,
	'fitness-wellness': Dumbbell,
	'entertainment-leisure': Clapperboard,
	'local-services': Building2,
}

function shortAddress(address: string): string {
	const t = address.trim()
	if (t.length < 12) return t
	return `${t.slice(0, 6)}…${t.slice(-4)}`
}

function categoryIconForId(categoryId: string | null): LucideIcon {
	if (!categoryId) return Building2
	return CATEGORY_ICONS[categoryId] ?? Building2
}

function HeroStatCapsules({ stats }: { stats: CardProgramSocialSummary | null }) {
	if (!stats || (stats.likeCount == null && stats.shareClickCount == null)) return null
	return (
		<div className="mt-3 flex flex-wrap items-center gap-2">
			{stats.likeCount != null ? (
				<span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/30 bg-white/15 px-2.5 py-1 text-[12px] font-semibold text-white backdrop-blur-sm">
					<Heart className="h-3.5 w-3.5 text-rose-300" strokeWidth={2.25} fill="currentColor" aria-hidden />
					{formatProgramSocialStatCount(stats.likeCount)}
				</span>
			) : null}
			{stats.shareClickCount != null ? (
				<span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/30 bg-white/15 px-2.5 py-1 text-[12px] font-semibold text-white backdrop-blur-sm">
					<Share2 className="h-3.5 w-3.5 text-sky-200" strokeWidth={2.25} aria-hidden />
					{formatProgramSocialStatCount(stats.shareClickCount)}
				</span>
			) : null}
		</div>
	)
}

function DiscoverMerchantCardAddressCapsule({ address }: { address: string }) {
	const explorerUrl = useMemo(() => resolveBeamioUserCardAddressExplorerUrl(address), [address])

	return (
		<a
			href={explorerUrl}
			target="_blank"
			rel="noopener noreferrer"
			className="mt-2 inline-flex max-w-full items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-2.5 py-1 text-[12px] font-semibold text-white/90 backdrop-blur-sm transition hover:bg-white/25"
			aria-label={`View contract on CoNET Scan: ${address}`}
		>
			<span className="truncate">{shortAddress(address)}</span>
			<ExternalLink className="h-3 w-3 shrink-0 opacity-80" strokeWidth={2} aria-hidden />
		</a>
	)
}

function CouponBannerImage({ src }: { src: string }) {
	return (
		<div className="absolute inset-0 overflow-hidden">
			<div
				className="absolute inset-y-0 left-0 w-1/2 scale-110 bg-cover bg-left bg-no-repeat blur-xl"
				style={{ backgroundImage: `url("${src}")` }}
				aria-hidden
			/>
			<div
				className="absolute inset-y-0 right-0 w-1/2 scale-110 bg-cover bg-right bg-no-repeat blur-xl"
				style={{ backgroundImage: `url("${src}")` }}
				aria-hidden
			/>
			<img
				src={src}
				alt=""
				className="absolute left-1/2 top-0 z-[1] h-full w-auto max-w-none -translate-x-1/2 object-contain"
				draggable={false}
			/>
		</div>
	)
}

/**
 * Align SilentPassUI Discover `ActiveCouponTicketItem` + `metadataBelowBackgroundImage`:
 * - With banner: image only in ticket; title / subtitle / expiry below.
 * - Without banner: icon + title + subtitle + expiry inside ticket (white text).
 */
function DiscoverShareCouponTicket({ coupon }: { coupon: DiscoverMerchantCouponPreview }) {
	const hasBanner = Boolean(coupon.backgroundImage?.trim())
	const showExpiry = shouldShowCouponExpiryPill(coupon.expiresLabel)
	const expiryUrgent = couponExpiryUsesUrgentVariant(coupon.expiresLabel)
	const ExpiryIcon = expiryUrgent ? Clock : Calendar
	const title = coupon.title.trim() || 'Coupon'
	const subtitle = coupon.subtitle.trim()
	const iconUrl = hasBanner ? '' : coupon.iconUrl.trim()
	const copyBelowBanner = hasBanner

	const expiryPillInner = (
		<div
			className={`inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${
				expiryUrgent
					? 'bg-red-600 text-white shadow-sm shadow-red-900/25'
					: 'border border-white/25 bg-slate-950/65 text-white shadow-sm shadow-black/20 backdrop-blur-md'
			}`}
		>
			<ExpiryIcon className="h-3 w-3 shrink-0" strokeWidth={2.5} aria-hidden />
			<span className="truncate">{coupon.expiresLabel}</span>
		</div>
	)

	const expiryPillExternal = (
		<div
			className={`inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${
				expiryUrgent
					? 'bg-red-600 text-white shadow-sm shadow-red-900/25'
					: 'border border-[#abadaf]/35 bg-[#eef1f3] text-[#595c5e]'
			}`}
		>
			<ExpiryIcon className="h-3 w-3 shrink-0" strokeWidth={2.5} aria-hidden />
			<span className="truncate">{coupon.expiresLabel}</span>
		</div>
	)

	const ticketShell = (
		<div className="relative w-full min-w-0 rounded-[1.75rem]">
			<div
				className="pointer-events-none absolute left-0 top-1/2 z-20 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
				aria-hidden
			/>
			<div
				className="pointer-events-none absolute right-0 top-1/2 z-20 h-9 w-9 translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
				aria-hidden
			/>
			<div className="relative min-h-[7.5rem] overflow-hidden rounded-[1.75rem] ring-1 ring-black/[0.08]">
				{hasBanner ? (
					<CouponBannerImage src={coupon.backgroundImage} />
				) : (
					<>
						<div
							className="absolute inset-0"
							style={{ backgroundColor: coupon.backgroundColorHex || '#2B2E3A' }}
						/>
						<div
							className="pointer-events-none absolute inset-0 opacity-[0.12]"
							style={{
								backgroundImage:
									'repeating-linear-gradient(-26deg, #fff 0, #fff 1px, transparent 1px, transparent 8px)',
							}}
							aria-hidden
						/>
						<div
							className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-black/30"
							aria-hidden
						/>
					</>
				)}

				{!copyBelowBanner ? (
					<div className="relative z-[1] flex min-h-[7.5rem] items-center gap-3 px-7 py-4 sm:gap-4 sm:px-8 sm:py-5">
						{iconUrl ? (
							<div className="relative flex h-[3.35rem] w-[3.35rem] shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white/40 bg-white/95 shadow-md ring-2 ring-black/10 sm:h-14 sm:w-14">
								<img
									src={iconUrl}
									alt=""
									className="h-full w-full object-cover"
									draggable={false}
								/>
							</div>
						) : null}
						<div className="font-manrope min-w-0 flex-1 text-white">
							<p className="truncate text-[1.05rem] font-extrabold leading-tight tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)] sm:text-lg">
								{title}
							</p>
							{subtitle ? (
								<p className="mt-0.5 line-clamp-2 text-sm font-semibold text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]">
									{subtitle}
								</p>
							) : null}
							{showExpiry ? <div className="mt-2">{expiryPillInner}</div> : null}
						</div>
					</div>
				) : null}
			</div>
		</div>
	)

	return (
		<div className="space-y-1.5">
			<div className="relative w-full min-w-0 px-[18px]">{ticketShell}</div>
			{copyBelowBanner ? (
				<div className="px-1">
					<p className="font-manrope text-[1.05rem] font-extrabold leading-tight text-[#2c2f31]">
						{title}
					</p>
					{subtitle ? (
						<p className="mt-0.5 font-manrope text-sm font-semibold leading-snug text-[#595c5e] line-clamp-2">
							{subtitle}
						</p>
					) : null}
					{showExpiry ? <div className="mt-2">{expiryPillExternal}</div> : null}
				</div>
			) : null}
			{coupon.supplySummary ? (
				<p className="line-clamp-1 px-1 text-[11px] font-semibold text-slate-500">
					{coupon.supplySummary}
				</p>
			) : null}
		</div>
	)
}

function RewardTierRow({
	tier,
	index,
	total,
}: {
	tier: DiscoverMerchantTierPreview
	index: number
	total: number
}) {
	const medal = TIER_MEDALS[Math.min(index, TIER_MEDALS.length - 1)]
	const isTop = index === total - 1
	return (
		<div
			className={[
				'flex items-center justify-between gap-3 rounded-xl border border-transparent bg-white p-3.5',
				isTop ? 'ring-1 ring-[#1562f0]/10' : '',
			].join(' ')}
		>
			<div className="flex min-w-0 items-center gap-3">
				<div className="text-2xl" aria-hidden>
					{medal}
				</div>
				<div className="min-w-0">
					<h4 className="truncate text-[15px] font-bold text-[#1f2328]">{tier.name}</h4>
					<p className="text-[14px] font-bold tracking-tight text-[#1f2328]">{tier.thresholdLabel}</p>
				</div>
			</div>
			<p
				className={[
					'shrink-0 text-right text-[14px] font-bold',
					tier.discountLabel.includes('%') && isTop ? 'text-[#1562f0]' : 'text-[#1f2328]',
				].join(' ')}
			>
				{tier.discountLabel}
			</p>
		</div>
	)
}

function DiscoverMerchantInfoPanelCard({ panel }: { panel: DiscoverMerchantInfoPanel }) {
	const rows = [
		{ label: 'Opening Hours', value: panel.openingHours, Icon: Clock },
		{ label: 'Contact', value: panel.contact, Icon: Phone },
		{ label: 'Location', value: panel.location, Icon: MapPin },
	] as const

	return (
		<div className="rounded-[22px] bg-[#eef1f4] p-4">
			<h2 className="text-[16px] font-bold text-[#1f2328]">{panel.aboutTitle}</h2>
			{panel.aboutText?.trim() ? (
				<p className="mt-2 text-[14px] leading-relaxed text-slate-600">{panel.aboutText}</p>
			) : null}
			<div className="mt-5 space-y-4">
				{rows.map(({ label, value, Icon }) => (
					<div key={label} className="flex gap-3">
						<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1562f0]">
							<Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
						</span>
						<div className="min-w-0 flex-1">
							<p className="text-[14px] font-bold text-[#1f2328]">{label}</p>
							<p className="mt-0.5 whitespace-pre-line text-[14px] leading-snug text-slate-600">
								{value?.trim() || '—'}
							</p>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}

type DiscoverMerchantShareDetailProps = {
	cardAddress: string
	shareMeta: CouponClaimShareMeta
	socialStats?: CardProgramSocialSummary | null
}

export function DiscoverMerchantShareDetail({
	cardAddress,
	shareMeta,
	socialStats,
}: DiscoverMerchantShareDetailProps) {
	const [model, setModel] = useState<DiscoverMerchantLandingModel | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		let cancelled = false
		setLoading(true)
		void loadDiscoverMerchantLanding(cardAddress, shareMeta).then((loaded) => {
			if (cancelled) return
			if (loaded) setModel(loaded)
			setLoading(false)
		})
		return () => {
			cancelled = true
		}
	}, [cardAddress, shareMeta])

	const view: DiscoverMerchantLandingModel = model ?? {
		cardAddress,
		title: shareMeta.title,
		subtitle: shareMeta.subtitle,
		programName: shareMeta.merchantName ?? shareMeta.title,
		heroImage: shareMeta.backgroundImage,
		logoUrl: shareMeta.iconUrl || null,
		currency: 'USD',
		categoryId: null,
		merchantInfoPanel: null,
		coupons: null,
		rewardTiers: null,
		socialStats: socialStats ?? null,
		rechargeBonusPill: null,
	}

	const mergedStats = mergeCardProgramSocialSummary(socialStats, view.socialStats)
	const MerchantCategoryIcon = categoryIconForId(view.categoryId)
	const passTitle = view.programName.trim() || view.title

	return (
		<div className="w-full min-w-0 text-left text-[#1f2328]">
			<div className="relative shrink-0">
				<div className="relative h-[min(42vh,320px)] w-full overflow-hidden rounded-b-[28px]">
					{view.heroImage ? (
						<img
							src={view.heroImage}
							alt=""
							className="absolute inset-0 h-full w-full object-cover"
							draggable={false}
						/>
					) : (
						<div
							className="absolute inset-0"
							style={{ backgroundColor: shareMeta.backgroundColorHex || '#0f172a' }}
						/>
					)}
					<div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/30" />
					<div className="absolute bottom-0 left-0 right-0 z-10 px-5 pb-5 pt-8">
						<div className="mb-1 flex items-center gap-2">
							<span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm">
								<MerchantCategoryIcon className="h-5 w-5" strokeWidth={2} aria-hidden />
							</span>
						</div>
						<h1 className="text-2xl font-bold leading-tight text-white drop-shadow-sm">{view.title}</h1>
						<p className="mt-1 line-clamp-2 text-[15px] font-medium text-white/90">{view.subtitle}</p>
						<HeroStatCapsules stats={mergedStats} />
						<DiscoverMerchantCardAddressCapsule address={view.cardAddress} />
					</div>
				</div>
			</div>

			<div className="mx-auto max-w-lg px-4 pb-8 pt-4">
				<div className="space-y-4">
					{view.merchantInfoPanel ? (
						<div className="rounded-[22px] bg-white p-4 shadow-[0_8px_22px_rgba(15,23,42,0.06)] ring-1 ring-[#e8ecf0]">
							<h2 className="text-[18px] font-bold leading-snug text-[#1f2328]">
								{view.merchantInfoPanel.welcomeTitle}
							</h2>
							{view.merchantInfoPanel.welcomeText?.trim() ? (
								<p className="mt-2 text-[14px] leading-relaxed text-slate-600">
									{view.merchantInfoPanel.welcomeText}
								</p>
							) : null}
						</div>
					) : null}

					<div className="rounded-[22px] bg-white p-5 shadow-[0_8px_22px_rgba(15,23,42,0.06)] ring-1 ring-[#e8ecf0]">
						<div className="flex items-start justify-between gap-3">
							<div className="min-w-0 flex-1">
								<h3 className="truncate text-[17px] font-semibold leading-snug text-[#1f2328]">
									{passTitle}
								</h3>
							</div>
							<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1562f0] text-white shadow-sm">
								<Radio className="h-5 w-5" strokeWidth={2} aria-hidden />
							</span>
						</div>
						<div className="mt-5">
							<p className="text-center text-[14px] font-medium text-slate-500">Available Balance</p>
						</div>
						<p className="mt-1 text-center text-[15px] font-semibold leading-relaxed text-[#1562f0]">
							Open Beamio to view your balance and top up
						</p>
					</div>

					<div className="space-y-4">
						<h2 className="text-lg font-bold text-[#1f2328]">Available Offers</h2>

						<div className="rounded-[22px] bg-white px-6 py-4 shadow-[0_8px_22px_rgba(15,23,42,0.06)] ring-1 ring-[#e8ecf0] sm:px-7">
							<header className="mb-3 flex items-center justify-between gap-2">
								<h3 className="text-base font-bold text-[#1f2328]">Coupons</h3>
								{view.coupons != null ? (
									<span className="rounded-full border border-[#1562f0]/15 bg-[#1562f0]/10 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#1562f0]">
										{view.coupons.length.toLocaleString()} total
									</span>
								) : null}
							</header>
							{loading && view.coupons == null ? (
								<div className="flex items-center justify-center gap-2 py-6 text-slate-500">
									<Loader2 className="h-5 w-5 animate-spin" strokeWidth={2} aria-hidden />
									<span className="text-[14px] font-medium">Loading coupons…</span>
								</div>
							) : view.coupons != null && view.coupons.length > 0 ? (
								<div className="space-y-4">
									{view.coupons.map((coupon) => (
										<DiscoverShareCouponTicket key={coupon.id} coupon={coupon} />
									))}
								</div>
							) : (
								<div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/80 p-4 text-center text-[13px] font-medium text-slate-500">
									No coupons available yet.
								</div>
							)}
						</div>

						<div className="rounded-[22px] bg-[#eef1f3] p-4 sm:p-5">
							<header className="mb-3 flex items-center justify-between gap-2">
								<h3 className="text-base font-bold text-[#1f2328]">Reward Tiers</h3>
								{view.rewardTiers != null ? (
									<span className="rounded-full border border-[#1562f0]/15 bg-white px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#1562f0]">
										{view.rewardTiers.length.toLocaleString()} reward tiers
									</span>
								) : null}
							</header>
							{loading && view.rewardTiers == null ? (
								<div className="flex items-center justify-center gap-2 py-6 text-slate-500">
									<Loader2 className="h-5 w-5 animate-spin" strokeWidth={2} aria-hidden />
									<span className="text-[14px] font-medium">Loading reward tiers…</span>
								</div>
							) : view.rewardTiers != null && view.rewardTiers.length > 0 ? (
								<div className="space-y-2.5">
									{view.rewardTiers.map((tier, index) => (
										<RewardTierRow
											key={`${tier.name}-${tier.thresholdLabel}`}
											tier={tier}
											index={index}
											total={view.rewardTiers!.length}
										/>
									))}
								</div>
							) : (
								<div className="rounded-xl border border-dashed border-slate-300 bg-white/80 p-4 text-center text-[13px] font-medium text-slate-500">
									No reward tiers configured yet.
								</div>
							)}
						</div>
					</div>

					{view.merchantInfoPanel && hasDiscoverMerchantAboutPanel(view.merchantInfoPanel) ? (
						<DiscoverMerchantInfoPanelCard panel={view.merchantInfoPanel} />
					) : view.merchantInfoPanel?.aboutText?.trim() ? (
						<div className="rounded-[22px] bg-[#eef1f4] p-4">
							<h2 className="text-[16px] font-bold text-[#1f2328]">
								{view.merchantInfoPanel.aboutTitle}
							</h2>
							<p className="mt-2 text-[14px] leading-relaxed text-slate-600">
								{view.merchantInfoPanel.aboutText}
							</p>
							{view.merchantInfoPanel.location?.trim() ? (
								<div className="mt-4 flex gap-3">
									<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1562f0]">
										<MapPin className="h-5 w-5" strokeWidth={2} aria-hidden />
									</span>
									<div className="min-w-0 flex-1">
										<p className="text-[14px] font-bold text-[#1f2328]">Location</p>
										<p className="mt-0.5 whitespace-pre-line text-[14px] leading-snug text-slate-600">
											{view.merchantInfoPanel.location}
										</p>
									</div>
								</div>
							) : null}
						</div>
					) : null}
				</div>
			</div>
		</div>
	)
}
