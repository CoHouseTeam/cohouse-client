// Auth endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
} as const

// Settlements endpoints
export const SETTLEMENTS_ENDPOINTS = {
  LIST: '/settlements',
  CREATE: '/settlements',
  DETAIL: (id: string) => `/settlements/${id}`,
  UPDATE: (id: string) => `/settlements/${id}`,
  DELETE: (id: string) => `/settlements/${id}`,
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
