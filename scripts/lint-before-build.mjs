/**
 * 빌드 전에 린트를 돌린다 (내 컴퓨터에서만).
 *
 * 2026-09-28: 정규식에 제어 문자를 쓴 코드가 내 컴퓨터의 `next build`는 그냥 지나갔는데
 * 배포에서 no-control-regex로 막혀 세 건이 올라가지 못했다. 배포에서만 걸리면 알아채기가
 * 늦으므로, 올리기 전에 같은 검사를 여기서 먼저 한다.
 *
 * 배포(Vercel)에서는 빌드가 이미 린트를 하므로 건너뛴다 — 두 번 돌리면 그만큼 느려진다.
 * 경고는 막지 않는다(이미 쌓여 있다). 오류만 막는다.
 */
import { spawnSync } from "node:child_process";

if (process.env.VERCEL || process.env.CI) {
  console.log("배포 환경 — 린트는 빌드가 한다. 건너뜀.");
  process.exit(0);
}

const res = spawnSync("npx", ["next", "lint"], {
  stdio: "inherit",
  shell: process.platform === "win32",
});

if (res.status !== 0) {
  console.error("\n린트에서 막혔습니다. 고치고 다시 빌드해 주세요(배포도 같은 곳에서 막힙니다).");
  process.exit(res.status ?? 1);
}

/*
 * 검수 규칙이 살아 있는지도 여기서 본다.
 *
 * 2026-10-01: 「보기 다섯이 같은 말로 시작하면 버린다」가 보기를 문자열로 읽어 한 번도
 * 걸리지 않았다. 규칙이 죽으면 문항은 멀쩡해 보이고 검수는 늘 통과하니 아무도 모른다.
 * 그래서 빌드 전에 규칙마다 「걸려야 하는 보기」와 「걸리면 안 되는 보기」를 확인한다.
 * 배포에서는 돌지 않으므로(위에서 빠져나간다) 배포가 느려지거나 막힐 일은 없다.
 */
const rules = spawnSync("npx", ["tsx", "scripts/check-rules.mts"], {
  stdio: "inherit",
  shell: process.platform === "win32",
});

if (rules.status !== 0) {
  console.error("\n검수 규칙이 뜻대로 움직이지 않습니다. 고치고 다시 빌드해 주세요.");
  process.exit(rules.status ?? 1);
}
