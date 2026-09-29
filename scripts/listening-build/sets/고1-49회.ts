/** 고1 듣기 49회 — 사람이 직접 쓴 회차 (2026-09-29) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고1 49회",
  gradeLevel: "high1",
  speechSpeed: 0.8,
  folder: "고1 듣기",
  questions: [
    {
      order: 1,
      type: "목적 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 목적으로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "Good morning, students. This is the school health office. " +
            "Every winter we see the same pattern in this building. " +
            "Windows stay shut from first period until the end of the day, " +
            "and by Thursday half of a class is coughing. " +
            "Starting this week we are asking every classroom to do one thing. " +
            "Between each period, open the two windows at the back for three minutes. " +
            "Three minutes is enough to change the air without cooling the room, " +
            "and the student sitting nearest the window will be asked to do it. " +
            "A small card with these instructions goes up beside each window today. " +
            "This costs nothing and takes almost no time, " +
            "but it is the single most effective thing we can do this season.",
        ],
      ],
      choices: [
        "쉬는 시간마다 환기하도록 당부하려고",
        "감기 예방 접종을 안내하려고",
        "난방 시간을 알리려고",
        "보건실 이용 방법을 알리려고",
        "결석 처리 방법을 알리려고",
      ],
      answer: 1,
      clue: "open the two windows at the back for three minutes",
      explanation:
        "쉬는 시간마다 창문을 열어 환기하라고 당부하고 있다. 따라서 답은 ①이다.",
      translation: [
        "W: 학생 여러분, 안녕하세요. 보건실입니다. 겨울마다 이 건물에서는 같은 일이 되풀이됩니다. 1교시부터 하루가 끝날 때까지 창문이 닫혀 있고, 목요일쯤이면 한 반의 절반이 기침을 합니다. 이번 주부터 모든 교실에 한 가지를 부탁드립니다. 수업과 수업 사이에 뒤쪽 창문 두 개를 3분 동안 열어 주세요. 3분이면 방을 식히지 않고도 공기를 바꾸기에 충분하고, 창가에 가장 가까이 앉은 학생이 맡아 주시면 됩니다. 이 안내를 적은 작은 쪽지를 오늘 창문마다 붙여 둡니다. 돈도 들지 않고 시간도 거의 들지 않지만, 이번 철에 우리가 할 수 있는 가장 효과적인 한 가지입니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 남자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Hyejin here says you always answer questions with a question."],
        ["M", "Only when someone asks me how to solve a problem."],
        ["W", "Wouldn't it be kinder to just tell them the answer?"],
        ["M", "Kinder for one minute, useless for the next test."],
        ["W", "But they came to you because they were stuck."],
        ["M", "Being stuck is the moment before understanding."],
        ["W", "So you ask them what they already tried."],
        ["M", "Usually they find the mistake while explaining it to me."],
        ["W", "And you said nothing at all."],
        ["M", "I said one question. They did the rest."],
        ["W", "Some people must find that annoying."],
        ["M", "An answer given is forgotten; an answer found stays."],
        ["W", "I'll try asking instead of telling tomorrow."],
      ],
      choices: [
        "스스로 찾은 답이 오래간다",
        "모르는 것은 바로 물어야 한다",
        "설명은 짧을수록 좋다",
        "친구끼리 가르치는 것이 효과적이다",
        "질문은 글로 남겨야 한다",
      ],
      answer: 1,
      clue: "An answer given is forgotten; an answer found stays.",
      explanation:
        "남자는 스스로 찾아낸 답이 남는다고 말한다. 따라서 답은 ①이다.",
      translation: [
        "W: 혜진이가 그러는데 너는 질문에 늘 질문으로 답한다며.",
        "M: 문제를 어떻게 푸느냐고 물을 때만 그래.",
        "W: 그냥 답을 알려 주는 게 더 친절하지 않아?",
        "M: 1분 동안은 친절하고, 다음 시험에는 쓸모없지.",
        "W: 막혀서 너한테 온 거잖아.",
        "M: 막혀 있는 그때가 이해하기 바로 전이야.",
        "W: 그래서 지금까지 뭘 해 봤는지 묻는구나.",
        "M: 보통은 나한테 설명하다가 자기가 실수를 찾아.",
        "W: 너는 아무 말도 안 했는데.",
        "M: 질문 하나를 했지. 나머지는 그 사람이 했어.",
        "W: 누구는 답답해할 수도 있겠다.",
        "M: 받은 답은 잊히고, 찾은 답은 남아.",
        "W: 내일은 말해 주는 대신 물어봐야겠다.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Many people believe that a decision is best made when all the facts are in. " +
            "So they gather one more opinion, read one more review, wait one more day. " +
            "But information has a shape most of us never notice. " +
            "The first few facts change your mind a great deal; " +
            "the twentieth changes almost nothing except your confidence. " +
            "Past a certain point, gathering is no longer thinking. " +
            "It is a comfortable way of not choosing. " +
            "The cost of waiting is invisible, which is exactly why we ignore it. " +
            "Decide when the next fact would not change your answer, " +
            "and accept that this moment arrives earlier than it feels.",
        ],
      ],
      choices: [
        "정보를 계속 모으는 것이 결정을 미루는 방법이 되기도 한다",
        "결정하기 전에 자료를 충분히 모아야 한다",
        "다른 사람의 의견을 들어야 한다",
        "중요한 결정은 미루는 것이 좋다",
        "실패에서 배우는 것이 가장 빠르다",
      ],
      answer: 1,
      clue: "It is a comfortable way of not choosing.",
      explanation:
        "정보 모으기가 편안하게 결정을 미루는 방법이 된다고 말한다. 따라서 답은 ①이다.",
      translation: [
        "M: 많은 사람이 모든 사실이 모였을 때 가장 좋은 결정을 내린다고 믿습니다. 그래서 의견을 하나 더 듣고, 후기를 하나 더 읽고, 하루를 더 기다립니다. 그러나 정보에는 우리가 잘 알아채지 못하는 모양이 있습니다. 처음 몇 가지 사실은 생각을 크게 바꾸지만, 스무 번째 사실은 확신 말고는 거의 아무것도 바꾸지 않습니다. 어느 지점을 넘어서면 모으기는 더 이상 생각하기가 아닙니다. 고르지 않는 편안한 방법일 뿐입니다. 기다리는 값은 눈에 보이지 않고, 그래서 우리는 그것을 모른 척합니다. 다음 사실이 답을 바꾸지 못할 때 결정하십시오. 그리고 그 순간이 느껴지는 것보다 일찍 온다는 것을 받아들이십시오.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["W", "Dohyun, is this the photo of the reading corner you made?"],
        ["M", "Yes, the club finished it during the exam week."],
        ["W", "There's a wide sofa against the back wall."],
        ["M", "Three people can sit on it comfortably."],
        ["W", "And a square table stands in front of the sofa."],
        ["M", "It's round, actually. The square one wouldn't fit."],
        ["W", "I see two cushions on the sofa."],
        ["M", "Students keep moving them to the floor."],
        ["W", "There's a tall lamp in the left corner."],
        ["M", "We turn it on when the sky gets dark."],
        ["W", "And a shelf of books hangs above the sofa."],
        ["M", "Only paperbacks, so it isn't too heavy."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 2,
      clue: "It's round, actually. The square one wouldn't fit.",
      explanation:
        "소파 앞 탁자가 네모라고 했지만 둥근 탁자라고 했다. 따라서 답은 ②이다.",
      figure: {
        kind: "figure5",
        scene:
          "A reading corner in a school room, clean black line art on a plain white background, no writing or letters anywhere. " +
          "A WIDE SOFA stands against the back wall. " +
          "A SQUARE TABLE stands in front of the sofa. " +
          "TWO CUSHIONS sit on the sofa. " +
          "A TALL FLOOR LAMP stands in the left corner. " +
          "A SHELF OF BOOKS hangs on the wall above the sofa.",
        spots: [
          [0.5, 0.55],
          [0.5, 0.82],
          [0.68, 0.48],
          [0.1, 0.5],
          [0.5, 0.2],
        ],
      },
      translation: [
        "W: 도현아, 이게 너희가 만든 독서 공간 사진이야?",
        "M: 응, 시험 주간에 동아리가 마무리했어.",
        "W: 뒷벽에 넓은 소파가 있네.",
        "M: 세 명이 편하게 앉을 수 있어.",
        "W: 그리고 소파 앞에 네모난 탁자가 있고.",
        "M: 사실 둥근 거야. 네모난 건 자리에 안 맞았어.",
        "W: 소파 위에 방석 두 개가 보여.",
        "M: 애들이 자꾸 바닥으로 내려놔.",
        "W: 왼쪽 구석에는 키 큰 등이 있고.",
        "M: 하늘이 어두워지면 켜.",
        "W: 그리고 소파 위에 책 선반이 걸려 있네.",
        "M: 문고본만 올려서 무겁지 않아.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 남자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Kiwon, the school concert begins in forty minutes."],
        ["M", "The chairs are out and the stage is swept."],
        ["W", "Did anyone bring the programs from the print shop?"],
        ["M", "I picked them up this morning."],
        ["W", "Then we only need the microphone stand."],
        ["M", "Isn't it already on the stage?"],
        ["W", "That one broke during the rehearsal."],
        ["M", "There's a spare in the music room cupboard."],
        ["W", "The music teacher leaves at four o'clock."],
        ["M", "It's ten to four. I should go right now."],
        ["W", "I'll hand out the programs at the door."],
        ["M", "I'll go and fetch the spare microphone stand."],
      ],
      choices: [
        "순서지를 나눠 주기",
        "무대를 쓸기",
        "여분 마이크 받침대를 가져오기",
        "의자를 놓기",
        "인쇄소에 가기",
      ],
      answer: 3,
      clue: "I'll go and fetch the spare microphone stand.",
      explanation:
        "남자는 음악실에서 여분 마이크 받침대를 가져오겠다고 했다. 따라서 답은 ③이다.",
      translation: [
        "W: 기원아, 음악회가 40분 뒤에 시작해.",
        "M: 의자는 놓았고 무대도 쓸었어.",
        "W: 인쇄소에서 순서지는 누가 가져왔어?",
        "M: 오늘 아침에 내가 찾아왔어.",
        "W: 그럼 마이크 받침대만 있으면 되겠다.",
        "M: 무대에 이미 있지 않아?",
        "W: 그건 예행연습 때 망가졌어.",
        "M: 음악실 장에 여분이 하나 있어.",
        "W: 음악 선생님이 네 시에 가셔.",
        "M: 네 시 10분 전이야. 지금 바로 가야겠다.",
        "W: 나는 문에서 순서지를 나눠 줄게.",
        "M: 내가 가서 여분 마이크 받침대를 가져올게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 여자가 지불할 금액을 고르시오.",
      lines: [
        ["M", "Welcome to the museum. How many tickets do you need?"],
        ["W", "Five student tickets for the afternoon, please."],
        ["M", "Student tickets are six dollars each today."],
        ["W", "Is the special exhibition included in that?"],
        ["M", "That room is two dollars extra per person."],
        ["W", "We'd like to see it as well."],
        ["M", "So five tickets and five exhibition passes."],
        ["W", "Do you have a group rate?"],
        ["M", "Groups of five or more get ten percent off the total."],
        ["W", "That's good news for us."],
        ["M", "The discount applies to both the tickets and the passes."],
        ["W", "Then I'll pay for everything now."],
      ],
      choices: ["$32.40", "$36.00", "$38.00", "$40.00", "$44.00"],
      answer: 2,
      clue: "Student tickets are six dollars each today.",
      explanation:
        "표 다섯 장 30달러와 특별전 다섯 명 10달러로 40달러인데, 10퍼센트를 빼면 36달러이다. 따라서 답은 ②이다.",
      translation: [
        "M: 박물관에 오신 걸 환영합니다. 표가 몇 장 필요하신가요?",
        "W: 오후로 학생 표 다섯 장 주세요.",
        "M: 오늘 학생 표는 한 장에 6달러입니다.",
        "W: 특별 전시도 거기 포함인가요?",
        "M: 그 전시실은 한 사람당 2달러를 더 내셔야 합니다.",
        "W: 그것도 보고 싶어요.",
        "M: 그럼 표 다섯 장에 특별전 다섯 명이네요.",
        "W: 단체 할인은 있나요?",
        "M: 다섯 명 이상이면 전체에서 10퍼센트 할인됩니다.",
        "W: 잘됐네요.",
        "M: 할인은 표와 특별전 모두에 들어갑니다.",
        "W: 그럼 지금 다 낼게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 여자가 자전거를 타지 않는 이유를 고르시오.",
      lines: [
        ["M", "Suyeon, you've been taking the bus all week."],
        ["M", "You used to ride your bike every morning."],
        ["W", "I know, and I miss it already."],
        ["M", "Did something happen to the bike?"],
        ["W", "It's in perfect shape, parked at home."],
        ["M", "Then is the weather bothering you?"],
        ["W", "The mornings have been clear, actually."],
        ["M", "So what changed?"],
        ["W", "They closed the river path for repairs."],
        ["M", "And the road route is the long way around."],
        ["W", "It would add twenty-five minutes each way."],
        ["M", "Then the bus makes sense until it reopens."],
      ],
      choices: [
        "자전거가 고장 나서",
        "날씨가 좋지 않아서",
        "몸이 아파서",
        "자전거 길이 공사로 막혀서",
        "버스가 더 빨라서",
      ],
      answer: 4,
      clue: "They closed the river path for repairs.",
      explanation:
        "강변 자전거 길이 공사로 막혀 버스를 탄다. 따라서 답은 ④이다.",
      translation: [
        "M: 수연아, 일주일 내내 버스를 타네.",
        "M: 전에는 아침마다 자전거를 탔잖아.",
        "W: 그러게, 벌써 그리워.",
        "M: 자전거에 무슨 일 있어?",
        "W: 멀쩡해. 집에 세워 뒀어.",
        "M: 그럼 날씨 때문이야?",
        "W: 아침마다 맑았는걸.",
        "M: 그럼 뭐가 바뀐 거야?",
        "W: 강변 길을 공사한다고 막았어.",
        "M: 도로로 가면 멀리 돌아가야 하지.",
        "W: 편도로 25분이 더 걸려.",
        "M: 그럼 다시 열릴 때까지는 버스가 낫겠다.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 교내 영어 말하기 대회에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["W", "Junho, are you entering the English speaking contest?"],
        ["W", "The sign-up sheet went up outside the English office."],
        ["M", "I saw it this morning. When is it held?"],
        ["W", "On the first Friday of next month, in the main hall."],
        ["M", "How long does each speech have to be?"],
        ["W", "Between three and five minutes, no longer."],
        ["M", "Is there a set topic?"],
        ["W", "A person who changed the way you think."],
        ["M", "Can we use slides while we speak?"],
        ["W", "No slides at all, only your voice."],
        ["M", "That makes the opening line matter even more."],
        ["W", "Apply by Wednesday at the English office."],
        ["M", "Then I'll write my opening tonight."],
      ],
      choices: ["열리는 날과 장소", "연설 길이", "주제", "자료 사용 여부", "심사 위원"],
      answer: 5,
      clue: "On the first Friday of next month, in the main hall.",
      explanation:
        "날짜와 장소, 길이, 주제, 자료 사용은 말했지만 심사 위원은 말하지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 준호야, 영어 말하기 대회에 나갈 거야?",
        "W: 영어과 교무실 밖에 신청서가 붙었어.",
        "M: 오늘 아침에 봤어. 언제 해?",
        "W: 다음 달 첫째 주 금요일, 대강당에서.",
        "M: 연설은 얼마나 해야 해?",
        "W: 3분에서 5분 사이, 그보다 길면 안 돼.",
        "M: 정해진 주제가 있어?",
        "W: 내 생각을 바꾼 사람.",
        "M: 말하면서 자료를 써도 돼?",
        "W: 자료는 아예 안 돼. 목소리만.",
        "M: 그럼 첫 문장이 더 중요해지겠네.",
        "W: 수요일까지 영어과 교무실에서 신청해.",
        "M: 그럼 오늘 밤에 첫 문장을 써야겠다.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "다음을 듣고, 학교 신문 기자단 모집에 관한 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "W",
          "Hello, students. The school newspaper is looking for new reporters. " +
            "We need eight students for the coming school year. " +
            "Anyone in the first or second grade may apply. " +
            "Write a short article about something that happened at school " +
            "and send the file to the newspaper club email. " +
            "The deadline is next Monday at six in the evening. " +
            "We meet every Tuesday after the seventh period in the club room. " +
            "Reporters do not need any experience with writing. " +
            "Training is given during the first month by the current members.",
        ],
      ],
      choices: [
        "여덟 명을 뽑는다",
        "1·2학년이 지원할 수 있다",
        "짧은 기사를 써서 보내야 한다",
        "화요일 7교시 후에 모인다",
        "글을 써 본 경험이 있어야 한다",
      ],
      answer: 5,
      clue: "Reporters do not need any experience with writing.",
      explanation:
        "글쓰기 경험이 필요 없다고 했으므로 ⑤가 일치하지 않는다.",
      translation: [
        "W: 학생 여러분, 안녕하세요. 학교 신문에서 새 기자를 찾고 있습니다. 다가오는 학년도에 여덟 명이 필요합니다. 1학년이나 2학년이면 누구나 지원할 수 있습니다. 학교에서 있었던 일에 대해 짧은 기사를 써서 신문 동아리 전자우편으로 파일을 보내 주세요. 마감은 다음 주 월요일 저녁 여섯 시입니다. 저희는 화요일마다 7교시가 끝난 뒤 동아리방에서 모입니다. 기자에게 글을 써 본 경험이 있어야 하는 것은 아닙니다. 첫 달에는 지금 회원들이 교육을 해 드립니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 고를 봉사 활동을 고르시오.",
      lines: [
        ["M", "Chaewon, which volunteer program should we sign up for?"],
        ["W", "Five are open at the community center this winter."],
        ["M", "We're both free only on Saturday mornings."],
        ["W", "So any weekday program is out for us."],
        ["M", "That still leaves us with a few choices."],
        ["W", "It should also take three hours or less."],
        ["M", "My afternoon class starts at one o'clock."],
        ["W", "One of these runs for five hours straight."],
        ["M", "And it has to be indoors because of the cold."],
        ["W", "Standing outside for three hours would be hard."],
        ["M", "Then only one program fits all three conditions."],
        ["W", "I'll write both our names on the list tomorrow."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 5,
      clue: "We're both free only on Saturday mornings.",
      explanation:
        "토요일 오전, 3시간 이하, 실내인 활동은 ⑤이다. 따라서 답은 ⑤이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Day: Wednesday / Hours: 2 / Place: Indoor" },
          { no: 2, label: "②", value: "Day: Saturday / Hours: 5 / Place: Indoor" },
          { no: 3, label: "③", value: "Day: Saturday / Hours: 3 / Place: Outdoor" },
          { no: 4, label: "④", value: "Day: Thursday / Hours: 3 / Place: Indoor" },
          { no: 5, label: "⑤", value: "Day: Saturday / Hours: 2 / Place: Indoor" },
        ],
      },
      translation: [
        "M: 채원아, 어떤 봉사 활동을 신청할까?",
        "W: 이번 겨울에 주민 센터에서 다섯 개가 열려.",
        "M: 우리 둘 다 토요일 오전에만 시간이 돼.",
        "W: 그럼 평일 것은 우리한테 빠지네.",
        "M: 그래도 고를 게 몇 개 남아.",
        "W: 시간도 세 시간 이하여야 해.",
        "M: 내 오후 수업이 한 시에 시작해.",
        "W: 이 중 하나는 다섯 시간을 내리 해.",
        "M: 그리고 추우니까 실내여야 해.",
        "W: 세 시간을 밖에 서 있기는 힘들지.",
        "M: 그럼 세 조건에 다 맞는 건 하나뿐이야.",
        "W: 내일 명단에 우리 둘 이름을 적을게.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Did you sign up for the volunteer day?"],
        ["W", "I put my name down this morning."],
        ["M", "They need people who can carry boxes."],
        ["W", "I can do that for a few hours."],
        ["M", "Shall we go together on Saturday?"],
      ],
      choices: [
        "The volunteer day ended.",
        "I don't like Saturdays.",
        "There are no boxes.",
        "Sure, let's meet at the gate.",
        "I never signed up.",
      ],
      answer: 4,
      clue: "Shall we go together on Saturday?",
      explanation:
        "토요일에 같이 가자는 제안이므로, 정문에서 만나자는 ④가 가장 자연스럽다.",
      translation: [
        "M: 봉사의 날 신청했어?",
        "W: 오늘 아침에 이름 적었어.",
        "M: 상자 나를 사람이 필요하대.",
        "W: 몇 시간은 할 수 있어.",
        "M: 토요일에 같이 갈까?",
        "W: 좋아, 정문에서 만나자.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Excuse me, where can I return this borrowed umbrella?"],
        ["M", "There's a stand by the front door."],
        ["W", "Do I need to tell anyone?"],
        ["M", "Just put it back; the office checks it daily."],
        ["W", "Should I write my name somewhere?"],
      ],
      choices: [
        "The office is closed.",
        "No, that isn't needed.",
        "I don't have an umbrella.",
        "You can't return it.",
        "There is no front door.",
      ],
      answer: 2,
      clue: "Should I write my name somewhere?",
      explanation:
        "이름을 적어야 하는지 물었으므로, 그럴 필요 없다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 실례합니다, 빌린 우산은 어디에 돌려놓나요?",
        "M: 정문 옆에 꽂이가 있어요.",
        "W: 누구한테 말해야 하나요?",
        "M: 그냥 꽂아 두시면 돼요. 사무실에서 매일 확인해요.",
        "W: 어디에 이름을 적어야 하나요?",
        "M: 아니요, 그러실 필요 없습니다.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Sangjun, how is your morning study going?"],
        ["M", "I get up at five thirty and open my books."],
        ["W", "That's early. How long do you last?"],
        ["M", "About twenty minutes before I fall asleep again."],
        ["W", "What do you do in those twenty minutes?"],
        ["M", "I read the hardest subject first."],
        ["W", "Right after waking, with your eyes half closed."],
        ["M", "I thought the hardest thing deserved the first hour."],
        ["W", "The first hour is when you are least awake."],
        ["M", "So the hard subject is wasted there."],
        ["W", "What could you read at five thirty instead?"],
      ],
      choices: [
        "Nothing, I'll sleep until seven.",
        "Yesterday's notes, maybe.",
        "I'll read two hard subjects.",
        "I'll stop studying in the morning.",
        "The hardest subject twice.",
      ],
      answer: 2,
      clue: "What could you read at five thirty instead?",
      explanation:
        "그 시간에 대신 무엇을 읽을지 물었으므로, 어제 필기라는 ②가 가장 자연스럽다.",
      translation: [
        "W: 상준아, 아침 공부는 잘돼 가?",
        "M: 다섯 시 반에 일어나서 책을 펴.",
        "W: 이르네. 얼마나 버텨?",
        "M: 다시 잠들기까지 20분쯤.",
        "W: 그 20분에 뭘 해?",
        "M: 제일 어려운 과목을 먼저 읽어.",
        "W: 막 일어나서, 눈도 덜 뜬 채로.",
        "M: 제일 어려운 건 첫 시간을 줘야 한다고 생각했어.",
        "W: 첫 시간이 가장 덜 깬 때야.",
        "M: 그럼 어려운 과목이 거기서 낭비되는 거네.",
        "W: 다섯 시 반에는 대신 뭘 읽으면 좋을까?",
        "M: 어제 필기 정도.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Yerin, you said the class blog gets no visitors."],
        ["W", "Twelve people all last month."],
        ["M", "How often do you put something up?"],
        ["W", "Whenever we have something worth posting."],
        ["M", "And how often is that, really?"],
        ["W", "Once in October, twice in September."],
        ["M", "So a reader never knows when to come back."],
        ["W", "I hadn't thought about it from their side."],
        ["M", "A small thing on a fixed day beats a big thing whenever."],
        ["W", "That would mean writing even on quiet weeks."],
        ["M", "Which day could you promise every week?"],
      ],
      choices: [
        "No day at all.",
        "Friday, probably.",
        "I'll post three times a day.",
        "I'll close the blog.",
        "Only when something happens.",
      ],
      answer: 2,
      clue: "Which day could you promise every week?",
      explanation:
        "매주 약속할 수 있는 요일을 물었으므로, 금요일이라는 ②가 가장 자연스럽다.",
      translation: [
        "M: 예린아, 학급 블로그에 오는 사람이 없다고 했잖아.",
        "W: 지난달 통틀어 열두 명.",
        "M: 얼마나 자주 올려?",
        "W: 올릴 만한 게 있을 때마다.",
        "M: 그게 실제로 얼마나 자주야?",
        "W: 10월에 한 번, 9월에 두 번.",
        "M: 그럼 읽는 사람은 언제 다시 와야 할지 모르지.",
        "W: 그쪽 입장에서는 생각 못 했어.",
        "M: 정해진 날에 올리는 작은 것이 아무 때나 올리는 큰 것보다 나아.",
        "W: 그러면 조용한 주에도 써야 한다는 거네.",
        "M: 매주 약속할 수 있는 요일이 언제야?",
        "W: 아마 금요일.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Taeho가 Nari에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Taeho : ________________",
      lines: [
        [
          "M",
          "Taeho and Nari are running the club booth at the school festival. " +
            "They are selling handmade cards to raise money for the animal shelter. " +
            "Nari has set the price at five hundred won for each card. " +
            "Taeho worked out this morning that the paper and ink alone " +
            "cost them nearly seven hundred won for every card they make. " +
            "At this price the club would lose money on every single sale. " +
            "The booth opens in ten minutes and the sign is not yet written. " +
            "He wants to tell her the price must be raised before they open. " +
            "In this situation, what would Taeho most likely say to Nari?",
        ],
      ],
      choices: [
        "Let's make fewer cards today.",
        "The festival starts tomorrow.",
        "We need to raise the price.",
        "Let's give the cards away.",
        "Nobody will buy the cards.",
      ],
      answer: 3,
      clue: "He wants to tell her the price must be raised before they open.",
      explanation:
        "원가가 값보다 높으므로, 값을 올려야 한다는 ③이 가장 적절하다.",
      translation: [
        "M: 태호와 나리는 학교 축제에서 동아리 부스를 맡고 있습니다. 동물 보호소에 보낼 돈을 모으려고 손으로 만든 카드를 팝니다. 나리는 카드 한 장 값을 500원으로 정했습니다. 태호가 오늘 아침에 계산해 보니, 종이와 잉크만으로도 한 장에 700원 가까이 듭니다. 이 값이면 한 장 팔 때마다 동아리가 손해를 봅니다. 부스는 10분 뒤에 열고 안내판은 아직 쓰지 않았습니다. 그는 열기 전에 값을 올려야 한다고 말하고 싶습니다. 이런 상황에서 태호가 나리에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 여자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "Hello, everyone. Today I want to talk about the ways living things " +
            "carry water through bodies that have no pump at all. " +
            "A tall tree lifts water a hundred meters into its highest leaves, " +
            "not by pushing it up but by letting the top leaves lose water " +
            "so that the column below is pulled upward like a thread. " +
            "The desert beetle of Namibia stands facing the morning fog " +
            "and lets droplets gather on its back and roll into its mouth. " +
            "Certain frogs in dry country soak water through the skin of their belly " +
            "while sitting in a puddle no deeper than a coin. " +
            "The kangaroo rat never drinks at all; " +
            "it makes the water it needs out of the dry seeds it eats. " +
            "Each of these is a different answer to the same hard question.",
        ],
      ],
      choices: [
        "how living things obtain and move water",
        "why deserts receive so little rain",
        "how trees grow taller than other plants",
        "why some animals live near rivers",
        "how fog forms along the coast",
      ],
      answer: 1,
      clue: "Each of these is a different answer to the same hard question.",
      explanation:
        "생물들이 물을 얻고 옮기는 여러 방식이 중심 내용이다. 따라서 답은 ①이다.",
      translation: [
        "W: 여러분, 안녕하세요. 오늘은 펌프가 없는 몸으로 생물들이 어떻게 물을 나르는지 이야기하려 합니다. 큰 나무는 물을 100미터 높이 잎까지 끌어올리는데, 밀어 올리는 것이 아니라 꼭대기 잎이 물을 내보내게 해서 아래의 물기둥이 실처럼 딸려 올라오게 합니다. 나미비아의 사막 딱정벌레는 아침 안개를 마주 보고 서서, 등에 맺힌 물방울이 굴러 입으로 들어오게 합니다. 메마른 땅의 어떤 개구리들은 동전 깊이도 안 되는 물웅덩이에 앉아 배 쪽 살갗으로 물을 빨아들입니다. 캥거루쥐는 아예 물을 마시지 않습니다. 먹는 마른 씨앗에서 필요한 물을 만들어 냅니다. 이들 하나하나가 같은 어려운 물음에 대한 서로 다른 답입니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "다음을 듣고, 언급된 생물이 아닌 것을 고르시오.",
      lines: [
        ["W", "A tall tree lifts water a hundred meters into its highest leaves."],
        ["W", "The desert beetle of Namibia stands facing the morning fog."],
        ["W", "Certain frogs soak water through the skin of their belly."],
        ["W", "The kangaroo rat makes the water it needs out of dry seeds."],
        ["W", "Each of these is a different answer to the same question."],
      ],
      choices: ["tall trees", "desert beetles", "frogs", "kangaroo rats", "camels"],
      answer: 5,
      clue: "The kangaroo rat makes the water it needs out of dry seeds.",
      explanation:
        "나무, 사막 딱정벌레, 개구리, 캥거루쥐는 언급되지만 낙타는 나오지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
