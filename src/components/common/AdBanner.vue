<template>
  <!-- 애드센스 client/slot ID가 설정된 경우에만 렌더링 (미승인 상태에서는 빈 화면 영향 없음) -->
  <div v-if="clientId && adSlot" class="ad-banner">
    <ins
      class="adsbygoogle"
      style="display: block"
      :data-ad-client="clientId"
      :data-ad-slot="adSlot"
      data-ad-format="auto"
      data-full-width-responsive="true"
    ></ins>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

const props = defineProps<{
  adSlot?: string
}>()

const clientId = import.meta.env.VITE_ADSENSE_CLIENT as string | undefined
const adSlot = props.adSlot || (import.meta.env.VITE_ADSENSE_SLOT as string | undefined)

const SCRIPT_ID = 'adsbygoogle-js'

onMounted(() => {
  if (!clientId || !adSlot) return

  if (!document.getElementById(SCRIPT_ID)) {
    const script = document.createElement('script')
    script.id = SCRIPT_ID
    script.async = true
    script.crossOrigin = 'anonymous'
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`
    document.head.appendChild(script)
  }

  try {
    ;((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
  } catch {
    // 광고 차단기 등으로 실패해도 앱 동작에는 영향 없음
  }
})
</script>

<style scoped>
.ad-banner {
  flex-shrink: 0;
  padding: 0.5rem 1rem 0;
  background: var(--color-surface);
  min-height: 50px;
}
</style>
