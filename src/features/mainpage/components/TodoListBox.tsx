import { useState, useEffect } from 'react'
import UncompletedTasksModal from './UncompletedTasksModal'
import { TodoItem } from '../../../types/main.ts'
import { updateAssignment } from '../../../libs/api/tasks.ts'

interface TodoListBoxProps {
  todos: TodoItem[]
}

const TodoListBox = ({ todos }: TodoListBoxProps) => {
  const [localTodos, setLocalTodos] = useState<TodoItem[]>([])

  useEffect(() => {
    setLocalTodos(todos)
  }, [todos])

  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleToggle = async (index: number) => {
    const todo = localTodos[index]
    if (!todo.assignmentId) {
      console.warn('업무 ID가 없습니다.')
      return
    }

    const newChecked = !todo.checked
    setLocalTodos((prevTodos) =>
      prevTodos.map((t, i) => (i === index ? { ...t, checked: newChecked } : t))
    )

    try {
      const newStatus = newChecked ? 'COMPLETED' : 'PENDING'
      await updateAssignment(todo.assignmentId, { status: newStatus })
    } catch (error) {
      console.error('업무 상태 업데이트 실패', error)
      // 실패 시 상태 되돌리기
      setLocalTodos((prevTodos) =>
        prevTodos.map((t, i) => (i === index ? { ...t, checked: !newChecked } : t))
      )
      alert('업무 상태 업데이트에 실패했습니다.')
    }
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
          {localTodos.map((todo, idx) => (
            <li
              key={`${todo.assignmentId ?? 'todo'}-${idx}`}
              className={`flex items-center mb-2 last:mb-0 text-[16px] ${
                todo.checked ? 'text-base-300 line-through' : 'text-base-content'
              }`}
              style={todo.checked ? { color: '#5C5C5C' } : undefined}
            >
              <input
                type="checkbox"
                className={`checkbox checkbox-sm mr-2 ${
                  todo.checked ? 'bg-[#5C5C5C] border-[#5C5C5C]' : 'bg-white border-[#5C5C5C]'
                }`}
                checked={todo.checked}
                onChange={() => handleToggle(idx)} // 상태 변경 시 API 호출 포함
                style={{ accentColor: todo.checked ? '#5C5C5C' : '#fff' }}
              />
              {todo.category || '할 일'}
            </li>
          ))}
        </ul>
      </div>

      {isModalOpen && <UncompletedTasksModal onClose={() => setIsModalOpen(false)} />}
    </>
  )
}

export default TodoListBox
