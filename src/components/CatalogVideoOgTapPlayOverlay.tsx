import { Play } from 'lucide-react'

type CatalogVideoOgTapPlayOverlayProps = {
	visible: boolean
	onPlay: () => void
}

/** Center play control for iOS Safari — real button + user gesture; must not cover bottom scrubber/controls. */
export function CatalogVideoOgTapPlayOverlay({ visible, onPlay }: CatalogVideoOgTapPlayOverlayProps) {
	if (!visible) return null
	return (
		<button
			type="button"
			onClick={(event) => {
				event.stopPropagation()
				onPlay()
			}}
			className="absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2 border-0 bg-transparent p-0"
			aria-label="Play video"
		>
			<span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/55 shadow-lg ring-2 ring-white/85 sm:h-16 sm:w-16">
				<Play className="ml-0.5 h-7 w-7 fill-white text-white sm:h-8 sm:w-8" strokeWidth={0} aria-hidden />
			</span>
		</button>
	)
}
