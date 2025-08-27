import { SlashCircle } from 'react-bootstrap-icons'

export default function ErrorCard() {
  return (
    <div className="flex flex-col justify-center items-center mt-4">
      <SlashCircle size={30} className="text-neutral-400" />

      <p className="text-sm font-medium text-neutral-400 text-center p-3">에러가 발생했어요</p>
    </div>
  )
}
