import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  deleteProfileImage,
  getProfile,
  Profile,
  updateAlertTime,
  updateProfile,
  UploadImageResp,
  uploadProfileImage,
} from '../../api/profile'

export const PROFILE_KEY = ['profile']

// 프로필 조회
export function useProfile() {
  return useQuery<Profile>({
    queryKey: PROFILE_KEY,
    queryFn: getProfile,
    staleTime: 5 * 60 * 1000,
  })
}

// 프로필 일반 정보 수정
export function useUpdateProfile() {
  const qr = useQueryClient()
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (p: Profile) => {
      qr.setQueryData(PROFILE_KEY, p)
    },
  })
}

// 프로필 이미지 업로드
export function useUploadProfileImage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: uploadProfileImage,
    onSuccess: (resp: UploadImageResp) => {
      qc.setQueryData<Profile | undefined>(PROFILE_KEY, (prev) =>
        prev
          ? { ...prev, profileImageUrl: resp.imageUrl, updatedAt: new Date().toISOString() }
          : prev
      )
    },
  })
}

// 프로필 이미지 삭제
export function useDeleteProfileImage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteProfileImage,
    onSuccess: () => {
      qc.setQueryData<Profile | undefined>(PROFILE_KEY, (prev) =>
        prev ? { ...prev, profileImageUrl: null, updatedAt: new Date().toISOString() } : prev
      )
    },
  })
}

// 알림 시간 변경
export function useUpdateAlertTime() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ hour, minute }: { hour: number; minute: number }) =>
      updateAlertTime(hour, minute),
    onSuccess: (p: Profile) => {
      qc.setQueryData(PROFILE_KEY, p)
    },
  })
}
