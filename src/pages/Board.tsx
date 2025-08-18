import { Heart, X } from 'lucide-react'
import { useState } from 'react'

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
}

export default function Board() {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [activeTab, setActiveTab] = useState<'notice' | 'free'>('notice')
  const postsPerPage = 8

  // 게시글 데이터 (실제로는 API에서 가져올 데이터)
  const posts: Post[] = [
    {
      id: 1,
      title: '월간 관리비 납부 안내',
      content: '2024년 1월 관리비 납부 기한이 1월 25일까지입니다. 늦지 않게 납부해 주시기 바랍니다. 관리비는 각 세대별로 차등 적용되며, 공동시설 이용료와 기본 관리비로 구성되어 있습니다. 납부 방법은 온라인 뱅킹, 자동이체, 현금 납부 등이 가능합니다. 문의사항이 있으시면 관리사무소로 연락해 주세요.',
      author: '관리자',
      date: '2024-01-15',
      likes: 12,
      isPinned: true,
      color: 'bg-blue-100 border-blue-200 text-blue-800',
      category: 'notice'
    },
    {
      id: 2,
      title: '엘리베이터 점검 안내',
      content: '1월 20일 오전 9시부터 12시까지 엘리베이터 점검이 예정되어 있습니다. 점검 시간 동안 엘리베이터 이용이 제한될 수 있으니 참고하시기 바랍니다. 점검 내용은 승강기 안전장치, 제어장치, 도어 시스템 등을 포함합니다. 점검 완료 후 정상 운행을 재개할 예정입니다.',
      author: '관리자',
      date: '2024-01-12',
      likes: 8,
      isPinned: true,
      color: 'bg-orange-100 border-orange-200 text-orange-800',
      category: 'notice'
    },
    {
      id: 3,
      title: '분기별 입주민 회의 안내',
      content: '2024년 1분기 입주민 회의가 1월 30일 오후 7시에 예정되어 있습니다. 많은 참여 부탁드립니다. 회의 안건은 관리비 현황, 공동시설 개선사항, 입주민 건의사항 등이 포함됩니다. 회의 참석을 원하시는 분은 사전에 관리사무소로 신청해 주시기 바랍니다.',
      author: '관리자',
      date: '2024-01-10',
      likes: 15,
      isPinned: false,
      color: 'bg-green-100 border-green-200 text-green-800',
      category: 'notice'
    },
    {
      id: 4,
      title: '공동주택 소식지 발행',
      content: '2024년 1월호 공동주택 소식지가 발행되었습니다. 로비에서 확인하실 수 있습니다. 이번 호에는 입주민 인터뷰, 공동시설 이용 안내, 계절별 관리 팁 등이 실려 있습니다. 소식지에 기고를 원하시는 분은 관리사무소로 연락해 주세요.',
      author: '관리자',
      date: '2024-01-08',
      likes: 6,
      isPinned: false,
      color: 'bg-purple-100 border-purple-200 text-purple-800',
      category: 'notice'
    },
    {
      id: 5,
      title: '주차장 공사 완료 안내',
      content: '지하주차장 리모델링 공사가 완료되었습니다. 이용에 참고하시기 바랍니다. 공사 내용은 바닥 보수, 조명 개선, 환기 시스템 업그레이드 등이 포함되었습니다. 새로운 주차 시스템이 적용되어 더욱 편리하게 이용하실 수 있습니다.',
      author: '관리자',
      date: '2024-01-05',
      likes: 23,
      isPinned: false,
      color: 'bg-teal-100 border-teal-200 text-teal-800',
      category: 'notice'
    },
    {
      id: 6,
      title: '입주민 건의사항 접수',
      content: '입주민 여러분의 소중한 의견을 기다립니다. 건의사항은 관리사무소로 접수해 주세요. 건의사항 접수 방법은 온라인 게시판, 이메일, 전화, 직접 방문 등이 가능합니다. 접수된 건의사항은 검토 후 적절한 조치를 취하도록 하겠습니다.',
      author: '관리자',
      date: '2024-01-03',
      likes: 18,
      isPinned: false,
      color: 'bg-pink-100 border-pink-200 text-pink-800',
      category: 'notice'
    },
    {
      id: 7,
      title: '분리수거 정책 변경',
      content: '2024년부터 분리수거 정책이 변경되었습니다. 자세한 내용은 안내문을 참고하세요. 주요 변경사항은 플라스틱 분리수거 세분화, 음식물쓰레기 배출 방법 개선 등입니다. 새로운 분리수거 방법을 숙지하시고 적극 협조해 주시기 바랍니다.',
      author: '관리자',
      date: '2024-01-01',
      likes: 31,
      isPinned: false,
      color: 'bg-indigo-100 border-indigo-200 text-indigo-800',
      category: 'notice'
    },
    {
      id: 8,
      title: '공동시설 이용 시간',
      content: '헬스장, 독서실 등 공동시설의 이용 시간이 조정되었습니다. 헬스장은 오전 6시부터 오후 10시까지, 독서실은 오전 9시부터 오후 9시까지 이용 가능합니다. 이용 시 시설 이용 규칙을 준수해 주시기 바랍니다.',
      author: '관리자',
      date: '2023-12-28',
      likes: 11,
      isPinned: false,
      color: 'bg-amber-100 border-amber-200 text-amber-800',
      category: 'notice'
    },
    {
      id: 9,
      title: '안전점검 실시 안내',
      content: '월 1회 정기 안전점검이 실시됩니다. 소화기, 비상구, 안전장치 등을 점검하니 협조해 주시기 바랍니다. 점검 시간은 오전 10시부터 오후 4시까지이며, 점검 중에는 일시적으로 출입이 제한될 수 있습니다.',
      author: '관리자',
      date: '2023-12-25',
      likes: 7,
      isPinned: false,
      color: 'bg-red-100 border-red-200 text-red-800',
      category: 'notice'
    },
    {
      id: 10,
      title: '입주민 동호회 모집',
      content: '다양한 입주민 동호회를 모집합니다. 독서회, 등산회, 요리회, 운동회 등 관심 있는 분들의 많은 참여를 기다립니다. 동호회 활동을 통해 이웃과의 소통과 친목을 도모할 수 있습니다.',
      author: '관리자',
      date: '2023-12-20',
      likes: 25,
      isPinned: false,
      color: 'bg-emerald-100 border-emerald-200 text-emerald-800',
      category: 'notice'
    },
    // 자유게시판 게시글들
    {
      id: 11,
      title: '헬스장 운동 파트너 구합니다',
      content: '헬스장에서 함께 운동할 파트너를 구합니다. 초보자도 환영합니다. 주로 저녁 7-9시에 운동하고 싶은데 혼자 하기보다는 함께 하면 더 재미있을 것 같아요. 관심 있으신 분은 연락주세요!',
      author: '101호 김철수',
      date: '2024-01-14',
      likes: 8,
      isPinned: false,
      color: 'bg-cyan-100 border-cyan-200 text-cyan-800',
      category: 'free'
    },
    {
      id: 12,
      title: '분실물 찾습니다',
      content: '어제 저녁에 로비에서 검은색 지갑을 분실했습니다. 혹시 발견하신 분이 계시면 연락 부탁드립니다. 지갑 안에 신분증과 카드가 들어있어서 급합니다. 보상도 드리겠습니다.',
      author: '205호 이영희',
      date: '2024-01-13',
      likes: 5,
      isPinned: false,
      color: 'bg-rose-100 border-rose-200 text-rose-800',
      category: 'free'
    },
    {
      id: 13,
      title: '독서모임 참여하실 분',
      content: '월 2회 독서모임을 시작하려고 합니다. 매주 토요일 오후 2시에 독서실에서 만나서 책 이야기를 나누고 싶어요. 현재 3명이 참여하고 있고, 더 많은 분들의 참여를 기다립니다.',
      author: '302호 박민수',
      date: '2024-01-12',
      likes: 12,
      isPinned: false,
      color: 'bg-violet-100 border-violet-200 text-violet-800',
      category: 'free'
    },
    {
      id: 14,
      title: '주차장 공간 양도',
      content: '저희 세대는 차량을 팔아서 주차장 공간이 비게 되었습니다. 혹시 주차 공간이 필요하신 분이 계시면 양도해드릴 수 있습니다. 연락 부탁드립니다.',
      author: '401호 최지영',
      date: '2024-01-11',
      likes: 15,
      isPinned: false,
      color: 'bg-slate-100 border-slate-200 text-slate-800',
      category: 'free'
    },
    {
      id: 15,
      title: '반려동물 산책 친구',
      content: '강아지와 함께 산책할 친구를 구합니다. 저희 강아지는 골든리트리버 2살이고, 아주 순합니다. 주로 저녁 6시에 산책하는데 함께 하실 분 있으시면 좋겠어요.',
      author: '503호 정수진',
      date: '2024-01-10',
      likes: 9,
      isPinned: false,
      color: 'bg-yellow-100 border-yellow-200 text-yellow-800',
      category: 'free'
    }
  ]

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
  }

  // 모달 닫기 함수
  const closeModal = () => {
    setSelectedPost(null)
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral">게시판</h1>
        </div>
        <button className="btn btn-primary btn-sm sm:btn-md">
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          새 글 작성
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="tabs tabs-boxed">
        <button 
          className={`tab ${activeTab === 'notice' ? 'tab-active' : ''}`}
          onClick={() => handleTabChange('notice')}
        >
          공지사항
        </button>
        <button 
          className={`tab ${activeTab === 'free' ? 'tab-active' : ''}`}
          onClick={() => handleTabChange('free')}
        >
          자유게시판
        </button>
      </div>

      {/* 게시판 그리드 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
        {currentPosts.map((post) => {
          return (
            <div
              key={post.id}
              className={`group relative bg-white border-2 rounded-lg p-3 sm:p-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${post.color} ${
                post.isPinned ? 'ring-2 ring-yellow-400' : ''
              }`}
              onClick={() => handlePostClick(post)}
            >
              {/* 고정 표시 */}
              {post.isPinned && (
                <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full font-bold">
                  고정
                </div>
              )}

              {/* 날짜 */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs opacity-70">{post.date}</span>
              </div>

              {/* 제목 */}
              <h3 className="font-bold text-sm sm:text-base mb-2 group-hover:text-opacity-80 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {post.title}
              </h3>

              {/* 내용 미리보기 */}
              <p className="text-xs sm:text-sm opacity-70 mb-3 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                {post.content}
              </p>

              {/* 작성자 */}
              <p className="text-xs opacity-60 mb-3">작성자: {post.author}</p>

              {/* 통계 */}
              <div className="flex items-center justify-end text-xs opacity-60">
                <div className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  <span>{post.likes}</span>
                </div>
              </div>

              {/* 호버 효과 */}
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 rounded-lg transition-opacity duration-200"></div>
            </div>
          )
        })}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="join">
            <button 
              className="join-item btn btn-sm" 
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
              className="join-item btn btn-sm" 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              »
            </button>
          </div>
        </div>
      )}

      {/* 게시글 상세보기 모달 */}
      {selectedPost && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl max-h-[90vh] overflow-y-auto">
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
              {/* 메타 정보 */}
              <div className="flex flex-wrap gap-4 text-sm text-base-content/70">
                <span>작성자: {selectedPost.author}</span>
                <span>작성일: {selectedPost.date}</span>
                <span>카테고리: {selectedPost.category === 'notice' ? '공지사항' : '자유게시판'}</span>
              </div>

              {/* 내용 */}
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap leading-relaxed">
                  {selectedPost.content}
                </p>
              </div>

              {/* 통계 */}
              <div className="flex items-center gap-6 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  <span className="font-semibold">{selectedPost.likes}</span>
                </div>
              </div>
            </div>

            <div className="modal-action">
              <button className="btn btn-primary" onClick={closeModal}>
                닫기
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={closeModal}></div>
        </div>
      )}
    </div>
  )
}
