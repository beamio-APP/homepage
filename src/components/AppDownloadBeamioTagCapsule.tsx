import { beamioFixedCapsuleTopStyle } from '../utils/beamioFixedTopCapsuleLayout'
import type { AppDownloadVisitWalletProfile } from '../utils/beamioWebShareWallet'

type AppDownloadBeamioTagCapsuleProps = {
	profile: AppDownloadVisitWalletProfile
	opacity?: number
	onOpen: () => void
}

/** Top-right @beamioTag capsule — mirrors SilentPassUI Home left capsule chrome. */
export default function AppDownloadBeamioTagCapsule({
	profile,
	opacity = 1,
	onOpen,
}: AppDownloadBeamioTagCapsuleProps) {
	return (
		<div
			className="pointer-events-none fixed right-4 z-40 transition-opacity duration-300"
			style={{
				...beamioFixedCapsuleTopStyle(),
				opacity,
			}}
		>
			<button
				type="button"
				onClick={onOpen}
				className="flex items-center justify-self-end"
				style={{ pointerEvents: opacity < 0.05 ? 'none' : 'auto' }}
				aria-label="Open wallet"
			>
				<div className="flex min-w-0 max-w-[min(52vw,14rem)] items-center gap-2.5 rounded-full border border-slate-100/90 bg-white py-2 pl-2 pr-4 shadow-[0_4px_24px_rgba(15,23,42,0.08)] transition-transform active:scale-[0.98]">
					<div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 ring-1 ring-inset ring-slate-200/80">
						<img
							src={profile.avatarSrc}
							alt=""
							className="h-full w-full object-cover"
							draggable={false}
						/>
					</div>
					<span className="min-w-0 truncate text-[15px] font-bold tracking-tight text-[#0F172A]">
						{profile.tagLabel}
					</span>
				</div>
			</button>
		</div>
	)
}
