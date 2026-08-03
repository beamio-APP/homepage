import React, { useCallback, useEffect, useState } from 'react'
import { Check, Heart, Loader2, QrCode, Share2 } from 'lucide-react'
import { beamioFixedCapsuleTopStyle } from '../utils/beamioFixedTopCapsuleLayout'
import type { AppDownloadVisitWalletProfile } from '../utils/beamioWebShareWallet'
import {
	resolveSigningWalletFromBlob,
	provisionWebShareVisitWallet,
} from '../utils/beamioWebShareWallet'
import {
	buildDiscoverMerchantShareUrl,
	shareDiscoverMerchantUrl,
} from '../utils/discoverMerchantShare'
import {
	fetchUserHasLikedMerchantCard,
	postMerchantCardUserLike,
} from '../utils/discoverMerchantLike'
import type { CardProgramSocialSummary } from '../utils/cardProgramSocialStats'
import { formatProgramSocialStatCount } from '../utils/cardProgramSocialStats'
import OpenInAppNeonPillButton from './OpenInAppNeonPillButton'

type AppDownloadDiscoverTopBarProps = {
	profile: AppDownloadVisitWalletProfile | null
	cardAddress: string
	merchantTitle: string
	referrerEoa?: string | null
	opacity?: number
	socialStats?: CardProgramSocialSummary | null
	onOpenWallet: () => void
	onOpenPayCode: () => void
	onSocialStatsRefresh?: () => void
	/**
	 * Coupon / redeem open-claim: Share pastes this URL instead of Discover merchant share.
	 * When omitted, Share builds {@link buildDiscoverMerchantShareUrl}.
	 */
	shareUrlOverride?: string | null
	shareTitleOverride?: string | null
	/**
	 * Discover merchant landing: replace top-right share/like with neon “Open in App”.
	 */
	openInAppAction?: {
		onClick: () => void
		busy?: boolean
	} | null
}

/**
 * App-download Discover / coupon claim top chrome:
 * left Scan to Pay + `@beamioTag` capsule;
 * right: neon Open in App (Discover merchant) or share + like (coupon / redeem).
 */
export default function AppDownloadDiscoverTopBar({
	profile,
	cardAddress,
	merchantTitle,
	referrerEoa = null,
	opacity = 1,
	socialStats,
	onOpenWallet,
	onOpenPayCode,
	onSocialStatsRefresh,
	shareUrlOverride = null,
	shareTitleOverride = null,
	openInAppAction = null,
}: AppDownloadDiscoverTopBarProps) {
	const [shared, setShared] = useState(false)
	const [userLiked, setUserLiked] = useState<boolean | null>(null)
	const [likeLoading, setLikeLoading] = useState(false)
	const [likeError, setLikeError] = useState<string | null>(null)
	const pointer = opacity < 0.05 ? 'none' : 'auto'
	const showOpenInApp = Boolean(openInAppAction)

	useEffect(() => {
		if (showOpenInApp) return
		if (!cardAddress || !profile?.eoaAddress) return
		let cancelled = false
		void fetchUserHasLikedMerchantCard(cardAddress, profile.eoaAddress).then((liked) => {
			if (!cancelled && liked != null) setUserLiked(liked)
		})
		return () => {
			cancelled = true
		}
	}, [cardAddress, profile?.eoaAddress, showOpenInApp])

	const handleShare = useCallback(
		async (e: React.MouseEvent) => {
			e.stopPropagation()
			const override = shareUrlOverride?.trim() ?? ''
			const shareUrl = override
				? override
				: profile?.eoaAddress
					? buildDiscoverMerchantShareUrl(cardAddress, profile.eoaAddress)
					: ''
			if (!shareUrl) return
			const title =
				shareTitleOverride?.trim() ||
				(merchantTitle.trim()
					? `Discover ${merchantTitle.trim()} on Beamio`
					: 'Discover this brand on Beamio')
			const outcome = await shareDiscoverMerchantUrl(shareUrl, { title })
			if (outcome === 'shared' || outcome === 'copied') {
				setShared(true)
				window.setTimeout(() => setShared(false), 2000)
			}
		},
		[
			cardAddress,
			merchantTitle,
			profile?.eoaAddress,
			shareTitleOverride,
			shareUrlOverride,
		],
	)

	const handleLike = useCallback(async () => {
		if (likeLoading || userLiked || !profile?.eoaAddress) return
		setLikeLoading(true)
		setLikeError(null)
		try {
			const blob = await provisionWebShareVisitWallet()
			const wallet = resolveSigningWalletFromBlob(blob)
			const pk = wallet?.privateKey
			if (!pk) {
				setLikeError('Wallet unavailable')
				return
			}
			const ret = await postMerchantCardUserLike({
				cardAddress,
				privateKeyArmor: pk,
				liked: true,
				referrerEoa,
			})
			if (ret.success) {
				setUserLiked(true)
				onSocialStatsRefresh?.()
			} else {
				setLikeError(ret.error?.trim() || 'Like failed')
			}
		} finally {
			setLikeLoading(false)
		}
	}, [cardAddress, likeLoading, onSocialStatsRefresh, profile?.eoaAddress, referrerEoa, userLiked])

	const likeCount = socialStats?.likeCount ?? null
	const shareClickCount = socialStats?.shareClickCount ?? null

	return (
		<div
			className="pointer-events-none fixed left-4 right-4 z-40 flex items-start justify-between gap-2 transition-opacity duration-300"
			style={{
				...beamioFixedCapsuleTopStyle(),
				opacity,
			}}
		>
			<div className="flex min-w-0 items-center gap-2 justify-self-start" style={{ pointerEvents: pointer }}>
				<button
					type="button"
					onClick={onOpenPayCode}
					className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-800/85 text-white shadow-lg ring-1 ring-white/10 transition active:scale-95"
					aria-label="Scan to Pay"
					title="Scan to Pay"
				>
					<QrCode className="h-5 w-5" strokeWidth={2.2} aria-hidden />
				</button>
				<button
					type="button"
					onClick={onOpenWallet}
					disabled={!profile}
					className="flex min-w-0 items-center disabled:opacity-50"
					aria-label="Open wallet"
				>
					{profile ? (
						<div className="flex min-w-0 max-w-[min(40vw,11rem)] items-center gap-2.5 rounded-full border border-slate-100/90 bg-white py-2 pl-2 pr-4 shadow-[0_4px_24px_rgba(15,23,42,0.08)] transition-transform active:scale-[0.98] sm:max-w-[min(48vw,13rem)]">
							<div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 ring-1 ring-inset ring-slate-200/80">
								<img
									src={profile.avatarSrc}
									alt=""
									className="h-full w-full object-cover"
									draggable={false}
								/>
							</div>
							<span className="min-w-0 truncate text-[15px] font-bold tracking-tight text-[#0F172A]">
								{profile.tagLabel}
							</span>
						</div>
					) : (
						<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-100/90 bg-white shadow-[0_4px_24px_rgba(15,23,42,0.08)]">
							<Loader2 className="h-5 w-5 animate-spin text-slate-400" aria-hidden />
						</div>
					)}
				</button>
			</div>

			<div className="flex shrink-0 items-center gap-2" style={{ pointerEvents: pointer }}>
				{showOpenInApp && openInAppAction ? (
					<OpenInAppNeonPillButton
						onClick={openInAppAction.onClick}
						busy={openInAppAction.busy}
					/>
				) : (
					<>
						<button
							type="button"
							onClick={(e) => void handleShare(e)}
							className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-800/85 text-white shadow-lg ring-1 ring-white/10 transition active:scale-95"
							aria-label={
								shareClickCount != null
									? `Share brand link (${formatProgramSocialStatCount(shareClickCount)} clicks)`
									: 'Share brand link'
							}
							title="Share brand link"
						>
							{shared ? (
								<Check className="h-5 w-5 text-emerald-400" strokeWidth={2.4} aria-hidden />
							) : (
								<Share2 className="h-5 w-5" strokeWidth={2} aria-hidden />
							)}
						</button>
						<button
							type="button"
							onClick={() => void handleLike()}
							disabled={likeLoading || Boolean(userLiked)}
							className={[
								'relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full shadow-lg ring-1 transition active:scale-95 disabled:opacity-70',
								userLiked
									? 'bg-rose-500 text-white ring-rose-600/30 disabled:cursor-default'
									: 'bg-slate-800/85 text-white ring-white/10',
							].join(' ')}
							aria-label={
								userLiked
									? likeCount != null
										? `Liked (${formatProgramSocialStatCount(likeCount)})`
										: 'Liked'
									: likeCount != null
										? `Like this brand (${formatProgramSocialStatCount(likeCount)})`
										: 'Like this brand'
							}
							aria-pressed={Boolean(userLiked)}
							title={likeError ?? undefined}
						>
							{likeLoading ? (
								<Loader2 className="h-5 w-5 animate-spin" strokeWidth={2} aria-hidden />
							) : (
								<Heart
									className="h-5 w-5"
									strokeWidth={2}
									fill={userLiked ? 'currentColor' : 'none'}
									aria-hidden
								/>
							)}
						</button>
					</>
				)}
			</div>
		</div>
	)
}
