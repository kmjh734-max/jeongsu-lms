/** 고1 듣기 47회 — 사람이 직접 쓴 회차 (2026-09-29) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고1 47회",
  gradeLevel: "high1",
  speechSpeed: 0.8,
  folder: "고1 듣기",
  questions: [
    {
      order: 1,
      type: "목적 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 목적으로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "Good afternoon, students. This is the student council speaking. " +
            "Many of you have told us that the school yard bins overflow by lunchtime, " +
            "and that sorting waste is impossible when everything sits in one box. " +
            "Starting next Monday, four sorting stations will be placed outside: " +
            "one near the front gate, one by the gym, and two along the main path. " +
            "Each station has three separate openings clearly marked by shape. " +
            "You do not need to remember any rules; just match the shape to the item. " +
            "Council members will stand beside the stations during the first week " +
            "to answer questions and help anyone who is unsure. " +
            "If this works, the old single bins will be removed at the end of the month. " +
            "Thank you for helping us keep the yard clean.",
        ],
      ],
      choices: [
        "새 분리수거대 설치를 알리려고",
        "청소 당번을 정하려고",
        "학생회 선거를 안내하려고",
        "운동장 공사를 알리려고",
        "봉사 활동 참가를 권하려고",
      ],
      answer: 1,
      clue: "four sorting stations will be placed outside",
      explanation:
        "운동장에 분리수거대를 새로 놓는다는 것을 알리고 있다. 따라서 답은 ①이다.",
      translation: [
        "W: 학생 여러분, 안녕하세요. 학생회입니다. 여러분 가운데 많은 분이 점심때면 운동장 쓰레기통이 넘친다고, 모든 것이 한 통에 들어가니 분리배출이 불가능하다고 말씀해 주셨습니다. 다음 주 월요일부터 밖에 분리수거대 네 곳을 놓습니다. 정문 근처에 하나, 체육관 옆에 하나, 그리고 중앙 통로를 따라 둘입니다. 각 수거대에는 모양으로 또렷이 표시한 구멍이 세 개씩 있습니다. 규칙을 외울 필요 없이 물건과 모양을 맞추기만 하면 됩니다. 첫 주에는 학생회 임원이 수거대 옆에 서서 궁금한 점에 답하고 헷갈리는 분을 돕겠습니다. 잘되면 이번 달 말에 기존 통합 쓰레기통은 치웁니다. 운동장을 깨끗이 하는 데 힘을 보태 주셔서 고맙습니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 남자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Minjae, you keep the same notebook for every subject."],
        ["M", "One notebook, in the order the classes happen."],
        ["W", "Doesn't that make it hard to find anything later?"],
        ["M", "I write the date and subject at the top of each page."],
        ["W", "Still, five separate notebooks would be tidier."],
        ["M", "Tidier, and I'd carry the wrong one twice a week."],
        ["W", "That's true. I've done that before a test."],
        ["M", "And a missing notebook means missing notes."],
        ["W", "But your pages must be a mess of different subjects."],
        ["M", "They're in the order I actually lived the day."],
        ["W", "So you remember where things are by when they happened."],
        ["M", "A system you never fail to follow beats a neater one you don't."],
        ["W", "I might try it next term."],
      ],
      choices: [
        "지키기 쉬운 방식이 깔끔한 방식보다 낫다",
        "과목마다 공책을 따로 써야 한다",
        "필기에는 날짜를 적어야 한다",
        "시험 전에는 필기를 정리해야 한다",
        "수업 순서대로 공부해야 한다",
      ],
      answer: 1,
      clue: "A system you never fail to follow beats a neater one you don't.",
      explanation:
        "남자는 늘 지킬 수 있는 방식이 더 깔끔하지만 못 지키는 방식보다 낫다고 말한다. 따라서 답은 ①이다.",
      translation: [
        "W: 민재야, 너는 모든 과목을 공책 하나에 쓰더라.",
        "M: 공책 하나, 수업이 있는 순서 그대로.",
        "W: 나중에 뭘 찾기 힘들지 않아?",
        "M: 쪽마다 맨 위에 날짜랑 과목을 적어.",
        "W: 그래도 다섯 권으로 나누면 더 깔끔할 텐데.",
        "M: 깔끔하겠지. 그리고 일주일에 두 번은 다른 걸 들고 오겠지.",
        "W: 맞아. 나는 시험 전에 그런 적 있어.",
        "M: 공책이 없으면 필기도 없는 거야.",
        "W: 그런데 쪽마다 과목이 뒤섞여 엉망이겠다.",
        "M: 내가 실제로 하루를 보낸 순서대로 있는 거야.",
        "W: 언제 있었는지로 어디 있는지를 기억하는구나.",
        "M: 한 번도 어기지 않는 방식이, 더 깔끔한데 못 지키는 방식보다 나아.",
        "W: 다음 학기에 해 볼까 봐.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "When a plan fails, we usually look for the moment it broke. " +
            "We ask which decision was wrong, which day we fell behind. " +
            "But most plans do not break at a moment; they were built too tightly. " +
            "A schedule with no empty space assumes nothing will go wrong, " +
            "and something always goes wrong in a week of seven days. " +
            "A bus is late, a friend needs help, a headache arrives. " +
            "The plan that survives is the one that expected this, " +
            "with an hour left open on purpose and nothing written in it. " +
            "So when you build your next week, do not fill every line. " +
            "The empty line is not laziness; it is what holds the rest together.",
        ],
      ],
      choices: [
        "계획에는 비워 두는 시간이 있어야 한다",
        "실패한 원인을 찾아야 한다",
        "계획은 하루 단위로 세워야 한다",
        "목표를 작게 나눠야 한다",
        "일정을 남과 공유해야 한다",
      ],
      answer: 1,
      clue: "The empty line is not laziness; it is what holds the rest together.",
      explanation:
        "계획에 일부러 비워 둔 시간이 있어야 무너지지 않는다고 말한다. 따라서 답은 ①이다.",
      translation: [
        "M: 계획이 어그러지면 우리는 보통 그것이 깨진 순간을 찾습니다. 어느 판단이 틀렸는지, 어느 날 뒤처졌는지 묻습니다. 그러나 대부분의 계획은 어느 한 순간에 깨지지 않습니다. 애초에 너무 빡빡하게 세워진 것입니다. 빈칸이 없는 일정표는 아무 일도 생기지 않는다고 가정하는데, 이레가 흐르는 동안에는 늘 무슨 일이든 생깁니다. 버스가 늦고, 친구가 도움을 청하고, 두통이 찾아옵니다. 살아남는 계획은 이것을 미리 헤아린 계획입니다. 일부러 한 시간을 비워 두고 거기에 아무것도 적지 않은 계획 말입니다. 그러니 다음 주를 세울 때 모든 줄을 채우지 마십시오. 비어 있는 줄은 게으름이 아니라 나머지를 붙들어 주는 것입니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["W", "Taeho, is this the photo of the new music room?"],
        ["M", "Yes, they finished setting it up last Thursday."],
        ["W", "There's an upright piano against the left wall."],
        ["M", "It came from the old building."],
        ["W", "And a row of four chairs faces the piano."],
        ["M", "Five chairs, actually. One is hidden behind the stand."],
        ["W", "I see a music stand in the middle of the room."],
        ["M", "We move it around depending on who is playing."],
        ["W", "There's a guitar hanging on the back wall."],
        ["M", "That belongs to the club, not to anyone."],
        ["W", "And a round rug lies under the chairs."],
        ["M", "It keeps the sound from bouncing around."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 2,
      clue: "Five chairs, actually. One is hidden behind the stand.",
      explanation:
        "의자가 네 개라고 했지만 다섯 개라고 했다. 따라서 답은 ②이다.",
      figure: {
        kind: "figure5",
        scene:
          "A school music room, clean black line art on a plain white background, no writing or letters anywhere. " +
          "An UPRIGHT PIANO stands against the left wall. " +
          "A ROW OF FOUR CHAIRS faces the piano. " +
          "A MUSIC STAND stands in the middle of the room. " +
          "A GUITAR hangs on the back wall. " +
          "A ROUND RUG lies on the floor under the chairs.",
        spots: [
          [0.13, 0.45],
          [0.55, 0.62],
          [0.42, 0.42],
          [0.8, 0.2],
          [0.55, 0.85],
        ],
      },
      translation: [
        "W: 태호야, 이게 새 음악실 사진이야?",
        "M: 응, 지난 목요일에 정리를 끝냈어.",
        "W: 왼쪽 벽에 세로형 피아노가 있네.",
        "M: 옛 건물에서 가져온 거야.",
        "W: 그리고 의자 네 개가 피아노를 보고 놓여 있고.",
        "M: 사실 다섯 개야. 하나가 보면대 뒤에 가려졌어.",
        "W: 방 한가운데에 보면대가 보여.",
        "M: 누가 연주하느냐에 따라 옮겨.",
        "W: 뒷벽에는 기타가 걸려 있네.",
        "M: 그건 개인 게 아니라 동아리 거야.",
        "W: 그리고 의자 밑에 둥근 깔개가 있고.",
        "M: 소리가 튀지 않게 해 줘.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 남자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Junseo, the class photo is in twenty-five minutes."],
        ["M", "Everyone is lining up in the hallway already."],
        ["W", "Did anyone bring the class banner from the storeroom?"],
        ["M", "I thought Minji was bringing it."],
        ["W", "She went home early with a headache."],
        ["M", "Then nobody has it."],
        ["W", "The storeroom is locked until the caretaker opens it."],
        ["M", "He's in the office on the first floor right now."],
        ["W", "He leaves at three thirty on Wednesdays."],
        ["M", "It's three fifteen. There's still time."],
        ["W", "I'll keep the line in order up here."],
        ["M", "I'll go down and get the banner from the storeroom."],
      ],
      choices: [
        "줄을 정리하기",
        "사진을 찍기",
        "창고에서 현수막을 가져오기",
        "민지에게 전화하기",
        "관리 선생님을 부르기",
      ],
      answer: 3,
      clue: "I'll go down and get the banner from the storeroom.",
      explanation:
        "남자는 창고에서 현수막을 가져오겠다고 했다. 따라서 답은 ③이다.",
      translation: [
        "W: 준서야, 반 사진이 25분 뒤야.",
        "M: 다들 벌써 복도에 줄 서 있어.",
        "W: 창고에서 학급 현수막은 누가 가져왔어?",
        "M: 민지가 가져오는 줄 알았는데.",
        "W: 머리가 아파서 일찍 집에 갔어.",
        "M: 그럼 아무도 안 가져온 거네.",
        "W: 창고는 관리 선생님이 열어 주셔야 해.",
        "M: 지금 1층 사무실에 계셔.",
        "W: 수요일에는 세 시 반에 가셔.",
        "M: 세 시 15분이야. 아직 시간 있어.",
        "W: 나는 여기서 줄을 정리할게.",
        "M: 내가 내려가서 창고에서 현수막을 가져올게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 여자가 지불할 금액을 고르시오.",
      lines: [
        ["M", "Welcome to the bike shop. What can I do for you?"],
        ["W", "I'd like to rent two bicycles for four hours."],
        ["M", "A regular bike is four dollars an hour."],
        ["W", "Do you have any with a basket?"],
        ["M", "Those are five dollars an hour."],
        ["W", "One with a basket and one without, then."],
        ["M", "Helmets come free with every rental."],
        ["W", "That's good, we forgot ours."],
        ["M", "Students get ten percent off the total."],
        ["W", "We're both from the high school nearby."],
        ["M", "Then the discount applies to both bikes."],
        ["W", "Great, I'll pay by card."],
      ],
      choices: ["$28.80", "$32.40", "$34.20", "$36.00", "$40.00"],
      answer: 2,
      clue: "A regular bike is four dollars an hour.",
      explanation:
        "네 시간이면 일반 16달러와 바구니 달린 20달러로 36달러인데, 10퍼센트를 빼면 32.40달러이다. 따라서 답은 ②이다.",
      translation: [
        "M: 자전거 가게에 오신 걸 환영합니다. 뭘 도와드릴까요?",
        "W: 자전거 두 대를 네 시간 빌리고 싶어요.",
        "M: 일반 자전거는 한 시간에 4달러입니다.",
        "W: 바구니 달린 것도 있나요?",
        "M: 그건 한 시간에 5달러입니다.",
        "W: 그럼 바구니 있는 것 하나, 없는 것 하나요.",
        "M: 안전모는 빌리실 때마다 무료입니다.",
        "W: 잘됐네요, 저희 걸 안 가져왔어요.",
        "M: 학생은 전체 금액에서 10퍼센트 할인됩니다.",
        "W: 저희 둘 다 근처 고등학교 학생이에요.",
        "M: 그럼 두 대 모두 할인이 들어갑니다.",
        "W: 좋네요, 카드로 낼게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 여자가 전시회에 가지 못하는 이유를 고르시오.",
      lines: [
        ["M", "Dahye, are you coming to the photo exhibition on Saturday?"],
        ["W", "I really wanted to, but I can't make it this time."],
        ["M", "Is your part-time work on Saturday again?"],
        ["W", "I finished that job at the end of last month."],
        ["M", "Then is it the English class you mentioned?"],
        ["W", "That moved to Sunday, so it's not that."],
        ["M", "You're not sick, are you?"],
        ["W", "No, I'm fine. My cousin is getting married that day."],
        ["M", "Oh, that's a good reason."],
        ["W", "The ceremony is in Daejeon, so I'll be away all day."],
        ["M", "I'll take photos of the exhibition for you."],
        ["W", "Thank you. Send them to me on Sunday."],
      ],
      choices: [
        "아르바이트를 해야 해서",
        "영어 수업이 있어서",
        "몸이 아파서",
        "사촌의 결혼식에 가야 해서",
        "가족 여행을 가야 해서",
      ],
      answer: 4,
      clue: "My cousin is getting married that day.",
      explanation:
        "여자는 그날 사촌 결혼식이 있어 갈 수 없다. 따라서 답은 ④이다.",
      translation: [
        "M: 다혜야, 토요일 사진 전시회에 올 거야?",
        "W: 정말 가고 싶었는데 이번엔 못 가.",
        "M: 또 토요일에 아르바이트야?",
        "W: 그 일은 지난달 말에 그만뒀어.",
        "M: 그럼 말했던 영어 수업?",
        "W: 그건 일요일로 옮겼어. 그것도 아니야.",
        "M: 어디 아픈 건 아니지?",
        "W: 아니, 괜찮아. 그날 사촌이 결혼해.",
        "M: 아, 그럴 만하네.",
        "W: 식이 대전에서 있어서 하루 종일 자리에 없어.",
        "M: 전시회 사진 찍어서 보내 줄게.",
        "W: 고마워. 일요일에 보내 줘.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 학교 도서 교환 행사에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["M", "Seoyeon, have you heard about the book exchange day?"],
        ["M", "The library put up the notice this morning."],
        ["W", "I saw it. When is it happening?"],
        ["M", "On the last Wednesday of this month, all day."],
        ["W", "Where do we bring the books?"],
        ["M", "To the long tables in the library lobby."],
        ["W", "How many books can one student bring?"],
        ["M", "Up to five, and you take the same number home."],
        ["W", "Are there books they won't accept?"],
        ["M", "Textbooks and workbooks are not taken."],
        ["W", "That's reasonable, nobody wants those."],
        ["M", "Leftover books go to the village children's center."],
        ["W", "Then I'll bring the novels I read last year."],
      ],
      choices: ["행사 날짜", "책을 가져갈 곳", "가져올 수 있는 권수", "받지 않는 책", "행사를 여는 이유"],
      answer: 5,
      clue: "On the last Wednesday of this month, all day.",
      explanation:
        "날짜, 장소, 권수, 제외 도서는 말했지만 여는 이유는 말하지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 서연아, 책 바꾸는 날 들어 봤어?",
        "M: 오늘 아침에 도서관에서 알림을 붙였어.",
        "W: 봤어. 언제 해?",
        "M: 이번 달 마지막 수요일, 하루 종일.",
        "W: 책은 어디로 가져가?",
        "M: 도서관 앞 긴 탁자로.",
        "W: 한 사람이 몇 권까지 가져올 수 있어?",
        "M: 다섯 권까지. 가져온 만큼 가져가.",
        "W: 안 받는 책도 있어?",
        "M: 교과서랑 문제집은 안 받아.",
        "W: 그럴 만하네, 아무도 안 가져가지.",
        "M: 남은 책은 마을 아동 센터로 가.",
        "W: 그럼 작년에 읽은 소설을 가져와야겠다.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "다음을 듣고, 학교 텃밭 수확 행사에 관한 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "W",
          "Hello, students. Here is the plan for the garden harvest day. " +
            "It takes place on the third Saturday of this month, in the morning. " +
            "We gather at the garden behind the gymnasium at nine o'clock. " +
            "Thirty students may take part, and any grade may apply. " +
            "Gloves, baskets and small tools are prepared by the club. " +
            "Wear old clothes and shoes that can get muddy. " +
            "We finish by noon, and lunch is not provided. " +
            "All the vegetables we pick go to the school kitchen. " +
            "Write your name on the sheet outside the science room by Thursday.",
        ],
      ],
      choices: [
        "이번 달 셋째 주 토요일 오전에 한다",
        "체육관 뒤 텃밭에서 아홉 시에 모인다",
        "학년에 관계없이 신청할 수 있다",
        "장갑과 바구니는 동아리가 준비한다",
        "장화를 각자 가져와야 한다",
      ],
      answer: 5,
      clue: "Gloves, baskets and small tools are prepared by the club.",
      explanation:
        "장갑·바구니·도구는 동아리가 준비한다고 했을 뿐 장화 이야기는 없다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 학생 여러분, 안녕하세요. 텃밭 수확하는 날 계획을 알려 드립니다. 이번 달 셋째 주 토요일 오전에 진행됩니다. 아홉 시에 체육관 뒤 텃밭에서 모입니다. 서른 명이 참여할 수 있고 학년에 관계없이 신청할 수 있습니다. 장갑, 바구니, 작은 연장은 동아리에서 준비합니다. 진흙이 묻어도 되는 헌 옷과 신발을 신고 오세요. 정오에 마치며 점심은 제공되지 않습니다. 거둔 채소는 모두 학교 급식실로 갑니다. 목요일까지 과학실 밖 종이에 이름을 적어 주세요.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 예약할 체험 활동을 고르시오.",
      lines: [
        ["W", "Hyunwoo, which hands-on program should our class book?"],
        ["M", "Five places sent us their information."],
        ["W", "We have three hours on that Friday afternoon."],
        ["M", "So anything longer than three hours is out."],
        ["W", "The cost has to stay under twenty thousand won each."],
        ["M", "The school covers only that much."],
        ["W", "One of them is well above that."],
        ["M", "And it has to take thirty students at once."],
        ["W", "Two of these only take twenty."],
        ["M", "Then one program fits all three conditions."],
        ["W", "I'll call them tomorrow morning."],
        ["M", "Tell them we'll arrive at one o'clock."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 5,
      clue: "We have three hours on that Friday afternoon.",
      explanation:
        "3시간 이내, 2만 원 미만, 30명 수용인 활동은 ⑤이다. 따라서 답은 ⑤이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Hours: 4 / Cost: 15,000 won / Capacity: 30" },
          { no: 2, label: "②", value: "Hours: 2 / Cost: 25,000 won / Capacity: 30" },
          { no: 3, label: "③", value: "Hours: 3 / Cost: 18,000 won / Capacity: 20" },
          { no: 4, label: "④", value: "Hours: 2 / Cost: 17,000 won / Capacity: 20" },
          { no: 5, label: "⑤", value: "Hours: 3 / Cost: 19,000 won / Capacity: 30" },
        ],
      },
      translation: [
        "W: 현우야, 우리 반은 어떤 체험 활동을 예약할까?",
        "M: 다섯 곳에서 안내를 보내왔어.",
        "W: 그 금요일 오후에 세 시간이 있어.",
        "M: 그럼 세 시간 넘는 건 빠지네.",
        "W: 비용은 한 사람에 2만 원 미만이어야 해.",
        "M: 학교에서 그만큼만 대 줘.",
        "W: 하나는 그보다 훨씬 비싸.",
        "M: 그리고 서른 명을 한 번에 받아야 해.",
        "W: 이 중 두 곳은 스무 명까지만 돼.",
        "M: 그럼 세 조건에 다 맞는 건 하나야.",
        "W: 내일 아침에 전화할게.",
        "M: 한 시에 도착한다고 말해 줘.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Did you finish the reading for the history discussion?"],
        ["W", "I read up to the third chapter."],
        ["M", "The last chapter is where the argument changes."],
        ["W", "I'll read it after dinner tonight."],
        ["M", "Shall we go over it together tomorrow morning?"],
      ],
      choices: [
        "The discussion was yesterday.",
        "I don't take history.",
        "There is no reading.",
        "Sure, before first period.",
        "I finished the whole book.",
      ],
      answer: 4,
      clue: "Shall we go over it together tomorrow morning?",
      explanation:
        "내일 아침에 같이 보자는 제안이므로, 1교시 전에 하자는 ④가 가장 자연스럽다.",
      translation: [
        "M: 역사 토론에 쓸 자료 다 읽었어?",
        "W: 3장까지 읽었어.",
        "M: 마지막 장에서 논지가 바뀌어.",
        "W: 오늘 저녁 먹고 읽을게.",
        "M: 내일 아침에 같이 훑어볼까?",
        "W: 좋아, 1교시 전에.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Excuse me, is the art room open during lunch?"],
        ["M", "Only on Tuesdays and Thursdays."],
        ["W", "Do I need permission to use the supplies?"],
        ["M", "You sign your name in the book by the door."],
        ["W", "Can I take the paints back to my classroom?"],
      ],
      choices: [
        "The art room closed last year.",
        "No, they stay in the room.",
        "I don't work here.",
        "You can't sign the book.",
        "There are no supplies.",
      ],
      answer: 2,
      clue: "Can I take the paints back to my classroom?",
      explanation:
        "물감을 교실로 가져가도 되는지 물었으므로, 방 안에 둬야 한다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 실례합니다, 미술실이 점심시간에 여나요?",
        "M: 화요일이랑 목요일만요.",
        "W: 재료를 쓰려면 허락을 받아야 하나요?",
        "M: 문 옆 장부에 이름을 적으시면 됩니다.",
        "W: 물감을 교실로 가져가도 되나요?",
        "M: 아니요, 재료는 방 안에 두셔야 합니다.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Kiwon, how is the school band doing this term?"],
        ["M", "We practice twice a week but we never finish a song."],
        ["W", "What happens during those practices?"],
        ["M", "We spend the first hour deciding what to play."],
        ["W", "Every single time?"],
        ["M", "Someone always suggests something new."],
        ["W", "So you rehearse for maybe thirty minutes."],
        ["M", "If we're lucky. Then the room is needed by someone else."],
        ["W", "The deciding is eating the practising."],
        ["M", "I hadn't put it that way, but yes."],
        ["W", "When could the songs be decided instead?"],
      ],
      choices: [
        "We'll decide during practice.",
        "In the group chat beforehand.",
        "We don't need songs.",
        "I'll leave the band.",
        "Practice is already enough.",
      ],
      answer: 2,
      clue: "When could the songs be decided instead?",
      explanation:
        "곡을 언제 정하면 좋을지 물었으므로, 미리 대화방에서 정하자는 ②가 가장 자연스럽다.",
      translation: [
        "W: 기원아, 이번 학기 밴드는 어때?",
        "M: 일주일에 두 번 연습하는데 한 곡도 못 끝내.",
        "W: 연습 시간에 무슨 일이 있어?",
        "M: 첫 한 시간은 무슨 곡을 할지 정하는 데 써.",
        "W: 매번?",
        "M: 늘 누군가 새로운 걸 제안해.",
        "W: 그럼 연습은 30분쯤 하겠네.",
        "M: 운이 좋으면. 그러고 나면 다른 팀이 방을 써야 해.",
        "W: 정하는 일이 연습을 잡아먹고 있네.",
        "M: 그렇게 말해 본 적은 없는데, 맞아.",
        "W: 곡은 대신 언제 정하면 될까?",
        "M: 미리 단체 대화방에서.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Nari, you said you wanted to read more English books."],
        ["W", "I borrowed three from the library in September."],
        ["M", "How far did you get with them?"],
        ["W", "About thirty pages in the first one."],
        ["M", "What stopped you there?"],
        ["W", "I looked up every word I didn't know."],
        ["M", "How many words was that on one page?"],
        ["W", "Sometimes fifteen or sixteen."],
        ["M", "Then you spent an hour on a page and gave up."],
        ["W", "That's exactly what happened."],
        ["M", "How many words per page could you leave unlooked?"],
      ],
      choices: [
        "I'd look up all of them.",
        "Maybe ten, if the story still makes sense.",
        "I'll stop reading English.",
        "There are no unknown words.",
        "I'll return the books today.",
      ],
      answer: 2,
      clue: "How many words per page could you leave unlooked?",
      explanation:
        "한 쪽에 몇 개를 안 찾고 넘어갈 수 있는지 물었으므로, 열 개쯤이라는 ②가 가장 자연스럽다.",
      translation: [
        "M: 나리야, 영어책을 더 읽고 싶다고 했잖아.",
        "W: 9월에 도서관에서 세 권 빌렸어.",
        "M: 어디까지 읽었어?",
        "W: 첫 권 서른 쪽쯤.",
        "M: 거기서 왜 멈췄어?",
        "W: 모르는 낱말을 다 찾아봤어.",
        "M: 한 쪽에 몇 개나 됐어?",
        "W: 어떤 때는 열대여섯 개.",
        "M: 그럼 한 쪽에 한 시간을 쓰다가 포기했겠네.",
        "W: 딱 그렇게 됐어.",
        "M: 한 쪽에 몇 개쯤은 안 찾고 넘어갈 수 있겠어?",
        "W: 이야기가 통하기만 하면 열 개쯤.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Areum이 Junhyung에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Areum : ________________",
      lines: [
        [
          "W",
          "Areum and Junhyung are editing the video for the graduation ceremony. " +
            "Junhyung has collected interviews from every class in the school, " +
            "and each one runs between two and three minutes. " +
            "Altogether the video is now more than forty minutes long. " +
            "The ceremony schedule gives them exactly ten minutes on the screen. " +
            "Areum knows the teacher will simply stop the video at ten minutes, " +
            "so the last thirty minutes would never be seen by anyone. " +
            "She wants to tell him to keep only a short piece from each interview. " +
            "In this situation, what would Areum most likely say to Junhyung?",
        ],
      ],
      choices: [
        "Let's film a few more interviews.",
        "The ceremony was cancelled.",
        "Keep only a short part of each one.",
        "We should make it an hour long.",
        "Nobody will watch the video.",
      ],
      answer: 3,
      clue: "She wants to tell him to keep only a short piece from each interview.",
      explanation:
        "영상이 제한 시간을 훨씬 넘으므로, 면담마다 짧게만 남기자는 ③이 가장 적절하다.",
      translation: [
        "W: 아름이와 준형이는 졸업식에서 틀 영상을 편집하고 있습니다. 준형이는 학교의 모든 반에서 면담을 모았는데, 하나하나가 2분에서 3분씩입니다. 다 합치니 영상이 40분이 넘습니다. 졸업식 순서표는 화면에 쓸 시간을 정확히 10분만 줍니다. 아름이는 선생님이 10분이 되면 영상을 그냥 멈추시리라는 것을 압니다. 그러면 뒤의 30분은 아무도 보지 못합니다. 그녀는 면담마다 짧은 부분만 남기자고 말하고 싶습니다. 이런 상황에서 아름이가 준형이에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 여자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "Hello, everyone. Today I want to talk about how animals find their way " +
            "across distances that would leave any of us hopelessly lost. " +
            "The Arctic tern flies from pole to pole twice a year, " +
            "using the position of the sun and the shape of the coastline below. " +
            "The monarch butterfly, which has never made the journey before, " +
            "reaches the same few forests in Mexico its great-grandparents used. " +
            "Salmon return to the stream where they hatched " +
            "by recognizing the particular smell of that water. " +
            "The desert ant keeps count of its own steps on the way out " +
            "and walks the exact distance back in a straight line. " +
            "Each animal solves the same problem with a different instrument, " +
            "and none of them was ever taught how.",
        ],
      ],
      choices: [
        "how animals find their way over long distances",
        "why some birds fly in large groups",
        "how insects survive cold winters",
        "why rivers change their course over time",
        "how deserts affect animal behavior",
      ],
      answer: 1,
      clue: "Each animal solves the same problem with a different instrument",
      explanation:
        "여러 동물이 먼 거리를 어떻게 찾아가는지가 중심 내용이다. 따라서 답은 ①이다.",
      translation: [
        "W: 여러분, 안녕하세요. 오늘은 동물들이 우리라면 어김없이 길을 잃을 거리를 어떻게 찾아가는지 이야기하려 합니다. 북극제비갈매기는 한 해에 두 번 극에서 극까지 날아가는데, 해의 위치와 아래 해안선의 모양을 씁니다. 한 번도 그 길을 가 본 적 없는 제왕나비는 증조부모가 쓰던 멕시코의 바로 그 몇몇 숲에 닿습니다. 연어는 자기가 태어난 개울의 독특한 냄새를 알아보고 돌아옵니다. 사막개미는 나가는 길에 제 걸음 수를 세어 두었다가 그 거리만큼 곧장 되돌아옵니다. 저마다 같은 문제를 서로 다른 도구로 풀고 있고, 어느 하나도 배운 적이 없습니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "다음을 듣고, 언급된 동물이 아닌 것을 고르시오.",
      lines: [
        ["W", "The Arctic tern flies from pole to pole twice a year."],
        ["W", "The monarch butterfly reaches the same few forests in Mexico."],
        ["W", "Salmon return to the stream where they hatched."],
        ["W", "The desert ant keeps count of its own steps on the way out."],
        ["W", "None of them was ever taught how."],
      ],
      choices: ["Arctic terns", "monarch butterflies", "salmon", "desert ants", "sea turtles"],
      answer: 5,
      clue: "The desert ant keeps count of its own steps on the way out.",
      explanation:
        "북극제비갈매기, 제왕나비, 연어, 사막개미는 언급되지만 바다거북은 나오지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
