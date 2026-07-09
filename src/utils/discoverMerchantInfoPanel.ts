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

const DISCOVER_GENERIC_PROGRAM_SUBTITLE = 'Member benefits and offers'

export function hasDiscoverMerchantAboutPanel(panel: DiscoverMerchantInfoPanel): boolean {
	return Boolean(
		panel.aboutText?.trim() ||
			panel.openingHours?.trim() ||
			panel.contact?.trim() ||
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

/**
 * Welcome panel body = short card detail (programDescription / subtitle, ≤200 chars).
 * Do not use discoverAbout.detail here — that belongs on the About panel (≤2000 chars).
 */
export function resolveDiscoverWelcomePanelCopy(params: {
	passTitle: string
	subtitle: string
	merchantInfoPanel: DiscoverMerchantInfoPanel | null
}): { title: string; body: string } | null {
	const { passTitle, subtitle, merchantInfoPanel } = params
	const title = merchantInfoPanel?.welcomeTitle?.trim() || `Welcome to ${passTitle}`
	const subtitleTrim = subtitle.trim()
	const body =
		merchantInfoPanel?.welcomeText?.trim() ||
		(subtitleTrim && subtitleTrim !== DISCOVER_GENERIC_PROGRAM_SUBTITLE ? subtitleTrim : '') ||
		''
	if (!body) return null
	return { title, body }
}

/** About panel keeps discoverAbout.detail (long-form); omit only if identical to welcome short detail. */
export function discoverMerchantAboutPanelForDisplay(
	panel: DiscoverMerchantInfoPanel,
	welcomeBody: string,
): DiscoverMerchantInfoPanel | null {
	const welcomeNorm = welcomeBody.trim()
	const aboutText = panel.aboutText?.trim()
	const dedupedAbout = aboutText && aboutText !== welcomeNorm ? aboutText : undefined
	const next: DiscoverMerchantInfoPanel = {
		...panel,
		aboutText: dedupedAbout,
	}
	return hasDiscoverMerchantAboutPanel(next) ? next : null
}

function trimDiscoverAboutMultilineField(raw: string): string {
	return raw.replace(/\r\n/g, '\n').replace(/^\s+|\s+$/g, '')
}

/** About detail for UI — keep newlines; legacy ".  " breaks become paragraphs. */
export function discoverAboutDetailForDisplay(raw: string): string {
	const normalized = trimDiscoverAboutMultilineField(raw)
	if (!normalized) return ''
	if (normalized.includes('\n')) return normalized
	return normalized.replace(/([.!?])\s{2,}/g, '$1\n\n')
}
