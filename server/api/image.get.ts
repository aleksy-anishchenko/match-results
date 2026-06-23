export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const url = String(query.url ?? '')

  if (!url.startsWith('https://www.thesportsdb.com/') && !url.startsWith('https://r2.thesportsdb.com/')) {
    throw createError({statusCode: 400, message: 'Invalid image URL'})
  }

  const response = await fetch(url)
  const arrayBuffer = await response.arrayBuffer()

  return new Response(arrayBuffer, {
    headers: {
      'Content-Type': response.headers.get('Content-Type') ?? 'image/png',
      'Cache-Control': 'public, max-age=86400',
    }
  })
})
