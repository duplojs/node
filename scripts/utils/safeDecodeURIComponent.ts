export function safeDecodeURIComponent(encodedURI: string) {
	try {
		return decodeURIComponent(encodedURI);
	} catch {
		return encodedURI;
	}
}
