/** strudel.cc reads code from the URL hash as URI-encoded base64 of the UTF-8 bytes. */
export function encodeStrudelHash(code: string): string {
  let binary = '';
  for (const byte of new TextEncoder().encode(code)) binary += String.fromCharCode(byte);
  return encodeURIComponent(btoa(binary));
}

export function decodeStrudelHash(hash: string): string {
  const binary = atob(decodeURIComponent(hash.replace(/^#/, '')));
  return new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0)));
}

export function strudelUrl(code: string): string {
  return `https://strudel.cc/#${encodeStrudelHash(code)}`;
}
