interface ToggleProps {
  checked: boolean
  onChange: (next: boolean) => void
}

export default function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex border-2 border-gray-200 shadow-sm rounded-full w-9 h-5 overflow-hidden 
                transition-colors duration-300 ease-in-out
                ${checked ? 'border-neutral bg-neutral' : 'bg-gray-200'}`}
    >
      <span
        className={`block w-4 h-4 rounded-full shadow-xl bg-white transition-transform duration-300 ease-in-out
                  ${checked ? 'translate-x-4 ' : 'translate-x-0'}`}
      />
    </button>
  )
}
