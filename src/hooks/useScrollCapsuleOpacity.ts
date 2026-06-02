import { useCallback, useEffect, useRef, useState } from 'react'

const THRESHOLD = 40
const FADE_RANGE = 100

const computeOpacity = (scrollTop: number) =>
	scrollTop <= THRESHOLD ? 1 : Math.max(0, 1 - (scrollTop - THRESHOLD) / FADE_RANGE)

/**
 * 根据滚动位置计算固定顶栏胶囊不透明度（与 SilentPassUI Home 一致）。
 * - `element`（默认）：ref + onScroll 绑定 overflow-y-auto 容器（PWA Home）
 * - `window`：监听 window.scrollY（营销 /app-download，恢复视口级滚动条）
 * 见 beamio-fixed-top-capsule-protocol.mdc
 */
export function useScrollCapsuleOpacity(
	enabled = true,
	scrollRoot: 'element' | 'window' = 'element'
) {
	const [opacity, setOpacity] = useState(1)
	const ref = useRef<HTMLDivElement | null>(null)

	const readWindowScrollTop = () =>
		window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0

	const onScroll = useCallback(
		(e: React.UIEvent<HTMLDivElement>) => {
			if (!enabled || scrollRoot !== 'element') return
			setOpacity(computeOpacity(e.currentTarget.scrollTop))
		},
		[enabled, scrollRoot]
	)

	const setRef = useCallback(
		(node: HTMLDivElement | null) => {
			ref.current = node
			if (!enabled) return
			if (scrollRoot === 'window') {
				setOpacity(computeOpacity(readWindowScrollTop()))
				return
			}
			if (node) setOpacity(computeOpacity(node.scrollTop))
		},
		[enabled, scrollRoot]
	)

	useEffect(() => {
		if (!enabled || scrollRoot !== 'element' || !ref.current) return
		setOpacity(computeOpacity(ref.current.scrollTop))
	}, [enabled, scrollRoot])

	useEffect(() => {
		if (!enabled || scrollRoot !== 'window') return
		const update = () => setOpacity(computeOpacity(readWindowScrollTop()))
		update()
		window.addEventListener('scroll', update, { passive: true })
		return () => window.removeEventListener('scroll', update)
	}, [enabled, scrollRoot])

	// document capture 兜底：element 模式下部分 WebView onScroll 不触发
	useEffect(() => {
		if (!enabled || scrollRoot !== 'element') return
		const handler = (e: Event) => {
			const target = e.target as HTMLElement | null
			if (!target || target !== ref.current) return
			const top = typeof target.scrollTop === 'number' ? target.scrollTop : 0
			setOpacity(computeOpacity(top))
		}
		document.addEventListener('scroll', handler, { passive: true, capture: true })
		return () => document.removeEventListener('scroll', handler, true)
	}, [enabled, scrollRoot])

	return { opacity, onScroll, setRef }
}
