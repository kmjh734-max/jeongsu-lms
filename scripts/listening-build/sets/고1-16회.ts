/** 고1 듣기 16회 — 사람이 직접 쓴 회차 (2026-09-21) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고1 16회",
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
          "Good afternoon, students. This is Ms. Oh from the library. " +
            "I want to tell you about a change to the way you borrow books from next week. " +
            "Until now you had to bring your student card to the front desk and wait for a librarian. " +
            "From Monday there will be a self-check machine beside the entrance. " +
            "You put the book on the plate, tap your card, and the machine prints a slip with the return date. " +
            "The whole thing takes about twenty seconds, and the desk will be free for questions instead. " +
            "Books from the reference shelf still have to be borrowed at the desk, as before. " +
            "A short guide is posted beside the machine. Please read it once before you use it. Thank you.",
        ],
      ],
      choices: [
        "도서관 이용 시간이 바뀐 것을 알리려고",
        "책 대출 방법이 바뀐 것을 안내하려고",
        "연체된 책의 반납을 독촉하려고",
        "도서 기증을 부탁하려고",
        "사서 도우미를 모집하려고",
      ],
      answer: 2,
      clue: "From Monday there will be a self-check machine beside the entrance.",
      explanation:
        "다음 주부터 입구 옆 자동 대출기로 책을 빌리는 방식이 바뀐다는 것을 안내하고 있다. 따라서 말의 목적은 ②이다.",
      translation: [
        "W: 학생 여러분, 안녕하세요. 도서관 오 선생님입니다. " +
          "다음 주부터 책을 빌리는 방법이 바뀌는 것을 알려 드리려 합니다. " +
          "지금까지는 학생증을 들고 안내 데스크로 와서 사서를 기다려야 했습니다. " +
          "월요일부터는 입구 옆에 자동 대출기가 놓입니다. " +
          "책을 판에 올리고 학생증을 대면 기계가 반납일이 적힌 쪽지를 뽑아 줍니다. " +
          "전부 20초쯤 걸리고, 데스크는 대신 질문을 받는 자리로 씁니다. " +
          "참고 도서 서가의 책은 예전처럼 데스크에서 빌려야 합니다. " +
          "기계 옆에 짧은 안내문을 붙여 두었습니다. 쓰기 전에 한 번 읽어 주세요. 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 남자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Seunghyun, why are you copying the questions into your notebook?"],
        ["M", "Only the ones I got wrong. I write the question, not the answer."],
        ["W", "Isn't that slower? The answer is what you need to remember."],
        ["M", "That's what I used to think. Then I noticed something."],
        ["W", "What?"],
        ["M", "When I only wrote answers, I recognised them but couldn't produce them."],
        ["W", "Recognising is easier, of course."],
        ["M", "Right, and an exam never shows you the answer to recognise."],
        ["W", "So writing the question makes you solve it again later."],
        ["M", "Exactly. A notebook full of answers is a book I can already read."],
        ["W", "I'll try copying questions this weekend, then."],
      ],
      choices: [
        "오답은 바로 고쳐 써야 한다",
        "오답 정리는 답이 아니라 문제를 옮겨 적어야 한다",
        "공책은 과목마다 따로 써야 한다",
        "문제집은 한 권을 끝까지 풀어야 한다",
        "친구와 함께 공부하는 것이 좋다",
      ],
      answer: 2,
      clue: "Exactly. A notebook full of answers is a book I can already read.",
      explanation:
        "남자는 답만 적으면 알아보기만 할 뿐 스스로 풀지 못하므로 문제를 옮겨 적어야 한다고 말한다. 따라서 답은 ②이다.",
      translation: [
        "W: 승현아, 왜 문제를 공책에 옮겨 적어?",
        "M: 틀린 것만. 답이 아니라 문제를 적는 거야.",
        "W: 그게 더 느리지 않아? 기억해야 할 건 답이잖아.",
        "M: 나도 그렇게 생각했어. 그러다 하나 알게 됐어.",
        "W: 뭘?",
        "M: 답만 적었을 때는 보면 알겠는데 스스로는 못 만들어 내겠더라.",
        "W: 알아보는 게 당연히 쉽지.",
        "M: 그렇지, 그런데 시험은 알아볼 답을 보여 주지 않잖아.",
        "W: 그러니까 문제를 적어 두면 나중에 다시 풀게 되는구나.",
        "M: 그거야. 답으로 가득한 공책은 이미 읽을 수 있는 책일 뿐이야.",
        "W: 그럼 이번 주말에 문제를 옮겨 적어 봐야겠다.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "We tend to judge a piece of advice by how new it sounds. " +
            "If we have heard it before, we decide we already know it and move on. " +
            "But knowing a sentence and doing what it says are two different things. " +
            "Drink water. Sleep earlier. Start with the hard question. " +
            "Nobody needs these explained; almost nobody follows them. " +
            "The next time advice bores you, notice that boredom is not the same as having tried it. " +
            "Most of what would change your week is already sitting in things you stopped listening to.",
        ],
      ],
      choices: [
        "조언은 짧을수록 좋다",
        "새로운 방법을 계속 찾아야 한다",
        "이미 아는 조언이라도 실천했는지 따져 보아야 한다",
        "조언은 전문가에게 구해야 한다",
        "습관은 한 번에 하나씩 바꿔야 한다",
      ],
      answer: 3,
      clue: "The next time advice bores you, notice that boredom is not the same as having tried it.",
      explanation:
        "들어 본 조언이라고 안다고 넘기지 말고 실제로 해 보았는지 따져 보아야 한다는 내용이다. 따라서 요지는 ③이다.",
      translation: [
        "M: 우리는 조언을 얼마나 새롭게 들리느냐로 판단하는 경향이 있습니다. " +
          "전에 들어 본 것이면 이미 안다고 결론짓고 넘어갑니다. " +
          "그러나 문장을 아는 것과 그대로 하는 것은 다른 일입니다. " +
          "물을 마셔라. 일찍 자라. 어려운 문제부터 풀어라. " +
          "설명이 필요한 사람은 없지만 실천하는 사람도 거의 없습니다. " +
          "다음에 조언이 지루하게 느껴지면, 지루함이 해 봤다는 뜻은 아니라는 점을 알아채세요. " +
          "여러분의 한 주를 바꿀 것들은 대개 이미 듣기를 멈춘 말 속에 들어 있습니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["M", "Dain, the new music room looks great in this photo."],
        ["W", "Doesn't it? We finished moving in on Friday."],
        ["M", "On the back wall there's a round wall clock."],
        ["W", "We need it. Every practice is exactly fifty minutes."],
        ["M", "On the left I count three guitars hanging on the wall."],
        ["W", "Those belong to the school, so anyone can use them."],
        ["M", "In the middle there's an upright piano with a bench."],
        ["W", "It was tuned last week for the first time in years."],
        ["M", "By the window on the right, is that a music stand?"],
        ["W", "No, it's a floor lamp. The stands are all in the cupboard."],
        ["M", "I see. And next to the door there's a striped rug."],
        ["W", "We put it there so the door doesn't scratch the floor."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "No, it's a floor lamp. The stands are all in the cupboard.",
      explanation:
        "여자는 창가에 있는 것이 보면대가 아니라 스탠드 조명이라고 바로잡는다. 그림에는 보면대가 그려져 있으므로 ④가 대화와 일치하지 않는다.",
      figure: {
        kind: "labeled",
        scene:
          "A school music room seen from the front, five things clearly separated and none overlapping, clean black line art, no writing anywhere. " +
          "Centre of the back wall: a ROUND wall clock. " +
          "Left wall: exactly THREE guitars hanging side by side on wall hooks. " +
          "Centre of the room: an UPRIGHT PIANO with a bench in front of it. " +
          "By the window on the right: a MUSIC STAND, a thin tripod stand with a slanted rest on top. " +
          "Next to the door on the far right: a rectangular rug covered in bold STRIPES lying on the floor.",
      },
      translation: [
        "M: 다인아, 이 사진 보니 새 음악실이 참 좋다.",
        "W: 그렇지? 금요일에 다 옮겼어.",
        "M: 뒷벽에 둥근 시계가 있네.",
        "W: 꼭 필요해. 연습이 정확히 50분이거든.",
        "M: 왼쪽에는 기타가 세 대 걸려 있고.",
        "W: 학교 거라 누구나 쓸 수 있어.",
        "M: 가운데에는 의자가 놓인 업라이트 피아노가 있네.",
        "W: 몇 년 만에 지난주에 조율했어.",
        "M: 오른쪽 창가에 있는 건 보면대야?",
        "W: 아니, 스탠드 조명이야. 보면대는 다 수납장에 있어.",
        "M: 그렇구나. 그리고 문 옆에는 줄무늬 깔개가 있고.",
        "W: 문에 바닥이 긁히지 않게 거기 깔았어.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 남자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Taejun, the club recruitment booth is on Thursday and I need to check one thing."],
        ["M", "I thought the posters and the table were done."],
        ["W", "They are. It's the sign-up sheet that's the problem."],
        ["M", "What's wrong with it?"],
        ["W", "It asks for a phone number, and the office says we can't collect those anymore."],
        ["M", "Since when?"],
        ["W", "This term. We can only ask for a name and a class."],
        ["M", "So the whole sheet has to be redone before Thursday."],
        ["W", "Right, and I'm at the dentist all Wednesday afternoon."],
        ["M", "Then I'll make a new sheet tonight and print forty copies."],
        ["W", "Thank you. I'll bring the table and the posters in the morning."],
      ],
      choices: [
        "포스터 만들기",
        "탁자 옮기기",
        "신청서를 새로 만들어 인쇄하기",
        "행정실에 문의하기",
        "부원들에게 연락하기",
      ],
      answer: 3,
      clue: "Then I'll make a new sheet tonight and print forty copies.",
      explanation:
        "전화번호를 받을 수 없게 되어 남자가 신청서를 새로 만들어 40장 인쇄하기로 한다. 따라서 답은 ③이다.",
      translation: [
        "W: 태준아, 동아리 모집 부스가 목요일인데 하나 확인할 게 있어.",
        "M: 포스터랑 탁자는 다 된 줄 알았는데.",
        "W: 그건 됐어. 문제는 신청서야.",
        "M: 뭐가 잘못됐는데?",
        "W: 전화번호를 적게 돼 있는데, 행정실에서 이제 받으면 안 된대.",
        "M: 언제부터?",
        "W: 이번 학기부터. 이름이랑 반만 받을 수 있어.",
        "M: 그럼 목요일 전에 신청서를 다 새로 만들어야겠네.",
        "W: 그래, 그런데 나는 수요일 오후 내내 치과에 있어.",
        "M: 그럼 오늘 밤에 내가 새로 만들어서 40장 인쇄할게.",
        "W: 고마워. 탁자랑 포스터는 내가 아침에 가져갈게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 여자가 지불할 금액을 고르시오.",
      lines: [
        ["M", "Welcome to the sports shop. How can I help you?"],
        ["W", "I need two badminton rackets for our club."],
        ["M", "These are our school-level rackets, twenty-two dollars each."],
        ["W", "Two of those, then. That's forty-four dollars."],
        ["M", "That's right. Would you like a tube of shuttlecocks as well?"],
        ["W", "How much is one tube?"],
        ["M", "Twelve dollars for six shuttlecocks."],
        ["W", "Then one tube, please."],
        ["M", "All right. And we take five dollars off any order over fifty dollars."],
        ["W", "That's helpful. Can I take them now?"],
        ["M", "Of course, they're in stock."],
        ["W", "Great. I'll pay by card."],
      ],
      choices: ["$44", "$51", "$56", "$61", "$68"],
      answer: 2,
      clue: "All right. And we take five dollars off any order over fifty dollars.",
      explanation:
        "라켓 22달러짜리 두 개는 44달러, 셔틀콕 한 통 12달러를 더하면 56달러이다. 50달러가 넘어 5달러 할인을 받으면 51달러이므로 답은 ②이다.",
      translation: [
        "M: 스포츠용품점입니다. 무엇을 도와드릴까요?",
        "W: 동아리에서 쓸 배드민턴 라켓 두 개가 필요해요.",
        "M: 이건 학교용 라켓으로 하나에 22달러입니다.",
        "W: 그럼 두 개요. 44달러네요.",
        "M: 맞습니다. 셔틀콕 한 통도 하시겠어요?",
        "W: 한 통에 얼마예요?",
        "M: 여섯 개에 12달러입니다.",
        "W: 그럼 한 통 주세요.",
        "M: 알겠습니다. 그리고 50달러가 넘는 주문에는 5달러를 빼 드립니다.",
        "W: 좋네요. 지금 가져가도 되나요?",
        "M: 그럼요, 재고가 있습니다.",
        "W: 좋아요. 카드로 결제할게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 남자가 봉사 활동에 갈 수 없는 이유를 고르시오.",
      lines: [
        ["W", "Hyunwoo, are you coming to the river clean-up on Saturday?"],
        ["M", "I signed up, but I have to cancel."],
        ["W", "Is it your part-time job?"],
        ["M", "No, I finished that in August."],
        ["W", "Then what happened? You organised half of it."],
        ["M", "My younger sister's piano recital was moved to Saturday morning."],
        ["W", "Moved? I thought it was next month."],
        ["M", "The hall changed the date last week, and she's the first performer."],
        ["W", "Then of course you should go to that."],
        ["M", "I'll join the next one. I've already told the team leader."],
      ],
      choices: [
        "아르바이트를 해야 해서",
        "가족 행사에 가야 해서",
        "몸이 아파서",
        "시험 준비를 해야 해서",
        "다른 봉사와 겹쳐서",
      ],
      answer: 2,
      clue: "My younger sister's piano recital was moved to Saturday morning.",
      explanation:
        "여동생의 피아노 발표회가 토요일 아침으로 옮겨져 남자는 봉사 활동에 갈 수 없다. 따라서 답은 ②이다.",
      translation: [
        "W: 현우야, 토요일 강가 정화 활동 올 거야?",
        "M: 신청은 했는데 취소해야 해.",
        "W: 아르바이트 때문이야?",
        "M: 아니, 그건 8월에 끝냈어.",
        "W: 그럼 무슨 일이야? 네가 절반은 준비했잖아.",
        "M: 여동생 피아노 발표회가 토요일 아침으로 옮겨졌어.",
        "W: 옮겨졌다고? 다음 달인 줄 알았는데.",
        "M: 지난주에 공연장에서 날짜를 바꿨대. 동생이 첫 순서야.",
        "W: 그럼 당연히 거기 가야지.",
        "M: 다음 번에 갈게. 팀장한테는 벌써 말했어.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 교내 진로 박람회에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["M", "Seoyul, have you seen the notice about the career fair?"],
        ["W", "I read the title and nothing else. When is it?"],
        ["M", "The twelfth and thirteenth of next month, after the fifth period."],
        ["W", "Two afternoons. Where is it held?"],
        ["M", "In the gym. They put up twenty booths around the edge."],
        ["W", "Twenty. What kind of jobs are there?"],
        ["M", "Nurses, programmers, chefs, and a few from the city office."],
        ["W", "Do we have to sign up for a booth in advance?"],
        ["M", "Yes, you choose three on the school website by the ninth."],
        ["W", "Then I'll look at the list tonight."],
        ["M", "Do that. The popular ones fill up on the first day."],
      ],
      choices: ["진행 날짜", "장소", "참여 직업", "신청 방법", "참가 대상"],
      answer: 5,
      clue: "Yes, you choose three on the school website by the ninth.",
      explanation:
        "날짜(다음 달 12일·13일), 장소(체육관), 참여 직업(간호사·프로그래머·요리사 등), 신청 방법(9일까지 누리집에서 세 곳 선택)은 언급되지만 참가 대상은 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 서율아, 진로 박람회 공지 봤어?",
        "W: 제목만 읽었어. 언제인데?",
        "M: 다음 달 12일과 13일, 5교시 끝나고.",
        "W: 오후 이틀이구나. 어디서 해?",
        "M: 체육관에서. 가장자리에 부스를 스무 개 세운대.",
        "W: 스무 개나. 어떤 직업들이 오는데?",
        "M: 간호사, 프로그래머, 요리사, 그리고 시청에서 몇 분.",
        "W: 부스는 미리 신청해야 해?",
        "M: 응, 9일까지 학교 누리집에서 세 곳을 고르면 돼.",
        "W: 그럼 오늘 밤에 목록을 봐야겠다.",
        "M: 그래. 인기 있는 데는 첫날에 다 차.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Hanul Star Park에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "W",
          "Let me tell you about Hanul Star Park, which opened on the hill above our town last spring. " +
            "It is open from sunset until eleven at night, every day except Monday. " +
            "There is no entrance fee, and you do not need to book unless you come as a group. " +
            "Two telescopes stand on the upper deck, and a volunteer shows visitors how to use them. " +
            "On cloudy nights the telescopes are closed, but the indoor room with the star maps stays open. " +
            "The walk up from the bus stop takes about fifteen minutes and the path is lit all the way.",
        ],
      ],
      choices: [
        "지난봄에 문을 열었다",
        "월요일을 빼고 매일 연다",
        "입장료를 내야 한다",
        "망원경이 두 대 있다",
        "흐린 날에는 실내 전시실만 연다",
      ],
      answer: 3,
      clue: "There is no entrance fee, and you do not need to book unless you come as a group.",
      explanation:
        "입장료가 없다고 했으므로 입장료를 내야 한다는 ③이 내용과 일치하지 않는다.",
      translation: [
        "W: 지난봄에 우리 마을 위쪽 언덕에 문을 연 Hanul Star Park를 소개합니다. " +
          "월요일을 빼고 매일, 해 질 무렵부터 밤 11시까지 엽니다. " +
          "입장료는 없고, 단체로 오는 경우가 아니면 예약도 필요 없습니다. " +
          "위층 관측대에 망원경이 두 대 있고, 자원봉사자가 사용법을 알려 줍니다. " +
          "흐린 날에는 망원경을 닫지만 별자리 지도가 있는 실내 전시실은 그대로 엽니다. " +
          "버스 정류장에서 걸어 올라오는 데 15분쯤 걸리고 길에는 내내 불이 켜져 있습니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 예약할 단체 사진관을 고르시오.",
      lines: [
        ["M", "Chaewon, these are the five studios that still have space in November."],
        ["W", "Let's pick one. First, there are twenty of us in the club."],
        ["M", "Then one is out. It only takes fifteen people."],
        ["W", "Next, the price. We collected eight thousand won each."],
        ["M", "So a hundred and sixty thousand at the most. That removes another one."],
        ["W", "Three left. Do they all give us the files, not just prints?"],
        ["M", "One only gives prints, so that's out too."],
        ["W", "Two left. How far are they from school?"],
        ["M", "One is forty minutes away, the other is a ten-minute walk."],
        ["W", "Then let's take the close one. Twenty people on a bus is a nightmare."],
        ["M", "Agreed. I'll book it tonight."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 5,
      clue: "Then let's take the close one. Twenty people on a bus is a nightmare.",
      explanation:
        "15명까지인 ①, 18만 원인 ②, 인화본만 주는 ③을 뺀다. 남은 ④와 ⑤ 중 걸어서 10분인 곳은 ⑤이므로 답은 ⑤이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "15명 / 120,000원 / 파일 제공 / 도보 10분" },
          { no: 2, label: "②", value: "20명 / 180,000원 / 파일 제공 / 도보 10분" },
          { no: 3, label: "③", value: "20명 / 140,000원 / 인화본만 / 도보 10분" },
          { no: 4, label: "④", value: "25명 / 150,000원 / 파일 제공 / 버스 40분" },
          { no: 5, label: "⑤", value: "20명 / 160,000원 / 파일 제공 / 도보 10분" },
        ],
      },
      translation: [
        "M: 채원아, 11월에 아직 자리가 있는 사진관이 이 다섯 곳이야.",
        "W: 하나 고르자. 우선 우리 동아리가 스무 명이야.",
        "M: 그럼 하나 빠지네. 열다섯 명까지만 된대.",
        "W: 다음은 가격. 한 사람당 8천 원씩 걷었어.",
        "M: 그럼 최대 16만 원이네. 그러면 하나 더 빠져.",
        "W: 셋 남았다. 인화본 말고 파일도 다 줘?",
        "M: 한 곳은 인화본만 줘. 그것도 빠지네.",
        "W: 둘 남았다. 학교에서 얼마나 멀어?",
        "M: 하나는 40분 거리고, 하나는 걸어서 10분이야.",
        "W: 그럼 가까운 데로 하자. 스무 명이 버스 타는 건 끔찍해.",
        "M: 좋아. 오늘 밤에 예약할게.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Did you print the field trip consent form?"],
        ["W", "Not yet. The printer in the library was broken."],
        ["M", "Did you try the one in the computer room?"],
        ["W", "I didn't know we could use that one."],
        ["M", "We can, any time before five."],
      ],
      choices: [
        "The trip is on the nineteenth.",
        "Then I'll print it there after school.",
        "My form is already signed.",
        "The library closes at six.",
        "You should print yours too.",
      ],
      answer: 2,
      clue: "We can, any time before five.",
      explanation:
        "컴퓨터실 프린터를 5시 전에는 언제든 쓸 수 있다는 말을 들었으므로, 방과 후에 거기서 인쇄하겠다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 현장 학습 동의서 인쇄했어?",
        "W: 아직. 도서관 프린터가 고장 났어.",
        "M: 컴퓨터실 것은 써 봤어?",
        "W: 그걸 쓸 수 있는 줄 몰랐어.",
        "M: 쓸 수 있어, 5시 전에는 언제든.",
        "W: 그럼 방과 후에 거기서 인쇄할게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "You've been carrying that guitar to school all week."],
        ["M", "I practise at lunch, but there's nowhere quiet to leave it."],
        ["W", "Can't you put it in your locker?"],
        ["M", "It doesn't fit. It's a full-size one."],
        ["W", "The music room has a storage cupboard you can sign up for."],
      ],
      choices: [
        "Then I'll sign up for one tomorrow.",
        "My guitar was a birthday present.",
        "I practise for about thirty minutes.",
        "The lockers are on the second floor.",
        "You should bring your violin too.",
      ],
      answer: 1,
      clue: "The music room has a storage cupboard you can sign up for.",
      explanation:
        "음악실 보관함을 신청할 수 있다는 말을 들었으므로, 내일 신청하겠다는 ①이 가장 자연스럽다.",
      translation: [
        "W: 일주일 내내 기타를 학교에 들고 다니네.",
        "M: 점심시간에 연습하는데, 조용히 둘 데가 없어.",
        "W: 사물함에 못 넣어?",
        "M: 안 들어가. 풀사이즈라서.",
        "W: 음악실에 신청하면 쓸 수 있는 보관함이 있어.",
        "M: 그럼 내일 신청할게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Nayeon, how is the school radio show going this term?"],
        ["W", "We're on air every Wednesday, but nobody seems to listen."],
        ["M", "How do you know nobody listens?"],
        ["W", "We asked for song requests for six weeks and got four."],
        ["M", "Four in six weeks. How do people send them?"],
        ["W", "They write a note and put it in the box outside the broadcasting room."],
        ["M", "Outside the broadcasting room, on the fourth floor?"],
        ["W", "Yes. Most students never go up there."],
        ["M", "So the show is fine; the box is in the wrong place."],
        ["W", "I hadn't thought about the box at all."],
        ["M", "Move it downstairs, beside the cafeteria door, and see what happens."],
      ],
      choices: [
        "We play about eight songs each show.",
        "Then I'll move the box next to the cafeteria.",
        "The show starts at twelve thirty.",
        "I'd rather stop doing the show.",
        "Our broadcasting room is quite small.",
      ],
      answer: 2,
      clue: "Move it downstairs, beside the cafeteria door, and see what happens.",
      explanation:
        "신청함을 4층에서 급식실 문 옆으로 옮겨 보라는 조언을 들었으므로, 그렇게 하겠다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 나연아, 이번 학기 교내 라디오는 잘돼 가?",
        "W: 수요일마다 방송하는데 아무도 안 듣는 것 같아.",
        "M: 아무도 안 듣는 건 어떻게 알아?",
        "W: 6주 동안 신청곡을 받았는데 네 장 왔어.",
        "M: 6주에 네 장이라. 어떻게 보내는데?",
        "W: 쪽지를 써서 방송실 앞 상자에 넣어.",
        "M: 4층 방송실 앞에?",
        "W: 응. 학생들은 거기까지 거의 안 올라가.",
        "M: 그럼 방송이 문제가 아니라 상자 위치가 문제네.",
        "W: 상자는 생각도 못 했어.",
        "M: 아래층 급식실 문 옆으로 옮기고 어떻게 되는지 봐.",
        "W: 그럼 상자를 급식실 옆으로 옮길게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Junho, you said you're reading three books at once again?"],
        ["M", "Four, actually. One for class and three of my own."],
        ["W", "And how many have you finished this month?"],
        ["M", "None. I keep swapping when a page gets slow."],
        ["W", "So you're always at the hard part of something."],
        ["M", "That's exactly it. Every book is stuck around page sixty."],
        ["W", "Have you ever pushed through one of those slow parts?"],
        ["M", "Once, in March. That book turned out to be my favourite."],
        ["W", "Then the slow part isn't a sign to stop reading."],
        ["M", "I suppose I've been treating it as one."],
        ["W", "Pick one book and finish it before you open another."],
      ],
      choices: [
        "Then I'll finish one before starting the next.",
        "I read about twenty pages a night.",
        "My favourite book is a mystery novel.",
        "I'll borrow three more from the library.",
        "The class book is due on Monday.",
      ],
      answer: 1,
      clue: "Pick one book and finish it before you open another.",
      explanation:
        "한 권을 다 읽고 나서 다음 책을 펴라는 조언을 들었으므로, 그렇게 하겠다는 ①이 가장 자연스럽다.",
      translation: [
        "W: 준호야, 또 책을 세 권 동시에 읽는다고 했지?",
        "M: 사실 네 권. 수업 책 하나랑 내 책 셋.",
        "W: 이번 달에 몇 권 끝냈어?",
        "M: 하나도. 내용이 더디면 계속 다른 책으로 바꿔.",
        "W: 그럼 늘 어딘가의 어려운 부분에 있는 거네.",
        "M: 딱 그거야. 책마다 60쪽쯤에서 멈춰 있어.",
        "W: 그 더딘 부분을 뚫고 나가 본 적은 있어?",
        "M: 한 번, 3월에. 그 책이 제일 좋아하는 책이 됐어.",
        "W: 그럼 더딘 부분이 그만두라는 신호는 아니네.",
        "M: 그동안 그렇게 여겨 온 것 같아.",
        "W: 한 권을 골라서 다 읽고 나서 다음 책을 펴.",
        "M: 그럼 한 권을 끝내고 다음 걸 시작할게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Sejin이 Minwoo에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Sejin : ________________",
      lines: [
        [
          "W",
          "Sejin and Minwoo are on the same school debate team. " +
            "Minwoo speaks clearly and never loses his temper, even when the other side is rude. " +
            "In the last two rounds, however, he answered every single point the other team made. " +
            "Because of that he spent four of his five minutes on small details and never reached his own argument. " +
            "Sejin does not think he should answer less carefully; that care is why the judges trust him. " +
            "The trouble is that a speech spent only on replies never says anything of its own. " +
            "The regional round is in ten days, and speeches there are two minutes shorter. " +
            "She wants to suggest that he answer the two strongest points and leave the rest. " +
            "In this situation, what would Sejin most likely say to Minwoo?",
        ],
      ],
      choices: [
        "Answer only their two strongest points and move on to ours.",
        "Try to speak a little faster in the next round.",
        "I think you should let someone else go second.",
        "You should ignore everything the other team says.",
        "Let's change our argument before the regional round.",
      ],
      answer: 1,
      clue: "She wants to suggest that he answer the two strongest points and leave the rest.",
      explanation:
        "세진은 민우의 꼼꼼함을 문제 삼지 않으면서, 상대의 가장 강한 두 가지만 반박하고 자기 주장으로 넘어가라고 말하려 한다. 따라서 ①이 가장 적절하다.",
      translation: [
        "W: 세진과 민우는 같은 학교 토론 팀입니다. " +
          "민우는 또렷하게 말하고, 상대가 무례해도 화를 내지 않습니다. " +
          "그런데 지난 두 경기에서 상대 팀이 낸 모든 논점에 하나하나 답했습니다. " +
          "그 바람에 5분 중 4분을 사소한 부분에 쓰고 자기 주장은 꺼내지도 못했습니다. " +
          "세진은 민우가 덜 꼼꼼해야 한다고 생각하지 않습니다. 그 꼼꼼함 덕분에 심사위원이 민우를 신뢰합니다. " +
          "문제는 반박에만 쓴 발언은 자기 이야기를 하나도 하지 못한다는 점입니다. " +
          "지역 대회는 열흘 뒤이고, 거기서는 발언 시간이 2분 더 짧습니다. " +
          "그래서 가장 강한 두 가지만 반박하고 나머지는 넘기라고 제안하고 싶습니다. " +
          "이런 상황에서 세진이 민우에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "남자가 하는 말의 주제로 가장 적절한 것은?",
      lines: [
        ["M", "Good afternoon. Today I want to talk about how plants move seeds without moving themselves."],
        ["M", "A plant that grows where its parent stands will fight that parent for light and water."],
        ["M", "The dandelion answers with a parachute: a dry seed under a crown of fine hairs that the wind carries."],
        ["M", "The maple builds a wing instead, and the seed spins like a blade as it falls, drifting sideways."],
        ["M", "The burdock takes a different route, covering its seed case in tiny hooks that grab passing fur."],
        ["M", "A coconut simply floats, staying alive in salt water for weeks until a tide leaves it on sand."],
        ["M", "None of these plants chose its method, and none of them can travel at all by itself."],
        ["M", "Yet between them they have reached almost every corner of the land."],
      ],
      choices: [
        "how plants take in water from the soil",
        "why some seeds take years to grow",
        "the ways plants spread their seeds",
        "how farmers store seeds through winter",
        "why forests grow back after a fire",
      ],
      answer: 3,
      clue: "Good afternoon. Today I want to talk about how plants move seeds without moving themselves.",
      explanation:
        "남자는 민들레, 단풍나무, 우엉, 코코넛이 저마다 다른 방법으로 씨앗을 퍼뜨린다고 설명한다. 따라서 주제는 ③이다.",
      translation: [
        "M: 안녕하세요. 오늘은 식물이 스스로 움직이지 않으면서 씨앗을 옮기는 방법에 대해 이야기하려 합니다.",
        "M: 어미 식물이 선 자리에서 자라는 식물은 빛과 물을 두고 어미와 다투게 됩니다.",
        "M: 민들레는 낙하산으로 답합니다. 마른 씨앗 위에 가는 털이 왕관처럼 달려 바람이 실어 갑니다.",
        "M: 단풍나무는 대신 날개를 만듭니다. 씨앗이 떨어지면서 날개처럼 돌며 옆으로 흘러갑니다.",
        "M: 우엉은 다른 길을 택해, 씨앗 껍질을 작은 갈고리로 덮어 지나가는 털에 달라붙게 합니다.",
        "M: 코코넛은 그냥 떠갑니다. 바닷물에서 몇 주를 살아 있다가 밀물이 모래에 내려놓습니다.",
        "M: 이 식물들 가운데 스스로 방법을 고른 것은 없고, 혼자 이동할 수 있는 것도 없습니다.",
        "M: 그런데도 이들은 함께 땅의 거의 모든 구석에 닿았습니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 식물이 아닌 것은?",
      lines: [
        ["M", "Good afternoon. Today I want to talk about how plants move seeds without moving themselves."],
        ["M", "A plant that grows where its parent stands will fight that parent for light and water."],
        ["M", "The dandelion answers with a parachute: a dry seed under a crown of fine hairs that the wind carries."],
        ["M", "The maple builds a wing instead, and the seed spins like a blade as it falls, drifting sideways."],
        ["M", "The burdock takes a different route, covering its seed case in tiny hooks that grab passing fur."],
        ["M", "A coconut simply floats, staying alive in salt water for weeks until a tide leaves it on sand."],
        ["M", "None of these plants chose its method, and none of them can travel at all by itself."],
        ["M", "Yet between them they have reached almost every corner of the land."],
      ],
      choices: ["dandelion", "maple", "burdock", "coconut", "sunflower"],
      answer: 5,
      clue: "A coconut simply floats, staying alive in salt water for weeks until a tide leaves it on sand.",
      explanation:
        "민들레, 단풍나무, 우엉, 코코넛은 언급되지만 해바라기는 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
