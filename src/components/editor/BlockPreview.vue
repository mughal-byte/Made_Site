<script setup lang="ts">
import { computed, ref } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import type { EditorElement } from '../../stores/editor'

const props = defineProps<{
  element: EditorElement
}>()

const tab = ref(0)
const checked = ref(false)
const menuOpen = ref(false)
const dialogOpen = ref(false)
const slide = ref(0)

const links = ['Home', 'About', 'Work', 'Contact']
const tabLabels = ['Overview', 'Details', 'Notes']
const menuOptions = ['First choice', 'Second choice', 'Third choice']

const slides = computed(() => {
  const extra = (props.element.note ?? '').split('\n').map((line) => line.trim()).filter(Boolean)
  if (extra.length > 0) return [props.element.text, ...extra].slice(0, 3)
  return [props.element.text, 'Second highlight', 'Third highlight']
})

const gridCells = computed(() => {
  const cells = props.element.text.split('·').map((part) => part.trim()).filter(Boolean)
  if (cells.length >= 2) return cells.slice(0, 3)
  return [props.element.text, 'Item 2', 'Item 3']
})

const heroCopy = computed(() => {
  const lines = (props.element.note ?? '').split('\n').map((line) => line.trim()).filter(Boolean)
  return {
    line: lines[0] || 'A short line under the headline.',
    action: lines[1] || 'Get started',
  }
})

const surface = computed(() => ({
  backgroundColor: props.element.backgroundColor,
  color: props.element.color,
  borderRadius: `${props.element.borderRadius}px`,
  fontSize: `${props.element.fontSize}px`,
  textAlign: props.element.textAlign,
}))

const designClass = computed(() => {
  const design = props.element.design
  if (design === 'heading-label') return 'uppercase tracking-[0.16em]'
  if (design === 'heading-display') return 'tracking-tight'
  if (design === 'heading-rule') return 'border-b-2 border-current pb-1'
  if (design === 'text-quote') return 'border-l-4 pl-4 italic'
  if (design === 'text-note') return 'rounded-xl px-4 py-3'
  if (design === 'button-outline') return 'border-2 border-current'
  return ''
})

function shiftSlide(step: number) {
  const count = slides.value.length
  slide.value = (slide.value + step + count) % count
}
</script>

<template>
  <h2
    v-if="element.type === 'heading'"
    class="w-full min-w-0 break-words font-semibold leading-tight"
    :class="designClass"
    :style="{ color: element.color, fontSize: `${element.fontSize}px` }"
  >
    {{ element.text }}
  </h2>

  <p
    v-else-if="element.type === 'paragraph'"
    class="w-full min-w-0 break-words leading-7"
    :class="designClass"
    :style="{
      color: element.color,
      fontSize: `${element.fontSize}px`,
      backgroundColor: element.backgroundColor,
      borderColor: element.design === 'text-quote' ? 'var(--page-accent)' : undefined,
    }"
  >
    {{ element.text }}
  </p>

  <span
    v-else-if="element.type === 'button'"
    class="flex h-full min-h-full w-full min-w-0 flex-1 items-center px-5 py-2.5 font-semibold"
    :class="designClass"
    :style="{
      ...surface,
      justifyContent:
        element.textAlign === 'left' ? 'flex-start' : element.textAlign === 'right' ? 'flex-end' : 'center',
    }"
  >
    <span class="w-full min-w-0 break-words">{{ element.text }}</span>
  </span>

  <div
    v-else-if="element.type === 'card'"
    class="flex h-full min-h-full w-full flex-1 flex-col justify-center gap-2 px-4 py-3"
    :style="surface"
  >
    <strong class="leading-tight">{{ element.text }}</strong>
    <p class="text-sm leading-6 opacity-75">{{ element.note || 'Supporting detail for this card.' }}</p>
  </div>

  <div
    v-else-if="element.type === 'header' || element.type === 'navbar'"
    class="flex h-full min-h-full w-full flex-1 items-center justify-between gap-3 px-4"
    :style="surface"
  >
    <strong class="truncate">{{ element.text }}</strong>
    <nav class="flex shrink-0 gap-3 text-xs font-medium opacity-80 sm:text-sm">
      <span v-for="link in links" :key="link">{{ link }}</span>
    </nav>
  </div>

  <div
    v-else-if="element.type === 'footer'"
    class="flex h-full min-h-full w-full flex-1 flex-col justify-center gap-2 px-4 py-3"
    :style="surface"
  >
    <strong>{{ element.text }}</strong>
    <div class="flex flex-wrap gap-3 text-xs opacity-70">
      <span v-for="link in links" :key="link">{{ link }}</span>
    </div>
  </div>

  <div
    v-else-if="element.type === 'hero'"
    class="flex h-full min-h-full w-full flex-1 flex-col justify-center gap-3 px-6 py-6"
    :style="{
      ...surface,
      alignItems: element.textAlign === 'left' ? 'flex-start' : element.textAlign === 'right' ? 'flex-end' : 'center',
    }"
  >
    <p class="text-xs font-semibold uppercase tracking-[0.16em] opacity-70">Welcome</p>
    <strong class="max-w-xl leading-tight">{{ element.text }}</strong>
    <p class="max-w-md text-sm leading-6 opacity-80">{{ heroCopy.line }}</p>
    <span
      class="rounded-full px-4 py-2 text-sm font-semibold"
      :style="{ backgroundColor: 'var(--page-on-accent)', color: 'var(--page-accent)' }"
    >
      {{ heroCopy.action }}
    </span>
  </div>

  <div
    v-else-if="element.type === 'slider'"
    class="flex h-full min-h-full w-full flex-1 flex-col justify-between px-5 py-4"
    :style="surface"
  >
    <p class="text-xs font-semibold uppercase tracking-[0.14em] opacity-70">Slide {{ slide + 1 }}</p>
    <strong class="leading-tight">{{ slides[slide] }}</strong>
    <div class="flex items-center justify-between gap-3 text-xs font-semibold">
      <button
        type="button"
        class="rounded-md px-2 py-1"
        :style="{ backgroundColor: 'color-mix(in srgb, var(--page-on-accent) 22%, transparent)', color: 'var(--page-on-accent)' }"
        @click.stop="shiftSlide(-1)"
      >
        Prev
      </button>
      <span class="flex gap-1">
        <span
          v-for="(_, index) in slides"
          :key="index"
          class="size-1.5 rounded-full"
          :style="{ backgroundColor: index === slide ? 'var(--page-on-accent)' : 'color-mix(in srgb, var(--page-on-accent) 40%, transparent)' }"
        ></span>
      </span>
      <button
        type="button"
        class="rounded-md px-2 py-1"
        :style="{ backgroundColor: 'color-mix(in srgb, var(--page-on-accent) 22%, transparent)', color: 'var(--page-on-accent)' }"
        @click.stop="shiftSlide(1)"
      >
        Next
      </button>
    </div>
  </div>

  <div v-else-if="element.type === 'sidebar'" class="flex h-full min-h-full w-full flex-1 flex-col gap-1 p-3" :style="surface">
    <strong class="px-2 py-1">{{ element.text }}</strong>
    <span v-for="link in links" :key="link" class="rounded-md px-2 py-1.5 text-sm opacity-80">{{ link }}</span>
  </div>

  <div v-else-if="element.type === 'grid'" class="grid h-full min-h-full w-full flex-1 grid-cols-3 gap-2">
    <div
      v-for="(cell, index) in gridCells"
      :key="index"
      class="flex items-center justify-center px-2 text-center text-sm font-semibold"
      :style="surface"
    >
      {{ cell }}
    </div>
  </div>

  <div v-else-if="element.type === 'tabs'" class="flex h-full min-h-full w-full flex-1 flex-col overflow-hidden" :style="surface">
    <div class="flex gap-1 border-b px-2 pt-2" :style="{ borderColor: 'var(--page-muted)' }">
      <button
        v-for="(label, index) in tabLabels"
        :key="label"
        type="button"
        class="rounded-t-md px-3 py-1.5 text-xs font-semibold"
        :class="tab === index ? '' : 'opacity-70'"
        :style="tab === index ? { backgroundColor: 'var(--page-accent)', color: 'var(--page-on-accent)' } : undefined"
        @click.stop="tab = index"
      >
        {{ label }}
      </button>
    </div>
    <p class="flex flex-1 items-center px-4 text-sm leading-6">
      {{ tab === 0 ? element.text : `${tabLabels[tab]} panel` }}
    </p>
  </div>

  <div
    v-else-if="element.type === 'form'"
    class="flex h-full min-h-full w-full flex-1 flex-col justify-center gap-2 px-4 py-3"
    :style="{ color: element.color, textAlign: 'left', fontSize: `${element.fontSize}px` }"
  >
    <p v-if="element.note" class="text-sm leading-6">{{ element.note }}</p>
    <label class="text-xs font-medium">Name</label>
    <div
      class="rounded-md border px-3 py-2 text-sm"
      :style="{ backgroundColor: 'var(--page-surface)', borderColor: 'var(--page-muted)', color: 'var(--page-muted)' }"
    >
      Your name
    </div>
    <label class="text-xs font-medium">Email</label>
    <div
      class="rounded-md border px-3 py-2 text-sm"
      :style="{ backgroundColor: 'var(--page-surface)', borderColor: 'var(--page-muted)', color: 'var(--page-muted)' }"
    >
      you@email.com
    </div>
    <span
      class="mt-1 rounded-md px-3 py-2 text-center text-sm font-semibold"
      :style="{ backgroundColor: element.backgroundColor, borderRadius: `${element.borderRadius}px`, color: 'var(--page-on-accent)' }"
    >
      {{ element.text }}
    </span>
  </div>

  <div v-else-if="element.type === 'dropdown'" class="h-full min-h-full w-full flex-1" :style="{ fontSize: `${element.fontSize}px` }">
    <button
      type="button"
      class="flex h-full w-full items-center justify-between gap-2 border px-3 text-left"
      :style="{ ...surface, borderColor: 'var(--page-muted)' }"
      @click.stop="menuOpen = !menuOpen"
    >
      <span class="truncate">{{ element.text }}</span>
      <ChevronDown class="size-4 shrink-0" />
    </button>
    <div
      v-if="menuOpen"
      class="mt-1 overflow-hidden rounded-md border shadow"
      :style="{ backgroundColor: 'var(--page-surface)', color: 'var(--page-text)', borderColor: 'var(--page-muted)' }"
    >
      <button
        v-for="option in menuOptions"
        :key="option"
        type="button"
        class="block w-full px-3 py-2 text-left text-sm hover:opacity-70"
        @click.stop="menuOpen = false"
      >
        {{ option }}
      </button>
    </div>
  </div>

  <label
    v-else-if="element.type === 'checkbox'"
    class="flex h-full min-h-full w-full flex-1 items-center gap-2"
    :style="{ color: element.color, fontSize: `${element.fontSize}px`, justifyContent: element.textAlign === 'center' ? 'center' : element.textAlign === 'right' ? 'flex-end' : 'flex-start' }"
  >
    <input v-model="checked" type="checkbox" class="size-4" style="accent-color: var(--page-accent)" @click.stop />
    <span>{{ element.text }}</span>
  </label>

  <div
    v-else-if="element.type === 'modal'"
    class="flex h-full min-h-full w-full flex-1 items-center justify-center px-4"
    :style="{
      borderRadius: `${element.borderRadius}px`,
      backgroundColor: 'color-mix(in srgb, var(--page-text) 28%, transparent)',
    }"
  >
    <button
      v-if="!dialogOpen"
      type="button"
      class="rounded-md px-4 py-2 text-sm font-semibold"
      :style="{ backgroundColor: element.backgroundColor, color: element.color }"
      @click.stop="dialogOpen = true"
    >
      {{ element.text }}
    </button>
    <div
      v-else
      class="w-full max-w-sm rounded-xl p-4 text-left shadow-lg"
      :style="{ backgroundColor: 'var(--page-surface)', color: 'var(--page-text)' }"
      @click.stop
    >
      <p class="font-semibold">{{ element.text }}</p>
      <p class="mt-1 text-sm leading-6" :style="{ color: 'var(--page-muted)' }">This dialog stays inside the block.</p>
      <button type="button" class="mt-3 text-sm font-semibold" :style="{ color: 'var(--page-accent)' }" @click.stop="dialogOpen = false">
        Close
      </button>
    </div>
  </div>

  <div v-else-if="element.type === 'popup'" class="flex h-full min-h-full w-full flex-1 items-center">
    <div class="w-full px-4 py-3 shadow-md" :style="surface">
      <p class="font-semibold leading-5">{{ element.text }}</p>
      <p class="mt-1 text-xs opacity-70">A small notice on the page.</p>
    </div>
  </div>

  <div
    v-else
    class="flex h-full min-h-full w-full flex-1 items-center justify-center gap-3"
    :style="{ color: element.color, fontSize: `${element.fontSize}px` }"
  >
    <span class="size-6 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
    <span class="font-medium">{{ element.text }}</span>
  </div>
</template>
