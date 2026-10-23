<script setup lang="ts">
import { onMounted, ref } from 'vue'
import {
  CheckCheck,
  LoaderCircle,
  Send,
  ShieldCheck,
  Users,
  UserRound,
} from 'lucide-vue-next'
import DashboardShell from '../components/layout/DashboardShell.vue'
import { useToastStore } from '../stores/toast'

interface SentNotification {
  id: string
  title: string
  body: string
  link: string
  createdAt: string
  senderName: string
  audienceEmails: string[]
}

const toast = useToastStore()

const title = ref('')
const message = ref('')
const link = ref('')
const target = ref<'all' | 'user'>('all')
const userEmail = ref('')
const pending = ref(false)
const sent = ref<SentNotification[]>([])
const accounts = ref<string[]>([])

function formatTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Just now'

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

async function loadSent() {
  try {
    const response = await fetch('/api/notifications/admin')
    if (!response.ok) return

    const data = (await response.json()) as {
      notifications?: SentNotification[]
      accounts?: string[]
    }

    sent.value = data.notifications ?? []
    accounts.value = data.accounts ?? []
  } catch {
    // ignore
  }
}

async function send() {
  const cleanTitle = title.value.trim()
  const cleanMessage = message.value.trim()

  if (cleanTitle.length < 2) {
    toast.error('Enter a title', 'The notification needs a short title.')
    return
  }

  if (target.value === 'user' && !userEmail.value.trim()) {
    toast.error('Choose a user', 'Type the email address you want to notify.')
    return
  }

  pending.value = true

  try {
    const response = await fetch('/api/notifications', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-made-site': '1',
      },
      body: JSON.stringify({
        title: cleanTitle,
        body: cleanMessage,
        link: link.value.trim(),
        target: target.value === 'all' ? 'all' : userEmail.value.trim(),
      }),
    })

    const data = (await response.json()) as { error?: string; recipients?: number }

    if (!response.ok) {
      toast.error('Notification was not sent', data.error || 'Try again in a moment.')
      return
    }

    toast.success(
      'Notification sent',
      data.recipients === 1
        ? 'One account received it.'
        : `${data.recipients ?? 0} accounts received it.`,
    )

    title.value = ''
    message.value = ''
    link.value = ''
    await loadSent()
  } catch {
    toast.error('Notification was not sent', 'The server could not be reached.')
  } finally {
    pending.value = false
  }
}

onMounted(loadSent)
</script>

<template>
  <DashboardShell>
    <div class="mx-auto max-w-4xl">
      <p class="text-xs font-medium uppercase tracking-[0.14em] text-violet-300">Admin</p>
      <h1 class="mt-2 text-3xl font-semibold tracking-tight text-white">
        Send notifications
      </h1>
      <p class="mt-2 max-w-xl text-sm leading-6 text-slate-400">
        Send a message to every account on this server, or to one account by email.
      </p>

      <div class="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <section class="rounded-xl border border-slate-800 bg-slate-900/50 p-5 sm:p-7">
          <form class="space-y-6" @submit.prevent="send">
            <div>
              <label for="notify-title" class="block text-sm font-medium text-slate-200">
                Title
              </label>
              <input
                id="notify-title"
                v-model="title"
                required
                maxlength="120"
                placeholder="Scheduled maintenance"
                class="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500"
              />
            </div>

            <div>
              <label for="notify-body" class="block text-sm font-medium text-slate-200">
                Message
              </label>
              <textarea
                id="notify-body"
                v-model="message"
                rows="4"
                maxlength="600"
                placeholder="Tell people what changed."
                class="mt-2 w-full resize-y rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500"
              ></textarea>
            </div>

            <div>
              <label for="notify-link" class="block text-sm font-medium text-slate-200">
                Link <span class="font-normal text-slate-500">(optional)</span>
              </label>
              <input
                id="notify-link"
                v-model="link"
                placeholder="/projects/abc/editor"
                class="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500"
              />
            </div>

            <div>
              <p class="text-sm font-medium text-slate-200">Send to</p>
              <div class="mt-3 grid gap-3 sm:grid-cols-2" role="group" aria-label="Send to">
                <button
                  type="button"
                  class="rounded-lg border p-4 text-left transition"
                  :class="
                    target === 'all'
                      ? 'border-violet-500 bg-violet-500/10'
                      : 'border-slate-800 hover:border-slate-700'
                  "
                  :aria-pressed="target === 'all'"
                  @click="target = 'all'"
                >
                  <span class="flex items-center gap-2 text-sm font-medium text-white">
                    <Users class="size-4" />
                    All users
                  </span>
                  <span class="mt-1 block text-sm leading-6 text-slate-400">
                    Everyone with an account on this server.
                  </span>
                </button>

                <button
                  type="button"
                  class="rounded-lg border p-4 text-left transition"
                  :class="
                    target === 'user'
                      ? 'border-violet-500 bg-violet-500/10'
                      : 'border-slate-800 hover:border-slate-700'
                  "
                  :aria-pressed="target === 'user'"
                  @click="target = 'user'"
                >
                  <span class="flex items-center gap-2 text-sm font-medium text-white">
                    <UserRound class="size-4" />
                    One user
                  </span>
                  <span class="mt-1 block text-sm leading-6 text-slate-400">
                    Only the account with that email.
                  </span>
                </button>
              </div>
            </div>

            <div v-if="target === 'user'">
              <label for="notify-email" class="block text-sm font-medium text-slate-200">
                Account email
              </label>
              <input
                id="notify-email"
                v-model="userEmail"
                type="email"
                list="account-emails"
                placeholder="name@example.com"
                class="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500"
              />
              <datalist id="account-emails">
                <option v-for="account in accounts" :key="account" :value="account"></option>
              </datalist>
            </div>

            <div class="flex justify-end">
              <button
                type="submit"
                class="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-60"
                :disabled="pending"
              >
                <LoaderCircle v-if="pending" class="size-4 animate-spin" />
                <Send v-else class="size-4" />
                {{ pending ? 'Sending' : 'Send notification' }}
              </button>
            </div>
          </form>
        </section>

        <aside class="space-y-4">
          <section class="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
            <div class="flex items-center gap-2">
              <ShieldCheck class="size-4 text-violet-300" />
              <h2 class="text-sm font-semibold text-white">Accounts</h2>
            </div>
            <p class="mt-3 text-sm text-slate-400">
              {{ accounts.length }} account{{ accounts.length === 1 ? '' : 's' }} can receive
              notifications.
            </p>
            <ul class="mt-3 max-h-56 space-y-1 overflow-auto">
              <li
                v-for="account in accounts"
                :key="account"
                class="truncate rounded-lg bg-slate-950 px-3 py-2 text-xs text-slate-400"
              >
                {{ account }}
              </li>
            </ul>
          </section>

          <section class="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
            <div class="flex items-center gap-2">
              <CheckCheck class="size-4 text-violet-300" />
              <h2 class="text-sm font-semibold text-white">Sent</h2>
            </div>

            <p v-if="!sent.length" class="mt-3 text-sm text-slate-500">
              Nothing sent yet.
            </p>

            <ul v-else class="mt-3 space-y-2">
              <li
                v-for="item in sent"
                :key="item.id"
                class="rounded-lg bg-slate-950 px-3 py-2.5"
              >
                <p class="text-sm font-medium text-white">{{ item.title }}</p>
                <p v-if="item.body" class="mt-0.5 text-xs leading-5 text-slate-400">
                  {{ item.body }}
                </p>
                <p class="mt-1 text-[11px] text-slate-500">
                  {{ formatTime(item.createdAt) }} ·
                  {{ item.audienceEmails.length }} recipient{{
                    item.audienceEmails.length === 1 ? '' : 's'
                  }}
                </p>
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  </DashboardShell>
</template>
