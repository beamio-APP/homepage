import { ethers } from 'ethers'

const BASE_RPC = 'https://base-rpc.conet.network'
const BASE_USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
const ERC20_ABI = ['function balanceOf(address) view returns (uint256)'] as const
const BALANCE_OF_SELECTOR = '0x70a08231'

function parseUsdc6(raw: unknown): number | null {
	try {
		const n = Number(ethers.formatUnits(BigInt(String(raw)), 6))
		return Number.isFinite(n) && n >= 0 ? n : null
	} catch {
		return null
	}
}

/** Trusted success only — failure returns null (caller keeps previous). */
export async function fetchUsdcBalanceOnBase(address: string): Promise<number | null> {
	let addr: string
	try {
		addr = ethers.getAddress(String(address ?? '').trim())
	} catch {
		return null
	}
	const provider = new ethers.JsonRpcProvider(BASE_RPC, 8453, { staticNetwork: true })
	try {
		const usdc = new ethers.Contract(BASE_USDC, ERC20_ABI, provider)
		const raw = (await usdc.balanceOf(addr, { blockTag: 'latest' })) as bigint
		return parseUsdc6(raw)
	} catch {
		return null
	} finally {
		provider.destroy()
	}
}

/**
 * Read Base USDC through the connected EIP-1193 wallet (same view the user sees).
 * Always uses blockTag `latest`. Failure returns null.
 */
export async function fetchUsdcBalanceOnBaseViaWallet(
	eip1193: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> },
	address: string,
): Promise<number | null> {
	let addr: string
	try {
		addr = ethers.getAddress(String(address ?? '').trim())
	} catch {
		return null
	}
	try {
		const data = `${BALANCE_OF_SELECTOR}${addr.slice(2).toLowerCase().padStart(64, '0')}`
		const result = await eip1193.request({
			method: 'eth_call',
			params: [{ to: BASE_USDC, data }, 'latest'],
		})
		return parseUsdc6(result)
	} catch {
		return null
	}
}
