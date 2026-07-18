<template>
  <DefaultLayout>
    <div class="content-page">
      <div class="content-page-inner">
        <header>
          <h2>{{ c.title }}</h2>
          <p>{{ c.intro }}</p>
        </header>
        <DataTypeGuide />
        <PerformanceTips />
        <TroubleshootingGuide />
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import DefaultLayout from '../layouts/DefaultLayout.vue'
import DataTypeGuide from '../components/common/DataTypeGuide.vue'
import PerformanceTips from '../components/common/PerformanceTips.vue'
import TroubleshootingGuide from '../components/common/TroubleshootingGuide.vue'
import { useI18n } from '../composables/useI18n'

const { currentLanguage } = useI18n()

const content = {
  ko: {
    title: 'JSON / JSONL 사용 가이드',
    intro:
      'JSON과 JSONL 데이터를 다루는 데 필요한 핵심 지식을 정리했습니다. 데이터 타입의 이해부터 대용량 데이터 처리 팁, 자주 발생하는 문제의 해결 방법까지 단계별로 안내합니다.'
  },
  en: {
    title: 'JSON / JSONL User Guide',
    intro:
      'Everything you need to work with JSON and JSONL data: understanding data types, tips for handling large datasets, and solutions to common problems.'
  }
}

const c = computed(() => content[currentLanguage.value])
</script>
