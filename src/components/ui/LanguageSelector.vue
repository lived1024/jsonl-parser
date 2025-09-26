<template>
  <div class="language-selector" ref="selectorRef">
    <button 
      class="language-button"
      @click="toggleDropdown"
      @keydown="handleButtonKeydown"
      :aria-expanded="isOpen"
      :aria-haspopup="true"
      :aria-label="t('accessibility.languageSelector.label')"
      :title="t('accessibility.languageSelector.currentLanguage', { language: currentLanguageInfo?.nativeName || 'Unknown' })"
      :class="{ 
        'language-button--active': isOpen,
        'language-button--loading': isChangingLanguage || isLoading,
        'language-button--error': hasError
      }"
      :disabled="isChangingLanguage || isLoading"
    >
      <div class="button-content">
        <div v-if="!(isChangingLanguage || isLoading)" class="language-flag">
          <component 
            v-if="getFlagComponent(currentLanguage)" 
            :is="getFlagComponent(currentLanguage)" 
            :size="18"
          />
          <span v-else>🌐</span>
        </div>
        <div v-if="isChangingLanguage || isLoading" class="loading-spinner">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12a9 9 0 11-6.219-8.56"/>
          </svg>
        </div>
        <div v-if="!(isChangingLanguage || isLoading)" class="language-text">
          <span class="language-name">{{ currentLanguageInfo?.name || 'Language' }}</span>
          <span class="language-native">{{ currentLanguageInfo?.nativeName || '' }}</span>
        </div>
        <div v-if="isChangingLanguage" class="loading-text">
          <span class="loading-message">{{ t('languageSelector.changing') }}</span>
        </div>
        <ChevronDownIcon 
          v-if="!(isChangingLanguage || isLoading)"
          :size="16" 
          class="dropdown-icon"
          :class="{ 'dropdown-icon--rotated': isOpen }"
        />
      </div>
    </button>
    
    <Transition name="dropdown" appear>
      <div 
        v-if="isOpen" 
        class="language-dropdown"
        role="listbox"
        :aria-label="t('accessibility.languageSelector.label')"
        :aria-activedescendant="`language-option-${focusedIndex}`"
      >
        <button 
          v-for="(lang, index) in availableLanguages" 
          :key="lang.code"
          :id="`language-option-${index}`"
          class="language-option"
          :class="{ 
            'language-option--active': lang.code === currentLanguage,
            'language-option--focused': focusedIndex === index
          }"
          @click="selectLanguage(lang.code)"
          @keydown="handleOptionKeydown($event, index)"
          @mouseenter="focusedIndex = index"
          @focus="focusedIndex = index"
          role="option"
          :aria-selected="lang.code === currentLanguage"
          :tabindex="focusedIndex === index ? 0 : -1"
          :aria-label="t('languageSelector.optionLabel', { language: lang.nativeName })"
        >
          <div class="option-content">
            <div class="option-flag">
              <component 
                v-if="getFlagComponent(lang.code)" 
                :is="getFlagComponent(lang.code)" 
                :size="20"
              />
              <span v-else>{{ lang.flag }}</span>
            </div>
            <div class="option-text">
              <span class="option-name">{{ lang.name }}</span>
              <span class="option-native">{{ lang.nativeName }}</span>
            </div>
            <CheckIcon 
              v-if="lang.code === currentLanguage"
              :size="16" 
              class="option-check"
              :aria-label="t('languageSelector.currentSelection')"
            />
          </div>
        </button>
      </div>
    </Transition>

    <!-- Error notification -->
    <Transition name="error-notification">
      <div 
        v-if="errorMessage" 
        class="error-notification"
        role="alert"
        :aria-live="'assertive'"
      >
        <div class="error-content">
          <span class="error-text">{{ errorMessage }}</span>
          <button 
            class="error-close"
            @click="clearError"
            :aria-label="t('common.close')"
          >
            ×
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { ChevronDownIcon, CheckIcon } from 'lucide-vue-next'
import { useI18n } from '../../composables/useI18n'
import type { Language } from '../../types/i18n'
import FlagUS from '../icons/FlagUS.vue'
import FlagKR from '../icons/FlagKR.vue'

// Composables
const { t, currentLanguage, changeLanguage, availableLanguages, getCurrentLanguageInfo, isLoading } = useI18n()

// Refs
const selectorRef = ref<HTMLElement>()
const isOpen = ref(false)
const focusedIndex = ref(0)
const isChangingLanguage = ref(false)
const errorMessage = ref<string>('')
const hasError = ref(false)
const errorTimeout = ref<number | null>(null)

// Computed
const currentLanguageInfo = computed(() => getCurrentLanguageInfo.value)

// 국기 컴포넌트 매핑
const getFlagComponent = (languageCode: Language) => {
  switch (languageCode) {
    case 'en':
      return FlagUS
    case 'ko':
      return FlagKR
    default:
      return null
  }
}

// Methods
const toggleDropdown = (): void => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    // 현재 언어에 포커스 설정
    const currentIndex = availableLanguages.findIndex(lang => lang.code === currentLanguage.value)
    focusedIndex.value = currentIndex >= 0 ? currentIndex : 0
    
    nextTick(() => {
      // 첫 번째 옵션에 포커스
      const firstOption = selectorRef.value?.querySelector('.language-option') as HTMLElement
      firstOption?.focus()
    })
  }
}

const selectLanguage = async (language: Language): Promise<void> => {
  if (language === currentLanguage.value) {
    closeDropdown()
    return
  }

  try {
    clearError()
    isChangingLanguage.value = true
    
    // 언어 변경 시작을 스크린 리더에 알림
    announceToScreenReader(t('languageSelector.changingLanguage', { language: getLanguageInfo(language)?.nativeName }))
    
    await changeLanguage(language)
    
    // 성공 시 스크린 리더에 알림
    announceToScreenReader(t('languageSelector.languageChanged', { language: getLanguageInfo(language)?.nativeName }))
    
    closeDropdown()
    
    // 언어 변경 후 버튼에 포커스 복원
    nextTick(() => {
      const button = selectorRef.value?.querySelector('.language-button') as HTMLElement
      button?.focus()
    })
  } catch (error) {
    console.error('Failed to change language:', error)
    
    // 사용자에게 오류 피드백 제공
    showError(t('languageSelector.changeError'))
    
    // 스크린 리더에 오류 알림
    announceToScreenReader(t('languageSelector.changeError'))
    
    // 오류 발생 시에도 드롭다운 닫기
    closeDropdown()
    
    // 포커스를 버튼으로 복원
    nextTick(() => {
      const button = selectorRef.value?.querySelector('.language-button') as HTMLElement
      button?.focus()
    })
  } finally {
    isChangingLanguage.value = false
  }
}

const closeDropdown = (): void => {
  isOpen.value = false
  focusedIndex.value = 0
}

// Error handling
const showError = (message: string): void => {
  errorMessage.value = message
  hasError.value = true
  
  // 자동으로 5초 후 오류 메시지 제거
  if (errorTimeout.value) {
    clearTimeout(errorTimeout.value)
  }
  errorTimeout.value = window.setTimeout(() => {
    clearError()
  }, 5000)
}

const clearError = (): void => {
  errorMessage.value = ''
  hasError.value = false
  if (errorTimeout.value) {
    clearTimeout(errorTimeout.value)
    errorTimeout.value = null
  }
}

// 스크린 리더 알림
const announceToScreenReader = (message: string): void => {
  // 임시 요소를 만들어 스크린 리더에 알림
  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', 'assertive')
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message
  
  document.body.appendChild(announcement)
  
  // 짧은 지연 후 제거
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

// 언어 정보 헬퍼
const getLanguageInfo = (languageCode: Language) => {
  return availableLanguages.find(lang => lang.code === languageCode)
}

// Keyboard navigation
const handleButtonKeydown = (event: KeyboardEvent): void => {
  // 로딩 중이거나 언어 변경 중일 때는 키보드 입력 무시
  if (isChangingLanguage.value || isLoading.value) {
    return
  }

  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault()
      if (!isOpen.value) {
        toggleDropdown()
      }
      break
    case 'ArrowDown':
      event.preventDefault()
      if (!isOpen.value) {
        toggleDropdown()
      } else {
        // 드롭다운이 열려있으면 첫 번째 옵션으로 포커스 이동
        focusedIndex.value = 0
        nextTick(() => {
          const firstOption = selectorRef.value?.querySelector('.language-option') as HTMLElement
          firstOption?.focus()
        })
      }
      break
    case 'ArrowUp':
      event.preventDefault()
      if (!isOpen.value) {
        toggleDropdown()
      } else {
        // 드롭다운이 열려있으면 마지막 옵션으로 포커스 이동
        focusedIndex.value = availableLanguages.length - 1
        nextTick(() => {
          const lastOption = selectorRef.value?.querySelectorAll('.language-option')[focusedIndex.value] as HTMLElement
          lastOption?.focus()
        })
      }
      break
    case 'Escape':
      if (isOpen.value) {
        event.preventDefault()
        closeDropdown()
      } else if (hasError.value) {
        event.preventDefault()
        clearError()
      }
      break
    case 'Home':
      if (isOpen.value) {
        event.preventDefault()
        focusedIndex.value = 0
        nextTick(() => {
          const firstOption = selectorRef.value?.querySelector('.language-option') as HTMLElement
          firstOption?.focus()
        })
      }
      break
    case 'End':
      if (isOpen.value) {
        event.preventDefault()
        focusedIndex.value = availableLanguages.length - 1
        nextTick(() => {
          const lastOption = selectorRef.value?.querySelectorAll('.language-option')[focusedIndex.value] as HTMLElement
          lastOption?.focus()
        })
      }
      break
  }
}

const handleOptionKeydown = (event: KeyboardEvent, index: number): void => {
  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault()
      selectLanguage(availableLanguages[index].code)
      break
    case 'ArrowDown':
      event.preventDefault()
      focusedIndex.value = (index + 1) % availableLanguages.length
      nextTick(() => {
        const nextOption = selectorRef.value?.querySelectorAll('.language-option')[focusedIndex.value] as HTMLElement
        nextOption?.focus()
      })
      break
    case 'ArrowUp':
      event.preventDefault()
      focusedIndex.value = index === 0 ? availableLanguages.length - 1 : index - 1
      nextTick(() => {
        const prevOption = selectorRef.value?.querySelectorAll('.language-option')[focusedIndex.value] as HTMLElement
        prevOption?.focus()
      })
      break
    case 'Home':
      event.preventDefault()
      focusedIndex.value = 0
      nextTick(() => {
        const firstOption = selectorRef.value?.querySelector('.language-option') as HTMLElement
        firstOption?.focus()
      })
      break
    case 'End':
      event.preventDefault()
      focusedIndex.value = availableLanguages.length - 1
      nextTick(() => {
        const lastOption = selectorRef.value?.querySelectorAll('.language-option')[focusedIndex.value] as HTMLElement
        lastOption?.focus()
      })
      break
    case 'Escape':
      event.preventDefault()
      closeDropdown()
      // 버튼에 포커스 복원
      nextTick(() => {
        const button = selectorRef.value?.querySelector('.language-button') as HTMLElement
        button?.focus()
      })
      break
    case 'Tab':
      // Tab 키로 드롭다운 외부로 이동 시 닫기
      if (!event.shiftKey) {
        closeDropdown()
      }
      break
  }
}

// Click outside to close
const handleClickOutside = (event: Event): void => {
  if (selectorRef.value && !selectorRef.value.contains(event.target as Node)) {
    closeDropdown()
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  // 타이머 정리
  if (errorTimeout.value) {
    clearTimeout(errorTimeout.value)
  }
})
</script>

<style scoped>
.language-selector {
  position: relative;
  display: inline-block;
}

.language-button {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 7rem;
  height: 2.5rem;
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.75rem;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.language-button:hover,
.language-button--active {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.language-button:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
}

.button-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
}

.language-flag {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
  line-height: 1;
  flex-shrink: 0;
}

.language-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.125rem;
  flex: 1;
  min-width: 0;
}

.language-name {
  font-size: 0.75rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.language-native {
  font-size: 0.625rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1;
}

.dropdown-icon {
  color: rgba(255, 255, 255, 0.8);
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.dropdown-icon--rotated {
  transform: rotate(180deg);
}

.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-spinner svg {
  animation: spin 1s linear infinite;
  opacity: 0.8;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.language-button--loading {
  opacity: 0.7;
  cursor: not-allowed;
}

.language-button--loading:hover {
  transform: none;
  background: rgba(255, 255, 255, 0.1);
}

.language-button--error {
  border-color: rgba(239, 68, 68, 0.5);
  background: rgba(239, 68, 68, 0.1);
}

.language-button--error:hover {
  border-color: rgba(239, 68, 68, 0.7);
  background: rgba(239, 68, 68, 0.15);
}

.loading-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.125rem;
  flex: 1;
  min-width: 0;
}

.loading-message {
  font-size: 0.75rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.language-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  min-width: 12rem;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 0.75rem;
  box-shadow: 
    0 10px 25px rgba(0, 0, 0, 0.1),
    0 4px 10px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  overflow: hidden;
  z-index: 1000;
}

.language-option {
  width: 100%;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;
}

.language-option:hover,
.language-option--focused {
  background: rgba(0, 0, 0, 0.05);
}

.language-option--active {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.language-option--active:hover,
.language-option--active.language-option--focused {
  background: rgba(59, 130, 246, 0.15);
}

.language-option:focus {
  outline: none;
  background: rgba(0, 0, 0, 0.05);
}

.option-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.option-flag {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  line-height: 1;
  flex-shrink: 0;
}

.option-text {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  flex: 1;
}

.option-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1f2937;
  line-height: 1.2;
}

.option-native {
  font-size: 0.75rem;
  color: #6b7280;
  line-height: 1.2;
}

.language-option--active .option-name {
  color: #3b82f6;
  font-weight: 600;
}

.language-option--active .option-native {
  color: #60a5fa;
}

.option-check {
  color: #3b82f6;
  flex-shrink: 0;
}

/* Transitions */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-0.5rem) scale(0.95);
}

.dropdown-enter-to,
.dropdown-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .language-button {
    min-width: 5.5rem;
    height: 2.25rem;
    padding: 0.375rem 0.625rem;
  }
  
  .button-content {
    gap: 0.375rem;
  }
  
  .language-flag {
    font-size: 1rem;
  }
  
  .language-name {
    font-size: 0.6875rem;
  }
  
  .language-native {
    font-size: 0.5625rem;
  }
  
  .dropdown-icon {
    width: 14px;
    height: 14px;
  }
  
  .language-dropdown {
    min-width: 10rem;
    top: calc(100% + 0.375rem);
  }
  
  .language-option {
    padding: 0.625rem 0.875rem;
  }
  
  .option-content {
    gap: 0.625rem;
  }
  
  .option-flag {
    font-size: 1.125rem;
  }
  
  .option-name {
    font-size: 0.8125rem;
  }
  
  .option-native {
    font-size: 0.6875rem;
  }
}

/* 태블릿 */
@media (max-width: 1024px) and (min-width: 769px) {
  .language-button {
    min-width: 6.5rem;
  }
  
  .language-name {
    font-size: 0.6875rem;
  }
  
  .language-native {
    font-size: 0.5625rem;
  }
}

/* 다크 모드 대응 */
@media (prefers-color-scheme: dark) {
  .language-dropdown {
    background: #1f2937;
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  .language-option:hover,
  .language-option--focused {
    background: rgba(255, 255, 255, 0.05);
  }
  
  .option-name {
    color: #f9fafb;
  }
  
  .option-native {
    color: #9ca3af;
  }
}

/* 오류 알림 */
.error-notification {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  right: 0;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  padding: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1001;
}

.error-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.error-text {
  font-size: 0.875rem;
  color: #dc2626;
  flex: 1;
}

.error-close {
  background: none;
  border: none;
  color: #dc2626;
  font-size: 1.25rem;
  font-weight: bold;
  cursor: pointer;
  padding: 0;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.25rem;
  transition: background-color 0.15s ease;
}

.error-close:hover {
  background: rgba(220, 38, 38, 0.1);
}

.error-close:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.3);
}

/* 오류 알림 애니메이션 */
.error-notification-enter-active,
.error-notification-leave-active {
  transition: all 0.3s ease;
}

.error-notification-enter-from,
.error-notification-leave-to {
  opacity: 0;
  transform: translateY(-0.5rem);
}

.error-notification-enter-to,
.error-notification-leave-from {
  opacity: 1;
  transform: translateY(0);
}

/* 스크린 리더 전용 클래스 */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* 접근성 개선 */
@media (prefers-reduced-motion: reduce) {
  .language-button,
  .language-option,
  .dropdown-icon,
  .loading-spinner svg {
    transition: none;
    animation: none;
  }
  
  .dropdown-enter-active,
  .dropdown-leave-active,
  .error-notification-enter-active,
  .error-notification-leave-active {
    transition: none;
  }
}

/* 고대비 모드 지원 */
@media (prefers-contrast: high) {
  .language-button {
    border-width: 2px;
  }
  
  .language-button--error {
    border-color: #dc2626;
    background: rgba(239, 68, 68, 0.2);
  }
  
  .error-notification {
    border-width: 2px;
    border-color: #dc2626;
  }
}
</style>