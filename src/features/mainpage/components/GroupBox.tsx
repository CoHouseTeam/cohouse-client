const GroupBox = () => {
  return (
    <div className="card bg-base-100 shadow max-w-md mx-auto my-4">
      <div className="card-body items-center text-center">
        <p className="text-gray-700 mb-4 text-base">아직 소속된 그룹이 없어요</p>
        <button className="btn btn-primary">그룹 생성하기</button>
      </div>
    </div>
  )
}

export default GroupBox
