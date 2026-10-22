/**
 * Mirror of x402sdk `fuelPackCatalog.ts` — homepage cannot import across subprojects.
 * User UI: price + total B-Units only (see beamio-fuel-pack-display-no-paid-free).
 */
export type FuelPackId = 'starter' | 'growth' | 'business' | 'scale'

export type FuelPackCatalogEntry = {
	id: string
	name: string
	usdcAmount: string
	/** Checkout allocation only — UI must show paid+free as a single B-Units total. */
	paidBUnits: number
	freeBUnits: number
	firstTimeOnly?: boolean
}

export const FUEL_PACK_CATALOG: FuelPackCatalogEntry[] = [
	{
		id: 'starter',
		name: 'Starter',
		usdcAmount: '49',
		paidBUnits: 4900,
		freeBUnits: 245,
	},
	{
		id: 'growth',
		name: 'Growth',
		usdcAmount: '199',
		paidBUnits: 19900,
		freeBUnits: 1990,
	},
	{
		id: 'business',
		name: 'Business',
		usdcAmount: '999',
		paidBUnits: 99900,
		freeBUnits: 14985,
	},
	{
		id: 'scale',
		name: 'Scale',
		usdcAmount: '4999',
		paidBUnits: 499900,
		freeBUnits: 99980,
	},
]

const FUEL_PACK_ID_ALIASES: Record<string, FuelPackId> = {
	testing_waters: 'starter',
	enterprise: 'business',
	institutional: 'scale',
}

export function lookupFuelPack(raw: unknown): FuelPackCatalogEntry | null {
	let id = String(raw ?? '')
		.trim()
		.toLowerCase()
	if (!id) return null
	id = FUEL_PACK_ID_ALIASES[id] ?? id
	return FUEL_PACK_CATALOG.find((p) => p.id === id) ?? null
}
