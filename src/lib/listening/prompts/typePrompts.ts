/**
 * 중1 영어듣기평가 20유형별 생성 프롬프트
 * (기출 문장 복사 금지 — 유형·구조만 참고)
 */

export interface TypePromptSpec {
  id: number;
  question_type: string;
  instruction: string;
  body: string;
}

const TYPE_PROMPTS: TypePromptSpec[] = [
  {
    id: 1,
    question_type: "묘사 듣고 대상 고르기",
    instruction: "다음을 듣고, 'I'가 무엇인지 가장 적절한 것을 고르시오.",
    body: `
- 한 명(M 또는 W)이 사물·동물·장소·직업 중 하나를 1인칭(I)으로 묘사한다.
- 담화형 5~7문장, 각 문장 6~13단어.
- 색·크기·서식·행동·용도 등 단서를 단계적으로 제시; 처음부터 정답이 드러나지 않게.
- 마지막 문장은 반드시 "What am I?"로 끝낸다.
- 선택지: 같은 범주 영어 단어 5개 (예: 모두 동물).
- "I am a cat."처럼 정답을 직접 말하지 말 것.
- question_text는 비워 둔다.`,
  },
  {
    id: 2,
    question_type: "구입/주문 정보 파악",
    instruction: "대화를 듣고, ○○가 구입한/주문한 것으로 가장 적절한 것을 고르시오.",
    body: `
- 가게·카페·문구점·옷가게 등 일상 구매 상황.
- 대화 6~8턴; 색·크기·토핑·디자인 등 조건 2~3개 제시.
- 후보 비교 후 최종 선택이 명확히 결정되도록.
- instruction의 ○○는 남자 또는 여자.
- 선택지: 같은 종류 영어 표현 5개 (예: 모두 음료·모두 모자).
- 정답은 최종 구입·주문한 것.`,
  },
  {
    id: 3,
    question_type: "날씨 파악",
    instruction: "다음을 듣고, ○○의 오늘 오후/현재/내일 날씨로 가장 적절한 것을 고르시오.",
    body: `
- 짧은 날씨 안내 담화 5~6문장.
- 오전·오후·내일 날씨 중 최소 2개 언급.
- 정답은 instruction에서 묻는 시점의 날씨 (다른 시점이 정답이 되면 안 됨).
- instruction의 ○○는 한국어 지명.
- 선택지: 날씨 관련 표현 5개 (영어 또는 한국어 — 기출 형식에 맞게 일관되게).`,
  },
  {
    id: 4,
    question_type: "마지막 말의 의도",
    instruction: "대화를 듣고, ○○가 한 마지막 말의 의도로 가장 적절한 것을 고르시오.",
    body: `
- 대화 6~8턴.
- 마지막 말의 의도: 감사·거절·칭찬·사과·격려·부탁·항의 중 하나가 상황상 명확.
- instruction의 ○○는 남자 또는 여자 (마지막 화자와 일치).
- 선택지: 의도 5개 (한국어 짧은 명사형: 감사, 거절, 칭찬, 사과, 항의 등).
- 두 의도가 동시에 가능하면 안 됨.`,
  },
  {
    id: 5,
    question_type: "언급하지 않은 것",
    instruction: "다음을 듣고, ○○가 ○○에 대해 언급하지 않은 것을 고르시오.",
    body: `
- 행사·공연·가족·프로그램·여행 안내 등 담화형 5~7문장.
- 선택지 5개 중 4개는 대본에 반드시 언급, 1개만 절대 언급하지 않음 (그 1개가 정답).
- 선택지: 같은 정보 범주 (이름/나이/직업/취미 또는 날짜/장소/시간/가격/신청 방법 등).
- answer_clue에 언급된 4개와 언급되지 않은 1개를 명시.`,
  },
  {
    id: 6,
    question_type: "시각 파악",
    instruction: "대화를 듣고, 두 사람이 만날 시각/수업이 시작하는 시각을 고르시오.",
    body: `
- 대화 6~8턴.
- 현재·제안·최종 시각을 2~3개 자연스럽게 언급; 정답은 최종 결정 시각.
- 선택지: 시각 5개 (영어 표기, 예: 4:00 p.m.).
- 마지막에 최종 시각을 다시 확인하는 발화가 있으면 좋음.`,
  },
  {
    id: 7,
    question_type: "장래 희망 파악",
    instruction: "대화를 듣고, ○○의 장래 희망으로 가장 적절한 것을 고르시오.",
    body: `
- 대화 6~8턴.
- 관심·활동·이유 후 장래 희망(직업)이 자연스럽게 드러남.
- instruction의 ○○는 남자 또는 여자.
- 선택지: 직업 5개 (한국어).`,
  },
  {
    id: 8,
    question_type: "심정 파악",
    instruction: "대화를 듣고, ○○의 심정으로 가장 적절한 것을 고르시오.",
    body: `
- 대화 6~8턴.
- 한 사람의 감정이 상황·반응으로 명확 (직접 말해도 됨).
- instruction의 ○○는 남자 또는 여자.
- 선택지: 감정 5개 (한국어: 실망, 설렘, 걱정, 안도, 당황, 만족 등).`,
  },
  {
    id: 9,
    question_type: "대화 직후 할 일",
    instruction: "대화를 듣고, ○○가 대화 직후에 할 일로 가장 적절한 것을 고르시오.",
    body: `
- 대화 6~8턴.
- 마지막 부분에 바로 할 행동이 명확 (I'll ~ now 등).
- instruction의 ○○는 남자 또는 여자.
- 선택지: 행동 5개 (한국어).`,
  },
  {
    id: 10,
    question_type: "대화 주제 파악",
    instruction: "대화를 듣고, 무엇에 관한 내용인지 가장 적절한 것을 고르시오.",
    body: `
- 대화 6~8턴.
- 일상 문제·계획·물건 처리 등; 전체 주제가 정답.
- 선택지: 주제 5개 (한국어). 너무 세부적이면 안 됨.`,
  },
  {
    id: 11,
    question_type: "이동 방법",
    instruction: "대화를 듣고, 두 사람이 함께 이동할 방법으로 가장 적절한 것을 고르시오.",
    body: `
- 대화 6~8턴.
- 이동 수단 후보 제시 후 함께 결정한 하나가 정답.
- 선택지: 교통수단 5개 (한국어).`,
  },
  {
    id: 12,
    question_type: "이유 파악",
    instruction: "대화를 듣고, ○○가 ○○에 가는 이유로 가장 적절한 것을 고르시오.",
    body: `
- 대화 6~8턴.
- 특정 장소 방문 이유가 대본에 명확.
- instruction의 ○○는 인물·장소(한국어).
- 선택지: 이유 5개 (한국어, ~하려고 형식).`,
  },
  {
    id: 13,
    question_type: "장소 파악",
    instruction: "대화를 듣고, 두 사람이 대화하는 장소로 가장 적절한 곳을 고르시오.",
    body: `
- 대화 6~8턴.
- 장소명을 직접 말하지 말고 단서(물건·행동·서비스)로 추론.
- 선택지: 장소 5개 (한국어).`,
  },
  {
    id: 14,
    question_type: "표 정보 불일치",
    instruction: "○○에 관한 다음 내용을 듣고, 표에서 일치하지 않는 것을 고르시오.",
    body: `
- 행사·축제·수업·프로그램 안내 담화 5~7문장.
- question_text: 한국어 표 5행 (①~⑤ 라벨, 항목명·내용).
- 대본과 표 4개 일치, 1개만 불일치 (불일치 1개가 정답).
- instruction의 ○○는 행사/프로그램명(한국어).
- choices는 표 행과 대응.`,
  },
  {
    id: 15,
    question_type: "부탁한 일",
    instruction: "대화를 듣고, ○○가 ○○에게 부탁한 일로 가장 적절한 것을 고르시오.",
    body: `
- 대화 6~8턴.
- Can you~? / Could you~? / Would you~? 부탁 표현.
- 실제 부탁한 일은 하나만 명확 (제안과 구분).
- 선택지: 행동 5개 (한국어).`,
  },
  {
    id: 16,
    question_type: "제안한 것",
    instruction: "대화를 듣고, ○○가 ○○에게 제안한 것으로 가장 적절한 것을 고르시오.",
    body: `
- 대화 6~8턴.
- Why don't we~? / How about~? / Let's~ 제안.
- 선택지: 제안·활동 5개 (한국어).`,
  },
  {
    id: 17,
    question_type: "특정 시점 할 일",
    instruction: "대화를 듣고, ○○가 오늘 오후/이번 주말에 할 일로 가장 적절한 것을 고르시오.",
    body: `
- 대화 6~8턴.
- 오늘 오후·이번 주말 등 시점 명확; 그 시점의 계획이 정답.
- instruction의 ○○는 남자 또는 여자.
- 선택지: 활동 5개 (한국어).`,
  },
  {
    id: 18,
    question_type: "직업 파악",
    instruction: "대화를 듣고, ○○의 직업으로 가장 적절한 것을 고르시오.",
    body: `
- 대화 6~8턴.
- 직업명 직접 언급 없이 하는 일·상황 단서 2개 이상.
- instruction의 ○○는 남자 또는 여자.
- 선택지: 직업 5개 (한국어).`,
  },
  {
    id: 19,
    question_type: "응답 고르기",
    instruction: "대화를 듣고, 여자의 마지막 말에 이어질 남자의 말로 가장 적절한 것을 고르시오.",
    body: `
- 대화 6~8턴; 마지막 발화 화자는 반드시 W(여자).
- 남자의 응답 대사는 segment에 넣지 않음 (음원에 읽히지 않음).
- question_text: 정확히 "Man: ________" (영어).
- 선택지: 자연스러운 영어 응답 문장 5개 (6~12단어 권장).
- 정답만 대화 흐름에 자연스럽게 이어짐.`,
  },
  {
    id: 20,
    question_type: "응답 고르기",
    instruction: "대화를 듣고, 남자의 마지막 말에 이어질 여자의 말로 가장 적절한 것을 고르시오.",
    body: `
- 19번과 다른 상황·주제.
- 대화 6~8턴; 마지막 발화 화자는 반드시 M(남자).
- 여자의 응답 대사는 segment에 넣지 않음.
- question_text: 정확히 "Woman: ________" (영어).
- 선택지: 영어 응답 문장 5개.`,
  },
];

export function getTypePromptSpec(typeId: number): TypePromptSpec | undefined {
  return TYPE_PROMPTS.find((t) => t.id === typeId);
}

export function getTypePromptBlock(typeId: number): string {
  const spec = getTypePromptSpec(typeId);
  if (!spec) return "";
  return `
=== 유형 ${spec.id}: ${spec.question_type} (order_index MUST be ${spec.id}) ===
instruction (한국어, ○○만 채움): ${spec.instruction}
${spec.body.trim()}
`.trim();
}

export function getAllTypePromptBlocks(typeIds: number[]): string {
  return typeIds.map((id) => getTypePromptBlock(id)).filter(Boolean).join("\n\n");
}
