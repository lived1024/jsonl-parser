import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './styles/variables.css'
import './styles/global.css'
import './styles/components.css'
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

// i18n 초기화
const initializeApp = async () => {
  try {
    // Pinia가 설치된 후에 store를 사용할 수 있음
    const { useI18nStore } = await import('./stores/i18nStore')
    const i18nStore = useI18nStore()
    
    // i18n 초기화
    await i18nStore.initialize()
    
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