<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import { projectTypes, useProjectsStore } from '../stores/projects'
import { useEditorStore } from '../stores/editor'
import { pageFromTemplate, siteTemplates } from '../stores/templates'

const route = useRoute()
const router = useRouter()
const projectsStore = useProjectsStore()
const editorStore = useEditorStore()

const requestedTemplate = route.query.template
const template =
  typeof requestedTemplate === 'string'
    ? siteTemplates.find((item) => item.id === requestedTemplate)
    : undefined

const requestedType = route.query.type
const initialType =
  template?.type ??
  (typeof requestedType === 'string' &&
  projectTypes.some((type) => type.name === requestedType)
    ? requestedType
    : projectTypes[0].name)

const projectName = ref(template?.name ?? '')
const projectType = ref<string>(initialType)

function createProject() {
  const name = projectName.value.trim()
  if (!name) return

  const project = projectsStore.createProject(name, projectType.value)
  const page = template ? pageFromTemplate(template.id) : null
  if (page) editorStore.seedPage(project.id, page.elements, page.theme)
  else editorStore.ensurePage(project.id, project.type)

  router.push(`/projects/${project.id}/editor`)
}
</script>

<template>
  <main class="min-h-screen bg-slate-950 px-5 py-10 text-slate-100 sm:px-8">
    <div class="mx-auto max-w-3xl">
      <button
        type="button"
        class="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
        @click="router.push('/')"
      >
        <ArrowLeft class="size-4" />
        Dashboard
      </button>

      <p class="mt-8 text-xs font-medium uppercase tracking-[0.14em] text-violet-300">
        New project
      </p>
      <h1 class="mt-2 text-3xl font-semibold tracking-tight text-white">
        Create a website
      </h1>
      <p class="mt-2 max-w-xl text-sm leading-6 text-slate-400">
        {{
          template
            ? `This starts from the ${template.name} template. You can change every block after it opens.`
            : 'Name it and choose a type. The editor opens with a starting page you can change.'
        }}
      </p>

      <form
        class="mt-8 rounded-xl border border-slate-800 bg-slate-900/50 p-5 sm:p-7"
        @submit.prevent="createProject"
      >
        <label for="projectName" class="block text-sm font-medium text-slate-200">
          Website name
        </label>
        <input
          id="projectName"
          v-model="projectName"
          required
          maxlength="80"
          autocomplete="off"
          placeholder="Northwind Studio"
          class="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500"
        />

        <div class="mt-7">
          <p id="project-type-label" class="text-sm font-medium text-slate-200">Website type</p>
          <div class="mt-3 grid gap-3 sm:grid-cols-2" role="group" aria-labelledby="project-type-label">
            <button
              v-for="type in projectTypes"
              :key="type.name"
              type="button"
              class="rounded-lg border p-4 text-left transition"
              :class="
                projectType === type.name
                  ? 'border-violet-500 bg-violet-500/10'
                  : 'border-slate-800 hover:border-slate-700'
              "
              :aria-pressed="projectType === type.name"
              @click="projectType = type.name"
            >
              <span class="block text-sm font-medium text-white">{{ type.name }}</span>
              <span class="mt-1 block text-sm leading-6 text-slate-400">
                {{ type.summary }}
              </span>
            </button>
          </div>
        </div>

        <div class="mt-7 flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            class="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white"
            @click="router.push('/')"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-500"
          >
            Create and open editor
          </button>
        </div>
      </form>
    </div>
  </main>
</template>
