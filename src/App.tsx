import { Suspense } from 'react'
import { Routes } from './app/routes'
import AppLayout from './layouts/AppLayout'

function App() {
  return (
    <AppLayout>
      <Suspense fallback={
        <div className="flex justify-center items-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      }>
        <Routes />
      </Suspense>
    </AppLayout>
  )
}

export default App
