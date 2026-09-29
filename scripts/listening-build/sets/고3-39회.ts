/** 고3 듣기 39회 — 사람이 직접 쓴 회차 (2026-09-29) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고3 39회",
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
          "Good afternoon, students. This is the head of the library committee. " +
            "I want to tell you about the quiet rule on the second floor. " +
            "Since the examination period began, the reading room has been silent, " +
            "which is what we wanted, and the group room beside it has been silent too, " +
            "which is not. " +
            "The group room exists so that people can explain things to each other out loud. " +
            "From this week a sign on its door will say so in plain words. " +
            "If you want to talk about a problem, that is the room for it. " +
            "If you want to be left alone, the reading room is ten steps away. Thank you.",
        ],
      ],
      choices: [
        "모둠실의 용도를 알리려고",
        "도서관 이전을 알리려고",
        "열람실 예약을 안내하려고",
        "도서 반납을 독촉하려고",
        "시험 일정을 알리려고",
      ],
      answer: 1,
      clue: "The group room exists so that people can explain things to each other out loud.",
      explanation:
        "남자는 모둠실이 소리 내어 설명하는 방임을 알리고 표시를 붙인다고 말한다. 따라서 답은 ①이다.",
      translation: [
        "M: 학생 여러분, 안녕하세요. 도서관 운영 위원장입니다. 2층의 정숙 규칙에 대해 말씀드립니다. 시험 기간이 시작된 뒤로 열람실은 조용했습니다. 그것은 우리가 바라던 바입니다. 그런데 그 옆 모둠실도 조용했는데, 그것은 바라던 바가 아닙니다. 모둠실은 서로에게 소리 내어 설명하라고 있는 방입니다. 이번 주부터 문에 그 사실을 분명한 말로 적어 붙입니다. 문제를 놓고 이야기하고 싶으면 그 방이 그럴 곳입니다. 혼자 있고 싶으면 열 걸음 옆에 열람실이 있습니다. 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 여자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Hayoon, I've made a plan for every day until the exam."],
        ["W", "Every day? How far ahead does it go?"],
        ["M", "Fifty-one days, hour by hour."],
        ["W", "And what happens on the day one hour goes wrong?"],
        ["M", "I move that hour to the next day, I suppose."],
        ["W", "Then you'd be moving fifty hours by the end."],
        ["M", "So a long plan is useless?"],
        ["W", "A long plan is a guess about a person you haven't met yet."],
        ["M", "Meaning me, in five weeks."],
        ["W", "Plan the week you can see and leave the rest as headings."],
        ["M", "That feels much less reassuring to look at."],
        ["W", "A plan you keep is worth more than a plan that looks complete."],
      ],
      choices: [
        "계획은 길게 세울수록 좋다",
        "계획은 볼 수 있는 기간만큼만 세워야 한다",
        "계획은 시간 단위로 세워야 한다",
        "계획은 친구와 함께 세워야 한다",
        "계획은 매일 다시 써야 한다",
      ],
      answer: 2,
      clue: "Plan the week you can see and leave the rest as headings.",
      explanation:
        "여자는 멀리까지 세운 계획은 지킬 수 없다며 볼 수 있는 한 주만 짜라고 말한다. 따라서 답은 ②이다.",
      translation: [
        "M: 하윤아, 시험까지 하루하루 계획을 다 세웠어.",
        "W: 하루하루? 얼마나 앞까지?",
        "M: 51일. 시간 단위로.",
        "W: 어느 날 한 시간이 어긋나면 어떻게 돼?",
        "M: 그 시간을 다음 날로 옮기겠지.",
        "W: 그러면 끝에 가서는 쉰 시간을 옮기고 있을 거야.",
        "M: 그럼 긴 계획이 쓸모없다는 거야?",
        "W: 긴 계획은 아직 만나지도 않은 사람에 대한 짐작이야.",
        "M: 5주 뒤의 나 말이구나.",
        "W: 눈에 보이는 한 주를 짜고 나머지는 제목만 남겨 둬.",
        "M: 보기에 훨씬 덜 든든한데.",
        "W: 지킬 수 있는 계획이 완성돼 보이는 계획보다 값져.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Students judge a study session by how it felt. " +
            "An hour that was comfortable is recorded as a good hour, " +
            "and an hour that was hard is recorded as a wasted one. " +
            "The truth is almost exactly the other way round. " +
            "Rereading your notes is pleasant and changes very little. " +
            "Trying to recall them with the book closed is unpleasant " +
            "and is the only part that moves anything. " +
            "Judge the hour by what you can now do, not by how it felt while you did it.",
        ],
      ],
      choices: [
        "편안하게 공부해야 한다",
        "공부는 느낌이 아니라 결과로 판단해야 한다",
        "필기를 여러 번 읽어야 한다",
        "공부 시간을 늘려야 한다",
        "쉬는 시간을 정해야 한다",
      ],
      answer: 2,
      clue: "Judge the hour by what you can now do, not by how it felt while you did it.",
      explanation:
        "남자는 편안했는지가 아니라 무엇을 할 수 있게 되었는지로 판단하라고 말한다. 따라서 답은 ②이다.",
      translation: [
        "M: 학생들은 공부한 시간을 느낌으로 판단합니다. 편안했던 한 시간은 좋은 시간으로, 힘들었던 한 시간은 버린 시간으로 기록됩니다. 사실은 거의 정반대입니다. 필기를 다시 읽는 일은 기분 좋고 거의 아무것도 바꾸지 않습니다. 책을 덮고 떠올려 보는 일은 불편하고, 무언가를 움직이는 유일한 부분입니다. 그 한 시간은 하는 동안 어떤 느낌이었는지가 아니라 이제 무엇을 할 수 있게 되었는지로 판단하세요.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["W", "Junho, is this the group room on the second floor?"],
        ["M", "Yes, we use it every Tuesday evening."],
        ["W", "A long table stands down the middle of the room."],
        ["M", "Ten people can sit round it without touching."],
        ["W", "There's a whiteboard covering the back wall."],
        ["M", "It runs from one corner nearly to the other."],
        ["W", "Two chairs stand against the left wall."],
        ["M", "Four, actually. Two are pushed under the table."],
        ["W", "A round wall clock hangs above the door."],
        ["M", "We finish at nine by that clock every week."],
        ["W", "And a tall plant stands in the right corner."],
        ["M", "Somebody waters it, but nobody knows who."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "Four, actually. Two are pushed under the table.",
      explanation:
        "여자가 의자가 두 개라고 하자 남자가 네 개라고 바로잡는다. 그림에는 두 개가 그려져 있으므로 답은 ③이다.",
      figure: {
        kind: "figure5",
        spots: [
          [0.46, 0.6],
          [0.5, 0.18],
          [0.08, 0.5],
          [0.6, 0.06],
          [0.89, 0.42],
        ],
        scene:
          "A library group room drawn as one wide picture, clean black line art on white, no writing or letters or numbers anywhere. " +
          "A LONG TABLE stands down the MIDDLE of the room. " +
          "A WIDE BLANK WHITEBOARD covers most of the BACK wall behind the table. " +
          "EXACTLY TWO CHAIRS stand side by side against the LEFT wall, " +
          "clearly separated with a gap between them so both can be counted. " +
          "A ROUND WALL CLOCK hangs on the BACK wall above a door at the upper right. " +
          "A TALL POTTED PLANT stands in the RIGHT corner of the room.",
      },
      translation: [
        "W: 준호야, 여기가 2층 모둠실이야?",
        "M: 응, 화요일 저녁마다 써.",
        "W: 방 가운데를 따라 긴 탁자가 있네.",
        "M: 열 명이 부딪히지 않고 둘러앉아.",
        "W: 뒷벽을 화이트보드가 덮고 있고.",
        "M: 한쪽 구석에서 반대쪽 가까이까지 이어져.",
        "W: 왼쪽 벽에는 의자가 두 개 있어.",
        "M: 사실 네 개야. 두 개는 탁자 밑에 밀어 넣었어.",
        "W: 문 위에는 둥근 벽시계가 걸려 있네.",
        "M: 매주 저 시계로 아홉 시에 끝내.",
        "W: 그리고 오른쪽 구석에는 키 큰 화분이 있어.",
        "M: 누가 물을 주는데 누군지는 아무도 몰라.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 여자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Chaeyeon, the exam briefing is on Thursday morning."],
        ["W", "Has the hall been booked for the whole year group?"],
        ["M", "From nine until ten, and the chairs are already out."],
        ["W", "Did the caretaker set them out in rows or in blocks?"],
        ["M", "In blocks, one for each class, as we asked."],
        ["W", "Good. Last year nobody could find their own class."],
        ["M", "That is exactly why we changed it this time."],
        ["W", "And what about the slides?"],
        ["M", "Finished on Monday, and the teacher checked them."],
        ["W", "Then the main pieces are ready."],
        ["M", "Except the handout. Every student needs one."],
        ["W", "How many pages is it?"],
        ["M", "Two, and there are three hundred and twelve students."],
        ["W", "The copier takes an hour for that many."],
        ["M", "And nobody has started it yet."],
        ["W", "I'll copy the handouts this afternoon."],
      ],
      choices: [
        "강당을 예약하기",
        "발표 자료를 만들기",
        "안내지를 복사하기",
        "의자를 놓기",
        "학생 명단을 확인하기",
      ],
      answer: 3,
      clue: "I'll copy the handouts this afternoon.",
      explanation:
        "여자는 오늘 오후에 안내지를 복사하겠다고 말한다. 따라서 답은 ③이다.",
      translation: [
        "M: 채연아, 시험 설명회가 목요일 아침이야.",
        "W: 학년 전체가 들어갈 강당은 잡았어?",
        "M: 아홉 시부터 열 시까지. 의자도 벌써 놨어.",
        "W: 관리인 아저씨가 줄로 놓으셨어, 반별로 놓으셨어?",
        "M: 우리가 부탁한 대로 반별로 묶어서.",
        "W: 잘됐다. 작년엔 다들 자기 반을 못 찾았잖아.",
        "M: 그래서 이번에 바꾼 거야.",
        "W: 그럼 발표 자료는?",
        "M: 월요일에 끝냈고 선생님도 보셨어.",
        "W: 그럼 큰 건 다 됐네.",
        "M: 안내지만 빼고. 학생마다 한 장씩 필요해.",
        "W: 몇 쪽이야?",
        "M: 두 쪽. 학생이 312명이야.",
        "W: 그 수량이면 복사기로 한 시간 걸려.",
        "M: 그런데 아직 아무도 시작 안 했어.",
        "W: 오늘 오후에 안내지 복사할게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 남자가 지불할 금액을 고르시오.",
      lines: [
        ["W", "Good morning. Are you here about the study lamps?"],
        ["M", "Yes, our class would like to buy some for the study room."],
        ["W", "How many do you need?"],
        ["M", "Eight, one for each desk by the wall."],
        ["W", "A desk lamp is fourteen dollars each."],
        ["M", "Do they come with the bulbs?"],
        ["W", "The bulb is two dollars extra for each lamp."],
        ["M", "Then eight bulbs as well, please."],
        ["W", "Would you like them delivered to the school?"],
        ["M", "No, we'll collect them on Friday afternoon."],
        ["W", "In that case I can take ten dollars off the total."],
        ["M", "Here is the class card, then."],
      ],
      choices: ["$118", "$128", "$112", "$108", "$130"],
      answer: 1,
      clue: "A desk lamp is fourteen dollars each.",
      explanation:
        "전등 여덟 개 112달러와 전구 여덟 개 16달러를 더하면 128달러이고, 직접 찾아가 10달러를 빼면 118달러이다. 따라서 답은 ①이다.",
      translation: [
        "W: 안녕하세요. 학습용 전등 때문에 오셨나요?",
        "M: 네, 우리 반 자습실에 놓을 걸 사려고요.",
        "W: 몇 개 필요하신가요?",
        "M: 여덟 개요. 벽 쪽 책상마다 하나씩.",
        "W: 책상 전등은 하나에 14달러입니다.",
        "M: 전구도 같이 오나요?",
        "W: 전구는 전등마다 2달러가 더 붙습니다.",
        "M: 그럼 전구도 여덟 개 주세요.",
        "W: 학교로 배달해 드릴까요?",
        "M: 아니요, 금요일 오후에 직접 찾아갈게요.",
        "W: 그러시면 전체에서 10달러를 빼 드릴 수 있습니다.",
        "M: 그럼 여기 학급 카드요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 여자가 아침 자습에 오지 못하는 이유를 고르시오.",
      lines: [
        ["M", "Naeun, you haven't been at the morning session this week."],
        ["W", "Not since Monday, and I miss it already."],
        ["M", "Is it because you've been sleeping badly?"],
        ["W", "I sleep fine. That isn't it."],
        ["M", "Then has the bus timetable changed again?"],
        ["W", "No, my younger brother started school this term."],
        ["M", "And somebody has to take him in the morning."],
        ["W", "My parents both leave before seven, so it's me."],
        ["M", "How long does that take you?"],
        ["W", "Forty minutes, which is exactly the morning session."],
      ],
      choices: [
        "잠을 잘 못 자서",
        "버스 시간이 바뀌어서",
        "동생을 데려다줘야 해서",
        "몸이 아파서",
        "아르바이트를 해서",
      ],
      answer: 3,
      clue: "No, my younger brother started school this term.",
      explanation:
        "여자는 아침에 동생을 학교에 데려다줘야 해서 자습에 못 온다고 말한다. 따라서 답은 ③이다.",
      translation: [
        "M: 나은아, 이번 주에 아침 자습에 안 왔더라.",
        "W: 월요일부터. 벌써 아쉬워.",
        "M: 잠을 잘 못 자서야?",
        "W: 잠은 잘 자. 그건 아니야.",
        "M: 그럼 버스 시간이 또 바뀌었어?",
        "W: 아니, 이번 학기에 동생이 학교에 들어갔어.",
        "M: 아침에 누가 데려다줘야 하는구나.",
        "W: 부모님 두 분 다 일곱 시 전에 나가셔서 내가 해.",
        "M: 얼마나 걸려?",
        "W: 40분. 딱 아침 자습 시간이야.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 교내 수능 대비 특강에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["M", "Seoyun, are you taking the exam preparation course this term?"],
        ["W", "I signed up last Friday, but I haven't read the notice properly."],
        ["M", "Then let me tell you what it says."],
        ["W", "Please do. I only looked at the title."],
        ["M", "It runs for six weeks, every Tuesday and Thursday."],
        ["W", "After school, I suppose?"],
        ["M", "From four until six, in the third year classrooms."],
        ["W", "Which subjects does it cover?"],
        ["M", "English and mathematics, alternating each week."],
        ["W", "Do we need to bring our own materials?"],
        ["M", "They give you a booklet on the first day."],
        ["W", "Is there a limit on numbers?"],
        ["M", "Forty, and thirty-one signed up in the first two days."],
      ],
      choices: ["특강 기간과 요일", "특강 시간과 장소", "다루는 과목", "준비물", "담당하는 선생님"],
      answer: 5,
      clue: "It runs for six weeks, every Tuesday and Thursday.",
      explanation:
        "기간과 요일, 시간과 장소, 과목, 준비물은 말했지만 담당 교사는 말하지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 서윤아, 이번 학기 수능 대비 특강 들어?",
        "W: 지난 금요일에 신청은 했는데 안내문을 제대로 안 읽었어.",
        "M: 그럼 내가 뭐라고 적혀 있는지 말해 줄게.",
        "W: 말해 줘. 제목만 봤어.",
        "M: 여섯 주 동안, 화요일이랑 목요일마다 해.",
        "W: 방과 후겠지?",
        "M: 네 시부터 여섯 시까지, 3학년 교실에서.",
        "W: 어떤 과목을 해?",
        "M: 영어랑 수학. 주마다 번갈아 해.",
        "W: 자료는 각자 가져가야 해?",
        "M: 첫날에 책자를 줘.",
        "W: 인원 제한 있어?",
        "M: 마흔 명. 이틀 만에 서른한 명이 신청했어.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Solbit Youth Counselling Line에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "W",
          "Here is some information about the Solbit Youth Counselling Line, which began last year. " +
            "The line is open from two in the afternoon until ten at night, every day. " +
            "Anyone between thirteen and twenty-four may call, and the call is free. " +
            "You do not have to give your name at any point. " +
            "Counsellors answer in Korean, and there is an English line on Wednesdays. " +
            "A written chat service runs at the same hours through the website. " +
            "Nothing you say is passed to your school or your family. " +
            "The line is busiest between eight and ten, so an earlier call is answered sooner.",
        ],
      ],
      choices: [
        "매일 오후 두 시부터 밤 열 시까지 연다",
        "통화는 무료이다",
        "이름을 말해야 한다",
        "수요일에는 영어 상담도 있다",
        "저녁 여덟 시부터 열 시까지 가장 붐빈다",
      ],
      answer: 3,
      clue: "You do not have to give your name at any point.",
      explanation:
        "이름을 말하지 않아도 된다고 했으므로 ③이 일치하지 않는다.",
      translation: [
        "W: 지난해에 시작한 솔빛 청소년 상담 전화에 대해 알려 드립니다. 전화는 매일 오후 두 시부터 밤 열 시까지 엽니다. 열세 살에서 스물네 살 사이면 누구나 걸 수 있고 통화는 무료입니다. 어느 때에도 이름을 말할 필요가 없습니다. 상담사는 한국어로 답하고 수요일에는 영어 상담도 있습니다. 같은 시간에 누리집으로 글 상담도 합니다. 여러분이 한 말은 학교나 가족에게 전해지지 않습니다. 여덟 시부터 열 시까지가 가장 붐비니 그보다 일찍 걸면 더 빨리 연결됩니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 예약할 자습실 자리를 고르시오.",
      lines: [
        ["M", "Dain, five seat blocks are still open for next month."],
        ["W", "We've been sitting apart since September."],
        ["M", "Then let's fix it now. Which floor do you want?"],
        ["W", "Not the ground floor. The corridor noise reaches it."],
        ["M", "Two of these are on the ground floor."],
        ["W", "Then they're out. Are any of them by a window?"],
        ["M", "Two of the three left are."],
        ["W", "A window matters in the afternoon."],
        ["M", "And the monthly fee? We said under fifty thousand."],
        ["W", "One of the last two is sixty thousand."],
        ["M", "So there's only one block for us."],
        ["W", "I'll book two seats in it tonight."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "Not the ground floor. The corridor noise reaches it.",
      explanation:
        "1층이 아니고, 창가이며, 5만 원 미만인 자리를 고른다. 세 조건을 모두 채우는 것은 ④이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Floor: Ground / Window: Yes / Fee: 40,000 won" },
          { no: 2, label: "②", value: "Floor: Ground / Window: No / Fee: 35,000 won" },
          { no: 3, label: "③", value: "Floor: Second / Window: No / Fee: 45,000 won" },
          { no: 4, label: "④", value: "Floor: Second / Window: Yes / Fee: 48,000 won" },
          { no: 5, label: "⑤", value: "Floor: Third / Window: Yes / Fee: 60,000 won" },
        ],
      },
      translation: [
        "M: 다인아, 다음 달 자습실 자리 다섯 구역이 아직 남아 있어.",
        "W: 9월부터 계속 떨어져 앉았잖아.",
        "M: 그럼 지금 해결하자. 몇 층이 좋아?",
        "W: 1층은 안 돼. 복도 소리가 들려.",
        "M: 두 개가 1층이야.",
        "W: 그럼 빠지네. 창가인 데 있어?",
        "M: 남은 셋 중 둘이 창가야.",
        "W: 오후에는 창이 중요해.",
        "M: 월 이용료는? 5만 원 아래로 하기로 했잖아.",
        "W: 남은 둘 중 하나는 6만 원이야.",
        "M: 그럼 우리한테 맞는 건 한 구역뿐이네.",
        "W: 오늘 밤에 두 자리 예약할게.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Kiyoung, did you return the past paper folder?"],
        ["M", "Not yet. It's still in my locker."],
        ["W", "Three people are waiting for that one."],
        ["M", "I didn't know anybody had asked for it."],
        ["W", "Could you bring it down at break?"],
      ],
      choices: [
        "No, I don't have it.",
        "Sure, I'll bring it at ten thirty.",
        "The library is closed.",
        "You should wait a week.",
        "Nobody uses that folder.",
      ],
      answer: 2,
      clue: "Could you bring it down at break?",
      explanation:
        "쉬는 시간에 가져다 달라고 했으므로, 10시 30분에 가져오겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 기영아, 기출 서류철 돌려줬어?",
        "M: 아직. 내 사물함에 있어.",
        "W: 그거 기다리는 사람이 세 명이야.",
        "M: 찾는 사람이 있는 줄 몰랐어.",
        "W: 쉬는 시간에 가져다줄래?",
        "M: 그래, 10시 30분에 가져갈게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Chaewon, are you going to the printing shop today?"],
        ["W", "After school, to collect our class booklets."],
        ["M", "Could you ask about the price of binding?"],
        ["W", "Binding for what, exactly?"],
        ["M", "Forty pages of notes, one copy only."],
      ],
      choices: [
        "I'm not going there.",
        "Sure, I'll ask and message you.",
        "They don't do binding.",
        "You should go yourself.",
        "Forty pages is too many.",
      ],
      answer: 2,
      clue: "Forty pages of notes, one copy only.",
      explanation:
        "제본할 분량을 말해 주었으므로, 물어보고 알려 주겠다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 채원아, 오늘 인쇄소 가?",
        "W: 방과 후에. 학급 책자 찾으러.",
        "M: 제본 값 좀 물어봐 줄래?",
        "W: 뭘 제본하는데?",
        "M: 필기 마흔 쪽. 한 부만.",
        "W: 그래, 물어보고 알려 줄게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Taemin, how is the English writing practice going?"],
        ["M", "I write one essay a week and the marks never move."],
        ["W", "What do you do with the marked essay?"],
        ["M", "I read the comments and file it away."],
        ["W", "Do you ever write the same essay again?"],
        ["M", "Never. There is always a new title waiting."],
        ["W", "So the comments have never actually been used."],
        ["M", "I suppose reading them is not using them."],
        ["W", "Rewrite one essay with the comments in front of you."],
        ["M", "That would take an evening for something already marked."],
        ["W", "And it is the only evening that will change the next one."],
      ],
      choices: [
        "I never write essays.",
        "That's a fair point, I'll rewrite one.",
        "The comments are useless.",
        "I already rewrite everything.",
        "You should write it for me.",
      ],
      answer: 2,
      clue: "Rewrite one essay with the comments in front of you.",
      explanation:
        "의견을 보면서 한 편을 다시 쓰라는 조언이므로, 그러겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 태민아, 영어 쓰기 연습은 어때?",
        "M: 일주일에 한 편 쓰는데 점수가 안 움직여.",
        "W: 첨삭 받은 글로 뭘 해?",
        "M: 의견을 읽고 파일에 넣어 둬.",
        "W: 같은 글을 다시 써 본 적 있어?",
        "M: 한 번도. 늘 새 제목이 기다리고 있어.",
        "W: 그럼 그 의견을 실제로 써 본 적이 없네.",
        "M: 읽는 건 쓰는 게 아니긴 하지.",
        "W: 의견을 앞에 놓고 한 편을 다시 써 봐.",
        "M: 이미 채점된 글에 저녁 하나를 쓰라는 거네.",
        "W: 그리고 그 저녁만이 다음 글을 바꿔.",
        "M: 맞는 말이야, 한 편 다시 쓸게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Seoyeon, you've been eating lunch in the classroom."],
        ["W", "Since October, with two others from my class."],
        ["M", "Is the cafeteria not better food?"],
        ["W", "The food is fine. The queue is thirty minutes."],
        ["M", "Thirty minutes for a twenty minute lunch."],
        ["W", "So we bring something and use the time instead."],
        ["M", "What do you do with the time you save?"],
        ["W", "Twenty minutes of listening practice, every day."],
        ["M", "That's nearly two hours a week."],
        ["W", "And it costs nothing I was using anyway."],
        ["M", "Could I join you tomorrow?"],
      ],
      choices: [
        "Of course, we start at twelve twenty.",
        "I eat in the cafeteria now.",
        "The classroom is locked.",
        "You can't bring lunch.",
        "I stopped in October.",
      ],
      answer: 1,
      clue: "Could I join you tomorrow?",
      explanation:
        "남자가 내일 함께해도 되는지 물었으므로, 12시 20분에 시작한다는 ①이 가장 자연스럽다.",
      translation: [
        "M: 서연아, 교실에서 점심을 먹더라.",
        "W: 10월부터. 우리 반 두 명이랑.",
        "M: 급식이 더 낫지 않아?",
        "W: 음식은 괜찮아. 줄이 30분이야.",
        "M: 20분 점심에 줄이 30분이네.",
        "W: 그래서 뭘 싸 와서 그 시간을 쓰는 거야.",
        "M: 아낀 시간으로 뭘 해?",
        "W: 매일 듣기 연습 20분.",
        "M: 일주일에 거의 두 시간이네.",
        "W: 어차피 쓰던 시간도 아니라 값도 안 들어.",
        "M: 나도 내일 같이 해도 돼?",
        "W: 그럼, 우리는 12시 20분에 시작해.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Sangwoo가 Hayoon에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Sangwoo : ________________",
      lines: [
        [
          "M",
          "Sangwoo and Hayoon are preparing the handout for the exam briefing. " +
            "Three hundred students will each receive one copy on Thursday. " +
            "Hayoon has laid the whole thing out in a very small typeface " +
            "so that everything fits onto a single side of paper. " +
            "Sangwoo has held it at arm's length and cannot read the dates. " +
            "Two sides of paper would cost almost nothing extra. " +
            "He wants her to use a larger typeface across two pages. " +
            "In this situation, what would Sangwoo most likely say to Hayoon?",
        ],
      ],
      choices: [
        "Let's print fewer copies this time.",
        "The briefing should be cancelled.",
        "Use a bigger typeface over two pages.",
        "I'll read the dates aloud instead.",
        "Three hundred students is too many.",
      ],
      answer: 3,
      clue: "He wants her to use a larger typeface across two pages.",
      explanation:
        "글씨가 작아 읽히지 않으므로 두 쪽에 걸쳐 크게 쓰자는 ③이 가장 적절하다.",
      translation: [
        "M: 상우와 하윤이는 시험 설명회 안내지를 준비하고 있습니다. 목요일에 학생 삼백 명이 한 장씩 받게 됩니다. 하윤이는 모든 내용이 종이 한 면에 들어가도록 아주 작은 글씨로 배치했습니다. 상우는 팔을 뻗어 들고 보았는데 날짜가 읽히지 않습니다. 종이 두 면을 써도 값은 거의 더 들지 않습니다. 상우는 두 쪽에 걸쳐 더 큰 글씨로 쓰기를 바랍니다. 이런 상황에서 상우가 하윤이에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 여자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "Hello, everyone. Today I want to explain why we find it so hard " +
            "to notice a smell in our own house. " +
            "The nose is built to report change, not to report what is there. " +
            "Nerve cells that carry a steady signal for several minutes " +
            "begin to fire less and less, and within about twenty minutes " +
            "a smell that was obvious has gone from awareness entirely. " +
            "This is not a fault. It clears the way for the next smell, " +
            "which might be smoke or food that has turned. " +
            "Leave the house for an hour and the cells recover, " +
            "which is why your own hallway smells of something on the way back " +
            "and of nothing at all ten minutes later.",
        ],
      ],
      choices: [
        "how the nose separates different smells",
        "why we stop noticing a familiar smell",
        "how smell affects the taste of food",
        "why some smells trigger memories",
        "how air moves through a house",
      ],
      answer: 2,
      clue: "The nose is built to report change, not to report what is there.",
      explanation:
        "여자는 코가 변화를 알리도록 되어 있어 익숙한 냄새를 못 느끼게 된다고 설명한다. 따라서 답은 ②이다.",
      translation: [
        "W: 안녕하세요, 여러분. 오늘은 자기 집 냄새를 왜 그렇게 알아차리기 어려운지 설명하려 합니다. 코는 무엇이 있는지를 알리도록 만들어진 것이 아니라 변화를 알리도록 만들어졌습니다. 몇 분 동안 같은 신호를 보내던 신경 세포는 점점 덜 반응하고, 20분쯤이면 분명하던 냄새가 의식에서 완전히 사라집니다. 이것은 결함이 아닙니다. 다음 냄새, 이를테면 연기나 상한 음식 냄새를 위해 길을 비워 두는 것입니다. 한 시간쯤 집을 비우면 세포가 회복되는데, 그래서 돌아올 때는 현관에서 무슨 냄새가 나고 10분 뒤에는 아무 냄새도 나지 않는 것입니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 내용이 아닌 것은?",
      lines: [
        ["W", "Today I want to explain why we find it hard to notice a smell in our own house."],
        ["W", "The nose is built to report change, not to report what is there."],
        ["W", "Nerve cells carrying a steady signal begin to fire less and less."],
        ["W", "It clears the way for the next smell, which might be smoke."],
        ["W", "Leave the house for an hour and the cells recover."],
      ],
      choices: [
        "the nose reporting change rather than what is there",
        "nerve cells firing less with a steady signal",
        "clearing the way for a smell such as smoke",
        "cells recovering after an hour away",
        "the number of smells a person can name",
      ],
      answer: 5,
      clue: "The nose is built to report change, not to report what is there.",
      explanation:
        "변화를 알리는 코, 덜 반응하게 되는 신경 세포, 연기 같은 다음 냄새를 위한 자리, 한 시간 뒤 회복되는 세포는 언급되지만 사람이 이름 댈 수 있는 냄새의 수는 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
