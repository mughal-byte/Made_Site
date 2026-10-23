
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { authPlugin } from './server/auth.ts'
import { notificationsPlugin } from './server/notifications.ts'

export default defineConfig({
  plugins: [vue(), tailwindcss(), authPlugin(), notificationsPlugin()],
})
