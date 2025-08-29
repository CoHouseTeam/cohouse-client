import { HttpResponse, http } from 'msw'
import type {
  Settlement,
  SettlementParticipant,
  SettlementCategory,
  MessageResponse,
  CreateSettlementBody,
} from '../../types/settlement'

import { settlements, myPaymentHistory, members, toCategory } from '../../mocks/db/settlement'

/* ─────────────────────────────────────────────
   0) 엔드포인트 (명세서 기준, MSW는 /api 하나로 통일)
   ─────────────────────────────────────────────
   - POST   /api/settlements                               : 정산 등록
   - DELETE /api/settlements/:settlementId                 : 정산 취소(204)
   - POST   /api/settlements/:settlementId/payment         : 송금 완료 처리(200)
   - GET    /api/settlements/my                            : 나의 정산 목록
   - GET    /api/settlements/:settlementId                 : 나의 특정 정산 상세
   - GET    /api/settlements/group/:groupId                : 그룹의 정산 목록(그룹장)
   - GET    /api/settlements/:settlementId/participants    : 정산 참여자 목록
   - GET    /api/settlements/my/history                    : 나의 정산 히스토리(페이지네이션)
   - GET    /api/payments/histories                        : 나의 송금 내역(페이지네이션)
   - POST   /api/settlements/:settlementId/receipt         : 영수증 업로드
   - PUT    /api/settlements/:settlementId/receipt         : 영수증 업데이트
   - DELETE /api/settlements/:settlementId/receipt         : 영수증 삭제
   (보조) GET /api/members                                 : 멤버 목록 조회
   ───────────────────────────────────────────── */

const BASE = '/api'

const CURRENT_GM_ID = 3
const getCurrentGmId = () => CURRENT_GM_ID

function isEqualDistribution(parts: SettlementParticipant[]): boolean {
  if (!parts.length) return true
  const first = parts[0].shareAmount
  return parts.every((p) => p.shareAmount === first)
}

/* 1) 나의 정산 목록 */
export const getMySettlements = http.get(`${BASE}/settlements/my`, () => {
  const me = getCurrentGmId()
  const mine = settlements
    .filter((s) => s.payerId === me || s.participants.some((p) => p.memberId === me))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  return HttpResponse.json(mine, { status: 200 })
})

/* 2) 정산 상세 */
export const getSettlementDetail = http.get(`${BASE}/settlements/:settlementId`, ({ params }) => {
  const me = getCurrentGmId()
  const id = Number(params.settlementId)
  if (!Number.isFinite(id)) return HttpResponse.json({ message: 'Invalid id' }, { status: 400 })

  const item = settlements.find((s) => s.id === id)
  if (!item) return HttpResponse.json({ message: 'Settlement not found' }, { status: 404 })

  const isMine = item.payerId === me || item.participants.some((p) => p.memberId === me)
  if (!isMine) return HttpResponse.json<MessageResponse>({ message: 'Forbidden' }, { status: 403 })

  return HttpResponse.json(item, { status: 200 })
})

/* 3) 멤버 목록(보조) */
export const getMembers = http.get(`${BASE}/members`, () => {
  const items = Object.entries(members).map(([id, m]) => ({
    id: Number(id),
    name: m.name,
    profileUrl: m.profileUrl,
  }))
  return HttpResponse.json({ items }, { status: 200 })
})

/* 4) 정산 생성 */
export const createSettlement = http.post(`${BASE}/settlements`, async ({ request }) => {
  const body = (await request.json().catch(() => null)) as CreateSettlementBody | null
  if (!body) return HttpResponse.json({ message: 'Invalid JSON' }, { status: 400 })

  const { title, description, category, settlementAmount, equalDistribution } = body
  if (!title?.trim() || !category || !Number.isFinite(settlementAmount) || settlementAmount <= 0) {
    return HttpResponse.json({ message: 'Missing required fields' }, { status: 400 })
  }

  const payerId = getCurrentGmId()
  const cat: SettlementCategory =
    typeof category === 'string' ? toCategory(category) : (category as SettlementCategory)

  // 참여자 목록 만들기
  const participantIds: number[] = equalDistribution
    ? body.participantIds
    : Object.keys(body.manualShares ?? {}).map((k) => Number(k))

  if (!participantIds?.length) {
    return HttpResponse.json({ message: 'No participants' }, { status: 400 })
  }

  // 분배 계산
  let perPerson: Array<{ memberId: number; amount: number }>
  if (equalDistribution) {
    const n = participantIds.length
    const base = Math.floor(settlementAmount / n)
    const rem = settlementAmount - base * n
    perPerson = participantIds.map((gmId, idx) => ({
      memberId: gmId,
      amount: base + (idx === n - 1 ? rem : 0),
    }))
  } else {
    const shares = body.manualShares ?? {}
    perPerson = participantIds.map((gmId) => ({
      memberId: gmId,
      amount: Number((shares as Record<string, number>)[gmId] ?? 0),
    }))
    const sum = perPerson.reduce((a, b) => a + b.amount, 0)
    if (sum !== settlementAmount) {
      return HttpResponse.json({ message: 'manualShares sum mismatch' }, { status: 400 })
    }
  }

  // ID 시퀀스
  const nextSettlementId = () => (settlements.reduce((m, s) => Math.max(m, s.id), 0) || 0) + 1
  const startPid = Math.max(0, ...settlements.flatMap((s) => s.participants.map((p) => p.id)))
  let pidSeq = startPid

  const participants: SettlementParticipant[] = perPerson.map(({ memberId, amount }) => ({
    id: ++pidSeq,
    memberId,
    memberName: members[memberId as keyof typeof members]?.name ?? `멤버#${memberId}`,
    shareAmount: amount,
    status: 'PENDING',
  }))

  const now = new Date().toISOString()
  const newSettlement: Settlement = {
    id: nextSettlementId(),
    payerId,
    payerName: members[payerId as keyof typeof members]?.name ?? `멤버#${payerId}`,
    category: cat,
    title,
    description: description ?? null,
    settlementAmount,
    status: 'PENDING',
    imageUrl: null,
    platformSupportAmount: 0,
    equalDistribution: isEqualDistribution(participants),
    participants,
    createdAt: now,
    updatedAt: now,
  }

  settlements.unshift(newSettlement)
  // 200으로 맞춰도 되고 201도 OK. CI 기대값에 맞추세요.
  return HttpResponse.json(newSettlement, { status: 200 })
})

/* 5) 송금 완료 */
export const postPaymentDone = http.post(
  `${BASE}/settlements/:settlementId/payment`,
  ({ params }) => {
    const settlementId = Number(params.settlementId)
    if (!Number.isFinite(settlementId)) {
      return HttpResponse.json<MessageResponse>({ message: 'Invalid id' }, { status: 400 })
    }
    const me = getCurrentGmId()
    const s = settlements.find((x) => x.id === settlementId)
    if (!s)
      return HttpResponse.json<MessageResponse>(
        { message: 'Settlement not found' },
        { status: 404 }
      )
    if (s.status !== 'PENDING') {
      return HttpResponse.json<MessageResponse>(
        { message: 'Only PENDING can update' },
        { status: 400 }
      )
    }
    const p = s.participants.find((pp) => pp.memberId === me)
    if (!p)
      return HttpResponse.json<MessageResponse>(
        { message: 'Participant not found' },
        { status: 404 }
      )
    if (p.status === 'PAID')
      return HttpResponse.json<MessageResponse>({ message: 'Already paid' }, { status: 200 })

    p.status = 'PAID'
    const nextHistId =
      (myPaymentHistory.reduce((mx, h) => Math.max(mx, h.paymentHistoryId), 0) || 0) + 1
    myPaymentHistory.push({
      paymentHistoryId: nextHistId,
      settlementId: s.id,
      senderId: me,
      receiverId: s.payerId,
      amount: p.shareAmount,
      status: 'PAID',
      transferAt: new Date().toISOString(),
    })

    if (s.participants.every((pp) => pp.status === 'PAID')) {
      s.status = 'COMPLETED'
      s.updatedAt = new Date().toISOString()
    }

    return HttpResponse.json(s, { status: 200 })
  }
)

/* 6) 정산 취소 */
export const deleteSettlement = http.delete(`${BASE}/settlements/:settlementId`, ({ params }) => {
  const settlementId = Number(params.settlementId)
  if (!Number.isFinite(settlementId)) return new HttpResponse(null, { status: 204 })

  const s = settlements.find((x) => x.id === settlementId)
  if (!s) return new HttpResponse(null, { status: 204 })

  let seq = (myPaymentHistory.reduce((mx, h) => Math.max(mx, h.paymentHistoryId), 0) || 0) + 1
  for (const p of s.participants) {
    if (p.status === 'PAID') {
      p.status = 'REFUNDED'
      myPaymentHistory.push({
        paymentHistoryId: seq++,
        settlementId: s.id,
        senderId: s.payerId,
        receiverId: p.memberId,
        amount: p.shareAmount,
        status: 'REFUNDED',
        transferAt: new Date().toISOString(),
      })
    } else {
      p.status = 'CANCELED'
    }
  }
  s.status = 'CANCELED'
  s.updatedAt = new Date().toISOString()

  return new HttpResponse(null, { status: 204 })
})

/* 7) 참여자 목록 */
export const getSettlementParticipants = http.get(
  `${BASE}/settlements/:settlementId/participants`,
  ({ params }) => {
    const id = Number(params.settlementId)
    if (!Number.isFinite(id)) return HttpResponse.json({ message: 'Invalid id' }, { status: 400 })
    const s = settlements.find((x) => x.id === id)
    if (!s) return HttpResponse.json({ message: 'Settlement not found' }, { status: 404 })
    return HttpResponse.json(s.participants, { status: 200 })
  }
)

/* 8) 그룹 목록 */
export const getGroupSettlements = http.get(`${BASE}/settlements/group/:groupId`, () => {
  return HttpResponse.json(
    settlements.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    { status: 200 }
  )
})

/* 9) 나의 정산 히스토리 */
export const getMySettlementHistory = http.get(`${BASE}/settlements/my/history`, () => {
  const me = getCurrentGmId()
  const mine = settlements
    .filter((s) => s.payerId === me || s.participants.some((p) => p.memberId === me))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const page = {
    content: mine,
    pageable: {
      pageNumber: 0,
      pageSize: 20,
      sort: { empty: false, sorted: true, unsorted: false },
      offset: 0,
      paged: true,
      unpaged: false,
    },
    last: true,
    totalElements: mine.length,
    totalPages: 1,
    first: true,
    size: 20,
    number: 0,
    sort: { empty: false, sorted: true, unsorted: false },
    numberOfElements: mine.length,
    empty: mine.length === 0,
  }
  return HttpResponse.json(page, { status: 200 })
})

/* 10) 송금 히스토리 */
export const getPaymentHistories = http.get(`${BASE}/payments/histories`, ({ request }) => {
  const me = getCurrentGmId()
  const url = new URL(request.url)
  const settlementId = url.searchParams.get('settlementId')
  const fromDate = url.searchParams.get('fromDate')
  const toDate = url.searchParams.get('toDate')
  const paymentType = url.searchParams.get('paymentType')

  let rows = myPaymentHistory.filter((h) => h.senderId === me)

  if (settlementId && Number.isFinite(Number(settlementId))) {
    rows = rows.filter((h) => h.settlementId === Number(settlementId))
  }
  if (paymentType) rows = rows.filter((h) => h.status === paymentType)
  if (fromDate) rows = rows.filter((h) => h.transferAt >= fromDate)
  if (toDate) rows = rows.filter((h) => h.transferAt <= toDate)

  rows = rows.sort((a, b) => b.transferAt.localeCompare(a.transferAt))

  const page = {
    content: rows,
    pageable: {
      pageNumber: 0,
      pageSize: 20,
      sort: { empty: true, unsorted: true, sorted: false },
      offset: 0,
      paged: true,
      unpaged: false,
    },
    last: true,
    totalPages: 1,
    totalElements: rows.length,
    first: true,
    size: 20,
    number: 0,
    sort: { empty: true, unsorted: true, sorted: false },
    numberOfElements: rows.length,
    empty: rows.length === 0,
  }

  return HttpResponse.json(page, { status: 200 })
})

/* 11) 영수증 업로드/수정/삭제 — 필드명 'file' */
export const uploadReceipt = http.post(
  `${BASE}/settlements/:settlementId/receipt`,
  async ({ params, request }) => {
    const id = Number(params.settlementId)
    if (!Number.isFinite(id)) return HttpResponse.json({ message: 'Invalid id' }, { status: 400 })
    const s = settlements.find((x) => x.id === id)
    if (!s) return HttpResponse.json({ message: 'Settlement not found' }, { status: 404 })

    const fd = await request.formData().catch(() => null)
    if (!fd || !fd.get('file'))
      return HttpResponse.json({ message: 'file required' }, { status: 400 })

    const url = `https://s3.amazonaws.com/settlement/${id}/receipt.jpg`
    s.imageUrl = url
    s.updatedAt = new Date().toISOString()
    return HttpResponse.json({ imageUrl: url }, { status: 200 })
  }
)

export const updateReceipt = http.put(
  `${BASE}/settlements/:settlementId/receipt`,
  async ({ params, request }) => {
    const id = Number(params.settlementId)
    if (!Number.isFinite(id)) return HttpResponse.json({ message: 'Invalid id' }, { status: 400 })
    const s = settlements.find((x) => x.id === id)
    if (!s) return HttpResponse.json({ message: 'Settlement not found' }, { status: 404 })

    const fd = await request.formData().catch(() => null)
    if (!fd || !fd.get('file'))
      return HttpResponse.json({ message: 'file required' }, { status: 400 })

    const url = `https://s3.amazonaws.com/settlement/${id}/receipt.jpg`
    s.imageUrl = url
    s.updatedAt = new Date().toISOString()
    return HttpResponse.json({ imageUrl: url }, { status: 200 })
  }
)

export const deleteReceipt = http.delete(
  `${BASE}/settlements/:settlementId/receipt`,
  ({ params }) => {
    const id = Number(params.settlementId)
    if (!Number.isFinite(id)) return new HttpResponse(null, { status: 204 })
    const s = settlements.find((x) => x.id === id)
    if (s) {
      s.imageUrl = null
      s.updatedAt = new Date().toISOString()
    }
    return new HttpResponse(null, { status: 204 })
  }
)

export const settlementHandlers = [
  getMySettlements,
  getSettlementDetail,
  getMembers,
  createSettlement,
  postPaymentDone,
  deleteSettlement,
  getSettlementParticipants,
  getGroupSettlements,
  getMySettlementHistory,
  getPaymentHistories,
  uploadReceipt,
  updateReceipt,
  deleteReceipt,
]
