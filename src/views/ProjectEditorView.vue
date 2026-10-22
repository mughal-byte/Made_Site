<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Bell,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  UserRound,
  Redo2,
  Settings,
  Undo2,
} from 'lucide-vue-next'
import BlockPreview from '../components/editor/BlockPreview.vue'
import RangeField from '../components/ui/RangeField.vue'
import { useProjectsStore } from '../stores/projects'
import { useAuthStore } from '../stores/auth'
import {
  createEditorElement,
  elementPresets,
  elementTypeLabel,
  paintElement,
  siteThemes,
  useEditorStore,
  type BorderStyle,
  type EditorElement,
  type ElementPreset,
  type ElementType,
  type TextAlignment,
} from '../stores/editor'

const route = useRoute()
const router = useRouter()
const projectsStore = useProjectsStore()
const auth = useAuthStore()
const editorStore = useEditorStore()

const selectedId = ref('')
const gestureOpen = ref(false)
const savedLabel = ref('Saved on this device')
const openMenu = ref<'profile' | 'bell' | null>(null)
const openAdd = ref<string | null>('text')
const alignments: TextAlignment[] = ['left', 'center', 'right']
const addGroups: { id: string; label: string; types: ElementType[] }[] = [
  { id: 'text', label: 'Text', types: ['heading', 'paragraph', 'button'] },
  { id: 'sections', label: 'Sections', types: ['header', 'hero', 'footer'] },
  { id: 'navigation', label: 'Navigation', types: ['navbar', 'sidebar'] },
  { id: 'layout', label: 'Layout', types: ['grid', 'slider', 'card'] },
  { id: 'forms', label: 'Forms', types: ['form', 'dropdown', 'checkbox'] },
  { id: 'overlays', label: 'Overlays', types: ['tabs', 'modal', 'popup', 'loader'] },
]

const project = computed(() =>
  projectsStore.projects.find((item) => item.id === route.params.id),
)

const elements = computed(() =>
  project.value ? (editorStore.pages[project.value.id]?.elements ?? []) : [],
)

const pageTheme = computed(
  () => (project.value && editorStore.pages[project.value.id]?.theme) || siteThemes[0],
)

const canvasStyle = computed(() => ({
  backgroundColor: pageTheme.value.background,
  color: pageTheme.value.text,
  '--page-accent': pageTheme.value.accent,
  '--page-on-accent': pageTheme.value.onAccent,
  '--page-text': pageTheme.value.text,
  '--page-muted': pageTheme.value.muted,
  '--page-surface': pageTheme.value.surface,
  '--page-background': pageTheme.value.background,
}))

const selectedElement = computed(() =>
  elements.value.find((element) => element.id === selectedId.value),
)

const canUndo = computed(() =>
  project.value ? editorStore.canUndo(project.value.id) : false,
)

const canRedo = computed(() =>
  project.value ? editorStore.canRedo(project.value.id) : false,
)

const notices = computed(() => {
  const items = [
    {
      title: 'Saved on this device',
      body: 'Edits stay in this browser until you clear the workspace.',
    },
  ]

  if (project.value?.status === 'Draft') {
    items.unshift({
      title: 'Still a draft',
      body: `${project.value.name} has not been published.`,
    })
  }

  return items
})

function presetsFor(type: ElementType) {
  return elementPresets.filter((preset) => preset.type === type)
}

function presetsIn(types: ElementType[]) {
  return elementPresets.filter((preset) => types.includes(preset.type))
}

function toggleAdd(id: string) {
  openAdd.value = openAdd.value === id ? null : id
}

const hasSurface = computed(() => {
  const type = selectedElement.value?.type
  return type !== undefined && type !== 'heading' && type !== 'paragraph'
})

watch(
  () => project.value?.id,
  (id) => {
    gestureOpen.value = false
    if (!id || !project.value) return

    editorStore.ensurePage(id, project.value.type)
    const page = editorStore.pages[id]?.elements ?? []
    if (!page.some((element) => element.id === selectedId.value)) {
      selectedId.value = page[0]?.id ?? ''
    }
  },
  { immediate: true },
)

function endGesture() {
  gestureOpen.value = false
}

function selectElement(id: string) {
  if (id !== selectedId.value) endGesture()
  selectedId.value = id
}

function applyPatch(patch: Partial<EditorElement>, live = false) {
  if (!project.value || !selectedElement.value) return

  const current = selectedElement.value
  const changed = (Object.keys(patch) as (keyof EditorElement)[]).some(
    (key) => current[key] !== patch[key],
  )
  if (!changed) return

  const next = elements.value.map((element) =>
    element.id === selectedId.value ? { ...element, ...patch } : element,
  )
  const recordHistory = live ? !gestureOpen.value : true
  editorStore.setElements(project.value.id, next, recordHistory)
  gestureOpen.value = live
}

function addPreset(preset: ElementPreset) {
  if (!project.value) return

  endGesture()
  const element = paintElement(
    createEditorElement(preset.type, crypto.randomUUID(), preset.id),
    pageTheme.value,
  )
  editorStore.setElements(project.value.id, [...elements.value, element], true)
  selectedId.value = element.id
  openMenu.value = null
}

function usePreset(preset: ElementPreset) {
  if (!selectedElement.value || selectedElement.value.type !== preset.type) {
    addPreset(preset)
    return
  }

  const painted = paintElement(
    {
      ...selectedElement.value,
      design: preset.id,
      color: preset.color,
      fontSize: preset.fontSize,
      backgroundColor: preset.backgroundColor,
      borderRadius: preset.borderRadius,
      textAlign: preset.textAlign,
      width: preset.width,
    },
    pageTheme.value,
  )

  applyPatch({
    design: painted.design,
    color: painted.color,
    fontSize: painted.fontSize,
    backgroundColor: painted.backgroundColor,
    borderRadius: painted.borderRadius,
    textAlign: painted.textAlign,
    width: painted.width,
  })
}

function deleteSelectedElement() {
  if (!project.value || !selectedElement.value) return

  endGesture()
  const next = elements.value.filter((element) => element.id !== selectedId.value)
  editorStore.setElements(project.value.id, next, true)
  selectedId.value = next[0]?.id ?? ''
}

function syncSelection() {
  if (!elements.value.some((element) => element.id === selectedId.value)) {
    selectedId.value = elements.value[0]?.id ?? ''
  }
}

function undo() {
  if (!project.value) return
  endGesture()
  editorStore.undo(project.value.id)
  syncSelection()
}

function redo() {
  if (!project.value) return
  endGesture()
  editorStore.redo(project.value.id)
  syncSelection()
}

function saveProject() {
  editorStore.save()
  projectsStore.saveProjects()
  savedLabel.value = 'Saved'
  window.setTimeout(() => {
    savedLabel.value = 'Saved on this device'
  }, 1400)
}

function onKeydown(event: KeyboardEvent) {
  const key = event.key.toLowerCase()
  const shortcut = event.metaKey || event.ctrlKey
  if (!shortcut) return

  if (key === 'escape') {
    openMenu.value = null
    return
  }

  if (key === 's') {
    event.preventDefault()
    saveProject()
    return
  }

  const target = event.target
  if (
    target instanceof HTMLElement &&
    target.closest('input, textarea, select')
  ) {
    return
  }

  if (key === 'z' && event.shiftKey) {
    event.preventDefault()
    redo()
  } else if (key === 'z' || (key === 'y' && event.ctrlKey)) {
    event.preventDefault()
    if (key === 'y') redo()
    else undo()
  }
}

const borderStyleOptions: { value: BorderStyle; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'solid', label: 'Solid' },
  { value: 'dashed', label: 'Dashed' },
  { value: 'dotted', label: 'Dotted' },
]

function elementBorder(element: EditorElement) {
  const visible = element.borderStyle !== 'none' && element.borderWidth > 0

  return {
    borderWidth: visible ? `${element.borderWidth}px` : '0px',
    borderStyle: visible ? element.borderStyle : 'none',
    borderColor: element.borderColor,
    borderRadius: `${element.borderRadius}px`,
  }
}

function elementShadow(element: EditorElement) {
  if (!element.shadowEnabled) return { boxShadow: 'none' }

  return {
    boxShadow: `${element.shadowOffsetX}px ${element.shadowOffsetY}px ${element.shadowBlur}px ${element.shadowColor}`,
  }
}

function setBorderStyle(style: BorderStyle) {
  if (!selectedElement.value) return

  const patch: Partial<EditorElement> = { borderStyle: style }
  if (style !== 'none' && selectedElement.value.borderWidth === 0) patch.borderWidth = 1
  applyPatch(patch)
}

function horizontalMargins(align: TextAlignment) {
  if (align === 'center') return { marginLeft: 'auto', marginRight: 'auto' }
  if (align === 'right') return { marginLeft: 'auto', marginRight: '0' }
  return { marginLeft: '0', marginRight: 'auto' }
}

function elementLabel(element: EditorElement) {
  return `${elementTypeLabel[element.type]} · ${element.text}`
}

const accountName = computed(() => auth.user?.name || 'You')
const accountInitial = computed(() => accountName.value.trim().charAt(0).toUpperCase() || 'Y')

async function signOut() {
  openMenu.value = null
  await auth.logout()
  router.push('/login')
}

function toggleMenu(menu: 'profile' | 'bell') {
  openMenu.value = openMenu.value === menu ? null : menu
}

function onPointerDown(event: PointerEvent) {
  const target = event.target
  if (target instanceof Element && target.closest('[data-menu]')) return
  openMenu.value = null
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('pointerdown', onPointerDown)
})
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('pointerdown', onPointerDown)
})
</script>

<template>
  <main v-if="project" class="flex h-dvh w-full min-w-0 flex-col overflow-hidden bg-slate-950 text-slate-100">
    <header class="z-30 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-slate-800 bg-slate-950 px-3 sm:px-4">
      <div class="flex min-w-0 items-center gap-3">
        <img src="/logo.png" alt="" class="size-9 shrink-0 rounded-lg object-cover" />
        <div class="min-w-0">
          <h1 class="truncate text-sm font-semibold text-white">{{ project.name }}</h1>
          <p class="truncate text-xs text-slate-500">{{ project.type }} · {{ project.status }}</p>
        </div>
      </div>

      <button
        type="button"
        class="hidden items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-900 sm:inline-flex"
        @click="router.push('/')"
      >
        <LayoutDashboard class="size-4" />
        Dashboard
      </button>

      <div class="flex items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-2.5 py-2 text-sm hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
          :disabled="!canUndo"
          @click="undo"
        >
          <Undo2 class="size-4" />
          <span class="hidden md:inline">Undo</span>
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-2.5 py-2 text-sm hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
          :disabled="!canRedo"
          @click="redo"
        >
          <Redo2 class="size-4" />
          <span class="hidden md:inline">Redo</span>
        </button>
        <button
          type="button"
          class="rounded-lg bg-violet-600 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-500"
          @click="saveProject"
        >
          {{ savedLabel === 'Saved' ? 'Saved' : 'Save' }}
        </button>

        <div class="relative" data-menu>
          <button
            type="button"
            class="relative grid size-10 place-items-center rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-900"
            aria-label="Notifications"
            :aria-expanded="openMenu === 'bell'"
            @click="toggleMenu('bell')"
          >
            <Bell class="size-4" />
            <span
              v-if="project.status === 'Draft'"
              class="absolute right-2 top-2 size-2 rounded-full bg-violet-400"
            ></span>
          </button>
          <div
            v-if="openMenu === 'bell'"
            class="absolute right-0 top-12 z-40 w-72 rounded-xl border border-slate-700 bg-slate-900 p-2 shadow-xl"
          >
            <p class="px-2 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
              Notifications
            </p>
            <div v-for="notice in notices" :key="notice.title" class="rounded-lg px-2 py-2">
              <p class="text-sm font-medium text-white">{{ notice.title }}</p>
              <p class="mt-0.5 text-xs leading-5 text-slate-400">{{ notice.body }}</p>
            </div>
          </div>
        </div>

        <div class="relative" data-menu>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg border border-slate-700 py-1.5 pl-1.5 pr-2 hover:bg-slate-900"
            aria-label="Account menu"
            :aria-expanded="openMenu === 'profile'"
            @click="toggleMenu('profile')"
          >
            <img
              v-if="auth.user?.avatar"
              :src="auth.user.avatar"
              alt=""
              class="size-7 rounded-md object-cover"
            />
            <span
              v-else
              class="grid size-7 place-items-center rounded-md bg-slate-800 text-xs font-semibold text-violet-200"
            >
              {{ accountInitial }}
            </span>
            <span class="hidden text-sm font-medium text-slate-200 sm:inline">{{ accountName }}</span>
            <ChevronDown class="size-4 text-slate-400" />
          </button>
          <div
            v-if="openMenu === 'profile'"
            class="absolute right-0 top-12 z-40 w-56 rounded-xl border border-slate-700 bg-slate-900 p-1.5 shadow-xl"
          >
            <div class="border-b border-slate-800 px-2.5 py-2">
              <p class="truncate text-sm font-medium text-white">{{ accountName }}</p>
              <p class="truncate text-xs text-slate-500">{{ auth.user?.email }}</p>
            </div>
            <button
              type="button"
              class="mt-1 flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-slate-200 hover:bg-slate-800"
              @click="router.push('/profile')"
            >
              <UserRound class="size-4 text-slate-400" />
              Profile
            </button>
            <button
              type="button"
              class="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-slate-200 hover:bg-slate-800"
              @click="router.push('/')"
            >
              <LayoutDashboard class="size-4 text-slate-400" />
              Dashboard
            </button>
            <button
              type="button"
              class="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-slate-200 hover:bg-slate-800"
              @click="router.push({ path: '/', query: { section: 'settings' } })"
            >
              <Settings class="size-4 text-slate-400" />
              Settings
            </button>
            <button
              type="button"
              class="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-slate-200 hover:bg-slate-800"
              @click="signOut"
            >
              <LogOut class="size-4 text-slate-400" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>

    <div class="grid min-h-0 w-full min-w-0 flex-1 grid-rows-[minmax(0,8.5rem)_minmax(0,1fr)_minmax(0,9.5rem)] overflow-hidden lg:grid-cols-[280px_minmax(0,1fr)_320px] lg:grid-rows-1">
      <aside class="panel-scroll min-h-0 min-w-0 overflow-y-auto overscroll-contain border-b border-slate-800 p-4 lg:border-b-0 lg:border-r">
        <p class="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Page</p>
        <p class="mt-2 rounded-lg bg-slate-900 px-3 py-2.5 text-sm font-medium text-slate-100">
          Home
        </p>

        <div class="mt-7 space-y-2">
          <p class="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Add</p>
          <div v-for="group in addGroups" :key="group.id" class="overflow-hidden rounded-lg border border-slate-800">
            <button
              type="button"
              class="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm font-medium text-slate-200 hover:bg-slate-900"
              :aria-expanded="openAdd === group.id"
              @click="toggleAdd(group.id)"
            >
              {{ group.label }}
              <ChevronDown class="size-4 text-slate-400" :class="openAdd === group.id ? 'rotate-180' : ''" />
            </button>
            <div v-if="openAdd === group.id" class="border-t border-slate-800 p-1.5">
              <button
                v-for="preset in presetsIn(group.types)"
                :key="preset.id"
                type="button"
                class="flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left hover:bg-slate-900"
                @click="addPreset(preset)"
              >
                <span class="min-w-0">
                  <span class="block truncate text-sm text-slate-100">{{ preset.name }}</span>
                  <span class="block truncate text-[11px] text-slate-500">{{ elementTypeLabel[preset.type] }}</span>
                </span>
              </button>
            </div>
          </div>
        </div>

        <p class="mb-2 mt-7 text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
          Layers
        </p>
        <div class="space-y-1">
          <button
            v-for="element in elements"
            :key="element.id"
            type="button"
            class="w-full max-w-full truncate rounded-lg px-3 py-2 text-left text-sm"
            :class="
              selectedId === element.id
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            "
            @click="selectElement(element.id)"
          >
            {{ elementLabel(element) }}
          </button>
          <p v-if="elements.length === 0" class="px-1 text-sm text-slate-500">
            This page has no elements.
          </p>
        </div>
      </aside>

      <section class="flex min-h-0 min-w-0 flex-col overflow-hidden bg-slate-900/40 p-4 sm:p-6">
        <div class="mb-3 flex shrink-0 items-center justify-between gap-3">
          <h2 class="text-sm font-medium text-slate-300">Preview</h2>
          <span class="text-xs text-slate-500">Desktop</span>
        </div>

        <div
          class="mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col overflow-hidden rounded-xl border border-slate-700 shadow-2xl shadow-black/30"
          :style="canvasStyle"
        >
          <div
            class="flex shrink-0 items-center gap-3 border-b px-4 py-3"
            :style="{
              backgroundColor: pageTheme.surface,
              color: pageTheme.muted,
              borderColor: pageTheme.muted,
            }"
          >
            <span class="flex gap-1.5" aria-hidden="true">
              <span class="size-2.5 rounded-full bg-slate-300"></span>
              <span class="size-2.5 rounded-full bg-slate-300"></span>
              <span class="size-2.5 rounded-full bg-slate-300"></span>
            </span>
            <span class="truncate text-xs">{{ project.name }}</span>
          </div>

          <div
            class="flex shrink-0 items-center justify-between gap-4 border-b px-6 py-4 sm:px-10"
            :style="{
              backgroundColor: pageTheme.background,
              color: pageTheme.text,
              borderColor: pageTheme.surface,
            }"
          >
            <strong class="truncate text-sm">{{ project.name }}</strong>
            <span class="shrink-0 text-xs uppercase tracking-[0.12em] opacity-60">
              {{ project.type }}
            </span>
          </div>

          <div class="panel-scroll min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-6 py-8 sm:px-12">
            <div
              v-for="element in elements"
              :key="element.id"
              class="flex min-w-0 cursor-pointer flex-col justify-center rounded-md hover:outline hover:outline-1 hover:outline-current/30"
              :style="{
                width: `${element.width}%`,
                minHeight: `${element.height}px`,
                textAlign: element.textAlign,
                ...horizontalMargins(element.textAlign),
                marginTop: `${element.marginTop}px`,
                marginBottom: `${element.marginBottom}px`,
                paddingTop: `${element.paddingTop}px`,
                paddingBottom: `${element.paddingBottom}px`,
                ...elementBorder(element),
                ...elementShadow(element),
                outline: selectedId === element.id ? `2px solid ${pageTheme.accent}` : undefined,
                outlineOffset: selectedId === element.id ? '4px' : undefined,
              }"
              @click="selectElement(element.id)"
            >
              <BlockPreview class="w-full min-w-0" :element="element" />
            </div>

            <div
              v-if="elements.length === 0"
              class="rounded-lg border border-dashed border-slate-300 px-6 py-14 text-center"
            >
              <p class="font-medium">This page is empty</p>
              <p class="mt-1 text-sm opacity-70">
                Add a heading, text, or button from the left.
              </p>
            </div>
          </div>
        </div>
      </section>

      <aside class="panel-scroll min-h-0 overflow-y-auto overscroll-contain border-t border-slate-800 p-4 lg:border-l lg:border-t-0">
        <h2 class="text-sm font-medium text-white">Properties</h2>

        <div v-if="selectedElement" class="mt-5 space-y-5">
          <div>
            <p class="text-sm text-slate-400">Element</p>
            <p class="mt-2 rounded-lg border border-slate-800 px-3 py-2.5 text-sm">
              {{ elementTypeLabel[selectedElement.type] }}
            </p>
          </div>

          <div>
            <p class="mb-2 text-sm text-slate-400">Design</p>
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="preset in presetsFor(selectedElement.type)"
                :key="preset.id"
                type="button"
                class="rounded-lg border px-2.5 py-2 text-left text-sm"
                :class="
                  selectedElement.design === preset.id
                    ? 'border-violet-500 bg-violet-600/15 text-violet-200'
                    : 'border-slate-700 text-slate-300 hover:bg-slate-900'
                "
                :aria-pressed="selectedElement.design === preset.id"
                @click="usePreset(preset)"
              >
                {{ preset.name }}
              </button>
            </div>
          </div>

          <div>
            <label for="element-text" class="text-sm text-slate-400">Text</label>
            <textarea
              id="element-text"
              :value="selectedElement.text"
              rows="4"
              class="mt-2 w-full resize-y rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500"
              @input="applyPatch({ text: ($event.target as HTMLTextAreaElement).value }, true)"
              @blur="endGesture"
            />
          </div>

          <div v-if="selectedElement.type === 'hero' || selectedElement.type === 'card' || selectedElement.type === 'slider' || selectedElement.type === 'form'">
            <label for="element-note" class="text-sm text-slate-400">Detail</label>
            <textarea
              id="element-note"
              :value="selectedElement.note"
              rows="3"
              class="mt-2 w-full resize-y rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500"
              @input="applyPatch({ note: ($event.target as HTMLTextAreaElement).value }, true)"
              @blur="endGesture"
            />
          </div>

          <div>
            <label for="element-color" class="text-sm text-slate-400">Text color</label>
            <div class="mt-2 flex items-center gap-3">
              <input
                id="element-color"
                type="color"
                :value="selectedElement.color"
                class="h-10 w-12 cursor-pointer rounded border border-slate-700 bg-slate-950 p-1"
                @input="applyPatch({ color: ($event.target as HTMLInputElement).value }, true)"
                @change="endGesture"
              />
              <span class="text-sm uppercase text-slate-300">{{ selectedElement.color }}</span>
            </div>
          </div>

          <RangeField
            id="element-font-size"
            label="Font size"
            :model-value="selectedElement.fontSize"
            :min="12"
            :max="72"
            min-label="12px"
            max-label="72px"
            @input="applyPatch({ fontSize: $event }, true)"
            @change="endGesture"
          />

          <RangeField
            id="element-width"
            label="Width"
            :model-value="selectedElement.width"
            :min="20"
            :max="100"
            unit="%"
            min-label="20%"
            max-label="100%"
            @input="applyPatch({ width: $event }, true)"
            @change="endGesture"
          />

          <div>
            <RangeField
              id="element-height"
              label="Height"
              :model-value="selectedElement.height"
              :min="20"
              :max="300"
              min-label="20px"
              max-label="300px"
              @input="applyPatch({ height: $event }, true)"
              @change="endGesture"
            />
            <p class="mt-1.5 text-xs leading-5 text-slate-500">
              Minimum height. The box grows if the text needs more room.
            </p>
          </div>

          <div>
            <p class="mb-2 text-sm text-slate-400">Alignment</p>
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="alignment in alignments"
                :key="alignment"
                type="button"
                class="rounded-lg border px-2 py-2 text-sm capitalize"
                :class="
                  selectedElement.textAlign === alignment
                    ? 'border-violet-500 bg-violet-600/15 text-violet-200'
                    : 'border-slate-700 text-slate-300 hover:bg-slate-900'
                "
                :aria-pressed="selectedElement.textAlign === alignment"
                @click="applyPatch({ textAlign: alignment })"
              >
                {{ alignment }}
              </button>
            </div>
          </div>

          <div class="space-y-5 border-t border-slate-800 pt-5">
            <p class="text-sm font-medium text-white">Spacing</p>
            <RangeField
              id="element-margin-top"
              label="Space above"
              :model-value="selectedElement.marginTop"
              :min="0"
              :max="100"
              min-label="0"
              max-label="100"
              @input="applyPatch({ marginTop: $event }, true)"
              @change="endGesture"
            />
            <RangeField
              id="element-margin-bottom"
              label="Space below"
              :model-value="selectedElement.marginBottom"
              :min="0"
              :max="100"
              min-label="0"
              max-label="100"
              @input="applyPatch({ marginBottom: $event }, true)"
              @change="endGesture"
            />
          </div>

          <div class="space-y-5 border-t border-slate-800 pt-5">
            <p class="text-sm font-medium text-white">Padding</p>
            <RangeField
              id="element-padding-top"
              label="Top padding"
              :model-value="selectedElement.paddingTop"
              :min="0"
              :max="100"
              min-label="0"
              max-label="100"
              @input="applyPatch({ paddingTop: $event }, true)"
              @change="endGesture"
            />
            <RangeField
              id="element-padding-bottom"
              label="Bottom padding"
              :model-value="selectedElement.paddingBottom"
              :min="0"
              :max="100"
              min-label="0"
              max-label="100"
              @input="applyPatch({ paddingBottom: $event }, true)"
              @change="endGesture"
            />
          </div>

          <div class="space-y-5 border-t border-slate-800 pt-5">
            <p class="text-sm font-medium text-white">Border</p>
            <RangeField
              id="element-border-width"
              label="Border width"
              :model-value="selectedElement.borderWidth"
              :min="0"
              :max="10"
              min-label="0px"
              max-label="10px"
              @input="applyPatch({ borderWidth: $event }, true)"
              @change="endGesture"
            />
            <div>
              <label for="element-border-color" class="text-sm text-slate-400">Border color</label>
              <div class="mt-2 flex items-center gap-3">
                <input
                  id="element-border-color"
                  type="color"
                  :value="selectedElement.borderColor.startsWith('#') ? selectedElement.borderColor : '#94a3b8'"
                  class="h-10 w-12 cursor-pointer rounded border border-slate-700 bg-slate-950 p-1"
                  @input="applyPatch({ borderColor: ($event.target as HTMLInputElement).value }, true)"
                  @change="endGesture"
                />
                <span class="text-sm uppercase text-slate-300">{{ selectedElement.borderColor }}</span>
              </div>
            </div>
            <div>
              <label for="element-border-style" class="text-sm text-slate-400">Border style</label>
              <select
                id="element-border-style"
                :value="selectedElement.borderStyle"
                class="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500"
                @change="setBorderStyle(($event.target as HTMLSelectElement).value as BorderStyle)"
              >
                <option v-for="option in borderStyleOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>
            <p class="text-xs leading-5 text-slate-500">
              The border shows when the style is not None and the width is above 0.
            </p>
          </div>

          <div class="space-y-5 border-t border-slate-800 pt-5">
            <p class="text-sm font-medium text-white">Shadow</p>
            <label class="flex items-center justify-between gap-3 text-sm text-slate-300">
              Enable shadow
              <input
                type="checkbox"
                class="size-4 accent-violet-500"
                :checked="selectedElement.shadowEnabled"
                @change="
                  applyPatch({
                    shadowEnabled: ($event.target as HTMLInputElement).checked,
                  })
                "
              />
            </label>
            <RangeField
              id="element-shadow-blur"
              label="Blur"
              :model-value="selectedElement.shadowBlur"
              :min="0"
              :max="40"
              min-label="0px"
              max-label="40px"
              @input="applyPatch({ shadowBlur: $event }, true)"
              @change="endGesture"
            />
            <RangeField
              id="element-shadow-offset-x"
              label="Horizontal offset"
              :model-value="selectedElement.shadowOffsetX"
              :min="-20"
              :max="20"
              min-label="-20px"
              max-label="20px"
              @input="applyPatch({ shadowOffsetX: $event }, true)"
              @change="endGesture"
            />
            <RangeField
              id="element-shadow-offset-y"
              label="Vertical offset"
              :model-value="selectedElement.shadowOffsetY"
              :min="-20"
              :max="20"
              min-label="-20px"
              max-label="20px"
              @input="applyPatch({ shadowOffsetY: $event }, true)"
              @change="endGesture"
            />
            <div>
              <label for="element-shadow-color" class="text-sm text-slate-400">Shadow color</label>
              <div class="mt-2 flex items-center gap-3">
                <input
                  id="element-shadow-color"
                  type="color"
                  :value="selectedElement.shadowColor.startsWith('#') ? selectedElement.shadowColor : '#0f172a'"
                  class="h-10 w-12 cursor-pointer rounded border border-slate-700 bg-slate-950 p-1"
                  @input="applyPatch({ shadowColor: ($event.target as HTMLInputElement).value }, true)"
                  @change="endGesture"
                />
                <span class="text-sm uppercase text-slate-300">{{ selectedElement.shadowColor }}</span>
              </div>
            </div>
            <p class="text-xs leading-5 text-slate-500">
              The shadow appears in the preview only while it is enabled.
            </p>
          </div>

          <div v-if="hasSurface" class="space-y-5 border-t border-slate-800 pt-5">
            <div>
              <label for="element-background-color" class="text-sm text-slate-400">
                {{ selectedElement.type === 'button' ? 'Button color' : 'Background' }}
              </label>
              <div class="mt-2 flex items-center gap-3">
                <input
                  id="element-background-color"
                  type="color"
                  :value="selectedElement.backgroundColor.startsWith('#') ? selectedElement.backgroundColor : '#ffffff'"
                  class="h-10 w-12 cursor-pointer rounded border border-slate-700 bg-slate-950 p-1"
                  @input="
                    applyPatch(
                      { backgroundColor: ($event.target as HTMLInputElement).value },
                      true,
                    )
                  "
                  @change="endGesture"
                />
                <span class="text-sm uppercase text-slate-300">
                  {{ selectedElement.backgroundColor }}
                </span>
              </div>
            </div>

            <RangeField
              id="element-border-radius"
              label="Corner radius"
              :model-value="selectedElement.borderRadius"
              :min="0"
              :max="999"
              min-label="Square"
              max-label="Pill"
              @input="applyPatch({ borderRadius: $event }, true)"
              @change="endGesture"
            />
          </div>

          <button
            type="button"
            class="w-full rounded-lg border border-red-900/80 px-4 py-2.5 text-sm font-medium text-red-300 hover:bg-red-950/60"
            @click="deleteSelectedElement"
          >
            Delete element
          </button>
        </div>

        <p v-else class="mt-4 text-sm leading-6 text-slate-400">
          Select an element in the preview, or add one from the left.
        </p>
      </aside>
    </div>
  </main>

  <main v-else class="grid min-h-screen place-items-center bg-slate-950 px-6 text-slate-100">
    <div class="max-w-md text-center">
      <h1 class="text-2xl font-semibold text-white">Project not found</h1>
      <p class="mt-2 text-sm leading-6 text-slate-400">
        This link does not match a website saved in this account.
      </p>
      <button
        type="button"
        class="mt-6 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-500"
        @click="router.push('/')"
      >
        Back to dashboard
      </button>
    </div>
  </main>
</template>
