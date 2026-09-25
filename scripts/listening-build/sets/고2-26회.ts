/** 고2 듣기 26회 — 사람이 직접 쓴 회차 (2026-09-25) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고2 26회",
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
          "Good evening, everyone. This is Minseok Ha from the student volunteer center. " +
            "I am writing about the tutoring programme that starts in two weeks. " +
            "Twenty-eight of you have signed up as tutors, which is more than we have ever had. " +
            "The problem is that twenty-five of you chose mathematics, " +
            "and only three chose reading, which is what the children asked for most. " +
            "So we have a room full of maths tutors and a waiting list for reading. " +
            "If you are comfortable reading picture books aloud, please change your subject. " +
            "You do not need to be a strong reader yourself. " +
            "You need to be someone who will not rush a seven-year-old. " +
            "Change your subject on the sign-up page by Friday. Thank you.",
        ],
      ],
      choices: [
        "자원봉사자를 새로 모집하려고",
        "읽기 지도로 과목을 바꿔 달라고 부탁하려고",
        "봉사 시간 인정 기준을 알리려고",
        "수학 지도 교재를 안내하려고",
        "봉사 시작일 변경을 알리려고",
      ],
      answer: 2,
      clue: "If you are comfortable reading picture books aloud, please change your subject.",
      explanation:
        "남자는 수학 지도자는 넘치고 읽기 지도자는 부족하다며 과목을 읽기로 바꿔 달라고 부탁한다. 따라서 답은 ②이다.",
      translation: [
        "M: 여러분, 안녕하세요. 학생 봉사 센터 하민석입니다. 2주 뒤에 시작하는 학습 지원 활동 때문에 씁니다. 스물여덟 분이 지도자로 신청해 주셨는데, 여태 가장 많은 수입니다. 문제는 그중 스물다섯 분이 수학을 골랐고, 아이들이 가장 많이 원한 읽기는 세 분뿐이라는 것입니다. 그래서 수학 지도자는 방을 가득 채웠고 읽기는 대기 명단이 생겼습니다. 그림책을 소리 내어 읽어 주는 것이 어렵지 않다면 과목을 바꿔 주세요. 여러분이 대단한 독서가일 필요는 없습니다. 일곱 살 아이를 재촉하지 않을 사람이면 됩니다. 금요일까지 신청 화면에서 과목을 바꿔 주시기 바랍니다. 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 여자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Chaerin, I've been reading three chapters ahead of every class."],
        ["W", "Ahead? So you arrive already knowing the material."],
        ["M", "That's the idea. Then the lesson is just review."],
        ["W", "How much of the lesson do you actually listen to?"],
        ["M", "Honestly, not much. I already read it."],
        ["W", "And what does the teacher spend the hour doing?"],
        ["M", "Explaining why things work, mostly."],
        ["W", "That's the part no textbook gives you, and you're sleeping through it."],
        ["M", "I thought reading ahead was the responsible thing."],
        ["W", "It is, if you read to find questions rather than answers."],
        ["M", "So I should arrive with a list of things I didn't follow."],
        ["W", "Exactly. Read ahead to get confused on purpose."],
      ],
      choices: [
        "예습보다 복습이 중요하다",
        "수업은 집중해서 들어야 한다",
        "교과서는 여러 번 읽어야 한다",
        "질문은 수업 중에 해야 한다",
        "예습은 질문을 찾기 위해 해야 한다",
      ],
      answer: 5,
      clue: "Exactly. Read ahead to get confused on purpose.",
      explanation:
        "여자는 답이 아니라 질문을 찾으려고 미리 읽어야 한다며, 일부러 막히려고 예습하라고 말한다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 채린아, 나 모든 수업을 세 단원씩 앞서서 읽고 있어.",
        "W: 앞서서? 그럼 이미 알고 수업에 들어가는 거네.",
        "M: 그게 목적이야. 그러면 수업은 복습이 되니까.",
        "W: 수업은 실제로 얼마나 들어?",
        "M: 솔직히 별로. 이미 읽었으니까.",
        "W: 선생님은 그 한 시간에 뭘 하시는데?",
        "M: 주로 왜 그렇게 되는지 설명하시지.",
        "W: 그게 어떤 교과서도 주지 않는 부분인데, 너는 거기서 졸고 있는 거야.",
        "M: 미리 읽는 게 성실한 거라고 생각했어.",
        "W: 성실하지. 답이 아니라 질문을 찾으려고 읽는다면.",
        "M: 그럼 못 따라간 것들을 적어서 들어가야겠네.",
        "W: 그래. 일부러 막히려고 미리 읽어.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Consider what happens when an expert explains their own field to a beginner. " +
            "It usually goes worse than anyone expects, and not because the expert is unclear. " +
            "They are extremely clear. The problem is what they have stopped noticing. " +
            "After ten years, the steps that once took effort have folded into one another, " +
            "and what remains in their mind is a single smooth move. " +
            "When they describe it, they describe the smooth move, " +
            "because the smaller steps are no longer visible to them. " +
            "The beginner hears one sentence where six things happened. " +
            "This is why the best teacher of a subject is often " +
            "not the person who knows it best, " +
            "but the person who learned it most recently and still remembers " +
            "where the ground was uneven.",
        ],
      ],
      choices: [
        "전문가에게 배워야 실력이 는다",
        "설명은 짧을수록 좋다",
        "잘 아는 사람일수록 초보의 어려움을 보지 못한다",
        "배움에는 반복이 필요하다",
        "질문을 많이 해야 잘 배운다",
      ],
      answer: 3,
      clue: "not the person who knows it best, but the person who learned it most recently",
      explanation:
        "남자는 익숙해지면 작은 단계들이 보이지 않게 된다며, 가장 최근에 배운 사람이 오히려 잘 가르친다고 말한다. 따라서 답은 ③이다.",
      translation: [
        "M: 전문가가 자기 분야를 초보에게 설명할 때 무슨 일이 일어나는지 생각해 보세요. 대개 모두의 예상보다 잘되지 않는데, 전문가가 불분명해서가 아닙니다. 그들은 아주 분명합니다. 문제는 그들이 더는 알아채지 못하게 된 것들입니다. 10년이 지나면 한때 힘이 들던 단계들이 서로 접혀 들어가고, 머릿속에 남는 것은 하나의 매끄러운 동작입니다. 설명할 때 그들은 그 매끄러운 동작을 설명합니다. 더 작은 단계들이 이제 그들에게 보이지 않기 때문입니다. 초보자는 여섯 가지 일이 일어난 자리에서 한 문장을 듣습니다. 그래서 어떤 분야를 가장 잘 가르치는 사람은 종종 그것을 가장 잘 아는 사람이 아니라, 가장 최근에 배워서 어디가 울퉁불퉁했는지 아직 기억하는 사람입니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["M", "Chaerin, is this the corner you turned into a sewing station?"],
        ["W", "Yes, the home economics room finally has one."],
        ["M", "There's a sewing machine at the right end of the table."],
        ["W", "It's the only one that still takes thick fabric."],
        ["M", "And a pinboard of patterns hangs on the wall."],
        ["W", "We pin the paper patterns there so they don't crease."],
        ["M", "I count three spool racks on the table."],
        ["W", "There are four. One is behind the machine."],
        ["M", "The tall lamp beside the table looks bright."],
        ["W", "You need real light for dark thread."],
        ["M", "And a basket of fabric scraps sits under the table."],
        ["W", "Nothing gets thrown away until it's smaller than a coin."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "There are four. One is behind the machine.",
      explanation:
        "남자가 실패 걸이가 세 개라고 하자 여자가 네 개라고 바로잡는다. 그림에는 세 개가 그려져 있으므로 답은 ③이다.",
      figure: {
        kind: "scene",
        scene:
          "A sewing station drawn as one wide picture, clean black line art on white, no writing or letters or numbers anywhere. " +
          "A SEWING MACHINE stands at the right end of a long table. " +
          "A PINBOARD covered with pinned paper patterns hangs on the wall above the table. " +
          "EXACTLY THREE SMALL SPOOL RACKS holding thread stand on the table, spaced well apart so all three are easy to count and none overlap. " +
          "A TALL FLOOR LAMP stands beside the table. " +
          "A BASKET OF FABRIC SCRAPS sits on the floor under the table.",
      },
      translation: [
        "M: 채린아, 이게 바느질 자리로 꾸민 구석이야?",
        "W: 응, 가정실에 드디어 하나 생겼어.",
        "M: 탁자 오른쪽 끝에 재봉틀이 있네.",
        "W: 두꺼운 천이 아직 들어가는 건 그것뿐이야.",
        "M: 그리고 벽에 본을 꽂아 둔 게시판이 걸려 있어.",
        "W: 종이 본이 구겨지지 않게 거기 꽂아 둬.",
        "M: 탁자에 실패 걸이가 세 개 보여.",
        "W: 네 개야. 하나는 재봉틀 뒤에 있어.",
        "M: 탁자 옆에 있는 큰 조명이 밝아 보인다.",
        "W: 어두운 실을 보려면 제대로 된 빛이 필요해.",
        "M: 그리고 탁자 밑에 자투리 천 바구니가 있네.",
        "W: 동전보다 작아지기 전에는 아무것도 안 버려.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 여자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Chaerin, the club orientation is at four in the small hall."],
        ["W", "I know. Are the name tags ready?"],
        ["M", "Forty-five of them, printed and in the tray."],
        ["W", "Good. And the slide deck for the introduction?"],
        ["M", "Finished last night. It's on the shared drive."],
        ["W", "Then what's still open?"],
        ["M", "Nobody has collected the snacks from the shop."],
        ["W", "The shop by the east gate? That's a ten-minute walk."],
        ["M", "Fifteen with two boxes. And they close at three thirty."],
        ["W", "Can't you go? It's only two forty now."],
        ["M", "I have to set up the projector and test the sound."],
        ["W", "Then I'll walk over and bring the snacks back."],
      ],
      choices: [
        "이름표 인쇄하기",
        "발표 자료 만들기",
        "프로젝터 설치하기",
        "간식 가져오기",
        "소리 확인하기",
      ],
      answer: 4,
      clue: "Then I'll walk over and bring the snacks back.",
      explanation:
        "이름표와 발표 자료는 끝났고 남자는 프로젝터와 소리를 맡아야 하므로, 여자가 가게에서 간식을 가져오기로 한다. 따라서 답은 ④이다.",
      translation: [
        "M: 채린아, 동아리 설명회가 4시에 소강당에서 있어.",
        "W: 알아. 이름표는 다 됐어?",
        "M: 마흔다섯 개, 인쇄해서 쟁반에 뒀어.",
        "W: 좋아. 소개용 발표 자료는?",
        "M: 어젯밤에 끝냈어. 공유 폴더에 있어.",
        "W: 그럼 아직 남은 게 뭐야?",
        "M: 가게에서 간식을 아무도 안 가져왔어.",
        "W: 동문 옆 가게? 걸어서 10분인데.",
        "M: 상자 두 개 들면 15분. 그리고 3시 30분에 닫아.",
        "W: 네가 못 가? 지금 2시 40분인데.",
        "M: 나는 프로젝터 설치하고 소리 확인해야 해.",
        "W: 그럼 내가 걸어가서 간식 가져올게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 남자가 지불할 금액을 고르시오.",
      lines: [
        ["W", "Welcome to Fernhill Garden Center. How can I help you?"],
        ["M", "Eight seedling trays and three bags of compost, please."],
        ["W", "Trays are seven dollars each and compost is eleven a bag."],
        ["M", "So fifty-six dollars plus thirty-three."],
        ["W", "Eighty-nine in total. Would you like the plant labels as well?"],
        ["M", "How much are the labels?"],
        ["W", "Four dollars for a pack of fifty."],
        ["M", "We'll skip the labels. We write on tape."],
        ["W", "No problem. Are you with a school garden club?"],
        ["M", "We are. Here's the card."],
        ["W", "Then I can take twenty percent off the compost, but not the trays."],
        ["M", "Thank you. I'll pay in cash."],
      ],
      choices: ["$71.20", "$82.40", "$79.40", "$89.00", "$93.00"],
      answer: 2,
      clue: "Then I can take twenty percent off the compost, but not the trays.",
      explanation:
        "퇴비 3포대 33달러에서 20퍼센트를 빼면 26.40달러이고, 할인이 안 되는 모판 8개 56달러를 더하면 82.40달러이다. 따라서 답은 ②이다.",
      translation: [
        "W: 펀힐 원예 센터입니다. 무엇을 도와드릴까요?",
        "M: 모판 여덟 개랑 퇴비 세 포대 주세요.",
        "W: 모판은 하나에 7달러, 퇴비는 한 포대에 11달러입니다.",
        "M: 그럼 56달러에 33달러네요.",
        "W: 모두 89달러입니다. 식물 이름표도 하시겠어요?",
        "M: 이름표는 얼마예요?",
        "W: 쉰 장 한 묶음에 4달러입니다.",
        "M: 이름표는 뺄게요. 테이프에 써요.",
        "W: 괜찮습니다. 학교 원예 동아리세요?",
        "M: 네. 여기 카드요.",
        "W: 그럼 퇴비값에서 20퍼센트를 빼 드립니다. 모판은 안 돼요.",
        "M: 감사합니다. 현금으로 낼게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 여자가 교환 학생 신청을 미루는 이유를 고르시오.",
      lines: [
        ["M", "Chaerin, you didn't submit the exchange application?"],
        ["W", "I'm waiting until next year."],
        ["M", "Was your language score too low?"],
        ["W", "No, I cleared that in the spring."],
        ["M", "Then is it the cost? The programme fee went up."],
        ["W", "My aunt offered to cover it, so that's settled."],
        ["M", "So what's holding you back?"],
        ["W", "My grandmother had surgery last month and I'm helping at home."],
        ["M", "How long will that go on?"],
        ["W", "Through the winter at least. Next year the timing will be right."],
      ],
      choices: [
        "어학 점수가 모자라서",
        "비용이 부담스러워서",
        "성적이 떨어져서",
        "다른 학교로 옮겨서",
        "할머니를 돌봐야 해서",
      ],
      answer: 5,
      clue: "My grandmother had surgery last month and I'm helping at home.",
      explanation:
        "어학 점수도 비용도 해결되었지만, 수술하신 할머니 때문에 겨울 내내 집안일을 도와야 하기 때문이다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 채린아, 교환 학생 지원서 안 냈어?",
        "W: 내년까지 미루려고.",
        "M: 어학 점수가 모자랐어?",
        "W: 아니, 봄에 넘겼어.",
        "M: 그럼 비용 때문이야? 프로그램비가 올랐잖아.",
        "W: 이모가 내 주신대. 그건 해결됐어.",
        "M: 그럼 뭐가 걸리는데?",
        "W: 지난달에 할머니가 수술하셔서 집에서 돕고 있어.",
        "M: 언제까지 그래야 하는데?",
        "W: 적어도 겨울까지는. 내년이면 시기가 맞을 거야.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, Riverbend Bird Walk에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["M", "Chaerin, have you heard about the Riverbend Bird Walk?"],
        ["W", "I saw it on the library board. When is it?"],
        ["M", "Every second Saturday, from six to eight in the morning."],
        ["W", "Six in the morning is early. Where does it start?"],
        ["M", "At the footbridge behind the water treatment plant."],
        ["W", "I know that bridge. How far do you walk?"],
        ["M", "About three kilometers along the riverbank and back."],
        ["W", "That's gentle enough. Do we need binoculars?"],
        ["M", "They lend them at the start, ten pairs, first come first served."],
        ["W", "So we should get there early."],
        ["M", "Ten minutes early is usually enough."],
        ["W", "Then let's go on the next one."],
      ],
      choices: ["열리는 요일", "출발 장소", "참가비", "걷는 거리", "쌍안경 대여"],
      answer: 3,
      clue: "참가비는 대화에서 언급되지 않았다.",
      explanation:
        "요일(격주 토요일 아침), 출발 장소(정수장 뒤 보행교), 거리(3킬로미터), 쌍안경 대여(열 개 선착순)는 언급되지만 참가비는 언급되지 않았다. 따라서 답은 ③이다.",
      translation: [
        "M: 채린아, 리버벤드 새 관찰 걷기 들어 봤어?",
        "W: 도서관 게시판에서 봤어. 언제야?",
        "M: 격주 토요일, 아침 6시부터 8시까지.",
        "W: 아침 6시는 이르다. 어디서 출발해?",
        "M: 정수장 뒤 보행교에서.",
        "W: 그 다리 알아. 얼마나 걷는데?",
        "M: 강둑을 따라 3킬로미터쯤 갔다가 돌아와.",
        "W: 그 정도면 무난하네. 쌍안경 있어야 해?",
        "M: 출발할 때 빌려줘. 열 개, 선착순이야.",
        "W: 그럼 일찍 가야겠네.",
        "M: 10분 일찍이면 보통 충분해.",
        "W: 그럼 다음번에 가자.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Stonegate Youth Theater에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "W",
          "Let me tell you about the Stonegate Youth Theater. " +
            "It has run from the same converted warehouse since 2004. " +
            "The company puts on three full productions a year, in spring, summer and winter. " +
            "Anyone between fifteen and twenty-two may join, and auditions are held in January only. " +
            "Members pay no fee, because the theater is funded by ticket sales and a city grant. " +
            "Rehearsals are on Tuesday and Thursday evenings, and attendance is checked each time. " +
            "The building has no lift, so the upper rehearsal room is reached by stairs.",
        ],
      ],
      choices: [
        "회비를 내야 한다",
        "2004년부터 같은 건물을 써 왔다",
        "해마다 세 편을 올린다",
        "오디션은 1월에만 본다",
        "연습은 화요일과 목요일 저녁에 한다",
      ],
      answer: 1,
      clue: "Members pay no fee, because the theater is funded by ticket sales and a city grant.",
      explanation:
        "회비가 없다고 했으므로 회비를 내야 한다는 ①은 내용과 다르다. 따라서 답은 ①이다.",
      translation: [
        "W: 스톤게이트 청소년 극단을 소개해 드리겠습니다. 2004년부터 창고를 고친 같은 건물에서 운영해 왔습니다. 해마다 봄, 여름, 겨울에 한 편씩 모두 세 편을 올립니다. 열다섯 살부터 스물두 살까지 누구나 들어올 수 있고, 오디션은 1월에만 봅니다. 극단은 표 판매와 시 지원금으로 운영되기 때문에 단원은 회비를 내지 않습니다. 연습은 화요일과 목요일 저녁에 하고, 매번 출석을 확인합니다. 건물에 승강기가 없어서 위층 연습실은 계단으로 올라갑니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 신청할 진로 특강을 고르시오.",
      lines: [
        ["M", "Chaerin, let's sign up for one of the career talks."],
        ["W", "I saw the list this morning. There are five of them."],
        ["M", "Let's narrow it down. Online or in person?"],
        ["W", "Which would you rather?"],
        ["M", "In person. I want to ask questions afterward."],
        ["W", "Agreed. Online I never end up asking anything."],
        ["M", "Should it include a hands-on session, do you think?"],
        ["W", "I'd say yes. A talk alone doesn't tell me what the work feels like."],
        ["M", "That was my thinking too. Watching is not the same as trying."],
        ["W", "Right. And the length? I can't do a whole day."],
        ["M", "Neither can I, with the exam coming up."],
        ["W", "Then under three hours."],
        ["M", "That rules out two more, doesn't it?"],
        ["W", "It does. Only one fits all three conditions."],
        ["M", "Applications close on Wednesday, so we shouldn't wait."],
        ["W", "Let's register during lunch tomorrow."],
        ["M", "I'll bring my student number this time."],
        ["W", "Good. I always forget mine and have to go back."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "In person. I want to ask questions afterward.",
      explanation:
        "대면이고, 실습이 있으며, 세 시간 미만인 특강을 고른다. 세 조건을 모두 채우는 것은 ④이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Format: Online / Hands-on: Yes / Length: 2 hours" },
          { no: 2, label: "②", value: "Format: In person / Hands-on: No / Length: 1.5 hours" },
          { no: 3, label: "③", value: "Format: In person / Hands-on: Yes / Length: 5 hours" },
          { no: 4, label: "④", value: "Format: In person / Hands-on: Yes / Length: 2.5 hours" },
          { no: 5, label: "⑤", value: "Format: Online / Hands-on: No / Length: 1 hour" },
        ],
      },
      translation: [
        "M: 채린아, 진로 특강 하나 신청하자.",
        "W: 오늘 아침에 목록 봤어. 다섯 개 있더라.",
        "M: 하나씩 줄여 보자. 온라인이야, 대면이야?",
        "W: 너는 뭐가 더 좋아?",
        "M: 대면. 끝나고 질문하고 싶어.",
        "W: 동의해. 온라인이면 나는 결국 아무것도 안 물어.",
        "M: 실습이 들어가야 할까?",
        "W: 그래야지. 말만 들어서는 그 일이 어떤 느낌인지 모르겠어.",
        "M: 나도 그 생각이었어. 보는 건 해 보는 거랑 다르니까.",
        "W: 맞아. 시간은? 나는 하루 종일은 안 돼.",
        "M: 나도. 시험도 다가오고.",
        "W: 그럼 세 시간 미만.",
        "M: 그럼 두 개가 더 빠지는 거지?",
        "W: 그렇지. 세 조건 다 맞는 건 하나뿐이야.",
        "M: 신청이 수요일에 닫히니까 미루면 안 돼.",
        "W: 내일 점심시간에 등록하자.",
        "M: 이번엔 학번 가져올게.",
        "W: 좋아. 나는 늘 까먹어서 다시 갔다 와.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["W", "Minseok, is the science lab open for the project this weekend?"],
        ["M", "Saturday only, and you need a teacher present."],
        ["W", "I don't know which teacher is on duty."],
        ["M", "The roster is pinned beside the lab door. Check it on your way out."],
      ],
      choices: [
        "The lab has no door.",
        "I'll check the roster on my way out.",
        "I already finished the project.",
        "No teacher is ever there.",
        "I'll go on Sunday instead.",
      ],
      answer: 2,
      clue: "The roster is pinned beside the lab door. Check it on your way out.",
      explanation:
        "남자가 실험실 문 옆 당번표를 보라고 했으므로, 나가는 길에 확인하겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 민석아, 이번 주말에 과제 때문에 실험실 열어?",
        "M: 토요일만. 그리고 선생님이 계셔야 해.",
        "W: 어느 선생님이 당번인지 모르겠어.",
        "M: 당번표가 실험실 문 옆에 붙어 있어. 나가는 길에 봐.",
        "W: 나가는 길에 당번표 확인할게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["M", "Chaerin, my scholarship form keeps getting rejected."],
        ["W", "What does the error message say?"],
        ["M", "Only that a required field is empty."],
        ["W", "Scroll to the bottom. The guardian's phone number is easy to miss."],
      ],
      choices: [
        "My form was accepted already.",
        "There is no guardian field.",
        "I'll apply again next year.",
        "The message says nothing.",
        "I'll check the bottom field.",
      ],
      answer: 5,
      clue: "Scroll to the bottom. The guardian's phone number is easy to miss.",
      explanation:
        "여자가 맨 아래 보호자 전화번호 칸을 보라고 했으므로, 아래 칸을 확인하겠다는 ⑤가 가장 자연스럽다.",
      translation: [
        "M: 채린아, 내 장학금 신청서가 자꾸 반려돼.",
        "W: 오류 메시지에 뭐라고 나와?",
        "M: 필수 칸이 비어 있다는 말만.",
        "W: 맨 아래로 내려 봐. 보호자 전화번호를 놓치기 쉬워.",
        "M: 아래 칸 확인할게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Chaerin, you've been rewriting the same club notice all week."],
        ["W", "I want everyone to understand it the first time."],
        ["M", "How many versions have you made?"],
        ["W", "Nine, and I keep going back to the third one."],
        ["M", "Have you shown any of them to a member?"],
        ["W", "No. I'll show it when it's clear."],
        ["M", "But clear to whom? You already know what it means."],
        ["W", "So I can't test it from where I'm sitting."],
        ["M", "Not once. A notice is only clear if someone else says so."],
        ["W", "I've been polishing instead of checking."],
        ["M", "Send the third one to two members and ask what they think it says."],
      ],
      choices: [
        "I'll write a tenth version tonight.",
        "Nobody reads club notices anyway.",
        "I'll send it to two members today.",
        "My notice is already perfectly clear.",
        "I'd rather not post anything.",
      ],
      answer: 3,
      clue: "Send the third one to two members and ask what they think it says.",
      explanation:
        "남자가 세 번째 판본을 부원 두 명에게 보내 어떻게 읽히는지 물어보라고 했으므로, 오늘 보내겠다는 ③이 가장 자연스럽다.",
      translation: [
        "M: 채린아, 일주일 내내 같은 동아리 공지를 다시 쓰고 있네.",
        "W: 모두가 한 번에 알아들었으면 해서.",
        "M: 판본을 몇 개나 만들었어?",
        "W: 아홉 개. 그런데 자꾸 세 번째로 돌아가.",
        "M: 그중 하나라도 부원한테 보여 줬어?",
        "W: 아니. 분명해지면 보여 주려고.",
        "M: 누구한테 분명한 건데? 너는 이미 뜻을 알잖아.",
        "W: 그럼 내 자리에서는 확인할 수가 없는 거네.",
        "M: 한 번도 못 해. 공지는 다른 사람이 그렇다고 해야 분명한 거야.",
        "W: 확인 대신 다듬기만 했구나.",
        "M: 세 번째 판본을 부원 두 명한테 보내고 무슨 말로 읽히는지 물어봐.",
        "W: 오늘 두 명한테 보낼게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Minseok, you've been eating lunch at your desk every day."],
        ["M", "It saves twenty minutes, and I use them for the assignment."],
        ["W", "How productive are those twenty minutes?"],
        ["M", "Not very. I mostly reread the same paragraph."],
        ["W", "And the afternoon? How does that go?"],
        ["M", "Slow. By fifth period I'm staring at the page."],
        ["W", "So the twenty minutes you saved cost you two hours."],
        ["M", "I hadn't drawn that line between them."],
        ["W", "The break isn't lost time. It's what pays for the afternoon."],
        ["M", "Then what should I do with lunch?"],
        ["W", "Eat somewhere that isn't your desk, and go outside if you can."],
      ],
      choices: [
        "I'll eat outside tomorrow.",
        "I'll skip lunch entirely.",
        "My afternoons are already sharp.",
        "I never eat at my desk.",
        "Twenty minutes means nothing.",
      ],
      answer: 1,
      clue: "Eat somewhere that isn't your desk, and go outside if you can.",
      explanation:
        "여자가 책상이 아닌 곳에서, 가능하면 밖에서 먹으라고 했으므로, 내일 밖에서 먹겠다는 ①이 가장 자연스럽다.",
      translation: [
        "W: 민석아, 너 매일 책상에서 점심을 먹더라.",
        "M: 20분이 절약돼. 그 시간을 과제에 써.",
        "W: 그 20분은 얼마나 잘돼?",
        "M: 별로. 대부분 같은 문단을 다시 읽어.",
        "W: 오후는 어때?",
        "M: 느려. 5교시쯤이면 책만 쳐다보고 있어.",
        "W: 그럼 아낀 20분이 두 시간을 쓰게 한 거네.",
        "M: 그 둘을 이어서 생각해 본 적은 없어.",
        "W: 쉬는 시간은 잃는 시간이 아니야. 오후 값을 치르는 거야.",
        "M: 그럼 점심은 어떻게 해야 해?",
        "W: 책상이 아닌 데서 먹어. 가능하면 밖으로 나가고.",
        "M: 내일은 밖에서 먹을게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Seunga가 Doyeon에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Seunga : ________________",
      lines: [
        [
          "W",
          "Seunga and Doyeon are running the school's plant sale on Saturday morning. " +
            "Doyeon has grown eighty seedlings from seed over two months and they look healthy. " +
            "On Friday afternoon Seunga notices that he has left every tray in full afternoon sun " +
            "on the concrete outside the greenhouse, where the surface holds heat until evening. " +
            "The leaves on the outer trays are already curling at the edges. " +
            "There is shaded space under the greenhouse eaves that is empty and only three steps away. " +
            "Seunga knows he moved them outside so they would be easy to load in the morning, " +
            "which is sensible, and that the shade is just as close to the gate. " +
            "She wants to tell him to move the trays into the shade before they wilt. " +
            "In this situation, what would Seunga most likely say to Doyeon?",
        ],
      ],
      choices: [
        "We should water them again this evening.",
        "Let's grow twice as many next year.",
        "We should cancel the plant sale.",
        "Let's move the trays into the shade now.",
        "Let's load them into the van tonight.",
      ],
      answer: 4,
      clue: "She wants to tell him to move the trays into the shade before they wilt.",
      explanation:
        "승아는 모판이 시들기 전에 그늘로 옮기자고 말하려 하므로 ④가 가장 적절하다.",
      translation: [
        "W: 승아와 도연이는 토요일 아침에 열리는 학교 식물 판매를 준비하고 있습니다. 도연이는 두 달 동안 씨앗에서 모종 여든 개를 길렀고 상태도 좋습니다. 금요일 오후, 승아는 도연이가 모판을 전부 온실 밖 콘크리트 위, 한낮 볕이 그대로 드는 곳에 두었다는 것을 알아챕니다. 그 바닥은 저녁까지 열을 품고 있습니다. 바깥쪽 모판의 잎은 벌써 가장자리가 말리고 있습니다. 온실 처마 밑에는 그늘진 빈자리가 있고, 세 걸음이면 닿습니다. 승아는 도연이가 아침에 싣기 쉬우라고 밖에 내놓았다는 것을 알고, 그것이 나름 합리적이라는 것도, 그늘도 정문에서 똑같이 가깝다는 것도 압니다. 승아는 모판이 시들기 전에 그늘로 옮기자고 말하고 싶습니다. 이런 상황에서 승아가 도연이에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 여자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "Hello, everyone. Today I want to talk about why we can catch a ball " +
            "that our eyes have not finished seeing. " +
            "Light takes time to reach the eye, the eye takes time to send a signal, " +
            "and the brain takes time to make sense of it. " +
            "Altogether that is about a tenth of a second. " +
            "A ball travelling at thirty meters per second moves three meters in that time. " +
            "If we acted on what we saw, we would always reach three meters behind it. " +
            "So the brain does something else. " +
            "It predicts. It takes the last position and the speed " +
            "and puts your hand where the ball is going to be. " +
            "This is also why a ball that suddenly changes direction fools us completely. " +
            "The prediction was already made, and the hand was already on its way.",
        ],
      ],
      choices: [
        "why some people have faster reflexes than others",
        "how the brain predicts where a moving ball will be",
        "how light travels from an object to the eye",
        "why ball sports are hard to learn as an adult",
        "how athletes train their eyesight",
      ],
      answer: 2,
      clue: "It takes the last position and the speed and puts your hand where the ball is going to be.",
      explanation:
        "여자는 시각 신호에 걸리는 시간 때문에 뇌가 공의 위치를 예측해 손을 미리 보낸다고 설명한다. 따라서 답은 ②이다.",
      translation: [
        "W: 안녕하세요, 여러분. 오늘은 우리가 왜 눈이 다 보지도 못한 공을 잡을 수 있는지 이야기하려 합니다. 빛이 눈에 닿는 데 시간이 걸리고, 눈이 신호를 보내는 데 시간이 걸리고, 뇌가 그것을 이해하는 데 또 시간이 걸립니다. 다 합치면 10분의 1초쯤입니다. 초속 30미터로 날아오는 공은 그 사이에 3미터를 움직입니다. 우리가 본 것에 따라 움직인다면 우리는 늘 공보다 3미터 뒤에 손을 뻗을 것입니다. 그래서 뇌는 다른 일을 합니다. 예측합니다. 마지막 위치와 속도를 가지고, 공이 가 있을 자리에 여러분의 손을 놓습니다. 그래서 갑자기 방향이 바뀌는 공에 우리는 완전히 속습니다. 예측은 이미 끝났고, 손은 이미 가고 있었으니까요.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 내용이 아닌 것은?",
      lines: [
        ["W", "Hello, everyone. Today I want to talk about why we can catch a ball that our eyes have not finished seeing."],
        ["W", "Light takes time to reach the eye, the eye takes time to send a signal, and the brain takes time to make sense of it."],
        ["W", "Altogether that is about a tenth of a second."],
        ["W", "A ball travelling at thirty meters per second moves three meters in that time."],
        ["W", "It takes the last position and the speed and puts your hand where the ball is going to be."],
        ["W", "This is also why a ball that suddenly changes direction fools us completely."],
      ],
      choices: [
        "the eye taking time to send a signal",
        "a delay of about a tenth of a second",
        "a ball moving three meters in that time",
        "the brain using position and speed to predict",
        "wind bending the path of a thrown ball",
      ],
      answer: 5,
      clue: "Light takes time to reach the eye, the eye takes time to send a signal, and the brain takes time to make sense of it.",
      explanation:
        "눈이 신호를 보내는 데 시간이 걸린다는 것, 10분의 1초의 지연, 공이 그 사이 3미터를 움직인다는 것, 뇌가 위치와 속도로 예측한다는 것은 언급되지만 바람이 공의 길을 휘게 한다는 것은 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
