import type { CSSProperties } from 'react'

/**
 * 固定顶栏胶囊与滚动区顶占位 — 与 SilentPassUI Home.tsx 同源。
 * - 刘海机：env(safe-area-inset-top) 通常 > 1rem → 胶囊在刘海下缘
 * - 非刘海 / safe-area=0：至少 1rem，与 PWA 浏览器视觉对齐（含 WebView 常返回 0 的兜底）
 * 须配合 index.html `viewport-fit=cover`（见 beamio-fixed-top-capsule-protocol.mdc）
 */
export const BEAMIO_FIXED_CAPSULE_TOP = 'max(1rem, env(safe-area-inset-top, 0px))'

/** 胶囊高度区 + 与 top 同源的 safe 偏移（Home 为 +5rem） */
export const BEAMIO_FIXED_CAPSULE_SCROLL_TOP_SPACER = `calc(${BEAMIO_FIXED_CAPSULE_TOP} + 5rem)`

export function beamioFixedCapsuleTopStyle(): CSSProperties {
	return { top: BEAMIO_FIXED_CAPSULE_TOP }
}

export function beamioFixedCapsuleScrollTopSpacerStyle(): CSSProperties {
	return { minHeight: BEAMIO_FIXED_CAPSULE_SCROLL_TOP_SPACER }
}
