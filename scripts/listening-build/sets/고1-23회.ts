/** 고1 듣기 23회 — 사람이 직접 쓴 회차 (2026-09-25) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고1 23회",
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
          "Good afternoon, Greenfield High families. This is Mr. Han, the athletic director. " +
            "I'm calling about this Saturday's soccer match against Northside. " +
            "As many of you know, the field was resurfaced over the summer and the work finished late. " +
            "The new grass needs two more weeks before anyone can play on it safely. " +
            "So the match will be held at Northside's field instead of ours. " +
            "The kickoff time has not changed. It is still two o'clock. " +
            "Two school buses will leave our front gate at half past twelve for students who need a ride. " +
            "Please have your child sign up at the gym office by Thursday so we know how many seats to hold. " +
            "Parking at Northside is limited, so we do recommend the bus. Thank you for your understanding.",
        ],
      ],
      choices: [
        "경기 취소를 알리려고",
        "경기 시작 시각 변경을 알리려고",
        "운동장 공사 일정을 안내하려고",
        "경기 장소 변경을 알리려고",
        "응원단 모집을 알리려고",
      ],
      answer: 4,
      clue: "So the match will be held at Northside's field instead of ours.",
      explanation:
        "남자는 새로 깐 잔디 때문에 경기를 우리 운동장이 아니라 상대 학교 운동장에서 한다고 알리고, 시작 시각은 그대로라고 덧붙인다. 따라서 답은 ④이다.",
      translation: [
        "M: 그린필드 고등학교 학부모님 여러분, 안녕하세요. 체육부장 한 선생입니다. 이번 주 토요일 노스사이드와의 축구 경기 때문에 연락드립니다. 많은 분이 아시다시피 운동장을 여름에 새로 깔았는데 공사가 늦게 끝났습니다. 새 잔디는 안전하게 밟기까지 2주가 더 필요합니다. 그래서 경기는 우리 운동장이 아니라 노스사이드 운동장에서 열립니다. 시작 시각은 바뀌지 않았습니다. 여전히 2시입니다. 차편이 필요한 학생들을 위해 학교 버스 두 대가 12시 30분에 정문에서 출발합니다. 자리를 몇 개 잡아 둘지 알아야 하니 목요일까지 체육관 사무실에 신청하게 해 주세요. 노스사이드는 주차 공간이 적어서 버스를 권해 드립니다. 이해해 주셔서 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 여자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Sora, I've decided to study for six hours straight every night."],
        ["W", "Six hours without stopping? When did you start that?"],
        ["M", "Monday. I got through four hours the first night."],
        ["W", "And how much of Monday's work do you remember now?"],
        ["M", "Honestly, the last two hours are a blur."],
        ["W", "That's what long blocks do. The brain stops filing anything away."],
        ["M", "But shorter sessions feel like I'm barely getting started."],
        ["W", "Feeling busy and learning aren't the same thing."],
        ["M", "So what would you do instead?"],
        ["W", "Fifty minutes of work, ten minutes away from the desk, then again."],
        ["M", "That sounds like I'd cover less ground."],
        ["W", "You'd cover less and keep more, which is the whole point."],
      ],
      choices: [
        "공부 시간은 길수록 좋다",
        "공부는 짧게 끊어 쉬어 가며 해야 한다",
        "공부는 아침에 해야 효율이 높다",
        "과목을 바꿔 가며 공부해야 한다",
        "복습보다 예습이 중요하다",
      ],
      answer: 2,
      clue: "Fifty minutes of work, ten minutes away from the desk, then again.",
      explanation:
        "여자는 긴 시간 몰아서 하면 뇌가 저장을 멈춘다며, 50분 공부하고 10분 쉬기를 되풀이하면 적게 보고도 더 남는다고 말한다. 따라서 답은 ②이다.",
      translation: [
        "M: 소라야, 나 매일 밤 여섯 시간씩 쉬지 않고 공부하기로 했어.",
        "W: 여섯 시간을 안 쉬고? 언제부터 시작했는데?",
        "M: 월요일부터. 첫날은 네 시간 했어.",
        "W: 그럼 월요일에 한 건 지금 얼마나 기억나?",
        "M: 솔직히 마지막 두 시간은 흐릿해.",
        "W: 길게 몰아서 하면 그렇게 돼. 뇌가 아무것도 저장하지 않아.",
        "M: 그런데 짧게 하면 이제 막 시작한 것 같은 기분이야.",
        "W: 바쁜 기분이 드는 것과 배우는 건 달라.",
        "M: 그럼 너라면 어떻게 하겠어?",
        "W: 50분 하고 10분은 책상에서 떠나고, 또 그렇게.",
        "M: 그러면 진도를 덜 나갈 것 같은데.",
        "W: 덜 나가고 더 남지. 그게 핵심이야.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "When people talk about learning a language, they usually talk about words. " +
            "How many words do you know, how many did you memorize this week. " +
            "But watch someone who has actually become comfortable in a second language. " +
            "What they gained was not a longer list. It was the willingness to be wrong out loud. " +
            "Every beginner reaches a point where the safe move is to stay quiet, " +
            "to nod along rather than build a sentence that might come out broken. " +
            "The ones who keep improving are the ones who speak the broken sentence anyway. " +
            "They hear how it lands, they get corrected, and the correction sticks " +
            "in a way no vocabulary list ever does. " +
            "So if you are learning a language and your progress has stopped, " +
            "the problem is probably not how many words you know. " +
            "It is how many times this week you were willing to sound foolish.",
        ],
      ],
      choices: [
        "어휘를 많이 외워야 말이 트인다",
        "언어는 어릴 때 배워야 한다",
        "문법을 먼저 익혀야 한다",
        "원어민과 대화해야 실력이 는다",
        "언어 학습은 틀릴 각오로 말해 봐야 는다",
      ],
      answer: 5,
      clue: "The ones who keep improving are the ones who speak the broken sentence anyway.",
      explanation:
        "여자는 실력이 느는 사람은 단어를 더 아는 사람이 아니라 틀린 문장이라도 소리 내어 말하는 사람이라고 말한다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 사람들이 언어 학습을 이야기할 때는 보통 단어를 이야기합니다. 단어를 몇 개 아느냐, 이번 주에 몇 개를 외웠느냐. 그런데 제2 언어를 편하게 쓰게 된 사람을 보세요. 그 사람이 얻은 것은 더 긴 목록이 아니었습니다. 소리 내어 틀릴 각오였습니다. 모든 초보자는 조용히 있는 것이 안전한 지점에 이릅니다. 어색하게 나올지 모르는 문장을 만드느니 고개만 끄덕이는 편이 낫다고 느끼지요. 계속 느는 사람은 그래도 그 어색한 문장을 말하는 사람입니다. 그 말이 어떻게 받아들여지는지 듣고, 고쳐지고, 그 고침은 어떤 단어 목록도 못 하는 방식으로 남습니다. 그러니 언어를 배우는데 실력이 멈췄다면, 문제는 아마 단어를 몇 개 아느냐가 아닙니다. 이번 주에 몇 번이나 바보처럼 들릴 각오를 했느냐입니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["W", "Junho, is this the photo of your club's reading room?"],
        ["M", "Yes, we finished setting it up last Friday."],
        ["W", "The round clock on the wall is easy to see from anywhere."],
        ["M", "We hung it there so nobody has to check a phone."],
        ["W", "And there's a striped rug under the table."],
        ["M", "It keeps the floor warm in winter."],
        ["W", "I like the tall plant standing in the left corner."],
        ["M", "That was a gift from a graduating member."],
        ["W", "There are three cushions lined up on the bench, right?"],
        ["M", "Actually there are four. We added one last week."],
        ["W", "And the bookshelf beside the window is full already."],
        ["M", "We're going to need a second one soon."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "Actually there are four. We added one last week.",
      explanation:
        "여자가 벤치에 방석이 세 개라고 하자 남자가 네 개라고 바로잡는다. 그림에는 세 개가 그려져 있으므로 답은 ④이다.",
      figure: {
        kind: "scene",
        scene:
          "A club reading room drawn as one picture, clean black line art on white, no writing or numbers. " +
          "A ROUND CLOCK hangs on the wall. A table stands on a STRIPED RUG. " +
          "A TALL POTTED PLANT stands in the left corner. " +
          "A bench along the wall has exactly THREE CUSHIONS lined up on it. " +
          "A BOOKSHELF packed full of books stands beside a window.",
      },
      translation: [
        "W: 준호야, 이게 너희 동아리 독서실 사진이야?",
        "M: 응, 지난 금요일에 꾸미기를 다 끝냈어.",
        "W: 벽에 걸린 둥근 시계는 어디서든 잘 보이겠다.",
        "M: 아무도 휴대폰을 안 봐도 되게 거기 걸었어.",
        "W: 그리고 탁자 밑에 줄무늬 깔개가 있네.",
        "M: 겨울에 바닥이 덜 차가워.",
        "W: 왼쪽 구석에 서 있는 큰 화분이 마음에 들어.",
        "M: 졸업하는 선배가 준 거야.",
        "W: 벤치 위에 방석이 세 개 놓여 있지?",
        "M: 사실 네 개야. 지난주에 하나 더 뒀어.",
        "W: 그리고 창 옆 책장은 벌써 가득 찼네.",
        "M: 곧 하나 더 있어야 할 것 같아.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 남자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Junho, the science fair opens tomorrow at nine. Is our display board finished?"],
        ["M", "The board is done. I glued the last chart on this morning."],
        ["W", "Good. What about the sample jars for the table?"],
        ["M", "They're in the lab, all six of them, labeled."],
        ["W", "Then the only thing left is the handout."],
        ["M", "How many copies do we need?"],
        ["W", "Fifty, one for each visiting group."],
        ["M", "The copy room closes at five, so I'd have to go now."],
        ["W", "I can't. I'm meeting the judges about the schedule."],
        ["M", "Then I'll run over and get the fifty copies made."],
        ["W", "Thanks. Leave them on the table when you're back."],
      ],
      choices: [
        "안내문 복사하기",
        "전시판 붙이기",
        "표본 병 준비하기",
        "심사위원 만나기",
        "일정표 만들기",
      ],
      answer: 1,
      clue: "Then I'll run over and get the fifty copies made.",
      explanation:
        "전시판과 표본 병은 이미 끝났고 여자는 심사위원을 만나야 하므로, 남자가 안내문 50부를 복사하러 가기로 한다. 따라서 답은 ①이다.",
      translation: [
        "W: 준호야, 과학 전시회가 내일 9시에 열려. 우리 전시판은 다 됐어?",
        "M: 판은 끝났어. 오늘 아침에 마지막 도표를 붙였어.",
        "W: 좋아. 탁자에 놓을 표본 병은?",
        "M: 실험실에 있어. 여섯 개 다 이름표까지 붙였어.",
        "W: 그럼 남은 건 안내문뿐이네.",
        "M: 몇 부나 필요해?",
        "W: 쉰 부. 찾아오는 모둠마다 한 장씩.",
        "M: 복사실이 5시에 닫으니까 지금 가야겠는데.",
        "W: 나는 못 가. 일정 때문에 심사위원들을 만나야 해.",
        "M: 그럼 내가 가서 쉰 부 복사해 올게.",
        "W: 고마워. 돌아오면 탁자에 두고 가.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 여자가 지불할 금액을 고르시오.",
      lines: [
        ["M", "Welcome to Bluewater Aquarium. How many tickets would you like?"],
        ["W", "Two adults and three students, please."],
        ["M", "Adult tickets are twenty dollars and student tickets are twelve."],
        ["W", "So that's forty plus thirty-six."],
        ["M", "Seventy-six dollars in total. Would you like the dolphin show as well?"],
        ["W", "How much is that on top?"],
        ["M", "It's five dollars per person, so twenty-five for your group."],
        ["W", "Hmm, that's more than I planned. We'll skip the show."],
        ["M", "Understood. Do you have a member card, by any chance?"],
        ["W", "Yes, here it is."],
        ["M", "Then I can take ten percent off the ticket total."],
        ["W", "Wonderful. I'll pay by card."],
      ],
      choices: ["$76.00", "$86.40", "$90.90", "$68.40", "$101.00"],
      answer: 4,
      clue: "Then I can take ten percent off the ticket total.",
      explanation:
        "어른 2명 40달러와 학생 3명 36달러를 더하면 76달러이고, 공연은 보지 않으므로 76달러에서 10퍼센트를 빼면 68.40달러이다. 따라서 답은 ④이다.",
      translation: [
        "M: 블루워터 수족관에 오신 걸 환영합니다. 표는 몇 장 드릴까요?",
        "W: 어른 두 장, 학생 세 장 주세요.",
        "M: 어른 표는 20달러, 학생 표는 12달러입니다.",
        "W: 그럼 40달러에 36달러네요.",
        "M: 모두 76달러입니다. 돌고래 공연도 보시겠어요?",
        "W: 그건 얼마가 더 붙나요?",
        "M: 한 사람에 5달러라서 다섯 분이면 25달러입니다.",
        "W: 음, 생각보다 비싸네요. 공연은 빼 주세요.",
        "M: 알겠습니다. 혹시 회원 카드 있으세요?",
        "W: 네, 여기요.",
        "M: 그럼 표값에서 10퍼센트를 빼 드릴게요.",
        "W: 좋네요. 카드로 낼게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 여자가 주말 등산에 갈 수 없는 이유를 고르시오.",
      lines: [
        ["M", "Sora, are you coming to Bukhan Mountain on Sunday?"],
        ["W", "I wish I could, but I have to stay in the city."],
        ["M", "Is your ankle still bothering you?"],
        ["W", "No, that healed two weeks ago."],
        ["M", "Then is it the weather? They say it might rain."],
        ["W", "Rain wouldn't stop me. It's my cousin's wedding."],
        ["M", "Oh, right. Is she the one getting married in Busan?"],
        ["W", "No, the ceremony is here, but I'm one of the helpers."],
        ["M", "So you'll be there all day."],
        ["W", "From eight in the morning until the reception ends."],
      ],
      choices: [
        "발목을 다쳐서",
        "사촌의 결혼식을 도와야 해서",
        "비가 올 예정이어서",
        "부산에 가야 해서",
        "아르바이트가 있어서",
      ],
      answer: 2,
      clue: "Rain wouldn't stop me. It's my cousin's wedding.",
      explanation:
        "발목은 나았고 비도 상관없다고 했으며, 사촌 결혼식에서 종일 돕기로 했기 때문이다. 따라서 답은 ②이다.",
      translation: [
        "M: 소라야, 일요일에 북한산 갈 거야?",
        "W: 가고 싶은데 시내에 있어야 해.",
        "M: 발목이 아직도 안 좋아?",
        "W: 아니, 그건 2주 전에 나았어.",
        "M: 그럼 날씨 때문이야? 비 올 수도 있대.",
        "W: 비는 상관없어. 사촌 언니 결혼식이야.",
        "M: 아, 맞다. 부산에서 결혼하는 그 언니?",
        "W: 아니, 식은 여기서 해. 그런데 내가 도우미야.",
        "M: 그럼 하루 종일 거기 있겠네.",
        "W: 아침 8시부터 피로연 끝날 때까지.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, Silver Lake Camp에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["W", "Junho, have you seen this leaflet for Silver Lake Camp?"],
        ["M", "Not yet. Is it the one the science teacher mentioned in class?"],
        ["W", "That's the one. She handed these out after the last period."],
        ["M", "When does it run? I have a family trip in late August."],
        ["W", "The first week of August, Monday through Friday."],
        ["M", "That's clear for me, then. Where exactly is it held?"],
        ["W", "At the lake house two hours east of the city."],
        ["M", "Two hours is far. Do they run a bus from the school?"],
        ["W", "The leaflet says a bus leaves the front gate on the first morning."],
        ["M", "Good. What do the campers actually do all week?"],
        ["W", "Canoeing in the morning and photography in the afternoon."],
        ["M", "I've never held a paddle in my life."],
        ["W", "Neither have most of them. There's an instructor for the first two days."],
        ["M", "That makes it less frightening. How much does it cost?"],
        ["W", "Three hundred thousand won, meals included."],
        ["M", "That's more than I expected, but the meals help."],
        ["W", "Applications close on the fifteenth, so don't sit on it."],
        ["M", "I'll ask my parents tonight and tell you tomorrow."],
      ],
      choices: ["운영 기간", "장소", "활동 내용", "참가비", "모집 인원"],
      answer: 5,
      clue: "모집 인원은 대화에서 언급되지 않았다.",
      explanation:
        "운영 기간(8월 첫째 주), 장소(도시에서 동쪽으로 두 시간 거리 호숫가 집), 활동(카누·사진), 참가비(30만 원)는 언급되지만 모집 인원은 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 준호야, 실버레이크 캠프 안내지 봤어?",
        "M: 아직. 과학 선생님이 수업 시간에 말씀하신 그거야?",
        "W: 응, 그거. 마지막 교시 끝나고 나눠 주셨어.",
        "M: 언제 해? 8월 말에는 가족 여행이 있어.",
        "W: 8월 첫째 주, 월요일부터 금요일까지.",
        "M: 그럼 나는 비네. 정확히 어디서 하는데?",
        "W: 도시에서 동쪽으로 두 시간 거리에 있는 호숫가 집에서.",
        "M: 두 시간이면 멀다. 학교에서 버스 나와?",
        "W: 첫날 아침에 정문에서 버스가 출발한다고 적혀 있어.",
        "M: 다행이다. 일주일 동안 뭘 하는데?",
        "W: 오전에는 카누, 오후에는 사진.",
        "M: 나는 노를 한 번도 잡아 본 적이 없어.",
        "W: 거의 다 그래. 처음 이틀은 강사가 붙는대.",
        "M: 그럼 덜 무섭네. 참가비는 얼마야?",
        "W: 30만 원, 식사 포함해서.",
        "M: 생각보다 비싼데, 식사가 들어간 건 낫다.",
        "W: 신청이 15일에 닫히니까 미루지 마.",
        "M: 오늘 밤에 부모님께 여쭤보고 내일 말해 줄게.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Riverbank Night Market에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "W",
          "Let me tell you about the Riverbank Night Market. " +
            "It opens every Friday and Saturday from six in the evening until eleven. " +
            "You will find it on the walking path along the south bank of the river. " +
            "About forty stalls set up there, and more than half of them sell food. " +
            "The market does not accept cash, so bring a card or your phone. " +
            "A small stage near the entrance hosts live music at eight o'clock both nights. " +
            "Admission is free, and leashed dogs are welcome.",
        ],
      ],
      choices: [
        "금요일과 토요일에 열린다",
        "강 남쪽 산책로에서 열린다",
        "현금으로만 계산할 수 있다",
        "가게의 절반 이상이 음식을 판다",
        "입장료가 없다",
      ],
      answer: 3,
      clue: "The market does not accept cash, so bring a card or your phone.",
      explanation:
        "현금을 받지 않으니 카드나 휴대폰을 가져오라고 했으므로 현금으로만 계산한다는 ③은 내용과 다르다. 따라서 답은 ③이다.",
      translation: [
        "W: 리버뱅크 야시장을 소개해 드리겠습니다. 매주 금요일과 토요일 저녁 6시부터 11시까지 엽니다. 강 남쪽 기슭을 따라 난 산책로에서 찾으실 수 있습니다. 가게가 마흔 곳쯤 들어서는데 그중 절반이 넘는 곳이 음식을 팝니다. 이 시장은 현금을 받지 않으니 카드나 휴대폰을 가져오세요. 입구 근처 작은 무대에서는 이틀 다 8시에 라이브 음악을 합니다. 입장료는 없고, 줄을 맨 개는 데려오셔도 됩니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 구입할 전기 주전자를 고르시오.",
      lines: [
        ["M", "Sora, let's pick an electric kettle for the club room."],
        ["W", "Finally. The old one has been leaking since March."],
        ["M", "There are five models here. How big should it be?"],
        ["W", "At least one and a half liters. We often have six people."],
        ["M", "That rules out the smallest one, then."],
        ["W", "It does. Do we need the temperature setting?"],
        ["M", "What difference does that actually make?"],
        ["W", "Green tea burns above eighty degrees, so it matters to them."],
        ["M", "Then yes, the tea members keep asking for it."],
        ["W", "All right. And how much can we spend?"],
        ["M", "Our budget from the club fund is sixty thousand won."],
        ["W", "That takes the most expensive one off the list."],
        ["M", "Then only one of the five fits everything."],
        ["W", "Let's order it before the fund closes on Friday."],
        ["M", "I'll put the order in tonight and send you the receipt."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 1,
      clue: "At least one and a half liters. We often have six people.",
      explanation:
        "1.5리터 이상이고, 온도 조절이 되며, 6만 원 이하인 것을 고른다. 세 조건을 모두 채우는 것은 ①이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Size: 1.5 L / Temperature control: Yes / Price: 55,000 won" },
          { no: 2, label: "②", value: "Size: 1.0 L / Temperature control: Yes / Price: 45,000 won" },
          { no: 3, label: "③", value: "Size: 1.7 L / Temperature control: No / Price: 38,000 won" },
          { no: 4, label: "④", value: "Size: 1.8 L / Temperature control: Yes / Price: 72,000 won" },
          { no: 5, label: "⑤", value: "Size: 2.0 L / Temperature control: No / Price: 60,000 won" },
        ],
      },
      translation: [
        "M: 소라야, 동아리방에 둘 전기 주전자 고르자.",
        "W: 드디어. 예전 것은 3월부터 물이 샜어.",
        "M: 여기 다섯 개가 있네. 크기는 얼마나 돼야 해?",
        "W: 적어도 1.5리터. 우리 자주 여섯 명이잖아.",
        "M: 그럼 제일 작은 건 빠지네.",
        "W: 그렇지. 온도 조절 기능은 필요해?",
        "M: 그게 실제로 뭐가 달라지는데?",
        "W: 녹차는 80도가 넘으면 써져서 그 애들한테는 중요해.",
        "M: 그럼 필요하겠다. 차 마시는 부원들이 계속 찾아.",
        "W: 좋아. 그리고 얼마까지 쓸 수 있어?",
        "M: 동아리비에서 쓸 수 있는 돈은 6만 원이야.",
        "W: 그럼 제일 비싼 건 목록에서 빠지네.",
        "M: 그럼 다섯 개 중 다 맞는 건 하나뿐이야.",
        "W: 금요일에 동아리비가 마감되니까 그전에 주문하자.",
        "M: 오늘 밤에 주문 넣고 영수증 보낼게.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["W", "Junho, did the school store get the new notebooks in?"],
        ["M", "They arrived this morning, but only the lined ones."],
        ["W", "I need the grid kind for my math notes."],
        ["M", "The clerk said the grid ones come next Tuesday."],
      ],
      choices: [
        "I already bought a calculator.",
        "The store closed last month.",
        "I don't take math this year.",
        "Then I'll wait until Tuesday.",
        "Lined paper is for drawing.",
      ],
      answer: 4,
      clue: "The clerk said the grid ones come next Tuesday.",
      explanation:
        "모눈 공책이 다음 주 화요일에 들어온다고 했으므로, 화요일까지 기다리겠다는 ④가 가장 자연스럽다.",
      translation: [
        "W: 준호야, 학교 매점에 새 공책 들어왔어?",
        "M: 오늘 아침에 왔는데 줄 공책만 왔어.",
        "W: 나는 수학 필기용 모눈 공책이 필요한데.",
        "M: 직원분이 모눈은 다음 주 화요일에 온댔어.",
        "W: 그럼 화요일까지 기다릴게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["M", "Sora, I left my umbrella in the classroom again."],
        ["W", "Go back and get it. The rain isn't stopping."],
        ["M", "The building locks at six and it's already ten past."],
        ["W", "The side door by the gym stays open until seven."],
      ],
      choices: [
        "I never use an umbrella.",
        "I'll try that door, then.",
        "The rain stopped an hour ago.",
        "My classroom has no door.",
        "I'll buy a new building.",
      ],
      answer: 2,
      clue: "The side door by the gym stays open until seven.",
      explanation:
        "여자가 체육관 옆문이 7시까지 열려 있다고 알려 주었으므로, 그 문으로 가 보겠다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 소라야, 또 교실에 우산을 두고 왔어.",
        "W: 가서 가져와. 비가 안 그쳐.",
        "M: 건물이 6시에 잠기는데 벌써 10분 지났어.",
        "W: 체육관 옆문은 7시까지 열려 있어.",
        "M: 그럼 그 문으로 가 볼게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Junho, you turned down the class president nomination."],
        ["M", "I did. I don't think I'd be any good at it."],
        ["W", "You ran the festival booth better than anyone last year."],
        ["M", "That was one weekend. This is a whole year of meetings."],
        ["W", "What part of it worries you most?"],
        ["M", "Speaking in front of four hundred people at the assembly."],
        ["W", "How many assemblies are there in a year?"],
        ["M", "Three, I think. Maybe four."],
        ["W", "So you're turning down a year of work over four speeches."],
        ["M", "When you say it that way, it sounds small."],
        ["W", "And the speeches are the part you can practice for."],
      ],
      choices: [
        "I've already given four speeches.",
        "Nobody attends our assemblies.",
        "I'd rather run the festival booth again.",
        "The meetings are the easy part.",
        "Then maybe I should let my name stand.",
      ],
      answer: 5,
      clue: "And the speeches are the part you can practice for.",
      explanation:
        "여자는 연설이야말로 연습할 수 있는 부분이라며 걱정을 덜어 주었으므로, 후보로 이름을 올려 보겠다는 ⑤가 가장 자연스럽다.",
      translation: [
        "W: 준호야, 너 반장 후보를 거절했다며.",
        "M: 응. 내가 잘할 것 같지 않아.",
        "W: 작년에 축제 부스는 누구보다 잘 꾸렸잖아.",
        "M: 그건 주말 하루였고, 이건 1년 내내 회의야.",
        "W: 어떤 부분이 제일 걱정돼?",
        "M: 조회에서 사백 명 앞에서 말하는 거.",
        "W: 1년에 조회가 몇 번인데?",
        "M: 세 번쯤. 네 번일 수도 있고.",
        "W: 그럼 연설 네 번 때문에 1년 치 일을 거절하는 거네.",
        "M: 그렇게 말하니까 별것 아닌 것 같네.",
        "W: 게다가 연설은 연습할 수 있는 부분이야.",
        "M: 그럼 후보로 이름을 올려 볼까 봐.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Sora, your part-time job seems to be eating your week."],
        ["W", "Four evenings now. The manager keeps adding shifts."],
        ["M", "Did you agree to four when you started?"],
        ["W", "No, I said two. He added the others one at a time."],
        ["M", "And you never said anything?"],
        ["W", "Each one felt too small to argue about."],
        ["M", "That's how two becomes four without a conversation."],
        ["W", "I know. But now it feels too late to bring up."],
        ["M", "It isn't. He can't fix what he doesn't know bothers you."],
        ["W", "What would I even say to him?"],
        ["M", "Tell him the number you agreed to, and ask to go back to it."],
      ],
      choices: [
        "I'll just quit the job tomorrow.",
        "He already cut my hours.",
        "I'll talk to him before my next shift.",
        "I never signed anything.",
        "Four evenings suit me fine.",
      ],
      answer: 3,
      clue: "Tell him the number you agreed to, and ask to go back to it.",
      explanation:
        "남자는 처음 약속한 횟수를 말하고 그대로 돌려 달라고 하라고 조언했으므로, 다음 근무 전에 이야기하겠다는 ③이 가장 자연스럽다.",
      translation: [
        "M: 소라야, 아르바이트가 네 일주일을 다 먹는 것 같아.",
        "W: 이제 저녁 네 번이야. 점장님이 계속 근무를 늘려.",
        "M: 시작할 때 네 번으로 약속했어?",
        "W: 아니, 두 번이라고 했어. 하나씩 늘리신 거야.",
        "M: 그런데 아무 말도 안 했어?",
        "W: 하나하나는 따지기엔 너무 작게 느껴졌어.",
        "M: 그렇게 해서 말 한마디 없이 둘이 넷이 되는 거야.",
        "W: 알아. 그런데 이제 와서 꺼내기엔 늦은 것 같아.",
        "M: 안 늦었어. 네가 불편한 걸 모르시면 고치실 수도 없잖아.",
        "W: 뭐라고 말씀드려야 할까?",
        "M: 처음 약속한 횟수를 말씀드리고 그대로 돌려 달라고 해.",
        "W: 다음 근무 전에 말씀드릴게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Mina가 Doyun에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Mina : ________________",
      lines: [
        [
          "W",
          "Mina and Doyun are on the same debate team, and their first match is tomorrow. " +
            "Doyun has written a strong argument, but he plans to read the whole thing from his paper. " +
            "During practice, Mina notices that he never once looks up at the audience. " +
            "She knows the judges score eye contact as much as content, " +
            "and Doyun's argument is good enough to win if he delivers it well. " +
            "She wants to tell him to memorize the opening and speak it looking at the judges. " +
            "In this situation, what would Mina most likely say to Doyun?",
        ],
      ],
      choices: [
        "Learn the opening by heart and look up while you say it.",
        "You should write a longer argument tonight.",
        "Let's ask the teacher to change our topic.",
        "Read the paper a little faster tomorrow.",
        "I'll give the opening speech instead of you.",
      ],
      answer: 1,
      clue: "She wants to tell him to memorize the opening and speak it looking at the judges.",
      explanation:
        "미나는 도윤이 첫 부분을 외워서 심사위원을 보며 말하기를 바라므로 ①이 가장 적절하다.",
      translation: [
        "W: 미나와 도윤이는 같은 토론 팀이고 내일이 첫 경기입니다. 도윤이는 탄탄한 주장을 썼지만 원고를 처음부터 끝까지 읽을 생각입니다. 연습 때 미나는 도윤이가 청중을 한 번도 올려다보지 않는 것을 봅니다. 미나는 심사위원이 내용만큼이나 눈 맞춤을 점수로 본다는 것을 알고, 도윤이의 주장은 잘 전달하기만 하면 이길 만큼 좋다는 것도 압니다. 미나는 도윤이가 첫 부분을 외워서 심사위원을 보며 말하기를 바랍니다. 이런 상황에서 미나가 도윤이에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 남자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Hello, everyone. Today I want to talk about why we keep things we never use. " +
            "Look in any drawer at home and you will find an object that has not moved in years. " +
            "A cable for a device you no longer own. A shirt two sizes too small. " +
            "Researchers call this the endowment effect. " +
            "Once something is ours, we value it far above what we would pay to buy it today. " +
            "In one study, students given a mug asked for nearly twice the price " +
            "that other students were willing to pay for the very same mug. " +
            "Nothing about the mug changed. Only who was holding it. " +
            "This is why clearing a closet feels like losing something, " +
            "even when everything you remove is something you had forgotten you owned. " +
            "Knowing the name of this habit will not cure it, but it does make the drawer easier to open.",
        ],
      ],
      choices: [
        "how to make everyday objects last longer",
        "how to keep yourself from buying on impulse",
        "the best order for clearing out a house",
        "why we value things more once we own them",
        "why secondhand trading keeps growing",
      ],
      answer: 4,
      clue: "Once something is ours, we value it far above what we would pay to buy it today.",
      explanation:
        "남자는 내 것이 되는 순간 그 물건을 살 때 낼 값보다 훨씬 높게 매기는 현상을 컵 실험을 들어 설명한다. 따라서 답은 ④이다.",
      translation: [
        "M: 안녕하세요, 여러분. 오늘은 우리가 왜 한 번도 쓰지 않는 물건을 계속 갖고 있는지 이야기하려 합니다. 집에 있는 아무 서랍이나 열어 보면 몇 년째 자리를 지킨 물건이 하나는 있습니다. 이제는 없는 기계에 쓰던 줄. 두 치수 작은 셔츠. 연구자들은 이것을 '소유 효과'라고 부릅니다. 어떤 것이 내 것이 되는 순간, 우리는 그것을 오늘 사려고 낼 값보다 훨씬 높게 값 매깁니다. 한 연구에서는 컵을 받은 학생들이 다른 학생들이 같은 컵에 내겠다고 한 값의 거의 두 배를 불렀습니다. 컵은 아무것도 달라지지 않았습니다. 누가 쥐고 있느냐만 달랐지요. 그래서 옷장을 비우는 일이 무언가를 잃는 것처럼 느껴집니다. 버리는 것이 전부 갖고 있는 줄도 몰랐던 물건인데도요. 이 버릇의 이름을 안다고 고쳐지지는 않지만, 서랍을 열기는 한결 쉬워집니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 물건이 아닌 것은?",
      lines: [
        ["M", "Hello, everyone. Today I want to talk about why we keep things we never use."],
        ["M", "Look in any drawer at home and you will find an object that has not moved in years."],
        ["M", "A cable for a device you no longer own. A shirt two sizes too small."],
        ["M", "Researchers call this the endowment effect."],
        ["M", "Once something is ours, we value it far above what we would pay to buy it today."],
        ["M", "In one study, students given a mug asked for nearly twice the price that other students were willing to pay for the very same mug."],
        ["M", "This is why clearing a closet feels like losing something, even when everything you remove is something you had forgotten you owned."],
      ],
      choices: [
        "a cable for a device no longer owned",
        "a watch that has stopped running",
        "a shirt two sizes too small",
        "a mug handed to students in a study",
        "a closet being cleared out",
      ],
      answer: 2,
      clue: "A cable for a device you no longer own. A shirt two sizes too small.",
      explanation:
        "쓰지 않는 기계의 줄, 두 치수 작은 셔츠, 실험에서 학생들에게 준 컵, 비우는 옷장은 언급되지만 멈춘 손목시계는 언급되지 않았다. 따라서 답은 ②이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
