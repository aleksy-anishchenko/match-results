import Aura from '@primeuix/themes/aura'

export default defineNuxtConfig({
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
  css: ['~/assets/css/fonts.css', '~/assets/css/global.css']
})
