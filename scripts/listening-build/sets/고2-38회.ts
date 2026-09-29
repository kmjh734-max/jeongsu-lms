/** 고2 듣기 38회 — 사람이 직접 쓴 회차 (2026-09-29) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고2 38회",
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
          "Good morning, students. This is Ms. Noh from the science department. " +
            "I am speaking about the science fair that takes place in November. " +
            "Every year the same question reaches me in October, far too late to help: " +
            "what counts as a project and what does not. " +
            "So this year a two page guide is going up on the noticeboard today. " +
            "It explains what the judges look for, with two examples from last year. " +
            "Read it before you choose a topic, not after you have run the experiment. " +
            "Half the projects that disappoint were decided in a single afternoon. " +
            "My door is open at lunch if you would like to talk it through. Thank you.",
        ],
      ],
      choices: [
        "과학전 안내 자료를 읽으라고 하려고",
        "과학전 날짜 변경을 알리려고",
        "실험실 사용 규칙을 안내하려고",
        "과학 동아리 가입을 권하려고",
        "실험 보고서 제출을 독촉하려고",
      ],
      answer: 1,
      clue: "So this year a two page guide is going up on the noticeboard today.",
      explanation:
        "여자는 과학전 안내 자료를 게시판에 붙인다며 주제를 정하기 전에 읽으라고 말한다. 따라서 답은 ①이다.",
      translation: [
        "W: 학생 여러분, 안녕하세요. 과학부 노 선생님입니다. 11월에 열리는 과학전에 대해 말씀드립니다. 해마다 10월이면 같은 질문이 저에게 옵니다. 도움이 되기에는 너무 늦은 때지요. 무엇이 과제가 되고 무엇이 안 되느냐는 질문입니다. 그래서 올해는 두 쪽짜리 안내 자료를 오늘 게시판에 붙입니다. 심사위원이 무엇을 보는지 작년 사례 두 개와 함께 설명해 두었습니다. 실험을 다 하고 나서가 아니라 주제를 고르기 전에 읽으세요. 실망스러운 과제의 절반은 하루 오후 만에 정해진 것들이었습니다. 함께 이야기하고 싶으면 점심시간에 제 방에 오세요. 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 남자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Junho, I've been revising with my notes open beside the questions."],
        ["M", "So the answer is on the desk while you're answering."],
        ["W", "It stops me getting stuck for twenty minutes."],
        ["M", "It also stops you finding out what you don't know."],
        ["W", "But I do look away while I write."],
        ["M", "Looking away for ten seconds is not the same as not having it."],
        ["W", "Then how am I supposed to check myself?"],
        ["M", "Close the notes, answer badly, then open them and compare."],
        ["W", "Answering badly feels like wasting the evening."],
        ["M", "That bad answer is the only honest picture of your memory."],
        ["W", "And the comparison tells me exactly what to fix."],
        ["M", "Which an open book never does, however carefully you read it."],
      ],
      choices: [
        "필기를 자세히 해야 한다",
        "문제는 필기를 덮고 풀어야 한다",
        "문제를 많이 풀어야 한다",
        "친구와 함께 공부해야 한다",
        "복습은 아침에 해야 한다",
      ],
      answer: 2,
      clue: "Close the notes, answer badly, then open them and compare.",
      explanation:
        "남자는 필기를 덮고 스스로 답해 본 뒤 비교해야 한다고 말한다. 따라서 답은 ②이다.",
      translation: [
        "W: 준호야, 나는 문제 옆에 필기를 펴 놓고 복습해.",
        "M: 그럼 답하는 동안 답이 책상에 있는 거네.",
        "W: 20분씩 막히는 걸 막아 주잖아.",
        "M: 네가 뭘 모르는지 알아내는 것도 막아.",
        "W: 그래도 쓸 때는 눈을 떼는데.",
        "M: 10초 눈을 떼는 건 아예 없는 것과 달라.",
        "W: 그럼 스스로 어떻게 확인해?",
        "M: 필기를 덮고 엉성하게라도 답한 다음, 펴서 비교해.",
        "W: 엉성하게 답하면 저녁을 버리는 기분인데.",
        "M: 그 엉성한 답이 네 기억을 보여 주는 유일하게 솔직한 그림이야.",
        "W: 그리고 비교하면 뭘 고쳐야 하는지 정확히 알겠네.",
        "M: 펼쳐 둔 책은 아무리 꼼꼼히 읽어도 그걸 못 알려 줘.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "People say they want honest feedback, and then they ask, was it good? " +
            "That question has only one polite answer, " +
            "and the person in front of you will give it. " +
            "If you want something you can use, narrow the question until it cannot be dodged. " +
            "Where did you get bored? Which paragraph did you read twice? " +
            "What did you expect to happen next that never happened? " +
            "A narrow question gives permission to be specific, " +
            "and specific is the only kind of feedback that changes anything.",
        ],
      ],
      choices: [
        "의견은 여러 사람에게 구해야 한다",
        "조언을 구할 때는 질문을 좁혀야 한다",
        "비판은 정중하게 해야 한다",
        "글은 여러 번 고쳐야 한다",
        "칭찬을 먼저 해야 한다",
      ],
      answer: 2,
      clue: "If you want something you can use, narrow the question until it cannot be dodged.",
      explanation:
        "여자는 막연한 질문에는 예의상 답만 돌아오므로 질문을 좁히라고 말한다. 따라서 답은 ②이다.",
      translation: [
        "W: 사람들은 솔직한 의견을 듣고 싶다고 말하면서 이렇게 묻습니다. 괜찮았어? 그 질문에는 예의 바른 답이 하나뿐이고, 앞에 있는 사람은 그 답을 줍니다. 쓸모 있는 것을 얻고 싶다면 피할 수 없을 만큼 질문을 좁히세요. 어디서 지루했어? 어느 문단을 두 번 읽었어? 다음에 무엇이 나올 줄 알았는데 안 나왔어? 좁은 질문은 구체적으로 말해도 된다는 허락이 되고, 무언가를 바꾸는 의견은 구체적인 것뿐입니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["M", "Chaeyeon, is this the school health room after the move?"],
        ["W", "Yes, it reopened at the end of last month."],
        ["M", "A bed with a curtain stands against the left wall."],
        ["W", "The curtain can be pulled right round it."],
        ["M", "There's a tall glass cabinet in the corner."],
        ["W", "All the medicine is locked inside that one."],
        ["M", "A round wall clock hangs above the desk."],
        ["W", "The nurse writes the time of every visit by it."],
        ["M", "Three chairs stand along the near wall."],
        ["W", "Two, actually. The third one went to the office."],
        ["M", "And a wide window fills the back wall."],
        ["W", "It opens from the top, so the air moves without a draught."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "Two, actually. The third one went to the office.",
      explanation:
        "남자가 의자가 세 개라고 하자 여자가 두 개라고 바로잡는다. 그림에는 세 개가 그려져 있으므로 답은 ④이다.",
      figure: {
        kind: "figure5",
        spots: [
          [0.14, 0.45],
          [0.88, 0.35],
          [0.52, 0.22],
          [0.45, 0.84],
          [0.6, 0.06],
        ],
        scene:
          "A school health room drawn as one wide picture, clean black line art on white, no writing or letters or numbers anywhere. " +
          "A BED with a CURTAIN RAIL around it stands against the LEFT wall. " +
          "A TALL GLASS CABINET holding bottles stands in the RIGHT corner. " +
          "A ROUND WALL CLOCK hangs on the wall above a small DESK in the middle. " +
          "EXACTLY THREE CHAIRS stand in a row along the NEAR wall at the bottom of the picture, " +
          "evenly spaced and clearly separated so all three can be counted. " +
          "A WIDE WINDOW fills the BACK wall in the upper middle.",
      },
      translation: [
        "M: 채연아, 여기가 옮기고 난 보건실이야?",
        "W: 응, 지난달 말에 다시 열었어.",
        "M: 왼쪽 벽에 커튼 달린 침대가 있네.",
        "W: 커튼을 침대 둘레로 다 칠 수 있어.",
        "M: 구석에는 키 큰 유리장이 있고.",
        "W: 약은 다 그 안에 잠가 둬.",
        "M: 책상 위에는 둥근 벽시계가 걸려 있어.",
        "W: 보건 선생님이 그걸 보고 방문 시각을 적으셔.",
        "M: 이쪽 벽을 따라 의자가 세 개 있네.",
        "W: 사실 두 개야. 세 번째는 교무실로 갔어.",
        "M: 그리고 뒷벽은 넓은 창문이 차지하고 있어.",
        "W: 위에서 열려서 바람이 직접 안 들어와.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 남자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Sangwoo, the careers talk is on Wednesday afternoon."],
        ["M", "Have the three speakers all confirmed?"],
        ["W", "All three, and two of them are arriving together."],
        ["M", "What about the hall and the microphones?"],
        ["W", "Booked on Monday, and the sound was tested yesterday."],
        ["M", "Then the main things are in place."],
        ["W", "Except the introductions. Somebody has to introduce each speaker."],
        ["M", "Can't we just read out what they sent?"],
        ["W", "Two of them sent a whole page, and the third sent nothing."],
        ["M", "So the pages need cutting and the third needs writing."],
        ["W", "Three short paragraphs, before Wednesday morning."],
        ["M", "I'll write the three introductions tonight."],
      ],
      choices: [
        "강당을 예약하기",
        "마이크를 점검하기",
        "강연자 소개글을 쓰기",
        "강연자에게 연락하기",
        "안내문을 붙이기",
      ],
      answer: 3,
      clue: "I'll write the three introductions tonight.",
      explanation:
        "남자는 오늘 밤에 강연자 소개글 세 개를 쓰겠다고 말한다. 따라서 답은 ③이다.",
      translation: [
        "W: 상우야, 진로 강연이 수요일 오후야.",
        "M: 강연자 세 분 다 확정됐어?",
        "W: 세 분 다. 그중 두 분은 함께 오셔.",
        "M: 강당이랑 마이크는?",
        "W: 월요일에 예약했고 소리는 어제 확인했어.",
        "M: 그럼 큰 건 다 됐네.",
        "W: 소개만 빼고. 강연자마다 소개해 드려야 해.",
        "M: 보내 주신 걸 그냥 읽으면 안 돼?",
        "W: 두 분은 한 쪽을 보내셨고 한 분은 아무것도 안 보내셨어.",
        "M: 그럼 두 개는 줄이고 하나는 새로 써야겠네.",
        "W: 짧은 문단 세 개, 수요일 아침 전에.",
        "M: 오늘 밤에 소개글 세 개 쓸게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 여자가 지불할 금액을 고르시오.",
      lines: [
        ["M", "Good afternoon. Are you here about the club jackets?"],
        ["W", "Yes, we'd like to order some for the team."],
        ["M", "A plain jacket is twenty-two dollars each."],
        ["W", "We need ten of them, please."],
        ["M", "Would you like a name on the back?"],
        ["W", "How much does the name add?"],
        ["M", "Three dollars for each jacket."],
        ["W", "Put a name on six of them and leave four plain."],
        ["M", "Do you need them within a week?"],
        ["W", "Two weeks is fine for us."],
        ["M", "Good, because rush orders cost fifteen dollars more."],
        ["W", "Here is the club card, then."],
      ],
      choices: ["$238", "$250", "$253", "$220", "$265"],
      answer: 1,
      clue: "A plain jacket is twenty-two dollars each.",
      explanation:
        "재킷 열 벌은 220달러이고 이름 여섯 벌분 18달러를 더하면 238달러이며, 빠른 배송은 쓰지 않는다. 따라서 답은 ①이다.",
      translation: [
        "M: 안녕하세요. 동아리 재킷 때문에 오셨나요?",
        "W: 네, 팀에서 쓸 걸 주문하려고요.",
        "M: 무늬 없는 재킷은 한 벌에 22달러입니다.",
        "W: 열 벌 주세요.",
        "M: 등에 이름을 넣어 드릴까요?",
        "W: 이름을 넣으면 얼마가 더 붙나요?",
        "M: 한 벌에 3달러입니다.",
        "W: 여섯 벌에만 이름을 넣고 네 벌은 그대로 두세요.",
        "M: 일주일 안에 필요하신가요?",
        "W: 두 주면 괜찮아요.",
        "M: 다행입니다. 급한 주문은 15달러가 더 붙거든요.",
        "W: 그럼 여기 동아리 카드요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 여자가 발표 자료를 다시 만드는 이유를 고르시오.",
      lines: [
        ["M", "Hayoon, you're rebuilding the whole presentation?"],
        ["W", "From the first slide, and I only finished it on Sunday."],
        ["M", "Did the teacher say something about the content?"],
        ["W", "She liked the content. That part is staying."],
        ["M", "Then did you find a mistake in the numbers?"],
        ["W", "The numbers are right. The hall projector is very old."],
        ["M", "And old projectors wash out pale colours."],
        ["W", "Half my slides are grey text on a white background."],
        ["M", "From the back row nobody would read a word."],
        ["W", "So everything has to be dark text on pale yellow."],
      ],
      choices: [
        "내용이 틀려서",
        "숫자가 잘못되어서",
        "영사기 때문에 색이 안 보여서",
        "시간이 모자라서",
        "주제가 바뀌어서",
      ],
      answer: 3,
      clue: "The numbers are right. The hall projector is very old.",
      explanation:
        "여자는 낡은 영사기 때문에 옅은 색 글씨가 보이지 않아 자료를 다시 만든다고 말한다. 따라서 답은 ③이다.",
      translation: [
        "M: 하윤아, 발표 자료를 통째로 다시 만들어?",
        "W: 첫 장부터. 일요일에야 겨우 끝냈는데.",
        "M: 선생님이 내용에 대해 뭐라고 하셨어?",
        "W: 내용은 좋다고 하셨어. 그건 그대로 둬.",
        "M: 그럼 숫자에서 잘못을 찾았어?",
        "W: 숫자는 맞아. 강당 영사기가 아주 낡았어.",
        "M: 낡은 영사기는 옅은 색을 다 날려 버리지.",
        "W: 내 자료 절반이 흰 바탕에 회색 글씨야.",
        "M: 뒷줄에서는 한 글자도 못 읽겠다.",
        "W: 그래서 옅은 노랑 바탕에 진한 글씨로 다 바꿔야 해.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 교내 밴드 오디션에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["W", "Dohyun, when is the school band audition being held this year?"],
        ["M", "On the eleventh, right after the sixth period."],
        ["W", "That's a Tuesday, isn't it? Where do we go for it?"],
        ["M", "The music room, and you wait in the corridor outside."],
        ["W", "Does the whole club watch, or only the leaders?"],
        ["M", "Only three seniors, sitting at the back with a sheet each."],
        ["W", "That sounds less frightening than I expected."],
        ["M", "It is, and they clap for everybody afterwards."],
        ["W", "How long does each person get to play?"],
        ["M", "Three minutes, and you choose the piece yourself."],
        ["W", "Do I have to bring my own instrument?"],
        ["M", "Everything except the drums and the piano."],
        ["W", "Is there a limit on how many people they take?"],
        ["M", "Six this year, because four members are graduating."],
        ["W", "Then I'd better start practising tonight."],
      ],
      choices: ["오디션 날짜", "오디션 장소", "한 사람에게 주어지는 시간", "뽑는 인원", "결과를 알리는 방법"],
      answer: 5,
      clue: "On the eleventh, right after the sixth period.",
      explanation:
        "날짜, 장소, 시간, 인원은 말했지만 결과를 알리는 방법은 말하지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 도현아, 올해 학교 밴드 오디션은 언제 해?",
        "M: 11일, 6교시 바로 끝나고.",
        "W: 화요일이지? 어디로 가야 해?",
        "M: 음악실. 밖 복도에서 기다려.",
        "W: 동아리 전체가 봐, 간부만 봐?",
        "M: 3학년 셋만. 뒤에 앉아서 종이 한 장씩 들고.",
        "W: 생각보다 덜 무섭네.",
        "M: 맞아. 끝나면 다들 박수도 쳐 줘.",
        "W: 한 사람이 몇 분 연주해?",
        "M: 3분. 곡은 직접 골라.",
        "W: 악기는 내가 가져가야 해?",
        "M: 드럼이랑 피아노만 빼고 다.",
        "W: 몇 명이나 뽑는지 정해져 있어?",
        "M: 올해는 여섯 명. 네 명이 졸업하거든.",
        "W: 그럼 오늘 밤부터 연습해야겠다.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Northgate Youth Library에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "M",
          "Here is some information about the Northgate Youth Library, which opened two years ago. " +
            "The library stands on the corner opposite the bus terminal. " +
            "It is open from ten until eight on weekdays and from ten until five at weekends. " +
            "Only readers between twelve and nineteen may borrow books there. " +
            "A member may hold six books at a time, for three weeks each. " +
            "There is a quiet study floor upstairs with ninety seats. " +
            "Group rooms on the ground floor may be booked by three or more students. " +
            "The library closes on public holidays but not during the exam periods.",
        ],
      ],
      choices: [
        "버스 터미널 맞은편 모퉁이에 있다",
        "주말에는 다섯 시에 문을 닫는다",
        "열두 살에서 열아홉 살만 대출할 수 있다",
        "한 번에 세 권까지 빌릴 수 있다",
        "공휴일에는 문을 열지 않는다",
      ],
      answer: 4,
      clue: "A member may hold six books at a time, for three weeks each.",
      explanation:
        "한 번에 여섯 권까지 빌릴 수 있다고 했으므로 ④가 일치하지 않는다.",
      translation: [
        "M: 2년 전에 문을 연 노스게이트 청소년 도서관에 대해 알려 드립니다. 도서관은 버스 터미널 맞은편 모퉁이에 있습니다. 평일에는 열 시부터 여덟 시까지, 주말에는 열 시부터 다섯 시까지 엽니다. 열두 살에서 열아홉 살 사이의 이용자만 책을 빌릴 수 있습니다. 회원은 한 번에 여섯 권까지, 한 권에 세 주 동안 빌릴 수 있습니다. 위층에는 아흔 자리의 조용한 열람실이 있습니다. 1층 모둠방은 세 명 이상이면 예약할 수 있습니다. 공휴일에는 닫지만 시험 기간에는 닫지 않습니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 여자가 구입할 노트북 가방을 고르시오.",
      lines: [
        ["M", "Naeun, these five laptop bags are all in stock."],
        ["W", "I've been carrying mine in a plastic bag since September."],
        ["M", "Then let's fix that today. What's your limit?"],
        ["W", "Sixty thousand won at the very most."],
        ["M", "That takes out the most expensive one straight away."],
        ["W", "And it has to be a backpack, not a shoulder bag."],
        ["M", "One of the four left is a shoulder bag."],
        ["W", "I also want a separate pocket for a water bottle."],
        ["M", "Two of the remaining three have no side pocket."],
        ["W", "So there's only one bag left for me."],
        ["M", "I'd buy it before the autumn sale ends on Sunday."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "Sixty thousand won at the very most.",
      explanation:
        "6만 원 이하, 배낭 형태, 옆 주머니가 있는 것을 고른다. 세 조건을 모두 채우는 것은 ④이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Price: 75,000 won / Type: Backpack / Side pocket: Yes" },
          { no: 2, label: "②", value: "Price: 55,000 won / Type: Shoulder / Side pocket: Yes" },
          { no: 3, label: "③", value: "Price: 48,000 won / Type: Backpack / Side pocket: No" },
          { no: 4, label: "④", value: "Price: 58,000 won / Type: Backpack / Side pocket: Yes" },
          { no: 5, label: "⑤", value: "Price: 40,000 won / Type: Backpack / Side pocket: No" },
        ],
      },
      translation: [
        "M: 나은아, 이 다섯 개가 다 재고가 있어.",
        "W: 9월부터 비닐봉지에 넣고 다녔어.",
        "M: 그럼 오늘 해결하자. 얼마까지 쓸 수 있어?",
        "W: 아무리 많아야 6만 원.",
        "M: 그럼 제일 비싼 건 바로 빠지네.",
        "W: 그리고 어깨에 메는 것 말고 배낭이어야 해.",
        "M: 남은 넷 중 하나는 어깨에 메는 거야.",
        "W: 물병 넣을 주머니도 따로 있으면 좋겠어.",
        "M: 남은 셋 중 둘은 옆 주머니가 없어.",
        "W: 그럼 나한테 남는 건 하나뿐이네.",
        "M: 일요일에 가을 할인이 끝나니까 그전에 사는 게 좋겠어.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Seoyeon, did you finish the poster for the fair?"],
        ["W", "The drawing is done, but the title is missing."],
        ["M", "Do you want it in big letters across the top?"],
        ["W", "That would leave no room for the picture."],
        ["M", "Shall I letter it down the side instead?"],
      ],
      choices: [
        "The poster is already up.",
        "Yes, that would fit better.",
        "I don't need a title.",
        "The fair was cancelled.",
        "You should draw the picture.",
      ],
      answer: 2,
      clue: "Shall I letter it down the side instead?",
      explanation:
        "옆으로 세로로 쓰자고 제안했으므로, 그게 더 맞겠다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 서연아, 전시회 포스터 다 했어?",
        "W: 그림은 끝났는데 제목이 없어.",
        "M: 위쪽에 큰 글씨로 가로로 넣을까?",
        "W: 그러면 그림 자리가 없어져.",
        "M: 그럼 옆으로 세로로 쓸까?",
        "W: 응, 그게 더 잘 맞겠다.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Taemin, are you free during the sixth period?"],
        ["M", "That's my free period this term."],
        ["W", "Our group needs help carrying the models."],
        ["M", "Where are they going?"],
        ["W", "From the art room to the front hall."],
      ],
      choices: [
        "I have a class then.",
        "All right, I'll meet you there.",
        "The models are too heavy.",
        "You should ask someone else.",
        "The art room is closed.",
      ],
      answer: 2,
      clue: "From the art room to the front hall.",
      explanation:
        "빈 시간이라 했고 옮길 곳을 들었으므로, 거기서 만나자는 ②가 가장 자연스럽다.",
      translation: [
        "W: 태민아, 6교시에 시간 돼?",
        "M: 이번 학기에 그때가 공강이야.",
        "W: 우리 조가 모형 옮기는 걸 도와줄 사람이 필요해.",
        "M: 어디로 옮기는데?",
        "W: 미술실에서 앞 현관으로.",
        "M: 알겠어, 거기서 만나자.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Hyerin, how is the class recycling project going?"],
        ["W", "We put three bins in the corridor and everything ends up in one."],
        ["M", "Do the bins look different from each other?"],
        ["W", "They're identical, with a small label on the front."],
        ["M", "How small is the label?"],
        ["W", "About the size of a business card."],
        ["M", "And students walk past at speed, carrying things."],
        ["W", "Nobody stops to read a card at that hour."],
        ["M", "So the labels are doing none of the work."],
        ["W", "Then what would make it obvious?"],
        ["M", "Paint the lids three different colours."],
      ],
      choices: [
        "We have only one bin.",
        "That would be easy to do, I'll try it.",
        "The labels are large enough.",
        "Nobody uses the corridor.",
        "You should empty the bins.",
      ],
      answer: 2,
      clue: "Paint the lids three different colours.",
      explanation:
        "뚜껑을 서로 다른 색으로 칠하라는 제안이므로, 해 보겠다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 혜린아, 학급 분리수거 활동은 어때?",
        "W: 복도에 통 세 개를 뒀는데 다 한 통에만 들어가.",
        "M: 통들이 서로 달라 보여?",
        "W: 똑같이 생겼어. 앞에 작은 이름표만 있어.",
        "M: 이름표가 얼마나 작은데?",
        "W: 명함만 해.",
        "M: 게다가 학생들은 뭘 들고 빠르게 지나가지.",
        "W: 그 시간에 명함을 읽으려고 멈추는 사람은 없어.",
        "M: 그럼 이름표는 아무 일도 못 하고 있는 거네.",
        "W: 그럼 뭘 하면 한눈에 보일까?",
        "M: 뚜껑을 세 가지 색으로 칠해.",
        "W: 그건 하기 쉽겠다, 해 볼게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Junseo, you've been teaching a coding class at the youth centre."],
        ["M", "Every Saturday morning, to eight children."],
        ["W", "How old are they?"],
        ["M", "Between nine and eleven, so they lose interest fast."],
        ["W", "How do you keep them at the screen?"],
        ["M", "Every lesson makes something they can show someone."],
        ["W", "Even in the first week?"],
        ["M", "A name that bounces across the screen. That was week one."],
        ["W", "That's cleverer than starting with the theory."],
        ["M", "The theory arrives on its own once they want something to work."],
        ["W", "Could I sit in on one of your lessons?"],
      ],
      choices: [
        "Of course, come this Saturday.",
        "The class ended in July.",
        "I don't teach anyone.",
        "You can't write code.",
        "The centre is closed now.",
      ],
      answer: 1,
      clue: "Could I sit in on one of your lessons?",
      explanation:
        "여자가 수업을 참관해도 되는지 물었으므로, 이번 토요일에 오라는 ①이 가장 자연스럽다.",
      translation: [
        "W: 준서야, 청소년 센터에서 코딩 수업을 한다며.",
        "M: 토요일 아침마다 여덟 명한테.",
        "W: 아이들이 몇 살이야?",
        "M: 아홉 살에서 열한 살. 그래서 금방 흥미를 잃어.",
        "W: 어떻게 화면 앞에 붙잡아 둬?",
        "M: 수업마다 누구한테 보여 줄 수 있는 걸 하나씩 만들어.",
        "W: 첫 주에도?",
        "M: 화면을 튀어 다니는 자기 이름. 그게 1주 차였어.",
        "W: 이론부터 시작하는 것보다 훨씬 똑똑하네.",
        "M: 뭔가를 되게 하고 싶어지면 이론은 저절로 따라와.",
        "W: 나도 수업 한 번 참관해도 돼?",
        "M: 그럼, 이번 토요일에 와.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Woohyuk이 Suyeon에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woohyuk : ________________",
      lines: [
        [
          "M",
          "Woohyuk and Suyeon are running the school's lunchtime radio programme. " +
            "Today they are recording an interview with a retired teacher. " +
            "Suyeon has set the microphone right next to the open window. " +
            "The building work outside starts again at twelve fifteen, " +
            "and the drilling was clearly audible on last week's recording. " +
            "There is a second microphone point at the back of the room, away from the window. " +
            "Woohyuk wants to move the microphone before the guest arrives. " +
            "In this situation, what would Woohyuk most likely say to Suyeon?",
        ],
      ],
      choices: [
        "Let's record the interview tomorrow.",
        "We should close the programme early.",
        "Move the microphone away from the window.",
        "I'll ask the workers to stop drilling.",
        "The guest is arriving very late.",
      ],
      answer: 3,
      clue: "Woohyuk wants to move the microphone before the guest arrives.",
      explanation:
        "공사 소음이 녹음되므로 마이크를 창가에서 옮기자는 ③이 가장 적절하다.",
      translation: [
        "M: 우혁이와 수연이는 학교 점심 방송을 맡고 있습니다. 오늘은 퇴직하신 선생님과의 인터뷰를 녹음합니다. 수연이는 마이크를 열린 창문 바로 옆에 놓았습니다. 밖에서는 12시 15분에 공사가 다시 시작되고, 지난주 녹음에는 드릴 소리가 그대로 들어갔습니다. 방 뒤쪽, 창문에서 떨어진 곳에 마이크를 놓을 자리가 하나 더 있습니다. 우혁이는 손님이 오기 전에 마이크를 옮기고 싶습니다. 이런 상황에서 우혁이가 수연이에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 남자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Hello, everyone. Today I want to explain why a struck bell keeps ringing " +
            "long after your hand has left it. " +
            "When the hammer lands, the metal is pushed out of shape for an instant, " +
            "and the whole rim begins to move in and out like a squeezed ring. " +
            "Metal is unusually good at giving that energy back rather than absorbing it, " +
            "so the rim swings past its resting shape and returns, thousands of times a second. " +
            "Each swing pushes the air, and the pushes reach us as a steady note. " +
            "The sound fades only as the movement leaks away into the air and the mounting. " +
            "A bell held tightly in your hand stops almost at once, " +
            "because your fingers absorb the very movement that was making the sound.",
        ],
      ],
      choices: [
        "how bells are cast in a foundry",
        "why a struck bell goes on ringing",
        "how the ear separates two notes",
        "why metal expands when it is heated",
        "how sound travels through water",
      ],
      answer: 2,
      clue: "Each swing pushes the air, and the pushes reach us as a steady note.",
      explanation:
        "남자는 종의 테두리가 되풀이해 움직이며 공기를 밀어 소리가 이어진다고 설명한다. 따라서 답은 ②이다.",
      translation: [
        "M: 안녕하세요, 여러분. 오늘은 손을 뗀 뒤에도 종이 왜 한참 울리는지 설명하려 합니다. 망치가 닿는 순간 금속은 잠깐 모양이 일그러지고, 테두리 전체가 눌린 고리처럼 안팎으로 움직이기 시작합니다. 금속은 그 에너지를 흡수하기보다 되돌려 주는 데 유난히 뛰어나서, 테두리는 제 모양을 지나쳤다가 되돌아오기를 1초에 수천 번 되풀이합니다. 그 움직임 하나하나가 공기를 밀고, 그 밀림이 우리에게 고른 음으로 닿습니다. 소리는 그 움직임이 공기와 걸이대로 새어 나가면서 비로소 잦아듭니다. 손에 꽉 쥔 종은 거의 곧바로 멎습니다. 소리를 만들던 바로 그 움직임을 손가락이 흡수하기 때문입니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 내용이 아닌 것은?",
      lines: [
        ["M", "Today I want to explain why a struck bell keeps ringing."],
        ["M", "When the hammer lands, the metal is pushed out of shape for an instant."],
        ["M", "Metal is unusually good at giving that energy back."],
        ["M", "Each swing pushes the air, and the pushes reach us as a steady note."],
        ["M", "A bell held tightly in your hand stops almost at once."],
      ],
      choices: [
        "metal being pushed out of shape by the hammer",
        "metal giving energy back rather than absorbing it",
        "each swing pushing the air",
        "a bell held in the hand stopping at once",
        "the height of the tallest bell tower",
      ],
      answer: 5,
      clue: "When the hammer lands, the metal is pushed out of shape for an instant.",
      explanation:
        "망치에 눌려 일그러지는 금속, 에너지를 되돌려 주는 성질, 공기를 미는 움직임, 손에 쥐면 멎는 종은 언급되지만 가장 높은 종탑의 높이는 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
