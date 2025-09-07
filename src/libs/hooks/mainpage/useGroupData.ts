import { useEffect, useState } from 'react'
import { useGroupStore } from '../../../app/store'
import { fetchMyGroups } from '../../api/groups'
import { getMyMemberId } from '../../api/profile'
import { AxiosError } from 'axios'

interface UseGroupDataResult {
  loadingGroup: boolean
  errorGroup: string
  hasGroups: boolean
  groupId: number | null
}

export function useGroupData(userAuthenticated: boolean): UseGroupDataResult {
  const [loadingGroup, setLoadingGroup] = useState(false)
  const [errorGroup, setErrorGroup] = useState('')
  const hasGroups = useGroupStore((state) => state.hasGroups)
  const setHasGroups = useGroupStore((state) => state.setHasGroups)
  const setMyMemberId = useGroupStore((state) => state.setMyMemberId)
  const [groupId, setGroupId] = useState<number | null>(null)

  useEffect(() => {
    async function loadGroup() {
      if (!userAuthenticated) {
        setErrorGroup('')
        setHasGroups(false)
        setGroupId(null)
        setMyMemberId(null)
        return
      }
      setLoadingGroup(true)
      setErrorGroup('')
      try {
        const myGroupData = await fetchMyGroups()
        if (!myGroupData || !myGroupData.id) {
          setHasGroups(false)
          setGroupId(null)
          setMyMemberId(null)
          return
        }
        setHasGroups(true)
        setGroupId(myGroupData.id)

        const currentUserMemberId = await getMyMemberId()
        setMyMemberId(currentUserMemberId || null)
      } catch (e) {
        const error = e as AxiosError
        if (error.response?.status === 404) {
          setHasGroups(false)
          setGroupId(null)
          setMyMemberId(null)
          setErrorGroup('')
        } else {
          setErrorGroup('그룹 정보를 불러오는 중 오류가 발생했습니다.')
          setHasGroups(false)
          setGroupId(null)
          setMyMemberId(null)
        }
      } finally {
        setLoadingGroup(false)
      }
    }
    loadGroup()
  }, [userAuthenticated, setHasGroups, setMyMemberId])

  return { loadingGroup, errorGroup, hasGroups, groupId }
}
