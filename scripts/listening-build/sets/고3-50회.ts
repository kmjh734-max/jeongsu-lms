/** 고3 듣기 50회 — 사람이 직접 쓴 회차 (2026-09-30) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고3 50회",
  gradeLevel: "high3",
  speechSpeed: 0.8,
  folder: "고3 듣기",
  questions: [
    {
      order: 1,
      type: "목적 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 목적으로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "Good afternoon, everyone. This is the library speaking. " +
            "Thirty-one books borrowed in March have still not come back. " +
            "We are not asking for them today, and nobody will be charged. " +
            "We are telling you that the amnesty week begins on Monday. " +
            "Bring a book back between Monday and Friday and nothing is said, " +
            "no matter how late it is or what state it is in. " +
            "We would rather have a damaged book on the shelf than a perfect one in a drawer. " +
            "After Friday the ordinary rules come back, so use the week. " +
            "There is a box inside the door if you would rather not hand it over.",
        ],
      ],
      choices: [
        "연체된 책을 벌 없이 반납하는 주간을 알리려고",
        "도서관 이용 시간 변경을 알리려고",
        "훼손된 책 변상을 요청하려고",
        "도서 기증을 부탁하려고",
        "독서 행사를 안내하려고",
      ],
      answer: 1,
      clue: "We are telling you that the amnesty week begins on Monday.",
      explanation:
        "연체된 책을 벌 없이 돌려받는 주간이 시작된다고 알리고 있다. 따라서 답은 ①이다.",
      translation: [
        "W: 여러분, 안녕하세요. 도서관입니다. 3월에 빌려 간 책 서른한 권이 아직 돌아오지 않았습니다. 오늘 그 책을 내놓으라는 말씀을 드리는 것이 아니고, 누구에게도 값을 물리지 않습니다. 월요일부터 면책 주간이 시작된다는 것을 알려 드리는 것입니다. 월요일부터 금요일 사이에 책을 돌려주시면 얼마나 늦었든 어떤 꼴이든 아무 말도 하지 않습니다. 서랍 속의 멀쩡한 책보다 서가에 놓인 상한 책이 낫습니다. 금요일이 지나면 본래 규칙으로 돌아가니 이 주를 쓰십시오. 직접 건네기가 어려우면 문 안쪽에 상자를 두었습니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 남자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Minseo, you always write the summary before you start the reading?"],
        ["M", "Three sentences on what I expect to find."],
        ["W", "But you haven't read it yet."],
        ["M", "That's exactly why the three sentences are worth something."],
        ["W", "They'll just be wrong, though."],
        ["M", "Half of them are, and those halves are the whole point."],
        ["W", "Because you notice where the text surprises you."],
        ["M", "Without them I read along agreeing with everything."],
        ["W", "And afterwards it all feels obvious."],
        ["M", "Everything feels obvious once someone has said it."],
        ["W", "So the guess is there to be broken."],
        ["M", "Guess first, then read, and the reading has something to push against."],
        ["W", "I'll write three lines before the next chapter."],
      ],
      choices: [
        "읽기 전에 먼저 짐작을 적어 두어야 한다",
        "읽고 나서 요약을 써야 한다",
        "어려운 책부터 읽어야 한다",
        "읽은 것을 남에게 설명해야 한다",
        "한 번에 한 권만 읽어야 한다",
      ],
      answer: 1,
      clue: "Guess first, then read, and the reading has something to push against.",
      explanation:
        "남자는 읽기 전에 짐작을 적어 두어야 읽는 동안 견줄 것이 생긴다고 말한다. 따라서 답은 ①이다.",
      translation: [
        "W: 민서야, 너는 읽기 전에 늘 요약부터 써?",
        "M: 무엇이 나올 것 같은지 세 문장.",
        "W: 아직 읽지도 않았잖아.",
        "M: 그래서 그 세 문장이 값어치가 있는 거야.",
        "W: 그래도 틀릴 텐데.",
        "M: 절반은 틀리지. 그 절반이 핵심이야.",
        "W: 글이 어디서 너를 놀라게 하는지 보이니까.",
        "M: 그게 없으면 다 옳다고 고개만 끄덕이며 읽어.",
        "W: 그리고 다 읽고 나면 전부 뻔하게 느껴지고.",
        "M: 누가 말해 놓은 건 다 뻔해 보여.",
        "W: 그러니까 짐작은 깨지라고 적는 거구나.",
        "M: 먼저 짐작하고 읽으면, 읽는 동안 밀어 볼 것이 생겨.",
        "W: 다음 장 읽기 전에 세 줄 써 볼게.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "When a group is asked to decide something, someone speaks first, " +
            "and that person shapes what everybody else is able to say. " +
            "The second speaker is no longer answering the question; " +
            "they are agreeing with the first or arguing against them. " +
            "By the fourth speaker the range of the discussion is fixed. " +
            "This is why a room can be full of independent minds " +
            "and still produce an opinion narrower than any one of them holds. " +
            "Write down your own answer before anyone opens their mouth. " +
            "A meeting can only pool what the room brought into it.",
        ],
      ],
      choices: [
        "의논 전에 저마다 답을 적어 두어야 한다",
        "회의는 짧게 끝내야 한다",
        "먼저 말하는 사람이 정해져야 한다",
        "다수의 뜻을 따라야 한다",
        "회의 기록을 남겨야 한다",
      ],
      answer: 1,
      clue: "Write down your own answer before anyone opens their mouth.",
      explanation:
        "먼저 말한 사람이 논의의 폭을 가두므로 입을 열기 전에 저마다 답을 적으라고 말한다. 따라서 답은 ①이다.",
      translation: [
        "W: 모임이 무언가를 정하라는 물음을 받으면 누군가 먼저 말하고, 그 사람이 나머지 사람들이 할 수 있는 말의 모양을 정합니다. 두 번째로 말하는 사람은 더 이상 그 물음에 답하는 것이 아닙니다. 첫 사람에게 동의하거나 반대하는 것입니다. 네 번째 사람에 이르면 의논의 폭은 이미 굳어 있습니다. 그래서 방 안에 저마다 생각하는 사람이 가득해도, 그중 누구의 생각보다도 좁은 결론이 나올 수 있는 것입니다. 누가 입을 열기 전에 자기 답을 적어 두십시오. 회의는 그 방이 들여온 것만 모을 수 있습니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["M", "Areum, is this a photo of the library return desk?"],
        ["W", "They rearranged it for the amnesty week."],
        ["M", "There's a wide counter across the front."],
        ["W", "Everything comes back over that."],
        ["M", "And a wooden box stands beside the door."],
        ["W", "That's for anyone who'd rather not hand it over."],
        ["M", "A round clock hangs above the shelves."],
        ["W", "It's square, actually. The round one broke in June."],
        ["M", "There's a trolley of books in the right corner."],
        ["W", "We shelve those on Friday afternoons."],
        ["M", "And a notice board covers the left wall."],
        ["W", "The week's notice went up on it yesterday."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "It's square, actually. The round one broke in June.",
      explanation:
        "시계가 둥글다고 했지만 네모나다고 했다. 따라서 답은 ③이다.",
      figure: {
        kind: "figure5",
        scene:
          "A school library return desk area, clean black line art on a plain white background, no writing or letters anywhere. " +
          "A WIDE COUNTER runs across the front of the room. " +
          "A WOODEN BOX stands on the floor beside the door. " +
          "A ROUND CLOCK hangs on the wall above the shelves. " +
          "A TROLLEY OF BOOKS stands in the right corner. " +
          "A NOTICE BOARD covers the left wall.",
        spots: [
          [0.5, 0.66],
          [0.68, 0.86],
          [0.52, 0.12],
          [0.88, 0.5],
          [0.09, 0.42],
        ],
      },
      translation: [
        "M: 아름아, 이게 도서관 반납대 사진이야?",
        "W: 면책 주간 하려고 자리를 바꿨어.",
        "M: 앞쪽을 가로질러 넓은 안내대가 있네.",
        "W: 다 그리로 돌아와.",
        "M: 그리고 문 옆에 나무 상자가 있고.",
        "W: 직접 건네기 어려운 사람을 위한 거야.",
        "M: 서가 위에 둥근 시계가 걸려 있어.",
        "W: 사실 네모야. 둥근 건 6월에 망가졌어.",
        "M: 오른쪽 구석에는 책 수레가 있네.",
        "W: 그건 금요일 오후에 꽂아.",
        "M: 그리고 왼쪽 벽은 게시판이 덮고 있고.",
        "W: 어제 이번 주 알림이 거기 붙었어.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 남자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Jiwon, the book fair opens at nine tomorrow."],
        ["W", "The tables are out and the signs are up."],
        ["M", "I sorted the donated books into boxes this morning."],
        ["W", "Did anyone collect the cash box from the office?"],
        ["M", "Seoyeon said she would bring it at three."],
        ["W", "She was called home early by her mother."],
        ["M", "Then the cash box is still in the office."],
        ["W", "And we can't take a single won without it."],
        ["M", "How much float does it hold?"],
        ["W", "Fifty thousand won in small notes and coins."],
        ["M", "And the office is locked at six."],
        ["W", "It's ten to six right now."],
        ["M", "Then I have to run for it."],
        ["W", "I'll finish pricing the last two boxes."],
        ["M", "I'll go and fetch the cash box."],
      ],
      choices: [
        "책값을 매기기",
        "기증 도서를 나누기",
        "돈통을 가져오기",
        "서연이에게 연락하기",
        "탁자를 놓기",
      ],
      answer: 3,
      clue: "I'll go and fetch the cash box.",
      explanation:
        "남자는 사무실에서 돈통을 가져오겠다고 했다. 따라서 답은 ③이다.",
      translation: [
        "W: 지원아, 책 장터는 내일 아홉 시에 열어.",
        "W: 탁자는 내놨고 안내판도 세웠어.",
        "M: 기증받은 책은 오늘 아침에 상자에 나눠 담았어.",
        "W: 사무실에서 돈통은 누가 가져왔어?",
        "M: 서연이가 세 시에 가져오겠다고 했어.",
        "W: 어머니가 일찍 오라고 하셔서 갔어.",
        "M: 그럼 돈통은 아직 사무실에 있겠네.",
        "W: 그게 없으면 한 푼도 받을 수 없어.",
        "M: 거스름돈이 얼마나 들어 있어?",
        "W: 잔돈으로 5만 원.",
        "M: 그리고 사무실은 여섯 시에 잠가.",
        "W: 지금 여섯 시 10분 전이야.",
        "M: 그럼 뛰어가야겠다.",
        "W: 나는 남은 두 상자 값 매기는 걸 마무리할게.",
        "M: 내가 가서 돈통을 가져올게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 여자가 지불할 금액을 고르시오.",
      lines: [
        ["M", "Welcome to the book fair. What have you found?"],
        ["W", "Five novels and three picture books, please."],
        ["M", "The novels are four dollars each today."],
        ["W", "Were they not three dollars this morning?"],
        ["M", "They were, until the new boxes came out at noon."],
        ["W", "Then five at four dollars it is."],
        ["M", "And the picture books are five dollars each."],
        ["W", "Is there a cheaper box anywhere?"],
        ["M", "The two-dollar box is by the door, but it's all textbooks."],
        ["W", "Then I'll take these."],
        ["M", "Are you paying with a school card?"],
        ["W", "Here it is. Does that help?"],
        ["M", "School cards get ten percent off the total."],
        ["W", "Good. I'll pay in cash."],
      ],
      choices: ["$28.00", "$31.50", "$33.00", "$35.00", "$38.50"],
      answer: 2,
      clue: "The novels are four dollars each today.",
      explanation:
        "소설 5권 20달러와 그림책 3권 15달러로 35달러인데, 10퍼센트를 빼면 31.50달러이다. 따라서 답은 ②이다.",
      translation: [
        "M: 책 장터에 오신 걸 환영합니다. 무엇을 고르셨나요?",
        "W: 소설 다섯 권과 그림책 세 권 주세요.",
        "M: 소설은 오늘 한 권에 4달러입니다.",
        "W: 오늘 아침에는 3달러 아니었나요?",
        "M: 맞는데 정오에 새 상자가 나오면서 올랐어요.",
        "W: 그럼 4달러짜리로 다섯 권이요.",
        "M: 그리고 그림책은 한 권에 5달러입니다.",
        "W: 더 싼 상자는 없나요?",
        "M: 문 옆에 2달러 상자가 있는데 전부 교과서예요.",
        "W: 그럼 이걸로 할게요.",
        "M: 학교 카드로 내시나요?",
        "W: 여기 있어요. 도움이 되나요?",
        "M: 학교 카드는 전체에서 10퍼센트 할인됩니다.",
        "W: 좋네요. 현금으로 낼게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 여자가 책을 늦게 반납한 이유를 고르시오.",
      lines: [
        ["M", "Haeun, that book has been out since March."],
        ["M", "You finished reading it before the holidays."],
        ["W", "I did, and it's been on my desk ever since."],
        ["M", "Did you forget it was there?"],
        ["W", "I looked at it every single morning."],
        ["M", "Were you worried about the late charge?"],
        ["W", "I didn't know there was one until today."],
        ["M", "Then why not just bring it back?"],
        ["W", "My little brother spilled juice on two pages."],
        ["M", "So you were waiting for a way to hide it."],
        ["W", "Every week it got later and harder to walk in with."],
        ["M", "Then this week is exactly for you."],
      ],
      choices: [
        "책이 상해서 내놓기가 어려워서",
        "연체료가 무서워서",
        "책을 잃어버려서",
        "아직 다 읽지 못해서",
        "도서관이 문을 닫아서",
      ],
      answer: 1,
      clue: "My little brother spilled juice on two pages.",
      explanation:
        "동생이 책을 얼룩지게 해 내놓기가 어려워 미뤘다. 따라서 답은 ①이다.",
      translation: [
        "M: 하은아, 그 책 3월부터 빌려 간 거잖아.",
        "M: 방학 전에 다 읽었고.",
        "W: 다 읽었지, 그 뒤로 책상 위에 있어.",
        "M: 거기 있는 걸 잊었어?",
        "W: 아침마다 쳐다봤어.",
        "M: 연체료가 걱정됐어?",
        "W: 오늘까지 연체료가 있는 줄도 몰랐어.",
        "M: 그럼 그냥 갖다 놓지 그랬어?",
        "W: 동생이 두 쪽에 주스를 쏟았어.",
        "M: 그래서 감출 방법을 기다린 거구나.",
        "W: 한 주가 갈수록 더 늦어지고 들고 가기 더 어려워졌어.",
        "M: 그럼 이번 주가 딱 너를 위한 거네.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 도서관 책 장터에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["W", "Junho, are you helping at the book fair?"],
        ["W", "The notice went up by the stairs on Monday."],
        ["M", "It's held in the library hall this year."],
        ["W", "Not in the yard like last time?"],
        ["M", "The hall, because of the weather."],
        ["W", "When is it?"],
        ["M", "The seventh of November, from nine until three."],
        ["W", "Where do the books come from?"],
        ["M", "Families donated them through October."],
        ["W", "How much are they?"],
        ["M", "Two to five dollars, depending on the box."],
        ["W", "What happens to the money?"],
        ["M", "It buys new books for the library."],
        ["W", "Then I'll come and help in the morning."],
      ],
      choices: ["열리는 곳", "열리는 날과 시각", "책을 모은 방법", "책값", "필요한 도우미 수"],
      answer: 5,
      clue: "The seventh of November, from nine until three.",
      explanation:
        "장소, 날짜와 시각, 책을 모은 방법, 책값은 말했지만 도우미 수는 말하지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 준호야, 책 장터 도와줄 거야?",
        "W: 월요일에 계단 옆에 알림이 붙었더라.",
        "M: 올해는 도서관 홀에서 해.",
        "W: 지난번처럼 마당이 아니고?",
        "M: 날씨 때문에 홀에서 해.",
        "W: 언제야?",
        "M: 11월 7일, 아홉 시부터 세 시까지.",
        "W: 책은 어디서 났어?",
        "M: 10월 내내 가정에서 기증받았어.",
        "W: 얼마야?",
        "M: 상자에 따라 2달러에서 5달러.",
        "W: 그 돈은 어떻게 해?",
        "M: 도서관에 새 책을 사.",
        "W: 그럼 오전에 가서 도울게.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "다음을 듣고, 도서 반납 면책 주간에 관한 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "M",
          "Hello, students. Here are the details of the return amnesty week. " +
            "It runs from Monday to Friday, the tenth to the fourteenth of November. " +
            "Any book may be returned, however late it is. " +
            "No charge is made, even for books borrowed last year. " +
            "Damaged books are accepted as they are; do not try to mend them. " +
            "You may leave a book in the box by the door instead of handing it over. " +
            "Books returned this week may be borrowed again the following Monday. " +
            "The ordinary rules come back on the seventeenth. " +
            "Ask at the desk if you are not sure what you still have out.",
        ],
      ],
      choices: [
        "11월 10일부터 14일까지 한다",
        "얼마나 늦었든 받는다",
        "작년에 빌린 책도 값을 묻지 않는다",
        "상한 책은 고쳐서 가져와야 한다",
        "문 옆 상자에 두어도 된다",
      ],
      answer: 4,
      clue: "Damaged books are accepted as they are; do not try to mend them.",
      explanation:
        "상한 책은 그대로 받으니 고치지 말라고 했으므로 ④가 일치하지 않는다.",
      translation: [
        "M: 학생 여러분, 안녕하세요. 도서 반납 면책 주간을 안내합니다. 11월 10일 월요일부터 14일 금요일까지 합니다. 얼마나 늦었든 어떤 책이든 돌려주실 수 있습니다. 작년에 빌린 책이라도 값을 묻지 않습니다. 상한 책은 그대로 받습니다. 고치려고 하지 마세요. 직접 건네는 대신 문 옆 상자에 두셔도 됩니다. 이번 주에 돌아온 책은 다음 월요일에 다시 빌리실 수 있습니다. 본래 규칙은 17일에 돌아옵니다. 무엇을 빌려 갔는지 모르겠으면 안내대에 물어보세요.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 남자가 고를 독서 모임을 고르시오.",
      lines: [
        ["W", "Dohyun, which reading group will you join?"],
        ["M", "The library is opening five of them."],
        ["W", "I saw the list on the noticeboard."],
        ["M", "They all start in the second week of November."],
        ["W", "Can you come on weekday evenings?"],
        ["M", "I have classes until eight every weekday."],
        ["W", "Then the weekday ones are out."],
        ["M", "Two of these five meet on weekdays."],
        ["W", "How many members do you want in it?"],
        ["M", "Under ten, or nobody says anything."],
        ["W", "One of the rest takes fifteen."],
        ["M", "And it should read fiction, not essays."],
        ["W", "That takes out one more of them."],
        ["M", "Then there's only one group left."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 5,
      clue: "I have classes until eight every weekday.",
      explanation:
        "주말에 모이고, 열 명 미만이며, 소설을 읽는 모임은 ⑤이다. 따라서 답은 ⑤이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Day: Weekday / Members: 8 / Reads: Fiction" },
          { no: 2, label: "②", value: "Day: Weekday / Members: 12 / Reads: Essays" },
          { no: 3, label: "③", value: "Day: Weekend / Members: 15 / Reads: Fiction" },
          { no: 4, label: "④", value: "Day: Weekend / Members: 8 / Reads: Essays" },
          { no: 5, label: "⑤", value: "Day: Weekend / Members: 9 / Reads: Fiction" },
        ],
      },
      translation: [
        "W: 도현아, 어느 독서 모임에 들어갈 거야?",
        "M: 도서관에서 다섯 개를 열어.",
        "W: 게시판에 붙은 목록을 봤어.",
        "M: 다 11월 둘째 주에 시작해.",
        "W: 평일 저녁에 올 수 있어?",
        "M: 평일에는 여덟 시까지 수업이 있어.",
        "W: 그럼 평일 것은 빠지네.",
        "M: 이 다섯 중 두 개가 평일이야.",
        "W: 사람은 몇 명이면 좋겠어?",
        "M: 열 명 미만, 아니면 아무도 말을 안 해.",
        "W: 나머지 중 하나는 열다섯 명이야.",
        "M: 그리고 수필 말고 소설을 읽어야 해.",
        "W: 그럼 하나가 더 빠지네.",
        "M: 그럼 남는 모임은 하나뿐이야.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Do you still have that book from March?"],
        ["M", "It's been in my bag for weeks."],
        ["W", "This week you can bring it back with nothing said."],
        ["M", "Even though two pages are torn?"],
        ["W", "Shall we walk down to the library now?"],
      ],
      choices: [
        "Yes, let's get it over with.",
        "I returned it in April.",
        "The library moved upstairs.",
        "I never borrow books.",
        "The week ended already.",
      ],
      answer: 1,
      clue: "Shall we walk down to the library now?",
      explanation:
        "지금 같이 내려가자는 제안이므로, 이참에 끝내자는 ①이 가장 자연스럽다.",
      translation: [
        "W: 3월에 빌린 그 책 아직 갖고 있어?",
        "M: 몇 주째 가방에 있어.",
        "W: 이번 주에는 아무 말 없이 돌려줄 수 있어.",
        "M: 두 쪽이 찢어졌는데도?",
        "W: 지금 같이 도서관에 내려갈까?",
        "M: 응, 이참에 끝내자.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Excuse me, should I mend this book before I return it?"],
        ["W", "Damaged books are taken as they are."],
        ["M", "I was going to tape the torn pages."],
        ["W", "Please don't. Tape makes it harder to repair properly."],
        ["M", "Then where do I leave it?"],
      ],
      choices: [
        "Mend it at home first.",
        "In the box by the door.",
        "Keep it until next year.",
        "Nowhere; we can't take it.",
        "Throw it away.",
      ],
      answer: 2,
      clue: "Then where do I leave it?",
      explanation:
        "어디에 두면 되는지 물었으므로, 문 옆 상자라는 ②가 가장 자연스럽다.",
      translation: [
        "M: 실례합니다, 돌려주기 전에 이 책을 고쳐야 하나요?",
        "W: 상한 책은 그대로 받습니다.",
        "M: 찢어진 쪽을 테이프로 붙이려고 했어요.",
        "W: 그러지 마세요. 테이프를 붙이면 제대로 고치기가 더 어려워집니다.",
        "M: 그럼 어디에 두면 되나요?",
        "W: 문 옆 상자에 넣어 주세요.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Yuna, how did the library's book recommendations go?"],
        ["W", "We put up forty cards and eleven books went out."],
        ["M", "Were the books hard to find on the shelves?"],
        ["W", "Each card had the shelf number on it."],
        ["M", "Then finding them wasn't the problem."],
        ["W", "The cards all said the same sort of thing."],
        ["M", "Such as?"],
        ["W", "'A moving story about friendship.' Forty times over."],
        ["M", "Nobody walks to a shelf for a moving story."],
        ["W", "We thought praising the book was the job."],
        ["M", "What would one card say instead?"],
      ],
      choices: [
        "More praise than before.",
        "The first line of the book.",
        "A longer summary.",
        "The author's full name.",
        "Nothing; cards don't work.",
      ],
      answer: 2,
      clue: "What would one card say instead?",
      explanation:
        "칭찬만 늘어놓아 효과가 없었으므로, 책의 첫 문장을 적자는 ②가 가장 자연스럽다.",
      translation: [
        "M: 유나야, 도서관 책 추천은 어떻게 됐어?",
        "W: 카드를 마흔 장 붙였는데 열한 권이 나갔어.",
        "M: 서가에서 책 찾기가 어려웠어?",
        "W: 카드마다 서가 번호를 적어 놨어.",
        "M: 그럼 찾는 게 문제는 아니었네.",
        "W: 카드가 죄다 비슷한 말만 하고 있었어.",
        "M: 예를 들면?",
        "W: '우정에 관한 감동적인 이야기.' 마흔 번을.",
        "M: 감동적인 이야기 때문에 서가까지 걸어가는 사람은 없지.",
        "W: 우리는 책을 칭찬하는 게 할 일인 줄 알았어.",
        "M: 카드에 대신 뭐라고 적을 거야?",
        "W: 그 책의 첫 문장을 그대로 적을래.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Sangwoo, you said you read a lot but remember little."],
        ["M", "Forty pages a night and almost nothing stays."],
        ["W", "Do you stop anywhere while you read?"],
        ["M", "Only at the end of a chapter."],
        ["W", "And what do you do at that point?"],
        ["M", "Start the next one."],
        ["W", "So nothing ever gets said back in your own words."],
        ["M", "The reading feels smooth, which I took as a good sign."],
        ["W", "Smooth is what recognising feels like."],
        ["M", "So I should make it rougher on purpose."],
        ["W", "What will you do at the end of each chapter tonight?"],
      ],
      choices: [
        "Read twenty pages more.",
        "Close the book and say it back.",
        "Underline the important lines.",
        "Start the next chapter at once.",
        "Read the chapter again.",
      ],
      answer: 2,
      clue: "What will you do at the end of each chapter tonight?",
      explanation:
        "제 말로 되뇐 적이 없다는 이야기이므로, 책을 덮고 말해 보겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 상우야, 많이 읽는데 남는 게 없다고 했잖아.",
        "M: 하룻밤에 마흔 쪽씩 읽는데 거의 안 남아.",
        "W: 읽다가 어디선가 멈춰?",
        "M: 한 장이 끝날 때만.",
        "W: 그때 뭘 해?",
        "M: 다음 장을 시작해.",
        "W: 그럼 제 말로 되뇐 적이 한 번도 없네.",
        "M: 읽는 게 매끄러워서 좋은 신호인 줄 알았어.",
        "W: 매끄럽다는 건 알아본다는 느낌이야.",
        "M: 그럼 일부러 거칠게 만들어야겠네.",
        "W: 오늘 밤 한 장이 끝날 때마다 뭘 할 거야?",
        "M: 책을 덮고 제 말로 말해 볼게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Nari가 Jaehyun에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Nari : ________________",
      lines: [
        [
          "W",
          "Nari and Jaehyun are packing up after the book fair. " +
            "Jaehyun is putting the unsold books back into the cardboard boxes " +
            "and stacking the boxes six high against the outside wall. " +
            "The boxes are to stay there until the van comes on Monday morning. " +
            "Nari knows that the forecast is for rain from tonight, " +
            "and that cardboard under rain gives way at the bottom of a stack. " +
            "The storeroom just inside has room for all of them. " +
            "She wants him to stack the boxes indoors instead. " +
            "In this situation, what would Nari most likely say to Jaehyun?",
        ],
      ],
      choices: [
        "Let's sell the rest tomorrow.",
        "Stack the boxes inside, not outside.",
        "We need more boxes.",
        "The van comes at nine.",
        "Put fewer books in each box.",
      ],
      answer: 2,
      clue: "She wants him to stack the boxes indoors instead.",
      explanation:
        "밤부터 비가 와 종이 상자가 무너지므로, 안에 쌓으라는 ②가 가장 적절하다.",
      translation: [
        "W: 나리와 재현이는 책 장터가 끝난 뒤 짐을 챙기고 있습니다. 재현이는 팔리지 않은 책을 종이 상자에 다시 담아 바깥 벽에 여섯 단으로 쌓고 있습니다. 그 상자들은 월요일 아침에 차가 올 때까지 거기 있을 예정입니다. 나리는 오늘 밤부터 비가 온다는 것과, 비를 맞은 종이 상자는 쌓아 놓은 맨 아래가 주저앉는다는 것을 압니다. 바로 안쪽 창고에는 전부 들어갈 자리가 있습니다. 그는 상자를 안에 쌓기를 바랍니다. 이런 상황에서 나리가 재현이에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 남자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Hello, everyone. Today I want to talk about why libraries " +
            "stopped charging fines for late books, and what happened next. " +
            "The fine was meant to bring books back on time, " +
            "and for readers who could pay it, more or less it did. " +
            "For readers who could not, it did something else entirely. " +
            "A book two weeks late became a debt, and a debt became a reason to stay away, " +
            "so the library lost the book and the reader together. " +
            "Libraries that removed fines found their return rates barely changed " +
            "and the number of borrowers rose sharply. " +
            "The fine had not been keeping the books; it had been keeping people out.",
        ],
      ],
      choices: [
        "why removing library fines brought readers back",
        "how libraries choose which books to buy",
        "why books are returned late",
        "how fines are calculated by libraries",
        "why reading rates fall among teenagers",
      ],
      answer: 1,
      clue: "The fine had not been keeping the books; it had been keeping people out.",
      explanation:
        "연체료를 없앴더니 이용자가 늘었다는 것이 중심 내용이다. 따라서 답은 ①이다.",
      translation: [
        "M: 여러분, 안녕하세요. 오늘은 도서관이 왜 연체료를 없앴는지, 그리고 그다음에 무슨 일이 있었는지 이야기하려 합니다. 연체료는 책을 제때 돌려받으려고 만든 것이고, 그 돈을 낼 수 있는 이용자에게는 대체로 그 노릇을 했습니다. 낼 수 없는 이용자에게는 전혀 다른 노릇을 했습니다. 두 주 늦은 책은 빚이 되었고, 빚은 발길을 끊을 까닭이 되었습니다. 그래서 도서관은 책과 사람을 함께 잃었습니다. 연체료를 없앤 도서관들은 반납률이 거의 달라지지 않았고, 빌리는 사람 수는 크게 늘었다는 것을 알게 되었습니다. 연체료는 책을 지키고 있던 것이 아니라 사람을 막고 있었던 것입니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "다음을 듣고, 언급된 것이 아닌 것을 고르시오.",
      lines: [
        ["M", "Libraries stopped charging fines for late books."],
        ["M", "A book two weeks late became a debt."],
        ["M", "The library lost the book and the reader together."],
        ["M", "Return rates barely changed after fines were removed."],
        ["M", "The number of borrowers rose sharply."],
      ],
      choices: ["a fine", "a debt", "a reader", "borrowers", "a librarian"],
      answer: 5,
      clue: "The library lost the book and the reader together.",
      explanation:
        "연체료, 빚, 이용자, 빌리는 사람은 언급되지만 사서는 나오지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
