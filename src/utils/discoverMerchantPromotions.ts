/**
 * Active promotions panel model — aligned with SilentPassUI discoverMerchantPromotions.ts.
 */

export type DiscoverSocialMissionMetrics = {
	linkClick: number | null
	like: number | null
	topup: number | null
	claim: number | null
	burn: number | null
}

export type DiscoverActivePromotionsSocialMissions = {
	user: DiscoverSocialMissionMetrics | null
	referrer: DiscoverSocialMissionMetrics | null
	userDetailText: string
}

export type DiscoverCouponSocialMissionBlock = {
	id: string
	title: string
	tokenId: string
	user: DiscoverSocialMissionMetrics | null
	referrer: DiscoverSocialMissionMetrics | null
	userDetailText: string
	/** Per-event L2 on-chain rule IDs for this issued coupon (only configured events). */
	l2RuleIds: Partial<Record<CouponSocialPromotionEventKey, string>>
}

export const DISCOVER_COUPON_SOCIAL_MISSIONS_INITIAL = 3
export const DISCOVER_COUPON_SOCIAL_MISSIONS_PAGE_SIZE = 10

export type DiscoverActivePromotionsPanelModel = {
	activeCount: number
	socialMissions: DiscoverActivePromotionsSocialMissions | null
	couponSocialMissions: DiscoverCouponSocialMissionBlock[]
}

type SocialPromotionReward = {
	enabled?: boolean
	points13: number
}

type SocialPromotionEvent = {
	user?: SocialPromotionReward
	ref?: SocialPromotionReward
}

type ShareTokenMetadataSocialPromotion = {
	enabled?: boolean
	events?: {
		linkClick?: SocialPromotionEvent
		like?: SocialPromotionEvent
		topup?: SocialPromotionEvent
	}
}

type ShareTokenMetadataCouponSocialPromotion = {
	enabled?: boolean
	events?: {
		linkClick?: SocialPromotionEvent
		like?: SocialPromotionEvent
		claim?: SocialPromotionEvent
		burn?: SocialPromotionEvent
	}
}

const CARD_SOCIAL_EVENT_KEYS = ['linkClick', 'like', 'topup'] as const
const COUPON_SOCIAL_EVENT_KEYS = ['linkClick', 'like', 'claim', 'burn'] as const

export type CouponSocialPromotionEventKey = (typeof COUPON_SOCIAL_EVENT_KEYS)[number]

/** On-chain rule slot per coupon event (linkClick keeps ruleId = issuedTokenId). */
export const COUPON_SOCIAL_PROMOTION_EVENT_RULE_SLOTS: Record<CouponSocialPromotionEventKey, number> = {
	linkClick: 0,
	like: 1,
	claim: 2,
	burn: 3,
}

export function couponSocialPromotionRuleIdForEvent(
	issuedTokenId: string,
	eventKey: CouponSocialPromotionEventKey,
): string {
	const base = BigInt(String(issuedTokenId).trim())
	const slot = COUPON_SOCIAL_PROMOTION_EVENT_RULE_SLOTS[eventKey]
	if (slot === 0) return base.toString()
	return (base * 100n + BigInt(slot)).toString()
}

function parsePositiveInt(raw: unknown): number | null {
	if (raw == null || raw === '') return null
	const n = typeof raw === 'number' ? raw : Number.parseInt(String(raw).trim(), 10)
	if (!Number.isFinite(n) || n <= 0 || !Number.isInteger(n)) return null
	return n
}

function rewardFromPayload(raw: SocialPromotionReward | undefined): SocialPromotionReward | null {
	if (!raw || raw.enabled === false) return null
	const points = parsePositiveInt(raw.points13)
	if (points == null) return null
	return { enabled: true, points13: points }
}

function eventHasReward(ev: SocialPromotionEvent | undefined): boolean {
	if (!ev) return false
	return rewardFromPayload(ev.user) != null || rewardFromPayload(ev.ref) != null
}

function cardSocialPromotionEventLabel(key: (typeof CARD_SOCIAL_EVENT_KEYS)[number]): string {
	switch (key) {
		case 'linkClick':
			return 'Link click'
		case 'like':
			return 'Like'
		case 'topup':
			return 'Top-up'
		default:
			return key
	}
}

function couponSocialPromotionEventLabel(key: (typeof COUPON_SOCIAL_EVENT_KEYS)[number]): string {
	switch (key) {
		case 'linkClick':
			return 'Link click'
		case 'like':
			return 'Like'
		case 'claim':
			return 'Claim'
		case 'burn':
			return 'Burn'
		default:
			return key
	}
}

function eventDraftFromPayload(raw: SocialPromotionEvent | undefined): SocialPromotionEvent {
	return {
		user: raw?.user && raw.user.enabled !== false ? { enabled: true, points13: raw.user.points13 } : undefined,
		ref: raw?.ref && raw.ref.enabled !== false ? { enabled: true, points13: raw.ref.points13 } : undefined,
	}
}

function eventsPayloadFromRaw(
	eventsRaw: Record<string, unknown> | undefined,
	keys: readonly string[],
): Record<string, SocialPromotionEvent> {
	const events: Record<string, SocialPromotionEvent> = {}
	if (!eventsRaw || typeof eventsRaw !== 'object') return events
	for (const key of keys) {
		const ev = eventsRaw[key]
		if (ev && typeof ev === 'object') {
			const draft = eventDraftFromPayload(ev as SocialPromotionEvent)
			if (eventHasReward(draft)) events[key] = draft
		}
	}
	return events
}

function normalizeCouponSocialPromotionPayload(
	raw: Record<string, unknown>,
): ShareTokenMetadataCouponSocialPromotion | null {
	if (!raw.events || typeof raw.events !== 'object') return null
	const events = eventsPayloadFromRaw(raw.events as Record<string, unknown>, COUPON_SOCIAL_EVENT_KEYS)
	if (Object.keys(events).length === 0) return null
	return {
		enabled: raw.enabled !== false,
		events,
	}
}

function parseCouponSocialPromotionFromMetadata(
	meta: Record<string, unknown> | null | undefined,
): ShareTokenMetadataCouponSocialPromotion | null {
	if (!meta || typeof meta !== 'object') return null
	const raw = meta.socialPromotion
	if (!raw || typeof raw !== 'object') return null
	return normalizeCouponSocialPromotionPayload(raw as Record<string, unknown>)
}

function readMetadataTitle(meta: Record<string, unknown> | null): string {
	if (!meta) return ''
	const props = meta.properties && typeof meta.properties === 'object' ? (meta.properties as Record<string, unknown>) : null
	const beamioCoupon =
		props?.beamioCoupon && typeof props.beamioCoupon === 'object'
			? (props.beamioCoupon as Record<string, unknown>)
			: null
	const read = (v: unknown) => (typeof v === 'string' ? v.trim() : '')
	return (
		read(meta.title) ||
		read(meta.name) ||
		read(beamioCoupon?.title) ||
		read(beamioCoupon?.name) ||
		''
	)
}

function emptySocialMissionMetrics(): DiscoverSocialMissionMetrics {
	return { linkClick: null, like: null, topup: null, claim: null, burn: null }
}

function socialMissionMetricsHasValues(metrics: DiscoverSocialMissionMetrics): boolean {
	return (
		metrics.linkClick != null ||
		metrics.like != null ||
		metrics.topup != null ||
		metrics.claim != null ||
		metrics.burn != null
	)
}

function applySocialEventMetrics(
	metrics: DiscoverSocialMissionMetrics,
	key: (typeof CARD_SOCIAL_EVENT_KEYS)[number] | (typeof COUPON_SOCIAL_EVENT_KEYS)[number],
	points13: number,
): void {
	switch (key) {
		case 'linkClick':
			metrics.linkClick = points13
			break
		case 'like':
			metrics.like = points13
			break
		case 'topup':
			metrics.topup = points13
			break
		case 'claim':
			metrics.claim = points13
			break
		case 'burn':
			metrics.burn = points13
			break
		default:
			break
	}
}

function buildCardSocialMissionMetrics(cardSocial: ShareTokenMetadataSocialPromotion | null): {
	user: DiscoverSocialMissionMetrics | null
	referrer: DiscoverSocialMissionMetrics | null
	userDetailText: string
} {
	const user = emptySocialMissionMetrics()
	const referrer = emptySocialMissionMetrics()
	const userDetailLines: string[] = []
	if (!cardSocial?.events) {
		return { user: null, referrer: null, userDetailText: '' }
	}
	for (const key of CARD_SOCIAL_EVENT_KEYS) {
		const ev = cardSocial.events[key]
		if (!ev || !eventHasReward(ev)) continue
		const userReward = rewardFromPayload(ev.user)
		const refReward = rewardFromPayload(ev.ref)
		if (userReward) {
			applySocialEventMetrics(user, key, userReward.points13)
			userDetailLines.push(
				`${cardSocialPromotionEventLabel(key)}: earn ${userReward.points13} social reward point${userReward.points13 === 1 ? '' : 's'}.`,
			)
		}
		if (refReward) {
			applySocialEventMetrics(referrer, key, refReward.points13)
		}
	}
	return {
		user: socialMissionMetricsHasValues(user) ? user : null,
		referrer: socialMissionMetricsHasValues(referrer) ? referrer : null,
		userDetailText: userDetailLines.join(' '),
	}
}

function buildCouponSocialMissionMetrics(couponSocial: ShareTokenMetadataCouponSocialPromotion | null): {
	user: DiscoverSocialMissionMetrics | null
	referrer: DiscoverSocialMissionMetrics | null
	userDetailText: string
} {
	const user = emptySocialMissionMetrics()
	const referrer = emptySocialMissionMetrics()
	const userDetailLines: string[] = []
	if (!couponSocial?.events) {
		return { user: null, referrer: null, userDetailText: '' }
	}
	for (const key of COUPON_SOCIAL_EVENT_KEYS) {
		const ev = couponSocial.events[key]
		if (!ev || !eventHasReward(ev)) continue
		const userReward = rewardFromPayload(ev.user)
		const refReward = rewardFromPayload(ev.ref)
		if (userReward) {
			applySocialEventMetrics(user, key, userReward.points13)
			userDetailLines.push(
				`${couponSocialPromotionEventLabel(key)}: earn ${userReward.points13} social reward point${userReward.points13 === 1 ? '' : 's'}.`,
			)
		}
		if (refReward) {
			applySocialEventMetrics(referrer, key, refReward.points13)
		}
	}
	return {
		user: socialMissionMetricsHasValues(user) ? user : null,
		referrer: socialMissionMetricsHasValues(referrer) ? referrer : null,
		userDetailText: userDetailLines.join(' '),
	}
}

function compareCouponSocialMissionBlocksNewestFirst(
	a: DiscoverCouponSocialMissionBlock,
	b: DiscoverCouponSocialMissionBlock,
): number {
	try {
		const diff = BigInt(b.tokenId) - BigInt(a.tokenId)
		if (diff > 0n) return 1
		if (diff < 0n) return -1
		return 0
	} catch {
		return b.tokenId.localeCompare(a.tokenId)
	}
}

function buildCouponL2RuleIds(
	tokenId: string,
	couponSocial: ShareTokenMetadataCouponSocialPromotion | null,
): Partial<Record<CouponSocialPromotionEventKey, string>> {
	const out: Partial<Record<CouponSocialPromotionEventKey, string>> = {}
	if (!couponSocial?.events) return out
	for (const key of COUPON_SOCIAL_EVENT_KEYS) {
		const ev = couponSocial.events[key]
		if (!ev || !eventHasReward(ev)) continue
		out[key] = couponSocialPromotionRuleIdForEvent(tokenId, key)
	}
	return out
}

function buildCouponSocialMissionBlocks(
	couponSeries: Array<{ title?: string; metadata?: Record<string, unknown> | null; tokenId?: string }> | undefined,
): DiscoverCouponSocialMissionBlock[] {
	const blocks: DiscoverCouponSocialMissionBlock[] = []
	for (const series of couponSeries ?? []) {
		const tokenId = String(series.tokenId ?? '').trim()
		if (!tokenId) continue
		const couponMeta = series.metadata ?? null
		const couponSocial = parseCouponSocialPromotionFromMetadata(couponMeta)
		if (!couponSocial || couponSocial.enabled === false) continue
		const { user, referrer, userDetailText } = buildCouponSocialMissionMetrics(couponSocial)
		if (!user && !referrer) continue
		const title = series.title?.trim() || readMetadataTitle(couponMeta) || 'Coupon'
		blocks.push({
			id: `coupon-social-${tokenId}`,
			title,
			tokenId,
			user,
			referrer,
			userDetailText,
			l2RuleIds: buildCouponL2RuleIds(tokenId, couponSocial),
		})
	}
	return blocks.sort(compareCouponSocialMissionBlocksNewestFirst)
}

/** Single coupon row in Discover detail Available Offers — social mission rewards if configured. */
export function resolveCouponSocialMissionBlockForSeries(
	series: { title?: string; metadata?: Record<string, unknown> | null; tokenId?: string },
): DiscoverCouponSocialMissionBlock | null {
	const blocks = buildCouponSocialMissionBlocks([series])
	return blocks[0] ?? null
}

function countActivePromotionSurfaces(model: {
	socialMissions: DiscoverActivePromotionsSocialMissions | null
}): number {
	let count = 0
	if (model.socialMissions?.user) count += 1
	if (model.socialMissions?.referrer) count += 1
	return count
}

export function buildDiscoverActivePromotionsPanelModel(params: {
	metadataRoot: Record<string, unknown> | null | undefined
	chainCardSocialPromotion?: ShareTokenMetadataSocialPromotion | null
	/** @deprecated L2 coupon social missions are shown per Available Offers item, not in this panel. */
	couponSeries?: Array<{ title?: string; metadata?: Record<string, unknown> | null; tokenId?: string }>
}): DiscoverActivePromotionsPanelModel | null {
	const chainLoaded = params.chainCardSocialPromotion !== undefined
	const cardSocial = chainLoaded ? params.chainCardSocialPromotion : null
	const { user, referrer, userDetailText } = buildCardSocialMissionMetrics(cardSocial ?? null)
	const socialMissions =
		user || referrer
			? {
					user,
					referrer,
					userDetailText,
				}
			: null

	if (!socialMissions) return null

	const model = {
		activeCount: 0,
		socialMissions,
		couponSocialMissions: [] as DiscoverCouponSocialMissionBlock[],
	}
	model.activeCount = countActivePromotionSurfaces(model)
	return model
}

export function formatSocialPoints13Display(value: number | null | undefined): string {
	if (value == null || !Number.isFinite(value)) return '—'
	const n = Math.max(0, Math.floor(value))
	return n.toLocaleString('en-US')
}
