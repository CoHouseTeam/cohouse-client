# CoHouse Client

A React-based client application for CoHouse project.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
   ```bash
   npm install
   ```

### Development
   ```bash
   npm run dev
   ```

### Build
```bash
npm run build
```

## 🌐 API Integration

### Environment Variables

Create a `.env.local` file based on `env.example`:

   ```bash
# Local development
VITE_API_BASE_URL=/api
VITE_USE_MSW=false

# Vercel deployment
VITE_API_BASE_URL=/api
VITE_USE_MSW=false
```

### API Usage Examples

#### 📰 Post API

```typescript
import { 
  createPost, 
  getPostById, 
  getPostsByGroup, 
  togglePostLike 
} from './libs/api'

// 게시글 생성
const newPost = await createPost({
  groupId: 1,
  title: "새 게시글",
  content: "게시글 내용입니다."
})

// 특정 게시글 조회
const post = await getPostById(1)

// 그룹별 게시글 목록 조회 (페이지네이션)
const posts = await getPostsByGroup(1, {
  page: 0,
  size: 10,
  sort: 'createdAt,desc'
})

// 게시글 좋아요/좋아요 취소
const result = await togglePostLike(1)
```

#### 🔔 Notification API

```typescript
import { 
  getNotifications, 
  getUnreadNotificationCount,
  markNotificationAsRead 
} from './libs/api'

// 알림 목록 조회
const notifications = await getNotifications({
  page: 0,
  size: 20,
  read: false
})

// 읽지 않은 알림 개수
const unreadCount = await getUnreadNotificationCount()

// 알림 읽음 처리
await markNotificationAsRead(1)
```

#### ❤️ Post Like API

```typescript
import { 
  getPostLikes, 
  getPostLikeStatus, 
  getPostLikeCount 
} from './libs/api'

// 좋아요 정보 및 멤버 목록
const likes = await getPostLikes(1)

// 좋아요 상태 확인
const isLiked = await getPostLikeStatus(1)

// 좋아요 개수
const count = await getPostLikeCount(1)
```

## 📁 Project Structure

```
src/
├── libs/
│   └── api/
│       ├── axios.ts          # Axios 설정
│       ├── endpoints.ts      # API 엔드포인트 정의
│       ├── posts.ts          # Post API 함수
│       ├── notifications.ts  # Notification API 함수
│       └── index.ts          # API 함수 export
├── types/
│   └── main.ts              # TypeScript 타입 정의
└── pages/
    └── Board.tsx            # 게시판 페이지
```

## 🔧 Development

### API Base URL Configuration

The application supports different API base URLs for different environments:

- **Local Development**: `/api` (proxied to backend via Vite)
- **Vercel Deployment**: `/api/proxy` (proxied via Vercel serverless functions)

### Backend Integration

The backend server is located at `http://52.79.237.86:8080` and provides the following API endpoints:

- **Post Controller**: `/api/posts/*`
- **Notification Controller**: `/api/notifications/*`
- **Post-Like Controller**: `/api/posts/*/likes/*`

## 🚀 Deployment

### Vercel

1. Connect your repository to Vercel
2. Set environment variables:
   - `VITE_API_BASE_URL=/api/proxy`
   - `VITE_USE_MSW=false`
3. Deploy

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:4000` |
| `VITE_USE_MSW` | Enable Mock Service Worker | `false` |

## 📝 API Documentation

### Post Controller

- `GET /api/posts/{id}`: Get a specific post
- `PUT /api/posts/{id}`: Update a post
- `DELETE /api/posts/{id}`: Delete a post
- `POST /api/posts`: Create a new post
- `GET /api/posts/{groupId}`: Get posts by group ID with pagination

### Notification Controller

- `PUT /api/notifications/{notificationId}/read`: Mark as read
- `GET /api/notifications`: Get notifications with filtering
- `GET /api/notifications/unread-count`: Get unread count
- `DELETE /api/notifications/all`: Delete all notifications

### Post-Like Controller

- `GET /api/posts/{postId}/likes`: Get like information
- `POST /api/posts/{postId}/likes`: Toggle like
- `GET /api/posts/{postId}/likes/status`: Check like status
- `GET /api/posts/{postId}/likes/count`: Get like count

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
