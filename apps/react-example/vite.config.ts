import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
import type { UserConfig } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const workspaceRoot = path.resolve(__dirname, '../../')

const config: UserConfig = defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname, 'src'),
  resolve: {
    alias: {
      // allow imports from the built workspace package if needed
      '@tqpull-to-refresh/react': path.resolve(
        workspaceRoot,
        'packages/react/dist/index.mjs'
      )
    }
  },
  server: {
    port: 3001,
    fs: {
      allow: [workspaceRoot],
      strict: false
    }
  }
})

export default config
