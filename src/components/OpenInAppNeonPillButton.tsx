import React from 'react'
import { Loader2 } from 'lucide-react'

/** Neon cyan used for border / B mark glow (matches design reference). */
const NEON = '#5ce1ff'
const NEON_SOFT = 'rgba(92, 225, 255, 0.55)'
const NEON_DIM = 'rgba(92, 225, 255, 0.28)'

type OpenInAppNeonPillButtonProps = {
	onClick: () => void
	busy?: boolean
	className?: string
	label?: string
}

/** Dark pill + neon border + circular “B” — top-right Open in App chrome. */
export default function OpenInAppNeonPillButton({
	onClick,
	busy = false,
	className = '',
	label = 'Open in App',
}: OpenInAppNeonPillButtonProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={busy}
			aria-busy={busy}
			aria-label={busy ? 'Opening Beamio' : label}
			className={[
				'inline-flex h-11 shrink-0 items-center gap-2.5 rounded-full border px-3.5 pl-2.5',
				'text-[13px] font-semibold tracking-tight text-white sm:text-sm',
				'transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-80',
				className,
			].join(' ')}
			style={{
				backgroundColor: '#000510',
				borderColor: NEON,
				borderWidth: 1.5,
				boxShadow: `0 0 0 1px ${NEON_DIM}, 0 0 12px ${NEON_SOFT}, inset 0 0 10px ${NEON_DIM}`,
			}}
		>
			{busy ? (
				<span
					className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
					style={{
						border: `1.5px solid ${NEON}`,
						boxShadow: `0 0 8px ${NEON_SOFT}`,
					}}
					aria-hidden
				>
					<Loader2 className="h-3.5 w-3.5 animate-spin" style={{ color: NEON }} />
				</span>
			) : (
				<span
					className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
					style={{
						border: `1.5px solid ${NEON}`,
						boxShadow: `0 0 8px ${NEON_SOFT}, inset 0 0 6px ${NEON_DIM}`,
					}}
					aria-hidden
				>
					<svg viewBox="0 0 24 24" className="h-[15px] w-[15px]" fill="none" aria-hidden>
						<path
							d="M8.2 5.2h5.1c2.35 0 3.95 1.35 3.95 3.35 0 1.35-.75 2.4-1.95 2.9 1.45.5 2.4 1.7 2.4 3.35 0 2.2-1.75 3.55-4.25 3.55H8.2V5.2zm2.55 2.05v3.15h2.35c1.15 0 1.8-.55 1.8-1.55s-.65-1.6-1.85-1.6H10.75zm0 5.2v3.45h2.7c1.3 0 2.05-.6 2.05-1.7s-.75-1.75-2.1-1.75h-2.65z"
							fill={NEON}
							style={{ filter: `drop-shadow(0 0 3px ${NEON_SOFT})` }}
						/>
					</svg>
				</span>
			)}
			<span className="pr-0.5 whitespace-nowrap">{busy ? 'Opening…' : label}</span>
		</button>
	)
}
