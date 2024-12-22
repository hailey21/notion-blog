import type { GetServerSideProps } from 'next'
import type { ExtendedRecordMap } from 'notion-types'

import type { SiteMap } from '@/lib/types'
import { host } from '@/lib/config'
import { getSiteMap } from '@/lib/get-site-map'

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  if (req.method !== 'GET') {
    res.statusCode = 405
    res.setHeader('Content-Type', 'application/json')
    res.write(JSON.stringify({ error: 'method not allowed' }))
    res.end()
    return {
      props: {}
    }
  }

  const siteMap = await getSiteMap()

  // cache for up to 8 hours
  res.setHeader(
    'Cache-Control',
    'public, max-age=28800, stale-while-revalidate=28800'
  )
  res.setHeader('Content-Type', 'text/xml')
  res.write(createSitemap(siteMap))
  res.end()

  return {
    props: {}
  }
}

const getCreatedDate = (recordMap: ExtendedRecordMap): string => {
  let maxTime = 0
  const blocks = Object.values(recordMap.block)
  
  for (const block of blocks) {
    const time = block.value.created_time
    if (time > maxTime) {
      maxTime = time
    }
  }

  return new Date(maxTime).toISOString()
}

const getSitemapEntries = (siteMap: SiteMap, now: string) => {
  return Object.keys(siteMap.canonicalPageMap)
    .map(path => {
      const pageId = siteMap.canonicalPageMap[path]
      const recordMap = siteMap.pageMap[pageId]
      if (!recordMap) return null

      return {
        path,
        lastmod: getCreatedDate(recordMap) || now
      }
    })
    .filter(Boolean)
    .sort((a, b) => b.lastmod.localeCompare(a.lastmod))
}

const createSitemap = (siteMap: SiteMap) => {
  const now = new Date().toISOString()
  const entries = getSitemapEntries(siteMap, now)

  return `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
      <loc>${host}</loc>
      <lastmod>${now}</lastmod>
    </url>
    ${entries
      .map(entry => `
        <url>
          <loc>${host}/${entry.path}</loc>
          <lastmod>${entry.lastmod}</lastmod>
        </url>
      `.trim())
      .join('')}
  </urlset>
`
}

export default function noop() {
  return null
}
