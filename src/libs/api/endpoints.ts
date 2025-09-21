// 🔐 Auth endpoints (members)
export const AUTH_ENDPOINTS = {
  SIGNUP: 'api/members/signup',
  LOGIN: 'api/members/login',
  LOGOUT: 'api/members/logout',
  REFRESH: 'api/members/login/refresh',
  FORGOT_PASSWORD: 'api/members/forgot-password',
  RESET_PASSWORD: 'api/members/reset-password',
  CHECK_EMAIL: 'api/members/check/email',
  OAUTH2: (provider: string) => `api/members/oauth2/${provider}`,
  WITHDRAW: 'api/members/withdraw',
} as const

// 👥 Group endpoints
export const GROUP_ENDPOINTS = {
  CREATE: '/api/groups',
  JOIN: '/api/groups/join',
  MY_GROUPS: '/api/groups/me',
  MY_ROLE: (groupId: number) => `/api/groups/${groupId}/me/role`,

  // 그룹별 상세
  DETAIL: (groupId: number) => `/api/groups/${groupId}`,
  UPDATE: (groupId: number) => `/api/groups/${groupId}`,
  DELETE: (groupId: number) => `/api/groups/${groupId}`,

  // 멤버 관리
  MEMBERS: (groupId: number) => `/api/groups/${groupId}/members`,
  MEMBER_DETAIL: (groupId: number, memberId: number) =>
    `/api/groups/${groupId}/members/${memberId}`,
  UPDATE_MY_INFO: (groupId: number) => `/api/groups/${groupId}/members/me`,
  TRANSFER_LEADER: (groupId: number) => `/api/groups/${groupId}/leader-transfer`,

  // 탈퇴 요청
  LEAVE_REQUESTS: (groupId: number) => `/api/groups/${groupId}/leave-requests`,
  APPROVE_LEAVE: (groupId: number, requestId: number) =>
    `/api/groups/${groupId}/leave-requests/${requestId}`,

  // 초대
  INVITATIONS: (groupId: number) => `/api/groups/${groupId}/invitations`,
} as const

// 📝 Task endpoints
export const TASK_ENDPOINTS = {
  // 템플릿 관리
  TEMPLATES: '/api/tasks/templates',
  CREATE_TEMPLATE: '/api/tasks/templates',
  TEMPLATE_DETAIL: (templateId: number) => `/api/tasks/templates/${templateId}`,
  UPDATE_TEMPLATE: (templateId: number) => `/api/tasks/templates/${templateId}`,
  DELETE_TEMPLATE: (templateId: number) => `/api/tasks/templates/${templateId}`,

  // 반복 요일 관리
  REPEAT_DAYS: (templateId: number) => `/api/tasks/templates/${templateId}/repeat-days`,
  CREATE_REPEAT_DAY: (templateId: number) => `/api/tasks/templates/${templateId}/repeat-days`,
  DELETE_REPEAT_DAY: (templateId: number, repeatDayId: number) =>
    `/api/tasks/templates/${templateId}/repeat-days/${repeatDayId}`,

  // 할당 관리
  ASSIGNMENTS: '/api/tasks/assignments',
  CREATE_ASSIGNMENT: '/api/tasks/assignments',
  UPDATE_ASSIGNMENT: (assignmentId: number) => `/api/tasks/assignments/${assignmentId}`,
  ASSIGNMENT_HISTORIES: (assignmentId: number) =>
    `/api/tasks/assignments/${assignmentId}/histories`,
  MEMBER_HISTORIES: `/api/tasks/assignments/histories`,
  UNCOMPLETED_HISTORIES: `/api/tasks/assignments/uncompleted`,

  // 대신하기 요청
  OVERRIDE_REQUEST: (assignmentId: number) =>
    `/api/tasks/assignments/${assignmentId}/override-request`,
  UPDATE_OVERRIDE_REQUEST: (requestId: number) => `/api/tasks/override-requests/${requestId}`,
  OVERRIDE_HISTORIES: (requestId: number) => `/api/tasks/override-requests/${requestId}/histories`,
} as const

// 💰 Settlement endpoints
export const SETTLEMENT_ENDPOINTS = {
  CREATE: 'api/settlements',
  MY_LIST: 'api/settlements/my',
  MY_HISTORY: 'api/settlements/my/history',
  GROUP_LIST: (groupId: number) => `api/settlements/group/${groupId}`,
  PAYMENT_HISTORIES: 'api/settlements/payment-histories',
  MY_SIMPLE: '/api/settlements/my/simple',

  // 정산별 상세
  DETAIL: (settlementId: number) => `api/settlements/${settlementId}`,
  DELETE: (settlementId: number) => `api/settlements/${settlementId}`,
  PARTICIPANTS: (settlementId: number) => `api/settlements/${settlementId}/participants`,
  PAYMENT: (settlementId: number) => `api/settlements/${settlementId}/payment`,
  PAYMENT_DONE: (settlementId: number) => `api/settlements/${settlementId}/payment`,

  // 영수증 관리
  RECEIPT: (settlementId: number) => `api/settlements/${settlementId}/receipt`,
  UPDATE_RECEIPT: (settlementId: number) => `api/settlements/${settlementId}/receipt`,
  DELETE_RECEIPT: (settlementId: number) => `api/settlements/${settlementId}/receipt`,

  // 영수증 OCR 미리보기(정산 생성 전, 전역 엔드포인트)
  RECEIPT_OCR: 'api/settlements/ocr/receipt',
} as const

// Profile endpoints
export const PROFILE_ENDPOINTS = {
  GET: '/api/members/profile', // GET: 내 프로필 조회
  UPDATE: '/api/members/profile', // PUT: 프로필 정보 수정 (name, gender, birthDate 등)
  UPLOAD_IMAGE: '/api/members/profile/profile-image', // PUT: 프로필 이미지 업로드
  DELETE_IMAGE: '/api/members/profile/profile-image', // DELETE: 프로필 이미지 삭제
  UPDATE_ALERT_TIME: '/api/members/profile/alert-time', // PUT: 알림 시간 수정
  GET_MY_ID: '/api/members/me/id', //GET: 내 Member ID 조회
} as const

// Tasks endpoints
export const TASKS_ENDPOINTS = {
  LIST: '/api/tasks',
  CREATE: '/api/tasks',
  DETAIL: (id: string) => `/api/tasks/${id}`,
  UPDATE: (id: string) => `/api/tasks/${id}`,
  DELETE: (id: string) => `/api/tasks/${id}`,
  COMPLETE: (id: string) => `/api/tasks/${id}/complete`,
}

// 💳 Payment endpoints
export const PAYMENT_ENDPOINTS = {
  HISTORIES: 'api/payments/histories',
} as const

// 📰 Post endpoints
export const POST_ENDPOINTS = {
  // 기본 CRUD
  CREATE: '/api/posts',
  GET_BY_ID: (postId: number) => `api/posts/${postId}`,
  UPDATE: (postId: number) => `api/posts/${postId}`,
  DELETE: (postId: number) => `api/posts/${postId}`,

  // 그룹별 게시글 목록 (페이지네이션 및 필터링 지원)
  GET_BY_GROUP: (groupId: number) => `api/posts/${groupId}`,

  // 공지 리스트 (메인 페이지 조회 목적)
  ANNOUNCEMENTS_SUM: (groupId: number) => `/api/posts/groups/${groupId}/announcements/summary`,

  LIKES: (postId: number) => `api/posts/${postId}/likes`,
  LIKE: (postId: number) => `api/posts/${postId}/likes`,
  LIKE_STATUS: (postId: number) => `api/posts/${postId}/likes/status`,
  LIKE_COUNT: (postId: number) => `api/posts/${postId}/likes/count`,
} as const

// 🔔 Notification endpoints
export const NOTIFICATION_ENDPOINTS = {
  // 알림 목록 (타입 및 읽음 상태 필터링 지원)
  LIST: '/api/notifications',

  // 읽지 않은 알림 개수
  UNREAD_COUNT: '/api/notifications/unread-count',

  // 알림 읽음 처리
  MARK_READ: (notificationId: number) => `/api/notifications/${notificationId}/read`,

  // 모든 알림 삭제
  DELETE_ALL: '/api/notifications/all',

  // 알림 설정 (GET / PUT 공용)
  SETTINGS: '/api/notifications/settings',
} as const

export const PUSH_ENDPOINTS = {
  // POST: 토큰 등록
  REGISTER: '/api/fcm-tokens',

  // DELETE: 토큰 삭제
  DELETE_BY_ID: (tokenId: number) => `/api/fcm-tokens/${tokenId}`,
} as const
