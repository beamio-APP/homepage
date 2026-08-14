export type FuelPackId =
	| 'genesis_starter'
	| 'testing_waters'
	| 'growth'
	| 'enterprise'
	| 'institutional'

export type FuelPackCatalogEntry = {
	id: FuelPackId
	name: string
	usdcAmount: string
	paidBUnits: number
	freeBUnits: number
	firstTimeOnly?: boolean
}

/** Mirror of x402sdk `fuelPackCatalog.ts` — homepage cannot import across subprojects. */
export const FUEL_PACK_CATALOG: FuelPackCatalogEntry[] = [
	{
		id: 'genesis_starter',
		name: 'Newcomer Genesis Pack',
		usdcAmount: '15',
		paidBUnits: 1500,
		freeBUnits: 500,
		firstTimeOnly: true,
	},
	{
		id: 'testing_waters',
		name: 'Testing the Waters Pack',
		usdcAmount: '49',
		paidBUnits: 4900,
		freeBUnits: 245,
	},
	{
		id: 'growth',
		name: 'Growth Pack',
		usdcAmount: '199',
		paidBUnits: 19900,
		freeBUnits: 1990,
	},
	{
		id: 'enterprise',
		name: 'Enterprise Pack',
		usdcAmount: '999',
		paidBUnits: 99900,
		freeBUnits: 14985,
	},
	{
		id: 'institutional',
		name: 'Institutional Pack',
		usdcAmount: '4999',
		paidBUnits: 499900,
		freeBUnits: 99980,
	},
]

export function lookupFuelPack(raw: unknown): FuelPackCatalogEntry | null {
	const id = String(raw ?? '')
		.trim()
		.toLowerCase()
	if (!id) return null
	return FUEL_PACK_CATALOG.find((p) => p.id === id) ?? null
}
