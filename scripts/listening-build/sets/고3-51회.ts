/** 고3 듣기 51회 — 사람이 직접 쓴 회차 (2026-09-30) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고3 51회",
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
          "Good morning, everyone. This is the school office. " +
            "Next Thursday the third-year students sit their final mock exam. " +
            "The hall is above the music room and below the art room. " +
            "For those three hours the building has to be quieter than usual, " +
            "and that is not something the exam hall can arrange by itself. " +
            "So on Thursday, first and second years use the east stairs only. " +
            "Music lessons move to the annexe, and the art room is closed until noon. " +
            "Break time bells are switched off between nine and twelve. " +
            "None of this is a rule about behaviour. It is about carrying sound.",
        ],
      ],
      choices: [
        "모의고사 날 다른 학년의 이동과 수업 변경을 알리려고",
        "모의고사 신청을 받으려고",
        "시험장 위치를 알리려고",
        "복도에서 떠들지 말라고 주의시키려고",
        "음악실 공사를 알리려고",
      ],
      answer: 1,
      clue: "So on Thursday, first and second years use the east stairs only.",
      explanation:
        "모의고사 날 다른 학년이 어떻게 움직이고 수업이 어디로 옮겨지는지 알리고 있다. 따라서 답은 ①이다.",
      translation: [
        "M: 여러분, 안녕하세요. 학교 사무실입니다. 다음 주 목요일에 3학년이 마지막 모의고사를 봅니다. 시험장은 음악실 위, 미술실 아래에 있습니다. 그 세 시간 동안 건물이 평소보다 조용해야 하는데, 그것은 시험장 혼자 할 수 있는 일이 아닙니다. 그래서 목요일에 1·2학년은 동쪽 계단만 씁니다. 음악 수업은 별관으로 옮기고, 미술실은 정오까지 닫습니다. 쉬는 시간 종은 아홉 시부터 열두 시까지 꺼 둡니다. 이 가운데 어느 것도 몸가짐에 대한 규칙이 아닙니다. 소리가 어디로 퍼지느냐에 대한 이야기입니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 여자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Yerin, you're going over papers you already got full marks on?"],
        ["W", "The ones I got right but wasn't sure about."],
        ["M", "Surely the wrong ones are where the marks are."],
        ["W", "The wrong ones I already know I don't know."],
        ["M", "And the shaky right ones look like nothing is wrong."],
        ["W", "Those are the ones that turn into wrong answers in November."],
        ["M", "How do you even find them afterwards?"],
        ["W", "I mark a dot beside anything I guessed at while I'm sitting there."],
        ["M", "So the paper tells you later what the score can't."],
        ["W", "A score counts answers; a dot counts confidence."],
        ["M", "My correct answers all look the same on the page."],
        ["W", "Mark the shaky ones while you still remember being shaky."],
        ["M", "I'll do that on Thursday's paper."],
      ],
      choices: [
        "맞혔지만 확신이 없던 문항을 표시해 두어야 한다",
        "틀린 문제부터 다시 풀어야 한다",
        "점수를 기록해 두어야 한다",
        "시험지는 버리지 말아야 한다",
        "문제를 여러 번 풀어야 한다",
      ],
      answer: 1,
      clue: "Mark the shaky ones while you still remember being shaky.",
      explanation:
        "여자는 맞혔지만 확신이 없던 문항을 그 자리에서 표시해 두라고 말한다. 따라서 답은 ①이다.",
      translation: [
        "M: 예린아, 이미 만점 받은 시험지를 다시 봐?",
        "W: 맞히긴 했는데 확신이 없었던 것들.",
        "M: 점수는 틀린 데에 있잖아.",
        "W: 틀린 건 내가 모른다는 걸 이미 알아.",
        "M: 아슬아슬하게 맞힌 건 아무 문제도 없어 보이고.",
        "W: 그게 11월에 틀린 답으로 바뀌는 것들이야.",
        "M: 나중에 그걸 어떻게 찾아?",
        "W: 시험장에서 찍은 문제 옆에 점을 하나 찍어 둬.",
        "M: 그럼 점수가 못 알려 주는 걸 시험지가 나중에 알려 주는구나.",
        "W: 점수는 답을 세고, 점은 확신을 세.",
        "M: 내 맞은 답들은 종이 위에서 다 똑같아 보여.",
        "W: 아슬아슬했던 기억이 남아 있을 때 표시해 둬.",
        "M: 목요일 시험지에 해 볼게.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "We praise people for finishing what they started, " +
            "and treat stopping as the moment their character gave way. " +
            "But a plan is a guess about a future that has since arrived. " +
            "The person who made it knew less than the person carrying it out. " +
            "Carrying on after the guess has been proved wrong is not persistence; " +
            "it is refusing to use what you have learned since. " +
            "The cost already spent cannot be recovered by spending more. " +
            "Ask what you would choose if today were the first day, " +
            "and let the answer, not the calendar, decide whether to go on.",
        ],
      ],
      choices: [
        "잘못된 계획은 그만둘 줄도 알아야 한다",
        "시작한 일은 끝까지 해야 한다",
        "계획은 미리 세워야 한다",
        "남의 조언을 들어야 한다",
        "실패를 기록해야 한다",
      ],
      answer: 1,
      clue: "The cost already spent cannot be recovered by spending more.",
      explanation:
        "짐작이 틀렸음이 드러난 계획을 붙드는 것은 끈기가 아니라고 말한다. 따라서 답은 ①이다.",
      translation: [
        "M: 우리는 시작한 일을 끝낸 사람을 칭찬하고, 그만두는 것을 그 사람의 됨됨이가 무너진 순간으로 여깁니다. 그러나 계획이란 그 뒤에 이미 와 버린 앞날에 대한 짐작입니다. 그 계획을 세운 사람은 그것을 해내고 있는 사람보다 아는 것이 적었습니다. 짐작이 틀렸음이 드러난 뒤에도 밀고 나가는 것은 끈기가 아니라, 그동안 배운 것을 쓰지 않겠다는 고집입니다. 이미 쓴 값은 더 써도 되찾을 수 없습니다. 오늘이 첫날이라면 무엇을 고르겠는지 물어보고, 달력이 아니라 그 답이 계속할지를 정하게 하십시오.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["W", "Kiwoo, is this a photo of the exam hall?"],
        ["M", "They laid it out again on Wednesday."],
        ["W", "There are four rows of desks facing the front."],
        ["M", "Six desks in each row, twenty-four in all."],
        ["W", "And a long table stands at the front."],
        ["M", "The papers are stacked on it before the bell."],
        ["W", "A clock hangs on the wall behind the table."],
        ["M", "Two clocks, since this term. The back row couldn't see."],
        ["W", "There's a fan in the left corner."],
        ["M", "We only run it before the exam starts."],
        ["W", "And a bin stands beside the door."],
        ["M", "That's for the wrappers people bring in."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "Two clocks, since this term. The back row couldn't see.",
      explanation:
        "시계가 하나라고 했지만 이번 학기부터 두 개라고 했다. 따라서 답은 ③이다.",
      figure: {
        kind: "figure5",
        scene:
          "A school exam hall, clean black line art on a plain white background, no writing or letters anywhere. " +
          "FOUR ROWS OF DESKS face the front of the hall. " +
          "A LONG TABLE stands at the front of the hall. " +
          "ONE CLOCK hangs on the wall behind the long table. " +
          "A FAN stands on the floor in the left corner. " +
          "A BIN stands on the floor beside the door on the right.",
        spots: [
          [0.45, 0.7],
          [0.5, 0.42],
          [0.5, 0.13],
          [0.08, 0.5],
          [0.9, 0.72],
        ],
      },
      translation: [
        "W: 기우야, 이게 시험장 사진이야?",
        "M: 수요일에 다시 차렸어.",
        "W: 앞을 보고 책상이 네 줄 놓여 있네.",
        "M: 한 줄에 여섯 개씩, 다 해서 스물네 개.",
        "W: 그리고 앞쪽에 긴 탁자가 있고.",
        "M: 종 치기 전에 시험지를 거기 쌓아 둬.",
        "W: 탁자 뒤 벽에 시계가 하나 걸려 있어.",
        "M: 이번 학기부터 두 개야. 뒷줄에서 안 보였거든.",
        "W: 왼쪽 구석에는 선풍기가 있네.",
        "M: 시험 시작 전에만 틀어.",
        "W: 그리고 문 옆에 쓰레기통이 있고.",
        "M: 가져 들어온 껍질 버리라고 둔 거야.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 여자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Sohyun, the mock exam starts at nine tomorrow."],
        ["W", "The desks are numbered and the papers are counted."],
        ["M", "It went faster than last time."],
        ["W", "We started straight after lunch instead of at four."],
        ["M", "Did anyone collect the spare pencils from the office?"],
        ["W", "Wonjae said he would bring them at five."],
        ["M", "He was kept back by the science teacher."],
        ["W", "Then the pencils are still in the office."],
        ["M", "How many do we keep spare?"],
        ["W", "Thirty, one for every desk and six over."],
        ["M", "And the office is locked at half past six."],
        ["W", "It's twenty past six right now."],
        ["M", "Then somebody has to go this minute."],
        ["W", "You can't; you're the only one who can check the seating list."],
        ["M", "I'll stay and check the seating list."],
        ["W", "I'll go and fetch the spare pencils."],
      ],
      choices: [
        "자리표를 확인하기",
        "여분 연필을 가져오기",
        "시험지를 세기",
        "원재에게 연락하기",
        "책상에 번호를 붙이기",
      ],
      answer: 2,
      clue: "I'll go and fetch the spare pencils.",
      explanation:
        "여자는 사무실에서 여분 연필을 가져오겠다고 했다. 따라서 답은 ②이다.",
      translation: [
        "M: 소현아, 모의고사는 내일 아홉 시에 시작해.",
        "W: 책상 번호는 붙였고 시험지도 세어 놨어.",
        "M: 지난번보다 빨랐다.",
        "W: 네 시가 아니라 점심 먹고 바로 시작했잖아.",
        "M: 사무실에서 여분 연필은 누가 가져왔어?",
        "W: 원재가 다섯 시에 가져오겠다고 했어.",
        "M: 과학 선생님이 붙잡으셔서 못 왔어.",
        "W: 그럼 연필은 아직 사무실에 있겠네.",
        "M: 여분을 몇 자루 두지?",
        "W: 서른 자루, 책상마다 하나씩에 여섯 자루가 남아.",
        "M: 그리고 사무실은 여섯 시 반에 잠가.",
        "W: 지금 여섯 시 20분이야.",
        "M: 그럼 누군가 당장 가야 해.",
        "W: 너는 안 돼. 자리표를 볼 사람은 너뿐이야.",
        "M: 나는 남아서 자리표를 확인할게.",
        "W: 내가 가서 여분 연필을 가져올게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 남자가 지불할 금액을 고르시오.",
      lines: [
        ["W", "Welcome to the stationery shop. What can I get you?"],
        ["M", "Six packs of pencils and four erasers, please."],
        ["W", "The pencil packs are five dollars each."],
        ["M", "Were they not four dollars in September?"],
        ["W", "They were, until the new stock came in."],
        ["M", "Then six packs it is."],
        ["W", "And the erasers are two dollars fifty each."],
        ["M", "Is there a cheaper one?"],
        ["W", "There's a one-dollar one, but it marks the paper."],
        ["M", "Then I'll take the better ones."],
        ["W", "Are you buying for the school?"],
        ["M", "For tomorrow's mock exam. Here's the school card."],
        ["W", "Schools get ten percent off the total."],
        ["M", "Good. I'll pay in cash."],
      ],
      choices: ["$32.00", "$34.00", "$36.00", "$38.00", "$40.00"],
      answer: 3,
      clue: "The pencil packs are five dollars each.",
      explanation:
        "연필 6묶음 30달러와 지우개 4개 10달러로 40달러인데, 10퍼센트를 빼면 36달러이다. 따라서 답은 ③이다.",
      translation: [
        "W: 문구점에 오신 걸 환영합니다. 무엇을 드릴까요?",
        "M: 연필 여섯 묶음과 지우개 네 개 주세요.",
        "W: 연필은 한 묶음에 5달러입니다.",
        "M: 9월에는 4달러 아니었나요?",
        "W: 맞는데 새 물건이 들어오면서 올랐어요.",
        "M: 그럼 여섯 묶음으로 할게요.",
        "W: 그리고 지우개는 하나에 2달러 50센트입니다.",
        "M: 더 싼 건 없나요?",
        "W: 1달러짜리가 있는데 종이에 자국이 남아요.",
        "M: 그럼 좋은 걸로 할게요.",
        "W: 학교에서 사시는 건가요?",
        "M: 내일 모의고사에 쓸 거예요. 여기 학교 카드요.",
        "W: 학교는 전체에서 10퍼센트 할인됩니다.",
        "M: 좋네요. 현금으로 낼게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 남자가 시험장을 옮긴 이유를 고르시오.",
      lines: [
        ["W", "Hyeonu, the mock exam is in the second-floor hall now?"],
        ["W", "You've used the gymnasium for every exam this year."],
        ["M", "We have, and it holds twice as many."],
        ["W", "Did the gymnasium get booked by someone else?"],
        ["M", "It's free all Thursday morning."],
        ["W", "Is the hall closer for the students?"],
        ["M", "The gymnasium is closer, if anything."],
        ["W", "Then why move it?"],
        ["M", "The listening test is unusable in the gymnasium."],
        ["W", "Because of the echo off the walls?"],
        ["M", "The back rows hear every word twice."],
        ["W", "Then the hall is the only choice."],
      ],
      choices: [
        "체육관에서 듣기 소리가 울려서",
        "체육관을 다른 데서 써서",
        "인원이 줄어서",
        "체육관이 추워서",
        "선생님이 바꾸라고 하셔서",
      ],
      answer: 1,
      clue: "The listening test is unusable in the gymnasium.",
      explanation:
        "체육관은 소리가 울려 듣기 평가를 치를 수 없어 옮겼다. 따라서 답은 ①이다.",
      translation: [
        "W: 현우야, 모의고사를 이제 2층 강당에서 봐?",
        "W: 올해 시험은 다 체육관에서 봤잖아.",
        "M: 그랬지, 거기가 두 배는 들어가고.",
        "W: 체육관을 다른 데서 예약했어?",
        "M: 목요일 오전 내내 비어 있어.",
        "W: 강당이 학생들한테 더 가까워?",
        "M: 굳이 따지면 체육관이 더 가까워.",
        "W: 그럼 왜 옮겼어?",
        "M: 체육관에서는 듣기 평가를 칠 수가 없어.",
        "W: 벽에 소리가 울려서?",
        "M: 뒷줄은 모든 말을 두 번씩 들어.",
        "W: 그럼 강당밖에 없네.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 졸업식에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["M", "Dain, have you seen the letter about graduation?"],
        ["M", "It came home with us yesterday afternoon."],
        ["W", "It's held in the main hall this year."],
        ["M", "Not at the city centre like last time?"],
        ["W", "The main hall, because the hire cost too much."],
        ["M", "When is it?"],
        ["W", "The eighth of February, at eleven in the morning."],
        ["M", "How long does it last?"],
        ["W", "About ninety minutes, including the photographs."],
        ["M", "How many family members can come?"],
        ["W", "Two each, and babies don't count."],
        ["M", "What do we wear?"],
        ["W", "School uniform, with the gown over it."],
        ["M", "Then I'll tell my parents tonight."],
      ],
      choices: ["열리는 곳", "열리는 날과 시각", "걸리는 시간", "올 수 있는 가족 수", "식순"],
      answer: 5,
      clue: "The eighth of February, at eleven in the morning.",
      explanation:
        "장소, 날짜와 시각, 걸리는 시간, 가족 수는 말했지만 식순은 말하지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 다인아, 졸업식 통신문 봤어?",
        "M: 어제 오후에 받아 왔잖아.",
        "W: 올해는 대강당에서 해.",
        "M: 지난번처럼 시내가 아니고?",
        "W: 빌리는 값이 너무 비싸서 대강당에서 해.",
        "M: 언제야?",
        "W: 2월 8일 오전 열한 시.",
        "M: 얼마나 걸려?",
        "W: 사진 찍는 것까지 90분쯤.",
        "M: 가족은 몇 명까지 올 수 있어?",
        "W: 한 사람당 두 명, 아기는 안 세.",
        "M: 뭘 입어?",
        "W: 교복 위에 가운을 입어.",
        "M: 그럼 오늘 밤에 부모님께 말씀드려야겠다.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "다음을 듣고, 모의고사 안내에 관한 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "W",
          "Hello, students. Here are the details of Thursday's mock exam. " +
            "It is held in the second-floor hall, not the gymnasium. " +
            "Come in by the east door and find your seat by the list on the wall. " +
            "The first paper begins at nine and the last ends at three. " +
            "Lunch is forty minutes, and the canteen opens early for you. " +
            "Bring your own watch; phones are collected at the door. " +
            "Spare pencils and erasers are on the front table if you need them. " +
            "Answer sheets are collected at the end of each paper, not at the end of the day. " +
            "Results come back in the second week of December.",
        ],
      ],
      choices: [
        "2층 강당에서 본다",
        "동쪽 문으로 들어간다",
        "아홉 시에 시작해 세 시에 끝난다",
        "휴대전화는 자리에 두고 본다",
        "여분 연필이 앞 탁자에 있다",
      ],
      answer: 4,
      clue: "Bring your own watch; phones are collected at the door.",
      explanation:
        "휴대전화는 문에서 걷는다고 했으므로 ④가 일치하지 않는다.",
      translation: [
        "W: 학생 여러분, 안녕하세요. 목요일 모의고사를 안내합니다. 체육관이 아니라 2층 강당에서 봅니다. 동쪽 문으로 들어와 벽에 붙은 명단에서 자리를 찾으세요. 첫 시험은 아홉 시에 시작하고 마지막 시험은 세 시에 끝납니다. 점심은 40분이고, 여러분을 위해 급식실이 일찍 엽니다. 시계는 각자 가져오세요. 휴대전화는 문에서 걷습니다. 여분 연필과 지우개는 앞 탁자에 있으니 필요하면 쓰세요. 답안지는 하루가 끝날 때가 아니라 시험마다 끝날 때 걷습니다. 성적은 12월 둘째 주에 나옵니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 여자가 신청할 겨울 강좌를 고르시오.",
      lines: [
        ["M", "Chaeyeon, which winter course will you apply for?"],
        ["W", "The school is opening five of them."],
        ["M", "I read the list on the noticeboard yesterday."],
        ["W", "They all start on the fifth of January."],
        ["M", "Can you come in the morning?"],
        ["W", "I look after my brother until noon every day."],
        ["M", "Then the morning ones are out."],
        ["W", "Two of these five are in the morning."],
        ["M", "How long can the course run?"],
        ["W", "Three weeks at most; we travel after that."],
        ["M", "One of the rest runs for five weeks."],
        ["W", "And it has to be free."],
        ["M", "That takes out one more of them."],
        ["W", "Then there's only one course left."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "I look after my brother until noon every day.",
      explanation:
        "오후이고, 3주 이하이며, 무료인 강좌는 ④이다. 따라서 답은 ④이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Time: Morning / Weeks: 2 / Fee: Free" },
          { no: 2, label: "②", value: "Time: Morning / Weeks: 3 / Fee: 20,000 won" },
          { no: 3, label: "③", value: "Time: Afternoon / Weeks: 5 / Fee: Free" },
          { no: 4, label: "④", value: "Time: Afternoon / Weeks: 3 / Fee: Free" },
          { no: 5, label: "⑤", value: "Time: Afternoon / Weeks: 2 / Fee: 15,000 won" },
        ],
      },
      translation: [
        "M: 채연아, 겨울 강좌는 어느 걸 신청할 거야?",
        "W: 학교에서 다섯 개를 열어.",
        "M: 어제 게시판에 붙은 목록을 읽었어.",
        "W: 다 1월 5일에 시작해.",
        "M: 오전에 올 수 있어?",
        "W: 날마다 정오까지 동생을 봐.",
        "M: 그럼 오전 것은 빠지네.",
        "W: 이 다섯 중 두 개가 오전이야.",
        "M: 강좌는 얼마나 길어도 돼?",
        "W: 길어야 3주. 그 뒤에 여행을 가.",
        "M: 나머지 중 하나는 5주야.",
        "W: 그리고 무료여야 해.",
        "M: 그럼 하나가 더 빠지네.",
        "W: 그럼 남는 강좌는 하나뿐이야.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Do you know which door we go in on Thursday?"],
        ["W", "I assumed the usual one by the yard."],
        ["M", "The letter says the east door this time."],
        ["W", "Then I'd have walked round the whole building."],
        ["M", "Shall I send you a photo of the letter?"],
      ],
      choices: [
        "Yes, that would help.",
        "The exam was cancelled.",
        "I don't need a seat.",
        "The yard door is closed forever.",
        "I already sat it.",
      ],
      answer: 1,
      clue: "Shall I send you a photo of the letter?",
      explanation:
        "통신문 사진을 보내 주겠다는 제안이므로, 그러면 도움이 되겠다는 ①이 가장 자연스럽다.",
      translation: [
        "M: 목요일에 어느 문으로 들어가는지 알아?",
        "W: 늘 쓰던 운동장 쪽 문인 줄 알았는데.",
        "M: 통신문에는 이번엔 동쪽 문이래.",
        "W: 그럼 건물을 빙 돌 뻔했네.",
        "M: 통신문 사진 보내 줄까?",
        "W: 응, 그러면 도움이 되겠다.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Excuse me, can I keep my phone in my bag during the exam?"],
        ["M", "Phones are collected at the door, not kept in bags."],
        ["W", "Then how will I know the time?"],
        ["M", "There are two clocks at the front of the hall."],
        ["W", "And what if I'd rather have my own watch?"],
      ],
      choices: [
        "Watches are not allowed.",
        "Bring one; that's fine.",
        "The clocks are broken.",
        "You can keep your phone.",
        "Ask again on Thursday.",
      ],
      answer: 2,
      clue: "And what if I'd rather have my own watch?",
      explanation:
        "자기 시계를 쓰고 싶다고 했으므로, 가져와도 된다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 실례합니다, 시험 중에 휴대전화를 가방에 둬도 되나요?",
        "M: 휴대전화는 가방에 두는 게 아니라 문에서 걷습니다.",
        "W: 그럼 시간을 어떻게 알아요?",
        "M: 강당 앞쪽에 시계가 두 개 있습니다.",
        "W: 제 시계를 쓰고 싶으면요?",
        "M: 가져오세요. 괜찮습니다.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Sujeong, how did the peer tutoring end up?"],
        ["W", "Eighteen pairs in March and five still meeting in July."],
        ["M", "Did the tutors run out of things to teach?"],
        ["W", "Most of them asked to do it again next year."],
        ["M", "So they wanted to carry on."],
        ["W", "Nobody knew whether it was working."],
        ["M", "Didn't the tutees' marks tell you?"],
        ["W", "We looked at those once, in June."],
        ["M", "Four months of teaching with no sign either way."],
        ["W", "By then the pairs had already drifted apart."],
        ["M", "What would you check, and how often?"],
      ],
      choices: [
        "The marks once a term.",
        "One short quiz every two weeks.",
        "Nothing; marks are private.",
        "More pairs than last year.",
        "A longer meeting each time.",
      ],
      answer: 2,
      clue: "What would you check, and how often?",
      explanation:
        "넉 달 동안 효과를 알 길이 없었으므로, 두 주마다 짧은 확인을 두자는 ②가 가장 자연스럽다.",
      translation: [
        "M: 수정아, 또래 학습은 결국 어떻게 됐어?",
        "W: 3월에 열여덟 쌍이었는데 7월에 다섯 쌍이 남았어.",
        "M: 가르칠 게 떨어졌어?",
        "W: 대부분은 내년에 또 하고 싶다고 했어.",
        "M: 그럼 이어 가고 싶어 했네.",
        "W: 그게 되고 있는지를 아무도 몰랐어.",
        "M: 배우는 쪽 성적을 보면 알 수 있잖아.",
        "W: 6월에 딱 한 번 봤어.",
        "M: 넉 달을 가르치면서 되는지 안 되는지 아무 표시가 없었구나.",
        "W: 그쯤엔 짝들이 이미 흩어져 있었어.",
        "M: 무엇을 얼마나 자주 볼 거야?",
        "W: 두 주마다 짧은 확인을 한 번씩 두자.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Junsu, you said the last twenty minutes of every exam go badly."],
        ["M", "I rush the end and lose marks I shouldn't."],
        ["W", "When do you first look at the clock?"],
        ["M", "Somewhere around question thirty."],
        ["W", "By then two thirds of the time has gone."],
        ["M", "And I find out I'm behind when I can't fix it."],
        ["W", "The clock is only telling you bad news at the end."],
        ["M", "I'd rather not look at it at all, honestly."],
        ["W", "Then it can only ever surprise you."],
        ["M", "So I need to know earlier, while there's room to adjust."],
        ["W", "What will you set for yourself on Thursday?"],
      ],
      choices: [
        "A quicker pace throughout.",
        "A time to reach question twenty by.",
        "No clock at all.",
        "Twenty more minutes.",
        "The same as last time.",
      ],
      answer: 2,
      clue: "What will you set for yourself on Thursday?",
      explanation:
        "늦었다는 것을 일찍 알아야 하므로, 20번까지의 목표 시각을 정하겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 준수야, 시험마다 마지막 20분이 엉망이라고 했잖아.",
        "M: 끝을 서두르다가 안 틀려도 될 걸 틀려.",
        "W: 시계를 언제 처음 봐?",
        "M: 30번쯤에서.",
        "W: 그때면 시간의 3분의 2가 갔지.",
        "M: 그리고 늦었다는 걸 손쓸 수 없을 때 알게 돼.",
        "W: 시계가 끝에 가서 나쁜 소식만 알려 주는 거네.",
        "M: 솔직히 아예 안 보고 싶어.",
        "W: 그럼 시계는 너를 놀라게만 할 수 있지.",
        "M: 그러니까 고칠 여유가 있을 때 미리 알아야겠네.",
        "W: 목요일에는 뭘 정해 둘 거야?",
        "M: 20번까지 몇 시까지 간다는 목표를 정할게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Jihun이 Bomi에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Jihun : ________________",
      lines: [
        [
          "M",
          "Jihun and Bomi are setting out the hall the night before the mock exam. " +
            "Bomi has put the seating list up on the wall beside the east door, " +
            "and she has taped it flat with the students' names facing out. " +
            "The list carries every student's name next to their class rank. " +
            "Jihun knows the hall is used by the whole school until eight, " +
            "and that a rank beside a name is not something to hang in a corridor. " +
            "A list with seat numbers only is sitting in the folder beside her. " +
            "He wants her to put that one up instead. " +
            "In this situation, what would Jihun most likely say to Bomi?",
        ],
      ],
      choices: [
        "Tape the list more firmly.",
        "Put up the list without the ranks.",
        "The exam starts at nine.",
        "We need a bigger list.",
        "Move the list to the west door.",
      ],
      answer: 2,
      clue: "He wants her to put that one up instead.",
      explanation:
        "이름 옆의 석차를 복도에 붙일 수 없으므로, 석차 없는 명단을 붙이라는 ②가 가장 적절하다.",
      translation: [
        "M: 지훈이와 보미는 모의고사 전날 밤에 강당을 차리고 있습니다. 보미는 동쪽 문 옆 벽에 자리 명단을 붙였는데, 학생들의 이름이 밖으로 보이게 평평하게 테이프로 붙였습니다. 그 명단에는 학생마다 이름 옆에 반 석차가 적혀 있습니다. 지훈이는 그 강당을 여덟 시까지 전교생이 쓴다는 것과, 이름 옆의 석차는 복도에 걸 것이 아니라는 것을 압니다. 자리 번호만 적힌 명단이 그의 옆 서류철에 들어 있습니다. 그는 그것을 대신 붙이기를 바랍니다. 이런 상황에서 지훈이가 보미에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 여자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "Hello, everyone. Today I want to talk about why a measure " +
            "stops working the moment it is used to judge people. " +
            "Every large organisation needs some number to stand in for what it does, " +
            "because the work itself is too varied to look at all at once. " +
            "A hospital judged on waiting times will shorten waiting times, " +
            "though not always by seeing patients sooner: " +
            "it can start the clock later, or count a different kind of visit. " +
            "A school judged on pass rates can enter fewer students for the exam, " +
            "and the ones it leaves out are the ones who needed it most. " +
            "In each case the number improves while the thing it stood for does not. " +
            "Nobody in either story has done anything dishonest; " +
            "they have simply done what they were asked to do. " +
            "The measure was useful precisely because nobody was aiming at it. " +
            "Once it becomes the target, it stops describing and starts being gamed.",
        ],
      ],
      choices: [
        "why a measure fails once it becomes a target",
        "how hospitals shorten waiting times",
        "why schools publish their pass rates",
        "how statistics are collected fairly",
        "why numbers are better than opinions",
      ],
      answer: 1,
      clue: "Once it becomes the target, it stops describing and starts being gamed.",
      explanation:
        "잣대가 목표가 되는 순간 재던 것을 더 이상 재지 못한다는 것이 중심 내용이다. 따라서 답은 ①이다.",
      translation: [
        "W: 여러분, 안녕하세요. 오늘은 잣대가 사람을 평가하는 데 쓰이는 순간 왜 제 노릇을 그만두는지 이야기하려 합니다. 큰 조직은 저마다 자기가 하는 일을 대신할 숫자를 필요로 합니다. 그 일 자체는 너무 여러가지여서 한꺼번에 들여다볼 수 없기 때문입니다. 대기 시간으로 평가받는 병원은 대기 시간을 줄입니다. 다만 늘 환자를 더 빨리 보아서 줄이는 것은 아닙니다. 시계를 더 늦게 켜 수도 있고, 다른 종류의 방문으로 셀 수도 있습니다. 합격률로 평가받는 학교는 시험에 응시시키는 학생을 줄일 수 있습니다. 그리고 빠지는 학생은 그 시험이 가장 필요했던 학생입니다. 어느 경우든 숫자는 나아지고 그 숫자가 가리키던 것은 나아지지 않습니다. 두 이야기 어느 쪽에서도 정직하지 않은 일을 한 사람은 없습니다. 그저 시킨 대로 했을 뿐입니다. 그 잣대가 쓸모 있었던 것은 바로 아무도 그것을 겨누지 않았기 때문입니다. 목표가 되는 순간, 그것은 무언가를 그려 보이기를 그만두고 요령의 대상이 됩니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "다음을 듣고, 언급된 것이 아닌 것을 고르시오.",
      lines: [
        ["W", "A measure stops working the moment it is used to judge people."],
        ["W", "A hospital judged on waiting times will shorten waiting times."],
        ["W", "A school judged on pass rates can enter fewer students."],
        ["W", "The number improves while the thing it stood for does not."],
        ["W", "Once it becomes the target, it starts being gamed."],
      ],
      choices: ["a measure", "a hospital", "a school", "the target", "a factory"],
      answer: 5,
      clue: "A school judged on pass rates can enter fewer students.",
      explanation:
        "잣대, 병원, 학교, 목표는 언급되지만 공장은 나오지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
