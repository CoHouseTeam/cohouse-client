import React, { useState, useEffect } from 'react'
import UncompletedTasksModal from './UncompletedTasksModal'
import { TodoItem, TodoListBoxProps } from '../../../types/main.ts'
import { getAssignments, updateAssignment } from '../../../libs/api/tasks.ts'

const TodoListBox = React.memo(({ todos, groupId, memberId }: TodoListBoxProps) => {
  const [localTodos, setLocalTodos] = useState<TodoItem[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  // status에 따라 checked 상태로 초기화
  useEffect(() => {
    setLocalTodos(
      todos.map((todo) => ({
        ...todo,
        checked: todo.status === 'COMPLETED',
      }))
    )
  }, [todos])

  // 할 일 업데이트
  async function refetchTodos() {
    if (groupId && memberId) {
      const updated = await getAssignments({ groupId, memberId })
      setLocalTodos(
        updated.map((todo) => ({
          ...todo,
          checked: todo.status === 'COMPLETED',
        }))
      )
    }
  }

  // 체크박스 토글 처리
  const handleToggle = async (index: number) => {
    const todo = localTodos[index]
    if (!todo.assignmentId) return

    const newChecked = !todo.checked

    setLocalTodos((prev) => prev.map((t, i) => (i === index ? { ...t, checked: newChecked } : t)))

    try {
      await updateAssignment(todo.assignmentId, {
        status: newChecked ? 'COMPLETED' : 'PENDING',
      })
      await refetchTodos()
    } catch (error) {
      setLocalTodos((prev) =>
        prev.map((t, i) => (i === index ? { ...t, checked: !newChecked } : t))
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
        {localTodos.length === 0 ? (
          <p className="text-left text-base-content text-[16px]">오늘 일정이 없어요</p>
        ) : (
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
                  onChange={() => handleToggle(idx)}
                  style={{ accentColor: todo.checked ? '#5C5C5C' : '#fff' }}
                />
                {todo.category || '할 일'}
              </li>
            ))}
          </ul>
        )}
      </div>

      {isModalOpen && (
        <UncompletedTasksModal
          onClose={() => setIsModalOpen(false)}
          groupId={groupId}
          memberId={memberId}
        />
      )}
    </>
  )
})

export default TodoListBox
