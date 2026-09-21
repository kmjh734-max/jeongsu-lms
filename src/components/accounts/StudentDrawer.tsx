"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { assignEnrollment, removeEnrollment } from "@/app/admin/students/actions";
import { parseAdminApiResponse } from "@/lib/admin/parse-api-response-client";
import { loadStudentDetail, type StudentDetail } from "@/lib/accounts/student-detail";
import type { StudentListRow } from "@/lib/admin/list-students-page";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/layout/NavIcon";
import { Avatar, StatusPill, type Flash } from "@/components/accounts/account-kit";
import { AssignSection } from "@/components/accounts/AssignSection";
import {
  assignListeningToStudent,
  assignVocabToStudent,
  removeListeningFromStudent,
  removeVocabFromStudent,
} from "@/app/admin/students/assign-actions";

function KeyIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden className="shrink-0">
      <circle cx="8" cy="15" r="4" />
      <path d="m10.8 12.2 8.7-8.7" />
      <path d="m17 6 2.5 2.5" />
      <path d="m15 8 2 2" />
    </svg>
  );
}

export function StudentDrawer({
  student,
  variant,
  courseOptions,
  reportsHref,
  allowDelete,
  busy,
  notice,
  onClose,
  onEdit,
  onPassword,
  onToggleActive,
  onDelete,
}: {
  student: StudentListRow;
  variant: "admin" | "teacher";
  courseOptions: { id: string; title: string }[];
  reportsHref: string;
  allowDelete: boolean;
  busy: boolean;
  /** 계정 수정·상태 바꾸기 결과 */
  notice: Flash;
  onClose: () => void;
  onEdit: () => void;
  onPassword: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
}) {
  const router = useRouter();
  const [detail, setDetail] = useState<StudentDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [courseId, setCourseId] = useState("");
  const [working, setWorking] = useState(false);
  const [flash, setFlash] = useState<Flash>(null);

  const reload = useCallback(async () => {
    setLoadError(null);
    const res = await loadStudentDetail(student.id);
    if (res.ok) setDetail(res.detail);
    else setLoadError(res.message);
  }, [student.id]);

  useEffect(() => {
    setDetail(null);
    setAssigning(false);
    setCourseId("");
    setFlash(null);
    void reload();
  }, [reload]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const enrolledIds = new Set(detail?.enrollments.map((e) => e.courseId) ?? []);
  const available = courseOptions.filter((c) => !enrolledIds.has(c.id));

  async function assign() {
    if (!courseId) return;
    setWorking(true);
    setFlash(null);
    try {
      if (variant === "admin") {
        const r = await assignEnrollment(student.id, courseId);
        setFlash({ type: r.ok ? "success" : "error", text: r.ok ? "강좌를 배정했어요." : r.message });
        if (!r.ok) return;
      } else {
        const res = await fetch("/api/teacher/enrollments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ student_id: student.id, course_id: courseId }),
        });
        const data = await parseAdminApiResponse(res);
        if (!res.ok || !data.ok) {
          setFlash({ type: "error", text: data.message ?? "배정하지 못했어요." });
          return;
        }
        setFlash({ type: "success", text: "강좌를 배정했어요." });
      }
      setAssigning(false);
      setCourseId("");
      await reload();
      router.refresh();
    } catch (err) {
      console.error("assign enrollment:", err);
      setFlash({ type: "error", text: "연결이 잠시 끊겼어요. 다시 시도해 주세요." });
    } finally {
      setWorking(false);
    }
  }

  async function unassign(enrollmentId: string, title: string) {
    if (
      !window.confirm(
        `「${student.name}」 학생의 「${title}」 수강 배정을 해제할까요?\n학생 화면에서 해당 강좌가 사라집니다. (학습 진도 기록은 유지됩니다.)`
      )
    ) {
      return;
    }
    setWorking(true);
    setFlash(null);
    try {
      if (variant === "admin") {
        const r = await removeEnrollment(enrollmentId);
        if (!r.ok) {
          setFlash({ type: "error", text: r.message });
          return;
        }
      } else {
        const res = await fetch(
          `/api/teacher/enrollments?id=${encodeURIComponent(enrollmentId)}`,
          { method: "DELETE" }
        );
        const data = await parseAdminApiResponse(res);
        if (!res.ok || !data.ok) {
          setFlash({ type: "error", text: data.message ?? "해제하지 못했어요." });
          return;
        }
      }
      setFlash({ type: "success", text: "수강 배정을 해제했어요." });
      await reload();
      router.refresh();
    } catch (err) {
      console.error("remove enrollment:", err);
      setFlash({ type: "error", text: "연결이 잠시 끊겼어요. 다시 시도해 주세요." });
    } finally {
      setWorking(false);
    }
  }

  const classLabel = student.classNames.length ? student.classNames.join(", ") : "반 없음";
  const week = detail?.week;

  /** 단어·듣기 배정 한 번 — 끝나면 목록을 다시 읽는다 */
  async function runAssign(fn: () => Promise<{ ok: boolean; message: string }>, okText: string) {
    setWorking(true);
    setFlash(null);
    try {
      const r = await fn();
      setFlash({ type: r.ok ? "success" : "error", text: r.ok ? okText : r.message });
      if (r.ok) {
        await reload();
        router.refresh();
      }
    } catch (err) {
      console.error("assign:", err);
      setFlash({ type: "error", text: "연결이 잠시 끊겼어요. 다시 시도해 주세요." });
    } finally {
      setWorking(false);
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-slate-900/30 lg:hidden"
        onClick={onClose}
        aria-hidden
      />
      <aside
        role="dialog"
        aria-label={`${student.name} 학생`}
        className="fixed inset-0 z-50 flex flex-col bg-white lg:inset-auto lg:bottom-0 lg:right-0 lg:top-14 lg:z-30 lg:w-[420px] lg:border-l lg:border-slate-200 lg:shadow-[-12px_0_32px_rgba(15,23,42,0.1)]"
      >
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-5 sm:px-[22px]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar name={student.name} active={student.is_active} size={44} />
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="flex items-center gap-2">
                  <span className="truncate text-[17px] font-bold text-slate-900">
                    {student.name}
                  </span>
                  {!student.is_active ? <StatusPill active={false} /> : null}
                </span>
                <span className="truncate text-[13px] text-slate-500">
                  {student.username ?? student.email} · {classLabel}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="닫기"
              className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <Icon name="x" size={18} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={onEdit} className="h-8 text-[13px]">
              <Icon name="edit" size={16} strokeWidth={2} />
              수정
            </Button>
            <Button variant="secondary" size="sm" onClick={onPassword} className="h-8 text-[13px]">
              <KeyIcon />
              비밀번호 바꾸기
            </Button>
            <Link
              href={reportsHref}
              className="inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-md border border-slate-300 bg-white px-3 text-[13px] font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
            >
              <Icon name="file" size={16} strokeWidth={2} />
              리포트
            </Link>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 py-[18px] sm:px-[22px]">
          {(flash ?? notice) ? (
            <Alert variant={(flash ?? notice)!.type === "success" ? "success" : "error"}>
              {(flash ?? notice)!.text}
            </Alert>
          ) : null}

          <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[15px] font-bold text-slate-900">
                수강 강좌{detail ? ` · ${detail.enrollments.length}` : ""}
              </h3>
              {!assigning ? (
                <button
                  type="button"
                  onClick={() => setAssigning(true)}
                  disabled={!detail}
                  className="text-[13px] font-semibold text-brand-700 hover:underline disabled:opacity-50"
                >
                  + 강좌 배정
                </button>
              ) : null}
            </div>

            {assigning ? (
              <div className="flex flex-col gap-2 rounded-lg border border-brand-100 bg-brand-50/50 p-3">
                {available.length === 0 ? (
                  <p className="text-[13px] text-slate-600">
                    {courseOptions.length === 0
                      ? variant === "teacher"
                        ? "담당 강좌가 없어요. 관리자에게 강좌 배정을 요청해 주세요."
                        : "등록된 강좌가 없어요."
                      : "배정할 수 있는 강좌를 모두 듣고 있어요."}
                  </p>
                ) : (
                  <select
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    className="ui-select"
                    aria-label="배정할 강좌"
                  >
                    <option value="">강좌 고르기</option>
                    {available.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                )}
                <div className="flex justify-end gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setAssigning(false);
                      setCourseId("");
                    }}
                  >
                    취소
                  </Button>
                  <Button size="sm" onClick={() => void assign()} disabled={!courseId || working}>
                    {working ? "배정 중…" : "배정"}
                  </Button>
                </div>
              </div>
            ) : null}

            {loadError ? <Alert variant="error">{loadError}</Alert> : null}
            {!detail && !loadError ? (
              <div className="space-y-2" aria-hidden>
                {[0, 1].map((i) => (
                  <div key={i} className="h-[62px] animate-pulse rounded-lg bg-slate-100" />
                ))}
              </div>
            ) : null}
            {detail && detail.enrollments.length === 0 ? (
              <p className="rounded-lg bg-slate-50 px-3 py-4 text-center text-[13px] text-slate-500">
                아직 듣는 강좌가 없어요.
              </p>
            ) : null}
            {detail?.enrollments.map((e) => (
              <div
                key={e.id}
                className="group flex flex-col gap-1.5 rounded-lg border border-slate-200 px-3 py-2.5"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="min-w-0 truncate text-[13px] font-semibold text-slate-900">
                    {e.title}
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="text-[11px] text-slate-400">
                      {e.fromClass ? "반에서 자동" : "직접 배정"}
                    </span>
                    <button
                      type="button"
                      onClick={() => void unassign(e.id, e.title)}
                      disabled={working}
                      className="text-[11px] font-semibold text-slate-400 hover:text-rose-700 disabled:opacity-50"
                    >
                      해제
                    </button>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-[5px] flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-brand-600"
                      style={{ width: `${e.percent}%` }}
                    />
                  </div>
                  <span className="w-9 text-right text-xs font-semibold tabular-nums text-slate-900">
                    {e.percent}%
                  </span>
                </div>
              </div>
            ))}
          </section>

          <AssignSection
            title="단어"
            items={detail?.vocab ?? null}
            options={detail?.options.vocab ?? []}
            emptyText="아직 배정된 단어장이 없어요."
            pickLabel="단어장 고르기"
            loading={!detail && !loadError}
            busy={working}
            onAssign={(setId) =>
              runAssign(() => assignVocabToStudent(student.id, setId), "단어장을 배정했어요.")
            }
            onRemove={(id, title) => {
              if (!window.confirm(`「${title}」 단어장 배정을 뺄까요?
학생 화면에서 이 단어장이 사라져요. (학습 기록은 남아요.)`)) {
                return Promise.resolve();
              }
              return runAssign(() => removeVocabFromStudent(id), "단어장 배정을 뺐어요.");
            }}
          />

          <AssignSection
            title="듣기"
            items={detail?.listening ?? null}
            options={detail?.options.listening ?? []}
            emptyText="아직 배정된 듣기 세트가 없어요."
            pickLabel="듣기 세트 고르기"
            loading={!detail && !loadError}
            busy={working}
            onAssign={(setId) =>
              runAssign(() => assignListeningToStudent(student.id, setId), "듣기 세트를 배정했어요.")
            }
            onRemove={(id, title) => {
              if (!window.confirm(`「${title}」 듣기 세트 배정을 뺄까요?
학생 화면에서 이 세트가 사라져요. (학습 기록은 남아요.)`)) {
                return Promise.resolve();
              }
              return runAssign(() => removeListeningFromStudent(id), "듣기 세트 배정을 뺐어요.");
            }}
          />

          <section className="flex flex-col gap-2">
            <h3 className="text-[15px] font-bold text-slate-900">이번 주 학습</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  label: "듣기",
                  value: week
                    ? week.listening
                      ? `${week.listening.done}/${week.listening.total}일`
                      : "—"
                    : "…",
                },
                { label: "단어", value: week ? `${week.vocabStages}단계` : "…" },
                { label: "영상", value: week ? `${week.videoLessons}강` : "…" },
              ].map((s) => (
                <div key={s.label} className="rounded-lg bg-slate-50 px-3 py-2.5">
                  <span className="text-xs text-slate-500">{s.label}</span>
                  <div className="mt-1 text-base font-bold tabular-nums text-slate-900">
                    {s.value}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="flex-1" />

          <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
            <Button variant="ghost" size="sm" onClick={onToggleActive} disabled={busy} className="h-8 text-[13px]">
              {student.is_active ? "잠시 쉬게 하기" : "다시 활성"}
            </Button>
            {allowDelete ? (
              <Button variant="danger" size="sm" onClick={onDelete} disabled={busy} className="h-8 text-[13px]">
                계정 삭제
              </Button>
            ) : null}
          </div>
        </div>
      </aside>
    </>
  );
}
