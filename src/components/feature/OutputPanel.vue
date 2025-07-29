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
          <h2 id="output-panel-title" class="panel-title">JSON Tree</h2>
          <p class="title-description">Interactive tree visualization</p>
        </div>
      </div>
      
      <div v-if="store.hasData" class="panel-stats" role="status" aria-live="polite">
        <div class="stat-card">
          <NodesIcon :size="16" />
          <div class="stat-content">
            <span class="stat-value">{{ nodeCount }}</span>
            <span class="stat-label">nodes</span>
          </div>
        </div>
        <div v-if="maxDepth > 0" class="stat-card">
          <LayersIcon :size="16" />
          <div class="stat-content">
            <span class="stat-value">{{ maxDepth }}</span>
            <span class="stat-label">levels</span>
          </div>
        </div>
        <div v-if="store.inputType === 'jsonl'" class="stat-card">
          <FileTextIcon :size="16" />
          <div class="stat-content">
            <span class="stat-value">{{ store.parsedData.length }}</span>
            <span class="stat-label">lines</span>
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
            title="Expand all nodes"
            aria-label="Expand all nodes"
          >
            <ExpandAllIcon :size="16" />
            <span class="control-label">Expand All</span>
          </button>
          
          <button 
            type="button"
            class="control-button"
            @click="collapseAll"
            title="Collapse all nodes"
            aria-label="Collapse all nodes"
          >
            <CollapseAllIcon :size="16" />
            <span class="control-label">Collapse All</span>
          </button>
        </div>
        
        <div class="control-group level-controls" :class="{ 'level-controls--scrollable': needsScroll }"  style="overflow: auto;">
          <span class="control-label-small">By Level:</span>
          <div class="level-buttons-container level-buttons--scrollable" :class="{ 'level-buttons--scrollable': needsScroll }">
            <button 
              v-for="level in levelButtons"
              :key="level"
              type="button"
              class="level-button"
              @click="expandToLevel(level)"
              :title="`Expand to level ${level}`"
              :aria-label="`Expand to level ${level}`"
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
            <h3 class="empty-title">Ready to visualize your JSON</h3>
            <p class="empty-description">
              Enter JSON or JSONL data in the input panel to see a beautiful tree structure here
            </p>
            <div class="empty-tips">
              <div class="tip-item">
                <KeyboardIcon :size="16" />
                <span>Use <kbd>Ctrl+K</kbd> to focus input</span>
              </div>
              <div class="tip-item">
                <ZapIcon :size="16" />
                <span>Use <kbd>Ctrl+Enter</kbd> to parse</span>
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
            <h3 class="error-title">JSON Parsing Error</h3>
            <div class="error-details">
              <div class="error-message-box">
                <div class="error-message-header">
                  <AlertTriangleIcon :size="16" />
                  <span>Error Details</span>
                </div>
                <div class="error-message-content">
                  <p class="error-message">{{ store.parseError?.message || 'Invalid JSON syntax' }}</p>
                  <div v-if="errorLocation" class="error-location">
                    <div v-if="store.parseError?.line" class="location-item">
                      <FileTextIcon :size="14" />
                      <span>Line {{ store.parseError.line }}</span>
                    </div>
                    <div v-if="store.parseError?.column" class="location-item">
                      <ZapIcon :size="14" />
                      <span>Column {{ store.parseError.column }}</span>
                    </div>
                    <div v-if="store.parseError?.position" class="location-item">
                      <KeyboardIcon :size="14" />
                      <span>Position {{ store.parseError.position }}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="error-suggestions">
                <h4 class="suggestions-title">Common Solutions:</h4>
                <ul class="suggestions-list">
                  <li>Check for missing or extra commas</li>
                  <li>Ensure all strings are properly quoted</li>
                  <li>Verify bracket and brace matching</li>
                  <li>Remove trailing commas in objects/arrays</li>
                </ul>
              </div>
            </div>
            
            <div class="error-actions">
              <button 
                type="button" 
                class="retry-button"
                @click="retryParsing"
              >
                <RefreshCwIcon :size="16" />
                Try Again
              </button>
              <button 
                type="button" 
                class="clear-button"
                @click="clearInput"
              >
                <TrashIcon :size="16" />
                Clear Input
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
            <div class="banner-title">Partial Parsing Success</div>
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
            aria-label="JSON tree structure"
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

const {
  TreePineIcon,
  SparklesIcon,
  AlertTriangleIcon,
  RefreshCwIcon,
  KeyboardIcon,
  ZapIcon,
  LayersIcon,
  FileTextIcon,
  NodesIcon,
  TrashIcon,
  XIcon,
  ExpandAllIcon,
  CollapseAllIcon,
  ModernTreeNode,
  TypeIcon,
  FadeTransition,
  SlideTransition,
  store,
  nodeCount,
  maxDepth,
  errorLocation,
  levelButtons,
  needsScroll,
  retryParsing,
  clearInput,
  dismissPartialError,
  expandAll,
  collapseAll,
  expandToLevel
} = useOutputPanel()
</script>

<style scoped src="./OutputPanel.css"></style>