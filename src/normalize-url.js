/**
 * Stripped down version of [normalize-url](https://github.com/sindresorhus/normalize-url)
 * by sindresorhus
 *
 * - always converts http => https
 * - removed unused options
 * - removed dataURL support
 */
export const normalizeUrl = (urlString) => {
  const urlObj = new URL(urlString)

  if (urlObj.protocol === 'http:') {
    urlObj.protocol = 'https:'
  }

  /*
  // Remove auth
  // TODO: Cloudflare Workers seems to have a subtle bug where if you set URL.username and
  // URL.password at all, it will include the @ authentication prefix in the resulting URL.
  // This does not repro in normal web or Node.js contexts.
  if (options.stripAuthentication) {
    urlObj.username = ''
    urlObj.password = ''
  }
  */

  // Remove duplicate slashes if not preceded by a protocol
  if (urlObj.pathname) {
    urlObj.pathname = urlObj.pathname.replace(/(?<!https?:)\/{2,}/g, '/')
  }

  // Decode URI octets
  if (urlObj.pathname) {
    urlObj.pathname = decodeURI(urlObj.pathname)
  }

  if (urlObj.hostname) {
    // Remove trailing dot
    urlObj.hostname = urlObj.hostname.replace(/\.$/, '')
  }

  // Delete auth parameters
  urlObj.searchParams.delete('X-Amz-Algorithm')
  urlObj.searchParams.delete('X-Amz-Content-Sha256')
  urlObj.searchParams.delete('X-Amz-Credential')
  urlObj.searchParams.delete('X-Amz-Date')
  urlObj.searchParams.delete('X-Amz-Expires')
  urlObj.searchParams.delete('X-Amz-Signature')
  urlObj.searchParams.delete('X-Amz-SignedHeaders')

  // Sort query parameters
  urlObj.searchParams.sort()

  // Remove trailing `/`
  urlObj.pathname = urlObj.pathname.replace(/\/$/, '')

  urlString = urlObj.toString()

  // Remove trailing `/` for real this time
  if (urlObj.pathname === '/' && urlObj.hash === '') {
    urlString = urlString.replace(/\/$/, '')
  }

  urlString = urlString.replace(/https:%2F%2F/g, 'https%3A%2F%2F')

  return urlString
}
