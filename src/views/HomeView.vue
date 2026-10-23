<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowUpRight, Plus } from 'lucide-vue-next'
import DashboardShell from '../components/layout/DashboardShell.vue'
import { useProjectsStore } from '../stores/projects'
import { useEditorStore } from '../stores/editor'
import { useNotificationsStore } from '../stores/notifications'
import { useToastStore } from '../stores/toast'
import { siteTemplates, templateTheme } from '../stores/templates'

const route = useRoute()
const router = useRouter()
const projectsStore = useProjectsStore()
const editorStore = useEditorStore()
const notifications = useNotificationsStore()
const toast = useToastStore()

const sections = ['dashboard', 'projects', 'templates', 'settings'] as const
type Section = (typeof sections)[number]

const section = computed<Section>(() => {
  const value = route.query.section
  return typeof value === 'string' && sections.includes(value as Section)
    ? (value as Section)
    : 'dashboard'
})

const pageCopy = computed(() => {
  switch (section.value) {
    case 'projects':
      return {
        kicker: 'Library',
        title: 'Projects',
        text: 'Open a website to continue editing it.',
      }
    case 'templates':
      return {
        kicker: 'Start',
        title: 'Templates',
        text: 'Open a finished page, then change the copy and colors.',
      }
    case 'settings':
      return {
        kicker: 'Workspace',
        title: 'Settings',
        text: 'These projects belong to your account. Another sign-in on this browser cannot open them.',
      }
    default:
      return {
        kicker: 'Workspace',
        title: 'Dashboard',
        text: 'Build and manage the websites saved to this account.',
      }
  }
})

const draftCount = computed(
  () => projectsStore.projects.filter((project) => project.status === 'Draft').length,
)
const publishedCount = computed(
  () => projectsStore.projects.filter((project) => project.status === 'Published').length,
)

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unknown date'

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

function initial(name: string) {
  return name.trim().charAt(0).toUpperCase() || 'M'
}

function useTemplate(id: string) {
  router.push({ path: '/projects/new', query: { template: id } })
}

function previewLine(note?: string) {
  return note?.split('\n')[0]?.trim() ?? ''
}

function previewCells(text: string) {
  const cells = text.split('·').map((part) => part.trim()).filter(Boolean)
  return cells.length >= 2 ? cells.slice(0, 3) : [text]
}

function clearWorkspace() {
  if (projectsStore.projects.length === 0) return

  const confirmed = window.confirm(
    'Delete every project in this account? This cannot be undone.',
  )
  if (!confirmed) return

  projectsStore.clearProjects()
  editorStore.clearPages()
  toast.success('Workspace cleared', 'Every project in this account was removed.')
  notifications.notify('Workspace cleared', 'Every project in this account was removed.')
}
</script>

<template>
  <DashboardShell :active="section">
    <header class="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="text-xs font-medium uppercase tracking-[0.14em] text-violet-300">
          {{ pageCopy.kicker }}
        </p>
        <h1 class="mt-2 text-3xl font-semibold tracking-tight text-white">
          {{ pageCopy.title }}
        </h1>
        <p class="mt-2 max-w-xl text-sm leading-6 text-slate-400">
          {{ pageCopy.text }}
        </p>
      </div>

      <button
        v-if="section !== 'settings'"
        type="button"
        class="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-500"
        @click="router.push('/projects/new')"
      >
        <Plus class="size-4" />
        Create website
      </button>
    </header>

    <section v-if="section === 'dashboard'" class="mb-8 grid gap-3 sm:grid-cols-3">
      <article class="rounded-xl border border-slate-800 bg-slate-900/70 px-5 py-4">
        <p class="text-sm text-slate-400">Projects</p>
        <p class="mt-2 text-2xl font-semibold tabular-nums text-white">
          {{ projectsStore.projects.length }}
        </p>
      </article>
      <article class="rounded-xl border border-slate-800 bg-slate-900/70 px-5 py-4">
        <p class="text-sm text-slate-400">Drafts</p>
        <p class="mt-2 text-2xl font-semibold tabular-nums text-white">
          {{ draftCount }}
        </p>
      </article>
      <article class="rounded-xl border border-slate-800 bg-slate-900/70 px-5 py-4">
        <p class="text-sm text-slate-400">Published</p>
        <p class="mt-2 text-2xl font-semibold tabular-nums text-white">
          {{ publishedCount }}
        </p>
      </article>
    </section>

    <section v-if="section === 'templates'">
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <button
          v-for="template in siteTemplates"
          :key="template.id"
          type="button"
          class="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 text-left transition hover:border-slate-700 hover:bg-slate-900"
          @click="useTemplate(template.id)"
        >
          <div
            class="h-52 overflow-hidden border-b border-black/10 p-3"
            :style="{ backgroundColor: templateTheme(template.themeId).background, color: templateTheme(template.themeId).text }"
          >
            <template v-for="(block, index) in template.blocks" :key="`${template.id}-${index}`">
              <div
                v-if="block.type === 'header' || block.type === 'navbar'"
                class="mb-1.5 flex items-center justify-between rounded px-2 py-1 text-[10px] font-medium"
                :style="{ backgroundColor: templateTheme(template.themeId).surface }"
              >
                <span>{{ block.text }}</span>
                <span class="opacity-70">About</span>
              </div>
              <div
                v-else-if="block.type === 'hero' || block.type === 'slider'"
                class="mb-1.5 rounded px-2 py-2"
                :style="{
                  backgroundColor: templateTheme(template.themeId).accent,
                  color: templateTheme(template.themeId).onAccent,
                }"
              >
                <p class="truncate text-[11px] font-semibold">{{ block.text }}</p>
                <p class="truncate text-[9px] opacity-80">{{ previewLine(block.note) }}</p>
              </div>
              <div
                v-else-if="block.type === 'grid'"
                class="mb-1.5 grid grid-cols-3 gap-1"
              >
                <span
                  v-for="cell in previewCells(block.text)"
                  :key="cell"
                  class="truncate rounded px-1 py-1 text-center text-[8px] font-medium"
                  :style="{ backgroundColor: templateTheme(template.themeId).surface }"
                >
                  {{ cell }}
                </span>
              </div>
              <div
                v-else-if="block.type === 'footer'"
                class="mb-1.5 rounded px-2 py-1 text-[9px] font-medium"
                :style="{
                  backgroundColor: templateTheme(template.themeId).text,
                  color: templateTheme(template.themeId).background,
                }"
              >
                {{ block.text }}
              </div>
              <div
                v-else-if="block.type === 'button' || block.type === 'form'"
                class="mb-1.5 w-2/5 rounded px-2 py-1 text-center text-[9px] font-semibold"
                :style="{
                  backgroundColor: templateTheme(template.themeId).accent,
                  color: templateTheme(template.themeId).onAccent,
                }"
              >
                {{ block.text }}
              </div>
              <p
                v-else-if="block.type === 'heading'"
                class="mb-1 truncate text-[11px] font-semibold"
              >
                {{ block.text }}
              </p>
              <p v-else-if="block.type === 'paragraph'" class="mb-1 truncate text-[9px] opacity-70">
                {{ block.text }}
              </p>
              <div
                v-else
                class="mb-1 truncate rounded px-2 py-1 text-[9px]"
                :style="{ backgroundColor: templateTheme(template.themeId).surface }"
              >
                {{ block.text }}
              </div>
            </template>
          </div>
          <div class="p-5">
            <h2 class="text-base font-semibold text-white">{{ template.name }}</h2>
            <p class="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
              {{ template.type }}
            </p>
            <p class="mt-2 text-sm leading-6 text-slate-400">{{ template.summary }}</p>
            <span class="mt-5 inline-flex items-center gap-1 text-sm font-medium text-violet-300">
              Use template
              <ArrowUpRight class="size-4" />
            </span>
          </div>
        </button>
      </div>
    </section>

    <section v-if="section === 'dashboard' || section === 'projects'">
      <div
        v-if="projectsStore.projects.length"
        class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        <button
          v-for="project in projectsStore.projects"
          :key="project.id"
          type="button"
          class="rounded-xl border border-slate-800 bg-slate-900/50 p-5 text-left transition hover:border-slate-700 hover:bg-slate-900"
          @click="router.push(`/projects/${project.id}/editor`)"
        >
          <div class="flex items-start justify-between gap-3">
            <span class="grid size-10 place-items-center rounded-lg bg-slate-800 text-sm font-semibold text-violet-200">
              {{ initial(project.name) }}
            </span>
            <span
              class="rounded-full px-2.5 py-1 text-xs font-medium"
              :class="
                project.status === 'Published'
                  ? 'bg-emerald-500/10 text-emerald-300'
                  : 'bg-amber-500/10 text-amber-200'
              "
            >
              {{ project.status }}
            </span>
          </div>

          <h2 class="mt-5 truncate text-base font-semibold text-white">
            {{ project.name }}
          </h2>
          <p class="mt-1 text-sm text-slate-400">{{ project.type }}</p>
          <p class="mt-4 flex items-center justify-between text-sm text-slate-500">
            <span>{{ formatDate(project.createdAt) }}</span>
            <span class="inline-flex items-center gap-1 font-medium text-violet-300">
              Open
              <ArrowUpRight class="size-4" />
            </span>
          </p>
        </button>
      </div>

      <div
        v-else
        class="rounded-xl border border-dashed border-slate-700 px-6 py-16 text-center"
      >
        <h2 class="text-lg font-semibold text-white">No projects yet</h2>
        <p class="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-400">
          Create a website to open the editor. It is saved to this account.
        </p>
        <button
          type="button"
          class="mt-6 inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-500"
          @click="router.push('/projects/new')"
        >
          <Plus class="size-4" />
          Create website
        </button>
      </div>
    </section>

    <section
      v-if="section === 'settings'"
      class="max-w-xl rounded-xl border border-slate-800 bg-slate-900/50 p-6"
    >
      <h2 class="text-base font-semibold text-white">Local storage</h2>
      <p class="mt-2 text-sm leading-6 text-slate-400">
        Clearing the workspace removes projects from this account only. Another
        sign-in keeps its own websites.
      </p>

      <dl class="mt-6 divide-y divide-slate-800 border-y border-slate-800 text-sm">
        <div class="flex items-center justify-between py-3">
          <dt class="text-slate-400">Projects</dt>
          <dd class="font-medium tabular-nums text-white">
            {{ projectsStore.projects.length }}
          </dd>
        </div>
        <div class="flex items-center justify-between py-3">
          <dt class="text-slate-400">Published</dt>
          <dd class="font-medium tabular-nums text-white">{{ publishedCount }}</dd>
        </div>
      </dl>

      <button
        type="button"
        class="mt-6 rounded-lg border border-red-900/80 px-4 py-2 text-sm font-medium text-red-300 hover:bg-red-950/60 disabled:cursor-not-allowed disabled:opacity-40"
        :disabled="projectsStore.projects.length === 0"
        @click="clearWorkspace"
      >
        Clear workspace
      </button>
    </section>
  </DashboardShell>
</template>
