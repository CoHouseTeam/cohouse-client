import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { App as CapApp } from '@capacitor/app'
import { StatusBar, Style } from '@capacitor/status-bar'
import { SplashScreen } from '@capacitor/splash-screen'
import App from './App.tsx'
import './styles/globals.css'

// Define a more specific type for the window object with Capacitor
interface WindowWithCapacitor extends Window {
  Capacitor?: {
    isNative: boolean
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
})

// Initialize Capacitor app
const initializeApp = async () => {
  try {
    // Check if running in Capacitor environment by trying to access native features
    const isCapacitor = !!(window as WindowWithCapacitor).Capacitor?.isNative

    if (isCapacitor) {
      // Set status bar style
      await StatusBar.setStyle({ style: Style.Dark })

      // Hide splash screen after app is ready
      await SplashScreen.hide()

      // Handle app state changes
      CapApp.addListener('appStateChange', ({ isActive }) => {
        console.log('App state changed. Is active?', isActive)
      })

      CapApp.addListener('appUrlOpen', (data) => {
        console.log('App opened with URL:', data.url)
      })
    } else {
      console.log('Running in web environment - Capacitor features disabled')
    }
  } catch (error) {
    console.error('Error initializing Capacitor app:', error)
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster position="top-right" />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
)

// Initialize app after render
initializeApp()

// DEV일 때만 MSW 시작
if (import.meta.env.DEV) {
  import('./mocks/browser').then(({ worker }) =>
    worker.start({
      serviceWorker: { url: '/mockServiceWorker.js' },
      onUnhandledRequest: 'bypass',
    })
  )
}
