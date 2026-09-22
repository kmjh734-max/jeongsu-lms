/** 고1 듣기 17회 — 사람이 직접 쓴 회차 (2026-09-21) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고1 17회",
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
          "Good afternoon, everyone. This is Mr. Noh from the first-year office. " +
            "I want to tell you about a change to the way we run the class library. " +
            "Until now, each class kept its own small shelf and borrowed only from it. " +
            "From next Monday all twelve classes share one list, and any book can be sent to any room. " +
            "You search the list on the school page, press the button, and the book comes to your classroom the next morning. " +
            "The class helper collects the books at lunch and takes them round after the fifth period. " +
            "Return the book to your own class shelf when you finish; it will find its way back. " +
            "The list opens tomorrow at nine. Please have a look before Monday. Thank you.",
        ],
      ],
      choices: [
        "학급 문고에 책을 기증해 달라고 하려고",
        "학급 문고를 함께 쓰는 방식이 바뀐 것을 안내하려고",
        "도서 반납을 독촉하려고",
        "독서 행사 참가를 권하려고",
        "학급 도우미를 모집하려고",
      ],
      answer: 2,
      clue: "From next Monday all twelve classes share one list, and any book can be sent to any room.",
      explanation:
        "다음 주 월요일부터 열두 반이 하나의 목록을 함께 쓰고 책을 교실로 보내 주는 방식으로 바뀐다는 것을 알리고 있다. 따라서 말의 목적은 ②이다.",
      translation: [
        "M: 여러분, 안녕하세요. 1학년부 노 선생님입니다. " +
          "학급 문고를 운영하는 방식이 달라지는 것을 알려 드리려 합니다. " +
          "지금까지는 반마다 작은 책꽂이를 두고 거기서만 빌렸습니다. " +
          "다음 주 월요일부터는 열두 반이 목록 하나를 함께 쓰고, 어떤 책이든 어느 교실로든 보낼 수 있습니다. " +
          "학교 누리집에서 목록을 찾아 단추를 누르면 다음 날 아침에 책이 교실로 옵니다. " +
          "학급 도우미가 점심시간에 책을 모아 5교시 뒤에 돌립니다. " +
          "다 읽으면 자기 반 책꽂이에 꽂아 두세요. 알아서 제자리를 찾아갑니다. " +
          "목록은 내일 9시에 열립니다. 월요일 전에 한 번 살펴봐 주세요. 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 여자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Hayoon, why do you always sit in the front row in the lab?"],
        ["W", "Because I can see what the teacher's hands are doing."],
        ["M", "You can see the board from anywhere, though."],
        ["W", "The board, yes. The hands, no."],
        ["M", "Does that really matter?"],
        ["W", "In chemistry it's everything. How she holds the tube, how slowly she pours."],
        ["M", "I've been copying the board and missing all of that."],
        ["W", "So did I last year, and then my own experiments kept failing."],
        ["M", "And now?"],
        ["W", "Now I watch first and write afterwards. The board is still there at the end."],
        ["M", "Then I'll move up next week."],
      ],
      choices: [
        "실험은 조를 짜서 해야 한다",
        "실험 수업에서는 필기보다 교사의 동작을 보아야 한다",
        "실험 전에 안전 규칙을 익혀야 한다",
        "노트는 수업이 끝난 뒤 정리해야 한다",
        "질문은 수업 중에 바로 해야 한다",
      ],
      answer: 2,
      clue: "Now I watch first and write afterwards. The board is still there at the end.",
      explanation:
        "여자는 화학 실험에서는 칠판을 옮겨 적기보다 교사의 손동작을 보아야 한다고 말한다. 따라서 답은 ②이다.",
      translation: [
        "M: 하윤아, 왜 실험실에서 늘 맨 앞줄에 앉아?",
        "W: 선생님 손이 뭘 하는지 볼 수 있으니까.",
        "M: 칠판은 어디서든 보이잖아.",
        "W: 칠판은 그렇지. 손은 아니야.",
        "M: 그게 그렇게 중요해?",
        "W: 화학에서는 전부야. 시험관을 어떻게 잡는지, 얼마나 천천히 붓는지.",
        "M: 나는 칠판만 옮겨 적느라 그걸 다 놓쳤네.",
        "W: 나도 작년에 그랬어. 그러다 내 실험이 계속 실패했고.",
        "M: 지금은?",
        "W: 지금은 먼저 보고 나중에 적어. 칠판은 끝날 때까지 그대로 있잖아.",
        "M: 그럼 다음 주에는 앞으로 옮겨야겠다.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "When a plan fails, we usually blame the person who was supposed to carry it out. " +
            "Sometimes that is fair. More often the plan asked for a kind of person nobody is. " +
            "It assumed you would never be tired, never be interrupted, never lose ten minutes to a bus. " +
            "A plan built for a perfect day breaks on the first ordinary one. " +
            "Leave a gap in it on purpose, one you expect to waste. " +
            "A plan that survives a bad Tuesday is worth more than one that only works in your head.",
        ],
      ],
      choices: [
        "계획은 다른 사람과 공유해야 한다",
        "목표는 높게 잡을수록 좋다",
        "계획에는 어긋날 여유를 미리 넣어 두어야 한다",
        "실패의 원인을 스스로 찾아야 한다",
        "계획은 아침에 세우는 것이 좋다",
      ],
      answer: 3,
      clue: "A plan that survives a bad Tuesday is worth more than one that only works in your head.",
      explanation:
        "완벽한 하루를 전제로 한 계획은 평범한 하루에 무너지므로 어긋날 여유를 미리 넣어 두어야 한다는 내용이다. 따라서 요지는 ③이다.",
      translation: [
        "W: 계획이 실패하면 우리는 보통 그것을 실행하기로 한 사람을 탓합니다. " +
          "그것이 온당할 때도 있습니다. 그러나 더 흔하게는 계획이 아무도 아닌 사람을 요구했던 것입니다. " +
          "결코 피곤하지 않고, 방해받지 않고, 버스에 10분을 잃지 않는 사람 말입니다. " +
          "완벽한 하루를 위해 만든 계획은 첫 번째 평범한 하루에 무너집니다. " +
          "일부러 빈틈을 남겨 두세요. 낭비할 것이라고 예상하는 빈틈을요. " +
          "형편없는 화요일을 버텨 내는 계획이, 머릿속에서만 굴러가는 계획보다 값집니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["W", "Seungho, the school health room looks much brighter in this photo."],
        ["M", "We repainted it during the holiday. What do you notice first?"],
        ["W", "The round clock high on the back wall."],
        ["M", "We moved it up so it's visible from the bed."],
        ["W", "On the left there's a cabinet with three drawers."],
        ["M", "Bandages, medicine, and forms. One drawer each."],
        ["W", "In the middle there's a single bed with a folded blanket on it."],
        ["M", "Students can rest there for twenty minutes at a time."],
        ["W", "By the window on the right, is that a small fridge?"],
        ["M", "No, it's a water dispenser. The fridge is in the staff room."],
        ["W", "I see. And next to the door there's a tall weighing scale."],
        ["M", "We check heights and weights there every spring."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "No, it's a water dispenser. The fridge is in the staff room.",
      explanation:
        "남자는 창가에 있는 것이 작은 냉장고가 아니라 정수기라고 바로잡는다. 그림에는 냉장고가 그려져 있으므로 ④가 대화와 일치하지 않는다.",
      figure: {
        kind: "labeled",
        scene:
          "A school health room seen from the front, five things clearly separated and none overlapping, clean black line art, no writing anywhere. " +
          "High on the back wall: a ROUND wall clock. " +
          "Left wall: a cabinet with exactly THREE drawers, one above the other, each with a small handle. " +
          "Centre of the room: a SINGLE BED with a folded blanket lying on it. " +
          "By the window on the right: a SMALL FRIDGE, a low box-shaped fridge with one door and a handle. " +
          "Next to the door on the far right: a tall standing WEIGHING SCALE with a height bar rising from its platform.",
      },
      translation: [
        "W: 승호야, 사진 보니 보건실이 훨씬 밝아졌다.",
        "M: 방학 동안 다시 칠했어. 뭐가 먼저 보여?",
        "W: 뒷벽 높은 곳에 있는 둥근 시계.",
        "M: 침대에서도 보이라고 위로 옮겼어.",
        "W: 왼쪽에는 서랍이 세 개인 수납장이 있고.",
        "M: 붕대, 약, 서류. 서랍마다 하나씩이야.",
        "W: 가운데에는 담요가 개어져 있는 일인용 침대가 있네.",
        "M: 학생들이 한 번에 20분씩 쉴 수 있어.",
        "W: 오른쪽 창가에 있는 건 작은 냉장고야?",
        "M: 아니, 정수기야. 냉장고는 교무실에 있어.",
        "W: 그렇구나. 그리고 문 옆에는 키 큰 체중계가 있고.",
        "M: 봄마다 거기서 키와 몸무게를 재.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 여자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Chaeyeon, the club open day is on Friday and something still bothers me."],
        ["W", "I thought the booth and the posters were finished."],
        ["M", "They are. It's the demonstration at three o'clock."],
        ["W", "The experiment with the balloons?"],
        ["M", "Yes. We've only ever done it on a desk indoors."],
        ["W", "And the booth is outside, in the wind."],
        ["M", "Exactly. If it fails in front of forty people, that's our whole day."],
        ["W", "Then we should try it outside before Friday."],
        ["M", "Could you run it on the playground tomorrow after school?"],
        ["W", "I'll test it three times and write down what changes."],
        ["M", "Thanks. Then I'll sort out the table and the handouts."],
      ],
      choices: [
        "포스터를 다시 만들기",
        "실험을 야외에서 미리 해 보기",
        "유인물을 인쇄하기",
        "부스를 예약하기",
        "부원들에게 연락하기",
      ],
      answer: 2,
      clue: "I'll test it three times and write down what changes.",
      explanation:
        "여자는 내일 방과 후에 운동장에서 실험을 세 번 해 보고 달라지는 점을 적기로 한다. 따라서 답은 ②이다.",
      translation: [
        "M: 채연아, 동아리 개방일이 금요일인데 아직 마음에 걸리는 게 있어.",
        "W: 부스랑 포스터는 다 끝난 줄 알았는데.",
        "M: 그건 됐어. 3시에 하는 시연이 문제야.",
        "W: 풍선으로 하는 실험?",
        "M: 응. 우리는 실내 책상에서만 해 봤잖아.",
        "W: 그런데 부스는 밖이고 바람도 불고.",
        "M: 그렇지. 40명 앞에서 실패하면 하루를 날리는 거야.",
        "W: 그럼 금요일 전에 밖에서 해 봐야겠다.",
        "M: 내일 방과 후에 운동장에서 해 볼 수 있어?",
        "W: 세 번 해 보고 뭐가 달라지는지 적어 둘게.",
        "M: 고마워. 그럼 나는 탁자랑 유인물을 챙길게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 남자가 지불할 금액을 고르시오.",
      lines: [
        ["W", "Welcome to the garden centre. What are you looking for today?"],
        ["M", "I need some small plants for our classroom window."],
        ["W", "These little pots are seven dollars each."],
        ["M", "I'll take five of them, one for each window."],
        ["W", "Five pots, thirty-five dollars."],
        ["M", "Do you sell the soil separately?"],
        ["W", "We do. A bag of soil is eight dollars."],
        ["M", "One bag should be enough for five pots."],
        ["W", "It will be. And school orders get ten percent off the plants."],
        ["M", "That helps. Can I carry them out today?"],
        ["W", "Of course, they're light."],
        ["M", "Great. I'll pay by card."],
      ],
      choices: ["$35.00", "$38.50", "$39.50", "$41.50", "$43.00"],
      answer: 3,
      clue: "It will be. And school orders get ten percent off the plants.",
      explanation:
        "화분 7달러짜리 다섯 개는 35달러이고, 학교 주문 10퍼센트 할인을 받으면 31.50달러이다. 흙 한 포대 8달러를 더하면 39.50달러이므로 답은 ③이다.",
      translation: [
        "W: 원예점입니다. 오늘은 무엇을 찾으세요?",
        "M: 교실 창가에 놓을 작은 식물이 필요해요.",
        "W: 이 작은 화분은 하나에 7달러입니다.",
        "M: 창문마다 하나씩, 다섯 개 할게요.",
        "W: 화분 다섯 개면 35달러입니다.",
        "M: 흙은 따로 파나요?",
        "W: 팝니다. 흙 한 포대에 8달러입니다.",
        "M: 다섯 화분이면 한 포대면 충분하겠네요.",
        "W: 충분합니다. 그리고 학교 주문은 식물 값에서 10퍼센트 할인됩니다.",
        "M: 도움이 되네요. 오늘 들고 가도 되나요?",
        "W: 그럼요, 가볍습니다.",
        "M: 좋아요. 카드로 결제할게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 여자가 공연 연습에 참여하지 못하는 이유를 고르시오.",
      lines: [
        ["M", "Soyeon, you weren't at rehearsal again yesterday."],
        ["W", "I know. I can't come on Wednesdays anymore."],
        ["M", "Is it your academy?"],
        ["W", "No, I moved that to Friday last month."],
        ["M", "Then what changed?"],
        ["W", "My little sister broke her leg, so I pick her up from school now."],
        ["M", "Every day?"],
        ["W", "Until the cast comes off. My parents both work until seven."],
        ["M", "That explains it. How long will that be?"],
        ["W", "Four more weeks. I'll be back after that."],
      ],
      choices: [
        "동생을 데리러 가야 해서",
        "학원 수업이 있어서",
        "몸이 아파서",
        "시험 준비를 해야 해서",
        "가족 여행을 가서",
      ],
      answer: 1,
      clue: "My little sister broke her leg, so I pick her up from school now.",
      explanation:
        "여동생이 다리를 다쳐 여자가 학교에서 동생을 데리러 가야 한다. 따라서 답은 ①이다.",
      translation: [
        "M: 소연아, 어제도 연습에 안 왔더라.",
        "W: 알아. 이제 수요일에는 못 가.",
        "M: 학원 때문이야?",
        "W: 아니, 지난달에 금요일로 옮겼어.",
        "M: 그럼 뭐가 달라진 건데?",
        "W: 여동생이 다리가 부러져서 이제 내가 학교에서 데려와.",
        "M: 매일?",
        "W: 깁스 풀 때까지. 부모님 두 분 다 7시까지 일하셔.",
        "M: 그래서였구나. 얼마나 더 해야 해?",
        "W: 4주 더. 그 뒤에는 돌아올게.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 교내 학급 신문 공모에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["W", "Minjun, have you seen the notice about the class newspaper contest?"],
        ["M", "I saw the title but nothing else."],
        ["W", "Each class makes one newspaper and hands it in by the eighteenth."],
        ["M", "The eighteenth. How long does it have to be?"],
        ["W", "Four pages, and at least one page has to be about our own class."],
        ["M", "Can we print it in colour?"],
        ["W", "Black and white only. The school pays for the printing."],
        ["M", "Who decides the winner?"],
        ["W", "All the students vote in the last week of the month."],
        ["M", "Then I'll tell our class president today."],
        ["W", "Do that. Only nine classes entered last year."],
      ],
      choices: ["제출 마감일", "분량", "인쇄 방식", "심사 방법", "시상 내용"],
      answer: 5,
      clue: "All the students vote in the last week of the month.",
      explanation:
        "마감일(18일), 분량(4쪽), 인쇄 방식(흑백), 심사 방법(전교생 투표)은 언급되지만 시상 내용은 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 민준아, 학급 신문 공모 공지 봤어?",
        "M: 제목만 봤어.",
        "W: 반마다 신문을 한 부 만들어서 18일까지 내는 거야.",
        "M: 18일이구나. 분량은 얼마나 돼야 해?",
        "W: 4쪽, 적어도 한 쪽은 우리 반 이야기여야 해.",
        "M: 컬러로 인쇄해도 돼?",
        "W: 흑백만. 인쇄비는 학교에서 내 줘.",
        "M: 누가 심사해?",
        "W: 이달 마지막 주에 전교생이 투표해.",
        "M: 그럼 오늘 우리 반장한테 말해야겠다.",
        "W: 그래. 작년에는 아홉 반만 냈어.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Dalbit Night Market에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "M",
          "Here is what you should know about the Dalbit Night Market by the river. " +
            "It opens every Friday and Saturday evening from six until eleven, from April to October. " +
            "There are about sixty stalls, and more than half of them sell food. " +
            "Entry is free, and the city runs an extra bus from the station every twenty minutes. " +
            "Dogs are welcome, but they must be on a lead the whole time. " +
            "The stalls take cards as well as cash, so you do not need to bring money. " +
            "Come early if you want a seat by the water.",
        ],
      ],
      choices: [
        "4월부터 10월까지 연다",
        "금요일과 토요일 저녁에 열린다",
        "입장료가 없다",
        "반려견은 데려올 수 없다",
        "카드로 결제할 수 있다",
      ],
      answer: 4,
      clue: "Dogs are welcome, but they must be on a lead the whole time.",
      explanation:
        "반려견은 줄을 매면 데려올 수 있다고 했으므로 데려올 수 없다는 ④가 내용과 일치하지 않는다.",
      translation: [
        "M: 강가에서 열리는 Dalbit Night Market에 관해 알아 두실 내용입니다. " +
          "4월부터 10월까지 금요일과 토요일 저녁 6시부터 11시까지 엽니다. " +
          "가판이 예순 개쯤 있고 그중 절반이 넘는 곳이 음식을 팝니다. " +
          "입장료는 없고, 시에서 역에서 20분마다 임시 버스를 운행합니다. " +
          "반려견도 올 수 있지만 내내 줄을 매고 있어야 합니다. " +
          "가판에서는 현금뿐 아니라 카드도 받으니 돈을 챙겨 오지 않아도 됩니다. " +
          "물가 자리에 앉고 싶으면 일찍 오세요.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 신청할 주말 강좌를 고르시오.",
      lines: [
        ["W", "Dohyun, these are the five weekend courses left at the youth centre."],
        ["M", "Let's pick one. I can't do anything on Saturday mornings."],
        ["W", "Right, your volunteering. That takes out one of them."],
        ["M", "Next, how many weeks do they run? I can't manage more than six."],
        ["W", "Then one more is gone. Three are left."],
        ["M", "What do they cost?"],
        ["W", "We said sixty thousand won at the most."],
        ["M", "Then one more drops out. Two left."],
        ["W", "Do they both give a certificate? You wanted that for your record."],
        ["M", "Only one does, I think."],
        ["W", "Then that settles it. I'll register us both tonight."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 5,
      clue: "Then that settles it. I'll register us both tonight.",
      explanation:
        "토요일 오전인 ①, 8주인 ②, 7만 원인 ③을 뺀다. 남은 ④와 ⑤ 중 수료증을 주는 곳은 ⑤이므로 답은 ⑤이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "토요일 오전 / 6주 / 50,000원 / 수료증 있음" },
          { no: 2, label: "②", value: "일요일 오후 / 8주 / 55,000원 / 수료증 있음" },
          { no: 3, label: "③", value: "일요일 오전 / 6주 / 70,000원 / 수료증 있음" },
          { no: 4, label: "④", value: "토요일 오후 / 5주 / 45,000원 / 수료증 없음" },
          { no: 5, label: "⑤", value: "일요일 오후 / 6주 / 60,000원 / 수료증 있음" },
        ],
      },
      translation: [
        "W: 도현아, 청소년센터에 남은 주말 강좌가 이 다섯 개야.",
        "M: 하나 고르자. 나는 토요일 오전에는 아무것도 못 해.",
        "W: 맞다, 봉사 있지. 그럼 하나가 빠지네.",
        "M: 다음으로 몇 주짜리야? 6주 넘으면 못 해.",
        "W: 그럼 하나 더 빠진다. 세 개 남았어.",
        "M: 수강료는?",
        "W: 6만 원까지로 정했잖아.",
        "M: 그럼 하나 더 빠지고 둘 남았다.",
        "W: 둘 다 수료증 줘? 생활기록부에 넣고 싶다고 했잖아.",
        "M: 한 곳만 주는 것 같은데.",
        "W: 그럼 정해졌네. 오늘 밤에 둘 다 신청할게.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Did you sign up for the mock exam on Saturday?"],
        ["W", "Not yet. The online form kept giving me an error."],
        ["M", "Did you try a different browser?"],
        ["W", "I didn't think of that."],
        ["M", "It only works properly on the school computers or in Chrome."],
      ],
      choices: [
        "The exam starts at nine.",
        "Then I'll try it in Chrome tonight.",
        "I took one last month too.",
        "My laptop is quite old.",
        "You should sign up as well.",
      ],
      answer: 2,
      clue: "It only works properly on the school computers or in Chrome.",
      explanation:
        "크롬에서만 제대로 된다는 말을 들었으므로, 오늘 밤에 크롬으로 해 보겠다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 토요일 모의고사 신청했어?",
        "W: 아직. 온라인 신청서에서 계속 오류가 나.",
        "M: 다른 브라우저로 해 봤어?",
        "W: 그 생각을 못 했어.",
        "M: 학교 컴퓨터나 크롬에서만 제대로 돼.",
        "W: 그럼 오늘 밤에 크롬으로 해 볼게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "You've been squinting at the board all morning."],
        ["M", "My seat is at the back and the letters are blurry."],
        ["W", "Have you had your eyes checked?"],
        ["M", "Not since middle school."],
        ["W", "The health room does free eye tests every Thursday."],
      ],
      choices: [
        "I usually sit in the second row.",
        "The board is too shiny in the morning.",
        "Then I'll go there this Thursday.",
        "My glasses broke last year.",
        "You should move seats too.",
      ],
      answer: 3,
      clue: "The health room does free eye tests every Thursday.",
      explanation:
        "보건실에서 목요일마다 무료 시력 검사를 한다는 말을 들었으므로, 이번 목요일에 가겠다는 ③이 가장 자연스럽다.",
      translation: [
        "W: 오전 내내 칠판을 찡그리고 보네.",
        "M: 자리가 뒤쪽이라 글자가 흐릿해.",
        "W: 시력 검사는 받아 봤어?",
        "M: 중학교 때 이후로 안 받았어.",
        "W: 보건실에서 목요일마다 무료로 시력 검사를 해 줘.",
        "M: 그럼 이번 목요일에 가 볼게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Junhyuk, how is the school band doing before the festival?"],
        ["M", "We practise three times a week, but the songs never get better."],
        ["W", "Never? What do you do in a practice?"],
        ["M", "We play all five songs from start to finish, twice."],
        ["W", "And when something goes wrong in the middle of a song?"],
        ["M", "We keep going. Stopping feels like giving up."],
        ["W", "So the broken parts get played badly ten times a week."],
        ["M", "I've never thought about it that way."],
        ["W", "Stop at the mistake, play those four bars slowly, then carry on."],
      ],
      choices: [
        "Then we'll stop and fix the hard bars tomorrow.",
        "We have five songs to prepare.",
        "The festival is in two weeks.",
        "I'd rather practise on my own.",
        "Our drummer joined in September.",
      ],
      answer: 1,
      clue: "Stop at the mistake, play those four bars slowly, then carry on.",
      explanation:
        "틀린 지점에서 멈추고 그 부분을 천천히 연습하라는 조언을 들었으므로, 내일 그렇게 하겠다는 ①이 가장 자연스럽다.",
      translation: [
        "W: 준혁아, 축제 앞두고 밴드는 잘돼 가?",
        "M: 일주일에 세 번 연습하는데 곡이 나아지지를 않아.",
        "W: 전혀? 연습 때 뭘 하는데?",
        "M: 다섯 곡을 처음부터 끝까지 두 번 연주해.",
        "W: 곡 중간에 뭔가 틀리면?",
        "M: 그냥 계속 가. 멈추면 포기하는 것 같아서.",
        "W: 그럼 틀리는 부분을 일주일에 열 번씩 틀린 채로 연주하는 거네.",
        "M: 그렇게는 생각 못 했어.",
        "W: 틀린 데서 멈추고 그 네 마디를 천천히 친 다음에 이어 가 봐.",
        "M: 그럼 내일은 멈춰서 어려운 마디를 고쳐 볼게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Nayeon, you've been carrying two full folders around all term."],
        ["W", "Every handout from every subject since March."],
        ["M", "Do you use the old ones?"],
        ["W", "Almost never, but I'm afraid to leave anything at home."],
        ["M", "What happens when you need one?"],
        ["W", "I go through both folders for five minutes and usually give up."],
        ["M", "So carrying them doesn't actually help you find them."],
        ["W", "When you say it like that, no."],
        ["M", "Keep this month's handouts in the folder and file the rest at home."],
      ],
      choices: [
        "Then I'll take the old ones home tonight.",
        "My folders are almost full.",
        "I started collecting them in March.",
        "The handouts are all A4 size.",
        "I'd rather buy a bigger bag.",
      ],
      answer: 1,
      clue: "Keep this month's handouts in the folder and file the rest at home.",
      explanation:
        "이번 달 것만 들고 다니고 나머지는 집에 정리해 두라는 조언을 들었으므로, 오늘 밤에 예전 것을 집에 가져다 두겠다는 ①이 가장 자연스럽다.",
      translation: [
        "M: 나연아, 이번 학기 내내 서류철 두 개를 꽉 채워서 들고 다니네.",
        "W: 3월부터 모든 과목 유인물을 다 모았어.",
        "M: 예전 것도 써?",
        "W: 거의 안 써. 그런데 집에 두고 오는 게 불안해.",
        "M: 필요할 때는 어떻게 해?",
        "W: 5분 동안 두 철을 뒤지다가 대개 포기해.",
        "M: 그럼 들고 다녀도 찾는 데 도움이 안 되는 거네.",
        "W: 그렇게 말하니 그러네.",
        "M: 이번 달 유인물만 철에 두고 나머지는 집에 정리해 둬.",
        "W: 그럼 오늘 밤에 예전 것들을 집에 가져다 둘게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Yerin이 Dohun에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Yerin : ________________",
      lines: [
        [
          "W",
          "Yerin and Dohun are on the same school quiz team. " +
            "Dohun reads more widely than anyone else and remembers almost everything he reads. " +
            "In practice rounds, however, he answers each question with three or four sentences. " +
            "The rules give five seconds for an answer, and twice last week the buzzer cut him off mid-sentence. " +
            "Yerin does not think he should read less; his knowledge is why the team reaches the final. " +
            "The trouble is that an answer nobody hears the end of scores nothing. " +
            "The city round is in eight days, and the timing there is stricter still. " +
            "She wants to tell him to say the answer first and explain only if asked. " +
            "In this situation, what would Yerin most likely say to Dohun?",
        ],
      ],
      choices: [
        "Say the answer first and explain only if they ask.",
        "Try reading a little less before the contest.",
        "I think someone else should answer the history questions.",
        "You should speak more loudly during the round.",
        "Let's withdraw from the city round this year.",
      ],
      answer: 1,
      clue: "She wants to tell him to say the answer first and explain only if asked.",
      explanation:
        "예린은 도훈의 독서량을 문제 삼지 않으면서, 답을 먼저 말하고 설명은 요청받을 때만 하라고 말하려 한다. 따라서 ①이 가장 적절하다.",
      translation: [
        "W: 예린과 도훈은 같은 학교 퀴즈 팀입니다. " +
          "도훈은 누구보다 폭넓게 읽고 읽은 것을 거의 다 기억합니다. " +
          "그런데 연습 경기에서 문제마다 서너 문장으로 답합니다. " +
          "규칙은 답에 5초를 주는데, 지난주에 두 번이나 문장 도중에 버저가 울렸습니다. " +
          "예린은 도훈이 덜 읽어야 한다고 생각하지 않습니다. 그 지식 덕분에 팀이 결승에 갑니다. " +
          "문제는 끝을 아무도 듣지 못한 답은 점수가 되지 않는다는 점입니다. " +
          "시 대회는 여드레 뒤이고, 거기서는 시간이 더 엄격합니다. " +
          "그래서 답을 먼저 말하고 설명은 요청받을 때만 하라고 말하고 싶습니다. " +
          "이런 상황에서 예린이 도훈에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "여자가 하는 말의 주제로 가장 적절한 것은?",
      lines: [
        ["W", "Good afternoon. Today I want to talk about animals that carry their homes with them."],
        ["W", "Most animals build a shelter and stay near it, which ties them to one place."],
        ["W", "A snail grows its shell from its own body, adding a new ring at the opening as it gets bigger."],
        ["W", "The hermit crab does the opposite: it borrows an empty shell and swaps it for a larger one as it grows."],
        ["W", "A caddisfly larva glues sand and small sticks around itself and drags that tube along the riverbed."],
        ["W", "The tortoise carries a shell that is part of its skeleton, so it can never leave it behind."],
        ["W", "Each of these solves the same problem in a different way: safety without a fixed address."],
        ["W", "The cost is weight, and every one of them moves slowly because of it."],
      ],
      choices: [
        "how animals find their way home",
        "animals that carry their shelter with them",
        "why some animals live alone",
        "how shells are formed in the sea",
        "why slow animals live longer",
      ],
      answer: 2,
      clue: "Each of these solves the same problem in a different way: safety without a fixed address.",
      explanation:
        "여자는 달팽이, 소라게, 날도래 애벌레, 거북이 저마다 다른 방법으로 집을 지고 다닌다고 설명한다. 따라서 주제는 ②이다.",
      translation: [
        "W: 안녕하세요. 오늘은 집을 지고 다니는 동물에 대해 이야기하려 합니다.",
        "W: 대부분의 동물은 은신처를 짓고 그 근처에 머무는데, 그러면 한곳에 묶이게 됩니다.",
        "W: 달팽이는 제 몸에서 껍데기를 만들어, 자라면서 입구 쪽에 새 테를 하나씩 덧붙입니다.",
        "W: 소라게는 반대입니다. 빈 껍데기를 빌려 쓰다가 자라면 더 큰 것으로 바꿉니다.",
        "W: 날도래 애벌레는 모래와 작은 나뭇가지를 제 몸에 붙여 만든 관을 강바닥에서 끌고 다닙니다.",
        "W: 거북의 등딱지는 뼈대의 일부라서 결코 벗어 둘 수 없습니다.",
        "W: 이들은 같은 문제를 저마다 다른 방식으로 풉니다. 주소 없이 안전을 얻는 문제 말입니다.",
        "W: 그 대가는 무게이고, 그래서 이들은 하나같이 느리게 움직입니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 동물이 아닌 것은?",
      lines: [
        ["W", "Good afternoon. Today I want to talk about animals that carry their homes with them."],
        ["W", "Most animals build a shelter and stay near it, which ties them to one place."],
        ["W", "A snail grows its shell from its own body, adding a new ring at the opening as it gets bigger."],
        ["W", "The hermit crab does the opposite: it borrows an empty shell and swaps it for a larger one as it grows."],
        ["W", "A caddisfly larva glues sand and small sticks around itself and drags that tube along the riverbed."],
        ["W", "The tortoise carries a shell that is part of its skeleton, so it can never leave it behind."],
        ["W", "Each of these solves the same problem in a different way: safety without a fixed address."],
        ["W", "The cost is weight, and every one of them moves slowly because of it."],
      ],
      choices: ["snail", "hermit crab", "caddisfly larva", "tortoise", "spider"],
      answer: 5,
      clue: "The tortoise carries a shell that is part of its skeleton, so it can never leave it behind.",
      explanation:
        "달팽이, 소라게, 날도래 애벌레, 거북은 언급되지만 거미는 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
