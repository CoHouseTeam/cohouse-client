import { useState } from 'react'
import { Users, Plus, UserPlus, Home, Calendar, CheckSquare } from 'lucide-react'
import GroupCreateModal from './GroupCreateModal'
import GroupInviteInputModal from './GroupInviteInputModal'

const GroupBox = () => {
  const [openCreate, setOpenCreate] = useState(false)
  const [openInvite, setOpenInvite] = useState(false)

  return (
    <>
      <div className="w-full bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8 text-center shadow-lg border border-blue-200">
        {/* 아이콘과 메시지 */}
        <div className="mb-6">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">그룹에 참여해보세요!</h3>
          <p className="text-gray-600 text-lg">함께 생활하는 동료들과 소통하고 업무를 관리해보세요</p>
        </div>

        {/* 기능 소개 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-sm">
            <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-800 text-sm">업무 관리</h4>
            <p className="text-xs text-gray-600 mt-1">일정과 할 일을 체계적으로 관리</p>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-sm">
            <CheckSquare className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-800 text-sm">정산 관리</h4>
            <p className="text-xs text-gray-600 mt-1">공동 생활비를 투명하게 정산</p>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-sm">
            <Home className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-800 text-sm">소통 공간</h4>
            <p className="text-xs text-gray-600 mt-1">동료들과 자유롭게 소통</p>
          </div>
        </div>

        {/* 액션 버튼들 */}
        <div className="space-y-3">
          <button
            className="btn btn-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl w-full px-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
            onClick={() => setOpenCreate(true)}
          >
            <Plus className="w-5 h-5" />
            새 그룹 만들기
          </button>
          <button
            className="btn btn-lg bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 hover:border-gray-400 rounded-xl w-full px-6 text-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
            onClick={() => setOpenInvite(true)}
          >
            <UserPlus className="w-5 h-5" />
            초대 코드로 참여하기
          </button>
        </div>

        {/* 추가 안내 */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <p className="text-sm text-blue-700">
            💡 <strong>팁:</strong> 그룹장이 초대 코드를 생성하면 다른 멤버들을 쉽게 초대할 수 있어요!
          </p>
        </div>
      </div>
      {openCreate && <GroupCreateModal onClose={() => setOpenCreate(false)} />}
      {openInvite && <GroupInviteInputModal onClose={() => setOpenInvite(false)} />}
    </>
  )
}

export default GroupBox
