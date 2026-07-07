import { ethers } from 'ethers'
import {
	eip712ChainIdForBeamioUserCard,
	getCardFactoryGatewayForEip712,
	providerForBeamioUserCard,
} from './beamioUserCardChain'
import { dispatchDiscoverLikeReward13IfNeeded } from './discoverMerchantLikeReward'

const BEAMIO_API = '/api'
/** UserCumulativeStatLib.MERCHANT_CARD_LIKE_TOKEN_ID */
const MERCHANT_CARD_LIKE_TOKEN_ID = 19n

const READ_ABI = ['function balanceOf(address account, uint256 id) view returns (uint256)'] as const

export async function fetchUserHasLikedMerchantCard(
	cardAddress: string,
	userEoa: string,
): Promise<boolean | null> {
	try {
		const card = ethers.getAddress(cardAddress)
		const user = ethers.getAddress(userEoa)
		const { provider } = await providerForBeamioUserCard(card)
		const c = new ethers.Contract(card, READ_ABI, provider)
		const bal = (await c.balanceOf(user, MERCHANT_CARD_LIKE_TOKEN_ID)) as bigint
		return bal > 0n
	} catch {
		return null
	}
}

/** Plan A: applyUserLikeWithSignature via Cluster `/api/cardRecordUserLike`. */
export async function postMerchantCardUserLike(params: {
	cardAddress: string
	privateKeyArmor: string
	liked: boolean
	referrerEoa?: string | null
}): Promise<{ success: boolean; error?: string; rewardTxQueued?: boolean }> {
	const cardAddress = params.cardAddress?.trim() ?? ''
	const privateKeyArmor = params.privateKeyArmor?.trim() ?? ''
	if (!cardAddress || !privateKeyArmor || !ethers.isAddress(cardAddress)) {
		return { success: false, error: 'Invalid card or wallet' }
	}
	try {
		const signer = new ethers.Wallet(privateKeyArmor)
		const userEOA = ethers.getAddress(signer.address)
		const cardNorm = ethers.getAddress(cardAddress)
		const verifyingContract = await getCardFactoryGatewayForEip712(cardNorm)
		const chainId = await eip712ChainIdForBeamioUserCard(cardNorm)
		const deadline = Math.floor(Date.now() / 1000) + 15 * 60
		const nonce = ethers.hexlify(ethers.randomBytes(32))
		const targetKind = 1
		const issuedParentId = '0'
		const liked = Boolean(params.liked)
		const userSignature = await signer.signTypedData(
			{
				name: 'BeamioUserCardFactory',
				version: '1',
				chainId,
				verifyingContract,
			},
			{
				RecordUserLike: [
					{ name: 'cardAddress', type: 'address' },
					{ name: 'userEOA', type: 'address' },
					{ name: 'targetKind', type: 'uint8' },
					{ name: 'issuedParentId', type: 'uint256' },
					{ name: 'liked', type: 'bool' },
					{ name: 'deadline', type: 'uint256' },
					{ name: 'nonce', type: 'bytes32' },
				],
			},
			{
				cardAddress: cardNorm,
				userEOA,
				targetKind,
				issuedParentId: BigInt(issuedParentId),
				liked,
				deadline: BigInt(deadline),
				nonce,
			},
		)
		const res = await fetch(`${BEAMIO_API}/cardRecordUserLike`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				cardAddress: cardNorm,
				userEOA,
				targetKind,
				issuedParentId,
				liked,
				deadline,
				nonce,
				userSignature,
			}),
		})
		const data = (await res.json().catch(() => ({}))) as { success?: boolean; error?: string }
		if (!res.ok || data.success === false) {
			return { success: false, error: data.error ?? `http_${res.status}` }
		}
		let rewardTxQueued = false
		if (liked) {
			try {
				rewardTxQueued = await dispatchDiscoverLikeReward13IfNeeded({
					cardAddress: cardNorm,
					actorEOA: userEOA,
					referrerEoa: params.referrerEoa,
					targetKind,
					issuedParentId,
				})
			} catch {
				/* optional reward — like already recorded */
			}
		}
		return { success: true, rewardTxQueued }
	} catch (e: unknown) {
		const err = e as { shortMessage?: string; message?: string }
		return { success: false, error: err?.shortMessage ?? err?.message ?? String(e) }
	}
}
