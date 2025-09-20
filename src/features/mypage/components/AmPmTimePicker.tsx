import { useEffect, useMemo, useRef, useState } from 'react'
import ScrollDropDown from './ScrollDropdown'
import { from24h, to24h, type Meridiem } from '../../../libs/utils/time'

type Props = {
  /** 0~23 */
  hour: number
  /** 0~59 */
  minute: number
  /** 사용자 변경 시에만 24시간 기준으로 콜백 */
  onChange: (time: { hour: number; minute: number }) => void
}

export default function AmPmTimePicker(props: Props) {
  // 표시용 내부 상태(12시간제) — 초기값을 props로 세팅해 깜빡임 방지
  const init = from24h(props.hour, props.minute)
  const [ampm, setAmpm] = useState<Meridiem>(init.meridiem)
  const [hh12, setHh12] = useState<number>(init.hour12) // 1~12
  const [mm, setMm] = useState<number>(props.minute) // 0~59

  // 드롭다운 열림 상태
  const [showAmpm, setShowAmpm] = useState(false)
  const [showHour, setShowHour] = useState(false)
  const [showMinute, setShowMinute] = useState(false)

  const ampmRef = useRef<HTMLDivElement>(null)
  const hourRef = useRef<HTMLDivElement>(null)
  const minuteRef = useRef<HTMLDivElement>(null)

  // 부모 값 변경 시(모달 재오픈/프로필 리패치 등) 내부 표시용 상태 동기화
  useEffect(() => {
    const next = from24h(props.hour, props.minute)
    setAmpm((prev) => (prev === next.meridiem ? prev : next.meridiem))
    setHh12((prev) => (prev === next.hour12 ? prev : next.hour12))
    setMm((prev) => (prev === props.minute ? prev : props.minute))
  }, [props.hour, props.minute])

  // 외부 클릭/ESC → 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        ampmRef.current &&
        !ampmRef.current.contains(e.target as Node) &&
        hourRef.current &&
        !hourRef.current.contains(e.target as Node) &&
        minuteRef.current &&
        !minuteRef.current.contains(e.target as Node)
      ) {
        setShowAmpm(false)
        setShowHour(false)
        setShowMinute(false)
      }
    }
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowAmpm(false)
        setShowHour(false)
        setShowMinute(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    document.addEventListener('keydown', handleEsc)
    return () => {
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [])

  const ampmItems = useMemo(
    () => [
      { value: 'AM', label: '오전' },
      { value: 'PM', label: '오후' },
    ],
    []
  )
  const hourItems = useMemo(
    () => Array.from({ length: 12 }, (_, i) => i + 1).map((h) => ({ value: h, label: String(h) })),
    []
  )
  const minuteItems = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => i).map((m) => ({
        value: m,
        label: String(m).padStart(2, '0'),
      })),
    []
  )

  return (
    <div>
      <div className="flex rounded-lg justify-start items-center gap-3">
        {/* 오전/오후 */}
        <div ref={ampmRef}>
          <ScrollDropDown
            open={showAmpm}
            onOpenChange={(v) => {
              setShowAmpm(v)
              if (v) {
                setShowHour(false)
                setShowMinute(false)
              }
            }}
            items={ampmItems}
            value={ampm}
            onChange={(v) => {
              const nextAmpm = v as Meridiem
              setAmpm(nextAmpm)
              const { hour, minute } = to24h(hh12, mm, nextAmpm)
              props.onChange({ hour, minute }) // 사용자 조작 시에만 부모 알림(24h)
            }}
          />
        </div>

        {/* 시 선택 (1~12) */}
        <div className="flex justify-center items-end gap-1" ref={hourRef}>
          <ScrollDropDown
            open={showHour}
            onOpenChange={(v) => {
              setShowHour(v)
              if (v) {
                setShowAmpm(false)
                setShowMinute(false)
              }
            }}
            items={hourItems}
            value={hh12}
            onChange={(v) => {
              const nextH = v as number
              setHh12(nextH)
              const { hour, minute } = to24h(nextH, mm, ampm)
              props.onChange({ hour, minute }) // 사용자 조작 시에만 부모 알림(24h)
            }}
          />
          <span className="text-xs mb-1">시</span>
        </div>

        {/* 분 선택 (00~59) */}
        <div className="flex justify-center items-end gap-1" ref={minuteRef}>
          <ScrollDropDown
            open={showMinute}
            onOpenChange={(v) => {
              setShowMinute(v)
              if (v) {
                setShowAmpm(false)
                setShowHour(false)
              }
            }}
            items={minuteItems}
            value={mm}
            onChange={(v) => {
              const nextM = v as number
              setMm(nextM)
              const { hour, minute } = to24h(hh12, nextM, ampm)
              props.onChange({ hour, minute }) // 사용자 조작 시에만 부모 알림(24h)
            }}
          />
          <span className="text-xs mb-1">분</span>
        </div>
      </div>
    </div>
  )
}
