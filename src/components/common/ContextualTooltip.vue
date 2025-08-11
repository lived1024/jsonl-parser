<template>
  <div 
    class="contextual-tooltip-trigger"
    @mouseenter="showTooltip"
    @mouseleave="hideTooltip"
    @focus="showTooltip"
    @blur="hideTooltip"
  >
    <slot />
    
    <Teleport to="body">
      <div 
        v-if="isVisible"
        ref="tooltipRef"
        class="contextual-tooltip"
        :class="`contextual-tooltip--${position}`"
        :style="tooltipStyle"
        role="tooltip"
        :aria-describedby="tooltipId"
      >
        <div class="tooltip-content">
          <div v-if="title" class="tooltip-title">{{ title }}</div>
          <div class="tooltip-description">{{ description }}</div>
          
          <div v-if="shortcut" class="tooltip-shortcut">
            <span class="shortcut-label">{{ t('tooltip.shortcut') }}:</span>
            <kbd v-for="key in shortcut.split('+')" :key="key" class="shortcut-key">
              {{ key.trim() }}
            </kbd>
          </div>
          
          <div v-if="tips && tips.length > 0" class="tooltip-tips">
            <div class="tips-header">{{ t('tooltip.tips') }}:</div>
            <ul class="tips-list">
              <li v-for="tip in tips" :key="tip" class="tip-item">{{ tip }}</li>
            </ul>
          </div>
        </div>
        
        <div class="tooltip-arrow" :class="`arrow--${position}`"></div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useI18n } from '../../composables/useI18n'

interface Props {
  title?: string
  description: string
  shortcut?: string
  tips?: string[]
  position?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  position: 'top',
  delay: 500,
  disabled: false
})

const { t } = useI18n()

const isVisible = ref(false)
const tooltipRef = ref<HTMLElement>()
const tooltipStyle = ref({})
const showTimeout = ref<number>()
const hideTimeout = ref<number>()

const tooltipId = computed(() => `tooltip-${Math.random().toString(36).substr(2, 9)}`)

const showTooltip = async () => {
  if (props.disabled) return
  
  clearTimeout(hideTimeout.value)
  
  showTimeout.value = window.setTimeout(async () => {
    isVisible.value = true
    await nextTick()
    updatePosition()
  }, props.delay)
}

const hideTooltip = () => {
  clearTimeout(showTimeout.value)
  
  hideTimeout.value = window.setTimeout(() => {
    isVisible.value = false
  }, 100)
}

const updatePosition = () => {
  const trigger = document.querySelector('.contextual-tooltip-trigger')
  const tooltip = tooltipRef.value
  
  if (!trigger || !tooltip) return
  
  const triggerRect = trigger.getBoundingClientRect()
  const tooltipRect = tooltip.getBoundingClientRect()
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  
  let top = 0
  let left = 0
  let actualPosition = props.position
  
  // 기본 위치 계산
  switch (props.position) {
    case 'top':
      top = triggerRect.top - tooltipRect.height - 12
      left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2
      break
    case 'bottom':
      top = triggerRect.bottom + 12
      left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2
      break
    case 'left':
      top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2
      left = triggerRect.left - tooltipRect.width - 12
      break
    case 'right':
      top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2
      left = triggerRect.right + 12
      break
  }
  
  // 뷰포트 경계 확인 및 위치 조정
  if (left < 8) {
    left = 8
  } else if (left + tooltipRect.width > viewportWidth - 8) {
    left = viewportWidth - tooltipRect.width - 8
  }
  
  if (top < 8) {
    if (props.position === 'top') {
      top = triggerRect.bottom + 12
      actualPosition = 'bottom'
    } else {
      top = 8
    }
  } else if (top + tooltipRect.height > viewportHeight - 8) {
    if (props.position === 'bottom') {
      top = triggerRect.top - tooltipRect.height - 12
      actualPosition = 'top'
    } else {
      top = viewportHeight - tooltipRect.height - 8
    }
  }
  
  tooltipStyle.value = {
    top: `${top}px`,
    left: `${left}px`
  }
  
  // 화살표 위치 업데이트
  tooltip.className = `contextual-tooltip contextual-tooltip--${actualPosition}`
}
</script>

<style scoped>
.contextual-tooltip-trigger {
  display: inline-block;
}

.contextual-tooltip {
  position: fixed;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  box-shadow: 
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  max-width: 280px;
  z-index: 1500;
  animation: tooltip-fade-in 0.2s ease-out;
}

@keyframes tooltip-fade-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.tooltip-content {
  padding: 1rem;
}

.tooltip-title {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--color-text-primary);
  margin-bottom: 0.5rem;
}

.tooltip-description {
  font-size: 0.8125rem;
  line-height: 1.4;
  color: var(--color-text-secondary);
  margin-bottom: 0.75rem;
}

.tooltip-description:last-child {
  margin-bottom: 0;
}

.tooltip-shortcut {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--color-border);
}

.shortcut-label {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.shortcut-key {
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: 0.25rem;
  padding: 0.125rem 0.375rem;
  font-size: 0.6875rem;
  font-family: monospace;
  color: var(--color-text-primary);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.tooltip-tips {
  padding-top: 0.75rem;
  border-top: 1px solid var(--color-border);
}

.tips-header {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: 0.5rem;
}

.tips-list {
  margin: 0;
  padding-left: 1rem;
  list-style: none;
}

.tip-item {
  position: relative;
  font-size: 0.75rem;
  line-height: 1.4;
  color: var(--color-text-secondary);
  margin-bottom: 0.25rem;
}

.tip-item::before {
  content: '•';
  position: absolute;
  left: -0.75rem;
  color: var(--color-primary);
}

.tip-item:last-child {
  margin-bottom: 0;
}

.tooltip-arrow {
  position: absolute;
  width: 0;
  height: 0;
  border: 6px solid transparent;
}

.contextual-tooltip--top .tooltip-arrow {
  bottom: -12px;
  left: 50%;
  transform: translateX(-50%);
  border-top-color: var(--color-surface);
}

.contextual-tooltip--bottom .tooltip-arrow {
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  border-bottom-color: var(--color-surface);
}

.contextual-tooltip--left .tooltip-arrow {
  right: -12px;
  top: 50%;
  transform: translateY(-50%);
  border-left-color: var(--color-surface);
}

.contextual-tooltip--right .tooltip-arrow {
  left: -12px;
  top: 50%;
  transform: translateY(-50%);
  border-right-color: var(--color-surface);
}

/* 다크 모드 */
@media (prefers-color-scheme: dark) {
  .contextual-tooltip {
    box-shadow: 
      0 10px 15px -3px rgba(0, 0, 0, 0.3),
      0 4px 6px -2px rgba(0, 0, 0, 0.2);
  }
}

/* 접근성 */
@media (prefers-reduced-motion: reduce) {
  .contextual-tooltip {
    animation: none;
  }
}
</style>