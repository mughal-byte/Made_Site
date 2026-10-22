import {
  createEditorElement,
  paintElement,
  siteThemes,
  type EditorElement,
  type ElementType,
  type PageTheme,
  type TextAlignment,
} from './editor'

export interface SiteTemplateBlock {
  type: ElementType
  text: string
  note?: string
  design?: string
  align?: TextAlignment
  width?: number
  marginTop?: number
  marginBottom?: number
  height?: number
}

export interface SiteTemplate {
  id: string
  name: string
  type: string
  summary: string
  themeId: string
  blocks: SiteTemplateBlock[]
}

export const siteTemplates: SiteTemplate[] = [
  {
    id: 'studio',
    name: 'Studio',
    type: 'Business Website',
    summary: 'A finished homepage with navigation, services, work, and a contact form.',
    themeId: 'violet',
    blocks: [
      { type: 'navbar', text: 'Studio', marginBottom: 0 },
      {
        type: 'hero',
        text: 'Work that feels considered.',
        note: 'A studio for brands that want a clear site.\nStart a project',
        marginBottom: 28,
        height: 300,
      },
      {
        type: 'paragraph',
        text: 'We design and build websites for teams who need the next page to explain itself.',
        marginBottom: 28,
      },
      { type: 'heading', text: 'Services', design: 'heading-rule', align: 'left', width: 100, marginTop: 8, marginBottom: 16 },
      { type: 'grid', text: 'Strategy · Identity · Websites', marginBottom: 28, height: 120 },
      { type: 'heading', text: 'Selected work', design: 'heading-rule', align: 'left', width: 100, marginBottom: 16 },
      { type: 'card', text: 'Brand system', note: 'A full identity for a product studio, from the name to the site.', align: 'left', marginBottom: 12 },
      { type: 'card', text: 'Marketing site', note: 'A launch page with one offer and a way to get in touch.', align: 'left', marginBottom: 28 },
      {
        type: 'slider',
        text: 'Clear structure.',
        note: 'Quiet visual design.\nA site people can finish.',
        marginBottom: 28,
      },
      { type: 'form', text: 'Send a note', note: 'Tell us about the project.', marginBottom: 36 },
      { type: 'footer', text: 'Studio', marginBottom: 0 },
    ],
  },
  {
    id: 'shop',
    name: 'Shop',
    type: 'Online Store',
    summary: 'A storefront with a featured row, two products, and a shop button.',
    themeId: 'amber',
    blocks: [
      { type: 'navbar', text: 'Shop', marginBottom: 0 },
      {
        type: 'hero',
        text: 'Objects for everyday use.',
        note: 'A small shop for things you keep.\nShop now',
        marginBottom: 28,
        height: 300,
      },
      {
        type: 'paragraph',
        text: 'Lead with what you sell, then point people toward a favorite.',
        marginBottom: 28,
      },
      { type: 'heading', text: 'Featured', design: 'heading-rule', align: 'left', width: 100, marginBottom: 16 },
      { type: 'grid', text: 'Ceramic cup · Linen towel · Oak tray', marginBottom: 28, height: 120 },
      { type: 'card', text: 'Ceramic cup', note: 'Stoneware, sold as a pair.', align: 'left', marginBottom: 12 },
      { type: 'card', text: 'Linen towel', note: 'Washed linen in two sizes.', align: 'left', marginBottom: 24 },
      { type: 'button', text: 'Shop the collection', width: 48, marginBottom: 36 },
      { type: 'footer', text: 'Shop', marginBottom: 0 },
    ],
  },
  {
    id: 'folio',
    name: 'Portfolio',
    type: 'Portfolio',
    summary: 'A dark portfolio with recent work, project notes, and a hiring button.',
    themeId: 'midnight',
    blocks: [
      { type: 'navbar', text: 'Portfolio', marginBottom: 0 },
      {
        type: 'hero',
        text: 'Selected work, presented simply.',
        note: 'Recent projects for studios and founders.\nView work',
        marginBottom: 28,
        height: 300,
      },
      { type: 'grid', text: 'Identity · Editorial · Product', marginBottom: 28, height: 120 },
      { type: 'tabs', text: 'Three recent projects, with the notes beside them.', marginBottom: 20 },
      { type: 'card', text: 'Northwind', note: 'Identity and a new site for a small studio.', align: 'left', marginBottom: 12 },
      { type: 'card', text: 'Field Notes', note: 'An editorial layout for a seasonal magazine.', align: 'left', marginBottom: 24 },
      { type: 'button', text: 'Hire me', width: 42, marginBottom: 36 },
      { type: 'footer', text: 'Portfolio', marginBottom: 0 },
    ],
  },
  {
    id: 'journal',
    name: 'Journal',
    type: 'Blog',
    summary: 'A writing page with a title and three finished article cards.',
    themeId: 'forest',
    blocks: [
      { type: 'header', text: 'Journal', marginBottom: 0 },
      {
        type: 'heading',
        text: 'Notes worth reading slowly.',
        design: 'heading-display',
        align: 'left',
        width: 100,
        marginTop: 12,
        marginBottom: 12,
      },
      {
        type: 'paragraph',
        text: 'A publication for short essays. Start with the latest piece, then keep what is still worth rereading.',
        align: 'left',
        marginBottom: 24,
      },
      { type: 'card', text: 'The latest essay', note: 'Why a short homepage still needs a point of view.', align: 'left', marginBottom: 12 },
      { type: 'card', text: 'A shorter note', note: 'What to cut before you publish.', align: 'left', marginBottom: 12 },
      { type: 'card', text: 'From the archive', note: 'A reread of last winter’s piece.', align: 'left', marginBottom: 32 },
      { type: 'footer', text: 'Journal', marginBottom: 0 },
    ],
  },
  {
    id: 'launch',
    name: 'Launch',
    type: 'Landing Page',
    summary: 'One offer, three reasons, and a form already on the page.',
    themeId: 'ocean',
    blocks: [
      { type: 'navbar', text: 'Launch', marginBottom: 0 },
      {
        type: 'hero',
        text: 'One offer. One clear next step.',
        note: 'Tell people what they get, then ask them to begin.\nGet started',
        marginBottom: 24,
        height: 300,
      },
      {
        type: 'paragraph',
        text: 'Keep the page to the promise, the proof, and the form.',
        marginBottom: 28,
      },
      { type: 'heading', text: 'Why it works', design: 'heading-rule', align: 'left', width: 100, marginBottom: 16 },
      { type: 'grid', text: 'One promise · One page · One action', marginBottom: 28, height: 120 },
      { type: 'form', text: 'Get started', note: 'Leave a name and an email. We reply within a day.', marginBottom: 36 },
      { type: 'footer', text: 'Launch', marginBottom: 0 },
    ],
  },
  {
    id: 'table',
    name: 'Table',
    type: 'Restaurant Website',
    summary: 'A restaurant page with tonight’s menu and a reservation form.',
    themeId: 'sunset',
    blocks: [
      { type: 'header', text: 'Table', marginBottom: 0 },
      {
        type: 'hero',
        text: 'Seasonal plates, served nightly.',
        note: 'A short menu, a quiet room, and a table when you want one.\nReserve',
        marginBottom: 28,
        height: 300,
      },
      { type: 'heading', text: 'Tonight', design: 'heading-rule', align: 'left', width: 100, marginBottom: 16 },
      { type: 'card', text: 'Market fish', note: 'Grilled, with lemon and herbs.', align: 'left', marginBottom: 12 },
      { type: 'card', text: 'Wood-fired bread', note: 'Served warm, with butter.', align: 'left', marginBottom: 12 },
      { type: 'card', text: 'Garden salad', note: 'Leaves, citrus, and olive oil.', align: 'left', marginBottom: 24 },
      { type: 'form', text: 'Reserve a table', note: 'Tell us the day, the time, and how many guests.', marginBottom: 36 },
      { type: 'footer', text: 'Table', marginBottom: 0 },
    ],
  },
]

export function templateTheme(themeId: string): PageTheme {
  return siteThemes.find((theme) => theme.id === themeId) ?? siteThemes[0]
}

export function pageFromTemplate(id: string): { elements: EditorElement[]; theme: PageTheme } | null {
  const template = siteTemplates.find((item) => item.id === id)
  if (!template) return null

  const theme = templateTheme(template.themeId)
  const elements = template.blocks.map((block) => {
    const element = paintElement(
      createEditorElement(block.type, crypto.randomUUID(), block.design),
      theme,
    )

    return {
      ...element,
      text: block.text,
      note: block.note ?? '',
      textAlign: block.align ?? element.textAlign,
      width: block.width ?? 100,
      marginTop: block.marginTop ?? element.marginTop,
      marginBottom: block.marginBottom ?? 16,
      height: block.height ?? element.height,
    }
  })

  return { elements, theme: { ...theme } }
}
