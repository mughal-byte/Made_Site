<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  Bell,
  BellOff,
  ChevronDown,
  FolderOpen,
  LayoutDashboard,
  LayoutTemplate,
  LogOut,
  Settings,
  ShieldCheck,
  UserRound,
} from 'lucide-vue-next'
import { useAuthStore } from '../../stores/auth'
import { useInboxStore } from '../../stores/inbox'
import { useToastStore } from '../../stores/toast'

export type DashboardSection = 'dashboard' | 'projects' | 'templates' | 'settings'

const props = defineProps<{
  active?: DashboardSection | null
}>()

const router = useRouter()
const auth = useAuthStore()
const inbox = useInboxStore()
const toast = useToastStore()

const openMenu = ref<'bell' | 'profile' | null>(null)

const nav = [
  { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'projects' as const, label: 'Projects', icon: FolderOpen },
  { id: 'templates' as const, label: 'Templates', icon: LayoutTemplate },
  { id: 'settings' as const, label: 'Settings', icon: Settings },
]

const accountInitial = computed(
  () => auth.user?.name.trim().charAt(0).toUpperCase() || 'M',
)

function toggleMenu(menu: 'bell' | 'profile') {
  openMenu.value = openMenu.value === menu ? null : menu
}

function openSection(id: DashboardSection) {
  if (id === 'dashboard') {
    router.push('/')
    return
  }

  router.push({ path: '/', query: { section: id } })
}

async function clearBell() {
  await inbox.clearPopup()
  toast.info('Bell cleared', 'The notifications list still keeps every message.')
}

function seeAllNotifications() {
  openMenu.value = null
  router.push('/notifications')
}

function openNotification(id: string) {
  openMenu.value = null
  router.push({ path: '/notifications', query: { id } })
}

function onPointerDown(event: PointerEvent) {
  const target = event.target
  if (target instanceof Element && target.closest('[data-menu]')) return
  openMenu.value = null
}

async function signOut() {
  openMenu.value = null
  await auth.logout()
  toast.info('Signed out', 'You can sign in again at any time.')
  router.push('/login')
}

onMounted(() => window.addEventListener('pointerdown', onPointerDown))
onUnmounted(() => window.removeEventListener('pointerdown', onPointerDown))
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100">
    <header
      class="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-slate-800 bg-slate-950 px-4 sm:px-5"
    >
      <button
        type="button"
        class="flex min-w-0 items-center gap-3"
        @click="openSection('dashboard')"
      >
        <img src="/logo.png" alt="" class="size-9 rounded-lg object-cover" />
        <span class="truncate text-sm font-semibold tracking-tight text-white">Made Site</span>
      </button>

      <div class="flex items-center gap-2">
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
              v-if="inbox.unreadCount > 0"
              class="absolute -right-1 -top-1 grid min-w-4 place-items-center rounded-full bg-violet-500 px-1 text-[10px] font-semibold text-white"
            >
              {{ inbox.unreadCount > 9 ? '9+' : inbox.unreadCount }}
            </span>
          </button>

          <div
            v-if="openMenu === 'bell'"
            class="absolute right-0 top-12 z-40 w-80 rounded-xl border border-slate-700 bg-slate-900 p-2 shadow-xl"
          >
            <div class="flex items-center justify-between gap-2 px-2 py-1.5">
              <p class="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                Notifications
              </p>
              <button
                v-if="inbox.popupItems.length"
                type="button"
                class="rounded-md px-1.5 py-0.5 text-[11px] font-medium text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
                @click="clearBell"
              >
                Clear
              </button>
            </div>

            <div v-if="inbox.popupItems.length" class="space-y-1">
              <button
                v-for="item in inbox.popupItems"
                :key="item.id"
                type="button"
                class="w-full rounded-lg px-2 py-2 text-left transition hover:bg-slate-800"
                @click="openNotification(item.id)"
              >
                <div class="flex items-start gap-2">
                  <span
                    class="mt-1.5 size-1.5 shrink-0 rounded-full"
                    :class="item.read ? 'bg-slate-600' : 'bg-violet-400'"
                  ></span>
                  <span class="min-w-0">
                    <span class="block truncate text-sm font-medium text-white">
                      {{ item.title }}
                    </span>
                    <span
                      v-if="item.body"
                      class="mt-0.5 block text-xs leading-5 text-slate-400"
                    >
                      {{ item.body }}
                    </span>
                  </span>
                </div>
              </button>
            </div>

            <div v-else class="px-2 py-4 text-center">
              <BellOff class="mx-auto size-5 text-slate-600" />
              <p class="mt-2 text-sm text-slate-500">Nothing new right now.</p>
            </div>

            <button
              type="button"
              class="mt-1 w-full rounded-lg border border-slate-700 px-2 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
              @click="seeAllNotifications"
            >
              See all
            </button>
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
            <span class="hidden max-w-32 truncate text-sm font-medium text-slate-200 sm:inline">
              {{ auth.user?.name }}
            </span>
            <ChevronDown class="size-4 text-slate-400" />
          </button>
          <div
            v-if="openMenu === 'profile'"
            class="absolute right-0 top-12 z-40 w-60 rounded-xl border border-slate-700 bg-slate-900 p-1.5 shadow-xl"
          >
            <div class="border-b border-slate-800 px-2.5 py-2">
              <p class="truncate text-sm font-medium text-white">{{ auth.user?.name }}</p>
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
              @click="router.push({ path: '/', query: { section: 'settings' } })"
            >
              <Settings class="size-4 text-slate-400" />
              Settings
            </button>
            <button
              v-if="auth.user?.admin"
              type="button"
              class="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-slate-200 hover:bg-slate-800"
              @click="router.push('/admin')"
            >
              <ShieldCheck class="size-4 text-slate-400" />
              Admin
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

    <div class="md:grid md:min-h-[calc(100dvh-4rem)] md:grid-cols-[240px_minmax(0,1fr)]">
      <aside class="flex flex-col border-b border-slate-800/80 md:border-b-0 md:border-r">
        <nav class="grid grid-cols-2 gap-1 px-3 py-4 md:flex md:flex-col md:px-3">
          <button
            v-for="item in nav"
            :key="item.id"
            type="button"
            class="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium"
            :class="
              props.active === item.id
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
            "
            @click="openSection(item.id)"
          >
            <component :is="item.icon" class="size-4" />
            {{ item.label }}
          </button>
        </nav>
      </aside>

      <main class="min-w-0 px-5 py-8 sm:px-8 lg:px-10">
        <slot />
      </main>
    </div>
  </div>
</template>
