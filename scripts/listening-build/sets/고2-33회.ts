/** 고2 듣기 33회 — 사람이 직접 쓴 회차 (2026-09-29) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고2 33회",
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
          "Good afternoon, students. This is Mr. Ryu from the second year office. " +
            "I am speaking about the class trip that takes place next month. " +
            "Many of you have asked what to bring and what to leave at home, " +
            "so the answer is now printed on one sheet at the back of each classroom. " +
            "Read it before you pack, not on the morning of the trip. " +
            "The sheet also lists what the school provides, " +
            "which is far more than students usually expect. " +
            "If your family cannot buy something on that list, come and speak to me privately. " +
            "No student has ever been left out of a trip for that reason, " +
            "and no student will be this year either. Thank you.",
        ],
      ],
      choices: [
        "수학여행 준비물 안내문을 확인하라고 하려고",
        "수학여행 일정 변경을 알리려고",
        "여행 경비 납부를 독촉하려고",
        "안전 교육 참석을 당부하려고",
        "여행 장소를 소개하려고",
      ],
      answer: 1,
      clue: "Read it before you pack, not on the morning of the trip.",
      explanation:
        "남자는 준비물이 적힌 안내문이 교실 뒤에 붙어 있으니 짐 싸기 전에 읽으라고 안내한다. 따라서 답은 ①이다.",
      translation: [
        "M: 학생 여러분, 안녕하세요. 2학년 교무실 류 선생님입니다. 다음 달에 있을 수학여행에 대해 말씀드립니다. 무엇을 가져오고 무엇을 두고 와야 하는지 묻는 학생이 많아, 그 답을 한 장에 정리해 각 교실 뒤에 붙여 두었습니다. 여행 가는 날 아침이 아니라 짐을 싸기 전에 읽으세요. 그 종이에는 학교가 준비하는 것도 적혀 있는데, 학생들이 흔히 생각하는 것보다 훨씬 많습니다. 목록에 있는 것을 마련하기 어려운 가정이 있으면 저에게 조용히 말해 주세요. 그런 이유로 여행에서 빠진 학생은 지금까지 없었고, 올해도 없을 것입니다. 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 여자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Dohyun, I've decided to drop history and keep only science subjects."],
        ["W", "Because of the marks, or because of the subject?"],
        ["M", "The marks, mostly. History pulls my average down."],
        ["W", "How many hours a week do you spend on it?"],
        ["M", "Two, and I spend most of that reading the notes twice."],
        ["W", "So you've never really studied it, only revisited it."],
        ["M", "Is there a difference at this stage?"],
        ["W", "A large one. You're deciding about a subject you haven't tried."],
        ["M", "I'd rather spend those hours where I'm already strong."],
        ["W", "Then give it four weeks of real work first, and decide after."],
        ["M", "And if it's still my worst subject in four weeks?"],
        ["W", "Then you'll be dropping it for a reason instead of a guess."],
      ],
      choices: [
        "과목 선택은 성적으로 정해야 한다",
        "제대로 해 보고 나서 과목을 정해야 한다",
        "잘하는 과목에 집중해야 한다",
        "선생님과 상담해야 한다",
        "과목 수를 줄여야 한다",
      ],
      answer: 2,
      clue: "Then give it four weeks of real work first, and decide after.",
      explanation:
        "여자는 제대로 해 본 적이 없다며 네 주 동안 진짜로 해 보고 정하라고 말한다. 따라서 답은 ②이다.",
      translation: [
        "M: 도현아, 역사를 빼고 과학 과목만 하기로 했어.",
        "W: 성적 때문이야, 과목 자체가 안 맞아서야?",
        "M: 주로 성적. 역사가 평균을 깎아.",
        "W: 일주일에 몇 시간 쓰는데?",
        "M: 두 시간. 그중 대부분은 필기를 두 번 읽는 데 써.",
        "W: 그럼 공부한 게 아니라 다시 본 것뿐이네.",
        "M: 이 시점에 그게 차이가 있어?",
        "W: 크지. 해 보지도 않은 과목을 두고 정하는 거잖아.",
        "M: 이미 잘하는 데 그 시간을 쓰는 게 낫지 않아?",
        "W: 그럼 먼저 네 주만 제대로 해 보고 그다음에 정해.",
        "M: 네 주 뒤에도 제일 못하는 과목이면?",
        "W: 그럼 짐작이 아니라 근거를 가지고 빼는 거지.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "When a plan fails, we look for the person who failed. " +
            "It is a quick answer and almost always the wrong one. " +
            "If the same mistake happens to four different people in a year, " +
            "you are not looking at four careless people. " +
            "You are looking at a system that makes the mistake easy to make. " +
            "Ask what the room, the form or the timetable allowed to happen. " +
            "Blaming a person ends the conversation and changes nothing. " +
            "Changing the arrangement means the next person cannot make the mistake at all.",
        ],
      ],
      choices: [
        "실수한 사람을 분명히 가려야 한다",
        "같은 실수가 반복되면 방식을 바꿔야 한다",
        "계획은 여러 개 세워야 한다",
        "실수를 기록해 두어야 한다",
        "책임은 나누어 져야 한다",
      ],
      answer: 2,
      clue: "You are looking at a system that makes the mistake easy to make.",
      explanation:
        "남자는 같은 실수가 되풀이되면 사람 탓이 아니라 방식을 바꾸어야 한다고 말한다. 따라서 답은 ②이다.",
      translation: [
        "M: 계획이 어그러지면 우리는 잘못한 사람을 찾습니다. 빠른 답이지만 거의 언제나 틀린 답입니다. 같은 실수가 한 해에 네 사람에게 일어났다면, 그것은 부주의한 네 사람이 아닙니다. 그 실수를 하기 쉽게 만들어 둔 구조를 보고 있는 것입니다. 그 방, 그 서식, 그 일정표가 무엇을 허용했는지 물으세요. 사람을 탓하면 대화가 끝나고 아무것도 달라지지 않습니다. 배치를 바꾸면 다음 사람은 그 실수를 아예 할 수 없게 됩니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["W", "Sangmin, is this the broadcasting room after the rebuild?"],
        ["M", "Yes, we started using it again in September."],
        ["W", "A wide mixing desk stands under the window."],
        ["M", "Everything runs through it, even the lunch announcements."],
        ["W", "There's a round wall clock on the left wall."],
        ["M", "We time every programme by that one."],
        ["W", "Two microphones stand on the desk."],
        ["M", "Three, actually. The third one is behind the screen."],
        ["W", "A tall cabinet stands in the right corner."],
        ["M", "All the old recordings are kept in there."],
        ["W", "And a square poster hangs above the door."],
        ["M", "Last year's club members made it."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "Three, actually. The third one is behind the screen.",
      explanation:
        "여자가 마이크가 두 개라고 하자 남자가 세 개라고 바로잡는다. 그림에는 두 개가 그려져 있으므로 답은 ③이다.",
      figure: {
        kind: "figure5",
        spots: [
          [0.5, 0.62],
          [0.09, 0.22],
          [0.42, 0.34],
          [0.88, 0.45],
          [0.6, 0.08],
        ],
        scene:
          "A school broadcasting room drawn as one wide picture, clean black line art on white, no writing or letters or numbers anywhere. " +
          "A WIDE MIXING DESK covered in knobs and sliders stands under a window in the MIDDLE of the room. " +
          "A ROUND WALL CLOCK hangs high on the LEFT wall. " +
          "EXACTLY TWO MICROPHONES on stands rise from the top of the mixing desk, " +
          "clearly separated with a gap between them so both can be counted. " +
          "A TALL CABINET with closed doors stands in the RIGHT corner. " +
          "A SQUARE POSTER hangs on the BACK wall above a door.",
      },
      translation: [
        "W: 상민아, 여기가 새로 고친 방송실이야?",
        "M: 응, 9월부터 다시 쓰기 시작했어.",
        "W: 창문 아래에 넓은 조정대가 있네.",
        "M: 점심 방송까지 다 저기를 거쳐.",
        "W: 왼쪽 벽에는 둥근 시계가 있고.",
        "M: 방송 시간은 저걸로 다 재.",
        "W: 조정대 위에 마이크가 두 개 있네.",
        "M: 사실 세 개야. 세 번째는 가림막 뒤에 있어.",
        "W: 오른쪽 구석에는 키 큰 장이 있어.",
        "M: 예전 녹음은 다 거기 보관해.",
        "W: 그리고 문 위에는 네모난 포스터가 걸려 있네.",
        "M: 작년 부원들이 만든 거야.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 여자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Nayeon, the school open lecture is next Tuesday evening."],
        ["W", "Has the speaker confirmed the time?"],
        ["M", "Seven o'clock, and she arrives half an hour early."],
        ["W", "What about the hall and the microphone?"],
        ["M", "Both booked, and the sound was tested on Monday."],
        ["W", "Then the last thing is the notice for parents."],
        ["M", "The office wants it sent tonight."],
        ["W", "Does it go by message or on paper?"],
        ["M", "By message, but somebody has to write it first."],
        ["W", "How long should the message be?"],
        ["M", "Short. The date, the time, the place and one line about the speaker."],
        ["W", "I'll write the notice and send it this evening."],
      ],
      choices: [
        "강당을 예약하기",
        "마이크를 점검하기",
        "학부모 안내문을 써서 보내기",
        "강사에게 연락하기",
        "포스터를 붙이기",
      ],
      answer: 3,
      clue: "I'll write the notice and send it this evening.",
      explanation:
        "여자는 오늘 저녁에 학부모 안내문을 써서 보내겠다고 말한다. 따라서 답은 ③이다.",
      translation: [
        "M: 나연아, 학교 공개 강연이 다음 주 화요일 저녁이야.",
        "W: 강사분 시간은 확정됐어?",
        "M: 일곱 시. 30분 일찍 오신대.",
        "W: 강당이랑 마이크는?",
        "M: 둘 다 잡아 놨고 소리는 월요일에 확인했어.",
        "W: 그럼 남은 건 학부모 안내문이네.",
        "M: 행정실에서 오늘 밤에 보내 달래.",
        "W: 문자로 보내, 종이로 보내?",
        "M: 문자로. 근데 누가 먼저 써야 해.",
        "W: 얼마나 길게 써야 해?",
        "M: 짧게. 날짜, 시각, 장소, 강사 소개 한 줄.",
        "W: 내가 안내문 써서 오늘 저녁에 보낼게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 남자가 지불할 금액을 고르시오.",
      lines: [
        ["W", "Hello. Are you here to rent instruments for a concert?"],
        ["M", "Yes, our school band needs a few things for Saturday."],
        ["W", "Let me see what we have free that day."],
        ["M", "We mainly need something to play chords on."],
        ["W", "A keyboard is twenty dollars for the whole day."],
        ["M", "We'll take one keyboard, please."],
        ["W", "And an amplifier is fifteen dollars each."],
        ["M", "Two amplifiers, then, one for each side of the stage."],
        ["W", "Do you need cables as well?"],
        ["M", "We brought our own set from school this morning."],
        ["W", "Delivery to the school hall is ten dollars."],
        ["M", "We'll collect everything ourselves instead."],
        ["W", "In that case, school groups get five dollars off the total."],
        ["M", "That helps a lot. Here is the club card, then."],
      ],
      choices: ["$45", "$50", "$55", "$60", "$40"],
      answer: 1,
      clue: "A keyboard is twenty dollars for the whole day.",
      explanation:
        "건반 20달러와 앰프 두 대 30달러를 더하면 50달러이고, 학교 단체 할인 5달러를 빼면 45달러이다. 따라서 답은 ①이다.",
      translation: [
        "W: 안녕하세요. 공연 때문에 악기 빌리러 오셨나요?",
        "M: 네, 저희 학교 밴드가 토요일에 쓸 게 몇 가지 필요해요.",
        "W: 그날 비는 게 뭐가 있는지 볼게요.",
        "M: 주로 화음을 칠 악기가 필요해요.",
        "W: 건반은 하루 종일 20달러입니다.",
        "M: 건반 한 대 주세요.",
        "W: 앰프는 한 대에 15달러입니다.",
        "M: 그럼 앰프 두 대요. 무대 양쪽에 하나씩.",
        "W: 선도 필요하신가요?",
        "M: 오늘 아침에 학교에서 저희 것을 가져왔어요.",
        "W: 학교 강당까지 배달은 10달러입니다.",
        "M: 저희가 직접 가지러 올게요.",
        "W: 그러시면 학교 단체는 전체에서 5달러를 빼 드립니다.",
        "M: 큰 도움이 되네요. 그럼 여기 동아리 카드요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 남자가 자전거를 팔려는 이유를 고르시오.",
      lines: [
        ["W", "Jiwoo, I heard you're selling your bicycle."],
        ["M", "I put a notice on the board this morning."],
        ["W", "Is something wrong with it?"],
        ["M", "Nothing at all. It was serviced in August."],
        ["W", "Then are you saving up for something else?"],
        ["M", "No, my family is moving next month."],
        ["W", "Moving far from here?"],
        ["M", "To a flat with no storage room at all."],
        ["W", "So there would be nowhere to keep it."],
        ["M", "Exactly, and leaving it outside all winter would ruin it."],
      ],
      choices: [
        "자전거가 고장 나서",
        "다른 것을 사려고 돈을 모으려고",
        "이사 갈 집에 둘 곳이 없어서",
        "자전거를 타지 않게 되어서",
        "더 큰 자전거를 사려고",
      ],
      answer: 3,
      clue: "To a flat with no storage room at all.",
      explanation:
        "남자는 이사 갈 집에 자전거를 둘 곳이 없어서 판다고 말한다. 따라서 답은 ③이다.",
      translation: [
        "W: 지우야, 자전거 판다며.",
        "M: 오늘 아침에 게시판에 글 붙였어.",
        "W: 어디 고장 났어?",
        "M: 전혀. 8월에 정비했어.",
        "W: 그럼 다른 거 사려고 돈 모아?",
        "M: 아니, 다음 달에 우리 가족이 이사 가.",
        "W: 여기서 멀리 가?",
        "M: 창고가 아예 없는 아파트로 가.",
        "W: 그럼 둘 데가 없겠네.",
        "M: 맞아. 겨울 내내 밖에 두면 망가져.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 교내 수학 경시대회에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["M", "Seoyun, are you entering the maths competition this year?"],
        ["W", "I signed up last week, but I don't know much about it yet."],
        ["M", "It's held on the fifteenth, in the fourth and fifth periods."],
        ["W", "That's a Wednesday, isn't it? Where do we sit for it?"],
        ["M", "In the three classrooms on the third floor."],
        ["W", "So they split us by class number, I suppose."],
        ["M", "By class number, yes, and the lists go up the day before."],
        ["W", "How many questions are there altogether?"],
        ["M", "Twenty, and the last five of them are worth double."],
        ["W", "Can we use a calculator for the long ones?"],
        ["M", "No calculators, but you may use the formula sheet they give out."],
        ["W", "And how long do we have in total?"],
        ["M", "Ninety minutes, with no break at all in the middle."],
      ],
      choices: ["대회 날짜와 교시", "시험을 보는 곳", "문항 수", "계산기 사용 여부", "상을 주는 방법"],
      answer: 5,
      clue: "It's held on the fifteenth, in the fourth and fifth periods.",
      explanation:
        "날짜와 교시, 장소, 문항 수, 계산기는 말했지만 상에 대해서는 말하지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 서윤아, 올해 수학 경시대회 나가?",
        "W: 지난주에 신청은 했는데 아직 잘 몰라.",
        "M: 15일 4교시와 5교시에 해.",
        "W: 수요일이네. 어디서 봐?",
        "M: 3층 교실 세 곳에서.",
        "W: 그럼 반 번호로 나누는 거야?",
        "M: 반 번호로 나눠. 명단은 전날 붙어.",
        "W: 문제는 다 해서 몇 개야?",
        "M: 스무 개. 마지막 다섯 개는 배점이 두 배야.",
        "W: 긴 문제는 계산기 써도 돼?",
        "M: 계산기는 안 되고 나눠 주는 공식표는 써도 돼.",
        "W: 전체 시간은 얼마야?",
        "M: 90분. 중간에 쉬는 시간은 아예 없어.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Willow Park Ice Rink에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "W",
          "Here is some information about the Willow Park Ice Rink, which opens in December. " +
            "The rink is set up in the open square at the north end of Willow Park. " +
            "It is open every day from noon until nine in the evening. " +
            "A one hour session costs five thousand won, and skates are included in that price. " +
            "Helmets are lent free of charge to anyone under sixteen. " +
            "Sessions begin on the hour, and the ice is cleaned between them. " +
            "You may buy a ticket at the gate, but weekend sessions often sell out by noon. " +
            "The rink closes for the season at the end of February.",
        ],
      ],
      choices: [
        "윌로우 공원 북쪽 광장에 설치된다",
        "매일 정오부터 저녁 아홉 시까지 연다",
        "이용료에 스케이트 대여가 포함된다",
        "헬멧은 따로 돈을 내야 한다",
        "2월 말에 운영을 마친다",
      ],
      answer: 4,
      clue: "Helmets are lent free of charge to anyone under sixteen.",
      explanation:
        "열여섯 살 미만에게는 헬멧을 무료로 빌려준다고 했으므로 ④가 일치하지 않는다.",
      translation: [
        "W: 12월에 문을 여는 윌로우 공원 빙상장에 대해 알려 드립니다. 빙상장은 윌로우 공원 북쪽 끝 열린 광장에 설치됩니다. 매일 정오부터 저녁 아홉 시까지 엽니다. 한 시간 이용료는 5천 원이고 그 값에 스케이트 대여가 포함됩니다. 열여섯 살 미만에게는 헬멧을 무료로 빌려 드립니다. 이용은 정시에 시작하고 그 사이에 얼음을 정비합니다. 표는 입구에서 살 수 있지만 주말에는 정오면 매진되는 일이 많습니다. 빙상장은 2월 말에 운영을 마칩니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 여자가 신청할 온라인 강좌를 고르시오.",
      lines: [
        ["M", "Chaeyeon, these five online courses start in November."],
        ["W", "I've been waiting for this list since the summer."],
        ["M", "Then let's narrow it down. How long can each session be?"],
        ["W", "An hour at most. Anything longer and I stop watching."],
        ["M", "Two of these run for ninety minutes."],
        ["W", "Then those are out. Do any of them give feedback on work?"],
        ["M", "Only two of the three left mark your assignments."],
        ["W", "Feedback is the whole point for me."],
        ["M", "And the fee?"],
        ["W", "Under sixty thousand won, if possible."],
        ["M", "One of the last two is seventy-five thousand."],
        ["W", "So there's only one course left for me."],
        ["M", "I'd register tonight, before the list closes."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "An hour at most. Anything longer and I stop watching.",
      explanation:
        "한 시간 이하, 과제 첨삭이 있는 것, 6만 원 미만인 강좌를 고른다. 세 조건을 모두 채우는 것은 ④이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Session: 90 min / Feedback: Yes / Fee: 50,000 won" },
          { no: 2, label: "②", value: "Session: 90 min / Feedback: No / Fee: 40,000 won" },
          { no: 3, label: "③", value: "Session: 60 min / Feedback: No / Fee: 45,000 won" },
          { no: 4, label: "④", value: "Session: 50 min / Feedback: Yes / Fee: 58,000 won" },
          { no: 5, label: "⑤", value: "Session: 60 min / Feedback: Yes / Fee: 75,000 won" },
        ],
      },
      translation: [
        "M: 채연아, 11월에 시작하는 온라인 강좌 다섯 개야.",
        "W: 여름부터 이 목록 기다렸어.",
        "M: 그럼 줄여 보자. 한 회에 몇 분까지 괜찮아?",
        "W: 길어야 한 시간. 그보다 길면 보다가 그만둬.",
        "M: 두 개는 아흔 분짜리야.",
        "W: 그럼 그건 빠져. 과제를 봐 주는 데는 있어?",
        "M: 남은 셋 중 둘만 과제를 채점해 줘.",
        "W: 나한테는 첨삭이 제일 중요해.",
        "M: 수강료는?",
        "W: 가능하면 6만 원 아래로.",
        "M: 남은 둘 중 하나는 7만 5천 원이야.",
        "W: 그럼 나한테 남는 건 하나뿐이네.",
        "M: 목록 닫히기 전에 오늘 밤에 등록하는 게 좋겠어.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Hayoon, is the club room free after five?"],
        ["W", "The drama club uses it until five thirty."],
        ["M", "We need it for a rehearsal tonight."],
        ["W", "You could start at six instead."],
        ["M", "Would you tell the others for me?"],
      ],
      choices: [
        "The room is never free.",
        "Sure, I'll message them now.",
        "I don't know the others.",
        "You should rehearse tomorrow.",
        "The drama club left already.",
      ],
      answer: 2,
      clue: "Would you tell the others for me?",
      explanation:
        "다른 부원들에게 알려 달라고 했으므로, 지금 알리겠다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 하윤아, 다섯 시 지나면 동아리방 비어?",
        "W: 연극 동아리가 5시 30분까지 써.",
        "M: 오늘 밤에 연습하러 써야 하는데.",
        "W: 대신 여섯 시에 시작하면 되잖아.",
        "M: 다른 애들한테 대신 말해 줄래?",
        "W: 그럼, 지금 알릴게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Junseo, did you get the science lab key?"],
        ["M", "Not yet. The teacher was in a meeting."],
        ["W", "Our experiment starts at four."],
        ["M", "The meeting ends at three forty, I heard."],
        ["W", "Could you wait outside and ask her then?"],
      ],
      choices: [
        "The lab is already open.",
        "All right, I'll wait by the door.",
        "I don't need the key.",
        "The experiment is finished.",
        "She never has meetings.",
      ],
      answer: 2,
      clue: "Could you wait outside and ask her then?",
      explanation:
        "회의가 끝날 때 밖에서 기다렸다 여쭈라고 했으므로, 문 앞에서 기다리겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 준서야, 과학실 열쇠 받았어?",
        "M: 아직. 선생님이 회의 중이셨어.",
        "W: 우리 실험이 네 시에 시작해.",
        "M: 회의가 3시 40분에 끝난다고 들었어.",
        "W: 밖에서 기다렸다가 그때 여쭤볼래?",
        "M: 알겠어, 문 앞에서 기다릴게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Taeyang, how is the volunteer tutoring going?"],
        ["M", "The children come, but they've stopped doing the homework."],
        ["W", "How much do you give them each week?"],
        ["M", "Twenty questions, the same as at the start."],
        ["W", "And how much were they finishing in September?"],
        ["M", "All twenty, at first. Now maybe five."],
        ["W", "What changed between September and now?"],
        ["M", "Nothing that I did. The questions got harder as we moved on."],
        ["W", "So the amount stayed while the difficulty grew."],
        ["M", "I never thought of it as two separate things."],
        ["W", "Try ten harder questions instead of twenty."],
      ],
      choices: [
        "The children stopped coming.",
        "That makes sense, I'll cut it to ten.",
        "Twenty is not enough for them.",
        "I don't give any homework.",
        "You should teach them instead.",
      ],
      answer: 2,
      clue: "Try ten harder questions instead of twenty.",
      explanation:
        "스무 문제 대신 어려운 열 문제를 내라는 제안이므로, 열 개로 줄이겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 태양아, 봉사로 하는 공부 도우미는 어때?",
        "M: 아이들은 오는데 숙제를 안 해 와.",
        "W: 일주일에 얼마나 내 줘?",
        "M: 스무 문제. 처음이랑 똑같이.",
        "W: 9월에는 얼마나 해 왔는데?",
        "M: 처음엔 스무 개 다. 지금은 다섯 개쯤.",
        "W: 9월이랑 지금 사이에 뭐가 달라졌어?",
        "M: 내가 바꾼 건 없어. 진도가 나가면서 문제가 어려워졌지.",
        "W: 그러니까 양은 그대로인데 난도만 올라간 거네.",
        "M: 그 둘을 따로 생각해 본 적이 없어.",
        "W: 스무 개 대신 어려운 열 개를 내 봐.",
        "M: 말 되네, 열 개로 줄일게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Suyeon, you've been learning sign language on Saturdays."],
        ["W", "Since April, at the community centre."],
        ["M", "What made you start that of all things?"],
        ["W", "A deaf customer came into my aunt's shop and nobody could help."],
        ["M", "How far have you got in six months?"],
        ["W", "I can hold a slow conversation about everyday things."],
        ["M", "That sounds faster than I would have expected."],
        ["W", "It's easier than people think, and much harder to keep up."],
        ["M", "Do you practise between the lessons?"],
        ["W", "Twenty minutes most evenings, with a video."],
        ["M", "Could I come to one of your classes?"],
      ],
      choices: [
        "Of course, come this Saturday.",
        "I stopped going in June.",
        "The centre has no classes.",
        "You can't learn that.",
        "I only practise alone.",
      ],
      answer: 1,
      clue: "Could I come to one of your classes?",
      explanation:
        "남자가 수업에 가 봐도 되는지 물었으므로, 이번 토요일에 오라는 ①이 가장 자연스럽다.",
      translation: [
        "M: 수연아, 토요일마다 수어를 배운다며.",
        "W: 4월부터 주민 센터에서.",
        "M: 하필 그걸 시작한 계기가 뭐야?",
        "W: 이모 가게에 청각 장애인 손님이 왔는데 아무도 못 도왔어.",
        "M: 여섯 달 만에 어디까지 왔어?",
        "W: 일상적인 이야기는 천천히 주고받을 수 있어.",
        "M: 생각보다 빠르다.",
        "W: 사람들 생각보다 쉬운데 이어 가기는 훨씬 어려워.",
        "M: 수업 사이에도 연습해?",
        "W: 거의 저녁마다 20분씩 영상 보면서.",
        "M: 나도 네 수업에 한 번 가 봐도 돼?",
        "W: 그럼, 이번 토요일에 와.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Minjun이 Hyerin에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Minjun : ________________",
      lines: [
        [
          "M",
          "Minjun and Hyerin are on the organising team for the school festival. " +
            "They have to decide the order of the stage performances tomorrow. " +
            "Hyerin has put the loudest band first, at nine in the morning. " +
            "The stage stands directly under the third year classrooms, " +
            "and those classes have a mock examination until eleven that day. " +
            "Minjun knows the noise would carry straight into the exam rooms. " +
            "He wants to ask her to move the band to the afternoon instead. " +
            "In this situation, what would Minjun most likely say to Hyerin?",
        ],
      ],
      choices: [
        "Let's cancel the band's performance.",
        "The stage should face the other way.",
        "Move the band to after the exam.",
        "I'll ask the third years to be quiet.",
        "Nine o'clock is too late for them.",
      ],
      answer: 3,
      clue: "He wants to ask her to move the band to the afternoon instead.",
      explanation:
        "3학년 모의고사가 열한 시까지이므로 밴드를 시험 뒤로 옮기자는 ③이 가장 적절하다.",
      translation: [
        "M: 민준이와 혜린이는 학교 축제 준비 팀입니다. 두 사람은 내일 무대 공연 순서를 정해야 합니다. 혜린이는 소리가 가장 큰 밴드를 아침 아홉 시 첫 순서에 넣었습니다. 무대는 3학년 교실 바로 아래에 있고, 그날 그 반들은 열한 시까지 모의고사를 봅니다. 민준이는 그 소리가 시험장으로 그대로 들어간다는 것을 압니다. 민준이는 밴드를 오후로 옮기자고 말하고 싶습니다. 이런 상황에서 민준이가 혜린이에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 여자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "Hello, everyone. Today I want to explain why bridges have expansion joints " +
            "and why buildings have them too. " +
            "Every material you can name grows when it is warmed and shrinks when it cools. " +
            "The change is small for a short piece and large for a long one, " +
            "because each metre adds its own share to the total. " +
            "A concrete wall thirty metres long can be a centimetre longer on a summer afternoon " +
            "than on a winter night, and a centimetre is enough to crack it " +
            "if both ends are held firmly in place. " +
            "So builders leave a gap and fill it with something soft that can be squeezed. " +
            "The gap closes in summer and opens in winter, and the wall itself never has to.",
        ],
      ],
      choices: [
        "how concrete is mixed on a building site",
        "why long structures are built with gaps in them",
        "how bridges carry the weight of traffic",
        "why winter damages roads more than summer",
        "how builders measure a wall accurately",
      ],
      answer: 2,
      clue: "So builders leave a gap and fill it with something soft that can be squeezed.",
      explanation:
        "여자는 재료가 늘고 줄기 때문에 긴 구조물에 틈을 두어야 한다고 설명한다. 따라서 답은 ②이다.",
      translation: [
        "W: 안녕하세요, 여러분. 오늘은 다리에 왜 신축 이음매가 있고 건물에도 왜 그것이 있는지 설명하려 합니다. 이름을 댈 수 있는 모든 재료는 따뜻해지면 늘고 식으면 줄어듭니다. 짧은 조각에서는 그 변화가 작고 긴 것에서는 큽니다. 1미터마다 자기 몫을 보태기 때문입니다. 길이가 30미터인 콘크리트 벽은 겨울밤보다 여름 오후에 1센티미터 더 길어질 수 있고, 양 끝이 단단히 고정되어 있다면 1센티미터로도 금이 갑니다. 그래서 짓는 사람들은 틈을 두고 눌리는 부드러운 것으로 채웁니다. 그 틈이 여름에는 닫히고 겨울에는 벌어지며, 벽 자체는 그럴 일이 없게 됩니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 내용이 아닌 것은?",
      lines: [
        ["W", "Today I want to explain why bridges have expansion joints."],
        ["W", "Every material grows when it is warmed and shrinks when it cools."],
        ["W", "A concrete wall thirty metres long can be a centimetre longer in summer."],
        ["W", "Builders leave a gap and fill it with something soft that can be squeezed."],
        ["W", "The gap closes in summer and opens in winter."],
      ],
      choices: [
        "materials growing when they are warmed",
        "a thirty metre wall changing by a centimetre",
        "a gap filled with something soft",
        "the gap closing in summer",
        "the cost of building a concrete bridge",
      ],
      answer: 5,
      clue: "Every material grows when it is warmed and shrinks when it cools.",
      explanation:
        "따뜻해지면 늘어나는 재료, 30미터 벽의 1센티미터 변화, 부드러운 것으로 채운 틈, 여름에 닫히는 틈은 언급되지만 다리를 짓는 비용은 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
