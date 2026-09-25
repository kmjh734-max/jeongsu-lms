/** 고3 듣기 23회 — 사람이 직접 쓴 회차 (2026-09-25) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고3 23회",
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
          "Good evening, everyone. This is Seungjin Park, chair of the alumni association. " +
            "I am writing about the scholarship interviews scheduled for the second week of December. " +
            "Until last year we held them in the school's conference room on a weekday afternoon, " +
            "which meant every applicant had to miss two periods of class. " +
            "Several of you told us that missing class in December was the worst possible cost. " +
            "So this year the interviews will be held on Saturday morning instead, " +
            "in the same conference room, between nine and one. " +
            "Each applicant will be given a fifteen-minute slot, " +
            "and you may choose your own slot on the sign-up sheet outside the office. " +
            "Nothing else about the process has changed. " +
            "The documents and the deadline are exactly as announced in October. Thank you.",
        ],
      ],
      choices: [
        "장학금 면접 요일 변경을 알리려고",
        "장학금 신청 서류를 안내하려고",
        "장학금 액수 인상을 알리려고",
        "동문회 가입을 권하려고",
        "면접 장소 변경을 알리려고",
      ],
      answer: 1,
      clue: "So this year the interviews will be held on Saturday morning instead, in the same conference room, between nine and one.",
      explanation:
        "남자는 수업 결손 때문에 평일 오후에 하던 장학금 면접을 토요일 오전으로 옮긴다고 알리고, 장소와 나머지 절차는 그대로라고 말한다. 따라서 답은 ①이다.",
      translation: [
        "M: 여러분, 안녕하세요. 동문회장 박승진입니다. 12월 둘째 주에 예정된 장학금 면접 때문에 알려 드립니다. 작년까지는 평일 오후에 학교 회의실에서 진행했는데, 그러면 지원자마다 수업을 두 시간씩 빠져야 했습니다. 12월에 수업을 빠지는 것이 무엇보다 큰 대가라고 여러 분이 말씀해 주셨습니다. 그래서 올해는 면접을 토요일 오전에, 같은 회의실에서 9시부터 1시 사이에 진행합니다. 지원자마다 15분씩 배정되고, 사무실 밖 신청표에서 원하는 시간을 직접 고르시면 됩니다. 그 밖에 달라진 것은 없습니다. 서류와 마감일은 10월에 공지한 그대로입니다. 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 여자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Chaeyeon, I made a timetable for the next hundred days."],
        ["W", "Let me see. This is planned down to the fifteen-minute block."],
        ["M", "I wanted to leave nothing to chance."],
        ["W", "What happens on a day you sleep through the first block?"],
        ["M", "Then the whole day slides and I usually give up on the sheet."],
        ["W", "So the plan survives only on days you didn't need a plan."],
        ["M", "That's been true for the last two weeks, honestly."],
        ["W", "A schedule this tight is a promise you'll break by Tuesday."],
        ["M", "But a loose plan feels like no plan at all."],
        ["W", "Set three things you must finish, and let the order float."],
        ["M", "Only three? That feels like giving up on the rest."],
        ["W", "Three finished beats fifteen scheduled and four done."],
      ],
      choices: [
        "계획은 시간 단위로 촘촘히 세워야 한다",
        "계획보다 실천이 중요하다",
        "공부는 아침에 시작해야 한다",
        "계획은 반드시 끝낼 세 가지로 느슨하게 세워야 한다",
        "계획표는 매일 새로 써야 한다",
      ],
      answer: 4,
      clue: "Set three things you must finish, and let the order float.",
      explanation:
        "여자는 빡빡한 계획표는 화요일이면 깨지는 약속이라며, 반드시 끝낼 세 가지만 정하고 순서는 열어 두라고 말한다. 따라서 답은 ④이다.",
      translation: [
        "M: 채연아, 나 앞으로 100일 시간표를 짰어.",
        "W: 어디 보자. 15분 단위까지 다 짜 놨네.",
        "M: 우연에 맡기고 싶지 않았어.",
        "W: 첫 칸을 자다가 놓친 날은 어떻게 돼?",
        "M: 그럼 하루가 통째로 밀려서 보통 그 표를 포기해.",
        "W: 그럼 그 계획은 계획이 필요 없던 날에만 살아남는 거네.",
        "M: 솔직히 지난 2주가 그랬어.",
        "W: 이렇게 빡빡한 시간표는 화요일이면 깨질 약속이야.",
        "M: 그런데 느슨하게 짜면 계획이 없는 것 같아.",
        "W: 반드시 끝낼 세 가지를 정하고 순서는 열어 둬.",
        "M: 세 개만? 나머지를 포기하는 것 같은데.",
        "W: 끝낸 세 개가, 열다섯 개 짜 놓고 네 개 한 것보다 나아.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "When a project fails, the first thing a team does is look for the decision that caused it. " +
            "There is usually one, and finding it feels like understanding. " +
            "But consider how that decision looked on the day it was made. " +
            "The information available then was thinner than the information available now, " +
            "and the version of events you are holding includes the ending. " +
            "This is why reviews so often produce the same finding: " +
            "someone should have seen it coming. " +
            "Of course they should have, from here. " +
            "A review that asks what we should have known teaches nothing, " +
            "because next time the unknown will sit somewhere else entirely. " +
            "A review that asks what we could have checked, with the time and the people we had, " +
            "produces something you can actually do differently. " +
            "The first question judges the past. The second one changes the next one.",
        ],
      ],
      choices: [
        "실패의 원인이 된 결정을 찾아야 한다",
        "실패 검토는 확인할 수 있었던 것을 물어야 한다",
        "실패는 기록으로 남겨야 한다",
        "책임자를 분명히 해야 한다",
        "실패를 두려워하지 말아야 한다",
      ],
      answer: 2,
      clue: "A review that asks what we could have checked, with the time and the people we had, produces something you can actually do differently.",
      explanation:
        "여자는 무엇을 알았어야 하는지 묻는 검토는 가르치는 것이 없다며, 가진 시간과 사람으로 무엇을 확인할 수 있었는지를 물어야 한다고 말한다. 따라서 답은 ②이다.",
      translation: [
        "W: 어떤 일이 실패하면 팀이 가장 먼저 하는 일은 그 원인이 된 결정을 찾는 것입니다. 대개 그런 결정이 하나 있고, 그것을 찾으면 이해한 기분이 듭니다. 그런데 그 결정이 내려지던 날 그것이 어떻게 보였을지 생각해 보세요. 그때 있던 정보는 지금 있는 정보보다 얇았고, 여러분이 쥐고 있는 이야기에는 결말이 포함돼 있습니다. 그래서 검토는 그렇게 자주 같은 결론에 이릅니다. 누군가 미리 알아챘어야 했다는 것이지요. 물론 여기서 보면 그렇습니다. 무엇을 알았어야 하는지 묻는 검토는 아무것도 가르치지 못합니다. 다음번에는 모르는 것이 전혀 다른 자리에 앉아 있을 테니까요. 우리가 가진 시간과 사람으로 무엇을 확인할 수 있었는지 묻는 검토는 실제로 다르게 할 수 있는 무언가를 남깁니다. 첫 번째 질문은 지난 일을 재판합니다. 두 번째 질문은 다음 일을 바꿉니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["W", "Dohyun, is this the reading nook you built in the corner?"],
        ["M", "Yes, I finished it over the holiday."],
        ["W", "There's a striped cushion on the armchair."],
        ["M", "My sister made that from an old shirt."],
        ["W", "And a floor lamp with a round shade stands behind the chair."],
        ["M", "It's the only light I use after ten."],
        ["W", "I count three books stacked on the side table."],
        ["M", "There are four now. I added one this morning."],
        ["W", "The small clock on the windowsill is lovely."],
        ["M", "It was my grandfather's."],
        ["W", "And a map of the world hangs above the chair."],
        ["M", "I mark it every time I read about a new place."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "There are four now. I added one this morning.",
      explanation:
        "여자가 책이 세 권이라고 하자 남자가 네 권이라고 바로잡는다. 그림에는 세 권이 그려져 있으므로 답은 ③이다.",
      figure: {
        kind: "scene",
        scene:
          "A reading nook in a room corner drawn as one wide picture, clean black line art on white, no writing or letters anywhere. " +
          "An ARMCHAIR with a STRIPED CUSHION on its seat stands in the corner. " +
          "A FLOOR LAMP with a ROUND SHADE stands behind the armchair. " +
          "A SIDE TABLE beside the chair holds a stack of exactly THREE BOOKS, clearly countable. " +
          "A SMALL CLOCK sits on a windowsill. " +
          "A MAP OF THE WORLD hangs on the wall above the armchair.",
      },
      translation: [
        "W: 도현아, 이게 구석에 만든 독서 공간이야?",
        "M: 응, 연휴 동안 다 만들었어.",
        "W: 안락의자에 줄무늬 방석이 있네.",
        "M: 누나가 헌 셔츠로 만들어 줬어.",
        "W: 그리고 의자 뒤에 둥근 갓이 달린 스탠드가 서 있어.",
        "M: 10시 넘으면 그 불만 써.",
        "W: 협탁에 책이 세 권 쌓여 있는 게 보여.",
        "M: 지금은 네 권이야. 오늘 아침에 하나 더 뒀어.",
        "W: 창턱에 있는 작은 시계가 예쁘다.",
        "M: 할아버지 거였어.",
        "W: 그리고 의자 위에 세계 지도가 걸려 있네.",
        "M: 새로운 곳에 대해 읽을 때마다 거기에 표시해.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 남자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Dohyun, the debate tournament registration closes at six."],
        ["M", "I know. Did we submit the team roster?"],
        ["W", "Yes, all six names went in on Monday."],
        ["M", "Good. And the consent forms from the first-year members?"],
        ["W", "Collected and scanned. I uploaded them last night."],
        ["M", "Then the only thing left is the entry fee."],
        ["W", "It has to be transferred from the club account."],
        ["M", "Who has access to that account?"],
        ["W", "Both of us do, but I'm about to start my English test."],
        ["M", "Right, you can't touch a phone during it."],
        ["W", "Exactly. Can you make the transfer before six?"],
        ["M", "I'll do it now and send you the receipt."],
      ],
      choices: [
        "명단 제출하기",
        "동의서 모으기",
        "참가비 이체하기",
        "영어 시험 보기",
        "영수증 인쇄하기",
      ],
      answer: 3,
      clue: "I'll do it now and send you the receipt.",
      explanation:
        "명단과 동의서는 끝났고 여자는 영어 시험을 봐야 하므로, 남자가 6시 전에 참가비를 이체하기로 한다. 따라서 답은 ③이다.",
      translation: [
        "W: 도현아, 토론 대회 신청이 6시에 마감이야.",
        "M: 알아. 팀 명단은 냈어?",
        "W: 응, 월요일에 여섯 명 다 넣었어.",
        "M: 좋아. 1학년 부원들 동의서는?",
        "W: 다 받아서 스캔했어. 어젯밤에 올렸어.",
        "M: 그럼 남은 건 참가비뿐이네.",
        "W: 동아리 계좌에서 이체해야 해.",
        "M: 그 계좌는 누가 쓸 수 있어?",
        "W: 우리 둘 다. 그런데 나는 이제 영어 시험 시작해.",
        "M: 맞다, 시험 중엔 휴대폰 못 만지지.",
        "W: 그래. 6시 전에 이체해 줄 수 있어?",
        "M: 지금 하고 영수증 보낼게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 여자가 지불할 금액을 고르시오.",
      lines: [
        ["M", "Welcome to Harborview Guesthouse. How can I help you?"],
        ["W", "I'd like two rooms for three nights, please."],
        ["M", "Our standard room is sixty dollars a night."],
        ["W", "So two rooms for three nights is three hundred and sixty."],
        ["M", "That's right. Would you like breakfast included?"],
        ["W", "How much does breakfast add?"],
        ["M", "Ten dollars per person per morning, so sixty for two guests."],
        ["W", "We'll eat at the market instead. No breakfast, thank you."],
        ["M", "Certainly. Are you staying three nights or more?"],
        ["W", "Three, as I said."],
        ["M", "Then the three-night rate gives you ten percent off the rooms."],
        ["W", "Lovely. I'll pay the full amount now."],
      ],
      choices: ["$324.00", "$360.00", "$378.00", "$384.00", "$420.00"],
      answer: 1,
      clue: "Then the three-night rate gives you ten percent off the rooms.",
      explanation:
        "방 두 개 세 박은 360달러이고, 조식은 넣지 않았으며 3박 할인 10퍼센트를 빼면 324달러이다. 따라서 답은 ①이다.",
      translation: [
        "M: 하버뷰 게스트하우스입니다. 무엇을 도와드릴까요?",
        "W: 방 두 개를 3박으로 부탁드려요.",
        "M: 일반실은 하룻밤에 60달러입니다.",
        "W: 그럼 방 두 개 3박이면 360달러네요.",
        "M: 맞습니다. 조식도 넣으시겠어요?",
        "W: 조식은 얼마가 더 붙나요?",
        "M: 한 사람 한 끼에 10달러라서 두 분이면 60달러입니다.",
        "W: 저희는 시장에서 먹을게요. 조식은 빼 주세요.",
        "M: 알겠습니다. 3박 이상 묵으시나요?",
        "W: 말씀드린 대로 3박이요.",
        "M: 그럼 3박 요금으로 방값에서 10퍼센트를 빼 드립니다.",
        "W: 좋네요. 지금 전액 결제할게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 여자가 학생회장에 출마하지 않는 이유를 고르시오.",
      lines: [
        ["M", "Chaeyeon, your name isn't on the candidate list."],
        ["W", "I decided not to run this year."],
        ["M", "Is it because of the exam schedule?"],
        ["W", "No, the term ends before the campaign period."],
        ["M", "Did you not get enough recommendations?"],
        ["W", "I had twice the number I needed by Tuesday."],
        ["M", "Then what changed your mind?"],
        ["W", "I'm moving to my aunt's city in March."],
        ["M", "You're transferring? I had no idea."],
        ["W", "It was decided last week. I can't start a term I won't finish."],
      ],
      choices: [
        "시험 일정과 겹쳐서",
        "추천인이 모자라서",
        "성적이 떨어져서",
        "3월에 전학을 가게 되어서",
        "다른 후보를 돕기로 해서",
      ],
      answer: 4,
      clue: "I'm moving to my aunt's city in March.",
      explanation:
        "시험 일정도 추천인도 문제가 아니었고, 3월에 전학을 가게 되어 끝내지 못할 임기를 시작할 수 없기 때문이다. 따라서 답은 ④이다.",
      translation: [
        "M: 채연아, 후보 명단에 네 이름이 없네.",
        "W: 올해는 안 나가기로 했어.",
        "M: 시험 일정 때문이야?",
        "W: 아니, 선거 운동 기간 전에 학기가 끝나.",
        "M: 추천인이 모자랐어?",
        "W: 화요일에 이미 필요한 수의 두 배를 받았어.",
        "M: 그럼 뭐가 마음을 바꿨어?",
        "W: 3월에 이모 계신 도시로 이사 가.",
        "M: 전학 가? 전혀 몰랐어.",
        "W: 지난주에 정해졌어. 끝내지 못할 임기를 시작할 수는 없잖아.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, Coastal Cleanup Day에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["M", "Chaeyeon, did you hear about Coastal Cleanup Day?"],
        ["W", "The one at the beach? When is it?"],
        ["M", "The last Saturday of April, from nine to one."],
        ["W", "A morning event. Where exactly do we meet?"],
        ["M", "At the parking lot by the lighthouse, the north end of the beach."],
        ["W", "I know that lighthouse. What do we need to bring?"],
        ["M", "Just a hat and water. Gloves and bags are provided."],
        ["W", "That's easy enough. Who's organizing it?"],
        ["M", "The city's environment office, with two university clubs."],
        ["W", "Do they do anything at the end?"],
        ["M", "They weigh everything collected and post the total."],
        ["W", "Then let's go and make the number bigger."],
      ],
      choices: ["열리는 날", "참가 인원", "모이는 장소", "준비물", "주최 기관"],
      answer: 2,
      clue: "참가 인원은 대화에서 언급되지 않았다.",
      explanation:
        "날짜(4월 마지막 토요일), 장소(등대 옆 주차장), 준비물(모자와 물), 주최(시 환경과와 대학 동아리)는 언급되지만 참가 인원은 언급되지 않았다. 따라서 답은 ②이다.",
      translation: [
        "M: 채연아, 해안 정화의 날 들었어?",
        "W: 해변에서 하는 거? 언제야?",
        "M: 4월 마지막 토요일, 9시부터 1시까지.",
        "W: 오전 행사구나. 어디서 모여?",
        "M: 등대 옆 주차장에서. 해변 북쪽 끝이야.",
        "W: 그 등대 알아. 뭘 가져가야 해?",
        "M: 모자랑 물만. 장갑이랑 봉투는 준대.",
        "W: 간단하네. 누가 주최해?",
        "M: 시 환경과에서, 대학 동아리 두 곳이랑 같이.",
        "W: 끝나고 뭐 하는 거 있어?",
        "M: 모은 걸 다 무게 재서 총량을 올려.",
        "W: 그럼 가서 그 숫자를 키우자.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Arbor House Museum에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "W",
          "Let me tell you about the Arbor House Museum. " +
            "It is the oldest wooden house still standing in this province, built in 1798. " +
            "The museum is open from Wednesday to Sunday, and closed on Monday and Tuesday. " +
            "Admission is free for everyone, with no ticket required at the door. " +
            "Photography is allowed in the garden but not inside the house itself. " +
            "A guided tour in English runs twice a day, at eleven and at three. " +
            "The upper floor can only be reached by a narrow staircase, so it is not wheelchair accessible.",
        ],
      ],
      choices: [
        "1798년에 지어졌다",
        "월요일과 화요일에 문을 닫는다",
        "입장료가 없다",
        "영어 안내가 하루 두 번 있다",
        "집 안에서도 사진을 찍을 수 있다",
      ],
      answer: 5,
      clue: "Photography is allowed in the garden but not inside the house itself.",
      explanation:
        "정원에서는 사진을 찍을 수 있지만 집 안에서는 안 된다고 했으므로 ⑤는 내용과 다르다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 아버하우스 박물관을 소개해 드리겠습니다. 이 도에서 아직 서 있는 가장 오래된 목조 주택으로, 1798년에 지어졌습니다. 박물관은 수요일부터 일요일까지 열고, 월요일과 화요일은 닫습니다. 입장료는 누구에게나 무료이며, 문에서 표를 받지 않습니다. 사진은 정원에서는 찍을 수 있지만 집 안에서는 안 됩니다. 영어 안내는 하루 두 번, 11시와 3시에 있습니다. 위층은 좁은 계단으로만 올라갈 수 있어서 휠체어로는 갈 수 없습니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 예약할 스터디 카페 자리를 고르시오.",
      lines: [
        ["W", "Dohyun, let's book seats at the study café for the weekend."],
        ["M", "Five types are listed. Do we want an open desk or a booth?"],
        ["W", "A booth. I can't focus with people walking behind me."],
        ["M", "Agreed. Do we need a power outlet at the seat?"],
        ["W", "Definitely. My laptop lasts two hours at most."],
        ["M", "Then the ones without outlets are out."],
        ["W", "And the price? I'd rather not go over five thousand won an hour."],
        ["M", "Same here. My weekend budget is tight."],
        ["W", "Then only one type clears all three."],
        ["M", "Let's book it for Saturday and Sunday both."],
        ["W", "I'll reserve it on the app now."],
        ["M", "Send me the booking number when it comes."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "A booth. I can't focus with people walking behind me.",
      explanation:
        "부스형이고, 자리에 콘센트가 있으며, 시간당 5천 원 이하인 자리를 고른다. 세 조건을 모두 채우는 것은 ③이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Type: Open desk / Outlet: Yes / Price: 3,000 won per hour" },
          { no: 2, label: "②", value: "Type: Booth / Outlet: No / Price: 3,500 won per hour" },
          { no: 3, label: "③", value: "Type: Booth / Outlet: Yes / Price: 4,500 won per hour" },
          { no: 4, label: "④", value: "Type: Booth / Outlet: Yes / Price: 7,000 won per hour" },
          { no: 5, label: "⑤", value: "Type: Open desk / Outlet: No / Price: 2,500 won per hour" },
        ],
      },
      translation: [
        "W: 도현아, 주말에 쓸 스터디 카페 자리 예약하자.",
        "M: 다섯 종류가 있네. 열린 책상으로 할까, 부스로 할까?",
        "W: 부스. 뒤로 사람이 지나가면 집중이 안 돼.",
        "M: 동의해. 자리에 콘센트 필요해?",
        "W: 당연하지. 내 노트북은 길어야 두 시간이야.",
        "M: 그럼 콘센트 없는 건 빠지네.",
        "W: 값은? 시간당 5천 원은 안 넘었으면 좋겠어.",
        "M: 나도. 주말 예산이 빠듯해.",
        "W: 그럼 세 조건 다 넘는 건 하나뿐이야.",
        "M: 토요일 일요일 둘 다 예약하자.",
        "W: 지금 앱으로 예약할게.",
        "M: 예약 번호 나오면 보내 줘.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["M", "Chaeyeon, is the library open on the holiday?"],
        ["W", "The main building is closed, but the annex isn't."],
        ["M", "I didn't know the annex opened separately."],
        ["W", "It does, from ten to five, through the side entrance."],
      ],
      choices: [
        "I'll use the side entrance, then.",
        "The annex closed last year.",
        "I don't need to study at all.",
        "The main building never closes.",
        "I'll go there at eight in the morning.",
      ],
      answer: 1,
      clue: "It does, from ten to five, through the side entrance.",
      explanation:
        "여자가 별관은 옆문으로 10시부터 5시까지 연다고 했으므로, 옆문으로 가겠다는 ①이 가장 자연스럽다.",
      translation: [
        "M: 채연아, 공휴일에 도서관 열어?",
        "W: 본관은 닫는데 별관은 열어.",
        "M: 별관이 따로 여는 줄 몰랐어.",
        "W: 열어. 10시부터 5시까지, 옆문으로 들어가면 돼.",
        "M: 그럼 옆문으로 갈게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["W", "Dohyun, my interview is in Seoul at ten on Friday."],
        ["M", "How long does the train take from here?"],
        ["W", "Two hours, and the first one leaves at seven."],
        ["M", "That leaves you fifty minutes to cross the city. Book the six o'clock."],
      ],
      choices: [
        "My interview is on Saturday.",
        "The train takes five hours.",
        "I'll drive there instead.",
        "I'll change my ticket to six.",
        "Fifty minutes is more than enough.",
      ],
      answer: 4,
      clue: "That leaves you fifty minutes to cross the city. Book the six o'clock.",
      explanation:
        "남자가 6시 기차를 예약하라고 했으므로, 표를 6시로 바꾸겠다는 ④가 가장 자연스럽다.",
      translation: [
        "W: 도현아, 내 면접이 금요일 10시에 서울에서 있어.",
        "M: 여기서 기차로 얼마나 걸려?",
        "W: 두 시간. 첫차가 7시야.",
        "M: 그럼 시내를 가로지를 시간이 50분뿐이네. 6시 걸로 예약해.",
        "W: 표를 6시로 바꿀게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Chaeyeon, you've dropped out of the science fair three years running."],
        ["W", "I always start, and then I stop somewhere in the middle."],
        ["M", "Where exactly does it stop?"],
        ["W", "When the data doesn't show what I expected."],
        ["M", "And then the project feels ruined?"],
        ["W", "It feels like I picked the wrong question."],
        ["M", "Did you ever ask a judge what they're scoring?"],
        ["W", "I assumed they score whether the hypothesis held."],
        ["M", "They score the reasoning. A result that surprised you is the interesting one."],
        ["W", "So the year my data fell apart was the year I should have written it up."],
        ["M", "Take this year's messy data and write exactly what it did instead."],
      ],
      choices: [
        "I'll change my hypothesis to fit the data.",
        "I'll write up the results as they came out.",
        "I'll drop out again this year.",
        "My data always matches perfectly.",
        "I'll ask the judges to change the rules.",
      ],
      answer: 2,
      clue: "Take this year's messy data and write exactly what it did instead.",
      explanation:
        "남자가 올해의 어지러운 자료를 있는 그대로 써 내라고 했으므로, 나온 대로 결과를 정리해 쓰겠다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 채연아, 너 과학 전시회를 3년 연속 중간에 그만뒀네.",
        "W: 늘 시작은 하는데 중간 어디쯤에서 멈춰.",
        "M: 정확히 어디서 멈추는데?",
        "W: 자료가 내가 기대한 걸 보여 주지 않을 때.",
        "M: 그러면 과제가 망한 것처럼 느껴져?",
        "W: 질문을 잘못 골랐다는 기분이 들어.",
        "M: 심사위원한테 뭘 점수로 보는지 물어본 적 있어?",
        "W: 가설이 맞았는지를 볼 거라고 생각했어.",
        "M: 추론을 봐. 너를 놀라게 한 결과가 오히려 흥미로운 쪽이야.",
        "W: 그럼 자료가 무너진 해가 오히려 써 냈어야 할 해였네.",
        "M: 올해의 어지러운 자료를 갖고, 그게 실제로 무엇을 했는지 그대로 써.",
        "W: 나온 대로 결과를 정리해서 쓸게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Dohyun, you've been carrying the group project by yourself again."],
        ["M", "It's faster than explaining each part to everyone."],
        ["W", "Faster this week. What about the presentation?"],
        ["M", "I'll present it. I know the material best."],
        ["W", "And the four of them will stand there saying nothing."],
        ["M", "That's better than someone freezing on a slide they don't understand."],
        ["W", "The teacher grades participation for every member."],
        ["M", "Then they should have participated."],
        ["W", "They couldn't. You finished each part before anyone could start."],
        ["M", "I didn't think of it that way."],
        ["W", "Give each of them one slide tonight and walk them through it."],
      ],
      choices: [
        "I'll present the whole thing alone.",
        "There are no slides in this project.",
        "They already know the material.",
        "I'll ask for a different group.",
        "I'll hand out a slide to each of them.",
      ],
      answer: 5,
      clue: "Give each of them one slide tonight and walk them through it.",
      explanation:
        "여자가 오늘 밤 한 사람에게 한 장씩 맡기고 설명해 주라고 했으므로, 각자에게 한 장씩 나눠 주겠다는 ⑤가 가장 자연스럽다.",
      translation: [
        "W: 도현아, 모둠 과제를 또 혼자 떠맡고 있네.",
        "M: 다 설명하는 것보다 그게 빨라.",
        "W: 이번 주만 빠르지. 발표는 어떡할 건데?",
        "M: 내가 하지. 내용을 제일 잘 아니까.",
        "W: 그럼 나머지 넷은 아무 말도 없이 서 있겠네.",
        "M: 모르는 장면에서 얼어붙는 것보다는 낫잖아.",
        "W: 선생님은 참여도를 사람마다 점수로 보셔.",
        "M: 그럼 참여했어야지.",
        "W: 못 했지. 누가 시작하기도 전에 네가 다 끝냈으니까.",
        "M: 그렇게는 생각 못 했어.",
        "W: 오늘 밤에 한 사람에게 한 장씩 맡기고 설명해 줘.",
        "M: 각자한테 한 장씩 나눠 줄게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Yeeun이 Seohan에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Yeeun : ________________",
      lines: [
        [
          "M",
          "Yeeun and Seohan volunteer together at a small neighborhood library on Saturday mornings. " +
            "Their main job is shelving the books that were returned during the week. " +
            "Seohan works quickly and has shelved more books than anyone else this month. " +
            "This morning Yeeun notices that he is putting the returned picture books " +
            "on the lowest shelf of the adult fiction section, because that shelf happens to be empty. " +
            "The children who use the library cannot find them there, " +
            "and last week two parents asked the librarian where the picture books had gone. " +
            "Yeeun knows Seohan is not being careless about the work itself, " +
            "only about where a book ends up, and that the children's corner has room if the top shelf is used. " +
            "She wants to tell him to shelve the picture books in the children's corner instead. " +
            "In this situation, what would Yeeun most likely say to Seohan?",
        ],
      ],
      choices: [
        "You should work a little more slowly today.",
        "Let's move the adult fiction section upstairs.",
        "Let's shelve those picture books in the children's corner.",
        "We should stop shelving returned books.",
        "Let's ask the parents to look downstairs.",
      ],
      answer: 3,
      clue: "She wants to tell him to shelve the picture books in the children's corner instead.",
      explanation:
        "예은이는 그림책을 어린이 자리에 꽂자고 말하려 하므로 ③이 가장 적절하다.",
      translation: [
        "M: 예은이와 서한이는 토요일 아침마다 동네 작은 도서관에서 함께 봉사합니다. 주된 일은 한 주 동안 반납된 책을 서가에 꽂는 것입니다. 서한이는 손이 빨라서 이번 달에 누구보다 많은 책을 꽂았습니다. 오늘 아침 예은이는 서한이가 반납된 그림책을 성인 소설 서가의 맨 아래 칸에 꽂고 있는 것을 봅니다. 그 칸이 마침 비어 있기 때문입니다. 도서관을 쓰는 아이들은 거기서 그림책을 찾을 수 없고, 지난주에는 학부모 두 분이 사서에게 그림책이 어디로 갔느냐고 물었습니다. 예은이는 서한이가 일 자체를 대충 하는 것이 아니라 책이 어디에 놓이는지에만 무심하다는 것을 알고, 어린이 자리도 맨 위 칸을 쓰면 자리가 난다는 것을 압니다. 예은이는 그림책을 어린이 자리에 꽂자고 말하고 싶습니다. 이런 상황에서 예은이가 서한이에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 남자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Hello, everyone. Today I want to talk about how a single word can change what people remember. " +
            "In a well-known experiment, people watched the same short film of two cars colliding. " +
            "Afterwards they were asked how fast the cars were going when they hit each other. " +
            "For some, the word hit was replaced with smashed, and for others with contacted. " +
            "Nothing else in the question changed. " +
            "The smashed group gave speeds around ten kilometers per hour higher than the contacted group. " +
            "A week later the same people were asked whether they had seen broken glass. " +
            "There was none in the film, " +
            "but the smashed group was more than twice as likely to say they had seen it. " +
            "The memory had not simply been reported differently. " +
            "It had been rebuilt around the word, and the new version felt like the original.",
        ],
      ],
      choices: [
        "how the wording of a question reshapes memory",
        "why car accidents are hard to investigate",
        "how people estimate the speed of vehicles",
        "why witnesses disagree about what they saw",
        "how films are used in psychology classes",
      ],
      answer: 1,
      clue: "It had been rebuilt around the word, and the new version felt like the original.",
      explanation:
        "남자는 질문에 쓰인 단어 하나가 속도 추정과 있지도 않은 깨진 유리의 기억까지 바꾸었다고 설명한다. 따라서 답은 ①이다.",
      translation: [
        "M: 안녕하세요, 여러분. 오늘은 단어 하나가 사람들이 기억하는 것을 어떻게 바꾸는지 이야기하려 합니다. 잘 알려진 실험에서 사람들은 자동차 두 대가 부딪히는 같은 짧은 영상을 보았습니다. 그 뒤 차들이 서로 '부딪혔을' 때 얼마나 빨랐냐는 질문을 받았습니다. 어떤 사람들에게는 '부딪혔다'가 '박살 났다'로, 어떤 사람들에게는 '닿았다'로 바뀌었습니다. 질문의 다른 부분은 그대로였습니다. '박살 났다' 집단은 '닿았다' 집단보다 시속 10킬로미터쯤 높은 속도를 말했습니다. 일주일 뒤 같은 사람들에게 깨진 유리를 보았느냐고 물었습니다. 영상에는 깨진 유리가 없었습니다. 그런데 '박살 났다' 집단은 보았다고 답할 확률이 두 배가 넘었습니다. 기억이 다르게 보고된 것이 아니었습니다. 그 단어를 중심으로 다시 지어졌고, 새 판본이 원본처럼 느껴졌던 것입니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 실험 내용이 아닌 것은?",
      lines: [
        ["M", "Hello, everyone. Today I want to talk about how a single word can change what people remember."],
        ["M", "In a well-known experiment, people watched the same short film of two cars colliding."],
        ["M", "Afterwards they were asked how fast the cars were going when they hit each other."],
        ["M", "For some, the word hit was replaced with smashed, and for others with contacted."],
        ["M", "The smashed group gave speeds around ten kilometers per hour higher than the contacted group."],
        ["M", "A week later the same people were asked whether they had seen broken glass."],
        ["M", "There was none in the film, but the smashed group was more than twice as likely to say they had seen it."],
      ],
      choices: [
        "watching the same short film of a collision",
        "being asked how fast the cars were going",
        "having one word in the question replaced",
        "being shown the film a second time",
        "being asked a week later about broken glass",
      ],
      answer: 4,
      clue: "A week later the same people were asked whether they had seen broken glass.",
      explanation:
        "같은 영상 보기, 속도 질문받기, 질문의 단어 하나가 바뀌기, 일주일 뒤 깨진 유리에 대해 질문받기는 언급되지만 영상을 두 번째로 보여 준 것은 언급되지 않았다. 따라서 답은 ④이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
