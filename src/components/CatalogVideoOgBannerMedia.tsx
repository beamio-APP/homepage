import { useRef, useState, type ReactNode } from 'react'
import { CatalogVideoOgTapPlayOverlay } from './CatalogVideoOgTapPlayOverlay'
import { CatalogVideoOgYoutubePosterPlay } from './CatalogVideoOgYoutubePosterPlay'
import {
	catalogVideoOgBannerShouldUseVideoElement,
	inferProductionImageMimeFromUrl,
	isYoutubeProductionVideo,
	resolveCatalogShareInteractiveNativeVideoUrl,
	resolveYoutubeVideoIdForSharePlayer,
} from '../utils/catalogProductionVideoOg'

const BANNER_MEDIA_CLASS = 'h-full w-full object-cover'

export type CatalogVideoOgBannerMediaProps = {
	bannerImageUrl: string
	productionVideoUrl?: string
	productionVideoMime?: string
	iconUrl?: string
	backgroundColorHex?: string
	previewBannerHeightPx: number
	/** Catalog Distribution share link — native `<video>` or YouTube poster → open watch URL (no iframe). */
	interactivePlayback?: boolean
}

function CatalogVideoShell({
	children,
	backgroundColorHex,
	previewBannerHeightPx,
	aspectVideo,
}: {
	children: ReactNode
	backgroundColorHex?: string
	previewBannerHeightPx: number
	aspectVideo: boolean
}) {
	const bg = backgroundColorHex?.trim() || '#0f172a'
	if (aspectVideo) {
		return (
			<div className="relative w-full overflow-hidden bg-black" style={{ backgroundColor: bg }}>
				<div className="relative aspect-video w-full">{children}</div>
			</div>
		)
	}
	return (
		<div
			className="relative w-full overflow-hidden"
			style={{ height: previewBannerHeightPx, backgroundColor: bg }}
		>
			{children}
		</div>
	)
}

function CatalogVideoOgInteractiveNativeVideo({
	src,
	posterUrl,
	backgroundColorHex,
	previewBannerHeightPx,
}: {
	src: string
	posterUrl?: string
	backgroundColorHex?: string
	previewBannerHeightPx: number
}) {
	const videoRef = useRef<HTMLVideoElement>(null)
	const [isPlaying, setIsPlaying] = useState(false)

	return (
		<CatalogVideoShell
			backgroundColorHex={backgroundColorHex}
			previewBannerHeightPx={previewBannerHeightPx}
			aspectVideo
		>
			<video
				ref={videoRef}
				src={src}
				className={`${BANNER_MEDIA_CLASS} relative z-0`}
				controls
				playsInline
				controlsList="nodownload"
				preload="metadata"
				poster={posterUrl}
				onPlay={() => setIsPlaying(true)}
				onPause={() => setIsPlaying(false)}
				onEnded={() => setIsPlaying(false)}
			/>
			<CatalogVideoOgTapPlayOverlay
				visible={!isPlaying}
				onPlay={() => {
					const el = videoRef.current
					if (!el) return
					void el.play().catch(() => {
						/* Safari may reject without gesture; overlay click is the gesture */
					})
				}}
			/>
		</CatalogVideoShell>
	)
}

/** Catalog videoOg banner — share page uses interactive player; static thumb fallback otherwise. */
export function CatalogVideoOgBannerMedia({
	bannerImageUrl,
	productionVideoUrl,
	productionVideoMime,
	iconUrl,
	backgroundColorHex,
	previewBannerHeightPx,
	interactivePlayback = false,
}: CatalogVideoOgBannerMediaProps) {
	const banner = bannerImageUrl.trim()
	const videoUrl = (productionVideoUrl ?? '').trim() || banner
	const mime = productionVideoMime?.trim() || inferProductionImageMimeFromUrl(videoUrl)
	const youtubeId = resolveYoutubeVideoIdForSharePlayer({
		productionVideoUrl: videoUrl,
		bannerImageUrl: banner,
		iconUrl,
	})
	const nativeInteractiveVideoUrl = resolveCatalogShareInteractiveNativeVideoUrl({
		productionVideoUrl: videoUrl,
		productionVideoMime: mime,
		bannerImageUrl: banner,
	})
	const useInteractive =
		interactivePlayback &&
		(youtubeId ||
			nativeInteractiveVideoUrl ||
			catalogVideoOgBannerShouldUseVideoElement({
				bannerImageUrl: banner,
				productionImage: videoUrl,
				productionImageMime: mime,
			}) ||
			isYoutubeProductionVideo({ videoUrl, mime, fallbackBannerUrl: banner }))

	if (useInteractive && youtubeId) {
		return (
			<CatalogVideoShell
				backgroundColorHex={backgroundColorHex}
				previewBannerHeightPx={previewBannerHeightPx}
				aspectVideo
			>
				<CatalogVideoOgYoutubePosterPlay videoId={youtubeId} posterUrl={banner} />
			</CatalogVideoShell>
		)
	}

	if (useInteractive && nativeInteractiveVideoUrl) {
		return (
			<CatalogVideoOgInteractiveNativeVideo
				src={nativeInteractiveVideoUrl}
				posterUrl={banner !== nativeInteractiveVideoUrl ? banner : undefined}
				backgroundColorHex={backgroundColorHex}
				previewBannerHeightPx={previewBannerHeightPx}
			/>
		)
	}

	if (!banner) {
		return (
			<CatalogVideoShell
				backgroundColorHex={backgroundColorHex}
				previewBannerHeightPx={previewBannerHeightPx}
				aspectVideo={false}
			>
				<div className="h-full w-full" />
			</CatalogVideoShell>
		)
	}

	return (
		<CatalogVideoShell
			backgroundColorHex={backgroundColorHex}
			previewBannerHeightPx={previewBannerHeightPx}
			aspectVideo={false}
		>
			<img src={banner} alt="" className={BANNER_MEDIA_CLASS} draggable={false} />
		</CatalogVideoShell>
	)
}
