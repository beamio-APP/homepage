import { Link } from 'react-router-dom'
import { beamioFixedCapsuleTopStyle } from '../utils/beamioFixedTopCapsuleLayout'
import BeamioBrandLogo from './BeamioBrandLogo'

const CAPSULE_CHROME =
	'rounded-full border border-slate-100/90 bg-white py-2 pl-2 pr-4 shadow-[0_4px_24px_rgba(15,23,42,0.08)] transition-transform active:scale-[0.98]'

type AppDownloadHomeCapsuleProps = {
	opacity: number
}

/** PWA Home-style top-left capsule → `/home` (beamio-fixed-top-capsule-protocol.mdc). */
export default function AppDownloadHomeCapsule({ opacity }: AppDownloadHomeCapsuleProps) {
	return (
		<div
			className="pointer-events-none fixed left-4 right-4 z-30 flex items-center justify-start transition-opacity duration-300"
			style={{
				...beamioFixedCapsuleTopStyle(),
				opacity,
			}}
		>
			<Link
				to="/home"
				className={`flex items-center gap-2.5 ${CAPSULE_CHROME}`}
				style={{ pointerEvents: opacity < 0.05 ? 'none' : 'auto' }}
				aria-label="Back to Beamio home"
			>
				<div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 ring-1 ring-inset ring-slate-200/80">
					<BeamioBrandLogo className="h-full w-full object-cover" alt="" />
				</div>
				<span className="text-[15px] font-bold tracking-tight text-[#0F172A]">Beamio</span>
			</Link>
		</div>
	)
}
