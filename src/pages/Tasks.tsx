import React, { useEffect, useState, useCallback } from 'react'
import TaskHistoryButton from '../features/tasks/components/TaskHistoryButton'
import TaskTable from '../features/tasks/components/TaskTable'
import TaskRandomButton from '../features/tasks/components/TaskRandomButton'
import TaskExchangeButton from '../features/tasks/components/TaskExchangeButton'
import CheckRepeat from '../features/tasks/components/CheckRepeat'
import GroupMemberList from '../features/tasks/components/GroupMemberList'
import HistoryModal from '../features/tasks/components/HistoryModal'
import ExchangeModal from '../features/tasks/components/ExchangeModal'
import { Assignment, GroupMember, OverrideRequestBody } from '../types/tasks'
import { fetchGroupMembers, fetchIsLeader, fetchMyGroups } from '../libs/api/groups'
import { isAuthenticated } from '../libs/utils/auth'
import { groupMembersName } from '../libs/utils/groupMemberName'
import {
  getAssignments,
  createAssignment,
  getTaskTemplates,
  getRepeatDays,
  createOverrideRequest,
} from '../libs/api/tasks'
import { getDateOfThisWeek } from '../libs/utils/dayMapping'
import { Template, RepeatDay } from '../types/tasks'
import { getMyMemberId } from '../libs/api/profile'

const TasksPage: React.FC = () => {
  const [repeat, setRepeat] = useState(true)
  const [showHistory, setShowHistory] = useState(false)
  const [exchangeSelected, setExchangeSelected] = useState<number[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [selected] = useState<number | null>(null)
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

  // 베정 데이터 상태 설정
  useEffect(() => {
    if (groupId) {
      getAssignments({ groupId })
        .then((data) => {
          const assigned = Array.isArray(data) && data.length > 0
          setIsAssigned(assigned)
          setAssignments(data)
        })
        .catch(() => {
          setIsAssigned(false)
          setAssignments([])
        })
    } else {
      setIsAssigned(false)
    }
  }, [groupId])

  const loadGroupData = useCallback(async () => {
    if (!userAuthenticated) {
      setError('')
      setIsLeader(false)
      return
    }

    setError('')
    try {
      // 그룹 정보 id만 별도로 불러오기 위해 fetchMyGroups 호출
      const myGroupData = await fetchMyGroups()
      setGroupId(myGroupData.id)

      // 그룹 ID로 그룹 멤버 목록 fetchGroupMembers 호출
      const members = await fetchGroupMembers(myGroupData.id)
      setGroupMembers(Array.isArray(members) ? members : [])

      // 리더 여부
      if (myGroupData.id) {
        const leaderStatus = await fetchIsLeader(myGroupData.id)
        setIsLeader(leaderStatus)
      } else {
        setIsLeader(false)
      }

      const templatesData = await getTaskTemplates(myGroupData.id)
      setTemplates(Array.isArray(templatesData) ? templatesData : [])

      // 반복요일 조회
      let allRepeatDays: RepeatDay[] = []
      for (const tpl of templatesData) {
        const tplRepeatDays = await getRepeatDays(tpl.templateId)
        if (Array.isArray(tplRepeatDays) && tplRepeatDays.length > 0) {
          allRepeatDays = [...allRepeatDays, ...tplRepeatDays]
        }
      }
      setRepeatDays(allRepeatDays)

      console.log('전체 반복요일:', allRepeatDays)

      // 업무 조회
      const assignmentData = await getAssignments({ groupId: myGroupData.id })
      setAssignments(Array.isArray(assignmentData) ? assignmentData : [])
    } catch (e) {
      setError('그룹 데이터를 불러오는 중 오류가 발생했습니다.')
      setIsLeader(false)
      setGroupMembers([])
    }
  }, [userAuthenticated])

  useEffect(() => {
    loadGroupData()
  }, [loadGroupData])

  // 사용자 멤버 ID 상태 추가
  const [myMemberId, setMyMemberId] = useState<number | null>(null)

  // 사용자 멤버 ID 조회
  useEffect(() => {
    async function fetchMemberId() {
      try {
        const id = await getMyMemberId()
        setMyMemberId(id)
      } catch {
        setMyMemberId(null)
      }
    }
    fetchMemberId()
  }, [])

  // 중복 체크
  function isAlreadyAssigned(
    assignments: Assignment[],
    memberId: number,
    templateId: number,
    date: string
  ): boolean {
    return assignments.some(
      (a) => a.groupMemberId === memberId && a.templateId === templateId && a.date === date
    )
  }

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

    if (templates.length === 0) {
      alert('템플릿 정보가 없습니다.')
      return
    }

    if (repeatDays.length === 0) {
      alert('반복 요일 정보가 없습니다. 템플릿의 반복 설정을 확인해 주세요.')
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

      for (let idx = 0; idx < templates.length; idx++) {
        const tpl = templates[idx]
        const tplRepeatDays = repeatDays.filter((rd) => rd.templateId === tpl.templateId)

        const assignedMemberId = shuffledMemberIds[idx % shuffledMemberIds.length]

        for (const day of tplRepeatDays) {
          const assignDate = getDateOfThisWeek(day.dayOfWeek)

          // 중복 배정 방지 체크
          if (!isAlreadyAssigned(assignments, assignedMemberId, tpl.templateId, assignDate)) {
            assignmentPromises.push(
              createAssignment({
                groupId,
                date: assignDate,
                templateId: tpl.templateId,
                groupMemberId: [assignedMemberId],
                randomEnabled: true,
              })
            )
          }
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
  }, [groupId, groupMembers, templates, repeatDays, assignments])

  // 교환 요청
  const handleExchangeRequest = useCallback(
    async (selectedIndices: number[]) => {
      try {
        if (selectedIndices.length === 0) {
          alert('교환할 멤버를 선택해 주세요.')
          return
        }

        // 대상 멤버 ID들 구하기
        const targetIds = selectedIndices.map((idx) => groupMembers[idx].memberId)
        const targetId = targetIds[0] // 단일 대상 우선

        // 교환 상대의 업무 ID 매핑
        const swapAssignment = assignments.find((a) => {
          if (!a.groupMemberId) return false
          if (Array.isArray(a.groupMemberId)) {
            return a.groupMemberId.includes(targetId)
          } else {
            return a.groupMemberId === targetId
          }
        })

        const swapAssignmentId = swapAssignment?.assignmentId ?? 0

        const currentUserAssignment = assignments.find((a) => {
          if (!a.groupMemberId) return false
          if (Array.isArray(a.groupMemberId)) {
            return a.groupMemberId.includes(myMemberId)
          } else {
            return a.groupMemberId === myMemberId
          }
        })
        const assignmentId = currentUserAssignment?.assignmentId ?? 0

        if (myMemberId === null) {
          alert('현재 로그인한 사용자 ID가 없습니다.')
          return
        }

        const requestData: OverrideRequestBody = {
          assignmentId,
          targetId,
          targetIds,
          requesterId: myMemberId,
          swapAssignmentId,
        }

        await createOverrideRequest(requestData)
        console.log('Request 데이터:', requestData)
        await createOverrideRequest(requestData)
        console.log('API 호출 완료')

        alert('업무 교환 요청이 성공하였습니다.')
        setModalOpen(false)
        setExchangeSelected([])
      } catch (error) {
        console.error('교환 요청 실패', error)
        alert('교환 요청에 실패했습니다.')
      }
    },
    [assignments, groupMembers, myMemberId]
  )

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
          selected={exchangeSelected}
          onSelect={setExchangeSelected}
          onRequest={handleExchangeRequest}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  )
}

export default TasksPage
