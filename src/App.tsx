import { Suspense } from 'react'
import { Routes } from './app/routes'

function App() {
  return (
    <div className="min-h-screen bg-base-100">
      {/* Navigation */}
      <div className="navbar bg-base-200 shadow-lg">
        <div className="navbar-start">
          <div className="dropdown">
            <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
              </svg>
            </div>
            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
              <li><a href="/tasks">할일</a></li>
              <li><a href="/settlements">정산</a></li>
              <li><a href="/board">보드</a></li>
              <li><a href="/mypage">마이페이지</a></li>
            </ul>
          </div>
          <a href="/" className="btn btn-ghost text-xl">CoHouse</a>
        </div>
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1">
            <li><a href="/tasks">할일</a></li>
            <li><a href="/settlements">정산</a></li>
            <li><a href="/board">보드</a></li>
            <li><a href="/mypage">마이페이지</a></li>
          </ul>
        </div>
        <div className="navbar-end">
          <a href="/login" className="btn btn-primary">로그인</a>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Suspense fallback={
          <div className="flex justify-center items-center h-64">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        }>
          <Routes />
        </Suspense>
      </main>
    </div>
  )
}

export default App
