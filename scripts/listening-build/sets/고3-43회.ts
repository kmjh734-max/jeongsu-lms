/** 고3 듣기 43회 — 사람이 직접 쓴 회차 (2026-09-29) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고3 43회",
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
          "Good afternoon, everyone. This is the health room. " +
            "Every year at this time we see the same students twice in a week. " +
            "They come in with a headache, take something for it, and go back. " +
            "Three days later they come back with the same headache. " +
            "In almost every case the cause is not illness at all. " +
            "It is four hours of sleep, one meal a day, and no water. " +
            "Medicine will hide that for an afternoon; it will not mend it. " +
            "So before you come to us for something to take, " +
            "answer three questions: when did you sleep, eat, and drink? " +
            "If the answer to any of them is troubling, start there. " +
            "The health room is open, but sleep is the better remedy.",
        ],
      ],
      choices: [
        "약보다 먹고 자는 것을 먼저 챙기라고 권하려고",
        "보건실 이용 시간을 알리려고",
        "예방 접종을 안내하려고",
        "건강 검진을 독려하려고",
        "감기 유행을 알리려고",
      ],
      answer: 1,
      clue: "Medicine will hide that for an afternoon; it will not mend it.",
      explanation:
        "약을 찾기 전에 자고 먹고 마시는 것부터 챙기라고 권하고 있다. 따라서 답은 ①이다.",
      translation: [
        "M: 여러분, 안녕하세요. 보건실입니다. 해마다 이맘때면 같은 학생을 한 주에 두 번씩 봅니다. 머리가 아프다며 와서 약을 먹고 돌아가고, 사흘 뒤에 같은 두통으로 다시 옵니다. 거의 모든 경우에 그 까닭은 병이 아닙니다. 네 시간 자고, 하루 한 끼 먹고, 물을 마시지 않은 것입니다. 약은 그것을 한나절 가려 줄 뿐 낫게 하지는 못합니다. 그러니 약을 받으러 오시기 전에 세 가지를 스스로 물어보세요. 언제 잤는지, 언제 먹었는지, 언제 마셨는지. 어느 하나라도 마음에 걸린다면 거기서부터 시작하십시오. 보건실은 열려 있지만, 더 나은 약은 잠입니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 여자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Chaeyoung, you handed in the essay without a conclusion?"],
        ["W", "I handed it in without the conclusion I had written."],
        ["M", "You cut the whole paragraph out?"],
        ["W", "It said again what the other three had already said."],
        ["M", "Isn't a conclusion supposed to sum things up?"],
        ["W", "Supposed to, and usually just repeats."],
        ["M", "The teacher may think you ran out of time."],
        ["W", "She'll see the last paragraph ends where it should."],
        ["M", "So the argument finishes without an announcement."],
        ["W", "A reader who followed the argument doesn't need it told again."],
        ["M", "And a reader who didn't won't be saved by it."],
        ["W", "A summary of your own point insults whoever read it."],
        ["M", "I'll look at mine again tonight."],
      ],
      choices: [
        "글에는 반드시 결론이 있어야 한다",
        "글은 짧을수록 좋다",
        "요약만 하는 결론은 없는 편이 낫다",
        "글은 여러 번 고쳐야 한다",
        "글은 소리 내어 읽어야 한다",
      ],
      answer: 3,
      clue: "A summary of your own point insults whoever read it.",
      explanation:
        "앞의 말을 되풀이하는 결론은 없는 편이 낫다고 말한다. 따라서 답은 ③이다.",
      translation: [
        "M: 채영아, 결론 없이 글을 냈다고?",
        "W: 내가 써 둔 결론을 빼고 냈지.",
        "M: 한 문단을 통째로 잘랐어?",
        "W: 앞의 세 문단이 이미 한 말을 또 하고 있었어.",
        "M: 결론은 정리하는 자리 아니야?",
        "W: 그래야 하는데 대개는 되풀이가 돼.",
        "M: 선생님이 시간이 모자랐다고 여기실 수도 있어.",
        "W: 마지막 문단이 끝날 자리에서 끝난 걸 보실 거야.",
        "M: 그러니까 알림 없이 논지가 끝나는구나.",
        "W: 논지를 따라온 독자에게 다시 말해 줄 필요는 없어.",
        "M: 못 따라온 독자는 그걸로도 못 구하고.",
        "W: 자기 말을 요약해 주는 건 읽은 사람을 얕보는 거야.",
        "M: 오늘 밤에 내 것도 다시 봐야겠다.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "We treat advice as something to be collected. " +
            "We ask five people about the same problem and feel better for it. " +
            "But five answers to one question rarely add up to one answer. " +
            "They point in different directions, each sound on its own terms, " +
            "and we end up choosing the one we already preferred. " +
            "The collecting felt like work; the deciding was untouched. " +
            "One person who knows your situation is worth more than five who do not, " +
            "and the value of advice comes from what the adviser knows about you. " +
            "Ask fewer people, and tell them more.",
        ],
      ],
      choices: [
        "사정을 아는 사람에게 깊이 묻는 것이 낫다",
        "조언은 많이 들을수록 좋다",
        "결정은 스스로 내려야 한다",
        "고민은 빨리 말해야 한다",
        "어른의 말을 들어야 한다",
      ],
      answer: 1,
      clue: "Ask fewer people, and tell them more.",
      explanation:
        "사정을 아는 사람에게 더 자세히 털어놓고 묻는 편이 낫다고 말한다. 따라서 답은 ①이다.",
      translation: [
        "M: 우리는 조언을 모으는 것으로 여깁니다. 같은 문제를 다섯 사람에게 묻고 나면 마음이 놓입니다. 그러나 한 물음에 대한 다섯 개의 답이 하나의 답이 되는 일은 드뭅니다. 저마다 제 나름으로는 옳은 채 서로 다른 쪽을 가리키고, 우리는 결국 애초에 마음에 두었던 쪽을 고릅니다. 모으는 일은 애쓴 것처럼 느껴졌지만, 정하는 일은 손도 대지 않은 채 남습니다. 사정을 아는 한 사람이 모르는 다섯 사람보다 값지고, 조언의 값어치는 조언하는 사람이 여러분에 대해 아는 것에서 나옵니다. 더 적은 사람에게 묻되, 더 많이 이야기하십시오.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["W", "Jaemin, is this a photo of the health room?"],
        ["M", "They moved everything around in September."],
        ["W", "There's a bed behind the curtain on the left."],
        ["M", "Two beds, side by side, since this year."],
        ["W", "And a wide desk stands under the window."],
        ["M", "That's where the record book is kept."],
        ["W", "A glass cabinet stands against the right wall."],
        ["M", "All the medicine is locked in there."],
        ["W", "There's a round mat in front of the door."],
        ["M", "Everyone wipes their shoes on it."],
        ["W", "And a chart hangs beside the cabinet."],
        ["M", "It shows what to do if someone faints."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 1,
      clue: "Two beds, side by side, since this year.",
      explanation:
        "침대가 하나라고 했지만 올해부터 두 개라고 했다. 따라서 답은 ①이다.",
      figure: {
        kind: "figure5",
        scene:
          "A school health room, clean black line art on a plain white background, no writing or letters anywhere. " +
          "ONE BED stands behind a curtain on the left side. " +
          "A WIDE DESK stands under the window. " +
          "A GLASS CABINET stands against the right wall. " +
          "A ROUND MAT lies in front of the door. " +
          "A CHART hangs on the wall beside the cabinet.",
        spots: [
          [0.15, 0.5],
          [0.48, 0.45],
          [0.85, 0.5],
          [0.55, 0.85],
          [0.85, 0.18],
        ],
      },
      translation: [
        "W: 재민아, 이게 보건실 사진이야?",
        "M: 9월에 다 옮겨 놨어.",
        "W: 왼쪽 가림막 뒤에 침대가 하나 있네.",
        "M: 올해부터는 나란히 두 개야.",
        "W: 그리고 창 아래에 넓은 책상이 있고.",
        "M: 거기에 기록부를 둬.",
        "W: 오른쪽 벽에는 유리장이 있네.",
        "M: 약은 다 거기 잠가 둬.",
        "W: 문 앞에는 둥근 깔개가 있어.",
        "M: 다들 거기에 신발을 닦아.",
        "W: 그리고 장 옆에 표가 걸려 있고.",
        "M: 누가 쓰러졌을 때 할 일이 적혀 있어.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 여자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Eunbi, the club exhibition opens at ten tomorrow."],
        ["W", "The panels are up and the labels are all stuck on."],
        ["M", "It looks much better than I expected."],
        ["W", "We worked on it every lunchtime for a fortnight."],
        ["M", "Did anyone borrow the spotlights from the art room?"],
        ["W", "Sangmin said he would fetch them after school."],
        ["M", "He left at four for his grandmother's."],
        ["W", "Then the spotlights are still in the art room."],
        ["M", "How many do we need for the panels?"],
        ["W", "Four, one at each corner of the room."],
        ["M", "And the art room is locked at half past six."],
        ["W", "It's twenty past six right now."],
        ["M", "Then there's no time to do anything else."],
        ["W", "I'll finish straightening the labels when I'm back."],
        ["M", "I'll stay and set out the visitors' chairs."],
        ["W", "I'll go and borrow the spotlights."],
      ],
      choices: [
        "이름표를 바로잡기",
        "조명을 빌려 오기",
        "의자를 놓기",
        "상민이에게 연락하기",
        "판을 세우기",
      ],
      answer: 2,
      clue: "I'll go and borrow the spotlights.",
      explanation:
        "여자는 미술실에 가서 조명을 빌려 오겠다고 했다. 따라서 답은 ②이다.",
      translation: [
        "M: 은비야, 동아리 전시는 내일 열 시에 열어.",
        "W: 판은 세웠고 이름표도 다 붙였어.",
        "M: 생각보다 훨씬 나은데.",
        "W: 두 주 동안 점심마다 붙들고 했어.",
        "M: 미술실에서 조명은 누가 빌려 왔어?",
        "W: 상민이가 방과 후에 가져오겠다고 했어.",
        "M: 네 시에 할머니 댁에 간다고 갔어.",
        "W: 그럼 조명은 아직 미술실에 있겠네.",
        "M: 판에 몇 개나 필요해?",
        "W: 네 개, 방 네 귀퉁이에 하나씩.",
        "M: 그리고 미술실은 여섯 시 반에 잠가.",
        "W: 지금 여섯 시 20분이야.",
        "M: 그럼 다른 걸 할 틈이 없네.",
        "W: 돌아와서 이름표 바로잡는 걸 마무리할게.",
        "M: 나는 남아서 관람객 의자를 놓을게.",
        "W: 내가 가서 조명을 빌려 올게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 남자가 지불할 금액을 고르시오.",
      lines: [
        ["W", "Welcome to the stationery shop. What can I get you?"],
        ["M", "Five notebooks and three sets of pens, please."],
        ["W", "The notebooks are three dollars each today."],
        ["M", "Were they not two dollars last month?"],
        ["W", "They were, but the price went up in October."],
        ["M", "I should have bought more then."],
        ["W", "And the pen sets are seven dollars each."],
        ["M", "Is there a cheaper set than that?"],
        ["W", "There's a four-dollar one, but it has three colours."],
        ["M", "I need five colours, so I'll take these."],
        ["W", "Are you a member of our shop?"],
        ["M", "I joined last spring. Here's my card."],
        ["W", "Members get ten percent off the whole purchase."],
        ["M", "Good. I'll pay in cash."],
      ],
      choices: ["$30.00", "$32.40", "$34.00", "$36.00", "$40.00"],
      answer: 2,
      clue: "The notebooks are three dollars each today.",
      explanation:
        "공책 5권 15달러와 펜 3벌 21달러로 36달러인데, 10퍼센트를 빼면 32.40달러이다. 따라서 답은 ②이다.",
      translation: [
        "W: 문구점에 오신 걸 환영합니다. 무엇을 드릴까요?",
        "M: 공책 다섯 권과 펜 세 벌 주세요.",
        "W: 공책은 오늘 한 권에 3달러입니다.",
        "M: 지난달에는 2달러 아니었나요?",
        "W: 맞는데 10월에 값이 올랐어요.",
        "M: 그때 더 살걸 그랬네요.",
        "W: 그리고 펜은 한 벌에 7달러입니다.",
        "M: 그보다 싼 벌은 없나요?",
        "W: 4달러짜리가 있는데 색이 세 가지예요.",
        "M: 다섯 색이 필요해서 이걸로 할게요.",
        "W: 저희 가게 회원이신가요?",
        "M: 지난봄에 가입했어요. 여기 카드요.",
        "W: 회원은 전체에서 10퍼센트 할인됩니다.",
        "M: 좋네요. 현금으로 낼게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 여자가 스터디를 그만둔 이유를 고르시오.",
      lines: [
        ["M", "Dain, you're not in the morning study group any more."],
        ["M", "You started it yourself back in March."],
        ["W", "I did, and I ran it until the end of last month."],
        ["M", "Did the members stop coming?"],
        ["W", "Six of the seven came every single morning."],
        ["M", "Was it too early for you?"],
        ["W", "Seven o'clock never bothered me."],
        ["M", "Then why did you leave it?"],
        ["W", "We spent forty minutes checking each other's answers."],
        ["M", "And ten minutes on why they were wrong."],
        ["W", "I can check answers alone in five minutes."],
        ["M", "Then the hour wasn't buying you anything."],
      ],
      choices: [
        "회원들이 나오지 않아서",
        "시간이 너무 일러서",
        "혼자 해도 되는 일에 시간을 써서",
        "다른 학원에 다니게 되어서",
        "성적이 떨어져서",
      ],
      answer: 3,
      clue: "I can check answers alone in five minutes.",
      explanation:
        "혼자 5분이면 될 답 맞추기에 시간을 쓰고 있어 그만두었다. 따라서 답은 ③이다.",
      translation: [
        "M: 다인아, 이제 아침 스터디에 안 나오더라.",
        "M: 3월에 네가 만든 거였잖아.",
        "W: 맞아, 지난달 말까지 내가 이끌었어.",
        "M: 회원들이 안 나왔어?",
        "W: 일곱 중 여섯은 아침마다 빠짐없이 왔어.",
        "M: 너한테 너무 일렀어?",
        "W: 일곱 시는 한 번도 힘들지 않았어.",
        "M: 그럼 왜 나왔어?",
        "W: 서로 답 맞추는 데 40분을 썼어.",
        "M: 왜 틀렸는지에는 10분 쓰고.",
        "W: 답 맞추기는 혼자 5분이면 돼.",
        "M: 그럼 그 한 시간이 아무것도 못 사 준 거네.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 졸업 앨범 촬영에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["W", "Taeyang, have you heard about the yearbook photos?"],
        ["W", "The notice went up in our classroom this morning."],
        ["M", "They're taken in the school garden this year."],
        ["W", "Not in the photography room?"],
        ["M", "The garden, if it doesn't rain, they said."],
        ["W", "When is it happening?"],
        ["M", "The fourth of November, class by class."],
        ["W", "How long does each class take?"],
        ["M", "About twenty minutes, including the group shot."],
        ["W", "What are we supposed to wear?"],
        ["M", "School uniform, with the jacket on."],
        ["W", "And who is taking them?"],
        ["M", "The same studio that came last year."],
        ["W", "Then I'll get my hair cut before Tuesday."],
      ],
      choices: ["찍는 곳", "찍는 날", "걸리는 시간", "입을 옷", "사진값"],
      answer: 5,
      clue: "The fourth of November, class by class.",
      explanation:
        "장소, 날짜, 걸리는 시간, 옷차림은 말했지만 사진값은 말하지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 태양아, 졸업 앨범 사진 얘기 들었어?",
        "W: 오늘 아침에 교실에 알림이 붙었더라.",
        "M: 올해는 학교 정원에서 찍어.",
        "W: 사진실이 아니고?",
        "M: 비만 안 오면 정원에서 한대.",
        "W: 언제 해?",
        "M: 11월 4일에 반별로.",
        "W: 한 반에 얼마나 걸려?",
        "M: 단체 사진까지 해서 20분쯤.",
        "W: 뭘 입어야 해?",
        "M: 교복에 재킷까지 입고.",
        "W: 누가 찍어?",
        "M: 작년에 왔던 그 사진관.",
        "W: 그럼 화요일 전에 머리 자르러 가야겠다.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "다음을 듣고, 학교 영어 캠프에 관한 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "W",
          "Hello, students. Here is news of the winter English camp. " +
            "It runs for four days, from the twenty-sixth of December. " +
            "The camp is held at school, not at a training centre. " +
            "Forty students are taken, twenty from each of the two year groups. " +
            "The day starts at nine and ends at four, with lunch provided. " +
            "You do not need to bring a textbook; materials are given out. " +
            "Each afternoon ends with a short presentation in small groups. " +
            "There is no charge, and no test to get in. " +
            "Apply to your class teacher by the fifteenth of December.",
        ],
      ],
      choices: [
        "12월 26일부터 나흘 동안 한다",
        "학교에서 진행한다",
        "마흔 명을 받는다",
        "교재를 직접 가져가야 한다",
        "점심이 나온다",
      ],
      answer: 4,
      clue: "You do not need to bring a textbook; materials are given out.",
      explanation:
        "교재는 나누어 준다고 했으므로 ④가 일치하지 않는다.",
      translation: [
        "W: 학생 여러분, 안녕하세요. 겨울 영어 캠프를 알려 드립니다. 12월 26일부터 나흘 동안 진행됩니다. 캠프는 연수원이 아니라 학교에서 합니다. 마흔 명을 받고, 두 학년에서 스무 명씩입니다. 아홉 시에 시작해 네 시에 끝나며 점심이 나옵니다. 교재는 가져오지 않아도 됩니다. 자료를 나누어 드립니다. 오후마다 마지막에 작은 모둠으로 짧은 발표를 합니다. 참가비는 없고, 들어오기 위한 시험도 없습니다. 12월 15일까지 담임 선생님께 신청해 주세요.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 남자가 예약할 독서실 자리를 고르시오.",
      lines: [
        ["W", "Minwoo, which seat will you take at the study centre?"],
        ["M", "Five are left for the winter term."],
        ["W", "I saw the plan on the desk downstairs."],
        ["M", "They all run from December to February."],
        ["W", "Do you want one with a plug?"],
        ["M", "I watch the recorded lectures, so I have to have one."],
        ["W", "Two of these five have no plug at all."],
        ["M", "Then those are gone straight away."],
        ["W", "How much can you pay each month?"],
        ["M", "Under a hundred and twenty thousand won."],
        ["W", "One of the rest is above that."],
        ["M", "And it should be on the quiet floor."],
        ["W", "The third floor is the quiet one."],
        ["M", "Then only one seat is left for me."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 5,
      clue: "I watch the recorded lectures, so I have to have one.",
      explanation:
        "콘센트가 있고, 12만 원 미만이며, 3층인 자리는 ⑤이다. 따라서 답은 ⑤이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Plug: No / Fee: 90,000 won / Floor: 3rd" },
          { no: 2, label: "②", value: "Plug: Yes / Fee: 130,000 won / Floor: 3rd" },
          { no: 3, label: "③", value: "Plug: No / Fee: 100,000 won / Floor: 2nd" },
          { no: 4, label: "④", value: "Plug: Yes / Fee: 110,000 won / Floor: 2nd" },
          { no: 5, label: "⑤", value: "Plug: Yes / Fee: 115,000 won / Floor: 3rd" },
        ],
      },
      translation: [
        "W: 민우야, 독서실 자리는 어느 걸로 할 거야?",
        "M: 겨울 학기에 다섯 자리가 남았어.",
        "W: 아래층 책상에 놓인 배치도를 봤어.",
        "M: 다 12월부터 2월까지야.",
        "W: 콘센트 있는 자리로 할 거야?",
        "M: 녹화 강의를 봐서 꼭 있어야 해.",
        "W: 이 다섯 중 두 개는 콘센트가 아예 없어.",
        "M: 그럼 그건 바로 빠지네.",
        "W: 달마다 얼마까지 낼 수 있어?",
        "M: 12만 원 미만.",
        "W: 나머지 중 하나는 그보다 비싸.",
        "M: 그리고 조용한 층이어야 해.",
        "W: 조용한 건 3층이야.",
        "M: 그럼 나한테 남는 자리는 하나뿐이네.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "You look tired again this morning."],
        ["M", "I got about four hours' sleep last night."],
        ["W", "That's the third night this week."],
        ["M", "I know. My head has been aching all day."],
        ["W", "Why don't you go to bed early tonight?"],
      ],
      choices: [
        "I slept ten hours yesterday.",
        "The health room is closed.",
        "I'll try to, I really will.",
        "I never get headaches.",
        "Tonight is Saturday.",
      ],
      answer: 3,
      clue: "Why don't you go to bed early tonight?",
      explanation:
        "오늘은 일찍 자라는 권유이므로, 그러겠다는 ③이 가장 자연스럽다.",
      translation: [
        "W: 오늘 아침에도 피곤해 보인다.",
        "M: 어젯밤에 네 시간쯤 잤어.",
        "W: 이번 주에 벌써 사흘째잖아.",
        "M: 그러게. 하루 종일 머리가 아파.",
        "W: 오늘은 일찍 자는 게 어때?",
        "M: 그래 볼게, 정말로.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Excuse me, is this where I apply for the English camp?"],
        ["W", "Applications go to your class teacher, not here."],
        ["M", "I already wrote my name on this sheet."],
        ["W", "That sheet is for the essay course, I'm afraid."],
        ["M", "Then how long do I have to apply for the camp?"],
      ],
      choices: [
        "The camp was cancelled.",
        "Until the fifteenth of December.",
        "You applied already.",
        "There is no camp this year.",
        "Ask me again tomorrow.",
      ],
      answer: 2,
      clue: "Then how long do I have to apply for the camp?",
      explanation:
        "언제까지 신청할 수 있는지 물었으므로, 12월 15일까지라는 ②가 가장 자연스럽다.",
      translation: [
        "M: 실례합니다, 영어 캠프는 여기서 신청하나요?",
        "W: 신청은 여기가 아니라 담임 선생님께 하는 거예요.",
        "M: 이 종이에 벌써 이름을 적었는데요.",
        "W: 아쉽지만 그건 논술 강좌 신청서예요.",
        "M: 그럼 캠프는 언제까지 신청할 수 있나요?",
        "W: 12월 15일까지예요.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Yerim, how did the club's open day turn out?"],
        ["W", "Sixty people came in and four signed up."],
        ["M", "Was the room hard to find?"],
        ["W", "It's the first door past the gate."],
        ["M", "Did nobody explain what the club does?"],
        ["W", "Three of us talked to visitors all afternoon."],
        ["M", "Then what were the visitors doing while they were there?"],
        ["W", "Looking at our panels and listening to us."],
        ["M", "So nobody touched anything for an hour."],
        ["W", "We had nothing out for them to touch."],
        ["M", "What could you put out next year?"],
      ],
      choices: [
        "More panels on the wall.",
        "A longer explanation.",
        "Fewer members at the door.",
        "Something visitors can try themselves.",
        "Nothing needs changing.",
      ],
      answer: 4,
      clue: "What could you put out next year?",
      explanation:
        "보고 듣기만 했다는 이야기이므로, 직접 해 볼 거리를 내놓겠다는 ④가 가장 자연스럽다.",
      translation: [
        "M: 예림아, 동아리 공개의 날은 어땠어?",
        "W: 예순 명이 들어왔는데 네 명이 가입했어.",
        "M: 방을 찾기 어려웠어?",
        "W: 정문 지나 첫 번째 문이야.",
        "M: 동아리가 뭘 하는지 아무도 설명 안 했어?",
        "W: 우리 셋이 오후 내내 사람들이랑 얘기했어.",
        "M: 그럼 손님들은 거기서 뭘 하고 있었어?",
        "W: 우리 판을 보고 우리 말을 듣고.",
        "M: 한 시간 동안 아무것도 안 만져 봤겠네.",
        "W: 만져 볼 걸 아무것도 안 내놨어.",
        "M: 내년에는 뭘 내놓으면 될까?",
        "W: 손님이 직접 해 볼 수 있는 걸 내놓을래.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Junhyuk, you said you can't remember the vocabulary."],
        ["M", "I learn thirty words and keep about eight."],
        ["W", "How do you go through them?"],
        ["M", "I read the list from the top, twice over."],
        ["W", "The same order every single time?"],
        ["M", "Top to bottom, always."],
        ["W", "Then you know the order, not the words."],
        ["M", "I've noticed I remember what came before each one."],
        ["W", "That's the list helping you, not your memory."],
        ["M", "So the order itself is doing the work."],
        ["W", "How would you take the order away?"],
      ],
      choices: [
        "I'll read the list three times.",
        "I'll test them out of order.",
        "I'll write a longer list.",
        "I'll learn sixty words instead.",
        "I'll keep the same order.",
      ],
      answer: 2,
      clue: "How would you take the order away?",
      explanation:
        "차례를 없애는 방법을 물었으므로, 뒤섞어 시험해 보겠다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 준혁아, 단어가 기억이 안 난다고 했잖아.",
        "M: 서른 개를 외우면 여덟 개쯤 남아.",
        "W: 어떻게 보는데?",
        "M: 목록을 위에서부터 두 번 읽어.",
        "W: 매번 같은 차례로?",
        "M: 늘 위에서 아래로.",
        "W: 그럼 단어가 아니라 차례를 외운 거야.",
        "M: 각 단어 앞에 뭐가 있었는지가 기억나긴 해.",
        "W: 그건 네 기억이 아니라 목록이 도와준 거야.",
        "M: 그러니까 차례가 일을 대신하고 있었네.",
        "W: 그 차례를 어떻게 없앨 거야?",
        "M: 뒤섞어서 시험해 볼게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Haeun이 Junho에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Haeun : ________________",
      lines: [
        [
          "W",
          "Haeun and Junho are clearing up after the club exhibition. " +
            "Junho is taking the panels down and leaning them against the radiator " +
            "so that the floor can be swept before the caretaker comes. " +
            "The radiator has been on since the morning and the panels are painted. " +
            "Haeun has seen paint blister and lift on a warm surface before, " +
            "and these panels have to be shown again at the city hall in December. " +
            "There is an empty wall on the other side of the room. " +
            "She wants him to lean them against that wall instead. " +
            "In this situation, what would Haeun most likely say to Junho?",
        ],
      ],
      choices: [
        "Let's take the panels down later.",
        "We should paint them again.",
        "Sweep the floor first.",
        "Keep the panels away from the radiator.",
        "Turn the radiator up higher.",
      ],
      answer: 4,
      clue: "She wants him to lean them against that wall instead.",
      explanation:
        "따뜻한 난방기에 기대 놓으면 칠이 상하므로, 난방기에서 떼어 놓으라는 ④가 가장 적절하다.",
      translation: [
        "W: 하은이와 준호는 동아리 전시가 끝난 뒤 정리하고 있습니다. 준호는 관리인이 오기 전에 바닥을 쓸려고 판을 떼어 난방기에 기대 세우고 있습니다. 난방기는 아침부터 켜져 있었고 판에는 칠이 되어 있습니다. 하은이는 따뜻한 면에 닿은 칠이 부풀어 들뜨는 것을 전에 본 적이 있고, 이 판들은 12월에 시청에서 다시 전시해야 합니다. 방 건너편에는 빈 벽이 있습니다. 그는 그 벽에 기대 세우기를 바랍니다. 이런 상황에서 하은이가 준호에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 여자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "Hello, everyone. Today I want to talk about why so many " +
            "everyday measurements were once taken from the human body. " +
            "A foot was a foot, a hand was a hand, and a pace was a pace. " +
            "This was not carelessness; it was the only ruler always present. " +
            "A merchant far from home could still measure cloth by the arm, " +
            "and a builder could set out a wall without any instrument at all. " +
            "The trouble is that arms and feet differ from person to person, " +
            "and a cloth measured by a tall seller cost the buyer dearly. " +
            "Standard measures were made not to be more accurate but to be the same for everyone, " +
            "and that sameness, not the accuracy, is what made trade across distances possible.",
        ],
      ],
      choices: [
        "why standard measures replaced body measures",
        "how tall people became merchants",
        "why cloth was sold by the arm",
        "how builders designed old walls",
        "why feet differ between people",
      ],
      answer: 1,
      clue: "Standard measures were made not to be more accurate but to be the same for everyone.",
      explanation:
        "몸으로 재던 단위가 표준 단위로 바뀐 까닭이 중심 내용이다. 따라서 답은 ①이다.",
      translation: [
        "W: 여러분, 안녕하세요. 오늘은 일상의 많은 단위가 왜 한때 사람의 몸에서 나왔는지 이야기하려 합니다. 피트는 발이었고, 핸드는 손이었으며, 페이스는 걸음이었습니다. 이것은 소홀해서가 아니라, 늘 지니고 있는 유일한 자였기 때문입니다. 집에서 멀리 떠난 상인도 팔로 천을 잴 수 있었고, 목수는 아무 도구 없이 벽을 세울 수 있었습니다. 문제는 팔과 발이 사람마다 다르다는 것이고, 키 큰 장사꾼이 잰 천은 사는 사람에게 비쌌다는 것입니다. 표준 단위는 더 정확해지려고 만든 것이 아니라 모두에게 같아지려고 만든 것이며, 먼 곳과의 거래를 가능하게 한 것은 정확함이 아니라 바로 그 같음이었습니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "다음을 듣고, 언급된 것이 아닌 것을 고르시오.",
      lines: [
        ["W", "A foot was a foot, a hand was a hand, and a pace was a pace."],
        ["W", "A merchant far from home could measure cloth by the arm."],
        ["W", "A builder could set out a wall without any instrument."],
        ["W", "Arms and feet differ from person to person."],
        ["W", "Standard measures were made to be the same for everyone."],
      ],
      choices: ["a foot", "a hand", "a pace", "an arm", "an eye"],
      answer: 5,
      clue: "A foot was a foot, a hand was a hand, and a pace was a pace.",
      explanation:
        "발, 손, 걸음, 팔은 언급되지만 눈은 나오지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
