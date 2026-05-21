"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export interface ClassVocabAssignmentRow {
  id: string;
  set_id: string;
  title: string;
}

export interface VocabSetOption {
  id: string;
  title: string;
  folder_name: string | null;
}

interface ClassVocabPanelProps {
  classId: string;
  assignments: ClassVocabAssignmentRow[];
  setOptions: VocabSetOption[];
  onAssign: (
    classId: string,
    setId: string
  ) => Promise<{ ok: boolean; message: string }>;
  onRemove: (
    assignmentId: string,
    classId: string
  ) => Promise<{ ok: boolean; message: string }>;
}

export function ClassVocabPanel({
  classId,
  assignments,
  setOptions,
  onAssign,
  onRemove,
}: ClassVocabPanelProps) {
  const router = useRouter();
  const [setId, setSetId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const assignedIds = new Set(assignments.map((a) => a.set_id));
  const available = setOptions.filter((s) => !assignedIds.has(s.id));

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault();
    if (!setId) return;
    setLoading(true);
    setMessage(null);
    const result = await onAssign(classId, setId);
    setMessage(result.message);
    if (result.ok) {
      setSetId("");
      router.refresh();
    }
    setLoading(false);
  }

  async function handleRemove(assignmentId: string) {
    if (!confirm("이 단어장 배정을 해제할까요?")) return;
    setLoading(true);
    const result = await onRemove(assignmentId, classId);
    setMessage(result.message);
    if (result.ok) router.refresh();
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        폴더에 만든 단어장을 이 반에 배정하면, 반 학생 전원이 단어 학습 메뉴에서
        볼 수 있습니다.
      </p>

      <form
        onSubmit={handleAssign}
        className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4"
      >
        <div className="min-w-[200px] flex-1">
          <label className="ui-label">단어장 선택</label>
          <select
            className="ui-select"
            value={setId}
            onChange={(e) => setSetId(e.target.value)}
            required
          >
            <option value="">단어장 선택</option>
            {available.map((s) => (
              <option key={s.id} value={s.id}>
                {s.folder_name ? `[${s.folder_name}] ` : ""}
                {s.title}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" disabled={loading || available.length === 0}>
          {loading ? "배정 중..." : "단어장 배정"}
        </Button>
      </form>

      {available.length === 0 && setOptions.length > 0 && (
        <p className="text-sm text-amber-700">
          배정 가능한 단어장이 없습니다. 모든 단어장이 이미 배정되었습니다.
        </p>
      )}

      {setOptions.length === 0 && (
        <p className="text-sm text-slate-500">
          단어 관리 → 폴더에서 단어장을 먼저 만드세요.
        </p>
      )}

      {message && (
        <p className="text-sm text-slate-600" role="status">
          {message}
        </p>
      )}

      {assignments.length === 0 ? (
        <p className="text-sm text-slate-500">배정된 단어장이 없습니다.</p>
      ) : (
        <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
          {assignments.map((a) => (
            <li
              key={a.id}
              className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
            >
              <span className="font-medium text-slate-900">{a.title}</span>
              <Button
                type="button"
                variant="danger"
                size="sm"
                disabled={loading}
                onClick={() => handleRemove(a.id)}
              >
                해제
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
