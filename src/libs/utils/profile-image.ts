// 서버가 내려주는 기본 프로필 이미지
export const DEFAULT_PROFILE_URL =
  'https://cohouse-bucket.s3.ap-northeast-2.amazonaws.com/members/default/PersonCircle.png'

// 기본 이미지 여부 판별
export function isDefaultProfileUrl(url?: string | null): boolean {
  if (!url) return false

  return url === DEFAULT_PROFILE_URL || url.endsWith('/members/default/PersonCircle.png')
}
