import { Suspense } from 'react'
import { Routes } from './app/routes'
import AppLayout from './layouts/AppLayout'
import LoadingSpinner from './features/common/LoadingSpinner'
import { AuthProvider } from './contexts/AuthContext'

function App() {
  return (
    <AuthProvider>
      <AppLayout>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes />
        </Suspense>
      </AppLayout>
    </AuthProvider>
  )
}

export default App
