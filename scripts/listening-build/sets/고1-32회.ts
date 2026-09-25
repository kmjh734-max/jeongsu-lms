/** 고1 듣기 32회 — 사람이 직접 쓴 회차 (2026-09-25) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고1 32회",
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
          "Good afternoon, students. This is the school librarian, Ms. Pak. " +
            "From next Monday the reading room will use a seat booking system. " +
            "There are ninety seats and about three hundred of you come during exam weeks, " +
            "so for the last two terms people have been holding seats with a bag and leaving for hours. " +
            "Starting Monday you will book a seat at the tablet by the door, " +
            "choosing a block of two hours. " +
            "If you are away from your seat for more than twenty minutes, the booking ends " +
            "and the seat goes back on the screen. " +
            "You may book again the moment your block finishes. " +
            "Nothing changes about the borrowing desk or the opening hours. " +
            "Please come a few minutes early on Monday. Thank you.",
        ],
      ],
      choices: [
        "급식 시간 변경을 알리려고",
        "도서관 좌석 예약제 시행을 안내하려고",
        "독서 대회 참가를 권유하려고",
        "도서 반납 연체를 알리려고",
        "도서관 공사 일정을 알리려고",
      ],
      answer: 2,
      clue: "From next Monday the reading room will use a seat booking system.",
      explanation:
        "여자는 다음 주 월요일부터 열람실에 좌석 예약제를 쓴다며 예약 방법과 자리를 비웠을 때의 규칙을 안내한다. 따라서 답은 ②이다.",
      translation: [
        "W: 학생 여러분, 안녕하세요. 학교 사서 박입니다. 다음 주 월요일부터 열람실은 좌석 예약제를 씁니다. 자리는 아흔 개인데 시험 기간에는 삼백 명쯤 오다 보니, 지난 두 학기 동안 가방으로 자리를 맡아 두고 몇 시간씩 비우는 일이 있었습니다. 월요일부터는 문 옆 태블릿에서 두 시간 단위로 자리를 예약합니다. 자리를 스무 분 넘게 비우면 예약이 끝나고 그 자리는 다시 화면에 올라갑니다. 예약한 시간이 끝나면 곧바로 다시 예약할 수 있습니다. 대출 창구와 여는 시간은 달라지지 않습니다. 월요일에는 몇 분 일찍 와 주세요. 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 여자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Sora, I've read my presentation through nine times."],
        ["W", "Read it, or said it?"],
        ["M", "Read it. In my head, at my desk."],
        ["W", "Then you've practiced reading, not presenting."],
        ["M", "It's the same words either way."],
        ["W", "Your mouth doesn't know that. Some sentences fall apart out loud."],
        ["M", "Like which ones?"],
        ["W", "The long ones you wrote to sound clever."],
        ["M", "I do have three of those."],
        ["W", "Say the whole thing out loud once and you'll find them in a minute."],
        ["M", "It feels strange talking to an empty room."],
        ["W", "Stranger than finding out in front of thirty people?"],
      ],
      choices: [
        "발표 자료를 많이 만들어야 한다",
        "발표는 통째로 외워야 한다",
        "청중과 눈을 맞춰야 한다",
        "발표 시간을 줄여야 한다",
        "발표 연습은 소리 내어 해 봐야 한다",
      ],
      answer: 5,
      clue: "Say the whole thing out loud once and you'll find them in a minute.",
      explanation:
        "여자는 눈으로 읽는 것은 발표 연습이 아니라며, 소리 내어 말해 봐야 무너지는 문장을 찾을 수 있다고 말한다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 소라야, 나 발표문 아홉 번 읽었어.",
        "W: 읽었어, 말했어?",
        "M: 읽었지. 책상에서 속으로.",
        "W: 그럼 읽기를 연습한 거지 발표를 연습한 게 아니야.",
        "M: 어차피 같은 말인데.",
        "W: 입은 그걸 몰라. 소리 내면 무너지는 문장이 있어.",
        "M: 예를 들면?",
        "W: 똑똑해 보이려고 길게 쓴 문장들.",
        "M: 그런 게 세 개 있긴 해.",
        "W: 한 번만 통째로 소리 내어 말해 보면 1분 만에 찾아.",
        "M: 빈방에 대고 말하는 게 어색해.",
        "W: 서른 명 앞에서 알게 되는 것보다 어색해?",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Most students take notes by copying, " +
            "and copying is the one method that teaches you nothing. " +
            "A hand that is busy matching the board word for word " +
            "leaves the understanding for later, " +
            "and later never comes with the lesson still in the room. " +
            "The alternative costs nothing extra. " +
            "Listen to the whole point, then write it down in your own words, " +
            "even clumsy ones. " +
            "If you cannot put it in your own words, you have just found out, " +
            "in the only minute when the teacher is still standing there to ask. " +
            "A page of your own sentences is shorter than a page of copied ones, " +
            "and it is the only page that will still make sense in November.",
        ],
      ],
      choices: [
        "필기는 많이 할수록 좋다",
        "수업이 끝나면 바로 복습해야 한다",
        "필기는 베껴 쓰기보다 자기 말로 바꿔 써야 한다",
        "색깔 펜을 나눠 써야 한다",
        "친구와 필기를 바꿔 봐야 한다",
      ],
      answer: 3,
      clue: "Listen to the whole point, then write it down in your own words.",
      explanation:
        "남자는 그대로 베껴 쓰면 이해가 뒤로 밀린다며, 자기 말로 바꿔 쓰면 모르는 것을 그 자리에서 알게 된다고 말한다. 따라서 답은 ③이다.",
      translation: [
        "M: 대부분의 학생은 베껴 쓰는 방식으로 필기를 하는데, 베껴 쓰기는 아무것도 가르쳐 주지 않는 유일한 방법입니다. 칠판을 한 글자씩 맞춰 쓰느라 바쁜 손은 이해를 나중으로 미루는데, 그 나중은 수업이 아직 교실에 있는 동안에는 오지 않습니다. 대안은 돈이 더 들지 않습니다. 한 덩어리를 끝까지 듣고, 서툴더라도 자기 말로 적으세요. 자기 말로 옮기지 못하겠다면, 바로 그 순간에 그것을 알게 된 것입니다. 선생님이 아직 거기 서 계셔서 물어볼 수 있는 유일한 1분에요. 자기 문장으로 쓴 한 쪽은 베껴 쓴 한 쪽보다 짧고, 11월에도 뜻이 통하는 쪽은 그쪽뿐입니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["M", "Chaerin, is this the art room you moved into?"],
        ["W", "Yes, we finished carrying everything over last week."],
        ["M", "There's a tall wooden easel at the left end."],
        ["W", "That one belonged to the teacher before me."],
        ["M", "And I count two stools in front of the easel."],
        ["W", "There are three. One is standing behind the easel."],
        ["M", "The wide window has its curtain tied back to one side."],
        ["W", "We keep it open all morning for the light."],
        ["M", "And there's a paint trolley on wheels next to the stools."],
        ["W", "It rolls, so we push it to whoever is working."],
        ["M", "And a framed picture of a sailboat hangs on the right wall."],
        ["W", "A student painted it three years ago."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 2,
      clue: "There are three. One is standing behind the easel.",
      explanation:
        "남자가 의자가 두 개라고 하자 여자가 세 개라고 바로잡는다. 그림에는 두 개가 그려져 있으므로 답은 ②이다.",
      figure: {
        kind: "scene",
        scene:
          "An art room corner drawn as one wide picture, clean black line art on white, no writing or letters or numbers anywhere. " +
          "A TALL WOODEN EASEL stands at the left end of the room. " +
          "EXACTLY TWO ROUND STOOLS stand on the floor in front of the easel, with a wide clear gap between them, " +
          "and neither stool overlaps the other or the easel, so both are easy to count. " +
          "A WIDE WINDOW is on the back wall with its curtain tied back to one side. " +
          "A PAINT TROLLEY on wheels, holding jars, stands on the floor just to the right of the stools. " +
          "A FRAMED PICTURE OF A SAILBOAT hangs on the wall at the right.",
      },
      translation: [
        "M: 채린아, 여기가 새로 옮긴 미술실이야?",
        "W: 응, 지난주에 다 옮겼어.",
        "M: 왼쪽 끝에 키 큰 나무 이젤이 있네.",
        "W: 그건 내 앞 선생님 거였어.",
        "M: 그리고 이젤 앞에 의자가 두 개 보여.",
        "W: 세 개야. 하나는 이젤 뒤에 서 있어.",
        "M: 넓은 창문은 커튼을 한쪽으로 묶어 뒀네.",
        "W: 빛 때문에 오전 내내 열어 둬.",
        "M: 그리고 의자 옆에 바퀴 달린 물감 수레가 있네.",
        "W: 굴러가니까 작업하는 사람 쪽으로 밀어 줘.",
        "M: 그리고 오른쪽 벽에 돛단배 그림 액자가 걸려 있어.",
        "W: 3년 전에 한 학생이 그린 거야.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 남자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Sangmin, the class film night starts at six tomorrow."],
        ["M", "I know. Has anyone checked the projector?"],
        ["W", "I tested it this morning. Picture and sound are fine."],
        ["M", "Good. And the snacks?"],
        ["W", "Bought and boxed. They're under the back desk."],
        ["M", "Then what's left?"],
        ["W", "The room is still bright at six. We need the blackout curtains."],
        ["M", "Doesn't the science room have a set?"],
        ["W", "Two sets, but you have to sign for them at the office."],
        ["M", "When does the office close?"],
        ["W", "Five thirty. And I'm setting out the chairs until then."],
        ["M", "Then I'll go and borrow the blackout curtains."],
      ],
      choices: [
        "영사기 점검하기",
        "간식 사 오기",
        "의자 배치하기",
        "암막 커튼 빌려 오기",
        "안내문 붙이기",
      ],
      answer: 4,
      clue: "Then I'll go and borrow the blackout curtains.",
      explanation:
        "영사기와 간식은 끝났고 여자는 의자를 놓아야 하므로, 남자가 사무실에서 암막 커튼을 빌려 오기로 한다. 따라서 답은 ④이다.",
      translation: [
        "W: 상민아, 학급 영화의 밤이 내일 6시에 시작해.",
        "M: 알아. 영사기는 누가 확인했어?",
        "W: 내가 오늘 아침에 해 봤어. 화면도 소리도 괜찮아.",
        "M: 좋아. 간식은?",
        "W: 사서 상자에 담아 뒀어. 뒤쪽 책상 밑에 있어.",
        "M: 그럼 남은 게 뭐야?",
        "W: 6시에도 교실이 밝아. 암막 커튼이 필요해.",
        "M: 과학실에 한 벌 있지 않아?",
        "W: 두 벌 있어. 그런데 사무실에서 서명하고 받아야 해.",
        "M: 사무실은 몇 시에 닫아?",
        "W: 5시 30분. 그리고 나는 그때까지 의자를 놓아야 해.",
        "M: 그럼 내가 가서 암막 커튼을 빌려 올게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 여자가 지불할 금액을 고르시오.",
      lines: [
        ["M", "Welcome to Hillside Art Supply. What are you looking for?"],
        ["W", "Five aprons and two easels, please."],
        ["M", "Aprons are ten dollars each and easels are twenty-five."],
        ["W", "So fifty dollars for the aprons and fifty for the easels."],
        ["M", "One hundred dollars in total. Would you like paint smocks as well?"],
        ["W", "How much are those?"],
        ["M", "Six dollars each, and you'd need five."],
        ["W", "We'll leave the smocks. The aprons cover enough."],
        ["M", "That's fine. Are you buying these for a school club?"],
        ["W", "Yes, here's the club card."],
        ["M", "Then I can take thirty percent off the aprons this week, but not the easels."],
        ["W", "Thank you. I'll pay by card."],
      ],
      choices: ["$70.00", "$85.00", "$80.00", "$95.00", "$100.00"],
      answer: 2,
      clue: "Then I can take thirty percent off the aprons this week, but not the easels.",
      explanation:
        "앞치마 5장 50달러에서 30퍼센트를 빼면 35달러이고, 할인이 안 되는 이젤 2개 50달러를 더하면 85달러이다. 따라서 답은 ②이다.",
      translation: [
        "M: 힐사이드 화방입니다. 무엇을 찾으세요?",
        "W: 앞치마 다섯 장이랑 이젤 두 개 주세요.",
        "M: 앞치마는 한 장에 10달러, 이젤은 25달러입니다.",
        "W: 그럼 앞치마 50달러, 이젤 50달러네요.",
        "M: 모두 100달러입니다. 덧옷도 하시겠어요?",
        "W: 그건 얼마예요?",
        "M: 하나에 6달러인데, 다섯 개는 필요하실 거예요.",
        "W: 덧옷은 뺄게요. 앞치마로 충분해요.",
        "M: 괜찮습니다. 학교 동아리에서 쓰시는 건가요?",
        "W: 네, 여기 동아리 카드요.",
        "M: 그럼 이번 주에 앞치마에서 30퍼센트를 빼 드립니다. 이젤은 안 돼요.",
        "W: 감사합니다. 카드로 낼게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 여자가 토론 동아리 답사에 가지 않는 이유를 고르시오.",
      lines: [
        ["M", "Sora, your name isn't on the debate club trip list."],
        ["W", "I took it off yesterday."],
        ["M", "Is the fee too much? It went up to thirty thousand."],
        ["W", "The club pays it for second-year members."],
        ["M", "Then is it the exams? They're the week after."],
        ["W", "The week after is fine. I'd be back by Sunday."],
        ["M", "So what is it?"],
        ["W", "My parents are away on business that weekend."],
        ["M", "And your brother?"],
        ["W", "He's seven. Someone has to be at home with him."],
      ],
      choices: [
        "회비가 부담되어서",
        "시험 기간이라서",
        "교통편이 없어서",
        "다친 곳이 있어서",
        "동생을 돌봐야 해서",
      ],
      answer: 5,
      clue: "He's seven. Someone has to be at home with him.",
      explanation:
        "회비는 동아리가 내 주고 시험은 그다음 주라 괜찮지만, 그 주말에 부모님이 출장이어서 일곱 살 동생과 집에 있어야 하기 때문이다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 소라야, 토론 동아리 답사 명단에 네 이름이 없네.",
        "W: 어제 뺐어.",
        "M: 회비가 부담돼? 3만 원으로 올랐잖아.",
        "W: 2학년 회원은 동아리에서 내 줘.",
        "M: 그럼 시험 때문이야? 그다음 주잖아.",
        "W: 그다음 주는 괜찮아. 일요일에는 돌아오니까.",
        "M: 그럼 뭔데?",
        "W: 그 주말에 부모님이 출장이셔.",
        "M: 동생은?",
        "W: 일곱 살이야. 누군가는 집에 같이 있어야 해.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, Harbour Photography Class에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["M", "Chaerin, did you see the Harbour Photography Class notice?"],
        ["W", "I saw it on the board. How long does it run?"],
        ["M", "Six weeks, every Saturday from October."],
        ["W", "Six Saturdays. Where does it meet?"],
        ["M", "At the community centre next to the ferry terminal."],
        ["W", "That's close to my house. What does it cost?"],
        ["M", "Twelve thousand won for the whole course."],
        ["W", "That's cheaper than I expected. Do we bring our own camera?"],
        ["M", "A camera or a phone, and a notebook."],
        ["W", "I have both. Let's sign up on Friday."],
        ["M", "I'll bring the form to school."],
        ["W", "Then we can hand them in together."],
      ],
      choices: ["운영 기간", "장소", "강사", "참가비", "준비물"],
      answer: 3,
      clue: "강사는 대화에서 언급되지 않았다.",
      explanation:
        "기간(10월부터 여섯 주 토요일), 장소(여객선 터미널 옆 주민센터), 참가비(1만 2천 원), 준비물(카메라나 휴대전화와 공책)은 언급되지만 강사는 언급되지 않았다. 따라서 답은 ③이다.",
      translation: [
        "M: 채린아, 하버 사진 강좌 공고 봤어?",
        "W: 게시판에서 봤어. 얼마 동안 해?",
        "M: 여섯 주, 10월부터 토요일마다.",
        "W: 토요일 여섯 번이구나. 어디서 모여?",
        "M: 여객선 터미널 옆 주민센터에서.",
        "W: 우리 집에서 가깝네. 참가비는 얼마야?",
        "M: 전체 과정에 1만 2천 원.",
        "W: 생각보다 싸다. 카메라는 각자 가져가?",
        "M: 카메라나 휴대전화, 그리고 공책.",
        "W: 둘 다 있어. 금요일에 신청하자.",
        "M: 신청서는 내가 학교로 가져올게.",
        "W: 그럼 같이 내자.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Maple Hill Observatory에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "M",
          "Here is some information about the Maple Hill Observatory. " +
            "It opened in 1998 and sits on the ridge above the old reservoir. " +
            "The observatory is open from Tuesday to Sunday and closes every Monday. " +
            "Each guided tour lasts ninety minutes and begins at seven in the evening. " +
            "Visitors look through the main telescope only when the sky is clear. " +
            "On cloudy nights the tour moves indoors to the dome theatre. " +
            "Tickets are free for students who show a school card at the gate.",
        ],
      ],
      choices: [
        "관람은 45분 동안 진행된다",
        "1998년에 문을 열었다",
        "월요일에는 문을 닫는다",
        "흐린 날에는 실내에서 진행한다",
        "학생은 무료로 입장한다",
      ],
      answer: 1,
      clue: "Each guided tour lasts ninety minutes and begins at seven in the evening.",
      explanation:
        "관람은 90분 동안 진행된다고 했으므로 45분이라는 ①은 내용과 다르다. 따라서 답은 ①이다.",
      translation: [
        "M: 메이플힐 천문대를 안내해 드리겠습니다. 1998년에 문을 열었고 옛 저수지 위 능선에 있습니다. 화요일부터 일요일까지 열고 월요일마다 문을 닫습니다. 안내 관람은 한 번에 90분이며 저녁 7시에 시작합니다. 주망원경은 하늘이 맑을 때만 들여다봅니다. 흐린 밤에는 관람이 실내 돔 극장으로 옮겨집니다. 입장권은 정문에서 학생증을 보이면 무료입니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 구입할 텐트를 고르시오.",
      lines: [
        ["M", "Sora, we need a tent for the club camping trip."],
        ["W", "Five here. How many people should it hold?"],
        ["M", "At least four. There are four of us going."],
        ["W", "That cuts out the small ones. What about weight?"],
        ["M", "Under four kilograms. We carry it up from the bus stop."],
        ["W", "Agreed. And the budget is a hundred and fifty thousand won."],
        ["M", "So anything above that is out."],
        ["W", "Then only one tent clears all three."],
        ["M", "Let's order it tonight so it arrives before Friday."],
        ["W", "I'll order it and send you the tracking number."],
        ["M", "Thanks. I'll check the pegs when it comes."],
        ["W", "And we can put it up once in the yard first."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "At least four. There are four of us going.",
      explanation:
        "네 명 이상이 들어가고, 무게가 4킬로그램 미만이며, 15만 원 이하인 것을 고른다. 세 조건을 모두 채우는 것은 ④이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Capacity: 2 people / Weight: 2.0 kg / Price: 90,000 won" },
          { no: 2, label: "②", value: "Capacity: 4 people / Weight: 5.5 kg / Price: 110,000 won" },
          { no: 3, label: "③", value: "Capacity: 6 people / Weight: 3.5 kg / Price: 210,000 won" },
          { no: 4, label: "④", value: "Capacity: 4 people / Weight: 3.2 kg / Price: 140,000 won" },
          { no: 5, label: "⑤", value: "Capacity: 3 people / Weight: 6.0 kg / Price: 60,000 won" },
        ],
      },
      translation: [
        "M: 소라야, 동아리 야영에 쓸 텐트가 필요해.",
        "W: 다섯 개 있네. 몇 명이 들어가야 해?",
        "M: 적어도 네 명. 우리 넷이 가잖아.",
        "W: 그럼 작은 건 빠지네. 무게는?",
        "M: 4킬로그램 미만. 버스 정류장에서 걸어 올라가야 해.",
        "W: 동의해. 그리고 예산은 15만 원이야.",
        "M: 그럼 그보다 비싼 건 빠져.",
        "W: 그럼 세 조건 다 넘는 건 하나뿐이야.",
        "M: 금요일 전에 오게 오늘 밤에 주문하자.",
        "W: 내가 주문하고 송장 번호 보낼게.",
        "M: 고마워. 오면 내가 말뚝을 확인할게.",
        "W: 그리고 마당에서 한 번 쳐 보자.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["W", "Sangmin, has the club room key been returned yet?"],
        ["M", "Not yet, but Mr. Wi keeps a spare in the office."],
        ["W", "Is the office open at lunchtime?"],
        ["M", "It is. Ask for the spare there."],
      ],
      choices: [
        "I already have the club room key.",
        "I'll ask for the spare at the office.",
        "The office is closed all week.",
        "I'll wait until the key comes back.",
        "There is no spare key anywhere.",
      ],
      answer: 2,
      clue: "It is. Ask for the spare there.",
      explanation:
        "남자가 점심시간에 사무실에서 여벌 열쇠를 달라고 하라고 했으므로, 그렇게 하겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 상민아, 동아리방 열쇠 돌아왔어?",
        "M: 아직. 그런데 위 선생님이 사무실에 여벌을 두셔.",
        "W: 사무실은 점심시간에 열어?",
        "M: 열어. 거기서 여벌 달라고 해.",
        "W: 사무실에서 여벌 달라고 할게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["M", "Chaerin, the study room printer keeps jamming on me."],
        ["W", "How many pages are you sending at once?"],
        ["M", "Fifty. It's the whole workbook."],
        ["W", "It jams over twenty. Send it in batches of twenty."],
      ],
      choices: [
        "I'll send all fifty at once.",
        "The printer has never jammed.",
        "I only printed two pages.",
        "I don't need to print anything.",
        "I'll send it in batches of twenty.",
      ],
      answer: 5,
      clue: "It jams over twenty. Send it in batches of twenty.",
      explanation:
        "여자가 스무 장씩 나눠 보내라고 했으므로, 그렇게 하겠다는 ⑤가 가장 자연스럽다.",
      translation: [
        "M: 채린아, 자습실 인쇄기가 자꾸 걸려.",
        "W: 한 번에 몇 장 보내는데?",
        "M: 쉰 장. 문제집 전체야.",
        "W: 스무 장 넘으면 걸려. 스무 장씩 나눠 보내.",
        "M: 스무 장씩 나눠 보낼게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Sangmin, you said the vocabulary test went badly again."],
        ["M", "I knew every word the night before."],
        ["W", "How do you check that you know them?"],
        ["M", "I look at the English and the Korean comes to me."],
        ["W", "And on the test, which way are you asked?"],
        ["M", "Korean first. I have to produce the English."],
        ["W", "So you practice one direction and are tested in the other."],
        ["M", "I've done that for two years without noticing."],
        ["W", "Cover the English column and work from the Korean."],
        ["M", "That will be much slower at first."],
        ["W", "Slower tonight, or wrong on Friday. Try it once."],
      ],
      choices: [
        "I'll read the whole list again.",
        "I never study vocabulary at all.",
        "I'll test myself the other way tonight.",
        "The test was far too easy.",
        "I'd rather drop the subject.",
      ],
      answer: 3,
      clue: "Slower tonight, or wrong on Friday. Try it once.",
      explanation:
        "여자가 한국어에서 영어로 방향을 바꿔 확인해 보라고 했으므로, 오늘 밤 반대 방향으로 해 보겠다는 ③이 가장 자연스럽다.",
      translation: [
        "W: 상민아, 단어 시험 또 잘 못 봤다고 했지.",
        "M: 전날 밤에는 다 알았어.",
        "W: 안다는 건 어떻게 확인해?",
        "M: 영어를 보면 한국어가 떠올라.",
        "W: 시험에서는 어느 쪽으로 물어?",
        "M: 한국어가 먼저야. 영어를 써내야 해.",
        "W: 그럼 한 방향으로 연습하고 반대 방향으로 시험을 보는 거네.",
        "M: 2년 동안 모르고 그러고 있었어.",
        "W: 영어 칸을 가리고 한국어에서 시작해 봐.",
        "M: 처음엔 훨씬 느릴 텐데.",
        "W: 오늘 밤에 느리든지, 금요일에 틀리든지야. 한 번 해 봐.",
        "M: 오늘 밤에 반대로 해 볼게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Sora, how many people came to the club sign-up table?"],
        ["W", "Two. I put up forty posters."],
        ["M", "Can I see one of the posters?"],
        ["W", "Here. Club name, room number, and Join us."],
        ["M", "So it tells them where to go but not what happens there."],
        ["W", "I thought everyone knew what a film club does."],
        ["M", "I've been here three years and I don't."],
        ["W", "Fair. What would you put on it?"],
        ["M", "One line. What you actually did last Thursday."],
        ["W", "We watched twenty minutes and argued about the ending."],
        ["M", "That sentence is better than the whole poster."],
      ],
      choices: [
        "I'll add what we do in one line.",
        "I'll take the posters down.",
        "The posters are fine as they are.",
        "Nobody joins clubs anymore.",
        "I'll print twice as many posters.",
      ],
      answer: 1,
      clue: "One line. What you actually did last Thursday.",
      explanation:
        "남자가 지난주에 실제로 한 일을 한 줄로 넣으라고 했으므로, 무엇을 하는지 한 줄 넣겠다는 ①이 가장 자연스럽다.",
      translation: [
        "M: 소라야, 동아리 신청 책상에 몇 명이나 왔어?",
        "W: 두 명. 포스터를 마흔 장 붙였는데.",
        "M: 포스터 하나 볼 수 있어?",
        "W: 여기. 동아리 이름, 교실 번호, 그리고 '가입하세요'.",
        "M: 어디로 가라는 건 있는데 거기서 무슨 일이 있는지는 없네.",
        "W: 영화 동아리가 뭘 하는지는 다 아는 줄 알았어.",
        "M: 나는 3년째 다니는데 몰라.",
        "W: 그렇네. 너라면 뭘 넣을래?",
        "M: 한 줄. 지난 목요일에 실제로 한 일.",
        "W: 20분 보고 결말 가지고 다퉜지.",
        "M: 그 문장이 포스터 전체보다 낫다.",
        "W: 우리가 뭘 하는지 한 줄 넣을게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Harin이 Taeo에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Harin : ________________",
      lines: [
        [
          "W",
          "Harin and Taeo run the school's morning broadcast together. " +
            "Taeo reads the day's notices in the first two minutes, " +
            "right after the opening music, because that is how the programme has always been ordered. " +
            "This week Harin stands in the corridor and watches the doors, " +
            "and sees that students keep arriving until twenty past eight, " +
            "so most of them are still on the stairs while the notices are being read. " +
            "By the end of the broadcast every classroom is full. " +
            "Moving the notices to the last two minutes would change nothing else " +
            "and would take no extra work at all. " +
            "She wants to tell him to read the notices at the end of the broadcast instead. " +
            "In this situation, what would Harin most likely say to Taeo?",
        ],
      ],
      choices: [
        "We should stop reading the notices.",
        "We should start the broadcast earlier.",
        "Let's make the whole broadcast shorter.",
        "Let's read the notices at the end instead.",
        "We should print the notices on paper.",
      ],
      answer: 4,
      clue: "She wants to tell him to read the notices at the end of the broadcast instead.",
      explanation:
        "하린이는 전달 사항을 방송 끝에 읽자고 말하려 하므로 ④가 가장 적절하다.",
      translation: [
        "W: 하린이와 태오는 학교 아침 방송을 함께 맡고 있습니다. 태오는 여는 음악이 끝난 뒤 처음 2분 동안 그날의 전달 사항을 읽는데, 방송 순서가 늘 그렇게 짜여 있었기 때문입니다. 이번 주에 하린이는 복도에 서서 현관을 지켜보다가, 학생들이 8시 20분까지 계속 들어오기 때문에 전달 사항을 읽는 동안 대부분이 아직 계단에 있다는 것을 알게 됩니다. 방송이 끝날 무렵에는 교실이 다 찹니다. 전달 사항을 마지막 2분으로 옮기면 다른 것은 아무것도 달라지지 않고 손이 더 가지도 않습니다. 하린이는 전달 사항을 방송 끝에 읽자고 말하고 싶습니다. 이런 상황에서 하린이가 태오에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 남자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Hello, everyone. Today I want to talk about the gaps you feel " +
            "when a car crosses a long bridge. " +
            "Those are not damage and they are not sloppy work. " +
            "Steel and concrete grow when they are heated, " +
            "and a bridge a kilometre long can be several centimetres longer " +
            "on a hot afternoon than on a winter night. " +
            "If the ends were fixed hard against the road, that growth would have nowhere to go, " +
            "and the deck would buckle or crack. " +
            "So engineers leave a joint at the end of each span, " +
            "often shaped like two combs sliding into each other, " +
            "which closes in summer and opens in winter. " +
            "The bump you feel is the sound of a bridge being allowed to change size.",
        ],
      ],
      choices: [
        "how steel cables are spun for a suspension bridge",
        "why bridges are built with gaps that can open and close",
        "why concrete lasts longer than wood",
        "how traffic loads are measured on a bridge",
        "why rivers are crossed at their narrowest point",
      ],
      answer: 2,
      clue: "So engineers leave a joint at the end of each span.",
      explanation:
        "남자는 다리가 열을 받으면 늘어나기 때문에 각 구간 끝에 여닫히는 이음매를 둔다고 설명한다. 따라서 답은 ②이다.",
      translation: [
        "M: 안녕하세요, 여러분. 오늘은 긴 다리를 차로 건널 때 느껴지는 틈에 대해 이야기하려 합니다. 그것은 망가진 것도 아니고 일을 대충 한 것도 아닙니다. 강철과 콘크리트는 열을 받으면 자라고, 길이가 1킬로미터인 다리는 겨울밤보다 더운 오후에 몇 센티미터 더 길어질 수 있습니다. 양 끝이 도로에 단단히 고정되어 있다면 그 늘어남이 갈 곳이 없어 상판이 휘거나 갈라질 것입니다. 그래서 기술자들은 각 구간 끝에 이음매를 둡니다. 흔히 빗 두 개가 서로 맞물려 미끄러지는 모양인데, 여름에는 닫히고 겨울에는 벌어집니다. 지나갈 때 느껴지는 덜컹임은 다리가 크기를 바꾸도록 허락받고 있다는 소리입니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 내용이 아닌 것은?",
      lines: [
        ["M", "Hello, everyone. Today I want to talk about the gaps you feel when a car crosses a long bridge."],
        ["M", "Steel and concrete grow when they are heated."],
        ["M", "A bridge a kilometre long can be several centimetres longer on a hot afternoon than on a winter night."],
        ["M", "So engineers leave a joint at the end of each span, often shaped like two combs sliding into each other."],
        ["M", "The bump you feel is the sound of a bridge being allowed to change size."],
      ],
      choices: [
        "metal growing when it is heated",
        "a bridge being longer on a hot afternoon",
        "a joint shaped like two combs",
        "the bump a car feels when crossing a joint",
        "bridges being repainted every ten years",
      ],
      answer: 5,
      clue: "Steel and concrete grow when they are heated.",
      explanation:
        "금속이 열을 받으면 자란다는 것, 더운 오후에 다리가 더 길어진다는 것, 빗 모양 이음매, 건널 때 느껴지는 덜컹임은 언급되지만 10년마다 다시 칠한다는 것은 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
