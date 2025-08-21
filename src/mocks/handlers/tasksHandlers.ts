import { HttpResponse, http } from 'msw'

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

let templates = [
  {
    templateId: 1,
    groupId: 1,
    category: '청소',
    createdAt: '2025-08-05T10:00:00',
  },
]

export const tasksHandlers = [
  http.get('/tasks/templates', () => {
    return HttpResponse.json(templates, { status: 200 })
  }),

  http.post('/tasks/templates', async ({ request }) => {
    let body: unknown = await request.json()
    if (typeof body !== 'object' || body === null) body = {}
    const { groupId = 0, category = '' } = body as TaskTemplateRequest

    const newTemplate = {
      templateId: templates.length + 1,
      groupId,
      category,
      createdAt: '2025-08-05T10:00:00',
    }
    templates.push(newTemplate)
    return HttpResponse.json(newTemplate, { status: 200 })
  }),

  http.put('/tasks/templates/:templateId', async ({ params, request }) => {
    const { templateId } = params
    let body: unknown = await request.json()
    if (typeof body !== 'object' || body === null) body = {}
    const { category } = body as TaskTemplateRequest

    templates = templates.map((tpl) =>
      String(tpl.templateId) === String(templateId)
        ? {
            ...tpl,
            ...(category && { category }),
            updatedAt: '2025-08-06T09:00:00',
          }
        : tpl
    )

    const updated = templates.find((tpl) => String(tpl.templateId) === String(templateId))
    return HttpResponse.json(updated, { status: 200 })
  }),
]
