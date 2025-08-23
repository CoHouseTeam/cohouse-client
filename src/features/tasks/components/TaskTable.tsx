import React, { useEffect, useState } from 'react'
import DaySelectModal from './DaySelectModal'
import { ChevronRight, PlusCircleFill } from 'react-bootstrap-icons'
import axios from 'axios'
import { Template } from '../../../types/tasks'
import { daysKr } from '../../../libs/utils/dayMapping'

const days = ['일', '월', '화', '수', '목', '금', '토']

const initialEmptyTemplates: Template[] = [
  { templateId: -1, groupId: 1, category: '', createdAt: '', updatedAt: '' },
  { templateId: -2, groupId: 1, category: '', createdAt: '', updatedAt: '' },
  { templateId: -3, groupId: 1, category: '', createdAt: '', updatedAt: '' },
]

const TaskTable: React.FC = () => {
  const [openModal, setOpenModal] = useState<number | null>(null)
  const [templates, setTemplates] = useState<Template[]>([])
  const [editValues, setEditValues] = useState<Record<number, string>>({})

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const res = await axios.get<Template[]>('/tasks/templates')
      if (res.data.length === 0) {
        // 서버에 데이터 없으면 기본 3줄 유지
        setTemplates(initialEmptyTemplates)
      } else {
        setTemplates(res.data)
      }
    } catch (error) {
      console.error('템플릿 목록 조회 실패', error)
    }
  }

  const handleEditChange = (templateId: number, value: string) => {
    setEditValues((prev) => ({ ...prev, [templateId]: value }))
  }

  const handleEditSubmit = async (template: Template) => {
    const { templateId, category } = template
    const edited = editValues[templateId]
    if (edited !== undefined && edited !== category && edited.trim() !== '') {
      try {
        await axios.put(`/tasks/templates/${templateId}`, { category: edited })
        setTemplates((prev) =>
          prev.map((t) => (t.templateId === templateId ? { ...t, category: edited } : t))
        )
      } catch (error) {
        console.error('템플릿 수정 실패', error)
      }
    }
    setEditValues((prev) => {
      const cp = { ...prev }
      delete cp[templateId]
      return cp
    })
  }

  const handleAddTask = async () => {
    try {
      const newTemplate = {
        groupId: 1,
        category: '',
      }
      const res = await axios.post<Template>('/tasks/templates', newTemplate)
      setTemplates((prev) => [...prev, res.data])
    } catch (error) {
      console.error('템플릿 생성 실패', error)
    }
  }

  const toggleModal = (rowIdx: number) => {
    setOpenModal((prev) => (prev === rowIdx ? null : rowIdx))
  }

  return (
    <div className="relative w-full">
      <table className="w-full table-fixed text-center border border-gray-300">
        <thead>
          <tr>
            <th className="bg-base-200 border-b border-gray-300 px-1 py-2 text-xs w-[28%]"></th>
            {days.map((day, idx) => (
              <th
                key={idx}
                className="bg-base-200 border-b border-l border-gray-300 whitespace-nowrap px-1 py-2 text-xs"
              >
                {day}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {templates.map((template, rowIdx) => (
            <tr key={template.templateId}>
              <td
                className={
                  'bg-base-100 border-gray-300 px-1 py-2 text-xs font-normal relative flex items-center gap-4 border-r' +
                  (rowIdx === 0 ? '' : ' border-t')
                }
                style={{ borderRight: '1px solid #D1D5DB' }}
              >
                <input
                  type="text"
                  className="input input-xs w-full"
                  value={
                    editValues[template.templateId] !== undefined
                      ? editValues[template.templateId]
                      : template.category
                  }
                  onChange={(e) => handleEditChange(template.templateId, e.target.value)}
                  onBlur={() => handleEditSubmit(template)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      ;(e.target as HTMLInputElement).blur()
                    }
                  }}
                />

                <div className="relative flex items-center">
                  <button
                    type="button"
                    className="text-gray-400 focus:text-black z-20 -ml-3"
                    onClick={() => toggleModal(rowIdx)}
                  >
                    <ChevronRight
                      size={16}
                      className={openModal === rowIdx ? 'scale-x-[-1] transition-transform' : ''}
                      style={openModal === rowIdx ? { transform: 'scaleX(-1)' } : undefined}
                    />
                  </button>
                  {openModal === rowIdx && (
                    <DaySelectModal
                      days={daysKr}
                      templateId={template.templateId}
                      onClose={() => setOpenModal(null)}
                      positionClass="left-full -top-3 ml-1"
                    />
                  )}
                </div>
              </td>
              {days.map((_, colIdx) => (
                <td
                  key={colIdx}
                  className="border-t border-gray-300 p-1"
                  style={{
                    borderRight: colIdx === days.length - 1 ? undefined : '1px solid #D1D5DB',
                  }}
                />
              ))}
            </tr>
          ))}
          <tr>
            <td colSpan={days.length + 1} className="bg-white border-t border-gray-300 p-0">
              <div className="flex justify-center items-center py-2.5">
                <button
                  type="button"
                  onClick={handleAddTask}
                  className="bg-transparent border-none p-0 m-0"
                  style={{ cursor: 'pointer', lineHeight: 1 }}
                >
                  <PlusCircleFill size={18} color="gray" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default TaskTable
