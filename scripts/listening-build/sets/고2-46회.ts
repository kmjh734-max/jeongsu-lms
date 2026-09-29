/** 고2 듣기 46회 — 사람이 직접 쓴 회차 (2026-09-29) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고2 46회",
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
          "Good afternoon, students. This is the school health office. " +
            "Over the past month sixteen students have come to us " +
            "with pain in the neck and shoulders, all of them in the second grade. " +
            "We asked each one the same question and got the same answer: " +
            "they study with the book flat on the desk for four hours at a time. " +
            "A head bent forward at that angle carries the weight of a bowling ball. " +
            "From this week we are lending out book stands, free of charge, " +
            "one per student, returned at the end of the school year. " +
            "Come to the health office during lunch and sign your name. " +
            "We have forty stands, and they will go quickly.",
        ],
      ],
      choices: [
        "독서대를 빌려준다고 알리려고",
        "보건실 이용 시간을 알리려고",
        "자세 교정 강좌를 안내하려고",
        "책상 교체를 알리려고",
        "건강 검진을 안내하려고",
      ],
      answer: 1,
      clue: "we are lending out book stands, free of charge",
      explanation:
        "독서대를 무료로 빌려준다고 알리고 있다. 따라서 답은 ①이다.",
      translation: [
        "W: 학생 여러분, 안녕하세요. 보건실입니다. 지난 한 달 동안 목과 어깨가 아프다고 찾아온 학생이 열여섯 명이었고, 모두 2학년이었습니다. 한 사람씩 같은 것을 물었더니 같은 답이 돌아왔습니다. 책을 책상에 눕혀 놓고 한 번에 네 시간씩 공부한다는 것입니다. 그 각도로 숙인 머리는 볼링공 하나의 무게를 견딥니다. 이번 주부터 독서대를 무료로 빌려 드립니다. 한 사람에 하나씩이고 학년이 끝날 때 돌려주시면 됩니다. 점심시간에 보건실로 오셔서 이름을 적어 주세요. 마흔 개뿐이라 금방 나갈 것입니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 남자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Chaewon says you refuse to study in your own room."],
        ["M", "I use the library or the kitchen table instead."],
        ["W", "But your room is quiet and nobody bothers you there."],
        ["M", "It is also where I sleep and where I do nothing."],
        ["W", "Does that really matter to how you work?"],
        ["M", "The room has been telling me to relax for sixteen years."],
        ["W", "So sitting down there feels like the end of the day."],
        ["M", "Within ten minutes I am lying on the bed."],
        ["W", "The library must be less comfortable, though."],
        ["M", "That is exactly why it works."],
        ["W", "I never thought a place could carry a habit."],
        ["M", "A room teaches you what to do in it, whether you like it or not."],
        ["W", "I might move to the kitchen tonight."],
      ],
      choices: [
        "공부하는 장소가 몸에 밴 습관을 불러온다",
        "조용한 곳에서 공부해야 한다",
        "공부는 정해진 시각에 해야 한다",
        "도서관이 가장 좋은 공부 장소다",
        "잠은 충분히 자야 한다",
      ],
      answer: 1,
      clue: "A room teaches you what to do in it, whether you like it or not.",
      explanation:
        "남자는 장소가 그 안에서 할 일을 가르친다고 말한다. 따라서 답은 ①이다.",
      translation: [
        "W: 채원이가 그러는데 너는 네 방에서는 공부를 안 한다며.",
        "M: 대신 도서관이나 부엌 식탁을 써.",
        "W: 그래도 네 방은 조용하고 아무도 안 건드리잖아.",
        "M: 거기는 내가 자는 데이기도 하고 아무것도 안 하는 데이기도 해.",
        "W: 그게 일하는 데 정말 영향을 줘?",
        "M: 그 방은 열여섯 해 동안 나한테 쉬라고 말해 왔어.",
        "W: 그래서 거기 앉으면 하루가 끝난 것처럼 느껴지는구나.",
        "M: 10분이면 침대에 누워 있어.",
        "W: 그래도 도서관은 덜 편할 텐데.",
        "M: 바로 그래서 되는 거야.",
        "W: 장소가 습관을 지니고 있다는 생각은 못 했어.",
        "M: 방은 좋든 싫든 그 안에서 뭘 할지를 가르쳐.",
        "W: 오늘 밤엔 부엌으로 옮겨 볼까 봐.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "We tend to think a skill is something you either have or do not. " +
            "Watch someone learn one and a different picture appears. " +
            "Progress is not a slope; it is a staircase with long flat steps. " +
            "For weeks nothing improves, and then in one afternoon it does. " +
            "Almost everyone quits during a flat step, " +
            "believing that the flatness is a message about their ability. " +
            "It is not. It is what learning looks like from inside. " +
            "The person who continues is rarely more talented; " +
            "she simply happened to keep going through the part that felt like failure.",
        ],
      ],
      choices: [
        "나아지지 않는 구간은 배움의 자연스러운 모습이다",
        "재능보다 노력이 중요하다",
        "목표를 작게 나눠야 한다",
        "꾸준히 연습해야 실력이 는다",
        "실패에서 배우는 것이 많다",
      ],
      answer: 1,
      clue: "It is what learning looks like from inside.",
      explanation:
        "정체 구간이 배움의 자연스러운 모습이라고 말한다. 따라서 답은 ①이다.",
      translation: [
        "W: 우리는 어떤 능력을 두고 있거나 없거나 둘 중 하나라고 여기곤 합니다. 누군가 그것을 익히는 모습을 지켜보면 다른 그림이 나타납니다. 나아짐은 비탈이 아니라 긴 평지가 이어지는 계단입니다. 몇 주 동안 아무것도 나아지지 않다가, 어느 오후에 갑자기 나아집니다. 거의 모든 사람이 그 평평한 구간에서 그만둡니다. 그 평평함이 자기 능력에 대한 전갈이라고 믿기 때문입니다. 그렇지 않습니다. 그것이 안에서 본 배움의 모습입니다. 계속하는 사람은 재능이 더 많은 경우가 드뭅니다. 그저 실패처럼 느껴지는 그 구간을 지나쳐 계속 갔을 뿐입니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["M", "Bora, is this the photo of the club's exhibition room?"],
        ["W", "Yes, we finished hanging everything on Tuesday."],
        ["M", "There's a long bench down the middle of the room."],
        ["W", "Visitors sit there and look at both walls."],
        ["M", "And a round clock hangs above the entrance."],
        ["W", "A square clock, actually. The round one broke last year."],
        ["M", "I see four frames on the left wall."],
        ["W", "One photograph in each, all taken at the river."],
        ["M", "There's a small table by the window."],
        ["W", "The visitors' book sits on it."],
        ["M", "And a potted plant stands in the far corner."],
        ["W", "It came from the science room."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 2,
      clue: "A square clock, actually. The round one broke last year.",
      explanation:
        "입구 위 시계가 둥글다고 했지만 네모난 시계라고 했다. 따라서 답은 ②이다.",
      figure: {
        kind: "figure5",
        scene:
          "A small exhibition room in a school, clean black line art on a plain white background, no writing or letters anywhere. " +
          "A LONG BENCH runs down the middle of the room. " +
          "A ROUND CLOCK hangs on the wall above the entrance. " +
          "FOUR PICTURE FRAMES hang in a row on the left wall. " +
          "A SMALL TABLE stands by the window. " +
          "A POTTED PLANT stands in the far corner.",
        spots: [
          [0.5, 0.68],
          [0.5, 0.12],
          [0.12, 0.38],
          [0.82, 0.62],
          [0.88, 0.3],
        ],
      },
      translation: [
        "M: 보라야, 이게 동아리 전시실 사진이야?",
        "W: 응, 화요일에 다 걸었어.",
        "M: 방 한가운데를 따라 긴 의자가 있네.",
        "W: 관람객이 거기 앉아서 양쪽 벽을 봐.",
        "M: 그리고 입구 위에 둥근 시계가 걸려 있고.",
        "W: 사실 네모난 시계야. 둥근 건 작년에 망가졌어.",
        "M: 왼쪽 벽에 액자가 네 개 보여.",
        "W: 하나에 사진 한 장씩, 전부 강가에서 찍은 거야.",
        "M: 창가에 작은 탁자가 있네.",
        "W: 그 위에 방명록이 놓여 있어.",
        "M: 그리고 저 끝 구석에 화분이 있고.",
        "W: 과학실에서 가져온 거야.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 남자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Taemin, the career talk starts in forty minutes."],
        ["M", "The seminar room is set up and the chairs are out."],
        ["W", "Did anyone collect the speaker from the front gate?"],
        ["M", "The teacher said she would meet him there."],
        ["W", "She's been stuck in a meeting since two o'clock."],
        ["M", "Then nobody is waiting for him at all."],
        ["W", "He arrives at the gate in about ten minutes."],
        ["M", "And he has never been to this school before."],
        ["W", "He'd never find the third floor on his own."],
        ["M", "Then someone has to be standing there."],
        ["W", "I'll finish setting out the handouts here."],
        ["M", "I'll go down and meet the speaker at the gate."],
      ],
      choices: [
        "유인물을 놓기",
        "의자를 놓기",
        "정문에서 강연자를 맞이하기",
        "선생님을 부르기",
        "세미나실을 예약하기",
      ],
      answer: 3,
      clue: "I'll go down and meet the speaker at the gate.",
      explanation:
        "남자는 정문에서 강연자를 맞이하러 가겠다고 했다. 따라서 답은 ③이다.",
      translation: [
        "W: 태민아, 진로 특강이 40분 뒤에 시작해.",
        "M: 세미나실은 다 준비했고 의자도 놓았어.",
        "W: 정문에서 강연자분은 누가 모셔 오기로 했어?",
        "M: 선생님이 거기서 만나신다고 하셨어.",
        "W: 두 시부터 회의에 붙들려 계셔.",
        "M: 그럼 아무도 안 기다리고 있는 거네.",
        "W: 10분쯤 뒤에 정문에 도착하셔.",
        "M: 우리 학교에 한 번도 오신 적이 없고.",
        "W: 혼자서는 3층을 절대 못 찾으실 거야.",
        "M: 그럼 누가 거기 서 있어야 해.",
        "W: 나는 여기서 유인물 놓는 걸 마무리할게.",
        "M: 내가 내려가서 정문에서 강연자분을 맞이할게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 여자가 지불할 금액을 고르시오.",
      lines: [
        ["M", "Welcome to the print shop. What can I do for you?"],
        ["W", "I need thirty copies of a four-page booklet."],
        ["M", "Black and white is fifty cents a page."],
        ["W", "Is color much more than that?"],
        ["M", "Color is one dollar fifty a page."],
        ["W", "Only the cover needs to be in color."],
        ["M", "Then three pages in black and white, one in color."],
        ["W", "That sounds right. Do you charge for binding?"],
        ["M", "Binding is free for orders over twenty copies."],
        ["W", "And is there a student rate?"],
        ["M", "Ten percent off the total with a school card."],
        ["W", "Here's my card. I'll pay now."],
      ],
      choices: ["$72.00", "$81.00", "$85.50", "$90.00", "$95.00"],
      answer: 2,
      clue: "Black and white is fifty cents a page.",
      explanation:
        "한 부에 흑백 세 쪽 1.5달러와 색 한 쪽 1.5달러로 3달러, 30부면 90달러인데 10퍼센트를 빼면 81달러이다. 따라서 답은 ②이다.",
      translation: [
        "M: 인쇄소에 오신 걸 환영합니다. 무엇을 도와드릴까요?",
        "W: 네 쪽짜리 소책자를 서른 부 뽑아야 해요.",
        "M: 흑백은 한 쪽에 50센트입니다.",
        "W: 색은 그보다 훨씬 비싼가요?",
        "M: 색은 한 쪽에 1달러 50센트입니다.",
        "W: 표지만 색으로 하면 돼요.",
        "M: 그럼 흑백 세 쪽에 색 한 쪽이네요.",
        "W: 맞아요. 제본 값도 받나요?",
        "M: 스무 부가 넘으면 제본은 무료입니다.",
        "W: 학생 할인은 있나요?",
        "M: 학생증이 있으면 전체에서 10퍼센트 할인됩니다.",
        "W: 여기 학생증이요. 지금 낼게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 남자가 봉사 활동 장소를 바꾼 이유를 고르시오.",
      lines: [
        ["W", "Dohyun, I heard you moved to a different volunteer place."],
        ["W", "You were at the library for almost a year."],
        ["M", "My last day there was two weeks ago."],
        ["W", "Did something go wrong with the staff?"],
        ["M", "Not at all. They wrote me a very kind letter."],
        ["W", "Then was the work not interesting enough?"],
        ["M", "Shelving books suited me better than I expected."],
        ["W", "So why change at all?"],
        ["M", "The library only needed help on Saturday mornings."],
        ["W", "And your Saturday mornings are now taken."],
        ["M", "The mock exams run every Saturday until February."],
        ["W", "Then the new place must meet on another day."],
      ],
      choices: [
        "일이 맞지 않아서",
        "직원들과 다퉈서",
        "몸이 아파서",
        "봉사 요일이 모의고사와 겹쳐서",
        "거리가 멀어서",
      ],
      answer: 4,
      clue: "The library only needed help on Saturday mornings.",
      explanation:
        "토요일 오전 봉사가 모의고사와 겹쳐 장소를 옮겼다. 따라서 답은 ④이다.",
      translation: [
        "W: 도현아, 봉사 장소를 옮겼다며.",
        "W: 도서관에서 거의 1년을 했잖아.",
        "M: 두 주 전이 거기서 마지막 날이었어.",
        "W: 직원분들이랑 무슨 일 있었어?",
        "M: 전혀. 아주 따뜻한 편지까지 써 주셨어.",
        "W: 그럼 일이 재미없었어?",
        "M: 책 꽂는 일이 생각보다 나한테 잘 맞았어.",
        "W: 그럼 왜 옮겼어?",
        "M: 도서관은 토요일 오전에만 손이 필요했어.",
        "W: 그런데 네 토요일 오전이 이제 찼구나.",
        "M: 2월까지 토요일마다 모의고사야.",
        "W: 그럼 새 데는 다른 요일에 하겠네.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 교내 밴드 공연에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["W", "Kiwon, is your band playing at the winter concert?"],
        ["W", "The notice went up in the music room this morning."],
        ["M", "I read it. When is the concert held?"],
        ["W", "On the second Friday of December, in the main hall."],
        ["M", "How many songs does each band play?"],
        ["W", "Two, and one of them has to be an original."],
        ["M", "How long does each band get on stage?"],
        ["W", "Twelve minutes, including setting up."],
        ["M", "That's tight if you have a drum kit."],
        ["W", "The school provides the drums and the amplifiers."],
        ["M", "Then we only carry guitars."],
        ["W", "Sign up at the music room by next Wednesday."],
        ["M", "I'll tell the others at practice tonight."],
      ],
      choices: ["열리는 날과 장소", "연주하는 곡 수", "무대에 주어지는 시간", "학교가 준비하는 것", "관람료"],
      answer: 5,
      clue: "On the second Friday of December, in the main hall.",
      explanation:
        "날짜와 장소, 곡 수, 시간, 학교 준비물은 말했지만 관람료는 말하지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 기원아, 너희 밴드 겨울 음악회에서 연주해?",
        "W: 오늘 아침에 음악실에 알림이 붙었어.",
        "M: 읽었어. 음악회가 언제야?",
        "W: 12월 둘째 주 금요일, 대강당에서.",
        "M: 한 밴드가 몇 곡 연주해?",
        "W: 두 곡. 그중 하나는 자작곡이어야 해.",
        "M: 무대에서 시간을 얼마나 줘?",
        "W: 설치하는 시간까지 12분.",
        "M: 드럼이 있으면 빠듯하겠다.",
        "W: 드럼이랑 앰프는 학교에서 준비해 줘.",
        "M: 그럼 우리는 기타만 들고 가면 되네.",
        "W: 다음 주 수요일까지 음악실에서 신청해.",
        "M: 오늘 밤 연습 때 다른 애들한테 말할게.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "다음을 듣고, 학교 독서 토론 대회에 관한 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "M",
          "Hello, students. Here is the information about the reading debate contest. " +
            "It takes place on the last Thursday of this month, after school. " +
            "Teams of four students take part, and each team needs a leader. " +
            "The library has chosen one novel that every team must read. " +
            "Copies are available at the library desk from tomorrow. " +
            "Each round lasts twenty minutes, with five minutes for questions. " +
            "Teams are drawn by lot on the day of the contest. " +
            "Sign up at the library desk by next Wednesday evening. " +
            "The winning team represents our school at the city contest.",
        ],
      ],
      choices: [
        "이번 달 마지막 목요일에 열린다",
        "네 명이 한 팀을 이룬다",
        "읽을 소설은 도서관이 정했다",
        "한 판은 20분 동안 진행된다",
        "팀은 미리 정해져 발표된다",
      ],
      answer: 5,
      clue: "Teams are drawn by lot on the day of the contest.",
      explanation:
        "대진은 대회 당일에 추첨으로 정한다고 했으므로 ⑤가 일치하지 않는다.",
      translation: [
        "M: 학생 여러분, 안녕하세요. 독서 토론 대회 안내입니다. 이번 달 마지막 목요일 방과 후에 열립니다. 네 명이 한 팀을 이루어 참가하고, 팀마다 팀장이 있어야 합니다. 모든 팀이 읽어야 할 소설 한 권을 도서관에서 정했습니다. 책은 내일부터 도서관 안내대에서 받으실 수 있습니다. 한 판은 20분 동안 진행되고 질문에 5분이 주어집니다. 대진은 대회 당일에 추첨으로 정합니다. 다음 주 수요일 저녁까지 도서관 안내대에서 신청해 주세요. 우승 팀은 시 대회에 우리 학교 대표로 나갑니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 남자가 예약할 숙소를 고르시오.",
      lines: [
        ["W", "Junho, which guesthouse will the club book for the trip?"],
        ["M", "Five places came up near the training center."],
        ["W", "How many of you are going in the end?"],
        ["M", "Fourteen, including the teacher who drives."],
        ["W", "Then places that sleep ten are out."],
        ["M", "Two of these take only ten guests."],
        ["W", "What about the price for one night?"],
        ["M", "Under sixty thousand won each, that's the limit."],
        ["W", "One of them is above that amount."],
        ["M", "And we need breakfast included, since we start at seven."],
        ["W", "Nobody would cook for fourteen at that hour."],
        ["M", "Then only one place fits everything."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 5,
      clue: "Fourteen, including the teacher who drives.",
      explanation:
        "14명 수용, 1인 6만 원 미만, 조식 포함인 숙소는 ⑤이다. 따라서 답은 ⑤이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Sleeps: 10 / Price: 50,000 won / Breakfast: Yes" },
          { no: 2, label: "②", value: "Sleeps: 16 / Price: 70,000 won / Breakfast: Yes" },
          { no: 3, label: "③", value: "Sleeps: 10 / Price: 55,000 won / Breakfast: No" },
          { no: 4, label: "④", value: "Sleeps: 16 / Price: 58,000 won / Breakfast: No" },
          { no: 5, label: "⑤", value: "Sleeps: 16 / Price: 57,000 won / Breakfast: Yes" },
        ],
      },
      translation: [
        "W: 준호야, 동아리 여행은 어느 숙소로 예약할 거야?",
        "M: 수련관 근처로 다섯 곳이 나왔어.",
        "W: 결국 몇 명이 가?",
        "M: 운전하시는 선생님까지 열네 명.",
        "W: 그럼 열 명짜리는 빠지네.",
        "M: 이 중 두 곳은 열 명까지만 받아.",
        "W: 하룻밤 값은?",
        "M: 한 사람에 6만 원 미만, 그게 한계야.",
        "W: 하나는 그보다 비싸.",
        "M: 그리고 일곱 시에 출발하니까 조식이 포함돼야 해.",
        "W: 그 시각에 열네 명 밥을 해 줄 사람은 없지.",
        "M: 그럼 다 맞는 곳은 하나뿐이야.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Have you finished the maths problem set?"],
        ["M", "I did the first twenty questions last night."],
        ["W", "The last five are the ones that matter."],
        ["M", "I'll work through them after dinner."],
        ["W", "Shall we compare answers tomorrow morning?"],
      ],
      choices: [
        "The set was due last week.",
        "Sure, before the bell.",
        "I don't take maths.",
        "There are no questions.",
        "I finished all of them.",
      ],
      answer: 2,
      clue: "Shall we compare answers tomorrow morning?",
      explanation:
        "내일 아침에 답을 견줘 보자는 제안이므로, 종 치기 전에 하자는 ②가 가장 자연스럽다.",
      translation: [
        "W: 수학 문제집 다 풀었어?",
        "M: 어젯밤에 앞의 스무 문제를 풀었어.",
        "W: 마지막 다섯 문제가 중요한 건데.",
        "M: 저녁 먹고 풀어 볼게.",
        "W: 내일 아침에 답을 맞춰 볼까?",
        "M: 좋아, 종 치기 전에.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Excuse me, can I leave my bag at the front desk?"],
        ["W", "Yes, we keep them behind the counter."],
        ["M", "Do I get a number or something?"],
        ["W", "A small tag, which you hand back to collect it."],
        ["M", "What if I lose the tag?"],
      ],
      choices: [
        "The desk is closed today.",
        "Then we check your student card.",
        "I don't keep bags.",
        "You can't leave anything.",
        "There are no tags.",
      ],
      answer: 2,
      clue: "What if I lose the tag?",
      explanation:
        "표를 잃어버리면 어떻게 하는지 물었으므로, 학생증을 확인한다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 실례합니다, 가방을 안내대에 맡길 수 있나요?",
        "W: 네, 계산대 뒤에 보관합니다.",
        "M: 번호표 같은 걸 받나요?",
        "W: 작은 표를 드리고, 찾으실 때 돌려주시면 됩니다.",
        "M: 표를 잃어버리면요?",
        "W: 그러면 학생증을 확인합니다.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Suyeon, how is the club's photo archive coming along?"],
        ["W", "We have eight years of photographs and nobody can find anything."],
        ["M", "How are the files stored at the moment?"],
        ["W", "In one folder, with the names the camera gave them."],
        ["M", "So every file is a number and a date code."],
        ["W", "Finding last year's festival takes about an hour."],
        ["M", "What would make a file easy to find later?"],
        ["W", "The year and the event in the name, I suppose."],
        ["M", "That would work even without any special program."],
        ["W", "We would have to rename eight thousand files, though."],
        ["M", "Could you start with just this year's?"],
      ],
      choices: [
        "No, all of them at once.",
        "Yes, that's manageable.",
        "We'll delete the archive.",
        "Nobody uses the photographs.",
        "The camera names are fine.",
      ],
      answer: 2,
      clue: "Could you start with just this year's?",
      explanation:
        "올해 것부터 시작할 수 있는지 물었으므로, 그 정도는 할 만하다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 수연아, 동아리 사진 보관은 잘돼 가?",
        "W: 8년 치 사진이 있는데 아무도 뭘 못 찾아.",
        "M: 지금은 파일을 어떻게 두고 있어?",
        "W: 폴더 하나에, 사진기가 붙인 이름 그대로.",
        "M: 그럼 파일마다 숫자랑 날짜 부호뿐이겠네.",
        "W: 작년 축제 찾는 데 한 시간쯤 걸려.",
        "M: 나중에 찾기 쉬우려면 뭐가 있어야 할까?",
        "W: 이름에 연도랑 행사가 들어가야겠지.",
        "M: 그러면 특별한 프로그램 없이도 되겠다.",
        "W: 그런데 파일 팔천 개 이름을 바꿔야 해.",
        "M: 올해 것부터만 해 보면 어때?",
        "W: 응, 그 정도는 할 만해.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Sangjun, you said you always run out of time in the essay exam."],
        ["M", "I never finish the last paragraph."],
        ["W", "How long do you spend planning before you write?"],
        ["M", "I start writing straight away, to save time."],
        ["W", "And then what happens halfway through?"],
        ["M", "I realize the second point should have come first."],
        ["W", "So you rewrite it there, in the exam."],
        ["M", "Crossing out and starting the paragraph again."],
        ["W", "That costs more than planning would have."],
        ["M", "I'd never counted it as a cost."],
        ["W", "How many minutes could you give to planning?"],
      ],
      choices: [
        "None at all.",
        "Three, at the start.",
        "I'll write even faster.",
        "Planning never helps.",
        "The whole hour.",
      ],
      answer: 2,
      clue: "How many minutes could you give to planning?",
      explanation:
        "계획에 몇 분을 쓸 수 있는지 물었으므로, 처음에 3분이라는 ②가 가장 자연스럽다.",
      translation: [
        "W: 상준아, 논술 시험 때 늘 시간이 모자란다고 했잖아.",
        "M: 마지막 문단을 한 번도 못 끝내.",
        "W: 쓰기 전에 얼마나 계획을 세워?",
        "M: 시간 아끼려고 바로 쓰기 시작해.",
        "W: 그러다 중간쯤에 무슨 일이 생겨?",
        "M: 두 번째 논점이 먼저 왔어야 했다는 걸 깨달아.",
        "W: 그래서 시험장에서 거기를 다시 쓰는구나.",
        "M: 그어 지우고 문단을 처음부터 다시 써.",
        "W: 그게 계획하는 것보다 더 비싸게 먹혀.",
        "M: 그걸 값으로 세어 본 적이 없어.",
        "W: 계획에 몇 분쯤 쓸 수 있겠어?",
        "M: 처음에 3분.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Yerin이 Seongho에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Yerin : ________________",
      lines: [
        [
          "W",
          "Yerin and Seongho are preparing the club's poster for the festival. " +
            "Seongho has printed the poster on very thin paper " +
            "because the thin paper was far cheaper at the shop. " +
            "The poster will hang outdoors on the fence by the front gate, " +
            "where the wind blows straight down the road all afternoon. " +
            "Yerin watched a thin notice tear apart there last month " +
            "within two hours of being put up. " +
            "She wants him to print it again on thicker paper. " +
            "In this situation, what would Yerin most likely say to Seongho?",
        ],
      ],
      choices: [
        "Print more copies of it.",
        "The festival is next month.",
        "We need thicker paper for outdoors.",
        "Let's hang it indoors instead.",
        "Thin paper is easier to read.",
      ],
      answer: 3,
      clue: "She wants him to print it again on thicker paper.",
      explanation:
        "얇은 종이가 바람에 찢어지므로, 두꺼운 종이에 다시 뽑자는 ③이 가장 적절하다.",
      translation: [
        "W: 예린이와 성호는 축제에 쓸 동아리 안내판을 준비하고 있습니다. 성호는 가게에서 얇은 종이가 훨씬 싸서 아주 얇은 종이에 뽑았습니다. 이 안내판은 정문 옆 울타리에 밖으로 걸리는데, 그곳은 오후 내내 도로를 따라 바람이 곧장 불어옵니다. 예린이는 지난달에 얇은 알림 종이가 붙인 지 두 시간 만에 찢어지는 것을 봤습니다. 그녀는 두꺼운 종이에 다시 뽑기를 바랍니다. 이런 상황에서 예린이가 성호에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 남자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Hello, everyone. Today I want to talk about the ways plants " +
            "get other living things to carry their seeds for them. " +
            "The burdock covers its seed in tiny hooks " +
            "that catch on the fur of any animal walking past. " +
            "The cherry wraps its seed in sweet flesh, " +
            "and a bird drops it kilometres away, complete with fertilizer. " +
            "The coconut seals its seed inside a floating shell " +
            "that can cross an ocean and still sprout on a beach. " +
            "Some ants carry seeds home for the oily lump attached to them, " +
            "eat that lump, and leave the seed safely underground. " +
            "A plant that cannot walk has found many others that can.",
        ],
      ],
      choices: [
        "how plants get their seeds carried to new places",
        "why some fruits are sweet",
        "how birds choose what to eat",
        "why coconuts grow near beaches",
        "how ants build their nests",
      ],
      answer: 1,
      clue: "A plant that cannot walk has found many others that can.",
      explanation:
        "식물이 씨앗을 옮기게 하는 방식이 중심 내용이다. 따라서 답은 ①이다.",
      translation: [
        "M: 여러분, 안녕하세요. 오늘은 식물이 다른 생물에게 제 씨앗을 나르게 하는 방식을 이야기하려 합니다. 우엉은 씨앗을 작은 갈고리로 감싸, 지나가는 짐승의 털에 걸리게 합니다. 벚나무는 씨앗을 단 과육으로 감싸고, 새가 몇 킬로미터 밖에 거름까지 곁들여 떨어뜨립니다. 야자는 씨앗을 물에 뜨는 껍데기 안에 봉해, 바다를 건너고도 해변에서 싹을 틔웁니다. 어떤 개미는 씨앗에 붙은 기름진 덩이를 노려 씨앗을 집으로 나르고, 그 덩이만 먹은 뒤 씨앗은 땅속에 안전하게 남깁니다. 걷지 못하는 식물이 걸을 수 있는 여럿을 찾아낸 것입니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "다음을 듣고, 언급된 것이 아닌 것을 고르시오.",
      lines: [
        ["M", "The burdock covers its seed in tiny hooks."],
        ["M", "The cherry wraps its seed in sweet flesh."],
        ["M", "The coconut seals its seed inside a floating shell."],
        ["M", "Some ants carry seeds home for the oily lump attached to them."],
        ["M", "A plant that cannot walk has found many others that can."],
      ],
      choices: ["burdock", "cherry", "coconut", "ants", "wind"],
      answer: 5,
      clue: "Some ants carry seeds home for the oily lump attached to them.",
      explanation:
        "우엉, 벚나무, 야자, 개미는 언급되지만 바람은 나오지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
