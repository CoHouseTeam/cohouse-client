import { PropsWithChildren, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../libs/hooks/useAuth'
import NavBar from '../components/NavBar'
import { useRegisterFcmToken, useDeleteFcmToken } from '../libs/hooks/useSendNotification'
import { requestWebFcmToken } from '../libs/utils/firebase'

export default function AppLayout({ children }: PropsWithChildren) {
  const { permissions, loading } = useAuth()
  const location = useLocation()
  const [isAuthFromStorage, setIsAuthFromStorage] = useState(false)

  // 최종 인증 여부 (권한 훅 결과 OR localStorage 결과)
  const isAuthenticated = permissions.isAuthenticated || isAuthFromStorage

  // ────────────────────────────────
  // 🔔 푸시 알림 권한 상태 관리
  // ────────────────────────────────
  const [permission, setPermission] = useState<'default' | 'granted' | 'denied'>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  )

  // 알림 권한 요청 버튼 클릭 시 실행
  const askPermission = async () => {
    if (!('Notification' in window)) return
    const p = await Notification.requestPermission()
    setPermission(p)
  }

  // ────────────────────────────────
  // 🔔 FCM 토큰 등록/삭제 훅
  // ────────────────────────────────
  const register = useRegisterFcmToken()
  const remove = useDeleteFcmToken()

  // React StrictMode 중복 실행 가드
  const registeringRef = useRef(false)

  // 로컬스토리지 키 (토큰/토큰ID 보관)
  const LS_KEYS = {
    FCM_TOKEN: 'fcmToken',
    FCM_TOKEN_ID: 'fcmTokenId',
  }

  // ────────────────────────────────
  // 로그인 상태에서 권한이 'default'면 자동 요청
  // ────────────────────────────────
  useEffect(() => {
    if (isAuthenticated && 'Notification' in window && permission === 'default') {
      Notification.requestPermission().then(setPermission)
    }
  }, [isAuthenticated, permission])

  // ────────────────────────────────
  // 권한 허용 시 FCM 토큰 발급 + 서버 등록
  // (중복 등록 방지 + 로컬 저장)
  // ────────────────────────────────
  useEffect(() => {
    async function handleRegister() {
      if (permission !== 'granted') return // 권한 없으면 중단
      if (!isAuthenticated || !permissions.canAccessFeatures) return // 로그인/그룹 권한 없으면 중단
      if (registeringRef.current || register.isPending) return // StrictMode 중복 방지
      registeringRef.current = true

      try {
        const token = await requestWebFcmToken()
        if (!token) return

        // 이미 같은 토큰을 등록한 경우 스킵
        const savedToken = localStorage.getItem(LS_KEYS.FCM_TOKEN)
        const savedId = localStorage.getItem(LS_KEYS.FCM_TOKEN_ID)
        if (savedToken === token && savedId) {
          registeringRef.current = false
          return
        }

        register.mutate(
          { token, platform: 'web', deviceInfo: navigator.userAgent },
          {
            onSuccess: (resp) => {
              // ✅ Swagger 응답은 { id, token, active, lastUsedAt }
              localStorage.setItem(LS_KEYS.FCM_TOKEN, token)
              localStorage.setItem(LS_KEYS.FCM_TOKEN_ID, String(resp.id))
              console.log('FCM 토큰 등록 성공:', resp)
            },
            onError: (e) => {
              console.error('FCM 토큰 등록 실패:', e)
            },
            onSettled: () => {
              registeringRef.current = false
            },
          }
        )
      } catch (e) {
        registeringRef.current = false
        console.error('FCM 토큰 발급 실패:', e)
      }
    }

    handleRegister()
  }, [permission, isAuthenticated, permissions.canAccessFeatures])

  // ────────────────────────────────
  // 권한이 denied로 바뀌면 서버 토큰 삭제
  // ────────────────────────────────
  useEffect(() => {
    async function handleDeleteWhenDenied() {
      if (permission !== 'denied') return
      const id = localStorage.getItem(LS_KEYS.FCM_TOKEN_ID)
      if (!id) return

      remove.mutate(Number(id), {
        onSettled: () => {
          localStorage.removeItem(LS_KEYS.FCM_TOKEN)
          localStorage.removeItem(LS_KEYS.FCM_TOKEN_ID)
        },
      })
    }

    handleDeleteWhenDenied()
  }, [permission])

  // ────────────────────────────────
  // 로그아웃/그룹 권한 상실 시 서버 토큰 삭제
  // ────────────────────────────────
  useEffect(() => {
    async function handleDeleteOnLogout() {
      if (!isAuthenticated || !permissions.canAccessFeatures) {
        const id = localStorage.getItem(LS_KEYS.FCM_TOKEN_ID)
        if (id) {
          remove.mutate(Number(id), {
            onSettled: () => {
              localStorage.removeItem(LS_KEYS.FCM_TOKEN)
              localStorage.removeItem(LS_KEYS.FCM_TOKEN_ID)
            },
          })
        }
      }
    }

    handleDeleteOnLogout()
  }, [isAuthenticated, permissions.canAccessFeatures])

  // ────────────────────────────────
  // localStorage에서 인증 상태 확인 (네이버 로그인 후)
  // ────────────────────────────────
  useEffect(() => {
    const checkAuthFromStorage = () => {
      const isAuth = localStorage.getItem('isAuthenticated') === 'true'
      const hasToken = localStorage.getItem('accessToken')
      setIsAuthFromStorage(isAuth && !!hasToken)
    }

    checkAuthFromStorage()
    const interval = setInterval(checkAuthFromStorage, 100)
    return () => clearInterval(interval)
  }, [])

  // 공개 페이지 목록 (인증 불필요)
  const publicPaths = [
    '/login',
    '/register',
    '/forgot-password',
    '/',
    '/oauth/callback/naver',
    '/oauth/callback/google',
    '/create-complete',
  ]
  const isPublicPage = publicPaths.includes(location.pathname)

  // 공개 페이지는 보호하지 않음
  if (isPublicPage) {
    return (
      <div className="min-h-dvh">
        <NavBar>
          <main className="p-4 flex-1">{children}</main>
        </NavBar>
      </div>
    )
  }

  // 로딩 중일 때
  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    )
  }

  // 로그인하지 않은 경우
  if (!isAuthenticated) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">로그인이 필요합니다</h1>
          <p className="text-gray-600 mb-6">이 페이지에 접근하려면 로그인해주세요.</p>
          <div className="space-x-4">
            <a href="/login" className="btn btn-primary rounded-lg">
              로그인
            </a>
            <a href="/register" className="btn btn-outline rounded-lg">
              회원가입
            </a>
          </div>
        </div>
      </div>
    )
  }

  // 그룹에 속하지 않은 경우
  if (!permissions.canAccessFeatures) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">그룹 참여가 필요합니다</h1>
          <p className="text-gray-600 mb-6">CoHouse의 기능을 사용하려면 그룹에 참여해주세요.</p>
        </div>
      </div>
    )
  }

  // 정상적인 경우
  return (
    <div className="min-h-dvh">
      <NavBar>
        {/* 권한 요청 배너 */}
        {'Notification' in window && permission === 'default' && (
          <div className="mx-4 mt-4 mb-0 rounded-lg border border-base-300 p-3 flex items-center justify-between">
            <span>📣 웹 푸시를 허용하면 정산/초대/공지 알림을 바로 받아볼 수 있어요.</span>
            <button className="btn btn-sm btn-primary rounded-md" onClick={askPermission}>
              알림 허용
            </button>
          </div>
        )}
        <main className="p-4 flex-1">{children}</main>
      </NavBar>
    </div>
  )
}
