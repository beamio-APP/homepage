/**
 * OpenContainer pay QR — mirrors SilentPassUI `AAaccount.ts` (CoNET Scan to Pay).
 * Homepage cannot import sibling projects; keep encoding/signing aligned with POS decode.
 */
import { ethers } from 'ethers'

const DOMAIN_NAME = 'BeamioAccount'
const DOMAIN_VERSION = '1'
export const PAY_RELAY_QR_TTL_SECONDS = 300
export const CONET_MAINNET_CHAIN_ID = 224422
const CONET_RPC_URL = 'https://publicrpc.conet.network'
const CONET_AA_FACTORY = '0x869B31C87ABd9bFB858F5183Ef6021b28ED225E2'
const USDC_ADDRESS_BASE = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'

const BEAMIO_ACCOUNT_ABI = [
	'function owner() view returns (address)',
] as const

const aaFactoryAbi = [
	'function beamioAccountOf(address) view returns (address)',
	'function primaryAccountOf(address) view returns (address)',
] as const

export type OpenContainerRelayPayload = {
	account: string
	to: string
	items: { kind: number; asset: string; amount: string; tokenId: string; data: string }[]
	currencyType: number
	maxAmount: string
	nonce: string
	deadline: string
	signature: string
	chain?: 'base' | 'conet'
	chainId?: number
	openContainerPayloads?: {
		base?: OpenContainerRelayPayload
		conet?: OpenContainerRelayPayload
	}
}

function compactOpenContainerPayloadForQr(payload: OpenContainerRelayPayload): Record<string, unknown> {
	return {
		a: payload.account,
		c: payload.currencyType,
		m: payload.maxAmount,
		n: payload.nonce,
		d: payload.deadline,
		s: payload.signature,
	}
}

function legacyOpenContainerPayloadForQr(payload: OpenContainerRelayPayload): Record<string, unknown> {
	return {
		account: payload.account,
		to: payload.to,
		items: [],
		currencyType: payload.currencyType,
		maxAmount: payload.maxAmount,
		nonce: payload.nonce,
		deadline: payload.deadline,
		validBefore: payload.deadline,
		signature: payload.signature,
	}
}

export function encodeOpenContainerRelayQrPayload(payload: OpenContainerRelayPayload): string {
	if (payload.openContainerPayloads) {
		const encoded: Record<string, unknown> = {}
		if (payload.openContainerPayloads.base) {
			encoded.b = compactOpenContainerPayloadForQr(payload.openContainerPayloads.base)
		}
		if (payload.openContainerPayloads.conet) {
			encoded.c = compactOpenContainerPayloadForQr(payload.openContainerPayloads.conet)
		}
		const legacyPrimary = payload.openContainerPayloads.conet ?? payload.openContainerPayloads.base ?? payload
		return JSON.stringify({ ...legacyOpenContainerPayloadForQr(legacyPrimary), v: 1, p: encoded })
	}
	return JSON.stringify(legacyOpenContainerPayloadForQr(payload))
}

export async function readContainerNonceFromAAStorage(
	provider: ethers.Provider,
	aaAccount: string,
	kind: 'relayed' | 'openRelayed',
): Promise<bigint> {
	const base = BigInt(ethers.keccak256(ethers.toUtf8Bytes('beamio.container.module.storage.v07')))
	const slot = kind === 'relayed' ? base : base + 1n
	const raw = await provider.getStorage(ethers.getAddress(aaAccount), slot)
	return BigInt(raw)
}

function isNetworkOrRpcError(err: unknown): boolean {
	const msg = String((err as { message?: string })?.message ?? '').toLowerCase()
	return (
		msg.includes('network') ||
		msg.includes('timeout') ||
		msg.includes('abort') ||
		msg.includes('fetch') ||
		msg.includes('quota') ||
		msg.includes('rate limit') ||
		msg.includes('bad response') ||
		msg.includes('server error') ||
		msg.includes('socket') ||
		msg.includes('econn')
	)
}

async function aaFromFactory(provider: ethers.Provider, eoa: string, factoryAddr: string): Promise<string | null> {
	try {
		const eoaAddr = ethers.getAddress(eoa)
		const f = new ethers.Contract(factoryAddr, aaFactoryAbi, provider)
		let a = await f.beamioAccountOf(eoaAddr).catch((err: unknown) => {
			if (isNetworkOrRpcError(err)) throw err
			return ethers.ZeroAddress
		})
		if (!a || a === ethers.ZeroAddress) {
			a = await f.primaryAccountOf(eoaAddr).catch((err: unknown) => {
				if (isNetworkOrRpcError(err)) throw err
				return ethers.ZeroAddress
			})
		}
		if (!a || a === ethers.ZeroAddress) return null
		const code = await provider.getCode(a).catch((err: unknown) => {
			if (isNetworkOrRpcError(err)) throw err
			return '0x'
		})
		return code && code !== '0x' && code.length > 2 ? ethers.getAddress(a) : null
	} catch (err: unknown) {
		if (isNetworkOrRpcError(err)) throw err
		return null
	}
}

async function resolveBeamioAaOnConet(provider: ethers.Provider, eoa: string): Promise<string | null> {
	return aaFromFactory(provider, eoa, CONET_AA_FACTORY)
}

async function resolveSigningAaAccount(
	provider: ethers.Provider,
	profileAa: string | undefined,
	signerEoa: string,
): Promise<string> {
	const canonical = await resolveBeamioAaOnConet(provider, signerEoa)
	if (!canonical) {
		throw new Error('No Beamio Smart Account on CoNET for this wallet.')
	}
	const aa = ethers.getAddress(canonical)
	if (
		profileAa &&
		ethers.isAddress(profileAa) &&
		ethers.getAddress(profileAa).toLowerCase() !== aa.toLowerCase()
	) {
		console.warn(`[openContainerPayQr] profile.aaAccount ${profileAa} != canonical ${aa}; signing with canonical`)
	}
	return aa
}

export function conetPayQrProvider(): ethers.JsonRpcProvider {
	return new ethers.JsonRpcProvider(CONET_RPC_URL, CONET_MAINNET_CHAIN_ID)
}

/** CoNET OpenContainer QR — same as SilentPassUI Home `show_pay_code`. */
export async function signOpenContainerPayQrOnConet(
	profile: { privateKeyArmor: string; aaAccount?: string },
	options?: { to?: string; deadlineSeconds?: number },
): Promise<OpenContainerRelayPayload> {
	const provider = conetPayQrProvider()
	const signer = new ethers.Wallet(profile.privateKeyArmor, provider)
	const aaAccount = await resolveSigningAaAccount(provider, profile.aaAccount, signer.address)

	const code = await provider.getCode(aaAccount)
	if (!code || code === '0x' || code.length <= 2) {
		throw new Error(`AA account has no code: ${aaAccount}`)
	}

	const aa = new ethers.Contract(aaAccount, BEAMIO_ACCOUNT_ABI, provider)
	const owner = (await aa.owner()) as string
	if (owner.toLowerCase() !== signer.address.toLowerCase()) {
		throw new Error(`AA owner does not match signer: owner=${owner} signer=${signer.address}`)
	}

	const nonce = await readContainerNonceFromAAStorage(provider, aaAccount, 'openRelayed')
	const now = Math.floor(Date.now() / 1000)
	const deadline = BigInt(now + (options?.deadlineSeconds ?? PAY_RELAY_QR_TTL_SECONDS))
	const amountWei = ethers.parseUnits('0', 6)
	const to = options?.to && ethers.isAddress(options.to) ? options.to : signer.address

	const currencyType = 4
	const maxAmount = 0n

	const domain = {
		name: DOMAIN_NAME,
		version: DOMAIN_VERSION,
		chainId: CONET_MAINNET_CHAIN_ID,
		verifyingContract: aaAccount,
	}

	const types = {
		OpenContainerMain: [
			{ name: 'account', type: 'address' },
			{ name: 'currencyType', type: 'uint8' },
			{ name: 'maxAmount', type: 'uint256' },
			{ name: 'nonce', type: 'uint256' },
			{ name: 'deadline', type: 'uint256' },
		],
	}

	const value = {
		account: aaAccount,
		currencyType,
		maxAmount,
		nonce,
		deadline,
	}

	const signature = await signer.signTypedData(domain, types, value)

	return {
		account: aaAccount,
		to,
		items: [
			{
				kind: 0,
				asset: USDC_ADDRESS_BASE,
				amount: amountWei.toString(),
				tokenId: '0',
				data: '0x',
			},
		],
		currencyType,
		maxAmount: maxAmount.toString(),
		nonce: nonce.toString(),
		deadline: deadline.toString(),
		signature,
		chain: 'conet',
		chainId: CONET_MAINNET_CHAIN_ID,
	}
}

export function formatPayRelayCountdown(secondsLeft: number): string {
	if (secondsLeft <= 0) return '0:00'
	const m = Math.floor(secondsLeft / 60)
	const s = secondsLeft % 60
	return `${m}:${s.toString().padStart(2, '0')}`
}
