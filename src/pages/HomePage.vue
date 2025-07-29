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
  </DefaultLayout>
</template>

<script setup lang="ts">
import { useApp } from '../composables/useApp'
import DefaultLayout from '../layouts/DefaultLayout.vue'
import PanelResizer from '../components/ui/PanelResizer.vue'
import InputPanel from '../components/feature/InputPanel.vue'
import OutputPanel from '../components/feature/OutputPanel.vue'

const {
  isMobile,
  inputPanelStyle,
  handlePanelResize
} = useApp()
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
}
</style>