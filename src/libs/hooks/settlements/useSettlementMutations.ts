import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  postPaymentDone,
  cancelSettlement,
  uploadSettlementReceipt,
  UploadReceiptResp,
  deleteSettlementReceipt,
  createSettlement,
} from '../../api/settlements'
import { CreateSettlementBody, CreateSettlementResp } from '../../../types/settlement'

export const settlementDetailKey = (id: number) => ['settlementDetail', id] as const
export const mySettlementsKey = ['settlements', 'my'] as const
export const groupSettlementsKey = (groupId: number) => ['settlements', 'group', groupId] as const

// 송금 완료
export function usePaySettlement() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => postPaymentDone(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settlements', 'my'] })
    },
  })
}

// 정산 취소
export function useCancelSettlement() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => cancelSettlement(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settlements', 'my'] })
    },
  })
}

// 영수증 업로드 (POST/PUT)

export function useUploadSettlementReceipt() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (vars: {
      settlementId: number
      groupId: number
      file: File
      method?: 'POST' | 'PUT' // 최초 업로드: POST, 교체: PUT
    }) =>
      uploadSettlementReceipt(vars.settlementId, vars.groupId, vars.file, vars.method ?? 'POST'),
    onSuccess: (resp: UploadReceiptResp, vars) => {
      qc.setQueryData(settlementDetailKey(vars.settlementId), (prev) =>
        prev ? { ...prev, imageUrl: resp.imageUrl, updatedAt: new Date().toISOString() } : prev
      )
    },
  })
}

// 영수증 삭제(DELETE)
export function useDeleteSettlementReceipt() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (settlementId: number) => deleteSettlementReceipt(settlementId),
    onSuccess: (_resp, settlementId) => {
      qc.setQueryData(settlementDetailKey(settlementId), (prev) =>
        prev ? { ...prev, ImageUrl: null, updateAt: new Date().toISOString() } : prev
      )
    },
  })
}

// 정산 생성(등록)
export function useCreateSettlement(groupId: number) {
  const qc = useQueryClient()

  return useMutation<CreateSettlementResp, unknown, CreateSettlementBody>({
    mutationFn: (body) => createSettlement(body),

    onSuccess: (created) => {
      // 방금 생성된 상세(created: CreateSettlementResp)를 캐시에 미리 심기
      qc.setQueryData(settlementDetailKey(created.id), created)
      // 목록들 갱신(필요 시 쿼리키 프로젝트에 맞게 조정)
      qc.invalidateQueries({ queryKey: mySettlementsKey })
      if (groupId !== undefined) {
        qc.invalidateQueries({ queryKey: groupSettlementsKey(groupId) })
      }
    },
  })
}
