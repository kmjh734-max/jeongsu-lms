/** 고3 듣기 46회 — 사람이 직접 쓴 회차 (2026-09-29) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고3 46회",
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
          "Good morning, everyone. This is the physical education department. " +
            "The gymnasium has been shared by five clubs since March, " +
            "and the timetable on the door was written in March as well. " +
            "Since then two clubs have grown and one has closed. " +
            "Last week three groups turned up for the same hour on Thursday. " +
            "Nobody was at fault; the timetable simply stopped being true. " +
            "So we are rewriting it, and we need each club to tell us two things: " +
            "how many members you now have and which hours you actually use. " +
            "Send that to the department by Friday, and the new timetable goes up on Monday. " +
            "Clubs that do not reply will be given the hours that are left.",
        ],
      ],
      choices: [
        "동아리별 사용 시간을 알려 달라고 요청하려고",
        "체육관 공사를 알리려고",
        "동아리 회원을 모집하려고",
        "체육관 사용 규칙을 알리려고",
        "체육 대회 일정을 안내하려고",
      ],
      answer: 1,
      clue: "how many members you now have and which hours you actually use",
      explanation:
        "시간표를 다시 짜기 위해 동아리별 인원과 쓰는 시간을 알려 달라고 요청하고 있다. 따라서 답은 ①이다.",
      translation: [
        "W: 여러분, 안녕하세요. 체육부입니다. 체육관은 3월부터 다섯 동아리가 나눠 써 왔고, 문에 붙은 시간표도 3월에 쓴 것입니다. 그 뒤로 두 동아리는 커졌고 한 동아리는 없어졌습니다. 지난주에는 목요일 같은 시간에 세 무리가 왔습니다. 누구의 잘못도 아닙니다. 시간표가 사실이 아니게 되었을 뿐입니다. 그래서 다시 짜려고 하는데, 동아리마다 두 가지를 알려 주셔야 합니다. 지금 회원이 몇 명인지, 그리고 실제로 어느 시간을 쓰는지입니다. 금요일까지 체육부로 보내 주시면 월요일에 새 시간표를 붙이겠습니다. 답을 주지 않은 동아리에는 남는 시간을 드립니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 남자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Jinyoung, you wrote out the wrong answers by hand again?"],
        ["M", "The question and my answer, both, in full."],
        ["W", "Couldn't you just circle them in the book?"],
        ["M", "I did that for a year and learned nothing."],
        ["W", "Why would writing it out change anything?"],
        ["M", "Circling marks where I was wrong."],
        ["W", "And writing it out shows what I was thinking."],
        ["M", "The wrong answer holds the reason inside it."],
        ["W", "So you're studying your own mistake, not the right answer."],
        ["M", "The right answer I can read anywhere."],
        ["W", "My notebook is just a list of numbers, then."],
        ["M", "Write down what you thought, not what was wrong."],
        ["W", "I'll redo mine from this week's paper."],
      ],
      choices: [
        "틀린 까닭을 적어야 오답 정리가 된다",
        "오답 노트를 매일 써야 한다",
        "틀린 문제는 다시 풀어야 한다",
        "정답 해설을 꼼꼼히 읽어야 한다",
        "문제집은 한 권만 봐야 한다",
      ],
      answer: 1,
      clue: "Write down what you thought, not what was wrong.",
      explanation:
        "남자는 무엇이 틀렸는지가 아니라 무엇을 생각했는지를 적으라고 말한다. 따라서 답은 ①이다.",
      translation: [
        "W: 진영아, 또 틀린 문제를 손으로 옮겨 적었어?",
        "M: 문제랑 내 답을 둘 다, 통째로.",
        "W: 책에 동그라미만 치면 안 돼?",
        "M: 일 년 그렇게 했는데 아무것도 못 배웠어.",
        "W: 옮겨 적는 게 뭐가 달라?",
        "M: 동그라미는 내가 어디서 틀렸는지를 표시하지.",
        "W: 옮겨 적으면 무슨 생각을 했는지가 드러나고.",
        "M: 틀린 답 안에 그 까닭이 들어 있어.",
        "W: 그러니까 정답이 아니라 네 실수를 공부하는구나.",
        "M: 정답은 어디서든 읽을 수 있잖아.",
        "W: 내 오답 노트는 번호 목록일 뿐이네.",
        "M: 뭐가 틀렸는지 말고 네가 뭘 생각했는지를 적어.",
        "W: 이번 주 시험지로 다시 해 볼게.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "A rule that everyone breaks is worse than no rule at all. " +
            "It looks like order while producing none, " +
            "and it teaches the quiet lesson that rules here are decoration. " +
            "Once that lesson is learned it spreads to the rules that matter. " +
            "A group with three rules that are kept is stricter, in practice, " +
            "than a group with twenty that are ignored. " +
            "So before adding a rule, look at the ones already written down " +
            "and cross out every one you are not willing to enforce. " +
            "Fewer rules, each one meant, is the only kind of order there is.",
        ],
      ],
      choices: [
        "지킬 수 있는 규칙만 남겨야 한다",
        "규칙은 자세히 적어야 한다",
        "규칙을 어기면 벌을 주어야 한다",
        "규칙은 함께 정해야 한다",
        "규칙은 자주 알려야 한다",
      ],
      answer: 1,
      clue: "Fewer rules, each one meant, is the only kind of order there is.",
      explanation:
        "지킬 뜻이 없는 규칙은 지우고 적은 규칙만 남기라고 말한다. 따라서 답은 ①이다.",
      translation: [
        "W: 모두가 어기는 규칙은 아예 없느니만 못합니다. 질서처럼 보이면서 아무 질서도 만들지 않고, 여기서 규칙은 장식이라는 조용한 가르침을 남깁니다. 그 가르침을 한번 배우고 나면 정작 중요한 규칙에까지 번집니다. 지켜지는 규칙 셋을 가진 모임이, 무시되는 규칙 스물을 가진 모임보다 실제로는 더 엄합니다. 그러니 규칙을 더하기 전에 이미 적혀 있는 것들을 보고, 지키게 할 뜻이 없는 것은 모두 지우십시오. 더 적은 규칙, 그러나 저마다 뜻이 있는 규칙이 있을 수 있는 유일한 질서입니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["M", "Hanbyeol, is this a photo of the gymnasium store?"],
        ["W", "We cleared it out at the end of last term."],
        ["M", "There's a rack of balls against the back wall."],
        ["W", "Every ball in the school is in there."],
        ["M", "And a bench runs along the left side."],
        ["W", "People sit on it to change their shoes."],
        ["M", "Two nets are rolled up in the right corner."],
        ["W", "One net, actually. The other went to the yard."],
        ["M", "There's a window high up above the door."],
        ["W", "It's the only air the room ever gets."],
        ["M", "And a mat is spread out in the middle."],
        ["W", "We put it there so the floor doesn't mark."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "One net, actually. The other went to the yard.",
      explanation:
        "그물이 두 개라고 했지만 하나라고 했다. 따라서 답은 ③이다.",
      figure: {
        kind: "figure5",
        scene:
          "A gymnasium store room, clean black line art on a plain white background, no writing or letters anywhere. " +
          "A RACK OF BALLS stands against the back wall. " +
          "A BENCH runs along the left side of the room. " +
          "TWO ROLLED-UP NETS lean in the right corner. " +
          "A WINDOW is set high up above the door. " +
          "A MAT is spread out in the middle of the floor.",
        spots: [
          [0.5, 0.3],
          [0.1, 0.55],
          [0.88, 0.5],
          [0.62, 0.1],
          [0.45, 0.82],
        ],
      },
      translation: [
        "M: 한별아, 이게 체육관 창고 사진이야?",
        "W: 지난 학기 말에 싹 치웠어.",
        "M: 뒷벽에 공 선반이 붙어 있네.",
        "W: 학교에 있는 공은 다 거기 있어.",
        "M: 그리고 왼쪽을 따라 긴 의자가 있고.",
        "W: 거기 앉아서 신발을 갈아 신어.",
        "M: 오른쪽 구석에 그물이 두 개 말려 있어.",
        "W: 사실 하나야. 다른 하나는 운동장에 나갔어.",
        "M: 문 위 높이 창문이 하나 있네.",
        "W: 그 방에 들어오는 바람은 그것뿐이야.",
        "M: 그리고 가운데에 깔개가 펼쳐져 있고.",
        "W: 바닥에 자국 안 나게 거기 깔아 놨어.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 남자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Junhee, the match starts at four this afternoon."],
        ["W", "The court is marked and the benches are out."],
        ["M", "I checked the net twice this morning."],
        ["W", "Did anyone bring the scoreboard from the store?"],
        ["M", "Dohee said she would carry it over at two."],
        ["W", "She was sent home with a headache at one."],
        ["M", "Then the scoreboard is still in the store."],
        ["W", "And nobody else knows where it's kept."],
        ["M", "I've taken it out twice this term."],
        ["W", "The store is locked at half past three."],
        ["M", "It's twenty past three right now."],
        ["W", "Then you would have to leave at once."],
        ["M", "There's no time to find anyone else."],
        ["W", "I'll finish setting out the water bottles."],
        ["M", "I'll go and fetch the scoreboard."],
      ],
      choices: [
        "물병을 놓기",
        "그물을 확인하기",
        "점수판을 가져오기",
        "도희에게 연락하기",
        "선을 다시 긋기",
      ],
      answer: 3,
      clue: "I'll go and fetch the scoreboard.",
      explanation:
        "남자는 창고에서 점수판을 가져오겠다고 했다. 따라서 답은 ③이다.",
      translation: [
        "W: 준희야, 경기는 오늘 오후 네 시에 시작해.",
        "W: 선은 다 그었고 의자도 내놨어.",
        "M: 그물은 오늘 아침에 두 번 확인했어.",
        "W: 창고에서 점수판은 누가 가져왔어?",
        "M: 도희가 두 시에 옮겨 오겠다고 했어.",
        "W: 한 시에 머리가 아파서 집에 보냈어.",
        "M: 그럼 점수판은 아직 창고에 있겠네.",
        "W: 그리고 그게 어디 있는지 아는 사람이 없어.",
        "M: 이번 학기에 내가 두 번 꺼냈어.",
        "W: 창고는 세 시 반에 잠가.",
        "M: 지금 세 시 20분이야.",
        "W: 그럼 당장 가야겠네.",
        "M: 다른 사람 찾을 틈도 없어.",
        "W: 나는 물병 놓는 걸 마무리할게.",
        "M: 내가 가서 점수판을 가져올게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 여자가 지불할 금액을 고르시오.",
      lines: [
        ["M", "Welcome to the sports shop. What can I get you?"],
        ["W", "Four shuttlecock tubes and two grips, please."],
        ["M", "The tubes are eight dollars each this week."],
        ["W", "Were they not six dollars in September?"],
        ["M", "They were, but the supplier raised the price."],
        ["W", "Then I'll take four anyway."],
        ["M", "And the grips are four dollars each."],
        ["W", "Is there a cheaper grip than that?"],
        ["M", "There's a two-dollar one, but it wears out in a month."],
        ["W", "I'll take the better ones, then."],
        ["M", "Are you buying for a school club?"],
        ["W", "The badminton club. Here's the club card."],
        ["M", "School clubs get ten percent off the total."],
        ["W", "Good. I'll pay in cash."],
      ],
      choices: ["$32.00", "$36.00", "$38.00", "$40.00", "$44.00"],
      answer: 2,
      clue: "The tubes are eight dollars each this week.",
      explanation:
        "셔틀콕 4통 32달러와 손잡이 2개 8달러로 40달러인데, 10퍼센트를 빼면 36달러이다. 따라서 답은 ②이다.",
      translation: [
        "M: 운동용품점에 오신 걸 환영합니다. 무엇을 드릴까요?",
        "W: 셔틀콕 네 통과 손잡이 두 개 주세요.",
        "M: 셔틀콕은 이번 주에 한 통에 8달러입니다.",
        "W: 9월에는 6달러 아니었나요?",
        "M: 맞는데 납품 값이 올랐어요.",
        "W: 그래도 네 통 주세요.",
        "M: 그리고 손잡이는 하나에 4달러입니다.",
        "W: 그보다 싼 건 없나요?",
        "M: 2달러짜리가 있는데 한 달이면 닳아요.",
        "W: 그럼 좋은 걸로 할게요.",
        "M: 학교 동아리에서 사시는 건가요?",
        "W: 배드민턴부요. 여기 동아리 카드입니다.",
        "M: 학교 동아리는 전체에서 10퍼센트 할인됩니다.",
        "W: 좋네요. 현금으로 낼게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 남자가 연습 시간을 옮긴 이유를 고르시오.",
      lines: [
        ["W", "Sangwoo, the club practises in the morning now?"],
        ["W", "You've had the four o'clock slot since March."],
        ["M", "We did, and it suited everyone."],
        ["W", "Did another club take the slot?"],
        ["M", "No, four o'clock is still ours on paper."],
        ["W", "Is the gymnasium warmer in the morning?"],
        ["M", "It's colder, if anything."],
        ["W", "Then why did you move it?"],
        ["M", "Six of our eleven members have extra classes at five."],
        ["W", "So they were leaving halfway through."],
        ["M", "A practice with half the team is not a practice."],
        ["W", "Then the morning is the only hour that works."],
      ],
      choices: [
        "회원 절반이 중간에 빠져서",
        "다른 동아리가 시간을 가져가서",
        "체육관이 추워서",
        "선생님이 바꾸라고 하셔서",
        "회원이 줄어서",
      ],
      answer: 1,
      clue: "Six of our eleven members have extra classes at five.",
      explanation:
        "회원 여섯 명이 다섯 시에 빠져나가 연습이 되지 않았다. 따라서 답은 ①이다.",
      translation: [
        "W: 상우야, 동아리 연습을 이제 아침에 해?",
        "W: 3월부터 네 시 시간을 썼잖아.",
        "M: 그랬지, 다들 괜찮았어.",
        "W: 다른 동아리가 그 시간을 가져갔어?",
        "M: 아니, 네 시는 서류상 아직 우리 거야.",
        "W: 아침에 체육관이 더 따뜻해?",
        "M: 오히려 더 추워.",
        "W: 그럼 왜 옮겼어?",
        "M: 열한 명 중 여섯이 다섯 시에 수업이 있어.",
        "W: 그럼 중간에 나가 버렸겠네.",
        "M: 절반으로 하는 연습은 연습이 아니야.",
        "W: 그럼 아침밖에 답이 없네.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 교내 체육 대회에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["M", "Yeji, is the sports day going ahead this year?"],
        ["M", "The letter came home with us on Friday."],
        ["W", "It's held on the school field this time."],
        ["M", "Not at the city stadium?"],
        ["W", "The field, because the stadium was booked."],
        ["M", "When is it?"],
        ["W", "The thirteenth of November, from nine to three."],
        ["M", "What events are there?"],
        ["W", "Five, including the relay and the tug of war."],
        ["M", "How many students in a team?"],
        ["W", "Twenty, and each class makes two teams."],
        ["M", "Do we need anything special to wear?"],
        ["W", "Sports clothes, and trainers you can run in."],
        ["M", "Then I'll ask my brother for his old ones."],
      ],
      choices: ["열리는 곳", "열리는 날과 시각", "종목", "한 팀의 인원", "상품"],
      answer: 5,
      clue: "The thirteenth of November, from nine to three.",
      explanation:
        "장소, 날짜와 시각, 종목, 인원은 말했지만 상품은 말하지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 예지야, 올해 체육 대회 해?",
        "M: 금요일에 가정통신문 받았잖아.",
        "W: 이번에는 학교 운동장에서 해.",
        "M: 시립 경기장이 아니고?",
        "W: 경기장이 예약돼 있어서 운동장에서 해.",
        "M: 언제야?",
        "W: 11월 13일, 아홉 시부터 세 시까지.",
        "M: 종목은 뭐가 있어?",
        "W: 이어달리기랑 줄다리기까지 다섯 가지.",
        "M: 한 팀에 몇 명이야?",
        "W: 스무 명, 반마다 두 팀을 만들어.",
        "M: 따로 입어야 할 게 있어?",
        "W: 운동복이랑 뛸 수 있는 운동화.",
        "M: 그럼 형한테 신던 거 달라고 해야겠다.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "다음을 듣고, 겨울 체력 교실에 관한 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "M",
          "Hello, students. Here are the details of the winter fitness class. " +
            "It runs for six weeks, beginning on the eighth of January. " +
            "Classes are on Monday and Thursday mornings from ten until eleven. " +
            "Thirty students are taken, fifteen in each of two groups. " +
            "The class is held in the gymnasium, not outdoors. " +
            "Bring indoor trainers; outdoor shoes are not allowed on the floor. " +
            "There is no charge for the class or the equipment. " +
            "A short fitness check is done in the first week and the last. " +
            "Apply at the physical education office by the twenty-third of December.",
        ],
      ],
      choices: [
        "1월 8일부터 여섯 주 동안 한다",
        "월요일과 목요일 오전에 한다",
        "서른 명을 받는다",
        "운동장에서 한다",
        "참가비가 없다",
      ],
      answer: 4,
      clue: "The class is held in the gymnasium, not outdoors.",
      explanation:
        "바깥이 아니라 체육관에서 한다고 했으므로 ④가 일치하지 않는다.",
      translation: [
        "M: 학생 여러분, 안녕하세요. 겨울 체력 교실을 안내합니다. 1월 8일부터 여섯 주 동안 진행합니다. 수업은 월요일과 목요일 오전 열 시부터 열한 시까지입니다. 서른 명을 받고, 두 반에 열다섯 명씩 나눕니다. 수업은 바깥이 아니라 체육관에서 합니다. 실내화를 가져오세요. 바깥 신발로는 바닥에 올라올 수 없습니다. 수업비도 기구 사용료도 없습니다. 첫 주와 마지막 주에 간단한 체력 검사를 합니다. 12월 23일까지 체육부실에서 신청해 주세요.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 남자가 예약할 체육관 시간을 고르시오.",
      lines: [
        ["W", "Taekyung, which gymnasium slot will your club take?"],
        ["M", "Five are still free for next term."],
        ["W", "I saw the new timetable on the door."],
        ["M", "They all run for one hour."],
        ["W", "Can your members come in the morning?"],
        ["M", "Six of them have classes until noon."],
        ["W", "Then the morning slots are out."],
        ["M", "Two of these five are in the morning."],
        ["W", "How many courts do you need?"],
        ["M", "Two, or half the club stands and watches."],
        ["W", "One of the rest gives you a single court."],
        ["M", "And it can't be on Friday, because of the bus."],
        ["W", "That takes out one more of them."],
        ["M", "Then there's only one slot left."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "Six of them have classes until noon.",
      explanation:
        "오후이고, 코트가 둘이며, 금요일이 아닌 시간은 ④이다. 따라서 답은 ④이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Time: Morning / Courts: 2 / Day: Tuesday" },
          { no: 2, label: "②", value: "Time: Morning / Courts: 1 / Day: Thursday" },
          { no: 3, label: "③", value: "Time: Afternoon / Courts: 1 / Day: Tuesday" },
          { no: 4, label: "④", value: "Time: Afternoon / Courts: 2 / Day: Wednesday" },
          { no: 5, label: "⑤", value: "Time: Afternoon / Courts: 2 / Day: Friday" },
        ],
      },
      translation: [
        "W: 태경아, 동아리는 체육관 어느 시간을 잡을 거야?",
        "M: 다음 학기에 다섯 자리가 아직 비어 있어.",
        "W: 문에 붙은 새 시간표를 봤어.",
        "M: 다 한 시간짜리야.",
        "W: 회원들이 오전에 올 수 있어?",
        "M: 여섯 명은 정오까지 수업이 있어.",
        "W: 그럼 오전은 빠지네.",
        "M: 이 다섯 중 두 개가 오전이야.",
        "W: 코트는 몇 개 필요해?",
        "M: 두 개, 아니면 절반은 서서 구경해.",
        "W: 나머지 중 하나는 코트가 하나뿐이야.",
        "M: 그리고 버스 때문에 금요일은 안 돼.",
        "W: 그럼 하나가 더 빠지네.",
        "M: 그럼 남는 자리는 하나뿐이야.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Did your club send the numbers to the department?"],
        ["M", "I didn't know we had to send anything."],
        ["W", "Members and hours, by Friday."],
        ["M", "Then I'd better write it tonight."],
        ["W", "Shall I forward you the notice?"],
      ],
      choices: [
        "Yes, please send it over.",
        "Our club closed last year.",
        "The gymnasium is full.",
        "Friday has already passed.",
        "We have no members.",
      ],
      answer: 1,
      clue: "Shall I forward you the notice?",
      explanation:
        "알림을 보내 주겠다는 제안이므로, 보내 달라는 ①이 가장 자연스럽다.",
      translation: [
        "W: 너희 동아리는 체육부에 숫자 보냈어?",
        "M: 뭘 보내야 하는 줄도 몰랐어.",
        "W: 회원 수랑 쓰는 시간, 금요일까지.",
        "M: 그럼 오늘 밤에 적어야겠다.",
        "W: 알림을 보내 줄까?",
        "M: 응, 보내 줘.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Excuse me, can I wear these shoes in the gymnasium?"],
        ["W", "Outdoor shoes aren't allowed on the floor."],
        ["M", "I didn't bring anything else with me."],
        ["W", "Then you can watch from the bench today."],
        ["M", "What kind of shoes should I bring next time?"],
      ],
      choices: [
        "Any shoes will do.",
        "Indoor trainers with clean soles.",
        "You can't come back.",
        "The floor is being replaced.",
        "Shoes are not needed.",
      ],
      answer: 2,
      clue: "What kind of shoes should I bring next time?",
      explanation:
        "어떤 신발을 가져와야 하는지 물었으므로, 바닥이 깨끗한 실내화라는 ②가 가장 자연스럽다.",
      translation: [
        "M: 실례합니다, 이 신발 신고 체육관에 들어가도 되나요?",
        "W: 바깥 신발로는 바닥에 올라올 수 없어요.",
        "M: 다른 걸 안 가져왔는데요.",
        "W: 그럼 오늘은 의자에 앉아서 보세요.",
        "M: 다음에는 어떤 신발을 가져와야 하나요?",
        "W: 바닥이 깨끗한 실내화요.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Chaerin, how did the club's practice matches go?"],
        ["W", "We played eight and lost seven of them."],
        ["M", "Were the other schools much stronger?"],
        ["W", "We beat two of them last year."],
        ["M", "Did you practise less this term?"],
        ["W", "Twice a week, the same as always."],
        ["M", "What do you do in those two hours?"],
        ["W", "We play a full match every single time."],
        ["M", "So you never work on one thing alone."],
        ["W", "Matches are what everybody wants to do."],
        ["M", "What could the first half hour be used for?"],
      ],
      choices: [
        "Another full match.",
        "Drills on one weak shot.",
        "A longer warm-up run.",
        "Choosing the team captain.",
        "Watching a recorded game.",
      ],
      answer: 2,
      clue: "What could the first half hour be used for?",
      explanation:
        "늘 경기만 해서 한 가지를 따로 익히지 못했으므로, 약한 기술을 집중 연습하는 ②가 가장 자연스럽다.",
      translation: [
        "M: 채린아, 동아리 연습 경기는 어땠어?",
        "W: 여덟 번 해서 일곱 번 졌어.",
        "M: 상대 학교가 훨씬 셌어?",
        "W: 작년에는 그중 둘을 이겼어.",
        "M: 이번 학기에 연습을 덜 했어?",
        "W: 주 두 번, 늘 하던 대로야.",
        "M: 그 두 시간에 뭘 해?",
        "W: 매번 경기를 한 판씩 해.",
        "M: 그럼 한 가지만 따로 익힌 적이 없네.",
        "W: 다들 하고 싶은 건 경기니까.",
        "M: 앞의 30분은 뭘 하면 좋을까?",
        "W: 약한 기술 하나를 정해서 반복 연습을 하자.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Kyuhyun, you said you can't get up in the morning."],
        ["M", "I set four alarms and sleep through all of them."],
        ["W", "Where is your phone when you sleep?"],
        ["M", "On the pillow beside my head."],
        ["W", "So you can turn it off without waking up."],
        ["M", "My hand does it before I know anything."],
        ["W", "Four alarms in the same place is really one alarm."],
        ["M", "I've been adding more of the same thing."],
        ["W", "The number was never the problem."],
        ["M", "So it isn't how loud or how many."],
        ["W", "What would you change about it tonight?"],
      ],
      choices: [
        "I'll set six alarms instead.",
        "I'll put the phone across the room.",
        "I'll sleep an hour earlier.",
        "I'll buy a louder alarm.",
        "I'll stop setting alarms.",
      ],
      answer: 2,
      clue: "What would you change about it tonight?",
      explanation:
        "손이 닿는 자리가 문제였으므로, 방 건너편에 두겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 규현아, 아침에 못 일어난다고 했잖아.",
        "M: 알람을 네 개 맞추는데 다 자면서 넘겨.",
        "W: 잘 때 휴대폰을 어디에 둬?",
        "M: 머리 옆 베개 위에.",
        "W: 그럼 깨지 않고도 끌 수 있네.",
        "M: 손이 내가 알기도 전에 꺼.",
        "W: 같은 자리의 알람 네 개는 사실 하나야.",
        "M: 같은 걸 계속 더하고 있었네.",
        "W: 개수는 애초에 문제가 아니었어.",
        "M: 그러니까 얼마나 크냐 몇 개냐가 아니구나.",
        "W: 오늘 밤에는 뭘 바꿔 볼 거야?",
        "M: 휴대폰을 방 건너편에 둘게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Hyewon이 Jaeho에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Hyewon : ________________",
      lines: [
        [
          "W",
          "Hyewon and Jaeho are putting the equipment away after the match. " +
            "Jaeho is pushing the balls into the rack while they are still wet, " +
            "because the court was watered before the second half. " +
            "The rack stands against the back wall of the store, which has no window. " +
            "Hyewon knows that balls left wet in that room come out mouldy, " +
            "and the club cannot buy a new set before the spring. " +
            "There is a pile of dry towels on the bench beside him. " +
            "She wants him to wipe each ball before racking it. " +
            "In this situation, what would Hyewon most likely say to Jaeho?",
        ],
      ],
      choices: [
        "We should water the court again.",
        "Wipe the balls before you rack them.",
        "Leave the balls on the court.",
        "The match starts in an hour.",
        "We need a bigger rack.",
      ],
      answer: 2,
      clue: "She wants him to wipe each ball before racking it.",
      explanation:
        "젖은 채 넣으면 곰팡이가 슬므로, 닦고 넣으라는 ②가 가장 적절하다.",
      translation: [
        "W: 혜원이와 재호는 경기가 끝난 뒤 기구를 치우고 있습니다. 재호는 공이 아직 젖은 채로 선반에 밀어 넣고 있습니다. 후반전 전에 코트에 물을 뿌렸기 때문입니다. 그 선반은 창문이 없는 창고 뒷벽에 붙어 있습니다. 혜원이는 그 방에 젖은 채 둔 공에 곰팡이가 슨다는 것과, 동아리가 봄이 되기 전에는 새것을 살 수 없다는 것을 압니다. 그의 옆 의자에는 마른 수건이 쌓여 있습니다. 그는 공을 하나씩 닦고 넣기를 바랍니다. 이런 상황에서 혜원이가 재호에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 남자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Hello, everyone. Today I want to talk about why a crowd " +
            "can be better at guessing than any single person in it. " +
            "Ask eight hundred people the weight of an ox at a country fair, " +
            "and the average of their guesses will sit within a pound of the truth, " +
            "although almost nobody guessed it correctly on their own. " +
            "The reason is that wrong guesses are wrong in both directions. " +
            "One person guesses far too high, another far too low, " +
            "and the errors cancel each other out when the guesses are added. " +
            "This only works while people guess on their own. " +
            "Let them hear one another first, and every guess drifts towards the loudest.",
        ],
      ],
      choices: [
        "why independent guesses average out to the truth",
        "how farmers judge the weight of animals",
        "why country fairs were once popular",
        "how loud speakers persuade a crowd",
        "why averages are used in science",
      ],
      answer: 1,
      clue: "the errors cancel each other out when the guesses are added",
      explanation:
        "따로따로 한 어림의 오차가 서로 상쇄되어 참값에 가까워진다는 것이 중심 내용이다. 따라서 답은 ①이다.",
      translation: [
        "M: 여러분, 안녕하세요. 오늘은 무리가 그 안의 어느 한 사람보다 어림을 잘하는 까닭을 이야기하려 합니다. 시골 장터에서 팔백 명에게 소의 무게를 물으면, 그 어림의 평균은 참값에서 한 파운드 안에 들어옵니다. 혼자서 맞힌 사람은 거의 없는데도 그렇습니다. 까닭은 틀린 어림이 양쪽으로 틀리기 때문입니다. 한 사람은 훨씬 높게, 다른 사람은 훨씬 낮게 어림하고, 그것을 모두 더하면 오차가 서로 지워집니다. 이것은 사람들이 저마다 따로 어림할 때만 됩니다. 서로의 말을 먼저 듣게 하면, 모든 어림이 가장 목소리 큰 쪽으로 쏠립니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "다음을 듣고, 언급된 것이 아닌 것을 고르시오.",
      lines: [
        ["M", "Ask eight hundred people the weight of an ox at a country fair."],
        ["M", "The average of their guesses will sit within a pound of the truth."],
        ["M", "One person guesses far too high, another far too low."],
        ["M", "This only works while people guess on their own."],
        ["M", "Every guess drifts towards the loudest."],
      ],
      choices: ["an ox", "a country fair", "the average", "a pound", "a farmer"],
      answer: 5,
      clue: "Ask eight hundred people the weight of an ox at a country fair.",
      explanation:
        "소, 시골 장터, 평균, 파운드는 언급되지만 농부는 나오지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
