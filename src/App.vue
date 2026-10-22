<script setup lang="ts">
import { watch } from 'vue'
import { useAuthStore } from './stores/auth'
import { useEditorStore } from './stores/editor'
import { useProjectsStore } from './stores/projects'

const auth = useAuthStore()
const projects = useProjectsStore()
const editor = useEditorStore()

watch(
  () => auth.user?.id ?? '',
  (userId) => {
    projects.useUser(userId)
    editor.useUser(userId)
  },
  { immediate: true },
)
</script>

<template>
  <RouterView />
</template>
