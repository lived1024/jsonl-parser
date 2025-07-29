<template>
  <div class="keyboard-shortcuts">
    <button 
      class="shortcuts-toggle"
      @click="isVisible = !isVisible"
      :aria-expanded="isVisible"
      aria-label="키보드 단축키 도움말"
      title="키보드 단축키 (Alt+H)"
      :class="{ 'shortcuts-toggle--active': isVisible }"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    </button>
    
    <Transition name="shortcuts-panel" appear>
      <div v-if="isVisible" class="shortcuts-panel">
        <div class="shortcuts-header">
          <div class="header-content">
            <div class="header-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 12l2 2 4-4"/>
                <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
                <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
                <path d="M12 3c0 1-1 3-3 3s-3-2-3-3 1-3 3-3 3 2 3 3"/>
                <path d="M12 21c0-1-1-3-3-3s-3 2-3 3 1 3 3 3 3-2 3-3"/>
              </svg>
            </div>
            <div class="header-text">
              <h3>Keyboard Shortcuts</h3>
              <p>Speed up your workflow</p>
            </div>
          </div>
          <button 
            class="close-button"
            @click="isVisible = false"
            aria-label="닫기"
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
            </div>
            <h4>Global</h4>
          </div>
          <div class="shortcut-item">
            <div class="shortcut-keys">
              <kbd>Alt</kbd> + <kbd>I</kbd>
            </div>
            <span class="shortcut-description">Focus input area</span>
          </div>
          <div class="shortcut-item">
            <div class="shortcut-keys">
              <kbd>Alt</kbd> + <kbd>Enter</kbd>
            </div>
            <span class="shortcut-description">Parse JSON</span>
          </div>
          <div class="shortcut-item">
            <div class="shortcut-keys">
              <kbd>Esc</kbd>
            </div>
            <span class="shortcut-description">Clear focus</span>
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
            <h4>Text Editor</h4>
          </div>
          <div class="shortcut-item">
            <div class="shortcut-keys">
              <kbd>Tab</kbd>
            </div>
            <span class="shortcut-description">Add indentation</span>
          </div>
          <div class="shortcut-item">
            <div class="shortcut-keys">
              <kbd>Shift</kbd> + <kbd>Tab</kbd>
            </div>
            <span class="shortcut-description">Remove indentation</span>
          </div>
          <div class="shortcut-item">
            <div class="shortcut-keys">
              <kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>F</kbd>
            </div>
            <span class="shortcut-description">Format JSON</span>
          </div>
        </div>
        
        <div class="shortcut-section">
          <div class="section-header">
            <div class="section-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
            </div>
            <h4>Tree Navigation</h4>
          </div>
          <div class="shortcut-item">
            <div class="shortcut-keys">
              <kbd>Enter</kbd> <span class="key-separator">or</span> <kbd>Space</kbd>
            </div>
            <span class="shortcut-description">Toggle node</span>
          </div>
          <div class="shortcut-item">
            <div class="shortcut-keys">
              <kbd>→</kbd>
            </div>
            <span class="shortcut-description">Expand node</span>
          </div>
          <div class="shortcut-item">
            <div class="shortcut-keys">
              <kbd>←</kbd>
            </div>
            <span class="shortcut-description">Collapse node</span>
          </div>
        </div>
        
        <div class="shortcut-section">
          <div class="section-header">
            <div class="section-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6,9 12,15 18,9"/>
              </svg>
            </div>
            <h4>Tree Control</h4>
          </div>
          <div class="shortcut-item">
            <div class="shortcut-keys">
              <kbd>Alt</kbd> + <kbd>E</kbd>
            </div>
            <span class="shortcut-description">Expand all nodes</span>
          </div>
          <div class="shortcut-item">
            <div class="shortcut-keys">
              <kbd>Alt</kbd> + <kbd>W</kbd>
            </div>
            <span class="shortcut-description">Collapse all nodes</span>
          </div>
          <div class="shortcut-item">
            <div class="shortcut-keys">
              <kbd>Alt</kbd> + <kbd>1-9</kbd>
            </div>
            <span class="shortcut-description">Expand to level</span>
          </div>
        </div>
      </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import useKeyboardShortcuts from './KeyboardShortcuts'

const { isVisible } = useKeyboardShortcuts()
</script>

<style scoped src="./KeyboardShortcuts.css"></style>