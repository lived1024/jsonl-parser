import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Mock the required services and data for sitemap generation
const mockContentService = {
  getTutorialList: () => Promise.resolve([
    { id: 'json-basics', metadata: { lastUpdated: new Date('2024-01-15') } },
    { id: 'jsonl-processing', metadata: { lastUpdated: new Date('2024-01-20') } },
    { id: 'advanced-parsing', metadata: { lastUpdated: new Date('2024-02-01') } },
    { id: 'data-validation', metadata: { lastUpdated: new Date('2024-02-10') } },
    { id: 'performance-optimization', metadata: { lastUpdated: new Date('2024-02-15') } }
  ]),
  
  getReferenceList: () => Promise.resolve([
    { id: 'json-syntax', metadata: { lastUpdated: new Date('2024-01-10') } },
    { id: 'jsonl-format', metadata: { lastUpdated: new Date('2024-01-12') } },
    { id: 'error-patterns', metadata: { lastUpdated: new Date('2024-01-25') } },
    { id: 'best-practices', metadata: { lastUpdated: new Date('2024-02-05') } },
    { id: 'performance-tips', metadata: { lastUpdated: new Date('2024-02-12') } }
  ]),
  
  getGuideList: () => Promise.resolve([
    { id: 'getting-started', metadata: { lastUpdated: new Date('2024-01-05') } },
    { id: 'api-integration', metadata: { lastUpdated: new Date('2024-01-18') } },
    { id: 'data-processing', metadata: { lastUpdated: new Date('2024-02-03') } },
    { id: 'troubleshooting', metadata: { lastUpdated: new Date('2024-02-08') } }
  ])
}

// Simplified SitemapService for build-time generation
class BuildTimeSitemapService {
  constructor() {
    this.config = {
      baseUrl: 'https://jsonl-parser.com',
      defaultChangefreq: 'weekly',
      defaultPriority: 0.5,
      supportedLanguages: ['en', 'ko']
    }
  }

  generateStaticUrls() {
    const staticPages = [
      { path: '/', priority: 1.0, changefreq: 'daily' },
      { path: '/learn', priority: 0.9, changefreq: 'weekly' },
      { path: '/tools', priority: 0.9, changefreq: 'weekly' },
      { path: '/reference', priority: 0.8, changefreq: 'monthly' },
      { path: '/samples', priority: 0.7, changefreq: 'monthly' },
      { path: '/info', priority: 0.6, changefreq: 'monthly' }
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

  async generateDynamicUrls() {
    const dynamicUrls = []

    try {
      // Generate tutorial URLs
      const tutorials = await mockContentService.getTutorialList()
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
      const references = await mockContentService.getReferenceList()
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
      const guides = await mockContentService.getGuideList()
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

  async generateSitemap() {
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

  async generateRobotsTxt() {
    let robots = 'User-agent: *\n'
    robots += 'Allow: /\n'
    robots += 'Disallow: /api/\n'
    robots += 'Disallow: /*.json$\n'
    robots += 'Disallow: /test*\n'
    robots += '\n'
    robots += `Sitemap: ${this.config.baseUrl}/sitemap.xml\n`
    
    return robots
  }
}

async function generateSitemapFiles() {
  try {
    console.log('Generating sitemap and robots.txt...')
    
    const sitemapService = new BuildTimeSitemapService()
    
    // Generate sitemap
    const sitemap = await sitemapService.generateSitemap()
    const robots = await sitemapService.generateRobotsTxt()
    
    // Ensure public directory exists
    const publicDir = join(__dirname, '../public')
    try {
      mkdirSync(publicDir, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }
    
    // Write sitemap.xml
    const sitemapPath = join(publicDir, 'sitemap.xml')
    writeFileSync(sitemapPath, sitemap, 'utf8')
    console.log(`✅ Sitemap generated: ${sitemapPath}`)
    
    // Write robots.txt
    const robotsPath = join(publicDir, 'robots.txt')
    writeFileSync(robotsPath, robots, 'utf8')
    console.log(`✅ Robots.txt generated: ${robotsPath}`)
    
    // Generate a simple sitemap index for future use
    const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://jsonl-parser.com/sitemap.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>
</sitemapindex>`
    
    const sitemapIndexPath = join(publicDir, 'sitemap-index.xml')
    writeFileSync(sitemapIndexPath, sitemapIndex, 'utf8')
    console.log(`✅ Sitemap index generated: ${sitemapIndexPath}`)
    
    console.log('🎉 All SEO files generated successfully!')
    
  } catch (error) {
    console.error('❌ Failed to generate sitemap files:', error)
    process.exit(1)
  }
}

// Run the generation
generateSitemapFiles()