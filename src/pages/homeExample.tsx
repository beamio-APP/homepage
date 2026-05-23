import React from 'react';
import BeamioBrandLogo from '../components/BeamioBrandLogo';
import { 
  Store, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Users,
  BadgeCent,
  ArrowLeft,
  CreditCard,
  Wifi,
  Lock
} from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-[#1562f0]/20">
      
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a href="/" className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors text-sm font-medium">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Protocol</span>
            </a>
            <div className="w-px h-6 bg-slate-200 hidden sm:block"></div>
            <div className="flex items-center gap-2.5">
              <BeamioBrandLogo className="w-8 h-8 rounded-lg object-cover shadow-sm" />
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#os-matrix" className="hover:text-[#1562f0] transition-colors">OS Matrix</a>
            <a href="#traffic" className="hover:text-[#1562f0] transition-colors">Local Network</a>
          </div>
          
          <div className="flex items-center gap-4">
            <a href="https://biz.beamio.app" target="_blank" rel="noreferrer" className="px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-full hover:bg-slate-800 transition-all shadow-md flex items-center gap-2">
              Business Login <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </nav>

      {/* Hero 首屏 */}
      <header className="relative pt-24 pb-20 overflow-hidden bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 border border-red-100 text-red-600 text-sm font-bold mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            Sorry, we're not here to replace your POS system.
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-8 leading-tight text-slate-900">
            Redefining physical margins. <br className="hidden md:block" />
            Your <span className="text-[#1562f0]">Digital Store OS.</span>
          </h1>
          
          <p className="max-w-3xl mx-auto text-xl text-slate-600 mb-12 leading-relaxed">
            Seamlessly integrate with next-gen clearing infrastructure. Bypass the 2.4% legacy card surcharge without changing your hardware, and upgrade your storefront into a local traffic distribution node via smart contracts.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#os-matrix" className="w-full sm:w-auto px-8 py-4 bg-[#1562f0] hover:bg-[#1250c4] text-white text-lg font-bold rounded-full flex items-center justify-center transition-all shadow-lg shadow-[#1562f0]/30 hover:-translate-y-0.5">
              Deploy SoftPOS Instantly
            </a>
            <a href="#traffic" className="w-full sm:w-auto px-8 py-4 bg-[#f8fafc] border border-slate-200 hover:bg-slate-50 text-slate-700 text-lg font-bold rounded-full flex items-center justify-center transition-all">
              Explore Affiliate Network
            </a>
          </div>
        </div>
      </header>

      {/* 商业痛点 vs 解决方案 */}
      <section className="py-20 bg-[#f8fafc] border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Legacy Issues */}
            <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
              <h3 className="text-2xl font-bold mb-8 text-slate-800 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-lg">✕</span>
                Legacy Isolated Storefronts
              </h3>
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <BadgeCent className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-800">Predatory Margin Squeeze</p>
                    <p className="text-slate-500 text-sm mt-1">Forced to absorb or pass on up to 2.4% in credit card surcharges, destroying customer loyalty.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <ShieldCheck className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-800">Months-long Chargeback Risks</p>
                    <p className="text-slate-500 text-sm mt-1">Asynchronous settlement leaves merchants vulnerable to malicious chargebacks with zero protection.</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Beamio Solution */}
            <div className="bg-slate-900 p-10 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden text-white transform md:-translate-y-4">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#1562f0]"></div>
              <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#1562f0]/20 text-[#1562f0] flex items-center justify-center text-lg">✓</span>
                The Beamio OS Track
              </h3>
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <Zap className="w-6 h-6 text-[#1562f0] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-white">0% Swipe Fees, Sub-second Settlement</p>
                    <p className="text-slate-400 text-sm mt-1">Powered by USDC underlying clearing. 100% of sales principal lands instantly in your autonomous wallet.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <Users className="w-6 h-6 text-[#1562f0] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-white">0% Fraud Decentralized Traffic</p>
                    <p className="text-slate-400 text-sm mt-1">Cryptographic locks guarantee absolute solvency. Smart contracts turn neighboring stores into your passive lead generators.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* OS Matrix 应用下载矩阵 */}
      <section id="os-matrix" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-4">Full-stack coverage. Deploy in minutes.</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              Zero hardware costs. Download the Beamio ecosystem matrix to start the next-generation clearing network.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
            {/* Merchant Suite */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <Store className="w-6 h-6 text-[#1562f0]" />
                <h3 className="text-2xl font-bold text-slate-900">For Merchants</h3>
                <span className="px-3 py-1 bg-blue-50 text-[#1562f0] text-xs font-bold rounded-full">Business Suite</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-6 h-[calc(100%-4rem)]">
                {/* SoftPOS */}
                <div className="bg-[#f8fafc] rounded-3xl p-8 border border-slate-200 hover:border-[#1562f0]/30 transition-colors flex flex-col h-full">
                  <h4 className="text-xl font-bold mb-2">Beamio SoftPOS</h4>
                  <p className="text-slate-500 text-sm mb-8 flex-grow">Instantly transform your smartphone into a financial-grade clearing node. Accept payments with zero hardware.</p>
                  <div className="space-y-3">
                    <a href="https://apps.apple.com/ca/app/beamio-softpos/id6763462151" target="_blank" rel="noreferrer" className="flex justify-center transition-opacity hover:opacity-80">
                      <img src="/app-store-badge.png" alt="Download on the App Store" className="h-12 w-auto max-w-full" />
                    </a>
                    <a href="https://play.google.com/store/apps/details?id=com.beamio.app&pcampaignid=web_share" target="_blank" rel="noreferrer" className="flex justify-center transition-opacity hover:opacity-80">
                      <img src="/google-play-badge.png" alt="Get it on Google Play" className="h-12 w-auto max-w-full" />
                    </a>
                  </div>
                </div>

                {/* Business OS */}
                <div className="bg-[#f8fafc] rounded-3xl p-8 border border-slate-200 hover:border-[#1562f0]/30 transition-colors flex flex-col h-full">
                  <h4 className="text-xl font-bold mb-2">Business OS</h4>
                  <p className="text-slate-500 text-sm mb-8 flex-grow">Web Console: Financial reconciliation, smart routing, and 1-click digital asset issuance.</p>
                  <div className="space-y-3 pt-1 mt-auto">
                    <a href="https://biz.beamio.app" target="_blank" rel="noreferrer" className="w-full py-4 bg-[#1562f0] text-white rounded-xl flex items-center justify-center gap-2 hover:bg-[#1250c4] font-bold text-sm shadow-md transition-all">
                      Access Web Console <ArrowRight className="w-4 h-4" />
                    </a>
                    <p className="text-center text-xs text-slate-400 mt-2">For desktop browsers</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Consumer App */}
            <div>
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <Users className="w-6 h-6 text-purple-600" />
                <h3 className="text-2xl font-bold text-slate-900">For Consumers</h3>
                <span className="px-3 py-1 bg-purple-50 text-purple-600 text-xs font-bold rounded-full">Wallet</span>
              </div>
              <div className="bg-[#f8fafc] rounded-3xl p-8 border border-slate-200 hover:border-purple-300 transition-colors flex flex-col h-[calc(100%-4rem)]">
                <h4 className="text-xl font-bold mb-2">Beamio App</h4>
                <p className="text-slate-500 text-sm mb-8 flex-grow">Manage digital gift cards, tap-and-pay, and redeem local partner vouchers in sub-seconds.</p>
                <div className="space-y-3 mt-auto">
                  <a href="https://apps.apple.com/us/app/beamio-smart-local-pass/id6755375110" target="_blank" rel="noreferrer" className="flex justify-center transition-opacity hover:opacity-80">
                    <img src="/app-store-badge.png" alt="Download on the App Store" className="h-12 w-auto max-w-full" />
                  </a>
                  <a href="https://play.google.com/store/apps/details?id=com.beamio.app&pcampaignid=web_share" target="_blank" rel="noreferrer" className="flex justify-center transition-opacity hover:opacity-80">
                    <img src="/google-play-badge.png" alt="Get it on Google Play" className="h-12 w-auto max-w-full" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NFC Physical Card Section - 实体黑卡 */}
      <section id="nfc-card" className="py-24 bg-[#f8fafc] border-t border-slate-200 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            
            {/* Visual CSS Card */}
            <div className="relative flex justify-center order-2 lg:order-1 mt-10 lg:mt-0">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[#1562f0]/10 blur-[80px] rounded-full"></div>
              
              <div className="relative w-80 h-48 md:w-96 md:h-56 bg-gradient-to-br from-slate-900 via-slate-800 to-black rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-700 p-6 flex flex-col justify-between transform -rotate-6 hover:rotate-0 transition-transform duration-700 hover:shadow-[0_30px_60px_rgba(21,98,240,0.2)] group cursor-pointer z-10">
                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent rounded-2xl pointer-events-none"></div>
                <div className="flex justify-between items-start relative z-10">
                  <div className="w-12 h-8 bg-slate-200/20 rounded flex items-center justify-center backdrop-blur-sm border border-slate-300/10">
                    <Wifi className="w-6 h-6 text-slate-300 transform rotate-90" />
                  </div>
                  <Lock className="w-5 h-5 text-[#1562f0] group-hover:text-blue-400 transition-colors" />
                </div>
                <div className="relative z-10">
                  <div className="text-slate-400 font-mono text-xs md:text-sm tracking-widest mb-1.5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    NTAG 424 DNA
                  </div>
                  <div className="text-white font-bold text-xl md:text-2xl tracking-[0.2em] uppercase">Beamio Pass</div>
                </div>
              </div>
            </div>

            {/* Copywriting */}
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[#1562f0] text-xs font-bold tracking-widest uppercase mb-6">
                <CreditCard className="w-3.5 h-3.5" /> Physical Entry Point
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-6 leading-tight">
                Bank-grade smart cards for your VIP customers.
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-8">
                Bridge the physical and digital seamlessly. Issue branded physical NFC cards to your premium members, powered by NXP's NTAG 424 DNA technology.
              </p>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="mt-1 w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4 text-[#1562f0]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">Zero-Friction Onboarding</h4>
                    <p className="text-slate-500 text-sm mt-1 leading-relaxed">No app required initially. A single tap on the customer's phone instantly pulls up their digital balance or prompts an App Clip download.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="mt-1 w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4 text-[#1562f0]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">Dynamic Cryptography (SUN)</h4>
                    <p className="text-slate-500 text-sm mt-1 leading-relaxed">Secure Unique NFC (SUN) generates a new cryptographic token on every single tap. Mathematically impossible to clone or skim.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Traffic Section - 同城异业引流网 */}
      <section id="traffic" className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#1562f0]/20 blur-[100px] rounded-full"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <span className="px-4 py-1.5 rounded-full bg-white/10 text-blue-300 text-xs font-bold uppercase tracking-widest mb-6 inline-block">
              Decentralized Affiliate Network
            </span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Break the silos. Build a local network.</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Through smart contracts, your store is no longer an isolated island. Mint "Experience Vouchers" to hook into high-frequency local POS networks, and earn passive revenue by distributing partner vouchers at your own checkout.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-6">
                <span className="font-bold text-blue-400 text-xl">A</span>
              </div>
              <h3 className="text-2xl font-bold mb-2">As a Traffic Distributor (Passive Income)</h3>
              <p className="text-slate-400 mb-6 text-sm">Turn organic foot traffic into pure incremental profit.</p>
              <ul className="space-y-4 text-sm text-slate-300">
                <li className="flex gap-3">
                  <span className="text-[#1562f0] font-bold">1.</span> Dynamic smart receipts push curated local partner vouchers when a customer checks out at your store.
                </li>
                <li className="flex gap-3">
                  <span className="text-[#1562f0] font-bold">2.</span> You instantly receive USDC referral commissions via smart contracts the moment they redeem across the street.
                </li>
              </ul>
            </div>

            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-6">
                <span className="font-bold text-purple-400 text-xl">B</span>
              </div>
              <h3 className="text-2xl font-bold mb-2">As a Traffic Seeker (Precision Acquisition)</h3>
              <p className="text-slate-400 mb-6 text-sm">Performance-based marketing backed by physical fulfillment.</p>
              <ul className="space-y-4 text-sm text-slate-300">
                <li className="flex gap-3">
                  <span className="text-purple-400 font-bold">1.</span> Mount your brand vouchers onto high-frequency local networks (e.g., bustling coffee shops).
                </li>
                <li className="flex gap-3">
                  <span className="text-purple-400 font-bold">2.</span> Funds are cryptographically locked (isReserved); you only pay commission when a new customer actually walks in and verifies.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer / CTA (same as /home) */}
      <footer className="bg-slate-50 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col items-center text-center">

          <div className="w-full flex flex-col md:flex-row justify-between items-center pt-8 border-t border-slate-200 text-xs font-mono text-slate-500">
            <p>© {new Date().getFullYear()} Beamio Core. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="https://github.com/petersunquest/android-init-NDEF/tree/main/src" target="_blank" rel="noreferrer" className="hover:text-slate-900 transition-colors">GitHub</a>
              <a href="https://x.com/beamioapp" target="_blank" rel="noreferrer" className="hover:text-slate-900 transition-colors">X</a>
              <a href="/contact" className="hover:text-slate-900 transition-colors">Contact</a>
              <a href="/terms" className="hover:text-slate-900 transition-colors">Terms</a>
              <a href="/privacy" className="hover:text-slate-900 transition-colors">Privacy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

