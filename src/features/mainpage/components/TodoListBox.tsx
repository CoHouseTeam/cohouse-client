import { useState } from 'react'
import UncompletedTasksModal from './UncompletedTasksModal'
import { Todo } from '../../../types/main.ts'

const initialTodos: Todo[] = [
  { text: '설거지', checked: false },
  { text: '분리수거', checked: true },
]

const TodoListBox = () => {
  const [todos, setTodos] = useState<Todo[]>(initialTodos)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleToggle = (idx: number) => {
    setTodos((prev) =>
      prev.map((todo, i) => (i === idx ? { ...todo, checked: !todo.checked } : todo))
    )
  }

  return (
    <>
      <div className="w-full rounded-lg p-4 bg-[#e3e3e3]">
        <div className="flex justify-between items-center mb-3">
          <span className="text-base-content text-[20px]">오늘의 할일</span>
          <button
            type="button"
            className="btn btn-md btn-outline px-2 !py-0 !min-h-0 !h-7 bg-white rounded-lg"
            onClick={() => setIsModalOpen(true)}
          >
            미이행 내역
          </button>
        </div>
        <ul>
          {todos.map((todo, idx) => (
            <li
              key={todo.text}
              className={`flex items-center mb-2 last:mb-0 text-[16px] ${
                todo.checked ? 'text-base-300 line-through' : 'text-base-content'
              }`}
              style={todo.checked ? { color: '#5C5C5C' } : undefined}
            >
              <input
                type="checkbox"
                className={`checkbox checkbox-sm mr-2 
                  ${todo.checked ? 'bg-[#5C5C5C] border-[#5C5C5C]' : 'bg-white border-[#5C5C5C]'}
                `}
                checked={todo.checked}
                onChange={() => handleToggle(idx)}
                style={{ accentColor: todo.checked ? '#5C5C5C' : '#fff' }}
              />
              {todo.text}
            </li>
          ))}
        </ul>
      </div>

      {isModalOpen && <UncompletedTasksModal onClose={() => setIsModalOpen(false)} />}
    </>
  )
}

export default TodoListBox
