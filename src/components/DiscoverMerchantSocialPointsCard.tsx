import React from 'react'
import { Star } from 'lucide-react'
import { formatSocialPoints13Display } from '../utils/discoverMerchantPromotions'

type Props = {
	points: number | null
	loading: boolean
}

/** Aligned with SilentPassUI DiscoverMerchantSocialPointsCard (Market.tsx). */
export function DiscoverMerchantSocialPointsCard({ points, loading }: Props) {
	const display = loading ? '—' : formatSocialPoints13Display(points)
	return (
		<div className="rounded-[22px] bg-white p-4 shadow-[0_8px_22px_rgba(15,23,42,0.06)] ring-1 ring-[#e8ecf0] sm:p-5">
			<div className="flex items-start gap-3">
				<span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f5ecff] text-[#8d3a8b]">
					<Star className="h-6 w-6" strokeWidth={2} aria-hidden />
				</span>
				<div className="min-w-0 flex-1">
					<h3 className="text-[17px] font-bold leading-tight text-[#1f2328]">Your social points</h3>
					<p className="mt-1 text-[13px] font-medium text-slate-500">Reward vouchers on this merchant card</p>
				</div>
				<p className="shrink-0 text-[28px] font-extrabold leading-none tracking-tight text-[#8d3a8b]">
					{display}
				</p>
			</div>
		</div>
	)
}
