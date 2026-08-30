/**
 * Desktop Coinbase Wallet *browser extension* signing helpers.
 *
 * Coinbase's injected provider serializes EIP-5792 `wallet_getCapabilities`
 * ahead of later RPCs. viem `createWalletClient` + `signTypedData` /
 * x402 `createPaymentHeader` implicitly call capabilities and never reach
 * `eth_signTypedData_v4`, so the extension popup never opens.
 *
 * Phone OS / in-app browsers are out of scope — do not route those through
 * `go.cb-w.com` from this module.
 */

import {
	isLikelyWalletInAppBrowser,
	isMobileDeviceForWalletApps,
	type Eip1193Provider,
	type InjectedWalletChoice,
} from './mobileWalletApps'

export const TRANSFER_WITH_AUTHORIZATION_TYPES = {
	TransferWithAuthorization: [
		{ name: 'from', type: 'address' },
		{ name: 'to', type: 'address' },
		{ name: 'value', type: 'uint256' },
		{ name: 'validAfter', type: 'uint256' },
		{ name: 'validBefore', type: 'uint256' },
		{ name: 'nonce', type: 'bytes32' },
	],
} as const

export function isDesktopCoinbaseWalletExtension(
	choice?: InjectedWalletChoice | null,
	provider?: Eip1193Provider | null,
): boolean {
	if (typeof window === 'undefined') return false
	if (isMobileDeviceForWalletApps()) return false
	if (isLikelyWalletInAppBrowser()) return false
	if (choice?.id === 'base') return true
	const rdns = (choice?.rdns ?? '').toLowerCase()
	if (rdns.includes('coinbase')) return true
	const p = choice?.provider ?? provider
	if (p?.isCoinbaseWallet) return true
	const ext = (window as Window & { coinbaseWalletExtension?: Eip1193Provider }).coinbaseWalletExtension
	return Boolean(ext && p && ext === p)
}

/** Stub EIP-5792 methods that otherwise block Coinbase extension RPC. */
export function wrapCoinbaseExtensionProvider(provider: Eip1193Provider): Eip1193Provider {
	return {
		...provider,
		isCoinbaseWallet: provider.isCoinbaseWallet ?? true,
		on: provider.on?.bind(provider),
		removeListener: provider.removeListener?.bind(provider),
		request: async (args: { method: string; params?: unknown[] | object }) => {
			const method = args.method
			if (method === 'wallet_getCapabilities') return {}
			if (method === 'wallet_getPermissions') return []
			if (method === 'wallet_revokePermissions') return null
			return provider.request(args)
		},
	}
}

export async function requestEthSignTypedDataV4(
	provider: Eip1193Provider,
	account: string,
	typedData: Record<string, unknown>,
): Promise<string> {
	const result = await provider.request({
		method: 'eth_signTypedData_v4',
		params: [account, JSON.stringify(typedData)],
	})
	if (typeof result !== 'string' || !/^0x[0-9a-fA-F]+$/.test(result)) {
		throw new Error('Wallet did not return a signature.')
	}
	return result
}

/** Same encoding as x402 `encodePayment` (EVM exact scheme). */
export function encodeX402PaymentPayload(payment: {
	x402Version: number
	scheme: string
	network: string
	payload: {
		signature: string
		authorization: Record<string, unknown>
	}
}): string {
	const safe = {
		...payment,
		payload: {
			...payment.payload,
			authorization: Object.fromEntries(
				Object.entries(payment.payload.authorization).map(([key, value]) => [
					key,
					typeof value === 'bigint' ? value.toString() : value,
				]),
			),
		},
	}
	return globalThis.btoa(JSON.stringify(safe))
}
