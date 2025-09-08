// src/pages/PaymentsHistory.tsx
import { useEffect, useMemo, useState } from 'react'
import { Search, CaretDown } from 'react-bootstrap-icons'

import LoadingSpinner from '../features/common/LoadingSpinner'
import ErrorCard from '../features/common/ErrorCard'
import Pagination from '../features/common/Pagination'
import PaymentsListItem from '../features/payments/components/paymentsListItem'

import { fetchMyPayments } from '../libs/api/payments'
import { useMySettlements } from '../libs/hooks/settlements/useMySettlements'
import { useMyPayments } from '../libs/hooks/payments/useMyPayments'

import type {
  PaymentHistoryItem,
  Settlement,
  TransferStatus,
  PageParams,
} from '../types/settlement'

// UI 카테고리
const CATEGORY_LIST = ['전체', '송금 완료', '송금 실패', '송금 취소'] as const
type Category = (typeof CATEGORY_LIST)[number]

// 카테고리 → 상태 매핑
const CAT_TO_STATUSES: Record<Category, TransferStatus[]> = {
  전체: ['PENDING', 'PAID', 'REFUNDED', 'FAILED', 'CANCELED'],
  '송금 완료': ['PAID'],
  '송금 실패': ['FAILED'],
  '송금 취소': ['CANCELED'],
}

// 페이지 사이즈
const PAGE_SIZE = 10 // 화면 표시용
const BULK_SIZE = 100 // 필터 ON 전체 수집용(서버가 허용하는 큰 값)

export default function PaymentsHistory() {
  // 드롭다운 & 필터 상태
  const [open, setOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category>('전체')
  const [searchTerm, setSearchTerm] = useState('')

  // 서버/클라 페이지 인덱스
  const [page, setPage] = useState(0) // 서버 페이징용(0-base)
  const [clientPage, setClientPage] = useState(0) // 클라 페이징용(0-base)

  // 필터 ON 판단
  const isFilterOn = searchTerm.trim() !== '' || selectedCategory !== '전체'

  // 필터 바뀌면 페이지 초기화
  useEffect(() => {
    setPage(0)
    setClientPage(0)
  }, [searchTerm, selectedCategory])

  // 정산 제목 검색을 위한 정산 전체(또는 필요한 만큼)
  const { data: settlements = [] } = useMySettlements()

  // 🔧 변경 1: settlements를 무조건 배열로 정규화 (페이지 객체/배열 모두 대응)
  const settlementsArray: Settlement[] = useMemo(() => {
    const s: any = settlements
    if (Array.isArray(s?.content)) return s.content as Settlement[]
    if (Array.isArray(s)) return s as Settlement[]
    return [] as Settlement[]
  }, [settlements])

  // 🔧 변경 2: 위에서 정규화한 배열로 Map 생성
  const settlementMap = useMemo(
    () => new Map<number, Settlement>(settlementsArray.map((s) => [s.id, s] as const)),
    [settlementsArray]
  )

  // -------------------------------
  // ① 서버 페이지네이션 (필터 OFF에서만 화면에 사용)
  // -------------------------------
  const pageable: PageParams = { page, size: PAGE_SIZE, sort: 'transferAt,desc' }
  const {
    data: serverPage,
    isLoading: serverLoading,
    error: serverError,
  } = useMyPayments(pageable, {})

  // -------------------------------
  // ② 필터 ON: 전체 페이지 한 번 수집
  // -------------------------------
  const [allData, setAllData] = useState<PaymentHistoryItem[]>([])
  const [allLoaded, setAllLoaded] = useState(false)
  const [allLoading, setAllLoading] = useState(false)
  const [allError, setAllError] = useState<string | null>(null)

  useEffect(() => {
    if (!isFilterOn || allLoaded) return
    let canceled = false

    ;(async () => {
      try {
        setAllLoading(true)
        setAllError(null)

        // 1) 첫 페이지로 totalPages 파악
        const first = await fetchMyPayments(
          {},
          { page: 0, size: BULK_SIZE, sort: 'transferAt,desc' }
        )

        // 2) 나머지 병렬 요청
        const jobs: Promise<typeof first>[] = []
        for (let p = 1; p < (first.totalPages ?? 1); p++) {
          jobs.push(fetchMyPayments({}, { page: p, size: BULK_SIZE, sort: 'transferAt,desc' }))
        }
        const rest = await Promise.all(jobs)

        // 3) content 합치기
        const all = [first, ...rest].flatMap((pg) => pg.content ?? [])

        if (!canceled) {
          setAllData(all)
          setAllLoaded(true)
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e)
        if (!canceled) setAllError(msg || '전체 데이터 로딩 실패')
      } finally {
        if (!canceled) setAllLoading(false)
      }
    })()

    return () => {
      canceled = true
    }
  }, [isFilterOn, allLoaded])

  // -------------------------------
  // ③ 원본 목록 결정
  // -------------------------------
  const rawList: PaymentHistoryItem[] = useMemo(() => {
    return isFilterOn ? allData : (serverPage?.content ?? [])
  }, [isFilterOn, allData, serverPage?.content])

  // -------------------------------
  // ④ 정렬(최신 송금일)
  // -------------------------------
  const sorted = useMemo(() => {
    return [...rawList].sort(
      (a, b) => new Date(b.transferAt).getTime() - new Date(a.transferAt).getTime()
    )
  }, [rawList])

  // -------------------------------
  // ⑤ 카테고리/검색 필터
  // -------------------------------
  const filtered = useMemo(() => {
    const statuses = CAT_TO_STATUSES[selectedCategory]
    const term = searchTerm.trim().toLowerCase()
    return sorted.filter((p) => {
      if (!statuses.includes(p.status)) return false
      if (!term) return true
      const title = (settlementMap.get(p.settlementId)?.title ?? '').toLowerCase()
      return title.includes(term)
    })
  }, [sorted, selectedCategory, searchTerm, settlementMap])

  // -------------------------------
  // ⑥ 실제 렌더 목록
  // -------------------------------
  const listToRender = useMemo(() => {
    if (!isFilterOn) return rawList
    const start = clientPage * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [isFilterOn, rawList, filtered, clientPage])

  // -------------------------------
  // ⑦ 총 페이지 수
  // -------------------------------
  const serverTotalPages = Math.max(1, serverPage?.totalPages ?? 1)
  const clientTotalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const totalPagesToUse = isFilterOn ? clientTotalPages : serverTotalPages

  // -------------------------------
  // ⑧ 로딩/에러 가드
  // -------------------------------
  const isLoading = isFilterOn ? allLoading : serverLoading
  const error = isFilterOn ? (allError ? new Error(allError) : null) : (serverError as Error | null)

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorCard />

  const isEmpty = isFilterOn ? filtered.length === 0 : (serverPage?.content?.length ?? 0) === 0

  // 페이지네이션 핸들러
  const currentIndex = isFilterOn ? clientPage : page
  const handlePageChange = (idx: number) => {
    if (isFilterOn) setClientPage(idx)
    else setPage(idx)
  }

  return (
    <div className="space-y-6 w-full max-w-5xl mx-auto">
      <div className="grid grid-cols-1 gap-6">
        <h1 className="text-2xl font-bold text-black">송금 히스토리</h1>

        {/* 검색 + 카테고리 */}
        <div className="flex gap-2 mt-2">
          {/* 검색 */}
          <label className="input input-bordered flex items-center gap-2 rounded-xl h-10 flex-1 min-w-0">
            <Search size={16} className="shrink-0" />
            <input
              type="text"
              placeholder="정산 제목으로 검색"
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
                      e.stopPropagation()
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
            {isFilterOn ? '검색/필터 결과가 없어요' : '송금 히스토리가 없어요'}
          </p>
        </div>
      ) : (
        <>
          {/* 리스트 */}
          {listToRender.map((p) => (
            <PaymentsListItem key={p.id} item={p} settlement={settlementMap.get(p.settlementId)} />
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
