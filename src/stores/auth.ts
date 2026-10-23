import { defineStore } from 'pinia'

export interface AuthUser {
  id: string
  name: string
  email: string
  avatar: string
  provider: 'password' | 'google' | 'github'
  admin: boolean
}

interface AuthResponse {
  user: AuthUser | null
  providers?: {
    google: boolean
    github: boolean
  }
}

async function authFetch(path: string, body: unknown) {
  const response = await fetch(path, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-made-site': '1',
    },
    body: JSON.stringify(body),
  })
  const data = (await response.json().catch(() => ({}))) as { error?: string; user?: AuthUser }
  return { ok: response.ok, status: response.status, ...data }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as AuthUser | null,
    ready: false,
    providers: {
      google: false,
      github: false,
    },
  }),

  actions: {
    async load() {
      try {
        const response = await fetch('/api/auth/session')
        if (!response.ok) throw new Error('session')
        const data = (await response.json()) as AuthResponse
        this.user = data.user
        if (data.providers) this.providers = data.providers
      } catch {
        this.user = null
      } finally {
        this.ready = true
      }
    },

    async register(name: string, email: string, password: string) {
      const result = await authFetch('/api/auth/register', { name, email, password })
      if (result.ok && result.user) this.user = result.user
      return result
    },

    async login(email: string, password: string) {
      const result = await authFetch('/api/auth/login', { email, password })
      if (result.ok && result.user) this.user = result.user
      return result
    },

    async updateProfile(body: {
      name: string
      email?: string
      avatar?: string
      currentPassword?: string
      newPassword?: string
    }) {
      const result = await authFetch('/api/auth/profile', body)
      if (result.ok && result.user) this.user = result.user
      return result
    },

    async logout() {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'x-made-site': '1' },
      }).catch(() => undefined)
      this.user = null
    },
  },
})
