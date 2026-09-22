/** 고1 듣기 19회 — 사람이 직접 쓴 회차 (2026-09-21) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고1 19회",
  gradeLevel: "high1",
  speechSpeed: 0.8,
  folder: "고1 듣기",
  questions: [
    {
      order: 1,
      type: "목적 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 목적으로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Good afternoon, everyone. This is Mr. Baek from the library. " +
            "I am calling about the study room on the second floor, which many of you use after school. " +
            "Until now the room has been open to anyone who walks in, and on test weeks it fills up by four o'clock. " +
            "Students who arrive later find every seat taken, often by bags left alone for an hour. " +
            "From next Monday, seats will be given out at the desk for two hours at a time. " +
            "You take a numbered card, sit at that number, and return the card when you leave. " +
            "If a seat is empty for more than twenty minutes, the card goes back on the desk. " +
            "This is not a rule against anyone; it is simply the only way to share a room with sixty seats. " +
            "The cards start on Monday morning. Thank you for listening.",
        ],
      ],
      choices: [
        "도서관 이용 시간을 늘린다고 알리려고",
        "시험 기간에 조용히 해 달라고 부탁하려고",
        "열람실 자리를 배정하는 방식이 바뀐 것을 안내하려고",
        "도서 반납을 독촉하려고",
        "사물함 신청을 안내하려고",
      ],
      answer: 3,
      clue: "From next Monday, seats will be given out at the desk for two hours at a time.",
      explanation:
        "다음 주부터 열람실 자리를 번호표로 두 시간씩 배정한다는 것을 알리고 있다. 따라서 말의 목적은 ③이다.",
      translation: [
        "M: 여러분, 안녕하세요. 도서관 백 선생님입니다. " +
          "많은 학생이 방과 후에 쓰는 2층 열람실에 관해 말씀드리려 합니다. " +
          "지금까지는 누구나 들어와 앉을 수 있었고, 시험 기간에는 4시면 자리가 다 찹니다. " +
          "늦게 온 학생은 빈자리를 못 찾는데, 한 시간씩 가방만 놓여 있는 자리도 많습니다. " +
          "다음 주 월요일부터는 데스크에서 두 시간씩 자리를 배정합니다. " +
          "번호표를 받아 그 번호 자리에 앉고, 나갈 때 번호표를 돌려주면 됩니다. " +
          "자리가 20분 넘게 비어 있으면 번호표는 데스크로 돌아갑니다. " +
          "누구를 막으려는 규칙이 아니라, 예순 자리를 나눠 쓰는 유일한 방법입니다. " +
          "번호표는 월요일 아침부터 시작합니다. 들어 주셔서 고맙습니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 여자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Jiwon, you've started writing down what you read. Isn't that slow?"],
        ["W", "Much slower. I get through half as many books now."],
        ["M", "Then why do it? Half the books sounds like a loss."],
        ["W", "It looked like one for about a month. Then I read an old list of mine."],
        ["M", "And?"],
        ["W", "I could remember every book on the written list. Not one from the year before."],
        ["M", "Not one? You read forty that year."],
        ["W", "Forty titles I can recite and nothing else. The covers, not the books."],
        ["M", "But surely the reading itself did something."],
        ["W", "Maybe, but I can't use what I can't recall. A sentence I copied out comes back whole."],
        ["M", "How much do you actually write?"],
        ["W", "Three or four lines a chapter. It costs five minutes."],
        ["M", "Five minutes a chapter to keep the chapter."],
        ["W", "That's the trade. Twenty books I still have beat forty I don't."],
        ["M", "Then I'll start a notebook this week."],
      ],
      choices: [
        "책은 많이 읽을수록 좋다",
        "책은 빠르게 읽는 연습이 필요하다",
        "책은 장르를 가리지 않고 읽어야 한다",
        "읽은 것을 적어 두면 권수는 줄어도 남는 것이 많다",
        "독서는 혼자 하는 것이 좋다",
      ],
      answer: 4,
      clue: "That's the trade. Twenty books I still have beat forty I don't.",
      explanation:
        "여자는 적으면서 읽으면 권수는 줄지만 기억에 남는 것이 많다고 말한다. 따라서 답은 ④이다.",
      translation: [
        "M: 지원아, 읽은 걸 적기 시작했더라. 느리지 않아?",
        "W: 훨씬 느려. 예전의 절반밖에 못 읽어.",
        "M: 그런데 왜 해? 절반이면 손해 같은데.",
        "W: 한 달쯤은 손해 같았어. 그러다 예전 목록을 봤지.",
        "M: 그래서?",
        "W: 적어 둔 목록의 책은 다 기억났어. 그 전해 것은 하나도 안 났고.",
        "M: 하나도? 그해에 마흔 권 읽었잖아.",
        "W: 제목 마흔 개만 외울 뿐이야. 책이 아니라 표지를 아는 거지.",
        "M: 그래도 읽은 게 어디 가진 않았을 텐데.",
        "W: 그럴지도. 그런데 떠오르지 않는 건 쓸 수가 없어. 베껴 적은 문장은 통째로 돌아와.",
        "M: 얼마나 적는데?",
        "W: 한 장에 서너 줄. 5분이면 돼.",
        "M: 한 장을 남기는 데 5분이라.",
        "W: 그게 거래야. 남아 있는 스무 권이 남지 않은 마흔 권보다 나아.",
        "M: 그럼 나도 이번 주에 공책 하나 시작할게.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "We tell beginners to copy the experts, and then we wonder why it rarely works. " +
            "What we copy is the finished shape: the grip, the posture, the words on the page. " +
            "None of that is the skill. The skill is the set of small corrections underneath it. " +
            "An expert is not someone who does it right; an expert is someone who notices, in the first second, that it is going wrong. " +
            "That noticing cannot be photographed, so beginners copy what is visible and keep the errors invisible. " +
            "The useful question is not what does the expert do, but what does the expert catch.",
        ],
      ],
      choices: [
        "전문가에게 직접 배워야 한다",
        "기본기는 반복해서 익혀야 한다",
        "연습은 시간을 정해 놓고 해야 한다",
        "실수는 빨리 잊는 것이 좋다",
        "따라 해야 할 것은 겉모습이 아니라 잘못을 알아채는 힘이다",
      ],
      answer: 5,
      clue: "The useful question is not what does the expert do, but what does the expert catch.",
      explanation:
        "겉으로 보이는 자세나 형태가 아니라 잘못되어 가는 것을 알아채는 능력이 실력이라는 내용이다. 따라서 요지는 ⑤이다.",
      translation: [
        "W: 우리는 초보자에게 전문가를 따라 하라고 하고는, 왜 그것이 잘 안 되는지 의아해합니다. " +
          "우리가 따라 하는 것은 완성된 모양입니다. 쥐는 법, 자세, 종이에 적힌 말. " +
          "그중 어느 것도 실력이 아닙니다. 실력은 그 아래에 있는 작은 교정들의 묶음입니다. " +
          "전문가는 제대로 해내는 사람이 아니라, 첫 순간에 잘못되어 가고 있음을 알아채는 사람입니다. " +
          "그 알아챔은 사진에 찍히지 않기에, 초보자는 보이는 것만 따라 하고 오류는 보이지 않는 채로 남습니다. " +
          "쓸모 있는 질문은 전문가가 무엇을 하는가가 아니라, 전문가가 무엇을 잡아내는가입니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["W", "Junho, the club room looks completely different now."],
        ["M", "We cleared it out over the weekend."],
        ["W", "On the back wall there's a square noticeboard."],
        ["M", "We pin the practice schedule there every Monday."],
        ["W", "Under the window there's a low bench."],
        ["M", "Three people can sit on it, just about."],
        ["W", "In the middle there's a round table with four chairs."],
        ["M", "We meet around that every Thursday."],
        ["W", "In the corner on the left, is that a floor lamp?"],
        ["M", "No, it's a coat stand. The lamp went back to the art room."],
        ["W", "I see. And by the door there's a small bookcase."],
        ["M", "Two shelves of scripts. Everyone borrows from there."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "No, it's a coat stand. The lamp went back to the art room.",
      explanation:
        "남자는 왼쪽 구석에 있는 것이 스탠드 조명이 아니라 옷걸이라고 바로잡는다. 그림에는 스탠드 조명이 그려져 있으므로 ③이 대화와 일치하지 않는다.",
      figure: {
        kind: "labeled",
        scene:
          "A small club room seen from the front, five things clearly separated and none overlapping, clean black line art, no writing anywhere. " +
          "High on the back wall: a SQUARE noticeboard with a plain empty face. " +
          "Under a window on the right: a LOW BENCH with no back. " +
          "Left corner: a tall FLOOR LAMP with a cone shade on a thin pole and a round base. " +
          "Centre of the room: a ROUND TABLE with exactly FOUR chairs around it. " +
          "By the door on the far right: a small BOOKCASE with exactly TWO shelves of books.",
      },
      translation: [
        "W: 준호야, 동아리방이 완전히 달라 보인다.",
        "M: 주말에 싹 정리했어.",
        "W: 뒷벽에 네모난 게시판이 있네.",
        "M: 월요일마다 연습 일정을 거기 붙여.",
        "W: 창문 아래에는 낮은 의자가 있고.",
        "M: 세 명쯤 겨우 앉아.",
        "W: 가운데에는 둥근 탁자에 의자가 네 개 있네.",
        "M: 목요일마다 거기 둘러앉아 모여.",
        "W: 왼쪽 구석에 있는 건 스탠드 조명이야?",
        "M: 아니, 옷걸이야. 조명은 미술실로 돌려줬어.",
        "W: 그렇구나. 그리고 문 옆에는 작은 책장이 있고.",
        "M: 대본이 두 칸. 다들 거기서 빌려 가.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 남자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Seungmin, there's a problem with the field trip forms."],
        ["M", "I collected thirty-one of them yesterday. What's wrong?"],
        ["W", "The bus leaves at seven, but the form says eight."],
        ["M", "Eight? Then every parent has the wrong time."],
        ["W", "Thirty-one families expecting an extra hour."],
        ["M", "Should we hand out new forms?"],
        ["W", "There's no time. The trip is on Thursday."],
        ["M", "Then I'll send a message to every family tonight."],
        ["W", "Use the class message list. It reaches all of them at once."],
        ["M", "I'll write it after dinner and send it before nine."],
        ["W", "Thanks. I'll tell the bus company we're keeping seven."],
      ],
      choices: [
        "새 신청서를 나눠 주기",
        "가정에 문자로 시간을 알리기",
        "버스 회사에 전화하기",
        "출발 시각을 여덟 시로 바꾸기",
        "신청서를 다시 걷기",
      ],
      answer: 2,
      clue: "Then I'll send a message to every family tonight.",
      explanation:
        "남자는 오늘 밤에 모든 가정에 문자로 출발 시각을 알리기로 한다. 버스 회사에 연락하는 일은 여자가 맡았다. 따라서 답은 ②이다.",
      translation: [
        "W: 승민아, 현장 학습 신청서에 문제가 있어.",
        "M: 어제 서른한 장 걷었는데. 뭐가 잘못됐어?",
        "W: 버스는 7시에 출발하는데 신청서에는 8시로 적혀 있어.",
        "M: 8시? 그럼 모든 학부모가 시간을 잘못 알고 있겠네.",
        "W: 서른한 가정이 한 시간 더 있는 줄 알고 있지.",
        "M: 새 신청서를 나눠 줄까?",
        "W: 시간이 없어. 현장 학습이 목요일이야.",
        "M: 그럼 오늘 밤에 모든 가정에 문자를 보낼게.",
        "W: 학급 문자 목록을 써. 한 번에 다 가.",
        "M: 저녁 먹고 써서 9시 전에 보낼게.",
        "W: 고마워. 나는 버스 회사에 7시 그대로라고 알릴게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 여자가 지불할 금액을 고르시오.",
      lines: [
        ["M", "Welcome to the stationery shop. What can I get you?"],
        ["W", "I need a sketchbook and some pencils for art class."],
        ["M", "The large sketchbooks are eighteen dollars."],
        ["W", "One of those, please."],
        ["M", "And the drawing pencils are six dollars a set."],
        ["W", "I'll take two sets."],
        ["M", "Eighteen and twelve. That comes to thirty dollars."],
        ["W", "Is there a discount for students?"],
        ["M", "There is. Four dollars off with a student card."],
        ["W", "Here it is, and here's my card."],
        ["M", "Would you like an eraser as well? They're two dollars."],
        ["W", "No, thank you. I have plenty at home."],
      ],
      choices: ["$26", "$28", "$30", "$32", "$34"],
      answer: 1,
      clue: "There is. Four dollars off with a student card.",
      explanation:
        "스케치북 18달러와 연필 세트 6달러짜리 두 개 12달러를 더하면 30달러이다. 학생 할인 4달러를 빼면 26달러이고 지우개는 사지 않았으므로 답은 ①이다.",
      translation: [
        "M: 문구점입니다. 무엇을 드릴까요?",
        "W: 미술 시간에 쓸 스케치북이랑 연필이 필요해요.",
        "M: 큰 스케치북은 18달러입니다.",
        "W: 그걸로 하나 주세요.",
        "M: 그리고 데생 연필은 한 세트에 6달러입니다.",
        "W: 두 세트 할게요.",
        "M: 18달러에 12달러면 30달러입니다.",
        "W: 학생 할인 있나요?",
        "M: 있습니다. 학생증이 있으면 4달러 할인됩니다.",
        "W: 여기 있고요, 카드도 여기요.",
        "M: 지우개도 하시겠어요? 2달러입니다.",
        "W: 아니요, 괜찮아요. 집에 많아요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 여자가 아침 운동을 그만두려는 이유를 고르시오.",
      lines: [
        ["M", "Sujin, you've stopped running in the mornings."],
        ["W", "From next week, yes. I've decided."],
        ["M", "Is it your knee? You limped a bit in August."],
        ["W", "The knee has been fine since the summer. It isn't that."],
        ["M", "Then why? You've run every morning since March."],
        ["W", "My first class moved to eight o'clock this term."],
        ["M", "And you can't run before that?"],
        ["W", "I'd have to get up at five, and then I fall asleep in fourth period."],
        ["M", "So it's the timetable, not the running."],
        ["W", "Exactly. I'll run in the evening instead once it gets lighter."],
      ],
      choices: [
        "무릎을 다쳐서",
        "날씨가 추워져서",
        "함께 뛸 사람이 없어서",
        "수업 시간이 바뀌어서",
        "운동에 흥미를 잃어서",
      ],
      answer: 4,
      clue: "My first class moved to eight o'clock this term.",
      explanation:
        "첫 수업이 8시로 바뀌어 새벽에 일어나야 하고 수업 중에 졸게 되어서 그만두려 한다. 따라서 답은 ④이다.",
      translation: [
        "M: 수진아, 아침에 안 뛰더라.",
        "W: 다음 주부터 안 뛰어. 그렇게 정했어.",
        "M: 무릎 때문이야? 8월에 조금 절었잖아.",
        "W: 무릎은 여름 이후로 괜찮아. 그건 아니야.",
        "M: 그럼 왜? 3월부터 매일 아침 뛰었잖아.",
        "W: 이번 학기에 첫 수업이 8시로 옮겨졌어.",
        "M: 그 전에는 못 뛰어?",
        "W: 5시에 일어나야 하는데, 그러면 4교시에 졸아.",
        "M: 그럼 달리기가 아니라 시간표 문제네.",
        "W: 그렇지. 날이 밝아지면 저녁에 뛸 거야.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 교내 사진 공모전에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["M", "Yeeun, did you read the notice about the photo competition?"],
        ["W", "I saw the poster but I didn't stop. What is it?"],
        ["M", "Everyone submits one photograph taken inside the school this year."],
        ["W", "When do we have to hand it in?"],
        ["M", "By the twenty-fifth, to the art room."],
        ["W", "Do we print it ourselves?"],
        ["M", "Yes, A4 size, and you write the title on the back."],
        ["W", "Who decides the winners?"],
        ["M", "Three art teachers and two students from the photo club."],
        ["W", "Then I'll go through my camera roll tonight."],
        ["M", "Do it soon. The twenty-fifth is next Tuesday."],
      ],
      choices: ["출품 조건", "제출 기한", "제출 방법", "심사 위원", "상품"],
      answer: 5,
      clue: "Three art teachers and two students from the photo club.",
      explanation:
        "출품 조건(올해 교내에서 찍은 사진 한 장), 제출 기한(25일), 제출 방법(A4로 인쇄해 뒤에 제목 쓰기), 심사 위원(미술 교사 셋과 사진 동아리 학생 둘)은 언급되지만 상품은 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 예은아, 사진 공모전 공지 읽었어?",
        "W: 포스터는 봤는데 멈춰 서진 않았어. 뭐야?",
        "M: 올해 학교 안에서 찍은 사진 한 장씩 내는 거야.",
        "W: 언제까지 내야 해?",
        "M: 25일까지, 미술실로.",
        "W: 인쇄는 우리가 하고?",
        "M: 응, A4 크기로, 뒤에 제목을 써.",
        "W: 누가 심사해?",
        "M: 미술 선생님 세 분이랑 사진 동아리 학생 두 명.",
        "W: 그럼 오늘 밤에 사진첩을 훑어봐야겠다.",
        "M: 빨리 해. 25일이 다음 주 화요일이야.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Hanbit Night Market에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "W",
          "Here is what you should know about Hanbit Night Market, which began on the riverside eight years ago. " +
            "It runs on Friday and Saturday evenings only, from six until eleven. " +
            "Anyone may set up a stall, but the forty spaces are drawn by lottery at the start of each month. " +
            "Stalls must sell something made by the seller, so nothing bought in and resold. " +
            "Music is played on the small stage until nine, and after that the market stays quiet for the neighbours. " +
            "The riverside car park is closed during the market, so visitors come by bus or on foot.",
        ],
      ],
      choices: [
        "8년 전에 시작되었다",
        "금요일과 토요일 저녁에만 연다",
        "자리는 매달 추첨으로 정한다",
        "사서 되파는 물건도 팔 수 있다",
        "시장이 열리는 동안 주차장은 닫는다",
      ],
      answer: 4,
      clue: "Stalls must sell something made by the seller, so nothing bought in and resold.",
      explanation:
        "가판은 파는 사람이 직접 만든 것만 팔 수 있고 사서 되파는 것은 안 된다고 했다. 따라서 ④가 내용과 일치하지 않는다.",
      translation: [
        "W: 8년 전 강변에서 시작된 Hanbit Night Market을 소개합니다. " +
          "금요일과 토요일 저녁에만, 6시부터 11시까지 엽니다. " +
          "누구나 가판을 낼 수 있지만, 마흔 자리는 매달 초에 추첨으로 정합니다. " +
          "가판은 파는 사람이 직접 만든 것을 팔아야 하며, 사 와서 되파는 것은 안 됩니다. " +
          "작은 무대에서 9시까지 음악을 틀고, 그 뒤로는 이웃을 위해 조용히 합니다. " +
          "시장이 열리는 동안 강변 주차장은 닫으므로 버스나 도보로 오시기 바랍니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 신청할 주말 강좌를 고르시오.",
      lines: [
        ["M", "Dain, these are the five weekend courses still open in November."],
        ["W", "Let's choose one. I can't do Saturday because of my part-time job."],
        ["M", "Right, that takes out one of them."],
        ["W", "Next, how many weeks do they run? More than six is too long for me."],
        ["M", "Then one more is gone. Three are left."],
        ["W", "What do they cost?"],
        ["M", "We agreed on sixty thousand won at the most."],
        ["W", "Then one more drops out. Two left."],
        ["M", "Do they both lend out the equipment?"],
        ["W", "Only one does. For the other we'd have to buy our own."],
        ["M", "Then that's the one. I'll sign us both up tonight."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "Then that's the one. I'll sign us both up tonight.",
      explanation:
        "토요일인 ①, 8주인 ②, 70,000원인 ⑤를 뺀다. 남은 ③과 ④ 중 장비를 빌려주는 곳은 ③이므로 답은 ③이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "토요일 / 6주 / 55,000원 / 장비 대여" },
          { no: 2, label: "②", value: "일요일 / 8주 / 50,000원 / 장비 대여" },
          { no: 3, label: "③", value: "일요일 / 6주 / 55,000원 / 장비 대여" },
          { no: 4, label: "④", value: "일요일 / 4주 / 60,000원 / 장비 직접 준비" },
          { no: 5, label: "⑤", value: "일요일 / 5주 / 70,000원 / 장비 대여" },
        ],
      },
      translation: [
        "M: 다인아, 11월에 남은 주말 강좌가 이 다섯 개야.",
        "W: 하나 고르자. 아르바이트 때문에 토요일은 안 돼.",
        "M: 맞다, 그럼 하나가 빠지네.",
        "W: 다음으로 몇 주짜리야? 6주 넘으면 나한테는 너무 길어.",
        "M: 그럼 하나 더 빠진다. 세 개 남았어.",
        "W: 얼마야?",
        "M: 6만 원까지로 정했잖아.",
        "W: 그럼 하나 더 빠지고 둘 남았다.",
        "M: 둘 다 장비를 빌려줘?",
        "W: 한 곳만. 다른 하나는 우리가 사야 해.",
        "M: 그럼 거기로 하자. 오늘 밤에 둘 다 신청할게.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Have you booked the room for the group meeting?"],
        ["W", "Not yet. The office was already closed when I went."],
        ["M", "Did you try the booking page on the school site?"],
        ["W", "I thought you had to go in person."],
        ["M", "Not any more. You can book it from your phone."],
      ],
      choices: [
        "Then I'll book it right now.",
        "The meeting is on Thursday.",
        "We need a room for six people.",
        "The office opens at nine.",
        "You should book one as well.",
      ],
      answer: 1,
      clue: "Not any more. You can book it from your phone.",
      explanation:
        "이제는 휴대전화로 예약할 수 있다는 말을 들었으므로, 지금 바로 예약하겠다는 ①이 가장 자연스럽다.",
      translation: [
        "M: 모둠 모임 할 방 예약했어?",
        "W: 아직. 갔더니 행정실이 이미 닫았더라.",
        "M: 학교 누리집 예약 화면은 해 봤어?",
        "W: 직접 가야 하는 줄 알았어.",
        "M: 이제는 아니야. 휴대전화로 예약할 수 있어.",
        "W: 그럼 지금 바로 예약할게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "You've carried that heavy bag all week."],
        ["M", "All my textbooks are in it. I need them every day."],
        ["W", "Can't you leave some of them at school?"],
        ["M", "There's nowhere to put them."],
        ["W", "The shelves at the back of our classroom are half empty."],
      ],
      choices: [
        "My bag weighs about eight kilos.",
        "I have seven classes on Wednesday.",
        "The shelves look quite old.",
        "Then I'll leave three of them tomorrow.",
        "You should carry a smaller bag.",
      ],
      answer: 4,
      clue: "The shelves at the back of our classroom are half empty.",
      explanation:
        "교실 뒤 선반이 반쯤 비어 있다는 말을 들었으므로, 내일 세 권을 두고 가겠다는 ④가 가장 자연스럽다.",
      translation: [
        "W: 일주일 내내 그 무거운 가방을 들고 다니네.",
        "M: 교과서가 다 들어 있어. 매일 필요해서.",
        "W: 몇 권은 학교에 두면 안 돼?",
        "M: 둘 데가 없어.",
        "W: 우리 교실 뒤 선반이 반은 비어 있어.",
        "M: 그럼 내일 세 권은 두고 갈게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오. [3점]",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Hyunwoo, how is the school newspaper going?"],
        ["M", "We print it, and then I find it in the recycling bin."],
        ["W", "All of them?"],
        ["M", "Most. Two hundred copies and maybe thirty get read."],
        ["W", "What's in this month's issue?"],
        ["M", "A report on the sports day and an interview with the principal."],
        ["W", "Who chose those?"],
        ["M", "I did. They're the two biggest things that happened."],
        ["W", "Biggest for the school, or biggest for the reader?"],
        ["M", "I suppose I've never separated those two."],
        ["W", "Ask ten students what they'd want to read, and print the top three."],
        ["M", "What if they ask for something small?"],
        ["W", "Then print the small thing. Small and read beats big and binned."],
      ],
      choices: [
        "Then I'll ask ten students this week.",
        "The newspaper comes out every month.",
        "We print two hundred copies each time.",
        "The interview took nearly an hour.",
        "I'd rather stop printing it altogether.",
      ],
      answer: 1,
      clue: "Ask ten students what they'd want to read, and print the top three.",
      explanation:
        "학생 열 명에게 무엇을 읽고 싶은지 물어보고 많이 나온 세 가지를 실으라는 조언을 들었으므로, 이번 주에 열 명에게 물어보겠다는 ①이 가장 자연스럽다.",
      translation: [
        "W: 현우야, 학교 신문은 잘돼 가?",
        "M: 찍어 놓으면 재활용함에서 발견해.",
        "W: 전부?",
        "M: 거의. 200부 찍어서 서른 부쯤 읽히는 것 같아.",
        "W: 이번 호에는 뭐가 실렸는데?",
        "M: 체육대회 기사랑 교장 선생님 인터뷰.",
        "W: 그건 누가 정했어?",
        "M: 내가. 그 두 가지가 제일 큰일이었으니까.",
        "W: 학교한테 큰일이야, 읽는 사람한테 큰일이야?",
        "M: 그 둘을 나눠 본 적이 없네.",
        "W: 학생 열 명한테 뭘 읽고 싶은지 물어보고, 많이 나온 세 가지를 실어.",
        "M: 사소한 걸 말하면 어떡해?",
        "W: 그럼 사소한 걸 실어. 작아도 읽히는 게 커도 버려지는 것보다 나아.",
        "M: 그럼 이번 주에 열 명한테 물어볼게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오. [3점]",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Chaeyeon, you've been redoing the same maths problems for a month."],
        ["W", "The ones I got wrong on the last test. I do them again every night."],
        ["M", "And do you get them right now?"],
        ["W", "Every time. I could do them with my eyes shut."],
        ["M", "Then what are you learning from the twentieth time?"],
        ["W", "That I can do them, I suppose."],
        ["M", "You already knew that after the third. Where did the marks actually go?"],
        ["W", "Three questions I'd never seen a type of before."],
        ["M", "And have you done any more of that type since?"],
        ["W", "Not one. I keep going back to the ones I can finish."],
        ["M", "Redoing what you can do is rest, not study. Find five new ones of that type."],
      ],
      choices: [
        "My last test was out of a hundred.",
        "Then I'll find five new ones tonight.",
        "I study maths for two hours a day.",
        "The test is in three weeks.",
        "You should redo yours as well.",
      ],
      answer: 2,
      clue: "Redoing what you can do is rest, not study. Find five new ones of that type.",
      explanation:
        "할 수 있는 문제를 다시 푸는 것은 공부가 아니니 그 유형의 새 문제를 다섯 개 찾으라는 조언을 들었으므로, 오늘 밤에 다섯 개를 찾겠다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 채연아, 한 달째 같은 수학 문제를 다시 풀고 있네.",
        "W: 지난 시험에서 틀린 것들이야. 매일 밤 다시 풀어.",
        "M: 지금은 맞혀?",
        "W: 매번. 눈 감고도 풀겠어.",
        "M: 그럼 스무 번째 풀이에서 뭘 배우는 건데?",
        "W: 내가 풀 수 있다는 것 정도겠지.",
        "M: 그건 세 번째에 이미 알았잖아. 점수는 실제로 어디서 깎였어?",
        "W: 유형 자체를 처음 본 문제 세 개.",
        "M: 그 뒤로 그 유형을 더 풀어 봤어?",
        "W: 하나도. 자꾸 끝까지 풀리는 것만 다시 붙잡아.",
        "M: 할 수 있는 걸 다시 푸는 건 휴식이지 공부가 아니야. 그 유형으로 새 문제 다섯 개를 찾아.",
        "W: 그럼 오늘 밤에 다섯 개 찾을게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Mr. Noh가 Jimin에게 할 말로 가장 적절한 것을 고르시오. [3점]",
      questionText: "▶ Mr. Noh : ________________",
      lines: [
        [
          "M",
          "Mr. Noh runs the school debate team, and Jimin is one of his quickest thinkers. " +
            "She finds the weak point in an argument before anyone else in the room. " +
            "In practice rounds, however, she answers the moment the other speaker stops. " +
            "Because of that she often replies to the first sentence rather than the whole case. " +
            "Mr. Noh does not want her to slow down her thinking; that speed is why the team wins close rounds. " +
            "The trouble is that a reply aimed at one sentence leaves the real argument standing. " +
            "The regional contest is in a month, and its judges score whether the whole case was answered. " +
            "He wants to ask her to wait three seconds and name the main claim before replying. " +
            "In this situation, what would Mr. Noh most likely say to Jimin?",
        ],
      ],
      choices: [
        "Take three seconds and name their main point first.",
        "Try to speak more loudly in the final round.",
        "I think you should let someone else answer.",
        "Let's practise only written arguments from now on.",
        "You should write down every word they say.",
      ],
      answer: 1,
      clue: "He wants to ask her to wait three seconds and name the main claim before replying.",
      explanation:
        "노 선생님은 지민의 빠른 사고를 문제 삼지 않으면서, 3초 기다렸다가 상대의 핵심 주장을 짚고 답하라고 말하려 한다. 따라서 ①이 가장 적절하다.",
      translation: [
        "M: 노 선생님은 학교 토론팀을 맡고 있고, 지민이는 그중 가장 빠르게 생각하는 학생입니다. " +
          "지민이는 누구보다 먼저 상대 주장의 약한 고리를 찾아냅니다. " +
          "그런데 연습 토론에서 상대가 말을 멈추는 순간 바로 대답합니다. " +
          "그러다 보니 전체 주장이 아니라 첫 문장에만 답하는 일이 잦습니다. " +
          "노 선생님은 지민이가 생각을 늦추기를 바라지 않습니다. 그 빠름 덕분에 팀이 박빙의 경기를 이깁니다. " +
          "문제는 한 문장만 겨냥한 반박은 진짜 주장을 그대로 세워 둔다는 점입니다. " +
          "지역 대회는 한 달 뒤이고, 심사위원은 전체 주장에 답했는지를 점수로 봅니다. " +
          "그래서 3초를 기다렸다가 상대의 핵심 주장을 짚고 답해 달라고 부탁하고 싶습니다. " +
          "이런 상황에서 노 선생님이 지민이에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "여자가 하는 말의 주제로 가장 적절한 것은?",
      lines: [
        ["W", "Good morning. Today I want to talk about plants that catch and eat animals."],
        ["W", "They grow where the soil gives almost nothing, so they take their nitrogen from insects instead."],
        ["W", "The Venus flytrap counts: one touch on a hair does nothing, but a second within twenty seconds shuts the leaf."],
        ["W", "The pitcher plant builds a deep jar of liquid with a rim so slippery that an insect cannot hold on."],
        ["W", "The sundew covers its leaves in drops that look like water and turn out to be glue."],
        ["W", "The bladderwort, underwater, opens a tiny trapdoor and pulls in its prey faster than the eye can follow."],
        ["W", "None of them hunts. Each one simply makes waiting profitable."],
        ["W", "That is the part worth remembering: the trap does the work the roots cannot."],
      ],
      choices: [
        "how plants take in water",
        "plants that catch and eat animals",
        "why insects visit flowers",
        "how soil is formed in wetlands",
        "why some plants grow slowly",
      ],
      answer: 2,
      clue: "None of them hunts. Each one simply makes waiting profitable.",
      explanation:
        "여자는 파리지옥, 벌레잡이통풀, 끈끈이주걱, 통발이 벌레를 잡아 양분을 얻는 방식을 설명한다. 따라서 주제는 ②이다.",
      translation: [
        "W: 안녕하세요. 오늘은 동물을 잡아먹는 식물에 대해 이야기하려 합니다.",
        "W: 이들은 흙이 거의 아무것도 주지 못하는 곳에서 자라기에, 질소를 곤충에게서 얻습니다.",
        "W: 파리지옥은 수를 셉니다. 털을 한 번 건드리면 아무 일도 없지만, 20초 안에 두 번째가 오면 잎이 닫힙니다.",
        "W: 벌레잡이통풀은 액체가 담긴 깊은 항아리를 만드는데, 테두리가 너무 미끄러워 곤충이 버티지 못합니다.",
        "W: 끈끈이주걱은 잎을 물방울처럼 보이는 것으로 덮는데, 알고 보면 그것이 접착제입니다.",
        "W: 통발은 물속에서 작은 문을 열어 눈으로 좇을 수 없는 속도로 먹이를 빨아들입니다.",
        "W: 어느 것도 사냥하지 않습니다. 저마다 기다림을 이득이 되게 만들 뿐입니다.",
        "W: 기억할 대목은 바로 그것입니다. 뿌리가 못 하는 일을 덫이 대신합니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 식물이 아닌 것은?",
      lines: [
        ["W", "Good morning. Today I want to talk about plants that catch and eat animals."],
        ["W", "They grow where the soil gives almost nothing, so they take their nitrogen from insects instead."],
        ["W", "The Venus flytrap counts: one touch on a hair does nothing, but a second within twenty seconds shuts the leaf."],
        ["W", "The pitcher plant builds a deep jar of liquid with a rim so slippery that an insect cannot hold on."],
        ["W", "The sundew covers its leaves in drops that look like water and turn out to be glue."],
        ["W", "The bladderwort, underwater, opens a tiny trapdoor and pulls in its prey faster than the eye can follow."],
        ["W", "None of them hunts. Each one simply makes waiting profitable."],
        ["W", "That is the part worth remembering: the trap does the work the roots cannot."],
      ],
      choices: ["Venus flytrap", "pitcher plant", "water lily", "sundew", "bladderwort"],
      answer: 3,
      clue: "The sundew covers its leaves in drops that look like water and turn out to be glue.",
      explanation:
        "파리지옥, 벌레잡이통풀, 끈끈이주걱, 통발은 언급되지만 수련은 언급되지 않았다. 따라서 답은 ③이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
