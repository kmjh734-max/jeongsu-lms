/** 고1 듣기 20회 — 사람이 직접 쓴 회차 (2026-09-21) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고1 20회",
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
          "Good afternoon, everyone. This is Ms. Jung from the school health office. " +
            "I want to tell you about a change to the way you use the sick room. " +
            "Until now you came down whenever you felt unwell, and on some afternoons there were nine of you and four beds. " +
            "Students who needed to lie down could not, and students who only needed a plaster waited half an hour. " +
            "From next Monday there will be two lines at the door, marked with a green card and a red card. " +
            "Take a green card if you need something quick, and a red card if you need to lie down. " +
            "Green cards are seen first, because they take two minutes each. " +
            "Nobody loses their turn; the red cards simply go to the beds instead of the chairs. " +
            "The cards go up on Monday morning. Thank you for listening.",
        ],
      ],
      choices: [
        "보건실 위치가 바뀐 것을 알리려고",
        "아플 때 집으로 연락하라고 하려고",
        "보건실 이용 방식이 바뀐 것을 안내하려고",
        "감기 예방법을 알리려고",
        "보건 도우미를 모집하려고",
      ],
      answer: 3,
      clue: "From next Monday there will be two lines at the door, marked with a green card and a red card.",
      explanation:
        "다음 주부터 초록색·빨간색 카드로 줄을 나누어 보건실을 이용하게 된다는 안내이다. 따라서 말의 목적은 ③이다.",
      translation: [
        "W: 여러분, 안녕하세요. 보건실 정 선생님입니다. " +
          "보건실 이용 방식이 어떻게 달라지는지 말씀드리려 합니다. " +
          "지금까지는 몸이 안 좋으면 바로 내려왔고, 어떤 날 오후에는 아홉 명이 침대 네 개를 두고 기다렸습니다. " +
          "누워야 하는 학생이 눕지 못했고, 반창고만 필요한 학생은 30분을 기다렸습니다. " +
          "다음 주 월요일부터는 문 앞에 초록색 카드와 빨간색 카드로 줄을 둘로 나눕니다. " +
          "금방 끝나는 일이면 초록색 카드를, 누워야 하면 빨간색 카드를 집으세요. " +
          "초록색 카드를 먼저 봅니다. 한 명에 2분이면 끝나기 때문입니다. " +
          "차례를 잃는 사람은 없습니다. 빨간색 카드는 의자가 아니라 침대로 갈 뿐입니다. " +
          "카드는 월요일 아침에 놓습니다. 들어 주셔서 고맙습니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 남자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Junho, why do you always hand your homework in a day early?"],
        ["M", "Because a day early is the only way I ever finish it."],
        ["W", "That doesn't make sense. The deadline is the deadline."],
        ["M", "It does if you've ever lost a night's work at eleven o'clock."],
        ["W", "Did that happen to you?"],
        ["M", "In April. The file wouldn't open and the deadline was midnight."],
        ["W", "You could have explained that to the teacher."],
        ["M", "I did, and she believed me. That wasn't the problem."],
        ["W", "Then what was?"],
        ["M", "I'd spent six hours on it and none of those hours counted for anything."],
        ["W", "So now you finish a day early in case something breaks."],
        ["M", "Not only that. A day later I read it again and always change two things."],
        ["W", "Two things isn't much."],
        ["M", "It's the difference between what I meant and what I wrote. I can't see that on the same night."],
        ["W", "Then I'll try finishing tomorrow's essay tonight."],
      ],
      choices: [
        "숙제는 미리 계획을 세워 해야 한다",
        "마감보다 하루 일찍 끝내 두면 사고도 막고 고칠 기회도 생긴다",
        "숙제는 친구와 함께 하는 것이 좋다",
        "글은 여러 번 고쳐 써야 한다",
        "선생님께 사정을 말씀드리는 것이 좋다",
      ],
      answer: 2,
      clue: "It's the difference between what I meant and what I wrote. I can't see that on the same night.",
      explanation:
        "남자는 하루 일찍 끝내면 파일 사고도 피하고 다음 날 다시 읽으며 고칠 수 있다고 말한다. 따라서 답은 ②이다.",
      translation: [
        "W: 준호야, 왜 늘 숙제를 하루 먼저 내?",
        "M: 하루 먼저가 내가 숙제를 끝내는 유일한 방법이라서.",
        "W: 말이 안 되는데. 마감은 마감이잖아.",
        "M: 밤 11시에 하룻밤 작업을 날려 본 적 있으면 말이 돼.",
        "W: 그런 적 있어?",
        "M: 4월에. 파일이 안 열리는데 마감이 자정이었어.",
        "W: 선생님께 말씀드리면 됐잖아.",
        "M: 말씀드렸고 믿어 주셨어. 그게 문제가 아니었어.",
        "W: 그럼 뭐가 문제였는데?",
        "M: 여섯 시간을 썼는데 그 여섯 시간이 아무것도 아니게 됐다는 거.",
        "W: 그래서 이제 뭔가 잘못될까 봐 하루 먼저 끝내는구나.",
        "M: 그것만은 아니야. 하루 지나서 다시 읽으면 꼭 두 군데를 고쳐.",
        "W: 두 군데면 별거 아니잖아.",
        "M: 내가 하려던 말과 실제로 쓴 말의 차이야. 같은 날 밤에는 그게 안 보여.",
        "W: 그럼 나도 내일 낼 글을 오늘 밤에 끝내 볼래.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "When something goes wrong in a group, we look for the person who caused it. " +
            "That search almost always succeeds, and it almost always teaches us nothing. " +
            "There is a name at the end of every mistake, but the name is the last link, not the reason. " +
            "The useful question is why the mistake was easy to make and hard to notice. " +
            "A form that can be filled in wrongly will be, by somebody, eventually. " +
            "Blame closes the case; the design of the thing is what decides whether it happens again.",
        ],
      ],
      choices: [
        "실수한 사람에게 책임을 물어야 한다",
        "모둠 활동은 역할을 나누어야 한다",
        "누구 탓인지보다 왜 그 실수가 쉬웠는지를 물어야 한다",
        "기록을 자세히 남겨야 한다",
        "회의는 짧게 하는 것이 좋다",
      ],
      answer: 3,
      clue: "Blame closes the case; the design of the thing is what decides whether it happens again.",
      explanation:
        "실수한 사람을 찾는 일은 쉽지만 배울 것이 없고, 왜 그 실수가 쉬웠는지를 물어야 다시 일어나지 않는다는 내용이다. 따라서 요지는 ③이다.",
      translation: [
        "M: 모둠에서 무언가 잘못되면 우리는 그 일을 일으킨 사람을 찾습니다. " +
          "그 찾기는 거의 언제나 성공하고, 거의 언제나 아무것도 가르쳐 주지 않습니다. " +
          "모든 실수의 끝에는 이름이 있지만, 그 이름은 마지막 고리일 뿐 이유가 아닙니다. " +
          "쓸모 있는 질문은 그 실수가 왜 하기 쉬웠고 알아채기 어려웠는가입니다. " +
          "잘못 적을 수 있는 서식은 언젠가 누군가가 잘못 적습니다. " +
          "탓하기는 사건을 덮을 뿐이고, 다시 일어날지를 정하는 것은 그 물건이 만들어진 방식입니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["M", "Sujin, the new study room looks much better than the old one."],
        ["W", "We finished moving in on Friday. What do you see?"],
        ["M", "On the back wall there's a wide world map."],
        ["W", "The geography teacher gave it to us."],
        ["M", "On the left there's a tall bookcase with five shelves."],
        ["W", "Dictionaries on the bottom two, novels on the rest."],
        ["M", "In the middle there's a long table with eight chairs."],
        ["W", "Eight is enough for two groups at a time."],
        ["M", "By the window on the right, is that a water dispenser?"],
        ["W", "No, it's a small refrigerator. The dispenser is in the corridor."],
        ["M", "I see. And beside the door there's a round wall clock."],
        ["W", "It runs five minutes fast, which is exactly what we want."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "No, it's a small refrigerator. The dispenser is in the corridor.",
      explanation:
        "여자는 창가에 있는 것이 정수기가 아니라 작은 냉장고라고 바로잡는다. 그림에는 정수기가 그려져 있으므로 ④가 대화와 일치하지 않는다.",
      figure: {
        kind: "labeled",
        scene:
          "A school study room seen from the front, clean black line art on a plain white background, five things clearly separated with wide empty space between them and none overlapping, no writing or letters anywhere. " +
          "High on the back wall in the centre: a WIDE WORLD MAP with plain outlines of continents and no words. " +
          "On the far left: a TALL BOOKCASE with exactly FIVE shelves of books. " +
          "In the centre of the floor: a LONG TABLE with exactly EIGHT chairs around it. " +
          "By a window on the right: a tall WATER DISPENSER, a narrow stand with a big upside-down water bottle on top and two taps. " +
          "Beside the door on the far right, high on the wall: a ROUND CLOCK.",
      },
      translation: [
        "M: 수진아, 새 자습실이 예전보다 훨씬 낫다.",
        "W: 금요일에 다 옮겼어. 뭐가 보여?",
        "M: 뒷벽에 넓은 세계지도가 있네.",
        "W: 지리 선생님이 주셨어.",
        "M: 왼쪽에는 다섯 칸짜리 키 큰 책장이 있고.",
        "W: 아래 두 칸은 사전, 나머지는 소설이야.",
        "M: 가운데에는 긴 탁자에 의자가 여덟 개 있네.",
        "W: 여덟이면 한 번에 두 모둠도 앉아.",
        "M: 오른쪽 창가에 있는 건 정수기야?",
        "W: 아니, 작은 냉장고야. 정수기는 복도에 있어.",
        "M: 그렇구나. 그리고 문 옆에는 둥근 벽시계가 있고.",
        "W: 5분 빠른데, 그게 우리한테 딱 좋아.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 여자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Chaeyeon, there's a problem with the club recruitment notice."],
        ["W", "I put up twenty of them on Monday. What's wrong?"],
        ["M", "The email address on it is missing a letter."],
        ["W", "So nothing anyone sends actually arrives."],
        ["M", "Nothing. Four days of applications, all bounced."],
        ["W", "Can we write the correct one on by hand?"],
        ["M", "On twenty notices? It would look like a mistake, which it is."],
        ["W", "Then I'll print new ones with the right address."],
        ["M", "The office machine is free after the sixth period."],
        ["W", "I'll do it then and put them up before I go home."],
        ["M", "Thanks. I'll take the old ones down this afternoon."],
      ],
      choices: [
        "예전 안내문을 떼기",
        "주소를 손으로 고쳐 쓰기",
        "지원자들에게 연락하기",
        "안내문을 다시 인쇄해 붙이기",
        "동아리방을 예약하기",
      ],
      answer: 4,
      clue: "Then I'll print new ones with the right address.",
      explanation:
        "여자는 주소를 고쳐 안내문을 다시 인쇄해 붙이기로 한다. 예전 것을 떼는 일은 남자가 맡았다. 따라서 답은 ④이다.",
      translation: [
        "M: 채연아, 동아리 모집 안내문에 문제가 있어.",
        "W: 월요일에 스무 장 붙였는데. 뭐가 잘못됐어?",
        "M: 적힌 메일 주소에 글자가 하나 빠졌어.",
        "W: 그럼 아무리 보내도 도착을 안 하겠네.",
        "M: 하나도 안 와. 나흘 치 지원이 다 되돌아갔어.",
        "W: 맞는 주소를 손으로 써 넣으면 안 될까?",
        "M: 스무 장에? 실수처럼 보일걸. 실제로 실수고.",
        "W: 그럼 주소를 고쳐서 새로 인쇄할게.",
        "M: 6교시 끝나면 행정실 기계가 비어.",
        "W: 그때 해서 집에 가기 전에 붙일게.",
        "M: 고마워. 예전 건 내가 오늘 오후에 뗄게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 남자가 지불할 금액을 고르시오.",
      lines: [
        ["W", "Welcome to the music shop. How can I help you today?"],
        ["M", "I need a music stand and some strings for my guitar."],
        ["W", "We have two kinds of stand. The folding ones are twenty-two dollars and the heavy ones are forty."],
        ["M", "The folding one, please. I carry it to practice twice a week."],
        ["W", "A good choice for that. And what strings does your guitar take?"],
        ["M", "Nylon. The set I bought last time was eight dollars."],
        ["W", "They are still eight dollars a set. How many would you like?"],
        ["M", "Two sets, please. One to use and one to keep in the case."],
        ["W", "Twenty-two for the stand and sixteen for the strings. That comes to thirty-eight dollars."],
        ["M", "Do you have a student discount?"],
        ["W", "We do. Five dollars off the total for students, with a card."],
        ["M", "Here's my card, and here's my student card."],
        ["W", "Thank you. Would you like a strap as well? They're fourteen dollars."],
        ["M", "No, thank you. Mine is a bit old but it still holds."],
      ],
      choices: ["$30", "$33", "$38", "$43", "$47"],
      answer: 2,
      clue: "We do. Five dollars off for students.",
      explanation:
        "보면대 22달러와 줄 8달러짜리 두 세트 16달러를 더하면 38달러이다. 학생 할인 5달러를 빼면 33달러이고 어깨끈은 사지 않았으므로 답은 ②이다.",
      translation: [
        "W: 악기점입니다. 오늘은 무엇을 도와드릴까요?",
        "M: 보면대랑 기타 줄이 필요해요.",
        "W: 보면대는 두 가지가 있습니다. 접는 것은 22달러, 무거운 것은 40달러입니다.",
        "M: 접는 걸로 주세요. 일주일에 두 번 연습하러 들고 다녀서요.",
        "W: 그러면 접는 게 좋지요. 기타에는 어떤 줄을 쓰세요?",
        "M: 나일론이요. 지난번에 산 세트가 8달러였어요.",
        "W: 지금도 한 세트에 8달러입니다. 몇 세트 드릴까요?",
        "M: 두 세트요. 하나는 쓰고 하나는 가방에 넣어 두려고요.",
        "W: 보면대 22달러에 줄 16달러, 모두 38달러입니다.",
        "M: 학생 할인 있나요?",
        "W: 있습니다. 학생증이 있으면 전체 금액에서 5달러 할인됩니다.",
        "M: 카드 여기 있고요, 학생증도 여기 있습니다.",
        "W: 고맙습니다. 어깨끈도 하시겠어요? 14달러입니다.",
        "M: 아니요, 괜찮아요. 좀 낡았지만 아직 버텨요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 여자가 도서부를 그만두려는 이유를 고르시오.",
      lines: [
        ["M", "Nayeon, is it true you're leaving the library committee?"],
        ["W", "At the end of this month. I told the teacher yesterday."],
        ["M", "Is it the work? Shelving takes ages."],
        ["W", "I actually like the shelving. That's not it."],
        ["M", "Then why? You've been in it for two years."],
        ["W", "The duty hour moved to lunchtime this term."],
        ["M", "And you can't do lunchtimes?"],
        ["W", "I've been going to the extra maths class every lunchtime since September."],
        ["M", "So there's no way to do both."],
        ["W", "None. I'd rather leave properly than keep asking people to cover for me."],
      ],
      choices: [
        "일이 힘들어서",
        "책 정리가 싫어서",
        "다른 동아리에 들어가서",
        "부원들과 맞지 않아서",
        "점심시간에 수업이 생겨서",
      ],
      answer: 5,
      clue: "I've been going to the extra maths class every lunchtime since September.",
      explanation:
        "당번 시간이 점심시간으로 옮겨졌는데 여자는 점심마다 수학 보충 수업에 간다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 나연아, 도서부 그만둔다는 게 사실이야?",
        "W: 이달 말까지만. 어제 선생님께 말씀드렸어.",
        "M: 일이 힘들어서야? 책 꽂는 데 한참 걸리잖아.",
        "W: 책 꽂는 건 오히려 좋아해. 그건 아니야.",
        "M: 그럼 왜? 2년이나 했잖아.",
        "W: 이번 학기에 당번 시간이 점심시간으로 옮겨졌어.",
        "M: 점심시간에는 못 해?",
        "W: 9월부터 점심마다 수학 보충 수업에 가고 있어.",
        "M: 그럼 둘 다 할 방법이 없네.",
        "W: 없어. 계속 대신해 달라고 하느니 제대로 그만두는 게 나아.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 교내 과학 탐구 발표회에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["W", "Minsu, have you seen the notice about the science fair?"],
        ["M", "Only the poster, and I walked past it twice without stopping."],
        ["W", "It's worth stopping for. It's quite different from last year."],
        ["M", "Different how? What do we actually have to do?"],
        ["W", "Each team investigates one question of its own and shows the whole thing on a board."],
        ["M", "One question? Not a whole topic?"],
        ["W", "One question, and they say a narrow one works better than a wide one."],
        ["M", "That sounds easier to finish, at least. When is it held?"],
        ["W", "The third Friday of next month, in the gym, all afternoon."],
        ["M", "The whole afternoon in the gym. How many people in a team?"],
        ["W", "Two or three, and this year you can mix years in one team."],
        ["M", "That's new. And who looks at the boards?"],
        ["W", "Three science teachers, and they walk round twice, once before lunch and once after."],
        ["M", "Twice? Then we have to be standing there the whole time."],
        ["W", "One person from each team, anyway."],
        ["M", "Then I'll ask Dohun and Yerin today."],
        ["W", "Do it soon. Entries close on Wednesday afternoon."],
      ],
      choices: ["진행 방식", "열리는 날", "팀 구성", "심사 위원", "발표 시간"],
      answer: 5,
      clue: "Three science teachers, and they walk round twice.",
      explanation:
        "진행 방식(질문 하나를 탐구해 판에 전시), 날짜(다음 달 셋째 금요일), 팀 구성(2~3명, 학년 섞기 가능), 심사 위원(과학 교사 세 명)은 언급되지만 발표 시간은 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 민수야, 과학 발표회 공지 봤어?",
        "M: 포스터만. 그것도 두 번이나 그냥 지나쳤어.",
        "W: 멈춰 서서 볼 만해. 작년이랑 꽤 달라.",
        "M: 뭐가 다른데? 정확히 뭘 해야 해?",
        "W: 팀마다 자기 질문 하나를 탐구해서 그 과정을 판에 다 정리해 보여 주는 거야.",
        "M: 질문 하나? 주제 하나가 아니고?",
        "W: 질문 하나. 넓은 것보다 좁은 게 낫다고 하더라.",
        "M: 그러면 적어도 끝내기는 쉽겠다. 언제 하는데?",
        "W: 다음 달 셋째 금요일, 체육관에서 오후 내내.",
        "M: 오후를 통째로 체육관에서. 한 팀에 몇 명이야?",
        "W: 두세 명, 올해는 학년이 달라도 한 팀이 될 수 있어.",
        "M: 그건 새롭네. 그리고 누가 심사해?",
        "W: 과학 선생님 세 분이, 점심 전에 한 바퀴 점심 뒤에 한 바퀴 도시면서 보셔.",
        "M: 두 번이나? 그럼 내내 서 있어야 하는 거 아니야?",
        "W: 팀에서 한 명씩만 있으면 돼.",
        "M: 그럼 오늘 도훈이랑 예린이한테 물어볼게.",
        "W: 빨리 해. 접수는 수요일 오후에 닫혀.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Saetbyeol Star Park에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "M",
          "Here is what you should know about Saetbyeol Star Park, which opened on the hill above the town five years ago. " +
            "It is open only after dark, from seven in the evening until midnight, and it closes on Wednesdays. " +
            "Anyone may walk up and look through the two large telescopes without paying. " +
            "Guided talks run at eight and at ten, and those must be booked a day in advance. " +
            "The path up the hill has no lights, so you should bring a torch of your own. " +
            "On cloudy nights the park still opens, and the indoor room shows the sky on a screen instead.",
        ],
      ],
      choices: [
        "5년 전에 문을 열었다",
        "수요일에는 문을 닫는다",
        "망원경을 보는 데 돈을 내지 않는다",
        "해설은 예약 없이 들을 수 있다",
        "흐린 날에도 문을 연다",
      ],
      answer: 4,
      clue: "Guided talks run at eight and at ten, and those must be booked a day in advance.",
      explanation:
        "해설은 하루 전에 예약해야 한다고 했다. 따라서 ④가 내용과 일치하지 않는다.",
      translation: [
        "M: 5년 전 마을 위 언덕에 문을 연 Saetbyeol Star Park을 소개합니다. " +
          "해가 진 뒤에만, 저녁 7시부터 자정까지 열고, 수요일에는 쉽니다. " +
          "누구나 올라와서 큰 망원경 두 대를 돈을 내지 않고 볼 수 있습니다. " +
          "해설은 8시와 10시에 있는데, 하루 전에 예약해야 합니다. " +
          "언덕길에는 등이 없으니 손전등을 챙겨 오시기 바랍니다. " +
          "흐린 밤에도 문을 열고, 실내 방에서 화면으로 하늘을 보여 드립니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 예약할 견학을 고르시오.",
      lines: [
        ["W", "Dohun, these are the five field visits still open for December."],
        ["M", "Let's pick one. I can't go on a Saturday because of my part-time job."],
        ["W", "Right, that takes out one of them."],
        ["M", "Next, how far are they? More than an hour each way is too much."],
        ["W", "Then one more is gone. Three are left."],
        ["M", "What do they cost?"],
        ["W", "We said twenty thousand won at the most."],
        ["M", "Then one more drops out. Two left."],
        ["W", "Do either of them let us try the equipment ourselves?"],
        ["M", "Only one does, and that's the whole reason I wanted to go."],
        ["W", "Then that's the one. I'll book it for both of us tonight."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 5,
      clue: "Then that's the one. I'll book it for both of us tonight.",
      explanation:
        "토요일인 ①, 90분 거리인 ②, 25,000원인 ③을 뺀다. 남은 ④와 ⑤ 중 장비를 직접 다뤄 보는 것은 ⑤이므로 답은 ⑤이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "토요일 / 40분 / 18,000원 / 직접 해 봄" },
          { no: 2, label: "②", value: "일요일 / 90분 / 18,000원 / 직접 해 봄" },
          { no: 3, label: "③", value: "일요일 / 40분 / 25,000원 / 직접 해 봄" },
          { no: 4, label: "④", value: "일요일 / 30분 / 20,000원 / 견학만" },
          { no: 5, label: "⑤", value: "일요일 / 50분 / 20,000원 / 직접 해 봄" },
        ],
      },
      translation: [
        "W: 도훈아, 12월에 남은 견학이 이 다섯 개야.",
        "M: 하나 고르자. 아르바이트 때문에 토요일은 안 돼.",
        "W: 맞다, 그럼 하나가 빠지네.",
        "M: 다음으로 얼마나 멀어? 편도 한 시간 넘으면 너무 멀어.",
        "W: 그럼 하나 더 빠진다. 세 개 남았어.",
        "M: 얼마야?",
        "W: 2만 원까지로 정했잖아.",
        "M: 그럼 하나 더 빠지고 둘 남았다.",
        "W: 둘 중에 장비를 직접 다뤄 볼 수 있는 데가 있어?",
        "M: 한 곳만. 사실 그것 때문에 가고 싶었어.",
        "W: 그럼 거기로 하자. 오늘 밤에 둘 다 예약할게.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Have you signed up for the reading marathon?"],
        ["M", "Not yet. The sheet outside the library was full."],
        ["W", "Did you try the form on the school site?"],
        ["M", "I didn't know there was one."],
        ["W", "It's been open since Monday, and there's no limit on it."],
      ],
      choices: [
        "I read about a book a month.",
        "The library closes at six.",
        "Then I'll fill it in tonight.",
        "The sheet had thirty names on it.",
        "You should sign up as well.",
      ],
      answer: 3,
      clue: "It's been open since Monday, and there's no limit on it.",
      explanation:
        "누리집 신청서는 인원 제한이 없다는 말을 들었으므로, 오늘 밤에 작성하겠다는 ③이 가장 자연스럽다.",
      translation: [
        "W: 독서 마라톤 신청했어?",
        "M: 아직. 도서관 앞 명단이 꽉 찼더라.",
        "W: 학교 누리집 신청서는 해 봤어?",
        "M: 그런 게 있는 줄 몰랐어.",
        "W: 월요일부터 열려 있고 인원 제한도 없어.",
        "M: 그럼 오늘 밤에 작성할게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "You've been printing your notes at the shop by the station."],
        ["W", "The school printer always has a queue at lunchtime."],
        ["M", "Have you tried it before the first period?"],
        ["W", "Isn't the room locked that early?"],
        ["M", "It opens at half past seven, and nobody is there."],
      ],
      choices: [
        "The shop charges fifty won a page.",
        "Then I'll go in early tomorrow.",
        "My notes are about sixty pages.",
        "The queue is longest on Fridays.",
        "You should print yours there too.",
      ],
      answer: 2,
      clue: "It opens at half past seven, and nobody is there.",
      explanation:
        "인쇄실이 7시 30분에 열고 아무도 없다는 말을 들었으므로, 내일 일찍 가겠다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 역 옆 가게에서 필기를 인쇄하더라.",
        "W: 학교 인쇄기는 점심시간마다 줄이 서.",
        "M: 1교시 전에 해 봤어?",
        "W: 그렇게 이른 시간엔 문이 잠겨 있지 않아?",
        "M: 7시 30분에 열고 그때는 아무도 없어.",
        "W: 그럼 내일 일찍 가 볼게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오. [3점]",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Seoyul, how is the English vocabulary going?"],
        ["W", "I learn thirty a day and forget most of them by Friday."],
        ["M", "How do you learn them?"],
        ["W", "I write each word ten times with the Korean meaning beside it."],
        ["M", "And when you meet the word again, in a sentence?"],
        ["W", "I usually don't recognise it. It looks different in a sentence."],
        ["M", "That's because you learned the shape, not the use."],
        ["W", "So what should I be writing?"],
        ["M", "One sentence you might actually say, for each word."],
        ["W", "Thirty sentences a day is a lot."],
        ["M", "Then learn ten words. Ten you can use beat thirty you can't."],
      ],
      choices: [
        "I have a vocabulary test on Friday.",
        "My notebook is nearly full.",
        "Then I'll write ten sentences tonight.",
        "I've been studying English for eight years.",
        "You should learn thirty a day too.",
      ],
      answer: 3,
      clue: "Then learn ten words. Ten you can use beat thirty you can't.",
      explanation:
        "단어를 열 개로 줄이고 쓸 수 있는 문장을 하나씩 쓰라는 조언을 들었으므로, 오늘 밤에 열 문장을 쓰겠다는 ③이 가장 자연스럽다.",
      translation: [
        "M: 서율아, 영어 단어는 잘돼 가?",
        "W: 하루에 서른 개 외우는데 금요일이면 거의 잊어버려.",
        "M: 어떻게 외우는데?",
        "W: 단어마다 뜻을 옆에 적고 열 번씩 써.",
        "M: 그 단어를 문장 속에서 다시 만나면?",
        "W: 보통 못 알아봐. 문장 안에서는 달라 보여.",
        "M: 모양을 외웠지 쓰임을 안 외워서 그래.",
        "W: 그럼 뭘 써야 하는데?",
        "M: 단어마다 네가 실제로 말할 법한 문장 하나.",
        "W: 하루에 서른 문장은 많은데.",
        "M: 그럼 열 개만 외워. 쓸 수 있는 열 개가 못 쓰는 서른 개보다 나아.",
        "W: 그럼 오늘 밤에 열 문장 쓸게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오. [3점]",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Hyunbin, you've been going to bed at two every night."],
        ["M", "I study until one and then I can't fall asleep."],
        ["W", "What do you do in that last hour?"],
        ["M", "Past papers, usually. The hardest questions."],
        ["W", "So you stop with your head full of unsolved problems."],
        ["M", "It does feel like that."],
        ["W", "Your body is finished at one; your head is still in the exam."],
        ["M", "Then what should I do at midnight?"],
        ["W", "Something you already know. Review what you did in the morning."],
        ["M", "That feels like wasting the hour."],
        ["W", "The hour is already lost. This way you get the night back."],
      ],
      choices: [
        "I wake up at seven every morning.",
        "Then I'll review instead of solving tonight.",
        "The past papers take about an hour.",
        "My room is quite cold at night.",
        "You should go to bed earlier too.",
      ],
      answer: 2,
      clue: "Something you already know. Review what you did in the morning.",
      explanation:
        "자정에는 새 문제를 풀지 말고 아는 것을 복습하라는 조언을 들었으므로, 오늘 밤에는 복습하겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 현빈아, 매일 밤 2시에 자더라.",
        "M: 1시까지 공부하는데 그러고 나면 잠이 안 와.",
        "W: 그 마지막 한 시간에 뭘 하는데?",
        "M: 보통 기출문제. 제일 어려운 것들.",
        "W: 그럼 못 푼 문제로 머리가 가득한 채로 멈추는 거네.",
        "M: 그런 느낌이긴 해.",
        "W: 몸은 1시에 끝났는데 머리는 아직 시험장에 있는 거야.",
        "M: 그럼 자정에는 뭘 해야 해?",
        "W: 이미 아는 것. 아침에 한 걸 복습해.",
        "M: 그 시간을 버리는 것 같은데.",
        "W: 그 시간은 이미 잃은 거야. 이렇게 하면 밤을 되찾아.",
        "M: 그럼 오늘 밤에는 문제 대신 복습할게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Ms. Oh가 Taeho에게 할 말로 가장 적절한 것을 고르시오. [3점]",
      questionText: "▶ Ms. Oh : ________________",
      lines: [
        [
          "W",
          "Ms. Oh runs the school newspaper, and Taeho is her fastest writer. " +
            "He can finish a full report in an hour while everyone else is still taking notes. " +
            "Because of that the paper has never once missed its printing day. " +
            "The difficulty is that he sends the first version and never reads it again. " +
            "Last month three names were spelled wrongly and one date was a week out. " +
            "Ms. Oh does not want him to write more slowly; that speed is what keeps the paper alive. " +
            "The trouble is that a correction printed next month does not reach the people who read the mistake. " +
            "The next issue goes to print in four days, and she wants to tell him to read his piece once more before sending it. " +
            "In this situation, what would Ms. Oh most likely say to Taeho?",
        ],
      ],
      choices: [
        "Read it through once before you send it.",
        "Try to write two reports next time.",
        "I think you should take more notes.",
        "Let's print the paper a week later.",
        "You should let someone else write it.",
      ],
      answer: 1,
      clue: "she wants to tell him to read his piece once more before sending it",
      explanation:
        "오 선생님은 태호의 빠름을 문제 삼지 않으면서, 보내기 전에 한 번 더 읽으라고 말하려 한다. 따라서 ①이 가장 적절하다.",
      translation: [
        "W: 오 선생님은 학교 신문을 맡고 있고, 태호는 가장 빠른 기자입니다. " +
          "다른 학생들이 아직 취재 수첩을 적고 있을 때 태호는 한 시간이면 기사 하나를 끝냅니다. " +
          "그 덕분에 신문은 한 번도 인쇄 날짜를 놓친 적이 없습니다. " +
          "문제는 처음 쓴 것을 그대로 보내고 다시는 읽지 않는다는 점입니다. " +
          "지난달에는 이름 세 개가 틀렸고 날짜 하나가 일주일이나 어긋났습니다. " +
          "오 선생님은 태호가 더 천천히 쓰기를 바라지 않습니다. 그 빠름 덕분에 신문이 굴러갑니다. " +
          "문제는 다음 달에 실리는 정정 기사가 그 실수를 읽은 사람들에게는 닿지 않는다는 점입니다. " +
          "다음 호는 나흘 뒤에 인쇄에 들어가고, 선생님은 보내기 전에 한 번만 더 읽어 달라고 말하고 싶습니다. " +
          "이런 상황에서 오 선생님이 태호에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "여자가 하는 말의 주제로 가장 적절한 것은?",
      lines: [
        ["W", "Good afternoon. Today I want to talk about animals that carry their young with them."],
        ["W", "Carrying costs energy and slows a parent down, so it has to buy something in return."],
        ["W", "The kangaroo keeps its young in a pouch on the front, where it can feed and travel at the same time."],
        ["W", "The wolf spider carries dozens of spiderlings on her back until they can hunt on their own."],
        ["W", "The emperor penguin balances a single egg on its feet and covers it with a fold of skin."],
        ["W", "The sea otter floats on its back with a pup on its chest, and wraps it in weed before diving."],
        ["W", "In every case the parent gives up speed and gains something the nest could never give: the young stay where the food is."],
        ["W", "That is the trade worth remembering."],
      ],
      choices: [
        "how animals find food for their young",
        "why some animals build nests",
        "animals that carry their young with them",
        "how young animals learn to hunt",
        "why some animals live in cold places",
      ],
      answer: 3,
      clue: "In every case the parent gives up speed and gains something the nest could never give: the young stay where the food is.",
      explanation:
        "여자는 캥거루, 늑대거미, 황제펭귄, 해달이 새끼를 데리고 다니는 방식을 설명한다. 따라서 주제는 ③이다.",
      translation: [
        "W: 안녕하세요. 오늘은 새끼를 데리고 다니는 동물에 대해 이야기하려 합니다.",
        "W: 데리고 다니는 일은 힘이 들고 어미를 느리게 만들기에, 그만한 값을 해야 합니다.",
        "W: 캥거루는 앞쪽 주머니에 새끼를 넣어, 젖을 먹이면서 동시에 이동합니다.",
        "W: 늑대거미는 새끼 수십 마리를 등에 업고, 스스로 사냥할 수 있을 때까지 데리고 다닙니다.",
        "W: 황제펭귄은 알 하나를 발등에 올리고 살가죽 주름으로 덮습니다.",
        "W: 해달은 등을 대고 떠서 가슴에 새끼를 얹고, 잠수하기 전에 해초로 감아 둡니다.",
        "W: 어느 경우든 어미는 속도를 내주고, 둥지가 결코 줄 수 없는 것을 얻습니다. 새끼가 먹이가 있는 곳에 함께 있는 것입니다.",
        "W: 기억할 만한 거래는 바로 그것입니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 동물이 아닌 것은?",
      lines: [
        ["W", "Good afternoon. Today I want to talk about animals that carry their young with them."],
        ["W", "Carrying costs energy and slows a parent down, so it has to buy something in return."],
        ["W", "The kangaroo keeps its young in a pouch on the front, where it can feed and travel at the same time."],
        ["W", "The wolf spider carries dozens of spiderlings on her back until they can hunt on their own."],
        ["W", "The emperor penguin balances a single egg on its feet and covers it with a fold of skin."],
        ["W", "The sea otter floats on its back with a pup on its chest, and wraps it in weed before diving."],
        ["W", "In every case the parent gives up speed and gains something the nest could never give: the young stay where the food is."],
        ["W", "That is the trade worth remembering."],
      ],
      choices: ["kangaroo", "wolf spider", "emperor penguin", "brown bat", "sea otter"],
      answer: 4,
      clue: "The sea otter floats on its back with a pup on its chest, and wraps it in weed before diving.",
      explanation:
        "캥거루, 늑대거미, 황제펭귄, 해달은 언급되지만 박쥐는 언급되지 않았다. 따라서 답은 ④이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
