// 안전한 배열 처리 유틸리티

export function safeArray<T>(data: any): T[] {
  if (Array.isArray(data)) {
    return data;
  }
  
  // 객체인 경우 빈 배열 반환
  if (data && typeof data === 'object') {
    console.warn('Expected array but got object:', data);
    return [];
  }
  
  // null, undefined, 기타 모든 경우
  console.warn('Expected array but got:', typeof data, data);
  return [];
}

export function safeMap<T, U>(data: any, callback: (item: T, index: number, array: T[]) => U): U[] {
  const arr = safeArray<T>(data);
  return arr.map(callback);
}

export function safeFilter<T>(data: any, callback: (item: T, index: number, array: T[]) => boolean): T[] {
  const arr = safeArray<T>(data);
  return arr.filter(callback);
}
