import { useEffect, useState } from 'react'
import ConfirmModal from '../features/common/ConfirmModal'
import { Heart, X, ChevronDown, ChevronUp, User } from 'lucide-react'

// 게시글 타입 정의
interface Post {
  id: number
  title: string
  content: string
  author: string
  date: string
  likes: number
  isPinned: boolean
  color: string
  category: 'notice' | 'free' // 공지사항 또는 자유게시판
  likedBy: string[] // 좋아요를 누른 사용자 목록
}

// 사용자 타입 정의
interface User {
  id: string
  name: string
  profileImage: string
}

export default function Board() {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [activeTab, setActiveTab] = useState<'notice' | 'free'>('notice')
  const [postsPerPage, setPostsPerPage] = useState(4)
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
  const [showLikeUsers, setShowLikeUsers] = useState(false)
  const [showNewPostModal, setShowNewPostModal] = useState(false)
  const [newPostTitle, setNewPostTitle] = useState('')
  const [newPostContent, setNewPostContent] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null)

  // 게시글 데이터 (실제로는 API에서 가져올 데이터)
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      title: '공동주택 관리 규정 안내',
      content: '안녕하세요. 공동주택 관리 규정에 대해 안내드립니다. 모든 주민분들께서 참고해 주시기 바랍니다.',
      author: '관리자',
      date: '2024-01-15',
      likes: 12,
      isPinned: true,
      color: 'border-blue-200 bg-blue-50',
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
      isPinned: true,
      color: 'border-yellow-200 bg-yellow-50',
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
      color: 'border-green-200 bg-green-50',
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
      color: 'border-purple-200 bg-purple-50',
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
      color: 'border-orange-200 bg-orange-50',
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
      color: 'border-pink-200 bg-pink-50',
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
      color: 'border-red-200 bg-red-50',
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
      color: 'border-indigo-200 bg-indigo-50',
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
      color: 'border-teal-200 bg-teal-50',
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
      color: 'border-cyan-200 bg-cyan-50',
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
      color: 'border-gray-200 bg-gray-50',
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
      color: 'border-amber-200 bg-amber-50',
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
      color: 'border-slate-200 bg-slate-50',
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
      color: 'border-emerald-200 bg-emerald-50',
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
      color: 'border-lime-200 bg-lime-50',
      category: 'notice',
      likedBy: ['user2', 'user7']
    }
  ])

  // 현재 사용자 (실제로는 로그인된 사용자 정보)
  // 좋아요는 사용자 ID로, 작성자 비교는 사용자 이름으로 처리
  const currentUserId = 'user1'
  const currentUserName = '김철수'

  // 현재 탭에 해당하는 게시글만 필터링
  const filteredPosts = posts.filter(post => post.category === activeTab)

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

  // 페이지 변경 함수
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 게시글 클릭 함수
  const handlePostClick = (post: Post) => {
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
  }

  // 새 글 작성 제출
  const handleNewPostSubmit = () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      alert('제목과 내용을 모두 입력해주세요.')
      return
    }

    const newPost: Post = {
      id: Math.max(...posts.map(p => p.id)) + 1,
      title: newPostTitle,
      content: newPostContent,
      author: currentUserName,
      date: new Date().toISOString().split('T')[0],
      likes: 0,
      isPinned: false,
      color: 'border-gray-200 bg-gray-50',
      category: activeTab,
      likedBy: []
    }

    setPosts(prevPosts => [newPost, ...prevPosts])
    closeNewPostModal()
  }

  // 좋아요 사용자 목록 (실제로는 API에서 가져올 데이터)
  const likeUsers: User[] = [
    { id: 'user1', name: '김철수', profileImage: '' },
    { id: 'user2', name: '이영희', profileImage: '' },
    { id: 'user3', name: '박민수', profileImage: '' },
    { id: 'user4', name: '최지영', profileImage: '' },
    { id: 'user5', name: '정수진', profileImage: '' }
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">게시판</h1>
        </div>
        <button 
          className="btn btn-custom btn-primary btn-sm sm:btn-md rounded-lg"
          onClick={openNewPostModal}
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            새 글 작성
          </button>
      </div>

      {/* Tab Navigation */}
      <div className="tabs tabs-boxed rounded-lg">
        <button
          className={`tab rounded-lg ${activeTab === 'notice' ? 'tab-active' : ''}`}
          onClick={() => handleTabChange('notice')}
        >
          공지사항
        </button>
        <button
          className={`tab rounded-lg ${activeTab === 'free' ? 'tab-active' : ''}`}
          onClick={() => handleTabChange('free')}
        >
          자유게시판
        </button>
      </div>

      {/* Board Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
        {currentPosts.map((post) => {
          const isLiked = post.likedBy.includes(currentUserId)
          return (
            <div
              key={post.id}
              className={`group relative bg-white border-2 rounded-lg p-3 sm:p-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${post.color} ${
                post.isPinned ? 'ring-2 ring-yellow-400' : ''
              }`}
              onClick={() => handlePostClick(post)}
            >
              {/* Pinned indicator */}
              {post.isPinned && (
                <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full font-bold">
                  고정
                </div>
              )}

              {/* Date */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs opacity-70">{post.date}</span>
              </div>

              {/* Title */}
              <h3 className="font-bold text-sm sm:text-base mb-2 group-hover:text-opacity-80 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {post.title}
              </h3>

              {/* Content preview */}
              <p className="text-xs sm:text-sm opacity-70 mb-3 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                {post.content}
              </p>

              {/* Author */}
              <p className="text-xs opacity-60 mb-3">작성자: {post.author}</p>

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
          )
        })}
            </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="join">
            <button
              className="join-item btn btn-sm rounded-tl-lg rounded-bl-lg"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              «
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`join-item btn btn-sm ${currentPage === page ? 'btn-active' : ''}`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}
            <button
              className="join-item btn btn-sm rounded-tr-lg rounded-br-lg"
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
          <div className="modal-box rounded-lg max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-xl">{selectedPost.title}</h3>
              <button
                className="btn btn-sm btn-circle btn-ghost"
                onClick={closeModal}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Meta info */}
              <div className="flex flex-wrap gap-4 text-sm text-base-content/70">
                <span>작성자: {selectedPost.author}</span>
                <span>작성일: {selectedPost.date}</span>
                <span>카테고리: {selectedPost.category === 'notice' ? '공지사항' : '자유게시판'}</span>
              </div>

              {/* Content */}
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap leading-relaxed">
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
                       <div key={user.id} className="flex items-center gap-3 p-2 bg-base-100 rounded-lg">
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
          <div className="modal-box rounded-lg max-w-2xl">
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
            </div>

            <div className="modal-action">
              <button className="btn btn-ghost btn-sm rounded-lg" onClick={closeNewPostModal}>
                취소
              </button>
              <button className="btn btn-primary btn-sm rounded-lg" onClick={handleNewPostSubmit}>
                완료
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
