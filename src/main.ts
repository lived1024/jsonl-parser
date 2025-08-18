import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './styles/variables.css'
import './styles/global.css'
import './styles/components.css'
import 'highlight.js/styles/github.css'
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// 초기 로딩 화면 제거 함수
const removeInitialLoading = () => {
  const loadingElement = document.getElementById('initial-loading')
  if (loadingElement) {
    loadingElement.style.opacity = '0'
    loadingElement.style.transition = 'opacity 0.3s ease'
    setTimeout(() => {
      loadingElement.remove()
    }, 300)
  }
}

// i18n 및 AdSense 초기화
const initializeApp = async () => {
  try {
    // Pinia가 설치된 후에 store를 사용할 수 있음
    const { useI18nStore } = await import('./stores/i18nStore')
    const i18nStore = useI18nStore()
    
    // i18n 초기화
    await i18nStore.initialize()
    
    // Google Analytics 초기화
    const { AnalyticsService } = await import('./services/AnalyticsService')
    const analyticsService = AnalyticsService.getInstance()
    
    await analyticsService.init({
      measurementId: 'G-PX3P01GVCR', // HTML에서 이미 설정된 측정 ID 사용
      enableDebug: import.meta.env.DEV, // 개발 환경에서만 디버그 모드
      customDimensions: {
        app_version: '1.0.0',
        app_name: 'JSONL Parser'
      }
    })

    // AdSense 초기화 (프로덕션 환경에서만)
    if (import.meta.env.PROD) {
      const { AdSenseService } = await import('./services/AdSenseService')
      const adSenseService = AdSenseService.getInstance()
      
      // 실제 AdSense 설정으로 교체 필요
      await adSenseService.init({
        publisherId: 'ca-pub-XXXXXXXXXXXXXXXXX', // 실제 Publisher ID로 교체
        adSlots: {
          header: '1234567890',
          sidebar: '1234567891', 
          content: '1234567892',
          footer: '1234567893'
        }
      })
    }
    
    // 애플리케이션 마운트
    app.mount('#app')
    
    // 초기 로딩 화면 제거
    removeInitialLoading()
    
  } catch (error) {
    console.error('Failed to initialize application:', error)
    
    // 오류 발생 시에도 애플리케이션 마운트 (기본 언어로)
    app.mount('#app')
    removeInitialLoading()
    
    // 사용자에게 오류 알림 (선택적)
    if (import.meta.env.DEV) {
      console.warn('Application initialized with default language due to i18n initialization error')
    }
  }
}

initializeApp()