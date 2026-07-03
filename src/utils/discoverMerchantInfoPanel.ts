import type { DiscoverAboutFields } from './discoverMerchantLandingData'

export type DiscoverMerchantInfoPanel = {
	welcomeTitle: string
	welcomeText: string
	aboutTitle: string
	aboutText?: string
	openingHours?: string
	contact?: string
	location?: string
}

export function hasDiscoverMerchantAboutPanel(panel: DiscoverMerchantInfoPanel): boolean {
	return Boolean(
		panel.aboutTitle?.trim() &&
			panel.aboutText?.trim() &&
			panel.openingHours?.trim() &&
			panel.contact?.trim() &&
			panel.location?.trim(),
	)
}

export function resolveDiscoverMerchantInfoPanel(
	merchantDisplayName: string,
	discoverAbout: DiscoverAboutFields | null,
): DiscoverMerchantInfoPanel | null {
	if (!discoverAbout) return null
	const aboutText = discoverAbout.detail?.trim()
	const openingHours = discoverAbout.openingHours?.trim()
	const contact = discoverAbout.contact?.trim()
	const location = discoverAbout.location?.trim()
	if (!aboutText && !openingHours && !contact && !location) return null
	return {
		welcomeTitle: `Welcome to ${merchantDisplayName}`,
		welcomeText: '',
		aboutTitle: discoverAbout.aboutTitle?.trim() || `About ${merchantDisplayName}`,
		aboutText,
		openingHours,
		contact,
		location,
	}
}
