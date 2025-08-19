import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

// 브라우저에서 사용할 서비스워커 인스턴스 생성
export const worker = setupWorker(...handlers)
