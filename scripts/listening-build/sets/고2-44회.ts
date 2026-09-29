/** 고2 듣기 44회 — 사람이 직접 쓴 회차 (2026-09-29) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고2 44회",
  gradeLevel: "high2",
  speechSpeed: 0.8,
  folder: "고2 듣기",
  questions: [
    {
      order: 1,
      type: "목적 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 목적으로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "Good afternoon, students. This is the student council speaking. " +
            "For three years the lost and found has been a box in the office, " +
            "and every term we throw away things nobody came to claim. " +
            "Last month alone there were nineteen umbrellas and eleven water bottles. " +
            "We believe the problem is that nobody can see inside a box. " +
            "From next Monday, everything found is photographed and posted " +
            "on the board outside the student council room, with the date. " +
            "Look at the board before you give up on something you lost. " +
            "Items stay on the board for two weeks and then go to donation. " +
            "Owners bring their student card and sign one line. " +
            "It costs you a glance on the way to lunch.",
        ],
      ],
      choices: [
        "분실물을 사진으로 게시한다고 알리려고",
        "분실물을 기부한다고 알리려고",
        "학생회 선거를 안내하려고",
        "우산 대여를 안내하려고",
        "청소 구역을 알리려고",
      ],
      answer: 1,
      clue: "everything found is photographed and posted",
      explanation:
        "주운 물건을 사진으로 찍어 게시판에 붙인다고 알리고 있다. 따라서 답은 ①이다.",
      translation: [
        "W: 학생 여러분, 안녕하세요. 학생회입니다. 3년 동안 분실물은 사무실의 상자 하나였고, 학기마다 아무도 찾아가지 않은 물건을 버려 왔습니다. 지난달만 해도 우산 열아홉 개와 물병 열한 개가 있었습니다. 문제는 상자 안을 아무도 볼 수 없다는 데 있다고 봅니다. 다음 주 월요일부터, 주운 물건은 모두 사진을 찍어 날짜와 함께 학생회실 밖 게시판에 붙입니다. 잃어버린 물건을 포기하기 전에 게시판을 먼저 보세요. 물건은 두 주 동안 게시판에 있다가 기부됩니다. 주인은 학생증을 가져와 한 줄만 적으시면 됩니다. 점심 가는 길에 한 번 보는 것으로 충분합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 남자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Seoyul, you never write your plan for more than one day ahead."],
        ["M", "Tomorrow only. Anything further is a guess."],
        ["W", "But a weekly plan shows you the whole shape of the week."],
        ["M", "It shows a shape that will be wrong by Wednesday."],
        ["W", "Mine usually is, now that I think of it."],
        ["M", "And then you spend Thursday feeling behind."],
        ["W", "That's exactly what happens to me."],
        ["M", "A plan you keep rewriting stops meaning anything."],
        ["W", "So you decide each evening for the next day."],
        ["M", "With the information I actually have by then."],
        ["W", "It sounds less impressive but more honest."],
        ["M", "A plan for tomorrow is kept; a plan for Friday is imagined."],
        ["W", "I'll try planning one day at a time."],
      ],
      choices: [
        "계획은 하루 단위로 세워야 지켜진다",
        "주간 계획표를 만들어야 한다",
        "계획은 구체적으로 적어야 한다",
        "목표를 크게 세워야 한다",
        "계획은 남과 공유해야 한다",
      ],
      answer: 1,
      clue: "A plan for tomorrow is kept; a plan for Friday is imagined.",
      explanation:
        "남자는 하루 단위로 세운 계획이 지켜진다고 말한다. 따라서 답은 ①이다.",
      translation: [
        "W: 서율아, 너는 계획을 하루 앞까지밖에 안 적더라.",
        "M: 내일까지만. 그 너머는 짐작이야.",
        "W: 그래도 주간 계획을 세우면 한 주 모양이 보이잖아.",
        "M: 수요일이면 틀려 있을 모양이 보이는 거지.",
        "W: 생각해 보니 내 것도 늘 그래.",
        "M: 그러고는 목요일 내내 뒤처진 기분으로 지내지.",
        "W: 딱 나한테 벌어지는 일이야.",
        "M: 자꾸 고쳐 쓰는 계획은 아무 뜻도 없어져.",
        "W: 그래서 저녁마다 다음 날을 정하는구나.",
        "M: 그때 내가 실제로 아는 것을 가지고.",
        "W: 덜 근사해 보이는데 더 정직하네.",
        "M: 내일 계획은 지켜지고, 금요일 계획은 상상이야.",
        "W: 나도 하루씩 세워 볼게.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "We describe some people as naturally good at speaking in public. " +
            "Watch one of them closely before a talk and you will see something else. " +
            "They are not calm; they have simply rehearsed the first thirty seconds " +
            "so many times that those seconds require nothing from them. " +
            "The nervousness that ruins a talk lives almost entirely at the start, " +
            "when the room is quiet and the speaker has not yet heard their own voice. " +
            "Get through that opening and the body settles on its own. " +
            "So do not practise the whole talk ten times. " +
            "Practise the opening thirty seconds until it needs no thought at all.",
        ],
      ],
      choices: [
        "발표는 첫 30초를 익혀 두는 것이 중요하다",
        "발표는 여러 번 연습해야 한다",
        "긴장은 자연스러운 것이다",
        "청중을 보면서 말해야 한다",
        "발표 원고는 외워야 한다",
      ],
      answer: 1,
      clue: "Practise the opening thirty seconds until it needs no thought at all.",
      explanation:
        "첫 30초를 몸에 익히는 것이 중요하다고 말한다. 따라서 답은 ①이다.",
      translation: [
        "W: 우리는 어떤 사람을 두고 타고나게 발표를 잘한다고 말합니다. 그런데 그런 사람을 발표 직전에 가까이서 보면 다른 것이 보입니다. 그들은 침착한 것이 아닙니다. 첫 30초를 너무 여러 번 연습해 두어서 그 30초가 그들에게 아무것도 요구하지 않는 것입니다. 발표를 망치는 긴장은 거의 전부 시작에 몰려 있습니다. 방이 조용하고 발표자가 아직 제 목소리를 듣지 못한 그때입니다. 그 첫머리를 지나가면 몸은 알아서 가라앉습니다. 그러니 발표 전체를 열 번 연습하지 마십시오. 첫 30초를 아무 생각도 필요 없을 때까지 연습하십시오.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["M", "Dain, is this the photo of the new science lab?"],
        ["W", "Yes, they finished it over the summer break."],
        ["M", "There's a long bench down the centre of the room."],
        ["W", "Four groups can work along it at once."],
        ["M", "And a tall cupboard stands in the left corner."],
        ["W", "The chemicals are locked inside it."],
        ["M", "I see two sinks against the back wall."],
        ["W", "Three sinks, actually. One is hidden by the cupboard."],
        ["M", "There's a projector hanging from the ceiling."],
        ["W", "It points at the board by the door."],
        ["M", "And a first aid box hangs beside the door."],
        ["W", "The teacher checks it every month."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "Three sinks, actually. One is hidden by the cupboard.",
      explanation:
        "개수대가 두 개라고 했지만 세 개라고 했다. 따라서 답은 ③이다.",
      figure: {
        kind: "figure5",
        scene:
          "A school science laboratory, clean black line art on a plain white background, no writing or letters anywhere. " +
          "A LONG BENCH runs down the centre of the room. " +
          "A TALL CUPBOARD stands in the left corner. " +
          "TWO SINKS are set against the back wall. " +
          "A PROJECTOR hangs from the ceiling. " +
          "A FIRST AID BOX hangs on the wall beside the door.",
        spots: [
          [0.5, 0.62],
          [0.1, 0.42],
          [0.62, 0.22],
          [0.5, 0.1],
          [0.88, 0.55],
        ],
      },
      translation: [
        "M: 다인아, 이게 새 과학실 사진이야?",
        "W: 응, 여름 방학 동안 다 만들었어.",
        "M: 방 한가운데를 따라 긴 작업대가 있네.",
        "W: 네 모둠이 한 번에 붙어서 할 수 있어.",
        "M: 그리고 왼쪽 구석에 키 큰 수납장이 있고.",
        "W: 약품은 그 안에 잠가 둬.",
        "M: 뒷벽에 개수대가 두 개 보여.",
        "W: 사실 세 개야. 하나가 수납장에 가려졌어.",
        "M: 천장에 영사기가 달려 있네.",
        "W: 문 옆 칠판을 비춰.",
        "M: 그리고 문 옆에 구급함이 걸려 있고.",
        "W: 선생님이 매달 확인하셔.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 남자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Junseo, the club concert starts in exactly one hour."],
        ["M", "The chairs are out and the stage is ready to go."],
        ["W", "Did anyone bring the extension cord for the keyboard?"],
        ["M", "I thought it came in the case with the instruments."],
        ["W", "I unpacked every case and there is no cord anywhere."],
        ["M", "Then it must still be in the music room cupboard."],
        ["W", "We used it there for the rehearsal on Monday."],
        ["M", "And nobody put it back in the case afterwards."],
        ["W", "The music teacher locks that room at five o'clock."],
        ["M", "It is twenty minutes to five right now."],
        ["W", "Then someone has to go there immediately."],
        ["M", "The keyboard is completely useless without it."],
        ["W", "I'll finish setting out the programs here."],
        ["M", "I'll go and get the extension cord."],
      ],
      choices: [
        "순서지를 놓기",
        "무대를 정리하기",
        "연장선을 가져오기",
        "건반을 옮기기",
        "선생님을 부르기",
      ],
      answer: 3,
      clue: "I'll go and get the extension cord.",
      explanation:
        "남자는 음악실에서 연장선을 가져오겠다고 했다. 따라서 답은 ③이다.",
      translation: [
        "W: 준서야, 동아리 연주회가 딱 한 시간 뒤에 시작해.",
        "M: 의자는 놓았고 무대도 다 준비됐어.",
        "W: 건반에 쓸 연장선은 누가 가져왔어?",
        "M: 악기 가방에 같이 들어 있는 줄 알았는데.",
        "W: 가방을 다 풀어 봤는데 선이 어디에도 없어.",
        "M: 그럼 아직 음악실 장에 있겠다.",
        "W: 월요일 예행연습 때 거기서 썼잖아.",
        "M: 그러고 아무도 가방에 도로 안 넣었구나.",
        "W: 음악 선생님이 다섯 시에 그 방을 잠그셔.",
        "M: 지금 다섯 시 20분 전이야.",
        "W: 그럼 누가 지금 바로 가야 해.",
        "M: 그게 없으면 건반은 완전히 무용지물이야.",
        "W: 나는 여기서 순서지 놓는 걸 마무리할게.",
        "M: 내가 가서 연장선을 가져올게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 여자가 지불할 금액을 고르시오.",
      lines: [
        ["M", "Welcome to the sports shop. What can I help you with?"],
        ["W", "I need three pairs of socks and two water bottles."],
        ["M", "The socks are four dollars a pair this week."],
        ["W", "Were they five dollars last month?"],
        ["M", "They were, until the autumn sale started."],
        ["W", "And how much is one water bottle?"],
        ["M", "The small bottle is six dollars, the large one nine."],
        ["W", "I'll take two small ones, please."],
        ["M", "Members of our club get ten percent off the total."],
        ["W", "I signed up in September. Here's my card."],
        ["M", "Then the discount applies to the whole purchase."],
        ["W", "Good, I'll pay by card."],
      ],
      choices: ["$19.80", "$21.60", "$22.50", "$24.00", "$26.40"],
      answer: 2,
      clue: "The socks are four dollars a pair this week.",
      explanation:
        "양말 세 켤레 12달러와 물병 두 개 12달러로 24달러인데, 10퍼센트를 빼면 21.60달러이다. 따라서 답은 ②이다.",
      translation: [
        "M: 운동용품점에 오신 걸 환영합니다. 무엇을 도와드릴까요?",
        "W: 양말 세 켤레랑 물병 두 개가 필요해요.",
        "M: 이번 주에 양말은 한 켤레에 4달러입니다.",
        "W: 지난달에는 5달러였죠?",
        "M: 맞습니다. 가을 할인이 시작되기 전까지는요.",
        "W: 물병은 하나에 얼마예요?",
        "M: 작은 병은 6달러, 큰 병은 9달러입니다.",
        "W: 작은 걸로 두 개 주세요.",
        "M: 저희 모임 회원은 전체에서 10퍼센트 할인됩니다.",
        "W: 9월에 가입했어요. 여기 카드요.",
        "M: 그럼 전체 구매에 할인이 들어갑니다.",
        "W: 좋네요, 카드로 낼게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 남자가 동아리 모임에 늦은 이유를 고르시오.",
      lines: [
        ["W", "Taehyun, you missed the first half of the meeting."],
        ["W", "We started right at four as we always do."],
        ["M", "I ran the whole way from the science building."],
        ["W", "Did your class finish late again?"],
        ["M", "It ended at ten to four, as usual."],
        ["W", "Then did you stop to talk to someone?"],
        ["M", "Not for more than a moment."],
        ["W", "So what held you up?"],
        ["M", "The teacher asked me to carry the microscopes to the store room."],
        ["W", "All of them?"],
        ["M", "Twelve of them, two at a time, up one floor."],
        ["W", "Then you have a very good excuse."],
      ],
      choices: [
        "현미경을 옮겨 달라는 부탁을 받아서",
        "수업이 늦게 끝나서",
        "친구와 이야기하느라",
        "몸이 아파서",
        "길을 잘못 들어서",
      ],
      answer: 1,
      clue: "The teacher asked me to carry the microscopes to the store room.",
      explanation:
        "선생님 부탁으로 현미경을 옮기느라 늦었다. 따라서 답은 ①이다.",
      translation: [
        "W: 태현아, 모임 앞 절반을 놓쳤네.",
        "W: 늘 그렇듯 네 시 정각에 시작했어.",
        "M: 과학관에서부터 내내 뛰어왔어.",
        "W: 수업이 또 늦게 끝났어?",
        "M: 평소대로 네 시 10분 전에 끝났어.",
        "W: 그럼 누구랑 얘기하느라 멈췄어?",
        "M: 잠깐 말고는 아니야.",
        "W: 그럼 뭐 때문에 늦었어?",
        "M: 선생님이 현미경을 창고로 옮겨 달라고 하셨어.",
        "W: 전부?",
        "M: 열두 대를, 두 대씩, 한 층 위로.",
        "W: 그럼 아주 그럴듯한 사정이네.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 교내 과학 전시회에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["M", "Nari, is your team entering the science fair?"],
        ["M", "The notice went up in the hallway yesterday."],
        ["W", "I read it. When does it take place?"],
        ["M", "On the third Thursday of next month, all day."],
        ["W", "Where are the projects displayed?"],
        ["M", "In the science building, on the first floor."],
        ["W", "How many students can be on one team?"],
        ["M", "Three, and each team gets one table."],
        ["W", "Do we present to the judges?"],
        ["M", "Five minutes each, standing beside your work."],
        ["W", "Five minutes goes by quickly."],
        ["M", "Applications close at the science office on Friday."],
        ["W", "Then I'll ask two friends this afternoon."],
      ],
      choices: ["열리는 날", "전시하는 곳", "한 팀의 인원", "발표 시간", "심사 기준"],
      answer: 5,
      clue: "On the third Thursday of next month, all day.",
      explanation:
        "날짜, 장소, 인원, 발표 시간은 말했지만 심사 기준은 말하지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 나리야, 너희 팀 과학 전시회에 나가?",
        "M: 어제 복도에 알림이 붙었어.",
        "W: 읽었어. 언제 해?",
        "M: 다음 달 셋째 주 목요일, 하루 종일.",
        "W: 작품은 어디에 전시해?",
        "M: 과학관 1층에.",
        "W: 한 팀에 몇 명까지야?",
        "M: 세 명이고 팀마다 탁자 하나씩 받아.",
        "W: 심사위원 앞에서 발표도 해?",
        "M: 작품 옆에 서서 각자 5분씩.",
        "W: 5분은 금방 지나가지.",
        "M: 신청은 금요일에 과학실에서 마감해.",
        "W: 그럼 오늘 오후에 친구 둘한테 물어볼게.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "다음을 듣고, 학교 텃밭 가꾸기 사업에 관한 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "M",
          "Hello, students. Here is the plan for the school garden project. " +
            "It runs from March to October, every Tuesday after school. " +
            "The beds are behind the gymnasium, beside the bicycle racks. " +
            "Twenty students may take part, and any grade may apply. " +
            "Tools, gloves and seeds are all provided by the school. " +
            "You should wear clothes and shoes that can get dirty. " +
            "A farmer from the village visits once a month to teach us. " +
            "Everything we harvest goes to the school kitchen. " +
            "Apply at the science office by the end of February.",
        ],
      ],
      choices: [
        "3월부터 10월까지 화요일마다 한다",
        "체육관 뒤 자전거 거치대 옆에서 한다",
        "학년에 관계없이 스무 명이 참여한다",
        "연장과 장갑, 씨앗을 학교가 준비한다",
        "수확물은 참여 학생이 나눠 가진다",
      ],
      answer: 5,
      clue: "Everything we harvest goes to the school kitchen.",
      explanation:
        "수확물은 학교 급식실로 간다고 했으므로 ⑤가 일치하지 않는다.",
      translation: [
        "M: 학생 여러분, 안녕하세요. 학교 텃밭 사업 계획을 알려 드립니다. 3월부터 10월까지 화요일마다 방과 후에 진행됩니다. 텃밭은 체육관 뒤, 자전거 거치대 옆에 있습니다. 스무 명이 참여할 수 있고 학년에 관계없이 신청할 수 있습니다. 연장과 장갑, 씨앗은 모두 학교에서 준비합니다. 더러워져도 되는 옷과 신발을 입고 오세요. 마을 농부 한 분이 한 달에 한 번 오셔서 가르쳐 주십니다. 거둔 것은 모두 학교 급식실로 갑니다. 2월 말까지 과학실에서 신청해 주세요.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 고를 봉사 활동을 고르시오.",
      lines: [
        ["W", "Kiwon, which volunteer program should we apply for?"],
        ["M", "Five are listed on the city website this month."],
        ["W", "We can only go on Sunday afternoons."],
        ["M", "So the Saturday ones are out for both of us."],
        ["W", "That still leaves us a few choices."],
        ["M", "It should also be within thirty minutes of the school."],
        ["W", "One of them is an hour away by bus."],
        ["M", "We would spend more time travelling than working."],
        ["W", "And it has to accept students under eighteen."],
        ["M", "Two of these are for adults only."],
        ["W", "Then only one program fits all three conditions."],
        ["M", "I'll register both of us tonight."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "We can only go on Sunday afternoons.",
      explanation:
        "일요일, 30분 이내 거리, 미성년 참여 가능인 활동은 ④이다. 따라서 답은 ④이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Day: Saturday / Travel: 20 min / Under 18: Yes" },
          { no: 2, label: "②", value: "Day: Sunday / Travel: 60 min / Under 18: Yes" },
          { no: 3, label: "③", value: "Day: Sunday / Travel: 25 min / Under 18: No" },
          { no: 4, label: "④", value: "Day: Sunday / Travel: 20 min / Under 18: Yes" },
          { no: 5, label: "⑤", value: "Day: Saturday / Travel: 15 min / Under 18: Yes" },
        ],
      },
      translation: [
        "W: 기원아, 어떤 봉사 활동에 신청할까?",
        "M: 이번 달 시 누리집에 다섯 개가 올라와 있어.",
        "W: 우리는 일요일 오후에만 갈 수 있어.",
        "M: 그럼 토요일 것은 둘 다 빠지네.",
        "W: 그래도 고를 게 몇 개 남아.",
        "M: 학교에서 30분 안에 있는 데여야 해.",
        "W: 하나는 버스로 한 시간 걸려.",
        "M: 일하는 시간보다 오가는 시간이 길겠다.",
        "W: 그리고 열여덟 살 미만도 받아야 해.",
        "M: 이 중 두 곳은 어른만 받아.",
        "W: 그럼 세 조건에 다 맞는 건 하나뿐이야.",
        "M: 오늘 밤에 둘 다 신청할게.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Have you chosen a topic for the research paper?"],
        ["M", "I have three ideas written down."],
        ["W", "The outline is due on Friday morning."],
        ["M", "That gives me two evenings to decide."],
        ["W", "Shall we look at the three together after school?"],
      ],
      choices: [
        "The paper was last term.",
        "Sure, in the study room.",
        "I don't write papers.",
        "There is no outline.",
        "Friday already passed.",
      ],
      answer: 2,
      clue: "Shall we look at the three together after school?",
      explanation:
        "방과 후에 셋을 같이 보자는 제안이므로, 열람실에서 하자는 ②가 가장 자연스럽다.",
      translation: [
        "W: 연구 보고서 주제 정했어?",
        "M: 생각해 둔 게 셋 적혀 있어.",
        "W: 개요가 금요일 아침까지야.",
        "M: 그럼 저녁이 이틀 남네.",
        "W: 방과 후에 셋을 같이 볼까?",
        "M: 좋아, 열람실에서.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Excuse me, can I print something at the library?"],
        ["W", "Yes, at the machine beside the front desk."],
        ["M", "Do I pay by card or by coin?"],
        ["W", "The machine takes your student card only."],
        ["M", "What if I have no money on the card?"],
      ],
      choices: [
        "The machine is broken.",
        "You can add money at the desk.",
        "I don't have a card.",
        "Printing is not allowed.",
        "The library has no machine.",
      ],
      answer: 2,
      clue: "What if I have no money on the card?",
      explanation:
        "카드에 돈이 없으면 어떻게 하는지 물었으므로, 안내대에서 충전하라는 ②가 가장 자연스럽다.",
      translation: [
        "M: 실례합니다, 도서관에서 출력할 수 있나요?",
        "W: 네, 안내대 옆 기계에서요.",
        "M: 카드로 내나요, 동전으로 내나요?",
        "W: 그 기계는 학생증만 받습니다.",
        "M: 카드에 돈이 없으면요?",
        "W: 안내대에서 충전하시면 됩니다.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Chaeyeon, how is the class newsletter going?"],
        ["W", "We printed it twice and both times it went unread."],
        ["M", "When do you hand it out?"],
        ["W", "At the end of the last period on Friday."],
        ["M", "Everyone is packing their bag at that moment."],
        ["W", "They take it and it goes straight into the bag."],
        ["M", "And the bag is emptied on Monday morning."],
        ["W", "By then it's last week's news."],
        ["M", "When would a student actually have two free minutes?"],
        ["W", "During the wait before assembly, I suppose."],
        ["M", "Could you hand it out then instead?"],
      ],
      choices: [
        "No, that's impossible.",
        "Yes, I'll try it on Monday.",
        "We'll stop printing it.",
        "Nobody attends assembly.",
        "I already hand it out then.",
      ],
      answer: 2,
      clue: "Could you hand it out then instead?",
      explanation:
        "그때 나눠 줄 수 있는지 물었으므로, 월요일에 해 보겠다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 채연아, 학급 소식지는 잘돼 가?",
        "W: 두 번 찍었는데 두 번 다 안 읽혔어.",
        "M: 언제 나눠 줘?",
        "W: 금요일 마지막 교시 끝날 때.",
        "M: 그때는 다들 가방을 싸고 있잖아.",
        "W: 받아서 곧장 가방에 넣어.",
        "M: 그리고 그 가방은 월요일 아침에 비워지지.",
        "W: 그때쯤이면 지난주 소식이고.",
        "M: 학생한테 실제로 2분이 비는 때가 언제일까?",
        "W: 조회 기다리는 동안이겠지.",
        "M: 그때 나눠 주면 어떨까?",
        "W: 응, 월요일에 해 볼게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Hyunbin, you said your vocabulary book never gets finished."],
        ["M", "I start at page one every January."],
        ["W", "How far do you usually get?"],
        ["M", "Around page forty, then something else starts."],
        ["W", "And next year you begin at page one again."],
        ["M", "The first forty pages are the ones I know best."],
        ["W", "So you keep practising what you already know."],
        ["M", "I'd never seen it laid out like that."],
        ["W", "What if you started somewhere else this time?"],
        ["M", "Starting in the middle feels wrong, but it makes sense."],
        ["W", "Which page would you open tomorrow?"],
      ],
      choices: [
        "Page one, as always.",
        "Page forty-one.",
        "I'll buy a new book.",
        "I won't study vocabulary.",
        "The last page only.",
      ],
      answer: 2,
      clue: "Which page would you open tomorrow?",
      explanation:
        "내일 어느 쪽을 펼칠지 물었으므로, 41쪽이라는 ②가 가장 자연스럽다.",
      translation: [
        "W: 현빈아, 단어책을 한 번도 못 끝낸다고 했잖아.",
        "M: 1월마다 1쪽부터 시작해.",
        "W: 보통 어디까지 가?",
        "M: 40쪽쯤. 그러다 다른 일이 시작돼.",
        "W: 그리고 다음 해에 또 1쪽부터 시작하고.",
        "M: 앞의 40쪽이 내가 제일 잘 아는 부분이야.",
        "W: 그러니까 이미 아는 걸 계속 연습하는 거네.",
        "M: 그렇게 늘어놓고 본 적이 없어.",
        "W: 이번엔 다른 데서 시작하면 어때?",
        "M: 가운데서 시작하는 게 어색하긴 한데 말이 되네.",
        "W: 내일은 몇 쪽을 펼칠 거야?",
        "M: 41쪽.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Bora가 Taeho에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Bora : ________________",
      lines: [
        [
          "W",
          "Bora and Taeho are getting the club room ready for new members. " +
            "Taeho has just moved the heavy bookcase against the back wall, " +
            "and he is now about to load all four shelves with encyclopedias. " +
            "Bora noticed this morning that the bookcase stands on an uneven floor " +
            "and that one leg does not touch the ground at all. " +
            "Loaded with heavy books, the whole thing would lean forward. " +
            "New members will be sitting on the floor right in front of it. " +
            "She wants to tell him to level the bookcase before filling it. " +
            "In this situation, what would Bora most likely say to Taeho?",
        ],
      ],
      choices: [
        "Put the heaviest books on top.",
        "The meeting is tomorrow.",
        "Level it before you load it.",
        "Let's move the bookcase outside.",
        "We need a second bookcase.",
      ],
      answer: 3,
      clue: "She wants to tell him to level the bookcase before filling it.",
      explanation:
        "다리 하나가 떠 있어 기울 수 있으므로, 채우기 전에 수평을 맞추라는 ③이 가장 적절하다.",
      translation: [
        "W: 보라와 태호는 새 회원을 맞으려고 동아리방을 정리하고 있습니다. 태호는 방금 무거운 책장을 뒷벽에 붙여 옮겼고, 이제 네 칸에 백과사전을 가득 채우려 합니다. 보라는 오늘 아침에 그 책장이 고르지 않은 바닥에 놓여 있고 다리 하나가 바닥에 아예 닿지 않는다는 것을 봤습니다. 무거운 책을 채우면 통째로 앞으로 기울 것입니다. 새 회원들은 바로 그 앞 바닥에 앉게 됩니다. 그녀는 채우기 전에 수평을 맞추라고 말하고 싶습니다. 이런 상황에서 보라가 태호에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 남자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Hello, everyone. Today I want to talk about the ways animals " +
            "raise young that are not their own, and why this happens at all. " +
            "The cuckoo lays a single egg in another bird's nest, " +
            "and the smaller parents feed a chick twice their own size. " +
            "In a meerkat group only one female breeds, " +
            "while every other adult stands guard and carries food to her pups. " +
            "Young elephants are watched by aunts and older sisters for years, " +
            "and a calf that loses its mother is usually taken in by the herd. " +
            "Certain fish carry the eggs of neighbours in their mouths, " +
            "protecting a hundred young that share none of their blood. " +
            "Care, it turns out, does not always follow the family line.",
        ],
      ],
      choices: [
        "how animals care for young that are not their own",
        "why some birds build hidden nests",
        "how young animals learn to find food",
        "why elephants live in large herds",
        "how fish protect themselves from predators",
      ],
      answer: 1,
      clue: "Care, it turns out, does not always follow the family line.",
      explanation:
        "제 새끼가 아닌 어린 것을 돌보는 방식이 중심 내용이다. 따라서 답은 ①이다.",
      translation: [
        "M: 여러분, 안녕하세요. 오늘은 동물들이 제 새끼가 아닌 어린 것을 기르는 방식과, 그런 일이 왜 일어나는지 이야기하려 합니다. 뻐꾸기는 다른 새의 둥지에 알을 하나 낳고, 그보다 작은 어미 새가 제 몸의 두 배나 되는 새끼를 먹여 키웁니다. 미어캣 무리에서는 암컷 한 마리만 새끼를 낳고, 나머지 어른들은 모두 보초를 서고 그 새끼들에게 먹이를 날라 줍니다. 어린 코끼리는 이모와 언니들에게 몇 해 동안 돌봄을 받고, 어미를 잃은 새끼는 대개 무리가 거두어들입니다. 어떤 물고기는 이웃의 알을 입에 물어 주는데, 제 피가 한 방울도 섞이지 않은 새끼 백 마리를 지켜 줍니다. 돌봄은 늘 핏줄을 따라가지는 않는 모양입니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "다음을 듣고, 언급된 동물이 아닌 것을 고르시오.",
      lines: [
        ["M", "The cuckoo lays a single egg in another bird's nest."],
        ["M", "In a meerkat group only one female breeds."],
        ["M", "Young elephants are watched by aunts and older sisters."],
        ["M", "Certain fish carry the eggs of neighbours in their mouths."],
        ["M", "Care does not always follow the family line."],
      ],
      choices: ["cuckoos", "meerkats", "elephants", "fish", "wolves"],
      answer: 5,
      clue: "Certain fish carry the eggs of neighbours in their mouths.",
      explanation:
        "뻐꾸기, 미어캣, 코끼리, 물고기는 언급되지만 늑대는 나오지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
