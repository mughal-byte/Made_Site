import { defineStore } from 'pinia'

export interface InboxItem {
  id: string
  title: string
  body: string
  link: string
  createdAt: string
  senderName: string
  read: boolean
}

const popupKey = 'made-site-inbox-popup'

function readPopupCleared(userId: string): number {
  if (!userId) return 0

  try {
    const raw = localStorage.getItem(`${popupKey}:${userId}`)
    const value = Number(raw)
    return Number.isFinite(value) ? value : 0
  } catch {
    return 0
  }
}

function writePopupCleared(userId: string, at: number) {
  if (!userId) return

  try {
    localStorage.setItem(`${popupKey}:${userId}`, String(at))
  } catch {
    // storage can be unavailable in private browsing
  }
}

export const useInboxStore = defineStore('inbox', {
  state: () => ({
    userId: '',
    items: [] as InboxItem[],
    popupClearedAt: 0,
    loading: false,
  }),

  getters: {
    unreadCount: (state) => state.items.filter((item) => !item.read).length,
    popupItems: (state) =>
      state.items
        .filter((item) => new Date(item.createdAt).getTime() > state.popupClearedAt)
        .slice(0, 4),
    latestItem: (state) => state.items[0] ?? null,
  },

  actions: {
    async load(userId: string) {
      this.userId = userId
      this.popupClearedAt = readPopupCleared(userId)

      if (!userId) {
        this.items = []
        return
      }

      await this.refresh()
    },

    async refresh() {
      if (!this.userId) return

      this.loading = true

      try {
        const response = await fetch('/api/notifications')
        if (!response.ok) return

        const data = (await response.json()) as { notifications?: InboxItem[] }
        this.items = data.notifications ?? []
      } catch {
        // keep the last known list when the request fails
      } finally {
        this.loading = false
      }
    },

    async push(title: string, body = '', link = '') {
      try {
        await fetch('/api/notifications', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-made-site': '1',
          },
          body: JSON.stringify({ title, body, link, target: 'self' }),
        })

        await this.refresh()
      } catch {
        // a failed notification should never break the action that caused it
      }
    },

    async clearPopup() {
      this.popupClearedAt = Date.now()
      writePopupCleared(this.userId, this.popupClearedAt)
    },

    async clearAll() {
      try {
        await fetch('/api/notifications/clear', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-made-site': '1',
          },
          body: JSON.stringify({}),
        })

        await this.refresh()
      } catch {
        // ignore
      }
    },

    async markRead(id: string) {
      const item = this.items.find((entry) => entry.id === id)
      if (item) item.read = true

      try {
        await fetch('/api/notifications/read', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-made-site': '1',
          },
          body: JSON.stringify({ id }),
        })
      } catch {
        // ignore
      }
    },

    async markAllRead() {
      for (const item of this.items) item.read = true

      try {
        await fetch('/api/notifications/read-all', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-made-site': '1',
          },
          body: JSON.stringify({}),
        })
      } catch {
        // ignore
      }
    },
  },
})
