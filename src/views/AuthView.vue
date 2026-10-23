<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useToastStore } from '../stores/toast'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const toast = useToastStore()

const name = ref('')
const email = ref('')
const password = ref('')
const pending = ref(false)

const isRegister = computed(() => route.name === 'register')

const redirect = computed(() => {
  const value = route.query.redirect
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') ? value : '/'
})

const queryError = computed(() => {
  switch (route.query.error) {
    case 'google':
      return 'Google sign-in is not turned on for this server yet.'
    case 'github':
      return 'GitHub sign-in is not turned on for this server yet.'
    case 'denied':
      return 'The sign-in was cancelled.'
    case 'failed':
      return 'Sign-in did not finish. Try again.'
    default:
      return ''
  }
})

const linkQuery = computed(() => {
  const value = route.query.redirect
  return typeof value === 'string' ? { redirect: value } : {}
})

watch(
  () => route.query.error,
  () => {
    const message = queryError.value
    if (message) toast.error('Sign-in did not finish', message)
  },
  { immediate: true },
)

function providerHref(provider: 'google' | 'github') {
  return `/api/auth/${provider}/start?next=${encodeURIComponent(redirect.value)}`
}

async function submit() {
  pending.value = true

  const result = isRegister.value
    ? await auth.register(name.value, email.value, password.value)
    : await auth.login(email.value, password.value)

  pending.value = false
  if (!result.ok) {
    toast.error(
      isRegister.value ? 'Account could not be created' : 'Sign-in failed',
      result.error || 'Try again in a moment.',
    )
    return
  }

  toast.success(
    isRegister.value ? 'Account created' : 'Welcome back',
    'You are signed in.',
  )

  router.push(redirect.value)
}
</script>

<template>
  <main class="min-h-screen bg-slate-950 px-5 py-10 text-slate-100 sm:px-8">
    <div class="mx-auto max-w-md">
      <div class="flex items-center gap-3">
        <img src="/logo.png" alt="" class="size-9 rounded-lg object-cover" />
        <p class="text-sm font-semibold tracking-tight text-white">Made Site</p>
      </div>

      <p class="mt-8 text-xs font-medium uppercase tracking-[0.14em] text-violet-300">
        {{ isRegister ? 'Create account' : 'Sign in' }}
      </p>
      <h1 class="mt-2 text-3xl font-semibold tracking-tight text-white">
        {{ isRegister ? 'Register' : 'Welcome back' }}
      </h1>
      <p class="mt-2 text-sm leading-6 text-slate-400">
        Only a signed-in account can open the workspace. Use email, Google, or GitHub.
      </p>

      <form class="mt-8 space-y-4" @submit.prevent="submit">
        <div v-if="isRegister">
          <label for="name" class="block text-sm font-medium text-slate-200">Name</label>
          <input
            id="name"
            v-model="name"
            required
            maxlength="80"
            autocomplete="name"
            class="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-violet-500"
          />
        </div>

        <div>
          <label for="email" class="block text-sm font-medium text-slate-200">Email</label>
          <input
            id="email"
            v-model="email"
            required
            type="email"
            autocomplete="email"
            class="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-violet-500"
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-slate-200">Password</label>
          <input
            id="password"
            v-model="password"
            required
            type="password"
            minlength="8"
            :autocomplete="isRegister ? 'new-password' : 'current-password'"
            class="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-violet-500"
          />
        </div>

        <button
          type="submit"
          class="w-full rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-60"
          :disabled="pending"
        >
          {{ isRegister ? 'Create account' : 'Sign in' }}
        </button>
      </form>

      <div class="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.14em] text-slate-500">
        <span class="h-px flex-1 bg-slate-800"></span>
        or
        <span class="h-px flex-1 bg-slate-800"></span>
      </div>

      <div class="space-y-3">
        <a
          :href="providerHref('google')"
          class="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-700 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-100"
        >
          <svg viewBox="0 0 24 24" class="size-4" aria-hidden="true">
            <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.6 5.6 0 0 1-2.4 3.7v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8Z" />
            <path fill="#34A853" d="M12 24c3.2 0 5.9-1 7.9-2.9l-3.9-3c-1 .7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1A12 12 0 0 0 12 24Z" />
            <path fill="#FBBC05" d="M5.4 14.4A7.2 7.2 0 0 1 5 12c0-.8.1-1.6.4-2.4V6.5H1.4A12 12 0 0 0 0 12c0 1.9.5 3.8 1.4 5.5l4-3.1Z" />
            <path fill="#EA4335" d="M12 4.8c1.7 0 3.3.6 4.5 1.8l3.4-3.4A12 12 0 0 0 1.4 6.5l4 3.1C6.3 6.9 8.9 4.8 12 4.8Z" />
          </svg>
          Continue with Google
        </a>
        <a
          :href="providerHref('github')"
          class="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
        >
          <svg viewBox="0 0 24 24" class="size-4 fill-current" aria-hidden="true">
            <path d="M12 2C6.5 2 2 6.6 2 12.2c0 4.5 2.9 8.3 6.9 9.6.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.2-3.4-1.2-.4-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.6-1.4-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1a9.4 9.4 0 0 1 5 0c2-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.3 4.7-4.6 5 .4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5A10.2 10.2 0 0 0 22 12.2C22 6.6 17.5 2 12 2Z" />
          </svg>
          Continue with GitHub
        </a>
      </div>

      <p class="mt-6 text-sm text-slate-400">
        <template v-if="isRegister">
          Already have an account?
          <RouterLink class="font-medium text-violet-300 hover:text-violet-200" :to="{ name: 'login', query: linkQuery }">
            Sign in
          </RouterLink>
        </template>
        <template v-else>
          New to Made Site?
          <RouterLink class="font-medium text-violet-300 hover:text-violet-200" :to="{ name: 'register', query: linkQuery }">
            Create an account
          </RouterLink>
        </template>
      </p>
    </div>
  </main>
</template>
