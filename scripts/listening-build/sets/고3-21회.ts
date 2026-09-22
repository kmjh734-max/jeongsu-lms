/** 고3 듣기 21회 — 사람이 직접 쓴 회차 (2026-09-21) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고3 21회",
  gradeLevel: "high3",
  speechSpeed: 0.8,
  folder: "고3 듣기",
  questions: [
    {
      order: 1,
      type: "목적 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 목적으로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "Good evening, residents of Hanul Apartments. This is the management office. " +
            "We are calling about the underground car park, which many of you use as a shortcut " +
            "to the shopping centre. Beginning on Monday, the connecting door on level B2 will be locked " +
            "between nine at night and six in the morning. " +
            "This is not a decision we made lightly, and it is not about inconvenience to anyone. " +
            "Over the past two months there have been four incidents of people entering the building " +
            "through that door at night, and the residents on the lower floors have raised it repeatedly. " +
            "During the day the door will work exactly as it always has. " +
            "If you come home after nine, please use the main lobby entrance, " +
            "which takes about three minutes longer on foot. " +
            "We will review the arrangement in six months. Thank you for your cooperation.",
        ],
      ],
      choices: [
        "주차장 이용료 인상을 알리려고",
        "야간에 연결문을 잠근다고 알리려고",
        "주차장 공사 일정을 안내하려고",
        "정문 출입증 발급을 안내하려고",
        "주차 구역 변경을 알리려고",
      ],
      answer: 2,
      clue: "the connecting door on level B2 will be locked between nine at night and six in the morning",
      explanation:
        "여자는 밤 9시부터 아침 6시까지 지하 2층 연결문을 잠근다는 것과 그 까닭, 대신 쓸 길을 알리고 있다. 따라서 답은 ②이다.",
      translation: [
        "W: 한울 아파트 주민 여러분, 안녕하세요. 관리사무소입니다. 많은 분이 상가로 질러가는 길로 쓰시는 지하 주차장 때문에 알려 드립니다. 월요일부터 지하 2층 연결문을 밤 9시부터 아침 6시까지 잠급니다. 가볍게 정한 일이 아니며, 누군가의 불편 때문에 정한 것도 아닙니다. 지난 두 달 동안 밤에 그 문으로 외부인이 들어온 일이 네 번 있었고, 저층 주민들이 여러 차례 말씀해 주셨습니다. 낮에는 지금까지와 똑같이 쓰실 수 있습니다. 9시 이후에 귀가하시면 정문 로비로 들어와 주세요. 걸어서 3분쯤 더 걸립니다. 이 조치는 여섯 달 뒤에 다시 살피겠습니다. 협조해 주셔서 고맙습니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 남자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Hyunwoo, I've made a timetable for the last hundred days."],
        ["M", "Let me look. You've written a subject in every single block."],
        ["W", "That's the point. Nothing wasted."],
        ["M", "What happens on the day you get a cold?"],
        ["W", "I'll catch up the next day."],
        ["M", "Then that day carries two days' work, and the one after carries three."],
        ["W", "I suppose it would pile up."],
        ["M", "It always does. That's not a flaw in you, it's a flaw in the plan."],
        ["W", "So what would you leave out?"],
        ["M", "Leave one block empty every day and don't fill it in advance."],
        ["W", "That feels like throwing away a hundred blocks."],
        ["M", "It's the only part that lets the other blocks survive contact with a real week."],
      ],
      choices: [
        "계획에는 비워 두는 자리가 있어야 한다",
        "계획은 과목별로 나누어야 한다",
        "공부 시간은 아침에 몰아야 한다",
        "계획은 짧은 기간으로 세워야 한다",
        "계획은 다른 사람과 공유해야 한다",
      ],
      answer: 1,
      clue: "Leave one block empty every day and don't fill it in advance.",
      explanation:
        "남자는 날마다 한 칸을 비워 두라며, 그 빈칸이 있어야 나머지 계획이 실제 한 주를 견딘다고 말한다. 따라서 답은 ①이다.",
      translation: [
        "W: 현우야, 마지막 백일 시간표를 짰어.",
        "M: 어디 보자. 칸마다 과목을 하나도 안 빼고 적었네.",
        "W: 그게 핵심이야. 버리는 게 없게.",
        "M: 감기 걸리는 날엔 어떻게 되는데?",
        "W: 다음 날 따라잡지.",
        "M: 그럼 그날이 이틀 치를 지고, 그다음 날은 사흘 치를 지게 돼.",
        "W: 쌓이긴 하겠네.",
        "M: 늘 쌓여. 그건 네 흠이 아니라 계획의 흠이야.",
        "W: 그럼 뭘 빼겠는데?",
        "M: 날마다 한 칸을 비워 두고 미리 채우지 마.",
        "W: 백 칸을 버리는 것 같은데.",
        "M: 나머지 칸들이 진짜 한 주를 만나고도 살아남게 해 주는 건 그 칸뿐이야.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Editors who work on long books talk about a stage they call the cold read. " +
            "The writer has finished, the manuscript is as good as they can make it, " +
            "and then it is put in a drawer for six weeks. Nobody touches it. " +
            "When the writer opens it again, sentences they were proud of look ordinary, " +
            "and paragraphs they fought to keep turn out to say nothing. " +
            "Nothing about the text has changed. What has changed is that the writer " +
            "no longer remembers what they meant, and so must read what is actually there. " +
            "That gap is the whole point. While you still remember your intention, " +
            "you read your intention rather than your words, and every unclear sentence " +
            "looks clear because you know what it was supposed to say. " +
            "Distance is not a luxury in revision. It is the only way to become your own reader.",
        ],
      ],
      choices: [
        "글은 시간을 두고 나서 고쳐야 제대로 보인다",
        "글은 여러 사람에게 보여 주어야 한다",
        "초고는 빠르게 써야 흐름이 살아난다",
        "긴 글은 여러 번 나누어 써야 한다",
        "고쳐 쓰기는 문장 단위로 해야 한다",
      ],
      answer: 1,
      clue: "While you still remember your intention, you read your intention rather than your words",
      explanation:
        "남자는 뜻한 바를 기억하는 동안에는 글이 아니라 의도를 읽게 되므로, 시간을 두고 떨어져서 봐야 실제 문장이 보인다고 말한다. 따라서 답은 ①이다.",
      translation: [
        "M: 긴 책을 다루는 편집자들은 '차갑게 읽기'라고 부르는 단계를 이야기합니다. 작가가 다 썼고, 원고는 그가 할 수 있는 만큼 좋아졌고, 그다음 그것을 여섯 주 동안 서랍에 넣어 둡니다. 아무도 건드리지 않습니다. 작가가 다시 열어 보면, 자랑스러워하던 문장은 평범해 보이고, 지키려 싸웠던 문단은 아무 말도 하지 않는 것으로 드러납니다. 글은 하나도 바뀌지 않았습니다. 바뀐 것은 작가가 자기가 무슨 뜻으로 썼는지 더는 기억하지 못하게 되어, 실제로 거기 있는 것을 읽어야 한다는 점입니다. 그 틈이 핵심입니다. 자기 의도를 아직 기억하는 동안에는 자기 말이 아니라 자기 의도를 읽게 되고, 흐린 문장마다 무슨 말을 하려 했는지 알기 때문에 또렷해 보입니다. 거리 두기는 고쳐 쓰기의 사치가 아닙니다. 자기 글의 독자가 되는 유일한 길입니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["W", "Hyunwoo, is this the photo of the study café you opened?"],
        ["M", "Yes, we started last month."],
        ["W", "The sign above the counter is rectangular."],
        ["M", "A round one didn't fit the wall."],
        ["W", "And there are three stools at the counter."],
        ["M", "Any more and people bump elbows."],
        ["W", "I see a striped curtain on the window."],
        ["M", "It cuts the afternoon glare without making the room dark."],
        ["W", "There's a clock on the right wall."],
        ["M", "People asked for one, so we put it where everyone can see it."],
        ["W", "And the plant in the corner is on a stand."],
        ["M", "It keeps the leaves off the floor where people walk."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 5,
      clue: "And the plant in the corner is on a stand.",
      explanation:
        "대화에서 구석의 화분은 받침대 위에 있다고 했는데 그림에서는 바닥에 놓여 있다. 따라서 답은 ⑤이다.",
      figure: {
        kind: "labeled",
        scene:
          "A small study café seen straight from the front, clean black line art on a plain white background, no writing or letters anywhere, every sign blank. " +
          "Above the counter hangs a RECTANGULAR blank sign board. " +
          "At the counter stand exactly THREE tall stools in a row. " +
          "On the window hangs a curtain covered in bold STRIPES. " +
          "On the RIGHT wall hangs a round CLOCK with two hands. " +
          "In the corner a large potted PLANT sits directly ON THE FLOOR — it is NOT raised on a stand. " +
          "Everything is drawn fully inside the frame with clear space between the objects.",
      },
      translation: [
        "W: 현우야, 이게 네가 연 스터디 카페 사진이야?",
        "M: 응, 지난달에 열었어.",
        "W: 계산대 위 간판이 네모나네.",
        "M: 둥근 건 벽에 안 맞았어.",
        "W: 그리고 계산대에 의자가 셋 있고.",
        "M: 더 놓으면 팔꿈치가 부딪혀.",
        "W: 창문에 줄무늬 커튼이 보여.",
        "M: 오후 햇빛을 가리면서도 방이 어둡지 않게 해 줘.",
        "W: 오른쪽 벽에 시계가 있네.",
        "M: 사람들이 달아 달래서 다 보이는 자리에 뒀어.",
        "W: 그리고 구석 화분은 받침대 위에 있고.",
        "M: 사람 다니는 바닥에 잎이 닿지 않게 하려고.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 여자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Sujin, the alumni talk starts in half an hour."],
        ["W", "Is the lecture room ready? What's still left?"],
        ["M", "The chairs are in rows and the name cards are on the front desk."],
        ["W", "What about the microphone?"],
        ["M", "Tested twice. It carries to the back row."],
        ["W", "And the slides from the speaker?"],
        ["M", "Loaded, but they're on the laptop and the room screen is still showing the desktop."],
        ["W", "So nothing will appear when she starts."],
        ["M", "The cable to the projector is in the media room."],
        ["W", "I'll go and get it. Which shelf?"],
        ["M", "The middle one, in the box marked with tape."],
        ["W", "Got it. Back in five."],
      ],
      choices: ["의자 줄 세우기", "이름표 놓기", "마이크 점검하기", "케이블 가져오기", "슬라이드 받기"],
      answer: 4,
      clue: "I'll go and get it. Which shelf?",
      explanation:
        "의자·이름표·마이크·슬라이드는 이미 끝났고, 여자는 자료실에서 프로젝터 케이블을 가져오기로 한다. 따라서 답은 ④이다.",
      translation: [
        "M: 수진아, 졸업생 강연이 30분 뒤에 시작해.",
        "W: 강의실 준비됐어? 아직 남은 게 뭐야?",
        "M: 의자는 줄 맞춰 놨고 이름표도 앞 책상에 뒀어.",
        "W: 마이크는?",
        "M: 두 번 확인했어. 맨 뒷줄까지 들려.",
        "W: 강연자 슬라이드는?",
        "M: 넣어 뒀는데 노트북에만 있고 강의실 화면에는 바탕화면만 떠 있어.",
        "W: 그럼 시작해도 아무것도 안 나오겠네.",
        "M: 프로젝터로 가는 케이블이 자료실에 있어.",
        "W: 내가 가서 가져올게. 어느 칸?",
        "M: 가운데 칸, 테이프 붙은 상자 안에.",
        "W: 알겠어. 5분이면 와.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 남자가 지불할 금액을 고르시오.",
      lines: [
        ["W", "Welcome to the print shop. What can I do for you?"],
        ["M", "I need to print and bind some study booklets."],
        ["W", "How many copies, and how many pages each?"],
        ["M", "Eight copies, forty pages each."],
        ["W", "Printing a forty-page copy comes to three dollars."],
        ["M", "So twenty-four dollars for the printing."],
        ["W", "And binding is two dollars a copy."],
        ["M", "That's sixteen more. Forty dollars altogether."],
        ["W", "That's right. Are these for a school?"],
        ["M", "They are. Does that matter?"],
        ["W", "School orders get twenty percent off the total."],
        ["M", "That's a real saving. Here's my card."],
      ],
      choices: ["$24", "$28", "$32", "$36", "$40"],
      answer: 3,
      clue: "School orders get twenty percent off the total.",
      explanation:
        "인쇄는 한 부에 3달러씩 여덟 부라 24달러, 제본은 2달러씩 여덟 부라 16달러로 합이 40달러이다. 학교 주문 20% 할인을 받으면 32달러이므로 답은 ③이다.",
      translation: [
        "W: 인쇄소입니다. 무엇을 도와드릴까요?",
        "M: 학습 소책자를 인쇄하고 제본하려고요.",
        "W: 몇 부에 한 부당 몇 쪽인가요?",
        "M: 여덟 부에 한 부당 마흔 쪽이요.",
        "W: 마흔 쪽 한 부 인쇄가 3달러입니다.",
        "M: 그럼 인쇄가 24달러네요.",
        "W: 그리고 제본은 한 부에 2달러입니다.",
        "M: 그럼 16달러 더해서 모두 40달러군요.",
        "W: 맞습니다. 학교에서 쓰시는 건가요?",
        "M: 맞아요. 그게 상관있나요?",
        "W: 학교 주문은 전체에서 20% 빼 드립니다.",
        "M: 꽤 아끼네요. 카드 여기 있습니다.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 여자가 스터디를 옮기려는 이유를 고르시오.",
      lines: [
        ["M", "Sujin, I heard you're moving to a different study group."],
        ["W", "I've been thinking about it since the summer."],
        ["M", "Is it the level? Are the problems too hard?"],
        ["W", "No, the level suits me. That isn't it."],
        ["M", "Then did something happen with the members?"],
        ["W", "Not at all. I like all of them."],
        ["M", "So what is it?"],
        ["W", "They moved the meeting to Thursday evening in September."],
        ["M", "And Thursday is a problem?"],
        ["W", "My mock exam class runs then. I've missed three weeks in a row."],
      ],
      choices: [
        "문제 수준이 맞지 않아서",
        "구성원과 사이가 나빠서",
        "모임 요일이 겹쳐서",
        "모임 장소가 멀어서",
        "회비가 부담스러워서",
      ],
      answer: 3,
      clue: "My mock exam class runs then. I've missed three weeks in a row.",
      explanation:
        "수준이나 사람 문제가 아니라, 모임이 목요일 저녁으로 옮겨져 모의고사 수업과 겹치기 때문이다. 따라서 답은 ③이다.",
      translation: [
        "M: 수진아, 다른 스터디로 옮긴다며.",
        "W: 여름부터 생각해 온 일이야.",
        "M: 수준 때문이야? 문제가 너무 어려워?",
        "W: 아니, 수준은 나한테 맞아. 그게 아니야.",
        "M: 그럼 사람들이랑 무슨 일 있었어?",
        "W: 전혀. 다 좋은 사람들이야.",
        "M: 그럼 뭔데?",
        "W: 9월에 모임을 목요일 저녁으로 옮겼어.",
        "M: 목요일이 문제야?",
        "W: 그때 모의고사 수업이 있어. 세 주 내리 못 갔어.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, Winter Volunteer Week에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["M", "Sujin, have you applied for Winter Volunteer Week yet?"],
        ["W", "Not yet. I only saw the poster this morning. What does it involve?"],
        ["M", "We work at the community kitchen near the station, the one behind the old market."],
        ["W", "I know the place. What do the volunteers actually do there?"],
        ["M", "Preparing meals in the morning, and after lunch we pack the boxes that go out to homes."],
        ["W", "That sounds like something I could manage. When does it run?"],
        ["M", "The first week of January, Monday through Friday, so five days in a row."],
        ["W", "Every day of that week? How many hours a day is it?"],
        ["M", "Six hours, from nine to three, with an hour off for lunch in the middle."],
        ["W", "That's longer than I expected, but it's only one week. Do they give us anything to wear?"],
        ["M", "An apron and a cap on the first morning, and you keep them afterwards."],
        ["W", "Then I don't need to worry about ruining my own clothes."],
        ["M", "Nobody does. Last year half of us wore the cap for the rest of the winter."],
        ["W", "All right, you've convinced me. I'll apply this evening."],
      ],
      choices: ["봉사하는 곳", "하는 일", "기간", "하루 시간", "신청 마감일"],
      answer: 5,
      clue: "An apron and a cap on the first morning, and you keep them afterwards.",
      explanation:
        "장소(역 근처 급식소), 하는 일(식사 준비와 배달 포장), 기간(1월 첫 주 월~금), 하루 시간(9시~3시 여섯 시간)은 언급되지만 신청 마감일은 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 수진아, Winter Volunteer Week 신청했어?",
        "W: 아직. 오늘 아침에야 포스터를 봤어. 뭘 하는 건데?",
        "M: 역 근처 지역 급식소에서 일해. 옛 시장 뒤에 있는 데.",
        "W: 거기 알아. 자원봉사자들은 실제로 뭘 하는데?",
        "M: 오전에는 식사를 준비하고, 점심 뒤에는 집으로 나가는 상자를 포장해.",
        "W: 그 정도면 나도 할 수 있겠다. 언제 하는데?",
        "M: 1월 첫 주, 월요일부터 금요일까지, 그러니까 닷새 내리.",
        "W: 그 주 내내? 하루에 몇 시간이야?",
        "M: 여섯 시간, 9시부터 3시까지, 가운데 점심으로 한 시간 쉬고.",
        "W: 생각보다 기네. 그래도 한 주뿐이니까. 입을 건 주나?",
        "M: 첫날 아침에 앞치마랑 모자를 주고, 끝나고 가져도 돼.",
        "W: 그럼 내 옷 버릴 걱정은 안 해도 되겠다.",
        "M: 아무도 안 해. 작년엔 우리 중 절반이 겨우내 그 모자를 쓰고 다녔어.",
        "W: 좋아, 설득됐어. 오늘 저녁에 신청할게.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Spring Science Fair에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "W",
          "Here are the details of this year's Spring Science Fair. " +
            "The fair will be held on the fourteenth of March in the school gymnasium, " +
            "and it runs from ten in the morning until four in the afternoon. " +
            "Entries may be submitted by individuals or by teams of up to three. " +
            "Each entry needs a display board and a one-page summary, " +
            "but a working model is optional rather than required. " +
            "Judging takes place between one and three, and judges speak with every team. " +
            "Prizes are given in three categories, and every entrant receives a certificate. " +
            "Registration closes on the twenty-eighth of February. " +
            "Entries submitted after that date will be displayed but not judged.",
        ],
      ],
      choices: [
        "체육관에서 하루 동안 열린다",
        "세 명까지 팀을 이룰 수 있다",
        "작동하는 모형을 반드시 내야 한다",
        "심사 위원이 모든 팀과 이야기한다",
        "마감 뒤 접수작은 전시만 된다",
      ],
      answer: 3,
      clue: "but a working model is optional rather than required",
      explanation:
        "작동하는 모형은 선택이지 반드시 내야 하는 것이 아니라고 했다. 따라서 ③이 일치하지 않는다.",
      translation: [
        "W: 올해 Spring Science Fair 안내입니다. 전시회는 3월 14일 학교 체육관에서 열리고, 오전 10시부터 오후 4시까지 합니다. 개인으로 내도 되고 세 명까지 팀으로 내도 됩니다. 출품작마다 전시판과 한 쪽짜리 요약이 필요하지만, 작동하는 모형은 반드시 내야 하는 것이 아니라 선택입니다. 심사는 1시부터 3시까지 하고, 심사 위원이 모든 팀과 이야기를 나눕니다. 상은 세 부문으로 주고, 출품한 사람은 모두 수료증을 받습니다. 접수는 2월 28일에 마감합니다. 그 뒤에 낸 작품은 전시는 하지만 심사는 하지 않습니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 신청할 특강을 고르시오.",
      lines: [
        ["M", "Sujin, these are the five special lectures still open."],
        ["W", "Let's narrow them down. I can't do anything on Friday."],
        ["M", "Then one is out. What next?"],
        ["W", "It has to be online. I can't travel across the city on a weeknight."],
        ["M", "One of the rest is on site only, so that's gone."],
        ["W", "Three left. How long are they?"],
        ["M", "You said two hours at the most."],
        ["W", "Then one more drops out. Two are left."],
        ["M", "Do both of them record the session?"],
        ["W", "Only one does. The other is live with no recording."],
        ["M", "Then that's the one. Let's register tonight."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "Then that's the one. Let's register tonight.",
      explanation:
        "금요일인 ①, 현장 진행인 ②, 세 시간인 ⑤를 뺀다. 남은 ③과 ④ 중 녹화본을 주는 것은 ③이므로 답은 ③이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "금요일 / 온라인 / 2시간 / 녹화 제공" },
          { no: 2, label: "②", value: "화요일 / 현장 / 2시간 / 녹화 제공" },
          { no: 3, label: "③", value: "수요일 / 온라인 / 2시간 / 녹화 제공" },
          { no: 4, label: "④", value: "목요일 / 온라인 / 2시간 / 녹화 없음" },
          { no: 5, label: "⑤", value: "월요일 / 온라인 / 3시간 / 녹화 제공" },
        ],
      },
      translation: [
        "M: 수진아, 아직 열려 있는 특강이 이 다섯 개야.",
        "W: 하나씩 줄여 보자. 금요일은 안 돼.",
        "M: 그럼 하나 빠지네. 다음은?",
        "W: 온라인이어야 해. 평일 저녁에 시내를 가로질러 갈 순 없어.",
        "M: 남은 것 중 하나는 현장만 하니까 그것도 빠지고.",
        "W: 셋 남았다. 시간이 얼마야?",
        "M: 많아야 두 시간이라고 했잖아.",
        "W: 그럼 하나 더 빠지고 둘 남았다.",
        "M: 둘 다 녹화해 줘?",
        "W: 한 곳만. 다른 데는 생방송이고 녹화가 없어.",
        "M: 그럼 그거네. 오늘 밤에 신청하자.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "Man : ________________",
      lines: [
        ["W", "Hyunwoo, did you get the past papers for the June exam?"],
        ["M", "I found the questions, but the answer key isn't in the file."],
        ["W", "The library keeps a printed copy behind the desk."],
      ],
      choices: [
        "Then I'll ask for it tomorrow.",
        "The exam was quite difficult.",
        "I printed forty pages already.",
        "June is a busy month for me.",
        "I don't use past papers.",
      ],
      answer: 1,
      clue: "The library keeps a printed copy behind the desk.",
      explanation:
        "도서관 데스크 뒤에 인쇄본이 있다는 말을 들었으므로, 내일 달라고 하겠다는 ①이 가장 자연스럽다.",
      translation: [
        "W: 현우야, 6월 모의고사 기출 구했어?",
        "M: 문제는 찾았는데 파일에 정답지가 없어.",
        "W: 도서관 데스크 뒤에 인쇄본을 두고 있어.",
        "M: 그럼 내일 달라고 해야겠다.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "Woman : ________________",
      lines: [
        ["M", "Sujin, are you still looking for someone to record your speaking practice?"],
        ["W", "I am. Listening back is the only way I catch my own mistakes."],
        ["M", "The language lab has booths with recorders, and they're free after four."],
      ],
      choices: [
        "My speech is about climate policy.",
        "Then I'll book a booth for this evening.",
        "I practise in front of a mirror.",
        "The lab closed down last year.",
        "I've already finished the recording.",
      ],
      answer: 2,
      clue: "The language lab has booths with recorders, and they're free after four.",
      explanation:
        "어학실 부스를 4시 이후에 무료로 쓸 수 있다는 말을 들었으므로, 오늘 저녁 자리를 잡겠다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 수진아, 아직 말하기 연습 녹음해 줄 사람 찾고 있어?",
        "W: 응. 다시 들어 봐야 내 실수가 잡혀.",
        "M: 어학실에 녹음기 있는 부스가 있는데 4시 넘으면 공짜야.",
        "W: 그럼 오늘 저녁으로 부스 잡을게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "Man : ________________",
      points3: true,
      lines: [
        ["W", "Hyunwoo, how is the English mock exam practice going?"],
        ["M", "Badly. My score hasn't moved in two months."],
        ["W", "How many papers have you done in that time?"],
        ["M", "Eighteen. One every three days, full time limit."],
        ["W", "And what do you do after you mark one?"],
        ["M", "I check the answers and start the next paper."],
        ["W", "So the wrong answers get a tick and nothing else."],
        ["M", "I suppose so. I always felt the next paper was more useful."],
        ["W", "But the next paper asks you the same things in a different order."],
        ["M", "And I get them wrong again, for the same reason."],
        ["W", "Spend a whole session on one paper's mistakes before you open another."],
      ],
      choices: [
        "My average is around eighty.",
        "Then I'll go back over yesterday's paper tonight.",
        "I take one paper every three days.",
        "The exam is at the end of November.",
        "You should do more papers too.",
      ],
      answer: 2,
      clue: "Spend a whole session on one paper's mistakes before you open another.",
      explanation:
        "다음 회차를 열기 전에 틀린 문제에 한 시간을 통째로 쓰라는 조언을 들었으므로, 어제 시험지를 다시 보겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 현우야, 영어 모의고사 연습은 잘돼 가?",
        "M: 안돼. 두 달째 점수가 안 움직여.",
        "W: 그동안 몇 회 풀었는데?",
        "M: 열여덟 회. 사흘에 한 번씩, 시간 다 재고.",
        "W: 채점하고 나서는 뭘 해?",
        "M: 답 맞춰 보고 다음 회차 시작해.",
        "W: 그럼 틀린 문제에는 표시만 하고 끝나는 거네.",
        "M: 그런 셈이지. 다음 회차가 더 쓸모 있다고 늘 느꼈어.",
        "W: 그런데 다음 회차는 같은 걸 순서만 바꿔서 물어.",
        "M: 그리고 같은 이유로 또 틀리고.",
        "W: 다음 시험지를 열기 전에 한 회차 틀린 것에 한 시간을 통째로 써.",
        "M: 그럼 오늘 밤엔 어제 시험지를 다시 볼게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "Woman : ________________",
      points3: true,
      lines: [
        ["M", "Sujin, you've rewritten your personal statement six times."],
        ["W", "Every version reads better than the last one."],
        ["M", "Better how? What changes between them?"],
        ["W", "The wording, mostly. Smoother sentences, stronger verbs."],
        ["M", "And the content? The experiences you describe?"],
        ["W", "Those have stayed the same since the first draft."],
        ["M", "So six rounds of polish on the same three stories."],
        ["W", "When you say it like that, it sounds like I've been avoiding something."],
        ["M", "Polishing is comfortable because you can always do a little more of it."],
        ["W", "And choosing a different story is a decision I'd have to make."],
        ["M", "Show it to someone and ask which story is weakest."],
      ],
      choices: [
        "My statement is eight hundred words.",
        "Then I'll ask my teacher which one to cut.",
        "I've been working on it since June.",
        "The deadline is in three weeks.",
        "You should rewrite yours as well.",
      ],
      answer: 2,
      clue: "Show it to someone and ask which story is weakest.",
      explanation:
        "다른 사람에게 보여 주고 어느 이야기가 약한지 물으라는 조언을 들었으므로, 선생님께 어느 것을 뺄지 여쭤보겠다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 수진아, 자기소개서를 여섯 번이나 다시 썼네.",
        "W: 쓸 때마다 앞엣것보다 나아져.",
        "M: 어떻게 나아지는데? 뭐가 달라져?",
        "W: 거의 표현이야. 문장이 매끄러워지고 동사가 세지고.",
        "M: 내용은? 적어 놓은 경험들은?",
        "W: 그건 첫 초고 때부터 그대로야.",
        "M: 그럼 같은 이야기 세 개를 여섯 번 다듬은 거네.",
        "W: 그렇게 말하니까 내가 뭔가를 피해 온 것 같다.",
        "M: 다듬기는 편해. 언제든 조금 더 할 수 있으니까.",
        "W: 다른 이야기를 고르는 건 내가 결정을 내려야 하는 일이고.",
        "M: 누군가에게 보여 주고 어느 이야기가 제일 약한지 물어봐.",
        "W: 그럼 선생님께 어느 걸 뺄지 여쭤볼게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Minji가 Hyunwoo에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "Minji : ________________",
      points3: true,
      lines: [
        [
          "W",
          "Minji and Hyunwoo are putting together the graduation video for their year group. " +
            "Hyunwoo has spent a month collecting clips from every class, " +
            "and he has gathered nearly four hours of footage. " +
            "The clips are well shot and he has labelled each one with the date and the class. " +
            "However, the video will be shown at the ceremony, " +
            "where the programme allows exactly eight minutes for it. " +
            "Fitting four hours into eight minutes would mean two seconds a clip, " +
            "which would leave the audience unable to recognise anyone. " +
            "Minji does not want to suggest that the month was wasted. " +
            "She wants to propose choosing one clip from each class for the ceremony " +
            "and uploading the full collection to the year group's shared folder afterwards. " +
            "In this situation, what would Minji most likely say to Hyunwoo?",
        ],
      ],
      choices: [
        "Let's ask for more time at the ceremony.",
        "Could we show one clip per class and share the rest online?",
        "You should film a few more classes this week.",
        "Let's play the video at double speed.",
        "I'll edit all four hours myself tonight.",
      ],
      answer: 2,
      clue: "She wants to propose choosing one clip from each class for the ceremony and uploading the full collection to the year group's shared folder afterwards.",
      explanation:
        "민지는 현우가 쏟은 한 달을 깎아내리지 않으면서, 식장에서는 반마다 한 편씩만 틀고 나머지는 공유 폴더에 올리자고 말하려 한다. 따라서 ②가 가장 적절하다.",
      translation: [
        "W: 민지와 현우는 같은 학년 졸업 영상을 함께 만들고 있습니다. 현우는 한 달 동안 반마다 다니며 영상을 모았고, 거의 네 시간 분량을 쌓았습니다. 화면도 잘 찍혔고 한 편마다 날짜와 반을 적어 두었습니다. 그런데 영상은 졸업식장에서 트는데, 식순에 잡힌 시간은 정확히 8분입니다. 네 시간을 8분에 밀어 넣으면 한 편에 2초가 되고, 보는 사람은 누가 누군지 알아볼 수 없습니다. 민지는 그 한 달이 헛수고였다고 말하고 싶지 않습니다. 다만 식장에서는 반마다 한 편씩만 고르고, 전체 모음은 나중에 학년 공유 폴더에 올리자고 제안하고 싶습니다. 이런 상황에서 민지가 현우에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 남자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Good afternoon. Today I want to talk about how some birds remember where they put things. " +
            "The Clark's nutcracker is the extreme case. Through the autumn it buries pine seeds, " +
            "not in one place but in thousands of separate holes spread across many square kilometres. " +
            "It then survives the winter by digging them up again, months later, under snow. " +
            "For a long time people assumed it simply searched likely ground and found seeds by luck. " +
            "Careful studies showed something else. The bird recovers a high proportion of its own caches " +
            "and ignores ground that looks identical but holds nothing. " +
            "What it appears to store is not the hole itself but the relationship between the hole " +
            "and fixed landmarks around it: a boulder here, a dead tree there. " +
            "Move the landmarks and the bird digs in the wrong place, precisely and confidently.",
        ],
      ],
      choices: [
        "how a bird relocates thousands of hidden seeds",
        "why pine forests depend on winter snowfall",
        "how birds choose which seeds to eat first",
        "why some birds migrate before winter",
        "how animals share food during cold months",
      ],
      answer: 1,
      clue: "What it appears to store is not the hole itself but the relationship between the hole and fixed landmarks around it",
      explanation:
        "잣까마귀가 수천 곳에 묻은 씨앗을 둘레 지형지물과의 관계로 기억해 되찾는 과정을 설명한다. 따라서 답은 ①이다.",
      translation: [
        "M: 안녕하세요. 오늘은 어떤 새들이 물건을 어디에 두었는지 어떻게 기억하는지 이야기하려 합니다. 클라크잣까마귀가 가장 극단적인 예입니다. 가을 내내 잣을 묻는데, 한곳이 아니라 여러 제곱킬로미터에 걸친 수천 개의 따로 떨어진 구덩이에 묻습니다. 그러고는 몇 달 뒤 눈 밑에서 그것을 다시 파내며 겨울을 납니다. 오랫동안 사람들은 그 새가 그럴듯한 땅을 뒤지다가 운으로 씨앗을 찾는다고 여겼습니다. 꼼꼼한 연구는 다른 것을 보여 주었습니다. 그 새는 제가 묻은 자리를 높은 비율로 되찾고, 똑같아 보이지만 아무것도 없는 땅은 그냥 지나칩니다. 그 새가 저장하는 것은 구덩이 자체가 아니라 구덩이와 둘레 지형지물 사이의 관계인 듯합니다. 여기 바위 하나, 저기 죽은 나무 하나 같은 것입니다. 지형지물을 옮겨 놓으면 그 새는 엉뚱한 자리를 팝니다. 정확하고 자신 있게 말입니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 잣까마귀의 특징이 아닌 것은?",
      lines: [
        ["M", "Good afternoon. Today I want to talk about how some birds remember where they put things."],
        ["M", "The Clark's nutcracker is the extreme case."],
        ["M", "Through the autumn it buries pine seeds, not in one place but in thousands of separate holes spread across many square kilometres."],
        ["M", "It then survives the winter by digging them up again, months later, under snow."],
        ["M", "Careful studies showed that the bird recovers a high proportion of its own caches and ignores ground that looks identical but holds nothing."],
        ["M", "What it appears to store is not the hole itself but the relationship between the hole and fixed landmarks around it."],
        ["M", "Move the landmarks and the bird digs in the wrong place, precisely and confidently."],
      ],
      choices: [
        "burying seeds in thousands of holes",
        "digging seeds up months later",
        "ignoring ground that holds nothing",
        "using landmarks to locate caches",
        "sharing its caches with other birds",
      ],
      answer: 5,
      clue: "Move the landmarks and the bird digs in the wrong place, precisely and confidently.",
      explanation:
        "수천 구덩이에 묻기, 몇 달 뒤 파내기, 빈 땅 지나치기, 지형지물로 자리 찾기는 언급되지만 다른 새와 나눈다는 말은 없다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
