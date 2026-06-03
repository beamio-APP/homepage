import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { CatalogVideoOgTapPlayOverlay } from './CatalogVideoOgTapPlayOverlay'
import {
	CATALOG_VIDEO_OG_YOUTUBE_EMBED_HOST,
	catalogVideoOgYoutubePlayerVars,
} from '../utils/catalogProductionVideoOg'
import { loadYoutubeIframeApi, type YtPlayerInstance } from '../utils/youtubeIframeApi'

const YT_PLAYING = 1

type CatalogYoutubeInteractivePlayerProps = {
	videoId: string
	/** hqdefault / catalog thumb — shown until playback starts (iOS Safari). */
	posterUrl?: string
}

/** YouTube IFrame API embed with native controls (no chrome masking). */
export function CatalogYoutubeInteractivePlayer({ videoId, posterUrl }: CatalogYoutubeInteractivePlayerProps) {
	const mountId = useId().replace(/:/g, '')
	const playerRef = useRef<YtPlayerInstance | null>(null)
	const [isPlaying, setIsPlaying] = useState(false)
	const [hasUserStarted, setHasUserStarted] = useState(false)

	const handlePlayRequest = useCallback(() => {
		setHasUserStarted(true)
		try {
			playerRef.current?.playVideo()
		} catch {
			/* ignore */
		}
	}, [])

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
					onStateChange: (event) => {
						setIsPlaying(event.data === YT_PLAYING)
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

	const poster = posterUrl?.trim()
	const showPoster = Boolean(poster) && !hasUserStarted && !isPlaying

	return (
		<div className="relative h-full w-full overflow-hidden bg-black">
			{showPoster ? (
				<img
					src={poster}
					alt=""
					className="absolute inset-0 z-[1] h-full w-full object-cover"
					draggable={false}
				/>
			) : null}
			<div id={mountId} className="absolute inset-0 z-[2] h-full w-full border-0" title="Catalog video" />
			<CatalogVideoOgTapPlayOverlay
				visible={!hasUserStarted && !isPlaying}
				onPlay={handlePlayRequest}
			/>
		</div>
	)
}
