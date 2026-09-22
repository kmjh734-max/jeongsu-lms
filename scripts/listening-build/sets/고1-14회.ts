/** 고1 듣기 14회 — 사람이 직접 쓴 회차 (2026-09-21) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고1 14회",
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
          "Good morning, students. This is Ms. Han from the student affairs office. " +
            "As you saw on your way in this morning, the old bicycle racks beside the side gate are gone. " +
            "The new covered bicycle shed behind the gymnasium opened today, and from now on all bicycles must be parked there. " +
            "The shed has one hundred and twenty spaces, so there is room for everyone. " +
            "To use it, you need to register your bicycle once at the front office and attach the sticker you receive to the frame. " +
            "The gate of the shed is open from seven in the morning until seven in the evening. " +
            "If you leave later than that, please take your bicycle home instead of leaving it overnight. " +
            "Bicycles left anywhere else on the school grounds will be moved to the shed by the staff. " +
            "Please come by the front office during lunch today and register. Thank you.",
        ],
      ],
      choices: [
        "자전거 안전 교육 참가를 권하려고",
        "자전거 도난 사고를 주의시키려고",
        "새 자전거 보관소 이용 방법을 안내하려고",
        "등교 시간 변경을 알리려고",
        "자전거 동아리 회원을 모집하려고",
      ],
      answer: 3,
      clue: "The new covered bicycle shed behind the gymnasium opened today, and from now on all bicycles must be parked there.",
      explanation:
        "체육관 뒤에 새로 연 자전거 보관소의 위치, 등록 방법, 이용 시간을 알리고 있다. 따라서 말의 목적은 ③이다.",
      translation: [
        "W: 학생 여러분, 안녕하세요. 학생과의 한 선생님입니다. 오늘 아침 등교하면서 보셨겠지만, 옆문 옆에 있던 낡은 자전거 거치대가 없어졌습니다. " +
          "체육관 뒤에 지붕 있는 새 자전거 보관소가 오늘 문을 열었고, 이제부터 모든 자전거는 그곳에 세워야 합니다. " +
          "보관소에는 120자리가 있어서 모두가 쓸 수 있습니다. " +
          "이용하려면 행정실에서 한 번 자전거를 등록하고, 받은 스티커를 자전거 몸체에 붙이면 됩니다. " +
          "보관소 문은 아침 7시부터 저녁 7시까지 열려 있습니다. " +
          "그보다 늦게 나갈 때는 밤새 두지 말고 자전거를 집으로 가져가세요. " +
          "학교 안 다른 곳에 세워 둔 자전거는 직원이 보관소로 옮깁니다. " +
          "오늘 점심시간에 행정실에 들러 등록해 주세요. 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 여자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Jiyu, you're presenting on Thursday, right? How's it going?"],
        ["W", "The slides are done. I've read through them about ten times."],
        ["M", "Ten times? Then you must know it by heart already."],
        ["W", "I thought so too, but yesterday I tried saying it out loud for the first time."],
        ["M", "And how was it?"],
        ["W", "Terrible. Sentences that looked fine on the screen fell apart in my mouth."],
        ["M", "I've never thought about that. I always practice in my head."],
        ["W", "So did I. Reading silently, you skip over the hard parts without noticing."],
        ["M", "That makes sense. You don't find out where you stumble."],
        ["W", "Right. Saying it aloud is the only way to hear what the audience will hear."],
        ["M", "Then I'd better start talking to my bedroom wall tonight."],
      ],
      choices: [
        "발표 자료는 간단할수록 좋다",
        "발표 연습은 소리 내어 해 봐야 효과가 있다",
        "발표 주제는 관심 있는 것으로 정해야 한다",
        "예상 질문을 미리 준비해 두어야 한다",
        "발표는 짧게 끝내는 것이 좋다",
      ],
      answer: 2,
      clue: "Right. Saying it aloud is the only way to hear what the audience will hear.",
      explanation:
        "여자는 눈으로만 읽으면 어려운 부분을 모르고 넘어가므로 소리 내어 연습해야 한다고 말한다. 따라서 답은 ②이다.",
      translation: [
        "M: 지유야, 목요일에 발표하지? 잘돼 가?",
        "W: 자료는 다 만들었어. 열 번쯤 읽어 봤고.",
        "M: 열 번이나? 그럼 벌써 다 외웠겠다.",
        "W: 나도 그런 줄 알았는데, 어제 처음으로 소리 내어 말해 봤거든.",
        "M: 어땠는데?",
        "W: 엉망이었어. 화면에서는 괜찮아 보이던 문장이 입에서는 무너지더라.",
        "M: 그런 생각은 못 해 봤어. 나는 늘 머릿속으로만 연습해.",
        "W: 나도 그랬어. 눈으로만 읽으면 어려운 부분을 모르고 넘어가.",
        "M: 그러네. 어디서 막히는지 알 수가 없구나.",
        "W: 맞아. 소리 내어 말해 봐야 듣는 사람이 들을 소리를 알 수 있어.",
        "M: 그럼 나도 오늘 밤부터 방 벽에다 말해 봐야겠다.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Most of us take notes as if the only job were to get the words down. " +
            "We write fast, fill the margins, and close the notebook feeling that the lesson is safe inside it. " +
            "Then, two weeks later, we open that page and find a wall of sentences that means almost nothing. " +
            "The problem is that we wrote for the person sitting in class, who already understood everything. " +
            "We did not write for the person who would come back on a Sunday night with none of that in mind. " +
            "Leave space. Put the date and one question at the top. Mark the two ideas the teacher repeated. " +
            "Notes are not a record of the class; they are a message to a reader who has forgotten it.",
        ],
      ],
      choices: [
        "필기는 빠짐없이 적는 것이 중요하다",
        "수업 직후에 복습하는 습관을 들여야 한다",
        "배운 내용은 남에게 설명해 보아야 한다",
        "필기는 나중에 다시 읽을 것을 염두에 두고 해야 한다",
        "잠을 충분히 자야 배운 것이 오래 남는다",
      ],
      answer: 4,
      clue: "Notes are not a record of the class; they are a message to a reader who has forgotten it.",
      explanation:
        "수업을 이해한 상태로 적은 필기는 나중에 다시 읽을 때 쓸모가 없으므로, 잊어버린 뒤에 읽을 사람을 생각하며 적어야 한다는 내용이다. 따라서 요지는 ④이다.",
      translation: [
        "M: 우리 대부분은 말을 받아 적는 것이 필기의 전부인 것처럼 적습니다. " +
          "빠르게 쓰고, 여백을 채우고, 수업이 공책 안에 잘 들어갔다는 느낌으로 덮습니다. " +
          "그러고 2주 뒤에 그 쪽을 펼치면 거의 아무 뜻도 없는 문장 더미를 만납니다. " +
          "문제는 우리가 이미 다 이해하고 앉아 있던 사람을 위해 적었다는 데 있습니다. " +
          "아무것도 기억나지 않는 상태로 일요일 밤에 돌아올 사람을 위해 적지 않은 것입니다. " +
          "여백을 두세요. 맨 위에 날짜와 질문 하나를 쓰세요. 선생님이 두 번 말한 내용에 표시하세요. " +
          "필기는 수업의 기록이 아니라, 그 수업을 잊은 독자에게 보내는 쪽지입니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["W", "Minjae, the art room looks completely different after the cleanup."],
        ["M", "Doesn't it? We spent all of Saturday on it."],
        ["W", "On the back wall there's a clock shaped like a star."],
        ["M", "The design club made that for us two years ago."],
        ["W", "And on the left shelf I count four paint tubs in a row."],
        ["M", "Those are the colours we use most, so we keep them within reach."],
        ["W", "In the middle there's an easel with a painting of a flower on it."],
        ["M", "That's Suyeon's. She's been working on it since March."],
        ["W", "By the window on the right, are those two plant pots?"],
        ["M", "Yes, and they've grown a lot since we moved them there."],
        ["W", "Next to the door there's a rack with aprons hanging on it."],
        ["M", "We added that last week so nobody drops paint on the floor."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "In the middle there's an easel with a painting of a flower on it.",
      explanation:
        "대화에서는 이젤 위의 그림이 꽃 그림이라고 했지만, 그림에는 나무가 그려져 있다. 따라서 ③이 대화의 내용과 일치하지 않는다.",
      figure: {
        kind: "labeled",
        scene:
          "A school art room seen from the front, five things clearly separated and none overlapping, clean black line art, no writing anywhere. " +
          "Upper centre on the back wall: a wall clock shaped like a five-pointed STAR. " +
          "Left shelf: FOUR round paint tubs lined up in a row. " +
          "Centre of the room: an easel holding a canvas with a painting of a TREE on it. " +
          "By the window on the right: TWO plant pots side by side on the sill. " +
          "Next to the door: a rack with three aprons hanging from it.",
      },
      translation: [
        "W: 민재야, 정리하고 나니 미술실이 완전히 달라 보인다.",
        "M: 그렇지? 토요일 하루를 다 썼어.",
        "W: 뒷벽에 별 모양 시계가 있네.",
        "M: 2년 전에 디자인 동아리가 만들어 준 거야.",
        "W: 그리고 왼쪽 선반에는 물감 통이 네 개 나란히 있고.",
        "M: 제일 많이 쓰는 색이라 손 닿는 데 둬.",
        "W: 가운데 이젤에는 꽃 그림이 놓여 있네.",
        "M: 수연이 거야. 3월부터 그리고 있어.",
        "W: 오른쪽 창가에 있는 건 화분 두 개야?",
        "M: 응, 저기로 옮기고 나서 많이 자랐어.",
        "W: 문 옆에는 앞치마가 걸린 걸이가 있고.",
        "M: 바닥에 물감을 떨어뜨리지 않으려고 지난주에 놓았어.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 남자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Hyunwoo, the book talk is on Friday and we still have a few things left."],
        ["M", "I thought we finished everything last week."],
        ["W", "Almost. The author confirmed yesterday, so the notice has to change."],
        ["M", "Right, the old poster still says the speaker is undecided."],
        ["W", "Exactly. I fixed the file this morning and sent it to you."],
        ["M", "Then someone has to print it and put copies on each floor."],
        ["W", "I'd do it, but I'm meeting the librarian about the chairs at three."],
        ["M", "Then I'll take care of the printing. How many copies?"],
        ["W", "Twenty should be enough. The office machine is faster than the library one."],
        ["M", "Got it. I'll print them after my last class and bring them to you."],
        ["W", "Thanks. Then I'll handle the chairs and the snacks."],
      ],
      choices: [
        "안내 포스터를 인쇄해 오기",
        "참가자 명단 정리하기",
        "강당 의자 배치하기",
        "간식 주문하기",
        "작가에게 연락하기",
      ],
      answer: 1,
      clue: "Then I'll take care of the printing. How many copies?",
      explanation:
        "여자가 의자 문제로 사서를 만나러 가므로, 남자가 고친 포스터를 인쇄해 오기로 한다. 따라서 답은 ①이다.",
      translation: [
        "W: 현우야, 북토크가 금요일인데 아직 남은 일이 몇 가지 있어.",
        "M: 지난주에 다 끝낸 줄 알았는데.",
        "W: 거의. 어제 작가님이 확정돼서 안내문을 바꿔야 해.",
        "M: 맞다, 예전 포스터에는 아직 강연자 미정이라고 돼 있지.",
        "W: 그래서 오늘 아침에 파일을 고쳐서 너한테 보냈어.",
        "M: 그럼 누가 인쇄해서 층마다 붙여야겠네.",
        "W: 내가 하고 싶은데, 3시에 의자 때문에 사서 선생님을 만나야 해.",
        "M: 그럼 인쇄는 내가 할게. 몇 장?",
        "W: 20장이면 충분해. 행정실 기계가 도서관 것보다 빨라.",
        "M: 알겠어. 마지막 수업 끝나고 뽑아서 가져다줄게.",
        "W: 고마워. 그럼 의자랑 간식은 내가 맡을게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 여자가 지불할 금액을 고르시오.",
      lines: [
        ["M", "Welcome to Green Corner. Are you looking for anything in particular?"],
        ["W", "Yes, I need some plant pots for the balcony at home."],
        ["M", "These ceramic ones are twenty dollars each."],
        ["W", "They're nice. I'll take three of them."],
        ["M", "Good news — when you buy three or more, we take ten percent off."],
        ["W", "That's helpful. Can you deliver them? They look heavy."],
        ["M", "We can. Delivery within the city is twelve dollars."],
        ["W", "Then please deliver them to my address."],
        ["M", "Certainly. Would you like soil as well? It's five dollars a bag."],
        ["W", "No, thank you. I still have two bags at home."],
        ["M", "All right. How would you like to pay?"],
        ["W", "By card, please."],
      ],
      choices: ["$54", "$60", "$62", "$66", "$72"],
      answer: 4,
      clue: "Good news — when you buy three or more, we take ten percent off.",
      explanation:
        "화분 20달러짜리 세 개는 60달러이고, 세 개 이상 10퍼센트 할인을 받으면 54달러이다. 배송비 12달러를 더하면 66달러이므로 답은 ④이다.",
      translation: [
        "M: 그린코너입니다. 특별히 찾으시는 게 있나요?",
        "W: 네, 집 베란다에 놓을 화분이 필요해요.",
        "M: 이 도자기 화분은 하나에 20달러입니다.",
        "W: 예쁘네요. 세 개 할게요.",
        "M: 잘됐네요. 세 개 이상 사시면 10퍼센트 할인해 드립니다.",
        "W: 좋네요. 배송도 되나요? 무거워 보여서요.",
        "M: 됩니다. 시내 배송은 12달러입니다.",
        "W: 그럼 저희 집으로 배송해 주세요.",
        "M: 알겠습니다. 흙도 필요하세요? 한 포대에 5달러입니다.",
        "W: 아니요, 괜찮아요. 집에 두 포대 있어요.",
        "M: 네. 결제는 어떻게 하시겠어요?",
        "W: 카드로 할게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 남자가 사진 전시회에 갈 수 없는 이유를 고르시오.",
      lines: [
        ["W", "Dohyun, are you coming to the photo exhibition on Saturday?"],
        ["M", "I really want to, but I don't think I can make it."],
        ["W", "Is it your part-time job again?"],
        ["M", "No, I finished that last month."],
        ["W", "Then what is it? You've been looking forward to this for weeks."],
        ["M", "My parents are going to a wedding in Daegu that day."],
        ["W", "And you have to go with them?"],
        ["M", "No, but my little brother is too young to stay home alone."],
        ["W", "Ah, so you're looking after him all day."],
        ["M", "Until about seven in the evening. The exhibition closes at six."],
      ],
      choices: [
        "아르바이트를 해야 해서",
        "동생을 돌봐야 해서",
        "병원 예약이 있어서",
        "과제를 끝내야 해서",
        "가족 여행을 가서",
      ],
      answer: 2,
      clue: "No, but my little brother is too young to stay home alone.",
      explanation:
        "부모님이 결혼식에 가셔서 남자는 저녁 7시까지 어린 동생을 돌봐야 한다. 따라서 답은 ②이다.",
      translation: [
        "W: 도현아, 토요일 사진 전시회 올 거야?",
        "M: 정말 가고 싶은데 못 갈 것 같아.",
        "W: 또 아르바이트야?",
        "M: 아니, 그건 지난달에 그만뒀어.",
        "W: 그럼 뭔데? 몇 주째 기다렸잖아.",
        "M: 그날 부모님이 대구 결혼식에 가셔.",
        "W: 너도 같이 가야 해?",
        "M: 아니, 그런데 동생이 어려서 혼자 집에 못 있어.",
        "W: 아, 그럼 하루 종일 동생을 봐야 하는구나.",
        "M: 저녁 7시쯤까지. 전시는 6시에 끝나잖아.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 교내 독서 마라톤에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["M", "Sora, have you seen the poster about the reading marathon?"],
        ["W", "I saw it, but I only read the title. What is it exactly?"],
        ["M", "You set your own goal and read toward it over a set period."],
        ["W", "Who can take part? Only the book club?"],
        ["M", "Anyone from the first and second years. Third years are busy with exams."],
        ["W", "How long does it run?"],
        ["M", "From the first of next month until the end of the semester, so about two months."],
        ["W", "And how do we record what we've read?"],
        ["M", "You write the title and the number of pages in the online form each week."],
        ["W", "That sounds simple enough. How do I sign up?"],
        ["M", "Fill in the paper slip at the library desk. That's all."],
      ],
      choices: ["참가 대상", "진행 기간", "기록 방법", "신청 방법", "시상 내용"],
      answer: 5,
      clue: "Fill in the paper slip at the library desk. That's all.",
      explanation:
        "참가 대상(1·2학년), 기간(다음 달 1일부터 학기 말까지), 기록 방법(주마다 온라인 서식), 신청 방법(도서관 데스크의 신청서)은 언급되지만 시상 내용은 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 소라야, 독서 마라톤 포스터 봤어?",
        "W: 보긴 했는데 제목만 읽었어. 정확히 뭐야?",
        "M: 스스로 목표를 정하고 정해진 기간 동안 그 목표만큼 읽는 거야.",
        "W: 누가 참가할 수 있어? 독서 동아리만?",
        "M: 1학년과 2학년이면 누구나. 3학년은 시험 때문에 빠져.",
        "W: 얼마 동안 해?",
        "M: 다음 달 1일부터 학기 말까지니까 두 달쯤.",
        "W: 읽은 건 어떻게 기록해?",
        "M: 매주 온라인 서식에 제목이랑 쪽수를 적으면 돼.",
        "W: 간단하네. 신청은 어떻게 해?",
        "M: 도서관 데스크에 있는 종이 신청서를 쓰면 끝이야.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Harbor Sketch Festival에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "W",
          "Hello, listeners. The Harbor Sketch Festival returns this month for the twelfth year. " +
            "It will be held in Harbor Park over two days, next Saturday and Sunday, from ten in the morning until five. " +
            "Anyone may join, and there is no entry fee at all, which is why the festival has grown so quickly. " +
            "Please bring your own drawing materials; the organizers provide only paper and a folding stool. " +
            "Every finished drawing is hung on the long fence by the water and stays on display until the end of the month. " +
            "Come down to the harbor and draw what you see.",
        ],
      ],
      choices: [
        "올해로 열두 번째 열린다",
        "항구 공원에서 이틀 동안 진행된다",
        "참가비는 1인당 5달러이다",
        "그림 도구는 각자 준비해야 한다",
        "완성한 그림은 현장에 전시된다",
      ],
      answer: 3,
      clue: "Anyone may join, and there is no entry fee at all, which is why the festival has grown so quickly.",
      explanation:
        "참가비는 전혀 없다고 했으므로 1인당 5달러라는 ③이 내용과 일치하지 않는다.",
      translation: [
        "W: 청취자 여러분, 안녕하세요. Harbor Sketch Festival이 올해로 열두 번째로 돌아옵니다. " +
          "다음 주 토요일과 일요일 이틀 동안 항구 공원에서 아침 10시부터 5시까지 열립니다. " +
          "누구나 참가할 수 있고 참가비는 전혀 없습니다. 그래서 이 축제가 빠르게 커졌습니다. " +
          "그림 도구는 각자 가져오세요. 주최 측은 종이와 접이식 의자만 제공합니다. " +
          "완성한 그림은 모두 물가의 긴 울타리에 걸려 이달 말까지 전시됩니다. " +
          "항구로 내려오셔서 보이는 것을 그려 보세요.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 예약할 캠핑장을 고르시오.",
      lines: [
        ["M", "Nayeon, these are the five campsites that still have space next weekend."],
        ["W", "Let's decide today. First of all, we're taking my dog, aren't we?"],
        ["M", "We are, so one of them is out right away."],
        ["W", "Next, I'd like somewhere with showers. Two nights without one is too much."],
        ["M", "Agreed. That removes another one. Three are left."],
        ["W", "How far are they? I don't want to drive more than an hour."],
        ["M", "An hour is about sixty kilometres, so the farthest one is gone."],
        ["W", "Then it's between the last two. What about the price?"],
        ["M", "We said fifty thousand won a night at the most."],
        ["W", "Then only one of them fits. Let's book that one."],
        ["M", "I'll call them this evening before the spaces fill up."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 2,
      clue: "Then only one of them fits. Let's book that one.",
      explanation:
        "반려견이 안 되는 ③, 샤워 시설이 없는 ④, 60킬로미터가 넘는 ⑤를 차례로 뺀다. 남은 ①과 ② 중 하룻밤 5만 원 이하인 것은 ②이므로 답은 ②이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "25km / 55,000원 / 샤워 있음 / 반려견 가능" },
          { no: 2, label: "②", value: "40km / 42,000원 / 샤워 있음 / 반려견 가능" },
          { no: 3, label: "③", value: "55km / 38,000원 / 샤워 있음 / 반려견 불가" },
          { no: 4, label: "④", value: "65km / 45,000원 / 샤워 없음 / 반려견 가능" },
          { no: 5, label: "⑤", value: "85km / 40,000원 / 샤워 있음 / 반려견 가능" },
        ],
      },
      translation: [
        "M: 나연아, 다음 주말에 아직 자리가 있는 캠핑장이 이 다섯 곳이야.",
        "W: 오늘 정하자. 우선 우리 강아지 데려가는 거 맞지?",
        "M: 맞아, 그러면 하나는 바로 빠지네.",
        "W: 그리고 샤워 시설이 있는 곳이면 좋겠어. 이틀 밤은 너무 힘들어.",
        "M: 동의해. 그럼 하나 더 빠진다. 셋 남았어.",
        "W: 거리는 어때? 운전은 한 시간 넘게는 하기 싫어.",
        "M: 한 시간이면 60킬로미터쯤이니까 제일 먼 데가 빠지네.",
        "W: 그럼 남은 두 곳 중에서네. 가격은?",
        "M: 하룻밤에 5만 원까지라고 했잖아.",
        "W: 그럼 한 곳만 맞네. 거기로 예약하자.",
        "M: 자리 차기 전에 오늘 저녁에 전화할게.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Did you get your student ID photo retaken?"],
        ["M", "Not yet. The photo booth was closed on Monday."],
        ["W", "Is it open today?"],
        ["M", "I think so, but I have practice until six."],
        ["W", "The booth stays open until seven on Wednesdays."],
      ],
      choices: [
        "Then I'll go right after practice today.",
        "My old ID card is still fine.",
        "The photos cost five dollars each.",
        "I had mine taken last September.",
        "You should get yours retaken too.",
      ],
      answer: 1,
      clue: "The booth stays open until seven on Wednesdays.",
      explanation:
        "수요일에는 7시까지 연다는 말을 들었으므로, 연습이 끝난 뒤 바로 가겠다는 ①이 가장 자연스럽다.",
      translation: [
        "W: 학생증 사진 다시 찍었어?",
        "M: 아직. 월요일에 사진 부스가 닫혀 있었어.",
        "W: 오늘은 열어?",
        "M: 그럴 텐데, 6시까지 연습이 있어.",
        "W: 수요일에는 부스가 7시까지 열어.",
        "M: 그럼 오늘 연습 끝나고 바로 갈게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "You look like you're still searching for a topic."],
        ["W", "I am. Everything I pick has already been done by someone."],
        ["M", "Have you looked at last year's reports in the library?"],
        ["W", "I didn't know we could borrow those."],
        ["M", "You can. They're on the shelf behind the front desk."],
      ],
      choices: [
        "My report is due on Monday.",
        "I've already finished my outline.",
        "The library closes at five today.",
        "Then I'll look through them tomorrow.",
        "You should choose a different topic.",
      ],
      answer: 4,
      clue: "You can. They're on the shelf behind the front desk.",
      explanation:
        "작년 보고서를 빌릴 수 있고 어디에 있는지 들었으므로, 내일 살펴보겠다는 ④가 가장 자연스럽다.",
      translation: [
        "M: 아직 주제를 못 정한 것 같네.",
        "W: 응. 고르는 것마다 누가 이미 한 거야.",
        "M: 도서관에 있는 작년 보고서는 봤어?",
        "W: 그걸 빌릴 수 있는 줄 몰랐어.",
        "M: 빌릴 수 있어. 안내 데스크 뒤 책꽂이에 있어.",
        "W: 그럼 내일 한번 살펴볼게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Seongjun, how is the school band getting on with the new drummer?"],
        ["M", "He plays well, but our rehearsals have become strange."],
        ["W", "Strange in what way?"],
        ["M", "We spend the first forty minutes just waiting for everyone to arrive."],
        ["W", "Doesn't the practice start at four?"],
        ["M", "It does on paper. In fact nobody shows up before twenty past."],
        ["W", "So the ones who come on time lose that time as well."],
        ["M", "Exactly. Two of them have started coming late on purpose."],
        ["W", "That's how a group falls apart. Has anyone said anything?"],
        ["M", "No. Everyone complains quietly and nobody brings it up at practice."],
        ["W", "Someone has to say it out loud, even if it makes one evening uncomfortable."],
      ],
      choices: [
        "I'll bring it up at Thursday's practice, then.",
        "We're looking for a new drummer again.",
        "The concert has been moved to next month.",
        "I'll start arriving twenty minutes late too.",
        "Our practice room is too small for six people.",
      ],
      answer: 1,
      clue: "Someone has to say it out loud, even if it makes one evening uncomfortable.",
      explanation:
        "누군가 소리 내어 말해야 한다는 조언을 들었으므로, 목요일 연습 때 이야기를 꺼내겠다는 ①이 가장 자연스럽다.",
      translation: [
        "W: 성준아, 새 드러머랑 밴드는 잘돼 가?",
        "M: 연주는 잘하는데 연습이 좀 이상해졌어.",
        "W: 어떻게 이상한데?",
        "M: 처음 40분을 그냥 사람들 오기를 기다리면서 보내.",
        "W: 연습이 4시 시작 아니야?",
        "M: 서류상으로는 그렇지. 실제로는 20분 전에는 아무도 안 와.",
        "W: 그럼 제시간에 온 사람도 그 시간을 날리는 거네.",
        "M: 그래. 두 명은 아예 일부러 늦게 오기 시작했어.",
        "W: 그렇게 모임이 무너지는 거야. 누가 얘기해 본 적은 있어?",
        "M: 아니. 다들 조용히 불평만 하고 연습 때는 아무도 꺼내지 않아.",
        "W: 하루 저녁이 불편해지더라도 누군가는 소리 내어 말해야 해.",
        "M: 그럼 목요일 연습 때 내가 얘기를 꺼낼게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Yerin, you've been running the school blog by yourself since March, haven't you?"],
        ["W", "I have. Three posts a week, every week."],
        ["M", "That's a lot. Do the other club members help at all?"],
        ["W", "They say they will, but the posts never arrive."],
        ["M", "Have you asked them for anything specific?"],
        ["W", "I usually just say we need more posts."],
        ["M", "That might be the problem. 'More posts' isn't a job anybody can pick up."],
        ["W", "So you mean I should ask each person for one particular thing?"],
        ["M", "Yes. One person writes the Monday review, another takes the photos."],
        ["W", "And then they know exactly what's theirs."],
      ],
      choices: [
        "I'll close the blog at the end of this month.",
        "The blog has about three hundred readers.",
        "Then I'll give each member one fixed task tonight.",
        "I'd rather keep writing everything myself.",
        "We should have started the blog in March.",
      ],
      answer: 3,
      clue: "Yes. One person writes the Monday review, another takes the photos.",
      explanation:
        "막연히 글이 더 필요하다고 하지 말고 사람마다 맡을 일을 정해 주라는 조언을 들었으므로, 오늘 밤에 각자에게 하나씩 정해 주겠다는 ③이 가장 자연스럽다.",
      translation: [
        "M: 예린아, 3월부터 학교 블로그를 혼자 운영해 왔지?",
        "W: 응. 매주 글 세 개씩.",
        "M: 많다. 다른 부원들은 좀 도와줘?",
        "W: 돕겠다고는 하는데 글은 안 와.",
        "M: 구체적으로 무엇을 해 달라고 한 적은 있어?",
        "W: 보통은 글이 더 필요하다고만 말해.",
        "M: 그게 문제일 수도 있어. '글 더'는 누가 집어 들 수 있는 일이 아니잖아.",
        "W: 그러니까 사람마다 한 가지씩 정해서 부탁하라는 말이지?",
        "M: 응. 한 명은 월요일 후기, 한 명은 사진.",
        "W: 그러면 자기 몫이 뭔지 정확히 알겠네.",
        "W: 그럼 오늘 밤에 부원마다 맡을 일을 하나씩 정해 줄게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Jiho가 Eunbi에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Jiho : ________________",
      lines: [
        [
          "M",
          "Jiho and Eunbi are in the same tutoring group at the community center. " +
            "Eunbi helps younger students with math every Tuesday, and the children like her a lot. " +
            "She explains each step slowly and never seems impatient. " +
            "Lately, though, she solves most of the problems herself while the children watch. " +
            "Jiho has noticed that the same students still cannot start a problem on their own. " +
            "He does not think her teaching is poor; her explanations are clearer than his. " +
            "The trouble is that watching someone solve a problem is not the same as solving one. " +
            "He wants to suggest that she hand the pencil over after the first step and let them try. " +
            "In this situation, what would Jiho most likely say to Eunbi?",
        ],
      ],
      choices: [
        "Could you explain the steps a little more slowly?",
        "Let them finish the problem themselves after your first step.",
        "I think we should teach a different subject this term.",
        "You should give them fewer problems each week.",
        "I'll take over the Tuesday group from now on.",
      ],
      answer: 2,
      clue: "He wants to suggest that she hand the pencil over after the first step and let them try.",
      explanation:
        "지호는 은비의 설명이 훌륭하다고 보면서도, 첫 단계 뒤에는 아이들이 직접 풀게 하자고 말하려 한다. 따라서 ②가 가장 적절하다.",
      translation: [
        "M: 지호와 은비는 주민센터의 같은 학습 도우미 모둠입니다. " +
          "은비는 매주 화요일에 어린 학생들의 수학을 도와주고, 아이들은 은비를 무척 좋아합니다. " +
          "은비는 단계마다 천천히 설명하고 조급해하는 법이 없습니다. " +
          "그런데 요즘은 아이들이 보는 동안 은비가 문제를 거의 다 풀어 줍니다. " +
          "지호는 같은 학생들이 아직도 혼자서는 문제를 시작하지 못한다는 것을 알아차렸습니다. " +
          "지호는 은비의 지도가 부족하다고 생각하지 않습니다. 설명은 자기보다 더 분명합니다. " +
          "문제는 남이 푸는 것을 보는 일과 직접 푸는 일이 같지 않다는 점입니다. " +
          "그래서 첫 단계까지만 보여 주고 연필을 넘겨 아이들이 해 보게 하자고 제안하고 싶습니다. " +
          "이런 상황에서 지호가 은비에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "여자가 하는 말의 주제로 가장 적절한 것은?",
      lines: [
        ["W", "Good afternoon. Today I want to show you what your rubbish turns into."],
        ["W", "Most of us drop something in the recycling bin and never think about it again."],
        ["W", "A clear plastic bottle, once washed and shredded, is spun into the fleece in winter jackets."],
        ["W", "Glass is different: it can be melted and re-formed again and again without wearing out."],
        ["W", "Old paper loses a little strength each time, so it becomes egg cartons and cardboard boxes."],
        ["W", "An aluminium can is the quickest of all — it can be back on the shelf within two months."],
        ["W", "None of this happens by magic. Each material follows its own path and has its own limits."],
        ["W", "Knowing those paths tells you why sorting at home matters more than people think."],
      ],
      choices: [
        "products made from recycled everyday waste",
        "why plastic pollution keeps increasing",
        "how factories save energy in winter",
        "the history of glass making",
        "ways to reduce food waste at home",
      ],
      answer: 1,
      clue: "Good afternoon. Today I want to show you what your rubbish turns into.",
      explanation:
        "여자는 페트병, 유리, 종이, 알루미늄 캔이 각각 무엇으로 다시 만들어지는지 설명한다. 따라서 주제는 ①이다.",
      translation: [
        "W: 안녕하세요. 오늘은 여러분이 버린 것이 무엇으로 바뀌는지 보여 드리려 합니다.",
        "W: 우리 대부분은 재활용함에 무언가를 넣고 나면 다시 생각하지 않습니다.",
        "W: 투명 페트병은 씻어서 잘게 부순 뒤 겨울 외투의 플리스 원단으로 뽑아냅니다.",
        "W: 유리는 다릅니다. 닳지 않고 몇 번이고 녹여 다시 만들 수 있습니다.",
        "W: 헌 종이는 쓸 때마다 힘이 조금씩 줄어서 달걀판이나 골판지 상자가 됩니다.",
        "W: 알루미늄 캔이 가장 빠릅니다. 두 달이면 다시 진열대에 올라올 수 있습니다.",
        "W: 이 가운데 저절로 되는 것은 없습니다. 재료마다 제 길과 제 한계가 있습니다.",
        "W: 그 길을 알면 집에서 분리하는 일이 왜 생각보다 중요한지 알게 됩니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 재료가 아닌 것은?",
      lines: [
        ["W", "Good afternoon. Today I want to show you what your rubbish turns into."],
        ["W", "Most of us drop something in the recycling bin and never think about it again."],
        ["W", "A clear plastic bottle, once washed and shredded, is spun into the fleece in winter jackets."],
        ["W", "Glass is different: it can be melted and re-formed again and again without wearing out."],
        ["W", "Old paper loses a little strength each time, so it becomes egg cartons and cardboard boxes."],
        ["W", "An aluminium can is the quickest of all — it can be back on the shelf within two months."],
        ["W", "None of this happens by magic. Each material follows its own path and has its own limits."],
        ["W", "Knowing those paths tells you why sorting at home matters more than people think."],
      ],
      choices: ["plastic", "glass", "paper", "aluminium", "wood"],
      answer: 5,
      clue: "Old paper loses a little strength each time, so it becomes egg cartons and cardboard boxes.",
      explanation:
        "플라스틱, 유리, 종이, 알루미늄은 언급되지만 나무는 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
