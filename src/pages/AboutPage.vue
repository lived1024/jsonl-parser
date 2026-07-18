<template>
  <DefaultLayout>
    <div class="content-page">
      <div class="content-page-inner">
        <header>
          <h2>{{ c.title }}</h2>
        </header>
        <section v-for="section in c.sections" :key="section.heading">
          <h3>{{ section.heading }}</h3>
          <p v-for="paragraph in section.paragraphs" :key="paragraph">{{ paragraph }}</p>
        </section>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import DefaultLayout from '../layouts/DefaultLayout.vue'
import { useI18n } from '../composables/useI18n'

const { currentLanguage } = useI18n()

const content = {
  ko: {
    title: 'JSONL Parser 소개',
    sections: [
      {
        heading: '이 서비스는 무엇인가요?',
        paragraphs: [
          'JSONL Parser는 JSON과 JSONL(JSON Lines) 데이터를 대화형 트리 구조로 시각화하는 무료 웹 도구입니다. 복잡하게 중첩된 JSON 데이터를 한눈에 파악하고, 노드를 펼치고 접으며 탐색할 수 있습니다.',
          'API 응답 디버깅, 로그 파일 분석, 머신러닝 학습 데이터 검토 등 JSON 데이터를 다루는 모든 개발 작업에 활용할 수 있습니다.'
        ]
      },
      {
        heading: '주요 기능',
        paragraphs: [
          '입력과 동시에 실시간으로 파싱되며, 오류가 있으면 줄과 열 위치까지 알려줍니다. JSONL 형식을 자동으로 감지하고, 대용량 데이터는 지연 로딩으로 처리하여 1,000개 이상의 노드도 원활하게 표시합니다.',
          '입력한 데이터는 브라우저의 로컬 저장소에 자동 저장되어 새로고침 후에도 유지되며, 키보드만으로도 모든 기능을 사용할 수 있도록 접근성을 고려해 설계되었습니다.'
        ]
      },
      {
        heading: '데이터는 안전한가요?',
        paragraphs: [
          '입력한 모든 데이터는 사용자의 브라우저 안에서만 처리됩니다. 어떤 데이터도 서버로 전송되거나 외부에 저장되지 않으므로 민감한 데이터도 안심하고 사용할 수 있습니다.'
        ]
      },
      {
        heading: '문의',
        paragraphs: [
          '버그 제보, 기능 제안 등 모든 문의는 lived1024@taxai.co.kr로 보내주세요.'
        ]
      }
    ]
  },
  en: {
    title: 'About JSONL Parser',
    sections: [
      {
        heading: 'What is this service?',
        paragraphs: [
          'JSONL Parser is a free web tool that visualizes JSON and JSONL (JSON Lines) data as an interactive tree. It helps you understand deeply nested JSON at a glance, expanding and collapsing nodes as you explore.',
          'It is useful for any development task involving JSON data: debugging API responses, analyzing log files, or reviewing machine learning training data.'
        ]
      },
      {
        heading: 'Key features',
        paragraphs: [
          'Data is parsed in real time as you type, with error messages pinpointing the exact line and column. JSONL format is detected automatically, and large datasets are rendered with lazy loading so trees with more than 1,000 nodes stay smooth.',
          'Your input is saved automatically to browser local storage and survives page reloads. The interface is designed for accessibility and can be fully operated with a keyboard.'
        ]
      },
      {
        heading: 'Is my data safe?',
        paragraphs: [
          'All data you enter is processed entirely inside your browser. Nothing is sent to a server or stored externally, so you can safely work with sensitive data.'
        ]
      },
      {
        heading: 'Contact',
        paragraphs: [
          'For bug reports, feature requests, or any other inquiries, please email lived1024@taxai.co.kr.'
        ]
      }
    ]
  }
}

const c = computed(() => content[currentLanguage.value])
</script>
