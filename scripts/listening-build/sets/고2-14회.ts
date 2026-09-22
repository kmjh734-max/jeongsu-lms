/** 고2 듣기 14회 — 사람이 직접 쓴 회차 (2026-09-21) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고2 14회",
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
          "Good afternoon, members of the student council. This is Ms. Baek, your adviser. " +
            "I am writing about the suggestion box that has stood outside the library since March. " +
            "Over the last six months we received one hundred and forty notes, and we have acted on twenty-two of them. " +
            "What we have never done is tell you what happened to the rest, and that is the problem. " +
            "From this month we will post a single sheet beside the box on the first Monday of every month. " +
            "It will list every suggestion received, what we decided, and why. " +
            "Suggestions we cannot act on will be listed too, with the reason in one line. " +
            "Nothing about how you write a note changes. Only the answer changes. Thank you.",
        ],
      ],
      choices: [
        "건의함 위치가 바뀐 것을 알리려고",
        "건의 내용의 처리 결과를 공개하겠다고 알리려고",
        "학생회 임원을 모집하려고",
        "건의함 이용을 권장하려고",
        "도서관 이용 규칙을 안내하려고",
      ],
      answer: 2,
      clue: "It will list every suggestion received, what we decided, and why.",
      explanation:
        "받은 건의를 어떻게 처리했는지 매달 한 장으로 붙여 공개하겠다는 내용이다. 따라서 말의 목적은 ②이다.",
      translation: [
        "W: 학생회 여러분, 안녕하세요. 지도 교사 백 선생님입니다. " +
          "3월부터 도서관 앞에 놓여 있던 건의함에 대해 말씀드립니다. " +
          "지난 여섯 달 동안 140건의 쪽지를 받았고 그중 22건을 실행했습니다. " +
          "그런데 나머지가 어떻게 되었는지는 한 번도 알려 드리지 않았고, 그것이 문제입니다. " +
          "이달부터 매달 첫째 월요일에 건의함 옆에 한 장짜리 안내문을 붙이겠습니다. " +
          "받은 건의를 모두 적고, 어떻게 결정했는지와 그 이유를 함께 적을 것입니다. " +
          "실행할 수 없는 건의도 한 줄짜리 이유와 함께 적겠습니다. " +
          "쪽지를 쓰는 방법은 달라지지 않습니다. 답만 달라집니다. 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 여자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Chaerin, you've written the same lab report three times."],
        ["W", "Twice. The third one is a summary on a single page."],
        ["M", "A summary for whom? The teacher only reads the report."],
        ["W", "For me, in November, when I can't remember any of this."],
        ["M", "Can't you just reread the report then?"],
        ["W", "Twelve pages of it? I never will, and we both know that."],
        ["M", "So the one page is what you actually go back to."],
        ["W", "Every time. It takes twenty minutes and saves me an evening later."],
        ["M", "I've kept every report and never opened one of them again."],
        ["W", "That's the point. Material you won't revisit is the same as material you didn't keep."],
        ["M", "Then I'd better write a page for the ones I've already handed in."],
      ],
      choices: [
        "실험 보고서는 짧게 쓰는 것이 좋다",
        "보고서는 손으로 써야 기억에 남는다",
        "배운 내용은 한 장짜리 요약으로 따로 남겨야 한다",
        "실험은 두 번 이상 반복해야 한다",
        "자료는 많이 모아 둘수록 좋다",
      ],
      answer: 3,
      clue: "That's the point. Material you won't revisit is the same as material you didn't keep.",
      explanation:
        "여자는 열두 쪽짜리 보고서는 다시 보지 않으므로 한 장짜리 요약을 따로 남겨야 한다고 말한다. 따라서 답은 ③이다.",
      translation: [
        "M: 채린아, 같은 실험 보고서를 세 번이나 썼네.",
        "W: 두 번이야. 세 번째 건 한 장짜리 요약이고.",
        "M: 누구 보라고 요약해? 선생님은 보고서만 읽으시잖아.",
        "W: 나 보라고. 11월에 아무것도 기억 안 날 때.",
        "M: 그때 보고서를 다시 읽으면 되잖아.",
        "W: 열두 쪽을? 절대 안 읽을 거야, 너도 알잖아.",
        "M: 그러니까 실제로 다시 보는 건 그 한 장이구나.",
        "W: 매번. 20분 들여 쓰면 나중에 저녁 하나를 아껴.",
        "M: 나는 보고서를 다 모아 뒀는데 한 번도 다시 연 적이 없어.",
        "W: 그게 핵심이야. 다시 보지 않을 자료는 안 남긴 거나 같아.",
        "M: 그럼 이미 낸 것들도 한 장씩 만들어 둬야겠다.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "People say they are bad at names, and they are usually wrong about why. " +
            "You remember the face because you looked at it for a full minute. " +
            "You forget the name because you heard it for half a second while planning what to say next. " +
            "The name was never stored, so there is nothing to recall. " +
            "The fix is not a memory trick. It is to stop talking for two seconds after the name arrives. " +
            "Say it back, ask how it is spelled, use it once before the conversation ends. " +
            "What we call forgetting is, more often than not, never having paid attention in the first place.",
        ],
      ],
      choices: [
        "사람의 이름은 적어 두어야 한다",
        "첫인상은 쉽게 바뀌지 않는다",
        "대화는 짧게 끝내는 것이 좋다",
        "기억하지 못하는 것은 대개 처음부터 주의를 기울이지 않은 탓이다",
        "이름보다 얼굴을 먼저 외워야 한다",
      ],
      answer: 4,
      clue: "What we call forgetting is, more often than not, never having paid attention in the first place.",
      explanation:
        "이름을 잊는 것은 기억력 문제가 아니라 들을 때 주의를 기울이지 않았기 때문이라는 내용이다. 따라서 요지는 ④이다.",
      translation: [
        "M: 사람들은 자기가 이름을 잘 못 외운다고 말하는데, 그 이유는 대개 잘못 알고 있습니다. " +
          "얼굴은 1분 동안 바라보았기 때문에 기억합니다. " +
          "이름은 다음에 무슨 말을 할지 생각하면서 0.5초 동안 들었기 때문에 잊습니다. " +
          "애초에 저장된 적이 없으니 꺼낼 것도 없습니다. " +
          "해법은 기억술이 아닙니다. 이름이 들린 뒤 2초 동안 말을 멈추는 것입니다. " +
          "그 이름을 되뇌고, 철자를 묻고, 대화가 끝나기 전에 한 번 불러 보세요. " +
          "우리가 잊었다고 부르는 것은 대개 처음부터 주의를 기울이지 않은 것입니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["M", "Yeonseo, the study café you opened looks great in these photos."],
        ["W", "Thank you. We finished the last corner on Saturday."],
        ["M", "On the back wall there's a large square frame."],
        ["W", "That's the opening-day photo of the whole team."],
        ["M", "On the left I count four stools at the counter."],
        ["W", "Four is all that fits along that wall."],
        ["M", "In the middle there's a round table with four chairs."],
        ["W", "That's where the study groups sit."],
        ["M", "By the window on the right, is that a floor lamp?"],
        ["W", "No, it's a tall plant. The lamp didn't arrive in time."],
        ["M", "I see. And next to the door there's a bookshelf with two shelves."],
        ["W", "Customers can take any book from it while they drink."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "No, it's a tall plant. The lamp didn't arrive in time.",
      explanation:
        "여자는 창가에 있는 것이 스탠드가 아니라 키 큰 화분이라고 바로잡는다. 그림에는 스탠드가 그려져 있으므로 ④가 대화와 일치하지 않는다.",
      figure: {
        kind: "labeled",
        scene:
          "A small study café seen from the front, five things clearly separated and none overlapping, clean black line art, no writing anywhere. " +
          "Centre of the back wall: one large SQUARE picture frame. " +
          "Along the left wall: a counter with exactly FOUR round stools tucked under it in a row. " +
          "Centre of the room: a ROUND table with exactly FOUR chairs around it. " +
          "By the window on the right: a tall FLOOR LAMP with a cone shade on a thin pole and a round base. " +
          "Next to the door on the far right: a low bookshelf with exactly TWO shelves of books.",
      },
      translation: [
        "M: 연서야, 네가 연 스터디 카페 사진이 참 좋다.",
        "W: 고마워. 토요일에 마지막 구석까지 끝냈어.",
        "M: 뒷벽에 커다란 네모 액자가 있네.",
        "W: 개업 날 다 같이 찍은 사진이야.",
        "M: 왼쪽 카운터에는 의자가 네 개 있고.",
        "W: 그 벽에는 네 개가 딱 들어가.",
        "M: 가운데에는 의자 네 개짜리 둥근 탁자가 있네.",
        "W: 스터디 모임이 앉는 자리야.",
        "M: 오른쪽 창가에 있는 건 스탠드야?",
        "W: 아니, 키 큰 화분이야. 스탠드는 제때 안 왔어.",
        "M: 그렇구나. 그리고 문 옆에는 두 칸짜리 책장이 있고.",
        "W: 손님들이 마시면서 아무 책이나 꺼내 볼 수 있어.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 남자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Jaehyun, the club exhibition opens on Thursday and I'm worried about one thing."],
        ["M", "Is it the panels? I thought those were printed last week."],
        ["W", "They were. It's the order they go up in."],
        ["M", "Does the order matter that much?"],
        ["W", "It does. Visitors walk in from the left, but our story starts on the right."],
        ["M", "So everyone reads it backwards."],
        ["W", "Exactly. We need a plan before we hang anything on Wednesday."],
        ["M", "I have the floor drawing of the hall from last year."],
        ["W", "Perfect. Could you mark where each panel should go?"],
        ["M", "I'll number all twelve on the drawing tonight and send it to the group."],
        ["W", "Thanks. Then I'll book the ladder and the hooks."],
      ],
      choices: [
        "안내 책자를 인쇄하기",
        "전시 패널을 다시 만들기",
        "배치도에 패널 순서를 표시해서 보내기",
        "사다리를 빌리기",
        "관람객에게 문자 보내기",
      ],
      answer: 3,
      clue: "I'll number all twelve on the drawing tonight and send it to the group.",
      explanation:
        "남자는 강당 배치도에 열두 개 패널의 순서를 번호로 표시해서 모둠에 보내기로 한다. 사다리는 여자가 맡았다. 따라서 답은 ③이다.",
      translation: [
        "W: 재현아, 동아리 전시가 목요일에 여는데 걱정되는 게 하나 있어.",
        "M: 패널? 지난주에 인쇄한 줄 알았는데.",
        "W: 인쇄는 했어. 거는 순서가 문제야.",
        "M: 순서가 그렇게 중요해?",
        "W: 중요해. 관람객은 왼쪽에서 들어오는데 우리 이야기는 오른쪽에서 시작해.",
        "M: 그럼 다들 거꾸로 읽게 되네.",
        "W: 그렇지. 수요일에 걸기 전에 계획이 필요해.",
        "M: 작년에 쓴 강당 배치도가 나한테 있어.",
        "W: 잘됐다. 패널이 어디 갈지 표시해 줄 수 있어?",
        "M: 오늘 밤에 열두 개에 번호를 매겨서 모둠에 보낼게.",
        "W: 고마워. 그럼 나는 사다리랑 고리를 빌려 둘게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 여자가 지불할 금액을 고르시오.",
      lines: [
        ["M", "Welcome to the frame shop. What can I do for you?"],
        ["W", "I'd like to have these three drawings framed."],
        ["M", "Our standard wooden frame is eighteen dollars each."],
        ["W", "Three of those, then. That's fifty-four dollars."],
        ["M", "That's right. Would you like glass on the front?"],
        ["W", "How much extra is that?"],
        ["M", "Six dollars per frame, but you don't have to take it for all three."],
        ["W", "Just one of them, the largest drawing."],
        ["M", "All right. And orders of three or more get ten percent off the frames."],
        ["W", "That's kind. When can I collect them?"],
        ["M", "Next Tuesday afternoon."],
        ["W", "Perfect. I'll pay now, by card."],
      ],
      choices: ["$48.60", "$54.00", "$54.60", "$60.00", "$60.60"],
      answer: 3,
      clue: "All right. And orders of three or more get ten percent off the frames.",
      explanation:
        "액자 18달러짜리 세 개는 54달러이고, 세 개 이상 10퍼센트 할인을 받으면 48.60달러이다. 유리는 한 개만 6달러이므로 합계는 54.60달러로 답은 ③이다.",
      translation: [
        "M: 액자 가게입니다. 무엇을 도와드릴까요?",
        "W: 이 그림 세 점을 액자에 넣고 싶어요.",
        "M: 기본 나무 액자는 하나에 18달러입니다.",
        "W: 그럼 세 개요. 54달러네요.",
        "M: 맞습니다. 앞에 유리를 넣으시겠어요?",
        "W: 그건 얼마나 더 드나요?",
        "M: 액자당 6달러인데, 세 개 다 하실 필요는 없습니다.",
        "W: 가장 큰 그림 하나만요.",
        "M: 알겠습니다. 그리고 세 개 이상 주문하시면 액자 값에서 10퍼센트 할인됩니다.",
        "W: 감사합니다. 언제 찾으러 오면 될까요?",
        "M: 다음 주 화요일 오후입니다.",
        "W: 좋네요. 지금 카드로 결제할게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 남자가 토론 대회에 나가지 않기로 한 이유를 고르시오.",
      lines: [
        ["W", "Seungho, your name isn't on the debate contest list."],
        ["M", "I took it off yesterday. I'm not going this year."],
        ["W", "Is it because of the mid-term exams?"],
        ["M", "No, the contest is two weeks after the exams."],
        ["W", "Then why? You reached the final last year."],
        ["M", "My partner and I need eight weeks of practice, and he moved schools in August."],
        ["W", "Can't you find someone else?"],
        ["M", "Everyone with experience already has a partner."],
        ["W", "So there's no one left to work with."],
        ["M", "That's it. I'd rather help the first years prepare instead."],
      ],
      choices: [
        "함께 나갈 짝이 없어서",
        "시험 준비를 해야 해서",
        "다친 곳이 나아지지 않아서",
        "주제가 마음에 들지 않아서",
        "다른 대회와 날짜가 겹쳐서",
      ],
      answer: 1,
      clue: "Everyone with experience already has a partner.",
      explanation:
        "짝이 8월에 전학을 갔고 경험 있는 사람은 모두 짝이 있어 함께 나갈 사람이 없다. 따라서 답은 ①이다.",
      translation: [
        "W: 승호야, 토론 대회 명단에 네 이름이 없네.",
        "M: 어제 뺐어. 올해는 안 나가려고.",
        "W: 중간고사 때문이야?",
        "M: 아니, 대회는 시험 끝나고 2주 뒤야.",
        "W: 그럼 왜? 작년에 결승까지 갔잖아.",
        "M: 짝이랑 8주는 연습해야 하는데, 짝이 8월에 전학 갔어.",
        "W: 다른 사람 구하면 안 돼?",
        "M: 경험 있는 애들은 이미 다 짝이 있어.",
        "W: 그럼 같이할 사람이 없는 거네.",
        "M: 그래. 대신 1학년들 준비를 도와주려고.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 교내 동아리 박람회에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["M", "Hayoon, have you heard about the club fair next month?"],
        ["W", "Only the name. What is it exactly?"],
        ["M", "Every club sets up a booth so new members can look around."],
        ["W", "When is it?"],
        ["M", "The second and third of next month, two days."],
        ["W", "Where do they put all those booths?"],
        ["M", "In the gym. Each club gets one table and one board."],
        ["W", "Do we have to apply for a booth?"],
        ["M", "Yes, the club president fills in a form by this Friday."],
        ["W", "Then I'll tell our president today."],
        ["M", "Do that. Last year three clubs missed the deadline."],
      ],
      choices: ["진행 기간", "장소", "부스 구성", "신청 방법", "참가 동아리 수"],
      answer: 5,
      clue: "Yes, the club president fills in a form by this Friday.",
      explanation:
        "기간(다음 달 2일·3일), 장소(체육관), 부스 구성(탁자 하나와 게시판 하나), 신청 방법(회장이 금요일까지 신청서)은 언급되지만 참가 동아리 수는 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 하윤아, 다음 달 동아리 박람회 얘기 들었어?",
        "W: 이름만. 정확히 뭐야?",
        "M: 동아리마다 부스를 차려서 새 부원들이 둘러볼 수 있게 하는 거야.",
        "W: 언제 하는데?",
        "M: 다음 달 2일과 3일, 이틀 동안.",
        "W: 그 많은 부스를 어디에 놓아?",
        "M: 체육관에. 동아리마다 탁자 하나와 게시판 하나씩 받아.",
        "W: 부스는 신청해야 해?",
        "M: 응, 동아리 회장이 이번 주 금요일까지 신청서를 내야 해.",
        "W: 그럼 오늘 우리 회장한테 말할게.",
        "M: 그래. 작년에는 세 동아리가 마감을 놓쳤어.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Maru Youth Orchestra에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "W",
          "Let me tell you about the Maru Youth Orchestra. " +
            "It was founded eleven years ago by three music teachers in this city. " +
            "The orchestra meets every Saturday afternoon in the hall of the community centre. " +
            "Members must be between thirteen and nineteen, and there is an audition every February. " +
            "Instruments are not provided, so each member brings their own. " +
            "They give two concerts a year, one in July and one in December, and both are free to the public. " +
            "If you would like to hear them, the December concert is in four weeks.",
        ],
      ],
      choices: [
        "11년 전에 세 명의 음악 교사가 만들었다",
        "토요일 오후마다 모인다",
        "13세부터 19세까지 들어갈 수 있다",
        "악기는 단체에서 빌려준다",
        "해마다 두 번 공연한다",
      ],
      answer: 4,
      clue: "Instruments are not provided, so each member brings their own.",
      explanation:
        "악기는 제공되지 않아 각자 가져와야 한다고 했다. 따라서 ④가 내용과 일치하지 않는다.",
      translation: [
        "W: Maru Youth Orchestra를 소개합니다. " +
          "11년 전에 이 도시의 음악 교사 세 분이 만들었습니다. " +
          "이 관현악단은 토요일 오후마다 주민센터 강당에서 모입니다. " +
          "단원은 13세에서 19세 사이여야 하고, 해마다 2월에 오디션이 있습니다. " +
          "악기는 제공하지 않으므로 각자 자기 악기를 가져옵니다. " +
          "해마다 7월과 12월에 두 번 공연하며, 두 공연 모두 무료입니다. " +
          "들어 보고 싶으시면 12월 공연이 4주 뒤에 있습니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 신청할 봉사 프로그램을 고르시오.",
      lines: [
        ["M", "Jiyu, these are the five volunteer programmes still open this term."],
        ["W", "Let's choose one together. I can't do anything on Sundays."],
        ["M", "Right, your cousin's tutoring. That takes out one."],
        ["W", "Next, how long do they run? I can't manage more than three hours."],
        ["M", "Then one more is gone. Three left."],
        ["W", "Do they all give volunteer hours for the school record?"],
        ["M", "One of them doesn't, so that's out too."],
        ["W", "Two left. How far away are they?"],
        ["M", "One is forty minutes by bus, the other is fifteen minutes on foot."],
        ["W", "Then let's take the one we can walk to."],
        ["M", "Agreed. I'll register both of us this evening."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "Then let's take the one we can walk to.",
      explanation:
        "일요일인 ④, 4시간짜리인 ⑤, 봉사 시간이 인정되지 않는 ①을 뺀다. 남은 ②와 ③ 중 걸어서 갈 수 있는 곳은 ③이므로 답은 ③이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "토요일 / 2시간 / 시간 인정 안 됨 / 도보 15분" },
          { no: 2, label: "②", value: "토요일 / 3시간 / 시간 인정 / 버스 40분" },
          { no: 3, label: "③", value: "금요일 / 2시간 / 시간 인정 / 도보 15분" },
          { no: 4, label: "④", value: "일요일 / 2시간 / 시간 인정 / 도보 10분" },
          { no: 5, label: "⑤", value: "토요일 / 4시간 / 시간 인정 / 버스 20분" },
        ],
      },
      translation: [
        "M: 지유야, 이번 학기에 아직 열려 있는 봉사 프로그램이 이 다섯 개야.",
        "W: 같이 하나 고르자. 나는 일요일에는 아무것도 못 해.",
        "M: 맞다, 사촌 과외가 있지. 그럼 하나 빠지네.",
        "W: 그리고 몇 시간짜리야? 세 시간 넘게는 힘들어.",
        "M: 그럼 하나 더 빠진다. 셋 남았어.",
        "W: 학교 기록에 봉사 시간으로 인정되는 건 다 되는 거야?",
        "M: 하나는 인정이 안 돼. 그것도 빠지네.",
        "W: 둘 남았다. 거리는 어때?",
        "M: 하나는 버스로 40분, 다른 하나는 걸어서 15분이야.",
        "W: 그럼 걸어갈 수 있는 곳으로 하자.",
        "M: 좋아. 오늘 저녁에 둘 다 신청할게.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Have you sent the club budget to the office yet?"],
        ["M", "Not yet. I couldn't find last year's form."],
        ["W", "Did you look in the shared folder?"],
        ["M", "I didn't know we had one."],
        ["W", "Everything from last year is in it, including the forms."],
      ],
      choices: [
        "Then I'll open the folder tonight.",
        "The budget is due next month.",
        "I've already sent it twice.",
        "Our club has eleven members.",
        "You should write the budget instead.",
      ],
      answer: 1,
      clue: "Everything from last year is in it, including the forms.",
      explanation:
        "작년 자료가 공유 폴더에 다 있다는 말을 들었으므로, 오늘 밤에 폴더를 열어 보겠다는 ①이 가장 자연스럽다.",
      translation: [
        "W: 동아리 예산안 행정실에 보냈어?",
        "M: 아직. 작년 서식을 못 찾았어.",
        "W: 공유 폴더는 봤어?",
        "M: 그런 게 있는 줄 몰랐어.",
        "W: 서식까지 작년 자료가 전부 거기 있어.",
        "M: 그럼 오늘 밤에 폴더를 열어 볼게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "You've been standing at the printer for ten minutes."],
        ["W", "It keeps stopping halfway through my handout."],
        ["M", "Is the paper tray empty?"],
        ["W", "I checked. It's full."],
        ["M", "Then it's probably the old driver. The office fixed mine last week."],
      ],
      choices: [
        "My handout is eight pages long.",
        "The printer is by the window.",
        "I printed it at home yesterday.",
        "You should use the other printer.",
        "Then I'll ask the office to fix mine too.",
      ],
      answer: 5,
      clue: "Then it's probably the old driver. The office fixed mine last week.",
      explanation:
        "행정실에서 지난주에 같은 문제를 고쳐 주었다는 말을 들었으므로, 자기도 부탁하겠다는 ⑤가 가장 자연스럽다.",
      translation: [
        "M: 10분째 복사기 앞에 서 있네.",
        "W: 유인물을 뽑다가 자꾸 중간에 멈춰.",
        "M: 용지함이 빈 거 아니야?",
        "W: 확인했어. 가득 차 있어.",
        "M: 그럼 아마 드라이버가 오래돼서 그럴 거야. 내 건 지난주에 행정실에서 고쳐 줬어.",
        "W: 그럼 나도 행정실에 고쳐 달라고 해야겠다.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Hyunwoo, how is the tutoring you started at the community centre?"],
        ["M", "The children like it, but I finish every session feeling I taught nothing."],
        ["W", "Why is that?"],
        ["M", "I prepare thirty problems and we never get past the fourth."],
        ["W", "What takes so long on the first four?"],
        ["M", "They ask about something from two years ago, and I explain that instead."],
        ["W", "So the real gap is two years back, not in today's sheet."],
        ["M", "Probably. But then I feel guilty about the twenty-six problems left."],
        ["W", "Guilty about paper? The gap is the lesson."],
        ["M", "I hadn't thought of it that way."],
        ["W", "Bring six problems next time and let the questions take the rest."],
      ],
      choices: [
        "Then I'll prepare only six problems next week.",
        "I'll stop tutoring at the end of the month.",
        "The children are all in the same grade.",
        "I print the problems the night before.",
        "We meet every Wednesday at four.",
      ],
      answer: 1,
      clue: "Bring six problems next time and let the questions take the rest.",
      explanation:
        "다음에는 문제를 여섯 개만 준비하고 나머지 시간은 질문에 쓰라는 조언을 들었으므로, 그렇게 하겠다는 ①이 가장 자연스럽다.",
      translation: [
        "W: 현우야, 주민센터에서 시작한 학습 지도는 어때?",
        "M: 아이들은 좋아하는데, 끝나고 나면 아무것도 못 가르친 기분이야.",
        "W: 왜 그런데?",
        "M: 문제를 서른 개 준비해 가는데 네 번째를 넘어가 본 적이 없어.",
        "W: 앞의 네 문제에서 뭐가 그렇게 오래 걸려?",
        "M: 2년 전에 배운 걸 물어봐서 그걸 대신 설명하게 돼.",
        "W: 그럼 진짜 빈 곳은 오늘 학습지가 아니라 2년 전이네.",
        "M: 아마도. 그런데 남은 스물여섯 문제가 마음에 걸려.",
        "W: 종이가 마음에 걸린다고? 그 빈 곳이 곧 수업이야.",
        "M: 그렇게는 생각 못 했어.",
        "W: 다음엔 문제를 여섯 개만 가져가고 나머지는 질문에 써 봐.",
        "M: 그럼 다음 주에는 여섯 개만 준비할게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Dain, you've been running the class book corner on your own, haven't you?"],
        ["W", "Since March. I lend the books and I chase them when they're late."],
        ["M", "How many are out at the moment?"],
        ["W", "Nineteen, and four of them have been out since June."],
        ["M", "Do people know when they're due?"],
        ["W", "I write it in my notebook when I lend them."],
        ["M", "In your notebook. So only you know."],
        ["W", "I suppose so. I remind them when I remember."],
        ["M", "Put a slip in each book with the return date on it."],
      ],
      choices: [
        "The corner has about sixty books.",
        "Then I'll put a dated slip in every book.",
        "I started the corner in March.",
        "Most of them are novels.",
        "You should borrow one as well.",
      ],
      answer: 2,
      clue: "Put a slip in each book with the return date on it.",
      explanation:
        "책마다 반납일이 적힌 쪽지를 끼워 두라는 조언을 들었으므로, 그렇게 하겠다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 다인아, 학급 책 코너를 혼자 맡아 왔지?",
        "W: 3월부터. 책을 빌려주고 늦으면 찾아다녀.",
        "M: 지금 나가 있는 책이 몇 권인데?",
        "W: 열아홉 권, 그중 네 권은 6월부터 안 들어와.",
        "M: 사람들이 반납일을 알긴 해?",
        "W: 빌려줄 때 내 공책에 적어 둬.",
        "M: 네 공책에. 그럼 너만 아는 거네.",
        "W: 그런 셈이지. 생각나면 알려 주고.",
        "M: 책마다 반납일 적은 쪽지를 끼워 둬.",
        "W: 그럼 책마다 날짜 적은 쪽지를 넣어 둘게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Mr. Han이 Sohee에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Mr. Han : ________________",
      lines: [
        [
          "M",
          "Mr. Han teaches science, and Sohee is in his second-year class. " +
            "Sohee answers almost every question he asks, and her answers are usually right. " +
            "She raises her hand the moment the question ends, sometimes before it ends. " +
            "Because of this, the other students have stopped trying; they wait for her. " +
            "Mr. Han does not want her to stop taking part; her interest is what keeps the lesson moving. " +
            "The trouble is that a class where one person answers is a class where nobody else thinks. " +
            "He wants to ask her to wait about ten seconds before raising her hand. " +
            "In this situation, what would Mr. Han most likely say to Sohee?",
        ],
      ],
      choices: [
        "Please stop answering questions in class.",
        "Could you count to ten before you put your hand up?",
        "You should sit at the back from now on.",
        "Try to give shorter answers next time.",
        "I'd like you to teach the next lesson.",
      ],
      answer: 2,
      clue: "He wants to ask her to wait about ten seconds before raising her hand.",
      explanation:
        "한 선생님은 소희의 참여를 막으려는 것이 아니라, 손을 들기 전에 10초쯤 기다려 달라고 말하려 한다. 따라서 ②가 가장 적절하다.",
      translation: [
        "M: 한 선생님은 과학을 가르치고, 소희는 그 반 2학년 학생입니다. " +
          "소희는 선생님이 묻는 거의 모든 질문에 답하고, 대개 정답입니다. " +
          "질문이 끝나자마자, 때로는 끝나기도 전에 손을 듭니다. " +
          "그 때문에 다른 학생들은 아예 생각을 멈추고 소희를 기다립니다. " +
          "한 선생님은 소희가 참여를 그만두기를 바라지 않습니다. 그 관심이 수업을 굴러가게 합니다. " +
          "문제는 한 사람이 답하는 수업은 나머지가 생각하지 않는 수업이라는 점입니다. " +
          "그래서 손을 들기 전에 10초쯤 기다려 달라고 부탁하고 싶습니다. " +
          "이런 상황에서 한 선생님이 소희에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "남자가 하는 말의 주제로 가장 적절한 것은?",
      lines: [
        ["M", "Good afternoon. Today I want to look at why certain foods keep for so long."],
        ["M", "Before refrigerators, a village that could not store food could not survive a bad winter."],
        ["M", "Salt was the first answer: it pulls water out of meat, and microbes cannot grow without water."],
        ["M", "Smoke does two jobs at once, drying the surface and leaving chemicals that stop decay."],
        ["M", "Vinegar works differently, making the food too acidic for anything harmful to live in it."],
        ["M", "Sugar, in jam, holds water so tightly that nothing else can reach it."],
        ["M", "Each method removes one thing microbes need, and none of them was designed in a laboratory."],
        ["M", "People found them by watching what lasted, and we still eat the results every day."],
      ],
      choices: [
        "how refrigerators changed cooking",
        "traditional ways of keeping food from spoiling",
        "why some foods taste better when cooked slowly",
        "the history of farming in cold climates",
        "how to plan meals for a large family",
      ],
      answer: 2,
      clue: "Each method removes one thing microbes need, and none of them was designed in a laboratory.",
      explanation:
        "남자는 소금, 연기, 식초, 설탕이 각각 미생물이 필요로 하는 것을 없애 음식을 오래 보관하게 한다고 설명한다. 따라서 주제는 ②이다.",
      translation: [
        "M: 안녕하세요. 오늘은 어떤 음식이 왜 그렇게 오래 가는지 살펴보려 합니다.",
        "M: 냉장고가 있기 전에는 음식을 저장하지 못하는 마을은 흉년의 겨울을 넘기지 못했습니다.",
        "M: 첫 번째 답은 소금이었습니다. 고기에서 물을 빼내는데, 미생물은 물 없이 자라지 못합니다.",
        "M: 연기는 두 가지 일을 한꺼번에 합니다. 겉을 말리고 부패를 막는 물질을 남깁니다.",
        "M: 식초는 방식이 다릅니다. 음식을 너무 시게 만들어 해로운 것이 살 수 없게 합니다.",
        "M: 잼에 든 설탕은 물을 아주 단단히 붙들어 다른 것이 물에 닿지 못하게 합니다.",
        "M: 이 방법들은 저마다 미생물에게 필요한 것 하나를 없애며, 실험실에서 고안된 것은 하나도 없습니다.",
        "M: 사람들은 오래가는 것을 지켜보다가 찾아냈고, 우리는 지금도 그 결과를 매일 먹습니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 재료가 아닌 것은?",
      lines: [
        ["M", "Good afternoon. Today I want to look at why certain foods keep for so long."],
        ["M", "Before refrigerators, a village that could not store food could not survive a bad winter."],
        ["M", "Salt was the first answer: it pulls water out of meat, and microbes cannot grow without water."],
        ["M", "Smoke does two jobs at once, drying the surface and leaving chemicals that stop decay."],
        ["M", "Vinegar works differently, making the food too acidic for anything harmful to live in it."],
        ["M", "Sugar, in jam, holds water so tightly that nothing else can reach it."],
        ["M", "Each method removes one thing microbes need, and none of them was designed in a laboratory."],
        ["M", "People found them by watching what lasted, and we still eat the results every day."],
      ],
      choices: ["salt", "smoke", "vinegar", "sugar", "oil"],
      answer: 5,
      clue: "Vinegar works differently, making the food too acidic for anything harmful to live in it.",
      explanation:
        "소금, 연기, 식초, 설탕은 언급되지만 기름은 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
