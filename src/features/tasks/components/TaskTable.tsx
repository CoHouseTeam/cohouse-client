import React, { useEffect, useState } from 'react'
import DaySelectModal from './DaySelectModal'
import { ChevronRight, PlusCircleFill } from 'react-bootstrap-icons'
import { Assignment, TaskTableProps, Template } from '../../../types/tasks'
import { members } from '../../../mocks/db/tasks'
import { daysKr, toEngDay } from '../../../libs/utils/dayMapping'
import { createTaskTemplate, getTaskTemplates, updateTaskTemplate } from '../../../libs/api/tasks'
import { fetchMyGroups } from '../../../libs/api/groups'

const days = ['일', '월', '화', '수', '목', '금', '토']

const getMemberAvatar = (groupMemberId: number) => members[groupMemberId]?.profileUrl || ''

const initialEmptyTemplates: Template[] = [
  { templateId: -1, groupId: -1, category: '', createdAt: '', updatedAt: '' },
  { templateId: -2, groupId: -1, category: '', createdAt: '', updatedAt: '' },
  { templateId: -3, groupId: -1, category: '', createdAt: '', updatedAt: '' },
]

const TaskTable: React.FC<TaskTableProps> = ({ assignments }) => {
  const [openModal, setOpenModal] = useState<number | null>(null)
  const [templates, setTemplates] = useState<Template[]>([])
  const [editValues, setEditValues] = useState<Record<number, string>>({})
  const [groupId, setGroupId] = useState<number | null>(null)

  // 그룹 ID를 최초에 받아오기
  useEffect(() => {
    const loadGroupId = async () => {
      try {
        const data = await fetchMyGroups()
        setGroupId(data.groupId ?? data.id ?? null)
      } catch (error) {
        console.error('그룹 정보 로드 실패', error)
        setGroupId(null)
      }
    }
    loadGroupId()
  }, [])

  // 그룹ID 받아온 후에 템플릿 조회
  useEffect(() => {
    if (groupId !== null) {
      fetchTemplates(groupId)
    }
  }, [groupId])

  const fetchTemplates = async (gid: number) => {
    try {
      const data = await getTaskTemplates(gid)
      if (Array.isArray(data) && data.length === 0) {
        setTemplates(initialEmptyTemplates.map((t) => ({ ...t, groupId: gid })))
      } else {
        setTemplates(data)
      }
    } catch (error) {
      setTemplates(initialEmptyTemplates.map((t) => ({ ...t, groupId: gid })))
    }
  }

  const handleEditChange = (templateId: number, value: string) => {
    setEditValues((prev) => ({ ...prev, [templateId]: value }))
  }

  const handleEditSubmit = async (template: Template) => {
    const { templateId } = template
    const edited = editValues[templateId]
    if (edited !== undefined && edited.trim() !== '' && groupId !== null) {
      try {
        if (templateId < 0) {
          // 임시 템플릿 → 새 템플릿 생성
          const newTemplate = await createTaskTemplate({
            groupId,
            category: edited,
            repeatDays: [],
            randomEnabled: false,
          })
          setTemplates((prev) => prev.map((t) => (t.templateId === templateId ? newTemplate : t)))
        } else {
          await updateTaskTemplate(templateId, { category: edited })
          setTemplates((prev) =>
            prev.map((t) => (t.templateId === templateId ? { ...t, category: edited } : t))
          )
        }
      } catch (error) {
        console.error('템플릿 저장 실패', error)
      }
    }
    setEditValues((prev) => {
      const cp = { ...prev }
      delete cp[templateId]
      return cp
    })
  }

  const handleAddTask = async () => {
    if (groupId === null) return
    try {
      const newTemplate = await createTaskTemplate({
        groupId,
        category: '',
        repeatDays: [],
        randomEnabled: false,
      })
      setTemplates((prev) => [...prev, newTemplate])
    } catch (error) {
      console.error('템플릿 생성 실패', error)
    }
  }

  const toggleModal = (rowIdx: number) => {
    setOpenModal((prev) => (prev === rowIdx ? null : rowIdx))
  }

  const findAssignmentForCell = (templateId: number, dayIdx: number): Assignment | undefined => {
    const korDay = daysKr[dayIdx]
    const engDay = toEngDay(korDay)
    return assignments.find((a) => a.templateId === templateId && a.dayOfWeek === engDay)
  }

  // groupId가 로딩 중일 땐 로딩 UI 표시 (최초 렌더링 방지)
  if (groupId === null) return <div>그룹 정보를 불러오는 중...</div>

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
          {Array.isArray(templates) &&
            templates.map((template, rowIdx) => (
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
                      className="bbt text-gray-400 focus:text-black z-20 -ml-3"
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
                {days.map((_, dayIdx) => {
                  const assignment = findAssignmentForCell(template.templateId, dayIdx)
                  const avatarUrl =
                    assignment?.groupMemberId !== undefined
                      ? getMemberAvatar(assignment.groupMemberId)
                      : ''
                  return (
                    <td
                      key={dayIdx}
                      className="border-t border-gray-300 p-1"
                      style={{
                        borderRight: dayIdx === days.length - 1 ? undefined : '1px solid #D1D5DB',
                      }}
                    >
                      {avatarUrl && (
                        <img
                          src={avatarUrl}
                          alt="profile"
                          className="w-8 h-8 rounded-full mx-auto"
                        />
                      )}
                    </td>
                  )
                })}
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
