/** 고1 듣기 22회 — 사람이 직접 쓴 회차 (2026-09-21) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고1 22회",
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
          "Good morning, Riverside High students. This is Ms. Park from the student council. " +
            "As you know, our school library closes at six on weekdays. Many of you have told us " +
            "that six is too early, especially during exam weeks when you want a quiet place to work. " +
            "We listened, and starting next Monday the library will stay open until nine every weekday. " +
            "A teacher will be on duty until closing, and the reading room on the second floor will also be available. " +
            "There is one condition. The extended hours depend on how many of you actually use them. " +
            "If fewer than thirty students sign in after six, we will have to go back to the old schedule. " +
            "So if you have been asking for this, please come and use it. Sign in at the front desk " +
            "so your visit is counted. Let's make the most of the space we asked for. Thank you.",
        ],
      ],
      choices: [
        "도서관 이용 규칙을 안내하려고",
        "도서관 개방 시간 연장을 알리려고",
        "독서 행사 참여를 권하려고",
        "도서관 자원봉사자를 모집하려고",
        "시험 기간 학습 계획을 안내하려고",
      ],
      answer: 2,
      clue: "starting next Monday the library will stay open until nine every weekday",
      explanation:
        "여자는 다음 주 월요일부터 도서관을 평일 9시까지 연다는 것을 알리고, 이용자가 적으면 원래대로 돌아간다고 덧붙인다. 따라서 답은 ②이다.",
      translation: [
        "W: 리버사이드 고등학교 학생 여러분, 안녕하세요. 학생회의 박 선생님입니다. 아시다시피 우리 학교 도서관은 평일 6시에 닫습니다. 많은 학생이 6시는 너무 이르다고, 특히 조용히 공부할 곳이 필요한 시험 주간에는 더 그렇다고 말해 주었습니다. 저희는 그 말을 들었고, 다음 주 월요일부터 도서관을 평일마다 9시까지 엽니다. 문 닫을 때까지 선생님이 한 분 계시고, 2층 열람실도 쓸 수 있습니다. 한 가지 조건이 있습니다. 연장 운영은 여러분이 실제로 얼마나 쓰는지에 달려 있습니다. 6시 이후에 들어오는 학생이 서른 명이 안 되면 원래 시간표로 돌아가야 합니다. 그러니 이것을 바라던 분들은 꼭 와서 써 주세요. 방문이 세어지도록 안내 데스크에서 기록해 주시기 바랍니다. 우리가 요청한 공간을 잘 써 봅시다. 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 여자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Minjae, you've been reading that same chapter for three days."],
        ["M", "I'm underlining everything that might come up on the test."],
        ["W", "Let me see. You've underlined almost every line on the page."],
        ["M", "Well, it all seemed important."],
        ["W", "Then the underlining isn't telling you anything."],
        ["M", "What do you mean? I marked what matters."],
        ["W", "If everything is marked, nothing stands out when you come back to it."],
        ["M", "I suppose I'd just be rereading the whole chapter."],
        ["W", "Exactly. Marking only works if most of the page stays clean."],
        ["M", "So I should be choosing, not collecting."],
        ["W", "Right. Pick the five sentences the chapter would collapse without."],
      ],
      choices: [
        "밑줄은 적게 그어야 쓸모가 있다",
        "교과서는 여러 번 읽어야 한다",
        "시험에 나올 부분을 예측해야 한다",
        "필기는 손으로 해야 기억에 남는다",
        "공부는 한 과목씩 몰아서 해야 한다",
      ],
      answer: 1,
      clue: "Marking only works if most of the page stays clean.",
      explanation:
        "여자는 전부 밑줄을 그으면 아무것도 드러나지 않는다며, 쪽 대부분이 깨끗해야 표시가 제구실을 한다고 말한다. 따라서 답은 ①이다.",
      translation: [
        "W: 민재야, 같은 단원을 사흘째 읽고 있네.",
        "M: 시험에 나올 만한 건 다 밑줄 긋고 있어.",
        "W: 어디 보자. 쪽마다 거의 모든 줄에 밑줄이 있는데.",
        "M: 다 중요해 보여서.",
        "W: 그럼 그 밑줄이 너한테 알려 주는 게 없잖아.",
        "M: 무슨 말이야? 중요한 걸 표시한 건데.",
        "W: 전부 표시하면 다시 볼 때 아무것도 눈에 안 띄어.",
        "M: 결국 단원을 통째로 다시 읽는 셈이겠네.",
        "W: 바로 그거야. 표시는 쪽 대부분이 깨끗해야 제구실을 해.",
        "M: 모으는 게 아니라 골라야 한다는 거구나.",
        "W: 맞아. 그게 빠지면 단원이 무너지는 문장 다섯 개만 골라.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "When we talk about practice, we usually mean repetition. Play the piece again. " +
            "Run the drill again. But repetition on its own does something quieter than we expect: " +
            "it makes us comfortable with what we can already do. The hard bar in the middle of the piece " +
            "gets played at full speed, missed, and left behind, because stopping feels like failing. " +
            "Musicians who improve fastest do the opposite. They find the one bar that breaks down, " +
            "slow it until it is easy, and stay there until it stops being the hard part. " +
            "It looks like less practice. Fewer pages covered, less sound in the room. " +
            "But the next week that bar is gone from the list of problems, and a new one takes its place. " +
            "Progress is not the number of times you play something. It is the number of things " +
            "that have stopped being difficult.",
        ],
      ],
      choices: [
        "연습은 어려운 한 부분에 머물러야 늘어난다",
        "연습은 매일 같은 시간에 해야 한다",
        "악기는 어릴 때 시작해야 유리하다",
        "연습 시간을 길게 잡아야 효과가 있다",
        "여러 곡을 동시에 연습하는 것이 좋다",
      ],
      answer: 1,
      clue: "They find the one bar that breaks down, slow it until it is easy, and stay there until it stops being the hard part.",
      explanation:
        "남자는 반복만으로는 이미 할 줄 아는 것에 익숙해질 뿐이며, 무너지는 한 마디에 머물러 그것이 어렵지 않게 될 때까지 해야 는다고 말한다. 따라서 답은 ①이다.",
      translation: [
        "M: 연습이라고 하면 우리는 보통 반복을 떠올립니다. 그 곡을 다시 치고, 그 훈련을 다시 합니다. 그런데 반복만 하면 우리가 생각하는 것보다 조용한 일이 일어납니다. 이미 할 줄 아는 것에 편안해지는 것입니다. 곡 가운데의 어려운 마디는 제 속도로 지나가다 틀리고 그냥 넘어갑니다. 멈추는 것이 실패처럼 느껴지기 때문입니다. 가장 빨리 느는 연주자들은 그 반대로 합니다. 무너지는 그 한 마디를 찾아, 쉬워질 때까지 느리게 늦추고, 그 마디가 더 이상 어려운 자리가 아닐 때까지 거기 머뭅니다. 겉보기에는 연습을 덜 한 것 같습니다. 넘긴 쪽도 적고 방에 울린 소리도 적습니다. 그러나 다음 주면 그 마디는 문제 목록에서 사라지고 새로운 마디가 그 자리를 차지합니다. 나아감은 무언가를 몇 번 쳤는지가 아닙니다. 어렵지 않게 된 것이 몇 개인지입니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["W", "Junho, is this the photo of your new study room?"],
        ["M", "Yes, we finished it last weekend."],
        ["W", "The round clock above the desk looks nice."],
        ["M", "My grandmother gave it to me. It's older than I am."],
        ["W", "And you've put three books standing on the shelf."],
        ["M", "Those are the ones I'm reading now. The rest are in the box."],
        ["W", "There's a striped rug under the chair."],
        ["M", "It keeps the floor from getting scratched."],
        ["W", "I see a small plant on the left corner of the desk."],
        ["M", "It's a cactus. It's the only thing I can't kill."],
        ["W", "And the lamp is clipped to the edge of the desk."],
        ["M", "That way it doesn't take up any surface."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 5,
      clue: "And the lamp is clipped to the edge of the desk.",
      explanation:
        "대화에서 스탠드는 책상 모서리에 집게로 물려 있다고 했는데 그림에서는 받침을 놓고 책상 위에 세워져 있다. 따라서 답은 ⑤이다.",
      figure: {
        kind: "labeled",
        scene:
          "A tidy study room seen from the front, clean black line art on a plain white background, no writing or letters anywhere. " +
          "On the wall above the desk hangs a ROUND wall clock. " +
          "On a shelf to the right stand exactly THREE books, upright and side by side. " +
          "Under the chair lies a rug covered in STRIPES. " +
          "On the LEFT corner of the desk top sits a small potted CACTUS. " +
          "A desk lamp stands on the desk on a ROUND FLAT BASE resting on the desk surface — it is NOT clipped to the desk edge. " +
          "Everything is drawn fully inside the frame with clear space between the objects.",
      },
      translation: [
        "W: 준호야, 이게 새로 꾸민 공부방 사진이야?",
        "M: 응, 지난 주말에 끝냈어.",
        "W: 책상 위에 걸린 둥근 시계 예쁘다.",
        "M: 할머니가 주신 거야. 나보다 나이가 많아.",
        "W: 그리고 선반에 책 세 권을 세워 뒀네.",
        "M: 지금 읽고 있는 것들이야. 나머지는 상자에 있어.",
        "W: 의자 밑에 줄무늬 깔개가 있네.",
        "M: 바닥이 긁히지 않게 깔았어.",
        "W: 책상 왼쪽 구석에 작은 화분이 보여.",
        "M: 선인장이야. 내가 못 죽이는 유일한 거야.",
        "W: 그리고 스탠드는 책상 모서리에 집게로 물려 있네.",
        "M: 그러면 책상 자리를 안 차지하거든.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 여자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Sora, the club fair opens in half an hour."],
        ["W", "Is our booth ready? What still needs doing?"],
        ["M", "The banner is hung and the leaflets are stacked on the table."],
        ["W", "What about the sign-up sheet?"],
        ["M", "Jiwon is printing it now. She'll bring it over."],
        ["W", "And the laptop for the video?"],
        ["M", "It's set up, but the sound is coming out of the laptop speakers."],
        ["W", "That won't carry in a noisy hall."],
        ["M", "The club room has a small speaker we could borrow."],
        ["W", "I'll go and get it. Which shelf is it on?"],
        ["M", "The bottom one, next to the box of cables."],
        ["W", "Got it. I'll be back in five minutes."],
      ],
      choices: ["현수막 걸기", "안내지 쌓기", "신청서 인쇄하기", "스피커 가져오기", "노트북 설치하기"],
      answer: 4,
      clue: "I'll go and get it. Which shelf is it on?",
      explanation:
        "현수막·안내지·신청서·노트북은 이미 끝났고, 여자는 동아리방에서 스피커를 가져오기로 한다. 따라서 답은 ④이다.",
      translation: [
        "M: 소라야, 동아리 박람회가 30분 뒤에 시작해.",
        "W: 우리 부스 준비됐어? 아직 뭐가 남았어?",
        "M: 현수막은 걸었고 안내지도 탁자에 쌓아 뒀어.",
        "W: 신청서는?",
        "M: 지원이가 지금 인쇄하고 있어. 가져올 거야.",
        "W: 영상 틀 노트북은?",
        "M: 놔뒀는데 소리가 노트북 스피커로 나와.",
        "W: 시끄러운 강당에서는 안 들리겠다.",
        "M: 동아리방에 작은 스피커가 있어. 빌려 오면 돼.",
        "W: 내가 가서 가져올게. 어느 칸에 있어?",
        "M: 맨 아래 칸, 케이블 상자 옆에.",
        "W: 알겠어. 5분이면 돌아올게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 남자가 지불할 금액을 고르시오.",
      lines: [
        ["W", "Welcome to the art supply shop. How can I help you today?"],
        ["M", "I need sketchbooks and brushes for the art class I'm teaching."],
        ["W", "How large are the sketchbooks you're after?"],
        ["M", "A4 is fine. The students are drawing still life, not posters."],
        ["W", "Then these are the ones. The sketchbooks are twelve dollars each."],
        ["M", "And the brushes? I need sets, not single brushes."],
        ["W", "The brush sets are eight dollars each, six brushes to a set."],
        ["M", "I'll take two sketchbooks and three brush sets, then."],
        ["W", "That's twenty-four for the sketchbooks and twenty-four for the brushes."],
        ["M", "Forty-eight dollars altogether, then."],
        ["W", "Yes, that's right. Are you buying these for a school class?"],
        ["M", "I am. Does that make a difference to the price?"],
        ["W", "School purchases get ten percent off the total."],
        ["M", "That helps. Here's my card."],
      ],
      choices: ["$38.40", "$43.20", "$45.60", "$48.00", "$52.80"],
      answer: 2,
      clue: "School purchases get ten percent off the total.",
      explanation:
        "스케치북 12달러씩 두 권은 24달러, 붓 세트 8달러씩 세 개는 24달러로 합이 48달러이다. 학교 구매 10% 할인을 받으면 43.20달러이므로 답은 ②이다.",
      translation: [
        "W: 화방입니다. 오늘은 무엇을 도와드릴까요?",
        "M: 제가 가르치는 미술 수업에 쓸 스케치북과 붓이 필요해요.",
        "W: 스케치북은 어느 크기를 찾으세요?",
        "M: A4면 됩니다. 학생들이 정물을 그리지 포스터를 그리는 건 아니라서요.",
        "W: 그럼 이것들입니다. 스케치북은 한 권에 12달러입니다.",
        "M: 붓은요? 낱개 말고 세트가 필요해요.",
        "W: 붓 세트는 하나에 8달러이고 한 세트에 여섯 자루입니다.",
        "M: 그럼 스케치북 두 권, 붓 세트 세 개 주세요.",
        "W: 스케치북 24달러, 붓 24달러입니다.",
        "M: 그럼 모두 48달러네요.",
        "W: 네, 맞습니다. 학교 수업용으로 사시는 건가요?",
        "M: 맞아요. 그게 값에 차이가 있나요?",
        "W: 학교 구매는 전체에서 10% 빼 드립니다.",
        "M: 도움이 되네요. 카드 여기 있습니다.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 여자가 동아리 발표를 미루려는 이유를 고르시오.",
      lines: [
        ["M", "Sora, I heard you want to push the club presentation back a week."],
        ["W", "I do. I've been thinking about it since Monday."],
        ["M", "Is it because the slides aren't finished?"],
        ["W", "No, the slides have been done for a while."],
        ["M", "Then are you worried about speaking in front of everyone?"],
        ["W", "Not really. I've done that before."],
        ["M", "So what is it?"],
        ["W", "The survey results come back on Thursday."],
        ["M", "And the presentation is on Wednesday."],
        ["W", "Right. The whole argument rests on those numbers, and I'd be presenting without them."],
      ],
      choices: [
        "발표 자료가 완성되지 않아서",
        "발표하는 것이 긴장되어서",
        "설문 결과가 발표 뒤에 나와서",
        "동아리원들이 모이지 못해서",
        "발표 장소를 구하지 못해서",
      ],
      answer: 3,
      clue: "The whole argument rests on those numbers, and I'd be presenting without them.",
      explanation:
        "자료도 다 됐고 긴장 때문도 아니며, 설문 결과가 발표 다음 날 나와서 그 수치 없이 발표하게 되기 때문이다. 따라서 답은 ③이다.",
      translation: [
        "M: 소라야, 동아리 발표를 한 주 미루고 싶다며.",
        "W: 응. 월요일부터 생각하고 있었어.",
        "M: 발표 자료가 덜 돼서 그래?",
        "W: 아니, 자료는 진작 끝났어.",
        "M: 그럼 사람들 앞에서 말하는 게 걱정돼서?",
        "W: 그건 아니야. 전에도 해 봤어.",
        "M: 그럼 뭔데?",
        "W: 설문 결과가 목요일에 나와.",
        "M: 그런데 발표는 수요일이고.",
        "W: 맞아. 주장 전체가 그 수치에 걸려 있는데, 그것 없이 발표하게 되잖아.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, Green Roof Project에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["W", "Junho, have you signed up for the Green Roof Project?"],
        ["M", "Not yet. Tell me about it."],
        ["W", "We're planting a small garden on the roof of the science building."],
        ["M", "When does the work happen?"],
        ["W", "Every other Saturday morning, from nine to twelve."],
        ["M", "How many people are they taking?"],
        ["W", "Twenty, and eight places are still open."],
        ["M", "Do we need to bring anything?"],
        ["W", "Just gloves and a hat. The school provides the tools and the soil."],
        ["M", "What are we planting?"],
        ["W", "Herbs and low grasses, nothing that needs deep soil."],
        ["M", "Then I'll sign up this afternoon."],
      ],
      choices: ["하는 곳", "하는 때", "모집 인원", "가져올 것", "지도 교사"],
      answer: 5,
      clue: "Herbs and low grasses, nothing that needs deep soil.",
      explanation:
        "장소(과학관 옥상), 시간(격주 토요일 9시~12시), 인원(스무 명), 가져올 것(장갑과 모자)은 언급되지만 지도 교사는 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 준호야, Green Roof Project 신청했어?",
        "M: 아직. 어떤 건지 말해 줘.",
        "W: 과학관 옥상에 작은 정원을 만드는 거야.",
        "M: 언제 하는데?",
        "W: 격주 토요일 오전, 9시부터 12시까지.",
        "M: 몇 명이나 뽑아?",
        "W: 스무 명인데 여덟 자리 남았어.",
        "M: 뭘 가져가야 해?",
        "W: 장갑이랑 모자만. 도구랑 흙은 학교에서 줘.",
        "M: 뭘 심는데?",
        "W: 허브랑 키 낮은 풀. 흙이 깊어야 하는 건 안 심어.",
        "M: 그럼 오늘 오후에 신청할게.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Night Sky Camp에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "W",
          "Here are the details of this year's Night Sky Camp. The camp runs for two nights, " +
            "from the fifteenth to the seventeenth of next month, at Hanul Observatory. " +
            "It is open to first and second year students only; third years are excused because of their exams. " +
            "The fee is forty thousand won, which covers meals and the bus, but not the telescope rental. " +
            "Telescopes can be rented on site for five thousand won a night, or you may bring your own binoculars. " +
            "Each night there is an outdoor observation session lasting two hours, weather permitting. " +
            "If it rains, the session moves indoors and becomes a planetarium show instead. " +
            "Applications close on the fifth, and places are given in the order applications arrive.",
        ],
      ],
      choices: [
        "2박 3일 동안 열린다",
        "3학년은 참가할 수 없다",
        "참가비에 망원경 대여료가 포함된다",
        "비가 오면 실내 프로그램으로 바뀐다",
        "신청한 차례대로 자리를 준다",
      ],
      answer: 3,
      clue: "The fee is forty thousand won, which covers meals and the bus, but not the telescope rental.",
      explanation:
        "참가비 4만 원에는 식사와 버스가 포함되지만 망원경 대여료는 포함되지 않는다고 했으므로 ③이 일치하지 않는다.",
      translation: [
        "W: 올해 Night Sky Camp 안내입니다. 캠프는 다음 달 15일부터 17일까지 2박 3일 동안 한울 천문대에서 열립니다. 1학년과 2학년만 참가할 수 있고, 3학년은 시험 때문에 제외됩니다. 참가비는 4만 원이고 식사와 버스가 포함되지만 망원경 대여료는 포함되지 않습니다. 망원경은 현장에서 하룻밤에 5천 원에 빌릴 수 있고, 직접 쌍안경을 가져와도 됩니다. 밤마다 두 시간짜리 야외 관측이 있는데 날씨가 좋아야 합니다. 비가 오면 실내로 옮겨 천문관 상영으로 바뀝니다. 신청은 5일에 마감하고, 자리는 신청이 들어온 차례대로 드립니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 선택할 강좌를 고르시오.",
      lines: [
        ["M", "Sora, these are the five weekend courses still open."],
        ["W", "Let's narrow them down. I can't do anything on Sunday."],
        ["M", "Then one is out. What next?"],
        ["W", "It should be eight weeks or fewer. Anything longer runs into exams."],
        ["M", "One of them is twelve weeks, so that's gone too."],
        ["W", "Three left. What about the fee?"],
        ["M", "You said a hundred thousand won at the most."],
        ["W", "Then one more drops out. Two are left."],
        ["M", "Do both of them give a certificate at the end?"],
        ["W", "Only one does. The other just gives attendance."],
        ["M", "Then that's the one. Let's register tonight."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "Then that's the one. Let's register tonight.",
      explanation:
        "일요일인 ①, 12주인 ②, 120,000원인 ⑤를 뺀다. 남은 ③과 ④ 중 수료증을 주는 것은 ④이므로 답은 ④이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "일요일 / 6주 / 80,000원 / 수료증" },
          { no: 2, label: "②", value: "토요일 / 12주 / 90,000원 / 수료증" },
          { no: 3, label: "③", value: "토요일 / 8주 / 100,000원 / 출석확인" },
          { no: 4, label: "④", value: "토요일 / 6주 / 90,000원 / 수료증" },
          { no: 5, label: "⑤", value: "토요일 / 8주 / 120,000원 / 수료증" },
        ],
      },
      translation: [
        "M: 소라야, 아직 열려 있는 주말 강좌가 이 다섯 개야.",
        "W: 하나씩 줄여 보자. 일요일은 안 돼.",
        "M: 그럼 하나 빠지네. 다음은?",
        "W: 8주 이하여야 해. 그보다 길면 시험이랑 겹쳐.",
        "M: 하나는 12주니까 그것도 빠지고.",
        "W: 셋 남았다. 수강료는?",
        "M: 많아야 10만 원이라고 했잖아.",
        "W: 그럼 하나 더 빠지고 둘 남았다.",
        "M: 둘 다 끝나고 수료증 줘?",
        "W: 한 곳만. 다른 데는 출석만 확인해 줘.",
        "M: 그럼 그거네. 오늘 밤에 등록하자.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "Man : ________________",
      lines: [
        ["W", "Junho, did you bring the extra chairs for the club meeting?"],
        ["M", "I brought four from the storage room, but eight people are coming."],
        ["W", "That leaves half of us standing at the back again."],
        ["M", "I know. The storage room didn't have any more stacked up."],
        ["W", "The art room next door has some we can borrow until six."],
      ],
      choices: [
        "I'll go and get four more.",
        "The meeting starts at four.",
        "I don't like sitting down.",
        "There are five rooms on this floor.",
        "We painted the art room last year.",
      ],
      answer: 1,
      clue: "The art room next door has some we can borrow.",
      explanation:
        "옆 미술실에서 빌릴 수 있다는 말을 들었으므로, 네 개를 더 가져오겠다는 ①이 가장 자연스럽다.",
      translation: [
        "W: 준호야, 동아리 회의에 쓸 여분 의자 가져왔어?",
        "M: 창고에서 네 개 가져왔는데, 여덟 명이 와.",
        "W: 그럼 또 절반은 뒤에 서 있어야 하잖아.",
        "M: 그러게. 창고에 더 쌓여 있는 게 없더라고.",
        "W: 옆 미술실에 6시까지 빌릴 수 있는 게 있어.",
        "M: 그럼 네 개 더 가져올게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "Woman : ________________",
      lines: [
        ["M", "Sora, are you still looking for a partner for the science fair?"],
        ["W", "I am. Nobody in my class is doing a physics topic."],
        ["M", "My cousin in the other class is doing one on sound waves."],
      ],
      choices: [
        "I finished the report yesterday.",
        "Could you introduce me to her?",
        "Physics is my weakest subject.",
        "The fair was held last spring.",
        "I have two partners already.",
      ],
      answer: 2,
      clue: "My cousin in the other class is doing one on sound waves.",
      explanation:
        "물리 주제를 하는 사촌이 있다는 말을 들었으므로, 소개해 달라는 ②가 가장 자연스럽다.",
      translation: [
        "M: 소라야, 아직 과학 전시회 짝을 찾고 있어?",
        "W: 응. 우리 반에 물리 주제 하는 사람이 없어.",
        "M: 다른 반에 있는 내 사촌이 음파로 하고 있어.",
        "W: 나한테 소개해 줄 수 있어?",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "Woman : ________________",
      points3: true,
      lines: [
        ["M", "Sora, how is the English reading log going?"],
        ["W", "Not well. I've read four books but I can't remember much about any of them."],
        ["M", "How do you write the log?"],
        ["W", "I write a summary when I finish the whole book."],
        ["M", "So that's one page of notes for three hundred pages of reading."],
        ["W", "When you say it like that, it doesn't sound like much."],
        ["M", "And by the end, do you still remember the early chapters?"],
        ["W", "Honestly, no. I'm summarising what I remember, not what I read."],
        ["M", "That's the problem. The summary is being written from a faded copy."],
        ["W", "So the notes are only as good as my memory at the end."],
        ["M", "Write three lines at the end of every chapter instead."],
      ],
      choices: [
        "My reading log has forty pages.",
        "Then I'll write three lines after each chapter from tonight.",
        "I read about an hour every evening.",
        "The teacher collects the logs on Fridays.",
        "You should read the same books as me.",
      ],
      answer: 2,
      clue: "Write three lines at the end of every chapter instead.",
      explanation:
        "장마다 세 줄씩 쓰라는 조언을 들었으므로, 오늘 밤부터 그렇게 하겠다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 소라야, 영어 독서 기록은 잘돼 가?",
        "W: 잘 안돼. 네 권 읽었는데 어느 것도 잘 기억이 안 나.",
        "M: 기록은 어떻게 써?",
        "W: 책을 다 읽고 나서 요약을 써.",
        "M: 그럼 300쪽 읽고 기록 한 쪽인 거네.",
        "W: 그렇게 말하니까 별것 아닌 것 같다.",
        "M: 그리고 다 읽었을 때 앞 장들이 기억나?",
        "W: 솔직히 아니. 읽은 걸 요약하는 게 아니라 기억나는 걸 요약하는 거야.",
        "M: 그게 문제야. 흐려진 사본을 보고 요약문을 쓰는 셈이지.",
        "W: 결국 기록은 마지막에 남은 내 기억만큼만 좋은 거구나.",
        "M: 대신 장이 끝날 때마다 세 줄씩 써.",
        "W: 그럼 오늘 밤부터 장마다 세 줄씩 쓸게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "Man : ________________",
      points3: true,
      lines: [
        ["W", "Minjae, you've changed your study plan four times this month."],
        ["M", "Each one looked good until I tried it."],
        ["W", "What went wrong with the last one?"],
        ["M", "I planned three hours of maths every evening. I managed two days."],
        ["W", "And then?"],
        ["M", "I fell behind, so I made a new plan with four hours to catch up."],
        ["W", "Which you also couldn't do."],
        ["M", "No. So I made another one."],
        ["W", "Each plan is harder than the one you already failed."],
        ["M", "I never noticed that. They were all going up."],
        ["W", "Make the next one easier than the one you actually kept."],
      ],
      choices: [
        "My maths textbook has twelve chapters.",
        "Then I'll plan one hour a day and keep it.",
        "I study better in the morning.",
        "The exam is in three weeks.",
        "You should make a plan too.",
      ],
      answer: 2,
      clue: "Make the next one easier than the one you actually kept.",
      explanation:
        "실제로 지킨 것보다 쉬운 계획을 세우라는 조언을 들었으므로, 하루 한 시간으로 잡고 지키겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 민재야, 이번 달에 공부 계획을 네 번이나 바꿨네.",
        "M: 해 보기 전까진 다 괜찮아 보였어.",
        "W: 지난번 건 뭐가 잘못됐는데?",
        "M: 저녁마다 수학 세 시간으로 잡았는데 이틀 했어.",
        "W: 그래서?",
        "M: 밀려서 따라잡으려고 네 시간짜리로 새로 짰어.",
        "W: 그것도 못 했고.",
        "M: 응. 그래서 또 하나 만들었지.",
        "W: 계획마다 이미 실패한 것보다 더 어렵네.",
        "M: 그건 몰랐어. 전부 올라가기만 했구나.",
        "W: 다음 계획은 네가 실제로 지킨 것보다 쉽게 세워.",
        "M: 그럼 하루 한 시간으로 잡고 지킬게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Hayoon이 Junho에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "Hayoon : ________________",
      points3: true,
      lines: [
        [
          "W",
          "Hayoon and Junho are preparing a display for the school history fair. " +
            "Junho has spent two weeks collecting old photographs of the school, " +
            "and he has found more than eighty of them in the archive room. " +
            "The photographs are clear and he has written a caption for every one. " +
            "However, the display board is only one metre wide, and he plans to pin all eighty on it. " +
            "At that size each photograph would be smaller than a stamp, " +
            "and nobody standing in front of the board could read the captions. " +
            "Hayoon does not want to suggest that the two weeks were wasted. " +
            "She wants to propose choosing about fifteen photographs for the board " +
            "and putting the rest in an album on the table beside it. " +
            "In this situation, what would Hayoon most likely say to Junho?",
        ],
      ],
      choices: [
        "Let's find more photographs in the archive.",
        "Could we put fifteen on the board and the rest in an album?",
        "You should write shorter captions for all of them.",
        "Let's ask for a wider display board.",
        "I'll take new photographs this week.",
      ],
      answer: 2,
      clue: "She wants to propose choosing about fifteen photographs for the board and putting the rest in an album on the table beside it.",
      explanation:
        "하윤이는 준호가 쏟은 2주를 깎아내리지 않으면서, 게시판에는 열다섯 장만 붙이고 나머지는 옆 탁자의 앨범에 두자고 말하려 한다. 따라서 ②가 가장 적절하다.",
      translation: [
        "W: 하윤이와 준호는 학교 역사 전시회에 낼 게시물을 준비하고 있습니다. 준호는 2주 동안 학교의 옛 사진을 모았고, 자료실에서 여든 장 넘게 찾아냈습니다. 사진은 선명하고 준호는 한 장마다 설명을 써 두었습니다. 그런데 게시판은 폭이 1미터밖에 안 되는데 여든 장을 모두 붙일 생각입니다. 그 크기라면 사진 한 장이 우표보다 작아지고, 게시판 앞에 선 사람은 설명을 읽을 수 없습니다. 하윤이는 그 2주가 헛수고였다고 말하고 싶지 않습니다. 다만 게시판에는 열다섯 장쯤만 고르고 나머지는 옆 탁자의 앨범에 두자고 제안하고 싶습니다. 이런 상황에서 하윤이가 준호에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 남자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Good afternoon. Today I want to talk about why some animals move house so often. " +
            "The hermit crab is the clearest case. It has no shell of its own, so it borrows one, " +
            "usually an empty sea snail shell. As the crab grows, the borrowed shell stops fitting, " +
            "and it must find a bigger one. What is remarkable is how this happens on a crowded beach. " +
            "When a large empty shell washes up, the first crab to find it often does not take it. " +
            "It waits. Other crabs arrive and line up by size, smallest at the back. " +
            "When a crab big enough for the new shell finally arrives and moves in, " +
            "the one behind it takes the shell it left, and so on down the line. " +
            "In seconds, a dozen crabs have all moved up one size. " +
            "One shell arriving on the beach rehouses an entire queue.",
        ],
      ],
      choices: [
        "how hermit crabs exchange shells in turn",
        "why sea snails leave their shells behind",
        "how crabs defend themselves from predators",
        "why beaches lose shells over time",
        "how crabs find food in shallow water",
      ],
      answer: 1,
      clue: "the one behind it takes the shell it left, and so on down the line",
      explanation:
        "소라게가 크기대로 줄을 서서 앞 개체가 비운 껍데기를 차례로 옮겨 가는 과정을 설명한다. 따라서 답은 ①이다.",
      translation: [
        "M: 안녕하세요. 오늘은 어떤 동물들이 왜 그렇게 자주 집을 옮기는지 이야기하려 합니다. 소라게가 가장 분명한 사례입니다. 소라게는 제 껍데기가 없어서 하나를 빌려 씁니다. 보통은 비어 있는 고둥 껍데기입니다. 소라게가 자라면 빌린 껍데기가 맞지 않게 되고, 더 큰 것을 찾아야 합니다. 놀라운 것은 붐비는 해변에서 이 일이 어떻게 일어나는가입니다. 큰 빈 껍데기가 밀려오면, 그것을 처음 발견한 소라게는 대개 가져가지 않습니다. 기다립니다. 다른 소라게들이 와서 크기대로 줄을 서는데, 가장 작은 것이 맨 뒤입니다. 마침내 새 껍데기에 맞을 만큼 큰 소라게가 와서 들어가면, 그 뒤의 소라게가 그것이 비운 껍데기를 차지하고, 줄을 따라 그렇게 이어집니다. 몇 초 만에 열두 마리가 모두 한 치수씩 올라갑니다. 해변에 껍데기 하나가 도착하면 줄 전체가 집을 옮기는 것입니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 소라게의 행동이 아닌 것은?",
      lines: [
        ["M", "Good afternoon. Today I want to talk about why some animals move house so often."],
        ["M", "The hermit crab is the clearest case. It has no shell of its own, so it borrows one, usually an empty sea snail shell."],
        ["M", "As the crab grows, the borrowed shell stops fitting, and it must find a bigger one."],
        ["M", "What is remarkable is how this happens on a crowded beach."],
        ["M", "When a large empty shell washes up, the first crab to find it often does not take it. It waits."],
        ["M", "Other crabs arrive and line up by size, smallest at the back."],
        ["M", "When a crab big enough for the new shell finally arrives and moves in, the one behind it takes the shell it left, and so on down the line."],
        ["M", "In seconds, a dozen crabs have all moved up one size."],
      ],
      choices: [
        "waiting beside a new shell",
        "lining up by body size",
        "moving into a larger shell",
        "leaving its old shell behind",
        "carrying a shell to deeper water",
      ],
      answer: 5,
      clue: "Other crabs arrive and line up by size, smallest at the back.",
      explanation:
        "새 껍데기 옆에서 기다리기, 크기대로 줄 서기, 더 큰 껍데기로 들어가기, 쓰던 껍데기 남기기는 언급되지만 껍데기를 깊은 물로 옮기는 행동은 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
