export const daysMap = {
  일: 'SUNDAY',
  월: 'MONDAY',
  화: 'TUESDAY',
  수: 'WEDNESDAY',
  목: 'THURSDAY',
  금: 'FRIDAY',
  토: 'SATURDAY',
} as const

export type KorDay = keyof typeof daysMap

export const daysKr: KorDay[] = ['일', '월', '화', '수', '목', '금', '토']

export function toEngDay(korDay: KorDay): string {
  return daysMap[korDay]
}

export function toKorDay(engDay: string): KorDay | undefined {
  const entries = Object.entries(daysMap) as [KorDay, string][]
  const found = entries.find(([, v]) => v === engDay)
  return found ? found[0] : undefined
}

export function getDateOfThisWeek(dayOfWeekStr: string): string {
  // dayOfWeekStr: 영어 대문자 요일 (e.g. "MONDAY")
  const dayMap: Record<string, number> = {
    SUNDAY: 0,
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
  }
  const targetDay = dayMap[dayOfWeekStr.toUpperCase()]
  if (targetDay === undefined) return ''

  const now = new Date()
  const currentDay = now.getDay() // 0(일)~6(토)
  const diff = targetDay - currentDay
  const targetDate = new Date(now)
  targetDate.setDate(now.getDate() + diff)
  return targetDate.toISOString().slice(0, 10) // YYYY-MM-DD 형식 반환
}
