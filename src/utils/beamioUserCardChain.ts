import { ethers } from 'ethers'

/** CoNET L1 — sole chain for merchant BeamioUserCard (see `beamio-merchant-card-conet-only-no-base-factory.mdc`). */
export const CONET_MAINNET_CHAIN_ID = 224422

const CONET_RPC = 'https://rpc1.conet.network'

let cachedProvider: ethers.JsonRpcProvider | undefined

/** Merchant program cards: CoNET 224422 only — no Base fallback. */
export function providerForBeamioUserCard(
	_cardAddress: string,
): { provider: ethers.JsonRpcProvider; chainId: number } {
	if (!cachedProvider) {
		cachedProvider = new ethers.JsonRpcProvider(CONET_RPC, CONET_MAINNET_CHAIN_ID)
	}
	return { provider: cachedProvider, chainId: CONET_MAINNET_CHAIN_ID }
}
