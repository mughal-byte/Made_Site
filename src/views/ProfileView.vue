<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  AtSign,
  Bell,
  BellOff,
  Camera,
  KeyRound,
  LoaderCircle,
  ShieldCheck,
  Trash2,
  TriangleAlert,
  UserRound,
} from 'lucide-vue-next'
import DashboardShell from '../components/layout/DashboardShell.vue'
import { useAuthStore } from '../stores/auth'
import { useNotificationsStore } from '../stores/notifications'
import { useToastStore } from '../stores/toast'

const auth = useAuthStore()
const notifications = useNotificationsStore()
const toast = useToastStore()

const name = ref(auth.user?.name ?? '')
const email = ref(auth.user?.email ?? '')
const preview = ref(auth.user?.avatar ?? '')
const avatarData = ref<string | null>(null)
const currentPassword = ref('')
const newPassword = ref('')
const pending = ref(false)

const acceptedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
const maxPhotoSize = 1_500_000
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

watch(
  () => auth.user?.email,
  (value) => {
    if (value) email.value = value
  },
)

const emailChanged = computed(
  () => email.value.trim().toLowerCase() !== (auth.user?.email ?? '').toLowerCase(),
)

const needsPasswordForEmail = computed(
  () => emailChanged.value && auth.user?.provider === 'password',
)

function initial() {
  return name.value.trim().charAt(0).toUpperCase() || 'M'
}

function providerLabel() {
  switch (auth.user?.provider) {
    case 'google':
      return 'Google account'
    case 'github':
      return 'GitHub account'
    default:
      return 'Email and password'
  }
}

function onPhoto(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  if (!acceptedTypes.includes(file.type)) {
    toast.error('That photo cannot be used', 'Use a PNG, JPG, WEBP, or GIF image.')
    input.value = ''
    return
  }

  if (file.size > maxPhotoSize) {
    toast.error('That photo is too large', 'Keep the photo under 1.5 MB.')
    input.value = ''
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    avatarData.value = String(reader.result ?? '')
    preview.value = avatarData.value
    toast.info('Photo selected', 'Save the profile to keep this photo.')
  }
  reader.onerror = () => {
    toast.error('That image could not be read', 'Try a different file.')
  }
  reader.readAsDataURL(file)
}

function clearPhoto() {
  avatarData.value = ''
  preview.value = ''
  toast.info('Photo removed', 'Save the profile to apply the change.')
}

async function save() {
  const nextEmail = email.value.trim().toLowerCase()
  const emailWasChanged = emailChanged.value

  if (emailWasChanged && !emailPattern.test(nextEmail)) {
    toast.error('That email is not valid', 'Use a format like name@example.com.')
    return
  }

  if (needsPasswordForEmail.value && !currentPassword.value) {
    toast.error(
      'Confirm with your password',
      'Enter your current password to change the email address.',
    )
    return
  }

  pending.value = true

  const body: {
    name: string
    email?: string
    avatar?: string
    currentPassword?: string
    newPassword?: string
  } = { name: name.value.trim() }

  if (emailWasChanged) body.email = nextEmail
  if (avatarData.value !== null) body.avatar = avatarData.value
  if (newPassword.value || needsPasswordForEmail.value) {
    body.currentPassword = currentPassword.value
  }
  if (newPassword.value) body.newPassword = newPassword.value

  const result = await auth.updateProfile(body)
  pending.value = false

  if (!result.ok) {
    toast.error('Profile could not be saved', result.error || 'Try again in a moment.')
    return
  }

  currentPassword.value = ''
  newPassword.value = ''
  avatarData.value = null
  preview.value = auth.user?.avatar ?? ''

  if (emailWasChanged) {
    toast.success(
      'Email changed',
      `Sign in from now on with ${nextEmail}.`,
    )
    notifications.notify('Email changed', `Your account email is now ${nextEmail}.`)
    return
  }

  toast.success('Profile saved', 'Your name, photo, and password were updated.')
  notifications.notify('Profile saved', 'Your account details were updated.')
}

const permissionLabel = computed(() => {
  switch (notifications.permission) {
    case 'granted':
      return 'Allowed by this browser'
    case 'denied':
      return 'Blocked by this browser'
    case 'unsupported':
      return 'Not supported by this browser'
    default:
      return 'Not asked yet'
  }
})

const permissionTone = computed(() => {
  switch (notifications.permission) {
    case 'granted':
      return 'text-emerald-300'
    case 'denied':
      return 'text-red-300'
    default:
      return 'text-slate-400'
  }
})

async function toggleNotifications() {
  const wasEnabled = notifications.enabled

  const result = await notifications.toggle()

  if (!result.ok) {
    toast.error('Notifications stay off', result.error || 'This browser blocked the request.')
    return
  }

  if (notifications.enabled) {
    toast.success(
      'Notifications are on',
      'Alerts appear as system notifications on this device.',
    )
    return
  }

  if (wasEnabled) {
    toast.info('Notifications are off', 'Nothing is sent to the system.')
  }
}

function sendTestNotification() {
  if (!notifications.active) {
    toast.error('Turn on notifications first', 'The switch above has to be on.')
    return
  }

  const sent = notifications.notify(
    'Test notification',
    'This is how alerts will look on this device.',
  )

  if (!sent) {
    toast.error('The browser refused the notification', 'Check the site permissions in your browser.')
    return
  }

  toast.success('Test sent', 'Look for it in your system notifications.')
}
</script>

<template>
  <DashboardShell>
    <div class="mx-auto max-w-6xl">
      <p class="text-xs font-medium uppercase tracking-[0.14em] text-violet-300">Account</p>
      <h1 class="mt-2 text-3xl font-semibold tracking-tight text-white">Profile</h1>
      <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
        Set the photo and name shown in the workspace, and decide whether this device may
        show system notifications.
      </p>

      <div class="mt-8 grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start">
        <aside class="space-y-5 lg:sticky lg:top-10">
          <section class="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
            <div class="flex items-center gap-2">
              <Camera class="size-4 text-violet-300" />
              <h2 class="text-sm font-semibold text-white">Profile photo</h2>
            </div>

            <div class="mt-5 flex flex-col items-center text-center">
              <img
                v-if="preview"
                :src="preview"
                alt=""
                class="size-28 rounded-full object-cover ring-2 ring-slate-800"
              />
              <span
                v-else
                class="grid size-28 place-items-center rounded-full bg-slate-800 text-3xl font-semibold text-violet-200"
              >
                {{ initial() }}
              </span>

              <p class="mt-3 text-xs leading-5 text-slate-500">
                PNG, JPG, WEBP, or GIF. Under 1.5 MB.
              </p>
            </div>

            <div class="mt-5 flex flex-col gap-2">
              <label
                class="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-500"
              >
                <Camera class="size-4" />
                Choose photo
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  class="sr-only"
                  @change="onPhoto"
                />
              </label>

              <button
                v-if="preview"
                type="button"
                class="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-900"
                @click="clearPhoto"
              >
                <Trash2 class="size-4" />
                Remove photo
              </button>
            </div>
          </section>

          <section class="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
            <div class="flex items-center gap-2">
              <ShieldCheck class="size-4 text-violet-300" />
              <h2 class="text-sm font-semibold text-white">Signed in with</h2>
            </div>
            <p class="mt-3 text-sm font-medium text-white">{{ providerLabel() }}</p>
            <p class="mt-1 break-words text-sm text-slate-400">{{ auth.user?.email }}</p>
          </section>
        </aside>

        <div class="space-y-6">
          <form class="space-y-6" @submit.prevent="save">
            <section class="rounded-xl border border-slate-800 bg-slate-900/50 p-5 sm:p-7">
              <div class="flex items-center gap-2">
                <UserRound class="size-4 text-violet-300" />
                <h2 class="text-sm font-semibold text-white">Account details</h2>
              </div>

              <label for="profile-name" class="mt-6 block text-sm font-medium text-slate-200">
                Name
              </label>
              <input
                id="profile-name"
                v-model="name"
                required
                minlength="2"
                maxlength="80"
                autocomplete="name"
                class="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-violet-500"
              />

              <label for="profile-email" class="mt-5 block text-sm font-medium text-slate-200">
                Email
              </label>
              <div class="relative mt-2">
                <AtSign
                  class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500"
                />
                <input
                  id="profile-email"
                  v-model="email"
                  type="email"
                  required
                  maxlength="254"
                  autocomplete="email"
                  class="w-full rounded-lg border bg-slate-950 py-2.5 pl-9 pr-3.5 text-sm text-white outline-none focus:border-violet-500"
                  :class="
                    emailChanged
                      ? 'border-violet-500 bg-violet-500/5'
                      : 'border-slate-700'
                  "
                />
              </div>
              <p class="mt-2 text-xs leading-5" :class="emailChanged ? 'text-violet-300' : 'text-slate-500'">
                {{
                  emailChanged
                    ? 'Save to use this address. You will sign in with it from now on.'
                    : 'This is the address you sign in with.'
                }}
              </p>
            </section>

            <section
              v-if="auth.user?.provider === 'password'"
              class="rounded-xl border border-slate-800 bg-slate-900/50 p-5 sm:p-7"
            >
              <div class="flex items-center gap-2">
                <KeyRound class="size-4 text-violet-300" />
                <h2 class="text-sm font-semibold text-white">Password</h2>
              </div>
              <p class="mt-2 text-sm leading-6 text-slate-400">
                Leave these blank to keep the current password.
              </p>
              <p
                v-if="needsPasswordForEmail"
                class="mt-3 rounded-lg border border-violet-500/40 bg-violet-500/10 px-3 py-2.5 text-sm leading-6 text-violet-200"
              >
                Your current password is required to confirm the new email address.
              </p>

              <label for="current-password" class="mt-5 block text-sm font-medium text-slate-200">
                Current password
              </label>
              <input
                id="current-password"
                v-model="currentPassword"
                type="password"
                autocomplete="current-password"
                class="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-violet-500"
              />

              <label for="new-password" class="mt-5 block text-sm font-medium text-slate-200">
                New password
              </label>
              <input
                id="new-password"
                v-model="newPassword"
                type="password"
                minlength="8"
                autocomplete="new-password"
                class="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-violet-500"
              />
              <p class="mt-2 text-xs leading-5 text-slate-500">
                Use at least 8 characters.
              </p>
            </section>

            <section class="rounded-xl border border-slate-800 bg-slate-900/50 p-5 sm:p-7">
              <div class="flex items-center gap-2">
                <Bell class="size-4 text-violet-300" />
                <h2 class="text-sm font-semibold text-white">Notifications</h2>
              </div>
              <p class="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                Turn this on to get real system alerts from Made Site on this device. Turn it
                off and nothing is sent to the system.
              </p>

              <div class="mt-6 flex items-start justify-between gap-4 rounded-lg border border-slate-800 bg-slate-950 px-4 py-4">
                <div class="min-w-0">
                  <p class="text-sm font-medium text-white">System notifications</p>
                  <p class="mt-1 text-xs leading-5" :class="permissionTone">
                    {{ permissionLabel }}
                  </p>
                </div>

                <button
                  type="button"
                  role="switch"
                  :aria-checked="notifications.enabled"
                  aria-label="System notifications"
                  :disabled="!notifications.supported"
                  class="relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                  :class="
                    notifications.enabled
                      ? 'bg-violet-600'
                      : 'bg-slate-700 hover:bg-slate-600'
                  "
                  @click="toggleNotifications"
                >
                  <span
                    class="absolute top-0.5 size-5 rounded-full bg-white transition-all"
                    :class="notifications.enabled ? 'left-[22px]' : 'left-0.5'"
                  ></span>
                </button>
              </div>

              <div class="mt-5 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  class="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
                  :disabled="!notifications.active"
                  @click="sendTestNotification"
                >
                  <BellOff v-if="!notifications.active" class="size-4" />
                  <Bell v-else class="size-4" />
                  Send a test notification
                </button>
              </div>

              <ul v-if="notifications.recent.length" class="mt-5 space-y-2 border-t border-slate-800 pt-5">
                <li
                  v-for="item in notifications.recent"
                  :key="item.id"
                  class="flex items-start gap-2 rounded-lg bg-slate-950 px-3 py-2.5"
                >
                  <TriangleAlert class="mt-0.5 size-4 shrink-0 text-violet-300" />
                  <div class="min-w-0">
                    <p class="truncate text-sm font-medium text-white">{{ item.title }}</p>
                    <p v-if="item.body" class="truncate text-xs text-slate-400">{{ item.body }}</p>
                  </div>
                </li>
              </ul>
            </section>

            <div
              class="flex flex-wrap items-center justify-end gap-4 rounded-xl border border-slate-800 bg-slate-900/50 px-5 py-4 sm:px-7"
            >
              <p class="mr-auto text-sm text-slate-500">
                Changes to your name, photo, and password are saved from here.
              </p>

              <button
                type="submit"
                class="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-60"
                :disabled="pending"
              >
                <LoaderCircle v-if="pending" class="size-4 animate-spin" />
                {{ pending ? 'Saving' : 'Save profile' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </DashboardShell>
</template>
