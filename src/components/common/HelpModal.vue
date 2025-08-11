<template>
  <Teleport to="body">
    <div 
      v-if="isOpen" 
      class="help-modal-overlay"
      @click="closeModal"
      role="dialog"
      aria-modal="true"
      :aria-label="t('help.title')"
    >
      <div 
        class="help-modal"
        @click.stop
        tabindex="-1"
        ref="modalRef"
      >
        <div class="help-modal-header">
          <div class="help-modal-title">
            <HelpIcon />
            <h2>{{ t('help.title') }}</h2>
          </div>
          <button 
            class="help-modal-close"
            @click="closeModal"
            :aria-label="t('help.close')"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        
        <div class="help-modal-content">
          <div class="help-tabs">
            <button
              v-for="tab in helpTabs"
              :key="tab.id"
              class="help-tab"
              :class="{ active: activeTab === tab.id }"
              @click="activeTab = tab.id"
            >
              <span class="tab-icon">{{ tab.icon }}</span>
              <span>{{ tab.title }}</span>
            </button>
          </div>

          <div class="help-tab-content">
            <!-- 기본 도움말 -->
            <div v-if="activeTab === 'overview'" class="tab-panel">
              <section class="help-section">
                <h3>{{ t('help.whatIs.title') }}</h3>
                <p>{{ t('help.whatIs.description') }}</p>
              </section>
              
              <section class="help-section">
                <h3>{{ t('help.howToUse.title') }}</h3>
                <ol class="help-list">
                  <li>{{ t('help.howToUse.step1') }}</li>
                  <li>{{ t('help.howToUse.step2') }}</li>
                  <li>{{ t('help.howToUse.step3') }}</li>
                  <li>{{ t('help.howToUse.step4') }}</li>
                </ol>
              </section>
              
              <section class="help-section">
                <h3>{{ t('help.features.title') }}</h3>
                <div class="feature-grid">
                  <div class="feature-item">
                    <div class="feature-icon">📄</div>
                    <div class="feature-text">
                      <strong>{{ t('help.features.multiFormat.title') }}</strong>
                      <p>{{ t('help.features.multiFormat.description') }}</p>
                    </div>
                  </div>
                  <div class="feature-item">
                    <div class="feature-icon">🌳</div>
                    <div class="feature-text">
                      <strong>{{ t('help.features.treeView.title') }}</strong>
                      <p>{{ t('help.features.treeView.description') }}</p>
                    </div>
                  </div>
                  <div class="feature-item">
                    <div class="feature-icon">⚡</div>
                    <div class="feature-text">
                      <strong>{{ t('help.features.realtime.title') }}</strong>
                      <p>{{ t('help.features.realtime.description') }}</p>
                    </div>
                  </div>
                  <div class="feature-item">
                    <div class="feature-icon">📱</div>
                    <div class="feature-text">
                      <strong>{{ t('help.features.responsive.title') }}</strong>
                      <p>{{ t('help.features.responsive.description') }}</p>
                    </div>
                  </div>
                  <div class="feature-item">
                    <div class="feature-icon">📋</div>
                    <div class="feature-text">
                      <strong>{{ t('help.features.lineBreaks.title') }}</strong>
                      <p>{{ t('help.features.lineBreaks.description') }}</p>
                    </div>
                  </div>
                  <div class="feature-item">
                    <div class="feature-icon">🔍</div>
                    <div class="feature-text">
                      <strong>{{ t('help.features.expandLevels.title') }}</strong>
                      <p>{{ t('help.features.expandLevels.description') }}</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>



            <!-- 예제 -->
            <div v-if="activeTab === 'examples'" class="tab-panel">
              <section class="help-section">
                <h3>{{ t('help.examples.title') }}</h3>
                <div class="example-tabs">
                  <button 
                    v-for="(example, key) in examples"
                    :key="key"
                    class="example-tab"
                    :class="{ active: activeExample === key }"
                    @click="activeExample = key"
                  >
                    {{ example.title }}
                  </button>
                </div>
                <div class="example-content">
                  <pre><code>{{ examples[activeExample].content }}</code></pre>
                  <button 
                    class="example-try-button"
                    @click="tryExample(examples[activeExample])"
                  >
                    {{ t('help.examples.tryIt') }}
                  </button>
                </div>
              </section>
            </div>

            <!-- 데이터 타입 가이드 -->
            <div v-if="activeTab === 'datatypes'" class="tab-panel">
              <DataTypeGuide />
            </div>

            <!-- FAQ -->
            <div v-if="activeTab === 'faq'" class="tab-panel">
              <FAQSection />
            </div>



            <!-- 문제 해결 -->
            <div v-if="activeTab === 'troubleshooting'" class="tab-panel">
              <TroubleshootingGuide />
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useI18n } from '../../composables/useI18n'
import { useJsonTreeStore } from '../../stores'
import { InputType } from '../../types'
import HelpIcon from '../icons/HelpIcon.vue'
import DataTypeGuide from './DataTypeGuide.vue'
import FAQSection from './FAQSection.vue'

import TroubleshootingGuide from './TroubleshootingGuide.vue'

interface Props {
  isOpen: boolean
}

interface Emits {
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()
const store = useJsonTreeStore()

const modalRef = ref<HTMLElement>()
const activeTab = ref('overview')
const activeExample = ref('json')

interface HelpTab {
  id: string
  title: string
  icon: string
}

const helpTabs = computed<HelpTab[]>(() => [
  { id: 'overview', title: t('help.tabs.overview'), icon: '📖' },
  { id: 'examples', title: t('help.tabs.examples'), icon: '💡' },
  { id: 'datatypes', title: t('help.tabs.datatypes'), icon: '🏷️' },
  { id: 'faq', title: t('help.tabs.faq'), icon: '❓' },
  { id: 'troubleshooting', title: t('help.tabs.troubleshooting'), icon: '🔧' }
])

interface ExampleData {
  title: string
  content: string
  type: InputType
}

const examples = computed<Record<string, ExampleData>>(() => ({
  json: {
    title: 'JSON',
    type: InputType.JSON,
    content: `{
  "name": "John Doe",
  "age": 30,
  "city": "Seoul",
  "hobbies": ["reading", "coding", "music"],
  "address": {
    "street": "123 Main St",
    "zipcode": "12345"
  }
}`
  },
  jsonl: {
    title: 'JSONL',
    type: InputType.JSONL,
    content: `{"id": 1, "name": "Alice", "score": 95}
{"id": 2, "name": "Bob", "score": 87}
{"id": 3, "name": "Charlie", "score": 92}`
  },
  complex: {
    title: t('help.examples.complex'),
    type: InputType.JSON,
    content: `{
  "users": [
    {
      "id": 1,
      "profile": {
        "name": "김철수",
        "email": "kim@example.com",
        "preferences": {
          "theme": "dark",
          "notifications": true,
          "languages": ["ko", "en"]
        }
      },
      "posts": [
        {
          "title": "첫 번째 포스트",
          "tags": ["vue", "typescript"],
          "metadata": {
            "views": 1250,
            "likes": 45,
            "created": "2024-01-15T09:30:00Z"
          }
        }
      ]
    }
  ]
}`
  }
}))

const closeModal = () => {
  emit('close')
}

const tryExample = (example: ExampleData) => {
  // 입력 타입을 먼저 설정
  store.setInputType(example.type)
  // 그 다음 텍스트 설정
  store.setInputText(example.content)
  // 파싱 실행
  store.parseInput()
  closeModal()
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeModal()
  }
}

onMounted(async () => {
  if (props.isOpen) {
    await nextTick()
    modalRef.value?.focus()
    document.addEventListener('keydown', handleKeydown)
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.help-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.help-modal {
  background: var(--color-surface);
  border-radius: 1rem;
  box-shadow: 
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 1200px;
  width: 100%;
  height: 80vh;
  max-height: 800px;
  min-height: 600px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--color-border);
}

.help-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface-elevated);
}

.help-modal-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--color-primary);
}

.help-modal-title h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.help-modal-close {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.help-modal-close:hover {
  background: var(--color-surface-hover);
  color: var(--color-text-primary);
}

.help-modal-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.help-tabs {
  display: flex;
  background: var(--color-surface-elevated);
  border-bottom: 1px solid var(--color-border);
  overflow-x: auto;
  flex-shrink: 0;
}

.help-tab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  font-size: 0.875rem;
  border-bottom: 2px solid transparent;
}

.help-tab:hover {
  background: var(--color-surface-hover);
  color: var(--color-text-primary);
}

.help-tab.active {
  background: var(--color-surface);
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

.tab-icon {
  font-size: 1rem;
}

.help-tab-content {
  flex: 1;
  overflow-y: auto;
  min-height: 0; /* flexbox에서 스크롤이 제대로 작동하도록 */
}

.tab-panel {
  padding: 2rem;
}

.help-section {
  margin-bottom: 2rem;
}

.help-section:last-child {
  margin-bottom: 0;
}

.help-section h3 {
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.help-section p {
  margin: 0 0 1rem 0;
  line-height: 1.6;
  color: var(--color-text-secondary);
}

.help-list {
  margin: 0;
  padding-left: 1.5rem;
  color: var(--color-text-secondary);
}

.help-list li {
  margin-bottom: 0.5rem;
  line-height: 1.6;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.feature-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: var(--color-surface-elevated);
  border-radius: 0.75rem;
  border: 1px solid var(--color-border);
}

.feature-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.feature-text strong {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--color-text-primary);
  font-weight: 600;
}

.feature-text p {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--color-text-secondary);
}



.example-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.example-tab {
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.example-tab:hover {
  background: var(--color-surface-hover);
  color: var(--color-text-primary);
}

.example-tab.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.example-content {
  position: relative;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  overflow: hidden;
}

.example-content pre {
  margin: 0;
  padding: 1.5rem;
  overflow-x: auto;
  font-family: 'Fira Code', 'Monaco', 'Cascadia Code', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--color-text-primary);
}

.example-content code {
  color: var(--color-text-primary);
}

.example-try-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.example-try-button:hover {
  background: var(--color-primary-hover);
  transform: translateY(-1px);
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .help-modal {
    margin: 0.5rem;
    height: 90vh;
    max-height: 90vh;
    min-height: 500px;
  }
  
  .help-modal-header {
    padding: 1rem 1.5rem;
  }
  
  .tab-panel {
    padding: 1.5rem;
  }
  
  .feature-grid {
    grid-template-columns: 1fr;
  }
  

  
  .example-tabs {
    flex-wrap: wrap;
  }
  
  .example-try-button {
    position: static;
    margin-top: 1rem;
    width: 100%;
  }
}

/* 다크 모드 */
@media (prefers-color-scheme: dark) {
  .help-modal-overlay {
    background: rgba(0, 0, 0, 0.8);
  }
}



/* 접근성 */
@media (prefers-reduced-motion: reduce) {
  .help-modal-close,
  .example-tab,
  .example-try-button {
    transition: none;
  }
}
</style>