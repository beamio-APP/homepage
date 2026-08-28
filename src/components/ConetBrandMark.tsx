import React from 'react'

type ConetBrandMarkProps = {
	className?: string
	compact?: boolean
}

export default function ConetBrandMark({ className = '', compact = false }: ConetBrandMarkProps) {
	return (
		<div className={`inline-flex items-center gap-2.5 ${className}`}>
			<span
				aria-hidden="true"
				className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-xl bg-[#101115] shadow-[0_0_24px_rgba(103,232,249,0.16)]"
			>
				<span className="absolute inset-1 rounded-lg border border-cyan-200/70" />
				<span className="absolute h-7 w-7 rounded-full border border-[#c084fc]/75" />
				<span className="relative text-sm font-black tracking-[-0.08em] text-white">C</span>
			</span>
			{!compact ? <span className="text-lg font-bold tracking-[-0.035em] text-white">CoNET</span> : null}
		</div>
	)
}
