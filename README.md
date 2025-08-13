# CoHouse - 공동주택 관리 앱

공동주택의 할일 관리, 정산, 공지사항, 건의사항을 효율적으로 관리할 수 있는 모바일 앱입니다.

## 🚀 Tech Stack

![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-4.5.0-646CFF?logo=vite)
![Capacitor](https://img.shields.io/badge/Capacitor-5.0.0-119EFF?logo=capacitor)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3.5-38B2AC?logo=tailwind-css)
![DaisyUI](https://img.shields.io/badge/DaisyUI-4.4.0-5A0EF8?logo=daisyui)
![Zustand](https://img.shields.io/badge/Zustand-4.4.0-764ABC?logo=redux)
![React Query](https://img.shields.io/badge/React_Query-5.8.0-FF4154?logo=react-query)

## 📋 Features

- **할일 관리**: 공동 주택의 할일을 체계적으로 관리하고 추적
- **정산 관리**: 공동 비용 정산을 효율적으로 처리
- **보드**: 공지사항, 기념일, 건의사항 관리
- **마이페이지**: 개인 정보 및 활동 내역 관리

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Android Studio (Android 개발용)
- Xcode (iOS 개발용, macOS만)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cohouse-client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   Edit `.env` file with your API base URL:
   ```env
   VITE_API_BASE_URL=http://localhost:4000
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

The web version will be available at `http://localhost:3000`

5. **Build and run mobile app**
   ```bash
   # Android
   npm run cap:build
   npm run cap:android
   
   # iOS (macOS only)
   npm run cap:build
   npm run cap:ios
   ```

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run cap:build` | Build and sync with Capacitor |
| `npm run cap:android` | Open Android Studio |
| `npm run cap:ios` | Open Xcode (macOS only) |
| `npm run cap:run:android` | Run on Android device/emulator |
| `npm run cap:run:ios` | Run on iOS device/simulator (macOS only) |

## 🌍 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:4000` |

## 🏗️ Project Structure

```
src/
├── app/
│   ├── store.ts              # Zustand root store
│   ├── queryClient.ts        # React Query client
│   └── routes.tsx            # Route configuration
├── components/
│   └── ui/                   # Shared UI components
├── features/
│   ├── auth/                 # Authentication
│   ├── settlements/          # 정산 관리
│   ├── tasks/                # 할일 관리
│   ├── board/                # 보드 (공지/기념일/건의)
│   └── profile/              # 마이페이지
├── pages/
│   ├── Dashboard.tsx
│   ├── Login.tsx
│   ├── Settlements.tsx
│   ├── Tasks.tsx
│   ├── Board.tsx
│   └── MyPage.tsx
├── libs/
│   ├── api/
│   │   ├── axios.ts          # Axios configuration
│   │   └── endpoints.ts      # API endpoints
│   ├── hooks/
│   └── utils/
└── styles/
    └── globals.css
```

## 🚀 Deployment

### Web Deployment (Vercel)

1. **Connect your repository to Vercel**
2. **Set environment variables** in Vercel dashboard:
   - `VITE_API_BASE_URL`: Your production API URL
3. **Deploy**: Vercel will automatically build and deploy on push to main branch

### Mobile App Deployment

#### Android
1. **Build the app**:
   ```bash
   npm run cap:build
   npm run cap:android
   ```
2. **In Android Studio**: Build → Generate Signed Bundle/APK
3. **Upload to Google Play Console**

#### iOS
1. **Build the app**:
   ```bash
   npm run cap:build
   npm run cap:ios
   ```
2. **In Xcode**: Product → Archive
3. **Upload to App Store Connect**

### Build for Production

```bash
# Web
npm run build

# Mobile
npm run cap:build
```

The built files will be in the `dist/` directory for web, and native projects in `android/` and `ios/` directories.

## 🌿 Branching Model

We follow **Git Flow** branching strategy:

- `main`: Production-ready code
- `develop`: Development integration branch
- `feature/*`: New features
- `release/*`: Release preparation
- `hotfix/*`: Critical bug fixes

## 👥 Team

- **@somin**: Tasks feature owner
- **@heewon**: Settlements feature owner  
- **@haneul**: Board feature owner

## 📝 Contributing

1. Create a feature branch from `develop`
2. Make your changes
3. Run linting and type checking: `npm run lint && npm run typecheck`
4. Submit a pull request to `develop`
5. Ensure CI passes and code review is completed

## 📄 License

This project is licensed under the MIT License.
