/** 고1 듣기 30회 — 사람이 직접 쓴 회차 (2026-09-25) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고1 30회",
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
          "Good afternoon, everyone. This is Ms. Uhm from the school kitchen. " +
            "I want to talk about the lunch trays. " +
            "We have six hundred trays, and by the end of last term we had four hundred. " +
            "They are not broken. They are in club rooms, in lockers and under desks, " +
            "used for carrying paint and tools and everything else. " +
            "So from Monday there will be a return box outside the cafeteria door. " +
            "Bring any tray you have and put it in. Nobody will ask whose it was. " +
            "If we get back what we are missing, nothing else changes. " +
            "If we do not, we will have to serve lunch in two sittings. Thank you.",
        ],
      ],
      choices: [
        "급식 시간 변경을 알리려고",
        "급식비 인상을 알리려고",
        "급식판을 돌려 달라고 부탁하려고",
        "식단표 변경을 안내하려고",
        "동아리방 점검을 알리려고",
      ],
      answer: 3,
      clue: "Bring any tray you have and put it in. Nobody will ask whose it was.",
      explanation:
        "여자는 급식판이 줄어들었다며 월요일부터 반납함에 갖고 있는 급식판을 넣어 달라고 부탁한다. 따라서 답은 ③이다.",
      translation: [
        "W: 여러분, 안녕하세요. 급식실 엄입니다. 급식판 이야기를 하려고 합니다. 급식판이 육백 개 있었는데 지난 학기 말에는 사백 개였습니다. 깨진 것이 아닙니다. 동아리방에, 사물함에, 책상 밑에 있습니다. 물감이나 공구를 나르는 데 쓰이고 있지요. 그래서 월요일부터 급식실 문 밖에 반납함을 둡니다. 갖고 있는 급식판을 가져와 넣어 주세요. 누구 것이었는지는 아무도 묻지 않습니다. 없어진 만큼 돌아오면 그 밖에 달라지는 것은 없습니다. 돌아오지 않으면 점심을 두 번에 나눠 배식해야 합니다. 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 남자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Junseok, I've been copying the model answers into my notebook."],
        ["M", "All of them? How long does that take?"],
        ["W", "An hour a night. The notebook looks very complete."],
        ["M", "Complete with whose reasoning, though?"],
        ["W", "The examiner's, I suppose. That's the point."],
        ["M", "So the page holds a path you never walked."],
        ["W", "But I understand it while I'm copying."],
        ["M", "Following is easier than finding, and it feels the same at the time."],
        ["W", "Then how would I tell the difference?"],
        ["M", "Close the answer and rebuild it. The gaps show up immediately."],
        ["W", "That would be slower than copying."],
        ["M", "Much slower, and it would be yours at the end."],
      ],
      choices: [
        "모범 답안은 베끼기보다 스스로 재구성해야 한다",
        "모범 답안을 많이 읽어야 한다",
        "필기는 손으로 해야 한다",
        "오답 노트를 만들어야 한다",
        "공부는 매일 같은 시간에 해야 한다",
      ],
      answer: 1,
      clue: "Close the answer and rebuild it. The gaps show up immediately.",
      explanation:
        "남자는 베끼면 걷지 않은 길이 종이에 남을 뿐이라며, 답을 덮고 다시 세워 보라고 말한다. 따라서 답은 ①이다.",
      translation: [
        "W: 준석아, 나 모범 답안을 공책에 옮겨 적고 있어.",
        "M: 전부? 얼마나 걸려?",
        "W: 하룻밤에 한 시간. 공책이 아주 알차 보여.",
        "M: 누구의 추론으로 알찬 건데?",
        "W: 출제자의 거겠지. 그게 목적이니까.",
        "M: 그럼 그 쪽에는 네가 걷지 않은 길이 담겨 있는 거네.",
        "W: 그래도 옮겨 적는 동안엔 이해해.",
        "M: 따라가는 건 찾아내는 것보다 쉬워. 그 순간엔 똑같이 느껴지고.",
        "W: 그럼 어떻게 구분해?",
        "M: 답을 덮고 다시 세워 봐. 빈 곳이 바로 드러나.",
        "W: 베끼는 것보다 느릴 텐데.",
        "M: 훨씬 느리지. 그리고 끝에는 네 것이 남아.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "There is a habit that makes a group meeting twice as long as it needs to be, " +
            "and almost nobody notices it. " +
            "Someone raises a problem, and the first person to speak offers a solution. " +
            "The second person defends a different solution. " +
            "Within a minute the room is comparing two answers " +
            "and has never agreed on what the problem was. " +
            "Everyone assumes they are arguing about the fix, " +
            "when they are actually holding different pictures of the fault. " +
            "The way out is unglamorous and very fast. " +
            "Before anyone proposes anything, have one person say the problem in a sentence, " +
            "and have somebody else repeat it back.",
        ],
      ],
      choices: [
        "회의는 짧게 해야 한다",
        "의견은 돌아가며 말해야 한다",
        "결정은 표결로 해야 한다",
        "해결책보다 문제를 먼저 합의해야 한다",
        "회의록을 남겨야 한다",
      ],
      answer: 4,
      clue: "Before anyone proposes anything, have one person say the problem in a sentence, and have somebody else repeat it back.",
      explanation:
        "여자는 사람들이 서로 다른 문제 그림을 들고 해결책을 다툰다며, 먼저 문제를 한 문장으로 확인하라고 말한다. 따라서 답은 ④이다.",
      translation: [
        "W: 모임 회의를 필요한 시간의 두 배로 늘리는 습관이 하나 있는데, 거의 아무도 알아채지 못합니다. 누군가 문제를 꺼내면, 처음 말하는 사람이 해결책을 내놓습니다. 두 번째 사람은 다른 해결책을 옹호합니다. 1분 만에 그 방은 두 가지 답을 견주고 있고, 문제가 무엇이었는지는 한 번도 합의한 적이 없습니다. 모두가 고치는 방법을 두고 다툰다고 여기지만, 사실은 서로 다른 고장의 그림을 들고 있는 것입니다. 빠져나오는 길은 멋없고 아주 빠릅니다. 누구도 제안하기 전에, 한 사람이 문제를 한 문장으로 말하게 하고, 다른 사람이 그것을 되풀이해 말하게 하세요.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["M", "Dain, is this the corner you set up for the baking club?"],
        ["W", "Yes, we finished it before the term started."],
        ["M", "There's a stand mixer at the left end of the counter."],
        ["W", "It came from a parent who was moving house."],
        ["M", "And a rack of spice jars hangs on the wall."],
        ["W", "We labelled every one of them twice."],
        ["M", "I count three mixing bowls on the counter."],
        ["W", "There are four. One is behind the mixer."],
        ["M", "The apron on the hook looks new."],
        ["W", "We bought six of those in March."],
        ["M", "And a bin of flour sits under the counter."],
        ["W", "It holds enough for about two months."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "There are four. One is behind the mixer.",
      explanation:
        "남자가 볼이 세 개라고 하자 여자가 네 개라고 바로잡는다. 그림에는 세 개가 그려져 있으므로 답은 ③이다.",
      figure: {
        kind: "scene",
        scene:
          "A baking club counter drawn as one wide picture, clean black line art on white, no writing or letters or numbers anywhere. " +
          "A STAND MIXER stands at the left end of the counter. " +
          "A WALL RACK holding small spice jars hangs on the wall above the counter. " +
          "EXACTLY THREE MIXING BOWLS stand on the counter, spaced well apart so all three are easy to count and none overlap. " +
          "An APRON hangs on a hook on the wall. " +
          "A LIDDED FLOUR BIN sits on the floor under the counter.",
      },
      translation: [
        "M: 다인아, 이게 제과 동아리로 꾸민 구석이야?",
        "W: 응, 학기 시작 전에 다 끝냈어.",
        "M: 조리대 왼쪽 끝에 반죽기가 있네.",
        "W: 이사 가시는 학부모님이 주셨어.",
        "M: 그리고 벽에 향신료 병 선반이 걸려 있어.",
        "W: 하나하나 이름표를 두 번씩 붙였어.",
        "M: 조리대에 볼이 세 개 보여.",
        "W: 네 개야. 하나는 반죽기 뒤에 있어.",
        "M: 고리에 걸린 앞치마는 새것 같네.",
        "W: 3월에 여섯 장 샀어.",
        "M: 그리고 조리대 밑에 밀가루 통이 있어.",
        "W: 두 달쯤 쓸 양이 들어가.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 여자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Dain, the class debate starts at two in the seminar room."],
        ["W", "I know. Are the desks arranged for two teams?"],
        ["M", "Six and six, facing each other. Done at lunch."],
        ["W", "Good. And the judging sheets?"],
        ["M", "Printed and on the front desk, one for each of the three judges."],
        ["W", "Then what's still open?"],
        ["M", "The timer from the science room hasn't been collected."],
        ["W", "Can't we use a phone?"],
        ["M", "The rules say a visible clock, big enough for both teams."],
        ["W", "Who has the science room key?"],
        ["M", "Mr. No, until half past one. But I'm briefing the judges at one."],
        ["W", "Then I'll fetch the timer from the science room."],
      ],
      choices: [
        "책상 배치하기",
        "심사표 인쇄하기",
        "심사위원에게 설명하기",
        "세미나실 청소하기",
        "시계 가져오기",
      ],
      answer: 5,
      clue: "Then I'll fetch the timer from the science room.",
      explanation:
        "책상과 심사표는 끝났고 남자는 심사위원에게 설명해야 하므로, 여자가 과학실에서 시계를 가져오기로 한다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 다인아, 학급 토론이 2시에 세미나실에서 시작해.",
        "W: 알아. 책상은 두 팀에 맞게 놨어?",
        "M: 여섯 대 여섯으로 마주 보게. 점심때 끝냈어.",
        "W: 좋아. 심사표는?",
        "M: 인쇄해서 앞 책상에 뒀어. 심사위원 세 분께 한 장씩.",
        "W: 그럼 아직 남은 게 뭐야?",
        "M: 과학실 시계를 아직 안 가져왔어.",
        "W: 휴대폰으로 하면 안 돼?",
        "M: 규정에 두 팀이 다 볼 수 있는 큰 시계여야 한대.",
        "W: 과학실 열쇠는 누가 갖고 있어?",
        "M: 노 선생님이 1시 30분까지. 그런데 나는 1시에 심사위원께 설명해야 해.",
        "W: 그럼 내가 과학실에서 시계 가져올게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 남자가 지불할 금액을 고르시오.",
      lines: [
        ["W", "Welcome to Larch Sports. What can I get you?"],
        ["M", "Five basketballs and two ball pumps, please."],
        ["W", "Basketballs are twenty-four dollars each and pumps are fifteen."],
        ["M", "So one hundred and twenty plus thirty."],
        ["W", "One hundred and fifty in total. Would you like the mesh bags?"],
        ["M", "How much are those?"],
        ["W", "Eleven dollars each, and you'd want two."],
        ["M", "We'll skip the bags. The gym has a cage."],
        ["W", "No problem. Are you with a school team?"],
        ["M", "We are. Here's the team card."],
        ["W", "Then I can take twenty percent off the basketballs, but not the pumps."],
        ["M", "Thank you. I'll pay by card."],
      ],
      choices: ["$96.00", "$120.00", "$126.00", "$150.00", "$172.00"],
      answer: 3,
      clue: "Then I can take twenty percent off the basketballs, but not the pumps.",
      explanation:
        "농구공 5개 120달러에서 20퍼센트를 빼면 96달러이고, 할인이 안 되는 펌프 2개 30달러를 더하면 126달러이다. 따라서 답은 ③이다.",
      translation: [
        "W: 라치 스포츠입니다. 무엇을 드릴까요?",
        "M: 농구공 다섯 개랑 공 펌프 두 개 주세요.",
        "W: 농구공은 하나에 24달러, 펌프는 15달러입니다.",
        "M: 그럼 120달러에 30달러네요.",
        "W: 모두 150달러입니다. 그물 가방도 하시겠어요?",
        "M: 그건 얼마예요?",
        "W: 하나에 11달러인데, 두 개는 필요하실 거예요.",
        "M: 가방은 뺄게요. 체육관에 보관함이 있어요.",
        "W: 괜찮습니다. 학교 팀이세요?",
        "M: 네. 여기 팀 카드요.",
        "W: 그럼 농구공에서 20퍼센트를 빼 드립니다. 펌프는 안 돼요.",
        "M: 감사합니다. 카드로 낼게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 남자가 합창 대회에 나가지 않는 이유를 고르시오.",
      lines: [
        ["W", "Junseok, you're not in the choir for the contest."],
        ["M", "I pulled out at the start of the month."],
        ["W", "Is your voice still rough from the cold?"],
        ["M", "That was over in two weeks."],
        ["W", "Then is it the rehearsal load? It's four afternoons now."],
        ["M", "Four afternoons I could manage."],
        ["W", "So what happened?"],
        ["M", "The contest is the same weekend as my brother's wedding."],
        ["W", "Oh. And it's out of town?"],
        ["M", "Three hours away, and we go down on the Friday."],
      ],
      choices: [
        "형 결혼식과 겹쳐서",
        "목이 아파서",
        "연습이 너무 많아서",
        "성적이 떨어져서",
        "아르바이트가 있어서",
      ],
      answer: 1,
      clue: "The contest is the same weekend as my brother's wedding.",
      explanation:
        "목도 나았고 연습량도 감당할 수 있지만, 대회 주말이 형 결혼식과 겹치고 멀리 가야 하기 때문이다. 따라서 답은 ①이다.",
      translation: [
        "W: 준석아, 대회 합창단에 네가 없네.",
        "M: 이달 초에 빠졌어.",
        "W: 감기 때문에 목이 아직 거칠어?",
        "M: 그건 2주 만에 끝났어.",
        "W: 그럼 연습량 때문이야? 이제 오후 네 번이잖아.",
        "M: 오후 네 번은 할 수 있었어.",
        "W: 그럼 무슨 일인데?",
        "M: 대회 주말이 형 결혼식이랑 같아.",
        "W: 아. 다른 지역이야?",
        "M: 세 시간 거리야. 금요일에 내려가.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, Hillcrest Star Night에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["W", "Junseok, have you heard about Hillcrest Star Night?"],
        ["M", "I saw the poster. When is it?"],
        ["W", "The last Saturday of October, from eight until midnight."],
        ["M", "Four hours. Where does it take place?"],
        ["W", "On the playing field behind the science building."],
        ["M", "I know that field. What happens there?"],
        ["W", "Telescopes set up by the astronomy club, and a short talk at nine."],
        ["M", "That sounds good. Do we need to bring anything?"],
        ["W", "A blanket and something warm. The field gets cold fast."],
        ["M", "Is there a fee?"],
        ["W", "It's free, but you have to sign up because of the numbers."],
        ["M", "Then let's sign up tonight."],
      ],
      choices: ["열리는 날", "열리는 장소", "행사 내용", "주차 안내", "준비물"],
      answer: 4,
      clue: "주차 안내는 대화에서 언급되지 않았다.",
      explanation:
        "날짜(10월 마지막 토요일), 장소(과학관 뒤 운동장), 행사 내용(망원경과 짧은 강연), 준비물(담요와 따뜻한 옷)은 언급되지만 주차 안내는 언급되지 않았다. 따라서 답은 ④이다.",
      translation: [
        "W: 준석아, 힐크레스트 별 보기의 밤 들어 봤어?",
        "M: 포스터 봤어. 언제야?",
        "W: 10월 마지막 토요일, 8시부터 자정까지.",
        "M: 네 시간이구나. 어디서 해?",
        "W: 과학관 뒤 운동장에서.",
        "M: 그 운동장 알아. 뭘 하는데?",
        "W: 천문 동아리가 망원경을 설치하고, 9시에 짧은 강연이 있어.",
        "M: 좋은데. 뭘 가져가야 해?",
        "W: 담요랑 따뜻한 옷. 운동장이 금방 추워져.",
        "M: 참가비 있어?",
        "W: 무료야. 그런데 인원 때문에 신청은 해야 해.",
        "M: 그럼 오늘 밤에 신청하자.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Bramble Hill Farm Shop에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "M",
          "Let me tell you about the Bramble Hill Farm Shop. " +
            "It has been run by the same family since 1976, on the road out past the reservoir. " +
            "The shop opens Thursday to Sunday, from nine in the morning until five. " +
            "Everything sold there is grown or made within twenty kilometers. " +
            "There is a small cafe at the back, open on the same days as the shop. " +
            "Dogs are welcome in the yard but not inside the building. " +
            "The shop closes for the whole of January every year.",
        ],
      ],
      choices: [
        "1976년부터 한 가족이 운영해 왔다",
        "개를 건물 안에 데려갈 수 있다",
        "목요일부터 일요일까지 연다",
        "파는 것이 모두 근처에서 난 것이다",
        "1월에는 한 달 내내 닫는다",
      ],
      answer: 2,
      clue: "Dogs are welcome in the yard but not inside the building.",
      explanation:
        "개는 마당에는 되지만 건물 안에는 안 된다고 했으므로 ②는 내용과 다르다. 따라서 답은 ②이다.",
      translation: [
        "M: 브램블힐 농장 가게를 소개해 드리겠습니다. 저수지를 지나 난 길가에서 1976년부터 같은 가족이 운영해 왔습니다. 가게는 목요일부터 일요일까지, 아침 9시부터 5시까지 엽니다. 거기서 파는 것은 전부 20킬로미터 안에서 기르거나 만든 것입니다. 뒤쪽에 작은 찻집이 있고 가게와 같은 날에 엽니다. 개는 마당에는 데려올 수 있지만 건물 안에는 들어갈 수 없습니다. 가게는 해마다 1월 한 달 내내 닫습니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 구입할 자전거 자물쇠를 고르시오.",
      lines: [
        ["W", "Junseok, let's buy a lock for the club's shared bike."],
        ["M", "Five models here. Should it be a U-lock or a chain?"],
        ["W", "A U-lock. Chains get cut in about a minute."],
        ["M", "Agreed. Does it need a mounting bracket?"],
        ["W", "Yes. Without one it lives in someone's bag and gets forgotten."],
        ["M", "Right. And the price? The club left us fifty thousand won."],
        ["W", "So fifty thousand is the ceiling."],
        ["M", "Then only one model clears all three."],
        ["W", "Let's order before the fund closes on Friday."],
        ["M", "I'll place it tonight and send the receipt."],
        ["W", "Thanks. I'll tell the others where the key will be kept."],
        ["M", "Good idea. It should arrive by Tuesday."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 5,
      clue: "A U-lock. Chains get cut in about a minute.",
      explanation:
        "U자형이고, 거치대가 딸려 있으며, 5만 원 이하인 것을 고른다. 세 조건을 모두 채우는 것은 ⑤이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Type: Chain / Bracket: Yes / Price: 25,000 won" },
          { no: 2, label: "②", value: "Type: U-lock / Bracket: No / Price: 32,000 won" },
          { no: 3, label: "③", value: "Type: U-lock / Bracket: Yes / Price: 78,000 won" },
          { no: 4, label: "④", value: "Type: Chain / Bracket: No / Price: 18,000 won" },
          { no: 5, label: "⑤", value: "Type: U-lock / Bracket: Yes / Price: 46,000 won" },
        ],
      },
      translation: [
        "W: 준석아, 동아리 공용 자전거에 쓸 자물쇠 사자.",
        "M: 다섯 종류 있네. U자형으로 할까, 체인으로 할까?",
        "W: U자형. 체인은 1분이면 잘려.",
        "M: 동의해. 거치대가 있어야 할까?",
        "W: 응. 없으면 누구 가방 속에 들어가서 잊혀.",
        "M: 맞아. 값은? 동아리에서 5만 원 남겨 줬어.",
        "W: 그럼 5만 원이 한계네.",
        "M: 그럼 세 조건 다 넘는 건 하나뿐이야.",
        "W: 금요일에 예산 마감이니까 그전에 주문하자.",
        "M: 오늘 밤에 주문하고 영수증 보낼게.",
        "W: 고마워. 나는 열쇠를 어디 둘지 다른 사람들한테 알릴게.",
        "M: 좋은 생각이야. 화요일까지는 올 거야.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["W", "Junseok, is the gym open for practice on Sunday?"],
        ["M", "It is, but only the small court. The main one is being resurfaced."],
        ["W", "The small court is too short for our drills."],
        ["M", "Then use the outdoor court. It's the full size and it's free on Sunday."],
      ],
      choices: [
        "The gym is closed on Sundays.",
        "We don't practise on Sundays.",
        "I'll use the outdoor court.",
        "The small court is big enough.",
        "I'll wait for the resurfacing.",
      ],
      answer: 3,
      clue: "Then use the outdoor court. It's the full size and it's free on Sunday.",
      explanation:
        "남자가 야외 코트를 쓰라고 했으므로, 야외 코트를 쓰겠다는 ③이 가장 자연스럽다.",
      translation: [
        "W: 준석아, 일요일에 연습하러 체육관 열어?",
        "M: 열어. 그런데 작은 코트만. 큰 코트는 바닥 공사 중이야.",
        "W: 작은 코트는 우리 훈련에 너무 짧아.",
        "M: 그럼 야외 코트를 써. 정규 크기고 일요일엔 비어.",
        "W: 야외 코트 쓸게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["M", "Dain, my library account says I can't borrow anything."],
        ["W", "Do you have an overdue book?"],
        ["M", "Not that I know of. I returned everything in October."],
        ["W", "Check the drop box list. Returns there take a day to register."],
      ],
      choices: [
        "I'll check the drop box list.",
        "My account is working fine.",
        "I never borrow books.",
        "There is no drop box.",
        "I returned nothing in October.",
      ],
      answer: 1,
      clue: "Check the drop box list. Returns there take a day to register.",
      explanation:
        "여자가 반납함 목록을 확인해 보라고 했으므로, 그 목록을 보겠다는 ①이 가장 자연스럽다.",
      translation: [
        "M: 다인아, 내 도서관 계정이 대출이 안 된대.",
        "W: 연체된 책 있어?",
        "M: 내가 아는 한 없어. 10월에 다 반납했어.",
        "W: 반납함 목록을 확인해 봐. 거기 넣은 건 등록되는 데 하루 걸려.",
        "M: 반납함 목록 확인할게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Dain, you've turned down three offers to lead the study group."],
        ["W", "I'd be bad at it. I'm not the best student in there."],
        ["M", "Is the leader supposed to be the best student?"],
        ["W", "I assumed so. Otherwise why would they listen?"],
        ["M", "What does the leader actually do at those meetings?"],
        ["W", "Decides what we cover and keeps us to the time."],
        ["M", "Neither of those needs the best student in the room."],
        ["W", "Said aloud, that's obviously true."],
        ["M", "And you're the only one who brings a plan every week."],
        ["W", "I do that anyway, without the title."],
        ["M", "Then take the title and keep doing what you already do."],
      ],
      choices: [
        "I'll leave the study group.",
        "I'm the best student in the group.",
        "I never bring a plan.",
        "I'll say yes at the next meeting.",
        "The leader must know everything.",
      ],
      answer: 4,
      clue: "Then take the title and keep doing what you already do.",
      explanation:
        "남자가 이미 하는 일을 그대로 하면서 자리를 맡으라고 했으므로, 다음 모임에서 맡겠다는 ④가 가장 자연스럽다.",
      translation: [
        "M: 다인아, 스터디 모임을 이끌어 달라는 제안을 세 번이나 거절했더라.",
        "W: 내가 하면 못할 거야. 거기서 제일 잘하는 학생도 아니고.",
        "M: 이끄는 사람이 제일 잘하는 학생이어야 해?",
        "W: 그런 줄 알았어. 아니면 왜 듣겠어?",
        "M: 그 모임에서 이끄는 사람이 실제로 뭘 해?",
        "W: 뭘 볼지 정하고 시간을 지키게 하지.",
        "M: 둘 다 그 방에서 제일 잘하는 학생이 필요한 일이 아니야.",
        "W: 소리 내어 말하니 당연한 소리네.",
        "M: 그리고 매주 계획을 들고 오는 사람은 너뿐이야.",
        "W: 직함 없이도 어차피 하고 있어.",
        "M: 그럼 직함을 맡고 지금 하는 걸 그대로 해.",
        "W: 다음 모임에서 하겠다고 할게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Junseok, you've been doing your homework on the bus every morning."],
        ["M", "It's twenty minutes I'd otherwise waste."],
        ["W", "How does the work come out?"],
        ["M", "Messy. The teacher says she can't read half of it."],
        ["W", "So the twenty minutes produce work that has to be redone."],
        ["M", "I rewrite it at lunch, usually."],
        ["W", "Which is another twenty minutes, plus the first twenty."],
        ["M", "Put that way, the bus is costing me time."],
        ["W", "It is. Could you read on the bus instead?"],
        ["M", "Reading I can do anywhere."],
        ["W", "Then read on the bus and write at your desk."],
      ],
      choices: [
        "I'll keep writing on the bus.",
        "I'll read on the bus from tomorrow.",
        "My handwriting is always neat.",
        "I never do homework at all.",
        "I'll stop taking the bus.",
      ],
      answer: 2,
      clue: "Then read on the bus and write at your desk.",
      explanation:
        "여자가 버스에서는 읽고 쓰기는 책상에서 하라고 했으므로, 내일부터 버스에서 읽겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 준석아, 너 아침마다 버스에서 숙제하더라.",
        "M: 안 그러면 버리는 20분이니까.",
        "W: 그렇게 한 건 어떻게 나와?",
        "M: 엉망이야. 선생님이 절반은 못 읽겠다고 하셔.",
        "W: 그럼 그 20분이 다시 해야 할 숙제를 만드는 거네.",
        "M: 보통 점심때 다시 써.",
        "W: 그럼 또 20분이지. 앞의 20분까지 하면.",
        "M: 그렇게 보면 버스가 시간을 쓰게 하는 거네.",
        "W: 그렇지. 버스에서는 읽으면 안 돼?",
        "M: 읽는 건 어디서나 할 수 있지.",
        "W: 그럼 버스에서는 읽고 쓰기는 책상에서 해.",
        "M: 내일부터 버스에서 읽을게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Jiwoo가 Hyeonu에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Jiwoo : ________________",
      lines: [
        [
          "W",
          "Jiwoo and Hyeonu are preparing the club's display for the school open day. " +
            "Hyeonu has mounted forty photographs of the year's activities on three boards, " +
            "and the mounting is neat and the order makes sense. " +
            "On Thursday Jiwoo carries the boards into the room they have been given " +
            "and finds that the only free wall is beside a window " +
            "where afternoon sun falls directly on it for three hours. " +
            "The photographs are printed on ordinary paper and will fade in a single afternoon. " +
            "The opposite wall is shaded all day and is still empty, " +
            "and moving the hooks would take about twenty minutes. " +
            "She does not want the display remade, only hung on the other side. " +
            "She wants to tell him to hang the boards on the shaded wall instead. " +
            "In this situation, what would Jiwoo most likely say to Hyeonu?",
        ],
      ],
      choices: [
        "We should print all the photographs again.",
        "Let's take the display down after lunch.",
        "We should close the curtains all day.",
        "Let's add twenty more photographs.",
        "Let's hang the boards on the shaded wall.",
      ],
      answer: 5,
      clue: "She wants to tell him to hang the boards on the shaded wall instead.",
      explanation:
        "지우는 그늘진 벽에 판을 걸자고 말하려 하므로 ⑤가 가장 적절하다.",
      translation: [
        "W: 지우와 현우는 학교 공개의 날에 낼 동아리 전시를 준비하고 있습니다. 현우는 한 해 활동 사진 마흔 장을 판 세 개에 붙였고, 붙인 솜씨도 깔끔하고 순서도 말이 됩니다. 목요일에 지우는 그 판들을 배정받은 교실로 들고 갔다가, 비어 있는 벽이 창가뿐이고 거기에 오후 볕이 세 시간 동안 그대로 든다는 것을 알게 됩니다. 사진은 보통 종이에 인쇄한 것이라 오후 한나절이면 바랩니다. 맞은편 벽은 하루 종일 그늘이고 아직 비어 있으며, 걸이를 옮기는 데는 20분쯤이면 됩니다. 지우는 전시를 다시 만들기를 바라지 않고, 반대쪽에 걸기만을 바랍니다. 지우는 그늘진 벽에 판을 걸자고 말하고 싶습니다. 이런 상황에서 지우가 현우에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 남자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Hello, everyone. Today I want to talk about why a tall building sways " +
            "on a windy day, and why that is a feature rather than a fault. " +
            "A rigid tower would have to absorb the whole force of the wind " +
            "at the point where it meets the ground, " +
            "and the materials would crack long before the wind stopped. " +
            "A building that leans a little turns some of that force into motion " +
            "and releases it slowly as it returns. " +
            "Engineers design the sway deliberately, " +
            "usually about half a meter at the top of a two-hundred-meter tower. " +
            "Some buildings add a heavy weight near the roof " +
            "that swings against the motion and damps it further. " +
            "The tower that survives a storm is not the stiffest one. " +
            "It is the one that was allowed to move and then brought back.",
        ],
      ],
      choices: [
        "how skyscrapers are built from steel and glass",
        "why storms are stronger at higher altitudes",
        "why tall buildings are designed to sway in wind",
        "how engineers measure the height of a tower",
        "why windows break on windy days",
      ],
      answer: 3,
      clue: "The tower that survives a storm is not the stiffest one.",
      explanation:
        "남자는 건물이 흔들리도록 설계해 바람의 힘을 움직임으로 바꾼다고 설명한다. 따라서 답은 ③이다.",
      translation: [
        "M: 안녕하세요, 여러분. 오늘은 높은 건물이 바람 부는 날에 왜 흔들리는지, 그리고 그것이 왜 고장이 아니라 설계인지 이야기하려 합니다. 뻣뻣한 탑은 바람의 힘을 땅과 만나는 지점에서 통째로 받아 내야 하고, 바람이 멎기 훨씬 전에 재료가 갈라질 것입니다. 조금 기우는 건물은 그 힘의 일부를 움직임으로 바꾸고, 돌아오면서 천천히 풀어냅니다. 기술자들은 그 흔들림을 일부러 설계합니다. 보통 200미터 탑의 꼭대기에서 반 미터쯤입니다. 어떤 건물은 지붕 가까이에 무거운 추를 달아 움직임과 반대로 흔들리게 해 더 줄입니다. 폭풍을 견디는 탑은 가장 뻣뻣한 탑이 아닙니다. 움직여도 된다고 허락받았다가 다시 돌아온 탑입니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 내용이 아닌 것은?",
      lines: [
        ["M", "Hello, everyone. Today I want to talk about why a tall building sways on a windy day."],
        ["M", "A rigid tower would have to absorb the whole force of the wind at the point where it meets the ground."],
        ["M", "A building that leans a little turns some of that force into motion and releases it slowly as it returns."],
        ["M", "Engineers design the sway deliberately, usually about half a meter at the top of a two-hundred-meter tower."],
        ["M", "Some buildings add a heavy weight near the roof that swings against the motion and damps it further."],
        ["M", "The tower that survives a storm is not the stiffest one."],
      ],
      choices: [
        "deep foundations keeping a tower dry",
        "a rigid tower absorbing the whole force at the ground",
        "a leaning building turning force into motion",
        "a sway of about half a meter at the top",
        "a heavy weight near the roof damping the motion",
      ],
      answer: 1,
      clue: "A rigid tower would have to absorb the whole force of the wind at the point where it meets the ground.",
      explanation:
        "뻣뻣한 탑이 땅에서 힘을 다 받는다는 것, 기우는 건물이 힘을 움직임으로 바꾼다는 것, 꼭대기가 반 미터쯤 흔들린다는 것, 지붕 가까운 추가 움직임을 줄인다는 것은 언급되지만 깊은 기초가 탑을 마르게 한다는 것은 언급되지 않았다. 따라서 답은 ①이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
