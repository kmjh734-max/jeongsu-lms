/** 고3 듣기 18회 — 사람이 직접 쓴 회차 (2026-09-21) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고3 18회",
  gradeLevel: "high3",
  speechSpeed: 0.8,
  folder: "고3 듣기",
  questions: [
    {
      order: 1,
      type: "목적 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 목적으로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Good afternoon, everyone. This is Mr. Wi from the third-year office. " +
            "I want to say something about the practice tests we take every month. " +
            "Most of you check the score, look at the rank, and put the paper in a drawer. " +
            "From this month we are setting aside the whole of Thursday's fourth period for something else. " +
            "You will sit with your own paper and write, for every question you got wrong, one line saying why. " +
            "Not the right answer; the reason your answer looked right at the time. " +
            "Those lines go in a single notebook that you keep until February. " +
            "Nobody collects it and nobody marks it. It is for you to read before the next test. " +
            "We begin this Thursday. Please bring last month's paper. Thank you.",
        ],
      ],
      choices: [
        "모의고사 일정이 바뀐 것을 알리려고",
        "성적표 배부 방법을 안내하려고",
        "자습 시간을 늘린다고 알리려고",
        "시험 응시 규칙을 설명하려고",
        "틀린 문제의 이유를 적는 시간을 새로 둔다고 안내하려고",
      ],
      answer: 5,
      clue: "You will sit with your own paper and write, for every question you got wrong, one line saying why.",
      explanation:
        "이번 달부터 목요일 4교시에 틀린 문제마다 그렇게 고른 이유를 한 줄씩 적는 시간을 둔다는 안내이다. 따라서 말의 목적은 ⑤이다.",
      translation: [
        "M: 여러분, 안녕하세요. 3학년부 위 선생님입니다. " +
          "매달 보는 모의고사에 대해 한 가지 말씀드리려 합니다. " +
          "대부분은 점수를 확인하고 등급을 보고 시험지를 서랍에 넣습니다. " +
          "이번 달부터 목요일 4교시 전체를 다른 일에 씁니다. " +
          "자기 시험지를 놓고, 틀린 문제마다 왜 그랬는지 한 줄씩 적습니다. " +
          "정답이 아니라, 그때 왜 그 답이 맞아 보였는지를 적는 것입니다. " +
          "그 줄들은 2월까지 쓰는 공책 한 권에 모읍니다. " +
          "아무도 걷지 않고 아무도 채점하지 않습니다. 다음 시험 전에 여러분이 읽으려는 것입니다. " +
          "이번 목요일에 시작합니다. 지난달 시험지를 가져오세요. 고맙습니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 여자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Hyeri, you've started answering questions out loud to an empty room. Isn't that odd?"],
        ["W", "Completely odd. My brother knocked on the wall twice last night."],
        ["M", "Then why do it? You could just read the answer in your head."],
        ["W", "I did that for two years and thought I knew everything."],
        ["M", "And you didn't?"],
        ["W", "I knew it the way you know a song you can't sing. Recognising is not knowing."],
        ["M", "But surely reading it over and over puts it in there."],
        ["W", "It puts a feeling of familiarity in there. The feeling is what fools you."],
        ["M", "Fools you how?"],
        ["W", "You read a page four times, it feels easy, and you decide you're finished with it."],
        ["M", "And speaking it out loud breaks that?"],
        ["W", "Instantly. The first time I explained a topic aloud I stopped in the third sentence."],
        ["M", "Isn't it slower, though?"],
        ["W", "Three times slower for one topic. But I never have to go back to that topic."],
        ["M", "So the time comes back later."],
        ["W", "All of it, and more. What I can say aloud once, I keep."],
        ["M", "Then I'll try talking through tonight's chapter."],
      ],
      choices: [
        "공부는 조용한 곳에서 해야 한다",
        "복습은 자주 할수록 좋다",
        "소리 내어 설명해 보아야 진짜로 아는지 알 수 있다",
        "공부 시간을 늘려야 한다",
        "친구와 함께 공부하는 것이 좋다",
      ],
      answer: 3,
      clue: "Instantly. The first time I explained a topic aloud I stopped in the third sentence.",
      explanation:
        "여자는 눈으로 읽으면 익숙함이 앎처럼 느껴지지만, 소리 내어 설명해 보면 아는지 모르는지가 곧바로 드러난다고 말한다. 따라서 답은 ③이다.",
      translation: [
        "M: 혜리야, 빈방에 대고 소리 내서 답을 말하더라. 좀 이상하지 않아?",
        "W: 완전히 이상하지. 어젯밤엔 동생이 벽을 두 번 두드렸어.",
        "M: 그런데 왜 그래? 속으로 답을 읽으면 되잖아.",
        "W: 2년 동안 그렇게 했고, 다 안다고 생각했어.",
        "M: 아니었어?",
        "W: 부를 줄 모르는 노래를 아는 식으로 알았지. 알아보는 건 아는 게 아니야.",
        "M: 그래도 반복해서 읽으면 머리에 들어가지 않아?",
        "W: 익숙하다는 느낌이 들어가. 그 느낌이 사람을 속여.",
        "M: 어떻게 속이는데?",
        "W: 한 쪽을 네 번 읽으면 쉬워 보이고, 이제 다 했다고 정해 버려.",
        "M: 소리 내어 말하면 그게 깨져?",
        "W: 바로. 처음으로 한 단원을 소리 내어 설명했을 때 세 번째 문장에서 멈췄어.",
        "M: 그래도 느리지 않아?",
        "W: 한 단원에 세 배쯤 느려. 그런데 그 단원으로 다시 돌아갈 일이 없어.",
        "M: 그럼 시간이 나중에 돌아오는 거네.",
        "W: 전부, 그리고 더. 소리 내어 한 번 말할 수 있는 건 남아.",
        "M: 그럼 나도 오늘 밤 단원을 말해 볼게.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "We praise people for keeping an open mind, and then we measure it in the wrong place. " +
            "An open mind is not one that will listen to anything; that is only a mind without a filter. " +
            "It is a mind that has said in advance what would change it. " +
            "If you cannot name the fact that would make you drop your position, you do not hold a position. You hold an attachment. " +
            "The test is never how politely you listen to the other side. " +
            "The test is whether you wrote down, before the argument, what would make you wrong.",
        ],
      ],
      choices: [
        "남의 말을 끝까지 들어야 한다",
        "토론은 예의를 지켜 해야 한다",
        "생각은 자주 바꾸는 것이 좋다",
        "열린 마음은 무엇이 나를 틀리게 만들지 미리 말할 수 있는 것이다",
        "논쟁은 피하는 것이 낫다",
      ],
      answer: 4,
      clue: "The test is whether you wrote down, before the argument, what would make you wrong.",
      explanation:
        "열린 마음은 아무 말이나 듣는 것이 아니라, 무엇이 자기 입장을 바꾸게 할지를 미리 말할 수 있는 것이라는 내용이다. 따라서 요지는 ④이다.",
      translation: [
        "M: 우리는 열린 마음을 칭찬하면서, 그것을 엉뚱한 데서 잽니다. " +
          "열린 마음은 무엇이든 들어 주는 마음이 아닙니다. 그것은 걸러 내지 못하는 마음일 뿐입니다. " +
          "열린 마음이란 무엇이 자기를 바꿀 수 있는지 미리 말해 둔 마음입니다. " +
          "자기 입장을 버리게 만들 사실을 하나도 대지 못한다면, 그것은 입장이 아니라 애착입니다. " +
          "시험대는 상대의 말을 얼마나 공손히 듣느냐가 아닙니다. " +
          "시험대는 논쟁을 시작하기 전에, 무엇이 자기를 틀리게 만들지 적어 두었느냐입니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["W", "Minhyuk, the new counselling room is much warmer than the old one."],
        ["M", "We moved in last month. What do you notice first?"],
        ["W", "On the back wall there's a wide framed picture of a forest."],
        ["M", "The art teacher lent it to us for the year."],
        ["W", "On the left, is that a filing cabinet?"],
        ["M", "No, it's a low bookshelf. The cabinet went to the office."],
        ["W", "I see. In the middle there's a round table with three chairs."],
        ["M", "Three is the most we ever need at once."],
        ["W", "On the right there's a tall plant in a pot."],
        ["M", "It was here before us. Nobody knows who waters it."],
        ["W", "And beside the door there's a small clock on the wall."],
        ["M", "Round, and ten minutes fast. We leave it that way on purpose."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 2,
      clue: "No, it's a low bookshelf. The cabinet went to the office.",
      explanation:
        "남자는 왼쪽에 있는 것이 서류함이 아니라 낮은 책장이라고 바로잡는다. 그림에는 서류함이 그려져 있으므로 ②가 대화와 일치하지 않는다.",
      figure: {
        kind: "labeled",
        scene:
          "A school counselling room seen from the front, clean black line art on a plain white background, five things clearly separated with wide empty space between them and none overlapping, no writing or letters anywhere. " +
          "High on the back wall in the centre: a WIDE FRAMED PICTURE showing simple pine trees. " +
          "On the floor at the far left: a FILING CABINET, a tall narrow chest with three deep drawers and a round handle on each drawer. " +
          "In the centre of the floor: a ROUND TABLE with exactly THREE chairs around it. " +
          "On the right side of the floor: a TALL PLANT in a pot, taller than a person's waist. " +
          "Beside the door on the far right, high on the wall: a small ROUND CLOCK.",
      },
      translation: [
        "W: 민혁아, 새 상담실이 예전보다 훨씬 아늑하다.",
        "M: 지난달에 옮겼어. 뭐가 먼저 눈에 들어와?",
        "W: 뒷벽에 숲을 그린 넓은 액자가 있네.",
        "M: 미술 선생님이 1년 동안 빌려주셨어.",
        "W: 왼쪽에 있는 건 서류함이야?",
        "M: 아니, 낮은 책장이야. 서류함은 행정실로 갔어.",
        "W: 그렇구나. 가운데에는 둥근 탁자에 의자가 세 개 있고.",
        "M: 한 번에 세 명이면 제일 많은 편이야.",
        "W: 오른쪽에는 키 큰 화분이 있네.",
        "M: 우리가 오기 전부터 있었어. 누가 물을 주는지 아무도 몰라.",
        "W: 그리고 문 옆 벽에는 작은 시계가 있고.",
        "M: 둥글고, 10분 빨라. 일부러 그렇게 둬.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 여자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Chaerin, there's a problem with the graduation album."],
        ["W", "I sent the file to the printer on Monday. What's wrong?"],
        ["M", "Two students in class seven have the wrong names under their photos."],
        ["W", "Their names swapped?"],
        ["M", "Swapped. And it's a book they keep for forty years."],
        ["W", "Can we put a sticker over them afterwards?"],
        ["M", "On three hundred copies? It would show on every one."],
        ["W", "Then I'll email the printer the corrected page tonight."],
        ["M", "Will they take a page this late?"],
        ["W", "They print on Friday. One page is fine if it arrives before Thursday."],
        ["M", "Thanks. I'll tell the two students so they stop worrying."],
      ],
      choices: [
        "사진을 다시 찍기",
        "스티커를 붙이기",
        "학생들에게 알리기",
        "인쇄 날짜를 미루기",
        "고친 쪽을 인쇄소에 보내기",
      ],
      answer: 5,
      clue: "Then I'll email the printer the corrected page tonight.",
      explanation:
        "여자는 오늘 밤에 고친 쪽을 인쇄소에 보내기로 한다. 학생들에게 알리는 일은 남자가 맡았다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 채린아, 졸업 앨범에 문제가 있어.",
        "W: 월요일에 인쇄소에 파일 보냈는데. 뭐가 잘못됐어?",
        "M: 7반 학생 두 명 사진 아래 이름이 잘못됐어.",
        "W: 서로 바뀐 거야?",
        "M: 바뀌었어. 40년 동안 간직하는 책인데.",
        "W: 나중에 스티커를 붙이면 안 될까?",
        "M: 300부에? 어느 책이든 티가 날걸.",
        "W: 그럼 오늘 밤에 고친 쪽을 인쇄소에 메일로 보낼게.",
        "M: 이렇게 늦었는데 받아 줄까?",
        "W: 인쇄는 금요일에 해. 목요일 전에 도착하면 한 쪽은 괜찮아.",
        "M: 고마워. 나는 그 두 명한테 말해서 걱정 안 하게 할게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 남자가 지불할 금액을 고르시오.",
      lines: [
        ["W", "Welcome to the print shop. What can I do for you?"],
        ["M", "I need to print a study guide and have it bound."],
        ["W", "Printing is twenty dollars for a hundred pages."],
        ["M", "Mine is a hundred pages exactly."],
        ["W", "And binding is seven dollars a copy."],
        ["M", "I'll take two copies bound."],
        ["W", "Twenty for the printing and fourteen for the binding. Thirty-four dollars."],
        ["M", "Do you give a student discount?"],
        ["W", "We do. Six dollars off with a student card."],
        ["M", "Here it is."],
        ["W", "Would you like a clear cover as well? Three dollars each."],
        ["M", "No, thank you. The plain one is fine."],
      ],
      choices: ["$28", "$31", "$34", "$37", "$40"],
      answer: 1,
      clue: "We do. Six dollars off with a student card.",
      explanation:
        "인쇄 20달러와 제본 7달러짜리 두 부 14달러를 더하면 34달러이다. 학생 할인 6달러를 빼면 28달러이고 투명 표지는 사지 않았으므로 답은 ①이다.",
      translation: [
        "W: 인쇄소입니다. 무엇을 도와드릴까요?",
        "M: 자료집을 인쇄하고 제본하려고요.",
        "W: 인쇄는 100쪽에 20달러입니다.",
        "M: 제 건 딱 100쪽이에요.",
        "W: 제본은 한 부에 7달러입니다.",
        "M: 제본해서 두 부 할게요.",
        "W: 인쇄 20달러에 제본 14달러, 34달러입니다.",
        "M: 학생 할인 있나요?",
        "W: 있습니다. 학생증이 있으면 6달러 할인됩니다.",
        "M: 여기 있습니다.",
        "W: 투명 표지도 하시겠어요? 하나에 3달러입니다.",
        "M: 아니요, 괜찮아요. 그냥 표지면 됩니다.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 여자가 스터디 모임을 그만두려는 이유를 고르시오.",
      lines: [
        ["M", "Jiyu, are you really leaving the study group?"],
        ["W", "After this week. I told them on Monday."],
        ["M", "Is it the level? The questions have got harder since September."],
        ["W", "The questions are fine. I like them."],
        ["M", "Then what? You started that group yourself."],
        ["W", "It meets at seven in the evening, three times a week."],
        ["M", "It always has."],
        ["W", "And from this month I take the last bus at seven twenty from the other side of town."],
        ["M", "Your academy moved?"],
        ["W", "It moved in September. I've been arriving late and leaving early ever since."],
      ],
      choices: [
        "문제가 어려워져서",
        "학원이 옮겨 가 시간이 맞지 않아서",
        "모임 사람들과 맞지 않아서",
        "성적이 떨어져서",
        "다른 모임에 들어가서",
      ],
      answer: 2,
      clue: "It moved in September. I've been arriving late and leaving early ever since.",
      explanation:
        "학원이 9월에 옮겨 가는 바람에 저녁 7시 모임에 늦게 와서 일찍 가게 되었다. 따라서 답은 ②이다.",
      translation: [
        "M: 지유야, 정말 스터디 모임 그만둬?",
        "W: 이번 주까지만. 월요일에 말했어.",
        "M: 수준 때문이야? 9월부터 문제가 어려워졌잖아.",
        "W: 문제는 괜찮아. 오히려 좋아.",
        "M: 그럼 왜? 그 모임 네가 만들었잖아.",
        "W: 일주일에 세 번, 저녁 7시에 모이잖아.",
        "M: 늘 그랬지.",
        "W: 그런데 이번 달부터 동네 반대편에서 7시 20분 막차를 타.",
        "M: 학원이 옮겼어?",
        "W: 9월에 옮겼어. 그 뒤로 계속 늦게 와서 일찍 가고 있어.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 교내 논술 특강에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["W", "Sungjae, did you read the notice about the essay workshop?"],
        ["M", "I saw the title and walked past. Is it worth going?"],
        ["W", "I think so. It runs for four Saturdays in a row, starting this weekend."],
        ["M", "Four Saturdays is a lot. What actually happens in them?"],
        ["W", "You write one essay a week and two other students mark it before the teacher does."],
        ["M", "Other students mark it? That sounds uncomfortable."],
        ["W", "It is, for about an hour. Then it turns out they see things the teacher doesn't say."],
        ["M", "Who is teaching it?"],
        ["W", "Mr. Han, and someone from the university who used to mark entrance essays."],
        ["M", "That's the part that would make me go. Where is it held?"],
        ["W", "The third-year seminar room, the small one behind the staff office."],
        ["M", "That room only holds about twenty."],
        ["W", "Which is why they take the first twenty names and no more."],
        ["M", "Then I'll put my name down this afternoon."],
        ["W", "Do it before lunch. Eleven names were on the sheet this morning."],
      ],
      choices: ["진행 방식", "강사", "장소", "정원", "준비물"],
      answer: 5,
      clue: "Which is why they take the first twenty names and no more.",
      explanation:
        "진행 방식(주 1회 글쓰기와 학생 상호 첨삭), 강사(한 선생님과 대학에서 온 분), 장소(3학년 세미나실), 정원(스무 명)은 언급되지만 준비물은 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 성재야, 논술 특강 공지 읽었어?",
        "M: 제목만 보고 지나쳤어. 갈 만해?",
        "W: 그런 것 같아. 이번 주말부터 네 번 연속 토요일에 해.",
        "M: 토요일 네 번이면 많은데. 거기서 뭘 하는데?",
        "W: 일주일에 한 편 쓰고, 선생님이 보기 전에 다른 학생 두 명이 먼저 첨삭해.",
        "M: 학생이 첨삭한다고? 좀 불편할 것 같은데.",
        "W: 한 시간쯤은 그래. 그러다 보면 선생님이 말 안 하는 걸 본다는 걸 알게 돼.",
        "M: 누가 가르쳐?",
        "W: 한 선생님이랑, 예전에 입시 논술을 채점하던 대학 쪽 분.",
        "M: 그거라면 나도 가겠다. 어디서 하는데?",
        "W: 3학년 세미나실, 교무실 뒤 작은 방.",
        "M: 거기 스무 명쯤 들어가잖아.",
        "W: 그래서 먼저 적은 스무 명까지만 받아.",
        "M: 그럼 오늘 오후에 이름 적을게.",
        "W: 점심 전에 해. 아침에 이미 열한 명 적혀 있었어.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Nuri Sound Archive에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "W",
          "Here is what you should know about the Nuri Sound Archive, which opened beside the old railway station four years ago. " +
            "It collects recordings of sounds that have disappeared from the city: trams, market calls, school bells that are no longer rung. " +
            "The listening booths are open from eleven until seven, and the archive closes on Tuesdays. " +
            "Anyone may listen without booking, but only members may copy a recording. " +
            "Membership is free for students, and it is applied for at the front desk with a student card. " +
            "Visitors may also bring in their own recordings, and about half the collection arrived that way.",
        ],
      ],
      choices: [
        "4년 전에 문을 열었다",
        "화요일에 문을 닫는다",
        "녹음을 복사하려면 회원이어야 한다",
        "학생은 회비를 내지 않는다",
        "듣기 위해서는 예약이 필요하다",
      ],
      answer: 5,
      clue: "Anyone may listen without booking, but only members may copy a recording.",
      explanation:
        "누구나 예약 없이 들을 수 있다고 했다. 따라서 ⑤가 내용과 일치하지 않는다.",
      translation: [
        "W: 4년 전 옛 기차역 옆에 문을 연 Nuri Sound Archive를 소개합니다. " +
          "이곳은 도시에서 사라진 소리를 모읍니다. 전차, 시장의 외침, 더는 울리지 않는 학교 종 같은 것들입니다. " +
          "청취실은 11시부터 7시까지 열고, 화요일에는 쉽니다. " +
          "누구나 예약 없이 들을 수 있지만, 녹음을 복사하는 것은 회원만 할 수 있습니다. " +
          "학생은 회비가 없으며, 학생증을 가지고 안내 데스크에서 신청하면 됩니다. " +
          "방문객이 직접 녹음한 것을 가져올 수도 있고, 소장 자료의 절반쯤이 그렇게 들어왔습니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 신청할 겨울 특강을 고르시오.",
      lines: [
        ["W", "Junwoo, these are the five winter courses still open."],
        ["M", "Let's choose one. I can't do mornings because of my hospital appointment."],
        ["W", "Right, that takes out one of them."],
        ["M", "Next, how many sessions are there? More than twelve is too many before the exam."],
        ["W", "Then one more is gone. Three are left."],
        ["M", "What do they cost?"],
        ["W", "We said a hundred and twenty thousand won at the most."],
        ["M", "Then one more drops out. Two left."],
        ["W", "Do either of them give you a written comment on your work?"],
        ["M", "Only one does, and that's the part I actually want."],
        ["W", "Then that's the one. I'll sign us up before Friday."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 1,
      clue: "Then that's the one. I'll sign us up before Friday.",
      explanation:
        "오전인 ④, 16회인 ②, 150,000원인 ⑤를 뺀다. 남은 ①과 ③ 중 첨삭을 해 주는 것은 ①이므로 답은 ①이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "오후 / 12회 / 120,000원 / 첨삭 있음" },
          { no: 2, label: "②", value: "오후 / 16회 / 110,000원 / 첨삭 있음" },
          { no: 3, label: "③", value: "오후 / 10회 / 100,000원 / 첨삭 없음" },
          { no: 4, label: "④", value: "오전 / 12회 / 120,000원 / 첨삭 있음" },
          { no: 5, label: "⑤", value: "오후 / 12회 / 150,000원 / 첨삭 있음" },
        ],
      },
      translation: [
        "W: 준우야, 아직 열려 있는 겨울 특강이 이 다섯 개야.",
        "M: 하나 고르자. 병원 예약 때문에 오전은 안 돼.",
        "W: 맞다, 그럼 하나가 빠지네.",
        "M: 다음으로 몇 회짜리야? 시험 전에 열두 번 넘으면 너무 많아.",
        "W: 그럼 하나 더 빠진다. 세 개 남았어.",
        "M: 얼마야?",
        "W: 12만 원까지로 정했잖아.",
        "M: 그럼 하나 더 빠지고 둘 남았다.",
        "W: 둘 중에 글에 첨삭을 써 주는 데가 있어?",
        "M: 한 곳만. 사실 내가 원하는 게 그거야.",
        "W: 그럼 거기로 하자. 금요일 전에 신청할게.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Have you sent in the university application photo?"],
        ["M", "Not yet. The studio is closed until Thursday."],
        ["W", "Did you check whether they accept a scanned one?"],
        ["M", "I assumed it had to be the studio print."],
        ["W", "Not since last year. A scan at three hundred dots is fine."],
      ],
      choices: [
        "The deadline is next Monday.",
        "The studio opens at ten.",
        "I have an old photo from March.",
        "Then I'll scan mine tonight.",
        "You should send yours as well.",
      ],
      answer: 4,
      clue: "Not since last year. A scan at three hundred dots is fine.",
      explanation:
        "스캔한 사진도 된다는 말을 들었으므로, 오늘 밤에 스캔하겠다는 ④가 가장 자연스럽다.",
      translation: [
        "W: 대학 지원 사진 보냈어?",
        "M: 아직. 사진관이 목요일까지 닫았어.",
        "W: 스캔한 것도 받는지 확인해 봤어?",
        "M: 사진관에서 뽑은 거라야 하는 줄 알았어.",
        "W: 작년부터는 아니야. 300dpi로 스캔하면 돼.",
        "M: 그럼 오늘 밤에 스캔할게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "You've been carrying all six workbooks home every night."],
        ["W", "I never know which one I'll need."],
        ["M", "Have you thought about leaving some in your locker?"],
        ["W", "The locker is full of winter clothes."],
        ["M", "The cloakroom takes coats now. It opened last week."],
      ],
      choices: [
        "My locker is on the second floor.",
        "I study about five hours a night.",
        "The workbooks weigh six kilos.",
        "You should use the cloakroom too.",
        "Then I'll move my coats there tomorrow.",
      ],
      answer: 5,
      clue: "The cloakroom takes coats now. It opened last week.",
      explanation:
        "지난주에 문을 연 옷 보관소에 외투를 맡길 수 있다는 말을 들었으므로, 내일 외투를 옮기겠다는 ⑤가 가장 자연스럽다.",
      translation: [
        "M: 매일 밤 문제집 여섯 권을 다 들고 가더라.",
        "W: 어떤 게 필요할지 모르겠어서.",
        "M: 몇 권은 사물함에 두는 건 생각해 봤어?",
        "W: 사물함이 겨울옷으로 꽉 찼어.",
        "M: 이제 옷 보관소에서 외투를 받아 줘. 지난주에 열었어.",
        "W: 그럼 내일 외투를 거기로 옮길게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오. [3점]",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Ssong-i, how is the university personal statement going?"],
        ["W", "I've written it four times and I hate all four."],
        ["M", "What goes into them?"],
        ["W", "Everything. The club, the volunteering, the two competitions, the reading."],
        ["M", "All of it in fifteen hundred characters?"],
        ["W", "That's the problem. Each one gets three lines and none of them lands."],
        ["M", "Who is going to read it?"],
        ["W", "Someone with forty of these to get through in an afternoon."],
        ["M", "And what do they remember after forty?"],
        ["W", "One thing, probably. If anything."],
        ["M", "Then pick the one thing and give it two thirds of the page."],
      ],
      choices: [
        "The statement is due in two weeks.",
        "Then I'll rewrite it around one thing.",
        "I joined the club in my second year.",
        "My teacher has already read the third draft.",
        "I'd rather write about all of them briefly.",
      ],
      answer: 2,
      clue: "Then pick the one thing and give it two thirds of the page.",
      explanation:
        "한 가지를 골라 지면의 3분의 2를 주라는 조언을 들었으므로, 한 가지를 중심으로 다시 쓰겠다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 송이야, 자기소개서는 잘돼 가?",
        "W: 네 번 썼는데 네 번 다 싫어.",
        "M: 거기 뭘 넣는데?",
        "W: 전부. 동아리, 봉사, 대회 두 개, 독서.",
        "M: 그걸 1,500자에 다?",
        "W: 그게 문제야. 하나에 세 줄씩 가고 하나도 안 남아.",
        "M: 그걸 누가 읽어?",
        "W: 오후 한나절에 마흔 편을 봐야 하는 사람이겠지.",
        "M: 마흔 편을 읽고 나면 뭐가 남을까?",
        "W: 한 가지쯤. 남는다면.",
        "M: 그럼 그 한 가지를 골라서 지면의 3분의 2를 줘.",
        "W: 그럼 한 가지를 중심으로 다시 쓸게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오. [3점]",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Gunwoo, you've been doing a full practice test every single day."],
        ["M", "Seven days a week since October. I want the stamina."],
        ["W", "And do you go over them?"],
        ["M", "I check the answers and write the score in a list."],
        ["W", "Just the score?"],
        ["M", "There isn't time for more. The next test starts in the morning."],
        ["W", "So you've taken fifty tests and reviewed none of them."],
        ["M", "Put that way, it sounds bad."],
        ["W", "It is bad. A test you don't review is an expensive way to find out you were tired."],
        ["M", "Then what would you do?"],
        ["W", "Three tests a week, and the day after each one belongs to that test."],
      ],
      choices: [
        "My average has gone up by four points.",
        "The tests take three hours each.",
        "Then I'll cut down to three a week.",
        "I start at seven every morning.",
        "You should take one every day too.",
      ],
      answer: 3,
      clue: "Three tests a week, and the day after each one belongs to that test.",
      explanation:
        "일주일에 세 번만 보고 그다음 날은 그 시험을 복습하라는 조언을 들었으므로, 주 3회로 줄이겠다는 ③이 가장 자연스럽다.",
      translation: [
        "W: 건우야, 매일 하루도 빠짐없이 모의고사를 한 세트씩 풀더라.",
        "M: 10월부터 주 7일. 체력을 붙이고 싶어서.",
        "W: 그러고 나서 다시 봐?",
        "M: 답 맞춰 보고 점수를 목록에 적어.",
        "W: 점수만?",
        "M: 그 이상 볼 시간이 없어. 아침이면 다음 시험이 시작되니까.",
        "W: 그럼 쉰 번을 보고 한 번도 복습을 안 한 거네.",
        "M: 그렇게 말하니 안 좋게 들린다.",
        "W: 안 좋아. 복습 안 하는 시험은 자기가 피곤했다는 걸 비싸게 확인하는 방법이야.",
        "M: 그럼 너라면 어떻게 할 건데?",
        "W: 일주일에 세 번만 보고, 그 다음 날은 그 시험에 쓰는 거지.",
        "M: 그럼 주 세 번으로 줄일게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Mr. Seo가 Haeun에게 할 말로 가장 적절한 것을 고르시오. [3점]",
      questionText: "▶ Mr. Seo : ________________",
      lines: [
        [
          "M",
          "Mr. Seo teaches the third-year English class, and Haeun is one of his most reliable students. " +
            "Whenever she meets an English word she does not know, she stops and looks it up at once. " +
            "Because of that habit her vocabulary notebook is the fullest in the year. " +
            "The difficulty appears in the reading test, where she cannot stop and there is no dictionary. " +
            "In the last two tests she spent so long on unknown words that she left four passages unread. " +
            "Mr. Seo does not want her to stop looking words up; that care is why she understands so much. " +
            "The trouble is that a reader who cannot walk past one word cannot finish a page. " +
            "The exam is in six weeks, and he wants to tell her to read each passage once without stopping and look words up only afterwards. " +
            "In this situation, what would Mr. Seo most likely say to Haeun?",
        ],
      ],
      choices: [
        "Read each passage through once before you look anything up.",
        "Try to memorise twenty new words every day.",
        "I think you should read shorter passages.",
        "Let's put your vocabulary notebook away for now.",
        "You should bring a dictionary to the exam.",
      ],
      answer: 1,
      clue: "he wants to tell her to read each passage once without stopping and look words up only afterwards",
      explanation:
        "서 선생님은 하은이의 찾아보는 습관을 문제 삼지 않으면서, 지문을 먼저 끝까지 한 번 읽고 나서 단어를 찾으라고 말하려 한다. 따라서 ①이 가장 적절하다.",
      translation: [
        "M: 서 선생님은 3학년 영어를 맡고 있고, 하은이는 가장 믿음직한 학생 중 하나입니다. " +
          "하은이는 모르는 영어 단어를 만나면 그 자리에서 멈추고 바로 찾아봅니다. " +
          "그 습관 덕분에 하은이의 단어 공책은 학년에서 가장 빽빽합니다. " +
          "문제는 독해 시험에서 드러납니다. 거기서는 멈출 수도 없고 사전도 없습니다. " +
          "지난 두 번의 시험에서 모르는 단어에 너무 오래 매달리다가 지문 네 개를 읽지 못한 채 냈습니다. " +
          "서 선생님은 하은이가 단어 찾기를 그만두기를 바라지 않습니다. 그 꼼꼼함 덕분에 많은 것을 이해합니다. " +
          "문제는 한 단어를 그냥 지나치지 못하는 독자는 한 쪽을 끝낼 수 없다는 점입니다. " +
          "시험은 6주 뒤이고, 선생님은 지문을 멈추지 말고 한 번 끝까지 읽은 뒤에 단어를 찾으라고 말하고 싶습니다. " +
          "이런 상황에서 서 선생님이 하은이에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "여자가 하는 말의 주제로 가장 적절한 것은?",
      lines: [
        ["W", "Good afternoon. Today I want to talk about animals that build with materials they do not make themselves."],
        ["W", "Building is usually described as an instinct, but gathering the right object is closer to a judgement."],
        ["W", "The caddisfly larva glues sand grains and shell fragments into a tube it will carry for months."],
        ["W", "The hermit crab does not build at all and instead measures empty shells until one fits, then moves house in a second."],
        ["W", "The bowerbird collects blue objects from an entire valley and arranges them by size in front of its bower."],
        ["W", "The decorator crab cuts pieces of living sponge and plants them on its own back, where they keep growing."],
        ["W", "In every case the animal is choosing among things it did not produce, and the choosing is the skill."],
        ["W", "That is what makes these builders interesting: the work happens before the building starts."],
      ],
      choices: [
        "how animals defend their territory",
        "animals that build with materials they collect",
        "why some animals change colour",
        "how insects find their way home",
        "why crabs live near the shore",
      ],
      answer: 2,
      clue: "In every case the animal is choosing among things it did not produce, and the choosing is the skill.",
      explanation:
        "여자는 날도래 애벌레, 소라게, 바우어새, 꾸미치레게가 스스로 만들지 않은 재료를 골라 쓰는 방식을 설명한다. 따라서 주제는 ②이다.",
      translation: [
        "W: 안녕하세요. 오늘은 스스로 만들지 않은 재료로 집을 짓는 동물에 대해 이야기하려 합니다.",
        "W: 집짓기는 보통 본능이라고 하지만, 알맞은 물건을 모으는 일은 판단에 가깝습니다.",
        "W: 날도래 애벌레는 모래알과 조개 조각을 붙여, 몇 달을 지고 다닐 대롱을 만듭니다.",
        "W: 소라게는 아예 짓지 않고, 빈 껍데기를 재어 보다가 맞는 것을 찾으면 순식간에 이사합니다.",
        "W: 바우어새는 골짜기 전체에서 파란 물건을 모아 둥지 앞에 크기순으로 늘어놓습니다.",
        "W: 꾸미치레게는 살아 있는 해면을 잘라 제 등에 심고, 그것은 거기서 계속 자랍니다.",
        "W: 어느 경우든 동물은 자기가 만들지 않은 것들 가운데서 고르고 있고, 그 고르는 일이 실력입니다.",
        "W: 이 건축가들이 흥미로운 까닭이 바로 그것입니다. 일은 집짓기가 시작되기 전에 벌어집니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 동물이 아닌 것은?",
      lines: [
        ["W", "Good afternoon. Today I want to talk about animals that build with materials they do not make themselves."],
        ["W", "Building is usually described as an instinct, but gathering the right object is closer to a judgement."],
        ["W", "The caddisfly larva glues sand grains and shell fragments into a tube it will carry for months."],
        ["W", "The hermit crab does not build at all and instead measures empty shells until one fits, then moves house in a second."],
        ["W", "The bowerbird collects blue objects from an entire valley and arranges them by size in front of its bower."],
        ["W", "The decorator crab cuts pieces of living sponge and plants them on its own back, where they keep growing."],
        ["W", "In every case the animal is choosing among things it did not produce, and the choosing is the skill."],
        ["W", "That is what makes these builders interesting: the work happens before the building starts."],
      ],
      choices: ["caddisfly larva", "hermit crab", "bowerbird", "decorator crab", "weaver ant"],
      answer: 5,
      clue: "The decorator crab cuts pieces of living sponge and plants them on its own back, where they keep growing.",
      explanation:
        "날도래 애벌레, 소라게, 바우어새, 꾸미치레게는 언급되지만 베짜기개미는 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
