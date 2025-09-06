import { useState, useEffect } from 'react'
import { getMyMemberId } from '../../../libs/api/profile'

export function useMyMemberId() {
  const [myMemberId, setMyMemberId] = useState<number | null>(null)

  useEffect(() => {
    async function fetchMemberId() {
      try {
        const id = await getMyMemberId()
        setMyMemberId(id)
      } catch {
        setMyMemberId(null)
      }
    }
    fetchMemberId()
  }, [])

  return { myMemberId }
}
