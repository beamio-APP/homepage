import { useCallback, useEffect, useRef, useState } from 'react'
import { CatalogVideoOgTapPlayOverlay } from './CatalogVideoOgTapPlayOverlay'
import { catalogYoutubeProxyStreamUrl } from '../utils/catalogProductionVideoOg'

const BANNER_MEDIA_CLASS = 'h-full w-full object-cover'

type CatalogVideoOgYoutubeProxyVideoProps = {
	videoId: string
	posterUrl?: string
}

/** In-page playback via Beamio `/api/catalogYoutubeStream` (server yt-dlp mirror). */
export function CatalogVideoOgYoutubeProxyVideo({ videoId, posterUrl }: CatalogVideoOgYoutubeProxyVideoProps) {
	const videoRef = useRef<HTMLVideoElement>(null)
	const [isPlaying, setIsPlaying] = useState(false)
	const [prepareState, setPrepareState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
	const [prepareError, setPrepareError] = useState<string | null>(null)

	const poster = posterUrl?.trim() || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
	const streamUrl = catalogYoutubeProxyStreamUrl(videoId)

	const warmStream = useCallback(async () => {
		setPrepareState('loading')
		setPrepareError(null)
		try {
			const res = await fetch(streamUrl, { method: 'HEAD' })
			if (!res.ok) {
				const body = (await res.json().catch(() => null)) as { error?: string; detail?: string } | null
				throw new Error(body?.error || body?.detail || `Stream unavailable (${res.status})`)
			}
			setPrepareState('ready')
		} catch (e: unknown) {
			setPrepareState('error')
			setPrepareError(e instanceof Error ? e.message : 'Video unavailable')
		}
	}, [streamUrl])

	useEffect(() => {
		void warmStream()
	}, [warmStream])

	const handlePlayRequest = useCallback(() => {
		const el = videoRef.current
		if (!el) return
		if (prepareState === 'error') {
			void warmStream()
			return
		}
		if (prepareState !== 'ready') {
			void warmStream().then(() => {
				void el.play().catch(() => {})
			})
			return
		}
		void el.play().catch(() => {})
	}, [prepareState, warmStream])

	const showPosterOverlay = !isPlaying && prepareState !== 'ready'
	const showPreparing = prepareState === 'loading' && !isPlaying

	return (
		<div className="relative h-full w-full overflow-hidden bg-black">
			{prepareState === 'ready' ? (
				<video
					ref={videoRef}
					src={streamUrl}
					className={`${BANNER_MEDIA_CLASS} relative z-0`}
					controls
					playsInline
					preload="metadata"
					poster={poster}
					onPlay={() => setIsPlaying(true)}
					onPause={() => setIsPlaying(false)}
					onEnded={() => setIsPlaying(false)}
				/>
			) : (
				<img src={poster} alt="" className={BANNER_MEDIA_CLASS} draggable={false} />
			)}
			{showPreparing ? (
				<div className="pointer-events-none absolute inset-0 z-[20] flex items-center justify-center bg-black/45">
					<p className="rounded-full bg-black/70 px-4 py-2 text-sm text-white/90">Preparing video…</p>
				</div>
			) : null}
			{prepareState === 'error' && prepareError && !isPlaying ? (
				<div className="pointer-events-none absolute inset-x-4 bottom-4 z-[20] rounded-lg bg-black/75 px-3 py-2 text-center text-xs text-amber-200/95">
					{prepareError}
				</div>
			) : null}
			<CatalogVideoOgTapPlayOverlay visible={showPosterOverlay} onPlay={handlePlayRequest} />
		</div>
	)
}
