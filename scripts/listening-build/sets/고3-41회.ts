/** 고3 듣기 41회 — 사람이 직접 쓴 회차 (2026-09-29) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고3 41회",
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
          "Good afternoon, third year students. This is Mr. Ha from the school office. " +
            "I am speaking about what happens on the morning of the examination. " +
            "The school gate opens at six thirty, an hour earlier than usual. " +
            "Buses will stop at the stadium entrance rather than the front gate, " +
            "because the road outside will be closed to traffic until nine. " +
            "Bring your candidate slip and an identity card, and nothing else that beeps. " +
            "A teacher will be at every corner between the stadium and the school. " +
            "If anything goes wrong on the way, call the office number on your slip. " +
            "Sleep well the night before. Thank you.",
        ],
      ],
      choices: [
        "시험 당일 등교 방법을 안내하려고",
        "시험 날짜 변경을 알리려고",
        "수험표 발급을 안내하려고",
        "도로 공사를 알리려고",
        "졸업식 일정을 알리려고",
      ],
      answer: 1,
      clue: "The school gate opens at six thirty, an hour earlier than usual.",
      explanation:
        "남자는 시험 당일 아침에 문이 열리는 시각과 버스 정차 위치 등을 안내한다. 따라서 답은 ①이다.",
      translation: [
        "M: 3학년 여러분, 안녕하세요. 행정실 하 선생님입니다. 시험 당일 아침에 어떻게 되는지 말씀드립니다. 학교 정문은 평소보다 한 시간 이른 6시 30분에 엽니다. 버스는 정문이 아니라 경기장 입구에 섭니다. 바깥 도로가 아홉 시까지 통제되기 때문입니다. 수험표와 신분증을 가져오고, 소리 나는 것은 아무것도 가져오지 마세요. 경기장에서 학교까지 길목마다 선생님이 서 계십니다. 오는 길에 무슨 일이 생기면 수험표에 적힌 행정실 번호로 전화하세요. 전날 밤에 잘 자기 바랍니다. 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 여자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Seoyun, I've been redoing every question I got wrong this year."],
        ["W", "All of them? How many is that?"],
        ["M", "Six hundred or so, going back to March."],
        ["W", "And how many of those would you still get wrong?"],
        ["M", "Most of the March ones are easy for me now."],
        ["W", "Then you're spending November proving you improved."],
        ["M", "It does feel good to get them right."],
        ["W", "Feeling good is not the same as learning something."],
        ["M", "So which ones should I redo?"],
        ["W", "Only the ones you would still get wrong today."],
        ["M", "That might be sixty rather than six hundred."],
        ["W", "And sixty done properly is worth more than six hundred skimmed."],
      ],
      choices: [
        "틀린 문제는 모두 다시 풀어야 한다",
        "지금도 틀릴 문제만 골라 풀어야 한다",
        "새 문제를 풀어야 한다",
        "오답을 기록해 두어야 한다",
        "시간을 재고 풀어야 한다",
      ],
      answer: 2,
      clue: "Only the ones you would still get wrong today.",
      explanation:
        "여자는 지금도 틀릴 문제만 골라 제대로 풀라고 말한다. 따라서 답은 ②이다.",
      translation: [
        "M: 서윤아, 올해 틀린 문제를 전부 다시 풀고 있어.",
        "W: 전부? 몇 개나 되는데?",
        "M: 3월까지 거슬러 육백 개쯤.",
        "W: 그중에 지금도 틀릴 문제는 몇 개야?",
        "M: 3월 것들은 대부분 이제 쉬워.",
        "W: 그럼 11월을 네가 늘었다는 걸 증명하는 데 쓰고 있는 거야.",
        "M: 맞히면 기분이 좋긴 해.",
        "W: 기분이 좋은 것과 배우는 건 달라.",
        "M: 그럼 어떤 걸 다시 풀어야 해?",
        "W: 오늘도 틀릴 것들만.",
        "M: 그럼 육백 개가 아니라 예순 개쯤 되겠네.",
        "W: 제대로 푼 예순 개가 훑어본 육백 개보다 값져.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "On the last evening before an examination, " +
            "almost everyone opens a book and looks for something new. " +
            "Nothing learned that night will be there in the morning, " +
            "and the search itself does real harm. " +
            "Every unfamiliar page you meet at eleven o'clock " +
            "tells you how much you do not know, hours before you can do anything about it. " +
            "Read what you already know instead. " +
            "The evening's job is not to add. It is to arrive tomorrow believing you are ready.",
        ],
      ],
      choices: [
        "시험 전날에는 새 내용을 보지 말아야 한다",
        "시험 전날 일찍 자야 한다",
        "시험 전날 문제를 많이 풀어야 한다",
        "시험 전날 친구와 확인해야 한다",
        "시험 전날 짐을 미리 싸야 한다",
      ],
      answer: 1,
      clue: "Read what you already know instead.",
      explanation:
        "남자는 시험 전날 밤에 새 내용을 찾지 말고 아는 것을 보라고 말한다. 따라서 답은 ①이다.",
      translation: [
        "M: 시험 전날 저녁이면 거의 모두가 책을 펴고 새로운 것을 찾습니다. 그날 밤에 배운 것은 아침이면 남아 있지 않고, 그 찾는 일 자체가 해를 끼칩니다. 열한 시에 만나는 낯선 쪽 하나하나가, 손쓸 수 없는 시각에 여러분이 얼마나 모르는지를 알려 줍니다. 대신 이미 아는 것을 읽으세요. 그 저녁이 할 일은 보태는 것이 아닙니다. 준비됐다고 믿으며 내일에 닿는 것입니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["W", "Taemin, is this the hall set up for the ceremony?"],
        ["M", "Yes, they finished it yesterday evening."],
        ["W", "A wide stage stands at the far end of the room."],
        ["M", "The speeches are given from the left side of it."],
        ["W", "There's a long banner hanging above the stage."],
        ["M", "The art club painted it over two weekends."],
        ["W", "Two flower stands are placed in front of the stage."],
        ["M", "Three, actually. The third arrived this morning."],
        ["W", "A piano stands in the right corner."],
        ["M", "It was tuned on Monday for the choir."],
        ["W", "And rows of chairs fill the middle of the hall."],
        ["M", "Eleven rows, one for each class."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "Three, actually. The third arrived this morning.",
      explanation:
        "여자가 꽃꽂이대가 두 개라고 하자 남자가 세 개라고 바로잡는다. 그림에는 두 개가 그려져 있으므로 답은 ③이다.",
      figure: {
        kind: "figure5",
        spots: [
          [0.5, 0.3],
          [0.5, 0.07],
          [0.34, 0.5],
          [0.88, 0.36],
          [0.46, 0.8],
        ],
        scene:
          "A school hall set up for a ceremony, drawn as one wide picture, clean black line art on white, no writing or letters or numbers anywhere. " +
          "A WIDE STAGE stands at the FAR END of the room in the upper middle. " +
          "A LONG BLANK BANNER hangs on the wall above the stage. " +
          "EXACTLY TWO FLOWER STANDS, each a tall stand holding flowers, stand on the floor in front of the stage, " +
          "clearly separated with a wide gap between them so both can be counted. " +
          "A PIANO stands in the RIGHT corner beside the stage. " +
          "ROWS OF CHAIRS fill the MIDDLE of the hall in front of the stage.",
      },
      translation: [
        "W: 태민아, 여기가 식을 위해 꾸민 강당이야?",
        "M: 응, 어제저녁에 다 끝냈어.",
        "W: 저쪽 끝에 넓은 무대가 있네.",
        "M: 연설은 무대 왼쪽에서 해.",
        "W: 무대 위에는 긴 현수막이 걸려 있고.",
        "M: 미술 동아리가 두 주말에 걸쳐 그렸어.",
        "W: 무대 앞에는 꽃꽂이대가 두 개 놓여 있네.",
        "M: 사실 세 개야. 세 번째는 오늘 아침에 왔어.",
        "W: 오른쪽 구석에는 피아노가 있어.",
        "M: 합창단 때문에 월요일에 조율했어.",
        "W: 그리고 강당 가운데를 의자 줄이 채우고 있네.",
        "M: 열한 줄. 반마다 한 줄씩.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 여자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Naeun, the graduation ceremony is on Friday morning."],
        ["W", "Has the hall been fully set up?"],
        ["M", "The stage, the chairs and the banner are all done."],
        ["W", "What about the certificates?"],
        ["M", "They arrived on Tuesday, in class order."],
        ["W", "Then the main pieces are ready."],
        ["M", "Except the music. Nobody has chosen what plays as people enter."],
        ["W", "Is there not a list from last year?"],
        ["M", "There is, and the choir is singing two of those pieces this year."],
        ["W", "So we can't play them beforehand as well."],
        ["M", "And somebody has to pick three others by tomorrow."],
        ["W", "I'll choose the entrance music this evening."],
      ],
      choices: [
        "무대를 꾸미기",
        "졸업장을 정리하기",
        "입장 음악을 고르기",
        "의자를 놓기",
        "합창단에 연락하기",
      ],
      answer: 3,
      clue: "I'll choose the entrance music this evening.",
      explanation:
        "여자는 오늘 저녁에 입장 음악을 고르겠다고 말한다. 따라서 답은 ③이다.",
      translation: [
        "M: 나은아, 졸업식이 금요일 아침이야.",
        "W: 강당은 다 꾸며졌어?",
        "M: 무대, 의자, 현수막은 다 됐어.",
        "W: 졸업장은?",
        "M: 화요일에 반 순서대로 왔어.",
        "W: 그럼 큰 건 다 됐네.",
        "M: 음악만 빼고. 입장할 때 틀 곡을 아무도 안 골랐어.",
        "W: 작년 목록 없어?",
        "M: 있는데 올해는 합창단이 그중 두 곡을 불러.",
        "W: 그럼 미리 틀 수는 없겠네.",
        "M: 그래서 내일까지 누가 세 곡을 골라야 해.",
        "W: 오늘 저녁에 입장 음악 고를게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 남자가 지불할 금액을 고르시오.",
      lines: [
        ["W", "Good morning. Are you here about the graduation banner?"],
        ["M", "Yes, we need one for the hall on Friday."],
        ["W", "How wide does it need to be?"],
        ["M", "Six metres, to reach across the stage."],
        ["W", "A six metre banner is seventy dollars."],
        ["M", "Do we pay more for the eyelets?"],
        ["W", "Eyelets are eight dollars for the whole banner."],
        ["M", "We'll need those, since it hangs from hooks."],
        ["W", "Would you like it delivered to the school?"],
        ["M", "No, we'll collect it on Thursday afternoon."],
        ["W", "Then I can take ten dollars off for collection."],
        ["M", "Here is the school card, then."],
      ],
      choices: ["$68", "$78", "$70", "$60", "$88"],
      answer: 1,
      clue: "A six metre banner is seventy dollars.",
      explanation:
        "6미터 현수막 70달러에 고리 8달러를 더하면 78달러이고, 직접 찾아가 10달러를 빼면 68달러이다. 따라서 답은 ①이다.",
      translation: [
        "W: 안녕하세요. 졸업식 현수막 때문에 오셨나요?",
        "M: 네, 금요일 강당에 걸 게 하나 필요해요.",
        "W: 폭이 얼마나 되어야 하나요?",
        "M: 6미터요. 무대를 가로질러야 해요.",
        "W: 6미터 현수막은 70달러입니다.",
        "M: 고리는 돈을 더 내야 하나요?",
        "W: 고리는 현수막 전체에 8달러입니다.",
        "M: 갈고리에 거는 거라 필요해요.",
        "W: 학교로 배달해 드릴까요?",
        "M: 아니요, 목요일 오후에 직접 찾아갈게요.",
        "W: 그러시면 10달러를 빼 드릴 수 있습니다.",
        "M: 그럼 여기 학교 카드요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 여자가 졸업 앨범 사진을 다시 찍는 이유를 고르시오.",
      lines: [
        ["M", "Chaewon, you're having your yearbook photo taken again?"],
        ["W", "On Thursday, at the same time as the first one."],
        ["M", "Did you not like how you looked in it?"],
        ["W", "The photograph itself was fine."],
        ["M", "Then was the light wrong that day?"],
        ["W", "No, my name was printed under somebody else's face."],
        ["M", "They mixed up two photographs?"],
        ["W", "Three, in the same row, and mine was one of them."],
        ["M", "Can't they simply move the names?"],
        ["W", "The file was lost, so all three are being taken again."],
      ],
      choices: [
        "사진이 마음에 안 들어서",
        "빛이 잘못되어서",
        "사진 파일이 사라져서",
        "옷을 잘못 입어서",
        "그날 학교에 못 와서",
      ],
      answer: 3,
      clue: "The file was lost, so all three are being taken again.",
      explanation:
        "여자는 사진 파일이 사라져서 다시 찍는다고 말한다. 따라서 답은 ③이다.",
      translation: [
        "M: 채원아, 졸업 앨범 사진을 다시 찍어?",
        "W: 목요일에. 처음 찍었던 시간과 같은 때에.",
        "M: 나온 모습이 마음에 안 들었어?",
        "W: 사진 자체는 괜찮았어.",
        "M: 그럼 그날 빛이 잘못됐어?",
        "W: 아니, 내 이름이 다른 사람 얼굴 밑에 찍혔어.",
        "M: 사진 두 장이 바뀐 거야?",
        "W: 같은 줄에서 세 장. 내 것도 그중 하나였어.",
        "M: 이름만 옮기면 안 돼?",
        "W: 파일이 사라져서 세 장 다 다시 찍어.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 교내 졸업식에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["M", "Seoyeon, what time does the graduation ceremony start on Friday?"],
        ["W", "At ten, and students come in from nine thirty."],
        ["M", "Do we sit with our own class or wherever we like?"],
        ["W", "With your class, in the row with your class number on it."],
        ["M", "That will make finding a seat much easier."],
        ["W", "It took twenty minutes last year without the numbers."],
        ["M", "Where is the ceremony held this year?"],
        ["W", "In the main hall, with the families upstairs."],
        ["M", "How long does the whole thing take?"],
        ["W", "About ninety minutes, including the choir."],
        ["M", "What are we supposed to wear?"],
        ["W", "School uniform with the jacket, as at the photo day."],
        ["M", "Do we take the certificates home ourselves?"],
        ["W", "Each class receives them from the homeroom teacher afterwards."],
        ["M", "Then I'll bring a bag big enough for it."],
      ],
      choices: ["시작 시각", "행사가 열리는 곳", "행사 시간의 길이", "입어야 할 옷", "가족이 앉는 자리 예약 방법"],
      answer: 5,
      clue: "At ten, and students come in from nine thirty.",
      explanation:
        "시작 시각, 장소, 소요 시간, 복장은 말했지만 가족 좌석 예약 방법은 말하지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 서연아, 금요일 졸업식 몇 시에 시작해?",
        "W: 열 시에. 학생은 9시 30분부터 들어가.",
        "M: 반별로 앉아, 아무 데나 앉아?",
        "W: 반별로. 반 번호가 적힌 줄에 앉아.",
        "M: 자리 찾기가 훨씬 쉽겠다.",
        "W: 작년엔 번호가 없어서 20분 걸렸어.",
        "M: 올해 졸업식은 어디서 해?",
        "W: 대강당에서. 가족은 위층에 앉아.",
        "M: 전체가 얼마나 걸려?",
        "W: 합창까지 해서 90분쯤.",
        "M: 뭘 입어야 해?",
        "W: 사진 찍던 날처럼 교복에 재킷.",
        "M: 졸업장은 각자 들고 가?",
        "W: 끝나고 반마다 담임 선생님께 받아.",
        "M: 그럼 들어갈 만한 가방을 가져가야겠다.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Saetbyeol University Winter School에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "W",
          "Here is some information about the Saetbyeol University Winter School. " +
            "The programme runs for two weeks in the middle of January. " +
            "It is open to students who have finished their final year of high school. " +
            "Classes are held from ten until four, Monday to Friday. " +
            "Participants live in the university residence at no cost. " +
            "Meals are not included, but the dining hall is open to everyone. " +
            "Applications are made online and close at the end of December. " +
            "Places are given out in the order the applications arrive.",
        ],
      ],
      choices: [
        "1월 중순에 두 주 동안 진행된다",
        "고등학교를 마친 학생이 대상이다",
        "수업은 월요일부터 금요일까지 있다",
        "기숙사 비용을 내야 한다",
        "신청은 12월 말에 마감한다",
      ],
      answer: 4,
      clue: "Participants live in the university residence at no cost.",
      explanation:
        "기숙사는 비용 없이 쓸 수 있다고 했으므로 ④가 일치하지 않는다.",
      translation: [
        "W: 샛별대학교 겨울 학교에 대해 알려 드립니다. 이 과정은 1월 중순에 두 주 동안 진행됩니다. 고등학교 마지막 학년을 마친 학생이 참여할 수 있습니다. 수업은 월요일부터 금요일까지 열 시부터 네 시까지 있습니다. 참가자는 대학 기숙사에서 비용 없이 지냅니다. 식사는 포함되지 않지만 식당은 누구나 이용할 수 있습니다. 신청은 인터넷으로 하며 12월 말에 마감합니다. 자리는 신청이 들어온 순서대로 드립니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 신청할 겨울 프로그램을 고르시오.",
      lines: [
        ["M", "Hayoon, five winter programmes are taking applications."],
        ["W", "We said we'd choose one before graduation."],
        ["M", "Then let's settle it now. How long can you go for?"],
        ["W", "Two weeks at most. Three would clash with the family trip."],
        ["M", "Two of these run for three weeks."],
        ["W", "Then they're out. Do any of them include the residence?"],
        ["M", "Two of the three left do."],
        ["W", "We can't travel there every morning, so that matters."],
        ["M", "And the fee? We agreed on under three hundred thousand."],
        ["W", "One of the last two is three hundred and fifty."],
        ["M", "So there's only one programme for us."],
        ["W", "I'll send both applications tonight."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 2,
      clue: "Two weeks at most. Three would clash with the family trip.",
      explanation:
        "2주 이하, 기숙사 포함, 30만 원 미만인 것을 고른다. 세 조건을 모두 채우는 것은 ②이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Length: 3 weeks / Residence: Yes / Fee: 250,000 won" },
          { no: 2, label: "②", value: "Length: 2 weeks / Residence: Yes / Fee: 280,000 won" },
          { no: 3, label: "③", value: "Length: 2 weeks / Residence: No / Fee: 200,000 won" },
          { no: 4, label: "④", value: "Length: 2 weeks / Residence: Yes / Fee: 350,000 won" },
          { no: 5, label: "⑤", value: "Length: 3 weeks / Residence: No / Fee: 180,000 won" },
        ],
      },
      translation: [
        "M: 하윤아, 겨울 프로그램 다섯 개가 신청을 받고 있어.",
        "W: 졸업 전에 하나 고르기로 했잖아.",
        "M: 그럼 지금 정하자. 며칠까지 갈 수 있어?",
        "W: 많아야 2주. 3주면 가족 여행이랑 겹쳐.",
        "M: 두 개는 3주야.",
        "W: 그럼 빠지네. 기숙사가 포함된 데 있어?",
        "M: 남은 셋 중 둘에 있어.",
        "W: 매일 아침 거기까지 갈 수는 없으니 그게 중요해.",
        "M: 비용은? 30만 원 아래로 하기로 했잖아.",
        "W: 남은 둘 중 하나는 35만 원이야.",
        "M: 그럼 우리한테 맞는 건 하나뿐이네.",
        "W: 오늘 밤에 둘 다 신청서 보낼게.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Dain, did you collect your certificate of attendance?"],
        ["W", "Not yet. I've been meaning to go all week."],
        ["M", "The office keeps them until Friday only."],
        ["W", "Do I need anything to collect it?"],
        ["M", "Just your student card."],
      ],
      choices: [
        "I already collected it.",
        "Then I'll go after this class.",
        "The office is closed.",
        "You should collect yours.",
        "I lost my student card.",
      ],
      answer: 2,
      clue: "Just your student card.",
      explanation:
        "학생증만 있으면 된다고 알려 주었으므로, 수업 뒤에 가겠다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 다인아, 출석 확인서 받아 왔어?",
        "W: 아직. 일주일 내내 가려고만 했어.",
        "M: 행정실이 금요일까지만 보관해.",
        "W: 받으려면 뭐가 필요해?",
        "M: 학생증만 있으면 돼.",
        "W: 그럼 이 수업 끝나고 갈게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Junho, are you coming to the hall after lunch?"],
        ["M", "I was going to stay in the classroom."],
        ["W", "We need four people to move the flower stands."],
        ["M", "Where are they going?"],
        ["W", "From the entrance to the front of the stage."],
      ],
      choices: [
        "I'm busy all afternoon.",
        "All right, I'll come at one.",
        "The stands are too heavy.",
        "You should ask the teacher.",
        "The hall is locked today.",
      ],
      answer: 2,
      clue: "From the entrance to the front of the stage.",
      explanation:
        "옮길 곳을 말해 주었으므로, 한 시에 가겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 준호야, 점심 먹고 강당에 올래?",
        "M: 교실에 있으려고 했는데.",
        "W: 꽃꽂이대 옮길 사람 네 명이 필요해.",
        "M: 어디로 옮기는데?",
        "W: 입구에서 무대 앞으로.",
        "M: 알겠어, 한 시에 갈게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Sangwoo, how are you feeling about next week?"],
        ["M", "I keep imagining the moment I open the paper."],
        ["W", "And what happens in that imagined moment?"],
        ["M", "I read the first question and nothing comes."],
        ["W", "Have you ever actually had that happen?"],
        ["M", "Not once, in three years of tests."],
        ["W", "So you're rehearsing something that has never occurred."],
        ["M", "Put like that, it sounds like a waste of an evening."],
        ["W", "Rehearse the real first minute instead."],
        ["M", "What do you mean by the real one?"],
        ["W", "Write your number, read the instructions, turn to question one."],
      ],
      choices: [
        "I never take tests.",
        "That's something I can practise, I'll do it.",
        "The paper is always blank.",
        "I don't have a number.",
        "You should open the paper for me.",
      ],
      answer: 2,
      clue: "Write your number, read the instructions, turn to question one.",
      explanation:
        "실제 첫 1분을 연습하라는 조언이므로, 연습할 수 있겠다며 하겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 상우야, 다음 주 생각하면 어때?",
        "M: 시험지를 펴는 순간이 자꾸 떠올라.",
        "W: 그 상상 속에서는 무슨 일이 일어나?",
        "M: 첫 문제를 읽는데 아무것도 안 떠올라.",
        "W: 실제로 그런 적이 있었어?",
        "M: 3년 동안 시험 보면서 한 번도 없었어.",
        "W: 그럼 한 번도 일어난 적 없는 일을 연습하고 있는 거네.",
        "M: 그렇게 말하니 저녁을 버리는 것 같네.",
        "W: 대신 진짜 첫 1분을 연습해.",
        "M: 진짜라는 게 무슨 뜻이야?",
        "W: 번호를 쓰고, 지시문을 읽고, 1번으로 넘기는 것.",
        "M: 그건 연습할 수 있겠다, 해 볼게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Chaeyeon, you've been writing to your teacher every term."],
        ["W", "One letter at the end of each one, since first year."],
        ["M", "What do you write about?"],
        ["W", "One thing from that term that I would not have managed alone."],
        ["M", "Does she reply to them?"],
        ["W", "Every time, on the back of the same page."],
        ["M", "So you have six letters and six replies."],
        ["W", "In one envelope, which I'll take to graduation."],
        ["M", "That's a better record than any photograph."],
        ["W", "And it cost six evenings over three years."],
        ["M", "Could you show me one of them?"],
      ],
      choices: [
        "Sure, I'll bring the envelope tomorrow.",
        "I stopped writing last year.",
        "She never replies to me.",
        "You can't read my writing.",
        "I threw them all away.",
      ],
      answer: 1,
      clue: "Could you show me one of them?",
      explanation:
        "남자가 편지를 보여 달라고 했으므로, 내일 봉투를 가져오겠다는 ①이 가장 자연스럽다.",
      translation: [
        "M: 채연아, 학기마다 선생님께 편지를 쓴다며.",
        "W: 1학년 때부터 학기가 끝날 때마다 한 통씩.",
        "M: 뭘 써?",
        "W: 그 학기에 혼자서는 못 했을 일 하나.",
        "M: 선생님이 답장하셔?",
        "W: 매번. 같은 종이 뒷면에.",
        "M: 그럼 편지 여섯 통에 답장 여섯 통이네.",
        "W: 봉투 하나에 담아서 졸업식에 가져갈 거야.",
        "M: 어떤 사진보다 나은 기록이네.",
        "W: 3년 동안 저녁 여섯 번이면 됐어.",
        "M: 하나만 보여 줄래?",
        "W: 그럼, 내일 봉투 가져올게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Kiyoung이 Seoyun에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Kiyoung : ________________",
      lines: [
        [
          "M",
          "Kiyoung and Seoyun are preparing the graduation day slideshow. " +
            "It will play on the hall screen while families are taking their seats. " +
            "Seoyun has included eleven photographs from every class, which is fair. " +
            "Kiyoung checks the running time and finds it lasts thirty-four minutes. " +
            "Families are seated in about twelve minutes on a normal year. " +
            "Two thirds of the pictures would never be seen by anybody. " +
            "He wants her to cut it to roughly ten minutes and repeat it. " +
            "In this situation, what would Kiyoung most likely say to Seoyun?",
        ],
      ],
      choices: [
        "Let's show it after the ceremony instead.",
        "We need photographs from more classes.",
        "Cut it to ten minutes and loop it.",
        "I'll take new photographs today.",
        "Thirty-four minutes is too short.",
      ],
      answer: 3,
      clue: "He wants her to cut it to roughly ten minutes and repeat it.",
      explanation:
        "입장 시간이 12분이므로 10분으로 줄여 되풀이하자는 ③이 가장 적절하다.",
      translation: [
        "M: 기영이와 서윤이는 졸업식 날 사진 영상을 준비하고 있습니다. 그 영상은 가족들이 자리에 앉는 동안 강당 화면에 나옵니다. 서윤이는 반마다 열한 장씩 넣었고 그것은 공평합니다. 기영이가 재생 시간을 확인해 보니 34분입니다. 보통 해에는 가족들이 12분쯤이면 다 앉습니다. 그러면 사진의 3분의 2는 아무도 보지 못합니다. 기영이는 10분쯤으로 줄여 되풀이해 틀기를 바랍니다. 이런 상황에서 기영이가 서윤이에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 여자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "Hello, everyone. Today I want to explain why we remember the beginning " +
            "and the end of a list far better than the middle. " +
            "The first items are remembered because they arrived in an empty mind " +
            "and had time to be repeated while the rest were still coming. " +
            "The last items are remembered because they are still echoing " +
            "in the short store when you are asked to recall. " +
            "The middle has neither advantage. " +
            "It arrived into a head already full and was pushed out before you were asked. " +
            "This is why the third of five points in a speech disappears, " +
            "and why a revision session should not put the hardest topic in the middle.",
        ],
      ],
      choices: [
        "how lists are organised in a book",
        "why the middle of a list is forgotten",
        "how speeches should be timed",
        "why repetition helps memory",
        "how the brain stores images",
      ],
      answer: 2,
      clue: "The middle has neither advantage.",
      explanation:
        "여자는 목록의 처음과 끝은 기억되지만 가운데는 두 이점이 모두 없어 잊힌다고 설명한다. 따라서 답은 ②이다.",
      translation: [
        "W: 안녕하세요, 여러분. 오늘은 목록의 처음과 끝을 가운데보다 훨씬 잘 기억하는 까닭을 설명하려 합니다. 앞의 항목들은 비어 있던 머리에 들어왔고, 나머지가 들어오는 동안 되풀이될 시간이 있었기에 기억됩니다. 마지막 항목들은 떠올려 보라고 할 때까지 짧은 저장고에서 아직 울리고 있기에 기억됩니다. 가운데는 두 이점이 모두 없습니다. 이미 꽉 찬 머리에 들어왔고, 물어보기도 전에 밀려났습니다. 그래서 연설의 다섯 가지 요점 중 세 번째가 사라지고, 복습할 때 가장 어려운 주제를 가운데에 두면 안 되는 것입니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 내용이 아닌 것은?",
      lines: [
        ["W", "Today I want to explain why we remember the beginning and the end of a list."],
        ["W", "The first items arrived in an empty mind and had time to be repeated."],
        ["W", "The last items are still echoing in the short store."],
        ["W", "The middle arrived into a head already full."],
        ["W", "The third of five points in a speech disappears."],
      ],
      choices: [
        "the first items arriving in an empty mind",
        "the last items still echoing in the short store",
        "the middle arriving into a full head",
        "the third of five points disappearing",
        "the number of words a person can say a minute",
      ],
      answer: 5,
      clue: "The first items arrived in an empty mind and had time to be repeated.",
      explanation:
        "비어 있던 머리에 들어온 앞 항목, 아직 울리는 마지막 항목, 꽉 찬 머리에 들어온 가운데, 사라지는 세 번째 요점은 언급되지만 1분에 말할 수 있는 낱말 수는 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
