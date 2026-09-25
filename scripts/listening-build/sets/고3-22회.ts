/** 고3 듣기 22회 — 사람이 직접 쓴 회차 (2026-09-25) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고3 22회",
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
          "Good afternoon, third-year students. This is Ms. Baek from the career office. " +
            "I want to speak to you about the recommendation letters you will be requesting this month. " +
            "Every year a few students send a teacher a message on a Sunday night " +
            "asking for a letter that is due on Monday morning. " +
            "A letter written in an hour reads like a letter written in an hour, " +
            "and the reader on the other end can tell. " +
            "So here is what we are asking. " +
            "Give your teacher at least three weeks, and bring two things when you ask. " +
            "Bring the list of what you are applying to, with the deadlines written next to each one, " +
            "and bring a page about what you actually did in that teacher's class. " +
            "Not your grade. What you worked on and what changed. " +
            "Those two pages are what turn a general letter into a specific one. " +
            "The request forms are on the shelf outside our office. Thank you.",
        ],
      ],
      choices: [
        "추천서 양식이 바뀌었음을 알리려고",
        "진로 상담 신청을 받으려고",
        "지원 마감일을 안내하려고",
        "추천서를 미리, 자료와 함께 부탁하라고 당부하려고",
        "교사 면담 시간을 공지하려고",
      ],
      answer: 4,
      clue: "Give your teacher at least three weeks, and bring two things when you ask.",
      explanation:
        "여자는 추천서를 최소 3주 전에 부탁하고, 지원 목록과 수업에서 한 일을 적은 자료를 함께 가져오라고 당부한다. 따라서 답은 ④이다.",
      translation: [
        "W: 3학년 학생 여러분, 안녕하세요. 진로실 백입니다. 이번 달에 부탁하게 될 추천서 이야기를 하려고 합니다. 해마다 몇몇 학생이 일요일 밤에 선생님께 메시지를 보내 월요일 아침까지 필요한 추천서를 부탁합니다. 한 시간 만에 쓴 편지는 한 시간 만에 쓴 편지처럼 읽히고, 받아 보는 쪽은 그걸 압니다. 그래서 이렇게 부탁드립니다. 선생님께 적어도 3주는 드리고, 부탁할 때 두 가지를 가져가세요. 어디에 지원하는지, 각각의 마감일을 옆에 적은 목록을 가져가고, 그 선생님 수업에서 실제로 무엇을 했는지 적은 한 쪽을 가져가세요. 성적 말고요. 무엇을 붙잡고 했고 무엇이 달라졌는지요. 그 두 쪽이 뻔한 편지를 구체적인 편지로 바꿔 줍니다. 신청 양식은 진로실 밖 선반에 있습니다. 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 남자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Junseo, I've been redoing every problem I got wrong on the mock exam."],
        ["M", "All forty of them? How far have you got?"],
        ["W", "Twelve so far, and I got eleven of those right the second time."],
        ["M", "Right the second time, with the answer key already in your head."],
        ["W", "What do you mean? I solved them myself."],
        ["M", "You solved them knowing the shape of the answer. That isn't the same test."],
        ["W", "Then what's the point of reviewing at all?"],
        ["M", "The point is finding which step you couldn't take, not reaching the answer."],
        ["W", "So I should be looking at where I stopped, not whether I finish."],
        ["M", "Exactly. Mark the line where you stalled and work only on that move."],
        ["W", "That would be about four kinds of move across all forty."],
        ["M", "Four things you can actually practice beats forty you can only repeat."],
      ],
      choices: [
        "틀린 문제는 모두 다시 풀어야 한다",
        "오답은 막힌 단계를 찾아 그것만 연습해야 한다",
        "모의고사는 자주 볼수록 좋다",
        "답지는 보지 말아야 한다",
        "오답 노트는 손으로 써야 한다",
      ],
      answer: 2,
      clue: "Mark the line where you stalled and work only on that move.",
      explanation:
        "남자는 답을 아는 채로 다시 푸는 것은 같은 시험이 아니라며, 막힌 줄을 표시해 그 동작만 연습하라고 말한다. 따라서 답은 ②이다.",
      translation: [
        "W: 준서야, 나 모의고사에서 틀린 문제를 전부 다시 풀고 있어.",
        "M: 마흔 개 전부? 어디까지 했어?",
        "W: 지금까지 열두 개. 그중 열한 개는 두 번째에 맞았어.",
        "M: 답의 모양이 이미 머리에 있는 채로 두 번째에 맞은 거지.",
        "W: 무슨 말이야? 내가 직접 풀었는데.",
        "M: 답의 모양을 알고 푼 거잖아. 그건 같은 시험이 아니야.",
        "W: 그럼 복습은 왜 해?",
        "M: 답에 닿는 게 아니라, 어느 단계를 못 밟았는지 찾으려고 하는 거야.",
        "W: 그럼 끝냈는지가 아니라 어디서 멈췄는지를 봐야겠네.",
        "M: 그래. 막힌 줄을 표시하고 그 동작만 붙들고 연습해.",
        "W: 마흔 개를 통틀어 네 종류쯤 될 것 같아.",
        "M: 실제로 연습할 수 있는 네 가지가, 되풀이만 하는 마흔 개보다 나아.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "There is a question we ask badly almost every time, and it costs us more than we notice. " +
            "The question is, do you have any questions. " +
            "A teacher finishes a lesson, a doctor finishes an explanation, a manager finishes a briefing, " +
            "and then that sentence arrives. " +
            "Almost nobody answers it honestly. " +
            "To ask a question at that moment, you have to already know what you missed, " +
            "and the whole difficulty of not understanding something " +
            "is that you cannot see the shape of the hole. " +
            "Watch what happens when the question changes. " +
            "Ask instead, which part would you have trouble explaining to someone else. " +
            "Now the listener is not searching for a gap. " +
            "They are running a small test, and the weak part announces itself. " +
            "The information was always there. " +
            "What changed was that the question gave people a way to find it.",
        ],
      ],
      choices: [
        "모르는 것은 바로 물어야 한다",
        "설명은 짧을수록 좋다",
        "가르칠 때는 반복이 중요하다",
        "질문하는 용기가 필요하다",
        "질문은 답하기 쉬운 형태로 바꿔 물어야 한다",
      ],
      answer: 5,
      clue: "Ask instead, which part would you have trouble explaining to someone else.",
      explanation:
        "남자는 '질문 있나요'는 답할 수 없는 물음이라며, 남에게 설명하기 어려운 부분을 묻는 식으로 바꾸면 약한 곳이 드러난다고 말한다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 우리가 거의 매번 잘못 묻는 질문이 하나 있고, 그 대가는 우리가 아는 것보다 큽니다. 그 질문은 '질문 있나요'입니다. 교사가 수업을 마치고, 의사가 설명을 마치고, 관리자가 보고를 마치면 그 문장이 나옵니다. 거기에 정직하게 답하는 사람은 거의 없습니다. 그 순간에 질문을 하려면 무엇을 놓쳤는지 이미 알고 있어야 하는데, 무언가를 이해하지 못한다는 것의 어려움은 바로 그 구멍의 모양이 보이지 않는다는 데 있습니다. 질문을 바꾸면 무슨 일이 일어나는지 보세요. 대신 이렇게 물어보세요. 어느 부분을 남에게 설명하기가 어려울 것 같나요. 이제 듣는 사람은 빈틈을 찾고 있지 않습니다. 작은 시험을 돌려 보는 것이고, 약한 부분이 스스로 드러납니다. 정보는 늘 거기 있었습니다. 달라진 것은 질문이 그것을 찾을 길을 열어 주었다는 점입니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["M", "Yuna, is this the study lounge they opened on the third floor?"],
        ["W", "Yes, it's been open since the start of the month."],
        ["M", "There's a long bench along the window."],
        ["W", "That's the only place you can sit and see outside."],
        ["M", "And a ceiling lamp shaped like a cone hangs over the table."],
        ["W", "It's brighter than it looks in the photo."],
        ["M", "I see three laptops open on the table."],
        ["W", "Actually there are two. The third one is a closed notebook."],
        ["M", "There's a water dispenser in the right corner as well."],
        ["W", "That was the most requested item on the survey."],
        ["M", "And a wide mirror covers the left wall."],
        ["W", "It makes the room feel twice as deep."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "Actually there are two. The third one is a closed notebook.",
      explanation:
        "남자가 노트북이 세 대라고 하자 여자가 두 대이고 나머지는 덮인 공책이라고 바로잡는다. 그림에는 세 대처럼 보이지만 실제로는 두 대이므로 답은 ③이다.",
      figure: {
        kind: "scene",
        scene:
          "A study lounge drawn as one wide picture, clean black line art on white, no writing or letters anywhere. " +
          "A LONG BENCH runs along a window on the back wall. " +
          "A CONE-SHAPED CEILING LAMP hangs on a cord over a long table. " +
          "On the table stand exactly THREE OPEN LAPTOPS, clearly countable and evenly spaced. " +
          "A WATER DISPENSER with a large bottle on top stands in the right corner. " +
          "A WIDE MIRROR covers most of the left wall.",
      },
      translation: [
        "M: 유나야, 이게 3층에 새로 연 학습 라운지야?",
        "W: 응, 이달 초부터 열었어.",
        "M: 창가를 따라 긴 벤치가 있네.",
        "W: 앉아서 바깥을 볼 수 있는 유일한 자리야.",
        "M: 그리고 탁자 위에 원뿔 모양 천장 등이 걸려 있어.",
        "W: 사진보다 실제로 더 밝아.",
        "M: 탁자에 노트북이 세 대 펼쳐져 있네.",
        "W: 사실 두 대야. 세 번째는 덮인 공책이야.",
        "M: 오른쪽 구석에 정수기도 있고.",
        "W: 설문에서 가장 많이 나온 요청이었어.",
        "M: 그리고 왼쪽 벽을 넓은 거울이 덮고 있네.",
        "W: 방이 두 배로 깊어 보여.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 여자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Yuna, the graduation video screens at two tomorrow."],
        ["W", "I know. Is the final cut exported?"],
        ["M", "It is. I rendered it last night, all eighteen minutes."],
        ["W", "Good. And the subtitles for the interview section?"],
        ["M", "Burned in already. I checked them twice."],
        ["W", "Then what's still open?"],
        ["M", "Nobody has tested it on the auditorium projector."],
        ["W", "That projector has failed us twice before."],
        ["M", "It has. But I have to collect the photos from the first-year classes."],
        ["W", "Then I'll take the file down and test it on the projector."],
        ["M", "Bring the backup drive too, in case the laptop won't connect."],
        ["W", "I'll do a full run-through before I leave the hall."],
      ],
      choices: [
        "강당 프로젝터로 시험해 보기",
        "영상 편집 마무리하기",
        "자막 넣기",
        "사진 모으기",
        "백업 파일 만들기",
      ],
      answer: 1,
      clue: "Then I'll take the file down and test it on the projector.",
      explanation:
        "편집과 자막은 끝났고 남자는 사진을 모아야 하므로, 여자가 강당 프로젝터로 시험해 보기로 한다. 따라서 답은 ①이다.",
      translation: [
        "M: 유나야, 졸업 영상이 내일 2시에 상영돼.",
        "W: 알아. 최종본은 뽑았어?",
        "M: 뽑았어. 어젯밤에 18분짜리 전부 렌더링했어.",
        "W: 좋아. 인터뷰 부분 자막은?",
        "M: 이미 입혀 넣었어. 두 번 확인했어.",
        "W: 그럼 아직 남은 게 뭐야?",
        "M: 아무도 강당 프로젝터로 틀어 보지 않았어.",
        "W: 그 프로젝터는 전에도 두 번이나 말썽이었잖아.",
        "M: 그랬지. 그런데 나는 1학년 반들에서 사진을 받아 와야 해.",
        "W: 그럼 내가 파일 들고 내려가서 프로젝터로 시험해 볼게.",
        "M: 노트북이 안 붙을 수도 있으니 백업 드라이브도 가져가.",
        "W: 강당 나오기 전에 처음부터 끝까지 한 번 돌려 볼게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 남자가 지불할 금액을 고르시오.",
      lines: [
        ["W", "Welcome to Carmel Print Shop. What do you need today?"],
        ["M", "I'd like forty copies of my portfolio, twenty pages each."],
        ["W", "Printing is thirty cents a page, so twelve dollars per copy."],
        ["M", "Forty copies would be four hundred and eighty dollars, then."],
        ["W", "That's right. Would you like spiral binding on each one?"],
        ["M", "How much is the binding?"],
        ["W", "Two dollars a copy, so eighty dollars for forty."],
        ["M", "That's more than I budgeted. I'll skip the binding."],
        ["W", "No problem. Do you belong to a school or a studio?"],
        ["M", "I'm a student. Here's my card."],
        ["W", "Then I can give you twenty percent off the printing."],
        ["M", "Thank you. I'll pay now and pick them up Friday."],
      ],
      choices: ["$400.00", "$448.00", "$480.00", "$384.00", "$560.00"],
      answer: 4,
      clue: "Then I can give you twenty percent off the printing.",
      explanation:
        "40부의 인쇄비 480달러에서 제본은 빼고, 학생 할인 20퍼센트를 빼면 384달러이다. 따라서 답은 ④이다.",
      translation: [
        "W: 카멜 인쇄소입니다. 오늘은 무엇이 필요하세요?",
        "M: 제 포트폴리오를 마흔 부, 한 부에 스무 쪽씩 뽑고 싶어요.",
        "W: 인쇄는 한 쪽에 30센트라서 한 부에 12달러입니다.",
        "M: 그럼 마흔 부면 480달러네요.",
        "W: 맞습니다. 한 부씩 스프링 제본도 하시겠어요?",
        "M: 제본은 얼마예요?",
        "W: 한 부에 2달러라서 마흔 부면 80달러입니다.",
        "M: 예산보다 많네요. 제본은 뺄게요.",
        "W: 괜찮습니다. 학교나 작업실에 소속돼 계신가요?",
        "M: 학생이에요. 여기 학생증이요.",
        "W: 그럼 인쇄비에서 20퍼센트를 빼 드릴게요.",
        "M: 감사합니다. 지금 결제하고 금요일에 찾아갈게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 남자가 자원봉사 모임에 못 가는 이유를 고르시오.",
      lines: [
        ["W", "Junseo, you're missing Saturday's volunteer meeting?"],
        ["M", "I am, and I feel bad about it."],
        ["W", "Is it the university interview you mentioned?"],
        ["M", "No, that got moved to the following week."],
        ["W", "Then is your part-time shift back on Saturdays?"],
        ["M", "I quit that job in October."],
        ["W", "So what is it?"],
        ["M", "My grandmother is having surgery Friday and I'm staying at the hospital."],
        ["W", "Oh, I'm sorry. Is it serious?"],
        ["M", "It's routine, but somebody has to be there when she wakes up."],
      ],
      choices: [
        "대학 면접이 있어서",
        "할머니 병원에 있어야 해서",
        "아르바이트를 해야 해서",
        "가족 여행을 가야 해서",
        "시험 준비를 해야 해서",
      ],
      answer: 2,
      clue: "My grandmother is having surgery Friday and I'm staying at the hospital.",
      explanation:
        "면접은 다음 주로 옮겨졌고 아르바이트도 그만두었으며, 금요일 할머니 수술 때문에 병원에 있어야 하기 때문이다. 따라서 답은 ②이다.",
      translation: [
        "W: 준서야, 토요일 봉사 모임에 못 온다고?",
        "M: 응, 미안한 마음이야.",
        "W: 말했던 대학 면접 때문이야?",
        "M: 아니, 그건 다음 주로 옮겨졌어.",
        "W: 그럼 토요일 아르바이트를 다시 해?",
        "M: 그 일은 10월에 그만뒀어.",
        "W: 그럼 뭔데?",
        "M: 금요일에 할머니가 수술하셔서 병원에 있을 거야.",
        "W: 아, 안타깝다. 많이 안 좋으셔?",
        "M: 흔한 수술이야. 그래도 깨어나실 때 누군가는 있어야지.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, Winter Science Lecture Series에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["W", "Junseo, are you going to the Winter Science Lecture Series?"],
        ["M", "I saw the poster. When does it start?"],
        ["W", "Four Thursday evenings, beginning on January ninth."],
        ["M", "Evenings work for me. Where are they held?"],
        ["W", "In the main hall of the national science museum."],
        ["M", "That's a thirty-minute ride for me. Who's speaking?"],
        ["W", "A different researcher each week, all from university labs."],
        ["M", "What kinds of topics?"],
        ["W", "Climate, materials, sleep and one on ocean noise."],
        ["M", "Ocean noise? I've never thought about that."],
        ["W", "Neither had I. That's the one I'm most curious about."],
        ["M", "Let's go to all four together."],
      ],
      choices: ["열리는 요일", "열리는 장소", "강연자", "주제", "신청 방법"],
      answer: 5,
      clue: "신청 방법은 대화에서 언급되지 않았다.",
      explanation:
        "요일(1월 9일부터 네 번의 목요일 저녁), 장소(국립과학관 대강당), 강연자(매주 다른 대학 연구자), 주제(기후·재료·수면·바닷속 소음)는 언급되지만 신청 방법은 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 준서야, 겨울 과학 강연 시리즈 갈 거야?",
        "M: 포스터는 봤어. 언제 시작해?",
        "W: 1월 9일부터 목요일 저녁 네 번.",
        "M: 저녁이면 나는 괜찮아. 어디서 해?",
        "W: 국립과학관 대강당에서.",
        "M: 나한테는 30분 거리네. 누가 강연해?",
        "W: 매주 다른 연구자. 다 대학 연구실에서 오는 분들이야.",
        "M: 어떤 주제인데?",
        "W: 기후, 재료, 수면, 그리고 바닷속 소음에 대한 것 하나.",
        "M: 바닷속 소음? 생각해 본 적 없는데.",
        "W: 나도 그래. 그게 제일 궁금해.",
        "M: 네 번 다 같이 가자.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Copper Creek Observatory에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "M",
          "Let me tell you about the Copper Creek Observatory. " +
            "It sits on a ridge forty kilometers north of the city, " +
            "where the night sky is dark enough to see the Milky Way with the naked eye. " +
            "The observatory opens to the public on Friday and Saturday nights only. " +
            "Its main telescope has a mirror one and a half meters across. " +
            "Visitors do not need to book ahead, but the viewing deck holds sixty people at a time. " +
            "The site closes whenever cloud cover passes eighty percent, " +
            "and that decision is posted on their homepage by four in the afternoon.",
        ],
      ],
      choices: [
        "도시에서 북쪽으로 40킬로미터에 있다",
        "금요일과 토요일 밤에만 개방한다",
        "반드시 미리 예약해야 한다",
        "주 망원경 거울이 1.5미터이다",
        "구름이 많으면 문을 닫는다",
      ],
      answer: 3,
      clue: "Visitors do not need to book ahead, but the viewing deck holds sixty people at a time.",
      explanation:
        "미리 예약할 필요가 없다고 했으므로 반드시 예약해야 한다는 ③은 내용과 다르다. 따라서 답은 ③이다.",
      translation: [
        "M: 코퍼크리크 천문대를 소개해 드리겠습니다. 도시에서 북쪽으로 40킬로미터 떨어진 능선 위에 있는데, 그곳의 밤하늘은 맨눈으로 은하수를 볼 수 있을 만큼 어둡습니다. 천문대는 금요일과 토요일 밤에만 일반에 개방합니다. 주 망원경의 거울은 지름이 1.5미터입니다. 방문객이 미리 예약할 필요는 없지만, 관측 데크에는 한 번에 예순 명이 들어갑니다. 구름이 80퍼센트를 넘으면 문을 닫고, 그 결정은 오후 4시까지 누리집에 올라옵니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 선택할 인터넷 강의를 고르시오.",
      lines: [
        ["M", "Yuna, let's settle on one online course for the winter."],
        ["W", "Five are listed. How long can you sit for one video?"],
        ["M", "Forty minutes at most. Anything longer and I drift."],
        ["W", "So the fifty-minute one is out."],
        ["M", "It is. Do we want the one with weekly written feedback?"],
        ["W", "Yes. Without feedback I never find out what I'm doing wrong."],
        ["M", "Agreed. And the price? My parents gave me a hundred thousand won."],
        ["W", "Mine said the same, so a hundred thousand is the ceiling."],
        ["M", "Then only one course clears all three."],
        ["W", "Enrolment closes on the twentieth."],
        ["M", "Let's sign up tonight, then."],
        ["W", "I'll send you the link after dinner."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 1,
      clue: "Forty minutes at most. Anything longer and I drift.",
      explanation:
        "영상이 40분 이하이고, 주간 첨삭이 있으며, 수강료가 10만 원 이하인 강의를 고른다. 세 조건을 모두 채우는 것은 ①이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Video: 35 min / Feedback: Yes / Price: 95,000 won" },
          { no: 2, label: "②", value: "Video: 50 min / Feedback: Yes / Price: 90,000 won" },
          { no: 3, label: "③", value: "Video: 30 min / Feedback: No / Price: 60,000 won" },
          { no: 4, label: "④", value: "Video: 40 min / Feedback: Yes / Price: 130,000 won" },
          { no: 5, label: "⑤", value: "Video: 25 min / Feedback: No / Price: 45,000 won" },
        ],
      },
      translation: [
        "M: 유나야, 겨울에 들을 인터넷 강의 하나로 정하자.",
        "W: 다섯 개 올라와 있네. 영상 하나를 몇 분까지 앉아서 볼 수 있어?",
        "M: 길어야 40분. 더 길면 딴생각해.",
        "W: 그럼 50분짜리는 빠지네.",
        "M: 그렇지. 주간 첨삭 있는 걸로 할까?",
        "W: 응. 첨삭이 없으면 내가 뭘 틀리는지 영영 몰라.",
        "M: 동의해. 값은? 부모님이 10만 원 주셨어.",
        "W: 우리 집도 그래. 그럼 10만 원이 한계네.",
        "M: 그럼 세 조건 다 넘는 건 하나뿐이야.",
        "W: 수강 신청은 20일에 닫혀.",
        "M: 그럼 오늘 밤에 신청하자.",
        "W: 저녁 먹고 링크 보낼게.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["M", "Yuna, is the counselling office open during exam week?"],
        ["W", "It is, but only in the afternoons."],
        ["M", "I have classes every afternoon until four."],
        ["W", "They stay open until six, so go straight after your last class."],
      ],
      choices: [
        "The office closed last semester.",
        "I don't have any classes.",
        "Mornings are better for me.",
        "I'll go right after class, then.",
        "I've already graduated.",
      ],
      answer: 4,
      clue: "They stay open until six, so go straight after your last class.",
      explanation:
        "여자가 6시까지 열려 있으니 마지막 수업 후 바로 가라고 했으므로, 수업 끝나고 바로 가겠다는 ④가 가장 자연스럽다.",
      translation: [
        "M: 유나야, 시험 기간에 상담실 열어?",
        "W: 열어. 그런데 오후에만.",
        "M: 나는 매일 오후 4시까지 수업이야.",
        "W: 6시까지 하니까 마지막 수업 끝나고 바로 가.",
        "M: 그럼 수업 끝나고 바로 갈게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["W", "Junseo, my application keeps failing to upload."],
        ["M", "How big is the file you're attaching?"],
        ["W", "About thirty megabytes. It's a scanned portfolio."],
        ["M", "Their limit is ten. Save it as a compressed PDF and try again."],
      ],
      choices: [
        "My file is only one page.",
        "I'll compress it and resend.",
        "I never applied anywhere.",
        "The site has no limit.",
        "I'll mail it on paper instead.",
      ],
      answer: 2,
      clue: "Their limit is ten. Save it as a compressed PDF and try again.",
      explanation:
        "남자가 압축한 PDF로 저장해 다시 올리라고 했으므로, 압축해서 다시 보내겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 준서야, 원서가 자꾸 안 올라가.",
        "M: 붙이는 파일이 얼마나 커?",
        "W: 30메가바이트쯤. 스캔한 포트폴리오야.",
        "M: 거기 제한이 10이야. 압축한 PDF로 저장해서 다시 해 봐.",
        "W: 압축해서 다시 보낼게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Yuna, you've changed your personal statement opening nine times."],
        ["W", "None of them sound like a person I'd want to read about."],
        ["M", "Who have you shown the drafts to?"],
        ["W", "Nobody yet. I'll show it when it's good."],
        ["M", "So you're judging it with the only pair of eyes that can't be surprised."],
        ["W", "I hadn't thought of it that way."],
        ["M", "You know what you meant. A reader only has what's on the page."],
        ["W", "Then I can't tell which version actually lands."],
        ["M", "Not from inside, no."],
        ["W", "But showing a bad draft feels worse than nine more rewrites."],
        ["M", "Give two versions to someone and ask which one they remember tomorrow."],
      ],
      choices: [
        "I'll rewrite the opening once more.",
        "Nobody reads personal statements anyway.",
        "My draft is already finished.",
        "I'd rather not apply at all.",
        "I'll send two drafts to my teacher tonight.",
      ],
      answer: 5,
      clue: "Give two versions to someone and ask which one they remember tomorrow.",
      explanation:
        "남자는 두 판본을 누군가에게 주고 내일 무엇이 기억나는지 물으라고 했으므로, 오늘 밤 선생님께 두 편을 보내겠다는 ⑤가 가장 자연스럽다.",
      translation: [
        "M: 유나야, 자기소개서 도입부를 아홉 번이나 바꿨네.",
        "W: 어느 것도 내가 읽고 싶은 사람처럼 들리지 않아.",
        "M: 초안을 누구한테 보여 줬어?",
        "W: 아직 아무한테도. 괜찮아지면 보여 주려고.",
        "M: 그럼 놀랄 수 없는 유일한 눈으로 판단하고 있는 거네.",
        "W: 그렇게는 생각 못 해 봤어.",
        "M: 너는 네가 무슨 뜻으로 썼는지 알잖아. 독자는 종이에 있는 것만 갖고 있어.",
        "W: 그럼 어느 판본이 실제로 닿는지 내가 알 수 없겠네.",
        "M: 안쪽에서는 못 알아.",
        "W: 그런데 못 쓴 초안을 보여 주는 게 아홉 번 더 고치는 것보다 싫어.",
        "M: 두 판본을 누구한테 주고 내일 어느 쪽이 기억나는지 물어봐.",
        "W: 오늘 밤에 선생님께 두 편 보낼게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Junseo, you've been studying until two every night this month."],
        ["M", "There's too much left to cover before the exam."],
        ["W", "And what time do you get up?"],
        ["M", "Six thirty, same as always."],
        ["W", "So four and a half hours. How's the afternoon going?"],
        ["M", "Honestly, I read the same page three times after lunch."],
        ["W", "That's the cost showing up. You're paying for the night with the day."],
        ["M", "But if I sleep more, I cover less."],
        ["W", "You cover less at two in the morning than you think you do."],
        ["M", "So the late hours aren't really extra hours."],
        ["W", "Move your bedtime to midnight for one week and measure what you finish."],
      ],
      choices: [
        "I already sleep eight hours.",
        "I'll study until three instead.",
        "I'll try midnight starting tonight.",
        "There's nothing left to cover.",
        "Afternoons are my best time.",
      ],
      answer: 3,
      clue: "Move your bedtime to midnight for one week and measure what you finish.",
      explanation:
        "여자가 일주일만 자정에 자고 무엇을 끝내는지 재어 보라고 했으므로, 오늘 밤부터 해 보겠다는 ③이 가장 자연스럽다.",
      translation: [
        "W: 준서야, 이번 달 내내 새벽 2시까지 공부하더라.",
        "M: 시험 전에 볼 게 너무 많이 남았어.",
        "W: 그럼 몇 시에 일어나?",
        "M: 6시 반. 늘 그랬듯이.",
        "W: 네 시간 반이네. 오후에는 어때?",
        "M: 솔직히 점심 먹고 나면 같은 쪽을 세 번씩 읽어.",
        "W: 그게 대가가 드러나는 거야. 밤값을 낮으로 치르고 있는 거지.",
        "M: 그런데 더 자면 진도를 덜 나가잖아.",
        "W: 새벽 2시에는 네 생각보다 덜 나가고 있어.",
        "M: 그럼 그 늦은 시간은 진짜 추가된 시간이 아니구나.",
        "W: 일주일만 자정에 자고 무엇을 끝내는지 재어 봐.",
        "M: 오늘 밤부터 자정에 자 볼게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Nara가 Taeyang에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Nara : ________________",
      lines: [
        [
          "W",
          "Nara and Taeyang are on the student newspaper, and the final issue closes on Friday. " +
            "Taeyang has spent two weeks on a long article about the school's recycling programme, " +
            "and the writing is careful and well researched. " +
            "The problem is that his central figure, the amount of waste the school produces each week, " +
            "comes from a single line on a poster he saw in the hallway last spring. " +
            "He has not been able to find the poster since, and no office he asked has the number. " +
            "Nara knows that the facilities office keeps monthly waste records " +
            "and that a phone call would settle the figure in a few minutes. " +
            "She does not want him to drop the article, which is the best thing in the issue, " +
            "but she cannot let a number they cannot source sit in the lead paragraph. " +
            "She wants to tell him to call the facilities office and confirm the figure before Friday. " +
            "In this situation, what would Nara most likely say to Taeyang?",
        ],
      ],
      choices: [
        "Call the facilities office and confirm that number.",
        "Let's drop the recycling article this week.",
        "You should make the article twice as long.",
        "Put the poster photo on the front page.",
        "Let's move the deadline to next month.",
      ],
      answer: 1,
      clue: "She wants to tell him to call the facilities office and confirm the figure before Friday.",
      explanation:
        "나라는 태양이가 시설과에 전화해 숫자를 확인하기를 바라므로 ①이 가장 적절하다.",
      translation: [
        "W: 나라와 태양이는 학교 신문부이고, 마지막 호 마감이 금요일입니다. 태양이는 학교 재활용 사업에 관한 긴 기사를 2주 동안 썼고, 글은 꼼꼼하고 조사도 잘 되어 있습니다. 문제는 핵심 숫자, 곧 학교가 매주 내놓는 쓰레기 양이 지난봄 복도에서 본 포스터의 한 줄에서 나왔다는 점입니다. 태양이는 그 뒤로 그 포스터를 찾지 못했고, 물어본 어느 부서에도 그 숫자가 없습니다. 나라는 시설과가 월별 쓰레기 기록을 갖고 있다는 것과, 전화 한 통이면 몇 분 만에 숫자가 정리된다는 것을 압니다. 나라는 이 호에서 가장 좋은 이 기사를 태양이가 접기를 바라지 않지만, 출처를 댈 수 없는 숫자를 첫 문단에 그대로 둘 수도 없습니다. 나라는 금요일 전에 시설과에 전화해 숫자를 확인하라고 말하고 싶습니다. 이런 상황에서 나라가 태양이에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 여자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "Hello, everyone. Today I want to talk about why some plants grow far from where they began. " +
            "A tree cannot walk, so it must persuade something else to carry its seeds. " +
            "The most familiar arrangement is fruit. " +
            "An animal eats the sweet flesh, walks for a day, and deposits the seed elsewhere. " +
            "But look at the less obvious deals. " +
            "Some seeds carry a small oily body that ants find worth the trip. " +
            "The ant hauls the seed underground, eats only that oily part, " +
            "and leaves the seed in a chamber that happens to be dark, moist and free of competitors. " +
            "Other seeds grow hooks and simply attach to fur, travelling without offering anything at all. " +
            "And a few build wings and let the wind do the work, paying nothing but shape. " +
            "The plant has no say in where it lands. " +
            "What it can shape is the offer it makes to whatever passes by.",
        ],
      ],
      choices: [
        "why fruit trees produce sweet flesh in autumn",
        "how ants build their underground chambers",
        "why some seeds cannot survive in dry soil",
        "how plants get their seeds carried to new places",
        "how wind patterns change across a forest",
      ],
      answer: 4,
      clue: "A tree cannot walk, so it must persuade something else to carry its seeds.",
      explanation:
        "여자는 열매, 개미가 좋아하는 기름진 부분, 갈고리, 날개 등 식물이 씨앗을 옮기게 하는 여러 방식을 설명한다. 따라서 답은 ④이다.",
      translation: [
        "W: 안녕하세요, 여러분. 오늘은 어떤 식물이 왜 처음 자리에서 멀리 떨어진 곳까지 퍼지는지 이야기하려 합니다. 나무는 걸을 수 없으니 다른 무언가를 설득해 씨앗을 옮기게 해야 합니다. 가장 익숙한 방식은 열매입니다. 동물이 달콤한 과육을 먹고 하루쯤 걸어가 다른 곳에 씨앗을 떨어뜨립니다. 그런데 덜 뻔한 거래들을 보세요. 어떤 씨앗은 개미가 옮길 만하다고 여기는 작고 기름진 덩이를 답니다. 개미는 씨앗을 땅속으로 끌고 가 그 기름진 부분만 먹고, 마침 어둡고 축축하며 경쟁자가 없는 방에 씨앗을 남깁니다. 어떤 씨앗은 갈고리를 만들어 털에 그냥 붙습니다. 아무것도 내주지 않고 이동하는 것이지요. 또 몇몇은 날개를 만들어 바람에 일을 맡깁니다. 모양 말고는 아무것도 치르지 않고요. 식물은 어디에 내려앉을지는 정하지 못합니다. 정할 수 있는 것은 지나가는 무언가에게 내미는 제안뿐입니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 씨앗 이동 방식이 아닌 것은?",
      lines: [
        ["W", "Hello, everyone. Today I want to talk about why some plants grow far from where they began."],
        ["W", "A tree cannot walk, so it must persuade something else to carry its seeds."],
        ["W", "The most familiar arrangement is fruit. An animal eats the sweet flesh, walks for a day, and deposits the seed elsewhere."],
        ["W", "Some seeds carry a small oily body that ants find worth the trip."],
        ["W", "The ant hauls the seed underground, eats only that oily part, and leaves the seed in a chamber that happens to be dark, moist and free of competitors."],
        ["W", "Other seeds grow hooks and simply attach to fur, travelling without offering anything at all."],
        ["W", "And a few build wings and let the wind do the work, paying nothing but shape."],
      ],
      choices: [
        "being eaten inside sweet fruit",
        "floating down a river to the sea",
        "being hauled underground by ants",
        "hooking onto an animal's fur",
        "being carried by the wind on wings",
      ],
      answer: 2,
      clue: "Other seeds grow hooks and simply attach to fur, travelling without offering anything at all.",
      explanation:
        "열매 속에서 먹히기, 개미가 땅속으로 끌고 가기, 털에 갈고리로 붙기, 날개로 바람을 타기는 언급되지만 강을 따라 바다로 떠내려가는 것은 언급되지 않았다. 따라서 답은 ②이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
