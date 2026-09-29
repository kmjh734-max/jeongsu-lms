/** 고3 듣기 44회 — 사람이 직접 쓴 회차 (2026-09-29) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고3 44회",
  gradeLevel: "high3",
  speechSpeed: 0.8,
  folder: "고3 듣기",
  questions: [
    {
      order: 1,
      type: "목적 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 목적으로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "Good morning, everyone. This is the school office. " +
            "Over the past month we have collected eleven umbrellas, " +
            "nine water bottles, four calculators and two pairs of glasses. " +
            "They sit in a box behind the front desk, and almost nobody comes. " +
            "Students tell us they assumed a lost thing was gone for good. " +
            "In fact most of what is handed in is never claimed at all. " +
            "So before you buy another calculator, come and look in the box. " +
            "It is open all day, and you do not need to ask anyone. " +
            "Anything still there at the end of term goes to the charity shop. " +
            "Please come and take a look this week.",
        ],
      ],
      choices: [
        "분실물을 찾아가라고 알리려고",
        "물건을 잃어버리지 않게 주의시키려고",
        "학교 사무실 이전을 알리려고",
        "자선 가게를 소개하려고",
        "학용품 구입을 안내하려고",
      ],
      answer: 1,
      clue: "So before you buy another calculator, come and look in the box.",
      explanation:
        "사무실에 모인 분실물을 찾아가라고 알리고 있다. 따라서 답은 ①이다.",
      translation: [
        "W: 여러분, 안녕하세요. 학교 사무실입니다. 지난 한 달 동안 우산 열한 개, 물병 아홉 개, 계산기 네 개, 안경 두 개가 모였습니다. 안내대 뒤 상자에 놓여 있는데 찾아오는 사람이 거의 없습니다. 학생들은 잃어버린 물건은 영영 사라진 줄 알았다고 말합니다. 사실은 들어온 물건 대부분이 끝내 주인을 찾지 못합니다. 그러니 계산기를 새로 사기 전에 와서 상자를 들여다보세요. 하루 종일 열려 있고, 누구에게 여쭤볼 필요도 없습니다. 학기가 끝날 때까지 남은 것은 자선 가게로 보냅니다. 이번 주에 꼭 한번 들러 주세요.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 남자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Jiseok, you read the question twice before looking at the choices?"],
        ["M", "Twice, and I cover the choices while I do it."],
        ["W", "Doesn't that waste time on a long paper?"],
        ["M", "Ten seconds a question, and I get them back later."],
        ["W", "How would covering them help at all?"],
        ["M", "I decide what the answer should be before I see five of them."],
        ["W", "And then you look for the one that matches."],
        ["M", "Rather than being pulled towards whichever sounds cleverest."],
        ["W", "The wrong ones are written to sound right, I suppose."],
        ["M", "That's exactly what they're for."],
        ["W", "So the choices are an argument, not a list."],
        ["M", "Answer the question first; then meet the choices."],
        ["W", "I'll try covering them tomorrow."],
      ],
      choices: [
        "보기를 보기 전에 스스로 답을 정해야 한다",
        "문제는 빨리 풀어야 한다",
        "어려운 문제는 넘겨야 한다",
        "보기를 하나씩 지워 가야 한다",
        "문제를 소리 내어 읽어야 한다",
      ],
      answer: 1,
      clue: "Answer the question first; then meet the choices.",
      explanation:
        "남자는 보기를 보기 전에 스스로 답을 정해 두라고 말한다. 따라서 답은 ①이다.",
      translation: [
        "W: 지석아, 보기를 보기 전에 문제를 두 번 읽는다고?",
        "M: 두 번, 그리고 읽는 동안 보기를 가려 둬.",
        "W: 문제 많은 시험에서 시간 낭비 아니야?",
        "M: 한 문제에 10초인데 나중에 돌려받아.",
        "W: 가리는 게 어떻게 도움이 돼?",
        "M: 다섯 개를 보기 전에 답이 뭐여야 하는지 정하거든.",
        "W: 그러고 나서 맞는 걸 찾는구나.",
        "M: 제일 똑똑해 보이는 쪽으로 끌려가는 대신에.",
        "W: 틀린 보기는 맞아 보이게 쓰여 있으니까.",
        "M: 바로 그러라고 있는 거야.",
        "W: 그러니까 보기는 목록이 아니라 설득이네.",
        "M: 문제부터 답하고, 그다음에 보기를 만나.",
        "W: 내일 가리고 해 볼게.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "There is a kind of tiredness that sleep does not touch. " +
            "You slept eight hours and you are still heavy at ten in the morning. " +
            "We usually conclude that we need more rest, and take more. " +
            "But much of this heaviness comes from carrying unfinished things. " +
            "Four small tasks you have not done sit somewhere in the mind, " +
            "and each one asks a little of you every hour of the day. " +
            "Finishing one of them costs ten minutes and returns the whole day. " +
            "Before you decide you are tired, count what you are carrying.",
        ],
      ],
      choices: [
        "끝내지 못한 일이 사람을 지치게 한다",
        "잠을 충분히 자야 한다",
        "일을 여러 개 맡지 말아야 한다",
        "아침에 운동을 해야 한다",
        "쉬는 시간을 정해 두어야 한다",
      ],
      answer: 1,
      clue: "Before you decide you are tired, count what you are carrying.",
      explanation:
        "끝내지 못한 일들을 이고 있는 것이 사람을 지치게 한다고 말한다. 따라서 답은 ①이다.",
      translation: [
        "W: 잠으로는 닿지 않는 피로가 있습니다. 여덟 시간을 잤는데도 아침 열 시에 몸이 무겁습니다. 우리는 대개 더 쉬어야 한다고 결론짓고 더 쉽니다. 그러나 그 무거움의 상당 부분은 끝내지 못한 것들을 이고 다니는 데서 옵니다. 하지 않은 작은 일 네 가지가 마음 어딘가에 앉아, 하루의 매 시간마다 조금씩을 달라고 합니다. 그중 하나를 끝내는 데 10분이 들고, 그것이 하루 전체를 돌려줍니다. 지쳤다고 단정하기 전에, 무엇을 이고 있는지부터 세어 보십시오.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["M", "Sein, is this a photo of the school office?"],
        ["W", "They rearranged it during the holiday."],
        ["M", "There's a long counter across the front."],
        ["W", "That's where everything is handed in."],
        ["M", "And a clock hangs on the wall behind it."],
        ["W", "It's the only one in the building that's right."],
        ["M", "Two chairs stand against the side wall."],
        ["W", "Three, actually. They added one in September."],
        ["M", "There's a large box under the counter."],
        ["W", "All the lost things go in there."],
        ["M", "And a potted plant stands by the window."],
        ["W", "The secretary waters it every Friday."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "Three, actually. They added one in September.",
      explanation:
        "의자가 두 개라고 했지만 세 개라고 했다. 따라서 답은 ③이다.",
      figure: {
        kind: "figure5",
        scene:
          "A school office, clean black line art on a plain white background, no writing or letters anywhere. " +
          "A LONG COUNTER runs across the front of the room. " +
          "A CLOCK hangs on the wall behind the counter. " +
          "TWO CHAIRS stand against the side wall on the left. " +
          "A LARGE BOX sits under the counter. " +
          "A POTTED PLANT stands by the window on the right.",
        spots: [
          [0.5, 0.62],
          [0.5, 0.15],
          [0.12, 0.5],
          [0.45, 0.85],
          [0.85, 0.45],
        ],
      },
      translation: [
        "M: 세인아, 이게 학교 사무실 사진이야?",
        "W: 방학 때 자리를 다시 잡았어.",
        "M: 앞쪽을 가로질러 긴 안내대가 있네.",
        "W: 물건은 다 거기로 들어와.",
        "M: 그리고 그 뒤 벽에 시계가 걸려 있고.",
        "W: 건물에서 유일하게 맞는 시계야.",
        "M: 옆 벽에 의자가 두 개 붙어 있어.",
        "W: 사실 세 개야. 9월에 하나 늘렸어.",
        "M: 안내대 밑에 큰 상자가 있네.",
        "W: 잃어버린 물건은 다 거기 들어가.",
        "M: 그리고 창가에 화분이 하나 있고.",
        "W: 사무 선생님이 금요일마다 물을 줘.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 남자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Hyeonjun, the school concert starts at seven tonight."],
        ["W", "The stage is set and the chairs are all out."],
        ["M", "The programme sheets are stacked by the door."],
        ["W", "Did anyone bring the microphone stands from the music room?"],
        ["M", "Jiwoo said she would carry them over at five."],
        ["W", "She went home at four with a twisted ankle."],
        ["M", "Then the stands are still in the music room."],
        ["W", "How many do the singers need?"],
        ["M", "Three, one for each group."],
        ["W", "And the music room is locked at six."],
        ["M", "It's ten to six right now."],
        ["W", "Then you'd have to go this minute."],
        ["M", "There isn't time to argue about it."],
        ["W", "I'll finish handing out the programme sheets."],
        ["M", "I'll go and fetch the microphone stands."],
      ],
      choices: [
        "순서지를 나눠 주기",
        "의자를 놓기",
        "마이크 받침대를 가져오기",
        "지우에게 연락하기",
        "무대를 정리하기",
      ],
      answer: 3,
      clue: "I'll go and fetch the microphone stands.",
      explanation:
        "남자는 음악실에서 마이크 받침대를 가져오겠다고 했다. 따라서 답은 ③이다.",
      translation: [
        "W: 현준아, 학교 음악회는 오늘 밤 일곱 시에 시작해.",
        "W: 무대는 다 차렸고 의자도 전부 놨어.",
        "M: 순서지는 문 옆에 쌓아 놨어.",
        "W: 음악실에서 마이크 받침대는 누가 가져왔어?",
        "M: 지우가 다섯 시에 옮겨 오겠다고 했어.",
        "W: 네 시에 발목을 삐어서 집에 갔어.",
        "M: 그럼 받침대는 아직 음악실에 있겠네.",
        "W: 노래하는 애들한테 몇 개 필요해?",
        "M: 세 개, 모둠마다 하나씩.",
        "W: 그리고 음악실은 여섯 시에 잠가.",
        "M: 지금 여섯 시 10분 전이야.",
        "W: 그럼 당장 가야겠네.",
        "M: 따질 틈이 없다.",
        "W: 나는 순서지 나눠 주는 걸 마무리할게.",
        "M: 내가 가서 마이크 받침대를 가져올게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 여자가 지불할 금액을 고르시오.",
      lines: [
        ["M", "Welcome to the print shop. How can I help you?"],
        ["W", "I need two posters and six leaflets printed."],
        ["M", "The posters are fifteen dollars each in colour."],
        ["W", "Is black and white much cheaper?"],
        ["M", "Half the price, but the photo would be lost."],
        ["W", "Then colour it is, for both."],
        ["M", "And the leaflets are five dollars each."],
        ["W", "Do they come folded?"],
        ["M", "Folding is included in that price."],
        ["W", "Good. Is there a discount for schools?"],
        ["M", "Ten percent off the whole order with a school card."],
        ["W", "Here's the card. I'll pay now."],
      ],
      choices: ["$48.00", "$50.00", "$54.00", "$56.00", "$60.00"],
      answer: 3,
      clue: "The posters are fifteen dollars each in colour.",
      explanation:
        "포스터 2장 30달러와 전단 6장 30달러로 60달러인데, 10퍼센트를 빼면 54달러이다. 따라서 답은 ③이다.",
      translation: [
        "M: 인쇄소에 오신 걸 환영합니다. 무엇을 도와드릴까요?",
        "W: 포스터 두 장과 전단 여섯 장을 뽑아야 해요.",
        "M: 포스터는 색으로 하면 한 장에 15달러입니다.",
        "W: 흑백은 많이 싼가요?",
        "M: 값이 절반인데 사진이 죽어요.",
        "W: 그럼 둘 다 색으로 할게요.",
        "M: 그리고 전단은 한 장에 5달러입니다.",
        "W: 접어서 주시나요?",
        "M: 접는 건 그 값에 들어 있습니다.",
        "W: 좋네요. 학교 할인이 있나요?",
        "M: 학교 카드가 있으면 전체에서 10퍼센트 할인됩니다.",
        "W: 여기 카드요. 지금 낼게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 남자가 도서관에서 공부하게 된 이유를 고르시오.",
      lines: [
        ["W", "Seungmin, you've been at the public library every evening."],
        ["W", "You always said your room was the best place."],
        ["M", "It was, for two years."],
        ["W", "Did something change at home?"],
        ["M", "Nothing has changed at home at all."],
        ["W", "Is the library quieter than your room?"],
        ["M", "Honestly, my room is quieter."],
        ["W", "Then what made you move?"],
        ["M", "At home I can stop whenever I like."],
        ["W", "And nobody sees you stop."],
        ["M", "At a shared table I sit down and stay down."],
        ["W", "Then the library is buying you the hours."],
      ],
      choices: [
        "집에서는 쉽게 그만두게 되어서",
        "집이 시끄러워서",
        "집에 책이 없어서",
        "친구와 함께 공부하려고",
        "집이 너무 추워서",
      ],
      answer: 1,
      clue: "At a shared table I sit down and stay down.",
      explanation:
        "집에서는 마음대로 그만두게 되어 도서관으로 옮겼다. 따라서 답은 ①이다.",
      translation: [
        "W: 승민아, 저녁마다 시립 도서관에 있더라.",
        "W: 네 방이 제일 좋다고 늘 말했잖아.",
        "M: 두 해 동안은 그랬지.",
        "W: 집에 무슨 일 있어?",
        "M: 집은 아무것도 달라진 게 없어.",
        "W: 도서관이 네 방보다 조용해?",
        "M: 솔직히 내 방이 더 조용해.",
        "W: 그럼 왜 옮겼어?",
        "M: 집에서는 아무 때나 그만둘 수 있어.",
        "W: 그만두는 걸 아무도 안 보고.",
        "M: 같이 쓰는 탁자에서는 앉으면 계속 앉아 있게 돼.",
        "W: 그럼 도서관이 그 시간을 사 주는 거네.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 교내 토론 대회에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["M", "Areum, are you entering the debate contest this year?"],
        ["M", "The notice went up outside the library yesterday."],
        ["W", "It's held in the second-floor seminar room."],
        ["M", "Not in the hall like last time?"],
        ["W", "The seminar room, because the audience is smaller."],
        ["M", "When is it being held?"],
        ["W", "The twentieth of November, in the afternoon."],
        ["M", "How many teams can enter?"],
        ["W", "Twelve teams, two students in each."],
        ["M", "What is the topic this year?"],
        ["W", "School rules, announced a week beforehand."],
        ["M", "Do we need to prepare anything in writing?"],
        ["W", "A one-page summary, handed in on the day."],
        ["M", "Then I'll ask Minji to be my partner."],
      ],
      choices: ["열리는 곳", "열리는 날", "참가 팀 수", "논제", "심사 기준"],
      answer: 5,
      clue: "The twentieth of November, in the afternoon.",
      explanation:
        "장소, 날짜, 팀 수, 논제는 말했지만 심사 기준은 말하지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 아름아, 올해 토론 대회 나갈 거야?",
        "M: 어제 도서관 앞에 알림이 붙었더라.",
        "W: 2층 세미나실에서 해.",
        "M: 지난번처럼 강당이 아니고?",
        "W: 보는 사람이 적어서 세미나실에서 해.",
        "M: 언제 해?",
        "W: 11월 20일 오후에.",
        "M: 몇 팀이나 나갈 수 있어?",
        "W: 열두 팀, 한 팀에 두 명씩.",
        "M: 올해 논제는 뭐야?",
        "W: 학교 규칙인데 한 주 전에 알려 줘.",
        "M: 글로 준비할 게 있어?",
        "W: 한 쪽짜리 요약을 그날 내야 해.",
        "M: 그럼 민지한테 같이 하자고 해야겠다.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "다음을 듣고, 겨울 방학 학교 개방에 관한 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "M",
          "Hello, students. Here is how the school will open in the winter break. " +
            "The building is open on weekdays from nine until five. " +
            "Only the second and third floors are in use. " +
            "The library opens at ten, an hour later than the building. " +
            "Lunch is not served, so please bring something with you. " +
            "The gymnasium stays closed for the whole of the break. " +
            "There is a teacher on duty in room 201 every day. " +
            "Tell that teacher when you arrive and when you leave. " +
            "The school is closed from the thirtieth of December to the second of January.",
        ],
      ],
      choices: [
        "평일에 아홉 시부터 다섯 시까지 연다",
        "2층과 3층만 쓴다",
        "도서관은 열 시에 연다",
        "점심이 나온다",
        "체육관은 방학 내내 닫는다",
      ],
      answer: 4,
      clue: "Lunch is not served, so please bring something with you.",
      explanation:
        "점심은 나오지 않는다고 했으므로 ④가 일치하지 않는다.",
      translation: [
        "M: 학생 여러분, 안녕하세요. 겨울 방학 동안 학교를 어떻게 여는지 알려 드립니다. 건물은 평일 아홉 시부터 다섯 시까지 엽니다. 2층과 3층만 씁니다. 도서관은 건물보다 한 시간 늦은 열 시에 엽니다. 점심은 나오지 않으니 먹을 것을 가져오세요. 체육관은 방학 내내 닫습니다. 201호에 날마다 당번 선생님이 계십니다. 오고 갈 때 그 선생님께 말씀드리세요. 12월 30일부터 1월 2일까지는 학교를 닫습니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 여자가 신청할 온라인 강의를 고르시오.",
      lines: [
        ["M", "Yuna, which online course are you going to take?"],
        ["W", "Five are open for the winter."],
        ["M", "I looked at the list with you yesterday."],
        ["W", "They all start on the fifth of January."],
        ["M", "Do you want one with a live class?"],
        ["W", "Recorded only is no good; I never watch them."],
        ["M", "Two of these five are recorded only."],
        ["W", "Then those go straight away."],
        ["M", "How many hours a week can you give it?"],
        ["W", "Not more than four hours a week."],
        ["M", "One of the rest asks for six."],
        ["W", "And it has to be under fifty thousand won."],
        ["M", "That takes out one more of them."],
        ["W", "Then there's only one left for me."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "Recorded only is no good; I never watch them.",
      explanation:
        "생방송이 있고, 주 4시간 이하이며, 5만 원 미만인 것은 ④이다. 따라서 답은 ④이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Class: Recorded / Hours: 3 / Fee: 30,000 won" },
          { no: 2, label: "②", value: "Class: Live / Hours: 6 / Fee: 40,000 won" },
          { no: 3, label: "③", value: "Class: Recorded / Hours: 4 / Fee: 45,000 won" },
          { no: 4, label: "④", value: "Class: Live / Hours: 4 / Fee: 48,000 won" },
          { no: 5, label: "⑤", value: "Class: Live / Hours: 3 / Fee: 60,000 won" },
        ],
      },
      translation: [
        "M: 유나야, 온라인 강의는 어느 걸 들을 거야?",
        "W: 겨울에 다섯 개가 열려.",
        "M: 어제 너랑 같이 목록 봤잖아.",
        "W: 다 1월 5일에 시작해.",
        "M: 생방송 있는 걸로 할 거야?",
        "W: 녹화만 있는 건 소용없어. 안 보게 되더라.",
        "M: 이 다섯 중 두 개가 녹화만이야.",
        "W: 그럼 그건 바로 빠지고.",
        "M: 한 주에 몇 시간이나 쓸 수 있어?",
        "W: 주 4시간을 넘기면 안 돼.",
        "M: 나머지 중 하나는 여섯 시간을 달래.",
        "W: 그리고 5만 원 미만이어야 해.",
        "M: 그럼 하나가 더 빠지네.",
        "W: 그럼 나한테 남는 건 하나뿐이야.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Did you ever find the calculator you lost?"],
        ["W", "No, I gave up looking two weeks ago."],
        ["M", "There's a lost property box in the office."],
        ["W", "I didn't know they kept things there."],
        ["M", "Shall we go and look in it now?"],
      ],
      choices: [
        "The office is on the third floor.",
        "I bought a new one already.",
        "Yes, let's go and check.",
        "Calculators are expensive.",
        "I never lose anything.",
      ],
      answer: 3,
      clue: "Shall we go and look in it now?",
      explanation:
        "지금 가서 보자는 제안이므로, 가서 확인해 보자는 ③이 가장 자연스럽다.",
      translation: [
        "M: 잃어버린 계산기는 찾았어?",
        "W: 아니, 두 주 전에 찾기를 포기했어.",
        "M: 사무실에 분실물 상자가 있어.",
        "W: 거기에 물건을 모아 두는 줄 몰랐어.",
        "M: 지금 가서 볼까?",
        "W: 응, 가서 확인해 보자.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Excuse me, is the gymnasium open during the break?"],
        ["M", "It stays closed for the whole of the break."],
        ["W", "Is there anywhere else I could practise?"],
        ["M", "The yard is open while the building is."],
        ["W", "And when does the building close each day?"],
      ],
      choices: [
        "It never opens at all.",
        "At five on weekdays.",
        "The gymnasium is closed.",
        "You can't practise here.",
        "Ask the teacher tomorrow.",
      ],
      answer: 2,
      clue: "And when does the building close each day?",
      explanation:
        "건물이 날마다 언제 닫는지 물었으므로, 평일 다섯 시라는 ②가 가장 자연스럽다.",
      translation: [
        "W: 실례합니다, 방학 동안 체육관을 여나요?",
        "M: 방학 내내 닫습니다.",
        "W: 그럼 연습할 만한 다른 데가 있나요?",
        "M: 건물이 열려 있는 동안에는 운동장을 쓸 수 있습니다.",
        "W: 건물은 날마다 언제 닫나요?",
        "M: 평일에는 다섯 시에 닫습니다.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Taeho, how is the club newsletter coming along?"],
        ["M", "We put out three issues in the spring and then stopped."],
        ["W", "Did people simply not read them?"],
        ["M", "About ninety copies went every single time."],
        ["W", "Ninety is more than most notices get."],
        ["M", "Two teachers asked me for spare copies as well."],
        ["W", "So the readers were certainly there."],
        ["M", "One person wrote the whole thing each month."],
        ["W", "And that person was you, I suppose."],
        ["M", "Eleven pages, alone, for three months running."],
        ["W", "Nobody keeps that up beside their schoolwork."],
        ["M", "By June I was writing it the night before."],
        ["W", "And the quality would have shown it."],
        ["M", "I didn't want to ask the others for pieces."],
        ["W", "Why not? There are fourteen of you in the club."],
        ["M", "It felt like handing out homework to my friends."],
        ["W", "What would make the fourth issue possible?"],
      ],
      choices: [
        "Writing it all again myself.",
        "A page each from four members.",
        "Stopping the newsletter for good.",
        "Printing fewer copies.",
        "Making it longer than before.",
      ],
      answer: 2,
      clue: "What would make the fourth issue possible?",
      explanation:
        "혼자 다 써서 멈췄으므로, 회원 넷이 한 쪽씩 맡자는 ②가 가장 자연스럽다.",
      translation: [
        "W: 태호야, 동아리 소식지는 잘돼 가?",
        "M: 봄에 세 호를 내고 멈췄어.",
        "W: 사람들이 아예 안 읽었어?",
        "M: 매번 아흔 부쯤 나갔어.",
        "W: 아흔이면 웬만한 알림보다 많은데.",
        "M: 선생님 두 분도 여분을 달라고 하셨어.",
        "W: 그럼 읽는 사람은 분명히 있었네.",
        "M: 달마다 한 사람이 통째로 썼어.",
        "W: 그 한 사람이 너였겠지.",
        "M: 열한 쪽을 석 달 내리 혼자.",
        "W: 학교 공부랑 같이 그걸 버틸 사람은 없어.",
        "M: 6월쯤에는 전날 밤에 몰아 썼어.",
        "W: 그러면 글에서도 티가 났겠다.",
        "M: 다른 애들한테 글을 달라고 하기가 싫었어.",
        "W: 왜? 동아리에 열네 명이나 있잖아.",
        "M: 친구들한테 숙제를 나눠 주는 것 같았어.",
        "W: 네 번째 호가 나오려면 뭐가 있어야 할까?",
        "M: 회원 네 명이 한 쪽씩 맡으면 돼.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Sohee, you said the maths questions take you too long."],
        ["W", "I finish with fifteen minutes missing every time."],
        ["M", "Where do those minutes go?"],
        ["W", "Two or three questions eat most of them."],
        ["M", "Do you know which ones while you're doing them?"],
        ["W", "I usually know within the first thirty seconds."],
        ["M", "And you stay with them anyway."],
        ["W", "It feels like giving up to move on."],
        ["M", "It costs you four easy questions at the end."],
        ["W", "I'd never counted it that way."],
        ["M", "What will you do when you feel that stuck?"],
      ],
      choices: [
        "Keep working until it's solved.",
        "Mark it and come back later.",
        "Start the paper again.",
        "Skip the whole section.",
        "Check my earlier answers.",
      ],
      answer: 2,
      clue: "What will you do when you feel that stuck?",
      explanation:
        "막힐 때 어떻게 할지 물었으므로, 표시해 두고 나중에 돌아오겠다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 소희야, 수학 문제 푸는 데 너무 오래 걸린다고 했지.",
        "W: 매번 15분이 모자란 채로 끝나.",
        "M: 그 시간이 어디로 가는데?",
        "W: 두세 문제가 거의 다 먹어.",
        "M: 푸는 동안 그게 어떤 문제인지 알아?",
        "W: 보통 30초 안에 알아.",
        "M: 그런데도 계속 붙들고 있고.",
        "W: 넘어가는 게 포기하는 것 같아서.",
        "M: 그게 끝에서 쉬운 네 문제를 앗아 가.",
        "W: 그렇게 세어 본 적이 없어.",
        "M: 그렇게 막히면 어떻게 할 거야?",
        "W: 표시해 두고 나중에 돌아올게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Woobin이 Nari에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woobin : ________________",
      lines: [
        [
          "M",
          "Woobin and Nari are packing up after the school concert. " +
            "Nari is winding the microphone cables around her elbow and hand " +
            "and pulling each turn tight before dropping the coil into the case. " +
            "The cables belong to the music room and are used every week. " +
            "Woobin has seen cables wound that way break inside the covering, " +
            "and a broken cable is not found until the next concert starts. " +
            "The proper way is to let each loop fall without twisting it. " +
            "He wants her to wind them loosely instead. " +
            "In this situation, what would Woobin most likely say to Nari?",
        ],
      ],
      choices: [
        "We need longer cables.",
        "Leave the cables on the stage.",
        "Don't pull the coils tight.",
        "The concert starts at seven.",
        "Put the microphones away first.",
      ],
      answer: 3,
      clue: "He wants her to wind them loosely instead.",
      explanation:
        "세게 당겨 감으면 선 속이 끊어지므로, 꽉 조이지 말라는 ③이 가장 적절하다.",
      translation: [
        "M: 우빈이와 나리는 학교 음악회가 끝난 뒤 짐을 챙기고 있습니다. 나리는 마이크 선을 팔꿈치와 손에 감으면서 한 바퀴마다 꽉 당겨 조인 뒤 가방에 넣고 있습니다. 그 선은 음악실 것이고 주마다 씁니다. 우빈이는 그렇게 감은 선이 껍질 안에서 끊어지는 것을 본 적이 있고, 끊어진 선은 다음 음악회가 시작되어서야 드러납니다. 제대로 감으려면 고리마다 꼬이지 않게 그대로 떨어뜨려야 합니다. 그는 느슨하게 감기를 바랍니다. 이런 상황에서 우빈이가 나리에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 남자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Hello, everyone. Today I want to talk about why some bridges " +
            "have fallen down without any unusual weight upon them. " +
            "A bridge is designed for the load it will carry, " +
            "and engineers have known how to calculate that for two centuries. " +
            "What they did not always allow for was rhythm. " +
            "Soldiers marching in step across a bridge apply force at one steady beat, " +
            "and if that beat matches the bridge's own swaying, each step adds to the last. " +
            "A weight the bridge could hold all day becomes a swing it cannot stop. " +
            "This is why marching troops are ordered to break step at a bridge, " +
            "and why modern footbridges are built to absorb the rhythm of a crowd.",
        ],
      ],
      choices: [
        "why rhythm can bring down a strong bridge",
        "how soldiers are trained to march",
        "why bridges are built of steel",
        "how engineers measure heavy loads",
        "why crowds gather on footbridges",
      ],
      answer: 1,
      clue: "A weight the bridge could hold all day becomes a swing it cannot stop.",
      explanation:
        "무게가 아니라 박자가 다리를 무너뜨릴 수 있다는 것이 중심 내용이다. 따라서 답은 ①이다.",
      translation: [
        "M: 여러분, 안녕하세요. 오늘은 유난한 무게가 실리지도 않았는데 무너진 다리들 이야기를 하려 합니다. 다리는 견딜 하중에 맞추어 설계되고, 기술자들은 두 세기 전부터 그것을 셈할 줄 알았습니다. 그들이 늘 헤아리지는 못했던 것이 박자입니다. 발을 맞추어 다리를 건너는 군인들은 한결같은 박자로 힘을 주고, 그 박자가 다리 자체의 흔들림과 맞으면 한 걸음이 앞 걸음에 보태집니다. 하루 종일 버틸 수 있었을 무게가 멈출 수 없는 흔들림이 됩니다. 그래서 행군하는 부대는 다리에서 발을 흐트러뜨리라는 명령을 받고, 요즘 인도교는 사람들의 박자를 흡수하도록 짓습니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "다음을 듣고, 언급된 것이 아닌 것을 고르시오.",
      lines: [
        ["M", "A bridge is designed for the load it will carry."],
        ["M", "What they did not always allow for was rhythm."],
        ["M", "Soldiers marching in step apply force at one steady beat."],
        ["M", "Marching troops are ordered to break step at a bridge."],
        ["M", "Modern footbridges absorb the rhythm of a crowd."],
      ],
      choices: ["a bridge", "rhythm", "soldiers", "a crowd", "a river"],
      answer: 5,
      clue: "Modern footbridges absorb the rhythm of a crowd.",
      explanation:
        "다리, 박자, 군인, 사람들은 언급되지만 강은 나오지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
