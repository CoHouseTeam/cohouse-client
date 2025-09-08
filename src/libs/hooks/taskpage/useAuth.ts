import { useEffect, useState } from 'react'
import { isAuthenticated } from '../../utils/auth'

export function useAuth() {
  const [userAuthenticated, setUserAuthenticated] = useState(false)
  useEffect(() => {
    setUserAuthenticated(isAuthenticated())
  }, [])
  return { userAuthenticated }
}
