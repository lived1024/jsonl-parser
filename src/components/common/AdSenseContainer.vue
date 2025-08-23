<template>
  <div 
    class="adsense-container" 
    :class="containerClass"
    role="complementary"
    :aria-label="showAd && !isBlocked ? '광고' : undefined"
  >
    <div v-if="showAd && !isBlocked" class="ad-wrapper">
      <ins
        class="adsbygoogle"
        :style="adStyle"
        :data-ad-client="publisherId"
        :data-ad-slot="adSlot"
        :data-ad-format="adFormat"
        :data-ad-layout="adLayout"
        :data-full-width-responsive="fullWidthResponsive"
        aria-label="광고"
      ></ins>
    </div>
    
    <div 
      v-else-if="isBlocked" 
      class="ad-blocked-message"
      role="status"
      aria-live="polite"
    >
      <p>광고 차단기가 감지되었습니다</p>
      <small>이 사이트를 지원하려면 광고 차단기를 비활성화해 주세요</small>
    </div>
    
    <div 
      v-else-if="error" 
      class="ad-error"
      role="alert"
      aria-live="assertive"
    >
      <p>광고를 로드할 수 없습니다</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { AdSenseService } from '../../services/AdSenseService'

interface Props {
  adSlot: string
  adFormat?: 'auto' | 'rectangle' | 'banner' | 'vertical'
  adLayout?: string
  className?: string
  fullWidthResponsive?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  adFormat: 'auto',
  fullWidthResponsive: true
})

const adSenseService = AdSenseService.getInstance()
const showAd = ref(false)
const isBlocked = ref(false)
const error = ref<string | null>(null)

const publisherId = computed(() => {
  const config = adSenseService.getConfig()
  return config?.publisherId || ''
})

const containerClass = computed(() => {
  return [
    'adsense-container',
    props.className,
    `format-${props.adFormat}`
  ].filter(Boolean).join(' ')
})

const adStyle = computed(() => {
  const styles: Record<string, string> = {
    display: 'block'
  }
  
  switch (props.adFormat) {
    case 'banner':
      styles.width = '728px'
      styles.height = '90px'
      break
    case 'rectangle':
      styles.width = '300px'
      styles.height = '250px'
      break
    case 'vertical':
      styles.width = '160px'
      styles.height = '600px'
      break
    default:
      // Auto format - responsive
      break
  }
  
  return styles
})

let adElement: HTMLElement | null = null

onMounted(async () => {
  try {
    // Check if AdSense is initialized
    const state = adSenseService.getState()
    if (!state.isLoaded) {
      error.value = 'AdSense not initialized'
      return
    }

    // Check for ad blocker
    isBlocked.value = adSenseService.isAdBlockerActive()
    if (isBlocked.value) {
      return
    }

    // Show ad and load it
    showAd.value = true
    
    // Wait for next tick to ensure DOM is updated
    await new Promise(resolve => setTimeout(resolve, 100))
    
    adElement = document.querySelector('.adsbygoogle') as HTMLElement
    if (adElement) {
      adSenseService.loadAd(adElement, props.adSlot)
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load ad'
    console.error('AdSense container error:', err)
  }
})

onUnmounted(() => {
  // Cleanup if needed
  adElement = null
})
</script>

<style scoped>
.adsense-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 1rem 0;
  min-height: 100px;
}

.ad-wrapper {
  display: flex;
  justify-content: center;
  width: 100%;
}

.ad-blocked-message,
.ad-error {
  text-align: center;
  padding: 2rem;
  background: var(--color-background-secondary);
  border: 1px dashed var(--color-border);
  border-radius: 8px;
  color: var(--color-text-secondary);
}

.ad-blocked-message p,
.ad-error p {
  margin: 0 0 0.5rem 0;
  font-weight: 500;
}

.ad-blocked-message small {
  font-size: 0.8rem;
  opacity: 0.8;
}

/* Format-specific styles */
.format-banner {
  max-width: 728px;
}

.format-rectangle {
  max-width: 300px;
}

.format-vertical {
  max-width: 160px;
}

.format-auto {
  width: 100%;
  max-width: 100%;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .format-banner .adsbygoogle {
    width: 320px !important;
    height: 50px !important;
  }
  
  .format-rectangle .adsbygoogle {
    width: 300px !important;
    height: 250px !important;
  }
  
  .format-vertical {
    display: none; /* Hide vertical ads on mobile */
  }
}

@media (max-width: 480px) {
  .format-banner .adsbygoogle {
    width: 300px !important;
    height: 50px !important;
  }
}
</style>