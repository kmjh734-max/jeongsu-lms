/** 고2 듣기 15회 — 사람이 직접 쓴 회차 (2026-09-21) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고2 15회",
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
          "Good morning, everyone. This is Mr. Jang from the second-year office. " +
            "I want to explain one change to the way we run the monthly class meeting. " +
            "Until now the class president decided the topics on the morning of the meeting. " +
            "From next month, anyone in the class may add a topic to a shared page during the week before. " +
            "Each topic needs one line saying what should be decided, not just a subject name. " +
            "The page closes at six on the evening before, and the president simply reads what is on it. " +
            "Nothing else about the meeting changes; it is still thirty minutes on the first Thursday. " +
            "The link is on your classroom notice board. Please have a look today. Thank you.",
        ],
      ],
      choices: [
        "학급 회의 날짜가 바뀐 것을 알리려고",
        "학급 회의 안건을 정하는 방법이 바뀐 것을 안내하려고",
        "학급 임원 선거를 안내하려고",
        "회의 시간을 줄이겠다고 알리려고",
        "회의 참석을 당부하려고",
      ],
      answer: 2,
      clue: "From next month, anyone in the class may add a topic to a shared page during the week before.",
      explanation:
        "다음 달부터 학급 회의 안건을 누구나 공유 문서에 미리 올리는 방식으로 바뀐다는 것을 알리고 있다. 따라서 말의 목적은 ②이다.",
      translation: [
        "M: 여러분, 안녕하세요. 2학년부 장 선생님입니다. " +
          "매달 여는 학급 회의 운영 방식에서 한 가지 달라지는 점을 설명하겠습니다. " +
          "지금까지는 회의 당일 아침에 반장이 안건을 정했습니다. " +
          "다음 달부터는 회의 전 한 주 동안 반 누구나 공유 문서에 안건을 올릴 수 있습니다. " +
          "안건마다 무엇을 정해야 하는지 한 줄로 적어야 합니다. 주제 이름만 적으면 안 됩니다. " +
          "문서는 회의 전날 저녁 6시에 닫히고, 반장은 거기 적힌 대로 읽기만 합니다. " +
          "그 밖에는 달라지는 것이 없습니다. 첫째 목요일 30분 그대로입니다. " +
          "주소는 교실 게시판에 붙어 있습니다. 오늘 한 번 확인해 주세요. 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 여자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Seoyeon, are you still writing everything by hand?"],
        ["W", "For the first draft, yes. I type the second one."],
        ["M", "Typing is three times faster, though."],
        ["W", "That's exactly why I don't start there."],
        ["M", "You want to be slow?"],
        ["W", "When I type, I write the first sentence that arrives and keep going."],
        ["M", "And by hand?"],
        ["W", "My hand can't keep up, so I finish the thought before I start the sentence."],
        ["M", "So the slowness does the thinking for you."],
        ["W", "It makes me choose. A typed page is longer and says less."],
        ["M", "Then I'll write my outline by hand this time."],
      ],
      choices: [
        "글은 여러 번 고쳐 써야 한다",
        "초고는 손으로 쓰는 것이 생각을 정리하는 데 낫다",
        "글쓰기는 매일 조금씩 해야 한다",
        "긴 글보다 짧은 글이 좋다",
        "글을 쓰기 전에 자료를 많이 모아야 한다",
      ],
      answer: 2,
      clue: "It makes me choose. A typed page is longer and says less.",
      explanation:
        "여자는 손으로 쓰면 속도가 느려 생각을 마친 뒤에 문장을 시작하게 된다며 초고는 손으로 쓰는 편이 낫다고 말한다. 따라서 답은 ②이다.",
      translation: [
        "M: 서연아, 아직도 전부 손으로 써?",
        "W: 초고는 그래. 두 번째는 타자로 쳐.",
        "M: 타자가 세 배는 빠른데.",
        "W: 그래서 거기서 시작하지 않는 거야.",
        "M: 느린 게 좋다고?",
        "W: 타자를 치면 떠오르는 첫 문장을 그대로 쓰고 계속 나아가게 돼.",
        "M: 손으로 쓰면?",
        "W: 손이 못 따라가니까 문장을 시작하기 전에 생각을 끝내게 돼.",
        "M: 느림이 대신 생각을 해 주는 셈이네.",
        "W: 고르게 만들어 줘. 타자로 친 쪽은 더 길고 말하는 건 더 적어.",
        "M: 그럼 이번에는 개요를 손으로 써 봐야겠다.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "When a group finishes a project, it reviews what went wrong and almost never what went right. " +
            "That seems sensible, because problems ask to be fixed. " +
            "But the parts that worked also worked for a reason, and nobody wrote that reason down. " +
            "So the next project repeats the fix and loses the thing that was already good. " +
            "Spend five minutes on the question nobody asks: why did this part go smoothly? " +
            "You will usually find one small habit that somebody invented without noticing. " +
            "Keeping it costs nothing; rediscovering it costs another whole project.",
        ],
      ],
      choices: [
        "문제점은 빨리 고쳐야 한다",
        "모둠 활동은 역할을 나누어야 한다",
        "잘된 부분도 왜 잘됐는지 남겨 두어야 한다",
        "계획은 구체적으로 세워야 한다",
        "평가는 여러 사람이 함께 해야 한다",
      ],
      answer: 3,
      clue: "Keeping it costs nothing; rediscovering it costs another whole project.",
      explanation:
        "잘못된 점만 돌아보면 잘된 부분이 왜 잘됐는지 잃어버리므로 그것도 기록해 두어야 한다는 내용이다. 따라서 요지는 ③이다.",
      translation: [
        "W: 모둠이 과제를 끝내면 잘못된 점은 돌아보지만 잘된 점은 거의 돌아보지 않습니다. " +
          "문제는 고쳐 달라고 손을 들기 때문에 그럴듯해 보입니다. " +
          "그러나 잘된 부분에도 잘된 이유가 있었고, 아무도 그 이유를 적어 두지 않았습니다. " +
          "그래서 다음 과제에서는 고친 점만 되풀이하고 이미 좋았던 것을 잃습니다. " +
          "아무도 묻지 않는 질문에 5분만 써 보세요. 이 부분은 왜 매끄러웠는가? " +
          "대개 누군가 모르는 사이에 만들어 낸 작은 습관 하나가 나옵니다. " +
          "그것을 지키는 데는 값이 들지 않지만, 다시 찾아내려면 과제 하나를 더 써야 합니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["W", "Junyoung, the new school shop looks much tidier in this picture."],
        ["M", "We rearranged it over the holiday. What do you notice?"],
        ["W", "The wide sign board above the counter on the back wall."],
        ["M", "We keep the day's notices there instead of taping them to the glass."],
        ["W", "On the left there's a shelf with four boxes of stationery."],
        ["M", "Pencils, erasers, glue, and tape. One box each."],
        ["W", "In the middle there's a round table with three stools."],
        ["M", "Students eat their bread there instead of standing in the corridor."],
        ["W", "By the window on the right, is that a drinks fridge?"],
        ["M", "No, it's a bookcase. The fridge didn't fit through the door."],
        ["W", "I see. And next to the entrance there's a tall plant."],
        ["M", "A parent brought it on the day we opened."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "No, it's a bookcase. The fridge didn't fit through the door.",
      explanation:
        "남자는 창가에 있는 것이 음료 냉장고가 아니라 책장이라고 바로잡는다. 그림에는 냉장고가 그려져 있으므로 ④가 대화와 일치하지 않는다.",
      figure: {
        kind: "labeled",
        scene:
          "A small school shop seen from the front, five things clearly separated and none overlapping, clean black line art, no writing anywhere. " +
          "High on the back wall above the counter: one WIDE blank sign board with no letters on it. " +
          "Left wall: a shelf holding exactly FOUR open boxes of stationery in one row. " +
          "Centre of the room: a ROUND table with exactly THREE round stools around it. " +
          "By the window on the right: a tall DRINKS FRIDGE with a glass door and bottles standing on its shelves. " +
          "Next to the entrance on the far right: one tall potted plant in a large pot.",
      },
      translation: [
        "W: 준영아, 사진 보니 새 매점이 훨씬 깔끔해졌다.",
        "M: 방학 동안 자리를 바꿨어. 뭐가 눈에 들어와?",
        "W: 뒷벽 계산대 위에 있는 넓은 안내판.",
        "M: 유리에 붙이지 않고 그날 공지를 거기에 올려 둬.",
        "W: 왼쪽에는 문구 상자가 네 개 있는 선반이 있고.",
        "M: 연필, 지우개, 풀, 테이프. 상자마다 하나씩이야.",
        "W: 가운데에는 둥근 탁자와 의자 세 개가 있네.",
        "M: 복도에 서서 먹지 말고 거기서 빵을 먹으라고.",
        "W: 오른쪽 창가에 있는 건 음료 냉장고야?",
        "M: 아니, 책장이야. 냉장고는 문으로 안 들어갔어.",
        "W: 그렇구나. 그리고 입구 옆에는 키 큰 화분이 있고.",
        "M: 문 여는 날 학부모님이 가져다주셨어.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 여자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Chaewon, the class trip report has to be in by Friday."],
        ["W", "I thought we sent the draft on Monday."],
        ["M", "We did, and the teacher sent it back this morning."],
        ["W", "What did she ask for?"],
        ["M", "The costs section. It lists totals but not what each item was."],
        ["W", "So she wants the bus, the entrance fees, and the meals separately."],
        ["M", "Exactly, with the receipts matched to each line."],
        ["W", "I have all the receipts in the folder in my locker."],
        ["M", "Could you break the costs down and add the numbers?"],
        ["W", "I'll do it during my free period and send it to you by four."],
        ["M", "Thanks. Then I'll fix the photos and hand the whole thing in."],
      ],
      choices: [
        "사진을 고르기",
        "보고서를 제출하기",
        "선생님께 여쭤보기",
        "영수증을 새로 받기",
        "비용을 항목별로 나누어 정리하기",
      ],
      answer: 5,
      clue: "I'll do it during my free period and send it to you by four.",
      explanation:
        "여자는 공강 시간에 비용을 항목별로 나누어 정리해 보내기로 한다. 제출은 남자가 맡았다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 채원아, 현장학습 보고서를 금요일까지 내야 해.",
        "W: 월요일에 초안 보낸 줄 알았는데.",
        "M: 보냈지, 그런데 오늘 아침에 선생님이 돌려보내셨어.",
        "W: 뭘 요청하셨는데?",
        "M: 비용 부분. 합계만 있고 항목이 뭔지가 없대.",
        "W: 그러니까 버스, 입장료, 식사를 따로 적으라는 거지.",
        "M: 그래, 영수증도 줄마다 맞춰서.",
        "W: 영수증은 내 사물함 서류철에 다 있어.",
        "M: 비용을 항목별로 나눠서 숫자를 채워 줄 수 있어?",
        "W: 공강 시간에 해서 4시까지 보낼게.",
        "M: 고마워. 그럼 나는 사진을 고치고 전체를 제출할게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 남자가 지불할 금액을 고르시오.",
      lines: [
        ["W", "Welcome to the art supply shop. What are you looking for?"],
        ["M", "I need sketchbooks for our art club."],
        ["W", "These A4 sketchbooks are nine dollars each."],
        ["M", "I'll take six of them."],
        ["W", "Six. That comes to fifty-four dollars."],
        ["M", "Do you have pencil sets too?"],
        ["W", "We do. A set of twelve is fourteen dollars."],
        ["M", "Just one set, please."],
        ["W", "All right. And club orders get ten percent off the sketchbooks."],
        ["M", "That's kind of you. Can I carry them today?"],
        ["W", "They're heavy, but yes."],
        ["M", "Then I'll pay now, by card."],
      ],
      choices: ["$54.60", "$61.20", "$62.60", "$66.80", "$68.00"],
      answer: 3,
      clue: "All right. And club orders get ten percent off the sketchbooks.",
      explanation:
        "스케치북 9달러짜리 여섯 권은 54달러이고, 10퍼센트 할인을 받으면 48.60달러이다. 연필 세트 14달러를 더하면 62.60달러이므로 답은 ③이다.",
      translation: [
        "W: 화방입니다. 무엇을 찾으세요?",
        "M: 미술 동아리에서 쓸 스케치북이 필요해요.",
        "W: 이 A4 스케치북은 한 권에 9달러입니다.",
        "M: 여섯 권 할게요.",
        "W: 여섯 권이면 54달러입니다.",
        "M: 연필 세트도 있나요?",
        "W: 있습니다. 열두 자루 한 세트에 14달러입니다.",
        "M: 한 세트만 주세요.",
        "W: 알겠습니다. 그리고 동아리 주문은 스케치북 값에서 10퍼센트 할인됩니다.",
        "M: 감사합니다. 오늘 들고 가도 될까요?",
        "W: 무겁긴 한데 괜찮습니다.",
        "M: 그럼 지금 카드로 결제할게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 여자가 방송부를 그만두려는 이유를 고르시오.",
      lines: [
        ["M", "Naeun, is it true that you're leaving the broadcasting club?"],
        ["W", "It is. I told the teacher yesterday."],
        ["M", "Is it because of the early mornings?"],
        ["W", "No, seven thirty was never the problem."],
        ["M", "Then why? You've been there since first year."],
        ["W", "I got into the city orchestra, and they rehearse three evenings a week."],
        ["M", "Three evenings? That's a lot."],
        ["W", "It is, and the broadcasting club meets on two of those."],
        ["M", "So there's no way to do both."],
        ["W", "None. I'd rather leave properly than keep missing meetings."],
      ],
      choices: [
        "아침 일찍 나오기 힘들어서",
        "성적이 떨어져서",
        "부원들과 사이가 좋지 않아서",
        "전학을 가게 되어서",
        "다른 활동과 시간이 겹쳐서",
      ],
      answer: 5,
      clue: "It is, and the broadcasting club meets on two of those.",
      explanation:
        "시 관현악단 연습이 일주일에 세 번 저녁에 있고 그중 두 번이 방송부 모임과 겹친다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 나은아, 방송부 그만둔다는 게 사실이야?",
        "W: 맞아. 어제 선생님께 말씀드렸어.",
        "M: 아침 일찍 나오는 게 힘들어서?",
        "W: 아니, 7시 30분은 문제가 아니었어.",
        "M: 그럼 왜? 1학년 때부터 했잖아.",
        "W: 시 관현악단에 들어갔는데 일주일에 세 번 저녁에 연습해.",
        "M: 저녁 세 번? 많다.",
        "W: 많지, 그중 두 번이 방송부 모임이랑 겹쳐.",
        "M: 그럼 둘 다 할 방법이 없네.",
        "W: 없어. 계속 빠지느니 제대로 그만두는 게 나아.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 교내 수학 경시대회에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["W", "Dohyun, are you taking the school maths competition?"],
        ["M", "I'd like to, but I only saw the poster from across the hall."],
        ["W", "It's on the fifth of next month, during the fourth and fifth periods."],
        ["M", "Two periods. How many questions are there?"],
        ["W", "Twenty, and the last five are worth double."],
        ["M", "Is it open to everyone?"],
        ["W", "First and second years. Third years have their own paper in March."],
        ["M", "And how do we sign up?"],
        ["W", "Write your name on the sheet outside the maths office by Friday."],
        ["M", "Then I'll go down at lunch."],
        ["W", "Do. Only twenty-five can take it."],
      ],
      choices: ["시행 날짜", "문항 수", "참가 학년", "신청 방법", "시상 내용"],
      answer: 5,
      clue: "Write your name on the sheet outside the maths office by Friday.",
      explanation:
        "날짜(다음 달 5일), 문항 수(20문항), 참가 학년(1·2학년), 신청 방법(수학 교무실 앞 명단)은 언급되지만 시상 내용은 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 도현아, 교내 수학 경시대회 볼 거야?",
        "M: 보고 싶은데 복도 건너에서 포스터만 봤어.",
        "W: 다음 달 5일, 4교시랑 5교시에 해.",
        "M: 두 시간이구나. 문제는 몇 개야?",
        "W: 스무 개, 마지막 다섯 개는 배점이 두 배야.",
        "M: 누구나 볼 수 있어?",
        "W: 1학년과 2학년. 3학년은 3월에 따로 봐.",
        "M: 신청은 어떻게 해?",
        "W: 금요일까지 수학 교무실 앞 명단에 이름을 적으면 돼.",
        "M: 그럼 점심시간에 내려가야겠다.",
        "W: 그래. 스물다섯 명만 볼 수 있어.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Saturday Repair Café에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "M",
          "Here is what you should know about the Saturday Repair Café at the community centre. " +
            "It is held on the second Saturday of every month, from ten in the morning until four. " +
            "Volunteers help you mend small things: lamps, chairs, bags, and clothes. " +
            "The service is free, but you pay for any parts that have to be replaced. " +
            "You are asked to stay and work with the volunteer rather than leave the item behind. " +
            "Large appliances such as refrigerators cannot be brought in, because there is no space. " +
            "Come early; last month the list was full by eleven.",
        ],
      ],
      choices: [
        "매달 둘째 토요일에 열린다",
        "작은 물건을 고치는 것을 도와준다",
        "부품값은 따로 내야 한다",
        "물건을 맡기고 가면 된다",
        "큰 가전제품은 가져올 수 없다",
      ],
      answer: 4,
      clue: "You are asked to stay and work with the volunteer rather than leave the item behind.",
      explanation:
        "물건을 맡기고 가는 것이 아니라 자원봉사자와 함께 남아서 고쳐야 한다고 했다. 따라서 ④가 내용과 일치하지 않는다.",
      translation: [
        "M: 주민센터에서 하는 Saturday Repair Café에 관해 알아 두실 내용입니다. " +
          "매달 둘째 토요일 아침 10시부터 오후 4시까지 열립니다. " +
          "자원봉사자들이 등, 의자, 가방, 옷 같은 작은 물건 고치는 일을 도와줍니다. " +
          "서비스는 무료이지만 갈아 끼워야 하는 부품값은 내셔야 합니다. " +
          "물건을 맡기고 가시는 것이 아니라 자원봉사자와 함께 남아서 고치셔야 합니다. " +
          "냉장고 같은 큰 가전제품은 자리가 없어 가져오실 수 없습니다. " +
          "일찍 오세요. 지난달에는 11시면 접수가 다 찼습니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 예약할 합주실을 고르시오.",
      lines: [
        ["W", "Minjae, these are the five practice rooms free on Saturday."],
        ["M", "Let's pick one. There are six of us with instruments."],
        ["W", "Then the four-person room is out. That's one gone."],
        ["M", "Next, we need a drum kit. Carrying ours is impossible."],
        ["W", "One doesn't have a kit, so that's out as well."],
        ["M", "Three left. What do they cost per hour?"],
        ["W", "We agreed on twenty thousand won an hour at the most."],
        ["M", "Then one more is gone. Two are left."],
        ["W", "Do they both open in the evening? We can't start before six."],
        ["M", "Only one does. The other closes at five."],
        ["W", "Then that settles it. I'll book three hours tonight."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "Then that settles it. I'll book three hours tonight.",
      explanation:
        "4인실인 ①, 드럼이 없는 ②, 시간당 25,000원인 ③을 뺀다. 남은 ④와 ⑤ 중 저녁까지 여는 곳은 ④이므로 답은 ④이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "4인 / 드럼 있음 / 15,000원 / 밤 10시까지" },
          { no: 2, label: "②", value: "8인 / 드럼 없음 / 16,000원 / 밤 10시까지" },
          { no: 3, label: "③", value: "6인 / 드럼 있음 / 25,000원 / 밤 10시까지" },
          { no: 4, label: "④", value: "8인 / 드럼 있음 / 20,000원 / 밤 10시까지" },
          { no: 5, label: "⑤", value: "6인 / 드럼 있음 / 18,000원 / 오후 5시까지" },
        ],
      },
      translation: [
        "W: 민재야, 토요일에 비어 있는 합주실이 이 다섯 곳이야.",
        "M: 하나 고르자. 악기 드는 사람이 여섯 명이야.",
        "W: 그럼 4인실은 빠지네. 하나 빠졌어.",
        "M: 다음으로 드럼이 있어야 해. 우리 걸 들고 가는 건 무리야.",
        "W: 한 곳은 드럼이 없으니 그것도 빠져.",
        "M: 셋 남았다. 시간당 얼마야?",
        "W: 시간당 2만 원까지로 정했잖아.",
        "M: 그럼 하나 더 빠진다. 둘 남았어.",
        "W: 둘 다 저녁에 열어? 우리는 6시 전에는 못 시작해.",
        "M: 한 곳만 열어. 다른 곳은 5시에 닫아.",
        "W: 그럼 정해졌네. 오늘 밤에 세 시간 예약할게.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Have you handed in the club activity record yet?"],
        ["M", "Not yet. I can't find last term's photos."],
        ["W", "Weren't they uploaded to the club album?"],
        ["M", "I didn't know there was an album."],
        ["W", "Everything from March is in it."],
      ],
      choices: [
        "The record is due next Friday.",
        "I took most of those photos myself.",
        "Then I'll look through the album tonight.",
        "Our club has fourteen members.",
        "You should write the record instead.",
      ],
      answer: 3,
      clue: "Everything from March is in it.",
      explanation:
        "3월부터의 자료가 동아리 앨범에 다 있다는 말을 들었으므로, 오늘 밤에 앨범을 살펴보겠다는 ③이 가장 자연스럽다.",
      translation: [
        "W: 동아리 활동 기록 냈어?",
        "M: 아직. 지난 학기 사진을 못 찾겠어.",
        "W: 동아리 앨범에 올려 두지 않았어?",
        "M: 앨범이 있는 줄 몰랐어.",
        "W: 3월부터 전부 거기 있어.",
        "M: 그럼 오늘 밤에 앨범을 살펴볼게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "You've been standing in the corridor between every class."],
        ["W", "My classroom gets too warm in the afternoon."],
        ["M", "Can't you open a window?"],
        ["W", "They're painted shut on our side."],
        ["M", "Tell the caretaker. He opened ours in one morning."],
      ],
      choices: [
        "Then I'll ask him about it tomorrow.",
        "Our classroom is on the third floor.",
        "I'd rather sit by the door.",
        "The corridor is cooler anyway.",
        "You should tell your teacher too.",
      ],
      answer: 1,
      clue: "Tell the caretaker. He opened ours in one morning.",
      explanation:
        "관리인에게 말하면 하루 만에 창문을 열어 준다는 말을 들었으므로, 내일 물어보겠다는 ①이 가장 자연스럽다.",
      translation: [
        "M: 쉬는 시간마다 복도에 서 있네.",
        "W: 우리 교실이 오후에 너무 더워져.",
        "M: 창문을 열면 안 돼?",
        "W: 우리 쪽은 페인트가 굳어서 안 열려.",
        "M: 관리인 선생님께 말씀드려. 우리 교실은 하루 만에 열어 주셨어.",
        "W: 그럼 내일 여쭤볼게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Suhyeon, how is the school garden club doing this term?"],
        ["W", "The plants are fine. It's the watering rota that keeps failing."],
        ["M", "Failing how?"],
        ["W", "Six of us signed up, and the same two people do it every week."],
        ["M", "Do the other four know which day is theirs?"],
        ["W", "I wrote the rota on the club room whiteboard in March."],
        ["M", "And nobody has looked at it since March."],
        ["W", "Probably not. Nobody goes into the club room on their watering day."],
        ["M", "So the rota lives in the one room they don't visit."],
        ["W", "When you say it like that, it sounds obvious."],
        ["M", "Send each person their own day in a message and see what changes."],
      ],
      choices: [
        "We water them three times a week.",
        "Then I'll message each person their day tonight.",
        "The garden is behind the science building.",
        "I'll do all the watering myself this month.",
        "Our club started two years ago.",
      ],
      answer: 2,
      clue: "Send each person their own day in a message and see what changes.",
      explanation:
        "각자에게 자기 담당 요일을 메시지로 보내 보라는 조언을 들었으므로, 오늘 밤에 그렇게 하겠다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 수현아, 이번 학기 텃밭 동아리는 잘돼 가?",
        "W: 식물은 괜찮아. 물 주는 당번이 자꾸 어그러져.",
        "M: 어떻게 어그러지는데?",
        "W: 여섯 명이 신청했는데 매주 같은 두 명만 해.",
        "M: 나머지 넷은 자기 요일을 알아?",
        "W: 3월에 동아리방 화이트보드에 당번표를 적어 뒀어.",
        "M: 그리고 3월 이후로 아무도 안 봤겠네.",
        "W: 아마도. 물 주는 날에 동아리방에 들어가지는 않으니까.",
        "M: 그럼 당번표가 사람들이 안 가는 방에만 있는 거네.",
        "W: 그렇게 말하니 너무 당연하게 들린다.",
        "M: 각자에게 자기 요일을 메시지로 보내 보고 뭐가 달라지는지 봐.",
        "W: 그럼 오늘 밤에 한 사람씩 요일을 보낼게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Hyunjun, you've joined the morning running group, haven't you?"],
        ["M", "Three weeks now, but I'm slower than when I started."],
        ["W", "Slower? What does a session look like?"],
        ["M", "We run as a group, and I try to stay with the fastest two."],
        ["W", "The fastest two out of how many?"],
        ["M", "Eleven. They've been running for years."],
        ["W", "And how do you feel at the end?"],
        ["M", "Finished. I can barely walk home, and the next day I skip."],
        ["W", "So one hard morning costs you the next one."],
        ["M", "I hadn't put it together like that."],
        ["W", "Run with the middle group for two weeks and see where you are."],
      ],
      choices: [
        "Then I'll stay with the middle group from tomorrow.",
        "I run about five kilometres each time.",
        "The group meets at six in the morning.",
        "I'll try to catch the fastest two next week.",
        "My shoes are almost worn out.",
      ],
      answer: 1,
      clue: "Run with the middle group for two weeks and see where you are.",
      explanation:
        "2주 동안 중간 그룹과 달려 보라는 조언을 들었으므로, 내일부터 그렇게 하겠다는 ①이 가장 자연스럽다.",
      translation: [
        "W: 현준아, 아침 달리기 모임에 들어갔지?",
        "M: 3주째인데 시작할 때보다 더 느려졌어.",
        "W: 더 느려졌다고? 한 번 할 때 어떻게 해?",
        "M: 다 같이 달리는데, 나는 제일 빠른 두 명을 따라가려고 해.",
        "W: 몇 명 중에 제일 빠른 두 명인데?",
        "M: 열한 명. 그 둘은 몇 년째 달린 사람들이야.",
        "W: 끝나면 몸이 어때?",
        "M: 녹초야. 집까지 겨우 걸어가고 다음 날은 빠져.",
        "W: 그럼 힘든 하루가 다음 날 하루를 잡아먹는 거네.",
        "M: 그렇게 연결해서 생각은 못 했어.",
        "W: 2주만 중간 그룹이랑 달려 보고 어떤지 봐.",
        "M: 그럼 내일부터 중간 그룹에서 달릴게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Mr. Seo가 Dayeon에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Mr. Seo : ________________",
      lines: [
        [
          "M",
          "Mr. Seo runs the school orchestra, and Dayeon plays the first violin. " +
            "She practises more than anyone and knows her part note for note. " +
            "In rehearsal, however, she plays at full volume from the first bar to the last. " +
            "Because of that the flute solo in the middle cannot be heard from the back of the hall. " +
            "Mr. Seo does not want her to play more quietly all the time; her sound carries the whole section. " +
            "The trouble is that a piece where nothing is soft has nothing loud either. " +
            "The autumn concert is in two weeks, and the flute solo is the centre of the piece. " +
            "He wants to ask her to drop to a whisper for those sixteen bars only. " +
            "In this situation, what would Mr. Seo most likely say to Dayeon?",
        ],
      ],
      choices: [
        "Please play more quietly through the whole piece.",
        "Play as softly as you can during the flute solo.",
        "I think someone else should take the first violin.",
        "Try practising a little less before the concert.",
        "Let's take the flute solo out of the programme.",
      ],
      answer: 2,
      clue: "He wants to ask her to drop to a whisper for those sixteen bars only.",
      explanation:
        "서 선생님은 다연의 소리를 줄이라는 것이 아니라 플루트 독주 부분에서만 아주 작게 연주하라고 말하려 한다. 따라서 ②가 가장 적절하다.",
      translation: [
        "M: 서 선생님은 학교 관현악단을 맡고 있고, 다연은 제1바이올린을 켭니다. " +
          "다연은 누구보다 많이 연습하고 자기 파트를 음 하나까지 알고 있습니다. " +
          "그런데 연습 때 첫 마디부터 끝 마디까지 최대 음량으로 연주합니다. " +
          "그 때문에 가운데 플루트 독주가 강당 뒤쪽에서는 들리지 않습니다. " +
          "서 선생님은 다연이 내내 작게 연주하기를 바라지 않습니다. 그 소리가 파트 전체를 끌고 갑니다. " +
          "문제는 여린 부분이 없는 곡에는 센 부분도 없다는 점입니다. " +
          "가을 연주회는 2주 뒤이고, 플루트 독주가 그 곡의 중심입니다. " +
          "그래서 그 열여섯 마디에서만 아주 작게 연주해 달라고 부탁하고 싶습니다. " +
          "이런 상황에서 서 선생님이 다연에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "여자가 하는 말의 주제로 가장 적절한 것은?",
      lines: [
        ["W", "Good afternoon. Today I want to look at how buildings stay cool without electricity."],
        ["W", "Long before air conditioning, builders in hot places had to solve this with shape alone."],
        ["W", "In Iran, tall wind towers catch the breeze high above the street and send it down into the rooms."],
        ["W", "Thick mud walls do the opposite job: they absorb heat all day and release it slowly at night."],
        ["W", "In southern Spain, a narrow courtyard keeps a pool of cool air that the sun never reaches."],
        ["W", "Wooden lattice screens let air pass while blocking the light that would heat the floor."],
        ["W", "None of these needs power, and all of them are still standing where they were built."],
        ["W", "Modern architects are now copying them, not out of nostalgia, but because they work."],
      ],
      choices: [
        "old building methods that keep houses cool",
        "how air conditioning was invented",
        "why cities are hotter than the countryside",
        "how to choose materials for a new house",
        "why deserts are cold at night",
      ],
      answer: 1,
      clue: "None of these needs power, and all of them are still standing where they were built.",
      explanation:
        "여자는 바람탑, 두꺼운 흙벽, 좁은 안뜰, 나무 격자 가리개를 들며 전기 없이 집을 시원하게 하던 건축 방법을 설명한다. 따라서 주제는 ①이다.",
      translation: [
        "W: 안녕하세요. 오늘은 건물이 전기 없이 시원함을 유지하는 방법을 살펴보려 합니다.",
        "W: 에어컨이 있기 훨씬 전, 더운 지역의 건축가들은 이 문제를 모양만으로 풀어야 했습니다.",
        "W: 이란의 높은 바람탑은 거리 위쪽의 바람을 받아 방 안으로 내려보냅니다.",
        "W: 두꺼운 흙벽은 반대 일을 합니다. 낮 동안 열을 머금었다가 밤에 천천히 내놓습니다.",
        "W: 스페인 남부의 좁은 안뜰은 해가 닿지 않는 시원한 공기를 고여 두게 합니다.",
        "W: 나무 격자 가리개는 공기는 통과시키면서 바닥을 덥힐 빛은 막아 줍니다.",
        "W: 이 가운데 전기가 필요한 것은 하나도 없고, 모두 지어진 자리에 지금도 서 있습니다.",
        "W: 요즘 건축가들이 이것들을 다시 쓰는 이유는 향수가 아니라 실제로 효과가 있기 때문입니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 것이 아닌 것은?",
      lines: [
        ["W", "Good afternoon. Today I want to look at how buildings stay cool without electricity."],
        ["W", "Long before air conditioning, builders in hot places had to solve this with shape alone."],
        ["W", "In Iran, tall wind towers catch the breeze high above the street and send it down into the rooms."],
        ["W", "Thick mud walls do the opposite job: they absorb heat all day and release it slowly at night."],
        ["W", "In southern Spain, a narrow courtyard keeps a pool of cool air that the sun never reaches."],
        ["W", "Wooden lattice screens let air pass while blocking the light that would heat the floor."],
        ["W", "None of these needs power, and all of them are still standing where they were built."],
        ["W", "Modern architects are now copying them, not out of nostalgia, but because they work."],
      ],
      choices: ["wind towers", "thick mud walls", "narrow courtyards", "glass roofs", "wooden lattice screens"],
      answer: 4,
      clue: "Wooden lattice screens let air pass while blocking the light that would heat the floor.",
      explanation:
        "바람탑, 두꺼운 흙벽, 좁은 안뜰, 나무 격자 가리개는 언급되지만 유리 지붕은 언급되지 않았다. 따라서 답은 ④이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
