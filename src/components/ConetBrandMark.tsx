import { cn } from '../lib/utils'

/** Official CoNET network icon (Blockscout). Local mirror of the same file. */
export const CONET_NETWORK_ICON_DARK_SRC = '/network_icon_dark.svg'
export const CONET_NETWORK_ICON_DARK_OFFICIAL =
	'https://mainnet.conet.network/assets/configs/network_icon_dark.svg'

export function ConetBrandMark({
	className,
	compact = false,
}: {
	className?: string
	compact?: boolean
}) {
	const size = compact ? 32 : 36
	return (
		<span className={cn('inline-flex items-center gap-3 text-white', className)}>
			<img
				src={CONET_NETWORK_ICON_DARK_OFFICIAL}
				alt=""
				width={size}
				height={size}
				className={cn('shrink-0 object-contain', compact ? 'h-8 w-8' : 'h-9 w-9')}
				onError={(event) => {
					const img = event.currentTarget
					if (img.src.includes(CONET_NETWORK_ICON_DARK_SRC)) return
					img.src = CONET_NETWORK_ICON_DARK_SRC
				}}
			/>
			{compact ? null : (
				<span className="text-[1.05rem] font-semibold tracking-[-0.03em]">CoNET</span>
			)}
		</span>
	)
}

export default ConetBrandMark
