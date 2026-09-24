/** 고1 듣기 27회 — 사람이 직접 쓴 회차 (2026-09-25) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고1 27회",
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
          "Good morning, everyone. This is Mr. Gu from the physical education department. " +
            "I want to talk about the gym floor. " +
            "The wooden floor was resurfaced in August, and it cost the school a great deal. " +
            "Since then we have found black marks across the center circle every week. " +
            "They come from outdoor shoes, and they do not come off. " +
            "The rule has always been indoor shoes only, " +
            "but the rule was easy to forget when the floor already looked worn. " +
            "Now it does not. " +
            "From Monday there will be a shoe rack at each entrance, " +
            "and a teacher will be at the door during lunch. " +
            "Please change your shoes before you step on. Thank you.",
        ],
      ],
      choices: [
        "체육관에서 실내화를 신어 달라고 당부하려고",
        "체육관 바닥 공사를 알리려고",
        "실내화 구입 방법을 안내하려고",
        "체육관 이용 시간 변경을 알리려고",
        "체육 수업 준비물을 알리려고",
      ],
      answer: 1,
      clue: "Please change your shoes before you step on.",
      explanation:
        "남자는 새로 깐 체육관 바닥에 자국이 남는다며 들어가기 전에 실내화로 갈아 신어 달라고 당부한다. 따라서 답은 ①이다.",
      translation: [
        "M: 여러분, 안녕하세요. 체육부 구입니다. 체육관 바닥 이야기를 하려고 합니다. 나무 바닥을 8월에 새로 깔았고, 학교에서 큰돈을 들였습니다. 그 뒤로 매주 가운데 원 주변에서 검은 자국을 발견합니다. 바깥 신발에서 나는 것이고 지워지지 않습니다. 규칙은 늘 실내화만 신는 것이었지만, 바닥이 이미 낡아 보일 때는 그 규칙을 잊기 쉬웠습니다. 이제는 그렇지 않습니다. 월요일부터 출입구마다 신발장을 두고, 점심시간에는 선생님이 문 앞에 계실 것입니다. 들어서기 전에 신발을 갈아 신어 주세요. 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 여자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Hyewon, I've started setting five alarms every morning."],
        ["W", "Five? What time does the first one go off?"],
        ["M", "Six, and the last one at six forty."],
        ["W", "And which one do you actually get up on?"],
        ["M", "The last one. Sometimes I sleep through that too."],
        ["W", "So the first four just interrupt your sleep without waking you."],
        ["M", "I never thought of them as interruptions."],
        ["W", "Forty minutes of broken sleep is worse than none of it."],
        ["M", "But if I set one alarm I'll miss it."],
        ["W", "You'll miss it once. Then your body will start expecting it."],
        ["M", "So the alarms are teaching me to ignore alarms."],
        ["W", "Exactly. Set one, at the time you actually have to get up."],
      ],
      choices: [
        "일찍 자야 일찍 일어난다",
        "아침 운동이 잠을 깨워 준다",
        "잠은 충분히 자야 한다",
        "알람은 하나만 맞춰야 한다",
        "휴대폰은 멀리 두어야 한다",
      ],
      answer: 4,
      clue: "Exactly. Set one, at the time you actually have to get up.",
      explanation:
        "여자는 여러 알람이 잠만 끊어 놓고 알람을 무시하도록 길들인다며, 실제로 일어나야 할 시각에 하나만 맞추라고 말한다. 따라서 답은 ④이다.",
      translation: [
        "M: 혜원아, 나 아침마다 알람을 다섯 개 맞추기 시작했어.",
        "W: 다섯 개? 첫 알람이 몇 시에 울리는데?",
        "M: 6시. 마지막은 6시 40분.",
        "W: 그중 어느 알람에 실제로 일어나?",
        "M: 마지막 거. 가끔은 그것도 못 듣고 자.",
        "W: 그럼 앞의 네 개는 깨우지도 못하면서 잠만 끊는 거네.",
        "M: 끊는 거라고 생각해 본 적은 없어.",
        "W: 40분 동안 끊긴 잠은 안 잔 것보다 나빠.",
        "M: 그런데 알람을 하나만 맞추면 놓칠 것 같아.",
        "W: 한 번 놓치겠지. 그러면 몸이 그 시각을 기다리기 시작해.",
        "M: 그럼 알람이 나한테 알람을 무시하라고 가르치고 있는 거구나.",
        "W: 그래. 실제로 일어나야 하는 시각에 하나만 맞춰.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Whenever a group has to choose between two options, " +
            "someone eventually suggests taking a vote. " +
            "It feels fair, and it ends the discussion, " +
            "which is usually why it gets suggested. " +
            "But a vote does something specific to a room. " +
            "It converts everything anyone knows into a single mark, " +
            "and a mark carries no reasons with it. " +
            "The person who had worked with this supplier for three years " +
            "counts exactly the same as the person who heard about them yesterday. " +
            "That is the right rule for an election, " +
            "where we deliberately do not weigh one citizen above another. " +
            "It is a poor rule for a decision that turns on information. " +
            "Before the hands go up, ask who here has done this before, " +
            "and let that person talk for two minutes.",
        ],
      ],
      choices: [
        "회의는 표결로 끝내야 한다",
        "모두의 의견을 똑같이 존중해야 한다",
        "결정은 빨리 내려야 한다",
        "정보가 중요한 결정은 표결보다 경험을 들어야 한다",
        "토론은 짧을수록 좋다",
      ],
      answer: 4,
      clue: "Before the hands go up, ask who here has done this before, and let that person talk for two minutes.",
      explanation:
        "남자는 표결이 이유를 지워 버린다며, 손을 들기 전에 해 본 사람의 이야기를 들으라고 말한다. 따라서 답은 ④이다.",
      translation: [
        "M: 어떤 모임이 두 가지 중에서 골라야 할 때면, 결국 누군가 표결하자고 말합니다. 공정해 보이고 토론을 끝내 주는데, 대개 그래서 나오는 제안입니다. 그런데 표결은 그 방에 특정한 일을 합니다. 누가 무엇을 알고 있든 그것을 하나의 표시로 바꾸고, 표시는 아무 이유도 함께 지고 가지 않습니다. 그 거래처와 3년을 일해 본 사람이, 어제 그 이름을 처음 들은 사람과 정확히 같은 한 표가 됩니다. 그것은 선거에는 맞는 규칙입니다. 거기서는 일부러 한 시민을 다른 시민보다 무겁게 치지 않으니까요. 그러나 정보에 달린 결정에는 나쁜 규칙입니다. 손이 올라가기 전에, 여기서 이 일을 해 본 사람이 누구인지 묻고 그 사람에게 2분을 주세요.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["W", "Sangjun, is this the stand your class ran at the food fair?"],
        ["M", "Yes, we sold rice cakes there all morning."],
        ["W", "There's a striped awning over the counter."],
        ["M", "We borrowed it from the drama club."],
        ["W", "And a chalkboard menu hangs on the front of the counter."],
        ["M", "We rewrote it twice when things sold out."],
        ["W", "I count three steamers on the counter."],
        ["M", "There are four. One is behind the tall one."],
        ["W", "The paper lantern hanging at the corner is a nice touch."],
        ["M", "My grandmother made that one."],
        ["W", "And a cash tin sits at the right end of the counter."],
        ["M", "We counted it three times before we believed the total."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "There are four. One is behind the tall one.",
      explanation:
        "여자가 찜기가 세 개라고 하자 남자가 네 개라고 바로잡는다. 그림에는 세 개가 그려져 있으므로 답은 ③이다.",
      figure: {
        kind: "scene",
        scene:
          "A food fair stand drawn as one wide picture, clean black line art on white, no writing or letters or numbers anywhere. " +
          "A STRIPED AWNING is stretched over a counter. " +
          "A blank CHALKBOARD hangs on the front panel of the counter. " +
          "EXACTLY THREE ROUND STEAMER BASKETS stand on the counter, spaced well apart so all three are easy to count and none overlap. " +
          "A PAPER LANTERN hangs from the corner post of the stand. " +
          "A CASH TIN sits at the right end of the counter.",
      },
      translation: [
        "W: 상준아, 이게 너희 반이 먹거리 장터에서 한 가게야?",
        "M: 응, 오전 내내 떡을 팔았어.",
        "W: 계산대 위에 줄무늬 차양이 있네.",
        "M: 연극 동아리에서 빌렸어.",
        "W: 그리고 계산대 앞면에 칠판 메뉴판이 걸려 있어.",
        "M: 다 팔릴 때마다 두 번 고쳐 썼어.",
        "W: 계산대에 찜기가 세 개 보여.",
        "M: 네 개야. 하나는 큰 것 뒤에 있어.",
        "W: 모퉁이에 걸린 종이 등이 멋지다.",
        "M: 그건 우리 할머니가 만드신 거야.",
        "W: 그리고 계산대 오른쪽 끝에 돈통이 있네.",
        "M: 합계를 믿기까지 세 번이나 세어 봤어.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 여자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Hyewon, the science quiz starts at three in room 204."],
        ["W", "I know. I've been counting down all week."],
        ["M", "Let's go through what's done. Are the question sheets ready?"],
        ["W", "Sixty copies, cut and stacked by round, on the front desk."],
        ["M", "That's one less thing. And the buzzers for each team?"],
        ["W", "Tested this morning. All four work, and the spare does too."],
        ["M", "Good, because last year one died in the second round."],
        ["W", "I remember. That's why I checked the spare."],
        ["M", "Then what's still open?"],
        ["W", "The prizes are still in the staff room cupboard."],
        ["M", "The book vouchers? Who has the key to that cupboard?"],
        ["W", "Mr. Song, and he leaves at two forty."],
        ["M", "It's two twenty now, so somebody has to move."],
        ["W", "Can you go? It's only two corridors away."],
        ["M", "I can't. I have to set up the projector and the scoreboard."],
        ["W", "Both of those take time. All right."],
        ["M", "Could you catch him before he goes?"],
        ["W", "Then I'll get the vouchers from Mr. Song."],
      ],
      choices: [
        "문제지 복사하기",
        "버저 점검하기",
        "상품 받아 오기",
        "프로젝터 설치하기",
        "점수판 만들기",
      ],
      answer: 3,
      clue: "Then I'll get the vouchers from Mr. Song.",
      explanation:
        "문제지와 버저는 끝났고 남자는 프로젝터와 점수판을 맡아야 하므로, 여자가 송 선생님께 상품을 받아 오기로 한다. 따라서 답은 ③이다.",
      translation: [
        "M: 혜원아, 과학 퀴즈가 3시에 204호에서 시작해.",
        "W: 알아. 일주일 내내 날짜를 세고 있었어.",
        "M: 끝난 것부터 짚어 보자. 문제지는 다 됐어?",
        "W: 예순 부, 잘라서 차수별로 앞 책상에 쌓아 뒀어.",
        "M: 하나 줄었네. 팀별 버저는?",
        "W: 오늘 아침에 시험했어. 네 개 다 되고 여분도 돼.",
        "M: 잘했다. 작년엔 2차에서 하나가 죽었잖아.",
        "W: 기억나. 그래서 여분도 확인한 거야.",
        "M: 그럼 아직 남은 게 뭐야?",
        "W: 상품이 아직 교무실 장에 있어.",
        "M: 도서 상품권? 그 장 열쇠는 누가 갖고 있어?",
        "W: 송 선생님. 그런데 2시 40분에 나가셔.",
        "M: 지금 2시 20분이니까 누군가는 움직여야겠네.",
        "W: 네가 갈 수 있어? 복도 두 개만 지나면 되는데.",
        "M: 못 가. 나는 프로젝터랑 점수판을 설치해야 해.",
        "W: 둘 다 시간 걸리지. 알겠어.",
        "M: 나가시기 전에 네가 잡을 수 있어?",
        "W: 그럼 내가 송 선생님께 상품권 받아 올게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 남자가 지불할 금액을 고르시오.",
      lines: [
        ["W", "Welcome to Clearview Optical. What can I help you with?"],
        ["M", "Two pairs of sports goggles and three cleaning kits, please."],
        ["W", "Goggles are thirty-two dollars a pair and kits are six each."],
        ["M", "So sixty-four dollars plus eighteen."],
        ["W", "Eighty-two in total. Would you like the hard cases as well?"],
        ["M", "How much are the cases?"],
        ["W", "Nine dollars each, so eighteen for two."],
        ["M", "We'll skip the cases. The bags come with pouches."],
        ["W", "No problem. Are you with the school swim team?"],
        ["M", "We are. Here's the team card."],
        ["W", "Then I can take twenty-five percent off the goggles, but not the kits."],
        ["M", "Thank you. I'll pay by card."],
      ],
      choices: ["$61.50", "$66.00", "$70.00", "$82.00", "$100.00"],
      answer: 2,
      clue: "Then I can take twenty-five percent off the goggles, but not the kits.",
      explanation:
        "물안경 2개 64달러에서 25퍼센트를 빼면 48달러이고, 할인이 안 되는 세척 세트 3개 18달러를 더하면 66달러이다. 따라서 답은 ②이다.",
      translation: [
        "W: 클리어뷰 안경점입니다. 무엇을 도와드릴까요?",
        "M: 수영 물안경 두 개랑 세척 세트 세 개 주세요.",
        "W: 물안경은 한 개에 32달러, 세척 세트는 6달러입니다.",
        "M: 그럼 64달러에 18달러네요.",
        "W: 모두 82달러입니다. 단단한 케이스도 하시겠어요?",
        "M: 케이스는 얼마예요?",
        "W: 하나에 9달러라서 두 개면 18달러입니다.",
        "M: 케이스는 뺄게요. 가방에 주머니가 있어요.",
        "W: 괜찮습니다. 학교 수영부세요?",
        "M: 네. 여기 팀 카드요.",
        "W: 그럼 물안경에서 25퍼센트를 빼 드립니다. 세척 세트는 안 돼요.",
        "M: 감사합니다. 카드로 낼게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 여자가 주말 캠프에 가지 못하는 이유를 고르시오.",
      lines: [
        ["M", "Hyewon, you're not on the camp list for Saturday."],
        ["W", "I had to take my name off on Monday."],
        ["M", "Is your ankle still sore from the match?"],
        ["W", "That was fine after a week."],
        ["M", "Then is it the fee? It went up to sixty thousand."],
        ["W", "My brother offered to cover it, so that's not it."],
        ["M", "So what happened?"],
        ["W", "I'm taking the language test that Saturday morning."],
        ["M", "Can't you sit it in the next round?"],
        ["W", "The next round is in June, after the application deadline."],
      ],
      choices: [
        "발목을 다쳐서",
        "참가비가 올라서",
        "어학 시험을 봐야 해서",
        "가족 여행을 가서",
        "아르바이트가 있어서",
      ],
      answer: 3,
      clue: "I'm taking the language test that Saturday morning.",
      explanation:
        "발목도 나았고 참가비도 해결되었지만, 그 토요일 아침에 어학 시험이 있고 다음 회차는 지원 마감 뒤이기 때문이다. 따라서 답은 ③이다.",
      translation: [
        "M: 혜원아, 토요일 캠프 명단에 네가 없네.",
        "W: 월요일에 이름을 뺐어.",
        "M: 경기 때 다친 발목이 아직 아파?",
        "W: 그건 일주일 만에 괜찮아졌어.",
        "M: 그럼 참가비 때문이야? 6만 원으로 올랐잖아.",
        "W: 오빠가 내 주겠다고 했어. 그건 아니야.",
        "M: 그럼 무슨 일인데?",
        "W: 그 토요일 아침에 어학 시험을 봐.",
        "M: 다음 회차에 보면 안 돼?",
        "W: 다음 회차는 6월이야. 지원 마감 뒤라서.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, Harborline Ferry Tour에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["M", "Hyewon, have you looked at the Harborline Ferry Tour?"],
        ["W", "I saw the leaflet. When does it run?"],
        ["M", "Daily from April to October, at ten and at two."],
        ["W", "Twice a day. Where does it leave from?"],
        ["M", "The old wharf beside the fish market."],
        ["W", "I know that wharf. How long is the trip?"],
        ["M", "Ninety minutes, out to the island and back."],
        ["W", "That's a good length. What does a ticket cost?"],
        ["M", "Twelve thousand won, and half price for students."],
        ["W", "Do they say anything on board, or is it just the ride?"],
        ["M", "A guide talks about the harbor's history the whole way out."],
        ["W", "Then let's take the ten o'clock next Saturday."],
      ],
      choices: ["운항 기간", "출발 장소", "소요 시간", "요금", "정원"],
      answer: 5,
      clue: "정원은 대화에서 언급되지 않았다.",
      explanation:
        "운항 기간(4월부터 10월까지 매일), 출발 장소(어시장 옆 옛 부두), 소요 시간(90분), 요금(1만 2천 원, 학생 반값)은 언급되지만 정원은 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 혜원아, 하버라인 여객선 관광 봤어?",
        "W: 안내지 봤어. 언제 운항해?",
        "M: 4월부터 10월까지 매일, 10시랑 2시에.",
        "W: 하루 두 번이구나. 어디서 출발해?",
        "M: 어시장 옆 옛 부두에서.",
        "W: 그 부두 알아. 얼마나 걸려?",
        "M: 90분. 섬까지 갔다가 돌아와.",
        "W: 적당하네. 표는 얼마야?",
        "M: 1만 2천 원. 학생은 반값이야.",
        "W: 배에서 뭘 설명해 줘, 아니면 그냥 타는 거야?",
        "M: 나가는 내내 안내인이 항구 역사를 이야기해 줘.",
        "W: 그럼 다음 주 토요일 10시 걸로 타자.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Redstone Climbing Gym에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "W",
          "Let me tell you about the Redstone Climbing Gym. " +
            "It opened in 2015 in a converted factory two streets from the bus terminal. " +
            "The gym is open from noon until eleven on weekdays and from nine on weekends. " +
            "Shoes and chalk bags are rented at the counter for three thousand won. " +
            "First-time visitors must watch a ten-minute safety video before climbing. " +
            "There are no ropes anywhere in the building, only bouldering walls with thick mats. " +
            "Anyone under fourteen must be accompanied by an adult at all times.",
        ],
      ],
      choices: [
        "버스 터미널에서 두 블록 거리에 있다",
        "주말에는 9시부터 연다",
        "신발과 초크 가방을 빌려준다",
        "처음 온 사람도 바로 오를 수 있다",
        "열네 살 미만은 어른과 함께 와야 한다",
      ],
      answer: 4,
      clue: "First-time visitors must watch a ten-minute safety video before climbing.",
      explanation:
        "처음 온 사람은 10분짜리 안전 영상을 보고 나서야 오를 수 있다고 했으므로 ④는 내용과 다르다. 따라서 답은 ④이다.",
      translation: [
        "W: 레드스톤 클라이밍장을 소개해 드리겠습니다. 2015년에 버스 터미널에서 두 블록 떨어진, 공장을 고친 건물에서 문을 열었습니다. 평일에는 정오부터 11시까지, 주말에는 9시부터 엽니다. 신발과 초크 가방은 계산대에서 3천 원에 빌려줍니다. 처음 오신 분은 오르기 전에 10분짜리 안전 영상을 보셔야 합니다. 건물 어디에도 밧줄은 없고, 두꺼운 매트가 깔린 볼더링 벽만 있습니다. 열네 살 미만은 언제나 어른과 함께 와야 합니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 예약할 야영장 자리를 고르시오.",
      lines: [
        ["M", "Hyewon, let's book a campsite for the club trip."],
        ["W", "Five sites here. How many of us are going?"],
        ["M", "Six, so anything under six is out."],
        ["W", "Right. Do we need a fire pit?"],
        ["M", "Yes. Half the point is cooking outside."],
        ["W", "Agreed. And the price? We collected seventy thousand won."],
        ["M", "So seventy thousand a night is the ceiling."],
        ["W", "Then only one site clears all three."],
        ["M", "Let's book before the weekend fills up."],
        ["W", "I'll reserve it on the park site tonight."],
        ["M", "Send me the booking number when it comes through."],
        ["W", "I will. It usually arrives by email in an hour."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 5,
      clue: "Six, so anything under six is out.",
      explanation:
        "여섯 명 이상 쓸 수 있고, 화덕이 있으며, 하룻밤 7만 원 이하인 자리를 고른다. 세 조건을 모두 채우는 것은 ⑤이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Capacity: 4 / Fire pit: Yes / Price: 40,000 won per night" },
          { no: 2, label: "②", value: "Capacity: 8 / Fire pit: No / Price: 50,000 won per night" },
          { no: 3, label: "③", value: "Capacity: 6 / Fire pit: Yes / Price: 95,000 won per night" },
          { no: 4, label: "④", value: "Capacity: 5 / Fire pit: Yes / Price: 35,000 won per night" },
          { no: 5, label: "⑤", value: "Capacity: 8 / Fire pit: Yes / Price: 65,000 won per night" },
        ],
      },
      translation: [
        "M: 혜원아, 동아리 여행 갈 야영장 자리 예약하자.",
        "W: 다섯 자리 있네. 몇 명 가?",
        "M: 여섯 명. 그러니 여섯보다 작은 건 빠져.",
        "W: 맞아. 화덕은 필요해?",
        "M: 응. 밖에서 해 먹는 게 절반이잖아.",
        "W: 동의해. 값은? 7만 원 걷었어.",
        "M: 그럼 하룻밤 7만 원이 한계네.",
        "W: 그럼 세 조건 다 맞는 건 하나뿐이야.",
        "M: 주말 자리가 차기 전에 예약하자.",
        "W: 오늘 밤에 공원 누리집에서 예약할게.",
        "M: 예약 번호 나오면 보내 줘.",
        "W: 그럴게. 보통 한 시간이면 메일로 와.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["M", "Hyewon, is the art room open after school on Friday?"],
        ["W", "It is, but only until five because of the staff meeting."],
        ["M", "I need about two hours for the mural."],
        ["W", "Then start at three. You'll have exactly two."],
      ],
      choices: [
        "The art room is never open.",
        "I'll start at three, then.",
        "I finished the mural already.",
        "Friday is a holiday.",
        "Two hours is far too long.",
      ],
      answer: 2,
      clue: "Then start at three. You'll have exactly two.",
      explanation:
        "여자가 3시에 시작하면 두 시간이 딱 나온다고 했으므로, 3시에 시작하겠다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 혜원아, 금요일 방과 후에 미술실 열어?",
        "W: 열어. 그런데 교직원 회의 때문에 5시까지만.",
        "M: 벽화에 두 시간쯤 필요한데.",
        "W: 그럼 3시에 시작해. 딱 두 시간 나와.",
        "M: 그럼 3시에 시작할게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["W", "Sangjun, my club application says it's under review."],
        ["M", "How long has it said that?"],
        ["W", "Eleven days. Everyone else got a reply in three."],
        ["M", "Then something's stuck. Email the club leader directly."],
      ],
      choices: [
        "My application was accepted.",
        "I'll email the leader today.",
        "There is no club leader.",
        "Eleven days is normal.",
        "I'll apply to a different club.",
      ],
      answer: 2,
      clue: "Then something's stuck. Email the club leader directly.",
      explanation:
        "남자가 동아리 대표에게 직접 메일을 보내라고 했으므로, 오늘 메일을 보내겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 상준아, 내 동아리 신청이 계속 검토 중이라고 떠.",
        "M: 며칠째 그래?",
        "W: 11일째. 다른 애들은 3일 만에 답을 받았어.",
        "M: 그럼 어디 걸린 거야. 동아리 대표한테 직접 메일 보내.",
        "W: 오늘 대표한테 메일 보낼게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Sangjun, you've been carrying the group's slides alone again."],
        ["M", "It's quicker than explaining the template to four people."],
        ["W", "Quicker this week. What about the presentation itself?"],
        ["M", "I'll present. I made them, so I know what's on each one."],
        ["W", "And the other four stand there saying nothing."],
        ["M", "Better than someone freezing on a slide they didn't write."],
        ["W", "They didn't write any, because you finished them all first."],
        ["M", "That's a fair point I hadn't considered."],
        ["W", "The teacher grades each member's speaking separately."],
        ["M", "Then they'd all lose those marks because of me."],
        ["W", "Give each of them one slide tonight and walk them through it."],
      ],
      choices: [
        "I'll hand out one slide each tonight.",
        "I'll present the whole thing myself.",
        "There are no slides in this project.",
        "They already know every slide.",
        "I'll ask to change groups.",
      ],
      answer: 1,
      clue: "Give each of them one slide tonight and walk them through it.",
      explanation:
        "여자가 오늘 밤 한 사람에게 한 장씩 맡기고 설명해 주라고 했으므로, 한 장씩 나눠 주겠다는 ①이 가장 자연스럽다.",
      translation: [
        "W: 상준아, 또 모둠 발표 자료를 혼자 떠맡고 있네.",
        "M: 네 명한테 틀을 설명하는 것보다 빨라서.",
        "W: 이번 주만 빠르지. 발표는 어떡할 건데?",
        "M: 내가 하지. 내가 만들었으니 어느 장에 뭐가 있는지 알잖아.",
        "W: 그럼 나머지 넷은 아무 말 없이 서 있겠네.",
        "M: 자기가 안 쓴 장에서 얼어붙는 것보다는 낫잖아.",
        "W: 아무도 안 쓴 건 네가 먼저 다 끝냈기 때문이야.",
        "M: 생각 못 한 부분인데 맞는 말이야.",
        "W: 선생님은 사람마다 발표를 따로 점수 매기셔.",
        "M: 그럼 나 때문에 다들 그 점수를 잃는 거네.",
        "W: 오늘 밤에 한 사람에게 한 장씩 맡기고 설명해 줘.",
        "M: 오늘 밤에 한 장씩 나눠 줄게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Hyewon, you've been checking the class chat every few minutes."],
        ["W", "I don't want to miss anything about the assignment."],
        ["M", "How many of the last hundred messages were about the assignment?"],
        ["W", "Maybe four. The rest was everything else."],
        ["M", "So you're reading a hundred to find four."],
        ["W", "When you count it, that sounds terrible."],
        ["M", "And each check costs you a few minutes of focus."],
        ["W", "I know. But if I mute it I'll miss the four."],
        ["M", "Not if you read the whole thing once, at a set time."],
        ["W", "So mute it and check at, say, nine?"],
        ["M", "Yes. Mute it and read the day's messages at nine."],
      ],
      choices: [
        "I'll mute it and check at nine.",
        "I'll keep checking every few minutes.",
        "Nobody uses the class chat.",
        "I'll leave the chat completely.",
        "All hundred messages matter.",
      ],
      answer: 1,
      clue: "Yes. Mute it and read the day's messages at nine.",
      explanation:
        "남자가 알림을 끄고 9시에 그날 메시지를 몰아 읽으라고 했으므로, 그렇게 하겠다는 ①이 가장 자연스럽다.",
      translation: [
        "M: 혜원아, 너 몇 분마다 학급 대화방을 확인하더라.",
        "W: 과제 이야기를 놓칠까 봐.",
        "M: 최근 메시지 백 개 중에 과제 이야기가 몇 개였어?",
        "W: 네 개쯤. 나머지는 다른 이야기였어.",
        "M: 그럼 네 개를 찾으려고 백 개를 읽는 거네.",
        "W: 세어 보니 끔찍하게 들린다.",
        "M: 게다가 확인할 때마다 집중이 몇 분씩 깨지고.",
        "W: 알아. 그런데 알림을 끄면 그 네 개를 놓칠 것 같아.",
        "M: 정해진 시각에 한 번 전부 읽으면 안 놓쳐.",
        "W: 그럼 끄고 9시쯤에 확인하라는 거야?",
        "M: 응. 알림을 끄고 9시에 그날 메시지를 읽어.",
        "W: 알림 끄고 9시에 확인할게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Hajun이 Mira에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Hajun : ________________",
      lines: [
        [
          "M",
          "Hajun and Mira are preparing the class recycling report, which is due on Monday. " +
            "Mira has collected two months of weighing data and typed it all into a long table. " +
            "The numbers are correct and the table is neat. " +
            "On Friday Hajun reads it through and realises that the table alone " +
            "does not show the one thing the class was trying to prove, " +
            "which is that the paper bin fills twice as fast since the printer moved upstairs. " +
            "A reader would have to compare thirty rows by eye to see it. " +
            "The same numbers drawn as a simple line graph would show it at a glance, " +
            "and Mira already has the data in a spreadsheet, so it takes minutes. " +
            "He wants to tell her to turn the table into one line graph. " +
            "In this situation, what would Hajun most likely say to Mira?",
        ],
      ],
      choices: [
        "We should weigh everything again next month.",
        "Let's remove the paper bin data entirely.",
        "Let's turn that table into one line graph.",
        "We should submit the report on Tuesday.",
        "Let's add thirty more rows to the table.",
      ],
      answer: 3,
      clue: "He wants to tell her to turn the table into one line graph.",
      explanation:
        "하준이는 표를 꺾은선 그래프 하나로 바꾸자고 말하려 하므로 ③이 가장 적절하다.",
      translation: [
        "M: 하준이와 미라는 월요일이 마감인 학급 재활용 보고서를 준비하고 있습니다. 미라는 두 달치 무게 자료를 모아 긴 표로 다 입력했습니다. 숫자는 정확하고 표도 깔끔합니다. 금요일에 하준이는 그것을 쭉 읽다가, 표만으로는 학급이 증명하려던 한 가지가 드러나지 않는다는 것을 깨닫습니다. 그것은 인쇄기가 위층으로 옮겨진 뒤로 종이 수거함이 두 배 빨리 찬다는 사실입니다. 읽는 사람이 그것을 보려면 서른 줄을 눈으로 견줘야 합니다. 같은 숫자를 간단한 꺾은선 그래프로 그리면 한눈에 보이고, 미라에게는 이미 표 계산 파일이 있어서 몇 분이면 됩니다. 하준이는 표를 꺾은선 그래프 하나로 바꾸자고 말하고 싶습니다. 이런 상황에서 하준이가 미라에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 여자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "Hello, everyone. Today I want to talk about why a spoon feels colder than a wooden table " +
            "even though both are sitting in the same room. " +
            "Put a thermometer on each and it reads the same number. " +
            "The difference is not temperature. It is how fast each one takes heat from your hand. " +
            "Metal moves heat quickly, so the moment you touch the spoon " +
            "it pulls warmth out of your skin and your nerves report cold. " +
            "Wood moves heat slowly. The surface you touch warms up almost immediately " +
            "and stops taking anything more, so it feels neutral. " +
            "Your skin has no way to measure temperature directly. " +
            "It can only measure heat leaving or arriving, " +
            "which is why the same room can feel like two different rooms to your hand.",
        ],
      ],
      choices: [
        "why metal feels colder than wood at the same temperature",
        "how thermometers measure room temperature",
        "why wooden furniture lasts longer than metal",
        "how heat moves through the air in a room",
        "why our hands are more sensitive than our feet",
      ],
      answer: 1,
      clue: "It is how fast each one takes heat from your hand.",
      explanation:
        "여자는 피부가 온도가 아니라 열이 빠져나가는 속도를 느낀다며, 그래서 금속이 나무보다 차갑게 느껴진다고 설명한다. 따라서 답은 ①이다.",
      translation: [
        "W: 안녕하세요, 여러분. 오늘은 같은 방에 놓여 있는데도 숟가락이 나무 탁자보다 왜 더 차갑게 느껴지는지 이야기하려 합니다. 각각에 온도계를 대면 같은 숫자가 나옵니다. 차이는 온도가 아닙니다. 각각이 여러분 손에서 열을 얼마나 빨리 가져가느냐입니다. 금속은 열을 빠르게 옮깁니다. 그래서 숟가락에 닿는 순간 피부에서 온기를 빼앗아 가고, 신경은 차갑다고 보고합니다. 나무는 열을 천천히 옮깁니다. 손이 닿는 표면이 거의 곧바로 데워져서 더 가져가기를 멈추고, 그래서 아무 느낌이 없습니다. 피부에는 온도를 직접 재는 방법이 없습니다. 열이 나가는지 들어오는지만 잴 수 있습니다. 그래서 같은 방이 손에는 서로 다른 두 방처럼 느껴질 수 있는 것입니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 내용이 아닌 것은?",
      lines: [
        ["W", "Hello, everyone. Today I want to talk about why a spoon feels colder than a wooden table even though both are sitting in the same room."],
        ["W", "Put a thermometer on each and it reads the same number."],
        ["W", "Metal moves heat quickly, so the moment you touch the spoon it pulls warmth out of your skin."],
        ["W", "Wood moves heat slowly. The surface you touch warms up almost immediately and stops taking anything more."],
        ["W", "Your skin has no way to measure temperature directly."],
        ["W", "It can only measure heat leaving or arriving."],
      ],
      choices: [
        "a thermometer reading the same on both",
        "metal pulling warmth out of the skin",
        "a wooden surface warming up quickly",
        "skin measuring heat leaving or arriving",
        "cold air sinking to the floor of a room",
      ],
      answer: 5,
      clue: "Put a thermometer on each and it reads the same number.",
      explanation:
        "온도계가 둘 다 같은 숫자를 가리키는 것, 금속이 피부에서 온기를 빼앗는 것, 나무 표면이 금방 데워지는 것, 피부가 열의 출입만 잰다는 것은 언급되지만 찬 공기가 바닥으로 가라앉는다는 것은 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
