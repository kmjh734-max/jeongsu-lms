import { createAdminClient } from "@/lib/supabase/admin";

const TEMPLATE_ACADEMY_SLUG = "jeongsu";
export const VOCAB_CURRICULUM_LOCK_MARKER = "curriculum_locked";

export type CloneVocabCurriculumResult = {
  sourceAcademyId: string;
  foldersCreated: number;
  setsCloned: number;
  setsSkipped: number;
  itemsCloned: number;
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

async function countItems(
  admin: ReturnType<typeof createAdminClient>,
  setId: string
): Promise<number> {
  const { count, error } = await admin
    .from("vocab_items")
    .select("*", { count: "exact", head: true })
    .eq("set_id", setId);
  if (error) throw new Error(error.message);
  return count ?? 0;
}

async function copyVocabItems(
  admin: ReturnType<typeof createAdminClient>,
  sourceSetId: string,
  targetSetId: string
): Promise<number> {
  const { data: items, error } = await admin
    .from("vocab_items")
    .select(
      "word, meaning, part_of_speech, example_sentence, example_meaning, synonyms, antonyms, order_index"
    )
    .eq("set_id", sourceSetId)
    .order("order_index", { ascending: true });
  if (error) throw new Error(error.message);
  if (!items?.length) return 0;

  const rows = items.map((item) => ({
    ...item,
    set_id: targetSetId,
  }));

  const CHUNK = 100;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const { error: insertErr } = await admin.from("vocab_items").insert(chunk);
    if (insertErr) throw new Error(insertErr.message);
  }
  return rows.length;
}

/**
 * Copy locked curriculum vocab sets from template academy → target.
 * Idempotent by folder name + set title (+ item count completeness).
 */
export async function cloneVocabCurriculumToAcademy(opts: {
  targetAcademyId: string;
  ownerProfileId: string;
  sourceAcademyId?: string;
}): Promise<CloneVocabCurriculumResult> {
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
      itemsCloned: 0,
    };
  }

  const { data: sourceSets, error: setsErr } = await admin
    .from("vocab_sets")
    .select("*")
    .eq("academy_id", sourceAcademyId)
    .or(
      `is_locked.eq.true,description.ilike.%${VOCAB_CURRICULUM_LOCK_MARKER}%`
    )
    .order("order_index", { ascending: true });

  if (setsErr) throw new Error(setsErr.message);
  if (!sourceSets?.length) {
    return {
      sourceAcademyId,
      foldersCreated: 0,
      setsCloned: 0,
      setsSkipped: 0,
      itemsCloned: 0,
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
      .from("vocab_folders")
      .select("id, name")
      .in("id", folderIds);
    if (folderErr) throw new Error(folderErr.message);

    for (const folder of sourceFolders ?? []) {
      const { data: existing } = await admin
        .from("vocab_folders")
        .select("id")
        .eq("academy_id", opts.targetAcademyId)
        .eq("name", folder.name)
        .maybeSingle();

      if (existing?.id) {
        folderIdMap.set(folder.id, existing.id as string);
        continue;
      }

      const { data: created, error: createFolderErr } = await admin
        .from("vocab_folders")
        .insert({
          name: folder.name,
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
  let itemsCloned = 0;

  for (const src of sourceSets) {
    const targetFolderId = src.folder_id
      ? (folderIdMap.get(src.folder_id as string) ?? null)
      : null;

    let existingQuery = admin
      .from("vocab_sets")
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
      const srcN = await countItems(admin, src.id as string);
      const dstN = await countItems(admin, existingSet.id as string);
      if (dstN >= srcN && srcN > 0) {
        setsSkipped += 1;
        continue;
      }
      if (srcN === 0) {
        setsSkipped += 1;
        continue;
      }
      await admin.from("vocab_items").delete().eq("set_id", existingSet.id);
      itemsCloned += await copyVocabItems(
        admin,
        src.id as string,
        existingSet.id as string
      );
      setsCloned += 1;
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
      description: VOCAB_CURRICULUM_LOCK_MARKER,
      is_locked: true,
      is_published: true,
    };

    let { data: newSet, error: setInsertErr } = await admin
      .from("vocab_sets")
      .insert(insertSet)
      .select("id")
      .single();

    if (setInsertErr && /is_locked/i.test(setInsertErr.message)) {
      delete insertSet.is_locked;
      ({ data: newSet, error: setInsertErr } = await admin
        .from("vocab_sets")
        .insert(insertSet)
        .select("id")
        .single());
    }
    if (setInsertErr || !newSet) {
      throw new Error(setInsertErr?.message ?? "set clone failed");
    }

    const newSetId = newSet.id as string;
    setsCloned += 1;
    itemsCloned += await copyVocabItems(admin, src.id as string, newSetId);
  }

  return {
    sourceAcademyId,
    foldersCreated,
    setsCloned,
    setsSkipped,
    itemsCloned,
  };
}

/** Clone template vocab curriculum into every academy except the template. */
export async function syncVocabCurriculumToAllAcademies(
  fallbackOwnerProfileId: string
): Promise<
  Array<{ academyId: string; slug: string; result: CloneVocabCurriculumResult }>
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
    result: CloneVocabCurriculumResult;
  }> = [];

  for (const a of academies ?? []) {
    const { data: academyAdmin } = await admin
      .from("profiles")
      .select("id")
      .eq("academy_id", a.id)
      .eq("role", "admin")
      .limit(1)
      .maybeSingle();

    const result = await cloneVocabCurriculumToAcademy({
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
