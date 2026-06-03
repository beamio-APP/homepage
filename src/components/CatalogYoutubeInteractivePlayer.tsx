import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { CatalogVideoOgTapPlayOverlay } from './CatalogVideoOgTapPlayOverlay'
import {
	CATALOG_VIDEO_OG_YOUTUBE_EMBED_BOTTOM_MASK_PX,
	CATALOG_VIDEO_OG_YOUTUBE_EMBED_TOP_MASK_PX,
	CATALOG_VIDEO_OG_YOUTUBE_EMBED_HOST,
	catalogVideoOgYoutubeEmbedIframeCropStyle,
	catalogVideoOgYoutubePlayerVars,
	formatYoutubeScrubberTime,
} from '../utils/catalogProductionVideoOg'
import { loadYoutubeIframeApi, type YtPlayerInstance } from '../utils/youtubeIframeApi'

const YT_ENDED = 0
const YT_PLAYING = 1
const YT_BUFFERING = 3
const SCRUBBER_IDLE_HIDE_MS = 5000

type CatalogYoutubeInteractivePlayerProps = {
	videoId: string
	/** YouTube hqdefault or catalog thumb — shown until playback starts (iOS Safari). */
	posterUrl?: string
}

/** YouTube embed with native chrome hidden + Beamio scrubber timeline. */
export function CatalogYoutubeInteractivePlayer({ videoId, posterUrl }: CatalogYoutubeInteractivePlayerProps) {
	const mountId = useId().replace(/:/g, '')
	const playerRef = useRef<YtPlayerInstance | null>(null)
	const scrubPreviewRef = useRef(0)
	const scrubberIdleTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
	const [duration, setDuration] = useState(0)
	const [currentTime, setCurrentTime] = useState(0)
	const [isPlaying, setIsPlaying] = useState(false)
	const [isScrubbing, setIsScrubbing] = useState(false)
	const [scrubPreview, setScrubPreview] = useState<number | null>(null)
	const [hasUserStarted, setHasUserStarted] = useState(false)
	const [scrubberVisible, setScrubberVisible] = useState(false)

	const clearScrubberIdleTimer = useCallback(() => {
		if (scrubberIdleTimerRef.current !== undefined) {
			clearTimeout(scrubberIdleTimerRef.current)
			scrubberIdleTimerRef.current = undefined
		}
	}, [])

	const hideScrubber = useCallback(() => {
		clearScrubberIdleTimer()
		setScrubberVisible(false)
	}, [clearScrubberIdleTimer])

	const scheduleScrubberIdleHide = useCallback(() => {
		clearScrubberIdleTimer()
		scrubberIdleTimerRef.current = setTimeout(() => {
			scrubberIdleTimerRef.current = undefined
			setScrubberVisible(false)
		}, SCRUBBER_IDLE_HIDE_MS)
	}, [clearScrubberIdleTimer])

	const revealScrubber = useCallback(() => {
		if (!hasUserStarted) return
		setScrubberVisible(true)
		scheduleScrubberIdleHide()
	}, [hasUserStarted, scheduleScrubberIdleHide])

	const handlePlayerPointerLeave = useCallback(() => {
		if (isScrubbing) return
		hideScrubber()
	}, [hideScrubber, isScrubbing])

	const handlePlayRequest = useCallback(() => {
		setHasUserStarted(true)
		setScrubberVisible(true)
		scheduleScrubberIdleHide()
		try {
			playerRef.current?.playVideo()
		} catch {
			/* ignore */
		}
	}, [scheduleScrubberIdleHide])

	const seekTo = useCallback((seconds: number, allowSeekAhead = true) => {
		const clamped = Math.max(0, duration > 0 ? Math.min(seconds, duration) : seconds)
		setCurrentTime(clamped)
		try {
			playerRef.current?.seekTo(clamped, allowSeekAhead)
		} catch {
			/* ignore */
		}
	}, [duration])

	const resumeAfterSeek = useCallback(() => {
		try {
			playerRef.current?.playVideo()
		} catch {
			/* ignore */
		}
	}, [])

	const commitScrub = useCallback(() => {
		const seconds = scrubPreviewRef.current
		setScrubPreview(null)
		setIsScrubbing(false)
		seekTo(seconds, true)
		if (hasUserStarted) resumeAfterSeek()
	}, [hasUserStarted, resumeAfterSeek, seekTo])

	const endScrub = useCallback(() => {
		if (!isScrubbing) return
		commitScrub()
	}, [commitScrub, isScrubbing])

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
						setIsPlaying(event.data === YT_PLAYING || event.data === YT_BUFFERING)
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

	/** YouTube API may report duration late on mobile; keep scrubber enabled once known. */
	useEffect(() => {
		if (!hasUserStarted && !isPlaying) return
		let cancelled = false
		let timer: ReturnType<typeof setTimeout> | undefined
		const pollDuration = () => {
			if (cancelled || !playerRef.current) return
			try {
				const nextDuration = playerRef.current.getDuration()
				if (Number.isFinite(nextDuration) && nextDuration > 0) {
					setDuration(nextDuration)
					return
				}
			} catch {
				/* ignore */
			}
			timer = setTimeout(pollDuration, 400)
		}
		pollDuration()
		return () => {
			cancelled = true
			if (timer !== undefined) clearTimeout(timer)
		}
	}, [hasUserStarted, isPlaying, videoId])

	useEffect(() => {
		if (isScrubbing) {
			clearScrubberIdleTimer()
			setScrubberVisible(true)
			return
		}
		if (scrubberVisible && hasUserStarted) scheduleScrubberIdleHide()
	}, [clearScrubberIdleTimer, hasUserStarted, isScrubbing, scheduleScrubberIdleHide, scrubberVisible])

	useEffect(() => () => clearScrubberIdleTimer(), [clearScrubberIdleTimer])

	const poster = posterUrl?.trim()
	const max = duration > 0 ? duration : 0
	const scrubValue = max > 0 ? Math.min(currentTime, max) : 0
	const rangeValue = isScrubbing && scrubPreview !== null ? scrubPreview : scrubValue
	const showPoster = Boolean(poster) && !hasUserStarted
	const topChromeMaskPx = CATALOG_VIDEO_OG_YOUTUBE_EMBED_TOP_MASK_PX
	const bottomChromeMaskPx = CATALOG_VIDEO_OG_YOUTUBE_EMBED_BOTTOM_MASK_PX
	const showScrubberChrome = hasUserStarted && (scrubberVisible || isScrubbing)

	return (
		<div
			className="relative h-full w-full overflow-hidden"
			onMouseEnter={revealScrubber}
			onMouseLeave={handlePlayerPointerLeave}
			onMouseMove={revealScrubber}
			onPointerDown={() => {
				if (hasUserStarted) revealScrubber()
			}}
		>
			{showPoster ? (
				<img
					src={poster}
					alt=""
					className="absolute inset-0 z-[1] h-full w-full object-cover"
					draggable={false}
				/>
			) : null}
			<div
				id={mountId}
				className="catalog-youtube-embed-mount absolute z-[2] border-0"
				style={catalogVideoOgYoutubeEmbedIframeCropStyle()}
				title="Catalog video"
			/>
			<CatalogVideoOgTapPlayOverlay
				visible={!hasUserStarted && !isPlaying}
				onPlay={handlePlayRequest}
			/>
			{/* Opaque masks — hide YouTube top/bottom chrome (controls:0 still shows on mobile). */}
			<div
				className="pointer-events-auto absolute inset-x-0 top-0 z-[30] bg-black"
				style={{ height: topChromeMaskPx }}
				aria-hidden
			/>
			<div
				className="pointer-events-auto absolute inset-x-0 bottom-0 z-[30] bg-black"
				style={{ height: bottomChromeMaskPx }}
				aria-hidden
			/>
			<div
				className={`absolute inset-x-0 bottom-0 z-40 px-3 pb-3 pt-8 transition-opacity duration-300 ease-out ${
					showScrubberChrome ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
				}`}
				aria-hidden={!showScrubberChrome}
			>
				<div className="rounded-lg bg-gradient-to-t from-black/85 via-black/50 to-transparent px-1 pb-1 pt-6">
					<div className="flex items-center gap-2">
						<span className="w-10 shrink-0 text-right text-[11px] tabular-nums text-white/85">
							{formatYoutubeScrubberTime(rangeValue)}
						</span>
						<input
							type="range"
							min={0}
							max={max || 1}
							step={0.1}
							value={rangeValue}
							disabled={max <= 0}
							aria-label="Video progress"
							className="catalog-video-scrubber-range h-4 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-transparent accent-red-500 disabled:cursor-not-allowed"
							style={{ touchAction: 'none' }}
							onPointerDown={(event) => {
								revealScrubber()
								const next = Number(event.currentTarget.value)
								scrubPreviewRef.current = next
								setScrubPreview(next)
								setIsScrubbing(true)
							}}
							onPointerUp={endScrub}
							onPointerCancel={endScrub}
							onLostPointerCapture={endScrub}
							onInput={(event) => {
								const next = Number(event.target.value)
								scrubPreviewRef.current = next
								setScrubPreview(next)
							}}
							onChange={(event) => {
								const next = Number(event.target.value)
								scrubPreviewRef.current = next
								setScrubPreview(next)
								if (!isScrubbing) {
									seekTo(next, true)
									if (hasUserStarted) resumeAfterSeek()
								}
							}}
						/>
						<span className="w-10 shrink-0 text-[11px] tabular-nums text-white/85">
							{formatYoutubeScrubberTime(max)}
						</span>
					</div>
				</div>
			</div>
		</div>
	)
}
