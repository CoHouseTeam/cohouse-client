import { useState, useEffect } from 'react'
import { Heart, X, ChevronDown, ChevronUp } from 'lucide-react'
import ConfirmModal from '../features/common/ConfirmModal'
import { createPost } from '../libs/api/posts'

// Board 페이지용 Post 타입 (기존 UI와 호환)
interface BoardPost {
  id: number
  title: string
  content: string
  author: string
  date: string
  likes: number
  isPinned: boolean
  color: string
  category: 'notice' | 'free'
  likedBy: string[]
}

// 색상 옵션 타입
type ColorOption = 'RED' | 'PURPLE' | 'BLUE' | 'GREEN' | 'YELLOW' | 'ORANGE' | 'PINK' | 'GRAY'

export default function Board() {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedPost, setSelectedPost] = useState<BoardPost | null>(null)
  const [activeTab, setActiveTab] = useState<'notice' | 'free'>('notice')
  const [postsPerPage, setPostsPerPage] = useState(4)
  const [showLikeUsers, setShowLikeUsers] = useState(false)
  const [showNewPostModal, setShowNewPostModal] = useState(false)
  const [newPostTitle, setNewPostTitle] = useState('')
  const [newPostContent, setNewPostContent] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newPostCategory, setNewPostCategory] = useState<'ANNOUNCEMENT' | 'FREE'>('FREE')
  const [newPostColor, setNewPostColor] = useState<ColorOption>('BLUE')
  const [searchTerm, setSearchTerm] = useState('')

  // 게시글 데이터 (하드코딩)
  const [posts, setPosts] = useState<BoardPost[]>([
    {
      id: 1,
      title: '공동주택 관리 규정 안내',
      content: '안녕하세요. 공동주택 관리 규정에 대해 안내드립니다. 모든 주민분들께서 참고해 주시기 바랍니다.',
      author: '관리자',
      date: '2024-01-15',
      likes: 12,
      isPinned: false,
      color: 'border-blue-300 bg-blue-100',
      category: 'notice',
      likedBy: ['user1', 'user2', 'user3']
    },
    {
      id: 2,
      title: '엘리베이터 점검 공지',
      content: '내일 오전 9시부터 12시까지 엘리베이터 점검이 있을 예정입니다. 이용에 참고해 주세요.',
      author: '관리자',
      date: '2024-01-14',
      likes: 8,
      isPinned: false,
      color: 'border-yellow-300 bg-yellow-100',
      category: 'notice',
      likedBy: ['user1', 'user4']
    },
    {
      id: 3,
      title: '주차장 이용 규정 변경',
      content: '주차장 이용 규정이 변경되었습니다. 자세한 내용은 첨부된 파일을 참고해 주세요.',
      author: '관리자',
      date: '2024-01-13',
      likes: 15,
      isPinned: false,
      color: 'border-green-300 bg-green-100',
      category: 'notice',
      likedBy: ['user1', 'user2', 'user5', 'user6']
    },
    {
      id: 4,
      title: '커뮤니티 공간 이용 안내',
      content: '커뮤니티 공간 이용 시간과 규정에 대해 안내드립니다.',
      author: '관리자',
      date: '2024-01-12',
      likes: 6,
      isPinned: false,
      color: 'border-purple-300 bg-purple-100',
      category: 'notice',
      likedBy: ['user3', 'user7']
    },
    {
      id: 5,
      title: '분리수거 정책 변경',
      content: '분리수거 정책이 변경되었습니다. 새로운 분리수거 가이드를 참고해 주세요.',
      author: '관리자',
      date: '2024-01-11',
      likes: 20,
      isPinned: false,
      color: 'border-orange-300 bg-orange-100',
      category: 'notice',
      likedBy: ['user1', 'user2', 'user3', 'user4', 'user5']
    },
    {
      id: 6,
      title: '안녕하세요! 이사왔습니다',
      content: '안녕하세요! 101동 502호로 이사온 김철수입니다. 앞으로 잘 부탁드립니다!',
      author: '김철수',
      date: '2024-01-10',
      likes: 5,
      isPinned: false,
      color: 'border-pink-300 bg-pink-100',
      category: 'free',
      likedBy: ['user1', 'user8']
    },
    {
      id: 7,
      title: '주차 문제에 대한 건의',
      content: '주차장이 너무 좁아서 불편합니다. 개선 방안을 논의해보면 좋겠습니다.',
      author: '이영희',
      date: '2024-01-09',
      likes: 18,
      isPinned: false,
      color: 'border-red-300 bg-red-100',
      category: 'free',
      likedBy: ['user1', 'user2', 'user3', 'user4', 'user9']
    },
    {
      id: 8,
      title: '커뮤니티 공간 개선 제안',
      content: '커뮤니티 공간에 더 많은 편의시설을 추가하면 좋겠습니다.',
      author: '박민수',
      date: '2024-01-08',
      likes: 7,
      isPinned: false,
      color: 'border-indigo-300 bg-indigo-100',
      category: 'free',
      likedBy: ['user1', 'user5', 'user10']
    },
    {
      id: 9,
      title: '반려동물 산책 시간 조정',
      content: '반려동물 산책 시간을 조정해서 다른 주민들과 충돌을 피하고 싶습니다.',
      author: '최지영',
      date: '2024-01-07',
      likes: 9,
      isPinned: false,
      color: 'border-teal-300 bg-teal-100',
      category: 'free',
      likedBy: ['user2', 'user6', 'user11']
    },
    {
      id: 10,
      title: '공동구매 제안',
      content: '생활용품 공동구매를 진행하면 좋겠습니다. 관심 있는 분들 연락주세요.',
      author: '정수진',
      date: '2024-01-06',
      likes: 14,
      isPinned: false,
      color: 'border-cyan-300 bg-cyan-100',
      category: 'free',
      likedBy: ['user1', 'user3', 'user7', 'user12']
    },
    {
      id: 11,
      title: '건물 외벽 도색 공사 안내',
      content: '건물 외벽 도색 공사가 예정되어 있습니다. 공사 기간 동안 불편을 드려 죄송합니다.',
      author: '관리자',
      date: '2024-01-05',
      likes: 3,
      isPinned: false,
      color: 'border-gray-300 bg-gray-100',
      category: 'notice',
      likedBy: ['user1']
    },
    {
      id: 12,
      title: '소음 관련 민원',
      content: '밤늦은 시간 소음이 심해서 불편합니다. 모두가 조용한 환경에서 생활할 수 있도록 협조해 주세요.',
      author: '한미영',
      date: '2024-01-04',
      likes: 11,
      isPinned: false,
      color: 'border-amber-300 bg-amber-100',
      category: 'free',
      likedBy: ['user2', 'user4', 'user8', 'user13']
    },
    {
      id: 13,
      title: '공동주택 보안 강화',
      content: '보안을 강화하기 위해 CCTV 설치를 검토하고 있습니다.',
      author: '관리자',
      date: '2024-01-03',
      likes: 16,
      isPinned: false,
      color: 'border-slate-300 bg-slate-100',
      category: 'notice',
      likedBy: ['user1', 'user2', 'user3', 'user5', 'user9']
    },
    {
      id: 14,
      title: '정원 가꾸기 모임',
      content: '정원 가꾸기 모임을 만들고 싶습니다. 관심 있는 분들 연락주세요.',
      author: '송미라',
      date: '2024-01-02',
      likes: 8,
      isPinned: false,
      color: 'border-emerald-300 bg-emerald-100',
      category: 'free',
      likedBy: ['user1', 'user6', 'user10', 'user14']
    },
    {
      id: 15,
      title: '재활용품 수거 일정 변경',
      content: '재활용품 수거 일정이 변경되었습니다. 새로운 일정을 확인해 주세요.',
      author: '관리자',
      date: '2024-01-01',
      likes: 4,
      isPinned: false,
      color: 'border-lime-300 bg-lime-100',
      category: 'notice',
      likedBy: ['user2', 'user7']
    }
  ])

  // 반응형 페이지네이션: 모바일 4개, 웹(>=lg) 16개
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 1024px)')
    const updatePostsPerPage = () => setPostsPerPage(mql.matches ? 16 : 4)
    updatePostsPerPage()
    if (mql.addEventListener) {
      mql.addEventListener('change', updatePostsPerPage)
      return () => mql.removeEventListener('change', updatePostsPerPage)
    } else {
      // Safari
      // @ts-ignore
      mql.addListener(updatePostsPerPage)
      return () => {
        // @ts-ignore
        mql.removeListener(updatePostsPerPage)
      }
    }
  }, [])

  // 현재 사용자 (실제로는 로그인된 사용자 정보)
  // 좋아요는 사용자 ID로, 작성자 비교는 사용자 이름으로 처리
  const currentUserId = 'user1'
  const currentUserName = '김철수'

  // 현재 탭에 해당하는 게시글 필터링 + 검색어 필터링
  const filteredPosts = posts.filter(post => {
    const matchesTab = post.category === activeTab
    const matchesSearch = searchTerm === '' || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesTab && matchesSearch
  })

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage)
  const startIndex = (currentPage - 1) * postsPerPage
  const endIndex = startIndex + postsPerPage
  const currentPosts = filteredPosts.slice(startIndex, endIndex)

  // 탭 변경 함수
  const handleTabChange = (tab: 'notice' | 'free') => {
    setActiveTab(tab)
    setCurrentPage(1) // 탭 변경 시 첫 페이지로 이동
  }

  // 검색어 변경 함수
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1) // 검색어 변경 시 첫 페이지로 이동
  }

  // 페이지 변경 함수
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 게시글 클릭 함수
  const handlePostClick = (post: BoardPost) => {
    setSelectedPost(post)
    setShowLikeUsers(false)
  }

  // 모달 닫기 함수
  const closeModal = () => {
    setSelectedPost(null)
    setShowLikeUsers(false)
  }

  // 좋아요 토글 함수
  const handleLikeToggle = (postId: number) => {
    setPosts(prevPosts => 
      prevPosts.map(post => {
        if (post.id === postId) {
          const isLiked = post.likedBy.includes(currentUserId)
          console.log(`Post ${postId}: isLiked = ${isLiked}, currentUser = ${currentUserId}, likedBy = ${post.likedBy}`)
          
          if (isLiked) {
            // 좋아요 취소
            const updatedPost = {
              ...post,
              likes: post.likes - 1,
              likedBy: post.likedBy.filter(userId => userId !== currentUserId)
            }
            console.log('좋아요 취소:', updatedPost)
            
            // 선택된 게시글도 업데이트
            if (selectedPost && selectedPost.id === postId) {
              setSelectedPost(updatedPost)
            }
            
            return updatedPost
          } else {
            // 좋아요 추가
            const updatedPost = {
              ...post,
              likes: post.likes + 1,
              likedBy: [...post.likedBy, currentUserId]
            }
            console.log('좋아요 추가:', updatedPost)
            
            // 선택된 게시글도 업데이트
            if (selectedPost && selectedPost.id === postId) {
              setSelectedPost(updatedPost)
            }
            
            return updatedPost
          }
        }
        return post
      })
    )
  }

  // 삭제 확인 모달 열기
  const requestDeletePost = (postId: number) => {
    setPendingDeleteId(postId)
    setShowConfirm(true)
  }

  // 삭제 확정 처리
  const confirmDeletePost = () => {
    if (pendingDeleteId == null) return
    setPosts(prev => prev.filter(p => p.id !== pendingDeleteId))
    setShowConfirm(false)
    setPendingDeleteId(null)
    closeModal()
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

  // 새 글 작성 제출
  const handleNewPostSubmit = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      alert('제목과 내용을 모두 입력해주세요.')
      return
    }

    console.log('🚀 새 글 작성 시작')
    setIsSubmitting(true)
    let response: any = null
    try {
      // API 요청 데이터 준비
      const postData = {
        groupId: 4,
        memberId: 7,
        type: newPostCategory,
        title: newPostTitle,
        content: newPostContent,
        color: newPostColor
      }

      console.log('📤 전송할 데이터:', postData)

      response = await createPost(postData)
      console.log('📥 API 응답:', response)
      
      // API 응답을 BoardPost 형식으로 변환
      const newBoardPost: BoardPost = {
        id: response.id,
        title: response.title,
        content: response.content,
        author: currentUserName,
        date: new Date().toISOString().split('T')[0],
        likes: 0,
        isPinned: false,
        color: getColorClass(newPostColor),
        category: newPostCategory === 'ANNOUNCEMENT' ? 'notice' : 'free',
        likedBy: []
      }

      console.log('🔄 변환된 BoardPost:', newBoardPost)
      
      setPosts(prevPosts => [newBoardPost, ...prevPosts])
      console.log('✅ 게시글 목록에 추가 완료')
      
      closeNewPostModal()
      console.log('🔒 모달 닫기 완료')
    } catch (e: any) {
      // 👇 서버가 뭐라고 했는지 전부 보기
      console.error('❌ [createPost] FAILED', {
        error: e,
        status: e?.response?.status,
        data: e?.response?.data,      // ★ 메시지
        headers: e?.response?.headers
      });
      throw e;
    }
    finally {
      console.log('🏁 작성 프로세스 종료, isSubmitting:', false)
      setIsSubmitting(false)
    }
  }

  // 색상 코드를 CSS 클래스로 변환하는 함수
  const getColorClass = (color: ColorOption): string => {
    const colorMap: Record<ColorOption, string> = {
      RED: 'border-red-300 bg-red-100',
      PURPLE: 'border-purple-300 bg-purple-100',
      BLUE: 'border-blue-300 bg-blue-100',
      GREEN: 'border-green-300 bg-green-100',
      YELLOW: 'border-yellow-300 bg-yellow-100',
      ORANGE: 'border-orange-300 bg-orange-100',
      PINK: 'border-pink-300 bg-pink-100',
      GRAY: 'border-gray-300 bg-gray-100'
    }
    return colorMap[color]
  }

  // 좋아요 사용자 목록 (실제로는 API에서 가져올 데이터)
  type LikeUser = { id: number; name: string; profileImage: string }
  const likeUsers: LikeUser[] = [
    { id: 1, name: '김철수', profileImage: '' },
    { id: 2, name: '이영희', profileImage: '' },
    { id: 3, name: '박민수', profileImage: '' },
    { id: 4, name: '최지영', profileImage: '' },
    { id: 5, name: '정수진', profileImage: '' }
  ]

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
      'bg-yellow-500',
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
          <button
            onClick={openNewPostModal}
            className="btn btn-primary btn-sm rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg"
          >
            새 글 작성
          </button>
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
        <button
          className={`tab transition-all duration-200 ${activeTab === 'notice' ? 'tab-active' : 'hover:bg-base-200'}`}
          onClick={() => handleTabChange('notice')}
        >
          공지사항
        </button>
        <button
          className={`tab transition-all duration-200 ${activeTab === 'free' ? 'tab-active' : 'hover:bg-base-200'}`}
          onClick={() => handleTabChange('free')}
        >
          자유게시판
        </button>
      </div>

      {/* 게시글 목록 */}
      <div className="w-full">
        {currentPosts.length === 0 && (
          <div className="text-center py-8">
            <p className="text-lg text-gray-500">
              {searchTerm ? `"${searchTerm}"에 대한 검색 결과가 없습니다.` : '게시글이 없습니다.'}
            </p>
          </div>
        )}

        {/* 반응형 그리드: 모바일 2열, 웹 3열 */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {currentPosts.map((post, index) => {
            const isLiked = post.likedBy.includes(currentUserId)
            return (
              <div
                key={post.id}
                className={`card cursor-pointer group transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] ${post.color} opacity-0 animate-fade-in-up`}
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
                    {post.content}
                  </p>

                  {/* Meta info */}
                  <div className="flex justify-between items-center text-xs text-base-content/60">
                    <span>{post.author}</span>
                    <span>{post.date}</span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-end text-xs opacity-60">
                    <div className="flex items-center gap-1">
                      <Heart className={`w-3 h-3 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                      <span>{post.likes}</span>
                    </div>
                  </div>

                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 rounded-lg transition-opacity duration-200"></div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="join shadow-lg">
            <button
              className="join-item btn btn-sm rounded-tl-lg rounded-bl-lg transition-all duration-200 hover:scale-105"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              «
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
              disabled={currentPage === totalPages}
            >
              »
            </button>
          </div>
        </div>
      )}

      {/* Post Detail Modal */}
      {selectedPost && (
        <div className="modal modal-open">
          <div className={`modal-box rounded-lg max-w-2xl max-h-[90vh] overflow-y-auto ${selectedPost.color} border-2 animate-fade-in-up shadow-2xl`}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-xl text-gray-800">{selectedPost.title}</h3>
              <button
                className="btn btn-sm btn-circle btn-ghost hover:bg-black/10"
                onClick={closeModal}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Meta info */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span>작성자: {selectedPost.author}</span>
                <span>작성일: {selectedPost.date}</span>
                <span>카테고리: {selectedPost.category === 'notice' ? '공지사항' : '자유게시판'}</span>
              </div>

              {/* Content */}
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap leading-relaxed text-gray-700">
                  {selectedPost.content}
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
                      className={`w-5 h-5 ${selectedPost.likedBy.includes(currentUserId) ? 'fill-red-500 text-red-500' : ''}`} 
                    />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleLikeUsers()
                    }}
                    className="flex items-center gap-1 hover:text-primary"
                  >
                    <span className="font-semibold">{selectedPost.likes}</span>
                    {showLikeUsers ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Like Users Dropdown */}
              {showLikeUsers && selectedPost.likes > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">좋아요를 누른 사용자</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {likeUsers.slice(0, selectedPost.likes).map((user) => (
                      <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg">
                        <div className="avatar">
                          <div className={`w-8 h-8 rounded-full ${getUserAvatarColor(user.name)} flex items-center justify-center text-white text-sm font-semibold`}>
                            {getUserInitial(user.name)}
                          </div>
                        </div>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-action">
              {selectedPost.author === currentUserName && (
                <button
                  className="btn btn-sm rounded-lg"
                  style={{ backgroundColor: '#dc2626', color: 'white', border: 'none' }}
                  onClick={(e) => {
                    e.stopPropagation()
                    requestDeletePost(selectedPost.id)
                  }}
                >
                  삭제
                </button>
              )}
              <button 
                className="btn btn-sm rounded-lg"
                style={{ backgroundColor: '#000000', color: 'white', border: 'none' }}
                onClick={closeModal}
              >
                닫기
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={closeModal}></div>
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
              <div className="form-control">
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
              <div className="form-control">
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
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">카테고리</span>
                </label>
                <select
                  className="select select-bordered rounded-lg focus:select-primary"
                  value={newPostCategory}
                  onChange={(e) => setNewPostCategory(e.target.value as 'ANNOUNCEMENT' | 'FREE')}
                >
                  <option value="FREE">자유게시판</option>
                  <option value="ANNOUNCEMENT">공지사항</option>
                </select>
              </div>

              {/* Color Select */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">색상</span>
                </label>
                <select
                  className="select select-bordered rounded-lg focus:select-primary"
                  value={newPostColor}
                  onChange={(e) => setNewPostColor(e.target.value as ColorOption)}
                >
                  <option value="BLUE">파란색</option>
                  <option value="RED">빨간색</option>
                  <option value="PURPLE">보라색</option>
                  <option value="GREEN">초록색</option>
                  <option value="YELLOW">노란색</option>
                  <option value="ORANGE">주황색</option>
                  <option value="PINK">분홍색</option>
                  <option value="GRAY">회색</option>
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
    </div>
  )
}
