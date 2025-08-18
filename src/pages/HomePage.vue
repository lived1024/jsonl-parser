<template>
  <DefaultLayout>
    <div class="home-page">
      <section 
        class="input-panel-container" 
        :style="inputPanelStyle"
        role="region"
        aria-label="JSON 입력 영역"
      >
        <InputPanel />
      </section>
      
      <PanelResizer 
        v-if="!isMobile" 
        @resize="handlePanelResize"
        role="separator"
        aria-label="패널 크기 조정"
      />
      
      <section 
        class="output-panel-container"
        role="region"
        aria-label="JSON 트리 출력 영역"
      >
        <OutputPanel />
      </section>
    </div>
    
    <!-- 하단 광고 -->
    <!-- <div class="footer-ad-container">
      <AdSenseContainer 
        ad-slot="footer-banner"
        ad-format="banner"
        class-name="footer-ad"
      />
    </div> -->
  </DefaultLayout>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useApp } from '../composables/useApp'
import { useJsonTreeStore } from '../stores/jsonTreeStore'
import DefaultLayout from '../layouts/DefaultLayout.vue'
import PanelResizer from '../components/ui/PanelResizer.vue'
import InputPanel from '../components/feature/InputPanel.vue'
import OutputPanel from '../components/feature/OutputPanel.vue'
import AdSenseContainer from '../components/common/AdSenseContainer.vue'

const route = useRoute()
const jsonTreeStore = useJsonTreeStore()

const {
  isMobile,
  inputPanelStyle,
  handlePanelResize
} = useApp()

// 컴포넌트 마운트 시 쿼리 파라미터 및 예제 데이터 확인
onMounted(() => {
  // URL 쿼리 파라미터에서 데이터 로드
  const dataParam = route.query.data
  if (dataParam && typeof dataParam === 'string') {
    try {
      // URL 디코딩 후 JSON 데이터 로드
      const decodedData = decodeURIComponent(dataParam)
      jsonTreeStore.setInputData(decodedData)
    } catch (error) {
      console.error('Failed to load data from query parameter:', error)
    }
  }
  
  // 가이드에서 온 예제 데이터 확인
  const exampleParam = route.query.example
  if (exampleParam && typeof exampleParam === 'string') {
    try {
      // localStorage에서 예제 데이터 로드
      const exampleData = localStorage.getItem('parser-example-data')
      const exampleType = localStorage.getItem('parser-example-type')
      const exampleTitle = localStorage.getItem('parser-example-title')
      
      if (exampleData) {
        jsonTreeStore.setInputData(exampleData)
        
        // 예제 정보를 사용자에게 표시 (선택적)
        if (exampleTitle) {
          console.log(`Loaded example: ${exampleTitle}`)
        }
        
        // 사용 후 localStorage 정리
        localStorage.removeItem('parser-example-data')
        localStorage.removeItem('parser-example-type')
        localStorage.removeItem('parser-example-title')
      }
    } catch (error) {
      console.error('Failed to load example data:', error)
    }
  }
})
</script>

<style scoped>
.home-page {
  display: flex;
  height: 100%;
  gap: 1rem;
  overflow: hidden;
  width: 100%;
}

.input-panel-container {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--color-background);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.output-panel-container {
  background: var(--color-background);
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  min-width: 0;
  width: 100%;
}

/* 광고 스타일 */
.footer-ad-container {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--color-background);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  display: flex;
  justify-content: center;
}

.footer-ad {
  width: 100%;
  max-width: 728px;
}

/* 반응형 디자인 - 모바일 */
@media (max-width: 768px) {
  .home-page {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .input-panel-container,
  .output-panel-container {
    border-radius: var(--radius-md);
  }
  
  .footer-ad-container {
    margin-top: 0.75rem;
    padding: 0.75rem;
    border-radius: var(--radius-md);
  }
  
  .footer-ad {
    max-width: 320px;
  }
}
</style>