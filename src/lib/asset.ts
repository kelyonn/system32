/** Prefix for files in /public. Empty at a domain root; "/system32" on GitHub Pages project sites. */
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const asset = (path: string) => `${BASE}${path}`;
