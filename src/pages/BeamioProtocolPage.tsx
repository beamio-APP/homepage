import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BeamioBrandLogo from '../components/BeamioBrandLogo';
import {
 Lock,
 ShieldCheck,
 Zap,
 Cpu,
 ArrowRight,
 Menu,
 X,
 Database,
 Box,
 Code2,
 Layers,
 Smartphone,
 Terminal,
 Store,
 CreditCard,
 Gift,
 Share2,
 Download,
 CheckCircle2,
 BookOpen,
 Flame,
 Coins,
 FileText,
 Key,
 Network
} from 'lucide-react';


function Ecosystem({ onBack }: { onBack: () => void }) {
 const content = {
   EN: {
     title: 'The Operating Surfaces.',
     subtitle: 'Beamio is already deployed in real-world closed-loop commerce. Download the apps and deploy the OS to join the trusted clearing rail.',
     consumerApp: {
       badge: 'CONSUMER WALLET',
       title: 'Personal App',
       desc: 'Your digital asset and identity vault. In the AI era, it serves as the ultimate "Human Principal" super-console to manage spending limits and authorize transactions.',
       features: ['Smart Consumption Account', 'isReserved Authorization', 'Cryptographic Identity (@BeamioTag)'],
       btn: 'Download for iOS / Android'
     },
     merchantOS: {
       badge: 'MERCHANT & ISSUER',
       title: 'Alliance & Business OS',
       desc: 'The command center for offline physical retail. Manage loyalty points, verify deterministic solvency, and monitor enterprise fuel packs without centralized databases.',
       features: ['SoftPOS Integration', 'Real-time Clearing Dashboards', 'Voucher & Asset Issuance'],
       btn: 'Access Business Console'
     },
     hardware: {
       badge: 'FUTURE EDGE SURFACE',
       title: 'Genesis G1',
       desc: 'Desktop-Grade Commercial API Gateway. A headless, zero-display micro-base station integrating AI Edge Compute (NPU) and an M2M Spatial Communication Gateway.',
       status: 'Initial design complete. Presale underway.',
       btn: 'Join Presale Waitlist'
     }
   },
   CN: {
     title: '商业运行表面',
     subtitle: 'Beamio 已经投入真实商业闭环运行。下载客户端或部署 OS，立即接入下一代可信清算轨道。',
     consumerApp: {
       badge: '消费者钱包',
       title: 'Personal App (个人端)',
       desc: '您的数字资产与身份金库。在 AI 时代，它是完美的"人类主理人"超级控制台，用于管理消费额度、授权交易并监控下游 AI 代理。',
       features: ['智能消费账户 (ERC-4337)', 'isReserved 状态授权', '密码学去中心化身份 (@BeamioTag)'],
       btn: '下载 iOS / Android 版本'
     },
     merchantOS: {
       badge: '商户与发行方',
       title: 'Alliance & Business OS',
       desc: '线下实体商业的数字指挥中心。管理商圈资产、验证履约前的确定性偿付，并监控企业级燃料池消耗，彻底告别传统中心化数据库。',
       features: ['SoftPOS 无缝集成', '实时清算数据面板', '联名卡与代币发行中心'],
       btn: '进入商户控制台'
     },
     hardware: {
       badge: '未来边缘计算终端',
       title: 'Genesis G1',
       desc: '桌面级商业 API 网关。这不仅是收银终端，而是一台集成了 AI 边缘算力 (NPU)、物理防伪与空间交互 (NFC/UWB) 的无屏幕物理基站。',
       status: '初始设计已完成。预售进行中。',
       btn: '加入预售候补名单'
     }
   }
 };


 const t = content.EN;


 return (
   <div className="min-h-screen bg-slate-50 text-slate-600 font-sans selection:bg-[#1562F0] selection:text-white pb-32">

     <nav className="w-full border-b border-slate-200 bg-white/80 backdrop-blur-md py-4 sticky top-0 z-50 shadow-sm">
       <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
         <div className="flex items-center gap-4 cursor-pointer" onClick={onBack}>
           <ArrowRight className="rotate-180 text-slate-400 hover:text-[#1562F0] transition-colors" size={24} />
           <BeamioBrandLogo className="w-8 h-8 rounded-lg object-cover shadow-lg shadow-blue-500/20" />
           <span className="text-slate-900 font-semibold text-xl tracking-wide hidden sm:block">Beamio</span>
         </div>
         <button onClick={onBack} className="text-xs font-mono border border-slate-300 text-slate-600 px-3 py-1.5 rounded hover:border-[#1562F0] hover:text-[#1562F0] transition-colors">
           Back
         </button>
       </div>
     </nav>


     <header className="max-w-5xl mx-auto px-6 md:px-12 pt-24 pb-16 text-center">
       <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight">{t.title}</h1>
       <p className="text-lg md:text-xl text-slate-500 max-w-3xl mx-auto font-light leading-relaxed">
         {t.subtitle}
       </p>
     </header>


     <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
       {/* Consumer App */}
       <div className="group rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xl shadow-slate-200/50 hover:border-purple-300 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500">
         <div className="h-64 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center relative overflow-hidden border-b border-slate-100">
            {/* Abstract UI */}
            <div className="w-48 h-80 bg-white border border-slate-200 rounded-t-3xl absolute bottom-0 shadow-2xl flex flex-col items-center pt-8 px-4">
               <BeamioBrandLogo className="w-16 h-16 rounded-full object-cover mb-6 shadow-lg shadow-blue-500/30" />
               <div className="w-3/4 h-2 bg-slate-200 rounded-full mb-3"></div>
               <div className="w-1/2 h-2 bg-slate-200 rounded-full mb-8"></div>
               <div className="w-full flex flex-col gap-3">
                   <div className="w-full h-12 bg-slate-50 rounded-xl border border-slate-100"></div>
                   <div className="w-full h-12 bg-slate-50 rounded-xl border border-slate-100"></div>
               </div>
            </div>
         </div>
         <div className="p-8 md:p-10">
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-600 border border-purple-100 rounded text-xs font-mono mb-6">
             <Smartphone size={14} /> {t.consumerApp.badge}
           </div>
           <h2 className="text-3xl font-semibold text-slate-900 mb-4">{t.consumerApp.title}</h2>
           <p className="text-slate-500 mb-8 leading-relaxed h-24">{t.consumerApp.desc}</p>
           <ul className="flex flex-col gap-3 mb-10">
             {t.consumerApp.features.map((feat, i) => (
               <li key={i} className="flex items-center gap-3 text-sm text-slate-600">
                 <CheckCircle2 size={16} className="text-[#1562F0]" /> {feat}
               </li>
             ))}
           </ul>
           <a href="https://beamio.app/app/" target="_blank" rel="noopener noreferrer" className="w-full py-4 bg-slate-900 text-white rounded font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20">
             <Download size={18} /> {t.consumerApp.btn}
           </a>
         </div>
       </div>


       {/* Merchant OS */}
       <div className="group rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xl shadow-slate-200/50 hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500">
         <div className="h-64 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center relative overflow-hidden px-8 border-b border-slate-100">
            {/* Abstract Dashboard UI Mockup */}
            <div className="w-full max-w-md h-48 bg-white border border-slate-200 rounded-t-xl absolute bottom-0 shadow-2xl flex flex-col p-4">
               <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                  <div className="w-24 h-3 bg-slate-200 rounded-full"></div>
                  <div className="w-8 h-8 bg-slate-100 rounded-md"></div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="h-20 bg-slate-50 rounded-lg border border-slate-100 p-3 flex flex-col justify-end">
                     <div className="w-16 h-2 bg-purple-500 rounded-full mb-1"></div>
                     <div className="w-8 h-2 bg-slate-300 rounded-full"></div>
                  </div>
                  <div className="h-20 bg-slate-50 rounded-lg border border-slate-100 p-3 flex flex-col justify-end">
                     <div className="w-12 h-2 bg-[#1562F0] rounded-full mb-1"></div>
                     <div className="w-10 h-2 bg-slate-300 rounded-full"></div>
                  </div>
               </div>
            </div>
         </div>
         <div className="p-8 md:p-10">
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 text-[#1562F0] rounded text-xs font-mono mb-6">
             <Terminal size={14} /> {t.merchantOS.badge}
           </div>
           <h2 className="text-3xl font-semibold text-slate-900 mb-4">{t.merchantOS.title}</h2>
           <p className="text-slate-500 mb-8 leading-relaxed h-24">{t.merchantOS.desc}</p>
           <ul className="flex flex-col gap-3 mb-10">
             {t.merchantOS.features.map((feat, i) => (
               <li key={i} className="flex items-center gap-3 text-sm text-slate-600">
                 <ShieldCheck size={16} className="text-[#1562F0]" /> {feat}
               </li>
             ))}
           </ul>
           <a href="https://biz.beamio.app/biz/" target="_blank" rel="noopener noreferrer" className="w-full py-4 bg-white border border-slate-300 text-slate-900 rounded font-medium hover:bg-slate-50 hover:border-[#1562F0] transition-colors flex items-center justify-center gap-2">
              {t.merchantOS.btn} <ArrowRight size={18} />
           </a>
         </div>
       </div>


       {/* Genesis G1 Hardware Preview (Full Width) */}
       <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col md:flex-row items-center relative group mt-8">
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-400/10 blur-[100px] rounded-full pointer-events-none"></div>


          <div className="w-full md:w-1/2 p-8 md:p-16 relative z-10">
             <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 border border-orange-200 rounded text-xs font-mono text-orange-600 mb-6">
               <Cpu size={14} /> {t.hardware.badge}
             </div>
             <h2 className="text-4xl font-semibold text-slate-900 mb-4">{t.hardware.title}</h2>
             <p className="text-slate-500 mb-6 leading-relaxed text-lg">{t.hardware.desc}</p>

             <div className="flex items-center gap-3 mb-10">
                <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shadow-[0_0_8px_#F97316]"></div>
                <span className="text-sm font-mono text-orange-600 uppercase tracking-wide">{t.hardware.status}</span>
             </div>


             <button className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded font-medium hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg shadow-orange-500/30">
               <Lock size={16} /> {t.hardware.btn}
             </button>
          </div>


          <div className="w-full md:w-1/2 h-80 md:h-full min-h-[400px] relative flex items-center justify-center p-8 bg-slate-50/50 border-l border-slate-100">
             <div className="relative w-64 h-64 flex items-center justify-center group-hover:scale-105 transition-transform duration-700">
                {/* The Box - Now Frosted Glass / Metallic feel */}
                <div className="absolute inset-0 bg-white/80 backdrop-blur-md rounded-xl border border-white shadow-2xl transform rotate-12 flex items-center justify-center">
                   <div className="w-full h-[1px] bg-slate-200 absolute top-8"></div>
                   <div className="w-full h-[1px] bg-slate-200 absolute bottom-8"></div>
                   <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-2 p-2">
                      <div className="w-1 h-4 bg-slate-300 rounded-full"></div>
                      <div className="w-1 h-4 bg-slate-300 rounded-full"></div>
                   </div>
                   {/* Orange status LED */}
                   <div className="absolute left-6 top-6 w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_15px_#F97316]"></div>
                </div>
                <div className="absolute w-full h-full border border-orange-500/20 rounded-xl transform rotate-12 scale-110"></div>
                <div className="absolute w-full h-full border border-purple-500/10 rounded-xl transform rotate-12 scale-125"></div>
             </div>
          </div>
       </div>


     </div>
   </div>
 );
}


function Whitepaper({ onBack, initialScrollToSection }: { onBack: () => void; initialScrollToSection?: string }) {
 const content = {
   EN: {
     badge: 'TECHNICAL SPECIFICATION',
     title: 'Beamio Commerce Protocol (BCP)',
     version: 'Version: v3.2 (Final Architecture Edition)',
     sidebar: ['1. Dual-Chain Architecture', '2. Account Model', '3. Atomic Asset Container', '4. Identity & Social', '5. Smart Settlement', '6. AI-Native RPC'],
     sections: [
       {
         id: '1',
         title: '1. Hybrid Dual-Chain Network',
         icon: <Network size={20} />,
         body: 'BCP physically decouples Value Settlement from Data Sovereignty to resolve the central paradox of Web3 commercialization: achieving financial-grade settlement security while enabling zero-marginal-cost social interaction.',
         subsections: [
           { subtitle: 'Chain A: Value Settlement (Base L2)', text: 'Anchored by Ethereum security. Utilized exclusively for high-value asset finality (USDC / ERC-20) and unified management of coupons and memberships via the ERC-1155 standard.' },
           { subtitle: 'Chain B: Data & Identity (CoNET L1)', text: 'An independent, high-performance Sovereign Data Ledger. Processes identity resolution (@BeamioTag), social graph storage, and privacy metadata. BCP strictly adheres to a "No Central Database" principle.' }
         ]
       },
       {
         id: '2',
         title: '2. Tethered Hybrid Account Model',
         icon: <Lock size={20} />,
         body: 'BCP defines a tethered dual-account model, explicitly delineating the permission boundaries between "Cold Storage" and "Hot Execution" for the Agentic Economy.',
         subsections: [
           { subtitle: 'The Vault (EOA)', text: 'The user\'s secure capital vault and L1 identity root. Restricted to signing authorizations for fund transfers. Does not participate in high-frequency logic.' },
           { subtitle: 'Smart Consumption Account (ERC-4337)', text: 'A "Programmable Commercial Wallet" (AA). It aggregates USDC, Points, and Vouchers, and executes smart routing and discount computation directly via smart contracts.' }
         ],
         code: {
           title: 'ERC-4337 Spending Limit Enforcer',
           snippet: `// Restrict AI Agent to $50 daily limit for specific merchants
require(agentSpend[agentId] + amount <= 50 * 10**6, "Limit Exceeded");
require(merchantAllowlist[targetMerchant], "Unauthorized Endpoint");`
         }
       },
       {
         id: '3',
         title: '3. Atomic Asset Container (AAC)',
         icon: <Box size={20} />,
         body: 'Standard EVM assets are architected for synchronous transfers. Real-world commerce introduces a "State Gap." The AAC wraps assets into programmable containers to prevent Double-Spend Vulnerabilities and Agentic Uncertainty.',
         callout: {
           title: 'The isReserved Mechanism',
           text: 'Upon initiation of a distribution request, the contract triggers the Reserve function. The protocol logically deducts assets from the Available Balance and flags them on-chain with an isReserved status, guaranteeing 100% deterministic solvency before fulfillment.'
         },
         subsections: [
           { subtitle: 'Lifecycle State Machine', text: 'Created → Reserved (Locked) → Redeemed (Claimed) OR Cancelled/Rolled Back (Expired).' }
         ]
       },
       {
         id: '4',
         title: '4. Identity & Social Sovereignty',
         icon: <Key size={20} />,
         body: 'Beamio discards the Web2 centralized database model. Fan relationships and followers are on-chain assets (owned by merchants), eliminating platform-level censorship.',
         subsections: [
           { subtitle: 'Beamio Decentralized Identity (BDID)', text: 'The @BeamioTag is a native asset on the CoNET chain. It serves as the routing identifier for Wallet-to-Wallet Encrypted Chat via the DePIN network.' },
           { subtitle: 'Zero-Knowledge Recovery', text: 'Private keys are sharded and encrypted across P2P network nodes. Users can reconstruct keys locally using a mnemonic credential (@BeamioTag + Password) without any centralized custodian.' }
         ]
       },
       {
         id: '5',
         title: '5. Cascading Smart Settlement',
         icon: <Layers size={20} />,
         body: 'BCP provides an "Asset-Agnostic" payment experience. The protocol executes requests according to a strict priority hierarchy to optimize liquidity.',
         subsections: [
           { subtitle: 'Priority 1 (Liability Layer)', text: 'Verification and deduction of Vouchers and Points (Merchant Liability).' },
           { subtitle: 'Priority 2 (Liquidity Layer)', text: 'Deduction of USDC balance within the Smart Consumption Account.' },
           { subtitle: 'Priority 3 (Funding Layer)', text: 'Automatic pulling of funds from the EOA (optional).' }
         ]
       },
       {
         id: '6',
         title: '6. AI-Native RPC & Developer SDK',
         icon: <Terminal size={20} />,
         body: 'As a decentralized protocol, Beamio does not provide centralized API services. Developers and AI Agents communicate directly with blockchain nodes.',
         subsections: [
           { subtitle: 'Infrastructure Layer: JSON-RPC', text: 'Send eth_sendUserOperation directly to Base nodes to trigger transfers. Request CoNET nodes to resolve @BeamioTag. Permissionless, Censorship Resistant, Always Online.' },
           { subtitle: 'Application Layer: LLM-Standard Schema', text: 'The Beamio SDK provides an LLM-standard Schema, allowing Large Language Models to read on-chain data and construct complex clearing transactions natively.' }
         ]
       }
     ]
   },
   CN: {
     badge: '技术规格说明书',
     title: 'Beamio 商业协议 (BCP)',
     version: '版本: v3.2 (最终架构版)',
     sidebar: ['1. 双链混合架构', '2. 混合账户模型', '3. 原子资产容器', '4. 身份与数据主权', '5. 智能级联结算', '6. AI 原生 RPC'],
     sections: [
       {
         id: '1',
         title: '1. 双链混合架构 (Dual-Chain)',
         icon: <Network size={20} />,
         body: 'BCP 在物理上将"价值结算"与"数据主权"剥离，彻底解决了 Web3 商业化的核心悖论：既要实现金融级别的结算安全性，又要实现边际成本为零的高频社交与数据存储。',
         subsections: [
           { subtitle: 'Chain A: 价值结算层 (Base L2)', text: '锚定以太坊的安全共识。专用于高价值资产 (USDC) 的最终结算，并利用 ERC-1155 标准统一管理代金券和身份会员，支持批量铸造 (Batch Minting)。' },
           { subtitle: 'Chain B: 数据与身份层 (CoNET L1)', text: '独立的高性能主权数据账本。处理 @BeamioTag 身份解析、社交图谱存储和隐私通信元数据。严格遵循"无中心化数据库"原则。' }
         ]
       },
       {
         id: '2',
         title: '2. 锚定式混合账户模型',
         icon: <Lock size={20} />,
         body: 'BCP 定义了双账户模型，为 AI 代理经济明确划定了"冷存储 (Cold Storage)"与"热执行 (Hot Execution)"的权限边界。',
         subsections: [
           { subtitle: '主账户金库 (The Vault / EOA)', text: '用户的资金安全底座与 L1 身份根。仅限对资金划转授权进行签名，绝不参与高频商业逻辑。' },
           { subtitle: '智能消费账户 (ERC-4337 / AA)', text: '"可编程的商业钱包"。混合托管 USDC 与代金券，直接在智能合约内执行智能路由与预留锁定逻辑。' }
         ],
         code: {
           title: 'ERC-4337 AI 代理消费限额合约 (伪代码)',
           snippet: `// 为特定 AI 代理设定每日 $50 限额与商户白名单\nrequire(agentSpend[agentId] + amount <= 50 * 10**6, "Limit Exceeded");\nrequire(merchantAllowlist[targetMerchant], "Unauthorized Endpoint")`
         }
       },
       {
         id: '3',
         title: '3. 原子资产容器 (AAC)',
         icon: <Box size={20} />,
         body: '标准的 EVM 资产专为同步原子传输设计。而现实商业（如扫码核销、AI 代理预订）存在关键的"状态时间差 (State Gap)"。AAC 将资产封装进可编程容器，彻底消除双花攻击与代理不确定性。',
         callout: {
           title: 'isReserved 预留锁定机制',
           text: '在发起离线分发请求时，合约触发 Reserve 函数。协议在逻辑上从"可用余额"中扣除资产，并在链上标记 isReserved 状态。这在履约前为商户提供了 100% 的确定性偿付证明 (Deterministic Solvency)。'
         },
         subsections: [
           { subtitle: '生命周期状态机', text: '创建 (Initialized) → 锁定预留 (Reserved) → 提取核销 (Redeemed) 或 过期回滚 (Rolled Back)。' }
         ]
       },
       {
         id: '4',
         title: '4. 身份与社交主权',
         icon: <Key size={20} />,
         body: 'Beamio 彻底摒弃 Web2 中心化数据库。粉丝关系与社交图谱均作为链上资产存储在 CoNET L1，商户拥有绝对所有权，平台无法封禁或删除。',
         subsections: [
           { subtitle: '去中心化身份 (BDID)', text: '@BeamioTag 是 CoNET 链上的原生资产，作为点对点 (P2P) 加密通信与资产路由的唯一标识符。' },
           { subtitle: '零知识私钥恢复 (ZK-Recovery)', text: '用户私钥被分片加密分布在 P2P 网络节点中。用户只需提供 (@BeamioTag + 密码) 即可在本地重构私钥，无需任何中心化托管机构介入。' }
         ]
       },
       {
         id: '5',
         title: '5. 智能级联结算 (Cascading Settlement)',
         icon: <Layers size={20} />,
         body: 'BCP 提供"资产无感 (Asset-Agnostic)"的支付体验。智能合约会根据严格的优先级层次自动执行支付请求，以最大化资金利用率。',
         subsections: [
           { subtitle: '优先级 1 (负债层)', text: '优先验证并扣减商户发行的代金券和积分 (Vouchers & Points)。' },
           { subtitle: '优先级 2 (流动性层)', text: '扣减智能消费账户 (AA) 内的 USDC 余额。' },
           { subtitle: '优先级 3 (资金注入层)', text: '从主账户金库 (EOA) 自动拉取资金（需事先授权）。' }
         ]
       },
       {
         id: '6',
         title: '6. AI 原生 RPC 与开发者 SDK',
         icon: <Terminal size={20} />,
         body: '作为一个去中心化协议，Beamio 不提供任何中心化的 API 接口。开发者和 AI 代理直接与区块链节点网络进行通信。',
         subsections: [
           { subtitle: '基础设施层: JSON-RPC ("The Truth")', text: '直接向 Base 节点发送 eth_sendUserOperation 触发资产转移，或向 CoNET 节点解析 @BeamioTag。无需 API Key，抗审查，永远在线。' },
           { subtitle: '应用层: LLM-Standard Schema', text: 'Beamio SDK 原生提供适配大型语言模型 (LLM) 的 Schema，允许 AI Agent 轻松读取链上状态并直接构建复杂的清算交易代码。' }
         ]
       }
     ]
   }
 };


 const t = content.EN;


 const scrollToSection = (id: number) => {
   const element = document.getElementById(`wp-section-${id}`);
   if (element) {
     element.scrollIntoView({ behavior: 'smooth', block: 'start' });
   }
 };


 useEffect(() => {
   if (initialScrollToSection) {
     const el = document.getElementById(`wp-section-${initialScrollToSection}`);
     if (el) {
       setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
     }
   }
 }, [initialScrollToSection]);


 return (
   <div className="min-h-screen bg-slate-50 text-slate-600 font-sans selection:bg-[#1562F0] selection:text-white pb-32">
     <nav className="w-full border-b border-slate-200 bg-white/80 backdrop-blur-md py-4 sticky top-0 z-50 shadow-sm">
       <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
         <div className="flex items-center gap-4 cursor-pointer" onClick={onBack}>
           <ArrowRight className="rotate-180 text-slate-400 hover:text-[#1562F0] transition-colors" size={24} />
           <BeamioBrandLogo className="w-8 h-8 rounded-lg object-cover shadow-lg shadow-blue-500/20" />
           <span className="text-slate-900 font-semibold text-xl tracking-wide hidden sm:block">Beamio</span>
         </div>
         <button onClick={onBack} className="text-xs font-mono border border-slate-300 text-slate-600 px-3 py-1.5 rounded hover:border-[#1562F0] hover:text-[#1562F0] transition-colors">
           Back
         </button>
       </div>
     </nav>


     <main className="max-w-7xl mx-auto px-6 md:px-12 pt-16 pb-16 flex flex-col lg:flex-row gap-12 items-start">

       {/* Sticky Sidebar */}
       <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-28">
         <div className="mb-6">
           <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-[#1562F0] mb-4 border border-blue-100">
              <FileText size={20} />
           </div>
           <h3 className="text-slate-900 font-bold text-lg mb-1">Contents</h3>
           <p className="text-xs font-mono text-slate-400">{t.version}</p>
         </div>
         <ul className="flex flex-col gap-2 border-l-2 border-slate-200">
           {t.sidebar.map((item, idx) => (
             <li key={idx}>
               <button
                 type="button"
                 onClick={() => scrollToSection(idx + 1)}
                 className="text-left w-full pl-4 py-1.5 text-sm text-slate-500 hover:text-[#1562F0] hover:border-l-2 hover:-ml-[2px] hover:border-[#1562F0] transition-all cursor-pointer"
               >
                 {item}
               </button>
             </li>
           ))}
         </ul>
       </aside>


       {/* Document Content */}
       <div className="flex-1 max-w-4xl bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 p-8 md:p-12 lg:p-16">
         <div className="mb-16 border-b border-slate-100 pb-10">
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-600 border border-purple-100 rounded text-xs font-mono mb-6">
             <BookOpen size={14} /> {t.badge}
           </div>
           <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">{t.title}</h1>
           <p className="text-slate-500 text-lg leading-relaxed">
             A decentralized, full-stack interaction standard engineered for the Agentic Economy and Real-World Commerce.
           </p>
         </div>


         <div className="space-y-20">
           {t.sections.map((sec) => (
             <div key={sec.id} id={`wp-section-${sec.id}`} className="scroll-mt-32">
               <div className="flex items-center gap-4 mb-6">
                 <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-[#1562F0] shadow-sm">
                   {sec.icon}
                 </div>
                 <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                   {sec.title}
                 </h2>
               </div>

               <p className="text-lg text-slate-600 leading-relaxed mb-8">
                 {sec.body}
               </p>


               {sec.callout && (
                 <div className="mb-8 p-6 bg-blue-50 border border-blue-100 rounded-xl relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-1 h-full bg-[#1562F0]"></div>
                   <h4 className="text-[#1562F0] font-bold mb-2 flex items-center gap-2">
                      <Zap size={18} /> {sec.callout.title}
                   </h4>
                   <p className="text-slate-700 text-sm leading-relaxed">{sec.callout.text}</p>
                 </div>
               )}


               {sec.subsections && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                   {sec.subsections.map((sub, i) => (
                     <div key={i} className="p-5 rounded-xl border border-slate-100 bg-slate-50">
                       <h4 className="text-slate-900 font-bold mb-2 text-sm">{sub.subtitle}</h4>
                       <p className="text-slate-500 text-sm leading-relaxed">{sub.text}</p>
                     </div>
                   ))}
                 </div>
               )}


               {sec.code && (
                 <div className="rounded-xl border border-slate-800 bg-[#0F172A] overflow-hidden shadow-lg mb-8">
                   <div className="flex items-center px-4 py-2 border-b border-slate-800 bg-[#0B1120]">
                     <span className="text-xs font-mono text-slate-400">{sec.code.title}</span>
                   </div>
                   <div className="p-6 text-sm font-mono text-slate-300 overflow-x-auto">
                     <pre className="whitespace-pre-wrap">{sec.code.snippet}</pre>
                   </div>
                 </div>
               )}
             </div>
           ))}
         </div>


         <div className="mt-20 pt-10 border-t border-slate-200 flex justify-center">
           <button onClick={onBack} className="px-8 py-3 bg-slate-900 text-white rounded font-medium hover:bg-slate-800 transition-colors shadow-md">
             Back to Home
           </button>
         </div>
       </div>


     </main>
   </div>
 );
}


export default function BeamioProtocolPage() {
 const [isScrolled, setIsScrolled] = useState(false);
 const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
 const [currentPage, setCurrentPage] = useState<'home' | 'ecosystem' | 'whitepaper'>('home');
 const [whitepaperScrollTo, setWhitepaperScrollTo] = useState<string | null>(null);


 const content = {
   EN: {
     nav: [
       { label: 'Architecture', href: 'section-architecture' },
       { label: 'Economics', href: 'section-economy' },
       { label: 'Sandbox', to: '/homeExample' },
     ],
     heroSub: 'Connecting physical storefronts to the AI future. A dual-chain protocol delivering sub-second, zero-hardware USDC settlement with absolute cryptographic solvency.',
     ctaPrimary: 'Explore the Protocol',
     ctaSecondary: 'Read Whitepaper v3.2',
     problemTitle: 'The Trust Gap',
     problemHeadline: 'Commerce breaks when authorization, funds, and fulfillment fall out of sync.',
     problemSub: 'Without reservation, merchants cannot verify solvency before fulfillment. This asynchronous gap is the root cause of chargebacks and double-spending.',
     wedgeTitle: 'Deterministic Solvency',
     wedgeHeadline: 'Others verify agents. Beamio verifies solvency before fulfillment.',
     wedgeDesc: 'Beamio is not built for manual one-off payments. It is engineered for delegated execution. We introduce the missing clearing layer: mathematically reserved funds that merchants can cryptographically verify before they fulfill an order.',
     archTitle: 'Protocol Architecture',
     archHeadline: 'Engineered for the Agentic Economy.',
     archSub: 'We rebuilt the commercial stack from the ground up. Zero centralized databases, fully programmable, and native to both humans and autonomous agents.',
     archCards: [
       { title: 'Dual-Chain Architecture', desc: 'Base L2 for settlement finality and security. CoNET L1 for data sovereignty. Zero centralized databases.' },
       { title: 'Atomic Asset Containers', desc: 'Programmable wrappers with the isReserved state, ensuring deterministic solvency before fulfillment.' },
       { title: 'ERC-4337 Smart Accounts', desc: 'Programmable commercial wallets enabling humans to set hyper-granular spending boundaries for autonomous agents.' },
       { title: 'AI-Native RPC & Schema', desc: 'No centralized API keys. LLM-standard schema allows agents to read chain data and construct transactions directly.' }
     ],
     flowKicker: 'State Machine',
     flowTitle: 'The Verifiable Lifecycle.',
     flowSteps: [
       { title: 'Authorize', desc: 'User signs intent' },
       { title: 'Reserve', desc: 'Soft Lock' },
       { title: 'Accept', desc: 'Merchant verifies' },
       { title: 'Fulfill', desc: 'Goods delivered' },
       { title: 'Settle / Roll Back', desc: 'Atomic finality' }
     ],
     liveTitle: 'Richmond Sandbox Live',
     liveHeadline: 'Proven in the physical world.',
     liveSub: 'We didn\'t just bypass the 2.4% legacy surcharge. We provided merchants with a full-suite blockchain marketing OS and a decentralized traffic-sharing network.',
     liveMetrics: [
       { value: '100', suffix: '%', label: 'On-Chain Finality' },
       { value: '0', suffix: '%', label: 'Interaction Failure Rate', accent: true }
     ],
     liveItems: [
       { title: 'Zero-Hardware SoftPOS', desc: 'Accept sub-second offline USDC payments using existing smart devices. Instantly reclaim the 2.4% lost to legacy credit card processing networks.' },
       { title: 'NTAG 424 Physical Edge', desc: 'Bank-grade dynamic cryptography (SUN). Hardware-level endpoints that bridge offline physical intent seamlessly to on-chain isReserved states.' },
       { title: 'Blockchain Marketing OS', desc: 'Mint unforgeable digital memberships, stored-value cards, and smart coupons directly to consumers\' wallets using the ERC-1155 standard.' },
       { title: 'Cross-Border Traffic Routing', desc: 'Break physical silos. Distribute partner vouchers at checkout and earn automated USDC commissions via smart contracts when redeemed elsewhere.' }
     ],
     liveMoatTitle: 'Regulatory Moat: Canada RPAA Section 6 Compliant',
     liveMoatDesc: 'Physical fund isolation and non-custodial routing qualify Beamio for the Closed-Loop Exemption. Zero Money Services Business (MSB) licensing friction for rapid hyper-scaling.',
     genesisTitle: 'CashTrees & Genesis',
     genesisDesc: 'CashTrees is our first branded deployment template. From NFC tap-to-acquire to real-world checkout settlement, proving trusted clearing in offline F&B networks.',
     expansionKicker: 'Master Plan',
     expansionTitle: 'The Expansion Path.',
     expansionHeadline: 'One deterministic rail. Multiple operating surfaces.',
     expansionSteps: [
       { phase: 'Phase 1 — Live', title: 'Branded Networks', desc: 'Proving trusted clearing in live commerce. Zero-hardware deployment across retail and F&B physical endpoints.', color: 'emerald' },
       { phase: 'Phase 2 — Scaling', title: 'Online Apps', desc: 'Extending the deterministic rail to consumer applications, digital marketplaces, and e-commerce checkouts.', color: 'blue' },
       { phase: 'Phase 3 — The Vision', title: 'AI Agents', desc: 'Programmable commerce executed seamlessly by autonomous agents without human intervention or chargeback risks.', color: 'purple' }
     ],
     economyTitle: 'The Clearing Fuel',
     economyHeadline: 'Zero-Gas Experience via B-Units.',
     economyDesc: 'To abstract away the complexities of Web3 gas fees for everyday consumers and merchants, Beamio introduces B-Units—a shadow accounting system. It enables seamless delegated transactions while driving real revenue through merchant clearing.',
     economyItems: [
       {
         title: '1.00 B-Unit = $0.01 USDC Value Anchor',
         desc: 'Completely transparent, gasless UX for end-users. 100% stablecoin backed.'
       },
       {
         title: '2.00% Logic Tax',
         desc: 'Merchant-paid clearing tax for heavy real-world settlement. Prevents margin squeeze on high-ticket items.',
         badge: 'Capped @ 10 USDC',
         featured: true
       },
       {
         title: '0.02 USDC Interaction Fee',
         desc: 'Counter-cyclical, high-frequency cash flow for physical point-of-sale verification.',
         badge: 'Per Tap'
       },
       {
         title: '1.00 USDC Batch Minting',
         desc: 'Enterprise fuel packs for mass AI agent issuance and O(1) red-packet drops.',
         badge: 'Flat Fee'
       }
     ],
     footerTitle: 'Ready to upgrade your physical storefront?',
     footerSub: 'Step into our Digital Store OS. Discover how local businesses bypass legacy credit card fees and tap into the decentralized traffic network.',
     footerCta: 'Explore Merchant Solutions'
   },
   CN: {
     nav: [
       { label: '协议架构', href: 'section-architecture' },
       { label: '清算燃料', href: 'section-economy' },
       { label: '实体沙盘', to: '/homeExample' },
     ],
     heroSub: '从真实商业闭环开始，延展到应用与 AI Agents。',
     ctaPrimary: '探索协议',
     ctaSecondary: '阅读白皮书 v3.2',
     problemTitle: '信任裂痕 (Trust Gap)',
     problemHeadline: '当授权、资金与履约失去同步，商业协作就会中断。',
     problemSub: '如果没有资金预留，商户无法在发货前确认对方具备偿付能力。',
     wedgeTitle: '确定性偿付',
     wedgeHeadline: '别人只验证代理的身份，Beamio 在履约前验证资金。',
     wedgeDesc: 'Beamio 的核心原语不是为"单次人工支付"设计，而是为"委托执行"打造。我们补齐了缺失的清算层：在履约前可验证的保留资金。彻底消除双花攻击风险与退单不确定性。',
     archTitle: '底层技术原语',
     archHeadline: '专为 AI 代理经济打造的协议架构。',
     archSub: 'We rebuilt the commercial stack from the ground up. Zero centralized databases, fully programmable, and native to both humans and autonomous agents.',
     archCards: [
       { title: '双链混合架构 (Dual-Chain)', desc: 'Base L2 负责高价值资金的安全结算，CoNET L1 承载数据与身份主权。彻底摒弃中心化数据库。' },
       { title: '原子资产容器 (AAC)', desc: '带有完整生命周期的资产包装器。通过 isReserved 智能合约级锁定，在履约前提供 100% 确定性偿付证明。' },
       { title: '智能消费账户 (ERC-4337)', desc: '可编程的商业钱包引擎。允许人类主理人为下游独立运行的 AI 代理设定精确到微交易的高颗粒度消费边界。' },
       { title: 'AI 原生 RPC 接口', desc: '摒弃传统 API Key。原生提供 LLM 标准 Schema，让大语言模型能够直接读取链上状态并构建复杂的清算交易。' }
     ],
     flowKicker: 'State Machine',
     flowTitle: 'The Verifiable Lifecycle.',
     flowSteps: [
       { title: 'Authorize', desc: 'User signs intent' },
       { title: 'Reserve', desc: 'Soft Lock' },
       { title: 'Accept', desc: 'Merchant verifies' },
       { title: 'Fulfill', desc: 'Goods delivered' },
       { title: 'Settle / Roll Back', desc: 'Atomic finality' }
     ],
     liveTitle: 'Richmond Sandbox Live',
     liveHeadline: 'Proven in the physical world.',
     liveSub: 'We didn\'t just bypass the 2.4% legacy surcharge. We provided merchants with a full-suite blockchain marketing OS and a decentralized traffic-sharing network.',
     liveMetrics: [
       { value: '100', suffix: '%', label: 'On-Chain Finality' },
       { value: '0', suffix: '%', label: 'Interaction Failure Rate', accent: true }
     ],
     liveItems: [
       { title: 'Zero-Hardware SoftPOS', desc: 'Accept sub-second offline USDC payments using existing smart devices. Instantly reclaim the 2.4% lost to legacy credit card processing networks.' },
       { title: 'NTAG 424 Physical Edge', desc: 'Bank-grade dynamic cryptography (SUN). Hardware-level endpoints that bridge offline physical intent seamlessly to on-chain isReserved states.' },
       { title: 'Blockchain Marketing OS', desc: 'Mint unforgeable digital memberships, stored-value cards, and smart coupons directly to consumers\' wallets using the ERC-1155 standard.' },
       { title: 'Cross-Border Traffic Routing', desc: 'Break physical silos. Distribute partner vouchers at checkout and earn automated USDC commissions via smart contracts when redeemed elsewhere.' }
     ],
     liveMoatTitle: 'Regulatory Moat: Canada RPAA Section 6 Compliant',
     liveMoatDesc: 'Physical fund isolation and non-custodial routing qualify Beamio for the Closed-Loop Exemption. Zero Money Services Business (MSB) licensing friction for rapid hyper-scaling.',
     genesisTitle: 'CashTrees 样板与硬件',
     genesisDesc: 'CashTrees 是首个跑在 Beamio 轨道上的品牌部署样板。从 NFC 挥卡获客到实体商业的真实结算，我们在最复杂的线下餐饮场景中验证了可信清算。',
     expansionKicker: 'Master Plan',
     expansionTitle: 'The Expansion Path.',
     expansionHeadline: 'One deterministic rail. Multiple operating surfaces.',
     expansionSteps: [
       { phase: 'Phase 1 — Live', title: 'Branded Networks', desc: 'Proving trusted clearing in live commerce. Zero-hardware deployment across retail and F&B physical endpoints.', color: 'emerald' },
       { phase: 'Phase 2 — Scaling', title: 'Online Apps', desc: 'Extending the deterministic rail to consumer applications, digital marketplaces, and e-commerce checkouts.', color: 'blue' },
       { phase: 'Phase 3 — The Vision', title: 'AI Agents', desc: 'Programmable commerce executed seamlessly by autonomous agents without human intervention or chargeback risks.', color: 'purple' }
     ],
     economyTitle: '清算燃料体系',
     economyHeadline: '通过 B-Units 实现零 Gas 摩擦体验。',
     economyDesc: '为了向普通消费者和商户抽象掉 Web3 昂贵的 Gas 费用，Beamio 引入了 B-Units 影子计账系统。这使得高频的委托交易得以无缝进行，同时通过商户清算实现真实的商业变现。',
     economyItems: [
       {
         title: '1.00 B-Unit = $0.01 USDC Value Anchor',
         desc: 'Completely transparent, gasless UX for end-users. 100% stablecoin backed.'
       },
       {
         title: '2.00% Logic Tax',
         desc: 'Merchant-paid clearing tax for heavy real-world settlement. Prevents margin squeeze on high-ticket items.',
         badge: 'Capped @ 10 USDC',
         featured: true
       },
       {
         title: '0.02 USDC Interaction Fee',
         desc: 'Counter-cyclical, high-frequency cash flow for physical point-of-sale verification.',
         badge: 'Per Tap'
       },
       {
         title: '1.00 USDC Batch Minting',
         desc: 'Enterprise fuel packs for mass AI agent issuance and O(1) red-packet drops.',
         badge: 'Flat Fee'
       }
     ],
     footerTitle: 'Ready to upgrade your physical storefront?',
     footerSub: 'Step into our Digital Store OS. Discover how local businesses bypass legacy credit card fees and tap into the decentralized traffic network.',
     footerCta: 'Explore Merchant Solutions'
   }
 };


 useEffect(() => {
   const handleScroll = () => {
     setIsScrolled(window.scrollY > 50);
   };
   window.addEventListener('scroll', handleScroll);
   return () => window.removeEventListener('scroll', handleScroll);
 }, []);


 const t = content.EN;

 const scrollToHomeSection = (sectionId: string) => {
   document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
   setMobileMenuOpen(false);
 };


 if (currentPage === 'ecosystem') {
   return <Ecosystem onBack={() => setCurrentPage('home')} />;
 }
  if (currentPage === 'whitepaper') {
   return <Whitepaper onBack={() => { setCurrentPage('home'); setWhitepaperScrollTo(null); }} initialScrollToSection={whitepaperScrollTo ?? undefined} />;
 }


 return (
   <div className="min-h-screen bg-slate-50 text-slate-600 font-sans selection:bg-purple-500 selection:text-white">

     {/* Navigation */}
     <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm py-4' : 'bg-transparent py-6'}`}>
       <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
         <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentPage('home')}>
           <BeamioBrandLogo className="w-8 h-8 rounded-lg object-cover shadow-lg shadow-blue-500/20" />
           <span className="text-slate-900 font-bold text-xl tracking-wide">Beamio</span>
         </div>

         <div className="hidden md:flex items-center gap-8">
           {t.nav.map((item) => (
             item.to ? (
               <Link
                 key={item.to}
                 to={item.to}
                 className="text-sm font-medium text-slate-500 hover:text-[#1562F0] transition-colors"
               >
                 {item.label}
               </Link>
             ) : (
               <a
                 key={item.href}
                 href={`#${item.href}`}
                 onClick={(e) => {
                   e.preventDefault();
                   scrollToHomeSection(item.href!);
                 }}
                 className="text-sm font-medium text-slate-500 hover:text-[#1562F0] transition-colors"
               >
                 {item.label}
               </a>
             )
           ))}
           <a href="https://biz.beamio.app/biz/" target="_blank" rel="noreferrer" className="bg-slate-900 text-white px-5 py-2 text-sm font-medium rounded hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20">
             Beamio OS
           </a>
         </div>


         <button
           type="button"
           className="md:hidden text-slate-500"
           aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
           onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
         >
           {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
         </button>
       </div>

       {mobileMenuOpen && (
         <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-md">
           <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-3">
             {t.nav.map((item) => (
               item.to ? (
                 <Link
                   key={item.to}
                   to={item.to}
                   onClick={() => setMobileMenuOpen(false)}
                   className="text-sm font-medium text-slate-600 hover:text-[#1562F0] transition-colors py-2"
                 >
                   {item.label}
                 </Link>
               ) : (
                 <a
                   key={item.href}
                   href={`#${item.href}`}
                   onClick={(e) => {
                     e.preventDefault();
                     scrollToHomeSection(item.href!);
                   }}
                   className="text-sm font-medium text-slate-600 hover:text-[#1562F0] transition-colors py-2"
                 >
                   {item.label}
                 </a>
               )
             ))}
             <a
               href="https://biz.beamio.app/biz/"
               target="_blank"
               rel="noreferrer"
               onClick={() => setMobileMenuOpen(false)}
               className="self-start bg-slate-900 text-white px-5 py-2.5 text-sm font-medium rounded hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
             >
               Beamio OS
             </a>
           </div>
         </div>
       )}
     </nav>


     {/* Hero Section */}
     <section className="relative pt-40 pb-32 md:pt-52 md:pb-40 px-6 overflow-hidden">
       {/* Modern Bright Fintech Gradients */}
       <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-blue-400/20 blur-[100px] rounded-full pointer-events-none"></div>
       <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[400px] h-[400px] bg-purple-400/20 blur-[120px] rounded-full pointer-events-none"></div>
       <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-orange-400/10 blur-[100px] rounded-full pointer-events-none"></div>

       <div className="max-w-5xl mx-auto text-center relative z-10">
         <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-slate-900 tracking-tight leading-[1.05] mb-8">
           <>The deterministic rail for <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1562F0] via-purple-500 to-orange-500">delegated commerce.</span></>
         </h1>
         <p className="text-lg md:text-2xl text-slate-500 max-w-2xl mx-auto mb-12 font-light">
           {t.heroSub}
         </p>
         <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
           <button onClick={() => document.getElementById('section-architecture')?.scrollIntoView({ behavior: 'smooth' })} className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#1562F0] to-purple-600 text-white rounded font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 group shadow-xl shadow-blue-500/25">
             {t.ctaPrimary}
             <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
           </button>
           <button onClick={() => setCurrentPage('whitepaper')} className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-300 text-slate-700 rounded font-medium hover:bg-slate-50 transition-colors shadow-sm">
             {t.ctaSecondary}
           </button>
         </div>
       </div>
     </section>


     {/* Problem & Wedge Section */}
     <section id="section-0" className="py-24 md:py-32 bg-white border-y border-slate-200">
       <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
         <div>
           <h3 className="text-purple-600 font-mono text-sm tracking-widest uppercase mb-4">{t.problemTitle}</h3>
           <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
             {t.problemHeadline}
           </h2>
           <p className="text-slate-500 text-lg mb-12">
             {t.problemSub}
           </p>


           <div className="pl-6 border-l-4 border-purple-500">
             <h3 className="text-slate-900 text-xl font-bold mb-3">{t.wedgeTitle}</h3>
             <p className="text-slate-600 leading-relaxed">
               {t.wedgeDesc}
             </p>
           </div>
         </div>


         <div className="relative h-[400px] rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden p-8 flex flex-col justify-center shadow-inner">
            <div className="flex flex-col gap-6 relative">
               <div className="flex items-center justify-between w-full relative z-10">
                 <div className="h-2 bg-slate-200 w-[40%] rounded-l-full relative overflow-hidden">
                   <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-slate-200 to-slate-400"></div>
                 </div>
                 <Zap className="text-red-500 mx-4 drop-shadow-md" size={32} />
                 <div className="h-2 bg-slate-200 w-[40%] rounded-r-full relative overflow-hidden"></div>
               </div>

               <div className="flex justify-between text-xs font-mono text-slate-400 uppercase tracking-widest mt-2">
                 <span>Authorization</span>
                 <span>Fulfillment</span>
               </div>


               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 p-5 bg-gradient-to-br from-purple-600 to-[#1562F0] rounded-xl shadow-2xl shadow-purple-500/30 z-20 flex flex-col items-center justify-center text-center transform translate-y-8 border border-white/20">
                  <Lock size={24} className="text-white mb-2" />
                  <span className="text-white font-bold text-sm">isReserved</span>
                  <span className="text-blue-100 text-xs mt-1">Deterministic Solvency</span>
               </div>
            </div>
         </div>
       </div>
     </section>


     {/* Protocol Architecture (Whitepaper Deep Dive) */}
     <section id="section-architecture" className="py-24 md:py-32 bg-slate-50 relative overflow-hidden scroll-mt-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
           <div className="mb-16">
             <h3 className="text-orange-500 font-mono text-sm tracking-widest uppercase mb-4">{t.archTitle}</h3>
             <h2 className="text-3xl md:text-5xl font-bold text-slate-900">{t.archHeadline}</h2>
             <p className="mt-6 max-w-4xl text-lg md:text-xl text-slate-500 leading-relaxed">
               {t.archSub}
             </p>
           </div>


           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 {t.archCards.map((card, idx) => (
                   <div key={idx} className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-purple-300 hover:shadow-xl transition-all group">
                      <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-[#1562F0] group-hover:text-purple-600 transition-colors mb-5">
                         {idx === 0 && <Layers size={22} />}
                         {idx === 1 && <Box size={22} />}
                         {idx === 2 && <Database size={22} />}
                         {idx === 3 && <Code2 size={22} />}
                      </div>
                      <h4 className="text-slate-900 font-bold mb-3">{card.title}</h4>
                      <p className="text-slate-500 text-sm leading-relaxed">{card.desc}</p>
                   </div>
                 ))}
              </div>


              {/* Kept dark specifically to look like a real terminal/code editor */}
              <div className="rounded-xl border border-slate-800 bg-[#0F172A] overflow-hidden shadow-2xl shadow-slate-900/50">
                 <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800 bg-[#0B1120]">
                    <div className="w-3 h-3 rounded-full bg-red-500/80 border border-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80 border border-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/80 border border-green-500"></div>
                    <span className="ml-2 text-xs font-mono text-slate-400">agentic_clearing.ts</span>
                 </div>
                 <div className="p-6 md:p-8 text-sm md:text-base font-mono text-slate-300 overflow-x-auto">
                    <pre className="leading-relaxed">
<span className="text-slate-500">{'// BCP v3.2: AI Agent Autonomous Execution'}</span>{'\n'}
<span className="text-purple-400">const</span> intent = <span className="text-purple-400">await</span> aiAgent.<span className="text-blue-400">parse</span>(request);{'\n'}
{'\n'}
<span className="text-slate-500">{'// 1. Lock funds via Atomic Asset Container'}</span>{'\n'}
<span className="text-purple-400">const</span> tx = <span className="text-purple-400">await</span> beamio.<span className="text-blue-400">reserve</span>({'{'}{'\n'}
{'  '}asset: <span className="text-green-400">{'"USDC"'}</span>,{'\n'}
{'  '}amount: <span className="text-orange-400">100.00</span>,{'\n'}
{'  '}recipient: merchant.<span className="text-blue-400">getBeamioTag</span>(),{'\n'}
{'  '}ttl: <span className="text-green-400">{'"24h"'}</span>{'\n'}
{'}'});{'\n'}
{'\n'}
<span className="text-slate-500">{'// 2. Deterministic Solvency Guaranteed'}</span>{'\n'}
console.<span className="text-blue-400">log</span>(<span className="text-green-400">{'"Solvency locked:"'}</span>, tx.isReserved);{'\n'}
{'\n'}
<span className="text-slate-500">{'// 3. Execute zero-gas state sync on CoNET L1'}</span>{'\n'}
<span className="text-purple-400">await</span> beamio.social.<span className="text-blue-400">syncReceipt</span>(tx.hash);
                    </pre>
                 </div>
              </div>
           </div>
        </div>
     </section>


     {/* B-Units Economy Section */}
     <section id="section-economy" className="py-24 bg-gradient-to-br from-orange-50 to-white border-y border-orange-100 overflow-hidden relative scroll-mt-24">
       <div className="absolute -left-40 -top-40 w-[500px] h-[500px] bg-orange-400/10 blur-[100px] rounded-full pointer-events-none"></div>
       <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
         <div className="order-2 lg:order-1 relative flex justify-center lg:justify-start">
            {/* Abstract Orange Fuel Visualization */}
            <div className="w-72 h-72 md:w-96 md:h-96 relative flex items-center justify-center">
               <div className="absolute inset-0 bg-white rounded-full shadow-2xl border border-orange-100 flex items-center justify-center z-20">
                  <div className="text-center">
                     <Flame size={48} className="text-orange-500 mx-auto mb-2" />
                     <span className="text-3xl font-black text-slate-900">B-Units</span>
                     <p className="text-orange-500 font-mono text-sm mt-1">SHADOW FUEL</p>
                  </div>
               </div>
               {/* Orbiting Elements */}
               <div className="absolute w-full h-full border-[1.5px] border-dashed border-orange-300 rounded-full animate-[spin_20s_linear_infinite]"></div>
               <div className="absolute w-[120%] h-[120%] border-[1px] border-orange-200 rounded-full animate-[spin_30s_linear_infinite_reverse]">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-orange-200 rounded-full flex items-center justify-center shadow-md">
                    <Coins size={14} className="text-orange-500" />
                  </div>
               </div>
            </div>
         </div>

         <div className="order-1 lg:order-2">
           <h3 className="text-orange-500 font-mono text-sm tracking-widest uppercase mb-4">{t.economyTitle}</h3>
           <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
             {t.economyHeadline}
           </h2>
           <p className="text-slate-600 text-lg mb-8 leading-relaxed">
             {t.economyDesc}
           </p>
           <ul className="flex flex-col gap-5">
             {t.economyItems.map((item, i) => (
               <li
                 key={i}
                 className={`relative flex items-start gap-5 rounded-2xl bg-white p-6 border shadow-sm overflow-hidden ${
                   item.featured
                     ? 'border-orange-200 shadow-orange-500/10'
                     : 'border-slate-200'
                 }`}
               >
                 {item.featured && <div className="absolute left-0 top-0 h-full w-1.5 bg-orange-500" />}
                 <div className="mt-1 w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 flex-shrink-0">
                   {i === 0 && <CheckCircle2 size={18} />}
                   {i === 1 && <Terminal size={18} />}
                   {i === 2 && <Zap size={18} />}
                   {i === 3 && <Box size={18} />}
                 </div>
                 <div className="min-w-0 flex-1">
                   <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                     <h4 className="text-xl font-extrabold tracking-tight text-slate-900">
                       {item.title}
                     </h4>
                     {item.badge && (
                       <span className={`self-start rounded-full px-4 py-1 text-xs font-extrabold uppercase tracking-[0.18em] ${
                         item.featured
                           ? 'bg-orange-50 text-orange-600 border border-orange-100'
                           : 'text-slate-400'
                       }`}>
                         {item.badge}
                       </span>
                     )}
                   </div>
                   <p className="mt-3 text-base md:text-lg leading-relaxed text-slate-500">
                     {item.desc}
                   </p>
                 </div>
               </li>
             ))}
           </ul>
         </div>
       </div>
     </section>


     {/* Flow Section (Verifiable Lifecycle) */}
     <section id="section-flow" className="py-24 md:py-32 bg-white border-b border-slate-200 scroll-mt-24">
       <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
         <p className="text-[#1562F0] font-mono text-xs tracking-[0.35em] uppercase mb-4">
           {t.flowKicker}
         </p>
         <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-20">
           {t.flowTitle}
         </h2>

         <div className="relative max-w-6xl mx-auto">
           <div className="hidden md:block absolute top-7 left-8 right-8 h-1 bg-gradient-to-r from-slate-200 via-blue-300 to-slate-200 rounded-full"></div>

           <div className="relative grid grid-cols-1 md:grid-cols-5 gap-10 md:gap-6">
             {t.flowSteps.map((step, idx) => {
               const isActive = idx === 1;

               return (
                 <div
                   key={idx}
                   className="group relative flex flex-col items-center bg-transparent border-0 p-0 text-center"
                 >
                   {idx !== t.flowSteps.length - 1 && <div className="md:hidden w-1 h-10 bg-slate-200 rounded-full order-2 my-3"></div>}

                   <div className={`relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-300 ${
                     isActive
                       ? 'bg-[#1562F0] border-[#1562F0] text-white shadow-[0_0_38px_rgba(21,98,240,0.45)] ring-8 ring-blue-100/80'
                       : 'bg-white border-slate-200 text-slate-400 shadow-sm group-hover:border-[#1562F0]/40 group-hover:text-[#1562F0]'
                   }`}>
                     <span className="text-base font-extrabold">{idx + 1}</span>
                   </div>

                   <h3 className={`mt-6 text-base font-extrabold tracking-tight ${
                     isActive ? 'text-[#1562F0]' : 'text-slate-900'
                   }`}>
                     {step.title}
                   </h3>
                   {isActive ? (
                     <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#1562F0]">
                       <ShieldCheck size={11} />
                       {step.desc}
                     </span>
                   ) : (
                     <p className="mt-3 text-sm text-slate-500">
                       {step.desc}
                     </p>
                   )}
                 </div>
               );
             })}
           </div>
         </div>
       </div>
     </section>


     {/* Already Live / Sandbox Section */}
     <section id="section-1" className="py-24 md:py-32 bg-white border-b border-slate-200">
       <div className="max-w-6xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
             <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.22em] text-emerald-700 mb-6">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]"></span>
                {t.liveTitle}
             </div>
             <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-6">
                {t.liveHeadline}
             </h2>
             <p className="max-w-3xl mx-auto text-base md:text-lg text-slate-500 leading-relaxed">
                {t.liveSub}
             </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-16">
             {t.liveMetrics.map((metric, idx) => (
               <div key={idx} className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-50/60 px-8 py-10 text-center shadow-sm">
                  <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-transparent via-[#1562F0] to-transparent"></div>
                  <div className={`text-6xl md:text-7xl font-black tracking-tighter leading-none ${metric.accent ? 'text-[#1562F0]' : 'text-slate-900'}`}>
                     {metric.value}<span className="text-3xl md:text-4xl">{metric.suffix}</span>
                  </div>
                  <div className="mt-4 text-[10px] md:text-xs font-extrabold uppercase tracking-[0.28em] text-slate-500">
                     {metric.label}
                  </div>
               </div>
             ))}
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-20">
             {t.liveItems.map((item, idx) => (
               <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-8 md:p-10 shadow-sm hover:shadow-lg transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 mb-10">
                     {idx === 0 && <Store size={20} />}
                     {idx === 1 && <CreditCard size={20} />}
                     {idx === 2 && <Gift size={20} />}
                     {idx === 3 && <Share2 size={20} />}
                  </div>
                  <h3 className="text-lg md:text-xl font-extrabold tracking-tight text-slate-900 mb-4">
                     {item.title}
                  </h3>
                  <p className="text-sm md:text-base leading-relaxed text-slate-500">
                     {item.desc}
                  </p>
               </div>
             ))}
          </div>

          <div className="max-w-4xl mx-auto rounded-3xl bg-slate-950 px-8 py-8 md:px-12 md:py-10 shadow-2xl shadow-slate-900/20 flex flex-col md:flex-row items-start gap-7">
             <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-[#1562F0] flex-shrink-0">
                <ShieldCheck size={32} />
             </div>
             <div>
                <h3 className="text-lg md:text-xl font-extrabold tracking-tight text-white mb-3">
                   {t.liveMoatTitle}
                </h3>
                <p className="text-sm md:text-base leading-relaxed text-slate-400">
                   {t.liveMoatDesc}
                </p>
             </div>
          </div>
       </div>
     </section>


     {/* Expansion Path */}
     <section id="section-2" className="py-24 md:py-40 bg-white border-y border-slate-200 overflow-hidden">
       <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
         <p className="text-[#1562F0] font-mono text-xs tracking-[0.35em] uppercase mb-4">
           {t.expansionKicker}
         </p>
         <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-6">
           {t.expansionTitle}
         </h2>
         <p className="text-xl text-slate-500 mb-24">
           {t.expansionHeadline}
         </p>

         <div className="relative">
           <div className="hidden md:block absolute top-12 left-[12%] right-[12%] h-1 bg-gradient-to-r from-emerald-200 via-blue-200 to-purple-200 rounded-full"></div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-14 md:gap-10">
             {t.expansionSteps.map((step, idx) => {
               const expansionStepStyles = {
                 emerald: {
                   icon: 'text-emerald-600 shadow-emerald-500/20',
                   badge: 'bg-emerald-50 text-emerald-600',
                   dot: 'bg-emerald-500'
                 },
                 blue: {
                   icon: 'text-[#1562F0] shadow-blue-500/20',
                   badge: 'bg-blue-50 text-[#1562F0]',
                   dot: 'bg-[#1562F0]'
                 },
                 purple: {
                   icon: 'text-purple-600 shadow-purple-500/20',
                   badge: 'bg-purple-50 text-purple-600',
                   dot: 'bg-purple-500'
                 }
               };
               const styles = expansionStepStyles[step.color as keyof typeof expansionStepStyles] ?? expansionStepStyles.blue;

               return (
                 <div key={idx} className="relative flex flex-col items-center text-center">
                   <div className={`relative z-10 w-24 h-24 rounded-2xl bg-white border border-slate-200 shadow-2xl ${styles.icon} flex items-center justify-center mb-9`}>
                     {idx === 0 && <Store size={38} />}
                     {idx === 1 && <Smartphone size={38} />}
                     {idx === 2 && <Cpu size={38} />}
                   </div>
                   <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] ${styles.badge} mb-5`}>
                     <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`}></span>
                     {step.phase}
                   </div>
                   <h3 className="text-2xl font-extrabold tracking-tight text-slate-900 mb-4">
                     {step.title}
                   </h3>
                   <p className="max-w-sm text-sm md:text-base leading-relaxed text-slate-500">
                     {step.desc}
                   </p>
                 </div>
               );
             })}
           </div>
         </div>
       </div>
     </section>


     {/* Footer / CTA */}
     <footer className="bg-slate-50 pt-24 pb-12">
       <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col items-center text-center">
         <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-[#1562F0] mb-8 shadow-sm">
           <Store size={28} />
         </div>
         <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-5 max-w-4xl leading-tight tracking-tight">
           {t.footerTitle}
         </h2>
         <p className="max-w-2xl text-base md:text-lg text-slate-500 leading-relaxed mb-10">
           {t.footerSub}
         </p>

         <div className="flex mb-24 w-full justify-center">
            <Link to="/homeExample" className="inline-flex items-center gap-3 px-8 py-4 bg-slate-950 text-white rounded-full font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 hover:-translate-y-0.5">
               {t.footerCta}
               <ArrowRight size={18} />
            </Link>
         </div>


         <div className="w-full flex flex-col md:flex-row justify-between items-center pt-8 border-t border-slate-200 text-xs font-mono text-slate-500">
           <p>© 2026 Beamio Core. All rights reserved.</p>
           <div className="flex gap-6 mt-4 md:mt-0">
              <a href="https://github.com/petersunquest/android-init-NDEF/tree/main/src" target="_blank" rel="noreferrer" className="hover:text-slate-900 transition-colors">GitHub</a>
              <a href="https://x.com/beamioapp" target="_blank" rel="noreferrer" className="hover:text-slate-900 transition-colors">X</a>
              <Link to="/contact" className="hover:text-slate-900 transition-colors">Contact</Link>
              <a href="/terms" className="hover:text-slate-900 transition-colors">Terms</a>
              <a href="/privacy" className="hover:text-slate-900 transition-colors">Privacy</a>
           </div>
         </div>
       </div>
     </footer>


   </div>
 );
}
