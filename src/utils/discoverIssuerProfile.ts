import { ethers } from 'ethers'

const SEARCH_USERS_URL = 'https://beamio.app/api/search-users'

export type DiscoverIssuerProfile = {
	address: string
	username: string
	firstName: string
	lastName: string
	image: string
}

export function formatBeamioTagDisplayLine(raw: string): string {
	const t = raw?.trim()
	if (!t) return '@Beamio'
	return t.startsWith('@') ? t : `@${t}`
}

/** Registry `lastName` may append a locale JSON block. That block is not a display name. */
export function humanProfileName(firstName: string, lastName: string): string {
	const part = (raw: string) => {
		const head = raw.split(/\r?\n/)[0]?.trim() ?? ''
		if (!head || head.startsWith('{')) return ''
		return head
	}
	return [part(firstName), part(lastName)].filter(Boolean).join(' ').trim()
}

function dicebearAvatarSrc(seed: string): string {
	return `https://api.dicebear.com/8.x/fun-emoji/svg?seed=${encodeURIComponent(seed || '@Beamio')}`
}

export function issuerAvatarSrc(profile: DiscoverIssuerProfile | null, _ownerEoa?: string): string {
	if (profile?.image?.trim()) return profile.image.trim()
	const seed = profile?.username?.replace(/^@+/, '').trim()
	return dicebearAvatarSrc(seed || '@Beamio')
}

/** Fetch issuer @beamioTag profile by EOA (untrusted failure returns null). */
export async function fetchDiscoverIssuerProfile(ownerEoa: string): Promise<DiscoverIssuerProfile | null> {
	if (!ownerEoa || !ethers.isAddress(ownerEoa)) return null
	try {
		const addr = ethers.getAddress(ownerEoa)
		const params = new URLSearchParams({ keyward: addr }).toString()
		const res = await fetch(`${SEARCH_USERS_URL}?${params}`)
		if (!res.ok) return null
		const json = (await res.json()) as { results?: Array<Record<string, unknown>> }
		const rows = Array.isArray(json.results) ? json.results : []
		const match = rows.find((r) => String(r.address ?? '').toLowerCase() === addr.toLowerCase())
		if (!match) return null
		const username = String(match.username ?? match.accountName ?? '').trim()
		const firstName = String(match.first_name ?? match.firstName ?? '')
		const lastName = String(match.last_name ?? match.lastName ?? '')
		return {
			address: addr,
			username,
			firstName: humanProfileName(firstName, ''),
			lastName: humanProfileName('', lastName),
			image: String(match.image ?? '').trim(),
		}
	} catch {
		return null
	}
}
