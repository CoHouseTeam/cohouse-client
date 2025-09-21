import { useMutation } from '@tanstack/react-query'
import { deleteFcmToken, RegisterFcmReq, RegisterFcmResp, registerFcmToken } from '../api/push'

// 토큰 등록 훅
export function useRegisterFcmToken() {
  return useMutation<RegisterFcmResp, Error, RegisterFcmReq>({
    mutationFn: (body) => registerFcmToken(body),
  })
}

// 토큰 삭제 훅
export function useDeleteFcmToken() {
  return useMutation({
    mutationFn: (tokenId: number) => deleteFcmToken(tokenId),
  })
}
