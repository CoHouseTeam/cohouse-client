/* eslint-disable */

importScripts('https://www.gstatic.com/firebasejs/10.12.4/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.4/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: 'AIzaSyDHnh2KYcRZxaGpN27mhL_eySZPzVjfxG8',

  authDomain: 'cohouse-f81d0.firebaseapp.com',

  projectId: 'cohouse-f81d0',

  storageBucket: 'cohouse-f81d0.firebasestorage.app',

  messagingSenderId: '1043792305039',

  appId: '1:1043792305039:web:02fbe85ff50141667c09fa',
})

const messaging = firebase.messaging()

// (A) FCM이 notification 필드를 보내는 경우
messaging.onBackgroundMessage((payload) => {
  console.log('[SW onBackgroundMessage]', payload)
  const { title, body, icon } = payload.notification ?? {}
  self.registration.showNotification(title || 'CoHouse', {
    body: body || '새 알림이 도착했어요.',
    icon: icon || '/icons/icon-192.png',
    data: payload.data || {},
  })
})

// (B) data-only 메시지 대비: 일반 push 이벤트 처리
self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data?.json() || {}
  } catch (_) {}
  console.log('[SW push event]', data)

  const n = data.notification || {}
  const d = data.data || {}

  event.waitUntil(
    self.registration.showNotification(n.title || 'CoHouse', {
      body: n.body || '새 알림이 도착했어요.',
      icon: n.icon || '/icons/icon-192.png',
      data: d,
    })
  )
})

// 알림 클릭 시 라우팅
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const targetUrl = event.notification?.data?.url || '/'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsArr) => {
      const client = clientsArr.find(Boolean)
      if (client) {
        client.focus()
        client.navigate(targetUrl)
        return
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl)
    })
  )
})
