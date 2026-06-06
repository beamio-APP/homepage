import { Link } from 'react-router-dom'
import BeamioBrandLogo from './BeamioBrandLogo'

export function UsdcTopupSiteHeader() {
	return (
		<header className="fixed top-0 left-0 right-0 z-50 w-full bg-white/95 shadow-sm">
			<div className="mx-auto flex max-w-7xl items-center px-6 py-4">
				<Link to="/home" className="flex items-center gap-2 transition-opacity hover:opacity-80">
					<BeamioBrandLogo className="h-9 w-9 rounded-lg object-cover" />
					<span className="text-xl font-bold tracking-tight text-blue-600">Beamio</span>
				</Link>
			</div>
		</header>
	)
}
