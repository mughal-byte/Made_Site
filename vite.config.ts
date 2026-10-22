
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { authPlugin } from './server/auth.ts'

export default defineConfig({
  plugins: [vue(), tailwindcss(), authPlugin()],
})
