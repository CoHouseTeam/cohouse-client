import { HttpResponse, http } from 'msw'

import type {
  Settlement,
  SettlementListItem,
  SettlementParticipant,
  SettlementCategory,
  PaymentHistoryItem,
  MessageResponse,
  CreateSettlementSpecDTO,
} from '../../types/settlement'

import { settlements, myPaymentHistory, members, toCategory } from '../../mocks/db'

/* ─────────────────────────────────────────────
   0) 엔드포인트
   ─────────────────────────────────────────────
   - GET   /api/settlements                                 : 내 정산 목록(리스트 전용 스키마)
   - GET   /api/settlements/:settlementId                   : 내 정산 상세
   - GET   /api/members                                     : 멤버 목록 조회
   - POST  /api/settlements                                 : 정산 생성(등록)
   - PATCH /api/settlements/:settlementId/payments          : 참여자 송금/환불/실패 처리
   - PATCH /api/settlements/:settlementId                   : 정산 전체 취소
   - GET   /api/payments/history                            : 내 송금 히스토리
   ───────────────────────────────────────────── */

const BASE = '/api/settlements'

const CURRENT_GM_ID = 1 // 기본값: 1 (최꿀꿀)
const getCurrentGmId = () => CURRENT_GM_ID
// const setCurrentGmId = (id: number) => { CURRENT_GM_ID = id }

/* ─────────────────────────────────────────────
   1) 정산 목록 조회
      GET /api/settlements
      - status 없으면 전체
      - SettlementListItem[] 반환
   ───────────────────────────────────────────── */
export const getSettlementList = http.get(`${BASE}`, () => {
  const me = getCurrentGmId()

  // 내 것만 필터
  const mine = settlements
    .filter((s) => s.payerId === me || s.participants.some((p) => p.group_member_id === me))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt)) // 최신순

  // SettlementListItem 타입으로 변환(원하는 정보만 추출)
  const list: SettlementListItem[] = mine.map((s) => ({
    id: s.id,
    category: s.category,
    title: s.title,
    total_amount: s.total_amount,
    status: s.status,
    createdAt: s.createdAt,
  }))

  return HttpResponse.json({ items: list }, { status: 200 })
})

/* ─────────────────────────────────────────────
   2) 정산 상세 조회
    GET /api/settlements/:settlementId
    - URL 경로 파라미터(:settlementId)로 특정 정산 단건 조회
   ───────────────────────────────────────────── */

export const getSettlementDetail = http.get(`${BASE}/:settlementId`, ({ params }) => {
  const me = getCurrentGmId()
  // :id 파라미터 파싱
  const id = Number(params.settlementId)

  // id 유효성 검사
  if (!Number.isFinite(id)) {
    return HttpResponse.json({ message: 'Invalid id' }, { status: 400 })
  }

  // 데이터 조회
  const item = settlements.find((s) => s.id === id)
  if (!item) {
    return HttpResponse.json({ message: 'Settlement not found' }, { status: 404 })
  }

  const isMine = item.payerId === me || item.participants.some((p) => p.group_member_id === me)
  if (!isMine) {
    return HttpResponse.json<MessageResponse>({ message: 'Forbidden' }, { status: 403 })
  }

  return HttpResponse.json<{ item: Settlement }>({ item }, { status: 200 })
})

/* ─────────────────────────────────────────────
   3) 멤버 목록 조회 (모달용 보조 API)
   GET /api/members
   응답: { items: Array<{ id:number; name:string; profileUrl:string }> }
   ───────────────────────────────────────────── */
export const getMembers = http.get('/api/members', () => {
  const items = Object.entries(members).map(([id, m]) => ({
    id: Number(id),
    name: m.name,
    profileUrl: m.profileUrl,
  }))
  return HttpResponse.json({ items }, { status: 200 })
})

/* ─────────────────────────────────────────────
   4) 정산 생성(등록)
   POST /api/settlements
   body: CreateSettlementBody
   응답: { item: Settlement }

   동작:
   - 필수값 검증(payerId, title, total_amount, participants)
   - category가 문자열이면 toCategory로 변환(예: '식비' → 'FOOD')
   - participants는 PENDING + paidAt=null 로 생성
   - settlement.status='PENDING', createdAt=now, completedAt=null
   - 생성된 Settlement를 { item }으로 201 반환
   ───────────────────────────────────────────── */
export const createSettlement = http.post(`${BASE}`, async ({ request }) => {
  const body = (await request.json().catch(() => null)) as CreateSettlementSpecDTO | null
  if (!body) return HttpResponse.json({ message: 'Invalid JSON' }, { status: 400 })

  const { title, description, category, settlementAmount, participantIds } = body

  // 필수값 검증
  if (
    !title?.trim() ||
    !category ||
    !Number.isFinite(settlementAmount) ||
    settlementAmount <= 0 ||
    !participantIds?.length
  ) {
    return HttpResponse.json({ message: 'Missing required fields' }, { status: 400 })
  }

  // 결제자는 현재 로그인 사용자(ID 가정)
  const payerId = getCurrentGmId()

  // 카테고리 정규화(문자열 → SettlementCategory)
  const cat: SettlementCategory =
    typeof category === 'string' ? toCategory(category) : (category as SettlementCategory)

  // 균등분배
  const n = participantIds.length
  const base = Math.floor(settlementAmount / n)
  const rem = settlementAmount - base * n

  // 새 정산 ID/참여자 ID 시퀀스
  const nextSettlementId = () => (settlements.reduce((m, s) => Math.max(m, s.id), 0) || 0) + 1
  const startPid = Math.max(0, ...settlements.flatMap((s) => s.participants.map((p) => p.id)))
  let idSeq = startPid

  const newParticipants: SettlementParticipant[] = participantIds.map((gmId, idx) => ({
    id: ++idSeq,
    group_member_id: gmId,
    per_person_amount: base + (idx === n - 1 ? rem : 0),
    status: 'PENDING',
    paidAt: null,
  }))

  const newSettlement: Settlement = {
    id: nextSettlementId(),
    payerId,
    category: cat,
    title,
    description: description ?? null,
    total_amount: settlementAmount,
    status: 'PENDING',
    imageUrl: null,
    createdAt: new Date().toISOString(),
    completedAt: null,
    participants: newParticipants,
  }

  settlements.unshift(newSettlement)
  return HttpResponse.json<{ item: Settlement }>({ item: newSettlement }, { status: 201 })
})

/* ─────────────────────────────────────────────
   5) 참여자 송금/환불/실패 처리 (3가지 액션) - REFUNDED는 정산 취소 부분에서 처리
   PATCH /api/settlements/:settlementId/payments
   body: { group_member_id: number, action: 'PENDING' | 'PAID' | 'FAILED' }
   응답: { item: Settlement } (최신 상태)
   ───────────────────────────────────────────── */
export const patchPayments = http.patch(
  `${BASE}/:settlementId/payments`,
  async ({ params, request }) => {
    // 정산 ID확인
    const settlementId = Number(params.settlementId)
    if (!Number.isFinite(settlementId)) {
      return HttpResponse.json({ message: 'Invalid id' }, { status: 400 })
    }

    // 정산 데이터 찾기 + 상태 확인 (진행중(PENDING)일 때만 변경 허용)
    const settlement = settlements.find((x) => x.id === settlementId)
    if (!settlement)
      return HttpResponse.json<MessageResponse>(
        { message: 'Settlement not found' },
        { status: 404 }
      )
    if (settlement.status !== 'PENDING') {
      return HttpResponse.json<MessageResponse>(
        { message: 'Only PENDING can update' },
        { status: 404 }
      )
    }

    // 요청 본문(JSON) 읽기 → 필요한 값 뽑기
    const data = (await request.json().catch(() => null)) as {
      group_member_id?: number | string
      action?: string
    }
    if (!data) {
      return HttpResponse.json<MessageResponse>({ message: 'Invalid data' }, { status: 400 })
    }

    const group_member_id = Number(data.group_member_id)
    const action = String(data.action || '').toUpperCase()

    if (!Number.isFinite(group_member_id)) {
      return HttpResponse.json<MessageResponse>(
        { message: 'Invalid group_member_id' },
        { status: 400 }
      )
    }

    // 참여자 찾기
    const participant = settlement.participants.find((pp) => pp.group_member_id === group_member_id)
    if (!participant)
      return HttpResponse.json<MessageResponse>(
        { message: 'Participant not found' },
        { status: 404 }
      )

    // 히스토리 id/시간
    const historyId =
      (myPaymentHistory.reduce((mx, x) => Math.max(mx, x.paymentHistoryId), 0) || 0) + 1
    let paymentHistoryIdSeq = historyId

    // 액션 처리 (PENDING | SENT | REFUNDED | FAILED)
    switch (action) {
      case 'PENDING': {
        // 송금 대기 처리 : 참여자 상태를 PENDING 되돌리고 paidAt은 비움
        if (participant.status !== 'PENDING') {
          participant.status = 'PENDING'
          participant.paidAt = null
          // 보통 대기로 전환은 금전 거래가 아니라서 히스토리는 남기지 않음
        }
        break
      }

      case 'PAID': {
        // 송금 완료
        if (participant.status !== 'PAID') {
          participant.status = 'PAID'
          participant.paidAt = new Date().toISOString()
          myPaymentHistory.push({
            paymentHistoryId: paymentHistoryIdSeq++,
            settlementId: settlement.id,
            senderId: participant.group_member_id, // 참여자
            receiverId: settlement.payerId, // 결제자
            amount: participant.per_person_amount,
            status: 'PAID',
            createdAt: new Date().toISOString(),
          })

          // 전원 송금 완료되면 정산 완료
          if (settlement.participants.every((pp) => pp.status === 'PAID')) {
            settlement.status = 'COMPLETED'
            settlement.completedAt = new Date().toISOString()
          }
        }
        break
      }

      case 'FAILED': {
        // 송금 실패 — 송금 중 오류난 상태(재시도 위해 상태 표시)
        if (participant.status !== 'PAID') {
          participant.status = 'FAILED'
          participant.paidAt = null
          myPaymentHistory.push({
            paymentHistoryId: paymentHistoryIdSeq++,
            settlementId: settlement.id,
            senderId: participant.group_member_id,
            receiverId: settlement.payerId,
            amount: participant.per_person_amount,
            status: 'FAILED',
            createdAt: new Date().toISOString(),
          })
        }
        break
      }

      default:
        return HttpResponse.json<MessageResponse>({ message: 'Invalid action' }, { status: 400 })
    }

    return HttpResponse.json<{ item: Settlement }>({ item: settlement }, { status: 200 })
  }
)

/* ─────────────────────────────────────────────
   6) 정산 취소
   PATCH /api/settlements/:settlementId
   - SENT 참여자만 REFUNDED 환불 이력 추가(결제자 → 참여자)
   - 정산 상태 CANCELED로 표시 후, 목록에서 제거
   - 송금 히스토리는 삭제하지 않음
   ───────────────────────────────────────────── */
export const cancelSettlement = http.patch(`${BASE}/:settlementId`, async ({ params }) => {
  const settlementId = Number(params.settlementId)
  if (!Number.isFinite(settlementId)) {
    return HttpResponse.json<MessageResponse>({ message: 'Invalid id' }, { status: 400 })
  }

  const settlement = settlements.find((s) => s.id === settlementId)
  if (!settlement) {
    return HttpResponse.json<MessageResponse>({ message: 'Settlement not found' }, { status: 404 })
  }

  // 환불처리(정산취소)

  const startHistoryId =
    (myPaymentHistory.reduce((mx, h) => Math.max(mx, h.paymentHistoryId), 0) || 0) + 1
  let paymentHistoryIdSeq = startHistoryId

  for (const p of settlement.participants) {
    if (p.status === 'PAID') {
      p.status = 'REFUNDED'
      myPaymentHistory.push({
        paymentHistoryId: paymentHistoryIdSeq++,
        settlementId: settlement.id,
        senderId: settlement.payerId, // 참여자
        receiverId: p.group_member_id, // 결제자
        amount: p.per_person_amount,
        status: 'REFUNDED',
        createdAt: new Date().toISOString(),
      })
    } else {
      p.paidAt = null
    }
  }

  // 정산 상태 수정 후 목록에서 제거
  settlement.status = 'CANCELED'
  settlement.completedAt = null

  return HttpResponse.json<MessageResponse>(
    { message: '정산이 취소되었고 송금 금액이 환불되었습니다.' },
    { status: 200 }
  )
})

/* ─────────────────────────────────────────────
   7) 내 송금 내역 조회
    GET /api/payments/history
   - 현재 사용자(그룹 멤버 ID) 기준으로만 반환
   ───────────────────────────────────────────── */
export const getPaymentHistory = http.get('/api/payments/history', () => {
  const me = getCurrentGmId()

  const items: PaymentHistoryItem[] = myPaymentHistory
    .filter(
      (h) =>
        h.senderId === me &&
        (h.status === 'PAID' || h.status === 'FAILED' || h.status === 'REFUNDED')
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return HttpResponse.json<{ items: PaymentHistoryItem[] }>({ items }, { status: 200 })
})
