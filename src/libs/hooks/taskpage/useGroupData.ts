import { useState, useEffect, useCallback } from 'react'
import { fetchMyGroups, fetchGroupMembers, fetchIsLeader } from '../../../libs/api/groups'
import { getTaskTemplates, getRepeatDays } from '../../../libs/api/tasks'
import { GroupMember, RepeatDay, Template } from '../../../types/tasks'

export function useGroupData(userAuthenticated: boolean) {
  const [groupId, setGroupId] = useState<number | null>(null)
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [repeatDays, setRepeatDays] = useState<RepeatDay[]>([])
  const [isLeader, setIsLeader] = useState<boolean | null>(null)
  const [error, setError] = useState('')

  const loadGroupData = useCallback(async () => {
    if (!userAuthenticated) {
      setError('')
      setIsLeader(false)
      setGroupId(null)
      setGroupMembers([])
      setTemplates([])
      setRepeatDays([])
      return
    }

    setError('')
    try {
      const myGroupData = await fetchMyGroups()
      setGroupId(myGroupData.id)

      const members = await fetchGroupMembers(myGroupData.id)
      setGroupMembers(Array.isArray(members) ? members : [])

      if (myGroupData.id) {
        setIsLeader(await fetchIsLeader(myGroupData.id))
      } else {
        setIsLeader(false)
      }

      const templatesData = await getTaskTemplates(myGroupData.id)
      setTemplates(Array.isArray(templatesData) ? templatesData : [])

      // 반복요일 병렬 조회
      const repeatDaysArrays = await Promise.all(
        templatesData.map((tpl) => getRepeatDays(tpl.templateId))
      )
      setRepeatDays(repeatDaysArrays.flat().filter(Boolean))
    } catch {
      setError('그룹 데이터를 불러오는 중 오류가 발생했습니다.')
      setIsLeader(false)
      setGroupMembers([])
      setTemplates([])
      setRepeatDays([])
    }
  }, [userAuthenticated])

  useEffect(() => {
    loadGroupData()
  }, [loadGroupData])

  return { groupId, groupMembers, templates, repeatDays, isLeader, error }
}
