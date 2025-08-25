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
            return 'vendor'
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
        // Optimize chunk file names
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
          if (facadeModuleId) {
            if (facadeModuleId.includes('pages/')) {
              return 'pages/[name]-[hash].js'
            }
            if (facadeModuleId.includes('components/')) {
              return 'components/[name]-[hash].js'
            }
          }
          return 'chunks/[name]-[hash].js'
        }
      }
    },
    // Optimize chunk size warnings
    chunkSizeWarningLimit: 500,
    // Additional optimizations
    minify: 'esbuild',
    // Enable source maps for debugging in production
    sourcemap: false
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts']
  }
})