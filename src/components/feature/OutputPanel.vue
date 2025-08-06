<template>
  <div class="output-panel" role="region" aria-labelledby="output-panel-title">
    <div class="panel-header">
      <div class="header-title">
        <div class="title-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 12h3"/>
            <path d="M6 8v8"/>
            <path d="M6 8h6"/>
            <path d="M6 16h6"/>
            <path d="M12 8v8"/>
            <path d="M12 8h6"/>
            <path d="M12 12h6"/>
            <path d="M12 16h6"/>
            <circle cx="3" cy="12" r="1"/>
            <circle cx="6" cy="8" r="1"/>
            <circle cx="6" cy="16" r="1"/>
            <circle cx="12" cy="8" r="1"/>
            <circle cx="12" cy="12" r="1"/>
            <circle cx="12" cy="16" r="1"/>
            <circle cx="18" cy="8" r="1"/>
            <circle cx="18" cy="12" r="1"/>
            <circle cx="18" cy="16" r="1"/>
          </svg>
        </div>
        <div class="title-content">
          <h2 id="output-panel-title" class="panel-title">{{ t('output.title') }}</h2>
          <p class="title-description">{{ t('output.description') }}</p>
        </div>
      </div>
      
      <div v-if="store.hasData" class="panel-stats" role="status" aria-live="polite">
        <div class="stat-card">
          <NodesIcon :size="16" />
          <div class="stat-content">
            <span class="stat-value">{{ nodeCount }}</span>
            <span class="stat-label">{{ t('output.stats.nodes') }}</span>
          </div>
        </div>
        <div v-if="maxDepth > 0" class="stat-card">
          <LayersIcon :size="16" />
          <div class="stat-content">
            <span class="stat-value">{{ maxDepth }}</span>
            <span class="stat-label">{{ t('output.stats.levels') }}</span>
          </div>
        </div>
        <div v-if="store.inputType === 'jsonl'" class="stat-card">
          <FileTextIcon :size="16" />
          <div class="stat-content">
            <span class="stat-value">{{ store.parsedData.length }}</span>
            <span class="stat-label">{{ t('output.stats.lines') }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="panel-content">
      <!-- 트리 컨트롤 -->
      <div v-if="store.hasData" class="tree-controls">
        <div class="control-group">
          <button 
            type="button"
            class="control-button"
            @click="expandAll"
            :title="t('accessibility.expandAllNodes')"
            :aria-label="t('accessibility.expandAllNodes')"
          >
            <ExpandAllIcon :size="16" />
            <span class="control-label">{{ t('output.controls.expandAll') }}</span>
          </button>
          
          <button 
            type="button"
            class="control-button"
            @click="collapseAll"
            :title="t('accessibility.collapseAllNodes')"
            :aria-label="t('accessibility.collapseAllNodes')"
          >
            <CollapseAllIcon :size="16" />
            <span class="control-label">{{ t('output.controls.collapseAll') }}</span>
          </button>
        </div>
        
        <div class="control-group">
          <button 
            type="button"
            class="control-button toggle-button"
            :class="{ 'toggle-button--active': store.preserveLineBreaks }"
            @click="handleLineBreakToggle"
            :title="t('accessibility.toggleLineBreaks')"
            :aria-label="t('accessibility.toggleLineBreaks')"
          >
            <WrapTextIcon :size="16" />
            <span class="control-label">{{ t('output.controls.preserveBreaks') }}</span>
          </button>
        </div>
        
        <div class="control-group level-controls" :class="{ 'level-controls--scrollable': needsScroll }"  style="overflow: auto;">
          <span class="control-label-small">{{ t('output.controls.byLevel') }}</span>
          <div class="level-buttons-container level-buttons--scrollable" :class="{ 'level-buttons--scrollable': needsScroll }">
            <button 
              v-for="level in levelButtons"
              :key="level"
              type="button"
              class="level-button"
              @click="expandToLevel(level)"
              :title="t('accessibility.expandToLevel', { level })"
              :aria-label="t('accessibility.expandToLevel', { level })"
            >
              {{ level }}
            </button>
          </div>
        </div>
      </div>
      
      <!-- 빈 상태 -->
      <FadeTransition>
        <div v-if="!store.hasData && !store.hasError" class="empty-state">
          <div class="empty-illustration">
            <div class="empty-icon">
              <TreePineIcon :size="64" :stroke-width="1" />
            </div>
            <div class="empty-sparkles">
              <SparklesIcon :size="24" class="sparkle sparkle-1" />
              <SparklesIcon :size="20" class="sparkle sparkle-2" />
              <SparklesIcon :size="16" class="sparkle sparkle-3" />
            </div>
          </div>
          <div class="empty-content">
            <h3 class="empty-title">{{ t('output.empty.title') }}</h3>
            <p class="empty-description">
              {{ t('output.empty.description') }}
            </p>
            <div class="empty-tips">
              <div class="tip-item">
                <KeyboardIcon :size="16" />
                <span>{{ t('output.empty.tips.focus', { key: 'Ctrl+K' }) }}</span>
              </div>
              <div class="tip-item">
                <ZapIcon :size="16" />
                <span>{{ t('output.empty.tips.parse', { key: 'Ctrl+Enter' }) }}</span>
              </div>
            </div>
          </div>
        </div>
      </FadeTransition>
      
      <!-- 오류 상태 -->
      <FadeTransition>
        <div v-if="store.hasError && !store.hasData" class="error-state">
          <div class="error-illustration">
            <div class="error-icon">
              <AlertTriangleIcon :size="64" :stroke-width="1" />
            </div>
          </div>
          <div class="error-content">
            <h3 class="error-title">{{ t('output.error.title') }}</h3>
            <div class="error-details">
              <div class="error-message-box">
                <div class="error-message-header">
                  <AlertTriangleIcon :size="16" />
                  <span>{{ t('output.error.detailsHeader') }}</span>
                </div>
                <div class="error-message-content">
                  <!-- JSONL 감지된 경우: JSONL 메시지로 대체 -->
                  <div v-if="store.parseError?.isJsonlDetected" class="jsonl-detection-message">
                    <div class="jsonl-warning-text">
                      <AlertTriangleIcon :size="16" />
                      <span><strong>{{ t('output.error.jsonlDetected.title') }}</strong> - {{ t('output.error.jsonlDetected.description') }}</span>
                    </div>
                  </div>
                  
                  <!-- JSONL이 감지되지 않은 경우: 기존 오류 메시지 -->
                  <div v-else>
                    <p class="error-message">{{ store.parseError?.message || 'Invalid JSON syntax' }}</p>
                    <div v-if="errorLocation" class="error-location">
                      <div v-if="store.parseError?.line" class="location-item">
                        <FileTextIcon :size="14" />
                        <span>{{ t('output.error.location.line', { line: store.parseError.line }) }}</span>
                      </div>
                      <div v-if="store.parseError?.column" class="location-item">
                        <ZapIcon :size="14" />
                        <span>{{ t('output.error.location.column', { column: store.parseError.column }) }}</span>
                      </div>
                      <div v-if="store.parseError?.position" class="location-item">
                        <KeyboardIcon :size="14" />
                        <span>{{ t('output.error.location.position', { position: store.parseError.position }) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- JSONL이 감지되지 않은 경우에만 오류 해결 제안사항 표시 -->
              <div v-if="!store.parseError?.isJsonlDetected" class="error-suggestions">
                <h4 class="suggestions-title">{{ t('output.error.suggestions.title') }}</h4>
                <ul class="suggestions-list">
                  <li v-for="(suggestion, index) in errorSuggestions" :key="index">
                    {{ suggestion }}
                  </li>
                </ul>
              </div>
            </div>
            
            <div class="error-actions">
              <!-- JSONL 감지된 경우: JSONL 변경 버튼 표시 -->
              <button 
                v-if="store.parseError?.isJsonlDetected"
                type="button" 
                class="jsonl-switch-button"
                @click="handleSwitchToJsonl"
                :aria-label="t('output.error.jsonlDetected.switchButton')"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M8 6h13"/>
                  <path d="M8 12h13"/>
                  <path d="M8 18h13"/>
                  <path d="M3 6h.01"/>
                  <path d="M3 12h.01"/>
                  <path d="M3 18h.01"/>
                </svg>
                {{ t('output.error.jsonlDetected.switchButton') }}
              </button>
              
              <button 
                type="button" 
                class="clear-button"
                @click="clearInput"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6h18"/>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                </svg>
                {{ t('output.error.actions.clear') }}
              </button>
            </div>
          </div>
        </div>
      </FadeTransition>
      
      <!-- 부분적 성공 상태 (JSONL에서 일부 오류) -->
      <FadeTransition>
        <div v-if="store.hasData && store.hasError" class="partial-error-banner">
          <div class="banner-icon">
            <AlertTriangleIcon :size="20" />
          </div>
          <div class="banner-content">
            <div class="banner-title">{{ t('output.error.partial.title') }}</div>
            <div class="banner-message">{{ store.parseError?.message }}</div>
          </div>
          <button class="banner-close" @click="dismissPartialError">
            <XIcon :size="16" />
          </button>
        </div>
      </FadeTransition>
      
      <!-- 트리 뷰 -->
      <FadeTransition>
        <div v-if="store.hasData" class="tree-container">
          <div 
            class="tree-scroll"
            role="tree"
            :aria-label="t('accessibility.treeStructure')"
            tabindex="0"
          >
            <SlideTransition direction="up" :appear="true">
              <div class="tree-content">
                <ModernTreeNode 
                  v-for="node in store.parsedData" 
                  :key="node.id"
                  :node="node"
                />
              </div>
            </SlideTransition>
          </div>
        </div>
      </FadeTransition>
    </div>
  </div>
</template>

<script setup lang="ts">
import useOutputPanel from './OutputPanel'
import { useI18n } from '../../composables/useI18n'
import { useI18nStore } from '../../stores/i18nStore'
import { computed } from 'vue'

const {
  TreePineIcon,
  SparklesIcon,
  AlertTriangleIcon,
  KeyboardIcon,
  ZapIcon,
  LayersIcon,
  FileTextIcon,
  NodesIcon,
  XIcon,
  ExpandAllIcon,
  CollapseAllIcon,
  WrapTextIcon,
  ModernTreeNode,
  FadeTransition,
  SlideTransition,
  store,
  nodeCount,
  maxDepth,
  errorLocation,
  levelButtons,
  needsScroll,
  clearInput,
  dismissPartialError,
  expandAll,
  collapseAll,
  expandToLevel,
  handleLineBreakToggle,
  handleSwitchToJsonl
} = useOutputPanel()

const { t } = useI18n()
const i18nStore = useI18nStore()

// 오류 제안사항을 위한 computed property
const errorSuggestions = computed(() => {
  // 현재 언어에 따라 적절한 제안사항 반환
  const currentLang = i18nStore.currentLanguage
  
  if (currentLang === 'ko') {
    return [
      '누락되거나 추가된 쉼표 확인',
      '모든 문자열이 올바르게 인용되었는지 확인', 
      '대괄호와 중괄호 일치 확인',
      '객체/배열의 후행 쉼표 제거'
    ]
  } else {
    return [
      'Check for missing or extra commas',
      'Ensure all strings are properly quoted',
      'Verify bracket and brace matching',
      'Remove trailing commas in objects/arrays'
    ]
  }
})
</script>

<style scoped src="./OutputPanel.css"></style>