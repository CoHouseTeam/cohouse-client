import { Routes as RouterRoutes, Route } from 'react-router-dom'
import { lazy } from 'react'
import ProtectedRoute from '../components/ProtectedRoute'

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
const OAuthCallbackNaver = lazy(() => import('../pages/OAuthCallbackNaver'))
const OAuthCallbackGoogle = lazy(() => import('../pages/OAuthCallbackGoogle'))


export function Routes() {
  return (
    <RouterRoutes>
      {/* 공개 라우트 - 로그인 불필요 */}
      <Route path="/" element={<MainPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/oauth/callback" element={<OAuthCallback />} />
      <Route path="/oauth/callback/naver" element={<OAuthCallbackNaver />} />
      <Route path="/oauth/callback/google" element={<OAuthCallbackGoogle />} />
      
      {/* 인증 필요 라우트 - 로그인만 필요 */}
      <Route path="/dashboard" element={
        <ProtectedRoute requireAuth={true}>
          <Dashboard />
        </ProtectedRoute>
      } />
      
      {/* 그룹 참여 필요 라우트 - 로그인 + 그룹 참여 필요 */}
      <Route path="/settlements" element={
        <ProtectedRoute requireAuth={true} requireGroup={true}>
          <Settlements />
        </ProtectedRoute>
      } />
      <Route path="/settlements/history" element={
        <ProtectedRoute requireAuth={true} requireGroup={true}>
          <SettlementHistory />
        </ProtectedRoute>
      } />
      <Route path="/payments/history" element={
        <ProtectedRoute requireAuth={true} requireGroup={true}>
          <PaymentHistory />
        </ProtectedRoute>
      } />
      <Route path="/tasks" element={
        <ProtectedRoute requireAuth={true} requireGroup={true}>
          <Tasks />
        </ProtectedRoute>
      } />
      <Route path="/board" element={
        <ProtectedRoute requireAuth={true} requireGroup={true}>
          <Board />
        </ProtectedRoute>
      } />
      <Route path="/mypage" element={
        <ProtectedRoute requireAuth={true} requireGroup={true}>
          <MyPage />
        </ProtectedRoute>
      } />
      <Route path="/mypage/edit" element={
        <ProtectedRoute requireAuth={true} requireGroup={true}>
          <MyPgeEdit />
        </ProtectedRoute>
      } />
      <Route path="/create-complete" element={
        <ProtectedRoute requireAuth={true}>
          <GroupComplete />
        </ProtectedRoute>
      } />
      <Route path="/invite" element={
        <ProtectedRoute requireAuth={true}>
          <GroupInvite />
        </ProtectedRoute>
      } />

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
