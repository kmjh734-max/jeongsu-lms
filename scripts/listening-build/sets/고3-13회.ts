/** 고3 듣기 13회 — 사람이 직접 쓴 회차 (2026-09-21) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고3 13회",
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
          "Good afternoon, third-year students. This is the yearbook committee. " +
            "We are writing to tell you exactly when your graduation photographs will be taken. " +
            "Shooting begins next Tuesday and runs for three days in the small hall beside the library. " +
            "Class one to class four come on Tuesday, class five to class eight on Wednesday, and the remaining classes on Thursday. " +
            "Each class has a thirty-minute slot, and the times are posted on the notice board outside the staff room. " +
            "Please wear your full school uniform, including the jacket, even if the weather is warm that day. " +
            "If you are away on your assigned day, come to the hall on Thursday afternoon after four o'clock. " +
            "We cannot arrange a fourth day, so please check your class time today. Thank you.",
        ],
      ],
      choices: [
        "졸업식 순서를 알리려고",
        "앨범 제작비 납부를 독촉하려고",
        "사진 동아리 부원을 모집하려고",
        "졸업 앨범 사진 촬영 일정을 안내하려고",
        "교복 착용 규정이 바뀐 것을 알리려고",
      ],
      answer: 4,
      clue: "Shooting begins next Tuesday and runs for three days in the small hall beside the library.",
      explanation:
        "졸업 앨범 사진을 언제, 어디서, 어느 반이 찍는지 날짜와 시간을 알리고 있다. 따라서 말의 목적은 ④이다.",
      translation: [
        "W: 3학년 학생 여러분, 안녕하세요. 졸업 앨범 위원회입니다. " +
          "졸업 사진을 정확히 언제 찍는지 알려 드리려고 합니다. " +
          "촬영은 다음 주 화요일에 시작해 사흘 동안 도서관 옆 소강당에서 진행됩니다. " +
          "1반부터 4반은 화요일, 5반부터 8반은 수요일, 나머지 반은 목요일입니다. " +
          "반마다 30분씩 배정되어 있고, 시간표는 교무실 앞 게시판에 붙여 두었습니다. " +
          "그날 날씨가 덥더라도 재킷을 포함한 교복을 모두 갖춰 입고 오세요. " +
          "배정된 날에 학교에 없으면 목요일 오후 4시 이후에 소강당으로 오면 됩니다. " +
          "넷째 날은 잡을 수 없으니 오늘 반별 시간을 꼭 확인해 주세요. 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 여자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Suhyeon, how many practice tests have you done this month?"],
        ["W", "Six, but I've spent more time on the wrong answers than on the tests."],
        ["M", "Six is fewer than I've done. I'm on my eleventh."],
        ["W", "And are the same questions still catching you out?"],
        ["M", "Now that you say it, yes. The inference ones, every time."],
        ["W", "That's what I mean. I keep one page for each type of mistake."],
        ["M", "So you put every inference question you missed on the same page?"],
        ["W", "Exactly. After six tests the pattern is obvious, and it isn't vocabulary."],
        ["M", "I just check the answer key and move on to the next test."],
        ["W", "Then you never see the pattern. Eleven tests, eleven separate mistakes."],
        ["M", "All right. I'll start sorting mine by type this weekend."],
      ],
      choices: [
        "문제는 많이 풀수록 좋다",
        "시간을 재고 푸는 연습이 중요하다",
        "틀린 문제는 유형별로 모아 다시 보아야 한다",
        "문제집을 자주 바꾸지 않는 것이 좋다",
        "해설은 스스로 써 보아야 한다",
      ],
      answer: 3,
      clue: "Exactly. After six tests the pattern is obvious, and it isn't vocabulary.",
      explanation:
        "여자는 틀린 문제를 유형마다 한 쪽에 모아 두어야 반복되는 약점이 보인다고 말한다. 따라서 답은 ③이다.",
      translation: [
        "M: 수현아, 이번 달에 모의고사 몇 번 풀었어?",
        "W: 여섯 번, 그런데 푸는 시간보다 틀린 문제 보는 시간이 더 많았어.",
        "M: 여섯 번이면 나보다 적네. 나는 열한 번째야.",
        "W: 그런데 매번 같은 문제에서 걸리지 않아?",
        "M: 그러고 보니 그러네. 추론 문제는 늘 틀려.",
        "W: 내 말이 그거야. 나는 실수 유형마다 한 쪽씩 만들어 둬.",
        "M: 그러니까 틀린 추론 문제를 다 같은 쪽에 모아 둔다는 거야?",
        "W: 그렇지. 여섯 번 치고 나니까 패턴이 뚜렷해. 어휘 문제가 아니더라.",
        "M: 나는 그냥 답지 확인하고 다음 회차로 넘어가.",
        "W: 그러면 패턴이 안 보여. 열한 번이면 실수도 따로따로 열한 개인 거지.",
        "M: 알겠어. 이번 주말부터 유형별로 정리해 볼게.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Every December people write down what they will start doing, and almost none of it survives February. " +
            "The reason is simple. A plan that only adds things is not a plan; it is a wish list with times attached. " +
            "Your week already has a fixed number of hours, and each of them belongs to something. " +
            "If you decide to study two more hours a night, those hours have to be taken from somewhere you have not named. " +
            "So write the second list first: what you will stop doing, and what you will do worse on purpose. " +
            "A plan becomes real at the moment it costs you something you liked.",
        ],
      ],
      choices: [
        "계획은 구체적으로 세워야 한다",
        "하루를 시간 단위로 나누어야 한다",
        "계획은 자주 점검해야 한다",
        "목표는 높게 잡는 것이 좋다",
        "계획은 무엇을 하지 않을지 정하는 일이다",
      ],
      answer: 5,
      clue: "So write the second list first: what you will stop doing, and what you will do worse on purpose.",
      explanation:
        "더할 것만 적은 계획은 지켜지지 않으며, 무엇을 그만둘지 정해야 계획이 실제가 된다는 내용이다. 따라서 요지는 ⑤이다.",
      translation: [
        "M: 해마다 12월이면 사람들은 앞으로 시작할 일을 적고, 그 가운데 2월까지 살아남는 것은 거의 없습니다. " +
          "이유는 간단합니다. 더하기만 하는 계획은 계획이 아니라 시간이 적힌 소원 목록입니다. " +
          "여러분의 한 주에는 이미 정해진 시간이 있고, 그 시간마다 주인이 있습니다. " +
          "매일 밤 두 시간을 더 공부하기로 했다면, 그 두 시간은 이름을 붙이지 않은 어딘가에서 빼 와야 합니다. " +
          "그러니 두 번째 목록을 먼저 쓰세요. 무엇을 그만둘지, 무엇을 일부러 덜 잘할지 말입니다. " +
          "계획은 좋아하던 무언가를 내어 주는 순간에 비로소 진짜가 됩니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["W", "Jaeho, the counselling room looks completely different since you rearranged it."],
        ["M", "We finished it on Friday. What do you notice first?"],
        ["W", "The big world map on the back wall. You can see it from the door."],
        ["M", "Students used to ask where the exchange schools were, so we put it up."],
        ["W", "And there are three plant pots on the window sill."],
        ["M", "There were three last month, but one went to the staff room. Two now."],
        ["W", "I see. In the middle there's a round table with two chairs."],
        ["M", "Only two, so nobody feels they're facing a panel."],
        ["W", "On the left wall you've hung a cork notice board."],
        ["M", "That's where we pin the admissions dates as they come in."],
        ["W", "And by the door there's a small table with a water jug on it."],
        ["M", "Students help themselves. It saves them asking."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 2,
      clue: "There were three last month, but one went to the staff room. Two now.",
      explanation:
        "남자는 창가의 화분이 이제 두 개라고 바로잡는다. 그림에는 화분이 세 개 그려져 있으므로 ②가 대화와 일치하지 않는다.",
      figure: {
        kind: "labeled",
        scene:
          "A school counselling room seen from the front, five things clearly separated and none overlapping, clean black line art, no writing anywhere. " +
          "Centre of the back wall: a large blank world map with continents outlined and no letters on it. " +
          "On the window sill to the right: THREE plant pots standing in a row. " +
          "Centre of the room: a ROUND table with exactly TWO chairs, one on each side. " +
          "On the left wall: a rectangular cork notice board with a few blank cards pinned to it. " +
          "By the door on the far right: a small side table with a water jug and two cups on it.",
      },
      translation: [
        "W: 재호야, 자리를 바꾸고 나니 상담실이 완전히 달라 보인다.",
        "M: 금요일에 끝냈어. 뭐가 먼저 눈에 들어와?",
        "W: 뒷벽의 큰 세계 지도. 문에서도 보이네.",
        "M: 교환 학교가 어디인지 묻는 학생이 많아서 걸었어.",
        "W: 그리고 창턱에 화분이 세 개 있고.",
        "M: 지난달까지는 세 개였는데 하나가 교무실로 갔어. 이제 두 개야.",
        "W: 그렇구나. 가운데에는 의자 두 개가 있는 둥근 탁자가 있네.",
        "M: 두 개만 뒀어. 심사받는 느낌이 들지 않도록.",
        "W: 왼쪽 벽에는 코르크 게시판을 걸었고.",
        "M: 입시 일정이 나오는 대로 거기에 붙여.",
        "W: 문 옆에는 물병이 놓인 작은 탁자가 있네.",
        "M: 학생들이 알아서 따라 마셔. 묻지 않아도 되니까.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 남자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Minseok, I read the draft of your personal statement last night."],
        ["M", "Thank you. Was the opening still too long?"],
        ["W", "The opening is fine now. The problem is the middle section."],
        ["M", "The part about the science club?"],
        ["W", "Yes. You say you led the project, but there isn't a single detail."],
        ["M", "I thought the reader would already know what the project was."],
        ["W", "They won't. What did you actually do, week by week?"],
        ["M", "I kept a record of every meeting, actually. Dates, tasks, who did what."],
        ["W", "That's exactly what I need. Can you send me that record?"],
        ["M", "I'll pull it together tonight and email it to you before midnight."],
        ["W", "Perfect. Then I'll mark the two paragraphs worth expanding."],
      ],
      choices: [
        "원서 마감일 확인하기",
        "자기소개서를 처음부터 다시 쓰기",
        "면접 연습 시간 잡기",
        "활동 기록을 정리해서 보내기",
        "상담 신청서 내기",
      ],
      answer: 4,
      clue: "I'll pull it together tonight and email it to you before midnight.",
      explanation:
        "여자가 동아리 활동 기록을 보내 달라고 하자 남자는 오늘 밤에 정리해서 보내겠다고 한다. 따라서 답은 ④이다.",
      translation: [
        "W: 민석아, 어젯밤에 네 자기소개서 초고를 읽었어.",
        "M: 감사합니다. 도입부가 아직 길었나요?",
        "W: 도입부는 이제 괜찮아. 문제는 가운데 부분이야.",
        "M: 과학 동아리 이야기요?",
        "W: 응. 프로젝트를 이끌었다고 썼는데 구체적인 내용이 하나도 없어.",
        "M: 읽는 분이 그 프로젝트를 이미 아실 줄 알았어요.",
        "W: 모르셔. 주마다 실제로 무엇을 했는데?",
        "M: 사실 모임마다 기록을 남겼어요. 날짜, 할 일, 누가 무엇을 했는지요.",
        "W: 바로 그게 필요해. 그 기록을 보내 줄 수 있어?",
        "M: 오늘 밤에 정리해서 자정 전에 메일로 보내 드릴게요.",
        "W: 좋아. 그럼 내가 늘려 쓸 만한 두 단락을 표시해 둘게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 여자가 지불할 금액을 고르시오.",
      lines: [
        ["M", "Good afternoon. Have you decided on the frame?"],
        ["W", "Yes, I'll take the thin metal one I tried on earlier."],
        ["M", "That frame is sixty dollars."],
        ["W", "And the lenses? I need them for reading and distance."],
        ["M", "The pair you chose comes to forty dollars."],
        ["W", "So a hundred dollars altogether."],
        ["M", "That's the list price. Do you have a student card with you?"],
        ["W", "I do. Here it is."],
        ["M", "Then I can take twenty percent off the whole order."],
        ["W", "That's a real help. When can I pick them up?"],
        ["M", "Friday afternoon. Would you like a case as well? It's ten dollars."],
        ["W", "No, thank you. I'll keep the old one."],
      ],
      choices: ["$72", "$76", "$80", "$84", "$90"],
      answer: 3,
      clue: "Then I can take twenty percent off the whole order.",
      explanation:
        "안경테 60달러와 렌즈 40달러를 더하면 100달러이고, 학생 할인 20퍼센트를 빼면 80달러이다. 안경집은 사지 않았으므로 답은 ③이다.",
      translation: [
        "M: 안녕하세요. 안경테는 정하셨나요?",
        "W: 네, 아까 써 본 얇은 금속테로 할게요.",
        "M: 그 테는 60달러입니다.",
        "W: 렌즈는요? 가까운 것도 먼 것도 봐야 해서요.",
        "M: 고르신 렌즈 한 쌍은 40달러입니다.",
        "W: 그럼 다 해서 100달러네요.",
        "M: 정가로는 그렇습니다. 학생증 가지고 계신가요?",
        "W: 네, 여기요.",
        "M: 그럼 전체 금액에서 20퍼센트를 빼 드릴 수 있습니다.",
        "W: 정말 도움이 되네요. 언제 찾으러 오면 될까요?",
        "M: 금요일 오후요. 안경집도 하시겠어요? 10달러입니다.",
        "W: 아니요, 괜찮아요. 쓰던 걸 계속 쓸게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 여자가 주말 스터디에 참여할 수 없는 이유를 고르시오.",
      lines: [
        ["M", "Jiwoo, we're moving the study group to Saturday mornings from next week."],
        ["W", "Saturday mornings? Then I'll have to drop out."],
        ["M", "Is it the part-time job you mentioned?"],
        ["W", "No, I gave that up in August to focus on the exam."],
        ["M", "Then what is it? You haven't missed a single session since March."],
        ["W", "I hurt my back in July, and I have physical therapy every Saturday morning."],
        ["M", "Every Saturday? For how long?"],
        ["W", "Until at least December. The hospital only offers weekend slots to students."],
        ["M", "I had no idea. Then let me ask the others about Sunday evenings."],
        ["W", "That would work for me. Thank you for asking."],
      ],
      choices: [
        "주말마다 치료를 받아야 해서",
        "아르바이트를 시작해서",
        "다른 스터디와 겹쳐서",
        "통학 시간이 길어서",
        "가족 여행을 가야 해서",
      ],
      answer: 1,
      clue: "I hurt my back in July, and I have physical therapy every Saturday morning.",
      explanation:
        "여자는 7월에 허리를 다쳐 토요일 아침마다 물리 치료를 받아야 한다고 말한다. 따라서 답은 ①이다.",
      translation: [
        "M: 지우야, 다음 주부터 스터디를 토요일 아침으로 옮기려고 해.",
        "W: 토요일 아침? 그럼 나는 빠져야겠다.",
        "M: 말했던 아르바이트 때문이야?",
        "W: 아니, 시험에 집중하려고 8월에 그만뒀어.",
        "M: 그럼 뭔데? 3월부터 한 번도 안 빠졌잖아.",
        "W: 7월에 허리를 다쳐서 토요일 아침마다 물리 치료를 받아.",
        "M: 토요일마다? 얼마나?",
        "W: 적어도 12월까지. 병원에서 학생은 주말 시간만 잡아 줘.",
        "M: 전혀 몰랐네. 그럼 다른 애들한테 일요일 저녁은 어떤지 물어볼게.",
        "W: 그러면 나도 갈 수 있어. 물어봐 줘서 고마워.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 교내 모의 면접 주간에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["W", "Hyunwoo, have you signed up for the mock interview week?"],
        ["M", "Not yet. I only know the name of it."],
        ["W", "It runs from the eighth to the twelfth, right after the mid-terms."],
        ["M", "Five days. Is it open to every year group?"],
        ["W", "Third years only this time. The rest have theirs in March."],
        ["M", "How is it actually run?"],
        ["W", "Two teachers interview you for fifteen minutes and record it."],
        ["M", "Recorded? That sounds terrifying."],
        ["W", "It's the useful part. You watch it afterwards with your homeroom teacher."],
        ["M", "All right. Where do I sign up?"],
        ["W", "On the school website, under career guidance. It closes this Friday."],
      ],
      choices: ["진행 기간", "대상 학년", "진행 방식", "준비물", "신청 방법"],
      answer: 4,
      clue: "On the school website, under career guidance. It closes this Friday.",
      explanation:
        "기간(8일~12일), 대상 학년(3학년), 진행 방식(교사 두 명이 15분간 면접하고 녹화), 신청 방법(학교 누리집)은 언급되지만 준비물은 언급되지 않았다. 따라서 답은 ④이다.",
      translation: [
        "W: 현우야, 모의 면접 주간 신청했어?",
        "M: 아직. 이름만 알아.",
        "W: 8일부터 12일까지야, 중간고사 바로 끝나고.",
        "M: 닷새구나. 전 학년 다 할 수 있어?",
        "W: 이번엔 3학년만. 나머지 학년은 3월에 해.",
        "M: 어떻게 진행되는데?",
        "W: 선생님 두 분이 15분 동안 면접하고 그걸 녹화해.",
        "M: 녹화? 무섭다.",
        "W: 그게 제일 도움이 돼. 나중에 담임 선생님이랑 같이 보거든.",
        "M: 알겠어. 신청은 어디서 해?",
        "W: 학교 누리집 진로 안내란에서. 이번 주 금요일에 마감이야.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Campus Night Library에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "M",
          "Here is what you need to know about the Campus Night Library. " +
            "It opens for the two weeks before the final examinations and closes again once they are over. " +
            "On those nights the reading room stays open until midnight, four hours later than usual. " +
            "Third-year students are given the seats first, and any that remain go to the other years. " +
            "You must book your seat by five o'clock on the day before; there is no booking at the door. " +
            "Drinks are allowed, but only in containers with a lid, because the tables are shared. " +
            "Come early on the first night — last year every seat was taken by six.",
        ],
      ],
      choices: [
        "기말고사 전 2주 동안 운영된다",
        "밤 10시에 문을 닫는다",
        "3학년에게 자리가 먼저 배정된다",
        "자리는 하루 전에 예약해야 한다",
        "뚜껑이 있는 용기의 음료만 가져올 수 있다",
      ],
      answer: 2,
      clue: "On those nights the reading room stays open until midnight, four hours later than usual.",
      explanation:
        "열람실은 밤 12시까지 연다고 했으므로 10시에 닫는다는 ②가 내용과 일치하지 않는다.",
      translation: [
        "M: Campus Night Library에 관해 알아 두셔야 할 내용입니다. " +
          "기말고사 전 2주 동안 열고, 시험이 끝나면 다시 닫습니다. " +
          "그 기간에는 열람실이 평소보다 네 시간 늦은 밤 12시까지 열립니다. " +
          "자리는 3학년에게 먼저 배정하고, 남는 자리는 다른 학년에게 돌아갑니다. " +
          "자리는 전날 5시까지 예약해야 하며, 현장 예약은 없습니다. " +
          "음료는 가져올 수 있지만 뚜껑이 있는 용기만 됩니다. 책상을 함께 쓰기 때문입니다. " +
          "첫날은 일찍 오세요. 작년에는 6시면 자리가 다 찼습니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 예약할 스터디룸을 고르시오.",
      lines: [
        ["W", "Dohun, these are the five study rooms the centre still has free."],
        ["M", "There are five of us now that Jisu joined, so one of them is too small."],
        ["W", "Right, that's the first one gone. What else matters?"],
        ["M", "We need a whiteboard. Half of what we do is working through problems."],
        ["W", "Then another one drops out. Three left."],
        ["M", "And we always meet after dinner, so a morning-only room is no use."],
        ["W", "That removes one more. Two are left now."],
        ["M", "What do they cost? We agreed on nine thousand won an hour at most."],
        ["W", "One of them is over that, so only one fits everything."],
        ["M", "Then let's book it for Tuesday and Thursday evenings."],
        ["W", "I'll reserve both evenings before someone else does."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 5,
      clue: "One of them is over that, so only one fits everything.",
      explanation:
        "4인실인 ①, 화이트보드가 없는 ②, 오전만 쓸 수 있는 ③을 뺀다. 남은 ④와 ⑤ 중 시간당 9,000원 이하인 것은 ⑤이므로 답은 ⑤이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "4인실 / 6,000원 / 화이트보드 있음 / 오전만" },
          { no: 2, label: "②", value: "6인실 / 9,000원 / 화이트보드 없음 / 종일" },
          { no: 3, label: "③", value: "6인실 / 7,000원 / 화이트보드 있음 / 오전만" },
          { no: 4, label: "④", value: "8인실 / 10,000원 / 화이트보드 있음 / 종일" },
          { no: 5, label: "⑤", value: "6인실 / 8,000원 / 화이트보드 있음 / 종일" },
        ],
      },
      translation: [
        "W: 도훈아, 센터에 아직 남아 있는 스터디룸이 이 다섯 개야.",
        "M: 지수가 들어와서 이제 다섯 명이니까 하나는 너무 작아.",
        "W: 맞아, 그럼 첫 번째가 빠지네. 또 뭐가 중요해?",
        "M: 화이트보드가 있어야 해. 우리가 하는 일의 절반이 문제 푸는 거잖아.",
        "W: 그럼 하나 더 빠져. 셋 남았어.",
        "M: 그리고 우리는 늘 저녁 먹고 모이니까 오전만 되는 방은 소용없어.",
        "W: 그럼 하나 더 빠지고 둘 남았다.",
        "M: 가격은? 시간당 9천 원까지로 정했잖아.",
        "W: 하나는 그걸 넘으니까 다 맞는 건 하나뿐이네.",
        "M: 그럼 화요일이랑 목요일 저녁으로 예약하자.",
        "W: 다른 사람이 잡기 전에 두 저녁 다 예약할게.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Have you handed in the recommendation request form yet?"],
        ["M", "Not yet. I couldn't find the teacher during the week."],
        ["W", "Isn't the deadline this Friday?"],
        ["M", "It is. I thought I'd have to leave it."],
        ["W", "She's in the staff room every morning before first period."],
      ],
      choices: [
        "The form needs two signatures.",
        "I've already asked another teacher.",
        "She taught me in first year.",
        "Then I'll catch her tomorrow morning.",
        "You should hand yours in first.",
      ],
      answer: 4,
      clue: "She's in the staff room every morning before first period.",
      explanation:
        "선생님이 1교시 전에는 교무실에 계신다는 말을 들었으므로, 내일 아침에 찾아뵙겠다는 ④가 가장 자연스럽다.",
      translation: [
        "W: 추천서 신청서 냈어?",
        "M: 아직. 주중에 선생님을 못 뵀어.",
        "W: 마감이 이번 주 금요일 아니야?",
        "M: 맞아. 그냥 포기해야 하나 했어.",
        "W: 그 선생님 아침마다 1교시 전에 교무실에 계셔.",
        "M: 그럼 내일 아침에 찾아뵐게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "You've been squinting at the board all morning."],
        ["W", "My glasses broke on Saturday and the new ones aren't ready."],
        ["M", "Can't you sit closer until then?"],
        ["W", "The front rows are all taken by the time I get here."],
        ["M", "Just ask the teacher. She changes the seating every month anyway."],
      ],
      choices: [
        "Then I'll ask her at lunch today.",
        "My new glasses arrive on Friday.",
        "I've sat at the back since March.",
        "The board is too bright in the morning.",
        "You should get your eyes tested too.",
      ],
      answer: 1,
      clue: "Just ask the teacher. She changes the seating every month anyway.",
      explanation:
        "선생님이 어차피 달마다 자리를 바꾸니 말씀드리라는 조언을 들었으므로, 점심시간에 말씀드리겠다는 ①이 가장 자연스럽다.",
      translation: [
        "M: 오전 내내 칠판을 찡그리고 보더라.",
        "W: 토요일에 안경이 부러졌는데 새 안경이 아직 안 나왔어.",
        "M: 그때까지 앞에 앉으면 안 돼?",
        "W: 내가 올 때면 앞줄은 이미 다 차 있어.",
        "M: 그냥 선생님께 말씀드려. 어차피 달마다 자리를 바꾸시잖아.",
        "W: 그럼 오늘 점심시간에 말씀드릴게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Yeseo, you said you were rewriting your personal statement again?"],
        ["W", "The fourth version. I start it over every Sunday."],
        ["M", "Four versions in a month. Which one is closest to finished?"],
        ["W", "I couldn't tell you. I delete the file each time I start again."],
        ["M", "You delete them? So there's nothing to compare."],
        ["W", "I thought keeping the old ones would just confuse me."],
        ["M", "But now you can't tell whether version four is better than version one."],
        ["W", "When you say it out loud, it does sound like I'm going in circles."],
        ["M", "You probably solved the opening in version two and threw it away."],
        ["W", "That's possible. I remember liking one of the openings."],
        ["M", "Save every version from now on, and read them side by side before you write a fifth."],
      ],
      choices: [
        "I'll submit the fourth version tomorrow.",
        "I've never written a personal statement before.",
        "Then I'll keep each version and compare them this Sunday.",
        "The word limit is eight hundred characters.",
        "I'd rather ask a teacher to write it for me.",
      ],
      answer: 3,
      clue: "Save every version from now on, and read them side by side before you write a fifth.",
      explanation:
        "이전 원고를 지우지 말고 나란히 놓고 비교하라는 조언을 들었으므로, 이번 일요일에 모아서 비교하겠다는 ③이 가장 자연스럽다.",
      translation: [
        "M: 예서야, 자기소개서를 또 다시 쓰고 있다고 했지?",
        "W: 네 번째 판이야. 일요일마다 처음부터 다시 써.",
        "M: 한 달에 네 판이라니. 어느 게 완성에 제일 가까운데?",
        "W: 그건 말 못 해. 다시 쓸 때마다 파일을 지우거든.",
        "M: 지운다고? 그럼 비교할 게 없잖아.",
        "W: 예전 걸 두면 헷갈리기만 할 것 같았어.",
        "M: 그런데 지금은 네 번째가 첫 번째보다 나은지 알 수가 없잖아.",
        "W: 그렇게 말하니 정말 제자리를 도는 것 같네.",
        "M: 두 번째 판에서 도입부를 이미 해결해 놓고 버렸을 수도 있어.",
        "W: 그럴 수도 있어. 어떤 도입부가 마음에 들었던 기억이 나.",
        "M: 이제부터는 판마다 다 저장해 두고, 다섯 번째를 쓰기 전에 나란히 놓고 읽어 봐.",
        "W: 그럼 판마다 남겨 두고 이번 일요일에 비교해 볼게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Junyoung, you look like you haven't slept."],
        ["M", "I study until two every night. There's no other way to cover everything."],
        ["W", "And how much of the next morning do you remember?"],
        ["M", "Honestly, the first two periods are a blur."],
        ["W", "So you gain two hours at night and lose two in the morning."],
        ["M", "I've thought about that, but the evening is when the house is quiet."],
        ["W", "Is it quiet at six in the morning?"],
        ["M", "Even quieter, I suppose. I've just never tried it."],
        ["W", "Move one of those late hours to before breakfast for a week and see."],
      ],
      choices: [
        "I'll go to bed at two again tonight.",
        "My house is never quiet in the evening.",
        "I've been getting up at six since March.",
        "Then I'll study from six to seven next week.",
        "The library opens at nine on weekdays.",
      ],
      answer: 4,
      clue: "Move one of those late hours to before breakfast for a week and see.",
      explanation:
        "늦은 밤 공부 시간 한 시간을 아침으로 옮겨 일주일만 해 보라는 조언을 들었으므로, 다음 주에 6시부터 7시까지 공부해 보겠다는 ④가 가장 자연스럽다.",
      translation: [
        "W: 준영아, 잠을 못 잔 얼굴이다.",
        "M: 매일 새벽 2시까지 공부해. 다 보려면 다른 방법이 없어.",
        "W: 그럼 다음 날 아침은 얼마나 기억나?",
        "M: 솔직히 1, 2교시는 멍해.",
        "W: 밤에 두 시간 벌고 아침에 두 시간 잃는 거네.",
        "M: 생각은 해 봤는데, 집이 조용한 건 저녁이라서.",
        "W: 아침 6시에는 안 조용해?",
        "M: 더 조용하겠지. 그냥 해 본 적이 없어서.",
        "W: 그 늦은 시간 중 한 시간을 아침 식사 전으로 옮겨서 일주일만 해 봐.",
        "M: 그럼 다음 주에는 6시부터 7시까지 공부해 볼게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Mr. Noh가 Yerim에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Mr. Noh : ________________",
      lines: [
        [
          "W",
          "Mr. Noh is the homeroom teacher of a third-year class, and Yerim is one of his students. " +
            "Yerim has decided to apply to five universities, and she has written a separate statement for each one. " +
            "Her writing is careful, and every one of the five is honest about what she wants to study. " +
            "The difficulty is that she has been polishing all five at the same time for three weeks. " +
            "Two of the applications close on Monday, and those two are the least finished of the group. " +
            "Mr. Noh does not think she should give up any of the five; her list is a sensible one. " +
            "He simply wants her to put the other three aside until Monday is behind her. " +
            "In this situation, what would Mr. Noh most likely say to Yerim?",
        ],
      ],
      choices: [
        "Finish the two that close on Monday first, then go back to the rest.",
        "I think you should apply to fewer universities this year.",
        "Try writing one statement and using it for all five.",
        "You should ask another teacher to check your writing.",
        "Let's postpone all five applications until next week.",
      ],
      answer: 1,
      clue: "He simply wants her to put the other three aside until Monday is behind her.",
      explanation:
        "노 선생님은 다섯 곳 모두 지원하는 것에는 문제가 없다고 보면서, 월요일에 마감되는 두 곳을 먼저 끝내라고 말하려 한다. 따라서 ①이 가장 적절하다.",
      translation: [
        "W: 노 선생님은 3학년 담임이고, 예림이는 그 반 학생입니다. " +
          "예림이는 다섯 개 대학에 지원하기로 하고 각각에 맞춘 자기소개서를 따로 썼습니다. " +
          "글은 꼼꼼하고, 다섯 편 모두 무엇을 공부하고 싶은지 솔직하게 담겨 있습니다. " +
          "문제는 3주째 다섯 편을 동시에 다듬고 있다는 점입니다. " +
          "그중 두 곳은 월요일에 마감인데, 하필 그 두 편이 가장 덜 완성되었습니다. " +
          "노 선생님은 다섯 곳 중 어느 하나를 포기해야 한다고 보지 않습니다. 목록 자체는 합리적입니다. " +
          "다만 월요일이 지나갈 때까지 나머지 세 편은 잠시 내려놓기를 바랍니다. " +
          "이런 상황에서 노 선생님이 예림이에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "여자가 하는 말의 주제로 가장 적절한 것은?",
      lines: [
        ["W", "Good afternoon. Long before anyone owned a clock, people still had to agree on when to meet."],
        ["W", "The oldest answer was the sundial, which turns a shadow into a number but says nothing after dark."],
        ["W", "So the Egyptians cut a water clock: a bowl that leaks at a steady rate, marked inside with lines."],
        ["W", "Sailors needed something that worked on a rolling deck, so they turned the hourglass and counted the turns."],
        ["W", "Then in the seventeenth century the pendulum clock cut the daily error from minutes to seconds."],
        ["W", "Each of these devices borrowed something that moves at a steady rate and made it visible."],
        ["W", "That, in the end, is all a clock has ever been: a steady motion we agreed to count."],
      ],
      choices: [
        "why modern clocks are so accurate",
        "the tools people have used to measure time",
        "how time zones were first agreed on",
        "why the day is divided into twenty-four hours",
        "how sailors found their position at sea",
      ],
      answer: 2,
      clue: "That, in the end, is all a clock has ever been: a steady motion we agreed to count.",
      explanation:
        "여자는 해시계, 물시계, 모래시계, 진자시계를 차례로 들며 사람들이 시간을 재는 데 써 온 도구들을 설명한다. 따라서 주제는 ②이다.",
      translation: [
        "W: 안녕하세요. 시계를 가진 사람이 아무도 없던 시절에도 사람들은 언제 만날지 정해야 했습니다.",
        "W: 가장 오래된 답은 해시계였습니다. 그림자를 숫자로 바꾸지만 해가 지면 아무 말도 하지 못합니다.",
        "W: 그래서 이집트인들은 물시계를 깎았습니다. 일정하게 새는 그릇 안쪽에 눈금을 새긴 것입니다.",
        "W: 뱃사람들은 흔들리는 갑판에서도 쓸 수 있는 것이 필요했기에 모래시계를 뒤집고 그 횟수를 셌습니다.",
        "W: 그러다 17세기에 진자시계가 하루 오차를 분에서 초로 줄였습니다.",
        "W: 이 장치들은 모두 일정하게 움직이는 무언가를 빌려 와 눈에 보이게 만든 것입니다.",
        "W: 결국 시계란 언제나 그것이었습니다. 우리가 세기로 합의한 일정한 움직임 말입니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 도구가 아닌 것은?",
      lines: [
        ["W", "Good afternoon. Long before anyone owned a clock, people still had to agree on when to meet."],
        ["W", "The oldest answer was the sundial, which turns a shadow into a number but says nothing after dark."],
        ["W", "So the Egyptians cut a water clock: a bowl that leaks at a steady rate, marked inside with lines."],
        ["W", "Sailors needed something that worked on a rolling deck, so they turned the hourglass and counted the turns."],
        ["W", "Then in the seventeenth century the pendulum clock cut the daily error from minutes to seconds."],
        ["W", "Each of these devices borrowed something that moves at a steady rate and made it visible."],
        ["W", "That, in the end, is all a clock has ever been: a steady motion we agreed to count."],
      ],
      choices: ["sundial", "water clock", "candle clock", "hourglass", "pendulum clock"],
      answer: 3,
      clue: "Sailors needed something that worked on a rolling deck, so they turned the hourglass and counted the turns.",
      explanation:
        "해시계, 물시계, 모래시계, 진자시계는 언급되지만 초시계는 언급되지 않았다. 따라서 답은 ③이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
