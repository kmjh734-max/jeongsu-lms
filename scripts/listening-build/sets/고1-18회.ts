/** 고1 듣기 18회 — 사람이 직접 쓴 회차 (2026-09-21) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고1 18회",
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
          "Good morning, everyone. This is Ms. Ryu from the student welfare office. " +
            "I want to tell you about a change to the lost property system, starting next Monday. " +
            "Until now everything went into one box by the front door, and most of it stayed there until the holidays. " +
            "From Monday we will photograph each item and put the photos on the school website every Friday. " +
            "You can look through the photos from home instead of digging through the box. " +
            "If you see something of yours, tell your homeroom teacher and collect it at the office. " +
            "Items nobody claims within a month will be given to a local charity, as before. " +
            "The first set of photos goes up this Friday. Please have a look. Thank you.",
        ],
      ],
      choices: [
        "분실물을 찾아가라고 독촉하려고",
        "분실물을 알리는 방식이 바뀐 것을 안내하려고",
        "기부 행사 참여를 권하려고",
        "사물함 사용 규칙을 알리려고",
        "학생 도우미를 모집하려고",
      ],
      answer: 2,
      clue: "From Monday we will photograph each item and put the photos on the school website every Friday.",
      explanation:
        "다음 주부터 분실물을 사진으로 찍어 누리집에 올리는 방식으로 바뀐다는 것을 알리고 있다. 따라서 말의 목적은 ②이다.",
      translation: [
        "W: 여러분, 안녕하세요. 학생복지부 류 선생님입니다. " +
          "다음 주 월요일부터 달라지는 분실물 처리 방식을 알려 드리려 합니다. " +
          "지금까지는 모든 물건을 정문 옆 상자 하나에 넣었고, 대부분 방학까지 거기에 남아 있었습니다. " +
          "월요일부터는 물건마다 사진을 찍어 금요일마다 학교 누리집에 올립니다. " +
          "상자를 뒤지지 않고 집에서 사진을 훑어볼 수 있습니다. " +
          "자기 물건이 보이면 담임 선생님께 말씀드리고 행정실에서 찾아가면 됩니다. " +
          "한 달 동안 주인이 나타나지 않는 물건은 예전처럼 지역 단체에 기부합니다. " +
          "첫 사진은 이번 주 금요일에 올라갑니다. 한 번 살펴봐 주세요. 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 남자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Minseok, why do you always sit with the same three people at lunch?"],
        ["M", "I don't, actually. I changed tables back in March."],
        ["W", "On purpose? Nobody changes tables on purpose."],
        ["M", "Completely on purpose. I'd eaten with the same four people since first year."],
        ["W", "What was wrong with that? They're your friends."],
        ["M", "Nothing was wrong, and that was exactly the problem. Nothing new ever happened."],
        ["W", "Lunch is only twenty minutes. How much can happen?"],
        ["M", "More than you'd think. From one new table I've learned about three clubs I'd never heard of."],
        ["W", "Three? I didn't know we had that many."],
        ["M", "Neither did I, and one of them meets in a room I walk past every day."],
        ["W", "Wasn't it awkward at first, though?"],
        ["M", "Two very long lunches. After that it was just lunch."],
        ["W", "Then I'll sit somewhere else tomorrow."],
      ],
      choices: [
        "친구는 많을수록 좋다",
        "점심시간에는 자리를 바꿔 새로운 사람과 앉아 볼 필요가 있다",
        "동아리는 한 개만 하는 것이 좋다",
        "학교생활은 규칙적이어야 한다",
        "대화는 짧게 하는 것이 좋다",
      ],
      answer: 2,
      clue: "More than you'd think. From one new table I've learned about three clubs I'd never heard of.",
      explanation:
        "남자는 늘 같은 사람과 앉으면 새로운 일이 없다며 자리를 바꿔 앉아 본 경험을 이야기한다. 따라서 답은 ②이다.",
      translation: [
        "W: 민석아, 왜 점심때 늘 같은 세 명이랑 앉아?",
        "M: 사실 아니야. 3월에 이미 자리를 바꿨어.",
        "W: 일부러? 일부러 자리 바꾸는 사람이 어디 있어.",
        "M: 완전히 일부러. 1학년 때부터 같은 네 명이랑 먹었거든.",
        "W: 그게 뭐가 문제인데? 친구들이잖아.",
        "M: 문제는 없었어, 그게 바로 문제였지. 새로운 일이 하나도 안 생겼어.",
        "W: 점심시간은 20분밖에 안 되잖아. 무슨 일이 생기겠어?",
        "M: 생각보다 많아. 새 자리 하나에서 들어 본 적도 없는 동아리 세 개를 알게 됐어.",
        "W: 세 개나? 그렇게 많은 줄 몰랐네.",
        "M: 나도 몰랐어. 그중 하나는 내가 매일 지나가는 교실에서 모여.",
        "W: 그래도 처음엔 어색하지 않았어?",
        "M: 아주 긴 점심 두 번. 그다음부터는 그냥 점심이었어.",
        "W: 그럼 나도 내일은 다른 데 앉아 봐야겠다.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "When you cannot solve a problem, the usual advice is to take a break. " +
            "That works, but not for the reason people give. " +
            "It is not that your brain quietly solves it while you walk. " +
            "It is that you come back and read the question as if for the first time. " +
            "After twenty minutes with a problem, you stop reading the words and start reading your memory of them. " +
            "The break does not add an idea. It removes the wrong one you were holding onto.",
        ],
      ],
      choices: [
        "어려운 문제는 남에게 물어보아야 한다",
        "휴식은 규칙적으로 취해야 한다",
        "막힐 때 쉬는 것은 문제를 처음처럼 다시 읽게 해 주기 때문이다",
        "문제는 시간을 재고 풀어야 한다",
        "공부는 짧게 여러 번 나누어 해야 한다",
      ],
      answer: 3,
      clue: "The break does not add an idea. It removes the wrong one you were holding onto.",
      explanation:
        "쉬는 동안 답이 떠오르는 것이 아니라, 돌아와서 문제를 처음처럼 다시 읽게 되어 잘못 붙들던 생각을 버리게 된다는 내용이다. 따라서 요지는 ③이다.",
      translation: [
        "M: 문제가 풀리지 않을 때 흔히 듣는 조언은 잠깐 쉬라는 것입니다. " +
          "효과는 있지만, 사람들이 말하는 이유 때문은 아닙니다. " +
          "걷는 동안 뇌가 조용히 문제를 푸는 것이 아닙니다. " +
          "돌아와서 그 문제를 처음 보는 것처럼 읽게 되기 때문입니다. " +
          "한 문제를 20분 붙들고 있으면 글자가 아니라 그 글자에 대한 기억을 읽게 됩니다. " +
          "휴식은 생각을 더해 주지 않습니다. 붙들고 있던 잘못된 생각을 덜어 낼 뿐입니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["M", "Yerin, the school store looks much better after the rearrangement."],
        ["W", "Thanks. We spent two afternoons on it."],
        ["M", "On the back wall there's a round clock."],
        ["W", "We put it up so people can see it from the queue."],
        ["M", "On the left there's a shelf with three baskets on it."],
        ["W", "Pens, erasers, and snacks. One basket each."],
        ["M", "In the middle there's a long counter with a cash register."],
        ["W", "That's where we take the money at lunch."],
        ["M", "By the window on the right, is that a fan?"],
        ["W", "No, it's an air purifier. The fan broke in July."],
        ["M", "I see. And next to the door there's a tall stool."],
        ["W", "Whoever is on duty sits there between customers."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "No, it's an air purifier. The fan broke in July.",
      explanation:
        "여자는 창가에 있는 것이 선풍기가 아니라 공기청정기라고 바로잡는다. 그림에는 선풍기가 그려져 있으므로 ④가 대화와 일치하지 않는다.",
      figure: {
        kind: "labeled",
        scene:
          "A small school store seen from the front, five things clearly separated and none overlapping, clean black line art, no writing anywhere. " +
          "High on the back wall: a ROUND wall clock. " +
          "Left wall: a shelf holding exactly THREE open baskets in a row. " +
          "Centre of the room: a LONG counter with a CASH REGISTER standing on it. " +
          "By the window on the right: a tall STANDING ELECTRIC FAN with a round cage on a pole and a round base. " +
          "Next to the door on the far right: one tall STOOL with long legs and a round seat.",
      },
      translation: [
        "M: 예린아, 자리를 바꾸고 나니 매점이 훨씬 나아 보인다.",
        "W: 고마워. 오후를 이틀이나 썼어.",
        "M: 뒷벽에 둥근 시계가 있네.",
        "W: 줄 서서도 보이라고 걸었어.",
        "M: 왼쪽 선반에는 바구니가 세 개 있고.",
        "W: 펜, 지우개, 간식. 바구니마다 하나씩이야.",
        "M: 가운데에는 계산기가 놓인 긴 계산대가 있네.",
        "W: 점심시간에 거기서 계산해.",
        "M: 오른쪽 창가에 있는 건 선풍기야?",
        "W: 아니, 공기청정기야. 선풍기는 7월에 고장 났어.",
        "M: 그렇구나. 그리고 문 옆에는 키 큰 의자가 있고.",
        "W: 당번이 손님 없을 때 거기 앉아.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 여자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Chaewon, the reading club poster has a problem."],
        ["W", "I printed forty of them yesterday. What's wrong?"],
        ["M", "The meeting room number is wrong. It says 204."],
        ["W", "And we moved to 302 last week."],
        ["M", "Exactly. Forty posters sending people to the wrong floor."],
        ["W", "Can we fix them by hand?"],
        ["M", "With forty of them, that would take an hour and look terrible."],
        ["W", "Then I'll change the file and print them again."],
        ["M", "The office machine is free after the fifth period."],
        ["W", "I'll do it then and put the new ones up tomorrow morning."],
        ["M", "Thanks. I'll take the old ones down this afternoon."],
      ],
      choices: [
        "예전 포스터를 떼기",
        "동아리방을 예약하기",
        "포스터를 고쳐서 다시 인쇄하기",
        "부원들에게 문자 보내기",
        "행정실에 문의하기",
      ],
      answer: 3,
      clue: "I'll do it then and put the new ones up tomorrow morning.",
      explanation:
        "여자는 방 번호를 고쳐 포스터를 다시 인쇄하기로 한다. 예전 포스터를 떼는 일은 남자가 맡았다. 따라서 답은 ③이다.",
      translation: [
        "M: 채원아, 독서 동아리 포스터에 문제가 있어.",
        "W: 어제 40장 인쇄했는데. 뭐가 잘못됐어?",
        "M: 모임 방 번호가 틀렸어. 204호로 되어 있어.",
        "W: 지난주에 302호로 옮겼잖아.",
        "M: 그러니까. 40장이 사람들을 엉뚱한 층으로 보내는 거야.",
        "W: 손으로 고칠 수 있을까?",
        "M: 40장이면 한 시간 걸리고 보기에도 엉망일걸.",
        "W: 그럼 파일을 고쳐서 다시 인쇄할게.",
        "M: 5교시 끝나면 행정실 기계가 비어.",
        "W: 그때 해서 내일 아침에 새로 붙일게.",
        "M: 고마워. 예전 건 내가 오늘 오후에 뗄게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 남자가 지불할 금액을 고르시오.",
      lines: [
        ["W", "Welcome to the bike shop. How can I help you?"],
        ["M", "I need a helmet and a light for my bike."],
        ["W", "Our school helmets are twenty-five dollars."],
        ["M", "One of those, please."],
        ["W", "And the lights are nine dollars each, front and back."],
        ["M", "I'll take both, so two lights."],
        ["W", "Twenty-five and eighteen. That's forty-three dollars."],
        ["M", "Do you have a student discount?"],
        ["W", "We do. Three dollars off for students."],
        ["M", "Here's my card."],
        ["W", "Would you like a lock as well? It's twelve dollars."],
        ["M", "No, thank you. I already have one."],
      ],
      choices: ["$34", "$40", "$43", "$46", "$52"],
      answer: 2,
      clue: "We do. Three dollars off for students.",
      explanation:
        "헬멧 25달러와 등 9달러짜리 두 개 18달러를 더하면 43달러이다. 학생 할인 3달러를 빼면 40달러이고 자물쇠는 사지 않았으므로 답은 ②이다.",
      translation: [
        "W: 자전거 가게입니다. 무엇을 도와드릴까요?",
        "M: 헬멧이랑 자전거 등이 필요해요.",
        "W: 학생용 헬멧은 25달러입니다.",
        "M: 그걸로 하나 주세요.",
        "W: 등은 앞뒤 각각 9달러입니다.",
        "M: 둘 다 할게요, 두 개요.",
        "W: 25달러에 18달러면 43달러입니다.",
        "M: 학생 할인 있나요?",
        "W: 있습니다. 학생은 3달러 할인됩니다.",
        "M: 카드 여기 있습니다.",
        "W: 자물쇠도 하시겠어요? 12달러입니다.",
        "M: 아니요, 괜찮아요. 하나 있어요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 남자가 사진 동아리를 그만두려는 이유를 고르시오.",
      lines: [
        ["W", "Junho, is it true you're leaving the photo club?"],
        ["M", "After this month, yes. I told the president yesterday."],
        ["W", "Is it because of the camera? Yours broke in August."],
        ["M", "I borrow the club one. That's not it."],
        ["W", "Then why? You've been in it since first year."],
        ["M", "The club moved its shooting day to Saturday morning."],
        ["W", "And you can't come on Saturdays?"],
        ["M", "I started helping at my uncle's shop every Saturday in September."],
        ["W", "So there's no way to do both."],
        ["M", "None. I'd rather leave properly than keep missing days."],
      ],
      choices: [
        "카메라가 고장 나서",
        "성적이 떨어져서",
        "주말에 다른 일이 생겨서",
        "부원들과 맞지 않아서",
        "다른 동아리에 들어가서",
      ],
      answer: 3,
      clue: "I started helping at my uncle's shop every Saturday in September.",
      explanation:
        "동아리 촬영일이 토요일 오전으로 바뀌었는데 남자는 토요일마다 삼촌 가게를 돕는다. 따라서 답은 ③이다.",
      translation: [
        "W: 준호야, 사진 동아리 그만둔다는 게 사실이야?",
        "M: 이번 달까지만. 어제 회장한테 말했어.",
        "W: 카메라 때문이야? 네 카메라가 8월에 고장 났잖아.",
        "M: 동아리 것을 빌려 써. 그건 아니야.",
        "W: 그럼 왜? 1학년 때부터 했잖아.",
        "M: 동아리 촬영일이 토요일 오전으로 바뀌었어.",
        "W: 토요일에는 못 와?",
        "M: 9월부터 토요일마다 삼촌 가게를 돕기 시작했어.",
        "W: 그럼 둘 다 할 방법이 없네.",
        "M: 없어. 계속 빠지느니 제대로 그만두는 게 나아.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 교내 독서 토론 대회에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["W", "Dohun, have you seen the notice about the reading debate?"],
        ["M", "Only the title. What is it?"],
        ["W", "Two teams read the same book and argue about one question from it."],
        ["M", "When is it held?"],
        ["W", "The last Wednesday of this month, after the sixth period."],
        ["M", "Which book do we read?"],
        ["W", "They chose a short novel. Copies are in the library already."],
        ["M", "How many people on a team?"],
        ["W", "Three, and one of them has to be a first year."],
        ["M", "Then I'll ask Sohee and one of the new students."],
        ["W", "Do it today. Only eight teams can enter."],
      ],
      choices: ["진행 방식", "열리는 날", "읽을 책", "팀 구성", "심사 기준"],
      answer: 5,
      clue: "Three, and one of them has to be a first year.",
      explanation:
        "진행 방식(두 팀이 한 질문으로 토론), 날짜(이달 마지막 수요일), 읽을 책(짧은 소설), 팀 구성(3인, 1학년 포함)은 언급되지만 심사 기준은 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 도훈아, 독서 토론 대회 공지 봤어?",
        "M: 제목만. 뭐야?",
        "W: 두 팀이 같은 책을 읽고 그 책의 한 질문을 두고 토론하는 거야.",
        "M: 언제 하는데?",
        "W: 이달 마지막 수요일, 6교시 끝나고.",
        "M: 무슨 책을 읽어?",
        "W: 짧은 소설로 정했대. 도서관에 이미 들어와 있어.",
        "M: 한 팀에 몇 명이야?",
        "W: 세 명, 그중 한 명은 1학년이어야 해.",
        "M: 그럼 소희랑 새로 온 애들 중 한 명한테 물어봐야겠다.",
        "W: 오늘 해. 여덟 팀만 나갈 수 있어.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Mirae Youth Farm에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "M",
          "Here is what you should know about Mirae Youth Farm, which opened on the edge of the city three years ago. " +
            "It is open every day except Monday, from nine in the morning until six. " +
            "Anyone may walk around the fields, and there is no entrance fee. " +
            "To join a planting session, however, you must book online at least three days ahead. " +
            "Boots and gloves are lent out at the gate, so you do not need to bring your own. " +
            "The farm shop sells what was picked that morning, and it closes an hour before the farm does. " +
            "The number four bus stops right at the gate.",
        ],
      ],
      choices: [
        "3년 전에 문을 열었다",
        "월요일을 빼고 매일 연다",
        "입장료가 없다",
        "장화와 장갑은 각자 준비해야 한다",
        "농장 가게는 농장보다 한 시간 먼저 닫는다",
      ],
      answer: 4,
      clue: "Boots and gloves are lent out at the gate, so you do not need to bring your own.",
      explanation:
        "장화와 장갑은 입구에서 빌려주므로 준비할 필요가 없다고 했다. 따라서 ④가 내용과 일치하지 않는다.",
      translation: [
        "M: 3년 전 도시 외곽에 문을 연 Mirae Youth Farm을 소개합니다. " +
          "월요일을 빼고 매일 아침 9시부터 저녁 6시까지 엽니다. " +
          "밭을 둘러보는 것은 누구나 할 수 있고 입장료는 없습니다. " +
          "다만 모종 심기 체험에 참여하려면 적어도 사흘 전에 온라인으로 예약해야 합니다. " +
          "장화와 장갑은 입구에서 빌려주므로 따로 가져오실 필요가 없습니다. " +
          "농장 가게는 그날 아침에 딴 것을 팔고, 농장보다 한 시간 먼저 닫습니다. " +
          "4번 버스가 정문 앞에 섭니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 예약할 야외 활동을 고르시오.",
      lines: [
        ["W", "Seungho, these are the five outdoor programmes left for October."],
        ["M", "Let's pick one. I can't do Sunday because of my grandmother."],
        ["W", "Right, that takes out one of them."],
        ["M", "Next, how long do they run? I can't manage more than four hours."],
        ["W", "Then one more is gone. Three are left."],
        ["M", "What do they cost?"],
        ["W", "We said thirty-five thousand won at the most."],
        ["M", "Then one more drops out. Two left."],
        ["W", "Do they both provide lunch? We'd have to bring it otherwise."],
        ["M", "Only one does."],
        ["W", "Then that's the one. I'll book it for both of us tonight."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "Then that's the one. I'll book it for both of us tonight.",
      explanation:
        "일요일인 ②, 6시간인 ①, 4만 원인 ③을 뺀다. 남은 ④와 ⑤ 중 점심을 주는 곳은 ④이므로 답은 ④이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "토요일 / 6시간 / 30,000원 / 점심 제공" },
          { no: 2, label: "②", value: "일요일 / 4시간 / 28,000원 / 점심 제공" },
          { no: 3, label: "③", value: "토요일 / 3시간 / 40,000원 / 점심 제공" },
          { no: 4, label: "④", value: "금요일 / 4시간 / 35,000원 / 점심 제공" },
          { no: 5, label: "⑤", value: "토요일 / 3시간 / 25,000원 / 점심 없음" },
        ],
      },
      translation: [
        "W: 승호야, 10월에 남은 야외 프로그램이 이 다섯 개야.",
        "M: 하나 고르자. 할머니 때문에 일요일은 안 돼.",
        "W: 맞다, 그럼 하나가 빠지네.",
        "M: 다음으로 몇 시간짜리야? 네 시간 넘게는 힘들어.",
        "W: 그럼 하나 더 빠진다. 세 개 남았어.",
        "M: 얼마야?",
        "W: 3만 5천 원까지로 정했잖아.",
        "M: 그럼 하나 더 빠지고 둘 남았다.",
        "W: 둘 다 점심 줘? 아니면 싸 가야 하잖아.",
        "M: 한 곳만 줘.",
        "W: 그럼 거기로 하자. 오늘 밤에 둘 다 예약할게.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Did you order the parts for the science project?"],
        ["M", "Not yet. The shop near the station was closed."],
        ["W", "Did you try ordering them online?"],
        ["M", "I thought delivery would take a week."],
        ["W", "Not from that site. It arrives the next morning."],
      ],
      choices: [
        "The project is due in three weeks.",
        "I need six of each part.",
        "The shop opens at ten.",
        "You should order yours as well.",
        "Then I'll order them tonight.",
      ],
      answer: 5,
      clue: "Not from that site. It arrives the next morning.",
      explanation:
        "그 사이트에서는 다음 날 아침에 온다는 말을 들었으므로, 오늘 밤에 주문하겠다는 ⑤가 가장 자연스럽다.",
      translation: [
        "W: 과학 과제에 쓸 부품 주문했어?",
        "M: 아직. 역 근처 가게가 닫았더라.",
        "W: 인터넷으로 주문해 봤어?",
        "M: 배송이 일주일 걸릴 줄 알았어.",
        "W: 그 사이트는 안 그래. 다음 날 아침에 와.",
        "M: 그럼 오늘 밤에 주문할게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "You've been standing in the corridor every break again."],
        ["W", "My locker is on the other side of the building."],
        ["M", "Can't you swap it for a closer one?"],
        ["W", "I didn't know we could."],
        ["M", "There's a swap list outside the office every September."],
      ],
      choices: [
        "My locker is number forty.",
        "Then I'll go and look at it today.",
        "The corridor is quite cold.",
        "I carry everything in my bag.",
        "You should swap yours too.",
      ],
      answer: 2,
      clue: "There's a swap list outside the office every September.",
      explanation:
        "9월마다 행정실 앞에 사물함 교환 명단이 있다는 말을 들었으므로, 오늘 가서 보겠다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 쉬는 시간마다 또 복도에 서 있네.",
        "W: 내 사물함이 건물 반대쪽이야.",
        "M: 가까운 걸로 바꿀 수 없어?",
        "W: 바꿀 수 있는 줄 몰랐어.",
        "M: 9월마다 행정실 앞에 교환 명단이 붙어.",
        "W: 그럼 오늘 가서 봐야겠다.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Nayeon, how is the volunteer tutoring going?"],
        ["W", "The children come, but they don't ask me anything."],
        ["M", "Not a single question?"],
        ["W", "Two in six weeks. They just nod when I explain."],
        ["M", "Do you ask them whether they understand?"],
        ["W", "Every time. They always say yes."],
        ["M", "Nobody says no to that question in front of other people."],
        ["W", "I hadn't thought of it that way."],
        ["M", "Ask them to explain it back to you instead."],
        ["W", "Even if they get it wrong?"],
        ["M", "Especially then. That's the only way you'll know."],
      ],
      choices: [
        "Then I'll ask them to explain it back next week.",
        "The children are all in the fourth grade.",
        "I teach them every Tuesday evening.",
        "I'd rather teach only one child.",
        "They already understand most of it.",
      ],
      answer: 1,
      clue: "Especially then. That's the only way you'll know.",
      explanation:
        "이해했냐고 묻는 대신 아이들이 직접 설명하게 하라는 조언을 들었으므로, 다음 주에 그렇게 하겠다는 ①이 가장 자연스럽다.",
      translation: [
        "M: 나연아, 학습 봉사는 잘돼 가?",
        "W: 아이들이 오긴 하는데 나한테 아무것도 안 물어봐.",
        "M: 질문이 하나도 없어?",
        "W: 6주 동안 두 개. 설명하면 고개만 끄덕여.",
        "M: 이해했냐고 물어봐?",
        "W: 매번. 늘 그렇다고 해.",
        "M: 다른 사람들 앞에서 그 질문에 아니라고 하는 사람은 없어.",
        "W: 그렇게는 생각 못 했어.",
        "M: 대신 아이들이 너한테 다시 설명하게 해 봐.",
        "W: 틀리게 말해도?",
        "M: 그럴 때일수록. 그래야만 알 수 있어.",
        "W: 그럼 다음 주에는 아이들이 설명하게 해 볼게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Taemin, you've been going to the library every evening."],
        ["M", "Since September, but my scores haven't moved."],
        ["W", "How long do you stay?"],
        ["M", "Four hours, from six until ten."],
        ["W", "And how much of that is actual studying?"],
        ["M", "Honestly? Maybe two hours. I check my phone a lot."],
        ["W", "Where is your phone while you work?"],
        ["M", "Face down on the desk, beside my notes."],
        ["W", "So it's in your eyeline the whole time."],
      ],
      choices: [
        "Then I'll leave it in my bag from tomorrow.",
        "The library closes at ten.",
        "I study four hours every evening.",
        "My phone is almost three years old.",
        "You should come to the library too.",
      ],
      answer: 1,
      clue: "So it's in your eyeline the whole time.",
      explanation:
        "휴대전화가 내내 눈에 들어온다는 지적을 들었으므로, 내일부터 가방에 넣어 두겠다는 ①이 가장 자연스럽다.",
      translation: [
        "W: 태민아, 저녁마다 도서관에 가더라.",
        "M: 9월부터. 그런데 점수가 안 움직여.",
        "W: 얼마나 있어?",
        "M: 네 시간, 6시부터 10시까지.",
        "W: 그중에 실제로 공부하는 건 얼마나 돼?",
        "M: 솔직히? 두 시간쯤. 휴대전화를 자주 봐.",
        "W: 공부할 때 휴대전화는 어디에 둬?",
        "M: 책상 위에 엎어서, 필기 옆에.",
        "W: 그럼 내내 눈에 들어오는 거네.",
        "M: 그럼 내일부터 가방에 넣어 둘게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Ms. Han이 Sora에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Ms. Han : ________________",
      lines: [
        [
          "W",
          "Ms. Han leads the school choir, and Sora is one of her strongest singers. " +
            "Sora learns her part faster than anyone and never sings a wrong note. " +
            "In rehearsal, however, she looks down at the score from the first bar to the last. " +
            "Because of that she misses every signal Ms. Han gives with her hands. " +
            "Ms. Han does not want her to stop using the score; that care is why the part is accurate. " +
            "The trouble is that a choir that cannot see the conductor cannot start or stop together. " +
            "The autumn concert is in three weeks, and two songs change speed in the middle. " +
            "She wants to ask Sora to look up at the start of each line. " +
            "In this situation, what would Ms. Han most likely say to Sora?",
        ],
      ],
      choices: [
        "Try to memorise the whole song by Friday.",
        "I think you should sing a different part.",
        "Please sing a little more quietly.",
        "Let's take those two songs out of the concert.",
        "Look up at the beginning of every line.",
      ],
      answer: 5,
      clue: "She wants to ask Sora to look up at the start of each line.",
      explanation:
        "한 선생님은 소라의 악보 보는 습관을 문제 삼지 않으면서, 각 줄 시작에서 고개를 들라고 말하려 한다. 따라서 ⑤가 가장 적절하다.",
      translation: [
        "W: 한 선생님은 학교 합창단을 맡고 있고, 소라는 가장 든든한 단원 중 하나입니다. " +
          "소라는 누구보다 빨리 자기 파트를 익히고 음을 틀리는 법이 없습니다. " +
          "그런데 연습 때 첫 마디부터 끝 마디까지 악보만 내려다봅니다. " +
          "그 때문에 한 선생님이 손으로 주는 신호를 하나도 보지 못합니다. " +
          "한 선생님은 소라가 악보를 그만 보기를 바라지 않습니다. 그 꼼꼼함 덕분에 파트가 정확합니다. " +
          "문제는 지휘자를 볼 수 없는 합창단은 함께 시작하거나 멈출 수 없다는 점입니다. " +
          "가을 연주회는 3주 뒤이고, 두 곡은 가운데에서 빠르기가 바뀝니다. " +
          "그래서 각 줄이 시작할 때 고개를 들어 달라고 부탁하고 싶습니다. " +
          "이런 상황에서 한 선생님이 소라에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "남자가 하는 말의 주제로 가장 적절한 것은?",
      lines: [
        ["M", "Good afternoon. Today I want to talk about animals that clean other animals."],
        ["M", "We think of cleaning as a chore, but for some creatures it is a whole way of making a living."],
        ["M", "The cleaner wrasse runs what is almost a shop on a reef, and large fish queue to be looked over."],
        ["M", "The oxpecker rides on a buffalo all day, eating the insects that settle in its hide."],
        ["M", "Cleaner shrimp wave their antennae at the mouth of a cave until a fish comes and opens its jaws."],
        ["M", "The Egyptian plover is said to pick scraps from between a crocodile's teeth without being eaten."],
        ["M", "In each case both animals gain, and the larger one holds still although it could easily bite."],
        ["M", "That restraint, not the cleaning, is the part worth thinking about."],
      ],
      choices: [
        "animals that clean other animals",
        "how fish find food on a reef",
        "why some animals live in groups",
        "how birds choose where to nest",
        "why crocodiles rarely attack",
      ],
      answer: 1,
      clue: "In each case both animals gain, and the larger one holds still although it could easily bite.",
      explanation:
        "남자는 청소놀래기, 소등쪼기새, 청소새우, 악어물떼새가 다른 동물을 청소하며 살아가는 방식을 설명한다. 따라서 주제는 ①이다.",
      translation: [
        "M: 안녕하세요. 오늘은 다른 동물을 청소해 주는 동물에 대해 이야기하려 합니다.",
        "M: 우리는 청소를 궂은일로 여기지만, 어떤 생물에게는 그것이 살아가는 방식 전부입니다.",
        "M: 청소놀래기는 산호초에서 거의 가게를 차린 셈이고, 큰 물고기들이 줄을 서서 살펴봐 달라고 합니다.",
        "M: 소등쪼기새는 하루 종일 물소 등에 올라타 가죽에 붙은 벌레를 먹습니다.",
        "M: 청소새우는 굴 입구에서 더듬이를 흔들다가 물고기가 와서 입을 벌리면 안으로 들어갑니다.",
        "M: 악어물떼새는 악어 이빨 사이의 찌꺼기를 쪼아 먹으면서도 잡아먹히지 않는다고 합니다.",
        "M: 어느 경우든 둘 다 이득을 얻고, 큰 쪽은 얼마든지 물 수 있는데도 가만히 있습니다.",
        "M: 청소가 아니라 바로 그 참음이 생각해 볼 만한 대목입니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 동물이 아닌 것은?",
      lines: [
        ["M", "Good afternoon. Today I want to talk about animals that clean other animals."],
        ["M", "We think of cleaning as a chore, but for some creatures it is a whole way of making a living."],
        ["M", "The cleaner wrasse runs what is almost a shop on a reef, and large fish queue to be looked over."],
        ["M", "The oxpecker rides on a buffalo all day, eating the insects that settle in its hide."],
        ["M", "Cleaner shrimp wave their antennae at the mouth of a cave until a fish comes and opens its jaws."],
        ["M", "The Egyptian plover is said to pick scraps from between a crocodile's teeth without being eaten."],
        ["M", "In each case both animals gain, and the larger one holds still although it could easily bite."],
        ["M", "That restraint, not the cleaning, is the part worth thinking about."],
      ],
      choices: ["cleaner wrasse", "oxpecker", "cleaner shrimp", "sea turtle", "Egyptian plover"],
      answer: 4,
      clue: "Cleaner shrimp wave their antennae at the mouth of a cave until a fish comes and opens its jaws.",
      explanation:
        "청소놀래기, 소등쪼기새, 청소새우, 악어물떼새는 언급되지만 바다거북은 언급되지 않았다. 따라서 답은 ④이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
