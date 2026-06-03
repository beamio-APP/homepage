import { useEffect, useId, useRef } from 'react'
import {
	CATALOG_VIDEO_OG_YOUTUBE_EMBED_HOST,
	catalogVideoOgYoutubePlayerVars,
} from '../utils/catalogProductionVideoOg'
import { loadYoutubeIframeApi, type YtPlayerInstance } from '../utils/youtubeIframeApi'

type CatalogYoutubeInteractivePlayerProps = {
	videoId: string
	/** @deprecated Poster unused — YouTube native UI handles playback. */
	posterUrl?: string
}

/** YouTube IFrame API embed with native controls only. */
export function CatalogYoutubeInteractivePlayer({ videoId }: CatalogYoutubeInteractivePlayerProps) {
	const mountId = useId().replace(/:/g, '')
	const playerRef = useRef<YtPlayerInstance | null>(null)

	useEffect(() => {
		let cancelled = false

		void loadYoutubeIframeApi().then(() => {
			if (cancelled || !window.YT?.Player) return
			const player = new window.YT.Player(mountId, {
				host: CATALOG_VIDEO_OG_YOUTUBE_EMBED_HOST,
				videoId,
				width: '100%',
				height: '100%',
				playerVars: catalogVideoOgYoutubePlayerVars(videoId),
				events: {
					onReady: (event) => {
						playerRef.current = event.target
					},
				},
			})
			playerRef.current = player
		})

		return () => {
			cancelled = true
			try {
				playerRef.current?.destroy()
			} catch {
				/* ignore */
			}
			playerRef.current = null
		}
	}, [mountId, videoId])

	return (
		<div className="relative h-full w-full overflow-hidden bg-black">
			<div id={mountId} className="absolute inset-0 h-full w-full border-0" title="Catalog video" />
		</div>
	)
}
