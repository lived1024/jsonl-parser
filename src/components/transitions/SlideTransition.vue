<template>
  <Transition
    :name="transitionName"
    :appear="appear"
    @enter="onEnter"
    @leave="onLeave"
  >
    <slot />
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  direction?: 'up' | 'down' | 'left' | 'right'
  duration?: number
  appear?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  direction: 'up',
  duration: 300,
  appear: false
})

const transitionName = computed(() => `slide-${props.direction}`)

const onEnter = (el: Element) => {
  const element = el as HTMLElement
  element.style.transitionDuration = `${props.duration}ms`
}

const onLeave = (el: Element) => {
  const element = el as HTMLElement
  element.style.transitionDuration = `${props.duration}ms`
}
</script>

<style scoped>
/* Slide Up */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all var(--transition-normal) ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Slide Down */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all var(--transition-normal) ease;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* Slide Left */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all var(--transition-normal) ease;
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* Slide Right */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all var(--transition-normal) ease;
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>