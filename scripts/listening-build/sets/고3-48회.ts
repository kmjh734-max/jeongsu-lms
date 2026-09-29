/** 고3 듣기 48회 — 사람이 직접 쓴 회차 (2026-09-29) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고3 48회",
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
          "Good morning, everyone. This is the science department. " +
            "Twelve of you asked us this month for a letter of recommendation. " +
            "We are glad to write them, and we will write them all. " +
            "But a letter written in three days says very little about anyone. " +
            "It says you worked hard and your attitude was good, " +
            "because that is all a teacher can be sure of at short notice. " +
            "So when you ask, bring something with you: " +
            "a piece of work you are proud of, or a question you could not answer. " +
            "Ask three weeks before you need it, not three days. " +
            "A letter with one real sentence in it is worth ten without.",
        ],
      ],
      choices: [
        "추천서를 미리, 자료와 함께 부탁하라고 알리려고",
        "추천서를 써 줄 수 없다고 알리려고",
        "과학 대회 참가를 권하려고",
        "실험 보고서 제출을 독촉하려고",
        "진로 상담을 안내하려고",
      ],
      answer: 1,
      clue: "Ask three weeks before you need it, not three days.",
      explanation:
        "추천서를 미리, 자기 자료와 함께 부탁하라고 알리고 있다. 따라서 답은 ①이다.",
      translation: [
        "W: 여러분, 안녕하세요. 과학부입니다. 이번 달에 열두 명이 추천서를 부탁했습니다. 기꺼이 쓸 것이고, 모두 쓰겠습니다. 다만 사흘 만에 쓴 편지는 누구에 대해서도 별말을 하지 못합니다. 열심히 했고 태도가 좋았다는 말뿐입니다. 급하게 부탁받은 교사가 확실히 말할 수 있는 것이 그것뿐이기 때문입니다. 그러니 부탁할 때는 무언가를 함께 가져오세요. 스스로 자랑스러운 결과물이든, 끝내 답하지 못한 물음이든 좋습니다. 사흘이 아니라 세 주 전에 부탁하십시오. 진짜 문장이 한 줄 들어 있는 편지가 그런 문장 없는 열 통보다 값집니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 남자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Seungjae, you keep your experiment notes in pencil?"],
        ["M", "In pencil, and I never rub anything out."],
        ["W", "Isn't that just a page full of crossings-out?"],
        ["M", "A page full of what I actually did."],
        ["W", "Wouldn't a clean copy be easier to read?"],
        ["M", "Easier, and it would be a different experiment."],
        ["W", "The numbers would be the same, though."],
        ["M", "The numbers I decided to keep would be."],
        ["W", "So the crossed-out ones matter as well."],
        ["M", "The first three readings say why the fourth was taken."],
        ["W", "A clean page hides the thinking, then."],
        ["M", "Keep the record of what happened, not what worked."],
        ["W", "I'll stop copying mine out tonight."],
      ],
      choices: [
        "실험 기록은 고치지 말고 그대로 남겨야 한다",
        "실험 기록은 깨끗하게 정리해야 한다",
        "실험은 여러 번 해 봐야 한다",
        "실험 결과는 그림으로 그려야 한다",
        "실험은 혼자 해야 한다",
      ],
      answer: 1,
      clue: "Keep the record of what happened, not what worked.",
      explanation:
        "남자는 잘된 것만이 아니라 벌어진 일을 그대로 남기라고 말한다. 따라서 답은 ①이다.",
      translation: [
        "W: 승재야, 실험 기록을 연필로 써?",
        "M: 연필로, 그리고 아무것도 지우지 않아.",
        "W: 그럼 지운 자국투성이 아니야?",
        "M: 내가 실제로 한 것이 가득한 쪽이지.",
        "W: 깨끗하게 옮겨 쓰면 읽기 좋잖아.",
        "M: 읽기는 좋지, 그리고 다른 실험이 돼.",
        "W: 그래도 숫자는 같을 텐데.",
        "M: 내가 남기기로 한 숫자만 같겠지.",
        "W: 그러니까 지운 숫자도 뜻이 있구나.",
        "M: 처음 세 번의 값이 왜 네 번째를 쟀는지를 말해 줘.",
        "W: 깨끗한 쪽은 생각을 가리는 거네.",
        "M: 잘된 것 말고 벌어진 일을 기록해.",
        "W: 오늘 밤부터 옮겨 쓰는 걸 그만둘래.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "We judge how well we did by how we feel at the end. " +
            "A difficult hour that finished smoothly is remembered as a good hour, " +
            "and a good hour that ended badly is remembered as wasted. " +
            "The last few minutes are doing most of the remembering. " +
            "This is why so many people stop studying at the hardest point: " +
            "they stop where they are stuck, and carry that away with them. " +
            "Stop instead at something you have just understood, " +
            "even if it means working five minutes past the moment you wanted to leave. " +
            "The ending is what you will believe about the whole of it.",
        ],
      ],
      choices: [
        "이해한 대목에서 끝내야 다시 앉게 된다",
        "공부는 정해진 시간에 끝내야 한다",
        "어려운 것부터 공부해야 한다",
        "쉬는 시간을 자주 가져야 한다",
        "공부한 것을 기록해야 한다",
      ],
      answer: 1,
      clue: "The ending is what you will believe about the whole of it.",
      explanation:
        "막힌 자리가 아니라 이해한 자리에서 끝내라고 말한다. 따라서 답은 ①이다.",
      translation: [
        "W: 우리는 얼마나 잘했는지를 끝날 때의 기분으로 판단합니다. 힘들었지만 매끄럽게 끝난 한 시간은 좋은 한 시간으로 기억되고, 좋았지만 나쁘게 끝난 한 시간은 버린 시간으로 기억됩니다. 마지막 몇 분이 기억의 대부분을 만듭니다. 그래서 많은 사람이 가장 어려운 대목에서 공부를 멈춥니다. 막힌 자리에서 멈추고, 그것을 안고 돌아가는 것입니다. 대신 방금 이해한 것에서 멈추십시오. 일어나고 싶던 순간에서 5분을 더 앉아 있어야 하더라도 그렇게 하십시오. 끝은 여러분이 그 전체에 대해 믿게 될 것입니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["M", "Yerin, is this a photo of the science laboratory?"],
        ["W", "They fitted it out again over the summer."],
        ["M", "There are two long benches down the middle."],
        ["W", "Six people can work at each one."],
        ["M", "And a sink stands at the far end."],
        ["W", "Two sinks, since the summer."],
        ["M", "There's a cupboard of chemicals on the left wall."],
        ["W", "That one is locked at all times."],
        ["M", "A large chart hangs above the board."],
        ["W", "It's the periodic table, and it's older than we are."],
        ["M", "And a fire blanket hangs by the door."],
        ["W", "The teacher checks it at the start of every term."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 2,
      clue: "Two sinks, since the summer.",
      explanation:
        "개수대가 하나라고 했지만 여름부터 두 개라고 했다. 따라서 답은 ②이다.",
      figure: {
        kind: "figure5",
        scene:
          "A school science laboratory, clean black line art on a plain white background, no writing or letters anywhere. " +
          "TWO LONG BENCHES run down the middle of the room. " +
          "ONE SINK stands at the far end of the room. " +
          "A CUPBOARD stands against the left wall. " +
          "A LARGE CHART hangs on the wall above the board. " +
          "A FIRE BLANKET hangs on the wall by the door.",
        spots: [
          [0.45, 0.65],
          [0.5, 0.35],
          [0.1, 0.5],
          [0.62, 0.12],
          [0.88, 0.4],
        ],
      },
      translation: [
        "M: 예린아, 이게 과학실 사진이야?",
        "W: 여름에 다시 꾸몄어.",
        "M: 가운데를 따라 긴 실험대가 두 개 있네.",
        "W: 하나에 여섯 명씩 쓸 수 있어.",
        "M: 그리고 안쪽 끝에 개수대가 있고.",
        "W: 여름부터는 두 개야.",
        "M: 왼쪽 벽에는 약품장이 있네.",
        "W: 거기는 늘 잠가 둬.",
        "M: 칠판 위에 큰 표가 걸려 있어.",
        "W: 주기율표인데 우리보다 나이가 많아.",
        "M: 그리고 문 옆에 소화 담요가 걸려 있고.",
        "W: 선생님이 학기마다 확인하셔.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 남자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Minho, the experiment class starts at two tomorrow."],
        ["W", "The benches are wiped and the sheets are copied."],
        ["M", "I labelled all the sample bottles this morning."],
        ["W", "Did anyone collect the thermometers from the store?"],
        ["M", "Yerin said she would bring them at eleven."],
        ["W", "She went to the hospital with her brother."],
        ["M", "Then the thermometers are still in the store."],
        ["W", "How many does the class need?"],
        ["M", "Twelve, one for each pair."],
        ["W", "And the store is locked at five."],
        ["M", "It's ten to five right now."],
        ["W", "Then you'd have to go immediately."],
        ["M", "There's no time to find anyone else."],
        ["W", "I'll finish copying the last few sheets."],
        ["M", "I'll go and fetch the thermometers."],
      ],
      choices: [
        "안내지를 복사하기",
        "시료병에 이름표를 붙이기",
        "온도계를 가져오기",
        "예린이에게 연락하기",
        "실험대를 닦기",
      ],
      answer: 3,
      clue: "I'll go and fetch the thermometers.",
      explanation:
        "남자는 창고에서 온도계를 가져오겠다고 했다. 따라서 답은 ③이다.",
      translation: [
        "W: 민호야, 실험 수업은 내일 두 시에 시작해.",
        "W: 실험대는 닦았고 안내지도 복사했어.",
        "M: 시료병 이름표는 오늘 아침에 다 붙였어.",
        "W: 창고에서 온도계는 누가 가져왔어?",
        "M: 예린이가 열한 시에 가져오겠다고 했어.",
        "W: 동생이랑 병원에 갔어.",
        "M: 그럼 온도계는 아직 창고에 있겠네.",
        "W: 수업에 몇 개나 필요해?",
        "M: 열두 개, 두 명에 하나씩.",
        "W: 그리고 창고는 다섯 시에 잠가.",
        "M: 지금 다섯 시 10분 전이야.",
        "W: 그럼 당장 가야겠네.",
        "M: 다른 사람 찾을 틈도 없어.",
        "W: 나는 남은 안내지 복사를 마무리할게.",
        "M: 내가 가서 온도계를 가져올게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 여자가 지불할 금액을 고르시오.",
      lines: [
        ["M", "Welcome to the laboratory supply shop. What do you need?"],
        ["W", "Six beakers and four flasks, please."],
        ["M", "The beakers are five dollars each."],
        ["W", "Were they not four dollars in the spring?"],
        ["M", "They were, but the glass price went up."],
        ["W", "Then six at five dollars it is."],
        ["M", "And the flasks are ten dollars each."],
        ["W", "Is there a plastic one that's cheaper?"],
        ["M", "There is, but it can't be heated."],
        ["W", "Then I'll take the glass ones."],
        ["M", "Are you buying for a school?"],
        ["W", "The science department. Here's the card."],
        ["M", "Schools get ten percent off the total."],
        ["W", "Good. I'll pay now."],
      ],
      choices: ["$56.00", "$60.00", "$63.00", "$66.00", "$70.00"],
      answer: 3,
      clue: "The beakers are five dollars each.",
      explanation:
        "비커 6개 30달러와 플라스크 4개 40달러로 70달러인데, 10퍼센트를 빼면 63달러이다. 따라서 답은 ③이다.",
      translation: [
        "M: 실험 기자재점에 오신 걸 환영합니다. 무엇이 필요하신가요?",
        "W: 비커 여섯 개와 플라스크 네 개 주세요.",
        "M: 비커는 하나에 5달러입니다.",
        "W: 봄에는 4달러 아니었나요?",
        "M: 맞는데 유리 값이 올랐어요.",
        "W: 그럼 5달러짜리로 여섯 개요.",
        "M: 그리고 플라스크는 하나에 10달러입니다.",
        "W: 더 싼 플라스틱은 없나요?",
        "M: 있는데 불에 올릴 수 없어요.",
        "W: 그럼 유리로 할게요.",
        "M: 학교에서 사시는 건가요?",
        "W: 과학부요. 여기 카드입니다.",
        "M: 학교는 전체에서 10퍼센트 할인됩니다.",
        "W: 좋네요. 지금 낼게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 남자가 실험을 다시 한 이유를 고르시오.",
      lines: [
        ["W", "Junyoung, you repeated the whole experiment on Saturday?"],
        ["W", "The first set of results looked fine to me."],
        ["M", "They looked fine to me too, at first."],
        ["W", "Did you break something the first time?"],
        ["M", "Nothing broke, and nothing spilled."],
        ["W", "Did the teacher ask you to do it again?"],
        ["M", "She hadn't even seen the numbers yet."],
        ["W", "Then why do it all over?"],
        ["M", "I forgot to write down the room temperature."],
        ["W", "Does that matter for this one?"],
        ["M", "Everything I measured depends on it."],
        ["W", "Then the first set was never usable."],
      ],
      choices: [
        "실내 온도를 적지 않아서",
        "기구가 깨져서",
        "선생님이 다시 하라고 해서",
        "결과가 이상해서",
        "시료가 모자라서",
      ],
      answer: 1,
      clue: "I forgot to write down the room temperature.",
      explanation:
        "잰 값이 모두 실내 온도에 달려 있는데 그것을 적지 않아 다시 했다. 따라서 답은 ①이다.",
      translation: [
        "W: 준영아, 토요일에 실험을 통째로 다시 했어?",
        "W: 첫 번째 결과도 괜찮아 보이던데.",
        "M: 나도 처음엔 괜찮아 보였어.",
        "W: 처음에 뭘 깨뜨렸어?",
        "M: 깨진 것도 쏟은 것도 없어.",
        "W: 선생님이 다시 하라고 하셨어?",
        "M: 아직 숫자를 보시지도 않았어.",
        "W: 그럼 왜 통째로 다시 해?",
        "M: 실내 온도를 적는 걸 잊었어.",
        "W: 이 실험에서 그게 중요해?",
        "M: 내가 잰 모든 게 거기 달려 있어.",
        "W: 그럼 첫 번째 것은 애초에 못 쓰는 거였네.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 교내 과학 전람회에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["M", "Dayeon, are you entering the science exhibition?"],
        ["M", "The notice went up in the laboratory on Monday."],
        ["W", "It's held in the gymnasium this year."],
        ["M", "Not in the laboratory like last time?"],
        ["W", "The gymnasium, because there are more entries."],
        ["M", "When is it being held?"],
        ["W", "The eleventh of December, all afternoon."],
        ["M", "How many can be in a team?"],
        ["W", "Up to three, and you can enter alone."],
        ["M", "What do we have to hand in?"],
        ["W", "A poster and a one-page summary."],
        ["M", "Who judges it?"],
        ["W", "Two teachers and a graduate student."],
        ["M", "Then I'll ask Hyun to work with me."],
      ],
      choices: ["열리는 곳", "열리는 날", "한 팀의 인원", "내야 하는 것", "시상 내용"],
      answer: 5,
      clue: "The eleventh of December, all afternoon.",
      explanation:
        "장소, 날짜, 인원, 제출물은 말했지만 시상 내용은 말하지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 다연아, 과학 전람회 나갈 거야?",
        "M: 월요일에 과학실에 알림이 붙었더라.",
        "W: 올해는 체육관에서 해.",
        "M: 지난번처럼 과학실이 아니고?",
        "W: 출품이 많아서 체육관에서 해.",
        "M: 언제 해?",
        "W: 12월 11일, 오후 내내.",
        "M: 한 팀에 몇 명까지야?",
        "W: 세 명까지, 혼자 나가도 돼.",
        "M: 뭘 내야 해?",
        "W: 포스터 한 장과 한 쪽짜리 요약.",
        "M: 누가 심사해?",
        "W: 선생님 두 분과 대학원생 한 명.",
        "M: 그럼 현이한테 같이 하자고 해야겠다.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "다음을 듣고, 과학실 이용 규칙에 관한 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "M",
          "Hello, students. Here are the rules for using the laboratory. " +
            "The room is open after school from four until six. " +
            "A teacher must be in the room while you are working. " +
            "You may not work alone, even for five minutes. " +
            "Long hair must be tied back and shoes must cover the whole foot. " +
            "Bags go on the shelf by the door, never on the benches. " +
            "Chemicals stay in the cupboard unless a teacher takes them out. " +
            "Wash and dry everything you used before you leave. " +
            "Anything broken must be reported the same day, and nobody is charged for it.",
        ],
      ],
      choices: [
        "방과 후 네 시부터 여섯 시까지 연다",
        "선생님이 계셔야 한다",
        "혼자서도 잠깐은 할 수 있다",
        "가방은 문 옆 선반에 둔다",
        "깨진 것은 그날 알려야 한다",
      ],
      answer: 3,
      clue: "You may not work alone, even for five minutes.",
      explanation:
        "5분이라도 혼자 하면 안 된다고 했으므로 ③이 일치하지 않는다.",
      translation: [
        "M: 학생 여러분, 안녕하세요. 과학실 이용 규칙을 알려 드립니다. 방과 후 네 시부터 여섯 시까지 엽니다. 여러분이 실험하는 동안에는 선생님이 방에 계셔야 합니다. 5분이라도 혼자 해서는 안 됩니다. 긴 머리는 묶고, 발 전체를 덮는 신발을 신어야 합니다. 가방은 실험대가 아니라 문 옆 선반에 둡니다. 약품은 선생님이 꺼내 주시기 전에는 장 안에 둡니다. 쓴 것은 모두 씻어서 말려 놓고 나가세요. 깨뜨린 것은 그날 안에 알려 주세요. 값을 물리지 않습니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 여자가 고를 실험 주제를 고르시오.",
      lines: [
        ["M", "Sohyun, which topic will your team take?"],
        ["W", "The teacher left five on the board."],
        ["M", "I copied them into my notebook."],
        ["W", "They all have to be finished by December."],
        ["M", "Do you need the laboratory for it?"],
        ["W", "We can only book the room twice a week."],
        ["M", "Two of these five need it every day."],
        ["W", "Then those are out from the start."],
        ["M", "How long can the whole thing take?"],
        ["W", "Four weeks at most, or we won't finish."],
        ["M", "One of the rest takes six weeks."],
        ["W", "And it can't need any chemicals."],
        ["M", "That takes out one more of them."],
        ["W", "Then there's only one topic left."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "We can only book the room twice a week.",
      explanation:
        "실험실이 주 2회면 되고, 4주 안에 끝나며, 약품이 필요 없는 것은 ④이다. 따라서 답은 ④이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Lab: Daily / Weeks: 3 / Chemicals: No" },
          { no: 2, label: "②", value: "Lab: Twice a week / Weeks: 6 / Chemicals: No" },
          { no: 3, label: "③", value: "Lab: Daily / Weeks: 4 / Chemicals: Yes" },
          { no: 4, label: "④", value: "Lab: Twice a week / Weeks: 4 / Chemicals: No" },
          { no: 5, label: "⑤", value: "Lab: Twice a week / Weeks: 3 / Chemicals: Yes" },
        ],
      },
      translation: [
        "M: 소현아, 너희 팀은 어느 주제로 할 거야?",
        "W: 선생님이 칠판에 다섯 개를 남기셨어.",
        "M: 공책에 옮겨 적었어.",
        "W: 다 12월까지 끝내야 해.",
        "M: 실험실이 필요해?",
        "W: 방은 한 주에 두 번만 잡을 수 있어.",
        "M: 이 다섯 중 두 개는 날마다 써야 해.",
        "W: 그럼 그건 처음부터 빠지고.",
        "M: 다 하는 데 얼마나 걸려도 돼?",
        "W: 길어야 4주, 아니면 못 끝내.",
        "M: 나머지 중 하나는 6주가 걸려.",
        "W: 그리고 약품이 필요 없어야 해.",
        "M: 그럼 하나가 더 빠지네.",
        "W: 그럼 남는 주제는 하나뿐이야.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Have you asked for your recommendation letter yet?"],
        ["M", "I was going to ask next week."],
        ["W", "They want three weeks, not three days."],
        ["M", "Then I'm cutting it rather fine."],
        ["W", "Shall we go down to the department now?"],
      ],
      choices: [
        "I don't need a letter.",
        "Yes, let's go straight away.",
        "The department is closed.",
        "I asked in September.",
        "Three days is enough.",
      ],
      answer: 2,
      clue: "Shall we go down to the department now?",
      explanation:
        "지금 내려가 보자는 제안이므로, 바로 가자는 ②가 가장 자연스럽다.",
      translation: [
        "W: 추천서 부탁드렸어?",
        "M: 다음 주에 여쭤보려고 했어.",
        "W: 사흘이 아니라 세 주 전에 부탁하래.",
        "M: 그럼 너무 빠듯하네.",
        "W: 지금 부실에 내려가 볼까?",
        "M: 응, 바로 가자.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Excuse me, can I use the laboratory this evening?"],
        ["W", "Only while a teacher is in the room."],
        ["M", "I'd be finished in twenty minutes."],
        ["W", "Not even for five, I'm afraid."],
        ["M", "Then when is a teacher here?"],
      ],
      choices: [
        "The room is always empty.",
        "From four until six after school.",
        "You can work alone.",
        "Nobody uses the laboratory.",
        "Come back next term.",
      ],
      answer: 2,
      clue: "Then when is a teacher here?",
      explanation:
        "선생님이 언제 계시는지 물었으므로, 방과 후 네 시부터 여섯 시까지라는 ②가 가장 자연스럽다.",
      translation: [
        "M: 실례합니다, 오늘 저녁에 과학실을 써도 되나요?",
        "W: 선생님이 방에 계실 때만 됩니다.",
        "M: 20분이면 끝나는데요.",
        "W: 아쉽지만 5분이라도 안 됩니다.",
        "M: 그럼 선생님은 언제 계시나요?",
        "W: 방과 후 네 시부터 여섯 시까지요.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Jiwoo, how did the team's project go in the end?"],
        ["W", "We handed it in, but three of us wrote it in one night."],
        ["M", "Weren't there six of you on the team?"],
        ["W", "Six, and everyone came to every meeting."],
        ["M", "So what were the other three doing?"],
        ["W", "Waiting to be told what to do."],
        ["M", "Did nobody share the work out?"],
        ["W", "We all agreed on the plan and nobody owned a part of it."],
        ["M", "Six people responsible for everything is nobody responsible."],
        ["W", "By November it was whoever noticed first."],
        ["M", "What would you write down at the very first meeting?"],
      ],
      choices: [
        "A longer list of ideas.",
        "One named person for each part.",
        "The date of the next meeting.",
        "A rule about being late.",
        "Nothing; we all knew the plan.",
      ],
      answer: 2,
      clue: "What would you write down at the very first meeting?",
      explanation:
        "아무도 제 몫을 맡지 않아 무너졌으므로, 부분마다 맡을 사람을 적자는 ②가 가장 자연스럽다.",
      translation: [
        "M: 지우야, 팀 과제는 결국 어떻게 됐어?",
        "W: 내기는 냈는데 셋이서 하룻밤에 썼어.",
        "M: 팀이 여섯 명 아니었어?",
        "W: 여섯 명이고 모임에도 다 나왔어.",
        "M: 그럼 나머지 셋은 뭘 하고 있었어?",
        "W: 뭘 하라는 말을 기다리고 있었지.",
        "M: 아무도 일을 나누지 않았어?",
        "W: 계획에는 다 같이 동의했는데 아무도 한 부분을 맡지는 않았어.",
        "M: 여섯이 다 책임지면 아무도 책임지지 않는 거야.",
        "W: 11월쯤엔 먼저 알아챈 사람이 하는 거였어.",
        "M: 첫 모임에 뭘 적어 둘 거야?",
        "W: 부분마다 맡을 사람 이름을 적어 둘래.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Hyunwoo, you said you keep forgetting the formulas."],
        ["M", "I know them in the evening and lose them by morning."],
        ["W", "How do you learn them at night?"],
        ["M", "I read them over until they look familiar."],
        ["W", "Do you ever close the book and write one out?"],
        ["M", "Not really. Reading feels quicker."],
        ["W", "Recognising is not the same as producing."],
        ["M", "That's why they vanish when the page is gone."],
        ["W", "Familiar is a feeling, not a memory."],
        ["M", "So reading them over is doing almost nothing."],
        ["W", "What will you do after each one tonight?"],
      ],
      choices: [
        "Read it three more times.",
        "Close the book and write it out.",
        "Copy the whole page again.",
        "Study them in the morning.",
        "Learn twice as many.",
      ],
      answer: 2,
      clue: "What will you do after each one tonight?",
      explanation:
        "읽기만 해서는 안 된다는 이야기이므로, 책을 덮고 써 보겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 현우야, 공식을 자꾸 잊는다고 했잖아.",
        "M: 저녁에는 아는데 아침이면 없어져.",
        "W: 밤에 어떻게 외워?",
        "M: 익숙해 보일 때까지 읽어.",
        "W: 책을 덮고 하나 써 본 적 있어?",
        "M: 딱히. 읽는 게 빠른 것 같아서.",
        "W: 알아보는 것과 만들어 내는 건 달라.",
        "M: 그래서 쪽이 사라지면 같이 사라지는구나.",
        "W: 익숙함은 기억이 아니라 느낌이야.",
        "M: 그러니까 읽어 넘기는 건 거의 아무것도 아니네.",
        "W: 오늘 밤에는 하나씩 보고 나서 뭘 할 거야?",
        "M: 책을 덮고 써 볼게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Seohyun이 Taemin에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Seohyun : ________________",
      lines: [
        [
          "W",
          "Seohyun and Taemin are clearing up after the experiment class. " +
            "Taemin is pouring the leftover solutions down the sink " +
            "so that the bottles can be washed and put away before five. " +
            "One of the bottles holds the acid the teacher took out for them. " +
            "Seohyun knows that acid must go into the waste container, " +
            "and that the drain in this room runs straight into the yard. " +
            "The waste container is standing under the bench beside him. " +
            "She wants him to stop before he empties that bottle. " +
            "In this situation, what would Seohyun most likely say to Taemin?",
        ],
      ],
      choices: [
        "Wash the bottles first.",
        "Don't pour the acid down the sink.",
        "The class ends at five.",
        "We need more bottles.",
        "Leave the solutions on the bench.",
      ],
      answer: 2,
      clue: "She wants him to stop before he empties that bottle.",
      explanation:
        "산은 폐액통에 버려야 하므로, 개수대에 붓지 말라는 ②가 가장 적절하다.",
      translation: [
        "W: 서현이와 태민이는 실험 수업이 끝난 뒤 정리하고 있습니다. 태민이는 다섯 시 전에 병을 씻어 치우려고 남은 용액을 개수대에 붓고 있습니다. 그중 한 병에는 선생님이 꺼내 주신 산이 들어 있습니다. 서현이는 산은 폐액통에 넣어야 한다는 것과, 이 방의 배수구가 곧장 운동장으로 이어진다는 것을 압니다. 폐액통은 그의 옆 실험대 아래에 놓여 있습니다. 그는 그 병을 비우기 전에 멈추기를 바랍니다. 이런 상황에서 서현이가 태민이에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 남자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Hello, everyone. Today I want to talk about why a discovery " +
            "is so often made by two people at the same time. " +
            "It feels as though one of them must have heard of the other, " +
            "but in most cases neither had any idea the other existed. " +
            "A discovery becomes possible when the pieces it needs are in place: " +
            "an instrument accurate enough, a measurement already published, " +
            "a question that enough people have begun to find interesting. " +
            "Once all of that is true, the next step is visible to anyone standing there, " +
            "and several people are always standing there. " +
            "The surprise is not that two people found it, but that only two did.",
        ],
      ],
      choices: [
        "why discoveries are often made twice at once",
        "how scientists share their instruments",
        "why measurements must be published",
        "how one question leads to another",
        "why famous scientists work alone",
      ],
      answer: 1,
      clue: "The surprise is not that two people found it, but that only two did.",
      explanation:
        "같은 발견이 동시에 두 사람에게서 나오는 까닭이 중심 내용이다. 따라서 답은 ①이다.",
      translation: [
        "M: 여러분, 안녕하세요. 오늘은 하나의 발견이 왜 그토록 자주 두 사람에게서 동시에 나오는지 이야기하려 합니다. 한쪽이 다른 쪽 소식을 들었을 것 같지만, 대개는 서로의 존재조차 몰랐습니다. 발견은 그것에 필요한 조각들이 제자리에 놓일 때 비로소 가능해집니다. 충분히 정확한 기구, 이미 발표된 측정값, 그리고 꽤 많은 사람이 흥미를 갖기 시작한 물음입니다. 그 모든 것이 갖추어지고 나면 다음 걸음은 그 자리에 선 누구에게나 보이고, 그 자리에는 늘 여러 사람이 서 있습니다. 놀라운 것은 두 사람이 찾아냈다는 것이 아니라 두 사람뿐이었다는 것입니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "다음을 듣고, 언급된 것이 아닌 것을 고르시오.",
      lines: [
        ["M", "A discovery is often made by two people at the same time."],
        ["M", "In most cases neither had any idea the other existed."],
        ["M", "A discovery needs an instrument accurate enough."],
        ["M", "It needs a measurement already published."],
        ["M", "The next step is visible to anyone standing there."],
      ],
      choices: ["a discovery", "two people", "an instrument", "a measurement", "a laboratory"],
      answer: 5,
      clue: "A discovery needs an instrument accurate enough.",
      explanation:
        "발견, 두 사람, 기구, 측정값은 언급되지만 실험실은 나오지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
