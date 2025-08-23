import { HttpResponse, http } from 'msw'
import { templates, repeatDays } from '../db/tasks'
import { RepeatDay, Template } from '../../types/tasks'

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
  http.get('/tasks/templates', () => {
    return HttpResponse.json(templates, { status: 200 })
  }),

  // 할일 템플릿 생성
  http.post('/tasks/templates', async ({ request }) => {
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
  http.put('/tasks/templates/:templateId', async ({ params, request }) => {
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
]
