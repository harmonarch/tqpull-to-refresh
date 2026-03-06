import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
import type { UserConfig } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const workspaceRoot = path.resolve(__dirname, '../../')

const config: UserConfig = defineConfig({
  base: '/react-example/',
  plugins: [react()],
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
  },
  // 显式告诉 Vite：打包产物放到 dist 文件夹里！
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
})

export default config
