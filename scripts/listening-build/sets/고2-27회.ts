/** 고2 듣기 27회 — 사람이 직접 쓴 회차 (2026-09-25) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고2 27회",
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
          "Good evening, residents of Cedar Court. This is Eunji Noh from the residents' committee. " +
            "I want to talk about the parcel room on the ground floor. " +
            "It was built for about thirty parcels, and last week it held over two hundred. " +
            "Most of them had been there for more than ten days. " +
            "When the room is full, the courier leaves parcels in the lobby, " +
            "and three went missing last month. " +
            "So from the first of next month, " +
            "parcels left for more than five days will be moved to the basement store. " +
            "Nothing will be thrown away, but you will have to ask the guard to open it. " +
            "Please collect your parcels within five days. Thank you.",
        ],
      ],
      choices: [
        "택배를 닷새 안에 찾아가라고 당부하려고",
        "택배함 위치 변경을 알리려고",
        "택배 분실 사고를 사과하려고",
        "경비실 근무 시간을 알리려고",
        "지하 창고 공사를 안내하려고",
      ],
      answer: 1,
      clue: "Please collect your parcels within five days.",
      explanation:
        "여자는 택배실이 넘쳐 분실이 생긴다며 닷새 안에 택배를 찾아가 달라고 당부한다. 따라서 답은 ①이다.",
      translation: [
        "W: 시더코트 주민 여러분, 안녕하세요. 주민 위원회 노은지입니다. 1층 택배실에 대해 말씀드리려 합니다. 택배 서른 개쯤을 두려고 만든 곳인데, 지난주에는 이백 개가 넘게 쌓여 있었습니다. 대부분 열흘이 넘도록 놓여 있던 것들입니다. 택배실이 차면 기사님이 로비에 두고 가시고, 지난달에는 세 개가 없어졌습니다. 그래서 다음 달 1일부터 닷새가 넘게 놓여 있는 택배는 지하 창고로 옮기겠습니다. 버리지는 않지만, 경비원께 문을 열어 달라고 하셔야 합니다. 택배는 닷새 안에 찾아가 주시기 바랍니다. 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 남자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Jaehyun, I've been writing my English essays in Korean first."],
        ["M", "All of it? Then translating the whole thing?"],
        ["W", "Yes. That way the ideas come out properly."],
        ["M", "How does the English version read when you're done?"],
        ["W", "Stiff, honestly. My teacher keeps circling the same phrases."],
        ["M", "Because those phrases are Korean sentences wearing English words."],
        ["W", "But if I write in English the ideas get simpler."],
        ["M", "Simpler than your Korean, yes. Not simpler than you need."],
        ["W", "So I'd be losing something either way."],
        ["M", "You'd be losing complexity you can't yet carry. That's a fair trade."],
        ["W", "So write directly, even if it sounds plainer."],
        ["M", "Write directly. Plain English beats translated Korean every time."],
      ],
      choices: [
        "번역 연습을 많이 해야 한다",
        "글은 단순하게 써야 한다",
        "어휘를 많이 외워야 한다",
        "첨삭을 자주 받아야 한다",
        "영어 글은 영어로 바로 써야 한다",
      ],
      answer: 5,
      clue: "Write directly. Plain English beats translated Korean every time.",
      explanation:
        "남자는 번역한 문장은 영어 옷을 입은 한국어 문장이라며, 더 단순해 보여도 영어로 바로 쓰라고 말한다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 재현아, 나 영어 글을 한국어로 먼저 쓰고 있어.",
        "M: 전부? 그러고 나서 통째로 옮기는 거야?",
        "W: 응. 그래야 생각이 제대로 나와.",
        "M: 다 옮기고 나면 영어 글은 어떻게 읽혀?",
        "W: 솔직히 뻣뻣해. 선생님이 같은 표현에 자꾸 동그라미를 치셔.",
        "M: 그 표현들이 영어 낱말을 입은 한국어 문장이라서 그래.",
        "W: 그런데 영어로 쓰면 생각이 단순해져.",
        "M: 네 한국어보다 단순해지는 거지. 필요한 것보다 단순해지는 건 아니야.",
        "W: 그럼 어느 쪽이든 뭔가를 잃는 거네.",
        "M: 아직 감당 못 하는 복잡함을 잃는 거야. 괜찮은 거래지.",
        "W: 그럼 밋밋하게 들려도 바로 쓰라는 거구나.",
        "M: 바로 써. 밋밋한 영어가 번역된 한국어보다 언제나 나아.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "Almost every guide to studying tells you to find your learning style. " +
            "Visual, auditory, kinesthetic. Pick one and match your materials to it. " +
            "It is a comfortable idea, and it has been tested many times. " +
            "When researchers teach the same content in a student's preferred style " +
            "and in a different one, the test scores come out the same. " +
            "What does change the scores is whether the material matched the subject. " +
            "Anatomy is learned better with pictures by everyone, " +
            "and poetry is learned better aloud by everyone, " +
            "regardless of which style they chose on a questionnaire. " +
            "So the useful question is not what kind of learner am I. " +
            "It is what shape is this thing I am trying to learn.",
        ],
      ],
      choices: [
        "자신의 학습 유형을 찾아야 한다",
        "그림을 활용하면 기억이 잘된다",
        "소리 내어 읽는 것이 좋다",
        "학습 방법은 학습자 유형이 아니라 내용에 맞춰야 한다",
        "설문으로 학습 성향을 알 수 있다",
      ],
      answer: 4,
      clue: "It is what shape is this thing I am trying to learn.",
      explanation:
        "여자는 학습 유형에 맞추는 것은 점수를 바꾸지 못한다며, 배우려는 내용의 성격에 맞추라고 말한다. 따라서 답은 ④이다.",
      translation: [
        "W: 공부법을 다루는 거의 모든 안내는 자기 학습 유형을 찾으라고 말합니다. 시각형, 청각형, 운동형. 하나를 고르고 자료를 거기에 맞추라고요. 편안한 생각이고, 여러 번 검증되기도 했습니다. 연구자들이 같은 내용을 학생이 선호하는 방식과 다른 방식으로 가르쳐 보면 시험 점수는 똑같이 나옵니다. 점수를 실제로 바꾸는 것은 자료가 그 과목에 맞았느냐입니다. 해부학은 누구에게나 그림으로 배우는 편이 낫고, 시는 누구에게나 소리 내어 배우는 편이 낫습니다. 설문에서 어떤 유형을 골랐든 상관없이요. 그러니 쓸모 있는 질문은 나는 어떤 유형의 학습자인가가 아닙니다. 내가 배우려는 이것은 어떤 모양인가입니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["M", "Eunji, is this the corner you set up for the pottery club?"],
        ["W", "Yes, we finished it at the end of last term."],
        ["M", "There's a potter's wheel at the left end of the bench."],
        ["W", "It's the only one that still spins smoothly."],
        ["M", "And a shelf of finished bowls runs along the wall."],
        ["W", "Those are waiting for the next firing."],
        ["M", "I count three buckets under the bench."],
        ["W", "There are four. One is behind the wheel."],
        ["M", "The apron hanging on the hook looks well used."],
        ["W", "That one has been through six terms."],
        ["M", "And a round wall clock hangs beside the door."],
        ["W", "The firing has to be timed to the minute."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "There are four. One is behind the wheel.",
      explanation:
        "남자가 양동이가 세 개라고 하자 여자가 네 개라고 바로잡는다. 그림에는 세 개가 그려져 있으므로 답은 ③이다.",
      figure: {
        kind: "scene",
        scene:
          "A pottery club corner drawn as one wide picture, clean black line art on white, no writing or letters or numbers anywhere. " +
          "A POTTER'S WHEEL stands at the left end of a long workbench. " +
          "A SHELF holding finished bowls runs along the wall above the bench. " +
          "EXACTLY THREE BUCKETS stand on the floor under the bench, spaced well apart so all three are easy to count and none overlap. " +
          "An APRON hangs on a hook on the wall. " +
          "A ROUND WALL CLOCK hangs on the wall beside a closed door.",
      },
      translation: [
        "M: 은지야, 이게 도예 동아리로 꾸민 구석이야?",
        "W: 응, 지난 학기 끝에 다 만들었어.",
        "M: 작업대 왼쪽 끝에 물레가 있네.",
        "W: 아직 부드럽게 도는 건 그것뿐이야.",
        "M: 그리고 벽을 따라 완성된 그릇 선반이 있어.",
        "W: 다음 가마 구이를 기다리는 것들이야.",
        "M: 작업대 밑에 양동이가 세 개 보여.",
        "W: 네 개야. 하나는 물레 뒤에 있어.",
        "M: 고리에 걸린 앞치마는 많이 쓴 것 같네.",
        "W: 그건 여섯 학기를 났어.",
        "M: 그리고 문 옆에 둥근 벽시계가 걸려 있어.",
        "W: 가마 구이는 분 단위로 재야 하거든.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 남자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Jaehyun, the class play opens at seven tonight."],
        ["M", "I know. Are the costumes all in the dressing room?"],
        ["W", "Every one of them, hung by scene."],
        ["M", "Good. And the props table backstage?"],
        ["W", "Laid out and labeled. I checked it against the list twice."],
        ["M", "Then what's still open?"],
        ["W", "The programs are still at the print shop."],
        ["M", "They were supposed to deliver them this morning."],
        ["W", "They called to say the van broke down. Someone has to collect them."],
        ["M", "How far is the shop?"],
        ["W", "Fifteen minutes each way. But I have to run the sound check at six."],
        ["M", "Then I'll go and collect the programs."],
      ],
      choices: [
        "의상 정리하기",
        "소품 확인하기",
        "안내지 받아 오기",
        "음향 점검하기",
        "무대 조명 맞추기",
      ],
      answer: 3,
      clue: "Then I'll go and collect the programs.",
      explanation:
        "의상과 소품은 끝났고 여자는 음향 점검을 해야 하므로, 남자가 인쇄소에서 안내지를 받아 오기로 한다. 따라서 답은 ③이다.",
      translation: [
        "W: 재현아, 학급 연극이 오늘 저녁 7시에 열려.",
        "M: 알아. 의상은 다 분장실에 있어?",
        "W: 전부, 장면별로 걸어 뒀어.",
        "M: 좋아. 무대 뒤 소품 탁자는?",
        "W: 늘어놓고 이름표까지 붙였어. 목록이랑 두 번 대조했어.",
        "M: 그럼 아직 남은 게 뭐야?",
        "W: 안내지가 아직 인쇄소에 있어.",
        "M: 오늘 아침에 갖다주기로 했잖아.",
        "W: 차가 고장 났다고 전화 왔어. 누가 가서 받아 와야 해.",
        "M: 인쇄소가 얼마나 멀어?",
        "W: 편도 15분. 그런데 나는 6시에 음향 점검을 해야 해.",
        "M: 그럼 내가 가서 안내지 받아 올게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 여자가 지불할 금액을 고르시오.",
      lines: [
        ["M", "Welcome to Willow Stationery. What can I get you today?"],
        ["W", "Ten notebooks and four boxes of pens, please."],
        ["M", "Notebooks are four dollars each and a box of pens is nine."],
        ["W", "So forty dollars plus thirty-six."],
        ["M", "Seventy-six in total. Would you like the file folders as well?"],
        ["W", "How much are the folders?"],
        ["M", "Two dollars each, and you'd want ten of them."],
        ["W", "We'll leave the folders. We still have last year's."],
        ["M", "No problem. Are you buying for a school club?"],
        ["W", "Yes, here's the club card."],
        ["M", "Then I can take twenty-five percent off the notebooks, but not the pens."],
        ["W", "Thank you. I'll pay in cash."],
      ],
      choices: ["$57.00", "$66.00", "$70.00", "$76.00", "$96.00"],
      answer: 2,
      clue: "Then I can take twenty-five percent off the notebooks, but not the pens.",
      explanation:
        "공책 10권 40달러에서 25퍼센트를 빼면 30달러이고, 할인이 안 되는 펜 4상자 36달러를 더하면 66달러이다. 따라서 답은 ②이다.",
      translation: [
        "M: 윌로 문구점입니다. 오늘은 무엇을 드릴까요?",
        "W: 공책 열 권이랑 펜 네 상자 주세요.",
        "M: 공책은 한 권에 4달러, 펜 한 상자는 9달러입니다.",
        "W: 그럼 40달러에 36달러네요.",
        "M: 모두 76달러입니다. 서류철도 하시겠어요?",
        "W: 서류철은 얼마예요?",
        "M: 하나에 2달러인데, 열 개는 필요하실 거예요.",
        "W: 서류철은 뺄게요. 작년 것이 아직 있어요.",
        "M: 괜찮습니다. 학교 동아리에서 쓰시는 건가요?",
        "W: 네, 여기 동아리 카드요.",
        "M: 그럼 공책값에서 25퍼센트를 빼 드립니다. 펜은 안 돼요.",
        "W: 감사합니다. 현금으로 낼게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 남자가 독서 동아리를 그만두는 이유를 고르시오.",
      lines: [
        ["W", "Jaehyun, you're leaving the reading club?"],
        ["M", "At the end of this month, yes."],
        ["W", "Did you fall behind on the books?"],
        ["M", "No, I finished the last three ahead of everyone."],
        ["W", "Then is it the members? There was that argument in October."],
        ["M", "That was settled the same week. It's the meeting day."],
        ["W", "Wednesday, isn't it?"],
        ["M", "They moved it to Friday evening last month."],
        ["W", "And Friday evening is when you volunteer."],
        ["M", "Every Friday since March. I can't give that up now."],
      ],
      choices: [
        "책을 못 따라가서",
        "회원들과 다퉈서",
        "모임 요일이 봉사와 겹쳐서",
        "회비가 부담스러워서",
        "다른 동아리로 옮겨서",
      ],
      answer: 3,
      clue: "They moved it to Friday evening last month.",
      explanation:
        "책도 앞서 읽었고 다툼도 정리되었지만, 모임이 금요일 저녁으로 옮겨져 봉사와 겹치기 때문이다. 따라서 답은 ③이다.",
      translation: [
        "W: 재현아, 독서 동아리 그만둬?",
        "M: 이달 말에, 응.",
        "W: 책 진도를 못 따라갔어?",
        "M: 아니, 최근 세 권은 누구보다 먼저 끝냈어.",
        "W: 그럼 회원들 때문이야? 10월에 그 다툼 있었잖아.",
        "M: 그건 그 주에 정리됐어. 모임 요일 때문이야.",
        "W: 수요일 아니야?",
        "M: 지난달에 금요일 저녁으로 옮겼어.",
        "W: 금요일 저녁은 네가 봉사하는 날이잖아.",
        "M: 3월부터 매주 금요일. 이제 와서 그만둘 수는 없어.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, Glasshouse Plant Fair에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["W", "Jaehyun, have you heard about the Glasshouse Plant Fair?"],
        ["M", "I saw the poster at the station. When is it?"],
        ["W", "Two days, the eighteenth and nineteenth of May."],
        ["M", "A weekend, then. Where is it held?"],
        ["W", "In the old glasshouse in the botanical garden."],
        ["M", "I've never been inside that one. What's there?"],
        ["W", "Around forty growers selling seedlings, plus a seed exchange table."],
        ["M", "A seed exchange sounds interesting. Do you bring your own?"],
        ["W", "You bring seeds and take the same number home."],
        ["M", "Is there an entry fee?"],
        ["W", "Five thousand won, and it includes the garden itself."],
        ["M", "Then let's go on the Saturday."],
      ],
      choices: ["열리는 날", "열리는 장소", "행사 내용", "입장료", "주차 안내"],
      answer: 5,
      clue: "주차 안내는 대화에서 언급되지 않았다.",
      explanation:
        "날짜(5월 18·19일), 장소(식물원 옛 온실), 행사 내용(묘목 판매와 씨앗 교환), 입장료(5천 원)는 언급되지만 주차 안내는 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 재현아, 글라스하우스 식물 장터 들어 봤어?",
        "M: 역에서 포스터 봤어. 언제야?",
        "W: 이틀 동안, 5월 18일이랑 19일.",
        "M: 주말이구나. 어디서 열려?",
        "W: 식물원 안 옛 온실에서.",
        "M: 그 안엔 들어가 본 적이 없어. 뭐가 있는데?",
        "W: 묘목 파는 재배자가 마흔 명쯤, 그리고 씨앗 교환대도 있어.",
        "M: 씨앗 교환 재밌겠다. 직접 가져가는 거야?",
        "W: 씨앗을 가져가면 같은 수만큼 가져올 수 있어.",
        "M: 입장료는 있어?",
        "W: 5천 원. 식물원 입장도 포함이야.",
        "M: 그럼 토요일에 가자.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Crestview Ice Rink에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "M",
          "Let me tell you about the Crestview Ice Rink. " +
            "It has operated since 1999 and is the only indoor rink in this district. " +
            "Public sessions run every afternoon from two until six, seven days a week. " +
            "Skate rental costs four thousand won and is available in all adult and child sizes. " +
            "Helmets are free to borrow, and everyone under thirteen must wear one. " +
            "The rink is resurfaced on the hour, which takes about twelve minutes. " +
            "Food is not allowed on the ice or in the seating area beside it.",
        ],
      ],
      choices: [
        "1999년부터 운영해 왔다",
        "매일 오후 2시부터 6시까지 연다",
        "스케이트를 빌릴 수 있다",
        "헬멧은 돈을 내고 빌린다",
        "한 시간마다 빙판을 정비한다",
      ],
      answer: 4,
      clue: "Helmets are free to borrow, and everyone under thirteen must wear one.",
      explanation:
        "헬멧은 무료로 빌려준다고 했으므로 돈을 내고 빌린다는 ④는 내용과 다르다. 따라서 답은 ④이다.",
      translation: [
        "M: 크레스트뷰 빙상장을 소개해 드리겠습니다. 1999년부터 운영해 왔고 이 구에서 유일한 실내 빙상장입니다. 일반 이용은 일주일 내내 매일 오후 2시부터 6시까지입니다. 스케이트 대여는 4천 원이고 어른과 아이 크기가 모두 있습니다. 헬멧은 무료로 빌려주며, 열세 살 미만은 반드시 써야 합니다. 빙판은 매시 정각에 정비하는데 12분쯤 걸립니다. 빙판 위와 그 옆 관람석에서는 음식을 드실 수 없습니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 예약할 합주실을 고르시오.",
      lines: [
        ["W", "Jaehyun, let's book a practice room for the band."],
        ["M", "Five listed. How many of us play?"],
        ["W", "Five, with the drum kit. So we need space for five."],
        ["M", "Then the small ones are out. Do we need a kit provided?"],
        ["W", "Yes. Carrying ours across town twice a week is impossible."],
        ["M", "Agreed. And the rate? We put in sixty thousand won."],
        ["W", "So twenty thousand an hour at most, for three hours."],
        ["M", "Then only one room clears all three."],
        ["W", "Let's book Saturday before someone else does."],
        ["M", "I'll reserve it on the studio's page tonight."],
        ["W", "Send me the confirmation for the club record."],
        ["M", "Will do. I'll also ask about the loading door."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "Five, with the drum kit. So we need space for five.",
      explanation:
        "다섯 명이 쓸 수 있고, 드럼이 갖춰져 있으며, 시간당 2만 원 이하인 방을 고른다. 세 조건을 모두 채우는 것은 ④이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Capacity: 3 / Drum kit: Yes / Rate: 12,000 won per hour" },
          { no: 2, label: "②", value: "Capacity: 6 / Drum kit: No / Rate: 15,000 won per hour" },
          { no: 3, label: "③", value: "Capacity: 5 / Drum kit: Yes / Rate: 28,000 won per hour" },
          { no: 4, label: "④", value: "Capacity: 6 / Drum kit: Yes / Rate: 18,000 won per hour" },
          { no: 5, label: "⑤", value: "Capacity: 4 / Drum kit: No / Rate: 10,000 won per hour" },
        ],
      },
      translation: [
        "W: 재현아, 밴드 합주실 예약하자.",
        "M: 다섯 개 있네. 우리 몇 명이 연주해?",
        "W: 드럼까지 다섯 명. 그러니 다섯 자리가 필요해.",
        "M: 그럼 작은 건 빠지네. 드럼이 갖춰져 있어야 해?",
        "W: 응. 우리 걸 일주일에 두 번 시내를 가로질러 옮기는 건 무리야.",
        "M: 동의해. 값은? 6만 원 모았잖아.",
        "W: 세 시간 쓰려면 시간당 2만 원이 최대야.",
        "M: 그럼 세 조건 다 넘는 건 하나뿐이야.",
        "W: 누가 가져가기 전에 토요일로 예약하자.",
        "M: 오늘 밤에 합주실 누리집에서 예약할게.",
        "W: 동아리 기록용으로 확인서 보내 줘.",
        "M: 그럴게. 짐 들이는 문도 물어볼게.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["M", "Eunji, is the bus to the museum running on the holiday?"],
        ["W", "It is, but on the weekend timetable."],
        ["M", "So it comes every thirty minutes instead of fifteen?"],
        ["W", "Right. Leave home twenty minutes earlier than usual."],
      ],
      choices: [
        "There is no bus to the museum.",
        "I'll leave twenty minutes earlier.",
        "The museum is closed that day.",
        "It comes every five minutes.",
        "I'll take a taxi instead.",
      ],
      answer: 2,
      clue: "Right. Leave home twenty minutes earlier than usual.",
      explanation:
        "여자가 평소보다 20분 일찍 나서라고 했으므로, 20분 일찍 나가겠다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 은지야, 공휴일에 박물관 가는 버스 다녀?",
        "W: 다녀. 그런데 주말 시간표로.",
        "M: 그럼 15분마다가 아니라 30분마다 오는 거야?",
        "W: 맞아. 평소보다 20분 일찍 나서.",
        "M: 20분 일찍 나갈게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["W", "Jaehyun, the printer keeps saying my document is too large."],
        ["M", "How many pages are you sending at once?"],
        ["W", "About two hundred. It's the whole workbook."],
        ["M", "Split it into four files of fifty and send them one at a time."],
      ],
      choices: [
        "My document is only two pages.",
        "I'll split it into four files.",
        "The printer works perfectly.",
        "I'll print it at home instead.",
        "Two hundred is not many.",
      ],
      answer: 2,
      clue: "Split it into four files of fifty and send them one at a time.",
      explanation:
        "남자가 쉰 쪽씩 네 개로 나눠 보내라고 했으므로, 네 개로 나누겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 재현아, 인쇄기가 자꾸 내 문서가 너무 크대.",
        "M: 한 번에 몇 쪽을 보내는데?",
        "W: 이백 쪽쯤. 문제집 전체야.",
        "M: 쉰 쪽씩 네 개로 나눠서 하나씩 보내.",
        "W: 네 개로 나눌게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Jaehyun, you've been practising the same piece since September."],
        ["M", "I want it perfect before I move on."],
        ["W", "How many times through do you play it each evening?"],
        ["M", "Eight or nine, start to finish."],
        ["W", "And where do the mistakes happen?"],
        ["M", "The same two bars, every single time."],
        ["W", "So you play forty correct bars to reach the two that need work."],
        ["M", "Put that way, I'm mostly rehearsing what I can already do."],
        ["W", "And the two bars get eight tries instead of eighty."],
        ["M", "Then what should the evening look like?"],
        ["W", "Play those two bars alone for twenty minutes, then the whole piece once."],
      ],
      choices: [
        "I'll drill the two bars tonight.",
        "I'll play it through ten times.",
        "There are no mistakes left.",
        "I'll choose a different piece.",
        "The whole piece needs work.",
      ],
      answer: 1,
      clue: "Play those two bars alone for twenty minutes, then the whole piece once.",
      explanation:
        "여자가 틀리는 두 마디만 20분 연습하고 전체는 한 번만 치라고 했으므로, 오늘 밤 그 두 마디를 연습하겠다는 ①이 가장 자연스럽다.",
      translation: [
        "W: 재현아, 9월부터 같은 곡만 연습하고 있네.",
        "M: 넘어가기 전에 완벽하게 하고 싶어서.",
        "W: 저녁마다 처음부터 끝까지 몇 번 쳐?",
        "M: 여덟아홉 번.",
        "W: 틀리는 데는 어디야?",
        "M: 매번 똑같은 두 마디.",
        "W: 그럼 손봐야 할 두 마디에 닿으려고 맞는 마흔 마디를 치는 거네.",
        "M: 그렇게 말하니, 이미 할 수 있는 걸 주로 연습하고 있었네.",
        "W: 그리고 그 두 마디는 여든 번이 아니라 여덟 번만 해 보는 거지.",
        "M: 그럼 저녁이 어떤 모양이어야 해?",
        "W: 그 두 마디만 20분 치고, 그다음에 전체를 한 번 쳐.",
        "M: 오늘 밤엔 그 두 마디를 붙들고 할게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Eunji, you've turned down the class president nomination twice."],
        ["W", "I'd be terrible at it. I'm not a leader."],
        ["M", "You organised the whole festival booth last year."],
        ["W", "That's different. Nobody was watching me do it."],
        ["M", "Thirty people were watching. You just weren't standing at the front."],
        ["W", "Standing at the front is the part I can't do."],
        ["M", "How much of the job is standing at the front?"],
        ["W", "The assemblies, I suppose. Three or four a year."],
        ["M", "And the rest is the thing you already did well."],
        ["W", "So I've been refusing a year of work over four mornings."],
        ["M", "Let your name stand, and practise those four with me."],
      ],
      choices: [
        "I'll let my name stand this time.",
        "I'll refuse the nomination again.",
        "I've never organised anything.",
        "The assemblies are every week.",
        "I'd rather stand at the front.",
      ],
      answer: 1,
      clue: "Let your name stand, and practise those four with me.",
      explanation:
        "남자가 후보로 이름을 올리고 조회 네 번은 같이 연습하자고 했으므로, 이번에는 이름을 올리겠다는 ①이 가장 자연스럽다.",
      translation: [
        "M: 은지야, 너 반장 후보를 두 번이나 거절했더라.",
        "W: 내가 하면 엉망일 거야. 나는 이끄는 사람이 아니야.",
        "M: 작년에 축제 부스를 통째로 꾸렸잖아.",
        "W: 그건 달라. 아무도 나를 보고 있지 않았어.",
        "M: 서른 명이 보고 있었어. 네가 앞에 서 있지 않았을 뿐이지.",
        "W: 앞에 서는 게 내가 못 하는 부분이야.",
        "M: 그 일에서 앞에 서는 게 얼마나 돼?",
        "W: 조회겠지. 1년에 서너 번.",
        "M: 나머지는 네가 이미 잘한 그 일이고.",
        "W: 그럼 아침 네 번 때문에 1년 치 일을 거절해 온 거네.",
        "M: 이름을 올려. 그 네 번은 나랑 연습하자.",
        "W: 이번엔 이름 올릴게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Minjeong이 Yohan에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Minjeong : ________________",
      lines: [
        [
          "M",
          "Minjeong and Yohan are setting up the school's art exhibition, which opens on Monday. " +
            "Yohan has mounted forty student drawings on boards and the work is careful and straight. " +
            "On Saturday Minjeong walks the room and notices that he has hung them " +
            "in the order the names appear on the class list, " +
            "so the small pencil studies sit beside the large paintings " +
            "and several of the pencil ones disappear next to their neighbours. " +
            "Grouping them by size would take an hour and nothing would have to be remounted, " +
            "since the hooks are already spaced along the rails. " +
            "She knows he ordered them by list to be fair to everyone, which was well meant. " +
            "She wants to tell him to regroup the drawings by size instead. " +
            "In this situation, what would Minjeong most likely say to Yohan?",
        ],
      ],
      choices: [
        "We should take down the pencil drawings.",
        "Let's add more drawings to the wall.",
        "Let's regroup the drawings by size.",
        "We should open the exhibition on Tuesday.",
        "Let's hang them in alphabetical order.",
      ],
      answer: 3,
      clue: "She wants to tell him to regroup the drawings by size instead.",
      explanation:
        "민정이는 그림을 크기별로 다시 묶자고 말하려 하므로 ③이 가장 적절하다.",
      translation: [
        "M: 민정이와 요한이는 월요일에 여는 학교 미술 전시를 준비하고 있습니다. 요한이는 학생 그림 마흔 점을 판에 붙였고, 작업은 꼼꼼하고 반듯합니다. 토요일에 민정이는 전시장을 한 바퀴 돌다가, 요한이가 학급 명렬표에 이름이 나오는 순서대로 그림을 걸었다는 것을 알아챕니다. 그래서 작은 연필 습작이 큰 그림 옆에 놓이고, 몇몇 연필 그림은 옆 그림에 묻혀 보이지 않습니다. 크기별로 다시 묶는 데는 한 시간이면 되고, 걸이가 이미 레일을 따라 간격대로 있어서 다시 붙일 필요도 없습니다. 민정이는 요한이가 모두에게 공평하려고 명렬표 순서로 걸었다는 것을 알고, 그 뜻이 좋았다는 것도 압니다. 민정이는 그림을 크기별로 다시 묶자고 말하고 싶습니다. 이런 상황에서 민정이가 요한이에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 남자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Hello, everyone. Today I want to talk about why a photograph taken indoors " +
            "sometimes comes out orange. " +
            "Light from a bulb is not the same color as daylight. " +
            "It is much warmer, closer to the color of a candle than of the sky. " +
            "Your eye adjusts to this within seconds and you simply see white paper as white, " +
            "wherever you are standing. " +
            "A camera has no such habit. It records the light that actually arrived, " +
            "so the paper comes out orange under a bulb and blue in open shade. " +
            "This is what the white balance setting does. " +
            "It tells the camera what to treat as white, " +
            "which is exactly the judgement your brain has been making for you " +
            "every time you walk from a street into a room.",
        ],
      ],
      choices: [
        "why indoor photos look orange and how white balance fixes it",
        "how a camera measures how much light to let in",
        "why candles give less light than bulbs",
        "how the eye sees color in complete darkness",
        "why outdoor photography is easier than indoor",
      ],
      answer: 1,
      clue: "It tells the camera what to treat as white, which is exactly the judgement your brain has been making for you",
      explanation:
        "남자는 전구 빛의 색이 낮빛과 다른데 눈은 스스로 맞추고 카메라는 그러지 못한다며, 화이트 밸런스가 그 판단을 대신한다고 설명한다. 따라서 답은 ①이다.",
      translation: [
        "M: 안녕하세요, 여러분. 오늘은 실내에서 찍은 사진이 왜 가끔 주황빛으로 나오는지 이야기하려 합니다. 전구에서 나오는 빛은 낮빛과 색이 같지 않습니다. 훨씬 따뜻해서, 하늘빛보다 촛불 색에 가깝습니다. 여러분의 눈은 몇 초 만에 거기에 맞춰져서, 어디에 서 있든 흰 종이를 그냥 희게 봅니다. 카메라에는 그런 버릇이 없습니다. 실제로 도착한 빛을 그대로 기록하니, 전구 아래에서는 종이가 주황으로, 그늘에서는 파랗게 나옵니다. 화이트 밸런스 설정이 하는 일이 바로 이것입니다. 무엇을 흰색으로 칠지 카메라에 알려 주는 것이지요. 그것은 여러분이 길에서 방으로 들어설 때마다 뇌가 대신 내려 주던 바로 그 판단입니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 내용이 아닌 것은?",
      lines: [
        ["M", "Hello, everyone. Today I want to talk about why a photograph taken indoors sometimes comes out orange."],
        ["M", "Light from a bulb is not the same color as daylight. It is much warmer, closer to the color of a candle than of the sky."],
        ["M", "Your eye adjusts to this within seconds and you simply see white paper as white, wherever you are standing."],
        ["M", "A camera has no such habit. It records the light that actually arrived."],
        ["M", "so the paper comes out orange under a bulb and blue in open shade."],
        ["M", "It tells the camera what to treat as white."],
      ],
      choices: [
        "bulb light being warmer than daylight",
        "the eye adjusting within seconds",
        "a camera recording the light that arrived",
        "paper coming out blue in open shade",
        "a flash freezing a moving subject",
      ],
      answer: 5,
      clue: "Light from a bulb is not the same color as daylight. It is much warmer, closer to the color of a candle than of the sky.",
      explanation:
        "전구 빛이 낮빛보다 따뜻하다는 것, 눈이 몇 초 만에 맞춰진다는 것, 카메라가 도착한 빛을 기록한다는 것, 그늘에서 종이가 파랗게 나온다는 것은 언급되지만 플래시가 움직임을 멈춰 준다는 것은 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
