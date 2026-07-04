import { ethers } from 'ethers'

/** CoNET L1 — merchant program cards deploy here (Base merchant cards deprecated). */
export const CONET_MAINNET_CHAIN_ID = 224422

const CONET_MAINNET_RPC_URL = 'https://rpc1.conet.network'

let conetProviderSingleton: ethers.JsonRpcProvider | null = null

function conetDepinProvider(): ethers.JsonRpcProvider {
	if (!conetProviderSingleton) {
		conetProviderSingleton = new ethers.JsonRpcProvider(CONET_MAINNET_RPC_URL, CONET_MAINNET_CHAIN_ID)
	}
	return conetProviderSingleton
}

/** CoNET UserCard factory — EIP-712 verifyingContract for merchant card writes. */
export const CONET_CARD_FACTORY = '0xfA52a0CcC96C19cF4b6Ea864615F6d52BD0774FB'

/** Merchant program cards: CoNET 224422 only. */
export async function providerForBeamioUserCard(
	_cardAddress: string,
): Promise<{ provider: ethers.Provider; chainId: number }> {
	return { provider: conetDepinProvider(), chainId: CONET_MAINNET_CHAIN_ID }
}

export async function eip712ChainIdForBeamioUserCard(_cardAddress: string): Promise<number> {
	return CONET_MAINNET_CHAIN_ID
}

export async function getCardFactoryGatewayForEip712(cardAddress: string): Promise<string> {
	try {
		const { provider } = await providerForBeamioUserCard(cardAddress)
		const c = new ethers.Contract(
			ethers.getAddress(cardAddress),
			['function factoryGateway() view returns (address)'],
			provider,
		)
		return ethers.getAddress(await c.factoryGateway())
	} catch {
		return ethers.getAddress(CONET_CARD_FACTORY)
	}
}

export function beamioUserCardAddressExplorerUrl(
	address: string,
	chainId: number = CONET_MAINNET_CHAIN_ID,
): string {
	const normalized = ethers.getAddress(address)
	if (chainId === CONET_MAINNET_CHAIN_ID) {
		return `https://scan.conet.network/address/${normalized}`
	}
	return `https://basescan.org/address/${normalized}`
}

export function resolveBeamioUserCardAddressExplorerUrl(cardAddress: string): string {
	return beamioUserCardAddressExplorerUrl(cardAddress, CONET_MAINNET_CHAIN_ID)
}
