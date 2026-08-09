import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AssignableStudent,
  ClassWithStudents,
  FolderAssignmentRow,
} from "@/components/vocab/VocabAssignmentPanel";

export async function loadAssignableStudents(
  supabase: SupabaseClient,
  role: "admin" | "teacher",
  userId: string,
  academyId: string | null
): Promise<AssignableStudent[]> {
  if (role === "admin") {
    let studentsQuery = supabase
      .from("profiles")
      .select("id, name, username")
      .eq("role", "student")
      .eq("is_active", true)
      .order("name");
    if (academyId) {
      studentsQuery = studentsQuery.eq("academy_id", academyId);
    }

    const membershipsQuery = supabase
      .from("class_students")
      .select("student_id, class_id, class:classes(name, is_active, academy_id)");

    const [{ data: students }, { data: memberships }] = await Promise.all([
      studentsQuery,
      membershipsQuery,
    ]);

    const classInfoByStudent = new Map<
      string,
      { ids: string[]; names: string[] }
    >();

    for (const row of memberships ?? []) {
      const cls = Array.isArray(row.class) ? row.class[0] : row.class;
      const classRow = cls as {
        name?: string;
        is_active?: boolean;
        academy_id?: string | null;
      } | null;
      if (!classRow?.name || classRow.is_active === false) continue;
      if (academyId && classRow.academy_id && classRow.academy_id !== academyId) {
        continue;
      }
      const name = classRow.name;
      const sid = row.student_id as string;
      const entry = classInfoByStudent.get(sid) ?? { ids: [], names: [] };
      if (!entry.ids.includes(row.class_id as string)) {
        entry.ids.push(row.class_id as string);
        entry.names.push(name);
      }
      classInfoByStudent.set(sid, entry);
    }

    return (students ?? []).map((s) => {
      const info = classInfoByStudent.get(s.id as string);
      return {
        id: s.id as string,
        name: (s.name as string) || (s.username as string) || "—",
        username: (s.username as string | null) ?? null,
        classIds: info?.ids ?? [],
        classLabel: info?.names.length ? info.names.join(", ") : "반 없음",
      };
    });
  }

  let teacherClassesQuery = supabase
    .from("classes")
    .select("id, name")
    .eq("teacher_id", userId)
    .eq("is_active", true);
  if (academyId) {
    teacherClassesQuery = teacherClassesQuery.eq("academy_id", academyId);
  }

  let createdStudentsQuery = supabase
    .from("profiles")
    .select("id, name, username")
    .eq("role", "student")
    .eq("is_active", true)
    .eq("created_by", userId);
  if (academyId) {
    createdStudentsQuery = createdStudentsQuery.eq("academy_id", academyId);
  }

  const [{ data: teacherClasses }, { data: createdStudents }] =
    await Promise.all([teacherClassesQuery, createdStudentsQuery]);

  const classIds = (teacherClasses ?? []).map((c) => c.id as string);
  const classNameById = new Map(
    (teacherClasses ?? []).map((c) => [c.id as string, c.name as string])
  );

  const studentIdSet = new Set<string>();
  const classInfoByStudent = new Map<
    string,
    { ids: string[]; names: string[] }
  >();

  const { data: members } =
    classIds.length > 0
      ? await supabase
          .from("class_students")
          .select("student_id, class_id")
          .in("class_id", classIds)
      : { data: [] as { student_id: string; class_id: string }[] };

  for (const row of members ?? []) {
    const sid = row.student_id as string;
    studentIdSet.add(sid);
    const entry = classInfoByStudent.get(sid) ?? { ids: [], names: [] };
    const cid = row.class_id as string;
    if (!entry.ids.includes(cid)) {
      entry.ids.push(cid);
      entry.names.push(classNameById.get(cid) ?? "—");
    }
    classInfoByStudent.set(sid, entry);
  }

  for (const s of createdStudents ?? []) {
    studentIdSet.add(s.id as string);
  }

  if (studentIdSet.size === 0) return [];

  const ids = [...studentIdSet];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, name, username")
    .in("id", ids)
    .order("name");

  return (profiles ?? []).map((s) => {
    const info = classInfoByStudent.get(s.id as string);
    return {
      id: s.id as string,
      name: (s.name as string) || (s.username as string) || "—",
      username: (s.username as string | null) ?? null,
      classIds: info?.ids ?? [],
      classLabel: info?.names.length ? info.names.join(", ") : "반 없음",
    };
  });
}

async function loadClasses(
  supabase: SupabaseClient,
  role: "admin" | "teacher",
  userId: string,
  academyId: string | null
) {
  if (role === "admin") {
    let q = supabase
      .from("classes")
      .select("id, name")
      .eq("is_active", true)
      .order("name");
    if (academyId) q = q.eq("academy_id", academyId);
    return q;
  }
  let q = supabase
    .from("classes")
    .select("id, name")
    .eq("teacher_id", userId)
    .eq("is_active", true)
    .order("name");
  if (academyId) q = q.eq("academy_id", academyId);
  return q;
}

export async function loadFolderAssignPanelData(
  supabase: SupabaseClient,
  role: "admin" | "teacher",
  userId: string,
  folderId: string,
  academyId: string | null = null
): Promise<{
  classes: ClassWithStudents[];
  allStudents: AssignableStudent[];
  assignments: FolderAssignmentRow[];
  setCount: number;
  setTitles: string[];
}> {
  const [classesRes, setsRes, allStudents] = await Promise.all([
    loadClasses(supabase, role, userId, academyId),
    supabase
      .from("vocab_sets")
      .select("id, title")
      .eq("folder_id", folderId)
      .order("order_index", { ascending: true })
      .order("created_at", { ascending: true }),
    loadAssignableStudents(supabase, role, userId, academyId),
  ]);

  return finishFolderAssignPanel(
    supabase,
    (classesRes.data ?? []) as { id: string; name: string }[],
    (setsRes.data ?? []) as { id: string; title: string }[],
    allStudents
  );
}

export async function loadUnfiledAssignPanelData(
  supabase: SupabaseClient,
  role: "admin" | "teacher",
  userId: string,
  academyId: string | null = null
): Promise<{
  classes: ClassWithStudents[];
  allStudents: AssignableStudent[];
  assignments: FolderAssignmentRow[];
  setCount: number;
  setTitles: string[];
}> {
  const [classesRes, setsRes, allStudents] = await Promise.all([
    loadClasses(supabase, role, userId, academyId),
    supabase
      .from("vocab_sets")
      .select("id, title")
      .is("folder_id", null)
      .order("order_index", { ascending: true })
      .order("created_at", { ascending: true }),
    loadAssignableStudents(supabase, role, userId, academyId),
  ]);

  return finishFolderAssignPanel(
    supabase,
    (classesRes.data ?? []) as { id: string; name: string }[],
    (setsRes.data ?? []) as { id: string; title: string }[],
    allStudents
  );
}

async function finishFolderAssignPanel(
  supabase: SupabaseClient,
  classRows: { id: string; name: string }[],
  setRows: { id: string; title: string }[],
  allStudents: AssignableStudent[]
): Promise<{
  classes: ClassWithStudents[];
  allStudents: AssignableStudent[];
  assignments: FolderAssignmentRow[];
  setCount: number;
  setTitles: string[];
}> {
  const setList = setRows;
  const setIds = setList.map((s) => s.id);
  const setTitles = setList.map((s) => s.title);

  const classList = classRows as { id: string; name: string }[];
  const classIds = classList.map((c) => c.id);

  // allStudents에 이미 classIds가 있으므로 class_students를 다시 안 치고 조립
  const studentsByClass = new Map<string, { id: string; name: string }[]>();
  for (const student of allStudents) {
    for (const cid of student.classIds) {
      if (!classIds.includes(cid)) continue;
      const list = studentsByClass.get(cid) ?? [];
      list.push({ id: student.id, name: student.name });
      studentsByClass.set(cid, list);
    }
  }

  const assignmentsRes =
    setIds.length > 0
      ? await supabase
          .from("vocab_assignments")
          .select(
            "id, set_id, student_id, class_id, set:vocab_sets(title), student:profiles!vocab_assignments_student_id_fkey(name), class:classes(name)"
          )
          .in("set_id", setIds)
          .not("student_id", "is", null)
          .order("created_at", { ascending: false })
      : { data: [] };

  const classes: ClassWithStudents[] = classList.map((c) => ({
    id: c.id,
    name: c.name,
    students: studentsByClass.get(c.id) ?? [],
  }));

  const assignments: FolderAssignmentRow[] = (assignmentsRes.data ?? []).map(
    (row) => {
      const set = Array.isArray(row.set) ? row.set[0] : row.set;
      const student = Array.isArray(row.student) ? row.student[0] : row.student;
      const cls = Array.isArray(row.class) ? row.class[0] : row.class;
      return {
        id: row.id as string,
        set_id: row.set_id as string,
        student_id: row.student_id as string,
        class_id: row.class_id as string | null,
        set_title: (set as { title?: string } | null)?.title ?? "—",
        student_name: (student as { name?: string } | null)?.name ?? "—",
        class_name: (cls as { name?: string } | null)?.name ?? "—",
      };
    }
  );

  return {
    classes,
    allStudents,
    assignments,
    setCount: setList.length,
    setTitles,
  };
}

export async function loadSetAssignPanelData(
  supabase: SupabaseClient,
  role: "admin" | "teacher",
  userId: string,
  setId: string,
  academyId: string | null = null
): Promise<{
  classes: ClassWithStudents[];
  allStudents: AssignableStudent[];
  assignments: FolderAssignmentRow[];
  setCount: number;
  setTitles: string[];
}> {
  const { data: set } = await supabase
    .from("vocab_sets")
    .select("id, title")
    .eq("id", setId)
    .single();

  if (!set) {
    return {
      classes: [],
      allStudents: [],
      assignments: [],
      setCount: 0,
      setTitles: [],
    };
  }

  const [classesRes, allStudents, assignmentsRes] = await Promise.all([
    loadClasses(supabase, role, userId, academyId),
    loadAssignableStudents(supabase, role, userId, academyId),
    supabase
      .from("vocab_assignments")
      .select(
        "id, set_id, student_id, class_id, set:vocab_sets(title), student:profiles!vocab_assignments_student_id_fkey(name), class:classes(name)"
      )
      .eq("set_id", setId)
      .not("student_id", "is", null)
      .order("created_at", { ascending: false }),
  ]);

  const classList = (classesRes.data ?? []) as { id: string; name: string }[];
  const classIds = classList.map((c) => c.id);

  const studentsByClass = new Map<string, { id: string; name: string }[]>();
  for (const student of allStudents) {
    for (const cid of student.classIds) {
      if (!classIds.includes(cid)) continue;
      const list = studentsByClass.get(cid) ?? [];
      list.push({ id: student.id, name: student.name });
      studentsByClass.set(cid, list);
    }
  }

  const classes: ClassWithStudents[] = classList.map((c) => ({
    id: c.id,
    name: c.name,
    students: studentsByClass.get(c.id) ?? [],
  }));

  const assignments: FolderAssignmentRow[] = (assignmentsRes.data ?? []).map(
    (row) => {
      const setRow = Array.isArray(row.set) ? row.set[0] : row.set;
      const student = Array.isArray(row.student) ? row.student[0] : row.student;
      const cls = Array.isArray(row.class) ? row.class[0] : row.class;
      return {
        id: row.id as string,
        set_id: row.set_id as string,
        student_id: row.student_id as string,
        class_id: row.class_id as string | null,
        set_title: (setRow as { title?: string } | null)?.title ?? "—",
        student_name: (student as { name?: string } | null)?.name ?? "—",
        class_name: (cls as { name?: string } | null)?.name ?? "—",
      };
    }
  );

  return {
    classes,
    allStudents,
    assignments,
    setCount: 1,
    setTitles: [set.title as string],
  };
}
