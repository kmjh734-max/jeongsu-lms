/** 고2 듣기 37회 — 사람이 직접 쓴 회차 (2026-09-29) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고2 37회",
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
          "Good afternoon, students. This is the head of the counselling department. " +
            "I want to explain how to book a counselling session from next week. " +
            "Until now you came to the door and waited, sometimes for half an hour, " +
            "and often the room was already full when you finally got in. " +
            "From Monday there will be a booking sheet on the wall outside, " +
            "divided into twenty minute slots across the whole week. " +
            "Write only your class and a first name, nothing about the reason. " +
            "Nobody but us will read that sheet, and it is taken down every Friday. " +
            "If every slot is full, write your name at the bottom and we will find a time. " +
            "Thank you for listening.",
        ],
      ],
      choices: [
        "상담 예약 방법을 안내하려고",
        "상담실 이전을 알리려고",
        "진로 검사를 안내하려고",
        "상담 교사를 소개하려고",
        "학부모 상담 주간을 알리려고",
      ],
      answer: 1,
      clue: "From Monday there will be a booking sheet on the wall outside.",
      explanation:
        "남자는 다음 주부터 상담실 앞 예약표에 적어 예약하는 방법을 안내한다. 따라서 답은 ①이다.",
      translation: [
        "M: 학생 여러분, 안녕하세요. 상담부장입니다. 다음 주부터 상담을 예약하는 방법을 설명드립니다. 지금까지는 문 앞에 와서 때로는 30분씩 기다렸고, 막상 들어갈 때는 이미 자리가 차 있는 일이 많았습니다. 월요일부터는 문 밖 벽에 예약표를 붙입니다. 한 주 전체가 20분 단위로 나뉘어 있습니다. 반과 이름만 적고 이유는 적지 마세요. 그 종이는 저희 말고는 아무도 보지 않으며 금요일마다 떼어 냅니다. 자리가 다 찼으면 맨 아래에 이름을 적어 주세요. 저희가 시간을 찾아 드리겠습니다. 들어 주셔서 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 여자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Hyerin, I've decided to study every subject for the same amount of time."],
        ["W", "Two hours each, whatever the subject?"],
        ["M", "Exactly. It feels fair and it's easy to plan."],
        ["W", "Fair to the timetable, maybe. Not to your marks."],
        ["M", "Why should some subjects get more?"],
        ["W", "Because you're already good at two of them."],
        ["M", "Isn't it dangerous to let a strong subject slip?"],
        ["W", "An hour keeps a strong subject where it is. Two hours barely moves it."],
        ["M", "And the weak ones?"],
        ["W", "That's where the same hour is worth three."],
        ["M", "So I should spend by need rather than by fairness."],
        ["W", "Equal time is the most comfortable way to waste an evening."],
      ],
      choices: [
        "과목마다 같은 시간을 써야 한다",
        "약한 과목에 시간을 더 써야 한다",
        "공부 시간을 기록해야 한다",
        "좋아하는 과목부터 해야 한다",
        "공부 계획은 주 단위로 세워야 한다",
      ],
      answer: 2,
      clue: "That's where the same hour is worth three.",
      explanation:
        "여자는 공평하게 나누기보다 약한 과목에 시간을 더 써야 한다고 말한다. 따라서 답은 ②이다.",
      translation: [
        "M: 혜린아, 모든 과목을 똑같은 시간씩 공부하기로 했어.",
        "W: 과목이 뭐든 두 시간씩?",
        "M: 그래. 공평해 보이고 계획 세우기도 쉬워.",
        "W: 시간표에는 공평하겠지. 성적에는 아니야.",
        "M: 왜 어떤 과목만 더 줘야 해?",
        "W: 너는 그중 두 과목은 이미 잘하잖아.",
        "M: 잘하는 과목을 놓치면 위험하지 않아?",
        "W: 잘하는 과목은 한 시간이면 자리를 지켜. 두 시간 써도 거의 안 올라가.",
        "M: 약한 과목은?",
        "W: 거기서는 같은 한 시간이 세 시간 값을 해.",
        "M: 공평함이 아니라 필요에 따라 쓰라는 거구나.",
        "W: 똑같이 나누는 건 저녁을 버리는 가장 편안한 방법이야.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "A promise made to yourself is the easiest one in the world to break, " +
            "because there is nobody in the room when you break it. " +
            "You will run in the morning. You will start the essay on Tuesday. " +
            "No one hears the promise and no one notices the silence afterwards. " +
            "So put one other person into the room. " +
            "Tell a friend the day and the hour, and ask them to ask you about it. " +
            "The work does not get easier, but the silence is gone, " +
            "and most of us keep our word far more carefully in company than alone.",
        ],
      ],
      choices: [
        "계획은 혼자 세워야 한다",
        "목표는 작게 잡아야 한다",
        "아침 시간을 활용해야 한다",
        "다짐은 다른 사람에게 알려야 한다",
        "계획은 자주 점검해야 한다",
      ],
      answer: 4,
      clue: "Tell a friend the day and the hour, and ask them to ask you about it.",
      explanation:
        "남자는 혼자 한 다짐은 깨지기 쉬우니 다른 사람에게 알리라고 말한다. 따라서 답은 ④이다.",
      translation: [
        "M: 자기 자신에게 한 약속은 세상에서 가장 깨기 쉬운 약속입니다. 깨뜨릴 때 그 방에 아무도 없기 때문입니다. 아침에 달리겠다고, 화요일에 글을 시작하겠다고 다짐합니다. 그 약속을 들은 사람도 없고 그 뒤의 침묵을 알아채는 사람도 없습니다. 그러니 그 방에 한 사람을 더 들이세요. 친구에게 날짜와 시각을 말하고 나중에 물어봐 달라고 부탁하세요. 일이 쉬워지지는 않지만 침묵은 사라집니다. 우리 대부분은 혼자일 때보다 누군가와 함께일 때 훨씬 조심스럽게 약속을 지킵니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["W", "Kiyoung, is this the new computer room?"],
        ["M", "Yes, it opened at the start of this term."],
        ["W", "A row of desks runs along the back wall."],
        ["M", "Eight machines, all facing the same way."],
        ["W", "There's a projector hanging from the ceiling."],
        ["M", "The teacher uses it for the whole class."],
        ["W", "A round wall clock hangs on the left wall."],
        ["M", "It's square, actually. The round one broke in June."],
        ["W", "A printer stands on a small table on the right."],
        ["M", "We print the reports there at the end of a lesson."],
        ["W", "And a tall plant stands beside the door."],
        ["M", "Somebody waters it, but nobody admits to it."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "It's square, actually. The round one broke in June.",
      explanation:
        "여자가 둥근 시계라고 하자 남자가 네모라고 바로잡는다. 그림에는 둥근 시계가 그려져 있으므로 답은 ③이다.",
      figure: {
        kind: "figure5",
        spots: [
          [0.5, 0.4],
          [0.5, 0.08],
          [0.08, 0.3],
          [0.86, 0.55],
          [0.26, 0.78],
        ],
        scene:
          "A school computer room drawn as one wide picture, clean black line art on white, no writing or letters or numbers anywhere. " +
          "A ROW OF DESKS with computer monitors runs along the BACK wall, all facing the same way. " +
          "A PROJECTOR hangs from the CEILING in the upper middle of the picture. " +
          "A ROUND WALL CLOCK with a clearly circular face hangs on the LEFT wall. " +
          "A PRINTER stands on a small table on the RIGHT side of the room. " +
          "A TALL POTTED PLANT stands on the floor beside a door at the lower left.",
      },
      translation: [
        "W: 기영아, 여기가 새 컴퓨터실이야?",
        "M: 응, 이번 학기 시작할 때 열었어.",
        "W: 뒷벽을 따라 책상이 한 줄 있네.",
        "M: 여덟 대야. 다 같은 쪽을 보고 있어.",
        "W: 천장에는 영사기가 매달려 있고.",
        "M: 선생님이 반 전체에 보여 줄 때 써.",
        "W: 왼쪽 벽에는 둥근 벽시계가 걸려 있네.",
        "M: 사실 네모야. 둥근 건 6월에 깨졌어.",
        "W: 오른쪽 작은 탁자 위에는 인쇄기가 있어.",
        "M: 수업 끝날 때 보고서를 거기서 뽑아.",
        "W: 그리고 문 옆에 키 큰 화분이 있네.",
        "M: 누가 물을 주는데 아무도 자기라고 안 해.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 남자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Junseo, the club recruitment day is on Thursday."],
        ["M", "Have all the clubs sent in their descriptions?"],
        ["W", "Fourteen of the fifteen. The last one came this morning."],
        ["M", "And the tables in the front hall?"],
        ["W", "Booked, and the caretaker will set them out at eight."],
        ["M", "Then the main things are done."],
        ["W", "Except the map. New students won't know where each club is."],
        ["M", "Didn't we have one last year?"],
        ["W", "The hall has been rearranged since then."],
        ["M", "So every position on it would be wrong."],
        ["W", "And four hundred students come through that door."],
        ["M", "I'll draw the new map this evening."],
      ],
      choices: [
        "동아리 소개를 모으기",
        "탁자를 배치하기",
        "안내 지도를 새로 그리기",
        "신입생에게 알리기",
        "관리인에게 연락하기",
      ],
      answer: 3,
      clue: "I'll draw the new map this evening.",
      explanation:
        "남자는 오늘 저녁에 새 안내 지도를 그리겠다고 말한다. 따라서 답은 ③이다.",
      translation: [
        "W: 준서야, 동아리 모집일이 목요일이야.",
        "M: 동아리 소개는 다 들어왔어?",
        "W: 열다섯 중 열넷. 마지막 하나가 오늘 아침에 왔어.",
        "M: 앞 현관 탁자는?",
        "W: 잡아 놨고 관리인 아저씨가 여덟 시에 놓아 주셔.",
        "M: 그럼 큰 건 다 됐네.",
        "W: 지도만 빼고. 신입생들은 어느 동아리가 어디 있는지 몰라.",
        "M: 작년에 만든 거 없었어?",
        "W: 그 뒤로 현관 배치가 바뀌었어.",
        "M: 그럼 위치가 다 틀리겠네.",
        "W: 그 문으로 400명이 지나가.",
        "M: 오늘 저녁에 새 지도 그릴게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 여자가 지불할 금액을 고르시오.",
      lines: [
        ["M", "Good morning. Are you booking the school bus?"],
        ["W", "Yes, for a club trip on the eighth."],
        ["M", "A twenty-five seat bus is eighty dollars for half a day."],
        ["W", "We'll be thirty, so we need the larger one."],
        ["M", "The forty-five seat bus is a hundred and ten."],
        ["W", "Is that for the whole day or half?"],
        ["M", "Half a day. A full day is forty dollars more."],
        ["W", "We'll need it from nine until six, so a full day."],
        ["M", "Do you want the driver to wait at the site?"],
        ["W", "Yes, please, if there's no extra charge."],
        ["M", "No charge for waiting, and school groups get twenty dollars off."],
        ["W", "Here is the school card, then."],
      ],
      choices: ["$130", "$150", "$110", "$170", "$90"],
      answer: 1,
      clue: "The forty-five seat bus is a hundred and ten.",
      explanation:
        "45인승 하루는 150달러이고 학교 단체 할인 20달러를 빼면 130달러이다. 따라서 답은 ①이다.",
      translation: [
        "M: 안녕하세요. 학교 버스 예약하시나요?",
        "W: 네, 8일 동아리 여행으로요.",
        "M: 25인승은 반나절에 80달러입니다.",
        "W: 저희는 서른 명이라 큰 차가 필요해요.",
        "M: 45인승은 110달러입니다.",
        "W: 그게 하루예요, 반나절이에요?",
        "M: 반나절입니다. 하루면 40달러가 더 붙습니다.",
        "W: 아홉 시부터 여섯 시까지 필요하니 하루로요.",
        "M: 기사가 현장에서 기다리기를 원하시나요?",
        "W: 네, 추가 요금이 없다면요.",
        "M: 대기 요금은 없고 학교 단체는 20달러를 빼 드립니다.",
        "W: 그럼 여기 학교 카드요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 남자가 오늘 체육 수업에 빠지는 이유를 고르시오.",
      lines: [
        ["W", "Dohyun, you're sitting out of the lesson today?"],
        ["M", "The teacher already knows about it."],
        ["W", "Is it your ankle from the match on Saturday?"],
        ["M", "The ankle healed completely last week."],
        ["W", "Then did you forget your gym clothes again?"],
        ["M", "They're in my bag, actually, washed and folded."],
        ["W", "So what is it this time?"],
        ["M", "I gave blood at the health centre this morning."],
        ["W", "And they told you not to run for a day."],
        ["M", "Not to do anything hard for twenty-four hours."],
      ],
      choices: [
        "발목을 다쳐서",
        "체육복을 안 가져와서",
        "아침에 헌혈을 해서",
        "시험공부를 해야 해서",
        "선생님을 만나야 해서",
      ],
      answer: 3,
      clue: "I gave blood at the health centre this morning.",
      explanation:
        "남자는 아침에 헌혈을 해서 하루 동안 무리하지 말라는 말을 들었다고 한다. 따라서 답은 ③이다.",
      translation: [
        "W: 도현아, 오늘 수업 빠지고 앉아 있어?",
        "M: 선생님도 이미 알고 계셔.",
        "W: 토요일 경기 때 다친 발목 때문이야?",
        "M: 발목은 지난주에 다 나았어.",
        "W: 그럼 또 체육복을 안 가져왔어?",
        "M: 빨아서 개어 가방에 있어.",
        "W: 그럼 이번엔 뭔데?",
        "M: 오늘 아침에 보건소에서 헌혈했어.",
        "W: 그래서 하루는 뛰지 말라고 했구나.",
        "M: 스물네 시간 동안 힘든 건 하지 말래.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 교내 사진 동아리 전시에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["W", "Sangmin, when is the photography club's exhibition this year?"],
        ["M", "It opens on the twenty-third and runs for four days."],
        ["W", "That's shorter than last year, isn't it?"],
        ["M", "Two days shorter, because of the exam week."],
        ["W", "Where do you hang the photographs this year?"],
        ["M", "Along the corridor outside the music rooms."],
        ["W", "How many pictures are in it altogether?"],
        ["M", "Sixty, which works out at five from each member."],
        ["W", "Do you have to print them yourselves?"],
        ["M", "The school pays for the printing, and we choose the paper."],
        ["W", "Is there a theme this year, or can you show anything?"],
        ["M", "Anything taken in the last twelve months."],
        ["W", "Then I'll come along on the first day."],
      ],
      choices: ["전시 기간", "전시 장소", "전시 작품 수", "인화 비용을 대는 곳", "관람 시간"],
      answer: 5,
      clue: "It opens on the twenty-third and runs for four days.",
      explanation:
        "기간, 장소, 작품 수, 인화비는 말했지만 관람 시간은 말하지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 상민아, 올해 사진 동아리 전시가 언제야?",
        "M: 23일에 시작해서 나흘 동안 해.",
        "W: 작년보다 짧네.",
        "M: 시험 주간 때문에 이틀 짧아.",
        "W: 올해는 어디에 걸어?",
        "M: 음악실 밖 복도를 따라서.",
        "W: 사진이 다 해서 몇 장이야?",
        "M: 예순 장. 부원마다 다섯 장씩인 셈이야.",
        "W: 인화는 직접 해야 해?",
        "M: 인화비는 학교에서 대 주고 종이는 우리가 골라.",
        "W: 올해 주제가 있어, 아무거나 걸 수 있어?",
        "M: 최근 열두 달 안에 찍은 거면 뭐든 돼.",
        "W: 그럼 첫날에 가 볼게.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Greenfield Sports Centre에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "M",
          "Here is some information about the Greenfield Sports Centre, which reopened in March. " +
            "The centre stands beside the stream on the western edge of the town. " +
            "It is open from six in the morning until ten at night, every day of the week. " +
            "There are two halls, a pool and four outdoor tennis courts. " +
            "A day ticket costs five thousand won, and students pay three thousand. " +
            "The pool closes for cleaning between one and two every afternoon. " +
            "Rackets and balls are lent free of charge at the front desk. " +
            "The outdoor courts must be booked a day in advance in summer.",
        ],
      ],
      choices: [
        "마을 서쪽 끝 개울 옆에 있다",
        "매일 아침 여섯 시에 문을 연다",
        "학생 이용료는 3천 원이다",
        "수영장은 하루 종일 쉬지 않고 운영한다",
        "라켓과 공은 무료로 빌려준다",
      ],
      answer: 4,
      clue: "The pool closes for cleaning between one and two every afternoon.",
      explanation:
        "수영장은 매일 오후 한 시부터 두 시까지 청소로 닫는다고 했으므로 ④가 일치하지 않는다.",
      translation: [
        "M: 3월에 다시 문을 연 그린필드 체육센터에 대해 알려 드립니다. 센터는 마을 서쪽 끝 개울 옆에 있습니다. 매일 아침 여섯 시부터 밤 열 시까지 엽니다. 체육관 두 곳과 수영장, 야외 테니스장 네 면이 있습니다. 하루 이용료는 5천 원이고 학생은 3천 원입니다. 수영장은 매일 오후 한 시부터 두 시까지 청소로 닫습니다. 라켓과 공은 접수대에서 무료로 빌려 드립니다. 여름에는 야외 테니스장을 하루 전에 예약해야 합니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 선택할 봉사 활동을 고르시오.",
      lines: [
        ["W", "Hayoon, five volunteer programmes are still taking students."],
        ["M", "We said we'd decide before the end of the week."],
        ["W", "Then let's do it now. Which days are you free?"],
        ["M", "Saturday mornings only, because of my tutoring."],
        ["W", "Two of these run on Sunday."],
        ["M", "Then they're out. How long does each one last?"],
        ["W", "From two hours up to six."],
        ["M", "Anything over four hours is too much with homework."],
        ["W", "One of the three left runs for six."],
        ["M", "And I'd rather work with people than sort things in a room."],
        ["W", "One of the last two is sorting donated clothes."],
        ["M", "So there's only one programme for us."],
        ["W", "I'll put both our names down tonight."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 2,
      clue: "Saturday mornings only, because of my tutoring.",
      explanation:
        "토요일 오전, 4시간 이하, 사람을 만나는 활동을 고른다. 세 조건을 모두 채우는 것은 ②이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Day: Saturday / Hours: 6 / Work: With people" },
          { no: 2, label: "②", value: "Day: Saturday / Hours: 3 / Work: With people" },
          { no: 3, label: "③", value: "Day: Saturday / Hours: 4 / Work: Sorting clothes" },
          { no: 4, label: "④", value: "Day: Sunday / Hours: 2 / Work: With people" },
          { no: 5, label: "⑤", value: "Day: Sunday / Hours: 4 / Work: Sorting clothes" },
        ],
      },
      translation: [
        "W: 하윤아, 아직 학생을 받는 봉사 활동이 다섯 개 있어.",
        "M: 이번 주 안에 정하기로 했잖아.",
        "W: 그럼 지금 하자. 너는 언제 비어?",
        "M: 과외 때문에 토요일 오전만.",
        "W: 두 개는 일요일이야.",
        "M: 그럼 빠지네. 각각 몇 시간씩 해?",
        "W: 두 시간부터 여섯 시간까지.",
        "M: 숙제까지 하면 네 시간 넘는 건 무리야.",
        "W: 남은 셋 중 하나는 여섯 시간이야.",
        "M: 그리고 방에서 물건 정리하는 것보다 사람을 만나는 게 좋아.",
        "W: 남은 둘 중 하나는 기증 옷 정리야.",
        "M: 그럼 우리한테 맞는 건 하나뿐이네.",
        "W: 오늘 밤에 둘 다 이름 적을게.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Taemin, did you collect the survey sheets?"],
        ["M", "Two classes gave them back, but not the third."],
        ["W", "We need all three before the meeting."],
        ["M", "Their homeroom finishes at three ten."],
        ["W", "Could you wait outside and collect them?"],
      ],
      choices: [
        "The survey was cancelled.",
        "I lost all the sheets.",
        "Two classes are enough.",
        "The meeting is next week.",
        "Sure, I'll be there at three ten.",
      ],
      answer: 5,
      clue: "Could you wait outside and collect them?",
      explanation:
        "밖에서 기다렸다 걷어 달라고 했으므로, 3시 10분에 가겠다는 ⑤가 가장 자연스럽다.",
      translation: [
        "W: 태민아, 설문지 다 걷었어?",
        "M: 두 반은 돌려줬는데 세 번째 반은 아직이야.",
        "W: 회의 전에 세 반 다 있어야 해.",
        "M: 그 반 조회가 3시 10분에 끝나.",
        "W: 밖에서 기다렸다가 걷어 올래?",
        "M: 그래, 3시 10분에 가 있을게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Naeun, is the music room free during lunch?"],
        ["W", "The choir practises there until twelve forty."],
        ["M", "I only need fifteen minutes with the piano."],
        ["W", "Then you could go in after them."],
        ["M", "Do I need to ask anyone first?"],
      ],
      choices: [
        "The piano is broken.",
        "I don't play the piano.",
        "The room is always locked.",
        "Just tell the music teacher.",
        "Lunch ends at twelve.",
      ],
      answer: 4,
      clue: "Do I need to ask anyone first?",
      explanation:
        "먼저 누구에게 말해야 하는지 물었으므로, 음악 선생님께 말하라는 ④가 가장 자연스럽다.",
      translation: [
        "M: 나은아, 점심시간에 음악실 비어?",
        "W: 합창단이 12시 40분까지 연습해.",
        "M: 나는 피아노로 15분만 있으면 돼.",
        "W: 그럼 그다음에 들어가면 되겠다.",
        "M: 누구한테 먼저 말해야 해?",
        "W: 음악 선생님께만 말씀드리면 돼.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Chaewon, how is your English vocabulary going?"],
        ["M", "I learn thirty words a night and forget most of them."],
        ["W", "How do you learn them exactly?"],
        ["M", "I read the list from the top until I can say it."],
        ["W", "In the same order every time?"],
        ["M", "Always. That's how the list is printed."],
        ["W", "Then you're learning the order, not the words."],
        ["M", "I did notice that I know which word comes next."],
        ["W", "That's the order talking, not your memory of the word."],
        ["M", "So what should I change about it?"],
        ["W", "Cut the list into cards and shuffle them each night."],
      ],
      choices: [
        "I don't learn any words.",
        "That's a simple fix, I'll try it.",
        "The order is the best part.",
        "I already know every word.",
        "You should make the list.",
      ],
      answer: 2,
      clue: "Cut the list into cards and shuffle them each night.",
      explanation:
        "목록을 카드로 잘라 매일 섞으라는 제안이므로, 해 보겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 채원아, 영어 단어는 어떻게 돼 가?",
        "M: 밤마다 서른 개 외우는데 대부분 잊어버려.",
        "W: 정확히 어떻게 외우는데?",
        "M: 목록을 위에서부터 읽으면서 말할 수 있을 때까지 해.",
        "W: 매번 같은 순서로?",
        "M: 늘. 목록이 그렇게 인쇄돼 있으니까.",
        "W: 그럼 단어가 아니라 순서를 외우는 거야.",
        "M: 다음에 어떤 단어가 오는지는 안다는 걸 느끼긴 했어.",
        "W: 그건 순서가 말해 주는 거지 네가 단어를 기억하는 게 아니야.",
        "M: 그럼 뭘 바꿔야 해?",
        "W: 목록을 카드로 잘라서 밤마다 섞어.",
        "M: 간단한 해결이네, 해 볼게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Seoyun, you've been helping at the local museum."],
        ["W", "Every other Sunday, at the front desk."],
        ["M", "What do you actually do there?"],
        ["W", "I hand out maps and answer the same six questions."],
        ["M", "Does that not get dull after a few months?"],
        ["W", "It did, until I started asking visitors where they came from."],
        ["M", "And what happened then?"],
        ["W", "The same six questions turned into a hundred conversations."],
        ["M", "That sounds like a better afternoon."],
        ["W", "It is, and the time goes twice as fast."],
        ["M", "Could I join you one Sunday?"],
      ],
      choices: [
        "Of course, the next one is the nineteenth.",
        "I stopped going in July.",
        "The museum has closed.",
        "You can't talk to visitors.",
        "I work every Saturday now.",
      ],
      answer: 1,
      clue: "Could I join you one Sunday?",
      explanation:
        "남자가 일요일에 같이 가도 되는지 물었으므로, 다음이 19일이라는 ①이 가장 자연스럽다.",
      translation: [
        "M: 서윤아, 동네 박물관에서 돕고 있다며.",
        "W: 두 주에 한 번 일요일에 접수대에서.",
        "M: 거기서 실제로 뭘 해?",
        "W: 안내도를 나눠 주고 늘 같은 여섯 가지 질문에 답해.",
        "M: 몇 달 하면 지루하지 않아?",
        "W: 지루했는데 손님들한테 어디서 오셨는지 묻기 시작하면서 달라졌어.",
        "M: 그러니까 어떻게 됐어?",
        "W: 같은 여섯 질문이 백 가지 대화가 됐어.",
        "M: 오후가 훨씬 낫겠다.",
        "W: 맞아. 시간이 두 배로 빨리 가.",
        "M: 나도 일요일에 한 번 같이 가도 돼?",
        "W: 그럼, 다음이 19일이야.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Dain이 Junhyuk에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Dain : ________________",
      lines: [
        [
          "W",
          "Dain and Junhyuk are preparing the class display for parents' evening. " +
            "They have to put up thirty pieces of student work on the back wall. " +
            "Junhyuk has started sticking them straight onto the painted wall with strong tape. " +
            "Dain knows that the same tape pulled the paint off last year, " +
            "and the class was charged for repainting the whole wall. " +
            "There is a roll of low-tack tape in the cupboard for exactly this. " +
            "She wants him to stop and use the other tape instead. " +
            "In this situation, what would Dain most likely say to Junhyuk?",
        ],
      ],
      choices: [
        "Let's put the work on the windows.",
        "We should use fewer pieces of work.",
        "Stop, that tape takes the paint off.",
        "I'll paint the wall again myself.",
        "Parents' evening was cancelled.",
      ],
      answer: 3,
      clue: "She wants him to stop and use the other tape instead.",
      explanation:
        "그 테이프가 페인트를 벗겨 내므로 멈추고 다른 테이프를 쓰라는 ③이 가장 적절하다.",
      translation: [
        "W: 다인이와 준혁이는 학부모의 밤에 쓸 학급 전시를 준비하고 있습니다. 두 사람은 뒷벽에 학생 작품 서른 점을 붙여야 합니다. 준혁이는 강한 테이프로 칠해진 벽에 바로 붙이기 시작했습니다. 다인이는 작년에 같은 테이프가 페인트를 뜯어냈고 반이 벽 전체를 다시 칠하는 비용을 물었던 것을 압니다. 바로 이럴 때 쓰라고 장에 접착력이 약한 테이프가 한 통 있습니다. 다인이는 준혁이가 멈추고 그 테이프를 쓰기를 바랍니다. 이런 상황에서 다인이가 준혁이에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 여자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "Hello, everyone. Today I want to explain why a kettle sings before it boils " +
            "and falls quiet at the boil itself. " +
            "Long before the whole pot is hot, the metal at the bottom is already past boiling point. " +
            "Tiny bubbles of steam form there and rise a millimetre into the cooler water above, " +
            "where they collapse almost instantly. " +
            "Each collapse is a small shock, and thousands of them every second " +
            "make the high hiss we hear. " +
            "As the upper water warms, the bubbles survive a little longer, " +
            "so the sound falls in pitch. " +
            "At a full boil the bubbles reach the surface without collapsing at all, " +
            "and the noise drops to a gentle rolling sound.",
        ],
      ],
      choices: [
        "how a kettle heats water evenly",
        "why a kettle is loudest just before boiling",
        "how steam is used to drive machines",
        "why hot water cools faster than cold",
        "how bubbles form in fizzy drinks",
      ],
      answer: 2,
      clue: "Each collapse is a small shock, and thousands of them every second make the high hiss we hear.",
      explanation:
        "여자는 아래에서 생긴 기포가 위쪽 찬물에서 터지며 소리가 나고, 끓으면 터지지 않아 조용해진다고 설명한다. 따라서 답은 ②이다.",
      translation: [
        "W: 안녕하세요, 여러분. 오늘은 주전자가 끓기 직전에 왜 소리를 내고 막상 끓을 때는 왜 조용해지는지 설명하려 합니다. 물 전체가 뜨거워지기 훨씬 전에 바닥의 금속은 이미 끓는점을 넘어섭니다. 거기서 아주 작은 수증기 방울이 생겨 위쪽 찬물로 1밀리미터쯤 올라가는데, 거의 곧바로 꺼집니다. 그 꺼짐 하나하나가 작은 충격이고, 1초에 수천 번 일어나면 우리가 듣는 높은 쉿 소리가 됩니다. 위쪽 물이 데워질수록 기포가 조금 더 오래 살아남아 소리가 낮아집니다. 완전히 끓으면 기포가 꺼지지 않고 수면까지 올라와, 소리는 부드럽게 구르는 소리로 잦아듭니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 내용이 아닌 것은?",
      lines: [
        ["W", "Today I want to explain why a kettle sings before it boils."],
        ["W", "The metal at the bottom is already past boiling point."],
        ["W", "Tiny bubbles rise into the cooler water above, where they collapse."],
        ["W", "As the upper water warms, the sound falls in pitch."],
        ["W", "At a full boil the bubbles reach the surface without collapsing."],
      ],
      choices: [
        "the metal at the bottom passing boiling point",
        "bubbles collapsing in the cooler water above",
        "the sound falling in pitch as the water warms",
        "bubbles reaching the surface at a full boil",
        "the amount of electricity a kettle uses",
      ],
      answer: 5,
      clue: "The metal at the bottom is already past boiling point.",
      explanation:
        "끓는점을 넘은 바닥 금속, 위쪽 찬물에서 꺼지는 기포, 낮아지는 소리, 수면까지 올라오는 기포는 언급되지만 주전자가 쓰는 전기의 양은 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
