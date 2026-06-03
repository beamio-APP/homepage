import { useCallback } from 'react'
import { CatalogVideoOgTapPlayOverlay } from './CatalogVideoOgTapPlayOverlay'
import { youtubeWatchUrlFromVideoId } from '../utils/catalogProductionVideoOg'

const BANNER_MEDIA_CLASS = 'h-full w-full object-cover'

type CatalogVideoOgYoutubePosterPlayProps = {
	videoId: string
	/** hqdefault / catalog banner — fills aspect-video without letterbox bars. */
	posterUrl?: string
}

/** YouTube catalog share: poster fill + open watch URL (no iframe embed). */
export function CatalogVideoOgYoutubePosterPlay({ videoId, posterUrl }: CatalogVideoOgYoutubePosterPlayProps) {
	const poster = posterUrl?.trim() || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
	const watchUrl = youtubeWatchUrlFromVideoId(videoId)

	const openYoutube = useCallback(() => {
		window.open(watchUrl, '_blank', 'noopener,noreferrer')
	}, [watchUrl])

	return (
		<div className="relative h-full w-full overflow-hidden bg-black">
			<img src={poster} alt="" className={BANNER_MEDIA_CLASS} draggable={false} />
			<CatalogVideoOgTapPlayOverlay visible onPlay={openYoutube} />
			<a
				href={watchUrl}
				target="_blank"
				rel="noopener noreferrer"
				className="sr-only"
				aria-label="Play on YouTube"
			>
				Play on YouTube
			</a>
		</div>
	)
}
