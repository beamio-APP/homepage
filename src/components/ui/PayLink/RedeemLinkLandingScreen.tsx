import React,{useState, useEffect} from "react"
import {ethers} from 'ethers'
import { Check } from "lucide-react"
import beamioConetABI from '../../../util/ABI/beamioConetABI.json'
type Prof = {
	secureCode: string
}
const beamioConetContract = {
	address: '0x5156E93f44283CA584D09EA46E30ee14ca0abB37',
	network: 'CONET DePIN',
	abi: beamioConetABI,
	provider: new ethers.JsonRpcProvider('https://mainnet-rpc.conet.network'),
	
}

type IGtCheckMemooo = {
	payHash: string
	from: string
	amount: bigint
	depositHash: string
	chianID: bigint
	erc3009Address: string
	decimals: bigint
	node: string
	createTimestamp: bigint
}

const beamioConet = new ethers.Contract(beamioConetContract.address, beamioConetContract.abi, beamioConetContract.provider)
const RedeemLinkLandingScreen = ({secureCode}: Prof) => {
	const [GenerateHash, setGenerateHash] = useState('')
	const [hashError, setHashError] = useState(false) 
	const [note, setNote] = useState('')
	const [amount, setAmount] = useState('')
	const [createTimestamp, setCreateTimestamp] = useState(0)


	const appUrl = `https://beamio.app/app?secureCode=${secureCode}`
	const init = async () => {
		try {
			const check: IGtCheckMemooo = await beamioConet.getCheckMemo(secureCode)
			if (!check.payHash || check.depositHash != ethers.ZeroHash) {
				setHashError(true)
				return
			}
			const _note = check.node.split('\r\n')[0]
			setNote(_note)
			setGenerateHash(check.payHash)
			const _amount = ethers.formatUnits(check.amount, 6)
			setAmount(_amount)
			const _timestamp = Number(check.createTimestamp * BigInt(1000))
			setCreateTimestamp(_timestamp)

		} catch (ex: any) {
			setHashError(true)
		}
		
	}

	let first = true

	useEffect(() => {
		if (first) {
			first = false
			init()
		}
	}, [])


	function CopyLinkButton({ appUrl }: { appUrl: string }) {
		const [copied, setCopied] = useState(false)

		const handleCopy = async () => {
			try {
			await navigator.clipboard.writeText(appUrl)
			setCopied(true)

			// 2 秒后恢复
			setTimeout(() => setCopied(false), 2000)
			} catch (e) {
			console.error("Copy failed", e)
			}
		}

		return (
			<button
			onClick={handleCopy}
			className="
				h-9 px-3 rounded-xl border border-slate-200 
				text-[10px] sm:text-[11px] font-medium 
				text-slate-700 w-full sm:w-auto shrink-0
				flex items-center justify-center gap-1
				active:scale-95 transition-transform
			"
			>
			{copied ? (
				<Check className="w-4 h-4 text-green-500 animate-pulse" />
			) : (
				"Copy link"
			)}
			</button>
		)
	}

	function InstallOpenButton({ appUrl }: { appUrl: string }) {
		const handleOpen = () => {
			if (!appUrl) return
			window.open(appUrl, "_blank") // 新标签打开
		}

		return (
			<button
			onClick={handleOpen}
			className="
				mt-3 w-full rounded-full bg-blue-600 
				hover:bg-blue-700 text-white text-xs sm:text-sm 
				font-semibold py-3 sm:py-3.5 shadow-sm transition-colors
			"
			>
			Install & open Beamio (beamio.app/app)
			</button>
		)
	}
	return (
		<>
			<div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
			{/* 外框整体圆角 */}
			<div
				className="
				w-full max-w-md 
				max-h-[80vh]          /* 整个弹窗高度不超过屏幕 80% */
				bg-white text-black 
				border border-black 
				shadow-2xl 
				rounded-3xl 
				overflow-hidden 
				flex flex-col         /* 让内部可以用 flex-1 + overflow 滚动 */
				"
			>
				{/* 可滚动内容区 */}
				<div className="flex-1 min-h-0 overflow-y-auto">
					<div className="flex flex-col h-full">

						<div className="flex flex-col h-full">

							<div className="flex-1 px-4 pt-6 pb-6 sm:px-6 sm:pt-8 sm:pb-8 overflow-auto">
								{
									!hashError && (
										<>
											<h1 className="text-center text-base sm:text-lg font-semibold text-slate-900 mb-2">
												Open this Cashcode in Beamio
											</h1>
											<p className="text-center text-[11px] sm:text-xs text-slate-500 mb-5 sm:mb-6 max-w-md sm:max-w-xl mx-auto">
												To redeem this Cashcode, you’ll need to open it inside the Beamio app so your Beamio wallet on Base can
												receive the funds.
											</p>
										</>
									)
								}
								

								<div className="max-w-md sm:max-w-xl mx-auto space-y-5 sm:space-y-6 text-xs sm:text-sm">
									


									{/* Missing Cashcode error help */}
									{
										hashError && (
											<>
												<h1 className="text-center text-base sm:text-lg font-semibold text-slate-900 mb-2">
													This Cashcode can't be redeemed
												</h1>
												<p className="text-center text-[11px] sm:text-xs text-slate-500 mb-5 sm:mb-6 max-w-md sm:max-w-xl mx-auto">
													The Beamio Cashcode you opened is not active. The funds are not available to redeem with this link.
												</p>

												{/* Reason / status explanation */}
												<section className="rounded-2xl border border-slate-200 bg-white px-4 py-4 space-y-2">
													<div className="flex items-center justify-between">
														<span className="text-sm font-medium text-slate-900">Why this Cashcode is inactive</span>
													</div>
													<p className="text-[11px] text-slate-600">
														A Cashcode can stop working for a few reasons:
													</p>
													<ul className="list-disc list-inside text-[11px] text-slate-600 space-y-1">
														<li>It has already been redeemed by you or someone else.</li>
														<li>It has expired based on the sender&apos;s settings.</li>
														<li>The sender withdrew or cancelled this Cashcode.</li>
														<li>The Cashcode code or link is not valid (for example, it was typed incorrectly).</li>
													</ul>
													<p className="text-[11px] text-slate-600 pt-1">
														If you believe this is a mistake, contact the person who sent you this Cashcode and ask them to create a new one.
													</p>
												</section>  
											</>
										)
									}
									

								{/* Summary of the Cashcode you opened */}
								{
									GenerateHash && (
										<>
											<section className="rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-3.5 sm:px-4 sm:py-4 space-y-3">
												{/* Top summary row */}
												<div className="space-y-1.5">
												<div className="text-[10px] sm:text-[11px] tracking-[0.14em] sm:tracking-[0.16em] text-slate-500 uppercase">
												You were sent a Beamio Cashcode
												</div>


												{/* Create Time */}
												<div className="text-[10px] sm:text-[11px] text-slate-400">
												Created: {new Date(createTimestamp).toLocaleString()}
												</div>


												{/* Amount + Right description as a single centered block */}
												<div className="flex items-center justify-between gap-3 py-1">
												<span className="text-xl sm:text-2xl font-semibold text-slate-900">
												{amount} USDC
												</span>
												<span className="text-[10px] sm:text-[11px] text-slate-500 text-right leading-snug max-w-[11rem] sm:max-w-xs flex flex-col justify-center">
												<span>This Cashcode can be redeemed once</span>
												<span>Redeem to a Beamio wallet on Base</span>
												</span>
												</div>
												</div>

												{/* Note */}
												<div className="space-y-1">
												<div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-500 uppercase tracking-wide">
													<span>Note for you</span>
													
												</div>
												<div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm text-slate-800">
													{note}
												</div>
												</div>

												<p className="text-[10px] sm:text-[11px] text-slate-500 pt-1">
												The person who created this Cashcode pays the Beamio and network fees. Their wallet address is not shown
												to you.
												</p>
											</section>

											<section className="rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-3.5 sm:px-4 sm:py-4 space-y-2">
												<div className="flex flex-col gap-0.5">
												<span className="text-[10px] sm:text-[11px] tracking-[0.14em] sm:tracking-[0.16em] text-slate-500 uppercase">
													If you already use Beamio
												</span>
												<span className="text-xs sm:text-sm font-medium text-slate-900">
													Redeem this Cashcode in the app
												</span>
												</div>
												<ol className="list-decimal list-inside text-[10px] sm:text-[11px] text-slate-600 space-y-1 mt-1">
												<li>Open the Beamio app.</li>
												<li>
													Go to the <span className="font-medium">Browser</span> tab.
												</li>
												<li>Paste this link into the address bar.</li>
												<li>The Cashcode redeem screen will open automatically.</li>
												</ol>
												<div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-2">
												<div className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] sm:text-[11px] text-slate-600 truncate">
													{appUrl}
												</div>
												<CopyLinkButton appUrl={appUrl} />
												</div>
											</section>
										</>
										
									)
								}
							
								

								{/* New to Beamio */}
								<section className="rounded-2xl border border-slate-200 bg-white px-3.5 py-3.5 sm:px-4 sm:py-4 space-y-2">
									<div className="flex flex-col gap-0.5">
										<span className="text-[10px] sm:text-[11px] tracking-[0.14em] sm:tracking-[0.16em] text-slate-500 uppercase">
											New to Beamio?
										</span>
										<span className="text-xs sm:text-sm font-medium text-slate-900">
											Install Beamio to redeem this Cashcode
										</span>
									</div>
									<p className="text-[10px] sm:text-[11px] text-slate-600">
										Beamio is a self-custodial, gasless USDC wallet on Base. To redeem this Cashcode, install the app and
										create your Beamio wallet.
									</p>
									<InstallOpenButton appUrl={appUrl} />
									<p className="mt-2 text-[10px] sm:text-[11px] text-slate-500">
										After installing, open Beamio, go to the <span className="font-medium">Browser</span> tab, and paste this
										link to redeem your Cashcode.
									</p>
								</section>
								</div>
							</div>
						</div>
					</div>
				</div>
				
			</div>
		</div>
		</>
		
	)
}


export default RedeemLinkLandingScreen