import { useMemo } from 'react'

type Option = { value: string | number; label: string }

type ScrollDropDownProps = {
  items: Option[]
  value: string | number
  onChange: (v: string | number) => void
  open: boolean
  onOpenChange: (v: boolean) => void
}

export default function ScrollDropDown({
  open,
  onOpenChange,
  items,
  value,
  onChange,
}: ScrollDropDownProps) {
  const label = useMemo(() => items.find((it) => it.value === value)?.label ?? '', [items, value])

  return (
    <div className="relative">
      <button
        onClick={() => onOpenChange(!open)}
        className="
                  relative h-9 w-[4rem]
                  grid grid-cols-[1rem_1fr_1rem] items-center
                  border rounded-lg bg-white text-sm"
      >
        <span aria-hidden className="w-4" />
        <span className="justify-self-center">{label}</span>
      </button>

      {/* 드롭다운 리스트 */}
      {open && (
        <div
          role="listbox"
          className="absolute top-full left-0 border rounded-lg w-full max-h-[10rem] overflow-y-auto px-1 py-1 gap-2 mt-1 text-sm bg-white shadow z-[9999] "
        >
          {items.map((item) => {
            const selected = String(item.value) === String(value)
            return (
              <div
                key={String(item.value)}
                role="option"
                aria-selected={selected}
                onClick={(e) => {
                  // 바깥 mousedown 닫힘보다 먼저 실행되어 선택/닫기
                  e.preventDefault()
                  e.stopPropagation()
                  onChange(item.value)
                  onOpenChange(false) // 선택 직후 닫기
                }}
                className={[
                  'px-3 py-2 cursor-pointer select-none rounded-lg text-center',
                  selected ? 'bg-gray-100 font-semibold text-gray-900' : 'text-gray-700',
                  'hover:bg-gray-50',
                ].join(' ')}
              >
                <span>{item.label}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
