"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClass } from "@/app/admin/classes/actions";
import { ClassModal } from "@/components/classes/ClassModal";
import { Icon } from "@/components/layout/NavIcon";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";

interface CreateClassButtonProps {
  teachers: { id: string; name: string }[];
  disabled?: boolean;
}

/** 반 목록 오른쪽 위 "새 반" — 누르면 만들기 창이 뜬다 (관리자) */
export function CreateClassButton({ teachers, disabled = false }: CreateClassButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function close() {
    if (loading) return;
    setOpen(false);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await createClass({
      name,
      description,
      teacherId: teacherId || undefined,
    });

    if (!result.ok) {
      setError(result.message);
      setLoading(false);
      return;
    }

    if ("classId" in result && result.classId) {
      router.push(`/admin/classes/${result.classId}`);
      return;
    }
    setLoading(false);
    setOpen(false);
    setName("");
    setDescription("");
    setTeacherId("");
    router.refresh();
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} disabled={disabled}>
        <Icon name="plus" size={16} strokeWidth={2} />새 반
      </Button>
      {open ? (
        <ClassModal title="새 반 만들기" onClose={close}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="new-class-name" className="ui-label">
                반 이름
              </label>
              <input
                id="new-class-name"
                required
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 중2 A반"
                className="ui-input"
              />
            </div>
            <div>
              <label htmlFor="new-class-desc" className="ui-label">
                설명
              </label>
              <input
                id="new-class-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="선택"
                className="ui-input"
              />
            </div>
            <div>
              <label htmlFor="new-class-teacher" className="ui-label">
                담당 강사
              </label>
              <select
                id="new-class-teacher"
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                className="ui-select"
              >
                <option value="">나중에 정하기</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            {error ? <Alert variant="error">{error}</Alert> : null}
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="secondary" onClick={close} disabled={loading}>
                취소
              </Button>
              <Button type="submit" disabled={loading || !name.trim()}>
                {loading ? "만드는 중…" : "만들기"}
              </Button>
            </div>
          </form>
        </ClassModal>
      ) : null}
    </>
  );
}
