/** 고2 듣기 22회 — 사람이 직접 쓴 회차 (2026-09-25) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고2 22회",
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
          "Good evening, residents of Maple Court. This is Ms. Yoon from the management office. " +
            "I am speaking to you about the recycling room on the first floor. " +
            "Over the past month the collection truck has twice refused to take our bins. " +
            "The reason is simple. Food containers are going in unwashed, " +
            "and a single dirty container can ruin an entire bag of paper. " +
            "From this Saturday, please rinse any container before you put it in the bin. " +
            "It takes five seconds at your own sink. " +
            "If the bins are refused a third time, the building is charged for a special pickup, " +
            "and that cost is shared by every household here. " +
            "Signs with pictures will go up beside each bin tomorrow. Thank you for your cooperation.",
        ],
      ],
      choices: [
        "분리수거 요일 변경을 알리려고",
        "관리비 인상을 안내하려고",
        "재활용실 공사를 알리려고",
        "재활용품을 헹궈서 버릴 것을 당부하려고",
        "쓰레기 무단 투기를 경고하려고",
      ],
      answer: 4,
      clue: "From this Saturday, please rinse any container before you put it in the bin.",
      explanation:
        "여자는 씻지 않은 용기 때문에 수거가 거부되었다며 용기를 헹궈서 버려 달라고 당부한다. 따라서 답은 ④이다.",
      translation: [
        "W: 메이플코트 주민 여러분, 안녕하세요. 관리사무소 윤입니다. 1층 재활용실 때문에 말씀드립니다. 지난 한 달 동안 수거 차량이 저희 수거함을 두 번 가져가지 않았습니다. 이유는 간단합니다. 음식 용기가 씻기지 않은 채 들어가고 있는데, 더러운 용기 하나가 종이 한 봉지를 통째로 못 쓰게 만듭니다. 이번 주 토요일부터는 용기를 수거함에 넣기 전에 헹궈 주세요. 댁의 개수대에서 5초면 됩니다. 세 번째로 거부되면 건물이 특별 수거 비용을 내야 하고, 그 비용은 이곳 모든 세대가 나눠 냅니다. 내일 각 수거함 옆에 그림이 있는 안내문을 붙이겠습니다. 협조해 주셔서 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 남자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Taeho, I'm going to record every lecture from now on."],
        ["M", "All of them? What will you do with the recordings?"],
        ["W", "Listen again at home, so I don't miss anything."],
        ["M", "How many of last month's recordings have you listened to?"],
        ["W", "Honestly, none of them yet."],
        ["M", "That's what usually happens. The file becomes a promise you never keep."],
        ["W", "But if I'm writing, I can't follow what's being said."],
        ["M", "You don't have to write everything. Write only what surprised you."],
        ["W", "That would be four or five lines a class."],
        ["M", "Four lines you thought about beat an hour you never replay."],
        ["W", "So the point is choosing while I listen."],
        ["M", "Exactly. The choosing is the studying."],
      ],
      choices: [
        "수업은 녹음해 두어야 한다",
        "수업은 들으며 골라 적어야 한다",
        "필기는 손으로 해야 한다",
        "복습은 그날 안에 해야 한다",
        "모르는 것은 바로 질문해야 한다",
      ],
      answer: 2,
      clue: "Four lines you thought about beat an hour you never replay.",
      explanation:
        "남자는 녹음 파일은 지키지 못할 약속이 된다며, 들으면서 놀란 것만 골라 적는 그 고르는 행위가 곧 공부라고 말한다. 따라서 답은 ②이다.",
      translation: [
        "W: 태호야, 나 이제부터 수업을 다 녹음하려고.",
        "M: 전부? 녹음해서 뭐 하게?",
        "W: 집에서 다시 들어야지. 놓치는 게 없게.",
        "M: 지난달 녹음은 몇 개나 다시 들었어?",
        "W: 솔직히 아직 하나도 안 들었어.",
        "M: 보통 그렇게 돼. 파일이 지키지 못할 약속이 되는 거야.",
        "W: 그런데 받아 적다 보면 무슨 말인지 못 따라가.",
        "M: 다 적을 필요 없어. 놀란 것만 적어.",
        "W: 그럼 한 시간에 네다섯 줄이겠네.",
        "M: 네 줄이라도 생각하며 적은 게, 다시 안 듣는 한 시간보다 나아.",
        "W: 결국 들으면서 고르는 게 핵심이구나.",
        "M: 그래. 고르는 게 공부야.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "We tend to think of a deadline as the enemy of good work. " +
            "Given more time, we say, the result would have been better. " +
            "But look closely at what actually happens when a deadline is removed. " +
            "A project with no end date does not get more care. It gets more revisiting. " +
            "You open the file, change a word, close it, and feel you have worked. " +
            "The task stays alive in your head, taking up room, " +
            "and the version you finally hand in is rarely better than the one you had in week two. " +
            "A deadline does something the work cannot do for itself. " +
            "It tells you which of your many possible improvements are worth making. " +
            "Without that pressure, everything looks equally worth fixing, " +
            "which is another way of saying nothing does.",
        ],
      ],
      choices: [
        "충분한 시간이 좋은 결과를 만든다",
        "계획은 구체적일수록 좋다",
        "완벽주의는 버려야 한다",
        "일은 미루지 말아야 한다",
        "마감은 무엇을 고칠지 골라 준다",
      ],
      answer: 5,
      clue: "It tells you which of your many possible improvements are worth making.",
      explanation:
        "남자는 마감이 없으면 모든 것이 똑같이 고칠 만해 보여 결국 아무것도 고르지 못한다며, 마감이 고칠 것을 골라 준다고 말한다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 우리는 마감을 좋은 결과의 적이라고 생각하는 경향이 있습니다. 시간이 더 있었다면 결과가 더 나았을 거라고 말하지요. 그런데 마감을 없앴을 때 실제로 무슨 일이 일어나는지 자세히 보세요. 끝 날짜가 없는 일은 더 정성스러워지지 않습니다. 더 자주 들여다보게 될 뿐입니다. 파일을 열고, 단어 하나 고치고, 닫고, 일했다고 느낍니다. 그 일은 머릿속에 살아남아 자리를 차지하고, 결국 내는 판본은 둘째 주에 갖고 있던 것보다 나은 경우가 드뭅니다. 마감은 일 스스로 못 하는 일을 해 줍니다. 가능한 수많은 개선 가운데 어떤 것이 할 만한지 알려 줍니다. 그 압력이 없으면 모든 것이 똑같이 고칠 만해 보이고, 그건 곧 아무것도 그렇지 않다는 말입니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["M", "Jiyu, is this the corner you set up for the book café?"],
        ["W", "Yes, we opened it last Monday."],
        ["M", "The striped awning over the counter looks cheerful."],
        ["W", "We sewed it from an old curtain."],
        ["M", "And there's a chalkboard menu leaning against the wall."],
        ["W", "One of the members rewrites it every morning."],
        ["M", "I see two round stools in front of the counter."],
        ["W", "Actually there are three now. We borrowed one from the art room."],
        ["M", "There's a small basket of flowers on the counter as well."],
        ["W", "A neighbor brings those in every Friday."],
        ["M", "And a wall clock shaped like a teapot. That's a nice touch."],
        ["W", "It was the first thing we hung up."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "Actually there are three now. We borrowed one from the art room.",
      explanation:
        "남자가 둥근 의자가 두 개라고 하자 여자가 세 개라고 바로잡는다. 그림에는 두 개가 그려져 있으므로 답은 ③이다.",
      figure: {
        kind: "scene",
        scene:
          "A small book café corner drawn as one wide picture, clean black line art on white, no writing or numbers anywhere. " +
          "A STRIPED AWNING hangs over a counter. " +
          "A blank CHALKBOARD on a stand leans against the wall beside the counter. " +
          "Exactly TWO ROUND STOOLS stand in front of the counter, clearly countable. " +
          "A small BASKET OF FLOWERS sits on the counter. " +
          "A WALL CLOCK SHAPED LIKE A TEAPOT hangs on the wall above.",
      },
      translation: [
        "M: 지유야, 이게 북카페로 꾸민 그 자리야?",
        "W: 응, 지난 월요일에 열었어.",
        "M: 계산대 위에 걸린 줄무늬 차양이 산뜻하다.",
        "W: 오래된 커튼으로 우리가 바느질했어.",
        "M: 그리고 벽에 칠판 메뉴판이 기대어 있네.",
        "W: 부원 한 명이 아침마다 다시 써.",
        "M: 계산대 앞에 둥근 의자가 두 개 보여.",
        "W: 사실 지금은 세 개야. 미술실에서 하나 빌려 왔어.",
        "M: 계산대 위에 작은 꽃바구니도 있네.",
        "W: 이웃 한 분이 금요일마다 가져다주셔.",
        "M: 그리고 주전자 모양 벽시계. 멋지다.",
        "W: 그건 제일 먼저 건 거야.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 여자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Jiyu, the club recruitment fair starts in an hour."],
        ["W", "I know. Is our banner up over the table?"],
        ["M", "It is. I tied it to the frame this morning."],
        ["W", "Good. And the sign-up sheets?"],
        ["M", "Printed, one hundred copies, sitting in my bag."],
        ["W", "Then what's still missing?"],
        ["M", "The projector. Nobody picked it up from the media room."],
        ["W", "We need it for the video loop, don't we?"],
        ["M", "We do, but I have to brief the four new members."],
        ["W", "Then I'll go to the media room and bring the projector."],
        ["M", "Thanks. The key is with the teacher on duty."],
        ["W", "I'll be back before the doors open."],
      ],
      choices: [
        "빔 프로젝터 가져오기",
        "현수막 걸기",
        "신청서 인쇄하기",
        "신입 회원 안내하기",
        "영상 만들기",
      ],
      answer: 1,
      clue: "Then I'll go to the media room and bring the projector.",
      explanation:
        "현수막과 신청서는 끝났고 남자는 신입 회원을 안내해야 하므로, 여자가 매체실에서 프로젝터를 가져오기로 한다. 따라서 답은 ①이다.",
      translation: [
        "M: 지유야, 동아리 모집 행사가 한 시간 뒤에 시작해.",
        "W: 알아. 탁자 위에 현수막은 걸었어?",
        "M: 걸었어. 오늘 아침에 틀에 묶었어.",
        "W: 좋아. 신청서는?",
        "M: 인쇄했어. 백 장, 내 가방에 있어.",
        "W: 그럼 아직 없는 게 뭐야?",
        "M: 프로젝터. 아무도 매체실에서 안 가져왔어.",
        "W: 영상 틀려면 필요하잖아, 그렇지?",
        "M: 필요해. 그런데 나는 신입 회원 네 명을 안내해야 해.",
        "W: 그럼 내가 매체실 가서 프로젝터 가져올게.",
        "M: 고마워. 열쇠는 당직 선생님께 있어.",
        "W: 문 열기 전에 돌아올게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 남자가 지불할 금액을 고르시오.",
      lines: [
        ["W", "Welcome to Hillside Bike Rental. How can I help you?"],
        ["M", "I'd like three bikes for the afternoon, please."],
        ["W", "A half-day rental is fifteen dollars per bike."],
        ["M", "So forty-five dollars for the three."],
        ["W", "That's right. Would you like helmets as well?"],
        ["M", "Yes, three helmets. How much are those?"],
        ["W", "Helmets are three dollars each, so nine more."],
        ["M", "Fifty-four altogether, then."],
        ["W", "Correct. And do you have a student card with you?"],
        ["M", "I do. Here you are."],
        ["W", "Students get ten percent off the whole amount."],
        ["M", "Great. I'll pay in cash."],
      ],
      choices: ["$40.50", "$45.00", "$54.00", "$48.60", "$59.40"],
      answer: 4,
      clue: "Students get ten percent off the whole amount.",
      explanation:
        "자전거 3대 45달러와 헬멧 3개 9달러를 더하면 54달러이고, 학생 할인 10퍼센트를 빼면 48.60달러이다. 따라서 답은 ④이다.",
      translation: [
        "W: 힐사이드 자전거 대여점입니다. 무엇을 도와드릴까요?",
        "M: 오후 동안 자전거 세 대 빌리고 싶어요.",
        "W: 반나절 대여는 한 대에 15달러입니다.",
        "M: 그럼 세 대에 45달러네요.",
        "W: 맞습니다. 헬멧도 하시겠어요?",
        "M: 네, 세 개요. 그건 얼마예요?",
        "W: 헬멧은 하나에 3달러라서 9달러가 더 붙습니다.",
        "M: 그럼 모두 54달러네요.",
        "W: 맞습니다. 학생증 갖고 계세요?",
        "M: 네, 여기요.",
        "W: 학생은 전체 금액에서 10퍼센트를 빼 드립니다.",
        "M: 좋네요. 현금으로 낼게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 남자가 사진 동아리를 그만두려는 이유를 고르시오.",
      lines: [
        ["W", "Taeho, I heard you're leaving the photography club."],
        ["M", "At the end of this term, yes."],
        ["W", "Did something happen with the members?"],
        ["M", "Not at all. They're the reason I stayed this long."],
        ["W", "Is it the club fee? It did go up this year."],
        ["M", "The fee is fine. It's the meeting time."],
        ["W", "Wednesday afternoons, right?"],
        ["M", "They moved it to Wednesday evenings last month."],
        ["W", "And that's when your tutoring job is."],
        ["M", "Exactly. I can't be in two places at six o'clock."],
      ],
      choices: [
        "회원들과 사이가 나빠져서",
        "모임 시간이 아르바이트와 겹쳐서",
        "동아리비가 올라서",
        "사진에 흥미를 잃어서",
        "장비가 비싸서",
      ],
      answer: 2,
      clue: "They moved it to Wednesday evenings last month.",
      explanation:
        "회원 문제도 회비 문제도 아니고, 모임이 수요일 저녁으로 옮겨져 과외 아르바이트와 겹치기 때문이다. 따라서 답은 ②이다.",
      translation: [
        "W: 태호야, 사진 동아리 그만둔다며.",
        "M: 이번 학기 끝나면, 응.",
        "W: 회원들이랑 무슨 일 있었어?",
        "M: 전혀. 그 사람들 때문에 여태 있었던 거야.",
        "W: 동아리비 때문이야? 올해 오르긴 했지.",
        "M: 회비는 괜찮아. 모임 시간 때문이야.",
        "W: 수요일 오후 아니야?",
        "M: 지난달에 수요일 저녁으로 옮겼어.",
        "W: 그 시간에 너 과외하잖아.",
        "M: 그래. 6시에 두 군데에 있을 수는 없잖아.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, Harbor Film Festival에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["W", "Taeho, are you going to the Harbor Film Festival?"],
        ["M", "I've been meaning to ask about it. When is it?"],
        ["W", "The second weekend of October, Friday to Sunday."],
        ["M", "Three days. Where do they screen the films?"],
        ["W", "At the old warehouse theater by the ferry terminal."],
        ["M", "I've walked past that building. How many films are showing?"],
        ["W", "Twenty-four this year, all by directors under thirty."],
        ["M", "That's a lot for three days. Are tickets expensive?"],
        ["W", "Eight thousand won a film, or fifty thousand for a full pass."],
        ["M", "The pass is worth it if I see more than six."],
        ["W", "That was my thinking too. I bought one yesterday."],
        ["M", "Then I'll get mine tonight before they sell out."],
      ],
      choices: ["열리는 기간", "상영 장소", "상영 편수", "관람료", "심사 위원"],
      answer: 5,
      clue: "심사 위원은 대화에서 언급되지 않았다.",
      explanation:
        "기간(10월 둘째 주말), 장소(선착장 옆 옛 창고 극장), 편수(24편), 관람료(편당 8천 원, 통합권 5만 원)는 언급되지만 심사 위원은 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 태호야, 하버 영화제 갈 거야?",
        "M: 안 그래도 물어보려고 했어. 언제야?",
        "W: 10월 둘째 주말, 금요일부터 일요일까지.",
        "M: 사흘이구나. 어디서 상영해?",
        "W: 선착장 옆 옛 창고 극장에서.",
        "M: 그 건물 지나다녔어. 몇 편이나 상영해?",
        "W: 올해는 스물네 편, 전부 서른 살 아래 감독 작품이야.",
        "M: 사흘에 많다. 관람료는 비싸?",
        "W: 한 편에 8천 원, 통합권은 5만 원이야.",
        "M: 여섯 편 넘게 보면 통합권이 낫겠네.",
        "W: 나도 그렇게 생각했어. 어제 샀어.",
        "M: 그럼 나도 오늘 밤에 매진되기 전에 살게.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Nordic Light Walk에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "M",
          "Let me tell you about the Nordic Light Walk. " +
            "It is a night walking event held every January in the city's riverside park. " +
            "Walkers follow a four-kilometer path lit by ten thousand paper lanterns. " +
            "The path is flat the whole way, so wheelchairs and strollers can use it. " +
            "Registration is required, and it opens online on the first of December. " +
            "There is no entry fee, but each walker is asked to bring one canned food item. " +
            "The cans are donated to the food bank two blocks from the park entrance.",
        ],
      ],
      choices: [
        "매년 1월에 열린다",
        "길이가 4킬로미터이다",
        "참가비를 내야 한다",
        "길 전체가 평평하다",
        "통조림 하나를 가져가야 한다",
      ],
      answer: 3,
      clue: "There is no entry fee, but each walker is asked to bring one canned food item.",
      explanation:
        "참가비는 없고 대신 통조림 하나를 가져오라고 했으므로 참가비를 낸다는 ③은 내용과 다르다. 따라서 답은 ③이다.",
      translation: [
        "M: 노르딕 라이트 워크를 소개해 드리겠습니다. 매년 1월 시 강변 공원에서 열리는 밤 걷기 행사입니다. 참가자들은 종이 등 1만 개가 밝히는 4킬로미터 길을 따라 걷습니다. 길은 처음부터 끝까지 평평해서 휠체어와 유아차도 다닐 수 있습니다. 신청이 필요하고, 12월 1일에 온라인으로 열립니다. 참가비는 없지만 참가자마다 통조림 하나를 가져와 달라고 합니다. 그 통조림은 공원 입구에서 두 블록 떨어진 푸드뱅크에 기부됩니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 신청할 주말 강좌를 고르시오.",
      lines: [
        ["W", "Taeho, let's sign up for a weekend class together."],
        ["M", "There are five on this list. Saturday or Sunday?"],
        ["W", "Sunday is out. I visit my grandmother every Sunday."],
        ["M", "Saturday it is. How long should each session be?"],
        ["W", "Two hours or less. Anything longer and I lose focus."],
        ["M", "That takes the three-hour one off the list."],
        ["W", "And the fee? The community center subsidy is forty thousand won."],
        ["M", "So anything above forty thousand comes out of our pockets."],
        ["W", "Let's stay within the subsidy."],
        ["M", "Then only one class matches all three."],
        ["W", "Registration closes Thursday, so let's do it today."],
        ["M", "I'll fill in the form during lunch."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 1,
      clue: "Sunday is out. I visit my grandmother every Sunday.",
      explanation:
        "토요일이고, 한 번에 두 시간 이하이며, 수강료가 4만 원 이하인 강좌를 고른다. 세 조건을 모두 채우는 것은 ①이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Day: Saturday / Session: 2 hours / Fee: 38,000 won" },
          { no: 2, label: "②", value: "Day: Sunday / Session: 2 hours / Fee: 35,000 won" },
          { no: 3, label: "③", value: "Day: Saturday / Session: 3 hours / Fee: 30,000 won" },
          { no: 4, label: "④", value: "Day: Saturday / Session: 1.5 hours / Fee: 52,000 won" },
          { no: 5, label: "⑤", value: "Day: Sunday / Session: 1.5 hours / Fee: 40,000 won" },
        ],
      },
      translation: [
        "W: 태호야, 주말 강좌 같이 신청하자.",
        "M: 목록에 다섯 개 있네. 토요일이야, 일요일이야?",
        "W: 일요일은 안 돼. 나는 일요일마다 할머니 댁에 가.",
        "M: 그럼 토요일이네. 한 번에 몇 시간이면 좋겠어?",
        "W: 두 시간 이하. 더 길면 집중이 안 돼.",
        "M: 그럼 세 시간짜리는 빠지네.",
        "W: 수강료는? 주민센터 지원금이 4만 원이야.",
        "M: 4만 원 넘으면 우리 돈이 나가는 거네.",
        "W: 지원금 안에서 하자.",
        "M: 그럼 세 조건 다 맞는 건 하나뿐이야.",
        "W: 신청이 목요일에 닫히니까 오늘 하자.",
        "M: 점심시간에 신청서 쓸게.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["M", "Jiyu, did the lab results get posted yet?"],
        ["W", "Not on the board. The teacher sent them by email."],
        ["M", "I checked my inbox and there was nothing."],
        ["W", "Look in your spam folder. Mine was in there."],
      ],
      choices: [
        "I don't have an email account.",
        "The board is always empty.",
        "The lab closed last year.",
        "I'll check there now.",
        "I already got full marks.",
      ],
      answer: 4,
      clue: "Look in your spam folder. Mine was in there.",
      explanation:
        "여자가 스팸함을 보라고 했으므로, 지금 확인해 보겠다는 ④가 가장 자연스럽다.",
      translation: [
        "M: 지유야, 실험 결과 나왔어?",
        "W: 게시판에는 없어. 선생님이 메일로 보내셨어.",
        "M: 받은 편지함을 봤는데 아무것도 없었어.",
        "W: 스팸함을 봐. 내 것도 거기 있었어.",
        "M: 지금 거기 확인해 볼게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["W", "Taeho, my laptop shuts down whenever I unplug it."],
        ["M", "How old is the battery?"],
        ["W", "The laptop is four years old. I've never replaced it."],
        ["M", "Four years is about when they stop holding a charge."],
      ],
      choices: [
        "I'll buy a new keyboard.",
        "Then I should get the battery changed.",
        "My laptop is brand new.",
        "I never unplug it anyway.",
        "The screen is too small.",
      ],
      answer: 2,
      clue: "Four years is about when they stop holding a charge.",
      explanation:
        "남자가 4년이면 배터리가 충전을 못 잡을 때라고 했으므로, 배터리를 교체하겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 태호야, 내 노트북은 전원을 뽑으면 꺼져.",
        "M: 배터리가 몇 년 됐어?",
        "W: 노트북이 4년 됐어. 한 번도 안 갈았어.",
        "M: 4년쯤 되면 충전을 못 잡기 시작해.",
        "W: 그럼 배터리를 갈아야겠다.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Jiyu, you've rewritten that essay introduction six times."],
        ["W", "None of them sound like the right opening."],
        ["M", "Have you written the rest of the essay?"],
        ["W", "Not yet. I can't move on until the opening is right."],
        ["M", "How would you know what the opening should do?"],
        ["W", "It should tell the reader where the essay is going."],
        ["M", "And do you know yet where it's going?"],
        ["W", "Not exactly. That's what I'm trying to figure out."],
        ["M", "So you're writing a signpost for a road you haven't built."],
        ["W", "When you put it like that, it sounds backwards."],
        ["M", "Write the middle first. The opening will almost write itself."],
      ],
      choices: [
        "I've already finished the whole essay.",
        "My introduction is perfect now.",
        "I'd rather not write this essay.",
        "Signposts are the hardest part.",
        "I'll start with the body paragraphs tonight.",
      ],
      answer: 5,
      clue: "Write the middle first. The opening will almost write itself.",
      explanation:
        "남자가 본문을 먼저 쓰라고 조언했으므로, 오늘 밤 본문부터 쓰겠다는 ⑤가 가장 자연스럽다.",
      translation: [
        "M: 지유야, 그 글 도입부를 여섯 번이나 고쳐 썼네.",
        "W: 어느 것도 맞는 시작 같지 않아.",
        "M: 나머지는 썼어?",
        "W: 아직. 도입부가 제대로 되기 전엔 못 넘어가겠어.",
        "M: 도입부가 뭘 해야 하는 건데?",
        "W: 이 글이 어디로 가는지 독자에게 알려 줘야지.",
        "M: 그런데 어디로 가는지 이미 알아?",
        "W: 정확히는 몰라. 그걸 알아내는 중이야.",
        "M: 그럼 아직 안 낸 길의 이정표를 쓰고 있는 거네.",
        "W: 그렇게 말하니까 거꾸로 하는 것 같네.",
        "M: 가운데부터 써. 도입부는 거의 저절로 써질 거야.",
        "W: 오늘 밤에 본문부터 시작할게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Taeho, you skipped the team dinner again last night."],
        ["M", "I had to finish the analysis for the presentation."],
        ["W", "That's the third team event you've missed this month."],
        ["M", "The work has to get done by somebody."],
        ["W", "And it always gets done by you, doesn't it?"],
        ["M", "Nobody else volunteers when I ask."],
        ["W", "Did you ask, or did you just start doing it yourself?"],
        ["M", "I suppose I started before anyone had a chance."],
        ["W", "Then they never learned that the work needs doing."],
        ["M", "So I've been training them to leave it to me."],
        ["W", "Bring the list to the next meeting and let them pick a piece."],
      ],
      choices: [
        "The team never meets anymore.",
        "I'd rather do it all myself.",
        "I'll bring the list on Thursday.",
        "There is no work left to share.",
        "I'll skip the next meeting too.",
      ],
      answer: 3,
      clue: "Bring the list to the next meeting and let them pick a piece.",
      explanation:
        "여자가 다음 회의에 할 일 목록을 가져와 나눠 맡기라고 했으므로, 목요일에 가져오겠다는 ③이 가장 자연스럽다.",
      translation: [
        "W: 태호야, 어젯밤 팀 저녁도 또 빠졌더라.",
        "M: 발표 분석을 끝내야 했어.",
        "W: 이번 달에 팀 행사만 세 번째 빠진 거야.",
        "M: 누군가는 그 일을 해야 하잖아.",
        "W: 그런데 그 누군가는 늘 너지?",
        "M: 내가 물어봐도 아무도 손을 안 들어.",
        "W: 물어본 거야, 아니면 그냥 네가 시작해 버린 거야?",
        "M: 누가 나설 틈도 없이 내가 시작한 것 같기도 해.",
        "W: 그럼 그 일이 해야 할 일이라는 걸 아무도 배우지 못한 거지.",
        "M: 결국 내가 맡기도록 길들인 셈이네.",
        "W: 다음 회의에 할 일 목록을 가져와서 각자 고르게 해.",
        "M: 목요일에 목록 가져갈게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Seowon이 Junhyuk에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Seowon : ________________",
      lines: [
        [
          "M",
          "Seowon and Junhyuk are preparing a group presentation that is due on Friday. " +
            "They divided the work two weeks ago, and Junhyuk offered to build the slides. " +
            "He has worked hard on them, and every slide is carefully made. " +
            "The problem is that he has made forty of them, " +
            "far more than the ten-minute limit could ever allow. " +
            "When Seowon times a practice run on Wednesday afternoon, it takes twenty-six minutes, " +
            "and they are still in the middle of the background section when she stops the clock. " +
            "She knows from last term that the teacher stops any group at exactly ten minutes, " +
            "with no warning and no extra time, whatever is left on the screen. " +
            "Their strongest evidence, the survey they ran themselves, sits on the last few slides, " +
            "which means the class would never see the part that actually proves their point. " +
            "Seowon does not want to sound as though his work was wasted, " +
            "but she wants to tell him that they have to cut the slides down " +
            "so that the ending is reached before the time runs out. " +
            "In this situation, what would Seowon most likely say to Junhyuk?",
        ],
      ],
      choices: [
        "Let's cut it down so we reach the ending.",
        "Let's add a few more slides to the middle.",
        "We should ask for a longer time slot.",
        "I'll present the whole thing by myself.",
        "Let's move the presentation to next week.",
      ],
      answer: 1,
      clue: "She knows from last term that the teacher stops any group at exactly ten minutes, with no warning and no extra time, whatever is left on the screen.",
      explanation:
        "서원이는 가장 강한 근거가 있는 마지막 부분까지 시간 안에 가려면 슬라이드를 줄여야 한다고 말하려 하므로 ①이 가장 적절하다.",
      translation: [
        "M: 서원이와 준혁이는 금요일이 마감인 모둠 발표를 준비하고 있습니다. 두 사람은 2주 전에 일을 나눴고, 준혁이가 슬라이드를 맡겠다고 했습니다. 준혁이는 열심히 했고, 한 장 한 장 정성껏 만들었습니다. 문제는 그것을 마흔 장이나 만들었다는 것입니다. 10분 제한으로는 도저히 감당할 수 없는 양이지요. 수요일 오후에 서원이가 연습 시간을 재어 보니 26분이 걸렸고, 시계를 멈췄을 때 두 사람은 아직 배경 설명 중간에 있었습니다. 서원이는 지난 학기 경험으로, 선생님이 정확히 10분에 어느 모둠이든 멈추게 한다는 것을 압니다. 미리 알려 주지도 않고, 화면에 무엇이 남았든 더 주지도 않습니다. 두 사람이 직접 한 설문이라는 가장 강한 근거는 마지막 몇 장에 있고, 그러면 자기들 주장을 실제로 증명하는 부분을 반 아이들이 보지 못하게 됩니다. 서원이는 준혁이의 수고가 헛되었다는 말처럼 들리지 않기를 바라지만, 시간이 끝나기 전에 마지막까지 가려면 슬라이드를 줄여야 한다고 말하고 싶습니다. 이런 상황에서 서원이가 준혁이에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 여자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "Hello, everyone. Today I want to talk about how animals find their way home. " +
            "Take the homing pigeon. Released hundreds of kilometers away, " +
            "in a place it has never seen, it turns and flies straight back to its loft. " +
            "For a long time nobody could explain this. " +
            "We now know the birds use several systems at once. " +
            "They read the position of the sun, which gives them a compass direction. " +
            "They sense the earth's magnetic field, which works even under cloud. " +
            "And when they get close, they switch to smell, " +
            "recognizing the particular mix of odors carried on the wind near their home. " +
            "Block any one of these and the pigeon still gets back, just more slowly. " +
            "Block two and it struggles. The reliability comes not from one brilliant sense " +
            "but from three ordinary ones checking each other.",
        ],
      ],
      choices: [
        "why pigeons were once used to carry messages",
        "how birds choose where to build their nests",
        "why some birds migrate in large groups",
        "how pigeons combine several senses to navigate",
        "how the earth's magnetic field is measured",
      ],
      answer: 4,
      clue: "The reliability comes not from one brilliant sense but from three ordinary ones checking each other.",
      explanation:
        "여자는 전서구가 해의 위치, 지구 자기장, 냄새라는 세 가지 감각을 함께 써서 집을 찾는다고 설명한다. 따라서 답은 ④이다.",
      translation: [
        "W: 안녕하세요, 여러분. 오늘은 동물이 어떻게 집을 찾아오는지 이야기하려 합니다. 전서구를 봅시다. 수백 킬로미터 떨어진, 한 번도 본 적 없는 곳에서 풀어 주어도 방향을 돌려 제 비둘기장으로 곧장 날아갑니다. 오랫동안 아무도 이것을 설명하지 못했습니다. 이제 우리는 이 새들이 여러 체계를 동시에 쓴다는 것을 압니다. 해의 위치를 읽어 방향을 잡습니다. 지구 자기장을 느끼는데, 이것은 구름 아래에서도 작동합니다. 그리고 가까워지면 냄새로 바꿉니다. 집 근처 바람에 실려 오는 특유의 냄새 조합을 알아보는 것이지요. 이 중 하나를 막아도 비둘기는 돌아옵니다. 더 느릴 뿐입니다. 둘을 막으면 힘들어합니다. 그 믿음직함은 하나의 뛰어난 감각이 아니라 평범한 세 감각이 서로를 확인하는 데서 옵니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 비둘기의 길찾기 수단이 아닌 것은?",
      lines: [
        ["W", "Hello, everyone. Today I want to talk about how animals find their way home."],
        ["W", "Take the homing pigeon. Released hundreds of kilometers away, in a place it has never seen, it turns and flies straight back to its loft."],
        ["W", "We now know the birds use several systems at once."],
        ["W", "They read the position of the sun, which gives them a compass direction."],
        ["W", "They sense the earth's magnetic field, which works even under cloud."],
        ["W", "And when they get close, they switch to smell, recognizing the particular mix of odors carried on the wind near their home."],
        ["W", "Block any one of these and the pigeon still gets back, just more slowly."],
      ],
      choices: [
        "the position of the sun",
        "the sound of running water",
        "the earth's magnetic field",
        "odors carried on the wind",
        "several systems working at once",
      ],
      answer: 2,
      clue: "They read the position of the sun, which gives them a compass direction.",
      explanation:
        "해의 위치, 지구 자기장, 바람에 실린 냄새, 여러 체계를 동시에 쓰는 것은 언급되지만 흐르는 물소리는 언급되지 않았다. 따라서 답은 ②이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
