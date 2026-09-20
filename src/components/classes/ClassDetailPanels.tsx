"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  adminAddStudentToClass,
  adminAssignCourseToClass,
  adminRemoveCourseFromClass,
  adminRemoveStudentFromClass,
  deleteClass,
  updateClass,
} from "@/app/admin/classes/actions";
import {
  teacherAddStudentToClass,
  teacherAssignCourseToClass,
  teacherDeactivateClass,
  teacherRemoveCourseFromClass,
  teacherRemoveStudentFromClass,
} from "@/app/teacher/classes/actions";
import { ArchiveClassButton } from "@/components/classes/ArchiveClassButton";
import { ClassModal } from "@/components/classes/ClassModal";
import { MiniBar, SearchBox } from "@/components/classes/ClassUi";
import { Icon } from "@/components/layout/NavIcon";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import type { ClassStudentStat, DayMark, StageMark } from "@/lib/classes/load-class-detail";
import type { StudentOption } from "@/lib/classes/load-class-page";
import { relativeStudyDay } from "@/lib/classes/week";

export type ClassPanelVariant = "admin" | "teacher";

type Message = { type: "success" | "error"; text: string } | null;

/* ───────────── 학생 추가 (머리글 버튼 → 창) ───────────── */

export function AddStudentButton({
  variant,
  classId,
  studentOptions,
  memberIds,
  classActive,
}: {
  variant: ClassPanelVariant;
  classId: string;
  studentOptions: StudentOption[];
  memberIds: string[];
  classActive: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<Message>(null);

  const options = useMemo(() => {
    const members = new Set(memberIds);
    return studentOptions
      .filter((s) => !members.has(s.id))
      .map((s) => ({
        value: s.id,
        label: s.username ? `${s.name} (${s.username})` : s.name,
        searchText: [s.name, s.username, s.email].filter(Boolean).join(" "),
      }));
  }, [studentOptions, memberIds]);

  function close() {
    if (loading) return;
    setOpen(false);
    setMessage(null);
    setStudentId("");
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!studentId) return;
    setLoading(true);
    setMessage(null);
    try {
      const result =
        variant === "admin"
          ? await adminAddStudentToClass(classId, studentId)
          : await teacherAddStudentToClass(classId, studentId);
      setMessage({ type: result.ok ? "success" : "error", text: result.message });
      if (result.ok) {
        setStudentId("");
        router.refresh();
      }
    } catch {
      setMessage({ type: "error", text: "연결이 끊겼어요. 다시 해 주세요." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        disabled={!classActive}
        title={classActive ? undefined : "보관된 반에는 학생을 더할 수 없어요"}
      >
        <Icon name="plus" size={16} strokeWidth={2} />
        학생 추가
      </Button>
      {open ? (
        <ClassModal title="학생 추가" onClose={close}>
          <form onSubmit={handleAdd} className="space-y-4">
            {options.length === 0 ? (
              <p className="text-sm text-slate-600">
                더할 수 있는 학생이 없어요.
                {variant === "teacher" ? " 내가 등록한 학생만 이 반에 넣을 수 있어요." : ""}
              </p>
            ) : (
              <>
                <SearchableSelect
                  label="학생"
                  value={studentId}
                  onChange={setStudentId}
                  options={options}
                  searchPlaceholder="이름·아이디로 찾기"
                  emptyOptionLabel="학생 고르기"
                  required
                />
                <p className="text-xs text-slate-500">
                  이 반에 배정된 강좌와 듣기 과제가 바로 함께 배정돼요.
                  {variant === "teacher" ? " 내가 등록한 학생만 보여요." : ""}
                </p>
              </>
            )}
            {message ? (
              <Alert variant={message.type === "success" ? "success" : "error"}>
                {message.text}
              </Alert>
            ) : null}
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={close} disabled={loading}>
                닫기
              </Button>
              <Button type="submit" disabled={loading || !studentId}>
                {loading ? "추가하는 중…" : "추가"}
              </Button>
            </div>
          </form>
        </ClassModal>
      ) : null}
    </>
  );
}

/* ───────────── 학생 탭 ───────────── */

const DAY_NAMES = ["월", "화", "수", "목", "금"];

const DAY_STYLE: Record<DayMark, { dot: string; label: string }> = {
  done: { dot: "bg-green-600", label: "완료" },
  partial: { dot: "bg-amber-500", label: "일부" },
  missed: { dot: "bg-rose-600", label: "안 함" },
  none: { dot: "bg-slate-200", label: "과제 없음" },
};

const STAGE_STYLE: Record<StageMark, { dot: string; label: string }> = {
  done: { dot: "bg-green-600", label: "완료" },
  current: { dot: "bg-brand-600", label: "지금 단계" },
  failed: { dot: "bg-rose-600", label: "시험 다시 필요" },
  none: { dot: "bg-slate-200", label: "아직" },
};

const STUDENT_GRID =
  "md:grid md:grid-cols-[minmax(0,1fr)_104px_96px_168px_76px_32px] md:items-center md:gap-4";

function Dot({ className, label }: { className: string; label: string }) {
  return (
    <span
      title={label}
      aria-label={label}
      className={`inline-block h-2 w-2 shrink-0 rounded-full ${className}`}
    />
  );
}

export function ClassStudentTable({
  variant,
  classId,
  rows,
  todayIso,
  studentInfoPath,
}: {
  variant: ClassPanelVariant;
  classId: string;
  rows: ClassStudentStat[];
  todayIso: string;
  /** 학생 정보 화면 주소 — 관리자 화면은 ?q=로 그 학생을 찾아 연다 */
  studentInfoPath: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<Message>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) => r.name.toLowerCase().includes(q) || (r.username ?? "").toLowerCase().includes(q)
    );
  }, [rows, query]);

  async function removeStudent(row: ClassStudentStat) {
    setMenuFor(null);
    if (
      !window.confirm(
        `「${row.name}」 학생을 이 반에서 뺄까요?\n이 반의 단어·듣기 과제는 멈추고, 동영상 수강과 학습 기록은 그대로 남아요.`
      )
    ) {
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const result =
        variant === "admin"
          ? await adminRemoveStudentFromClass(classId, row.studentId)
          : await teacherRemoveStudentFromClass(classId, row.studentId);
      setMessage(
        result.ok
          ? { type: "success", text: `${row.name} 학생을 반에서 뺐어요.` }
          : { type: "error", text: result.message }
      );
      if (result.ok) router.refresh();
    } catch {
      setMessage({ type: "error", text: "연결이 끊겼어요. 다시 해 주세요." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
          <span className="font-semibold text-slate-900">이번 주</span>
          <span className="inline-flex items-center gap-1.5">
            <Dot className="bg-green-600" label="완료" />
            완료
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Dot className="bg-amber-500" label="일부" />
            일부
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Dot className="bg-rose-600" label="안 함" />안 함
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Dot className="bg-brand-600" label="지금 단계" />
            지금 단계
          </span>
        </div>
        <SearchBox
          value={query}
          onChange={setQuery}
          placeholder="학생 찾기"
          className="sm:w-52"
        />
      </div>

      {message ? (
        <Alert variant={message.type === "success" ? "success" : "error"}>{message.text}</Alert>
      ) : null}

      <div className="rounded-lg border border-slate-200 bg-white shadow-card">
        <div
          className={`hidden rounded-t-lg border-b border-slate-200 bg-slate-50 px-[18px] py-2.5 text-xs font-semibold text-slate-500 ${STUDENT_GRID}`}
        >
          <span>학생</span>
          <span>듣기 (월~금)</span>
          <span>단어 (최근 단어장)</span>
          <span>영상 진도</span>
          <span>마지막 학습</span>
          <span />
        </div>

        {rows.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-slate-500">
            아직 학생이 없어요. 오른쪽 위 &lsquo;학생 추가&rsquo;로 넣어 보세요.
          </p>
        ) : visible.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-slate-500">찾는 학생이 없어요.</p>
        ) : (
          <ul>
            {visible.map((row) => {
              const last = relativeStudyDay(row.lastStudiedAt, todayIso);
              const stale = last.daysAgo === null || last.daysAgo >= 2;
              return (
                <li
                  key={row.id}
                  className={`relative flex flex-col gap-2.5 border-t border-slate-100 px-4 py-3 first:border-t-0 md:min-h-[54px] md:px-[18px] md:py-2 ${STUDENT_GRID}`}
                >
                  <div className="flex min-w-0 items-center gap-3 pr-8 md:pr-0">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700">
                      {row.name.slice(0, 1)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{row.name}</p>
                      {row.username ? (
                        <p className="truncate text-xs text-slate-400">{row.username}</p>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 md:block">
                    <span className="w-16 shrink-0 text-xs text-slate-400 md:hidden">듣기</span>
                    <div className="flex items-center gap-1">
                      {row.listeningWeek.map((mark, i) => (
                        <Dot
                          key={DAY_NAMES[i]}
                          className={DAY_STYLE[mark].dot}
                          label={`${DAY_NAMES[i]} · ${DAY_STYLE[mark].label}`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 md:block">
                    <span className="w-16 shrink-0 text-xs text-slate-400 md:hidden">단어</span>
                    {row.vocab ? (
                      <div className="flex items-center gap-1" title={row.vocab.title}>
                        {row.vocab.marks.map((mark, i) => (
                          <Dot
                            key={i}
                            className={STAGE_STYLE[mark].dot}
                            label={`${row.vocab!.title} ${i + 1}단계 · ${STAGE_STYLE[mark].label}`}
                          />
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 md:block">
                    <span className="w-16 shrink-0 text-xs text-slate-400 md:hidden">영상</span>
                    {row.video ? (
                      <MiniBar
                        percent={row.video.percent}
                        className="w-full max-w-[200px] md:max-w-none"
                      />
                    ) : (
                      <span className="text-xs text-slate-400">강좌 없음</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 md:block">
                    <span className="w-16 shrink-0 text-xs text-slate-400 md:hidden">마지막 학습</span>
                    <span
                      className={`text-[13px] ${
                        last.daysAgo === null
                          ? "text-slate-400"
                          : stale
                            ? "font-semibold text-amber-700"
                            : "text-slate-600"
                      }`}
                    >
                      {last.label}
                    </span>
                  </div>

                  <div className="absolute right-3 top-3 md:static">
                    <RowMenu
                      open={menuFor === row.id}
                      onToggle={() => setMenuFor(menuFor === row.id ? null : row.id)}
                      onClose={() => setMenuFor(null)}
                      infoHref={
                        variant === "admin"
                          ? `${studentInfoPath}?q=${encodeURIComponent(row.username ?? row.name)}`
                          : studentInfoPath
                      }
                      onRemove={() => removeStudent(row)}
                      disabled={busy}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function RowMenu({
  open,
  onToggle,
  onClose,
  infoHref,
  onRemove,
  disabled,
}: {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  infoHref: string;
  onRemove: () => void;
  disabled: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={onToggle}
        aria-label="더 보기"
        aria-expanded={open}
        disabled={disabled}
        className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
      >
        <Icon name="more" size={18} />
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-9 z-20 w-36 overflow-hidden rounded-md border border-slate-200 bg-white py-1 shadow-card-hover"
        >
          <Link
            role="menuitem"
            href={infoHref}
            className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            학생 정보
          </Link>
          <button
            role="menuitem"
            type="button"
            onClick={onRemove}
            className="block w-full px-3 py-2 text-left text-sm text-rose-700 hover:bg-rose-50"
          >
            반에서 빼기
          </button>
        </div>
      ) : null}
    </div>
  );
}

/* ───────────── 강좌 ───────────── */

interface ClassCoursesPanelProps {
  variant: ClassPanelVariant;
  classId: string;
  classActive: boolean;
  classCourses: Array<{ id: string; course_id: string; title: string }>;
  courseOptions: Array<{ id: string; title: string; is_published: boolean }>;
}

export function ClassCoursesPanel({
  variant,
  classId,
  classActive,
  classCourses,
  courseOptions,
}: ClassCoursesPanelProps) {
  const router = useRouter();
  const available = useMemo(() => {
    const assigned = new Set(classCourses.map((c) => c.course_id));
    return courseOptions.filter((c) => !assigned.has(c.id));
  }, [classCourses, courseOptions]);

  const [courseId, setCourseId] = useState(available[0]?.id ?? "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<Message>(null);

  useEffect(() => {
    if (available.length === 0) {
      setCourseId("");
      return;
    }
    if (!available.some((c) => c.id === courseId)) {
      setCourseId(available[0]!.id);
    }
  }, [available, courseId]);

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault();
    if (!courseId) return;
    setLoading(true);
    setMessage(null);
    try {
      const result =
        variant === "admin"
          ? await adminAssignCourseToClass(classId, courseId)
          : await teacherAssignCourseToClass(classId, courseId);
      setMessage({ type: result.ok ? "success" : "error", text: result.message });
      if (result.ok) router.refresh();
    } catch {
      setMessage({ type: "error", text: "연결이 끊겼어요. 다시 해 주세요." });
    } finally {
      setLoading(false);
    }
  }

  async function handleUnassign(courseIdToRemove: string, title: string) {
    if (
      !window.confirm(
        `「${title}」 강좌 배정을 해제할까요?\n학생들이 이미 수강 중인 강좌는 그대로 남아요.`
      )
    ) {
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const result =
        variant === "admin"
          ? await adminRemoveCourseFromClass(classId, courseIdToRemove)
          : await teacherRemoveCourseFromClass(classId, courseIdToRemove);
      setMessage(
        result.ok
          ? { type: "success", text: `「${title}」 배정을 해제했어요.` }
          : { type: "error", text: result.message }
      );
      if (result.ok) router.refresh();
    } catch {
      setMessage({ type: "error", text: "연결이 끊겼어요. 다시 해 주세요." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {classActive ? (
        <form onSubmit={handleAssign} className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <label htmlFor="class-course-pick" className="ui-label">
              강좌 배정
            </label>
            {available.length === 0 ? (
              <p className="text-sm text-slate-500">
                {courseOptions.length === 0
                  ? variant === "teacher"
                    ? "내가 담당하는 강좌가 아직 없어요."
                    : "아직 만든 강좌가 없어요."
                  : "배정할 수 있는 강좌를 모두 배정했어요."}
              </p>
            ) : (
              <select
                id="class-course-pick"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="ui-select"
              >
                {available.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                    {c.is_published ? "" : " (비공개)"}
                  </option>
                ))}
              </select>
            )}
          </div>
          <Button type="submit" disabled={loading || !courseId}>
            배정
          </Button>
        </form>
      ) : (
        <p className="text-sm text-slate-500">보관된 반에는 강좌를 새로 배정할 수 없어요.</p>
      )}
      <p className="text-xs text-slate-500">
        강좌를 배정하면 이 반 학생 모두가 수강하게 돼요. 새로 들어오는 학생도요.
        {variant === "teacher" ? " 내가 담당하는 강좌만 배정할 수 있어요." : ""}
      </p>

      {message ? (
        <Alert variant={message.type === "success" ? "success" : "error"}>{message.text}</Alert>
      ) : null}

      <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
        {classCourses.length === 0 ? (
          <li className="px-4 py-6 text-center text-sm text-slate-500">
            배정된 강좌가 없어요.
          </li>
        ) : (
          classCourses.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
              <span className="flex min-w-0 items-center gap-2 text-sm font-medium text-slate-900">
                <Icon name="video" size={16} className="text-slate-400" />
                <span className="truncate">{c.title}</span>
              </span>
              <Button
                variant="ghost"
                size="sm"
                disabled={loading}
                onClick={() => handleUnassign(c.course_id, c.title)}
                className="!text-slate-600 hover:!text-rose-700"
              >
                배정 해제
              </Button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

/* ───────────── 설정 ───────────── */

interface ClassSettingsPanelProps {
  variant: ClassPanelVariant;
  classId: string;
  initialName: string;
  initialDescription: string;
  initialTeacherId: string;
  initialIsActive: boolean;
  /** 수업 요일(0=월 … 6=일). 비어 있으면 월~금 */
  initialWeekdays?: number[];
  /** 수업 시간 "HH:MM" (학습일정표 머리에 들어간다) */
  initialStartTime?: string;
  initialEndTime?: string;
  initialRoom?: string;
  teachers: { id: string; name: string }[];
}

const WEEKDAY_NAMES = ["월", "화", "수", "목", "금", "토", "일"];

export function ClassSettingsPanel({
  variant,
  classId,
  initialName,
  initialDescription,
  initialTeacherId,
  initialIsActive,
  initialWeekdays = [],
  initialStartTime = "",
  initialEndTime = "",
  initialRoom = "",
  teachers,
}: ClassSettingsPanelProps) {
  const [weekdays, setWeekdays] = useState<number[]>(initialWeekdays);
  const [startTime, setStartTime] = useState(initialStartTime);
  const [endTime, setEndTime] = useState(initialEndTime);
  const [room, setRoom] = useState(initialRoom);
  const isAdmin = variant === "admin";
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [teacherId, setTeacherId] = useState(initialTeacherId);
  const [isActive, setIsActive] = useState(initialIsActive);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<Message>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isAdmin) return;
    setLoading(true);
    setMessage(null);
    try {
      const result = await updateClass(classId, { name, description, teacherId, isActive, weekdays, startTime, endTime, room });
      setMessage({ type: result.ok ? "success" : "error", text: result.message });
      if (result.ok) router.refresh();
    } catch {
      setMessage({ type: "error", text: "연결이 끊겼어요. 다시 해 주세요." });
    } finally {
      setLoading(false);
    }
  }

  const teacherName = teachers.find((t) => t.id === initialTeacherId)?.name ?? "정하지 않음";

  return (
    <div className="space-y-5">
      <section className="ui-section-card">
        <h2 className="mb-4 text-base font-bold text-slate-900">반 정보</h2>
        {isAdmin ? (
          <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
            <div>
              <label htmlFor="class-name" className="ui-label">
                반 이름
              </label>
              <input
                id="class-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="ui-input"
              />
            </div>
            <div>
              <label htmlFor="class-desc" className="ui-label">
                설명
              </label>
              <textarea
                id="class-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="선택"
                className="ui-input"
              />
            </div>
            <div>
              <label htmlFor="class-teacher" className="ui-label">
                담당 강사
              </label>
              <select
                id="class-teacher"
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                className="ui-select"
              >
                <option value="">정하지 않음</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <fieldset>
              <legend className="ui-label">수업 요일</legend>
              <div className="flex flex-wrap gap-1.5">
                {WEEKDAY_NAMES.map((w, i) => {
                  const on = weekdays.includes(i);
                  return (
                    <button
                      key={w}
                      type="button"
                      aria-pressed={on}
                      onClick={() =>
                        setWeekdays((prev) => (on ? prev.filter((d) => d !== i) : [...prev, i].sort((a, b) => a - b)))
                      }
                      className={`h-9 w-10 rounded-md border text-sm font-semibold ${
                        on ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300 bg-white text-slate-600"
                      }`}
                    >
                      {w}
                    </button>
                  );
                })}
              </div>
              <p className="mt-1 text-xs text-slate-500">
                학습 리포트 달력에서 수업 요일에 공부를 안 한 날만 &lsquo;빠진 날&rsquo;로 표시해요. 비워 두면 월~금으로 봐요.
              </p>
            </fieldset>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label htmlFor="class-start" className="ui-label">수업 시작</label>
                <input id="class-start" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="ui-input" />
              </div>
              <div>
                <label htmlFor="class-end" className="ui-label">수업 끝</label>
                <input id="class-end" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="ui-input" />
              </div>
              <div>
                <label htmlFor="class-room" className="ui-label">강의실</label>
                <input id="class-room" value={room} onChange={(e) => setRoom(e.target.value)} className="ui-input" placeholder="A반" />
              </div>
            </div>
            <label className="flex items-start gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="mt-0.5"
              />
              <span>
                활성
                <span className="block text-xs text-slate-500">
                  끄면 이 반이 &lsquo;보관&rsquo;으로 옮겨지고 학생·강좌를 새로 넣을 수 없어요.
                </span>
              </span>
            </label>
            {message ? (
              <Alert variant={message.type === "success" ? "success" : "error"}>
                {message.text}
              </Alert>
            ) : null}
            <Button type="submit" disabled={loading}>
              {loading ? "저장하는 중…" : "저장"}
            </Button>
          </form>
        ) : (
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-slate-500">반 이름</dt>
              <dd className="mt-0.5 font-medium text-slate-900">{initialName}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">담당 강사</dt>
              <dd className="mt-0.5 font-medium text-slate-900">{teacherName}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs text-slate-500">설명</dt>
              <dd className="mt-0.5 text-slate-700">{initialDescription || "—"}</dd>
            </div>
            <p className="text-xs text-slate-500 sm:col-span-2">
              반 이름·담당 강사는 관리자가 바꿀 수 있어요.
            </p>
          </dl>
        )}
      </section>

      <section className="rounded-lg border border-rose-200 bg-white p-5 shadow-card sm:p-6">
        <h2 className="text-base font-bold text-slate-900">반 보관</h2>
        {initialIsActive ? (
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600">
              더 이상 쓰지 않는 반은 보관하세요. 목록의 &lsquo;보관&rsquo;에서 볼 수 있고, 학생
              계정과 학습 기록은 그대로 남아요.
            </p>
            <ArchiveClassButton
              classId={classId}
              className={initialName}
              onArchive={isAdmin ? deleteClass : teacherDeactivateClass}
              redirectTo={isAdmin ? "/admin/classes" : "/teacher/classes"}
              restoreHint={
                isAdmin
                  ? "설정에서 '활성'을 다시 켜면 되살릴 수 있어요."
                  : "다시 쓰려면 관리자에게 요청해 주세요."
              }
            />
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-600">
            보관된 반이에요.{" "}
            {isAdmin
              ? "위에서 '활성'을 켜고 저장하면 다시 쓸 수 있어요."
              : "다시 쓰려면 관리자에게 요청해 주세요."}
          </p>
        )}
      </section>
    </div>
  );
}
