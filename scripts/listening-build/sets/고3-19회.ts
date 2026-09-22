/** 고3 듣기 19회 — 사람이 직접 쓴 회차 (2026-09-21) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고3 19회",
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
          "Good afternoon, everyone. This is Ms. Pyo from the third-year office. " +
            "I want to talk about the self-study room in the evenings. " +
            "At the moment you may leave whenever you like, and about twenty of you leave between eight and nine. " +
            "Each time the door opens the whole room looks up, and forty people lose a minute. " +
            "From next week the door will be locked except at three fixed times: eight, nine, and ten. " +
            "You may still leave whenever you need to; you simply wait a few minutes for the next opening. " +
            "Anyone who has to go at another time can tell the teacher on duty and the door is opened at once. " +
            "This is not about keeping anybody in. It is about giving the people who stay a quiet hour. " +
            "The new times start on Monday. Thank you for listening.",
        ],
      ],
      choices: [
        "자습실 이용 시간을 늘린다고 알리려고",
        "자습실에서 나가는 시각을 정한다고 안내하려고",
        "자습실 자리를 새로 배정한다고 알리려고",
        "자습실에서 조용히 해 달라고 부탁하려고",
        "자습 감독 교사를 소개하려고",
      ],
      answer: 2,
      clue: "From next week the door will be locked except at three fixed times: eight, nine, and ten.",
      explanation:
        "다음 주부터 자습실 문을 8시, 9시, 10시 세 번만 연다는 안내이다. 따라서 말의 목적은 ②이다.",
      translation: [
        "W: 여러분, 안녕하세요. 3학년부 표 선생님입니다. " +
          "저녁 자습실에 대해 말씀드리려 합니다. " +
          "지금은 아무 때나 나갈 수 있고, 8시에서 9시 사이에 스무 명쯤이 나갑니다. " +
          "문이 열릴 때마다 온 교실이 고개를 들고, 마흔 명이 1분씩 잃습니다. " +
          "다음 주부터는 8시, 9시, 10시 세 번을 빼고는 문을 잠급니다. " +
          "나가고 싶을 때 나갈 수 있습니다. 다음 여는 시각까지 몇 분 기다리면 됩니다. " +
          "다른 시각에 꼭 가야 하는 사람은 당번 선생님께 말하면 바로 열어 드립니다. " +
          "누구를 붙잡아 두려는 것이 아닙니다. 남는 사람들에게 조용한 한 시간을 주려는 것입니다. " +
          "새 시각은 월요일부터입니다. 들어 주셔서 고맙습니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 남자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Seonu, you've started writing your own answer before you read the explanation. Why?"],
        ["M", "Because reading the explanation first taught me nothing for two years."],
        ["W", "It taught you the answer, surely."],
        ["M", "It taught me that the answer was reasonable. That's a different thing."],
        ["W", "How is that different?"],
        ["M", "Anything is reasonable once somebody explains it. I agreed with every explanation I ever read."],
        ["W", "And you still got the same questions wrong."],
        ["M", "The same type, over and over. Agreeing isn't knowing."],
        ["W", "So now you write your own reasoning first."],
        ["M", "Three lines. Why I chose what I chose. Then I open the explanation."],
        ["W", "And what happens?"],
        ["M", "Usually my three lines stop at exactly the sentence I skipped in the passage."],
        ["W", "So you find out where you stopped thinking."],
        ["M", "Which the explanation can never tell me, because it doesn't know what I thought."],
        ["W", "Doesn't it take much longer?"],
        ["M", "Two minutes a question. And I stopped repeating the same mistake in October."],
        ["W", "Then I'll write mine down from tonight."],
      ],
      choices: [
        "해설은 꼼꼼히 읽어야 한다",
        "문제는 많이 풀수록 좋다",
        "해설을 보기 전에 자기 근거를 먼저 적어야 어디서 막혔는지 알 수 있다",
        "오답은 표시해 두었다가 다시 풀어야 한다",
        "공부는 짧게 나누어 해야 한다",
      ],
      answer: 3,
      clue: "Usually my three lines stop at exactly the sentence I skipped in the passage.",
      explanation:
        "남자는 해설을 보기 전에 자기 근거를 세 줄 적어 보면 어디서 생각이 멈췄는지 드러난다고 말한다. 따라서 답은 ③이다.",
      translation: [
        "W: 선우야, 해설 보기 전에 네 답을 먼저 쓰기 시작했더라. 왜?",
        "M: 2년 동안 해설부터 읽었는데 아무것도 안 배웠거든.",
        "W: 답은 배웠잖아.",
        "M: 그 답이 그럴듯하다는 걸 배운 거지. 그건 달라.",
        "W: 뭐가 다른데?",
        "M: 누가 설명해 주면 뭐든 그럴듯해. 나는 읽은 해설에 다 동의했어.",
        "W: 그런데도 같은 문제를 계속 틀렸고.",
        "M: 같은 유형을 거듭. 동의하는 건 아는 게 아니야.",
        "W: 그래서 지금은 네 근거를 먼저 쓰는구나.",
        "M: 세 줄. 왜 그걸 골랐는지. 그러고 나서 해설을 열어.",
        "W: 그러면 어떻게 되는데?",
        "M: 내 세 줄이 딱 내가 지문에서 건너뛴 문장에서 멈춰 있어.",
        "W: 어디서 생각을 멈췄는지 알게 되는 거네.",
        "M: 해설은 절대 알려 줄 수 없어. 내가 뭘 생각했는지 모르니까.",
        "W: 시간이 훨씬 더 걸리지 않아?",
        "M: 한 문제에 2분. 그리고 10월부터 같은 실수를 안 해.",
        "W: 그럼 나도 오늘 밤부터 적어 볼게.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "We treat a decision as good when it turns out well, and that is the one thing it cannot tell us. " +
            "A decision is made before the result exists, with what was known at the time. " +
            "Judge it afterwards by the result and you will learn to admire luck and to punish care. " +
            "The question that teaches you something is whether you would make the same choice again knowing only what you knew then. " +
            "Some good decisions end badly, and those are the ones we abandon too quickly. " +
            "Keep the decision and the result in separate columns, or the record of your own thinking becomes useless to you.",
        ],
      ],
      choices: [
        "결정은 빠르게 내려야 한다",
        "결과가 좋으면 좋은 결정이다",
        "결정을 내릴 때는 남의 의견을 들어야 한다",
        "결정과 결과를 나누어 보아야 판단을 배울 수 있다",
        "실패한 결정은 빨리 잊어야 한다",
      ],
      answer: 4,
      clue: "Keep the decision and the result in separate columns, or the record of your own thinking becomes useless to you.",
      explanation:
        "결정은 결과가 나오기 전의 정보로 내리는 것이므로, 결과와 분리해서 보아야 판단을 배울 수 있다는 내용이다. 따라서 요지는 ④이다.",
      translation: [
        "W: 우리는 결과가 좋으면 좋은 결정이었다고 여기지만, 결과가 알려 줄 수 없는 것이 바로 그것입니다. " +
          "결정은 결과가 존재하기 전에, 그때 알던 것만으로 내립니다. " +
          "나중에 결과로 그것을 재면, 운을 우러르고 신중함을 벌하는 법을 배우게 됩니다. " +
          "무언가를 가르쳐 주는 질문은, 그때 알던 것만 아는 상태로 돌아가도 같은 선택을 하겠는가입니다. " +
          "좋은 결정 가운데 나쁘게 끝나는 것이 있고, 우리는 그런 것들을 너무 빨리 버립니다. " +
          "결정과 결과를 다른 칸에 적어 두십시오. 그러지 않으면 자기 생각의 기록이 자기에게 쓸모없어집니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["M", "Chaewon, the third-year seminar room looks much better now."],
        ["W", "We rearranged it on Friday. What do you see?"],
        ["M", "On the back wall there's a wide whiteboard."],
        ["W", "We use it for the study group every Tuesday."],
        ["M", "On the left there's a tall filing cabinet."],
        ["W", "Past papers, sorted by year. All five drawers are full."],
        ["M", "In the middle there's a long desk with eight chairs."],
        ["W", "Eight is all that fits without blocking the door."],
        ["M", "On the right, is that a fan?"],
        ["W", "No, it's an air purifier. The fan went back to the staff room."],
        ["M", "I see. And beside the door there's a round wall clock."],
        ["W", "It's the only one in the building that keeps proper time."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "No, it's an air purifier. The fan went back to the staff room.",
      explanation:
        "여자는 오른쪽에 있는 것이 선풍기가 아니라 공기청정기라고 바로잡는다. 그림에는 선풍기가 그려져 있으므로 ④가 대화와 일치하지 않는다.",
      figure: {
        kind: "labeled",
        scene:
          "A school seminar room seen from the front, clean black line art on a plain white background, five things clearly separated with wide empty space between them and none overlapping, no writing or letters anywhere. " +
          "High on the back wall in the centre: a WIDE WHITEBOARD with a plain empty face and a narrow tray along its bottom edge. " +
          "On the far left of the floor: a TALL FILING CABINET, a narrow chest with five deep drawers and a round handle on each drawer. " +
          "In the centre of the floor: a LONG DESK with exactly EIGHT chairs around it. " +
          "On the right of the floor: a tall STANDING ELECTRIC FAN with a round cage on a thin pole and a round base. " +
          "Beside the door on the far right, high on the wall: a ROUND CLOCK.",
      },
      translation: [
        "M: 채원아, 3학년 세미나실이 훨씬 나아졌네.",
        "W: 금요일에 다시 배치했어. 뭐가 보여?",
        "M: 뒷벽에 넓은 화이트보드가 있네.",
        "W: 화요일마다 스터디에서 써.",
        "M: 왼쪽에는 키 큰 서류함이 있고.",
        "W: 기출문제를 연도순으로. 다섯 칸 다 찼어.",
        "M: 가운데에는 긴 책상에 의자가 여덟 개 있네.",
        "W: 문을 안 막으려면 여덟이 최대야.",
        "M: 오른쪽에 있는 건 선풍기야?",
        "W: 아니, 공기청정기야. 선풍기는 교무실로 돌아갔어.",
        "M: 그렇구나. 그리고 문 옆에는 둥근 벽시계가 있고.",
        "W: 이 건물에서 시간이 제대로 맞는 유일한 시계야.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 남자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Junyeong, there's a problem with the mock exam booklets."],
        ["M", "I collected them from the printer this morning. What's wrong?"],
        ["W", "Pages nine and ten are missing from every copy."],
        ["M", "Every copy? That's the whole listening section."],
        ["W", "Two hundred booklets, and the exam is tomorrow at nine."],
        ["M", "Can we photocopy the two pages and staple them in?"],
        ["W", "Four hundred pages by tonight? The machine would never manage it."],
        ["M", "Then I'll take them back to the printer and have them reprinted."],
        ["W", "They close at seven. Go now."],
        ["M", "I'll go straight after this period and wait there for them."],
        ["W", "Thanks. I'll tell the teachers the exam may start a little late."],
      ],
      choices: [
        "두 쪽을 복사해 끼우기",
        "시험 시작을 미루기",
        "시험지를 인쇄소에 다시 맡기기",
        "선생님들께 알리기",
        "시험을 다른 날로 옮기기",
      ],
      answer: 3,
      clue: "Then I'll take them back to the printer and have them reprinted.",
      explanation:
        "남자는 시험지를 인쇄소에 다시 가져가 새로 찍기로 한다. 선생님들께 알리는 일은 여자가 맡았다. 따라서 답은 ③이다.",
      translation: [
        "W: 준영아, 모의고사 시험지에 문제가 있어.",
        "M: 오늘 아침에 인쇄소에서 받아 왔는데. 뭐가 잘못됐어?",
        "W: 모든 부에서 9쪽과 10쪽이 빠졌어.",
        "M: 전부? 그럼 듣기 영역이 통째로 없는 거잖아.",
        "W: 200부고, 시험은 내일 9시야.",
        "M: 두 쪽만 복사해서 끼워 넣으면 안 될까?",
        "W: 오늘 밤까지 400쪽을? 기계가 못 버텨.",
        "M: 그럼 내가 인쇄소에 도로 가져가서 다시 찍어 달라고 할게.",
        "W: 7시에 닫아. 지금 가.",
        "M: 이 시간 끝나고 바로 가서 기다렸다 가져올게.",
        "W: 고마워. 나는 선생님들께 시험이 조금 늦어질 수 있다고 말씀드릴게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 여자가 지불할 금액을 고르시오.",
      lines: [
        ["M", "Welcome to the bookshop. What can I help you find?"],
        ["W", "A grammar book and some past paper collections."],
        ["M", "We have two grammar books for third years. The thin one is fifteen dollars and the thick one is thirty."],
        ["W", "The thin one, please. I already have a thick one I never finished."],
        ["M", "A wise choice. And the past paper collections are nine dollars each."],
        ["W", "Three of those, please. One for each subject."],
        ["M", "Fifteen for the grammar book and twenty-seven for the collections. That comes to forty-two dollars."],
        ["W", "Is there a discount for students?"],
        ["M", "There is. Seven dollars off the total with a student card."],
        ["W", "Here it is, and here's my card."],
        ["M", "Thank you. Would you like a notebook as well? They're four dollars."],
        ["W", "No, thank you. I have a drawer full of empty ones."],
      ],
      choices: ["$35", "$38", "$42", "$46", "$49"],
      answer: 1,
      clue: "There is. Seven dollars off the total with a student card.",
      explanation:
        "문법책 15달러와 기출문제집 9달러짜리 세 권 27달러를 더하면 42달러이다. 학생 할인 7달러를 빼면 35달러이고 공책은 사지 않았으므로 답은 ①이다.",
      translation: [
        "M: 서점입니다. 무엇을 찾으세요?",
        "W: 문법책 한 권이랑 기출문제집이요.",
        "M: 3학년용 문법책은 두 가지가 있습니다. 얇은 것은 15달러, 두꺼운 것은 30달러입니다.",
        "W: 얇은 걸로요. 끝내지 못한 두꺼운 게 이미 있어서요.",
        "M: 현명한 선택이세요. 기출문제집은 한 권에 9달러입니다.",
        "W: 세 권 주세요. 과목마다 하나씩요.",
        "M: 문법책 15달러에 문제집 27달러, 모두 42달러입니다.",
        "W: 학생 할인 있나요?",
        "M: 있습니다. 학생증이 있으면 전체 금액에서 7달러 할인됩니다.",
        "W: 여기 있고요, 카드도 여기요.",
        "M: 고맙습니다. 공책도 하시겠어요? 4달러입니다.",
        "W: 아니요, 괜찮아요. 빈 공책이 서랍에 가득해요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 여자가 독서실을 옮기려는 이유를 고르시오.",
      lines: [
        ["M", "Sohee, are you really changing your reading room?"],
        ["W", "From next month. I told them yesterday."],
        ["M", "Is it the price? The new one costs more."],
        ["W", "It does, and I'm still going. That's not it."],
        ["M", "Then what? You've been there since first year."],
        ["W", "They took out the small rooms and made one big hall."],
        ["M", "More seats, then."],
        ["W", "Forty more seats, and no walls. I can hear every page turn."],
        ["M", "Can't you sit at the end?"],
        ["W", "I tried for three weeks. I read the same page four times every evening."],
      ],
      choices: [
        "값이 올라서",
        "집에서 멀어서",
        "자리가 없어서",
        "칸막이를 없애 시끄러워져서",
        "시간이 맞지 않아서",
      ],
      answer: 4,
      clue: "Forty more seats, and no walls. I can hear every page turn.",
      explanation:
        "작은 방들을 없애고 큰 홀로 만들어 소리가 다 들리는 바람에 집중이 되지 않는다. 따라서 답은 ④이다.",
      translation: [
        "M: 소희야, 정말 독서실 옮겨?",
        "W: 다음 달부터. 어제 말했어.",
        "M: 돈 때문이야? 새 데가 더 비싸잖아.",
        "W: 더 비싼데도 가는 거야. 그건 아니야.",
        "M: 그럼 왜? 1학년 때부터 다녔잖아.",
        "W: 작은 방들을 없애고 큰 홀 하나로 만들었어.",
        "M: 그럼 자리가 늘었겠네.",
        "W: 마흔 자리 늘고 벽이 없어졌지. 책장 넘기는 소리가 다 들려.",
        "M: 끝자리에 앉으면 안 돼?",
        "W: 3주 해 봤어. 저녁마다 같은 쪽을 네 번씩 읽었어.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 교내 면접 준비 모임에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["M", "Yerim, have you heard about the interview practice group?"],
        ["W", "I saw the notice but I didn't read past the title."],
        ["M", "It's worth reading. It's not what you'd expect."],
        ["W", "What do you mean? Don't you just answer questions?"],
        ["M", "You answer, and then you watch yourself answering on video."],
        ["W", "On video? That sounds awful."],
        ["M", "Everyone says that, and everyone says it was the useful part afterwards."],
        ["W", "I can imagine. When does it meet?"],
        ["M", "Every Monday and Wednesday after the seventh period, for four weeks."],
        ["W", "Two days a week for a month. Where is it held?"],
        ["M", "The small broadcasting room on the fourth floor, because of the camera."],
        ["W", "And who runs it?"],
        ["M", "Mr. Ryu and a graduate who went through it two years ago."],
        ["W", "A graduate? That's the part I'd want to hear."],
        ["M", "Then sign up today. The list closes on Friday."],
      ],
      choices: ["진행 방식", "모이는 요일", "장소", "진행하는 사람", "정원"],
      answer: 5,
      clue: "Mr. Ryu and a graduate who went through it two years ago.",
      explanation:
        "진행 방식(답한 뒤 영상으로 확인), 모이는 요일(월·수), 장소(4층 방송실), 진행하는 사람(류 선생님과 졸업생)은 언급되지만 정원은 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 예림아, 면접 준비 모임 들어 봤어?",
        "W: 공지는 봤는데 제목만 읽고 말았어.",
        "M: 읽어 볼 만해. 생각하는 그런 게 아니야.",
        "W: 무슨 말이야? 그냥 질문에 답하는 거 아니야?",
        "M: 답하고 나서, 답하는 자기 모습을 영상으로 봐.",
        "W: 영상으로? 끔찍할 것 같은데.",
        "M: 다들 그렇게 말하고, 나중엔 다들 그게 제일 도움이 됐다고 해.",
        "W: 그럴 것 같기는 하다. 언제 모여?",
        "M: 월요일과 수요일, 7교시 끝나고, 4주 동안.",
        "W: 한 달 동안 일주일에 이틀. 어디서 해?",
        "M: 4층 작은 방송실에서. 카메라 때문에.",
        "W: 누가 진행해?",
        "M: 류 선생님이랑 2년 전에 이 모임을 거친 졸업생.",
        "W: 졸업생? 그 얘기는 듣고 싶은데.",
        "M: 그럼 오늘 신청해. 명단은 금요일에 닫혀.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Haneul Reading Room에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "M",
          "Here is what you should know about Haneul Reading Room, which opened on the top floor of the community centre nine years ago. " +
            "It is open from nine in the morning until eleven at night, every day except the last Monday of the month. " +
            "Seats are given out at the desk and cannot be booked in advance, so arriving early matters on test weeks. " +
            "A seat is held for thirty minutes if you leave your card on the desk, and after that it goes to the next person. " +
            "Food is not allowed at the seats, but there is a small room on the same floor where you may eat what you brought. " +
            "Students under nineteen pay nothing; everyone else pays a monthly fee.",
        ],
      ],
      choices: [
        "9년 전에 문을 열었다",
        "매달 마지막 월요일에 쉰다",
        "자리는 미리 예약할 수 있다",
        "같은 층에 음식을 먹을 수 있는 방이 있다",
        "19세 미만 학생은 돈을 내지 않는다",
      ],
      answer: 3,
      clue: "Seats are given out at the desk and cannot be booked in advance, so arriving early matters on test weeks.",
      explanation:
        "자리는 데스크에서 받는 것이고 미리 예약할 수 없다고 했다. 따라서 ③이 내용과 일치하지 않는다.",
      translation: [
        "M: 9년 전 주민센터 꼭대기 층에 문을 연 Haneul Reading Room을 소개합니다. " +
          "매달 마지막 월요일을 빼고 날마다 아침 9시부터 밤 11시까지 엽니다. " +
          "자리는 데스크에서 받고 미리 예약할 수 없어서, 시험 기간에는 일찍 오는 것이 중요합니다. " +
          "데스크에 카드를 맡기고 나가면 30분 동안 자리를 지켜 주고, 그 뒤에는 다음 사람에게 넘어갑니다. " +
          "자리에서는 음식을 먹을 수 없지만, 같은 층에 가져온 것을 먹을 수 있는 작은 방이 있습니다. " +
          "19세 미만 학생은 돈을 내지 않고, 그 밖의 사람은 다달이 이용료를 냅니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 신청할 설명회를 고르시오.",
      lines: [
        ["W", "Dohyun, these are the five university information sessions still open."],
        ["M", "Let's pick one. I can't go on a weekday because of school."],
        ["W", "Right, that takes out one of them."],
        ["M", "Next, how far are they? More than two hours each way is impossible."],
        ["W", "Then one more is gone. Three are left."],
        ["M", "Do they all cover the subject I want?"],
        ["W", "One of them is science only, so that's out for you."],
        ["M", "Two left, then."],
        ["W", "Do either of them have a question time with current students?"],
        ["M", "Only one does, and that's really why I want to go."],
        ["W", "Then that's the one. I'll book two places tonight."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 5,
      clue: "Then that's the one. I'll book two places tonight.",
      explanation:
        "평일인 ①, 3시간 거리인 ②, 자연계열만 다루는 ③을 뺀다. 남은 ④와 ⑤ 중 재학생 질의응답이 있는 것은 ⑤이므로 답은 ⑤이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "목요일 / 1시간 / 전 계열 / 재학생 질의응답 있음" },
          { no: 2, label: "②", value: "토요일 / 3시간 / 전 계열 / 재학생 질의응답 있음" },
          { no: 3, label: "③", value: "토요일 / 1시간 / 자연계열만 / 재학생 질의응답 있음" },
          { no: 4, label: "④", value: "일요일 / 2시간 / 전 계열 / 재학생 질의응답 없음" },
          { no: 5, label: "⑤", value: "토요일 / 2시간 / 전 계열 / 재학생 질의응답 있음" },
        ],
      },
      translation: [
        "W: 도현아, 아직 신청할 수 있는 대학 설명회가 이 다섯 개야.",
        "M: 하나 고르자. 학교 때문에 평일은 안 돼.",
        "W: 맞다, 그럼 하나가 빠지네.",
        "M: 다음으로 얼마나 멀어? 편도 두 시간 넘으면 무리야.",
        "W: 그럼 하나 더 빠진다. 세 개 남았어.",
        "M: 셋 다 내가 갈 계열을 다뤄?",
        "W: 하나는 자연계열만 해서 너한테는 빠져.",
        "M: 그럼 둘 남았네.",
        "W: 둘 중에 재학생이랑 질의응답 하는 데가 있어?",
        "M: 한 곳만. 사실 그것 때문에 가고 싶어.",
        "W: 그럼 거기로 하자. 오늘 밤에 두 자리 신청할게.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Have you booked the interview practice slot?"],
        ["W", "Not yet. The sheet in the office was already full."],
        ["M", "Did you check the second sheet on the back of the door?"],
        ["W", "I didn't know there was a second one."],
        ["M", "They put it up on Monday, and it's nearly empty."],
      ],
      choices: [
        "The interview is next Thursday.",
        "The office closes at five.",
        "I've practised twice already.",
        "Then I'll write my name on it now.",
        "You should book a slot too.",
      ],
      answer: 4,
      clue: "They put it up on Monday, and it's nearly empty.",
      explanation:
        "문 뒤에 붙은 두 번째 명단이 거의 비어 있다는 말을 들었으므로, 지금 이름을 적겠다는 ④가 가장 자연스럽다.",
      translation: [
        "M: 면접 연습 시간 신청했어?",
        "W: 아직. 행정실 명단이 이미 꽉 찼더라.",
        "M: 문 뒤에 붙은 두 번째 명단은 봤어?",
        "W: 두 번째가 있는 줄 몰랐어.",
        "M: 월요일에 붙였는데 거의 비어 있어.",
        "W: 그럼 지금 가서 이름 적을게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "You've been carrying that heavy folder of past papers everywhere."],
        ["M", "I never know which subject I'll get to in a free period."],
        ["W", "Have you thought about scanning them?"],
        ["M", "That would take a whole weekend."],
        ["W", "The library has a machine that does fifty pages a minute."],
      ],
      choices: [
        "The folder weighs about three kilos.",
        "Then I'll scan them this Saturday.",
        "I have four subjects to revise.",
        "The library is on the second floor.",
        "You should scan yours as well.",
      ],
      answer: 2,
      clue: "The library has a machine that does fifty pages a minute.",
      explanation:
        "도서관에 분당 쉰 쪽을 스캔하는 기계가 있다는 말을 들었으므로, 이번 토요일에 스캔하겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 그 무거운 기출문제 묶음을 어디나 들고 다니네.",
        "M: 빈 시간에 어느 과목을 하게 될지 몰라서.",
        "W: 스캔해 두는 건 생각해 봤어?",
        "M: 그러면 주말이 통째로 갈걸.",
        "W: 도서관에 1분에 쉰 쪽 하는 기계가 있어.",
        "M: 그럼 이번 토요일에 스캔할게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오. [3점]",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Hyunjun, how is the English listening going?"],
        ["M", "The score moves by one question either way, every single month."],
        ["W", "What do you do after each test?"],
        ["M", "I check the answers and read the script of the ones I missed."],
        ["W", "Do you listen to those parts again?"],
        ["M", "No. Once I've read it, I understand it."],
        ["W", "Of course you do. Reading is not the skill being tested."],
        ["M", "I'd never separated those two."],
        ["W", "Play the part you missed again, with the script covered."],
        ["M", "And if I still can't hear it?"],
        ["W", "Then you've found the actual problem, which is a sound and not a word."],
      ],
      choices: [
        "My score is usually around thirty.",
        "The test takes twenty-five minutes.",
        "Then I'll replay them before reading tonight.",
        "I listen to English podcasts on the bus.",
        "You should read the scripts too.",
      ],
      answer: 3,
      clue: "Play the part you missed again, with the script covered.",
      explanation:
        "대본을 읽기 전에 놓친 부분을 다시 들으라는 조언을 들었으므로, 오늘 밤에 그렇게 하겠다는 ③이 가장 자연스럽다.",
      translation: [
        "W: 현준아, 영어 듣기는 잘돼 가?",
        "M: 매달 한 문제 오르락내리락만 해.",
        "W: 시험 끝나면 뭘 하는데?",
        "M: 답 맞춰 보고 틀린 문제 대본을 읽어.",
        "W: 그 부분을 다시 들어 봐?",
        "M: 아니. 읽으면 이해되니까.",
        "W: 당연히 이해되지. 읽기는 시험에서 보는 능력이 아니잖아.",
        "M: 그 둘을 나눠 본 적이 없네.",
        "W: 대본을 가리고 놓친 부분을 다시 틀어 봐.",
        "M: 그래도 안 들리면?",
        "W: 그럼 진짜 문제를 찾은 거야. 단어가 아니라 소리인 거지.",
        "M: 그럼 오늘 밤엔 읽기 전에 다시 들어 볼게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오. [3점]",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Nari, you've made a new study plan every Sunday for two months."],
        ["W", "The old one always falls apart by Wednesday."],
        ["M", "What does the plan look like?"],
        ["W", "Every hour of every day, filled in, from six to midnight."],
        ["M", "And what happens on Monday?"],
        ["W", "Something runs long, and then everything after it is wrong."],
        ["M", "So one late hour destroys the whole week."],
        ["W", "And then I stop looking at it altogether."],
        ["M", "A plan with no slack isn't a plan; it's a wish."],
        ["W", "So what should I leave out?"],
        ["M", "Fill four hours a day and leave the rest empty on purpose."],
      ],
      choices: [
        "I usually study until midnight.",
        "Then I'll fill only four hours tomorrow.",
        "My plan is on a big sheet of paper.",
        "The exam is in eleven weeks.",
        "You should make a plan as well.",
      ],
      answer: 2,
      clue: "Fill four hours a day and leave the rest empty on purpose.",
      explanation:
        "하루에 네 시간만 채우고 나머지는 일부러 비워 두라는 조언을 들었으므로, 내일 네 시간만 채우겠다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 나리야, 두 달째 일요일마다 새 공부 계획을 세우네.",
        "W: 예전 것은 늘 수요일이면 무너져.",
        "M: 계획이 어떻게 생겼는데?",
        "W: 날마다 시간마다, 6시부터 자정까지 다 채워져 있어.",
        "M: 그러고 월요일에는 어떻게 돼?",
        "W: 뭔가 길어지면 그 뒤가 전부 어긋나.",
        "M: 한 시간 늦은 게 일주일을 무너뜨리는구나.",
        "W: 그러고는 아예 안 보게 돼.",
        "M: 여유가 없는 계획은 계획이 아니라 바람이야.",
        "W: 그럼 뭘 빼야 해?",
        "M: 하루에 네 시간만 채우고 나머지는 일부러 비워 둬.",
        "W: 그럼 내일은 네 시간만 채울게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Ms. Cho가 Minseo에게 할 말로 가장 적절한 것을 고르시오. [3점]",
      questionText: "▶ Ms. Cho : ________________",
      lines: [
        [
          "W",
          "Ms. Cho teaches the third-year writing class, and Minseo is one of her strongest students. " +
            "Minseo plans every essay carefully and knows exactly what each paragraph will say before she starts. " +
            "Because of that her essays never wander and never run out of material. " +
            "The difficulty appears in the timed test, where she spends twenty of the forty minutes planning. " +
            "In the last two tests she wrote a perfect opening and left the conclusion unfinished. " +
            "Ms. Cho does not want her to stop planning; the plan is why her arguments hold together. " +
            "The trouble is that an unfinished essay is marked as an unfinished essay, however good the first half is. " +
            "The examination is in five weeks, and she wants to tell Minseo to cut the plan down to five minutes and start writing. " +
            "In this situation, what would Ms. Cho most likely say to Minseo?",
        ],
      ],
      choices: [
        "Try to write longer paragraphs next time.",
        "I think you should choose easier topics.",
        "Let's work on your handwriting instead.",
        "Give yourself five minutes to plan, then start writing.",
        "You should write the conclusion first.",
      ],
      answer: 4,
      clue: "she wants to tell Minseo to cut the plan down to five minutes and start writing",
      explanation:
        "조 선생님은 민서의 계획 세우기를 문제 삼지 않으면서, 계획은 5분으로 줄이고 바로 쓰기 시작하라고 말하려 한다. 따라서 ④가 가장 적절하다.",
      translation: [
        "W: 조 선생님은 3학년 작문 수업을 맡고 있고, 민서는 가장 뛰어난 학생 중 하나입니다. " +
          "민서는 글마다 꼼꼼히 계획을 세우고, 쓰기 전에 문단마다 무슨 말을 할지 정확히 압니다. " +
          "그 덕분에 민서의 글은 한 번도 곁길로 새거나 쓸 거리가 떨어지지 않습니다. " +
          "문제는 시간을 재는 시험에서 드러납니다. 40분 중 20분을 계획에 씁니다. " +
          "지난 두 번의 시험에서 완벽한 도입부를 쓰고 결론을 끝내지 못한 채 냈습니다. " +
          "조 선생님은 민서가 계획 세우기를 그만두기를 바라지 않습니다. 그 계획 덕분에 논지가 단단합니다. " +
          "문제는 끝맺지 못한 글은 앞부분이 아무리 좋아도 끝맺지 못한 글로 채점된다는 점입니다. " +
          "시험은 5주 뒤이고, 선생님은 계획을 5분으로 줄이고 바로 쓰기 시작하라고 말하고 싶습니다. " +
          "이런 상황에서 조 선생님이 민서에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "여자가 하는 말의 주제로 가장 적절한 것은?",
      lines: [
        ["W", "Good afternoon. Today I want to talk about animals that travel by borrowing someone else's movement."],
        ["W", "Moving is expensive, and a few species have given up paying for it almost entirely."],
        ["W", "The remora holds onto a shark with a flat disc on its head and lets the shark do the swimming for weeks."],
        ["W", "The pseudoscorpion grips the leg hair of a beetle and is carried to a new log it could never have reached."],
        ["W", "Goose barnacles fasten to a whale's skin as larvae and spend the rest of their lives crossing oceans without swimming."],
        ["W", "The mite that lives in a bee's airway rides from flower to flower inside the bee itself."],
        ["W", "None of these animals is a parasite in the ordinary sense; most of them take nothing but the journey."],
        ["W", "What they have found is that transport, not food, was the thing worth stealing."],
      ],
      choices: [
        "how animals defend themselves from predators",
        "why some animals migrate every year",
        "how sea animals find their food",
        "animals that travel by holding onto other animals",
        "why insects live on flowers",
      ],
      answer: 4,
      clue: "What they have found is that transport, not food, was the thing worth stealing.",
      explanation:
        "여자는 빨판상어, 의갈, 거위목따개비, 진드기가 다른 동물에 붙어 이동하는 방식을 설명한다. 따라서 주제는 ④이다.",
      translation: [
        "W: 안녕하세요. 오늘은 남의 움직임을 빌려 이동하는 동물에 대해 이야기하려 합니다.",
        "W: 움직이는 일은 비용이 크고, 몇몇 종은 그 값을 거의 완전히 치르지 않기로 했습니다.",
        "W: 빨판상어는 머리 위 납작한 빨판으로 상어에 붙어, 몇 주 동안 헤엄은 상어에게 맡깁니다.",
        "W: 의갈은 딱정벌레 다리털을 붙잡고, 혼자서는 결코 닿을 수 없었을 새 통나무까지 실려 갑니다.",
        "W: 거위목따개비는 애벌레 때 고래 살갗에 달라붙어, 헤엄치지 않고 평생 대양을 건넙니다.",
        "W: 벌의 숨길에 사는 진드기는 벌 안에 탄 채로 꽃에서 꽃으로 옮겨 다닙니다.",
        "W: 이들 중 어느 것도 보통 말하는 기생충이 아닙니다. 대부분은 여정 말고는 아무것도 가져가지 않습니다.",
        "W: 이들이 찾아낸 것은, 훔칠 만한 것은 먹이가 아니라 이동이었다는 점입니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 동물이 아닌 것은?",
      lines: [
        ["W", "Good afternoon. Today I want to talk about animals that travel by borrowing someone else's movement."],
        ["W", "Moving is expensive, and a few species have given up paying for it almost entirely."],
        ["W", "The remora holds onto a shark with a flat disc on its head and lets the shark do the swimming for weeks."],
        ["W", "The pseudoscorpion grips the leg hair of a beetle and is carried to a new log it could never have reached."],
        ["W", "Goose barnacles fasten to a whale's skin as larvae and spend the rest of their lives crossing oceans without swimming."],
        ["W", "The mite that lives in a bee's airway rides from flower to flower inside the bee itself."],
        ["W", "None of these animals is a parasite in the ordinary sense; most of them take nothing but the journey."],
        ["W", "What they have found is that transport, not food, was the thing worth stealing."],
      ],
      choices: ["remora", "pseudoscorpion", "goose barnacle", "mite", "hermit crab"],
      answer: 5,
      clue: "The mite that lives in a bee's airway rides from flower to flower inside the bee itself.",
      explanation:
        "빨판상어, 의갈, 거위목따개비, 진드기는 언급되지만 소라게는 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
