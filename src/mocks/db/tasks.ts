import { Assignment, Member, RepeatDay, Template } from '../../types/tasks'

/* ─────────────────────────────────────────────
   1) 멤버(표시용) & 그룹 멤버 ID 매핑
   ───────────────────────────────────────────── */
export const members: Record<number, Member> = {
  1: { name: '최꿀꿀', profileUrl: '/avatars/u1.png' },
  2: { name: '이댕댕', profileUrl: '/avatars/u2.png' },
  3: { name: '김냥냥', profileUrl: '/avatars/u3.png' },
}

//할일 템플릿(배정표)
export const templates: Template[] = [
  { templateId: 1, groupId: 1, category: '청소', createdAt: '2025-08-05T10:00:00', updatedAt: '' },
  {
    templateId: 2,
    groupId: 1,
    category: '설거지',
    createdAt: '2025-08-05T10:00:00',
    updatedAt: '',
  },
  {
    templateId: 3,
    groupId: 1,
    category: '분리수거',
    createdAt: '2025-08-05T10:00:00',
    updatedAt: '',
  },
]

//요일 반복
export const repeatDays: RepeatDay[] = [
  { repeatDayId: 1, templateId: 1, dayOfWeek: 'MONDAY' },
  { repeatDayId: 2, templateId: 2, dayOfWeek: 'THURSDAY' },
  { repeatDayId: 3, templateId: 3, dayOfWeek: 'FRIDAY' },
]

//할일 배정
export const assignments: Assignment[] = []

// 담당자 변경 요청
export const overrideRequests = [
  {
    requestId: 1,
    assignmentId: 1,
    receiverId: 2,
    status: 'REQUESTED',
    requestedAt: '2025-08-05T14:30:00',
    respondedAt: '',
  },
]

// 히스토리
export const assignmentHistories = [
  {
    historyId: 1,
    assignmentId: 1,
    groupMemberId: 3,
    date: '2025-08-12T00:00:00',
    category: '청소',
    status: 'COMPLETED',
    createdAt: '2025-08-12T23:05:00',
    updatedAt: '2025-08-12T23:05:00',
  },
]

export const overrideRequestHistories = [
  {
    historyId: 1,
    requestId: 1,
    targetId: [2, 3, 4],
    modifierId: 4,
    postId: 11,
    status: 'ACCEPTED',
    requestedAt: '2025-08-10T14:20:00',
    respondedAt: '2025-08-10T14:45:12',
  },
]
