import { SlashCircle } from 'react-bootstrap-icons'

interface ErrorCardProps {
  message: string
}

export default function ErrorCard({ message }: ErrorCardProps) {
  return (
    <div className="flex flex-col justify-center items-center mt-4">
      <SlashCircle size={30} className="text-neutral-400" />

      <p className="text-sm font-medium text-neutral-400 text-center p-3">{message}</p>
    </div>
  )
}
