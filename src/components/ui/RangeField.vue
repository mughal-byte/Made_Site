<script setup lang="ts">
withDefaults(
  defineProps<{
    id: string
    label: string
    modelValue: number
    min: number
    max: number
    minLabel: string
    maxLabel: string
    unit?: string
  }>(),
  { unit: 'px' },
)

const emit = defineEmits<{
  input: [value: number]
  change: []
}>()

function onInput(event: Event) {
  emit('input', Number((event.target as HTMLInputElement).value))
}
</script>

<template>
  <div>
    <div class="mb-2 flex items-baseline justify-between gap-3">
      <label :for="id" class="text-sm text-slate-400">{{ label }}</label>
      <span class="text-xs tabular-nums text-slate-300">{{ modelValue }}{{ unit }}</span>
    </div>

    <input
      :id="id"
      type="range"
      :min="min"
      :max="max"
      step="1"
      :value="modelValue"
      class="h-2 w-full cursor-pointer accent-violet-500"
      @input="onInput"
      @change="emit('change')"
    />

    <div class="mt-1.5 flex justify-between text-[11px] text-slate-500">
      <span>{{ minLabel }}</span>
      <span>{{ maxLabel }}</span>
    </div>
  </div>
</template>
