import api from './axios'
import { POST_ENDPOINTS } from './endpoints'

// 🧪 API 테스트 함수들

// POST 요청 테스트
export const testCreatePost = async () => {
  try {
    console.log('🧪 POST 요청 테스트 시작...')
    console.log('📡 엔드포인트:', POST_ENDPOINTS.CREATE)
    
    const testData = {
      groupId: 1,
      title: "테스트 게시글",
      content: "이것은 테스트 게시글입니다."
    }
    
    console.log('📤 전송할 데이터:', testData)
    
    const response = await api.post(POST_ENDPOINTS.CREATE, testData)
    
    console.log('✅ POST 요청 성공!')
    console.log('📥 응답 데이터:', response.data)
    
    return response.data
  } catch (error: any) {
    console.error('❌ POST 요청 실패:', error)
    console.error('🔍 에러 메시지:', error.message)
    
    if (error.response) {
      console.error('📊 응답 상태:', error.response.status)
      console.error('📊 응답 데이터:', error.response.data)
    }
    
    throw error
  }
}

// GET 요청 테스트
export const testGetPosts = async () => {
  try {
    console.log('🧪 GET 요청 테스트 시작...')
    console.log('📡 엔드포인트:', POST_ENDPOINTS.GET_BY_GROUP(1))
    
    const response = await api.get(POST_ENDPOINTS.GET_BY_GROUP(1))
    
    console.log('✅ GET 요청 성공!')
    console.log('📥 응답 데이터:', response.data)
    
    return response.data
  } catch (error: any) {
    console.error('❌ GET 요청 실패:', error)
    console.error('🔍 에러 메시지:', error.message)
    
    if (error.response) {
      console.error('📊 응답 상태:', error.response.status)
      console.error('📊 응답 데이터:', error.response.data)
    }
    
    throw error
  }
}

// 환경 정보 확인
export const checkEnvironment = () => {
  console.log('🔧 환경 정보:')
  console.log('- VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL)
  console.log('- NODE_ENV:', import.meta.env.NODE_ENV)
  console.log('- BASE_URL:', import.meta.env.BASE_URL)
}
