"use client";

import { useCallback, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { parseAdminApiResponse } from "@/lib/admin/parse-api-response-client";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/layout/NavIcon";
import { Modal } from "@/components/accounts/Modal";

export interface AccountBase {
  id: string;
  name: string;
  username: string | null;
  email: string;
  is_active: boolean;
}

export type Flash = { type: "success" | "error"; text: string } | null;

/** 받침에 맞는 조사 (학생이/강사가, 학생을/강사를, 학생은/강사는) */
export function withParticle(word: string, pair: "이가" | "을를" | "은는"): string {
  const code = word.charCodeAt(word.length - 1);
  const batchim = code >= 0xac00 && code <= 0xd7a3 && (code - 0xac00) % 28 !== 0;
  return `${word}${batchim ? pair[0] : pair[1]}`;
}

/** "오늘", "어제", "3일 전", "9월 1일" */
export function relativeDayLabel(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return null;
  const fmt = (d: Date) =>
    new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(d);
  const a = new Date(`${fmt(then)}T00:00:00Z`).getTime();
  const b = new Date(`${fmt(new Date())}T00:00:00Z`).getTime();
  const days = Math.round((b - a) / 86_400_000);
  if (days <= 0) return "오늘";
  if (days === 1) return "어제";
  if (days < 30) return `${days}일 전`;
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "long",
    day: "numeric",
  }).format(then);
}

export function Avatar({
  name,
  active = true,
  size = 32,
}: {
  name: string;
  active?: boolean;
  size?: number;
}) {
  return (
    <span
      aria-hidden
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
      className={`flex shrink-0 items-center justify-center rounded-full font-bold ${
        active ? "bg-brand-50 text-brand-700" : "bg-slate-100 text-slate-500"
      }`}
    >
      {name.trim().charAt(0) || "?"}
    </span>
  );
}

export function StatusPill({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex h-[22px] items-center whitespace-nowrap rounded px-2 text-xs font-semibold ${
        active ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"
      }`}
    >
      {active ? "활성" : "쉬는 중"}
    </span>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="inline-flex overflow-hidden rounded-md border border-slate-200 bg-white"
    >
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(o.value)}
            className={`whitespace-nowrap px-3.5 py-[7px] text-[13px] font-semibold tabular-nums transition ${
              on ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-50"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function SearchBox({
  value,
  onChange,
  placeholder = "이름·아이디로 찾기",
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={`relative block ${className}`.trim()}>
      <span className="sr-only">{placeholder}</span>
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
        <Icon name="search" size={16} />
      </span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="ui-input h-9 pl-9"
      />
    </label>
  );
}

export function FlashBar({ flash, onClose }: { flash: Flash; onClose: () => void }) {
  if (!flash) return null;
  return (
    <div className="relative">
      <Alert variant={flash.type === "success" ? "success" : "error"} className="pr-9">
        {flash.text}
      </Alert>
      <button
        type="button"
        onClick={onClose}
        aria-label="닫기"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-current opacity-60 hover:opacity-100"
      >
        <Icon name="x" size={14} />
      </button>
    </div>
  );
}

/** 계정 등록·수정·비밀번호·상태·삭제 요청 */
export function useAccountActions(apiBasePath: string, roleLabel: string) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<Flash>(null);

  const call = useCallback(
    async (
      url: string,
      init: RequestInit,
      fallbackOk: string,
      fallbackErr: string
    ): Promise<boolean> => {
      setBusy(true);
      setFlash(null);
      try {
        const res = await fetch(url, {
          credentials: "same-origin",
          ...init,
          headers: init.body ? { "Content-Type": "application/json" } : undefined,
        });
        const data = await parseAdminApiResponse(res);
        if (!res.ok || !data.ok) {
          setFlash({ type: "error", text: data.message ?? fallbackErr });
          return false;
        }
        setFlash({ type: "success", text: data.message ?? fallbackOk });
        router.refresh();
        return true;
      } catch (err) {
        console.error("account action error:", err);
        setFlash({ type: "error", text: "연결이 잠시 끊겼어요. 다시 시도해 주세요." });
        return false;
      } finally {
        setBusy(false);
      }
    },
    [router]
  );

  const create = (body: { name: string; username: string; password: string } & Record<string, unknown>) =>
    call(
      apiBasePath,
      { method: "POST", body: JSON.stringify(body) },
      `${roleLabel} 계정을 만들었어요.`,
      "등록하지 못했어요."
    );

  const update = (id: string, body: { name: string; username?: string } & Record<string, unknown>) =>
    call(
      `${apiBasePath}/${id}`,
      { method: "PATCH", body: JSON.stringify(body) },
      "저장했어요.",
      "저장하지 못했어요."
    );

  const resetPassword = (id: string, password: string) =>
    call(
      `${apiBasePath}/${id}/reset-password`,
      { method: "POST", body: JSON.stringify({ password }) },
      "비밀번호를 바꿨어요.",
      "비밀번호를 바꾸지 못했어요."
    );

  const toggleActive = (user: AccountBase) => {
    const next = !user.is_active;
    const ok = window.confirm(
      next
        ? `「${user.name}」 ${roleLabel} 계정을 다시 활성으로 바꿀까요?`
        : `「${user.name}」 ${roleLabel} 계정을 잠시 쉬게 할까요?\n쉬는 동안에는 로그인할 수 없어요.`
    );
    if (!ok) return Promise.resolve(false);
    return call(
      `${apiBasePath}/${user.id}`,
      { method: "PATCH", body: JSON.stringify({ is_active: next }) },
      next ? "다시 활성으로 바꿨어요." : "잠시 쉬게 했어요.",
      "상태를 바꾸지 못했어요."
    );
  };

  /** extraNote는 확인 창에 덧붙일 줄 (예: 담당 강좌 안내) */
  const remove = (user: AccountBase, extraNote = "") => {
    if (
      !window.confirm(
        `「${user.name}」 ${roleLabel} 계정을 완전히 삭제할까요?\n삭제 후에는 되돌릴 수 없습니다.${extraNote}`
      )
    ) {
      return Promise.resolve(false);
    }
    return call(
      `${apiBasePath}/${user.id}`,
      { method: "DELETE" },
      `${roleLabel} 계정을 삭제했어요.`,
      "삭제하지 못했어요."
    );
  };

  return { busy, flash, setFlash, create, update, resetPassword, toggleActive, remove };
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="ui-label">
        {label}
        {hint ? <span className="ml-1 font-normal text-slate-400">{hint}</span> : null}
      </span>
      {children}
    </label>
  );
}

export function AccountCreateModal({
  roleLabel,
  busy,
  flash,
  onSubmit,
  onClose,
  withStudentDetails,
  classOptions,
  onCreateClass,
}: {
  roleLabel: string;
  busy: boolean;
  flash: Flash;
  onSubmit: (body: { name: string; username: string; password: string } & Record<string, unknown>) => Promise<boolean>;
  onClose: () => void;
  /** 학생 등록에서는 학교·학년·연락처를 같이 받는다(학습일정표에 쓴다) */
  withStudentDetails?: boolean;
  /** 등록하면서 넣을 반 고르기 */
  classOptions?: { id: string; name: string }[];
  /** 그 자리에서 새 반 만들기 — 만든 반의 id를 돌려준다 */
  onCreateClass?: (name: string) => Promise<string | null>;
}) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [details, setDetails] = useState({
    school: "",
    schoolGrade: "",
    birthDate: "",
    phone: "",
    parentPhone: "",
    enrolledOn: "",
  });
  const setField = (k: keyof typeof details) => (e: { target: { value: string } }) =>
    setDetails((d) => ({ ...d, [k]: e.target.value }));

  const [classIds, setClassIds] = useState<string[]>([]);
  const [extraClasses, setExtraClasses] = useState<{ id: string; name: string }[]>([]);
  const [newClassName, setNewClassName] = useState("");
  const [makingClass, setMakingClass] = useState(false);
  const [classBusy, setClassBusy] = useState(false);
  const [classError, setClassError] = useState<string | null>(null);
  const allClasses = [...(classOptions ?? []), ...extraClasses];

  async function makeClass() {
    const name = newClassName.trim();
    if (!name || !onCreateClass) return;
    setClassBusy(true);
    setClassError(null);
    try {
      const id = await onCreateClass(name);
      if (!id) {
        setClassError("반을 만들지 못했어요.");
        return;
      }
      setExtraClasses((v) => [...v, { id, name }]);
      setClassIds((v) => [...v, id]);
      setNewClassName("");
      setMakingClass(false);
    } finally {
      setClassBusy(false);
    }
  }

  return (
    <Modal
      title={`${roleLabel} 등록`}
      description={`${withParticle(roleLabel, "은는")} 아이디와 비밀번호로 로그인해요.`}
      onClose={onClose}
    >
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          if (
            await onSubmit({
              name,
              username,
              password,
              ...(withStudentDetails ? details : {}),
              ...(classOptions ? { classIds } : {}),
            })
          )
            onClose();
        }}
      >
        <Field label="이름">
          <input
            required
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="ui-input"
          />
        </Field>
        <Field label="아이디" hint="영문 소문자·숫자 3~32자">
          <input
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            className="ui-input"
          />
        </Field>
        <Field label="첫 비밀번호" hint="6자 이상">
          <input
            required
            type="password"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            className="ui-input"
          />
        </Field>
        {classOptions ? (
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="mb-2 text-xs font-semibold text-slate-600">
              반 (넣으면 그 반의 강좌·단어·듣기가 바로 함께 배정돼요)
            </p>
            <div className="flex flex-wrap gap-1.5">
              {allClasses.map((c) => {
                const on = classIds.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() =>
                      setClassIds((v) => (on ? v.filter((x) => x !== c.id) : [...v, c.id]))
                    }
                    className={`rounded-lg border px-2.5 py-1 text-[13px] font-semibold transition ${
                      on
                        ? "border-brand-600 bg-brand-50 text-brand-700"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {on ? "✓ " : ""}
                    {c.name}
                  </button>
                );
              })}
              {allClasses.length === 0 && !makingClass ? (
                <span className="text-[13px] text-slate-500">아직 반이 없어요.</span>
              ) : null}
              {onCreateClass && !makingClass ? (
                <button
                  type="button"
                  onClick={() => setMakingClass(true)}
                  className="rounded-lg border border-dashed border-slate-300 bg-white px-2.5 py-1 text-[13px] font-semibold text-slate-600 hover:bg-slate-100"
                >
                  + 새 반 만들기
                </button>
              ) : null}
            </div>
            {makingClass ? (
              <div className="mt-2 flex gap-1.5">
                <input
                  autoFocus
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void makeClass();
                    }
                  }}
                  placeholder="반 이름 (예: 중2 월수금 A)"
                  className="ui-input h-9 flex-1 text-sm"
                />
                <Button type="button" size="sm" disabled={classBusy || !newClassName.trim()} onClick={() => void makeClass()}>
                  {classBusy ? "만드는 중…" : "만들기"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setMakingClass(false);
                    setNewClassName("");
                    setClassError(null);
                  }}
                >
                  취소
                </Button>
              </div>
            ) : null}
            {classError ? <p className="mt-1.5 text-[13px] text-rose-600">{classError}</p> : null}
          </div>
        ) : null}
        {withStudentDetails ? (
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="mb-2 text-xs font-semibold text-slate-600">학습일정표·상담에 쓰는 정보 (나중에 채워도 돼요)</p>
            <div className="grid grid-cols-2 gap-2">
              <Field label="학교">
                <input value={details.school} onChange={setField("school")} className="ui-input" placeholder="동암중" />
              </Field>
              <Field label="학년">
                <input value={details.schoolGrade} onChange={setField("schoolGrade")} className="ui-input" placeholder="중2" />
              </Field>
              <Field label="생년월일">
                <input type="date" value={details.birthDate} onChange={setField("birthDate")} className="ui-input" />
              </Field>
              <Field label="입학일">
                <input type="date" value={details.enrolledOn} onChange={setField("enrolledOn")} className="ui-input" />
              </Field>
              <Field label="본인 전화">
                <input value={details.phone} onChange={setField("phone")} className="ui-input" placeholder="010-0000-0000" inputMode="numeric" />
              </Field>
              <Field label="학부모 전화">
                <input value={details.parentPhone} onChange={setField("parentPhone")} className="ui-input" placeholder="010-0000-0000" inputMode="numeric" />
              </Field>
            </div>
          </div>
        ) : null}
        {flash?.type === "error" ? <Alert variant="error">{flash.text}</Alert> : null}
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" onClick={onClose}>
            취소
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? "등록 중…" : "등록"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function AccountEditModal({
  user,
  roleLabel,
  allowUsernameEdit,
  busy,
  flash,
  onSubmit,
  onClose,
}: {
  user: AccountBase;
  roleLabel: string;
  allowUsernameEdit: boolean;
  busy: boolean;
  flash: Flash;
  onSubmit: (body: { name: string; username?: string }) => Promise<boolean>;
  onClose: () => void;
}) {
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username ?? "");

  return (
    <Modal title={`${roleLabel} 정보 수정`} onClose={onClose}>
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          const body: { name: string; username?: string } = { name };
          if (allowUsernameEdit) body.username = username;
          if (await onSubmit(body)) onClose();
        }}
      >
        <Field label="이름">
          <input
            required
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="ui-input"
          />
        </Field>
        <Field label="아이디" hint={allowUsernameEdit ? "영문 소문자·숫자 3~32자" : undefined}>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={!allowUsernameEdit}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            className="ui-input disabled:bg-slate-50 disabled:text-slate-500"
          />
        </Field>
        {flash?.type === "error" ? <Alert variant="error">{flash.text}</Alert> : null}
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" onClick={onClose}>
            취소
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? "저장 중…" : "저장"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function PasswordModal({
  user,
  busy,
  flash,
  onSubmit,
  onClose,
}: {
  user: AccountBase;
  busy: boolean;
  flash: Flash;
  onSubmit: (password: string) => Promise<boolean>;
  onClose: () => void;
}) {
  const [password, setPassword] = useState("");
  return (
    <Modal
      title="비밀번호 바꾸기"
      description={`${user.name}의 새 비밀번호를 넣으면 바로 적용돼요.`}
      onClose={onClose}
    >
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          if (await onSubmit(password)) onClose();
        }}
      >
        <Field label="새 비밀번호" hint="6자 이상">
          <input
            required
            autoFocus
            type="password"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            className="ui-input"
          />
        </Field>
        {flash?.type === "error" ? <Alert variant="error">{flash.text}</Alert> : null}
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" onClick={onClose}>
            취소
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? "바꾸는 중…" : "바꾸기"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
