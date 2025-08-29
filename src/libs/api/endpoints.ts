// 🔐 Auth endpoints (members)
export const AUTH_ENDPOINTS = {
  SIGNUP: '/members/signup',
  LOGIN: '/members/login',
  LOGOUT: '/members/logout',
  REFRESH: '/members/login/refresh',
  FORGOT_PASSWORD: '/members/forgot-password',
  RESET_PASSWORD: '/members/reset-password',
  CHECK_EMAIL: '/members/check/email',
  OAUTH2: (provider: string) => `/members/oauth2/${provider}`,
  WITHDRAW: '/members/withdraw',
} as const

// 👤 Profile endpoints
export const PROFILE_ENDPOINTS = {
  GET: '/members/profile',
  UPDATE: '/members/profile',
  UPDATE_IMAGE: '/members/profile/profile-image',
  DELETE_IMAGE: '/members/profile/profile-image',
  UPDATE_ALERT_TIME: '/members/profile/alert-time',
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
  TEMPLATES: '/tasks/templates',
  CREATE_TEMPLATE: '/tasks/templates',
  TEMPLATE_DETAIL: (templateId: number) => `/tasks/templates/${templateId}`,
  UPDATE_TEMPLATE: (templateId: number) => `/tasks/templates/${templateId}`,
  DELETE_TEMPLATE: (templateId: number) => `/tasks/templates/${templateId}`,
  
  // 반복 요일 관리
  REPEAT_DAYS: (templateId: number) => `/tasks/templates/${templateId}/repeat-days`,
  CREATE_REPEAT_DAY: (templateId: number) => `/tasks/templates/${templateId}/repeat-days`,
  DELETE_REPEAT_DAY: (templateId: number, repeatDayId: number) => `/tasks/templates/${templateId}/repeat-days/${repeatDayId}`,
  
  // 할당 관리
  ASSIGNMENTS: '/tasks/assignments',
  CREATE_ASSIGNMENT: '/tasks/assignments',
  UPDATE_ASSIGNMENT: (assignmentId: number) => `/tasks/assignments/${assignmentId}`,
  ASSIGNMENT_HISTORIES: (assignmentId: number) => `/tasks/assignments/${assignmentId}/histories`,
  
  // 대신하기 요청
  OVERRIDE_REQUEST: (assignmentId: number) => `/tasks/assignments/${assignmentId}/override-request`,
  UPDATE_OVERRIDE_REQUEST: (requestId: number) => `/tasks/override-requests/${requestId}`,
  OVERRIDE_HISTORIES: (requestId: number) => `/tasks/override-requests/${requestId}/histories`,
} as const

// 💰 Settlement endpoints
export const SETTLEMENT_ENDPOINTS = {
  CREATE: '/settlements',
  MY_LIST: '/settlements/my',
  MY_HISTORY: '/settlements/my/history',
  GROUP_LIST: (groupId: number) => `/settlements/group/${groupId}`,
  PAYMENT_HISTORIES: '/settlements/payment-histories',
  
  // 정산별 상세
  DETAIL: (settlementId: number) => `/settlements/${settlementId}`,
  DELETE: (settlementId: number) => `/settlements/${settlementId}`,
  PARTICIPANTS: (settlementId: number) => `/settlements/${settlementId}/participants`,
  PAYMENT: (settlementId: number) => `/settlements/${settlementId}/payment`,
  PAYMENT_DONE: (settlementId: number) => `/settlements/${settlementId}/payment-done`,
  
  // 영수증 관리
  RECEIPT: (settlementId: number) => `/settlements/${settlementId}/receipt`,
  UPDATE_RECEIPT: (settlementId: number) => `/settlements/${settlementId}/receipt`,
  DELETE_RECEIPT: (settlementId: number) => `/settlements/${settlementId}/receipt`,
} as const

// 💳 Payment endpoints
export const PAYMENT_ENDPOINTS = {
  HISTORIES: '/payments/histories',
} as const

// 📰 Post endpoints
export const POST_ENDPOINTS = {
  CREATE: '/posts',
  LIST: (groupId: number) => `/posts/${groupId}`,
  DETAIL: (postId: number) => `/posts/${postId}`,
  UPDATE: (postId: number) => `/posts/${postId}`,
  DELETE: (postId: number) => `/posts/${postId}`,
  
  // 좋아요
  LIKES: (postId: number) => `/posts/${postId}/likes`,
  LIKE: (postId: number) => `/posts/${postId}/likes`,
  LIKE_STATUS: (postId: number) => `/posts/${postId}/likes/status`,
  LIKE_COUNT: (postId: number) => `/posts/${postId}/likes/count`,
} as const

// 🔔 Notification endpoints
export const NOTIFICATION_ENDPOINTS = {
  LIST: '/notifications',
  UNREAD_COUNT: '/notifications/unread-count',
  MARK_READ: (notificationId: number) => `/notifications/${notificationId}/read`,
  DELETE_ALL: '/notifications/all',
} as const
