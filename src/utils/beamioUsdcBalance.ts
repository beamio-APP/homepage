import { ethers } from 'ethers'

const BASE_RPC = 'https://base-rpc.conet.network'
const BASE_USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
const ERC20_ABI = ['function balanceOf(address) view returns (uint256)'] as const

/** Trusted success only — failure returns null (caller keeps previous). */
export async function fetchUsdcBalanceOnBase(address: string): Promise<number | null> {
	let addr: string
	try {
		addr = ethers.getAddress(String(address ?? '').trim())
	} catch {
		return null
	}
	try {
		const provider = new ethers.JsonRpcProvider(BASE_RPC, 8453)
		const usdc = new ethers.Contract(BASE_USDC, ERC20_ABI, provider)
		const raw = (await usdc.balanceOf(addr)) as bigint
		const n = Number(ethers.formatUnits(raw, 6))
		return Number.isFinite(n) && n >= 0 ? n : null
	} catch {
		return null
	}
}
