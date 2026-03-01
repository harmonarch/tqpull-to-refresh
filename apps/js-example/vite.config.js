import { defineConfig } from 'vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const workspaceRoot = path.resolve(__dirname, '../../')

export default defineConfig({
  root: path.resolve(__dirname, 'src'),
  resolve: {
    alias: {
      '@tqpull-to-refresh/core': path.resolve(workspaceRoot, 'packages/core/dist/index.mjs')
    }
  },
  server: {
    port: 3000,
    fs: {
      // allow serving files from the monorepo root
      allow: [workspaceRoot],
      // turning off strict allows accessing files outside project root when needed
      strict: false
    }
  }
})
