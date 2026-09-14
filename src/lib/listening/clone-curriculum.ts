import { createAdminClient } from "@/lib/supabase/admin";
import { CURRICULUM_LOCK_MARKER } from "@/lib/listening/listening-api-auth";
import { runWithConcurrency } from "@/lib/run-with-concurrency";

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
    // 잠근 세트(또는 예전 방식의 교재 표시가 있는 세트)가 교재다. 단어 교재와 같은 기준.
    .or(`is_locked.eq.true,description.ilike.%${CURRICULUM_LOCK_MARKER}%`)
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

  // 세트끼리는 독립이라 네 개씩 함께 복사한다.
  await runWithConcurrency(sourceSets, 4, async (src) => {
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
      const [{ count: srcCount }, { count: dstCount }] = await Promise.all([
        admin
          .from("listening_questions")
          .select("*", { count: "exact", head: true })
          .eq("set_id", src.id),
        admin
          .from("listening_questions")
          .select("*", { count: "exact", head: true })
          .eq("set_id", existingSet.id),
      ]);
      const srcN = srcCount ?? 0;
      const dstN = dstCount ?? 0;
      if (dstN >= srcN && srcN > 0) {
        setsSkipped += 1;
        return;
      }
      if (srcN === 0) {
        setsSkipped += 1;
        return;
      }
      // Target incomplete — wipe and re-copy questions/segments
      await admin
        .from("listening_questions")
        .delete()
        .eq("set_id", existingSet.id);
      const copied = await copyQuestionsAndSegments(
        admin,
        src.id as string,
        existingSet.id as string
      );
      questionsCloned += copied;
      setsCloned += 1;
      return;
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
    // 여러 세트가 함께 돌아서, await 앞에서 읽은 합계에 더하면 서로 덮어쓴다.
    const copied = await copyQuestionsAndSegments(admin, src.id as string, newSetId);
    questionsCloned += copied;
  });

  return {
    sourceAcademyId,
    foldersCreated,
    setsCloned,
    setsSkipped,
    questionsCloned,
  };
}

/**
 * 세트 하나의 문항과 음성 조각을 복사한다. 예전에는 문항마다 넣고 조각을 따로 조회해서
 * 한 학원에 수천 번 DB를 오갔고, 새 학원을 만드는 요청이 시간 제한에 걸려 교재가 일부만
 * 복사됐다. 이제 문항은 한 번에 넣고, 조각은 한 번에 읽어 나눠 넣는다.
 */
async function copyQuestionsAndSegments(
  admin: ReturnType<typeof createAdminClient>,
  sourceSetId: string,
  targetSetId: string
): Promise<number> {
  const { data: questions, error: qErr } = await admin
    .from("listening_questions")
    .select("*")
    .eq("set_id", sourceSetId)
    .order("order_index", { ascending: true });
  if (qErr) throw new Error(qErr.message);
  if (!questions?.length) return 0;

  const rows = questions.map((q) => {
    const {
      id: _id,
      created_at: _qca,
      updated_at: _qua,
      set_id: _sid,
      ...qRest
    } = q as Record<string, unknown>;
    return { ...qRest, set_id: targetSetId };
  });
  const { data: inserted, error: qInsertErr } = await admin
    .from("listening_questions")
    .insert(rows)
    .select("id, order_index");
  if (qInsertErr || !inserted || inserted.length !== questions.length) {
    throw new Error(qInsertErr?.message ?? "question clone failed");
  }

  // 원본 문항 → 새 문항. 넣은 순서대로 돌아오지만, 순서 번호로 한 번 더 맞춰 본다.
  const newIdByOld = new Map<string, string>();
  const sameOrder = questions.every(
    (q, i) => (q.order_index ?? null) === (inserted[i]!.order_index ?? null)
  );
  if (sameOrder) {
    questions.forEach((q, i) => newIdByOld.set(q.id as string, inserted[i]!.id as string));
  } else {
    const byOrder = new Map(inserted.map((r) => [r.order_index, r.id as string] as const));
    if (byOrder.size !== inserted.length) throw new Error("question clone order mismatch");
    for (const q of questions) newIdByOld.set(q.id as string, byOrder.get(q.order_index)!);
  }

  const { data: segments, error: segErr } = await admin
    .from("listening_question_segments")
    .select("*")
    .in("question_id", questions.map((q) => q.id as string))
    .order("order_index", { ascending: true });
  if (segErr) throw new Error(segErr.message);

  const segRows = (segments ?? []).map((seg) => {
    const {
      id: _segId,
      created_at: _sca,
      question_id: oldQid,
      ...segRest
    } = seg as Record<string, unknown>;
    return { ...segRest, question_id: newIdByOld.get(oldQid as string) };
  });
  const CHUNK = 500;
  for (let i = 0; i < segRows.length; i += CHUNK) {
    const { error: segInsertErr } = await admin
      .from("listening_question_segments")
      .insert(segRows.slice(i, i + CHUNK));
    if (segInsertErr) throw new Error(segInsertErr.message);
  }
  return questions.length;
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
