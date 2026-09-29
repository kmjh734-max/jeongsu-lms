/** 고2 듣기 51회 — 사람이 직접 쓴 회차 (2026-09-29) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고2 51회",
  gradeLevel: "high2",
  speechSpeed: 0.8,
  folder: "고2 듣기",
  questions: [
    {
      order: 1,
      type: "목적 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 목적으로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Good afternoon, everyone. This is the science department. " +
            "The laboratory has been open after school since last spring, " +
            "and until June about six students used it each week. " +
            "Since September that number has been closer to thirty. " +
            "We are glad, but thirty students and one teacher is not safe. " +
            "So from Monday the afternoon laboratory works by booking. " +
            "Twelve places a day, signed for on the sheet outside room 204. " +
            "If you have booked, the room is yours and the equipment is out. " +
            "If you have not, please come back the following day. " +
            "This is not to keep you out; it is to keep the room usable.",
        ],
      ],
      choices: [
        "실험실 이용을 예약제로 바꾼다고 알리려고",
        "실험실 이전을 알리려고",
        "과학 동아리 회원을 모집하려고",
        "실험 기구 파손을 주의시키려고",
        "과학 대회 참가를 권하려고",
      ],
      answer: 1,
      clue: "So from Monday the afternoon laboratory works by booking.",
      explanation:
        "월요일부터 방과 후 실험실을 예약제로 운영한다고 알리고 있다. 따라서 답은 ①이다.",
      translation: [
        "M: 여러분, 안녕하세요. 과학부입니다. 지난봄부터 방과 후에 실험실을 열어 왔고, 6월까지는 한 주에 여섯 명쯤이 썼습니다. 9월부터는 그 수가 서른 명에 가까워졌습니다. 반가운 일이지만, 학생 서른 명에 교사 한 명은 안전하지 않습니다. 그래서 월요일부터 방과 후 실험실은 예약제로 운영합니다. 하루 열두 자리이고, 204호 밖에 붙은 표에 이름을 적으면 됩니다. 예약한 학생에게는 방을 내어 드리고 기구도 꺼내 두겠습니다. 예약하지 않았다면 다음 날 다시 와 주세요. 여러분을 막으려는 것이 아니라, 그 방을 쓸 수 있게 두려는 것입니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 여자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Yujin, you rewrote the whole opening again?"],
        ["W", "The third version, and it's still not right."],
        ["M", "Maybe you should just leave it and move on."],
        ["W", "I can't write the middle until the opening holds."],
        ["M", "That sounds like a way of never finishing."],
        ["W", "It would be, if I rewrote everything that way."],
        ["M", "So the opening is different?"],
        ["W", "Every sentence after it leans on it."],
        ["M", "And a weak opening makes the rest wobble."],
        ["W", "I'd be fixing the same fault fifty times later."],
        ["M", "So you'd rather fix it once, at the start."],
        ["W", "The first paragraph is worth three of the others."],
        ["M", "Then I'll go back and look at mine."],
      ],
      choices: [
        "글은 일단 끝까지 쓰고 고쳐야 한다",
        "글은 짧게 쓰는 것이 좋다",
        "글은 첫머리를 제대로 잡아 놓아야 한다",
        "글은 여러 사람에게 보여야 한다",
        "글은 하루에 한 편씩 써야 한다",
      ],
      answer: 3,
      clue: "The first paragraph is worth three of the others.",
      explanation:
        "여자는 첫 문단을 제대로 잡아야 나머지가 흔들리지 않는다고 말한다. 따라서 답은 ③이다.",
      translation: [
        "M: 유진아, 첫머리를 또 통째로 다시 썼어?",
        "W: 세 번째 판인데 아직도 마음에 안 들어.",
        "M: 그냥 두고 넘어가는 게 낫지 않아?",
        "W: 첫머리가 서야 가운데를 쓸 수 있어.",
        "M: 그러면 영영 못 끝낼 것 같은데.",
        "W: 전부를 그렇게 고쳐 쓴다면 그렇겠지.",
        "M: 그럼 첫머리는 다르다는 거야?",
        "W: 그 뒤의 모든 문장이 거기에 기대.",
        "M: 첫머리가 약하면 나머지가 흔들리고.",
        "W: 나중에 같은 흠을 쉰 번 고치게 돼.",
        "M: 그러니까 처음에 한 번 고치겠다는 거구나.",
        "W: 첫 문단은 나머지 세 개 값어치는 해.",
        "M: 그럼 내 것도 돌아가서 봐야겠다.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "When something goes wrong in a group, we look for who did it. " +
            "The question feels urgent and it feels fair. " +
            "But a group that asks it first learns almost nothing. " +
            "The person named becomes careful rather than honest, " +
            "and everyone else quietly decides to report less next time. " +
            "The useful question is not who, but at which point it became likely. " +
            "Ask that, and the answer is usually a step in the process, " +
            "something anyone in the same position would have got wrong. " +
            "Fix the step and the same mistake stops arriving.",
        ],
      ],
      choices: [
        "잘못을 사람이 아니라 과정에서 찾아야 한다",
        "책임자를 분명히 정해야 한다",
        "실수는 빨리 알려야 한다",
        "규칙을 더 자세히 만들어야 한다",
        "모임에서는 솔직히 말해야 한다",
      ],
      answer: 1,
      clue: "The useful question is not who, but at which point it became likely.",
      explanation:
        "누구인지가 아니라 어느 대목에서 그럴 수밖에 없었는지를 물어야 한다고 말한다. 따라서 답은 ①이다.",
      translation: [
        "M: 모임에서 무언가 잘못되면 우리는 누가 그랬는지부터 찾습니다. 그 물음은 급해 보이고 공정해 보입니다. 그러나 그것부터 묻는 모임은 거의 아무것도 배우지 못합니다. 지목당한 사람은 솔직해지는 대신 조심스러워지고, 나머지는 다음번에 덜 알리기로 조용히 마음먹습니다. 쓸모 있는 물음은 누구냐가 아니라 어느 대목에서 그 일이 일어나기 쉬워졌느냐입니다. 그렇게 물으면 답은 대개 과정의 어느 단계, 같은 자리에 선 사람이면 누구나 틀렸을 대목입니다. 그 단계를 고치면 같은 잘못은 더 이상 찾아오지 않습니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["W", "Jiho, is this the photo of your street market stall?"],
        ["M", "We set it up every Saturday morning."],
        ["W", "There's a striped roof over the whole stall."],
        ["M", "It keeps the rain off the boxes."],
        ["W", "And a long table stands at the front."],
        ["M", "That's where we lay out the vegetables."],
        ["W", "Three baskets are stacked under the table."],
        ["M", "Two, actually. The third one broke last week."],
        ["W", "There's a scale on the right end of the table."],
        ["M", "Everything is sold by weight."],
        ["W", "And a chalkboard hangs on the left post."],
        ["M", "I write the prices on it each morning."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "Two, actually. The third one broke last week.",
      explanation:
        "바구니가 세 개라고 했지만 두 개라고 했다. 따라서 답은 ③이다.",
      figure: {
        kind: "figure5",
        scene:
          "A small street market stall, clean black line art on a plain white background, no writing or letters anywhere. " +
          "A STRIPED ROOF covers the whole stall. " +
          "A LONG TABLE stands at the front of the stall with vegetables laid out on it. " +
          "THREE BASKETS are stacked under the table. " +
          "A SCALE sits on the right end of the table. " +
          "A CHALKBOARD hangs on the left post of the stall.",
        spots: [
          [0.5, 0.12],
          [0.5, 0.55],
          [0.42, 0.8],
          [0.78, 0.48],
          [0.12, 0.45],
        ],
      },
      translation: [
        "W: 지호야, 이게 너희 장터 좌판 사진이야?",
        "M: 토요일 아침마다 차려.",
        "W: 좌판 전체에 줄무늬 지붕이 있네.",
        "M: 상자에 비가 안 맞게 해 줘.",
        "W: 그리고 앞쪽에 긴 탁자가 있고.",
        "M: 거기에 채소를 늘어놔.",
        "W: 탁자 밑에 바구니가 세 개 쌓여 있어.",
        "M: 사실 두 개야. 세 번째는 지난주에 망가졌어.",
        "W: 탁자 오른쪽 끝에는 저울이 있네.",
        "M: 다 무게로 팔아.",
        "W: 그리고 왼쪽 기둥에 칠판이 걸려 있고.",
        "M: 아침마다 거기에 값을 적어.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 여자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Seoyeon, the science fair opens at nine o'clock tomorrow morning."],
        ["W", "Our board is up and all the samples are laid out."],
        ["M", "The room looks a great deal better than it did last year."],
        ["W", "We spent the whole of Tuesday afternoon on it."],
        ["M", "Did anyone print the handout for the visitors?"],
        ["W", "Minsu said he would do it during lunch."],
        ["M", "He went home at noon with a fever."],
        ["W", "Then nobody has printed anything at all."],
        ["M", "How many copies do we need for tomorrow?"],
        ["W", "Two hundred, the same number as last year."],
        ["M", "The file should still be on the club computer."],
        ["W", "It is, in the folder we made in October."],
        ["M", "And the print room closes at six on weekdays."],
        ["W", "It's half past five right now."],
        ["M", "Then you would have to go straight there."],
        ["W", "There isn't time to do anything else first."],
        ["M", "I'll finish setting out the chairs while you're gone."],
        ["W", "I'll go and print the handout."],
      ],
      choices: [
        "의자를 놓기",
        "안내문을 출력하기",
        "표본을 늘어놓기",
        "민수에게 전화하기",
        "게시판을 세우기",
      ],
      answer: 2,
      clue: "I'll go and print the handout.",
      explanation:
        "여자는 인쇄실에 가서 안내문을 출력하겠다고 했다. 따라서 답은 ②이다.",
      translation: [
        "M: 서연아, 과학전은 내일 아침 아홉 시에 열어.",
        "W: 게시판은 세웠고 표본도 전부 늘어놨어.",
        "M: 방이 작년보다 훨씬 나아 보인다.",
        "W: 화요일 오후를 통째로 썼어.",
        "M: 관람객용 안내문은 누가 출력했어?",
        "W: 민수가 점심때 하겠다고 했어.",
        "M: 열두 시에 열이 나서 집에 갔어.",
        "W: 그럼 아무도 출력 안 했네.",
        "M: 내일 몇 부나 필요해?",
        "W: 이백 부, 작년이랑 같아.",
        "M: 파일은 동아리 컴퓨터에 그대로 있을 거야.",
        "W: 있어, 10월에 만든 폴더에.",
        "M: 그리고 인쇄실은 평일에 여섯 시에 닫아.",
        "W: 지금 다섯 시 반이야.",
        "M: 그럼 바로 가야겠네.",
        "W: 다른 걸 먼저 할 틈이 없어.",
        "M: 네가 간 동안 내가 의자 놓는 걸 마무리할게.",
        "W: 내가 가서 안내문을 출력할게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 남자가 지불할 금액을 고르시오.",
      lines: [
        ["W", "Welcome to the garden centre. Can I help you?"],
        ["M", "I'd like three small pots and two bags of soil."],
        ["W", "The small pots are four dollars each."],
        ["M", "Are the larger ones more expensive?"],
        ["W", "Twice the price, but they're the same today."],
        ["M", "No, the small ones are fine."],
        ["W", "And soil is nine dollars a bag."],
        ["M", "Do I need anything else for planting?"],
        ["W", "Not for these. Are you a member here?"],
        ["M", "I joined in the spring. Here's my card."],
        ["W", "Members get ten percent off the whole purchase."],
        ["M", "Good. I'll pay by card."],
      ],
      choices: ["$24.00", "$25.00", "$26.00", "$27.00", "$30.00"],
      answer: 4,
      clue: "The small pots are four dollars each.",
      explanation:
        "화분 3개 12달러와 흙 2포대 18달러로 30달러인데, 10퍼센트를 빼면 27달러이다. 따라서 답은 ④이다.",
      translation: [
        "W: 원예점에 오신 걸 환영합니다. 도와드릴까요?",
        "M: 작은 화분 세 개와 흙 두 포대를 사려고요.",
        "W: 작은 화분은 하나에 4달러입니다.",
        "M: 큰 것은 더 비싼가요?",
        "W: 값이 두 배인데 오늘은 같아요.",
        "M: 아니요, 작은 걸로 할게요.",
        "W: 그리고 흙은 한 포대에 9달러입니다.",
        "M: 심는 데 더 필요한 게 있나요?",
        "W: 이것들은 없어요. 회원이신가요?",
        "M: 봄에 가입했어요. 여기 카드요.",
        "W: 회원은 전체에서 10퍼센트 할인됩니다.",
        "M: 좋네요. 카드로 낼게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 여자가 동아리 모임 장소를 바꾼 이유를 고르시오.",
      lines: [
        ["M", "Haneul, why is the club meeting in the art room now?"],
        ["M", "We've used room 103 since March."],
        ["W", "We have, and I liked it there."],
        ["M", "Did the number of members grow?"],
        ["W", "It's the same twelve as last term."],
        ["M", "Was the room taken by another club?"],
        ["W", "No, 103 is still free on Wednesdays."],
        ["M", "Then why did you move?"],
        ["W", "We need to spread the posters out on the floor."],
        ["M", "And 103 has fixed desks."],
        ["W", "Bolted down, every one of them."],
        ["M", "Then the art room is the only choice."],
      ],
      choices: [
        "회원이 늘어서",
        "다른 동아리가 써서",
        "바닥에 작업을 펼쳐야 해서",
        "방이 추워서",
        "선생님이 바꾸라고 하셔서",
      ],
      answer: 3,
      clue: "We need to spread the posters out on the floor.",
      explanation:
        "103호는 책상이 고정되어 있어 바닥에 펼칠 수 없어 옮겼다. 따라서 답은 ③이다.",
      translation: [
        "M: 하늘아, 동아리 모임을 왜 미술실에서 해?",
        "M: 3월부터 103호를 썼잖아.",
        "W: 맞아, 거기가 좋았어.",
        "M: 회원이 늘었어?",
        "W: 지난 학기랑 똑같이 열두 명이야.",
        "M: 다른 동아리가 그 방을 가져갔어?",
        "W: 아니, 103호는 수요일에 아직 비어.",
        "M: 그럼 왜 옮겼어?",
        "W: 포스터를 바닥에 펼쳐 놔야 하거든.",
        "M: 103호는 책상이 고정돼 있고.",
        "W: 하나하나 다 볼트로 박혀 있어.",
        "M: 그럼 미술실밖에 없네.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 겨울 봉사 활동에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["W", "Junseo, are you joining the winter volunteer work this year?"],
        ["W", "The notice went up in the corridor yesterday afternoon."],
        ["M", "I signed my name on it before I went home."],
        ["W", "Where do the volunteers work this time?"],
        ["M", "At the community centre, the one behind the market."],
        ["W", "That's much closer than the place we went to last year."],
        ["M", "Ten minutes on foot from the school gate."],
        ["W", "And how long does it run?"],
        ["M", "Three days, from the twenty-second of December."],
        ["W", "What do the volunteers actually do there?"],
        ["M", "We sort donated clothes and pack them into boxes."],
        ["W", "That sounds like work for a lot of hands."],
        ["M", "It is, and the boxes go out in January."],
        ["W", "How many students can join altogether?"],
        ["M", "Twenty-four, eight from each year group."],
        ["W", "Is there anything we need to bring with us?"],
        ["M", "Just gloves and something warm to wear."],
        ["W", "Then I'll sign up this afternoon."],
        ["M", "The sheet is with the class teacher."],
      ],
      choices: ["활동 장소", "활동 기간", "하는 일", "참가 인원", "모이는 시각"],
      answer: 5,
      clue: "Three days, from the twenty-second of December.",
      explanation:
        "장소, 기간, 하는 일, 인원은 말했지만 모이는 시각은 말하지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 준서야, 올해 겨울 봉사 활동 할 거야?",
        "W: 어제 오후에 복도에 알림이 붙었더라.",
        "M: 집에 가기 전에 이름 적었어.",
        "W: 이번에는 어디서 해?",
        "M: 주민 센터에서, 시장 뒤에 있는 데.",
        "W: 작년에 간 데보다 훨씬 가깝네.",
        "M: 학교 정문에서 걸어서 10분.",
        "W: 얼마 동안 해?",
        "M: 12월 22일부터 사흘 동안.",
        "W: 거기서 뭘 해?",
        "M: 기부받은 옷을 골라서 상자에 담아.",
        "W: 손이 많이 가는 일이겠다.",
        "M: 맞아, 그 상자는 1월에 나가.",
        "W: 다 해서 몇 명이나 갈 수 있어?",
        "M: 스물네 명, 학년마다 여덟 명씩.",
        "W: 가져가야 할 게 있어?",
        "M: 장갑이랑 따뜻하게 입을 옷만.",
        "W: 그럼 오늘 오후에 신청할게.",
        "M: 신청서는 담임 선생님이 갖고 계셔.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "다음을 듣고, 교내 사진 대회에 관한 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "W",
          "Hello, students. Here is news of the school photography contest. " +
            "This year the subject is a place in our neighbourhood. " +
            "Each student may send in two photographs, not three as before. " +
            "Photographs must have been taken within the last six months. " +
            "Send the files to the art department email by the tenth of December. " +
            "Do not bring printed photographs; the department prints them for you. " +
            "Winning works are shown in the corridor of the first floor. " +
            "The exhibition stays up until the end of the school year. " +
            "Ask the art teacher if anything is unclear.",
        ],
      ],
      choices: [
        "주제는 우리 동네의 한 장소이다",
        "한 사람이 두 장까지 낼 수 있다",
        "최근 여섯 달 안에 찍은 것이어야 한다",
        "인화한 사진을 직접 가져가야 한다",
        "뽑힌 작품은 1층 복도에 전시된다",
      ],
      answer: 4,
      clue: "Do not bring printed photographs; the department prints them for you.",
      explanation:
        "인화한 사진은 가져오지 말라고 했으므로 ④가 일치하지 않는다.",
      translation: [
        "W: 학생 여러분, 안녕하세요. 교내 사진 대회를 알려 드립니다. 올해 주제는 우리 동네의 한 장소입니다. 한 사람이 예전처럼 세 장이 아니라 두 장까지 낼 수 있습니다. 사진은 최근 여섯 달 안에 찍은 것이어야 합니다. 12월 10일까지 미술부 전자우편으로 파일을 보내 주세요. 인화한 사진은 가져오지 마세요. 미술부에서 인화해 드립니다. 뽑힌 작품은 1층 복도에 전시합니다. 전시는 학년이 끝날 때까지 이어집니다. 궁금한 점은 미술 선생님께 여쭤보세요.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 남자가 신청할 강좌를 고르시오.",
      lines: [
        ["W", "Hyunwoo, which weekend course will you take this winter?"],
        ["M", "The centre is offering five of them altogether."],
        ["W", "I looked at the list on the noticeboard yesterday."],
        ["M", "They all start in the first week of January."],
        ["W", "Are you free on Saturday mornings?"],
        ["M", "I work at the library until noon every Saturday."],
        ["W", "Then the Saturday ones are out for you."],
        ["M", "Two of these five are on Saturday."],
        ["W", "How much can you spend on the whole thing?"],
        ["M", "Under sixty thousand won for the whole course."],
        ["W", "One of the rest is above that amount."],
        ["M", "And it should run for at least six weeks."],
        ["W", "A course of four weeks wouldn't teach you much."],
        ["M", "That's what I thought when I saw the list."],
        ["W", "Do you need anything special for it?"],
        ["M", "Only a notebook, according to the leaflet."],
        ["W", "Then only one of them is left."],
        ["M", "I'll sign up for it this evening."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 5,
      clue: "I work at the library until noon every Saturday.",
      explanation:
        "일요일에 하고, 6만 원 미만이며, 6주 이상인 강좌는 ⑤이다. 따라서 답은 ⑤이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Day: Saturday / Fee: 50,000 won / Weeks: 8" },
          { no: 2, label: "②", value: "Day: Saturday / Fee: 45,000 won / Weeks: 6" },
          { no: 3, label: "③", value: "Day: Sunday / Fee: 70,000 won / Weeks: 8" },
          { no: 4, label: "④", value: "Day: Sunday / Fee: 40,000 won / Weeks: 4" },
          { no: 5, label: "⑤", value: "Day: Sunday / Fee: 55,000 won / Weeks: 6" },
        ],
      },
      translation: [
        "W: 현우야, 이번 겨울 주말 강좌는 어느 걸 들을 거야?",
        "M: 센터에서 다 해서 다섯 개를 열어.",
        "W: 어제 게시판에 붙은 목록을 봤어.",
        "M: 다 1월 첫 주에 시작해.",
        "W: 토요일 오전에 시간 돼?",
        "M: 토요일마다 정오까지 도서관에서 일해.",
        "W: 그럼 토요일 것은 너한테서 빠지네.",
        "M: 이 다섯 중 두 개가 토요일이야.",
        "W: 전체로 얼마까지 쓸 수 있어?",
        "M: 강좌 전체로 6만 원 미만.",
        "W: 나머지 중 하나는 그 값을 넘어.",
        "M: 그리고 적어도 6주는 해야 해.",
        "W: 4주짜리로는 별로 못 배우지.",
        "M: 목록을 봤을 때 나도 그렇게 생각했어.",
        "W: 따로 준비할 게 있어?",
        "M: 안내지에는 공책만 있으면 된대.",
        "W: 그럼 남는 건 하나뿐이네.",
        "M: 오늘 저녁에 신청할게.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Did you book a place in the laboratory for tomorrow?"],
        ["M", "I didn't know we had to book it now."],
        ["W", "The sheet is outside room 204."],
        ["M", "Then I should put my name down today."],
        ["W", "Shall we go and look at it after lunch?"],
      ],
      choices: [
        "The laboratory is closed forever.",
        "I never use the laboratory.",
        "There is no sheet at all.",
        "Yes, let's go together then.",
        "Lunch was already over.",
      ],
      answer: 4,
      clue: "Shall we go and look at it after lunch?",
      explanation:
        "점심 후에 같이 가 보자는 제안이므로, 그때 같이 가자는 ④가 가장 자연스럽다.",
      translation: [
        "W: 내일 실험실 자리 예약했어?",
        "M: 이제 예약해야 하는 줄 몰랐어.",
        "W: 표는 204호 밖에 있어.",
        "M: 그럼 오늘 이름을 적어야겠다.",
        "W: 점심 먹고 같이 가서 볼까?",
        "M: 응, 그때 같이 가자.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Excuse me, is this where I hand in the contest photos?"],
        ["W", "Photos are sent to the department email, not handed in."],
        ["M", "I've already printed mine, though."],
        ["W", "The printed ones can't be entered, I'm afraid."],
        ["M", "So what should I do with the files?"],
      ],
      choices: [
        "Print them again tomorrow.",
        "Send them before the tenth.",
        "The contest is over now.",
        "Bring them here in person.",
        "Photos are not allowed.",
      ],
      answer: 2,
      clue: "So what should I do with the files?",
      explanation:
        "파일을 어떻게 해야 하는지 물었으므로, 10일 전에 보내라는 ②가 가장 자연스럽다.",
      translation: [
        "M: 실례합니다, 대회 사진은 여기 내는 건가요?",
        "W: 사진은 내는 게 아니라 부서 전자우편으로 보내는 거예요.",
        "M: 그런데 저는 벌써 인화했어요.",
        "W: 아쉽지만 인화한 것은 낼 수 없어요.",
        "M: 그럼 파일은 어떻게 해야 하나요?",
        "W: 10일 전에 보내 주세요.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Sumin, how did the reading group go this term?"],
        ["W", "Eleven people came in March and four came in June."],
        ["M", "Did the books get harder as the term went on?"],
        ["W", "No, they were much the same length."],
        ["M", "Was it always at the same time?"],
        ["W", "Thursday at four, from the first week."],
        ["M", "Then what changed between March and June?"],
        ["W", "We started choosing the next book by vote."],
        ["M", "And the same three people won every vote."],
        ["W", "So the rest were reading someone else's choices."],
        ["M", "How could the choosing be shared out instead?"],
      ],
      choices: [
        "We should vote more often.",
        "Let each member pick one in turn.",
        "The group should close down.",
        "We'll read nothing next term.",
        "Thursday is the wrong day.",
      ],
      answer: 2,
      clue: "How could the choosing be shared out instead?",
      explanation:
        "고르는 일을 어떻게 나눌지 물었으므로, 회원이 돌아가며 한 권씩 고르자는 ②가 가장 자연스럽다.",
      translation: [
        "M: 수민아, 이번 학기 독서 모임은 어땠어?",
        "W: 3월에는 열한 명이 왔는데 6월에는 네 명이 왔어.",
        "M: 학기가 갈수록 책이 어려워졌어?",
        "W: 아니, 길이도 거의 같았어.",
        "M: 늘 같은 시각에 했어?",
        "W: 첫 주부터 목요일 네 시.",
        "M: 그럼 3월과 6월 사이에 뭐가 달라졌어?",
        "W: 다음 책을 표결로 고르기 시작했어.",
        "M: 그리고 늘 같은 세 사람이 이겼겠지.",
        "W: 그래서 나머지는 남이 고른 책을 읽고 있었어.",
        "M: 고르는 일을 어떻게 나누면 될까?",
        "W: 회원이 돌아가며 한 권씩 고르게 하자.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Dongha, you said your morning study hardly works."],
        ["M", "I sit down at seven and nothing goes in."],
        ["W", "What do you study first?"],
        ["M", "Whatever is on top of the pile."],
        ["W", "So you decide at seven what to do at seven."],
        ["M", "And that takes twenty minutes on a bad day."],
        ["W", "By then the best part of the morning is gone."],
        ["M", "I never counted the deciding as part of it."],
        ["W", "Deciding is the tiring part, not the studying."],
        ["M", "So the choice should be made somewhere else."],
        ["W", "When would you make it?"],
      ],
      choices: [
        "At seven, as before.",
        "The night before, in one minute.",
        "I'll stop studying in the morning.",
        "Whenever I feel like it.",
        "There's nothing to decide.",
      ],
      answer: 2,
      clue: "When would you make it?",
      explanation:
        "언제 정할지 물었으므로, 전날 밤에 1분이면 된다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 동하야, 아침 공부가 잘 안된다고 했잖아.",
        "M: 일곱 시에 앉는데 머리에 안 들어와.",
        "W: 뭘 먼저 해?",
        "M: 쌓아 둔 것 중 맨 위에 있는 거.",
        "W: 그러니까 일곱 시에 일곱 시에 할 일을 정하는구나.",
        "M: 안 풀리는 날은 그게 20분이 걸려.",
        "W: 그러면 아침의 가장 좋은 대목이 날아가지.",
        "M: 정하는 걸 공부에 넣어 세어 본 적이 없어.",
        "W: 지치게 하는 건 공부가 아니라 정하는 일이야.",
        "M: 그럼 고르는 건 다른 데서 해야겠네.",
        "W: 언제 정할 거야?",
        "M: 전날 밤에, 1분이면 돼.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Jieun이 Minho에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Jieun : ________________",
      lines: [
        [
          "W",
          "Jieun and Minho are packing up after the science fair. " +
            "Minho is carrying the glass jars of samples in an open box, " +
            "and he has stacked them two deep with nothing between them. " +
            "The corridor outside has a step down at the door. " +
            "Jieun has seen jars slide and break on that step before, " +
            "and the samples took the club three weeks to prepare. " +
            "There is a tray of dividers on the shelf behind him. " +
            "She wants him to carry the jars in a single layer instead. " +
            "In this situation, what would Jieun most likely say to Minho?",
        ],
      ],
      choices: [
        "Put the jars in one layer only.",
        "Let's start the fair again.",
        "We need more samples.",
        "The box is too small.",
        "Leave the jars on the table.",
      ],
      answer: 1,
      clue: "She wants him to carry the jars in a single layer instead.",
      explanation:
        "겹쳐 쌓은 병이 문턱에서 깨질 수 있으므로, 한 겹으로 담으라는 ①이 가장 적절하다.",
      translation: [
        "W: 지은이와 민호는 과학전이 끝난 뒤 짐을 챙기고 있습니다. 민호는 표본이 담긴 유리병을 뚜껑 없는 상자에 옮기고 있는데, 사이에 아무것도 넣지 않고 두 겹으로 쌓았습니다. 밖 복도는 문 앞에 한 단 내려가는 턱이 있습니다. 지은이는 전에도 그 턱에서 병이 미끄러져 깨지는 것을 보았고, 그 표본은 동아리가 세 주에 걸쳐 만든 것입니다. 그의 뒤 선반에는 칸막이가 담긴 쟁반이 있습니다. 그는 병을 한 겹으로만 담아 옮기기를 바랍니다. 이런 상황에서 지은이가 민호에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 여자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "Hello, everyone. Today I want to talk about how plants " +
            "manage to survive without being able to move away from danger. " +
            "An animal in trouble can run, hide, or fight back with teeth. " +
            "A plant can do none of these, and yet most plants are not eaten to death. " +
            "A tree under attack by insects changes the chemistry of its leaves " +
            "within hours, making them bitter and hard to digest. " +
            "The insects feed more slowly, and many of them move away. " +
            "More surprisingly, the tree releases a scent into the air, " +
            "and neighbouring trees of the same kind begin the same change " +
            "before a single insect has reached them. " +
            "Trees that were warned are damaged far less than trees that were not. " +
            "Some plants go further and call for help, " +
            "releasing a scent that attracts the wasps that hunt those insects. " +
            "The wasps come because the plant has advertised a meal. " +
            "Rooted in one spot, they defend themselves by chemistry and by signal.",
        ],
      ],
      choices: [
        "how plants defend themselves without moving",
        "why insects prefer certain leaves",
        "how trees grow in poor soil",
        "why forests need wasps to survive",
        "how scents are used by farmers",
      ],
      answer: 1,
      clue: "Rooted in one spot, they defend themselves by chemistry and by signal.",
      explanation:
        "움직이지 못하는 식물이 스스로를 지키는 방식이 중심 내용이다. 따라서 답은 ①이다.",
      translation: [
        "W: 여러분, 안녕하세요. 오늘은 위험에서 달아날 수 없는 식물이 어떻게 살아남는지 이야기하려 합니다. 곤경에 빠진 짐승은 달아나거나 숨거나 이빨로 맞섭니다. 식물은 그 어느 것도 하지 못하는데, 그런데도 대부분의 식물은 다 먹혀 죽지 않습니다. 벌레에게 공격받는 나무는 몇 시간 안에 잎의 성분을 바꾸어 쓰고 소화되기 어렵게 만듭니다. 벌레는 더 천천히 먹고, 많은 수가 떠납니다. 더 놀라운 것은 그 나무가 공기 중으로 냄새를 내보낸다는 점입니다. 그러면 같은 종류의 이웃 나무들이 벌레가 한 마리도 닿기 전에 같은 변화를 시작합니다. 미리 알린 냄새를 받은 나무는 그렇지 않은 나무보다 훨씬 덜 상합니다. 어떤 식물은 한 걸음 더 나아가 도움을 부릅니다. 그 벌레를 사냥하는 말벌을 불러들이는 냄새를 내보내는 것입니다. 말벌은 식물이 먹이를 알렸기 때문에 옵니다. 한자리에 뿌리를 내린 채, 식물은 성분과 신호로 스스로를 지킵니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "다음을 듣고, 언급된 것이 아닌 것을 고르시오.",
      lines: [
        ["W", "A tree under attack changes the chemistry of its leaves."],
        ["W", "It releases a scent into the air."],
        ["W", "Neighbouring trees begin the same change."],
        ["W", "Some plants attract the wasps that hunt those insects."],
        ["W", "Rooted in one spot, they defend themselves by signal."],
      ],
      choices: ["leaves", "scent", "wasps", "insects", "birds"],
      answer: 5,
      clue: "Some plants attract the wasps that hunt those insects.",
      explanation:
        "잎, 냄새, 말벌, 벌레는 언급되지만 새는 나오지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
