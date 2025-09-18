import { MouseEvent } from 'react'

const NAVER_CLIENT_ID = import.meta.env.VITE_NAVER_CLIENT_ID
const NAVER_CB = import.meta.env.VITE_NAVER_CALLBACK_PATH

export default function NaverLoginButton() {
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    const redirectUri = `${window.location.origin}${NAVER_CB}`
    const state = Math.random().toString(36).substring(2, 15)
    const naverAuthUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&view=web`

    // TEMP debug (do not remove anything else, only add these logs)
    console.log('[NaverAuth] NAVER_CLIENT_ID =', NAVER_CLIENT_ID)
    console.log('[NaverAuth] redirectUri =', redirectUri)  // must be http://localhost:3000/oauth/callback/naver
    console.log('[NaverAuth] authorize URL =', naverAuthUrl)
    console.log('[NaverAuth] VITE_NAVER_CLIENT_ID env =', import.meta.env.VITE_NAVER_CLIENT_ID)

    window.location.href = naverAuthUrl
  }

  return (
    <button 
      type="button"
      onClick={handleClick}
      className="btn w-full h-12 rounded-lg transition-all duration-200 text-white border-0 hover:scale-[1.02] hover:opacity-90"
      style={{ backgroundColor: '#03C75A' }}
    >
      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16.273 12.845 7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845Z"/>
      </svg>
      네이버로 로그인
    </button>
  )
}
