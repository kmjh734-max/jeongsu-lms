/** 고3 듣기 16회 — 사람이 직접 쓴 회차 (2026-09-21) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고3 16회",
  gradeLevel: "high3",
  speechSpeed: 0.8,
  folder: "고3 듣기",
  questions: [
    {
      order: 1,
      type: "목적 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 목적으로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Good evening, third-year students and parents. This is Mr. Hwang from the career office. " +
            "I am calling about the printed admissions booklet we have handed out every October. " +
            "This year we are not printing it, and I want to explain why before anyone asks. " +
            "Last year the booklet went out on the fourth, and eleven of the dates in it changed within two weeks. " +
            "Students were working from paper that was already wrong. " +
            "From this year the same information lives on one page of the school website, updated the day any change arrives. " +
            "The page shows the date of its last update at the top, so you can always see how fresh it is. " +
            "If you cannot use the site at home, the career office will print the page for you on request. Thank you.",
        ],
      ],
      choices: [
        "입시 설명회 참석을 권하려고",
        "입시 자료집을 인쇄하지 않는 이유를 설명하려고",
        "상담 예약 방법을 안내하려고",
        "원서 마감일을 알리려고",
        "진로 교사를 소개하려고",
      ],
      answer: 2,
      clue: "This year we are not printing it, and I want to explain why before anyone asks.",
      explanation:
        "해마다 나눠 주던 입시 자료집을 올해는 인쇄하지 않는 이유와 대신 쓸 방법을 설명하고 있다. 따라서 말의 목적은 ②이다.",
      translation: [
        "M: 3학년 학생과 학부모님, 안녕하세요. 진로부 황 선생님입니다. " +
          "해마다 10월에 나눠 드리던 인쇄본 입시 자료집에 대해 말씀드립니다. " +
          "올해는 인쇄하지 않기로 했고, 묻기 전에 그 이유를 먼저 설명드리려 합니다. " +
          "작년에는 자료집이 4일에 나갔는데, 그 안의 날짜 중 열한 개가 2주 안에 바뀌었습니다. " +
          "학생들은 이미 틀린 종이를 보고 준비하고 있었던 셈입니다. " +
          "올해부터는 같은 내용을 학교 누리집 한 쪽에 두고, 변경이 들어오는 날 바로 고칩니다. " +
          "그 쪽 맨 위에 마지막으로 고친 날짜가 표시되어 언제 것인지 늘 확인할 수 있습니다. " +
          "집에서 누리집을 쓰기 어려우시면 말씀해 주세요. 진로부에서 출력해 드리겠습니다. 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 여자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Hyewon, you've stopped highlighting your textbooks."],
        ["W", "In September. My books were more yellow than white."],
        ["M", "Isn't highlighting how you find the important parts?"],
        ["W", "That's what I believed. Then I opened a chapter from March."],
        ["M", "And?"],
        ["W", "Half the page was marked. Marking half of something marks nothing."],
        ["M", "So what do you do instead?"],
        ["W", "I write one sentence at the top of the page saying what it argues."],
        ["M", "That's slower than a highlighter."],
        ["W", "Much slower, and I can't do it unless I actually understood the page."],
        ["M", "Then I'll try a sentence per page this week."],
      ],
      choices: [
        "교과서는 여러 번 읽어야 한다",
        "중요한 부분은 밑줄보다 한 문장으로 요약해야 한다",
        "필기는 색깔을 나누어 해야 한다",
        "교과서는 깨끗하게 써야 한다",
        "요약은 단원이 끝난 뒤에 해야 한다",
      ],
      answer: 2,
      clue: "Much slower, and I can't do it unless I actually understood the page.",
      explanation:
        "여자는 절반을 칠하는 밑줄은 아무것도 표시하지 않는 것과 같다며, 쪽마다 한 문장으로 요지를 적는 편이 낫다고 말한다. 따라서 답은 ②이다.",
      translation: [
        "M: 혜원아, 교과서에 형광펜 긋는 걸 그만뒀네.",
        "W: 9월부터. 책이 흰색보다 노란색이 더 많았어.",
        "M: 중요한 데를 찾으려고 긋는 거 아니야?",
        "W: 나도 그렇게 믿었어. 그러다 3월에 본 단원을 펼쳤지.",
        "M: 그래서?",
        "W: 한 쪽의 절반이 칠해져 있더라. 절반을 표시하는 건 아무것도 표시하지 않는 거야.",
        "M: 그럼 대신 뭘 하는데?",
        "W: 쪽 맨 위에 이 쪽이 무엇을 주장하는지 한 문장으로 적어.",
        "M: 형광펜보다 느리잖아.",
        "W: 훨씬 느려. 그리고 그 쪽을 진짜 이해하지 못하면 쓸 수가 없어.",
        "M: 그럼 이번 주에 쪽마다 한 문장씩 써 볼게.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Before an important decision, people gather information until the last possible hour. " +
            "It feels responsible, and up to a point it is. " +
            "Past that point, each new article does not change the answer; it only changes how you feel about it. " +
            "You are no longer learning. You are looking for permission. " +
            "Notice the moment when the last three things you read told you nothing new. " +
            "That is the moment the research ended, whether or not you stopped reading.",
        ],
      ],
      choices: [
        "결정은 빠를수록 좋다",
        "자료는 믿을 만한 곳에서 찾아야 한다",
        "새로 배우는 것이 없어지면 자료 찾기를 멈추어야 한다",
        "결정하기 전에 남의 의견을 들어야 한다",
        "중요한 결정은 미루지 말아야 한다",
      ],
      answer: 3,
      clue: "Notice the moment when the last three things you read told you nothing new.",
      explanation:
        "어느 지점을 지나면 자료를 더 찾아도 배우는 것이 없고 허락을 구할 뿐이므로 그때 멈추어야 한다는 내용이다. 따라서 요지는 ③이다.",
      translation: [
        "M: 중요한 결정을 앞두고 사람들은 마지막 순간까지 자료를 모읍니다. " +
          "책임감 있어 보이고, 어느 지점까지는 실제로 그렇습니다. " +
          "그 지점을 지나면 새 글이 답을 바꾸지는 못하고 그 답에 대한 기분만 바꿉니다. " +
          "더는 배우는 것이 아닙니다. 허락을 구하고 있는 것입니다. " +
          "마지막으로 읽은 세 가지가 새로운 것을 하나도 말해 주지 않은 순간을 알아채세요. " +
          "읽기를 멈췄든 안 멈췄든, 자료 조사는 그 순간에 끝난 것입니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["W", "Junhyuk, the career office looks completely different since the move."],
        ["M", "We finished it last Friday. What do you see first?"],
        ["W", "The wide noticeboard on the back wall."],
        ["M", "The admission dates go up there the day they arrive."],
        ["W", "On the left there's a shelf with five folders standing side by side."],
        ["M", "One folder for each year group and two for the alumni."],
        ["W", "In the middle there's a rectangular table with five chairs."],
        ["M", "Group counselling happens there on Wednesdays."],
        ["W", "By the window on the right, is that a printer?"],
        ["M", "No, it's a scanner. The printer is out in the corridor."],
        ["W", "I see. And next to the door there's a tall plant in a square pot."],
        ["M", "A parent brought it on the day we reopened."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "No, it's a scanner. The printer is out in the corridor.",
      explanation:
        "남자는 창가에 있는 것이 프린터가 아니라 스캐너라고 바로잡는다. 그림에는 프린터가 그려져 있으므로 ④가 대화와 일치하지 않는다.",
      figure: {
        kind: "labeled",
        scene:
          "A school career office seen from the front, five things clearly separated and none overlapping, clean black line art, no writing anywhere. " +
          "Centre of the back wall: one WIDE noticeboard with a few blank cards pinned on it. " +
          "Left wall: a shelf holding exactly FIVE upright ring folders standing side by side. " +
          "Centre of the room: a RECTANGULAR table with exactly FIVE chairs around it. " +
          "By the window on the right: a PRINTER, a boxy office printer with a paper tray sticking out and sheets of paper in it. " +
          "Next to the door on the far right: one tall plant growing in a SQUARE pot.",
      },
      translation: [
        "W: 준혁아, 옮기고 나니 진로부실이 완전히 달라졌다.",
        "M: 지난 금요일에 끝냈어. 뭐가 먼저 보여?",
        "W: 뒷벽에 있는 넓은 게시판.",
        "M: 입시 일정이 들어오는 날 바로 거기에 붙여.",
        "W: 왼쪽 선반에는 서류철이 다섯 개 나란히 서 있고.",
        "M: 학년마다 하나씩, 졸업생용으로 두 개야.",
        "W: 가운데에는 의자 다섯 개가 있는 직사각형 탁자가 있네.",
        "M: 수요일마다 거기서 집단 상담을 해.",
        "W: 오른쪽 창가에 있는 건 프린터야?",
        "M: 아니, 스캐너야. 프린터는 복도에 있어.",
        "W: 그렇구나. 그리고 문 옆에는 네모난 화분에 심은 키 큰 식물이 있고.",
        "M: 다시 연 날 학부모님이 가져다주셨어.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 여자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Chaerin, the alumni mentoring starts next week and one thing is still open."],
        ["W", "I thought we matched everyone last Friday."],
        ["M", "We matched thirty-two students to thirty-two mentors."],
        ["W", "Then what's the problem?"],
        ["M", "Four of the mentors work night shifts and can only meet before nine in the morning."],
        ["W", "And the four students we gave them?"],
        ["M", "All four take the school bus that arrives at eight fifty."],
        ["W", "So none of those pairs can actually meet."],
        ["M", "Right. We need to swap them with four students who live nearby."],
        ["W", "I'll go through the address list this afternoon and propose four swaps."],
        ["M", "Thanks. Then I'll write to the mentors once you send me the names."],
      ],
      choices: [
        "멘토에게 편지 쓰기",
        "주소 명단을 보고 짝을 바꿀 안을 만들기",
        "버스 시간표를 확인하기",
        "학생들에게 문자 보내기",
        "상담실을 예약하기",
      ],
      answer: 2,
      clue: "I'll go through the address list this afternoon and propose four swaps.",
      explanation:
        "여자는 오후에 주소 명단을 살펴 네 쌍을 바꿀 안을 만들기로 한다. 멘토에게 연락하는 일은 남자가 맡았다. 따라서 답은 ②이다.",
      translation: [
        "M: 채린아, 졸업생 멘토링이 다음 주에 시작하는데 아직 하나가 남았어.",
        "W: 지난 금요일에 다 짝지은 줄 알았는데.",
        "M: 학생 32명을 멘토 32명과 짝지었지.",
        "W: 그럼 뭐가 문제야?",
        "M: 멘토 네 분이 야간 근무라서 아침 9시 전에만 만날 수 있대.",
        "W: 그분들한테 붙인 학생 네 명은?",
        "M: 네 명 다 8시 50분에 도착하는 통학 버스를 타.",
        "W: 그럼 그 네 쌍은 아예 만날 수가 없네.",
        "M: 그래. 근처에 사는 학생 네 명과 바꿔야 해.",
        "W: 오후에 주소 명단을 훑어서 바꿀 네 쌍을 제안할게.",
        "M: 고마워. 이름 보내 주면 내가 멘토분들께 연락할게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 남자가 지불할 금액을 고르시오.",
      lines: [
        ["W", "Good afternoon. Are you here to collect the bound copies?"],
        ["M", "Yes, the research reports for our class."],
        ["W", "Twelve copies, wasn't it? Binding is five dollars each."],
        ["M", "That's right. So sixty dollars for the binding."],
        ["W", "Correct. Would you like a clear cover on the front?"],
        ["M", "How much does that add?"],
        ["W", "One dollar per copy, and it keeps the first page clean."],
        ["M", "Then yes, all twelve."],
        ["W", "All right. And school orders over fifty dollars get ten percent off."],
        ["M", "That's helpful. Can I take them now?"],
        ["W", "They're in the two boxes by the door."],
        ["M", "Thank you. I'll pay by card."],
      ],
      choices: ["$60.00", "$64.80", "$66.00", "$70.00", "$72.00"],
      answer: 2,
      clue: "All right. And school orders over fifty dollars get ten percent off.",
      explanation:
        "제본 5달러씩 열두 부는 60달러, 투명 표지 1달러씩 열두 부는 12달러로 합계 72달러이다. 10퍼센트 할인을 받으면 64.80달러이므로 답은 ②이다.",
      translation: [
        "W: 안녕하세요. 제본한 것 찾으러 오셨나요?",
        "M: 네, 저희 반 연구 보고서요.",
        "W: 열두 부 맞으시죠? 제본은 한 부에 5달러입니다.",
        "M: 맞습니다. 그럼 제본이 60달러네요.",
        "W: 맞습니다. 앞에 투명 표지를 씌워 드릴까요?",
        "M: 얼마나 더 드나요?",
        "W: 한 부에 1달러인데, 첫 장이 깨끗하게 유지됩니다.",
        "M: 그럼 열두 부 다 해 주세요.",
        "W: 알겠습니다. 그리고 50달러가 넘는 학교 주문은 10퍼센트 할인됩니다.",
        "M: 도움이 되네요. 지금 가져가도 될까요?",
        "W: 문 옆 상자 두 개에 있습니다.",
        "M: 감사합니다. 카드로 결제할게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 여자가 야간 자습을 그만두려는 이유를 고르시오.",
      lines: [
        ["M", "Naeun, is it true you're leaving the night study room?"],
        ["W", "From next week, yes. I told the teacher this morning."],
        ["M", "Is it too noisy in there?"],
        ["W", "No, it's the quietest place in the building."],
        ["M", "Then why? You've had that seat since March."],
        ["W", "The last bus from school leaves at ten fifteen."],
        ["M", "And the room closes at ten."],
        ["W", "It does, but I've missed that bus four times this month."],
        ["M", "So you walk home in the dark."],
        ["W", "Forty minutes. I'd rather study at home and sleep an hour earlier."],
      ],
      choices: [
        "자리가 시끄러워서",
        "성적이 떨어져서",
        "막차를 놓치는 일이 잦아서",
        "학원 수업과 겹쳐서",
        "몸이 아파서",
      ],
      answer: 3,
      clue: "It does, but I've missed that bus four times this month.",
      explanation:
        "자습실이 10시에 끝나는데 10시 15분 막차를 이달에만 네 번 놓쳤다고 했다. 따라서 답은 ③이다.",
      translation: [
        "M: 나은아, 야간 자습실 그만둔다는 게 사실이야?",
        "W: 다음 주부터. 오늘 아침에 선생님께 말씀드렸어.",
        "M: 거기가 시끄러워서?",
        "W: 아니, 건물에서 제일 조용한 곳인데.",
        "M: 그럼 왜? 3월부터 그 자리였잖아.",
        "W: 학교에서 막차가 10시 15분에 떠나.",
        "M: 그리고 자습실은 10시에 끝나고.",
        "W: 그렇지, 그런데 이번 달에만 그 버스를 네 번 놓쳤어.",
        "M: 그럼 어두운 길을 걸어가는 거네.",
        "W: 40분. 차라리 집에서 공부하고 한 시간 일찍 자는 게 나아.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 교내 모의 면접 캠프에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["M", "Seoyeon, have you applied for the interview camp?"],
        ["W", "Not yet. I saw the title on the notice board and walked past it."],
        ["M", "You should read it properly. It's the most useful thing this term."],
        ["W", "All right, tell me. How long does it run?"],
        ["M", "Two days, the fourteenth and the fifteenth, from nine until four."],
        ["W", "Two full days. And where is it held?"],
        ["M", "Not at school. We take a bus to the university hall downtown."],
        ["W", "That sounds serious. Who actually does the interviews?"],
        ["M", "Three teachers from our school and two graduates who are at university now."],
        ["W", "Graduates too? They'd know what the real questions feel like."],
        ["M", "That's why people liked it last year."],
        ["W", "How many students can go?"],
        ["M", "Thirty in total, and third years are chosen first."],
        ["W", "Then I should apply today rather than tomorrow."],
        ["M", "You should. It closed in one day last year."],
      ],
      choices: ["진행 기간", "장소", "면접관", "모집 인원", "준비물"],
      answer: 5,
      clue: "Thirty in total, and third years are chosen first.",
      explanation:
        "기간(14일·15일), 장소(시내 대학 강당), 면접관(교사 세 명과 졸업생 두 명), 모집 인원(30명)은 언급되지만 준비물은 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 서연아, 면접 캠프 신청했어?",
        "W: 아직. 게시판에서 제목만 보고 지나쳤어.",
        "M: 제대로 읽어 봐. 이번 학기에 제일 쓸모 있는 거야.",
        "W: 알겠어, 말해 봐. 며칠 동안 해?",
        "M: 이틀, 14일과 15일, 9시부터 4시까지.",
        "W: 꼬박 이틀이구나. 어디서 하는데?",
        "M: 학교가 아니라 버스 타고 시내 대학 강당으로 가.",
        "W: 진지하네. 면접은 실제로 누가 봐?",
        "M: 우리 학교 선생님 세 분이랑 지금 대학에 다니는 졸업생 두 명.",
        "W: 졸업생도? 실제 질문이 어떤 느낌인지 알겠네.",
        "M: 그래서 작년에 다들 좋아했어.",
        "W: 몇 명 갈 수 있어?",
        "M: 모두 30명, 3학년을 먼저 뽑아.",
        "W: 그럼 내일 말고 오늘 신청해야겠다.",
        "M: 그래. 작년에는 하루 만에 마감됐어.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Hanbit Winter Workshop에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "W",
          "Here is what you need to know about the Hanbit Winter Workshop. " +
            "It is held over three days, from the twenty-seventh to the twenty-ninth of December. " +
            "Students in their second and third years may apply, and thirty places are available. " +
            "Each day begins at ten and ends at four, with lunch provided in the hall. " +
            "You must bring your own laptop; the centre does not lend any. " +
            "Applications are made by the student, not the school, through the centre's website. " +
            "The list of successful applicants goes up on the twentieth.",
        ],
      ],
      choices: [
        "12월 27일부터 29일까지 사흘 동안 열린다",
        "2학년과 3학년이 신청할 수 있다",
        "점심이 제공된다",
        "노트북을 빌려준다",
        "학생이 직접 신청한다",
      ],
      answer: 4,
      clue: "You must bring your own laptop; the centre does not lend any.",
      explanation:
        "노트북은 각자 가져와야 하고 센터에서 빌려주지 않는다고 했다. 따라서 ④가 내용과 일치하지 않는다.",
      translation: [
        "W: Hanbit Winter Workshop에 관해 알아 두실 내용입니다. " +
          "12월 27일부터 29일까지 사흘 동안 열립니다. " +
          "2학년과 3학년 학생이 신청할 수 있고, 30자리가 있습니다. " +
          "매일 10시에 시작해 4시에 끝나며, 점심은 강당에서 제공됩니다. " +
          "노트북은 각자 가져오셔야 합니다. 센터에서는 빌려주지 않습니다. " +
          "신청은 학교가 아니라 학생이 직접 센터 누리집으로 합니다. " +
          "합격자 명단은 20일에 올라옵니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 고를 온라인 모의고사를 고르시오.",
      lines: [
        ["M", "Chaewon, these are the five online mock exam packages still open."],
        ["W", "Let's pick one. First, we need one with full explanations, not just answers."],
        ["M", "Then one is out. It only gives an answer key."],
        ["W", "Next, how many rounds are there? Fewer than eight is not enough."],
        ["M", "One has six, so that's gone as well."],
        ["W", "Three left. Do they all let you take the exam on paper?"],
        ["M", "Two do. One is screen only, and we both read worse on a screen."],
        ["W", "Two left, then. What do they cost?"],
        ["M", "We agreed on ninety thousand won at the most."],
        ["W", "Then only one fits. I'll sign us both up tonight."],
        ["M", "Good. Let's start with the first round on Saturday."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "Then only one fits. I'll sign us both up tonight.",
      explanation:
        "해설이 없는 ①, 6회차인 ②, 화면 전용인 ⑤를 뺀다. 남은 ③과 ④ 중 9만 원 이하인 것은 ④이므로 답은 ④이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "정답만 / 10회 / 인쇄 가능 / 70,000원" },
          { no: 2, label: "②", value: "해설 있음 / 6회 / 인쇄 가능 / 75,000원" },
          { no: 3, label: "③", value: "해설 있음 / 10회 / 인쇄 가능 / 100,000원" },
          { no: 4, label: "④", value: "해설 있음 / 12회 / 인쇄 가능 / 90,000원" },
          { no: 5, label: "⑤", value: "해설 있음 / 12회 / 화면 전용 / 80,000원" },
        ],
      },
      translation: [
        "M: 채원아, 아직 열려 있는 온라인 모의고사가 이 다섯 개야.",
        "W: 하나 고르자. 우선 정답만 말고 해설이 있는 게 필요해.",
        "M: 그럼 하나 빠지네. 정답만 주는 게 있어.",
        "W: 다음으로 몇 회차야? 여덟 회보다 적으면 부족해.",
        "M: 하나는 여섯 회라서 그것도 빠져.",
        "W: 셋 남았다. 다 종이로 뽑아서 풀 수 있어?",
        "M: 둘은 돼. 하나는 화면 전용인데 우리 둘 다 화면으로는 잘 안 읽히잖아.",
        "W: 그럼 둘 남았네. 가격은?",
        "M: 9만 원까지로 정했잖아.",
        "W: 그럼 하나만 맞네. 오늘 밤에 둘 다 신청할게.",
        "M: 좋아. 토요일에 1회차부터 시작하자.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Did you get your school records printed for the application?"],
        ["W", "Not yet. The office said the machine is broken."],
        ["M", "Did they say when it will be fixed?"],
        ["W", "They didn't, and the deadline is Thursday."],
        ["M", "The city education office prints them too, and it's open until six."],
      ],
      choices: [
        "Then I'll go there after school today.",
        "I need three copies in total.",
        "The application closes on Thursday.",
        "My student number is on the form.",
        "You should print yours as well.",
      ],
      answer: 1,
      clue: "The city education office prints them too, and it's open until six.",
      explanation:
        "시 교육청에서도 6시까지 발급해 준다는 말을 들었으므로, 오늘 방과 후에 거기 가겠다는 ①이 가장 자연스럽다.",
      translation: [
        "M: 원서에 낼 학교 기록 뽑았어?",
        "W: 아직. 행정실에서 기계가 고장 났대.",
        "M: 언제 고쳐진대?",
        "W: 말 안 해 주셨어. 그런데 마감이 목요일이야.",
        "M: 시 교육청에서도 뽑아 주고 6시까지 열어.",
        "W: 그럼 오늘 방과 후에 거기 갈게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "You've been carrying that heavy dictionary every day."],
        ["M", "I look up about ten words in every passage."],
        ["W", "Can't you use the app on your phone?"],
        ["M", "Phones aren't allowed in the study room."],
        ["W", "The room has three tablets you can borrow with your card."],
      ],
      choices: [
        "My dictionary is from middle school.",
        "Then I'll borrow one tomorrow.",
        "I read two passages a day.",
        "The study room closes at ten.",
        "You should bring a dictionary too.",
      ],
      answer: 2,
      clue: "The room has three tablets you can borrow with your card.",
      explanation:
        "자습실에서 학생증으로 태블릿을 빌릴 수 있다는 말을 들었으므로, 내일 빌리겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 매일 그 무거운 사전을 들고 다니네.",
        "M: 지문마다 열 낱말쯤 찾아봐.",
        "W: 휴대전화 앱을 쓰면 안 돼?",
        "M: 자습실에서는 휴대전화가 안 돼.",
        "W: 거기 학생증으로 빌릴 수 있는 태블릿이 세 대 있어.",
        "M: 그럼 내일 하나 빌릴게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Taemin, how is the university application going?"],
        ["M", "I've written the statement six times and I still hate it."],
        ["W", "Six versions. What changes between them?"],
        ["M", "The opening, mostly. I keep looking for a stronger first line."],
        ["W", "And the middle, where you explain what you actually did?"],
        ["M", "That part hasn't changed since the first draft."],
        ["W", "So you've spent three weeks on two sentences."],
        ["M", "When you say it out loud, that sounds bad."],
        ["W", "The readers spend most of their time in the middle, not the opening."],
        ["M", "I've been polishing the part they skim."],
        ["W", "Work on the middle this week and leave the first line until the end."],
      ],
      choices: [
        "Then I'll work on the middle section this week.",
        "The deadline is the end of this month.",
        "I'll ask my teacher to read it again.",
        "My statement is eight hundred characters.",
        "I'd rather start a completely new draft.",
      ],
      answer: 1,
      clue: "Work on the middle this week and leave the first line until the end.",
      explanation:
        "도입부는 마지막으로 미루고 이번 주에는 가운데 부분을 손보라는 조언을 들었으므로, 그렇게 하겠다는 ①이 가장 자연스럽다.",
      translation: [
        "W: 태민아, 대학 원서는 잘돼 가?",
        "M: 자기소개서를 여섯 번 썼는데 아직도 마음에 안 들어.",
        "W: 여섯 판이나. 판마다 뭐가 달라지는데?",
        "M: 주로 도입부. 더 센 첫 문장을 계속 찾고 있어.",
        "W: 네가 실제로 한 일을 설명하는 가운데 부분은?",
        "M: 그 부분은 첫 원고 이후로 그대로야.",
        "W: 그럼 3주 동안 두 문장에 매달린 거네.",
        "M: 소리 내어 들으니 좋지 않게 들린다.",
        "W: 읽는 사람은 도입부가 아니라 가운데에서 가장 오래 머물러.",
        "M: 나는 훑고 지나가는 부분만 다듬고 있었네.",
        "W: 이번 주에는 가운데를 손보고 첫 문장은 마지막으로 미뤄.",
        "M: 그럼 이번 주에는 가운데 부분을 손볼게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Dahye, you said the maths mock scores stopped improving?"],
        ["W", "Four tests in a row at the same score."],
        ["M", "What do you do after each test?"],
        ["W", "I mark it, check the solutions for the ones I missed, and start the next set."],
        ["M", "The same evening?"],
        ["W", "Usually within an hour. I don't like leaving it."],
        ["M", "So you never meet those questions again."],
        ["W", "I suppose not. Once I understand the solution, it feels finished."],
        ["M", "Understanding it today says nothing about next month."],
        ["W", "That's fair. I've felt sure about things I later got wrong."],
        ["M", "Put the missed questions in a folder and redo them a week later, unsolved."],
      ],
      choices: [
        "I take one mock test every week.",
        "Then I'll redo this week's missed questions next Saturday.",
        "The solutions are at the back of the book.",
        "My score has been the same since September.",
        "I'd rather try a harder problem set.",
      ],
      answer: 2,
      clue: "Put the missed questions in a folder and redo them a week later, unsolved.",
      explanation:
        "틀린 문제를 모아 두었다가 일주일 뒤에 풀이 없이 다시 풀라는 조언을 들었으므로, 다음 주 토요일에 그렇게 하겠다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 다혜야, 수학 모의고사 점수가 안 오른다고 했지?",
        "W: 네 번 연속 같은 점수야.",
        "M: 시험 보고 나서 뭘 해?",
        "W: 채점하고 틀린 것 풀이를 확인하고 다음 세트를 시작해.",
        "M: 같은 날 저녁에?",
        "W: 보통 한 시간 안에. 남겨 두는 걸 싫어해서.",
        "M: 그럼 그 문제들을 다시 만날 일이 없겠네.",
        "W: 그렇겠네. 풀이를 이해하면 끝난 느낌이야.",
        "M: 오늘 이해한 것이 다음 달에 대해 말해 주는 건 없어.",
        "W: 맞는 말이야. 확실하다고 느꼈다가 나중에 틀린 적이 있어.",
        "M: 틀린 문제를 따로 모아 뒀다가 일주일 뒤에 풀이 없이 다시 풀어 봐.",
        "W: 그럼 이번 주에 틀린 문제를 다음 주 토요일에 다시 풀어 볼게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Mr. Bae가 Suhyeon에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Mr. Bae : ________________",
      lines: [
        [
          "M",
          "Mr. Bae is a third-year homeroom teacher, and Suhyeon is one of his students. " +
            "Suhyeon has decided on four universities and has prepared thoroughly for each one. " +
            "She has read the course pages, talked to graduates, and listed her questions for every interview. " +
            "The difficulty is that she checks the admissions page of all four several times a day. " +
            "Last week she spent two evenings refreshing a page that had not changed since October. " +
            "Mr. Bae does not want her to care less; that care is why she is well prepared. " +
            "The trouble is that a page you cannot influence takes time from the work you can. " +
            "He wants to tell her to check the pages once a day, in the evening, and leave them alone otherwise. " +
            "In this situation, what would Mr. Bae most likely say to Suhyeon?",
        ],
      ],
      choices: [
        "Try applying to fewer universities this year.",
        "You should read more about each course.",
        "Check the admissions pages once a day and leave them until then.",
        "I think you should stop preparing for the interviews.",
        "Let's move your counselling to next week.",
      ],
      answer: 3,
      clue: "He wants to tell her to check the pages once a day, in the evening, and leave them alone otherwise.",
      explanation:
        "배 선생님은 수현의 준비를 문제 삼지 않으면서, 입시 누리집은 하루 한 번만 확인하라고 말하려 한다. 따라서 ③이 가장 적절하다.",
      translation: [
        "M: 배 선생님은 3학년 담임이고, 수현이는 그 반 학생입니다. " +
          "수현이는 네 개 대학을 정하고 각각에 맞춰 꼼꼼히 준비했습니다. " +
          "학과 소개를 읽고, 졸업생과 이야기하고, 면접마다 질문을 정리해 두었습니다. " +
          "문제는 네 곳의 입시 안내 쪽을 하루에도 몇 번씩 확인한다는 점입니다. " +
          "지난주에는 10월 이후로 바뀌지 않은 쪽을 새로 고치며 저녁 두 번을 보냈습니다. " +
          "배 선생님은 수현이가 덜 신경 쓰기를 바라지 않습니다. 그 마음 덕분에 준비가 잘돼 있습니다. " +
          "문제는 내가 바꿀 수 없는 쪽이, 바꿀 수 있는 일의 시간을 가져간다는 점입니다. " +
          "그래서 저녁에 하루 한 번만 확인하고 그 밖에는 들여다보지 말라고 말하고 싶습니다. " +
          "이런 상황에서 배 선생님이 수현이에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "남자가 하는 말의 주제로 가장 적절한 것은?",
      lines: [
        ["M", "Good afternoon. Today I want to look at why we write numbers the way we do."],
        ["M", "A number system is not a discovery about quantity; it is a decision about how to record it."],
        ["M", "Roman numerals repeat symbols, so adding is easy but multiplying is close to impossible."],
        ["M", "Babylonian clerks wrote in sixties, which is why an hour still has sixty minutes."],
        ["M", "The Mayan system counted in twenties and, unlike Rome, had a symbol for nothing at all."],
        ["M", "Our own digits came from India through the Arab world, and their real gift was that zero."],
        ["M", "With a zero you can keep a column empty, and the position of a digit starts to mean something."],
        ["M", "Every later machine that calculates depends on that one idea about empty columns."],
      ],
      choices: [
        "how children learn to count",
        "why mathematics is taught in every school",
        "how different peoples recorded numbers",
        "why calculators replaced paper",
        "how calendars were first made",
      ],
      answer: 3,
      clue: "A number system is not a discovery about quantity; it is a decision about how to record it.",
      explanation:
        "남자는 로마 숫자, 바빌로니아의 60진법, 마야의 20진법, 인도에서 온 숫자와 0을 들며 여러 민족이 수를 기록한 방식을 설명한다. 따라서 주제는 ③이다.",
      translation: [
        "M: 안녕하세요. 오늘은 우리가 왜 지금처럼 수를 적는지 살펴보려 합니다.",
        "M: 수 체계는 양에 대한 발견이 아니라 그것을 어떻게 기록할지에 대한 결정입니다.",
        "M: 로마 숫자는 기호를 반복해서 더하기는 쉽지만 곱하기는 거의 불가능합니다.",
        "M: 바빌로니아 서기들은 60을 단위로 적었고, 그래서 지금도 한 시간은 60분입니다.",
        "M: 마야의 체계는 20을 단위로 세었고, 로마와 달리 아무것도 없음을 나타내는 기호가 있었습니다.",
        "M: 우리가 쓰는 숫자는 인도에서 아랍 세계를 거쳐 왔고, 그 진짜 선물은 바로 0이었습니다.",
        "M: 0이 있으면 자리를 비워 둘 수 있고, 숫자의 자리가 뜻을 갖기 시작합니다.",
        "M: 이후에 계산하는 모든 기계는 빈자리에 대한 그 하나의 생각에 기대고 있습니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 것이 아닌 것은?",
      lines: [
        ["M", "Good afternoon. Today I want to look at why we write numbers the way we do."],
        ["M", "A number system is not a discovery about quantity; it is a decision about how to record it."],
        ["M", "Roman numerals repeat symbols, so adding is easy but multiplying is close to impossible."],
        ["M", "Babylonian clerks wrote in sixties, which is why an hour still has sixty minutes."],
        ["M", "The Mayan system counted in twenties and, unlike Rome, had a symbol for nothing at all."],
        ["M", "Our own digits came from India through the Arab world, and their real gift was that zero."],
        ["M", "With a zero you can keep a column empty, and the position of a digit starts to mean something."],
        ["M", "Every later machine that calculates depends on that one idea about empty columns."],
      ],
      choices: ["Roman numerals", "the Babylonian system", "the Mayan system", "Egyptian hieroglyphs", "the Indian zero"],
      answer: 4,
      clue: "The Mayan system counted in twenties and, unlike Rome, had a symbol for nothing at all.",
      explanation:
        "로마 숫자, 바빌로니아 체계, 마야 체계, 인도의 0은 언급되지만 이집트 상형문자는 언급되지 않았다. 따라서 답은 ④이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
