<template>
  <div class="keyboard-shortcuts">
    <button 
      class="shortcuts-toggle"
      @click="isVisible = !isVisible"
      :aria-expanded="isVisible"
      :aria-label="t('accessibility.keyboardHelp')"
      :title="t('accessibility.keyboardHelp')"
      :class="{ 'shortcuts-toggle--active': isVisible }"
    >
      <KeyboardIcon :size="20" />
    </button>
    
    <Transition name="shortcuts-panel" appear>
      <div v-if="isVisible" class="shortcuts-panel">
        <div class="shortcuts-header">
          <div class="header-content">
            <div class="header-icon">
              <SparklesIcon :size="20" />
            </div>
            <div class="header-text">
              <h3>{{ t('shortcuts.title') }}</h3>
              <p>{{ t('shortcuts.subtitle') }}</p>
            </div>
          </div>
          <button 
            class="close-button"
            @click="isVisible = false"
            :aria-label="t('shortcuts.close')"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      
      <div class="shortcuts-content">
        <div class="shortcut-section">
          <div class="section-header">
            <div class="section-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M10 8h4"/>
        <path d="M8 12h8"/>
        <path d="M9 16h6"/>
        <rect x="3" y="4" width="18" height="16" rx="2"/>
      </svg>
            </div>
            <h4>{{ t('shortcuts.sections.global') }}</h4>
          </div>
          <div class="shortcut-item">
            <div class="shortcut-keys">
              <kbd>Alt</kbd> + <kbd>I</kbd>
            </div>
            <span class="shortcut-description">{{ t('shortcuts.global.focusInput') }}</span>
          </div>
          <div class="shortcut-item">
            <div class="shortcut-keys">
              <kbd>Alt</kbd> + <kbd>Enter</kbd>
            </div>
            <span class="shortcut-description">{{ t('shortcuts.global.parseJson') }}</span>
          </div>
          <div class="shortcut-item">
            <div class="shortcut-keys">
              <kbd>Esc</kbd>
            </div>
            <span class="shortcut-description">{{ t('shortcuts.global.clearFocus') }}</span>
          </div>
        </div>
        
        <div class="shortcut-section">
          <div class="section-header">
            <div class="section-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
            </div>
            <h4>{{ t('shortcuts.sections.editor') }}</h4>
          </div>
          <div class="shortcut-item">
            <div class="shortcut-keys">
              <kbd>Tab</kbd>
            </div>
            <span class="shortcut-description">{{ t('shortcuts.editor.addIndent') }}</span>
          </div>
          <div class="shortcut-item">
            <div class="shortcut-keys">
              <kbd>Shift</kbd> + <kbd>Tab</kbd>
            </div>
            <span class="shortcut-description">{{ t('shortcuts.editor.removeIndent') }}</span>
          </div>
          <div class="shortcut-item">
            <div class="shortcut-keys">
              <kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>F</kbd>
            </div>
            <span class="shortcut-description">{{ t('shortcuts.editor.formatJson') }}</span>
          </div>
        </div>
        
        <div class="shortcut-section">
          <div class="section-header">
            <div class="section-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
            </div>
            <h4>{{ t('shortcuts.sections.navigation') }}</h4>
          </div>
          <div class="shortcut-item">
            <div class="shortcut-keys">
              <kbd>Enter</kbd> <span class="key-separator">or</span> <kbd>Space</kbd>
            </div>
            <span class="shortcut-description">{{ t('shortcuts.navigation.toggleNode') }}</span>
          </div>
          <div class="shortcut-item">
            <div class="shortcut-keys">
              <kbd>→</kbd>
            </div>
            <span class="shortcut-description">{{ t('shortcuts.navigation.expandNode') }}</span>
          </div>
          <div class="shortcut-item">
            <div class="shortcut-keys">
              <kbd>←</kbd>
            </div>
            <span class="shortcut-description">{{ t('shortcuts.navigation.collapseNode') }}</span>
          </div>
        </div>
        
        <div class="shortcut-section">
          <div class="section-header">
            <div class="section-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6,9 12,15 18,9"/>
              </svg>
            </div>
            <h4>{{ t('shortcuts.sections.control') }}</h4>
          </div>
          <div class="shortcut-item">
            <div class="shortcut-keys">
              <kbd>Alt</kbd> + <kbd>E</kbd>
            </div>
            <span class="shortcut-description">{{ t('shortcuts.control.expandAll') }}</span>
          </div>
          <div class="shortcut-item">
            <div class="shortcut-keys">
              <kbd>Alt</kbd> + <kbd>W</kbd>
            </div>
            <span class="shortcut-description">{{ t('shortcuts.control.collapseAll') }}</span>
          </div>
          <div class="shortcut-item">
            <div class="shortcut-keys">
              <kbd>Alt</kbd> + <kbd>1-9</kbd>
            </div>
            <span class="shortcut-description">{{ t('shortcuts.control.expandToLevel') }}</span>
          </div>
        </div>
      </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import useKeyboardShortcuts from './KeyboardShortcuts'
import { useI18n } from '../../composables/useI18n'
import { KeyboardIcon, SparklesIcon } from 'lucide-vue-next'

const { isVisible } = useKeyboardShortcuts()
const { t } = useI18n()
</script>

<style scoped src="./KeyboardShortcuts.css"></style>