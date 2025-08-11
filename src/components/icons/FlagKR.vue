<template>
  <svg 
    :width="size" 
    :height="size" 
    viewBox="0 0 24 24" 
    fill="none"
    class="flag-icon"
  >
    <!-- 배경 -->
    <rect x="2" y="4" width="20" height="16" rx="2" fill="white" stroke="#e5e7eb" stroke-width="0.5"/>
    
    <!-- 태극 -->
    <g transform="translate(12, 12)">
      <!-- 태극의 S자 곡선 -->
      <path d="M -3 0 A 1.5 1.5 0 0 1 0 -1.5 A 1.5 1.5 0 0 0 3 0 A 1.5 1.5 0 0 1 0 1.5 A 1.5 1.5 0 0 0 -3 0 Z" fill="#CD2E3A"/>
      <path d="M -3 0 A 1.5 1.5 0 0 0 0 1.5 A 1.5 1.5 0 0 1 3 0 A 1.5 1.5 0 0 0 0 -1.5 A 1.5 1.5 0 0 1 -3 0 Z" fill="#0047A0"/>
      
      <!-- 음양의 작은 원 -->
      <circle cx="0" cy="-1.5" r="0.75" fill="#0047A0"/>
      <circle cx="0" cy="1.5" r="0.75" fill="#CD2E3A"/>
    </g>
    
    <!-- 4괘 -->
    <!-- 건(乾) - 오른쪽 위 (3개의 연속된 선) -->
    <g transform="translate(17, 7) rotate(55)">
      <rect x="-2" y="-1" width="4" height="0.4" fill="black"/>
      <rect x="-2" y="-0.2" width="4" height="0.4" fill="black"/>
      <rect x="-2" y="0.6" width="4" height="0.4" fill="black"/>
    </g>
    
    <!-- 곤(坤) - 왼쪽 아래 (3개의 끊어진 선) -->
    <g transform="translate(7, 17) rotate(55)">
      <rect x="-2" y="-1" width="1.6" height="0.4" fill="black"/>
      <rect x="0.4" y="-1" width="1.6" height="0.4" fill="black"/>
      <rect x="-2" y="-0.2" width="1.6" height="0.4" fill="black"/>
      <rect x="0.4" y="-0.2" width="1.6" height="0.4" fill="black"/>
      <rect x="-2" y="0.6" width="1.6" height="0.4" fill="black"/>
      <rect x="0.4" y="0.6" width="1.6" height="0.4" fill="black"/>
    </g>
    
    <!-- 감(坎) - 왼쪽 위 (가운데가 끊어진 선) -->
    <g transform="translate(7, 7) rotate(-55)">
      <rect x="-2" y="-1" width="4" height="0.4" fill="black"/>
      <rect x="-2" y="-0.2" width="1.6" height="0.4" fill="black"/>
      <rect x="0.4" y="-0.2" width="1.6" height="0.4" fill="black"/>
      <rect x="-2" y="0.6" width="4" height="0.4" fill="black"/>
    </g>
    
    <!-- 리(離) - 오른쪽 아래 (위아래가 끊어진 선) -->
    <g transform="translate(17, 17) rotate(-55)">
      <rect x="-2" y="-1" width="1.6" height="0.4" fill="black"/>
      <rect x="0.4" y="-1" width="1.6" height="0.4" fill="black"/>
      <rect x="-2" y="-0.2" width="4" height="0.4" fill="black"/>
      <rect x="-2" y="0.6" width="1.6" height="0.4" fill="black"/>
      <rect x="0.4" y="0.6" width="1.6" height="0.4" fill="black"/>
    </g>
  </svg>
</template>

<script setup lang="ts">
interface Props {
  size?: number | string
}

withDefaults(defineProps<Props>(), {
  size: 24
})
</script>

<style scoped>
.flag-icon {
  border-radius: 2px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>