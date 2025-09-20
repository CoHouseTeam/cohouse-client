// src/pages/MyPage.tsx
import { useState } from 'react'
import { Cake2, Gear } from 'react-bootstrap-icons'
import { Link, useNavigate } from 'react-router-dom'
import AlarmSettingModal from '../features/mypage/components/AlarmSettingModal'
import ConfirmModal from '../features/common/ConfirmModal'
import ReasonModal from '../features/common/ReasonModal'
import { useProfile } from '../libs/hooks/mypage/useProfile'
import { withdrawUser } from '../libs/api/profile'
import { logout } from '../libs/utils/auth'
import { useAuth } from '../contexts/AuthContext'
import { formatDateDots } from '../libs/utils/format'
import { useMyGroups, useRequestGroupLeave } from '../libs/hooks/useGroupMembers'

export default function MyPage() {
  const { data: me, isLoading: profileLoading } = useProfile()
  const { refreshAuthState } = useAuth()
  const { data: group, isLoading: groupLoading } = useMyGroups()
  const { mutateAsync: requestLeave, isPending: submittingLeave } = useRequestGroupLeave()
  const navigate = useNavigate()

  // 기본 모달들
  const [alarmSettingModalOpen, setAlarmSettingModalOpen] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [showWithdrawSuccessModal, setShowWithdrawSuccessModal] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  // 공용 안내 모달(에러/정보)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [infoMsg, setInfoMsg] = useState('')

  // 로그아웃 진행
  const [loggingOut, setLoggingOut] = useState(false)

  // 그룹 탈퇴: 승인중 뱃지 + 사유 입력 모달
  const [leavePendingLocal, setLeavePendingLocal] = useState(false)
  const [showLeaveReasonModal, setShowLeaveReasonModal] = useState(false)

  // 그룹 가입 여부 & 승인중 여부 (UI 전용)
  const groupId = group?.id
  const hasGroup = Boolean(groupId)
  const isLeavePending = leavePendingLocal

  // 로그아웃
  const handleLogout = async () => {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      await logout()
      refreshAuthState()
      navigate('/login')
    } catch (e) {
      console.error('로그아웃 실패:', e)
      setInfoMsg('로그아웃에 실패했습니다. 잠시 후 다시 시도해주세요.')
      setShowInfoModal(true)
    } finally {
      setLoggingOut(false)
    }
  }

  // 회원 탈퇴
  const handleWithdrawClick = () => {
    if (hasGroup) {
      setInfoMsg('그룹에 가입되어 있습니다. 그룹 탈퇴를 먼저 진행해 주세요.')
      setShowInfoModal(true)
    } else {
      setShowWithdrawModal(true)
    }
  }

  const handleWithdraw = async () => {
    try {
      await withdrawUser()
      setShowWithdrawModal(false)
      setShowWithdrawSuccessModal(true)
    } catch (error: unknown) {
      console.error('회원 탈퇴 실패:', error)
      const axiosError = error && typeof error === 'object' && 'response' in error ? error as { response?: { data?: { message?: string }; status?: number } } : null
      const errorMessage =
        axiosError?.response?.data?.message ??
        (axiosError?.response?.status === 409
          ? '서버에서 탈퇴를 거부했습니다. 관리자에게 문의해주세요.'
          : '회원 탈퇴에 실패했습니다. 다시 시도해주세요.')
      setInfoMsg(errorMessage)
      setShowInfoModal(true)
    }
  }

  const handleWithdrawSuccess = async () => {
    setShowWithdrawSuccessModal(false)
    await logout()
    refreshAuthState()
    navigate('/login')
  }

  // 그룹 탈퇴: 사유 입력 모달 열기
  const handleOpenLeave = () => {
    setShowLeaveReasonModal(true)
  }

  // 그룹 탈퇴: 요청하기
  const handleConfirmLeave = async (reason: string) => {
    if (!groupId) {
      setShowLeaveReasonModal(false)
      setInfoMsg('탈퇴할 그룹을 찾을 수 없습니다.')
      setShowInfoModal(true)
      return
    }
    try {
      const res = await requestLeave({ groupId, reason }) as { status: string }
      if (res.status === 'PENDING') {
        setLeavePendingLocal(true)
      }
      setShowLeaveReasonModal(false)
      setInfoMsg('그룹장에게 탈퇴 요청이 전달되었습니다. 승인 후 반영됩니다.')
      setShowInfoModal(true)
    } catch (e: unknown) {
      setShowLeaveReasonModal(false)
      const axiosError = e && typeof e === 'object' && 'response' in e ? e as { response?: { data?: { message?: string } } } : null
      const msg =
        axiosError?.response?.data?.message ?? '그룹 탈퇴 요청에 실패했습니다. 잠시 후 다시 시도해주세요.'
      setInfoMsg(msg)
      setShowInfoModal(true)
    }
  }

  const displayName = profileLoading ? '불러오는 중...' : (me?.name ?? '이름 없음')
  const displayBirth = profileLoading ? '' : me?.birthDate ? formatDateDots(me.birthDate) : ''

  return (
    <>
      <div className="space-y-6 w-full md:max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-neutral">마이페이지</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Profile Card */}
          <section>
            <div className="card border border-neutral-200 shadow rounded-lg md:h-40">
              <div className="card-body relative flex justify-center px-10">
                <div className="flex justify-end absolute right-5 top-5">
                  <Link to={'/mypage/edit'}>
                    <Gear />
                  </Link>
                </div>

                <div className="flex items-center gap-6">
                  <div className="pl-2">
                    {profileLoading ? (
                      <div className="skeleton w-16 h-16 rounded-full" />
                    ) : (
                      <img
                        src={me?.profileImageUrl ?? ''}
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
            {/* 마이페이지 리스트 */}
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

            {/* 설정 & 로그아웃/그룹탈퇴/회원탈퇴 */}
            <section>
              <div className="card border border-neutral-200 shadow rounded-lg p-2 md:p-0">
                <div className="card-body px-3 py-1 md:py-4">
                  <button
                    onClick={() => setAlarmSettingModalOpen(true)}
                    className="text-start py-1 md:pb-2 md:px-5 transition rounded-lg"
                  >
                    알림 설정
                  </button>

                  <button
                    onClick={() => setShowLogoutModal(true)}
                    disabled={loggingOut}
                    className="text-start py-1 md:pb-2 md:px-5 transition rounded-lg"
                  >
                    로그아웃
                  </button>

                  {/* 그룹 탈퇴: 사유 입력 모달 */}
                  <button
                    onClick={handleOpenLeave}
                    disabled={!hasGroup || isLeavePending || submittingLeave}
                    className="text-start py-1 md:pb-2 md:px-5 transition rounded-lg disabled:opacity-50 inline-flex items-center gap-2"
                  >
                    그룹 탈퇴
                    {isLeavePending && (
                      <span className="border border-red-600 text-xs text-red-600 px-1 rounded-lg ml-2">
                        그룹장 승인 대기
                      </span>
                    )}
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

      {/* 알림 설정 */}
      {alarmSettingModalOpen && (
        <AlarmSettingModal onClose={() => setAlarmSettingModalOpen(false)} />
      )}

      {/* 로그아웃 확인 모달 */}
      <ConfirmModal
        open={showLogoutModal}
        title="로그아웃"
        message="정말 로그아웃 하시겠습니까?"
        confirmText="로그아웃"
        cancelText="취소"
        onConfirm={() => {
          setShowLogoutModal(false)
          void handleLogout()
        }}
        onCancel={() => setShowLogoutModal(false)}
      />

      {/* 회원 탈퇴 확인 */}
      <ConfirmModal
        open={showWithdrawModal}
        title="회원 탈퇴"
        message="정말로 회원 탈퇴를 하시겠습니까? 탈퇴 후에는 모든 데이터가 삭제되며 복구할 수 없습니다."
        confirmText="탈퇴"
        cancelText="취소"
        onConfirm={handleWithdraw}
        onCancel={() => setShowWithdrawModal(false)}
      />

      {/* 회원 탈퇴 완료 */}
      <ConfirmModal
        open={showWithdrawSuccessModal}
        title="회원 탈퇴 완료"
        message="회원 탈퇴가 완료되었습니다. 이용해주셔서 감사합니다!"
        confirmText="확인"
        cancelText=""
        onConfirm={handleWithdrawSuccess}
        onCancel={handleWithdrawSuccess}
      />

      {/* 공용 안내(정보/에러) 모달 */}
      <ConfirmModal
        open={showInfoModal}
        title="안내"
        message={infoMsg}
        confirmText="확인"
        cancelText="취소"
        onConfirm={() => setShowInfoModal(false)}
        onCancel={() => setShowInfoModal(false)}
      />

      {/* 사유 입력 모달 (그룹 탈퇴) */}
      <ReasonModal
        open={showLeaveReasonModal}
        title="그룹 탈퇴"
        message="그룹에서 탈퇴하시겠습니까? 사유를 입력해 주세요."
        placeholder="탈퇴 사유 (최대 100자)"
        maxLength={100}
        initialValue=""
        confirmText="요청하기"
        cancelText="취소"
        isSubmitting={submittingLeave}
        onConfirm={(reason) => {
          void handleConfirmLeave(reason)
        }}
        onCancel={() => setShowLeaveReasonModal(false)}
      />
    </>
  )
}
