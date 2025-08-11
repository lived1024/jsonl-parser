<template>
  <div class="help-button-container">
    <button 
      class="help-button"
      @click="toggleHelp"
      :aria-label="t('help.openHelp')"
      :title="t('help.openHelp')"
    >
      <HelpIcon />
    </button>
    
    <HelpModal 
      :is-open="isHelpOpen"
      @close="closeHelp"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from '../../composables/useI18n'
import HelpIcon from '../icons/HelpIcon.vue'
import HelpModal from './HelpModal.vue'

const { t } = useI18n()

const isHelpOpen = ref(false)

const toggleHelp = () => {
  isHelpOpen.value = !isHelpOpen.value
}

const closeHelp = () => {
  isHelpOpen.value = false
}

// F1 키로 도움말 열기
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'F1') {
    event.preventDefault()
    toggleHelp()
  }
}

// 전역 키보드 이벤트 리스너 등록
document.addEventListener('keydown', handleKeydown)
</script>

<style scoped>
.help-button-container {
  position: relative;
}

.help-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.75rem;
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.help-button:hover {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.help-button:active {
  transform: translateY(0);
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .help-button {
    width: 2.25rem;
    height: 2.25rem;
  }
}

/* 접근성 */
@media (prefers-reduced-motion: reduce) {
  .help-button {
    transition: none;
  }
}
</style>