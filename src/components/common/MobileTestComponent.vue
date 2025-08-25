<template>
  <div class="mobile-test-component">
    <h2>Mobile Optimization Test</h2>
    
    <!-- Device Information -->
    <div class="test-section">
      <h3>Device Information</h3>
      <div class="info-grid">
        <div class="info-item">
          <strong>Device Type:</strong> {{ deviceType }}
        </div>
        <div class="info-item">
          <strong>Screen Size:</strong> {{ windowWidth }}x{{ windowHeight }}
        </div>
        <div class="info-item">
          <strong>Orientation:</strong> {{ orientation }}
        </div>
        <div class="info-item">
          <strong>Touch Device:</strong> {{ isTouchDevice ? 'Yes' : 'No' }}
        </div>
        <div class="info-item">
          <strong>Has Hover:</strong> {{ hasHoverCapability ? 'Yes' : 'No' }}
        </div>
      </div>
    </div>
    
    <!-- Breakpoint Tests -->
    <div class="test-section">
      <h3>Responsive Breakpoints</h3>
      <div class="breakpoint-indicators">
        <div class="indicator" :class="{ active: isMobileSm }">
          Mobile SM (≤480px)
        </div>
        <div class="indicator" :class="{ active: isMobile && !isMobileSm }">
          Mobile MD (≤768px)
        </div>
        <div class="indicator" :class="{ active: isTablet && !isMobile }">
          Tablet (≤1024px)
        </div>
        <div class="indicator" :class="{ active: !isTablet }">
          Desktop (>1024px)
        </div>
      </div>
    </div>
    
    <!-- Touch Target Tests -->
    <div class="test-section">
      <h3>Touch Targets</h3>
      <div class="touch-targets">
        <button class="touch-button small">Small (32px)</button>
        <button class="touch-button medium">Medium (44px)</button>
        <button class="touch-button large">Large (48px)</button>
        <button class="touch-button optimal" :style="{ minHeight: getTouchTargetSize() + 'px' }">
          Optimal ({{ getTouchTargetSize() }}px)
        </button>
      </div>
    </div>
    
    <!-- Typography Tests -->
    <div class="test-section">
      <h3>Typography Scaling</h3>
      <div class="typography-tests">
        <p class="text-base" :style="{ fontSize: getOptimalFontSize(16) + 'px' }">
          Base text ({{ getOptimalFontSize(16) }}px)
        </p>
        <p class="text-small" :style="{ fontSize: getOptimalFontSize(14) + 'px' }">
          Small text ({{ getOptimalFontSize(14) }}px)
        </p>
        <p class="text-large" :style="{ fontSize: getOptimalFontSize(18) + 'px' }">
          Large text ({{ getOptimalFontSize(18) }}px)
        </p>
      </div>
    </div>
    
    <!-- Layout Tests -->
    <div class="test-section">
      <h3>Layout Behavior</h3>
      <div class="layout-test" :class="{ 'mobile-stack': isMobile }">
        <div class="layout-sidebar">Sidebar Content</div>
        <div class="layout-main">Main Content</div>
      </div>
    </div>
    
    <!-- Form Elements -->
    <div class="test-section">
      <h3>Form Elements</h3>
      <div class="form-test">
        <input type="text" placeholder="Text input" class="mobile-input" />
        <select class="mobile-select">
          <option>Select option</option>
          <option>Option 1</option>
          <option>Option 2</option>
        </select>
        <textarea placeholder="Textarea" class="mobile-textarea"></textarea>
      </div>
    </div>
    
    <!-- Utility Classes Test -->
    <div class="test-section">
      <h3>Utility Classes</h3>
      <div class="utility-test">
        <div class="desktop-only">Desktop Only</div>
        <div class="mobile-only">Mobile Only</div>
        <div class="mobile-full-width">Mobile Full Width</div>
        <div class="mobile-text-center">Mobile Text Center</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useApp } from '../../composables/useApp'

const {
  isMobile,
  isMobileSm,
  isTablet,
  isTouchDevice,
  hasHoverCapability,
  deviceType,
  orientation,
  windowWidth,
  windowHeight,
  getTouchTargetSize,
  getOptimalFontSize
} = useApp()
</script>

<style scoped>
.mobile-test-component {
  padding: 1rem;
  max-width: 800px;
  margin: 0 auto;
}

.test-section {
  margin-bottom: 2rem;
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background-secondary);
}

.test-section h3 {
  margin-top: 0;
  color: var(--color-primary);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.5rem;
}

.info-item {
  padding: 0.5rem;
  background: var(--color-background-primary);
  border-radius: 4px;
  font-size: 0.9rem;
}

.breakpoint-indicators {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.indicator {
  padding: 0.5rem 1rem;
  border: 2px solid var(--color-border);
  border-radius: 20px;
  font-size: 0.9rem;
  opacity: 0.5;
  transition: all 0.3s ease;
}

.indicator.active {
  opacity: 1;
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: white;
}

.touch-targets {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.touch-button {
  border: 1px solid var(--color-primary);
  background: var(--color-background-primary);
  color: var(--color-primary);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.touch-button.small {
  min-width: 32px;
  min-height: 32px;
  padding: 0.25rem 0.5rem;
}

.touch-button.medium {
  min-width: 44px;
  min-height: 44px;
  padding: 0.5rem 1rem;
}

.touch-button.large {
  min-width: 48px;
  min-height: 48px;
  padding: 0.75rem 1rem;
}

.touch-button.optimal {
  padding: 0.75rem 1rem;
  background: var(--color-primary);
  color: white;
  font-weight: 600;
}

.touch-button:hover {
  background: var(--color-primary);
  color: white;
}

.typography-tests {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.layout-test {
  display: flex;
  gap: 1rem;
  min-height: 100px;
}

.layout-test.mobile-stack {
  flex-direction: column;
}

.layout-sidebar {
  flex: 0 0 200px;
  background: var(--color-primary);
  color: white;
  padding: 1rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.layout-main {
  flex: 1;
  background: var(--color-background-primary);
  border: 1px solid var(--color-border);
  padding: 1rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-test {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.mobile-input,
.mobile-select,
.mobile-textarea {
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 16px; /* Prevent zoom on iOS */
  background: var(--color-background-primary);
  color: var(--color-text-primary);
}

.mobile-textarea {
  min-height: 80px;
  resize: vertical;
}

.utility-test > div {
  padding: 0.5rem;
  margin: 0.5rem 0;
  background: var(--color-background-primary);
  border: 1px solid var(--color-border);
  border-radius: 4px;
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .mobile-test-component {
    padding: 0.75rem;
  }
  
  .test-section {
    padding: 0.75rem;
    margin-bottom: 1.5rem;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .breakpoint-indicators {
    flex-direction: column;
  }
  
  .touch-targets {
    justify-content: center;
  }
  
  .layout-sidebar {
    flex: none;
  }
}

@media (max-width: 480px) {
  .mobile-test-component {
    padding: 0.5rem;
  }
  
  .test-section {
    padding: 0.5rem;
    margin-bottom: 1rem;
  }
  
  .touch-targets {
    flex-direction: column;
    align-items: stretch;
  }
  
  .touch-button {
    width: 100%;
    justify-content: center;
  }
}
</style>