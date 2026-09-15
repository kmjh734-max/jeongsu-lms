"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/layout/NavIcon";
import { Button } from "@/components/ui/Button";
import { ModalShell } from "@/components/vocab/VocabUi";
import type { VocabBasePath, VocabRole, VocabTeacherOption } from "@/lib/vocab/module-types";

interface VocabSetCreateModalProps {
  open: boolean;
  onClose: () => void;
  role: VocabRole;
  basePath: VocabBasePath;
  /** 고를 수 있는 내 폴더 */
  folders: { id: string; name: string }[];
  /** 처음 골라 둘 폴더 ("" = 미분류) */
  defaultFolderId?: string;
  teachers?: VocabTeacherOption[];
  /** "import"면 만든 뒤 바로 표 붙여넣기·지문 창을 연다 */
  intent?: "direct" | "import";
  onCreate: (input: {
    title: string;
    description?: string;
    teacherId?: string;
    folderId?: string | null;
  }) => Promise<{ ok: boolean; message: string; setId?: string }>;
}

export function VocabSetCreateModal({
  open,
  onClose,
  role,
  basePath,
  folders,
  defaultFolderId = "",
  teachers = [],
  intent = "direct",
  onCreate,
}: VocabSetCreateModalProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [folderId, setFolderId] = useState(defaultFolderId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setFolderId(defaultFolderId);
      setError(null);
    }
  }, [open, defaultFolderId]);

  async function createAndGo(mode: "direct" | "import") {
    if (!title.trim()) {
      setError("세트명을 적어 주세요.");
      return;
    }
    setLoading(true);
    setError(null);
    const result = await onCreate({
      title: title.trim(),
      description: description.trim() || undefined,
      teacherId: role === "admin" ? teacherId || undefined : undefined,
      folderId: folderId || null,
    });
    setLoading(false);
    if (!result.ok || !result.setId) {
      setError(result.message);
      return;
    }
    setTitle("");
    setDescription("");
    onClose();
    router.push(`${basePath}/set/${result.setId}${mode === "import" ? "?import=1" : ""}`);
  }

  const importFirst = intent === "import";

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      busy={loading}
      title={importFirst ? "자료로 만들기" : "새 단어장"}
      subtitle={
        importFirst
          ? "단어장을 만든 뒤 표를 붙여넣거나 지문에서 단어를 뽑아요."
          : "이름을 정하고, 단어는 다음 화면에서 넣어요."
      }
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            닫기
          </Button>
          <Button
            variant={importFirst ? "secondary" : "primary"}
            disabled={loading}
            onClick={() => void createAndGo("direct")}
          >
            <Icon name="edit" size={16} strokeWidth={2} />
            직접 입력
          </Button>
          <Button
            variant={importFirst ? "primary" : "secondary"}
            disabled={loading}
            onClick={() => void createAndGo("import")}
          >
            <Icon name="upload" size={16} strokeWidth={2} />
            {loading ? "만드는 중…" : "자료 가져오기"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4 px-5 py-5 sm:px-[22px]">
        <div>
          <label className="ui-label" htmlFor="vocab-create-title">
            세트명
          </label>
          <input
            id="vocab-create-title"
            className="ui-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void createAndGo(importFirst ? "import" : "direct");
            }}
            placeholder="예: 능률 김기택 1과 단어"
            disabled={loading}
            autoFocus
          />
        </div>
        <div>
          <label className="ui-label" htmlFor="vocab-create-folder">
            폴더
          </label>
          <select
            id="vocab-create-folder"
            className="ui-select"
            value={folderId}
            onChange={(e) => setFolderId(e.target.value)}
            disabled={loading}
          >
            <option value="">미분류</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="ui-label" htmlFor="vocab-create-desc">
            설명 <span className="font-normal text-slate-400">(선택)</span>
          </label>
          <input
            id="vocab-create-desc"
            className="ui-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="짧게 적어 두면 찾기 쉬워요"
            disabled={loading}
          />
        </div>
        {role === "admin" ? (
          <div>
            <label className="ui-label" htmlFor="vocab-create-teacher">
              담당 강사
            </label>
            <select
              id="vocab-create-teacher"
              className="ui-select"
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              disabled={loading}
            >
              <option value="">정하지 않음</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        {error ? (
          <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </ModalShell>
  );
}
