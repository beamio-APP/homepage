import React,{useState, useEffect} from "react";
import { Lock, Fuel, Bot, Brain, Smartphone, Ticket, Link2, Gift, Box, Check } from "lucide-react";
import BeamioLogo from './components/ui/BeamioLogo'
import V5Video from "./components/ui/V5Video"
import WorkflowCanvas from './components/ui/WorkflowCanvas'
import CashcodeAPP from './components/ui/PayLink/index'
import RedeemLinkLandingScreen from './components/ui/PayLink/RedeemLinkLandingScreen'
import beamioConetCoreABI from './util/ABI/beamioConetCoreABI.json'
import {ethers} from 'ethers'

export const parseQueryParams = (queryString: string) => {
	const params = new Map();

	// Remove the leading '?' if present
	const cleanQueryString = queryString.startsWith("?")
		? queryString.slice(1)
		: queryString;

	// Split the string into key-value pairs
	const pairs = cleanQueryString.split("&");

	for (const pair of pairs) {
		// Split each pair into key and value
		const [key, value] = pair.split("=").map(decodeURIComponent);
		// Only add if key is not undefined
		if (key) {
		params.set(key, value || "");
		}
	}

	return params;
}

const formatMoney = (n: number) =>
		n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const beamioConetContract = {
	address: '0xCE8e2Cda88FfE2c99bc88D9471A3CBD08F519FEd',
	network: 'CONET DePIN',
	abi: beamioConetCoreABI,
	provider: new ethers.JsonRpcProvider('https://mainnet-rpc.conet.network'),
	
}

const CoreContract = new ethers.Contract(beamioConetContract.address, beamioConetContract.abi, beamioConetContract.provider)


const BeamioLanding: React.FC = () => {
	const [demoOpen, setDemoOpen] = useState<boolean>(false)
	const [code, setCode] = useState('')
	const [amt, setAmt] = useState('')
	const [note, setNote]  = useState('')
	const [recipient, setRecipient] = useState('')
	const [secureCode, setSecureCode] = useState('')
	const [showCheck, setShowCheck] = useState(false)



	const init = async () => {
		const queryParams = new URLSearchParams(window.location.search)
		if (queryParams?.size) {

			let code = queryParams.get("code")||''
			const _secureCode = queryParams.get("secureCode")||''

			if (_secureCode) {
				setSecureCode (_secureCode)
				setShowCheck(true)
				return 
			}
			if (code) {
				if (!code.startsWith('0x')) {
					code = ethers.solidityPackedKeccak256(['string'], [code])
					
				}
				setCode(code)
				try {
					const fx = await CoreContract.getLinkMemo(code)
					const amount = Number(ethers.formatUnits(fx.amount, 6))
					setAmt(formatMoney(amount))
					setNote(fx.node)
					setRecipient(fx.to)
					setDemoOpen(true)
				} catch (ex: any) {
					console.log(`getInfo ex: ${ex.message}`)
				}
				
			}
		}
	}


  	let first = true

  	useEffect(() => {
		if (first) {
			first = false
			init()
		}
  	}, [])

  return (
		<div className="min-h-screen flex flex-col bg-white text-slate-900">
			{/* NAV */}
			<div className="fixed top-4 left-4 z-50 flex items-center gap-3">
				<BeamioLogo />
			</div>

			
				{/* <Marquee /> */}
			

			<main className="flex-1 ">
				
				<MainPage />
				{
					demoOpen && <CashcodeAPP recipient={recipient} code={code} setDemoOpen={setDemoOpen} lang={'en'} id={code} wallet={''} amt={amt} note={note}/>
				}

				{
					showCheck && <RedeemLinkLandingScreen secureCode={secureCode} />
				}
			</main>

			{/* FOOTER */}
			<footer className="border-t border-slate-200 bg-slate-50">
			<div className="mx-auto max-w-6xl px-4 lg:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
				
				<p className="text-[11px] text-slate-500">
				© {new Date().getFullYear()} Beamio · Built on Base · Stablecoin payments
				</p>

				<div className="flex gap-4 text-[11px] text-slate-500">
				<a href="/terms" className="hover:text-slate-600">Terms</a>
				<a href="/privacy" className="hover:text-slate-600">Privacy</a>

				{/* ⭐ 新增 GitHub 链接按钮 */}
				<a
					href="https://github.com/beamio-APP"
					target="_blank"
					rel="noopener noreferrer"
					className="hover:text-slate-600 flex items-center gap-1"
				>
					{/* 小 GitHub Icon（SVG inline，不依赖外部文件） */}
					<svg
					viewBox="0 0 16 16"
					fill="currentColor"
					className="w-3.5 h-3.5 opacity-70"
					>
					<path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38
						0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52
						-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2
						-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.62
						7.62 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08
						2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48
						0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
					</svg>

					GitHub
				</a>
				</div>

			</div>
			</footer>
		</div>
  )
}

const appUrl = 'https://beamio.app/app'

// Rotating trustless manifesto strip
const messages = [
  "Money used to need trust.",
  "Then we trusted platforms.",
  "Now we have trustless rails.",
  "Beamio puts them in your pocket.",
  "No trust needed. Just beam.",
]

const TrustlessStrip: React.FC = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
	const id = setInterval(() => {
	  setIndex((prev) => (prev + 1) % messages.length);
	}, 2600);
	return () => clearInterval(id);
  }, []);

  return (
	<div className="w-full border-b border-slate-200 bg-white/80 backdrop-blur">
	  <div className="mx-auto max-w-6xl px-4 lg:px-6 h-9 flex items-center justify-center">
		<div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50/80 px-3 sm:px-4 py-1 gap-2 shadow-sm">
		  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-sky-500/10">
			<span className="h-2 w-2 rounded-full bg-sky-500" />
		  </span>
		  <div className="relative h-5 overflow-hidden flex items-center">
			<div
			  className="flex flex-col transition-transform duration-500 ease-out"
			  style={{ transform: `translateY(-${index * 100}%)` }}
			>
			  {messages.map((msg, i) => (
				<span
				  key={i}
				  className="h-5 flex items-center text-[11px] sm:text-xs font-medium tracking-wide text-slate-600 whitespace-nowrap"
				>
				  {msg}
				</span>
			  ))}
			</div>
		  </div>
		</div>
	  </div>
	</div>
  );
};

// Fees section
const FeesSection: React.FC = () => {
  return (
	<section className="bg-white border-t border-slate-100">
	  <div className="mx-auto max-w-6xl px-4 lg:px-6 py-16 space-y-8">
		<div className="max-w-2xl space-y-3">
		  <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
			Fees that feel fair.
		  </h2>
		  <p className="text-sm sm:text-base text-slate-600">
			Friends beam for free. Codes and links cost a tiny “voucher fee”. All of it 0-gas for you.
		  </p>
		</div>
		<div className="grid gap-4 md:grid-cols-3">
		  <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 flex flex-col justify-between">
			<div className="space-y-2">
			  <h3 className="text-sm font-semibold text-slate-900">
				Send to friends — 0% Beamio fee
			  </h3>
			  <p className="text-xs sm:text-sm text-slate-600">
				Move USDC between people you know for free. No gas to top up, no extra fee on top.
			  </p>
			</div>
			<p className="mt-4 text-[11px] text-slate-500">
			  Network gas is handled behind the scenes, so you never have to top it up.
			</p>
		  </div>
		  <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col justify-between">
			<div className="space-y-2">
			  <h3 className="text-sm font-semibold text-slate-900">
				Check codes & links — 0.8%
			  </h3>
			  <p className="text-xs sm:text-sm text-slate-600">
				When Beamio issues a check code or payment link, you pay a small voucher fee:
			  </p>
			  <ul className="mt-2 space-y-1 text-xs sm:text-sm text-slate-600">
				<li>
				  • <span className="font-medium">0.8% per payment</span>
				</li>
				<li>
				  • <span className="font-medium">Min 0.02 USDC, max 2 USDC</span>
				</li>
				
			  </ul>
			</div>
			<p className="mt-4 text-[11px] text-slate-500">
			  Think of it like a digital Money Order fee. Only when we create the voucher.
			</p>
		  </div>
		  <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 flex flex-col justify-between">
			<div className="space-y-2">
			  <h3 className="text-sm font-semibold text-slate-900">No-gas experience</h3>
			  <p className="text-xs sm:text-sm text-slate-600">
				Onchain still uses gas, but Beamio covers it. You just:
			  </p>
			  <ul className="mt-2 space-y-1 text-xs sm:text-sm text-slate-600">
				<li>• Pay in USDC</li>
				<li>• Pick who you’re paying</li>
				<li>• Tap confirm</li>
			  </ul>
			</div>
			<p className="mt-4 text-[11px] text-slate-500">
			  No gas runs, no network switching.
			</p>
		  </div>
		</div>
	  </div>
	</section>
  );
};

// Infra section
const UnderTheHoodSection: React.FC = () => {
  return (
	<section className="bg-slate-50/60 border-t border-slate-100">
	  <div className="mx-auto max-w-6xl px-4 lg:px-6 py-16 grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] items-center">
		<div className="space-y-5">
		  <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
		   Under the hood, it’s Base + x402. AA & Arc on the roadmap.
		  </h2>
		  <p className="text-sm sm:text-base text-slate-600">
			Beamio feels like a simple pay app, but it runs on real Web3 rails so your money stays programmable and yours.
		  </p>
		  <div className="space-y-4">
			<div className="space-y-1.5">
			  <h3 className="text-sm font-semibold text-slate-900">Base</h3>
			  <p className="text-xs sm:text-sm text-slate-600">
				Beamio runs on Base, Coinbase’s Ethereum L2, for fast, low-cost USDC payments.
			  </p>
			</div>
			<div className="space-y-1.5">
			  <h3 className="text-sm font-semibold text-slate-900">
				Powered by x402-style sessions
			  </h3>
			  <p className="text-xs sm:text-sm text-slate-600">
				Check codes and links behave like simple URLs, not scary raw transactions — still fully onchain underneath.
			  </p>
			</div>

			<div className="space-y-1.5">
			  <h3 className="text-sm font-semibold text-slate-900">
				Self-custody wallets
			  </h3>
			  <p className="text-xs sm:text-sm text-slate-600">
				Today Beamio uses standard EOA wallets, so you own the keys and the funds. Beamio just wraps it in a smoother UI.
			  </p>
			</div>

			<div className="space-y-1.5">
			  <h3 className="text-sm font-semibold text-slate-900">
				What’s next: AA + Arc
			  </h3>
			  <p className="text-xs sm:text-sm text-slate-600">
				We’re building toward AA smart accounts and Circle’s Arc network for 0-gas UX at scale and multi-currency stablecoin FX.
			  </p>
			</div>
			<p className="mt-4 text-[11px] text-slate-500">
			  In plain language: accounts are designed to be recoverable and verifiable without locking all your data in one company’s private database.
			</p>
		  </div>

		</div>
		<div className="relative">
		  <div className="absolute -top-10 -left-10 w-40 h-40 bg-sky-500/20 blur-3xl rounded-full pointer-events-none" />
		  <div className="relative rounded-3xl border border-slate-200 bg-white shadow-xl p-5 space-y-4">
			<V5Video />
			{/* <p className="text-xs font-medium text-slate-500 tracking-[0.18em] uppercase">
			  Beamio stack
			</p>
			<div className="space-y-3 text-xs sm:text-sm text-slate-700">
			  <div className="flex items-center justify-between rounded-2xl border border-slate-200 px-3 py-2">
				<span>Beamio app</span>
				<span className="text-[11px] text-slate-500">Send · Split · Tip · Links</span>
			  </div>
			  <div className="flex items-center justify-between rounded-2xl border border-slate-200 px-3 py-2">
				<span>Check codes & links (x402-style)</span>
				<span className="text-[11px] text-slate-500">Links · Codes · QRs</span>
			  </div>
			  <div className="flex items-center justify-between rounded-2xl border border-slate-200 px-3 py-2">
				<span>Self-custody wallets (EOA)</span>
				<span className="text-[11px] text-slate-500">You own the keys</span>
			  </div>
			  <div className="flex items-center justify-between rounded-2xl border border-slate-200 px-3 py-2">
				<span>Base L2</span>
				<span className="text-[11px] text-slate-500">USDC onchain</span>
			  </div>
			</div>
			<p className="text-[11px] text-slate-500">
			  Next up: AA smart accounts + Arc settlement for multi-currency stablecoin FX.
			</p> */}

		  </div>
		</div>
	  </div>
	</section>
  );
};

// Beamio main landing component (aligned with newHome.html)
const LAYERS = [
  { id: 5, label: 'Layer 5', title: 'Agent-Ready AI Integration', subtitle: 'Smart Receipts & JSON-RPC.', accent: 'purple' },
  { id: 4, label: 'Layer 4', title: 'Dual-Core Interface', subtitle: 'Main Wallet (Vault) + Express Pay (Terminal).', accent: 'slate' },
  { id: 3, label: 'Layer 3', title: 'The Voucher Economy', subtitle: 'Class A/B/C Assets.', accent: 'blue' },
  { id: 2, label: 'Layer 2', title: 'Atomic Asset Container', subtitle: 'Reserve Mechanism & State Machine.', accent: 'slate' },
  { id: 1, label: 'Layer 1', title: 'Dual-Chain Base', subtitle: 'Base L2 (Value) + CoNET L1 (Data).', accent: 'slate' },
];

const MainPage: React.FC = () => {
  const [activeLayer, setActiveLayer] = useState(5);

  return (
	<div className="min-h-screen flex flex-col bg-white text-slate-900">
	  <main className="flex-1">
		{/* HERO */}
		<section className="relative pt-32 sm:pt-40 pb-16 overflow-hidden bg-white">
		  <div className="absolute inset-0 z-0 opacity-10 bg-[length:400%_400%]" style={{ background: 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)', animation: 'aurora 15s ease infinite' }} />
		  <style>{`@keyframes aurora { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }`}</style>
		  <div className="max-w-7xl mx-auto px-4 lg:px-6 relative z-10 text-center">
			<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 backdrop-blur border border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wide mb-8 shadow-sm">
			  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
			  The Financial OS for AI
			</div>
			<h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-slate-900 tracking-tight mb-6 leading-[1.1]">
			  The Visa for the<br />
			  <span className="bg-gradient-to-r from-[#1562f0] to-[#7c3aed] bg-clip-text text-transparent">AI Economy.</span>
			</h1>
			<p className="text-lg sm:text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto mb-10 font-light leading-relaxed">
			  Bridging Web2 Commerce, Web3 Liquidity, and Autonomous Agents.<br />
			  <strong>Issuance as a Service</strong> for the next generation of business.
			</p>
			<div className="flex flex-col sm:flex-row justify-center gap-4 mb-4">
			  <a href={appUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#1562f0] to-[#4f46e5] text-white font-semibold rounded-xl shadow-xl shadow-blue-500/20 hover:scale-105 transition-transform">
				Create @BeamioTag
				<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
			  </a>
			  <a href="#blueprint" className="inline-flex items-center justify-center px-8 py-4 bg-white/80 backdrop-blur border border-slate-200 text-slate-700 font-semibold rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-colors">
				For Merchants
			  </a>
			</div>
			<div className="flex justify-center items-center gap-2 text-xs text-slate-400 font-medium mb-16">
			  <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
			  Runs in Browser. No Download Required.
			</div>
		  </div>
		</section>

		{/* WORKFLOW CANVAS */}
		<WorkflowCanvas />

		{/* THE PROBLEM */}
		<section className="py-20 lg:py-24 bg-slate-50 border-b border-slate-200">
		  <div className="max-w-7xl mx-auto px-4 lg:px-6">
			<div className="text-center mb-16">
			  <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">The Problem</h2>
			  <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Why the old rails are broken.</h3>
			</div>
			<div className="grid md:grid-cols-3 gap-6 lg:gap-8">
			  <div className="p-6 lg:p-8 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-red-200 transition-colors group">
				<div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-slate-600">
				<Lock className="w-6 h-6" strokeWidth={2} />
			  </div>
				<h4 className="text-xl font-bold text-slate-900 mb-3">Siloed Assets</h4>
				<p className="text-slate-500 text-sm leading-relaxed">Points and vouchers are trapped in proprietary databases. Illiquid, non-transferable, and invisible to the AI economy.</p>
			  </div>
			  <div className="p-6 lg:p-8 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-red-200 transition-colors group">
				<div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-slate-600">
				<Fuel className="w-6 h-6" strokeWidth={2} />
			  </div>
				<h4 className="text-xl font-bold text-slate-900 mb-3">Crypto Friction</h4>
				<p className="text-slate-500 text-sm leading-relaxed">Gas fees, seed phrases, and volatility make standard Web3 protocols unusable for daily high-frequency commerce.</p>
			  </div>
			  <div className="p-6 lg:p-8 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-red-200 transition-colors group">
				<div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-slate-600">
				<Bot className="w-6 h-6" strokeWidth={2} />
			  </div>
				<h4 className="text-xl font-bold text-slate-900 mb-3">AI Blindness</h4>
				<p className="text-slate-500 text-sm leading-relaxed">AI Agents cannot read PDF receipts or hold bank accounts. They need structured data and programmable wallets.</p>
			  </div>
			</div>
		  </div>
		</section>

		{/* THE BEAMIO STACK (BLUEPRINT) */}
		<section id="blueprint" className="py-20 lg:py-24 bg-white border-b border-slate-200">
		  <div className="max-w-7xl mx-auto px-4 lg:px-6">
			<div className="text-center mb-16">
			  <h2 className="text-sm font-bold text-[#1562f0] uppercase tracking-widest mb-2">System Architecture</h2>
			  <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900">The Beamio Stack.</h3>
			  <p className="text-slate-500 mt-4">A complete infrastructure from Layer 1 Consensus to Layer 5 AI Integration.</p>
			</div>
			<div className="grid md:grid-cols-12 gap-8 lg:gap-12">
			  <div className="md:col-span-5 flex flex-col gap-4">
				{LAYERS.map((layer) => (
				  <button key={layer.id} type="button" onClick={() => setActiveLayer(layer.id)} className={`text-left p-6 border rounded-xl transition-all duration-300 cursor-pointer hover:border-[#1562f0] hover:translate-x-1 ${activeLayer === layer.id ? 'bg-blue-50 border-[#1562f0] border-l-4 border-l-[#1562f0] shadow-md shadow-blue-500/10' : 'bg-white border-slate-200'}`}>
					<div className={`text-xs font-bold uppercase tracking-wider mb-1 ${layer.accent === 'purple' ? 'text-[#7c3aed]' : layer.accent === 'blue' ? 'text-[#1562f0]' : 'text-slate-400'}`}>{layer.label}</div>
					<div className="font-bold text-lg text-slate-900">{layer.title}</div>
					<div className="text-sm text-slate-500 mt-1">{layer.subtitle}</div>
				  </button>
				))}
			  </div>
			  <div className="md:col-span-7 bg-slate-50 rounded-2xl border border-slate-200 p-6 lg:p-8 shadow-sm flex items-center justify-center min-h-[400px]">
				{activeLayer === 5 && (
				  <div className="w-full">
					<div className="flex items-center gap-3 mb-6">
					  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-[#7c3aed]">
						<Brain className="w-5 h-5" strokeWidth={2} />
					  </div>
					  <h3 className="text-2xl font-bold text-slate-900">Smart Receipts for AI</h3>
					</div>
					<p className="text-slate-600 mb-8">Beamio generates on-chain <strong>Smart Receipts</strong>—structured JSON data that AI Agents can verify, analyze, and use for automated expensing without OCR.</p>
					<div className="bg-slate-800 rounded-lg p-5 font-mono text-xs text-slate-200 overflow-x-auto">
					  <pre>{`"smart_receipt": {
  "agent_id": "did:beamio:travel_bot",
  "merchant": "did:beamio:starbucks",
  "data": { "sku": "latte_oat", "amount": 5.50, "currency": "USDC" },
  "verified": true
}`}</pre>
					</div>
				  </div>
				)}
				{activeLayer === 4 && (
				  <div className="w-full">
					<div className="flex items-center gap-3 mb-6">
					  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-[#1562f0]">
						<Smartphone className="w-5 h-5" strokeWidth={2} />
					  </div>
					  <h3 className="text-2xl font-bold text-slate-900">Dual-Core Architecture</h3>
					</div>
					<p className="text-slate-600 mb-8">We separate cold storage from hot execution.</p>
					<div className="grid grid-cols-2 gap-4">
					  <div className="p-6 bg-white rounded-xl border border-slate-200">
						<div className="text-xs font-bold text-slate-400 uppercase mb-2">Main Wallet (EOA)</div>
						<h4 className="font-bold text-slate-900 mb-2">Social Vault</h4>
						<p className="text-xs text-slate-500">Secure storage & Social P2P. USDC Only. High Security.</p>
					  </div>
					  <div className="p-6 bg-white rounded-xl border border-slate-200">
						<div className="text-xs font-bold text-[#1562f0] uppercase mb-2">Express Pay (AA)</div>
						<h4 className="font-bold text-slate-900 mb-2">Commercial Terminal</h4>
						<p className="text-xs text-slate-500">Scan-to-Pay, Smart Routing, Vouchers. Programmable.</p>
					  </div>
					</div>
				  </div>
				)}
				{activeLayer === 3 && (
				  <div className="w-full">
					<div className="flex items-center gap-3 mb-6">
					  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
						<Ticket className="w-5 h-5" strokeWidth={2} />
					  </div>
					  <h3 className="text-2xl font-bold text-slate-900">Asset Tiers</h3>
					</div>
					<div className="space-y-3">
					  <div className="p-4 bg-white rounded-xl border border-slate-200 border-l-4 border-l-[#1562f0]">
						<div className="flex justify-between items-center mb-1">
						  <span className="font-bold text-slate-900 text-sm">Class A: Stored Value</span>
						  <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded">Liquid</span>
						</div>
						<div className="text-xs text-slate-500">Gift Cards backed 1:1 by USDC. Replaces Bank Accounts.</div>
					  </div>
					  <div className="p-4 bg-white rounded-xl border border-slate-200 border-l-4 border-l-[#7c3aed]">
						<div className="flex justify-between items-center mb-1">
						  <span className="font-bold text-slate-900 text-sm">Class B: Access</span>
						  <span className="text-[10px] bg-purple-100 text-purple-600 px-2 py-0.5 rounded">NFT</span>
						</div>
						<div className="text-xs text-slate-500">Concert Tickets & Memberships. Tradable & Verifiable.</div>
					  </div>
					  <div className="p-4 bg-white rounded-xl border border-slate-200 border-l-4 border-l-amber-500">
						<div className="flex justify-between items-center mb-1">
						  <span className="font-bold text-slate-900 text-sm">Class C: Incentives</span>
						  <span className="text-[10px] bg-amber-100 text-amber-600 px-2 py-0.5 rounded">Growth</span>
						</div>
						<div className="text-xs text-slate-500">Cashcode Red Packets, Vouchers & Perks. Replaces Coupons.</div>
					  </div>
					</div>
				  </div>
				)}
				{activeLayer === 2 && (
				  <div className="w-full text-center">
					<div className="w-24 h-24 mx-auto mb-6 rounded-xl bg-slate-200 flex items-center justify-center text-slate-600">
					<Box className="w-12 h-12" strokeWidth={2} />
				  </div>
					<h3 className="text-2xl font-bold text-slate-900 mb-2">Atomic Asset Container</h3>
					<p className="text-slate-600 text-sm max-w-md mx-auto">The <strong>Reserve Mechanism</strong> logically locks assets to prevent double-spending during off-chain sharing (Links/QRs). Guarantees 100% solvency.</p>
				  </div>
				)}
				{activeLayer === 1 && (
				  <div className="w-full">
					<div className="flex items-center gap-3 mb-6">
					  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-900">
						<Link2 className="w-5 h-5" strokeWidth={2} />
					  </div>
					  <h3 className="text-2xl font-bold text-slate-900">Dual-Chain Base</h3>
					</div>
					<div className="space-y-4">
					  <div className="p-4 border border-slate-200 rounded-lg flex items-center gap-4">
						<div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xs">L2</div>
						<div>
						  <h4 className="font-bold text-slate-900 text-sm">Base Mainnet (Value Layer)</h4>
						  <p className="text-xs text-slate-500">Settlement of USDC & ERC-1155 Assets. Secured by Ethereum.</p>
						</div>
					  </div>
					  <div className="p-4 border border-slate-200 rounded-lg flex items-center gap-4">
						<div className="w-10 h-10 bg-slate-900 rounded flex items-center justify-center text-white font-bold text-xs">L1</div>
						<div>
						  <h4 className="font-bold text-slate-900 text-sm">CoNET Blockchain (Data Layer)</h4>
						  <p className="text-xs text-slate-500">Sovereign Identity (@BeamioTag), Social Graph, and Zero-Gas messaging.</p>
						</div>
					  </div>
					</div>
				  </div>
				)}
			  </div>
			</div>
		  </div>
		</section>

		{/* ISSUANCE AS A SERVICE */}
		<section id="issuance" className="py-20 lg:py-24 bg-white border-b border-slate-200">
		  <div className="max-w-7xl mx-auto px-4 lg:px-6">
			<div className="p-8 lg:p-12 bg-slate-900 rounded-3xl text-white flex flex-col md:flex-row items-center gap-8 lg:gap-12 relative overflow-hidden">
			  <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600 opacity-20 blur-[100px] rounded-full" />
			  <div className="flex-1 relative z-10">
				<div className="text-[#1562f0] font-bold tracking-widest uppercase text-xs mb-4">For Merchants & Alliances</div>
				<h2 className="text-3xl sm:text-4xl font-extrabold mb-6">The Merchant OS.</h2>
				<p className="text-slate-400 text-lg mb-8 leading-relaxed">Issuance as a Service. Stop building custom apps. Use our dashboard to mint <strong>Stored Value Cards, Tickets, and Coupons</strong> in one click.</p>
				<div className="flex flex-wrap gap-4">
				  <div className="flex items-center gap-2 text-sm text-slate-300">
					<svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
					No Coding Required
				  </div>
				  <div className="flex items-center gap-2 text-sm text-slate-300">
					<svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
					Real Revenue (USDC)
				  </div>
				</div>
				<a href={appUrl} target="_blank" rel="noreferrer" className="inline-block mt-8 px-8 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-blue-50 transition-colors">Launch Dashboard</a>
			  </div>
			  <div className="flex-1 w-full relative z-10 max-w-md">
				<div className="w-full bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-2xl">
				  <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
					<div className="font-bold">Create Campaign</div>
					<div className="text-xs bg-blue-600 px-2 py-1 rounded text-white">New Asset</div>
				  </div>
				  <div className="space-y-4">
					<div><div className="text-xs text-slate-500 mb-1">Asset Class</div><div className="w-full h-10 bg-slate-900 rounded border border-slate-600 flex items-center px-4 text-sm text-white">Class A: Stored Value</div></div>
					<div><div className="text-xs text-slate-500 mb-1">Backing Asset</div><div className="w-full h-10 bg-slate-900 rounded border border-slate-600 flex items-center px-4 text-sm text-white">USDC (Base Mainnet)</div></div>
					<div className="grid grid-cols-2 gap-4">
					  <div><div className="text-xs text-slate-500 mb-1">Quantity</div><div className="w-full h-10 bg-slate-900 rounded border border-slate-600 flex items-center px-4 text-sm text-white">1,000</div></div>
					  <div><div className="text-xs text-slate-500 mb-1">Face Value</div><div className="w-full h-10 bg-slate-900 rounded border border-slate-600 flex items-center px-4 text-sm text-white">$50.00</div></div>
					</div>
					<button type="button" className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-bold mt-2 text-white hover:opacity-90 transition-opacity">Mint Assets</button>
				  </div>
				</div>
			  </div>
			</div>
		  </div>
		</section>

		{/* GROWTH ENGINE (CASHCODE) */}
		<section id="growth" className="py-20 lg:py-24 bg-slate-50">
		  <div className="max-w-7xl mx-auto px-4 lg:px-6 grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
			<div>
			  <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Growth Engine</h2>
			  <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-6">Zero-CAC Acquisition via <span className="text-[#1562f0]">Cashcode.</span></h3>
			  <p className="text-slate-600 text-lg mb-8 leading-relaxed">Turn every customer into a distributor. Send Assets (Vouchers, USDC) via WhatsApp, Telegram, or Email using our Atomic Container protocol.</p>
			  <ul className="space-y-4">
				<li className="flex items-center gap-3 text-slate-600"><span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0"><Check className="w-3.5 h-3.5" strokeWidth={3} /></span>Zero Gas for Sender & Receiver</li>
				<li className="flex items-center gap-3 text-slate-600"><span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0"><Check className="w-3.5 h-3.5" strokeWidth={3} /></span>No App Required to Claim</li>
				<li className="flex items-center gap-3 text-slate-600"><span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0"><Check className="w-3.5 h-3.5" strokeWidth={3} /></span>Viral Social Distribution</li>
			  </ul>
			</div>
			<div className="relative flex justify-center">
			  <div className="w-72 h-40 bg-white rounded-2xl shadow-xl border border-slate-200 p-6 flex flex-col justify-between transform rotate-2" style={{ animation: 'float 6s ease-in-out infinite' }}>
				<div className="flex justify-between items-start">
				  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600">
					<Gift className="w-5 h-5" strokeWidth={2} />
				  </div>
				  <div className="text-right"><div className="text-xs text-slate-400 uppercase">Value</div><div className="text-xl font-bold text-slate-900">$50.00</div></div>
				</div>
				<div className="w-full h-10 bg-slate-50 rounded border border-slate-100 flex items-center px-3 text-xs text-blue-500 font-mono">beamio.app/claim/xc92...</div>
			  </div>
			</div>
		  </div>
		</section>

		{/* WAITLIST CTA */}
		<section id="waitlist" className="py-12 lg:py-16 bg-slate-50">
		  <div className="mx-auto max-w-4xl px-4 lg:px-6 text-center space-y-4">
			<h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
			  Ready to beam your first USDC?
			</h2>
			<p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
			  Our first web MVP is live. Open it in your browser, send a tiny USDC payment, and feel what Beamio is like in real life.
			</p>
			<div className="mt-4 flex justify-center">
			  <a
				href={appUrl}
				target="_blank"
				rel="noreferrer"
				className="inline-flex items-center justify-center rounded-full bg-sky-500 hover:bg-sky-400 text-slate-950 text-sm font-semibold px-6 py-2 transition"
			  >
				Open Beamio MVP
			  </a>
			</div>
			<p className="text-[11px] text-slate-500">
			  Opens in a new tab. MVP currently supports USDC on Base with a 0-gas experience.
			</p>
		  </div>
		</section>

		{/* Fees & infra sections */}
		<FeesSection />
		<UnderTheHoodSection />
	  </main>
	</div>
  );
}


export default BeamioLanding