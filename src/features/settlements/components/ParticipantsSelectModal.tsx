import { XCircle } from 'react-bootstrap-icons'
import { useState } from 'react'

import { UIParticipant } from '../utils/participants'
import { useGroupMembers } from '../../../libs/hooks/useGroupMembers'
import LoadingSpinner from '../../common/LoadingSpinner'
import ErrorCard from '../../common/ErrorCard'
import { DEFAULT_PROFILE_URL } from '../../../libs/utils/profile-image'

interface Props {
  onClose: () => void
  onSelect: (list: UIParticipant[]) => void
  groupId: number
}

export default function ParticipantsSelectModal({ onClose, onSelect, groupId }: Props) {
  const [checked, setChecked] = useState<Record<number, boolean>>({})

  const { data: list = [], isLoading, isError } = useGroupMembers(groupId)

  if (isLoading) return <LoadingSpinner />
  if (isError) return <ErrorCard />

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

        <div className="flex h-full flex-col mx-auto md:max-w-[420px]">
          {/* 헤더 */}
          <div className="h-12 px-4 flex items-center justify-center mb-3">
            <h3 className="font-bold text-xl text-center">참여자 선택</h3>
          </div>

          {/* 본문 */}
          <div className="flex flex-1 flex-col overflow-auto gap-3 p-3">
            <label className="flex gap-2 items-center">
              <input
                type="checkbox"
                className="checkbox checkbox-primary mr-2 w-4 h-4 rounded-full"
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
                  <label key={m.memberId} className="flex items-center cursor-pointer gap-2">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary mr-2 w-4 h-4 rounded-full"
                      checked={isChecked}
                      onChange={() => toggleOne(m.memberId)}
                    />
                    <div className="flex gap-4 items-center border rounded-lg shadow-sm w-full h-14 pl-3">
                      <img
                        src={
                          m.profileImageUrl && m.profileImageUrl.trim() !== ''
                            ? m.profileImageUrl
                            : DEFAULT_PROFILE_URL
                        }
                        onError={(e) => {
                          // 잘못된 URL/권한 문제/만료 시에도 기본이미지로 교체
                          if (e.currentTarget.src !== DEFAULT_PROFILE_URL) {
                            e.currentTarget.src = DEFAULT_PROFILE_URL
                          }
                        }}
                        alt={`${m.memberName}의 프로필`}
                        className="w-9 h-9 rounded-full"
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
              className="bg-secondary font-bold rounded-lg text-white btn-sm w-32"
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
