/** 고3 듣기 30회 — 사람이 직접 쓴 회차 (2026-09-25) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고3 30회",
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
          "Good evening, third-year students. This is Ms. Bang from the counseling office. " +
            "I want to say something about the results that arrive next week. " +
            "Every year a few students open the envelope in the corridor " +
            "and decide their whole future in the next ninety seconds. " +
            "Some of those decisions are reversed a week later, " +
            "and some of them are not, which is the part that worries me. " +
            "So here is what we are asking. " +
            "When the result arrives, read it, put it away, and come and talk to us before you act. " +
            "We will be open until seven every day that week, with no appointment needed. " +
            "A number is information. It is not an instruction. Thank you.",
        ],
      ],
      choices: [
        "성적을 받은 뒤 바로 결정하지 말고 상담을 받으라고 하려고",
        "성적 발표일이 바뀌었음을 알리려고",
        "상담실 위치 변경을 알리려고",
        "재수 상담을 권하려고",
        "원서 접수 방법을 안내하려고",
      ],
      answer: 1,
      clue: "When the result arrives, read it, put it away, and come and talk to us before you act.",
      explanation:
        "여자는 성적을 받자마자 결정하지 말고 상담실에 먼저 와서 이야기하라고 당부한다. 따라서 답은 ①이다.",
      translation: [
        "W: 3학년 학생 여러분, 안녕하세요. 상담실 방입니다. 다음 주에 나오는 성적에 대해 말씀드리려 합니다. 해마다 몇몇 학생이 복도에서 봉투를 열고 이어지는 90초 안에 자기 앞날을 정해 버립니다. 그 결정 중 일부는 일주일 뒤에 뒤집히고, 일부는 뒤집히지 않습니다. 제가 걱정하는 것은 바로 그 부분입니다. 그래서 이렇게 부탁드립니다. 성적이 오면 읽고, 넣어 두고, 움직이기 전에 저희에게 와서 이야기해 주세요. 그 주에는 매일 7시까지 열어 두고, 예약도 필요 없습니다. 숫자는 정보입니다. 지시가 아닙니다. 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 남자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Seungho, I've been reading three books on study methods this month."],
        ["M", "Three? How many of the methods have you tried?"],
        ["W", "None yet. I want to find the best one first."],
        ["M", "So the reading is happening instead of the studying."],
        ["W", "That's unfair. I'm preparing."],
        ["M", "How long would it take to test one of them properly?"],
        ["W", "Two weeks, I suppose, to see any difference."],
        ["M", "And you've spent a month reading about them."],
        ["W", "Which is longer than testing two would have taken."],
        ["M", "Methods only tell you anything once they meet your own material."],
        ["W", "So I should pick one and run it for two weeks."],
        ["M", "Pick the one you liked least. You'll find out fastest."],
      ],
      choices: [
        "공부법 책을 많이 읽어야 한다",
        "자신에게 맞는 공부법이 따로 있다",
        "계획은 두 주 단위로 세워야 한다",
        "공부법은 읽기보다 직접 시험해 봐야 한다",
        "공부법은 자주 바꿔야 한다",
      ],
      answer: 4,
      clue: "Methods only tell you anything once they meet your own material.",
      explanation:
        "남자는 공부법은 자기 자료를 만나야 무언가를 알려 준다며, 하나를 골라 2주 동안 돌려 보라고 말한다. 따라서 답은 ④이다.",
      translation: [
        "W: 승호야, 나 이번 달에 공부법 책을 세 권 읽고 있어.",
        "M: 세 권? 그중 몇 가지를 해 봤어?",
        "W: 아직 하나도. 제일 좋은 걸 먼저 찾고 싶어서.",
        "M: 그럼 공부 대신 읽기를 하고 있는 거네.",
        "W: 그건 좀 억울해. 준비하는 거잖아.",
        "M: 하나를 제대로 시험해 보는 데 얼마나 걸려?",
        "W: 차이를 보려면 2주쯤?",
        "M: 그런데 그것들에 대해 읽는 데 한 달을 썼잖아.",
        "W: 두 개를 시험해 보는 것보다 긴 시간이네.",
        "M: 공부법은 네 자료를 만나야 비로소 뭔가를 알려 줘.",
        "W: 그럼 하나 골라서 2주 돌려 봐야겠네.",
        "M: 제일 마음에 안 들었던 걸 골라. 제일 빨리 알게 될 거야.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "There is a mistake that turns a good record of the past " +
            "into a bad guide to the future, and it is easy to make. " +
            "We study the things that survived. " +
            "The companies that lasted, the methods that worked, the people who arrived. " +
            "What we cannot study, because it left no record, " +
            "is everything that did the same and failed anyway. " +
            "If a hundred people took the same risk and one succeeded, " +
            "we will read a book by that one, " +
            "and the book will describe the risk as the reason. " +
            "The ninety-nine wrote nothing. " +
            "So before you copy what worked for someone, " +
            "ask how many people you would have to interview to find out " +
            "whether it works at all.",
        ],
      ],
      choices: [
        "위험을 감수해야 성공한다",
        "기록을 잘 남겨야 한다",
        "책은 많이 읽어야 한다",
        "성공 사례만 보면 실패한 경우를 놓친다",
        "과거는 반복되지 않는다",
      ],
      answer: 4,
      clue: "The ninety-nine wrote nothing.",
      explanation:
        "여자는 살아남은 것만 연구하게 되어 같은 일을 하고도 실패한 경우가 보이지 않는다고 말한다. 따라서 답은 ④이다.",
      translation: [
        "W: 지난 일에 대한 좋은 기록을 앞날에 대한 나쁜 안내로 바꿔 놓는 실수가 하나 있는데, 저지르기 쉽습니다. 우리는 살아남은 것들을 연구합니다. 남은 회사, 통한 방법, 도착한 사람들. 우리가 연구할 수 없는 것은, 기록을 남기지 않았기 때문에, 같은 일을 하고도 실패한 모든 것입니다. 백 명이 같은 위험을 감수했는데 한 명이 성공했다면, 우리는 그 한 명이 쓴 책을 읽게 되고, 그 책은 그 위험을 이유로 설명할 것입니다. 나머지 아흔아홉은 아무것도 쓰지 않았습니다. 그러니 누군가에게 통했던 것을 따라 하기 전에, 그것이 정말 통하는지 알아내려면 몇 명을 만나 봐야 하는지 물어보세요.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["M", "Sumin, is this the corner you turned into a print studio?"],
        ["W", "Yes, the art room finally has one."],
        ["M", "There's a printing press at the left end of the bench."],
        ["W", "It came from a workshop that was closing."],
        ["M", "And a drying rack stands against the wall."],
        ["W", "Prints hang there overnight before we touch them."],
        ["M", "I count three ink trays on the bench."],
        ["W", "There are four. One is behind the press."],
        ["M", "The apron on the hook looks well used."],
        ["W", "Ink never washes out, so we stopped trying."],
        ["M", "And a bin of scrap paper sits under the bench."],
        ["W", "We test every colour on that before the real sheet."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "There are four. One is behind the press.",
      explanation:
        "남자가 잉크판이 세 개라고 하자 여자가 네 개라고 바로잡는다. 그림에는 세 개가 그려져 있으므로 답은 ③이다.",
      figure: {
        kind: "scene",
        scene:
          "A print studio corner drawn as one wide picture, clean black line art on white, no writing or letters or numbers anywhere. " +
          "A SMALL PRINTING PRESS with a round wheel stands at the left end of a long bench. " +
          "A TALL DRYING RACK with empty sheets hanging on its bars stands against the wall on the right. " +
          "EXACTLY THREE FLAT INK TRAYS sit on the bench, spaced well apart so all three are easy to count and none overlap. " +
          "An APRON hangs on a hook on the wall. " +
          "A BIN OF SCRAP PAPER sits on the floor under the bench.",
      },
      translation: [
        "M: 수민아, 이게 판화 작업실로 만든 구석이야?",
        "W: 응, 미술실에 드디어 하나 생겼어.",
        "M: 작업대 왼쪽 끝에 인쇄기가 있네.",
        "W: 문 닫는 공방에서 가져온 거야.",
        "M: 그리고 벽에 건조대가 서 있어.",
        "W: 찍은 건 만지기 전에 밤새 거기 걸어 둬.",
        "M: 작업대에 잉크판이 세 개 보여.",
        "W: 네 개야. 하나는 인쇄기 뒤에 있어.",
        "M: 고리에 걸린 앞치마는 많이 쓴 것 같네.",
        "W: 잉크는 절대 안 빠져서 빼기를 포기했어.",
        "M: 그리고 작업대 밑에 이면지 통이 있어.",
        "W: 진짜 종이에 찍기 전에 거기에 색을 다 시험해.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 남자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Seungho, the graduation ceremony starts at ten in the hall."],
        ["M", "I know. Are the chairs laid out by class?"],
        ["W", "Four hundred, and the aisles are wide enough for the wheelchairs."],
        ["M", "Good. And the certificates?"],
        ["W", "Sorted and stacked in order at the side table."],
        ["M", "Then what's still open?"],
        ["W", "The flowers for the front row haven't been collected."],
        ["M", "From the shop by the station?"],
        ["W", "Yes, and they close for lunch at half past eleven."],
        ["M", "That's tight. Who can go?"],
        ["W", "I can't. I'm meeting the guest speaker at the gate at nine thirty."],
        ["M", "Then I'll collect the flowers from the shop."],
      ],
      choices: [
        "의자 배치하기",
        "졸업장 정리하기",
        "꽃 받아 오기",
        "초청 연사 맞이하기",
        "강당 청소하기",
      ],
      answer: 3,
      clue: "Then I'll collect the flowers from the shop.",
      explanation:
        "의자와 졸업장은 끝났고 여자는 연사를 맞아야 하므로, 남자가 가게에서 꽃을 받아 오기로 한다. 따라서 답은 ③이다.",
      translation: [
        "W: 승호야, 졸업식이 10시에 강당에서 시작해.",
        "M: 알아. 의자는 반별로 놨어?",
        "W: 사백 개. 통로도 휠체어가 다닐 만큼 넓게 했어.",
        "M: 좋아. 졸업장은?",
        "W: 순서대로 정리해서 옆 탁자에 쌓아 뒀어.",
        "M: 그럼 아직 남은 게 뭐야?",
        "W: 앞줄에 둘 꽃을 아직 안 받아 왔어.",
        "M: 역 옆 가게에서?",
        "W: 응. 그런데 11시 30분에 점심시간이라 닫아.",
        "M: 빠듯하네. 누가 갈 수 있어?",
        "W: 나는 못 가. 9시 30분에 정문에서 초청 연사를 맞아야 해.",
        "M: 그럼 내가 가게에서 꽃 받아 올게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 여자가 지불할 금액을 고르시오.",
      lines: [
        ["M", "Welcome to Millhouse Photo. How can I help you?"],
        ["W", "Eight enlargements from these files, please."],
        ["M", "An enlargement is eighteen dollars each."],
        ["W", "So one hundred and forty-four for the eight."],
        ["M", "That's right. Would you like them mounted on board?"],
        ["W", "How much is the mounting?"],
        ["M", "Six dollars each, so forty-eight more."],
        ["W", "We'll skip the mounting. They go into an album."],
        ["M", "Understood. Are these for a school?"],
        ["W", "They are. Here's the school card."],
        ["M", "Then I can take twenty-five percent off the enlargements."],
        ["W", "Thank you. I'll pay now and collect on Friday."],
      ],
      choices: ["$108.00", "$120.00", "$144.00", "$156.00", "$192.00"],
      answer: 1,
      clue: "Then I can take twenty-five percent off the enlargements.",
      explanation:
        "확대 인화 8장 144달러에서 마운팅은 빼고, 25퍼센트를 빼면 108달러이다. 따라서 답은 ①이다.",
      translation: [
        "M: 밀하우스 사진관입니다. 무엇을 도와드릴까요?",
        "W: 이 파일로 확대 인화 여덟 장 부탁드려요.",
        "M: 확대 인화는 한 장에 18달러입니다.",
        "W: 그럼 여덟 장에 144달러네요.",
        "M: 맞습니다. 판에 붙여 드릴까요?",
        "W: 붙이는 건 얼마예요?",
        "M: 한 장에 6달러라서 48달러가 더 붙습니다.",
        "W: 붙이는 건 뺄게요. 앨범에 넣을 거예요.",
        "M: 알겠습니다. 학교에 쓰는 건가요?",
        "W: 네. 여기 학교 카드요.",
        "M: 그럼 인화비에서 25퍼센트를 빼 드릴게요.",
        "W: 감사합니다. 지금 결제하고 금요일에 찾아갈게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 남자가 졸업 여행에 가지 않는 이유를 고르시오.",
      lines: [
        ["W", "Seungho, you're not on the graduation trip list."],
        ["M", "I took my name off last Friday."],
        ["W", "Is it the cost? It went up again this year."],
        ["M", "My parents had already put that aside."],
        ["W", "Then is it the dates? It's right after the exam."],
        ["M", "The dates are fine. It's my knee."],
        ["W", "Your knee? Since when?"],
        ["M", "I had surgery in November and I can't walk that far yet."],
        ["W", "And the trip is all walking."],
        ["M", "Twelve kilometers on the second day. I'd hold everyone up."],
      ],
      choices: [
        "비용이 부담스러워서",
        "일정이 시험과 겹쳐서",
        "무릎 수술을 받아서",
        "가족 행사가 있어서",
        "다른 여행을 가서",
      ],
      answer: 3,
      clue: "I had surgery in November and I can't walk that far yet.",
      explanation:
        "비용도 일정도 문제가 아니고, 11월에 무릎 수술을 받아 아직 그만큼 걸을 수 없기 때문이다. 따라서 답은 ③이다.",
      translation: [
        "W: 승호야, 졸업 여행 명단에 네가 없네.",
        "M: 지난 금요일에 이름을 뺐어.",
        "W: 비용 때문이야? 올해 또 올랐잖아.",
        "M: 부모님이 이미 따로 떼어 두셨어.",
        "W: 그럼 날짜 때문이야? 시험 직후잖아.",
        "M: 날짜는 괜찮아. 무릎 때문이야.",
        "W: 무릎? 언제부터?",
        "M: 11월에 수술했는데 아직 그렇게 멀리 못 걸어.",
        "W: 그 여행은 온통 걷는 거고.",
        "M: 둘째 날에만 12킬로미터야. 다들 기다리게 될 거야.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, Northline Gap Year Fair에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["W", "Seungho, are you going to the Northline Gap Year Fair?"],
        ["M", "I saw the poster. When is it?"],
        ["W", "One day only, the sixteenth of December."],
        ["M", "A single day. Where is it held?"],
        ["W", "In the exhibition hall behind the city library."],
        ["M", "That's easy to get to. Who has a stand there?"],
        ["W", "Volunteer groups, language schools and two working-holiday agencies."],
        ["M", "That's a good range. How does it run on the day?"],
        ["W", "Stands all day, and four short talks in the afternoon."],
        ["M", "Do we have to register?"],
        ["W", "You can walk in, but registering gets you a seat at the talks."],
        ["M", "Then let's register tonight."],
      ],
      choices: ["열리는 날", "열리는 장소", "참여 기관", "진행 방식", "참가비"],
      answer: 5,
      clue: "참가비는 대화에서 언급되지 않았다.",
      explanation:
        "날짜(12월 16일 하루), 장소(시립 도서관 뒤 전시장), 참여 기관(봉사 단체·어학원·워킹홀리데이 업체), 진행 방식(부스와 오후 강연)은 언급되지만 참가비는 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 승호야, 노스라인 갭이어 박람회 갈 거야?",
        "M: 포스터 봤어. 언제야?",
        "W: 하루만. 12월 16일.",
        "M: 하루구나. 어디서 열려?",
        "W: 시립 도서관 뒤 전시장에서.",
        "M: 가기 쉽네. 어디가 부스를 여는데?",
        "W: 봉사 단체, 어학원, 그리고 워킹홀리데이 업체 두 곳.",
        "M: 폭이 넓네. 당일엔 어떻게 진행돼?",
        "W: 부스는 하루 종일, 오후엔 짧은 강연이 네 번.",
        "M: 신청해야 해?",
        "W: 그냥 가도 되는데, 신청하면 강연 자리가 나와.",
        "M: 그럼 오늘 밤에 신청하자.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Ridgeway Night Bus에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "M",
          "Let me tell you about the Ridgeway Night Bus. " +
            "It has run since 2019 between the city centre and the university district. " +
            "Buses leave every thirty minutes from eleven at night until four in the morning. " +
            "The fare is the same as a daytime bus, and transport cards work as usual. " +
            "It runs on Friday and Saturday nights only, and not at all on public holidays. " +
            "There are nine stops in each direction, all of them lit and with a shelter. " +
            "The route is shown on the city transport app in real time.",
        ],
      ],
      choices: [
        "2019년부터 운행해 왔다",
        "30분마다 출발한다",
        "요금이 낮 버스와 같다",
        "공휴일에도 운행한다",
        "정류장이 방향마다 아홉 곳이다",
      ],
      answer: 4,
      clue: "It runs on Friday and Saturday nights only, and not at all on public holidays.",
      explanation:
        "금·토요일 밤에만 다니고 공휴일에는 아예 운행하지 않는다고 했으므로 ④는 내용과 다르다. 따라서 답은 ④이다.",
      translation: [
        "M: 리지웨이 심야 버스를 소개해 드리겠습니다. 2019년부터 도심과 대학가 사이를 다녀 왔습니다. 버스는 밤 11시부터 새벽 4시까지 30분마다 출발합니다. 요금은 낮 버스와 같고 교통 카드도 그대로 됩니다. 금요일과 토요일 밤에만 다니고, 공휴일에는 아예 운행하지 않습니다. 정류장은 방향마다 아홉 곳이고 모두 불이 켜져 있고 대기 공간이 있습니다. 노선은 시 교통 앱에서 실시간으로 볼 수 있습니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 신청할 겨울 강좌를 고르시오.",
      lines: [
        ["W", "Seungho, let's take one course over the winter."],
        ["M", "Five listed. Weekday or weekend?"],
        ["W", "Weekday. I want the weekends for the applications."],
        ["M", "Agreed. Should it have a certificate at the end?"],
        ["W", "Yes. It's the only thing we can put on a form."],
        ["M", "Right. And the fee? I have a hundred thousand won."],
        ["W", "Same here, so a hundred thousand is the ceiling."],
        ["M", "Then only one course clears all three."],
        ["W", "Enrolment closes on the eighteenth."],
        ["M", "Let's register tonight, then."],
        ["W", "I'll send the link after dinner."],
        ["M", "I'll transfer my half in the morning."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 2,
      clue: "Weekday. I want the weekends for the applications.",
      explanation:
        "평일이고, 수료증이 나오며, 수강료가 10만 원 이하인 강좌를 고른다. 세 조건을 모두 채우는 것은 ②이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Days: Weekend / Certificate: Yes / Fee: 60,000 won" },
          { no: 2, label: "②", value: "Days: Weekday / Certificate: Yes / Fee: 85,000 won" },
          { no: 3, label: "③", value: "Days: Weekday / Certificate: No / Fee: 40,000 won" },
          { no: 4, label: "④", value: "Days: Weekday / Certificate: Yes / Fee: 150,000 won" },
          { no: 5, label: "⑤", value: "Days: Weekend / Certificate: No / Fee: 25,000 won" },
        ],
      },
      translation: [
        "W: 승호야, 겨울에 강좌 하나 듣자.",
        "M: 다섯 개 있네. 평일이야, 주말이야?",
        "W: 평일. 주말은 원서 쓰는 데 쓰고 싶어.",
        "M: 동의해. 끝에 수료증이 나와야 할까?",
        "W: 응. 서류에 적을 수 있는 건 그것뿐이야.",
        "M: 맞아. 수강료는? 나는 10만 원 있어.",
        "W: 나도. 그럼 10만 원이 한계네.",
        "M: 그럼 세 조건 다 넘는 건 하나뿐이야.",
        "W: 수강 신청은 18일에 닫혀.",
        "M: 그럼 오늘 밤에 등록하자.",
        "W: 저녁 먹고 링크 보낼게.",
        "M: 내 몫은 아침에 보낼게.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["M", "Sumin, is the counseling office open during the exam week?"],
        ["W", "It is, but only in the afternoons."],
        ["M", "My last exam finishes at one every day."],
        ["W", "Then go straight over. They start seeing people at one thirty."],
      ],
      choices: [
        "The office is closed that week.",
        "I'll go over after my exam.",
        "I don't need any counseling.",
        "My exams are in the afternoon.",
        "I'll come back next month.",
      ],
      answer: 2,
      clue: "Then go straight over. They start seeing people at one thirty.",
      explanation:
        "여자가 시험 끝나고 바로 가라고 했으므로, 시험 끝나고 가겠다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 수민아, 시험 주간에 상담실 열어?",
        "W: 열어. 그런데 오후에만.",
        "M: 내 마지막 시험은 매일 1시에 끝나.",
        "W: 그럼 바로 가. 1시 30분부터 사람을 받아.",
        "M: 시험 끝나고 바로 갈게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["W", "Seungho, my application keeps saying the file is too large."],
        ["M", "How big is it?"],
        ["W", "Twenty-eight megabytes. It's a scanned portfolio."],
        ["M", "Their limit is ten. Save it again as a compressed PDF."],
      ],
      choices: [
        "My file is only two pages.",
        "I'll save a compressed PDF.",
        "There is no size limit.",
        "I'll send it by post instead.",
        "The application was accepted.",
      ],
      answer: 2,
      clue: "Their limit is ten. Save it again as a compressed PDF.",
      explanation:
        "남자가 압축한 PDF로 다시 저장하라고 했으므로, 그렇게 하겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 승호야, 원서가 자꾸 파일이 너무 크다고 해.",
        "M: 얼마나 큰데?",
        "W: 28메가바이트. 스캔한 포트폴리오야.",
        "M: 거기 제한이 10이야. 압축한 PDF로 다시 저장해.",
        "W: 압축한 PDF로 저장할게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Seungho, you've rewritten the same paragraph eleven times."],
        ["M", "It still doesn't say what I mean."],
        ["W", "Has anyone read any of the eleven?"],
        ["M", "No. I'll show it when it's right."],
        ["W", "But you already know what you meant."],
        ["M", "So I can't tell whether the words carry it."],
        ["W", "Not from inside, no. Only a reader can tell you that."],
        ["M", "And I've been avoiding the only test that works."],
        ["W", "Avoiding it politely, by calling it not ready."],
        ["M", "Then what should I do with the eleventh one?"],
        ["W", "Send it to me tonight and let me say what I understood."],
      ],
      choices: [
        "I'll send you the eleventh tonight.",
        "I'll write a twelfth version.",
        "Nobody needs to read it.",
        "The paragraph is finished.",
        "I'd rather not write at all.",
      ],
      answer: 1,
      clue: "Send it to me tonight and let me say what I understood.",
      explanation:
        "여자가 오늘 밤 보내 주면 자기가 이해한 것을 말해 주겠다고 했으므로, 열한 번째를 보내겠다는 ①이 가장 자연스럽다.",
      translation: [
        "W: 승호야, 같은 문단을 열한 번이나 다시 썼네.",
        "M: 아직 내 뜻을 말하지 못해.",
        "W: 그 열한 개 중에 누가 읽어 본 게 있어?",
        "M: 아니. 제대로 되면 보여 주려고.",
        "W: 그런데 너는 이미 네 뜻을 알잖아.",
        "M: 그럼 그 말들이 그걸 실어 나르는지 내가 알 수 없겠네.",
        "W: 안쪽에서는 못 알아. 독자만 말해 줄 수 있어.",
        "M: 그럼 나는 통하는 유일한 시험을 피해 온 거네.",
        "W: 아직 안 됐다고 부르면서 점잖게 피한 거지.",
        "M: 그럼 열한 번째는 어떻게 해?",
        "W: 오늘 밤에 나한테 보내. 내가 뭘 이해했는지 말해 줄게.",
        "M: 오늘 밤에 열한 번째 보낼게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Sumin, you've been checking the application site every hour."],
        ["W", "The result could come at any time."],
        ["M", "Does the site say when results are posted?"],
        ["W", "Six in the evening on the announced day. It says so on the notice."],
        ["M", "So every check before then is guaranteed to show nothing."],
        ["W", "Said aloud, that's obviously true."],
        ["M", "And each check costs you the next twenty minutes."],
        ["W", "It does. I can't settle back into anything afterwards."],
        ["M", "That's the real cost. Not the minute, the twenty."],
        ["W", "Then what should I do with the waiting?"],
        ["M", "Check once, at six, and put the site away until then."],
      ],
      choices: [
        "I'll check once at six from now on.",
        "I'll keep checking every hour.",
        "The result comes in the morning.",
        "I never check the site.",
        "I'll stop applying altogether.",
      ],
      answer: 1,
      clue: "Check once, at six, and put the site away until then.",
      explanation:
        "남자가 6시에 한 번만 확인하고 그전에는 보지 말라고 했으므로, 그렇게 하겠다는 ①이 가장 자연스럽다.",
      translation: [
        "M: 수민아, 너 한 시간마다 원서 사이트를 확인하더라.",
        "W: 결과가 언제 나올지 모르니까.",
        "M: 사이트에 언제 올라온다고 적혀 있어?",
        "W: 발표일 저녁 6시. 공지에 그렇게 적혀 있어.",
        "M: 그럼 그전 확인은 전부 아무것도 안 나오는 게 확실하네.",
        "W: 소리 내어 말하니 당연한 소리다.",
        "M: 게다가 확인할 때마다 다음 20분을 쓰게 되고.",
        "W: 맞아. 그러고 나면 아무것도 다시 붙잡지 못해.",
        "M: 그게 진짜 대가야. 1분이 아니라 20분.",
        "W: 그럼 기다리는 동안 뭘 해야 해?",
        "M: 6시에 한 번만 확인하고, 그때까지는 사이트를 치워 둬.",
        "W: 이제부터 6시에 한 번만 확인할게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Nahyun이 Taeho에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Nahyun : ________________",
      lines: [
        [
          "W",
          "Nahyun and Taeho are putting together the year group's graduation slideshow. " +
            "Taeho has gathered a photograph from every one of the two hundred students, " +
            "which took him three weeks of asking and chasing. " +
            "On Thursday Nahyun watches the file through on the hall projector " +
            "and finds that about forty of the photographs are so dark on the big screen " +
            "that the faces cannot be made out, " +
            "although they looked fine on his laptop. " +
            "The editing software can brighten those forty in about an hour, " +
            "and the ceremony is not until Monday. " +
            "She does not want him to ask anyone for a new photograph, " +
            "since the collecting alone took three weeks. " +
            "She wants to tell him to brighten the dark ones before Monday. " +
            "In this situation, what would Nahyun most likely say to Taeho?",
        ],
      ],
      choices: [
        "We should ask those forty for new photographs.",
        "Let's remove the dark photographs entirely.",
        "We should show it on a laptop instead.",
        "Let's move the ceremony to Tuesday.",
        "Let's brighten the dark photographs before Monday.",
      ],
      answer: 5,
      clue: "She wants to tell him to brighten the dark ones before Monday.",
      explanation:
        "나현이는 월요일 전에 어두운 사진을 밝게 고치자고 말하려 하므로 ⑤가 가장 적절하다.",
      translation: [
        "W: 나현이와 태호는 학년 전체의 졸업 영상을 만들고 있습니다. 태호는 학생 이백 명에게서 사진을 한 장씩 다 모았는데, 묻고 쫓아다니느라 3주가 걸렸습니다. 목요일에 나현이는 그 파일을 강당 프로젝터로 끝까지 봤다가, 그중 마흔 장쯤이 큰 화면에서는 너무 어두워 얼굴을 알아볼 수 없다는 것을 알게 됩니다. 태호의 노트북에서는 괜찮아 보였는데도요. 편집 프로그램으로 그 마흔 장을 밝게 하는 데는 한 시간쯤이면 되고, 졸업식은 월요일입니다. 나현이는 사진을 모으는 데만 3주가 걸렸기 때문에 누구에게도 새 사진을 다시 부탁하기를 바라지 않습니다. 나현이는 월요일 전에 어두운 사진을 밝게 고치자고 말하고 싶습니다. 이런 상황에서 나현이가 태호에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 여자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "Hello, everyone. Today I want to talk about why a photograph of a running race " +
            "sometimes shows a wheel bent into an impossible shape. " +
            "Many cameras do not capture the whole frame at once. " +
            "They read the sensor line by line, from top to bottom, " +
            "and that sweep takes a few thousandths of a second. " +
            "Nothing in a still scene changes during that sweep, so nothing looks wrong. " +
            "But a spinning wheel moves between the first line and the last, " +
            "so the top of the wheel is recorded in one position " +
            "and the bottom in another. " +
            "The bend you see is not a flaw in the lens. " +
            "It is a picture of one object at several different moments, " +
            "stacked into a single frame.",
        ],
      ],
      choices: [
        "how camera lenses are ground and polished",
        "why fast-moving objects look bent in some photographs",
        "why races are hard to photograph in low light",
        "how a sensor converts light into a signal",
        "why wheels are made round rather than square",
      ],
      answer: 2,
      clue: "It is a picture of one object at several different moments, stacked into a single frame.",
      explanation:
        "여자는 센서가 줄 단위로 읽는 사이에 대상이 움직여 한 장에 여러 순간이 쌓인다고 설명한다. 따라서 답은 ②이다.",
      translation: [
        "W: 안녕하세요, 여러분. 오늘은 달리기 경기 사진에 왜 가끔 바퀴가 있을 수 없는 모양으로 휘어 보이는지 이야기하려 합니다. 많은 카메라는 화면 전체를 한 번에 담지 않습니다. 센서를 위에서 아래로 한 줄씩 읽어 내려가는데, 그 훑기에 몇천 분의 1초가 걸립니다. 멈춰 있는 장면은 그 사이에 아무것도 달라지지 않으니 이상해 보일 것도 없습니다. 그런데 도는 바퀴는 첫 줄과 마지막 줄 사이에 움직입니다. 그래서 바퀴 위쪽은 한 자리에, 아래쪽은 다른 자리에 기록됩니다. 여러분이 보는 그 휘어짐은 렌즈의 결함이 아닙니다. 한 물체의 여러 순간이 한 장에 쌓인 그림입니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 내용이 아닌 것은?",
      lines: [
        ["W", "Hello, everyone. Today I want to talk about why a photograph of a running race sometimes shows a wheel bent into an impossible shape."],
        ["W", "Many cameras do not capture the whole frame at once."],
        ["W", "They read the sensor line by line, from top to bottom, and that sweep takes a few thousandths of a second."],
        ["W", "Nothing in a still scene changes during that sweep, so nothing looks wrong."],
        ["W", "But a spinning wheel moves between the first line and the last."],
        ["W", "It is a picture of one object at several different moments, stacked into a single frame."],
      ],
      choices: [
        "a camera not capturing the whole frame at once",
        "the sensor being read line by line",
        "a still scene showing nothing wrong",
        "a wheel moving between the first and last line",
        "a flash freezing the wheel in place",
      ],
      answer: 5,
      clue: "Many cameras do not capture the whole frame at once.",
      explanation:
        "카메라가 한 번에 담지 않는다는 것, 센서를 줄 단위로 읽는다는 것, 멈춘 장면은 이상하지 않다는 것, 바퀴가 첫 줄과 마지막 줄 사이에 움직인다는 것은 언급되지만 플래시가 바퀴를 멈춰 세운다는 것은 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
