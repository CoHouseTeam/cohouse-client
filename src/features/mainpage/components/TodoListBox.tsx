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
      <div className="card w-full mx-auto mt-4 bg-base-100 shadow">
        <div className="card-body p-4">
          <div className="flex justify-between items-center mb-3">
            <span className="font-bold text-base-content text-base">오늘의 할일</span>
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={() => setIsModalOpen(true)}
            >
              미이행 내역
            </button>
          </div>
          <ul>
            {todos.map((todo, idx) => (
              <li
                key={todo.text}
                className={`flex items-center mb-2 last:mb-0 text-[15px] ${
                  todo.checked ? 'text-base-300 line-through' : 'text-base-content'
                }`}
              >
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary mr-2"
                  checked={todo.checked}
                  onChange={() => handleToggle(idx)}
                />
                {todo.text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {isModalOpen && <UncompletedTasksModal onClose={() => setIsModalOpen(false)} />}
    </>
  )
}

export default TodoListBox
