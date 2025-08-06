<template>
  <div class="language-selector" ref="selectorRef">
    <button 
      class="language-button"
      @click="toggleDropdown"
      @keydown="handleButtonKeydown"
      :aria-expanded="isOpen"
      :aria-haspopup="true"
      aria-label="언어 선택"
      :title="`현재 언어: ${currentLanguageInfo?.nativeName || 'Unknown'}`"
      :class="{ 
        'language-button--active': isOpen,
        'language-button--loading': isChangingLanguage || isLoading
      }"
      :disabled="isChangingLanguage || isLoading"
    >
      <div class="button-content">
        <span class="language-flag">{{ currentLanguageInfo?.flag || '🌐' }}</span>
        <span class="language-code">{{ currentLanguage.toUpperCase() }}</span>
        <div v-if="isChangingLanguage || isLoading" class="loading-spinner">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12a9 9 0 11-6.219-8.56"/>
          </svg>
        </div>
        <ChevronDownIcon 
          v-else
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
        :aria-label="t('accessibility.languageSelector')"
      >
        <button 
          v-for="(lang, index) in availableLanguages" 
          :key="lang.code"
          class="language-option"
          :class="{ 
            'language-option--active': lang.code === currentLanguage,
            'language-option--focused': focusedIndex === index
          }"
          @click="selectLanguage(lang.code)"
          @keydown="handleOptionKeydown($event, index)"
          @mouseenter="focusedIndex = index"
          role="option"
          :aria-selected="lang.code === currentLanguage"
          :tabindex="focusedIndex === index ? 0 : -1"
        >
          <div class="option-content">
            <span class="option-flag">{{ lang.flag }}</span>
            <div class="option-text">
              <span class="option-name">{{ lang.name }}</span>
              <span class="option-native">{{ lang.nativeName }}</span>
            </div>
            <CheckIcon 
              v-if="lang.code === currentLanguage"
              :size="16" 
              class="option-check"
            />
          </div>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { ChevronDownIcon, CheckIcon } from 'lucide-vue-next'
import { useI18n } from '../../composables/useI18n'
import type { Language } from '../../types/i18n'

// Composables
const { t, currentLanguage, changeLanguage, availableLanguages, getCurrentLanguageInfo, isLoading } = useI18n()

// Refs
const selectorRef = ref<HTMLElement>()
const isOpen = ref(false)
const focusedIndex = ref(0)
const isChangingLanguage = ref(false)

// Computed
const currentLanguageInfo = computed(() => getCurrentLanguageInfo.value)

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
    isChangingLanguage.value = true
    await changeLanguage(language)
    closeDropdown()
    
    // 언어 변경 후 버튼에 포커스 복원
    nextTick(() => {
      const button = selectorRef.value?.querySelector('.language-button') as HTMLElement
      button?.focus()
    })
  } catch (error) {
    console.error('Failed to change language:', error)
    // 오류 발생 시에도 드롭다운 닫기
    closeDropdown()
  } finally {
    isChangingLanguage.value = false
  }
}

const closeDropdown = (): void => {
  isOpen.value = false
  focusedIndex.value = 0
}

// Keyboard navigation
const handleButtonKeydown = (event: KeyboardEvent): void => {
  switch (event.key) {
    case 'Enter':
    case ' ':
    case 'ArrowDown':
      event.preventDefault()
      toggleDropdown()
      break
    case 'ArrowUp':
      event.preventDefault()
      if (!isOpen.value) {
        toggleDropdown()
      }
      break
    case 'Escape':
      if (isOpen.value) {
        event.preventDefault()
        closeDropdown()
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
      closeDropdown()
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
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  min-width: 4rem;
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
  gap: 0.5rem;
}

.language-flag {
  font-size: 1rem;
  line-height: 1;
}

.language-code {
  font-weight: 600;
  letter-spacing: 0.025em;
}

.dropdown-icon {
  transition: transform 0.2s ease;
  opacity: 0.8;
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
    padding: 0.375rem 0.625rem;
    font-size: 0.8125rem;
    min-width: 3.5rem;
  }
  
  .button-content {
    gap: 0.375rem;
  }
  
  .language-flag {
    font-size: 0.875rem;
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

/* 접근성 개선 */
@media (prefers-reduced-motion: reduce) {
  .language-button,
  .language-option,
  .dropdown-icon {
    transition: none;
  }
  
  .dropdown-enter-active,
  .dropdown-leave-active {
    transition: none;
  }
}
</style>