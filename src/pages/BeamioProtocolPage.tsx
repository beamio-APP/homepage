import React, { useEffect } from 'react'

import {
    ArrowRight,
    Blocks,
    Bot,
    Braces,
    CircleDot,
    Cloud,
    Coins,
    Computer,
    Database,
    ExternalLink,
    Layers3,
    LockKeyhole,
    Network,
    RadioTower,
    ServerCog,
    ShieldCheck,
} from 'lucide-react'

import { Link, useLocation } from 'react-router-dom'

import {
    ConetSiteShell,
    ExternalLink as SiteExternalLink,
} from '../components/ConetSiteShell'
import { scrollToPageSection } from '../utils/scrollToPageSection'

const gitbook = 'https://gitbook.conet.network/'

const layers = [
    {
        kicker: 'L0 · CoNET DePIN',
        title: 'Decentralized cloud infrastructure',
        copy:
            'CoNET L0 provides the underlying decentralized cloud: data forwarding, fragmented encrypted storage, SaaS execution, and distributed CPU/GPU capacity—without relying on a centralized cloud provider. Providers earn GB for useful cloud work, while GB serves as the L0 resource-accounting and settlement unit.',
        icon: Cloud,
        status: 'Implemented capability',
    },
    {
        kicker: 'L1 · CoNET Blockchain',
        title: 'Shared settlement and state',
        copy:
            'A live EVM-compatible proof-of-stake network. Its target networking direction carries geth and Prysm peer traffic through Layer Minus by wallet locator instead of requiring peers to expose public IP:port identities.',
        icon: Blocks,
        status: 'Production L1 · wallet overlay under development',
        statusHref: 'https://mainnet.conet.network',
    },
    {
        kicker: 'L2 · CoNET-DLE',
        title: 'Application-led execution research',
        copy:
            'A cluster-, event-, atomic-chain-, and parallel-multi-chain-based ultra-high-speed L2. Idle participants join on demand as ultra-lightweight miners. A low, fixed 0.01% gas fee.',
        icon: Layers3,
        status: 'Normative design · laboratory evidence',
        statusHref: 'https://dle.conet.network',
    },
]

const applications = [
    {
        title: 'web3:// Application Protocol',
        copy:
            'Wallet-addressed locators, caller-signed requests, encrypted correlated responses, and persistent TCP or UDP application streams over Layer Minus.',
        to: '/web3',
        icon: Braces,
        status: 'Under development',
    },
    {
        title: 'SilentPass',
        copy:
            'Wallet-authorized privacy access to ordinary Internet services, composed over Layer Minus.',
        href:
            'https://gitbook.conet.network/applications/silentpass-vpn.html',
        icon: ShieldCheck,
        status: 'Public application',
    },
    {
        title: 'Beamio',
        copy:
            'Consumer wallet, Merchant OS, POS, and Cash and USDC workflows built with CoNET infrastructure.',
        href: 'https://beamio.app/',
        icon: CircleDot,
        status: 'Public application',
    },
    {
        title: 'CoNET Chat',
        copy:
            'Wallet-addressed, relationship-private communication: receipts, presence, and encrypted history over Layer Minus.',
        href:
            'https://gitbook.conet.network/applications/depin-chat.html',
        icon: LockKeyhole,
        status: 'Integrated capability',
    },
]

const infrastructureFlow = [
    {
        kicker: 'Foundation',
        title: 'CoNET L0 zero-trust decentralized cloud',
        copy:
            'CoNET L0 provides the underlying decentralized cloud: data forwarding, fragmented encrypted storage, SaaS execution, and distributed CPU/GPU capacity. Providers earn GB for useful cloud work, and applications settle measurable cloud-resource consumption in GB.',
        icon: Cloud,
    },
    {
        kicker: 'Privacy protocol',
        title: 'Layer Minus',
        copy:
            'Layer Minus turns these decentralized L0 resources into wallet-addressed, zero-trust, fragmented private communication, allowing private data and communication to be distributed across the network rather than concentrated in a single server or database.',
        icon: ShieldCheck,
    },
    {
        kicker: 'Private gossip',
        title: 'CoNET L1',
        copy: 'A privacy-routed-gossip EVM L1.',
        icon: Blocks,
    },
    {
        kicker: 'High-speed L2',
        title: 'CoNET-DLE',
        copy:
            'A cluster-, event-, atomic-chain-, and parallel-multi-chain-based ultra-high-speed L2. Idle participants join on demand as ultra-lightweight miners. A low, fixed 0.01% gas fee.',
        icon: Layers3,
    },
    {
        kicker: 'Application server',
        title: 'web3://',
        copy:
            'A decentralized domain name system for wallet-addressed private servers: resolve a wallet or exact tag, authenticate the caller, and reach Web, API, AI, TCP, or UDP services through Layer Minus.',
        icon: ServerCog,
    },
    {
        kicker: 'Destination',
        title: 'Privacy-first Decentralized Applications',
        copy:
            'Whether a traditional C/S app or a decentralized dAPP, the Foundation above enables privacy-first identity by wallet address, high-speed micropayment settlement, and web trust.',
        icon: Bot,
    },
]

const stackPath = [
    'L0',
    'Layer Minus',
    'L1',
    'DLE L2',
    'web3://',
    'Privacy-first dAPP',
] as const

const applicationModelPath = [
    'Wallet',
    'web3://',
    'CoNET L0',
    'Private Application',
] as const

const aiSeparation = [
    {
        title: 'Model builders',
        copy:
            'Build and publish models without controlling the raw-data collection plane or the user-facing agent.',
        icon: Computer,
    },
    {
        title: 'Raw-data acquisition',
        copy:
            'Independent data contributors gather and attest inputs while encrypted fragmentation limits what any single operator can reconstruct.',
        icon: Database,
    },
    {
        title: 'AI agents',
        copy:
            'User-authorized agents request work, protect private context, verify outputs, and return results encrypted to the user.',
        icon: Bot,
    },
]

/*
 * Homepage economics separates the L0 cloud-resource economy from
 * the L1 network-security economy.
 *
 * GB is the L0 service/reward/settlement asset. Its reference value is
 * designed around measurable cloud-resource purchasing power such as
 * 1 GB of forwarded data and 1 GB-month of storage.
 *
 * $CNET is the native L1 gas/security asset used for consensus,
 * governance and state settlement.
 */
const cnetEconomics = [
    {
        title: 'Supply ceiling',
        value: '1,000,000',
        label: '$CNET maximum supply',
        icon: Coins,
        tone: 'cyan',
    },
    {
        title: 'Validator security',
        value: '32 CNET',
        label: 'Beacon deposit unit',
        icon: LockKeyhole,
        tone: 'purple',
    },
    {
        title: 'Base-fee mechanism',
        value: 'Burned',
        label: 'EIP-1559 base-fee component',
        icon: RadioTower,
        tone: 'orange',
    },
]

export default function BeamioProtocolPage() {
    const location = useLocation()

    useEffect(() => {
        document.title = 'CoNET | Wallet-addressed infrastructure'
    }, [])

    useEffect(() => {
        const targetId = location.hash
            .replace(/^#/, '')
            .replace(/\/+$/, '')

        if (!targetId) {
            window.scrollTo({
                top: 0,
                behavior: 'auto',
            })
            return
        }

        let cancelled = false
        let retryTimer: number | undefined

        const tryScroll = () => {
            if (cancelled) return
            return scrollToPageSection(targetId, 'auto')
        }

        const frame = window.requestAnimationFrame(() => {
            if (tryScroll()) return
            retryTimer = window.setTimeout(tryScroll, 80) as unknown as number
        })

        return () => {
            cancelled = true
            window.cancelAnimationFrame(frame)
            if (retryTimer !== undefined) window.clearTimeout(retryTimer)
        }
    }, [location.hash, location.pathname])

    return (
        <ConetSiteShell>
            <main>
                {/* =========================================================
                    HERO
                   ========================================================= */}

                <section className="relative isolate overflow-hidden bg-black px-4 pb-20 pt-20 text-white sm:px-6 sm:pb-28 sm:pt-28 lg:px-8">
                    <video
                        className="absolute inset-0 -z-20 h-full w-full object-cover"
                        src="/bg-home.mp4"
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        aria-hidden="true"
                        tabIndex={-1}
                    />

                    <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_20%,rgba(34,211,238,0.12),transparent_32%),radial-gradient(circle_at_85%_40%,rgba(192,132,252,0.18),transparent_34%),linear-gradient(180deg,rgba(0,0,0,0.62)_0%,rgba(16,17,21,0.86)_100%)]" />

                    <div className="mx-auto max-w-7xl">
                        <div className="max-w-4xl">
                            <p className="mb-5 inline-flex rounded-full border border-cyan-200/30 bg-cyan-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-cyan-100">
                                CoNET infrastructure
                            </p>

                            <h1 className="max-w-4xl text-4xl font-semibold leading-[1.04] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
                                FROM INFRASTRUCTURE TO APPLICATIONS
                            </h1>

                            <h2 className="mt-5 max-w-3xl text-xl font-medium leading-8 tracking-tight text-slate-100 sm:text-2xl">
                                One decentralized resource plane. From network
                                infrastructure to private applications.
                            </h2>

                            <div className="mt-5 max-w-3xl space-y-5 text-base leading-7 text-slate-300 sm:text-lg">
                                <p>
                                    CoNET L0 is more than a decentralized
                                    network. It is a decentralized resource
                                    plane providing forwarding, encrypted
                                    storage, service hosting, and distributed
                                    compute.
                                </p>

                                <p>
                                    These same resources can power
                                    applications directly.
                                </p>

                                <p>
                                    With web3://, applications are addressed
                                    through wallet identities rather than
                                    conventional centralized server endpoints.
                                    Requests can be caller-signed, resources
                                    can remain distributed, and application
                                    communication can use the same zero-trust
                                    infrastructure that powers CoNET&apos;s
                                    underlying network.
                                </p>

                                <p>This creates a new application model:</p>

                                <p className="flex flex-wrap items-center gap-x-2 gap-y-2 text-sm font-semibold tracking-tight text-slate-100 sm:text-base">
                                    {applicationModelPath.map((step, index) => (
                                        <span
                                            key={step}
                                            className="inline-flex items-center gap-2"
                                        >
                                            {index > 0 ? (
                                                <span
                                                    className="font-normal text-cyan-300/80"
                                                    aria-hidden="true"
                                                >
                                                    →
                                                </span>
                                            ) : null}

                                            <span>{step}</span>
                                        </span>
                                    ))}
                                </p>

                                <p>
                                    Instead of separating the network, cloud
                                    infrastructure, and application server
                                    into different centralized layers, CoNET
                                    connects them through one wallet-addressed
                                    foundation.
                                </p>

                                <h3 className="pt-2 text-lg font-semibold tracking-tight text-white sm:text-xl">
                                    The result
                                </h3>

                                <p>
                                    Infrastructure becomes application
                                    infrastructure.
                                </p>

                                <p>
                                    The wallet becomes more than an account.
                                    It becomes the address of a decentralized
                                    application environment.
                                </p>
                            </div>

                            <div className="mt-9 flex flex-wrap gap-3">
                                <Link
                                    to="/web3"
                                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-300 to-purple-400 px-5 py-3 text-sm font-bold text-slate-950 shadow-[0_0_28px_rgba(103,232,249,0.18)] transition-transform hover:-translate-y-0.5"
                                >
                                    Explore web3://

                                    <ArrowRight
                                        className="h-4 w-4"
                                        aria-hidden="true"
                                    />
                                </Link>

                                <SiteExternalLink
                                    href={gitbook}
                                    className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
                                >
                                    Read the GitBook

                                    <ExternalLink
                                        className="h-4 w-4"
                                        aria-hidden="true"
                                    />
                                </SiteExternalLink>
                            </div>
                        </div>
                    </div>
                </section>

                {/* =========================================================
                    INFRASTRUCTURE FLOW
                   ========================================================= */}

                <section className="border-y border-white/10 bg-[#15161d] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
                    <div className="mx-auto max-w-7xl">
                        <div className="max-w-3xl">
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">
                                {stackPath.join(' → ')}
                            </p>

                            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
                                One decentralized foundation.
                            </h2>
                        </div>

                        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {infrastructureFlow.map(
                                ({ kicker, title, copy, icon: Icon }, index) => (
                                    <article
                                        key={title}
                                        className="relative rounded-2xl border border-white/10 bg-[#18191f] p-6"
                                    >
                                        <div className="flex items-center justify-between">
                                            <Icon
                                                className="h-7 w-7 text-cyan-300"
                                                aria-hidden="true"
                                            />

                                            <span className="text-xs font-bold text-slate-600">
                                                0{index + 1}
                                            </span>
                                        </div>

                                        <p className="mt-7 text-xs font-bold uppercase tracking-[0.15em] text-cyan-200">
                                            {kicker}
                                        </p>

                                        <h3 className="mt-2 text-xl font-semibold text-white">
                                            {title}
                                        </h3>

                                        <p className="mt-3 text-sm leading-6 text-slate-400">
                                            {copy}
                                        </p>
                                    </article>
                                ),
                            )}
                        </div>
                    </div>
                </section>

                {/* =========================================================
                    STACK
                   ========================================================= */}

                <section
                    id="layers"
                    className="scroll-mt-24 px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
                >
                    <div className="mx-auto max-w-7xl">
                        <div className="max-w-2xl">
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">
                                The stack
                            </p>

                            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
                                Three layers, clear boundaries.
                            </h2>

                            <p className="mt-4 leading-7 text-slate-400">
                                CoNET is not a single application. The layers
                                can be composed, while their responsibilities
                                and implementation evidence remain distinct.
                            </p>
                        </div>

                        <div className="mt-10 grid gap-4 lg:grid-cols-3">
                            {layers.map(
                                ({
                                    kicker,
                                    title,
                                    copy,
                                    icon: Icon,
                                    status,
                                    statusHref,
                                }) => (
                                    <article
                                        key={kicker}
                                        className="rounded-2xl border border-white/10 bg-[#18191f] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-7"
                                    >
                                        <Icon
                                            className="h-7 w-7 text-cyan-300"
                                            aria-hidden="true"
                                        />

                                        <p className="mt-7 text-xs font-bold uppercase tracking-[0.15em] text-cyan-200">
                                            {kicker}
                                        </p>

                                        <h3 className="mt-2 text-xl font-semibold tracking-tight text-white">
                                            {title}
                                        </h3>

                                        <p className="mt-3 text-sm leading-6 text-slate-400">
                                            {copy}
                                        </p>

                                        {statusHref ? (
                                            <SiteExternalLink
                                                href={statusHref}
                                                className="mt-6 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white"
                                            >
                                                {status}
                                            </SiteExternalLink>
                                        ) : (
                                            <p className="mt-6 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
                                                {status}
                                            </p>
                                        )}
                                    </article>
                                ),
                            )}
                        </div>
                    </div>
                </section>

                {/* =========================================================
                    NETWORK DIFFERENCE
                   ========================================================= */}

                <section className="border-y border-white/10 bg-[#15161d] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
                    <div className="mx-auto max-w-7xl">
                        <div className="max-w-3xl">
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">
                                The network difference
                            </p>

                            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
                                Wallet identity becomes network
                                infrastructure.
                            </h2>

                            <p className="mt-5 leading-7 text-slate-400">
                                A conventional Ethereum-style L1 normally
                                discovers and connects peers through exposed IP
                                addresses and ports. CoNET keeps EVM-compatible
                                execution and proof-of-stake consensus, while
                                developing a different transport direction:
                                peer streams addressed by wallet identity and
                                carried through the encrypted Layer Minus
                                network.
                            </p>
                        </div>

                        <div className="mt-10 grid gap-4 lg:grid-cols-2">
                            <article className="rounded-2xl border border-white/10 bg-[#18191f] p-6 sm:p-7">
                                <Blocks
                                    className="h-7 w-7 text-cyan-300"
                                    aria-hidden="true"
                                />

                                <p className="mt-6 text-xs font-bold uppercase tracking-[0.15em] text-cyan-200">
                                    CoNET L1 direction
                                </p>

                                <h3 className="mt-2 text-xl font-semibold text-white">
                                    Consensus peers by wallet locator
                                </h3>

                                <p className="mt-3 text-sm leading-6 text-slate-400">
                                    The destination architecture transports
                                    unmodified geth and Prysm peer connections
                                    through Layer Minus, so a wallet locator—
                                    not a stable public{' '}
                                    <code>IP:port</code>—can identify the peer
                                    destination. Laboratory tests have
                                    demonstrated this path; the public
                                    production join path still uses
                                    conventional hosts today.
                                </p>

                                <SiteExternalLink
                                    href="https://gitbook.conet.network/developers/l1-node.html"
                                    className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-cyan-100"
                                >
                                    Read the L1 boundary

                                    <ArrowRight
                                        className="h-4 w-4"
                                        aria-hidden="true"
                                    />
                                </SiteExternalLink>
                            </article>

                            <article className="rounded-2xl border border-white/10 bg-[#18191f] p-6 sm:p-7">
                                <Network
                                    className="h-7 w-7 text-purple-300"
                                    aria-hidden="true"
                                />

                                <p className="mt-6 text-xs font-bold uppercase tracking-[0.15em] text-purple-200">
                                    CoNET-DLE foundation
                                </p>

                                <h3 className="mt-2 text-xl font-semibold text-white">
                                    Wallet-addressed encrypted gossip
                                </h3>

                                <p className="mt-3 text-sm leading-6 text-slate-400">
                                    DLE is designed on top of CoNET DePIN rather
                                    than as another IP overlay. Waiting-pool
                                    announcements, task offers, block
                                    proposals, votes, and other control or
                                    data messages use EOA identities and
                                    OpenPGP end-to-end encryption through the
                                    entry/mailbox routing model.
                                </p>

                                <SiteExternalLink
                                    href="https://gitbook.conet.network/l2/"
                                    className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-cyan-100"
                                >
                                    Read the DLE design boundary

                                    <ArrowRight
                                        className="h-4 w-4"
                                        aria-hidden="true"
                                    />
                                </SiteExternalLink>
                            </article>
                        </div>
                    </div>
                </section>

                {/* =========================================================
                    WEB3
                   ========================================================= */}

                <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
                    <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_1.15fr] lg:items-center">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">
                                Application protocol
                            </p>

                            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
                                web3:// is a protocol surface, not a browser
                                promise.
                            </h2>

                            <p className="mt-5 leading-7 text-slate-400">
                                It defines wallet-addressed resource and
                                streaming interactions over CoNET
                                infrastructure, including Web, API, AI, TCP,
                                and UDP services. URI resolution, signed
                                requests, and encrypted responses are
                                specified separately from the routing
                                substrate.
                            </p>

                            <Link
                                to="/web3"
                                className="mt-7 inline-flex items-center gap-2 font-semibold text-cyan-300 hover:text-cyan-100"
                            >
                                Read the protocol overview

                                <ArrowRight
                                    className="h-4 w-4"
                                    aria-hidden="true"
                                />
                            </Link>
                        </div>

                        <div className="rounded-2xl border border-cyan-200/10 bg-black/40 p-6 text-slate-100 shadow-[0_0_48px_rgba(103,232,249,0.08)] sm:p-8">
                            <div className="flex items-center gap-3 text-cyan-200">
                                <Braces
                                    className="h-5 w-5"
                                    aria-hidden="true"
                                />

                                <span className="text-sm font-semibold">
                                    URI examples
                                </span>
                            </div>

                            <code className="mt-6 block overflow-x-auto rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-cyan-100">
                                web3://0x1234…abcd/resource
                            </code>

                            <code className="mt-3 block overflow-x-auto rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-cyan-100">
                                web3://ExactTag.web3/inbox
                            </code>

                            <p className="mt-5 text-sm leading-6 text-slate-300">
                                Examples illustrate locator shape only. An
                                exact tag must resolve unambiguously; this page
                                does not execute these URIs.
                            </p>
                        </div>
                    </div>
                </section>

                {/* =========================================================
                    AI
                   ========================================================= */}

                <section
                    id="privacy-first-ai"
                    className="scroll-mt-6 border-y border-white/10 bg-[#15161d] px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
                >
                    <div className="mx-auto max-w-7xl">
                        <div className="max-w-3xl">
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-purple-300">
                                Privacy-first Decentralized AI
                            </p>

                            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
                                Three independent powers above user privacy.
                            </h2>

                            <p className="mt-5 leading-7 text-slate-400">
                                Privacy-first decentralized AI on CoNET uses
                                contributed L0 GPU capacity while separating
                                model construction, raw-data acquisition, and
                                AI-agent operation. No single role should own
                                the model, the complete private input, and the
                                user relationship at once.
                            </p>
                        </div>

                        <div className="mt-10 grid gap-4 md:grid-cols-3">
                            {aiSeparation.map(
                                ({ title, copy, icon: Icon }) => (
                                    <article
                                        key={title}
                                        className="rounded-2xl border border-purple-300/15 bg-[#18191f] p-6 sm:p-7"
                                    >
                                        <Icon
                                            className="h-7 w-7 text-purple-300"
                                            aria-hidden="true"
                                        />

                                        <h3 className="mt-6 text-xl font-semibold text-white">
                                            {title}
                                        </h3>

                                        <p className="mt-3 text-sm leading-6 text-slate-400">
                                            {copy}
                                        </p>
                                    </article>
                                ),
                            )}
                        </div>

                        <p className="mt-6 max-w-4xl text-sm leading-6 text-slate-500">
                            This is a future architecture direction, not a
                            claim that a general GPU marketplace or
                            decentralized AI product is already in production.
                        </p>
                    </div>
                </section>

                {/* =========================================================
                    APPLICATIONS
                   ========================================================= */}

                <section
                    id="applications"
                    className="scroll-mt-24 px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
                >
                    <div className="mx-auto max-w-7xl">
                        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
                            <div className="max-w-xl">
                                <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">
                                    Application ecosystem
                                </p>

                                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
                                    Built for specialized applications.
                                </h2>
                            </div>

                            <SiteExternalLink
                                href="https://gitbook.conet.network/applications/"
                                className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-cyan-100"
                            >
                                And more...

                                <ArrowRight
                                    className="h-4 w-4"
                                    aria-hidden="true"
                                />
                            </SiteExternalLink>
                        </div>

                        <div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {applications.map(
                                ({
                                    title,
                                    copy,
                                    icon: Icon,
                                    ...destination
                                }) => {
                                    const content = (
                                        <>
                                            <Icon
                                                className="h-6 w-6 text-cyan-300"
                                                aria-hidden="true"
                                            />

                                            <h3 className="mt-6 text-lg font-semibold text-white">
                                                {title}
                                            </h3>

                                            <p className="mt-2 text-sm leading-6 text-slate-400">
                                                {copy}
                                            </p>

                                            {'status' in destination ? (
                                                <span className="mt-5 inline-flex rounded-full border border-cyan-200/20 bg-cyan-300/10 px-2.5 py-1 text-xs font-semibold text-cyan-100">
                                                    {destination.status}
                                                </span>
                                            ) : null}

                                            <span className="mt-6 flex items-center gap-1.5 text-sm font-semibold text-cyan-300">
                                                Explore

                                                <ArrowRight
                                                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                                                    aria-hidden="true"
                                                />
                                            </span>
                                        </>
                                    )

                                    const className =
                                        'group flex flex-col rounded-2xl border border-white/10 bg-[#18191f] p-6 transition hover:-translate-y-1 hover:border-cyan-300/40 hover:shadow-[0_0_32px_rgba(103,232,249,0.08)]'

                                    return 'to' in destination ? (
                                        <Link
                                            key={title}
                                            to={destination.to}
                                            className={className}
                                        >
                                            {content}
                                        </Link>
                                    ) : (
                                        <SiteExternalLink
                                            key={title}
                                            href={destination.href}
                                            className={className}
                                        >
                                            {content}
                                        </SiteExternalLink>
                                    )
                                },
                            )}
                        </div>
                    </div>
                </section>

                {/* =========================================================
                    NETWORK ECONOMICS — L0 GB + L1 CNET
                   ========================================================= */}

                <section
                    id="token-economy"
                    className="scroll-mt-24 border-y border-white/10 bg-[#15161d] px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
                >
                    <div className="mx-auto max-w-7xl">
                        <div className="max-w-3xl">
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">
                                Network economics
                            </p>

                            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
                                GB prices the cloud. $CNET secures the network.
                            </h2>

                            <p className="mt-5 leading-7 text-slate-400">
                                CoNET separates decentralized-cloud resource economics from L1 network-security economics. GB is the L0 service, provider-reward, accounting, and settlement asset for measurable cloud resources. $CNET is the native L1 gas and security asset for consensus, governance, and shared state.
                            </p>
                        </div>

                        {/* Two economic roles */}

                        <div className="mt-10 grid gap-4 lg:grid-cols-2">
                            <article className="rounded-2xl border border-cyan-300/20 bg-[#18191f] p-6 sm:p-8">
                                <Cloud
                                    className="h-7 w-7 text-cyan-300"
                                    aria-hidden="true"
                                />

                                <p className="mt-6 text-xs font-bold uppercase tracking-[0.15em] text-cyan-200">
                                    L0 · Cloud resource economy
                                </p>

                                <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                                    <h3 className="text-3xl font-semibold tracking-tight text-white">
                                        GB
                                    </h3>

                                    <span className="text-sm font-semibold text-cyan-200">
                                        service · reward · settlement
                                    </span>
                                </div>

                                <p className="mt-4 text-sm leading-6 text-slate-400">
                                    Decentralized cloud providers earn GB for useful forwarding, storage, service-hosting, and compute work. Applications use GB to account for and settle the L0 resources they consume.
                                </p>

                                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                                        <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                                            Forwarding reference
                                        </p>

                                        <p className="mt-2 text-lg font-semibold text-white">
                                            1 GB transferred
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-slate-500">
                                            A measurable unit for decentralized data-forwarding cost.
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                                        <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                                            Storage reference
                                        </p>

                                        <p className="mt-2 text-lg font-semibold text-white">
                                            1 GB / month
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-slate-500">
                                            A measurable GB-month unit for persistent storage cost.
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-6 rounded-xl border border-cyan-300/10 bg-cyan-300/[0.04] p-4">
                                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-cyan-200">
                                        Resource-referenced value
                                    </p>

                                    <p className="mt-2 text-sm leading-6 text-slate-400">
                                        GB is designed around cloud-resource purchasing power. Its reference value follows measurable cloud-service costs such as forwarded data and GB-month storage, rather than being described as a fiat-pegged stablecoin.
                                    </p>
                                </div>
                            </article>

                            <article className="rounded-2xl border border-purple-300/20 bg-[#18191f] p-6 sm:p-8">
                                <Coins
                                    className="h-7 w-7 text-purple-300"
                                    aria-hidden="true"
                                />

                                <p className="mt-6 text-xs font-bold uppercase tracking-[0.15em] text-purple-200">
                                    L1 · Network security economy
                                </p>

                                <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                                    <h3 className="text-3xl font-semibold tracking-tight text-white">
                                        $CNET
                                    </h3>

                                    <span className="text-sm font-semibold text-purple-200">
                                        gas · security · governance
                                    </span>
                                </div>

                                <p className="mt-4 text-sm leading-6 text-slate-400">
                                    $CNET is the native asset of CoNET L1. It secures proof-of-stake consensus, pays L1 gas, participates in governance, and provides the economic layer for shared state and application settlement.
                                </p>

                                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                                    {cnetEconomics.map(
                                        ({
                                            title,
                                            value,
                                            label,
                                            icon: Icon,
                                            tone,
                                        }) => {
                                            const toneClass =
                                                tone === 'purple'
                                                    ? 'border-purple-300/15'
                                                    : tone === 'orange'
                                                      ? 'border-orange-300/15'
                                                      : 'border-cyan-300/15'

                                            const iconClass =
                                                tone === 'purple'
                                                    ? 'text-purple-300'
                                                    : tone === 'orange'
                                                      ? 'text-orange-300'
                                                      : 'text-cyan-300'

                                            const labelClass =
                                                tone === 'purple'
                                                    ? 'text-purple-200'
                                                    : tone === 'orange'
                                                      ? 'text-orange-200'
                                                      : 'text-cyan-200'

                                            return (
                                                <div
                                                    key={title}
                                                    className={`rounded-xl border bg-black/20 p-4 ${toneClass}`}
                                                >
                                                    <Icon
                                                        className={`h-5 w-5 ${iconClass}`}
                                                        aria-hidden="true"
                                                    />

                                                    <p
                                                        className={`mt-4 text-[11px] font-bold uppercase tracking-[0.12em] ${labelClass}`}
                                                    >
                                                        {title}
                                                    </p>

                                                    <p className="mt-2 text-lg font-semibold text-white">
                                                        {value}
                                                    </p>

                                                    <p className="mt-1 text-xs leading-5 text-slate-500">
                                                        {label}
                                                    </p>
                                                </div>
                                            )
                                        },
                                    )}
                                </div>
                            </article>
                        </div>

                        {/* Economic stack */}

                        <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-6 sm:p-8">
                            <div className="max-w-3xl">
                                <p className="text-xs font-bold uppercase tracking-[0.15em] text-cyan-300">
                                    Economic stack
                                </p>

                                <h3 className="mt-2 text-2xl font-semibold text-white">
                                    Resource settlement below. Network security above.
                                </h3>

                                <p className="mt-3 text-sm leading-6 text-slate-400">
                                    Applications consume decentralized cloud resources in the L0 economy, where GB accounts for useful service work. CoNET L1 provides shared state, gas, consensus security, and protocol-level settlement through $CNET.
                                </p>
                            </div>

                            <div className="mt-7 grid gap-3 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch">
                                <div className="rounded-xl border border-cyan-300/15 bg-[#18191f] p-5">
                                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-cyan-200">
                                        CoNET L0
                                    </p>

                                    <h4 className="mt-3 text-lg font-semibold text-white">
                                        Forward · Store · Host · Compute
                                    </h4>

                                    <p className="mt-2 text-sm leading-6 text-slate-400">
                                        Providers contribute measurable decentralized-cloud resources and receive GB for useful service work.
                                    </p>

                                    <div className="mt-4 inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs font-semibold text-cyan-100">
                                        GB · resource accounting and settlement
                                    </div>
                                </div>

                                <div className="hidden items-center justify-center px-2 text-slate-600 lg:flex">
                                    <ArrowRight
                                        className="h-5 w-5"
                                        aria-hidden="true"
                                    />
                                </div>

                                <div className="rounded-xl border border-purple-300/15 bg-[#18191f] p-5">
                                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-purple-200">
                                        CoNET L1
                                    </p>

                                    <h4 className="mt-3 text-lg font-semibold text-white">
                                        Gas · Consensus · Security · State
                                    </h4>

                                    <p className="mt-2 text-sm leading-6 text-slate-400">
                                        $CNET secures the chain and pays for protocol-level state transitions and application settlement.
                                    </p>

                                    <div className="mt-4 inline-flex rounded-full border border-purple-300/20 bg-purple-300/10 px-3 py-1.5 text-xs font-semibold text-purple-100">
                                        $CNET · network security and gas
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Boundaries */}

                        <div className="mt-6 grid gap-4 lg:grid-cols-2">
                            <div className="rounded-2xl border border-white/10 bg-[#18191f] p-6 sm:p-7">
                                <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                                    Why separate the assets?
                                </p>

                                <h3 className="mt-2 text-xl font-semibold text-white">
                                    Cloud-resource pricing and network security solve different problems.
                                </h3>

                                <p className="mt-3 text-sm leading-6 text-slate-400">
                                    GB provides a resource-oriented unit for cloud providers and applications. $CNET remains the scarce native asset that secures CoNET L1. Separating these roles avoids forcing volatile L1 security economics directly into ordinary cloud-resource pricing.
                                </p>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-[#18191f] p-6 sm:p-7">
                                <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                                    Pricing boundary
                                </p>

                                <h3 className="mt-2 text-xl font-semibold text-white">
                                    GB is resource-referenced, not fiat-pegged.
                                </h3>

                                <p className="mt-3 text-sm leading-6 text-slate-400">
                                    The intended stability comes from anchoring the service economy to real cloud-resource units and market costs. Forwarding, storage, and other L0 services can therefore be priced against measurable infrastructure consumption rather than an arbitrary token quantity.
                                </p>
                            </div>
                        </div>

                        {/* Advanced CNET model */}

                        <details className="group mt-6 rounded-2xl border border-white/10 bg-[#18191f]">
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-6 sm:p-7">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                                        $CNET advanced model
                                    </p>

                                    <h3 className="mt-2 text-lg font-semibold text-white">
                                        Issuance, allocation, Treasury and burn assumptions
                                    </h3>

                                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                                        Detailed L1 economic assumptions remain available without competing with the L0 cloud-resource model in the default homepage narrative.
                                    </p>
                                </div>

                                <ArrowRight className="h-5 w-5 shrink-0 text-slate-500 transition-transform group-open:rotate-90" />
                            </summary>

                            <div className="border-t border-white/10 px-6 pb-6 pt-6 sm:px-7 sm:pb-7">
                                <div className="grid gap-4 lg:grid-cols-2">
                                    <div className="rounded-xl border border-white/10 bg-black/20 p-5">
                                        <h4 className="font-semibold text-white">
                                            Issuance and allocation
                                        </h4>

                                        <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-400">
                                            <li>
                                                <strong className="text-slate-200">
                                                    Validator economics:
                                                </strong>{' '}
                                                should be read separately from L0 provider rewards. GB rewards useful decentralized-cloud work; CNET staking secures L1 consensus.
                                            </li>

                                            <li>
                                                <strong className="text-slate-200">
                                                    Historical allocations:
                                                </strong>{' '}
                                                Genesis, official infrastructure, unlock, and Treasury rules are governed by their applicable documentation, contracts, and governance decisions.
                                            </li>

                                            <li>
                                                <strong className="text-slate-200">
                                                    Live state:
                                                </strong>{' '}
                                                current contract state and published governance decisions take precedence over historical economic models.
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="rounded-xl border border-orange-300/15 bg-orange-300/[0.04] p-5">
                                        <h4 className="font-semibold text-white">
                                            L1 fee burn
                                        </h4>

                                        <p className="mt-4 text-sm leading-6 text-slate-400">
                                            CoNET L1 uses the EIP-1559 fee mechanism. The base-fee component is burned. This L1 burn mechanism is distinct from GB payments and provider rewards in the L0 cloud-resource economy.
                                        </p>

                                        <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4">
                                            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                                                Important
                                            </p>

                                            <p className="mt-2 text-sm leading-6 text-slate-300">
                                                Historical price scenarios, projected burn crossover prices, APR calculations, provider earnings, and profit estimates are intentionally excluded from the homepage. They are model outputs rather than protocol guarantees.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5 flex flex-wrap gap-3">
                                    <SiteExternalLink
                                        href="https://gitbook.conet.network/developers/"
                                        className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-cyan-100"
                                    >
                                        Read the economic documentation

                                        <ArrowRight
                                            className="h-4 w-4"
                                            aria-hidden="true"
                                        />
                                    </SiteExternalLink>

                                    <SiteExternalLink
                                        href={gitbook}
                                        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white"
                                    >
                                        Open the GitBook

                                        <ExternalLink
                                            className="h-4 w-4"
                                            aria-hidden="true"
                                        />
                                    </SiteExternalLink>
                                </div>

                                <p className="mt-5 text-xs leading-5 text-slate-500">
                                    Resource prices, token values, economic parameters, allocations, emission projections, and burn scenarios may change. GB should be described as resource-referenced rather than as a guaranteed fiat peg. $CNET economic figures should not be interpreted as guaranteed investment returns or financial advice. Live contract state and current published governance decisions take precedence.
                                </p>
                            </div>
                        </details>
                    </div>
                </section>

                {/* =========================================================
                    FOOTER CTA
                   ========================================================= */}

                <section className="border-t border-white/10 bg-black px-4 py-16 text-white sm:px-6 lg:px-8">
                    <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_1fr]">
                        <div>
                            <RadioTower
                                className="h-7 w-7 text-cyan-200"
                                aria-hidden="true"
                            />

                            <h2 className="mt-5 text-3xl font-semibold tracking-tight">
                                Participate with evidence in mind.
                            </h2>

                            <p className="mt-4 max-w-xl leading-7 text-slate-300">
                                Run a node, build a client, or examine a
                                protocol. Use the GitBook for operational
                                prerequisites and treat maturity labels as
                                constraints, not marketing shorthand.
                            </p>
                        </div>

                        <div className="grid content-start gap-3 sm:grid-cols-2">
                            <SiteExternalLink
                                href="https://gitbook.conet.network/developers/l1-node.html"
                                className="rounded-2xl border border-white/15 bg-white/5 p-5 hover:bg-white/10"
                            >
                                Run an L1 node

                                <ArrowRight
                                    className="mt-4 h-4 w-4 text-cyan-200"
                                    aria-hidden="true"
                                />
                            </SiteExternalLink>

                            <SiteExternalLink
                                href="https://gitbook.conet.network/developers/conet-l0d.html"
                                className="rounded-2xl border border-white/15 bg-white/5 p-5 hover:bg-white/10"
                            >
                                conet-l0d Linux runtime

                                <ArrowRight
                                    className="mt-4 h-4 w-4 text-cyan-200"
                                    aria-hidden="true"
                                />
                            </SiteExternalLink>

                            <SiteExternalLink
                                href="https://gitbook.conet.network/developers/"
                                className="rounded-2xl border border-white/15 bg-white/5 p-5 hover:bg-white/10"
                            >
                                Developer guides

                                <ArrowRight
                                    className="mt-4 h-4 w-4 text-cyan-200"
                                    aria-hidden="true"
                                />
                            </SiteExternalLink>

                            <SiteExternalLink
                                href="https://gitbook.conet.network/resources.html"
                                className="rounded-2xl border border-white/15 bg-white/5 p-5 hover:bg-white/10"
                            >
                                Endpoints and repositories

                                <ArrowRight
                                    className="mt-4 h-4 w-4 text-cyan-200"
                                    aria-hidden="true"
                                />
                            </SiteExternalLink>
                        </div>
                    </div>
                </section>
            </main>
        </ConetSiteShell>
    )
}