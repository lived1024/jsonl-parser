import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from './useI18n'

export interface SEOMetadata {
  title: string
  description: string
  keywords: string[]
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  ogType?: string
  canonicalUrl?: string
  author?: string
  publishedTime?: string
  modifiedTime?: string
  locale?: string
  alternateLocales?: string[]
  structuredData?: Record<string, any>
}

export interface PageSEOConfig {
  titleTemplate?: string
  defaultTitle: string
  defaultDescription: string
  defaultKeywords: string[]
  defaultOgImage: string
  siteUrl: string
  siteName: string
  twitterHandle?: string
}

const defaultConfig: PageSEOConfig = {
  titleTemplate: '%s | JSONL Parser',
  defaultTitle: 'JSONL Parser - JSON & JSONL Data Visualization Tool',
  defaultDescription: 'Parse, visualize and explore JSON and JSONL data with our interactive tree viewer. Features real-time parsing, hierarchical display, and comprehensive JSON tools.',
  defaultKeywords: ['JSON', 'JSONL', 'parser', 'visualizer', 'data', 'tree', 'viewer', 'developer', 'tools'],
  defaultOgImage: '/og-image.png',
  siteUrl: 'https://jsonl-parser.com',
  siteName: 'JSONL Parser',
  twitterHandle: '@jsonlparser'
}

let globalConfig = { ...defaultConfig }

export function configureSEO(config: Partial<PageSEOConfig>) {
  globalConfig = { ...globalConfig, ...config }
}

export function useSEO(initialMetadata?: Partial<SEOMetadata>) {
  const route = useRoute()
  const { currentLanguage } = useI18n()
  
  const metadata = ref<SEOMetadata>({
    title: globalConfig.defaultTitle,
    description: globalConfig.defaultDescription,
    keywords: [...globalConfig.defaultKeywords],
    ogImage: globalConfig.defaultOgImage,
    ogType: 'website',
    canonicalUrl: '',
    locale: currentLanguage.value,
    ...initialMetadata
  })

  // Track created meta elements for cleanup
  const createdMetaElements = ref<HTMLMetaElement[]>([])
  const createdLinkElements = ref<HTMLLinkElement[]>([])
  const createdScriptElements = ref<HTMLScriptElement[]>([])

  const updateTitle = (title: string) => {
    const formattedTitle = globalConfig.titleTemplate 
      ? globalConfig.titleTemplate.replace('%s', title)
      : title
    
    document.title = formattedTitle
    metadata.value.title = formattedTitle
  }

  const createOrUpdateMetaTag = (name: string, content: string, property?: string) => {
    if (!content) return

    const selector = property ? `meta[property="${property}"]` : `meta[name="${name}"]`
    let metaElement = document.querySelector(selector) as HTMLMetaElement
    
    if (!metaElement) {
      metaElement = document.createElement('meta')
      if (property) {
        metaElement.setAttribute('property', property)
      } else {
        metaElement.setAttribute('name', name)
      }
      document.head.appendChild(metaElement)
      createdMetaElements.value.push(metaElement)
    }
    
    metaElement.setAttribute('content', content)
  }

  const createOrUpdateLinkTag = (rel: string, href: string, hreflang?: string) => {
    if (!href) return

    const selector = hreflang 
      ? `link[rel="${rel}"][hreflang="${hreflang}"]`
      : `link[rel="${rel}"]`
    
    let linkElement = document.querySelector(selector) as HTMLLinkElement
    
    if (!linkElement) {
      linkElement = document.createElement('link')
      linkElement.setAttribute('rel', rel)
      if (hreflang) {
        linkElement.setAttribute('hreflang', hreflang)
      }
      document.head.appendChild(linkElement)
      createdLinkElements.value.push(linkElement)
    }
    
    linkElement.setAttribute('href', href)
  }

  const createOrUpdateStructuredData = (data: Record<string, any>) => {
    if (!data || Object.keys(data).length === 0) return

    const scriptId = 'structured-data'
    let scriptElement = document.querySelector(`script[id="${scriptId}"]`) as HTMLScriptElement
    
    if (!scriptElement) {
      scriptElement = document.createElement('script')
      scriptElement.setAttribute('type', 'application/ld+json')
      scriptElement.setAttribute('id', scriptId)
      document.head.appendChild(scriptElement)
      createdScriptElements.value.push(scriptElement)
    }
    
    scriptElement.textContent = JSON.stringify(data, null, 2)
  }

  const updateMetaTags = () => {
    const currentUrl = `${globalConfig.siteUrl}${route.path}`
    
    // Update title
    updateTitle(metadata.value.title)
    
    // Basic meta tags
    createOrUpdateMetaTag('description', metadata.value.description)
    createOrUpdateMetaTag('keywords', metadata.value.keywords.join(', '))
    createOrUpdateMetaTag('author', metadata.value.author || globalConfig.siteName)
    
    // Open Graph tags
    createOrUpdateMetaTag('', metadata.value.ogTitle || metadata.value.title, 'og:title')
    createOrUpdateMetaTag('', metadata.value.ogDescription || metadata.value.description, 'og:description')
    createOrUpdateMetaTag('', metadata.value.ogImage || globalConfig.defaultOgImage, 'og:image')
    createOrUpdateMetaTag('', metadata.value.ogType || 'website', 'og:type')
    createOrUpdateMetaTag('', currentUrl, 'og:url')
    createOrUpdateMetaTag('', globalConfig.siteName, 'og:site_name')
    createOrUpdateMetaTag('', metadata.value.locale || currentLanguage.value, 'og:locale')
    
    // Twitter Card tags
    createOrUpdateMetaTag('twitter:card', 'summary_large_image')
    createOrUpdateMetaTag('twitter:site', globalConfig.twitterHandle || '')
    createOrUpdateMetaTag('twitter:title', metadata.value.ogTitle || metadata.value.title)
    createOrUpdateMetaTag('twitter:description', metadata.value.ogDescription || metadata.value.description)
    createOrUpdateMetaTag('twitter:image', metadata.value.ogImage || globalConfig.defaultOgImage)
    
    // Canonical URL
    const canonicalUrl = metadata.value.canonicalUrl || currentUrl
    createOrUpdateLinkTag('canonical', canonicalUrl)
    
    // Language alternates
    if (metadata.value.alternateLocales) {
      metadata.value.alternateLocales.forEach(locale => {
        const alternateUrl = `${globalConfig.siteUrl}${route.path}?lang=${locale}`
        createOrUpdateLinkTag('alternate', alternateUrl, locale)
      })
    }
    
    // Structured data
    if (metadata.value.structuredData) {
      createOrUpdateStructuredData(metadata.value.structuredData)
    }
    
    // Article-specific meta tags
    if (metadata.value.publishedTime) {
      createOrUpdateMetaTag('', metadata.value.publishedTime, 'article:published_time')
    }
    if (metadata.value.modifiedTime) {
      createOrUpdateMetaTag('', metadata.value.modifiedTime, 'article:modified_time')
    }
  }

  const setMetadata = (newMetadata: Partial<SEOMetadata>) => {
    metadata.value = { ...metadata.value, ...newMetadata }
    updateMetaTags()
  }

  const generateBreadcrumbStructuredData = (breadcrumbs: Array<{ name: string; url: string }>) => {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'name': crumb.name,
        'item': `${globalConfig.siteUrl}${crumb.url}`
      }))
    }
  }

  const generateArticleStructuredData = (article: {
    title: string
    description: string
    author: string
    publishedTime: string
    modifiedTime?: string
    image?: string
  }) => {
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      'headline': article.title,
      'description': article.description,
      'author': {
        '@type': 'Person',
        'name': article.author
      },
      'publisher': {
        '@type': 'Organization',
        'name': globalConfig.siteName,
        'logo': {
          '@type': 'ImageObject',
          'url': `${globalConfig.siteUrl}/logo.png`
        }
      },
      'datePublished': article.publishedTime,
      'dateModified': article.modifiedTime || article.publishedTime,
      'image': article.image ? `${globalConfig.siteUrl}${article.image}` : globalConfig.defaultOgImage,
      'mainEntityOfPage': {
        '@type': 'WebPage',
        '@id': `${globalConfig.siteUrl}${route.path}`
      }
    }
  }

  const generateWebApplicationStructuredData = () => {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      'name': globalConfig.siteName,
      'description': globalConfig.defaultDescription,
      'url': globalConfig.siteUrl,
      'applicationCategory': 'DeveloperApplication',
      'operatingSystem': 'Web Browser',
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'USD'
      },
      'featureList': [
        'JSON parsing and validation',
        'JSONL file processing',
        'Interactive tree visualization',
        'Data conversion tools',
        'Educational tutorials',
        'Sample data library'
      ]
    }
  }

  const cleanupMetaTags = () => {
    // Remove created meta elements
    createdMetaElements.value.forEach(element => {
      if (element.parentNode) {
        element.parentNode.removeChild(element)
      }
    })
    createdMetaElements.value = []
    
    // Remove created link elements
    createdLinkElements.value.forEach(element => {
      if (element.parentNode) {
        element.parentNode.removeChild(element)
      }
    })
    createdLinkElements.value = []
    
    // Remove created script elements
    createdScriptElements.value.forEach(element => {
      if (element.parentNode) {
        element.parentNode.removeChild(element)
      }
    })
    createdScriptElements.value = []
  }

  // Watch for route changes and language changes
  watch([() => route.path, currentLanguage], () => {
    metadata.value.locale = currentLanguage.value
    updateMetaTags()
  })

  // Initialize meta tags on mount
  onMounted(() => {
    updateMetaTags()
  })

  // Cleanup on unmount
  onUnmounted(() => {
    cleanupMetaTags()
  })

  return {
    metadata,
    setMetadata,
    updateMetaTags,
    generateBreadcrumbStructuredData,
    generateArticleStructuredData,
    generateWebApplicationStructuredData,
    cleanupMetaTags
  }
}