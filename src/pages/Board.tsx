import { useState, useEffect, useMemo } from 'react'
import { Heart, X, ChevronDown, ChevronUp, Edit, Trash2 } from 'lucide-react'
import ConfirmModal from '../features/common/ConfirmModal'
import { createPost, deletePost, togglePostLike, getPostLikes, updatePost } from '../libs/api/posts'
import { fetchGroupPosts, fetchPost, fetchPostLikesCount, fetchPostLikeStatus } from '../services/posts'
import { getCurrentGroupId, fetchGroupMembers } from '../libs/api/groups'
import { getCurrentMemberId, getCurrentUser, getAccessToken } from '../libs/utils/auth'
import { useAuth } from '../libs/hooks/useAuth'
import type { BoardPost, BoardPostDetail, PageResponse, BoardColor, PostLikeResponse } from '../types/main'

type TabKey = 'FREE' | 'ANNOUNCEMENT'

export default function Board() {
  const { permissions } = useAuth()
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedPost, setSelectedPost] = useState<BoardPostDetail | null>(null)
  const [activeTab, setActiveTab] = useState<TabKey>('ANNOUNCEMENT')
  const [showLikeUsers, setShowLikeUsers] = useState(false)
  const [showNewPostModal, setShowNewPostModal] = useState(false)
  const [showEditPostModal, setShowEditPostModal] = useState(false)
  const [newPostTitle, setNewPostTitle] = useState('')
  const [newPostContent, setNewPostContent] = useState('')
  const [editPostTitle, setEditPostTitle] = useState('')
  const [editPostContent, setEditPostContent] = useState('')
  const [editPostCategory, setEditPostCategory] = useState<'ANNOUNCEMENT' | 'FREE'>('FREE')
  const [editPostColor, setEditPostColor] = useState<BoardColor>('BLUE')
  const [showConfirm, setShowConfirm] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [newPostCategory, setNewPostCategory] = useState<'ANNOUNCEMENT' | 'FREE'>('FREE')
  const [newPostColor, setNewPostColor] = useState<BoardColor>('BLUE')
  const [searchTerm, setSearchTerm] = useState('')
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // API 상태 관리
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pageData, setPageData] = useState<PageResponse<BoardPost> | null>(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [modalData, setModalData] = useState<{ 
    post: BoardPostDetail; 
    likeCount: number; 
    isLiked: boolean;
    likeUsers: PostLikeResponse | null;
  } | null>(null)

  // 동적으로 그룹 ID를 가져오기 위한 상태
  const [groupId, setGroupId] = useState<number | null>(null)
  const [groupMembers, setGroupMembers] = useState<any[]>([])
  const [currentMemberId, setCurrentMemberId] = useState<number | null>(null)
  const size = 10



  // 컴포넌트 마운트 시 그룹 ID와 현재 사용자 ID 가져오기
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        console.log('🔍 초기 데이터 가져오기 시작')
        
        // 현재 사용자 ID 가져오기 (여러 방법 시도)
        let memberId = getCurrentMemberId()
        console.log('🔍 getCurrentMemberId() 결과:', memberId)
        
        if (!memberId) {
          // JWT 토큰에서 직접 추출 시도
          const userFromToken = getCurrentUser()
          if (userFromToken?.memberId) {
            memberId = userFromToken.memberId
            console.log('✅ JWT 토큰에서 memberId 추출 성공:', memberId)
          } else {
            console.log('⚠️ JWT 토큰에서도 memberId를 찾을 수 없습니다.')
          }
        }
        
        setCurrentMemberId(memberId)
        console.log('✅ 현재 사용자 ID 설정 완료:', memberId)
        
        // 그룹 ID 가져오기
        const currentGroupId = await getCurrentGroupId()
        console.log('✅ 그룹 ID 가져오기 성공:', currentGroupId)
        setGroupId(currentGroupId)
        
        // 그룹이 없는 경우 에러가 아닌 안내 메시지로 설정
        if (!currentGroupId) {
          setError('그룹에 속해있지 않습니다. 그룹에 가입하거나 그룹을 생성해주세요.')
        } else {
          setError(null)
        }
      } catch (error) {
        console.error('❌ 초기 데이터 가져오기 실패:', error)
        setError('그룹 정보를 가져올 수 없습니다. 로그인이 필요할 수 있습니다.')
        setGroupId(null)
      }
    }
    fetchInitialData()
  }, [])
  
  // 그룹 및 멤버 정보 로딩
  useEffect(() => {
    const fetchGroupInfo = async () => {
      if (!groupId) {
        console.log('⚠️ groupId가 없어서 멤버 정보를 가져오지 않습니다.')
        return
      }
      
      console.log('🔍 그룹 멤버 정보 가져오기 시작, groupId:', groupId)
      try {
        const groupInfo = await fetchGroupMembers(groupId)
        console.log('✅ 그룹 멤버 정보 설정 완료:', groupInfo)
        setGroupMembers(groupInfo)
      } catch (error) {
        console.error('❌ 그룹 멤버 정보 가져오기 실패:', error)
        // 에러가 발생해도 빈 배열로 설정하여 앱이 계속 작동하도록 함
        setGroupMembers([])
      }
    }
    fetchGroupInfo()
  }, [groupId])

  // 권한에 따라 탭 자동 설정
  useEffect(() => {
    if (!permissions.canCreateAnnouncement && activeTab === 'ANNOUNCEMENT') {
      setActiveTab('FREE')
    }
  }, [permissions.canCreateAnnouncement, activeTab])

  // API에서 게시글 목록 가져오기
  useEffect(() => {
    if (!groupId) return // groupId가 없으면 API 호출하지 않음
    
    let mounted = true
    setLoading(true)
    setError(null)

    fetchGroupPosts({ groupId, type: activeTab, status: 'ACTIVE' })
      .then((data) => {
        if (mounted) setPageData(data)
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .catch((e: any) => {
        if (mounted) setError(e?.message ?? 'Failed to load posts')
      })
      .finally(() => mounted && setLoading(false))

    return () => { mounted = false }
  }, [activeTab, currentPage, size, groupId])

  // 게시글 목록 (API 데이터 사용)
  const posts = useMemo(() => pageData?.content ?? [], [pageData])

  // memberId로 닉네임을 찾는 함수
  const getNicknameByMemberId = (memberId: number) => {
    if (!groupMembers || groupMembers.length === 0) {
      return '작성자'
    }
    
    const member = groupMembers.find(m => m.memberId === memberId)
    return member ? member.nickname : '작성자'
  }

  // 검색 필터링된 게시글 목록
  const filteredPosts = useMemo(() => {
    if (!searchTerm.trim()) return posts
    
    const searchLower = searchTerm.toLowerCase()
    return posts.filter(post => {
      // 제목 검색
      if (post.title.toLowerCase().includes(searchLower)) return true
      // 내용(preview) 검색
      if (post.preview.toLowerCase().includes(searchLower)) return true
      // 작성자 검색 (닉네임으로 검색)
      const authorNickname = getNicknameByMemberId(post.memberId)
      if (authorNickname.toLowerCase().includes(searchLower)) return true
      return false
    })
  }, [posts, searchTerm, groupMembers])

  // 현재 사용자가 게시글 작성자인지 확인하는 함수
  const isPostAuthor = (postMemberId: number) => {
    // JWT 토큰에서 사용자 정보 가져오기
    const userFromToken = getCurrentUser()
    const tokenMemberId = userFromToken?.memberId
    const tokenName = userFromToken?.name
    
    // 게시글 작성자 이름 가져오기
    const postAuthorName = getNicknameByMemberId(postMemberId)
    
    console.log('🔍 작성자 확인 상세:', {
      currentMemberId,
      tokenMemberId,
      tokenName,
      postMemberId,
      postAuthorName,
      hasToken: !!getAccessToken(),
      userFromToken
    })
    
    // JWT 토큰에서 추출한 ID 사용 (우선순위)
    if (tokenMemberId && tokenMemberId > 0) {
      const isAuthor = tokenMemberId === postMemberId
      console.log('✅ JWT 토큰으로 작성자 확인:', {
        tokenMemberId,
        postMemberId,
        isAuthor
      })
      return isAuthor
    }
    
    // memberId가 없는 경우, JWT의 name과 게시글 작성자 이름 비교
    if (tokenName && postAuthorName && postAuthorName !== '작성자') {
      const isAuthorByName = tokenName === postAuthorName
      console.log('✅ 이름으로 작성자 확인:', {
        tokenName,
        postAuthorName,
        isAuthorByName
      })
      return isAuthorByName
    }
    
    // 이름이 '작성자'로 표시되는 경우, 그룹 멤버 정보에서 정확한 이름 찾기
    if (tokenName && groupMembers.length > 0) {
      const member = groupMembers.find(m => m.memberId === postMemberId)
      if (member && member.nickname && member.nickname !== '작성자') {
        const isAuthorByMemberName = tokenName === member.nickname
        console.log('✅ 그룹 멤버 정보로 작성자 확인:', {
          tokenName,
          memberNickname: member.nickname,
          isAuthorByMemberName
        })
        return isAuthorByMemberName
      }
    }
    
    // fallback: state의 currentMemberId 사용
    if (currentMemberId) {
      const isAuthor = currentMemberId === postMemberId
      console.log('✅ State로 작성자 확인:', {
        currentMemberId,
        postMemberId,
        isAuthor
      })
      return isAuthor
    }
    
    console.log('❌ 사용자 ID를 찾을 수 없습니다.')
    return false
  }

  // 탭 변경 함수
  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab)
    setCurrentPage(1) // 탭 변경 시 첫 페이지로 이동
  }

  // 검색어 변경 함수
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    // 클라이언트 사이드 검색이므로 API 재호출 불필요
  }

  // 페이지 변경 함수
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 게시글 클릭 함수 (모달 열기 + 상세 정보 가져오기)
  const handlePostClick = async (post: BoardPost) => {
    setModalLoading(true)
    try {
      const [postDetail, likeCount, likeStatus, likeUsers] = await Promise.all([
        fetchPost(post.id),
        fetchPostLikesCount(post.id),
        fetchPostLikeStatus(post.id),
        getPostLikes(post.id)
      ])
      
      console.log('📄 게시글 상세 정보:', postDetail)
      
      setModalData({ 
        post: postDetail, 
        likeCount: likeCount.count, 
        isLiked: likeStatus.liked,
        likeUsers: likeUsers
      })
      setSelectedPost(postDetail)
      setShowLikeUsers(false)
    } catch (error) {
      console.error('게시글 상세 정보 가져오기 실패:', error)
    } finally {
      setModalLoading(false)
    }
  }

  // 모달 닫기 함수
  const closeModal = () => {
    setSelectedPost(null)
    setModalData(null)
    setShowLikeUsers(false)
  }

  // 좋아요 토글 함수
  const handleLikeToggle = async (postId: number) => {
    try {
      await togglePostLike(postId)
      
      // 좋아요 토글 후 모달 데이터 새로고침
      if (selectedPost && selectedPost.id === postId) {
        const [likeCount, likeStatus, likeUsers] = await Promise.all([
          fetchPostLikesCount(postId),
          fetchPostLikeStatus(postId),
          getPostLikes(postId)
        ])
        
        setModalData(prev => prev ? { 
          ...prev, 
          likeCount: likeCount.count,
          isLiked: likeStatus.liked,
          likeUsers: likeUsers
        } : null)
      }
    } catch (error) {
      console.error('좋아요 토글 실패:', error)
    }
  }

  // 게시글 수정 모달 열기
  const openEditModal = () => {
    if (!selectedPost) return
    
    setEditPostTitle(selectedPost.title)
    setEditPostContent(selectedPost.content || selectedPost.preview || '')
    setEditPostCategory(selectedPost.type)
    setEditPostColor(selectedPost.color)
    setShowEditPostModal(true)
  }

  // 게시글 수정 모달 닫기
  const closeEditModal = () => {
    setShowEditPostModal(false)
    setEditPostTitle('')
    setEditPostContent('')
    setEditPostCategory('FREE')
    setEditPostColor('BLUE')
  }

  // 게시글 수정 제출
  const handleEditPostSubmit = async () => {
    if (!editPostTitle.trim() || !editPostContent.trim() || !selectedPost) {
      alert('제목과 내용을 모두 입력해주세요.')
      return
    }

    console.log('🚀 게시글 수정 시작')
    setIsEditing(true)
    try {
      const updateData = {
        title: editPostTitle,
        content: editPostContent,
        type: editPostCategory,
        color: editPostColor
      }

      console.log('📤 수정할 데이터:', updateData)

      await updatePost(selectedPost.id, updateData)
      console.log('📥 수정 API 응답 완료')
      
      // 수정 후 목록 새로고침
      if (groupId) {
        const data = await fetchGroupPosts({ groupId, type: activeTab, status: 'ACTIVE' })
        setPageData(data)
      }
      
      // 모달 닫기
      closeEditModal()
      closeModal()
      console.log('🔒 모달 닫기 완료')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      console.error('❌ [updatePost] FAILED', {
        error: e,
        status: e?.response?.status,
        data: e?.response?.data,
        headers: e?.response?.headers
      })
      alert('게시글 수정에 실패했습니다.')
    } finally {
      console.log('🏁 수정 프로세스 종료, isEditing:', false)
      setIsEditing(false)
    }
  }

  // 삭제 확인 모달 열기
  const openDeleteConfirm = (postId: number) => {
    setPendingDeleteId(postId)
    setShowConfirm(true)
  }

  // 삭제 확정 처리
  const confirmDeletePost = async () => {
    if (pendingDeleteId == null || !groupId) return
    
    try {
      await deletePost(pendingDeleteId)
      
      // 삭제 후 목록 새로고침
      const data = await fetchGroupPosts({ groupId, type: activeTab, status: 'ACTIVE' })
      setPageData(data)
      
    setShowConfirm(false)
    setPendingDeleteId(null)
    closeModal()
    } catch (error) {
      console.error('게시글 삭제 실패:', error)
      alert('게시글 삭제에 실패했습니다.')
    }
  }

  // 삭제 취소 처리
  const cancelDeletePost = () => {
    setShowConfirm(false)
    setPendingDeleteId(null)
  }

  // 좋아요 사용자 목록 토글
  const toggleLikeUsers = () => {
    setShowLikeUsers(!showLikeUsers)
  }

  // 새 글 작성 모달 열기
  const openNewPostModal = () => {
    setShowNewPostModal(true)
  }

  // 새 글 작성 모달 닫기
  const closeNewPostModal = () => {
    setShowNewPostModal(false)
    setNewPostTitle('')
    setNewPostContent('')
    setNewPostCategory('FREE')
    setNewPostColor('BLUE')
  }

  // 에러 모달 닫기
  const closeErrorModal = () => {
    setShowErrorModal(false)
    setErrorMessage('')
  }

  // 새 글 작성 제출
  const handleNewPostSubmit = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      alert('제목과 내용을 모두 입력해주세요.')
      return
    }

    if (!groupId) {
      alert('그룹 정보를 가져올 수 없습니다.')
      return
    }

    // 사용자 ID 디버깅 및 fallback 처리
    console.log('🔍 사용자 ID 확인:', {
      currentMemberId,
      type: typeof currentMemberId,
      fromAuth: getCurrentMemberId(),
      hasToken: !!getAccessToken(),
      tokenValue: getAccessToken() ? getAccessToken()?.substring(0, 20) + '...' : 'NO_TOKEN'
    })

    let memberIdToUse = currentMemberId
    
    if (!memberIdToUse) {
      // JWT 토큰에서 직접 추출 시도
      const userFromToken = getCurrentUser()
      console.log('🔍 JWT 토큰에서 사용자 정보 추출 시도:', userFromToken)
      
      if (userFromToken?.memberId) {
        memberIdToUse = userFromToken.memberId
        console.log('✅ JWT 토큰에서 memberId 추출 성공:', memberIdToUse)
      } else {
        // 마지막 fallback: 임시 ID 사용 (테스트용)
        memberIdToUse = 7
        console.log('⚠️ 임시 memberId 사용 (테스트용):', memberIdToUse)
      }
    }

    if (!memberIdToUse) {
      alert('사용자 정보를 가져올 수 없습니다. 다시 로그인해주세요.')
      return
    }

    console.log('🚀 새 글 작성 시작')
    setIsSubmitting(true)
    
    // API 요청 데이터 준비 (catch 블록에서도 접근 가능하도록 try 블록 밖에 선언)
    const postData = {
      groupId: groupId,
      memberId: memberIdToUse,
      type: newPostCategory,
      title: newPostTitle.trim(),
      content: newPostContent.trim(),
      color: newPostColor
    }
    
    try {
      // 색상 값 검증
      const validColors: BoardColor[] = ['RED', 'PURPLE', 'BLUE', 'GREEN', 'ORANGE']
      if (!validColors.includes(newPostColor)) {
        throw new Error(`유효하지 않은 색상입니다: ${newPostColor}`)
      }

      console.log('📤 전송할 데이터:', postData)

      console.log('🚀 API 요청 시작:', {
        endpoint: 'POST /api/posts',
        data: postData,
        dataStringified: JSON.stringify(postData)
      })

      // API 요청 전 최종 데이터 검증
      console.log('🔍 최종 데이터 검증:', {
        groupId: typeof groupId === 'number' ? groupId : 'INVALID',
        memberId: typeof memberIdToUse === 'number' ? memberIdToUse : 'INVALID',
        type: newPostCategory,
        title: newPostTitle.trim(),
        content: newPostContent.trim(),
        color: newPostColor,
        colorValid: validColors.includes(newPostColor)
      })

      await createPost(postData)
      console.log('📥 API 응답 완료')
      
      // 새 글 작성 후 목록 새로고침
      const data = await fetchGroupPosts({ groupId, type: activeTab, status: 'ACTIVE' })
      setPageData(data)
      setCurrentPage(1)
      
      closeNewPostModal()
      console.log('🔒 모달 닫기 완료')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      console.error('❌ [createPost] FAILED', {
        error: e,
        status: e?.response?.status,
        statusText: e?.response?.statusText,
        data: e?.response?.data,
        headers: e?.response?.headers,
        config: e?.config,
        message: e?.message
      })
      
      // API 에러 메시지 표시
      let errorMessage = '게시글 작성에 실패했습니다.'
      if (e?.response?.data?.message) {
        errorMessage = `게시글 작성 실패: ${e.response.data.message}`
      } else if (e?.response?.data?.error) {
        errorMessage = `게시글 작성 실패: ${e.response.data.error}`
      } else if (e?.response?.data?.detail) {
        errorMessage = `게시글 작성 실패: ${e.response.data.detail}`
      } else if (e?.response?.data?.errors) {
        // 필드별 오류 메시지가 있는 경우
        const fieldErrors = Object.entries(e.response.data.errors || {})
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('; ')
        errorMessage = `게시글 작성 실패: ${fieldErrors}`
      } else if (e?.message) {
        errorMessage = `게시글 작성 실패: ${e.message}`
      }
      
      console.error('🚨 사용자에게 표시할 에러 메시지:', errorMessage)
      setErrorMessage(errorMessage)
      setShowErrorModal(true)
    } finally {
      console.log('🏁 작성 프로세스 종료, isSubmitting:', false)
      setIsSubmitting(false)
    }
  }

  // 색상 코드를 CSS 클래스로 변환하는 함수
  const getColorClass = (color: BoardColor): string => {
    const colorMap: Record<BoardColor, string> = {
      RED: 'border-red-300 bg-red-100',
      BLUE: 'border-blue-300 bg-blue-100',
      GREEN: 'border-green-300 bg-green-100',
      PURPLE: 'border-purple-300 bg-purple-100',
      ORANGE: 'border-orange-300 bg-orange-100'
    }
    return colorMap[color]
  }

  // 사용자 이니셜 생성 함수
  const getUserInitial = (name: string) => {
    return name.charAt(0)
  }

  // 사용자 아바타 색상 생성 함수
  const getUserAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500',
      'bg-red-500', 
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500'
    ]
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
      {/* 헤더 */}
      <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6 animate-slide-in">
        <div className="flex justify-between items-start gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">게시판</h1>
          <div className="flex gap-2">
            <button
              onClick={openNewPostModal}
              className="btn btn-primary btn-sm rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg"
            >
              새 글 작성
            </button>
          </div>
        </div>
        
        {/* 검색창 */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="제목이나 내용으로 검색..."
              className="input input-bordered rounded-lg w-full focus:input-primary transition-all duration-200 focus:scale-[1.01] focus:shadow-md"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            {searchTerm && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse-subtle"></div>
              </div>
            )}
          </div>
          {searchTerm && (
            <button
              onClick={() => handleSearchChange('')}
              className="btn btn-ghost rounded-lg transition-all duration-200 hover:scale-105 animate-slide-in"
            >
              초기화
            </button>
          )}
        </div>
      </div>

      {/* 탭 */}
      <div className="tabs tabs-boxed mb-6 animate-slide-in" style={{ animationDelay: '100ms' }}>
        {permissions.canCreateAnnouncement && (
          <button
            className={`tab transition-all duration-200 ${activeTab === 'ANNOUNCEMENT' ? 'tab-active' : 'hover:bg-base-200'}`}
            onClick={() => handleTabChange('ANNOUNCEMENT')}
          >
            공지사항
          </button>
        )}
        <button
          className={`tab transition-all duration-200 ${activeTab === 'FREE' ? 'tab-active' : 'hover:bg-base-200'}`}
          onClick={() => handleTabChange('FREE')}
        >
          자유게시판
        </button>
      </div>

      {/* 게시글 목록 */}
      <div className="w-full">
        {loading && (
          <div className="text-center py-8">
            <div className="loading loading-spinner loading-lg"></div>
            <p className="mt-4 text-gray-500">게시글을 불러오는 중...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            {error.includes('그룹에 속해있지 않습니다') ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">그룹이 필요합니다</h3>
                <p className="text-blue-600 mb-4">{error}</p>
                <div className="space-y-2">
                  <p className="text-sm text-blue-500">그룹을 생성하거나 초대 코드로 가입할 수 있습니다.</p>
                  <p className="text-sm text-blue-500">그룹에 가입하면 게시글을 작성하고 볼 수 있어요!</p>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <h3 className="text-lg font-semibold text-red-800 mb-2">오류가 발생했습니다</h3>
                <p className="text-red-600">{error}</p>
              </div>
            )}
          </div>
        )}

        {!loading && !error && filteredPosts.length === 0 && (
          <div className="text-center py-8">
            <p className="text-lg text-gray-500">
              {searchTerm ? `"${searchTerm}"에 대한 검색 결과가 없습니다.` : '게시글이 없습니다.'}
            </p>
            {searchTerm && (
              <p className="text-sm text-gray-400 mt-2">
                제목, 내용, 작성자로 검색해보세요.
              </p>
            )}
          </div>
        )}

        {!loading && !error && filteredPosts.length > 0 && (
          <>
        {/* 반응형 그리드: 모바일 2열, 웹 3열 */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {filteredPosts.map((post, index) => {
            return (
              <div
                key={post.id}
                    className={`card cursor-pointer group transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] ${getColorClass(post.color)} opacity-0 animate-fade-in-up`}
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => handlePostClick(post)}
              >
                <div className="card-body p-3 sm:p-4">
                  {/* Title */}
                  <h3 className="card-title text-sm font-bold line-clamp-2 mb-2">
                    {post.title}
                  </h3>

                  {/* Content preview */}
                  <p className="text-xs text-base-content/70 line-clamp-3 mb-3">
                        {post.preview}
                  </p>

                  {/* Meta info */}
                  <div className="flex justify-between items-center text-xs text-base-content/60">
                        <span>{getNicknameByMemberId(post.memberId)}</span>
                        <span>{new Date(post.createdAt).toISOString().split('T')[0]}</span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-end text-xs opacity-60">
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      <span>0</span>
                    </div>
                  </div>

                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 rounded-lg transition-opacity duration-200"></div>
                </div>
              </div>
            )
          })}
        </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {!loading && !error && pageData && pageData.totalPages > 1 && (
        <div className="flex justify-center mt-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="join shadow-lg">
            <button
              className="join-item btn btn-sm rounded-tl-lg rounded-bl-lg transition-all duration-200 hover:scale-105"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              «
            </button>
            {Array.from({ length: pageData.totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`join-item btn btn-sm transition-all duration-200 hover:scale-105 ${currentPage === page ? 'btn-active' : ''}`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}
            <button
              className="join-item btn btn-sm rounded-tr-lg rounded-br-lg transition-all duration-200 hover:scale-105"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= pageData.totalPages}
            >
              »
            </button>
          </div>
        </div>
      )}

      {/* Post Detail Modal */}
      {selectedPost && (
        <div className="modal modal-open">
          <div className={`modal-box rounded-lg max-w-2xl max-h-[90vh] overflow-y-auto ${getColorClass(selectedPost.color)} border-2 animate-fade-in-up shadow-2xl`}>
            {modalLoading ? (
              <div className="text-center py-8">
                <div className="loading loading-spinner loading-lg"></div>
                <p className="mt-4 text-gray-500">게시글을 불러오는 중...</p>
              </div>
            ) : (
              <>
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-xl text-gray-800">{selectedPost.title}</h3>
              <div className="flex items-center gap-2">
                {/* 수정/삭제 버튼 (작성자만 표시) */}
                {(() => {
                  const isAuthor = isPostAuthor(selectedPost.memberId)
                  console.log('🎯 모달에서 작성자 확인:', {
                    selectedPostId: selectedPost.id,
                    selectedPostMemberId: selectedPost.memberId,
                    currentMemberId,
                    isAuthor,
                    currentUserFromAuth: getCurrentMemberId(),
                    hasToken: !!getAccessToken()
                  })
                  return isAuthor
                })() && (
                  <>
                    <button
                      className="btn btn-sm btn-circle btn-ghost hover:bg-blue-100"
                      onClick={(e) => {
                        e.stopPropagation()
                        openEditModal()
                      }}
                      title="수정"
                    >
                      <Edit className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                      className="btn btn-sm btn-circle btn-ghost hover:bg-red-100"
                      onClick={(e) => {
                        e.stopPropagation()
                        openDeleteConfirm(selectedPost.id)
                      }}
                      title="삭제"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </>
                )}
                <button
                  className="btn btn-sm btn-circle btn-ghost hover:bg-black/10"
                  onClick={closeModal}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              
              
              {/* Meta info */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <span>작성자: {getNicknameByMemberId(selectedPost.memberId)}</span>
                    <span>작성일: {new Date(selectedPost.createdAt).toISOString().split('T')[0]}</span>
                    <span>카테고리: {selectedPost.type === 'ANNOUNCEMENT' ? '공지사항' : '자유게시판'}</span>
              </div>

              {/* Content */}
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap leading-relaxed text-gray-700">
                      {selectedPost.content || selectedPost.preview}
                </p>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleLikeToggle(selectedPost.id)
                    }}
                    className="btn btn-ghost btn-sm p-2"
                  >
                    <Heart 
                      className={`w-5 h-5 transition-all duration-200 ${
                        modalData?.isLiked 
                          ? 'fill-red-500 text-red-500' 
                          : 'text-gray-400 hover:text-red-400'
                      }`} 
                    />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleLikeUsers()
                    }}
                    className="flex items-center gap-1 hover:text-primary"
                  >
                    <span className="font-semibold">{modalData?.likeCount || 0}</span>
                    {showLikeUsers ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Like Users Dropdown */}
              {showLikeUsers && (modalData?.likeCount || 0) > 0 && modalData?.likeUsers && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">좋아요를 누른 사용자</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {modalData.likeUsers.likers.map((liker) => (
                      <div key={liker.memberId} className="flex items-center gap-3 p-2 rounded-lg">
                        <div className="avatar">
                          <div className={`w-8 h-8 rounded-full ${getUserAvatarColor(liker.displayName)} flex items-center justify-center text-white text-sm font-semibold`}>
                            {getUserInitial(liker.displayName)}
                          </div>
                        </div>
                        <span className="font-medium">{liker.displayName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-action">
              <button 
                className="btn btn-sm rounded-lg"
                style={{ backgroundColor: '#000000', color: 'white', border: 'none' }}
                onClick={closeModal}
              >
                닫기
              </button>
            </div>
              </>
            )}
          </div>
          <div className="modal-backdrop" onClick={closeModal}></div>
        </div>
      )}

      {/* Edit Post Modal */}
      {showEditPostModal && (
        <div className="modal modal-open">
          <div className="modal-box rounded-lg max-w-2xl animate-fade-in-up shadow-2xl border-2 border-gray-200">
            <div className="flex justify-between items-start mb-6">
              <h3 className="font-bold text-xl">게시글 수정</h3>
              <button
                className="btn btn-sm btn-circle btn-ghost"
                onClick={closeEditModal}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Title Input */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">제목</span>
                </label>
                <input
                  type="text"
                  placeholder="제목을 입력하세요"
                  className="input input-bordered rounded-lg focus:input-primary"
                  value={editPostTitle}
                  onChange={(e) => setEditPostTitle(e.target.value)}
                />
              </div>

              {/* Content Input */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">내용</span>
                </label>
                <textarea
                  placeholder="내용을 입력하세요"
                  className="textarea textarea-bordered rounded-lg focus:textarea-primary h-32"
                  value={editPostContent}
                  onChange={(e) => setEditPostContent(e.target.value)}
                />
              </div>

              {/* Category Select */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">카테고리</span>
                </label>
                <select
                  className="select select-bordered rounded-lg focus:select-primary w-full"
                  value={editPostCategory}
                  onChange={(e) => setEditPostCategory(e.target.value as 'ANNOUNCEMENT' | 'FREE')}
                >
                  <option value="FREE">자유게시판</option>
                  <option value="ANNOUNCEMENT">공지사항</option>
                </select>
              </div>

              {/* Color Select */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">색상</span>
                </label>
                <select
                  className="select select-bordered rounded-lg focus:select-primary w-full"
                  value={editPostColor}
                  onChange={(e) => setEditPostColor(e.target.value as BoardColor)}
                >
                  <option value="BLUE">파란색</option>
                  <option value="RED">빨간색</option>
                  <option value="PURPLE">보라색</option>
                  <option value="GREEN">초록색</option>
                  <option value="ORANGE">오렌지색</option>
                </select>
              </div>
            </div>

            <div className="modal-action">
              <button className="btn btn-ghost btn-sm rounded-lg" onClick={closeEditModal}>
                취소
              </button>
              <button className="btn btn-primary btn-sm rounded-lg" onClick={handleEditPostSubmit} disabled={isEditing}>
                {isEditing ? '수정 중...' : '수정 완료'}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={closeEditModal}></div>
        </div>
      )}

      {/* New Post Modal */}
      {showNewPostModal && (
        <div className="modal modal-open">
          <div className="modal-box rounded-lg max-w-2xl animate-fade-in-up shadow-2xl border-2 border-gray-200">
            <div className="flex justify-between items-start mb-6">
              <h3 className="font-bold text-xl">새 글 작성</h3>
              <button
                className="btn btn-sm btn-circle btn-ghost"
                onClick={closeNewPostModal}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Title Input */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">제목</span>
                </label>
                <input
                  type="text"
                  placeholder="제목을 입력하세요"
                  className="input input-bordered rounded-lg focus:input-primary"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                />
              </div>

              {/* Content Input */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">내용</span>
                </label>
                <textarea
                  placeholder="내용을 입력하세요"
                  className="textarea textarea-bordered rounded-lg focus:textarea-primary h-32"
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                />
              </div>

              {/* Category Select */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">카테고리</span>
                </label>
                <select
                  className="select select-bordered rounded-lg focus:select-primary w-full"
                  value={newPostCategory}
                  onChange={(e) => setNewPostCategory(e.target.value as 'ANNOUNCEMENT' | 'FREE')}
                >
                  <option value="FREE">자유게시판</option>
                  <option value="ANNOUNCEMENT">공지사항</option>
                </select>
              </div>

              {/* Color Select */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">색상</span>
                </label>
                <select
                  className="select select-bordered rounded-lg focus:select-primary w-full"
                  value={newPostColor}
                  onChange={(e) => setNewPostColor(e.target.value as BoardColor)}
                >
                  <option value="BLUE">파란색</option>
                  <option value="RED">빨간색</option>
                  <option value="PURPLE">보라색</option>
                  <option value="GREEN">초록색</option>
                  <option value="ORANGE">오렌지색</option>
                </select>
              </div>
            </div>

            <div className="modal-action">
              <button className="btn btn-ghost btn-sm rounded-lg" onClick={closeNewPostModal}>
                취소
              </button>
              <button className="btn btn-primary btn-sm rounded-lg" onClick={handleNewPostSubmit} disabled={isSubmitting}>
                {isSubmitting ? '작성 중...' : '완료'}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={closeNewPostModal}></div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        open={showConfirm}
        title="삭제 확인"
        message="정말 이 게시글을 삭제하시겠습니까?"
        confirmText="삭제"
        cancelText="취소"
        onConfirm={confirmDeletePost}
        onCancel={cancelDeletePost}
      />

      {/* Error Modal */}
      {showErrorModal && (
        <div className="modal modal-open">
          <div className="modal-box rounded-lg max-w-md animate-fade-in-up shadow-2xl border-2 border-red-200">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-lg text-red-800">오류 발생</h3>
              <button
                className="btn btn-sm btn-circle btn-ghost"
                onClick={closeErrorModal}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 whitespace-pre-wrap">{errorMessage}</p>
            </div>

            <div className="modal-action">
              <button 
                className="btn btn-primary btn-sm rounded-lg"
                onClick={closeErrorModal}
              >
                확인
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={closeErrorModal}></div>
        </div>
      )}
    </div>
  )
}
