/** 고1 듣기 25회 — 사람이 직접 쓴 회차 (2026-09-25) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고1 25회",
  gradeLevel: "high1",
  speechSpeed: 0.8,
  folder: "고1 듣기",
  questions: [
    {
      order: 1,
      type: "목적 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 목적으로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Good afternoon, students. This is Mr. Seo from the student council. " +
            "I want to talk about the lost and found box outside the main office. " +
            "Right now it holds about ninety items, most of them from the spring term. " +
            "Forty are water bottles, twenty are jackets, and the rest are keys, gloves and umbrellas. " +
            "Nobody has come to look through it in weeks, and the box is now too full to close. " +
            "So this Friday during lunch, we will lay everything out on tables in the front hall. " +
            "Come and take what is yours. " +
            "Whatever is still on the tables at two o'clock will be donated to the community center. " +
            "If you think you lost something this year, Friday is the day. Thank you.",
        ],
      ],
      choices: [
        "분실물을 금요일에 찾아가라고 알리려고",
        "분실물 보관함 위치 변경을 알리려고",
        "물품 기증을 부탁하려고",
        "학생회 선거를 안내하려고",
        "점심시간 변경을 알리려고",
      ],
      answer: 1,
      clue: "So this Friday during lunch, we will lay everything out on tables in the front hall.",
      explanation:
        "남자는 금요일 점심시간에 분실물을 중앙 현관에 늘어놓을 테니 와서 찾아가라고 알린다. 따라서 답은 ①이다.",
      translation: [
        "M: 학생 여러분, 안녕하세요. 학생회 서입니다. 교무실 앞 분실물 상자에 대해 말씀드리려 합니다. 지금 그 안에는 아흔 개쯤 들어 있고 대부분 1학기 것입니다. 마흔 개는 물병, 스무 개는 겉옷, 나머지는 열쇠와 장갑, 우산입니다. 몇 주째 아무도 들여다보러 오지 않았고, 이제 상자는 너무 차서 닫히지도 않습니다. 그래서 이번 주 금요일 점심시간에 중앙 현관 탁자에 전부 늘어놓겠습니다. 와서 본인 것을 가져가세요. 2시까지 탁자에 남아 있는 것은 주민 센터에 기증합니다. 올해 무언가를 잃어버린 것 같다면 금요일입니다. 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 여자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Sumin, I've started taking notes on my tablet in every class."],
        ["W", "How does it compare to writing by hand?"],
        ["M", "Much faster. I can type nearly everything the teacher says."],
        ["W", "Nearly everything? That's a lot of words."],
        ["M", "Exactly. I don't miss anything anymore."],
        ["W", "When you write by hand, what do you have to do first?"],
        ["M", "Decide what's worth writing, I suppose."],
        ["W", "That deciding is the part that makes it stick."],
        ["M", "So typing everything skips the thinking."],
        ["W", "It does. Your notes get longer and your memory gets shorter."],
        ["M", "Should I go back to paper, then?"],
        ["W", "Or keep the tablet but force yourself to write half as much."],
      ],
      choices: [
        "필기는 손으로 해야 한다",
        "필기는 무엇을 적을지 고르는 과정이 중요하다",
        "수업은 녹음해 두어야 한다",
        "필기는 수업 후에 정리해야 한다",
        "태블릿은 수업에 쓰지 말아야 한다",
      ],
      answer: 2,
      clue: "That deciding is the part that makes it stick.",
      explanation:
        "여자는 무엇을 적을지 정하는 그 과정이 기억에 남게 한다며, 적는 양을 절반으로 줄이라고 말한다. 따라서 답은 ②이다.",
      translation: [
        "M: 수민아, 나 모든 수업에서 태블릿으로 필기하기 시작했어.",
        "W: 손으로 쓰는 거랑 어때?",
        "M: 훨씬 빨라. 선생님 말씀을 거의 다 칠 수 있어.",
        "W: 거의 다? 엄청난 양인데.",
        "M: 그래. 이제 놓치는 게 없어.",
        "W: 손으로 쓸 때는 먼저 뭘 해야 해?",
        "M: 뭘 적을 가치가 있는지 정해야겠지.",
        "W: 그 정하는 게 기억에 남게 하는 부분이야.",
        "M: 그럼 다 치는 건 생각을 건너뛰는 거구나.",
        "W: 그래. 필기는 길어지고 기억은 짧아져.",
        "M: 그럼 종이로 돌아가야 해?",
        "W: 아니면 태블릿을 쓰되 적는 양을 절반으로 줄여 봐.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "We tend to describe habits as things we either have or lack. " +
            "Someone is a morning person, someone else has no discipline. " +
            "But watch what actually happens when a habit sticks. " +
            "Almost always, something in the room changed. " +
            "The running shoes were by the door instead of in the closet. " +
            "The phone charged in the kitchen instead of beside the bed. " +
            "The guitar sat out on a stand instead of inside its case. " +
            "None of these required more willpower. " +
            "They shortened the distance between wanting to do something and starting it. " +
            "And that distance, not motivation, is what most attempts die in. " +
            "So if a habit keeps failing, do not ask what is wrong with you. " +
            "Ask what would have to move.",
        ],
      ],
      choices: [
        "습관은 매일 반복해야 한다",
        "아침에 일어나는 습관이 중요하다",
        "목표를 구체적으로 세워야 한다",
        "습관은 의지보다 환경을 바꿔야 붙는다",
        "습관은 기록해야 유지된다",
      ],
      answer: 4,
      clue: "They shortened the distance between wanting to do something and starting it.",
      explanation:
        "여자는 습관이 붙을 때는 늘 방 안의 무언가가 바뀌었다며, 의지가 아니라 시작까지의 거리를 줄여야 한다고 말한다. 따라서 답은 ④이다.",
      translation: [
        "W: 우리는 습관을 가졌거나 못 가진 것으로 이야기하는 경향이 있습니다. 누구는 아침형 인간이고, 누구는 의지가 없다고요. 그런데 습관이 실제로 붙을 때 무슨 일이 일어나는지 보세요. 거의 언제나 방 안의 무언가가 바뀌었습니다. 운동화가 옷장이 아니라 문 옆에 있었습니다. 휴대폰이 침대 옆이 아니라 부엌에서 충전됐습니다. 기타가 가방 속이 아니라 받침대 위에 놓여 있었습니다. 이 중 어느 것도 더 큰 의지를 필요로 하지 않았습니다. 하고 싶은 마음과 시작 사이의 거리를 줄였을 뿐입니다. 그리고 대부분의 시도가 죽는 곳은 동기가 아니라 바로 그 거리입니다. 그러니 습관이 자꾸 무너진다면 나에게 무슨 문제가 있는지 묻지 마세요. 무엇이 자리를 옮겨야 하는지 물으세요.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["M", "Sumin, is this the stall your class ran at the market day?"],
        ["W", "Yes, we sold second-hand books there."],
        ["M", "There's a canvas awning stretched over the table."],
        ["W", "It rained in the morning, so we were glad of it."],
        ["M", "And a chalkboard stands at the left end."],
        ["W", "We wrote the prices on it every hour."],
        ["M", "I count three crates of books under the table."],
        ["W", "There were four. One is hidden behind the chair."],
        ["M", "The folding chair behind the table looks well used."],
        ["W", "It's from the music room, and it squeaks."],
        ["M", "And there's a tin box on the table for the money."],
        ["W", "We counted it three times at the end of the day."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "There were four. One is hidden behind the chair.",
      explanation:
        "남자가 책 상자가 세 개라고 하자 여자가 네 개라고 바로잡는다. 그림에는 세 개가 그려져 있으므로 답은 ③이다.",
      figure: {
        kind: "scene",
        scene:
          "A market-day book stall drawn as one wide picture, clean black line art on white, no writing or letters anywhere. " +
          "A CANVAS AWNING is stretched over a long table. " +
          "A blank CHALKBOARD on a stand stands at the left end of the table. " +
          "Exactly THREE WOODEN CRATES filled with books sit on the ground under the table, clearly countable. " +
          "A FOLDING CHAIR stands behind the table. " +
          "A TIN CASH BOX sits on top of the table.",
      },
      translation: [
        "M: 수민아, 이게 너희 반이 장터에서 한 가게야?",
        "W: 응, 거기서 헌책을 팔았어.",
        "M: 탁자 위에 천 차양이 쳐져 있네.",
        "W: 아침에 비가 와서 다행이었어.",
        "M: 그리고 왼쪽 끝에 칠판이 서 있어.",
        "W: 한 시간마다 거기에 값을 적었어.",
        "M: 탁자 밑에 책 상자가 세 개 보여.",
        "W: 네 개였어. 하나는 의자 뒤에 가려졌어.",
        "M: 탁자 뒤 접이의자는 많이 쓴 것 같네.",
        "W: 음악실에서 가져온 건데 삐걱거려.",
        "M: 그리고 탁자 위에 돈 넣는 양철 상자가 있네.",
        "W: 그날 끝나고 세 번이나 세어 봤어.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 여자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Sumin, the class debate starts at three in the library."],
        ["W", "I know. Are the desks arranged for two teams?"],
        ["M", "Done at lunch. Six chairs on each side."],
        ["W", "Good. And the timer for the speeches?"],
        ["M", "Borrowed from the science room. It's on the front desk."],
        ["W", "Then what's still missing?"],
        ["M", "Nobody printed the judging sheets for the three teachers."],
        ["W", "How many pages is each sheet?"],
        ["M", "Two, so six pages altogether."],
        ["W", "The printer in the staff room is free until three."],
        ["M", "I'd go, but I have to walk the judges up from the office."],
        ["W", "Then I'll print the judging sheets and bring them in."],
      ],
      choices: [
        "책상 배치하기",
        "시계 빌리기",
        "심사표 인쇄하기",
        "심사위원 안내하기",
        "도서관 청소하기",
      ],
      answer: 3,
      clue: "Then I'll print the judging sheets and bring them in.",
      explanation:
        "책상과 시계는 끝났고 남자는 심사위원을 모시러 가야 하므로, 여자가 심사표를 인쇄해 오기로 한다. 따라서 답은 ③이다.",
      translation: [
        "M: 수민아, 학급 토론이 3시에 도서관에서 시작해.",
        "W: 알아. 책상은 두 팀에 맞게 놨어?",
        "M: 점심때 끝냈어. 양쪽에 의자 여섯 개씩.",
        "W: 좋아. 발언 시간 잴 시계는?",
        "M: 과학실에서 빌렸어. 앞 책상에 있어.",
        "W: 그럼 아직 없는 게 뭐야?",
        "M: 선생님 세 분께 드릴 심사표를 아무도 인쇄하지 않았어.",
        "W: 한 장에 몇 쪽인데?",
        "M: 두 쪽. 그러니 모두 여섯 쪽이야.",
        "W: 교무실 인쇄기가 3시까지는 비어 있어.",
        "M: 내가 가고 싶은데, 심사위원분들을 사무실에서 모시고 와야 해.",
        "W: 그럼 내가 심사표 인쇄해서 가져올게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 남자가 지불할 금액을 고르시오.",
      lines: [
        ["W", "Welcome to Maple Sports. What are you looking for today?"],
        ["M", "Four badminton rackets and two tubes of shuttlecocks, please."],
        ["W", "Rackets are eighteen dollars each and a tube is nine."],
        ["M", "So seventy-two dollars plus eighteen."],
        ["W", "Ninety in total. Would you like racket covers as well?"],
        ["M", "How much are the covers?"],
        ["W", "Five dollars each, so twenty for four."],
        ["M", "We'll skip the covers this time."],
        ["W", "No problem. Are you buying for a school club?"],
        ["M", "Yes, here's our club card."],
        ["W", "Then I can take twenty percent off the total."],
        ["M", "Great. I'll pay by card."],
      ],
      choices: ["$72.00", "$80.00", "$88.00", "$90.00", "$110.00"],
      answer: 1,
      clue: "Then I can take twenty percent off the total.",
      explanation:
        "라켓 4개 72달러와 셔틀콕 2통 18달러를 더하면 90달러이고, 커버는 사지 않았으므로 20퍼센트를 빼면 72달러이다. 따라서 답은 ①이다.",
      translation: [
        "W: 메이플 스포츠입니다. 오늘 무엇을 찾으세요?",
        "M: 배드민턴 라켓 네 개랑 셔틀콕 두 통 주세요.",
        "W: 라켓은 하나에 18달러, 한 통은 9달러입니다.",
        "M: 그럼 72달러에 18달러네요.",
        "W: 모두 90달러입니다. 라켓 커버도 하시겠어요?",
        "M: 커버는 얼마예요?",
        "W: 하나에 5달러라서 네 개면 20달러입니다.",
        "M: 커버는 이번엔 뺄게요.",
        "W: 괜찮습니다. 학교 동아리에서 쓰시는 건가요?",
        "M: 네, 여기 동아리 카드요.",
        "W: 그럼 전체 금액에서 20퍼센트를 빼 드릴게요.",
        "M: 좋네요. 카드로 낼게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 여자가 합창 대회에 못 나가는 이유를 고르시오.",
      lines: [
        ["M", "Sumin, your name isn't on the choir list for the contest."],
        ["W", "I had to pull out last Tuesday."],
        ["M", "Is your throat still sore from the cold?"],
        ["W", "That cleared up three weeks ago."],
        ["M", "Then is it the rehearsal schedule? It's four days a week."],
        ["W", "I could manage that. It's my brother's graduation."],
        ["M", "On the day of the contest?"],
        ["W", "The same morning, and it's in another city."],
        ["M", "So you'd never get back in time."],
        ["W", "Not even for the final piece. I told the teacher right away."],
      ],
      choices: [
        "목이 아파서",
        "연습 일정이 많아서",
        "동생 졸업식과 겹쳐서",
        "다른 대회에 나가서",
        "이사를 가서",
      ],
      answer: 3,
      clue: "I could manage that. It's my brother's graduation.",
      explanation:
        "목은 나았고 연습 일정도 감당할 수 있었지만, 대회 당일 아침에 다른 도시에서 동생의 졸업식이 있기 때문이다. 따라서 답은 ③이다.",
      translation: [
        "M: 수민아, 대회 합창단 명단에 네 이름이 없네.",
        "W: 지난 화요일에 빠지기로 했어.",
        "M: 감기 때문에 목이 아직 아파?",
        "W: 그건 3주 전에 나았어.",
        "M: 그럼 연습 일정 때문이야? 일주일에 나흘이잖아.",
        "W: 그건 할 수 있었어. 동생 졸업식 때문이야.",
        "M: 대회 날에?",
        "W: 같은 날 아침에, 다른 도시에서 해.",
        "M: 그럼 제때 못 돌아오겠네.",
        "W: 마지막 곡에도 못 맞춰. 선생님께 바로 말씀드렸어.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, Harbor Lights Festival에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["M", "Sumin, are you going to the Harbor Lights Festival?"],
        ["W", "I want to. When is it on?"],
        ["M", "The first weekend of December, Friday through Sunday."],
        ["W", "A three-day thing. Where does it take place?"],
        ["M", "Along the old pier, from the fish market to the lighthouse."],
        ["W", "That's a long stretch. What is there to see?"],
        ["M", "Light sculptures, a night market and a boat parade on Saturday."],
        ["W", "A boat parade sounds worth the trip. Is it free?"],
        ["M", "The whole thing is free. Only the food costs money."],
        ["W", "How do we get there? Parking must be impossible."],
        ["M", "They run extra buses from the station every fifteen minutes."],
        ["W", "Then let's go on Saturday evening."],
      ],
      choices: ["열리는 기간", "열리는 장소", "볼거리", "입장료", "주최 기관"],
      answer: 5,
      clue: "주최 기관은 대화에서 언급되지 않았다.",
      explanation:
        "기간(12월 첫째 주말 사흘), 장소(옛 부두), 볼거리(빛 조형물·야시장·배 행렬), 입장료(무료)는 언급되지만 주최 기관은 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 수민아, 하버라이츠 축제 갈 거야?",
        "W: 가고 싶어. 언제 해?",
        "M: 12월 첫째 주말, 금요일부터 일요일까지.",
        "W: 사흘이구나. 어디서 해?",
        "M: 옛 부두를 따라서, 어시장부터 등대까지.",
        "W: 꽤 긴데. 뭘 볼 수 있어?",
        "M: 빛 조형물, 야시장, 그리고 토요일에 배 행렬.",
        "W: 배 행렬은 가 볼 만하겠다. 무료야?",
        "M: 전부 무료야. 음식만 돈을 내.",
        "W: 거기 어떻게 가? 주차는 어려울 텐데.",
        "M: 역에서 15분마다 임시 버스를 운행해.",
        "W: 그럼 토요일 저녁에 가자.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Pinewood Youth Orchestra에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "W",
          "Let me tell you about the Pinewood Youth Orchestra. " +
            "It was founded in 1996 and now has about seventy members aged thirteen to nineteen. " +
            "Rehearsals are held every Saturday afternoon in the community hall. " +
            "New members join by audition, which is held twice a year, in March and September. " +
            "Instruments are not provided, so members must bring their own. " +
            "The orchestra gives four concerts a year, and all of them are free to attend. " +
            "Members pay a small monthly fee that covers sheet music and hall rental.",
        ],
      ],
      choices: [
        "1996년에 만들어졌다",
        "토요일 오후에 연습한다",
        "오디션은 일 년에 두 번 있다",
        "악기를 빌려준다",
        "연주회는 무료이다",
      ],
      answer: 4,
      clue: "Instruments are not provided, so members must bring their own.",
      explanation:
        "악기는 제공되지 않아 직접 가져와야 한다고 했으므로 악기를 빌려준다는 ④는 내용과 다르다. 따라서 답은 ④이다.",
      translation: [
        "W: 파인우드 청소년 오케스트라를 소개해 드리겠습니다. 1996년에 만들어졌고 지금은 열세 살부터 열아홉 살까지 일흔 명쯤이 활동합니다. 연습은 매주 토요일 오후에 주민 회관에서 합니다. 새 단원은 오디션으로 뽑는데, 3월과 9월 해마다 두 번 있습니다. 악기는 제공되지 않으니 단원이 직접 가져와야 합니다. 오케스트라는 해마다 네 번 연주회를 열고, 모두 무료로 볼 수 있습니다. 단원은 악보와 회관 대여료에 쓰이는 적은 월 회비를 냅니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 구입할 텐트를 고르시오.",
      lines: [
        ["M", "Sumin, let's choose a tent for the club camping trip."],
        ["W", "Five are listed. How many people have to fit?"],
        ["M", "Four, so anything smaller is out."],
        ["W", "Right. Does it need to be waterproof?"],
        ["M", "Definitely. It rained both nights last year."],
        ["W", "Agreed. And the budget? We raised two hundred thousand won."],
        ["M", "So two hundred thousand is the ceiling."],
        ["W", "Then only one tent fits all three."],
        ["M", "Let's order it before the trip next month."],
        ["W", "I'll place the order tonight."],
        ["M", "Send me the tracking number when it ships."],
        ["W", "Will do. It should arrive within a week."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "Four, so anything smaller is out.",
      explanation:
        "네 명 이상 들어가고, 방수가 되며, 20만 원 이하인 텐트를 고른다. 세 조건을 모두 채우는 것은 ③이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Capacity: 2 / Waterproof: Yes / Price: 90,000 won" },
          { no: 2, label: "②", value: "Capacity: 4 / Waterproof: No / Price: 120,000 won" },
          { no: 3, label: "③", value: "Capacity: 5 / Waterproof: Yes / Price: 185,000 won" },
          { no: 4, label: "④", value: "Capacity: 6 / Waterproof: Yes / Price: 260,000 won" },
          { no: 5, label: "⑤", value: "Capacity: 3 / Waterproof: Yes / Price: 110,000 won" },
        ],
      },
      translation: [
        "M: 수민아, 동아리 캠핑에 쓸 텐트 고르자.",
        "W: 다섯 개 있네. 몇 명이 들어가야 해?",
        "M: 네 명. 그보다 작은 건 빠져.",
        "W: 맞아. 방수는 돼야 해?",
        "M: 당연하지. 작년엔 이틀 밤 다 비가 왔어.",
        "W: 동의해. 예산은? 20만 원 모았잖아.",
        "M: 그럼 20만 원이 한계네.",
        "W: 그럼 세 조건 다 맞는 건 하나뿐이야.",
        "M: 다음 달 여행 전에 주문하자.",
        "W: 오늘 밤에 주문할게.",
        "M: 배송 시작되면 송장 번호 보내 줘.",
        "W: 그럴게. 일주일 안에 올 거야.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["W", "Minho, is the school bus running on the exam days?"],
        ["M", "It is, but on the shortened timetable."],
        ["W", "Shortened how? I finish at eleven."],
        ["M", "The last morning bus leaves at eleven thirty from the gym side."],
      ],
      choices: [
        "I never take the school bus.",
        "I'll catch the eleven thirty, then.",
        "My exam ends at four.",
        "The gym has no bus stop.",
        "I'll walk home instead.",
      ],
      answer: 2,
      clue: "The last morning bus leaves at eleven thirty from the gym side.",
      explanation:
        "남자가 마지막 오전 버스가 11시 30분에 떠난다고 알려 주었으므로, 그 버스를 타겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 민호야, 시험 날에 학교 버스 다녀?",
        "M: 다녀. 그런데 단축 시간표로.",
        "W: 어떻게 단축인데? 나는 11시에 끝나.",
        "M: 마지막 오전 버스가 체육관 쪽에서 11시 30분에 떠나.",
        "W: 그럼 11시 30분 버스 탈게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["M", "Sumin, I can't find the reading list for next week."],
        ["W", "Was it handed out on paper or posted online?"],
        ["M", "Online, I think. I looked but the page was empty."],
        ["W", "It's posted as a pinned comment, not as a file. Scroll to the top."],
      ],
      choices: [
        "I already read every book.",
        "There is no reading list.",
        "I'll ask for a paper copy.",
        "I'll scroll up and look.",
        "The page has no comments.",
      ],
      answer: 4,
      clue: "It's posted as a pinned comment, not as a file. Scroll to the top.",
      explanation:
        "여자가 고정 댓글로 올라와 있으니 위로 올려 보라고 했으므로, 올려서 보겠다는 ④가 가장 자연스럽다.",
      translation: [
        "M: 수민아, 다음 주 읽기 목록을 못 찾겠어.",
        "W: 종이로 나눠 줬어, 인터넷에 올렸어?",
        "M: 인터넷인 것 같은데. 봤는데 페이지가 비어 있었어.",
        "W: 파일이 아니라 고정 댓글로 올라와 있어. 맨 위로 올려 봐.",
        "M: 위로 올려서 볼게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Sumin, you've skipped the last three club performances."],
        ["W", "I go to the rehearsals. I just don't go on stage."],
        ["M", "Why not? You know the pieces better than anyone."],
        ["W", "Knowing them isn't the problem. My hands shake up there."],
        ["M", "Did they shake at the rehearsals?"],
        ["W", "A little, at the start, and then they stopped."],
        ["M", "So it goes away once you've been playing a while."],
        ["W", "In rehearsal, yes. On stage I never get that far."],
        ["M", "Because you leave before the shaking has time to stop."],
        ["W", "I hadn't put it together like that."],
        ["M", "Play the shortest piece on Friday and let it pass."],
      ],
      choices: [
        "I'll skip Friday as well.",
        "My hands never shake at all.",
        "I'll quit the club this term.",
        "Rehearsals are harder than concerts.",
        "I'll take the short piece on Friday.",
      ],
      answer: 5,
      clue: "Play the shortest piece on Friday and let it pass.",
      explanation:
        "남자가 금요일에 가장 짧은 곡을 연주하며 떨림이 지나가게 두라고 했으므로, 짧은 곡을 맡겠다는 ⑤가 가장 자연스럽다.",
      translation: [
        "M: 수민아, 동아리 공연을 세 번 연속 빠졌네.",
        "W: 연습에는 가. 무대에만 안 올라가는 거야.",
        "M: 왜? 곡은 네가 제일 잘 알잖아.",
        "W: 아는 건 문제가 아니야. 무대에 서면 손이 떨려.",
        "M: 연습 때도 떨렸어?",
        "W: 처음엔 조금. 그러다 멈췄어.",
        "M: 그럼 한동안 치다 보면 사라지는 거네.",
        "W: 연습 때는 그래. 무대에서는 거기까지 못 가.",
        "M: 떨림이 멈출 시간이 되기 전에 네가 내려오니까.",
        "W: 그렇게 이어서 생각해 본 적은 없어.",
        "M: 금요일엔 제일 짧은 곡을 치고 그 시간이 지나가게 둬.",
        "W: 금요일에 짧은 곡 맡을게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Minho, you've been buying lunch every day this month."],
        ["M", "Making it in the morning takes too long."],
        ["W", "How long does it actually take?"],
        ["M", "Fifteen minutes, maybe twenty with the washing up."],
        ["W", "And how much does buying lunch cost you a week?"],
        ["M", "About thirty-five thousand won, I think."],
        ["W", "So twenty minutes a day is costing you thirty-five thousand a week."],
        ["M", "When you put it in those numbers it sounds bad."],
        ["W", "Could you make it the night before instead?"],
        ["M", "I'm usually too tired by then."],
        ["W", "Make two at once on Sunday and see if it holds."],
      ],
      choices: [
        "I'll try making two this Sunday.",
        "I'll keep buying lunch anyway.",
        "I already bring lunch every day.",
        "Sundays are my busiest day.",
        "Lunch only costs a few thousand.",
      ],
      answer: 1,
      clue: "Make two at once on Sunday and see if it holds.",
      explanation:
        "여자가 일요일에 두 개를 한 번에 만들어 보라고 했으므로, 이번 일요일에 해 보겠다는 ①이 가장 자연스럽다.",
      translation: [
        "W: 민호야, 이번 달 내내 점심을 사 먹네.",
        "M: 아침에 싸면 너무 오래 걸려.",
        "W: 실제로 얼마나 걸리는데?",
        "M: 15분. 설거지까지 하면 20분쯤.",
        "W: 그럼 점심 사 먹는 데 일주일에 얼마 써?",
        "M: 3만 5천 원쯤 되는 것 같아.",
        "W: 그럼 하루 20분이 일주일에 3만 5천 원인 거네.",
        "M: 그렇게 숫자로 말하니까 안 좋게 들린다.",
        "W: 전날 밤에 만들어 두면 안 돼?",
        "M: 그 시간엔 보통 너무 피곤해.",
        "W: 일요일에 두 개를 한 번에 만들어 보고 되는지 봐.",
        "M: 이번 일요일에 두 개 만들어 볼게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Dabin이 Woosung에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Dabin : ________________",
      lines: [
        [
          "W",
          "Dabin and Woosung are putting up posters for the school blood drive. " +
            "They made forty posters together and have been putting them up all afternoon. " +
            "Woosung has been working quickly and has already covered three hallways. " +
            "Dabin notices that he is taping the posters at his own eye level, " +
            "which is well above the eye level of most first-year students, " +
            "and that several posters sit above the row of lockers where nobody looks. " +
            "The drive only works if students actually read the date and the sign-up link. " +
            "There are still fifteen posters left and plenty of tape. " +
            "She wants to tell him to put the rest lower, at the height people actually look. " +
            "In this situation, what would Dabin most likely say to Woosung?",
        ],
      ],
      choices: [
        "We should print twenty more posters tonight.",
        "Let's put the rest lower, where people actually look.",
        "Let's use a different color of tape.",
        "We should move the blood drive to next month.",
        "Let's take all the posters down again.",
      ],
      answer: 2,
      clue: "She wants to tell him to put the rest lower, at the height people actually look.",
      explanation:
        "다빈이는 남은 포스터를 사람들이 실제로 보는 높이에 붙이자고 말하려 하므로 ②가 가장 적절하다.",
      translation: [
        "W: 다빈이와 우성이는 교내 헌혈 행사 포스터를 붙이고 있습니다. 둘이 포스터 마흔 장을 만들었고 오후 내내 붙이고 있습니다. 우성이는 빠르게 움직여 벌써 복도 세 곳을 끝냈습니다. 다빈이는 우성이가 포스터를 자기 눈높이에 붙이고 있다는 것을 알아챕니다. 그 높이는 1학년 학생 대부분의 눈높이보다 한참 위이고, 몇 장은 아무도 보지 않는 사물함 줄 위쪽에 붙어 있습니다. 이 행사는 학생들이 날짜와 신청 주소를 실제로 읽어야 굴러갑니다. 아직 포스터가 열다섯 장 남았고 테이프도 넉넉합니다. 다빈이는 남은 것은 사람들이 실제로 보는 높이에 더 낮게 붙이자고 말하고 싶습니다. 이런 상황에서 다빈이가 우성이에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 남자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Hello, everyone. Today I want to talk about why the same room can feel loud or quiet " +
            "even when the noise level has not changed. " +
            "Walk into an empty apartment and clap once. " +
            "The sound bounces off bare walls and floors and comes back several times. " +
            "Put in a rug, a sofa and curtains, and clap again. " +
            "The clap dies almost immediately. " +
            "What changed is not how much sound was made but how long it survived. " +
            "Hard flat surfaces reflect sound; soft uneven ones absorb it. " +
            "This is why a library with carpet feels calm while a cafeteria with tile feels chaotic, " +
            "and why restaurants with concrete floors force everyone to raise their voice, " +
            "which makes the room louder still.",
        ],
      ],
      choices: [
        "how surfaces decide whether a room feels loud",
        "why libraries have rules about talking",
        "how sound travels through open windows",
        "why carpets are cheaper than tile floors",
        "how the human ear measures loudness",
      ],
      answer: 1,
      clue: "Hard flat surfaces reflect sound; soft uneven ones absorb it.",
      explanation:
        "남자는 단단한 면은 소리를 반사하고 부드러운 면은 흡수한다며, 그래서 같은 소음에도 방이 시끄럽게 느껴진다고 설명한다. 따라서 답은 ①이다.",
      translation: [
        "M: 안녕하세요, 여러분. 오늘은 소음 크기가 달라지지 않았는데도 같은 방이 왜 시끄럽게도 조용하게도 느껴지는지 이야기하려 합니다. 빈 아파트에 들어가 손뼉을 한 번 쳐 보세요. 소리가 맨벽과 맨바닥에 부딪혀 여러 번 되돌아옵니다. 깔개와 소파, 커튼을 들여놓고 다시 쳐 보세요. 손뼉 소리가 거의 곧바로 죽습니다. 달라진 것은 소리가 얼마나 났느냐가 아니라 얼마나 오래 살아남았느냐입니다. 단단하고 평평한 면은 소리를 되쏘고, 부드럽고 울퉁불퉁한 면은 소리를 빨아들입니다. 그래서 양탄자가 깔린 도서관은 차분하게 느껴지고 타일이 깔린 급식실은 어수선하게 느껴집니다. 콘크리트 바닥의 식당에서는 모두가 목소리를 높이게 되고, 그러면 그 방은 더 시끄러워집니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 내용이 아닌 것은?",
      lines: [
        ["M", "Hello, everyone. Today I want to talk about why the same room can feel loud or quiet even when the noise level has not changed."],
        ["M", "Walk into an empty apartment and clap once. The sound bounces off bare walls and floors and comes back several times."],
        ["M", "Put in a rug, a sofa and curtains, and clap again. The clap dies almost immediately."],
        ["M", "Hard flat surfaces reflect sound; soft uneven ones absorb it."],
        ["M", "This is why a library with carpet feels calm while a cafeteria with tile feels chaotic."],
        ["M", "and why restaurants with concrete floors force everyone to raise their voice."],
      ],
      choices: [
        "a clap echoing in an empty apartment",
        "a rug, a sofa and curtains absorbing sound",
        "a carpeted library feeling calm",
        "a tiled cafeteria feeling chaotic",
        "thick doors keeping noise out of a room",
      ],
      answer: 5,
      clue: "Put in a rug, a sofa and curtains, and clap again. The clap dies almost immediately.",
      explanation:
        "빈 아파트의 손뼉 울림, 깔개와 소파와 커튼이 소리를 빨아들이는 것, 양탄자 깔린 도서관, 타일 깔린 급식실은 언급되지만 두꺼운 문이 소음을 막는다는 것은 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
