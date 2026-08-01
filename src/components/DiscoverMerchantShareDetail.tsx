import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
	AlertTriangle,
	Building2,
	Calendar,
	Check,
	Clock,
	Clapperboard,
	Dumbbell,
	ExternalLink,
	Gift,
	GraduationCap,
	Heart,
	HeartPulse,
	Loader2,
	MapPin,
	Phone,
	Radio,
	Share2,
	Store,
	Ticket,
	UtensilsCrossed,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { CouponClaimShareMeta } from '../utils/couponClaimShare'
import {
	couponExpiryUsesUrgentVariant,
	shouldShowCouponExpiryPill,
} from '../utils/couponClaimShare'
import { appendAppDownloadShareCacheBust } from '../utils/appDownloadShareCacheBust'
import { CouponTicketAddressMetaRow } from './CouponTicketAddressMetaRow'
import { ethers } from 'ethers'
import {
	formatProgramSocialStatCount,
	fetchCouponProgramSocialSummary,
	mergeCardProgramSocialSummary,
	type CardProgramSocialSummary,
} from '../utils/cardProgramSocialStats'
import { resolveBeamioUserCardAddressExplorerUrl } from '../utils/beamioUserCardChain'
import {
	discoverAboutDetailForDisplay,
	discoverMerchantAboutPanelForDisplay,
	hasDiscoverMerchantAboutPanel,
	resolveDiscoverWelcomePanelCopy,
	type DiscoverMerchantInfoPanel,
} from '../utils/discoverMerchantInfoPanel'
import {
	loadDiscoverMerchantLanding,
	type DiscoverMerchantCouponPreview,
	type DiscoverMerchantCouponSeriesRow,
	type DiscoverMerchantLandingModel,
	type DiscoverMerchantTierPreview,
} from '../utils/discoverMerchantLandingData'
import {
	type CouponOpenClaimEligibility,
	postCardCouponOpenClaimWithWallet,
	resolveCouponOpenClaimEligibility,
} from '../utils/discoverCouponOpenClaim'
import {
	prepareVisitWalletForOpenClaim,
	provisionWebShareVisitWallet,
} from '../utils/beamioWebShareWallet'
import { buildDiscoverActivePromotionsPanelModel, resolveCouponSocialMissionBlockForSeries } from '../utils/discoverMerchantPromotions'
import { DiscoverMerchantActivePromotionsPanel } from './DiscoverMerchantActivePromotionsPanel'
import { DiscoverOfferSocialMissionTrigger } from './DiscoverOfferSocialMissionTrigger'
import { readCardSocialPromotionFromChain } from '../utils/discoverMerchantSocialPromotionChain'
import { readUserSocialPoints13BalanceOnCard } from '../utils/discoverUserSocialPoints13'
import {
	fetchDiscoverIssuerProfile,
	formatBeamioTagDisplayLine,
	issuerAvatarSrc,
	type DiscoverIssuerProfile,
} from '../utils/discoverIssuerProfile'
import { DiscoverMerchantSocialPointsCard } from './DiscoverMerchantSocialPointsCard'

const TIER_MEDALS = ['🥉', '🥈', '🥇', '💎'] as const

/** POS Claim button — orange→red gradient + white gift icon (SilentPassUI parity). */
const POS_CLAIM_GRADIENT =
	'linear-gradient(to bottom right, rgb(255,132,36), rgb(255,71,87))'

type DiscoverCouponClaimButtonStatus = 'idle' | 'loading' | 'success' | 'error'

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

function DiscoverMerchantWelcomePanel({ title, body }: { title: string; body: string }) {
	return (
		<div className="rounded-[22px] bg-white p-4 shadow-[0_8px_22px_rgba(15,23,42,0.06)] ring-1 ring-[#e8ecf0]">
			<h2 className="text-[18px] font-bold leading-snug text-[#1f2328]">{title}</h2>
			<DiscoverAboutDetailBody text={body} className=" mt-2" />
		</div>
	)
}

function DiscoverAboutDetailBody({ text, className = '' }: { text: string; className?: string }) {
	const normalized = discoverAboutDetailForDisplay(text)
	const paragraphs = normalized.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
	if (paragraphs.length <= 1) {
		return (
			<p className={`whitespace-pre-line text-[14px] leading-relaxed text-slate-600${className}`}>
				{normalized}
			</p>
		)
	}
	return (
		<div className={`space-y-3${className}`}>
			{paragraphs.map((paragraph, index) => (
				<p key={`about-paragraph-${index}`} className="whitespace-pre-line text-[14px] leading-relaxed text-slate-600">
					{paragraph}
				</p>
			))}
		</div>
	)
}

function DiscoverMerchantOwnerTagCapsule({
	profile,
	ownerEoa,
	loading,
}: {
	profile: DiscoverIssuerProfile | null
	ownerEoa: string
	loading?: boolean
}) {
	const tagLine = formatBeamioTagDisplayLine(profile?.username ?? '')
	const avatarSrc = issuerAvatarSrc(profile, ownerEoa)
	return (
		<div
			className="inline-flex max-w-[min(100%,14rem)] min-w-0 shrink-0 items-center gap-1.5 rounded-full border border-white/25 bg-white/15 py-1 pl-1 pr-2.5 text-white shadow-sm backdrop-blur-sm"
			aria-label={`Merchant issuer ${tagLine}`}
		>
			<div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-white/30">
				{loading ? (
					<Loader2 className="h-4 w-4 animate-spin text-white/90" strokeWidth={2} aria-hidden />
				) : (
					<img src={avatarSrc} alt="" className="h-full w-full object-cover" draggable={false} />
				)}
			</div>
			<span className="truncate text-[13px] font-bold leading-none">{tagLine}</span>
		</div>
	)
}

function HeroStatCapsules({ stats }: { stats: CardProgramSocialSummary | null }) {
	if (!stats || (stats.likeCount == null && stats.shareClickCount == null)) return null
	return (
		<div className="mt-3 flex w-full flex-wrap items-center gap-2">
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
 * - With banner: image only in ticket; title / subtitle / address-meta / expiry below.
 * - Without banner: icon + title + subtitle + address-meta + expiry inside ticket (white text).
 */
function DiscoverShareCouponTicket({
	coupon,
	showActionButton = false,
	actionStatus = 'idle',
	actionKind = 'gift',
	actionError,
	actionDisabled = false,
	onAction,
}: {
	coupon: DiscoverMerchantCouponPreview
	showActionButton?: boolean
	actionStatus?: DiscoverCouponClaimButtonStatus
	/** Terminal status chrome when claimed / redeemed. */
	actionKind?: 'gift' | 'claimed' | 'redeemed'
	actionError?: string
	actionDisabled?: boolean
	onAction?: () => void
}) {
	const hasBanner = Boolean(coupon.backgroundImage?.trim())
	const showExpiry = shouldShowCouponExpiryPill(coupon.expiresLabel)
	const expiryUrgent = couponExpiryUsesUrgentVariant(coupon.expiresLabel)
	const ExpiryIcon = expiryUrgent ? Clock : Calendar
	const title = coupon.title.trim() || 'Coupon'
	const subtitle = coupon.subtitle.trim()
	const iconUrl = hasBanner ? '' : coupon.iconUrl.trim()
	const copyBelowBanner = hasBanner

	const claimShareUrl = useMemo(() => {
		const addr = coupon.cardAddress?.trim() ?? ''
		const cid = coupon.couponId?.trim() ?? ''
		if (!addr || !cid || !ethers.isAddress(addr)) return ''
		try {
			const claimUrl = `https://beamio.app/app/?beamiocard=${encodeURIComponent(
				ethers.getAddress(addr),
			)}&couponId=${encodeURIComponent(cid)}&claim=open`
			const base = `https://beamio.app/app-download?target=${encodeURIComponent(claimUrl)}`
			return appendAppDownloadShareCacheBust(base)
		} catch {
			return ''
		}
	}, [coupon.cardAddress, coupon.couponId])

	const [socialStats, setSocialStats] = useState<CardProgramSocialSummary | null>(null)
	useEffect(() => {
		const card = coupon.cardAddress?.trim() ?? ''
		const tokenId = coupon.tokenId?.trim() ?? ''
		if (!card || !tokenId) return
		let cancelled = false
		void fetchCouponProgramSocialSummary(card, tokenId).then((summary) => {
			if (cancelled || !summary) return
			setSocialStats(summary)
		})
		return () => {
			cancelled = true
		}
	}, [coupon.cardAddress, coupon.tokenId])

	const addressMeta = (
		<CouponTicketAddressMetaRow
			cardAddress={coupon.cardAddress}
			tokenId={coupon.tokenId}
			shareUrl={claimShareUrl}
			shareTitle={title}
			supplySummary={coupon.supplySummary}
			likeCount={socialStats?.likeCount ?? null}
			shareClickCount={socialStats?.shareClickCount ?? null}
			variant={copyBelowBanner ? 'light' : 'onDark'}
			className={title || subtitle ? 'mt-1.5' : 'mt-0.5'}
		/>
	)

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
			<span className="truncate">
				{actionStatus === 'loading' ? 'CLAIMING…' : coupon.expiresLabel}
			</span>
		</div>
	)

	const claimActionAriaLabel =
		actionKind === 'redeemed'
			? 'Coupon already redeemed'
			: actionKind === 'claimed' || actionStatus === 'success'
				? 'Coupon claimed'
				: actionStatus === 'error'
					? actionError ?? 'Coupon claim failed'
					: 'Claim'

	const claimButton = showActionButton ? (
		<div className="pointer-events-auto absolute right-6 top-1/2 z-[2] -translate-y-1/2 sm:right-8">
			{actionKind === 'redeemed' ? (
				<span
					className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-400/50 bg-slate-100/90 shadow-sm ring-1 ring-slate-300/40 backdrop-blur-sm"
					aria-label={claimActionAriaLabel}
					title="Redeemed"
				>
					<Ticket className="h-4 w-4 text-slate-500" strokeWidth={2.25} aria-hidden />
				</span>
			) : actionKind === 'claimed' || actionStatus === 'success' ? (
				<span
					className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-emerald-500/40 bg-transparent shadow-sm ring-1 ring-emerald-500/15 backdrop-blur-sm"
					aria-label={claimActionAriaLabel}
					title="Claimed"
				>
					<Check className="h-4 w-4 text-emerald-500" strokeWidth={2.4} aria-hidden />
				</span>
			) : (
				<button
					type="button"
					disabled={actionDisabled}
					onClick={(e) => {
						e.stopPropagation()
						onAction?.()
					}}
					className="inline-flex items-center justify-center rounded-full px-2.5 py-1.5 transition-opacity active:scale-95 disabled:cursor-not-allowed disabled:opacity-55"
					style={{ background: POS_CLAIM_GRADIENT }}
					title={actionStatus === 'error' ? actionError : undefined}
					aria-label={claimActionAriaLabel}
				>
					{actionStatus === 'loading' ? (
						<Loader2 className="h-4 w-4 animate-spin text-white" aria-hidden />
					) : actionStatus === 'error' ? (
						<AlertTriangle className="h-4 w-4 text-white" strokeWidth={2.4} aria-hidden />
					) : (
						<Gift className="h-4 w-4 text-white" strokeWidth={2} aria-hidden />
					)}
				</button>
			)}
		</div>
	) : null

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
					<div
						className={[
							'relative z-[1] flex min-h-[7.5rem] items-center gap-3 px-7 py-4 sm:gap-4 sm:px-8 sm:py-5',
							showActionButton ? 'pr-[6.25rem] sm:pr-[6.75rem]' : 'pr-7 sm:pr-8',
						].join(' ')}
					>
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
							{addressMeta}
							{showExpiry && !copyBelowBanner ? <div className="mt-2">{expiryPillInner}</div> : null}
						</div>
						{claimButton}
					</div>
				) : showActionButton ? (
					<div className="relative z-[1] flex min-h-[7.5rem] items-center pr-[6.25rem] sm:pr-[6.75rem]">
						{claimButton}
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
					{addressMeta}
					{showExpiry ? <div className="mt-2">{expiryPillExternal}</div> : null}
				</div>
			) : null}
		</div>
	)
}

function DiscoverShareCouponOfferRow({
	coupon,
	seriesRow,
	claimEligibility,
	claimStatus = 'idle',
	claimError,
	onClaim,
}: {
	coupon: DiscoverMerchantCouponPreview
	seriesRow: DiscoverMerchantCouponSeriesRow | null
	claimEligibility: CouponOpenClaimEligibility | undefined
	claimStatus?: DiscoverCouponClaimButtonStatus
	claimError?: string
	onClaim?: () => void
}) {
	const showClaimButton = claimEligibility != null && claimEligibility !== 'not_open_claim'
	const isAlreadyClaimed = claimEligibility === 'already_claimed'
	const isAlreadyRedeemed = claimEligibility === 'already_redeemed'
	const insufficientSocialPoints = claimEligibility === 'insufficient_social_points'
	const canClaim =
		claimEligibility === 'claimable' || claimEligibility === 'unknown'
	const claimDisabled =
		isAlreadyClaimed ||
		isAlreadyRedeemed ||
		insufficientSocialPoints ||
		!canClaim ||
		claimStatus !== 'idle'
	const ticketActionStatus: DiscoverCouponClaimButtonStatus =
		claimStatus !== 'idle'
			? claimStatus
			: isAlreadyClaimed || isAlreadyRedeemed
				? 'success'
				: 'idle'
	const ticketActionKind: 'gift' | 'claimed' | 'redeemed' = isAlreadyRedeemed
		? 'redeemed'
		: isAlreadyClaimed
			? 'claimed'
			: 'gift'

	const socialMissionBlock = useMemo(
		() =>
			resolveCouponSocialMissionBlockForSeries({
				title: coupon.title,
				metadata: seriesRow?.metadata ?? null,
				tokenId: coupon.tokenId,
			}),
		[coupon.title, coupon.tokenId, seriesRow?.metadata],
	)
	const showSocialMission = Boolean(socialMissionBlock?.user || socialMissionBlock?.referrer)

	return (
		<div className="space-y-1.5">
			<DiscoverShareCouponTicket
				coupon={coupon}
				showActionButton={showClaimButton}
				actionStatus={ticketActionStatus}
				actionKind={ticketActionKind}
				actionError={claimError}
				actionDisabled={claimDisabled}
				onAction={canClaim && !isAlreadyClaimed && !isAlreadyRedeemed ? onClaim : undefined}
			/>
			{insufficientSocialPoints ? (
				<p className="px-1 text-[11px] font-semibold text-amber-600">
					Not enough social points for this exchange.
				</p>
			) : null}
			{isAlreadyClaimed ? (
				<p className="px-1 text-[12px] font-medium text-emerald-600">
					You already claimed this coupon.
				</p>
			) : null}
			{isAlreadyRedeemed ? (
				<p className="px-1 text-[12px] font-medium text-slate-500">
					You already used this coupon.
				</p>
			) : null}
			{showSocialMission ? (
				<div className="flex flex-wrap items-center gap-2 px-1">
					<DiscoverOfferSocialMissionTrigger
						user={socialMissionBlock!.user}
						referrer={socialMissionBlock!.referrer}
					/>
				</div>
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
	const aboutTitle = panel.aboutTitle?.trim()
	const aboutText = panel.aboutText?.trim()
	const rows = (
		[
			{ label: 'Opening Hours', value: panel.openingHours, Icon: Clock },
			{ label: 'Contact', value: panel.contact, Icon: Phone },
			{ label: 'Location', value: panel.location, Icon: MapPin },
		] as const
	).filter((row) => row.value?.trim())

	return (
		<div className="rounded-[22px] bg-[#eef1f4] p-4">
			{aboutTitle || aboutText ? (
				<>
					{aboutTitle ? (
						<h2 className="text-[16px] font-bold text-[#1f2328]">{aboutTitle}</h2>
					) : null}
					{aboutText ? (
						<DiscoverAboutDetailBody text={aboutText} className={aboutTitle ? ' mt-2' : ''} />
					) : null}
				</>
			) : null}
			{rows.length > 0 ? (
				<div className={`space-y-4${aboutTitle || aboutText ? ' mt-5' : ''}`}>
					{rows.map(({ label, value, Icon }) => (
						<div key={label} className="flex gap-3">
							<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1562f0]">
								<Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
							</span>
							<div className="min-w-0 flex-1">
								<p className="text-[14px] font-bold text-[#1f2328]">{label}</p>
								<p className="mt-0.5 whitespace-pre-line text-[14px] leading-snug text-slate-600">
									{value?.trim()}
								</p>
							</div>
						</div>
					))}
				</div>
			) : null}
		</div>
	)
}

type DiscoverMerchantShareDetailProps = {
	cardAddress: string
	shareMeta: CouponClaimShareMeta
	socialStats?: CardProgramSocialSummary | null
	/** Visitor EOA from app-download wallet (shared IndexedDB with PWA). */
	userEoa?: string | null
	/** Sharer EOA from deep link `ref=`. */
	referrerEoa?: string | null
}

export function DiscoverMerchantShareDetail({
	cardAddress,
	shareMeta,
	socialStats,
	userEoa = null,
	referrerEoa = null,
}: DiscoverMerchantShareDetailProps) {
	const [model, setModel] = useState<DiscoverMerchantLandingModel | null>(null)
	const [loading, setLoading] = useState(true)
	const [issuerProfile, setIssuerProfile] = useState<DiscoverIssuerProfile | null>(null)
	const [issuerProfileLoading, setIssuerProfileLoading] = useState(false)
	const [chainCardSocialPromotion, setChainCardSocialPromotion] = useState<
		Awaited<ReturnType<typeof readCardSocialPromotionFromChain>> | undefined
	>(undefined)
	const [userSocialPoints13, setUserSocialPoints13] = useState<number | null>(null)
	const [userSocialPointsLoading, setUserSocialPointsLoading] = useState(false)
	const [couponClaimEligibilityById, setCouponClaimEligibilityById] = useState<
		Record<string, CouponOpenClaimEligibility>
	>({})
	const [couponClaimStatusById, setCouponClaimStatusById] = useState<
		Record<string, DiscoverCouponClaimButtonStatus>
	>({})
	const [couponClaimErrorById, setCouponClaimErrorById] = useState<Record<string, string>>({})
	const [visitAaReady, setVisitAaReady] = useState(false)
	const [aaPrepEpoch, setAaPrepEpoch] = useState(0)
	const walletBlobRef = useRef<Awaited<ReturnType<typeof provisionWebShareVisitWallet>>>(null)
	const couponClaimStatusTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

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

	// Block coupon Claim until CoNET AA has bytecode (setTimeout chain).
	useEffect(() => {
		let cancelled = false
		let timer: ReturnType<typeof setTimeout> | undefined
		setVisitAaReady(false)
		const tick = async () => {
			if (cancelled) return
			const prepared = await prepareVisitWalletForOpenClaim(walletBlobRef.current)
			if (cancelled) return
			if (prepared) {
				walletBlobRef.current = prepared.blob
				setVisitAaReady(true)
				return
			}
			timer = setTimeout(() => {
				void tick()
			}, 2000)
		}
		void tick()
		return () => {
			cancelled = true
			if (timer !== undefined) clearTimeout(timer)
		}
	}, [aaPrepEpoch])

	useEffect(() => {
		if (!cardAddress) {
			setChainCardSocialPromotion(undefined)
			return
		}
		let cancelled = false
		setChainCardSocialPromotion(undefined)
		void readCardSocialPromotionFromChain(cardAddress).then((promo) => {
			if (!cancelled) setChainCardSocialPromotion(promo)
		})
		return () => {
			cancelled = true
		}
	}, [cardAddress])

	useEffect(() => {
		if (!cardAddress || !userEoa) {
			setUserSocialPoints13(null)
			setUserSocialPointsLoading(false)
			return
		}
		let cancelled = false
		setUserSocialPointsLoading(true)
		void readUserSocialPoints13BalanceOnCard(cardAddress, userEoa)
			.then((bal) => {
				if (cancelled || bal == null) return
				const n = Number(bal)
				if (Number.isFinite(n) && n >= 0) setUserSocialPoints13(Math.trunc(n))
			})
			.finally(() => {
				if (!cancelled) setUserSocialPointsLoading(false)
			})
		return () => {
			cancelled = true
		}
	}, [cardAddress, userEoa])

	const couponSeriesByTokenId = useMemo(() => {
		const map = new Map<string, DiscoverMerchantCouponSeriesRow>()
		for (const row of model?.couponSeries ?? []) {
			const tokenId = String(row.tokenId ?? '').trim()
			if (tokenId) map.set(tokenId, row)
		}
		return map
	}, [model?.couponSeries])

	useEffect(() => {
		const coupons = model?.coupons
		if (!coupons?.length) {
			setCouponClaimEligibilityById({})
			return
		}
		let cancelled = false
		void (async () => {
			const entries = await Promise.all(
				coupons.map(async (coupon) => {
					const seriesRow = couponSeriesByTokenId.get(coupon.tokenId) ?? null
					if (!seriesRow) {
						return [coupon.id, 'not_open_claim' as const] as const
					}
					const eligibility = await resolveCouponOpenClaimEligibility(seriesRow, userEoa)
					return [coupon.id, eligibility] as const
				}),
			)
			if (!cancelled) setCouponClaimEligibilityById(Object.fromEntries(entries))
		})()
		return () => {
			cancelled = true
		}
	}, [model?.coupons, couponSeriesByTokenId, userEoa])

	useEffect(
		() => () => {
			for (const t of couponClaimStatusTimersRef.current.values()) clearTimeout(t)
			couponClaimStatusTimersRef.current.clear()
		},
		[],
	)

	const scheduleCouponClaimStatusReset = useCallback((rowId: string) => {
		const prev = couponClaimStatusTimersRef.current.get(rowId)
		if (prev) clearTimeout(prev)
		const timer = setTimeout(() => {
			setCouponClaimStatusById((s) => {
				if (s[rowId] !== 'success' && s[rowId] !== 'error') return s
				const next = { ...s }
				delete next[rowId]
				return next
			})
			setCouponClaimErrorById((s) => {
				if (!s[rowId]) return s
				const next = { ...s }
				delete next[rowId]
				return next
			})
			couponClaimStatusTimersRef.current.delete(rowId)
		}, 3000)
		couponClaimStatusTimersRef.current.set(rowId, timer)
	}, [])

	const handleDiscoverCouponClaim = useCallback(
		async (coupon: DiscoverMerchantCouponPreview) => {
			if (!visitAaReady) return
			const currentStatus = couponClaimStatusById[coupon.id] ?? 'idle'
			if (currentStatus !== 'idle') return

			setCouponClaimStatusById((s) => ({ ...s, [coupon.id]: 'loading' }))
			setCouponClaimErrorById((s) => {
				if (!s[coupon.id]) return s
				const next = { ...s }
				delete next[coupon.id]
				return next
			})

			try {
				const prepared = await prepareVisitWalletForOpenClaim(walletBlobRef.current)
				if (!prepared) {
					setVisitAaReady(false)
					setAaPrepEpoch((n) => n + 1)
					setCouponClaimStatusById((s) => ({ ...s, [coupon.id]: 'error' }))
					setCouponClaimErrorById((s) => ({
						...s,
						[coupon.id]: 'Smart Wallet is still preparing. Please wait and try again.',
					}))
					scheduleCouponClaimStatusReset(coupon.id)
					return
				}
				walletBlobRef.current = prepared.blob

				const ret = await postCardCouponOpenClaimWithWallet({
					cardAddress: coupon.cardAddress,
					couponId: coupon.couponId,
					tokenId: coupon.tokenId,
					privateKeyArmor: prepared.privateKeyArmor,
					referrerEoa,
				})
				if (ret.success) {
					setCouponClaimEligibilityById((s) => ({ ...s, [coupon.id]: 'already_claimed' }))
					setCouponClaimStatusById((s) => ({ ...s, [coupon.id]: 'success' }))
					scheduleCouponClaimStatusReset(coupon.id)
				} else {
					const err = ret.error ?? 'Coupon claim failed'
					if (/already claimed/i.test(err)) {
						setCouponClaimEligibilityById((s) => ({ ...s, [coupon.id]: 'already_claimed' }))
						setCouponClaimStatusById((s) => ({ ...s, [coupon.id]: 'idle' }))
					} else {
						setCouponClaimStatusById((s) => ({ ...s, [coupon.id]: 'error' }))
						setCouponClaimErrorById((s) => ({ ...s, [coupon.id]: err }))
						scheduleCouponClaimStatusReset(coupon.id)
					}
				}
			} catch (e: unknown) {
				const err = e instanceof Error ? e.message : 'Coupon claim failed'
				setCouponClaimStatusById((s) => ({ ...s, [coupon.id]: 'error' }))
				setCouponClaimErrorById((s) => ({ ...s, [coupon.id]: err }))
				scheduleCouponClaimStatusReset(coupon.id)
			}
		},
		[couponClaimStatusById, referrerEoa, scheduleCouponClaimStatusReset, visitAaReady],
	)

	const view: DiscoverMerchantLandingModel = model ?? {
		cardAddress,
		title: shareMeta.title,
		subtitle: shareMeta.subtitle,
		programName: shareMeta.merchantName ?? shareMeta.title,
		heroImage: shareMeta.backgroundImage,
		logoUrl: shareMeta.iconUrl || null,
		currency: 'USD',
		categoryId: null,
		cardOwner: null,
		metadataRoot: null,
		discoverAbout: null,
		merchantInfoPanel: null,
		coupons: null,
		couponSeries: null,
		rewardTiers: null,
		socialStats: socialStats ?? null,
		rechargeBonusPill: null,
	}

	const issuerOwnerEoa = view.cardOwner

	useEffect(() => {
		if (!issuerOwnerEoa) {
			setIssuerProfile(null)
			return
		}
		let cancelled = false
		setIssuerProfileLoading(true)
		void fetchDiscoverIssuerProfile(issuerOwnerEoa)
			.then((profile) => {
				if (cancelled) return
				if (profile) setIssuerProfile(profile)
			})
			.finally(() => {
				if (!cancelled) setIssuerProfileLoading(false)
			})
		return () => {
			cancelled = true
		}
	}, [issuerOwnerEoa])

	const mergedStats = mergeCardProgramSocialSummary(socialStats, view.socialStats)
	const MerchantCategoryIcon = categoryIconForId(view.categoryId)
	const passTitle = view.programName.trim() || view.title

	const discoverWelcomePanel = useMemo(
		() =>
			resolveDiscoverWelcomePanelCopy({
				passTitle,
				subtitle: view.subtitle,
				merchantInfoPanel: view.merchantInfoPanel,
			}),
		[passTitle, view.subtitle, view.merchantInfoPanel],
	)

	const discoverAboutPanel = useMemo(
		() =>
			view.merchantInfoPanel && discoverWelcomePanel
				? discoverMerchantAboutPanelForDisplay(view.merchantInfoPanel, discoverWelcomePanel.body)
				: view.merchantInfoPanel && hasDiscoverMerchantAboutPanel(view.merchantInfoPanel)
					? view.merchantInfoPanel
					: null,
		[view.merchantInfoPanel, discoverWelcomePanel],
	)

	const promotionsLoaded = view.metadataRoot != null || view.coupons != null
	const activePromotionsPanel = useMemo(
		() =>
			buildDiscoverActivePromotionsPanelModel({
				metadataRoot: view.metadataRoot,
				chainCardSocialPromotion,
			}),
		[view.metadataRoot, chainCardSocialPromotion],
	)

	const showActivePromotionsPanel =
		(promotionsLoaded && activePromotionsPanel != null) || (loading && !promotionsLoaded)

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
						<div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
							<h1 className="text-2xl font-bold leading-tight text-white drop-shadow-sm">{view.title}</h1>
							{issuerOwnerEoa ? (
								<DiscoverMerchantOwnerTagCapsule
									profile={issuerProfile}
									ownerEoa={issuerOwnerEoa}
									loading={issuerProfileLoading}
								/>
							) : null}
						</div>
						<HeroStatCapsules stats={mergedStats} />
						<DiscoverMerchantCardAddressCapsule address={view.cardAddress} />
					</div>
				</div>
			</div>

			<div className="mx-auto max-w-lg px-4 pb-8 pt-4">
				<div className="space-y-4">
					{discoverWelcomePanel ? (
						<DiscoverMerchantWelcomePanel
							title={discoverWelcomePanel.title}
							body={discoverWelcomePanel.body}
						/>
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

					<DiscoverMerchantSocialPointsCard
						points={userSocialPoints13}
						loading={userSocialPointsLoading}
					/>

					{showActivePromotionsPanel ? (
						<DiscoverMerchantActivePromotionsPanel
							model={promotionsLoaded ? activePromotionsPanel : null}
							loading={loading && !promotionsLoaded}
						/>
					) : null}

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
										<DiscoverShareCouponOfferRow
											key={coupon.id}
											coupon={coupon}
											seriesRow={couponSeriesByTokenId.get(coupon.tokenId) ?? null}
											claimEligibility={couponClaimEligibilityById[coupon.id]}
											claimStatus={
												!visitAaReady
													? 'loading'
													: (couponClaimStatusById[coupon.id] ?? 'idle')
											}
											claimError={couponClaimErrorById[coupon.id]}
											onClaim={() => void handleDiscoverCouponClaim(coupon)}
										/>
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

					{discoverAboutPanel ? (
						<DiscoverMerchantInfoPanelCard panel={discoverAboutPanel} />
					) : null}
				</div>
			</div>
		</div>
	)
}
