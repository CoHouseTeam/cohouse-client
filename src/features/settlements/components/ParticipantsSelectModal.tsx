import { XCircle } from 'react-bootstrap-icons'
import settlementIcon from '../../../assets/icons/settlementIcon.svg'
import { useMemo, useState } from 'react'

import { GroupMembers } from '../../../mocks/db/groupMembers'
import { users } from '../../../mocks/db/users'
import { UIParticipant } from '../utils/participants'

interface Props {
  onClose: () => void
  onSelect: (list: UIParticipant[]) => void
  groupId: number
}

export default function ParticipantsSelectModal({ onClose, onSelect, groupId }: Props) {
  const [checked, setChecked] = useState<Record<number, boolean>>({})

  // groupMember 정보 추출(users 정보 이용)
  const list = useMemo<UIParticipant[]>(() => {
    const inGroup = GroupMembers.filter((gm) => gm.groupId === groupId && gm.status === 'ACTIVE')

    return inGroup.map((gm) => {
      const user = users.find((u) => u.id === gm.memberId)

      return {
        memberId: gm.memberId,
        memberName: user?.name ?? `멤버 ${gm.memberId}`,
        avatar: user?.profileImageUrl,
        shareAmount: undefined,
        status: undefined,
        settlementParticipantId: undefined,
      }
    })
  }, [groupId])

  // 전체 선택 여부
  const allChecked = list.length > 0 && list.every((m) => checked[m.memberId])

  // 전체 선택/해체 처리
  const toggleAll = (n: boolean) => {
    // 멤버가 1,2,3이면 { 1: true, 2: true, 3: true } 같은 형태
    const map: Record<number, boolean> = {}
    list.forEach((m) => {
      map[m.memberId] = n
    })
    setChecked(map)
  }

  // 개별 선택/해체 처리
  const toggleOne = (id: number) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  // 선택 완료
  const handleDone = () => {
    const selected = list.filter((m) => checked[m.memberId])
    onSelect(selected)
    onClose()
  }

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-none max-h-none w-screen h-screen rounded-none">
        <button
          onClick={onClose}
          className="absolute right-2 top-2 bg-transparent border-none mt-2 mr-2"
          aria-label="닫기"
        >
          <XCircle size={15} />
        </button>

        <div className="flex h-full flex-col">
          {/* 헤더 */}
          <div className="h-12 px-4 flex items-center justify-center mb-3">
            <h3 className="font-bold text-xl text-center">참여자 선택</h3>
          </div>

          {/* 본문 */}
          <div className="flex flex-1 flex-col overflow-auto gap-3 p-3">
            <label className="flex gap-2 items-center">
              <input
                type="checkbox"
                className="checkbox checkbox-primary mr-2 w-4 h-4"
                checked={allChecked}
                onChange={(e) => toggleAll(e.target.checked)}
              />
              <span>전체 선택</span>
            </label>

            {/* 참여자 리스트 */}
            <div className="flex flex-col gap-2">
              {list.map((m) => {
                const isChecked = !!checked[m.memberId]
                return (
                  <label key={m.memberId} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary mr-2 w-4 h-4"
                      checked={isChecked}
                      onChange={() => toggleOne(m.memberId)}
                    />
                    <div className="flex gap-4 items-center bg-base-200 rounded-xl shadow-sm w-full h-14 pl-3">
                      <img
                        src={m.avatar ?? settlementIcon}
                        alt={`${m.memberName}의 프로필`}
                        className="w-9 h-9"
                      />
                      <span className="text-lg font-semibold text-gray-600">{m.memberName}</span>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>

          {/* 푸터 */}
          <div className="h-16 flex justify-center items-center">
            <button
              type="button"
              className="btn bg-[oklch(44%_0.043_257.281)] text-white btn-sm w-32"
              onClick={handleDone}
            >
              선택 완료
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
