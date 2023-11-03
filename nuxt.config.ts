import { resolve } from "path";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
  alias: {
    assets: "/<rootDir>/assets"
  },
  css : [
    "~/assets/main.scss",
    "~/assets/colors.scss",
  ], 
  ui: {
    global: true,
    icons: ['mdi'],
  },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  modules: [
    '@nuxt/ui',
    '@vueuse/nuxt',
    '@pinia/nuxt',
    '@nuxtjs/supabase',
  ],
  supabase: {
    redirect: false
  },
  app: {
    head: {
      title: 'SCHEDU'
    }
  },
  components: true,
  typescript: {
    typeCheck: true
  },
  ssr: false
})
 