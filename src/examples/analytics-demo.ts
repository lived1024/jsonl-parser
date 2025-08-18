/**
 * Demo script to show Google Analytics integration working
 * This can be run in the browser console to test analytics functionality
 */

import { AnalyticsService } from '../services/AnalyticsService'
import { useAnalytics } from '../composables/useAnalytics'

// Demo function to test analytics integration
export async function demoAnalytics() {
  console.log('🚀 Starting Google Analytics Demo')
  
  // Initialize analytics service
  const analyticsService = AnalyticsService.getInstance()
  
  try {
    await analyticsService.init({
      measurementId: 'G-PX3P01GVCR',
      enableDebug: true,
      customDimensions: {
        app_version: '1.0.0',
        app_name: 'JSONL Parser'
      }
    })
    
    console.log('✅ Analytics service initialized')
    console.log('State:', analyticsService.getState())
    
    // Test basic tracking
    const { trackPageView, trackTool, trackTutorial, trackSample } = useAnalytics()
    
    // Track page view
    trackPageView('/demo', 'Analytics Demo Page', {
      demo: true,
      timestamp: Date.now()
    })
    console.log('📊 Page view tracked')
    
    // Track tool usage
    trackTool.use('json_parser', 'medium', {
      input_type: 'json',
      demo: true
    })
    console.log('🔧 Tool usage tracked')
    
    // Track tutorial interaction
    trackTutorial.start('analytics-demo', {
      difficulty: 'beginner',
      demo: true
    })
    console.log('📚 Tutorial start tracked')
    
    // Track sample loading
    trackSample.load('demo-sample', 'demo', 'simple', {
      demo: true
    })
    console.log('📄 Sample load tracked')
    
    // Set user properties
    analyticsService.setUserProperties({
      user_language: 'ko',
      user_theme: 'light',
      user_type: 'developer',
      session_count: 1
    })
    console.log('👤 User properties set')
    
    // Track performance
    analyticsService.trackTiming('demo_execution', 1000, 'performance', 'analytics_demo')
    console.log('⏱️ Performance timing tracked')
    
    console.log('🎉 Analytics demo completed successfully!')
    
  } catch (error) {
    console.error('❌ Analytics demo failed:', error)
  }
}

// Auto-run demo in development mode
if (import.meta.env.DEV) {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(demoAnalytics, 2000) // Wait 2 seconds after DOM ready
    })
  } else {
    setTimeout(demoAnalytics, 2000)
  }
}