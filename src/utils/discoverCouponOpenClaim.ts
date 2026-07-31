import { ethers } from 'ethers'
import {
	eip712ChainIdForBeamioUserCard,
	getCardFactoryGatewayForEip712,
	providerForBeamioUserCard,
} from './beamioUserCardChain'
import { readUserSocialPoints13BalanceOnCard } from './discoverUserSocialPoints13'
import type { DiscoverMerchantCouponSeriesRow } from './discoverMerchantLandingData'
import { readSocialExchangeFromMetadata } from './socialExchangeMetadata'
import { readCouponDisabledFromMetadata, filterListedCouponSeriesRows } from './couponListedMetadata'

const BEAMIO_API = '/api'

export type CouponOpenClaimEligibility =
	| 'claimable'
	/** User still holds the coupon NFT (claimed, not burned). */
	| 'already_claimed'
	/** User already used claim sig and no longer holds the NFT (redeemed / burned). */
	| 'already_redeemed'
	| 'not_open_claim'
	| 'insufficient_social_points'
	| 'sold_out'
	| 'expired'
	| 'unknown'

export type CardActiveIssuedCouponSeriesItem = {
	cardAddress: string
	tokenId: string
	metadata?: Record<string, unknown> | null
	issuedNftValidBefore?: string
}

const ISSUED_NFT_START_ID_MEMBER = 100_000_000_000n

const OPEN_CLAIM_ONCHAIN_READ_ABI = [
	'function issuedNftPriceInCurrency6(uint256 tokenId) view returns (uint256)',
	'function issuedNftUserSigClaimUsed(address userEOA, uint256 tokenId) view returns (bool)',
	'function issuedNftMaxSupply(uint256 tokenId) view returns (uint256)',
	'function issuedNftMintedCount(uint256 tokenId) view returns (uint256)',
] as const

const BALANCE_OF_ABI = ['function balanceOf(address account, uint256 id) view returns (uint256)'] as const

const AA_FACTORY_ABI = [
	'function beamioAccountOf(address) view returns (address)',
	'function primaryAccountOf(address) view returns (address)',
] as const

const CONET_AA_FACTORY = '0x869B31C87ABd9bFB858F5183Ef6021b28ED225E2'

const openClaimCardReadContracts = new Map<string, ethers.Contract>()

async function openClaimCardReadContract(cardAddress: string): Promise<ethers.Contract> {
	const cardNorm = ethers.getAddress(cardAddress)
	const key = cardNorm.toLowerCase()
	let c = openClaimCardReadContracts.get(key)
	if (!c) {
		const { provider } = await providerForBeamioUserCard(cardNorm)
		c = new ethers.Contract(cardNorm, OPEN_CLAIM_ONCHAIN_READ_ABI, provider)
		openClaimCardReadContracts.set(key, c)
	}
	return c
}

async function resolveBeamioAaOnConet(provider: ethers.Provider, eoa: string): Promise<string | null> {
	try {
		const eoaAddr = ethers.getAddress(eoa)
		const f = new ethers.Contract(CONET_AA_FACTORY, AA_FACTORY_ABI, provider)
		let a = await f.beamioAccountOf(eoaAddr).catch(() => ethers.ZeroAddress)
		if (!a || a === ethers.ZeroAddress) {
			a = await f.primaryAccountOf(eoaAddr).catch(() => ethers.ZeroAddress)
		}
		if (!a || a === ethers.ZeroAddress) return null
		const code = await provider.getCode(a).catch(() => '0x')
		return code && code !== '0x' && code.length > 2 ? ethers.getAddress(a) : null
	} catch {
		return null
	}
}

/** True if EOA or linked AA still holds this issued coupon NFT. */
async function userHoldsIssuedCouponNft(
	cardAddress: string,
	userNorm: string,
	tokenIdN: bigint,
): Promise<boolean | null> {
	try {
		const card = ethers.getAddress(cardAddress)
		const { provider } = await providerForBeamioUserCard(card)
		const cardContract = new ethers.Contract(card, BALANCE_OF_ABI, provider)
		let total = 0n
		total += (await cardContract.balanceOf(userNorm, tokenIdN)) as bigint
		const aa = await resolveBeamioAaOnConet(provider, userNorm).catch(() => null)
		if (aa) {
			try {
				total += (await cardContract.balanceOf(aa, tokenIdN)) as bigint
			} catch {
				/* keep EOA portion */
			}
		}
		return total > 0n
	} catch {
		return null
	}
}

export function readCouponIdFromMetadata(meta: Record<string, unknown> | null | undefined): string {
	if (!meta || typeof meta !== 'object') return ''
	const root = meta as Record<string, unknown>
	const rootId = root.couponId
	if (typeof rootId === 'string' && rootId.trim()) return rootId.trim()
	const properties = root.properties
	if (!properties || typeof properties !== 'object') return ''
	const beamioCoupon = (properties as Record<string, unknown>).beamioCoupon
	if (!beamioCoupon || typeof beamioCoupon !== 'object') return ''
	const nestedId = (beamioCoupon as Record<string, unknown>).couponId
	return typeof nestedId === 'string' && nestedId.trim() ? nestedId.trim() : ''
}

export function readCouponRequiresRedeemCode(meta: Record<string, unknown> | null | undefined): boolean {
	if (!meta || typeof meta !== 'object') return false
	const root = meta as Record<string, unknown>
	const toBool = (v: unknown): boolean =>
		v === true || v === 1 || v === '1' || v === 'true'
	if (toBool(root.requiresRedeemCode) || toBool(root.redeemCodeRequired)) return true
	const properties = root.properties
	if (!properties || typeof properties !== 'object') return false
	const beamioCoupon = (properties as Record<string, unknown>).beamioCoupon
	if (!beamioCoupon || typeof beamioCoupon !== 'object') return false
	const nested = beamioCoupon as Record<string, unknown>
	return toBool(nested.requiresRedeemCode) || toBool(nested.redeemCodeRequired)
}

function seriesRowToEligibilityInput(row: DiscoverMerchantCouponSeriesRow): CardActiveIssuedCouponSeriesItem {
	return {
		cardAddress: row.cardAddress,
		tokenId: row.tokenId,
		metadata: row.metadata,
		issuedNftValidBefore: row.issuedNftValidBefore,
	}
}

/**
 * Whether the wallet may open-claim this series row.
 * Distinguishes still-held NFT (`already_claimed`) vs claim-used-then-burned (`already_redeemed`).
 */
export async function resolveCouponOpenClaimEligibilityForItem(
	item: CardActiveIssuedCouponSeriesItem,
	userEOA: string | null | undefined,
): Promise<CouponOpenClaimEligibility> {
	if (readCouponDisabledFromMetadata(item.metadata ?? null)) return 'not_open_claim'
	if (readCouponRequiresRedeemCode(item.metadata ?? null)) return 'not_open_claim'
	if (!readCouponIdFromMetadata(item.metadata ?? null)) return 'not_open_claim'
	let tokenIdN: bigint
	try {
		tokenIdN = BigInt(item.tokenId)
	} catch {
		return 'not_open_claim'
	}
	if (tokenIdN < ISSUED_NFT_START_ID_MEMBER) return 'not_open_claim'
	if (!item.cardAddress || !ethers.isAddress(item.cardAddress)) return 'not_open_claim'
	const validBeforeNum = Number(item.issuedNftValidBefore ?? 0)
	if (Number.isFinite(validBeforeNum) && validBeforeNum > 0 && validBeforeNum <= Math.floor(Date.now() / 1000)) {
		return 'expired'
	}
	if (!userEOA || !ethers.isAddress(userEOA)) return 'unknown'
	try {
		const cardRead = await openClaimCardReadContract(item.cardAddress)
		const userNorm = ethers.getAddress(userEOA)
		const [priceInCurrency6, alreadyClaimed, maxSupply, mintedCount, holdsNft] = await Promise.all([
			cardRead.issuedNftPriceInCurrency6(tokenIdN) as Promise<bigint>,
			cardRead.issuedNftUserSigClaimUsed(userNorm, tokenIdN) as Promise<boolean>,
			cardRead.issuedNftMaxSupply(tokenIdN) as Promise<bigint>,
			cardRead.issuedNftMintedCount(tokenIdN) as Promise<bigint>,
			userHoldsIssuedCouponNft(item.cardAddress, userNorm, tokenIdN),
		])
		if (holdsNft === true) return 'already_claimed'
		if (alreadyClaimed) return 'already_redeemed'
		if (priceInCurrency6 !== 0n) return 'not_open_claim'
		if (maxSupply > 0n && mintedCount >= maxSupply) return 'sold_out'
		const socialExchange = readSocialExchangeFromMetadata(item.metadata ?? null)
		if (socialExchange) {
			const pointsBal = await readUserSocialPoints13BalanceOnCard(item.cardAddress, userNorm)
			if (pointsBal == null) return 'unknown'
			if (pointsBal < BigInt(socialExchange.pointsCost)) return 'insufficient_social_points'
		}
		return 'claimable'
	} catch {
		return 'unknown'
	}
}

export async function resolveCouponOpenClaimEligibility(
	row: DiscoverMerchantCouponSeriesRow,
	userEOA: string | null | undefined,
): Promise<CouponOpenClaimEligibility> {
	return resolveCouponOpenClaimEligibilityForItem(seriesRowToEligibilityInput(row), userEOA)
}

const stripHash13UserCopy = (text: string): string =>
	text
		.replace(/\s*\(#13\)/gi, '')
		.replace(/#13/gi, '')
		.replace(/\s{2,}/g, ' ')
		.trim()

function mapCouponOpenClaimApiError(raw: string | undefined): string {
	const msg = (raw ?? '').trim()
	if (!msg) return 'Coupon claim failed'
	if (/Failed to create AA|ensureAAForEOAOnCard/i.test(msg)) {
		return 'Failed to create Smart Account. Please try again shortly.'
	}
	if (/UC_ResolveAccountFailed|ResolveAccountFailed|ad12d341/i.test(msg)) {
		return 'Smart Account setup failed. Please try again shortly.'
	}
	if (/already claimed|UC_IssuedNftSigClaimAlreadyUsed/i.test(msg)) {
		return 'This wallet already claimed this coupon.'
	}
	if (/fully claimed|InsufficientBalance|supply/i.test(msg)) {
		return 'Coupon supply has been fully claimed.'
	}
	if (/redeemCode|open claim is disabled/i.test(msg)) {
		return 'This coupon requires a redeem code.'
	}
	if (/delisted|coupon is delisted|disable.*true/i.test(msg)) {
		return 'This coupon is no longer available.'
	}
	if (/inactive|expired|InvalidTimeWindow/i.test(msg)) {
		return 'This coupon is inactive or expired.'
	}
	if (/Insufficient social points|UC_InsufficientBalance/i.test(msg)) {
		return 'Not enough social points for this exchange.'
	}
	if (/Insufficient USDC escrow|UC_RewardBudgetInsufficient/i.test(msg)) {
		return 'This exchange is temporarily unavailable. The merchant USDC pool needs funding.'
	}
	return stripHash13UserCopy(msg) || 'Coupon claim failed'
}

async function fetchCardActiveIssuedCouponSeries(
	cardAddress: string,
	limit = 50,
): Promise<CardActiveIssuedCouponSeriesItem[]> {
	try {
		const res = await fetch(
			`${BEAMIO_API}/cardActiveIssuedCouponSeries?card=${encodeURIComponent(ethers.getAddress(cardAddress))}&limit=${limit}`,
		)
		if (!res.ok) return []
		const json = (await res.json().catch(() => ({}))) as { items?: CardActiveIssuedCouponSeriesItem[] }
		if (!Array.isArray(json.items)) return []
		return filterListedCouponSeriesRows(
			json.items.map((row) => ({
				...row,
				cardAddress: ethers.getAddress(cardAddress),
			})),
		)
	} catch {
		return []
	}
}

async function resolveOpenClaimTokenIdByCouponId(cardAddress: string, couponId: string): Promise<string | null> {
	const rows = await fetchCardActiveIssuedCouponSeries(cardAddress)
	for (const row of rows) {
		if (readCouponDisabledFromMetadata(row.metadata ?? null)) continue
		const id = readCouponIdFromMetadata(row.metadata ?? null)
		if (id && id === couponId) return String(row.tokenId)
	}
	return null
}

export async function postCardCouponOpenClaimWithWallet(params: {
	cardAddress: string
	couponId: string
	tokenId?: string
	privateKeyArmor: string
	referrerEoa?: string | null
}): Promise<{ success: boolean; tx?: string; tokenId?: string; error?: string; status?: number }> {
	const cardAddress = params.cardAddress?.trim() ?? ''
	const couponId = params.couponId?.trim() ?? ''
	const tokenIdParam = params.tokenId?.trim() ?? ''
	const privateKeyArmor = params.privateKeyArmor?.trim() ?? ''
	if (!cardAddress || !couponId || !privateKeyArmor || !ethers.isAddress(cardAddress)) {
		return { success: false, error: 'Invalid cardAddress, couponId, or privateKey' }
	}
	try {
		const signer = new ethers.Wallet(privateKeyArmor)
		const userEOA = ethers.getAddress(signer.address)
		const cardNorm = ethers.getAddress(cardAddress)
		const tokenId =
			tokenIdParam || (await resolveOpenClaimTokenIdByCouponId(cardNorm, couponId))
		if (!tokenId) return { success: false, error: 'Coupon not found or inactive on this card.' }

		const refRaw = params.referrerEoa?.trim() ?? ''
		const refWallet =
			refRaw && ethers.isAddress(refRaw) && ethers.getAddress(refRaw) !== userEOA
				? ethers.getAddress(refRaw)
				: undefined

		let socialExchange = readSocialExchangeFromMetadata(null)
		const seriesRows = await fetchCardActiveIssuedCouponSeries(cardNorm, 50)
		for (const seriesRow of seriesRows) {
			if (
				String(seriesRow.tokenId) === tokenId ||
				readCouponIdFromMetadata(seriesRow.metadata ?? null) === couponId
			) {
				if (readCouponDisabledFromMetadata(seriesRow.metadata ?? null)) {
					return { success: false, error: 'This coupon is no longer available.' }
				}
				socialExchange = readSocialExchangeFromMetadata(seriesRow.metadata ?? null)
				break
			}
		}

		const verifyingContract = await getCardFactoryGatewayForEip712(cardNorm)
		const chainId = await eip712ChainIdForBeamioUserCard(cardNorm)
		const deadline = Math.floor(Date.now() / 1000) + 15 * 60
		const nonce = ethers.hexlify(ethers.randomBytes(32))

		let userSignature: string
		let requestBody: Record<string, unknown>

		if (socialExchange) {
			const pointsCost = BigInt(socialExchange.pointsCost)
			const usdcReward6 = socialExchange.kind === 'usdc' ? socialExchange.usdcReward6 : 0n
			userSignature = await signer.signTypedData(
				{
					name: 'BeamioUserCardFactory',
					version: '1',
					chainId,
					verifyingContract,
				},
				{
					ClaimSocialExchange: [
						{ name: 'cardAddress', type: 'address' },
						{ name: 'tokenId', type: 'uint256' },
						{ name: 'pointsCost', type: 'uint256' },
						{ name: 'usdcReward6', type: 'uint256' },
						{ name: 'deadline', type: 'uint256' },
						{ name: 'nonce', type: 'bytes32' },
					],
				},
				{
					cardAddress: cardNorm,
					tokenId: BigInt(tokenId),
					pointsCost,
					usdcReward6,
					deadline: BigInt(deadline),
					nonce,
				},
			)
			requestBody = {
				cardAddress: cardNorm,
				couponId,
				userEOA,
				tokenId,
				deadline,
				nonce,
				userSignature,
				pointsCost: String(pointsCost),
				usdcReward6: String(usdcReward6),
				...(refWallet ? { refWallet } : {}),
			}
		} else {
			userSignature = await signer.signTypedData(
				{
					name: 'BeamioUserCardFactory',
					version: '1',
					chainId,
					verifyingContract,
				},
				{
					ClaimIssuedNft: [
						{ name: 'cardAddress', type: 'address' },
						{ name: 'tokenId', type: 'uint256' },
						{ name: 'deadline', type: 'uint256' },
						{ name: 'nonce', type: 'bytes32' },
					],
				},
				{
					cardAddress: cardNorm,
					tokenId: BigInt(tokenId),
					deadline: BigInt(deadline),
					nonce,
				},
			)
			requestBody = {
				cardAddress: cardNorm,
				couponId,
				userEOA,
				tokenId,
				deadline,
				nonce,
				userSignature,
				...(refWallet ? { refWallet } : {}),
			}
		}

		const res = await fetch(`${BEAMIO_API}/cardCouponOpenClaim`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(requestBody),
		})
		const data = (await res.json().catch(() => ({}))) as {
			success?: boolean
			tx?: string
			error?: string
			tokenId?: string
		}
		if (!res.ok || data.success === false) {
			return {
				success: false,
				error: mapCouponOpenClaimApiError(data.error ?? `HTTP ${res.status}`),
				status: res.status,
			}
		}
		return { success: true, tx: data.tx, tokenId: data.tokenId ?? tokenId }
	} catch (e: unknown) {
		const err = e as { shortMessage?: string; message?: string }
		return {
			success: false,
			error: mapCouponOpenClaimApiError(err?.shortMessage ?? err?.message ?? String(e)),
		}
	}
}
