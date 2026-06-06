import { buildMobileWalletDappLinks, openBaseWalletDappWithFallback } from '../utils/mobileWalletApps'

function iconSrc(file: string): string {
	const base = process.env.PUBLIC_URL || ''
	const root = base.endsWith('/') ? base : `${base}/`
	return `${root}assets/wallets/${file}`
}

const ICON_BTN =
	'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-outline-variant/30 bg-white p-2 shadow-md transition-all hover:bg-surface-container-high hover:shadow-lg active:scale-95'

const IMG_CLASS = 'h-10 w-10 object-contain'

type Props = {
	className?: string
}

export function WalletAppDappIconButtons({ className = '' }: Props) {
	const links = buildMobileWalletDappLinks()

	return (
		<div className={`flex flex-wrap items-center justify-center gap-4 ${className}`.trim()}>
			<a href={links.metamask} target="_self" rel="noreferrer" className={ICON_BTN} aria-label="Open in MetaMask">
				<img src={iconSrc('metamask.png')} alt="" className={IMG_CLASS} width={40} height={40} decoding="async" />
			</a>
			<button
				type="button"
				onClick={() => openBaseWalletDappWithFallback()}
				className={ICON_BTN}
				aria-label="Open in Base Wallet"
			>
				<img src={iconSrc('base.png')} alt="" className={IMG_CLASS} width={40} height={40} decoding="async" />
			</button>
			<a href={links.okx} target="_self" rel="noreferrer" className={ICON_BTN} aria-label="Open in OKX Wallet">
				<img src={iconSrc('okx.png')} alt="" className={IMG_CLASS} width={40} height={40} decoding="async" />
			</a>
			<a href={links.tp} target="_self" rel="noreferrer" className={ICON_BTN} aria-label="Open in TokenPocket">
				<img src={iconSrc('tokenpocket.png')} alt="" className={IMG_CLASS} width={40} height={40} decoding="async" />
			</a>
		</div>
	)
}
