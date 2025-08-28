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

// 👤 Profile endpoints
export const PROFILE_ENDPOINTS = {
  GET: 'api/members/profile',
  UPDATE: 'api/members/profile',
  UPDATE_IMAGE: 'api/members/profile/profile-image',
  DELETE_IMAGE: 'api/members/profile/profile-image',
  UPDATE_ALERT_TIME: 'api/members/profile/alert-time',
} as const

// 👥 Group endpoints
export const GROUP_ENDPOINTS = {
  CREATE: '/groups',
  JOIN: '/groups/join',
  MY_GROUPS: '/groups/me',
  
  // 그룹별 상세
  DETAIL: (groupId: number) => `/groups/${groupId}`,
  UPDATE: (groupId: number) => `/groups/${groupId}`,
  DELETE: (groupId: number) => `/groups/${groupId}`,
  
  // 멤버 관리
  MEMBERS: (groupId: number) => `/groups/${groupId}/members`,
  MEMBER_DETAIL: (groupId: number, memberId: number) => `/groups/${groupId}/members/${memberId}`,
  UPDATE_MY_INFO: (groupId: number) => `/groups/${groupId}/members/me`,
  TRANSFER_LEADER: (groupId: number) => `/groups/${groupId}/leader-transfer`,
  
  // 탈퇴 요청
  LEAVE_REQUESTS: (groupId: number) => `/groups/${groupId}/leave-requests`,
  LEAVE_REQUEST: (groupId: number) => `/groups/${groupId}/leave-requests`,
  APPROVE_LEAVE: (groupId: number, requestId: number) => `/groups/${groupId}/leave-requests/${requestId}`,
  
  // 초대
  INVITATIONS: (groupId: number) => `/groups/${groupId}/invitations`,
} as const

// 📝 Task endpoints
export const TASK_ENDPOINTS = {
  // 템플릿 관리
  TEMPLATES: 'api/tasks/templates',
  CREATE_TEMPLATE: 'api/tasks/templates',
  TEMPLATE_DETAIL: (templateId: number) => `api/tasks/templates/${templateId}`,
  UPDATE_TEMPLATE: (templateId: number) => `api/tasks/templates/${templateId}`,
  DELETE_TEMPLATE: (templateId: number) => `api/tasks/templates/${templateId}`,
  
  // 반복 요일 관리
  REPEAT_DAYS: (templateId: number) => `api/tasks/templates/${templateId}/repeat-days`,
  CREATE_REPEAT_DAY: (templateId: number) => `api/tasks/templates/${templateId}/repeat-days`,
  DELETE_REPEAT_DAY: (templateId: number, repeatDayId: number) => `api/tasks/templates/${templateId}/repeat-days/${repeatDayId}`,
  
  // 할당 관리
  ASSIGNMENTS: 'api/tasks/assignments',
  CREATE_ASSIGNMENT: 'api/tasks/assignments',
  UPDATE_ASSIGNMENT: (assignmentId: number) => `api/tasks/assignments/${assignmentId}`,
  ASSIGNMENT_HISTORIES: (assignmentId: number) => `api/tasks/assignments/${assignmentId}/histories`,
  
  // 대신하기 요청
  OVERRIDE_REQUEST: (assignmentId: number) => `api/tasks/assignments/${assignmentId}/override-request`,
  UPDATE_OVERRIDE_REQUEST: (requestId: number) => `api/tasks/override-requests/${requestId}`,
  OVERRIDE_HISTORIES: (requestId: number) => `api/tasks/override-requests/${requestId}/histories`,
} as const

// 💰 Settlement endpoints
export const SETTLEMENT_ENDPOINTS = {
  CREATE: 'api/settlements',
  MY_LIST: 'api/settlements/my',
  MY_HISTORY: 'api/settlements/my/history',
  GROUP_LIST: (groupId: number) => `api/settlements/group/${groupId}`,
  
  // 정산별 상세
  DETAIL: (settlementId: number) => `api/settlements/${settlementId}`,
  DELETE: (settlementId: number) => `api/settlements/${settlementId}`,
  PARTICIPANTS: (settlementId: number) => `api/settlements/${settlementId}/participants`,
  PAYMENT: (settlementId: number) => `api/settlements/${settlementId}/payment`,
  
  // 영수증 관리
    RECEIPT: (settlementId: number) => `api/settlements/${settlementId}/receipt`,
  UPDATE_RECEIPT: (settlementId: number) => `api/settlements/${settlementId}/receipt`,
  DELETE_RECEIPT: (settlementId: number) => `api/settlements/${settlementId}/receipt`,
} as const

// 💳 Payment endpoints
export const PAYMENT_ENDPOINTS = {
  HISTORIES: 'api/payments/histories',
} as const

// 📰 Post endpoints
export const POST_ENDPOINTS = {
  CREATE: 'api/posts',
  LIST: (groupId: number) => `api/posts/${groupId}`,
  DETAIL: (postId: number) => `api/posts/${postId}`,
  UPDATE: (postId: number) => `api/posts/${postId}`,
  DELETE: (postId: number) => `api/posts/${postId}`,
  
  // 좋아요
  LIKES: (postId: number) => `api/posts/${postId}/likes`,
  LIKE: (postId: number) => `api/posts/${postId}/likes`,
  LIKE_STATUS: (postId: number) => `api/posts/${postId}/likes/status`,
  LIKE_COUNT: (postId: number) => `api/posts/${postId}/likes/count`,
} as const

// 🔔 Notification endpoints
export const NOTIFICATION_ENDPOINTS = {
  LIST: '/notifications',
  UNREAD_COUNT: '/notifications/unread-count',
  MARK_READ: (notificationId: number) => `/notifications/${notificationId}/read`,
  DELETE_ALL: '/notifications/all',
} as const
