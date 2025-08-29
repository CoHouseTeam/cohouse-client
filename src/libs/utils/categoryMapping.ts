import { SettlementCategory } from '../../types/settlement'

// 카테고리 변환 함수
export function fromCategory(category: SettlementCategory): string {
  const map: Record<SettlementCategory, string> = {
    FOOD: '식비',
    DAILY_SUPPLIES: '생활용품',
    CULTURE: '문화생활',
    ETC: '기타',
  }
  return map[category] ?? '기타'
}

export function toCategory(input: string): SettlementCategory {
  const map: Record<string, SettlementCategory> = {
    식비: 'FOOD',
    생활용품: 'DAILY_SUPPLIES',
    문화생활: 'CULTURE',
    기타: 'ETC',
  }
  return map[input] ?? 'ETC'
}
