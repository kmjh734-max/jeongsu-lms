/** 고2 듣기 49회 — 사람이 직접 쓴 회차 (2026-09-29) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고2 49회",
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
          "Good afternoon, students. This is the student council speaking. " +
            "Twice this term the water fountain on the second floor has broken, " +
            "and both times nobody reported it for more than a week. " +
            "Everyone assumed that someone else had already told the office. " +
            "From today there is a simpler way to tell us. " +
            "A small box with slips of paper hangs beside the council room door. " +
            "Write what is broken and where, and drop the slip in. " +
            "You do not have to write your name on it. " +
            "We collect the slips every morning and pass them to the office. " +
            "A broken thing that nobody reports stays broken all term.",
        ],
      ],
      choices: [
        "고장 난 것을 알리는 방법을 안내하려고",
        "정수기 수리를 알리려고",
        "학생회 선거를 안내하려고",
        "청소 구역을 알리려고",
        "분실물을 찾으려고",
      ],
      answer: 1,
      clue: "Write what is broken and where, and drop the slip in.",
      explanation:
        "고장 난 것을 알리는 새 방법을 안내하고 있다. 따라서 답은 ①이다.",
      translation: [
        "M: 학생 여러분, 안녕하세요. 학생회입니다. 이번 학기에 2층 정수기가 두 번 고장 났는데, 두 번 다 일주일이 넘도록 아무도 알리지 않았습니다. 다들 누군가 이미 사무실에 말했겠거니 여긴 것입니다. 오늘부터 더 간단히 알리는 길을 만듭니다. 학생회실 문 옆에 쪽지가 든 작은 상자를 걸어 둡니다. 무엇이 어디서 고장 났는지 적어 상자에 넣어 주세요. 이름은 적지 않으셔도 됩니다. 저희가 아침마다 쪽지를 걷어 사무실에 전합니다. 아무도 알리지 않은 고장은 학기 내내 고장인 채로 남습니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 여자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Dain, you write down the questions you got wrong, not the answers."],
        ["W", "The answer is in the book; the question is what I lost."],
        ["M", "But surely the answer is what you need to remember."],
        ["W", "I can look up an answer in ten seconds."],
        ["M", "Then what does writing the question give you?"],
        ["W", "It shows me the kind of thing that catches me."],
        ["M", "And after a month you have a pattern."],
        ["W", "Every one of mine involves reading the question too fast."],
        ["M", "You would never see that from a list of answers."],
        ["W", "A list of answers tells you nothing about yourself."],
        ["M", "I've been copying answers into a notebook all year."],
        ["W", "Collect your mistakes, not the corrections."],
        ["M", "I'll start writing the questions tonight."],
      ],
      choices: [
        "정답보다 틀린 문제의 종류를 모아야 한다",
        "오답 노트를 만들어야 한다",
        "문제를 많이 풀어야 한다",
        "해설을 꼼꼼히 읽어야 한다",
        "시험 전에 복습해야 한다",
      ],
      answer: 1,
      clue: "Collect your mistakes, not the corrections.",
      explanation:
        "여자는 정답이 아니라 틀린 문제 자체를 모으라고 말한다. 따라서 답은 ①이다.",
      translation: [
        "M: 다인아, 너는 정답이 아니라 틀린 문제를 적더라.",
        "W: 답은 책에 있어. 내가 잃은 건 문제야.",
        "M: 그래도 기억해야 할 건 답 아니야?",
        "W: 답은 10초면 찾아볼 수 있어.",
        "M: 그럼 문제를 적으면 뭐가 남아?",
        "W: 나를 걸어 넘어뜨리는 게 어떤 종류인지 보여 줘.",
        "M: 한 달 지나면 어떤 무늬가 생기겠네.",
        "W: 내 건 전부 문제를 너무 빨리 읽는 데서 와.",
        "M: 정답 목록만 봐서는 절대 못 볼 거야.",
        "W: 정답 목록은 자신에 대해 아무것도 알려 주지 않아.",
        "M: 나는 1년 내내 답을 공책에 옮겨 적었어.",
        "W: 고쳐 준 것 말고 네 실수를 모아.",
        "M: 오늘 밤부터 문제를 적어 볼게.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Advice is usually given as though everyone were the same person. " +
            "Wake at five, read in the morning, study in silence. " +
            "These come from someone for whom they happened to work. " +
            "What that person never mentions is the twenty things they tried " +
            "and quietly abandoned before finding the one that fitted. " +
            "You are told about the result and never about the search. " +
            "So take any method as a question rather than an instruction: " +
            "try it for a week and watch what actually happens to you. " +
            "The method that survives your own week is the only advice that counts.",
        ],
      ],
      choices: [
        "남의 방법은 직접 해 보고 자기에게 맞는지 따져야 한다",
        "아침에 일어나야 공부가 잘된다",
        "조언은 많이 들을수록 좋다",
        "습관은 꾸준히 이어야 한다",
        "공부법은 자주 바꾸면 안 된다",
      ],
      answer: 1,
      clue: "The method that survives your own week is the only advice that counts.",
      explanation:
        "남의 방법을 직접 해 보고 자기에게 맞는지 확인하라고 말한다. 따라서 답은 ①이다.",
      translation: [
        "M: 조언은 대개 모두가 같은 사람인 것처럼 주어집니다. 다섯 시에 일어나라, 아침에 읽어라, 조용한 데서 공부해라. 이것들은 그렇게 해서 마침 통했던 누군가에게서 온 말입니다. 그 사람이 결코 말하지 않는 것은, 맞는 것을 찾기 전에 시도했다가 조용히 버린 스무 가지입니다. 여러분은 결과만 듣고 그 찾는 과정은 듣지 못합니다. 그러니 어떤 방법이든 지시가 아니라 물음으로 받아들이십시오. 일주일 해 보고 자신에게 실제로 무슨 일이 일어나는지 지켜보십시오. 여러분의 그 일주일을 견뎌 낸 방법만이 값어치 있는 조언입니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["W", "Junho, is this the photo of the school café you opened?"],
        ["M", "Yes, the club has been running it since March."],
        ["W", "There's a counter along the back wall."],
        ["M", "Two people work behind it during break."],
        ["W", "And a blackboard hangs above the counter."],
        ["M", "We write the drink of the day on it."],
        ["W", "I see two round tables in the middle."],
        ["M", "Three tables, actually. One is behind the pillar."],
        ["W", "There's a bench along the left wall."],
        ["M", "People wait there when it gets crowded."],
        ["W", "And a plant stands in the right corner."],
        ["M", "Minji brought it from home in April."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "Three tables, actually. One is behind the pillar.",
      explanation:
        "둥근 탁자가 두 개라고 했지만 세 개라고 했다. 따라서 답은 ③이다.",
      figure: {
        kind: "figure5",
        scene:
          "A small school café room, clean black line art on a plain white background, no writing or letters anywhere. " +
          "A COUNTER runs along the back wall. " +
          "A BLACKBOARD hangs on the wall above the counter. " +
          "TWO ROUND TABLES stand in the middle of the room. " +
          "A BENCH runs along the left wall. " +
          "A POTTED PLANT stands in the right corner.",
        spots: [
          [0.5, 0.35],
          [0.5, 0.12],
          [0.45, 0.65],
          [0.1, 0.6],
          [0.88, 0.62],
        ],
      },
      translation: [
        "W: 준호야, 이게 너희가 연 학교 찻집 사진이야?",
        "M: 응, 3월부터 동아리가 운영해.",
        "W: 뒷벽을 따라 계산대가 있네.",
        "M: 쉬는 시간에 둘이 그 뒤에서 일해.",
        "W: 그리고 계산대 위에 칠판이 걸려 있고.",
        "M: 거기에 오늘의 음료를 적어.",
        "W: 가운데에 둥근 탁자가 두 개 보여.",
        "M: 사실 세 개야. 하나가 기둥 뒤에 있어.",
        "W: 왼쪽 벽을 따라 긴 의자가 있네.",
        "M: 붐빌 때 사람들이 거기서 기다려.",
        "W: 그리고 오른쪽 구석에 화분이 있고.",
        "M: 민지가 4월에 집에서 가져왔어.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 여자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Chaerin, the debate final begins in fifty minutes."],
        ["W", "The tables are arranged and the timer works."],
        ["M", "Did anyone bring the name plates for the speakers?"],
        ["W", "I made them but left them on the printer."],
        ["M", "Which printer? The one in the computer room?"],
        ["W", "The one in the staff copy room, actually."],
        ["M", "That room is locked after four on Fridays."],
        ["W", "It's a quarter to four right now."],
        ["M", "Then somebody has to run down immediately."],
        ["W", "The judges can't tell the speakers apart without them."],
        ["M", "I'll set out the water and the score sheets."],
        ["W", "I'll go and get the name plates."],
      ],
      choices: [
        "물을 놓기",
        "탁자를 옮기기",
        "이름표를 가져오기",
        "시계를 맞추기",
        "심사위원을 맞이하기",
      ],
      answer: 3,
      clue: "I'll go and get the name plates.",
      explanation:
        "여자는 복사실에서 이름표를 가져오겠다고 했다. 따라서 답은 ③이다.",
      translation: [
        "M: 채린아, 토론 결승이 50분 뒤에 시작해.",
        "W: 탁자는 배치했고 시계도 잘 돼.",
        "M: 발표자 이름표는 누가 가져왔어?",
        "W: 내가 만들었는데 인쇄기에 두고 왔어.",
        "M: 어느 인쇄기? 컴퓨터실 거?",
        "W: 사실 교직원 복사실 거야.",
        "M: 그 방은 금요일에 네 시 넘으면 잠겨.",
        "W: 지금 네 시 15분 전이야.",
        "M: 그럼 누가 당장 뛰어 내려가야 해.",
        "W: 그게 없으면 심사위원이 발표자를 구분 못 해.",
        "M: 나는 물이랑 채점표를 놓을게.",
        "W: 내가 가서 이름표를 가져올게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 남자가 지불할 금액을 고르시오.",
      lines: [
        ["W", "Welcome to the stationery shop. What do you need today?"],
        ["M", "Three notebooks and two packs of pens, please."],
        ["W", "The notebooks are four dollars each this week."],
        ["M", "Is that the price for the thick ones too?"],
        ["W", "The thick ones are six dollars each."],
        ["M", "I'll take three thin ones, then."],
        ["W", "And a pack of pens is five dollars."],
        ["M", "Two packs, as I said."],
        ["W", "Students with a school card get ten percent off."],
        ["M", "Here is mine. I keep it in my case."],
        ["W", "Then the discount applies to the whole order."],
        ["M", "Good, I'll pay by card."],
      ],
      choices: ["$18.00", "$19.80", "$21.60", "$22.00", "$24.00"],
      answer: 2,
      clue: "The notebooks are four dollars each this week.",
      explanation:
        "공책 세 권 12달러와 펜 두 묶음 10달러로 22달러인데, 10퍼센트를 빼면 19.80달러이다. 따라서 답은 ②이다.",
      translation: [
        "W: 문구점에 오신 걸 환영합니다. 오늘은 뭐가 필요하세요?",
        "M: 공책 세 권이랑 펜 두 묶음 주세요.",
        "W: 이번 주 공책은 한 권에 4달러입니다.",
        "M: 두꺼운 것도 같은 값인가요?",
        "W: 두꺼운 것은 한 권에 6달러입니다.",
        "M: 그럼 얇은 걸로 세 권 주세요.",
        "W: 펜 한 묶음은 5달러입니다.",
        "M: 말씀드린 대로 두 묶음이요.",
        "W: 학생증이 있으면 10퍼센트 할인됩니다.",
        "M: 여기 있어요. 필통에 넣고 다녀요.",
        "W: 그럼 주문 전체에 할인이 들어갑니다.",
        "M: 좋네요, 카드로 낼게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 여자가 아침 자습을 그만둔 이유를 고르시오.",
      lines: [
        ["M", "Bora, I noticed you stopped coming to morning study."],
        ["M", "You were there at seven every day last term."],
        ["W", "My last morning was two weeks ago."],
        ["M", "Did you find the room too noisy?"],
        ["W", "It was the quietest place in the building."],
        ["M", "Then were you getting up too late?"],
        ["W", "I still wake at six, out of habit."],
        ["M", "So what changed?"],
        ["W", "They moved my bus to a later time."],
        ["M", "The one from the east village?"],
        ["W", "It now arrives at seven forty, twenty minutes late."],
        ["M", "Then you would only catch the last ten minutes."],
      ],
      choices: [
        "교실이 시끄러워서",
        "늦잠을 자서",
        "몸이 아파서",
        "통학 버스 시간이 늦춰져서",
        "학원에 다녀서",
      ],
      answer: 4,
      clue: "They moved my bus to a later time.",
      explanation:
        "통학 버스 시각이 늦춰져 아침 자습에 못 나가게 되었다. 따라서 답은 ④이다.",
      translation: [
        "M: 보라야, 아침 자습에 안 나오더라.",
        "M: 지난 학기에는 일곱 시에 늘 있었잖아.",
        "W: 마지막으로 나간 게 두 주 전이야.",
        "M: 교실이 시끄러웠어?",
        "W: 건물에서 가장 조용한 데였어.",
        "M: 그럼 너무 늦게 일어났어?",
        "W: 습관이 돼서 여섯 시에 그대로 깨.",
        "M: 그럼 뭐가 바뀐 거야?",
        "W: 내가 타는 버스를 더 늦은 시각으로 옮겼어.",
        "M: 동쪽 마을에서 오는 거?",
        "W: 이제 일곱 시 사십 분에 도착해. 20분 늦어졌어.",
        "M: 그럼 마지막 10분밖에 못 하겠네.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 교내 봉사 동아리에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["W", "Taemin, what does the volunteer club actually do?"],
        ["W", "I'm thinking of joining next term."],
        ["M", "We visit the children's center twice a month."],
        ["W", "Which days do you go?"],
        ["M", "The second and fourth Saturday, in the afternoon."],
        ["W", "What do you do when you get there?"],
        ["M", "We read with the children and help with homework."],
        ["W", "How do you get there from school?"],
        ["M", "The club teacher drives the school van."],
        ["W", "How many members are in the club now?"],
        ["M", "Fourteen, and four are leaving in February."],
        ["W", "Then there should be room for me."],
        ["M", "Come along on the twenty-second and see."],
      ],
      choices: ["가는 곳", "가는 요일", "하는 일", "이동 방법", "가입 신청 방법"],
      answer: 5,
      clue: "We visit the children's center twice a month.",
      explanation:
        "장소, 요일, 하는 일, 이동은 말했지만 가입 신청 방법은 말하지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 태민아, 봉사 동아리는 실제로 뭘 해?",
        "W: 다음 학기에 들어갈까 생각 중이야.",
        "M: 한 달에 두 번 아동 센터에 가.",
        "W: 어느 요일에 가?",
        "M: 둘째 주와 넷째 주 토요일 오후에.",
        "W: 가서는 뭘 해?",
        "M: 아이들과 책을 읽고 숙제를 도와줘.",
        "W: 학교에서 거기까지는 어떻게 가?",
        "M: 동아리 선생님이 학교 승합차를 운전하셔.",
        "W: 지금 회원이 몇 명이야?",
        "M: 열네 명인데 넷이 2월에 나가.",
        "W: 그럼 내 자리도 있겠네.",
        "M: 22일에 같이 가서 봐.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "다음을 듣고, 학교 체육 대회에 관한 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "W",
          "Hello, students. Here is the plan for this year's sports day. " +
            "It takes place on the second Friday of next month, all day. " +
            "Events are held on the main field behind the gymnasium. " +
            "Each class enters at least eighteen different students. " +
            "No student may take part in more than two events. " +
            "Classes wear their own class shirt, which the class buys itself. " +
            "Lunch is provided by the school in the gymnasium. " +
            "The whole event finishes at three in the afternoon. " +
            "Class captains bring their entry list to the gym office by Friday.",
        ],
      ],
      choices: [
        "다음 달 둘째 주 금요일에 열린다",
        "체육관 뒤 큰 운동장에서 한다",
        "반마다 열여덟 명 이상이 나간다",
        "한 사람이 두 종목까지 나갈 수 있다",
        "반 티셔츠는 학교에서 나눠 준다",
      ],
      answer: 5,
      clue: "Classes wear their own class shirt, which the class buys itself.",
      explanation:
        "반 티셔츠는 반에서 직접 산다고 했으므로 ⑤가 일치하지 않는다.",
      translation: [
        "W: 학생 여러분, 안녕하세요. 올해 체육 대회 계획을 알려 드립니다. 다음 달 둘째 주 금요일에 하루 종일 열립니다. 경기는 체육관 뒤 큰 운동장에서 합니다. 각 반은 서로 다른 학생을 최소 열여덟 명 내보냅니다. 한 사람이 두 종목을 넘겨 나갈 수 없습니다. 반마다 반 티셔츠를 입는데, 티셔츠는 반에서 직접 삽니다. 점심은 학교에서 체육관에 마련합니다. 전체 행사는 오후 세 시에 끝납니다. 반장은 금요일까지 참가 명단을 체육관 사무실로 가져와 주세요.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 남자가 신청할 강좌를 고르시오.",
      lines: [
        ["W", "Kiwon, which after-school course will you take this term?"],
        ["M", "Five courses are open at our school this time."],
        ["W", "Which days are you free?"],
        ["M", "Not Thursday. I have the volunteer club then."],
        ["W", "So Thursday courses are out for you."],
        ["M", "And I'd like one that meets after five o'clock."],
        ["W", "Two of these run in the afternoon."],
        ["M", "I can't get out of class before five."],
        ["W", "That settles those two, then."],
        ["M", "The fee also has to stay under fifty thousand won."],
        ["W", "Then only one course fits all three conditions."],
        ["M", "I'll sign up tomorrow before it fills up."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 5,
      clue: "Not Thursday. I have the volunteer club then.",
      explanation:
        "목요일이 아니고 다섯 시 이후이며 5만 원 미만인 강좌는 ⑤이다. 따라서 답은 ⑤이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Day: Thursday / Time: Evening / Fee: 40,000 won" },
          { no: 2, label: "②", value: "Day: Monday / Time: Afternoon / Fee: 35,000 won" },
          { no: 3, label: "③", value: "Day: Tuesday / Time: Afternoon / Fee: 42,000 won" },
          { no: 4, label: "④", value: "Day: Wednesday / Time: Evening / Fee: 60,000 won" },
          { no: 5, label: "⑤", value: "Day: Friday / Time: Evening / Fee: 45,000 won" },
        ],
      },
      translation: [
        "W: 기원아, 이번 학기에 어떤 방과 후 강좌 들을 거야?",
        "M: 이번에 우리 학교에 다섯 개가 열려.",
        "W: 어느 요일이 비어?",
        "M: 목요일은 안 돼. 그때 봉사 동아리가 있어.",
        "W: 그럼 목요일 강좌는 빠지네.",
        "M: 그리고 다섯 시 넘어서 하는 걸로 하고 싶어.",
        "W: 이 중 두 개는 오후야.",
        "M: 다섯 시 전에는 수업에서 못 빠져나와.",
        "W: 그럼 그 둘도 정리됐네.",
        "M: 수강료도 5만 원 미만이어야 해.",
        "W: 그럼 세 조건에 다 맞는 건 하나뿐이야.",
        "M: 자리 차기 전에 내일 신청할게.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Have you looked at the summer programme list?"],
        ["M", "I marked three that looked interesting."],
        ["W", "The applications close on Friday evening."],
        ["M", "That gives me three more days."],
        ["W", "Shall we compare our three tomorrow?"],
      ],
      choices: [
        "The list came out last year.",
        "Sure, during lunch break.",
        "I don't want any programme.",
        "There is no list.",
        "Friday already passed.",
      ],
      answer: 2,
      clue: "Shall we compare our three tomorrow?",
      explanation:
        "내일 견줘 보자는 제안이므로, 점심시간에 하자는 ②가 가장 자연스럽다.",
      translation: [
        "W: 여름 프로그램 목록 봤어?",
        "M: 괜찮아 보이는 세 개를 표시해 뒀어.",
        "W: 신청이 금요일 저녁에 마감돼.",
        "M: 그럼 사흘 남았네.",
        "W: 내일 각자 고른 셋을 견줘 볼까?",
        "M: 좋아, 점심시간에.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Excuse me, can I use the sewing machine in the art room?"],
        ["W", "Yes, but only when a teacher is present."],
        ["M", "Which days is a teacher there after school?"],
        ["W", "Tuesdays and Fridays, until five."],
        ["M", "Do I need to book it in advance?"],
      ],
      choices: [
        "The machine is broken.",
        "No, just come and sign in.",
        "I don't work in the art room.",
        "You can't use machines.",
        "Teachers never stay late.",
      ],
      answer: 2,
      clue: "Do I need to book it in advance?",
      explanation:
        "미리 예약해야 하는지 물었으므로, 와서 적기만 하면 된다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 실례합니다, 미술실 재봉틀을 써도 되나요?",
        "W: 네, 다만 선생님이 계실 때만요.",
        "M: 방과 후에 어느 요일에 선생님이 계세요?",
        "W: 화요일과 금요일, 다섯 시까지요.",
        "M: 미리 예약해야 하나요?",
        "W: 아니요, 와서 이름만 적으시면 됩니다.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Suyeon, how is the club's monthly newsletter going?"],
        ["W", "We send it by email and almost nobody opens it."],
        ["M", "How long is one issue?"],
        ["W", "About six pages, attached as a file."],
        ["M", "So a reader has to download something to read anything."],
        ["W", "I never thought of that as a barrier."],
        ["M", "On a phone, opening a file takes three steps."],
        ["W", "And most of them read email on a phone."],
        ["M", "What if the first paragraph were in the email itself?"],
        ["W", "Then they would see something without doing anything."],
        ["M", "How much could you put in the email body?"],
      ],
      choices: [
        "Nothing at all.",
        "The headline and three lines.",
        "All six pages.",
        "We'll stop sending it.",
        "Nobody reads email.",
      ],
      answer: 2,
      clue: "How much could you put in the email body?",
      explanation:
        "본문에 얼마나 넣을지 물었으므로, 제목과 세 줄이라는 ②가 가장 자연스럽다.",
      translation: [
        "M: 수연아, 동아리 소식지는 잘돼 가?",
        "W: 전자우편으로 보내는데 거의 아무도 안 열어.",
        "M: 한 호가 얼마나 길어?",
        "W: 여섯 쪽쯤. 파일로 붙여서 보내.",
        "M: 그럼 읽으려면 뭔가를 내려받아야 하네.",
        "W: 그게 걸림돌이라고는 생각 못 했어.",
        "M: 휴대폰에서는 파일 하나 여는 데 세 단계야.",
        "W: 그리고 대부분 휴대폰으로 메일을 보지.",
        "M: 첫 문단을 메일 본문에 바로 넣으면 어떨까?",
        "W: 그럼 아무것도 안 해도 뭔가는 보이겠다.",
        "M: 본문에 얼마나 넣을 수 있어?",
        "W: 제목이랑 세 줄.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Seongjun, you said you can never start your homework."],
        ["M", "I sit down at seven and begin at nine."],
        ["W", "What happens in those two hours?"],
        ["M", "I tidy the desk, check messages, find the right pen."],
        ["W", "All of that looks like preparing."],
        ["M", "It feels like working without being working."],
        ["W", "What if the first task were already decided?"],
        ["M", "You mean written down the night before."],
        ["W", "One line saying exactly where to start."],
        ["M", "Then there would be nothing to decide at seven."],
        ["W", "When could you write that line?"],
      ],
      choices: [
        "I'll decide at seven as usual.",
        "Right before I go to bed.",
        "I'll never write it.",
        "Homework decides itself.",
        "Two hours is fine.",
      ],
      answer: 2,
      clue: "When could you write that line?",
      explanation:
        "그 한 줄을 언제 쓸지 물었으므로, 자기 직전이라는 ②가 가장 자연스럽다.",
      translation: [
        "W: 성준아, 숙제를 도무지 시작 못 한다고 했잖아.",
        "M: 일곱 시에 앉아서 아홉 시에 시작해.",
        "W: 그 두 시간에 무슨 일이 있어?",
        "M: 책상 치우고, 메시지 보고, 맞는 펜을 찾아.",
        "W: 전부 준비하는 것처럼 보이네.",
        "M: 일하지 않으면서 일하는 느낌이야.",
        "W: 첫 할 일이 이미 정해져 있으면 어떨까?",
        "M: 전날 밤에 적어 두라는 말이지.",
        "W: 어디서 시작할지 딱 적은 한 줄.",
        "M: 그러면 일곱 시에 정할 게 없겠네.",
        "W: 그 한 줄을 언제 쓸 수 있어?",
        "M: 자기 바로 전에.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Areum이 Dohyun에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Areum : ________________",
      lines: [
        [
          "W",
          "Areum and Dohyun are preparing the club's outdoor display. " +
            "Dohyun has taped all the photographs onto the board with paper tape " +
            "because that was the only tape left in the club room. " +
            "The board will stand outside the front gate for three days, " +
            "and rain is forecast for tomorrow afternoon and evening. " +
            "Areum knows that paper tape comes away as soon as it gets damp, " +
            "and every photograph would be on the ground by Thursday. " +
            "She wants him to use the waterproof tape from the office instead. " +
            "In this situation, what would Areum most likely say to Dohyun?",
        ],
      ],
      choices: [
        "Add more paper tape to each corner.",
        "The display comes down today.",
        "We need waterproof tape for outside.",
        "Let's put the board indoors.",
        "It never rains in November.",
      ],
      answer: 3,
      clue: "She wants him to use the waterproof tape from the office instead.",
      explanation:
        "비가 오면 종이테이프가 떨어지므로, 방수 테이프를 쓰자는 ③이 가장 적절하다.",
      translation: [
        "W: 아름이와 도현이는 동아리 야외 전시를 준비하고 있습니다. 도현이는 동아리방에 종이테이프밖에 남아 있지 않아 사진을 전부 종이테이프로 판에 붙였습니다. 이 판은 정문 밖에 사흘 동안 서 있고, 내일 오후와 저녁에 비가 온다는 예보가 있습니다. 아름이는 종이테이프가 눅눅해지는 즉시 떨어져, 목요일이면 사진이 모두 바닥에 있으리라는 것을 압니다. 그녀는 대신 사무실에 있는 방수 테이프를 쓰기를 바랍니다. 이런 상황에서 아름이가 도현이에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 여자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "Hello, everyone. Today I want to talk about the ways animals " +
            "sense parts of the world that are closed to us entirely. " +
            "The pit viper reads the heat of a mouse in complete darkness, " +
            "building a picture of warmth where we would see nothing at all. " +
            "A bee looks at a flower we call yellow " +
            "and sees a pattern of lines pointing straight to the nectar. " +
            "The shark finds a fish buried in sand " +
            "by detecting the faint electricity of its beating heart. " +
            "Elephants hear one another across fifteen kilometres " +
            "using sounds too low for any human ear to catch. " +
            "The world we describe is only the part our senses happen to reach.",
        ],
      ],
      choices: [
        "how animals sense what humans cannot",
        "why some animals hunt at night",
        "how flowers attract bees",
        "why elephants live in family groups",
        "how sharks move through deep water",
      ],
      answer: 1,
      clue: "The world we describe is only the part our senses happen to reach.",
      explanation:
        "사람이 느끼지 못하는 것을 감지하는 동물의 감각이 중심 내용이다. 따라서 답은 ①이다.",
      translation: [
        "W: 여러분, 안녕하세요. 오늘은 동물들이 우리에게는 아예 닫혀 있는 세계를 어떻게 느끼는지 이야기하려 합니다. 살무사는 칠흑 같은 어둠 속에서 쥐의 열을 읽어, 우리라면 아무것도 보이지 않을 자리에 따뜻함의 그림을 그립니다. 꿀벌은 우리가 노랗다고 부르는 꽃을 보면서, 꿀이 있는 쪽을 곧장 가리키는 줄무늬를 봅니다. 상어는 모래에 묻힌 물고기를 그 뛰는 심장의 희미한 전기로 찾아냅니다. 코끼리는 사람 귀로는 잡을 수 없는 낮은 소리로 15킬로미터 밖의 서로에게 말을 건넵니다. 우리가 말하는 세계는 우리 감각이 마침 닿는 부분일 뿐입니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "다음을 듣고, 언급된 동물이 아닌 것을 고르시오.",
      lines: [
        ["W", "The pit viper reads the heat of a mouse in complete darkness."],
        ["W", "A bee sees a pattern of lines pointing to the nectar."],
        ["W", "The shark detects the faint electricity of a beating heart."],
        ["W", "Elephants hear one another across fifteen kilometres."],
        ["W", "The world we describe is only the part our senses reach."],
      ],
      choices: ["pit vipers", "bees", "sharks", "elephants", "owls"],
      answer: 5,
      clue: "Elephants hear one another across fifteen kilometres.",
      explanation:
        "살무사, 꿀벌, 상어, 코끼리는 언급되지만 올빼미는 나오지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
