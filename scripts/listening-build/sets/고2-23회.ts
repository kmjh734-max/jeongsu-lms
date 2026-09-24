/** 고2 듣기 23회 — 사람이 직접 쓴 회차 (2026-09-25) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고2 23회",
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
          "Good morning, members of the Westbrook Community Pool. This is Daniel Kang, the facility manager. " +
            "I am writing to explain a change to our morning swim hours. " +
            "For the past three years, lap lanes have opened at six on weekday mornings. " +
            "Beginning on the first of next month, they will open at five thirty instead. " +
            "This is not because we have added staff. " +
            "It is because the city changed the bus schedule, " +
            "and the first bus to this neighborhood now arrives at five twenty. " +
            "Several of you told us you were standing outside in the cold for forty minutes. " +
            "The closing time is unchanged, so this adds half an hour to every weekday morning. " +
            "The new schedule will be posted at both entrances by Friday. Thank you.",
        ],
      ],
      choices: [
        "수영장 이용료 인상을 알리려고",
        "아침 개장 시각 변경을 알리려고",
        "버스 노선 변경을 안내하려고",
        "수영 강습 신청을 받으려고",
        "시설 점검 휴관을 알리려고",
      ],
      answer: 2,
      clue: "Beginning on the first of next month, they will open at five thirty instead.",
      explanation:
        "남자는 첫차가 5시 20분에 도착하게 되어 다음 달 1일부터 평일 아침 개장 시각을 5시 30분으로 앞당긴다고 알린다. 따라서 답은 ②이다.",
      translation: [
        "M: 웨스트브룩 주민 수영장 회원 여러분, 안녕하세요. 시설 관리자 강다니엘입니다. 아침 수영 시간 변경을 알려 드리려고 씁니다. 지난 3년 동안 평일 아침 자유 수영 레인은 6시에 열었습니다. 다음 달 1일부터는 5시 30분에 엽니다. 직원을 늘려서가 아닙니다. 시에서 버스 시간표를 바꿔, 이 동네로 오는 첫차가 이제 5시 20분에 도착하기 때문입니다. 여러분 중 몇 분이 추운 바깥에서 40분을 서 있었다고 알려 주셨습니다. 닫는 시각은 그대로여서 평일 아침마다 30분이 늘어납니다. 새 시간표는 금요일까지 두 출입구에 모두 붙이겠습니다. 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 여자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Yerin, I've started answering every message the moment it arrives."],
        ["W", "Every message? Even while you're studying?"],
        ["M", "Especially then. I hate leaving people waiting."],
        ["W", "How long does it take you to get back into the problem afterward?"],
        ["M", "A few minutes, I suppose. Maybe five."],
        ["W", "And how many messages come in during a two-hour session?"],
        ["M", "Twenty, maybe more on a group project week."],
        ["W", "So an hour and a half of your two hours is spent returning."],
        ["M", "That can't be right. Each one only takes a second to read."],
        ["W", "Reading takes a second. Getting your attention back doesn't."],
        ["M", "Then what am I supposed to do, ignore everyone?"],
        ["W", "Answer them all at once, twice a day. Nobody waits more than four hours."],
      ],
      choices: [
        "연락은 모아서 정해진 때에 답해야 한다",
        "연락은 바로 답해야 예의다",
        "공부는 조용한 곳에서 해야 한다",
        "휴대폰은 아예 꺼 두어야 한다",
        "모둠 과제는 얼굴을 보고 해야 한다",
      ],
      answer: 1,
      clue: "Answer them all at once, twice a day. Nobody waits more than four hours.",
      explanation:
        "여자는 주의를 되찾는 데 드는 시간이 크다며, 하루 두 번 모아서 한꺼번에 답하라고 말한다. 따라서 답은 ①이다.",
      translation: [
        "M: 예린아, 나 요즘 메시지 오면 바로바로 답해.",
        "W: 전부? 공부할 때도?",
        "M: 그때 특히. 사람 기다리게 하는 게 싫어서.",
        "W: 답하고 나서 문제로 돌아오는 데 얼마나 걸려?",
        "M: 몇 분쯤. 5분 정도?",
        "W: 두 시간 공부하는 동안 메시지가 몇 개나 와?",
        "M: 스무 개. 모둠 과제 있는 주에는 더 오고.",
        "W: 그럼 두 시간 중 한 시간 반을 돌아오는 데 쓰는 거네.",
        "M: 그럴 리가. 읽는 건 1초면 되는데.",
        "W: 읽는 건 1초지. 주의를 되찾는 건 아니야.",
        "M: 그럼 어떻게 해, 다 무시해?",
        "W: 하루에 두 번, 한꺼번에 답해. 아무도 네 시간 넘게 안 기다려.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "There is a habit that quietly separates people who keep improving from people who plateau. " +
            "It has nothing to do with talent or hours. " +
            "It is what they do with work that went badly. " +
            "Most of us, after a poor result, explain it. " +
            "The question was unfair, the room was loud, we were tired. " +
            "Some of these explanations are even true, " +
            "and that is exactly what makes the habit so hard to see. " +
            "A true explanation still closes the file. " +
            "Once you know why it went wrong, you stop looking. " +
            "The people who keep improving do something slower and less comfortable. " +
            "They go back to the work itself and find the specific place where it broke. " +
            "Not the reason. The place. " +
            "Because only a place can be practiced.",
        ],
      ],
      choices: [
        "실패의 원인을 정확히 알아야 한다",
        "실패는 이유가 아니라 무너진 지점을 찾아야 는다",
        "재능보다 연습 시간이 중요하다",
        "실수는 빨리 잊는 것이 좋다",
        "남의 조언을 받아들여야 한다",
      ],
      answer: 2,
      clue: "They go back to the work itself and find the specific place where it broke.",
      explanation:
        "여자는 맞는 이유조차 파일을 닫아 버린다며, 이유가 아니라 무너진 지점을 찾아야 연습할 수 있다고 말한다. 따라서 답은 ②이다.",
      translation: [
        "W: 계속 느는 사람과 정체되는 사람을 조용히 가르는 습관이 하나 있습니다. 재능이나 시간과는 상관이 없습니다. 잘 안된 결과를 두고 무엇을 하느냐입니다. 우리 대부분은 결과가 나쁘면 설명을 합니다. 문제가 불공평했다, 방이 시끄러웠다, 피곤했다. 이런 설명 중 일부는 심지어 사실이고, 바로 그 점이 이 습관을 알아보기 어렵게 만듭니다. 맞는 설명도 파일을 닫아 버립니다. 왜 잘못됐는지 알고 나면 더는 들여다보지 않게 되니까요. 계속 느는 사람들은 더 느리고 덜 편한 일을 합니다. 그 일 자체로 돌아가 정확히 어디서 무너졌는지를 찾습니다. 이유가 아니라 지점을요. 연습할 수 있는 것은 지점뿐이기 때문입니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["W", "Minwoo, is this a photo of the school's new music room?"],
        ["M", "Yes, they finished moving everything in last week."],
        ["W", "There's an upright piano against the back wall."],
        ["M", "It came from the old auditorium."],
        ["W", "And a guitar is hanging on a hook beside the door."],
        ["M", "That one belongs to the club, not to any member."],
        ["W", "I count four music stands in the middle of the room."],
        ["M", "There are five, actually. One is hidden behind the piano."],
        ["W", "The round rug under the stands looks new."],
        ["M", "It is. The parents' association donated it."],
        ["W", "And there's a framed poster of an orchestra on the side wall."],
        ["M", "Our teacher brought that from her own classroom."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "There are five, actually. One is hidden behind the piano.",
      explanation:
        "여자가 보면대가 네 개라고 하자 남자가 다섯 개라고 바로잡는다. 그림에는 네 개가 그려져 있으므로 답은 ③이다.",
      figure: {
        kind: "scene",
        scene:
          "A school music room drawn as one wide picture, clean black line art on white, no writing or letters anywhere. " +
          "An UPRIGHT PIANO stands against the back wall. " +
          "A GUITAR hangs on a hook on the wall beside a door. " +
          "Exactly FOUR MUSIC STANDS stand together in the middle of the room, clearly countable. " +
          "A ROUND RUG lies on the floor under the music stands. " +
          "A FRAMED POSTER showing an orchestra hangs on the side wall.",
      },
      translation: [
        "W: 민우야, 이게 학교 새 음악실 사진이야?",
        "M: 응, 지난주에 물건을 다 옮겼어.",
        "W: 뒷벽에 업라이트 피아노가 있네.",
        "M: 예전 강당에서 가져온 거야.",
        "W: 그리고 문 옆 고리에 기타가 걸려 있어.",
        "M: 그건 동아리 거야. 누구 개인 것 아니고.",
        "W: 방 가운데 보면대가 네 개 보여.",
        "M: 사실 다섯 개야. 하나는 피아노 뒤에 가려졌어.",
        "W: 보면대 밑 둥근 깔개는 새것 같네.",
        "M: 맞아. 학부모회에서 기증하셨어.",
        "W: 그리고 옆벽에 오케스트라 액자 포스터가 있네.",
        "M: 선생님이 원래 쓰시던 교실에서 가져오신 거야.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 남자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Minwoo, the charity bake sale opens at eleven."],
        ["M", "I know. Are all the boxes at the table yet?"],
        ["W", "Twelve boxes came this morning. I stacked them behind the table."],
        ["M", "Good. Did anyone write the price cards?"],
        ["W", "I finished those last night. They're already on the table."],
        ["M", "Then the only thing missing is the cash box."],
        ["W", "It's in the teachers' office, locked in the cabinet."],
        ["M", "Do we have change in it, or just the box?"],
        ["W", "Just the box. We need small bills from the office."],
        ["M", "I'd go, but I don't know which teacher has the key."],
        ["W", "Ms. Oh does, and she's expecting me for a meeting right now."],
        ["M", "Then I'll go get the cash box and the change myself."],
      ],
      choices: [
        "가격표 쓰기",
        "상자 옮기기",
        "돈통과 잔돈 가져오기",
        "선생님과 회의하기",
        "빵 굽기",
      ],
      answer: 3,
      clue: "Then I'll go get the cash box and the change myself.",
      explanation:
        "상자와 가격표는 끝났고 여자는 회의에 가야 하므로, 남자가 교무실에서 돈통과 잔돈을 가져오기로 한다. 따라서 답은 ③이다.",
      translation: [
        "W: 민우야, 자선 빵 판매가 11시에 시작해.",
        "M: 알아. 상자는 다 탁자에 와 있어?",
        "W: 오늘 아침에 열두 상자 왔어. 탁자 뒤에 쌓아 뒀어.",
        "M: 좋아. 가격표는 누가 썼어?",
        "W: 어젯밤에 내가 다 썼어. 벌써 탁자에 놓여 있어.",
        "M: 그럼 없는 건 돈통뿐이네.",
        "W: 교무실 장에 잠겨 있어.",
        "M: 안에 잔돈도 있어, 아니면 통만 있어?",
        "W: 통만. 교무실에서 잔돈도 받아야 해.",
        "M: 내가 가고 싶은데, 어느 선생님이 열쇠를 갖고 계신지 몰라.",
        "W: 오 선생님이셔. 그런데 지금 나랑 회의하기로 하셨어.",
        "M: 그럼 내가 가서 돈통이랑 잔돈 가져올게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 여자가 지불할 금액을 고르시오.",
      lines: [
        ["M", "Welcome to Pine Hill Pottery Studio. What can I do for you?"],
        ["W", "I'd like to book the beginner wheel class for four people."],
        ["M", "The wheel class is twenty-five dollars per person."],
        ["W", "So one hundred dollars for the four of us."],
        ["M", "That's right. Would you like the glazing option afterward?"],
        ["W", "How much does that add?"],
        ["M", "Glazing is eight dollars a person, so thirty-two more."],
        ["W", "Let's skip the glazing this time."],
        ["M", "Understood. Are any of you students here?"],
        ["W", "All four of us are."],
        ["M", "Then I can take fifteen percent off the class fee."],
        ["W", "Perfect. I'll pay the whole thing now."],
      ],
      choices: ["$68.00", "$85.00", "$100.00", "$112.20", "$132.00"],
      answer: 2,
      clue: "Then I can take fifteen percent off the class fee.",
      explanation:
        "네 명의 수업료 100달러에서 유약 작업은 빼고, 학생 할인 15퍼센트를 빼면 85달러이다. 따라서 답은 ②이다.",
      translation: [
        "M: 파인힐 도예 공방입니다. 무엇을 도와드릴까요?",
        "W: 초보자 물레 수업을 네 명으로 예약하고 싶어요.",
        "M: 물레 수업은 한 명에 25달러입니다.",
        "W: 그럼 네 명이면 100달러네요.",
        "M: 맞습니다. 끝나고 유약 작업도 하시겠어요?",
        "W: 그건 얼마가 더 붙나요?",
        "M: 유약은 한 명에 8달러라서 32달러가 더 붙습니다.",
        "W: 이번에는 유약은 빼 주세요.",
        "M: 알겠습니다. 혹시 학생이신 분이 계신가요?",
        "W: 네 명 다 학생이에요.",
        "M: 그럼 수업료에서 15퍼센트를 빼 드릴게요.",
        "W: 좋네요. 지금 전부 결제할게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 여자가 발표회에 참여할 수 없는 이유를 고르시오.",
      lines: [
        ["M", "Yerin, you're not on the recital program. What happened?"],
        ["W", "I had to withdraw last Monday."],
        ["M", "Did your piece turn out to be too difficult?"],
        ["W", "No, I had that memorized by September."],
        ["M", "Is it the entry fee? I heard it doubled."],
        ["W", "The fee was covered by the club. It's my wrist."],
        ["M", "Your wrist? Since when?"],
        ["W", "I slipped on the stairs three weeks ago and sprained it."],
        ["M", "Can you play at all right now?"],
        ["W", "The doctor said no piano for six more weeks."],
      ],
      choices: [
        "곡이 너무 어려워서",
        "참가비가 올라서",
        "손목을 삐어서",
        "연습 시간이 없어서",
        "다른 대회와 겹쳐서",
      ],
      answer: 3,
      clue: "I slipped on the stairs three weeks ago and sprained it.",
      explanation:
        "곡도 외웠고 참가비도 동아리가 냈지만, 3주 전에 계단에서 미끄러져 손목을 삐어 6주 더 피아노를 칠 수 없기 때문이다. 따라서 답은 ③이다.",
      translation: [
        "M: 예린아, 발표회 순서에 네가 없네. 무슨 일이야?",
        "W: 지난 월요일에 빠지기로 했어.",
        "M: 곡이 너무 어려웠어?",
        "W: 아니, 9월에 벌써 다 외웠어.",
        "M: 참가비 때문이야? 두 배로 올랐다던데.",
        "W: 참가비는 동아리에서 냈어. 손목 때문이야.",
        "M: 손목? 언제부터?",
        "W: 3주 전에 계단에서 미끄러져서 삐었어.",
        "M: 지금 아예 못 쳐?",
        "W: 의사 선생님이 6주 더 피아노는 안 된대.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, Green Roof Workshop에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["M", "Yerin, did you see the notice for the Green Roof Workshop?"],
        ["W", "I saw the poster but didn't read it. When is it?"],
        ["M", "Three Saturdays in a row, starting the eleventh of May."],
        ["W", "Three weeks. Where is it held?"],
        ["M", "On the rooftop of the city library, the one by the bus terminal."],
        ["W", "I didn't know that roof was open. Who's teaching it?"],
        ["M", "A landscape architect who built the rooftop farm downtown."],
        ["W", "That sounds worth going to. Is there a fee?"],
        ["M", "Twenty thousand won for all three sessions, tools included."],
        ["W", "That's reasonable. I'll ask my sister to come too."],
        ["M", "Bring a hat. There's no shade up there at all."],
        ["W", "Good point. I'll sign us both up tonight."],
      ],
      choices: ["열리는 날짜", "열리는 장소", "강사", "참가비", "정원"],
      answer: 5,
      clue: "정원은 대화에서 언급되지 않았다.",
      explanation:
        "날짜(5월 11일부터 세 번의 토요일), 장소(시립 도서관 옥상), 강사(조경 건축가), 참가비(2만 원)는 언급되지만 정원은 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 예린아, 옥상 정원 워크숍 안내문 봤어?",
        "W: 포스터는 봤는데 안 읽었어. 언제야?",
        "M: 5월 11일부터 세 번의 토요일 연달아서.",
        "W: 3주네. 어디서 해?",
        "M: 시립 도서관 옥상에서. 버스 터미널 옆에 있는 거.",
        "W: 그 옥상이 열려 있는 줄 몰랐어. 누가 가르쳐?",
        "M: 시내 옥상 농장을 만든 조경 건축가래.",
        "W: 갈 만하겠다. 참가비는 있어?",
        "M: 세 번에 2만 원, 도구 포함해서.",
        "W: 괜찮네. 언니한테도 같이 가자고 해야지.",
        "M: 모자 가져와. 거기 그늘이 하나도 없어.",
        "W: 좋은 말이다. 오늘 밤에 둘 다 신청할게.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Lantern Rock Trail에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "W",
          "Let me introduce the Lantern Rock Trail. " +
            "The trail begins at the ranger station and runs nine kilometers to the summit. " +
            "It climbs steadily, gaining about eight hundred meters over that distance. " +
            "The trail is open all year, but the upper section is closed after heavy snow. " +
            "Dogs are not allowed anywhere on the trail, even on a leash. " +
            "There is one shelter at the halfway point with water and a roof but no beds. " +
            "Hikers should start before ten in the morning to return before dark.",
        ],
      ],
      choices: [
        "관리소에서 시작한다",
        "길이가 9킬로미터이다",
        "일 년 내내 열려 있다",
        "줄을 매면 개를 데려갈 수 있다",
        "중간에 대피소가 하나 있다",
      ],
      answer: 4,
      clue: "Dogs are not allowed anywhere on the trail, even on a leash.",
      explanation:
        "줄을 매도 개는 어디에도 데려갈 수 없다고 했으므로 ④는 내용과 다르다. 따라서 답은 ④이다.",
      translation: [
        "W: 랜턴록 등산로를 소개해 드리겠습니다. 이 길은 관리소에서 시작해 정상까지 9킬로미터 이어집니다. 그 거리 동안 고도가 약 800미터 꾸준히 올라갑니다. 길은 일 년 내내 열려 있지만, 눈이 많이 오면 윗부분은 닫힙니다. 개는 줄을 매도 이 길 어디에도 데려올 수 없습니다. 중간 지점에 대피소가 하나 있는데 물과 지붕은 있지만 잠자리는 없습니다. 어두워지기 전에 돌아오려면 아침 10시 전에 출발하시는 것이 좋습니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 예약할 스터디룸을 고르시오.",
      lines: [
        ["W", "Minwoo, let's book a study room for the group project."],
        ["M", "There are five listed. How many of us will be there?"],
        ["W", "Six, counting the two who joined last week."],
        ["M", "Then anything under six seats is out."],
        ["W", "Right. Do we need the whiteboard?"],
        ["M", "Definitely. We're mapping the whole timeline on Thursday."],
        ["W", "And the budget? The club gave us twenty thousand won."],
        ["M", "So twenty thousand won an hour is our ceiling."],
        ["W", "Then only one room fits all three conditions."],
        ["M", "Let's reserve it before someone else takes Thursday evening."],
        ["W", "I'll book it on the library site right now."],
        ["M", "Send me the confirmation when it comes through."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "Six, counting the two who joined last week.",
      explanation:
        "여섯 명 이상 들어가고, 화이트보드가 있으며, 시간당 2만 원 이하인 방을 고른다. 세 조건을 모두 채우는 것은 ④이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Seats: 4 / Whiteboard: Yes / Price: 12,000 won per hour" },
          { no: 2, label: "②", value: "Seats: 8 / Whiteboard: No / Price: 15,000 won per hour" },
          { no: 3, label: "③", value: "Seats: 6 / Whiteboard: Yes / Price: 26,000 won per hour" },
          { no: 4, label: "④", value: "Seats: 8 / Whiteboard: Yes / Price: 18,000 won per hour" },
          { no: 5, label: "⑤", value: "Seats: 5 / Whiteboard: Yes / Price: 10,000 won per hour" },
        ],
      },
      translation: [
        "W: 민우야, 모둠 과제 할 스터디룸 예약하자.",
        "M: 다섯 개 올라와 있네. 우리 몇 명이야?",
        "W: 지난주에 들어온 두 명까지 여섯 명.",
        "M: 그럼 여섯 자리보다 작은 건 빠지네.",
        "W: 맞아. 화이트보드는 필요해?",
        "M: 당연하지. 목요일에 일정 전체를 그릴 거잖아.",
        "W: 예산은? 동아리에서 2만 원 줬어.",
        "M: 그럼 시간당 2만 원이 한계네.",
        "W: 그럼 세 조건 다 맞는 방은 하나뿐이야.",
        "M: 목요일 저녁 누가 가져가기 전에 예약하자.",
        "W: 지금 바로 도서관 누리집에서 예약할게.",
        "M: 확인되면 나한테도 보내 줘.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["W", "Minwoo, is the field trip form due today?"],
        ["M", "It was due yesterday, but the teacher extended it."],
        ["W", "Extended until when? I haven't printed mine."],
        ["M", "Until Friday, and she'll take a photo of it by message."],
      ],
      choices: [
        "Then I'll send her a photo tonight.",
        "I already went on the field trip.",
        "I don't have a printer at all.",
        "The form was due last month.",
        "I'll ask for another extension.",
      ],
      answer: 1,
      clue: "Until Friday, and she'll take a photo of it by message.",
      explanation:
        "금요일까지이고 사진으로 보내도 된다고 했으므로, 오늘 밤 사진을 보내겠다는 ①이 가장 자연스럽다.",
      translation: [
        "W: 민우야, 현장 학습 신청서 오늘까지야?",
        "M: 어제까지였는데 선생님이 미뤄 주셨어.",
        "W: 언제까지? 나 아직 출력도 안 했어.",
        "M: 금요일까지. 그리고 사진으로 보내도 받아 주신대.",
        "W: 그럼 오늘 밤에 사진 보내 드릴게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["M", "Yerin, the bus to the museum leaves from gate three, right?"],
        ["W", "It used to. They moved it to gate seven last month."],
        ["M", "Gate seven? That's on the other side of the terminal."],
        ["W", "It is, so give yourself ten extra minutes."],
      ],
      choices: [
        "Gate three is much closer.",
        "I'm not going to the museum.",
        "The bus was cancelled today.",
        "Ten minutes is plenty of time.",
        "I'll leave earlier, then.",
      ],
      answer: 5,
      clue: "It is, so give yourself ten extra minutes.",
      explanation:
        "여자가 10분 더 여유를 두라고 했으므로, 더 일찍 나서겠다는 ⑤가 가장 자연스럽다.",
      translation: [
        "M: 예린아, 박물관 가는 버스 3번 승강장에서 타지?",
        "W: 예전엔 그랬어. 지난달에 7번으로 옮겼어.",
        "M: 7번? 터미널 반대편이잖아.",
        "W: 맞아. 그러니까 10분 더 여유를 둬.",
        "M: 그럼 더 일찍 나갈게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Minwoo, you've been carrying six subjects' notes in that bag all term."],
        ["M", "I never know which one I'll need after school."],
        ["W", "How heavy is it? It looks painful."],
        ["M", "Nine kilograms. My shoulder aches by lunchtime."],
        ["W", "Do you actually open all six in a given week?"],
        ["M", "Honestly, maybe two. Three on a bad week."],
        ["W", "So you're carrying four kilograms of insurance."],
        ["M", "Put that way, it sounds foolish."],
        ["W", "What stops you from leaving the rest in your locker?"],
        ["M", "The fear that I'll want one the day it isn't there."],
        ["W", "Keep a shared folder photo of each one. The locker holds the paper."],
      ],
      choices: [
        "I'll photograph them this weekend.",
        "My locker is already full of books.",
        "I'd rather carry everything as before.",
        "I don't take six subjects.",
        "Nine kilograms feels light to me.",
      ],
      answer: 1,
      clue: "Keep a shared folder photo of each one. The locker holds the paper.",
      explanation:
        "여자가 각 노트를 사진으로 찍어 두고 종이는 사물함에 두라고 했으므로, 주말에 찍겠다는 ①이 가장 자연스럽다.",
      translation: [
        "W: 민우야, 한 학기 내내 여섯 과목 노트를 그 가방에 넣고 다니네.",
        "M: 방과 후에 어떤 게 필요할지 모르니까.",
        "W: 얼마나 무거워? 보기만 해도 아프다.",
        "M: 9킬로그램. 점심때면 어깨가 아파.",
        "W: 한 주에 여섯 권을 진짜 다 펴?",
        "M: 솔직히 두 권쯤. 많으면 세 권.",
        "W: 그럼 4킬로그램은 보험으로 지고 다니는 거네.",
        "M: 그렇게 말하니 바보 같다.",
        "W: 나머지를 사물함에 두면 안 되는 이유가 뭐야?",
        "M: 없는 날 하필 필요할까 봐 겁나서.",
        "W: 각각 사진 찍어서 공유 폴더에 둬. 종이는 사물함에 두고.",
        "M: 이번 주말에 찍어 둘게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Yerin, you said yes to the volunteer shift again."],
        ["W", "They were short-handed. Somebody had to."],
        ["M", "That's the fourth weekend in a row."],
        ["W", "I know. I haven't opened a textbook on a Saturday since September."],
        ["M", "Do they ask you first, or do they assume?"],
        ["W", "They send the list and I'm already on it."],
        ["M", "And you've never asked them to take you off?"],
        ["W", "It would look like I don't care about the work."],
        ["M", "Does anyone there think you don't care?"],
        ["W", "No. They call me the reliable one."],
        ["M", "Reliable people are allowed to say which weekends they can do."],
      ],
      choices: [
        "I'll take every weekend from now on.",
        "I'm going to quit volunteering.",
        "I'll tell them my available weekends.",
        "They never put me on the list.",
        "I don't mind losing my Saturdays.",
      ],
      answer: 3,
      clue: "Reliable people are allowed to say which weekends they can do.",
      explanation:
        "남자는 믿음직한 사람도 가능한 주말을 말할 수 있다고 했으므로, 가능한 주말을 알리겠다는 ③이 가장 자연스럽다.",
      translation: [
        "M: 예린아, 봉사 일정을 또 받았다며.",
        "W: 사람이 모자랐어. 누군가는 해야지.",
        "M: 이번이 네 주 연속이야.",
        "W: 알아. 9월 이후로 토요일에 교과서를 펴 본 적이 없어.",
        "M: 먼저 물어봐 주셔, 아니면 그냥 넣으셔?",
        "W: 명단을 보내는데 내 이름이 이미 있어.",
        "M: 빼 달라고 말해 본 적은 없어?",
        "W: 일에 관심 없어 보일 것 같아서.",
        "M: 거기서 네가 관심 없다고 생각하는 사람이 있어?",
        "W: 아니. 다들 나보고 믿음직하다고 해.",
        "M: 믿음직한 사람도 어느 주말이 되는지는 말할 수 있어.",
        "W: 가능한 주말을 말씀드릴게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Haeun이 Jiwoo에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Haeun : ________________",
      lines: [
        [
          "W",
          "Haeun and Jiwoo run the school's used bookstore together, " +
            "a small table set up in the hallway two mornings a week. " +
            "Last term they sold almost nothing, and they have been trying to work out why. " +
            "This morning Haeun watches the hallway carefully for an hour. " +
            "She notices that students walk past the table without slowing down, " +
            "not because they are in a hurry, but because the books are lying flat in boxes " +
            "with only their edges showing, so nobody can tell what any of them is. " +
            "The few students who do stop pick up a book only after turning it over to see the cover. " +
            "Haeun realizes that the covers are the whole point, " +
            "and that standing the books upright would cost them nothing at all. " +
            "She wants to suggest that they display the books face out instead of flat in the boxes. " +
            "In this situation, what would Haeun most likely say to Jiwoo?",
        ],
      ],
      choices: [
        "Let's stand the books up so the covers show.",
        "Let's move the table to another hallway.",
        "We should lower every price by half.",
        "Let's open the stand three mornings a week.",
        "We should stop selling used books.",
      ],
      answer: 1,
      clue: "She wants to suggest that they display the books face out instead of flat in the boxes.",
      explanation:
        "하은이는 표지가 보이도록 책을 세워 놓자고 제안하려 하므로 ①이 가장 적절하다.",
      translation: [
        "W: 하은이와 지우는 학교 중고 책방을 함께 운영합니다. 일주일에 두 번 아침에 복도에 작은 탁자를 펴는 것입니다. 지난 학기에는 거의 팔리지 않았고, 두 사람은 그 이유를 알아내려 애쓰고 있습니다. 오늘 아침 하은이는 한 시간 동안 복도를 유심히 봅니다. 학생들이 탁자 앞을 속도도 줄이지 않고 지나가는 것을 봅니다. 바빠서가 아니라, 책이 상자 안에 눕혀져 옆면만 보이는 탓에 무슨 책인지 아무도 알 수 없기 때문입니다. 걸음을 멈추는 몇 안 되는 학생들도 책을 뒤집어 표지를 본 뒤에야 집어 듭니다. 하은이는 표지가 전부라는 것을, 그리고 책을 세워 놓는 데는 돈 한 푼 들지 않는다는 것을 깨닫습니다. 하은이는 책을 상자에 눕히지 말고 표지가 보이게 세워 두자고 제안하고 싶습니다. 이런 상황에서 하은이가 지우에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 남자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Hello, everyone. Today I want to talk about why bridges are built to move. " +
            "A bridge that looks completely rigid is in fact swaying, stretching and settling all day. " +
            "Steel expands in summer heat and contracts on a winter night, " +
            "enough that a long span can change by half a meter between July and January. " +
            "If the ends were fixed in concrete, that force would crack the structure. " +
            "So engineers build in expansion joints, the metal teeth you feel your tires cross. " +
            "They also let the deck sway. " +
            "A suspension bridge is designed to move sideways in strong wind, " +
            "because a structure that bends survives forces that snap a rigid one. " +
            "The bridge you trust is not the one that refuses to move. " +
            "It is the one that has been given somewhere to go.",
        ],
      ],
      choices: [
        "why steel is the cheapest building material",
        "how traffic noise is reduced on long bridges",
        "why suspension bridges cost more to build",
        "how engineers measure summer temperatures",
        "how bridges are designed to move rather than stay rigid",
      ],
      answer: 5,
      clue: "A suspension bridge is designed to move sideways in strong wind, because a structure that bends survives forces that snap a rigid one.",
      explanation:
        "남자는 다리가 팽창 이음과 흔들림을 허용하도록 설계되며, 휘는 구조가 뻣뻣한 구조보다 버틴다고 설명한다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 안녕하세요, 여러분. 오늘은 다리를 왜 움직이게 짓는지 이야기하려 합니다. 완전히 굳어 보이는 다리도 사실은 하루 종일 흔들리고, 늘어나고, 가라앉습니다. 강철은 여름 더위에 늘고 겨울밤에 줄어드는데, 긴 다리는 7월과 1월 사이에 반 미터까지 달라질 수 있습니다. 양 끝이 콘크리트에 고정돼 있다면 그 힘이 구조를 갈라 버릴 것입니다. 그래서 기술자들은 팽창 이음을 넣습니다. 차 바퀴가 지날 때 느껴지는 그 쇠 이빨 모양이지요. 상판이 흔들리도록 두기도 합니다. 현수교는 강한 바람에 옆으로 움직이도록 설계됩니다. 휘는 구조가, 뻣뻣한 구조를 부러뜨리는 힘을 견디기 때문입니다. 믿을 만한 다리는 움직이기를 거부하는 다리가 아닙니다. 갈 곳을 마련해 준 다리입니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 다리의 움직임이 아닌 것은?",
      lines: [
        ["M", "Hello, everyone. Today I want to talk about why bridges are built to move."],
        ["M", "A bridge that looks completely rigid is in fact swaying, stretching and settling all day."],
        ["M", "Steel expands in summer heat and contracts on a winter night, enough that a long span can change by half a meter between July and January."],
        ["M", "So engineers build in expansion joints, the metal teeth you feel your tires cross."],
        ["M", "They also let the deck sway."],
        ["M", "A suspension bridge is designed to move sideways in strong wind, because a structure that bends survives forces that snap a rigid one."],
      ],
      choices: [
        "expanding in summer heat",
        "contracting on a winter night",
        "swaying sideways in strong wind",
        "rising when the river floods",
        "settling over the course of a day",
      ],
      answer: 4,
      clue: "Steel expands in summer heat and contracts on a winter night, enough that a long span can change by half a meter between July and January.",
      explanation:
        "여름에 늘어나기, 겨울밤에 줄어들기, 바람에 옆으로 흔들리기, 하루 동안 가라앉기는 언급되지만 강이 불어날 때 떠오르는 것은 언급되지 않았다. 따라서 답은 ④이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
