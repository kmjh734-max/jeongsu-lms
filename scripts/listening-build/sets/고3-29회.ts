/** 고3 듣기 29회 — 사람이 직접 쓴 회차 (2026-09-25) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고3 29회",
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
          "Good afternoon, students. This is Mr. Sim from the admissions support office. " +
            "I want to talk about the documents you submit to us for checking. " +
            "We read every one before it goes out, and we are glad to do it. " +
            "The problem is the format. " +
            "About half of what arrives is a photograph of a screen or a printed page, " +
            "and we cannot open a photograph in the checking software. " +
            "So from Monday, please send the original file, not a picture of it. " +
            "If you only have paper, the office scanner is free to use until five. " +
            "A file we can open is checked the same day. " +
            "A photograph waits until someone has time to retype it. Thank you.",
        ],
      ],
      choices: [
        "서류 제출 기한을 알리려고",
        "복사기 사용법을 안내하려고",
        "서류를 사진 말고 원본 파일로 보내 달라고 하려고",
        "상담 신청 방법을 알리려고",
        "입시 설명회를 알리려고",
      ],
      answer: 3,
      clue: "So from Monday, please send the original file, not a picture of it.",
      explanation:
        "남자는 화면이나 종이를 찍은 사진은 검사 프로그램에서 열 수 없다며 원본 파일을 보내 달라고 부탁한다. 따라서 답은 ③이다.",
      translation: [
        "M: 학생 여러분, 안녕하세요. 입시지원실 심입니다. 저희에게 검토를 맡기는 서류 이야기를 하려고 합니다. 나가기 전에 하나하나 다 읽고 있고, 그 일은 기쁘게 하고 있습니다. 문제는 형식입니다. 들어오는 것의 절반쯤이 화면이나 인쇄한 종이를 찍은 사진인데, 사진은 검사 프로그램에서 열 수가 없습니다. 그러니 월요일부터는 사진 말고 원본 파일을 보내 주세요. 종이만 있다면 사무실 스캐너를 5시까지 무료로 쓰실 수 있습니다. 열 수 있는 파일은 그날 안에 검토됩니다. 사진은 누군가 다시 입력할 시간이 날 때까지 기다립니다. 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 여자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Chaeun, I've been listening to lecture recordings at double speed."],
        ["W", "Double? How much of it do you follow?"],
        ["M", "Most of it. I can hear every word."],
        ["W", "Hearing every word isn't the same as having time to think."],
        ["M", "What would I need time for? The explanation is right there."],
        ["W", "For the half second where you'd normally say, wait, why."],
        ["M", "At double speed that moment goes past."],
        ["W", "And you never notice it went past, which is the problem."],
        ["M", "So I'm covering more and understanding less."],
        ["W", "You're covering more and noticing less. That's worse."],
        ["M", "Then should I go back to normal speed?"],
        ["W", "Normal speed, and pause whenever something surprises you."],
      ],
      choices: [
        "강의는 생각할 틈이 있는 속도로 들어야 한다",
        "강의는 빠르게 들어야 시간을 아낀다",
        "녹음은 두 번 들어야 한다",
        "필기를 하며 들어야 한다",
        "모르는 부분은 건너뛰어야 한다",
      ],
      answer: 1,
      clue: "Normal speed, and pause whenever something surprises you.",
      explanation:
        "여자는 빠르게 들으면 '왜?'라고 멈칫할 순간이 지나가 버린다며, 보통 속도로 듣고 놀랄 때 멈추라고 말한다. 따라서 답은 ①이다.",
      translation: [
        "M: 채은아, 나 강의 녹음을 두 배속으로 듣고 있어.",
        "W: 두 배? 얼마나 따라가?",
        "M: 거의 다. 단어는 하나하나 다 들려.",
        "W: 단어가 다 들리는 것과 생각할 틈이 있는 건 달라.",
        "M: 뭘 생각할 틈이 필요한데? 설명이 바로 거기 있잖아.",
        "W: 보통이면 '잠깐, 왜지?'라고 하게 되는 반 초를 위해서.",
        "M: 두 배속에서는 그 순간이 지나가 버리지.",
        "W: 그리고 지나간 줄도 모르지. 그게 문제야.",
        "M: 그럼 나는 더 많이 보고 덜 이해하는 거네.",
        "W: 더 많이 보고 덜 알아채는 거지. 그게 더 나빠.",
        "M: 그럼 보통 속도로 돌아가야 해?",
        "W: 보통 속도로 듣고, 놀랄 때마다 멈춰.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "When we learn that a study found something, " +
            "we almost never ask the question that decides whether it means anything. " +
            "How many people were in it. " +
            "A striking result from twelve participants and a dull result from four thousand " +
            "carry very different weight, " +
            "and the striking one is the one that travels. " +
            "Small studies do not just have more uncertainty. " +
            "They are also the ones most likely to show a large effect by accident, " +
            "because a handful of unusual people can move a small average a long way. " +
            "That is exactly the kind of result an editor wants to print. " +
            "So the next time a finding surprises you, " +
            "look for the number of participants before you look at anything else.",
        ],
      ],
      choices: [
        "놀라운 연구일수록 믿을 만하다",
        "연구는 여러 번 반복해야 한다",
        "통계는 배우기 어렵다",
        "연구 결과는 참여자 수를 먼저 확인해야 한다",
        "언론 보도를 믿으면 안 된다",
      ],
      answer: 4,
      clue: "look for the number of participants before you look at anything else",
      explanation:
        "남자는 작은 연구일수록 우연히 큰 효과가 나오기 쉽다며, 결과를 보기 전에 참여자 수를 먼저 보라고 말한다. 따라서 답은 ④이다.",
      translation: [
        "M: 어떤 연구가 무엇을 밝혀냈다는 말을 들을 때, 우리는 그것이 무슨 뜻인지를 결정하는 질문을 거의 하지 않습니다. 몇 명이 참여했는가입니다. 열두 명에게서 나온 놀라운 결과와 사천 명에게서 나온 밋밋한 결과는 무게가 아주 다른데, 널리 퍼지는 쪽은 놀라운 쪽입니다. 작은 연구는 불확실성만 큰 것이 아닙니다. 우연히 큰 효과를 보여 줄 가능성이 가장 높은 쪽이기도 합니다. 특이한 사람 몇 명이 작은 평균을 멀리까지 옮길 수 있기 때문입니다. 그리고 그것이 바로 편집자가 싣고 싶어 하는 종류의 결과입니다. 그러니 다음에 어떤 발견이 놀랍게 들리거든, 다른 무엇을 보기 전에 참여자 수를 먼저 찾아보세요.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["W", "Junhee, is this the corner you set up for the model club?"],
        ["M", "Yes, we finished it last month."],
        ["W", "There's a magnifying lamp clamped to the workbench."],
        ["M", "You can't paint a model without one."],
        ["W", "And a pegboard of tools hangs on the wall."],
        ["M", "Every tool has its outline drawn behind it."],
        ["W", "I count three paint racks on the bench."],
        ["M", "There are four. One is behind the lamp."],
        ["W", "The tall stool looks like the ones from the science room."],
        ["M", "It is. Nobody was using them."],
        ["W", "And a bin of offcuts sits under the bench."],
        ["M", "We melt those down and reuse them."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "There are four. One is behind the lamp.",
      explanation:
        "여자가 물감 선반이 세 개라고 하자 남자가 네 개라고 바로잡는다. 그림에는 세 개가 그려져 있으므로 답은 ③이다.",
      figure: {
        kind: "scene",
        scene:
          "A model-making workbench drawn as one wide picture, clean black line art on white, no writing or letters or numbers anywhere. " +
          "A MAGNIFYING LAMP on an arm is clamped to the edge of the workbench. " +
          "A PEGBOARD covered with hanging hand tools is fixed on the wall above the bench. " +
          "EXACTLY THREE SMALL PAINT RACKS holding paint bottles stand on the bench, spaced well apart so all three are easy to count and none overlap. " +
          "A TALL STOOL stands beside the bench. " +
          "A BIN OF OFFCUTS sits on the floor under the bench.",
      },
      translation: [
        "W: 준희야, 이게 모형 동아리로 꾸민 자리야?",
        "M: 응, 지난달에 다 끝냈어.",
        "W: 작업대에 확대경 스탠드가 물려 있네.",
        "M: 그거 없이는 모형을 못 칠해.",
        "W: 그리고 벽에 공구 걸이판이 걸려 있어.",
        "M: 공구마다 뒤에 윤곽선을 그려 놨어.",
        "W: 작업대에 물감 선반이 세 개 보여.",
        "M: 네 개야. 하나는 스탠드 뒤에 있어.",
        "W: 높은 의자는 과학실에 있는 것 같네.",
        "M: 맞아. 아무도 안 쓰고 있었어.",
        "W: 그리고 작업대 밑에 자투리 통이 있어.",
        "M: 그건 녹여서 다시 써.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 여자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Chaeun, the mock exam starts at nine in the gym."],
        ["W", "I know. Are the desks spaced correctly?"],
        ["M", "All two hundred, a meter apart. I measured the first row."],
        ["W", "Good. And the answer sheets?"],
        ["M", "Counted and sealed by room. Two hundred and twenty."],
        ["W", "Then what's still open?"],
        ["M", "The clock in the gym stopped sometime last night."],
        ["W", "They need to see the time. Is there a spare?"],
        ["M", "A big one in the staff room, but it needs a stand."],
        ["W", "Who has the stand?"],
        ["M", "The caretaker. I'd go, but I have to brief the twelve invigilators at half past eight."],
        ["W", "Then I'll fetch the clock and the stand."],
      ],
      choices: [
        "책상 간격 재기",
        "답안지 세기",
        "감독관에게 설명하기",
        "체육관 청소하기",
        "시계와 받침대 가져오기",
      ],
      answer: 5,
      clue: "Then I'll fetch the clock and the stand.",
      explanation:
        "책상과 답안지는 끝났고 남자는 감독관들에게 설명해야 하므로, 여자가 시계와 받침대를 가져오기로 한다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 채은아, 모의고사가 9시에 체육관에서 시작해.",
        "W: 알아. 책상 간격은 맞췄어?",
        "M: 이백 개 다, 1미터씩. 첫 줄은 재 봤어.",
        "W: 좋아. 답안지는?",
        "M: 세서 고사장별로 봉했어. 이백이십 장.",
        "W: 그럼 아직 남은 게 뭐야?",
        "M: 체육관 시계가 어젯밤 어느 때인가 멈췄어.",
        "W: 시간을 봐야 하는데. 여분 있어?",
        "M: 교무실에 큰 게 있어. 그런데 받침대가 있어야 해.",
        "W: 받침대는 누가 갖고 있어?",
        "M: 관리 선생님이. 내가 가고 싶은데, 8시 30분에 감독관 열두 분께 설명해야 해.",
        "W: 그럼 내가 시계랑 받침대 가져올게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 남자가 지불할 금액을 고르시오.",
      lines: [
        ["W", "Welcome to Ashgrove Framing. What can I do for you?"],
        ["M", "I'd like six photographs framed, all the same size."],
        ["W", "A standard frame is twenty-two dollars each."],
        ["M", "So one hundred and thirty-two for the six."],
        ["W", "That's right. Would you like glass instead of plastic fronts?"],
        ["M", "How much does glass add?"],
        ["W", "Five dollars a frame, so thirty more."],
        ["M", "We'll stay with plastic. They're going in a corridor."],
        ["W", "Sensible. Are these for a school?"],
        ["M", "They are. Here's the school card."],
        ["W", "Then I can take twenty-five percent off the frames."],
        ["M", "Thank you. I'll pay now and collect on Thursday."],
      ],
      choices: ["$108.00", "$121.50", "$99.00", "$132.00", "$162.00"],
      answer: 3,
      clue: "Then I can take twenty-five percent off the frames.",
      explanation:
        "액자 6개 132달러에서 유리는 빼고, 25퍼센트를 빼면 99달러이다. 따라서 답은 ③이다.",
      translation: [
        "W: 애시그로브 액자점입니다. 무엇을 도와드릴까요?",
        "M: 사진 여섯 장을 같은 크기로 액자에 넣고 싶어요.",
        "W: 기본 액자는 하나에 22달러입니다.",
        "M: 그럼 여섯 개에 132달러네요.",
        "W: 맞습니다. 앞면을 플라스틱 대신 유리로 하시겠어요?",
        "M: 유리는 얼마가 더 붙나요?",
        "W: 액자 하나에 5달러라서 30달러가 더 붙습니다.",
        "M: 플라스틱으로 할게요. 복도에 걸 거예요.",
        "W: 현명하시네요. 학교에 거는 건가요?",
        "M: 네. 여기 학교 카드요.",
        "W: 그럼 액자값에서 25퍼센트를 빼 드릴게요.",
        "M: 감사합니다. 지금 결제하고 목요일에 찾아갈게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 여자가 겨울 캠프에 가지 않는 이유를 고르시오.",
      lines: [
        ["M", "Chaeun, you're not on the winter camp list."],
        ["W", "I took my name off on Monday."],
        ["M", "Is the fee too much? It went up this year."],
        ["W", "My aunt offered to cover it."],
        ["M", "Then is it the dates? It runs right through the holiday."],
        ["W", "The dates are fine. It's the interview."],
        ["M", "Which interview?"],
        ["W", "The university one. They assigned me the second day of the camp."],
        ["M", "Can't you ask them to move it?"],
        ["W", "The times are assigned, not chosen. I asked on the first day."],
      ],
      choices: [
        "대학 면접과 겹쳐서",
        "참가비가 부담스러워서",
        "일정이 방학과 겹쳐서",
        "건강이 좋지 않아서",
        "가족 여행을 가서",
      ],
      answer: 1,
      clue: "The university one. They assigned me the second day of the camp.",
      explanation:
        "참가비도 해결되었고 날짜도 괜찮지만, 대학 면접이 캠프 둘째 날로 배정되었고 시간을 고를 수 없기 때문이다. 따라서 답은 ①이다.",
      translation: [
        "M: 채은아, 겨울 캠프 명단에 네가 없네.",
        "W: 월요일에 이름을 뺐어.",
        "M: 참가비가 부담스러워? 올해 올랐잖아.",
        "W: 이모가 내 주신다고 했어.",
        "M: 그럼 날짜 때문이야? 방학 내내 하잖아.",
        "W: 날짜는 괜찮아. 면접 때문이야.",
        "M: 무슨 면접?",
        "W: 대학 면접. 캠프 둘째 날로 배정됐어.",
        "M: 옮겨 달라고 못 해?",
        "W: 시간이 배정되는 거라 못 골라. 첫날에 물어봤어.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, Lakeview Writing Retreat에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["M", "Chaeun, have you looked at the Lakeview Writing Retreat?"],
        ["W", "I saw the notice. When does it run?"],
        ["M", "Three days, the twelfth to the fourteenth of February."],
        ["W", "Three days. Where is it held?"],
        ["M", "At the guest house on the far side of the lake."],
        ["W", "That's quiet enough. What happens there?"],
        ["M", "Morning workshops, afternoons free to write, readings in the evening."],
        ["W", "The evenings sound useful. Who runs the workshops?"],
        ["M", "Two published writers and a magazine editor."],
        ["W", "And the cost?"],
        ["M", "Eighty thousand won, with meals and the room included."],
        ["W", "Then let's apply before the list closes."],
      ],
      choices: ["운영 기간", "장소", "진행 방식", "선발 기준", "진행자"],
      answer: 4,
      clue: "선발 기준은 대화에서 언급되지 않았다.",
      explanation:
        "기간(2월 12일부터 14일까지), 장소(호수 건너편 게스트하우스), 진행 방식(오전 워크숍·오후 집필·저녁 낭독), 진행자(작가 두 명과 잡지 편집자)는 언급되지만 선발 기준은 언급되지 않았다. 따라서 답은 ④이다.",
      translation: [
        "M: 채은아, 레이크뷰 글쓰기 모임 봤어?",
        "W: 안내문 봤어. 언제 해?",
        "M: 사흘, 2월 12일부터 14일까지.",
        "W: 사흘이구나. 어디서 해?",
        "M: 호수 건너편 게스트하우스에서.",
        "W: 조용하겠다. 거기서 뭐 해?",
        "M: 오전엔 워크숍, 오후엔 자유롭게 쓰고, 저녁엔 낭독.",
        "W: 저녁 순서가 도움 되겠다. 워크숍은 누가 이끌어?",
        "M: 등단한 작가 두 분이랑 잡지 편집자 한 분.",
        "W: 비용은?",
        "M: 8만 원. 식사랑 방 포함이야.",
        "W: 그럼 명단 차기 전에 지원하자.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Redwood Reading Room에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "W",
          "Let me tell you about the Redwood Reading Room. " +
            "It occupies the top floor of the old town hall and opened to the public in 2012. " +
            "The room is open from ten until eight on weekdays and closed on weekends. " +
            "There are ninety seats, and about half of them are beside a window. " +
            "Anyone may use the room, but a library card is needed to borrow a book. " +
            "Drinks in closed bottles are allowed, though food is not. " +
            "The lift reaches the top floor, so the room is accessible to everyone.",
        ],
      ],
      choices: [
        "옛 시청 꼭대기 층에 있다",
        "음식을 가져와 먹을 수 있다",
        "주말에는 문을 닫는다",
        "좌석이 아흔 개이다",
        "책을 빌리려면 회원증이 필요하다",
      ],
      answer: 2,
      clue: "Drinks in closed bottles are allowed, though food is not.",
      explanation:
        "뚜껑 닫은 음료는 되지만 음식은 안 된다고 했으므로 ②는 내용과 다르다. 따라서 답은 ②이다.",
      translation: [
        "W: 레드우드 열람실을 소개해 드리겠습니다. 옛 시청 꼭대기 층에 있고 2012년에 일반에 개방했습니다. 평일에는 10시부터 8시까지 열고 주말에는 닫습니다. 좌석은 아흔 개이고 그중 절반쯤이 창가에 있습니다. 누구나 이용할 수 있지만 책을 빌리려면 회원증이 필요합니다. 뚜껑을 닫은 음료는 가져올 수 있지만 음식은 안 됩니다. 승강기가 꼭대기 층까지 닿아서 누구나 올라올 수 있습니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 신청할 온라인 첨삭을 고르시오.",
      lines: [
        ["M", "Chaeun, let's sign up for one online essay service."],
        ["W", "Five listed. How fast do we need the feedback back?"],
        ["M", "Within three days. The deadline is the end of the month."],
        ["W", "Agreed. Should a real person read it, or is a report enough?"],
        ["M", "A person. The automatic reports say the same thing every time."],
        ["W", "Right. And the fee? I have fifty thousand won."],
        ["M", "Same here, so fifty thousand is the ceiling."],
        ["W", "Then only one service clears all three."],
        ["M", "Let's register tonight so we can send the first draft tomorrow."],
        ["W", "I'll set up the account after dinner."],
        ["M", "I'll transfer my half in the morning."],
        ["W", "Then we're set."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 5,
      clue: "Within three days. The deadline is the end of the month.",
      explanation:
        "사흘 안에 답이 오고, 사람이 읽어 주며, 5만 원 이하인 것을 고른다. 세 조건을 모두 채우는 것은 ⑤이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Turnaround: 7 days / Reader: Person / Fee: 30,000 won" },
          { no: 2, label: "②", value: "Turnaround: 1 day / Reader: Automatic / Fee: 20,000 won" },
          { no: 3, label: "③", value: "Turnaround: 2 days / Reader: Person / Fee: 80,000 won" },
          { no: 4, label: "④", value: "Turnaround: 5 days / Reader: Automatic / Fee: 15,000 won" },
          { no: 5, label: "⑤", value: "Turnaround: 3 days / Reader: Person / Fee: 45,000 won" },
        ],
      },
      translation: [
        "M: 채은아, 온라인 첨삭 하나 신청하자.",
        "W: 다섯 개 있네. 답이 얼마나 빨리 와야 해?",
        "M: 사흘 안에. 마감이 이달 말이야.",
        "W: 동의해. 사람이 읽어 줘야 할까, 보고서면 될까?",
        "M: 사람. 자동 보고서는 매번 같은 말만 해.",
        "W: 맞아. 비용은? 나는 5만 원 있어.",
        "M: 나도. 그럼 5만 원이 한계네.",
        "W: 그럼 세 조건 다 넘는 건 하나뿐이야.",
        "M: 내일 초고를 보낼 수 있게 오늘 밤에 등록하자.",
        "W: 저녁 먹고 계정 만들게.",
        "M: 내 몫은 아침에 보낼게.",
        "W: 그럼 됐다.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["W", "Junhee, is the self-study room open on the holiday?"],
        ["M", "It is, but you have to register the day before."],
        ["W", "I didn't know that. Where do I register?"],
        ["M", "On the school app, under room booking. It takes a minute."],
      ],
      choices: [
        "The room is closed on holidays.",
        "I don't use the self-study room.",
        "I'll register on the app tonight.",
        "There is no school app.",
        "I'll just turn up on the day.",
      ],
      answer: 3,
      clue: "On the school app, under room booking. It takes a minute.",
      explanation:
        "남자가 학교 앱의 공간 예약에서 하라고 알려 주었으므로, 오늘 밤 앱에서 신청하겠다는 ③이 가장 자연스럽다.",
      translation: [
        "W: 준희야, 공휴일에 자습실 열어?",
        "M: 열어. 그런데 전날 신청해야 해.",
        "W: 몰랐어. 어디서 신청해?",
        "M: 학교 앱, 공간 예약에서. 1분이면 돼.",
        "W: 오늘 밤에 앱에서 신청할게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["M", "Chaeun, my transcript came out with one grade missing."],
        ["W", "Which subject?"],
        ["M", "The elective from last spring. Everything else is there."],
        ["W", "Electives are entered separately. Ask the subject teacher to submit it."],
      ],
      choices: [
        "I'll ask the subject teacher.",
        "My transcript is complete.",
        "I never took an elective.",
        "The grade was already entered.",
        "I'll request a new transcript.",
      ],
      answer: 1,
      clue: "Electives are entered separately. Ask the subject teacher to submit it.",
      explanation:
        "여자가 선택 과목 선생님께 입력을 부탁하라고 했으므로, 그렇게 하겠다는 ①이 가장 자연스럽다.",
      translation: [
        "M: 채은아, 내 성적증명서에 성적 하나가 빠져 있어.",
        "W: 어느 과목?",
        "M: 지난봄 선택 과목. 나머지는 다 있어.",
        "W: 선택 과목은 따로 입력해. 과목 선생님께 넣어 달라고 해.",
        "M: 과목 선생님께 여쭤볼게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Chaeun, you've been putting off the personal statement since September."],
        ["W", "I want to start it when I have a clear idea."],
        ["M", "How many clear ideas have arrived since September?"],
        ["W", "None, if I'm honest."],
        ["M", "They don't arrive before the writing. They arrive during it."],
        ["W", "So I've been waiting for something that comes later."],
        ["M", "Which is why the waiting can go on for months."],
        ["W", "But a bad first page feels worse than no page."],
        ["M", "Only to you, and only for an hour."],
        ["W", "Then what should tonight look like?"],
        ["M", "Write four hundred words you don't like and keep them."],
      ],
      choices: [
        "I'll wait until the idea is clear.",
        "I already finished the statement.",
        "I never put anything off.",
        "I'll write four hundred words tonight.",
        "I'd rather not apply at all.",
      ],
      answer: 4,
      clue: "Write four hundred words you don't like and keep them.",
      explanation:
        "남자가 마음에 안 들어도 400단어를 써서 남기라고 했으므로, 오늘 밤 그렇게 하겠다는 ④가 가장 자연스럽다.",
      translation: [
        "M: 채은아, 9월부터 자기소개서를 미루고 있네.",
        "W: 생각이 분명해지면 시작하려고.",
        "M: 9월 이후로 분명한 생각이 몇 번이나 왔어?",
        "W: 솔직히 한 번도 안 왔어.",
        "M: 그건 쓰기 전에 오지 않아. 쓰는 동안에 와.",
        "W: 그럼 나는 나중에 올 것을 기다려 온 거네.",
        "M: 그래서 그 기다림이 몇 달씩 이어질 수 있는 거야.",
        "W: 그런데 못 쓴 첫 쪽은 아무 쪽도 없는 것보다 싫어.",
        "M: 너한테만, 그리고 한 시간 동안만.",
        "W: 그럼 오늘 밤은 어때야 해?",
        "M: 마음에 안 드는 400단어를 쓰고 그걸 남겨 둬.",
        "W: 오늘 밤에 400단어 쓸게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Junhee, you've been sleeping with the light on again."],
        ["M", "I fall asleep reading and never reach the switch."],
        ["W", "How do the mornings feel?"],
        ["M", "Heavy. I wake up several times without knowing why."],
        ["W", "Light at night keeps pulling you out of deep sleep."],
        ["M", "Even with my eyes closed?"],
        ["W", "Even then. Your skin and eyelids still register it."],
        ["M", "I always thought closed eyes were enough."],
        ["W", "They aren't, and the cost lands on the next day."],
        ["M", "So what would fix it without me having to get up?"],
        ["W", "Put the lamp on a timer that switches off at eleven."],
      ],
      choices: [
        "I'll keep reading with the light on.",
        "I'll set a timer for eleven.",
        "My mornings are already fine.",
        "I never read before bed.",
        "I'll sleep with my eyes open.",
      ],
      answer: 2,
      clue: "Put the lamp on a timer that switches off at eleven.",
      explanation:
        "여자가 11시에 꺼지는 타이머에 스탠드를 연결하라고 했으므로, 타이머를 맞추겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 준희야, 너 또 불 켜 놓고 자더라.",
        "M: 책 읽다가 잠들어서 스위치까지 못 가.",
        "W: 아침은 어때?",
        "M: 무거워. 이유도 모르고 몇 번씩 깨.",
        "W: 밤의 빛이 깊은 잠에서 자꾸 끌어내는 거야.",
        "M: 눈을 감고 있어도?",
        "W: 그래도. 피부랑 눈꺼풀이 여전히 감지해.",
        "M: 눈만 감으면 되는 줄 알았어.",
        "W: 아니야. 그 대가는 다음 날에 떨어져.",
        "M: 그럼 내가 일어나지 않고도 고칠 방법이 뭐야?",
        "W: 11시에 꺼지는 타이머에 스탠드를 꽂아.",
        "M: 11시로 타이머 맞출게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Hyerim이 Doyun에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Hyerim : ________________",
      lines: [
        [
          "W",
          "Hyerim and Doyun are organizing the school's donation drive, which closes on Friday. " +
            "Doyun has built a large collection box and placed it in the main corridor, " +
            "and the box is solid and nicely painted. " +
            "On Wednesday Hyerim notices that the opening in the top is only ten centimeters wide, " +
            "because he cut it for coins before the drive was changed to collect clothes. " +
            "Nothing larger than a scarf can go in, and students have started " +
            "leaving bags on the floor beside it. " +
            "Widening the opening would take ten minutes with the craft knife from the art room, " +
            "and the box itself would be unharmed. " +
            "She does not want the box replaced, since it took him a whole afternoon. " +
            "She wants to tell him to cut the opening wider before Friday. " +
            "In this situation, what would Hyerim most likely say to Doyun?",
        ],
      ],
      choices: [
        "We should build a second box tonight.",
        "Let's collect coins instead of clothes.",
        "We should move the box to another corridor.",
        "Let's end the donation drive early.",
        "Let's cut the opening wider before Friday.",
      ],
      answer: 5,
      clue: "She wants to tell him to cut the opening wider before Friday.",
      explanation:
        "혜림이는 금요일 전에 투입구를 더 넓게 자르자고 말하려 하므로 ⑤가 가장 적절하다.",
      translation: [
        "W: 혜림이와 도윤이는 금요일에 끝나는 학교 기부 행사를 맡고 있습니다. 도윤이는 큰 수거함을 만들어 중앙 복도에 두었고, 상자는 튼튼하고 칠도 곱게 되어 있습니다. 수요일에 혜림이는 윗면의 투입구가 10센티미터밖에 안 된다는 것을 알아챕니다. 행사가 옷을 모으는 것으로 바뀌기 전에 동전용으로 잘랐기 때문입니다. 목도리보다 큰 것은 들어가지 않고, 학생들은 그 옆 바닥에 봉투를 놓고 가기 시작했습니다. 미술실 조각칼이면 투입구를 넓히는 데 10분이면 되고, 상자 자체는 상하지 않습니다. 혜림이는 도윤이가 오후를 꼬박 들인 상자를 바꾸기를 바라지 않습니다. 혜림이는 금요일 전에 투입구를 더 넓게 자르자고 말하고 싶습니다. 이런 상황에서 혜림이가 도윤이에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 남자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Hello, everyone. Today I want to talk about why a whisper carries " +
            "so much further along a curved wall than across an open room. " +
            "Sound spreads outward in all directions from its source, " +
            "and in an open space it thins out quickly as it spreads. " +
            "A smooth curved wall does something different. " +
            "Each reflection sends the sound along the curve rather than outward, " +
            "so it keeps most of its energy instead of losing it to the room. " +
            "In a circular gallery, a whisper at one wall arrives at the far side " +
            "louder than a shout across the middle. " +
            "The wall is not amplifying anything. " +
            "It is simply refusing to let the sound spread.",
        ],
      ],
      choices: [
        "why shouting is louder than whispering",
        "how galleries are designed for paintings",
        "how a curved wall carries a whisper without amplifying it",
        "why sound travels faster in water",
        "how echoes are removed from a recording",
      ],
      answer: 3,
      clue: "It is simply refusing to let the sound spread.",
      explanation:
        "남자는 굽은 벽이 소리를 곡선을 따라 되돌려 퍼지지 못하게 하기 때문에 속삭임이 멀리 간다고 설명한다. 따라서 답은 ③이다.",
      translation: [
        "M: 안녕하세요, 여러분. 오늘은 속삭임이 왜 트인 방을 가로지를 때보다 굽은 벽을 따라 훨씬 멀리 가는지 이야기하려 합니다. 소리는 나는 곳에서 사방으로 퍼져 나가고, 트인 공간에서는 퍼지면서 금방 옅어집니다. 매끄럽게 굽은 벽은 다른 일을 합니다. 반사될 때마다 소리를 바깥쪽이 아니라 곡선을 따라 보내서, 소리가 방에 에너지를 빼앗기지 않고 대부분을 지닙니다. 둥근 회랑에서는 한쪽 벽에서 낸 속삭임이 한가운데를 가로지르는 외침보다 크게 반대편에 닿습니다. 그 벽은 아무것도 키우고 있지 않습니다. 그저 소리가 퍼지지 못하게 막고 있을 뿐입니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 내용이 아닌 것은?",
      lines: [
        ["M", "Hello, everyone. Today I want to talk about why a whisper carries so much further along a curved wall than across an open room."],
        ["M", "Sound spreads outward in all directions from its source, and in an open space it thins out quickly as it spreads."],
        ["M", "Each reflection sends the sound along the curve rather than outward."],
        ["M", "so it keeps most of its energy instead of losing it to the room."],
        ["M", "In a circular gallery, a whisper at one wall arrives at the far side louder than a shout across the middle."],
        ["M", "The wall is not amplifying anything."],
      ],
      choices: [
        "thick curtains absorbing an echo",
        "sound thinning out as it spreads",
        "reflections sending sound along the curve",
        "the sound keeping most of its energy",
        "a whisper beating a shout across the middle",
      ],
      answer: 1,
      clue: "Sound spreads outward in all directions from its source, and in an open space it thins out quickly as it spreads.",
      explanation:
        "소리가 퍼지며 옅어진다는 것, 반사가 소리를 곡선을 따라 보낸다는 것, 에너지를 대부분 지닌다는 것, 속삭임이 외침보다 크게 닿는다는 것은 언급되지만 두꺼운 커튼이 울림을 빨아들인다는 것은 언급되지 않았다. 따라서 답은 ①이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
