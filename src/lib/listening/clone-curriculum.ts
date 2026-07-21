import { createAdminClient } from "@/lib/supabase/admin";
import { CURRICULUM_LOCK_MARKER } from "@/lib/listening/listening-api-auth";

const TEMPLATE_ACADEMY_SLUG = "jeongsu";

export type CloneCurriculumResult = {
  sourceAcademyId: string;
  foldersCreated: number;
  setsCloned: number;
  setsSkipped: number;
  questionsCloned: number;
};

async function resolveTemplateAcademyId(
  admin: ReturnType<typeof createAdminClient>,
  sourceAcademyId?: string
): Promise<string> {
  if (sourceAcademyId) return sourceAcademyId;
  const { data, error } = await admin
    .from("academies")
    .select("id")
    .eq("slug", TEMPLATE_ACADEMY_SLUG)
    .maybeSingle();
  if (error || !data?.id) {
    throw new Error(
      `커리큘럼 템플릿 학원(${TEMPLATE_ACADEMY_SLUG})을 찾을 수 없습니다.`
    );
  }
  return data.id as string;
}

/**
 * Copy locked curriculum listening sets from template academy → target.
 * Reuses audio_url (no TTS re-generation). Idempotent by folder name + set title.
 */
export async function cloneListeningCurriculumToAcademy(opts: {
  targetAcademyId: string;
  ownerProfileId: string;
  sourceAcademyId?: string;
}): Promise<CloneCurriculumResult> {
  const admin = createAdminClient();
  const sourceAcademyId = await resolveTemplateAcademyId(
    admin,
    opts.sourceAcademyId
  );

  if (sourceAcademyId === opts.targetAcademyId) {
    return {
      sourceAcademyId,
      foldersCreated: 0,
      setsCloned: 0,
      setsSkipped: 0,
      questionsCloned: 0,
    };
  }

  const { data: sourceSets, error: setsErr } = await admin
    .from("listening_sets")
    .select("*")
    .eq("academy_id", sourceAcademyId)
    .ilike("description", `%${CURRICULUM_LOCK_MARKER}%`)
    .order("order_index", { ascending: true });

  if (setsErr) throw new Error(setsErr.message);
  if (!sourceSets?.length) {
    return {
      sourceAcademyId,
      foldersCreated: 0,
      setsCloned: 0,
      setsSkipped: 0,
      questionsCloned: 0,
    };
  }

  const folderIds = [
    ...new Set(
      sourceSets
        .map((s) => s.folder_id as string | null)
        .filter((id): id is string => !!id)
    ),
  ];

  const folderIdMap = new Map<string, string>();
  let foldersCreated = 0;

  if (folderIds.length > 0) {
    const { data: sourceFolders, error: folderErr } = await admin
      .from("listening_set_folders")
      .select("id, name, order_index, parent_id")
      .in("id", folderIds);
    if (folderErr) throw new Error(folderErr.message);

    for (const folder of sourceFolders ?? []) {
      const { data: existing } = await admin
        .from("listening_set_folders")
        .select("id")
        .eq("academy_id", opts.targetAcademyId)
        .eq("name", folder.name)
        .maybeSingle();

      if (existing?.id) {
        folderIdMap.set(folder.id, existing.id as string);
        continue;
      }

      const { data: created, error: createFolderErr } = await admin
        .from("listening_set_folders")
        .insert({
          name: folder.name,
          order_index: folder.order_index ?? 0,
          parent_id: null,
          teacher_id: opts.ownerProfileId,
          created_by: opts.ownerProfileId,
          academy_id: opts.targetAcademyId,
        })
        .select("id")
        .single();
      if (createFolderErr || !created) {
        throw new Error(createFolderErr?.message ?? "folder clone failed");
      }
      folderIdMap.set(folder.id, created.id as string);
      foldersCreated += 1;
    }
  }

  let setsCloned = 0;
  let setsSkipped = 0;
  let questionsCloned = 0;

  for (const src of sourceSets) {
    const targetFolderId = src.folder_id
      ? folderIdMap.get(src.folder_id as string) ?? null
      : null;

    let existingQuery = admin
      .from("listening_sets")
      .select("id")
      .eq("academy_id", opts.targetAcademyId)
      .eq("title", src.title as string);

    if (targetFolderId) {
      existingQuery = existingQuery.eq("folder_id", targetFolderId);
    } else {
      existingQuery = existingQuery.is("folder_id", null);
    }

    const { data: existingSet } = await existingQuery.maybeSingle();
    if (existingSet?.id) {
      setsSkipped += 1;
      continue;
    }

    const {
      id: _id,
      created_at: _ca,
      updated_at: _ua,
      ...setRest
    } = src as Record<string, unknown>;

    const insertSet: Record<string, unknown> = {
      ...setRest,
      academy_id: opts.targetAcademyId,
      folder_id: targetFolderId,
      teacher_id: opts.ownerProfileId,
      created_by: opts.ownerProfileId,
      description: CURRICULUM_LOCK_MARKER,
      is_locked: true,
      is_published: true,
    };

    let { data: newSet, error: setInsertErr } = await admin
      .from("listening_sets")
      .insert(insertSet)
      .select("id")
      .single();

    if (setInsertErr && /is_locked/i.test(setInsertErr.message)) {
      delete insertSet.is_locked;
      ({ data: newSet, error: setInsertErr } = await admin
        .from("listening_sets")
        .insert(insertSet)
        .select("id")
        .single());
    }
    if (setInsertErr || !newSet) {
      throw new Error(setInsertErr?.message ?? "set clone failed");
    }

    const newSetId = newSet.id as string;
    setsCloned += 1;

    const { data: questions, error: qErr } = await admin
      .from("listening_questions")
      .select("*")
      .eq("set_id", src.id)
      .order("order_index", { ascending: true });
    if (qErr) throw new Error(qErr.message);

    for (const q of questions ?? []) {
      const {
        id: oldQid,
        created_at: _qca,
        updated_at: _qua,
        set_id: _sid,
        ...qRest
      } = q as Record<string, unknown>;

      const { data: newQ, error: qInsertErr } = await admin
        .from("listening_questions")
        .insert({
          ...qRest,
          set_id: newSetId,
        })
        .select("id")
        .single();
      if (qInsertErr || !newQ) {
        throw new Error(qInsertErr?.message ?? "question clone failed");
      }
      questionsCloned += 1;

      const { data: segments, error: segErr } = await admin
        .from("listening_question_segments")
        .select("*")
        .eq("question_id", oldQid as string)
        .order("order_index", { ascending: true });
      if (segErr) throw new Error(segErr.message);

      if (segments?.length) {
        const segRows = segments.map((seg) => {
          const {
            id: _segId,
            created_at: _sca,
            question_id: _qid,
            ...segRest
          } = seg as Record<string, unknown>;
          return {
            ...segRest,
            question_id: newQ.id,
          };
        });
        const { error: segInsertErr } = await admin
          .from("listening_question_segments")
          .insert(segRows);
        if (segInsertErr) throw new Error(segInsertErr.message);
      }
    }
  }

  return {
    sourceAcademyId,
    foldersCreated,
    setsCloned,
    setsSkipped,
    questionsCloned,
  };
}

/** Clone template curriculum into every academy except the template itself. */
export async function syncListeningCurriculumToAllAcademies(
  fallbackOwnerProfileId: string
): Promise<
  Array<{ academyId: string; slug: string; result: CloneCurriculumResult }>
> {
  const admin = createAdminClient();
  const sourceAcademyId = await resolveTemplateAcademyId(admin);
  const { data: academies, error } = await admin
    .from("academies")
    .select("id, slug")
    .neq("id", sourceAcademyId);
  if (error) throw new Error(error.message);

  const out: Array<{
    academyId: string;
    slug: string;
    result: CloneCurriculumResult;
  }> = [];

  for (const a of academies ?? []) {
    const { data: academyAdmin } = await admin
      .from("profiles")
      .select("id")
      .eq("academy_id", a.id)
      .eq("role", "admin")
      .limit(1)
      .maybeSingle();

    const result = await cloneListeningCurriculumToAcademy({
      targetAcademyId: a.id as string,
      ownerProfileId: (academyAdmin?.id as string) || fallbackOwnerProfileId,
      sourceAcademyId,
    });
    out.push({
      academyId: a.id as string,
      slug: a.slug as string,
      result,
    });
  }
  return out;
}
