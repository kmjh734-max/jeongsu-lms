/** 고2 듣기 13회 — 사람이 직접 쓴 회차 (2026-09-21) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고2 13회",
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
          "Good morning, everyone. This is Mr. Kang from the environment committee. " +
            "Starting next Monday, the way we sort waste at school is changing, and every classroom is affected. " +
            "Until now each room had a single bin for paper and plastic together. " +
            "From Monday there will be three bins in every classroom: one for paper, one for clear plastic, and one for everything else. " +
            "Milk cartons no longer go in the paper bin. Please rinse them and leave them in the box by the sink at the back. " +
            "The cleaning staff will no longer sort what we put in the wrong bin, so please read the labels before you drop anything. " +
            "Your homeroom teacher will hand out a one-page guide this afternoon. " +
            "Take two minutes to look at it before Monday. Thank you.",
        ],
      ],
      choices: [
        "환경 동아리 가입을 권유하려고",
        "분리배출 방법이 바뀐 것을 안내하려고",
        "교실 청소 당번을 정하려고",
        "급식 잔반 줄이기를 당부하려고",
        "재활용품 모으기 행사를 홍보하려고",
      ],
      answer: 2,
      clue: "From Monday there will be three bins in every classroom: one for paper, one for clear plastic, and one for everything else.",
      explanation:
        "다음 주 월요일부터 교실마다 분리 수거함이 세 개로 늘고 우유갑은 따로 모은다는 바뀐 방식을 알리고 있다. 따라서 말의 목적은 ②이다.",
      translation: [
        "M: 여러분, 안녕하세요. 환경위원회 강 선생님입니다. " +
          "다음 주 월요일부터 학교에서 쓰레기를 나누는 방법이 바뀌고, 모든 교실이 해당됩니다. " +
          "지금까지는 교실마다 종이와 플라스틱을 함께 넣는 통이 하나 있었습니다. " +
          "월요일부터는 교실마다 통이 세 개가 됩니다. 종이용, 투명 플라스틱용, 그 밖의 것용입니다. " +
          "우유갑은 이제 종이 통에 넣지 않습니다. 헹궈서 교실 뒤 싱크대 옆 상자에 두세요. " +
          "잘못 넣은 것을 청소 담당 선생님들이 더는 나누어 주지 않으니, 버리기 전에 표시를 꼭 읽어 주세요. " +
          "오늘 오후에 담임 선생님이 한 장짜리 안내문을 나눠 드립니다. " +
          "월요일 전에 2분만 시간을 내어 읽어 주세요. 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 남자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Junhyuk, are you throwing away that notebook?"],
        ["M", "No, I'm keeping it. It's the log from the experiment that failed."],
        ["W", "The one where the plants all died? Why keep that?"],
        ["M", "Because next term someone will try the same thing again."],
        ["W", "But there's nothing to report. It didn't work."],
        ["M", "That's exactly what's worth writing down. We know one way that doesn't work."],
        ["W", "I've always just written up the trials that gave clean results."],
        ["M", "So did I, until I repeated a mistake I'd already made in March."],
        ["W", "You couldn't remember what you'd changed?"],
        ["M", "Not a thing. Two weeks gone because I never wrote the failure down."],
        ["W", "All right. I'll start keeping my failed runs in the log too."],
      ],
      choices: [
        "실험은 조를 짜서 해야 한다",
        "가설은 단순할수록 좋다",
        "실험 전에 안전 교육을 받아야 한다",
        "실패한 실험도 빠짐없이 기록해 두어야 한다",
        "결과는 그래프로 정리하는 것이 좋다",
      ],
      answer: 4,
      clue: "Not a thing. Two weeks gone because I never wrote the failure down.",
      explanation:
        "남자는 실패한 실험을 적어 두지 않아 같은 실수를 되풀이했다며 실패도 기록해야 한다고 말한다. 따라서 답은 ④이다.",
      translation: [
        "W: 준혁아, 그 공책 버리는 거야?",
        "M: 아니, 둘 거야. 실패한 실험 기록이야.",
        "W: 식물이 다 죽은 그거? 그걸 왜 둬?",
        "M: 다음 학기에 누군가 같은 걸 또 해 볼 테니까.",
        "W: 그런데 보고할 게 없잖아. 안 됐는데.",
        "M: 바로 그게 적어 둘 가치가 있는 거야. 안 되는 방법 하나를 아는 거니까.",
        "W: 나는 늘 결과가 깔끔하게 나온 것만 정리했는데.",
        "M: 나도 그랬어, 3월에 했던 실수를 또 되풀이하기 전까지는.",
        "W: 뭘 바꿨는지 기억이 안 났어?",
        "M: 하나도. 실패를 안 적어 둬서 2주를 날렸어.",
        "W: 알겠어. 나도 안 된 실험을 기록에 남겨야겠다.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "When you want to learn something new, you naturally look for the best person you can find. " +
            "That is often the wrong choice. Someone who has done a thing for twenty years no longer remembers being bad at it. " +
            "The hardest part for you may be the part they stopped noticing a decade ago. " +
            "Ask instead the person who learned it last spring. They still remember which step made no sense. " +
            "They will tell you the small thing nobody writes down, because they needed it themselves last week. " +
            "The expert is the right person later, when you already know what to ask.",
        ],
      ],
      choices: [
        "막 배운 사람의 설명이 초보자에게 더 도움이 된다",
        "배움에는 꾸준함이 가장 중요하다",
        "실수를 두려워하지 말아야 한다",
        "전문가의 조언을 귀담아들어야 한다",
        "기초를 탄탄히 다져야 한다",
      ],
      answer: 1,
      clue: "Ask instead the person who learned it last spring. They still remember which step made no sense.",
      explanation:
        "오래 한 사람은 초보 시절의 어려움을 잊었으므로, 막 배운 사람에게 물어야 실제로 막히는 부분을 알 수 있다는 내용이다. 따라서 요지는 ①이다.",
      translation: [
        "W: 새로운 것을 배우려 할 때 우리는 자연스럽게 가장 잘하는 사람을 찾습니다. " +
          "그것이 잘못된 선택일 때가 많습니다. 20년 동안 해 온 사람은 자신이 못했던 때를 더는 기억하지 못합니다. " +
          "여러분에게 가장 어려운 부분이, 그 사람은 10년 전부터 눈여겨보지 않게 된 부분일 수 있습니다. " +
          "대신 지난봄에 그것을 배운 사람에게 물어보세요. 어느 단계가 이해되지 않았는지 아직 기억합니다. " +
          "아무도 적어 두지 않는 작은 요령을 알려 줄 것입니다. 지난주에 자기도 그게 필요했으니까요. " +
          "전문가는 나중에, 무엇을 물어야 할지 이미 알게 되었을 때 필요한 사람입니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["M", "Seoyul, the reading lounge turned out better than I expected."],
        ["W", "It did. We finished the last corner on Friday evening."],
        ["M", "There's a round clock high on the back wall."],
        ["W", "We moved it up so people can see it from every seat."],
        ["M", "On the left there's a bookcase with three shelves."],
        ["W", "Those are the books students recommend to each other."],
        ["M", "And in the middle, a round table with a vase on it."],
        ["W", "One of the parents brings fresh flowers every Monday."],
        ["M", "By the window on the right I see two single armchairs."],
        ["W", "They're the first seats to be taken every lunchtime."],
        ["M", "Next to the door there's a big cushion with stripes on it."],
        ["W", "Actually it has a checked pattern. The striped one went to the music room."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 5,
      clue: "Actually it has a checked pattern. The striped one went to the music room.",
      explanation:
        "여자는 문 옆 쿠션이 줄무늬가 아니라 체크무늬라고 바로잡는다. 그림에는 줄무늬 쿠션이 그려져 있으므로 ⑤가 대화와 일치하지 않는다.",
      figure: {
        kind: "labeled",
        scene:
          "A school reading lounge seen from the front, five things clearly separated and none overlapping, clean black line art, no writing anywhere. " +
          "High on the back wall: a ROUND wall clock. " +
          "Left wall: a bookcase with exactly THREE shelves filled with books. " +
          "Centre of the room: a ROUND table with a vase of flowers standing on it. " +
          "By the window on the right: TWO single armchairs side by side. " +
          "Next to the door on the far right: a big floor cushion covered in bold STRIPES.",
      },
      translation: [
        "M: 서율아, 독서 라운지가 생각보다 잘 나왔다.",
        "W: 그렇지. 금요일 저녁에 마지막 구석까지 끝냈어.",
        "M: 뒷벽 높은 곳에 둥근 시계가 있네.",
        "W: 어느 자리에서든 보이라고 위로 옮겼어.",
        "M: 왼쪽에는 세 칸짜리 책장이 있고.",
        "W: 학생들이 서로에게 추천하는 책들이야.",
        "M: 그리고 가운데에는 꽃병이 놓인 둥근 탁자가 있네.",
        "W: 학부모 한 분이 월요일마다 새 꽃을 가져다주셔.",
        "M: 오른쪽 창가에는 1인용 안락의자가 두 개 보이고.",
        "W: 점심시간마다 제일 먼저 차는 자리야.",
        "M: 문 옆에는 줄무늬가 있는 큰 쿠션이 있네.",
        "W: 사실 그건 체크무늬야. 줄무늬 쿠션은 음악실로 갔어.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 여자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Dahye, the career talk is on Thursday and I want to check one thing with you."],
        ["W", "Go ahead. I thought everything was settled last week."],
        ["M", "It was, until the speaker asked to start half an hour later."],
        ["W", "Half an hour? So four thirty instead of four?"],
        ["M", "Exactly. Her train arrives at ten past four."],
        ["W", "Then the forty-two students who signed up are all expecting four o'clock."],
        ["M", "That's the problem. Some of them leave school right after class."],
        ["W", "I have the list with everyone's phone number in the shared folder."],
        ["M", "Could you send them a message today? I'm rebooking the room until five."],
        ["W", "I'll write it during lunch and send it to all forty-two this afternoon."],
        ["M", "Thanks. Then I'll take care of the room and the microphone."],
      ],
      choices: [
        "자료 복사하기",
        "강당 예약하기",
        "참가자에게 안내 문자 보내기",
        "간식 주문하기",
        "사진 담당자 구하기",
      ],
      answer: 3,
      clue: "I'll write it during lunch and send it to all forty-two this afternoon.",
      explanation:
        "강연 시작이 30분 늦춰졌으므로 여자는 신청한 42명에게 안내 문자를 보내기로 한다. 따라서 답은 ③이다.",
      translation: [
        "M: 다혜야, 진로 특강이 목요일인데 하나 확인할 게 있어.",
        "W: 말해 봐. 지난주에 다 정해진 줄 알았는데.",
        "M: 그랬지, 강연자분이 30분 늦게 시작하면 좋겠다고 하시기 전까지는.",
        "W: 30분? 그럼 4시가 아니라 4시 30분이야?",
        "M: 응. 기차가 4시 10분에 도착하신대.",
        "W: 그런데 신청한 42명은 다 4시로 알고 있잖아.",
        "M: 그게 문제야. 수업 끝나고 바로 가는 애들도 있고.",
        "W: 전화번호가 다 있는 명단은 공유 폴더에 있어.",
        "M: 오늘 안에 문자 좀 보내 줄 수 있어? 나는 방을 5시까지로 다시 잡을게.",
        "W: 점심시간에 써서 오늘 오후에 42명 모두에게 보낼게.",
        "M: 고마워. 그럼 방이랑 마이크는 내가 맡을게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 남자가 지불할 금액을 고르시오.",
      lines: [
        ["W", "Welcome to Print House. What can I do for you?"],
        ["M", "I'd like to order club T-shirts for our reading club."],
        ["W", "Our cotton shirts are fifteen dollars each. How many do you need?"],
        ["M", "Three, please. Small, medium, and large."],
        ["W", "Certainly. Would you like names printed on the back?"],
        ["M", "Yes, on all three of them. How much is that?"],
        ["W", "Name printing is four dollars per shirt."],
        ["M", "All right, let's do that."],
        ["W", "And since this is a school club order, we take six dollars off the total."],
        ["M", "That's kind of you. Can I pick them up on Friday?"],
        ["W", "Friday afternoon is fine. Will you pay now or then?"],
        ["M", "I'll pay now, by card."],
      ],
      choices: ["$45", "$51", "$54", "$57", "$60"],
      answer: 2,
      clue: "And since this is a school club order, we take six dollars off the total.",
      explanation:
        "티셔츠 15달러짜리 세 장은 45달러, 이름 인쇄 4달러씩 세 장은 12달러로 합계 57달러이다. 동아리 할인 6달러를 빼면 51달러이므로 답은 ②이다.",
      translation: [
        "W: 프린트하우스입니다. 무엇을 도와드릴까요?",
        "M: 독서 동아리 단체 티셔츠를 주문하려고요.",
        "W: 면 티셔츠는 한 장에 15달러입니다. 몇 장 필요하세요?",
        "M: 세 장이요. 스몰, 미디엄, 라지로요.",
        "W: 네. 등에 이름을 인쇄해 드릴까요?",
        "M: 네, 세 장 다요. 얼마예요?",
        "W: 이름 인쇄는 한 장에 4달러입니다.",
        "M: 그럼 그렇게 해 주세요.",
        "W: 그리고 학교 동아리 주문이라 전체 금액에서 6달러 빼 드립니다.",
        "M: 감사합니다. 금요일에 찾아가도 될까요?",
        "W: 금요일 오후면 괜찮습니다. 결제는 지금 하시겠어요, 그때 하시겠어요?",
        "M: 지금 카드로 할게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 여자가 동아리 공연에 참여할 수 없는 이유를 고르시오.",
      lines: [
        ["M", "Naeun, you're playing at the club festival next week, aren't you?"],
        ["W", "I was supposed to, but I had to tell them I can't."],
        ["M", "Is it because of the mid-term exams?"],
        ["W", "No, the exams end the week before."],
        ["M", "Then what happened? You've practiced that piece since June."],
        ["W", "I slipped on the stairs on Sunday and hurt my wrist."],
        ["M", "Oh no. Is it broken?"],
        ["W", "It's not broken, but the doctor said no playing for three weeks."],
        ["M", "Three weeks. That's right through the festival."],
        ["W", "Exactly. Jisoo is taking my part instead."],
      ],
      choices: [
        "시험 준비를 해야 해서",
        "가족 행사가 있어서",
        "악기가 고장 나서",
        "손목을 다쳐서",
        "다른 동아리와 일정이 겹쳐서",
      ],
      answer: 4,
      clue: "I slipped on the stairs on Sunday and hurt my wrist.",
      explanation:
        "여자는 일요일에 계단에서 넘어져 손목을 다쳤고 3주 동안 연주하지 말라는 말을 들었다. 따라서 답은 ④이다.",
      translation: [
        "M: 나은아, 다음 주 동아리 축제에서 연주하지?",
        "W: 하기로 했었는데 못 한다고 말했어.",
        "M: 중간고사 때문이야?",
        "W: 아니, 시험은 그 전주에 끝나.",
        "M: 그럼 무슨 일이야? 6월부터 그 곡 연습했잖아.",
        "W: 일요일에 계단에서 미끄러져서 손목을 다쳤어.",
        "M: 저런. 부러진 거야?",
        "W: 부러지진 않았는데 3주 동안 연주하지 말라고 하셨어.",
        "M: 3주면 축제까지 딱 걸리네.",
        "W: 그러니까. 지수가 내 파트를 대신 맡았어.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 교내 진로 특강에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["W", "Taeho, are you going to the career talk this month?"],
        ["M", "I'd like to, but I don't know anything about it yet."],
        ["W", "The speaker is a marine biologist who studies coral reefs."],
        ["M", "That sounds interesting. When is it?"],
        ["W", "Next Thursday, right after the seventh period."],
        ["M", "Is it open to everyone, or only to certain grades?"],
        ["W", "First and second years only. The third years have their own programme."],
        ["M", "Good, I'm a second year. How do I sign up?"],
        ["W", "There's a form on the school website. It closes on Tuesday."],
        ["M", "Then I'll fill it in tonight before I forget."],
        ["W", "Do that. Last year it filled up in two days."],
      ],
      choices: ["강연자", "날짜", "장소", "신청 방법", "대상 학년"],
      answer: 3,
      clue: "There's a form on the school website. It closes on Tuesday.",
      explanation:
        "강연자(해양 생물학자), 날짜(다음 주 목요일), 신청 방법(학교 누리집 신청서), 대상 학년(1·2학년)은 언급되지만 장소는 언급되지 않았다. 따라서 답은 ③이다.",
      translation: [
        "W: 태호야, 이번 달 진로 특강 갈 거야?",
        "M: 가고 싶은데 아직 아무것도 몰라.",
        "W: 강연자는 산호초를 연구하는 해양 생물학자야.",
        "M: 재미있겠다. 언제인데?",
        "W: 다음 주 목요일, 7교시 끝나고 바로.",
        "M: 누구나 갈 수 있어, 아니면 특정 학년만?",
        "W: 1학년과 2학년만. 3학년은 따로 프로그램이 있어.",
        "M: 잘됐다, 나 2학년이야. 신청은 어떻게 해?",
        "W: 학교 누리집에 신청서가 있어. 화요일에 마감이야.",
        "M: 그럼 잊기 전에 오늘 밤에 써야겠다.",
        "W: 그래. 작년에는 이틀 만에 찼어.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Moonlight Book Market에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "M",
          "Good evening. Let me tell you about the Moonlight Book Market. " +
            "It is held on the last Friday of every month, from six in the evening until ten. " +
            "The market takes place in the square in front of the city hall, under strings of small lights. " +
            "Anyone may bring books from home and sell them; you do not have to be a shop or a dealer. " +
            "If you want a stall, however, you must apply on the city website by the Monday before. " +
            "And if it rains, the market is not postponed — it simply moves into the covered parking area next door. " +
            "Come and find a book you were not looking for.",
        ],
      ],
      choices: [
        "매달 마지막 금요일 저녁에 열린다",
        "시청 앞 광장에서 진행된다",
        "누구나 책을 가져와 팔 수 있다",
        "판매대는 미리 신청해야 한다",
        "비가 오면 다음 날로 미뤄진다",
      ],
      answer: 5,
      clue: "And if it rains, the market is not postponed — it simply moves into the covered parking area next door.",
      explanation:
        "비가 오면 미루는 것이 아니라 옆 실내 주차장으로 옮겨서 그대로 연다고 했다. 따라서 ⑤가 내용과 일치하지 않는다.",
      translation: [
        "M: 안녕하세요. Moonlight Book Market을 소개합니다. " +
          "매달 마지막 금요일 저녁 6시부터 10시까지 열립니다. " +
          "장터는 시청 앞 광장에서, 작은 전구들이 걸린 아래에서 진행됩니다. " +
          "누구나 집에 있는 책을 가져와 팔 수 있습니다. 가게나 업자가 아니어도 됩니다. " +
          "다만 판매대가 필요하면 그 전 월요일까지 시청 누리집으로 신청해야 합니다. " +
          "그리고 비가 와도 미루지 않습니다. 바로 옆 실내 주차장으로 자리를 옮겨서 엽니다. " +
          "오셔서 찾고 있지 않던 책을 만나 보세요.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 신청할 주말 강좌를 고르시오.",
      lines: [
        ["W", "Minwoo, the community centre put up five weekend courses for this term."],
        ["M", "Let's pick one together. Sunday is out for me, though."],
        ["W", "Right, you have the library volunteering. That removes two of them."],
        ["M", "Three left. What about the fee? I can't go over seventy thousand won."],
        ["W", "Then one more is gone. It's eighty."],
        ["M", "Two left, then. Both are on Saturday."],
        ["W", "One is in the morning and the other in the afternoon."],
        ["M", "I'd much rather go in the morning. Afternoons I get sleepy."],
        ["W", "The morning one it is. There are twelve places, so we should be fine."],
        ["M", "I'll register for both of us tonight."],
        ["W", "Great. Send me the confirmation when it's done."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 1,
      clue: "The morning one it is. There are twelve places, so we should be fine.",
      explanation:
        "일요일인 ③·④를 빼고, 수강료가 8만 원인 ⑤를 뺀다. 남은 ①과 ② 중 오전 강좌는 ①이므로 답은 ①이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "토요일 / 오전 / 60,000원 / 정원 12명" },
          { no: 2, label: "②", value: "토요일 / 오후 / 55,000원 / 정원 10명" },
          { no: 3, label: "③", value: "일요일 / 오전 / 70,000원 / 정원 12명" },
          { no: 4, label: "④", value: "일요일 / 오후 / 50,000원 / 정원 8명" },
          { no: 5, label: "⑤", value: "토요일 / 오전 / 80,000원 / 정원 15명" },
        ],
      },
      translation: [
        "W: 민우야, 주민센터에 이번 학기 주말 강좌 다섯 개가 올라왔어.",
        "M: 같이 하나 고르자. 그런데 나는 일요일은 안 돼.",
        "W: 맞다, 도서관 봉사가 있지. 그럼 두 개가 빠지네.",
        "M: 세 개 남았다. 수강료는? 나는 7만 원을 넘기면 안 돼.",
        "W: 그럼 하나 더 빠져. 8만 원짜리가 있어.",
        "M: 그럼 둘 남았네. 둘 다 토요일이고.",
        "W: 하나는 오전이고 하나는 오후야.",
        "M: 나는 오전이 훨씬 좋아. 오후에는 졸려서.",
        "W: 그럼 오전 강좌로 하자. 정원이 12명이니까 괜찮을 거야.",
        "M: 오늘 밤에 둘 다 신청할게.",
        "W: 좋아. 다 되면 확인 문자 보내 줘.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Did you get the recording of yesterday's lecture?"],
        ["W", "No. My phone ran out of space halfway through."],
        ["M", "Did you ask anyone else in the class?"],
        ["W", "I didn't think anyone would have recorded it."],
        ["M", "Hyewon records every lecture and keeps them in a shared drive."],
      ],
      choices: [
        "The lecture was about two hours long.",
        "I'll delete some photos from my phone.",
        "Then I'll ask Hyewon for yesterday's file.",
        "I've never used a shared drive before.",
        "You should record the next one yourself.",
      ],
      answer: 3,
      clue: "Hyewon records every lecture and keeps them in a shared drive.",
      explanation:
        "혜원이가 모든 강의를 녹음해 공유 드라이브에 둔다는 말을 들었으므로, 혜원에게 어제 파일을 부탁하겠다는 ③이 가장 자연스럽다.",
      translation: [
        "M: 어제 강의 녹음 받았어?",
        "W: 아니. 중간에 휴대폰 저장 공간이 다 찼어.",
        "M: 반에서 다른 사람한테 물어봤어?",
        "W: 녹음한 사람이 있을 거라고 생각을 못 했어.",
        "M: 혜원이가 강의마다 녹음해서 공유 드라이브에 올려 둬.",
        "W: 그럼 혜원이한테 어제 파일 달라고 해야겠다.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "You've been carrying that broken racket around all week."],
        ["M", "I know. I keep meaning to take it to the shop."],
        ["W", "Isn't the shop near the station closed for repairs?"],
        ["M", "It is. That's why I haven't gone anywhere."],
        ["W", "The sports centre restrings rackets on Wednesdays now."],
      ],
      choices: [
        "My racket broke during the match.",
        "Then I'll take it there this Wednesday.",
        "I bought that racket two years ago.",
        "The station is a long walk from here.",
        "You can borrow mine until then.",
      ],
      answer: 2,
      clue: "The sports centre restrings rackets on Wednesdays now.",
      explanation:
        "이제 수요일마다 체육관에서 라켓 줄을 갈아 준다는 말을 들었으므로, 이번 수요일에 가져가겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 일주일 내내 그 망가진 라켓을 들고 다니네.",
        "M: 그러게. 가게에 가져가야지 하면서 계속 미루고 있어.",
        "W: 역 근처 가게는 수리 때문에 닫지 않았어?",
        "M: 닫았어. 그래서 아무 데도 못 갔어.",
        "W: 이제 체육센터에서 수요일마다 라켓 줄을 갈아 줘.",
        "M: 그럼 이번 수요일에 거기 가져갈게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Chaewon, how is the tutoring going at the community centre?"],
        ["W", "The children are lovely, but I come home exhausted every Tuesday."],
        ["M", "Exhausted? You only teach for ninety minutes."],
        ["W", "It's not the teaching. I prepare a brand-new worksheet every week."],
        ["M", "From scratch? For each of the six children?"],
        ["W", "Yes. Six different sheets, and it takes me most of Monday evening."],
        ["M", "Do they actually need six different ones?"],
        ["W", "Probably not. Four of them are at almost the same level."],
        ["M", "Then you're spending hours making four copies of the same thing."],
        ["W", "When you put it like that, it does sound absurd."],
        ["M", "Make one sheet for those four and add a harder page for the other two."],
      ],
      choices: [
        "I'll stop tutoring at the end of this month.",
        "The children usually finish in forty minutes.",
        "Monday is the only evening I'm free.",
        "Then I'll prepare just two versions from next week.",
        "I'd rather have six children than ten.",
      ],
      answer: 4,
      clue: "Make one sheet for those four and add a harder page for the other two.",
      explanation:
        "수준이 비슷한 네 명은 한 가지로, 나머지 두 명은 어려운 것으로 만들라는 조언을 들었으므로, 다음 주부터 두 가지만 준비하겠다는 ④가 가장 자연스럽다.",
      translation: [
        "M: 채원아, 주민센터 학습 지도는 잘돼 가?",
        "W: 아이들은 좋은데 화요일마다 녹초가 돼서 집에 와.",
        "M: 녹초? 90분만 가르치잖아.",
        "W: 가르치는 게 아니라, 매주 학습지를 새로 만들어.",
        "M: 처음부터? 여섯 명 각각?",
        "W: 응. 여섯 장 다 달라서 월요일 저녁을 거의 다 써.",
        "M: 정말 여섯 가지가 다 필요해?",
        "W: 아마 아닐 거야. 네 명은 수준이 거의 같아.",
        "M: 그럼 똑같은 걸 네 번 만드느라 몇 시간을 쓰는 거네.",
        "W: 그렇게 말하니 정말 어이없게 들린다.",
        "M: 그 네 명은 하나로 만들고, 나머지 두 명한테는 어려운 쪽을 한 장 더 줘.",
        "W: 그럼 다음 주부터는 두 가지만 준비할게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Doyoon, you've been going to the gym every single day, haven't you?"],
        ["M", "Since the first of the month. Twenty-one days in a row."],
        ["W", "And how do you feel now compared with week one?"],
        ["M", "Honestly, worse. My shoulders ache and I sleep badly."],
        ["W", "Do you take any days off at all?"],
        ["M", "No. I was afraid that one day off would turn into a week."],
        ["W", "My brother's coach says muscles grow on the rest days, not in the gym."],
        ["M", "I've heard that, but stopping feels like going backwards."],
        ["W", "Then plan the rest instead of stopping. Two fixed days a week."],
      ],
      choices: [
        "Then I'll put Wednesday and Sunday on the calendar as rest days.",
        "I'll go twice a day from now on.",
        "My shoulders have never hurt before.",
        "The gym is closed on national holidays.",
        "I started going there in January.",
      ],
      answer: 1,
      clue: "Then plan the rest instead of stopping. Two fixed days a week.",
      explanation:
        "쉬는 날을 그만두는 것이 아니라 계획해 두라는 조언을 들었으므로, 수요일과 일요일을 쉬는 날로 정해 두겠다는 ①이 가장 자연스럽다.",
      translation: [
        "W: 도윤아, 매일 하루도 안 빼고 운동하러 다니지?",
        "M: 이달 1일부터. 21일 연속이야.",
        "W: 첫 주랑 비교하면 지금 몸은 어때?",
        "M: 솔직히 더 안 좋아. 어깨가 아프고 잠도 잘 못 자.",
        "W: 쉬는 날은 아예 없어?",
        "M: 없어. 하루 쉬면 일주일이 될까 봐 무서웠어.",
        "W: 우리 오빠 코치가 근육은 체육관이 아니라 쉬는 날에 자란다고 하던데.",
        "M: 들어는 봤는데, 멈추면 뒤로 가는 느낌이야.",
        "W: 그럼 멈추지 말고 쉬는 걸 계획해. 일주일에 이틀 정해 놓고.",
        "M: 그럼 수요일이랑 일요일을 쉬는 날로 달력에 적어 둘게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Ms. Yoon이 Sehun에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Ms. Yoon : ________________",
      lines: [
        [
          "W",
          "Ms. Yoon leads the debate club, and Sehun has been a member for two years. " +
            "Sehun researches harder than anyone else and always brings a thick folder of evidence. " +
            "In every round, however, he reads all of it aloud and runs out of time before his conclusion. " +
            "Last week the judges marked him down again, though his material was the strongest in the room. " +
            "Ms. Yoon does not think he should study less; his preparation is what makes him good. " +
            "The trouble is that an argument nobody hears to the end cannot win. " +
            "The regional competition is in two weeks, and speeches there are strictly timed. " +
            "She wants to tell him to choose his three best points and leave the rest in the folder. " +
            "In this situation, what would Ms. Yoon most likely say to Sehun?",
        ],
      ],
      choices: [
        "Try researching a little less before each round.",
        "You should speak more slowly during your turn.",
        "Let someone else take the first speaker's position.",
        "I think you should skip the regional competition.",
        "Pick your three strongest points and leave the rest out.",
      ],
      answer: 5,
      clue: "She wants to tell him to choose his three best points and leave the rest in the folder.",
      explanation:
        "윤 선생님은 세훈의 준비가 강점이라고 보면서도, 시간 안에 끝내도록 가장 강한 세 가지만 골라 말하라고 조언하려 한다. 따라서 ⑤가 가장 적절하다.",
      translation: [
        "W: 윤 선생님은 토론 동아리를 맡고 있고, 세훈이는 2년째 부원입니다. " +
          "세훈이는 누구보다 열심히 자료를 찾고 늘 두꺼운 자료철을 들고 옵니다. " +
          "그런데 경기마다 그것을 전부 읽다가 결론을 말하기 전에 시간이 끝납니다. " +
          "지난주에도 자료는 그 자리에서 가장 탄탄했는데 심사위원 점수는 또 깎였습니다. " +
          "윤 선생님은 세훈이가 공부를 덜 해야 한다고 생각하지 않습니다. 그 준비가 세훈이의 강점입니다. " +
          "문제는 끝까지 들리지 않은 주장은 이길 수 없다는 점입니다. " +
          "지역 대회는 2주 뒤이고, 거기서는 발언 시간을 엄격히 잽니다. " +
          "그래서 가장 강한 세 가지만 골라 말하고 나머지는 자료철에 두라고 말하고 싶습니다. " +
          "이런 상황에서 윤 선생님이 세훈이에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "남자가 하는 말의 주제로 가장 적절한 것은?",
      lines: [
        ["M", "Good afternoon. Hold a violin and a flute side by side and you are holding two different answers to the same question."],
        ["M", "The question is how to make air move in a way that a human ear will call beautiful."],
        ["M", "A violin's top plate is spruce, a light wood that carries vibration quickly along its grain."],
        ["M", "Change that plate to oak and the same strings, the same player, produce a duller, heavier tone."],
        ["M", "A flute made of silver sounds brighter than the wooden flutes its players used two centuries ago."],
        ["M", "A drum is the clearest case of all: its voice is the skin stretched across it, not the shell beneath."],
        ["M", "Even a guitar changes character when the maker swaps rosewood for maple in the back and sides."],
        ["M", "So before you ask how an instrument is played, ask what it is made of. The material speaks first."],
      ],
      choices: [
        "why orchestras tune before a concert",
        "how string instruments are repaired",
        "how the material of an instrument shapes its sound",
        "the history of the modern piano",
        "why some instruments take years to learn",
      ],
      answer: 3,
      clue: "So before you ask how an instrument is played, ask what it is made of. The material speaks first.",
      explanation:
        "남자는 바이올린의 가문비나무, 은 플루트, 북의 가죽, 기타의 목재를 들며 악기의 재료가 소리를 결정한다고 말한다. 따라서 주제는 ③이다.",
      translation: [
        "M: 안녕하세요. 바이올린과 플루트를 나란히 들면 같은 질문에 대한 서로 다른 두 답을 들고 있는 셈입니다.",
        "M: 그 질문은 사람 귀가 아름답다고 부를 만하게 공기를 움직이는 방법이 무엇이냐는 것입니다.",
        "M: 바이올린의 앞판은 가문비나무입니다. 결을 따라 진동을 빠르게 전하는 가벼운 나무지요.",
        "M: 그 판을 참나무로 바꾸면 같은 줄, 같은 연주자인데도 소리가 둔하고 무거워집니다.",
        "M: 은으로 만든 플루트는 200년 전 연주자들이 쓰던 나무 플루트보다 밝은 소리를 냅니다.",
        "M: 북은 가장 분명한 예입니다. 북의 목소리는 아래의 통이 아니라 그 위에 팽팽히 씌운 가죽입니다.",
        "M: 기타조차 뒷판과 옆판을 로즈우드에서 메이플로 바꾸면 성격이 달라집니다.",
        "M: 그러니 악기를 어떻게 연주하는지 묻기 전에 무엇으로 만들었는지 물어보세요. 재료가 먼저 말합니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 악기가 아닌 것은?",
      lines: [
        ["M", "Good afternoon. Hold a violin and a flute side by side and you are holding two different answers to the same question."],
        ["M", "The question is how to make air move in a way that a human ear will call beautiful."],
        ["M", "A violin's top plate is spruce, a light wood that carries vibration quickly along its grain."],
        ["M", "Change that plate to oak and the same strings, the same player, produce a duller, heavier tone."],
        ["M", "A flute made of silver sounds brighter than the wooden flutes its players used two centuries ago."],
        ["M", "A drum is the clearest case of all: its voice is the skin stretched across it, not the shell beneath."],
        ["M", "Even a guitar changes character when the maker swaps rosewood for maple in the back and sides."],
        ["M", "So before you ask how an instrument is played, ask what it is made of. The material speaks first."],
      ],
      choices: ["violin", "flute", "drum", "harp", "guitar"],
      answer: 4,
      clue: "Even a guitar changes character when the maker swaps rosewood for maple in the back and sides.",
      explanation:
        "바이올린, 플루트, 북, 기타는 언급되지만 하프는 언급되지 않았다. 따라서 답은 ④이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
