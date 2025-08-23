import { useEffect, useMemo, useRef, useState } from 'react'
import ScrollDropDown from './ScrollDropdown'

export default function AmPmTimePicker() {
  const [ampm, setAmpm] = useState<'AM' | 'PM'>('AM')
  const [hour, setHour] = useState<number>(8)
  const [minute, setMinute] = useState<number>(0)

  // 각 드롭다운 열림 상태
  const [showAmpm, setShowAmpm] = useState(false)
  const [showHour, setShowHour] = useState(false)
  const [showMinute, setShowMinute] = useState(false)

  const ampmRef = useRef<HTMLDivElement>(null)
  const hourRef = useRef<HTMLDivElement>(null)
  const minuteRef = useRef<HTMLDivElement>(null)

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
            onChange={(v) => setAmpm(v as 'AM' | 'PM')}
          />
        </div>
        {/* 시 선택 */}
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
            value={hour}
            onChange={(v) => setHour(v as number)}
          />
          <span className="text-xs mb-1">시</span>
        </div>
        {/* 분 선택 */}
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
            value={minute}
            onChange={(v) => setMinute(v as number)}
          />
          <span className="text-xs mb-1">분</span>
        </div>
      </div>
    </div>
  )
}
