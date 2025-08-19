<template>
  <div class="preference-dashboard">
    <div class="preference-dashboard__header">
      <h2>{{ t('preferences.dashboard.title') }}</h2>
      <p class="preference-dashboard__description">
        {{ t('preferences.dashboard.description') }}
      </p>
    </div>

    <div class="preference-dashboard__content">
      <!-- Analytics Overview -->
      <div class="dashboard-section" v-if="analytics && trackingEnabled">
        <h3>{{ t('preferences.analytics.title') }}</h3>
        
        <div class="analytics-grid">
          <div class="analytics-card">
            <div class="analytics-card__header">
              <TrendingUp class="analytics-card__icon" />
              <h4>{{ t('preferences.analytics.usage') }}</h4>
            </div>
            <div class="analytics-card__content">
              <div class="metric">
                <span class="metric__value">{{ analytics.averageSessionDuration | formatDuration }}</span>
                <span class="metric__label">{{ t('preferences.analytics.avgSession') }}</span>
              </div>
              <div class="metric">
                <span class="metric__value">{{ analytics.mostUsedFeatures.length }}</span>
                <span class="metric__label">{{ t('preferences.analytics.featuresUsed') }}</span>
              </div>
            </div>
          </div>

          <div class="analytics-card">
            <div class="analytics-card__header">
              <BookOpen class="analytics-card__icon" />
              <h4>{{ t('preferences.analytics.learning') }}</h4>
            </div>
            <div class="analytics-card__content">
              <div class="metric">
                <span class="metric__value">{{ preferences.completedTutorials.length }}</span>
                <span class="metric__label">{{ t('preferences.analytics.completedTutorials') }}</span>
              </div>
              <div class="metric">
                <span class="metric__value">{{ analytics.learningVelocity.toFixed(1) }}</span>
                <span class="metric__label">{{ t('preferences.analytics.learningVelocity') }}</span>
              </div>
            </div>
          </div>

          <div class="analytics-card">
            <div class="analytics-card__header">
              <Wrench class="analytics-card__icon" />
              <h4>{{ t('preferences.analytics.tools') }}</h4>
            </div>
            <div class="analytics-card__content">
              <div class="metric">
                <span class="metric__value">{{ preferences.favoriteTools.length }}</span>
                <span class="metric__label">{{ t('preferences.analytics.favoriteTools') }}</span>
              </div>
              <div class="metric">
                <span class="metric__value">{{ getAverageToolEfficiency() }}%</span>
                <span class="metric__label">{{ t('preferences.analytics.toolEfficiency') }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Personalized Recommendations -->
      <div class="dashboard-section" v-if="recommendations">
        <h3>{{ t('preferences.recommendations.title') }}</h3>
        
        <div class="recommendations-grid">
          <div class="recommendation-category" v-if="recommendations.tutorials.length > 0">
            <h4>{{ t('preferences.recommendations.tutorials') }}</h4>
            <ul class="recommendation-list">
              <li v-for="tutorial in recommendations.tutorials.slice(0, 3)" :key="tutorial" class="recommendation-item">
                <BookOpen class="recommendation-item__icon" />
                <span>{{ tutorial }}</span>
              </li>
            </ul>
          </div>

          <div class="recommendation-category" v-if="recommendations.tools.length > 0">
            <h4>{{ t('preferences.recommendations.tools') }}</h4>
            <ul class="recommendation-list">
              <li v-for="tool in recommendations.tools.slice(0, 3)" :key="tool" class="recommendation-item">
                <Wrench class="recommendation-item__icon" />
                <span>{{ tool }}</span>
              </li>
            </ul>
          </div>

          <div class="recommendation-category" v-if="recommendations.content.length > 0">
            <h4>{{ t('preferences.recommendations.content') }}</h4>
            <ul class="recommendation-list">
              <li v-for="content in recommendations.content.slice(0, 3)" :key="content" class="recommendation-item">
                <FileText class="recommendation-item__icon" />
                <span>{{ content }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="dashboard-section">
        <h3>{{ t('preferences.activity.title') }}</h3>
        
        <div class="activity-grid">
          <div class="activity-card" v-if="preferences.recentTools.length > 0">
            <h4>{{ t('preferences.activity.recentTools') }}</h4>
            <ul class="activity-list">
              <li v-for="tool in preferences.recentTools.slice(0, 5)" :key="tool" class="activity-item">
                <Wrench class="activity-item__icon" />
                <span>{{ tool }}</span>
              </li>
            </ul>
          </div>

          <div class="activity-card" v-if="preferences.recentlyViewedContent.length > 0">
            <h4>{{ t('preferences.activity.recentContent') }}</h4>
            <ul class="activity-list">
              <li v-for="content in preferences.recentlyViewedContent.slice(0, 5)" :key="content" class="activity-item">
                <FileText class="activity-item__icon" />
                <span>{{ content }}</span>
              </li>
            </ul>
          </div>

          <div class="activity-card" v-if="preferences.recentSamples.length > 0">
            <h4>{{ t('preferences.activity.recentSamples') }}</h4>
            <ul class="activity-list">
              <li v-for="sample in preferences.recentSamples.slice(0, 5)" :key="sample" class="activity-item">
                <Database class="activity-item__icon" />
                <span>{{ sample }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Learning Progress -->
      <div class="dashboard-section" v-if="Object.keys(preferences.tutorialProgress).length > 0">
        <h3>{{ t('preferences.learning.title') }}</h3>
        
        <div class="progress-grid">
          <div 
            v-for="(progress, tutorialId) in preferences.tutorialProgress" 
            :key="tutorialId"
            class="progress-card"
          >
            <div class="progress-card__header">
              <h4>{{ tutorialId }}</h4>
              <span class="progress-card__percentage">{{ Math.round(progress) }}%</span>
            </div>
            <div class="progress-bar">
              <div 
                class="progress-bar__fill" 
                :style="{ width: `${progress}%` }"
                :class="{ 'progress-bar__fill--complete': progress >= 100 }"
              ></div>
            </div>
            <div class="progress-card__status">
              <CheckCircle v-if="progress >= 100" class="progress-status-icon progress-status-icon--complete" />
              <Clock v-else class="progress-status-icon progress-status-icon--in-progress" />
              <span>{{ progress >= 100 ? t('preferences.learning.completed') : t('preferences.learning.inProgress') }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Behavioral Insights -->
      <div class="dashboard-section" v-if="behaviorAnalysis && trackingEnabled">
        <h3>{{ t('preferences.insights.title') }}</h3>
        
        <div class="insights-grid">
          <div class="insight-card" v-if="behaviorAnalysis.patterns.length > 0">
            <h4>{{ t('preferences.insights.patterns') }}</h4>
            <ul class="insight-list">
              <li v-for="pattern in behaviorAnalysis.patterns.slice(0, 3)" :key="pattern" class="insight-item">
                <TrendingUp class="insight-item__icon" />
                <span>{{ pattern }}</span>
              </li>
            </ul>
          </div>

          <div class="insight-card" v-if="behaviorAnalysis.insights.length > 0">
            <h4>{{ t('preferences.insights.behavioral') }}</h4>
            <ul class="insight-list">
              <li v-for="insight in behaviorAnalysis.insights.slice(0, 3)" :key="insight" class="insight-item">
                <Lightbulb class="insight-item__icon" />
                <span>{{ insight }}</span>
              </li>
            </ul>
          </div>

          <div class="insight-card" v-if="behaviorAnalysis.recommendations.length > 0">
            <h4>{{ t('preferences.insights.recommendations') }}</h4>
            <ul class="insight-list">
              <li v-for="recommendation in behaviorAnalysis.recommendations.slice(0, 3)" :key="recommendation" class="insight-item">
                <Star class="insight-item__icon" />
                <span>{{ recommendation }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Privacy Status -->
      <div class="dashboard-section">
        <h3>{{ t('preferences.privacy.title') }}</h3>
        
        <div class="privacy-status">
          <div class="privacy-status__item">
            <div class="privacy-status__indicator" :class="{ 'privacy-status__indicator--active': trackingEnabled }">
              <Eye v-if="trackingEnabled" class="privacy-status__icon" />
              <EyeOff v-else class="privacy-status__icon" />
            </div>
            <div class="privacy-status__content">
              <h4>{{ t('preferences.privacy.tracking') }}</h4>
              <p>{{ trackingEnabled ? t('preferences.privacy.trackingEnabled') : t('preferences.privacy.trackingDisabled') }}</p>
            </div>
          </div>

          <div class="privacy-status__item">
            <div class="privacy-status__indicator" :class="{ 'privacy-status__indicator--active': personalizedContentEnabled }">
              <User class="privacy-status__icon" />
            </div>
            <div class="privacy-status__content">
              <h4>{{ t('preferences.privacy.personalization') }}</h4>
              <p>{{ personalizedContentEnabled ? t('preferences.privacy.personalizationEnabled') : t('preferences.privacy.personalizationDisabled') }}</p>
            </div>
          </div>

          <div class="privacy-status__item">
            <div class="privacy-status__indicator" :class="{ 'privacy-status__indicator--active': analyticsEnabled }">
              <BarChart class="privacy-status__icon" />
            </div>
            <div class="privacy-status__content">
              <h4>{{ t('preferences.privacy.analytics') }}</h4>
              <p>{{ analyticsEnabled ? t('preferences.privacy.analyticsEnabled') : t('preferences.privacy.analyticsDisabled') }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="dashboard-section">
        <h3>{{ t('preferences.actions.title') }}</h3>
        
        <div class="dashboard-actions">
          <button @click="refreshAnalytics" class="dashboard-action-btn" :disabled="isLoading">
            <RefreshCw class="dashboard-action-btn__icon" />
            {{ t('preferences.actions.refresh') }}
          </button>
          
          <button @click="showPrivacySettings = true" class="dashboard-action-btn">
            <Settings class="dashboard-action-btn__icon" />
            {{ t('preferences.actions.privacySettings') }}
          </button>
          
          <button @click="exportData" class="dashboard-action-btn">
            <Download class="dashboard-action-btn__icon" />
            {{ t('preferences.actions.exportData') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Privacy Settings Modal -->
    <div v-if="showPrivacySettings" class="modal-overlay" @click="showPrivacySettings = false">
      <div class="modal" @click.stop>
        <div class="modal__header">
          <h3>{{ t('preferences.privacy.settings') }}</h3>
          <button @click="showPrivacySettings = false" class="modal__close">
            <X class="modal__close-icon" />
          </button>
        </div>
        <div class="modal__content">
          <PrivacySettings />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserPreferenceStore } from '../../stores/userPreferenceStore'
import { UserPreferenceService } from '../../services/UserPreferenceService'
import { useI18n } from '../../composables/useI18n'
import PrivacySettings from './PrivacySettings.vue'
import {
  TrendingUp,
  BookOpen,
  Wrench,
  FileText,
  Database,
  CheckCircle,
  Clock,
  Lightbulb,
  Star,
  Eye,
  EyeOff,
  User,
  BarChart,
  RefreshCw,
  Settings,
  Download,
  X
} from 'lucide-vue-next'

// Composables
const userPreferenceStore = useUserPreferenceStore()
const userPreferenceService = UserPreferenceService.getInstance()
const { t } = useI18n()

// State
const isLoading = ref(false)
const showPrivacySettings = ref(false)
const recommendations = ref<any>(null)
const behaviorAnalysis = ref<any>(null)

// Computed
const preferences = computed(() => userPreferenceStore.preferences)
const analytics = computed(() => userPreferenceStore.analytics)
const trackingEnabled = computed(() => userPreferenceStore.trackingEnabled)
const personalizedContentEnabled = computed(() => userPreferenceStore.personalizedContentEnabled)
const analyticsEnabled = computed(() => userPreferenceStore.analyticsEnabled)

// Methods
const getAverageToolEfficiency = (): number => {
  if (!analytics.value?.toolEfficiency) return 0
  
  const efficiencies = Object.values(analytics.value.toolEfficiency) as number[]
  if (efficiencies.length === 0) return 0
  
  const average = efficiencies.reduce((sum, eff) => sum + eff, 0) / efficiencies.length
  return Math.round(average * 100)
}

const refreshAnalytics = async () => {
  try {
    isLoading.value = true
    
    // Generate fresh analytics
    await userPreferenceStore.generateAnalytics()
    
    // Generate recommendations
    if (personalizedContentEnabled.value) {
      recommendations.value = userPreferenceService.generateRecommendations(
        preferences.value,
        analytics.value
      )
    }
    
    // Analyze behavior if tracking is enabled
    if (trackingEnabled.value) {
      const behaviorData = await userPreferenceStore.loadBehaviorData?.() || []
      behaviorAnalysis.value = userPreferenceService.analyzeUserBehavior(behaviorData)
    }
    
  } catch (error) {
    console.error('Failed to refresh analytics:', error)
  } finally {
    isLoading.value = false
  }
}

const exportData = async () => {
  try {
    isLoading.value = true
    
    const userData = userPreferenceService.exportUserData()
    const dataBlob = new Blob([JSON.stringify(userData, null, 2)], {
      type: 'application/json'
    })
    
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `jsonl-parser-preferences-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
  } catch (error) {
    console.error('Failed to export data:', error)
  } finally {
    isLoading.value = false
  }
}

// Filters
const formatDuration = (ms: number): string => {
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  }
  return `${seconds}s`
}

// Initialize
onMounted(async () => {
  if (!userPreferenceStore.isInitialized) {
    await userPreferenceStore.initialize()
  }
  
  await refreshAnalytics()
})
</script>

<style scoped>
.preference-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.preference-dashboard__header {
  margin-bottom: 2rem;
}

.preference-dashboard__header h2 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: var(--color-text-primary);
}

.preference-dashboard__description {
  color: var(--color-text-secondary);
  font-size: 1.1rem;
  line-height: 1.6;
}

.dashboard-section {
  margin-bottom: 3rem;
}

.dashboard-section h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--color-text-primary);
}

.analytics-grid,
.recommendations-grid,
.activity-grid,
.progress-grid,
.insights-grid {
  display: grid;
  gap: 1.5rem;
}

.analytics-grid {
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.recommendations-grid,
.insights-grid {
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

.activity-grid {
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.progress-grid {
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
}

.analytics-card,
.activity-card,
.progress-card,
.insight-card,
.recommendation-category {
  background: var(--color-background-secondary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1.5rem;
}

.analytics-card__header,
.progress-card__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.analytics-card__icon {
  width: 1.5rem;
  height: 1.5rem;
  color: var(--color-primary);
}

.analytics-card__header h4,
.activity-card h4,
.progress-card__header h4,
.insight-card h4,
.recommendation-category h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.metric {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}

.metric:last-child {
  margin-bottom: 0;
}

.metric__value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
}

.metric__label {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.recommendation-list,
.activity-list,
.insight-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.recommendation-item,
.activity-item,
.insight-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--color-border);
}

.recommendation-item:last-child,
.activity-item:last-child,
.insight-item:last-child {
  border-bottom: none;
}

.recommendation-item__icon,
.activity-item__icon,
.insight-item__icon {
  width: 1rem;
  height: 1rem;
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

.progress-card__percentage {
  font-weight: 700;
  color: var(--color-primary);
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--color-background-tertiary);
  border-radius: 4px;
  overflow: hidden;
  margin: 1rem 0;
}

.progress-bar__fill {
  height: 100%;
  background: var(--color-primary);
  transition: width 0.3s ease;
}

.progress-bar__fill--complete {
  background: var(--color-success, #22c55e);
}

.progress-card__status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.progress-status-icon {
  width: 1rem;
  height: 1rem;
}

.progress-status-icon--complete {
  color: var(--color-success, #22c55e);
}

.progress-status-icon--in-progress {
  color: var(--color-warning, #f59e0b);
}

.privacy-status {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.privacy-status__item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--color-background-secondary);
  border: 1px solid var(--color-border);
  border-radius: 6px;
}

.privacy-status__indicator {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-background-tertiary);
  border: 2px solid var(--color-border);
}

.privacy-status__indicator--active {
  background: var(--color-primary-bg, #eff6ff);
  border-color: var(--color-primary);
}

.privacy-status__icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--color-text-secondary);
}

.privacy-status__indicator--active .privacy-status__icon {
  color: var(--color-primary);
}

.privacy-status__content h4 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  color: var(--color-text-primary);
}

.privacy-status__content p {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.dashboard-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.dashboard-action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.dashboard-action-btn:hover:not(:disabled) {
  background: var(--color-primary-dark, #3b82f6);
}

.dashboard-action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.dashboard-action-btn__icon {
  width: 1rem;
  height: 1rem;
}

.modal-overlay {
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
}

.modal {
  background: var(--color-background-primary);
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  max-width: 900px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.modal__header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.modal__close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  color: var(--color-text-secondary);
  transition: background-color 0.2s ease;
}

.modal__close:hover {
  background: var(--color-background-secondary);
}

.modal__close-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.modal__content {
  padding: 0;
}

@media (max-width: 768px) {
  .preference-dashboard {
    padding: 1rem;
  }
  
  .analytics-grid,
  .recommendations-grid,
  .activity-grid,
  .progress-grid,
  .insights-grid {
    grid-template-columns: 1fr;
  }
  
  .dashboard-actions {
    flex-direction: column;
  }
  
  .privacy-status__item {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }
  
  .modal {
    width: 95%;
    margin: 1rem;
  }
}
</style>