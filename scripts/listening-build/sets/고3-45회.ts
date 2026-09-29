/** 고3 듣기 45회 — 사람이 직접 쓴 회차 (2026-09-29) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고3 45회",
  gradeLevel: "high3",
  speechSpeed: 0.8,
  folder: "고3 듣기",
  questions: [
    {
      order: 1,
      type: "목적 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 목적으로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Good afternoon, everyone. This is the school newspaper. " +
            "Twice a term we print eight pages, and six of them are reports. " +
            "Reports of what the school did, written after it was over. " +
            "Nobody reads a report of something they attended themselves. " +
            "So from the next issue two of those pages belong to you. " +
            "Send us anything you have written: an argument, a review, a complaint. " +
            "Four hundred words or fewer, in an email, by the tenth of each month. " +
            "We will print what we can and reply to everything we cannot. " +
            "You do not have to be on the newspaper to be in it. " +
            "The address is on the noticeboard outside the staff room.",
        ],
      ],
      choices: [
        "학교 신문에 글을 보내 달라고 부탁하려고",
        "신문부 부원을 모집하려고",
        "신문 발행일 변경을 알리려고",
        "신문 구독을 권하려고",
        "기사 오류를 사과하려고",
      ],
      answer: 1,
      clue: "Send us anything you have written: an argument, a review, a complaint.",
      explanation:
        "학생들이 쓴 글을 신문에 보내 달라고 부탁하고 있다. 따라서 답은 ①이다.",
      translation: [
        "M: 여러분, 안녕하세요. 학교 신문입니다. 한 학기에 두 번 여덟 쪽을 내는데, 그중 여섯 쪽이 보도 기사입니다. 학교가 한 일을, 그 일이 끝난 뒤에 적은 글입니다. 자기가 참가한 일의 보도 기사를 읽는 사람은 없습니다. 그래서 다음 호부터 그중 두 쪽은 여러분 것입니다. 무엇이든 쓴 것을 보내 주세요. 주장하는 글도, 감상도, 불평도 좋습니다. 400낱말 이내로, 전자우편으로, 달마다 10일까지 보내 주세요. 실을 수 있는 것은 싣고, 싣지 못한 것에는 모두 답을 드리겠습니다. 신문부가 아니어도 신문에 실릴 수 있습니다. 주소는 교무실 앞 게시판에 붙어 있습니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 여자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Dahye, you've kept the same four textbooks all year."],
        ["W", "The same four, and I've been through each of them twice."],
        ["M", "The shop has six new ones out for this subject."],
        ["W", "They cover exactly what mine cover."],
        ["M", "A new book might explain something better, though."],
        ["W", "It might explain the same thing differently."],
        ["M", "Isn't that worth having?"],
        ["W", "Only if the first explanation failed."],
        ["M", "Mine usually fails somewhere in the middle."],
        ["W", "Then read that part again rather than buying a fifth book."],
        ["M", "Buying one always feels like progress."],
        ["W", "A second reading beats a second book every time."],
        ["M", "I'll go back to chapter four tonight."],
      ],
      choices: [
        "새 책을 사기보다 있는 책을 다시 읽어야 한다",
        "책은 여러 권 비교해야 한다",
        "책은 끝까지 읽어야 한다",
        "설명이 쉬운 책을 골라야 한다",
        "책에 직접 써 가며 읽어야 한다",
      ],
      answer: 1,
      clue: "A second reading beats a second book every time.",
      explanation:
        "여자는 새 책을 사기보다 있는 책을 다시 읽으라고 말한다. 따라서 답은 ①이다.",
      translation: [
        "M: 다혜야, 일 년 내내 같은 책 네 권만 보네.",
        "W: 그 네 권, 그리고 각각 두 번씩 봤어.",
        "M: 이 과목은 새 책이 여섯 권이나 나왔어.",
        "W: 내 책이 다루는 걸 똑같이 다뤄.",
        "M: 그래도 새 책이 더 잘 설명할 수도 있잖아.",
        "W: 같은 걸 다르게 설명할 수는 있겠지.",
        "M: 그게 값어치가 없어?",
        "W: 첫 설명이 실패했을 때만 있지.",
        "M: 내 건 늘 가운데쯤에서 실패해.",
        "W: 그럼 다섯 번째 책을 사지 말고 거기를 다시 읽어.",
        "M: 사는 건 늘 나아가는 것처럼 느껴져서.",
        "W: 두 번째 읽기가 두 번째 책을 늘 이겨.",
        "M: 오늘 밤에 4장으로 돌아가야겠다.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "We praise people for keeping their word under difficult conditions. " +
            "That praise is deserved, but it points at the wrong moment. " +
            "The promise that is hard to keep was usually easy to make. " +
            "It was made quickly, to end an awkward pause, " +
            "by someone who had not looked at next week's calendar. " +
            "The difficulty arrives later and is blamed on circumstances. " +
            "A person who takes a day before answering makes fewer promises " +
            "and breaks almost none of them. " +
            "Care belongs at the making, not at the keeping.",
        ],
      ],
      choices: [
        "약속은 지킬 때보다 할 때 신중해야 한다",
        "약속은 반드시 지켜야 한다",
        "약속은 글로 남겨야 한다",
        "거절하는 법을 배워야 한다",
        "약속 시간을 잘 지켜야 한다",
      ],
      answer: 1,
      clue: "Care belongs at the making, not at the keeping.",
      explanation:
        "약속은 지키는 순간보다 하는 순간에 신중해야 한다고 말한다. 따라서 답은 ①이다.",
      translation: [
        "M: 우리는 어려운 형편에서도 약속을 지킨 사람을 칭찬합니다. 그 칭찬은 마땅하지만 잘못된 순간을 가리킵니다. 지키기 어려운 약속은 대개 하기는 쉬웠던 약속입니다. 어색한 침묵을 끝내려고 서둘러, 다음 주 일정을 들여다보지도 않은 사람이 한 약속입니다. 어려움은 나중에 찾아오고, 사정 탓으로 돌려집니다. 답하기 전에 하루를 두는 사람은 약속을 더 적게 하고, 거의 어기지 않습니다. 조심은 지키는 자리가 아니라 하는 자리에 있어야 합니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["W", "Kyungho, is this the photo of the newspaper room?"],
        ["M", "We tidied it out at the start of term."],
        ["W", "There's a wide desk in the middle of the room."],
        ["M", "Four of us can work at it at once."],
        ["W", "And a pinboard covers the wall on the left."],
        ["M", "Every page goes up on it before we print."],
        ["W", "There's a filing cabinet in the right corner."],
        ["M", "Two of them, side by side, since last month."],
        ["W", "A lamp hangs low over the desk."],
        ["M", "It's the only one we ever switch on."],
        ["W", "And a stack of old issues sits by the door."],
        ["M", "We keep one copy of everything we've printed."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "Two of them, side by side, since last month.",
      explanation:
        "서류함이 하나라고 했지만 지난달부터 두 개라고 했다. 따라서 답은 ③이다.",
      figure: {
        kind: "figure5",
        scene:
          "A school newspaper room, clean black line art on a plain white background, no writing or letters anywhere. " +
          "A WIDE DESK stands in the middle of the room. " +
          "A PINBOARD covers the wall on the left. " +
          "ONE FILING CABINET stands in the right corner. " +
          "A LAMP hangs low over the desk. " +
          "A STACK OF OLD NEWSPAPERS sits on the floor by the door.",
        spots: [
          [0.48, 0.6],
          [0.1, 0.4],
          [0.87, 0.5],
          [0.48, 0.25],
          [0.68, 0.85],
        ],
      },
      translation: [
        "W: 경호야, 이게 신문부 방 사진이야?",
        "M: 학기 초에 정리했어.",
        "W: 방 가운데에 넓은 책상이 있네.",
        "M: 넷이 한꺼번에 일할 수 있어.",
        "W: 그리고 왼쪽 벽은 게시판이 덮고 있고.",
        "M: 인쇄하기 전에 모든 쪽을 거기 붙여.",
        "W: 오른쪽 구석에는 서류함이 있어.",
        "M: 지난달부터 나란히 두 개야.",
        "W: 책상 위에 등이 낮게 걸려 있네.",
        "M: 켜는 건 그것뿐이야.",
        "W: 그리고 문 옆에 옛날 신문이 쌓여 있고.",
        "M: 찍은 건 다 한 부씩 남겨 둬.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 여자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Bomi, the newspaper goes to the printer at eight."],
        ["W", "Seven pages are finished and checked."],
        ["M", "That's better than we managed last time."],
        ["W", "We started three days earlier this issue."],
        ["M", "Did anyone collect the photographs from the art room?"],
        ["W", "Junsu said he would bring them at four."],
        ["M", "He was called to the staff room and went home after."],
        ["W", "Then the photographs are still in the art room."],
        ["M", "How many does the back page need?"],
        ["W", "Five, and the page is empty without them."],
        ["M", "And the art room is locked at seven."],
        ["W", "It's twenty to seven right now."],
        ["M", "Then somebody has to go immediately."],
        ["W", "You can't; you're the only one who can check page eight."],
        ["M", "I'll stay and check the last page."],
        ["W", "I'll go and collect the photographs."],
      ],
      choices: [
        "마지막 쪽을 검토하기",
        "사진을 가져오기",
        "준수에게 연락하기",
        "인쇄소에 전화하기",
        "기사를 다시 쓰기",
      ],
      answer: 2,
      clue: "I'll go and collect the photographs.",
      explanation:
        "여자는 미술실에 가서 사진을 가져오겠다고 했다. 따라서 답은 ②이다.",
      translation: [
        "M: 보미야, 신문은 여덟 시에 인쇄소로 넘어가.",
        "W: 일곱 쪽은 다 끝내고 검토도 했어.",
        "M: 지난번보다 낫다.",
        "W: 이번 호는 사흘 일찍 시작했잖아.",
        "M: 미술실에서 사진은 누가 가져왔어?",
        "W: 준수가 네 시에 가져오겠다고 했어.",
        "M: 교무실에 불려 갔다가 그대로 집에 갔어.",
        "W: 그럼 사진은 아직 미술실에 있겠네.",
        "M: 마지막 쪽에 몇 장이나 필요해?",
        "W: 다섯 장, 그게 없으면 그 쪽은 텅 비어.",
        "M: 그리고 미술실은 일곱 시에 잠가.",
        "W: 지금 일곱 시 20분 전이야.",
        "M: 그럼 누군가 당장 가야 해.",
        "W: 너는 안 돼. 여덟 쪽을 볼 사람은 너뿐이야.",
        "M: 나는 남아서 마지막 쪽을 검토할게.",
        "W: 내가 가서 사진을 가져올게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 남자가 지불할 금액을 고르시오.",
      lines: [
        ["W", "Welcome to the camera shop. What can I do for you?"],
        ["M", "I'd like to rent a camera and two lenses."],
        ["W", "The camera is twenty dollars a day."],
        ["M", "Is the older model cheaper than that?"],
        ["W", "It is, but both of them are out this week."],
        ["M", "Then I'll take the newer one."],
        ["W", "And each lens is ten dollars a day."],
        ["M", "I need everything for two days."],
        ["W", "Would you like a memory card as well?"],
        ["M", "No, thank you. I brought my own."],
        ["W", "Are you renting for a school club?"],
        ["M", "The school newspaper. Here's my card."],
        ["W", "School clubs get ten percent off the total."],
        ["M", "Good. I'll pay now."],
      ],
      choices: ["$64.00", "$68.00", "$72.00", "$76.00", "$80.00"],
      answer: 3,
      clue: "The camera is twenty dollars a day.",
      explanation:
        "이틀 동안 사진기 40달러와 렌즈 두 개 40달러로 80달러인데, 10퍼센트를 빼면 72달러이다. 따라서 답은 ③이다.",
      translation: [
        "W: 사진기 가게에 오신 걸 환영합니다. 무엇을 도와드릴까요?",
        "M: 사진기 한 대와 렌즈 두 개를 빌리려고요.",
        "W: 사진기는 하루에 20달러입니다.",
        "M: 옛날 모델은 더 싼가요?",
        "W: 싸지만 이번 주에는 둘 다 나가 있어요.",
        "M: 그럼 새것으로 할게요.",
        "W: 그리고 렌즈는 하나에 하루 10달러입니다.",
        "M: 전부 이틀 동안 필요해요.",
        "W: 메모리 카드도 드릴까요?",
        "M: 아니요, 제 것이 있어요.",
        "W: 학교 동아리에서 빌리시는 건가요?",
        "M: 학교 신문부요. 여기 카드입니다.",
        "W: 학교 동아리는 전체에서 10퍼센트 할인됩니다.",
        "M: 좋네요. 지금 낼게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 여자가 기사 쓰기를 미룬 이유를 고르시오.",
      lines: [
        ["M", "Seoyul, your article wasn't in this month's issue."],
        ["M", "You finished writing it two weeks ago."],
        ["W", "I did, and it's sitting in the folder."],
        ["M", "Did the editor turn it down?"],
        ["W", "She said it was the best thing I'd written."],
        ["M", "Were you worried about the subject?"],
        ["W", "Not about the subject at all."],
        ["M", "Then why hold it back?"],
        ["W", "It's about the seat allocation, which changes in December."],
        ["M", "So half of it would be wrong by the time it was read."],
        ["W", "Printing it in January costs nothing and tells the truth."],
        ["M", "Then waiting is the right call."],
      ],
      choices: [
        "12월에 제도가 바뀌어서",
        "편집장이 거절해서",
        "글이 마음에 들지 않아서",
        "시간이 없어서",
        "주제가 부담스러워서",
      ],
      answer: 1,
      clue: "It's about the seat allocation, which changes in December.",
      explanation:
        "12월에 좌석 제도가 바뀌어 지금 실으면 절반이 틀리게 되기 때문이다. 따라서 답은 ①이다.",
      translation: [
        "M: 서율아, 이번 달 신문에 네 기사가 없더라.",
        "M: 두 주 전에 다 썼잖아.",
        "W: 다 썼지, 폴더에 들어 있어.",
        "M: 편집장이 안 된다고 했어?",
        "W: 내가 쓴 것 중 제일 낫다고 했어.",
        "M: 주제가 걱정됐어?",
        "W: 주제는 전혀 아니야.",
        "M: 그럼 왜 미뤘어?",
        "W: 좌석 배정에 대한 글인데 12월에 바뀌거든.",
        "M: 그럼 읽힐 때쯤이면 절반이 틀리겠네.",
        "W: 1월에 실으면 손해도 없고 사실도 맞아.",
        "M: 그럼 기다리는 게 맞네.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 진로 체험의 날에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["W", "Jinwoo, are you going on the career experience day?"],
        ["W", "The form came round in class this morning."],
        ["M", "We visit workplaces in the city this year."],
        ["W", "Not the university like last time?"],
        ["M", "Workplaces, because more students asked for it."],
        ["W", "When is it happening?"],
        ["M", "The fifth of December, all day."],
        ["W", "How do we get there?"],
        ["M", "By school bus, leaving at half past eight."],
        ["W", "How many places can we choose from?"],
        ["M", "Nine, and you put down two in order."],
        ["W", "Do we wear uniform?"],
        ["M", "Uniform, because we're visiting as the school."],
        ["W", "Then I'll put the hospital down first."],
      ],
      choices: ["가는 곳", "날짜", "가는 방법", "고를 수 있는 곳의 수", "돌아오는 시각"],
      answer: 5,
      clue: "The fifth of December, all day.",
      explanation:
        "가는 곳, 날짜, 가는 방법, 고를 수 있는 곳의 수는 말했지만 돌아오는 시각은 말하지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 진우야, 진로 체험의 날 갈 거야?",
        "W: 오늘 아침에 반에서 신청서 돌았잖아.",
        "M: 올해는 시내 직장들을 가.",
        "W: 지난번처럼 대학이 아니고?",
        "M: 직장을 더 많이들 원해서 그렇게 됐대.",
        "W: 언제 해?",
        "M: 12월 5일, 하루 종일.",
        "W: 어떻게 가?",
        "M: 학교 버스로, 여덟 시 반에 출발해.",
        "W: 몇 군데 중에서 고를 수 있어?",
        "M: 아홉 군데, 두 군데를 차례대로 적어.",
        "W: 교복 입어?",
        "M: 학교 이름으로 가는 거라 교복이야.",
        "W: 그럼 나는 병원을 첫 번째로 적을래.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "다음을 듣고, 학교 신문 편집부 모집에 관한 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "W",
          "Hello, students. The school newspaper is taking new members. " +
            "Six places are open, four for writers and two for photographers. " +
            "You do not need any experience to apply. " +
            "Send one piece of your own writing, any subject, to the newspaper email. " +
            "Photographers send three photographs instead of writing. " +
            "There is no interview; we read everything that comes in. " +
            "The editorial meeting is every Wednesday after school. " +
            "Members are expected at two meetings out of three. " +
            "Applications close on the twenty-fifth of November.",
        ],
      ],
      choices: [
        "여섯 자리를 뽑는다",
        "경험이 없어도 지원할 수 있다",
        "글 한 편을 보내야 한다",
        "면접을 본다",
        "편집 회의는 수요일에 한다",
      ],
      answer: 4,
      clue: "There is no interview; we read everything that comes in.",
      explanation:
        "면접은 없다고 했으므로 ④가 일치하지 않는다.",
      translation: [
        "W: 학생 여러분, 안녕하세요. 학교 신문에서 새 부원을 뽑습니다. 여섯 자리가 열려 있고, 기자 네 자리와 사진 두 자리입니다. 지원하는 데 경험은 필요하지 않습니다. 주제는 무엇이든 좋으니 직접 쓴 글 한 편을 신문 전자우편으로 보내 주세요. 사진 쪽은 글 대신 사진 세 장을 보내 주세요. 면접은 없습니다. 들어온 것은 모두 읽습니다. 편집 회의는 수요일마다 방과 후에 합니다. 부원은 세 번 중 두 번은 회의에 나와 주셔야 합니다. 지원은 11월 25일에 마감합니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 남자가 고를 인쇄소를 고르시오.",
      lines: [
        ["W", "Hoyeon, which printer will the newspaper use?"],
        ["M", "Five of them sent us a quotation."],
        ["W", "I saw the sheet on the editor's desk."],
        ["M", "They can all take the file by email."],
        ["W", "Do you need it printed in colour?"],
        ["M", "The back page has photographs, so yes."],
        ["W", "Two of these five print in black and white only."],
        ["M", "Then those are out from the start."],
        ["W", "How soon do you need the copies?"],
        ["M", "Within three days, or the news is stale."],
        ["W", "One of the rest takes five days."],
        ["M", "And it should be under two hundred thousand won."],
        ["W", "That takes out one more of them."],
        ["M", "Then there's only one printer left."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 5,
      clue: "The back page has photographs, so yes.",
      explanation:
        "색 인쇄가 되고, 사흘 안에 나오며, 20만 원 미만인 곳은 ⑤이다. 따라서 답은 ⑤이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Colour: No / Days: 2 / Price: 150,000 won" },
          { no: 2, label: "②", value: "Colour: Yes / Days: 5 / Price: 170,000 won" },
          { no: 3, label: "③", value: "Colour: No / Days: 3 / Price: 160,000 won" },
          { no: 4, label: "④", value: "Colour: Yes / Days: 2 / Price: 230,000 won" },
          { no: 5, label: "⑤", value: "Colour: Yes / Days: 3 / Price: 190,000 won" },
        ],
      },
      translation: [
        "W: 호연아, 신문은 어느 인쇄소에 맡길 거야?",
        "M: 다섯 군데서 견적을 보냈어.",
        "W: 편집장 책상에 놓인 표를 봤어.",
        "M: 다 전자우편으로 파일을 받아 줘.",
        "W: 색으로 뽑아야 해?",
        "M: 마지막 쪽에 사진이 있어서 그래야 해.",
        "W: 이 다섯 중 두 곳은 흑백만 돼.",
        "M: 그럼 그건 처음부터 빠지고.",
        "W: 얼마나 빨리 나와야 해?",
        "M: 사흘 안에, 아니면 소식이 묵어.",
        "W: 나머지 중 하나는 닷새가 걸려.",
        "M: 그리고 20만 원 미만이어야 해.",
        "W: 그럼 하나가 더 빠지네.",
        "M: 그럼 남는 인쇄소는 하나뿐이야.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Did you send anything to the school newspaper?"],
        ["M", "I wrote something but never sent it."],
        ["W", "The deadline is the tenth of the month."],
        ["M", "That's the day after tomorrow, isn't it?"],
        ["W", "Shall I send you the address now?"],
      ],
      choices: [
        "The newspaper stopped printing.",
        "Yes, that would help.",
        "I don't write anything.",
        "The deadline was last week.",
        "I'll write it next year.",
      ],
      answer: 2,
      clue: "Shall I send you the address now?",
      explanation:
        "지금 주소를 보내 주겠다는 제안이므로, 그러면 도움이 되겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 학교 신문에 뭐 보냈어?",
        "M: 써 놓기는 했는데 안 보냈어.",
        "W: 마감이 그 달 10일이야.",
        "M: 그럼 모레잖아?",
        "W: 지금 주소 보내 줄까?",
        "M: 응, 그러면 도움이 되겠다.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Excuse me, is there an interview for the newspaper?"],
        ["W", "No interview at all. We read what you send."],
        ["M", "Then what should I send if I want to take photographs?"],
        ["W", "Three photographs instead of a piece of writing."],
        ["M", "And when do applications close?"],
      ],
      choices: [
        "We take members all year.",
        "On the twenty-fifth of November.",
        "The interview is on Friday.",
        "Send four photographs.",
        "There are no places left.",
      ],
      answer: 2,
      clue: "And when do applications close?",
      explanation:
        "지원이 언제 마감되는지 물었으므로, 11월 25일이라는 ②가 가장 자연스럽다.",
      translation: [
        "M: 실례합니다, 신문부는 면접이 있나요?",
        "W: 면접은 없어요. 보내 주신 걸 읽습니다.",
        "M: 사진을 하고 싶으면 뭘 보내면 되나요?",
        "W: 글 대신 사진 세 장을 보내 주세요.",
        "M: 지원은 언제 마감인가요?",
        "W: 11월 25일입니다.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Nari, how did the club's recruiting go this year?"],
        ["W", "Forty came to the first meeting and nine stayed."],
        ["M", "Was the first meeting badly run?"],
        ["W", "We explained everything and answered every question."],
        ["M", "How long did the explaining take?"],
        ["W", "An hour and ten minutes, near enough."],
        ["M", "And they sat and listened for all of it."],
        ["W", "Nobody did anything with their hands."],
        ["M", "Forty people came to join a club, not a lecture."],
        ["W", "We thought explaining well was the welcoming part."],
        ["M", "What would you do in the first ten minutes instead?"],
      ],
      choices: [
        "Explain the rules more carefully.",
        "Give everyone something to make.",
        "Invite fewer people next time.",
        "Speak for longer than an hour.",
        "Hand out a printed guide.",
      ],
      answer: 2,
      clue: "What would you do in the first ten minutes instead?",
      explanation:
        "설명만 듣다 돌아갔다는 이야기이므로, 첫 10분에 직접 만들 거리를 주자는 ②가 가장 자연스럽다.",
      translation: [
        "M: 나리야, 올해 동아리 모집은 어땠어?",
        "W: 첫 모임에 마흔 명이 왔는데 아홉 명이 남았어.",
        "M: 첫 모임이 엉성했어?",
        "W: 다 설명했고 질문에도 다 답했어.",
        "M: 설명하는 데 얼마나 걸렸어?",
        "W: 한 시간 10분쯤.",
        "M: 그동안 내내 앉아서 듣기만 했고.",
        "W: 아무도 손으로 뭘 하지는 않았어.",
        "M: 마흔 명은 강의가 아니라 동아리에 들어오러 온 거야.",
        "W: 잘 설명하는 게 반기는 거라고 생각했어.",
        "M: 그럼 첫 10분에 뭘 할 거야?",
        "W: 다들 만들 거리를 하나씩 손에 쥐여 줄래.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Minseok, you said your essays always run out of time."],
        ["M", "I write three paragraphs and the hour is gone."],
        ["W", "How long do you spend before you start writing?"],
        ["M", "Twenty minutes, sometimes twenty-five."],
        ["W", "Doing what, exactly?"],
        ["M", "Thinking about how to begin the first sentence."],
        ["W", "So you plan the sentence, not the argument."],
        ["M", "The opening has to be right before I can go on."],
        ["W", "And you rewrite that sentence when the essay is done."],
        ["M", "Every single time, now that you mention it."],
        ["W", "What would those twenty minutes be better spent on?"],
      ],
      choices: [
        "A better first sentence.",
        "Listing the points in order.",
        "Reading the question again.",
        "Writing faster than before.",
        "Nothing at all.",
      ],
      answer: 2,
      clue: "What would those twenty minutes be better spent on?",
      explanation:
        "첫 문장에 매달리는 대신 논지를 차례로 적는 ②가 가장 자연스럽다.",
      translation: [
        "W: 민석아, 글 쓸 때 늘 시간이 모자란다고 했잖아.",
        "M: 세 문단 쓰면 한 시간이 다 가.",
        "W: 쓰기 시작하기 전에 얼마나 써?",
        "M: 20분, 어떤 때는 25분.",
        "W: 정확히 뭘 하는데?",
        "M: 첫 문장을 어떻게 시작할지 생각해.",
        "W: 그러니까 논지가 아니라 문장을 짜는구나.",
        "M: 첫머리가 제대로 돼야 이어 갈 수 있어서.",
        "W: 그리고 다 쓰고 나면 그 문장을 다시 쓰지.",
        "M: 말 듣고 보니 매번 그러네.",
        "W: 그 20분을 무엇에 쓰는 게 나을까?",
        "M: 할 말을 차례대로 적어 두는 데 쓸래.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Sujin이 Daeun에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Sujin : ________________",
      lines: [
        [
          "W",
          "Sujin and Daeun are finishing the newspaper before the deadline. " +
            "Daeun has written a report naming a student who broke a school rule, " +
            "and she has used the student's full name and class in the first line. " +
            "The report is accurate and Daeun checked every detail twice. " +
            "Sujin knows that the newspaper goes to every family in the school " +
            "and that a name printed once cannot be taken back afterwards. " +
            "The report works just as well with the name left out. " +
            "She wants Daeun to remove the name before they send the file. " +
            "In this situation, what would Sujin most likely say to Daeun?",
        ],
      ],
      choices: [
        "Check the details once more.",
        "Take the student's name out.",
        "Send the file right away.",
        "Write a longer report.",
        "Put it on the front page.",
      ],
      answer: 2,
      clue: "She wants Daeun to remove the name before they send the file.",
      explanation:
        "이름을 빼도 기사가 성립하고 한번 실린 이름은 거둘 수 없으므로, 이름을 빼라는 ②가 가장 적절하다.",
      translation: [
        "W: 수진이와 다은이는 마감 전에 신문을 마무리하고 있습니다. 다은이는 교칙을 어긴 학생을 다룬 기사를 썼는데, 첫 줄에 그 학생의 이름과 반을 그대로 적었습니다. 기사는 사실이고 다은이는 모든 내용을 두 번 확인했습니다. 수진이는 이 신문이 학교의 모든 가정에 간다는 것과, 한번 실린 이름은 나중에 거둘 수 없다는 것을 압니다. 이름을 빼도 기사는 그대로 성립합니다. 그는 파일을 보내기 전에 다은이가 이름을 지우기를 바랍니다. 이런 상황에서 수진이가 다은이에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 여자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "Hello, everyone. Today I want to talk about why the same news story " +
            "can look entirely different in two honest newspapers. " +
            "Neither has printed anything untrue, and both have checked their facts. " +
            "The difference lies in what each chose to put in the first sentence. " +
            "A report that opens with the number of people affected " +
            "reads as a disaster, while one that opens with the cause reads as a failure. " +
            "Everything after the first sentence is understood in its light. " +
            "Editors know this, and choosing that sentence is the real work of the day. " +
            "A reader who wants the whole picture must read the same event twice.",
        ],
      ],
      choices: [
        "how the opening sentence shapes a news story",
        "why newspapers print untrue reports",
        "how editors check their facts",
        "why disasters are reported first",
        "how readers choose a newspaper",
      ],
      answer: 1,
      clue: "Everything after the first sentence is understood in its light.",
      explanation:
        "첫 문장이 기사 전체를 어떻게 읽히게 하는지가 중심 내용이다. 따라서 답은 ①이다.",
      translation: [
        "W: 여러분, 안녕하세요. 오늘은 같은 사건이 정직한 두 신문에서 어떻게 전혀 달라 보이는지 이야기하려 합니다. 어느 쪽도 거짓을 싣지 않았고, 둘 다 사실을 확인했습니다. 차이는 각자가 첫 문장에 무엇을 넣기로 했는가에 있습니다. 피해를 입은 사람 수로 시작하는 기사는 참사로 읽히고, 원인으로 시작하는 기사는 실책으로 읽힙니다. 첫 문장 뒤의 모든 것은 그 빛 아래에서 이해됩니다. 편집자들은 이것을 알고 있고, 그 한 문장을 고르는 일이 그날의 진짜 일입니다. 전체를 보고 싶은 독자는 같은 사건을 두 번 읽어야 합니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "다음을 듣고, 언급된 것이 아닌 것을 고르시오.",
      lines: [
        ["W", "The same news story can look different in two honest newspapers."],
        ["W", "The difference lies in what each put in the first sentence."],
        ["W", "A report that opens with the number of people reads as a disaster."],
        ["W", "Editors know this, and choosing that sentence is the real work."],
        ["W", "A reader who wants the whole picture must read the event twice."],
      ],
      choices: ["newspapers", "the first sentence", "editors", "a reader", "a photograph"],
      answer: 5,
      clue: "Editors know this, and choosing that sentence is the real work.",
      explanation:
        "신문, 첫 문장, 편집자, 독자는 언급되지만 사진은 나오지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
