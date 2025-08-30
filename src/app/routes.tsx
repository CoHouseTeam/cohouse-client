import { Routes as RouterRoutes, Route } from 'react-router-dom'
import { lazy } from 'react'

// Lazy load pages
const Dashboard = lazy(() => import('../pages/Dashboard'))
const Login = lazy(() => import('../pages/Login'))
const Register = lazy(() => import('../pages/Register'))
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'))
const Settlements = lazy(() => import('../pages/Settlements'))
const SettlementHistory = lazy(() => import('../pages/SettlementHistory'))
const PaymentHistory = lazy(() => import('../pages/PaymentHistory'))
const Tasks = lazy(() => import('../pages/Tasks'))
const Board = lazy(() => import('../pages/Board'))
const MyPage = lazy(() => import('../pages/MyPage'))
const MyPgeEdit = lazy(() => import('../pages/MyPageEdit'))
const MainPage = lazy(() => import('../pages/MainPage'))
const GroupComplete = lazy(() => import('../pages/GroupComplete'))
const GroupInvite = lazy(() => import('../pages/GroupInvite'))
const OAuthCallback = lazy(() => import('../pages/OAuthCallback'))

export function Routes() {
  return (
    <RouterRoutes>
      <Route path="/" element={<MainPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/oauth/callback" element={<OAuthCallback />} />
      <Route path="/settlements" element={<Settlements />} />
      <Route path="/settlements/history" element={<SettlementHistory />} />
      <Route path="/payments/history" element={<PaymentHistory />} />
      <Route path="/tasks" element={<Tasks />} />
      <Route path="/board" element={<Board />} />
      <Route path="/mypage" element={<MyPage />} />
      <Route path="/mypage/edit" element={<MyPgeEdit />} />
      <Route path="/create-complete" element={<GroupComplete />} />
      <Route path="/invite" element={<GroupInvite />} />
      <Route path="*" element={<NotFound />} />
    </RouterRoutes>
  )
}

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <h1 className="text-4xl font-bold text-error mb-4">404</h1>
      <p className="text-lg text-base-content">페이지를 찾을 수 없습니다.</p>
      <a href="/" className="btn btn-primary mt-4 rounded-lg">
        홈으로 돌아가기
      </a>
    </div>
  )
}
