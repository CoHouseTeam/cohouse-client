export interface CalendarDateDetailsProps {
  selectedDate: Date
  events: string[]
}

export interface CalendarDotsProps {
  colors: string[]
  dayLength?: number
}

export interface TodoItem {
  checked: boolean
  assignmentId?: number
  category: string
  status?: 'COMPLETED' | 'PENDING' | string
}

export interface Member {
  name: string
  profileImageUrl: string
  task: string
}

export interface Group {
  date: string
  members: Member[]
}

export interface UncompletedGroup {
  date: string // 예: '2025.08.03(일)'
  members: Array<{
    task: string
    name: string
    profileImageUrl: string
  }>
}

export interface CalendarBoxProps {
  onDateSelect: (date: Date) => void
  value: Date
  scheduledDates: string[]
}

export interface ModalProps {
  onClose: () => void
}

export interface UncompletedTasksModalProps {
  onClose: () => void
  groupId: number | null
  memberId?: number | null
}

// 📰 Post Types
export interface Post {
  id: number
  groupId: number
  title: string
  content: string
  images?: string[]
  author: {
    id: number
    name: string
    profileImage?: string
  }
  createdAt: string
  updatedAt: string
  likeCount: number
  isLiked: boolean
}

// API 응답 형식에 맞는 Post 타입
export interface ApiPost {
  id: number
  type: 'ANNOUNCEMENT' | 'FREE'
  title: string
  preview: string
  groupId: number
  memberId: number
  color: 'RED' | 'PURPLE' | 'BLUE' | 'GREEN' | 'YELLOW' | 'ORANGE' | 'PINK' | 'GRAY'
  createdAt: string
  updatedAt: string
}

// API 응답 형식에 맞는 PostListResponse
export interface ApiPostListResponse {
  content: ApiPost[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
}

// 기존 PostListResponse (호환성을 위해 유지)
export interface PostListResponse {
  content: Post[]
  totalElements: number
  totalPages: number
  currentPage: number
  size: number
}

export interface CreatePostRequest {
  groupId: number
  memberId: number
  type: 'ANNOUNCEMENT' | 'FREE'
  title: string
  content: string
  color: 'RED' | 'PURPLE' | 'BLUE' | 'GREEN' | 'YELLOW' | 'ORANGE' | 'PINK' | 'GRAY'
}

export interface UpdatePostRequest {
  title?: string
  content?: string
  images?: string[]
}

// 🔔 Notification Types
export interface Notification {
  id: number
  type: 'TASK' | 'SETTLEMENT' | 'POST' | 'GROUP' | 'SYSTEM'
  title: string
  content: string
  isRead: boolean
  createdAt: string
  targetId?: number
  targetType?: string
}

export interface NotificationListResponse {
  content: Notification[]
  totalElements: number
  totalPages: number
  currentPage: number
  size: number
}

export interface UnreadCountResponse {
  count: number
}

// ❤️ Post Like Types
export interface PostLike {
  id: number
  postId: number
  memberId: number
  memberName: string
  memberProfileImage?: string
  createdAt: string
}

export interface PostLikeResponse {
  likes: PostLike[]
  totalCount: number
}

export interface LikeStatusResponse {
  isLiked: boolean
}

export interface LikeCountResponse {
  count: number
}

export interface InviteModalProps {
  groupName: string
  onClose: () => void
  onAccept: () => void
  onDecline: () => void
}

export interface NicknameModalProps {
  onClose: () => void
  onSubmit: (nickname: string) => void
  loading?: boolean
}

// 📰 Board Types
export type BoardColor = 'RED' | 'BLUE' | 'GRAY' | 'ORANGE'

export interface BoardPost {
  id: number
  type: 'FREE' | 'ANNOUNCEMENT'
  title: string
  preview: string
  groupId: number
  memberId: number
  color: BoardColor
  createdAt: string
  updatedAt: string
}

export interface PageResponse<T> {
  content: T[]
  page: number // backend is 1-based in sample
  size: number
  totalElements: number
  totalPages: number
  last: boolean
}

export interface PostLikes {
  postId: number
  totalCount: number
  likers: { memberId: number; displayName: string; avatarUrl: string }[]
}

export interface PostLikesCount {
  postId: number
  count: number
}
