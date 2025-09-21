import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging'

const firebaseApp = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
})

// 서비스워커 등록
export async function registerFcmSW() {
  if (!('serviceWorker' in navigator)) return null
  // public/firebase-messaging-sw.js 가 루트(/)로 서빙됨
  const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js')
  return reg
}

// 권한 요청 + 토큰 발급
export async function requestWebFcmToken(): Promise<string | null> {
  const supported = await isSupported()
  if (!supported) return null

  // 알림 권한 요청
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return null

  const reg = await registerFcmSW()
  if (!reg) return null

  const messaging = getMessaging(firebaseApp)
  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY as string
  const token = await getToken(messaging, {
    vapidKey,
    serviceWorkerRegistration: reg,
  })
  return token ?? null
}

// 포그라운드 수신 콜백
export function onForegroundPush(cb: (payload: any) => void) {
  isSupported().then((ok) => {
    if (!ok) return
    const messaging = getMessaging(firebaseApp)
    onMessage(messaging, (payload) => cb(payload))
  })
}
