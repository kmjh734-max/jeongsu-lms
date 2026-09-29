/** 고1 듣기 39회 — 사람이 직접 쓴 회차 (2026-09-29) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고1 39회",
  gradeLevel: "high1",
  speechSpeed: 0.8,
  folder: "고1 듣기",
  questions: [
    {
      order: 1,
      type: "목적 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 목적으로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "Good afternoon, students. This is the school nurse speaking from the health room. " +
            "I want to remind you about how to use the health room this term. " +
            "Last month more than forty of you came down during class without a note, " +
            "and several of you were only looking for a quiet place to rest. " +
            "From now on, please ask your subject teacher for a slip before you come. " +
            "The slip takes ten seconds to write and tells me why you are here. " +
            "If you feel suddenly unwell, of course come straight down and we will sort it out later. " +
            "The health room stays open through both breaks and the whole lunch hour. " +
            "Thank you for helping me keep the beds for those who need them.",
        ],
      ],
      choices: [
        "보건실 이용 방법을 안내하려고",
        "예방 접종 일정을 알리려고",
        "손 씻기를 당부하려고",
        "건강 검진 결과를 알리려고",
        "체육 수업 변경을 알리려고",
      ],
      answer: 1,
      clue: "From now on, please ask your subject teacher for a slip before you come.",
      explanation:
        "여자는 보건실에 오기 전에 과목 선생님께 쪽지를 받아 오라며 이용 방법을 안내한다. 따라서 답은 ①이다.",
      translation: [
        "W: 학생 여러분, 안녕하세요. 보건실에서 보건 선생님이 말씀드립니다. 이번 학기 보건실 이용 방법을 다시 알려 드립니다. 지난달에 마흔 명이 넘는 학생이 쪽지 없이 수업 중에 내려왔고, 그중 몇몇은 조용히 쉴 곳을 찾아온 것이었습니다. 이제부터는 오기 전에 과목 선생님께 쪽지를 받아 오세요. 쪽지 쓰는 데는 10초면 되고, 저에게 왜 왔는지 알려 줍니다. 갑자기 몸이 안 좋으면 물론 바로 내려오시고 정리는 나중에 하면 됩니다. 보건실은 쉬는 시간 두 번과 점심시간 내내 열려 있습니다. 침대를 정말 필요한 사람에게 남겨 주셔서 고맙습니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 남자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Dohyun, I answered forty vocabulary questions in ten minutes."],
        ["M", "How many did you get right?"],
        ["W", "Thirty-one. That's not bad for the speed."],
        ["M", "And the nine you missed? Did you look at them?"],
        ["W", "I saw the correct answers at the bottom."],
        ["M", "Seeing is not the same as going back."],
        ["W", "Going back would take longer than the test did."],
        ["M", "It usually does, and it's where the whole value is."],
        ["W", "So the answering part is almost wasted?"],
        ["M", "Not wasted. It finds the nine. Only the review fixes them."],
        ["W", "I always feel I should move on to the next page."],
        ["M", "The next page will teach you nothing you don't already half know."],
      ],
      choices: [
        "문제는 많이 풀수록 좋다",
        "문제를 푼 뒤 틀린 것을 되짚어야 한다",
        "단어는 소리 내어 외워야 한다",
        "시간을 재고 풀어야 한다",
        "쉬운 문제부터 풀어야 한다",
      ],
      answer: 2,
      clue: "Not wasted. It finds the nine. Only the review fixes them.",
      explanation:
        "남자는 문제를 푸는 것은 틀린 것을 찾아 줄 뿐이고 되짚어 봐야 고쳐진다고 말한다. 따라서 답은 ②이다.",
      translation: [
        "W: 도현아, 10분에 단어 문제 마흔 개를 풀었어.",
        "M: 몇 개 맞았는데?",
        "W: 서른한 개. 그 속도면 나쁘지 않지.",
        "M: 틀린 아홉 개는? 다시 봤어?",
        "W: 아래에 있는 정답은 봤어.",
        "M: 보는 건 되짚는 것과 달라.",
        "W: 되짚으면 시험 푼 시간보다 오래 걸려.",
        "M: 보통 그래. 그런데 값어치는 거기 다 있어.",
        "W: 그럼 푸는 건 거의 헛수고야?",
        "M: 헛수고는 아니야. 그게 아홉 개를 찾아 줘. 고치는 건 되짚기뿐이야.",
        "W: 나는 늘 다음 쪽으로 넘어가야 할 것 같아.",
        "M: 다음 쪽은 네가 이미 절반쯤 아는 것만 가르쳐 줘.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "People say they have no time to read, and they are usually wrong. " +
            "What they have no time for is an hour of reading, " +
            "and an hour is the only unit they will accept. " +
            "Keep a book where you already wait. " +
            "The bus stop, the hallway before a class, the ten minutes before dinner. " +
            "Four small pieces make forty minutes without taking anything from the day. " +
            "A book read in pieces is not a lesser book. " +
            "The only book that teaches you nothing is the one still on the shelf.",
        ],
      ],
      choices: [
        "책은 조용한 곳에서 읽어야 한다",
        "책은 끝까지 읽어야 한다",
        "기다리는 짧은 시간에 읽으면 된다",
        "어려운 책을 읽어야 한다",
        "독서 기록을 남겨야 한다",
      ],
      answer: 3,
      clue: "Keep a book where you already wait.",
      explanation:
        "여자는 한 시간을 기다릴 것이 아니라 기다리는 짧은 시간마다 읽으라고 말한다. 따라서 답은 ③이다.",
      translation: [
        "W: 사람들은 책 읽을 시간이 없다고 말하는데, 대개는 틀린 말입니다. 시간이 없는 것은 한 시간짜리 독서이고, 그들은 한 시간이라는 단위만 인정합니다. 이미 기다리고 있는 자리에 책을 두세요. 버스 정류장, 수업 전 복도, 저녁 먹기 전 10분. 작은 조각 네 개면 하루에서 아무것도 빼앗지 않고 40분이 됩니다. 조각으로 읽은 책이 못한 책은 아닙니다. 아무것도 가르쳐 주지 않는 유일한 책은 아직 책장에 꽂혀 있는 책입니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["W", "Taeho, is this the science club room after the tidy-up?"],
        ["M", "Yes, we spent two afternoons on it."],
        ["W", "A long work bench stands in the middle of the room."],
        ["M", "We do all the experiments on that one."],
        ["W", "There's a tall glass cabinet against the left wall."],
        ["M", "The teacher keeps the chemicals locked inside it."],
        ["W", "A round wall clock hangs above the door."],
        ["M", "It stopped in July, but we like it there."],
        ["W", "Two stools are pushed under the bench."],
        ["M", "There are three. One is hidden behind the cabinet."],
        ["W", "And a large poster of the planets covers the right wall."],
        ["M", "A graduating student left it for us."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "There are three. One is hidden behind the cabinet.",
      explanation:
        "여자가 의자가 둘이라고 하자 남자가 셋이라고 바로잡는다. 그림에는 둘이 그려져 있으므로 답은 ④이다.",
      figure: {
        kind: "figure5",
        spots: [
          [0.5, 0.4],
          [0.08, 0.4],
          [0.55, 0.08],
          [0.45, 0.78],
          [0.88, 0.45],
        ],
        scene:
          "A school science club room drawn as one wide picture, clean black line art on white, no writing or letters or numbers anywhere. " +
          "A LONG WORK BENCH stands across the MIDDLE of the room. " +
          "A TALL GLASS CABINET with shelves stands against the LEFT wall. " +
          "A ROUND WALL CLOCK hangs on the BACK wall above a door in the upper middle. " +
          "EXACTLY TWO ROUND STOOLS are pushed under the front edge of the work bench, " +
          "clearly separated so both can be counted. " +
          "A LARGE POSTER showing the planets of the solar system covers the RIGHT wall.",
      },
      translation: [
        "W: 태호야, 여기가 정리하고 난 과학 동아리방이야?",
        "M: 응, 오후 두 번을 꼬박 썼어.",
        "W: 방 한가운데에 긴 실험대가 있네.",
        "M: 실험은 다 저기서 해.",
        "W: 왼쪽 벽에는 키 큰 유리장이 있고.",
        "M: 선생님이 약품을 그 안에 잠가 두셔.",
        "W: 문 위에는 둥근 벽시계가 걸려 있어.",
        "M: 7월에 멈췄는데 거기 있는 게 좋아서 뒀어.",
        "W: 실험대 아래에 의자가 두 개 밀려 있네.",
        "M: 세 개야. 하나는 유리장 뒤에 가려 있어.",
        "W: 그리고 오른쪽 벽은 행성 그림 큰 포스터가 덮고 있어.",
        "M: 졸업한 선배가 남겨 준 거야.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 남자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Sungmin, the school play opens on Thursday evening."],
        ["M", "Are the costumes all back from the cleaner's?"],
        ["W", "They came yesterday, and they're hanging backstage."],
        ["M", "What about the lighting?"],
        ["W", "Two of us tested every cue on Monday."],
        ["M", "Then everything is ready."],
        ["W", "Except the seats. Nobody has set out the chairs in the hall."],
        ["M", "How many do we need for Thursday?"],
        ["W", "A hundred and twenty, in six rows of twenty."],
        ["M", "That would take three people about an hour."],
        ["W", "The hall is free from four o'clock today."],
        ["M", "I'll gather two friends and set out the chairs."],
      ],
      choices: [
        "의상을 찾아오기",
        "조명을 점검하기",
        "강당에 의자를 놓기",
        "표를 팔기",
        "대본을 인쇄하기",
      ],
      answer: 3,
      clue: "I'll gather two friends and set out the chairs.",
      explanation:
        "남자는 친구 둘을 모아 강당에 의자를 놓겠다고 말한다. 따라서 답은 ③이다.",
      translation: [
        "W: 성민아, 학교 연극이 목요일 저녁에 막을 올려.",
        "M: 의상은 세탁소에서 다 찾아왔어?",
        "W: 어제 왔어. 무대 뒤에 걸어 뒀어.",
        "M: 조명은?",
        "W: 월요일에 둘이서 신호마다 다 확인했어.",
        "M: 그럼 다 된 거네.",
        "W: 좌석만 빼고. 강당에 의자를 아무도 안 놨어.",
        "M: 목요일에 몇 개 필요해?",
        "W: 백스무 개. 스무 개씩 여섯 줄.",
        "M: 셋이서 한 시간쯤 걸리겠다.",
        "W: 강당이 오늘 네 시부터 비어.",
        "M: 친구 둘 모아서 의자 놓을게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 여자가 지불할 금액을 고르시오.",
      lines: [
        ["M", "Good morning. Are you booking the seminar room?"],
        ["W", "Yes, for a study group on Saturday afternoon."],
        ["M", "The small room is twenty dollars for two hours."],
        ["W", "We need four hours, if that's possible."],
        ["M", "Each extra hour after the first two is eight dollars."],
        ["W", "Four hours in the small room, then."],
        ["M", "Will you need the screen and the projector?"],
        ["W", "Yes, please. We have slides to go through."],
        ["M", "That equipment is ten dollars for the day."],
        ["W", "Do students get any discount here?"],
        ["M", "Students pay five dollars less on the room charge."],
        ["W", "Here is my student card, then."],
      ],
      choices: ["$41", "$46", "$36", "$51", "$44"],
      answer: 1,
      clue: "Each extra hour after the first two is eight dollars.",
      explanation:
        "작은 방 네 시간은 36달러이고 학생 할인 5달러를 빼면 31달러이며, 기기 10달러를 더하면 41달러이다. 따라서 답은 ①이다.",
      translation: [
        "M: 안녕하세요. 세미나실 예약하시나요?",
        "W: 네, 토요일 오후에 스터디 모임으로요.",
        "M: 작은 방은 두 시간에 20달러입니다.",
        "W: 가능하면 네 시간이 필요해요.",
        "M: 처음 두 시간 뒤로는 한 시간마다 8달러입니다.",
        "W: 그럼 작은 방으로 네 시간이요.",
        "M: 화면과 영사기도 필요하신가요?",
        "W: 네, 부탁드려요. 볼 자료가 있어요.",
        "M: 그 장비는 하루에 10달러입니다.",
        "W: 여기 학생 할인이 있나요?",
        "M: 학생은 방값에서 5달러를 덜 내십니다.",
        "W: 그럼 여기 학생증이요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 여자가 동아리를 그만두려는 이유를 고르시오.",
      lines: [
        ["M", "Chaewon, I heard you're leaving the debate club."],
        ["W", "At the end of this term, yes."],
        ["M", "Is it because the meetings run too late?"],
        ["W", "They finish at six, which is fine for me."],
        ["M", "Then did something happen with the members?"],
        ["W", "Not at all. I've started a volunteer class on the same day."],
        ["M", "The one at the community centre?"],
        ["W", "That one, and it runs every Thursday afternoon."],
      ],
      choices: [
        "모임이 늦게 끝나서",
        "회원들과 사이가 나빠서",
        "같은 요일에 다른 활동을 시작해서",
        "성적이 떨어져서",
        "이사를 가게 되어서",
      ],
      answer: 3,
      clue: "Not at all. I've started a volunteer class on the same day.",
      explanation:
        "여자는 같은 요일에 봉사 수업을 시작해 동아리를 그만둔다고 말한다. 따라서 답은 ③이다.",
      translation: [
        "M: 채원아, 토론 동아리 그만둔다며.",
        "W: 이번 학기 끝나면.",
        "M: 모임이 너무 늦게 끝나서야?",
        "W: 여섯 시에 끝나는데 나한테는 괜찮아.",
        "M: 그럼 부원들이랑 무슨 일 있었어?",
        "W: 전혀. 같은 요일에 봉사 수업을 시작했어.",
        "M: 주민 센터에서 하는 거?",
        "W: 그거야. 목요일 오후마다 해.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 교내 자원봉사 주간에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["W", "Junho, have you heard about the volunteer week?"],
        ["M", "Only the name. When does it start?"],
        ["W", "On the ninth, and it runs until the thirteenth."],
        ["M", "What kinds of work can we choose from?"],
        ["W", "Three kinds: the park, the library and the senior centre."],
        ["M", "How many hours do we do each day?"],
        ["W", "Two hours after school, and you may come every day."],
        ["M", "Do we need to sign up in advance?"],
        ["W", "You write your name on the list by the staff room."],
        ["M", "Does the school give us anything for it?"],
        ["W", "A certificate at the end of the week."],
      ],
      choices: ["봉사 주간의 기간", "고를 수 있는 활동", "하루 봉사 시간", "신청하는 방법", "가는 방법"],
      answer: 5,
      clue: "On the ninth, and it runs until the thirteenth.",
      explanation:
        "기간, 활동, 시간, 신청 방법은 말했지만 가는 방법은 말하지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 준호야, 자원봉사 주간 얘기 들었어?",
        "M: 이름만. 언제 시작해?",
        "W: 9일에 시작해서 13일까지 해.",
        "M: 어떤 활동 중에 고를 수 있어?",
        "W: 세 가지. 공원, 도서관, 노인 복지관.",
        "M: 하루에 몇 시간씩 해?",
        "W: 방과 후 두 시간. 매일 와도 돼.",
        "M: 미리 신청해야 해?",
        "W: 교무실 옆 명단에 이름을 적으면 돼.",
        "M: 학교에서 뭘 주기도 해?",
        "W: 주가 끝나면 확인서를 줘.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Sunset Rooftop Cinema에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "M",
          "Here is some information about the Sunset Rooftop Cinema, which opens this summer. " +
            "Films are shown on the roof of the old post office building. " +
            "Screenings take place on Friday and Saturday nights only. " +
            "The film starts at eight thirty, once the sky is properly dark. " +
            "Tickets cost seven thousand won, and a student ticket is five thousand. " +
            "Cushions are provided, but visitors are welcome to bring their own blankets. " +
            "Food and drinks may be bought from the small counter beside the stairs. " +
            "If it rains, the screening is cancelled and tickets are refunded in full.",
        ],
      ],
      choices: [
        "옛 우체국 건물 옥상에서 한다",
        "금요일과 토요일 밤에만 상영한다",
        "상영은 여덟 시 반에 시작한다",
        "방석은 직접 가져가야 한다",
        "비가 오면 표값을 돌려준다",
      ],
      answer: 4,
      clue: "Cushions are provided, but visitors are welcome to bring their own blankets.",
      explanation:
        "방석은 제공되고 담요만 가져와도 된다고 했으므로 ④가 일치하지 않는다.",
      translation: [
        "M: 이번 여름에 문을 여는 선셋 옥상 극장에 대해 알려 드립니다. 영화는 옛 우체국 건물 옥상에서 상영합니다. 상영은 금요일과 토요일 밤에만 합니다. 하늘이 충분히 어두워지는 여덟 시 반에 시작합니다. 표는 7천 원이고 학생표는 5천 원입니다. 방석은 제공되지만 담요는 직접 가져오셔도 좋습니다. 먹을 것과 마실 것은 계단 옆 작은 매점에서 살 수 있습니다. 비가 오면 상영을 취소하고 표값을 전액 돌려 드립니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 예약할 회의실을 고르시오.",
      lines: [
        ["W", "Minjae, five meeting rooms are open on Saturday."],
        ["M", "Our group has fourteen people this time."],
        ["W", "Then anything smaller than fourteen is out."],
        ["M", "That removes two of them immediately."],
        ["W", "We also need a room with a projector."],
        ["M", "One of the three left has no equipment at all."],
        ["W", "And the price has to stay under forty thousand won."],
        ["M", "One of the last two is fifty-five thousand."],
        ["W", "So there's only one room we can take."],
        ["M", "I'll book it as soon as I get home."],
        ["W", "Ask them to open it from one o'clock."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 2,
      clue: "Our group has fourteen people this time.",
      explanation:
        "14명 이상, 영사기 있음, 4만 원 미만인 방을 고른다. 세 조건을 모두 채우는 것은 ②이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Capacity: 10 / Projector: Yes / Price: 30,000 won" },
          { no: 2, label: "②", value: "Capacity: 16 / Projector: Yes / Price: 38,000 won" },
          { no: 3, label: "③", value: "Capacity: 14 / Projector: No / Price: 25,000 won" },
          { no: 4, label: "④", value: "Capacity: 20 / Projector: Yes / Price: 55,000 won" },
          { no: 5, label: "⑤", value: "Capacity: 12 / Projector: No / Price: 20,000 won" },
        ],
      },
      translation: [
        "W: 민재야, 토요일에 회의실 다섯 개가 비어 있어.",
        "M: 이번엔 우리 모임이 열네 명이야.",
        "W: 그럼 열네 명보다 작은 데는 빠져.",
        "M: 그럼 두 개는 바로 빠지네.",
        "W: 영사기가 있는 방이어야 해.",
        "M: 남은 셋 중 하나는 장비가 아예 없어.",
        "W: 그리고 값은 4만 원 아래여야 해.",
        "M: 남은 둘 중 하나는 5만 5천 원이야.",
        "W: 그럼 우리가 쓸 수 있는 건 하나뿐이네.",
        "M: 집에 가자마자 예약할게.",
        "W: 한 시부터 열어 달라고 해.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Hyerin, is the class notice board finished?"],
        ["W", "Half of it. I ran out of coloured paper."],
        ["M", "The art room has plenty in the back cupboard."],
        ["W", "I don't have the key to that cupboard."],
        ["M", "Shall I ask the art teacher for you?"],
      ],
      choices: [
        "The board is already finished.",
        "Yes, please, that would help.",
        "I don't need any paper.",
        "The art room has no cupboard.",
        "You should finish the board.",
      ],
      answer: 2,
      clue: "Shall I ask the art teacher for you?",
      explanation:
        "미술 선생님께 대신 여쭤볼지 물었으므로, 그래 주면 좋겠다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 혜린아, 학급 게시판 다 했어?",
        "W: 절반. 색종이가 떨어졌어.",
        "M: 미술실 뒤쪽 장에 많이 있어.",
        "W: 나는 그 장 열쇠가 없어.",
        "M: 내가 미술 선생님께 여쭤볼까?",
        "W: 응, 부탁해. 그럼 큰 도움이 될 거야.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Seongho, did you order the club T-shirts?"],
        ["M", "Not yet. I still need everyone's size."],
        ["W", "Four people haven't answered the message."],
        ["M", "The shop needs the order by Friday."],
        ["W", "Could you ask them in person tomorrow?"],
      ],
      choices: [
        "The shirts arrived already.",
        "All right, I'll ask them at lunch.",
        "Nobody wants a T-shirt.",
        "I don't know those people.",
        "Friday is far away.",
      ],
      answer: 2,
      clue: "Could you ask them in person tomorrow?",
      explanation:
        "내일 직접 물어봐 달라고 했으므로, 점심때 묻겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 성호야, 동아리 티셔츠 주문했어?",
        "M: 아직. 아직 모두의 치수를 못 받았어.",
        "W: 네 명이 메시지에 답을 안 했어.",
        "M: 가게에서는 금요일까지 주문을 달래.",
        "W: 내일 직접 물어봐 줄래?",
        "M: 그래, 점심때 물어볼게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Wonjae, how is the school podcast going?"],
        ["M", "We've recorded six episodes, but hardly anyone listens."],
        ["W", "How many people heard the last one?"],
        ["M", "Eleven, and four of them are in the club."],
        ["W", "Where do you tell people about a new episode?"],
        ["M", "We put a notice on the board by the office."],
        ["W", "Do students walk past that board every day?"],
        ["M", "Only the ones who go to the office, I suppose."],
        ["W", "So the notice is in the one place people avoid."],
        ["M", "I never thought of it that way."],
        ["W", "Why not read one minute of it over the lunch broadcast?"],
      ],
      choices: [
        "Nobody listens to the lunch broadcast.",
        "We have no episodes recorded.",
        "That could work, I'll ask them.",
        "The board is the best place.",
        "I'll stop making the podcast.",
      ],
      answer: 3,
      clue: "Why not read one minute of it over the lunch broadcast?",
      explanation:
        "점심 방송에서 1분만 틀어 보라는 제안이므로, 물어보겠다는 ③이 가장 자연스럽다.",
      translation: [
        "W: 원재야, 학교 팟캐스트는 어떻게 돼 가?",
        "M: 여섯 편을 녹음했는데 듣는 사람이 거의 없어.",
        "W: 지난 편은 몇 명이 들었어?",
        "M: 열한 명. 그중 넷은 동아리 부원이야.",
        "W: 새 편이 나온 건 어디에 알려?",
        "M: 교무실 옆 게시판에 붙여.",
        "W: 학생들이 그 게시판을 매일 지나가?",
        "M: 교무실 가는 애들만 그렇겠지.",
        "W: 그럼 알림이 다들 피하는 자리에 있는 거네.",
        "M: 그렇게는 생각 못 했어.",
        "W: 점심 방송에서 1분만 들려주는 건 어때?",
        "M: 될 것 같아, 물어볼게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Dayeon, you've been writing letters to your grandmother."],
        ["W", "One every second Sunday, on real paper."],
        ["M", "Why not simply call her instead?"],
        ["W", "We do call, but she keeps the letters in a box."],
        ["M", "How long does one letter take you?"],
        ["W", "Half an hour, mostly about small things."],
        ["M", "Does she write back to you as well?"],
        ["W", "Every time, and her handwriting is better than mine."],
        ["M", "My grandfather would love something like that."],
        ["W", "He probably would. Most people would."],
        ["M", "Could you show me how you start a letter?"],
      ],
      choices: [
        "I never write letters.",
        "Sure, I'll bring one tomorrow.",
        "Letters are a waste of time.",
        "My grandmother can't read.",
        "You should call him instead.",
      ],
      answer: 2,
      clue: "Could you show me how you start a letter?",
      explanation:
        "편지를 어떻게 시작하는지 보여 달라고 했으므로, 내일 하나 가져오겠다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 다연아, 할머니께 편지를 쓴다며.",
        "W: 두 주에 한 번, 일요일마다 진짜 종이에.",
        "M: 그냥 전화하면 되지 않아?",
        "W: 전화도 하는데 할머니가 편지를 상자에 모아 두셔.",
        "M: 한 통 쓰는 데 얼마나 걸려?",
        "W: 30분쯤. 거의 사소한 이야기야.",
        "M: 할머니도 답장을 쓰셔?",
        "W: 매번. 글씨가 나보다 훨씬 좋으셔.",
        "M: 우리 할아버지도 그런 걸 좋아하실 텐데.",
        "W: 그러실 거야. 대부분 그래.",
        "M: 편지를 어떻게 시작하는지 보여 줄래?",
        "W: 그럼, 내일 한 통 가져올게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Jaeho가 Areum에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Jaeho : ________________",
      lines: [
        [
          "M",
          "Jaeho and Areum are in charge of the class fundraising stall. " +
            "They have been selling handmade badges during every lunch break. " +
            "Areum keeps all the money they take in her own school bag. " +
            "The bag sits open on a chair behind the stall all through lunch. " +
            "Today more than eighty thousand won has been collected in it. " +
            "Jaeho thinks the money should be handed to their teacher each day " +
            "instead of travelling home in a school bag. " +
            "In this situation, what would Jaeho most likely say to Areum?",
        ],
      ],
      choices: [
        "Let's sell the badges for less money.",
        "We should stop the stall today.",
        "I'll carry the bag home tonight.",
        "Let's give the money to our teacher each day.",
        "Your bag is too small for the badges.",
      ],
      answer: 4,
      clue: "Jaeho thinks the money should be handed to their teacher each day.",
      explanation:
        "돈을 가방에 두지 말고 날마다 선생님께 맡기자는 뜻이므로 ④가 가장 적절하다.",
      translation: [
        "M: 재호와 아름이는 학급 모금 가판을 맡고 있습니다. 두 사람은 점심시간마다 손으로 만든 배지를 팔아 왔습니다. 아름이는 받은 돈을 모두 자기 책가방에 넣어 둡니다. 그 가방은 점심시간 내내 가판 뒤 의자 위에 열린 채 놓여 있습니다. 오늘은 그 안에 8만 원이 넘게 모였습니다. 재호는 그 돈을 책가방에 담아 집까지 가져가지 말고 날마다 선생님께 맡겨야 한다고 생각합니다. 이런 상황에서 재호가 아름이에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 남자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Hello, everyone. Today I want to explain why aeroplane windows are round. " +
            "The first passenger jets in the nineteen fifties had square windows, " +
            "and two of them broke apart in the air within a single year. " +
            "The cabin is pushed outwards by the air inside it at high altitude, " +
            "and that push spreads evenly through a smooth curved surface. " +
            "A sharp corner cannot spread it. The force gathers at the point " +
            "and the metal there carries several times the load of the panel around it. " +
            "After thousands of flights, a crack begins exactly at that corner. " +
            "A round window has no corner for the force to collect in, " +
            "which is why every window you have ever looked through in the air was curved.",
        ],
      ],
      choices: [
        "how aeroplane engines produce thrust",
        "why aeroplane windows are made round",
        "how cabin air is kept warm at altitude",
        "why metal becomes brittle in the cold",
        "how pilots check an aircraft before flight",
      ],
      answer: 2,
      clue: "A sharp corner cannot spread it.",
      explanation:
        "남자는 모서리에 힘이 모여 균열이 생기기 때문에 창을 둥글게 만든다고 설명한다. 따라서 답은 ②이다.",
      translation: [
        "M: 안녕하세요, 여러분. 오늘은 비행기 창문이 왜 둥근지 설명하려 합니다. 1950년대의 첫 여객기들은 네모난 창을 달았고, 그중 두 대가 한 해 안에 공중에서 부서졌습니다. 높은 고도에서는 안쪽 공기가 기체를 바깥으로 밀고, 그 힘은 매끄럽게 굽은 면을 따라 고르게 퍼집니다. 날카로운 모서리는 그것을 퍼뜨리지 못합니다. 힘이 그 점에 모이고, 그곳의 금속은 둘레보다 몇 배의 부담을 지게 됩니다. 수천 번을 날고 나면 바로 그 모서리에서 금이 가기 시작합니다. 둥근 창에는 힘이 모일 모서리가 없습니다. 그래서 여러분이 하늘에서 내다본 창은 모두 둥글었던 것입니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 내용이 아닌 것은?",
      lines: [
        ["M", "Today I want to explain why aeroplane windows are round."],
        ["M", "The first passenger jets in the nineteen fifties had square windows."],
        ["M", "The cabin is pushed outwards by the air inside it at high altitude."],
        ["M", "The force gathers at the point and the metal there carries several times the load."],
        ["M", "After thousands of flights, a crack begins exactly at that corner."],
      ],
      choices: [
        "square windows on the first passenger jets",
        "the cabin being pushed outwards by inside air",
        "force gathering at a sharp corner",
        "a crack starting after thousands of flights",
        "the cost of replacing an aircraft window",
      ],
      answer: 5,
      clue: "The first passenger jets in the nineteen fifties had square windows.",
      explanation:
        "첫 여객기의 네모난 창, 안쪽 공기가 미는 힘, 모서리에 모이는 힘, 수천 번 비행 뒤의 균열은 언급되지만 창을 바꾸는 값은 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
