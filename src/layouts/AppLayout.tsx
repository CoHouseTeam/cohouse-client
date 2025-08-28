import { PropsWithChildren } from 'react'
import NavBar from '../components/NavBar'

export default function AppLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-dvh">
      <NavBar unreadCount={2}>
        <main className="p-4 flex-1">{children}</main>
      </NavBar>
    </div>
  )
}
