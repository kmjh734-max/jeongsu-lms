/** 고3 듣기 20회 — 사람이 직접 쓴 회차 (2026-09-21) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고3 20회",
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
          "Good afternoon, everyone. This is Ms. Bin from the third-year office. " +
            "I want to say something about the counselling slots in November. " +
            "Every year the slots fill in two days, and almost all of them are taken by the same fifty students. " +
            "The students who most need a second talk are the ones least likely to ask for one. " +
            "So this year each of you has one slot reserved in advance, and you will be told the time. " +
            "If the time does not suit you, swap it with somebody or give it back at the office. " +
            "Slots given back go on an open list that anyone may take. " +
            "Nobody is being made to come; you simply have to say no instead of having to say yes. " +
            "The times go up on Thursday. Thank you for listening.",
        ],
      ],
      choices: [
        "상담실 위치가 바뀐 것을 알리려고",
        "상담 시간을 늘린다고 알리려고",
        "상담 신청을 서두르라고 독촉하려고",
        "상담 시간을 미리 정해 준다고 안내하려고",
        "진학 설명회 일정을 알리려고",
      ],
      answer: 4,
      clue: "So this year each of you has one slot reserved in advance, and you will be told the time.",
      explanation:
        "올해는 학생마다 상담 시간을 미리 잡아 두고 알려 준다는 안내이다. 따라서 말의 목적은 ④이다.",
      translation: [
        "W: 여러분, 안녕하세요. 3학년부 빈 선생님입니다. " +
          "11월 상담 시간에 대해 한 가지 말씀드리려 합니다. " +
          "해마다 상담 자리는 이틀이면 차고, 그중 거의 전부를 같은 쉰 명이 가져갑니다. " +
          "두 번째 상담이 가장 필요한 학생이 가장 신청하지 않습니다. " +
          "그래서 올해는 여러분마다 한 자리를 미리 잡아 두고 시간을 알려 드립니다. " +
          "시간이 맞지 않으면 다른 사람과 바꾸거나 행정실에 돌려주세요. " +
          "돌려준 자리는 누구나 가져갈 수 있는 공개 목록에 올립니다. " +
          "억지로 오게 하는 것이 아닙니다. 하겠다고 말해야 하던 것을, 안 하겠다고 말하면 되게 바꾼 것뿐입니다. " +
          "시간은 목요일에 붙습니다. 들어 주셔서 고맙습니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 남자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Hyunbin, you've started doing the hardest subject first, at six in the morning. Why?"],
        ["M", "Because at eleven at night I can only do what I already know."],
        ["W", "But you're half asleep at six."],
        ["M", "Half asleep and nothing has happened yet. That turns out to matter more."],
        ["W", "Nothing has happened yet?"],
        ["M", "By evening I've had six lessons, two tests and a conversation I keep replaying."],
        ["W", "And that uses something up."],
        ["M", "It uses up exactly the part I need for a problem I can't see the end of."],
        ["W", "So you moved the hard thing to where that part is still full."],
        ["M", "And I moved the easy thing to the evening, where it still works fine."],
        ["W", "Don't you just lose the sleep, though?"],
        ["M", "I go to bed at eleven instead of one. The hour came from the end, not the front."],
        ["W", "How long did it take to feel normal?"],
        ["M", "Nine days. I counted, because for eight of them I was sure it was a mistake."],
        ["W", "Then I'll move my maths to the morning next week."],
      ],
      choices: [
        "잠을 충분히 자야 한다",
        "어려운 것은 힘이 남아 있는 아침으로 옮기는 것이 낫다",
        "공부는 같은 자리에서 해야 한다",
        "계획은 하루 단위로 세워야 한다",
        "쉬운 것부터 풀어야 자신감이 생긴다",
      ],
      answer: 2,
      clue: "It uses up exactly the part I need for a problem I can't see the end of.",
      explanation:
        "남자는 하루가 지나면 어려운 문제에 쓸 힘이 닳으므로, 어려운 것을 아침으로 옮겼다고 말한다. 따라서 답은 ②이다.",
      translation: [
        "W: 현빈아, 제일 어려운 과목을 아침 6시에 먼저 하기 시작했더라. 왜?",
        "M: 밤 11시에는 이미 아는 것밖에 못 하겠더라고.",
        "W: 그런데 6시면 반쯤 자고 있잖아.",
        "M: 반쯤 자고 있지만 아직 아무 일도 안 일어났지. 그게 더 중요하더라.",
        "W: 아무 일도 안 일어났다고?",
        "M: 저녁이면 수업 여섯 개, 시험 두 개, 계속 곱씹는 대화 하나가 지나간 뒤야.",
        "W: 그게 뭔가를 닳게 하고.",
        "M: 끝이 안 보이는 문제에 필요한 바로 그 부분을 닳게 해.",
        "W: 그래서 어려운 걸 그 부분이 아직 가득한 때로 옮겼구나.",
        "M: 그리고 쉬운 건 저녁으로 옮겼어. 거기선 그대로 잘돼.",
        "W: 그럼 잠만 줄어드는 거 아니야?",
        "M: 1시가 아니라 11시에 자. 그 한 시간은 앞이 아니라 뒤에서 나왔어.",
        "W: 익숙해지는 데 얼마나 걸렸어?",
        "M: 아흐레. 세어 봤어. 그중 여드레는 잘못된 선택이라고 확신했거든.",
        "W: 그럼 나도 다음 주엔 수학을 아침으로 옮겨 볼게.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "We describe a person's work by naming what they produced, and the naming quietly hides the discarding. " +
            "A writer is known for the book, not for the four versions that were thrown away to reach it. " +
            "Because the throwing away leaves no record, beginners assume it did not happen. " +
            "They then read their own first attempt against somebody else's fifth, and conclude they lack the talent. " +
            "What they lack is the four versions, and those are not a sign of failure but the method itself. " +
            "Judge your work against your own earlier drafts, because that is the only comparison that contains the same number of discarded ones.",
        ],
      ],
      choices: [
        "재능보다 노력이 중요하다",
        "다른 사람의 작품을 많이 읽어야 한다",
        "완성작과 자기 초고를 견주지 말고 자기 전 원고와 견주어야 한다",
        "글은 빨리 써야 한다",
        "실패한 작품은 버려야 한다",
      ],
      answer: 3,
      clue: "Judge your work against your own earlier drafts, because that is the only comparison that contains the same number of discarded ones.",
      explanation:
        "남이 버린 원고는 기록에 남지 않으므로, 자기 초고를 남의 완성작이 아니라 자기 이전 원고와 견주어야 한다는 내용이다. 따라서 요지는 ③이다.",
      translation: [
        "W: 우리는 어떤 사람의 일을 그가 내놓은 것의 이름으로 말하고, 그 이름은 버려진 것들을 조용히 덮습니다. " +
          "작가는 그 책으로 알려지지, 거기 이르려고 버린 네 번의 원고로 알려지지 않습니다. " +
          "버리는 일은 기록을 남기지 않기에, 초보자는 그런 일이 없었다고 여깁니다. " +
          "그러고는 자기 첫 시도를 남의 다섯 번째와 견주고, 자기에게 재능이 없다고 결론 냅니다. " +
          "없는 것은 재능이 아니라 그 네 번의 원고이고, 그것은 실패의 표시가 아니라 방법 그 자체입니다. " +
          "자기 일은 자기의 이전 원고와 견주십시오. 버린 횟수가 같은 비교는 그것뿐입니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["M", "Yerim, the third-year study room looks much better than last year."],
        ["W", "We changed it over the holiday. What do you see?"],
        ["M", "On the back wall there's a wide calendar."],
        ["W", "We mark the test days on it in red."],
        ["M", "On the left there's a tall locker with nine doors."],
        ["W", "One for every two people. There are eighteen of us in here."],
        ["M", "In the middle there's a long desk with a divider down the centre."],
        ["W", "It means you don't see the person opposite you."],
        ["M", "By the window on the right, is that a floor lamp?"],
        ["W", "No, it's a fan on a stand. The lamp broke in September."],
        ["M", "I see. And beside the door there's a round wall clock."],
        ["W", "The only clock in the school that is never wrong."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "No, it's a fan on a stand. The lamp broke in September.",
      explanation:
        "여자는 창가에 있는 것이 스탠드 조명이 아니라 선풍기라고 바로잡는다. 그림에는 스탠드 조명이 그려져 있으므로 ④가 대화와 일치하지 않는다.",
      figure: {
        kind: "labeled",
        scene:
          "A school study room seen from the front, clean black line art on a plain white background, five things clearly separated with wide empty space between them and none overlapping, no writing or letters anywhere. " +
          "High on the back wall in the centre: a WIDE CALENDAR, a big grid of empty squares in a frame. " +
          "On the far left of the floor: a TALL LOCKER with exactly NINE doors in a three-by-three grid. " +
          "In the centre of the floor: a LONG DESK with a tall upright DIVIDER running down the middle of it lengthways. " +
          "By a window on the right: a tall FLOOR LAMP with a cone shade on a thin pole and a round base. " +
          "Beside the door on the far right, high on the wall: a ROUND CLOCK.",
      },
      translation: [
        "M: 예림아, 3학년 자습실이 작년보다 훨씬 낫다.",
        "W: 방학 동안 바꿨어. 뭐가 보여?",
        "M: 뒷벽에 넓은 달력이 있네.",
        "W: 시험 날을 빨간색으로 표시해 둬.",
        "M: 왼쪽에는 문이 아홉 개인 키 큰 사물함이 있고.",
        "W: 두 명에 하나씩. 여기 열여덟 명이 써.",
        "M: 가운데에는 긴 책상에 가운데를 가르는 칸막이가 있네.",
        "W: 맞은편 사람이 안 보이라고.",
        "M: 오른쪽 창가에 있는 건 스탠드 조명이야?",
        "W: 아니, 스탠드형 선풍기야. 조명은 9월에 망가졌어.",
        "M: 그렇구나. 그리고 문 옆에는 둥근 벽시계가 있고.",
        "W: 이 학교에서 한 번도 안 틀리는 유일한 시계야.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 여자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Sujin, there's a problem with the university application list."],
        ["W", "I sent it to the office this morning. What's wrong?"],
        ["M", "Two students are down for the same slot at the same interview."],
        ["W", "The same time at the same university?"],
        ["M", "The same time. One of them would arrive and be turned away."],
        ["W", "Can we sort it out on the day?"],
        ["M", "The university confirms the times tomorrow. After that nothing moves."],
        ["W", "Then I'll call the university this afternoon and move one of them."],
        ["M", "They close their phone line at four."],
        ["W", "I'll call at two, between the fourth and fifth periods."],
        ["M", "Thanks. I'll tell both students so nobody plans the wrong day."],
      ],
      choices: [
        "대학에 전화해 시간을 옮기기",
        "학생들에게 알리기",
        "명단을 다시 만들기",
        "면접을 하루 미루기",
        "행정실에 문의하기",
      ],
      answer: 1,
      clue: "Then I'll call the university this afternoon and move one of them.",
      explanation:
        "여자는 오늘 오후에 대학에 전화해 한 명의 시간을 옮기기로 한다. 학생들에게 알리는 일은 남자가 맡았다. 따라서 답은 ①이다.",
      translation: [
        "M: 수진아, 대학 지원 명단에 문제가 있어.",
        "W: 오늘 아침에 행정실에 보냈는데. 뭐가 잘못됐어?",
        "M: 두 학생이 같은 면접 같은 시간에 배정돼 있어.",
        "W: 같은 대학 같은 시간에?",
        "M: 같은 시간에. 한 명은 가서 돌아서게 돼.",
        "W: 당일에 정리하면 안 될까?",
        "M: 대학이 내일 시간을 확정해. 그 뒤로는 안 움직여.",
        "W: 그럼 오늘 오후에 대학에 전화해서 한 명을 옮길게.",
        "M: 전화는 4시에 닫아.",
        "W: 4교시랑 5교시 사이, 2시에 걸게.",
        "M: 고마워. 나는 두 학생한테 말해서 엉뚱한 날을 잡지 않게 할게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 남자가 지불할 금액을 고르시오.",
      lines: [
        ["W", "Welcome to the print shop. What can I do for you?"],
        ["M", "I need to print my portfolio and have the pages bound."],
        ["W", "We have two paper weights. Plain paper is thirty dollars for the whole set, and thick paper is fifty."],
        ["M", "The plain one, please. It's going in a folder anyway."],
        ["W", "All right. And binding is eight dollars a copy."],
        ["M", "Two copies, please. One for me and one for the teacher."],
        ["W", "Thirty for the printing and sixteen for the binding. That comes to forty-six dollars."],
        ["M", "Do you have a student discount?"],
        ["W", "We do. Nine dollars off the total with a student card."],
        ["M", "Here it is, and here's my card."],
        ["W", "Thank you. Would you like a clear cover as well? They're four dollars each."],
        ["M", "No, thank you. The folder has one."],
      ],
      choices: ["$33", "$37", "$41", "$46", "$50"],
      answer: 2,
      clue: "We do. Nine dollars off the total with a student card.",
      explanation:
        "일반 용지 인쇄 30달러와 제본 8달러짜리 두 부 16달러를 더하면 46달러이다. 학생 할인 9달러를 빼면 37달러이고 투명 표지는 사지 않았으므로 답은 ②이다.",
      translation: [
        "W: 인쇄소입니다. 무엇을 도와드릴까요?",
        "M: 포트폴리오를 인쇄하고 제본하려고요.",
        "W: 종이는 두 가지입니다. 일반 용지는 한 세트에 30달러, 두꺼운 용지는 50달러입니다.",
        "M: 일반 용지로요. 어차피 파일에 넣을 거라서요.",
        "W: 알겠습니다. 제본은 한 부에 8달러입니다.",
        "M: 두 부 주세요. 제 것과 선생님 것.",
        "W: 인쇄 30달러에 제본 16달러, 모두 46달러입니다.",
        "M: 학생 할인 있나요?",
        "W: 있습니다. 학생증이 있으면 전체 금액에서 9달러 할인됩니다.",
        "M: 여기 있고요, 카드도 여기요.",
        "W: 고맙습니다. 투명 표지도 하시겠어요? 하나에 4달러입니다.",
        "M: 아니요, 괜찮아요. 파일에 하나 있어요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 남자가 스터디 카페를 바꾸려는 이유를 고르시오.",
      lines: [
        ["W", "Junyeong, are you really changing your study café?"],
        ["M", "From next week. I paid for the new one yesterday."],
        ["W", "Is it the price? The new one costs more."],
        ["M", "It does, and I'm going anyway. That's not it."],
        ["W", "Then what? You've gone to the same one since March."],
        ["M", "They moved the closing time from midnight to ten."],
        ["W", "Ten is early for you."],
        ["M", "I get there at seven. Three hours is one and a half problems."],
        ["W", "Can't you go earlier?"],
        ["M", "My last class finishes at six thirty, and the walk is twenty minutes."],
      ],
      choices: [
        "값이 올라서",
        "자리가 없어서",
        "너무 시끄러워서",
        "문 닫는 시각이 빨라져서",
        "집에서 멀어서",
      ],
      answer: 4,
      clue: "They moved the closing time from midnight to ten.",
      explanation:
        "문 닫는 시각이 자정에서 10시로 당겨져 남자가 쓸 수 있는 시간이 세 시간뿐이 되었다. 따라서 답은 ④이다.",
      translation: [
        "W: 준영아, 정말 스터디 카페 바꿔?",
        "M: 다음 주부터. 어제 새 데를 결제했어.",
        "W: 돈 때문이야? 새 데가 더 비싸잖아.",
        "M: 더 비싼데도 가는 거야. 그건 아니야.",
        "W: 그럼 왜? 3월부터 같은 데 다녔잖아.",
        "M: 문 닫는 시각을 자정에서 10시로 당겼어.",
        "W: 너한테는 10시가 이르지.",
        "M: 7시에 도착해. 세 시간이면 문제 한 개 반이야.",
        "W: 더 일찍 못 가?",
        "M: 마지막 수업이 6시 30분에 끝나고 걸어서 20분이야.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 교내 자기소개서 첨삭 모임에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["W", "Minhyuk, have you heard about the personal statement group?"],
        ["M", "I saw the notice, but I thought it was a lecture."],
        ["W", "It isn't. Nobody talks at the front at all."],
        ["M", "Then what happens?"],
        ["W", "You bring a draft, and two other students read it and write on it."],
        ["M", "Other students? Not the teacher?"],
        ["W", "The teacher reads it last, after you've already fixed what they found."],
        ["M", "That's actually better. Half my problems are obvious once somebody says them."],
        ["W", "That's what everyone says by the second week."],
        ["M", "How often does it meet?"],
        ["W", "Tuesdays and Fridays, after the seventh period, for three weeks."],
        ["M", "Two days a week for three weeks. Where?"],
        ["W", "The third-year seminar room behind the staff office."],
        ["M", "Then I'll put my name down tomorrow."],
        ["W", "Do it today. They take fourteen and eight are already down."],
      ],
      choices: ["진행 방식", "모이는 요일", "장소", "정원", "준비물"],
      answer: 5,
      clue: "They take fourteen and eight are already down.",
      explanation:
        "진행 방식(학생 둘이 먼저 첨삭하고 교사가 마지막에 봄), 모이는 요일(화·금), 장소(3학년 세미나실), 정원(열네 명)은 언급되지만 준비물은 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 민혁아, 자기소개서 첨삭 모임 들어 봤어?",
        "M: 공지는 봤는데 강의인 줄 알았어.",
        "W: 아니야. 앞에서 말하는 사람이 아예 없어.",
        "M: 그럼 뭘 하는데?",
        "W: 초고를 가져오면 다른 학생 두 명이 읽고 거기에 써 줘.",
        "M: 학생이? 선생님이 아니고?",
        "W: 선생님은 맨 나중에 봐. 학생들이 찾은 걸 네가 고친 다음에.",
        "M: 그게 오히려 낫네. 내 문제 절반은 누가 말해 주면 바로 보이거든.",
        "W: 둘째 주쯤 되면 다들 그렇게 말해.",
        "M: 얼마나 자주 모여?",
        "W: 화요일과 금요일, 7교시 끝나고, 3주 동안.",
        "M: 3주 동안 일주일에 이틀. 어디서?",
        "W: 교무실 뒤 3학년 세미나실.",
        "M: 그럼 내일 이름 적을게.",
        "W: 오늘 해. 열네 명 받는데 벌써 여덟 명 적혔어.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Byeolmaru Night Library에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "M",
          "Here is what you should know about Byeolmaru Night Library, which opened above the market five years ago. " +
            "It opens at six in the evening and closes at two in the morning, every day except Sunday. " +
            "Anyone over sixteen may use it, and no membership is needed. " +
            "Seats cannot be booked; you take a numbered tag at the door and return it when you leave. " +
            "There is a small room on the same floor where you may eat and talk, and the rest of the floor is silent. " +
            "The night bus stops outside until one, and after that the library calls a taxi for anyone who asks.",
        ],
      ],
      choices: [
        "5년 전에 문을 열었다",
        "일요일을 빼고 매일 연다",
        "회원 가입을 해야 쓸 수 있다",
        "자리는 예약할 수 없다",
        "새벽 1시까지 심야 버스가 선다",
      ],
      answer: 3,
      clue: "Anyone over sixteen may use it, and no membership is needed.",
      explanation:
        "열여섯 살이 넘으면 누구나 쓸 수 있고 회원 가입은 필요 없다고 했다. 따라서 ③이 내용과 일치하지 않는다.",
      translation: [
        "M: 5년 전 시장 위층에 문을 연 Byeolmaru Night Library를 소개합니다. " +
          "일요일을 빼고 날마다 저녁 6시에 열어 새벽 2시에 닫습니다. " +
          "열여섯 살이 넘으면 누구나 쓸 수 있고 회원 가입은 필요 없습니다. " +
          "자리는 예약할 수 없습니다. 문에서 번호표를 받고 나갈 때 돌려주면 됩니다. " +
          "같은 층에 먹고 이야기할 수 있는 작은 방이 있고, 나머지 층은 조용히 합니다. " +
          "심야 버스가 새벽 1시까지 건물 앞에 서고, 그 뒤로는 부탁하면 도서관에서 택시를 불러 줍니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 신청할 모의 면접을 고르시오.",
      lines: [
        ["W", "Dohyun, these are the five mock interview sessions still open."],
        ["M", "Let's pick one. I can't do a weekday because of the evening class."],
        ["W", "Right, that takes out one of them."],
        ["M", "Next, how long are they? Over two hours is too much before the exam."],
        ["W", "Then one more is gone. Three are left."],
        ["M", "What do they cost?"],
        ["W", "We said thirty thousand won at the most."],
        ["M", "Then one more drops out. Two left."],
        ["W", "Do either of them record you and let you watch it back?"],
        ["M", "Only one does, and that's the reason I want to go."],
        ["W", "Then that's the one. I'll sign us both up tonight."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 5,
      clue: "Then that's the one. I'll sign us both up tonight.",
      explanation:
        "평일인 ①, 3시간인 ②, 40,000원인 ③을 뺀다. 남은 ④와 ⑤ 중 영상으로 다시 볼 수 있는 것은 ⑤이므로 답은 ⑤이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "목요일 / 2시간 / 25,000원 / 영상 있음" },
          { no: 2, label: "②", value: "토요일 / 3시간 / 25,000원 / 영상 있음" },
          { no: 3, label: "③", value: "토요일 / 2시간 / 40,000원 / 영상 있음" },
          { no: 4, label: "④", value: "토요일 / 90분 / 20,000원 / 영상 없음" },
          { no: 5, label: "⑤", value: "일요일 / 2시간 / 30,000원 / 영상 있음" },
        ],
      },
      translation: [
        "W: 도현아, 아직 자리가 있는 모의 면접이 이 다섯 개야.",
        "M: 하나 고르자. 저녁 수업 때문에 평일은 안 돼.",
        "W: 맞다, 그럼 하나가 빠지네.",
        "M: 다음으로 몇 시간짜리야? 시험 앞두고 두 시간 넘으면 무리야.",
        "W: 그럼 하나 더 빠진다. 세 개 남았어.",
        "M: 얼마야?",
        "W: 3만 원까지로 정했잖아.",
        "M: 그럼 하나 더 빠지고 둘 남았다.",
        "W: 둘 중에 영상으로 찍어서 다시 보여 주는 데 있어?",
        "M: 한 곳만. 사실 그것 때문에 가고 싶어.",
        "W: 그럼 거기로 하자. 오늘 밤에 둘 다 신청할게.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Have you sent the recommendation form to your teacher?"],
        ["M", "Not yet. I couldn't find where to fill in the student part."],
        ["W", "Did you open the second tab in the file?"],
        ["M", "I didn't know there was one."],
        ["W", "The student part is all on that tab, and it's three lines."],
      ],
      choices: [
        "The deadline is next Wednesday.",
        "My teacher is Mr. Kang.",
        "The form is four pages long.",
        "Then I'll fill it in tonight.",
        "You should send yours as well.",
      ],
      answer: 4,
      clue: "The student part is all on that tab, and it's three lines.",
      explanation:
        "학생이 쓸 부분이 두 번째 탭에 세 줄뿐이라는 말을 들었으므로, 오늘 밤에 채우겠다는 ④가 가장 자연스럽다.",
      translation: [
        "W: 추천서 양식 선생님께 보냈어?",
        "M: 아직. 학생이 쓰는 칸을 어디에 쓰는지 못 찾았어.",
        "W: 파일 두 번째 탭은 열어 봤어?",
        "M: 그런 게 있는 줄 몰랐어.",
        "W: 학생이 쓸 부분은 다 거기 있고, 세 줄이야.",
        "M: 그럼 오늘 밤에 채울게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "You've been printing every past paper at the shop by the station."],
        ["W", "The school machine always has a queue after school."],
        ["M", "Have you tried booking a slot on the school site?"],
        ["W", "You can book the printer?"],
        ["M", "Since October. Ten-minute slots, and most of them are empty."],
      ],
      choices: [
        "The shop charges fifty won a page.",
        "I print about thirty pages a week.",
        "The queue is longest on Mondays.",
        "You should print yours there too.",
        "Then I'll book one for tomorrow.",
      ],
      answer: 5,
      clue: "Since October. Ten-minute slots, and most of them are empty.",
      explanation:
        "10월부터 인쇄기를 10분 단위로 예약할 수 있고 대부분 비어 있다는 말을 들었으므로, 내일 자리를 잡겠다는 ⑤가 가장 자연스럽다.",
      translation: [
        "M: 역 옆 가게에서 기출문제를 다 인쇄하더라.",
        "W: 학교 기계는 방과 후마다 줄이 서.",
        "M: 학교 누리집에서 시간 예약하는 건 해 봤어?",
        "W: 인쇄기를 예약할 수 있어?",
        "M: 10월부터. 10분 단위인데 대부분 비어 있어.",
        "W: 그럼 내일 자리 하나 잡을게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오. [3점]",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Seungho, how is the interview practice going?"],
        ["M", "I've written answers to forty questions."],
        ["W", "Forty. And how many have you said out loud?"],
        ["M", "None of them. I read them over before I sleep."],
        ["W", "So you've practised reading, not answering."],
        ["M", "When you put it that way, yes."],
        ["W", "What happens in the room if they ask the forty-first?"],
        ["M", "I'd have nothing. I've been assuming they won't."],
        ["W", "They always do. The forty are there to make you fluent, not to be used."],
        ["M", "Then what should I be doing with them?"],
        ["W", "Say five of them aloud to a wall, without looking."],
      ],
      choices: [
        "My interview is in three weeks.",
        "Then I'll say five aloud tonight.",
        "I wrote the answers in a notebook.",
        "The questions are all about my major.",
        "You should write some answers too.",
      ],
      answer: 2,
      clue: "Say five of them aloud to a wall, without looking.",
      explanation:
        "보지 않고 다섯 개를 소리 내어 말해 보라는 조언을 들었으므로, 오늘 밤에 다섯 개를 소리 내어 말하겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 승호야, 면접 준비는 잘돼 가?",
        "M: 질문 마흔 개에 답을 다 썼어.",
        "W: 마흔 개. 그중 소리 내어 말해 본 건 몇 개야?",
        "M: 하나도. 자기 전에 읽어 봐.",
        "W: 그럼 답하기가 아니라 읽기를 연습한 거네.",
        "M: 그렇게 말하니 맞네.",
        "W: 면접장에서 마흔한 번째를 물으면 어떻게 돼?",
        "M: 아무것도 없지. 안 물어볼 거라고 생각하고 있었어.",
        "W: 늘 물어봐. 마흔 개는 입을 트이게 하려고 있는 거지 그대로 쓰려는 게 아니야.",
        "M: 그럼 그걸로 뭘 해야 해?",
        "W: 다섯 개를 보지 말고 벽에 대고 소리 내어 말해 봐.",
        "M: 그럼 오늘 밤에 다섯 개를 소리 내어 말해 볼게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오. [3점]",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Chaewon, you've been going over your wrong answers every night."],
        ["W", "All of them, from every test since March."],
        ["M", "How many is that by now?"],
        ["W", "About four hundred. It takes the whole evening."],
        ["M", "And are they all the same kind of wrong?"],
        ["W", "No. Some I misread, some I ran out of time, some I never knew."],
        ["M", "Those three need completely different work."],
        ["W", "I've been giving them all the same ten minutes."],
        ["M", "Sort them into those three piles first, and only work the third pile tonight."],
        ["W", "And the other two?"],
        ["M", "Those are about the exam, not the subject. They need a different evening."],
      ],
      choices: [
        "I take a test every Saturday.",
        "Then I'll sort them into three tonight.",
        "My notebook has four hundred pages.",
        "The exam is in nine weeks.",
        "You should go over yours as well.",
      ],
      answer: 2,
      clue: "Sort them into those three piles first, and only work the third pile tonight.",
      explanation:
        "틀린 까닭을 세 갈래로 나누고 오늘은 그중 하나만 하라는 조언을 들었으므로, 오늘 밤에 셋으로 나누겠다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 채원아, 저녁마다 틀린 문제를 다시 보고 있네.",
        "W: 3월부터 본 시험에서 틀린 걸 전부.",
        "M: 지금까지 몇 개야?",
        "W: 400개쯤. 저녁이 통째로 들어가.",
        "M: 그게 다 같은 이유로 틀린 거야?",
        "W: 아니. 잘못 읽은 것도 있고, 시간이 모자란 것도 있고, 아예 몰랐던 것도 있어.",
        "M: 그 셋은 완전히 다른 공부가 필요해.",
        "W: 나는 셋 다 똑같이 10분씩 줬어.",
        "M: 먼저 그 셋으로 나눠 놓고, 오늘은 세 번째 묶음만 해.",
        "W: 나머지 둘은?",
        "M: 그건 과목이 아니라 시험에 관한 거야. 다른 저녁이 필요해.",
        "W: 그럼 오늘 밤엔 셋으로 나눠 볼게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Mr. Jin이 Nari에게 할 말로 가장 적절한 것을 고르시오. [3점]",
      questionText: "▶ Mr. Jin : ________________",
      lines: [
        [
          "M",
          "Mr. Jin teaches the third-year English class, and Nari is one of his strongest readers. " +
            "She underlines every sentence she thinks might matter as she goes through a passage. " +
            "Because of that she almost never misses the sentence that holds the answer. " +
            "The difficulty appears in the test, where a passage comes back with nine lines underlined out of twelve. " +
            "When she looks up to answer, the underlining tells her nothing, because everything is marked. " +
            "Mr. Jin does not want her to stop marking; that attention is why she understands the passage. " +
            "The trouble is that a mark that covers everything points at nothing. " +
            "The exam is in six weeks, and he wants to tell her to underline only one sentence in each paragraph. " +
            "In this situation, what would Mr. Jin most likely say to Nari?",
        ],
      ],
      choices: [
        "Underline only one sentence in each paragraph.",
        "Try to read the passage twice instead.",
        "I think you should stop underlining altogether.",
        "Let's work on shorter passages for now.",
        "You should use a different colour pen.",
      ],
      answer: 1,
      clue: "he wants to tell her to underline only one sentence in each paragraph",
      explanation:
        "진 선생님은 나리의 표시하는 습관을 문제 삼지 않으면서, 문단마다 한 문장만 밑줄 그으라고 말하려 한다. 따라서 ①이 가장 적절하다.",
      translation: [
        "M: 진 선생님은 3학년 영어를 맡고 있고, 나리는 가장 잘 읽는 학생 중 하나입니다. " +
          "나리는 지문을 읽어 가며 중요할 것 같은 문장마다 밑줄을 긋습니다. " +
          "그 덕분에 답이 들어 있는 문장을 놓치는 일이 거의 없습니다. " +
          "문제는 시험에서 드러납니다. 열두 줄 중 아홉 줄에 밑줄이 그어진 채로 지문이 돌아옵니다. " +
          "답을 고르려고 다시 올려다보면, 전부 표시되어 있어서 밑줄이 아무것도 알려 주지 않습니다. " +
          "진 선생님은 나리가 표시를 그만두기를 바라지 않습니다. 그 집중 덕분에 지문을 이해합니다. " +
          "문제는 전부를 덮는 표시는 아무것도 가리키지 못한다는 점입니다. " +
          "시험은 6주 뒤이고, 선생님은 문단마다 한 문장만 밑줄 그으라고 말하고 싶습니다. " +
          "이런 상황에서 진 선생님이 나리에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "남자가 하는 말의 주제로 가장 적절한 것은?",
      lines: [
        ["M", "Good afternoon. Today I want to talk about animals that send a message they cannot take back."],
        ["M", "A signal is cheap to fake unless making it costs the sender something real."],
        ["M", "The peacock's tail is heavy and slows it down, which is exactly why a large one cannot be bluffed."],
        ["M", "The stotting gazelle jumps straight up in front of a lion, spending energy to say it has energy to spare."],
        ["M", "The male frog that calls loudest tells every rival where he is, and every snake as well."],
        ["M", "The sparrow with the largest black bib is challenged by every other sparrow until it proves the bib was honest."],
        ["M", "In each case the cost is not a flaw in the signal; it is what makes the signal worth believing."],
        ["M", "That is the idea worth carrying away: honesty is expensive on purpose."],
      ],
      choices: [
        "how animals choose a mate",
        "why some animals are brightly coloured",
        "animals whose signals are costly to make",
        "how predators find their prey",
        "why birds sing in the morning",
      ],
      answer: 3,
      clue: "In each case the cost is not a flaw in the signal; it is what makes the signal worth believing.",
      explanation:
        "남자는 공작, 가젤, 개구리, 참새의 신호가 값을 치르기 때문에 믿을 만해진다고 설명한다. 따라서 주제는 ③이다.",
      translation: [
        "M: 안녕하세요. 오늘은 되돌릴 수 없는 신호를 보내는 동물에 대해 이야기하려 합니다.",
        "M: 신호는 보내는 쪽이 실제로 값을 치르지 않는 한 흉내 내기가 쉽습니다.",
        "M: 공작의 꼬리는 무겁고 몸을 느리게 만드는데, 바로 그래서 큰 꼬리는 속일 수 없습니다.",
        "M: 가젤은 사자 앞에서 제자리 높이뛰기를 합니다. 남는 힘이 있다고 말하려고 힘을 씁니다.",
        "M: 가장 크게 우는 수컷 개구리는 모든 경쟁자에게, 그리고 모든 뱀에게도 자기 위치를 알립니다.",
        "M: 가슴의 검은 무늬가 가장 큰 참새는 그 무늬가 정직했음을 증명할 때까지 다른 참새들의 도전을 받습니다.",
        "M: 어느 경우든 그 값은 신호의 결함이 아니라, 그 신호를 믿을 만하게 만드는 바로 그것입니다.",
        "M: 가져갈 만한 생각은 이것입니다. 정직함은 일부러 비쌉니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 동물이 아닌 것은?",
      lines: [
        ["M", "Good afternoon. Today I want to talk about animals that send a message they cannot take back."],
        ["M", "A signal is cheap to fake unless making it costs the sender something real."],
        ["M", "The peacock's tail is heavy and slows it down, which is exactly why a large one cannot be bluffed."],
        ["M", "The stotting gazelle jumps straight up in front of a lion, spending energy to say it has energy to spare."],
        ["M", "The male frog that calls loudest tells every rival where he is, and every snake as well."],
        ["M", "The sparrow with the largest black bib is challenged by every other sparrow until it proves the bib was honest."],
        ["M", "In each case the cost is not a flaw in the signal; it is what makes the signal worth believing."],
        ["M", "That is the idea worth carrying away: honesty is expensive on purpose."],
      ],
      choices: ["peacock", "gazelle", "frog", "sparrow", "dolphin"],
      answer: 5,
      clue: "The sparrow with the largest black bib is challenged by every other sparrow until it proves the bib was honest.",
      explanation:
        "공작, 가젤, 개구리, 참새는 언급되지만 돌고래는 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
