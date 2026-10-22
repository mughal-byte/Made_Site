import { defineStore } from 'pinia'

export interface Project {
  id: string
  name: string
  type: string
  status: 'Draft' | 'Published'
  createdAt: string
}

export const projectTypes = [
  {
    name: 'Business Website',
    summary: 'Services, an introduction, and a way to get in touch.',
  },
  {
    name: 'Online Store',
    summary: 'A product-led page for a small shop.',
  },
  {
    name: 'Portfolio',
    summary: 'Selected work with a short introduction.',
  },
  {
    name: 'Blog',
    summary: 'A writing-first page with room for articles.',
  },
  {
    name: 'Landing Page',
    summary: 'One page built around a single offer.',
  },
  {
    name: 'Restaurant Website',
    summary: 'Menu, location, and a reservation prompt.',
  },
] as const

function scopedItem(key: string, userId: string) {
  const own = localStorage.getItem(`${key}:${userId}`)
  if (own) return own

  const owner = localStorage.getItem(`${key}:owner`)
  const legacy = localStorage.getItem(key)
  if (!owner && legacy) {
    localStorage.setItem(`${key}:${userId}`, legacy)
    localStorage.setItem(`${key}:owner`, userId)
    return legacy
  }

  return null
}

function loadProjects(userId: string): Project[] {
  if (!userId) return []

  try {
    const saved = scopedItem('made-site-projects', userId)
    return saved ? (JSON.parse(saved) as Project[]) : []
  } catch {
    return []
  }
}

export const useProjectsStore = defineStore('projects', {
  state: () => ({
    userId: '',
    projects: [] as Project[],
  }),

  actions: {
    useUser(userId: string) {
      if (this.userId === userId) return
      this.userId = userId
      this.projects = loadProjects(userId)
    },

    createProject(name: string, type: string) {
      const project: Project = {
        id: crypto.randomUUID(),
        name: name.trim(),
        type,
        status: 'Draft',
        createdAt: new Date().toISOString(),
      }

      this.projects.unshift(project)
      this.saveProjects()
      return project
    },

    clearProjects() {
      this.projects = []
      this.saveProjects()
    },

    saveProjects() {
      if (!this.userId) return
      localStorage.setItem(`made-site-projects:${this.userId}`, JSON.stringify(this.projects))
    },
  },
})
