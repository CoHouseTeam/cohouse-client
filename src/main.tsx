// main.tsx (최소 수정판)
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

interface WindowWithCapacitor extends Window {
  Capacitor?: { isNative: boolean }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000, retry: 1 },
  },
})

// // [추가] DEV에서만 렌더 전에 MSW 먼저 시작
// async function enableMocking() {
//   // MSW 완전히 비활성화 (실제 API 테스트를 위해)
//   if (!import.meta.env.DEV || import.meta.env.VITE_USE_MSW !== 'true') return

//   const { worker } = await import('./mocks/browser')
//   await worker.start({
//     serviceWorker: { url: '/mockServiceWorker.js' },
//     onUnhandledRequest: 'bypass',
//   })
// }

// 기존 Capacitor 초기화는 그대로
const initializeApp = async () => {
  try {
    const isCapacitor = !!(window as WindowWithCapacitor).Capacitor?.isNative
    if (isCapacitor) {
      await StatusBar.setStyle({ style: Style.Dark })
      await SplashScreen.hide()
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

async function bootstrap() {
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

  initializeApp()
}

bootstrap()
