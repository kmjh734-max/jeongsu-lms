const seen = new WeakSet<object>();

/**
 * 서버가 props 로 넘긴 첫 데이터 객체를 이번에 처음 쓰는지.
 * 뒤로 가기처럼 라우터 캐시에서 같은 화면(같은 객체)이 다시 붙으면 false —
 * 그때는 예전처럼 새로 불러와 오래된 값이 남지 않게 한다. (effect 안에서 부른다)
 */
export function isFirstUseOfServerData(data: object): boolean {
  if (seen.has(data)) return false;
  seen.add(data);
  return true;
}
