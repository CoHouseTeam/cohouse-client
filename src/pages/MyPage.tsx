import { useState } from 'react'
import { Cake2, Gear } from 'react-bootstrap-icons'
import { Link } from 'react-router-dom'
import AlarmSettingModal from '../features/mypage/components/AlarmSettingModal'
import ConfirmModal from '../features/common/ConfirmModal'
import { useProfile } from '../libs/hooks/mypage/useProfile'
import { withdrawUser } from '../libs/api/profile'
import { logout } from '../libs/utils/auth'
import { useAuth } from '../contexts/AuthContext'
import { formatDateDots } from '../libs/utils/format'
import { useMyGroups } from '../libs/hooks/useGroupMembers'

export default function MyPage() {
  const [alarmSettingModalOpen, setAlarmSettingModalOpen] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [showWithdrawSuccessModal, setShowWithdrawSuccessModal] = useState(false)

  const { data: me, isLoading: profileLoading } = useProfile()
  const { refreshAuthState } = useAuth()

  // 회원 탈퇴 확인 모달 열기
  const handleWithdrawClick = () => {
    setShowWithdrawModal(true)
  }

  // 회원 탈퇴 처리
  const handleWithdraw = async () => {
    try {
      await withdrawUser()
      setShowWithdrawModal(false)
      setShowWithdrawSuccessModal(true)
    } catch (error: unknown) {
      console.error('회원 탈퇴 실패:', error)
      const axiosError = error && typeof error === 'object' && 'response' in error ? error as { response?: { data?: { message?: string }; status?: number } } : null
      console.error('응답 데이터:', axiosError?.response?.data)
      console.error('상태 코드:', axiosError?.response?.status)
      
      let errorMessage = '회원 탈퇴에 실패했습니다. 다시 시도해주세요.'
      
      if (axiosError?.response?.data?.message) {
        errorMessage = axiosError.response.data.message
      } else if (axiosError?.response?.status === 409) {
        errorMessage = '서버에서 탈퇴를 거부했습니다. 관리자에게 문의해주세요.'
      }
      
      alert(errorMessage)
    }
  }

  // 회원 탈퇴 완료 후 처리
  const handleWithdrawSuccess = async () => {
    setShowWithdrawSuccessModal(false)
    await logout()
    refreshAuthState()
  }

  const { data: group, isLoading: groupLoading } = useMyGroups()

  const displayName = profileLoading ? '불러오는 중...' : (me?.name ?? '이름 없음')
  const displayBirth = profileLoading
  profileLoading ? '' : formatDateDots(me?.birthDate)

  return (
    <>
      <div className="space-y-6 w-full md:max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-neutral">마이페이지</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Profile Card */}
          <section>
            <div className="card border border-neutral-200 shadow rounded-lg md:h-40">
              <div className="card-body relative flex justify-center px-10">
                {/* 프로필 편집 버튼 */}
                <div className="flex justify-end absolute right-5 top-5">
                  <Link to={'/mypage/edit'}>
                    <Gear />
                  </Link>
                </div>

                {/* 프로필 영역 */}
                <div className="flex items-center gap-6">
                  <div className="pl-2">
                    {profileLoading ? (
                      <div className="skeleton w-16 h-16 rounded-full" />
                    ) : (
                      <img
                        src={me!.profileImageUrl!}
                        alt="프로필"
                        className="w-16 h-16 rounded-full object-cover border"
                      />
                    )}
                  </div>

                  <div className="flex flex-col">
                    <h2 className="card-title">{displayName}</h2>
                    <p className="text-base-content/70">
                      {groupLoading ? '불러오는 중…' : (group?.name ?? '그룹 없음')}
                    </p>
                    <div className="flex text-sm text-base-content items-center gap-2">
                      <Cake2 />
                      <p>{displayBirth || '생일을 설정해주세요'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-6">
            {/* 마이페이지 리스트 목록 */}
            <section className="grid grid-cols-2 gap-3">
              {[
                { to: '/settlements/history', label: '정산 히스토리' },
                { to: '/payments/history', label: '송금 히스토리' },
                { to: '/tasks', label: '할 일 내역' },
                { to: '/board', label: '공지사항' },
              ].map(({ to, label }) => (
                <Link
                  key={label}
                  to={to}
                  className="h-14 md:h-24 flex items-center justify-center rounded-lg border border-neutral-200 shadow hover:bg-base-300 transition"
                >
                  {label}
                </Link>
              ))}
            </section>

            {/* 설정 & 로그아웃 */}
            <section>
              <div className="card border border-neutral-200 shadow rounded-lg p-2 md:p-0">
                <div className="card-body px-3 py-1 md:py-4">
                  <button
                    onClick={() => setAlarmSettingModalOpen(true)}
                    className="text-start py-1 md:pb-2 md:px-5 transition rounded-lg"
                  >
                    알림 설정
                  </button>

                  <button className="text-start py-1 md:pb-2 md:px-5 transition rounded-lg">
                    로그아웃
                  </button>
                  <button className="text-start py-1 md:pb-2 md:px-5  transition rounded-lg">
                    그룹 탈퇴
                  </button>
                  <button 
                    onClick={handleWithdrawClick}
                    className="text-start py-1 md:pb-2 md:px-5 transition rounded-lg text-red-600 hover:bg-red-50"
                  >
                    회원 탈퇴
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
      {alarmSettingModalOpen && (
        <AlarmSettingModal onClose={() => setAlarmSettingModalOpen(false)} />
      )}

      {/* 회원 탈퇴 확인 모달 */}
      <ConfirmModal
        open={showWithdrawModal}
        title="회원 탈퇴"
        message="정말로 회원 탈퇴를 하시겠습니까? 탈퇴 후에는 모든 데이터가 삭제되며 복구할 수 없습니다."
        confirmText="탈퇴"
        cancelText="취소"
        onConfirm={handleWithdraw}
        onCancel={() => setShowWithdrawModal(false)}
      />

      {/* 회원 탈퇴 완료 모달 */}
      <ConfirmModal
        open={showWithdrawSuccessModal}
        title="회원 탈퇴 완료"
        message="회원 탈퇴가 완료되었습니다. 이용해주셔서 감사합니다!"
        confirmText="확인"
        cancelText=""
        onConfirm={handleWithdrawSuccess}
        onCancel={handleWithdrawSuccess}
      />
    </>
  )
}
