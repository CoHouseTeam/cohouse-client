import { useEffect, useMemo, useState } from 'react'
import { Search, CaretDown } from 'react-bootstrap-icons'

import LoadingSpinner from '../features/common/LoadingSpinner'
import ErrorCard from '../features/common/ErrorCard'
import { fromCategory } from '../libs/utils/categoryMapping'

import { useMySettlementHistory } from '../libs/hooks/settlements/useMySettlements'
import { fetchMySettlementHistory } from '../libs/api/settlements'
import type { SettlementListItem as SettlementListItemType } from '../types/settlement'
import SettlementItemWithDetail from '../features/settlements/components/SettlementItemWithDetail'
import Pagination from '../features/common/Pagination'

// 카테고리 라벨
const CATEGORY_LIST = ['전체', '식비', '생활용품', '문화생활', '기타'] as const
type Category = (typeof CATEGORY_LIST)[number]

// 페이지 사이즈(한 화면당 5개)
const PAGE_SIZE = 5

type SettlementHistoryProps = {
  groupId: number
  viewerId: number
}

export default function SettlementHistory({ groupId, viewerId }: SettlementHistoryProps) {
  // 카테고리 드롭다운 open 상태
  const [open, setOpen] = useState(false)

  // 선택된 카테고리(기본: 전체)
  const [selectedCategory, setSelectedCategory] = useState<Category>('전체')

  // 검색어
  const [searchTerm, setSearchTerm] = useState('')

  // 서버 페이지네이션: 현재 페이지 인덱스(0-base)
  const [page, setPage] = useState(0)

  //필터/검색이 하나라도 켜져 있으면 클라이언트 모드로 전환
  // - 검색어가 있거나
  // - 카테고리가 '전체'가 아니면
  const isFilterOn = searchTerm.trim() !== '' || selectedCategory !== '전체'

  // 클라이언트 페이지네이션 인덱스(필터 ON일 때만 사용)
  const [clientPage, setClientPage] = useState(0)

  // 필터 ON에서 사용할 "전체 데이터" 캐시 및 상태
  const [allData, setAllData] = useState<SettlementListItemType[]>([]) // 전체 content 모음
  const [allLoaded, setAllLoaded] = useState(false) // 한 번 전체 수집 완료했는가
  const [allLoading, setAllLoading] = useState(false) // 전체 수집 로딩중
  const [allError, setAllError] = useState<string | null>(null) // 전체 수집 에러

  // 검색어/카테고리 변경 시 서버/클라 페이지 모두 0으로 초기화
  useEffect(() => {
    setPage(0) // 서버 페이징용
    setClientPage(0) // 클라 페이징용
  }, [searchTerm, selectedCategory])

  // 기본: 서버 페이지네이션 훅 (필터 OFF에서 사용)
  const { data, isLoading, error } = useMySettlementHistory({
    page,
    size: PAGE_SIZE,
    sort: 'createdAt,desc',
  })

  // --------------------------------------------------------------------------------
  //  필터 ON 순간에 "전체 페이지 병렬 수집"
  // - 전체 기준으로 필터/검색하려면 모든 페이지의 content가 필요
  // - 한 번 다 모으면(allLoaded=true) 이후에는 캐시 사용 (재요청 X)
  // --------------------------------------------------------------------------------
  useEffect(() => {
    // 필터 OFF거나 이미 한 번 전체 로딩 끝났다면 실행 안 함
    if (!isFilterOn || allLoaded) return

    let canceled = false // 언마운트/의존성 변경 시 setState 방지용 플래그

    ;(async () => {
      try {
        setAllLoading(true)
        setAllError(null)

        // 1) 첫 페이지 요청 → totalPages 파악
        const first = await fetchMySettlementHistory({
          page: 0,
          size: PAGE_SIZE, // 서버가 허용하면 50~100으로 키워 호출 수 줄여도 됨
          sort: 'createdAt,desc',
        })

        // 2) 1 ~ totalPages-1 페이지 병렬 요청
        const jobs: Promise<typeof first>[] = []
        for (let p = 1; p < (first.totalPages ?? 1); p++) {
          jobs.push(
            fetchMySettlementHistory({
              page: p,
              size: PAGE_SIZE,
              sort: 'createdAt,desc',
            })
          )
        }

        // 3) 모두 완료될 때까지 대기
        const rest = await Promise.all(jobs)

        // 4) 모든 content 합치기 → allData
        const all = [first, ...rest].flatMap((pg) => pg.content ?? [])

        if (!canceled) {
          setAllData(all)
          setAllLoaded(true) // 캐시 완료 → 같은 세션에선 재수집 안 함
        }
      } catch (e: unknown) {
        if (!canceled) {
          const msg = e instanceof Error ? e.message : String(e)
          setAllError(msg || '전체 데이터 로딩 실패')
        }
      } finally {
        if (!canceled) setAllLoading(false)
      }
    })()

    // cleanup: 이 이펙트가 갈아끼워질 때/언마운트될 때 뒤늦은 setState 방지
    return () => {
      canceled = true
    }
  }, [isFilterOn, allLoaded])

  // --------------------------------------------------------------------------------
  //  원본 목록 결정
  // - 필터 OFF: data?.content (서버가 잘라준 현재 페이지)
  // - 필터 ON : allData (우리가 전체 수집 캐시에 모아둔 것)
  // --------------------------------------------------------------------------------
  const rawList: SettlementListItemType[] = useMemo(() => {
    return isFilterOn ? allData : (data?.content ?? [])
  }, [isFilterOn, allData, data?.content])

  // --------------------------------------------------------------------------------
  //  히스토리만 남기고 최신순 정렬
  // - 진행중(PENDING) 제외
  // - createdAt 내림차순
  // --------------------------------------------------------------------------------
  const sorted = useMemo(
    () =>
      [...rawList]
        .filter((s) => s.status !== 'PENDING')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [rawList]
  )

  // --------------------------------------------------------------------------------
  //  검색/카테고리 필터
  // - 검색어: 제목에 term 포함(대소문자 무시)
  // - 카테고리: '전체'면 OFF, 아니면 fromCategory(s.category)와 정확히 일치
  // --------------------------------------------------------------------------------
  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return sorted.filter((s) => {
      const matchesSearch = (s.title ?? '').toLowerCase().includes(term)
      const matchesCategory =
        selectedCategory === '전체' || fromCategory(s.category) === selectedCategory
      return matchesCategory && matchesSearch
    })
  }, [sorted, searchTerm, selectedCategory])

  // --------------------------------------------------------------------------------
  //  실제 렌더링 목록
  // - 필터 OFF: 서버가 이미 페이지 단위로 잘라서 내려줌 → 그대로 사용
  // - 필터 ON : filtered 전체 위에서 클라가 직접 slice로 잘라서 사용
  // --------------------------------------------------------------------------------
  const listToRender = useMemo(() => {
    if (!isFilterOn) return filtered // 서버 페이징 결과(현재 페이지) 그대로
    const start = clientPage * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [isFilterOn, filtered, clientPage])

  // --------------------------------------------------------------------------------
  //  총 페이지 수(분모)
  // - 필터 OFF: 서버 응답 totalPages
  // - 필터 ON : filtered.length를 기반으로 클라에서 계산
  // --------------------------------------------------------------------------------
  const serverTotalPages = Math.max(1, data?.totalPages ?? 1)
  const clientTotalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const totalPagesToUse = isFilterOn ? clientTotalPages : serverTotalPages

  // --------------------------------------------------------------------------------
  // ⑧ 로딩/에러/빈 상태 가드
  // - 필터 OFF: 훅 로딩/에러 사용
  // - 필터 ON : 전체 수집 로딩/에러 사용
  // --------------------------------------------------------------------------------
  if (!isFilterOn && isLoading) return <LoadingSpinner />
  if (!isFilterOn && error) return <ErrorCard />

  if (isFilterOn && allLoading) return <LoadingSpinner />
  if (isFilterOn && allError) return <ErrorCard />

  const isEmpty = filtered.length === 0

  // 페이지네이션 핸들러
  const currentIndex = isFilterOn ? clientPage : page
  const handlePageChange = (idx: number) => {
    if (isFilterOn) setClientPage(idx)
    else setPage(idx)
  }

  return (
    <div className="space-y-6 w-full max-w-5xl mx-auto">
      <div className="grid grid-cols-1 gap-6">
        <h1 className="text-2xl font-bold text-black">정산 히스토리</h1>

        {/* 검색 + 카테고리 */}
        <div className="flex gap-2 mt-2">
          {/* 검색 */}
          <label className="input input-bordered flex items-center gap-2 rounded-xl h-10 flex-1 min-w-0">
            <Search size={16} className="shrink-0" />
            <input
              type="text"
              placeholder="검색어를 입력하세요."
              className="w-full min-w-0 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </label>

          {/* 카테고리 드롭다운 */}
          <div className="relative flex-none w-32 sm:w-40 md:max-w-56">
            <div
              onClick={() => setOpen(!open)}
              role="button"
              className={`w-full border border-gray-300 rounded-xl px-4 py-2 bg-white overflow-hidden ${open ? 'max-h-64 absolute z-50' : 'max-h-10'}`}
            >
              {/* 타이틀 */}
              <div className="flex justify-between items-center">
                <span className={`${!selectedCategory ? 'text-gray-400' : ''} text-sm`}>
                  {selectedCategory ?? '카테고리'}
                </span>
                <CaretDown className={`transition-transform ${open ? 'rotate-180' : ''}`} />
              </div>

              {/* 옵션 목록 */}
              <div
                className={`${open ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200 pt-1`}
                role="listbox"
              >
                {CATEGORY_LIST.map((category) => (
                  <div
                    key={category}
                    role="option"
                    aria-selected={selectedCategory === category}
                    onClick={(e) => {
                      e.stopPropagation() // 상위 onClick 토글 방지
                      setSelectedCategory(category)
                      setOpen(false)
                    }}
                    className="py-2 hover:bg-gray-100 text-sm cursor-pointer rounded-lg"
                  >
                    {category}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 빈 상태 */}
      {isEmpty ? (
        <div className="flex flex-col justify-center text-center mt-4">
          <img
            src="/src/assets/icons/settlementIcon.svg"
            alt="empty icon"
            className="h-10 w-10 mx-auto"
          />
          <p className="text-sm font-medium text-neutral-400 text-center p-3">
            {isFilterOn ? '검색/필터 결과가 없어요' : '정산 히스토리가 없어요'}
          </p>
        </div>
      ) : (
        <>
          {/* 리스트 */}
          {listToRender.map((s) => (
            <SettlementItemWithDetail
              key={s.id}
              initial={s}
              viewerId={viewerId}
              groupId={groupId}
            />
          ))}

          {/* 페이지네이션 바 */}
          <div className="mt-4">
            <Pagination
              page={currentIndex}
              totalPages={totalPagesToUse}
              onChange={handlePageChange}
            />
          </div>
        </>
      )}
    </div>
  )
}
