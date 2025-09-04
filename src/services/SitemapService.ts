export interface SitemapUrl {
  loc: string
  lastmod?: string
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
  alternates?: Array<{
    hreflang: string
    href: string
  }>
}

export interface SitemapConfig {
  baseUrl: string
  defaultChangefreq: SitemapUrl['changefreq']
  defaultPriority: number
  supportedLanguages: string[]
}

export class SitemapService {
  private static instance: SitemapService
  private config: SitemapConfig

  private constructor() {
    this.config = {
      baseUrl: 'https://jsonl-parser.com',
      defaultChangefreq: 'weekly',
      defaultPriority: 0.5,
      supportedLanguages: ['en', 'ko']
    }
  }

  static getInstance(): SitemapService {
    if (!SitemapService.instance) {
      SitemapService.instance = new SitemapService()
    }
    return SitemapService.instance
  }

  configure(config: Partial<SitemapConfig>) {
    this.config = { ...this.config, ...config }
  }

  private generateStaticUrls(): SitemapUrl[] {
    const staticPages = [
      { path: '/', priority: 1.0, changefreq: 'daily' as const },
      { path: '/learn', priority: 0.9, changefreq: 'weekly' as const },
      { path: '/tools', priority: 0.9, changefreq: 'weekly' as const },
      { path: '/reference', priority: 0.8, changefreq: 'monthly' as const },
      { path: '/samples', priority: 0.7, changefreq: 'monthly' as const },
      { path: '/info', priority: 0.6, changefreq: 'monthly' as const }
    ]

    return staticPages.map(page => ({
      loc: `${this.config.baseUrl}${page.path}`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: page.changefreq,
      priority: page.priority,
      alternates: this.config.supportedLanguages.map(lang => ({
        hreflang: lang,
        href: `${this.config.baseUrl}${page.path}${page.path === '/' ? '' : '/'}?lang=${lang}`
      }))
    }))
  }

  private async generateDynamicUrls(): Promise<SitemapUrl[]> {
    const dynamicUrls: SitemapUrl[] = []

    try {
      // Generate tutorial URLs
      const { ContentService } = await import('./ContentService')
      const contentService = ContentService.getInstance()
      
      const tutorials = await contentService.getTutorialList()
      tutorials.forEach(tutorial => {
        dynamicUrls.push({
          loc: `${this.config.baseUrl}/learn/${tutorial.id}`,
          lastmod: tutorial.metadata.lastUpdated?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
          changefreq: 'monthly',
          priority: 0.7,
          alternates: this.config.supportedLanguages.map(lang => ({
            hreflang: lang,
            href: `${this.config.baseUrl}/learn/${tutorial.id}?lang=${lang}`
          }))
        })
      })

      // Generate tool URLs
      const tools = [
        'json-validator',
        'data-converter', 
        'json-formatter',
        'schema-generator'
      ]

      tools.forEach(toolId => {
        dynamicUrls.push({
          loc: `${this.config.baseUrl}/tools/${toolId}`,
          lastmod: new Date().toISOString().split('T')[0],
          changefreq: 'monthly',
          priority: 0.6,
          alternates: this.config.supportedLanguages.map(lang => ({
            hreflang: lang,
            href: `${this.config.baseUrl}/tools/${toolId}?lang=${lang}`
          }))
        })
      })

      // Generate reference URLs
      const references = await contentService.getReferenceList()
      references.forEach(reference => {
        dynamicUrls.push({
          loc: `${this.config.baseUrl}/reference/${reference.id}`,
          lastmod: new Date().toISOString().split('T')[0],
          changefreq: 'monthly',
          priority: 0.6,
          alternates: this.config.supportedLanguages.map(lang => ({
            hreflang: lang,
            href: `${this.config.baseUrl}/reference/${reference.id}?lang=${lang}`
          }))
        })
      })

      // Generate info guide URLs
      const guides = await contentService.getGuideList()
      guides.forEach(guide => {
        dynamicUrls.push({
          loc: `${this.config.baseUrl}/info/${guide.id}`,
          lastmod: new Date().toISOString().split('T')[0],
          changefreq: 'monthly',
          priority: 0.5,
          alternates: this.config.supportedLanguages.map(lang => ({
            hreflang: lang,
            href: `${this.config.baseUrl}/info/${guide.id}?lang=${lang}`
          }))
        })
      })

    } catch (error) {
      console.warn('Failed to generate some dynamic URLs for sitemap:', error)
    }

    return dynamicUrls
  }

  async generateSitemap(): Promise<string> {
    const staticUrls = this.generateStaticUrls()
    const dynamicUrls = await this.generateDynamicUrls()
    const allUrls = [...staticUrls, ...dynamicUrls]

    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n'
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'

    allUrls.forEach(url => {
      sitemap += '  <url>\n'
      sitemap += `    <loc>${url.loc}</loc>\n`
      
      if (url.lastmod) {
        sitemap += `    <lastmod>${url.lastmod}</lastmod>\n`
      }
      
      if (url.changefreq) {
        sitemap += `    <changefreq>${url.changefreq}</changefreq>\n`
      }
      
      if (url.priority !== undefined) {
        sitemap += `    <priority>${url.priority}</priority>\n`
      }

      // Add alternate language links
      if (url.alternates && url.alternates.length > 0) {
        url.alternates.forEach(alternate => {
          sitemap += `    <xhtml:link rel="alternate" hreflang="${alternate.hreflang}" href="${alternate.href}" />\n`
        })
      }

      sitemap += '  </url>\n'
    })

    sitemap += '</urlset>'
    return sitemap
  }

  async generateRobotsTxt(): Promise<string> {
    let robots = 'User-agent: *\n'
    robots += 'Allow: /\n'
    robots += 'Disallow: /api/\n'
    robots += 'Disallow: /*.json$\n'
    robots += 'Disallow: /test*\n'
    robots += '\n'
    robots += `Sitemap: ${this.config.baseUrl}/sitemap.xml\n`
    
    return robots
  }

  // Generate sitemap index for large sites (future use)
  async generateSitemapIndex(sitemaps: Array<{ loc: string; lastmod?: string }>): Promise<string> {
    let sitemapIndex = '<?xml version="1.0" encoding="UTF-8"?>\n'
    sitemapIndex += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

    sitemaps.forEach(sitemap => {
      sitemapIndex += '  <sitemap>\n'
      sitemapIndex += `    <loc>${sitemap.loc}</loc>\n`
      
      if (sitemap.lastmod) {
        sitemapIndex += `    <lastmod>${sitemap.lastmod}</lastmod>\n`
      }
      
      sitemapIndex += '  </sitemap>\n'
    })

    sitemapIndex += '</sitemapindex>'
    return sitemapIndex
  }

  // Utility method to validate URLs
  private isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  // Method to ping search engines about sitemap updates
  async notifySearchEngines(): Promise<void> {
    const sitemapUrl = `${this.config.baseUrl}/sitemap.xml`
    const searchEngines = [
      `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
      `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`
    ]

    const notifications = searchEngines.map(async (url) => {
      try {
        const response = await fetch(url, { method: 'GET' })
        return { url, success: response.ok }
      } catch (error) {
        return { url, success: false, error }
      }
    })

    const results = await Promise.allSettled(notifications)
    console.log('Search engine notification results:', results)
  }
}