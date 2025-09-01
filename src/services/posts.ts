import api from '../libs/api/axios';
import type { BoardPost, PageResponse, PostLikes, PostLikesCount } from '../types/main';

function assertGroupUrl(url: string) {
  // Guard: prevent accidental /api/posts/{id} usage for lists
  if (!url.includes('/api/posts/group/')) {
    throw new Error('[ListFetchGuard] List endpoint MUST include /api/posts/group/{groupId}');
  }
}

export async function fetchGroupPosts(params: {
  groupId: number;                // 동적으로 가져온 groupId
  type: 'FREE' | 'ANNOUNCEMENT';
  status?: 'ACTIVE' | 'INACTIVE';
  page?: number;                  // default 1
  size?: number;                  // default 10
}) {
  const { groupId, type, status = 'ACTIVE', page = 1, size = 10 } = params;
  const url = `/api/posts/group/${groupId}?type=${type}&status=${status}&page=${page}&size=${size}`;
  assertGroupUrl(url);
  const { data } = await api.get(url);
  return data as PageResponse<BoardPost>;
}

export async function fetchPost(postId: number) {
  const { data } = await api.get(`/api/posts/${postId}`);
  return data as BoardPost;
}

export async function fetchPostLikes(postId: number) {
  const { data } = await api.get(`/api/posts/${postId}/likes`);
  return data as PostLikes;
}

export async function fetchPostLikesCount(postId: number) {
  const { data } = await api.get(`/api/posts/${postId}/likes/count`);
  return data as PostLikesCount;
}
