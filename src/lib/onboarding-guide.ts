/** 시작하기 네 단계: 들어갈 화면과, 그 화면에서 할 일 */
export const GUIDE_STEPS = [
  {
    title: "반 만들기",
    href: "/admin/classes?guide=1",
    how: "오른쪽 위 ‘새 반’을 눌러 반 이름(예: 중2 A반)을 넣고 만드세요. 수업 요일은 반을 열어 정할 수 있어요.",
  },
  {
    title: "학생 등록",
    href: "/admin/students?new=1&guide=2",
    how: "‘학생 등록’ 창에 이름·아이디·첫 비밀번호를 넣어 만드세요. 그다음 ‘반 관리’에서 반을 열고 ‘학생 추가’로 넣으면 돼요. 학생은 이 아이디로 휴대폰에서 로그인해요.",
  },
  {
    title: "단어·듣기 배정",
    href: "/admin/vocab/assign?guide=3",
    how: "‘새로 배정’을 눌러 학년에 맞는 단어장(예: 중학필수 Day 1–5)을 고르고 반을 선택하세요. 듣기는 왼쪽 메뉴 ‘듣기학습 → 배정’에서 같은 방법으로 해요.",
  },
  {
    title: "수업자료 만들어 보기",
    href: "/admin/lesson-materials/input?guide=4",
    how: "지문을 붙여 넣고 ‘다음 단계로’를 누른 뒤, 만들 자료(분석서·워크북·1장 자료)를 고르세요.",
  },
] as const;
