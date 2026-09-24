/** 고3 듣기 31회 — 사람이 직접 쓴 회차 (2026-09-25) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고3 31회",
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
          "Good afternoon, everyone. This is Ms. Do from the third-year office. " +
            "I want to say something about the practice test results going up tomorrow. " +
            "The sheet on the corridor wall will show your own number and your own marks, " +
            "and nothing else. " +
            "There will be no class ranking and no list from top to bottom, " +
            "and that is a deliberate change from last year. " +
            "Every teacher here has watched capable students spend a fortnight " +
            "reading a single number instead of the four pages behind it. " +
            "Take the pages, find the questions you got wrong for a reason you can name, " +
            "and bring them to your subject teacher this week. " +
            "That conversation is what the test was for. Thank you.",
        ],
      ],
      choices: [
        "모의고사 일정 변경을 알리려고",
        "성적표를 석차 없이 배부한다고 알리려고",
        "상담 신청 방법을 안내하려고",
        "자습실 이용 규칙을 알리려고",
        "원서 접수 기간을 안내하려고",
      ],
      answer: 2,
      clue: "There will be no class ranking and no list from top to bottom.",
      explanation:
        "여자는 내일 붙는 성적표에 본인 점수만 나오고 석차나 순위 명단은 없다고 알리며 틀린 문항을 들고 오라고 한다. 따라서 답은 ②이다.",
      translation: [
        "W: 여러분, 안녕하세요. 3학년부 도입니다. 내일 붙는 모의고사 결과에 대해 말씀드리겠습니다. 복도 벽에 붙는 표에는 여러분 본인의 번호와 본인의 점수만 나오고 그 밖의 것은 없습니다. 반 석차도 없고 위에서 아래로 늘어놓은 명단도 없습니다. 지난해와 일부러 다르게 한 부분입니다. 여기 선생님들은 능력 있는 학생들이 그 뒤의 네 쪽 대신 숫자 하나를 2주 동안 들여다보는 것을 지켜봐 왔습니다. 그 네 쪽을 들고, 왜 틀렸는지 이유를 말할 수 있는 문항을 찾아, 이번 주에 과목 선생님께 가져오세요. 시험은 그 대화를 위한 것이었습니다. 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 남자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Junho, I'm doing every subject for two hours a day, evenly."],
        ["M", "Evenly. Including the two you're already good at?"],
        ["W", "It feels fair that way."],
        ["M", "Fair to the subjects. Not to the score."],
        ["W", "But dropping to one hour on those feels like giving up."],
        ["M", "What does the second hour on those two actually buy you?"],
        ["W", "Honestly, it confirms I still know it."],
        ["M", "And the second hour on the subject you're failing?"],
        ["W", "That one changes something every time."],
        ["M", "Then the hours aren't worth the same, and you're spending them as if they were."],
        ["W", "So I should move time to where it moves the number."],
        ["M", "Move two hours this week and look at the result before you argue with me."],
      ],
      choices: [
        "공부 시간은 성적이 움직이는 쪽으로 옮겨야 한다",
        "모든 과목을 똑같이 공부해야 한다",
        "잘하는 과목을 더 붙잡아야 한다",
        "하루 공부량을 줄여야 한다",
        "과목마다 다른 교재를 써야 한다",
      ],
      answer: 1,
      clue: "Then the hours aren't worth the same, and you're spending them as if they were.",
      explanation:
        "남자는 잘하는 과목의 두 번째 시간과 약한 과목의 두 번째 시간이 값이 다르다며, 성적이 움직이는 쪽으로 시간을 옮기라고 말한다. 따라서 답은 ①이다.",
      translation: [
        "W: 준호야, 나 모든 과목을 하루 두 시간씩 똑같이 해.",
        "M: 똑같이. 이미 잘하는 두 과목까지?",
        "W: 그게 공평한 것 같아서.",
        "M: 과목한테 공평하지. 점수한테는 아니고.",
        "W: 그런데 그 과목들을 한 시간으로 줄이면 포기하는 것 같아.",
        "M: 그 두 과목의 두 번째 시간이 실제로 뭘 사 줘?",
        "W: 솔직히, 아직 알고 있다는 확인.",
        "M: 그럼 못하는 과목의 두 번째 시간은?",
        "W: 그건 매번 뭔가가 달라져.",
        "M: 그럼 시간들의 값이 같지 않은데, 너는 같은 것처럼 쓰고 있는 거야.",
        "W: 숫자가 움직이는 쪽으로 시간을 옮기라는 거구나.",
        "M: 이번 주에 두 시간만 옮겨 보고, 결과를 보고 나서 나랑 다퉈.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "When a plan fails, almost everyone concludes that they lacked willpower, " +
            "and almost nobody looks at the plan. " +
            "That is the wrong end to start from. " +
            "A plan that depends on you being alert at eleven at night, " +
            "or on you finding the right page before you begin, " +
            "is not a plan that failed because of your character. " +
            "It is a plan that asked for conditions you cannot supply every day. " +
            "Design for the ordinary version of yourself, the tired one. " +
            "Put the book on the desk the night before. " +
            "Make the first step small enough that refusing it would be absurd. " +
            "Willpower is not a thing you have more of by deciding to. " +
            "It is what you need when the arrangement around you is badly made.",
        ],
      ],
      choices: [
        "목표는 높게 잡아야 한다",
        "계획은 의지보다 조건을 잘 짜는 문제이다",
        "아침에 공부해야 한다",
        "계획은 매일 새로 써야 한다",
        "남과 함께 공부해야 한다",
      ],
      answer: 2,
      clue: "Design for the ordinary version of yourself, the tired one.",
      explanation:
        "남자는 계획이 무너지는 이유가 의지가 아니라 매일 댈 수 없는 조건을 요구하는 설계에 있다고 말한다. 따라서 답은 ②이다.",
      translation: [
        "M: 계획이 무너지면 거의 모두가 자기 의지가 부족했다고 결론짓고, 계획을 들여다보는 사람은 거의 없습니다. 시작하는 쪽이 틀렸습니다. 밤 11시에 당신이 또렷할 것을 전제로 하거나, 시작하기 전에 알맞은 쪽을 찾아낼 것을 전제로 하는 계획은, 당신의 성품 때문에 실패한 계획이 아닙니다. 매일 댈 수 없는 조건을 요구한 계획입니다. 평범한 판본의 자신, 피곤한 자신을 기준으로 설계하세요. 책은 전날 밤에 책상 위에 올려 두세요. 첫걸음은 거절하는 것이 우스꽝스러울 만큼 작게 만드세요. 의지는 그러기로 마음먹는다고 더 생기는 것이 아닙니다. 주변의 배치가 잘못 짜였을 때 필요해지는 것입니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["W", "Junho, is this the study room they opened on the third floor?"],
        ["M", "Yes, we moved in the week after the exams."],
        ["W", "There's a long desk running along the window."],
        ["M", "Six people fit at it once the chairs are pushed in."],
        ["W", "And a tall bookcase stands at the left end."],
        ["M", "The reference sets live on it. Nothing goes out of the room."],
        ["W", "I count three desk lamps standing on the long desk."],
        ["M", "There are four. One is down at the far end, behind the bookcase."],
        ["W", "A wastebasket sits under the right end of the desk."],
        ["M", "It gets emptied every evening at six."],
        ["W", "And a noticeboard hangs on the wall by the door."],
        ["M", "The timetable goes up there every Monday."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "There are four. One is down at the far end, behind the bookcase.",
      explanation:
        "여자가 책상 위 스탠드가 세 개라고 하자 남자가 네 개라고 바로잡는다. 그림에는 세 개가 그려져 있으므로 답은 ③이다.",
      figure: {
        kind: "scene",
        scene:
          "A school study room drawn as one wide picture, clean black line art on white, " +
          "no writing or letters or numbers anywhere. " +
          "A LONG DESK runs along the wall under a window. " +
          "A TALL BOOKCASE filled with books stands at the left end of the room. " +
          "On top of the long desk stand THREE DESK LAMPS AND ONLY THREE: " +
          "count them as one lamp, then a second lamp, then a third lamp, and NO FOURTH LAMP anywhere in the picture. " +
          "The three lamps are the same shape and are spread evenly along the desk " +
          "with a wide clear gap between each one, so none overlaps another and all three are easy to count. " +
          "A WASTEBASKET stands on the floor under the right end of the desk. " +
          "A PLAIN EMPTY NOTICEBOARD hangs on the wall at the right, near the door. " +
          "The walls are otherwise bare: no clock, no posters, no shelves.",
      },
      translation: [
        "W: 준호야, 여기가 3층에 새로 연 자습실이야?",
        "M: 응, 시험 끝난 다음 주에 들어왔어.",
        "W: 창문을 따라 긴 책상이 있네.",
        "M: 의자를 밀어 넣으면 여섯 명이 앉아.",
        "W: 그리고 왼쪽 끝에 키 큰 책장이 서 있어.",
        "M: 참고서 세트가 거기 있어. 밖으로는 안 나가.",
        "W: 긴 책상 위에 스탠드가 세 개 보여.",
        "M: 네 개야. 하나는 저쪽 끝 책장 뒤에 있어.",
        "W: 책상 오른쪽 끝 밑에 휴지통이 있네.",
        "M: 저녁 6시마다 비워.",
        "W: 그리고 문 옆 벽에 게시판이 걸려 있어.",
        "M: 월요일마다 시간표가 거기 붙어.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 남자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Junho, the mock interview session is at four on Thursday."],
        ["M", "I know. Have the rooms been booked?"],
        ["W", "Three of them, on the second floor. I did it on Monday."],
        ["M", "Good. And the question sheets?"],
        ["W", "Printed. Twelve sets, one for each pair."],
        ["M", "Then what's outstanding?"],
        ["W", "Nobody has asked the two graduates who said they'd help."],
        ["M", "Do we have their numbers?"],
        ["W", "In the alumni file, but only a teacher can open it."],
        ["M", "Which teacher has it?"],
        ["W", "Mr. Seo, until three. And I'm setting up the rooms from two."],
        ["M", "Then I'll call the two graduates myself."],
      ],
      choices: [
        "면접실 예약하기",
        "질문지 인쇄하기",
        "교실 정리하기",
        "안내문 붙이기",
        "졸업생에게 연락하기",
      ],
      answer: 5,
      clue: "Then I'll call the two graduates myself.",
      explanation:
        "예약과 인쇄는 끝났고 여자는 2시부터 교실을 준비해야 하므로, 남자가 졸업생 두 명에게 연락하기로 한다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 준호야, 모의 면접이 목요일 4시야.",
        "M: 알아. 교실은 예약했어?",
        "W: 2층에 세 개. 월요일에 했어.",
        "M: 좋아. 질문지는?",
        "W: 인쇄했어. 열두 세트, 짝마다 하나씩.",
        "M: 그럼 남은 건 뭐야?",
        "W: 도와주겠다던 졸업생 두 명한테 아무도 연락을 안 했어.",
        "M: 번호는 있어?",
        "W: 졸업생 파일에 있는데 선생님만 열 수 있어.",
        "M: 어느 선생님이 갖고 계셔?",
        "W: 서 선생님, 3시까지. 그리고 나는 2시부터 교실을 준비해야 해.",
        "M: 그럼 내가 졸업생 두 명한테 연락할게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 여자가 지불할 금액을 고르시오.",
      lines: [
        ["M", "Welcome to Northgate Books. What can I help you with?"],
        ["W", "Three exam guides and four practice sets, please."],
        ["M", "The guides are twenty dollars each and the practice sets are ten."],
        ["W", "So sixty dollars and forty dollars."],
        ["M", "One hundred altogether. Would you like the answer booklets?"],
        ["W", "How much are those?"],
        ["M", "Four dollars each, and there are four of them."],
        ["W", "We'll leave the booklets. The answers are in the back already."],
        ["M", "Quite right. Are you buying for a study group?"],
        ["W", "Yes, here's the school card."],
        ["M", "Then I can take forty percent off the practice sets, but not the guides."],
        ["W", "Thank you. I'll pay by card."],
      ],
      choices: ["$76.00", "$84.00", "$90.00", "$96.00", "$100.00"],
      answer: 2,
      clue: "Then I can take forty percent off the practice sets, but not the guides.",
      explanation:
        "문제 세트 4권 40달러에서 40퍼센트를 빼면 24달러이고, 할인이 안 되는 안내서 3권 60달러를 더하면 84달러이다. 따라서 답은 ②이다.",
      translation: [
        "M: 노스게이트 서점입니다. 무엇을 도와드릴까요?",
        "W: 수험 안내서 세 권이랑 문제 세트 네 권 주세요.",
        "M: 안내서는 한 권에 20달러, 문제 세트는 10달러입니다.",
        "W: 그럼 60달러랑 40달러네요.",
        "M: 모두 100달러입니다. 정답 책자도 하시겠어요?",
        "W: 그건 얼마예요?",
        "M: 하나에 4달러이고 네 권입니다.",
        "W: 정답 책자는 뺄게요. 뒤에 답이 이미 있어요.",
        "M: 맞습니다. 스터디에서 쓰시는 건가요?",
        "W: 네, 여기 학교 카드요.",
        "M: 그럼 문제 세트에서 40퍼센트를 빼 드립니다. 안내서는 안 돼요.",
        "W: 감사합니다. 카드로 낼게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 여자가 스터디 모임을 그만두는 이유를 고르시오.",
      lines: [
        ["M", "Sora, you told the study group you're leaving."],
        ["W", "At the end of this month, yes."],
        ["M", "Is it the time? Nine on Saturdays is early."],
        ["W", "Nine is fine. I'm up before that anyway."],
        ["M", "Then is it the members? Everyone gets on."],
        ["W", "They're the best part of it."],
        ["M", "So what changed?"],
        ["W", "We spend the whole two hours on the subject I'm already strongest in."],
        ["M", "And the one you actually need?"],
        ["W", "Nobody else takes it. I'd be studying it alone anyway, just later at night."],
      ],
      choices: [
        "모이는 시간이 이른 아침이라서",
        "회원들과 맞지 않아서",
        "모임 장소가 멀어서",
        "필요한 과목을 다루지 않아서",
        "회비가 부담되어서",
      ],
      answer: 4,
      clue: "We spend the whole two hours on the subject I'm already strongest in.",
      explanation:
        "시간도 사람도 괜찮지만, 모임이 이미 잘하는 과목만 두 시간 내내 다루고 정작 필요한 과목은 아무도 듣지 않기 때문이다. 따라서 답은 ④이다.",
      translation: [
        "M: 소라야, 스터디에 그만둔다고 했다며.",
        "W: 응, 이번 달 말까지만.",
        "M: 시간 때문이야? 토요일 9시는 이르잖아.",
        "W: 9시는 괜찮아. 어차피 그전에 일어나.",
        "M: 그럼 사람들 때문이야? 다들 잘 지내잖아.",
        "W: 그 사람들이 제일 좋은 부분이야.",
        "M: 그럼 뭐가 달라졌는데?",
        "W: 두 시간을 통째로 내가 제일 잘하는 과목에 써.",
        "M: 정작 필요한 과목은?",
        "W: 아무도 안 들어. 어차피 혼자 하게 되는데, 밤에 더 늦게 할 뿐이야.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, Eastport Essay Workshop에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["M", "Sora, did you read the notice about the Eastport Essay Workshop?"],
        ["W", "I saw it on the board this morning. How long does it run?"],
        ["M", "Four Saturdays through November, two hours each afternoon."],
        ["W", "Four sessions, then. Where does it meet?"],
        ["M", "In the seminar room on the second floor of the city library."],
        ["W", "That's only two stops from here. What do they cover?"],
        ["M", "Structure in the first two weeks, then evidence and revision after that."],
        ["W", "That's exactly what I need for the essay paper. Is there a fee?"],
        ["M", "It's free, because the library pays for it, but you register in advance."],
        ["W", "How many people can join?"],
        ["M", "Twenty-five, and the list was already half full after one day."],
        ["W", "Then let's register tonight before it fills up."],
      ],
      choices: ["운영 기간", "장소", "다루는 내용", "정원", "준비물"],
      answer: 5,
      clue: "준비물은 대화에서 언급되지 않았다.",
      explanation:
        "기간(11월 토요일 네 번), 장소(시립도서관 세미나실), 내용(구성, 근거, 고쳐쓰기), 정원(스물다섯 명)은 언급되지만 준비물은 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 소라야, 이스트포트 에세이 워크숍 공고 봤어?",
        "W: 오늘 아침에 게시판에서 봤어. 얼마 동안 해?",
        "M: 11월 내내 토요일 네 번, 오후에 두 시간씩.",
        "W: 네 번이구나. 어디서 모여?",
        "M: 시립도서관 2층 세미나실에서.",
        "W: 여기서 두 정거장밖에 안 되네. 뭘 다뤄?",
        "M: 처음 두 주는 구성, 그다음은 근거와 고쳐쓰기.",
        "W: 논술 시험에 딱 필요한 거네. 참가비 있어?",
        "M: 무료야. 도서관에서 대 주거든. 그런데 미리 등록해야 해.",
        "W: 몇 명까지 들어가?",
        "M: 스물다섯 명. 하루 만에 명단이 벌써 절반 찼어.",
        "W: 그럼 다 차기 전에 오늘 밤에 등록하자.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Brookvale Night Library에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "W",
          "Here is some information about the Brookvale Night Library. " +
            "It opened in 2016 and is run by the district, not by any school. " +
            "The reading rooms are open from six in the evening until one in the morning. " +
            "Seats are allotted at the desk and cannot be booked in advance. " +
            "Anyone with a district card may use it, whatever school they attend. " +
            "Food is not allowed upstairs, but there is a small room on the ground floor. " +
            "The library closes on the first Monday of every month.",
        ],
      ],
      choices: [
        "2016년에 문을 열었다",
        "저녁 6시부터 새벽 1시까지 연다",
        "자리를 미리 예약할 수 있다",
        "구민 카드가 있으면 누구나 쓸 수 있다",
        "매달 첫째 월요일에 문을 닫는다",
      ],
      answer: 3,
      clue: "Seats are allotted at the desk and cannot be booked in advance.",
      explanation:
        "자리는 창구에서 배정받고 미리 예약할 수 없다고 했으므로 예약할 수 있다는 ③은 내용과 다르다. 따라서 답은 ③이다.",
      translation: [
        "W: 브룩베일 야간 도서관을 안내해 드리겠습니다. 2016년에 문을 열었고 학교가 아니라 구에서 운영합니다. 열람실은 저녁 6시부터 새벽 1시까지 엽니다. 자리는 창구에서 배정받으며 미리 예약할 수 없습니다. 구민 카드가 있으면 어느 학교에 다니든 이용할 수 있습니다. 위층에서는 음식을 먹을 수 없고 1층에 작은 방이 있습니다. 매달 첫째 월요일에는 문을 닫습니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 신청할 특강을 고르시오.",
      lines: [
        ["W", "Junho, we should pick one of these evening lectures."],
        ["M", "Five of them. Which subject do we need?"],
        ["W", "English. That's the one we're both weakest in."],
        ["M", "That cuts it down. And the day?"],
        ["W", "Not Friday. We have the mock test every Friday evening."],
        ["M", "Agreed. And it has to finish by nine to catch the last bus."],
        ["W", "So anything ending later is out."],
        ["M", "Then only one lecture clears all three."],
        ["W", "Let's put our names down before Thursday."],
        ["M", "I'll write both of us on the sheet in the office."],
        ["W", "Thanks. I'll ask what we need to bring."],
        ["M", "It starts the week after next."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "English. That's the one we're both weakest in.",
      explanation:
        "과목이 영어이고, 금요일이 아니며, 9시까지 끝나는 것을 고른다. 세 조건을 모두 채우는 것은 ④이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Subject: Math / Day: Monday / Ends: 8:30 p.m." },
          { no: 2, label: "②", value: "Subject: English / Day: Friday / Ends: 8:30 p.m." },
          { no: 3, label: "③", value: "Subject: English / Day: Tuesday / Ends: 10:00 p.m." },
          { no: 4, label: "④", value: "Subject: English / Day: Wednesday / Ends: 9:00 p.m." },
          { no: 5, label: "⑤", value: "Subject: Science / Day: Thursday / Ends: 8:00 p.m." },
        ],
      },
      translation: [
        "W: 준호야, 이 저녁 특강 중에 하나 골라야 해.",
        "M: 다섯 개네. 어느 과목이 필요해?",
        "W: 영어. 우리 둘 다 제일 약한 과목이잖아.",
        "M: 그럼 줄어드네. 요일은?",
        "W: 금요일은 안 돼. 금요일 저녁마다 모의고사잖아.",
        "M: 동의해. 그리고 막차를 타려면 9시까지는 끝나야 해.",
        "W: 그럼 그보다 늦게 끝나는 건 빠져.",
        "M: 그럼 세 조건 다 넘는 건 하나뿐이야.",
        "W: 목요일 전에 이름 올리자.",
        "M: 행정실 명단에 둘 다 적을게.",
        "W: 고마워. 나는 뭘 가져가야 하는지 물어볼게.",
        "M: 다다음 주에 시작해.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["W", "Junho, is the counselling room open during lunch?"],
        ["M", "It is, but you have to put your name in the book outside."],
        ["W", "Can I put it in now?"],
        ["M", "Yes, the book is on the shelf by the door."],
      ],
      choices: [
        "The room is closed at lunch.",
        "I'll write my name in the book now.",
        "I don't need counselling.",
        "There is no book anywhere.",
        "I'll come back next term.",
      ],
      answer: 2,
      clue: "Yes, the book is on the shelf by the door.",
      explanation:
        "남자가 문 옆 선반에 명부가 있다고 했으므로, 지금 이름을 적겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 준호야, 상담실은 점심시간에 열어?",
        "M: 열어. 그런데 밖에 있는 명부에 이름을 적어야 해.",
        "W: 지금 적어도 돼?",
        "M: 응, 명부는 문 옆 선반에 있어.",
        "W: 지금 명부에 이름 적을게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["M", "Sora, my application form won't upload to the site."],
        ["W", "What format did you save it in?"],
        ["M", "A word file. It's the one I typed it in."],
        ["W", "The site only takes PDF. Save it again as a PDF."],
      ],
      choices: [
        "The site takes word files.",
        "I'll save it again as a PDF.",
        "I haven't written the form yet.",
        "I'll post it by mail instead.",
        "My form uploaded fine.",
      ],
      answer: 2,
      clue: "The site only takes PDF. Save it again as a PDF.",
      explanation:
        "여자가 사이트는 PDF만 받으니 PDF로 다시 저장하라고 했으므로, 그렇게 하겠다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 소라야, 신청서가 사이트에 안 올라가.",
        "W: 어떤 형식으로 저장했어?",
        "M: 워드 파일. 그걸로 썼거든.",
        "W: 사이트는 PDF만 받아. PDF로 다시 저장해.",
        "M: PDF로 다시 저장할게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Junho, you've rewritten the first paragraph of your essay eleven times."],
        ["M", "It has to be right before I can go on."],
        ["W", "How much of the rest is written?"],
        ["M", "None of it. That's the problem I'm working on."],
        ["W", "But you don't know yet what the essay argues."],
        ["M", "I know roughly."],
        ["W", "Then the opening is a promise about something you haven't decided."],
        ["M", "So I'm polishing a sentence that will have to change anyway."],
        ["W", "Write the middle first. The opening is easy once the argument exists."],
        ["M", "That feels like starting in the wrong place."],
        ["W", "Write two body paragraphs tonight and see which opening they ask for."],
      ],
      choices: [
        "I'll rewrite the opening once more.",
        "I'll hand it in as it is.",
        "I never write essays.",
        "I'll write two body paragraphs tonight.",
        "I'd rather change the topic.",
      ],
      answer: 4,
      clue: "Write two body paragraphs tonight and see which opening they ask for.",
      explanation:
        "여자가 오늘 밤 본론 두 단락을 쓰라고 했으므로, 그렇게 하겠다는 ④가 가장 자연스럽다.",
      translation: [
        "W: 준호야, 너 에세이 첫 단락을 열한 번 고쳐 썼어.",
        "M: 그게 제대로 돼야 다음으로 갈 수 있어.",
        "W: 나머지는 얼마나 썼는데?",
        "M: 하나도 안 썼어. 그게 지금 붙잡고 있는 문제야.",
        "W: 그런데 이 글이 뭘 주장하는지 아직 모르잖아.",
        "M: 대충은 알아.",
        "W: 그럼 그 도입부는 아직 정하지도 않은 것에 대한 약속이네.",
        "M: 어차피 바뀔 문장을 다듬고 있었던 거구나.",
        "W: 가운데를 먼저 써. 주장이 생기고 나면 도입부는 쉬워.",
        "M: 틀린 데서 시작하는 기분인데.",
        "W: 오늘 밤에 본론 두 단락을 쓰고, 그게 어떤 도입부를 부르는지 봐.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Sora, you look worn out. How late were you up?"],
        ["W", "Half past two. I do my hardest subject last."],
        ["M", "Why last?"],
        ["W", "I save it. It feels like the serious work, so it deserves the quiet hours."],
        ["M", "And how much of it goes in at half past one?"],
        ["W", "Almost none. I read the same page four times."],
        ["M", "So the subject that needs you most gets the worst hour you have."],
        ["W", "When you say it out loud it sounds ridiculous."],
        ["M", "What's in the first hour after school instead?"],
        ["W", "Vocabulary lists. Something I could do half asleep."],
        ["M", "Then swap them. Hard subject first, lists at midnight."],
      ],
      choices: [
        "I'll keep the same order tomorrow.",
        "I'll stop studying at night.",
        "I'll do the hard subject first from tomorrow.",
        "The lists are the hardest part.",
        "I'd rather go to bed earlier only.",
      ],
      answer: 3,
      clue: "Then swap them. Hard subject first, lists at midnight.",
      explanation:
        "남자가 어려운 과목을 먼저 하고 단어는 밤에 하라고 했으므로, 내일부터 어려운 과목을 먼저 하겠다는 ③이 가장 자연스럽다.",
      translation: [
        "M: 소라야, 지쳐 보여. 몇 시까지 깨어 있었어?",
        "W: 2시 반. 제일 어려운 과목을 마지막에 해.",
        "M: 왜 마지막에?",
        "W: 아껴 둬. 진지한 공부 같아서 조용한 시간을 줘야 할 것 같아.",
        "M: 그런데 1시 반에 그게 얼마나 들어가?",
        "W: 거의 안 들어가. 같은 쪽을 네 번 읽어.",
        "M: 그럼 네가 제일 필요한 과목이 제일 나쁜 시간을 받는 거네.",
        "W: 소리 내어 말하니까 우습다.",
        "M: 그럼 하교 후 첫 시간에는 뭘 해?",
        "W: 단어 목록. 반쯤 졸면서도 할 수 있는 거.",
        "M: 그럼 바꿔. 어려운 과목을 먼저, 단어는 자정에.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Doyun이 Haeun에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Doyun : ________________",
      lines: [
        [
          "M",
          "Doyun and Haeun are preparing the third-year study room for the final term. " +
            "Haeun has drawn up a timetable that gives every student one fixed seat for the whole term, " +
            "which took her a long evening and looks very orderly on paper. " +
            "This week Doyun watches the room fill up after school " +
            "and sees that on any given day about a third of the seats stay empty, " +
            "because students have academy classes on different evenings, " +
            "while ten or so students are turned away at the door with nowhere to sit. " +
            "Letting people take any free seat and sign a sheet would cost nothing " +
            "and would use the room the students already have. " +
            "He does not want her to feel the timetable was wasted work. " +
            "He wants to tell her to let students take any free seat instead of fixed ones. " +
            "In this situation, what would Doyun most likely say to Haeun?",
        ],
      ],
      choices: [
        "Let's open the room only on weekends.",
        "We should add more chairs to the room.",
        "We should close the room after eight.",
        "Let's let students take any free seat instead.",
        "Let's ask everyone to change academies.",
      ],
      answer: 4,
      clue: "He wants to tell her to let students take any free seat instead of fixed ones.",
      explanation:
        "도윤이는 고정석 대신 비어 있는 자리를 아무나 쓰게 하자고 말하려 하므로 ④가 가장 적절하다.",
      translation: [
        "M: 도윤이와 하은이는 마지막 학기를 앞두고 3학년 자습실을 준비하고 있습니다. 하은이는 학생마다 한 학기 동안 쓸 고정 자리를 정한 표를 만들었는데, 저녁 하나를 꼬박 들였고 종이 위에서는 아주 반듯해 보입니다. 이번 주에 도윤이는 방과 후에 자습실이 차는 것을 지켜보다가, 학생들이 저녁마다 다른 날에 학원 수업이 있어서 어느 날이든 자리의 3분의 1쯤이 비어 있는데도 열 명 남짓이 앉을 데가 없어 문에서 돌아간다는 것을 알게 됩니다. 비어 있는 자리를 아무나 쓰게 하고 명부에 적게 하면 드는 것이 없고, 학생들이 이미 가진 방을 제대로 쓰게 됩니다. 도윤이는 하은이가 그 표를 만든 일이 헛되었다고 느끼지 않기를 바랍니다. 도윤이는 고정석 대신 비어 있는 자리를 쓰게 하자고 말하고 싶습니다. 이런 상황에서 도윤이가 하은이에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 여자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "Hello, everyone. Today I want to talk about why a long train " +
            "can be heard before it can be seen. " +
            "Sound travels through steel many times faster than it travels through air, " +
            "and it loses far less of itself on the way. " +
            "A vibration that would fade to nothing after a few hundred metres in the open " +
            "can run for kilometres along a continuous rail. " +
            "That is why an ear against the track catches a train " +
            "that the air has not yet delivered. " +
            "The same property explains the gaps and the welded joints engineers argue about, " +
            "and why a cracked rail is found by listening rather than by looking. " +
            "Metal does not only carry the weight of the train. It carries the news of it.",
        ],
      ],
      choices: [
        "why sound travels through steel better than through air",
        "how railway tracks are welded together",
        "why trains slow down on curves",
        "how engineers measure the weight of a train",
        "why stations are built away from town centres",
      ],
      answer: 1,
      clue: "Sound travels through steel many times faster than it travels through air.",
      explanation:
        "여자는 소리가 강철에서 공기보다 훨씬 빠르고 덜 잃으며 멀리 간다고 설명한다. 따라서 답은 ①이다.",
      translation: [
        "W: 안녕하세요, 여러분. 오늘은 긴 기차가 보이기 전에 들리는 이유를 이야기하려 합니다. 소리는 공기보다 강철 속에서 몇 배나 빠르게 가고, 가는 동안 잃는 것도 훨씬 적습니다. 트인 곳에서라면 몇백 미터 만에 사그라들 진동이, 이어진 선로를 따라서는 몇 킬로미터를 달릴 수 있습니다. 그래서 선로에 귀를 대면 공기가 아직 전해 주지 않은 기차를 붙잡게 됩니다. 같은 성질이 기술자들이 다투는 이음매와 용접 문제도 설명해 주고, 금이 간 선로를 보는 것이 아니라 듣는 것으로 찾아내는 이유도 설명해 줍니다. 금속은 기차의 무게만 나르는 것이 아닙니다. 기차의 소식을 나릅니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 내용이 아닌 것은?",
      lines: [
        ["W", "Hello, everyone. Today I want to talk about why a long train can be heard before it can be seen."],
        ["W", "Sound travels through steel many times faster than it travels through air."],
        ["W", "A vibration that would fade to nothing after a few hundred metres in the open can run for kilometres along a continuous rail."],
        ["W", "That is why an ear against the track catches a train that the air has not yet delivered."],
        ["W", "A cracked rail is found by listening rather than by looking."],
      ],
      choices: [
        "sound moving faster through steel than through air",
        "a vibration running for kilometres along a rail",
        "an ear against the track catching a train early",
        "a cracked rail being found by listening",
        "trains running on electricity rather than coal",
      ],
      answer: 5,
      clue: "Sound travels through steel many times faster than it travels through air.",
      explanation:
        "강철에서 소리가 더 빠르다는 것, 진동이 선로를 따라 몇 킬로미터를 간다는 것, 선로에 귀를 대면 기차를 먼저 붙잡는다는 것, 금 간 선로를 들어서 찾는다는 것은 언급되지만 기차가 전기로 달린다는 것은 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
