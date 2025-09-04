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
