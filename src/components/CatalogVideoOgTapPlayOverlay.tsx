import { Play } from 'lucide-react'

type CatalogVideoOgTapPlayOverlayProps = {
	visible: boolean
	onPlay: () => void
}

/** Center play control for iOS Safari — must use a real button + user gesture (not pointer-events-none). */
export function CatalogVideoOgTapPlayOverlay({ visible, onPlay }: CatalogVideoOgTapPlayOverlayProps) {
	if (!visible) return null
	return (
		<button
			type="button"
			onClick={(event) => {
				event.stopPropagation()
				onPlay()
			}}
			className="absolute inset-0 z-30 flex items-center justify-center border-0 bg-black/20 p-0"
			aria-label="Play video"
		>
			<span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/55 shadow-lg ring-2 ring-white/85 sm:h-16 sm:w-16">
				<Play className="ml-0.5 h-7 w-7 fill-white text-white sm:h-8 sm:w-8" strokeWidth={0} aria-hidden />
			</span>
		</button>
	)
}
