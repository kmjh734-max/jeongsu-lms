/** 고2 듣기 17회 — 사람이 직접 쓴 회차 (2026-09-21) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고2 17회",
  gradeLevel: "high2",
  speechSpeed: 0.8,
  folder: "고2 듣기",
  questions: [
    {
      order: 1,
      type: "목적 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 목적으로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Good afternoon, everyone. This is Mr. Ahn from the physical education department. " +
            "I want to explain one change to the way the gym is used after school. " +
            "Until now any club could walk in and take whichever half of the floor was empty. " +
            "That worked when three clubs used it. This term there are seven. " +
            "From Monday each club has a fixed half and a fixed hour, posted on the gym door. " +
            "If your club cannot use its hour in a given week, write it on the board and another club may take it. " +
            "Nothing changes about weekends; the gym stays open to everyone on Saturday mornings. " +
            "The timetable goes up tomorrow. Please check yours before Monday. Thank you.",
        ],
      ],
      choices: [
        "체육관 이용 시간을 늘리겠다고 알리려고",
        "체육관을 나누어 쓰는 방식이 바뀐 것을 안내하려고",
        "동아리 회원을 모집하려고",
        "체육관 안전 규칙을 알리려고",
        "주말 개방을 중단한다고 알리려고",
      ],
      answer: 2,
      clue: "From Monday each club has a fixed half and a fixed hour, posted on the gym door.",
      explanation:
        "동아리가 일곱으로 늘어 월요일부터 체육관의 절반과 시간을 정해 쓰는 방식으로 바뀐다는 것을 알리고 있다. 따라서 말의 목적은 ②이다.",
      translation: [
        "M: 여러분, 안녕하세요. 체육과 안 선생님입니다. " +
          "방과 후 체육관을 쓰는 방식에서 한 가지 달라지는 점을 설명하겠습니다. " +
          "지금까지는 어느 동아리든 들어와서 비어 있는 쪽 절반을 쓰면 됐습니다. " +
          "동아리가 셋일 때는 그것으로 됐습니다. 이번 학기에는 일곱입니다. " +
          "월요일부터는 동아리마다 쓰는 절반과 시간이 정해지고, 체육관 문에 붙여 둡니다. " +
          "그 주에 배정된 시간을 못 쓰게 되면 칠판에 적어 주세요. 다른 동아리가 쓸 수 있습니다. " +
          "주말은 달라지지 않습니다. 토요일 오전에는 누구나 쓸 수 있습니다. " +
          "시간표는 내일 붙습니다. 월요일 전에 확인해 주세요. 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 여자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Sohee, you've started writing the date on every page of your notes."],
        ["W", "The date and one question at the top. Since September."],
        ["M", "A question? About what?"],
        ["W", "About whatever the page is supposed to answer."],
        ["M", "Doesn't the heading already tell you that?"],
        ["W", "The heading tells me the topic. A question tells me what I didn't know."],
        ["M", "I've never thought about the difference."],
        ["W", "Last week I opened a page from March and read my own question."],
        ["M", "And?"],
        ["W", "I still couldn't answer it. That page was never finished, and I'd have missed that."],
        ["M", "Then I'll write a question at the top of mine tonight."],
      ],
      choices: [
        "필기는 색깔을 나누어 해야 한다",
        "필기 맨 위에 그 쪽이 답할 질문을 적어 두어야 한다",
        "필기는 수업이 끝난 뒤 다시 써야 한다",
        "공책은 과목마다 따로 써야 한다",
        "중요한 내용은 밑줄을 그어야 한다",
      ],
      answer: 2,
      clue: "The heading tells me the topic. A question tells me what I didn't know.",
      explanation:
        "여자는 제목은 주제만 알려 주므로 그 쪽이 답할 질문을 맨 위에 적어 두어야 한다고 말한다. 따라서 답은 ②이다.",
      translation: [
        "M: 소희야, 필기마다 날짜를 적기 시작했네.",
        "W: 날짜랑 맨 위에 질문 하나. 9월부터.",
        "M: 질문? 무엇에 대한?",
        "W: 그 쪽이 답해야 하는 것에 대한 질문.",
        "M: 제목이 이미 알려 주지 않아?",
        "W: 제목은 주제를 알려 주지. 질문은 내가 뭘 몰랐는지를 알려 줘.",
        "M: 그 차이는 생각해 본 적 없어.",
        "W: 지난주에 3월 필기를 펴서 내가 쓴 질문을 읽었어.",
        "M: 그래서?",
        "W: 아직도 답을 못 하겠더라. 그 쪽은 끝난 적이 없었던 거고, 그걸 모르고 넘어갈 뻔했어.",
        "M: 그럼 오늘 밤에 내 필기에도 맨 위에 질문을 써 봐야겠다.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "A group that agrees quickly feels efficient, and it is usually the opposite. " +
            "Everyone nods, the meeting ends early, and the first real obstacle arrives a week later. " +
            "Nobody was lying. They simply had not been asked the question that would have shown the gap. " +
            "Before you close a discussion, ask one person to say what could go wrong. " +
            "Not as a complaint, as a job you gave them. " +
            "Ten minutes of disagreement now is cheaper than a week of quiet rebuilding later.",
        ],
      ],
      choices: [
        "회의는 짧게 끝내는 것이 좋다",
        "의견이 빨리 모일수록 좋은 결정이다",
        "결정 전에 잘못될 가능성을 일부러 물어보아야 한다",
        "모둠은 인원이 적을수록 좋다",
        "회의 내용은 반드시 기록해야 한다",
      ],
      answer: 3,
      clue: "Ten minutes of disagreement now is cheaper than a week of quiet rebuilding later.",
      explanation:
        "빨리 합의하는 모둠은 문제를 나중에 만나게 되므로, 결정 전에 잘못될 가능성을 말할 사람을 정해 물어보아야 한다는 내용이다. 따라서 요지는 ③이다.",
      translation: [
        "M: 빨리 합의하는 모둠은 효율적으로 느껴지지만 대개 그 반대입니다. " +
          "다들 고개를 끄덕이고, 회의는 일찍 끝나고, 진짜 장애물은 일주일 뒤에 옵니다. " +
          "아무도 거짓말을 한 것이 아닙니다. 빈틈을 드러낼 질문을 받지 않았을 뿐입니다. " +
          "논의를 닫기 전에 한 사람에게 무엇이 잘못될 수 있는지 말해 달라고 하세요. " +
          "불평으로가 아니라, 그 사람에게 맡긴 일로서 말입니다. " +
          "지금의 10분짜리 이견이 나중의 일주일짜리 조용한 재작업보다 쌉니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["W", "Dohyun, the club practice room looks completely different now."],
        ["M", "We cleared it out during the holiday. What do you notice?"],
        ["W", "The wide mirror along the back wall."],
        ["M", "We need it to check our positions while we dance."],
        ["W", "On the left there's a rack with four water bottles on it."],
        ["M", "One for each member. We label them at the start of term."],
        ["W", "In the middle there's a low bench."],
        ["M", "People sit there between songs."],
        ["W", "By the window on the right, is that a speaker?"],
        ["M", "No, it's a heater. The speaker is on the shelf above the door."],
        ["W", "I see. And next to the door there's a striped mat on the floor."],
        ["M", "We stretch on it before we start."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "No, it's a heater. The speaker is on the shelf above the door.",
      explanation:
        "남자는 창가에 있는 것이 스피커가 아니라 난방기라고 바로잡는다. 그림에는 스피커가 그려져 있으므로 ④가 대화와 일치하지 않는다.",
      figure: {
        kind: "labeled",
        scene:
          "A school club practice room seen from the front, five things clearly separated and none overlapping, clean black line art, no writing anywhere. " +
          "Along the back wall: one WIDE full-length mirror. " +
          "Left wall: a rack holding exactly FOUR water bottles standing side by side. " +
          "Centre of the room: one LOW BENCH with no back. " +
          "By the window on the right: a tall box-shaped SPEAKER standing on the floor with a round cone on its front. " +
          "Next to the door on the far right: a rectangular mat covered in bold STRIPES lying flat on the floor.",
      },
      translation: [
        "W: 도현아, 동아리 연습실이 완전히 달라졌네.",
        "M: 방학 동안 싹 치웠어. 뭐가 눈에 들어와?",
        "W: 뒷벽을 따라 있는 넓은 거울.",
        "M: 춤출 때 자리를 확인해야 해서 꼭 필요해.",
        "W: 왼쪽에는 물병이 네 개 놓인 걸이가 있고.",
        "M: 부원마다 하나씩. 학기 초에 이름을 붙여.",
        "W: 가운데에는 낮은 벤치가 있네.",
        "M: 곡과 곡 사이에 거기 앉아.",
        "W: 오른쪽 창가에 있는 건 스피커야?",
        "M: 아니, 난방기야. 스피커는 문 위 선반에 있어.",
        "W: 그렇구나. 그리고 문 옆 바닥에는 줄무늬 매트가 있고.",
        "M: 시작하기 전에 그 위에서 몸을 풀어.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 남자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Junho, the field trip form came back from the office again."],
        ["M", "Again? I fixed the number of students last week."],
        ["W", "You did. This time it's the emergency contacts."],
        ["M", "We listed one number for each student."],
        ["W", "The office needs two, and one has to be a landline."],
        ["M", "Most families don't have a landline anymore."],
        ["W", "They'll accept a work number instead. It just can't be the same mobile."],
        ["M", "So we need a second number from twenty-eight families."],
        ["W", "By Thursday, or the form goes back again."],
        ["M", "I'll send the message tonight and collect the replies in the shared sheet."],
        ["W", "Thanks. Then I'll redo the form once the numbers are in."],
      ],
      choices: [
        "신청서를 다시 작성하기",
        "학생 수를 세어 보기",
        "가정에 두 번째 연락처를 요청하기",
        "행정실에 문의하기",
        "버스 회사에 연락하기",
      ],
      answer: 3,
      clue: "I'll send the message tonight and collect the replies in the shared sheet.",
      explanation:
        "남자는 28개 가정에 두 번째 연락처를 요청하는 문자를 보내고 답을 모으기로 한다. 서류 작성은 여자가 맡았다. 따라서 답은 ③이다.",
      translation: [
        "W: 준호야, 현장학습 신청서가 행정실에서 또 돌아왔어.",
        "M: 또? 지난주에 학생 수는 고쳤는데.",
        "W: 고쳤지. 이번에는 비상 연락처야.",
        "M: 학생마다 번호 하나씩 적었잖아.",
        "W: 행정실에서는 두 개를 원하고, 그중 하나는 집 전화여야 한대.",
        "M: 요즘 집 전화 있는 집이 별로 없잖아.",
        "W: 직장 번호도 받아 준대. 같은 휴대전화만 아니면 돼.",
        "M: 그럼 28가정에서 두 번째 번호를 받아야 하네.",
        "W: 목요일까지, 안 그러면 또 돌아와.",
        "M: 오늘 밤에 문자 보내고 공유 문서에 답을 모을게.",
        "W: 고마워. 번호가 들어오면 내가 신청서를 다시 쓸게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 여자가 지불할 금액을 고르시오.",
      lines: [
        ["M", "Welcome to the music shop. What can I help you with?"],
        ["W", "I need new strings for our club guitars."],
        ["M", "We have two kinds. Which one do your guitars take?"],
        ["W", "They're all acoustic, the ordinary school ones."],
        ["M", "Then a set of strings is fourteen dollars."],
        ["W", "We have four guitars, so four sets, please."],
        ["M", "Four sets at fourteen dollars comes to fifty-six."],
        ["W", "Do you sell picks as well? Ours keep disappearing."],
        ["M", "We do. A pack of ten is six dollars."],
        ["W", "One pack, then. That should last us a term."],
        ["M", "All right. And school orders over fifty dollars get ten percent off the total."],
        ["W", "That's helpful. Can I take them today?"],
        ["M", "Of course, they're all in stock."],
        ["W", "Then I'll pay by card."],
      ],
      choices: ["$50.40", "$55.80", "$56.00", "$62.00", "$62.40"],
      answer: 2,
      clue: "All right. And school orders over fifty dollars get ten percent off the total.",
      explanation:
        "줄 14달러짜리 네 세트는 56달러, 피크 한 묶음 6달러를 더하면 62달러이다. 50달러가 넘어 10퍼센트 할인을 받으면 55.80달러이므로 답은 ②이다.",
      translation: [
        "M: 악기점입니다. 무엇을 도와드릴까요?",
        "W: 동아리 기타에 쓸 새 줄이 필요해요.",
        "M: 두 종류가 있습니다. 어떤 기타인가요?",
        "W: 전부 통기타예요, 학교에서 쓰는 평범한 것들이요.",
        "M: 그럼 줄 한 세트에 14달러입니다.",
        "W: 기타가 네 대라서 네 세트 주세요.",
        "M: 네 세트에 14달러면 56달러입니다.",
        "W: 피크도 파세요? 자꾸 없어져서요.",
        "M: 팝니다. 열 개 한 묶음에 6달러입니다.",
        "W: 그럼 한 묶음요. 한 학기는 쓰겠네요.",
        "M: 알겠습니다. 그리고 50달러가 넘는 학교 주문은 전체에서 10퍼센트 할인됩니다.",
        "W: 도움이 되네요. 오늘 가져가도 되나요?",
        "M: 그럼요, 다 재고가 있습니다.",
        "W: 그럼 카드로 결제할게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 여자가 발표를 다음 주로 미루려는 이유를 고르시오.",
      lines: [
        ["M", "Naeun, you asked to move your presentation to next week?"],
        ["W", "The teacher said it was fine."],
        ["M", "Is it because the slides aren't ready?"],
        ["W", "They've been ready since Sunday."],
        ["M", "Then why? You've been prepared for days."],
        ["W", "My part uses the interview with the city librarian."],
        ["M", "Didn't you do that last month?"],
        ["W", "She had to cancel twice. We're meeting on Friday now."],
        ["M", "So without the interview there's nothing to present."],
        ["W", "Exactly. A week gives me time to write it up properly."],
      ],
      choices: [
        "자료가 완성되지 않아서",
        "인터뷰가 아직 끝나지 않아서",
        "몸이 아파서",
        "다른 일정과 겹쳐서",
        "주제를 바꾸고 싶어서",
      ],
      answer: 2,
      clue: "She had to cancel twice. We're meeting on Friday now.",
      explanation:
        "사서와의 인터뷰가 두 번 취소되어 금요일에야 하게 되었으므로 발표를 미루려 한다. 따라서 답은 ②이다.",
      translation: [
        "M: 나은아, 발표를 다음 주로 옮겨 달라고 했다며?",
        "W: 선생님이 괜찮다고 하셨어.",
        "M: 자료가 아직 안 됐어?",
        "W: 슬라이드는 일요일부터 다 돼 있어.",
        "M: 그럼 왜? 며칠째 준비돼 있었잖아.",
        "W: 내 부분이 시립 도서관 사서 인터뷰를 써.",
        "M: 지난달에 하지 않았어?",
        "W: 두 번이나 취소되셨어. 이제 금요일에 만나.",
        "M: 인터뷰가 없으면 발표할 게 없는 거네.",
        "W: 그렇지. 한 주 있으면 제대로 정리할 시간이 생겨.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 교내 진로 인터뷰 과제에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["W", "Seungmin, have you started the career interview assignment?"],
        ["M", "Not yet. I only know we have to interview somebody."],
        ["W", "One person working in a field you're interested in."],
        ["M", "How long does the interview have to be?"],
        ["W", "At least twenty minutes, and you write it up in two pages."],
        ["M", "When is it due?"],
        ["W", "The end of next month, so there's time."],
        ["M", "How do we hand it in?"],
        ["W", "Upload it to the career page. No printing this year."],
        ["M", "Then I'll ask my aunt. She works at a hospital."],
        ["W", "Good idea. Family counts as long as you write it properly."],
      ],
      choices: ["인터뷰 대상", "인터뷰 시간", "제출 마감", "제출 방법", "평가 비중"],
      answer: 5,
      clue: "Upload it to the career page. No printing this year.",
      explanation:
        "대상(관심 분야에서 일하는 한 사람), 시간(20분 이상), 마감(다음 달 말), 제출 방법(진로 누리집 업로드)은 언급되지만 평가 비중은 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 승민아, 진로 인터뷰 과제 시작했어?",
        "M: 아직. 누군가를 인터뷰해야 한다는 것만 알아.",
        "W: 네가 관심 있는 분야에서 일하는 한 사람.",
        "M: 인터뷰는 얼마나 해야 해?",
        "W: 적어도 20분, 그리고 두 쪽으로 정리해서 써.",
        "M: 언제까지야?",
        "W: 다음 달 말, 그러니까 시간은 있어.",
        "M: 어떻게 내?",
        "W: 진로 누리집에 올리면 돼. 올해는 인쇄 안 해.",
        "M: 그럼 이모한테 부탁해야겠다. 병원에서 일하셔.",
        "W: 좋은 생각이야. 제대로 쓰기만 하면 가족도 돼.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Nabi Community Kitchen에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "W",
          "Let me tell you about the Nabi Community Kitchen, which has run in our neighbourhood for six years. " +
            "It serves a free meal every Tuesday and Thursday evening, from five until seven. " +
            "Anyone may eat there; you do not have to show any document at the door. " +
            "Volunteers must be over fifteen, and they sign up for a two-hour shift online. " +
            "The kitchen does not accept cooked food from outside, only fresh ingredients. " +
            "On the last Thursday of each month it closes early, at six, for cleaning. " +
            "The building is two minutes from the station on foot.",
        ],
      ],
      choices: [
        "6년째 운영되고 있다",
        "화요일과 목요일 저녁에 연다",
        "누구나 서류 없이 식사할 수 있다",
        "조리된 음식도 기부받는다",
        "매달 마지막 목요일에는 일찍 닫는다",
      ],
      answer: 4,
      clue: "The kitchen does not accept cooked food from outside, only fresh ingredients.",
      explanation:
        "조리된 음식은 받지 않고 신선한 재료만 받는다고 했다. 따라서 ④가 내용과 일치하지 않는다.",
      translation: [
        "W: 우리 동네에서 6년째 운영되는 Nabi Community Kitchen을 소개합니다. " +
          "매주 화요일과 목요일 저녁 5시부터 7시까지 무료 식사를 제공합니다. " +
          "누구나 먹을 수 있고, 문에서 어떤 서류도 보여 줄 필요가 없습니다. " +
          "자원봉사자는 15세가 넘어야 하고, 온라인으로 두 시간 단위 근무를 신청합니다. " +
          "이 주방은 외부에서 조리된 음식은 받지 않고 신선한 재료만 받습니다. " +
          "매달 마지막 목요일에는 청소를 위해 6시에 일찍 닫습니다. " +
          "건물은 역에서 걸어서 2분 거리입니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 신청할 진로 특강을 고르시오.",
      lines: [
        ["M", "Chaerin, these are the five career talks still open this month."],
        ["W", "Let's pick one. I can't go on Wednesday because of my academy."],
        ["M", "Then one is out. What next?"],
        ["W", "It should be held at school. I can't travel across town on a weekday."],
        ["M", "One is at the city hall, so that's gone too."],
        ["W", "Three left. How long are they?"],
        ["M", "You said ninety minutes at the most."],
        ["W", "Then one more drops out. Two are left."],
        ["M", "Do they both take questions at the end?"],
        ["W", "Only one does, and that's the part I actually want."],
        ["M", "Then that's the one. I'll sign us both up tonight."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "Then that's the one. I'll sign us both up tonight.",
      explanation:
        "수요일인 ①, 시청에서 열리는 ②, 120분인 ⑤를 뺀다. 남은 ③과 ④ 중 질의응답이 있는 것은 ④이므로 답은 ④이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "수요일 / 학교 / 90분 / 질의응답 있음" },
          { no: 2, label: "②", value: "목요일 / 시청 / 90분 / 질의응답 있음" },
          { no: 3, label: "③", value: "화요일 / 학교 / 60분 / 질의응답 없음" },
          { no: 4, label: "④", value: "금요일 / 학교 / 90분 / 질의응답 있음" },
          { no: 5, label: "⑤", value: "화요일 / 학교 / 120분 / 질의응답 있음" },
        ],
      },
      translation: [
        "M: 채린아, 이달에 아직 열려 있는 진로 특강이 이 다섯 개야.",
        "W: 하나 고르자. 학원 때문에 수요일은 안 돼.",
        "M: 그럼 하나 빠지네. 다음은?",
        "W: 학교에서 하는 거여야 해. 평일에 시내를 가로질러 갈 수는 없어.",
        "M: 하나는 시청에서 하니까 그것도 빠져.",
        "W: 셋 남았다. 몇 분짜리야?",
        "M: 90분까지라고 했잖아.",
        "W: 그럼 하나 더 빠지고 둘 남았다.",
        "M: 둘 다 끝나고 질문을 받아?",
        "W: 한 곳만. 그런데 내가 정작 원하는 게 그 부분이야.",
        "M: 그럼 거기로 하자. 오늘 밤에 둘 다 신청할게.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Did you get the club budget signed?"],
        ["W", "Not yet. The teacher wasn't in the staff room."],
        ["M", "Did you check the science office?"],
        ["W", "I didn't know she sat there now."],
        ["M", "She moved desks in September."],
      ],
      choices: [
        "The budget is due on Friday.",
        "Then I'll look for her there tomorrow.",
        "I've already signed it myself.",
        "Our club has nine members.",
        "You should ask her instead.",
      ],
      answer: 2,
      clue: "She moved desks in September.",
      explanation:
        "선생님이 9월에 과학 교무실로 자리를 옮겼다는 말을 들었으므로, 내일 거기서 찾아보겠다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 동아리 예산안 결재받았어?",
        "W: 아직. 선생님이 교무실에 안 계셨어.",
        "M: 과학 교무실은 봤어?",
        "W: 거기 앉으시는 줄 몰랐어.",
        "M: 9월에 자리를 옮기셨어.",
        "W: 그럼 내일 거기서 찾아봐야겠다.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "You've been copying the notes by hand every evening."],
        ["M", "Seoyul takes better notes than I do, so I borrow hers."],
        ["W", "Can't you photograph them?"],
        ["M", "Her writing is too small to read on a screen."],
        ["W", "The library scanner enlarges pages for free."],
      ],
      choices: [
        "Her notes are about thirty pages.",
        "Then I'll scan them tomorrow.",
        "I write quite slowly.",
        "The library closes at nine.",
        "You should borrow hers too.",
      ],
      answer: 2,
      clue: "The library scanner enlarges pages for free.",
      explanation:
        "도서관 스캐너가 무료로 확대해 준다는 말을 들었으므로, 내일 스캔하겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 저녁마다 필기를 손으로 옮겨 적고 있네.",
        "M: 서율이가 나보다 필기를 잘해서 빌려 와.",
        "W: 사진으로 찍으면 안 돼?",
        "M: 글씨가 작아서 화면으로는 안 읽혀.",
        "W: 도서관 스캐너가 무료로 확대해 줘.",
        "M: 그럼 내일 스캔할게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Hayeon, how is the school garden club doing this term?"],
        ["W", "We've planted everything, but half of it isn't growing."],
        ["M", "Which half?"],
        ["W", "Everything along the wall on the north side."],
        ["M", "How many hours of sun does that side get?"],
        ["W", "I've never counted. The rest of the plot is fine."],
        ["M", "Then the soil probably isn't the problem."],
        ["W", "I've been adding compost there every week for a month."],
        ["M", "And nothing changed, which tells you something."],
        ["W", "That the compost was never the answer."],
        ["M", "Watch that side for a day and write down when the sun reaches it."],
      ],
      choices: [
        "Then I'll check the sunlight there on Saturday.",
        "We planted everything in April.",
        "I'll add more compost next week.",
        "The garden is behind the science building.",
        "Six of us look after the plot.",
      ],
      answer: 1,
      clue: "Watch that side for a day and write down when the sun reaches it.",
      explanation:
        "하루 동안 그쪽에 해가 언제 드는지 살펴 적어 보라는 조언을 들었으므로, 토요일에 햇빛을 확인하겠다는 ①이 가장 자연스럽다.",
      translation: [
        "M: 하연아, 이번 학기 텃밭 동아리는 잘돼 가?",
        "W: 다 심긴 했는데 절반이 안 자라.",
        "M: 어느 절반?",
        "W: 북쪽 담을 따라 있는 것 전부.",
        "M: 그쪽은 해가 몇 시간이나 들어?",
        "W: 세어 본 적 없어. 나머지 밭은 괜찮거든.",
        "M: 그럼 흙이 문제는 아닐 거야.",
        "W: 한 달째 거기에만 퇴비를 매주 넣고 있어.",
        "M: 그런데 아무것도 안 달라졌다는 건 뭔가를 말해 주지.",
        "W: 퇴비가 애초에 답이 아니었다는 거지.",
        "M: 하루 동안 그쪽을 지켜보면서 해가 언제 드는지 적어 봐.",
        "W: 그럼 토요일에 거기 햇빛을 확인해 볼게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Minjae, you've been running the club's social account alone, haven't you?"],
        ["M", "Since March. I post three times a week."],
        ["W", "And how many people see the posts?"],
        ["M", "About forty, which is fewer than the club has members."],
        ["W", "When do you post?"],
        ["M", "Late at night, when I finally have time."],
        ["W", "So your posts arrive when everyone is asleep."],
        ["M", "I'd never thought about the time at all."],
        ["W", "Write them at night but send them at lunchtime."],
      ],
      choices: [
        "Then I'll schedule them for lunchtime from now on.",
        "I post about three times a week.",
        "The account started in March.",
        "Our club has fifty members.",
        "I'd rather stop posting altogether.",
      ],
      answer: 1,
      clue: "Write them at night but send them at lunchtime.",
      explanation:
        "밤에 쓰되 점심시간에 올리라는 조언을 들었으므로, 앞으로 점심시간에 올라가게 예약하겠다는 ①이 가장 자연스럽다.",
      translation: [
        "W: 민재야, 동아리 계정을 혼자 운영하고 있지?",
        "M: 3월부터. 일주일에 세 번 올려.",
        "W: 그 글을 몇 명이나 봐?",
        "M: 마흔 명쯤, 동아리 부원 수보다도 적어.",
        "W: 언제 올리는데?",
        "M: 늦은 밤에, 그때야 시간이 나서.",
        "W: 그럼 다들 자고 있을 때 글이 도착하는 거네.",
        "M: 시간은 생각해 본 적도 없었어.",
        "W: 밤에 쓰되 점심시간에 올라가게 해.",
        "M: 그럼 앞으로는 점심시간에 올라가게 예약할게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Mr. Ko가 Yujin에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Mr. Ko : ________________",
      lines: [
        [
          "M",
          "Mr. Ko leads the school volunteer club, and Yujin has been a member for two years. " +
            "Yujin organises everything: the sign-up sheet, the bus, the gloves, the snacks. " +
            "Because of her the club has never once arrived late or short of anything. " +
            "The difficulty is that she does all of it herself, and the other eleven members simply turn up. " +
            "Last month she was ill for a week and nothing was prepared at all. " +
            "Mr. Ko does not think she should do less well; her care is why families ask for this club by name. " +
            "The trouble is that a club only one person can run stops the day that person cannot. " +
            "He wants to tell her to hand one fixed job to each of three other members. " +
            "In this situation, what would Mr. Ko most likely say to Yujin?",
        ],
      ],
      choices: [
        "Try to prepare everything a week earlier next time.",
        "I think you should take a break from the club.",
        "Give three members one fixed job each from now on.",
        "You should stop organising the bus yourself.",
        "Let's reduce the number of visits this term.",
      ],
      answer: 3,
      clue: "He wants to tell her to hand one fixed job to each of three other members.",
      explanation:
        "고 선생님은 유진의 꼼꼼함을 문제 삼지 않으면서, 다른 부원 세 명에게 맡을 일을 하나씩 정해 주라고 말하려 한다. 따라서 ③이 가장 적절하다.",
      translation: [
        "M: 고 선생님은 학교 봉사 동아리를 맡고 있고, 유진이는 2년째 부원입니다. " +
          "유진이는 신청서, 버스, 장갑, 간식까지 모든 것을 챙깁니다. " +
          "그 덕분에 동아리는 한 번도 늦거나 무언가가 모자란 적이 없습니다. " +
          "문제는 그 모든 일을 혼자 하고, 나머지 열한 명은 그냥 나타난다는 점입니다. " +
          "지난달 유진이가 일주일 아팠을 때는 아무것도 준비되지 않았습니다. " +
          "고 선생님은 유진이가 덜 잘하기를 바라지 않습니다. 그 정성 덕분에 이 동아리를 찾는 가정이 많습니다. " +
          "문제는 한 사람만 굴릴 수 있는 동아리는 그 사람이 못 하는 날 멈춘다는 점입니다. " +
          "그래서 다른 부원 세 명에게 맡을 일을 하나씩 정해 주라고 말하고 싶습니다. " +
          "이런 상황에서 고 선생님이 유진이에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "여자가 하는 말의 주제로 가장 적절한 것은?",
      lines: [
        ["W", "Good afternoon. Today I want to talk about how people carried water before pipes."],
        ["W", "A city can grow only as far as its water will travel, so this was never a small problem."],
        ["W", "The Roman aqueduct solved it with gravity, falling about thirty centimetres in every kilometre."],
        ["W", "Persian builders went underground instead, digging long tunnels called qanats to keep the water cool."],
        ["W", "In parts of India, stepwells cut stairs down to the water table so the well came up to meet the season."],
        ["W", "The Dutch windmill did the opposite job, lifting water out of land that was already too wet."],
        ["W", "None of these moved water by pushing it; each one used the shape of the land or the weather."],
        ["W", "That is why they kept working for centuries with almost no one to repair them."],
      ],
      choices: [
        "how rivers change their course",
        "why cities are built near water",
        "old ways of moving and reaching water",
        "how wells are dug today",
        "why windmills stopped being used",
      ],
      answer: 3,
      clue: "None of these moved water by pushing it; each one used the shape of the land or the weather.",
      explanation:
        "여자는 로마 수도교, 페르시아의 카나트, 인도의 계단 우물, 네덜란드 풍차를 들며 물을 옮기고 얻던 옛 방법을 설명한다. 따라서 주제는 ③이다.",
      translation: [
        "W: 안녕하세요. 오늘은 관이 있기 전에 사람들이 물을 어떻게 날랐는지 이야기하려 합니다.",
        "W: 도시는 물이 닿는 데까지만 커질 수 있으니, 이것은 결코 작은 문제가 아니었습니다.",
        "W: 로마의 수도교는 중력으로 풀었습니다. 1킬로미터에 30센티미터쯤 낮아지게 놓았습니다.",
        "W: 페르시아의 건설자들은 대신 땅속으로 들어가, 카나트라는 긴 굴을 파서 물을 시원하게 유지했습니다.",
        "W: 인도 일부 지역의 계단 우물은 지하수면까지 계단을 깎아 내려, 계절에 따라 물을 맞으러 내려갔습니다.",
        "W: 네덜란드의 풍차는 반대 일을 했습니다. 이미 너무 젖은 땅에서 물을 퍼 올렸습니다.",
        "W: 이 가운데 물을 밀어서 옮긴 것은 하나도 없습니다. 모두 땅의 모양이나 날씨를 이용했습니다.",
        "W: 그래서 고칠 사람이 거의 없어도 수백 년 동안 작동했습니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 것이 아닌 것은?",
      lines: [
        ["W", "Good afternoon. Today I want to talk about how people carried water before pipes."],
        ["W", "A city can grow only as far as its water will travel, so this was never a small problem."],
        ["W", "The Roman aqueduct solved it with gravity, falling about thirty centimetres in every kilometre."],
        ["W", "Persian builders went underground instead, digging long tunnels called qanats to keep the water cool."],
        ["W", "In parts of India, stepwells cut stairs down to the water table so the well came up to meet the season."],
        ["W", "The Dutch windmill did the opposite job, lifting water out of land that was already too wet."],
        ["W", "None of these moved water by pushing it; each one used the shape of the land or the weather."],
        ["W", "That is why they kept working for centuries with almost no one to repair them."],
      ],
      choices: ["Roman aqueducts", "Persian qanats", "Indian stepwells", "Dutch windmills", "Chinese canals"],
      answer: 5,
      clue: "The Dutch windmill did the opposite job, lifting water out of land that was already too wet.",
      explanation:
        "로마 수도교, 페르시아 카나트, 인도 계단 우물, 네덜란드 풍차는 언급되지만 중국의 운하는 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
