/** 고1 듣기 15회 — 사람이 직접 쓴 회차 (2026-09-21) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고1 15회",
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
          "Good afternoon, everyone. This is Mr. Seo from the physical education department. " +
            "As you know, the school gym has been closed since the first of this month for floor work. " +
            "The work finished last Friday, and the gym reopens tomorrow morning. " +
            "There are two things you need to know before you use it. " +
            "First, the new floor is easily marked, so outdoor shoes are no longer allowed inside, not even in the corridor by the equipment room. " +
            "Bring indoor shoes in a bag and change at the entrance. " +
            "Second, the clubs that moved their practice to the playground should return to their old time slots from Wednesday. " +
            "The timetable is on the door of the gym office. Please check yours today. Thank you.",
        ],
      ],
      choices: [
        "체육 대회 일정을 알리려고",
        "체육관을 다시 여는 것과 이용 방법을 안내하려고",
        "운동화 구입을 권하려고",
        "동아리 회원을 모집하려고",
        "운동장 사용 신청을 받으려고",
      ],
      answer: 2,
      clue: "The work finished last Friday, and the gym reopens tomorrow morning.",
      explanation:
        "바닥 공사를 끝낸 체육관을 내일 다시 열면서 실내화 착용과 동아리 시간표 복귀를 안내하고 있다. 따라서 말의 목적은 ②이다.",
      translation: [
        "M: 여러분, 안녕하세요. 체육부 서 선생님입니다. " +
          "아시다시피 학교 체육관은 바닥 공사 때문에 이달 1일부터 닫혀 있었습니다. " +
          "공사가 지난 금요일에 끝나서 체육관은 내일 아침에 다시 엽니다. " +
          "쓰기 전에 두 가지를 알아 두셔야 합니다. " +
          "첫째, 새 바닥은 자국이 잘 나기 때문에 실외화는 안에 들어올 수 없습니다. 기구실 옆 복도도 마찬가지입니다. " +
          "실내화를 가방에 넣어 와서 입구에서 갈아 신으세요. " +
          "둘째, 연습을 운동장으로 옮겼던 동아리는 수요일부터 원래 시간대로 돌아오면 됩니다. " +
          "시간표는 체육관 사무실 문에 붙어 있습니다. 오늘 꼭 확인해 주세요. 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 남자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Taeyang, you've read that novel three times now."],
        ["M", "Four, actually. I finished it again last night."],
        ["W", "Isn't that a waste? There are so many books you haven't read."],
        ["M", "I thought that too, until the third reading."],
        ["W", "What changed?"],
        ["M", "I noticed a sentence on page two that explains the whole ending."],
        ["W", "And you missed it the first two times?"],
        ["M", "Completely. The first time I only wanted to know what happens."],
        ["W", "So you read for the story first, and for everything else later."],
        ["M", "Exactly. One book read four times taught me more than four books read once."],
        ["W", "Then maybe I should go back to the one I finished in May."],
      ],
      choices: [
        "책은 많이 읽을수록 좋다",
        "책을 읽고 나면 독후감을 써야 한다",
        "좋은 책은 여러 번 다시 읽어야 한다",
        "읽을 책은 남의 추천으로 골라야 한다",
        "어려운 책부터 읽는 것이 좋다",
      ],
      answer: 3,
      clue: "Exactly. One book read four times taught me more than four books read once.",
      explanation:
        "남자는 같은 소설을 네 번 읽으면서 처음에는 보이지 않던 것을 알게 되었다며 여러 번 다시 읽는 것이 낫다고 말한다. 따라서 답은 ③이다.",
      translation: [
        "W: 태양아, 그 소설 벌써 세 번째 읽네.",
        "M: 사실 네 번째야. 어젯밤에 또 다 읽었어.",
        "W: 아깝지 않아? 안 읽은 책이 얼마나 많은데.",
        "M: 나도 그렇게 생각했어, 세 번째로 읽기 전까지는.",
        "W: 뭐가 달라졌는데?",
        "M: 2쪽에 있는 문장 하나가 결말을 다 설명하고 있더라고.",
        "W: 그걸 두 번이나 놓쳤다고?",
        "M: 완전히. 처음에는 무슨 일이 일어나는지만 알고 싶었거든.",
        "W: 처음에는 줄거리로 읽고, 나머지는 나중에 읽는 거구나.",
        "M: 그렇지. 네 번 읽은 책 한 권이 한 번씩 읽은 책 네 권보다 많이 가르쳐 줬어.",
        "W: 그럼 나도 5월에 다 읽은 그 책을 다시 봐야겠다.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "When something goes wrong in a group project, the first question is usually who forgot. " +
            "That question feels natural, and it almost never helps. " +
            "People who are asked who forgot learn to hide the next mistake a little longer. " +
            "A better question is where the message stopped. " +
            "Was the deadline written down anywhere? Did anyone say it out loud after the meeting? " +
            "Nine times out of ten the answer is that the information lived in one person's head. " +
            "Fix the place where it stopped, and the same failure will not happen twice.",
        ],
      ],
      choices: [
        "모둠은 인원이 적을수록 좋다",
        "일이 잘못되면 사람이 아니라 전달이 끊긴 지점을 찾아야 한다",
        "마감일은 넉넉하게 정해야 한다",
        "모둠 활동은 역할을 자주 바꿔야 한다",
        "회의는 짧게 하는 것이 좋다",
      ],
      answer: 2,
      clue: "Fix the place where it stopped, and the same failure will not happen twice.",
      explanation:
        "누가 잊었는지 묻는 대신 정보가 어디서 끊겼는지 찾아 그 지점을 고쳐야 같은 실패가 반복되지 않는다는 내용이다. 따라서 요지는 ②이다.",
      translation: [
        "W: 모둠 과제에서 일이 잘못되면 첫 질문은 대개 누가 잊었느냐입니다. " +
          "그 질문은 자연스럽게 느껴지지만 거의 도움이 되지 않습니다. " +
          "누가 잊었느냐는 질문을 받은 사람은 다음 실수를 조금 더 오래 숨기는 법을 배웁니다. " +
          "더 나은 질문은 전달이 어디서 멈췄느냐입니다. " +
          "마감일이 어딘가에 적혀 있었습니까? 회의가 끝난 뒤 누가 소리 내어 말했습니까? " +
          "열에 아홉은 그 정보가 한 사람의 머릿속에만 있었다는 답이 나옵니다. " +
          "멈춘 자리를 고치면 같은 실패는 두 번 일어나지 않습니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["W", "Junhyung, the club room looks much better after the clear-out."],
        ["M", "It does. We spent two afternoons on it."],
        ["W", "On the back wall there's a round mirror."],
        ["M", "We put it there so people can check before they go on stage."],
        ["W", "On the left I see a shelf with five boxes lined up."],
        ["M", "Each class keeps its props in one box."],
        ["W", "In the middle there's a long table with a lamp on it."],
        ["M", "That's where we read scripts in the evening."],
        ["W", "And on the right, is that a standing fan?"],
        ["M", "No, it's an air purifier. The fan went to the music room."],
        ["W", "I see. Next to the door there's a coat rack with three hooks."],
        ["M", "We added it last week for jackets and bags."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "No, it's an air purifier. The fan went to the music room.",
      explanation:
        "남자는 오른쪽에 있는 것이 선풍기가 아니라 공기청정기라고 바로잡는다. 그림에는 선풍기가 그려져 있으므로 ④가 대화와 일치하지 않는다.",
      figure: {
        kind: "labeled",
        scene:
          "A school club room seen from the front, five things clearly separated and none overlapping, clean black line art, no writing anywhere. " +
          "Centre of the back wall: a ROUND mirror. " +
          "Left wall: a shelf holding exactly FIVE closed boxes lined up side by side. " +
          "Centre of the room: a LONG rectangular table with a desk lamp standing on it. " +
          "To the right of the table: a tall STANDING ELECTRIC FAN with a round cage and a round base. " +
          "Next to the door on the far right: a coat rack with exactly THREE hooks.",
      },
      translation: [
        "W: 준형아, 정리하고 나니 동아리방이 훨씬 나아 보인다.",
        "M: 그렇지. 오후를 이틀이나 썼어.",
        "W: 뒷벽에 둥근 거울이 있네.",
        "M: 무대에 오르기 전에 확인하라고 거기 걸었어.",
        "W: 왼쪽 선반에는 상자가 다섯 개 나란히 있고.",
        "M: 반마다 소품을 상자 하나에 넣어 둬.",
        "W: 가운데에는 스탠드가 놓인 긴 탁자가 있네.",
        "M: 저녁에 거기서 대본을 읽어.",
        "W: 그리고 오른쪽에 있는 건 선풍기야?",
        "M: 아니, 공기청정기야. 선풍기는 음악실로 갔어.",
        "W: 그렇구나. 문 옆에는 고리가 세 개인 옷걸이가 있고.",
        "M: 지난주에 겉옷이랑 가방 걸라고 놓았어.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 여자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Sein, the class trip form has to go to the office by Friday."],
        ["W", "I thought we sent it last week."],
        ["M", "We sent the first version. The office returned it this morning."],
        ["W", "What's wrong with it?"],
        ["M", "The number of students doesn't match the bus booking."],
        ["W", "How far apart are they?"],
        ["M", "The form says twenty-eight, but the bus is booked for thirty."],
        ["W", "Two people must have dropped out after I typed it."],
        ["M", "Could you check the sign-up sheet and fix the number?"],
        ["W", "I'll go through it during lunch and print a clean copy."],
        ["M", "Thanks. Then I'll take it down to the office before the last class."],
      ],
      choices: [
        "버스 회사에 전화하기",
        "신청서 인원을 확인해서 다시 작성하기",
        "행정실에 서류 내기",
        "학생들에게 문자 보내기",
        "숙소를 다시 예약하기",
      ],
      answer: 2,
      clue: "I'll go through it during lunch and print a clean copy.",
      explanation:
        "여자는 점심시간에 신청서를 확인해 인원을 고치고 새로 출력하기로 한다. 서류를 행정실에 내는 일은 남자가 맡았다. 따라서 답은 ②이다.",
      translation: [
        "M: 세인아, 현장학습 신청서를 금요일까지 행정실에 내야 해.",
        "W: 지난주에 낸 줄 알았는데.",
        "M: 처음 것은 냈어. 오늘 아침에 행정실에서 돌려보냈어.",
        "W: 뭐가 잘못됐는데?",
        "M: 학생 수가 버스 예약이랑 안 맞아.",
        "W: 얼마나 차이 나는데?",
        "M: 신청서에는 28명인데 버스는 30명으로 잡혀 있어.",
        "W: 내가 입력한 다음에 두 명이 빠졌나 보다.",
        "M: 신청 명단 확인해서 인원을 고쳐 줄 수 있어?",
        "W: 점심시간에 확인해서 새로 출력할게.",
        "M: 고마워. 그럼 마지막 수업 전에 내가 행정실에 가져다줄게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 남자가 지불할 금액을 고르시오.",
      lines: [
        ["W", "Welcome to the city science museum. How many tickets?"],
        ["M", "Four, please. Two adults and two students."],
        ["W", "Adult tickets are twelve dollars and student tickets are eight."],
        ["M", "So twenty-four for the adults and sixteen for the students."],
        ["W", "That's right. Would you like the planetarium show as well?"],
        ["M", "How much is that?"],
        ["W", "Five dollars per person, but we don't need it for everyone."],
        ["M", "Just the two students, then."],
        ["W", "All right. And groups of four or more get five dollars off the total."],
        ["M", "That's helpful. Can we go in right away?"],
        ["W", "Yes, the next show starts in twenty minutes."],
        ["M", "Perfect. I'll pay by card."],
      ],
      choices: ["$40", "$45", "$50", "$55", "$60"],
      answer: 2,
      clue: "All right. And groups of four or more get five dollars off the total.",
      explanation:
        "성인 12달러씩 두 장은 24달러, 학생 8달러씩 두 장은 16달러로 40달러이다. 학생 두 명의 천문관 관람 10달러를 더하면 50달러이고, 4인 이상 할인 5달러를 빼면 45달러이므로 답은 ②이다.",
      translation: [
        "W: 시립 과학관입니다. 표 몇 장 드릴까요?",
        "M: 네 장이요. 성인 두 명, 학생 두 명입니다.",
        "W: 성인은 12달러, 학생은 8달러입니다.",
        "M: 그럼 성인이 24달러, 학생이 16달러네요.",
        "W: 맞습니다. 천문관 관람도 하시겠어요?",
        "M: 그건 얼마예요?",
        "W: 한 사람에 5달러인데, 모두 하실 필요는 없습니다.",
        "M: 그럼 학생 두 명만요.",
        "W: 알겠습니다. 그리고 4인 이상은 전체 금액에서 5달러 할인됩니다.",
        "M: 좋네요. 바로 들어가도 되나요?",
        "W: 네, 다음 상영이 20분 뒤에 시작합니다.",
        "M: 딱 좋네요. 카드로 결제할게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 여자가 오늘 도서관에 갈 수 없는 이유를 고르시오.",
      lines: [
        ["M", "Nayoung, are you coming to the library after school?"],
        ["W", "I can't today, though I really wanted to."],
        ["M", "Is it your art club again?"],
        ["W", "No, the club moved to Thursdays this month."],
        ["M", "Then what came up?"],
        ["W", "My mother's flight lands at five and nobody else can meet her."],
        ["M", "At the airport? That's a long way from here."],
        ["W", "An hour each way, so my whole afternoon is gone."],
        ["M", "I see. Shall we go tomorrow instead?"],
        ["W", "Tomorrow works. I'll bring the notes I promised."],
      ],
      choices: [
        "동아리 활동이 있어서",
        "몸이 아파서",
        "어머니를 마중 나가야 해서",
        "과제를 끝내야 해서",
        "학원 수업이 있어서",
      ],
      answer: 3,
      clue: "My mother's flight lands at five and nobody else can meet her.",
      explanation:
        "여자는 5시에 도착하는 어머니를 공항에 마중 나가야 해서 오늘은 도서관에 갈 수 없다. 따라서 답은 ③이다.",
      translation: [
        "M: 나영아, 방과 후에 도서관 갈 거야?",
        "W: 오늘은 못 가. 정말 가고 싶었는데.",
        "M: 또 미술 동아리야?",
        "W: 아니, 이번 달에는 동아리가 목요일로 옮겼어.",
        "M: 그럼 무슨 일인데?",
        "W: 엄마 비행기가 5시에 도착하는데 나밖에 나갈 사람이 없어.",
        "M: 공항까지? 여기서 멀잖아.",
        "W: 편도 한 시간이라 오후가 통째로 날아가.",
        "M: 그렇구나. 그럼 내일 갈까?",
        "W: 내일은 괜찮아. 약속한 필기 가져갈게.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 교내 사진 공모전에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["W", "Minjae, have you seen the poster for the photo competition?"],
        ["M", "I saw it, but I didn't stop to read it."],
        ["W", "This year's theme is 'a corner of our school'."],
        ["M", "That's a nice theme. When do we have to submit?"],
        ["W", "By the twentieth. That's two weeks from tomorrow."],
        ["M", "How do we hand the photos in?"],
        ["W", "You upload them to the school site, no printing needed."],
        ["M", "Good. How many can one person send?"],
        ["W", "Up to three, and they have to be your own."],
        ["M", "Then I'll look through the pictures on my phone tonight."],
        ["W", "Do. The ones from the rooftop would work well."],
      ],
      choices: ["주제", "제출 마감일", "제출 방법", "제출 편수", "심사위원"],
      answer: 5,
      clue: "Up to three, and they have to be your own.",
      explanation:
        "주제(우리 학교의 한 구석), 마감일(20일), 제출 방법(학교 누리집 올리기), 제출 편수(한 사람당 세 장)는 언급되지만 심사위원은 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 민재야, 사진 공모전 포스터 봤어?",
        "M: 보긴 했는데 멈춰서 읽지는 않았어.",
        "W: 올해 주제는 '우리 학교의 한 구석'이야.",
        "M: 주제 좋다. 언제까지 내야 해?",
        "W: 20일까지. 내일부터 2주 뒤야.",
        "M: 사진은 어떻게 내?",
        "W: 학교 누리집에 올리면 돼. 인쇄는 필요 없어.",
        "M: 좋네. 한 사람이 몇 장까지 낼 수 있어?",
        "W: 세 장까지, 본인이 찍은 거여야 해.",
        "M: 그럼 오늘 밤에 휴대전화 사진을 훑어봐야겠다.",
        "W: 그래. 옥상에서 찍은 것들이 괜찮겠더라.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Riverside Morning Run에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "M",
          "Good morning. Here is what you should know about the Riverside Morning Run. " +
            "It takes place on the first Sunday of every month, starting at seven in the morning. " +
            "The course is five kilometres along the river path, and it is flat the whole way. " +
            "Anyone over the age of twelve may join, and there is no entry fee. " +
            "Water is handed out at the halfway point, so you do not need to carry a bottle. " +
            "Runners who finish get a small badge, but there are no prizes and no times are recorded. " +
            "Just come to the bridge before seven and start with everyone else.",
        ],
      ],
      choices: [
        "매달 첫째 일요일 아침에 열린다",
        "강변 길을 따라 5킬로미터를 달린다",
        "열두 살이 넘으면 누구나 참가할 수 있다",
        "물은 각자 준비해야 한다",
        "완주한 사람에게 작은 배지를 준다",
      ],
      answer: 4,
      clue: "Water is handed out at the halfway point, so you do not need to carry a bottle.",
      explanation:
        "중간 지점에서 물을 나눠 주므로 물병을 가져올 필요가 없다고 했다. 따라서 ④가 내용과 일치하지 않는다.",
      translation: [
        "M: 안녕하세요. Riverside Morning Run에 관해 알아 두실 내용입니다. " +
          "매달 첫째 일요일 아침 7시에 시작합니다. " +
          "코스는 강변 길을 따라 5킬로미터이고, 처음부터 끝까지 평지입니다. " +
          "열두 살이 넘으면 누구나 참가할 수 있고 참가비는 없습니다. " +
          "중간 지점에서 물을 나눠 드리므로 물병을 들고 오실 필요가 없습니다. " +
          "완주하신 분께는 작은 배지를 드리지만 상은 없고 기록도 재지 않습니다. " +
          "7시 전에 다리로 오셔서 다 같이 출발하시면 됩니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 고를 자전거 대여소를 고르시오.",
      lines: [
        ["M", "Dain, these are the five bike rental shops near the park."],
        ["W", "Let's pick one. First, we need five bikes for the club."],
        ["M", "Then one of them is out. It only has three left."],
        ["W", "Next, we ride until six, so a shop that closes at five is no good."],
        ["M", "That removes another one. Three are left."],
        ["W", "How much are they per hour?"],
        ["M", "We said four thousand won an hour at the most."],
        ["W", "Then one more is gone. Two left."],
        ["M", "Do they both have helmets?"],
        ["W", "Only one does, and we can't ride without them."],
        ["M", "Then that's the one. I'll call and reserve five bikes."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 5,
      clue: "Then that's the one. I'll call and reserve five bikes.",
      explanation:
        "자전거가 세 대뿐인 ①, 5시에 닫는 ②, 시간당 5,000원인 ③을 뺀다. 남은 ④와 ⑤ 중 헬멧을 주는 곳은 ⑤이므로 답은 ⑤이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "3대 / 저녁 7시까지 / 3,000원 / 헬멧 있음" },
          { no: 2, label: "②", value: "8대 / 오후 5시까지 / 3,500원 / 헬멧 있음" },
          { no: 3, label: "③", value: "6대 / 저녁 8시까지 / 5,000원 / 헬멧 있음" },
          { no: 4, label: "④", value: "7대 / 저녁 7시까지 / 4,000원 / 헬멧 없음" },
          { no: 5, label: "⑤", value: "6대 / 저녁 7시까지 / 3,800원 / 헬멧 있음" },
        ],
      },
      translation: [
        "M: 다인아, 공원 근처 자전거 대여소가 이 다섯 곳이야.",
        "W: 하나 고르자. 우선 동아리에서 다섯 대가 필요해.",
        "M: 그럼 하나는 빠지네. 세 대밖에 안 남았대.",
        "W: 그리고 우리는 6시까지 타니까 5시에 닫는 데는 안 돼.",
        "M: 그럼 하나 더 빠진다. 셋 남았어.",
        "W: 시간당 얼마야?",
        "M: 시간당 4천 원까지로 정했잖아.",
        "W: 그럼 하나 더 빠지고 둘 남았다.",
        "M: 둘 다 헬멧은 줘?",
        "W: 한 곳만 줘. 헬멧 없이는 못 타잖아.",
        "M: 그럼 거기로 하자. 전화해서 다섯 대 예약할게.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Did you get the textbook for the new unit?"],
        ["M", "Not yet. The bookshop by the school was sold out."],
        ["W", "Did you ask them to order one?"],
        ["M", "I didn't think of that. I just left."],
        ["W", "They order twice a week and it takes two days."],
      ],
      choices: [
        "The unit starts next Monday.",
        "Then I'll ask them to order one today.",
        "I've already read the first chapter.",
        "That bookshop closes at seven.",
        "You should lend me yours instead.",
      ],
      answer: 2,
      clue: "They order twice a week and it takes two days.",
      explanation:
        "서점이 일주일에 두 번 주문하고 이틀이면 온다는 말을 들었으므로, 오늘 주문을 부탁하겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 새 단원 교재 샀어?",
        "M: 아직. 학교 옆 서점은 다 팔렸더라.",
        "W: 주문해 달라고는 해 봤어?",
        "M: 그 생각을 못 했어. 그냥 나왔어.",
        "W: 거기 일주일에 두 번 주문하고 이틀이면 와.",
        "M: 그럼 오늘 가서 주문해 달라고 할게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "You've been carrying that heavy bag all week."],
        ["W", "I know. I bring every textbook every day."],
        ["M", "Do you need all of them at school?"],
        ["W", "No, but I never remember to check the timetable."],
        ["M", "Put a copy of it inside your bag."],
      ],
      choices: [
        "My bag is almost five kilograms.",
        "I lost my timetable in March.",
        "Then I'll tape one inside tonight.",
        "The lockers are all taken already.",
        "You carry a lot of books too.",
      ],
      answer: 3,
      clue: "Put a copy of it inside your bag.",
      explanation:
        "시간표를 가방 안에 붙여 두라는 말을 들었으므로, 오늘 밤에 붙여 두겠다는 ③이 가장 자연스럽다.",
      translation: [
        "M: 일주일 내내 그 무거운 가방을 들고 다니네.",
        "W: 그러게. 교과서를 매일 다 가져와.",
        "M: 학교에서 그게 다 필요해?",
        "W: 아니, 그런데 시간표 확인하는 걸 늘 잊어버려.",
        "M: 시간표를 하나 복사해서 가방 안에 붙여 둬.",
        "W: 그럼 오늘 밤에 가방 안에 붙여 둘게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Soyeon, how is the school garden doing this term?"],
        ["W", "The vegetables are fine, but our group is falling apart."],
        ["M", "Falling apart how?"],
        ["W", "Six of us signed up, and only two come on Saturdays."],
        ["M", "Do the other four know when you meet?"],
        ["W", "I post it in the group chat every Friday night."],
        ["M", "Every Friday night? Does anyone reply?"],
        ["W", "Almost never. I assume they've read it."],
        ["M", "A message nobody answers is the same as no message."],
        ["W", "So you think they're not even seeing it."],
        ["M", "Ask each of them to reply with a yes or no by Friday evening."],
      ],
      choices: [
        "Then I'll ask for a yes or no from everyone this Friday.",
        "We grow tomatoes and lettuce there.",
        "I'll take care of the garden by myself.",
        "The garden club started two years ago.",
        "Saturday morning is the only free time.",
      ],
      answer: 1,
      clue: "Ask each of them to reply with a yes or no by Friday evening.",
      explanation:
        "금요일 저녁까지 각자 참석 여부를 답하게 하라는 조언을 들었으므로, 이번 금요일에 그렇게 하겠다는 ①이 가장 자연스럽다.",
      translation: [
        "M: 소연아, 이번 학기 학교 텃밭은 잘돼 가?",
        "W: 채소는 괜찮은데 우리 모둠이 무너지고 있어.",
        "M: 어떻게 무너지는데?",
        "W: 여섯 명이 신청했는데 토요일에 오는 건 두 명뿐이야.",
        "M: 나머지 네 명은 언제 모이는지 알아?",
        "W: 금요일 밤마다 단체 대화방에 올려.",
        "M: 금요일 밤마다? 답하는 사람은 있어?",
        "W: 거의 없어. 읽었겠거니 해.",
        "M: 아무도 답하지 않는 메시지는 없는 메시지랑 같아.",
        "W: 그럼 보지도 않는다는 말이야?",
        "M: 금요일 저녁까지 각자 온다 안 온다로 답하게 해 봐.",
        "W: 그럼 이번 금요일에는 다들 답을 달라고 해야겠다.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Woojin, you've been learning the guitar for six months now."],
        ["M", "Seven, and I still can't play a whole song without stopping."],
        ["W", "What do you do in a practice session?"],
        ["M", "I start at the beginning and play until I make a mistake."],
        ["W", "And then?"],
        ["M", "I go back to the beginning and start again."],
        ["W", "So you've played the first eight bars several hundred times."],
        ["M", "Probably more than that."],
        ["W", "And the hard part in the middle almost never gets played."],
        ["M", "I never noticed that."],
        ["W", "Start tomorrow's practice at the hard part and work outwards."],
      ],
      choices: [
        "I'll buy a new guitar this weekend.",
        "Then I'll begin with the middle section tomorrow.",
        "My lesson is every Tuesday evening.",
        "The song is about four minutes long.",
        "I'd rather learn an easier song first.",
      ],
      answer: 2,
      clue: "Start tomorrow's practice at the hard part and work outwards.",
      explanation:
        "어려운 가운데 부분부터 연습을 시작하라는 조언을 들었으므로, 내일은 가운데부터 시작하겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 우진아, 기타 배운 지 이제 6개월 됐지?",
        "M: 7개월, 그런데 아직 한 곡을 안 멈추고 못 쳐.",
        "W: 연습할 때 뭘 해?",
        "M: 처음부터 시작해서 실수할 때까지 쳐.",
        "W: 그다음엔?",
        "M: 다시 처음으로 돌아가서 시작해.",
        "W: 그럼 처음 여덟 마디를 수백 번 친 셈이네.",
        "M: 아마 그보다 많을걸.",
        "W: 그런데 가운데 어려운 부분은 거의 안 치는 거고.",
        "M: 그건 생각도 못 했어.",
        "W: 내일 연습은 어려운 부분부터 시작해서 바깥으로 넓혀 가 봐.",
        "M: 그럼 내일은 가운데 부분부터 시작할게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Mina가 Junho에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Mina : ________________",
      lines: [
        [
          "W",
          "Mina and Junho are in the same school broadcasting club. " +
            "Junho reads the lunchtime announcements, and his voice is clear and warm. " +
            "Students often say the announcements are easier to follow this year. " +
            "The problem is that he reads the whole notice, including the parts nobody needs. " +
            "Last week his three-minute slot ran to six, and the music never played. " +
            "Mina does not think his reading is the trouble; he is the best reader they have. " +
            "The trouble is that a notice read past the bell is a notice nobody hears. " +
            "She wants to suggest that he cut each notice down to the date, the place and one sentence. " +
            "In this situation, what would Mina most likely say to Junho?",
        ],
      ],
      choices: [
        "Could you read the notices a little faster?",
        "Let's play the music before the announcements.",
        "Keep each notice to the date, the place and one sentence.",
        "I think someone else should read them this week.",
        "You should record the announcements in advance.",
      ],
      answer: 3,
      clue: "She wants to suggest that he cut each notice down to the date, the place and one sentence.",
      explanation:
        "미나는 준호의 낭독 자체는 훌륭하다고 보면서, 공지를 날짜·장소·한 문장으로 줄이자고 말하려 한다. 따라서 ③이 가장 적절하다.",
      translation: [
        "W: 미나와 준호는 같은 학교 방송부입니다. " +
          "준호는 점심시간 공지를 읽고, 목소리가 또렷하고 따뜻합니다. " +
          "학생들은 올해 공지가 알아듣기 쉬워졌다고 말합니다. " +
          "문제는 준호가 아무도 필요로 하지 않는 부분까지 공지문을 통째로 읽는다는 점입니다. " +
          "지난주에는 3분짜리 시간이 6분이 되어 음악이 한 곡도 나가지 못했습니다. " +
          "미나는 준호의 낭독이 문제라고 생각하지 않습니다. 부에서 가장 잘 읽는 사람입니다. " +
          "문제는 종이 친 뒤까지 읽는 공지는 아무도 듣지 않는 공지라는 점입니다. " +
          "그래서 공지마다 날짜와 장소, 문장 하나로 줄이자고 제안하고 싶습니다. " +
          "이런 상황에서 미나가 준호에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "여자가 하는 말의 주제로 가장 적절한 것은?",
      lines: [
        ["W", "Good afternoon. Today I want to talk about animals that build."],
        ["W", "We usually think of building as something only people do, and that is simply wrong."],
        ["W", "A beaver drops trees across a stream and raises the water until its door is hidden underwater."],
        ["W", "The weaver bird ties real knots in grass, and a male that builds a poor nest is passed over."],
        ["W", "A termite mound is shaped so that warm air rises through it and pulls cool air in from below."],
        ["W", "The trapdoor spider digs a tube, lines it with silk and covers the opening with a hinged lid."],
        ["W", "None of these animals was taught, and none of them can explain why the design works."],
        ["W", "Yet each structure answers a question about heat, water or safety, just as our buildings do."],
      ],
      choices: [
        "how animals find food in winter",
        "why some animals live in groups",
        "structures that animals build and what they solve",
        "how birds learn their songs",
        "the history of human houses",
      ],
      answer: 3,
      clue: "Good afternoon. Today I want to talk about animals that build.",
      explanation:
        "여자는 비버, 베짜기새, 흰개미, 뚜껑거미가 지은 구조물이 각각 물, 짝짓기, 열, 안전 문제를 해결한다고 설명한다. 따라서 주제는 ③이다.",
      translation: [
        "W: 안녕하세요. 오늘은 무언가를 짓는 동물에 대해 이야기하려 합니다.",
        "W: 우리는 짓는 일이 사람만 하는 것이라고 생각하는데, 그것은 그냥 틀린 생각입니다.",
        "W: 비버는 개울을 가로질러 나무를 쓰러뜨리고, 제 집 문이 물속에 잠길 때까지 수위를 올립니다.",
        "W: 베짜기새는 풀로 진짜 매듭을 묶고, 집을 엉성하게 지은 수컷은 선택받지 못합니다.",
        "W: 흰개미 집은 더운 공기가 위로 빠져나가면서 아래에서 찬 공기를 끌어들이도록 생겼습니다.",
        "W: 뚜껑거미는 관 모양으로 굴을 파고 안쪽에 실을 대고 입구에 여닫이 뚜껑을 덮습니다.",
        "W: 이 동물들 가운데 배운 것은 하나도 없고, 왜 그 설계가 통하는지 설명할 수 있는 것도 없습니다.",
        "W: 그런데도 각 구조물은 열이나 물, 안전에 관한 물음에 답합니다. 우리 건물이 그러하듯이 말입니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 동물이 아닌 것은?",
      lines: [
        ["W", "Good afternoon. Today I want to talk about animals that build."],
        ["W", "We usually think of building as something only people do, and that is simply wrong."],
        ["W", "A beaver drops trees across a stream and raises the water until its door is hidden underwater."],
        ["W", "The weaver bird ties real knots in grass, and a male that builds a poor nest is passed over."],
        ["W", "A termite mound is shaped so that warm air rises through it and pulls cool air in from below."],
        ["W", "The trapdoor spider digs a tube, lines it with silk and covers the opening with a hinged lid."],
        ["W", "None of these animals was taught, and none of them can explain why the design works."],
        ["W", "Yet each structure answers a question about heat, water or safety, just as our buildings do."],
      ],
      choices: ["beaver", "weaver bird", "termite", "honeybee", "trapdoor spider"],
      answer: 4,
      clue: "The trapdoor spider digs a tube, lines it with silk and covers the opening with a hinged lid.",
      explanation:
        "비버, 베짜기새, 흰개미, 뚜껑거미는 언급되지만 꿀벌은 언급되지 않았다. 따라서 답은 ④이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
