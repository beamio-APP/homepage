import { ethers } from 'ethers'

const BEAMIO_API = '/api'

export type CardProgramSocialSummary = {
	likeCount: number | null
	shareClickCount: number | null
}

function pickMaxStat(a: number | null | undefined, b: number | null | undefined): number | null {
	if (a == null && b == null) return null
	if (a == null) return b ?? null
	if (b == null) return a
	return Math.max(a, b)
}

/** Prefer fresher live props; take max when both present (post-click refetch vs landing snapshot). */
export function mergeCardProgramSocialSummary(
	live: CardProgramSocialSummary | null | undefined,
	cached: CardProgramSocialSummary | null | undefined,
): CardProgramSocialSummary | null {
	if (!live && !cached) return null
	return {
		likeCount: pickMaxStat(live?.likeCount, cached?.likeCount),
		shareClickCount: pickMaxStat(live?.shareClickCount, cached?.shareClickCount),
	}
}

export function formatProgramSocialStatCount(n: number | null | undefined): string {
	if (n == null || !Number.isFinite(n) || n < 0) return '—'
	const v = Math.trunc(n)
	if (v >= 1_000_000) {
		const m = v / 1_000_000
		return `${m >= 10 ? Math.round(m) : m.toFixed(1).replace(/\.0$/, '')}M`
	}
	if (v >= 10_000) return `${Math.round(v / 1000)}k`
	if (v >= 1000) return `${(v / 1000).toFixed(1).replace(/\.0$/, '')}k`
	return String(v)
}

/** Trusted API success only — failure returns null (caller keeps previous / null). */
export async function fetchCardProgramSocialSummary(
	cardAddress: string,
): Promise<CardProgramSocialSummary | null> {
	let addr: string
	try {
		addr = ethers.getAddress(String(cardAddress ?? '').trim())
	} catch {
		return null
	}
	try {
		const url = `${BEAMIO_API}/cardProgramSocial?${new URLSearchParams({
			cardAddress: addr,
			mode: 'summary',
			limit: '1',
			targetKind: '1',
			issuedParentId: '0',
		})}`
		const res = await fetch(url)
		if (!res.ok) return null
		const json = (await res.json()) as {
			likeCount?: unknown
			shareClickCount?: unknown
		}
		const likeRaw = json.likeCount
		const shareRaw = json.shareClickCount
		const likeCount =
			likeRaw != null && Number.isFinite(Number(likeRaw)) && Number(likeRaw) >= 0
				? Math.trunc(Number(likeRaw))
				: null
		const shareClickCount =
			shareRaw != null && Number.isFinite(Number(shareRaw)) && Number(shareRaw) >= 0
				? Math.trunc(Number(shareRaw))
				: null
		return { likeCount, shareClickCount }
	} catch {
		return null
	}
}
