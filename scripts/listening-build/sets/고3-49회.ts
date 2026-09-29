/** 고3 듣기 49회 — 사람이 직접 쓴 회차 (2026-09-30) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고3 49회",
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
          "Good morning, everyone. This is the third-year office. " +
            "Since September we have received forty-one requests to change classrooms " +
            "for evening study, and we have granted almost all of them. " +
            "Last night three rooms held two students each and one held thirty-six. " +
            "A room with thirty-six students and eighteen desks is not study; it is queuing. " +
            "So from Monday the evening rooms are fixed by class, as they were in March. " +
            "If your own room is genuinely unusable, come and tell us why, " +
            "and we will move the whole class rather than one student. " +
            "This is not about rules. It is about there being a desk when you arrive.",
        ],
      ],
      choices: [
        "야간 자습 교실을 반별로 고정한다고 알리려고",
        "야간 자습 신청을 받으려고",
        "교실 이전 공사를 알리려고",
        "자습 시간 변경을 알리려고",
        "책상 파손을 주의시키려고",
      ],
      answer: 1,
      clue: "So from Monday the evening rooms are fixed by class, as they were in March.",
      explanation:
        "월요일부터 야간 자습 교실을 반별로 고정한다고 알리고 있다. 따라서 답은 ①이다.",
      translation: [
        "M: 여러분, 안녕하세요. 3학년 부실입니다. 9월부터 야간 자습 교실을 바꿔 달라는 신청을 마흔한 건 받았고, 거의 다 들어드렸습니다. 어젯밤에는 세 교실에 두 명씩 있었고 한 교실에 서른여섯 명이 있었습니다. 책상 열여덟 개에 학생 서른여섯 명은 자습이 아니라 줄 서기입니다. 그래서 월요일부터 야간 자습 교실은 3월처럼 반별로 고정합니다. 자기 교실을 정말로 쓸 수 없다면 찾아와 까닭을 말해 주세요. 한 사람이 아니라 반 전체를 옮겨 드리겠습니다. 규칙 이야기가 아닙니다. 가면 앉을 책상이 있게 하자는 이야기입니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 여자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Nayeon, you read the whole question paper before starting?"],
        ["W", "Three minutes at the beginning, every time."],
        ["M", "That's three minutes you could be answering."],
        ["W", "It's three minutes I get back twice over."],
        ["M", "How does reading ahead give you time?"],
        ["W", "I find the two questions that will eat the hour."],
        ["M", "And you leave those until last."],
        ["W", "I know they're coming, so I don't panic in the middle."],
        ["M", "I always meet mine by surprise at question thirty."],
        ["W", "And then you spend twelve minutes deciding whether to skip."],
        ["M", "That's exactly what happened on Tuesday."],
        ["W", "Decide the order before the clock starts mattering."],
        ["M", "I'll try three minutes on Thursday."],
      ],
      choices: [
        "시험은 전체를 훑고 푸는 차례를 정해야 한다",
        "시험은 앞에서부터 순서대로 풀어야 한다",
        "어려운 문제는 건너뛰어야 한다",
        "시험 시간을 재며 연습해야 한다",
        "문제는 두 번 읽어야 한다",
      ],
      answer: 1,
      clue: "Decide the order before the clock starts mattering.",
      explanation:
        "여자는 시작 전에 전체를 훑고 푸는 차례를 정해 두라고 말한다. 따라서 답은 ①이다.",
      translation: [
        "M: 나연아, 시작하기 전에 시험지를 통째로 읽어?",
        "W: 매번 처음에 3분씩.",
        "M: 그 3분이면 문제를 풀 수 있잖아.",
        "W: 그 3분은 두 배로 돌려받아.",
        "M: 미리 읽는 게 어떻게 시간을 벌어 줘?",
        "W: 한 시간을 잡아먹을 두 문제를 찾아 둬.",
        "M: 그리고 그건 맨 뒤로 미루고.",
        "W: 온다는 걸 아니까 중간에 당황하지 않아.",
        "M: 나는 늘 30번쯤에서 갑자기 만나.",
        "W: 그러고는 넘길지 말지 정하는 데 12분을 쓰지.",
        "M: 화요일에 딱 그랬어.",
        "W: 시간이 급해지기 전에 차례를 정해 둬.",
        "M: 목요일에 3분 해 볼게.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "We think of forgetting as the failure of memory, " +
            "and we treat every lost fact as something that went wrong. " +
            "But a mind that kept everything would be unusable. " +
            "Every time you looked for a name you would meet ten thousand names, " +
            "and every room you entered would arrive with every room you had entered. " +
            "Forgetting is what allows the useful thing to come first. " +
            "What we call a good memory is not a memory that holds more; " +
            "it is one that has learned what to let go of. " +
            "Train the choosing, not the holding.",
        ],
      ],
      choices: [
        "기억은 무엇을 버릴지 가려내는 힘이다",
        "기억력은 반복으로 길러진다",
        "잊지 않으려면 기록해야 한다",
        "잠을 자야 기억이 남는다",
        "기억은 나이가 들면 나빠진다",
      ],
      answer: 1,
      clue: "Train the choosing, not the holding.",
      explanation:
        "좋은 기억은 더 많이 담는 것이 아니라 무엇을 버릴지 아는 것이라고 말한다. 따라서 답은 ①이다.",
      translation: [
        "M: 우리는 잊는 것을 기억의 실패로 여기고, 잃어버린 사실 하나하나를 잘못된 일로 취급합니다. 그러나 모든 것을 담아 두는 머리는 쓸 수 없습니다. 이름 하나를 찾을 때마다 만 개의 이름을 만나게 되고, 들어가는 방마다 지금껏 들어간 모든 방이 따라 들어옵니다. 쓸모 있는 것이 먼저 떠오르게 해 주는 것이 바로 잊음입니다. 우리가 좋은 기억력이라 부르는 것은 더 많이 담는 기억이 아니라, 무엇을 놓아줄지 배운 기억입니다. 담는 힘이 아니라 가려내는 힘을 기르십시오.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["W", "Junho, is this a photo of your evening study room?"],
        ["M", "They set it up again at the start of September."],
        ["W", "There are two rows of desks facing the front."],
        ["M", "Eighteen desks, nine in each row."],
        ["W", "And a whiteboard covers the front wall."],
        ["M", "The night's timetable goes up on it."],
        ["W", "There's a water cooler in the back corner."],
        ["M", "A bookcase, actually. The cooler is in the corridor."],
        ["W", "A large clock hangs above the door."],
        ["M", "It's the one thing everybody looks at."],
        ["W", "And a fan stands beside the window."],
        ["M", "We run it until the end of October."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "A bookcase, actually. The cooler is in the corridor.",
      explanation:
        "뒤쪽 구석에 정수기가 있다고 했지만 책장이라고 했다. 따라서 답은 ③이다.",
      figure: {
        kind: "figure5",
        scene:
          "A school evening study room, clean black line art on a plain white background, no writing or letters anywhere. " +
          "TWO ROWS OF DESKS face the front of the room. " +
          "A WHITEBOARD covers the front wall. " +
          "A WATER COOLER stands in the back corner on the right. " +
          "A LARGE CLOCK hangs on the wall above the door. " +
          "A FAN stands on the floor beside the window on the left.",
        spots: [
          [0.45, 0.68],
          [0.5, 0.2],
          [0.88, 0.55],
          [0.68, 0.1],
          [0.1, 0.5],
        ],
      },
      translation: [
        "W: 준호야, 이게 너희 야간 자습 교실 사진이야?",
        "M: 9월 초에 다시 차렸어.",
        "W: 앞을 보고 책상이 두 줄 놓여 있네.",
        "M: 열여덟 개, 한 줄에 아홉 개씩.",
        "W: 그리고 앞 벽은 칠판이 덮고 있고.",
        "M: 그날 밤 일정이 거기 붙어.",
        "W: 뒤쪽 구석에는 정수기가 있어.",
        "M: 사실 책장이야. 정수기는 복도에 있어.",
        "W: 문 위에 큰 시계가 걸려 있네.",
        "M: 다들 쳐다보는 건 그거 하나야.",
        "W: 그리고 창가에 선풍기가 있고.",
        "M: 10월 말까지 틀어.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 여자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Chaewon, the graduation photos are taken at ten tomorrow."],
        ["W", "The garden is swept and the benches are in place."],
        ["M", "It looks better than the photography room ever did."],
        ["W", "We moved the pots out of the way on Tuesday."],
        ["M", "Did anyone collect the class banners from the storeroom?"],
        ["W", "Minjun said he would carry them over after lunch."],
        ["M", "He went to the dentist and didn't come back."],
        ["W", "Then the banners are still in the storeroom."],
        ["M", "How many does each class need?"],
        ["W", "One each, so eleven altogether."],
        ["M", "And the storeroom is locked at five."],
        ["W", "It's ten to five right now."],
        ["M", "Then somebody has to go this minute."],
        ["W", "You can't; you're meeting the photographer at the gate."],
        ["M", "I'll stay and wait for the photographer."],
        ["W", "I'll go and fetch the banners."],
      ],
      choices: [
        "사진사를 맞이하기",
        "현수막을 가져오기",
        "의자를 놓기",
        "민준이에게 연락하기",
        "정원을 쓸기",
      ],
      answer: 2,
      clue: "I'll go and fetch the banners.",
      explanation:
        "여자는 창고에서 반별 현수막을 가져오겠다고 했다. 따라서 답은 ②이다.",
      translation: [
        "M: 채원아, 졸업 사진은 내일 열 시에 찍어.",
        "W: 정원은 쓸었고 의자도 놨어.",
        "M: 사진실보다 훨씬 낫다.",
        "W: 화요일에 화분을 옆으로 치웠어.",
        "M: 창고에서 반별 현수막은 누가 가져왔어?",
        "W: 민준이가 점심 먹고 옮겨 오겠다고 했어.",
        "M: 치과 갔다가 안 돌아왔어.",
        "W: 그럼 현수막은 아직 창고에 있겠네.",
        "M: 반마다 몇 개 필요해?",
        "W: 하나씩, 다 해서 열한 개.",
        "M: 그리고 창고는 다섯 시에 잠가.",
        "W: 지금 다섯 시 10분 전이야.",
        "M: 그럼 누군가 당장 가야 해.",
        "W: 너는 안 돼. 정문에서 사진사 만나기로 했잖아.",
        "M: 나는 남아서 사진사를 기다릴게.",
        "W: 내가 가서 현수막을 가져올게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 남자가 지불할 금액을 고르시오.",
      lines: [
        ["W", "Welcome to the photo studio. How can I help you?"],
        ["M", "I'd like four large prints and six small ones."],
        ["W", "The large prints are seven dollars each."],
        ["M", "Were they not five dollars last winter?"],
        ["W", "They were, but the paper price went up in March."],
        ["M", "Then four large ones, please."],
        ["W", "And the small prints are two dollars each."],
        ["M", "Do they come in a folder?"],
        ["W", "A paper folder is included with any order."],
        ["M", "Good. Is there a school discount?"],
        ["W", "Ten percent off the total with a school card."],
        ["M", "Here it is. I'll pay by card."],
      ],
      choices: ["$32.00", "$34.00", "$36.00", "$38.00", "$40.00"],
      answer: 3,
      clue: "The large prints are seven dollars each.",
      explanation:
        "큰 사진 4장 28달러와 작은 사진 6장 12달러로 40달러인데, 10퍼센트를 빼면 36달러이다. 따라서 답은 ③이다.",
      translation: [
        "W: 사진관에 오신 걸 환영합니다. 무엇을 도와드릴까요?",
        "M: 큰 사진 네 장과 작은 사진 여섯 장 부탁드려요.",
        "W: 큰 사진은 한 장에 7달러입니다.",
        "M: 지난겨울에는 5달러 아니었나요?",
        "W: 맞는데 3월에 인화지 값이 올랐어요.",
        "M: 그럼 큰 걸로 네 장 주세요.",
        "W: 그리고 작은 사진은 한 장에 2달러입니다.",
        "M: 넣을 봉투도 주시나요?",
        "W: 종이 봉투는 어떤 주문에도 같이 드립니다.",
        "M: 좋네요. 학교 할인이 있나요?",
        "W: 학교 카드가 있으면 전체에서 10퍼센트 할인됩니다.",
        "M: 여기요. 카드로 낼게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 여자가 야간 자습을 그만둔 이유를 고르시오.",
      lines: [
        ["M", "Sujin, you haven't been in the evening room this week."],
        ["M", "You stayed until ten every night since March."],
        ["W", "I did, and I liked it there."],
        ["M", "Was the room too noisy?"],
        ["W", "It's the quietest place in the building."],
        ["M", "Did your parents ask you to come home?"],
        ["W", "They left it to me, as always."],
        ["M", "Then what changed?"],
        ["W", "The last bus from school now leaves at nine."],
        ["M", "And the next one is an hour later."],
        ["W", "I was walking forty minutes in the dark."],
        ["M", "Then studying at home makes more sense."],
      ],
      choices: [
        "막차 시간이 앞당겨져서",
        "교실이 시끄러워서",
        "부모님이 오라고 하셔서",
        "몸이 아파서",
        "학원에 다니게 되어서",
      ],
      answer: 1,
      clue: "The last bus from school now leaves at nine.",
      explanation:
        "막차가 아홉 시로 앞당겨져 밤길을 걸어야 했기 때문이다. 따라서 답은 ①이다.",
      translation: [
        "M: 수진아, 이번 주에 야간 자습실에서 안 보이더라.",
        "M: 3월부터 매일 밤 열 시까지 있었잖아.",
        "W: 그랬지, 거기가 좋았어.",
        "M: 교실이 너무 시끄러웠어?",
        "W: 건물에서 제일 조용한 데야.",
        "M: 부모님이 집에 오라고 하셨어?",
        "W: 늘 그렇듯 나한테 맡기셨어.",
        "M: 그럼 뭐가 달라졌어?",
        "W: 학교 앞 막차가 이제 아홉 시에 떠나.",
        "M: 그다음은 한 시간 뒤고.",
        "W: 어두운 길을 40분씩 걸었어.",
        "M: 그럼 집에서 하는 게 낫겠다.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 졸업 여행에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["W", "Hyunwoo, are you going on the graduation trip?"],
        ["W", "The letter came round in class this morning."],
        ["M", "We go to Gyeongju this year."],
        ["W", "Not to the east coast like last time?"],
        ["M", "Gyeongju, because more classes asked for it."],
        ["W", "When does it run?"],
        ["M", "Two nights, from the eighteenth of December."],
        ["W", "How do we get there?"],
        ["M", "By coach, leaving the school at seven in the morning."],
        ["W", "How much does it cost?"],
        ["M", "A hundred and forty thousand won, meals included."],
        ["W", "Is there anything we have to bring?"],
        ["M", "A coat and something to sleep in."],
        ["W", "Then I'll hand my form in tomorrow."],
      ],
      choices: ["가는 곳", "일정", "가는 방법", "비용", "묵는 곳"],
      answer: 5,
      clue: "Two nights, from the eighteenth of December.",
      explanation:
        "가는 곳, 일정, 가는 방법, 비용은 말했지만 묵는 곳은 말하지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 현우야, 졸업 여행 갈 거야?",
        "W: 오늘 아침에 반에서 통신문 돌았잖아.",
        "M: 올해는 경주로 가.",
        "W: 지난번처럼 동해안이 아니고?",
        "M: 경주를 원하는 반이 더 많았대.",
        "W: 언제 가?",
        "M: 12월 18일부터 2박.",
        "W: 어떻게 가?",
        "M: 관광버스로, 아침 일곱 시에 학교에서 출발해.",
        "W: 얼마야?",
        "M: 14만 원, 식사 포함이야.",
        "W: 가져가야 할 게 있어?",
        "M: 외투랑 잠옷.",
        "W: 그럼 내일 신청서 낼게.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "다음을 듣고, 졸업 앨범 제작에 관한 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "W",
          "Hello, students. Here is how the yearbook will be made this year. " +
            "Photographs are taken on the fourth of November in the school garden. " +
            "Each class writes one page about itself, not two as before. " +
            "Send your class page to the yearbook email by the twentieth of November. " +
            "Personal messages are collected on paper, not by email. " +
            "The book is printed in December and handed out in February. " +
            "There is no charge; the school pays for it. " +
            "Students who leave early may still receive a copy by post. " +
            "Ask your class teacher if anything is unclear.",
        ],
      ],
      choices: [
        "사진은 11월 4일에 학교 정원에서 찍는다",
        "반마다 한 쪽씩 쓴다",
        "반 소개는 전자우편으로 보낸다",
        "개인 메시지도 전자우편으로 모은다",
        "책값은 받지 않는다",
      ],
      answer: 4,
      clue: "Personal messages are collected on paper, not by email.",
      explanation:
        "개인 메시지는 전자우편이 아니라 종이로 모은다고 했으므로 ④가 일치하지 않는다.",
      translation: [
        "W: 학생 여러분, 안녕하세요. 올해 졸업 앨범을 어떻게 만드는지 알려 드립니다. 사진은 11월 4일에 학교 정원에서 찍습니다. 반마다 예전처럼 두 쪽이 아니라 한 쪽씩 자기 반 소개를 씁니다. 반 소개는 11월 20일까지 앨범 전자우편으로 보내 주세요. 개인 메시지는 전자우편이 아니라 종이로 모읍니다. 책은 12월에 찍어 2월에 나눠 드립니다. 책값은 받지 않습니다. 학교에서 냅니다. 먼저 학교를 떠나는 학생도 우편으로 받을 수 있습니다. 궁금한 점은 담임 선생님께 여쭤보세요.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 여자가 예약할 사진관을 고르시오.",
      lines: [
        ["M", "Dayeon, which studio will the class book?"],
        ["W", "Five of them sent us a price list."],
        ["M", "I saw the sheet on the noticeboard."],
        ["W", "They can all come to the school."],
        ["M", "Do you need the photos retouched?"],
        ["W", "Everyone asked for it, so yes."],
        ["M", "Two of these five don't offer that."],
        ["W", "Then those are out from the start."],
        ["M", "How soon do you need the prints?"],
        ["W", "Within a week, or the yearbook is late."],
        ["M", "One of the rest takes two weeks."],
        ["W", "And it has to be under twelve thousand won a person."],
        ["M", "That takes out one more of them."],
        ["W", "Then there's only one studio left."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 5,
      clue: "Everyone asked for it, so yes.",
      explanation:
        "보정이 되고, 한 주 안에 나오며, 1인 1만 2천 원 미만인 곳은 ⑤이다. 따라서 답은 ⑤이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Retouch: No / Days: 5 / Price: 9,000 won" },
          { no: 2, label: "②", value: "Retouch: Yes / Days: 14 / Price: 10,000 won" },
          { no: 3, label: "③", value: "Retouch: No / Days: 7 / Price: 11,000 won" },
          { no: 4, label: "④", value: "Retouch: Yes / Days: 6 / Price: 15,000 won" },
          { no: 5, label: "⑤", value: "Retouch: Yes / Days: 5 / Price: 11,500 won" },
        ],
      },
      translation: [
        "M: 다연아, 우리 반은 어느 사진관에 맡길 거야?",
        "W: 다섯 군데서 가격표를 보냈어.",
        "M: 게시판에 붙은 표를 봤어.",
        "W: 다 학교로 와 줄 수 있대.",
        "M: 사진 보정이 필요해?",
        "W: 다들 해 달라고 해서 필요해.",
        "M: 이 다섯 중 두 곳은 보정을 안 해.",
        "W: 그럼 그건 처음부터 빠지고.",
        "M: 사진은 얼마나 빨리 나와야 해?",
        "W: 한 주 안에, 아니면 앨범이 늦어져.",
        "M: 나머지 중 하나는 두 주가 걸려.",
        "W: 그리고 한 사람에 1만 2천 원 미만이어야 해.",
        "M: 그럼 하나가 더 빠지네.",
        "W: 그럼 남는 사진관은 하나뿐이야.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Did you hear the evening rooms are fixed by class now?"],
        ["W", "No, I was going to ask to move again."],
        ["M", "The notice went up this morning."],
        ["W", "Then I should read it before I ask."],
        ["M", "Shall I show you where it's posted?"],
      ],
      choices: [
        "Yes, please do.",
        "I never study in the evening.",
        "The notice was taken down.",
        "I moved rooms last year.",
        "There are no rooms left.",
      ],
      answer: 1,
      clue: "Shall I show you where it's posted?",
      explanation:
        "붙은 자리를 알려 주겠다는 제안이므로, 그래 달라는 ①이 가장 자연스럽다.",
      translation: [
        "M: 야간 자습 교실이 이제 반별로 고정된다는 거 들었어?",
        "W: 아니, 또 옮겨 달라고 하려던 참이었는데.",
        "M: 오늘 아침에 알림이 붙었어.",
        "W: 그럼 신청하기 전에 읽어 봐야겠다.",
        "M: 어디 붙었는지 보여 줄까?",
        "W: 응, 그래 줘.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Excuse me, can I send my message for the yearbook by email?"],
        ["M", "Personal messages are collected on paper."],
        ["W", "I've already typed mine out, though."],
        ["M", "Then print it and hand it to your class teacher."],
        ["W", "And when is the last day for that?"],
      ],
      choices: [
        "Messages are not collected.",
        "The twentieth of November.",
        "Send it by email instead.",
        "The yearbook is finished.",
        "Ask me again in February.",
      ],
      answer: 2,
      clue: "And when is the last day for that?",
      explanation:
        "마지막 날이 언제인지 물었으므로, 11월 20일이라는 ②가 가장 자연스럽다.",
      translation: [
        "W: 실례합니다, 앨범에 실을 메시지를 전자우편으로 보내도 되나요?",
        "M: 개인 메시지는 종이로 모읍니다.",
        "W: 그런데 저는 이미 타자로 쳐 놨어요.",
        "M: 그럼 출력해서 담임 선생님께 내세요.",
        "W: 마지막 날이 언제인가요?",
        "M: 11월 20일입니다.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Seongmin, how did the class fundraising go?"],
        ["M", "We set out to raise five hundred thousand and got ninety."],
        ["W", "Did people not want to give?"],
        ["M", "Almost everyone gave something."],
        ["W", "Then the giving wasn't the problem."],
        ["M", "Nobody knew what the money was for."],
        ["W", "Didn't you put it on the poster?"],
        ["M", "It said 'for the class fund' in large letters."],
        ["W", "That tells people where it goes, not what it does."],
        ["M", "I thought naming a thing would sound like begging."],
        ["W", "What would the poster say next time?"],
      ],
      choices: [
        "The same words as before.",
        "Exactly what the money will buy.",
        "A larger target amount.",
        "Nothing at all.",
        "Only the class name.",
      ],
      answer: 2,
      clue: "What would the poster say next time?",
      explanation:
        "돈이 무엇에 쓰이는지 몰랐다는 이야기이므로, 무엇을 살 것인지 적자는 ②가 가장 자연스럽다.",
      translation: [
        "W: 성민아, 반 모금은 어떻게 됐어?",
        "M: 50만 원을 모으려고 했는데 9만 원 모였어.",
        "W: 사람들이 내기 싫어했어?",
        "M: 거의 다 조금씩은 냈어.",
        "W: 그럼 내는 게 문제가 아니었네.",
        "M: 그 돈이 어디 쓰이는지 아무도 몰랐어.",
        "W: 알림에 안 적었어?",
        "M: '반 기금으로'라고 큼직하게 적혀 있었어.",
        "W: 그건 어디로 가는지지 무엇을 하는지가 아니야.",
        "M: 물건을 대놓고 적으면 구걸 같아 보일까 봐.",
        "W: 다음에는 알림에 뭐라고 적을 거야?",
        "M: 그 돈으로 무엇을 살지 그대로 적을게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Eunji, you said the essays come back with the same comment."],
        ["W", "'Good points, but hard to follow.' Every time."],
        ["M", "How do you decide the order of your paragraphs?"],
        ["W", "I write them as they come to me."],
        ["M", "So the order is the order you thought of them."],
        ["W", "Which is nobody else's order."],
        ["M", "The reader has to rebuild the argument as they go."],
        ["W", "And they give up somewhere in the middle."],
        ["M", "The thinking is fine; the arranging never happened."],
        ["W", "So I need a step I've never had."],
        ["M", "What will you do before you write next time?"],
      ],
      choices: [
        "Write faster than before.",
        "Number the points in reading order.",
        "Add another paragraph.",
        "Use shorter sentences.",
        "Nothing; it reads well.",
      ],
      answer: 2,
      clue: "What will you do before you write next time?",
      explanation:
        "차례를 정하는 단계가 없었으므로, 읽을 차례대로 번호를 매기겠다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 은지야, 글마다 같은 말이 적혀 돌아온다고 했지.",
        "W: '내용은 좋은데 따라가기 어렵다.' 매번 그래.",
        "M: 문단 차례는 어떻게 정해?",
        "W: 떠오르는 대로 써.",
        "M: 그럼 차례가 네가 생각한 차례네.",
        "W: 다른 사람의 차례는 아니지.",
        "M: 읽는 사람이 읽으면서 논지를 다시 세워야 해.",
        "W: 그러다 중간에 포기하고.",
        "M: 생각은 멀쩡한데 늘어놓는 일을 안 한 거야.",
        "W: 없던 단계가 하나 필요하구나.",
        "M: 다음에는 쓰기 전에 뭘 할 거야?",
        "W: 할 말에 읽을 차례대로 번호를 매길게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Taeyang이 Sera에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Taeyang : ________________",
      lines: [
        [
          "M",
          "Taeyang and Sera are clearing the garden after the graduation photos. " +
            "Sera is stacking the folding chairs against the garden wall " +
            "so that the path can be swept before the caretaker arrives. " +
            "The chairs belong to the hall and are brought out only twice a year. " +
            "Taeyang knows that rain is forecast for tonight and tomorrow, " +
            "and that the metal frames rust within days once they are left wet. " +
            "The storeroom door is open ten steps away. " +
            "He wants her to carry them inside instead. " +
            "In this situation, what would Taeyang most likely say to Sera?",
        ],
      ],
      choices: [
        "Let's take more photos.",
        "Sweep the path first.",
        "Put the chairs in the storeroom.",
        "We need more chairs.",
        "Leave them on the grass.",
      ],
      answer: 3,
      clue: "He wants her to carry them inside instead.",
      explanation:
        "밤에 비가 와 쇠틀이 녹스므로, 창고에 넣으라는 ③이 가장 적절하다.",
      translation: [
        "M: 태양이와 세라는 졸업 사진을 찍고 나서 정원을 치우고 있습니다. 세라는 관리인이 오기 전에 길을 쓸려고 접이의자를 정원 담에 쌓고 있습니다. 그 의자는 강당 것이고 일 년에 두 번만 꺼냅니다. 태양이는 오늘 밤과 내일 비가 온다는 것과, 쇠틀이 젖은 채로 두면 며칠이면 녹슨다는 것을 압니다. 열 걸음 떨어진 창고 문은 열려 있습니다. 그는 의자를 안으로 옮기기를 바랍니다. 이런 상황에서 태양이가 세라에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 여자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "Hello, everyone. Today I want to talk about why a road " +
            "built to relieve traffic so often ends up carrying just as much. " +
            "The reasoning behind a new road is simple enough: " +
            "the old one is full, so add another and each will carry half. " +
            "What this leaves out is that the number of drivers is not fixed. " +
            "People who had given up driving because of the queues begin again, " +
            "and journeys nobody would have made at all become worth making. " +
            "Within a few years both roads are as full as the first one was. " +
            "Supply does not simply meet demand here; it creates it, " +
            "which is why some cities have removed roads and found the traffic fell.",
        ],
      ],
      choices: [
        "why new roads fill up with new traffic",
        "how cities plan their bus routes",
        "why drivers choose the shortest path",
        "how traffic lights reduce queues",
        "why old roads need repairing",
      ],
      answer: 1,
      clue: "Supply does not simply meet demand here; it creates it.",
      explanation:
        "길을 새로 내면 없던 통행이 생겨 다시 막힌다는 것이 중심 내용이다. 따라서 답은 ①이다.",
      translation: [
        "W: 여러분, 안녕하세요. 오늘은 막힘을 풀려고 낸 길이 어째서 그만큼의 차를 다시 싣게 되는지 이야기하려 합니다. 새 길을 내는 셈은 간단합니다. 옛 길이 가득 찼으니 하나 더 내면 저마다 절반씩 싣게 되리라는 것입니다. 여기서 빠진 것은 운전자의 수가 정해져 있지 않다는 사실입니다. 막히는 게 싫어 운전을 접었던 사람들이 다시 몰기 시작하고, 아예 하지 않았을 나들이가 할 만한 일이 됩니다. 몇 해가 지나면 두 길 모두 예전의 그 길만큼 찹니다. 여기서 공급은 수요를 맞추는 데 그치지 않고 수요를 만들어 냅니다. 그래서 어떤 도시는 길을 걷어 내고 오히려 차가 줄어드는 것을 보았습니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "다음을 듣고, 언급된 것이 아닌 것을 고르시오.",
      lines: [
        ["W", "A road built to relieve traffic often carries just as much."],
        ["W", "The old one is full, so add another and each will carry half."],
        ["W", "The number of drivers is not fixed."],
        ["W", "Supply does not simply meet demand here; it creates it."],
        ["W", "Some cities have removed roads and found the traffic fell."],
      ],
      choices: ["a road", "drivers", "demand", "cities", "a railway"],
      answer: 5,
      clue: "Some cities have removed roads and found the traffic fell.",
      explanation:
        "길, 운전자, 수요, 도시는 언급되지만 철도는 나오지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
