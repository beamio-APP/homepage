import React, { ReactNode, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowUpRight, BookOpen, Menu, X } from 'lucide-react'
import ConetBrandMark from './ConetBrandMark'
import { queueScrollToPageSection } from '../utils/scrollToPageSection'

type ConetSiteShellProps = {
	children: ReactNode
}

const docsUrl = 'https://gitbook.conet.network/'
const HOME_PATHS = new Set(['/', '/home'])

function SectionNavLink({
	sectionId,
	className,
	children,
	onNavigate,
}: {
	sectionId: string
	className?: string
	children: ReactNode
	onNavigate?: () => void
}) {
	const location = useLocation()
	const navigate = useNavigate()
	const hashHref = `/#${sectionId}`

	if (!HOME_PATHS.has(location.pathname)) {
		return (
			<Link to={hashHref} className={className} onClick={onNavigate}>
				{children}
			</Link>
		)
	}

	return (
		<a
			href={`#${sectionId}`}
			className={className}
			onClick={(event) => {
				event.preventDefault()
				onNavigate?.()
				if (location.hash !== `#${sectionId}`) {
					navigate(hashHref, { preventScrollReset: true })
				}
				queueScrollToPageSection(sectionId)
			}}
		>
			{children}
		</a>
	)
}

function ExternalLink({
	href,
	children,
	className = '',
}: {
	href: string
	children: ReactNode
	className?: string
}) {
	return (
		<a href={href} target="_blank" rel="noopener noreferrer" className={className}>
			{children}
		</a>
	)
}

export function ConetSiteShell({ children }: ConetSiteShellProps) {
	const [menuOpen, setMenuOpen] = useState(false)
	const location = useLocation()
	const isWeb3 = location.pathname === '/web3'

	const closeMenu = () => setMenuOpen(false)
	const navClass = (active: boolean) =>
		`rounded-full px-3 py-2 text-sm font-medium transition-colors ${
			active ? 'bg-white/10 text-cyan-100' : 'text-slate-300 hover:bg-white/5 hover:text-white'
		}`
	const outlineAppButtonClass =
		'inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-slate-200 transition-colors hover:border-cyan-200/50 hover:bg-white/5'

	return (
		<div className="min-h-screen overflow-x-hidden bg-[#101115] text-white selection:bg-cyan-300 selection:text-slate-950">
			<header className="sticky top-0 z-30 border-b border-white/10 bg-[#101115]/95 backdrop-blur-xl">
				<div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
					<Link to="/" onClick={closeMenu} aria-label="CoNET home">
						<ConetBrandMark />
					</Link>

					<nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
						<SectionNavLink sectionId="layers" className={navClass(!isWeb3)}>
							Stack
						</SectionNavLink>
						<SectionNavLink sectionId="applications" className={navClass(false)}>
							Applications
						</SectionNavLink>
						<Link to="/web3" className={navClass(isWeb3)} aria-current={isWeb3 ? 'page' : undefined}>
							web3://
						</Link>
						<SectionNavLink sectionId="token-economy" className={navClass(false)}>
							Economics
						</SectionNavLink>
					</nav>

					<div className="hidden items-center gap-3 lg:flex">
						<ExternalLink href="https://beamio.app/" className={outlineAppButtonClass}>
							Open Beamio <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
						</ExternalLink>
						<ExternalLink href="https://silentpass.io/" className={outlineAppButtonClass}>
							Open SilentPass <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
						</ExternalLink>
						<ExternalLink
							href={docsUrl}
							className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-300 to-purple-400 px-4 py-2 text-sm font-bold text-slate-950 shadow-[0_0_24px_rgba(103,232,249,0.16)] transition hover:brightness-110"
						>
							<BookOpen className="h-4 w-4" aria-hidden="true" />
							Read GitBook
						</ExternalLink>
					</div>

					<button
						type="button"
						className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white transition-colors hover:bg-white/10 lg:hidden"
						aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
						aria-expanded={menuOpen}
						onClick={() => setMenuOpen((open) => !open)}
					>
						{menuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
					</button>
				</div>

				{menuOpen ? (
					<nav className="border-t border-white/10 bg-[#101115] px-4 py-4 lg:hidden" aria-label="Mobile navigation">
						<div className="mx-auto flex max-w-7xl flex-col gap-1">
							<SectionNavLink onNavigate={closeMenu} sectionId="layers" className={navClass(!isWeb3)}>
								Stack
							</SectionNavLink>
							<SectionNavLink onNavigate={closeMenu} sectionId="applications" className={navClass(false)}>
								Applications
							</SectionNavLink>
							<Link onClick={closeMenu} to="/web3" className={navClass(isWeb3)}>
								web3://
							</Link>
							<SectionNavLink onNavigate={closeMenu} sectionId="token-economy" className={navClass(false)}>
								Economics
							</SectionNavLink>
							<ExternalLink href="https://beamio.app/" className={navClass(false)}>
								Open Beamio
							</ExternalLink>
							<ExternalLink href="https://silentpass.io/" className={navClass(false)}>
								Open SilentPass
							</ExternalLink>
						</div>
					</nav>
				) : null}
			</header>
			{children}
			<footer className="border-t border-white/10 bg-[#15161d] text-slate-300">
				<div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.2fr_1fr_1fr] lg:px-8">
					<div>
						<ConetBrandMark className="[&_span:last-child]:text-white" />
						<p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">
							Wallet-addressed infrastructure for encrypted application routing, shared state, and specialized application ledgers.
						</p>
					</div>
					<div>
						<h2 className="text-sm font-semibold text-white">Explore</h2>
						<div className="mt-3 flex flex-col items-start gap-2 text-sm">
							<SectionNavLink sectionId="layers" className="hover:text-white">Three-layer stack</SectionNavLink>
							<Link to="/web3" className="hover:text-white">web3:// protocol</Link>
							<ExternalLink href="https://gitbook.conet.network/resources.html" className="hover:text-white">Resources</ExternalLink>
						</div>
					</div>
					<div>
						<h2 className="text-sm font-semibold text-white">Related</h2>
						<div className="mt-3 flex flex-col items-start gap-2 text-sm">
							<ExternalLink href="https://beamio.app/" className="hover:text-white">Beamio application</ExternalLink>
							<ExternalLink href="https://silentpass.io/" className="hover:text-white">SilentPass application</ExternalLink>
							<Link to="/contact" className="hover:text-white">Contact</Link>
							<Link to="/terms" className="hover:text-white">Terms</Link>
							<Link to="/privacy" className="hover:text-white">Privacy</Link>
						</div>
					</div>
				</div>
				<div className="border-t border-white/10 px-4 py-5 text-center text-xs text-slate-500">
					© {new Date().getFullYear()} CoNET. Maturity labels describe implementation evidence, not audit, uptime, or anonymity guarantees.
				</div>
			</footer>
		</div>
	)
}

export { ExternalLink }
