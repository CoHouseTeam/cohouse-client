import { HttpResponse, http } from 'msw'
import {
  templates,
  repeatDays,
  assignments,
  overrideRequests,
  assignmentHistories,
  overrideRequestHistories,
} from '../db/tasks'
import { Assignment, RepeatDay, Template } from '../../types/tasks'

/* ─────────────────────────────────────────────
   0) 엔드포인트
   ─────────────────────────────────────────────
   - GET    /tasks/templates                                  : 할일 템플릿 목록 조회
   - POST   /tasks/templates                                  : 할일 템플릿 생성
   - PUT    /tasks/templates/{template_id}                    : 템플릿 수정
   - GET    /api/tasks/templates/{template_id}/repeat-days    : 반복 요일 조회
   - POST   /api/tasks/templates/{template_id}/repeat-days    : 반복 요일 추가
   - GET    /api/tasks/assignments                            : 할일 배정 목록 조회 (특정 주, 사용자 필터링 가능)
   ───────────────────────────────────────────── */

type TaskTemplateRequest = {
  groupId?: number
  category?: string
}

type RepeatDayRequest = {
  dayOfWeek: string
}

export const tasksHandlers = [
  // 할일 템플릿 목록 조회
  http.get('/api/tasks/templates', () => {
    return HttpResponse.json(templates, { status: 200 })
  }),

  // 할일 템플릿 생성
  http.post('/api/tasks/templates', async ({ request }) => {
    let body: unknown = await request.json()
    if (typeof body !== 'object' || body === null) body = {}
    const { groupId = 0, category = '' } = body as TaskTemplateRequest

    const newTemplate: Template = {
      templateId: templates.length + 1,
      groupId,
      category,
      createdAt: new Date().toISOString(),
      updatedAt: '',
    }
    templates.push(newTemplate)
    return HttpResponse.json(newTemplate, { status: 200 })
  }),

  // 할일 템플릿 수정
  http.put('/api/tasks/templates/:templateId', async ({ params, request }) => {
    const { templateId } = params
    let body: unknown = await request.json()
    if (typeof body !== 'object' || body === null) body = {}
    const { category } = body as TaskTemplateRequest

    for (const tpl of templates) {
      if (String(tpl.templateId) === String(templateId)) {
        if (category) tpl.category = category
        tpl.updatedAt = new Date().toISOString()
      }
    }
    const updated = templates.find((tpl) => String(tpl.templateId) === String(templateId))
    return HttpResponse.json(updated, { status: 200 })
  }),

  //할일 템플릿 삭제
  http.delete('/api/tasks/templates/:template_id', ({ params }) => {
    const { template_id } = params
    const idx = templates.findIndex((tpl) => String(tpl.templateId) === String(template_id))
    if (idx === -1) {
      return HttpResponse.json({ error: 'Template not found.' }, { status: 404 })
    }
    templates.splice(idx, 1)
    return new HttpResponse(null, { status: 204 })
  }),

  // 반복 요일 목록 조회
  http.get('/api/tasks/templates/:templateId/repeat-days', ({ params }) => {
    const { templateId } = params
    const result = repeatDays.filter((d) => String(d.templateId) === String(templateId))
    return HttpResponse.json(result, { status: 200 })
  }),

  // 반복 요일 추가
  http.post('/api/tasks/templates/:templateId/repeat-days', async ({ params, request }) => {
    const { templateId } = params
    const body = (await request.json()) as RepeatDayRequest
    const { dayOfWeek } = body
    const newRepeatDay: RepeatDay = {
      repeatDayId: repeatDays.length + 1,
      templateId: Number(templateId),
      dayOfWeek,
    }
    repeatDays.push(newRepeatDay)
    return HttpResponse.json(newRepeatDay, { status: 200 })
  }),

  // 반복 요일 삭제
  http.delete('/api/tasks/templates/:templateId/repeat-days/:repeatDayId', ({ params }) => {
    const { repeatDayId } = params
    const idx = repeatDays.findIndex((d) => String(d.repeatDayId) === String(repeatDayId))
    if (idx !== -1) repeatDays.splice(idx, 1)
    return new HttpResponse(null, { status: 204 })
  }),
  http.get('/api/tasks/assignments', ({ request }) => {
    const url = new URL(request.url)
    const groupMemberId = url.searchParams.get('groupId')
    const week = url.searchParams.get('week')
    const memberId = url.searchParams.get('memberId')

    let result = assignments

    // groupId 필터링
    if (groupMemberId) {
      result = result.filter((a) => String(a.groupMemberId) === String(groupMemberId))
    }
    // week/date 필터링
    if (week) {
      // ISO week 포맷??
      result = result.filter((a) => a.date.startsWith(week.split('-')[1]))
    }
    // memberId 필터링
    if (memberId) {
      result = result.filter((a) => String(a.groupMemberId) === String(memberId))
    }

    return HttpResponse.json(result, { status: 200 })
  }),

  // 할일 배정 생성 (POST)
  http.post('/api/tasks/assignments', async ({ request }) => {
    const body = (await request.json()) as Assignment
    if (!body) {
      return HttpResponse.json({ error: 'Request body required.' }, { status: 400 })
    }

    const newAssignment = {
      assignmentId: assignments.length + 1,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: '',
      ...body,
      groupMemberId: body.groupMemberId ?? 1,
      templateId: body.templateId ?? 1,
      date: body.date ?? '2025-08-05',
      repeatType: body.repeatType ?? 'WEEKLY',
    }
    assignments.push(newAssignment)
    return HttpResponse.json(newAssignment, { status: 200 })
  }),

  http.put('/api/tasks/assignments/:assignment_id', async ({ params, request }) => {
    const id = Number(params.assignment_id)
    const body = (await request.json()) as { status: string }

    // assignments 배열에서 해당 assignment 찾기
    const assignment = assignments.find((a) => a.assignmentId === id)
    if (!assignment) {
      return HttpResponse.json({ error: 'Assignment not found.' }, { status: 404 })
    }

    // 상태값 갱신
    assignment.status = body.status
    assignment.updatedAt = new Date().toISOString().slice(0, 19).replace('T', ' ')

    return HttpResponse.json(
      {
        assignmentId: assignment.assignmentId,
        status: assignment.status,
        updatedAt: assignment.updatedAt,
      },
      { status: 200 }
    )
  }),

  // 담당자 변경 요청 (POST)
  http.post(
    '/api/tasks/assignments/:assignment_id/override-request',
    async ({ params, request }) => {
      const { assignment_id } = params
      const body = (await request.json()) as { receiverId: number }

      const newRequest = {
        requestId: overrideRequests.length + 1,
        assignmentId: Number(assignment_id),
        receiverId: body.receiverId,
        status: 'REQUESTED',
        requestedAt: new Date().toISOString(),
        respondedAt: '',
      }
      overrideRequests.push(newRequest)
      return HttpResponse.json(newRequest, { status: 200 })
    }
  ),

  // 담당자 변경 요청 수락/거절 (PATCH)
  http.patch('/api/tasks/override-requests/:request_id', async ({ params, request }) => {
    const { request_id } = params
    const body = (await request.json()) as { status: string }

    const requestItem = overrideRequests.find((r) => r.requestId === Number(request_id))
    if (!requestItem) {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    }
    requestItem.status = body.status
    requestItem.respondedAt = new Date().toISOString()
    return HttpResponse.json(requestItem, { status: 200 })
  }),

  // 할일 이행 히스토리 조회 (GET)
  http.get('/api/tasks/assignments/:assignmentId/histories', ({ params, request }) => {
    const { assignmentId } = params
    const url = new URL(request.url)
    const memberId = url.searchParams.get('memberId')
    const fromDate = url.searchParams.get('fromDate')
    const toDate = url.searchParams.get('toDate')

    let result = assignmentHistories.filter((h) => h.assignmentId === Number(assignmentId))

    if (memberId) {
      result = result.filter((h) => String(h.groupMemberId) === String(memberId))
    }
    if (fromDate) {
      result = result.filter((h) => h.date >= fromDate)
    }
    if (toDate) {
      result = result.filter((h) => h.date <= toDate)
    }

    return HttpResponse.json(result, { status: 200 })
  }),

  // 변경 요청 히스토리 조회 (GET)
  http.get('/api/tasks/override-requests/:requestId/histories', ({ params, request }) => {
    const { requestId } = params
    const url = new URL(request.url)
    const memberId = url.searchParams.get('memberId')

    let result = overrideRequestHistories.filter((h) => h.requestId === Number(requestId))

    if (memberId) {
      result = result.filter((h) => String(h.modifierId) === String(memberId))
    }

    return HttpResponse.json(result, { status: 200 })
  }),
]
