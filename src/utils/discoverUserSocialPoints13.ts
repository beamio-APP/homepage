import { ethers } from 'ethers'
import { providerForBeamioUserCard } from './beamioUserCardChain'

/** ERC-1155 #13 social reward voucher on merchant program cards (aligned with SilentPassUI). */
export const REWARD_VOUCHER_TOKEN_ID = 13n

const CONET_AA_FACTORY = '0x869B31C87ABd9bFB858F5183Ef6021b28ED225E2'

const aaFactoryAbi = [
	'function beamioAccountOf(address) view returns (address)',
	'function primaryAccountOf(address) view returns (address)',
] as const

function isNetworkOrRpcError(err: unknown): boolean {
	const msg = String((err as { message?: string })?.message ?? '').toLowerCase()
	return (
		msg.includes('network') ||
		msg.includes('timeout') ||
		msg.includes('abort') ||
		msg.includes('fetch') ||
		msg.includes('quota') ||
		msg.includes('rate limit') ||
		msg.includes('bad response') ||
		msg.includes('server error') ||
		msg.includes('socket') ||
		msg.includes('econn')
	)
}

async function aaFromFactory(provider: ethers.Provider, eoa: string, factoryAddr: string): Promise<string | null> {
	try {
		const eoaAddr = ethers.getAddress(eoa)
		const f = new ethers.Contract(factoryAddr, aaFactoryAbi, provider)
		let a = await f.beamioAccountOf(eoaAddr).catch((err: unknown) => {
			if (isNetworkOrRpcError(err)) throw err
			return ethers.ZeroAddress
		})
		if (!a || a === ethers.ZeroAddress) {
			a = await f.primaryAccountOf(eoaAddr).catch((err: unknown) => {
				if (isNetworkOrRpcError(err)) throw err
				return ethers.ZeroAddress
			})
		}
		if (!a || a === ethers.ZeroAddress) return null
		const code = await provider.getCode(a).catch((err: unknown) => {
			if (isNetworkOrRpcError(err)) throw err
			return '0x'
		})
		return code && code !== '0x' && code.length > 2 ? ethers.getAddress(a) : null
	} catch (err: unknown) {
		if (isNetworkOrRpcError(err)) throw err
		return null
	}
}

async function resolveBeamioAaOnConet(provider: ethers.Provider, eoa: string): Promise<string | null> {
	return aaFromFactory(provider, eoa, CONET_AA_FACTORY)
}

/** User #13 social reward voucher balance on a merchant program card (CoNET RPC). */
export async function readUserSocialPoints13BalanceOnCard(
	cardNorm: string,
	userNorm: string,
): Promise<bigint | null> {
	try {
		const card = ethers.getAddress(cardNorm)
		const user = ethers.getAddress(userNorm)
		const { provider } = await providerForBeamioUserCard(card)
		const cardContract = new ethers.Contract(
			card,
			['function balanceOf(address account, uint256 id) view returns (uint256)'],
			provider,
		)
		let total = 0n
		try {
			total += (await cardContract.balanceOf(user, REWARD_VOUCHER_TOKEN_ID)) as bigint
		} catch {
			return null
		}
		const aa = await resolveBeamioAaOnConet(provider, user).catch(() => null)
		if (aa) {
			try {
				total += (await cardContract.balanceOf(aa, REWARD_VOUCHER_TOKEN_ID)) as bigint
			} catch {
				/* keep EOA portion */
			}
		}
		return total
	} catch {
		return null
	}
}
