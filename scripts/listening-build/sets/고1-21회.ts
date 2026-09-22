/** 고1 듣기 21회 — 사람이 직접 쓴 회차 (2026-09-21) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고1 21회",
  gradeLevel: "high1",
  speechSpeed: 0.8,
  folder: "고1 듣기",
  questions: [
    {
      order: 1,
      type: "목적 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 목적으로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Good morning, everyone. This is Mr. Sim from the first-year office. " +
            "I want to tell you about the class notice board outside each room. " +
            "Right now anyone may pin anything up, and most boards have papers from three months ago still on them. " +
            "Last week two students missed a trip because the new notice was hidden behind an old one. " +
            "From Monday each board will have two halves, marked 'this week' and 'later'. " +
            "Anything on the 'this week' half is taken down on Friday afternoon by the class leader. " +
            "Put long-term notices on the 'later' half, and they can stay as long as they are needed. " +
            "This is not extra work; it is the same board with a line down the middle. " +
            "The lines go up on Monday morning. Thank you for listening.",
        ],
      ],
      choices: [
        "게시판을 새로 만든다고 알리려고",
        "학급 회장을 새로 뽑는다고 알리려고",
        "게시판 사용 방식이 바뀐 것을 안내하려고",
        "현장 학습 신청을 독촉하려고",
        "교실 청소 당번을 정하려고",
      ],
      answer: 3,
      clue: "From Monday each board will have two halves, marked 'this week' and 'later'.",
      explanation:
        "월요일부터 학급 게시판을 '이번 주'와 '나중' 두 칸으로 나눠 쓴다는 안내이다. 따라서 말의 목적은 ③이다.",
      translation: [
        "M: 여러분, 안녕하세요. 1학년부 심 선생님입니다. " +
          "교실 앞 학급 게시판에 대해 말씀드리려 합니다. " +
          "지금은 누구나 무엇이든 붙일 수 있고, 대부분 게시판에는 석 달 전 종이가 아직 붙어 있습니다. " +
          "지난주에는 새 공지가 옛 공지 뒤에 가려져 학생 두 명이 현장 학습을 놓쳤습니다. " +
          "월요일부터 게시판을 '이번 주'와 '나중' 두 칸으로 나눕니다. " +
          "'이번 주' 칸에 붙은 것은 금요일 오후에 학급 회장이 뗍니다. " +
          "오래 붙여 둘 것은 '나중' 칸에 붙이면 필요할 때까지 그대로 둡니다. " +
          "일이 느는 것이 아닙니다. 같은 게시판에 가운데 줄 하나를 긋는 것뿐입니다. " +
          "줄은 월요일 아침에 긋습니다. 들어 주셔서 고맙습니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 여자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Hayoon, why do you always sit in the front row? Nobody else wants it."],
        ["W", "That's exactly why it's free every single day."],
        ["M", "But everyone can see you. Isn't that uncomfortable?"],
        ["W", "It was, for about a week in March."],
        ["M", "And then?"],
        ["W", "Then I noticed I hadn't looked at my phone in a whole lesson."],
        ["M", "Because the teacher can see you."],
        ["W", "Partly. Mostly because there's nothing between me and the board."],
        ["M", "Nothing between you and the board?"],
        ["W", "From the back you look at thirty heads first. The board is the last thing you see."],
        ["M", "I'd never thought about what I'm actually looking at."],
        ["W", "I hadn't either. I moved for the desk space and kept the seat for that."],
        ["M", "Do you understand more, though?"],
        ["W", "I ask more, which is different and better. Asking from the back is a performance."],
        ["M", "Then I'll take the other front seat tomorrow."],
      ],
      choices: [
        "수업은 조용히 들어야 한다",
        "앞자리에 앉으면 방해가 적고 질문하기도 쉽다",
        "자리는 자주 바꾸는 것이 좋다",
        "질문은 수업이 끝난 뒤에 해야 한다",
        "교실은 넓을수록 좋다",
      ],
      answer: 2,
      clue: "I ask more, which is different and better. Asking from the back is a performance.",
      explanation:
        "여자는 앞자리에서는 칠판까지 사이에 아무것도 없어 방해가 적고 질문도 편하다고 말한다. 따라서 답은 ②이다.",
      translation: [
        "M: 하윤아, 왜 늘 맨 앞줄에 앉아? 아무도 안 앉으려고 하잖아.",
        "W: 그래서 날마다 비어 있는 거지.",
        "M: 그래도 다들 너를 보잖아. 불편하지 않아?",
        "W: 3월에 일주일쯤은 불편했어.",
        "M: 그러고는?",
        "W: 한 시간 내내 휴대전화를 한 번도 안 봤다는 걸 알게 됐어.",
        "M: 선생님이 보시니까.",
        "W: 그것도 있지. 더 큰 건 나랑 칠판 사이에 아무것도 없다는 거야.",
        "M: 칠판 사이에 아무것도 없다고?",
        "W: 뒤에서는 머리 서른 개를 먼저 봐. 칠판은 마지막에 보이지.",
        "M: 내가 실제로 뭘 보고 있는지는 생각해 본 적이 없네.",
        "W: 나도 없었어. 책상이 넓어서 옮겼다가 그것 때문에 계속 앉아.",
        "M: 그래서 더 잘 이해돼?",
        "W: 더 많이 물어봐. 그건 다르고 더 나아. 뒤에서 질문하는 건 무대에 서는 거야.",
        "M: 그럼 나도 내일 옆 앞자리에 앉을게.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "When we give advice, we describe the finished state and call it a plan. " +
            "Read more. Sleep earlier. Start revising sooner. Each one names a destination and leaves out the first step. " +
            "A destination cannot be acted on, so the listener agrees, feels briefly better, and changes nothing. " +
            "The only advice that moves anybody is advice small enough to do before the conversation ends. " +
            "Not 'read more' but 'put one book by the front door tonight'. " +
            "If your advice cannot be done in five minutes, you have described a wish, not given a plan.",
        ],
      ],
      choices: [
        "조언은 짧게 해야 한다",
        "조언은 믿을 만한 사람에게 구해야 한다",
        "목표는 크게 잡아야 한다",
        "조언은 대화가 끝나기 전에 할 수 있을 만큼 작아야 한다",
        "계획은 글로 적어 두어야 한다",
      ],
      answer: 4,
      clue: "If your advice cannot be done in five minutes, you have described a wish, not given a plan.",
      explanation:
        "도착지를 말하는 조언은 아무것도 바꾸지 못하고, 대화가 끝나기 전에 할 수 있을 만큼 작아야 사람을 움직인다는 내용이다. 따라서 요지는 ④이다.",
      translation: [
        "W: 우리는 조언을 할 때 다 이루어진 상태를 말해 놓고 그것을 계획이라고 부릅니다. " +
          "책을 더 읽어라. 일찍 자라. 복습을 미리 시작해라. 저마다 도착지를 말할 뿐 첫걸음은 빠져 있습니다. " +
          "도착지는 실행할 수 없기에, 듣는 사람은 고개를 끄덕이고 잠깐 기분이 나아지고 아무것도 바꾸지 않습니다. " +
          "사람을 움직이는 조언은 대화가 끝나기 전에 할 수 있을 만큼 작은 조언뿐입니다. " +
          "'책을 더 읽어라'가 아니라 '오늘 밤 현관 앞에 책 한 권을 놓아 두어라'입니다. " +
          "조언을 5분 안에 할 수 없다면, 계획을 준 것이 아니라 바람을 말한 것입니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["W", "Minjae, the art room looks completely different after the clear-out."],
        ["M", "We spent two afternoons on it. What do you see?"],
        ["W", "On the back wall there's a wide pinboard."],
        ["M", "We put the term's drawings up there every month."],
        ["W", "On the left there's a tall cupboard with three doors."],
        ["M", "Paper on the left, paint in the middle, clay on the right."],
        ["W", "In the middle there's a big square table with stools all around it."],
        ["M", "Everyone can work there without touching elbows."],
        ["W", "By the window on the right, is that a sink?"],
        ["M", "No, it's a drying rack. The sink is in the corner behind the door."],
        ["W", "I see. And beside the door there's a round wall clock."],
        ["M", "We need it; nobody notices when a class ends in here."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "No, it's a drying rack. The sink is in the corner behind the door.",
      explanation:
        "남자는 창가에 있는 것이 개수대가 아니라 건조대라고 바로잡는다. 그림에는 개수대가 그려져 있으므로 ④가 대화와 일치하지 않는다.",
      figure: {
        kind: "labeled",
        scene:
          "A school art room seen from the front, clean black line art on a plain white background, five things clearly separated with wide empty space between them and none overlapping, no writing or letters anywhere. " +
          "High on the back wall in the centre: a WIDE PINBOARD with a plain empty face. " +
          "On the far left of the floor: a TALL CUPBOARD with exactly THREE doors side by side. " +
          "In the centre of the floor: a big SQUARE TABLE with round stools all around it. " +
          "By a window on the right: a SINK, a deep basin set in a small unit with a tap above it. " +
          "Beside the door on the far right, high on the wall: a ROUND CLOCK.",
      },
      translation: [
        "W: 민재야, 정리하고 나니 미술실이 완전히 달라 보인다.",
        "M: 오후를 이틀이나 썼어. 뭐가 보여?",
        "W: 뒷벽에 넓은 게시판이 있네.",
        "M: 달마다 그 학기 그림을 거기 붙여.",
        "W: 왼쪽에는 문이 세 개인 키 큰 수납장이 있고.",
        "M: 왼쪽은 종이, 가운데는 물감, 오른쪽은 찰흙.",
        "W: 가운데에는 큰 네모 탁자가 있고 둘레에 의자가 있네.",
        "M: 팔꿈치 안 부딪히고 다들 작업할 수 있어.",
        "W: 오른쪽 창가에 있는 건 개수대야?",
        "M: 아니, 건조대야. 개수대는 문 뒤 구석에 있어.",
        "W: 그렇구나. 그리고 문 옆에는 둥근 벽시계가 있고.",
        "M: 그거 꼭 필요해. 여기선 수업이 끝난 줄 아무도 몰라.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 여자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Seoyeon, there's a problem with the club membership list."],
        ["W", "I handed it in to the office on Monday. What's wrong?"],
        ["M", "Two names are on it twice, so it says we have twenty-two members."],
        ["W", "And we have twenty."],
        ["M", "Twenty. The budget is worked out per member."],
        ["W", "So we'd be given money for two people who don't exist."],
        ["M", "Which we'd have to give back in December, with an explanation."],
        ["W", "Then I'll take a corrected list to the office this afternoon."],
        ["M", "Ask them to throw the old one away while you're there."],
        ["W", "I'll do that, and I'll get them to sign the new one."],
        ["M", "Thanks. I'll tell the club at practice."],
      ],
      choices: [
        "부원들에게 알리기",
        "예산을 다시 계산하기",
        "고친 명단을 행정실에 내기",
        "부원을 두 명 더 모으기",
        "연습에 참석하기",
      ],
      answer: 3,
      clue: "Then I'll take a corrected list to the office this afternoon.",
      explanation:
        "여자는 오늘 오후에 고친 명단을 행정실에 가져가기로 한다. 부원들에게 알리는 일은 남자가 맡았다. 따라서 답은 ③이다.",
      translation: [
        "M: 서연아, 동아리 명단에 문제가 있어.",
        "W: 월요일에 행정실에 냈는데. 뭐가 잘못됐어?",
        "M: 이름 두 개가 두 번씩 들어가서 부원이 스물두 명으로 되어 있어.",
        "W: 우리는 스무 명인데.",
        "M: 스무 명이지. 예산은 부원 수로 계산돼.",
        "W: 그럼 없는 두 사람 몫까지 받게 되는 거네.",
        "M: 12월에 사유를 적어서 돌려줘야 하고.",
        "W: 그럼 오늘 오후에 고친 명단을 행정실에 가져갈게.",
        "M: 간 김에 예전 것은 버려 달라고 해.",
        "W: 그럴게. 그리고 새 명단에 확인 서명도 받아 올게.",
        "M: 고마워. 나는 연습 때 동아리에 말할게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 남자가 지불할 금액을 고르시오.",
      lines: [
        ["W", "Welcome to the art shop. What can I help you with?"],
        ["M", "I need canvas boards and a set of brushes for art class."],
        ["W", "We have two sizes of canvas board. The small ones are seven dollars and the large ones are fourteen."],
        ["M", "The small ones, please. Three of them."],
        ["W", "Three small boards, then. And the brush sets are sixteen dollars."],
        ["M", "One set is enough."],
        ["W", "Twenty-one for the boards and sixteen for the brushes. That comes to thirty-seven dollars."],
        ["M", "Is there a student discount?"],
        ["W", "There is. Six dollars off the total with a student card."],
        ["M", "Here it is, and here's my card."],
        ["W", "Thank you. Would you like a palette as well? They're nine dollars."],
        ["M", "No, thank you. The school lends those out."],
      ],
      choices: ["$28", "$31", "$34", "$37", "$40"],
      answer: 2,
      clue: "There is. Six dollars off the total with a student card.",
      explanation:
        "작은 캔버스 7달러짜리 세 장 21달러와 붓 세트 16달러를 더하면 37달러이다. 학생 할인 6달러를 빼면 31달러이고 팔레트는 사지 않았으므로 답은 ②이다.",
      translation: [
        "W: 화방입니다. 무엇을 도와드릴까요?",
        "M: 미술 시간에 쓸 캔버스 보드랑 붓 세트가 필요해요.",
        "W: 캔버스 보드는 두 가지입니다. 작은 것은 7달러, 큰 것은 14달러입니다.",
        "M: 작은 걸로 세 장 주세요.",
        "W: 작은 보드 세 장이요. 그리고 붓 세트는 16달러입니다.",
        "M: 한 세트면 충분해요.",
        "W: 보드 21달러에 붓 16달러, 모두 37달러입니다.",
        "M: 학생 할인 있나요?",
        "W: 있습니다. 학생증이 있으면 전체 금액에서 6달러 할인됩니다.",
        "M: 여기 있고요, 카드도 여기요.",
        "W: 고맙습니다. 팔레트도 하시겠어요? 9달러입니다.",
        "M: 아니요, 괜찮아요. 학교에서 빌려줘요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 남자가 합창단을 그만두려는 이유를 고르시오.",
      lines: [
        ["W", "Dohyun, is it true you're leaving the choir?"],
        ["M", "After the winter concert. I told the teacher yesterday."],
        ["W", "Is it your voice? It changed a lot this year."],
        ["M", "It did, and they moved me to a part that suits it. That's not it."],
        ["W", "Then why? You've sung since first year."],
        ["M", "Rehearsal moved from Wednesday to Friday afternoon."],
        ["W", "And Friday is a problem?"],
        ["M", "I started going to my grandfather's hospital every Friday in October."],
        ["W", "So there's no way to do both."],
        ["M", "None, and I'd rather leave properly than keep missing."],
      ],
      choices: [
        "목소리가 변해서",
        "다른 동아리에 들어가서",
        "연습 요일이 바뀌어 다른 일과 겹쳐서",
        "노래에 흥미를 잃어서",
        "성적이 떨어져서",
      ],
      answer: 3,
      clue: "I started going to my grandfather's hospital every Friday in October.",
      explanation:
        "연습이 금요일로 옮겨졌는데 남자는 10월부터 금요일마다 할아버지 병원에 간다. 따라서 답은 ③이다.",
      translation: [
        "W: 도현아, 합창단 그만둔다는 게 사실이야?",
        "M: 겨울 연주회까지만. 어제 선생님께 말씀드렸어.",
        "W: 목소리 때문이야? 올해 많이 변했잖아.",
        "M: 변했지. 그래서 맞는 파트로 옮겨 주셨어. 그건 아니야.",
        "W: 그럼 왜? 1학년 때부터 했잖아.",
        "M: 연습이 수요일에서 금요일 오후로 옮겨졌어.",
        "W: 금요일이 안 돼?",
        "M: 10월부터 금요일마다 할아버지 병원에 가.",
        "W: 그럼 둘 다 할 방법이 없네.",
        "M: 없어. 계속 빠지느니 제대로 그만두는 게 나아.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 교내 토론 대회에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["W", "Junwoo, have you read the notice about the debate contest?"],
        ["M", "I read the title and walked on. Is it worth doing?"],
        ["W", "I think so. It's not the usual kind."],
        ["M", "What's different about it?"],
        ["W", "You don't know which side you're arguing until ten minutes before."],
        ["M", "Ten minutes? So you have to prepare both."],
        ["W", "Both, and that's the whole point of it."],
        ["M", "That sounds harder but more useful. When is it held?"],
        ["W", "The second Thursday of next month, after the sixth period."],
        ["M", "After the sixth period. How long does the whole thing run?"],
        ["W", "About two hours, with four rounds."],
        ["M", "And who judges it?"],
        ["W", "Two teachers and a student from last year's winning team."],
        ["M", "That's the part I'd want to hear about. I'll sign up today."],
        ["W", "Do it before lunch. Only twelve teams can enter."],
      ],
      choices: ["진행 방식", "열리는 날", "걸리는 시간", "심사 위원", "준비물"],
      answer: 5,
      clue: "Two teachers and a student from last year's winning team.",
      explanation:
        "진행 방식(10분 전에 편을 정함), 날짜(다음 달 둘째 목요일), 걸리는 시간(두 시간, 네 판), 심사 위원(교사 둘과 작년 우승팀 학생)은 언급되지만 준비물은 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 준우야, 토론 대회 공지 읽었어?",
        "M: 제목만 보고 지나쳤어. 할 만해?",
        "W: 그런 것 같아. 흔한 방식이 아니야.",
        "M: 뭐가 다른데?",
        "W: 어느 편을 맡을지 10분 전에야 알려 줘.",
        "M: 10분? 그럼 양쪽 다 준비해야 하네.",
        "W: 양쪽 다. 그게 핵심이야.",
        "M: 더 어렵지만 더 쓸모 있겠다. 언제 하는데?",
        "W: 다음 달 둘째 목요일, 6교시 끝나고.",
        "M: 6교시 끝나고. 전체로 얼마나 걸려?",
        "W: 두 시간쯤, 네 판 해.",
        "M: 심사는 누가 해?",
        "W: 선생님 두 분이랑 작년 우승팀 학생 한 명.",
        "M: 그 얘기는 들어 보고 싶은데. 오늘 신청할게.",
        "W: 점심 전에 해. 열두 팀만 나갈 수 있어.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Sunbit Youth Orchestra에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "M",
          "Here is what you should know about the Sunbit Youth Orchestra, which was started by four students ten years ago. " +
            "It practises every Saturday afternoon in the hall of the city youth centre. " +
            "Anyone between thirteen and nineteen may join, and no audition is required. " +
            "Instruments are lent out free of charge, but you must return them at the end of each term. " +
            "The orchestra gives two concerts a year, one in July and one in December. " +
            "Members pay nothing, because the city covers the cost of the hall and the conductor.",
        ],
      ],
      choices: [
        "10년 전 학생 네 명이 시작했다",
        "토요일 오후에 연습한다",
        "들어가려면 오디션을 봐야 한다",
        "악기를 무료로 빌려준다",
        "1년에 두 번 연주회를 연다",
      ],
      answer: 3,
      clue: "Anyone between thirteen and nineteen may join, and no audition is required.",
      explanation:
        "열세 살에서 열아홉 살이면 누구나 들어갈 수 있고 오디션은 없다고 했다. 따라서 ③이 내용과 일치하지 않는다.",
      translation: [
        "M: 10년 전 학생 네 명이 시작한 Sunbit Youth Orchestra를 소개합니다. " +
          "토요일 오후마다 시립 청소년센터 강당에서 연습합니다. " +
          "열세 살에서 열아홉 살이면 누구나 들어올 수 있고 오디션은 없습니다. " +
          "악기는 무료로 빌려주지만 학기가 끝나면 돌려주어야 합니다. " +
          "1년에 두 번, 7월과 12월에 연주회를 엽니다. " +
          "단원은 돈을 내지 않습니다. 강당과 지휘자 비용을 시에서 대기 때문입니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 신청할 주말 강좌를 고르시오.",
      lines: [
        ["W", "Minsu, these are the five weekend courses still open."],
        ["M", "Let's pick one. I can't do Saturday mornings because of my part-time job."],
        ["W", "Right, that takes out one of them."],
        ["M", "Next, how many weeks do they run? More than six is too long for me."],
        ["W", "Then one more is gone. Three are left."],
        ["M", "What do they cost?"],
        ["W", "We said fifty thousand won at the most."],
        ["M", "Then one more drops out. Two left."],
        ["W", "Do either of them give you something to take home at the end?"],
        ["M", "Only one does, and that's what I want to show my parents."],
        ["W", "Then that's the one. I'll sign us both up tonight."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "Then that's the one. I'll sign us both up tonight.",
      explanation:
        "토요일 오전인 ①, 8주인 ②, 60,000원인 ③을 뺀다. 남은 ④와 ⑤ 중 결과물을 가져가는 것은 ④이므로 답은 ④이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "토요일 오전 / 6주 / 45,000원 / 결과물 있음" },
          { no: 2, label: "②", value: "토요일 오후 / 8주 / 45,000원 / 결과물 있음" },
          { no: 3, label: "③", value: "토요일 오후 / 6주 / 60,000원 / 결과물 있음" },
          { no: 4, label: "④", value: "일요일 오후 / 4주 / 50,000원 / 결과물 있음" },
          { no: 5, label: "⑤", value: "일요일 오후 / 5주 / 40,000원 / 결과물 없음" },
        ],
      },
      translation: [
        "W: 민수야, 아직 열려 있는 주말 강좌가 이 다섯 개야.",
        "M: 하나 고르자. 아르바이트 때문에 토요일 오전은 안 돼.",
        "W: 맞다, 그럼 하나가 빠지네.",
        "M: 다음으로 몇 주짜리야? 6주 넘으면 나한테는 길어.",
        "W: 그럼 하나 더 빠진다. 세 개 남았어.",
        "M: 얼마야?",
        "W: 5만 원까지로 정했잖아.",
        "M: 그럼 하나 더 빠지고 둘 남았다.",
        "W: 둘 중에 끝나고 가져갈 결과물이 있는 데 있어?",
        "M: 한 곳만. 그걸 부모님께 보여 드리고 싶어.",
        "W: 그럼 거기로 하자. 오늘 밤에 둘 다 신청할게.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Have you handed in the club budget form?"],
        ["M", "Not yet. I couldn't work out the last section."],
        ["W", "Did you look at last year's form in the shared folder?"],
        ["M", "I didn't know they kept the old ones."],
        ["W", "All five years are in there, and the numbers are filled in."],
      ],
      choices: [
        "The form is due on Friday.",
        "Our club has twenty members.",
        "Then I'll open it tonight.",
        "The office closes at five.",
        "You should hand yours in too.",
      ],
      answer: 3,
      clue: "All five years are in there, and the numbers are filled in.",
      explanation:
        "예전 양식이 숫자까지 채워진 채로 공유 폴더에 있다는 말을 들었으므로, 오늘 밤에 열어 보겠다는 ③이 가장 자연스럽다.",
      translation: [
        "W: 동아리 예산 양식 냈어?",
        "M: 아직. 마지막 칸을 어떻게 쓰는지 모르겠더라.",
        "W: 공유 폴더에 있는 작년 양식은 봤어?",
        "M: 예전 걸 남겨 두는 줄 몰랐어.",
        "W: 5년 치가 다 있고, 숫자까지 채워져 있어.",
        "M: 그럼 오늘 밤에 열어 볼게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "You've been eating in the corridor all week."],
        ["W", "The cafeteria is full by the time my class ends."],
        ["M", "Have you tried the second floor room?"],
        ["W", "Is that open at lunchtime?"],
        ["M", "Since September, and hardly anyone knows about it."],
      ],
      choices: [
        "My class ends at twelve forty.",
        "Then I'll go up there tomorrow.",
        "The corridor is quite cold.",
        "I usually bring my own lunch.",
        "You should eat with us.",
      ],
      answer: 2,
      clue: "Since September, and hardly anyone knows about it.",
      explanation:
        "2층 방이 9월부터 점심시간에 열려 있고 아는 사람이 적다는 말을 들었으므로, 내일 그곳에 가겠다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 일주일 내내 복도에서 밥 먹네.",
        "W: 우리 반 수업이 끝날 때면 급식실이 꽉 차.",
        "M: 2층 방은 가 봤어?",
        "W: 거기 점심시간에 열려?",
        "M: 9월부터 열어. 아는 사람이 거의 없어.",
        "W: 그럼 내일 거기로 올라가 볼게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오. [3점]",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Taemin, how is the class recycling corner going?"],
        ["M", "The bins are still full of the wrong things."],
        ["W", "What have you tried?"],
        ["M", "I put a poster above the bins with all the rules on it."],
        ["W", "How big is the poster?"],
        ["M", "A4, with about fifteen lines."],
        ["W", "And where do people stand when they throw something away?"],
        ["M", "Right at the bin, looking down."],
        ["W", "So they never see the poster on the wall above them."],
        ["M", "I hadn't thought about where their eyes are."],
        ["W", "Put one picture on each lid, where they're already looking."],
      ],
      choices: [
        "Our class has thirty-one students.",
        "Then I'll put a picture on each lid tomorrow.",
        "The bins are emptied on Fridays.",
        "I made the poster last month.",
        "You should check your bins too.",
      ],
      answer: 2,
      clue: "Put one picture on each lid, where they're already looking.",
      explanation:
        "사람들이 이미 보고 있는 뚜껑 위에 그림을 하나씩 붙이라는 조언을 들었으므로, 내일 뚜껑마다 그림을 붙이겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 태민아, 학급 분리수거함은 잘돼 가?",
        "M: 아직도 엉뚱한 게 들어 있어.",
        "W: 뭘 해 봤는데?",
        "M: 통 위쪽에 규칙을 다 적은 포스터를 붙였어.",
        "W: 포스터가 얼마나 커?",
        "M: A4에 열다섯 줄쯤.",
        "W: 그리고 사람들은 뭘 버릴 때 어디에 서 있어?",
        "M: 통 바로 앞에서 아래를 내려다보지.",
        "W: 그럼 머리 위 벽에 붙은 포스터는 볼 일이 없네.",
        "M: 사람들 눈이 어디에 있는지는 생각 못 했어.",
        "W: 이미 보고 있는 뚜껑마다 그림 하나씩 붙여.",
        "M: 그럼 내일 뚜껑마다 그림을 붙일게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오. [3점]",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Nari, you've been rewriting your essay introduction all week."],
        ["W", "I can't start until the first paragraph is right."],
        ["M", "And how much of the rest have you written?"],
        ["W", "Nothing. I'm still on the first paragraph."],
        ["M", "So the deadline is Friday and you have one paragraph."],
        ["W", "One paragraph I've written eleven times."],
        ["M", "How do you know it's right, though, before the rest exists?"],
        ["W", "I suppose I don't. It has to lead somewhere."],
        ["M", "Write the middle first and come back to the opening last."],
        ["W", "Start in the middle? That feels wrong."],
        ["M", "It feels wrong for ten minutes. Then you have something to open."],
      ],
      choices: [
        "My essay is about city libraries.",
        "Then I'll start with the middle tonight.",
        "The deadline is on Friday.",
        "I've written eleven versions.",
        "You should read my introduction.",
      ],
      answer: 2,
      clue: "Write the middle first and come back to the opening last.",
      explanation:
        "가운데부터 쓰고 도입부는 마지막에 쓰라는 조언을 들었으므로, 오늘 밤에 가운데부터 쓰겠다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 나리야, 일주일 내내 글 도입부를 다시 쓰고 있네.",
        "W: 첫 문단이 제대로 되기 전엔 시작을 못 하겠어.",
        "M: 그럼 나머지는 얼마나 썼어?",
        "W: 하나도. 아직 첫 문단이야.",
        "M: 마감이 금요일인데 문단 하나라는 거네.",
        "W: 열한 번 고쳐 쓴 문단 하나.",
        "M: 그런데 나머지가 없는데 그게 제대로 됐는지 어떻게 알아?",
        "W: 모르겠지. 어디론가 이어져야 하니까.",
        "M: 가운데를 먼저 쓰고 도입부는 마지막에 돌아와서 써.",
        "W: 가운데부터? 이상한데.",
        "M: 10분만 이상해. 그러고 나면 열 거리가 생겨.",
        "W: 그럼 오늘 밤엔 가운데부터 써 볼게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Ms. Gwak이 Junho에게 할 말로 가장 적절한 것을 고르시오. [3점]",
      questionText: "▶ Ms. Gwak : ________________",
      lines: [
        [
          "W",
          "Ms. Gwak runs the school science club, and Junho is her most careful experimenter. " +
            "He repeats every measurement three times before he writes anything down. " +
            "Because of that his numbers have never once had to be corrected. " +
            "The difficulty is that the club has one afternoon a week and six experiments to finish. " +
            "Last month he measured beautifully and the group left with two experiments undone. " +
            "Ms. Gwak does not want him to be less careful; that care is why the club's results can be trusted. " +
            "The trouble is that a result nobody had time to write up helps no one. " +
            "The science fair is in four weeks, and she wants to tell him to measure twice instead of three times and write it up the same day. " +
            "In this situation, what would Ms. Gwak most likely say to Junho?",
        ],
      ],
      choices: [
        "Measure twice and write it up the same day.",
        "Try to finish all six experiments yourself.",
        "I think you should join a different club.",
        "Let's drop two experiments from the list.",
        "You should measure four times to be sure.",
      ],
      answer: 1,
      clue: "she wants to tell him to measure twice instead of three times and write it up the same day",
      explanation:
        "곽 선생님은 준호의 꼼꼼함을 문제 삼지 않으면서, 세 번 대신 두 번만 재고 그날 바로 정리하라고 말하려 한다. 따라서 ①이 가장 적절하다.",
      translation: [
        "W: 곽 선생님은 학교 과학 동아리를 맡고 있고, 준호는 가장 꼼꼼히 실험하는 학생입니다. " +
          "준호는 무엇이든 적기 전에 세 번씩 다시 잽니다. " +
          "그 덕분에 준호의 수치는 한 번도 고쳐야 했던 적이 없습니다. " +
          "문제는 동아리에 일주일에 오후 한 번뿐인데 끝내야 할 실험이 여섯 개라는 점입니다. " +
          "지난달에는 아름답게 재고서 두 실험을 못 끝낸 채로 다들 돌아갔습니다. " +
          "곽 선생님은 준호가 덜 꼼꼼해지기를 바라지 않습니다. 그 꼼꼼함 덕분에 동아리의 결과를 믿을 수 있습니다. " +
          "문제는 정리할 시간이 없었던 결과는 아무에게도 도움이 되지 않는다는 점입니다. " +
          "과학 전람회는 4주 뒤이고, 선생님은 세 번 대신 두 번만 재고 그날 바로 정리하라고 말하고 싶습니다. " +
          "이런 상황에서 곽 선생님이 준호에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "남자가 하는 말의 주제로 가장 적절한 것은?",
      lines: [
        ["M", "Good afternoon. Today I want to talk about animals that change the land they live on."],
        ["M", "We usually think of an animal as fitting into a place, but a few of them build the place instead."],
        ["M", "The beaver dams a stream and turns a valley into a pond that lasts for decades."],
        ["M", "The earthworm pulls dead leaves underground and, over centuries, makes the soil that everything else grows in."],
        ["M", "The prairie dog digs tunnels that let rain reach deep and keep the grassland from turning to hard crust."],
        ["M", "The elephant pushes over trees and keeps a forest from closing in on the open ground."],
        ["M", "Remove any one of them and the place becomes something else within a generation."],
        ["M", "That is the part worth remembering: the landscape is partly an animal's work."],
      ],
      choices: [
        "how animals find safe places to live",
        "why some animals live in large groups",
        "animals that shape the land around them",
        "how plants spread their seeds",
        "why forests grow back after fire",
      ],
      answer: 3,
      clue: "Remove any one of them and the place becomes something else within a generation.",
      explanation:
        "남자는 비버, 지렁이, 프레리도그, 코끼리가 자기가 사는 땅을 바꾸는 방식을 설명한다. 따라서 주제는 ③이다.",
      translation: [
        "M: 안녕하세요. 오늘은 자기가 사는 땅을 바꾸는 동물에 대해 이야기하려 합니다.",
        "M: 우리는 보통 동물이 어떤 장소에 맞춰 산다고 생각하지만, 몇몇은 그 장소를 아예 만들어 냅니다.",
        "M: 비버는 개울을 막아 골짜기를 수십 년 가는 연못으로 바꿉니다.",
        "M: 지렁이는 죽은 잎을 땅속으로 끌고 들어가, 수백 년에 걸쳐 다른 모든 것이 자랄 흙을 만듭니다.",
        "M: 프레리도그는 굴을 파서 빗물이 깊이 스미게 하고, 초원이 단단한 껍질로 굳지 않게 합니다.",
        "M: 코끼리는 나무를 밀어 넘어뜨려 숲이 빈 땅을 덮어 버리지 못하게 합니다.",
        "M: 이 중 하나만 빼내도 그곳은 한 세대 안에 다른 곳이 됩니다.",
        "M: 기억할 대목은 그것입니다. 풍경은 어느 정도 동물이 한 일입니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 동물이 아닌 것은?",
      lines: [
        ["M", "Good afternoon. Today I want to talk about animals that change the land they live on."],
        ["M", "We usually think of an animal as fitting into a place, but a few of them build the place instead."],
        ["M", "The beaver dams a stream and turns a valley into a pond that lasts for decades."],
        ["M", "The earthworm pulls dead leaves underground and, over centuries, makes the soil that everything else grows in."],
        ["M", "The prairie dog digs tunnels that let rain reach deep and keep the grassland from turning to hard crust."],
        ["M", "The elephant pushes over trees and keeps a forest from closing in on the open ground."],
        ["M", "Remove any one of them and the place becomes something else within a generation."],
        ["M", "That is the part worth remembering: the landscape is partly an animal's work."],
      ],
      choices: ["beaver", "earthworm", "prairie dog", "mountain goat", "elephant"],
      answer: 4,
      clue: "The elephant pushes over trees and keeps a forest from closing in on the open ground.",
      explanation:
        "비버, 지렁이, 프레리도그, 코끼리는 언급되지만 산양은 언급되지 않았다. 따라서 답은 ④이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
