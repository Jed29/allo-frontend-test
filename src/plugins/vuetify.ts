/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Composables
import { createVuetify } from 'vuetify'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    defaultTheme: 'dark',
    themes: {
      dark: {
        dark: true,
        colors: {
          primary: '#1867C0',
          secondary: '#5CBBF6',
          background: '#121212',
          surface: '#1E1E1E',
          error: '#CF6679',
          'on-background': '#FFFFFF',
          'on-surface': '#FFFFFF'
        }
      }
    }
  },
})
