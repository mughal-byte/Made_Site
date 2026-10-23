<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  BellOff,
  CheckCheck,
  ChevronRight,
  ExternalLink,
  Inbox,
  Trash2,
} from 'lucide-vue-next'
import DashboardShell from '../components/layout/DashboardShell.vue'
import { useInboxStore, type InboxItem } from '../stores/inbox'
import { useToastStore } from '../stores/toast'

const route = useRoute()
const router = useRouter()
const inbox = useInboxStore()
const toast = useToastStore()

const openId = ref('')

function formatTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Just now'

  const diff = Date.now() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} min ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hr ago`

  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

const unread = computed(() => inbox.items.filter((item) => !item.read).length)

async function openItem(item: InboxItem) {
  openId.value = item.id
  if (!item.read) await inbox.markRead(item.id)
}

function openTarget(item: InboxItem) {
  if (!item.link) return
  router.push(item.link)
}

async function clearAll() {
  if (inbox.items.length === 0) return

  const confirmed = window.confirm('Remove every notification from this list?')
  if (!confirmed) return

  await inbox.clearAll()
  openId.value = ''
  toast.success('Notifications cleared', 'The list is empty now.')
}

async function markAll() {
  if (unread.value === 0) return

  await inbox.markAllRead()
  toast.success('All caught up', 'Every notification is marked as read.')
}

function onQueryChange() {
  const id = typeof route.query.id === 'string' ? route.query.id : ''
  if (!id) return

  const item = inbox.items.find((entry) => entry.id === id)
  if (!item) return

  void openItem(item)
}

watch(() => route.query.id, onQueryChange)

onMounted(async () => {
  await inbox.refresh()
  onQueryChange()
})
</script>

<template>
  <DashboardShell>
    <div class="mx-auto max-w-4xl">
      <p class="text-xs font-medium uppercase tracking-[0.14em] text-violet-300">Inbox</p>
      <h1 class="mt-2 text-3xl font-semibold tracking-tight text-white">Notifications</h1>
      <p class="mt-2 max-w-xl text-sm leading-6 text-slate-400">
        Every message sent to this account. Open one to read it in full.
      </p>

      <div class="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
          :disabled="unread === 0"
          @click="markAll"
        >
          <CheckCheck class="size-4" />
          Mark all as read
        </button>

        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg border border-red-900/80 px-4 py-2.5 text-sm font-medium text-red-300 hover:bg-red-950/60 disabled:cursor-not-allowed disabled:opacity-40"
          :disabled="inbox.items.length === 0"
          @click="clearAll"
        >
          <Trash2 class="size-4" />
          Clear all
        </button>

        <span class="text-sm text-slate-500">
          {{ inbox.items.length }} total · {{ unread }} unread
        </span>
      </div>

      <div
        v-if="inbox.items.length"
        class="mt-6 space-y-2"
      >
        <div
          v-for="item in inbox.items"
          :key="item.id"
          class="overflow-hidden rounded-xl border bg-slate-900/50 transition"
          :class="
            openId === item.id
              ? 'border-violet-500/60'
              : item.read
                ? 'border-slate-800'
                : 'border-slate-700'
          "
        >
          <button
            type="button"
            class="flex w-full items-start gap-3 px-4 py-4 text-left transition hover:bg-slate-900"
            :aria-expanded="openId === item.id"
            @click="openItem(item)"
          >
            <span
              class="mt-1.5 size-2 shrink-0 rounded-full"
              :class="item.read ? 'bg-slate-600' : 'bg-violet-400'"
            ></span>

            <span class="min-w-0 flex-1">
              <span class="flex flex-wrap items-center gap-2">
                <span class="text-sm font-semibold text-white">{{ item.title }}</span>
                <span
                  v-if="!item.read"
                  class="rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-300"
                >
                  New
                </span>
              </span>

              <span
                v-if="openId !== item.id && item.body"
                class="mt-1 block truncate text-sm text-slate-400"
              >
                {{ item.body }}
              </span>

              <span class="mt-1.5 block text-xs text-slate-500">
                {{ formatTime(item.createdAt) }}
                <span v-if="item.senderName"> · from {{ item.senderName }}</span>
              </span>
            </span>

            <ChevronRight
              class="mt-0.5 size-4 shrink-0 text-slate-500 transition"
              :class="openId === item.id ? 'rotate-90' : ''"
            />
          </button>

          <div
            v-if="openId === item.id"
            class="border-t border-slate-800 bg-slate-950 px-4 py-4"
          >
            <p class="text-sm leading-6 text-slate-200">
              {{ item.body || 'This notification has no extra message.' }}
            </p>

            <div class="mt-4 flex flex-wrap items-center gap-3">
              <button
                v-if="item.link"
                type="button"
                class="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-500"
                @click="openTarget(item)"
              >
                <ExternalLink class="size-4" />
                Open
              </button>

              <span class="text-xs text-slate-500">
                Sent {{ formatTime(item.createdAt) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        v-else
        class="mt-6 rounded-xl border border-dashed border-slate-700 px-6 py-16 text-center"
      >
        <BellOff class="mx-auto size-6 text-slate-600" />
        <h2 class="mt-4 text-lg font-semibold text-white">No notifications yet</h2>
        <p class="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-400">
          Messages sent to this account will show up here.
        </p>
      </div>

      <div class="mt-6 flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm text-slate-400">
        <Inbox class="size-4 shrink-0 text-slate-500" />
        Clearing the bell popup only hides it there. This list keeps everything until you
        clear it here.
      </div>
    </div>
  </DashboardShell>
</template>
