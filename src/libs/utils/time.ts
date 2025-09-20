// time.ts
export type Meridiem = 'AM' | 'PM'

export function to24h(hour12: number, minute: number, meridiem: Meridiem) {
  if (hour12 < 1 || hour12 > 12) throw new Error('hour12 must be 1~12')
  if (minute < 0 || minute > 59) throw new Error('minute must be 0~59')

  let hour = hour12 % 12 // 12시는 0으로
  if (meridiem === 'PM') hour += 12
  return { hour, minute } // 서버로 보낼 값
}

export function from24h(hour24: number, minute: number) {
  const meridiem: Meridiem = hour24 >= 12 ? 'PM' : 'AM'
  const hour12 = ((hour24 + 11) % 12) + 1 // 0→12, 13→1
  return { hour12, minute, meridiem }
}

export const formatHHmm = (h: number, m: number) =>
  `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`

export const parseHHmm = (s: string) => {
  const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(s)
  if (!m) return null
  return { hour: Number(m[1]), minute: Number(m[2]) }
}
