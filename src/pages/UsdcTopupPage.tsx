import { useEffect, useMemo, useState, type KeyboardEvent, type WheelEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { createPublicClient, createWalletClient, custom, http, type Address } from 'viem'
import { base } from 'viem/chains'
import { InstalledInjectedWalletPicker } from '../components/InstalledInjectedWalletPicker'
import { MobileWalletPayPanel } from '../components/MobileWalletPayPanel'
import { UsdcTopupSiteHeader } from '../components/UsdcTopupSiteHeader'
import { WalletAppDappIconButtons } from '../components/WalletAppDappIconButtons'
import {
	isMobileDeviceForWalletApps,
	subscribeInstalledInjectedWallets,
	type Eip1193Provider,
	type InjectedWalletChoice,
} from '../utils/mobileWalletApps'

declare global {
	interface Window {
		ethereum?: Eip1193Provider
	}
}

const BEAMIO_API = 'https://beamio.app'
const BASE_CHAIN_ID_HEX = '0x2105'
const BASE_USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as Address
const BASE_CADD_ADDRESS = '0x16F93eBC5320C89EfC8701577efe49d14A276a06' as Address

type Status =
	| 'idle'
	| 'connecting'
	| 'switching-chain'
	| 'quoting'
	| 'awaiting-signature'
	| 'settling'
	| 'success'
	| 'error'

type QuoteResponse = {
	success?: boolean
	error?: string
	quotedUsdc6?: string
	quotedUsdc?: string
	currency?: string
	amount?: string
	cardOwner?: string
	permitSpender?: string
}

type TopupParams = {
	cardAddress: string
	cardOwner: string
	/** 无 NFC 的 POS 两阶段 QR 可省略；有值时需与 e/c/m 成套 */
	uid: string
	e: string
	c: string
	m: string
	amount: string
	currency: string
	/** POS 轮询 `nfcUsdcChargeSession` 的 UUID v4；与 `pos` 成对出现在 POS 生成的 QR 上 */
	sid: string
	/** POS 终端 admin EOA（与 `sid` 成对）；后端据此走 POS 签 ExecuteForAdmin 闭环 */
	pos: string
	/** 非 admin 消费者 clientTopup（遗留）：USDC 结算到此 EOA；卡内入账由客户端 App 完成 */
	beneficiary: string
	/** Discover 国库桥：卡点 #0 入账目标 Smart Wallet */
	aa: string
	/** Genesis Seat：购买节点数量 */
	qty: number
	workflow: '' | 'clientTopup' | 'treasuryBridge' | 'genesisNodeSeat' | 'walletDeposit'
	paymentToken: 'USDC' | 'CADD'
	/**
	 * Opaque gate for genesisNodeSeat E2E (`test` query). Not shown in UI —
	 * product amount stays on the link; x402 settle uses 1.37 USDC when matched.
	 */
	testCode: string
	/** Evangelist L0 EOA (optional Genesis share attribution). */
	referrerL0: string
}

const truncate = (s: string, head = 6, tail = 4): string =>
	s && s.length > head + tail + 3 ? `${s.slice(0, head)}…${s.slice(-tail)}` : s

const isHex = (s: string, len?: number): boolean =>
	typeof s === 'string' && /^[0-9a-fA-F]+$/.test(s) && (len === undefined || s.length === len)

const isEthAddress = (s: string): boolean => typeof s === 'string' && /^0x[0-9a-fA-F]{40}$/.test(s)

const UUID_V4_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
/** Must match x402sdk `GENESIS_NODE_SEAT_TEST_CODE` — third-party E2E settle 1.37 USDC (code gate; no buyer whitelist) */
const GENESIS_NODE_SEAT_TEST_CODE = '332266'
const GENESIS_NODE_SEAT_TEST_USDC6 = 1_370_000n
const GENESIS_NODE_SEAT_USDC_PER_NODE6 = 1_370_000_000n
const isUuidV4 = (s: string): boolean => typeof s === 'string' && UUID_V4_RE.test(s)

function parseParams(sp: URLSearchParams): { ok: true; params: TopupParams } | { ok: false; error: string } {
	const queryGetCI = (...keys: string[]): string => {
		for (const key of keys) {
			const direct = sp.get(key)
			if (direct !== null) return direct
		}
		const folded = keys.map((k) => k.trim().toLowerCase())
		for (const [k, v] of sp.entries()) {
			if (folded.includes(k.trim().toLowerCase())) return v
		}
		return ''
	}
	const cardAddress = (sp.get('card') ?? '').trim()
	const cardOwner = (sp.get('owner') ?? '').trim()
	const uid = (sp.get('uid') ?? '').trim()
	const e = (sp.get('e') ?? '').trim()
	const c = (sp.get('c') ?? '').trim()
	const m = (sp.get('m') ?? '').trim()
	const amount = (sp.get('amount') ?? '').trim()
	const currency = (sp.get('currency') ?? 'CAD').trim().toUpperCase()
	const tokenRaw = queryGetCI('paymentToken', 'payToken').trim().toUpperCase()
	const paymentToken: 'USDC' | 'CADD' = tokenRaw === 'CADD' || currency === 'CADD' ? 'CADD' : 'USDC'
	const sid = (sp.get('sid') ?? '').trim().toLowerCase()
	const pos = (sp.get('pos') ?? '').trim()
	const beneficiary = (sp.get('beneficiary') ?? '').trim()
	const aa = (queryGetCI('aa', 'recipientAA') || '').trim()
	const qtyRaw = (queryGetCI('qty', 'quantity') || '').trim()
	const testCode = (sp.get('test') ?? '').trim()
	const referrerL0Raw = (queryGetCI('referrerL0', 'referrer') || '').trim()
	const workflowRaw = queryGetCI('workflow').trim().toLowerCase()
	const workflow: '' | 'clientTopup' | 'treasuryBridge' | 'genesisNodeSeat' | 'walletDeposit' =
		workflowRaw === 'treasurybridge'
			? 'treasuryBridge'
			: workflowRaw === 'clienttopup'
				? 'clientTopup'
				: workflowRaw === 'genesisnodeseat'
					? 'genesisNodeSeat'
					: workflowRaw === 'walletdeposit'
						? 'walletDeposit'
						: ''
	if (workflow !== 'walletDeposit') {
		if (!isEthAddress(cardAddress)) return { ok: false, error: 'Missing or invalid `card` (BeamioUserCard address)' }
		if (!isEthAddress(cardOwner)) return { ok: false, error: 'Missing or invalid `owner` (card owner EOA)' }
	}
	if (workflow === 'treasuryBridge') {
		if (!isEthAddress(aa)) {
			return { ok: false, error: 'Missing or invalid `aa` (Smart Wallet) for treasuryBridge workflow' }
		}
		if (sid || pos) {
			return { ok: false, error: 'treasuryBridge links must not include `sid` or `pos` (POS admin workflow)' }
		}
	} else if (workflow === 'clientTopup') {
		if (!isEthAddress(beneficiary)) {
			return { ok: false, error: 'Missing or invalid `beneficiary` (consumer EOA) for clientTopup workflow' }
		}
		if (sid || pos) {
			return { ok: false, error: 'clientTopup links must not include `sid` or `pos` (POS admin workflow)' }
		}
	} else if (workflow === 'genesisNodeSeat') {
		if (!isEthAddress(beneficiary)) {
			return { ok: false, error: 'Missing or invalid `beneficiary` (buyer EOA) for genesisNodeSeat workflow' }
		}
		const qtyNum = Number(qtyRaw)
		if (!Number.isInteger(qtyNum) || qtyNum < 1 || qtyNum > 12000) {
			return { ok: false, error: 'Missing or invalid `qty` (positive integer node count) for genesisNodeSeat' }
		}
		if (sid || pos) {
			return { ok: false, error: 'genesisNodeSeat links must not include `sid` or `pos` (POS admin workflow)' }
		}
		if (currency !== 'USDC' && paymentToken !== 'USDC') {
			return { ok: false, error: 'genesisNodeSeat requires currency/paymentToken USDC' }
		}
		if (testCode && testCode !== GENESIS_NODE_SEAT_TEST_CODE) {
			return { ok: false, error: 'Invalid `test` code for genesisNodeSeat' }
		}
		if (testCode === GENESIS_NODE_SEAT_TEST_CODE && qtyNum !== 1) {
			return { ok: false, error: 'genesisNodeSeat test mode allows qty=1 only' }
		}
		if (referrerL0Raw && !isEthAddress(referrerL0Raw)) {
			return { ok: false, error: 'Invalid `referrerL0` (expect EOA address)' }
		}
	} else if (workflow === 'walletDeposit') {
		if (!isEthAddress(beneficiary)) {
			return { ok: false, error: 'Missing or invalid `beneficiary` (wallet EOA or AA) for walletDeposit workflow' }
		}
		if (sid || pos) {
			return { ok: false, error: 'walletDeposit links must not include `sid` or `pos` (POS admin workflow)' }
		}
		if (currency !== 'USDC' && paymentToken !== 'USDC') {
			return { ok: false, error: 'walletDeposit requires currency/paymentToken USDC' }
		}
	} else {
		if (sid && !isUuidV4(sid)) return { ok: false, error: 'Invalid `sid` (expect UUID v4)' }
		if (sid && !isEthAddress(pos)) return { ok: false, error: 'Missing or invalid `pos` when `sid` is set (POS terminal EOA)' }
		if (!sid && pos && !isEthAddress(pos)) return { ok: false, error: 'Invalid `pos` (expect checksummed EOA)' }
	}
	const hasSidPos = Boolean(sid && isEthAddress(pos))
	const treasuryBridgePath = workflow === 'treasuryBridge' && isEthAddress(aa)
	const clientTopupPath = workflow === 'clientTopup' && isEthAddress(beneficiary)
	const genesisSeatPath = workflow === 'genesisNodeSeat' && isEthAddress(beneficiary)
	const walletDepositPath = workflow === 'walletDeposit' && isEthAddress(beneficiary)
	const genesisQty = genesisSeatPath ? Number(qtyRaw) : 0
	const genesisTestCode =
		genesisSeatPath && testCode === GENESIS_NODE_SEAT_TEST_CODE ? GENESIS_NODE_SEAT_TEST_CODE : ''
	if (!hasSidPos && !clientTopupPath && !treasuryBridgePath && !genesisSeatPath && !walletDepositPath) {
		if (!uid || !isHex(uid, 14)) return { ok: false, error: 'Missing or invalid `uid` (NFC UID, 14 hex chars)' }
		if (!isHex(e, 64)) return { ok: false, error: 'Missing or invalid SUN `e` (64 hex chars)' }
		if (!isHex(c, 6)) return { ok: false, error: 'Missing or invalid SUN `c` (6 hex chars)' }
		if (!isHex(m, 16)) return { ok: false, error: 'Missing or invalid SUN `m` (16 hex chars)' }
	} else {
		if (uid) {
			if (!isHex(uid, 14)) return { ok: false, error: 'Invalid `uid` (expect 14 hex chars)' }
			if (!isHex(e, 64) || !isHex(c, 6) || !isHex(m, 16)) {
				return { ok: false, error: 'When `uid` is present, SUN params `e`, `c`, `m` are required' }
			}
		}
	}
	const amountOk = !!amount && Number(amount) > 0
	if (!amountOk && !walletDepositPath) {
		return { ok: false, error: 'Missing or invalid `amount`' }
	}
	if (!currency) return { ok: false, error: 'Missing `currency`' }
	return {
		ok: true,
		params: {
			cardAddress,
			cardOwner,
			uid: hasSidPos && !uid ? '' : uid,
			e: hasSidPos && !uid ? '' : e,
			c: hasSidPos && !uid ? '' : c,
			m: hasSidPos && !uid ? '' : m,
			amount: walletDepositPath && !amountOk ? '' : amount,
			currency: genesisSeatPath || walletDepositPath ? 'USDC' : currency,
			sid,
			pos: pos && isEthAddress(pos) ? pos : '',
			beneficiary: clientTopupPath || genesisSeatPath || walletDepositPath ? beneficiary : '',
			aa: treasuryBridgePath ? aa : '',
			qty: genesisSeatPath ? genesisQty : 0,
			workflow: treasuryBridgePath
				? 'treasuryBridge'
				: clientTopupPath
					? 'clientTopup'
					: genesisSeatPath
						? 'genesisNodeSeat'
						: walletDepositPath
							? 'walletDeposit'
							: '',
			paymentToken: genesisSeatPath || walletDepositPath ? 'USDC' : paymentToken,
			testCode: genesisTestCode,
			referrerL0: genesisSeatPath && isEthAddress(referrerL0Raw) ? referrerL0Raw : '',
		},
	}
}

function formatCurrencyAmount(amount: string, currency: string): string {
	const n = Number(amount)
	if (!Number.isFinite(n)) return `${currency} ${amount}`
	const decimals = currency === 'JPY' || currency === 'TWD' ? 0 : 2
	return `${currency} ${n.toFixed(decimals)}`
}

function formatUsdc(usdc6OrHuman: string | undefined): string {
	if (!usdc6OrHuman) return '—'
	if (usdc6OrHuman.includes('.')) return `${Number(usdc6OrHuman).toFixed(2)} USDC`
	const n = Number(usdc6OrHuman)
	if (!Number.isFinite(n)) return '— USDC'
	return `${(n / 1_000_000).toFixed(2)} USDC`
}

function decimalToAtomic6(raw: string): string | null {
	const s = String(raw ?? '').trim()
	if (!/^\d+(?:\.\d+)?$/.test(s)) return null
	const [intPart, fracPart = ''] = s.split('.')
	const frac6 = `${fracPart}000000`.slice(0, 6)
	try {
		return (BigInt(intPart) * 1_000_000n + BigInt(frac6)).toString()
	} catch {
		return null
	}
}

function tokenAddressBySymbol(symbol: 'USDC' | 'CADD'): Address {
	return symbol === 'CADD' ? BASE_CADD_ADDRESS : BASE_USDC_ADDRESS
}

async function resolveTokenDomain(symbol: 'USDC' | 'CADD', tokenAddress: Address): Promise<{ name: string; version: string }> {
	if (symbol === 'USDC') return { name: 'USD Coin', version: '2' }
	const pc = createPublicClient({
		chain: base,
		transport: http('https://base-rpc.conet.network'),
	})
	const abi = [
		{ type: 'function', name: 'name', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
		{ type: 'function', name: 'version', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
	] as const
	let name: string = symbol
	let version = '1'
	try {
		const n = await pc.readContract({ address: tokenAddress, abi, functionName: 'name' })
		if (typeof n === 'string' && n.trim()) name = n.trim()
	} catch {
		/* fallback */
	}
	try {
		const v = await pc.readContract({ address: tokenAddress, abi, functionName: 'version' })
		if (typeof v === 'string' && v.trim()) version = v.trim()
	} catch {
		/* fallback */
	}
	return { name, version }
}

function normalizeTo65ByteSignature(signature: string): string | null {
	if (!/^0x[0-9a-fA-F]+$/.test(signature)) return null
	const body = signature.slice(2)
	if (body.length === 130) return `0x${body}`
	if (body.length === 128) {
		const r = body.slice(0, 64)
		const vsHex = body.slice(64)
		let vs: bigint
		try {
			vs = BigInt(`0x${vsHex}`)
		} catch {
			return null
		}
		const highBitMask = 1n << 255n
		const sMask = highBitMask - 1n
		const v = (vs & highBitMask) !== 0n ? 28 : 27
		const s = (vs & sMask).toString(16).padStart(64, '0')
		const vHex = v.toString(16).padStart(2, '0')
		return `0x${r}${s}${vHex}`
	}
	return null
}

function isX402RequirementShapeError(errorMessage: string): boolean {
	return /maxAmountRequired|ZodError/i.test(errorMessage)
}

const NUMERIC_SPINNER_HIDE =
	'[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]'

function preventNumericInputStepKeys(e: KeyboardEvent<HTMLInputElement>): void {
	const blocked = new Set(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'])
	if (blocked.has(e.key)) {
		e.preventDefault()
		e.stopPropagation()
	}
}

function preventNumericInputWheelStep(e: WheelEvent<HTMLInputElement>): void {
	e.preventDefault()
	e.stopPropagation()
}

function normalizeUsdcAmountInput(raw: string): string {
	const n = Number(raw.trim())
	if (!Number.isFinite(n) || n <= 0) return ''
	const fixed = n.toFixed(2)
	return Number(fixed) >= 0.01 ? fixed : ''
}

export default function UsdcTopupPage() {
	const [sp] = useSearchParams()
	const parsed = useMemo(() => parseParams(sp), [sp])
	const [account, setAccount] = useState<Address | null>(null)
	const [chainIdHex, setChainIdHex] = useState<string | null>(null)
	const [quote, setQuote] = useState<QuoteResponse | null>(null)
	const [status, setStatus] = useState<Status>('idle')
	const [error, setError] = useState<string | null>(null)
	const [activeProvider, setActiveProvider] = useState<Eip1193Provider | null>(null)
	const [installedWallets, setInstalledWallets] = useState<InjectedWalletChoice[]>([])
	const [result, setResult] = useState<{
		usdcTx?: string
		topupTx?: string
		settle?: unknown
		/** POS QR：USDC 已结算，挂点mint 由终端 admin 离线签闭环 */
		awaitingPosAuthorization?: boolean
		/** POS 两阶段：仅 USDC 已付，顾客需在终端贴卡完成入账 */
		awaitingBeneficiaryTap?: boolean
	} | null>(null)
	const [depositAmountDraft, setDepositAmountDraft] = useState(
		() => (parsed.ok ? parsed.params.amount : ''),
	)

	const eth = activeProvider ?? (typeof window !== 'undefined' ? window.ethereum : undefined)

	const walletDepositAmount = useMemo(() => {
		if (!parsed.ok || parsed.params.workflow !== 'walletDeposit') {
			return parsed.ok ? parsed.params.amount : ''
		}
		return parsed.params.amount || normalizeUsdcAmountInput(depositAmountDraft)
	}, [parsed, depositAmountDraft])

	useEffect(() => {
		if (!parsed.ok || typeof window === 'undefined') return
		// EIP-6963 + legacy namespaces. Do not call eth_accounts here — probing every
		// injected provider on load opens Phantom/OKX login UIs without user intent.
		return subscribeInstalledInjectedWallets(setInstalledWallets)
	}, [parsed.ok])

	useEffect(() => {
		if (!activeProvider) return
		const onAccounts = (accs: unknown) => {
			const list = accs as string[] | undefined
			setAccount(list && list[0] ? (list[0] as Address) : null)
		}
		const onChain = (chain: unknown) => setChainIdHex(typeof chain === 'string' ? chain : null)
		activeProvider.on?.('accountsChanged', onAccounts as (...args: unknown[]) => void)
		activeProvider.on?.('chainChanged', onChain as (...args: unknown[]) => void)
		return () => {
			activeProvider.removeListener?.('accountsChanged', onAccounts as (...args: unknown[]) => void)
			activeProvider.removeListener?.('chainChanged', onChain as (...args: unknown[]) => void)
		}
	}, [activeProvider])

	useEffect(() => {
		if (!parsed.ok) return
		const { cardAddress, cardOwner, currency, workflow, testCode, beneficiary } = parsed.params
		const amount =
			workflow === 'walletDeposit' ? walletDepositAmount : parsed.params.amount
		if (workflow === 'walletDeposit' && !amount) {
			setQuote(null)
			setStatus((s) => (s === 'quoting' ? 'idle' : s))
			return
		}
		setStatus((s) => (s === 'idle' ? 'quoting' : s))
		// Test gate settles 1.37 USDC; do not quote the product list price (e.g. 1370).
		const quoteAmount =
			workflow === 'genesisNodeSeat' && testCode === GENESIS_NODE_SEAT_TEST_CODE
				? (Number(GENESIS_NODE_SEAT_TEST_USDC6) / 1_000_000).toFixed(2)
				: amount
		const url =
			workflow === 'walletDeposit'
				? `${BEAMIO_API}/api/nfcUsdcTopupQuote?workflow=walletDeposit&beneficiary=${encodeURIComponent(beneficiary)}&amount=${encodeURIComponent(quoteAmount)}&currency=USDC&paymentToken=USDC`
				: `${BEAMIO_API}/api/nfcUsdcTopupQuote?card=${cardAddress}&owner=${cardOwner}&amount=${encodeURIComponent(quoteAmount)}&currency=${currency}`
		let cancelled = false
		fetch(url)
			.then(async (r) => {
				const json = (await r.json().catch(() => ({}))) as QuoteResponse
				if (cancelled) return
				if (!r.ok || json.success === false) {
					setError(json.error ?? 'Failed to fetch quote')
					setStatus((s) => (s === 'quoting' || s === 'idle' ? 'error' : s))
					return
				}
				setQuote(json)
				// Never clobber an in-flight payment or success (mobile wallet return / remount races).
				setStatus((s) => (s === 'quoting' || s === 'idle' ? 'idle' : s))
			})
			.catch((e) => {
				if (cancelled) return
				setError(e?.message ?? String(e))
				setStatus((s) => (s === 'quoting' || s === 'idle' ? 'error' : s))
			})
		return () => {
			cancelled = true
		}
	}, [
		parsed.ok ? parsed.params.cardAddress : '',
		parsed.ok ? parsed.params.cardOwner : '',
		parsed.ok ? parsed.params.amount : '',
		parsed.ok ? parsed.params.currency : '',
		parsed.ok ? parsed.params.workflow : '',
		parsed.ok ? parsed.params.testCode : '',
		parsed.ok ? parsed.params.beneficiary : '',
		walletDepositAmount,
	])

	// Mobile in-app browsers (Base / MetaMask) often suspend the WebView during signing.
	// Re-sync account/chain when the page becomes visible again so we do not drop to a blank shell.
	useEffect(() => {
		if (!eth) return
		const resync = () => {
			void (async () => {
				try {
					const accounts = (await eth.request({ method: 'eth_accounts' })) as string[]
					if (accounts?.[0]) setAccount(accounts[0] as Address)
					const chain = (await eth.request({ method: 'eth_chainId' })) as string
					if (chain) setChainIdHex(chain)
				} catch {
					/* ignore */
				}
			})()
		}
		const onVis = () => {
			if (document.visibilityState === 'visible') resync()
		}
		window.addEventListener('pageshow', resync)
		document.addEventListener('visibilitychange', onVis)
		return () => {
			window.removeEventListener('pageshow', resync)
			document.removeEventListener('visibilitychange', onVis)
		}
	}, [eth])

	const connectWallet = async (choice?: InjectedWalletChoice) => {
		const provider = choice?.provider ?? eth
		if (!provider) return
		setError(null)
		setStatus('connecting')
		setActiveProvider(provider)
		try {
			const accounts = (await provider.request({ method: 'eth_requestAccounts' })) as string[]
			setAccount(accounts[0] as Address)
			const chain = (await provider.request({ method: 'eth_chainId' })) as string
			setChainIdHex(chain)
			setStatus('idle')
		} catch (e: unknown) {
			const err = e as { name?: string; message?: string; cause?: unknown; code?: number | string } | null
			const name = err?.name ?? typeof e
			const msg = err?.message ?? String(e)
			const codeStr = err?.code !== undefined ? ` code=${err.code}` : ''
			const causeStr = err?.cause ? ` cause=${err.cause instanceof Error ? err.cause.message : String(err.cause)}` : ''
			if (isX402RequirementShapeError(msg)) {
				setError(
					`Payment requirement schema mismatch from server (x402 maxAmountRequired). Please retry in a moment.${codeStr}${causeStr}`
				)
				setStatus('error')
				return
			}
			setError(`${name}: ${msg}${codeStr}${causeStr}`)
			setStatus('error')
		}
	}

	const switchToBase = async () => {
		if (!eth) return
		setError(null)
		setStatus('switching-chain')
		try {
			await eth.request({
				method: 'wallet_switchEthereumChain',
				params: [{ chainId: BASE_CHAIN_ID_HEX }],
			})
			setChainIdHex(BASE_CHAIN_ID_HEX)
			setStatus('idle')
		} catch (e: unknown) {
			const err = e as { code?: number; message?: string }
			if (err?.code === 4902) {
				try {
					await eth.request({
						method: 'wallet_addEthereumChain',
						params: [
							{
								chainId: BASE_CHAIN_ID_HEX,
								chainName: 'Base',
								nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
								rpcUrls: ['https://mainnet.base.org'],
								blockExplorerUrls: ['https://basescan.org'],
							},
						],
					})
					setChainIdHex(BASE_CHAIN_ID_HEX)
					setStatus('idle')
					return
				} catch (addErr: unknown) {
					const aMsg = addErr instanceof Error ? addErr.message : String(addErr)
					setError(aMsg)
					setStatus('error')
					return
				}
			}
			setError(err?.message ?? 'Failed to switch chain')
			setStatus('error')
		}
	}

	const payWithUsdc = async () => {
		if (!parsed.ok || !eth || !account) return
		setError(null)
		setStatus('awaiting-signature')
		setResult(null)
		try {
			const walletClient = createWalletClient({
				account,
				chain: base,
				transport: custom(eth),
			})
			if (parsed.params.paymentToken === 'CADD') {
				const effectiveCurrency = (quote?.currency ?? parsed.params.currency ?? '').trim().toUpperCase()
				const caddCadDirect = effectiveCurrency === 'CAD' || effectiveCurrency === 'CADD'
				const value = caddCadDirect
					? (decimalToAtomic6(parsed.params.amount) ?? '')
					: (() => {
						const quoted = quote?.quotedUsdc6?.trim()
						if (quoted && /^\d+$/.test(quoted) && BigInt(quoted) > 0n) return quoted
						const n = Number(quote?.quotedUsdc ?? '')
						return Number.isFinite(n) && n > 0 ? BigInt(Math.round(n * 1_000_000)).toString() : ''
					})()
				if (!value) {
					setError('Missing CADD quote amount.')
					setStatus('error')
					return
				}
				const now = Math.floor(Date.now() / 1000)
				const permitDeadline = (now + 120).toString()
				const tokenAddress = tokenAddressBySymbol('CADD')
				const domain = await resolveTokenDomain('CADD', tokenAddress)
				const spender = (quote?.permitSpender ?? '').trim()
				if (!isEthAddress(spender)) {
					setError('CADD permit spender is missing from quote response.')
					setStatus('error')
					return
				}
				const pc = createPublicClient({
					chain: base,
					transport: http('https://base-rpc.conet.network'),
				})
				const permitNonceOnChain = await pc.readContract({
					address: tokenAddress,
					abi: [{ type: 'function', name: 'nonces', stateMutability: 'view', inputs: [{ name: 'owner', type: 'address' }], outputs: [{ type: 'uint256' }] }] as const,
					functionName: 'nonces',
					args: [account],
				})
				const permitNonce = permitNonceOnChain.toString()
				const signatureRaw = await walletClient.signTypedData({
					account,
					domain: {
						name: domain.name,
						version: domain.version,
						chainId: 8453,
						verifyingContract: tokenAddress,
					},
					types: {
						Permit: [
							{ name: 'owner', type: 'address' },
							{ name: 'spender', type: 'address' },
							{ name: 'value', type: 'uint256' },
							{ name: 'nonce', type: 'uint256' },
							{ name: 'deadline', type: 'uint256' },
						],
					},
					primaryType: 'Permit',
					message: {
						owner: account,
						spender: spender as Address,
						value: BigInt(value),
						nonce: BigInt(permitNonce),
						deadline: BigInt(permitDeadline),
					},
				})
				const signature = normalizeTo65ByteSignature(signatureRaw)
				if (!signature) {
					setError('Wallet returned unsupported signature format.')
					setStatus('error')
					return
				}
				const p = parsed.params
				const bodyObj: Record<string, string> = {
					cardAddress: p.cardAddress,
					cardOwner: p.cardOwner,
					amount: p.amount,
					currency: p.currency,
					paymentToken: 'CADD',
					payer: account,
					value,
					permitDeadline,
					permitNonce,
					signature,
				}
				if (p.workflow === 'treasuryBridge' && p.aa) {
					bodyObj.aa = p.aa
					bodyObj.workflow = 'treasuryBridge'
				} else if (p.workflow === 'genesisNodeSeat' && p.beneficiary) {
					bodyObj.beneficiary = p.beneficiary
					bodyObj.qty = String(p.qty)
					bodyObj.workflow = 'genesisNodeSeat'
					if (p.testCode) bodyObj.test = p.testCode
					if (p.referrerL0) bodyObj.referrerL0 = p.referrerL0
				} else if (p.workflow === 'walletDeposit' && p.beneficiary) {
					bodyObj.beneficiary = p.beneficiary
					bodyObj.workflow = 'walletDeposit'
					delete bodyObj.cardAddress
					delete bodyObj.cardOwner
				} else if (p.workflow === 'clientTopup' && p.beneficiary) {
					bodyObj.beneficiary = p.beneficiary
					bodyObj.workflow = 'clientTopup'
				} else {
					if (p.sid) bodyObj.sid = p.sid
					if (p.pos) bodyObj.pos = p.pos
					if (p.uid) {
						bodyObj.uid = p.uid
						bodyObj.e = p.e
						bodyObj.c = p.c
						bodyObj.m = p.m
					}
				}
				const response = await fetch(`${BEAMIO_API}/api/nfcUsdcTopup`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(bodyObj),
				})
				setStatus('settling')
				const json = (await response.json().catch(() => ({}))) as {
					success?: boolean
					error?: string
					USDC_tx?: string
					executeForAdmin_tx?: string
					claimTx?: string
					awaitingPosAuthorization?: boolean
					awaitingBeneficiaryTap?: boolean
				}
				if (!response.ok || json.success === false) {
					setError(json.error ?? `Topup failed (HTTP ${response.status})`)
					setStatus('error')
					return
				}
				setResult({
					usdcTx: json.USDC_tx,
					topupTx: json.executeForAdmin_tx ?? json.claimTx,
					awaitingPosAuthorization: json.awaitingPosAuthorization === true,
					awaitingBeneficiaryTap: json.awaitingBeneficiaryTap === true,
				})
				setStatus('success')
				return
			}
			const { createPaymentHeader, selectPaymentRequirements } = await import('x402/client')
			const { PaymentRequirementsSchema } = await import('x402/types')
			const { decodeXPaymentResponse } = await import('x402-fetch')
			const p = parsed.params
			const genesisTest = p.workflow === 'genesisNodeSeat' && p.testCode === GENESIS_NODE_SEAT_TEST_CODE
			const payAmount = p.workflow === 'walletDeposit' ? walletDepositAmount : p.amount
			if (p.workflow === 'walletDeposit' && !payAmount) {
				setError('Enter a valid USDC amount greater than 0')
				setStatus('error')
				return
			}
			const amountAtomic6 = decimalToAtomic6(payAmount)
			let x402MaxValue =
				amountAtomic6 && BigInt(amountAtomic6) > 0n ? BigInt(amountAtomic6) : 1_000_000_000n
			if (genesisTest) {
				x402MaxValue = GENESIS_NODE_SEAT_TEST_USDC6
			} else if (p.workflow === 'genesisNodeSeat' && p.qty > 0) {
				const genesisFloor = BigInt(p.qty) * GENESIS_NODE_SEAT_USDC_PER_NODE6
				if (genesisFloor > x402MaxValue) x402MaxValue = genesisFloor
			}
			const bodyObj: Record<string, string> = {
				amount: payAmount,
				currency: p.currency,
			}
			if (p.workflow !== 'walletDeposit') {
				bodyObj.cardAddress = p.cardAddress
				bodyObj.cardOwner = p.cardOwner
			}
			if (p.workflow === 'treasuryBridge' && p.aa) {
				bodyObj.aa = p.aa
				bodyObj.workflow = 'treasuryBridge'
			} else if (p.workflow === 'genesisNodeSeat' && p.beneficiary) {
				bodyObj.beneficiary = p.beneficiary
				bodyObj.qty = String(p.qty)
				bodyObj.workflow = 'genesisNodeSeat'
				if (p.testCode) bodyObj.test = p.testCode
				if (p.referrerL0) bodyObj.referrerL0 = p.referrerL0
			} else if (p.workflow === 'walletDeposit' && p.beneficiary) {
				bodyObj.beneficiary = p.beneficiary
				bodyObj.workflow = 'walletDeposit'
			} else if (p.workflow === 'clientTopup' && p.beneficiary) {
				bodyObj.beneficiary = p.beneficiary
				bodyObj.workflow = 'clientTopup'
			} else {
				if (p.sid) bodyObj.sid = p.sid
				if (p.pos) bodyObj.pos = p.pos
				if (p.uid) {
					bodyObj.uid = p.uid
					bodyObj.e = p.e
					bodyObj.c = p.c
					bodyObj.m = p.m
				}
			}
			const body = JSON.stringify(bodyObj)
			const topupUrl = `${BEAMIO_API}/api/nfcUsdcTopup`
			// Two-phase x402 (not wrapFetchWithPayment): update UI to "settling" right after
			// the wallet returns from signTypedData — critical for Base/MetaMask in-app browsers.
			const firstRes = await fetch(topupUrl, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body,
			})
			if (firstRes.status !== 402) {
				setStatus('settling')
				const json = (await firstRes.json().catch(() => ({}))) as {
					success?: boolean
					error?: string
					USDC_tx?: string
					executeForAdmin_tx?: string
					claimTx?: string
					awaitingPosAuthorization?: boolean
					awaitingBeneficiaryTap?: boolean
				}
				if (!firstRes.ok || json.success === false) {
					setError(json.error ?? `Topup failed (HTTP ${firstRes.status})`)
					setStatus('error')
					return
				}
				setResult({
					usdcTx: json.USDC_tx,
					topupTx: json.executeForAdmin_tx ?? json.claimTx,
					awaitingPosAuthorization: json.awaitingPosAuthorization === true,
					awaitingBeneficiaryTap: json.awaitingBeneficiaryTap === true,
				})
				setStatus('success')
				return
			}
			const challenge = (await firstRes.json()) as { x402Version: number; accepts: unknown[] }
			const parsedReqs = (challenge.accepts ?? []).map((x) => PaymentRequirementsSchema.parse(x))
			const selected = selectPaymentRequirements(parsedReqs, 'base', 'exact')
			if (!selected) {
				setError('No compatible payment requirement from server.')
				setStatus('error')
				return
			}
			if (BigInt(selected.maxAmountRequired) > x402MaxValue) {
				setError('Payment amount exceeds maximum allowed. Hard-refresh this page and try again.')
				setStatus('error')
				return
			}
			const paymentHeader = await createPaymentHeader(
				walletClient as unknown as Parameters<typeof createPaymentHeader>[0],
				challenge.x402Version,
				selected,
			)
			setStatus('settling')
			const response = await fetch(topupUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-PAYMENT': paymentHeader,
					'Access-Control-Expose-Headers': 'X-PAYMENT-RESPONSE',
				},
				body,
			})
			const json = (await response.json().catch(() => ({}))) as {
				success?: boolean
				error?: string
				USDC_tx?: string
				executeForAdmin_tx?: string
				claimTx?: string
				awaitingPosAuthorization?: boolean
				awaitingBeneficiaryTap?: boolean
			}
			let decoded: unknown = null
			try {
				const xPayResp = response.headers.get('x-payment-response')
				decoded = xPayResp ? decodeXPaymentResponse(xPayResp) : null
			} catch {
				decoded = null
			}
			if (!response.ok || json.success === false) {
				setError(json.error ?? `Topup failed (HTTP ${response.status})`)
				setStatus('error')
				return
			}
			setResult({
				usdcTx: json.USDC_tx,
				topupTx: json.executeForAdmin_tx ?? json.claimTx,
				settle: decoded,
				awaitingPosAuthorization: json.awaitingPosAuthorization === true,
				awaitingBeneficiaryTap: json.awaitingBeneficiaryTap === true,
			})
			setStatus('success')
		} catch (e: unknown) {
			const msg = e instanceof Error ? e.message : String(e)
			setError(msg)
			setStatus('error')
		}
	}

	if (!parsed.ok) {
		return (
			<div className="min-h-dvh bg-background text-on-surface antialiased">
				<UsdcTopupSiteHeader />
				<main className="pt-24 pb-12">
					<div className="mx-auto max-w-xl px-6">
						<div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800 dark:border-rose-800/50 dark:bg-rose-950/30 dark:text-rose-200">
							<h2 className="mb-2 text-xl font-bold">Invalid topup link</h2>
							<p className="text-sm leading-relaxed">{parsed.error}</p>
							<p className="mt-4 text-xs opacity-80">
								Expected: <code>card</code>, <code>owner</code>, <code>amount</code>, <code>currency</code>; Discover{' '}
								<code>workflow=treasuryBridge</code> + <code>aa</code>;{' '}
								<code>workflow=genesisNodeSeat</code> + <code>beneficiary</code> + <code>qty</code>; wallet deposit{' '}
								<code>workflow=walletDeposit</code> + <code>beneficiary</code> (no card); POS session{' '}
								<code>sid</code> + admin <code>pos</code>; or legacy <code>workflow=clientTopup</code> +{' '}
								<code>beneficiary</code>. Legacy NFC links need full <code>uid</code>/<code>e</code>/<code>c</code>/
								<code>m</code>.
							</p>
						</div>
					</div>
				</main>
			</div>
		)
	}

	const { cardAddress, cardOwner, uid, amount, currency, sid: topupSid, beneficiary: topupBeneficiary, aa: topupAa, qty: topupQty, workflow: topupWorkflow } =
		parsed.params
	const isTreasuryBridge = topupWorkflow === 'treasuryBridge' && Boolean(topupAa)
	const isClientTopup = topupWorkflow === 'clientTopup' && Boolean(topupBeneficiary)
	const isGenesisSeat = topupWorkflow === 'genesisNodeSeat' && Boolean(topupBeneficiary) && topupQty > 0
	const isWalletDeposit = topupWorkflow === 'walletDeposit' && Boolean(topupBeneficiary)
	const showNfcTagRow = Boolean(uid && uid.length >= 6)
	const onBase = chainIdHex?.toLowerCase() === BASE_CHAIN_ID_HEX
	const hasInjectedWallet = installedWallets.length > 0 || !!eth
	const ready = hasInjectedWallet && !!account && onBase

	const quotedUsdcLabel = formatUsdc(quote?.quotedUsdc ?? quote?.quotedUsdc6).replace(/USDC/g, parsed.params.paymentToken)

	return (
		<div className="min-h-dvh bg-background text-on-surface antialiased">
			<UsdcTopupSiteHeader />
			{(status === 'awaiting-signature' || status === 'settling') && (
				<div
					className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-[#f9f9fe]/95 px-6 text-center backdrop-blur-sm"
					role="status"
					aria-live="polite"
					aria-busy="true"
				>
					<div
						className="h-10 w-10 animate-spin rounded-full border-[3px] border-blue-600/20 border-t-blue-600"
						aria-hidden
					/>
					<p className="text-lg font-bold text-[#1a1c1f]">
						{status === 'awaiting-signature' ? 'Waiting for wallet signature…' : 'Confirming payment…'}
					</p>
					<p className="max-w-sm text-sm text-slate-500">
						{status === 'awaiting-signature'
							? 'Approve the USDC payment in your wallet. This page will update when you return.'
							: 'Settling on Base. Keep this page open.'}
					</p>
				</div>
			)}
			<main className="pt-24 pb-12">
				<div className="mx-auto max-w-xl px-6">
					<header className="mb-8 text-center">
						<h1 className="text-3xl font-extrabold tracking-tight">
							{isWalletDeposit
								? 'Deposit USDC'
								: isGenesisSeat
									? 'Lock Genesis Node Seat'
									: 'Top up your card'}
						</h1>
						<p className="mt-2 text-on-surface-variant">
							Pay with {parsed.params.paymentToken} on Base from your own wallet.
							{isWalletDeposit
								? ' After payment confirms, CoNET-USDC is minted to your wallet via the Base–CoNET treasury bridge.'
								: isGenesisSeat
									? ' After payment confirms, your validator nodes are claimed and deployed automatically.'
									: isTreasuryBridge
										? ' USDC settles to the Beamio treasury; card points credit to your Smart Wallet. The merchant receives CoNET-USDC separately.'
										: isClientTopup
											? ' USDC is sent to the beneficiary wallet; complete the merchant top-up in the Beamio app.'
											: topupSid
												? ' After payment, tap your Beamio card on the merchant terminal to receive the credit.'
												: ' Your NFC card will be credited automatically.'}
						</p>
					</header>

					<section className="rounded-3xl border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
						<div className="grid grid-cols-1 gap-3 text-sm">
							{isWalletDeposit ? (
								<>
									{Number(parsed.params.amount) > 0 ? (
										<Row
											label="Deposit amount"
											value={formatCurrencyAmount(walletDepositAmount || amount, currency)}
											mono={false}
											bold
										/>
									) : (
										<div>
											<label
												htmlFor="wallet-deposit-usdc-amount"
												className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant"
											>
												Deposit amount (USDC)
											</label>
											<input
												id="wallet-deposit-usdc-amount"
												type="number"
												inputMode="decimal"
												autoComplete="off"
												enterKeyHint="done"
												min={0.01}
												step={0.01}
												value={depositAmountDraft}
												onChange={(e) => {
													setDepositAmountDraft(e.target.value)
													if (error) setError(null)
												}}
												onKeyDown={preventNumericInputStepKeys}
												onWheel={preventNumericInputWheelStep}
												placeholder="10.00"
												className={`mt-2 w-full rounded-2xl border border-outline-variant/30 bg-white px-4 py-3 text-base font-semibold text-[#1a1c1f] outline-none focus:ring-2 focus:ring-blue-200 ${NUMERIC_SPINNER_HIDE}`}
											/>
										</div>
									)}
									<Row
										label="You pay"
										value={
											!walletDepositAmount
												? 'Enter amount'
												: status === 'quoting'
													? 'Quoting…'
													: quotedUsdcLabel
										}
										mono
										bold
									/>
									<Divider />
									<Row label="Credit to (CoNET-USDC)" value={truncate(topupBeneficiary, 8, 6)} mono />
								</>
							) : isGenesisSeat ? (
								<>
									<Row
										label="Nodes"
										value={`${topupQty} Genesis Node${topupQty > 1 ? 's' : ''} (Cloud Included)`}
										mono={false}
										bold
									/>
									<Row label="You pay" value={status === 'quoting' ? 'Quoting…' : quotedUsdcLabel} mono bold />
									<Divider />
									<Row label="Buyer (beneficiary)" value={truncate(topupBeneficiary, 8, 6)} mono />
									<Row label="Program card" value={truncate(cardAddress, 8, 6)} mono />
								</>
							) : (
								<>
									<Row label="Top-up amount" value={formatCurrencyAmount(amount, currency)} mono={false} bold />
									<Row label="You pay" value={status === 'quoting' ? 'Quoting…' : quotedUsdcLabel} mono bold />
									<Divider />
									<Row label="Merchant (card owner)" value={truncate(cardOwner, 8, 6)} mono />
									<Row label="BeamioUserCard" value={truncate(cardAddress, 8, 6)} mono />
									{isTreasuryBridge ? (
										<Row label="Smart Wallet (AA)" value={truncate(topupAa, 8, 6)} mono />
									) : isClientTopup ? (
										<Row label="Beneficiary wallet" value={truncate(topupBeneficiary, 8, 6)} mono />
									) : showNfcTagRow ? (
										<Row label="NFC tag" value={`…${uid.slice(-6).toUpperCase()}`} mono />
									) : (
										<Row label="NFC tag" value="After payment — tap card at terminal" mono={false} />
									)}
								</>
							)}
							<Row label="Network" value="Base mainnet" mono={false} />
						</div>
					</section>

					<section className="mt-6">
						{!hasInjectedWallet ? (
							isMobileDeviceForWalletApps() ? (
								<MobileWalletPayPanel />
							) : (
								<NoWalletPanel />
							)
						) : !account ? (
							installedWallets.length > 0 ? (
								<InstalledInjectedWalletPicker
									wallets={installedWallets}
									connecting={status === 'connecting'}
									onSelect={(w) => void connectWallet(w)}
								/>
							) : (
								<button
									type="button"
									onClick={() => void connectWallet()}
									disabled={status === 'connecting'}
									className="w-full rounded-full bg-blue-600 px-8 py-4 text-lg font-bold text-white shadow-lg transition-all hover:bg-blue-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
								>
									{status === 'connecting' ? 'Connecting…' : 'Connect wallet'}
								</button>
							)
						) : !onBase ? (
							<button
								type="button"
								onClick={switchToBase}
								disabled={status === 'switching-chain'}
								className="w-full rounded-full bg-amber-500 px-8 py-4 text-lg font-bold text-white shadow-lg transition-all hover:bg-amber-400 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
							>
								{status === 'switching-chain' ? 'Switching…' : 'Switch to Base'}
							</button>
						) : status === 'success' ? (
							<SuccessPanel
								usdcTx={result?.usdcTx}
								topupTx={result?.topupTx}
								tokenLabel={parsed.params.paymentToken}
								awaitingPosAuthorization={result?.awaitingPosAuthorization}
								awaitingBeneficiaryTap={result?.awaitingBeneficiaryTap}
								treasuryBridge={isTreasuryBridge}
								genesisSeat={isGenesisSeat}
								walletDeposit={isWalletDeposit}
								onDone={() => window.close()}
							/>
						) : (
							<button
								type="button"
								onClick={payWithUsdc}
								disabled={
									status === 'awaiting-signature' ||
									status === 'settling' ||
									status === 'quoting' ||
									!quote ||
									(isWalletDeposit && !walletDepositAmount)
								}
								className="w-full rounded-full bg-blue-600 px-8 py-4 text-lg font-bold text-white shadow-lg transition-all hover:bg-blue-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
							>
								{status === 'awaiting-signature' && 'Waiting for wallet signature…'}
								{status === 'settling' && 'Settling on-chain…'}
								{status === 'quoting' && 'Loading quote…'}
								{(status === 'idle' || status === 'error') && `Pay ${quotedUsdcLabel}`}
							</button>
						)}
						{ready && account ? (
							<p className="mt-3 text-center text-xs text-on-surface-variant">
								Connected as <span className="font-mono">{truncate(account, 6, 4)}</span>
							</p>
						) : null}
						{error ? (
							<div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-800/50 dark:bg-rose-950/30 dark:text-rose-200">
								{error}
							</div>
						) : null}
					</section>
				</div>
			</main>
		</div>
	)
}

function Row({
	label,
	value,
	mono = false,
	bold = false,
}: {
	label: string
	value: string
	mono?: boolean
	bold?: boolean
}) {
	return (
		<div className="flex items-center justify-between gap-4">
			<span className="text-on-surface-variant">{label}</span>
			<span className={`${mono ? 'font-mono' : ''} ${bold ? 'font-bold' : ''} text-on-surface`}>{value}</span>
		</div>
	)
}

function Divider() {
	return <div className="my-1 h-px w-full bg-outline-variant/20" />
}

/** Desktop / laptop only (mobile uses `MobileWalletPayPanel` instead). */
function NoWalletPanel() {
	return (
		<div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900 dark:border-amber-700/50 dark:bg-amber-950/30 dark:text-amber-100">
			<p className="text-sm font-semibold">No browser wallet detected</p>
			<p className="mt-1 text-xs leading-relaxed opacity-90">
				Open this page inside your wallet&apos;s built-in browser to pay with USDC on Base. Tap an icon to open the
				app or store.
			</p>
			<WalletAppDappIconButtons className="mt-5" />
		</div>
	)
}

function SuccessPanel({
	usdcTx,
	topupTx,
	tokenLabel,
	awaitingPosAuthorization,
	awaitingBeneficiaryTap,
	treasuryBridge,
	genesisSeat,
	walletDeposit,
	onDone,
}: {
	usdcTx?: string
	topupTx?: string
	tokenLabel: string
	awaitingPosAuthorization?: boolean
	awaitingBeneficiaryTap?: boolean
	treasuryBridge?: boolean
	genesisSeat?: boolean
	walletDeposit?: boolean
	onDone: () => void
}) {
	return (
		<div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-900 dark:border-emerald-800/50 dark:bg-emerald-950/30 dark:text-emerald-100">
			<p className="text-lg font-bold">Payment confirmed</p>
			<p className="mt-1 text-sm opacity-90">
				{walletDeposit
					? `${tokenLabel} settled. CoNET-USDC is being minted to your wallet via the Base–CoNET treasury bridge. Check Wallet shortly.`
					: genesisSeat
						? `${tokenLabel} settled. Your Genesis nodes are being claimed and deployed — check CoNET Mining / Wallet shortly.`
						: treasuryBridge
							? `${tokenLabel} settled to the Beamio treasury. Card points are crediting to your Smart Wallet. The merchant receives CoNET-USDC separately.`
							: awaitingBeneficiaryTap
								? `Your ${tokenLabel} payment is complete. Tap your Beamio card on the merchant terminal to finish top-up.`
								: awaitingPosAuthorization
									? `Your ${tokenLabel} payment is complete. The merchant terminal will finalize crediting your card in a moment.`
									: `${tokenLabel} transferred and your NFC card will be topped up shortly.`}
			</p>
			<div className="mt-4 grid gap-2 text-xs">
				{usdcTx ? (
					<a
						href={`https://basescan.org/tx/${usdcTx}`}
						target="_blank"
						rel="noopener noreferrer"
						className="font-mono underline hover:opacity-80"
					>
						{tokenLabel} tx: {truncate(usdcTx, 10, 8)}
					</a>
				) : null}
				{topupTx && !walletDeposit ? (
					<a
						href={`https://basescan.org/tx/${topupTx}`}
						target="_blank"
						rel="noopener noreferrer"
						className="font-mono underline hover:opacity-80"
					>
						NFC topup tx: {truncate(topupTx, 10, 8)}
					</a>
				) : null}
			</div>
			<button
				type="button"
				onClick={onDone}
				className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-emerald-500 active:scale-95"
			>
				Done
			</button>
		</div>
	)
}
