import { ethers } from 'ethers'

import {
	provisionWebShareVisitWallet,
	resolveSigningWalletFromBlob,
} from './beamioWebShareWallet'
import { providerForBeamioUserCard } from './beamioUserCardChain'

const BEAMIO_API = '/api'
const UC_USER_CLICK = 3
const UC_TARGET_MERCHANT_CARD = 1
const SESSION_CLICK_KEY_PREFIX = 'beamio:discover-share-click:v1:'
const SESSION_REWARD_KEY_PREFIX = 'beamio:discover-share-reward13:v1:'

const REWARD_RULE_ABI = [
	'function getRewardRule(uint256 ruleId) view returns (bool active, uint8 eventKind, uint8 targetKind, uint256 issuedParentId, uint256 actorMint13, uint256 refMint13)',
] as const

/** Parse inner `/app/?beamiocard=…&discover=open[&ref=…]` from app-download target URL. */
export function parseDiscoverMerchantCardFromTarget(innerAppUrl: string): string | null {
	const parsed = parseDiscoverMerchantOpenFromTarget(innerAppUrl)
	return parsed?.cardAddress ?? null
}

export function parseDiscoverMerchantOpenFromTarget(
	innerAppUrl: string,
): { cardAddress: string; referrerEoa: string | null } | null {
	const raw = innerAppUrl?.trim() ?? ''
	if (!raw) return null
	try {
		const u = new URL(raw)
		const card =
			u.searchParams.get('beamiocard')?.trim() ??
			u.searchParams.get('beamioCard')?.trim() ??
			u.searchParams.get('beamioCardAddress')?.trim() ??
			''
		const discover = (u.searchParams.get('discover') ?? '').trim().toLowerCase()
		if (!card || discover !== 'open') return null
		const refRaw = (u.searchParams.get('ref') ?? u.searchParams.get('referrer') ?? '').trim()
		const referrerEoa = refRaw && ethers.isAddress(refRaw) ? ethers.getAddress(refRaw) : null
		return { cardAddress: ethers.getAddress(card), referrerEoa }
	} catch {
		return null
	}
}

function resolveShareClickRefWallet(actorEOA: string, referrerEoa?: string | null): string | undefined {
	const raw = referrerEoa?.trim() ?? ''
	if (!raw || !ethers.isAddress(raw)) return undefined
	try {
		const ref = ethers.getAddress(raw)
		const actor = ethers.getAddress(actorEOA)
		if (ref === actor) return undefined
		return ref
	} catch {
		return undefined
	}
}

function sessionClickDedupeKey(cardAddress: string, actorEOA: string): string {
	return `${SESSION_CLICK_KEY_PREFIX}${cardAddress.toLowerCase()}:${actorEOA.toLowerCase()}`
}

function sessionRewardDedupeKey(cardAddress: string, actorEOA: string): string {
	return `${SESSION_REWARD_KEY_PREFIX}${cardAddress.toLowerCase()}:${actorEOA.toLowerCase()}`
}

function wasShareClickRecordedThisSession(cardAddress: string, actorEOA: string): boolean {
	try {
		return sessionStorage.getItem(sessionClickDedupeKey(cardAddress, actorEOA)) === '1'
	} catch {
		return false
	}
}

function wasReward13DispatchedThisSession(cardAddress: string, actorEOA: string): boolean {
	try {
		return sessionStorage.getItem(sessionRewardDedupeKey(cardAddress, actorEOA)) === '1'
	} catch {
		return false
	}
}

function markShareClickRecordedThisSession(cardAddress: string, actorEOA: string): void {
	try {
		sessionStorage.setItem(sessionClickDedupeKey(cardAddress, actorEOA), '1')
	} catch {
		/* ignore quota / private mode */
	}
}

function markReward13DispatchedThisSession(cardAddress: string, actorEOA: string): void {
	try {
		sessionStorage.setItem(sessionRewardDedupeKey(cardAddress, actorEOA), '1')
	} catch {
		/* ignore quota / private mode */
	}
}

async function dispatchDiscoverShareReward13IfNeeded(params: {
	cardAddress: string
	actorEOA: string
	refWallet?: string
	clickAttestation: string
	attestationTs: number
}): Promise<boolean> {
	if (wasReward13DispatchedThisSession(params.cardAddress, params.actorEOA)) return false
	const ruleId = await resolveRewardDispatchRuleId(params.cardAddress)
	if (ruleId == null) return false
	const rewardRes = await fetch(`${BEAMIO_API}/cardDispatchEventReward13`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			cardAddress: params.cardAddress,
			ruleId,
			actorWallet: params.actorEOA,
			...(params.refWallet ? { refWallet: params.refWallet } : {}),
			cumulativeTargetKind: UC_TARGET_MERCHANT_CARD,
			cumulativeIssuedParentId: '0',
			cumulativeDelta: '0',
			clickAttestation: params.clickAttestation,
			attestationTs: params.attestationTs,
		}),
	})
	const rewardJson = (await rewardRes.json().catch(() => null)) as { success?: boolean } | null
	const rewardTxQueued = Boolean(rewardRes.ok && rewardJson?.success)
	if (rewardTxQueued) markReward13DispatchedThisSession(params.cardAddress, params.actorEOA)
	return rewardTxQueued
}

/** Optional #13 voucher rewards when merchant configured an active USER_CLICK rule. */
async function resolveRewardDispatchRuleId(cardAddress: string): Promise<number | null> {
	try {
		const { provider } = await providerForBeamioUserCard(cardAddress)
		const c = new ethers.Contract(cardAddress, REWARD_RULE_ABI, provider)
		for (let ruleId = 1; ruleId <= 12; ruleId++) {
			const row = (await c.getRewardRule(ruleId)) as [
				boolean,
				number,
				number,
				bigint,
				bigint,
				bigint,
			]
			const [active, eventKind, , , actorMint13, refMint13] = row
			if (
				active &&
				Number(eventKind) === UC_USER_CLICK &&
				(actorMint13 > 0n || refMint13 > 0n)
			) {
				return ruleId
			}
		}
	} catch {
		/* untrusted — skip optional reward dispatch */
	}
	return null
}

async function signShareClickAttestation(
	wallet: ethers.Wallet,
	cardAddress: string,
): Promise<{ clickAttestation: string; attestationTs: number }> {
	const attestationTs = Date.now()
	const payload = JSON.stringify({
		kind: 'beamio_discover_share_click_v1',
		cardAddress: ethers.getAddress(cardAddress),
		actor: wallet.address,
		ts: attestationTs,
	})
	const clickAttestation = await wallet.signMessage(payload)
	return { clickAttestation, attestationTs }
}

export type DiscoverShareClickResult =
	| { ok: true; actorEOA: string; txQueued: boolean; skipped?: 'session'; rewardTxQueued?: boolean }
	| { ok: false; reason: string }

/**
 * Ensure local wallet + record merchant Discover share link click (REF_CLICK totalSupply).
 * Counting does not require Top-up reward budget; optional #13 vouchers mint on active promotion rules.
 */
export async function recordDiscoverShareClickIfNeeded(
	cardAddress: string,
	opts?: { referrerEoa?: string | null },
): Promise<DiscoverShareClickResult> {
	let card: string
	try {
		card = ethers.getAddress(String(cardAddress ?? '').trim())
	} catch {
		return { ok: false, reason: 'invalid_card' }
	}

	const walletBlob = await provisionWebShareVisitWallet()
	const wallet = resolveSigningWalletFromBlob(walletBlob)
	if (!wallet) return { ok: false, reason: 'wallet_unavailable' }

	const actorEOA = wallet.address
	const { clickAttestation, attestationTs } = await signShareClickAttestation(wallet, card)
	const refWallet = resolveShareClickRefWallet(actorEOA, opts?.referrerEoa)

	if (wasShareClickRecordedThisSession(card, actorEOA)) {
		try {
			const rewardTxQueued = await dispatchDiscoverShareReward13IfNeeded({
				cardAddress: card,
				actorEOA,
				refWallet,
				clickAttestation,
				attestationTs,
			})
			return { ok: true, actorEOA, txQueued: false, skipped: 'session', rewardTxQueued }
		} catch {
			return { ok: false, reason: 'network' }
		}
	}

	try {
		const res = await fetch(`${BEAMIO_API}/cardRecordDiscoverShareClick`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			keepalive: true,
			body: JSON.stringify({
				cardAddress: card,
				actorWallet: actorEOA,
				...(refWallet ? { refWallet } : {}),
				cumulativeTargetKind: UC_TARGET_MERCHANT_CARD,
				cumulativeIssuedParentId: '0',
				clickAttestation,
				attestationTs,
			}),
		})
		const json = (await res.json().catch(() => null)) as { success?: boolean; error?: string } | null
		if (!res.ok || !json?.success) {
			return { ok: false, reason: json?.error ?? `http_${res.status}` }
		}

		markShareClickRecordedThisSession(card, actorEOA)
		const rewardTxQueued = await dispatchDiscoverShareReward13IfNeeded({
			cardAddress: card,
			actorEOA,
			refWallet,
			clickAttestation,
			attestationTs,
		})
		return { ok: true, actorEOA, txQueued: true, rewardTxQueued }
	} catch {
		return { ok: false, reason: 'network' }
	}
}
