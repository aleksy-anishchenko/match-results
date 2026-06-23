import Aura from '@primeuix/themes/aura'
import { resolve } from 'path'

export default defineNuxtConfig({
  runtimeConfig: {
    theSportsDbApiKey: ''
  },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt', '@primevue/nuxt-module'],
  primevue: {
    options: {
      theme: {
        preset: Aura,
        options: { darkModeSelector: false }
      }
    }
  },
  css: ['~/assets/css/fonts.css', '~/assets/css/global.scss', 'primeicons/primeicons.css'],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: (content: string, filepath: string) => {
            if (filepath.includes('_variables')) return content
            return `@use "${resolve('./app/assets/css/_variables')}" as *;\n${content}`
          }
        }
      }
    }
  }
})
