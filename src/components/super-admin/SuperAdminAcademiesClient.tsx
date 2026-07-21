"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";

export type AcademyListRow = {
  id: string;
  name: string;
  slug: string;
  status: string;
  primary_color: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
  students: number;
  teachers: number;
  courses: number;
};

type AdminRow = {
  id: string;
  name: string;
  email: string;
  username: string | null;
  is_active: boolean;
  created_at: string;
};

export function SuperAdminAcademiesClient({
  initialRows,
}: {
  initialRows: AcademyListRow[];
}) {
  const router = useRouter();
  const [rows, setRows] = useState(initialRows);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#2563EB");

  const [manageId, setManageId] = useState<string | null>(null);
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [linkEmail, setLinkEmail] = useState("");
  const [createName, setCreateName] = useState("");
  const [createUsername, setCreateUsername] = useState("");
  const [createPassword, setCreatePassword] = useState("");

  const managed = rows.find((r) => r.id === manageId) ?? null;

  const loadAdmins = useCallback(async (academyId: string) => {
    setAdminsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/super-admin/academies/${academyId}/admins`);
      const data = await res.json();
      if (!data.ok) {
        setError(data.message ?? "관리자 목록 조회 실패");
        setAdmins([]);
        return;
      }
      setAdmins(data.admins ?? []);
    } catch {
      setError("관리자 목록을 불러오지 못했습니다.");
      setAdmins([]);
    } finally {
      setAdminsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (manageId) void loadAdmins(manageId);
  }, [manageId, loadAdmins]);

  async function createAcademy() {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/super-admin/academies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim().toLowerCase(),
          primary_color: primaryColor,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.message ?? "학원 생성 실패");
        return;
      }
      setMessage("학원을 추가했습니다.");
      setShowForm(false);
      setName("");
      setSlug("");
      router.refresh();
    } catch {
      setError("요청에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function setStatus(
    id: string,
    status: "active" | "suspended" | "inactive"
  ) {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/super-admin/academies/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.message ?? "상태 변경 실패");
        return;
      }
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
      setMessage("상태를 변경했습니다.");
      router.refresh();
    } catch {
      setError("요청에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function linkAdmin() {
    if (!manageId) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/super-admin/academies/${manageId}/admins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "link", email: linkEmail.trim() }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.message ?? "연결 실패");
        return;
      }
      setMessage(data.message ?? "연결했습니다.");
      setLinkEmail("");
      await loadAdmins(manageId);
      router.refresh();
    } catch {
      setError("요청에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function createAdmin() {
    if (!manageId) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/super-admin/academies/${manageId}/admins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          name: createName.trim(),
          username: createUsername.trim(),
          password: createPassword,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.message ?? "생성 실패");
        return;
      }
      setMessage(data.message ?? "관리자를 만들었습니다.");
      setCreateName("");
      setCreateUsername("");
      setCreatePassword("");
      await loadAdmins(manageId);
      router.refresh();
    } catch {
      setError("요청에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      {error && <Alert variant="error">{error}</Alert>}
      {message && <Alert variant="success">{message}</Alert>}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-slate-900">학원 목록</h2>
        <Button
          type="button"
          variant="secondary"
          onClick={() => setShowForm((v) => !v)}
        >
          {showForm ? "취소" : "+ 학원 추가"}
        </Button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block text-xs text-slate-600">
              학원명
              <input
                className="ui-input mt-1"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 새학원"
              />
            </label>
            <label className="block text-xs text-slate-600">
              slug
              <input
                className="ui-input mt-1 font-mono"
                value={slug}
                onChange={(e) =>
                  setSlug(
                    e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")
                  )
                }
                placeholder="예: new-academy"
              />
            </label>
            <label className="block text-xs text-slate-600">
              대표 색상
              <input
                type="color"
                className="mt-1 h-10 w-full cursor-pointer rounded border border-slate-200"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
              />
            </label>
          </div>
          <div className="mt-3">
            <Button
              type="button"
              disabled={busy || !name.trim() || !slug.trim()}
              onClick={() => void createAcademy()}
            >
              {busy ? "저장 중…" : "저장"}
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="ui-table w-full text-sm">
          <thead>
            <tr>
              <th>학원</th>
              <th>slug</th>
              <th>상태</th>
              <th>학생</th>
              <th>강사</th>
              <th>강좌</th>
              <th>생성일</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.id}
                className={manageId === r.id ? "bg-brand-50/50" : undefined}
              >
                <td>
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-3 w-3 rounded-full"
                      style={{ background: r.primary_color || "#2563EB" }}
                    />
                    <span className="font-medium">{r.name}</span>
                  </div>
                </td>
                <td className="font-mono text-xs text-slate-500">{r.slug}</td>
                <td>
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      r.status === "active"
                        ? "bg-emerald-700 text-white"
                        : r.status === "suspended"
                          ? "bg-amber-700 text-white"
                          : "bg-slate-400 text-white"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="tabular-nums">{r.students}</td>
                <td className="tabular-nums">{r.teachers}</td>
                <td className="tabular-nums">{r.courses}</td>
                <td className="whitespace-nowrap text-xs text-slate-600">
                  {new Date(r.created_at).toLocaleDateString("ko-KR")}
                </td>
                <td>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      className="text-xs font-medium text-brand-800 hover:underline"
                      onClick={() =>
                        setManageId((cur) => (cur === r.id ? null : r.id))
                      }
                    >
                      {manageId === r.id ? "닫기" : "관리자"}
                    </button>
                    {r.status !== "active" && (
                      <button
                        type="button"
                        disabled={busy}
                        className="text-xs text-emerald-800 hover:underline disabled:opacity-40"
                        onClick={() => void setStatus(r.id, "active")}
                      >
                        활성화
                      </button>
                    )}
                    {r.status === "active" && (
                      <button
                        type="button"
                        disabled={busy}
                        className="text-xs text-amber-800 hover:underline disabled:opacity-40"
                        onClick={() => void setStatus(r.id, "suspended")}
                      >
                        중지
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="py-10 text-center text-slate-500">
                  등록된 학원이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {managed && (
        <div className="rounded-2xl border border-brand-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">
            {managed.name} · 학원 관리자
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            이 학원의 EngCore Admin(`/admin`)으로 들어갈 계정을 연결하거나
            새로 만듭니다.
          </p>

          <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
            <table className="ui-table w-full text-sm">
              <thead>
                <tr>
                  <th>이름</th>
                  <th>이메일 / 아이디</th>
                  <th>상태</th>
                </tr>
              </thead>
              <tbody>
                {adminsLoading && (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-slate-500">
                      불러오는 중…
                    </td>
                  </tr>
                )}
                {!adminsLoading &&
                  admins.map((a) => (
                    <tr key={a.id}>
                      <td className="font-medium">{a.name}</td>
                      <td className="text-xs text-slate-600">
                        {a.email}
                        {a.username ? (
                          <span className="ml-2 font-mono text-slate-400">
                            ({a.username})
                          </span>
                        ) : null}
                      </td>
                      <td>
                        {a.is_active ? (
                          <span className="text-xs text-emerald-700">활성</span>
                        ) : (
                          <span className="text-xs text-slate-400">비활성</span>
                        )}
                      </td>
                    </tr>
                  ))}
                {!adminsLoading && admins.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="py-6 text-center text-slate-500"
                    >
                      아직 연결된 학원 관리자가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-xs font-semibold text-slate-800">
                기존 계정 연결
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                이미 있는 이메일을 이 학원 admin으로 지정합니다.
              </p>
              <label className="mt-3 block text-xs text-slate-600">
                이메일
                <input
                  className="ui-input mt-1"
                  value={linkEmail}
                  onChange={(e) => setLinkEmail(e.target.value)}
                  placeholder="admin@example.com"
                />
              </label>
              <Button
                type="button"
                className="mt-3"
                disabled={busy || !linkEmail.includes("@")}
                onClick={() => void linkAdmin()}
              >
                학원 관리자로 연결
              </Button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-xs font-semibold text-slate-800">
                새 관리자 생성
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                아이디는 영문·숫자만. 로그인 시 아이디 또는 내부 이메일을
                사용합니다.
              </p>
              <div className="mt-3 grid gap-2">
                <input
                  className="ui-input"
                  placeholder="이름"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                />
                <input
                  className="ui-input font-mono"
                  placeholder="아이디 (영문·숫자)"
                  value={createUsername}
                  onChange={(e) =>
                    setCreateUsername(
                      e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "")
                    )
                  }
                />
                <input
                  className="ui-input"
                  type="password"
                  placeholder="비밀번호 (6자 이상)"
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                />
              </div>
              <Button
                type="button"
                className="mt-3"
                disabled={
                  busy ||
                  !createName.trim() ||
                  createUsername.length < 3 ||
                  createPassword.length < 6
                }
                onClick={() => void createAdmin()}
              >
                관리자 만들기
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
