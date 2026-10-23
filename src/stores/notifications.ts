import { defineStore } from 'pinia'

export type NotificationPermissionState = 'granted' | 'denied' | 'default' | 'unsupported'

export interface SentNotification {
  id: string
  title: string
  body: string
  at: string
}

interface StoredSettings {
  enabled: boolean
  granted: boolean
}

const storageKey = 'made-site-notifications'

function browserSupported() {
  return typeof window !== 'undefined' && 'Notification' in window
}

function readSettings(userId: string): StoredSettings {
  if (!userId) return { enabled: false, granted: false }

  try {
    const raw = localStorage.getItem(`${storageKey}:${userId}`)
    if (!raw) return { enabled: false, granted: false }

    const parsed = JSON.parse(raw) as Partial<StoredSettings>
    return { enabled: parsed.enabled === true, granted: parsed.granted === true }
  } catch {
    return { enabled: false, granted: false }
  }
}

function writeSettings(userId: string, settings: StoredSettings) {
  if (!userId) return

  try {
    localStorage.setItem(`${storageKey}:${userId}`, JSON.stringify(settings))
  } catch {
    // storage can be unavailable in private browsing
  }
}

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    userId: '',
    enabled: false,
    permission: 'default' as NotificationPermissionState,
    recent: [] as SentNotification[],
  }),

  getters: {
    supported: (state) => state.permission !== 'unsupported',
    active: (state) => state.enabled && state.permission === 'granted',
  },

  actions: {
    useUser(userId: string) {
      if (this.userId === userId) return

      this.userId = userId
      const settings = readSettings(userId)
      this.enabled = settings.enabled
      this.recent = []
      this.syncPermission(settings.granted)
    },

    syncPermission(rememberedGrant?: boolean) {
      if (!browserSupported()) {
        this.permission = 'unsupported'
        return
      }

      const granted =
        rememberedGrant ?? readSettings(this.userId).granted
      const current = Notification.permission as NotificationPermissionState

      if (current === 'granted') {
        this.permission = 'granted'
        return
      }

      if (current === 'default') {
        this.permission = 'default'
        return
      }

      // Some browsers report 'denied' even while a request still succeeds, so an
      // earlier explicit grant is kept instead of locking the switch off.
      this.permission = granted ? 'granted' : 'denied'
    },

    async enable(): Promise<{ ok: boolean; error?: string }> {
      if (!browserSupported()) {
        this.permission = 'unsupported'
        return { ok: false, error: 'This browser cannot show system notifications.' }
      }

      let result: NotificationPermission = 'default'

      try {
        result = await Notification.requestPermission()
      } catch {
        result = 'denied'
      }

      this.permission = result as NotificationPermissionState

      if (this.permission !== 'granted') {
        this.enabled = false
        writeSettings(this.userId, { enabled: false, granted: false })
        return {
          ok: false,
          error:
            'This browser is blocking notifications. Allow them for this site in the address bar, then turn the switch on again.',
        }
      }

      this.enabled = true
      writeSettings(this.userId, { enabled: true, granted: true })
      this.notify('Notifications are on', 'Made Site will now show alerts on this device.')
      return { ok: true }
    },

    disable() {
      this.enabled = false
      writeSettings(this.userId, { enabled: false, granted: readSettings(this.userId).granted })
    },

    async toggle(): Promise<{ ok: boolean; error?: string }> {
      if (this.enabled) {
        this.disable()
        return { ok: true }
      }

      return this.enable()
    },

    notify(title: string, body = ''): boolean {
      if (!this.active || !browserSupported()) return false

      try {
        const notification = new Notification(title, {
          body,
          icon: '/logo.png',
          tag: `${this.userId}:${title}`,
        })

        notification.onclick = () => {
          window.focus()
          notification.close()
        }

        this.recent.unshift({
          id: crypto.randomUUID(),
          title,
          body,
          at: new Date().toISOString(),
        })
        if (this.recent.length > 5) this.recent.pop()

        return true
      } catch {
        return false
      }
    },
  },
})
