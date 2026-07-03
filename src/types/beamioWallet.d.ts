/** Minimal wallet blob types (aligned with SilentPassUI PouchDB `conet` / `_id: init`). */

type profile = {
	tokens?: Record<string, unknown>
	publicKeyArmor?: string
	keyID?: string
	isPrimary?: boolean
	referrer?: string | null
	isNode?: boolean
	privateKeyArmor?: string
	hdPath?: string | null
	index?: number
	type?: string
	webFilter?: boolean
}

type beamio = {
	accountName: string
	firstName?: string
	lastName?: string
	image?: string
	darkTheme?: boolean
	isUSDCFaucet?: boolean
	isETHFaucet?: boolean
	initialLoading?: boolean
	createdAt?: number
	language?: string
	currency?: string
	tax?: string
	localeCurrencyConfigured?: boolean
}

type encrypt_keys_object = {
	mnemonicPhrase?: string
	profiles?: profile[]
	isReady?: boolean
	ver?: number
	nonce?: number
	beamio?: beamio
	encryptedString?: string
}

type Argon2idHash = {
	algo: 'argon2id'
	v: number
	m: number
	t: number
	p: number
	salt: string
	hash: string
}
