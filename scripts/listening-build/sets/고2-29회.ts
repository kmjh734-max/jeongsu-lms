/** 고2 듣기 29회 — 사람이 직접 쓴 회차 (2026-09-25) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고2 29회",
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
          "Good afternoon, everyone. This is Ms. Ryu from the school newspaper. " +
            "I want to talk about the photographs you send us. " +
            "Every issue we receive about sixty pictures from club events, " +
            "and we can only print the ones we are able to caption. " +
            "Last month we left out nine good photographs " +
            "because nobody could tell us who was in them. " +
            "So from this issue, please send the names of the people in the picture " +
            "in the same message as the file. " +
            "You do not need a long description. Left to right is enough. " +
            "A photograph nobody can name is a photograph we cannot use. Thank you.",
        ],
      ],
      choices: [
        "사진과 함께 인물 이름을 보내 달라고 부탁하려고",
        "사진 공모전을 알리려고",
        "신문 발행일 변경을 알리려고",
        "사진 촬영 방법을 안내하려고",
        "기자단 모집을 알리려고",
      ],
      answer: 1,
      clue: "So from this issue, please send the names of the people in the picture in the same message as the file.",
      explanation:
        "여자는 이름을 알 수 없어 사진을 못 싣는다며 파일과 같은 메시지에 인물 이름을 보내 달라고 부탁한다. 따라서 답은 ①이다.",
      translation: [
        "W: 여러분, 안녕하세요. 학교 신문부 류입니다. 여러분이 보내 주시는 사진 이야기를 하려고 합니다. 호마다 동아리 행사 사진을 예순 장쯤 받는데, 저희는 설명을 붙일 수 있는 사진만 실을 수 있습니다. 지난달에는 좋은 사진 아홉 장을 빼야 했습니다. 거기 누가 있는지 아무도 알려 주지 못했기 때문입니다. 그러니 이번 호부터는 파일과 같은 메시지에 사진 속 사람들의 이름을 적어 보내 주세요. 긴 설명은 필요 없습니다. 왼쪽부터 오른쪽으로 적어 주시면 됩니다. 아무도 이름을 댈 수 없는 사진은 저희가 쓸 수 없는 사진입니다. 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 남자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Taeyang, I've been studying in a group of seven every evening."],
        ["M", "Seven? How does a question get answered in a group that size?"],
        ["W", "Someone always knows it. That's the good part."],
        ["M", "Someone always knows it, so you never have to."],
        ["W", "I still hear the answer, though."],
        ["M", "Hearing an answer and finding one leave different marks."],
        ["W", "You think I've been outsourcing the hard part."],
        ["M", "Seven people means the hard part always lands on someone else."],
        ["W", "But two of us would get stuck all the time."],
        ["M", "Stuck is where the learning is. Seven people never get stuck."],
        ["W", "So a smaller group would be slower and better."],
        ["M", "Study with one person, and take turns being the one who explains."],
      ],
      choices: [
        "스터디는 사람이 많을수록 좋다",
        "모르는 것은 바로 물어야 한다",
        "공부는 혼자 해야 한다",
        "스터디는 작게 해야 스스로 생각하게 된다",
        "설명은 잘하는 사람이 맡아야 한다",
      ],
      answer: 4,
      clue: "Study with one person, and take turns being the one who explains.",
      explanation:
        "남자는 일곱 명이면 어려운 부분이 늘 남에게 간다며, 둘이서 설명을 번갈아 맡으라고 말한다. 따라서 답은 ④이다.",
      translation: [
        "W: 태양아, 나 저녁마다 일곱 명이서 같이 공부해.",
        "M: 일곱 명? 그 크기에서 질문이 어떻게 답해져?",
        "W: 누군가는 늘 알아. 그게 좋은 점이야.",
        "M: 누군가는 늘 아니까 네가 알 필요가 없는 거지.",
        "W: 그래도 답은 듣잖아.",
        "M: 답을 듣는 것과 찾아내는 것은 다른 자국을 남겨.",
        "W: 내가 어려운 부분을 남한테 맡기고 있었다는 거야?",
        "M: 일곱 명이면 어려운 부분은 늘 다른 사람한테 떨어져.",
        "W: 그런데 둘이면 계속 막힐 텐데.",
        "M: 막히는 자리가 배우는 자리야. 일곱 명은 절대 안 막혀.",
        "W: 그럼 작은 모임이 느리고 더 나은 거구나.",
        "M: 한 명이랑 해. 그리고 설명하는 사람을 번갈아 맡아.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "Every field has a set of words that sound like explanations but are not. " +
            "In medicine, saying a pain is idiopathic means we do not know its cause. " +
            "In psychology, saying someone lacks motivation often means " +
            "we have not found what would move them. " +
            "These terms are useful shorthand among people who already know their limits. " +
            "The danger is what they do to a conversation with anyone else. " +
            "The word arrives, it sounds technical, " +
            "and everyone stops asking, because a name feels like an answer. " +
            "So when you hear a term used to close a discussion, " +
            "try replacing it with its plain meaning and see whether the sentence still stands. " +
            "Often what is left is an honest description of a question nobody has solved.",
        ],
      ],
      choices: [
        "전문 용어를 많이 알아야 한다",
        "의학과 심리학은 다르게 접근해야 한다",
        "질문을 많이 해야 한다",
        "모르는 것은 인정해야 한다",
        "설명처럼 들리는 용어를 풀어서 확인해야 한다",
      ],
      answer: 5,
      clue: "try replacing it with its plain meaning and see whether the sentence still stands",
      explanation:
        "여자는 이름이 답처럼 느껴져 질문이 멈춘다며, 용어를 쉬운 말로 바꿔 문장이 남는지 보라고 말한다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 모든 분야에는 설명처럼 들리지만 설명이 아닌 말들이 있습니다. 의학에서 어떤 통증이 '특발성'이라고 말하는 것은 원인을 모른다는 뜻입니다. 심리학에서 누군가에게 '동기가 없다'고 말하는 것은 그 사람을 움직일 무언가를 아직 찾지 못했다는 뜻인 경우가 많습니다. 이런 용어는 자기 한계를 이미 아는 사람들 사이에서는 쓸모 있는 줄임말입니다. 위험한 것은 그 말이 다른 사람과의 대화에 하는 일입니다. 그 단어가 도착하면 전문적으로 들리고, 모두가 묻기를 멈춥니다. 이름이 답처럼 느껴지기 때문입니다. 그러니 어떤 용어가 논의를 닫는 데 쓰이는 것을 들으면, 그것을 쉬운 말로 바꿔 넣고 그 문장이 그대로 서 있는지 보세요. 남는 것은 대개 아무도 풀지 못한 질문에 대한 정직한 묘사입니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["M", "Yerim, is this the corner you turned into a plant nursery?"],
        ["W", "Yes, the biology room finally has one."],
        ["M", "There's a grow light hanging above the bench."],
        ["W", "It runs on a timer, twelve hours a day."],
        ["M", "And a watering can stands at the right end."],
        ["W", "That one holds exactly enough for all the trays."],
        ["M", "I count three seedling trays on the bench."],
        ["W", "There are four. One is behind the watering can."],
        ["M", "The thermometer on the wall is easy to read."],
        ["W", "We check it every morning before the first class."],
        ["M", "And a bag of soil leans against the bench leg."],
        ["W", "It lasts about two months at this rate."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "There are four. One is behind the watering can.",
      explanation:
        "남자가 모판이 세 개라고 하자 여자가 네 개라고 바로잡는다. 그림에는 세 개가 그려져 있으므로 답은 ③이다.",
      figure: {
        kind: "scene",
        scene:
          "A plant nursery bench drawn as one wide picture, clean black line art on white, no writing or letters or numbers anywhere. " +
          "A GROW LIGHT hangs on chains above a long bench. " +
          "A WATERING CAN stands at the right end of the bench. " +
          "EXACTLY THREE SEEDLING TRAYS sit on the bench, spaced well apart so all three are easy to count and none overlap. " +
          "A ROUND THERMOMETER hangs on the wall. " +
          "A BAG OF SOIL leans against a leg of the bench.",
      },
      translation: [
        "M: 예림아, 이게 모종 기르는 자리로 만든 구석이야?",
        "W: 응, 생물실에 드디어 하나 생겼어.",
        "M: 작업대 위에 식물등이 걸려 있네.",
        "W: 타이머로 하루 열두 시간 켜져.",
        "M: 그리고 오른쪽 끝에 물뿌리개가 서 있어.",
        "W: 그거 하나면 모판 전체에 딱 맞아.",
        "M: 작업대에 모판이 세 개 보여.",
        "W: 네 개야. 하나는 물뿌리개 뒤에 있어.",
        "M: 벽에 걸린 온도계는 읽기 쉽네.",
        "W: 1교시 전에 아침마다 확인해.",
        "M: 그리고 작업대 다리에 흙 포대가 기대어 있어.",
        "W: 이 속도면 두 달쯤 가.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 남자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Taeyang, the charity concert starts at seven in the hall."],
        ["M", "I know. Is the stage set for the three acts?"],
        ["W", "Set and marked with tape. Nobody will trip."],
        ["M", "Good. And the tickets at the door?"],
        ["W", "Counted twice. Two hundred and forty of them."],
        ["M", "Then what's still open?"],
        ["W", "The piano hasn't been moved from the music room."],
        ["M", "It's on wheels, isn't it?"],
        ["W", "It is, but it takes two people and a lift key."],
        ["M", "Who has the lift key?"],
        ["W", "The caretaker, until six. I'm meeting the performers at half past five."],
        ["M", "Then I'll get the key and move the piano."],
      ],
      choices: [
        "무대 표시하기",
        "표 세기",
        "피아노 옮기기",
        "출연자 맞이하기",
        "강당 청소하기",
      ],
      answer: 3,
      clue: "Then I'll get the key and move the piano.",
      explanation:
        "무대와 표는 끝났고 여자는 출연자를 맞아야 하므로, 남자가 열쇠를 받아 피아노를 옮기기로 한다. 따라서 답은 ③이다.",
      translation: [
        "W: 태양아, 자선 음악회가 7시에 강당에서 시작해.",
        "M: 알아. 무대는 세 팀에 맞게 잡았어?",
        "W: 잡고 테이프로 표시까지 했어. 걸려 넘어질 일 없어.",
        "M: 좋아. 문 앞에 둘 표는?",
        "W: 두 번 셌어. 이백사십 장.",
        "M: 그럼 아직 남은 게 뭐야?",
        "W: 피아노를 음악실에서 아직 안 옮겼어.",
        "M: 바퀴 달린 거 아니야?",
        "W: 맞아. 그런데 두 사람이랑 승강기 열쇠가 있어야 해.",
        "M: 승강기 열쇠는 누가 갖고 있어?",
        "W: 관리 선생님이 6시까지. 나는 5시 30분에 출연자들을 맞아야 해.",
        "M: 그럼 내가 열쇠 받아서 피아노 옮길게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 여자가 지불할 금액을 고르시오.",
      lines: [
        ["M", "Welcome to Fairmont Book Cafe. What can I get you?"],
        ["W", "Four slices of cake and six teas, please."],
        ["M", "Cake is six dollars a slice and tea is four."],
        ["W", "So twenty-four dollars plus twenty-four."],
        ["M", "Forty-eight in total. Would you like the fruit plate as well?"],
        ["W", "How much is the plate?"],
        ["M", "Fourteen dollars, and it serves about six."],
        ["W", "We'll skip the plate. We've just had lunch."],
        ["M", "No problem. Are you with a reading group?"],
        ["W", "We are. Here's the group card."],
        ["M", "Then I can take twenty-five percent off the teas, but not the cake."],
        ["W", "Thank you. I'll pay by card."],
      ],
      choices: ["$36.00", "$42.00", "$48.00", "$54.00", "$62.00"],
      answer: 2,
      clue: "Then I can take twenty-five percent off the teas, but not the cake.",
      explanation:
        "차 6잔 24달러에서 25퍼센트를 빼면 18달러이고, 할인이 안 되는 케이크 4조각 24달러를 더하면 42달러이다. 따라서 답은 ②이다.",
      translation: [
        "M: 페어몬트 북카페입니다. 무엇을 드릴까요?",
        "W: 케이크 네 조각이랑 차 여섯 잔 주세요.",
        "M: 케이크는 한 조각에 6달러, 차는 4달러입니다.",
        "W: 그럼 24달러에 24달러네요.",
        "M: 모두 48달러입니다. 과일 접시도 하시겠어요?",
        "W: 접시는 얼마예요?",
        "M: 14달러인데, 여섯 분이 드실 양입니다.",
        "W: 접시는 뺄게요. 방금 점심 먹었어요.",
        "M: 괜찮습니다. 독서 모임이세요?",
        "W: 네. 여기 모임 카드요.",
        "M: 그럼 차값에서 25퍼센트를 빼 드립니다. 케이크는 안 돼요.",
        "W: 감사합니다. 카드로 낼게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 남자가 밴드 공연에 서지 않는 이유를 고르시오.",
      lines: [
        ["W", "Taeyang, you're not in the band's set list this time."],
        ["M", "I told them last week I'd sit it out."],
        ["W", "Is your wrist still sore from the fall?"],
        ["M", "That healed in September."],
        ["W", "Then is it the rehearsal schedule? It's three nights a week."],
        ["M", "Three nights I could do."],
        ["W", "So what is it?"],
        ["M", "The concert is on the day of my grandfather's memorial."],
        ["W", "Oh. And that's a full day?"],
        ["M", "We drive down in the morning and come back late. I can't split it."],
      ],
      choices: [
        "손목을 다쳐서",
        "연습이 너무 많아서",
        "집안 행사가 있어서",
        "다른 밴드로 옮겨서",
        "악기가 고장 나서",
      ],
      answer: 3,
      clue: "The concert is on the day of my grandfather's memorial.",
      explanation:
        "손목도 나았고 연습도 감당할 수 있지만, 공연 날이 할아버지 제사와 겹쳐 하루를 다 써야 하기 때문이다. 따라서 답은 ③이다.",
      translation: [
        "W: 태양아, 이번 밴드 순서에 네가 없네.",
        "M: 지난주에 이번엔 빠지겠다고 했어.",
        "W: 넘어져서 다친 손목이 아직 아파?",
        "M: 9월에 나았어.",
        "W: 그럼 연습 일정 때문이야? 일주일에 세 번이잖아.",
        "M: 세 번은 할 수 있었어.",
        "W: 그럼 뭔데?",
        "M: 공연 날이 할아버지 제삿날이야.",
        "W: 아. 하루를 다 써야 해?",
        "M: 아침에 내려갔다가 늦게 돌아와. 쪼갤 수가 없어.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, Riverside Night Market에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["W", "Taeyang, have you been to the Riverside Night Market?"],
        ["M", "Not yet. When is it open?"],
        ["W", "Friday and Saturday evenings, from six until eleven."],
        ["M", "Two nights a week. Where exactly is it?"],
        ["W", "On the walking path under the old rail bridge."],
        ["M", "I've cycled past there. What do they sell?"],
        ["W", "Food mostly, plus a few stalls with handmade things."],
        ["M", "Is there anywhere to sit and eat?"],
        ["W", "Long tables in the middle, about twenty of them."],
        ["M", "Do we need cash?"],
        ["W", "Every stall takes cards now. They changed that last year."],
        ["M", "Then let's go on Friday."],
      ],
      choices: ["여는 날", "여는 장소", "파는 물건", "앉을 자리", "주차 안내"],
      answer: 5,
      clue: "주차 안내는 대화에서 언급되지 않았다.",
      explanation:
        "여는 날(금·토 저녁), 장소(옛 철교 아래 산책로), 파는 물건(음식과 수공예품), 앉을 자리(긴 탁자 스무 개쯤)는 언급되지만 주차 안내는 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 태양아, 리버사이드 야시장 가 봤어?",
        "M: 아직. 언제 열어?",
        "W: 금요일과 토요일 저녁, 6시부터 11시까지.",
        "M: 일주일에 이틀이구나. 정확히 어디야?",
        "W: 옛 철교 아래 산책로에서.",
        "M: 자전거로 지나가 봤어. 뭘 팔아?",
        "W: 주로 음식. 손으로 만든 걸 파는 가게도 몇 곳 있어.",
        "M: 앉아서 먹을 데도 있어?",
        "W: 가운데에 긴 탁자가 스무 개쯤 있어.",
        "M: 현금 필요해?",
        "W: 이제 모든 가게가 카드 받아. 작년에 바뀌었어.",
        "M: 그럼 금요일에 가자.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Stonebrook Youth Choir에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "M",
          "Let me tell you about the Stonebrook Youth Choir. " +
            "It was founded in 1998 and has about fifty members aged twelve to eighteen. " +
            "Rehearsals are held on Monday evenings in the church hall on Mill Street. " +
            "New members join by a short audition, held in February and August. " +
            "Sheet music is provided, but members buy their own concert uniform. " +
            "The choir performs four times a year, and two of those concerts are held outdoors. " +
            "There is no monthly fee, because a local company covers the hall rental.",
        ],
      ],
      choices: [
        "1998년에 만들어졌다",
        "월요일 저녁에 연습한다",
        "오디션은 2월과 8월에 있다",
        "공연복을 무료로 준다",
        "월 회비가 없다",
      ],
      answer: 4,
      clue: "Sheet music is provided, but members buy their own concert uniform.",
      explanation:
        "악보는 제공하지만 공연복은 단원이 직접 산다고 했으므로 ④는 내용과 다르다. 따라서 답은 ④이다.",
      translation: [
        "M: 스톤브룩 청소년 합창단을 소개해 드리겠습니다. 1998년에 만들어졌고 열두 살부터 열여덟 살까지 쉰 명쯤이 활동합니다. 연습은 월요일 저녁에 밀가의 교회 강당에서 합니다. 새 단원은 짧은 오디션으로 뽑는데 2월과 8월에 있습니다. 악보는 제공하지만 공연복은 단원이 직접 삽니다. 합창단은 해마다 네 번 공연하고 그중 두 번은 야외에서 합니다. 지역 회사가 강당 대여료를 내 주기 때문에 월 회비는 없습니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 예약할 공연장을 고르시오.",
      lines: [
        ["W", "Taeyang, let's book a venue for the club's year-end show."],
        ["M", "Five listed. How many seats do we need?"],
        ["W", "At least a hundred and fifty. We sold that many last year."],
        ["M", "That rules out the small ones. Do we need a sound system?"],
        ["W", "Yes. Hiring one separately would cost more than the room."],
        ["M", "Agreed. And the rate? We raised three hundred thousand won."],
        ["W", "So three hundred thousand is the ceiling."],
        ["M", "Then only one venue clears all three."],
        ["W", "Let's book before the December dates go."],
        ["M", "I'll reserve it tonight and forward the confirmation."],
        ["W", "Ask whether they have a piano as well."],
        ["M", "Good idea. I'll put that in the message."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "At least a hundred and fifty. We sold that many last year.",
      explanation:
        "좌석이 150석 이상이고, 음향 장비가 있으며, 30만 원 이하인 곳을 고른다. 세 조건을 모두 채우는 것은 ④이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Seats: 80 / Sound system: Yes / Rate: 150,000 won" },
          { no: 2, label: "②", value: "Seats: 200 / Sound system: No / Rate: 180,000 won" },
          { no: 3, label: "③", value: "Seats: 160 / Sound system: Yes / Rate: 420,000 won" },
          { no: 4, label: "④", value: "Seats: 180 / Sound system: Yes / Rate: 270,000 won" },
          { no: 5, label: "⑤", value: "Seats: 120 / Sound system: No / Rate: 90,000 won" },
        ],
      },
      translation: [
        "W: 태양아, 동아리 연말 공연 할 공연장 예약하자.",
        "M: 다섯 곳 있네. 좌석이 몇 개 필요해?",
        "W: 적어도 150석. 작년에 그만큼 팔았어.",
        "M: 그럼 작은 데는 빠지네. 음향 장비는 필요해?",
        "W: 응. 따로 빌리면 대관료보다 더 들어.",
        "M: 동의해. 값은? 30만 원 모았잖아.",
        "W: 그럼 30만 원이 한계네.",
        "M: 그럼 세 조건 다 넘는 건 하나뿐이야.",
        "W: 12월 날짜가 빠지기 전에 예약하자.",
        "M: 오늘 밤에 예약하고 확인서 보낼게.",
        "W: 피아노도 있는지 물어봐 줘.",
        "M: 좋은 생각이야. 메시지에 넣을게.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["M", "Yerim, is the art room open on Saturday morning?"],
        ["W", "It is, but only if you sign the key out on Friday."],
        ["M", "I didn't know that was a rule."],
        ["W", "It started this term. Sign it out at the office before five today."],
      ],
      choices: [
        "The art room is closed on Saturdays.",
        "I'll sign it out before five.",
        "I don't need the art room.",
        "There is no rule about keys.",
        "I'll go on Sunday instead.",
      ],
      answer: 2,
      clue: "It started this term. Sign it out at the office before five today.",
      explanation:
        "여자가 오늘 5시 전에 사무실에서 열쇠를 받아 두라고 했으므로, 그렇게 하겠다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 예림아, 토요일 아침에 미술실 열어?",
        "W: 열어. 그런데 금요일에 열쇠를 받아 둬야 해.",
        "M: 그런 규칙이 있는 줄 몰랐어.",
        "W: 이번 학기에 생겼어. 오늘 5시 전에 사무실에서 받아 둬.",
        "M: 5시 전에 받아 둘게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["W", "Taeyang, my presentation file won't open on the school computer."],
        ["M", "What did you make it in at home?"],
        ["W", "The newest version. My laptop updated last month."],
        ["M", "Export it as a PDF and bring that as well, just in case."],
      ],
      choices: [
        "My file opens perfectly.",
        "I'll bring a PDF too.",
        "I don't have a presentation.",
        "The school computers are new.",
        "I'll present without slides.",
      ],
      answer: 2,
      clue: "Export it as a PDF and bring that as well, just in case.",
      explanation:
        "남자가 PDF로도 뽑아 가져오라고 했으므로, PDF도 가져오겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 태양아, 내 발표 파일이 학교 컴퓨터에서 안 열려.",
        "M: 집에서 뭘로 만들었는데?",
        "W: 최신 판으로. 내 노트북이 지난달에 갱신됐어.",
        "M: 혹시 모르니까 PDF로도 뽑아서 같이 가져와.",
        "W: PDF도 가져갈게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Taeyang, you've been apologizing in every group message."],
        ["M", "I don't want anyone to think I'm demanding."],
        ["W", "What do you apologize for, exactly?"],
        ["M", "Asking when something will be finished, mostly."],
        ["W", "That's the ordinary work of running a project."],
        ["M", "It still feels like I'm pushing people."],
        ["W", "And what happens to the deadlines when you soften the question?"],
        ["M", "People answer later. Sometimes not at all."],
        ["W", "So the apology is costing the team the answer."],
        ["M", "Then how do I ask without sounding harsh?"],
        ["W", "Ask the plain question with a date in it, and no apology."],
      ],
      choices: [
        "I'll ask with a date and no apology.",
        "I'll apologize a bit less often.",
        "Nobody ever answers me.",
        "I never ask about deadlines.",
        "I'd rather someone else asked.",
      ],
      answer: 1,
      clue: "Ask the plain question with a date in it, and no apology.",
      explanation:
        "여자가 사과 없이 날짜를 넣어 그대로 물으라고 했으므로, 그렇게 하겠다는 ①이 가장 자연스럽다.",
      translation: [
        "W: 태양아, 너 모둠 메시지마다 사과를 하더라.",
        "M: 내가 요구가 많다고 여겨지는 게 싫어서.",
        "W: 정확히 뭘 사과하는데?",
        "M: 주로 언제 끝나는지 묻는 걸.",
        "W: 그건 일을 굴리는 평범한 몫이야.",
        "M: 그래도 사람을 몰아붙이는 것 같아.",
        "W: 질문을 부드럽게 하면 마감은 어떻게 돼?",
        "M: 답이 늦게 와. 어떤 땐 아예 안 오고.",
        "W: 그럼 그 사과가 팀에서 답을 앗아 가는 거네.",
        "M: 그럼 모질게 들리지 않게 어떻게 물어?",
        "W: 날짜를 넣어서 그대로 물어. 사과는 빼고.",
        "M: 날짜 넣고 사과 없이 물어볼게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Yerim, you've been carrying every textbook home every night."],
        ["W", "I never know which one I'll want."],
        ["M", "How heavy is the bag?"],
        ["W", "Eleven kilograms. I weighed it out of curiosity."],
        ["M", "And how many do you actually open at home?"],
        ["W", "Two, usually. Sometimes one."],
        ["M", "So nine kilograms travel there and back untouched."],
        ["W", "Said aloud, that's ridiculous."],
        ["M", "Could you decide at the end of the last class?"],
        ["W", "I'd have to think about tomorrow before I leave."],
        ["M", "Look at tomorrow's timetable and take only those two."],
      ],
      choices: [
        "I'll check the timetable before I leave.",
        "I'll keep taking all of them.",
        "My bag weighs almost nothing.",
        "I open every book at home.",
        "I'll buy a second set of books.",
      ],
      answer: 1,
      clue: "Look at tomorrow's timetable and take only those two.",
      explanation:
        "남자가 내일 시간표를 보고 두 권만 챙기라고 했으므로, 나가기 전에 시간표를 보겠다는 ①이 가장 자연스럽다.",
      translation: [
        "M: 예림아, 너 매일 밤 교과서를 전부 집에 들고 가더라.",
        "W: 어떤 게 필요할지 모르니까.",
        "M: 가방이 얼마나 무거워?",
        "W: 11킬로그램. 궁금해서 재 봤어.",
        "M: 집에서 실제로 몇 권 펴?",
        "W: 보통 두 권. 가끔 한 권.",
        "M: 그럼 9킬로그램이 건드려지지도 않고 왕복하는 거네.",
        "W: 소리 내어 말하니 우스꽝스럽다.",
        "M: 마지막 수업 끝나고 정하면 안 돼?",
        "W: 나가기 전에 내일을 생각해 봐야겠네.",
        "M: 내일 시간표를 보고 그 두 권만 챙겨.",
        "W: 나가기 전에 시간표 볼게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Seorin이 Minho에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Seorin : ________________",
      lines: [
        [
          "M",
          "Seorin and Minho are preparing the club's information booth for the school fair. " +
            "Minho has written a long description of everything the club does " +
            "and printed it on one large poster, which reads well and is neatly laid out. " +
            "On Thursday Seorin stands where visitors will walk past " +
            "and finds that the poster takes about two minutes to read, " +
            "while nobody stops at a booth for more than ten seconds. " +
            "The one thing visitors need, the meeting day and room, " +
            "is in the eighth line and nobody reaches it. " +
            "There is a second blank poster board and a marker in the box, " +
            "so a short headline poster could be made in ten minutes. " +
            "She wants to tell him to put the meeting day and room on a big second poster. " +
            "In this situation, what would Seorin most likely say to Minho?",
        ],
      ],
      choices: [
        "We should make the description even longer.",
        "Let's take the poster down completely.",
        "Let's put the meeting day on a big second poster.",
        "We should move the booth to another hall.",
        "Let's read the poster aloud to visitors.",
      ],
      answer: 3,
      clue: "She wants to tell him to put the meeting day and room on a big second poster.",
      explanation:
        "서린이는 모임 요일과 장소를 큰 글씨의 두 번째 포스터에 적자고 말하려 하므로 ③이 가장 적절하다.",
      translation: [
        "M: 서린이와 민호는 학교 축제에 낼 동아리 안내 부스를 준비하고 있습니다. 민호는 동아리가 하는 일을 전부 길게 써서 큰 포스터 한 장에 인쇄했는데, 글은 잘 읽히고 배치도 깔끔합니다. 목요일에 서린이는 방문객이 지나갈 자리에 서 보다가, 그 포스터를 읽는 데 2분쯤 걸린다는 것을 알게 됩니다. 그런데 부스 앞에 10초 넘게 서 있는 사람은 없습니다. 방문객에게 꼭 필요한 한 가지, 곧 모임 요일과 장소는 여덟째 줄에 있고 아무도 거기까지 가지 못합니다. 상자에는 빈 포스터 판 한 장과 매직펜이 있어서, 짧은 큰 글씨 포스터는 10분이면 만들 수 있습니다. 서린이는 모임 요일과 장소를 큰 글씨의 두 번째 포스터에 적자고 말하고 싶습니다. 이런 상황에서 서린이가 민호에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 여자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "Hello, everyone. Today I want to talk about why a road looks wet " +
            "on a hot day when it is perfectly dry. " +
            "Air just above hot tarmac is much warmer than the air a meter higher, " +
            "and warm air bends light differently from cool air. " +
            "Light coming from the sky toward that hot layer is bent upward " +
            "before it ever reaches the ground, " +
            "and it arrives at your eye from below rather than above. " +
            "Your brain assumes light travels straight, " +
            "so it places a patch of sky on the road surface. " +
            "What looks like a puddle is a reflection of the sky " +
            "that never touched the ground at all. " +
            "The same bending explains why a desert horizon can show water that is not there.",
        ],
      ],
      choices: [
        "why hot roads appear to have puddles on them",
        "how tarmac is made to survive summer heat",
        "why deserts receive so little rainfall",
        "how the eye judges the distance of objects",
        "why the sky looks blue in the afternoon",
      ],
      answer: 1,
      clue: "What looks like a puddle is a reflection of the sky that never touched the ground at all.",
      explanation:
        "여자는 뜨거운 공기층이 빛을 휘게 해 하늘이 노면에 비쳐 보이는 것이라고 설명한다. 따라서 답은 ①이다.",
      translation: [
        "W: 안녕하세요, 여러분. 오늘은 완전히 말라 있는 도로가 더운 날에 왜 젖어 보이는지 이야기하려 합니다. 뜨거운 아스팔트 바로 위의 공기는 1미터 위의 공기보다 훨씬 따뜻하고, 따뜻한 공기는 찬 공기와 다르게 빛을 휘게 합니다. 하늘에서 그 뜨거운 층으로 오던 빛은 땅에 닿기도 전에 위로 휘고, 위가 아니라 아래에서 여러분 눈에 도착합니다. 뇌는 빛이 곧게 온다고 가정하기 때문에 하늘 한 조각을 노면에 놓아 버립니다. 웅덩이처럼 보이는 것은 땅에 닿은 적도 없는 하늘의 반사입니다. 같은 휘어짐이 사막의 지평선에 없는 물이 보이는 이유도 설명해 줍니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 내용이 아닌 것은?",
      lines: [
        ["W", "Hello, everyone. Today I want to talk about why a road looks wet on a hot day when it is perfectly dry."],
        ["W", "Air just above hot tarmac is much warmer than the air a meter higher."],
        ["W", "Light coming from the sky toward that hot layer is bent upward before it ever reaches the ground."],
        ["W", "Your brain assumes light travels straight, so it places a patch of sky on the road surface."],
        ["W", "What looks like a puddle is a reflection of the sky that never touched the ground at all."],
        ["W", "The same bending explains why a desert horizon can show water that is not there."],
      ],
      choices: [
        "air above tarmac being warmer than air higher up",
        "light being bent upward before reaching the ground",
        "the brain assuming light travels straight",
        "a desert horizon showing water that is not there",
        "rain cooling the road within minutes",
      ],
      answer: 5,
      clue: "Air just above hot tarmac is much warmer than the air a meter higher.",
      explanation:
        "아스팔트 위 공기가 더 따뜻하다는 것, 빛이 땅에 닿기 전에 위로 휜다는 것, 뇌가 빛이 곧게 온다고 가정한다는 것, 사막 지평선에 없는 물이 보인다는 것은 언급되지만 비가 도로를 금방 식힌다는 것은 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
