import { useCallback, useEffect, useRef, useState } from 'react'
import {
	prepareVisitWalletForOpenClaim,
	provisionWebShareVisitWallet,
} from '../utils/beamioWebShareWallet'

const AA_READY_POLL_MS = 1500

/**
 * Gate open-claim Claim until the visit/temp wallet CoNET AA has bytecode.
 * Polls with a setTimeout chain; when AA becomes ready, `visitAaReady` flips true
 * automatically (no page refresh required).
 */
export function useVisitWalletAaReady(enabled: boolean) {
	const [visitAaReady, setVisitAaReady] = useState(false)
	const [retryEpoch, setRetryEpoch] = useState(0)
	const walletBlobRef = useRef<Awaited<ReturnType<typeof provisionWebShareVisitWallet>>>(null)
	const readyRef = useRef(false)

	useEffect(() => {
		readyRef.current = visitAaReady
	}, [visitAaReady])

	useEffect(() => {
		if (!enabled) {
			setVisitAaReady(false)
			return
		}

		let cancelled = false
		let timer: ReturnType<typeof setTimeout> | undefined

		const scheduleNext = () => {
			if (cancelled) return
			timer = setTimeout(() => {
				void tick()
			}, AA_READY_POLL_MS)
		}

		const tick = async () => {
			if (cancelled) return
			try {
				const prepared = await prepareVisitWalletForOpenClaim(walletBlobRef.current)
				if (cancelled) return
				if (prepared) {
					walletBlobRef.current = prepared.blob
					setVisitAaReady(true)
					return
				}
				if (readyRef.current) setVisitAaReady(false)
			} catch (err) {
				console.warn('[useVisitWalletAaReady] prepare failed; will retry:', err)
				if (readyRef.current) setVisitAaReady(false)
			}
			scheduleNext()
		}

		void tick()
		return () => {
			cancelled = true
			if (timer !== undefined) clearTimeout(timer)
		}
	}, [enabled, retryEpoch])

	/** Resume AA prep polling after a claim-time miss (UI stays on loading until ready). */
	const requestAaRetry = useCallback(() => {
		setVisitAaReady(false)
		setRetryEpoch((n) => n + 1)
	}, [])

	return { visitAaReady, walletBlobRef, requestAaRetry }
}
