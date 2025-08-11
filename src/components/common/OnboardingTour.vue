<template>
  <div v-if="isActive" class="onboarding-overlay">
    <div class="onboarding-backdrop" @click="skipTour"></div>
    
    <div 
      class="onboarding-tooltip"
      :class="`onboarding-tooltip--${currentStep.position}`"
      :style="tooltipStyle"
    >
      <div class="onboarding-content">
        <div class="onboarding-header">
          <div class="step-indicator">
            <span class="step-current">{{ currentStepIndex + 1 }}</span>
            <span class="step-separator">/</span>
            <span class="step-total">{{ steps.length }}</span>
          </div>
          <button 
            class="onboarding-close"
            @click="skipTour"
            :aria-label="t('onboarding.close')"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        
        <div class="onboarding-body">
          <h3>{{ currentStep.title }}</h3>
          <p>{{ currentStep.description }}</p>
          
          <div v-if="currentStep.tips" class="onboarding-tips">
            <div class="tip-item" v-for="tip in currentStep.tips" :key="tip">
              <span class="tip-icon">💡</span>
              <span>{{ tip }}</span>
            </div>
          </div>
        </div>
        
        <div class="onboarding-footer">
          <button 
            v-if="currentStepIndex > 0"
            class="onboarding-btn onboarding-btn--secondary"
            @click="previousStep"
          >
            {{ t('onboarding.previous') }}
          </button>
          
          <div class="onboarding-actions">
            <button 
              class="onboarding-btn onboarding-btn--ghost"
              @click="skipTour"
            >
              {{ t('onboarding.skip') }}
            </button>
            
            <button 
              class="onboarding-btn onboarding-btn--primary"
              @click="nextStep"
            >
              {{ isLastStep ? t('onboarding.finish') : t('onboarding.next') }}
            </button>
          </div>
        </div>
      </div>
      
      <div class="onboarding-arrow" :class="`arrow--${currentStep.position}`"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from '../../composables/useI18n'

interface OnboardingStep {
  id: string
  title: string
  description: string
  target: string
  position: 'top' | 'bottom' | 'left' | 'right'
  tips?: string[]
}

interface Props {
  autoStart?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  autoStart: false
})

const { t } = useI18n()

const isActive = ref(false)
const currentStepIndex = ref(0)
const tooltipStyle = ref({})

const steps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: t('onboarding.steps.welcome.title'),
    description: t('onboarding.steps.welcome.description'),
    target: '.app-header',
    position: 'bottom',
    tips: [
      t('onboarding.steps.welcome.tip1'),
      t('onboarding.steps.welcome.tip2')
    ]
  },
  {
    id: 'input-panel',
    title: t('onboarding.steps.inputPanel.title'),
    description: t('onboarding.steps.inputPanel.description'),
    target: '.input-panel',
    position: 'right',
    tips: [
      t('onboarding.steps.inputPanel.tip1'),
      t('onboarding.steps.inputPanel.tip2')
    ]
  },
  {
    id: 'format-selector',
    title: t('onboarding.steps.formatSelector.title'),
    description: t('onboarding.steps.formatSelector.description'),
    target: '.format-selector',
    position: 'bottom'
  },
  {
    id: 'output-panel',
    title: t('onboarding.steps.outputPanel.title'),
    description: t('onboarding.steps.outputPanel.description'),
    target: '.output-panel',
    position: 'left',
    tips: [
      t('onboarding.steps.outputPanel.tip1'),
      t('onboarding.steps.outputPanel.tip2')
    ]
  },
  {
    id: 'shortcuts',
    title: t('onboarding.steps.shortcuts.title'),
    description: t('onboarding.steps.shortcuts.description'),
    target: '.shortcuts-toggle',
    position: 'bottom',
    tips: [
      t('onboarding.steps.shortcuts.tip1'),
      t('onboarding.steps.shortcuts.tip2')
    ]
  }
]

const currentStep = computed(() => steps[currentStepIndex.value])
const isLastStep = computed(() => currentStepIndex.value === steps.length - 1)

const startTour = () => {
  isActive.value = true
  currentStepIndex.value = 0
  updateTooltipPosition()
}

const nextStep = () => {
  if (isLastStep.value) {
    finishTour()
  } else {
    currentStepIndex.value++
    updateTooltipPosition()
  }
}

const previousStep = () => {
  if (currentStepIndex.value > 0) {
    currentStepIndex.value--
    updateTooltipPosition()
  }
}

const skipTour = () => {
  isActive.value = false
  localStorage.setItem('onboarding-completed', 'true')
}

const finishTour = () => {
  isActive.value = false
  localStorage.setItem('onboarding-completed', 'true')
}

const updateTooltipPosition = () => {
  const target = document.querySelector(currentStep.value.target)
  if (!target) return

  const rect = target.getBoundingClientRect()
  const position = currentStep.value.position

  let top = 0
  let left = 0

  switch (position) {
    case 'top':
      top = rect.top - 20
      left = rect.left + rect.width / 2
      break
    case 'bottom':
      top = rect.bottom + 20
      left = rect.left + rect.width / 2
      break
    case 'left':
      top = rect.top + rect.height / 2
      left = rect.left - 20
      break
    case 'right':
      top = rect.top + rect.height / 2
      left = rect.right + 20
      break
  }

  tooltipStyle.value = {
    top: `${top}px`,
    left: `${left}px`,
    transform: position === 'left' || position === 'right' 
      ? 'translateY(-50%)' 
      : 'translateX(-50%)'
  }
}

const handleResize = () => {
  if (isActive.value) {
    updateTooltipPosition()
  }
}

onMounted(() => {
  if (props.autoStart && !localStorage.getItem('onboarding-completed')) {
    setTimeout(startTour, 1000)
  }
  
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

defineExpose({
  startTour
})
</script>

<style scoped>
.onboarding-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2000;
  pointer-events: none;
}

.onboarding-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  pointer-events: all;
}

.onboarding-tooltip {
  position: absolute;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 320px;
  pointer-events: all;
  z-index: 2001;
}

.onboarding-content {
  padding: 1.5rem;
}

.onboarding-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.step-indicator {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.step-current {
  color: var(--color-primary);
  font-weight: 600;
}

.onboarding-close {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: all 0.2s ease;
}

.onboarding-close:hover {
  background: var(--color-surface-hover);
  color: var(--color-text-primary);
}

.onboarding-body h3 {
  margin: 0 0 0.75rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.onboarding-body p {
  margin: 0 0 1rem 0;
  line-height: 1.5;
  color: var(--color-text-secondary);
}

.onboarding-tips {
  background: var(--color-surface-elevated);
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
}

.tip-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  line-height: 1.4;
  color: var(--color-text-secondary);
}

.tip-item:last-child {
  margin-bottom: 0;
}

.tip-icon {
  flex-shrink: 0;
  font-size: 1rem;
}

.onboarding-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.onboarding-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.onboarding-btn {
  border: none;
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.onboarding-btn--primary {
  background: var(--color-primary);
  color: white;
}

.onboarding-btn--primary:hover {
  background: var(--color-primary-hover);
}

.onboarding-btn--secondary {
  background: var(--color-surface-elevated);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.onboarding-btn--secondary:hover {
  background: var(--color-surface-hover);
}

.onboarding-btn--ghost {
  background: none;
  color: var(--color-text-secondary);
}

.onboarding-btn--ghost:hover {
  background: var(--color-surface-hover);
  color: var(--color-text-primary);
}

.onboarding-arrow {
  position: absolute;
  width: 0;
  height: 0;
  border: 8px solid transparent;
}

.arrow--top {
  bottom: -16px;
  left: 50%;
  transform: translateX(-50%);
  border-top-color: var(--color-surface);
}

.arrow--bottom {
  top: -16px;
  left: 50%;
  transform: translateX(-50%);
  border-bottom-color: var(--color-surface);
}

.arrow--left {
  right: -16px;
  top: 50%;
  transform: translateY(-50%);
  border-left-color: var(--color-surface);
}

.arrow--right {
  left: -16px;
  top: 50%;
  transform: translateY(-50%);
  border-right-color: var(--color-surface);
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .onboarding-tooltip {
    max-width: 280px;
    margin: 1rem;
  }
  
  .onboarding-content {
    padding: 1rem;
  }
  
  .onboarding-footer {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .onboarding-actions {
    width: 100%;
    justify-content: space-between;
  }
}
</style>