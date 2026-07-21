import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ListeningSetManageClient } from "@/components/listening/ListeningSetManageClient";
import { parseListeningGradeLevel } from "@/lib/listening/grade-level";
import { loadListeningSetForEditor } from "@/lib/listening/load-set-editor";

export default async function AdminListeningSetPage({
  params,
}: {
  params: Promise<{ setId: string }>;
}) {
  const { setId } = await params;
  const supabase = await createClient();
  const loaded = await loadListeningSetForEditor(supabase, setId);
  if (!loaded) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/admin/listening"
        className="text-sm text-indigo-600 hover:underline"
      >
        ← 듣기 세트 목록
      </Link>
      <p className="text-xs text-slate-500">
        학생·반 배정은{" "}
        <Link href="/admin/listening" className="text-indigo-600 hover:underline">
          듣기학습 목록
        </Link>
        에서 「배정」 버튼으로 진행하세요.
      </p>
      <ListeningSetManageClient
        setId={loaded.set.id}
        title={loaded.set.title}
        gradeLevel={parseListeningGradeLevel(loaded.set.grade_level)}
        speechSpeed={loaded.set.speech_speed ?? 0.75}
        voiceAnnId={loaded.set.voice_ann_id ?? null}
        voiceMId={loaded.set.voice_m_id ?? null}
        voiceWId={loaded.set.voice_w_id ?? null}
        dictationSettings={{
          dictation_enabled: loaded.set.dictation_enabled ?? true,
          dictation_pass_score: loaded.set.dictation_pass_score ?? 80,
          dictation_blank_level:
            (loaded.set.dictation_blank_level as "auto" | "few" | "normal" | "many") ??
            "auto",
          dictation_randomize_on_retry: loaded.set.dictation_randomize_on_retry ?? true,
          dictation_lock_next_until_pass:
            loaded.set.dictation_lock_next_until_pass ?? true,
        }}
        questions={loaded.questions}
        role="admin"
      />
    </div>
  );
}
