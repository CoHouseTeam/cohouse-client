import api from './axios'
import { TASK_ENDPOINTS } from './endpoints'
import { Template, RepeatDay, Assignment, AssignmentBody } from '../../types/tasks'

// 할일 템플릿 목록 조회
export async function getTaskTemplates(groupId: number): Promise<Template[]> {
  const response = await api.get(TASK_ENDPOINTS.TEMPLATES, { params: { groupId } })
  return response.data
}

// 할일 템플릿 생성
export async function createTaskTemplate(data: {
  groupId?: number
  category?: string
  repeatDays?: string[]
  randomEnabled?: boolean
}): Promise<Template> {
  const response = await api.post(TASK_ENDPOINTS.CREATE_TEMPLATE, data)
  return response.data
}

// 할일 템플릿 수정
export async function updateTaskTemplate(
  templateId: number,
  data: { category?: string }
): Promise<Template> {
  const response = await api.put(TASK_ENDPOINTS.UPDATE_TEMPLATE(templateId), data)
  return response.data
}

// 할일 템플릿 삭제
export async function deleteTaskTemplate(templateId: number): Promise<void> {
  await api.delete(TASK_ENDPOINTS.DELETE_TEMPLATE(templateId))
}

// 반복 요일 목록 조회
export async function getRepeatDays(templateId: number): Promise<RepeatDay[]> {
  const response = await api.get(TASK_ENDPOINTS.REPEAT_DAYS(templateId))
  return response.data
}

// 반복 요일 추가
export async function createRepeatDay(templateId: number, dayOfWeek: string): Promise<RepeatDay> {
  const response = await api.post(TASK_ENDPOINTS.CREATE_REPEAT_DAY(templateId), { dayOfWeek })
  return response.data
}

// 반복 요일 삭제
export async function deleteRepeatDay(templateId: number, repeatDayId: number): Promise<void> {
  await api.delete(TASK_ENDPOINTS.DELETE_REPEAT_DAY(templateId, repeatDayId))
}

// 할일 배정 목록 조회 (필터링 가능)
export async function getAssignments(params?: Record<string, unknown>): Promise<Assignment[]> {
  const response = await api.get(TASK_ENDPOINTS.ASSIGNMENTS, { params })
  return response.data
}

// 할일 배정 생성
export async function createAssignment(data: AssignmentBody): Promise<Assignment> {
  const response = await api.post(TASK_ENDPOINTS.CREATE_ASSIGNMENT, data)
  return response.data
}

// 할일 배정 상태 업데이트
export async function updateAssignment(
  assignmentId: number,
  data: { status: string }
): Promise<Assignment> {
  const response = await api.put(TASK_ENDPOINTS.UPDATE_ASSIGNMENT(assignmentId), data)
  return response.data
}

// 담당자 변경 요청 생성
export async function createOverrideRequest(assignmentId: number, receiverId: number) {
  const response = await api.post(TASK_ENDPOINTS.OVERRIDE_REQUEST(assignmentId), { receiverId })
  return response.data
}

// 담당자 변경 요청 상태 업데이트
export async function updateOverrideRequest(requestId: number, status: string) {
  const response = await api.patch(TASK_ENDPOINTS.UPDATE_OVERRIDE_REQUEST(requestId), { status })
  return response.data
}

// 할일 이행 히스토리 조회
export async function getAssignmentHistories(
  assignmentId: number,
  params?: { memberId?: number; fromDate?: string; toDate?: string }
) {
  const response = await api.get(TASK_ENDPOINTS.ASSIGNMENT_HISTORIES(assignmentId), { params })
  return response.data
}

// 담당자 변경 요청 이력 조회
export async function getOverrideRequestHistories(
  requestId: number,
  params?: { memberId?: number }
) {
  const response = await api.get(TASK_ENDPOINTS.OVERRIDE_HISTORIES(requestId), { params })
  return response.data
}
