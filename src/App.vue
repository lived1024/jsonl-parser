<template>
  <div id="app">
    <ChunkLoadingIndicator />
    <router-view />
    <AnalyticsDashboard />
    <AnalyticsDemo />
    <PerformanceDashboard />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import ChunkLoadingIndicator from './components/common/ChunkLoadingIndicator.vue'
import AnalyticsDashboard from './components/common/AnalyticsDashboard.vue'
import AnalyticsDemo from './components/common/AnalyticsDemo.vue'
import PerformanceDashboard from './components/common/PerformanceDashboard.vue'
import { useUserTracking } from './composables/useUserTracking'
import { useAccessibility } from './composables/useAccessibility'
import { useKeyboardNavigation } from './composables/useKeyboardNavigation'
import { PerformanceService } from './services/PerformanceService'

// Initialize user tracking for the entire app
useUserTracking()

// Initialize accessibility features
const accessibility = useAccessibility()
const keyboardNav = useKeyboardNavigation()

onMounted(() => {
  // 접근성 설정 적용
  accessibility.applyAccessibilitySettings()
  
  // 접근성 검사 (개발 환경에서만)
  if (import.meta.env.DEV) {
    const issues = accessibility.checkAccessibility()
    if (issues.length > 0) {
      console.warn('접근성 문제 발견:', issues)
    }
  }
  
  // 메인 콘텐츠 영역에 ID 추가 (스킵 링크용)
  const mainContent = document.querySelector('main, [role="main"]')
  if (mainContent && !mainContent.id) {
    mainContent.id = 'main-content'
  }

  // Initialize performance monitoring
  const performanceService = PerformanceService.getInstance()
  
  // Log performance report in development
  if (import.meta.env.DEV) {
    setTimeout(() => {
      const report = performanceService.getPerformanceReport()
      console.log('Performance Report:', report)
      
      const bundleAnalysis = performanceService.getBundleAnalysis()
      console.log('Bundle Analysis:', bundleAnalysis)
    }, 5000) // Wait 5 seconds for chunks to load
  }
})
</script>

<style>
#app {
  height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>