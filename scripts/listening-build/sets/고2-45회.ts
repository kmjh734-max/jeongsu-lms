/** 고2 듣기 45회 — 사람이 직접 쓴 회차 (2026-09-29) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고2 45회",
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
          "Good morning, students. This is the physical education office. " +
            "Every year the sports day ends with the same complaint: " +
            "that most students sat on the grass for four hours " +
            "while the same twenty people ran every race. " +
            "This year we are changing how the events are built. " +
            "Each class must enter at least eighteen different students, " +
            "and no one may take part in more than two events. " +
            "The relay, the tug of war and the jump rope race stay as they are. " +
            "Class captains should bring their entry list to the gym office by Friday. " +
            "We would rather see everyone play badly than a few play well.",
        ],
      ],
      choices: [
        "체육 대회 참가 방식이 바뀐다고 알리려고",
        "체육 대회 날짜를 알리려고",
        "운동장 사용을 안내하려고",
        "동아리 회원을 모집하려고",
        "안전 규칙을 알리려고",
      ],
      answer: 1,
      clue: "Each class must enter at least eighteen different students",
      explanation:
        "체육 대회 참가 인원과 종목 수 규칙이 바뀐다고 알리고 있다. 따라서 답은 ①이다.",
      translation: [
        "M: 학생 여러분, 안녕하세요. 체육부입니다. 해마다 체육 대회가 끝나면 같은 말이 나옵니다. 같은 스무 명이 모든 경기를 뛰는 동안 대부분은 잔디에 네 시간을 앉아 있었다는 것입니다. 올해는 종목을 짜는 방식을 바꿉니다. 각 반은 서로 다른 학생을 최소 열여덟 명 내보내야 하고, 한 사람이 두 종목을 넘겨 나갈 수 없습니다. 이어달리기, 줄다리기, 줄넘기 경주는 그대로입니다. 반장은 금요일까지 참가 명단을 체육관 사무실로 가져와 주세요. 몇 명이 잘하는 것보다 모두가 서툴게라도 뛰는 편이 낫다고 생각합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 여자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Dain, you read the questions before you read the passage."],
        ["W", "Always, and I read them twice."],
        ["M", "Doesn't that just add time to the whole thing?"],
        ["W", "It adds thirty seconds and saves three minutes."],
        ["M", "How does knowing the question change the reading?"],
        ["W", "Without it, every sentence looks equally important."],
        ["M", "That's exactly how a long passage feels to me."],
        ["W", "So you read all of it carefully and remember none of it."],
        ["M", "And then I go back and read it again."],
        ["W", "Reading twice is the cost of not knowing what you're looking for."],
        ["M", "I always thought questions first was a shortcut."],
        ["W", "Knowing the question is what makes the reading count."],
        ["M", "I'll read the questions first tomorrow."],
      ],
      choices: [
        "문제를 먼저 읽어야 지문 읽기가 효과적이다",
        "지문을 두 번 읽어야 한다",
        "긴 지문은 나눠 읽어야 한다",
        "시간을 재면서 풀어야 한다",
        "모르는 단어를 먼저 찾아야 한다",
      ],
      answer: 1,
      clue: "Knowing the question is what makes the reading count.",
      explanation:
        "여자는 문제를 먼저 알아야 읽기가 값을 한다고 말한다. 따라서 답은 ①이다.",
      translation: [
        "M: 다인아, 너는 지문을 읽기 전에 문제를 먼저 읽더라.",
        "W: 늘 그래. 게다가 두 번 읽어.",
        "M: 그러면 전체 시간만 늘어나는 거 아니야?",
        "W: 30초가 늘고 3분이 줄어.",
        "M: 문제를 아는 게 읽기를 어떻게 바꿔?",
        "W: 모르면 모든 문장이 똑같이 중요해 보여.",
        "M: 긴 지문이 나한테 딱 그래.",
        "W: 그래서 다 꼼꼼히 읽고 하나도 기억을 못 하지.",
        "M: 그러고는 되돌아가서 다시 읽어.",
        "W: 두 번 읽는 게 무엇을 찾는지 모르는 값이야.",
        "M: 문제부터 읽는 건 요령인 줄 알았어.",
        "W: 문제를 아는 것이 읽기를 값지게 만들어.",
        "M: 내일은 문제부터 읽을게.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "A group that agrees quickly feels like a group that is working well. " +
            "In fact quick agreement is usually a sign that nobody has looked. " +
            "The first idea on the table has an unfair advantage: " +
            "it is the only one anyone has to think about. " +
            "Everything said afterwards is measured against it, " +
            "and people who half disagree say nothing rather than start again. " +
            "One simple rule changes this. " +
            "Before discussing anything, let every person write one idea alone. " +
            "Then the room has five starting points instead of one, " +
            "and the discussion is about choosing rather than about defending.",
        ],
      ],
      choices: [
        "의논 전에 각자 생각을 따로 적어야 한다",
        "회의는 짧게 해야 한다",
        "반대 의견을 존중해야 한다",
        "결정은 다수결로 해야 한다",
        "모둠은 작을수록 좋다",
      ],
      answer: 1,
      clue: "let every person write one idea alone",
      explanation:
        "의논 전에 각자 혼자 생각을 적어야 한다고 말한다. 따라서 답은 ①이다.",
      translation: [
        "M: 빨리 뜻이 모이는 모둠은 일이 잘되는 모둠처럼 보입니다. 사실 빠른 합의는 대개 아무도 들여다보지 않았다는 표시입니다. 탁자에 먼저 올라온 생각은 부당한 이점을 갖습니다. 사람들이 생각해 볼 것이 그것뿐이기 때문입니다. 그 뒤에 나오는 말은 모두 그것에 견주어 재어지고, 반쯤 다르게 생각하는 사람은 처음부터 다시 시작하느니 입을 다뭅니다. 간단한 규칙 하나가 이것을 바꿉니다. 무엇이든 의논하기 전에 각자 혼자서 생각 하나를 적게 하십시오. 그러면 방에 출발점이 하나가 아니라 다섯 개 생기고, 의논은 지켜 내는 일이 아니라 고르는 일이 됩니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["W", "Kiwon, is this the photo of the club's radio studio?"],
        ["M", "Yes, we set it up during the exam week."],
        ["W", "There's a wide desk facing the window."],
        ["M", "Two people can broadcast side by side."],
        ["W", "And a microphone stands in the middle of the desk."],
        ["M", "Two microphones, actually. One is behind the screen."],
        ["W", "I see a clock hanging above the door."],
        ["M", "We need it to keep the programme on time."],
        ["W", "There's a shelf of folders on the left wall."],
        ["M", "All the old scripts are kept there."],
        ["W", "And a rug covers the floor under the desk."],
        ["M", "It keeps our footsteps out of the recording."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 2,
      clue: "Two microphones, actually. One is behind the screen.",
      explanation:
        "마이크가 하나라고 했지만 두 개라고 했다. 따라서 답은 ②이다.",
      figure: {
        kind: "figure5",
        scene:
          "A small school radio studio, clean black line art on a plain white background, no writing or letters anywhere. " +
          "A WIDE DESK faces the window. " +
          "ONE MICROPHONE stands in the middle of the desk. " +
          "A CLOCK hangs on the wall above the door. " +
          "A SHELF OF FOLDERS is mounted on the left wall. " +
          "A RUG covers the floor under the desk.",
        spots: [
          [0.5, 0.58],
          [0.5, 0.42],
          [0.85, 0.15],
          [0.1, 0.35],
          [0.45, 0.86],
        ],
      },
      translation: [
        "W: 기원아, 이게 동아리 방송실 사진이야?",
        "M: 응, 시험 주간에 꾸몄어.",
        "W: 창문을 보고 놓인 넓은 책상이 있네.",
        "M: 둘이 나란히 방송할 수 있어.",
        "W: 그리고 책상 가운데에 마이크가 하나 서 있고.",
        "M: 사실 두 개야. 하나가 가림막 뒤에 있어.",
        "W: 문 위에 시계가 걸려 있는 게 보여.",
        "M: 방송 시간을 맞추려면 있어야 해.",
        "W: 왼쪽 벽에는 서류철 선반이 있네.",
        "M: 옛날 대본을 다 거기에 둬.",
        "W: 그리고 책상 밑 바닥에 깔개가 깔려 있고.",
        "M: 발소리가 녹음에 안 들어가게 해 줘.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 여자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Suyeon, the school assembly begins in fifty minutes."],
        ["W", "The chairs are set out and the stage is clear."],
        ["M", "Did anyone bring the microphone battery from the office?"],
        ["W", "I thought the broadcasting club was bringing it."],
        ["M", "They finished at lunch and went straight home."],
        ["W", "Then nobody has picked it up at all."],
        ["M", "It's in the drawer in the main office."],
        ["W", "The office closes at four on Wednesdays."],
        ["M", "It's ten to four right now."],
        ["W", "Then I have to run down this minute."],
        ["M", "I'll finish testing the speakers here."],
        ["W", "I'll go and get the microphone battery."],
      ],
      choices: [
        "스피커를 점검하기",
        "의자를 놓기",
        "마이크 건전지를 가져오기",
        "방송부에 연락하기",
        "무대를 정리하기",
      ],
      answer: 3,
      clue: "I'll go and get the microphone battery.",
      explanation:
        "여자는 사무실에서 마이크 건전지를 가져오겠다고 했다. 따라서 답은 ③이다.",
      translation: [
        "M: 수연아, 조회가 50분 뒤에 시작해.",
        "W: 의자는 놓았고 무대도 비웠어.",
        "M: 사무실에서 마이크 건전지는 누가 가져왔어?",
        "W: 방송부가 가져오는 줄 알았는데.",
        "M: 점심때 끝내고 바로 집에 갔어.",
        "W: 그럼 아무도 안 찾아왔네.",
        "M: 본관 사무실 서랍에 있어.",
        "W: 사무실은 수요일에 네 시에 닫아.",
        "M: 지금 네 시 10분 전이야.",
        "W: 그럼 내가 당장 뛰어 내려가야겠다.",
        "M: 나는 여기서 스피커 점검을 끝낼게.",
        "W: 내가 가서 마이크 건전지를 가져올게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 남자가 지불할 금액을 고르시오.",
      lines: [
        ["W", "Welcome to the art supply shop. What do you need?"],
        ["M", "Four canvases and two tubes of white paint."],
        ["W", "The small canvases are five dollars each."],
        ["M", "Are the large ones much more?"],
        ["W", "Nine dollars each for the large size."],
        ["M", "I'll take four small ones, then."],
        ["W", "And the white paint is five dollars a tube."],
        ["M", "That's more than I remembered."],
        ["W", "The price went up when the new stock came in."],
        ["M", "Is there a discount for art club members?"],
        ["W", "Ten percent off the total with your club card."],
        ["M", "Here it is. I'll pay now."],
      ],
      choices: ["$24.30", "$25.20", "$27.00", "$29.70", "$30.00"],
      answer: 3,
      clue: "The small canvases are five dollars each.",
      explanation:
        "작은 캔버스 네 장 20달러와 물감 두 개 10달러로 30달러인데, 10퍼센트를 빼면 27달러이다. 따라서 답은 ③이다.",
      translation: [
        "W: 미술 재료점에 오신 걸 환영합니다. 뭐가 필요하세요?",
        "M: 캔버스 네 장이랑 흰 물감 두 개요.",
        "W: 작은 캔버스는 한 장에 5달러입니다.",
        "M: 큰 건 훨씬 비싼가요?",
        "W: 큰 것은 한 장에 9달러입니다.",
        "M: 그럼 작은 걸로 네 장 주세요.",
        "W: 흰 물감은 한 개에 5달러입니다.",
        "M: 제가 기억하던 것보다 비싸네요.",
        "W: 새 물건이 들어오면서 값이 올랐습니다.",
        "M: 미술 동아리 회원 할인은 있나요?",
        "W: 동아리 카드가 있으면 전체에서 10퍼센트 할인됩니다.",
        "M: 여기 있어요. 지금 낼게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 여자가 동아리 대표를 맡지 않기로 한 이유를 고르시오.",
      lines: [
        ["M", "Chaerin, I heard you turned down the club leader position."],
        ["M", "Everyone assumed you would take it this year."],
        ["W", "I thought about it for two weeks."],
        ["M", "Did you feel you weren't ready for it?"],
        ["W", "I could do the job, I'm fairly sure of that."],
        ["M", "Then is it your parents who said no?"],
        ["W", "They left the whole thing up to me."],
        ["M", "So what decided it?"],
        ["W", "The leader has to be at every Friday meeting."],
        ["M", "And Friday is when you have your science course."],
        ["W", "It runs until seven, and I can't move it."],
        ["M", "Then the timing simply made it impossible."],
      ],
      choices: [
        "자신이 없어서",
        "부모님이 반대해서",
        "몸이 아파서",
        "금요일 모임 시간이 수업과 겹쳐서",
        "다른 동아리를 맡아서",
      ],
      answer: 4,
      clue: "The leader has to be at every Friday meeting.",
      explanation:
        "금요일 모임이 과학 수업과 겹쳐 맡을 수 없다. 따라서 답은 ④이다.",
      translation: [
        "M: 채린아, 동아리 대표 자리를 거절했다며.",
        "M: 올해는 네가 맡을 거라고 다들 생각했는데.",
        "W: 두 주 동안 생각했어.",
        "M: 아직 준비가 안 됐다고 느꼈어?",
        "W: 일은 할 수 있어. 그건 꽤 확신해.",
        "M: 그럼 부모님이 반대하셨어?",
        "W: 전부 나한테 맡기셨어.",
        "M: 그럼 뭐가 결정적이었어?",
        "W: 대표는 금요일 모임에 빠짐없이 나와야 해.",
        "M: 금요일에 네 과학 수업이 있잖아.",
        "W: 일곱 시까지 하는데 옮길 수가 없어.",
        "M: 그럼 시간이 아예 안 맞는 거네.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 교내 사진 대회에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["M", "Areum, are you entering the school photo contest?"],
        ["M", "The notice appeared on the art room door this morning."],
        ["W", "I saw it on the way in. When is the deadline?"],
        ["M", "The last day of this month, by email."],
        ["W", "How many photographs can one person send?"],
        ["M", "Two at most, and they must be your own."],
        ["W", "Is there a theme this year?"],
        ["M", "A corner of the school nobody photographs."],
        ["W", "That's a better theme than last year's."],
        ["M", "Winning photos are printed and hung in the hallway."],
        ["W", "For how long do they stay up?"],
        ["M", "Until the end of the school year."],
        ["W", "Then I'll start looking around tomorrow."],
      ],
      choices: ["제출 기한", "낼 수 있는 장수", "올해 주제", "수상작을 거는 기간", "심사 위원"],
      answer: 5,
      clue: "The last day of this month, by email.",
      explanation:
        "기한, 장수, 주제, 전시 기간은 말했지만 심사 위원은 말하지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 아름아, 교내 사진 대회에 낼 거야?",
        "M: 오늘 아침에 미술실 문에 알림이 붙었어.",
        "W: 들어오다 봤어. 마감이 언제야?",
        "M: 이번 달 마지막 날까지, 전자우편으로.",
        "W: 한 사람이 몇 장까지 낼 수 있어?",
        "M: 많아야 두 장. 직접 찍은 것이어야 해.",
        "W: 올해 주제가 있어?",
        "M: 아무도 찍지 않는 학교의 한구석.",
        "W: 작년 주제보다 낫네.",
        "M: 수상작은 인화해서 복도에 걸어.",
        "W: 얼마나 걸어 둬?",
        "M: 학년이 끝날 때까지.",
        "W: 그럼 내일부터 둘러봐야겠다.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "다음을 듣고, 학교 진로 특강에 관한 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "W",
          "Hello, students. Here is the news about next month's career talks. " +
            "Six talks are held over two days, the fifth and the sixth. " +
            "Each talk lasts forty minutes and is given by a working professional. " +
            "The talks take place in the seminar rooms on the third floor. " +
            "You may attend as many talks as you wish. " +
            "There is no application form; simply walk in and sit down. " +
            "Second and third grade students are welcome at every talk. " +
            "First grade students may attend only the afternoon sessions. " +
            "A list of the six speakers goes up on the noticeboard tomorrow.",
        ],
      ],
      choices: [
        "이틀 동안 여섯 번 열린다",
        "한 번에 40분씩 진행된다",
        "3층 세미나실에서 열린다",
        "신청서를 내지 않아도 된다",
        "1학년은 참석할 수 없다",
      ],
      answer: 5,
      clue: "First grade students may attend only the afternoon sessions.",
      explanation:
        "1학년도 오후 시간에는 참석할 수 있다고 했으므로 ⑤가 일치하지 않는다.",
      translation: [
        "W: 학생 여러분, 안녕하세요. 다음 달 진로 특강 소식입니다. 5일과 6일 이틀에 걸쳐 여섯 번 열립니다. 한 번에 40분씩이고, 실제로 일하는 분이 이야기해 주십니다. 특강은 3층 세미나실에서 진행됩니다. 원하는 만큼 들으셔도 됩니다. 신청서는 없습니다. 그냥 들어와 앉으시면 됩니다. 2학년과 3학년은 모든 특강에 오실 수 있습니다. 1학년은 오후 시간에만 참석하실 수 있습니다. 여섯 분의 명단은 내일 게시판에 붙입니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 예약할 연습실을 고르시오.",
      lines: [
        ["M", "Nari, which practice room should the team book?"],
        ["W", "Five rooms are free at the youth center this week."],
        ["M", "How many of us are coming on Saturday?"],
        ["W", "Nine, including the two first graders."],
        ["M", "Then rooms for six are out for us."],
        ["W", "Two of these hold only six people."],
        ["M", "What about the fee for each hour?"],
        ["W", "Under fifteen thousand won, that's the budget."],
        ["M", "One of them is above that amount."],
        ["W", "And it has to have a mirror on one wall."],
        ["M", "We can't practise the movements without one."],
        ["W", "Then only one room fits everything."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 5,
      clue: "Nine, including the two first graders.",
      explanation:
        "9명 수용, 시간당 1만 5천 원 미만, 거울이 있는 방은 ⑤이다. 따라서 답은 ⑤이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "People: 6 / Fee: 10,000 won / Mirror: Yes" },
          { no: 2, label: "②", value: "People: 10 / Fee: 18,000 won / Mirror: Yes" },
          { no: 3, label: "③", value: "People: 6 / Fee: 12,000 won / Mirror: No" },
          { no: 4, label: "④", value: "People: 10 / Fee: 13,000 won / Mirror: No" },
          { no: 5, label: "⑤", value: "People: 10 / Fee: 14,000 won / Mirror: Yes" },
        ],
      },
      translation: [
        "M: 나리야, 팀은 어떤 연습실을 예약할까?",
        "W: 이번 주에 청소년 센터에 다섯 개가 비어 있어.",
        "M: 토요일에 몇 명이 와?",
        "W: 1학년 둘까지 아홉 명.",
        "M: 그럼 여섯 명짜리 방은 빠지네.",
        "W: 이 중 두 곳은 여섯 명까지만 돼.",
        "M: 한 시간에 얼마씩인데?",
        "W: 1만 5천 원 미만, 그게 예산이야.",
        "M: 하나는 그보다 비싸.",
        "W: 그리고 한쪽 벽에 거울이 있어야 해.",
        "M: 그게 없으면 동작 연습을 못 해.",
        "W: 그럼 다 맞는 건 하나뿐이야.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Have you signed up for the mock interview?"],
        ["W", "I wrote my name on the sheet this morning."],
        ["M", "They ask you to bring a one-page introduction."],
        ["W", "I can write that tonight."],
        ["M", "Shall we read each other's before Thursday?"],
      ],
      choices: [
        "Sure, on Wednesday evening.",
        "The interview was cancelled.",
        "I don't need an introduction.",
        "There is no sheet.",
        "Thursday already passed.",
      ],
      answer: 1,
      clue: "Shall we read each other's before Thursday?",
      explanation:
        "목요일 전에 서로 읽어 보자는 제안이므로, 수요일 저녁에 하자는 ①이 가장 자연스럽다.",
      translation: [
        "M: 모의 면접 신청했어?",
        "W: 오늘 아침에 종이에 이름 적었어.",
        "M: 한 쪽짜리 자기소개를 가져오라고 하더라.",
        "W: 그건 오늘 밤에 쓸 수 있어.",
        "M: 목요일 전에 서로 읽어 볼까?",
        "W: 좋아, 수요일 저녁에.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Excuse me, does the school store sell exam paper?"],
        ["M", "Yes, on the shelf near the window."],
        ["W", "Is it sold by the sheet or in packs?"],
        ["M", "Packs of fifty only, I'm afraid."],
        ["W", "Do you have anything smaller?"],
      ],
      choices: [
        "The store has no paper.",
        "The library sells single sheets.",
        "I don't work here.",
        "Fifty is the smallest.",
        "You can't buy paper.",
      ],
      answer: 2,
      clue: "Do you have anything smaller?",
      explanation:
        "더 작은 묶음이 있는지 물었으므로, 도서관에서 낱장으로 판다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 실례합니다, 학교 매점에서 시험지를 파나요?",
        "M: 네, 창가 선반에요.",
        "W: 낱장으로 파나요, 묶음으로 파나요?",
        "M: 아쉽지만 쉰 장 묶음만 있습니다.",
        "W: 더 작은 건 없나요?",
        "M: 도서관에서 낱장으로 팝니다.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Seongjun, how is the club's fundraising going this month?"],
        ["M", "We have collected eleven thousand won in two whole weeks."],
        ["W", "That is far less than you hoped for."],
        ["M", "We wanted a hundred thousand by the end of November."],
        ["W", "Where exactly did you put the collection box?"],
        ["M", "On the table just outside the teachers' room."],
        ["W", "Does anyone ever stop there during the day?"],
        ["M", "Only students who are in trouble, I suppose."],
        ["W", "So the box sits where nobody ever lingers."],
        ["M", "I chose that spot because it seemed safe."],
        ["W", "Safe and invisible are very close together."],
        ["M", "Where would people actually stand still for a while?"],
        ["W", "In the queue outside the cafeteria, every single day."],
      ],
      choices: [
        "Nobody stands in queues.",
        "Then I'll move the box there.",
        "We'll stop collecting money.",
        "The cafeteria is closed.",
        "The box is already there.",
      ],
      answer: 2,
      clue: "In the queue outside the cafeteria, every single day.",
      explanation:
        "사람들이 서 있는 곳을 알려 주었으므로, 상자를 그리로 옮기겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 성준아, 이번 달 동아리 모금은 잘돼 가?",
        "M: 꼬박 두 주 동안 만 천 원 모았어.",
        "W: 바라던 것보다 훨씬 적네.",
        "M: 11월 말까지 십만 원을 모으려고 했어.",
        "W: 모금함을 정확히 어디에 뒀어?",
        "M: 교무실 바로 밖 탁자에.",
        "W: 낮에 거기 멈춰 서는 사람이 있기는 해?",
        "M: 혼나러 가는 학생 말고는 없겠지.",
        "W: 그럼 아무도 머무르지 않는 데에 상자가 있는 거네.",
        "M: 안전해 보여서 그 자리를 골랐어.",
        "W: 안전한 것과 안 보이는 것은 아주 가깝지.",
        "M: 사람들이 실제로 한동안 가만히 서 있는 데가 어디야?",
        "W: 급식실 밖 줄, 하루도 빠짐없이 거기야.",
        "M: 그럼 상자를 거기로 옮길게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Yerin, you said you can never remember people's names."],
        ["W", "Five minutes after meeting someone, it's gone."],
        ["M", "What do you do while they are saying it?"],
        ["W", "I'm usually thinking about what to say next."],
        ["M", "So the name never really arrives."],
        ["W", "It goes past me while I prepare my own sentence."],
        ["M", "The trick is to use it once, out loud, straight away."],
        ["W", "Just repeat it back to them?"],
        ["M", "In a normal sentence, so it doesn't sound strange."],
        ["W", "That would take one second."],
        ["M", "When could you practise that?"],
      ],
      choices: [
        "I never meet new people.",
        "At the club meeting tomorrow.",
        "I'll write names down instead.",
        "Names don't matter much.",
        "I already remember everyone.",
      ],
      answer: 2,
      clue: "When could you practise that?",
      explanation:
        "언제 연습할 수 있는지 물었으므로, 내일 동아리 모임에서라는 ②가 가장 자연스럽다.",
      translation: [
        "M: 예린아, 사람 이름을 못 외운다고 했잖아.",
        "W: 만나고 5분이면 사라져.",
        "M: 상대가 이름을 말할 때 넌 뭘 하고 있어?",
        "W: 보통 다음에 무슨 말을 할지 생각해.",
        "M: 그럼 이름이 애초에 도착을 안 하지.",
        "W: 내 문장을 준비하는 사이에 지나가 버려.",
        "M: 요령은 그 자리에서 한 번 소리 내어 써 보는 거야.",
        "W: 그냥 되받아 말하면 돼?",
        "M: 이상하게 안 들리게 평범한 문장 안에 넣어서.",
        "W: 그건 1초면 되겠다.",
        "M: 언제 연습해 볼 수 있어?",
        "W: 내일 동아리 모임에서.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Junho가 Sujin에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Junho : ________________",
      lines: [
        [
          "M",
          "Junho and Sujin are running the club booth at the school festival. " +
            "They have been selling drinks since the booth opened this morning. " +
            "Sujin has been keeping all the money loose in an open box " +
            "that sits at the front edge of the table, facing the crowd. " +
            "Junho has already seen two people lean over it to reach a cup. " +
            "The money will be counted and handed to the office this evening. " +
            "He wants her to move the box behind the table and cover it. " +
            "In this situation, what would Junho most likely say to Sujin?",
        ],
      ],
      choices: [
        "Let's sell the drinks faster.",
        "The festival ends tomorrow.",
        "Move the money box behind the table.",
        "We should lower our prices.",
        "Nobody has bought anything.",
      ],
      answer: 3,
      clue: "He wants her to move the box behind the table and cover it.",
      explanation:
        "돈통이 앞쪽에 열린 채로 있어 위험하므로, 탁자 뒤로 옮기라는 ③이 가장 적절하다.",
      translation: [
        "M: 준호와 수진이는 학교 축제에서 동아리 부스를 맡고 있습니다. 오늘 아침 부스를 연 뒤로 계속 음료를 팔았습니다. 수진이는 돈을 모두 열린 상자에 그대로 담아 두었는데, 그 상자가 탁자 앞쪽 가장자리에서 사람들 쪽을 향해 놓여 있습니다. 준호는 벌써 두 사람이 컵을 집으려고 그 위로 몸을 기울이는 것을 봤습니다. 돈은 오늘 저녁에 세어서 사무실에 넘겨야 합니다. 그는 상자를 탁자 뒤로 옮기고 덮어 두기를 바랍니다. 이런 상황에서 준호가 수진이에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 여자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "Hello, everyone. Today I want to talk about the ways animals " +
            "protect themselves by pretending to be something they are not. " +
            "The hoverfly has the yellow and black bands of a wasp " +
            "but no sting at all, and birds leave it alone anyway. " +
            "A certain caterpillar swells the front of its body " +
            "until two false eyes appear and it looks like a small snake. " +
            "The octopus flattens itself against the sea floor " +
            "and copies the pattern of the sand grain by grain. " +
            "A ground-nesting bird drags one wing as though it were broken, " +
            "leading the fox away from the eggs before flying off unharmed. " +
            "Being safe, it seems, is often a matter of being misread.",
        ],
      ],
      choices: [
        "how animals protect themselves by looking like something else",
        "why wasps are dangerous to birds",
        "how octopuses hunt on the sea floor",
        "why some birds build nests on the ground",
        "how caterpillars become butterflies",
      ],
      answer: 1,
      clue: "Being safe, it seems, is often a matter of being misread.",
      explanation:
        "다른 것처럼 보여 스스로를 지키는 방식이 중심 내용이다. 따라서 답은 ①이다.",
      translation: [
        "W: 여러분, 안녕하세요. 오늘은 동물들이 자기가 아닌 무언가인 척해서 스스로를 지키는 방식을 이야기하려 합니다. 꽃등에는 말벌처럼 노랗고 검은 띠를 두르고 있지만 침이 전혀 없습니다. 그런데도 새들은 건드리지 않습니다. 어떤 애벌레는 몸 앞쪽을 부풀려 가짜 눈 두 개를 드러내고 작은 뱀처럼 보이게 합니다. 문어는 바닥에 납작하게 붙어 모래 무늬를 한 알 한 알 따라 합니다. 땅에 둥지를 트는 어떤 새는 한쪽 날개를 부러진 듯 끌며 여우를 알에서 멀리 데려간 뒤, 멀쩡하게 날아가 버립니다. 안전하다는 것은 흔히 잘못 읽히는 일인 모양입니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "다음을 듣고, 언급된 동물이 아닌 것을 고르시오.",
      lines: [
        ["W", "The hoverfly has the yellow and black bands of a wasp."],
        ["W", "A certain caterpillar swells the front of its body."],
        ["W", "The octopus copies the pattern of the sand grain by grain."],
        ["W", "A ground-nesting bird drags one wing as though it were broken."],
        ["W", "Being safe is often a matter of being misread."],
      ],
      choices: ["hoverflies", "caterpillars", "octopuses", "ground-nesting birds", "frogs"],
      answer: 5,
      clue: "A ground-nesting bird drags one wing as though it were broken.",
      explanation:
        "꽃등에, 애벌레, 문어, 땅에 둥지를 트는 새는 언급되지만 개구리는 나오지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
