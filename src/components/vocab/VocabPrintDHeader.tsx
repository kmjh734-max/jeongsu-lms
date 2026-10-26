/** 단어장 속지 공통 머리글(D안): 배지 · 제목 · 이름/날짜/점수 칸 */

/** "EngCore 중학필수 Day3 최빈출 단어 ★★★" → 제목 "중학필수 Day3", 꼬리 "최빈출 단어 ★★★" */
export function splitPrintTitle(title: string): { main: string; tag: string } {
  const clean = title.replace(/^\s*EngCore\s*/i, "").trim();
  const m = clean.match(/^(.*?Day\s*\d+)\s+(.+)$/i);
  return m ? { main: m[1]!.trim(), tag: m[2]!.trim() } : { main: clean, tag: "" };
}

export function VocabPrintDHeader({
  badge,
  title,
  tag,
  fields = ["name", "date"],
  scoreTotal,
  studentName,
  aside,
  dark = false,
}: {
  badge: string;
  title: string;
  tag?: string;
  fields?: ("name" | "date")[];
  /** 시험지면 문항 수(점수 칸에 쓴다) */
  scoreTotal?: number;
  /** 뽑기 전에 적어 둔 학생 이름(비우면 빈 줄) */
  studentName?: string;
  /** 오른쪽 칸 대신 보여 줄 글(정답지의 "선생님용" 등) */
  aside?: string;
  dark?: boolean;
}) {
  return (
    <header className="vd-head">
      <div className="vd-head-left">
        <span className={`vd-badge${dark ? " vd-badge--dark" : ""}`}>{badge}</span>
        <h2 className="vd-title">{title}</h2>
        {tag ? <span className="vd-tag">{tag}</span> : null}
      </div>
      {aside ? (
        <span className="vd-aside">{aside}</span>
      ) : (
        <div className="vd-head-right">
          {fields.includes("name") ? (
            <span className="vd-field vd-field--name">
              이름 <i>{studentName?.trim() || null}</i>
            </span>
          ) : null}
          {fields.includes("date") ? (
            <span className="vd-field vd-field--date">
              날짜 <i />
            </span>
          ) : null}
          {scoreTotal ? (
            <span className="vd-score">
              <i />/ {scoreTotal}
            </span>
          ) : null}
        </div>
      )}
    </header>
  );
}
