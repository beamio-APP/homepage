/**
 * Mirror of `src/x402sdk/src/catalogProductionVideoOg.ts` — catalog video → YouTube OG copy mapping.
 * Right thumbnail: 480×360 (hqdefault). See repo `.cursor/rules/beamio-catalog-video-og-thumbnail.mdc`.
 */

/** YouTube hqdefault — keep in sync with bizSite `catalogProductionVideoOgConstants.ts`. */
export const CATALOG_VIDEO_OG_RIGHT_THUMB_WIDTH = 480
export const CATALOG_VIDEO_OG_RIGHT_THUMB_HEIGHT = 360

export const CATALOG_VIDEO_OG_RIGHT_THUMB_SLOT_CLASSNAME =
	'relative w-14 shrink-0 aspect-[4/3] overflow-hidden rounded-xl bg-[#0f172a]/90 ring-1 ring-[#e5e9eb]'

/** OG raster width (`couponClaimShare` OG_WIDTH). App-download ticket uses `max-w-lg` (512px). */
export const CATALOG_VIDEO_OG_SHARE_LAYOUT_WIDTH_PX = 1200
export const CATALOG_VIDEO_OG_SHARE_BANNER_HEIGHT_PX = 258
export const CATALOG_VIDEO_OG_APP_DOWNLOAD_TICKET_MAX_WIDTH_PX = 512
export const CATALOG_VIDEO_OG_APP_DOWNLOAD_BANNER_HEIGHT_PX = Math.round(
	(CATALOG_VIDEO_OG_SHARE_BANNER_HEIGHT_PX * CATALOG_VIDEO_OG_APP_DOWNLOAD_TICKET_MAX_WIDTH_PX) /
		CATALOG_VIDEO_OG_SHARE_LAYOUT_WIDTH_PX
)

/** Business Catalogs / Distribution share preview: metadata only under banner (no right thumb). */
export const CATALOG_VIDEO_OG_BELOW_BANNER_ROW_OG_PREVIEW_CLASSNAME = 'w-full px-4 pb-4 pt-3'

export type CatalogProductionVideoOgLayout = 'default' | 'videoOg'

export type CouponClaimShareMetaVideoFields = {
	catalogLayout?: CatalogProductionVideoOgLayout
	title: string
	subtitle: string
	publisherLine?: string
	iconUrl: string
	backgroundImage: string
}

const PRODUCTION_BACKGROUND_YOUTUBE_MIME = 'video/youtube'

export function inferProductionImageMimeFromUrl(url: string): string {
	const u = url.trim()
	if (!u) return ''
	if (u.includes('youtube.com') || u.includes('youtu.be')) return PRODUCTION_BACKGROUND_YOUTUBE_MIME
	if (/\.(mp4|webm|mov|m4v|ogv)(\?|&|$)/i.test(u)) return 'video/mp4'
	if (/\.(jpe?g|png|gif|webp|avif)(\?|#|$)/i.test(u)) return 'image/jpeg'
	return ''
}

export function youtubeThumbnailUrlFromProductionUrl(raw: string): string | null {
	const id = parseYoutubeVideoId(raw)
	if (!id) return null
	return `https://img.youtube.com/vi/${id}/hqdefault.jpg`
}

/** Parse `https://img.youtube.com/vi/{id}/hqdefault.jpg` → video id. */
export function parseYoutubeVideoIdFromThumbUrl(raw: string): string | null {
	const match = raw.trim().match(/img\.youtube\.com\/vi\/([a-zA-Z0-9_-]{11})\//i)
	return match?.[1] ?? null
}

export function parseYoutubeVideoId(raw: string): string | null {
	const input = String(raw ?? '').trim()
	if (!input) return null
	try {
		const url = input.startsWith('http') ? new URL(input) : new URL(`https://${input}`)
		const host = url.hostname.replace(/^www\./, '').toLowerCase()
		if (host === 'youtu.be') {
			const id = url.pathname.replace(/^\//, '').split('/')[0]?.trim()
			return id && /^[\w-]{6,}$/.test(id) ? id : null
		}
		if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
			if (url.pathname === '/watch') {
				const id = url.searchParams.get('v')?.trim()
				return id && /^[\w-]{6,}$/.test(id) ? id : null
			}
			const shorts = url.pathname.match(/^\/shorts\/([\w-]{6,})/)
			if (shorts?.[1]) return shorts[1]
			const embed = url.pathname.match(/^\/embed\/([\w-]{6,})/)
			if (embed?.[1]) return embed[1]
		}
	} catch {
		return null
	}
	return parseYoutubeVideoIdFromThumbUrl(input)
}

export function catalogVideoOgYoutubePlayerVars(videoId: string): Record<string, string | number> {
	return {
		rel: 0,
		playsinline: 1,
		modestbranding: 1,
		/** Hide native bar (Share / Open in YouTube); custom scrubber rendered in-app. */
		controls: 0,
		autohide: 1,
		cc_load_policy: 0,
		iv_load_policy: 3,
		disablekb: 1,
		fs: 0,
		enablejsapi: 1,
		loop: 1,
		playlist: videoId,
		origin: typeof window !== 'undefined' ? window.location.origin : '',
	}
}

export function youtubeWatchUrlFromVideoId(videoId: string): string {
	const id = videoId.trim()
	return `https://www.youtube.com/watch?v=${encodeURIComponent(id)}`
}

/** Same-origin MP4 mirror (Cluster `catalogYoutubeStreamProxy`). */
export function catalogYoutubeProxyStreamUrl(videoId: string): string {
	const id = videoId.trim()
	return `/api/catalogYoutubeStream?v=${encodeURIComponent(id)}`
}

export function youtubeEmbedUrlFromVideoId(videoId: string): string {
	const params = new URLSearchParams()
	for (const [key, value] of Object.entries(catalogVideoOgYoutubePlayerVars(videoId))) {
		params.set(key, String(value))
	}
	return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`
}

export function isYoutubeProductionVideo(args: {
	videoUrl?: string
	mime?: string
	fallbackBannerUrl?: string
}): boolean {
	const mime = args.mime?.trim().toLowerCase() ?? ''
	if (mime === 'video/youtube') return true
	const id =
		parseYoutubeVideoId(args.videoUrl ?? '') ||
		parseYoutubeVideoIdFromThumbUrl(args.fallbackBannerUrl ?? '')
	return Boolean(id)
}

export function resolveYoutubeVideoIdForSharePlayer(args: {
	productionVideoUrl?: string
	bannerImageUrl?: string
	iconUrl?: string
}): string | null {
	return (
		parseYoutubeVideoId(args.productionVideoUrl ?? '') ||
		parseYoutubeVideoIdFromThumbUrl(args.bannerImageUrl ?? '') ||
		parseYoutubeVideoIdFromThumbUrl(args.iconUrl ?? '') ||
		parseYoutubeVideoId(args.bannerImageUrl ?? '')
	)
}

/** Interactive app-download / share: native `<video>` when API video URL differs from banner thumb. */
export function resolveCatalogShareInteractiveNativeVideoUrl(args: {
	productionVideoUrl?: string
	productionVideoMime?: string
	bannerImageUrl?: string
}): string | null {
	const url = (args.productionVideoUrl ?? '').trim()
	if (!url) return null
	const banner = (args.bannerImageUrl ?? '').trim()
	const mime = (args.productionVideoMime ?? '').trim() || inferProductionImageMimeFromUrl(url)
	if (isYoutubeProductionVideo({ videoUrl: url, mime, fallbackBannerUrl: banner })) return null
	const mimeLower = mime.toLowerCase()
	if (mimeLower.startsWith('video/') && mimeLower !== PRODUCTION_BACKGROUND_YOUTUBE_MIME) {
		if (!/\.(jpe?g|png|gif|webp|avif)(\?|#|$)/i.test(url) && !url.includes('img.youtube.com')) {
			return url
		}
	}
	if (
		catalogVideoOgBannerShouldUseVideoElement({
			bannerImageUrl: banner || url,
			productionImage: url,
			productionImageMime: mime,
		})
	) {
		return url
	}
	return null
}

/** True when catalog videoOg banner slot should render `<video>` (uploaded clip), not `<img>`. */
export function catalogVideoOgBannerShouldUseVideoElement(args: {
	bannerImageUrl: string
	productionImage: string
	productionImageMime?: string
}): boolean {
	const banner = args.bannerImageUrl.trim()
	const production = args.productionImage.trim()
	if (!banner) return false

	const lower = banner.toLowerCase()
	if (lower.startsWith('data:image/')) return false
	if (/\.(jpe?g|png|gif|webp|avif)(\?|#|$)/i.test(lower)) return false
	if (youtubeThumbnailUrlFromProductionUrl(banner)) return false

	const bannerIsProductionAsset =
		production.length > 0 &&
		(banner === production ||
			(banner.startsWith('blob:') && production.startsWith('blob:') && banner === production))

	if (!bannerIsProductionAsset) return false

	return (
		/\.(mp4|webm|mov|m4v|ogv)(\?|&|$)/i.test(lower) ||
		lower.startsWith('blob:') ||
		lower.startsWith('data:video/') ||
		(args.productionImageMime?.trim().toLowerCase() ?? '').startsWith('video/')
	)
}
