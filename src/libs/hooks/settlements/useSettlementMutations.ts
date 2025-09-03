import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  postPaymentDone,
  cancelSettlement,
  uploadSettlementReceipt,
  deleteSettlementReceipt,
  createSettlement,
  ReceiptOcrResp,
  ocrSettlementReceipt,
} from '../../api/settlements'
import { CreateSettlementBody, Settlement } from '../../../types/settlement'

export const settlementDetailKey = (id: number) => ['settlementDetail', id] as const
export const mySettlementsKey = ['settlements', 'my'] as const
export const groupSettlementsKey = (groupId: number) => ['settlements', 'group', groupId] as const

// 송금 완료
export function usePaySettlement() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => postPaymentDone(id),
    onSuccess: () => {
      // 목록/히스토리/그룹 모두 갱신
      qc.invalidateQueries({ queryKey: ['settlements', 'my'] })
      qc.invalidateQueries({ queryKey: ['settlements', 'myHistory'] })
      qc.invalidateQueries({ queryKey: ['settlements', 'group'] })
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
    onSuccess: (resp: ReceiptOcrResp, vars) => {
      qc.setQueryData(settlementDetailKey(vars.settlementId), (prev) =>
        prev ? { ...prev, imageUrl: resp.imageUrl, updatedAt: new Date().toISOString() } : prev
      )
    },
  })
}

// OCR
export function useOcrSettlementReceipt() {
  return useMutation({
    mutationFn: async (file: File): Promise<ReceiptOcrResp> => {
      return await ocrSettlementReceipt(file)
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
const MY_KEY = ['settlements', 'my'] as const
const DETAIL_KEY = (id: number) => ['settlementDetail', id] as const

export function useCreateSettlement() {
  const qc = useQueryClient()

  return useMutation<Settlement, unknown, CreateSettlementBody>({
    mutationFn: createSettlement,
    onSuccess: (created) => {
      // 1) 상세 캐시에 즉시 반영 (키는 훅과 동일하게)
      qc.setQueryData(DETAIL_KEY(created.id), created)

      // 2) "진행 중(내가 참여한)" 리스트에 바로 끼워넣기
      qc.setQueryData<Settlement[] | undefined>(MY_KEY, (prev) => {
        const list = Array.isArray(prev) ? prev : []
        return list.some((s) => s.id === created.id) ? list : [created, ...list]
      })

      // 3) 현재 화면은 유지하고, 비활성 쿼리만 백그라운드에서 최신화
      qc.invalidateQueries({ queryKey: MY_KEY, refetchType: 'inactive' })
    },
  })
}
