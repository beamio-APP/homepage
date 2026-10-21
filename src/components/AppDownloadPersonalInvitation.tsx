import React, { useEffect, useMemo, useState } from 'react'
import { ethers } from 'ethers'
import { Crown } from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'
import { BEAMIO_ANDROID_STORE_URL, BEAMIO_IOS_STORE_URL, isAndroidDevice, isIosDevice } from '../utils/nativeAppDownload'
import {
	fetchDiscoverIssuerProfile,
	formatBeamioTagDisplayLine,
	issuerAvatarSrc,
	type DiscoverIssuerProfile,
} from '../utils/discoverIssuerProfile'

export type AppDownloadPersonalInvitationVariant = 'desktop' | 'mobile'

type Props = {
	variant: AppDownloadPersonalInvitationVariant
	/** Absolute invite / app-download URL encoded in the QR (desktop). */
	qrValue: string
	/** Inviter EOA from `invite=` when present. */
	inviteEoa: string | null
	storeUrl: string
	onEnterBeamio: () => void
	onStoreBadgeClick?: () => void
}

function avatarInitial(tag: string, eoa: string | null): string {
	const plain = tag.replace(/^@+/, '').trim()
	if (plain) return plain.slice(0, 1).toUpperCase()
	if (eoa && eoa.length >= 4) return eoa.slice(2, 3).toUpperCase()
	return 'B'
}

/** Personal invitation landing — layout mirrors `sample/Beamio-Personal-Invitation`. */
export default function AppDownloadPersonalInvitation({
	variant,
	qrValue,
	inviteEoa,
	storeUrl,
	onEnterBeamio,
	onStoreBadgeClick,
}: Props) {
	const [inviter, setInviter] = useState<DiscoverIssuerProfile | null>(null)

	useEffect(() => {
		if (!inviteEoa) {
			setInviter(null)
			return
		}
		let cancelled = false
		void fetchDiscoverIssuerProfile(inviteEoa).then((profile) => {
			if (!cancelled) setInviter(profile)
		})
		return () => {
			cancelled = true
		}
	}, [inviteEoa])

	const tagLabel = useMemo(() => {
		if (inviter?.username) return formatBeamioTagDisplayLine(inviter.username)
		if (inviteEoa) {
			try {
				const a = ethers.getAddress(inviteEoa)
				return `${a.slice(0, 6)}…${a.slice(-4)}`
			} catch {
				return '@Beamio'
			}
		}
		return null
	}, [inviter, inviteEoa])

	const showInviter = Boolean(tagLabel)
	const ios = isIosDevice()
	const android = isAndroidDevice()
	const deviceAttr = ios ? 'ios' : android ? 'android' : 'unknown'
	const qrSize = 180

	return (
		<div
			id="beamio-invitation"
			data-device={deviceAttr}
			data-variant={variant}
			className="bi-root w-full text-left"
		>
			<style>{INVITE_CSS}</style>
			<header className="bi-header">
				<div className="bi-wordmark">Beamio</div>
				{showInviter ? (
					<div className="bi-inviter">
						<span className="bi-avatar" aria-hidden>
							{inviter?.image?.trim() ? (
								<img src={issuerAvatarSrc(inviter, inviteEoa || '')} alt="" className="bi-avatar-img" />
							) : (
								avatarInitial(tagLabel || '', inviteEoa)
							)}
						</span>
						<span>
							Invited by <strong>{tagLabel}</strong>
						</span>
					</div>
				) : (
					<div className="bi-header-note">Get Beamio</div>
				)}
			</header>

			<main className="bi-layout">
				<section className="bi-intro" aria-labelledby="bi-title">
					<h1 id="bi-title">
						One QR.
						<br />
						<span>
							More
							<br />
							Possibilities.
						</span>
					</h1>
					<p className="bi-lead">Pay. Top up. Earn. Connect.</p>
					<div className="bi-accent" aria-hidden />
					<div className="bi-value">
						<span className="bi-value-icon">
							<Crown className="h-[18px] w-[18px]" strokeWidth={2.25} aria-hidden />
						</span>
						<span>
							Reward PT, usable across
							<br />
							participating stores.
						</span>
					</div>
				</section>

				<section className="bi-continue" aria-label="Continue your invitation">
					{variant === 'desktop' ? (
						<div className="bi-desktop">
							<h2>Scan to get started</h2>
							<p className="bi-copy">Use your phone’s camera.</p>
							<div className="bi-qr" aria-label="Invitation QR code">
								{qrValue ? (
									<QRCodeCanvas
										value={qrValue}
										size={qrSize}
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
							<button type="button" className="bi-primary" onClick={onEnterBeamio}>
								Enter Beamio
							</button>
							<p className="bi-install-note">
								Open Beamio in your browser to continue.
								<br />
								No app store install required on desktop.
							</p>
						</div>
					) : (
						<div className="bi-mobile">
							{/* iPhone/Android samples: one platform CTA; unknown → both official badges. */}
							{!ios && !android ? (
								<p className="bi-store-label">Choose your app store</p>
							) : null}
							<div className="bi-badge-stack">
								{ios || (!ios && !android) ? (
									<a
										href={BEAMIO_IOS_STORE_URL}
										target="_blank"
										rel="noopener noreferrer"
										onClick={onStoreBadgeClick}
										className="bi-badge-link"
										aria-label="Download on the App Store"
									>
										<img src="/app-store-badge.png" alt="Download on the App Store" className="bi-badge-img" />
									</a>
								) : null}
								{android || (!ios && !android) ? (
									<a
										href={storeUrl || BEAMIO_ANDROID_STORE_URL}
										target="_blank"
										rel="noopener noreferrer"
										onClick={onStoreBadgeClick}
										className="bi-badge-link"
										aria-label="Get it on Google Play"
									>
										<img src="/google-play-badge.png" alt="Get it on Google Play" className="bi-badge-img" />
									</a>
								) : null}
							</div>
							<p className="bi-install-note">
								Registration completes automatically
								<br />
								after installation.
							</p>
						</div>
					)}
				</section>
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
#beamio-invitation .bi-inviter{display:inline-flex;align-items:center;gap:9px;padding:6px 12px 6px 6px;background:var(--bi-card);border:1px solid #ffffff;border-radius:40px;font-size:12px;color:var(--bi-sub);box-shadow:0 6px 20px #3b619b08}
#beamio-invitation .bi-avatar{width:29px;height:29px;background:var(--bi-purplebg);color:var(--bi-purple);border-radius:50%;display:grid;place-items:center;font-size:12px;font-weight:600;overflow:hidden;flex-shrink:0}
#beamio-invitation .bi-avatar-img{width:100%;height:100%;object-fit:cover;display:block}
#beamio-invitation .bi-inviter strong{font-weight:550;color:var(--bi-ink)}
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
#beamio-invitation .bi-store-label{font-size:12px;color:var(--bi-sub);margin:0 0 12px}
#beamio-invitation .bi-badge-stack{display:flex;flex-direction:column;align-items:center;gap:12px;margin:0 0 4px}
#beamio-invitation .bi-badge-link{display:flex;justify-content:center;transition:opacity .15s}
#beamio-invitation .bi-badge-link:hover{opacity:.85}
#beamio-invitation .bi-badge-img{height:52px;width:auto;max-width:100%;display:block}
#beamio-invitation .bi-install-note{font-size:11px;line-height:1.6;margin-top:17px;color:var(--bi-sub)}
#beamio-invitation[data-variant=mobile]{max-width:480px;padding:23px 22px 18px;border-radius:28px}
#beamio-invitation[data-variant=mobile] .bi-header{gap:8px;padding-bottom:0}
#beamio-invitation[data-variant=mobile] .bi-wordmark{font-size:22px}
#beamio-invitation[data-variant=mobile] .bi-inviter{font-size:10px;padding-right:10px;gap:7px}
#beamio-invitation[data-variant=mobile] .bi-avatar{width:25px;height:25px;font-size:11px}
#beamio-invitation[data-variant=mobile] .bi-layout{display:block;padding:35px 0 10px}
#beamio-invitation[data-variant=mobile] .bi-intro{text-align:left}
#beamio-invitation[data-variant=mobile] h1{font-size:40px;letter-spacing:-1.7px;line-height:1.06;margin:0 0 15px}
#beamio-invitation[data-variant=mobile] .bi-lead{font-size:15px;margin:0;letter-spacing:-.2px}
#beamio-invitation[data-variant=mobile] .bi-accent{margin:18px 0}
#beamio-invitation[data-variant=mobile] .bi-value{font-size:12px;gap:9px}
#beamio-invitation[data-variant=mobile] .bi-value-icon{width:30px;height:30px}
#beamio-invitation[data-variant=mobile] .bi-continue{margin-top:26px;padding:21px 18px;border-radius:24px}
#beamio-invitation[data-variant=mobile] .bi-badge-stack{margin:0}
#beamio-invitation[data-variant=mobile] .bi-install-note{padding-top:15px;margin-top:0;border-top:1px solid var(--bi-line)}
@media(max-width:900px) and (min-width:701px){
  #beamio-invitation[data-variant=desktop]{padding:25px}
  #beamio-invitation[data-variant=desktop] .bi-layout{grid-template-columns:minmax(0,1fr) 290px;gap:28px}
  #beamio-invitation[data-variant=desktop] .bi-continue{padding:24px 18px}
  #beamio-invitation[data-variant=desktop] .bi-lead{font-size:15px}
  #beamio-invitation[data-variant=desktop] h1{letter-spacing:-1.6px}
}
@media(max-width:350px){
  #beamio-invitation[data-variant=mobile]{padding:20px 15px 16px}
  #beamio-invitation[data-variant=mobile] h1{font-size:34px}
  #beamio-invitation[data-variant=mobile] .bi-lead{font-size:13px}
  #beamio-invitation[data-variant=mobile] .bi-continue{padding:18px 14px}
}
`
