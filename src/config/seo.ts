import { configureSEO } from '../composables/useSEO'

// SEO configuration for the application
export const initializeSEO = () => {
  configureSEO({
    titleTemplate: '%s | JSONL Parser',
    defaultTitle: 'JSONL Parser - JSON & JSONL Data Visualization Tool',
    defaultDescription: 'Parse, visualize and explore JSON and JSONL data with our interactive tree viewer. Features real-time parsing, hierarchical display, and comprehensive JSON tools.',
    defaultKeywords: ['JSON', 'JSONL', 'parser', 'visualizer', 'data', 'tree', 'viewer', 'developer', 'tools'],
    defaultOgImage: '/og-image.png',
    siteUrl: import.meta.env.PROD ? 'https://jsonl-parser.com' : 'http://localhost:5173',
    siteName: 'JSONL Parser',
    twitterHandle: '@jsonlparser'
  })
}

// Page-specific SEO metadata
export const pageSEOConfig = {
  home: {
    title: 'JSONL Parser - JSON & JSONL Data Visualization Tool',
    description: 'Parse, visualize and explore JSON and JSONL data with our interactive tree viewer. Features real-time parsing, hierarchical display, and comprehensive JSON tools.',
    keywords: ['JSON', 'JSONL', 'parser', 'visualizer', 'tree', 'viewer', 'developer', 'tools', 'data', 'validation']
  },
  learn: {
    title: 'Learning Center - JSON & JSONL Tutorials',
    description: 'Learn JSON and JSONL processing with comprehensive tutorials, interactive examples, and best practices for developers.',
    keywords: ['JSON', 'JSONL', 'tutorial', 'learning', 'guide', 'education', 'developer', 'training']
  },
  tools: {
    title: 'JSON Tools Hub - Validation, Conversion & Formatting',
    description: 'Comprehensive collection of JSON tools including validators, converters, formatters, and schema generators for developers.',
    keywords: ['JSON', 'tools', 'validator', 'converter', 'formatter', 'schema', 'generator', 'developer', 'utilities']
  },
  reference: {
    title: 'JSON Reference Guide - Syntax, Patterns & Best Practices',
    description: 'Complete JSON reference with syntax guides, common patterns, error solutions, and performance optimization tips.',
    keywords: ['JSON', 'reference', 'syntax', 'patterns', 'best practices', 'guide', 'documentation', 'cheat sheet']
  },
  samples: {
    title: 'JSON Sample Data Library - Real-world Examples',
    description: 'Curated collection of JSON and JSONL sample data from APIs, configurations, and real-world use cases for testing and learning.',
    keywords: ['JSON', 'JSONL', 'samples', 'examples', 'data', 'API', 'configuration', 'testing', 'real-world']
  },
  info: {
    title: 'JSON & API Development Guide - Information Hub',
    description: 'Comprehensive guides and information about JSON, APIs, data processing, and modern development practices.',
    keywords: ['JSON', 'API', 'development', 'guide', 'information', 'data processing', 'best practices', 'modern development']
  }
}

// Generate structured data for different page types
export const generatePageStructuredData = (pageType: string, pageData?: any) => {
  const baseUrl = import.meta.env.PROD ? 'https://jsonl-parser.com' : 'http://localhost:5173'
  
  switch (pageType) {
    case 'home':
      return {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        'name': 'JSONL Parser',
        'description': 'Parse, visualize and explore JSON and JSONL data with our interactive tree viewer',
        'url': baseUrl,
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
        ],
        'creator': {
          '@type': 'Organization',
          'name': 'JSONL Parser Team'
        }
      }
      
    case 'tutorial':
      if (!pageData) return null
      return {
        '@context': 'https://schema.org',
        '@type': 'LearningResource',
        'name': pageData.title,
        'description': pageData.description,
        'educationalLevel': pageData.difficulty,
        'timeRequired': `PT${pageData.estimatedReadTime}M`,
        'learningResourceType': 'Tutorial',
        'teaches': pageData.keywords || [],
        'author': {
          '@type': 'Organization',
          'name': 'JSONL Parser Team'
        },
        'publisher': {
          '@type': 'Organization',
          'name': 'JSONL Parser',
          'logo': {
            '@type': 'ImageObject',
            'url': `${baseUrl}/logo.png`
          }
        },
        'datePublished': pageData.publishedTime,
        'dateModified': pageData.modifiedTime || pageData.publishedTime,
        'mainEntityOfPage': {
          '@type': 'WebPage',
          '@id': `${baseUrl}/learn/${pageData.id}`
        }
      }
      
    case 'tool':
      if (!pageData) return null
      return {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        'name': pageData.name,
        'description': pageData.description,
        'applicationCategory': 'DeveloperApplication',
        'operatingSystem': 'Web Browser',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'featureList': pageData.features || [],
        'creator': {
          '@type': 'Organization',
          'name': 'JSONL Parser Team'
        }
      }
      
    case 'breadcrumb':
      if (!pageData || !Array.isArray(pageData)) return null
      return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': pageData.map((crumb, index) => ({
          '@type': 'ListItem',
          'position': index + 1,
          'name': crumb.name,
          'item': `${baseUrl}${crumb.url}`
        }))
      }
      
    default:
      return null
  }
}