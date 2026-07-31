import { ethers } from 'ethers'

const ISSUED_NFT_TOKEN_ID_MIN = 100_000_000_000n
const CONET_SCAN_NFT = 'https://scan.conet.network/token' as const
const BASE_BLOCKSCOUT_NFT = 'https://base.blockscout.com/token' as const

export function normalizeIssuedNftTokenId(tokenId: string | number | undefined): string | null {
	const raw = String(tokenId ?? '')
		.trim()
		.replace(/,/g, '')
	if (!/^\d+$/.test(raw)) return null
	try {
		if (BigInt(raw) < ISSUED_NFT_TOKEN_ID_MIN) return null
	} catch {
		return null
	}
	return raw
}

/** Compact capsule label — last 3 digits (align SilentPassUI `beamioBaseScanNftLabel`). */
export function beamioIssuedNftCapsuleLabel(tokenId: string | number | undefined): string {
	const tid = normalizeIssuedNftTokenId(tokenId)
	if (!tid) return 'NFT'
	const last3 = tid.length <= 3 ? tid : tid.slice(-3)
	return `NFT #${last3}`
}

export function beamioIssuedNftExplorerUrl(
	cardAddress: string | undefined,
	tokenId: string | number | undefined,
	opts?: { preferConet?: boolean },
): string | null {
	const tid = normalizeIssuedNftTokenId(tokenId)
	if (!tid) return null
	const card = cardAddress?.trim() ?? ''
	if (!card || !ethers.isAddress(card)) return null
	try {
		const cardNorm = ethers.getAddress(card)
		const base = opts?.preferConet === false ? BASE_BLOCKSCOUT_NFT : CONET_SCAN_NFT
		return `${base}/${cardNorm}/instance/${tid}`
	} catch {
		return null
	}
}
