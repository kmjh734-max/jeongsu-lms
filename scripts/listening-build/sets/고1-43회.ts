/** 고1 듣기 43회 — 사람이 직접 쓴 회차 (2026-09-29) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고1 43회",
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
          "Good afternoon, students. This is Ms. Han from the library. " +
            "As you know, our reading room has only forty seats, " +
            "and lately more than a hundred students come during exam weeks. " +
            "Starting next Monday, we are opening the seminar room on the third floor " +
            "as an extra study space from four until eight in the evening. " +
            "Twenty more seats will be available there every weekday. " +
            "You do not need to reserve a seat in advance, " +
            "but please write your name and class on the sheet by the door. " +
            "Keep your phone on silent and speak only in the hallway. " +
            "We hope this gives everyone a quiet place to work. " +
            "Thank you for listening.",
        ],
      ],
      choices: [
        "새 학습 공간 개방을 알리려고",
        "도서관 공사를 안내하려고",
        "독서 행사 참가를 권하려고",
        "시험 일정 변경을 알리려고",
        "분실물을 찾아가라고 알리려고",
      ],
      answer: 1,
      clue: "we are opening the seminar room on the third floor",
      explanation:
        "3층 세미나실을 저녁 시간에 학습 공간으로 연다고 알리고 있다. 따라서 답은 ①이다.",
      translation: [
        "W: 학생 여러분, 안녕하세요. 도서관의 한 선생입니다. 아시다시피 저희 열람실에는 자리가 마흔 개뿐인데, 요즘 시험 기간이면 백 명이 넘는 학생이 옵니다. 다음 주 월요일부터 3층 세미나실을 저녁 네 시부터 여덟 시까지 학습 공간으로 추가 개방합니다. 평일마다 스무 자리가 더 생깁니다. 미리 예약할 필요는 없지만, 문 옆 종이에 이름과 반을 적어 주세요. 휴대폰은 무음으로 두고 이야기는 복도에서만 해 주세요. 모두에게 조용히 공부할 자리가 생기기를 바랍니다. 들어 주셔서 고맙습니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 남자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Junho, you've been writing in that notebook after every practice."],
        ["M", "I write down three things right after the game ends."],
        ["W", "What kind of things do you write?"],
        ["M", "One thing that worked, one that didn't, and one to try next time."],
        ["W", "Doesn't the coach already tell you all that?"],
        ["M", "He does, but I forget half of it by the next morning."],
        ["W", "So writing it down makes it stay."],
        ["M", "The memory of how it felt fades within an hour."],
        ["W", "I usually just think about it on the way home."],
        ["M", "Thinking without writing turns into the same three regrets."],
        ["W", "That's true. I keep repeating the same mistakes."],
        ["M", "Writing right after practice is what actually changes the next one."],
        ["W", "Maybe I should try keeping one too."],
      ],
      choices: [
        "연습 직후에 기록해야 다음 연습이 달라진다",
        "연습 시간을 늘려야 실력이 는다",
        "감독의 조언을 그대로 따라야 한다",
        "경기 영상을 반복해서 봐야 한다",
        "동료와 함께 연습해야 효과가 크다",
      ],
      answer: 1,
      clue: "Writing right after practice is what actually changes the next one.",
      explanation:
        "남자는 연습 직후에 적어 두는 것이 다음 연습을 바꾼다고 말한다. 따라서 답은 ①이다.",
      translation: [
        "W: 준호야, 연습 끝날 때마다 그 공책에 뭘 쓰더라.",
        "M: 경기 끝나고 바로 세 가지를 적어.",
        "W: 어떤 걸 적는데?",
        "M: 잘된 것 하나, 안 된 것 하나, 다음에 해 볼 것 하나.",
        "W: 그건 감독님이 다 말씀해 주시잖아.",
        "M: 해 주시지. 그런데 다음 날 아침이면 절반은 잊어버려.",
        "W: 적어 두면 남는다는 거구나.",
        "M: 그때 느낌은 한 시간이면 흐려져.",
        "W: 나는 보통 집에 가면서 생각만 해.",
        "M: 안 적고 생각만 하면 늘 같은 후회 세 가지로 끝나.",
        "W: 맞아. 나는 같은 실수를 되풀이해.",
        "M: 연습 직후에 적는 게 다음 연습을 진짜로 바꿔.",
        "W: 나도 하나 써 볼까 봐.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "Many students believe that a longer study session means more learning. " +
            "But research on memory tells a different story. " +
            "When you read the same page for three hours, " +
            "your brain treats the later part as familiar noise. " +
            "What actually builds memory is returning to the material after a gap. " +
            "Reading a chapter today, again in two days, and once more next week " +
            "produces far stronger recall than nine hours in one sitting. " +
            "The gap feels uncomfortable because you forget a little each time. " +
            "That small forgetting is exactly what makes the next recall stronger. " +
            "So do not measure your study by hours spent at the desk. " +
            "Measure it by how many separate times you have come back to it.",
        ],
      ],
      choices: [
        "간격을 두고 여러 번 복습해야 오래 기억된다",
        "공부 시간을 늘릴수록 성적이 오른다",
        "조용한 곳에서 공부해야 집중이 잘된다",
        "어려운 과목부터 공부해야 효율이 높다",
        "필기를 많이 할수록 이해가 깊어진다",
      ],
      answer: 1,
      clue: "What actually builds memory is returning to the material after a gap.",
      explanation:
        "간격을 두고 여러 번 돌아오는 것이 기억을 만든다고 말한다. 따라서 답은 ①이다.",
      translation: [
        "W: 많은 학생이 오래 앉아 있을수록 더 많이 배운다고 믿습니다. 그러나 기억에 대한 연구는 다른 이야기를 들려줍니다. 같은 쪽을 세 시간 동안 읽으면 뇌는 뒤쪽을 익숙한 소음으로 여깁니다. 실제로 기억을 만드는 것은 시간을 두고 그 내용으로 돌아오는 일입니다. 오늘 한 단원을 읽고, 이틀 뒤에 다시 읽고, 다음 주에 한 번 더 읽는 편이 한 번에 아홉 시간을 하는 것보다 훨씬 오래 남습니다. 간격을 두면 매번 조금씩 잊어버려서 불편하게 느껴집니다. 그런데 그 작은 망각이야말로 다음에 떠올릴 때 기억을 더 단단하게 만듭니다. 그러니 책상에 앉은 시간으로 공부를 재지 마세요. 그 내용으로 몇 번을 따로 돌아왔는지로 재십시오.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["W", "Minjae, is this the photo of your club room?"],
        ["M", "Yes, we finished decorating it last Friday."],
        ["W", "The round clock above the door looks new."],
        ["M", "We bought that with the club budget."],
        ["W", "And there's a bookshelf on the left wall."],
        ["M", "Three shelves, full of old magazines."],
        ["W", "I see a striped rug under the table."],
        ["M", "That was my idea. It makes the floor warmer."],
        ["W", "Are those two plants by the window?"],
        ["M", "Only one plant, actually. The other is a lamp."],
        ["W", "And someone left a guitar leaning on the chair."],
        ["M", "That's mine. I practice there after school."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "Only one plant, actually. The other is a lamp.",
      explanation:
        "창가에 화분이 두 개라고 했지만 실제로는 하나뿐이라고 했다. 따라서 답은 ④이다.",
      figure: {
        kind: "figure5",
        scene:
          "Inside a small school club room, clean black line art on a plain white background, no writing or letters anywhere. " +
          "A ROUND CLOCK hangs above the door. " +
          "A BOOKSHELF with three shelves of magazines stands against the left wall. " +
          "A STRIPED RUG lies under a low table in the middle. " +
          "TWO POTTED PLANTS stand side by side by the window. " +
          "A GUITAR leans against a chair at the right.",
        spots: [
          [0.5, 0.12],
          [0.16, 0.45],
          [0.48, 0.8],
          [0.8, 0.42],
          [0.86, 0.72],
        ],
      },
      translation: [
        "W: 민재야, 이게 너희 동아리방 사진이야?",
        "M: 응, 지난 금요일에 꾸미기를 끝냈어.",
        "W: 문 위에 있는 둥근 시계가 새것 같네.",
        "M: 동아리 예산으로 샀어.",
        "W: 왼쪽 벽에는 책꽂이가 있네.",
        "M: 세 칸인데 오래된 잡지로 가득해.",
        "W: 탁자 밑에 줄무늬 깔개가 보여.",
        "M: 그건 내 생각이었어. 바닥이 따뜻해 보여.",
        "W: 창가에 있는 건 화분 두 개야?",
        "M: 사실 화분은 하나뿐이야. 다른 하나는 등이야.",
        "W: 그리고 누가 의자에 기타를 세워 뒀네.",
        "M: 그건 내 거야. 방과 후에 거기서 연습해.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 남자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Hyunwoo, the school festival opens in two hours."],
        ["M", "Our booth is ready except for the sound."],
        ["W", "Isn't the speaker connected to the laptop?"],
        ["M", "It is, but nothing comes out when we press play."],
        ["W", "Did you check the cable at the back?"],
        ["M", "I pushed it in twice and still nothing."],
        ["W", "Maybe the speaker itself is broken."],
        ["M", "The broadcasting club has a spare one."],
        ["W", "They're in the studio until three o'clock."],
        ["M", "Then I should go now before they leave."],
        ["W", "I'll finish setting out the chairs here."],
        ["M", "I'll go and borrow the spare speaker."],
      ],
      choices: [
        "의자를 놓기",
        "노트북을 고치기",
        "여분 스피커를 빌리러 가기",
        "방송실을 청소하기",
        "음악을 고르기",
      ],
      answer: 3,
      clue: "I'll go and borrow the spare speaker.",
      explanation:
        "남자는 방송부에서 여분 스피커를 빌려 오겠다고 했다. 따라서 답은 ③이다.",
      translation: [
        "W: 현우야, 두 시간 뒤에 축제가 시작해.",
        "M: 소리 빼고는 우리 부스 준비가 다 됐어.",
        "W: 스피커가 노트북에 연결돼 있지 않아?",
        "M: 연결은 됐는데 재생을 눌러도 아무 소리가 안 나.",
        "W: 뒤쪽 선은 확인했어?",
        "M: 두 번이나 꽂아 봤는데도 안 돼.",
        "W: 스피커 자체가 고장 났나 보다.",
        "M: 방송부에 여분이 하나 있어.",
        "W: 세 시까지는 방송실에 있을 거야.",
        "M: 그럼 가기 전에 지금 가야겠다.",
        "W: 나는 여기서 의자 놓는 걸 마무리할게.",
        "M: 내가 가서 여분 스피커를 빌려 올게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 여자가 지불할 금액을 고르시오.",
      lines: [
        ["M", "Welcome to the campus shop. What can I help you with?"],
        ["W", "I'd like three notebooks and two highlighter sets."],
        ["M", "The notebooks are four dollars each this week."],
        ["W", "They were five dollars last month, weren't they?"],
        ["M", "Yes, we lowered the price for the new term."],
        ["W", "And how much is one highlighter set?"],
        ["M", "Each set is six dollars."],
        ["W", "That comes to quite a lot altogether."],
        ["M", "Members of the student council get ten percent off."],
        ["W", "I am on the council. Here is my card."],
        ["M", "Then the discount applies to your whole order."],
        ["W", "Great, I'll pay by card."],
      ],
      choices: ["$20.40", "$21.60", "$22.50", "$24.00", "$26.40"],
      answer: 2,
      clue: "The notebooks are four dollars each this week.",
      explanation:
        "공책 세 권 12달러와 형광펜 두 세트 12달러로 24달러인데, 10퍼센트를 빼면 21.60달러이다. 따라서 답은 ②이다.",
      translation: [
        "M: 교내 매점에 오신 걸 환영합니다. 무엇을 도와드릴까요?",
        "W: 공책 세 권이랑 형광펜 두 세트 주세요.",
        "M: 이번 주에 공책은 한 권에 4달러입니다.",
        "W: 지난달에는 5달러 아니었나요?",
        "M: 맞습니다. 새 학기라 값을 내렸습니다.",
        "W: 형광펜 한 세트는 얼마예요?",
        "M: 한 세트에 6달러입니다.",
        "W: 다 합치면 꽤 되네요.",
        "M: 학생회 임원은 10퍼센트 할인됩니다.",
        "W: 제가 학생회예요. 여기 카드요.",
        "M: 그럼 전체 금액에 할인이 들어갑니다.",
        "W: 좋네요, 카드로 낼게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 여자가 동아리 모임에 참석할 수 없는 이유를 고르시오.",
      lines: [
        ["M", "Seoyeon, are you coming to the club meeting on Thursday?"],
        ["W", "I really want to, but I can't make it this time."],
        ["M", "Is it your part-time job again?"],
        ["W", "No, I quit that at the end of last month."],
        ["M", "Then is it the math tutoring you mentioned?"],
        ["W", "That moved to Friday, so it's not that either."],
        ["M", "You're not sick, are you?"],
        ["W", "I'm fine. My grandmother is having eye surgery that day."],
        ["M", "Oh, I hope everything goes well."],
        ["W", "I'm going to the hospital with my mother to stay with her."],
        ["M", "Of course. I'll send you the notes afterwards."],
        ["W", "Thank you. I'll be at the next one for sure."],
      ],
      choices: [
        "아르바이트를 해야 해서",
        "수학 과외가 있어서",
        "할머니의 수술 때문에 병원에 가야 해서",
        "몸이 아파서",
        "가족 여행을 가야 해서",
      ],
      answer: 3,
      clue: "My grandmother is having eye surgery that day.",
      explanation:
        "여자는 할머니 눈 수술 때문에 병원에 간다고 했다. 따라서 답은 ③이다.",
      translation: [
        "M: 서연아, 목요일 동아리 모임에 올 거야?",
        "W: 정말 가고 싶은데 이번에는 못 가.",
        "M: 또 아르바이트야?",
        "W: 아니, 지난달 말에 그만뒀어.",
        "M: 그럼 말했던 수학 과외?",
        "W: 그건 금요일로 옮겼어. 그것도 아니야.",
        "M: 어디 아픈 건 아니지?",
        "W: 나는 괜찮아. 그날 할머니가 눈 수술을 받으셔.",
        "M: 아, 잘되시면 좋겠다.",
        "W: 어머니랑 병원에 가서 곁에 있을 거야.",
        "M: 그럼 당연히 가야지. 끝나고 내가 정리해서 보내 줄게.",
        "W: 고마워. 다음에는 꼭 갈게.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 도서 축제에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["M", "Jiwon, have you heard about the city book festival?"],
        ["W", "I saw the poster. When does it open?"],
        ["M", "From the tenth to the twelfth of next month."],
        ["W", "Where is it being held this year?"],
        ["M", "At the culture center next to the river park."],
        ["W", "What can people do there?"],
        ["M", "There are author talks, a used book market and a writing workshop."],
        ["W", "Do we have to pay to get in?"],
        ["M", "Entry is free, but the workshop costs five thousand won."],
        ["W", "How do we sign up for the workshop?"],
        ["M", "Through the city website, starting this Friday."],
        ["W", "Then I'll register on Friday morning."],
      ],
      choices: ["열리는 기간", "열리는 장소", "진행되는 행사", "입장료", "참여 인원"],
      answer: 5,
      clue: "From the tenth to the twelfth of next month.",
      explanation:
        "기간, 장소, 행사, 입장료는 말했지만 참여 인원은 말하지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 지원아, 시에서 하는 책 축제 들어 봤어?",
        "W: 안내문은 봤어. 언제 열어?",
        "M: 다음 달 10일부터 12일까지.",
        "W: 올해는 어디서 해?",
        "M: 강변 공원 옆 문화 센터에서.",
        "W: 거기서 뭘 할 수 있어?",
        "M: 작가와의 만남, 헌책 장터, 글쓰기 강좌가 있어.",
        "W: 들어가는 데 돈을 내야 해?",
        "M: 입장은 무료인데 글쓰기 강좌는 5천 원이야.",
        "W: 강좌는 어떻게 신청해?",
        "M: 이번 주 금요일부터 시 누리집에서.",
        "W: 그럼 금요일 아침에 신청할게.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "다음을 듣고, 겨울 방학 진로 캠프에 관한 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "M",
          "Hello, students. Here is the information about the winter career camp. " +
            "The camp runs for three days, from January eighth to tenth. " +
            "It takes place at the youth training center in Yangpyeong. " +
            "Forty students from the first and second grades may join. " +
            "Each day begins with a talk by someone working in a different field. " +
            "In the afternoon you work in small groups on a real problem. " +
            "The fee is thirty thousand won, which covers meals and the bus. " +
            "Applications close at the end of this month. " +
            "Hand your form to the career counseling office.",
        ],
      ],
      choices: [
        "3일 동안 진행된다",
        "양평의 청소년 수련관에서 열린다",
        "1·2학년 40명이 참여할 수 있다",
        "오후에는 모둠 활동을 한다",
        "참가비에 교통비는 포함되지 않는다",
      ],
      answer: 5,
      clue: "The fee is thirty thousand won, which covers meals and the bus.",
      explanation:
        "참가비에 식사와 버스가 포함된다고 했으므로 ⑤가 일치하지 않는다.",
      translation: [
        "M: 학생 여러분, 안녕하세요. 겨울 진로 캠프 안내입니다. 캠프는 1월 8일부터 10일까지 사흘 동안 진행됩니다. 양평에 있는 청소년 수련관에서 열립니다. 1학년과 2학년 학생 40명이 참여할 수 있습니다. 매일 아침은 서로 다른 분야에서 일하는 분의 강연으로 시작합니다. 오후에는 작은 모둠으로 실제 문제를 다룹니다. 참가비는 3만 원이고 식사와 버스가 포함됩니다. 신청은 이번 달 말에 마감합니다. 신청서는 진로 상담실에 내시면 됩니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 선택할 강좌를 고르시오.",
      lines: [
        ["W", "Taehyun, which weekend course should we take together this winter?"],
        ["M", "Five courses are open at the community center right now."],
        ["W", "We both have volunteer work every Saturday morning."],
        ["M", "So anything held on Saturday morning is out for us."],
        ["W", "That still leaves us with more than one choice."],
        ["M", "The fee also has to stay under sixty thousand won."],
        ["W", "My parents said that is the most they can cover."],
        ["M", "One of these courses is far above that amount."],
        ["W", "And I'd rather not sign up for an eight-week course."],
        ["M", "You mean something six weeks or shorter."],
        ["W", "Exactly. Our exams start right after that."],
        ["M", "Then only one course fits all three conditions."],
        ["W", "Let's register tonight before the seats fill up."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "We both have volunteer work every Saturday morning.",
      explanation:
        "토요일 오전이 아니고 6만 원 미만이며 6주 이하인 강좌는 ④이다. 따라서 답은 ④이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Time: Sat morning / Fee: 45,000 won / Weeks: 6" },
          { no: 2, label: "②", value: "Time: Sun afternoon / Fee: 70,000 won / Weeks: 6" },
          { no: 3, label: "③", value: "Time: Sun morning / Fee: 50,000 won / Weeks: 8" },
          { no: 4, label: "④", value: "Time: Sun afternoon / Fee: 55,000 won / Weeks: 5" },
          { no: 5, label: "⑤", value: "Time: Sat morning / Fee: 58,000 won / Weeks: 4" },
        ],
      },
      translation: [
        "W: 태현아, 이번 겨울에 주말 강좌 뭘 같이 들을까?",
        "M: 지금 주민 센터에 다섯 개가 열려 있어.",
        "W: 우리 둘 다 토요일 오전마다 봉사가 있어.",
        "M: 그럼 토요일 오전에 하는 건 우리한테 빠지네.",
        "W: 그래도 고를 게 하나보다는 많아.",
        "M: 수강료도 6만 원 미만이어야 해.",
        "W: 부모님이 그만큼까지만 내 주신다고 하셨어.",
        "M: 이 중 하나는 그 액수를 훨씬 넘어.",
        "W: 그리고 8주짜리는 신청하고 싶지 않아.",
        "M: 6주 이하로 하자는 거지.",
        "W: 응, 그 뒤에 바로 시험이 시작돼.",
        "M: 그럼 세 조건에 다 맞는 건 하나뿐이야.",
        "W: 자리 차기 전에 오늘 밤에 신청하자.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Did you finish the reading for tomorrow's discussion?"],
        ["M", "I read the first half last night."],
        ["W", "The second half is where the argument turns."],
        ["M", "I'll get to it after dinner."],
        ["W", "Do you want to go over it together afterwards?"],
      ],
      choices: [
        "Sure, let's meet at eight.",
        "I already finished the discussion.",
        "There is no reading tomorrow.",
        "I don't like that subject.",
        "The book was too short.",
      ],
      answer: 1,
      clue: "Do you want to go over it together afterwards?",
      explanation:
        "나중에 같이 살펴보자는 제안이므로, 여덟 시에 만나자는 ①이 가장 자연스럽다.",
      translation: [
        "W: 내일 토론에 쓸 자료 다 읽었어?",
        "M: 어젯밤에 앞의 절반을 읽었어.",
        "W: 뒤쪽 절반에서 논지가 뒤집혀.",
        "M: 저녁 먹고 읽을게.",
        "W: 그다음에 같이 한 번 훑어볼까?",
        "M: 좋아, 여덟 시에 만나자.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Excuse me, is this the line for the career counseling room?"],
        ["W", "Yes, but the counselor is with a student right now."],
        ["M", "Do you know how long each session takes?"],
        ["W", "About twenty minutes, usually."],
        ["M", "Should I wait here or come back later?"],
      ],
      choices: [
        "The room is closed today.",
        "Waiting here is fine.",
        "I don't need counseling.",
        "You should go home now.",
        "The counselor left already.",
      ],
      answer: 2,
      clue: "Should I wait here or come back later?",
      explanation:
        "여기서 기다릴지 물었으므로, 기다려도 된다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 실례합니다, 진로 상담실 줄이 여기인가요?",
        "W: 네, 그런데 지금 선생님이 다른 학생과 상담 중이세요.",
        "M: 한 번에 얼마나 걸리는지 아세요?",
        "W: 보통 20분쯤요.",
        "M: 여기서 기다릴까요, 나중에 다시 올까요?",
        "W: 여기서 기다리시면 됩니다.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Dain, how is the school newspaper coming along this term?"],
        ["W", "We have plenty of articles but almost no readers."],
        ["M", "How many copies do you print each month?"],
        ["W", "Two hundred, and about half of them are left over."],
        ["M", "Where do you put the copies?"],
        ["W", "On the table outside the teachers' room."],
        ["M", "Hardly any student passes by that door."],
        ["W", "I chose it because there was space on the table."],
        ["M", "Space is easy to find where nobody goes."],
        ["W", "I never thought about it that way."],
        ["M", "Where do students actually gather in the morning?"],
      ],
      choices: [
        "Nobody comes to school early.",
        "In front of the cafeteria, mostly.",
        "We stopped printing the paper.",
        "The teachers' room is popular.",
        "I write all the articles myself.",
      ],
      answer: 2,
      clue: "Where do students actually gather in the morning?",
      explanation:
        "학생들이 아침에 어디에 모이는지 물었으므로, 급식실 앞이라는 ②가 가장 자연스럽다.",
      translation: [
        "M: 다인아, 이번 학기 학교 신문은 잘돼 가?",
        "W: 기사는 많은데 읽는 사람이 거의 없어.",
        "M: 매달 몇 부나 찍어?",
        "W: 200부인데 절반쯤 남아.",
        "M: 어디에 놓아 둬?",
        "W: 교무실 밖 탁자에.",
        "M: 그 문 앞으로는 학생이 거의 안 지나가.",
        "W: 탁자에 자리가 있어서 거기로 정했어.",
        "M: 아무도 안 가는 곳에는 자리가 늘 있지.",
        "W: 그렇게는 생각해 본 적이 없어.",
        "M: 아침에 학생들이 실제로 어디에 모여?",
        "W: 대부분 급식실 앞에.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Seokjin, you said you wanted to read more this year."],
        ["M", "I set a goal of thirty books in January."],
        ["W", "How many have you finished so far?"],
        ["M", "Four, and we're already in October."],
        ["W", "What usually stops you?"],
        ["M", "I pick thick books and give up around page fifty."],
        ["W", "Do you choose them yourself?"],
        ["M", "I take whatever is on the recommended list."],
        ["W", "A list made for everyone fits almost no one."],
        ["M", "So I should pick something I actually want to read."],
        ["W", "What kind of story do you enjoy most?"],
      ],
      choices: [
        "I don't enjoy any stories.",
        "Mysteries, ever since middle school.",
        "I finished thirty books already.",
        "Reading is a waste of time.",
        "The list has no books.",
      ],
      answer: 2,
      clue: "What kind of story do you enjoy most?",
      explanation:
        "어떤 이야기를 좋아하는지 물었으므로, 추리물이라는 ②가 가장 자연스럽다.",
      translation: [
        "W: 석진아, 올해 책을 더 읽고 싶다고 했잖아.",
        "M: 1월에 서른 권을 목표로 세웠어.",
        "W: 지금까지 몇 권 읽었어?",
        "M: 네 권. 벌써 10월인데.",
        "W: 보통 뭐 때문에 못 읽어?",
        "M: 두꺼운 책을 골라서 50쪽쯤에서 포기해.",
        "W: 네가 직접 골라?",
        "M: 추천 목록에 있는 걸 그냥 가져와.",
        "W: 모두를 위해 만든 목록은 거의 누구에게도 안 맞아.",
        "M: 내가 진짜 읽고 싶은 걸 골라야겠네.",
        "W: 어떤 이야기를 제일 좋아해?",
        "M: 중학교 때부터 추리물.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Jihye가 Minho에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Jihye : ________________",
      lines: [
        [
          "W",
          "Jihye and Minho are members of the same debate team at school. " +
            "Next week the team is going to the regional competition, " +
            "and each member has to submit a written outline beforehand. " +
            "Minho has written a very strong argument, but his outline is six pages long. " +
            "The rules clearly state that the outline must be two pages or fewer. " +
            "Jihye knows that judges reject any outline over the limit without reading it. " +
            "She does not want the team to lose points before the debate even starts. " +
            "She wants to tell him to cut the outline down to the required length. " +
            "In this situation, what would Jihye most likely say to Minho?",
        ],
      ],
      choices: [
        "You should write three more pages.",
        "The competition was cancelled.",
        "Cut your outline down to two pages.",
        "Let's skip the competition this year.",
        "Judges never read the outlines.",
      ],
      answer: 3,
      clue: "She wants to tell him to cut the outline down to the required length.",
      explanation:
        "개요가 분량 제한을 넘었으므로, 두 쪽으로 줄이라는 ③이 가장 적절하다.",
      translation: [
        "W: 지혜와 민호는 같은 학교 토론팀 팀원입니다. 다음 주에 팀은 지역 대회에 나가는데, 팀원마다 미리 개요를 써서 내야 합니다. 민호는 아주 탄탄한 논지를 썼지만 개요가 여섯 쪽입니다. 규정에는 개요가 두 쪽을 넘으면 안 된다고 분명히 적혀 있습니다. 지혜는 심사위원이 분량을 넘긴 개요는 읽지도 않고 돌려보낸다는 것을 압니다. 그녀는 토론이 시작되기도 전에 팀이 점수를 잃는 것을 원하지 않습니다. 그녀는 개요를 정해진 분량으로 줄이라고 말하고 싶습니다. 이런 상황에서 지혜가 민호에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 남자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Good morning, everyone. Today I want to talk about how small habits " +
            "shape the way we handle large tasks. " +
            "Consider a student who tidies her desk for two minutes each night. " +
            "She is not just keeping the room clean; " +
            "she is deciding, every night, what tomorrow will look like. " +
            "The same is true of the runner who lays out his shoes before bed, " +
            "the writer who leaves one sentence unfinished to start the next day, " +
            "and the cook who washes the pan while the food is still warm. " +
            "None of these actions takes more than a few minutes. " +
            "What they share is that they remove the friction from the next step. " +
            "Big goals are rarely lost to a lack of effort. " +
            "They are lost to the small barriers we never bother to clear away. " +
            "If you want to change something large, start by removing one small obstacle tonight.",
        ],
      ],
      choices: [
        "how small habits remove barriers to the next step",
        "why large goals create lasting motivation",
        "how regular exercise improves daily health",
        "why tidying a room changes one's character",
        "how time management begins with a planner",
      ],
      answer: 1,
      clue: "What they share is that they remove the friction from the next step.",
      explanation:
        "작은 습관이 다음 단계의 마찰을 없앤다는 것이 중심 내용이다. 따라서 답은 ①이다.",
      translation: [
        "M: 여러분, 안녕하세요. 오늘은 작은 습관이 큰 일을 다루는 방식을 어떻게 바꾸는지 이야기하려 합니다. 매일 밤 2분씩 책상을 정리하는 학생을 생각해 봅시다. 그 학생은 방을 깨끗이 하는 것만이 아니라, 매일 밤 내일이 어떤 모습일지를 정하고 있는 것입니다. 자기 전에 운동화를 꺼내 두는 달리기 하는 사람, 다음 날 이어 쓰려고 한 문장을 일부러 남겨 두는 작가, 음식이 아직 따뜻할 때 냄비를 씻는 요리하는 사람도 마찬가지입니다. 이 가운데 몇 분을 넘게 잡아먹는 일은 하나도 없습니다. 이들의 공통점은 다음 단계의 마찰을 없앤다는 것입니다. 큰 목표는 노력이 모자라서 무너지는 일이 드뭅니다. 우리가 치우지 않고 내버려 둔 작은 걸림돌 때문에 무너집니다. 큰 것을 바꾸고 싶다면 오늘 밤 작은 걸림돌 하나를 치우는 일부터 시작하십시오.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "다음을 듣고, 언급된 예가 아닌 것을 고르시오.",
      lines: [
        ["M", "Consider a student who tidies her desk for two minutes each night."],
        ["M", "The same is true of the runner who lays out his shoes before bed."],
        ["M", "The writer leaves one sentence unfinished to start the next day."],
        ["M", "The cook washes the pan while the food is still warm."],
        ["M", "None of these actions takes more than a few minutes."],
      ],
      choices: [
        "a student tidying her desk",
        "a runner laying out his shoes",
        "a writer leaving a sentence unfinished",
        "a cook washing the pan",
        "a traveler packing a bag in advance",
      ],
      answer: 5,
      clue: "The cook washes the pan while the food is still warm.",
      explanation:
        "책상을 정리하는 학생, 운동화를 꺼내 두는 사람, 문장을 남겨 두는 작가, 냄비를 씻는 사람은 언급되지만 미리 가방을 싸는 여행자는 나오지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
