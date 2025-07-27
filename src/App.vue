<template>
  <div id="app">
    <header class="app-header" role="banner">
      <div class="header-content">
        <div class="header-brand">
          <div class="brand-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <h1 class="brand-title">JSON Tree Viewer</h1>
        </div>
        <div class="header-actions">
          <KeyboardShortcuts />
        </div>
      </div>
    </header>
    
    <main class="app-main" :style="mainStyle" role="main" aria-label="JSON 트리 뷰어 메인 영역">
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
    </main>
  </div>
</template>

<script setup lang="ts">
import useApp from './App'
import PanelResizer from './components/PanelResizer.vue'
import InputPanel from './components/InputPanel.vue'
import OutputPanel from './components/OutputPanel.vue'
import KeyboardShortcuts from './components/KeyboardShortcuts.vue'

const {
  isMobile,
  mainStyle,
  inputPanelStyle,
  handlePanelResize
} = useApp()
</script>

<style scoped src="./App.css"></style>