/** 고2 듣기 21회 — 사람이 직접 쓴 회차 (2026-09-21) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고2 21회",
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
          "Good afternoon, members of the Hanul Hiking Club. This is Daniel, your trip coordinator. " +
            "I'm calling about the autumn trip to Mount Sobaek scheduled for the eighteenth. " +
            "The park office contacted us this morning. Because of storm damage last week, " +
            "the ridge trail we planned to take is closed until further notice. " +
            "I want to be clear that the trip itself is going ahead. " +
            "What changes is the route. We will take the valley path instead, " +
            "which is about two kilometres shorter and considerably gentler. " +
            "That means we will reach the summit shelter around one rather than three. " +
            "Please do not turn up in the boots you bought for the ridge; " +
            "the valley path is muddy in places and ordinary hiking shoes will serve you better. " +
            "Everything else stays as it was. Same meeting point, same bus, same time. " +
            "Thank you for your understanding.",
        ],
      ],
      choices: [
        "등산 일정이 취소되었음을 알리려고",
        "등산 경로가 바뀌었음을 알리려고",
        "등산 장비 구입을 권하려고",
        "회원 모집을 안내하려고",
        "집합 장소 변경을 알리려고",
      ],
      answer: 2,
      clue: "What changes is the route. We will take the valley path instead",
      explanation:
        "남자는 여행 자체는 그대로 가고 능선길 대신 계곡길로 경로가 바뀐다는 것을 알리고 있다. 따라서 답은 ②이다.",
      translation: [
        "M: 한울 등산 동호회 회원 여러분, 안녕하세요. 여행을 맡고 있는 다니엘입니다. 18일로 잡혀 있던 소백산 가을 산행 때문에 연락드립니다. 오늘 아침 공원 사무소에서 연락이 왔습니다. 지난주 태풍 피해로 저희가 가려던 능선길이 당분간 막혔습니다. 분명히 말씀드리면 산행은 그대로 갑니다. 바뀌는 것은 길입니다. 대신 계곡길로 가는데, 2킬로미터쯤 짧고 훨씬 완만합니다. 그래서 정상 대피소에 3시가 아니라 1시쯤 닿게 됩니다. 능선용으로 사신 등산화를 신고 오지는 마세요. 계곡길은 군데군데 질어서 보통 등산화가 더 낫습니다. 나머지는 그대로입니다. 같은 집합 장소, 같은 버스, 같은 시각입니다. 이해해 주셔서 고맙습니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 여자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Jieun, I've been recording every English word I meet in a notebook."],
        ["W", "How many have you got now?"],
        ["M", "Just over two thousand, since March."],
        ["W", "That's a lot of writing. How often do you go back to them?"],
        ["M", "Honestly, almost never. Once the word is written down I feel like it's handled."],
        ["W", "That's the part I'd worry about."],
        ["M", "But surely writing it down helps me remember it?"],
        ["W", "It helps at that moment. The problem is what the notebook lets you stop doing."],
        ["M", "Which is?"],
        ["W", "Meeting the word again. You've filed it away instead of using it."],
        ["M", "So the notebook is doing the remembering, not me."],
        ["W", "Right. Words stay with you through use, not through storage."],
      ],
      choices: [
        "단어는 적어 두기보다 다시 만나야 남는다",
        "단어는 문장과 함께 외워야 한다",
        "단어장은 손으로 써야 효과가 있다",
        "하루에 외울 단어 수를 정해야 한다",
        "어려운 단어부터 먼저 외워야 한다",
      ],
      answer: 1,
      clue: "Words stay with you through use, not through storage.",
      explanation:
        "여자는 적어 두면 다시 만나는 일을 그만두게 된다며, 낱말은 쌓아 두는 것이 아니라 쓰면서 남는다고 말한다. 따라서 답은 ①이다.",
      translation: [
        "M: 지은아, 만나는 영어 낱말을 전부 공책에 적고 있어.",
        "W: 지금 몇 개나 돼?",
        "M: 3월부터 해서 이천 개 조금 넘어.",
        "W: 많이도 썼네. 그걸 얼마나 자주 다시 봐?",
        "M: 솔직히 거의 안 봐. 적어 두면 처리됐다는 기분이 들어.",
        "W: 내가 걱정하는 게 바로 그 대목이야.",
        "M: 그래도 적으면 기억에 남지 않아?",
        "W: 그 순간에는 도움이 돼. 문제는 공책이 뭘 안 하게 만드느냐야.",
        "M: 뭘 안 하게 하는데?",
        "W: 그 낱말을 다시 만나는 일. 쓰는 대신 넣어 둔 거지.",
        "M: 그럼 공책이 기억하고 나는 안 하는 거네.",
        "W: 맞아. 낱말은 쌓아 둬서가 아니라 써서 남아.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "Anyone who has cooked from a recipe knows the moment when the instructions run out. " +
            "It says season to taste, and suddenly you are on your own. " +
            "Cooking schools have a name for what fills that gap. They call it the palate, " +
            "and they treat it as something built rather than given. " +
            "A student is asked to taste the same soup at four stages and say what changed. " +
            "Not whether it is good, but what changed. Salt first, then acid, then heat, then time. " +
            "After a few months the student can taste a finished dish and name what is missing, " +
            "which is the only skill that lets anyone cook without a recipe in front of them. " +
            "It is easy to think good cooks simply have better instincts. " +
            "What they have is a trained sense of difference, and difference can be practised.",
        ],
      ],
      choices: [
        "요리 감각은 차이를 구별하는 훈련으로 길러진다",
        "조리법은 정확히 따라야 실패하지 않는다",
        "좋은 재료가 요리의 절반을 결정한다",
        "요리는 어릴 때 배울수록 빨리 는다",
        "요리는 여러 사람과 함께 배워야 한다",
      ],
      answer: 1,
      clue: "What they have is a trained sense of difference, and difference can be practised.",
      explanation:
        "여자는 미각이 타고나는 것이 아니라 단계마다 무엇이 달라졌는지 짚는 훈련으로 길러진다고 말한다. 따라서 답은 ①이다.",
      translation: [
        "W: 조리법을 보고 요리해 본 사람이라면 지시가 끊기는 순간을 압니다. '간을 맞추세요'라고 적혀 있고, 갑자기 혼자가 됩니다. 요리 학교에는 그 빈자리를 메우는 것을 부르는 이름이 있습니다. 미각이라고 하는데, 타고나는 것이 아니라 길러지는 것으로 봅니다. 학생에게 같은 수프를 네 단계에서 맛보게 하고 무엇이 달라졌는지 말하게 합니다. 좋은지 나쁜지가 아니라 무엇이 달라졌는지입니다. 먼저 소금, 그다음 산미, 그다음 불, 그다음 시간입니다. 몇 달이 지나면 학생은 완성된 음식을 맛보고 무엇이 빠졌는지 짚어 낼 수 있게 되는데, 조리법을 앞에 두지 않고 요리할 수 있게 해 주는 기술은 그것뿐입니다. 좋은 요리사는 그저 감이 좋다고 여기기 쉽습니다. 그들이 가진 것은 훈련된 차이 감각이고, 차이는 연습할 수 있습니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["M", "Jieun, is this the photo of the reading corner you set up?"],
        ["W", "Yes, we finished it on Friday."],
        ["M", "The banner above the window has stars on it."],
        ["W", "The first years made it in art class."],
        ["M", "And there are two beanbag chairs on the floor."],
        ["W", "They were the cheapest thing that still lasted."],
        ["M", "I see a round rug between them."],
        ["W", "It hides the scratch in the floorboards."],
        ["M", "There's a tall plant in the left corner."],
        ["W", "That one survives without much light."],
        ["M", "And the bookshelf has four shelves."],
        ["W", "We filled the bottom two and left the top ones empty for now."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 5,
      clue: "And the bookshelf has four shelves.",
      explanation:
        "대화에서 책장은 선반이 네 칸이라고 했는데 그림에서는 세 칸이다. 따라서 답은 ⑤이다.",
      figure: {
        kind: "labeled",
        scene:
          "A school reading corner seen from the front, clean black line art on a plain white background, no writing or letters anywhere. " +
          "Above a window hangs a triangular bunting BANNER covered in STARS. " +
          "On the floor sit exactly TWO soft BEANBAG chairs, one on each side. " +
          "Between the two beanbags lies a ROUND rug. " +
          "In the LEFT corner stands a TALL potted plant taller than the beanbags. " +
          "Against the right wall stands a bookshelf with exactly THREE shelves (not four), " +
          "the lowest two rows filled with books and the top row empty. " +
          "Everything is drawn fully inside the frame with clear space between the objects.",
      },
      translation: [
        "M: 지은아, 이게 네가 꾸민 독서 공간 사진이야?",
        "W: 응, 금요일에 끝냈어.",
        "M: 창문 위 깃발에 별이 있네.",
        "W: 1학년들이 미술 시간에 만들었어.",
        "M: 그리고 바닥에 빈백 의자가 두 개 있고.",
        "W: 오래가는 것 중에 제일 싼 거였어.",
        "M: 둘 사이에 둥근 깔개가 보여.",
        "W: 마룻바닥 긁힌 자국을 가리려고.",
        "M: 왼쪽 구석에 키 큰 화분이 있네.",
        "W: 그건 빛이 적어도 살아.",
        "M: 그리고 책장은 선반이 네 칸이고.",
        "W: 아래 두 칸만 채우고 위는 당분간 비워 뒀어.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 남자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Daniel, the school open day starts in forty minutes."],
        ["M", "Is the science room ready? What's still outstanding?"],
        ["W", "The experiment tables are set and the safety goggles are laid out."],
        ["M", "What about the handouts for the visitors?"],
        ["W", "Jieun is stapling them now. She'll bring them over."],
        ["M", "And the projector for the slideshow?"],
        ["W", "It's connected, but the blinds are open and the screen is washed out."],
        ["M", "Nobody at the back will see anything."],
        ["W", "The pole for the blinds is in the store cupboard."],
        ["M", "I'll fetch it and close them. Which cupboard?"],
        ["W", "The one by the back door, behind the spare chairs."],
        ["M", "Got it. I'll be quick."],
      ],
      choices: ["실험 탁자 준비하기", "보안경 놓기", "유인물 묶기", "블라인드 내리기", "프로젝터 연결하기"],
      answer: 4,
      clue: "I'll fetch it and close them. Which cupboard?",
      explanation:
        "탁자·보안경·유인물·프로젝터는 이미 끝났고, 남자는 장대를 가져와 블라인드를 내리기로 한다. 따라서 답은 ④이다.",
      translation: [
        "W: 다니엘, 학교 공개일이 40분 뒤에 시작해.",
        "M: 과학실 준비됐어? 아직 남은 게 뭐야?",
        "W: 실험 탁자는 놨고 보안경도 꺼내 뒀어.",
        "M: 방문객 유인물은?",
        "W: 지은이가 지금 묶고 있어. 가져올 거야.",
        "M: 슬라이드 쇼 프로젝터는?",
        "W: 연결은 했는데 블라인드가 열려 있어서 화면이 하얗게 날아가.",
        "M: 뒤에 있는 사람은 아무것도 못 보겠네.",
        "W: 블라인드 내리는 장대가 창고장에 있어.",
        "M: 내가 가져와서 내릴게. 어느 창고장?",
        "W: 뒷문 옆, 여분 의자 뒤에 있는 거.",
        "M: 알겠어. 빨리 갔다 올게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 여자가 지불할 금액을 고르시오.",
      lines: [
        ["M", "Welcome to the stationery shop. What can I get you today?"],
        ["W", "I need notebooks and folders for the whole club."],
        ["M", "How many people are in the club?"],
        ["W", "Twelve, but I only need supplies for six of them."],
        ["M", "All right. The notebooks are seven dollars each."],
        ["W", "Six notebooks, then. And the folders?"],
        ["M", "Folders are four dollars each, and you'd want six of those as well."],
        ["W", "That's forty-two for the notebooks and twenty-four for the folders."],
        ["M", "Sixty-six dollars altogether. Are you buying for a school club?"],
        ["W", "I am. Does that change anything?"],
        ["M", "School clubs get fifteen percent off the total."],
        ["W", "That's a real help. Here's my card."],
      ],
      choices: ["$52.80", "$56.10", "$59.40", "$62.70", "$66.00"],
      answer: 2,
      clue: "School clubs get fifteen percent off the total.",
      explanation:
        "공책 7달러씩 여섯 권은 42달러, 폴더 4달러씩 여섯 개는 24달러로 합이 66달러이다. 학교 동아리 15% 할인을 받으면 56.10달러이므로 답은 ②이다.",
      translation: [
        "M: 문구점입니다. 오늘은 무엇을 드릴까요?",
        "W: 동아리 전체가 쓸 공책과 폴더가 필요해요.",
        "M: 동아리가 몇 명인가요?",
        "W: 열두 명인데, 여섯 명 것만 있으면 돼요.",
        "M: 알겠습니다. 공책은 한 권에 7달러입니다.",
        "W: 그럼 공책 여섯 권요. 폴더는요?",
        "M: 폴더는 하나에 4달러이고, 그것도 여섯 개 필요하시겠네요.",
        "W: 공책 42달러, 폴더 24달러네요.",
        "M: 모두 66달러입니다. 학교 동아리용으로 사시는 건가요?",
        "W: 맞아요. 그게 달라지는 게 있나요?",
        "M: 학교 동아리는 전체에서 15% 빼 드립니다.",
        "W: 정말 도움이 되네요. 카드 여기 있습니다.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 남자가 봉사 활동을 그만두려는 이유를 고르시오.",
      lines: [
        ["W", "Daniel, I heard you're leaving the tutoring programme."],
        ["M", "I've been thinking about it since the summer."],
        ["W", "Is it the time? Two evenings a week is a lot."],
        ["M", "No, the time I can manage. That isn't it."],
        ["W", "Did something happen with the student you tutor?"],
        ["M", "Not at all. Minho is great, and he works hard."],
        ["W", "Then what is it?"],
        ["M", "They moved us to a new room in August, right next to the gym."],
        ["W", "And the noise?"],
        ["M", "He can't hear me over the basketball. We've asked twice and nothing changed."],
      ],
      choices: [
        "시간을 내기 어려워서",
        "학생과 잘 맞지 않아서",
        "새 교실이 시끄러워서",
        "봉사 시간을 채워서",
        "다른 봉사로 옮기려고",
      ],
      answer: 3,
      clue: "He can't hear me over the basketball. We've asked twice and nothing changed.",
      explanation:
        "시간이나 학생 문제가 아니라, 8월에 옮긴 체육관 옆 교실이 시끄러워 수업이 안 되기 때문이다. 따라서 답은 ③이다.",
      translation: [
        "W: 다니엘, 과외 봉사 그만둔다며.",
        "M: 여름부터 생각해 온 일이야.",
        "W: 시간 때문이야? 저녁 두 번은 많지.",
        "M: 아니, 시간은 낼 수 있어. 그게 아니야.",
        "W: 가르치는 학생이랑 무슨 일 있었어?",
        "M: 전혀. 민호는 좋은 애고 열심히 해.",
        "W: 그럼 뭔데?",
        "M: 8월에 체육관 바로 옆 새 교실로 옮겼어.",
        "W: 그래서 시끄러워?",
        "M: 농구 소리에 내 말이 안 들려. 두 번이나 얘기했는데 그대로야.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, City Bike Tour에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["W", "Daniel, have you signed up for the City Bike Tour yet?"],
        ["M", "Not yet. I only saw the poster this morning. What's involved?"],
        ["W", "We ride from the riverside park to the old town and back along the river path."],
        ["M", "Is any of it on the road with cars?"],
        ["W", "None of it. The whole route is on the bike path, which is why they chose it."],
        ["M", "That's a relief. How far is it altogether?"],
        ["W", "Twenty-two kilometres, with three stops along the way."],
        ["M", "Three stops over twenty-two kilometres sounds manageable."],
        ["W", "It is. Most of the group last year had never ridden that far before."],
        ["M", "And when does it run?"],
        ["W", "The second Sunday of next month, starting at nine in the morning."],
        ["M", "Do we need to bring our own bikes?"],
        ["W", "You can bring one, or rent one at the park for ten thousand won."],
        ["M", "Then I'll rent. Mine has a flat tyre anyway. I'll sign up tonight."],
      ],
      choices: ["가는 길", "전체 거리", "출발 날과 시각", "자전거 마련 방법", "참가 인원"],
      answer: 5,
      clue: "You can bring one, or rent one at the park for ten thousand won.",
      explanation:
        "길(강변공원에서 구시가지 왕복), 거리(22km), 날과 시각(다음 달 둘째 일요일 9시), 자전거(가져오거나 만 원에 대여)는 언급되지만 참가 인원은 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 다니엘, City Bike Tour 신청했어?",
        "M: 아직. 오늘 아침에야 포스터를 봤어. 어떤 건데?",
        "W: 강변공원에서 구시가지까지 강변길로 갔다가 돌아와.",
        "M: 차 다니는 길로 가는 구간도 있어?",
        "W: 하나도 없어. 전 구간이 자전거길이라 그 길로 정한 거야.",
        "M: 다행이다. 전부 얼마나 되는데?",
        "W: 22킬로미터, 가는 길에 세 번 쉬어.",
        "M: 22킬로미터에 세 번 쉬면 할 만하겠다.",
        "W: 할 만해. 작년에도 그만큼 타 본 적 없는 사람이 대부분이었어.",
        "M: 언제 하는데?",
        "W: 다음 달 둘째 일요일, 아침 9시 출발.",
        "M: 자전거는 각자 가져가야 해?",
        "W: 가져와도 되고 공원에서 만 원에 빌려도 돼.",
        "M: 그럼 빌릴게. 내 건 어차피 바람이 빠졌어. 오늘 밤에 신청할게.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Winter Coding Camp에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "M",
          "Here are the details of this year's Winter Coding Camp. " +
            "The camp runs for four days, from the twenty-second to the twenty-fifth of January, " +
            "at the city science centre. It is open to students in their first and second year of high school. " +
            "Third years are welcome to attend as helpers but not as participants. " +
            "The fee is sixty thousand won, and that covers lunch on all four days " +
            "as well as the workbook you will keep afterwards. " +
            "Laptops are provided, so you do not need to bring your own. " +
            "Each day begins at ten and ends at four, with a two-hour project session in the afternoon. " +
            "On the final day, teams present what they built to the other groups. " +
            "Applications close on the tenth of January, and places go to those who apply first.",
        ],
      ],
      choices: [
        "4일 동안 열린다",
        "3학년은 참가자로 등록할 수 없다",
        "참가비에 점심이 포함된다",
        "노트북을 직접 가져가야 한다",
        "마지막 날에 팀별 발표가 있다",
      ],
      answer: 4,
      clue: "Laptops are provided, so you do not need to bring your own.",
      explanation:
        "노트북은 제공되므로 직접 가져올 필요가 없다고 했다. 따라서 ④가 일치하지 않는다.",
      translation: [
        "M: 올해 Winter Coding Camp 안내입니다. 캠프는 1월 22일부터 25일까지 나흘 동안 시립 과학관에서 열립니다. 고등학교 1학년과 2학년이 참가할 수 있습니다. 3학년은 도우미로는 환영하지만 참가자로는 등록할 수 없습니다. 참가비는 6만 원이고, 나흘 동안의 점심과 나중에 가져갈 교재가 포함됩니다. 노트북은 제공되므로 직접 가져오실 필요가 없습니다. 매일 10시에 시작해 4시에 끝나고, 오후에 두 시간짜리 프로젝트 시간이 있습니다. 마지막 날에는 팀마다 만든 것을 다른 조에게 발표합니다. 신청은 1월 10일에 마감하고, 자리는 먼저 신청한 분께 드립니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 예약할 스터디룸을 고르시오.",
      lines: [
        ["W", "Daniel, these are the five study rooms still free on Saturday."],
        ["M", "Let's narrow them down. It has to hold at least six of us."],
        ["W", "Then one is out — it only takes four."],
        ["M", "And we need a whiteboard for the practice problems."],
        ["W", "One of the remaining ones has no whiteboard, so that's gone."],
        ["M", "Three left. What about the hourly rate?"],
        ["W", "You said eight thousand won an hour at the most."],
        ["M", "Then one more drops out. Two are left."],
        ["W", "Do both of them have a window?"],
        ["M", "Only one does. The other is an interior room."],
        ["W", "Then let's take the one with the window. I'll book it now."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "Then let's take the one with the window. I'll book it now.",
      explanation:
        "4인실인 ①, 화이트보드가 없는 ②, 시간당 10,000원인 ③을 뺀다. 남은 ④와 ⑤ 중 창문이 있는 것은 ④이므로 답은 ④이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "4인 / 화이트보드 / 6,000원 / 창문" },
          { no: 2, label: "②", value: "8인 / 없음 / 7,000원 / 창문" },
          { no: 3, label: "③", value: "6인 / 화이트보드 / 10,000원 / 창문" },
          { no: 4, label: "④", value: "8인 / 화이트보드 / 8,000원 / 창문" },
          { no: 5, label: "⑤", value: "6인 / 화이트보드 / 7,000원 / 없음" },
        ],
      },
      translation: [
        "W: 다니엘, 토요일에 아직 빈 스터디룸이 이 다섯 개야.",
        "M: 하나씩 줄여 보자. 최소 여섯 명은 들어가야 해.",
        "W: 그럼 하나 빠지네. 네 명짜리야.",
        "M: 그리고 문제 풀 화이트보드가 있어야 해.",
        "W: 남은 것 중 하나는 화이트보드가 없으니 그것도 빠지고.",
        "M: 셋 남았다. 시간당 얼마야?",
        "W: 많아야 8천 원이라고 했잖아.",
        "M: 그럼 하나 더 빠지고 둘 남았다.",
        "W: 둘 다 창문 있어?",
        "M: 한 곳만. 다른 데는 창 없는 방이야.",
        "W: 그럼 창문 있는 걸로 하자. 지금 예약할게.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "Woman : ________________",
      lines: [
        ["M", "Jieun, did you manage to book the recording room for Thursday?"],
        ["W", "I tried, but every slot after four was already taken."],
        ["M", "The music teacher can open it for us at lunchtime instead."],
      ],
      choices: [
        "Then I'll ask her tomorrow morning.",
        "The room has three microphones.",
        "I don't play any instruments.",
        "Thursday is my busiest day.",
        "We recorded it last month.",
      ],
      answer: 1,
      clue: "The music teacher can open it for us at lunchtime instead.",
      explanation:
        "음악 선생님이 점심시간에 열어 줄 수 있다는 말을 들었으므로, 내일 아침에 여쭤보겠다는 ①이 가장 자연스럽다.",
      translation: [
        "M: 지은아, 목요일 녹음실 예약했어?",
        "W: 해 봤는데 4시 이후는 자리가 다 찼어.",
        "M: 대신 음악 선생님이 점심시간에 열어 주실 수 있대.",
        "W: 그럼 내일 아침에 여쭤볼게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "Man : ________________",
      lines: [
        ["W", "Daniel, are you still looking for someone to check your essay?"],
        ["M", "I am. I've read it so many times I can't see the mistakes any more."],
        ["W", "My sister studies English literature and she does this for free."],
      ],
      choices: [
        "My essay is about city planning.",
        "Could you send me her contact details?",
        "I finished it two weeks ago.",
        "English is not my best subject.",
        "I've already handed it in.",
      ],
      answer: 2,
      clue: "My sister studies English literature and she does this for free.",
      explanation:
        "영문학을 공부하는 언니가 무료로 봐 준다는 말을 들었으므로, 연락처를 보내 달라는 ②가 가장 자연스럽다.",
      translation: [
        "W: 다니엘, 아직 글 봐 줄 사람 찾고 있어?",
        "M: 응. 너무 여러 번 읽어서 이제 틀린 게 안 보여.",
        "W: 우리 언니가 영문학 공부하는데 이런 걸 그냥 봐 줘.",
        "M: 연락처 좀 보내 줄래?",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "Man : ________________",
      points3: true,
      lines: [
        ["W", "Daniel, how is the history presentation coming along?"],
        ["M", "Slowly. I've made sixty slides and I'm still not finished."],
        ["W", "Sixty? How long is the presentation?"],
        ["M", "Ten minutes."],
        ["W", "That's ten seconds a slide."],
        ["M", "When you put it that way, it sounds impossible."],
        ["W", "What's on most of them?"],
        ["M", "Quotations from the sources, mostly. I didn't want to leave anything out."],
        ["W", "But the audience can't read a quotation and listen to you at the same time."],
        ["M", "So the slides are competing with me rather than helping."],
        ["W", "Put one image on each slide and keep the quotations in your notes."],
      ],
      choices: [
        "My presentation is on the Silk Road.",
        "Then I'll cut them down to ten slides with images.",
        "I spent two weekends on the slides.",
        "The class has twenty-eight students.",
        "You should make more slides too.",
      ],
      answer: 2,
      clue: "Put one image on each slide and keep the quotations in your notes.",
      explanation:
        "슬라이드마다 그림 하나만 두고 인용은 원고로 옮기라는 조언을 들었으므로, 그림 슬라이드 열 장으로 줄이겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 다니엘, 역사 발표는 잘돼 가?",
        "M: 더뎌. 슬라이드를 예순 장 만들었는데 아직 안 끝났어.",
        "W: 예순 장? 발표가 얼마나 긴데?",
        "M: 10분.",
        "W: 한 장에 10초네.",
        "M: 그렇게 말하니까 불가능하게 들린다.",
        "W: 대부분에 뭐가 들어 있는데?",
        "M: 거의 자료 인용문. 아무것도 빼고 싶지 않았어.",
        "W: 그런데 듣는 사람은 인용문을 읽으면서 네 말을 동시에 들을 수 없어.",
        "M: 그럼 슬라이드가 나를 돕는 게 아니라 나랑 겨루는 거네.",
        "W: 슬라이드마다 그림 하나만 두고 인용문은 네 원고에 둬.",
        "M: 그럼 그림 넣은 열 장으로 줄일게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "Woman : ________________",
      points3: true,
      lines: [
        ["M", "Jieun, you've been at the library every evening this week."],
        ["W", "I have. I'm there from six until it closes at ten."],
        ["M", "Four hours straight. How much do you get through?"],
        ["W", "The first two hours are good. After that I mostly reread the same page."],
        ["M", "So half of the time isn't really study time."],
        ["W", "I suppose not. But leaving early feels like giving up."],
        ["M", "Does it help that you stayed, if the last two hours don't stick?"],
        ["W", "No. And I'm tired the next morning, so the next day is worse too."],
        ["M", "It's costing you the following day as well, then."],
        ["W", "I hadn't followed it that far."],
        ["M", "Go home at eight and sleep properly."],
      ],
      choices: [
        "The library is ten minutes from my house.",
        "Then I'll leave at eight tonight and sleep earlier.",
        "I study better with other people around.",
        "The exams start in two weeks.",
        "You should stay until ten as well.",
      ],
      answer: 2,
      clue: "Go home at eight and sleep properly.",
      explanation:
        "8시에 집에 가서 제대로 자라는 조언을 들었으므로, 오늘은 8시에 나가 일찍 자겠다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 지은아, 이번 주 저녁마다 도서관에 있더라.",
        "W: 맞아. 6시부터 10시 문 닫을 때까지 있어.",
        "M: 내리 네 시간이네. 얼마나 나가?",
        "W: 처음 두 시간은 괜찮아. 그 뒤로는 거의 같은 쪽을 다시 읽어.",
        "M: 그럼 절반은 사실 공부 시간이 아니네.",
        "W: 그런 셈이지. 그런데 일찍 나오면 포기하는 것 같아.",
        "M: 마지막 두 시간이 안 남는데 남아 있는 게 도움이 돼?",
        "W: 아니. 게다가 다음 날 아침에 피곤해서 그다음 날도 더 나빠.",
        "M: 그럼 다음 날까지 값을 치르는 거네.",
        "W: 거기까지는 따라가 보지 않았어.",
        "M: 8시에 집에 가서 제대로 자.",
        "W: 그럼 오늘은 8시에 나가서 일찍 잘게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Sujin이 Daniel에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "Sujin : ________________",
      points3: true,
      lines: [
        [
          "M",
          "Sujin and Daniel are organising the school's charity book sale together. " +
            "Daniel has spent three weeks collecting donated books from every class, " +
            "and he has gathered more than six hundred of them in the storage room. " +
            "He has also written a price on each one with a small sticker. " +
            "However, the sale runs for only two hours on Saturday morning, " +
            "and the hall has just four tables. Laying out six hundred books would take most of that time, " +
            "and buyers would be searching through unsorted piles rather than browsing. " +
            "Sujin does not want to suggest that the three weeks were wasted. " +
            "She wants to propose putting about two hundred of the best books on the tables " +
            "and keeping the rest in boxes to refill the tables as books sell. " +
            "In this situation, what would Sujin most likely say to Daniel?",
        ],
      ],
      choices: [
        "Let's collect more books before Saturday.",
        "Could we put two hundred out and refill from boxes?",
        "You should price them again more cheaply.",
        "Let's ask the school for more tables.",
        "I'll sort all six hundred myself tonight.",
      ],
      answer: 2,
      clue: "She wants to propose putting about two hundred of the best books on the tables and keeping the rest in boxes to refill the tables as books sell.",
      explanation:
        "수진이는 다니엘이 쏟은 3주를 깎아내리지 않으면서, 탁자에는 이백 권만 놓고 나머지는 상자에 두었다가 채우자고 말하려 한다. 따라서 ②가 가장 적절하다.",
      translation: [
        "M: 수진이와 다니엘은 학교 자선 책 판매를 함께 준비하고 있습니다. 다니엘은 3주 동안 반마다 다니며 기증받은 책을 모았고, 창고에 육백 권 넘게 쌓았습니다. 한 권마다 작은 스티커에 값도 적어 두었습니다. 그런데 판매는 토요일 아침 두 시간뿐이고, 강당에는 탁자가 네 개밖에 없습니다. 육백 권을 늘어놓는 데만 그 시간의 대부분이 들고, 사는 사람들은 구경하는 것이 아니라 정리되지 않은 더미를 뒤지게 됩니다. 수진이는 그 3주가 헛수고였다고 말하고 싶지 않습니다. 다만 좋은 책 이백 권쯤만 탁자에 놓고 나머지는 상자에 두었다가 팔리는 대로 채우자고 제안하고 싶습니다. 이런 상황에서 수진이가 다니엘에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 여자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "Good afternoon. Today I want to talk about why some plants make their own heat. " +
            "We think of warmth as an animal trait, but a handful of plants produce it deliberately. " +
            "The skunk cabbage is the clearest example. In late winter it pushes up through frozen ground " +
            "and holds its flower head about twenty degrees above the surrounding air, " +
            "sometimes for two weeks at a stretch. Melting the snow around itself is part of the point, " +
            "but not the main one. The heat lifts the plant's scent into the cold air, " +
            "where it travels much further than it otherwise would. " +
            "Early insects, with almost nothing else in flower, follow that scent and arrive. " +
            "The plant spends an enormous amount of stored energy doing this. " +
            "In return it gets the undivided attention of every pollinator awake in February.",
        ],
      ],
      choices: [
        "how some plants use heat to attract pollinators",
        "why snow melts faster near forest floors",
        "how insects survive the coldest months",
        "why flowers bloom earlier than they used to",
        "how plants store energy through winter",
      ],
      answer: 1,
      clue: "The heat lifts the plant's scent into the cold air, where it travels much further than it otherwise would.",
      explanation:
        "앉은부채가 스스로 열을 내어 향을 멀리 퍼뜨리고 이른 곤충을 불러 모으는 과정을 설명한다. 따라서 답은 ①이다.",
      translation: [
        "W: 안녕하세요. 오늘은 어떤 식물이 왜 스스로 열을 내는지 이야기하려 합니다. 우리는 온기를 동물의 것으로 여기지만, 몇몇 식물은 일부러 열을 냅니다. 앉은부채가 가장 분명한 예입니다. 늦겨울에 언 땅을 뚫고 올라와 꽃차례를 둘레 공기보다 20도쯤 높게 유지하는데, 때로는 2주 내내 그렇습니다. 둘레의 눈을 녹이는 것도 그 까닭의 하나지만 가장 큰 까닭은 아닙니다. 열은 식물의 향을 찬 공기 속으로 밀어 올리고, 그러면 향이 훨씬 멀리 퍼집니다. 피어 있는 꽃이 거의 없는 철에 깨어난 이른 곤충들이 그 향을 따라옵니다. 식물은 저장해 둔 힘을 엄청나게 씁니다. 그 대가로 2월에 깨어 있는 모든 꽃가루받이 곤충의 관심을 독차지합니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 앉은부채의 특징이 아닌 것은?",
      lines: [
        ["W", "Good afternoon. Today I want to talk about why some plants make their own heat."],
        ["W", "We think of warmth as an animal trait, but a handful of plants produce it deliberately."],
        ["W", "The skunk cabbage is the clearest example."],
        ["W", "In late winter it pushes up through frozen ground and holds its flower head about twenty degrees above the surrounding air, sometimes for two weeks at a stretch."],
        ["W", "Melting the snow around itself is part of the point, but not the main one."],
        ["W", "The heat lifts the plant's scent into the cold air, where it travels much further than it otherwise would."],
        ["W", "Early insects, with almost nothing else in flower, follow that scent and arrive."],
        ["W", "The plant spends an enormous amount of stored energy doing this."],
      ],
      choices: [
        "melting the snow around it",
        "holding heat for about two weeks",
        "spreading its scent through warm air",
        "using stored energy to make heat",
        "closing its flower head at night",
      ],
      answer: 5,
      clue: "The plant spends an enormous amount of stored energy doing this.",
      explanation:
        "눈을 녹이는 것, 2주쯤 열을 유지하는 것, 향을 퍼뜨리는 것, 저장한 힘을 쓰는 것은 언급되지만 밤에 꽃차례를 닫는다는 말은 없다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
