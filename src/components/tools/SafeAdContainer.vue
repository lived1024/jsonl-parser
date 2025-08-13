<template>
  <div class="safe-ad-container" :class="className">
    <Suspense>
      <template #default>
        <AdSenseContainer 
          :ad-slot="adSlot"
          :ad-format="adFormat"
          :class-name="className"
        />
      </template>
      <template #fallback>
        <div class="ad-placeholder">
          <p>광고 로딩 중...</p>
        </div>
      </template>
    </Suspense>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

interface Props {
  adSlot: string
  adFormat?: 'auto' | 'rectangle' | 'banner' | 'vertical'
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  adFormat: 'auto'
})

// Safely import AdSenseContainer with error handling
const AdSenseContainer = defineAsyncComponent({
  loader: () => import('../common/AdSenseContainer.vue'),
  errorComponent: {
    template: `
      <div class="ad-error-fallback">
        <p>광고 영역</p>
      </div>
    `
  },
  loadingComponent: {
    template: `
      <div class="ad-loading">
        <p>광고 로딩 중...</p>
      </div>
    `
  },
  delay: 200,
  timeout: 3000
})
</script>

<style scoped>
.safe-ad-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 1rem 0;
  min-height: 100px;
}

.ad-placeholder,
.ad-error-fallback,
.ad-loading {
  text-align: center;
  padding: 2rem;
  background: var(--color-background-secondary);
  border: 1px dashed var(--color-border);
  border-radius: 8px;
  color: var(--color-text-secondary);
  width: 100%;
  max-width: 300px;
}

.ad-placeholder p,
.ad-error-fallback p,
.ad-loading p {
  margin: 0;
  font-size: 0.9rem;
}
</style>