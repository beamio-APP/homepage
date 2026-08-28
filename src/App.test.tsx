import { getMarketingSite } from './utils/siteIdentity'

test('uses Beamio as the default marketing site outside CoNET hosts', () => {
	expect(getMarketingSite()).toBe('beamio')
})
