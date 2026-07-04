import { ethers } from 'ethers'

/** Outer app-download share URL with optional `ref=` referrer (sharer EOA). */
export function buildDiscoverMerchantShareUrl(
	cardAddress: string,
	referrerEoa?: string | null,
): string {
	const addr = cardAddress?.trim() ?? ''
	if (!addr || !ethers.isAddress(addr)) return ''
	const cardNorm = ethers.getAddress(addr)
	let discoverUrl = `https://beamio.app/app/?beamiocard=${encodeURIComponent(cardNorm)}&discover=open`
	const refRaw = referrerEoa?.trim() ?? ''
	if (refRaw && ethers.isAddress(refRaw)) {
		discoverUrl += `&ref=${encodeURIComponent(ethers.getAddress(refRaw))}`
	}
	return `https://beamio.app/app-download?target=${encodeURIComponent(discoverUrl)}`
}

export async function shareDiscoverMerchantUrl(
	shareUrl: string,
	opts?: { title?: string },
): Promise<'shared' | 'copied' | 'failed'> {
	const url = shareUrl?.trim() ?? ''
	if (!url || typeof window === 'undefined') return 'failed'
	const title = opts?.title?.trim() || 'Discover this brand on Beamio'

	if (typeof navigator.share === 'function') {
		try {
			await navigator.share({ title, url })
			return 'shared'
		} catch (e: unknown) {
			if (e instanceof DOMException && e.name === 'AbortError') return 'failed'
		}
	}

	try {
		await navigator.clipboard.writeText(url)
		return 'copied'
	} catch {
		return 'failed'
	}
}
