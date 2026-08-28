import React, { FormEvent, useEffect, useState } from 'react'
import { Mail, MessageSquareText, ShieldCheck } from 'lucide-react'
import { ConetSiteShell, ExternalLink } from '../components/ConetSiteShell'

export default function ContactPage() {
	const [submitted, setSubmitted] = useState(false)
	useEffect(() => { document.title = 'Contact | CoNET' }, [])

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()
		setSubmitted(true)
	}

	return (
		<ConetSiteShell>
			<main className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
				<div className="mx-auto max-w-5xl">
					<p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">Contact</p>
					<h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-white sm:text-6xl">Talk to the CoNET community.</h1>
					<p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">For technical questions, begin with the public documentation. For general enquiries, send a message and include enough context for someone to respond.</p>
					<div className="mt-12 grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
						<div className="space-y-4">
							<ExternalLink href="https://gitbook.conet.network/" className="block rounded-2xl border border-white/10 bg-[#18191f] p-6 transition hover:border-cyan-300/40">
								<MessageSquareText className="h-6 w-6 text-cyan-300" aria-hidden="true" />
								<h2 className="mt-5 font-semibold text-white">Technical documentation</h2>
								<p className="mt-2 text-sm leading-6 text-slate-400">Protocol references, developer guides, and maturity notes.</p>
							</ExternalLink>
							<a href="mailto:contact@conet.network" className="block rounded-2xl border border-white/10 bg-[#18191f] p-6 transition hover:border-cyan-300/40">
								<Mail className="h-6 w-6 text-cyan-300" aria-hidden="true" />
								<h2 className="mt-5 font-semibold text-white">General contact</h2>
								<p className="mt-2 text-sm leading-6 text-slate-400">contact@conet.network</p>
							</a>
							<div className="rounded-2xl border border-amber-300/20 bg-amber-300/5 p-6">
								<ShieldCheck className="h-6 w-6 text-amber-300" aria-hidden="true" />
								<p className="mt-4 text-sm leading-6 text-slate-300">Never send a private key, seed phrase, or other signing material through this form or email.</p>
							</div>
						</div>
						<form onSubmit={handleSubmit} className="rounded-2xl border border-white/10 bg-[#18191f] p-6 sm:p-8">
							<label htmlFor="contact-email" className="text-sm font-semibold text-slate-200">Email</label>
							<input id="contact-email" type="email" required autoComplete="email" className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-white outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20" />
							<label htmlFor="contact-topic" className="mt-5 block text-sm font-semibold text-slate-200">Topic</label>
							<input id="contact-topic" required className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-white outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20" />
							<label htmlFor="contact-message" className="mt-5 block text-sm font-semibold text-slate-200">Message</label>
							<textarea id="contact-message" required rows={6} className="mt-2 w-full resize-y rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-white outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20" />
							{submitted ? <p className="mt-5 rounded-xl border border-amber-300/20 bg-amber-300/5 p-4 text-sm leading-6 text-amber-100" role="alert">This form is not connected to a delivery service yet. Please email contact@conet.network instead.</p> : null}
							<button type="submit" className="mt-6 rounded-xl bg-gradient-to-r from-cyan-300 to-purple-400 px-5 py-3 text-sm font-bold text-slate-950 hover:brightness-110">Review message</button>
						</form>
					</div>
				</div>
			</main>
		</ConetSiteShell>
	)
}
