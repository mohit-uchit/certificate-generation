/**
 * Utility functions for URL construction with proper fallbacks
 */

/**
 * Get the base app domain with proper fallbacks
 */
export function getAppDomain(): string {
  // First try BASE_URL (most reliable for deployment)
  if (process.env.BASE_URL) {
    return process.env.BASE_URL
  }

  // In production, use the environment variable
  if (process.env.NEXT_PUBLIC_APP_DOMAIN) {
    return process.env.NEXT_PUBLIC_APP_DOMAIN
  }

  // In development or when env var is missing, use localhost
  return "http://localhost:3000"
}

/**
 * Get the login domain with proper fallbacks
 */
export function getLoginDomain(): string {
  // First try the specific login domain
  if (process.env.NEXT_PUBLIC_LOGIN_DOMAIN) {
    return process.env.NEXT_PUBLIC_LOGIN_DOMAIN
  }

  // Fall back to app domain + /login
  return `${getAppDomain()}/login`
}

/**
 * Construct a certificate URL with proper domain
 */
export function getCertificateUrl(certificateId: string): string {
  return `${getAppDomain()}/certificate/${certificateId}`
}

/**
 * Construct a verification URL with proper domain
 */
export function getVerificationUrl(certificateId: string): string {
  return `${getAppDomain()}/verify/${certificateId}`
}

/**
 * Validate if a URL is safe for redirection
 */
export function isValidRedirectUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url)
    const appDomain = getAppDomain()
    const appUrl = new URL(appDomain)

    // Only allow redirects to the same domain or localhost
    return (
      parsedUrl.hostname === appUrl.hostname || parsedUrl.hostname === "localhost" || parsedUrl.hostname === "127.0.0.1"
    )
  } catch {
    return false
  }
}
