// Auth endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
} as const

// Settlements endpoints
export const SETTLEMENTS_ENDPOINTS = {
  // 목록
  MY_LIST: '/settlements/my', // 내가 속한 정산 목록
  GROUP_LIST: (groupId: number) => `/settlements/group/${groupId}`, // 그룹 정산 목록(그룹장)

  // 생성 & 기본 CRUD
  CREATE: '/settlements', // POST 정산 생성
  DETAIL: (id: number) => `/settlements/${id}`, // GET 정산 상세
  DELETE: (id: number) => `/settlements/${id}`, // DELETE 정산 취소

  // 참여자 / 상태 변경
  PARTICIPANTS: (id: number) => `/settlements/${id}/participants`, // 참여자 목록
  PAYMENT_DONE: (id: number) => `/settlements/${id}/payment`, // 송금 완료 처리

  // 히스토리
  MY_HISTORY: '/settlements/my/history', // 나의 정산 히스토리
  PAYMENT_HISTORIES: '/payments/histories', // 나의 송금 히스토리

  // 영수증
  RECEIPT: (id: number) => `/settlements/${id}/receipt`, // POST/PUT/DELETE 영수증
} as const

// 멤버 (보조 API)
export const MEMBERS_ENDPOINT = {
  LIST: '/members',
} as const

// Profile endpoints
export const PROFILE_ENDPOINTS = {
  GET: '/api/members/profile', // GET: 내 프로필 조회
  UPDATE: '/api/members/profile', // PUT: 프로필 정보 수정 (name, gender, birthDate 등)
  UPLOAD_IMAGE: '/api/members/profile/profile-image', // PUT: 프로필 이미지 업로드
  DELETE_IMAGE: '/api/members/profile/profile-image', // DELETE: 프로필 이미지 삭제
  UPDATE_ALERT_TIME: '/api/members/profile/alert-time', // PUT: 알림 시간 수정
} as const

// Tasks endpoints
export const TASKS_ENDPOINTS = {
  LIST: '/tasks',
  CREATE: '/tasks',
  DETAIL: (id: string) => `/tasks/${id}`,
  UPDATE: (id: string) => `/tasks/${id}`,
  DELETE: (id: string) => `/tasks/${id}`,
  COMPLETE: (id: string) => `/tasks/${id}/complete`,
} as const

// Board endpoints
export const BOARD_ENDPOINTS = {
  POSTS: '/board/posts',
  CREATE_POST: '/board/posts',
  POST_DETAIL: (id: string) => `/board/posts/${id}`,
  UPDATE_POST: (id: string) => `/board/posts/${id}`,
  DELETE_POST: (id: string) => `/board/posts/${id}`,
  ANNOUNCEMENTS: '/board/announcements',
  SUGGESTIONS: '/board/suggestions',
} as const

// User endpoints
export const USER_ENDPOINTS = {
  PROFILE: '/user/profile',
  UPDATE_PROFILE: '/user/profile',
  CHANGE_PASSWORD: '/user/password',
} as const
