import { TransferStatus } from '../../types/settlement'

// 코드 → 라벨
export function fromTransferStatus(status: TransferStatus): string {
  const map: Record<TransferStatus, string> = {
    PENDING: '송금 대기',
    PAID: '송금 완료',
    REFUNDED: '송금 취소',
    FAILED: '송금 실패',
    CANCELED: '송금 전 취소',
  }
  return map[status] ?? '송금 대기'
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
