const HEADER_SCROLL_OFFSET_PX = 72

export function scrollToPageSection(
	sectionId: string,
	behavior: ScrollBehavior = 'smooth',
): boolean {
	const el = document.getElementById(sectionId)
	if (!el) return false
	const scroller = (document.scrollingElement || document.documentElement) as HTMLElement
	const header = document.querySelector('header.sticky') as HTMLElement | null
	const offset = header?.getBoundingClientRect().height || HEADER_SCROLL_OFFSET_PX
	const top = Math.max(0, el.getBoundingClientRect().top + scroller.scrollTop - offset)
	scroller.scrollTo({ top, behavior })
	window.scrollTo({ top, behavior })
	return true
}

export function queueScrollToPageSection(sectionId: string, behavior: ScrollBehavior = 'smooth'): void {
	const run = () => {
		if (scrollToPageSection(sectionId, behavior)) return
		window.setTimeout(() => {
			scrollToPageSection(sectionId, behavior)
		}, 80)
	}
	if (typeof window.requestAnimationFrame === 'function') {
		window.requestAnimationFrame(run)
		return
	}
	run()
}
