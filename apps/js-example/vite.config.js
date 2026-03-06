import { defineConfig } from 'vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const workspaceRoot = path.resolve(__dirname, '../../')

export default defineConfig({
  base: '/js-example/',
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
  },
  // 显式告诉 Vite：打包产物放到 dist 文件夹里！
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
})
