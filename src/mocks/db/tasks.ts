import { RepeatDay, Template } from '../../types/tasks'

export const templates: Template[] = [
  { templateId: 1, groupId: 1, category: '청소', createdAt: '2025-08-05T10:00:00', updatedAt: '' },
  {
    templateId: 2,
    groupId: 1,
    category: '설거지',
    createdAt: '2025-08-05T10:00:00',
    updatedAt: '',
  },
  {
    templateId: 3,
    groupId: 1,
    category: '분리수거',
    createdAt: '2025-08-05T10:00:00',
    updatedAt: '',
  },
]

export const repeatDays: RepeatDay[] = [
  { repeatDayId: 1, templateId: 1, dayOfWeek: 'MONDAY' },
  { repeatDayId: 2, templateId: 2, dayOfWeek: 'THURSDAY' },
  { repeatDayId: 3, templateId: 3, dayOfWeek: 'FRIDAY' },
]
