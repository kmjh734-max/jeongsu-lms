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
