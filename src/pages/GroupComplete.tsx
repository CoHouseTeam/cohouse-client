import { useNavigate } from 'react-router-dom'
import { HouseCheck } from 'react-bootstrap-icons'

const GroupComplete = () => {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col justify-center items-center bg-white">
      <div className="text-center">
        <h2 className="font-bold text-2xl mt-24 mb-6">
          그룹 생성이
          <br />
          완료되었습니다.
        </h2>
        <HouseCheck className="mx-auto" size={90} strokeWidth={1.5} />
      </div>
      <button
        className="mt-14 bg-[#242424] text-white text-base font-medium rounded-lg px-8 py-3"
        onClick={() => navigate('/')}
      >
        메인페이지
      </button>
    </div>
  )
}

export default GroupComplete
