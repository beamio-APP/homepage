import React, { FormEvent, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Monitor, Send, Shield, Store } from 'lucide-react'
import BeamioBrandLogo from '../components/BeamioBrandLogo'

const inputClassName =
	'w-full rounded-xl border border-slate-200 bg-slate-50 px-6 py-4 text-slate-900 transition-all placeholder:text-slate-400 focus:border-[#1562f0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1562f0]/20'

export default function ContactPage() {
	useEffect(() => {
		document.title = 'Contact | Beamio'
	}, [])

	function handleSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault()
	}

	return (
		<div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 selection:bg-[#1562f0]/20 antialiased">
			<nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 shadow-sm backdrop-blur-md">
				<div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
					<div className="flex items-center gap-6">
						<Link
							to="/home"
							className="flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-slate-900"
						>
							<ArrowLeft className="h-4 w-4" />
							<span className="hidden sm:inline">Back to Protocol</span>
						</Link>
						<div className="hidden h-6 w-px bg-slate-200 sm:block" />
						<Link to="/home" className="flex items-center gap-2.5">
							<BeamioBrandLogo className="h-8 w-8 rounded-lg object-cover shadow-sm" />
							<span className="text-xl font-bold tracking-tight text-slate-900">Beamio</span>
						</Link>
					</div>
					<Link
						to="/homeExample"
						className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:bg-slate-800"
					>
						Merchant Solutions
					</Link>
				</div>
			</nav>

			<main className="pb-20 pt-20">
				<section className="bg-white px-6 py-20">
					<div className="mx-auto max-w-7xl">
						<h1 className="mb-8 max-w-4xl text-5xl font-black leading-[0.95] tracking-tighter text-slate-900 md:text-7xl lg:text-8xl">
							We are here to help.
						</h1>
						<p className="max-w-2xl text-xl leading-relaxed text-slate-600 md:text-2xl">
							Support for your decentralized, digital store-membership operating system. Our technical and onboarding
							teams are ready to assist with your infrastructure needs.
						</p>
					</div>
				</section>

				<section className="mx-auto max-w-7xl px-6 py-20">
					<div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-2">
						<div className="space-y-6">
							<div className="flex items-start gap-6 rounded-xl border border-slate-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
								<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#1562f0]/10 text-[#1562f0]">
									<Monitor className="h-6 w-6" />
								</div>
								<div>
									<h3 className="mb-2 text-xl font-bold tracking-tight">Software &amp; OS Support</h3>
									<p className="mb-4 leading-relaxed text-slate-600">
										For beta users experiencing UI/UX issues or requiring technical assistance with the Beamio app.
									</p>
									<a
										className="font-semibold text-[#1562f0] decoration-2 underline-offset-4 hover:underline"
										href="mailto:support@beamio.app"
									>
										support@beamio.app
									</a>
								</div>
							</div>

							<div className="flex items-start gap-6 rounded-xl border border-slate-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
								<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#1562f0]/10 text-[#1562f0]">
									<Store className="h-6 w-6" />
								</div>
								<div>
									<h3 className="mb-2 text-xl font-bold tracking-tight">Merchant Onboarding</h3>
									<p className="mb-4 leading-relaxed text-slate-600">
										For independent businesses ready to deploy our closed-loop infrastructure.
									</p>
									<a
										className="font-semibold text-[#1562f0] decoration-2 underline-offset-4 hover:underline"
										href="mailto:support@beamio.app?subject=Merchant%20Onboarding"
									>
										support@beamio.app
									</a>
								</div>
							</div>

							<div className="flex items-start gap-6 rounded-xl border border-slate-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
								<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#1562f0]/10 text-[#1562f0]">
									<Shield className="h-6 w-6" />
								</div>
								<div>
									<h3 className="mb-2 text-xl font-bold tracking-tight">Legal &amp; Infrastructure</h3>
									<p className="mb-4 leading-relaxed text-slate-600">
										For inquiries regarding our non-custodial architecture and compliance frameworks.
									</p>
									<a
										className="font-semibold text-[#1562f0] decoration-2 underline-offset-4 hover:underline"
										href="mailto:support@beamio.app?subject=Legal%20%26%20Infrastructure"
									>
										support@beamio.app
									</a>
								</div>
							</div>
						</div>

						<div className="rounded-xl border border-slate-200 bg-white p-10 shadow-sm md:p-12">
							<form className="space-y-8" onSubmit={handleSubmit}>
								<div className="grid grid-cols-1 gap-8">
									<div className="space-y-2">
										<label className="ml-1 text-sm font-bold tracking-tight text-slate-600" htmlFor="contact-name">
											Your Name
										</label>
										<input
											id="contact-name"
											name="name"
											type="text"
											autoComplete="name"
											className={inputClassName}
											placeholder="John Doe"
										/>
									</div>
									<div className="space-y-2">
										<label className="ml-1 text-sm font-bold tracking-tight text-slate-600" htmlFor="contact-email">
											Email Address
										</label>
										<input
											id="contact-email"
											name="email"
											type="email"
											autoComplete="email"
											className={inputClassName}
											placeholder="john@example.com"
										/>
									</div>
									<div className="space-y-2">
										<label
											className="ml-1 text-sm font-bold tracking-tight text-slate-600"
											htmlFor="contact-inquiry-type"
										>
											Inquiry Type
										</label>
										<div className="relative">
											<select
												id="contact-inquiry-type"
												name="inquiry"
												className={`${inputClassName} appearance-none pr-12`}
												defaultValue="Merchant OS Setup"
											>
												<option>Merchant OS Setup</option>
												<option>Software Bug Report</option>
												<option>Partnerships</option>
											</select>
											<span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
												▼
											</span>
										</div>
									</div>
									<div className="space-y-2">
										<label className="ml-1 text-sm font-bold tracking-tight text-slate-600" htmlFor="contact-message">
											Message
										</label>
										<textarea
											id="contact-message"
											name="message"
											rows={5}
											className={`${inputClassName} resize-none`}
											placeholder="How can we help you?"
										/>
									</div>
								</div>
								<button
									type="submit"
									className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#004bc3] to-[#1562f0] py-5 text-lg font-bold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-[#1562f0]/20 active:scale-[0.98]"
								>
									Send Message
									<Send className="h-5 w-5" />
								</button>
							</form>
						</div>
					</div>
				</section>
			</main>

			<footer className="bg-slate-50 pb-12 pt-12">
				<div className="mx-auto flex max-w-7xl flex-col items-center px-6 text-center">
					<div className="flex w-full flex-col items-center justify-between border-t border-slate-200 pt-8 text-xs font-mono text-slate-500 md:flex-row">
						<p>© {new Date().getFullYear()} Beamio Core. All rights reserved.</p>
						<div className="mt-4 flex gap-6 md:mt-0">
							<a
								href="https://github.com/petersunquest/android-init-NDEF/tree/main/src"
								target="_blank"
								rel="noreferrer"
								className="transition-colors hover:text-slate-900"
							>
								GitHub
							</a>
							<a
								href="https://x.com/beamioapp"
								target="_blank"
								rel="noreferrer"
								className="transition-colors hover:text-slate-900"
							>
								X
							</a>
							<Link to="/contact" className="transition-colors hover:text-slate-900">
								Contact
							</Link>
							<Link to="/terms" className="transition-colors hover:text-slate-900">
								Terms
							</Link>
							<Link to="/privacy" className="transition-colors hover:text-slate-900">
								Privacy
							</Link>
						</div>
					</div>
				</div>
			</footer>
		</div>
	)
}
