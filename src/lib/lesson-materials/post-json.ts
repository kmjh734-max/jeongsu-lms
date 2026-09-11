/**
 * 지문별 생성 요청을 API 라우트로 보낸다.
 *
 * 브라우저에서 부른 서버 액션은 Next.js가 한 번에 하나씩 줄 세워 실행한다
 * (next/dist/client/components/app-router-instance.js의 action queue: 앞 액션이
 * 끝나야 다음 액션을 시작한다). 그래서 지문 8개의 서버 액션을 Promise로 함께 띄워도
 * 실제로는 한 지문씩 돌았다. fetch는 이 줄을 타지 않으므로 요청이 정말로 동시에 간다.
 *
 * 응답이 JSON이 아니면(서버리스 시간 초과 페이지 등) 실패로 돌려준다.
 */
export async function postJson<T extends { ok: boolean }>(
  url: string,
  body: unknown
): Promise<T | { ok: false; message: string }> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "요청을 보내지 못했습니다." };
  }
  try {
    return (await res.json()) as T;
  } catch {
    return {
      ok: false,
      message: `응답을 읽지 못했습니다 (HTTP ${res.status}). 잠시 후 다시 시도해 주세요.`,
    };
  }
}
