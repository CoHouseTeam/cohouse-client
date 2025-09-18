import { TransferStatus } from '../../types/settlement'

// 코드 → 라벨
export function fromTransferStatus(status: TransferStatus): string {
  const map: Record<TransferStatus, string> = {
    PENDING: '송금 대기', // 아직 송금되지 않은 상태
    PAID: '송금 완료', // 정상 송금 완료
    REFUNDED: '송금 취소', // 송금 후 환불 완료
    FAILED: '송금 실패', // 송금 처리 실패
    CANCELED: '송금 전 취소', // 송금 진행 전에 사용자가 취소
    REFUND_FAILED: '환불 실패', // 환불 시도했지만 실패
  }
  return map[status] ?? '알 수 없음'
}

// 라벨 → 코드
export function toTransferStatus(input: string): TransferStatus {
  const map: Record<string, TransferStatus> = {
    '송금 대기': 'PENDING',
    '송금 완료': 'PAID',
    '송금 취소': 'REFUNDED',
    '송금 실패': 'FAILED',
  }
  return map[input] ?? 'PENDING'
}
