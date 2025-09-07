import { useEffect, useState } from 'react'
import { isAuthenticated } from '../../utils/auth'
import { getProfile } from '../../api/profile'

export function useUserProfile() {
  const [userAuthenticated, setUserAuthenticated] = useState(false)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    setUserAuthenticated(isAuthenticated())
  }, [])

  useEffect(() => {
    if (!userAuthenticated) {
      setUserName('')
      return
    }
    async function fetchProfile() {
      try {
        const profile = await getProfile()
        setUserName(profile.name || '')
      } catch {
        setUserName('')
      }
    }
    fetchProfile()
  }, [userAuthenticated])

  return { userAuthenticated, userName }
}
