import { defineConfig, loadEnv } from 'vite'
import process from 'node:process'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  if (command === 'build') {
    let api
    try {
      api = new URL(env.VITE_API_URL)
    } catch {
      throw new Error('Set VITE_API_URL to your backend HTTPS origin before building (without /api).')
    }
    if (api.protocol !== 'https:' || api.pathname !== '/' || api.search || api.hash || api.username || api.password || ['localhost', '127.0.0.1', '[::1]'].includes(api.hostname)) {
      throw new Error('VITE_API_URL must be a public HTTPS origin, for example https://cryptosence.onrender.com, without /api.')
    }
  }
  return { plugins: [react(), tailwindcss()] }
})

