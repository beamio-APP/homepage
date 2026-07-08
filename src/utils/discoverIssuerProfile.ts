import { ethers } from 'ethers'

const BEAMIO_API = '/api'

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

function dicebearAvatarSrc(seed: string): string {
	return `https://api.dicebear.com/8.x/fun-emoji/svg?seed=${encodeURIComponent(seed || '@Beamio')}`
}

export function issuerAvatarSrc(profile: DiscoverIssuerProfile | null, ownerEoa: string): string {
	if (profile?.image?.trim()) return profile.image.trim()
	const seed = profile?.username?.replace(/^@+/, '') || ownerEoa
	return dicebearAvatarSrc(seed)
}

/** Fetch issuer @beamioTag profile by EOA (untrusted failure returns null). */
export async function fetchDiscoverIssuerProfile(ownerEoa: string): Promise<DiscoverIssuerProfile | null> {
	if (!ownerEoa || !ethers.isAddress(ownerEoa)) return null
	try {
		const addr = ethers.getAddress(ownerEoa)
		const params = new URLSearchParams({ keyward: addr }).toString()
		const res = await fetch(`${BEAMIO_API}/searchUsers?${params}`)
		if (!res.ok) return null
		const json = (await res.json()) as { results?: Array<Record<string, unknown>> }
		const rows = Array.isArray(json.results) ? json.results : []
		const match =
			rows.find((r) => String(r.address ?? '').toLowerCase() === addr.toLowerCase()) ?? rows[0]
		if (!match) return null
		const username = String(match.username ?? match.accountName ?? '').trim()
		return {
			address: addr,
			username,
			firstName: String(match.first_name ?? match.firstName ?? '').trim(),
			lastName: String(match.last_name ?? match.lastName ?? '').trim(),
			image: String(match.image ?? '').trim(),
		}
	} catch {
		return null
	}
}
