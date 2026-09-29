/** 고2 듣기 47회 — 사람이 직접 쓴 회차 (2026-09-29) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고2 47회",
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
          "Good morning, students. This is the school office speaking. " +
            "For several years the morning bus has arrived at three different times, " +
            "depending on traffic at the bridge near the market. " +
            "Students who live in the east village have waited up to twenty minutes " +
            "in the cold with no way of knowing when it would come. " +
            "From next Monday the driver will send a short message " +
            "to the school account the moment he leaves the terminal. " +
            "That message appears on the screen beside the front gate, " +
            "and also on the notice channel your homeroom teacher gave you. " +
            "You will know within a minute or two when to leave the house. " +
            "The bus route and the fare do not change at all.",
        ],
      ],
      choices: [
        "통학 버스 도착 알림이 생긴다고 알리려고",
        "버스 노선이 바뀐다고 알리려고",
        "버스 요금 변경을 알리려고",
        "등교 시간 변경을 알리려고",
        "정문 공사를 안내하려고",
      ],
      answer: 1,
      clue: "the driver will send a short message",
      explanation:
        "버스가 출발하면 알림이 오도록 바뀐다고 알리고 있다. 따라서 답은 ①이다.",
      translation: [
        "M: 학생 여러분, 안녕하세요. 학교 행정실입니다. 여러 해 동안 아침 버스는 시장 근처 다리의 차량 사정에 따라 세 가지 시각에 도착해 왔습니다. 동쪽 마을에 사는 학생들은 언제 올지 알 길 없이 추위 속에서 20분까지 기다리기도 했습니다. 다음 주 월요일부터 기사님이 차고에서 출발하는 순간 학교 계정으로 짧은 알림을 보냅니다. 그 알림은 정문 옆 화면에 뜨고, 담임 선생님이 알려 주신 알림 창구에도 올라갑니다. 집을 나설 때를 1~2분 안에 아실 수 있습니다. 버스 노선과 요금은 전혀 바뀌지 않습니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 여자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Nari, you always hand in a draft nobody else has seen."],
        ["W", "I show it to one person before the teacher."],
        ["M", "Doesn't that just delay handing it in?"],
        ["W", "It costs one evening and saves the whole grade."],
        ["M", "But you know your own writing better than anyone."],
        ["W", "That's exactly the problem with reading it myself."],
        ["M", "How do you mean?"],
        ["W", "I read what I meant, not what I actually wrote."],
        ["M", "So the missing sentence is invisible to you."],
        ["W", "Invisible, because my head fills the gap automatically."],
        ["M", "And a stranger falls straight into it."],
        ["W", "Only a reader who isn't you can find what isn't there."],
        ["M", "I'll show mine to someone tonight."],
      ],
      choices: [
        "자기 글은 남이 읽어야 빠진 곳이 보인다",
        "초고는 여러 번 고쳐야 한다",
        "글은 미리 써 두어야 한다",
        "선생님께 먼저 물어봐야 한다",
        "글을 소리 내어 읽어야 한다",
      ],
      answer: 1,
      clue: "Only a reader who isn't you can find what isn't there.",
      explanation:
        "여자는 남이 읽어야 빠진 곳이 보인다고 말한다. 따라서 답은 ①이다.",
      translation: [
        "M: 나리야, 너는 늘 아무도 안 본 초고를 내지 않더라.",
        "W: 선생님께 내기 전에 한 사람한테 보여 줘.",
        "M: 그러면 내는 게 늦어지기만 하지 않아?",
        "W: 저녁 하루가 들고 성적 전체를 건져.",
        "M: 그래도 네 글은 네가 제일 잘 알잖아.",
        "W: 내가 직접 읽는 게 바로 그래서 문제야.",
        "M: 무슨 뜻이야?",
        "W: 나는 실제로 쓴 것이 아니라 쓰려던 것을 읽어.",
        "M: 그럼 빠진 문장이 너한테는 안 보이겠네.",
        "W: 안 보여. 머리가 알아서 빈칸을 메우니까.",
        "M: 그리고 낯선 사람은 그 빈칸에 그대로 빠지고.",
        "W: 내가 아닌 독자만이 없는 것을 찾아낼 수 있어.",
        "M: 오늘 밤에 내 것도 누구한테 보여 줄게.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "When something takes longer than we expected, we blame the task. " +
            "In truth we usually estimated the work and forgot the edges. " +
            "Writing a report is not only the writing; " +
            "it is finding the file, remembering where you stopped, " +
            "opening four things you closed the night before. " +
            "Each of those costs a few minutes and none of them is in the plan. " +
            "This is why three half-hour sessions do less than one full hour. " +
            "So when you must estimate, do not ask how long the work takes. " +
            "Ask how many times you will have to start it.",
        ],
      ],
      choices: [
        "일을 여러 번 시작할수록 시간이 더 든다",
        "계획은 넉넉하게 세워야 한다",
        "일은 작게 나눠야 한다",
        "집중 시간을 늘려야 한다",
        "마감을 미리 정해야 한다",
      ],
      answer: 1,
      clue: "Ask how many times you will have to start it.",
      explanation:
        "다시 시작하는 횟수가 시간을 잡아먹는다고 말한다. 따라서 답은 ①이다.",
      translation: [
        "M: 어떤 일이 생각보다 오래 걸리면 우리는 그 일을 탓합니다. 사실은 일을 어림하면서 가장자리를 잊은 것입니다. 보고서를 쓰는 일은 쓰는 것만이 아닙니다. 파일을 찾고, 어디서 멈췄는지 떠올리고, 어젯밤에 닫은 네 가지를 다시 여는 일이기도 합니다. 그 하나하나가 몇 분씩 들고, 어느 것도 계획에는 없습니다. 그래서 30분짜리 세 번이 한 시간 한 번보다 덜 해냅니다. 그러니 어림을 해야 할 때는 그 일이 얼마나 걸리는지 묻지 마십시오. 그 일을 몇 번이나 다시 시작하게 될지 물으십시오.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["W", "Seongho, is this the photo of the club's workshop?"],
        ["M", "Yes, we cleared it out over the holiday."],
        ["W", "There's a wide workbench under the window."],
        ["M", "Three people can work along it at once."],
        ["W", "And a pegboard of tools hangs on the right wall."],
        ["M", "Every tool has its own outline drawn behind it."],
        ["W", "I see two stools pushed under the bench."],
        ["M", "Three stools, actually. One is behind the bin."],
        ["W", "There's a lamp clamped to the edge of the bench."],
        ["M", "It bends wherever we need the light."],
        ["W", "And a broom leans in the corner."],
        ["M", "Whoever finishes last sweeps up."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "Three stools, actually. One is behind the bin.",
      explanation:
        "의자가 두 개라고 했지만 세 개라고 했다. 따라서 답은 ③이다.",
      figure: {
        kind: "figure5",
        scene:
          "A small school workshop room, clean black line art on a plain white background, no writing or letters anywhere. " +
          "A WIDE WORKBENCH stands under the window. " +
          "A PEGBOARD covered with hanging tools is fixed to the right wall. " +
          "TWO STOOLS are pushed under the workbench. " +
          "A CLAMP LAMP is fixed to the edge of the bench. " +
          "A BROOM leans in the corner.",
        spots: [
          [0.45, 0.55],
          [0.87, 0.35],
          [0.4, 0.8],
          [0.22, 0.42],
          [0.1, 0.72],
        ],
      },
      translation: [
        "W: 성호야, 이게 동아리 작업실 사진이야?",
        "M: 응, 연휴 동안 싹 치웠어.",
        "W: 창문 아래에 넓은 작업대가 있네.",
        "M: 세 명이 나란히 붙어서 할 수 있어.",
        "W: 그리고 오른쪽 벽에 연장 걸이판이 걸려 있고.",
        "M: 연장마다 뒤에 자기 자리 윤곽이 그려져 있어.",
        "W: 작업대 밑에 의자 두 개가 들어가 있는 게 보여.",
        "M: 사실 세 개야. 하나가 쓰레기통 뒤에 있어.",
        "W: 작업대 가장자리에 집게 등이 물려 있네.",
        "M: 필요한 쪽으로 구부려 쓸 수 있어.",
        "W: 그리고 구석에 빗자루가 세워져 있고.",
        "M: 마지막에 끝나는 사람이 쓸어.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 여자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Dahye, the class photo exhibition opens in an hour."],
        ["W", "The photographs are hung and the captions are typed."],
        ["M", "Did anyone print the captions and cut them out?"],
        ["W", "I typed them but the file is still on my laptop."],
        ["M", "Without captions nobody knows who took what."],
        ["W", "The printer in the computer room is free now."],
        ["M", "The computer room closes at four on Fridays."],
        ["W", "It's twenty to four right now."],
        ["M", "Then someone has to go straight away."],
        ["W", "I have the laptop with me in my bag."],
        ["M", "I'll keep taping the photographs straight."],
        ["W", "I'll go and print the captions."],
      ],
      choices: [
        "사진을 걸기",
        "사진을 찍기",
        "설명을 출력하기",
        "컴퓨터를 고치기",
        "손님을 맞이하기",
      ],
      answer: 3,
      clue: "I'll go and print the captions.",
      explanation:
        "여자는 컴퓨터실에서 사진 설명을 출력하겠다고 했다. 따라서 답은 ③이다.",
      translation: [
        "M: 다혜야, 학급 사진전이 한 시간 뒤에 열어.",
        "W: 사진은 걸었고 설명도 다 쳐 놨어.",
        "M: 설명은 출력해서 오렸어?",
        "W: 치기만 하고 파일이 아직 내 노트북에 있어.",
        "M: 설명이 없으면 누가 찍은 건지 아무도 몰라.",
        "W: 지금 컴퓨터실 인쇄기가 비어 있어.",
        "M: 컴퓨터실은 금요일에 네 시에 닫아.",
        "W: 지금 네 시 20분 전이야.",
        "M: 그럼 누가 지금 바로 가야 해.",
        "W: 노트북은 내 가방에 있어.",
        "M: 나는 사진 반듯하게 붙이는 걸 계속할게.",
        "W: 내가 가서 설명을 출력할게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 남자가 지불할 금액을 고르시오.",
      lines: [
        ["W", "Welcome to the bookshop. Are you looking for anything?"],
        ["M", "Two workbooks and three sets of index cards."],
        ["W", "The workbooks are twelve dollars each this month."],
        ["M", "Were they more expensive before the new term?"],
        ["W", "Fourteen dollars until the middle of September."],
        ["M", "Good timing on my part, then."],
        ["W", "And the index cards are two dollars a set."],
        ["M", "I'll take three sets, as I said."],
        ["W", "Students with a school card get ten percent off."],
        ["M", "Here is mine, right in my wallet."],
        ["W", "Then the discount applies to the whole purchase."],
        ["M", "Good, I'll pay by card."],
      ],
      choices: ["$24.30", "$25.20", "$27.00", "$29.70", "$30.00"],
      answer: 3,
      clue: "The workbooks are twelve dollars each this month.",
      explanation:
        "문제집 두 권 24달러와 색인 카드 세 세트 6달러로 30달러인데, 10퍼센트를 빼면 27달러이다. 따라서 답은 ③이다.",
      translation: [
        "W: 서점에 오신 걸 환영합니다. 찾으시는 게 있으세요?",
        "M: 문제집 두 권이랑 색인 카드 세 세트요.",
        "W: 이번 달 문제집은 한 권에 12달러입니다.",
        "M: 새 학기 전에는 더 비쌌나요?",
        "W: 9월 중순까지는 14달러였습니다.",
        "M: 때를 잘 맞췄네요.",
        "W: 색인 카드는 한 세트에 2달러입니다.",
        "M: 말씀드린 대로 세 세트 주세요.",
        "W: 학생증이 있으면 10퍼센트 할인됩니다.",
        "M: 여기 지갑에 있어요.",
        "W: 그럼 전체 구매에 할인이 들어갑니다.",
        "M: 좋네요, 카드로 낼게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 여자가 발표 자료를 다시 만든 이유를 고르시오.",
      lines: [
        ["M", "Chaeyeon, I heard you rebuilt your whole presentation."],
        ["M", "You finished the first version two weeks ago."],
        ["W", "I spent Sunday making it again from scratch."],
        ["M", "Did the teacher ask you to change the topic?"],
        ["W", "The topic is exactly the same as before."],
        ["M", "Then were the slides badly designed?"],
        ["W", "They looked fine, honestly. I liked them."],
        ["M", "So what made you start over?"],
        ["W", "The presentation was moved from the classroom to the main hall."],
        ["M", "A hall is a very different room."],
        ["W", "Everything I made was sized for a screen three metres away."],
        ["M", "Then you had no choice but to rebuild it."],
      ],
      choices: [
        "발표 장소가 바뀌어서",
        "주제를 바꾸라고 해서",
        "자료가 마음에 안 들어서",
        "시간이 줄어서",
        "파일이 지워져서",
      ],
      answer: 1,
      clue: "The presentation was moved from the classroom to the main hall.",
      explanation:
        "발표 장소가 대강당으로 바뀌어 자료를 다시 만들었다. 따라서 답은 ①이다.",
      translation: [
        "M: 채연아, 발표 자료를 통째로 다시 만들었다며.",
        "M: 두 주 전에 첫 판을 끝냈잖아.",
        "W: 일요일을 통째로 써서 처음부터 다시 만들었어.",
        "M: 선생님이 주제를 바꾸라고 하셨어?",
        "W: 주제는 전이랑 똑같아.",
        "M: 그럼 자료가 잘못 만들어졌어?",
        "W: 솔직히 괜찮아 보였어. 나도 마음에 들었고.",
        "M: 그럼 왜 처음부터 다시 했어?",
        "W: 발표 장소가 교실에서 대강당으로 옮겨졌어.",
        "M: 강당은 완전히 다른 방이지.",
        "W: 내가 만든 건 전부 3미터 앞 화면에 맞춘 크기였어.",
        "M: 그럼 다시 만드는 수밖에 없었겠다.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 교내 영어 에세이 대회에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["W", "Junseo, are you entering the English essay contest?"],
        ["W", "The notice went up outside the English office this morning."],
        ["M", "I read it at lunch. When is the deadline?"],
        ["W", "The last Friday of this month, by email."],
        ["M", "How long does the essay have to be?"],
        ["W", "Between five hundred and eight hundred words."],
        ["M", "Is there a set topic this year?"],
        ["W", "A decision you would make differently now."],
        ["M", "That's more personal than last year's."],
        ["W", "One essay per student, and it must be your own work."],
        ["M", "What do the winners get?"],
        ["W", "Their essays are printed in the school magazine."],
        ["M", "Then I'll start writing this weekend."],
      ],
      choices: ["제출 기한", "글의 분량", "올해 주제", "수상작의 쓰임", "심사 위원"],
      answer: 5,
      clue: "The last Friday of this month, by email.",
      explanation:
        "기한, 분량, 주제, 수상작의 쓰임은 말했지만 심사 위원은 말하지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 준서야, 영어 에세이 대회에 낼 거야?",
        "W: 오늘 아침에 영어과 교무실 밖에 알림이 붙었어.",
        "M: 점심때 읽었어. 마감이 언제야?",
        "W: 이번 달 마지막 금요일까지, 전자우편으로.",
        "M: 글은 얼마나 길어야 해?",
        "W: 500낱말에서 800낱말 사이.",
        "M: 올해 정해진 주제가 있어?",
        "W: 지금이라면 다르게 내릴 결정.",
        "M: 작년보다 개인적인 주제네.",
        "W: 한 사람당 한 편이고 직접 쓴 글이어야 해.",
        "M: 수상하면 뭘 받아?",
        "W: 글이 학교 잡지에 실려.",
        "M: 그럼 이번 주말부터 써야겠다.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "다음을 듣고, 학교 겨울 봉사 주간에 관한 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "W",
          "Hello, students. Here is the plan for the winter volunteer week. " +
            "It runs from the twelfth to the sixteenth of January. " +
            "Students go out in groups of five, each group to one place. " +
            "There are four places: a children's center, a library, " +
            "a community kitchen and an animal shelter. " +
            "Each group works from ten in the morning until two. " +
            "Lunch is provided at every place except the animal shelter. " +
            "You must wear clothes you do not mind getting dirty. " +
            "Sign up at the counseling office by the end of December.",
        ],
      ],
      choices: [
        "1월 12일부터 16일까지 진행된다",
        "다섯 명씩 모둠을 이룬다",
        "네 곳으로 나누어 간다",
        "오전 열 시부터 오후 두 시까지 한다",
        "모든 곳에서 점심이 제공된다",
      ],
      answer: 5,
      clue: "Lunch is provided at every place except the animal shelter.",
      explanation:
        "동물 보호소를 뺀 곳에서만 점심이 제공된다고 했으므로 ⑤가 일치하지 않는다.",
      translation: [
        "W: 학생 여러분, 안녕하세요. 겨울 봉사 주간 계획을 알려 드립니다. 1월 12일부터 16일까지 진행됩니다. 다섯 명씩 모둠을 이루어 모둠마다 한 곳으로 갑니다. 갈 곳은 네 군데입니다. 아동 센터, 도서관, 지역 급식소, 동물 보호소입니다. 각 모둠은 오전 열 시부터 오후 두 시까지 일합니다. 점심은 동물 보호소를 뺀 모든 곳에서 제공됩니다. 더러워져도 괜찮은 옷을 입고 오셔야 합니다. 12월 말까지 상담실에서 신청해 주세요.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 여자가 신청할 강좌를 고르시오.",
      lines: [
        ["M", "Bora, which online course will you take this winter?"],
        ["W", "Five came up when I searched the center's page."],
        ["M", "How many weeks can you give to it?"],
        ["W", "Eight at most, before the new term begins."],
        ["M", "One of them runs for fourteen weeks."],
        ["W", "That would still be going in March."],
        ["M", "What about the fee?"],
        ["W", "Under a hundred twenty thousand won, my parents said."],
        ["M", "Two of these are above that amount."],
        ["W", "And it has to come with printed materials."],
        ["M", "You always say a screen alone is not enough."],
        ["W", "Then only one course fits everything."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "Eight at most, before the new term begins.",
      explanation:
        "8주 이내, 12만 원 미만, 교재 포함인 강좌는 ④이다. 따라서 답은 ④이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Weeks: 14 / Fee: 100,000 won / Materials: Yes" },
          { no: 2, label: "②", value: "Weeks: 6 / Fee: 150,000 won / Materials: Yes" },
          { no: 3, label: "③", value: "Weeks: 8 / Fee: 130,000 won / Materials: Yes" },
          { no: 4, label: "④", value: "Weeks: 7 / Fee: 115,000 won / Materials: Yes" },
          { no: 5, label: "⑤", value: "Weeks: 8 / Fee: 90,000 won / Materials: No" },
        ],
      },
      translation: [
        "M: 보라야, 이번 겨울에 어떤 인터넷 강좌 들을 거야?",
        "W: 센터 누리집에서 찾아보니 다섯 개가 나왔어.",
        "M: 몇 주나 쓸 수 있어?",
        "W: 새 학기 시작 전까지 길어야 8주.",
        "M: 하나는 14주짜리네.",
        "W: 그건 3월까지도 이어지겠다.",
        "M: 수강료는?",
        "W: 부모님이 12만 원 미만이라고 하셨어.",
        "M: 이 중 두 개는 그보다 비싸.",
        "W: 그리고 인쇄된 교재가 함께 와야 해.",
        "M: 너는 늘 화면만으로는 부족하다고 하지.",
        "W: 그럼 다 맞는 건 하나뿐이야.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Have you started the group report yet?"],
        ["W", "I wrote the introduction last night."],
        ["M", "The whole thing is due on Monday morning."],
        ["W", "That gives us the weekend to finish."],
        ["M", "Shall we put the parts together on Sunday?"],
      ],
      choices: [
        "Sure, at my house.",
        "The report was last term.",
        "I don't have a group.",
        "Monday already passed.",
        "There is no introduction.",
      ],
      answer: 1,
      clue: "Shall we put the parts together on Sunday?",
      explanation:
        "일요일에 합치자는 제안이므로, 우리 집에서 하자는 ①이 가장 자연스럽다.",
      translation: [
        "M: 조별 보고서 시작했어?",
        "W: 어젯밤에 머리말을 썼어.",
        "M: 전체가 월요일 아침까지야.",
        "W: 그럼 주말에 끝낼 수 있겠다.",
        "M: 일요일에 각자 쓴 걸 합칠까?",
        "W: 좋아, 우리 집에서.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Excuse me, can I borrow a calculator from the office?"],
        ["M", "Yes, we keep a few for exam days."],
        ["W", "Do I need to bring it back the same day?"],
        ["M", "Before the office closes at five."],
        ["W", "What if my exam finishes after five?"],
      ],
      choices: [
        "The office has no calculators.",
        "Leave it with your homeroom teacher.",
        "I don't lend anything.",
        "Exams never run late.",
        "You can't borrow one.",
      ],
      answer: 2,
      clue: "What if my exam finishes after five?",
      explanation:
        "다섯 시 이후에 끝나면 어떻게 하는지 물었으므로, 담임 선생님께 맡기라는 ②가 가장 자연스럽다.",
      translation: [
        "W: 실례합니다, 사무실에서 계산기를 빌릴 수 있나요?",
        "M: 네, 시험 날을 위해 몇 개 두고 있습니다.",
        "W: 같은 날에 돌려줘야 하나요?",
        "M: 사무실이 닫는 다섯 시 전까지요.",
        "W: 시험이 다섯 시 넘어 끝나면요?",
        "M: 담임 선생님께 맡기시면 됩니다.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Kiyoung, how is the club's noticeboard working out?"],
        ["M", "We put up a new notice every week and nobody reads them."],
        ["W", "How many notices are on it right now?"],
        ["M", "About thirty, going back to last March."],
        ["W", "So a new one goes up beside twenty-nine old ones."],
        ["M", "I never take the old ones down."],
        ["W", "Then the board looks the same every time someone walks past."],
        ["M", "And a board that never changes is not worth checking."],
        ["W", "Exactly. The eye stops noticing it."],
        ["M", "I suppose I should clear it regularly."],
        ["W", "How often could you take the old ones down?"],
      ],
      choices: [
        "I'll never take them down.",
        "Every Monday morning.",
        "I'll add thirty more.",
        "The board is fine as it is.",
        "Nobody uses the board.",
      ],
      answer: 2,
      clue: "How often could you take the old ones down?",
      explanation:
        "얼마나 자주 떼어 낼 수 있는지 물었으므로, 월요일 아침마다라는 ②가 가장 자연스럽다.",
      translation: [
        "W: 기영아, 동아리 게시판은 잘되고 있어?",
        "M: 주마다 새 알림을 붙이는데 아무도 안 읽어.",
        "W: 지금 거기 알림이 몇 장 붙어 있어?",
        "M: 작년 3월 것까지 서른 장쯤.",
        "W: 그럼 새 한 장이 낡은 스물아홉 장 옆에 붙는 거네.",
        "M: 낡은 건 한 번도 안 떼었어.",
        "W: 그럼 지나갈 때마다 게시판이 늘 똑같아 보이지.",
        "M: 한 번도 안 바뀌는 게시판은 볼 값어치가 없지.",
        "W: 맞아. 눈이 알아보기를 멈춰.",
        "M: 정기적으로 치워야겠네.",
        "W: 낡은 건 얼마나 자주 뗄 수 있어?",
        "M: 월요일 아침마다.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Areum, you said your English writing never improves."],
        ["W", "I write two pages every weekend."],
        ["M", "Does anyone mark them for you?"],
        ["W", "No, I just put them in a folder."],
        ["M", "So the same mistake appears in all of them."],
        ["W", "I wouldn't know, since nobody has ever said."],
        ["M", "Two pages with no feedback is just practice at being wrong."],
        ["W", "That's a hard way to put it, but it's fair."],
        ["M", "Half a page that someone corrects is worth more."],
        ["W", "I could show it to the English teacher on Fridays."],
        ["M", "How much would you bring her each time?"],
      ],
      choices: [
        "Two whole pages.",
        "About half a page.",
        "I'll bring nothing.",
        "The whole folder at once.",
        "I'll stop writing.",
      ],
      answer: 2,
      clue: "How much would you bring her each time?",
      explanation:
        "매번 얼마나 가져갈지 물었으므로, 반 쪽쯤이라는 ②가 가장 자연스럽다.",
      translation: [
        "M: 아름아, 영어 글쓰기가 안 는다고 했잖아.",
        "W: 주말마다 두 쪽씩 써.",
        "M: 누가 봐 줘?",
        "W: 아니, 그냥 파일에 넣어 둬.",
        "M: 그럼 같은 실수가 전부에 그대로 있겠네.",
        "W: 아무도 말해 준 적이 없으니 알 길이 없지.",
        "M: 되짚어 주는 사람 없는 두 쪽은 틀리는 연습이야.",
        "W: 모질게 말하네. 그래도 맞는 말이야.",
        "M: 누가 고쳐 주는 반 쪽이 더 값져.",
        "W: 금요일마다 영어 선생님께 보여 드릴 수 있겠다.",
        "M: 매번 얼마나 가져갈 거야?",
        "W: 반 쪽쯤.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Taeho가 Suyeon에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Taeho : ________________",
      lines: [
        [
          "M",
          "Taeho and Suyeon are setting up the club's display in the corridor. " +
            "Suyeon has laid all the printed pages out along a low table " +
            "that stands right beside the door to the stairwell. " +
            "The door swings open every few seconds as students pass through, " +
            "and the draught has already blown two pages onto the floor. " +
            "The display has to stay there until Friday afternoon. " +
            "Taeho wants her to move the table away from the door " +
            "before the whole display ends up scattered across the corridor. " +
            "In this situation, what would Taeho most likely say to Suyeon?",
        ],
      ],
      choices: [
        "Let's print the pages again.",
        "The display comes down today.",
        "Move the table away from the door.",
        "We should open the door wider.",
        "Nobody uses this corridor.",
      ],
      answer: 3,
      clue: "Taeho wants her to move the table away from the door",
      explanation:
        "문 바람에 종이가 날리므로, 탁자를 문에서 떨어뜨리라는 ③이 가장 적절하다.",
      translation: [
        "M: 태호와 수연이는 복도에 동아리 전시를 차리고 있습니다. 수연이는 인쇄한 쪽들을 낮은 탁자 위에 죽 늘어놓았는데, 그 탁자가 계단으로 통하는 문 바로 옆에 있습니다. 학생들이 지나다니느라 문이 몇 초마다 열리고, 그 바람에 벌써 두 장이 바닥으로 날아갔습니다. 전시는 금요일 오후까지 그대로 두어야 합니다. 태호는 전시물이 복도에 온통 흩어지기 전에 탁자를 문에서 떨어뜨리기를 바랍니다. 이런 상황에서 태호가 수연이에게 할 말로 가장 적절한 것은 무엇일까요?",
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
            "survive long periods without food or water. " +
            "The bar-tailed godwit flies from Alaska to New Zealand without landing, " +
            "living for nine days on the fat it stored before leaving. " +
            "A crocodile that has eaten one large meal " +
            "can wait a full year before it needs another. " +
            "The tardigrade dries itself into a grain smaller than a comma " +
            "and waits, sometimes for decades, until water returns. " +
            "Emperor penguins stand through the Antarctic winter for two months, " +
            "eating nothing while holding a single egg on their feet. " +
            "Waiting, it turns out, is a skill as demanding as hunting.",
        ],
      ],
      choices: [
        "how animals survive long periods without food",
        "why birds migrate such long distances",
        "how animals find water in deserts",
        "why penguins live in cold places",
        "how animals store fat for winter",
      ],
      answer: 1,
      clue: "Waiting, it turns out, is a skill as demanding as hunting.",
      explanation:
        "먹지 않고 오래 버티는 동물들의 방식이 중심 내용이다. 따라서 답은 ①이다.",
      translation: [
        "W: 여러분, 안녕하세요. 오늘은 동물들이 먹이나 물 없이 오래 버티는 방식을 이야기하려 합니다. 큰뒷부리도요는 알래스카에서 뉴질랜드까지 한 번도 내려앉지 않고 날아가는데, 떠나기 전에 쌓아 둔 지방으로 아흐레를 삽니다. 큰 먹이를 한 번 먹은 악어는 다음 먹이가 필요해지기까지 꼬박 한 해를 기다릴 수 있습니다. 완보동물은 쉼표보다 작은 알갱이로 제 몸을 말린 채, 때로는 수십 년 동안 물이 돌아오기를 기다립니다. 황제펭귄은 남극의 겨울 두 달을 선 채로 지내며, 발 위에 알 하나를 얹은 채 아무것도 먹지 않습니다. 기다리는 일은 사냥만큼이나 만만치 않은 능력인 모양입니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "다음을 듣고, 언급된 동물이 아닌 것을 고르시오.",
      lines: [
        ["W", "The bar-tailed godwit flies from Alaska to New Zealand without landing."],
        ["W", "A crocodile can wait a full year before it needs another meal."],
        ["W", "The tardigrade dries itself into a grain smaller than a comma."],
        ["W", "Emperor penguins stand through the Antarctic winter for two months."],
        ["W", "Waiting is a skill as demanding as hunting."],
      ],
      choices: ["godwits", "crocodiles", "tardigrades", "emperor penguins", "camels"],
      answer: 5,
      clue: "Emperor penguins stand through the Antarctic winter for two months.",
      explanation:
        "도요, 악어, 완보동물, 황제펭귄은 언급되지만 낙타는 나오지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
