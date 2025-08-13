import { Routes as RouterRoutes, Route } from 'react-router-dom'
import { lazy } from 'react'

// Lazy load pages
const Dashboard = lazy(() => import('../pages/Dashboard'))
const Login = lazy(() => import('../pages/Login'))
const Settlements = lazy(() => import('../pages/Settlements'))
const Tasks = lazy(() => import('../pages/Tasks'))
const Board = lazy(() => import('../pages/Board'))
const MyPage = lazy(() => import('../pages/MyPage'))

export function Routes() {
  return (
    <RouterRoutes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/login" element={<Login />} />
      <Route path="/settlements" element={<Settlements />} />
      <Route path="/tasks" element={<Tasks />} />
      <Route path="/board" element={<Board />} />
      <Route path="/mypage" element={<MyPage />} />
      <Route path="*" element={<NotFound />} />
    </RouterRoutes>
  )
}

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <h1 className="text-4xl font-bold text-error mb-4">404</h1>
      <p className="text-lg text-base-content">페이지를 찾을 수 없습니다.</p>
      <a href="/" className="btn btn-primary mt-4">홈으로 돌아가기</a>
    </div>
  )
}
