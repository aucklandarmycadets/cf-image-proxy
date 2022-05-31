const cache = caches.default

export async function fetchCache(opts) {
  const { event, cacheKey, fetch: fetchResponse } = opts

  let response

  console.log(cacheKey)

  if (cacheKey) {
    console.log('cacheKey', cacheKey.url)
    response = await cache.match(cacheKey)
  }

  console.log(`Found response: ${!!response}`)

  if (!response) {
    console.log('Revalidating')
    response = await fetchResponse()
    response = new Response(response.body, response)

    if (cacheKey) {
      console.log(`Checking whether to cache response with code ${response.status}`)
      if (response.headers.has('Cache-Control') && response.status !== 403) {
        console.log('Putting response into cache')
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
