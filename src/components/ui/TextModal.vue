<template>
  <Teleport to="body">
    <div 
      v-if="isVisible" 
      class="text-modal-overlay"
      @click="handleOverlayClick"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div class="text-modal" @click.stop>
        <div class="modal-header">
          <h3 id="modal-title" class="modal-title">Text Viewer</h3>
          <div class="modal-options">
            <label class="option-toggle">
              <input 
                type="checkbox" 
                v-model="preserveLineBreaks"
                @change="updateDisplayText"
              />
              <span class="toggle-text">Preserve Line Breaks</span>
            </label>
            <button 
              type="button" 
              class="close-button"
              @click="close"
              aria-label="Close"
            >
              <XIcon :size="20" />
            </button>
          </div>
        </div>
        
        <div class="modal-content">
          <div class="text-display" :class="{ 'preserve-breaks': preserveLineBreaks }">
            {{ displayText }}
          </div>
        </div>
        
        <div class="modal-footer">
          <button 
            type="button" 
            class="copy-button"
            @click="copyToClipboard($event)"
          >
            <CopyIcon :size="16" />
            Copy
          </button>
          <button 
            type="button" 
            class="close-button-secondary"
            @click="close"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { X as XIcon, Copy as CopyIcon } from 'lucide-vue-next'

interface Props {
  isVisible: boolean
  text: string | null | undefined
  title?: string
}

interface Emits {
  (e: 'close'): void
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Text Viewer'
})

const emit = defineEmits<Emits>()

const preserveLineBreaks = ref(true)
const displayText = ref('')

const updateDisplayText = () => {
  // props.text를 문자열로 변환
  const textString = String(props.text || '')
  
  if (preserveLineBreaks.value) {
    displayText.value = textString
  } else {
    // 줄바꿈 문자를 시각적으로 표시
    displayText.value = textString
      .replace(/\r\n/g, '\\r\\n\n')
      .replace(/\n/g, '\\n\n')
      .replace(/\r/g, '\\r\n')
  }
}

const close = () => {
  emit('close')
}

const handleOverlayClick = (event: Event) => {
  if (event.target === event.currentTarget) {
    close()
  }
}

const copyToClipboard = async (event: Event) => {
  try {
    await navigator.clipboard.writeText(String(props.text || ''))
    // 성공 피드백을 위한 간단한 알림 (추후 토스트로 개선 가능)
    const button = event.target as HTMLButtonElement
    const originalText = button.textContent
    button.textContent = 'Copied!'
    setTimeout(() => {
      button.textContent = originalText
    }, 1000)
  } catch (err) {
    console.error('Failed to copy to clipboard:', err)
  }
}

// props.text가 변경될 때마다 displayText 업데이트
watch(() => props.text, updateDisplayText, { immediate: true })
watch(() => preserveLineBreaks.value, updateDisplayText)

// ESC 키로 모달 닫기
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.isVisible) {
    close()
  }
}

// 모달이 열릴 때 키보드 이벤트 리스너 추가
watch(() => props.isVisible, (visible) => {
  if (visible) {
    document.addEventListener('keydown', handleKeydown)
    nextTick(() => {
      // 포커스를 모달로 이동
      const modal = document.querySelector('.text-modal') as HTMLElement
      modal?.focus()
    })
  } else {
    document.removeEventListener('keydown', handleKeydown)
  }
})
</script>

<style scoped>
.text-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.text-modal {
  background: var(--color-background);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  max-width: 80vw;
  max-height: 80vh;
  width: 600px;
  display: flex;
  flex-direction: column;
  outline: none;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.modal-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--color-text);
  margin: 0;
}

.modal-options {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.option-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.option-toggle input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: var(--color-primary);
}

.close-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.close-button:hover {
  background: var(--color-surface);
  color: var(--color-text);
}

.modal-content {
  flex: 1;
  overflow: hidden;
  padding: 1.5rem;
}

.text-display {
  width: 100%;
  height: 100%;
  min-height: 200px;
  max-height: 400px;
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  line-height: 1.6;
  color: var(--color-text);
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

.text-display.preserve-breaks {
  white-space: pre-wrap;
  word-break: normal;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid var(--color-border);
}

.copy-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-md);
  background: var(--color-primary);
  color: white;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.copy-button:hover {
  background: rgba(99, 102, 241, 0.9);
  transform: translateY(-1px);
}

.close-button-secondary {
  padding: 0.625rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.close-button-secondary:hover {
  background: var(--color-surface);
  color: var(--color-text);
}

/* 모바일 최적화 */
@media (max-width: 768px) {
  .text-modal {
    max-width: 95vw;
    max-height: 90vh;
    width: auto;
  }
  
  .modal-header {
    padding: 1rem;
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .modal-options {
    justify-content: space-between;
  }
  
  .modal-content {
    padding: 1rem;
  }
  
  .text-display {
    min-height: 150px;
    max-height: 300px;
    font-size: 0.75rem;
  }
  
  .modal-footer {
    padding: 1rem;
    flex-direction: column-reverse;
    gap: 0.5rem;
  }
  
  .copy-button,
  .close-button-secondary {
    width: 100%;
    justify-content: center;
  }
}

/* 접근성 */
@media (prefers-reduced-motion: reduce) {
  .copy-button:hover,
  .close-button:hover {
    transform: none;
  }
}
</style>