import { useState } from 'react'
import { Users, Plus, UserPlus, ArrowRight, Sparkles } from 'lucide-react'
import GroupCreateModal from './GroupCreateModal'
import GroupInviteInputModal from './GroupInviteInputModal'

const GroupBox = () => {
  const [openCreate, setOpenCreate] = useState(false)
  const [openInvite, setOpenInvite] = useState(false)

  return (
    <>
      <div className="w-full bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm hover:shadow-md transition-all duration-300">
        {/* 아이콘과 메시지 */}
        <div className="mb-8">
          <div className="mx-auto w-16 h-16 bg-black rounded-full flex items-center justify-center mb-6 shadow-lg animate-pulse">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-black mb-3">그룹에 참여해보세요</h3>
          <p className="text-gray-600 text-base max-w-md mx-auto leading-relaxed">
            함께 생활하는 동료들과 소통하고 업무를 체계적으로 관리해보세요
          </p>
        </div>

        {/* 액션 버튼들 */}
        <div className="space-y-4 max-w-sm mx-auto">
          <button
            className="group w-full bg-black hover:bg-gray-800 text-white rounded-xl px-6 py-4 text-lg font-medium transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            onClick={() => setOpenCreate(true)}
          >
            <Plus className="w-5 h-5 transition-transform duration-200 group-hover:rotate-90" />
            새 그룹 만들기
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </button>
          
          <button
            className="group w-full bg-white hover:bg-gray-50 text-black border-2 border-gray-300 hover:border-gray-400 rounded-xl px-6 py-4 text-lg font-medium transition-all duration-200 flex items-center justify-center gap-3 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
            onClick={() => setOpenInvite(true)}
          >
            <UserPlus className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
            초대 코드로 참여하기
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </button>
        </div>

        {/* 하단 장식 요소 */}
        <div className="mt-8 flex justify-center">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '3s' }} />
            <span>간편하고 효율적인 그룹 관리</span>
            <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }} />
          </div>
        </div>
      </div>
      {openCreate && <GroupCreateModal onClose={() => setOpenCreate(false)} />}
      {openInvite && <GroupInviteInputModal onClose={() => setOpenInvite(false)} />}
    </>
  )
}

export default GroupBox
