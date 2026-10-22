<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

const name = ref(auth.user?.name ?? '')
const preview = ref(auth.user?.avatar ?? '')
const avatarData = ref<string | null>(null)
const currentPassword = ref('')
const newPassword = ref('')
const error = ref('')
const saved = ref(false)
const pending = ref(false)

function initial() {
  return name.value.trim().charAt(0).toUpperCase() || 'M'
}

function onPhoto(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  saved.value = false
  const reader = new FileReader()
  reader.onload = () => {
    avatarData.value = String(reader.result ?? '')
    preview.value = avatarData.value
  }
  reader.readAsDataURL(file)
}

function clearPhoto() {
  avatarData.value = ''
  preview.value = ''
  saved.value = false
}

async function save() {
  error.value = ''
  saved.value = false
  pending.value = true

  const body: {
    name: string
    avatar?: string
    currentPassword?: string
    newPassword?: string
  } = { name: name.value.trim() }

  if (avatarData.value !== null) body.avatar = avatarData.value
  if (newPassword.value) {
    body.currentPassword = currentPassword.value
    body.newPassword = newPassword.value
  }

  const result = await auth.updateProfile(body)
  pending.value = false

  if (!result.ok) {
    error.value = result.error || 'Profile could not be saved.'
    return
  }

  currentPassword.value = ''
  newPassword.value = ''
  avatarData.value = null
  preview.value = auth.user?.avatar ?? ''
  saved.value = true
}
</script>

<template>
  <main class="min-h-screen bg-slate-950 px-5 py-10 text-slate-100 sm:px-8">
    <div class="mx-auto max-w-xl">
      <button
        type="button"
        class="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
        @click="router.push('/')"
      >
        <ArrowLeft class="size-4" />
        Dashboard
      </button>

      <p class="mt-8 text-xs font-medium uppercase tracking-[0.14em] text-violet-300">Account</p>
      <h1 class="mt-2 text-3xl font-semibold tracking-tight text-white">Profile</h1>
      <p class="mt-2 text-sm leading-6 text-slate-400">
        Set the name and photo shown in the workspace.
      </p>

      <form class="mt-8 rounded-xl border border-slate-800 bg-slate-900/50 p-5 sm:p-7" @submit.prevent="save">
        <div class="flex items-center gap-4">
          <img
            v-if="preview"
            :src="preview"
            alt=""
            class="size-16 rounded-full object-cover"
          />
          <span
            v-else
            class="grid size-16 place-items-center rounded-full bg-slate-800 text-lg font-semibold text-violet-200"
          >
            {{ initial() }}
          </span>
          <div class="flex flex-wrap gap-2">
            <label class="cursor-pointer rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800">
              Upload photo
              <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" class="sr-only" @change="onPhoto" />
            </label>
            <button
              v-if="preview"
              type="button"
              class="rounded-lg px-3 py-2 text-sm text-slate-400 hover:text-white"
              @click="clearPhoto"
            >
              Remove
            </button>
          </div>
        </div>

        <label for="profile-name" class="mt-7 block text-sm font-medium text-slate-200">Name</label>
        <input
          id="profile-name"
          v-model="name"
          required
          minlength="2"
          maxlength="80"
          autocomplete="name"
          class="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-violet-500"
        />

        <label for="profile-email" class="mt-5 block text-sm font-medium text-slate-200">Email</label>
        <input
          id="profile-email"
          :value="auth.user?.email"
          readonly
          class="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-400"
        />

        <div v-if="auth.user?.provider === 'password'" class="mt-7 border-t border-slate-800 pt-7">
          <p class="text-sm font-medium text-slate-200">Password</p>
          <p class="mt-1 text-sm text-slate-500">Leave these blank to keep the current password.</p>
          <label for="current-password" class="mt-4 block text-sm text-slate-400">Current password</label>
          <input
            id="current-password"
            v-model="currentPassword"
            type="password"
            autocomplete="current-password"
            class="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-violet-500"
          />
          <label for="new-password" class="mt-4 block text-sm text-slate-400">New password</label>
          <input
            id="new-password"
            v-model="newPassword"
            type="password"
            minlength="8"
            autocomplete="new-password"
            class="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-violet-500"
          />
        </div>

        <p v-if="error" class="mt-5 text-sm text-red-300">{{ error }}</p>
        <p v-else-if="saved" class="mt-5 text-sm text-emerald-300">Profile saved.</p>

        <div class="mt-7 flex justify-end">
          <button
            type="submit"
            class="rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-60"
            :disabled="pending"
          >
            Save profile
          </button>
        </div>
      </form>
    </div>
  </main>
</template>
