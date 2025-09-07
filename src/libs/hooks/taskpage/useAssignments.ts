import { useState, useEffect, useCallback } from 'react'
import { getAssignments } from '../../api/tasks'
import { Assignment } from '../../../types/tasks'

export function useAssignments(userAuthenticated: boolean, groupId: number | null) {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [isAssigned, setIsAssigned] = useState(false)
  const [error, setError] = useState('')

  const loadAssignments = useCallback(async () => {
    if (!groupId) {
      setAssignments([])
      setIsAssigned(false)
      setError('')
      return
    }

    setError('')
    try {
      const data = await getAssignments({ groupId })
      setAssignments(Array.isArray(data) ? data : [])
      setIsAssigned(Array.isArray(data) && data.length > 0)
    } catch {
      setError('업무 내역을 불러오는 중 오류가 발생했습니다.')
      setAssignments([])
      setIsAssigned(false)
    }
  }, [groupId])

  useEffect(() => {
    if (userAuthenticated) {
      loadAssignments()
    } else {
      setAssignments([])
      setIsAssigned(false)
      setError('')
    }
  }, [userAuthenticated, loadAssignments])

  return { assignments, isAssigned, error, reload: loadAssignments }
}
