import type { InjectedWalletChoice, InjectedWalletChoiceId } from '../utils/mobileWalletApps'

function iconSrc(file: string): string {
	const base = process.env.PUBLIC_URL || ''
	const root = base.endsWith('/') ? base : `${base}/`
	return `${root}assets/wallets/${file}`
}

function walletIconFile(id: InjectedWalletChoiceId): string | null {
	switch (id) {
		case 'metamask':
			return 'metamask.png'
		case 'base':
			return 'base.png'
		case 'okx':
			return 'okx.png'
		case 'tp':
			return 'tokenpocket.png'
		default:
			return null
	}
}

type Props = {
	wallets: InjectedWalletChoice[]
	connecting: boolean
	onSelect: (wallet: InjectedWalletChoice) => void
	className?: string
}

/**
 * Desktop / injected-provider picker: list wallets already present in this browser
 * before calling eth_requestAccounts on the chosen EIP-1193 provider.
 */
export function InstalledInjectedWalletPicker({ wallets, connecting, onSelect, className = '' }: Props) {
	if (wallets.length === 0) return null

	return (
		<div
			className={`rounded-3xl border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] ${className}`.trim()}
		>
			<h2 className="text-lg font-bold text-on-surface">Choose a wallet</h2>
			<p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
				Select an installed Web3 wallet to connect. You will approve the connection in that wallet next.
			</p>
			<ul className="mt-5 flex flex-col gap-3">
				{wallets.map((w) => {
					const file = walletIconFile(w.id)
					const key = `${w.id}-${w.label}`
					return (
						<li key={key}>
							<button
								type="button"
								disabled={connecting}
								onClick={() => onSelect(w)}
								className="flex w-full items-center gap-3 rounded-2xl border border-outline-variant/30 bg-white px-4 py-3 text-left shadow-sm transition-all hover:border-blue-300 hover:bg-slate-50 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-900 dark:hover:bg-slate-800"
								aria-label={`Connect ${w.label}`}
							>
								{file ? (
									<img
										src={iconSrc(file)}
										alt=""
										className="h-10 w-10 shrink-0 rounded-xl object-contain"
										width={40}
										height={40}
										decoding="async"
									/>
								) : (
									<span
										className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-200"
										aria-hidden
									>
										{w.label.slice(0, 1).toUpperCase()}
									</span>
								)}
								<span className="min-w-0 flex-1">
									<span className="block text-[15px] font-semibold text-on-surface">{w.label}</span>
									<span className="mt-0.5 block text-xs text-on-surface-variant">
										{connecting ? 'Connecting…' : 'Installed in this browser'}
									</span>
								</span>
								<span className="shrink-0 text-sm font-semibold text-blue-600">Connect</span>
							</button>
						</li>
					)
				})}
			</ul>
		</div>
	)
}
