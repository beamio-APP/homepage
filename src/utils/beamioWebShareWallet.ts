import { argon2id } from '@noble/hashes/argon2'
import { ethers } from 'ethers'
import PouchDB from 'pouchdb'
import uuid62 from 'uuid62'

/** Same DB name as SilentPassUI — shared IndexedDB on beamio.app. */
export const BEAMIO_POUCHDB_NAME = 'conet'
const BEAMIO_ADD_USER_URL = 'https://beamio.app/api/addUser'
const CHECK_STORAGE_TIMEOUT_MS = 8_000

const enc = new TextEncoder()

let CoNET_Data: encrypt_keys_object | null = null

function setCoNET_Data(data: encrypt_keys_object | null): void {
	CoNET_Data = data
}

function customJsonStringify(item: unknown): string {
	return JSON.stringify(item, (_key, value) => (typeof value === 'bigint' ? value.toString() : value))
}

export function toBase64(s: string): string {
	const bytes = enc.encode(s)
	let binary = ''
	for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!)
	return btoa(binary)
}

function b64ToBytes(b64: string): Uint8Array {
	const bin = atob(b64)
	const out = new Uint8Array(bin.length)
	for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
	return out
}

function bytesToB64(bytes: Uint8Array): string {
	let binary = ''
	for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!)
	return btoa(binary)
}

function b64encode(bytes: Uint8Array): string {
	return bytesToB64(bytes)
}

function initProfileTokens(): Record<string, unknown> {
	return {
		conet: { balance: '0', network: 'CONET Holesky', decimal: 18, contract: '', name: 'conet' },
		eth: { balance: '0', network: 'ETH', decimal: 18, contract: '', name: 'eth' },
	}
}

function isValidEthersPrivateKey(pk: unknown): pk is string {
	if (!pk || typeof pk !== 'string') return false
	const s = String(pk).trim().replace(/^0x/i, '')
	return /^[0-9a-fA-F]{64}$/.test(s)
}

function ensureFlatProfiles(p: profile[] | undefined): profile[] {
	if (!p?.length) return []
	const first = p[0]
	if (Array.isArray(first)) return (p as unknown as profile[][]).flat()
	return p
}

function createKeyHDWallet(secretPhrase: string | null): ethers.HDNodeWallet | ethers.Wallet | null {
	try {
		if (!secretPhrase) return ethers.Wallet.createRandom()
		return ethers.Wallet.fromPhrase(secretPhrase)
	} catch {
		return null
	}
}

function ensureProfilePrivateKeyArmorFromMnemonic(data: encrypt_keys_object | null): encrypt_keys_object | null {
	if (!data?.profiles?.length) return data
	const profiles = ensureFlatProfiles(data.profiles)
	const p0 = profiles[0]
	if (!p0) return data
	if (p0.privateKeyArmor?.trim()) {
		if (profiles === data.profiles) return data
		return { ...data, profiles }
	}
	const phrase = data.mnemonicPhrase?.trim() ?? ''
	if (!phrase) return data
	const acc = createKeyHDWallet(phrase)
	if (!acc) return data
	const keyID = p0.keyID?.trim() ?? ''
	if (keyID && ethers.isAddress(keyID) && acc.address.toLowerCase() !== keyID.toLowerCase()) {
		return data
	}
	const nextProfile: profile = {
		...p0,
		privateKeyArmor: acc.signingKey.privateKey,
		publicKeyArmor: acc.publicKey,
		keyID: keyID || acc.address,
	}
	return { ...data, profiles: [nextProfile, ...profiles.slice(1)] }
}

function hashPasswordBrowser(password: string): Argon2idHash {
	const salt = crypto.getRandomValues(new Uint8Array(16))
	const hash = argon2id(enc.encode(password), salt, { m: 32 * 1024, t: 3, p: 1, dkLen: 32 })
	return {
		algo: 'argon2id',
		v: 19,
		m: 32 * 1024,
		t: 3,
		p: 1,
		salt: b64encode(salt),
		hash: b64encode(hash),
	}
}

async function deriveAesKeyFromPassword(password: string, stored: Argon2idHash): Promise<CryptoKey> {
	const keyBytes = Uint8Array.from(
		argon2id(enc.encode(password), b64ToBytes(stored.salt), {
			m: stored.m,
			t: stored.t,
			p: stored.p,
			dkLen: 32,
		}),
	)
	return crypto.subtle.importKey('raw', keyBytes, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt'])
}

async function aesGcmEncryptWithStored(plaintext: string, password: string, stored: Argon2idHash): Promise<string> {
	const key = await deriveAesKeyFromPassword(password, stored)
	const iv = crypto.getRandomValues(new Uint8Array(12))
	const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(plaintext))
	const cipherBytes = new Uint8Array(encrypted)
	const combined = new Uint8Array(iv.length + cipherBytes.length)
	combined.set(iv, 0)
	combined.set(cipherBytes, iv.length)
	return bytesToB64(combined)
}

function generateCODE(passcode: string): { code: string; hash: string } {
	const code = uuid62.v4()
	const hash = ethers.solidityPackedKeccak256(['string', 'string'], [code, passcode])
	return { code, hash }
}

function buildMinimalBeamioFromAccountName(accountName: string): beamio {
	return {
		accountName,
		firstName: '',
		lastName: '',
		image: '',
		darkTheme: false,
		isUSDCFaucet: false,
		isETHFaucet: false,
		initialLoading: true,
		createdAt: Date.now(),
		language: 'en',
		currency: 'USD',
		tax: '0',
	}
}

async function storageHashData(docId: string, dataB64: string): Promise<void> {
	const database = new PouchDB(BEAMIO_POUCHDB_NAME, { auto_compaction: true })
	const putWithRev = (rev: string) => database.put({ _id: docId, title: dataB64, _rev: rev })

	for (let attempt = 0; attempt < 3; attempt++) {
		try {
			const doc = await database.get(docId, { latest: true })
			await putWithRev(doc._rev)
			return
		} catch (ex: unknown) {
			const err = ex as { status?: number; name?: string }
			if (err?.status === 409 || err?.name === 'conflict') {
				await new Promise((r) => setTimeout(r, 30 + attempt * 50))
				continue
			}
			if (/^not_found/.test(err?.name ?? '')) {
				try {
					await database.post({ _id: docId, title: dataB64 })
					return
				} catch (postEx: unknown) {
					const pe = postEx as { status?: number; name?: string }
					if (pe?.status === 409 || pe?.name === 'conflict') {
						await new Promise((r) => setTimeout(r, 30))
						continue
					}
					return
				}
			}
			return
		}
	}
}

async function flushStoreSystemData(): Promise<void> {
	if (!CoNET_Data) return
	const temp = { ...CoNET_Data }
	if (temp.profiles) temp.profiles = ensureFlatProfiles(temp.profiles)
	const dataB64 = toBase64(customJsonStringify(temp))
	await storageHashData('init', dataB64)
}

export async function checkBeamioWalletStorage(): Promise<encrypt_keys_object | null> {
	try {
		const database = new PouchDB(BEAMIO_POUCHDB_NAME, { auto_compaction: true })
		const doc = await database.get<{ title: string }>('init', { latest: true })
		const json = new TextDecoder().decode(b64ToBytes(doc.title))
		const data = JSON.parse(json) as encrypt_keys_object
		const hydrated = ensureProfilePrivateKeyArmorFromMnemonic(data)
		setCoNET_Data(hydrated)
		return hydrated
	} catch {
		return null
	}
}

export async function checkBeamioWalletStorageWithTimeout(
	timeoutMs = CHECK_STORAGE_TIMEOUT_MS,
): Promise<encrypt_keys_object | null> {
	if (typeof window === 'undefined') return null
	return Promise.race([
		checkBeamioWalletStorage().catch(() => null),
		new Promise<null>((resolve) => {
			window.setTimeout(() => resolve(null), timeoutMs)
		}),
	])
}

export function hasLocalPlaintextMnemonic(data: encrypt_keys_object | null | undefined): boolean {
	return Boolean(typeof data?.mnemonicPhrase === 'string' && data.mnemonicPhrase.trim())
}

export function hasCompletedBeamioAccount(data: encrypt_keys_object | null | undefined): boolean {
	if (!data) return false
	const eoa = data.profiles?.[0]?.keyID
	if (!eoa || !ethers.isAddress(eoa)) return false
	const accountName = data.beamio?.accountName
	return Boolean(accountName && typeof accountName === 'string' && accountName.trim())
}

async function createFreshWalletBlob(): Promise<encrypt_keys_object | null> {
	const acc = createKeyHDWallet(null)
	if (!acc || !('mnemonic' in acc) || !acc.mnemonic?.phrase) return null

	const profile: profile = {
		tokens: initProfileTokens(),
		publicKeyArmor: acc.publicKey,
		keyID: acc.address,
		isPrimary: true,
		referrer: null,
		isNode: false,
		privateKeyArmor: acc.signingKey.privateKey,
		hdPath: acc.path ?? null,
		index: acc.index,
		type: 'ethereum',
		webFilter: true,
	}

	const data: encrypt_keys_object = {
		mnemonicPhrase: acc.mnemonic.phrase,
		profiles: [profile],
		isReady: true,
		ver: 0,
		nonce: 0,
	}
	setCoNET_Data(data)
	return data
}

type AccountRecover = { hash: string; encrypto: string }

async function registerBeamioAccount(beamioTag: string, privateKey: string, mnemonicPhrase: string): Promise<boolean> {
	const recoverCode = generateCODE('')
	const pin = uuid62.v4()
	const stored = hashPasswordBrowser(pin)
	const phraseBase64 = toBase64(mnemonicPhrase)
	const img = await aesGcmEncryptWithStored(phraseBase64, recoverCode.code, stored)
	const img1 = await aesGcmEncryptWithStored(phraseBase64, pin, stored)
	const storageEncryptedImg = toBase64(JSON.stringify({ stored, img }))
	const hash = ethers.solidityPackedKeccak256(['string'], [beamioTag])
	const storageEncryptedImg1 = toBase64(JSON.stringify({ stored, img: img1 }))
	const recover: AccountRecover[] = [
		{ hash: recoverCode.hash, encrypto: storageEncryptedImg },
		{ hash, encrypto: storageEncryptedImg1 },
	]

	const signWallet = new ethers.Wallet(privateKey)
	const signMessage = await signWallet.signMessage(signWallet.address)
	try {
		const resp = await fetch(BEAMIO_ADD_USER_URL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				accountName: beamioTag,
				recover,
				wallet: signWallet.address,
				signMessage,
			}),
		})
		return resp.ok
	} catch {
		return false
	}
}

/**
 * Discover share landing: reuse PWA wallet or silently create 12-word + `web_${uuid62}` tag.
 */
export async function provisionWebShareVisitWallet(): Promise<encrypt_keys_object | null> {
	const stored = await checkBeamioWalletStorageWithTimeout()
	const hydrated = ensureProfilePrivateKeyArmorFromMnemonic(stored) ?? stored
	if (hydrated && hasLocalPlaintextMnemonic(hydrated) && hasCompletedBeamioAccount(hydrated)) {
		return hydrated
	}

	const fresh = await createFreshWalletBlob()
	if (!fresh?.mnemonicPhrase || !fresh.profiles?.length) return null

	const privateKey = fresh.profiles[0]?.privateKeyArmor
	if (!isValidEthersPrivateKey(privateKey)) return null

	const beamioTag = `web_${uuid62.v4()}`
	const registered = await registerBeamioAccount(beamioTag, privateKey, fresh.mnemonicPhrase)
	if (!registered) return null

	fresh.beamio = buildMinimalBeamioFromAccountName(beamioTag)
	setCoNET_Data(fresh)
	await flushStoreSystemData()
	return fresh
}

export function resolveSigningWalletFromBlob(data: encrypt_keys_object | null): ethers.Wallet | null {
	const hydrated = ensureProfilePrivateKeyArmorFromMnemonic(data)
	const pk = hydrated?.profiles?.[0]?.privateKeyArmor
	if (!isValidEthersPrivateKey(pk)) return null
	try {
		return new ethers.Wallet(pk)
	} catch {
		return null
	}
}

export type AppDownloadVisitWalletProfile = {
	accountName: string
	tagLabel: string
	avatarSrc: string
	displayName: string
	eoaAddress: string
	aaAddress: string
	createdAt: number | null
}

function dicebearAvatarSrc(seed: string): string {
	return `https://api.dicebear.com/8.x/fun-emoji/svg?seed=${encodeURIComponent(seed || '@Beamio')}`
}

function profileDisplayName(beamio: beamio | undefined, accountName: string): string {
	if (!beamio) return accountName
	const first = String(beamio.firstName ?? '').trim()
	const lastRaw = String(beamio.lastName ?? '').trim()
	const lastSeg = lastRaw.split('\r\n')[0]?.trim() ?? ''
	const last = lastSeg.startsWith('{') ? '' : lastSeg
	const full = `${first} ${last}`.trim()
	return full || accountName
}

export function visitWalletProfileFromBlob(
	data: encrypt_keys_object | null,
): AppDownloadVisitWalletProfile | null {
	const hydrated = ensureProfilePrivateKeyArmorFromMnemonic(data)
	if (!hydrated || !hasCompletedBeamioAccount(hydrated)) return null
	const accountName = String(hydrated.beamio?.accountName ?? '').trim().replace(/^@+/, '')
	if (!accountName) return null
	const eoaRaw = String(hydrated.profiles?.[0]?.keyID ?? '').trim()
	if (!eoaRaw || !ethers.isAddress(eoaRaw)) return null
	const aaRaw = String(hydrated.profiles?.[0]?.aaAccount ?? '').trim()
	const aaAddress = aaRaw && ethers.isAddress(aaRaw) ? ethers.getAddress(aaRaw) : ''
	const image = String(hydrated.beamio?.image ?? '').trim()
	const createdAtRaw = hydrated.beamio?.createdAt
	const createdAt =
		typeof createdAtRaw === 'number' && Number.isFinite(createdAtRaw) && createdAtRaw > 0
			? createdAtRaw
			: null
	return {
		accountName,
		tagLabel: `@${accountName}`,
		avatarSrc: image || dicebearAvatarSrc(accountName),
		displayName: profileDisplayName(hydrated.beamio, accountName),
		eoaAddress: ethers.getAddress(eoaRaw),
		aaAddress,
		createdAt,
	}
}

/** Reuse PWA / silent web_ visit wallet for app-download capsule + myWallet panel. */
export async function loadAppDownloadVisitWalletProfile(): Promise<AppDownloadVisitWalletProfile | null> {
	const blob = await provisionWebShareVisitWallet()
	return visitWalletProfileFromBlob(blob)
}
