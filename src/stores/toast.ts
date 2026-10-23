import { defineStore } from 'pinia'

export type ToastTone = 'info' | 'success' | 'error'

export interface Toast {
  id: string
  tone: ToastTone
  title: string
  body?: string
  duration: number
}

interface ToastOptions {
  tone?: ToastTone
  body?: string
  duration?: number
}

const timers = new Map<string, ReturnType<typeof setTimeout>>()

const defaultDurations: Record<ToastTone, number> = {
  info: 3000,
  success: 3000,
  error: 3000,
}

export const useToastStore = defineStore('toast', {
  state: () => ({
    toasts: [] as Toast[],
  }),

  actions: {
    show(title: string, options: ToastOptions = {}) {
      const tone = options.tone ?? 'info'
      const duration = options.duration ?? defaultDurations[tone]

      const duplicate = this.toasts.find(
        (toast) => toast.title === title && toast.tone === tone,
      )
      if (duplicate) this.dismiss(duplicate.id)

      const toast: Toast = {
        id: crypto.randomUUID(),
        tone,
        title,
        body: options.body,
        duration,
      }

      this.toasts.push(toast)
      this.startTimer(toast.id, duration)
      return toast.id
    },

    info(title: string, body?: string) {
      return this.show(title, { tone: 'info', body })
    },

    success(title: string, body?: string) {
      return this.show(title, { tone: 'success', body })
    },

    error(title: string, body?: string) {
      return this.show(title, { tone: 'error', body })
    },

    startTimer(id: string, duration: number) {
      const existing = timers.get(id)
      if (existing) clearTimeout(existing)

      timers.set(
        id,
        setTimeout(() => this.dismiss(id), duration),
      )
    },

    pause(id: string) {
      const existing = timers.get(id)
      if (!existing) return

      clearTimeout(existing)
      timers.delete(id)
    },

    resume(id: string) {
      const toast = this.toasts.find((item) => item.id === id)
      if (!toast) return

      this.startTimer(id, toast.duration)
    },

    dismiss(id: string) {
      const existing = timers.get(id)
      if (existing) clearTimeout(existing)
      timers.delete(id)

      this.toasts = this.toasts.filter((toast) => toast.id !== id)
    },

    clear() {
      for (const timer of timers.values()) clearTimeout(timer)
      timers.clear()
      this.toasts = []
    },
  },
})
