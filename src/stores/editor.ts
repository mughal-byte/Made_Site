import { defineStore } from 'pinia'

export type ElementType =
  | 'heading'
  | 'paragraph'
  | 'button'
  | 'card'
  | 'header'
  | 'footer'
  | 'slider'
  | 'navbar'
  | 'sidebar'
  | 'hero'
  | 'grid'
  | 'tabs'
  | 'form'
  | 'dropdown'
  | 'checkbox'
  | 'modal'
  | 'popup'
  | 'loader'

export const elementTypeLabel: Record<ElementType, string> = {
  heading: 'Heading',
  paragraph: 'Text',
  button: 'Button',
  card: 'Card',
  header: 'Header',
  footer: 'Footer',
  slider: 'Slider',
  navbar: 'Navbar',
  sidebar: 'Sidebar',
  hero: 'Hero',
  grid: 'Grid',
  tabs: 'Tabs',
  form: 'Form',
  dropdown: 'Dropdown',
  checkbox: 'Checkbox',
  modal: 'Modal',
  popup: 'Popup',
  loader: 'Loader',
}
export type TextAlignment = 'left' | 'center' | 'right'
export type BorderStyle = 'none' | 'solid' | 'dashed' | 'dotted'

const borderStyles: BorderStyle[] = ['none', 'solid', 'dashed', 'dotted']

export interface EditorElement {
  id: string
  type: ElementType
  text: string
  note: string
  color: string
  fontSize: number
  backgroundColor: string
  borderRadius: number
  textAlign: TextAlignment
  marginTop: number
  marginBottom: number
  paddingTop: number
  paddingBottom: number
  width: number
  height: number
  borderWidth: number
  borderColor: string
  borderStyle: BorderStyle
  shadowEnabled: boolean
  shadowBlur: number
  shadowOffsetX: number
  shadowOffsetY: number
  shadowColor: string
  design: string
}

export interface ElementPreset {
  id: string
  type: ElementType
  name: string
  text: string
  color: string
  fontSize: number
  backgroundColor: string
  borderRadius: number
  textAlign: TextAlignment
  width: number
}

export const elementPresets: ElementPreset[] = [
  {
    id: 'heading-classic',
    type: 'heading',
    name: 'Classic',
    text: 'New heading',
    color: '#0f172a',
    fontSize: 40,
    backgroundColor: 'transparent',
    borderRadius: 8,
    textAlign: 'center',
    width: 100,
  },
  {
    id: 'heading-display',
    type: 'heading',
    name: 'Display',
    text: 'A bold statement',
    color: '#0f172a',
    fontSize: 56,
    backgroundColor: 'transparent',
    borderRadius: 8,
    textAlign: 'left',
    width: 90,
  },
  {
    id: 'heading-label',
    type: 'heading',
    name: 'Label',
    text: 'New collection',
    color: '#6d28d9',
    fontSize: 13,
    backgroundColor: 'transparent',
    borderRadius: 8,
    textAlign: 'center',
    width: 100,
  },
  {
    id: 'heading-rule',
    type: 'heading',
    name: 'Underline',
    text: 'Section title',
    color: '#0f172a',
    fontSize: 32,
    backgroundColor: 'transparent',
    borderRadius: 8,
    textAlign: 'left',
    width: 72,
  },
  {
    id: 'text-body',
    type: 'paragraph',
    name: 'Body',
    text: 'Write your text here.',
    color: '#475569',
    fontSize: 16,
    backgroundColor: 'transparent',
    borderRadius: 8,
    textAlign: 'left',
    width: 100,
  },
  {
    id: 'text-lead',
    type: 'paragraph',
    name: 'Lead',
    text: 'A short introduction that sets the page.',
    color: '#334155',
    fontSize: 20,
    backgroundColor: 'transparent',
    borderRadius: 8,
    textAlign: 'center',
    width: 84,
  },
  {
    id: 'text-quote',
    type: 'paragraph',
    name: 'Quote',
    text: 'A line worth remembering.',
    color: '#1e293b',
    fontSize: 22,
    backgroundColor: 'transparent',
    borderRadius: 8,
    textAlign: 'left',
    width: 86,
  },
  {
    id: 'text-note',
    type: 'paragraph',
    name: 'Note',
    text: 'A small note for extra detail.',
    color: '#5b21b6',
    fontSize: 14,
    backgroundColor: '#f5f3ff',
    borderRadius: 12,
    textAlign: 'left',
    width: 100,
  },
  {
    id: 'button-solid',
    type: 'button',
    name: 'Solid',
    text: 'Get started',
    color: '#ffffff',
    fontSize: 16,
    backgroundColor: '#6d28d9',
    borderRadius: 999,
    textAlign: 'center',
    width: 42,
  },
  {
    id: 'button-outline',
    type: 'button',
    name: 'Outline',
    text: 'Learn more',
    color: '#6d28d9',
    fontSize: 16,
    backgroundColor: 'transparent',
    borderRadius: 999,
    textAlign: 'center',
    width: 42,
  },
  {
    id: 'button-soft',
    type: 'button',
    name: 'Soft',
    text: 'Contact us',
    color: '#5b21b6',
    fontSize: 16,
    backgroundColor: '#ede9fe',
    borderRadius: 12,
    textAlign: 'center',
    width: 42,
  },
  {
    id: 'button-block',
    type: 'button',
    name: 'Full width',
    text: 'Continue',
    color: '#ffffff',
    fontSize: 16,
    backgroundColor: '#0f172a',
    borderRadius: 8,
    textAlign: 'center',
    width: 100,
  },
  {
    id: 'card-feature',
    type: 'card',
    name: 'Feature',
    text: 'A clear feature',
    color: '#0f172a',
    fontSize: 20,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    textAlign: 'left',
    width: 100,
  },
  {
    id: 'header-bar',
    type: 'header',
    name: 'Site header',
    text: 'Studio',
    color: '#0f172a',
    fontSize: 16,
    backgroundColor: '#ffffff',
    borderRadius: 0,
    textAlign: 'left',
    width: 100,
  },
  {
    id: 'footer-bar',
    type: 'footer',
    name: 'Site footer',
    text: 'Made with care',
    color: '#e2e8f0',
    fontSize: 14,
    backgroundColor: '#0f172a',
    borderRadius: 0,
    textAlign: 'left',
    width: 100,
  },
  {
    id: 'slider-frame',
    type: 'slider',
    name: 'Slider',
    text: 'Highlight one',
    color: '#ffffff',
    fontSize: 28,
    backgroundColor: '#6d28d9',
    borderRadius: 16,
    textAlign: 'left',
    width: 100,
  },
  {
    id: 'navbar-links',
    type: 'navbar',
    name: 'Navbar',
    text: 'Brand',
    color: '#0f172a',
    fontSize: 15,
    backgroundColor: '#ffffff',
    borderRadius: 0,
    textAlign: 'left',
    width: 100,
  },
  {
    id: 'sidebar-menu',
    type: 'sidebar',
    name: 'Sidebar',
    text: 'Menu',
    color: '#0f172a',
    fontSize: 14,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    textAlign: 'left',
    width: 40,
  },
  {
    id: 'hero-banner',
    type: 'hero',
    name: 'Hero',
    text: 'Build the page visitors remember.',
    color: '#ffffff',
    fontSize: 36,
    backgroundColor: '#4c1d95',
    borderRadius: 16,
    textAlign: 'center',
    width: 100,
  },
  {
    id: 'grid-three',
    type: 'grid',
    name: 'Three columns',
    text: 'One',
    color: '#0f172a',
    fontSize: 16,
    backgroundColor: '#ede9fe',
    borderRadius: 12,
    textAlign: 'center',
    width: 100,
  },
  {
    id: 'tabs-basic',
    type: 'tabs',
    name: 'Tabs',
    text: 'The first panel explains the offer.',
    color: '#0f172a',
    fontSize: 15,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    textAlign: 'left',
    width: 100,
  },
  {
    id: 'form-contact',
    type: 'form',
    name: 'Contact form',
    text: 'Send message',
    color: '#0f172a',
    fontSize: 14,
    backgroundColor: '#6d28d9',
    borderRadius: 12,
    textAlign: 'left',
    width: 100,
  },
  {
    id: 'dropdown-menu',
    type: 'dropdown',
    name: 'Dropdown',
    text: 'Choose an option',
    color: '#0f172a',
    fontSize: 14,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    textAlign: 'left',
    width: 70,
  },
  {
    id: 'checkbox-field',
    type: 'checkbox',
    name: 'Checkbox',
    text: 'I agree to the terms',
    color: '#0f172a',
    fontSize: 14,
    backgroundColor: 'transparent',
    borderRadius: 4,
    textAlign: 'left',
    width: 100,
  },
  {
    id: 'modal-dialog',
    type: 'modal',
    name: 'Modal',
    text: 'Open dialog',
    color: '#ffffff',
    fontSize: 16,
    backgroundColor: '#6d28d9',
    borderRadius: 16,
    textAlign: 'center',
    width: 100,
  },
  {
    id: 'popup-notice',
    type: 'popup',
    name: 'Popup',
    text: 'Your changes are saved',
    color: '#0f172a',
    fontSize: 14,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    textAlign: 'left',
    width: 70,
  },
  {
    id: 'loader-spinner',
    type: 'loader',
    name: 'Loader',
    text: 'Loading',
    color: '#6d28d9',
    fontSize: 14,
    backgroundColor: 'transparent',
    borderRadius: 8,
    textAlign: 'center',
    width: 40,
  },
]

const defaultHeights: Record<ElementType, number> = {
  heading: 64,
  paragraph: 48,
  button: 48,
  card: 168,
  header: 72,
  footer: 128,
  slider: 200,
  navbar: 64,
  sidebar: 240,
  hero: 280,
  grid: 140,
  tabs: 168,
  form: 240,
  dropdown: 48,
  checkbox: 40,
  modal: 220,
  popup: 96,
  loader: 72,
}

const defaultDesigns: Record<ElementType, string> = {
  heading: 'heading-classic',
  paragraph: 'text-body',
  button: 'button-solid',
  card: 'card-feature',
  header: 'header-bar',
  footer: 'footer-bar',
  slider: 'slider-frame',
  navbar: 'navbar-links',
  sidebar: 'sidebar-menu',
  hero: 'hero-banner',
  grid: 'grid-three',
  tabs: 'tabs-basic',
  form: 'form-contact',
  dropdown: 'dropdown-menu',
  checkbox: 'checkbox-field',
  modal: 'modal-dialog',
  popup: 'popup-notice',
  loader: 'loader-spinner',
}

export function defaultHeight(type: ElementType): number {
  return defaultHeights[type]
}

function defaultDesign(type: ElementType): string {
  return defaultDesigns[type]
}

export function presetById(id: string | undefined, type: ElementType): ElementPreset {
  return (
    elementPresets.find((preset) => preset.id === id && preset.type === type) ??
    elementPresets.find((preset) => preset.id === defaultDesign(type)) ??
    elementPresets[0]
  )
}

export interface PageTheme {
  id: string
  name: string
  background: string
  accent: string
  text: string
  muted: string
  surface: string
  onAccent: string
}

export const siteThemes: PageTheme[] = [
  { id: 'violet', name: 'Violet', background: '#ffffff', accent: '#6d28d9', text: '#0f172a', muted: '#475569', surface: '#f8fafc', onAccent: '#ffffff' },
  { id: 'ocean', name: 'Ocean', background: '#f0f9ff', accent: '#0369a1', text: '#0c4a6e', muted: '#075985', surface: '#e0f2fe', onAccent: '#ffffff' },
  { id: 'forest', name: 'Forest', background: '#f0fdf4', accent: '#15803d', text: '#14532d', muted: '#166534', surface: '#dcfce7', onAccent: '#ffffff' },
  { id: 'sunset', name: 'Sunset', background: '#fff7ed', accent: '#c2410c', text: '#7c2d12', muted: '#9a3412', surface: '#ffedd5', onAccent: '#ffffff' },
  { id: 'rose', name: 'Rose', background: '#fff1f2', accent: '#be123c', text: '#881337', muted: '#9f1239', surface: '#ffe4e6', onAccent: '#ffffff' },
  { id: 'amber', name: 'Amber', background: '#fffbeb', accent: '#b45309', text: '#78350f', muted: '#92400e', surface: '#fef3c7', onAccent: '#ffffff' },
  { id: 'slate', name: 'Slate', background: '#f8fafc', accent: '#334155', text: '#0f172a', muted: '#475569', surface: '#e2e8f0', onAccent: '#ffffff' },
  { id: 'midnight', name: 'Midnight', background: '#0f172a', accent: '#a78bfa', text: '#f8fafc', muted: '#cbd5e1', surface: '#1e293b', onAccent: '#0f172a' },
]

interface EditorPage {
  elements: EditorElement[]
  theme: PageTheme
}

interface PageSnapshot {
  elements: EditorElement[]
  theme: PageTheme
}

interface HistoryState {
  past: PageSnapshot[]
  future: PageSnapshot[]
}

function colorChannel(hex: string, index: number): number {
  const body = hex.replace('#', '')
  const full = body.length === 3 ? body.split('').map((char) => char + char).join('') : body
  return Number.parseInt(full.slice(index * 2, index * 2 + 2), 16)
}

function mixHex(from: string, to: string, amount: number): string {
  const channel = (index: number) =>
    Math.round(colorChannel(from, index) * (1 - amount) + colorChannel(to, index) * amount)
      .toString(16)
      .padStart(2, '0')

  return `#${channel(0)}${channel(1)}${channel(2)}`
}

function onAccentColor(accent: string): string {
  const red = colorChannel(accent, 0)
  const green = colorChannel(accent, 1)
  const blue = colorChannel(accent, 2)
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255
  return luminance > 0.62 ? '#0f172a' : '#ffffff'
}

export function customTheme(input: { background: string; accent: string; text: string }): PageTheme {
  const red = colorChannel(input.background, 0)
  const green = colorChannel(input.background, 1)
  const blue = colorChannel(input.background, 2)
  const dark = (0.299 * red + 0.587 * green + 0.114 * blue) / 255 < 0.45

  return {
    id: 'custom',
    name: 'Custom',
    background: input.background,
    accent: input.accent,
    text: input.text,
    muted: mixHex(input.text, input.background, 0.35),
    surface: dark ? mixHex(input.background, '#ffffff', 0.1) : mixHex(input.background, '#0f172a', 0.05),
    onAccent: onAccentColor(input.accent),
  }
}

function isHexColor(value: unknown): value is string {
  return typeof value === 'string' && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value)
}

export function normalizeTheme(value: Partial<PageTheme> | undefined): PageTheme {
  const preset = siteThemes.find((theme) => theme.id === value?.id)
  if (preset) return { ...preset }

  if (value && isHexColor(value.background) && isHexColor(value.accent) && isHexColor(value.text)) {
    return customTheme({
      background: value.background,
      accent: value.accent,
      text: value.text,
    })
  }

  return { ...siteThemes[0] }
}

export function paintElement(element: EditorElement, theme: PageTheme): EditorElement {
  const painted = applyThemeColors(element, theme)
  return {
    ...painted,
    borderColor: theme.muted,
    shadowColor: theme.text,
  }
}

function applyThemeColors(element: EditorElement, theme: PageTheme): EditorElement {
  if (element.type === 'heading') {
    return {
      ...element,
      color: theme.text,
      backgroundColor: element.backgroundColor === 'transparent' ? 'transparent' : theme.surface,
    }
  }

  if (element.type === 'paragraph') {
    return {
      ...element,
      color: theme.muted,
      backgroundColor: element.backgroundColor === 'transparent' ? 'transparent' : theme.surface,
    }
  }

  if (element.type === 'button') {
    if (element.design === 'button-outline') {
      return { ...element, color: theme.accent, backgroundColor: 'transparent' }
    }
    if (element.design === 'button-soft') {
      return { ...element, color: theme.accent, backgroundColor: theme.surface }
    }
    return { ...element, color: theme.onAccent, backgroundColor: theme.accent }
  }

  if (element.type === 'footer') {
    return { ...element, color: theme.background, backgroundColor: theme.text }
  }

  if (element.type === 'hero' || element.type === 'slider') {
    return { ...element, color: theme.onAccent, backgroundColor: theme.accent }
  }

  if (element.type === 'loader') {
    return { ...element, color: theme.accent, backgroundColor: 'transparent' }
  }

  if (element.type === 'checkbox') {
    return { ...element, color: theme.text, backgroundColor: 'transparent' }
  }

  if (element.type === 'form') {
    return { ...element, color: theme.text, backgroundColor: theme.accent }
  }

  if (element.type === 'modal') {
    return { ...element, color: theme.onAccent, backgroundColor: theme.accent }
  }

  return { ...element, color: theme.text, backgroundColor: theme.surface }
}

const starterCopy: Record<string, { heading: string; body: string; button: string }> = {
  'Business Website': {
    heading: 'A clearer way to present your business.',
    body: 'Explain what you do, who it is for, and why someone should get in touch.',
    button: 'Contact us',
  },
  'Online Store': {
    heading: 'Products worth coming back for.',
    body: 'Show what you sell, point to a favorite, and give shoppers a next step.',
    button: 'Shop now',
  },
  Portfolio: {
    heading: 'Selected work, presented simply.',
    body: 'Lead with the kind of projects you want more of, then say how to hire you.',
    button: 'View work',
  },
  Blog: {
    heading: 'Notes worth reading slowly.',
    body: 'Open with the idea of the publication, then invite people into the latest piece.',
    button: 'Read the latest',
  },
  'Landing Page': {
    heading: 'One offer. One clear next step.',
    body: 'Say what the visitor gets, remove the extra explanation, and ask for the action.',
    button: 'Get started',
  },
  'Restaurant Website': {
    heading: 'Seasonal plates, a short walk from the square.',
    body: 'Tell guests what you cook, when you are open, and how to reserve a table.',
    button: 'Reserve a table',
  },
}

function createElement(
  id: string,
  type: ElementType,
  text: string,
): EditorElement {
  return {
    id,
    type,
    text,
    note: '',
    color: type === 'button' ? '#ffffff' : '#0f172a',
    fontSize: type === 'heading' ? 40 : 16,
    backgroundColor: type === 'button' ? '#6d28d9' : 'transparent',
    borderRadius: type === 'button' ? 999 : 8,
    textAlign: 'center',
    marginTop: 0,
    marginBottom: 0,
    paddingTop: 0,
    paddingBottom: 0,
    width: 100,
    height: defaultHeight(type),
    borderWidth: 0,
    borderColor: '#94a3b8',
    borderStyle: 'none',
    shadowEnabled: false,
    shadowBlur: 16,
    shadowOffsetX: 0,
    shadowOffsetY: 8,
    shadowColor: '#0f172a',
    design: defaultDesign(type),
  }
}

export function createEditorElement(
  type: ElementType,
  id: string,
  design?: string,
): EditorElement {
  const preset = presetById(design, type)

  return {
    ...createElement(id, type, preset.text),
    design: preset.id,
    text: preset.text,
    color: preset.color,
    fontSize: preset.fontSize,
    backgroundColor: preset.backgroundColor,
    borderRadius: preset.borderRadius,
    textAlign: preset.textAlign,
    width: preset.width,
  }
}

function starterElements(projectType: string): EditorElement[] {
  const copy = starterCopy[projectType] ?? starterCopy['Business Website']
  const heading = createElement('heading-1', 'heading', copy.heading)
  const paragraph = createElement('paragraph-1', 'paragraph', copy.body)
  const button = createElement('button-1', 'button', copy.button)

  heading.marginBottom = 14
  paragraph.marginBottom = 28
  paragraph.color = '#475569'

  return [heading, paragraph, button]
}

function cloneElements(elements: EditorElement[]): EditorElement[] {
  return elements.map((element) => ({ ...element }))
}

function snapshot(page: EditorPage): PageSnapshot {
  return {
    elements: cloneElements(page.elements),
    theme: { ...page.theme },
  }
}

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

function loadPages(userId: string): Record<string, EditorPage> {
  if (!userId) return {}

  try {
    const saved = scopedItem('made-site-editor-pages', userId)
    if (!saved) return {}

    const pages = JSON.parse(saved) as Record<string, EditorPage>

    for (const page of Object.values(pages)) {
      page.elements = page.elements.map((element) => ({
        ...createElement(element.id, element.type, element.text),
        ...element,
        note: typeof element.note === 'string' ? element.note : '',
        width: typeof element.width === 'number' ? element.width : 100,
        height: typeof element.height === 'number' ? element.height : defaultHeight(element.type),
        borderWidth: typeof element.borderWidth === 'number' ? element.borderWidth : 0,
        borderColor: typeof element.borderColor === 'string' && element.borderColor
          ? element.borderColor
          : '#94a3b8',
        borderStyle: borderStyles.includes(element.borderStyle) ? element.borderStyle : 'none',
        shadowEnabled: element.shadowEnabled === true,
        shadowBlur: typeof element.shadowBlur === 'number' ? element.shadowBlur : 16,
        shadowOffsetX: typeof element.shadowOffsetX === 'number' ? element.shadowOffsetX : 0,
        shadowOffsetY: typeof element.shadowOffsetY === 'number' ? element.shadowOffsetY : 8,
        shadowColor: typeof element.shadowColor === 'string' && element.shadowColor
          ? element.shadowColor
          : '#0f172a',
        design: elementPresets.some((preset) => preset.id === element.design)
          ? element.design
          : defaultDesign(element.type),
      }))
      page.theme = normalizeTheme(page.theme)
    }

    return pages
  } catch {
    return {}
  }
}

export const useEditorStore = defineStore('editor', {
  state: () => ({
    userId: '',
    pages: {} as Record<string, EditorPage>,
    history: {} as Record<string, HistoryState>,
  }),

  actions: {
    useUser(userId: string) {
      if (this.userId === userId) return
      this.userId = userId
      this.pages = loadPages(userId)
      this.history = {}
    },

    ensurePage(projectId: string, projectType = 'Business Website') {
      if (!this.pages[projectId]) {
        const theme = { ...siteThemes[0] }
        this.pages[projectId] = {
          theme,
          elements: starterElements(projectType).map((element) => paintElement(element, theme)),
        }
        this.save()
      }

      if (!this.history[projectId]) {
        this.history[projectId] = { past: [], future: [] }
      }
    },

    seedPage(projectId: string, elements: EditorElement[], theme: PageTheme) {
      if (!this.pages[projectId]) {
        const nextTheme = normalizeTheme(theme)
        this.pages[projectId] = {
          theme: nextTheme,
          elements: cloneElements(elements).map((element) => paintElement(element, nextTheme)),
        }
        this.save()
      }

      if (!this.history[projectId]) {
        this.history[projectId] = { past: [], future: [] }
      }
    },

    setElements(projectId: string, next: EditorElement[], recordHistory = true) {
      this.ensurePage(projectId)

      if (recordHistory) {
        const history = this.history[projectId]
        history.past.push(snapshot(this.pages[projectId]))

        if (history.past.length > 50) history.past.shift()

        history.future = []
      }

      this.pages[projectId].elements = cloneElements(next)
      this.save()
    },

    setTheme(projectId: string, theme: PageTheme, recordHistory = true) {
      this.ensurePage(projectId)
      const page = this.pages[projectId]
      const next = normalizeTheme(theme)
      const same =
        page.theme.id === next.id &&
        page.theme.background === next.background &&
        page.theme.accent === next.accent &&
        page.theme.text === next.text

      if (same) return

      if (recordHistory) {
        const history = this.history[projectId]
        history.past.push(snapshot(page))

        if (history.past.length > 50) history.past.shift()

        history.future = []
      }

      page.theme = next
      page.elements = page.elements.map((element) => paintElement(element, next))
      this.save()
    },

    undo(projectId: string) {
      const history = this.history[projectId]
      const page = this.pages[projectId]
      if (!history || !page || history.past.length === 0) return

      history.future.push(snapshot(page))
      const previous = history.past.pop()
      if (!previous) return

      page.elements = previous.elements
      page.theme = { ...previous.theme }
      this.save()
    },

    redo(projectId: string) {
      const history = this.history[projectId]
      const page = this.pages[projectId]
      if (!history || !page || history.future.length === 0) return

      history.past.push(snapshot(page))
      const next = history.future.pop()
      if (!next) return

      page.elements = next.elements
      page.theme = { ...next.theme }
      this.save()
    },

    canUndo(projectId: string): boolean {
      return (this.history[projectId]?.past.length ?? 0) > 0
    },

    canRedo(projectId: string): boolean {
      return (this.history[projectId]?.future.length ?? 0) > 0
    },

    clearPages() {
      this.pages = {}
      this.history = {}
      this.save()
    },

    save() {
      if (!this.userId) return
      localStorage.setItem(`made-site-editor-pages:${this.userId}`, JSON.stringify(this.pages))
    },
  },
})
