/// <reference types="vitest" />
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('vue') || id.includes('pinia') || id.includes('vue-router')) {
              return 'vue-vendor'
            }
            if (id.includes('lucide-vue-next')) {
              return 'ui-vendor'
            }
            if (id.includes('marked') || id.includes('highlight.js')) {
              return 'content-vendor'
            }
            return 'vendor'
          }
          
          // Service-based chunking for better caching
          if (id.includes('services/ContentCacheService') || 
              id.includes('services/MediaOptimizationService') ||
              id.includes('utils/cacheUtils')) {
            return 'cache-services'
          }
          
          // Feature-based chunking with size optimization
          if (id.includes('pages/LearningCenterPage.vue')) {
            return 'learning-center'
          }
          if (id.includes('pages/TutorialPage.vue')) {
            return 'tutorial'
          }
          if (id.includes('pages/ToolsHubPage.vue')) {
            return 'tools-hub'
          }
          if (id.includes('pages/ToolPage.vue')) {
            return 'tool'
          }
          if (id.includes('pages/ReferenceHubPage.vue')) {
            return 'reference-hub'
          }
          if (id.includes('pages/ReferencePage.vue')) {
            return 'reference'
          }
          if (id.includes('pages/SampleLibraryPage.vue')) {
            return 'sample-library'
          }
          if (id.includes('pages/InfoHubPage.vue')) {
            return 'info-hub'
          }
          if (id.includes('pages/InfoGuidePage.vue')) {
            return 'info-guide'
          }
          
          // Component-based chunking for large components
          if (id.includes('components/tools/')) {
            return 'tools-components'
          }
          if (id.includes('components/feature/')) {
            return 'feature-components'
          }
          if (id.includes('components/common/')) {
            return 'common-components'
          }
          
          // Content chunking
          if (id.includes('content/') || id.includes('locales/')) {
            return 'content'
          }
        },
        // Optimize chunk file names for better caching
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
          if (facadeModuleId) {
            if (facadeModuleId.includes('pages/')) {
              return 'pages/[name]-[hash].js'
            }
            if (facadeModuleId.includes('components/')) {
              return 'components/[name]-[hash].js'
            }
            if (facadeModuleId.includes('services/')) {
              return 'services/[name]-[hash].js'
            }
          }
          return 'chunks/[name]-[hash].js'
        },
        // Optimize asset file names
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || []
          const ext = info[info.length - 1]
          
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return 'assets/images/[name]-[hash][extname]'
          }
          if (/css/i.test(ext)) {
            return 'assets/styles/[name]-[hash][extname]'
          }
          if (/woff2?|eot|ttf|otf/i.test(ext)) {
            return 'assets/fonts/[name]-[hash][extname]'
          }
          
          return 'assets/[name]-[hash][extname]'
        }
      }
    },
    // Optimize chunk size warnings
    chunkSizeWarningLimit: 500,
    // Additional optimizations
    minify: 'esbuild',
    // Enable source maps for debugging in production
    sourcemap: false,
    // Optimize CSS
    cssCodeSplit: true,
    // Enable asset inlining for small files
    assetsInlineLimit: 4096,
    // Optimize dependencies
    commonjsOptions: {
      include: [/node_modules/],
      extensions: ['.js', '.cjs']
    }
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      'marked',
      'highlight.js'
    ],
    exclude: ['@vite/client', '@vite/env']
  },
  // Enable experimental features for better performance
  esbuild: {
    drop: ['console', 'debugger'], // Remove console.log in production
    legalComments: 'none'
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts']
  }
})