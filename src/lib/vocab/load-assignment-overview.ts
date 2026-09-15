import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchByIdChunks } from "@/lib/vocab/fetch-all";

export interface AssignmentOverviewSet {
  setId: string;
  title: string;
  assignmentIds: string[];
}

export interface AssignmentOverviewGroup {
  key: string;
  kind: "class" | "student";
  id: string;
  name: string;
  /** 반: "학생 18명" · 학생: 아이디·소속 반 */
  sub: string;
  /** 가장 최근 배정 시각 */
  latest: string;
  sets: AssignmentOverviewSet[];
}

type Row = {
  id: string;
  set_id: string;
  student_id: string | null;
  class_id: string | null;
  created_at: string;
};

/**
 * 배정 탭 — 지금 배정을 받는 쪽(반·학생)별로 묶는다.
 * 반으로 배정하면 학생마다 줄이 생기므로 class_id로 묶고, class_id 없는 줄만 학생 개인 배정으로 본다.
 */
export async function loadVocabAssignmentOverview(
  supabase: SupabaseClient,
  sets: { id: string; title: string }[]
): Promise<AssignmentOverviewGroup[]> {
  const titleById = new Map(sets.map((s) => [s.id, s.title]));
  const rows = await fetchByIdChunks<Row>(
    sets.map((s) => s.id),
    (chunk, from, to) =>
      supabase
        .from("vocab_assignments")
        .select("id, set_id, student_id, class_id, created_at")
        .in("set_id", chunk)
        .range(from, to)
  );
  if (rows.length === 0) return [];

  const classIds = [...new Set(rows.map((r) => r.class_id).filter((v): v is string => !!v))];
  const directIds = [
    ...new Set(
      rows.filter((r) => !r.class_id && r.student_id).map((r) => r.student_id as string)
    ),
  ];

  const [classRows, memberRows, studentRows, directLinks] = await Promise.all([
    fetchByIdChunks<{ id: string; name: string }>(classIds, (chunk, from, to) =>
      supabase.from("classes").select("id, name").in("id", chunk).range(from, to)
    ),
    fetchByIdChunks<{ class_id: string }>(classIds, (chunk, from, to) =>
      supabase.from("class_students").select("class_id").in("class_id", chunk).range(from, to)
    ),
    fetchByIdChunks<{ id: string; name: string | null; username: string | null }>(
      directIds,
      (chunk, from, to) =>
        supabase.from("profiles").select("id, name, username").in("id", chunk).range(from, to)
    ),
    fetchByIdChunks<{ student_id: string; class: { name: string | null } | { name: string | null }[] | null }>(
      directIds,
      (chunk, from, to) =>
        supabase
          .from("class_students")
          .select("student_id, class:classes(name)")
          .in("student_id", chunk)
          .range(from, to)
    ),
  ]);

  const className = new Map(classRows.map((c) => [c.id, c.name]));
  const memberCount = new Map<string, number>();
  for (const m of memberRows) memberCount.set(m.class_id, (memberCount.get(m.class_id) ?? 0) + 1);
  const student = new Map(studentRows.map((s) => [s.id, s]));
  const classNamesByStudent = new Map<string, string[]>();
  for (const link of directLinks) {
    const cls = Array.isArray(link.class) ? link.class[0] : link.class;
    if (!cls?.name) continue;
    const list = classNamesByStudent.get(link.student_id) ?? [];
    list.push(cls.name);
    classNamesByStudent.set(link.student_id, list);
  }

  const groups = new Map<string, AssignmentOverviewGroup & { setMap: Map<string, AssignmentOverviewSet> }>();
  for (const r of rows) {
    const kind = r.class_id ? "class" : "student";
    const id = (r.class_id ?? r.student_id) as string | null;
    if (!id) continue;
    const key = `${kind}:${id}`;
    let g = groups.get(key);
    if (!g) {
      const st = kind === "student" ? student.get(id) : undefined;
      const classes = classNamesByStudent.get(id) ?? [];
      g = {
        key,
        kind,
        id,
        name:
          kind === "class"
            ? (className.get(id) ?? "반")
            : st?.name || st?.username || "학생",
        sub:
          kind === "class"
            ? `학생 ${memberCount.get(id) ?? 0}명`
            : [st?.username, classes.join(", ") || "반 없음"].filter(Boolean).join(" · "),
        latest: r.created_at,
        sets: [],
        setMap: new Map(),
      };
      groups.set(key, g);
    }
    if (r.created_at > g.latest) g.latest = r.created_at;
    const entry = g.setMap.get(r.set_id) ?? {
      setId: r.set_id,
      title: titleById.get(r.set_id) ?? "단어장",
      assignmentIds: [],
    };
    entry.assignmentIds.push(r.id);
    g.setMap.set(r.set_id, entry);
  }

  const order = new Map(sets.map((s, i) => [s.id, i]));
  return [...groups.values()]
    .map(({ setMap, ...g }) => ({
      ...g,
      sets: [...setMap.values()].sort(
        (a, b) => (order.get(a.setId) ?? 0) - (order.get(b.setId) ?? 0)
      ),
    }))
    .sort((a, b) =>
      a.kind !== b.kind
        ? a.kind === "class"
          ? -1
          : 1
        : a.name.localeCompare(b.name, "ko", { numeric: true })
    );
}
