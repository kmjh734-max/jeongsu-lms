/**
 * 표 문항(표를 보면서 고르기·표 불일치)의 표 자체를 보는 규칙.
 *
 * 선생님이 3회차를 받아 보고 짚은 흠(2026-09-18): 표의 행을 학생 이름으로 부르고
 * (Name: Bora / Name: Jaehyun …), 운동화 표에 영화표 장수·음료 쿠폰처럼 그 물건과
 * 상관없는 열이 들어갔다. 사람이 읽어야만 보이던 흠이라 규칙으로 잡는다.
 */
import type { GeneratedListeningQuestion, ListeningTableData } from "@/lib/listening/types";

/** 표의 한 칸을 "열이름: 값" 으로 끊어 본다 */
function columnsOf(value: string): Array<{ name: string; value: string }> {
  return String(value ?? "")
    .split("/")
    .map((part) => {
      const i = part.indexOf(":");
      if (i < 0) return null;
      return { name: part.slice(0, i).trim(), value: part.slice(i + 1).trim() };
    })
    .filter(Boolean) as Array<{ name: string; value: string }>;
}

/** 사람 이름 열 (표의 행을 사람으로 부르면 상품표가 아니라 명단이 된다) */
const PERSON_COLUMN = /^(name|이름|학생|사람|owner|student)$/i;

/** 그 물건의 속성이 아니라 딸려 오는 혜택·행사인 열 — 표로 고르는 조건이 될 수 없다 */
const OFF_TOPIC_COLUMN =
  /(movie ticket|영화표|coupon|쿠폰|gift card|상품권|event|이벤트|추첨|사은품)/i;

export function tableRuleProblems(q: GeneratedListeningQuestion): string[] {
  const table = (q.table_data ?? null) as ListeningTableData | null;
  if (!table || !Array.isArray(table.rows) || table.rows.length === 0) return [];
  const out: string[] = [];

  const rows = table.rows.map((r) => columnsOf(String(r?.value ?? "")));
  const names = rows[0]?.map((c) => c.name) ?? [];

  for (const name of names) {
    if (PERSON_COLUMN.test(name)) {
      out.push(
        `table_person_column|표에 사람 이름 열(${name})이 있다. 표의 행은 ①~⑤ 번호나 상품 이름으로 구분하고, 열에는 그 물건의 속성(크기·무게·재질·가격·기능 등)만 쓴다.`
      );
      break;
    }
  }
  for (const name of names) {
    if (OFF_TOPIC_COLUMN.test(name)) {
      out.push(
        `table_off_topic_column|표에 그 물건과 상관없는 열(${name})이 있다. 열은 고르는 물건 자체의 속성만으로 짠다.`
      );
      break;
    }
  }

  // 행마다 열 구성이 같아야 견줄 수 있다
  const shapes = new Set(rows.map((r) => r.map((c) => c.name.toLowerCase()).join("|")));
  if (rows.every((r) => r.length > 0) && shapes.size > 1) {
    out.push("table_shape|표의 행마다 열 구성이 다르다. 모든 행이 같은 열을 같은 차례로 갖게 한다.");
  }

  // 두 행이 모든 칸에서 같으면 답이 갈리지 않는다
  const keys = rows.map((r) => r.map((c) => `${c.name}=${c.value}`.toLowerCase()).join("|"));
  for (let i = 0; i < keys.length; i++) {
    for (let j = i + 1; j < keys.length; j++) {
      if (keys[i] && keys[i] === keys[j]) {
        out.push(`table_duplicate_row|표의 ${i + 1}행과 ${j + 1}행이 똑같다. 행마다 조건을 하나씩 다르게 한다.`);
        i = keys.length;
        break;
      }
    }
  }

  return out;
}
