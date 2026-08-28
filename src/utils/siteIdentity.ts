export type MarketingSite = 'beamio' | 'conet'

function normalizedHost(): string {
	if (typeof window === 'undefined') return ''
	return window.location.hostname.toLowerCase().replace(/^www\./, '')
}

export function getMarketingSite(): MarketingSite {
	const configured = process.env.REACT_APP_SITE_VARIANT?.toLowerCase()
	if (configured === 'beamio' || configured === 'conet') return configured

	const host = normalizedHost()
	if (host === 'conet.network' || host.endsWith('.conet.network')) return 'conet'
	return 'beamio'
}

export function isConetMarketingSite(): boolean {
	return getMarketingSite() === 'conet'
}
