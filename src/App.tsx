import { Suspense } from 'react'
import { Routes } from './app/routes'
import AppLayout from './layouts/AppLayout'
import LoadingSpinner from './features/common/LoadingSpinner'

function App() {
  return (
    <AppLayout>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes />
      </Suspense>
    </AppLayout>
  )
}

export default App
