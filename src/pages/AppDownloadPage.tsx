import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { ethers } from 'ethers'
import { useLocation } from 'react-router-dom'
import { Calendar, Clock, Download, Gift, Loader2, Smartphone } from 'lucide-react'
import {
	attemptOpenNativeBeamioApp,
	BEAMIO_ANDROID_STORE_URL,
	BEAMIO_IOS_STORE_URL,
	isAndroidDevice,
	isBeamioNativeShell,
	isIosDevice,
	isMobileDevice,
	openBeamioAppStore,
	type NativeAppOpenResult,
} from '../utils/nativeAppDownload'
import {
	applyCouponClaimShareMeta,
	buildAppDownloadShareUrl,
	couponExpiryUsesUrgentVariant,
	shouldShowCouponExpiryPill,
	fetchCouponClaimShareMeta,
	type CouponClaimShareMeta,
} from '../utils/couponClaimShare'
import { CatalogVideoOgBannerMedia } from '../components/CatalogVideoOgBannerMedia'
import {
	CATALOG_VIDEO_OG_APP_DOWNLOAD_BANNER_HEIGHT_PX,
	CATALOG_VIDEO_OG_BELOW_BANNER_ROW_OG_PREVIEW_CLASSNAME,
} from '../utils/catalogProductionVideoOg'
import {
	parseCouponOpenClaimFromTarget,
	parseDiscoverMerchantCardFromTarget,
	parseDiscoverMerchantOpenFromTarget,
	recordDiscoverShareClickIfNeeded,
} from '../utils/discoverShareClickEvent'
import {
	fetchCardProgramSocialSummary,
	type CardProgramSocialSummary,
} from '../utils/cardProgramSocialStats'
import { DiscoverMerchantShareDetail } from '../components/DiscoverMerchantShareDetail'
import AppDownloadDiscoverTopBar from '../components/AppDownloadDiscoverTopBar'
import AppDownloadMyWalletPanel from '../components/AppDownloadMyWalletPanel'
import AppDownloadPayCodeSheet from '../components/AppDownloadPayCodeSheet'
import {
	loadAppDownloadVisitWalletProfile,
	type AppDownloadVisitWalletProfile,
} from '../utils/beamioWebShareWallet'
import { useScrollCapsuleOpacity } from '../hooks/useScrollCapsuleOpacity'

type PagePhase = 'checking' | 'install' | 'desktop'
type IosNativeProbeResult = 'pending' | NativeAppOpenResult

/** POS Check Balance claim button — same orange/red gradient. */
const CLAIM_GRADIENT = 'linear-gradient(to bottom right, rgb(255,132,36), rgb(255,71,87))'

function isCouponShareMeta(meta: CouponClaimShareMeta): boolean {
	return meta.distributionKind !== 'catalog'
}

function resolveBeamioAppTarget(search: string): string {
	const target = new URLSearchParams(search).get('target')?.trim() ?? ''
	if (!target) return ''
	try {
		const url = new URL(target)
		if (url.origin !== 'https://beamio.app') return ''
		if (url.pathname !== '/app/' && url.pathname !== '/app' && !url.pathname.startsWith('/app/')) return ''
		return url.toString()
	} catch {
		return ''
	}
}

function isIosEmbeddedWebView(): boolean {
	if (typeof navigator === 'undefined') return false
	const ua = navigator.userAgent || ''
	return isIosDevice() && !/Safari/i.test(ua)
}

/** In native shell or embedded WKWebView: jump straight to inner `/app/` claim URL. */
function shouldRedirectToInnerAppTarget(): boolean {
	return isBeamioNativeShell() || isIosEmbeddedWebView()
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

function useCatalogVideoOgShareCardMaxHeight(cardRef: React.RefObject<HTMLElement | null>) {
	const [maxHeightPx, setMaxHeightPx] = useState<number | undefined>(undefined)

	useLayoutEffect(() => {
		const measure = () => {
			const el = cardRef.current
			if (!el) return
			const top = el.getBoundingClientRect().top
			const safeBottomRaw = getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-bottom)')
			const safeBottom = Number.parseFloat(safeBottomRaw) || 0
			const reservePx = 20 + safeBottom
			const next = Math.floor(window.innerHeight - top - reservePx)
			setMaxHeightPx(Math.max(280, next))
		}

		measure()
		window.addEventListener('resize', measure)
		window.visualViewport?.addEventListener('resize', measure)
		window.visualViewport?.addEventListener('scroll', measure)
		return () => {
			window.removeEventListener('resize', measure)
			window.visualViewport?.removeEventListener('resize', measure)
			window.visualViewport?.removeEventListener('scroll', measure)
		}
	}, [cardRef])

	return maxHeightPx
}

function CatalogShareCategoryLine({
	globalCategory,
	itemCategory,
	tone,
}: {
	globalCategory?: string
	itemCategory?: string
	tone: 'inner' | 'external'
}) {
	const global = globalCategory?.trim() ?? ''
	const item = itemCategory?.trim() ?? ''
	if (!global && !item) return null
	const label = [global, item].filter(Boolean).join(' · ')
	const className =
		tone === 'inner'
			? 'text-[10px] font-bold uppercase tracking-wider text-white/85 drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]'
			: 'text-[10px] font-bold uppercase tracking-wider text-[#ea580c]'
	return <p className={className}>{label}</p>
}

function CatalogShareMetadataBlock({
	meta,
	tone,
	showExpiryPill,
	renderExpiryPill,
	descriptionViewportScroll = false,
}: {
	meta: CouponClaimShareMeta
	tone: 'inner' | 'external'
	showExpiryPill: boolean
	renderExpiryPill: (placement: 'inner' | 'external') => React.ReactNode
	/** Catalog videoOg — description fills remaining card height and scrolls (no line clamp). */
	descriptionViewportScroll?: boolean
}) {
	const isCatalog = meta.distributionKind === 'catalog'
	const isDiscoverMerchant =
		meta.shareKind === 'discover_merchant' || meta.distributionKind === 'merchant'
	const title = meta.title.trim()
	const subtitle = meta.subtitle.trim()
	const titleClass =
		tone === 'inner'
			? 'break-words font-manrope text-[1.05rem] font-extrabold leading-tight tracking-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)] sm:text-lg'
			: 'break-words font-manrope text-[1.05rem] font-extrabold leading-tight tracking-tight text-[#2c2f31] sm:text-lg'
	const subtitleClass =
		tone === 'inner'
			? 'break-words font-manrope text-sm font-semibold leading-snug text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]'
			: 'break-words font-manrope text-sm font-semibold leading-snug text-[#595c5e]'

	if (isCatalog) {
		const global = meta.globalCategory?.trim() ?? ''
		const item = meta.itemCategory?.trim() ?? ''
		const isVideoOg = meta.catalogLayout === 'videoOg'
		const publisherLine = meta.publisherLine?.trim() ?? ''
		const publisherClass =
			tone === 'inner'
				? 'truncate text-xs font-medium text-white/85 drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]'
				: 'truncate text-xs font-medium text-[#595c5e]'
		if (isVideoOg) {
			const descriptionMarginClass = publisherLine || title ? 'mt-0.5' : global || item ? 'mt-1' : ''
			return (
				<div
					className={`min-w-0 ${descriptionViewportScroll ? 'flex min-h-0 flex-1 flex-col' : 'flex-1'}`}
				>
					<div className="shrink-0">
						<CatalogShareCategoryLine
							globalCategory={meta.globalCategory}
							itemCategory={meta.itemCategory}
							tone={tone}
						/>
						{title ? <p className={`${titleClass} ${global || item ? 'mt-1' : ''}`}>{title}</p> : null}
						{publisherLine ? (
							<p className={`${publisherClass} ${title ? 'mt-0.5' : global || item ? 'mt-1' : ''}`}>
								{publisherLine}
							</p>
						) : null}
					</div>
					{subtitle ? (
						descriptionViewportScroll ? (
							<div
								className={`catalog-share-description-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain ${descriptionMarginClass}`}
							>
								<p className={subtitleClass}>{subtitle}</p>
							</div>
						) : (
							<p className={`${subtitleClass} ${descriptionMarginClass}`}>{subtitle}</p>
						)
					) : null}
					{showExpiryPill ? (
						<div
							className={`shrink-0 ${title || subtitle || publisherLine || global || item ? 'mt-2' : ''}`}
						>
							{renderExpiryPill(tone)}
						</div>
					) : null}
				</div>
			)
		}

		return (
			<div className="font-manrope min-w-0 flex-1">
				<CatalogShareCategoryLine
					globalCategory={meta.globalCategory}
					itemCategory={meta.itemCategory}
					tone={tone}
				/>
				{title ? <p className={`${titleClass} ${global || item ? 'mt-1' : ''}`}>{title}</p> : null}
				{subtitle ? <p className={`${subtitleClass} ${title ? 'mt-0.5' : global || item ? 'mt-1' : ''}`}>{subtitle}</p> : null}
				{showExpiryPill ? (
					<div className={title || subtitle || global || item ? 'mt-2' : ''}>{renderExpiryPill(tone)}</div>
				) : null}
			</div>
		)
	}

	if (isDiscoverMerchant && meta.catalogLayout === 'videoOg') {
		const descriptionMarginClass = title ? 'mt-0.5' : 'mt-1'
		return (
			<div
				className={`min-w-0 ${descriptionViewportScroll ? 'flex min-h-0 flex-1 flex-col' : 'flex-1'}`}
			>
				<div className="shrink-0">
					<p className="text-[10px] font-black uppercase tracking-wide text-[#1562f0]">Discover</p>
					{title ? <p className={`${titleClass} mt-1`}>{title}</p> : null}
				</div>
				{subtitle ? (
					descriptionViewportScroll ? (
						<div
							className={`catalog-share-description-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain ${descriptionMarginClass}`}
						>
							<p className={subtitleClass}>{subtitle}</p>
						</div>
					) : (
						<p className={`${subtitleClass} ${descriptionMarginClass}`}>{subtitle}</p>
					)
				) : null}
				{showExpiryPill ? (
					<div className={title || subtitle ? 'mt-2' : ''}>{renderExpiryPill(tone)}</div>
				) : null}
			</div>
		)
	}

	return (
		<div className={`font-manrope min-w-0 flex-1 ${tone === 'inner' ? 'text-white' : ''}`}>
			{title ? (
				<p className={`truncate text-[1.05rem] font-extrabold leading-tight tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)] sm:text-lg ${tone === 'external' ? 'text-[#2c2f31]' : ''}`}>
					{title}
				</p>
			) : null}
			{subtitle ? (
				<p
					className={`truncate text-sm font-semibold drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)] ${
						title ? 'mt-0.5' : ''
					} ${tone === 'external' ? 'text-[#595c5e]' : 'text-white/90'}`}
				>
					{subtitle}
				</p>
			) : null}
			{showExpiryPill ? <div className={title || subtitle ? 'mt-2' : ''}>{renderExpiryPill(tone)}</div> : null}
		</div>
	)
}

function isDiscoverMerchantMeta(meta: CouponClaimShareMeta): boolean {
	return meta.shareKind === 'discover_merchant' || meta.distributionKind === 'merchant'
}

function CouponSharePreview({
	meta,
}: {
	meta: CouponClaimShareMeta
}) {
	const catalogVideoOgCardRef = React.useRef<HTMLDivElement>(null)
	const catalogVideoOgCardMaxHeightPx = useCatalogVideoOgShareCardMaxHeight(catalogVideoOgCardRef)
	const expiryUrgent = couponExpiryUsesUrgentVariant(meta.expiresLabel)
	const showExpiryPill = shouldShowCouponExpiryPill(meta.expiresLabel)
	const ExpiryIcon = expiryUrgent ? Clock : Calendar
	const hasBanner = Boolean(meta.backgroundImage?.trim())
	const isCatalogVideoOg = meta.distributionKind === 'catalog' && meta.catalogLayout === 'videoOg'
	const iconUrl = isCatalogVideoOg
		? meta.iconUrl.trim()
		: hasBanner
			? ''
			: meta.iconUrl.trim()
	const innerExpiryClass = expiryUrgent
		? 'bg-red-600 text-white shadow-sm shadow-red-900/25'
		: 'border border-white/25 bg-slate-950/65 text-white shadow-sm shadow-black/20 backdrop-blur-md'
	const externalExpiryClass = expiryUrgent
		? 'bg-red-600 text-white shadow-sm shadow-red-900/25'
		: 'border border-[#abadaf]/35 bg-[#eef1f3] text-[#595c5e]'

	const shareHeadline =
		meta.distributionKind === 'catalog'
			? ''
			: meta.shareHeadline?.trim() ||
				(meta.merchantName?.trim()
					? `${meta.shareKind === 'redeem' ? 'Redeem' : 'Claim'} a ${meta.merchantName.trim()} Coupon`
					: '')

	const renderExpiryPill = (placement: 'inner' | 'external') => (
		<div
			className={`inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${
				placement === 'external' ? externalExpiryClass : innerExpiryClass
			}`}
		>
			<ExpiryIcon className="h-3 w-3 shrink-0" strokeWidth={2.5} aria-hidden />
			<span className="truncate">{meta.expiresLabel}</span>
		</div>
	)

	if (isCatalogVideoOg && hasBanner) {
		return (
			<div ref={catalogVideoOgCardRef} className="mx-auto w-full min-w-0 max-w-lg text-left">
				<div
					className="flex flex-col overflow-hidden rounded-[1.75rem] ring-1 ring-black/[0.08]"
					style={catalogVideoOgCardMaxHeightPx ? { maxHeight: catalogVideoOgCardMaxHeightPx } : undefined}
				>
					<div className="shrink-0">
						<CatalogVideoOgBannerMedia
							bannerImageUrl={meta.backgroundImage}
							productionVideoUrl={meta.productionVideoUrl}
							productionVideoMime={meta.productionVideoMime}
							iconUrl={meta.iconUrl}
							backgroundColorHex={meta.backgroundColorHex}
							previewBannerHeightPx={CATALOG_VIDEO_OG_APP_DOWNLOAD_BANNER_HEIGHT_PX}
							interactivePlayback
						/>
					</div>
					<div
						className={`${CATALOG_VIDEO_OG_BELOW_BANNER_ROW_OG_PREVIEW_CLASSNAME} flex min-h-0 flex-1 flex-col overflow-hidden`}
					>
						<CatalogShareMetadataBlock
							meta={meta}
							tone="external"
							showExpiryPill={showExpiryPill}
							renderExpiryPill={renderExpiryPill}
							descriptionViewportScroll
						/>
					</div>
				</div>
			</div>
		)
	}

	const ticketPunchInsetClass = 'px-[18px]'

	const ticketShell = (
		<div className={`relative w-full min-w-0 ${ticketPunchInsetClass}`}>
			<div className="relative w-full min-w-0 rounded-[1.75rem]">
				<div
					className="pointer-events-none absolute left-0 top-1/2 z-20 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f8fafc]"
					aria-hidden
				/>
				<div
					className="pointer-events-none absolute right-0 top-1/2 z-20 h-9 w-9 translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f8fafc]"
					aria-hidden
				/>
				<div className="relative min-h-[7.5rem] overflow-hidden rounded-[1.75rem] ring-1 ring-black/[0.08]">
				{hasBanner ? (
					<CouponBannerImage src={meta.backgroundImage} />
				) : (
					<>
						<div
							className="absolute inset-0"
							style={{ backgroundColor: meta.backgroundColorHex || '#2B2E3A' }}
						/>
						<div
							className="pointer-events-none absolute inset-0 opacity-[0.12]"
							style={{
								backgroundImage:
									'repeating-linear-gradient(-26deg, #fff 0, #fff 1px, transparent 1px, transparent 8px)',
							}}
							aria-hidden
						/>
						<div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-black/30" aria-hidden />
					</>
				)}

				<div className="relative z-[1] flex min-h-[7.5rem] min-w-0 items-center gap-3 px-5 py-4 sm:gap-4 sm:px-7 sm:py-5">
					{iconUrl ? (
						<div className="relative flex h-[3.35rem] w-[3.35rem] shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white/40 bg-white/95 shadow-md ring-2 ring-black/10 sm:h-14 sm:w-14">
							<img src={iconUrl} alt="" className="h-full w-full object-cover" draggable={false} />
						</div>
					) : null}

					{!hasBanner ? (
						<CatalogShareMetadataBlock
							meta={meta}
							tone="inner"
							showExpiryPill={showExpiryPill}
							renderExpiryPill={renderExpiryPill}
						/>
					) : null}

				</div>
				</div>
			</div>
		</div>
	)

	return (
		<div className="mx-auto w-full min-w-0 max-w-full text-left">
			{shareHeadline ? (
				<p className="mb-3 text-center font-manrope text-base font-extrabold tracking-tight text-slate-900 sm:text-lg">
					{shareHeadline}
				</p>
			) : null}
			{ticketShell}
			{hasBanner ? (
				<div className="mt-3 w-full min-w-0">
					<CatalogShareMetadataBlock
						meta={meta}
						tone="external"
						showExpiryPill={showExpiryPill}
						renderExpiryPill={renderExpiryPill}
					/>
				</div>
			) : null}
		</div>
	)
}

function CouponShareClaimActions({
	targetUrl,
	search,
	onIosNativeProbeResult,
	shareKind,
	showClaimInApp,
}: {
	targetUrl: string
	search: string
	onIosNativeProbeResult?: (result: NativeAppOpenResult) => void
	shareKind?: CouponClaimShareMeta['shareKind']
	showClaimInApp: boolean
}) {
	const [claimInAppBusy, setClaimInAppBusy] = useState(false)
	const isDiscoverMerchant = shareKind === 'discover_merchant'
	const actionLabel = isDiscoverMerchant ? 'Discover' : shareKind === 'redeem' ? 'Redeem' : 'Claim'
	const inAppLabel = isDiscoverMerchant ? 'Open in App' : 'Claim in App'

	const handleClaimInWeb = useCallback(() => {
		window.location.href = targetUrl
	}, [targetUrl])

	const handleClaimInApp = useCallback(async () => {
		if (claimInAppBusy) return
		setClaimInAppBusy(true)
		try {
			// Fresh probe on every tap — never reuse page-load result (user may install App and return).
			const result = await attemptOpenNativeBeamioApp(search, {
				useLocationNavigation: isIosDevice(),
				timeoutMs: 2800,
			})
			onIosNativeProbeResult?.(result)
			if (result === 'not_installed') {
				openBeamioAppStore()
			}
		} finally {
			setClaimInAppBusy(false)
		}
	}, [claimInAppBusy, onIosNativeProbeResult, search])

	if (isDiscoverMerchant && !showClaimInApp) return null

	return (
		<div className="mx-auto mt-6 flex w-full max-w-xs flex-col items-stretch gap-3">
			{!isDiscoverMerchant ? (
				<button
					type="button"
					onClick={handleClaimInWeb}
					className="inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-95 active:scale-[0.98]"
					style={{ background: CLAIM_GRADIENT }}
				>
					<Gift className="h-4 w-4 shrink-0" aria-hidden />
					{actionLabel}
				</button>
			) : null}
			{showClaimInApp ? (
				<button
					type="button"
					onClick={() => void handleClaimInApp()}
					disabled={claimInAppBusy}
					className="inline-flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition-opacity hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
				>
					{claimInAppBusy ? (
						<Loader2 className="h-10 w-10 animate-spin text-[#1562f0]" aria-hidden />
					) : (
						<img
							src="/open-in-app.png"
							alt=""
							className="h-10 w-10 shrink-0 rounded-xl object-contain"
							draggable={false}
						/>
					)}
					<span>{claimInAppBusy ? 'Opening Beamio…' : inAppLabel}</span>
				</button>
			) : null}
		</div>
	)
}

export default function AppDownloadPage() {
	const location = useLocation()
	const targetUrl = useMemo(() => resolveBeamioAppTarget(location.search), [location.search])
	const shareUrl = useMemo(() => buildAppDownloadShareUrl(location.search), [location.search])
	const [phase, setPhase] = useState<PagePhase>(() => (isMobileDevice() ? 'checking' : 'desktop'))
	const [iosNativeProbe, setIosNativeProbe] = useState<IosNativeProbeResult>(() =>
		isMobileDevice() ? 'pending' : 'desktop',
	)
	const [shareMeta, setShareMeta] = useState<CouponClaimShareMeta | null>(null)
	const [discoverSocialStats, setDiscoverSocialStats] = useState<CardProgramSocialSummary | null>(null)
	const [visitWalletProfile, setVisitWalletProfile] = useState<AppDownloadVisitWalletProfile | null>(null)
	const [myWalletOpen, setMyWalletOpen] = useState(false)
	const [payCodeOpen, setPayCodeOpen] = useState(false)
	const redirectingToInnerTarget = Boolean(targetUrl && shouldRedirectToInnerAppTarget())
	const shareClickStartedRef = useRef(false)
	const { opacity: capsuleOpacity } = useScrollCapsuleOpacity(true, 'window')

	useLayoutEffect(() => {
		if (!shareClickStartedRef.current) {
			const couponOpen = parseCouponOpenClaimFromTarget(targetUrl)
			const openFromTarget = parseDiscoverMerchantOpenFromTarget(targetUrl)
			const cardFromTarget =
				couponOpen?.cardAddress ??
				openFromTarget?.cardAddress ??
				parseDiscoverMerchantCardFromTarget(targetUrl)
			if (cardFromTarget) {
				shareClickStartedRef.current = true
				void recordDiscoverShareClickIfNeeded(cardFromTarget, {
					referrerEoa: couponOpen?.referrerEoa ?? openFromTarget?.referrerEoa ?? null,
					...(couponOpen ? { couponId: couponOpen.couponId } : {}),
				}).then((result) => {
					if (!result.ok) return
					void fetchCardProgramSocialSummary(cardFromTarget).then((summary) => {
						if (summary) setDiscoverSocialStats(summary)
					})
				})
			}
		}
		if (!targetUrl || !shouldRedirectToInnerAppTarget()) return
		window.location.replace(targetUrl)
	}, [targetUrl])

	/** Viewport scroll + page-scoped layout (class on body avoids html MutationObserver churn). */
	useEffect(() => {
		document.documentElement.classList.add('beamio-app-download-page')
		document.body.classList.add('beamio-app-download-page')
		return () => {
			document.documentElement.classList.remove('beamio-app-download-page')
			document.body.classList.remove('beamio-app-download-page')
		}
	}, [])

	/** iOS "Open in Beamio" system dimmer only covers the layout viewport — freeze scroll/height while probing. */
	useEffect(() => {
		if (phase !== 'checking') {
			document.documentElement.classList.remove('beamio-app-download-page-checking')
			document.body.classList.remove('beamio-app-download-page-checking')
			return
		}
		document.documentElement.classList.add('beamio-app-download-page-checking')
		document.body.classList.add('beamio-app-download-page-checking')
		window.scrollTo(0, 0)
		return () => {
			document.documentElement.classList.remove('beamio-app-download-page-checking')
			document.body.classList.remove('beamio-app-download-page-checking')
		}
	}, [phase])

	useEffect(() => {
		if (redirectingToInnerTarget) return
		if (!targetUrl || !shareUrl) {
			document.title = 'Get Beamio App'
			return
		}

		let cancelled = false
		void (async () => {
			const meta = await fetchCouponClaimShareMeta(shareUrl)
			if (cancelled) return
			if (meta) {
				setShareMeta(meta)
				applyCouponClaimShareMeta(meta)
			} else {
				document.title = 'Get Beamio App'
			}
		})()

		return () => {
			cancelled = true
		}
	}, [redirectingToInnerTarget, shareUrl, targetUrl])

	const discoverMerchantCardAddress = useMemo(() => {
		if (shareMeta && isDiscoverMerchantMeta(shareMeta) && shareMeta.cardAddress) {
			try {
				return ethers.getAddress(shareMeta.cardAddress)
			} catch {
				return null
			}
		}
		return parseDiscoverMerchantCardFromTarget(targetUrl)
	}, [shareMeta, targetUrl])

	const discoverReferrerEoa = useMemo(
		() => parseDiscoverMerchantOpenFromTarget(targetUrl)?.referrerEoa ?? null,
		[targetUrl],
	)

	const isDiscoverMerchantShare = Boolean(
		discoverMerchantCardAddress &&
			((shareMeta && isDiscoverMerchantMeta(shareMeta)) ||
				Boolean(parseDiscoverMerchantOpenFromTarget(targetUrl)?.cardAddress)),
	)

	const effectiveShareMeta = useMemo((): CouponClaimShareMeta | null => {
		if (shareMeta) return shareMeta
		if (!discoverMerchantCardAddress || !shareUrl) return null
		return {
			cardAddress: discoverMerchantCardAddress,
			couponId: '',
			shareKind: 'discover_merchant',
			distributionKind: 'merchant',
			catalogLayout: 'videoOg',
			title: 'Merchant',
			subtitle: '',
			iconUrl: '',
			backgroundImage: '',
			backgroundColorHex: '#2B2E3A',
			validBeforeSec: null,
			expiresLabel: 'VALID NOW',
			shareUrl,
			ogImageUrl: '',
		}
	}, [discoverMerchantCardAddress, shareMeta, shareUrl])

	useEffect(() => {
		if (!discoverMerchantCardAddress) {
			setDiscoverSocialStats(null)
			return
		}
		let cancelled = false
		void (async () => {
			const summary = await fetchCardProgramSocialSummary(discoverMerchantCardAddress)
			if (!cancelled && summary) setDiscoverSocialStats(summary)
		})()
		return () => {
			cancelled = true
		}
	}, [discoverMerchantCardAddress])

	/** Silent web_ / existing PWA wallet for top-right @beamioTag capsule (Discover merchant share). */
	useEffect(() => {
		if (redirectingToInnerTarget || !isDiscoverMerchantShare) return
		let cancelled = false
		void (async () => {
			const profile = await loadAppDownloadVisitWalletProfile()
			if (!cancelled && profile) setVisitWalletProfile(profile)
		})()
		return () => {
			cancelled = true
		}
	}, [isDiscoverMerchantShare, redirectingToInnerTarget])

	useEffect(() => {
		if (!myWalletOpen) return
		const prev = document.body.style.overflow
		document.body.style.overflow = 'hidden'
		return () => {
			document.body.style.overflow = prev
		}
	}, [myWalletOpen])

	/**
	 * Fire native scheme probe immediately on load — iOS only shows "Open in Beamio" when
	 * navigation still carries the user tap gesture; deferring until share meta fetch breaks that.
	 */
	useLayoutEffect(() => {
		if (redirectingToInnerTarget) return

		let cancelled = false

		void (async () => {
			if (!isMobileDevice()) {
				setPhase('desktop')
				return
			}

			if (isIosDevice() && !targetUrl) {
				window.location.replace(BEAMIO_IOS_STORE_URL)
				return
			}

			setPhase('checking')
			window.scrollTo(0, 0)
			const result = await attemptOpenNativeBeamioApp(location.search)
			if (cancelled) return
			setIosNativeProbe(result)

			if (result === 'opened') {
				// Custom scheme may not leave the page; avoid infinite "checking" spinner.
				window.setTimeout(() => {
					if (!cancelled) setPhase('install')
				}, 3500)
				return
			}
			setPhase('install')
		})()

		return () => {
			cancelled = true
		}
	}, [location.search, redirectingToInnerTarget, targetUrl])

	const storeUrl = isIosDevice()
		? BEAMIO_IOS_STORE_URL
		: isAndroidDevice()
			? BEAMIO_ANDROID_STORE_URL
			: BEAMIO_ANDROID_STORE_URL

	const couponPreview =
		effectiveShareMeta && shareUrl && (phase !== 'checking' || isDiscoverMerchantShare) ? (
			isDiscoverMerchantShare && discoverMerchantCardAddress ? (
				<DiscoverMerchantShareDetail
					cardAddress={discoverMerchantCardAddress}
					shareMeta={effectiveShareMeta}
					socialStats={discoverSocialStats}
					userEoa={visitWalletProfile?.eoaAddress ?? null}
					referrerEoa={discoverReferrerEoa}
				/>
			) : !isDiscoverMerchantShare ? (
				<CouponSharePreview meta={effectiveShareMeta} />
			) : null
		) : null

	const showCouponClaimActions =
		effectiveShareMeta &&
		targetUrl &&
		isCouponShareMeta(effectiveShareMeta) &&
		phase !== 'checking' &&
		/** Discover merchant landing 已在页内展示详情，桌面端无需底部 CTA。 */
		(!isDiscoverMerchantShare || isMobileDevice())

	const couponClaimActions = showCouponClaimActions ? (
			<CouponShareClaimActions
				targetUrl={targetUrl}
				search={location.search}
				onIosNativeProbeResult={setIosNativeProbe}
				shareKind={effectiveShareMeta.shareKind}
				showClaimInApp={isMobileDevice()}
			/>
		) : null

	return (
		<div
			className={`font-sans text-slate-900 selection:bg-[#1562f0]/20 antialiased ${
				isDiscoverMerchantShare ? 'bg-[#f5f7f9]' : 'bg-[#f8fafc]'
			} ${
				phase === 'checking' && !isDiscoverMerchantShare
					? 'relative h-[100dvh] max-h-[100dvh] overflow-hidden'
					: 'min-h-[100dvh]'
			}`}
		>
			{phase === 'checking' && !isDiscoverMerchantShare ? (
				<div
					className="pointer-events-none fixed inset-0 z-[90] bg-[#2c2f31]/35 backdrop-blur-[1px]"
					aria-hidden
				/>
			) : null}
			{isDiscoverMerchantShare &&
			discoverMerchantCardAddress &&
			!myWalletOpen ? (
				<AppDownloadDiscoverTopBar
					profile={visitWalletProfile}
					cardAddress={discoverMerchantCardAddress}
					merchantTitle={
						effectiveShareMeta?.title ||
						effectiveShareMeta?.merchantName ||
						'Merchant'
					}
					referrerEoa={discoverReferrerEoa}
					opacity={capsuleOpacity}
					socialStats={discoverSocialStats}
					onOpenWallet={() => setMyWalletOpen(true)}
					onOpenPayCode={() => setPayCodeOpen(true)}
					onSocialStatsRefresh={() => {
						void fetchCardProgramSocialSummary(discoverMerchantCardAddress).then((summary) => {
							if (summary) setDiscoverSocialStats(summary)
						})
					}}
				/>
			) : null}
			<AppDownloadPayCodeSheet
				isOpen={payCodeOpen}
				onClose={() => setPayCodeOpen(false)}
				profile={visitWalletProfile}
				onProfileRefresh={setVisitWalletProfile}
			/>
			{myWalletOpen && visitWalletProfile ? (
				<AppDownloadMyWalletPanel
					profile={visitWalletProfile}
					onClose={() => setMyWalletOpen(false)}
					openInAppUrl={targetUrl || undefined}
					onProfileRefresh={setVisitWalletProfile}
				/>
			) : null}
			<main
				className={`relative z-[1] w-full min-w-0 ${
					isDiscoverMerchantShare
						? 'max-w-none px-0 pb-0 pt-0 text-left'
						: 'mx-auto max-w-lg px-4 pb-16 pt-[max(1rem,env(safe-area-inset-top,0px))] text-center sm:px-6'
				}`}
			>
				<div
					className={`flex w-full min-w-0 max-w-full flex-col ${
						isDiscoverMerchantShare
							? 'items-stretch justify-start'
							: 'items-center justify-center py-6'
					}`}
				>
				{phase === 'checking' && (
					<div className="w-full min-w-0 max-w-full space-y-6">
						{couponPreview}
						{!isDiscoverMerchantShare ? (
							<>
								<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1562f0]/10">
									<Loader2 className="h-8 w-8 animate-spin text-[#1562f0]" />
								</div>
								<div>
									<h1 className="text-2xl font-bold tracking-tight text-slate-900">
										{shareMeta
											? shareMeta.shareKind === 'discover_merchant'
												? 'Opening Beamio'
												: 'Opening Beamio Coupon'
											: 'Opening Beamio'}
									</h1>
									<p className="mt-3 text-slate-600">Checking for the Beamio app on your device…</p>
								</div>
							</>
						) : (
							<div className="mx-auto max-w-lg px-4 pb-6 text-center">
								<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1562f0]/10">
									<Loader2 className="h-6 w-6 animate-spin text-[#1562f0]" />
								</div>
								<p className="mt-3 text-[14px] font-medium text-slate-600">
									Checking for the Beamio app on your device…
								</p>
							</div>
						)}
					</div>
				)}

				{phase === 'install' && (
					<div
						className={`w-full min-w-0 max-w-full ${
							isDiscoverMerchantShare ? 'space-y-4' : 'space-y-8'
						}`}
					>
						{couponPreview}
						{couponClaimActions ? (
							<div className={isDiscoverMerchantShare ? 'mx-auto max-w-lg px-4 pb-8' : undefined}>
								{couponClaimActions}
							</div>
						) : null}
						{!shareMeta ? (
							<>
								<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg">
									<Download className="h-8 w-8" />
								</div>
								<div>
									<h1 className="text-3xl font-black tracking-tight text-slate-900">Install Beamio</h1>
									<p className="mt-4 text-lg leading-relaxed text-slate-600">
										The Beamio app is not installed on this device. Download it from your app store to manage
										balances, programs, and tap-to-pay features.
									</p>
								</div>

								<div className="mx-auto w-full max-w-xs space-y-3">
									{isAndroidDevice() && (
										<a
											href={BEAMIO_ANDROID_STORE_URL}
											target="_blank"
											rel="noopener noreferrer"
											className="flex justify-center transition-opacity hover:opacity-80"
										>
											<img
												src="/google-play-badge.png"
												alt="Get it on Google Play"
												className="h-12 w-auto max-w-full"
											/>
										</a>
									)}
									<a
										href={storeUrl}
										className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1562f0] px-6 py-3.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-[#1250c4]"
									>
										<Download className="h-4 w-4" />
										Open app store
									</a>
								</div>
							</>
						) : null}
					</div>
				)}

				{phase === 'desktop' && (
					<div
						className={`w-full min-w-0 max-w-full ${
							isDiscoverMerchantShare ? 'space-y-4' : 'space-y-8'
						}`}
					>
						{couponPreview}
						{couponClaimActions ? (
							<div className={isDiscoverMerchantShare ? 'mx-auto max-w-lg px-4 pb-8' : undefined}>
								{couponClaimActions}
							</div>
						) : null}
						{!shareMeta ? (
							<>
								<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 text-purple-700">
									<Smartphone className="h-8 w-8" />
								</div>
								<div>
									<h1 className="text-3xl font-black tracking-tight text-slate-900">Get Beamio on mobile</h1>
									<p className="mt-4 text-lg leading-relaxed text-slate-600">
										Open this page on your phone to launch the Beamio app, or install it from the stores below.
									</p>
								</div>

								<div className="mx-auto w-full max-w-xs space-y-3">
									<a
										href={BEAMIO_IOS_STORE_URL}
										target="_blank"
										rel="noopener noreferrer"
										className="flex justify-center transition-opacity hover:opacity-80"
									>
										<img
											src="/app-store-badge.png"
											alt="Download Beamio on the App Store"
											className="h-12 w-auto max-w-full"
										/>
									</a>
									<a
										href={BEAMIO_ANDROID_STORE_URL}
										target="_blank"
										rel="noopener noreferrer"
										className="flex justify-center transition-opacity hover:opacity-80"
									>
										<img
											src="/google-play-badge.png"
											alt="Get Beamio on Google Play"
											className="h-12 w-auto max-w-full"
										/>
									</a>
								</div>
							</>
						) : null}
					</div>
				)}
				</div>
			</main>
		</div>
	)
}
