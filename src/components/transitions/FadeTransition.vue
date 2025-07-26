<template>
  <Transition
    name="fade"
    appear
    @enter="onEnter"
    @leave="onLeave"
  >
    <slot />
  </Transition>
</template>

<script setup lang="ts">
interface Props {
  duration?: number
}

const props = withDefaults(defineProps<Props>(), {
  duration: 300
})

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
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-normal) ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>