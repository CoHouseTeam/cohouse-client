import { useAppStore } from '../../app/store'

export function useAuth() {
  const { user, setUser } = useAppStore()

  const login = (userData: { id: number; name: string; email: string }) => {
    setUser(userData)
    // TODO: Store token in localStorage
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('token')
  }

  const isAuthenticated = !!user

  return {
    user,
    login,
    logout,
    isAuthenticated,
  }
}
