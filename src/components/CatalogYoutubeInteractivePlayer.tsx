import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { CatalogVideoOgTapPlayOverlay } from './CatalogVideoOgTapPlayOverlay'
import {
	CATALOG_VIDEO_OG_YOUTUBE_EMBED_BOTTOM_CROP_PX,
	CATALOG_VIDEO_OG_YOUTUBE_EMBED_HOST,
	catalogVideoOgYoutubeEmbedIframeCropStyle,
	catalogVideoOgYoutubePlayerVars,
	formatYoutubeScrubberTime,
} from '../utils/catalogProductionVideoOg'
import { loadYoutubeIframeApi, type YtPlayerInstance } from '../utils/youtubeIframeApi'

const YT_ENDED = 0
const YT_PLAYING = 1

type CatalogYoutubeInteractivePlayerProps = {
	videoId: string
	/** YouTube hqdefault or catalog thumb — shown until playback starts (iOS Safari). */
	posterUrl?: string
}

/** YouTube embed with native chrome hidden + Beamio scrubber timeline. */
export function CatalogYoutubeInteractivePlayer({ videoId, posterUrl }: CatalogYoutubeInteractivePlayerProps) {
	const mountId = useId().replace(/:/g, '')
	const playerRef = useRef<YtPlayerInstance | null>(null)
	const [duration, setDuration] = useState(0)
	const [currentTime, setCurrentTime] = useState(0)
	const [isPlaying, setIsPlaying] = useState(false)
	const [isScrubbing, setIsScrubbing] = useState(false)
	const handlePlayRequest = useCallback(() => {
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
						const nextDuration = event.target.getDuration()
						if (Number.isFinite(nextDuration) && nextDuration > 0) {
							setDuration(nextDuration)
						}
					},
					onStateChange: (event) => {
						if (event.data === YT_ENDED) {
							event.target.seekTo(0, true)
							event.target.playVideo()
							setCurrentTime(0)
							setIsPlaying(true)
							return
						}
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

	useEffect(() => {
		if (!isPlaying || isScrubbing) return
		let cancelled = false
		let tickTimer: ReturnType<typeof setTimeout> | undefined
		const scheduleTick = () => {
			tickTimer = setTimeout(() => {
				if (cancelled || !playerRef.current) return
				try {
					setCurrentTime(playerRef.current.getCurrentTime())
				} catch {
					return
				}
				if (!cancelled) scheduleTick()
			}, 250)
		}
		scheduleTick()
		return () => {
			cancelled = true
			if (tickTimer !== undefined) clearTimeout(tickTimer)
		}
	}, [isPlaying, isScrubbing])

	const max = duration > 0 ? duration : 0
	const scrubValue = max > 0 ? Math.min(currentTime, max) : 0
	const bottomChromeBlockPx = CATALOG_VIDEO_OG_YOUTUBE_EMBED_BOTTOM_CROP_PX

	const poster = posterUrl?.trim()

	return (
		<div className="relative h-full w-full overflow-hidden">
			{poster && !isPlaying ? (
				<img
					src={poster}
					alt=""
					className="absolute inset-0 z-[1] h-full w-full object-cover"
					draggable={false}
				/>
			) : null}
			<div
				id={mountId}
				className="absolute left-0 z-[2] w-full border-0"
				style={catalogVideoOgYoutubeEmbedIframeCropStyle()}
				title="Catalog video"
			/>
			<CatalogVideoOgTapPlayOverlay visible={!isPlaying} onPlay={handlePlayRequest} />
			{/* Block clicks on residual YouTube outbound chrome (Open in YouTube / More videos). */}
			<div
				className="absolute inset-x-0 bottom-0 z-10"
				style={{ height: bottomChromeBlockPx }}
				aria-hidden
			/>
			<div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/80 via-black/45 to-transparent px-3 pb-2 pt-10">
				<div className="pointer-events-auto flex items-center gap-2">
					<span className="w-10 shrink-0 text-right text-[11px] tabular-nums text-white/85">
						{formatYoutubeScrubberTime(scrubValue)}
					</span>
					<input
						type="range"
						min={0}
						max={max || 1}
						step={0.1}
						value={scrubValue}
						disabled={max <= 0}
						aria-label="Video progress"
						className="h-1 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-white/25 accent-red-500 disabled:cursor-not-allowed [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-red-500 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-red-500"
						onPointerDown={() => setIsScrubbing(true)}
						onPointerUp={() => setIsScrubbing(false)}
						onChange={(event) => {
							const next = Number(event.target.value)
							setCurrentTime(next)
							playerRef.current?.seekTo(next, true)
						}}
					/>
					<span className="w-10 shrink-0 text-[11px] tabular-nums text-white/85">
						{formatYoutubeScrubberTime(max)}
					</span>
				</div>
			</div>
		</div>
	)
}
