import api from './axios'
import { POST_ENDPOINTS } from './endpoints'
import type { Post, CreatePostRequest, UpdatePostRequest, PostListResponse, PostLikeResponse, LikeStatusResponse, LikeCountResponse, ApiPost, ApiPostListResponse } from '../../types/main'

// 📰 Post API Functions

// 게시글 생성
export const createPost = async (postData: CreatePostRequest): Promise<Post> => {
  const response = await api.post(POST_ENDPOINTS.CREATE, postData)
  return response.data
}

// 특정 게시글 조회
export const getPostById = async (postId: number): Promise<Post> => {
  const response = await api.get(POST_ENDPOINTS.GET_BY_ID(postId))
  return response.data
}

// 게시글 수정
export const updatePost = async (postId: number, updateData: UpdatePostRequest): Promise<Post> => {
  const response = await api.put(POST_ENDPOINTS.UPDATE(postId), updateData)
  return response.data
}

// 게시글 삭제
export const deletePost = async (postId: number): Promise<void> => {
  const response = await api.delete(POST_ENDPOINTS.DELETE(postId))
  return response.data
}

// 그룹별 게시글 목록 조회 (페이지네이션 및 필터링) - 새로운 API 응답 형식
export const getPostsByGroup = async (
  groupId: number,
  params?: {
    page?: number
    size?: number
    type?: 'ANNOUNCEMENT' | 'FREE'
    status?: 'ACTIVE' | 'DELETED'
  }
): Promise<ApiPostListResponse> => {
  const response = await api.get(POST_ENDPOINTS.GET_BY_GROUP(groupId), { params })
  return response.data
}

// 좋아요 정보 및 좋아요한 멤버 목록 조회
export const getPostLikes = async (postId: number): Promise<PostLikeResponse> => {
  const response = await api.get(POST_ENDPOINTS.LIKES(postId))
  return response.data
}

// 게시글 좋아요/좋아요 취소
export const togglePostLike = async (postId: number): Promise<{ isLiked: boolean }> => {
  const response = await api.post(POST_ENDPOINTS.LIKE(postId))
  return response.data
}

// 특정 멤버의 좋아요 상태 확인
export const getPostLikeStatus = async (postId: number): Promise<LikeStatusResponse> => {
  const response = await api.get(POST_ENDPOINTS.LIKE_STATUS(postId))
  return response.data
}

// 게시글 좋아요 개수 조회
export const getPostLikeCount = async (postId: number): Promise<LikeCountResponse> => {
  const response = await api.get(POST_ENDPOINTS.LIKE_COUNT(postId))
  return response.data
}
