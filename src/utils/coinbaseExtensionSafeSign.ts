/**
 * Desktop Coinbase Wallet *browser extension* signing helpers.
 *
 * Coinbase's injected provider serializes EIP-5792 `wallet_getCapabilities`
 * ahead of later RPCs. viem `createWalletClient` + `signTypedData` /
 * x402 `createPaymentHeader` implicitly call capabilities and never reach
 * `eth_signTypedData_v4`, so the extension popup never opens (stuck on
 * Initializing / portfolio loading).
 *
 * Spreading `{ ...provider, request }` also breaks Coinbase provider identity;
 * use a Proxy that preserves the original object.
 *
 * Typed-data params: Coinbase WalletLink / extension must receive params[1] as
 * an **object** (with `types.EIP712Domain`). Pre-`JSON.stringify` causes
 * `EIP712Domain of undefined` / a blank white spinner popup with no Sign UI.
 *
 * Amplitude `POST as.coinbase.com/amp` 400s are Coinbase analytics noise —
 * not Beamio payment failures.
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

export const EIP712_DOMAIN_TYPES = [
	{ name: 'name', type: 'string' },
	{ name: 'version', type: 'string' },
	{ name: 'chainId', type: 'uint256' },
	{ name: 'verifyingContract', type: 'address' },
] as const

export const TRANSFER_WITH_AUTHORIZATION_TYPES = {
	EIP712Domain: [...EIP712_DOMAIN_TYPES],
	TransferWithAuthorization: [
		{ name: 'from', type: 'address' },
		{ name: 'to', type: 'address' },
		{ name: 'value', type: 'uint256' },
		{ name: 'validAfter', type: 'uint256' },
		{ name: 'validBefore', type: 'uint256' },
		{ name: 'nonce', type: 'bytes32' },
	],
} as const

const CAPABILITIES_STUBS = new Set([
	'wallet_getCapabilities',
	'wallet_sendCalls',
	'wallet_getCallsStatus',
	'wallet_showCallsStatus',
	'wallet_atomicReady',
	'wallet_getPermissions',
	'wallet_requestPermissions',
	'wallet_revokePermissions',
])

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

/**
 * Preserve Coinbase provider identity (Proxy) while stubbing hang-prone wallet_* methods.
 */
export function wrapCoinbaseExtensionProvider(provider: Eip1193Provider): Eip1193Provider {
	const request = (args: { method: string; params?: unknown[] | object }): Promise<unknown> => {
		const method = typeof args?.method === 'string' ? args.method : ''
		if (CAPABILITIES_STUBS.has(method)) {
			if (method === 'wallet_getCapabilities') return Promise.resolve({})
			if (
				method === 'wallet_getPermissions' ||
				method === 'wallet_requestPermissions'
			) {
				return Promise.resolve([])
			}
			return Promise.resolve(null)
		}
		return provider.request(args)
	}

	return new Proxy(provider, {
		get(target, prop, receiver) {
			if (prop === 'request') return request
			if (prop === 'isCoinbaseWallet') {
				return target.isCoinbaseWallet ?? true
			}
			const value = Reflect.get(target, prop, receiver)
			if (typeof value === 'function') {
				return value.bind(target)
			}
			return value
		},
	}) as Eip1193Provider
}

function normalizeScalar(value: unknown): unknown {
	if (typeof value === 'bigint') return value.toString()
	if (typeof value === 'number' && Number.isFinite(value)) return String(value)
	return value
}

/**
 * Coinbase requires `types.EIP712Domain` and an object (not pre-stringified JSON).
 * uint256 / similar fields as decimal strings avoid parser hangs in SuperApp UI.
 */
export function normalizeTypedDataForCoinbaseSign(
	typedData: Record<string, unknown>,
): Record<string, unknown> {
	const rawTypes =
		typedData.types && typeof typedData.types === 'object'
			? { ...(typedData.types as Record<string, unknown>) }
			: {}
	if (!rawTypes.EIP712Domain) {
		rawTypes.EIP712Domain = [...EIP712_DOMAIN_TYPES]
	}

	const rawDomain =
		typedData.domain && typeof typedData.domain === 'object'
			? { ...(typedData.domain as Record<string, unknown>) }
			: {}
	if (typeof rawDomain.chainId === 'bigint') {
		rawDomain.chainId = Number(rawDomain.chainId)
	}

	const rawMessage =
		typedData.message && typeof typedData.message === 'object'
			? Object.fromEntries(
					Object.entries(typedData.message as Record<string, unknown>).map(([key, value]) => [
						key,
						normalizeScalar(value),
					]),
				)
			: typedData.message

	return {
		types: rawTypes,
		primaryType: typedData.primaryType,
		domain: rawDomain,
		message: rawMessage,
	}
}

/**
 * Call as the first await after a user gesture (no prior fetch/import await).
 * Passes typed data as an object — do not JSON.stringify for Coinbase.
 */
export async function requestEthSignTypedDataV4(
	provider: Eip1193Provider,
	account: string,
	typedData: Record<string, unknown>,
	timeoutMs = 120_000,
): Promise<string> {
	const data = normalizeTypedDataForCoinbaseSign(typedData)
	const requestPromise = provider.request({
		method: 'eth_signTypedData_v4',
		params: [account, data],
	})
	const timeoutPromise = new Promise<never>((_, reject) => {
		window.setTimeout(() => {
			reject(
				new Error(
					'Coinbase Wallet did not respond to the signature request. If the popup stayed blank (spinner only), close it, open MetaMask instead, or unlock Coinbase from the toolbar and tap Pay again.',
				),
			)
		}, timeoutMs)
	})
	const result = await Promise.race([requestPromise, timeoutPromise])
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
