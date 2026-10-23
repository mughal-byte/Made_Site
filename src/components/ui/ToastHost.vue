<script setup lang="ts">
import { CircleAlert, CircleCheck, Info, X } from 'lucide-vue-next'
import { useToastStore, type ToastTone } from '../../stores/toast'

const toasts = useToastStore()

const icons = {
  info: Info,
  success: CircleCheck,
  error: CircleAlert,
}

const cardTones: Record<ToastTone, string> = {
  info: 'border-violet-500/40',
  success: 'border-emerald-500/40',
  error: 'border-red-500/50',
}

const iconTones: Record<ToastTone, string> = {
  info: 'text-violet-300',
  success: 'text-emerald-300',
  error: 'text-red-300',
}
</script>

<template>
  <div
    class="pointer-events-none fixed inset-x-0 top-20 z-[100] flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:right-0 sm:items-end sm:p-5"
  >
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts.toasts"
        :key="toast.id"
        role="status"
        class="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border bg-slate-900/95 px-4 py-3 shadow-xl shadow-black/50 backdrop-blur"
        :class="cardTones[toast.tone]"
        @mouseenter="toasts.pause(toast.id)"
        @mouseleave="toasts.resume(toast.id)"
      >
        <component
          :is="icons[toast.tone]"
          class="mt-0.5 size-5 shrink-0"
          :class="iconTones[toast.tone]"
        />

        <div class="min-w-0 flex-1">
          <p class="text-sm font-semibold text-white">{{ toast.title }}</p>
          <p v-if="toast.body" class="mt-0.5 text-sm leading-5 text-slate-400">
            {{ toast.body }}
          </p>
        </div>

        <button
          type="button"
          class="shrink-0 rounded-md p-1 text-slate-500 transition hover:bg-slate-800 hover:text-slate-200"
          aria-label="Dismiss notification"
          @click="toasts.dismiss(toast.id)"
        >
          <X class="size-4" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 200ms ease,
    transform 200ms ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(-12px) scale(0.98);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}

.toast-move {
  transition: transform 220ms ease;
}
</style>
