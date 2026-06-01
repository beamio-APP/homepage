/**
 * Mirror of `src/x402sdk/src/catalogProductionVideoOg.ts` — catalog video → YouTube OG copy mapping.
 * Right thumbnail: 480×360 (hqdefault). See repo `.cursor/rules/beamio-catalog-video-og-thumbnail.mdc`.
 */

/** YouTube hqdefault — keep in sync with bizSite `catalogProductionVideoOgConstants.ts`. */
export const CATALOG_VIDEO_OG_RIGHT_THUMB_WIDTH = 480
export const CATALOG_VIDEO_OG_RIGHT_THUMB_HEIGHT = 360

export const CATALOG_VIDEO_OG_RIGHT_THUMB_SLOT_CLASSNAME =
	'relative w-14 shrink-0 aspect-[4/3] overflow-hidden rounded-xl bg-[#0f172a]/90 ring-1 ring-[#e5e9eb]'

/** OG raster width (`couponClaimShare` OG_WIDTH). App-download ticket uses `max-w-lg` (512px). */
export const CATALOG_VIDEO_OG_SHARE_LAYOUT_WIDTH_PX = 1200
export const CATALOG_VIDEO_OG_SHARE_BANNER_HEIGHT_PX = 258
export const CATALOG_VIDEO_OG_APP_DOWNLOAD_TICKET_MAX_WIDTH_PX = 512
export const CATALOG_VIDEO_OG_APP_DOWNLOAD_BANNER_HEIGHT_PX = Math.round(
	(CATALOG_VIDEO_OG_SHARE_BANNER_HEIGHT_PX * CATALOG_VIDEO_OG_APP_DOWNLOAD_TICKET_MAX_WIDTH_PX) /
		CATALOG_VIDEO_OG_SHARE_LAYOUT_WIDTH_PX
)

/** Business Catalogs / Distribution share preview: metadata only under banner (no right thumb). */
export const CATALOG_VIDEO_OG_BELOW_BANNER_ROW_OG_PREVIEW_CLASSNAME = 'w-full px-4 pb-4 pt-3'

export type CatalogProductionVideoOgLayout = 'default' | 'videoOg'

export type CouponClaimShareMetaVideoFields = {
	catalogLayout?: CatalogProductionVideoOgLayout
	title: string
	subtitle: string
	publisherLine?: string
	iconUrl: string
	backgroundImage: string
}
