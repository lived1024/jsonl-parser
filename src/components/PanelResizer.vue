<template>
  <div 
    class="panel-resizer"
    :class="{ 'panel-resizer--active': isResizing }"
    @mousedown="startResize"
    @touchstart="startResize"
    role="separator"
    aria-orientation="vertical"
    aria-label="패널 크기 조정"
    tabindex="0"
    @keydown="handleKeydown"
  >
    <div class="resizer-track">
      <div class="resizer-handle">
        <div class="handle-dots">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import usePanelResizer from './PanelResizer'

const emit = defineEmits<{
  resize: [width: number]
}>()

const {
  isResizing,
  startResize,
  handleKeydown
} = usePanelResizer(emit)
</script>

<style scoped src="./PanelResizer.css"></style>