export interface CalendarDateDetailsProps {
  selectedDate: Date
  events: string[]
}

export interface CalendarDotsProps {
  colors: string[]
  dayLength?: number
}

export interface Todo {
  text: string
  checked: boolean
}

export interface Member {
  name: string
  profileUrl: string
  task: string
}

export interface Group {
  date: string
  members: Member[]
}

export interface CalendarBoxProps {
  onDateSelect?: (date: Date) => void
  value?: Date
}

export interface ModalProps {
  onClose: () => void
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

export interface CreatePostRequest {
  groupId: number
  memberId: number
  type: 'ANNOUNCEMENT' | 'FREE'
  title: string
  content: string
  color: string
}

export interface UpdatePostRequest {
  title?: string
  content?: string
  images?: string[]
}

export interface PostListResponse {
  content: Post[]
  totalElements: number
  totalPages: number
  currentPage: number
  size: number
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
  onSubmit?: (nickname: string) => void
  loading?: boolean
}
