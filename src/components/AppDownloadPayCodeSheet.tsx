import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, ShieldCheck, X } from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'
import { ethers } from 'ethers'
import { BEAMIO_BRAND_LOGO_SRC } from './BeamioBrandLogo'
import {
	encodeOpenContainerRelayQrPayload,
	formatPayRelayCountdown,
	PAY_RELAY_QR_TTL_SECONDS,
	readContainerNonceFromAAStorage,
	signOpenContainerPayQrOnConet,
	conetPayQrProvider,
	type OpenContainerRelayPayload,
} from '../utils/openContainerPayQr'
import {
	provisionWebShareVisitWallet,
	resolveSigningWalletFromBlob,
	refreshVisitWalletAaProfile,
	type AppDownloadVisitWalletProfile,
} from '../utils/beamioWebShareWallet'

type AppDownloadPayCodeSheetProps = {
	isOpen: boolean
	onClose: () => void
	profile: AppDownloadVisitWalletProfile | null
	onProfileRefresh?: (profile: AppDownloadVisitWalletProfile) => void
}

export default function AppDownloadPayCodeSheet({
	isOpen,
	onClose,
	profile,
	onProfileRefresh,
}: AppDownloadPayCodeSheetProps) {
	const [payRelayQRPayload, setPayRelayQRPayload] = useState<OpenContainerRelayPayload | null>(null)
	const [payRelayQRLoading, setPayRelayQRLoading] = useState(false)
	const [payRelaySecondsLeft, setPayRelaySecondsLeft] = useState(0)
	const [paySheetQrSize, setPaySheetQrSize] = useState(256)
	const [signError, setSignError] = useState<string | null>(null)

	const payRelayDeadlineUnix = useMemo(() => {
		if (!payRelayQRPayload?.deadline) return NaN
		const n = parseInt(String(payRelayQRPayload.deadline), 10)
		return Number.isFinite(n) ? n : NaN
	}, [payRelayQRPayload])

	const payQrDisplayValue = useMemo(
		() => (payRelayQRPayload ? encodeOpenContainerRelayQrPayload(payRelayQRPayload) : ''),
		[payRelayQRPayload],
	)

	const handleClose = useCallback(() => {
		setPayRelayQRPayload(null)
		setPayRelayQRLoading(false)
		setPayRelaySecondsLeft(0)
		setSignError(null)
		onClose()
	}, [onClose])

	useEffect(() => {
		if (!isOpen) return
		const prev = document.body.style.overflow
		document.body.style.overflow = 'hidden'
		return () => {
			document.body.style.overflow = prev
		}
	}, [isOpen])

	useEffect(() => {
		if (!isOpen || !Number.isFinite(payRelayDeadlineUnix)) {
			setPayRelaySecondsLeft(0)
			return
		}
		let cancelled = false
		let timer: number | undefined
		const tick = () => {
			if (cancelled) return
			setPayRelaySecondsLeft(Math.max(0, payRelayDeadlineUnix - Math.floor(Date.now() / 1000)))
			timer = window.setTimeout(tick, 1000) as unknown as number
		}
		tick()
		return () => {
			cancelled = true
			if (timer !== undefined) window.clearTimeout(timer)
		}
	}, [isOpen, payRelayDeadlineUnix])

	useEffect(() => {
		if (!isOpen) return
		const compute = () => {
			const vh = window.innerHeight
			const vw = window.innerWidth
			const reserved = 52 + 156 + 100 + 20 + 40
			const maxByH = Math.floor(vh - reserved)
			const maxByW = vw - 64
			let s = Math.min(256, maxByH, maxByW - 48)
			s = Math.max(152, Math.round(s / 8) * 8)
			setPaySheetQrSize((prev) => (Math.abs(prev - s) < 4 ? prev : s))
		}
		const onResize = () => requestAnimationFrame(compute)
		onResize()
		window.addEventListener('resize', onResize)
		return () => window.removeEventListener('resize', onResize)
	}, [isOpen])

	useEffect(() => {
		if (!isOpen) {
			setPayRelayQRPayload(null)
			setPayRelayQRLoading(false)
			setSignError(null)
			return
		}

		let cancelled = false

		void (async () => {
			setPayRelayQRLoading(true)
			setPayRelayQRPayload(null)
			setSignError(null)
			try {
				const blob = await provisionWebShareVisitWallet()
				const wallet = resolveSigningWalletFromBlob(blob)
				if (!wallet) {
					setSignError('Wallet unavailable. Refresh and try again.')
					return
				}

				let hydratedProfile = profile
				if (hydratedProfile && !hydratedProfile.aaAddress) {
					hydratedProfile = await refreshVisitWalletAaProfile(hydratedProfile)
					if (hydratedProfile.aaAddress) onProfileRefresh?.(hydratedProfile)
				}

				const pk = wallet.signingKey.privateKey
				const aaAccount = hydratedProfile?.aaAddress?.trim() || blob?.profiles?.[0]?.aaAccount?.trim()
				const payload = await signOpenContainerPayQrOnConet(
					{ privateKeyArmor: pk, aaAccount: aaAccount || undefined },
					{ deadlineSeconds: PAY_RELAY_QR_TTL_SECONDS },
				)
				if (!cancelled) setPayRelayQRPayload(payload)
			} catch (e) {
				console.error('[AppDownloadPayCodeSheet] sign pay QR failed:', e)
				if (!cancelled) {
					setSignError(e instanceof Error ? e.message : 'Could not generate pay code.')
				}
			} finally {
				if (!cancelled) setPayRelayQRLoading(false)
			}
		})()

		return () => {
			cancelled = true
			setPayRelayQRPayload(null)
			setPayRelayQRLoading(false)
		}
	}, [isOpen, onProfileRefresh, profile])

	useEffect(() => {
		if (!isOpen || !payRelayQRPayload) return

		const aaAccount = payRelayQRPayload.account
		if (!aaAccount || !ethers.isAddress(aaAccount) || !payRelayQRPayload.nonce) return

		let signedNonce: bigint
		try {
			signedNonce = BigInt(payRelayQRPayload.nonce)
		} catch {
			return
		}

		let cancelled = false
		let timer: ReturnType<typeof setTimeout> | undefined
		const POLL_MS = 4000

		const poll = async () => {
			if (cancelled) return
			try {
				const storedNonce = await readContainerNonceFromAAStorage(
					conetPayQrProvider(),
					aaAccount,
					'openRelayed',
				)
				if (cancelled) return
				if (storedNonce > signedNonce) {
					handleClose()
					return
				}
			} catch (e) {
				console.warn('[AppDownloadPayCodeSheet] openRelay nonce poll failed:', e)
			}
			if (!cancelled) {
				timer = setTimeout(() => {
					void poll()
				}, POLL_MS)
			}
		}

		void poll()

		return () => {
			cancelled = true
			if (timer !== undefined) clearTimeout(timer)
		}
	}, [handleClose, isOpen, payRelayQRPayload])

	const logoSize = Math.min(64, Math.max(44, Math.round((64 * paySheetQrSize) / 256)))
	const logoRadius = Math.min(18, Math.max(12, Math.round((18 * paySheetQrSize) / 256)))
	const logoInnerRadius = Math.min(14, Math.max(10, Math.round((14 * paySheetQrSize) / 256)))

	return (
		<AnimatePresence>
			{isOpen ? (
				<>
					<motion.button
						type="button"
						className="fixed inset-0 z-[110] bg-black/40"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						aria-label="Close pay code"
						onClick={handleClose}
					/>
					<motion.div
						role="dialog"
						aria-modal="true"
						aria-label="Scan to Pay"
						className="fixed bottom-0 left-0 right-0 z-[111] flex max-h-[92dvh] flex-col items-center overflow-hidden overscroll-contain rounded-t-xl bg-[#f3f4f5] pb-[calc(env(safe-area-inset-bottom)+1.5rem)] shadow-[0_-20px_60px_rgba(0,0,0,0.1)]"
						initial={{ y: '100%' }}
						animate={{ y: 0 }}
						exit={{ y: '100%' }}
						transition={{ type: 'spring', damping: 32, stiffness: 320 }}
						onClick={(e) => e.stopPropagation()}
					>
						<div className="flex w-full shrink-0 items-center justify-between px-4 pb-2 pt-3">
							<span className="w-10 shrink-0" aria-hidden />
							<div className="h-1.5 w-12 shrink-0 rounded-full bg-[#e1e3e4]" />
							<button
								type="button"
								onClick={handleClose}
								className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-500 transition-colors active:bg-gray-100"
								aria-label="Close"
							>
								<X className="h-5 w-5 text-[#191c1d]" aria-hidden />
							</button>
						</div>

						<div className="mx-auto w-full max-w-lg shrink-0 overflow-hidden overscroll-none px-6 pb-4">
							<div className="mx-auto flex w-full max-w-md flex-col gap-4 px-0 pb-2 pt-0 sm:px-2">
								<div className="shrink-0 space-y-2 text-center">
									<h2 className="text-2xl font-extrabold tracking-tight text-[#191c1d]">Scan to Pay</h2>
									<p className="mx-auto max-w-[280px] text-sm leading-snug text-[#424655]">
										Position the QR code within the frame to authorize the transaction.
									</p>
								</div>

								<div className="relative flex shrink-0 flex-col items-center py-2">
									{payRelayQRLoading && !payRelayQRPayload ? (
										<div className="flex flex-col items-center gap-3 py-8">
											<Loader2 className="h-12 w-12 animate-spin text-[#1562f0]" aria-hidden />
											<span className="text-sm text-[#424655]">Generating pay code…</span>
										</div>
									) : null}
									{!payRelayQRLoading && !payRelayQRPayload ? (
										<p className="max-w-sm px-4 text-center text-sm text-amber-600">
											{signError || 'Could not generate pay code. Close and try again.'}
										</p>
									) : null}
									{payRelayQRPayload && payQrDisplayValue ? (
										<div className="relative shrink-0">
											<div
												aria-hidden
												className="absolute -left-4 -top-4 h-12 w-12 rounded-tl-xl border-l-4 border-t-4 border-[#1562f0] opacity-20"
											/>
											<div
												aria-hidden
												className="absolute -right-4 -top-4 h-12 w-12 rounded-tr-xl border-r-4 border-t-4 border-[#1562f0] opacity-20"
											/>
											<div
												aria-hidden
												className="absolute -bottom-4 -left-4 h-12 w-12 rounded-bl-xl border-b-4 border-l-4 border-[#1562f0] opacity-20"
											/>
											<div
												aria-hidden
												className="absolute -bottom-4 -right-4 h-12 w-12 rounded-br-xl border-b-4 border-r-4 border-[#1562f0] opacity-20"
											/>
											<div className="rounded-xl bg-gradient-to-br from-[#1562f0] to-[#004bc3] p-2 shadow-xl min-[400px]:p-3">
												<div className="rounded-lg border border-[#e1e3e4] bg-white p-2 shadow-xl min-[400px]:p-4">
													<div
														className="relative flex items-center justify-center"
														style={{ width: paySheetQrSize, height: paySheetQrSize }}
													>
														<QRCodeCanvas
															value={payQrDisplayValue}
															size={paySheetQrSize}
															level="M"
															includeMargin={false}
															bgColor="#ffffff"
															fgColor="#000000"
															className="block rounded-sm"
														/>
														<div
															className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-white shadow-[0_4px_14px_rgba(0,0,0,0.12)]"
															style={{
																width: logoSize,
																height: logoSize,
																borderRadius: logoRadius,
																padding: Math.min(6, Math.max(4, Math.round((6 * paySheetQrSize) / 256))),
															}}
														>
															<img
																src={BEAMIO_BRAND_LOGO_SRC}
																alt="Beamio"
																className="h-full w-full object-contain"
																style={{ borderRadius: logoInnerRadius }}
																draggable={false}
															/>
														</div>
														{payRelaySecondsLeft <= 0 ? (
															<div
																className="absolute inset-0 flex items-center justify-center rounded-sm bg-white/90 backdrop-blur-sm"
																aria-label="Pay code expired"
															>
																<span className="text-lg font-bold text-slate-800">Expired</span>
															</div>
														) : null}
													</div>
												</div>
											</div>
										</div>
									) : null}
								</div>

								{payRelayQRPayload ? (
									<div className="mx-auto w-full max-w-xs shrink-0 pb-1 min-[400px]:pb-2">
										<div className="space-y-3">
											<div className="flex items-end justify-between">
												<div className="flex min-w-0 items-center gap-2">
													<ShieldCheck className="h-4 w-4 shrink-0 text-[#1562f0]" strokeWidth={2.5} aria-hidden />
													<span className="text-[10px] font-bold uppercase tracking-widest text-[#1562f0]">
														Secure Dynamic Key
													</span>
												</div>
												<span className="shrink-0 font-mono text-[10px] text-[#424655]">
													{formatPayRelayCountdown(payRelaySecondsLeft)}
												</span>
											</div>
											<div className="h-1.5 w-full overflow-hidden rounded-full bg-[#edeeef]">
												<div
													className="h-full rounded-full bg-[#004bc3] shadow-[0_0_8px_rgba(0,75,195,0.4)] transition-[width] duration-300 ease-out"
													style={{
														width: `${Math.min(100, Math.max(0, (payRelaySecondsLeft / PAY_RELAY_QR_TTL_SECONDS) * 100))}%`,
													}}
												/>
											</div>
										</div>
									</div>
								) : null}
							</div>
						</div>
					</motion.div>
				</>
			) : null}
		</AnimatePresence>
	)
}
