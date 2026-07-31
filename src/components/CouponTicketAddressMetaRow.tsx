import React, { useCallback, useState } from 'react'
import { Check, ExternalLink, Heart, Share2 } from 'lucide-react'
import {
	beamioIssuedNftCapsuleLabel,
	beamioIssuedNftExplorerUrl,
	normalizeIssuedNftTokenId,
} from '../utils/beamioIssuedNftCapsule'
import { formatProgramSocialStatCount } from '../utils/cardProgramSocialStats'

function openUrl(url: string): void {
	if (typeof window === 'undefined') return
	window.open(url, '_blank', 'noopener,noreferrer')
}

export function HomepageIssuedNftCapsule({
	cardAddress,
	tokenId,
	className = '',
}: {
	cardAddress: string
	tokenId: string | number | undefined
	className?: string
}) {
	const tid = normalizeIssuedNftTokenId(tokenId)
	const url = beamioIssuedNftExplorerUrl(cardAddress, tid)
	if (!url || !tid) return null
	const label = beamioIssuedNftCapsuleLabel(tid)
	const fullHint = `NFT #${tid}`
	return (
		<button
			type="button"
			onClick={(e) => {
				e.stopPropagation()
				openUrl(url)
			}}
			className={`inline-flex shrink-0 items-center gap-1 rounded-full border border-[#cbd5e1] bg-white px-2.5 py-1 text-[10px] font-bold tracking-tight text-[#334155] transition-colors hover:border-[#94a3b8] hover:bg-[#f8fafc] ${className}`}
			aria-label={`View ${fullHint} on explorer`}
			title={`View ${fullHint} on explorer`}
		>
			{label}
			<ExternalLink className="h-3 w-3 opacity-70" strokeWidth={2.2} aria-hidden />
		</button>
	)
}

/** Display-only like count pill — align SilentPassUI CouponUserLikeCountPill. */
export function HomepageCouponLikeCountPill({
	count,
	variant = 'light',
	className = '',
}: {
	count: number | null
	variant?: 'light' | 'onDark'
	className?: string
}) {
	if (count == null) return null
	const style =
		variant === 'onDark'
			? 'bg-white/15 text-white ring-white/25'
			: 'bg-rose-50 text-rose-500 ring-rose-100'
	return (
		<span
			className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${style} ${className}`}
			aria-label={`${formatProgramSocialStatCount(count)} likes`}
		>
			<Heart className="h-3 w-3" strokeWidth={2.25} aria-hidden />
			{formatProgramSocialStatCount(count)}
		</span>
	)
}

/** Share2 (+ optional count) — one pill button, align SilentPassUI CouponOpenClaimShareButton. */
export function HomepageCouponSharePillButton({
	shareUrl,
	title,
	count = null,
	variant = 'light',
	className = '',
}: {
	shareUrl: string
	title?: string
	count?: number | null
	variant?: 'light' | 'onDark'
	className?: string
}) {
	const [shared, setShared] = useState(false)
	const url = shareUrl?.trim() ?? ''

	const handleShare = useCallback(
		async (e: React.MouseEvent) => {
			e.stopPropagation()
			if (!url) return
			const shareTitle = title?.trim() || 'Claim this coupon on Beamio'
			if (typeof navigator.share === 'function') {
				try {
					await navigator.share({ title: shareTitle, url })
					setShared(true)
					window.setTimeout(() => setShared(false), 2000)
					return
				} catch (err: unknown) {
					if (err instanceof DOMException && err.name === 'AbortError') return
				}
			}
			try {
				await navigator.clipboard.writeText(url)
				setShared(true)
				window.setTimeout(() => setShared(false), 2000)
			} catch {
				/* ignore */
			}
		},
		[url, title],
	)

	if (!url) return null

	const style =
		variant === 'onDark'
			? 'bg-white/15 text-white ring-white/25 hover:bg-white/25'
			: 'bg-sky-50 text-[#1562f0] ring-sky-100 hover:bg-sky-100'
	const countLabel =
		count != null && Number.isFinite(count)
			? formatProgramSocialStatCount(Math.max(0, Math.floor(count)))
			: null

	return (
		<button
			type="button"
			onClick={(e) => void handleShare(e)}
			className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 transition active:scale-95 ${style} ${className}`}
			aria-label={countLabel != null ? `Share claim URL · ${countLabel} shares` : 'Share claim URL'}
			title="Share claim URL"
		>
			{shared ? (
				<Check className="h-3 w-3 text-emerald-500" strokeWidth={2.4} aria-hidden />
			) : (
				<Share2 className="h-3 w-3" strokeWidth={2.25} aria-hidden />
			)}
			{countLabel != null ? countLabel : null}
		</button>
	)
}

/**
 * Align SilentPassUI ActiveCouponTicketItem address meta row:
 * NFT capsule (last 3) · like · share pill · TOTAL/LEFT
 */
export function CouponTicketAddressMetaRow({
	cardAddress,
	tokenId,
	shareUrl,
	shareTitle,
	supplySummary,
	likeCount = null,
	shareClickCount = null,
	variant = 'light',
	className = '',
}: {
	cardAddress?: string
	tokenId?: string | number | null
	shareUrl?: string
	shareTitle?: string
	supplySummary?: string | null
	likeCount?: number | null
	shareClickCount?: number | null
	variant?: 'light' | 'onDark'
	className?: string
}) {
	const hasNft = Boolean(cardAddress && normalizeIssuedNftTokenId(tokenId ?? undefined))
	const hasShare = Boolean(shareUrl?.trim())
	const hasLike = likeCount != null
	const supply = supplySummary?.trim() || ''
	if (!hasNft && !hasShare && !hasLike && !supply) return null

	const supplyChipClass =
		variant === 'onDark'
			? 'border-white/25 bg-white/15 text-white'
			: 'border-[#cbd5e1] bg-white text-[#334155]'

	return (
		<div className={`flex w-full min-w-0 flex-wrap items-center gap-2 ${className}`.trim()}>
			{hasNft && cardAddress ? (
				<HomepageIssuedNftCapsule cardAddress={cardAddress} tokenId={tokenId ?? undefined} />
			) : null}
			<HomepageCouponLikeCountPill count={likeCount} variant={variant} />
			{hasShare ? (
				<HomepageCouponSharePillButton
					shareUrl={shareUrl!}
					title={shareTitle}
					count={shareClickCount}
					variant={variant}
				/>
			) : shareClickCount != null ? (
				<span
					className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${
						variant === 'onDark'
							? 'bg-white/15 text-white ring-white/25'
							: 'bg-sky-50 text-[#1562f0] ring-sky-100'
					}`}
					aria-label={`${formatProgramSocialStatCount(shareClickCount)} share clicks`}
				>
					<Share2 className="h-3 w-3" strokeWidth={2.25} aria-hidden />
					{formatProgramSocialStatCount(shareClickCount)}
				</span>
			) : null}
			{supply ? (
				<span
					className={`inline-flex max-w-full shrink-0 items-center rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-tight ${supplyChipClass}`}
					title={supply}
				>
					<span className="truncate">{supply}</span>
				</span>
			) : null}
		</div>
	)
}
