<template>
  <div class="privacy-settings">
    <div class="privacy-settings__header">
      <h3>{{ t('privacy.title') }}</h3>
      <p class="privacy-settings__description">
        {{ t('privacy.description') }}
      </p>
    </div>

    <div class="privacy-settings__content">
      <!-- Tracking Settings -->
      <div class="privacy-section">
        <h4>{{ t('privacy.tracking.title') }}</h4>
        
        <div class="privacy-option">
          <label class="privacy-option__label">
            <input
              type="checkbox"
              v-model="localPrivacySettings.trackingEnabled"
              @change="updatePrivacySetting('trackingEnabled', $event.target.checked)"
              class="privacy-option__checkbox"
            />
            <span class="privacy-option__text">
              {{ t('privacy.tracking.enabled') }}
            </span>
          </label>
          <p class="privacy-option__description">
            {{ t('privacy.tracking.enabledDescription') }}
          </p>
        </div>

        <div class="privacy-option">
          <label class="privacy-option__label">
            <input
              type="checkbox"
              v-model="localPrivacySettings.analyticsConsent"
              @change="updatePrivacySetting('analyticsConsent', $event.target.checked)"
              class="privacy-option__checkbox"
              :disabled="!localPrivacySettings.trackingEnabled"
            />
            <span class="privacy-option__text">
              {{ t('privacy.analytics.consent') }}
            </span>
          </label>
          <p class="privacy-option__description">
            {{ t('privacy.analytics.consentDescription') }}
          </p>
        </div>

        <div class="privacy-option">
          <label class="privacy-option__label">
            <input
              type="checkbox"
              v-model="localPrivacySettings.personalizedContent"
              @change="updatePrivacySetting('personalizedContent', $event.target.checked)"
              class="privacy-option__checkbox"
              :disabled="!localPrivacySettings.trackingEnabled"
            />
            <span class="privacy-option__text">
              {{ t('privacy.personalization.enabled') }}
            </span>
          </label>
          <p class="privacy-option__description">
            {{ t('privacy.personalization.enabledDescription') }}
          </p>
        </div>
      </div>

      <!-- Data Retention Settings -->
      <div class="privacy-section">
        <h4>{{ t('privacy.dataRetention.title') }}</h4>
        
        <div class="privacy-option">
          <label class="privacy-option__label">
            {{ t('privacy.dataRetention.period') }}
            <select
              v-model="localPrivacySettings.dataRetentionDays"
              @change="updatePrivacySetting('dataRetentionDays', parseInt($event.target.value))"
              class="privacy-option__select"
            >
              <option value="7">{{ t('privacy.dataRetention.days', { days: 7 }) }}</option>
              <option value="30">{{ t('privacy.dataRetention.days', { days: 30 }) }}</option>
              <option value="90">{{ t('privacy.dataRetention.days', { days: 90 }) }}</option>
              <option value="365">{{ t('privacy.dataRetention.days', { days: 365 }) }}</option>
            </select>
          </label>
          <p class="privacy-option__description">
            {{ t('privacy.dataRetention.periodDescription') }}
          </p>
        </div>
      </div>

      <!-- Cookie Settings -->
      <div class="privacy-section">
        <h4>{{ t('privacy.cookies.title') }}</h4>
        
        <div class="privacy-option">
          <label class="privacy-option__label">
            <input
              type="checkbox"
              v-model="localPrivacySettings.cookieConsent"
              @change="updatePrivacySetting('cookieConsent', $event.target.checked)"
              class="privacy-option__checkbox"
            />
            <span class="privacy-option__text">
              {{ t('privacy.cookies.consent') }}
            </span>
          </label>
          <p class="privacy-option__description">
            {{ t('privacy.cookies.consentDescription') }}
          </p>
        </div>
      </div>

      <!-- Data Management -->
      <div class="privacy-section">
        <h4>{{ t('privacy.dataManagement.title') }}</h4>
        
        <div class="privacy-actions">
          <button
            @click="exportUserData"
            class="privacy-action-btn privacy-action-btn--secondary"
            :disabled="isLoading"
          >
            <Download class="privacy-action-btn__icon" />
            {{ t('privacy.dataManagement.export') }}
          </button>
          
          <button
            @click="showClearDataConfirm = true"
            class="privacy-action-btn privacy-action-btn--danger"
            :disabled="isLoading"
          >
            <Trash class="privacy-action-btn__icon" />
            {{ t('privacy.dataManagement.clear') }}
          </button>
        </div>
      </div>

      <!-- Privacy Compliance Status -->
      <div class="privacy-section" v-if="complianceStatus">
        <h4>{{ t('privacy.compliance.title') }}</h4>
        
        <div class="compliance-status" :class="{ 'compliance-status--compliant': complianceStatus.compliant }">
          <div class="compliance-status__indicator">
            <CheckCircle v-if="complianceStatus.compliant" class="compliance-status__icon compliance-status__icon--success" />
            <AlertCircle v-else class="compliance-status__icon compliance-status__icon--warning" />
          </div>
          
          <div class="compliance-status__content">
            <p class="compliance-status__text">
              {{ complianceStatus.compliant ? t('privacy.compliance.compliant') : t('privacy.compliance.nonCompliant') }}
            </p>
            
            <ul v-if="complianceStatus.issues.length > 0" class="compliance-issues">
              <li v-for="issue in complianceStatus.issues" :key="issue" class="compliance-issue">
                {{ issue }}
              </li>
            </ul>
            
            <ul v-if="complianceStatus.recommendations.length > 0" class="compliance-recommendations">
              <li v-for="recommendation in complianceStatus.recommendations" :key="recommendation" class="compliance-recommendation">
                {{ recommendation }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Clear Data Confirmation Modal -->
    <div v-if="showClearDataConfirm" class="modal-overlay" @click="showClearDataConfirm = false">
      <div class="modal" @click.stop>
        <div class="modal__header">
          <h3>{{ t('privacy.clearData.confirmTitle') }}</h3>
        </div>
        
        <div class="modal__content">
          <p>{{ t('privacy.clearData.confirmMessage') }}</p>
          <ul class="clear-data-items">
            <li>{{ t('privacy.clearData.preferences') }}</li>
            <li>{{ t('privacy.clearData.behaviorData') }}</li>
            <li>{{ t('privacy.clearData.analytics') }}</li>
            <li>{{ t('privacy.clearData.settings') }}</li>
          </ul>
        </div>
        
        <div class="modal__actions">
          <button
            @click="showClearDataConfirm = false"
            class="modal-btn modal-btn--secondary"
          >
            {{ t('common.cancel') }}
          </button>
          <button
            @click="clearAllUserData"
            class="modal-btn modal-btn--danger"
            :disabled="isLoading"
          >
            {{ t('privacy.clearData.confirm') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useUserPreferenceStore } from '../../stores/userPreferenceStore'
import { UserPreferenceService } from '../../services/UserPreferenceService'
import { useI18n } from '../../composables/useI18n'
import type { PrivacySettings } from '../../types/userPreferences'
import { 
  Download, 
  Trash, 
  CheckCircle, 
  AlertCircle 
} from 'lucide-vue-next'

// Composables
const userPreferenceStore = useUserPreferenceStore()
const userPreferenceService = UserPreferenceService.getInstance()
const { t } = useI18n()

// State
const isLoading = ref(false)
const showClearDataConfirm = ref(false)
const localPrivacySettings = ref<PrivacySettings>({ ...userPreferenceStore.privacySettings })

// Computed
const complianceStatus = computed(() => {
  return userPreferenceService.validatePrivacyCompliance(localPrivacySettings.value)
})

// Methods
const updatePrivacySetting = async <K extends keyof PrivacySettings>(
  key: K,
  value: PrivacySettings[K]
) => {
  try {
    isLoading.value = true
    localPrivacySettings.value[key] = value
    userPreferenceStore.updatePrivacySetting(key, value)
  } catch (error) {
    console.error('Failed to update privacy setting:', error)
  } finally {
    isLoading.value = false
  }
}

const exportUserData = async () => {
  try {
    isLoading.value = true
    
    const userData = userPreferenceService.exportUserData()
    const dataBlob = new Blob([JSON.stringify(userData, null, 2)], {
      type: 'application/json'
    })
    
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `jsonl-parser-user-data-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
  } catch (error) {
    console.error('Failed to export user data:', error)
  } finally {
    isLoading.value = false
  }
}

const clearAllUserData = async () => {
  try {
    isLoading.value = true
    
    await userPreferenceStore.clearAllData()
    showClearDataConfirm.value = false
    
    // Reset local settings to defaults
    localPrivacySettings.value = { ...userPreferenceStore.privacySettings }
    
  } catch (error) {
    console.error('Failed to clear user data:', error)
  } finally {
    isLoading.value = false
  }
}

// Watch for changes in store privacy settings
watch(
  () => userPreferenceStore.privacySettings,
  (newSettings) => {
    localPrivacySettings.value = { ...newSettings }
  },
  { deep: true }
)

// Initialize
onMounted(async () => {
  if (!userPreferenceStore.isInitialized) {
    await userPreferenceStore.initialize()
  }
  localPrivacySettings.value = { ...userPreferenceStore.privacySettings }
})
</script>

<style scoped>
.privacy-settings {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.privacy-settings__header {
  margin-bottom: 2rem;
}

.privacy-settings__header h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--color-text-primary);
}

.privacy-settings__description {
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.privacy-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background-secondary);
}

.privacy-section h4 {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--color-text-primary);
}

.privacy-option {
  margin-bottom: 1rem;
}

.privacy-option:last-child {
  margin-bottom: 0;
}

.privacy-option__label {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
  font-weight: 500;
  color: var(--color-text-primary);
}

.privacy-option__checkbox {
  margin-top: 0.125rem;
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

.privacy-option__select {
  margin-left: 0.5rem;
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-background-primary);
  color: var(--color-text-primary);
}

.privacy-option__text {
  flex: 1;
}

.privacy-option__description {
  margin-top: 0.5rem;
  margin-left: 1.75rem;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.privacy-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.privacy-action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-background-primary);
  color: var(--color-text-primary);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.privacy-action-btn:hover:not(:disabled) {
  background: var(--color-background-secondary);
  border-color: var(--color-primary);
}

.privacy-action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.privacy-action-btn--secondary {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.privacy-action-btn--danger {
  border-color: var(--color-error);
  color: var(--color-error);
}

.privacy-action-btn--danger:hover:not(:disabled) {
  background: var(--color-error);
  color: white;
}

.privacy-action-btn__icon {
  width: 1rem;
  height: 1rem;
}

.compliance-status {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-radius: 6px;
  background: var(--color-background-tertiary);
  border: 1px solid var(--color-border);
}

.compliance-status--compliant {
  background: var(--color-success-bg, #f0f9f0);
  border-color: var(--color-success, #22c55e);
}

.compliance-status__indicator {
  flex-shrink: 0;
}

.compliance-status__icon {
  width: 1.5rem;
  height: 1.5rem;
}

.compliance-status__icon--success {
  color: var(--color-success, #22c55e);
}

.compliance-status__icon--warning {
  color: var(--color-warning, #f59e0b);
}

.compliance-status__content {
  flex: 1;
}

.compliance-status__text {
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: var(--color-text-primary);
}

.compliance-issues,
.compliance-recommendations {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.compliance-issue {
  color: var(--color-error, #ef4444);
  margin-bottom: 0.25rem;
}

.compliance-recommendation {
  color: var(--color-warning, #f59e0b);
  margin-bottom: 0.25rem;
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
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal__header {
  padding: 1.5rem 1.5rem 0;
}

.modal__header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.modal__content {
  padding: 1rem 1.5rem;
}

.modal__content p {
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin-bottom: 1rem;
}

.clear-data-items {
  list-style: disc;
  padding-left: 1.5rem;
  color: var(--color-text-secondary);
}

.clear-data-items li {
  margin-bottom: 0.25rem;
}

.modal__actions {
  padding: 0 1.5rem 1.5rem;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.modal-btn {
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-background-primary);
  color: var(--color-text-primary);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-btn:hover:not(:disabled) {
  background: var(--color-background-secondary);
}

.modal-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.modal-btn--secondary {
  border-color: var(--color-border);
}

.modal-btn--danger {
  background: var(--color-error);
  border-color: var(--color-error);
  color: white;
}

.modal-btn--danger:hover:not(:disabled) {
  background: var(--color-error-dark, #dc2626);
}

@media (max-width: 768px) {
  .privacy-settings {
    padding: 1rem;
  }
  
  .privacy-actions {
    flex-direction: column;
  }
  
  .privacy-action-btn {
    justify-content: center;
  }
  
  .modal {
    width: 95%;
  }
  
  .modal__actions {
    flex-direction: column;
  }
}
</style>