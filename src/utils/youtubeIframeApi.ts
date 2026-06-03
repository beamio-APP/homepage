/** Minimal YouTube IFrame API loader (homepage catalog share player). */

type YtPlayerInstance = {
	playVideo: () => void
	pauseVideo: () => void
	getDuration: () => number
	getCurrentTime: () => number
	destroy: () => void
}

type YtPlayerCtor = new (
	elementId: string,
	options: {
		videoId: string
		host?: string
		width?: string | number
		height?: string | number
		playerVars?: Record<string, string | number>
		events?: {
			onReady?: (event: { target: YtPlayerInstance }) => void
			onStateChange?: (event: { data: number; target: YtPlayerInstance }) => void
		}
	},
) => YtPlayerInstance

declare global {
	interface Window {
		YT?: { Player: YtPlayerCtor }
		onYouTubeIframeAPIReady?: () => void
	}
}

let ytApiPromise: Promise<void> | null = null

export function loadYoutubeIframeApi(): Promise<void> {
	if (window.YT?.Player) return Promise.resolve()
	if (ytApiPromise) return ytApiPromise
	ytApiPromise = new Promise((resolve) => {
		const finish = () => resolve()
		const previous = window.onYouTubeIframeAPIReady
		window.onYouTubeIframeAPIReady = () => {
			previous?.()
			finish()
		}
		if (window.YT?.Player) {
			finish()
			return
		}
		if (!document.querySelector('script[data-beamio-youtube-iframe-api]')) {
			const tag = document.createElement('script')
			tag.src = 'https://www.youtube.com/iframe_api'
			tag.async = true
			tag.dataset.beamioYoutubeIframeApi = '1'
			document.head.appendChild(tag)
		}
	})
	return ytApiPromise
}

export type { YtPlayerInstance }
