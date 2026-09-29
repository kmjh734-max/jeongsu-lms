/**
 * 해석에서 떨어져 나온 조사를 앞말에 붙인다.
 *
 * 선생님과 함께 자료를 훑어 보니(2026-09-29), 모의고사 지문 1,400개 가운데
 * 869개(62%)의 한국어 해석에서 조사가 홀로 떨어져 있었다. 「최적 의」·「비율 을」·
 * 「관점 에서」처럼 PDF에서 줄이 바뀌던 자리가 공백으로 들어온 자국이다.
 * 학생이 받는 자료에 그대로 실린다.
 *
 * 조사는 앞말에 붙여 쓰는 것이 맞춤법이므로, 홀로 선 조사는 앞말에 붙인다.
 * 다만 영문·숫자 뒤의 조사는 원래 띄어 쓰기도 하므로(IAU 의 → IAU의로 붙이면
 * 도리어 어색하다) 앞말이 한글로 끝날 때만 붙인다.
 */

/** 홀로 설 수 없는 조사만 둔다 — 「이·그·만·도·보다·밖에」처럼 홀로도 쓰이는 것은 뺀다. */
const ORPHAN_PARTICLES = new Set(
  "은 는 을 를 의 에 로 으로 에서 에게 에게서 부터 까지 처럼 마다 조차 이라고 라고 이라는 라는 이며 하며".split(
    " "
  )
);

/** 한글로만 이루어졌는지 (문장부호는 뒤에 붙어 있어도 된다) */
function bareHangul(token: string): string | null {
  if (/[A-Za-z0-9]/.test(token)) return null;
  const bare = token.replace(/[^가-힣]/g, "");
  return bare || null;
}

/** 한 줄 안에서 홀로 선 조사를 앞말에 붙인다. 줄바꿈은 그대로 둔다. */
function joinOrphanParticlesInLine(line: string): string {
  if (!line.includes(" ")) return line;
  const parts = line.split(" ");
  const out: string[] = [];
  for (const part of parts) {
    if (!part) {
      out.push(part);
      continue;
    }
    const prev = out.length ? out[out.length - 1]! : "";
    const bare = bareHangul(part);
    if (
      bare &&
      ORPHAN_PARTICLES.has(bare) &&
      /[가-힣]$/.test(prev) // 앞말이 한글로 끝날 때만
    ) {
      out[out.length - 1] = prev + part;
      continue;
    }
    out.push(part);
  }
  return out.join(" ");
}

export function joinOrphanParticles(text: string | null | undefined): string {
  const value = String(text ?? "");
  if (!value) return value;
  return value.split("\n").map(joinOrphanParticlesInLine).join("\n");
}
