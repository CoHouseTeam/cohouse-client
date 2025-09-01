import React, { useEffect, useState, useCallback } from 'react'
import TaskHistoryButton from '../features/tasks/components/TaskHistoryButton'
import TaskTable from '../features/tasks/components/TaskTable'
import TaskRandomButton from '../features/tasks/components/TaskRandomButton'
import TaskExchangeButton from '../features/tasks/components/TaskExchangeButton'
import CheckRepeat from '../features/tasks/components/CheckRepeat'
import GroupMemberList from '../features/tasks/components/GroupMemberList'
import HistoryModal from '../features/tasks/components/HistoryModal'
import ExchangeModal from '../features/tasks/components/ExchangeModal'
import { Assignment, GroupMember } from '../types/tasks'
import { fetchIsLeader, fetchMyGroups } from '../libs/api/groups'
import { isAuthenticated } from '../libs/utils/auth'
import { groupMembersName } from '../libs/utils/groupMemberName'
import {
  getAssignments,
  createAssignment,
  getTaskTemplates,
  getRepeatDays,
} from '../libs/api/tasks'
import { getDateOfThisWeek } from '../libs/utils/dayMapping'
import { Template, RepeatDay } from '../types/tasks'

const TasksPage: React.FC = () => {
  const [repeat, setRepeat] = useState(true)
  const [showHistory, setShowHistory] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [selected, setSelected] = useState<number | null>(null)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [repeatDays, setRepeatDays] = useState<RepeatDay[]>([])
  const [isAssigned, setIsAssigned] = useState(false)
  const [isLeader, setIsLeader] = useState<boolean | null>(null)
  const [error, setError] = useState('')
  const [userAuthenticated, setUserAuthenticated] = useState(false)
  const [groupId, setGroupId] = useState<number | null>(null)
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([])

  // 인증 상태 설정
  useEffect(() => {
    setUserAuthenticated(isAuthenticated())
  }, [])

  const loadGroupData = useCallback(async () => {
    if (!userAuthenticated) {
      setError('')
      setIsLeader(false)
      return
    }

    setError('')
    try {
      const myGroupData = await fetchMyGroups()
      setGroupId(myGroupData.id)

      const groupMembersData: GroupMember[] = Array.isArray(myGroupData.groupMembers)
        ? myGroupData.groupMembers
        : []
      setGroupMembers(groupMembersData)

      // 리더 여부
      if (myGroupData.id) {
        const leaderStatus = await fetchIsLeader(myGroupData.id)
        setIsLeader(leaderStatus)
      } else {
        setIsLeader(false)
      }

      const templatesData = await getTaskTemplates(myGroupData.id)
      setTemplates(Array.isArray(templatesData) ? templatesData : [])

      // 모든 템플릿의 반복요일 조회
      let allRepeatDays: RepeatDay[] = []
      for (const tpl of templatesData) {
        const tplRepeatDays = await getRepeatDays(tpl.templateId)
        allRepeatDays = [...allRepeatDays, ...(Array.isArray(tplRepeatDays) ? tplRepeatDays : [])]
      }
      setRepeatDays(allRepeatDays)

      // 업무 조회
      const assignmentData = await getAssignments({ groupId: myGroupData.id })
      setAssignments(Array.isArray(assignmentData) ? assignmentData : [])
    } catch (e) {
      setError('그룹 데이터를 불러오는 중 오류가 발생했습니다.')
      setIsLeader(false)
    }
  }, [userAuthenticated])

  useEffect(() => {
    loadGroupData()
  }, [loadGroupData])

  // 랜덤 배정
  const handleRandomAssign = useCallback(async () => {
    if (!isAuthenticated()) {
      alert('로그인이 필요합니다. 다시 로그인해 주세요.')
      return
    }

    if (!groupId || groupMembers.length === 0) {
      alert('그룹 정보가 없습니다.')
      return
    }
    if (templates.length === 0 || repeatDays.length === 0) {
      alert('템플릿 또는 반복 요일 정보가 없습니다.')
      return
    }

    try {
      const memberIds = groupMembers.map((m) => m.memberId).filter(Boolean) as number[]

      // 멤버 리스트 섞기 - 중복 배정 방지
      const shuffledMemberIds = [...memberIds]
      for (let i = shuffledMemberIds.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffledMemberIds[i], shuffledMemberIds[j]] = [shuffledMemberIds[j], shuffledMemberIds[i]]
      }

      const assignmentPromises = []

      // 템플릿별 멤버 배정 (중복 없이)
      for (let idx = 0; idx < templates.length; idx++) {
        const tpl = templates[idx]
        const tplRepeatDays = repeatDays.filter((rd) => rd.templateId === tpl.templateId)

        const assignedMemberId = shuffledMemberIds[idx % shuffledMemberIds.length]

        for (const day of tplRepeatDays) {
          const assignDate = getDateOfThisWeek(day.dayOfWeek)

          assignmentPromises.push(
            createAssignment({
              groupId,
              date: assignDate,
              templateId: tpl.templateId,
              groupMemberId: [assignedMemberId],
              randomEnabled: true,
              fixedAssigneeId: 0,
            })
          )
        }
      }

      await Promise.all(assignmentPromises)

      // 새로 배정한 후 데이터 갱신
      const refreshedAssignments = await getAssignments({ groupId })
      setAssignments(Array.isArray(refreshedAssignments) ? refreshedAssignments : [])
      setIsAssigned(true)
    } catch (error) {
      console.error('랜덤 배정 실패', error)
      alert('랜덤 배정에 실패했습니다.')
    }
  }, [groupId, groupMembers, templates, repeatDays])

  if (isLeader === null) return <>Loading...</>

  // 그룹멤버를 Member 타입으로 변환
  const members = groupMembersName(groupMembers)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">주간 업무표</h1>
        <TaskHistoryButton onClick={() => setShowHistory(true)} />
      </div>

      {error && <div className="text-red-600">{error}</div>}

      <TaskTable assignments={assignments} groupMembers={groupMembers} isLeader={isLeader} />

      <div className="flex flex-col items-center space-y-4 mt-2">
        <div className="flex space-x-2">
          {isLeader && <TaskRandomButton onClick={handleRandomAssign} disabled={isAssigned} />}
          {isLeader && isAssigned && <TaskExchangeButton onClick={() => setModalOpen(true)} />}
          {!isLeader && <TaskExchangeButton onClick={() => setModalOpen(true)} />}
        </div>
        {isLeader && <CheckRepeat checked={repeat} onChange={(e) => setRepeat(e.target.checked)} />}
      </div>

      {isLeader && (
        <>
          <div className="font-bold text-md mt-4 text-primary">참여 그룹원</div>
          <GroupMemberList members={members} />
        </>
      )}

      <HistoryModal
        open={showHistory}
        onClose={() => setShowHistory(false)}
        assignmentId={selected ?? 0}
      />

      {isLeader && isAssigned && (
        <ExchangeModal
          open={modalOpen}
          members={members}
          selected={selected}
          onSelect={setSelected}
          onRequest={() => setModalOpen(false)}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  )
}

export default TasksPage
