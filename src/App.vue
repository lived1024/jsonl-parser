<template>
  <div id="app">
    <router-view />
    <AnalyticsDashboard />
    <AnalyticsDemo />
  </div>
</template>

<script setup lang="ts">
import AnalyticsDashboard from './components/common/AnalyticsDashboard.vue'
import AnalyticsDemo from './components/common/AnalyticsDemo.vue'
import { useUserTracking } from './composables/useUserTracking'

// Initialize user tracking for the entire app
useUserTracking()
</script>

<style>
#app {
  height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>