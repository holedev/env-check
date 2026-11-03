type CspOptions = { nonce: string; isDev: boolean };

/**
 * Per-request Content-Security-Policy. Scripts must carry the request's nonce
 * ('strict-dynamic' lets those scripts load Next.js chunks). Styles keep
 * 'unsafe-inline' because Radix/Sonner set inline style attributes, which a
 * nonce cannot cover.
 */
export const buildContentSecurityPolicy = ({ nonce, isDev }: CspOptions) =>
  [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://cdn.simpleicons.org",
    "font-src 'self'",
    `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'"
  ].join("; ");

export const createNonce = () => btoa(crypto.randomUUID());
