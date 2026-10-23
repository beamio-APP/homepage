import React, { useEffect, useMemo, useState } from 'react'
import { ethers } from 'ethers'
import { QRCodeCanvas } from 'qrcode.react'
import {
	BEAMIO_ANDROID_STORE_URL,
	BEAMIO_IOS_STORE_URL,
	isAndroidDevice,
	isIosDevice,
} from '../utils/nativeAppDownload'
import {
	fetchDiscoverIssuerProfile,
	formatBeamioTagDisplayLine,
	humanProfileName,
	issuerAvatarSrc,
} from '../utils/discoverIssuerProfile'

export type InvitationCtaMode = 'open_app' | 'store' | 'enter_pwa'

type Props = {
	/** Desktop: QR + Enter Beamio. Mobile: primary compact CTA (open app / store badge). */
	variant: 'desktop' | 'mobile'
	/** Absolute URL for QR (usually current /app-download share URL). */
	qrValue: string
	/** Inviter EOA from `invite=` (or share meta). */
	inviteEoa: string | null
	/**
	 * Mobile CTA:
	 * - `open_app` — Consumer likely installed → 「Open Beamio App」
	 * - `store` — not installed → App Store / Play badge only (no 「Enter Beamio」)
	 * - `enter_pwa` — desktop / non-mobile → 「Enter Beamio」→ PWA
	 */
	ctaMode: InvitationCtaMode
	/** Platform store URL (iOS App Store or Play with deep-link referrer). */
	storeUrl: string
	onOpenApp: () => void
	onEnterBeamio: () => void
	/** Optional: stash deep link before navigating to the store. */
	onStoreBadgeClick?: () => void
}

/**
 * Personal invite share landing (`#beamio-invitation`).
 * Visual system matches the product invitation mock (blue gradient card + inviter chip).
 */
export default function AppDownloadPersonalInvitation({
	variant,
	qrValue,
	inviteEoa,
	ctaMode,
	storeUrl,
	onOpenApp,
	onEnterBeamio,
	onStoreBadgeClick,
}: Props) {
	const [tag, setTag] = useState('')
	const [displayName, setDisplayName] = useState('')
	const [avatarUrl, setAvatarUrl] = useState('')

	useEffect(() => {
		let cancelled = false
		if (!inviteEoa) {
			setTag('')
			setDisplayName('')
			setAvatarUrl('')
			return
		}
		void fetchDiscoverIssuerProfile(inviteEoa).then((profile) => {
			if (cancelled || !profile) return
			const at = formatBeamioTagDisplayLine(profile.username)
			setTag(at === '@Beamio' ? '' : at)
			setDisplayName(humanProfileName(profile.firstName, profile.lastName))
			setAvatarUrl(issuerAvatarSrc(profile))
		})
		return () => {
			cancelled = true
		}
	}, [inviteEoa])

	const inviterLabel = useMemo(() => {
		const at = tag.trim() ? (tag.startsWith('@') ? tag : `@${tag}`) : ''
		const tagPlain = at.replace(/^@+/, '')
		const rawName = displayName.trim()
		const name =
			rawName && rawName.toLowerCase() !== tagPlain.toLowerCase() ? rawName : ''
		return { name, at }
	}, [displayName, tag])

	const leadWho = inviterLabel.name || inviterLabel.at || 'A friend'
	const avatarInitial = (inviterLabel.at.replace(/^@+/, '').charAt(0) || 'B').toUpperCase()
	const chipAvatarSrc = inviterLabel.at ? avatarUrl : ''

	const ios = isIosDevice()
	const android = isAndroidDevice()
	const storeBadgeSrc = ios
		? '/app-store-badge.png'
		: android
			? '/google-play-badge.png'
			: ''
	const storeBadgeAlt = ios
		? 'Download on the App Store'
		: android
			? 'Get it on Google Play'
			: 'Get the Beamio app'

	const showOpenApp = ctaMode === 'open_app'
	const showEnterPwa = ctaMode === 'enter_pwa'
	const showStoreBadge = ctaMode === 'store' && Boolean(storeUrl)

	const storeBadgeEl =
		storeBadgeSrc ? (
			<a
				href={storeUrl}
				className="bi-store-badge bi-primary-compact"
				onClick={() => onStoreBadgeClick?.()}
				aria-label={storeBadgeAlt}
			>
				<img src={storeBadgeSrc} alt={storeBadgeAlt} className="bi-store-badge-img" />
			</a>
		) : (
			<div className="bi-store-badge-row bi-primary-compact" role="group" aria-label="Get the Beamio app">
				<a
					href={BEAMIO_IOS_STORE_URL}
					className="bi-store-badge"
					onClick={() => onStoreBadgeClick?.()}
					aria-label="Download on the App Store"
				>
					<img src="/app-store-badge.png" alt="Download on the App Store" className="bi-store-badge-img" />
				</a>
				<a
					href={BEAMIO_ANDROID_STORE_URL}
					className="bi-store-badge"
					onClick={() => onStoreBadgeClick?.()}
					aria-label="Get it on Google Play"
				>
					<img src="/google-play-badge.png" alt="Get it on Google Play" className="bi-store-badge-img" />
				</a>
			</div>
		)

	const mobilePrimary = showOpenApp ? (
		<button type="button" className="bi-primary bi-primary-compact" onClick={onOpenApp}>
			Open Beamio App
		</button>
	) : showStoreBadge ? (
		storeBadgeEl
	) : showEnterPwa ? (
		<button type="button" className="bi-primary bi-primary-compact" onClick={onEnterBeamio}>
			Enter Beamio
		</button>
	) : null

	const desktopPrimary =
		showEnterPwa || ctaMode === 'enter_pwa' ? (
			<button type="button" className="bi-primary" onClick={onEnterBeamio}>
				Enter Beamio
			</button>
		) : showOpenApp ? (
			<button type="button" className="bi-primary" onClick={onOpenApp}>
				Open Beamio App
			</button>
		) : showStoreBadge ? (
			storeBadgeEl
		) : (
			<button type="button" className="bi-primary" onClick={onEnterBeamio}>
				Enter Beamio
			</button>
		)

	const desktopNote =
		ctaMode === 'enter_pwa'
			? (
					<>
						Open Beamio in your browser to continue.
						<br />
						No app store install required on desktop.
					</>
				)
			: showStoreBadge
				? (
						<>
							Install Beamio from the store, then return to this invitation.
						</>
					)
				: (
						<>
							Opens the Beamio app when it is installed on this device.
						</>
					)

	return (
		<div id="beamio-invitation" className="bi-root" data-variant={variant}>
			<style>{INVITE_CSS}</style>
			<header className="bi-header">
				<div className="bi-wordmark">Beamio</div>
				{inviteEoa || inviterLabel.at ? (
					<div
						className="bi-inviter"
						title={inviterLabel.at || undefined}
						aria-label={inviterLabel.at ? `Invited by ${inviterLabel.at}` : 'Invited by a Beamio member'}
					>
						<div className="bi-avatar" aria-hidden>
							{chipAvatarSrc ? (
								<img src={chipAvatarSrc} alt="" className="bi-avatar-img" />
							) : (
								avatarInitial
							)}
						</div>
						<span className="bi-inviter-copy">
							{inviterLabel.name ? (
								<span className="bi-inviter-name">{inviterLabel.name}</span>
							) : null}
							<span className="bi-inviter-tag">{inviterLabel.at || '…'}</span>
						</span>
					</div>
				) : (
					<div className="bi-header-note">Personal invitation</div>
				)}
			</header>

			<main className="bi-layout">
				<section className="bi-intro">
					<h1>
						You&apos;re invited
						<br className="bi-title-break" /> to Beamio
					</h1>
					<p className="bi-lead">
						{leadWho} invited you to join Beamio — payments, memberships, and local
						commerce in one place.
					</p>
					<div className="bi-accent" aria-hidden />
					<div className="bi-value">
						<span className="bi-value-icon" aria-hidden>
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
								<path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
								<circle cx="12" cy="12" r="3" />
							</svg>
						</span>
						<span>
							Open your invitation to continue with Beamio on web or in the app.
						</span>
					</div>
					{mobilePrimary}
				</section>

				{variant === 'desktop' ? (
					<section className="bi-continue" aria-label="Continue on desktop">
						<div className="bi-desktop">
							<h2>Continue on desktop</h2>
							<p className="bi-copy">
								{ctaMode === 'enter_pwa'
									? 'Scan this QR code with your phone to open the invitation there, or continue in the browser below.'
									: 'Scan this QR code with your phone to open the invitation on mobile.'}
							</p>
							<div className="bi-qr">
								{qrValue ? (
									<QRCodeCanvas
										value={qrValue}
										size={180}
										level="M"
										includeMargin={false}
										bgColor="#ffffff"
										fgColor="#000000"
										className="block"
									/>
								) : (
									<span className="bi-qr-placeholder">Invitation QR</span>
								)}
							</div>
							{desktopPrimary}
							<p className="bi-install-note">{desktopNote}</p>
						</div>
					</section>
				) : null}
			</main>
		</div>
	)
}

/** Parse `invite=` EOA from an absolute `/app/` target URL. */
export function parseInviteEoaFromAppTarget(targetUrl: string | null | undefined): string | null {
	if (!targetUrl) return null
	try {
		const u = new URL(targetUrl)
		const raw = u.searchParams.get('invite')?.trim() || u.searchParams.get('Invite')?.trim() || ''
		if (!raw || !/^0x[0-9a-fA-F]{40}$/.test(raw)) return null
		return ethers.getAddress(raw)
	} catch {
		return null
	}
}

const INVITE_CSS = `
#beamio-invitation.bi-root{
  --bi-card:#ffffff;
  --bi-ink:#0b114b;
  --bi-sub:#68799b;
  --bi-line:#e2eaf7;
  --bi-blue:#1261f3;
  --bi-onblue:#ffffff;
  --bi-purple:#7753b7;
  --bi-purplebg:#f0eafa;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  color:var(--bi-ink);
  background:radial-gradient(ellipse at 95% 25%,#b9dbffbb,transparent 55%),linear-gradient(155deg,#f5faff,#eaf5ff);
  border:1px solid #e8f3ff;
  border-radius:32px;
  padding:30px 40px 24px;
  max-width:1120px;
  margin:0 auto;
  box-sizing:border-box;
}
#beamio-invitation.bi-root *{box-sizing:border-box}
#beamio-invitation.bi-root button{font:inherit;cursor:pointer}
#beamio-invitation .bi-header{display:flex;align-items:center;justify-content:space-between;gap:18px;padding-bottom:10px;border:0}
#beamio-invitation .bi-wordmark{font-size:25px;font-weight:650;letter-spacing:-1px;color:var(--bi-ink)}
#beamio-invitation .bi-header-note{font-size:12px;color:var(--bi-sub)}
#beamio-invitation .bi-layout{display:grid;grid-template-columns:minmax(0,1fr) 330px;gap:56px;align-items:center;padding:37px 0 27px}
#beamio-invitation .bi-inviter{display:inline-flex;align-items:center;gap:9px;padding:6px 14px 6px 6px;background:var(--bi-card);border:1px solid #ffffff;border-radius:40px;font-size:12px;color:var(--bi-sub);box-shadow:0 6px 20px #3b619b08;max-width:min(240px,58vw)}
#beamio-invitation .bi-avatar{width:29px;height:29px;background:var(--bi-purplebg);color:var(--bi-purple);border-radius:50%;display:grid;place-items:center;font-size:12px;font-weight:600;overflow:hidden;flex-shrink:0}
#beamio-invitation .bi-avatar-img{width:100%;height:100%;object-fit:cover;display:block}
#beamio-invitation .bi-inviter-copy{display:flex;flex-direction:column;align-items:flex-start;min-width:0;line-height:1.15}
#beamio-invitation .bi-inviter-name{font-weight:650;color:var(--bi-ink);font-size:12px;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#beamio-invitation .bi-inviter-tag{font-weight:650;color:var(--bi-ink);font-size:12px;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#beamio-invitation .bi-inviter-name + .bi-inviter-tag{font-weight:550;font-size:11px;color:var(--bi-sub)}
#beamio-invitation h1{font-size:clamp(36px,5vw,64px);line-height:1.04;font-weight:650;letter-spacing:-2.6px;margin:0 0 21px}
#beamio-invitation h1 span{background:linear-gradient(155deg,#56b0ff,#1260f5);background-clip:text;-webkit-background-clip:text;color:transparent}
#beamio-invitation .bi-lead{font-size:21px;line-height:1.5;letter-spacing:-.3px;max-width:none;color:var(--bi-sub);margin:0}
#beamio-invitation .bi-accent{height:4px;width:43px;border-radius:8px;background:var(--bi-blue);margin:23px 0}
#beamio-invitation .bi-value{display:flex;align-items:center;gap:11px;max-width:325px;font-size:13px;color:var(--bi-sub);line-height:1.6}
#beamio-invitation .bi-value-icon{display:grid;place-items:center;flex-shrink:0;width:34px;height:34px;border-radius:50%;background:#fff4d1;color:#a66d00}
#beamio-invitation .bi-continue{padding:28px 24px;background:var(--bi-card);border:1px solid #ffffff;border-radius:29px;box-shadow:0 22px 45px #4977af12;text-align:center}
#beamio-invitation h2{font-size:20px;line-height:1.3;letter-spacing:-.5px;font-weight:600;margin:0 0 9px;color:var(--bi-ink)}
#beamio-invitation .bi-copy{font-size:13px;color:var(--bi-sub);line-height:1.65;margin:0}
#beamio-invitation .bi-qr{width:204px;max-width:100%;aspect-ratio:1;margin:24px auto 22px;padding:12px;border:1px solid #e2eaf7;border-radius:21px;background:#fff;color:#111;display:grid;place-items:center}
#beamio-invitation .bi-qr-placeholder{font-size:12px;color:var(--bi-sub)}
#beamio-invitation .bi-primary{width:100%;min-height:54px;border:0;border-radius:50px;background:var(--bi-blue);color:var(--bi-onblue);display:flex;align-items:center;justify-content:center;gap:9px;font-size:15px;font-weight:550;margin:0 0 19px;box-shadow:0 7px 18px #1261f31f}
#beamio-invitation .bi-primary:hover{filter:brightness(1.05)}
#beamio-invitation .bi-desktop .bi-primary{margin-top:4px}
#beamio-invitation .bi-primary-compact{display:none;margin:28px 0 0;max-width:100%}
#beamio-invitation .bi-store-badge{display:inline-flex;align-items:center;justify-content:center;width:100%;min-height:54px;padding:6px 0;border-radius:12px;background:#000;text-decoration:none;margin:0 0 19px}
#beamio-invitation .bi-store-badge:hover{opacity:.92}
#beamio-invitation .bi-store-badge-img{height:44px;width:auto;max-width:100%;object-fit:contain;display:block}
#beamio-invitation .bi-store-badge-row{display:flex;flex-direction:column;gap:10px;width:100%;margin:0 0 19px}
#beamio-invitation .bi-store-badge-row .bi-store-badge{margin:0}
#beamio-invitation .bi-primary-compact.bi-store-badge,#beamio-invitation .bi-primary-compact.bi-store-badge-row{margin:28px 0 0}
#beamio-invitation .bi-install-note{font-size:11px;line-height:1.6;margin-top:17px;color:var(--bi-sub)}
#beamio-invitation[data-variant=mobile]{max-width:480px;padding:23px 22px 22px;border-radius:28px}
#beamio-invitation[data-variant=mobile] .bi-header{gap:8px;padding-bottom:0}
#beamio-invitation[data-variant=mobile] .bi-wordmark{font-size:22px}
#beamio-invitation[data-variant=mobile] .bi-inviter{font-size:10px;padding-right:10px;gap:7px}
#beamio-invitation[data-variant=mobile] .bi-avatar{width:25px;height:25px;font-size:11px}
#beamio-invitation[data-variant=mobile] .bi-layout{display:block;padding:35px 0 6px}
#beamio-invitation[data-variant=mobile] .bi-intro{text-align:left}
#beamio-invitation[data-variant=mobile] h1{font-size:40px;letter-spacing:-1.7px;line-height:1.06;margin:0 0 15px}
#beamio-invitation[data-variant=mobile] .bi-title-break{display:none}
#beamio-invitation[data-variant=mobile] .bi-value-break{display:none}
#beamio-invitation[data-variant=mobile] .bi-lead{font-size:15px;margin:0;letter-spacing:-.2px}
#beamio-invitation[data-variant=mobile] .bi-accent{margin:18px 0}
#beamio-invitation[data-variant=mobile] .bi-value{font-size:12px;gap:9px;max-width:none}
#beamio-invitation[data-variant=mobile] .bi-value-icon{width:30px;height:30px}
#beamio-invitation[data-variant=mobile] .bi-primary-compact{display:flex}
@media(max-width:900px) and (min-width:701px){
  #beamio-invitation[data-variant=desktop]{padding:25px}
  #beamio-invitation[data-variant=desktop] .bi-layout{grid-template-columns:minmax(0,1fr) 290px;gap:28px}
  #beamio-invitation[data-variant=desktop] .bi-continue{padding:24px 18px}
  #beamio-invitation[data-variant=desktop] .bi-lead{font-size:15px}
  #beamio-invitation[data-variant=desktop] h1{letter-spacing:-1.6px}
}
/* Narrow viewport (incl. resized desktop UA): match mobile mock — no QR panel */
@media(max-width:700px){
  #beamio-invitation.bi-root{max-width:480px;padding:23px 22px 22px;border-radius:28px}
  #beamio-invitation .bi-header{gap:8px;padding-bottom:0}
  #beamio-invitation .bi-wordmark{font-size:22px}
  #beamio-invitation .bi-inviter{font-size:10px;padding-right:10px;gap:7px}
  #beamio-invitation .bi-avatar{width:25px;height:25px;font-size:11px}
  #beamio-invitation .bi-layout{display:block;padding:35px 0 6px}
  #beamio-invitation .bi-intro{text-align:left}
  #beamio-invitation h1{font-size:40px;letter-spacing:-1.7px;line-height:1.06;margin:0 0 15px}
  #beamio-invitation .bi-title-break{display:none}
  #beamio-invitation .bi-value-break{display:none}
  #beamio-invitation .bi-lead{font-size:15px;margin:0;letter-spacing:-.2px}
  #beamio-invitation .bi-accent{margin:18px 0}
  #beamio-invitation .bi-value{font-size:12px;gap:9px;max-width:none}
  #beamio-invitation .bi-value-icon{width:30px;height:30px}
  #beamio-invitation .bi-continue{display:none}
  #beamio-invitation .bi-primary-compact{display:flex}
}
@media(max-width:350px){
  #beamio-invitation.bi-root{padding:20px 15px 16px}
  #beamio-invitation h1{font-size:34px}
  #beamio-invitation .bi-lead{font-size:13px}
}
`
