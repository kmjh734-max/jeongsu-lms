/** 고2 듣기 19회 — 사람이 직접 쓴 회차 (2026-09-21) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고2 19회",
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
          "Good morning, everyone. This is Mr. Nam from the second-year office. " +
            "I want to say something about the group projects you hand in each term. " +
            "Every year a few of you come to me in the last week saying one member did nothing. " +
            "By then the work is done, the marks are fixed, and there is very little I can do. " +
            "So this term each group will hand in a one-page plan in the first week instead. " +
            "The plan says who does what and by which date, and everyone signs it. " +
            "If somebody falls behind, you show me the plan in week two, not week eight. " +
            "This is not about catching anyone out; it is about making the trouble visible while it can still be fixed. " +
            "Plans are due next Friday. Thank you for listening.",
        ],
      ],
      choices: [
        "모둠 과제 계획서를 먼저 내게 한다고 안내하려고",
        "모둠 과제 마감을 미룬다고 알리려고",
        "모둠원을 바꾸는 방법을 알리려고",
        "과제 점수 기준을 설명하려고",
        "모둠 활동에 참여하라고 독려하려고",
      ],
      answer: 1,
      clue: "So this term each group will hand in a one-page plan in the first week instead.",
      explanation:
        "이번 학기부터 모둠마다 첫 주에 역할과 날짜를 적은 계획서를 먼저 낸다는 안내이다. 따라서 말의 목적은 ①이다.",
      translation: [
        "M: 여러분, 안녕하세요. 2학년부 남 선생님입니다. " +
          "학기마다 내는 모둠 과제에 대해 한 가지 말씀드리려 합니다. " +
          "해마다 몇 명이 마지막 주에 찾아와 한 사람이 아무것도 안 했다고 말합니다. " +
          "그때는 이미 과제가 끝났고 점수도 정해져서 제가 할 수 있는 일이 거의 없습니다. " +
          "그래서 이번 학기에는 모둠마다 첫 주에 한 쪽짜리 계획서를 먼저 냅니다. " +
          "누가 무엇을 언제까지 하는지 적고, 모두가 서명합니다. " +
          "누군가 처지면 8주 차가 아니라 2주 차에 그 계획서를 들고 오면 됩니다. " +
          "누구를 잡아내려는 것이 아니라, 아직 고칠 수 있을 때 문제가 드러나게 하려는 것입니다. " +
          "계획서는 다음 주 금요일까지입니다. 들어 주셔서 고맙습니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 여자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Chaerin, you've started reading the questions before the passage. Isn't that backwards?"],
        ["W", "It felt backwards for about a week. Now I can't read any other way."],
        ["M", "But you don't know what the passage is about yet."],
        ["W", "I don't need to. I need to know what I'm looking for in it."],
        ["M", "Surely you understand it better if you read it properly first."],
        ["W", "I understood it beautifully and then ran out of time. Twice."],
        ["M", "Time is the problem, then, not understanding."],
        ["W", "Time is always the problem. Nobody fails those questions because the passage was too hard."],
        ["M", "Doesn't reading the questions first make you miss things?"],
        ["W", "It makes me skip things, which is different. The questions tell me which paragraphs matter."],
        ["M", "And the paragraphs that don't?"],
        ["W", "I read them once, quickly. They were never going to be asked about."],
        ["M", "How much time does it actually save?"],
        ["W", "Four minutes on a long passage. That's one whole extra question."],
        ["M", "Then I'll try it on tomorrow's practice test."],
      ],
      choices: [
        "지문은 천천히 읽어야 한다",
        "문제를 먼저 읽고 무엇을 찾을지 알고 지문을 읽는 것이 낫다",
        "시험은 시간을 재고 연습해야 한다",
        "어려운 지문은 건너뛰는 것이 좋다",
        "독해는 매일 조금씩 해야 한다",
      ],
      answer: 2,
      clue: "It makes me skip things, which is different. The questions tell me which paragraphs matter.",
      explanation:
        "여자는 문제를 먼저 읽으면 무엇을 찾을지 알고 읽게 되어 시간을 아낀다고 말한다. 따라서 답은 ②이다.",
      translation: [
        "M: 채린아, 지문보다 문제를 먼저 읽기 시작했더라. 거꾸로 아니야?",
        "W: 일주일쯤은 거꾸로 같았어. 지금은 다르게는 못 읽겠어.",
        "M: 그런데 지문이 무슨 내용인지 아직 모르잖아.",
        "W: 알 필요 없어. 그 안에서 뭘 찾을지를 알아야 하는 거야.",
        "M: 제대로 먼저 읽으면 더 잘 이해되지 않아?",
        "W: 아름답게 이해하고 시간이 모자랐어. 두 번이나.",
        "M: 그럼 문제는 이해가 아니라 시간이네.",
        "W: 시간은 늘 문제야. 지문이 어려워서 그 문제를 틀리는 사람은 없어.",
        "M: 문제를 먼저 읽으면 놓치는 게 생기지 않아?",
        "W: 건너뛰게 되는 거지, 그건 달라. 문제가 어느 문단이 중요한지 알려 주거든.",
        "M: 중요하지 않은 문단은?",
        "W: 한 번 빠르게 읽어. 어차피 물어보지 않을 곳이었어.",
        "M: 실제로 시간이 얼마나 줄어?",
        "W: 긴 지문에서 4분. 문제 하나를 더 푸는 시간이야.",
        "M: 그럼 내일 모의고사에서 해 볼게.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "We say that practice makes perfect, and then we practise the wrong thing. " +
            "Most practice is a performance: you run through the whole piece, the whole speech, the whole set of problems. " +
            "A performance tells you your average. It does not tell you where you break. " +
            "Real practice is uncomfortable because it lives entirely at the place where you fail. " +
            "If an hour of practice felt good all the way through, you spent the hour proving something you already knew. " +
            "The measure of a practice hour is not how much you got right; it is how often you had to stop.",
        ],
      ],
      choices: [
        "연습은 매일 같은 시간에 해야 한다",
        "연습은 즐거워야 오래 할 수 있다",
        "잘되는 부분을 반복해 자신감을 얻어야 한다",
        "연습은 막히는 곳에 머물러야 하고, 얼마나 자주 멈췄는지로 재야 한다",
        "연습보다 실전 경험이 중요하다",
      ],
      answer: 4,
      clue: "The measure of a practice hour is not how much you got right; it is how often you had to stop.",
      explanation:
        "전체를 훑는 연습은 평균만 알려 줄 뿐이고, 진짜 연습은 막히는 곳에 머무르며 얼마나 자주 멈췄는지로 재야 한다는 내용이다. 따라서 요지는 ④이다.",
      translation: [
        "M: 우리는 연습이 완벽을 만든다고 말하면서, 엉뚱한 것을 연습합니다. " +
          "대부분의 연습은 공연입니다. 곡 전체, 연설 전체, 문제 한 세트 전체를 훑습니다. " +
          "공연은 자기 평균을 알려 줍니다. 어디서 무너지는지는 알려 주지 않습니다. " +
          "진짜 연습은 불편합니다. 온전히 실패하는 그 자리에 머무르기 때문입니다. " +
          "한 시간의 연습이 내내 기분 좋았다면, 이미 아는 것을 증명하는 데 그 한 시간을 쓴 것입니다. " +
          "연습 한 시간을 재는 잣대는 몇 개를 맞혔는가가 아니라, 몇 번이나 멈춰야 했는가입니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["W", "Junhyuk, the new music practice room looks great."],
        ["M", "We finished it last week. What do you see first?"],
        ["W", "On the back wall there's a row of six hooks."],
        ["M", "One for each instrument case. Nobody leaves them on the floor now."],
        ["W", "In the middle there's an upright piano."],
        ["M", "It came from the old hall. It still holds its tuning."],
        ["W", "On the left, is that a drum stool?"],
        ["M", "No, it's a small stepladder. The drum stool is behind the door."],
        ["W", "I see. On the right there's a tall music stand."],
        ["M", "We keep it high so two people can read from it."],
        ["W", "And beside the door there's a square notice board."],
        ["M", "The practice timetable goes up there every Monday."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "No, it's a small stepladder. The drum stool is behind the door.",
      explanation:
        "남자는 왼쪽에 있는 것이 드럼 의자가 아니라 작은 발판 사다리라고 바로잡는다. 그림에는 드럼 의자가 그려져 있으므로 ③이 대화와 일치하지 않는다.",
      figure: {
        kind: "labeled",
        scene:
          "A school music practice room seen from the front, clean black line art on a plain white background, five things clearly separated with wide empty space between them and none overlapping, no writing or letters anywhere. " +
          "High on the back wall in the centre: a row of exactly SIX HOOKS on a flat board. " +
          "In the centre of the floor: an UPRIGHT PIANO seen from the front with its keyboard showing. " +
          "On the far left of the floor: a round DRUM STOOL, a padded round seat on a single post with three small legs. " +
          "On the right of the floor: a TALL MUSIC STAND, a slanted rack on a thin pole with a wide tripod base. " +
          "Beside the door on the far right, high on the wall: a SQUARE NOTICE BOARD with a plain empty face.",
      },
      translation: [
        "W: 준혁아, 새 음악 연습실 좋아 보인다.",
        "M: 지난주에 다 끝냈어. 뭐가 먼저 보여?",
        "W: 뒷벽에 걸이가 여섯 개 줄지어 있네.",
        "M: 악기 가방마다 하나씩. 이제 아무도 바닥에 안 둬.",
        "W: 가운데에는 업라이트 피아노가 있고.",
        "M: 옛 강당에서 가져왔어. 아직 음이 잘 맞아.",
        "W: 왼쪽에 있는 건 드럼 의자야?",
        "M: 아니, 작은 발판 사다리야. 드럼 의자는 문 뒤에 있어.",
        "W: 그렇구나. 오른쪽에는 키 큰 보면대가 있네.",
        "M: 둘이 같이 보려고 높게 둬.",
        "W: 그리고 문 옆에는 네모난 게시판이 있고.",
        "M: 월요일마다 거기에 연습 시간표를 붙여.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 남자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Dohun, there's a problem with the volunteer sign-up sheet."],
        ["M", "I put it up outside the office on Monday. What's wrong?"],
        ["W", "It says the bus leaves at eight, but the centre opens at eight."],
        ["M", "So everyone would arrive an hour late."],
        ["W", "Eighteen people, all an hour late, on the first day."],
        ["M", "Can we tell them on the day?"],
        ["W", "Half of them won't be there to hear it."],
        ["M", "Then I'll send a message to all eighteen tonight."],
        ["W", "Use the group list. It reaches everyone at once."],
        ["M", "I'll write it after dinner and send it before nine."],
        ["W", "Thanks. I'll change the sheet outside the office."],
      ],
      choices: [
        "명단을 다시 붙이기",
        "봉사 센터에 전화하기",
        "버스 시간을 바꾸기",
        "열여덟 명에게 문자로 알리기",
        "신청을 다시 받기",
      ],
      answer: 4,
      clue: "Then I'll send a message to all eighteen tonight.",
      explanation:
        "남자는 오늘 밤에 열여덟 명 모두에게 문자로 알리기로 한다. 명단을 고치는 일은 여자가 맡았다. 따라서 답은 ④이다.",
      translation: [
        "W: 도훈아, 봉사 신청 명단에 문제가 있어.",
        "M: 월요일에 행정실 앞에 붙였는데. 뭐가 잘못됐어?",
        "W: 버스가 8시에 출발한다고 적혀 있는데, 센터가 8시에 열어.",
        "M: 그럼 다들 한 시간씩 늦게 도착하겠네.",
        "W: 열여덟 명이 첫날부터 한 시간씩 늦는 거지.",
        "M: 당일에 말하면 안 될까?",
        "W: 절반은 그 자리에 없어서 못 들어.",
        "M: 그럼 오늘 밤에 열여덟 명 모두한테 문자를 보낼게.",
        "W: 단체 목록을 써. 한 번에 다 가.",
        "M: 저녁 먹고 써서 9시 전에 보낼게.",
        "W: 고마워. 나는 행정실 앞 명단을 고칠게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 여자가 지불할 금액을 고르시오.",
      lines: [
        ["M", "Welcome to the sports shop. What are you looking for?"],
        ["W", "A pair of running shoes and some socks for the school team."],
        ["M", "We have two kinds of running shoe. The training ones are fifty dollars and the racing ones are eighty."],
        ["W", "The training ones, please. I run five days a week."],
        ["M", "A sensible choice. And the sports socks are six dollars a pair."],
        ["W", "I'll take three pairs. They wear out fast."],
        ["M", "Fifty for the shoes and eighteen for the socks. That comes to sixty-eight dollars."],
        ["W", "Do you give a discount to school teams?"],
        ["M", "We do. Twelve dollars off the total with a team card."],
        ["W", "Here it is, and here's my card."],
        ["M", "Thank you. Would you like insoles as well? They're twelve dollars."],
        ["W", "No, thank you. The shoes already have good ones."],
      ],
      choices: ["$56", "$60", "$62", "$68", "$72"],
      answer: 1,
      clue: "We do. Twelve dollars off the total with a team card.",
      explanation:
        "운동화 50달러와 양말 6달러짜리 세 켤레 18달러를 더하면 68달러이다. 팀 할인 12달러를 빼면 56달러이고 깔창은 사지 않았으므로 답은 ①이다.",
      translation: [
        "M: 운동용품점입니다. 무엇을 찾으세요?",
        "W: 학교 팀에서 쓸 운동화 한 켤레랑 양말이요.",
        "M: 운동화는 두 가지가 있습니다. 훈련용은 50달러, 경기용은 80달러입니다.",
        "W: 훈련용으로요. 일주일에 닷새 뛰거든요.",
        "M: 현명한 선택이세요. 운동 양말은 한 켤레에 6달러입니다.",
        "W: 세 켤레 주세요. 금방 닳아서요.",
        "M: 운동화 50달러에 양말 18달러, 모두 68달러입니다.",
        "W: 학교 팀 할인 있나요?",
        "M: 있습니다. 팀 카드가 있으면 전체 금액에서 12달러 할인됩니다.",
        "W: 여기 있고요, 카드도 여기요.",
        "M: 고맙습니다. 깔창도 하시겠어요? 12달러입니다.",
        "W: 아니요, 괜찮아요. 운동화에 이미 좋은 게 들어 있어요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 남자가 주말 아르바이트를 그만두려는 이유를 고르시오.",
      lines: [
        ["W", "Seungho, are you really leaving the weekend job?"],
        ["M", "At the end of the month. I told the owner on Friday."],
        ["W", "Is it the pay? You said it was fair."],
        ["M", "The pay is fine. That's not it."],
        ["W", "Then what? You've worked there since March."],
        ["M", "The shop changed its hours. Saturdays now finish at ten at night."],
        ["W", "And that's too late?"],
        ["M", "The last bus to my area leaves at nine forty."],
        ["W", "Can't you take a taxi?"],
        ["M", "A taxi home costs more than two hours of the work."],
      ],
      choices: [
        "일이 힘들어서",
        "보수가 적어서",
        "끝나는 시간이 늦어져 차편이 없어서",
        "공부할 시간이 없어서",
        "가게 사람들과 맞지 않아서",
      ],
      answer: 3,
      clue: "The last bus to my area leaves at nine forty.",
      explanation:
        "토요일 근무가 밤 10시까지로 늦춰졌는데 막차가 9시 40분이라 돌아갈 방법이 없다. 따라서 답은 ③이다.",
      translation: [
        "W: 승호야, 정말 주말 아르바이트 그만둬?",
        "M: 이달 말까지만. 금요일에 사장님께 말씀드렸어.",
        "W: 돈 때문이야? 괜찮다고 했잖아.",
        "M: 보수는 괜찮아. 그건 아니야.",
        "W: 그럼 왜? 3월부터 일했잖아.",
        "M: 가게가 영업시간을 바꿨어. 토요일은 이제 밤 10시에 끝나.",
        "W: 그게 너무 늦어?",
        "M: 우리 동네 가는 막차가 9시 40분에 떠나.",
        "W: 택시 타면 안 돼?",
        "M: 집까지 택시비가 두 시간 일당보다 많아.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 교내 영어 신문 동아리에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["W", "Minjae, are you thinking about the English newspaper club?"],
        ["M", "I saw the poster but I couldn't tell what they actually do."],
        ["W", "They put out one issue a term, eight pages, all in English."],
        ["M", "Eight pages? That's a lot for one term."],
        ["W", "It sounds like a lot until you see that fourteen people share it."],
        ["M", "Fourteen. So about half a page each."],
        ["W", "More or less, and you pick your own section."],
        ["M", "When do they meet?"],
        ["W", "Tuesdays and Thursdays after the seventh period, in the language room."],
        ["M", "Two days a week is manageable. Who checks the English?"],
        ["W", "The native teacher reads everything before it goes to print."],
        ["M", "That's the part that would help me most."],
        ["W", "Most people say that after the first issue."],
        ["M", "Then I'll put my name down tomorrow."],
        ["W", "Do it before Thursday. That's when they close the list."],
      ],
      choices: ["활동 내용", "부원 수", "모이는 요일", "영어 검토 방법", "회비"],
      answer: 5,
      clue: "The native teacher reads everything before it goes to print.",
      explanation:
        "활동 내용(학기마다 8쪽 영어 신문), 부원 수(열네 명), 모이는 요일(화·목), 영어 검토 방법(원어민 교사가 검토)은 언급되지만 회비는 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 민재야, 영어 신문 동아리 생각 있어?",
        "M: 포스터는 봤는데 뭘 하는 건지 알 수가 없더라.",
        "W: 학기에 한 번, 여덟 쪽짜리 신문을 전부 영어로 내.",
        "M: 여덟 쪽? 한 학기에 많은데.",
        "W: 열네 명이 나눠 한다는 걸 알기 전까지는 많아 보이지.",
        "M: 열네 명. 그럼 한 사람에 반 쪽쯤이네.",
        "W: 그쯤. 그리고 자기 꼭지를 직접 골라.",
        "M: 언제 모여?",
        "W: 화요일이랑 목요일, 7교시 끝나고 어학실에서.",
        "M: 일주일에 이틀이면 할 만하다. 영어는 누가 봐 줘?",
        "W: 원어민 선생님이 인쇄 전에 전부 읽어 주셔.",
        "M: 나한테는 그게 제일 도움이 될 것 같은데.",
        "W: 첫 호 내고 나면 다들 그렇게 말해.",
        "M: 그럼 내일 이름 적을게.",
        "W: 목요일 전에 해. 그때 명단을 닫아.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Dalbit Night Market에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "W",
          "Here is what you should know about Dalbit Night Market, which started in the old bus yard seven years ago. " +
            "It opens on the first and third Saturday of every month, from five in the afternoon until ten. " +
            "There are sixty stalls, and half of them are kept for sellers under the age of twenty-five. " +
            "Anyone may apply, but a seller may take a stall only twice in one year, so that new people get a turn. " +
            "Cooked food is sold along the north wall only, to keep the smoke away from the clothing stalls. " +
            "There is no parking at the yard, and the market runs a free shuttle from the station every twenty minutes.",
        ],
      ],
      choices: [
        "7년 전에 시작되었다",
        "매달 첫째·셋째 토요일에 연다",
        "가판의 절반은 25세 미만에게 준다",
        "한 사람이 1년에 두 번까지만 가판을 낼 수 있다",
        "역에서 오는 셔틀은 요금을 받는다",
      ],
      answer: 5,
      clue: "There is no parking at the yard, and the market runs a free shuttle from the station every twenty minutes.",
      explanation:
        "역에서 오는 셔틀은 무료라고 했다. 따라서 ⑤가 내용과 일치하지 않는다.",
      translation: [
        "W: 7년 전 옛 버스 차고에서 시작된 Dalbit Night Market을 소개합니다. " +
          "매달 첫째와 셋째 토요일, 오후 5시부터 10시까지 엽니다. " +
          "가판은 예순 개이고, 그중 절반은 스물다섯 살 미만 판매자를 위해 비워 둡니다. " +
          "누구나 신청할 수 있지만, 한 사람이 1년에 두 번까지만 가판을 낼 수 있습니다. 새로운 사람에게 차례가 가도록 하기 위해서입니다. " +
          "조리 음식은 북쪽 벽을 따라서만 팝니다. 연기가 옷 가판 쪽으로 가지 않게 하기 위해서입니다. " +
          "차고에는 주차장이 없고, 역에서 20분마다 무료 셔틀이 다닙니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 신청할 겨울 특강을 고르시오.",
      lines: [
        ["M", "Yerin, these are the five winter lecture courses still open."],
        ["W", "Let's choose one. I can't do mornings because of my part-time job."],
        ["M", "Right, that takes out one of them."],
        ["W", "Next, how many weeks? More than four is too long before the term starts."],
        ["M", "Then one more is gone. Three are left."],
        ["W", "What do they cost?"],
        ["M", "We said eighty thousand won at the most."],
        ["W", "Then one more drops out. Two left."],
        ["M", "Do either of them record the lectures?"],
        ["W", "Only one does, and I'll definitely miss a day or two."],
        ["M", "Then that's the one. I'll sign us both up tonight."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "Then that's the one. I'll sign us both up tonight.",
      explanation:
        "오전인 ①, 6주인 ②, 90,000원인 ③을 뺀다. 남은 ④와 ⑤ 중 녹화를 해 주는 것은 ④이므로 답은 ④이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "오전 / 4주 / 70,000원 / 녹화 있음" },
          { no: 2, label: "②", value: "오후 / 6주 / 70,000원 / 녹화 있음" },
          { no: 3, label: "③", value: "오후 / 4주 / 90,000원 / 녹화 있음" },
          { no: 4, label: "④", value: "오후 / 3주 / 80,000원 / 녹화 있음" },
          { no: 5, label: "⑤", value: "오후 / 4주 / 75,000원 / 녹화 없음" },
        ],
      },
      translation: [
        "M: 예린아, 아직 열려 있는 겨울 특강이 이 다섯 개야.",
        "W: 하나 고르자. 아르바이트 때문에 오전은 안 돼.",
        "M: 맞다, 그럼 하나가 빠지네.",
        "W: 다음으로 몇 주짜리야? 개학 전에 4주 넘으면 너무 길어.",
        "M: 그럼 하나 더 빠진다. 세 개 남았어.",
        "W: 얼마야?",
        "M: 8만 원까지로 정했잖아.",
        "W: 그럼 하나 더 빠지고 둘 남았다.",
        "M: 둘 중에 강의를 녹화해 주는 데 있어?",
        "W: 한 곳만. 나는 하루 이틀은 분명 빠질 텐데.",
        "M: 그럼 거기로 하자. 오늘 밤에 둘 다 신청할게.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Have you returned the library books yet?"],
        ["W", "Not yet. The desk was closed when I went at six."],
        ["M", "Did you try the return box by the front door?"],
        ["W", "I didn't know we could use that."],
        ["M", "It's open all night, and the books count as returned that day."],
      ],
      choices: [
        "I borrowed four books.",
        "The library opens at nine.",
        "Then I'll drop them in tonight.",
        "The books are due on Friday.",
        "You should return yours as well.",
      ],
      answer: 3,
      clue: "It's open all night, and the books count as returned that day.",
      explanation:
        "밤새 열려 있는 반납함에 넣으면 그날 반납으로 처리된다는 말을 들었으므로, 오늘 밤에 넣겠다는 ③이 가장 자연스럽다.",
      translation: [
        "M: 도서관 책 반납했어?",
        "W: 아직. 6시에 갔더니 데스크가 닫았더라.",
        "M: 정문 옆 반납함은 해 봤어?",
        "W: 그걸 써도 되는 줄 몰랐어.",
        "M: 밤새 열려 있고, 그날 반납으로 처리돼.",
        "W: 그럼 오늘 밤에 넣을게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "You've been standing at the back of the classroom every morning."],
        ["M", "I can't see the board from my seat at the back."],
        ["W", "Have you asked to move to the front?"],
        ["M", "I thought the seats were fixed for the term."],
        ["W", "They're changed every month, and the teacher asks on the last Friday."],
      ],
      choices: [
        "My seat is in the last row.",
        "Then I'll ask her this Friday.",
        "The board is quite small.",
        "I've worn glasses since last year.",
        "You should move to the front too.",
      ],
      answer: 2,
      clue: "They're changed every month, and the teacher asks on the last Friday.",
      explanation:
        "자리는 매달 바뀌고 마지막 금요일에 선생님이 물어본다는 말을 들었으므로, 이번 금요일에 말씀드리겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 아침마다 교실 뒤에 서 있더라.",
        "M: 뒷자리에서는 칠판이 안 보여서.",
        "W: 앞으로 옮겨 달라고 말씀드려 봤어?",
        "M: 자리는 한 학기 동안 고정인 줄 알았어.",
        "W: 매달 바뀌어. 마지막 금요일에 선생님이 물어보셔.",
        "M: 그럼 이번 금요일에 말씀드릴게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오. [3점]",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Dain, how is the class blog going?"],
        ["W", "Badly. I write a post every week and nobody reads it."],
        ["M", "How long are the posts?"],
        ["W", "About two thousand characters. I put everything in."],
        ["M", "Where do people see them?"],
        ["W", "I paste the link into the class chat on Sunday night."],
        ["M", "A link on a Sunday night, to two thousand characters."],
        ["W", "When you say it like that, it sounds hopeless."],
        ["M", "Not hopeless. Just the wrong shape for where it lands."],
        ["W", "So what shape should it be?"],
        ["M", "Put the first three lines in the chat itself, and the link after them."],
      ],
      choices: [
        "The blog started in March.",
        "I write the posts on Saturday.",
        "Our class chat has thirty people.",
        "Then I'll post the first lines this Sunday.",
        "I'd rather stop writing the blog.",
      ],
      answer: 4,
      clue: "Put the first three lines in the chat itself, and the link after them.",
      explanation:
        "첫 세 줄을 대화방에 직접 올리고 링크를 뒤에 붙이라는 조언을 들었으므로, 이번 일요일에 그렇게 하겠다는 ④가 가장 자연스럽다.",
      translation: [
        "M: 다인아, 학급 블로그는 잘돼 가?",
        "W: 잘 안돼. 매주 글을 올리는데 아무도 안 읽어.",
        "M: 글이 얼마나 길어?",
        "W: 2천 자쯤. 다 넣어.",
        "M: 사람들이 그걸 어디서 봐?",
        "W: 일요일 밤에 학급 대화방에 링크를 붙여.",
        "M: 일요일 밤에 링크 하나, 그 너머에 2천 자라.",
        "W: 그렇게 말하니 가망 없게 들린다.",
        "M: 가망이 없는 게 아니라, 놓이는 자리에 안 맞는 모양인 거지.",
        "W: 그럼 어떤 모양이어야 하는데?",
        "M: 첫 세 줄은 대화방에 그대로 쓰고, 링크는 그 뒤에 붙여.",
        "W: 그럼 이번 일요일에 첫 줄들을 올려 볼게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오. [3점]",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Taemin, you've highlighted almost every line of that textbook."],
        ["M", "I mark anything that looks important."],
        ["W", "And when you come back to revise?"],
        ["M", "The page is yellow. I read all of it again."],
        ["W", "So the highlighting saved you nothing."],
        ["M", "It felt useful at the time."],
        ["W", "Of course. Marking things feels like learning them."],
        ["M", "Then what should I mark?"],
        ["W", "Only what you would put on a one-page summary."],
        ["M", "That would be about five lines a chapter."],
        ["W", "Five lines you can find again beats a page you can't."],
      ],
      choices: [
        "Then I'll mark only five lines a chapter.",
        "My highlighter is almost empty.",
        "The textbook has fourteen chapters.",
        "I revise every Sunday evening.",
        "You should highlight less as well.",
      ],
      answer: 1,
      clue: "Five lines you can find again beats a page you can't.",
      explanation:
        "한 쪽 요약에 넣을 것만, 한 단원에 다섯 줄쯤만 표시하라는 조언을 들었으므로, 그렇게 하겠다는 ①이 가장 자연스럽다.",
      translation: [
        "W: 태민아, 그 교과서 거의 모든 줄에 형광펜을 쳤네.",
        "M: 중요해 보이는 건 다 칠해.",
        "W: 그러고 나서 복습하러 오면?",
        "M: 쪽 전체가 노래. 그래서 다 다시 읽어.",
        "W: 그럼 형광펜이 아낀 게 없네.",
        "M: 칠할 때는 쓸모 있게 느껴졌어.",
        "W: 당연하지. 표시하는 건 배우는 것처럼 느껴지니까.",
        "M: 그럼 뭘 칠해야 해?",
        "W: 한 쪽짜리 요약에 넣을 것만.",
        "M: 그러면 한 단원에 다섯 줄쯤 되겠는데.",
        "W: 다시 찾을 수 있는 다섯 줄이 못 찾는 한 쪽보다 나아.",
        "M: 그럼 한 단원에 다섯 줄만 칠할게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Mr. Bae가 Sumin에게 할 말로 가장 적절한 것을 고르시오. [3점]",
      questionText: "▶ Mr. Bae : ________________",
      lines: [
        [
          "M",
          "Mr. Bae coaches the school badminton team, and Sumin is the strongest player on it. " +
            "Her smash is the fastest in the school and she wins most of her points with it. " +
            "In a long match, however, she plays the smash from every position, even from the back corner. " +
            "From there the shot is slower, and she is out of place for whatever comes back. " +
            "Mr. Bae does not want her to stop smashing; that shot is why the team reaches the final. " +
            "The trouble is that a player who answers every ball the same way is easy to plan against. " +
            "The regional final is in three weeks, and the opponents watch recordings of every match. " +
            "He wants to tell her to keep the smash for the front half of the court and lift the ball from the back. " +
            "In this situation, what would Mr. Bae most likely say to Sumin?",
        ],
      ],
      choices: [
        "Try to hit the smash even harder next time.",
        "I think you should play in the doubles instead.",
        "Let's practise only footwork from now on.",
        "You should watch the recordings yourself.",
        "Save the smash for the front and lift it from the back.",
      ],
      answer: 5,
      clue: "He wants to tell her to keep the smash for the front half of the court and lift the ball from the back.",
      explanation:
        "배 선생님은 수민의 스매시를 문제 삼지 않으면서, 앞쪽에서는 스매시를 쓰고 뒤에서는 높이 넘기라고 말하려 한다. 따라서 ⑤가 가장 적절하다.",
      translation: [
        "M: 배 선생님은 학교 배드민턴팀을 맡고 있고, 수민이는 팀에서 가장 강한 선수입니다. " +
          "수민이의 스매시는 학교에서 가장 빠르고, 점수 대부분을 그것으로 냅니다. " +
          "그런데 긴 경기에서는 뒷구석에서까지 어느 자리에서든 스매시를 칩니다. " +
          "거기서는 공이 느려지고, 되돌아오는 공에 대비할 자리도 잡지 못합니다. " +
          "배 선생님은 수민이가 스매시를 그만두기를 바라지 않습니다. 그 한 방 덕분에 팀이 결승에 오릅니다. " +
          "문제는 모든 공에 똑같이 답하는 선수는 상대가 대비하기 쉽다는 점입니다. " +
          "지역 결승은 3주 뒤이고, 상대 팀은 모든 경기 녹화를 봅니다. " +
          "그래서 코트 앞쪽에서는 스매시를 쓰고 뒤에서는 높이 넘기라고 말하고 싶습니다. " +
          "이런 상황에서 배 선생님이 수민이에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "남자가 하는 말의 주제로 가장 적절한 것은?",
      lines: [
        ["M", "Good afternoon. Today I want to talk about animals that use tools they did not grow."],
        ["M", "A tool is not an extension of the body; it is an object the animal must find, keep and aim."],
        ["M", "The New Caledonian crow trims a twig into a hook and carries the same hook from tree to tree."],
        ["M", "The sea otter keeps one favourite stone in a pouch of loose skin and uses it to break shells."],
        ["M", "The veined octopus collects two coconut halves, stacks them, and walks awkwardly across the sand carrying its own shelter."],
        ["M", "The Egyptian vulture picks up a stone in its beak and throws it at an egg too thick to crack."],
        ["M", "What links them is not intelligence in general but a habit of treating an object as worth keeping."],
        ["M", "The carrying, not the using, is the surprising part."],
      ],
      choices: [
        "how animals build their nests",
        "animals that use tools they find and carry",
        "why some animals live near the sea",
        "how birds break open hard food",
        "why octopuses hide from predators",
      ],
      answer: 2,
      clue: "What links them is not intelligence in general but a habit of treating an object as worth keeping.",
      explanation:
        "남자는 까마귀, 해달, 문어, 이집트대머리수리가 물건을 찾아 지니고 다니며 도구로 쓰는 방식을 설명한다. 따라서 주제는 ②이다.",
      translation: [
        "M: 안녕하세요. 오늘은 제 몸에서 자라지 않은 도구를 쓰는 동물에 대해 이야기하려 합니다.",
        "M: 도구는 몸의 연장이 아닙니다. 동물이 찾아내고, 간직하고, 겨누어야 하는 물건입니다.",
        "M: 뉴칼레도니아까마귀는 잔가지를 다듬어 갈고리를 만들고, 그 갈고리를 나무에서 나무로 들고 다닙니다.",
        "M: 해달은 마음에 드는 돌 하나를 살가죽 주머니에 넣어 두고 조개를 깨는 데 씁니다.",
        "M: 줄무늬문어는 코코넛 껍데기 두 쪽을 모아 포개고, 제 집을 이고 모래 위를 뒤뚱뒤뚱 걸어갑니다.",
        "M: 이집트대머리수리는 부리로 돌을 집어, 너무 두꺼워 깨지지 않는 알에 던집니다.",
        "M: 이들을 잇는 것은 일반적인 영리함이 아니라, 어떤 물건을 간직할 만한 것으로 여기는 버릇입니다.",
        "M: 쓰는 것이 아니라 지니고 다니는 것, 그것이 놀라운 대목입니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 동물이 아닌 것은?",
      lines: [
        ["M", "Good afternoon. Today I want to talk about animals that use tools they did not grow."],
        ["M", "A tool is not an extension of the body; it is an object the animal must find, keep and aim."],
        ["M", "The New Caledonian crow trims a twig into a hook and carries the same hook from tree to tree."],
        ["M", "The sea otter keeps one favourite stone in a pouch of loose skin and uses it to break shells."],
        ["M", "The veined octopus collects two coconut halves, stacks them, and walks awkwardly across the sand carrying its own shelter."],
        ["M", "The Egyptian vulture picks up a stone in its beak and throws it at an egg too thick to crack."],
        ["M", "What links them is not intelligence in general but a habit of treating an object as worth keeping."],
        ["M", "The carrying, not the using, is the surprising part."],
      ],
      choices: ["New Caledonian crow", "sea otter", "veined octopus", "Egyptian vulture", "green turtle"],
      answer: 5,
      clue: "The Egyptian vulture picks up a stone in its beak and throws it at an egg too thick to crack.",
      explanation:
        "뉴칼레도니아까마귀, 해달, 줄무늬문어, 이집트대머리수리는 언급되지만 푸른바다거북은 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
