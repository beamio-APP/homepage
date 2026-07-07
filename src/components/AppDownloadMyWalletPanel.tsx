import React, { useCallback, useEffect, useState } from 'react'
import { Check, Copy, ExternalLink, Hexagon, Wallet, X } from 'lucide-react'
import { beamioWalletAccent, type BeamioWalletKind } from '../utils/beamioWalletAccent'
import { fetchUsdcBalanceOnBase } from '../utils/beamioUsdcBalance'
import type { AppDownloadVisitWalletProfile } from '../utils/beamioWebShareWallet'
import { refreshVisitWalletAaProfile } from '../utils/beamioWebShareWallet'

const fmtAddr = (a = '') => (a ? `${a.slice(0, 6)}…${a.slice(-4)}` : '—')
const basescanAddressUrl = (address: string) => `https://basescan.org/address/${address}`

function formatUsdcBalance(value: number | string | null): string {
	if (value == null || !Number.isFinite(Number(value))) return '—'
	const n = Math.max(0, Number(value) || 0)
	return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function buildCreatedAtLabel(createdAt: number | null): string {
	if (createdAt == null || !Number.isFinite(createdAt) || createdAt <= 0) return ''
	try {
		return new Date(createdAt).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		})
	} catch {
		return ''
	}
}

function ProfileWalletAddressCopy({
	address,
	actionIconClass,
}: {
	address: string
	actionIconClass: string
}) {
	const [copied, setCopied] = useState(false)

	const handleCopy = useCallback(async () => {
		if (!address || address.length < 10) return
		try {
			await navigator.clipboard.writeText(address)
			setCopied(true)
			window.setTimeout(() => setCopied(false), 2000)
		} catch {
			/* ignore */
		}
	}, [address])

	return (
		<button
			type="button"
			onClick={handleCopy}
			className={`inline-flex shrink-0 items-center justify-center active:opacity-70 ${actionIconClass}`}
			aria-label="Copy address"
			title="Copy address"
		>
			{copied ? (
				<Check className="h-3.5 w-3.5 text-emerald-500" strokeWidth={2.25} />
			) : (
				<Copy className="h-3.5 w-3.5" strokeWidth={2.25} />
			)}
		</button>
	)
}

function ProfileWalletBaseScanButton({
	address,
	actionIconClass,
}: {
	address: string
	actionIconClass: string
}) {
	return (
		<a
			href={basescanAddressUrl(address)}
			target="_blank"
			rel="noopener noreferrer"
			className={`inline-flex shrink-0 items-center justify-center active:opacity-70 ${actionIconClass}`}
			aria-label="View on BaseScan"
			title="View on BaseScan"
		>
			<ExternalLink className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
		</a>
	)
}

function ProfileWalletPanelCard({
	kind,
	address,
	balanceUsdc,
}: {
	kind: BeamioWalletKind
	address: string
	balanceUsdc: number | null
}) {
	const accent = beamioWalletAccent(kind)
	const title = kind === 'aa' ? 'Smart Wallet' : 'Wallet'
	const kindBadge = kind === 'aa' ? 'AA' : 'EOA'
	const hasAddress = Boolean(address && address.length >= 10)

	return (
		<div
			className="rounded-[22px] border bg-white px-5 py-4 shadow-[0_14px_40px_rgba(15,23,42,0.08)]"
			style={{ borderColor: accent.border }}
		>
			<div className="flex items-start gap-3">
				<div
					className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white ${accent.iconBgClass} ${accent.iconShadowClass}`}
				>
					{kind === 'aa' ? (
						<Hexagon className="h-5 w-5" strokeWidth={2.25} aria-hidden />
					) : (
						<Wallet className="h-5 w-5" strokeWidth={2.25} aria-hidden />
					)}
				</div>

				<div className="min-w-0 flex-1">
					<div className="flex items-start justify-between gap-2">
						<div className="min-w-0">
							<div className="text-[17px] font-bold leading-tight text-slate-900">{title}</div>
							<div className="mt-1 flex min-w-0 items-center gap-1.5">
								<span className="truncate font-mono text-[13px] text-slate-500">
									{hasAddress ? fmtAddr(address) : kind === 'aa' ? 'AA unavailable' : 'EOA unavailable'}
								</span>
								{hasAddress ? (
									<>
										<ProfileWalletAddressCopy address={address} actionIconClass={accent.actionIconClass} />
										<ProfileWalletBaseScanButton address={address} actionIconClass={accent.actionIconClass} />
									</>
								) : null}
							</div>
						</div>
						<span
							className={`shrink-0 rounded-md border px-2 py-0.5 text-[11px] font-bold ${accent.badgeBorderClass} ${accent.badgeBgClass} ${accent.badgeTextClass}`}
						>
							{kindBadge}
						</span>
					</div>
				</div>
			</div>

			<div className="mt-4 border-t border-slate-100 pt-3">
				<div className="text-[11px] font-medium text-slate-400">Balance</div>
				<div className="mt-0.5 text-[22px] font-extrabold leading-tight tracking-tight text-slate-900">
					{formatUsdcBalance(balanceUsdc)}{' '}
					<span className="text-[17px] font-bold text-slate-900">USDC</span>
				</div>
			</div>
		</div>
	)
}

type AppDownloadMyWalletPanelProps = {
	profile: AppDownloadVisitWalletProfile
	onClose: () => void
	openInAppUrl?: string
	onProfileRefresh?: (profile: AppDownloadVisitWalletProfile) => void
}

/** Simplified SilentPassUI `/myWallet` profile for app-download share landing. */
export default function AppDownloadMyWalletPanel({
	profile,
	onClose,
	openInAppUrl,
	onProfileRefresh,
}: AppDownloadMyWalletPanelProps) {
	const [copiedUsername, setCopiedUsername] = useState(false)
	const [eoaBalanceUsdc, setEoaBalanceUsdc] = useState<number | null>(null)
	const [aaBalanceUsdc, setAaBalanceUsdc] = useState<number | null>(null)
	const [aaAddress, setAaAddress] = useState(profile.aaAddress)

	useEffect(() => {
		setAaAddress(profile.aaAddress)
	}, [profile.aaAddress])

	useEffect(() => {
		if (aaAddress) return
		let cancelled = false
		void refreshVisitWalletAaProfile(profile).then((next) => {
			if (cancelled) return
			if (next.aaAddress) {
				setAaAddress(next.aaAddress)
				onProfileRefresh?.(next)
			}
		})
		return () => {
			cancelled = true
		}
	}, [aaAddress, onProfileRefresh, profile.eoaAddress])

	useEffect(() => {
		let cancelled = false
		void (async () => {
			const eoaBal = await fetchUsdcBalanceOnBase(profile.eoaAddress)
			if (!cancelled && eoaBal != null) setEoaBalanceUsdc(eoaBal)
			if (aaAddress) {
				const aaBal = await fetchUsdcBalanceOnBase(aaAddress)
				if (!cancelled && aaBal != null) setAaBalanceUsdc(aaBal)
			}
		})()
		return () => {
			cancelled = true
		}
	}, [aaAddress, profile.eoaAddress])

	const handleCopyUsername = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(profile.tagLabel)
			setCopiedUsername(true)
			window.setTimeout(() => setCopiedUsername(false), 2000)
		} catch {
			/* ignore */
		}
	}, [profile.tagLabel])

	const sinceLabel = buildCreatedAtLabel(profile.createdAt)

	return (
		<div className="fixed inset-0 z-[100] overflow-y-auto overscroll-y-contain bg-white text-slate-900">
			<div className="relative w-full">
				<div className="fixed left-0 right-0 top-0 z-0 h-[env(safe-area-inset-top)] bg-gradient-to-r from-sky-500 to-blue-600" />

				<div className="relative z-10 rounded-b-[28px] bg-gradient-to-r from-sky-500 to-blue-600 px-5 pb-10 pt-[calc(env(safe-area-inset-top)+12px)] text-white shadow-[0_8px_24px_rgba(15,23,42,0.35)]">
					<div className="-mx-5 flex items-start justify-between gap-3 px-5 min-w-0">
						<button
							type="button"
							tabIndex={-1}
							onClick={onClose}
							aria-label="Close"
							className="mt-2 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/40 bg-white/20 text-white/80 shadow-[0_1px_3px_rgba(0,0,0,0.12)] backdrop-blur-md transition active:scale-[0.96] hover:bg-white/30"
						>
							<X className="h-[17px] w-[17px] stroke-[2.5]" aria-hidden />
						</button>
					</div>

					<div className="flex flex-col items-center text-center">
						<div className="mr-2 flex-shrink-0">
							<img
								src={profile.avatarSrc}
								alt=""
								className="h-20 w-20 rounded-full object-cover"
								draggable={false}
							/>
						</div>

						<div className="mt-4 flex flex-col items-center gap-1">
							<div className="flex items-center gap-3 rounded-full px-5 py-1">
								<span className="flex items-center text-[18px] font-semibold leading-none tracking-tight text-white">
									{profile.tagLabel}
								</span>
								<button
									type="button"
									onClick={() => void handleCopyUsername()}
									className="flex h-6 w-6 items-center justify-center rounded-full bg-black/20 leading-none backdrop-blur-sm"
									aria-label="Copy Beamio tag"
								>
									{copiedUsername ? (
										<Check className="block h-4 w-4 text-emerald-400" />
									) : (
										<Copy className="block h-3.5 w-3.5 text-white/95" />
									)}
								</button>
							</div>

							{profile.displayName && profile.displayName !== profile.accountName ? (
								<span className="flex items-center text-[16px] font-semibold leading-none tracking-tight text-white">
									{profile.displayName}
									{sinceLabel ? ` since ${sinceLabel}` : ''}
								</span>
							) : sinceLabel ? (
								<span className="flex items-center text-[16px] font-semibold leading-none tracking-tight text-white">
									Member since {sinceLabel}
								</span>
							) : null}
						</div>
					</div>
				</div>
			</div>

			<div className="relative z-10 -mt-5 px-4 pb-10">
				<div className="mb-5 flex flex-col gap-4">
					<ProfileWalletPanelCard
						kind="aa"
						address={aaAddress}
						balanceUsdc={aaBalanceUsdc}
					/>
					<ProfileWalletPanelCard
						kind="eoa"
						address={profile.eoaAddress}
						balanceUsdc={eoaBalanceUsdc}
					/>
				</div>

				{openInAppUrl ? (
					<a
						href={openInAppUrl}
						className="inline-flex w-full items-center justify-center rounded-2xl bg-[#1562f0] px-4 py-3.5 text-[15px] font-semibold text-white shadow-md transition-colors hover:bg-[#1250c4]"
					>
						Open in Beamio App
					</a>
				) : null}
			</div>
		</div>
	)
}
