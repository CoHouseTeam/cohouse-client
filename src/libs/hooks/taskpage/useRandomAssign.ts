import { GroupMember, Template } from '../../../types/tasks'
import { createAssignment } from '../../api/tasks'

interface UseRandomAssignParams {
  groupId: number | null
  groupMembers: GroupMember[]
  templates: Template[]
  repeatDays: { templateId: number; dayOfWeek: string }[]
  isAlreadyAssigned: (memberId: number, templateId: number, date: string) => boolean
  reloadAssignments: () => Promise<void>
  showAlert: (msg: string) => void
  randomModeEnabled: boolean
}

export function useRandomAssign({
  groupId,
  groupMembers,
  templates,
  repeatDays,
  isAlreadyAssigned,
  reloadAssignments,
  showAlert,
  randomModeEnabled,
}: UseRandomAssignParams) {
  return async function randomAssign() {
    if (!groupId || groupMembers.length === 0) {
      showAlert('그룹 정보가 없습니다.')
      return
    }
    if (!templates.length) {
      showAlert('템플릿 정보가 없습니다.')
      return
    }
    if (!repeatDays.length) {
      showAlert('반복 요일 정보가 없습니다. 템플릿의 반복 설정을 확인해 주세요.')
      return
    }
    try {
      const memberIds = groupMembers.map((m) => m.memberId).filter(Boolean) as number[]
      const assignmentPromises = []

      const today = new Date().toISOString().slice(0, 10)

      for (let idx = 0; idx < templates.length; idx++) {
        const tpl = templates[idx]
        const tplRepeatDays = repeatDays.filter((rd) => rd.templateId === tpl.templateId)

        const assignedMemberId = memberIds[idx % memberIds.length]

        for (let i = 0; i < tplRepeatDays.length; i++) {
          if (!isAlreadyAssigned(assignedMemberId, tpl.templateId, today)) {
            assignmentPromises.push(
              createAssignment({
                groupId,
                date: today,
                templateId: tpl.templateId,
                groupMemberId: [assignedMemberId],
                randomEnabled: randomModeEnabled,
              })
            )
          }
        }
      }
      await Promise.all(assignmentPromises)
      await reloadAssignments()
    } catch (err) {
      showAlert('랜덤 배정에 실패했습니다.')
    }
  }
}
