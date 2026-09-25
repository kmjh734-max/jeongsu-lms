/** 고3 듣기 25회 — 사람이 직접 쓴 회차 (2026-09-25) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고3 25회",
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
          "Good evening, parents and students. This is Hyunwoo Nam from the school administration. " +
            "I am writing about the practice exam results that went out yesterday. " +
            "Several families have asked whether the percentile printed on the sheet " +
            "is the same as the one used for university admission. " +
            "It is not, and I want to make that clear before anyone plans around it. " +
            "Our percentile is calculated within this school only, " +
            "using the roughly four hundred students who sat the exam here. " +
            "The national percentile, which is what universities look at, " +
            "comes from the testing agency about three weeks later. " +
            "A student near the top here may sit in a very different place nationally, " +
            "in either direction. " +
            "Please wait for the agency's report before drawing conclusions. Thank you.",
        ],
      ],
      choices: [
        "모의고사 일정 변경을 알리려고",
        "성적표 재발급을 안내하려고",
        "대학 입시 설명회를 알리려고",
        "채점 오류를 사과하려고",
        "교내 백분위와 전국 백분위가 다름을 알리려고",
      ],
      answer: 5,
      clue: "Our percentile is calculated within this school only, using the roughly four hundred students who sat the exam here.",
      explanation:
        "남자는 성적표의 백분위가 교내 기준이며 대학이 보는 전국 백분위는 3주 뒤에 나온다는 것을 알린다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 학부모님과 학생 여러분, 안녕하세요. 학교 행정실 남현우입니다. 어제 나간 모의고사 성적 때문에 알려 드립니다. 성적표에 찍힌 백분위가 대학 입시에 쓰이는 백분위와 같은 것인지 여러 가정에서 물어 오셨습니다. 같지 않으며, 그것을 계획 세우기 전에 분명히 해 두고 싶습니다. 저희 백분위는 이 학교에서 시험을 본 사백 명 남짓만을 놓고 계산한 교내 기준입니다. 대학이 보는 전국 백분위는 시험 기관에서 3주쯤 뒤에 나옵니다. 여기서 상위권인 학생이 전국에서는 아주 다른 자리에 있을 수 있고, 그 방향은 위일 수도 아래일 수도 있습니다. 기관의 성적표가 나온 뒤에 판단해 주시기 바랍니다. 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 여자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Jiwon, I've made a list of forty universities to apply to."],
        ["W", "Forty? How many essays does that come to?"],
        ["M", "Each one wants two, so eighty essays."],
        ["W", "And how long would a good essay take you?"],
        ["M", "A few hours. Maybe four if I revise it."],
        ["W", "So three hundred hours between now and December."],
        ["M", "When you say it that way it sounds impossible."],
        ["W", "It is impossible. So what actually happens is eighty weak essays."],
        ["M", "But a wider net catches more, doesn't it?"],
        ["W", "Not when the net is made of thread you spread too thin."],
        ["M", "So how many should I keep?"],
        ["W", "Eight, and write sixteen essays you would not be embarrassed by."],
      ],
      choices: [
        "지원은 많이 할수록 유리하다",
        "자기소개서는 미리 써 두어야 한다",
        "지원 수를 줄이고 서류의 질을 높여야 한다",
        "대학은 성적으로 정해야 한다",
        "진학 상담을 자주 받아야 한다",
      ],
      answer: 3,
      clue: "Eight, and write sixteen essays you would not be embarrassed by.",
      explanation:
        "여자는 지원처를 넓히면 서류가 얇아진다며, 여덟 곳으로 줄이고 부끄럽지 않을 글을 쓰라고 말한다. 따라서 답은 ③이다.",
      translation: [
        "M: 지원아, 나 지원할 대학을 마흔 곳 적어 뒀어.",
        "W: 마흔? 그럼 글은 몇 편이야?",
        "M: 한 곳에 두 편씩이니까 여든 편.",
        "W: 좋은 글 한 편에 얼마나 걸리는데?",
        "M: 몇 시간. 고치면 네 시간쯤.",
        "W: 그럼 지금부터 12월까지 300시간이네.",
        "M: 그렇게 말하니까 불가능하게 들린다.",
        "W: 불가능해. 그래서 실제로는 약한 글 여든 편이 나오는 거야.",
        "M: 그래도 그물을 넓게 치면 더 잡지 않아?",
        "W: 너무 얇게 편 실로 만든 그물이면 아니지.",
        "M: 그럼 몇 곳을 남길까?",
        "W: 여덟 곳. 그리고 부끄럽지 않을 글 열여섯 편을 써.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "There is a strange thing that happens to any measure once people are judged by it. " +
            "A hospital measured on waiting times will get waiting times down, " +
            "sometimes by seeing the easy cases first. " +
            "A school measured on pass rates will raise pass rates, " +
            "sometimes by steering borderline students away from the harder subject. " +
            "In each case the number improves and the thing the number was supposed to stand for does not. " +
            "This is not usually dishonesty. " +
            "People respond to what is counted, and what is counted is never the whole thing. " +
            "So when you choose a measure, ask a second question straight away. " +
            "If someone wanted to move this number without doing the real work, " +
            "what is the easiest way? " +
            "Whatever the answer is, that is what you will eventually get.",
        ],
      ],
      choices: [
        "지표는 그것을 쉽게 올리는 방법까지 따져 정해야 한다",
        "숫자로 평가하면 안 된다",
        "병원과 학교는 다르게 평가해야 한다",
        "정직한 보고가 가장 중요하다",
        "평가는 자주 바꾸어야 한다",
      ],
      answer: 1,
      clue: "If someone wanted to move this number without doing the real work, what is the easiest way?",
      explanation:
        "남자는 지표가 평가에 쓰이면 사람들이 그 숫자에 반응한다며, 지표를 고를 때 그것을 쉽게 올릴 방법까지 물어야 한다고 말한다. 따라서 답은 ①이다.",
      translation: [
        "M: 어떤 지표든 사람들이 그것으로 평가받기 시작하면 이상한 일이 일어납니다. 대기 시간으로 평가받는 병원은 대기 시간을 줄입니다. 때로는 쉬운 환자를 먼저 봄으로써요. 합격률로 평가받는 학교는 합격률을 올립니다. 때로는 경계에 선 학생을 어려운 과목에서 돌려세움으로써요. 어느 경우든 숫자는 좋아지고, 그 숫자가 대신하기로 했던 것은 좋아지지 않습니다. 이것은 대개 부정직함이 아닙니다. 사람들은 세어지는 것에 반응하고, 세어지는 것은 결코 전부가 아닙니다. 그러니 지표를 고를 때는 곧바로 두 번째 질문을 하세요. 누군가 진짜 일을 하지 않고 이 숫자를 움직이고 싶다면 가장 쉬운 방법은 무엇인가. 그 답이 무엇이든, 결국 여러분이 얻게 될 것이 바로 그것입니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["W", "Junyoung, is this the corner you made into a tea station?"],
        ["M", "Yes, the staff room finally has one."],
        ["W", "There's an electric kettle at the left end of the counter."],
        ["M", "It boils in ninety seconds, which matters between classes."],
        ["W", "And a wall calendar hangs above the counter."],
        ["M", "We mark the duty roster on it."],
        ["W", "I count five mugs hanging on the hooks."],
        ["M", "There are six. One is behind the kettle."],
        ["W", "The wooden tray in the middle holds the tea tins."],
        ["M", "Four kinds, and they get refilled every Friday."],
        ["W", "And a small stool sits under the counter."],
        ["M", "For whoever wants to sit for three minutes."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "There are six. One is behind the kettle.",
      explanation:
        "여자가 컵이 다섯 개라고 하자 남자가 여섯 개라고 바로잡는다. 그림에는 다섯 개가 그려져 있으므로 답은 ③이다.",
      figure: {
        kind: "scene",
        scene:
          "A tea station on a counter drawn as one wide picture, clean black line art on white, no writing or letters or numbers anywhere. " +
          "An ELECTRIC KETTLE stands at the left end of the counter. " +
          "A WALL CALENDAR with an empty grid hangs on the wall above the counter. " +
          "Exactly FIVE MUGS hang in a row from hooks under a shelf, clearly countable and well separated. " +
          "A WOODEN TRAY holding four tea tins sits in the middle of the counter. " +
          "A SMALL STOOL sits on the floor under the counter.",
      },
      translation: [
        "W: 준영아, 이게 차 마시는 자리로 만든 구석이야?",
        "M: 응, 교무실에 드디어 하나 생겼어.",
        "W: 조리대 왼쪽 끝에 전기 주전자가 있네.",
        "M: 90초면 끓어. 쉬는 시간엔 그게 중요해.",
        "W: 그리고 조리대 위에 벽걸이 달력이 걸려 있어.",
        "M: 당번표를 거기에 표시해.",
        "W: 고리에 컵이 다섯 개 걸린 게 보여.",
        "M: 여섯 개야. 하나는 주전자 뒤에 있어.",
        "W: 가운데 나무 쟁반에는 차 통이 있네.",
        "M: 네 종류. 금요일마다 채워 둬.",
        "W: 그리고 조리대 밑에 작은 의자가 있어.",
        "M: 3분이라도 앉고 싶은 사람을 위해서.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 여자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Jiwon, the mock interview session starts at two."],
        ["W", "I know. Did the three alumni interviewers confirm?"],
        ["M", "All three. The last one called this morning."],
        ["W", "Good. And the student list with the time slots?"],
        ["M", "Printed. It's taped to the door of room 302."],
        ["W", "Then what's still open?"],
        ["M", "Nobody has moved the chairs into the interview rooms."],
        ["W", "How many rooms are we using?"],
        ["M", "Three, and each needs two chairs and a small table."],
        ["W", "The chairs are stacked in the back of the gym."],
        ["M", "I'd carry them, but I have to brief the interviewers at one thirty."],
        ["W", "Then I'll bring the chairs and tables into the three rooms."],
      ],
      choices: [
        "면접관에게 연락하기",
        "의자와 탁자 옮기기",
        "명단 붙이기",
        "면접관 안내하기",
        "체육관 청소하기",
      ],
      answer: 2,
      clue: "Then I'll bring the chairs and tables into the three rooms.",
      explanation:
        "면접관 확인과 명단은 끝났고 남자는 면접관을 안내해야 하므로, 여자가 의자와 탁자를 세 방에 옮기기로 한다. 따라서 답은 ②이다.",
      translation: [
        "M: 지원아, 모의 면접이 2시에 시작해.",
        "W: 알아. 동문 면접관 세 분 확답 왔어?",
        "M: 세 분 다. 마지막 분이 오늘 아침에 전화 주셨어.",
        "W: 좋아. 시간대가 적힌 학생 명단은?",
        "M: 인쇄했어. 302호 문에 붙여 뒀어.",
        "W: 그럼 아직 남은 게 뭐야?",
        "M: 면접실에 의자를 아무도 안 옮겼어.",
        "W: 방을 몇 개 써?",
        "M: 세 개. 각각 의자 두 개랑 작은 탁자가 필요해.",
        "W: 의자는 체육관 뒤쪽에 쌓여 있어.",
        "M: 내가 옮기고 싶은데, 1시 30분에 면접관분들께 설명해 드려야 해.",
        "W: 그럼 내가 의자랑 탁자를 세 방에 옮길게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 남자가 지불할 금액을 고르시오.",
      lines: [
        ["W", "Welcome to Brightline Photo Studio. How can I help you?"],
        ["M", "I need six sets of application photos, please."],
        ["W", "A set of four prints is fifteen dollars."],
        ["M", "So ninety dollars for the six sets."],
        ["W", "That's right. Would you like the digital file as well?"],
        ["M", "How much does the file cost?"],
        ["W", "Ten dollars, once, no matter how many sets."],
        ["M", "I'll take the file. The online forms need it."],
        ["W", "One hundred, then. Are you a student here?"],
        ["M", "Yes, here's my card."],
        ["W", "Then I can take twenty percent off the prints, but not the file."],
        ["M", "Understood. I'll pay by card."],
      ],
      choices: ["$72.00", "$80.00", "$90.00", "$100.00", "$82.00"],
      answer: 5,
      clue: "Then I can take twenty percent off the prints, but not the file.",
      explanation:
        "사진 여섯 세트 90달러에서 20퍼센트를 빼면 72달러이고, 할인이 안 되는 파일 값 10달러를 더하면 82달러이다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 브라이트라인 사진관입니다. 무엇을 도와드릴까요?",
        "M: 원서용 사진 여섯 세트 부탁드려요.",
        "W: 넉 장 한 세트에 15달러입니다.",
        "M: 그럼 여섯 세트에 90달러네요.",
        "W: 맞습니다. 파일도 받으시겠어요?",
        "M: 파일은 얼마예요?",
        "W: 10달러입니다. 세트 수와 상관없이 한 번만요.",
        "M: 파일도 받을게요. 온라인 서류에 필요해요.",
        "W: 그럼 100달러입니다. 여기 학생이세요?",
        "M: 네, 여기 학생증이요.",
        "W: 그럼 인화비에서 20퍼센트를 빼 드립니다. 파일은 빼 드릴 수 없어요.",
        "M: 알겠습니다. 카드로 낼게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 여자가 기숙사를 나가려는 이유를 고르시오.",
      lines: [
        ["M", "Jiwon, I heard you're moving out of the dormitory."],
        ["W", "At the end of this month, yes."],
        ["M", "Is the room too small for you?"],
        ["W", "The room is fine. I've never minded it."],
        ["M", "Then is it the fee? It went up again this year."],
        ["W", "The fee is still cheaper than anywhere nearby."],
        ["M", "So what is it?"],
        ["W", "Lights out is at eleven, and I do my best work after that."],
        ["M", "Can't you study in the common room?"],
        ["W", "That closes at eleven too. I've tried everything else already."],
      ],
      choices: [
        "방이 좁아서",
        "기숙사비가 올라서",
        "소등 시간이 이른 편이어서",
        "친구와 다퉈서",
        "집이 가까워서",
      ],
      answer: 3,
      clue: "Lights out is at eleven, and I do my best work after that.",
      explanation:
        "방 크기도 비용도 문제가 아니고, 11시 소등 뒤에 집중이 잘 되는데 휴게실도 같은 시각에 닫기 때문이다. 따라서 답은 ③이다.",
      translation: [
        "M: 지원아, 기숙사에서 나간다며.",
        "W: 응, 이달 말에.",
        "M: 방이 너무 좁아?",
        "W: 방은 괜찮아. 한 번도 불편한 적 없었어.",
        "M: 그럼 비용 때문이야? 올해 또 올랐잖아.",
        "W: 그래도 근처 어디보다 싸.",
        "M: 그럼 뭔데?",
        "W: 11시에 불을 끄는데, 나는 그 뒤에 가장 잘돼.",
        "M: 휴게실에서 공부하면 안 돼?",
        "W: 거기도 11시에 닫아. 다른 건 이미 다 해 봤어.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, Autumn Essay Contest에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["M", "Jiwon, are you entering the Autumn Essay Contest?"],
        ["W", "I might. I entered two years ago and got nowhere."],
        ["M", "That was a different set of judges, for what it's worth."],
        ["W", "Fair enough. When does it close this year?"],
        ["M", "The thirtieth of October, at midnight."],
        ["W", "That's three weeks from Friday. How long does the essay have to be?"],
        ["M", "Between twelve hundred and fifteen hundred words."],
        ["W", "That's manageable alongside everything else. Is there a set topic?"],
        ["M", "One word, and this year the word is boundary."],
        ["W", "One word is harder than a question, somehow."],
        ["M", "It is, but it lets you take it anywhere you want."],
        ["W", "True. Who judges it this time?"],
        ["M", "Two writers and a professor from the literature department."],
        ["W", "So people who read a lot of student writing."],
        ["M", "Which means they'll notice if you rush it."],
        ["W", "Is there a prize, or just the honour?"],
        ["M", "The top three get published in the city magazine."],
        ["W", "Then I'll start tonight and show you a draft on Sunday."],
      ],
      choices: ["참가 자격", "마감일", "분량", "주제", "심사위원"],
      answer: 1,
      clue: "참가 자격은 대화에서 언급되지 않았다.",
      explanation:
        "마감일(10월 30일 자정), 분량(1200~1500단어), 주제(경계), 심사위원(작가 두 명과 교수 한 명)은 언급되지만 참가 자격은 언급되지 않았다. 따라서 답은 ①이다.",
      translation: [
        "M: 지원아, 가을 글쓰기 대회 나갈 거야?",
        "W: 나갈지도. 2년 전에 냈다가 아무 소득이 없었어.",
        "M: 그때랑은 심사위원이 다르긴 해.",
        "W: 그건 그래. 올해는 언제 마감이야?",
        "M: 10월 30일 자정.",
        "W: 금요일부터 3주네. 분량은 얼마나 돼야 해?",
        "M: 1200단어에서 1500단어 사이.",
        "W: 다른 것들이랑 같이 해도 할 만하겠다. 주제가 정해져 있어?",
        "M: 한 단어야. 올해는 '경계'.",
        "W: 한 단어가 오히려 질문보다 어렵더라.",
        "M: 그렇지. 그래도 어디로든 끌고 갈 수 있어.",
        "W: 맞아. 이번엔 누가 심사해?",
        "M: 작가 두 분이랑 문예창작과 교수 한 분.",
        "W: 학생 글을 많이 읽어 본 분들이네.",
        "M: 그러니까 급하게 쓰면 티가 나겠지.",
        "W: 상이 있어, 아니면 명예뿐이야?",
        "M: 상위 세 편은 시 잡지에 실려.",
        "W: 그럼 오늘 밤부터 쓰고 일요일에 초고 보여 줄게.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Hollow Rock Sea Cave에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "W",
          "Let me tell you about the Hollow Rock Sea Cave. " +
            "The cave sits at the base of a cliff on the western coast, " +
            "and it can only be reached on foot at low tide. " +
            "The walk from the car park takes about forty minutes across wet rock. " +
            "Guided visits run twice a day, but only on days when the tide allows it. " +
            "There is no lighting inside, so every visitor is handed a torch at the entrance. " +
            "The cave is closed from December to February because of winter swells. " +
            "Children under ten are not permitted, as the floor is uneven throughout.",
        ],
      ],
      choices: [
        "서쪽 해안 절벽 아래에 있다",
        "썰물 때만 걸어서 갈 수 있다",
        "주차장에서 40분쯤 걷는다",
        "안에 조명이 설치되어 있다",
        "12월부터 2월까지 닫는다",
      ],
      answer: 4,
      clue: "There is no lighting inside, so every visitor is handed a torch at the entrance.",
      explanation:
        "안에 조명이 없어 입구에서 손전등을 나눠 준다고 했으므로 ④는 내용과 다르다. 따라서 답은 ④이다.",
      translation: [
        "W: 할로록 해식 동굴을 소개해 드리겠습니다. 이 동굴은 서쪽 해안 절벽 아래에 있고, 썰물 때만 걸어서 갈 수 있습니다. 주차장에서 젖은 바위를 건너 40분쯤 걷습니다. 안내 방문은 하루 두 번 있지만, 물때가 맞는 날에만 합니다. 안에는 조명이 없어서 입구에서 방문객마다 손전등을 받습니다. 겨울 너울 때문에 12월부터 2월까지는 닫습니다. 바닥이 곳곳이 고르지 않아 열 살 미만 어린이는 들어갈 수 없습니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 예약할 자습실 좌석을 고르시오.",
      lines: [
        ["M", "Jiwon, let's book seats at the study hall for December."],
        ["W", "Five types are listed. Do we want a window seat?"],
        ["M", "Not necessary. What matters is the partition."],
        ["W", "Agreed. A full partition, not a half one."],
        ["M", "Right. And the hours? I need it open past ten."],
        ["W", "Same. I don't get going until after dinner."],
        ["M", "And the monthly fee? I have a hundred and fifty thousand won."],
        ["W", "Mine's the same, so that's the ceiling."],
        ["M", "Then only one type clears everything."],
        ["W", "Let's reserve before the December list opens to everyone."],
        ["M", "I'll do it now on the desk system."],
        ["W", "Book two seats next to each other if you can."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 2,
      clue: "Agreed. A full partition, not a half one.",
      explanation:
        "칸막이가 전면이고, 10시 이후까지 열며, 월 15만 원 이하인 좌석을 고른다. 세 조건을 모두 채우는 것은 ②이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Partition: Half / Open until: 11 p.m. / Fee: 110,000 won" },
          { no: 2, label: "②", value: "Partition: Full / Open until: 11 p.m. / Fee: 140,000 won" },
          { no: 3, label: "③", value: "Partition: Full / Open until: 9 p.m. / Fee: 100,000 won" },
          { no: 4, label: "④", value: "Partition: Full / Open until: midnight / Fee: 190,000 won" },
          { no: 5, label: "⑤", value: "Partition: Half / Open until: midnight / Fee: 95,000 won" },
        ],
      },
      translation: [
        "M: 지원아, 12월 자습실 자리 예약하자.",
        "W: 다섯 종류 있네. 창가 자리로 할까?",
        "M: 꼭 필요하진 않아. 중요한 건 칸막이야.",
        "W: 동의해. 반칸 말고 전면 칸막이로.",
        "M: 그래. 시간은? 나는 10시 넘어서도 열어야 해.",
        "W: 나도. 저녁 먹고 나서야 시동이 걸려.",
        "M: 월 이용료는? 나는 15만 원 있어.",
        "W: 나도 같아. 그럼 그게 한계네.",
        "M: 그럼 다 맞는 건 하나뿐이야.",
        "W: 12월 명단이 전체에 열리기 전에 예약하자.",
        "M: 지금 데스크 시스템에서 할게.",
        "W: 할 수 있으면 나란히 붙은 자리로 두 개.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["W", "Junyoung, is the shuttle to the exam center running on Saturday?"],
        ["M", "It is, but it leaves from the east gate, not the main one."],
        ["W", "The east gate? I've never used that side."],
        ["M", "Go past the gym and turn left. It's five minutes from the main gate."],
      ],
      choices: [
        "The shuttle was cancelled.",
        "My exam is on Sunday.",
        "I'll use the main gate anyway.",
        "There is no east gate.",
        "I'll go past the gym, then.",
      ],
      answer: 5,
      clue: "Go past the gym and turn left. It's five minutes from the main gate.",
      explanation:
        "남자가 체육관을 지나 왼쪽으로 돌라고 알려 주었으므로, 체육관을 지나가겠다는 ⑤가 가장 자연스럽다.",
      translation: [
        "W: 준영아, 토요일에 고사장 가는 셔틀 다녀?",
        "M: 다녀. 그런데 정문 말고 동문에서 출발해.",
        "W: 동문? 그쪽은 써 본 적이 없어.",
        "M: 체육관 지나서 왼쪽으로 돌아. 정문에서 5분이야.",
        "W: 그럼 체육관 지나서 갈게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["M", "Jiwon, my transcript request has been pending for a week."],
        ["W", "Did you pay the issuing fee?"],
        ["M", "I thought it was free for current students."],
        ["W", "It's free at the desk but not online. Pay it and it goes through."],
      ],
      choices: [
        "I already got my transcript.",
        "The fee was refunded.",
        "I'll pay the fee tonight.",
        "I'm not a current student.",
        "I'll request it again online.",
      ],
      answer: 3,
      clue: "It's free at the desk but not online. Pay it and it goes through.",
      explanation:
        "여자가 수수료를 내면 처리된다고 했으므로, 오늘 밤 내겠다는 ③이 가장 자연스럽다.",
      translation: [
        "M: 지원아, 내 성적증명서 신청이 일주일째 대기 중이야.",
        "W: 발급 수수료는 냈어?",
        "M: 재학생은 무료인 줄 알았는데.",
        "W: 창구에서는 무료인데 온라인은 아니야. 내면 처리돼.",
        "M: 오늘 밤에 수수료 낼게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Jiwon, you've been studying with the same six friends since March."],
        ["W", "We cover the same subjects. It's efficient."],
        ["M", "How often does someone in the group explain something you hadn't seen?"],
        ["W", "Less often than at the start, honestly."],
        ["M", "Because you've all converged on the same way of seeing it."],
        ["W", "I suppose we finish each other's reasoning now."],
        ["M", "That feels like understanding and it's actually agreement."],
        ["W", "So the group has stopped testing me."],
        ["M", "It stopped a while ago. That's not anyone's fault."],
        ["W", "What would you do about it?"],
        ["M", "Sit with a group from another class once a week and see what breaks."],
      ],
      choices: [
        "I'll join another group on Wednesdays.",
        "I'll study alone from now on.",
        "Our group explains everything well.",
        "I'll leave the group for good.",
        "Agreement is the same as understanding.",
      ],
      answer: 1,
      clue: "Sit with a group from another class once a week and see what breaks.",
      explanation:
        "남자가 일주일에 한 번 다른 반 모둠과 앉아 보라고 했으므로, 수요일에 다른 모둠에 가겠다는 ①이 가장 자연스럽다.",
      translation: [
        "M: 지원아, 3월부터 같은 친구 여섯 명이랑만 공부했네.",
        "W: 같은 과목을 보니까 효율적이야.",
        "M: 그 모둠에서 네가 못 본 걸 설명해 주는 일이 얼마나 자주 있어?",
        "W: 솔직히 처음보다는 줄었어.",
        "M: 다들 같은 방식으로 보게 수렴했으니까.",
        "W: 이제 서로 추론을 대신 끝내 주는 것 같아.",
        "M: 그건 이해처럼 느껴지지만 사실은 동의야.",
        "W: 그럼 모둠이 나를 시험하기를 그만둔 거네.",
        "M: 꽤 전에 그만뒀지. 누구 잘못도 아니야.",
        "W: 너라면 어떻게 하겠어?",
        "M: 일주일에 한 번 다른 반 모둠과 앉아 보고 뭐가 깨지는지 봐.",
        "W: 수요일에 다른 모둠에 가 볼게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Junyoung, you've read that chapter four times this week."],
        ["M", "It still doesn't feel like I know it."],
        ["W", "What did you do after the fourth reading?"],
        ["M", "Started the fifth."],
        ["W", "Have you ever closed the book and tried to say it out loud?"],
        ["M", "No. That feels like it would go badly."],
        ["W", "It would, the first time. That's the information."],
        ["M", "So the failing is the point."],
        ["W", "It shows you the gaps. Rereading only shows you familiar sentences."],
        ["M", "And familiar feels like known."],
        ["W", "Close it tonight and explain the chapter to the wall."],
      ],
      choices: [
        "I'll read it a fifth time.",
        "I already know the chapter.",
        "There are no gaps left.",
        "I'll try explaining it tonight.",
        "Rereading works best for me.",
      ],
      answer: 4,
      clue: "Close it tonight and explain the chapter to the wall.",
      explanation:
        "여자가 오늘 밤 책을 덮고 단원을 소리 내어 설명해 보라고 했으므로, 오늘 밤 해 보겠다는 ④가 가장 자연스럽다.",
      translation: [
        "W: 준영아, 이번 주에 그 단원을 네 번이나 읽었네.",
        "M: 그래도 안다는 느낌이 안 들어.",
        "W: 네 번째로 읽고 나서 뭘 했어?",
        "M: 다섯 번째를 시작했지.",
        "W: 책을 덮고 소리 내어 말해 본 적은 있어?",
        "M: 아니. 잘 안될 것 같은데.",
        "W: 처음엔 잘 안되지. 그게 바로 정보야.",
        "M: 그럼 잘 안되는 게 핵심이구나.",
        "W: 빈 곳을 보여 주니까. 다시 읽기는 익숙한 문장만 보여 줘.",
        "M: 익숙한 건 아는 것처럼 느껴지고.",
        "W: 오늘 밤엔 덮고 벽에다 그 단원을 설명해 봐.",
        "M: 오늘 밤에 설명해 볼게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Eunbi가 Chanho에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Eunbi : ________________",
      lines: [
        [
          "W",
          "Eunbi and Chanho are putting together the graduation slideshow, which plays on Friday. " +
            "Chanho has collected photos from every class and arranged them beautifully. " +
            "Eunbi notices that the slideshow runs for twenty-eight minutes, " +
            "but the ceremony programme gives the slideshow a ten-minute slot " +
            "between the principal's speech and the awards. " +
            "Last year the sound was cut off mid-slide when a segment ran long, " +
            "and the last three classes never appeared on screen at all. " +
            "Chanho has put the third-year photos, the ones everyone came to see, at the very end. " +
            "There are two days left and the file can be trimmed in an afternoon. " +
            "She wants to tell him to cut it to ten minutes so the third-year photos are reached. " +
            "In this situation, what would Eunbi most likely say to Chanho?",
        ],
      ],
      choices: [
        "We should add more photos to the beginning.",
        "Let's cut it to ten minutes so the last photos play.",
        "Let's ask for a longer ceremony.",
        "We should play it without any sound.",
        "Let's move the slideshow to next week.",
      ],
      answer: 2,
      clue: "She wants to tell him to cut it to ten minutes so the third-year photos are reached.",
      explanation:
        "은비는 3학년 사진까지 나오도록 10분으로 줄이자고 말하려 하므로 ②가 가장 적절하다.",
      translation: [
        "W: 은비와 찬호는 금요일에 틀 졸업 영상을 만들고 있습니다. 찬호는 모든 반에서 사진을 모아 보기 좋게 엮었습니다. 은비는 영상이 28분짜리인데, 식순에는 교장 선생님 말씀과 시상 사이에 10분만 배정되어 있다는 것을 알아챕니다. 작년에는 한 순서가 길어지자 영상 중간에 소리가 끊겼고, 마지막 세 반은 화면에 아예 나오지 못했습니다. 찬호는 모두가 보려고 온 3학년 사진을 맨 끝에 두었습니다. 이틀이 남았고 파일은 오후 한나절이면 줄일 수 있습니다. 은비는 3학년 사진까지 닿도록 10분으로 줄이자고 말하고 싶습니다. 이런 상황에서 은비가 찬호에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 남자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Hello, everyone. Today I want to talk about why a photograph of the moon " +
            "almost never looks like what you saw. " +
            "You stand outside, the moon is huge and bright, you lift your phone, " +
            "and what comes back is a small white dot. " +
            "Two separate things went wrong. " +
            "The first is size. A wide phone lens fits an enormous amount of sky into one frame, " +
            "and against all that sky the moon is genuinely tiny. " +
            "Your eye had been ignoring the rest of the sky and pointing everything at the moon. " +
            "The second is brightness. " +
            "The camera measures the whole dark scene and opens up to brighten it, " +
            "which blows the one bright object into a featureless disc. " +
            "Your eye adjusts locally, part of the scene at a time. " +
            "A camera cannot do that, so it has to choose.",
        ],
      ],
      choices: [
        "how phone cameras measure distance",
        "why the moon looks larger near the horizon",
        "how astronomers photograph distant planets",
        "why night photography needs a tripod",
        "why photos of the moon look different from what we see",
      ],
      answer: 5,
      clue: "Two separate things went wrong. The first is size.",
      explanation:
        "남자는 넓은 화각과 밝기 측정 방식 때문에 달 사진이 눈으로 본 것과 달라진다고 설명한다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 안녕하세요, 여러분. 오늘은 달 사진이 왜 우리가 본 것과 거의 닮지 않는지 이야기하려 합니다. 밖에 서면 달은 크고 밝습니다. 휴대폰을 들어 찍으면 돌아오는 것은 작고 하얀 점입니다. 두 가지가 따로 어긋났습니다. 첫째는 크기입니다. 넓은 휴대폰 렌즈는 엄청난 양의 하늘을 한 화면에 담고, 그 하늘에 견주면 달은 정말로 작습니다. 여러분의 눈은 나머지 하늘을 무시하고 모든 것을 달에 겨누고 있었던 것입니다. 둘째는 밝기입니다. 카메라는 어두운 장면 전체를 재고 그것을 밝히려고 열어 주는데, 그러면 그 하나의 밝은 물체가 아무 무늬도 없는 원반으로 날아갑니다. 눈은 장면을 부분마다 따로 맞춥니다. 카메라는 그럴 수 없어서 하나를 골라야 합니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 내용이 아닌 것은?",
      lines: [
        ["M", "Hello, everyone. Today I want to talk about why a photograph of the moon almost never looks like what you saw."],
        ["M", "A wide phone lens fits an enormous amount of sky into one frame, and against all that sky the moon is genuinely tiny."],
        ["M", "Your eye had been ignoring the rest of the sky and pointing everything at the moon."],
        ["M", "The camera measures the whole dark scene and opens up to brighten it, which blows the one bright object into a featureless disc."],
        ["M", "Your eye adjusts locally, part of the scene at a time."],
        ["M", "A camera cannot do that, so it has to choose."],
      ],
      choices: [
        "a wide lens fitting a lot of sky in one frame",
        "the eye ignoring the rest of the sky",
        "a tripod removing shake from the photo",
        "the camera brightening a dark scene",
        "the eye adjusting part of a scene at a time",
      ],
      answer: 3,
      clue: "A wide phone lens fits an enormous amount of sky into one frame, and against all that sky the moon is genuinely tiny.",
      explanation:
        "넓은 렌즈가 하늘을 많이 담는 것, 눈이 나머지 하늘을 무시하는 것, 카메라가 어두운 장면을 밝히는 것, 눈이 부분마다 맞추는 것은 언급되지만 삼각대가 흔들림을 없앤다는 것은 언급되지 않았다. 따라서 답은 ③이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
