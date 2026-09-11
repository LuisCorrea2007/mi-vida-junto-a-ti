//#region node_modules/uint8array-extras/index.js
var objectToString = Object.prototype.toString;
var uint8ArrayStringified = "[object Uint8Array]";
function isType(value, typeConstructor, typeStringified) {
	if (!value) return false;
	if (value.constructor === typeConstructor) return true;
	return objectToString.call(value) === typeStringified;
}
function isUint8Array(value) {
	return isType(value, Uint8Array, uint8ArrayStringified);
}
function assertUint8Array(value) {
	if (!isUint8Array(value)) throw new TypeError(`Expected \`Uint8Array\`, got \`${typeof value}\``);
}
function toUint8Array(value) {
	if (value instanceof ArrayBuffer) return new Uint8Array(value);
	if (ArrayBuffer.isView(value)) return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
	throw new TypeError(`Unsupported value, got \`${typeof value}\`.`);
}
function concatUint8Arrays(arrays, totalLength) {
	if (arrays.length === 0) return /* @__PURE__ */ new Uint8Array(0);
	totalLength ??= arrays.reduce((accumulator, currentValue) => accumulator + currentValue.length, 0);
	const returnValue = new Uint8Array(totalLength);
	let offset = 0;
	for (const array of arrays) {
		assertUint8Array(array);
		returnValue.set(array, offset);
		offset += array.length;
	}
	return returnValue;
}
new globalThis.TextDecoder("utf8");
function assertString(value) {
	if (typeof value !== "string") throw new TypeError(`Expected \`string\`, got \`${typeof value}\``);
}
var cachedEncoder = new globalThis.TextEncoder();
function stringToUint8Array(string) {
	assertString(string);
	return cachedEncoder.encode(string);
}
function base64ToBase64Url(base64) {
	return base64.replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}
function base64UrlToBase64(base64url) {
	const base64 = base64url.replaceAll("-", "+").replaceAll("_", "/");
	const padding = (4 - base64.length % 4) % 4;
	return base64 + "=".repeat(padding);
}
var MAX_BLOCK_SIZE = 65535;
function uint8ArrayToBase64(array, { urlSafe = false } = {}) {
	assertUint8Array(array);
	let base64 = "";
	for (let index = 0; index < array.length; index += MAX_BLOCK_SIZE) {
		const chunk = array.subarray(index, index + MAX_BLOCK_SIZE);
		base64 += globalThis.btoa(String.fromCodePoint.apply(void 0, chunk));
	}
	return urlSafe ? base64ToBase64Url(base64) : base64;
}
function base64ToUint8Array(base64String) {
	assertString(base64String);
	return Uint8Array.from(globalThis.atob(base64UrlToBase64(base64String)), (x) => x.codePointAt(0));
}
Array.from({ length: 256 }, (_, index) => index.toString(16).padStart(2, "0"));
//#endregion
//#region node_modules/@block65/webcrypto-web-push/dist/lib/utils.js
function encodeRecordSize(size) {
	const bytes = /* @__PURE__ */ new Uint8Array(4);
	new DataView(bytes.buffer).setUint32(0, size);
	return bytes;
}
function invariant(condition, message) {
	if (!condition) throw new Error(message);
}
//#endregion
//#region node_modules/@block65/webcrypto-web-push/dist/lib/client-keys.js
async function deriveClientKeys(sub) {
	const bytes = base64ToUint8Array(sub.keys.p256dh);
	const authSecretBytes = base64ToUint8Array(sub.keys.auth);
	invariant(bytes.byteLength === 65 && bytes[0] === 4, "Subscription p256dh is not an uncompressed P-256 point");
	invariant(authSecretBytes.byteLength === 16, "Subscription auth secret is not 16 bytes");
	return {
		publicKeyBytes: bytes,
		publicKey: await crypto.subtle.importKey("raw", bytes, {
			name: "ECDH",
			namedCurve: "P-256"
		}, false, []),
		authSecretBytes
	};
}
//#endregion
//#region node_modules/@block65/webcrypto-web-push/dist/lib/hkdf.js
function createHMAC(data) {
	const keyPromise = crypto.subtle.importKey("raw", data, {
		name: "HMAC",
		hash: "SHA-256"
	}, false, ["sign"]);
	return { hash: async (input) => {
		const k = await keyPromise;
		return crypto.subtle.sign("HMAC", k, input);
	} };
}
async function hkdf(salt, ikm) {
	const prkhPromise = createHMAC(salt).hash(ikm).then((prk) => createHMAC(prk));
	return { extract: async (info, len) => {
		const prkh = await prkhPromise;
		return concatUint8Arrays(await Array.from({ length: Math.ceil(len / 32) }, (_, i) => i).reduce(async (acc, i) => {
			const previous = await acc;
			const hash = await prkh.hash(new Uint8Array([
				...previous.at(-1) ?? [],
				...info,
				i + 1
			]));
			return [...previous, new Uint8Array(hash)];
		}, Promise.resolve([]))).slice(0, len);
	} };
}
//#endregion
//#region node_modules/@block65/webcrypto-web-push/dist/lib/info.js
function createKeyInfo(clientPublic, serverPublic) {
	return new Uint8Array([
		...stringToUint8Array("WebPush: info\0"),
		...clientPublic,
		...serverPublic
	]);
}
function createInfo(type) {
	return stringToUint8Array(`Content-Encoding: ${type}\0`);
}
//#endregion
//#region node_modules/@block65/webcrypto-web-push/dist/lib/local-keys.js
async function generateLocalKeys() {
	const keyPair = await crypto.subtle.generateKey({
		name: "ECDH",
		namedCurve: "P-256"
	}, false, ["deriveBits"]);
	return {
		privateKey: keyPair.privateKey,
		publicKeyBytes: new Uint8Array(await crypto.subtle.exportKey("raw", keyPair.publicKey))
	};
}
//#endregion
//#region node_modules/@block65/webcrypto-web-push/dist/lib/salt.js
async function getSalt() {
	return crypto.getRandomValues(/* @__PURE__ */ new Uint8Array(16));
}
//#endregion
//#region node_modules/@block65/webcrypto-web-push/dist/lib/encrypt.js
var recordSize = 4096;
var maxPlaintextSize = 3993;
async function encryptNotification(subscription, plaintext, options = {}) {
	invariant(plaintext.byteLength <= maxPlaintextSize, `Payload is ${plaintext.byteLength} bytes, the maximum is ${maxPlaintextSize}`);
	const clientKeys = await deriveClientKeys(subscription);
	const salt = await getSalt();
	const localKeys = await generateLocalKeys();
	const sharedSecret = await crypto.subtle.deriveBits({
		name: "ECDH",
		public: clientKeys.publicKey
	}, localKeys.privateKey, 256);
	const keyInfo = createKeyInfo(clientKeys.publicKeyBytes, localKeys.publicKeyBytes);
	const cekInfo = createInfo("aes128gcm");
	const nonceInfo = createInfo("nonce");
	const messageHkdf = await hkdf(salt, await (await hkdf(clientKeys.authSecretBytes, sharedSecret)).extract(keyInfo, 32));
	const cekBytes = await messageHkdf.extract(cekInfo, 16);
	const nonceBytes = await messageHkdf.extract(nonceInfo, 12);
	const cekCryptoKey = await crypto.subtle.importKey("raw", cekBytes, {
		name: "AES-GCM",
		length: 128
	}, false, ["encrypt"]);
	const padTo = options.pad ?? true ? maxPlaintextSize : plaintext.byteLength;
	const padded = new Uint8Array(padTo + 1);
	padded.set(plaintext);
	padded[plaintext.byteLength] = 2;
	const encrypted = await crypto.subtle.encrypt({
		name: "AES-GCM",
		iv: nonceBytes
	}, cekCryptoKey, padded);
	return new Uint8Array([
		...salt,
		...encodeRecordSize(recordSize),
		localKeys.publicKeyBytes.byteLength,
		...localKeys.publicKeyBytes,
		...new Uint8Array(encrypted)
	]);
}
//#endregion
//#region node_modules/@block65/webcrypto-web-push/dist/lib/base64.js
function encodeBase64Url(value) {
	return uint8ArrayToBase64(toUint8Array(value), { urlSafe: true });
}
function objectToBase64Url(obj) {
	return encodeBase64Url(stringToUint8Array(JSON.stringify(obj)));
}
//#endregion
//#region node_modules/@block65/webcrypto-web-push/dist/lib/jwt.js
async function sign(payload, key) {
	const dataStr = `${objectToBase64Url({
		typ: "JWT",
		alg: "ES256"
	})}.${objectToBase64Url({
		iat: Math.floor(Date.now() / 1e3),
		...payload
	})}`;
	return `${dataStr}.${encodeBase64Url(await crypto.subtle.sign({
		name: "ECDSA",
		hash: "SHA-256"
	}, key, stringToUint8Array(dataStr)))}`;
}
//#endregion
//#region node_modules/@block65/webcrypto-web-push/dist/lib/vapid.js
async function vapidHeaders(subscription, vapid) {
	invariant(vapid.subject, "Vapid subject is empty");
	invariant(vapid.privateKey, "Vapid private key is empty");
	invariant(vapid.publicKey, "Vapid public key is empty");
	const endpoint = new URL(subscription.endpoint);
	invariant(endpoint.protocol === "https:", `Subscription endpoint is not https: ${endpoint.protocol}`);
	const vapidPublicKeyBytes = base64ToUint8Array(vapid.publicKey);
	const publicKey = await crypto.subtle.importKey("jwk", {
		kty: "EC",
		crv: "P-256",
		x: encodeBase64Url(vapidPublicKeyBytes.slice(1, 33)),
		y: encodeBase64Url(vapidPublicKeyBytes.slice(33, 65)),
		d: vapid.privateKey
	}, {
		name: "ECDSA",
		namedCurve: "P-256"
	}, false, ["sign"]);
	return { headers: { authorization: `vapid t=${await sign({
		aud: endpoint.origin,
		exp: Math.floor(Date.now() / 1e3) + 43200,
		sub: vapid.subject
	}, publicKey)}, k=${vapid.publicKey}` } };
}
//#endregion
//#region node_modules/@block65/webcrypto-web-push/dist/lib/payload.js
async function buildPushPayload(message, subscription, vapid) {
	const { headers } = await vapidHeaders(subscription, vapid);
	const body = await encryptNotification(subscription, stringToUint8Array(typeof message.data === "string" || typeof message.data === "number" ? message.data.toString() : JSON.stringify(message.data)));
	return {
		headers: {
			...headers,
			ttl: (message.options?.ttl || 60).toString(),
			...message.options?.urgency && { urgency: message.options.urgency },
			...message.options?.topic && { topic: message.options.topic },
			"content-encoding": "aes128gcm",
			"content-length": body.byteLength.toString(),
			"content-type": "application/octet-stream"
		},
		method: "post",
		body
	};
}
//#endregion
export { vapidHeaders as n, encryptNotification as r, buildPushPayload as t };
