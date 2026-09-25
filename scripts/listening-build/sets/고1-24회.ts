/** 고1 듣기 24회 — 사람이 직접 쓴 회차 (2026-09-25) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고1 24회",
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
          "Good morning, Brookside High students. This is Ms. Jeong from the school health office. " +
            "As you know, the water fountains on every floor were shut off last Thursday. " +
            "The repair crew found rust in the pipes on the third floor, " +
            "and rather than fix one floor at a time, the school decided to replace all of them at once. " +
            "The work will take two more weeks. " +
            "Until the new fountains are installed, we have set up two large water dispensers, " +
            "one in the cafeteria and one beside the gym entrance. " +
            "Paper cups are there, but please bring your own bottle if you can. " +
            "We go through three hundred cups a day and that is a lot of waste for two weeks. " +
            "Thank you for your patience.",
        ],
      ],
      choices: [
        "정수기 공사 기간과 대체 급수 방법을 알리려고",
        "물병 판매를 안내하려고",
        "종이컵 사용을 금지하려고",
        "체육관 출입 통제를 알리려고",
        "건강 검진 일정을 안내하려고",
      ],
      answer: 1,
      clue: "Until the new fountains are installed, we have set up two large water dispensers, one in the cafeteria and one beside the gym entrance.",
      explanation:
        "여자는 음수대 교체 공사가 2주 더 걸린다고 알리고, 그동안 급식실과 체육관 입구의 정수기를 쓰라고 안내한다. 따라서 답은 ①이다.",
      translation: [
        "W: 브룩사이드 고등학교 학생 여러분, 안녕하세요. 보건실 정입니다. 아시다시피 지난 목요일에 모든 층의 음수대를 잠갔습니다. 수리팀이 3층 배관에서 녹을 발견했고, 한 층씩 고치는 대신 학교에서 전부 한 번에 바꾸기로 했습니다. 공사는 2주가 더 걸립니다. 새 음수대가 설치될 때까지 큰 정수기 두 대를 두었습니다. 하나는 급식실에, 하나는 체육관 입구 옆에 있습니다. 종이컵도 있지만 되도록 물병을 가져오세요. 하루에 300개씩 쓰는데, 2주면 버려지는 양이 많습니다. 기다려 주셔서 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 남자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Taeyun, I've decided to study with music on from now on."],
        ["M", "What kind of music are you playing?"],
        ["W", "Songs I like. It keeps me from getting bored."],
        ["M", "Songs with words? While you're reading?"],
        ["W", "Is that a problem? It makes the hour go faster."],
        ["M", "The hour going faster isn't the same as the hour doing more."],
        ["W", "But I still finish the pages."],
        ["M", "Try this. Read one page with the music and write down what it said."],
        ["W", "And then a page without it?"],
        ["M", "Right. Compare what you can write from memory afterward."],
        ["W", "You think the lyrics are taking something."],
        ["M", "Words compete with words. Play something without any if you need sound."],
      ],
      choices: [
        "공부할 때는 음악을 꺼야 한다",
        "공부는 지루해도 견뎌야 한다",
        "집중력은 훈련으로 늘릴 수 있다",
        "가사 있는 음악은 글 읽기를 방해한다",
        "음악은 기분을 좋게 해 준다",
      ],
      answer: 4,
      clue: "Words compete with words. Play something without any if you need sound.",
      explanation:
        "남자는 글자와 가사가 서로 경쟁한다며, 소리가 필요하면 가사 없는 음악을 틀라고 말한다. 따라서 답은 ④이다.",
      translation: [
        "W: 태윤아, 나 이제부터 음악 틀고 공부하기로 했어.",
        "M: 어떤 음악 트는데?",
        "W: 좋아하는 노래. 그래야 안 지루해.",
        "M: 가사 있는 노래? 글 읽으면서?",
        "W: 그게 문제야? 한 시간이 빨리 가는데.",
        "M: 시간이 빨리 가는 거랑 그 시간에 더 하는 건 달라.",
        "W: 그래도 쪽수는 다 채워.",
        "M: 이렇게 해 봐. 음악 틀고 한 쪽 읽고 무슨 내용이었는지 적어 봐.",
        "W: 그다음엔 음악 없이 한 쪽?",
        "M: 그래. 나중에 기억나는 걸 적어서 비교해 봐.",
        "W: 가사가 뭔가를 가져간다고 생각하는구나.",
        "M: 글자는 글자랑 싸워. 소리가 필요하면 가사 없는 걸 틀어.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Think about the last time you gave someone directions. " +
            "You probably said something like, go past the bakery, then turn at the blue building. " +
            "You did not say, head north-northeast for four hundred meters. " +
            "Both are accurate, but only one is usable, " +
            "and the difference is not about how much you know. " +
            "It is about whether you built the explanation out of things the other person can see. " +
            "This is the part most explanations get wrong. " +
            "We reach for the description that is most correct " +
            "instead of the one that connects to something already in the listener's head. " +
            "A good explanation is not a compressed version of what you know. " +
            "It is a path from where they are standing to where you want them to be. " +
            "And you cannot draw that path until you have asked where they are standing.",
        ],
      ],
      choices: [
        "설명은 정확할수록 좋다",
        "설명은 듣는 사람이 아는 것에서 출발해야 한다",
        "길 안내는 짧아야 한다",
        "설명에는 전문 용어를 쓰지 말아야 한다",
        "질문을 많이 받아야 좋은 설명이다",
      ],
      answer: 2,
      clue: "It is a path from where they are standing to where you want them to be.",
      explanation:
        "남자는 좋은 설명이란 아는 것을 압축한 것이 아니라 듣는 사람이 서 있는 자리에서 출발하는 길이라고 말한다. 따라서 답은 ②이다.",
      translation: [
        "M: 마지막으로 누군가에게 길을 알려 준 때를 떠올려 보세요. 아마 빵집을 지나서 파란 건물에서 돌라고 말했을 겁니다. 북북동으로 400미터 가라고 하지는 않았겠지요. 둘 다 정확하지만 쓸 수 있는 것은 하나뿐이고, 그 차이는 여러분이 얼마나 아느냐에 있지 않습니다. 설명을 상대가 볼 수 있는 것들로 지었느냐에 있습니다. 대부분의 설명이 틀리는 지점이 바로 여기입니다. 우리는 듣는 사람 머릿속에 이미 있는 것과 이어지는 표현 대신 가장 올바른 표현을 집습니다. 좋은 설명은 아는 것을 압축한 판본이 아닙니다. 그들이 서 있는 자리에서 여러분이 데려가려는 자리까지 가는 길입니다. 그리고 그 길은 그들이 어디에 서 있는지 묻기 전에는 그릴 수 없습니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["W", "Taeyun, is this the booth your class ran at the festival?"],
        ["M", "Yes, that's our fortune-telling corner."],
        ["W", "There's a round table with a cloth over it."],
        ["M", "We borrowed the cloth from the home economics room."],
        ["W", "And a paper star garland hangs across the top."],
        ["M", "We cut those out the night before."],
        ["W", "I see two lanterns hanging at the sides."],
        ["M", "There are three. One is behind the sign."],
        ["W", "The wooden sign standing at the front is nicely painted."],
        ["M", "Minji did the lettering with a brush."],
        ["W", "And there's a small bell sitting on the table."],
        ["M", "We rang it whenever someone got a good fortune."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "There are three. One is behind the sign.",
      explanation:
        "여자가 등이 두 개라고 하자 남자가 세 개라고 바로잡는다. 그림에는 두 개가 그려져 있으므로 답은 ③이다.",
      figure: {
        kind: "scene",
        scene:
          "A festival booth drawn as one wide picture, clean black line art on white, no writing or letters anywhere. " +
          "A ROUND TABLE stands in the middle with a CLOTH draped over it. " +
          "A GARLAND OF PAPER STARS hangs across the top of the booth. " +
          "Exactly TWO LANTERNS hang from the frame, one on each side, clearly countable. " +
          "A blank WOODEN SIGN stands on an easel at the front left. " +
          "A SMALL BELL sits on top of the table.",
      },
      translation: [
        "W: 태윤아, 이게 너희 반이 축제에서 한 부스야?",
        "M: 응, 우리 운세 보기 자리야.",
        "W: 천을 덮은 둥근 탁자가 있네.",
        "M: 천은 가정실에서 빌렸어.",
        "W: 그리고 위쪽에 종이별 장식줄이 걸려 있어.",
        "M: 전날 밤에 오려 만든 거야.",
        "W: 양옆에 등이 두 개 걸린 게 보여.",
        "M: 세 개야. 하나는 간판 뒤에 있어.",
        "W: 앞쪽에 세워 둔 나무 간판이 예쁘게 칠해졌네.",
        "M: 민지가 붓으로 글씨를 썼어.",
        "W: 그리고 탁자 위에 작은 종이 있네.",
        "M: 좋은 운세가 나오면 그걸 울렸어.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 남자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Taeyun, the club photo exhibition opens tomorrow at nine."],
        ["M", "I know. Are all the prints mounted on the boards?"],
        ["W", "All twenty-four. I finished the last one at lunch."],
        ["M", "Good. And the captions under each print?"],
        ["W", "Printed and stuck on. I checked the spelling twice."],
        ["M", "Then the only thing left is the lighting."],
        ["W", "Right. Half the clip lamps in the storage room have no bulbs."],
        ["M", "How many bulbs do we need?"],
        ["W", "Six, and the supply office closes at five."],
        ["M", "Can you go? It's four twenty now."],
        ["W", "I can't. I'm meeting the teacher about the opening speech."],
        ["M", "Then I'll run to the supply office and get the six bulbs."],
      ],
      choices: [
        "사진 붙이기",
        "설명표 인쇄하기",
        "전구 받아 오기",
        "개회사 준비하기",
        "창고 정리하기",
      ],
      answer: 3,
      clue: "Then I'll run to the supply office and get the six bulbs.",
      explanation:
        "사진과 설명표는 끝났고 여자는 선생님을 만나야 하므로, 남자가 비품실에서 전구 여섯 개를 받아 오기로 한다. 따라서 답은 ③이다.",
      translation: [
        "W: 태윤아, 동아리 사진전이 내일 9시에 열려.",
        "M: 알아. 사진은 다 판에 붙였어?",
        "W: 스물네 장 전부. 점심때 마지막 걸 끝냈어.",
        "M: 좋아. 사진마다 설명표는?",
        "W: 인쇄해서 붙였어. 맞춤법도 두 번 봤어.",
        "M: 그럼 남은 건 조명뿐이네.",
        "W: 맞아. 창고에 있는 집게등 절반이 전구가 없어.",
        "M: 전구가 몇 개 필요해?",
        "W: 여섯 개. 비품실은 5시에 닫아.",
        "M: 네가 갈 수 있어? 지금 4시 20분인데.",
        "W: 못 가. 개회사 때문에 선생님 만나기로 했어.",
        "M: 그럼 내가 비품실 가서 전구 여섯 개 받아 올게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 여자가 지불할 금액을 고르시오.",
      lines: [
        ["M", "Welcome to Riverstone Art Supplies. What can I get you?"],
        ["W", "Five sketchbooks and three sets of colored pencils, please."],
        ["M", "Sketchbooks are eight dollars each and the pencil sets are twelve."],
        ["W", "So forty dollars plus thirty-six."],
        ["M", "Seventy-six in total. Would you like the canvas bag as well?"],
        ["W", "How much is the bag?"],
        ["M", "It's nine dollars."],
        ["W", "I'll leave the bag. I have one at home."],
        ["M", "No problem. Are you buying these for a school club?"],
        ["W", "Yes, here's our club card."],
        ["M", "Then I can take twenty-five percent off your total."],
        ["W", "Wonderful. I'll pay by card."],
      ],
      choices: ["$57.00", "$63.75", "$76.00", "$85.00", "$95.00"],
      answer: 1,
      clue: "Then I can take twenty-five percent off your total.",
      explanation:
        "스케치북 5권 40달러와 색연필 3세트 36달러를 더하면 76달러이고, 가방은 사지 않았으므로 25퍼센트를 빼면 57달러이다. 따라서 답은 ①이다.",
      translation: [
        "M: 리버스톤 화방입니다. 무엇을 드릴까요?",
        "W: 스케치북 다섯 권이랑 색연필 세 세트 주세요.",
        "M: 스케치북은 한 권에 8달러, 색연필 세트는 12달러입니다.",
        "W: 그럼 40달러에 36달러네요.",
        "M: 모두 76달러입니다. 캔버스 가방도 하시겠어요?",
        "W: 가방은 얼마예요?",
        "M: 9달러입니다.",
        "W: 가방은 뺄게요. 집에 하나 있어요.",
        "M: 괜찮습니다. 학교 동아리에서 쓰시는 건가요?",
        "W: 네, 여기 동아리 카드요.",
        "M: 그럼 전체 금액에서 25퍼센트를 빼 드릴게요.",
        "W: 좋네요. 카드로 낼게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 남자가 주말 농구 경기에 못 나가는 이유를 고르시오.",
      lines: [
        ["W", "Taeyun, you're not on Saturday's starting list."],
        ["M", "I told the coach I can't play this weekend."],
        ["W", "Is your knee bothering you again?"],
        ["M", "No, the knee has been fine since September."],
        ["W", "Then is it the away game schedule? It's far."],
        ["M", "Distance isn't it. My cousin is getting married."],
        ["W", "On Saturday? Where's the wedding?"],
        ["M", "In Gwangju, so we leave Friday night."],
        ["W", "You'll be gone the whole weekend, then."],
        ["M", "We come back Sunday evening. I'll be at Monday's practice."],
      ],
      choices: [
        "무릎을 다쳐서",
        "경기장이 멀어서",
        "가족 여행을 가서",
        "사촌 결혼식에 가야 해서",
        "시험 준비를 해야 해서",
      ],
      answer: 4,
      clue: "Distance isn't it. My cousin is getting married.",
      explanation:
        "무릎도 괜찮고 거리 때문도 아니며, 사촌 결혼식 때문에 금요일 밤에 광주로 떠나기 때문이다. 따라서 답은 ④이다.",
      translation: [
        "W: 태윤아, 토요일 선발 명단에 네가 없네.",
        "M: 이번 주말엔 못 뛴다고 감독님께 말씀드렸어.",
        "W: 무릎이 또 아파?",
        "M: 아니, 9월부터는 괜찮아.",
        "W: 그럼 원정 경기 일정 때문이야? 멀잖아.",
        "M: 거리 때문은 아니야. 사촌 형이 결혼해.",
        "W: 토요일에? 결혼식이 어디서 하는데?",
        "M: 광주라서 금요일 밤에 떠나.",
        "W: 그럼 주말 내내 없겠네.",
        "M: 일요일 저녁에 돌아와. 월요일 연습엔 나갈게.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, Maple Street Market에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["M", "Yerim, have you been to the Maple Street Market?"],
        ["W", "Not yet. When is it open?"],
        ["M", "Every Sunday morning, from eight until one."],
        ["W", "Sunday mornings. Where exactly is it held?"],
        ["M", "On the closed-off block in front of the old post office."],
        ["W", "I know that street. What do they sell there?"],
        ["M", "Vegetables, bread, honey, and a few handmade things."],
        ["W", "That sounds good. Is there anywhere to sit and eat?"],
        ["M", "Yes, there are tables set up at the far end near the trees."],
        ["W", "Do you need cash, or do they take cards?"],
        ["M", "Most stalls take cards now, but a few are cash only."],
        ["W", "Then I'll bring some cash just in case."],
      ],
      choices: ["여는 날", "주차 방법", "여는 장소", "파는 물건", "앉을 자리"],
      answer: 2,
      clue: "주차 방법은 대화에서 언급되지 않았다.",
      explanation:
        "여는 날(일요일 오전), 장소(옛 우체국 앞 막힌 구역), 파는 물건(채소·빵·꿀·수공예품), 앉을 자리(끝쪽 나무 근처 탁자)는 언급되지만 주차 방법은 언급되지 않았다. 따라서 답은 ②이다.",
      translation: [
        "M: 예림아, 메이플가 장터 가 봤어?",
        "W: 아직. 언제 열어?",
        "M: 매주 일요일 아침, 8시부터 1시까지.",
        "W: 일요일 아침이구나. 정확히 어디서 해?",
        "M: 옛 우체국 앞에 차를 막아 놓은 구역에서.",
        "W: 그 길 알아. 거기서 뭘 팔아?",
        "M: 채소, 빵, 꿀, 그리고 손으로 만든 것 몇 가지.",
        "W: 괜찮겠다. 앉아서 먹을 데도 있어?",
        "M: 응, 끝쪽 나무 근처에 탁자가 놓여 있어.",
        "W: 현금이 필요해, 아니면 카드도 돼?",
        "M: 이제 대부분 카드 받는데 몇 군데는 현금만 받아.",
        "W: 그럼 혹시 몰라서 현금도 챙겨 갈게.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Bluewing Bird Sanctuary에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "W",
          "Let me tell you about the Bluewing Bird Sanctuary. " +
            "It covers eighty hectares of wetland on the south side of the lake. " +
            "The sanctuary is open every day from sunrise to sunset, all year round. " +
            "Visitors walk along a raised wooden boardwalk, which keeps the ground undisturbed. " +
            "There is no entrance fee, but donations are collected at the gate. " +
            "Three observation huts sit along the boardwalk, each with narrow viewing slots. " +
            "Dogs are welcome on the boardwalk as long as they stay on a short leash.",
        ],
      ],
      choices: [
        "호수 남쪽 습지에 있다",
        "일 년 내내 매일 연다",
        "나무 데크 위를 걸어 다닌다",
        "관찰 오두막이 세 곳 있다",
        "입장료를 받는다",
      ],
      answer: 5,
      clue: "There is no entrance fee, but donations are collected at the gate.",
      explanation:
        "입장료는 없고 문에서 기부를 받는다고 했으므로 입장료를 받는다는 ⑤는 내용과 다르다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 블루윙 조류 보호구역을 소개해 드리겠습니다. 호수 남쪽 습지 80헥타르에 걸쳐 있습니다. 보호구역은 해 뜰 때부터 해 질 때까지, 일 년 내내 매일 엽니다. 방문객은 땅을 밟지 않도록 높인 나무 데크를 따라 걷습니다. 입장료는 없지만 문에서 기부를 받습니다. 데크를 따라 관찰 오두막이 세 곳 있고, 각각 좁은 관찰 창이 나 있습니다. 개는 짧은 줄을 매면 데크에 데려올 수 있습니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 예약할 캠핑장 자리를 고르시오.",
      lines: [
        ["M", "Yerim, let's book a campsite for the club trip."],
        ["W", "Five sites are listed. How many of us are going?"],
        ["M", "Eight, so we need a site that takes at least eight."],
        ["W", "That rules out the small ones."],
        ["M", "Do we need a site with a shower building nearby?"],
        ["W", "Yes, two members asked about that specifically."],
        ["M", "Agreed. And the price? We collected sixty thousand won."],
        ["W", "So sixty thousand a night is our limit."],
        ["M", "Then only one site clears all three."],
        ["W", "Let's book it before the weekend fills up."],
        ["M", "I'll reserve it on the park website tonight."],
        ["W", "Send the confirmation to the club chat."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "Eight, so we need a site that takes at least eight.",
      explanation:
        "여덟 명 이상 쓸 수 있고, 샤워장이 가까우며, 하룻밤 6만 원 이하인 자리를 고른다. 세 조건을 모두 채우는 것은 ③이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Capacity: 6 / Shower nearby: Yes / Price: 40,000 won per night" },
          { no: 2, label: "②", value: "Capacity: 10 / Shower nearby: No / Price: 45,000 won per night" },
          { no: 3, label: "③", value: "Capacity: 10 / Shower nearby: Yes / Price: 58,000 won per night" },
          { no: 4, label: "④", value: "Capacity: 8 / Shower nearby: Yes / Price: 75,000 won per night" },
          { no: 5, label: "⑤", value: "Capacity: 4 / Shower nearby: Yes / Price: 30,000 won per night" },
        ],
      },
      translation: [
        "M: 예림아, 동아리 여행 갈 캠핑장 자리 예약하자.",
        "W: 다섯 자리가 있네. 몇 명 가?",
        "M: 여덟 명. 그러니 적어도 여덟 명 쓸 수 있는 자리여야 해.",
        "W: 그럼 작은 건 빠지네.",
        "M: 샤워장이 가까운 자리여야 할까?",
        "W: 응, 두 명이 그걸 특별히 물어봤어.",
        "M: 동의해. 값은? 우리가 6만 원 걷었잖아.",
        "W: 그럼 하룻밤 6만 원이 한계네.",
        "M: 그럼 세 조건 다 넘는 건 하나뿐이야.",
        "W: 주말 자리가 차기 전에 예약하자.",
        "M: 오늘 밤에 공원 누리집에서 예약할게.",
        "W: 확인되면 동아리 대화방에 올려 줘.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["W", "Taeyun, did the club room key get returned?"],
        ["M", "Not yet. The last person forgot to drop it off."],
        ["W", "Then how do we get in for tomorrow's meeting?"],
        ["M", "The office keeps a spare. Just sign for it at the desk."],
      ],
      choices: [
        "I'll sign for the spare tomorrow.",
        "I already have three keys.",
        "The club room has no door.",
        "We should cancel the meeting.",
        "I lost my own key last week.",
      ],
      answer: 1,
      clue: "The office keeps a spare. Just sign for it at the desk.",
      explanation:
        "남자가 사무실에 여벌 열쇠가 있으니 서명하고 받으라고 했으므로, 내일 서명하고 받겠다는 ①이 가장 자연스럽다.",
      translation: [
        "W: 태윤아, 동아리방 열쇠 반납됐어?",
        "M: 아직. 마지막 사람이 두고 가는 걸 깜빡했어.",
        "W: 그럼 내일 모임 때 어떻게 들어가?",
        "M: 사무실에 여벌이 있어. 데스크에서 서명하고 받으면 돼.",
        "W: 내일 서명하고 받을게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["M", "Yerim, my report file won't open on the school computer."],
        ["W", "What did you save it as at home?"],
        ["M", "A newer format. My laptop updated last month."],
        ["W", "The school machines are two versions behind. Save it as a PDF."],
      ],
      choices: [
        "My report is already printed.",
        "The school has new computers.",
        "I don't use a laptop at home.",
        "I'll save a PDF copy tonight.",
        "I'll write it out by hand.",
      ],
      answer: 4,
      clue: "The school machines are two versions behind. Save it as a PDF.",
      explanation:
        "여자가 PDF로 저장하라고 했으므로, 오늘 밤 PDF로 저장하겠다는 ④가 가장 자연스럽다.",
      translation: [
        "M: 예림아, 내 보고서 파일이 학교 컴퓨터에서 안 열려.",
        "W: 집에서 뭘로 저장했는데?",
        "M: 새 형식으로. 내 노트북이 지난달에 갱신됐어.",
        "W: 학교 컴퓨터는 두 판 뒤쳐졌어. PDF로 저장해.",
        "M: 오늘 밤에 PDF로 저장할게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Taeyun, you dropped out of the coding club after two weeks."],
        ["M", "Everyone there already knew three languages."],
        ["W", "And you knew none, so you left."],
        ["M", "I didn't want to slow the whole group down."],
        ["W", "Did anyone tell you that you were slowing them down?"],
        ["M", "No. One of them offered to sit with me on Fridays."],
        ["W", "And you said no to that?"],
        ["M", "I said I'd think about it, and then I stopped going."],
        ["W", "So the only person who decided you didn't belong was you."],
        ["M", "That's uncomfortably accurate."],
        ["W", "Go back on Friday and take the seat he offered."],
      ],
      choices: [
        "I already know three languages.",
        "I'll go back this Friday.",
        "Nobody offered me any help.",
        "The club meets on Mondays.",
        "I'd rather learn on my own.",
      ],
      answer: 2,
      clue: "Go back on Friday and take the seat he offered.",
      explanation:
        "여자가 금요일에 돌아가서 제안받은 자리에 앉으라고 했으므로, 이번 금요일에 돌아가겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 태윤아, 너 코딩 동아리를 2주 만에 그만뒀더라.",
        "M: 거기 사람들은 이미 언어를 세 개씩 알았어.",
        "W: 너는 하나도 몰랐고, 그래서 나왔구나.",
        "M: 모둠 전체를 늦추고 싶지 않았어.",
        "W: 네가 늦추고 있다고 누가 말했어?",
        "M: 아니. 한 명은 금요일마다 같이 앉아 주겠다고 했어.",
        "W: 그런데 거절했어?",
        "M: 생각해 보겠다고 하고 안 나갔어.",
        "W: 그럼 네가 거기 속하지 않는다고 정한 사람은 너뿐이네.",
        "M: 불편할 만큼 정확하네.",
        "W: 금요일에 돌아가서 그 애가 내준 자리에 앉아.",
        "M: 이번 금요일에 돌아갈게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Yerim, you've been apologizing for your own questions in class."],
        ["W", "I say sorry before I ask so people don't get annoyed."],
        ["M", "Has anyone ever looked annoyed when you asked?"],
        ["W", "Not that I've noticed, honestly."],
        ["M", "Then the apology is answering something nobody said."],
        ["W", "It just makes me feel safer to start that way."],
        ["M", "It also tells the room your question isn't worth its time."],
        ["W", "I never meant it like that."],
        ["M", "I know. But that's what the first four words do."],
        ["W", "So what should I say instead?"],
        ["M", "Just ask the question. Start at the word after sorry."],
      ],
      choices: [
        "I'll stop asking questions.",
        "Everyone looks annoyed at me.",
        "I never apologize for anything.",
        "I'll write my questions down instead.",
        "I'll drop the apology next time.",
      ],
      answer: 5,
      clue: "Just ask the question. Start at the word after sorry.",
      explanation:
        "남자가 사과를 빼고 바로 질문하라고 했으므로, 다음부터 사과를 빼겠다는 ⑤가 가장 자연스럽다.",
      translation: [
        "M: 예림아, 너 수업에서 네 질문에 대해 계속 사과하더라.",
        "W: 사람들이 짜증 내지 않게 묻기 전에 미안하다고 해.",
        "M: 네가 물었을 때 짜증 난 표정을 한 사람이 있었어?",
        "W: 솔직히 본 적은 없어.",
        "M: 그럼 그 사과는 아무도 하지 않은 말에 답하는 거야.",
        "W: 그렇게 시작하면 마음이 놓여서 그래.",
        "M: 동시에 네 질문이 이 방의 시간을 쓸 만하지 않다고 말하는 거야.",
        "W: 그런 뜻은 아니었어.",
        "M: 알아. 그런데 앞의 네 마디가 하는 일이 그래.",
        "W: 그럼 뭐라고 해야 해?",
        "M: 그냥 질문해. 미안하다는 말 다음 단어부터 시작해.",
        "W: 다음부터는 사과를 빼고 말할게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Jun이 Somi에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Jun : ________________",
      lines: [
        [
          "M",
          "Jun and Somi are in the same science class and they run an experiment together every Tuesday. " +
            "This week they are measuring how fast salt dissolves at different water temperatures. " +
            "Somi has prepared everything carefully and the measurements are neat. " +
            "But Jun notices that she is using a different spoon for each beaker, " +
            "and the spoons are not the same size, so the amount of salt changes between trials. " +
            "He knows their teacher will ask why the results jump around, " +
            "and that the answer will be the spoons rather than the temperature. " +
            "Somi has already filled in three rows of the table, " +
            "and they still have twenty minutes left in the period. " +
            "He wants to tell her to use one spoon for every trial and start the rows again. " +
            "In this situation, what would Jun most likely say to Somi?",
        ],
      ],
      choices: [
        "Let's raise the water temperature a little more.",
        "We should ask the teacher for a new beaker.",
        "Let's use one spoon for all of them and redo the rows.",
        "Let's finish the table and go home early.",
        "We should measure the salt by weight next term.",
      ],
      answer: 3,
      clue: "He wants to tell her to use one spoon for every trial and start the rows again.",
      explanation:
        "준이는 모든 실험에 같은 숟가락을 쓰고 표를 다시 채우자고 말하려 하므로 ③이 가장 적절하다.",
      translation: [
        "M: 준이와 소미는 같은 과학 수업을 듣고 매주 화요일 함께 실험을 합니다. 이번 주에는 물 온도에 따라 소금이 얼마나 빨리 녹는지 재고 있습니다. 소미는 모든 것을 꼼꼼히 준비했고 측정도 깔끔합니다. 그런데 준이는 소미가 비커마다 다른 숟가락을 쓰고 있고, 그 숟가락들의 크기가 달라 회차마다 소금 양이 달라진다는 것을 알아챕니다. 준이는 선생님이 결과가 왜 들쭉날쭉하냐고 물으실 것을, 그리고 그 답이 온도가 아니라 숟가락일 것을 압니다. 소미는 이미 표의 세 줄을 채웠고, 수업은 20분이 남았습니다. 준이는 모든 회차에 숟가락 하나만 쓰고 줄을 다시 채우자고 말하고 싶습니다. 이런 상황에서 준이가 소미에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 여자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "Hello, everyone. Today I want to talk about why old bridges in this region are built of brick " +
            "while newer ones are built of steel, and what that tells us about materials. " +
            "Brick is strong when you press it and weak when you pull it. " +
            "So a brick bridge must be shaped as an arch, " +
            "because an arch turns the weight above it into pressure along the curve. " +
            "Steel behaves the opposite way. It handles pulling extremely well, " +
            "which is why steel bridges can hang from cables and stretch across far wider gaps. " +
            "Neither material is better. Each one forces a different shape. " +
            "When you look at a bridge, you are not only looking at a crossing. " +
            "You are looking at the shape a material demanded before anyone was allowed to design it.",
        ],
      ],
      choices: [
        "how a material's strength decides a bridge's shape",
        "why brick bridges are cheaper than steel ones",
        "how arches were invented in ancient times",
        "why steel replaced brick in modern buildings",
        "how engineers test the strength of cables",
      ],
      answer: 1,
      clue: "Neither material is better. Each one forces a different shape.",
      explanation:
        "여자는 벽돌은 눌림에, 강철은 당김에 강해서 각각 아치와 현수 구조를 요구한다며, 재료가 모양을 정한다고 설명한다. 따라서 답은 ①이다.",
      translation: [
        "W: 안녕하세요, 여러분. 오늘은 이 지역의 오래된 다리는 왜 벽돌로, 새 다리는 왜 강철로 지어졌는지, 그리고 그것이 재료에 대해 무엇을 알려 주는지 이야기하려 합니다. 벽돌은 누를 때 강하고 당길 때 약합니다. 그래서 벽돌 다리는 아치 모양이어야 합니다. 아치가 위의 무게를 곡선을 따라 누르는 힘으로 바꿔 주기 때문입니다. 강철은 반대로 움직입니다. 당기는 힘을 아주 잘 견뎌서, 그래서 강철 다리는 줄에 매달릴 수 있고 훨씬 넓은 사이를 건널 수 있습니다. 어느 재료가 더 낫지는 않습니다. 각각이 다른 모양을 강요할 뿐입니다. 다리를 볼 때 여러분은 단지 건널목을 보는 것이 아닙니다. 누군가 설계를 시작하기도 전에 재료가 요구한 모양을 보고 있는 것입니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 내용이 아닌 것은?",
      lines: [
        ["W", "Hello, everyone. Today I want to talk about why old bridges in this region are built of brick while newer ones are built of steel."],
        ["W", "Brick is strong when you press it and weak when you pull it."],
        ["W", "So a brick bridge must be shaped as an arch, because an arch turns the weight above it into pressure along the curve."],
        ["W", "Steel behaves the opposite way. It handles pulling extremely well."],
        ["W", "which is why steel bridges can hang from cables and stretch across far wider gaps."],
        ["W", "Neither material is better. Each one forces a different shape."],
      ],
      choices: [
        "brick being weak when pulled",
        "an arch turning weight into pressure",
        "steel handling pulling well",
        "brick being cheaper than steel",
        "steel bridges hanging from cables",
      ],
      answer: 4,
      clue: "Brick is strong when you press it and weak when you pull it.",
      explanation:
        "벽돌이 당길 때 약하다는 것, 아치가 무게를 누르는 힘으로 바꾼다는 것, 강철이 당김에 강하다는 것, 강철 다리가 줄에 매달린다는 것은 언급되지만 벽돌이 강철보다 싸다는 것은 언급되지 않았다. 따라서 답은 ④이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
