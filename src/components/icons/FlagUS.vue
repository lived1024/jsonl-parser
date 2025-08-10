<template>
  <svg 
    :width="size" 
    :height="size" 
    viewBox="0 0 24 24" 
    fill="none"
    class="flag-icon"
  >
    <!-- 배경 (빨간색) -->
    <rect x="2" y="4" width="20" height="16" rx="2" fill="#B22234"/>
    
    <!-- 흰색 줄무늬 -->
    <rect x="2" y="5.5" width="20" height="1.2" fill="white"/>
    <rect x="2" y="8" width="20" height="1.2" fill="white"/>
    <rect x="2" y="10.5" width="20" height="1.2" fill="white"/>
    <rect x="2" y="13" width="20" height="1.2" fill="white"/>
    <rect x="2" y="15.5" width="20" height="1.2" fill="white"/>
    <rect x="2" y="18" width="20" height="1.2" fill="white"/>
    
    <!-- 파란색 사각형 (별 영역) -->
    <rect x="2" y="4" width="8" height="8" rx="2" fill="#3C3B6E"/>
    
    <!-- 별들 (간단하게) -->
    <g fill="white">
      <text x="6" y="8.5" text-anchor="middle" font-size="6" font-family="serif">★</text>
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