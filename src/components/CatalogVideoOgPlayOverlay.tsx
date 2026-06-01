import { Play } from 'lucide-react'

/** Centered play affordance on catalog video / YouTube banners (mirrors bizSite preview). */
export function CatalogVideoOgPlayOverlay() {
	return (
		<div
			className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center"
			aria-hidden
		>
			<div className="flex h-11 w-11 items-center justify-center rounded-full bg-black/45 shadow-[0_4px_18px_rgba(0,0,0,0.45)] backdrop-blur-[2px]">
				<Play
					className="ml-0.5 h-[42%] w-[42%] fill-white text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)]"
					strokeWidth={0}
				/>
			</div>
		</div>
	)
}
