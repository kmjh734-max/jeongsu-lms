/** 고3 듣기 32회 — 사람이 직접 쓴 회차 (2026-09-29) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고3 32회",
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
          "Good afternoon, third year students. This is Ms. Ryu from the admissions office. " +
            "I am speaking about the reference letters you will need this autumn. " +
            "Every year a number of you ask a teacher three days before a deadline, " +
            "and a letter written in one evening reads exactly like a letter written in one evening. " +
            "From this week there is a request form outside my room. " +
            "Fill it in at least three weeks before the date you need the letter, " +
            "and attach a single page about what you have actually done. " +
            "Teachers cannot remember every project you finished two years ago. " +
            "Help them remember, and the letter will sound like you. Thank you.",
        ],
      ],
      choices: [
        "추천서 요청 방법을 안내하려고",
        "원서 접수 일정을 알리려고",
        "면접 연습을 권하려고",
        "자기소개서 작성법을 설명하려고",
        "상담 신청을 받으려고",
      ],
      answer: 1,
      clue: "Fill it in at least three weeks before the date you need the letter.",
      explanation:
        "여자는 추천서를 언제 어떻게 요청해야 하는지 안내한다. 따라서 답은 ①이다.",
      translation: [
        "W: 3학년 여러분, 안녕하세요. 입학 지원 담당 류 선생님입니다. 이번 가을에 필요할 추천서에 대해 말씀드립니다. 해마다 여러 명이 마감 사흘 전에 선생님께 부탁하는데, 하루 저녁에 쓴 편지는 딱 하루 저녁에 쓴 편지처럼 읽힙니다. 이번 주부터 제 방 앞에 요청서를 두었습니다. 편지가 필요한 날짜보다 적어도 세 주 앞서 작성해 주시고, 여러분이 실제로 해 온 일을 한 쪽으로 정리해 함께 내 주세요. 선생님들이 2년 전에 여러분이 끝낸 과제를 모두 기억하지는 못합니다. 기억하시게 도와 드리면 그 편지는 여러분처럼 들릴 것입니다. 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 남자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Junho, I've rewritten my personal statement nine times."],
        ["M", "Nine full versions, or nine passes over the same one?"],
        ["W", "Nine versions, and each one sounds like a different person."],
        ["M", "Who were you writing for each time?"],
        ["W", "Whoever I imagined reading it that week."],
        ["M", "That's why there are nine of them."],
        ["W", "So I should stop imagining the reader?"],
        ["M", "Write it once for somebody who already knows you."],
        ["W", "A teacher, or a friend?"],
        ["M", "Anyone who would notice if a sentence were not true."],
        ["W", "And then adjust it for the actual reader afterwards."],
        ["M", "Adjusting an honest page is work. Inventing a person is not."],
      ],
      choices: [
        "자기소개서는 여러 번 고쳐 써야 한다",
        "자기소개서는 자기를 아는 사람에게 쓰듯 써야 한다",
        "자기소개서에는 성과를 많이 담아야 한다",
        "자기소개서는 선생님이 봐 주어야 한다",
        "자기소개서는 일찍 시작해야 한다",
      ],
      answer: 2,
      clue: "Write it once for somebody who already knows you.",
      explanation:
        "남자는 상상 속 독자를 바꾸지 말고 자기를 아는 사람에게 쓰듯 한 번 쓰라고 말한다. 따라서 답은 ②이다.",
      translation: [
        "W: 준호야, 자기소개서를 아홉 번이나 다시 썼어.",
        "M: 아홉 판을 새로 쓴 거야, 같은 걸 아홉 번 훑은 거야?",
        "W: 아홉 판이야. 그런데 다 다른 사람 같아.",
        "M: 매번 누구를 생각하며 썼어?",
        "W: 그 주에 읽을 거라고 상상한 사람.",
        "M: 그래서 아홉 개가 된 거야.",
        "W: 그럼 독자를 상상하지 말라는 거야?",
        "M: 이미 너를 아는 사람에게 쓰듯 한 번 써.",
        "W: 선생님이나 친구?",
        "M: 어떤 문장이 사실이 아니면 알아챌 사람.",
        "W: 그러고 나서 실제 독자에 맞게 다듬으라는 거구나.",
        "M: 솔직한 글을 다듬는 건 일이야. 사람을 지어내는 건 일이 아니고.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "In the last months before an examination, almost everyone studies longer. " +
            "Far fewer people study differently. " +
            "Another hour spent the same way produces the same result it always did, " +
            "and by November there are no more hours left to add. " +
            "So audit the method, not the clock. " +
            "Where does the time actually go? Which forty minutes taught you nothing? " +
            "One honest week of watching yourself work " +
            "will tell you more than a month of adding hours to the end of the day.",
        ],
      ],
      choices: [
        "공부 시간을 늘려야 한다",
        "공부 방법을 점검해야 한다",
        "잠을 충분히 자야 한다",
        "과목을 골라 공부해야 한다",
        "친구와 함께 공부해야 한다",
      ],
      answer: 2,
      clue: "So audit the method, not the clock.",
      explanation:
        "여자는 시간을 늘리기보다 공부 방법을 점검하라고 말한다. 따라서 답은 ②이다.",
      translation: [
        "W: 시험을 앞둔 마지막 몇 달에 거의 모두가 더 오래 공부합니다. 다르게 공부하는 사람은 훨씬 적습니다. 같은 방식으로 한 시간을 더 쓰면 늘 나오던 결과가 그대로 나오고, 11월이 되면 더 붙일 시간도 없습니다. 그러니 시계가 아니라 방법을 점검하세요. 시간이 실제로 어디로 가는가? 아무것도 가르쳐 주지 않은 40분은 어디였는가? 자신이 공부하는 모습을 솔직하게 지켜본 한 주가, 하루 끝에 시간을 붙여 온 한 달보다 더 많은 것을 알려 줄 것입니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["M", "Seoyeon, is this the third year study room?"],
        ["W", "Yes, it opened again after the summer."],
        ["M", "Rows of single desks fill the middle of the room."],
        ["W", "Each one has its own small lamp."],
        ["M", "There's a wide clock on the back wall."],
        ["W", "We can see it from every seat, which was the point."],
        ["M", "A water cooler stands in the left corner."],
        ["W", "It is refilled twice a day now."],
        ["M", "I count three windows along the right wall."],
        ["W", "There are two. The third opening is a doorway."],
        ["M", "And a noticeboard hangs beside the entrance."],
        ["W", "The examination dates go up on it in October."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "There are two. The third opening is a doorway.",
      explanation:
        "남자가 창문이 세 개라고 하자 여자가 두 개라고 바로잡는다. 그림에는 세 개가 그려져 있으므로 답은 ④이다.",
      figure: {
        kind: "figure5",
        spots: [
          [0.45, 0.6],
          [0.5, 0.07],
          [0.07, 0.42],
          [0.86, 0.3],
          [0.2, 0.12],
        ],
        scene:
          "A school study room drawn as one wide picture, clean black line art on white, no writing or letters or numbers anywhere. " +
          "ROWS OF SINGLE DESKS, each with a small desk lamp, fill the MIDDLE of the room. " +
          "A WIDE RECTANGULAR WALL CLOCK hangs on the BACK wall in the upper middle. " +
          "A WATER COOLER with a bottle on top stands in the LEFT corner. " +
          "EXACTLY THREE TALL WINDOWS are drawn in a row along the RIGHT wall, " +
          "evenly spaced and clearly separated so all three can be counted. " +
          "A RECTANGULAR NOTICEBOARD hangs on the wall beside the entrance at the upper left.",
      },
      translation: [
        "M: 서연아, 여기가 3학년 자습실이야?",
        "W: 응, 여름 지나고 다시 열었어.",
        "M: 가운데를 1인용 책상 줄이 채우고 있네.",
        "W: 책상마다 작은 등이 하나씩 있어.",
        "M: 뒷벽에는 넓은 시계가 있고.",
        "W: 어느 자리에서나 보여. 그게 목적이었어.",
        "M: 왼쪽 구석에는 정수기가 있네.",
        "W: 요즘은 하루에 두 번 채워.",
        "M: 오른쪽 벽을 따라 창문이 세 개 보여.",
        "W: 두 개야. 세 번째로 보이는 건 출입구야.",
        "M: 그리고 입구 옆에 게시판이 걸려 있어.",
        "W: 10월이 되면 거기에 시험 날짜가 붙어.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 여자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Chaewon, the university fair is on Saturday morning."],
        ["W", "Have all the universities confirmed a table?"],
        ["M", "Eighteen of the twenty. The last two answered yesterday."],
        ["W", "What about the students who signed up to help?"],
        ["M", "Twelve of them, and they know their shifts."],
        ["W", "Then the main pieces are ready."],
        ["M", "Except the signs. Nobody has made the table numbers."],
        ["W", "Can't the visitors just walk round and look?"],
        ["M", "Six hundred people are coming through one door."],
        ["W", "Without numbers nobody would find anything."],
        ["M", "And the hall opens at nine sharp."],
        ["W", "I'll make the table number signs this afternoon."],
      ],
      choices: [
        "대학에 연락하기",
        "도우미를 모으기",
        "탁자 번호 표지를 만들기",
        "강당을 예약하기",
        "안내문을 보내기",
      ],
      answer: 3,
      clue: "I'll make the table number signs this afternoon.",
      explanation:
        "여자는 오늘 오후에 탁자 번호 표지를 만들겠다고 말한다. 따라서 답은 ③이다.",
      translation: [
        "M: 채원아, 대학 박람회가 토요일 아침이야.",
        "W: 대학들 자리는 다 확정됐어?",
        "M: 스무 곳 중 열여덟. 나머지 두 곳도 어제 답을 줬어.",
        "W: 돕겠다고 한 학생들은?",
        "M: 열두 명. 각자 맡은 시간도 알아.",
        "W: 그럼 큰 건 다 됐네.",
        "M: 표지만 빼고. 탁자 번호를 아무도 안 만들었어.",
        "W: 그냥 돌아다니면서 보면 안 돼?",
        "M: 한 문으로 600명이 들어와.",
        "W: 번호가 없으면 아무도 못 찾겠다.",
        "M: 게다가 강당은 아홉 시 정각에 열어.",
        "W: 오늘 오후에 탁자 번호 표지 만들게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 남자가 지불할 금액을 고르시오.",
      lines: [
        ["W", "Good afternoon. Are you here about the class yearbook?"],
        ["M", "Yes, I'd like to order copies for our class."],
        ["W", "A soft cover copy is twelve dollars."],
        ["M", "And a hard cover one?"],
        ["W", "Eighteen dollars each."],
        ["M", "Four soft covers and two hard covers, please."],
        ["W", "Would you like the names printed on the front?"],
        ["M", "How much does that add?"],
        ["W", "Two dollars for each copy with a name."],
        ["M", "Put a name on the two hard covers only."],
        ["W", "And orders over eighty dollars get five dollars off."],
        ["M", "Here is my card, then."],
      ],
      choices: ["$83", "$88", "$78", "$85", "$90"],
      answer: 1,
      clue: "A soft cover copy is twelve dollars.",
      explanation:
        "부드러운 표지 네 권 48달러와 단단한 표지 두 권 36달러, 이름 두 권분 4달러를 더하면 88달러이고, 5달러를 빼면 83달러이다. 따라서 답은 ①이다.",
      translation: [
        "W: 안녕하세요. 학급 앨범 때문에 오셨나요?",
        "M: 네, 우리 반 것을 주문하려고요.",
        "W: 부드러운 표지는 한 권에 12달러입니다.",
        "M: 단단한 표지는요?",
        "W: 한 권에 18달러입니다.",
        "M: 부드러운 표지 네 권, 단단한 표지 두 권 주세요.",
        "W: 앞면에 이름을 찍어 드릴까요?",
        "M: 그러면 얼마가 더 붙나요?",
        "W: 이름을 넣는 권마다 2달러입니다.",
        "M: 단단한 표지 두 권에만 넣어 주세요.",
        "W: 그리고 80달러가 넘는 주문은 5달러를 빼 드립니다.",
        "M: 그럼 여기 카드요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 여자가 모의고사를 다시 보려는 이유를 고르시오.",
      lines: [
        ["M", "Hayoon, you're taking the mock test again on Saturday?"],
        ["W", "The same paper, at the same time of day."],
        ["M", "Was your score lower than you expected?"],
        ["W", "It was about what I expected, actually."],
        ["M", "Then did you leave some questions unanswered?"],
        ["W", "I answered everything. I just answered it far too slowly."],
        ["M", "So the marks were fine but the timing was not."],
        ["W", "I had nine minutes left for the last twelve questions."],
        ["M", "And you want to see whether that changes."],
        ["W", "The paper is the only way to measure it honestly."],
      ],
      choices: [
        "점수가 낮아서",
        "문제를 다 못 풀어서",
        "시간 배분을 확인하려고",
        "새 문제를 풀어 보려고",
        "선생님이 권해서",
      ],
      answer: 3,
      clue: "I answered everything. I just answered it far too slowly.",
      explanation:
        "여자는 점수보다 시간 배분을 확인하려고 같은 시험을 다시 본다고 말한다. 따라서 답은 ③이다.",
      translation: [
        "M: 하윤아, 토요일에 모의고사를 또 봐?",
        "W: 같은 시험지를 같은 시간대에.",
        "M: 점수가 생각보다 낮았어?",
        "W: 사실 예상한 대로였어.",
        "M: 그럼 못 푼 문제가 있었어?",
        "W: 다 풀었어. 다만 너무 느리게 풀었어.",
        "M: 점수는 괜찮은데 시간이 문제였구나.",
        "W: 마지막 열두 문제에 9분이 남아 있었어.",
        "M: 그게 달라지는지 보고 싶은 거네.",
        "W: 그걸 솔직하게 재는 방법은 같은 시험지뿐이야.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 교내 자기소개서 특강에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["M", "Dain, are you going to the personal statement workshop?"],
        ["W", "I want to, but I only saw the poster in passing."],
        ["M", "It runs on three afternoons, the fourth, the sixth and the eighth."],
        ["W", "Do we have to attend all three?"],
        ["M", "All three, because each one builds on the last."],
        ["W", "Where is it held?"],
        ["M", "In the seminar room beside the careers office."],
        ["W", "Do we need to bring anything with us?"],
        ["M", "A draft, however rough, and something to write with."],
        ["W", "How many students can join?"],
        ["M", "Twenty-five, and about half the places have gone."],
      ],
      choices: ["특강 날짜", "참석해야 하는 횟수", "특강 장소", "가져가야 할 것", "강사가 누구인지"],
      answer: 5,
      clue: "It runs on three afternoons, the fourth, the sixth and the eighth.",
      explanation:
        "날짜, 횟수, 장소, 준비물은 말했지만 강사는 말하지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 다인아, 자기소개서 특강 갈 거야?",
        "W: 가고 싶은데 지나가며 포스터만 봤어.",
        "M: 오후에 세 번 해. 4일, 6일, 8일.",
        "W: 세 번 다 가야 해?",
        "M: 세 번 다. 앞 내용을 이어서 하거든.",
        "W: 어디서 해?",
        "M: 진로실 옆 세미나실에서.",
        "W: 뭘 가져가야 해?",
        "M: 아무리 엉성해도 초고 하나랑 필기구.",
        "W: 몇 명이나 들을 수 있어?",
        "M: 스물다섯 명. 절반쯤 찼어.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Hanbit University Open Day에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "M",
          "Here is some information about the Hanbit University Open Day, held next month. " +
            "The event takes place on Saturday the fourteenth, from ten until four. " +
            "Visitors gather first in the main hall of the science building. " +
            "Each department runs a talk of forty minutes, repeated three times during the day. " +
            "Current students lead tours of the library and the residence halls. " +
            "Lunch is not provided, but the two campus cafés stay open. " +
            "Booking is required, and the form closes one week beforehand. " +
            "Parents are welcome, and there is no limit on how many may come with each student.",
        ],
      ],
      choices: [
        "14일 토요일에 열린다",
        "과학관 대강당에 먼저 모인다",
        "학과 설명은 하루에 세 번 반복된다",
        "점심이 제공된다",
        "일주일 전에 신청이 마감된다",
      ],
      answer: 4,
      clue: "Lunch is not provided, but the two campus cafés stay open.",
      explanation:
        "점심은 제공되지 않는다고 했으므로 ④가 일치하지 않는다.",
      translation: [
        "M: 다음 달에 열리는 한빛대학교 개방일에 대해 알려 드립니다. 행사는 14일 토요일 열 시부터 네 시까지 진행됩니다. 방문객은 먼저 과학관 대강당에 모입니다. 각 학과는 40분짜리 설명을 하루에 세 번 되풀이합니다. 재학생들이 도서관과 기숙사를 안내합니다. 점심은 제공되지 않지만 교내 카페 두 곳은 문을 엽니다. 예약이 필요하며 신청서는 일주일 전에 마감합니다. 학부모도 오실 수 있고 학생마다 몇 분이 함께 오시든 제한이 없습니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 신청할 모의 면접 시간을 고르시오.",
      lines: [
        ["W", "Sangwoo, five mock interview slots are still open."],
        ["M", "We've been meaning to book one since last week."],
        ["W", "Then let's do it now. Which day can you come?"],
        ["M", "Not Friday. I have the science make-up test."],
        ["W", "Two of these are on Friday."],
        ["M", "Then they're out. How long is each session?"],
        ["W", "From twenty minutes up to an hour."],
        ["M", "Anything under thirty minutes is too short to be useful."],
        ["W", "One of the three left is twenty minutes."],
        ["M", "And I'd like one with two interviewers, not one."],
        ["W", "One of the last two has a single interviewer."],
        ["M", "So there's only one slot for us."],
        ["W", "I'll book it before somebody else takes it."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "Not Friday. I have the science make-up test.",
      explanation:
        "금요일이 아니고, 30분 이상이며, 면접관이 두 명인 시간을 고른다. 세 조건을 모두 채우는 것은 ③이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Day: Friday / Length: 40 min / Interviewers: 2" },
          { no: 2, label: "②", value: "Day: Friday / Length: 60 min / Interviewers: 1" },
          { no: 3, label: "③", value: "Day: Wednesday / Length: 45 min / Interviewers: 2" },
          { no: 4, label: "④", value: "Day: Tuesday / Length: 20 min / Interviewers: 2" },
          { no: 5, label: "⑤", value: "Day: Thursday / Length: 30 min / Interviewers: 1" },
        ],
      },
      translation: [
        "W: 상우야, 모의 면접 시간이 다섯 개 남아 있어.",
        "M: 지난주부터 예약하려고 했잖아.",
        "W: 그럼 지금 하자. 무슨 요일에 올 수 있어?",
        "M: 금요일은 안 돼. 과학 재시험이 있어.",
        "W: 두 개가 금요일이야.",
        "M: 그럼 빠지네. 한 번에 몇 분이야?",
        "W: 20분부터 한 시간까지.",
        "M: 30분 아래면 너무 짧아서 도움이 안 돼.",
        "W: 남은 셋 중 하나는 20분이야.",
        "M: 그리고 면접관이 한 명 말고 두 명이면 좋겠어.",
        "W: 남은 둘 중 하나는 면접관이 한 명이야.",
        "M: 그럼 우리한테 남는 건 하나뿐이네.",
        "W: 다른 사람이 가져가기 전에 예약할게.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Taemin, did you hand in the application form?"],
        ["M", "Not yet. One box is still empty."],
        ["W", "The office closes at four thirty today."],
        ["M", "I don't know which teacher signs that part."],
        ["W", "Shall I find out for you?"],
      ],
      choices: [
        "No, I already handed it in.",
        "Yes, please, I'll wait here.",
        "The office never closes.",
        "I don't need the form.",
        "You should fill it in.",
      ],
      answer: 2,
      clue: "Shall I find out for you?",
      explanation:
        "대신 알아봐 줄지 물었으므로, 여기서 기다리겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 태민아, 신청서 냈어?",
        "M: 아직. 한 칸이 비어 있어.",
        "W: 오늘 행정실이 4시 30분에 닫아.",
        "M: 그 부분에 어느 선생님이 서명하시는지 몰라.",
        "W: 내가 알아봐 줄까?",
        "M: 응, 부탁해. 나는 여기서 기다릴게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Chaeyeon, are you going to the third floor now?"],
        ["W", "In a few minutes, after I pack my bag."],
        ["M", "Could you take this file to the careers room?"],
        ["W", "Is my name on the front of it?"],
        ["M", "No, it's mine, and the teacher is expecting it."],
      ],
      choices: [
        "I'm not going upstairs.",
        "All right, give it to me.",
        "You should take it yourself.",
        "The careers room is closed.",
        "I lost your file.",
      ],
      answer: 2,
      clue: "No, it's mine, and the teacher is expecting it.",
      explanation:
        "선생님이 기다리는 서류라고 했으므로, 달라는 ②가 가장 자연스럽다.",
      translation: [
        "M: 채연아, 지금 3층 가?",
        "W: 가방 싸고 몇 분 뒤에.",
        "M: 이 서류 진로실에 좀 갖다줄래?",
        "W: 앞에 내 이름이 적혀 있어?",
        "M: 아니, 내 거야. 선생님이 기다리고 계셔.",
        "W: 알겠어, 나한테 줘.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Naeun, how is the interview practice going?"],
        ["W", "I answer well until they ask about my weaknesses."],
        ["M", "What do you say to that one?"],
        ["W", "That I work too hard, which nobody believes."],
        ["M", "Nobody believes it because it isn't a weakness."],
        ["W", "But naming a real one seems dangerous."],
        ["M", "Only if you stop at the naming."],
        ["W", "So the weakness isn't the answer."],
        ["M", "The answer is what you did about it."],
        ["W", "I did rebuild my whole revision plan in March."],
        ["M", "Then say that, and let the weakness carry the story."],
      ],
      choices: [
        "I have no weaknesses at all.",
        "That makes it much easier, I'll try it.",
        "The interview is cancelled.",
        "You should answer for me.",
        "Nobody asks about weaknesses.",
      ],
      answer: 2,
      clue: "The answer is what you did about it.",
      explanation:
        "약점 자체가 아니라 그에 대해 한 일을 말하라는 조언이므로, 해 보겠다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 나은아, 면접 연습은 어때?",
        "W: 약점을 물을 때까지는 잘 답해.",
        "M: 그 질문에 뭐라고 해?",
        "W: 너무 열심히 한다고. 아무도 안 믿어.",
        "M: 그건 약점이 아니니까 안 믿는 거야.",
        "W: 그렇다고 진짜 약점을 말하면 위험해 보여.",
        "M: 말하는 데서 멈출 때만 그래.",
        "W: 그럼 약점이 답이 아니구나.",
        "M: 답은 그것에 대해 네가 한 일이야.",
        "W: 3월에 복습 계획을 통째로 다시 짜긴 했어.",
        "M: 그걸 말하고 약점은 이야기를 끌고 가는 자리로 써.",
        "W: 그러면 훨씬 쉽겠다, 해 볼게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Junseo, you've been walking to school since September."],
        ["M", "Fifty minutes each way, along the river."],
        ["W", "In your final year? That's a lot of time."],
        ["M", "It was the best decision I made this term."],
        ["W", "How can an hour and a half a day be a good decision?"],
        ["M", "I used to arrive already tired from the crowded bus."],
        ["W", "And now?"],
        ["M", "Now the first two periods are the best of my day."],
        ["W", "My brother says the same about cycling."],
        ["M", "Anything that wakes you up seems to count double."],
        ["W", "Could I walk with you tomorrow?"],
      ],
      choices: [
        "Sure, I leave at seven fifteen.",
        "I take the bus now.",
        "The river path is closed.",
        "You can't walk that far.",
        "I stopped walking in September.",
      ],
      answer: 1,
      clue: "Could I walk with you tomorrow?",
      explanation:
        "여자가 내일 같이 걷자고 했으므로, 7시 15분에 출발한다는 ①이 가장 자연스럽다.",
      translation: [
        "W: 준서야, 9월부터 걸어서 학교 온다며.",
        "M: 강을 따라 편도 50분.",
        "W: 고3인데? 시간이 많이 드네.",
        "M: 이번 학기에 내린 결정 중에 제일 잘한 거야.",
        "W: 하루 한 시간 반이 어떻게 잘한 결정이야?",
        "M: 예전엔 붐비는 버스에서 이미 지쳐서 도착했어.",
        "W: 지금은?",
        "M: 지금은 1, 2교시가 하루 중 제일 좋아.",
        "W: 우리 오빠도 자전거 타면서 똑같이 말해.",
        "M: 잠을 깨우는 건 뭐든 두 배로 쳐 주는 것 같아.",
        "W: 나도 내일 같이 걸어도 돼?",
        "M: 그럼, 나는 7시 15분에 나가.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Minjae가 Hyerin에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Minjae : ________________",
      lines: [
        [
          "M",
          "Minjae and Hyerin are preparing the third year graduation video together. " +
            "They have collected photographs from every class in the year group. " +
            "Hyerin has just finished editing a first version to show the teachers. " +
            "Minjae notices that two of the eleven classes do not appear at all. " +
            "Those two classes sent their photographs late, after the folder was closed. " +
            "There is still a week before the final version has to be handed in. " +
            "He wants her to add the missing classes before anyone else sees it. " +
            "In this situation, what would Minjae most likely say to Hyerin?",
        ],
      ],
      choices: [
        "Let's use fewer photographs overall.",
        "The video is far too long already.",
        "Two classes are missing, we should add them.",
        "I'll make a second video myself.",
        "The teachers will not watch it.",
      ],
      answer: 3,
      clue: "He wants her to add the missing classes before anyone else sees it.",
      explanation:
        "두 반이 빠져 있으므로 넣자고 말하는 ③이 가장 적절하다.",
      translation: [
        "M: 민재와 혜린이는 3학년 졸업 영상을 함께 만들고 있습니다. 두 사람은 학년의 모든 반에서 사진을 모았습니다. 혜린이는 선생님들께 보여 드릴 첫 판 편집을 방금 끝냈습니다. 민재는 열한 반 가운데 두 반이 아예 나오지 않는 것을 알아챕니다. 그 두 반은 폴더가 닫힌 뒤에 사진을 늦게 보냈습니다. 최종본을 내기까지는 아직 일주일이 남아 있습니다. 민재는 다른 사람이 보기 전에 빠진 반을 넣기를 바랍니다. 이런 상황에서 민재가 혜린이에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 여자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "Hello, everyone. Today I want to explain why the same room " +
            "feels colder with a tiled floor than with a carpet, " +
            "even when a thermometer reads exactly the same in both. " +
            "Your skin does not measure temperature. It measures how fast heat leaves it. " +
            "Tile is dense and conducts heat away from your foot quickly, " +
            "carrying it off into the floor below. " +
            "Carpet is mostly trapped air, and air is a poor conductor, " +
            "so the heat stays where it is and your foot stays warm. " +
            "The same rule explains why a metal handle feels colder than a wooden one " +
            "in the same unheated room. " +
            "Neither object is colder. One is simply better at taking heat from you.",
        ],
      ],
      choices: [
        "how thermometers are calibrated",
        "why some surfaces feel colder than others",
        "how heating systems warm a house",
        "why carpets last longer than tiles",
        "how the body keeps its temperature steady",
      ],
      answer: 2,
      clue: "Your skin does not measure temperature. It measures how fast heat leaves it.",
      explanation:
        "여자는 피부가 열이 빠져나가는 속도를 느끼기 때문에 같은 온도라도 다르게 느껴진다고 설명한다. 따라서 답은 ②이다.",
      translation: [
        "W: 안녕하세요, 여러분. 오늘은 온도계로 재면 똑같은데도 같은 방이 양탄자보다 타일 바닥일 때 더 춥게 느껴지는 까닭을 설명하려 합니다. 우리 피부는 온도를 재지 않습니다. 열이 얼마나 빨리 빠져나가는지를 잽니다. 타일은 빽빽해서 발에서 열을 빠르게 가져가 아래쪽 바닥으로 실어 갑니다. 양탄자는 대부분 갇힌 공기이고 공기는 열을 잘 옮기지 못해서, 열이 있던 자리에 머물고 발은 따뜻하게 남습니다. 같은 규칙이 난방이 없는 방에서 쇠 손잡이가 나무 손잡이보다 차갑게 느껴지는 까닭도 설명해 줍니다. 어느 쪽도 더 차갑지 않습니다. 한쪽이 여러분에게서 열을 더 잘 가져갈 뿐입니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 내용이 아닌 것은?",
      lines: [
        ["W", "Today I want to explain why the same room feels colder with a tiled floor."],
        ["W", "Your skin measures how fast heat leaves it."],
        ["W", "Tile conducts heat away from your foot quickly."],
        ["W", "Carpet is mostly trapped air, and air is a poor conductor."],
        ["W", "A metal handle feels colder than a wooden one in the same room."],
      ],
      choices: [
        "skin measuring how fast heat leaves it",
        "tile conducting heat away quickly",
        "carpet being mostly trapped air",
        "a metal handle feeling colder than a wooden one",
        "the temperature at which water freezes",
      ],
      answer: 5,
      clue: "Your skin measures how fast heat leaves it.",
      explanation:
        "열이 빠져나가는 속도를 재는 피부, 열을 빨리 가져가는 타일, 갇힌 공기인 양탄자, 더 차갑게 느껴지는 쇠 손잡이는 언급되지만 물이 어는 온도는 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
