/** 고1 듣기 44회 — 사람이 직접 쓴 회차 (2026-09-29) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고1 44회",
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
          "Good morning, students. This is Mr. Park from the athletics department. " +
            "As many of you know, the school field has been closed since August " +
            "while the drainage under the track was replaced. " +
            "I am pleased to tell you that the work finished last Friday. " +
            "The field reopens for all classes and clubs next Monday morning. " +
            "There are two things to remember before you go out there. " +
            "First, the new surface needs two more weeks to settle, " +
            "so please use only the inner lanes until the end of the month. " +
            "Second, bring proper running shoes; boots will damage the track. " +
            "Clubs should write their practice times on the sheet in the gym office. " +
            "Thank you for your patience these past two months.",
        ],
      ],
      choices: [
        "운동장 재개방과 주의 사항을 알리려고",
        "체육 대회 일정을 안내하려고",
        "동아리 회원을 모집하려고",
        "운동화 구입을 권하려고",
        "공사 시작을 알리려고",
      ],
      answer: 1,
      clue: "The field reopens for all classes and clubs next Monday morning.",
      explanation:
        "운동장이 다시 열린다는 사실과 지켜야 할 점을 알리고 있다. 따라서 답은 ①이다.",
      translation: [
        "M: 학생 여러분, 안녕하세요. 체육부의 박 선생입니다. 많이 아시다시피 8월부터 트랙 아래 배수 시설을 바꾸느라 운동장을 닫아 두었습니다. 지난 금요일에 공사가 끝났음을 알려 드리게 되어 기쁩니다. 운동장은 다음 주 월요일 아침부터 모든 수업과 동아리에 다시 열립니다. 나가기 전에 기억할 것이 두 가지 있습니다. 첫째, 새 바닥이 자리를 잡는 데 두 주가 더 필요하니 이번 달 말까지는 안쪽 차선만 이용해 주세요. 둘째, 제대로 된 운동화를 신고 오세요. 부츠는 트랙을 상하게 합니다. 동아리는 체육관 사무실에 있는 종이에 연습 시간을 적어 주시기 바랍니다. 지난 두 달 동안 기다려 주셔서 고맙습니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 여자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Dain, you turned down the group study invitation again."],
        ["W", "I study alone for the first two hours, then join people."],
        ["M", "Isn't it faster to ask someone right away?"],
        ["W", "Asking too early means I never find out what I don't know."],
        ["M", "But I waste time being stuck on one problem."],
        ["W", "Being stuck is where the learning actually happens."],
        ["M", "It feels like nothing is happening at all."],
        ["W", "Your brain is searching, and that search builds the path."],
        ["M", "So how long do you stay stuck before asking?"],
        ["W", "Twenty minutes, then I bring the question to the group."],
        ["M", "And by then you know exactly what to ask."],
        ["W", "Struggling first is what makes the answer stick."],
        ["M", "I'll try waiting twenty minutes tonight."],
      ],
      choices: [
        "먼저 혼자 씨름해 봐야 배운 것이 남는다",
        "모르는 것은 바로 물어봐야 시간이 절약된다",
        "모둠 학습이 혼자 공부보다 효과적이다",
        "공부 시간을 정해 놓아야 집중이 된다",
        "질문을 많이 할수록 성적이 오른다",
      ],
      answer: 1,
      clue: "Struggling first is what makes the answer stick.",
      explanation:
        "여자는 먼저 혼자 씨름해야 답이 남는다고 말한다. 따라서 답은 ①이다.",
      translation: [
        "M: 다인아, 또 모둠 공부 제안을 거절했네.",
        "W: 처음 두 시간은 혼자 하고 그다음에 합류해.",
        "M: 바로 물어보는 게 빠르지 않아?",
        "W: 너무 일찍 물으면 내가 뭘 모르는지 영영 몰라.",
        "M: 그런데 한 문제에 막혀서 시간을 버리잖아.",
        "W: 막혀 있는 그 지점에서 실제로 배움이 일어나.",
        "M: 아무 일도 안 일어나는 것 같은데.",
        "W: 뇌가 찾고 있고, 그 찾는 과정이 길을 만들어.",
        "M: 그럼 물어보기 전에 얼마나 막혀 있어?",
        "W: 20분. 그다음에 그 질문을 모둠에 가져가.",
        "M: 그때쯤이면 뭘 물어야 할지 정확히 알겠네.",
        "W: 먼저 씨름해야 답이 남아.",
        "M: 오늘 밤에 20분 기다려 볼게.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "When we look at a finished work, we see only the last version. " +
            "A published novel, a recorded song, a winning design. " +
            "What we never see are the forty attempts behind it. " +
            "This creates a false picture in the mind of a beginner. " +
            "She compares her first draft to someone else's fortieth, " +
            "concludes that she has no talent, and stops. " +
            "The honest comparison is between her first draft and their first draft, " +
            "and that one nobody ever shows. " +
            "So when your work looks rough beside a finished piece, " +
            "remember that you are not looking at the same stage of the same process.",
        ],
      ],
      choices: [
        "완성된 결과물과 자신의 초고를 견주지 말아야 한다",
        "재능보다 노력이 중요하다",
        "작품은 여러 사람과 함께 만들어야 한다",
        "실패를 기록으로 남겨야 한다",
        "창작은 꾸준한 연습이 필요하다",
      ],
      answer: 1,
      clue: "you are not looking at the same stage of the same process",
      explanation:
        "완성작과 자기 초고를 견주는 것이 잘못이라고 말한다. 따라서 답은 ①이다.",
      translation: [
        "M: 우리가 완성된 작품을 볼 때 보는 것은 마지막 판뿐입니다. 출간된 소설, 녹음된 노래, 상을 받은 디자인이 그렇습니다. 그 뒤에 있던 마흔 번의 시도는 결코 보이지 않습니다. 이것이 처음 시작하는 사람의 머릿속에 그릇된 그림을 만듭니다. 그는 자기 초고를 남의 마흔 번째 판과 견주고, 자신에게는 재능이 없다고 결론짓고 그만둡니다. 정직한 비교는 자기 초고와 그 사람의 초고 사이의 비교인데, 그것은 아무도 보여 주지 않습니다. 그러니 완성된 작품 옆에서 여러분의 것이 거칠어 보일 때, 같은 과정의 같은 단계를 보고 있는 것이 아님을 기억하십시오.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["M", "Seoyeon, is this the picture of the new reading corner?"],
        ["W", "Yes, the library staff finished it last week."],
        ["M", "There's a round rug in the middle of the floor."],
        ["W", "They chose that so students can sit on it."],
        ["M", "And a tall lamp stands beside the armchair."],
        ["W", "It gives enough light for reading at night."],
        ["M", "I see two framed pictures on the back wall."],
        ["W", "Actually there's only one frame. The other is a window."],
        ["M", "There's a low table in front of the chair too."],
        ["W", "That's where people put their cups."],
        ["M", "And a small plant sits on the windowsill."],
        ["W", "The staff water it every Monday morning."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "Actually there's only one frame. The other is a window.",
      explanation:
        "뒷벽에 액자가 두 개라고 했지만 하나뿐이라고 했다. 따라서 답은 ④이다.",
      figure: {
        kind: "figure5",
        scene:
          "A small reading corner in a library, clean black line art on a plain white background, no writing or letters anywhere. " +
          "A ROUND RUG lies in the middle of the floor. " +
          "A TALL FLOOR LAMP stands beside a single ARMCHAIR. " +
          "TWO FRAMED PICTURES hang side by side on the back wall. " +
          "A LOW TABLE stands in front of the armchair. " +
          "A SMALL POTTED PLANT sits on the windowsill at the right.",
        spots: [
          [0.46, 0.82],
          [0.68, 0.4],
          [0.36, 0.2],
          [0.5, 0.62],
          [0.86, 0.5],
        ],
      },
      translation: [
        "M: 서연아, 이게 새 독서 공간 사진이야?",
        "W: 응, 지난주에 도서관 선생님들이 다 꾸미셨어.",
        "M: 바닥 한가운데에 둥근 깔개가 있네.",
        "W: 학생들이 앉을 수 있게 그걸로 고르셨어.",
        "M: 그리고 안락의자 옆에 키 큰 등이 서 있어.",
        "W: 밤에 읽기에 충분한 빛이 나와.",
        "M: 뒷벽에 액자가 두 개 보여.",
        "W: 사실 액자는 하나뿐이야. 다른 하나는 창문이야.",
        "M: 의자 앞에 낮은 탁자도 있네.",
        "W: 거기에 사람들이 컵을 놓아.",
        "M: 창턱에는 작은 화분이 있고.",
        "W: 선생님들이 월요일 아침마다 물을 주셔.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 여자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Chaewon, the club presentation begins in an hour."],
        ["W", "The slides are loaded and the handouts are printed."],
        ["M", "Did anyone check the projector in the seminar room?"],
        ["W", "I turned it on this morning and it worked fine."],
        ["M", "The teacher said the bulb has been flickering."],
        ["W", "It looked steady when I tested it."],
        ["M", "There's a spare projector in the equipment room."],
        ["W", "Do we have time to swap it before the audience arrives?"],
        ["M", "If we start now, yes. I'll hold the door open."],
        ["W", "The equipment room closes at four, though."],
        ["M", "Then someone has to go immediately."],
        ["W", "I'll go and borrow the spare projector."],
      ],
      choices: [
        "유인물을 출력하기",
        "여분 영사기를 빌려 오기",
        "발표 자료를 고치기",
        "청중을 안내하기",
        "세미나실을 예약하기",
      ],
      answer: 2,
      clue: "I'll go and borrow the spare projector.",
      explanation:
        "여자는 기자재실에서 여분 영사기를 빌려 오겠다고 했다. 따라서 답은 ②이다.",
      translation: [
        "M: 채원아, 동아리 발표가 한 시간 뒤에 시작해.",
        "W: 발표 자료는 띄웠고 유인물도 출력했어.",
        "M: 세미나실 영사기는 누가 확인했어?",
        "W: 오늘 아침에 켜 봤는데 잘 나왔어.",
        "M: 선생님이 전구가 깜빡인다고 하셨어.",
        "W: 내가 볼 때는 괜찮았는데.",
        "M: 기자재실에 여분 영사기가 하나 있어.",
        "W: 청중 오기 전에 바꿀 시간이 돼?",
        "M: 지금 출발하면 돼. 문은 내가 잡고 있을게.",
        "W: 그런데 기자재실이 네 시에 닫아.",
        "M: 그럼 누가 지금 바로 가야 해.",
        "W: 내가 가서 여분 영사기를 빌려 올게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 남자가 지불할 금액을 고르시오.",
      lines: [
        ["W", "Good afternoon. Are you renting equipment for the field trip?"],
        ["M", "Yes, three sleeping bags and two lanterns, please."],
        ["W", "Sleeping bags are five dollars a day each."],
        ["M", "We need them for two days."],
        ["W", "And the lanterns are three dollars a day each."],
        ["M", "Two days as well, then."],
        ["W", "Is anyone in your group a member here?"],
        ["M", "I joined last spring. Here's my card."],
        ["W", "Members get ten percent off the total."],
        ["M", "That helps. Do I pay a deposit too?"],
        ["W", "No deposit for members, only the rental fee."],
        ["M", "Then I'll pay the whole amount now."],
      ],
      choices: ["$37.80", "$38.70", "$40.50", "$42.00", "$45.00"],
      answer: 1,
      clue: "Sleeping bags are five dollars a day each.",
      explanation:
        "침낭 세 개 이틀은 30달러, 등 두 개 이틀은 12달러로 42달러인데 10퍼센트를 빼면 37.80달러이다. 따라서 답은 ①이다.",
      translation: [
        "W: 안녕하세요. 현장 학습에 쓸 장비를 빌리시나요?",
        "M: 네, 침낭 세 개랑 등 두 개 주세요.",
        "W: 침낭은 하나에 하루 5달러입니다.",
        "M: 이틀 동안 필요해요.",
        "W: 등은 하나에 하루 3달러입니다.",
        "M: 그것도 이틀이요.",
        "W: 일행 중에 여기 회원이 있으신가요?",
        "M: 지난봄에 가입했어요. 여기 카드요.",
        "W: 회원은 전체 금액에서 10퍼센트 할인됩니다.",
        "M: 다행이네요. 보증금도 내야 하나요?",
        "W: 회원은 보증금 없이 대여료만 내시면 됩니다.",
        "M: 그럼 지금 전액 결제할게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 남자가 발표를 미룬 이유를 고르시오.",
      lines: [
        ["W", "Junseo, I heard you asked to present next week instead."],
        ["W", "Was there a problem with your topic?"],
        ["M", "The topic is fine. I finished the outline last Sunday."],
        ["W", "Then is it the slides? Those always take longer."],
        ["M", "The slides are done too, all fourteen of them."],
        ["W", "So what made you move it?"],
        ["M", "The survey results only arrive on Thursday."],
        ["W", "The data you collected from the other classes?"],
        ["M", "Right, and half my argument rests on those numbers."],
        ["W", "Presenting without them would weaken everything."],
        ["M", "Exactly, so I'd rather wait one more week."],
        ["W", "That makes sense. I'll tell the teacher."],
      ],
      choices: [
        "주제를 정하지 못해서",
        "발표 자료를 못 만들어서",
        "설문 결과가 아직 나오지 않아서",
        "몸이 아파서",
        "다른 일정이 겹쳐서",
      ],
      answer: 3,
      clue: "The survey results only arrive on Thursday.",
      explanation:
        "설문 결과가 목요일에야 나와서 발표를 미뤘다. 따라서 답은 ③이다.",
      translation: [
        "W: 준서야, 다음 주에 발표하겠다고 했다며.",
        "W: 주제에 문제가 있었어?",
        "M: 주제는 괜찮아. 지난 일요일에 개요를 다 썼어.",
        "W: 그럼 발표 자료 때문이야? 그건 늘 오래 걸리지.",
        "M: 자료도 다 됐어. 열네 장 전부.",
        "W: 그런데 왜 미뤘어?",
        "M: 설문 결과가 목요일에야 와.",
        "W: 다른 반에서 모은 자료 말이야?",
        "M: 응, 내 논지의 절반이 그 숫자에 걸려 있어.",
        "W: 그게 없으면 전체가 약해지겠다.",
        "M: 그래서 한 주 더 기다리는 게 나아.",
        "W: 그럴 만하네. 선생님께 말씀드릴게.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 청소년 영화제에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["W", "Taehyun, are you entering the youth film festival this year?"],
        ["M", "I'm seriously thinking about it. When is the deadline?"],
        ["W", "Films have to be submitted by the end of November."],
        ["M", "That gives me about seven weeks to work with."],
        ["W", "It sounds long, but editing eats most of it."],
        ["M", "How long can the finished film be?"],
        ["W", "Anything from five to fifteen minutes is accepted."],
        ["M", "Is there a set theme this year?"],
        ["W", "The theme is a place that changed you."],
        ["M", "Then I already know which place I would film."],
        ["W", "That's half the work done before you start."],
        ["M", "Where do the screenings actually take place?"],
        ["W", "At the arts center hall right next to the station."],
        ["M", "Do the winners get anything at the end?"],
        ["W", "A camera and a spot at the national festival."],
        ["M", "Then I'd better start filming this weekend."],
      ],
      choices: ["제출 기한", "영화 길이", "올해 주제", "상영 장소", "심사 기준"],
      answer: 5,
      clue: "Films have to be submitted by the end of November.",
      explanation:
        "기한, 길이, 주제, 장소는 말했지만 심사 기준은 말하지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 태현아, 올해 청소년 영화제에 낼 거야?",
        "M: 진지하게 생각 중이야. 마감이 언제야?",
        "W: 11월 말까지 내야 해.",
        "M: 그럼 일곱 주쯤 남았네.",
        "W: 길어 보여도 편집이 대부분을 잡아먹어.",
        "M: 완성작은 얼마나 길어도 돼?",
        "W: 5분에서 15분 사이면 받아 줘.",
        "M: 올해 정해진 주제가 있어?",
        "W: 나를 바꾼 장소가 주제야.",
        "M: 그럼 어디를 찍을지는 벌써 알겠어.",
        "W: 시작도 전에 절반은 한 셈이네.",
        "M: 상영은 어디서 해?",
        "W: 역 바로 옆 예술 회관 강당에서.",
        "M: 수상하면 마지막에 뭘 받아?",
        "W: 사진기랑 전국 영화제 출품 자격.",
        "M: 그럼 이번 주말부터 찍어야겠다.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "다음을 듣고, 학교 벽화 그리기 사업에 관한 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "W",
          "Hello, students. Here is the plan for the school mural project. " +
            "We will paint the long wall beside the bicycle racks. " +
            "Work takes place on the two Saturdays of the last week of November. " +
            "Thirty students may take part, ten from each grade. " +
            "The art club has already drawn the outline on the wall. " +
            "Paint, brushes and gloves are provided by the school. " +
            "Bring old clothes that you do not mind ruining. " +
            "Lunch is not provided, so pack something to eat. " +
            "Sign your name on the sheet in the art room by Friday.",
        ],
      ],
      choices: [
        "자전거 거치대 옆 벽에 그린다",
        "11월 마지막 주 토요일 이틀 동안 한다",
        "학년마다 열 명씩 참여한다",
        "밑그림은 미술 동아리가 그려 두었다",
        "점심 식사가 제공된다",
      ],
      answer: 5,
      clue: "Lunch is not provided, so pack something to eat.",
      explanation:
        "점심은 제공되지 않으니 싸 오라고 했으므로 ⑤가 일치하지 않는다.",
      translation: [
        "W: 학생 여러분, 안녕하세요. 학교 벽화 사업 계획을 알려 드립니다. 자전거 거치대 옆 긴 벽에 그림을 그립니다. 작업은 11월 마지막 주 토요일 이틀에 걸쳐 진행됩니다. 학년마다 열 명씩, 모두 서른 명이 참여할 수 있습니다. 밑그림은 미술 동아리가 이미 벽에 그려 두었습니다. 물감, 붓, 장갑은 학교에서 준비합니다. 버려도 괜찮은 헌 옷을 입고 오세요. 점심은 제공되지 않으니 먹을 것을 싸 오세요. 금요일까지 미술실에 있는 종이에 이름을 적어 주세요.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 예약할 숙소를 고르시오.",
      lines: [
        ["M", "Yerin, which guesthouse should our club book for the trip?"],
        ["W", "Five places came up when I searched last night."],
        ["M", "How many of us are going in the end?"],
        ["W", "Twelve, including the two teachers."],
        ["M", "Then anything that sleeps fewer than twelve is out."],
        ["W", "Two of these take only eight guests."],
        ["M", "The price also has to stay under fifty thousand won each."],
        ["W", "My classmates said that is their limit."],
        ["M", "One place is well above that amount."],
        ["W", "And we need breakfast included, since we leave early."],
        ["M", "Then only one guesthouse fits everything."],
        ["W", "I'll book it before someone else does."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 5,
      clue: "Twelve, including the two teachers.",
      explanation:
        "12명 수용, 1인 5만 원 미만, 조식 포함인 숙소는 ⑤이다. 따라서 답은 ⑤이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Sleeps: 8 / Price: 40,000 won / Breakfast: Yes" },
          { no: 2, label: "②", value: "Sleeps: 14 / Price: 60,000 won / Breakfast: Yes" },
          { no: 3, label: "③", value: "Sleeps: 8 / Price: 45,000 won / Breakfast: No" },
          { no: 4, label: "④", value: "Sleeps: 12 / Price: 48,000 won / Breakfast: No" },
          { no: 5, label: "⑤", value: "Sleeps: 12 / Price: 47,000 won / Breakfast: Yes" },
        ],
      },
      translation: [
        "M: 예린아, 우리 동아리 여행은 어느 숙소로 예약할까?",
        "W: 어젯밤에 찾아보니 다섯 곳이 나왔어.",
        "M: 결국 몇 명이 가?",
        "W: 선생님 두 분까지 열두 명.",
        "M: 그럼 열두 명 미만인 곳은 빠지네.",
        "W: 이 중 두 곳은 여덟 명까지만 돼.",
        "M: 값도 한 사람에 5만 원 미만이어야 해.",
        "W: 반 애들이 그게 한계라고 했어.",
        "M: 한 곳은 그 액수를 훨씬 넘어.",
        "W: 그리고 일찍 나가니까 조식이 포함돼야 해.",
        "M: 그럼 다 맞는 숙소는 하나뿐이야.",
        "W: 다른 사람이 잡기 전에 예약할게.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Are you going to the career fair this afternoon?"],
        ["W", "I planned to, but my last class ends at three."],
        ["M", "The booths stay open until five."],
        ["W", "That gives me almost two hours."],
        ["M", "Shall we walk over there together?"],
      ],
      choices: [
        "The fair was last month.",
        "I don't have any classes.",
        "You should go home now.",
        "Sure, meet me at the gate.",
        "There are no booths left.",
      ],
      answer: 4,
      clue: "Shall we walk over there together?",
      explanation:
        "같이 걸어가자는 제안이므로, 정문에서 만나자는 ④가 가장 자연스럽다.",
      translation: [
        "M: 오늘 오후 진로 박람회 갈 거야?",
        "W: 가려고 했는데 마지막 수업이 세 시에 끝나.",
        "M: 부스는 다섯 시까지 열어.",
        "W: 그럼 거의 두 시간이 있네.",
        "M: 우리 같이 걸어갈까?",
        "W: 좋아, 정문에서 만나자.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Excuse me, is the computer room open on Saturday?"],
        ["M", "Only in the morning, from nine until noon."],
        ["W", "Do I need to book a seat in advance?"],
        ["M", "Not usually, but it fills up during exam weeks."],
        ["W", "Should I come early to be safe?"],
      ],
      choices: [
        "The room closed last year.",
        "Coming before ten is best.",
        "You can't use computers.",
        "It opens in the evening.",
        "I don't work here.",
      ],
      answer: 2,
      clue: "Should I come early to be safe?",
      explanation:
        "일찍 오는 게 나은지 물었으므로, 열 시 전에 오는 게 좋다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 실례합니다, 컴퓨터실이 토요일에 여나요?",
        "M: 오전만요, 아홉 시부터 정오까지.",
        "W: 자리를 미리 예약해야 하나요?",
        "M: 보통은 아닌데 시험 기간에는 자리가 찹니다.",
        "W: 안전하게 일찍 오는 게 나을까요?",
        "M: 열 시 전에 오시는 게 제일 좋습니다.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Minjun, how is your English speaking practice going these days?"],
        ["M", "I record myself for three minutes every single evening."],
        ["W", "Do you ever listen to the recordings afterwards?"],
        ["M", "That is exactly the part I keep avoiding."],
        ["W", "Why do you avoid it so much?"],
        ["M", "My own voice sounds strange and full of mistakes."],
        ["W", "But the mistakes are the useful part of the recording."],
        ["M", "I know that, and I still skip it most nights."],
        ["W", "Three minutes is probably too long to face at once."],
        ["M", "Listening to all of it does feel heavy."],
        ["W", "What if you listened to just thirty seconds instead?"],
        ["M", "Thirty seconds actually sounds manageable."],
        ["W", "Which part of it would you choose to listen to?"],
      ],
      choices: [
        "I never record anything.",
        "The very beginning, probably.",
        "I'll stop practicing English.",
        "Recordings are not useful.",
        "My voice is perfect already.",
      ],
      answer: 2,
      clue: "Which part of it would you choose to listen to?",
      explanation:
        "어느 부분을 들을지 물었으므로, 맨 앞부분이라는 ②가 가장 자연스럽다.",
      translation: [
        "W: 민준아, 요즘 영어 말하기 연습은 잘돼 가?",
        "M: 저녁마다 빠짐없이 3분씩 내 목소리를 녹음해.",
        "W: 녹음한 걸 나중에 들어 보기는 해?",
        "M: 바로 그 부분을 계속 피하고 있어.",
        "W: 왜 그렇게 피해?",
        "M: 내 목소리가 이상하게 들리고 틀린 게 가득해.",
        "W: 그런데 틀린 부분이야말로 쓸모 있는 부분이야.",
        "M: 아는데도 거의 매일 밤 건너뛰어.",
        "W: 3분을 한 번에 마주하기에는 길지도 몰라.",
        "M: 전부 다 듣는 건 확실히 버거워.",
        "W: 대신 30초만 들어 보면 어때?",
        "M: 30초면 정말 할 수 있겠다.",
        "W: 그중 어느 부분을 들을 거야?",
        "M: 아마 맨 앞부분.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Suyeon, you said you wanted to run a half marathon."],
        ["W", "I signed up for the one in April."],
        ["M", "How far can you run right now?"],
        ["W", "Seven kilometers without stopping."],
        ["M", "That's a good start with six months left."],
        ["W", "But my legs hurt after every long run."],
        ["M", "How many days a week do you run?"],
        ["W", "Five, and two of them are long ones."],
        ["M", "That's a lot of hard days in one week."],
        ["W", "I thought more running meant faster progress."],
        ["M", "How many rest days would you be willing to take?"],
      ],
      choices: [
        "I never rest at all.",
        "Two, if that's enough.",
        "I'll run seven days instead.",
        "I quit running last week.",
        "Resting is a waste of time.",
      ],
      answer: 2,
      clue: "How many rest days would you be willing to take?",
      explanation:
        "쉬는 날을 며칠 둘 수 있는지 물었으므로, 이틀이라는 ②가 가장 자연스럽다.",
      translation: [
        "M: 수연아, 하프 마라톤을 뛰고 싶다고 했잖아.",
        "W: 4월 대회에 신청했어.",
        "M: 지금은 얼마나 뛸 수 있어?",
        "W: 쉬지 않고 7킬로미터.",
        "M: 여섯 달 남았으니 좋은 출발이네.",
        "W: 그런데 길게 뛴 뒤에는 늘 다리가 아파.",
        "M: 일주일에 며칠 뛰어?",
        "W: 닷새. 그중 이틀은 길게 뛰어.",
        "M: 한 주에 힘든 날이 많네.",
        "W: 많이 뛸수록 빨리 는다고 생각했어.",
        "M: 쉬는 날은 며칠까지 둘 수 있겠어?",
        "W: 그걸로 충분하다면 이틀.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Wonho가 Nayeon에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Wonho : ________________",
      lines: [
        [
          "M",
          "Wonho and Nayeon work together on the school broadcasting team. " +
            "Every Tuesday they record the morning news in the small studio. " +
            "This week Nayeon has written a very interesting script, " +
            "but when she reads it aloud she speaks far too quickly. " +
            "The students listening in their classrooms cannot follow her at all. " +
            "Wonho has noticed that she reads three hundred words in one minute, " +
            "while a clear broadcast should be about half that speed. " +
            "He wants to tell her to slow down when she reads. " +
            "In this situation, what would Wonho most likely say to Nayeon?",
        ],
      ],
      choices: [
        "Write a much longer script.",
        "Let's cancel the broadcast today.",
        "Try reading it more slowly.",
        "Your script is not interesting.",
        "Speak louder into the microphone.",
      ],
      answer: 3,
      clue: "He wants to tell her to slow down when she reads.",
      explanation:
        "너무 빨리 읽어 알아들을 수 없으므로, 천천히 읽으라는 ③이 가장 적절하다.",
      translation: [
        "M: 원호와 나연이는 학교 방송부에서 함께 일합니다. 화요일마다 작은 방송실에서 아침 소식을 녹음합니다. 이번 주에 나연이는 아주 흥미로운 원고를 썼지만, 소리 내어 읽을 때 지나치게 빨리 말합니다. 교실에서 듣는 학생들은 전혀 따라가지 못합니다. 원호는 그녀가 1분에 300낱말을 읽는다는 것을 알아챘는데, 또렷한 방송은 그 절반 정도여야 합니다. 그는 읽을 때 천천히 하라고 말하고 싶습니다. 이런 상황에서 원호가 나연이에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 여자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "Hello, everyone. Today I want to talk about why certain animals " +
            "gather in enormous groups instead of living alone. " +
            "A single sardine in open water is an easy meal. " +
            "Inside a school of thousands, the same fish becomes almost impossible to catch, " +
            "because a predator cannot fix its eyes on any one body. " +
            "Starlings work the same way, folding and turning in the sky " +
            "so that a hawk sees one shifting shape instead of ten thousand birds. " +
            "Musk oxen form a ring with their horns facing outward, " +
            "and the calves stand in the middle where no wolf can reach. " +
            "Even honeybees crowd together in winter, " +
            "shivering in a tight ball so the queen at the center stays warm. " +
            "In each case the group does something no individual could do alone. " +
            "Living together is not comfort; it is a strategy for staying alive.",
        ],
      ],
      choices: [
        "how grouping helps animals survive",
        "why some animals migrate long distances",
        "how birds learn to fly in formation",
        "why predators hunt in the open sea",
        "how bees produce honey in winter",
      ],
      answer: 1,
      clue: "In each case the group does something no individual could do alone.",
      explanation:
        "무리 짓기가 생존에 어떻게 도움이 되는지가 중심 내용이다. 따라서 답은 ①이다.",
      translation: [
        "W: 여러분, 안녕하세요. 오늘은 어떤 동물들이 왜 혼자 살지 않고 거대한 무리를 이루는지 이야기하려 합니다. 넓은 바다에서 정어리 한 마리는 손쉬운 먹잇감입니다. 그런데 수천 마리 떼 안에 있으면 같은 물고기를 잡기가 거의 불가능해집니다. 잡아먹는 쪽이 어느 한 몸에 눈을 고정할 수 없기 때문입니다. 찌르레기도 마찬가지로 하늘에서 접히고 돌아, 매가 만 마리의 새가 아니라 하나의 움직이는 형체를 보게 만듭니다. 사향소는 뿔을 바깥으로 향한 채 둥글게 진을 치고, 새끼들은 늑대가 닿을 수 없는 한가운데에 섭니다. 꿀벌조차 겨울에는 빽빽하게 뭉쳐 몸을 떨어, 한가운데 있는 여왕벌이 따뜻하게 지내도록 합니다. 어느 경우든 무리는 한 마리가 혼자서는 할 수 없는 일을 해냅니다. 함께 사는 것은 편안함이 아니라 살아남기 위한 전략입니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "다음을 듣고, 언급된 동물이 아닌 것을 고르시오.",
      lines: [
        ["W", "A single sardine in open water is an easy meal."],
        ["W", "Starlings fold and turn in the sky so that a hawk sees one shifting shape."],
        ["W", "Musk oxen form a ring with their horns facing outward."],
        ["W", "No wolf can reach the calves in the middle."],
        ["W", "Even honeybees crowd together in winter."],
      ],
      choices: ["sardines", "starlings", "musk oxen", "honeybees", "dolphins"],
      answer: 5,
      clue: "Even honeybees crowd together in winter.",
      explanation:
        "정어리, 찌르레기, 사향소, 꿀벌은 언급되지만 돌고래는 나오지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
