import { useState } from 'react'
import { Users, Plus, UserPlus, ArrowRight, Sparkles } from 'lucide-react'
import GroupCreateModal from './GroupCreateModal'
import GroupInviteInputModal from './GroupInviteInputModal'

const GroupBox = () => {
  const [openCreate, setOpenCreate] = useState(false)
  const [openInvite, setOpenInvite] = useState(false)

  return (
    <>
      <div className="w-full bg-white rounded-2xl border border-gray-200 p-4 sm:p-8 text-center shadow-sm hover:shadow-md transition-all duration-300">
        {/* 아이콘과 메시지 */}
        <div className="mb-6 sm:mb-8">
          <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-black rounded-full flex items-center justify-center mb-4 sm:mb-6 shadow-lg animate-pulse">
            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-black mb-2 sm:mb-3">그룹에 참여해보세요</h3>
          <p className="text-gray-600 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            함께 생활하는 동료들과 소통하고 업무를 체계적으로 관리해보세요
          </p>
        </div>

        {/* 액션 버튼들 */}
        <div className="space-y-3 sm:space-y-4 max-w-sm mx-auto">
          <button
            className="group w-full bg-black hover:bg-gray-800 text-white rounded-xl px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 sm:gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-95"
            onClick={() => setOpenCreate(true)}
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 group-hover:rotate-90" />
            <span className="text-sm sm:text-base">새 그룹 만들기</span>
            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </button>
          
          <button
            className="group w-full bg-white hover:bg-gray-50 text-black border-2 border-gray-300 hover:border-gray-400 rounded-xl px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 sm:gap-3 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 active:scale-95"
            onClick={() => setOpenInvite(true)}
          >
            <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 group-hover:scale-110" />
            <span className="text-sm sm:text-base">초대 코드로 참여하기</span>
            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </button>
        </div>

        {/* 하단 장식 요소 */}
        <div className="mt-6 sm:mt-8 flex justify-center">
          <div className="flex items-center gap-1 sm:gap-2 text-gray-400 text-xs sm:text-sm">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" style={{ animationDuration: '3s' }} />
            <span className="hidden sm:inline">간편하고 효율적인 그룹 관리</span>
            <span className="sm:hidden">간편한 그룹 관리</span>
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }} />
          </div>
        </div>
      </div>
      {openCreate && <GroupCreateModal onClose={() => setOpenCreate(false)} />}
      {openInvite && <GroupInviteInputModal onClose={() => setOpenInvite(false)} />}
    </>
  )
}

export default GroupBox
