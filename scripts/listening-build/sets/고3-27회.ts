/** 고3 듣기 27회 — 사람이 직접 쓴 회차 (2026-09-25) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고3 27회",
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
          "Good afternoon, students. This is Mr. Wi from the third-year office. " +
            "I want to talk about the mock interview sign-up sheet. " +
            "We opened forty slots last Monday, and all forty were taken within an hour. " +
            "Since then, eleven of those slots have gone unused " +
            "because the student did not come and did not tell anyone. " +
            "Each empty slot is twenty minutes of an alumnus who took a day off work. " +
            "So from this week, if you cannot come, cross your name out on the sheet " +
            "by the evening before, and someone on the waiting list will take it. " +
            "Nobody is in trouble for changing their mind. " +
            "The only problem is a chair that stays empty. Thank you.",
        ],
      ],
      choices: [
        "모의 면접 신청을 새로 받으려고",
        "면접 일정 변경을 알리려고",
        "졸업생 강연을 안내하려고",
        "못 오면 미리 이름을 지워 달라고 부탁하려고",
        "면접 복장 규정을 알리려고",
      ],
      answer: 4,
      clue: "So from this week, if you cannot come, cross your name out on the sheet by the evening before.",
      explanation:
        "남자는 빈자리가 생기지 않도록 못 오게 되면 전날 저녁까지 신청표에서 이름을 지워 달라고 부탁한다. 따라서 답은 ④이다.",
      translation: [
        "M: 학생 여러분, 안녕하세요. 3학년부 위입니다. 모의 면접 신청표에 대해 말씀드리려 합니다. 지난 월요일에 마흔 자리를 열었고, 한 시간 만에 마흔 자리가 다 찼습니다. 그 뒤로 그중 열한 자리가 그냥 비었습니다. 학생이 오지도 않고 아무에게도 말하지 않았기 때문입니다. 빈자리 하나는 회사에 하루 휴가를 내고 오신 동문의 20분입니다. 그러니 이번 주부터는 못 오게 되면 전날 저녁까지 신청표에서 이름을 지워 주세요. 그러면 대기자가 그 자리를 씁니다. 마음이 바뀐 것으로 혼나는 사람은 없습니다. 문제는 비어 있는 의자뿐입니다. 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 여자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Yerim, I've been doing my hardest subject last, every night."],
        ["W", "Last? After five hours of everything else?"],
        ["M", "That's the plan. I save it for when I've warmed up."],
        ["W", "And how often do you actually reach it?"],
        ["M", "Twice this week. The other nights I ran out of time."],
        ["W", "So the subject you most need is the one that gets cut."],
        ["M", "I hadn't thought of it as being cut."],
        ["W", "Whatever sits at the end of a list is optional, whether you meant it or not."],
        ["M", "But I'm sharpest at nine, not at five."],
        ["W", "Then do it at nine. Just make it the first thing at nine."],
        ["M", "So the order matters more than the warming up."],
        ["W", "Put it first in whatever block you're actually alert in."],
      ],
      choices: [
        "공부는 컨디션이 좋을 때 해야 한다",
        "가장 중요한 과목을 먼저 해야 한다",
        "계획은 순서대로 지켜야 한다",
        "어려운 과목은 나눠서 해야 한다",
        "공부 시간을 늘려야 한다",
      ],
      answer: 2,
      clue: "Put it first in whatever block you're actually alert in.",
      explanation:
        "여자는 목록 끝에 있는 것은 결국 선택 사항이 된다며, 정신이 맑은 시간대의 맨 앞에 두라고 말한다. 따라서 답은 ②이다.",
      translation: [
        "M: 예림아, 나 매일 밤 제일 어려운 과목을 마지막에 해.",
        "W: 마지막에? 다른 걸 다섯 시간 하고 나서?",
        "M: 그게 계획이야. 몸이 풀린 다음으로 아껴 두는 거지.",
        "W: 실제로 거기까지 얼마나 자주 가?",
        "M: 이번 주에 두 번. 나머지 날은 시간이 모자랐어.",
        "W: 그럼 제일 필요한 과목이 잘려 나가는 과목이 된 거네.",
        "M: 잘린다고 생각해 본 적은 없어.",
        "W: 목록 끝에 있는 건 네 뜻과 상관없이 선택 사항이 돼.",
        "M: 그런데 나는 9시에 가장 맑아. 5시가 아니라.",
        "W: 그럼 9시에 해. 다만 9시의 첫 번째로 해.",
        "M: 그럼 몸 푸는 것보다 순서가 중요한 거구나.",
        "W: 네가 실제로 맑은 시간대의 맨 앞에 둬.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "There is a difference between a rule and a reason, " +
            "and most organizations forget which one they are holding. " +
            "A rule begins its life as a reason. " +
            "Someone noticed a problem and wrote a sentence to prevent it. " +
            "Ten years later, the problem is gone, the person has left, " +
            "and the sentence is still enforced by people who never met either. " +
            "You can tell the difference by asking a simple question. " +
            "If someone can explain what would go wrong without this rule, " +
            "using something that happened rather than something imagined, " +
            "it is still a reason. " +
            "If the best answer anyone has is that this is how it is done, " +
            "then the reason died some time ago " +
            "and the rule has been drawing a salary ever since.",
        ],
      ],
      choices: [
        "규칙은 많을수록 조직이 안정된다",
        "새로운 규칙을 자주 만들어야 한다",
        "규칙은 모두가 지켜야 한다",
        "문제는 생기기 전에 막아야 한다",
        "규칙은 그 이유가 살아 있는지 물어야 한다",
      ],
      answer: 5,
      clue: "If the best answer anyone has is that this is how it is done, then the reason died some time ago",
      explanation:
        "남자는 규칙이 이유에서 시작되지만 이유가 죽은 뒤에도 남는다며, 그 이유가 살아 있는지 물어야 한다고 말한다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 규칙과 이유는 다른데, 대부분의 조직은 자기가 어느 쪽을 쥐고 있는지 잊습니다. 규칙은 이유로 태어납니다. 누군가 문제를 발견하고 그것을 막으려고 한 문장을 썼습니다. 10년이 지나면 그 문제는 사라졌고, 그 사람은 떠났고, 그 문장은 둘 중 어느 것도 만난 적 없는 사람들에 의해 여전히 지켜집니다. 간단한 질문 하나로 구분할 수 있습니다. 이 규칙이 없으면 무엇이 잘못될지를, 상상한 일이 아니라 실제로 있었던 일로 설명할 수 있는 사람이 있다면, 그것은 아직 이유입니다. 누구에게서 나오는 가장 나은 답이 원래 그렇게 한다는 말뿐이라면, 그 이유는 오래전에 죽었고 규칙만 그때부터 월급을 받아 온 것입니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["W", "Dongha, is this the study corner you built at home?"],
        ["M", "Yes, I finished it over the winter break."],
        ["W", "There's a wide desk against the window."],
        ["M", "The light is best there until about four."],
        ["W", "And a corkboard hangs on the wall beside the window."],
        ["M", "I pin the week's deadlines on it."],
        ["W", "I count three shelves on the bookcase."],
        ["M", "There are four. The bottom one is behind the chair."],
        ["W", "The swivel chair looks comfortable enough."],
        ["M", "It came from my uncle's office."],
        ["W", "And a floor fan stands in the corner."],
        ["M", "That room gets hot by two in the afternoon."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "There are four. The bottom one is behind the chair.",
      explanation:
        "여자가 책장 선반이 세 칸이라고 하자 남자가 네 칸이라고 바로잡는다. 그림에는 세 칸이 그려져 있으므로 답은 ③이다.",
      figure: {
        kind: "scene",
        scene:
          "A home study corner drawn as one wide picture, clean black line art on white, no writing or letters or numbers anywhere. " +
          "A WIDE DESK stands against a window. " +
          "A CORKBOARD with a few blank pinned notes hangs on the wall beside the window. " +
          "A BOOKCASE with EXACTLY THREE SHELVES of books stands beside the desk, the shelves clearly separated and easy to count. " +
          "A SWIVEL CHAIR with wheels stands at the desk. " +
          "A FLOOR FAN on a stand stands in the corner.",
      },
      translation: [
        "W: 동하야, 이게 집에 만든 공부 자리야?",
        "M: 응, 겨울 방학 동안 다 만들었어.",
        "W: 창문 쪽에 넓은 책상이 있네.",
        "M: 4시쯤까지는 거기가 제일 밝아.",
        "W: 그리고 창문 옆 벽에 코르크판이 걸려 있어.",
        "M: 그 주의 마감을 거기 꽂아 둬.",
        "W: 책장에 선반이 세 칸 보여.",
        "M: 네 칸이야. 맨 아래는 의자 뒤에 있어.",
        "W: 바퀴 의자가 편해 보인다.",
        "M: 삼촌 사무실에서 가져온 거야.",
        "W: 그리고 구석에 선풍기가 서 있어.",
        "M: 그 방은 오후 2시면 더워져.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 여자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Yerim, the graduation rehearsal is at two in the hall."],
        ["W", "I know. Are the chairs laid out by class?"],
        ["M", "All four hundred, and the aisles are the right width."],
        ["W", "Good. And the name cards for the front row?"],
        ["M", "Printed and placed. I checked them against the list."],
        ["W", "Then what's still open?"],
        ["M", "The microphone stand on the stage is broken at the joint."],
        ["W", "Can it be fixed, or do we need another one?"],
        ["M", "Another one. The music room has a spare."],
        ["W", "Who has the music room key?"],
        ["M", "Ms. Jo, but I have to run the seating order with the homeroom teachers."],
        ["W", "Then I'll get the spare stand from the music room."],
      ],
      choices: [
        "마이크 받침대 가져오기",
        "의자 배치하기",
        "이름표 놓기",
        "담임 선생님들과 회의하기",
        "무대 청소하기",
      ],
      answer: 1,
      clue: "Then I'll get the spare stand from the music room.",
      explanation:
        "의자와 이름표는 끝났고 남자는 담임 선생님들과 좌석 순서를 맞춰야 하므로, 여자가 음악실에서 여분 받침대를 가져오기로 한다. 따라서 답은 ①이다.",
      translation: [
        "M: 예림아, 졸업식 예행연습이 2시에 강당에서 있어.",
        "W: 알아. 의자는 반별로 놓았어?",
        "M: 사백 개 다. 통로 너비도 맞췄어.",
        "W: 좋아. 앞줄 이름표는?",
        "M: 인쇄해서 놓았어. 명단이랑 대조했고.",
        "W: 그럼 아직 남은 게 뭐야?",
        "M: 무대 마이크 받침대가 이음새에서 부러졌어.",
        "W: 고칠 수 있어, 아니면 다른 게 필요해?",
        "M: 다른 게 필요해. 음악실에 여분이 있어.",
        "W: 음악실 열쇠는 누가 갖고 있어?",
        "M: 조 선생님. 그런데 나는 담임 선생님들이랑 좌석 순서를 맞춰야 해.",
        "W: 그럼 내가 음악실에서 여분 받침대 가져올게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 남자가 지불할 금액을 고르시오.",
      lines: [
        ["W", "Welcome to Beacon Language Center. How can I help you?"],
        ["M", "I'd like to register for the winter speaking course."],
        ["W", "The eight-week course is two hundred dollars."],
        ["M", "And is the textbook separate?"],
        ["W", "It is. The book is forty dollars."],
        ["M", "I'll take the book as well, then."],
        ["W", "Two hundred and forty. Would you like the online review option?"],
        ["M", "How much is that?"],
        ["W", "Thirty dollars for the whole term."],
        ["M", "I'll skip that. I won't use it."],
        ["W", "Understood. Are you a high school student?"],
        ["M", "I am, here's my card."],
        ["W", "Then I can take fifteen percent off the course fee, but not the book."],
      ],
      choices: ["$170.00", "$204.00", "$240.00", "$210.00", "$270.00"],
      answer: 4,
      clue: "Then I can take fifteen percent off the course fee, but not the book.",
      explanation:
        "수강료 200달러에서 15퍼센트를 빼면 170달러이고, 할인이 안 되는 교재값 40달러를 더하면 210달러이다. 따라서 답은 ④이다.",
      translation: [
        "W: 비컨 어학원입니다. 무엇을 도와드릴까요?",
        "M: 겨울 말하기 강좌를 신청하려고요.",
        "W: 8주 과정은 200달러입니다.",
        "M: 교재는 따로인가요?",
        "W: 네. 책은 40달러입니다.",
        "M: 그럼 책도 할게요.",
        "W: 240달러입니다. 온라인 복습 기능도 하시겠어요?",
        "M: 그건 얼마예요?",
        "W: 한 학기에 30달러입니다.",
        "M: 그건 뺄게요. 안 쓸 것 같아요.",
        "W: 알겠습니다. 고등학생이신가요?",
        "M: 네, 여기 학생증이요.",
        "W: 그럼 수강료에서 15퍼센트를 빼 드립니다. 교재는 안 돼요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 여자가 동아리 회장을 맡지 않는 이유를 고르시오.",
      lines: [
        ["M", "Yerim, you turned down the club president position?"],
        ["W", "Last Thursday, yes."],
        ["M", "Is it because of the exam schedule?"],
        ["W", "The term ends before the busiest part of the job."],
        ["M", "Then did the members not want you?"],
        ["W", "They asked me twice, actually."],
        ["M", "So what stopped you?"],
        ["W", "The president has to attend the Saturday council meetings."],
        ["M", "And Saturday is your tutoring day."],
        ["W", "Every Saturday since last March. I can't drop those students now."],
      ],
      choices: [
        "시험 일정과 겹쳐서",
        "토요일 과외와 겹쳐서",
        "회원들이 반대해서",
        "성적이 떨어져서",
        "전학을 가게 되어서",
      ],
      answer: 2,
      clue: "The president has to attend the Saturday council meetings.",
      explanation:
        "시험도 회원들도 문제가 아니었고, 회장이 나가야 하는 토요일 회의가 과외와 겹치기 때문이다. 따라서 답은 ②이다.",
      translation: [
        "M: 예림아, 동아리 회장 자리를 거절했다며.",
        "W: 지난 목요일에, 응.",
        "M: 시험 일정 때문이야?",
        "W: 제일 바쁜 시기 전에 학기가 끝나.",
        "M: 그럼 회원들이 반대했어?",
        "W: 사실 두 번이나 부탁했어.",
        "M: 그럼 뭐가 걸렸는데?",
        "W: 회장은 토요일 협의회에 나가야 해.",
        "M: 토요일은 네가 과외하는 날이잖아.",
        "W: 작년 3월부터 매주 토요일. 이제 와서 그 학생들을 놓을 수는 없어.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, Springfield Career Day에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["M", "Yerim, are you going to Springfield Career Day?"],
        ["W", "I want to. When is it held?"],
        ["M", "The second Thursday of November, all day."],
        ["W", "A weekday. Where does it take place?"],
        ["M", "At the city convention hall, two stops from the station."],
        ["W", "That's easy to reach. Who comes to speak?"],
        ["M", "Around thirty people, from hospitals, studios, labs and law firms."],
        ["W", "That's a wide range. How does it work on the day?"],
        ["M", "Twenty-minute talks in the morning, then small group tables after lunch."],
        ["W", "Do we have to book a table in advance?"],
        ["M", "You pick three tables when you register online."],
        ["W", "Then let's register tonight."],
      ],
      choices: ["열리는 날", "열리는 장소", "참여 직업군", "진행 방식", "참가 인원"],
      answer: 5,
      clue: "참가 인원은 대화에서 언급되지 않았다.",
      explanation:
        "날짜(11월 둘째 주 목요일), 장소(시 컨벤션홀), 참여 직업군(병원·작업실·연구실·법률 사무소), 진행 방식(오전 강연과 오후 모둠 탁자)은 언급되지만 참가 인원은 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 예림아, 스프링필드 진로의 날 갈 거야?",
        "W: 가고 싶어. 언제 열려?",
        "M: 11월 둘째 주 목요일, 하루 종일.",
        "W: 평일이구나. 어디서 해?",
        "M: 시 컨벤션홀에서. 역에서 두 정거장이야.",
        "W: 가기 쉽네. 누가 와서 이야기해?",
        "M: 서른 분쯤. 병원, 작업실, 연구실, 법률 사무소에서 오셔.",
        "W: 폭이 넓다. 당일엔 어떻게 진행돼?",
        "M: 오전엔 20분짜리 강연, 점심 뒤엔 소규모 모둠 탁자.",
        "W: 탁자는 미리 예약해야 해?",
        "M: 온라인으로 신청할 때 세 개를 고르는 거야.",
        "W: 그럼 오늘 밤에 신청하자.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Old Mill Nature Trail에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "W",
          "Let me tell you about the Old Mill Nature Trail. " +
            "The trail runs five kilometers along the creek from the mill to the reservoir. " +
            "It is flat the whole way and surfaced with packed gravel. " +
            "The gate opens at sunrise and closes at sunset, every day of the year. " +
            "Bicycles are allowed, but only on the section below the footbridge. " +
            "There are three rest shelters, each with a bench and a water tap. " +
            "Dogs must be on a leash, and there is no charge to use the trail.",
        ],
      ],
      choices: [
        "길이가 5킬로미터이다",
        "전 구간이 평평하다",
        "자전거는 전 구간에서 탈 수 있다",
        "일 년 내내 매일 연다",
        "쉼터가 세 곳 있다",
      ],
      answer: 3,
      clue: "Bicycles are allowed, but only on the section below the footbridge.",
      explanation:
        "자전거는 보행교 아래 구간에서만 탈 수 있다고 했으므로 전 구간이라는 ③은 내용과 다르다. 따라서 답은 ③이다.",
      translation: [
        "W: 올드밀 자연 산책로를 소개해 드리겠습니다. 이 길은 방앗간에서 저수지까지 개울을 따라 5킬로미터 이어집니다. 처음부터 끝까지 평평하고 다져진 자갈로 포장돼 있습니다. 문은 해 뜰 때 열고 해 질 때 닫으며, 일 년 내내 매일 엽니다. 자전거는 탈 수 있지만 보행교 아래 구간에서만 됩니다. 쉼터가 세 곳 있고, 각각 벤치와 수도가 있습니다. 개는 줄을 매야 하며, 이용료는 없습니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 구입할 독서대를 고르시오.",
      lines: [
        ["M", "Yerim, let's pick a book stand for the study room."],
        ["W", "Five models here. Should the angle be adjustable?"],
        ["M", "Yes. Everyone sits at a different height."],
        ["W", "Agreed. And do we want it to fold flat?"],
        ["M", "Definitely. The desks get cleared every evening."],
        ["W", "Right. And the price? The club left us thirty thousand won."],
        ["M", "So thirty thousand is the ceiling."],
        ["W", "Then only one model clears all three."],
        ["M", "Let's order before the fund closes on Friday."],
        ["W", "I'll place it tonight and forward the receipt."],
        ["M", "Thanks. I'll clear a space on the shelf."],
        ["W", "It should arrive by the middle of next week."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 1,
      clue: "Yes. Everyone sits at a different height.",
      explanation:
        "각도 조절이 되고, 접히며, 3만 원 이하인 것을 고른다. 세 조건을 모두 채우는 것은 ①이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Adjustable: Yes / Folds flat: Yes / Price: 27,000 won" },
          { no: 2, label: "②", value: "Adjustable: No / Folds flat: Yes / Price: 15,000 won" },
          { no: 3, label: "③", value: "Adjustable: Yes / Folds flat: No / Price: 22,000 won" },
          { no: 4, label: "④", value: "Adjustable: Yes / Folds flat: Yes / Price: 45,000 won" },
          { no: 5, label: "⑤", value: "Adjustable: No / Folds flat: No / Price: 9,000 won" },
        ],
      },
      translation: [
        "M: 예림아, 자습실에 둘 독서대 고르자.",
        "W: 다섯 종류 있네. 각도 조절이 돼야 할까?",
        "M: 응. 사람마다 앉는 높이가 달라.",
        "W: 동의해. 납작하게 접히는 게 좋을까?",
        "M: 당연하지. 책상은 저녁마다 비우잖아.",
        "W: 맞아. 값은? 동아리에서 3만 원 남겨 줬어.",
        "M: 그럼 3만 원이 한계네.",
        "W: 그럼 세 조건 다 넘는 건 하나뿐이야.",
        "M: 금요일에 예산 마감이니까 그전에 주문하자.",
        "W: 오늘 밤에 주문하고 영수증 보낼게.",
        "M: 고마워. 나는 선반에 자리 치워 둘게.",
        "W: 다음 주 중반엔 올 거야.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["W", "Dongha, is the school open on the exam holiday?"],
        ["M", "The building is, but only the third floor."],
        ["W", "My locker is on the first floor, though."],
        ["M", "Get what you need today. The first floor stays locked all day."],
      ],
      choices: [
        "The first floor is always open.",
        "I don't have a locker.",
        "I'll go on the holiday anyway.",
        "I'll clear my locker today.",
        "My locker is on the third floor.",
      ],
      answer: 4,
      clue: "Get what you need today. The first floor stays locked all day.",
      explanation:
        "남자가 오늘 필요한 것을 꺼내 두라고 했으므로, 오늘 사물함을 비우겠다는 ④가 가장 자연스럽다.",
      translation: [
        "W: 동하야, 시험 휴업일에 학교 열어?",
        "M: 건물은 여는데 3층만.",
        "W: 내 사물함은 1층인데.",
        "M: 필요한 건 오늘 꺼내 둬. 1층은 하루 종일 잠겨 있어.",
        "W: 오늘 사물함 비울게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["M", "Yerim, my application photo keeps getting rejected."],
        ["W", "What does the site say about it?"],
        ["M", "That the background isn't plain enough."],
        ["W", "Retake it against a white wall, with no shadow behind you."],
      ],
      choices: [
        "My photo was accepted already.",
        "I'll retake it against a white wall.",
        "There is no background rule.",
        "I'll use the same photo again.",
        "The site never rejects photos.",
      ],
      answer: 2,
      clue: "Retake it against a white wall, with no shadow behind you.",
      explanation:
        "여자가 그림자 없는 흰 벽 앞에서 다시 찍으라고 했으므로, 그렇게 하겠다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 예림아, 원서 사진이 자꾸 반려돼.",
        "W: 사이트에 뭐라고 나와?",
        "M: 배경이 충분히 단순하지 않대.",
        "W: 흰 벽 앞에서, 뒤에 그림자 없이 다시 찍어.",
        "M: 흰 벽 앞에서 다시 찍을게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Yerim, you've been studying with headphones on for six hours a day."],
        ["W", "The music keeps the corridor noise out."],
        ["M", "What do you listen to?"],
        ["W", "Whatever's on the playlist. Mostly songs with words."],
        ["M", "And when the exam room is silent, what happens?"],
        ["W", "It feels strange. Too quiet to settle into."],
        ["M", "So you've trained yourself to need a condition the exam won't have."],
        ["W", "I hadn't thought of the room as something to train for."],
        ["M", "Everything about the desk is something to train for."],
        ["W", "Then should I just take them off completely?"],
        ["M", "Take them off for the two hours that match your exam time."],
      ],
      choices: [
        "I'll keep the headphones on all day.",
        "The exam room plays music.",
        "I never wear headphones.",
        "Six hours isn't very long.",
        "I'll go without them in the mornings.",
      ],
      answer: 5,
      clue: "Take them off for the two hours that match your exam time.",
      explanation:
        "남자가 시험 시간대에 해당하는 두 시간은 헤드폰을 벗고 공부하라고 했으므로, 그렇게 하겠다는 ⑤가 가장 자연스럽다.",
      translation: [
        "M: 예림아, 너 하루 여섯 시간을 헤드폰 쓰고 공부하더라.",
        "W: 음악이 복도 소음을 막아 줘.",
        "M: 뭘 들어?",
        "W: 목록에 있는 대로. 주로 가사 있는 노래.",
        "M: 시험장이 조용할 때는 어때?",
        "W: 이상해. 너무 조용해서 자리 잡기가 어려워.",
        "M: 그럼 시험장에 없을 조건을 필요하게끔 스스로를 길들인 거네.",
        "W: 시험장을 훈련할 대상으로 생각해 본 적은 없어.",
        "M: 책상에 관한 건 다 훈련할 대상이야.",
        "W: 그럼 아예 벗어야 할까?",
        "M: 네 시험 시간에 해당하는 두 시간만 벗어.",
        "W: 오전에는 벗고 해 볼게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Dongha, you've asked three teachers the same question this week."],
        ["M", "I wanted to be sure the answer was right."],
        ["W", "Did the three answers differ?"],
        ["M", "Not really. They said the same thing in different words."],
        ["W", "So the asking wasn't about the answer."],
        ["M", "I suppose I wanted someone to tell me it would be fine."],
        ["W", "That's a different request, and a teacher can't fill it."],
        ["M", "Then who can?"],
        ["W", "Nobody. You get that feeling from having done the work, not from hearing about it."],
        ["M", "So the next hour should go into the work itself."],
        ["W", "Yes. Stop asking and write the first section tonight."],
      ],
      choices: [
        "I'll ask a fourth teacher.",
        "The answers were all different.",
        "I'll write the first section tonight.",
        "I've already finished the work.",
        "I'll wait until someone reassures me.",
      ],
      answer: 3,
      clue: "Yes. Stop asking and write the first section tonight.",
      explanation:
        "여자가 그만 묻고 오늘 밤 첫 부분을 쓰라고 했으므로, 그렇게 하겠다는 ③이 가장 자연스럽다.",
      translation: [
        "W: 동하야, 이번 주에 같은 질문을 선생님 세 분께 했더라.",
        "M: 답이 맞는지 확실히 하고 싶었어.",
        "W: 세 답이 달랐어?",
        "M: 아니. 같은 말을 다른 표현으로 하셨어.",
        "W: 그럼 그 질문은 답을 구한 게 아니었네.",
        "M: 괜찮을 거라고 누가 말해 주기를 바랐던 것 같아.",
        "W: 그건 다른 부탁이고, 선생님이 채워 줄 수 있는 게 아니야.",
        "M: 그럼 누가 채워 줄 수 있어?",
        "W: 아무도. 그 느낌은 일을 해 봐야 오지, 들어서 오지 않아.",
        "M: 그럼 다음 한 시간은 그 일 자체에 써야겠네.",
        "W: 그래. 그만 묻고 오늘 밤에 첫 부분을 써.",
        "M: 오늘 밤에 첫 부분 쓸게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Areum이 Jiwan에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Areum : ________________",
      lines: [
        [
          "W",
          "Areum and Jiwan are running the school's book drive, which ends on Friday. " +
            "Jiwan has sorted nine hundred donated books into subject boxes over two afternoons, " +
            "and every box is labelled and stacked neatly in the corridor. " +
            "On Wednesday Areum reads the charity's collection notice again " +
            "and sees that the van driver will only take boxes he can lift alone, " +
            "which means under fifteen kilograms. " +
            "The textbook boxes are far heavier than that, and there are eleven of them. " +
            "Splitting those eleven into smaller boxes would take about an hour, " +
            "and there are plenty of empty boxes left in the storeroom. " +
            "She knows the sorting itself was done well and does not want it undone. " +
            "She wants to tell him to split the heavy boxes before Friday. " +
            "In this situation, what would Areum most likely say to Jiwan?",
        ],
      ],
      choices: [
        "Let's split the heavy boxes into smaller ones.",
        "We should collect more books this week.",
        "Let's ask the driver to bring a helper.",
        "We should cancel the book drive.",
        "Let's sort everything by author instead.",
      ],
      answer: 1,
      clue: "She wants to tell him to split the heavy boxes before Friday.",
      explanation:
        "아름이는 무거운 상자를 더 작은 상자로 나누자고 말하려 하므로 ①이 가장 적절하다.",
      translation: [
        "W: 아름이와 지완이는 금요일에 끝나는 학교 책 모으기 행사를 맡고 있습니다. 지완이는 기증받은 책 구백 권을 오후 이틀에 걸쳐 과목별 상자에 나눠 담았고, 상자마다 이름표를 붙여 복도에 가지런히 쌓아 두었습니다. 수요일에 아름이는 기부 단체의 수거 안내문을 다시 읽다가, 운전기사가 혼자 들 수 있는 상자만 가져간다는 것을 봅니다. 곧 15킬로그램 미만이어야 한다는 뜻입니다. 교과서 상자는 그보다 훨씬 무겁고, 그런 상자가 열한 개입니다. 그 열한 개를 더 작은 상자로 나누는 데는 한 시간쯤 걸리고, 창고에 빈 상자도 넉넉합니다. 아름이는 분류 자체는 잘되었다는 것을 알고 그것을 되돌리고 싶지는 않습니다. 아름이는 금요일 전에 무거운 상자를 나누자고 말하고 싶습니다. 이런 상황에서 아름이가 지완이에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 남자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Hello, everyone. Today I want to talk about why a long bridge has a gap " +
            "you can hear your tires cross. " +
            "Steel changes length with temperature. " +
            "A kilometer of steel deck is about half a meter longer on a July afternoon " +
            "than on a January night. " +
            "If both ends were locked into concrete, that half meter would have nowhere to go, " +
            "and the force would crack the structure or buckle the deck upward. " +
            "So engineers cut the deck into sections and leave a gap between them, " +
            "covered by the metal teeth you feel as a bump. " +
            "In summer those teeth close almost completely; in winter they open. " +
            "The bump is not wear or damage. " +
            "It is the sound of a bridge being allowed to change size.",
        ],
      ],
      choices: [
        "how steel is made stronger for construction",
        "why concrete cracks in cold weather",
        "how engineers measure the length of a bridge",
        "why long bridges are built with expansion gaps",
        "why road surfaces wear out in summer",
      ],
      answer: 4,
      clue: "So engineers cut the deck into sections and leave a gap between them, covered by the metal teeth you feel as a bump.",
      explanation:
        "남자는 강철이 온도에 따라 길이가 변하기 때문에 다리에 팽창 이음을 둔다고 설명한다. 따라서 답은 ④이다.",
      translation: [
        "M: 안녕하세요, 여러분. 오늘은 긴 다리에 왜 타이어가 지나는 소리가 들리는 틈이 있는지 이야기하려 합니다. 강철은 온도에 따라 길이가 변합니다. 1킬로미터짜리 강철 상판은 1월 밤보다 7월 오후에 반 미터쯤 깁니다. 양 끝이 콘크리트에 물려 있다면 그 반 미터가 갈 곳이 없고, 그 힘이 구조를 갈라 놓거나 상판을 위로 휘게 할 것입니다. 그래서 기술자들은 상판을 구간으로 자르고 그 사이에 틈을 둡니다. 여러분이 덜컹임으로 느끼는 그 쇠 이빨이 그 위를 덮고 있습니다. 여름에는 그 이빨이 거의 맞물리고, 겨울에는 벌어집니다. 그 덜컹임은 닳았거나 상한 것이 아닙니다. 다리가 크기를 바꿔도 된다고 허락받은 소리입니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 내용이 아닌 것은?",
      lines: [
        ["M", "Hello, everyone. Today I want to talk about why a long bridge has a gap you can hear your tires cross."],
        ["M", "Steel changes length with temperature."],
        ["M", "A kilometer of steel deck is about half a meter longer on a July afternoon than on a January night."],
        ["M", "If both ends were locked into concrete, that half meter would have nowhere to go."],
        ["M", "So engineers cut the deck into sections and leave a gap between them, covered by the metal teeth you feel as a bump."],
        ["M", "In summer those teeth close almost completely; in winter they open."],
      ],
      choices: [
        "steel changing length with temperature",
        "salt on the road rusting the steel",
        "a kilometer of deck growing about half a meter",
        "the deck being cut into sections",
        "the metal teeth closing in summer",
      ],
      answer: 2,
      clue: "A kilometer of steel deck is about half a meter longer on a July afternoon than on a January night.",
      explanation:
        "강철 길이가 온도에 따라 변하는 것, 1킬로미터가 반 미터쯤 늘어나는 것, 상판을 구간으로 자르는 것, 여름에 쇠 이빨이 맞물리는 것은 언급되지만 도로의 소금이 강철을 녹슬게 한다는 것은 언급되지 않았다. 따라서 답은 ②이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
