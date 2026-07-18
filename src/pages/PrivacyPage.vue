<template>
  <DefaultLayout>
    <div class="content-page">
      <div class="content-page-inner">
        <header>
          <h2>{{ c.title }}</h2>
          <p>{{ c.updated }}</p>
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
    title: '개인정보처리방침',
    updated: '최종 수정일: 2026년 7월 18일',
    sections: [
      {
        heading: '1. 개요',
        paragraphs: [
          'JSONL Parser(이하 "본 서비스")는 사용자의 개인정보를 소중히 여기며, 관련 법령을 준수합니다. 본 방침은 본 서비스가 어떤 정보를 수집하고 어떻게 사용하는지 설명합니다.'
        ]
      },
      {
        heading: '2. 입력 데이터의 처리',
        paragraphs: [
          '사용자가 본 서비스에 입력하는 JSON/JSONL 데이터는 전적으로 사용자의 브라우저 내에서만 처리됩니다. 입력 데이터는 서버로 전송되지 않으며, 운영자를 포함한 제3자가 열람할 수 없습니다.',
          '편의 기능을 위해 입력 데이터와 설정(언어, 패널 크기 등)이 브라우저의 로컬 저장소(localStorage)에 저장될 수 있습니다. 이 정보는 사용자의 기기에만 존재하며 브라우저 데이터 삭제 시 함께 제거됩니다.'
        ]
      },
      {
        heading: '3. 웹 분석 도구 (Google Analytics)',
        paragraphs: [
          '본 서비스는 이용 현황 파악을 위해 Google Analytics를 사용합니다. Google Analytics는 쿠키를 통해 방문 페이지, 사용 시간, 기기 유형 등 비식별 정보를 수집합니다. 수집된 정보는 서비스 개선 목적으로만 사용됩니다.',
          '쿠키 수집을 원하지 않는 경우 브라우저 설정에서 쿠키를 차단하거나 Google Analytics 차단 브라우저 확장 프로그램을 사용할 수 있습니다.'
        ]
      },
      {
        heading: '4. 광고 (Google AdSense)',
        paragraphs: [
          '본 서비스는 무료 운영을 위해 Google AdSense 광고를 게재할 수 있습니다. Google을 포함한 제3자 광고 사업자는 쿠키를 사용하여 사용자의 이전 방문 기록을 기반으로 한 맞춤 광고를 제공할 수 있습니다.',
          '사용자는 Google 광고 설정(https://adssettings.google.com)에서 맞춤 광고를 비활성화할 수 있습니다.'
        ]
      },
      {
        heading: '5. 문의',
        paragraphs: [
          '본 방침에 대한 문의는 lived1024@taxai.co.kr로 연락해 주세요.'
        ]
      }
    ]
  },
  en: {
    title: 'Privacy Policy',
    updated: 'Last updated: July 18, 2026',
    sections: [
      {
        heading: '1. Overview',
        paragraphs: [
          'JSONL Parser ("the Service") values your privacy and complies with applicable laws. This policy explains what information the Service collects and how it is used.'
        ]
      },
      {
        heading: '2. How your input data is handled',
        paragraphs: [
          'Any JSON/JSONL data you enter into the Service is processed entirely within your browser. Your input is never sent to a server and cannot be accessed by anyone, including the operator.',
          'For convenience, your input and preferences (language, panel size, etc.) may be saved in your browser\'s local storage. This information exists only on your device and is removed when you clear your browser data.'
        ]
      },
      {
        heading: '3. Web analytics (Google Analytics)',
        paragraphs: [
          'The Service uses Google Analytics to understand usage patterns. Google Analytics uses cookies to collect non-identifying information such as pages visited, session duration, and device type. This information is used solely to improve the Service.',
          'If you prefer not to be tracked, you can block cookies in your browser settings or use a Google Analytics opt-out browser extension.'
        ]
      },
      {
        heading: '4. Advertising (Google AdSense)',
        paragraphs: [
          'The Service may display Google AdSense ads to support free operation. Third-party vendors, including Google, use cookies to serve personalized ads based on your prior visits.',
          'You can opt out of personalized advertising at Google Ads Settings (https://adssettings.google.com).'
        ]
      },
      {
        heading: '5. Contact',
        paragraphs: [
          'For questions about this policy, please contact lived1024@taxai.co.kr.'
        ]
      }
    ]
  }
}

const c = computed(() => content[currentLanguage.value])
</script>
