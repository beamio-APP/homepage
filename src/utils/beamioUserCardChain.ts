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

/** Merchant program cards: CoNET 224422 only. */
export async function providerForBeamioUserCard(
	_cardAddress: string,
): Promise<{ provider: ethers.Provider; chainId: number }> {
	return { provider: conetDepinProvider(), chainId: CONET_MAINNET_CHAIN_ID }
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
