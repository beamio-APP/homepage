import { Link } from 'react-router-dom'
import { beamioFixedCapsuleTopStyle } from '../utils/beamioFixedTopCapsuleLayout'
import BeamioBrandLogo from './BeamioBrandLogo'

type AppDownloadHomeCapsuleProps = {
	opacity: number
}

/** App-download: icon-only link to `/home` (no pill chrome or wordmark). */
export default function AppDownloadHomeCapsule({ opacity }: AppDownloadHomeCapsuleProps) {
	return (
		<div
			className="pointer-events-none fixed left-4 z-30 transition-opacity duration-300"
			style={{
				...beamioFixedCapsuleTopStyle(),
				opacity,
			}}
		>
			<Link
				to="/home"
				className="inline-flex shrink-0 transition-transform active:scale-[0.96]"
				style={{ pointerEvents: opacity < 0.05 ? 'none' : 'auto' }}
				aria-label="Back to Beamio home"
			>
				<BeamioBrandLogo className="h-10 w-10 rounded-full object-cover" alt="" />
			</Link>
		</div>
	)
}
