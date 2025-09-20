import { type RefObject, useEffect } from 'react'

export default function useOnClickOutside(
  ref: RefObject<HTMLElement>,
  handler: (e: MouseEvent | TouchEvent | KeyboardEvent) => void
) {
  useEffect(() => {
    // TODO: 여기서 document에 이벤트 등록해서
    // ref.current 밖을 클릭하면 handler 호출하도록 만들 것

    const onDown = (e: MouseEvent | TouchEvent) => {
      const el = ref.current
      if (!el) return

      const target = e.target as Node
      if (el.contains(target)) return // 안쪽 클릭이면 무시

      handler(e)
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'escape') handler(e)
    }

    document.addEventListener('mousedown', onDown)
    document.addEventListener('touchstart', onDown)
    document.addEventListener('keydown', onKey)

    return () => {
      // TODO: 여기서 이벤트 정리(cleanup) 할 것
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('touchstart', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [ref, handler])
}
