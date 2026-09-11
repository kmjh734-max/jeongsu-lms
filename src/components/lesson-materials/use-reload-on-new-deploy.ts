import { useEffect } from "react";

/** 이 탭이 불러온 코드의 커밋(빌드할 때 박힌다). */
const LOADED_SHA = process.env.NEXT_PUBLIC_BUILD_SHA ?? "dev";

/**
 * 새 버전이 배포됐는데 자료함 탭이 예전 코드로 떠 있으면 새로 고친다.
 *
 * Next.js는 한 번 불러온 코드를 탭이 닫힐 때까지 쓴다. 배포 전에 열어 둔 자료함에서
 * 제작 버튼을 누르면 예전 코드가 돌아, 이미 없앤 "자료를 준비하고 있습니다" 빈 탭이
 * 배포 뒤에도 떴다(2026-09-11). 탭으로 돌아올 때와 5분마다 배포된 커밋을 물어 다르면
 * 다시 불러온다. 순서 이동은 바로 저장되므로 잃는 것이 없고, 폴더 이름처럼 입력 중인
 * 칸이 있으면 그때는 건너뛰고 다음 확인 때 본다.
 */
export function useReloadOnNewDeploy() {
  useEffect(() => {
    if (LOADED_SHA === "dev") return;
    let stopped = false;
    const check = async () => {
      if (stopped || document.visibilityState !== "visible") return;
      try {
        const res = await fetch(`/api/lesson-materials/build-id?t=${Date.now()}`, { cache: "no-store" });
        if (!res.ok) return;
        const { sha } = (await res.json()) as { sha?: string };
        const typing = document.activeElement?.matches("input, textarea, select, [contenteditable='true']");
        if (sha && sha !== "dev" && sha !== LOADED_SHA && !stopped && !typing) window.location.reload();
      } catch {
        // 네트워크 오류는 다음 확인 때 다시 본다.
      }
    };
    void check();
    const onVisible = () => void check();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    const timer = window.setInterval(check, 5 * 60 * 1000);
    return () => {
      stopped = true;
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
      window.clearInterval(timer);
    };
  }, []);
}
