/**
 * 옛 유형 모듈(typeN 프롬프트)이 없는 새 중등 유형의 생성 규칙 — 유형 카탈로그(type-catalog.ts)에서 만든다.
 * 예시 상황·대사는 모두 새로 지은 것이다(교재·기출 문장을 넣지 않는다).
 */
import { COPYRIGHT_BLOCK } from "@/lib/listening/prompts/commonPrompt";
import {
  getTypeDef,
  typeCode,
  type ListeningTypeKey,
} from "@/lib/listening/type-catalog";

/** 유형별 JSON 필드·형식 규칙 (카탈로그 문구에 더해) */
const EXTRA_RULES: Partial<Record<ListeningTypeKey, string>> = {
  M_NOT_MENTIONED_DIALOGUE: `
- mention_plan 필수: { "topic": "", "choice_items": [{ "no": 1, "label": "날짜", "mentioned": true, "evidence": "대본 근거 영어 구절" }, … 5개], "unmentioned_no": 정답 번호, "unmentioned_label": "" }.
- 언급된 네 항목은 두 사람이 묻고 답하며 나온다(한 사람이 목록처럼 읽지 않는다). 빠진 항목은 대본에 간접적으로도 나오지 않는다.
- choices = mention_plan.choice_items의 label 순서 그대로(한국어 정보 항목 2~6자: 날짜·장소·참가비·준비물·신청 방법·대상 …).`,
  M_TOPIC_MONO: `
- main_content(정답 한국어 명사구), content_clues(대본 근거 영어 구절 2~3개) 필수.
- 담화 화자는 M 또는 W 한 명(선생님·방송 담당·관리인·가이드 등). 인사로 시작해 핵심 안내를 하고 세부 1~2개를 덧붙인다.
- 선택지는 「… 안내」「… 방법」「… 변경」「… 모집」처럼 끝이 비슷한 명사구 5개.`,
  M_DID: `
- target_person(남자/여자), target_time(지시문 시점: 어제/지난 주말/오늘 아침 …), planned_action(= 정답인 실제로 한 일, 한국어), mentioned_other_actions[{ "action": "", "reason": "왜 오답인지" }] 필수.
- 대본은 과거 시제. 대상 화자가 하려다 못 한 일(날씨·일정 때문에 취소), 상대가 한 일, 앞으로 할 일이 오답으로 나온다.
- 지시문 예: 대화를 듣고, 여자가 지난 주말에 한 일로 가장 적절한 것을 고르시오.`,
  M_SPECIFIC: `
- target_person 필수. 지시문의 ○○(가져올 물건/구입할 물품/선택할 …)이 무엇을 묻는지 분명하게 쓴다.
- 후보 3~4개가 대본에 나오고 이유와 함께 하나만 남는다. 선택지는 같은 범주의 한국어 명사(구) 5개.`,
  M_MISMATCH_DIALOGUE: `
- 지시문 ○○에는 대화 속 대상(행사·여행·수업 등)을 한국어로 넣는다 (예: 대화를 듣고, 과학 캠프에 대한 내용과 일치하지 않는 것을 고르시오.).
- 한 사람이 묻고 다른 사람이 설명하며 사실 다섯 개(일시·장소·대상·활동·준비물 등)가 대본 순서대로 나온다.
- 선택지 5개는 대본 순서대로 쓴 한국어 서술문(「…이다」「…한다」). 정답만 한 요소(수·요일·장소·대상)를 바꾸고 나머지 넷은 대본과 정확히 같다.`,
  M_PURPOSE_CALL: `
- target_person 필수. 전화 변형이면 첫 줄은 전화 인사("Hello, this is … speaking." / "Hi, it's …").
- 인사·잡담 1~2턴 뒤 용건. 정답은 용건을 요약한 한국어 「…하려고」, 오답은 잡담 소재·용건과 관련된 다른 행동(예약 변경 vs 예약 취소).`,
  M_AMOUNT: `
- price_calculation 필수: { "items": [{ "label": "sticker", "unit_price": 3, "quantity": 4 }], "adjustments": [{ "kind": "amount_off", "value": 1 }], "final_amount": 11 }.
  adjustments는 대본에서 적용하는 순서대로 (percent_off=전체 %할인, amount_off=금액 할인, add=추가 비용).
- 거스름돈 변형: price_calculation에 "paid_amount"(손님이 낸 돈, 예: 20)를 넣고 final_amount는 거스름돈(낸 돈 − 지불액)으로 쓴다. 대본에서 낸 돈은 분명히 말하되("Here's twenty dollars."), 지불액과 거스름돈은 말하지 않는다.
- 지불액 변형: 최종 지불액은 대본에서 말하지 않는다(할인 전 합계는 말해도 된다).
- 조정은 한 단계(할인·쿠폰·한 개 더·수량 정정). 선택지는 "$11"처럼 달러 금액 5개, 정답·해설·final_amount가 같아야 한다.`,
  M_RELATION: `
- 두 사람의 직함·관계명(teacher, doctor, customer, mom 등)을 대본에서 말하지 않는다. 업무·요청·장소 단서 2개 이상.
- 선택지: "손님 – 사진사"처럼 "A – B" 형식 한국어 5개(순서는 지시문과 무관, 같은 장소의 다른 관계를 오답으로).`,
  M_PICTURE_SITUATION: `
- segments 구조(필수): ANN "Number one." → 두 줄(W/M 또는 M/W) → ANN "Number two." → 두 줄 … "Number five."까지. 다른 줄(인사·설명) 없음.
  예) [{"speaker":"ANN","text":"Number one."},{"speaker":"W","text":"Can I try this jacket on?"},{"speaker":"M","text":"Sure. The fitting room is over there."}, …]
- 짧은 대화 다섯 개는 모두 그림과 같은 장소 소재(예: 도서관·공원·식당)를 쓰고, 그림 속 사람의 행동·상황과 맞는 것은 하나뿐. 오답 대화도 그 자체로는 자연스럽다.
- choices = ["①","②","③","④","⑤"], correct_answer = 그림과 맞는 대화 번호.
- needs_image_choices true, visual_choice_type "scene", choice_image_prompts = [정답 대화의 장면을 그린 그림 1장 영어 설명]:
  사람 수·성별(남자 1명·여자 1명)·나이·자세·행동·표정·주요 물건·장소를 구체적으로. 글자·숫자·말풍선·표지판 글씨 없음. 흰 배경의 깔끔한 시험지 삽화 스타일.
- answer_clue: 정답 대화가 그림과 맞는 이유. explanation: 오답 대화마다 그림과 다른 점을 한 줄씩(번호 대신 대화 내용으로).`,
  M_FLYER_BLANKS: `
- table_data 필수: { "kind": "flyer", "title": "양식 제목(영어)", "rows": [{ "no": 1, "label": "Date", "value": "Saturday, May 9" }, { "no": 2, "label": "Place", "value": "(A)" }, …], "mismatch_no": 정답 번호, "mismatch_reason": "(A)·(B)에 들어갈 값과 근거" }.
  rows 4~6줄, 영어 항목명·영어/숫자 값. 정확히 두 줄의 value가 "(A)"와 "(B)"이고(A가 위), 나머지 줄 정보는 대본과 맞아야 한다.
- 두 사람이 전단·티켓·신청서를 보며 빈칸 정보를 말한다. 두 값 중 하나는 처음 말한 값이 한 번 바뀐다(날짜 변경·장소 이동 등).
- 대본에서 "(A)", "(B)", "blank"라고 부르지 않는다 — 항목 이름(the place, the fee …)으로 말하고, 끝에 두 값을 정리해 되풀이하지 않는다.
- choices 5개는 "(A) 값 – (B) 값" 형식(예: "(A) City Hall – (B) $12"). 오답 짝은 바뀌기 전 값·다른 줄의 값을 섞는다. question_text "".`,
  M_EXPRESSION_MEANING: `
- 지시문의 “○○” 자리에 대본 속 영어 표현을 철자·문장부호까지 그대로 인용한다
  (형식: 대화를 듣고, 여자의 “표현”가 의미하는 바로 가장 적절한 것을 고르시오. — 배정된 표현이 있으면 그 표현).
- 표현은 대상 화자의 대사에 정확히 한 번 나오고, 앞 맥락이 의미를 정해 준다(관용 표현·짧은 속담·완곡한 말).
- target_person 필수. 선택지: 한국어 구어 문장 5개(「그건 나에게 아주 쉬워.」처럼). 오답은 글자 그대로의 뜻·반대 태도·다른 대사의 의미.`,
  M_DESCRIBE: `
- main_content(정답 대상 한국어 명사) 필수. 대상 이름(영어)은 대본에 한 번도 나오지 않는다.
- 담화: "This is …" 또는 "People use this …"로 시작해 정의 → 쓰임 → 특징 → 마지막 결정 단서. 3인칭 설명(1인칭 수수께끼 아님).
- 선택지는 같은 범주의 한국어 명사 5개(도구·동물·운동·행사 등). 오답은 앞 단서 일부와 맞는 것.`,
  M_AWKWARD_DIALOGUE: `
- segments 구조(필수): ANN "Number one." → 두 줄 → ANN "Number two." → 두 줄 … "Number five."까지. 다른 줄 없음.
- 다섯 대화는 서로 관계없는 일상 대화(길 묻기·약속·가게·학교·안부 등). 네 개는 완전히 자연스럽고, 하나만 대답이 질문 의도와 어긋난다
  (How long …? → 장소로 답함, What do you do …? → 시간으로 답함). 어색한 대답도 문법은 맞고 같은 소재 단어를 쓴다.
- choices = ["①","②","③","④","⑤"], correct_answer = 어색한 대화 번호. explanation에 어색한 이유(질문 의도와 대답)를 쓴다.`,
  M_TABLE_SELECT: `
- table_data 필수: { "title": "품목 (열1 / 열2 / 열3)", "rows": [{ "no": 1, "label": "①", "value": "열1: 값 / 열2: 값 / 열3: 값" }, … 5행], "mismatch_no": 정답 행 번호, "mismatch_reason": "조건 세 개를 모두 만족하는 이유" }.
  열 3~4개(가격·크기·무늬·기능·요일 등 그 물건의 속성만), 값은 영어·숫자. 행 label은 ①~⑤.
  열에 사람 이름(Name: Bora)을 넣지 않는다 — 표는 물건을 견주는 표이지 명단이 아니다. 행을 이름으로 부르려면 상품 이름(Cloud Mug)을 쓴다.
  고르는 물건과 상관없는 열(영화표 장수·음료 쿠폰·사은품)도 넣지 않는다. 색은 시험지를 흑백으로 인쇄하므로 정답을 가르는 조건으로 쓰지 않는다.
- choices = ["①","②","③","④","⑤"], correct_answer = mismatch_no. question_text "".
- 조건 세 개를 차례로 말해 한 행만 남긴다. 세 조건을 모두 만족하는 행은 정답 행 하나뿐이고, 오답 행 넷은 각각 조건을 정확히 하나씩만 어긴다
  (두 행이 세 조건을 모두 만족하면 실패 — 다 쓴 뒤 표를 한 행씩 대본 조건과 대조한다). 조건은 모두 고르는 사람(지시문의 ○○)이 말하고, 조건에 쓰지 않는 열은 정답을 가르는 데 쓰지 않는다.
- 정답 행의 이름·번호·값을 말하지 않고 마지막은 "That one."처럼 가리키기만.`,
  M_DATE: `
- 선택지: 한국어 날짜 5개 "5월 12일" 형식, 이른 날짜부터(요일 변형이면 "월요일"~"일요일" 중 5개, 이른 요일부터). 정답은 ②~④ 자리.
- 대본의 날짜는 "May 12th / the 14th" 또는 요일로 말한다. 기간 제시 → 후보 2~3개가 다른 일정 때문에 탈락 → 확정. 탈락한 후보를 오답으로.`,
  M_PURPOSE_ANNOUNCE: `
- 담화 화자 M 또는 W(방송 담당·선생님·관리 사무소). "Attention, students." / "Hello, residents." 같은 방송 첫 인사.
- 배경 설명 뒤 목적(변경 안내·요청·모집·주의), 세부 1~2개, 마무리. 정답은 목적을 요약한 「…하려고」, 오답은 같은 소재의 다른 목적.`,
  M_SITUATION_SAY: `
- 3인칭 영어 나레이션(M 또는 W 한 명). 두 사람의 이름을 쓰고, 끝 문장은 정확히 "In this situation, what would A most likely say to B?" (A·B는 이름).
- question_text: "A이름: ______" (예: "Minho: ______"). choices: 영어 발화 5개(중등 4~9단어).
- 배경 → 문제 → A의 생각. A가 하려는 말의 취지는 밝히되(wants to suggest / thank / ask …) 정답 문장과 같은 단어로 쓰지 않는다.
- 오답 4개도 모두 이 상황의 소재를 쓴 그럴듯한 말: B가 할 말, A가 다른 때 할 말, 취지와 반대인 말, 상황 단어를 빌렸지만 목적이 다른 말. 상황과 무관한 문장 금지.
- 나레이터는 M 또는 W 한 명(segments 한두 줄).`,
};

/** 새 유형의 일괄 생성용 규칙 블록 */
export function getCatalogTypePromptBlock(key: ListeningTypeKey): string {
  const def = getTypeDef(key);
  const code = typeCode(key);
  const variants = (def.variants ?? [])
    .filter((v) => v.instruction)
    .map((v) => `  - ${v.label}: ${v.instruction}`)
    .join("\n");
  return `
### ${code}번 유형: ${def.label}
question_type: "${def.label}"
지시문 틀(○○만 채움): ${def.instruction}${variants ? `\n지시문 변형(배정된 변형이 있으면 그 지시문):\n${variants}` : ""}
형식: ${def.format_guide}
대본(segments): ${def.segment_guide}
선택지: ${def.choice_guide}
출제 요령: ${def.craft}${EXTRA_RULES[key] ?? ""}
`.trim();
}

/** 새 유형 1문항 생성 프롬프트 */
export function buildCatalogTypeOnlyGenerationPrompt(
  key: ListeningTypeKey,
  previousProblems?: string[]
): string {
  const avoid =
    previousProblems && previousProblems.length > 0
      ? `\n이전 생성 문제(반드시 피할 것):\n${previousProblems.map((p) => `- ${p}`).join("\n")}\n같은 상황·문장·선택지 패턴을 반복하지 말 것.\n`
      : "";
  const def = getTypeDef(key);
  return `
==================================================
문항 유형: ${def.label} (이 요청만 생성 — 다른 유형 규칙을 섞지 않음)
==================================================

${getCatalogTypePromptBlock(key)}

${COPYRIGHT_BLOCK}
${avoid}
반드시 아래 JSON만 출력한다 (questions 배열에 1개만):
{ "questions": [ { "order_index": 1, "question_type": "${def.label}", "instruction": "", "segments": [{ "speaker": "M", "text": "" }], "script_text": "", "script_translation": "", "question_text": "", "choices": ["", "", "", "", ""], "correct_answer": 1, "explanation": "", "answer_clue": "", "distractor_reasons": [] } ] }
위 유형 규칙의 필수 필드(table_data·price_calculation·mention_plan·choice_image_prompts 등)가 있으면 함께 넣는다.
`.trim();
}
