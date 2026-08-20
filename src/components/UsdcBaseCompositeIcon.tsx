import usdcIcon from './assets/usdc.png'
import baseIcon from './assets/base-logo.png'

export function UsdcBaseCompositeIcon({
	size = 16,
	badgeSize = 10,
}: {
	size?: number
	badgeSize?: number
}) {
	return (
		<span
			className="relative inline-flex shrink-0"
			style={{ width: size, height: size }}
			aria-hidden
		>
			<img
				src={usdcIcon}
				alt=""
				className="block rounded-full object-contain"
				style={{ width: size, height: size }}
			/>
			<img
				src={baseIcon}
				alt=""
				className="absolute -bottom-0.5 -right-0.5 rounded-full border border-white bg-white object-contain dark:border-slate-900"
				style={{ width: badgeSize, height: badgeSize }}
			/>
		</span>
	)
}
