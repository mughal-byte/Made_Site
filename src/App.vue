<script setup lang="ts">
import { watch } from 'vue'
import ToastHost from './components/ui/ToastHost.vue'
import { useAuthStore } from './stores/auth'
import { useEditorStore } from './stores/editor'
import { useInboxStore } from './stores/inbox'
import { useNotificationsStore } from './stores/notifications'
import { useProjectsStore } from './stores/projects'

const auth = useAuthStore()
const projects = useProjectsStore()
const editor = useEditorStore()
const notifications = useNotificationsStore()
const inbox = useInboxStore()

watch(
  () => auth.user?.id ?? '',
  (userId) => {
    projects.useUser(userId)
    editor.useUser(userId)
    notifications.useUser(userId)
    void inbox.load(userId)
  },
  { immediate: true },
)
</script>

<template>
  <RouterView />
  <ToastHost />
</template>
