import api from '../libs/api/axios';
import type { BoardPost, BoardPostDetail, PageResponse, PostLikeResponse, LikeStatusResponse, LikeCountResponse } from '../types/main';

function assertGroupUrl(url: string) {
  // Guard: prevent accidental /api/posts/{id} usage for lists
  if (!url.includes('/api/posts/groups/')) {
    throw new Error('[ListFetchGuard] List endpoint MUST include /api/posts/groups/{groupId}');
  }
}

export async function fetchGroupPosts(params: {
  groupId: number;                // 동적으로 가져온 groupId
  type: 'FREE' | 'ANNOUNCEMENT';
  status?: 'ACTIVE' | 'INACTIVE';
}) {
  const { groupId, type, status = 'ACTIVE' } = params;
  const url = `/api/posts/groups/${groupId}?type=${type}&status=${status}`;
  assertGroupUrl(url);
  const { data } = await api.get(url);
  return data as PageResponse<BoardPost>;
}

export async function fetchPost(postId: number) {
  const { data } = await api.get(`/api/posts/${postId}`);
  return data as BoardPostDetail;
}

export async function fetchPostLikes(postId: number) {
  const { data } = await api.get(`/api/posts/${postId}/likes`);
  return data as PostLikeResponse;
}

export async function fetchPostLikesCount(postId: number) {
  const { data } = await api.get(`/api/posts/${postId}/likes/count`);
  return data as LikeCountResponse;
}

export async function fetchPostLikeStatus(postId: number) {
  const { data } = await api.get(`/api/posts/${postId}/likes/status`);
  return data as LikeStatusResponse;
}
