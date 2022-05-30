const cache = caches.default

export async function fetchCache(opts) {
  const { event, cacheKey, fetch: fetchResponse, revalidate } = opts

  let response

  if (cacheKey) {
    console.log('cacheKey', cacheKey.url)
    response = await cache.match(cacheKey)
  }

  if (!response || revalidate) {
    console.log(`Revalidating with ${!!response}`)
    response = await fetchResponse()
    response = new Response(response.body, response)

    if (cacheKey) {
      if (response.headers.has('Cache-Control') && response.status !== 403) {
        // cache will respect response headers
        event.waitUntil(
          cache.put(cacheKey, response.clone()).catch((err) => {
            console.warn('cache put error', cacheKey, err)
          })
        )
      }

      response.headers.set('cf-cache-status', 'MISS')
    } else {
      response.headers.set('cf-cache-status', 'BYPASS')
    }
  }

  return response
}
