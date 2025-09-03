import React, { useEffect, useState, useMemo } from 'react'
import { XCircleFill } from 'react-bootstrap-icons'
import { getUncompletedHistories } from '../../../libs/api/tasks'
import { fetchGroupMembers } from '../../../libs/api/groups'
import { UncompletedTasksModalProps } from '../../../types/main'

interface Assignment {
  assignmentId: number
  groupMemberId: number
  templateId: number
  date: string
  status: string
  createdAt: string
  repeatType: string
  category: string
}

interface Member {
  memberId: number
  nickname: string
  profileImageUrl: string
}

const UncompletedTasksModal: React.FC<UncompletedTasksModalProps> = ({
  onClose,
  groupId,
  memberId,
}) => {
  const [pendingData, setPendingData] = useState<Assignment[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 업무 불러오기
  useEffect(() => {
    if (!groupId) {
      setPendingData([])
      return
    }
    setLoading(true)
    setError('')
    getUncompletedHistories({ groupId })
      .then((result) => {
        setPendingData(Array.isArray(result) ? result : [])
      })
      .catch(() => setPendingData([]))
      .finally(() => setLoading(false))
  }, [groupId, memberId])

  // 그룹 멤버 정보 불러오기
  useEffect(() => {
    if (!groupId) {
      setMembers([])
      return
    }
    fetchGroupMembers(groupId)
      .then((result) => setMembers(Array.isArray(result) ? result : []))
      .catch(() => setMembers([]))
  }, [groupId])

  // memberId => member
  const memberMap = useMemo(() => {
    const map: Record<number, { nickname: string; profileImageUrl: string }> = {}
    members.forEach((m) => {
      map[m.memberId] = { nickname: m.nickname, profileImageUrl: m.profileImageUrl }
    })
    return map
  }, [members])

  // 날짜별 그룹화
  const grouped = useMemo(() => {
    // 중복 제거
    const groups: Record<string, { task: string; name: string; profileImageUrl: string }[]> = {}
    const seen = new Set<string>() // "date|category|memberId" 기준 중복 방지

    pendingData.forEach((item) => {
      const date = item.date
      const uniqueKey = `${date}|${item.category}|${item.groupMemberId}`
      // 중복된 업무 skip
      if (seen.has(uniqueKey)) return
      seen.add(uniqueKey)

      if (!groups[date]) groups[date] = []
      const member = memberMap[item.groupMemberId] || {}
      groups[date].push({
        task: item.category,
        name: member.nickname ?? '-',
        profileImageUrl: member.profileImageUrl ?? '/',
      })
    })

    return Object.entries(groups).map(([date, members]) => ({
      date,
      members,
    }))
  }, [pendingData, memberMap])

  return (
    <dialog open className="modal">
      <div className="modal-box max-w-xs max-h-[90vh] overflow-y-auto relative">
        <button
          className="btn btn-xs btn-circle btn-ghost absolute right-4 top-4 z-50"
          onClick={onClose}
          aria-label="닫기"
          type="button"
        >
          <XCircleFill className="text-xl text-gray-400" />
        </button>

        <h3 className="font-bold text-[24px] text-center mb-6">미이행 내역</h3>
        {loading ? (
          <div className="text-center text-gray-500">불러오는 중...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : grouped.length === 0 ? (
          <div className="text-center text-gray-500">미이행 내역이 없습니다.</div>
        ) : (
          grouped.map((group) => (
            <div key={group.date} className="mb-6">
              <div className="text-[15px] font-bold mb-2 text-gray-800">{group.date}</div>
              <div className="bg-white border border-[#5C5C5C] rounded-lg px-4 py-3">
                {group.members.map((m, idx) => (
                  <div key={m.task + m.name + idx} className="flex items-center mb-3 last:mb-0">
                    <img
                      src={m.profileImageUrl}
                      alt={m.task}
                      className="w-8 h-8 rounded-full border mr-3 bg-gray-100 object-cover"
                    />
                    <div>
                      <div className="text-[14px]">{m.task}</div>
                      <div className="text-xs text-gray-500">{m.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
      <form
        method="dialog"
        className="modal-backdrop fixed inset-0 bg-black/40"
        onClick={onClose}
      ></form>
    </dialog>
  )
}

export default UncompletedTasksModal
