/** 1번 유형(What am I?) — 정답 대상 소재 풀 */

export type Type1SubjectCategory = "animal" | "object" | "place" | "job";

export interface Type1SubjectAssignment {
  id: string;
  category: Type1SubjectCategory;
  /** 정답 선택지 (영어) */
  answer: string;
  /** 출제 참고 (한국어) */
  theme: string;
  /** 단서 방향 (영어 키워드) */
  clueHints: string[];
  /** 같은 범주 오답 후보 */
  peerChoices: string[];
}

const TYPE1_SUBJECTS: Type1SubjectAssignment[] = [
  // animals (8)
  {
    id: "dolphin",
    category: "animal",
    answer: "A dolphin",
    theme: "바다에서 헤엄치며 똑똑하게 사는 동물",
    clueHints: ["ocean", "smart", "jump", "breathe air"],
    peerChoices: ["A whale", "A shark", "A seal", "A penguin"],
  },
  {
    id: "penguin",
    category: "animal",
    answer: "A penguin",
    theme: "추운 지역에서 걸어 다니고 헤엄치는 새",
    clueHints: ["cold place", "black and white", "cannot fly", "swim"],
    peerChoices: ["A duck", "A seal", "An owl", "A parrot"],
  },
  {
    id: "elephant",
    category: "animal",
    answer: "An elephant",
    theme: "코가 길고 몸집이 큰 육지 동물",
    clueHints: ["trunk", "large", "memory", "Africa or Asia"],
    peerChoices: ["A giraffe", "A rhino", "A hippo", "A camel"],
  },
  {
    id: "butterfly",
    category: "animal",
    answer: "A butterfly",
    theme: "꽃 주변에서 날아다니는 곤충",
    clueHints: ["wings", "colorful", "flower", "caterpillar"],
    peerChoices: ["A bee", "A dragonfly", "A moth", "A ladybug"],
  },
  {
    id: "kangaroo",
    category: "animal",
    answer: "A kangaroo",
    theme: "뛰어 다니며 주머니가 있는 동물",
    clueHints: ["Australia", "jump", "pouch", "baby inside"],
    peerChoices: ["A koala", "A rabbit", "A deer", "A fox"],
  },
  {
    id: "owl",
    category: "animal",
    answer: "An owl",
    theme: "밤에 활동하는 새",
    clueHints: ["night", "big eyes", "quiet flight", "hoot sound"],
    peerChoices: ["An eagle", "A crow", "A parrot", "A bat"],
  },
  {
    id: "giraffe",
    category: "animal",
    answer: "A giraffe",
    theme: "목이 매우 긴 초원 동물",
    clueHints: ["tall neck", "spots", "eat leaves", "Africa"],
    peerChoices: ["A zebra", "A horse", "A camel", "A deer"],
  },
  {
    id: "beaver",
    category: "animal",
    answer: "A beaver",
    theme: "강가에서 댐을 만드는 동물",
    clueHints: ["river", "dam", "strong teeth", "build"],
    peerChoices: ["A otter", "A duck", "A frog", "A fish"],
  },
  // objects (8)
  {
    id: "bicycle",
    category: "object",
    answer: "A bicycle",
    theme: "두 바퀴로 타는 교통 수단",
    clueHints: ["two wheels", "pedal", "ride", "no engine"],
    peerChoices: ["A scooter", "A skateboard", "A motorcycle", "A wagon"],
  },
  {
    id: "refrigerator",
    category: "object",
    answer: "A refrigerator",
    theme: "음식을 차갑게 보관하는 가전",
    clueHints: ["kitchen", "cold", "keep food fresh", "door"],
    peerChoices: ["A microwave", "An oven", "A freezer", "A dishwasher"],
  },
  {
    id: "telescope",
    category: "object",
    answer: "A telescope",
    theme: "멀리 있는 것을 보는 도구",
    clueHints: ["stars", "far away", "look up", "lens"],
    peerChoices: ["A microscope", "A camera", "Binoculars", "A compass"],
  },
  {
    id: "guitar",
    category: "object",
    answer: "A guitar",
    theme: "줄을 튕겨 소리를 내는 악기",
    clueHints: ["strings", "music", "play songs", "hold in hands"],
    peerChoices: ["A violin", "A piano", "A drum", "A flute"],
  },
  {
    id: "compass",
    category: "object",
    answer: "A compass",
    theme: "방향을 알려 주는 작은 도구",
    clueHints: ["north", "needle", "direction", "travel"],
    peerChoices: ["A map", "A watch", "A ruler", "A thermometer"],
  },
  {
    id: "keyboard",
    category: "object",
    answer: "A keyboard",
    theme: "컴퓨터에 글자를 입력하는 도구",
    clueHints: ["computer", "type", "many keys", "letters"],
    peerChoices: ["A mouse", "A monitor", "A printer", "A speaker"],
  },
  {
    id: "backpack",
    category: "object",
    answer: "A backpack",
    theme: "등에 메고 물건을 넣어 다니는 가방",
    clueHints: ["school", "carry books", "straps", "zipper"],
    peerChoices: ["A suitcase", "A handbag", "A wallet", "A basket"],
  },
  {
    id: "microscope",
    category: "object",
    answer: "A microscope",
    theme: "아주 작은 것을 크게 보는 과학 도구",
    clueHints: ["science class", "tiny things", "lens", "laboratory"],
    peerChoices: ["A telescope", "A magnifying glass", "A calculator", "A ruler"],
  },
  // places (8)
  {
    id: "aquarium",
    category: "place",
    answer: "An aquarium",
    theme: "바다 생물을 볼 수 있는 장소",
    clueHints: ["fish", "glass tanks", "visit", "learn about sea life"],
    peerChoices: ["A zoo", "A museum", "A park", "A beach"],
  },
  {
    id: "observatory",
    category: "place",
    answer: "An observatory",
    theme: "별과 우주를 관측하는 장소",
    clueHints: ["stars", "telescope", "night sky", "scientists"],
    peerChoices: ["A library", "A planetarium", "A laboratory", "A stadium"],
  },
  {
    id: "bakery",
    category: "place",
    answer: "A bakery",
    theme: "빵과 과자를 파는 가게",
    clueHints: ["bread", "cakes", "smell", "buy snacks"],
    peerChoices: ["A restaurant", "A supermarket", "A cafe", "A market"],
  },
  {
    id: "post_office",
    category: "place",
    answer: "A post office",
    theme: "편지와 소포를 보내는 곳",
    clueHints: ["mail", "packages", "stamps", "send letters"],
    peerChoices: ["A bank", "A library", "A hospital", "A police station"],
  },
  {
    id: "greenhouse",
    category: "place",
    answer: "A greenhouse",
    theme: "식물을 키우는 유리 건물",
    clueHints: ["plants", "warm", "glass walls", "grow flowers"],
    peerChoices: ["A garden", "A farm", "A forest", "A park"],
  },
  {
    id: "train_station",
    category: "place",
    answer: "A train station",
    theme: "기차를 타고 내리는 곳",
    clueHints: ["platform", "tickets", "schedule", "travel"],
    peerChoices: ["A bus stop", "An airport", "A harbor", "A parking lot"],
  },
  {
    id: "swimming_pool",
    category: "place",
    answer: "A swimming pool",
    theme: "물에서 수영하는 실내·실외 시설",
    clueHints: ["water", "swim", "lanes", "exercise"],
    peerChoices: ["A gym", "A beach", "A lake", "A stadium"],
  },
  {
    id: "planetarium",
    category: "place",
    answer: "A planetarium",
    theme: "천체를 영상으로 보여 주는 시설",
    clueHints: ["stars", "dome ceiling", "space show", "dark room"],
    peerChoices: ["An observatory", "A cinema", "A museum", "A theater"],
  },
  // jobs (8)
  {
    id: "veterinarian",
    category: "job",
    answer: "A veterinarian",
    theme: "아픈 동물을 치료하는 사람",
    clueHints: ["animals", "clinic", "sick pets", "care"],
    peerChoices: ["A doctor", "A nurse", "A farmer", "A zookeeper"],
  },
  {
    id: "librarian",
    category: "job",
    answer: "A librarian",
    theme: "도서관에서 책을 관리하는 사람",
    clueHints: ["library", "books", "quiet", "help readers"],
    peerChoices: ["A teacher", "A writer", "A journalist", "A clerk"],
  },
  {
    id: "architect",
    category: "job",
    answer: "An architect",
    theme: "건물을 설계하는 사람",
    clueHints: ["design buildings", "draw plans", "construction", "creative"],
    peerChoices: ["An engineer", "A builder", "An artist", "A designer"],
  },
  {
    id: "photographer",
    category: "job",
    answer: "A photographer",
    theme: "사진을 찍는 사람",
    clueHints: ["camera", "take pictures", "memories", "studio"],
    peerChoices: ["A painter", "A reporter", "A director", "An artist"],
  },
  {
    id: "mechanic",
    category: "job",
    answer: "A mechanic",
    theme: "고장 난 차를 고치는 사람",
    clueHints: ["car", "repair", "garage", "tools"],
    peerChoices: ["A driver", "An engineer", "A builder", "A pilot"],
  },
  {
    id: "astronaut",
    category: "job",
    answer: "An astronaut",
    theme: "우주로 나가는 사람",
    clueHints: ["space", "rocket", "float", "explore"],
    peerChoices: ["A pilot", "A scientist", "An engineer", "A soldier"],
  },
  {
    id: "journalist",
    category: "job",
    answer: "A journalist",
    theme: "뉴스를 취재하고 기사를 쓰는 사람",
    clueHints: ["news", "interview", "report", "newspaper"],
    peerChoices: ["A writer", "A teacher", "A lawyer", "A singer"],
  },
  {
    id: "pharmacist",
    category: "job",
    answer: "A pharmacist",
    theme: "약을 조제하고 설명하는 사람",
    clueHints: ["medicine", "pharmacy", "prescription", "help patients"],
    peerChoices: ["A doctor", "A nurse", "A dentist", "A scientist"],
  },
  // 기출에서 자주 나오는 소재 (풀에 포함 — 로테이션으로 다양하게)
  {
    id: "umbrella",
    category: "object",
    answer: "An umbrella",
    theme: "비 오는 날 쓰는 물건",
    clueHints: ["rain", "open and close", "handle", "stay dry"],
    peerChoices: ["A raincoat", "A hat", "A bag", "A boot"],
  },
  {
    id: "turtle",
    category: "animal",
    answer: "A turtle",
    theme: "단단한 등껍질이 있는 동물",
    clueHints: ["shell", "slow", "water and land", "hide inside"],
    peerChoices: ["A frog", "A crab", "A snail", "A lizard"],
  },
  {
    id: "rabbit",
    category: "animal",
    answer: "A rabbit",
    theme: "긴 귀와 뒷다리로 뛰는 동물",
    clueHints: ["long ears", "hop", "carrot", "soft fur"],
    peerChoices: ["A hamster", "A squirrel", "A mouse", "A guinea pig"],
  },
  {
    id: "pencil",
    category: "object",
    answer: "A pencil",
    theme: "글씨를 쓰는 학용품",
    clueHints: ["write", "paper", "eraser end", "school"],
    peerChoices: ["A pen", "A crayon", "A marker", "A ruler"],
  },
  {
    id: "cat",
    category: "animal",
    answer: "A cat",
    theme: "집에서 기르는 작은 동물",
    clueHints: ["meow", "whiskers", "climb", "pet"],
    peerChoices: ["A dog", "A hamster", "A bird", "A fish"],
  },
  {
    id: "dog",
    category: "animal",
    answer: "A dog",
    theme: "사람과 함께하는 충성스러운 동물",
    clueHints: ["bark", "walk", "loyal", "pet"],
    peerChoices: ["A cat", "A wolf", "A fox", "A rabbit"],
  },
  {
    id: "library",
    category: "place",
    answer: "A library",
    theme: "책을 빌리고 읽는 조용한 장소",
    clueHints: ["books", "quiet", "borrow", "read"],
    peerChoices: ["A bookstore", "A classroom", "A museum", "A cafe"],
  },
  {
    id: "doctor",
    category: "job",
    answer: "A doctor",
    theme: "아픈 사람을 치료하는 사람",
    clueHints: ["hospital", "patients", "medicine", "check health"],
    peerChoices: ["A nurse", "A dentist", "A pharmacist", "A vet"],
  },
  {
    id: "hospital",
    category: "place",
    answer: "A hospital",
    theme: "환자를 치료하는 시설",
    clueHints: ["sick people", "doctors", "emergency", "medicine"],
    peerChoices: ["A clinic", "A pharmacy", "A school", "A police station"],
  },
  {
    id: "teacher",
    category: "job",
    answer: "A teacher",
    theme: "학생에게 가르치는 사람",
    clueHints: ["school", "class", "homework", "explain lessons"],
    peerChoices: ["A principal", "A librarian", "A coach", "A tutor"],
  },
  {
    id: "eraser",
    category: "object",
    answer: "An eraser",
    theme: "연필 자국을 지우는 도구",
    clueHints: ["mistake", "rub", "pencil marks", "school"],
    peerChoices: ["A pencil", "A ruler", "A sharpener", "A notebook"],
  },
  {
    id: "horse",
    category: "animal",
    answer: "A horse",
    theme: "사람이 탈 수 있는 큰 동물",
    clueHints: ["ride", "mane", "run fast", "farm"],
    peerChoices: ["A donkey", "A cow", "A camel", "A zebra"],
  },
];

export function parseUsedType1SubjectIds(previousProblems?: string[]): string[] {
  if (!previousProblems?.length) return [];
  const ids: string[] = [];
  for (const line of previousProblems) {
    const m = line.match(/subject_id:([a-z0-9_]+)/i);
    if (m?.[1]) ids.push(m[1]);
  }
  return ids;
}

export function pickType1Subject(
  previousProblems?: string[]
): Type1SubjectAssignment {
  const used = new Set(parseUsedType1SubjectIds(previousProblems));
  const available = TYPE1_SUBJECTS.filter((s) => !used.has(s.id));
  const list = available.length > 0 ? available : TYPE1_SUBJECTS;
  return list[Math.floor(Math.random() * list.length)]!;
}

export function formatAssignedType1SubjectBlock(
  assignment: Type1SubjectAssignment
): string {
  const categoryKo: Record<Type1SubjectCategory, string> = {
    animal: "동물",
    object: "사물",
    place: "장소",
    job: "직업",
  };

  return `
## 이번 1번 문항 필수 정답 대상 (반드시 따를 것)
- subject_id: ${assignment.id}
- 범주: ${categoryKo[assignment.category]} (${assignment.category})
- 정답 선택지(영어): ${assignment.answer}
- 소재 방향: ${assignment.theme}
- 단서에 활용할 키워드(참고): ${assignment.clueHints.join(", ")}
- 오답 4개는 같은 범주(${categoryKo[assignment.category]})에서 선택. 참고: ${assignment.peerChoices.join(", ")}
- JSON의 situation_type 필드에는 반드시 "${assignment.id}" 를 넣는다.
- 정답은 반드시 "${assignment.answer}" 이어야 한다. 다른 대상으로 바꾸지 말 것.
- 정답 범주와 다른 범주의 선택지 섞기 금지
- "I am a ..." 로 정답을 직접 밝히기 금지
`.trim();
}

export function buildType1AvoidList(
  priorQuestions: Array<{
    order_index: number;
    situation_type?: string;
    choices: string[];
    correct_answer?: number;
  }>
): string[] {
  const lines: string[] = [];
  for (const q of priorQuestions) {
    const st = (q.situation_type ?? "").trim();
    const answer = q.choices[(q.correct_answer ?? 1) - 1] ?? "";
    lines.push(`subject_id:${st || "unknown"}|item:${q.order_index}|answer:${answer}`);
  }
  return lines;
}
