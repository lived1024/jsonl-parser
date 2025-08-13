export interface AdSenseConfig {
  publisherId: string
  adSlots: {
    header: string
    sidebar: string
    content: string
    footer: string
  }
}

export interface AdSenseState {
  isLoaded: boolean
  isBlocked: boolean
  error: string | null
}

export class AdSenseService {
  private static instance: AdSenseService
  private config: AdSenseConfig | null = null
  private state: AdSenseState = {
    isLoaded: false,
    isBlocked: false,
    error: null
  }

  static getInstance(): AdSenseService {
    if (!AdSenseService.instance) {
      AdSenseService.instance = new AdSenseService()
    }
    return AdSenseService.instance
  }

  async init(config: AdSenseConfig): Promise<void> {
    this.config = config
    
    try {
      // Check if AdSense is already loaded
      if (window.adsbygoogle) {
        this.state.isLoaded = true
        return
      }

      // Load AdSense script
      await this.loadAdSenseScript()
      this.state.isLoaded = true
      this.state.error = null
    } catch (error) {
      this.state.error = error instanceof Error ? error.message : 'Failed to load AdSense'
      console.error('AdSense initialization failed:', error)
    }
  }

  private loadAdSenseScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.config) {
        reject(new Error('AdSense config not set'))
        return
      }

      const script = document.createElement('script')
      script.async = true
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${this.config.publisherId}`
      script.crossOrigin = 'anonymous'
      
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load AdSense script'))
      
      document.head.appendChild(script)
    })
  }

  loadAd(element: HTMLElement, slot: string): void {
    if (!this.state.isLoaded || this.state.isBlocked) {
      return
    }

    try {
      // Push ad to AdSense queue
      if (window.adsbygoogle) {
        window.adsbygoogle.push({})
      }
    } catch (error) {
      console.error('Failed to load ad:', error)
    }
  }

  isAdBlockerActive(): boolean {
    // Simple ad blocker detection
    try {
      const testAd = document.createElement('div')
      testAd.innerHTML = '&nbsp;'
      testAd.className = 'adsbox'
      testAd.style.position = 'absolute'
      testAd.style.left = '-10000px'
      document.body.appendChild(testAd)
      
      const isBlocked = testAd.offsetHeight === 0
      document.body.removeChild(testAd)
      
      this.state.isBlocked = isBlocked
      return isBlocked
    } catch (error) {
      console.error('Ad blocker detection failed:', error)
      return false
    }
  }

  getState(): AdSenseState {
    return { ...this.state }
  }

  getConfig(): AdSenseConfig | null {
    return this.config
  }
}

// Extend window interface for AdSense
declare global {
  interface Window {
    adsbygoogle: any[]
  }
}