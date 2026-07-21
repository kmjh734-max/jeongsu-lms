"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { academyLoginAbsoluteUrl } from "@/lib/tenant/resolve-login-academy";

export type AcademyListRow = {
  id: string;
  name: string;
  slug: string;
  status: string;
  primary_color: string | null;
  secondary_color?: string | null;
  logo_url: string | null;
  description?: string | null;
  phone?: string | null;
  address?: string | null;
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

const SITE_URL =
  (typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "")) ||
  "https://engcore.co.kr";

type ManageTab = "profile" | "admins";

export function SuperAdminAcademiesClient({
  initialRows,
}: {
  initialRows: AcademyListRow[];
}) {
  const router = useRouter();
  const [rows, setRows] = useState(initialRows);
  useEffect(() => {
    setRows(initialRows);
  }, [initialRows]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#2563EB");

  const [manageId, setManageId] = useState<string | null>(null);
  const [manageTab, setManageTab] = useState<ManageTab>("profile");
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [linkEmail, setLinkEmail] = useState("");
  const [createName, setCreateName] = useState("");
  const [createUsername, setCreateUsername] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [inviteHint, setInviteHint] = useState<string | null>(null);

  const [editName, setEditName] = useState("");
  const [editLogo, setEditLogo] = useState("");
  const [editPrimary, setEditPrimary] = useState("#2563EB");
  const [editSecondary, setEditSecondary] = useState("#2563EB");
  const [editDescription, setEditDescription] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [logoUploading, setLogoUploading] = useState(false);
  const [showLogoUrl, setShowLogoUrl] = useState(false);

  const managed = rows.find((r) => r.id === manageId) ?? null;

  useEffect(() => {
    if (!managed) return;
    setEditName(managed.name);
    setEditLogo(managed.logo_url ?? "");
    setEditPrimary(managed.primary_color || "#2563EB");
    setEditSecondary(
      managed.secondary_color || managed.primary_color || "#2563EB"
    );
    setEditDescription(managed.description ?? "");
    setEditPhone(managed.phone ?? "");
    setEditAddress(managed.address ?? "");
  }, [managed]);

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
    if (manageId && manageTab === "admins") void loadAdmins(manageId);
  }, [manageId, manageTab, loadAdmins]);

  function openManage(id: string, tab: ManageTab = "profile") {
    if (manageId === id && manageTab === tab) {
      setManageId(null);
    } else {
      setManageId(id);
      setManageTab(tab);
    }
    setInviteHint(null);
    setError(null);
    setMessage(null);
  }

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
      setMessage(
        "학원을 추가했습니다. 「설정」에서 로고·연락처를 넣고 「관리자」를 연결하세요."
      );
      setShowForm(false);
      setName("");
      setSlug("");
      if (data.academy?.id) {
        setManageId(data.academy.id as string);
        setManageTab("profile");
      }
      router.refresh();
    } catch {
      setError("요청에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  function applyAcademyRow(a: AcademyListRow) {
    if (!manageId) return;
    setRows((prev) =>
      prev.map((r) =>
        r.id === manageId
          ? {
              ...r,
              name: a.name,
              logo_url: a.logo_url,
              primary_color: a.primary_color,
              secondary_color: a.secondary_color,
              description: a.description,
              phone: a.phone,
              address: a.address,
            }
          : r
      )
    );
    setEditLogo(a.logo_url ?? "");
  }

  async function uploadLogo(file: File) {
    if (!manageId) return;
    setLogoUploading(true);
    setError(null);
    setMessage(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(
        `/api/super-admin/academies/${manageId}/logo`,
        { method: "POST", body: form }
      );
      const data = await res.json();
      if (!data.ok) {
        setError(data.message ?? "로고 업로드 실패");
        return;
      }
      const url = (data.logo_url as string) || "";
      setEditLogo(url);
      if (data.academy) {
        applyAcademyRow(data.academy as AcademyListRow);
      } else {
        setRows((prev) =>
          prev.map((r) =>
            r.id === manageId ? { ...r, logo_url: url || null } : r
          )
        );
      }
      setMessage("로고를 업로드했습니다.");
      router.refresh();
    } catch {
      setError("로고 업로드에 실패했습니다.");
    } finally {
      setLogoUploading(false);
    }
  }

  async function saveAcademyProfile() {
    if (!manageId) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/super-admin/academies/${manageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          logo_url: editLogo.trim(),
          primary_color: editPrimary,
          secondary_color: editSecondary,
          description: editDescription,
          phone: editPhone,
          address: editAddress,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.message ?? "저장 실패");
        return;
      }
      applyAcademyRow(data.academy as AcademyListRow);
      setMessage("학원 정보를 저장했습니다. 인쇄·리포트에 반영됩니다.");
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
    setInviteHint(null);
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
      setInviteHint(
        `로그인: ${academyLoginAbsoluteUrl(managed?.slug ?? "", SITE_URL)}\n이메일: ${linkEmail.trim()}\n→ 로그인 후 /admin 으로 이동합니다.`
      );
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
    const username = createUsername.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (username.length < 3) {
      setError("아이디는 영문 소문자·숫자 3자 이상으로 입력해 주세요.");
      return;
    }
    setBusy(true);
    setError(null);
    setMessage(null);
    setInviteHint(null);
    try {
      const res = await fetch(`/api/super-admin/academies/${manageId}/admins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          name: createName.trim(),
          username,
          password: createPassword,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.message ?? "생성 실패");
        return;
      }
      setMessage(data.message ?? "관리자를 만들었습니다.");
      setInviteHint(
        [
          `로그인: ${academyLoginAbsoluteUrl(managed?.slug ?? "", SITE_URL)}`,
          `아이디: ${username}`,
          `비밀번호: (방금 설정한 값)`,
          `학원: ${managed?.name ?? ""}`,
          `→ 로그인 후 EngCore Admin(/admin)으로 들어갑니다.`,
        ].join("\n")
      );
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

  async function copyInvite() {
    if (!inviteHint) return;
    try {
      await navigator.clipboard.writeText(inviteHint);
      setMessage("안내 문구를 복사했습니다. 학원 관리자에게 전달하세요.");
    } catch {
      setError("복사에 실패했습니다. 아래 문구를 직접 복사해 주세요.");
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
          <p className="mb-3 text-xs text-slate-500">
            학원 추가 → 설정(로고·색) → 관리자 연결 순서로 온보딩하세요.
          </p>
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
                    {r.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={r.logo_url}
                        alt=""
                        className="h-6 w-6 rounded object-contain"
                      />
                    ) : (
                      <span
                        className="inline-block h-3 w-3 rounded-full"
                        style={{ background: r.primary_color || "#2563EB" }}
                      />
                    )}
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
                      onClick={() => openManage(r.id, "profile")}
                    >
                      {manageId === r.id && manageTab === "profile"
                        ? "닫기"
                        : "설정"}
                    </button>
                    <button
                      type="button"
                      className="text-xs font-medium text-brand-800 hover:underline"
                      onClick={() => openManage(r.id, "admins")}
                    >
                      {manageId === r.id && manageTab === "admins"
                        ? "닫기"
                        : "관리자"}
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
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-slate-900">
              {managed.name} · 온보딩
            </h3>
            <div className="flex gap-1 rounded-lg border border-slate-200 bg-slate-50 p-0.5">
              <button
                type="button"
                className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                  manageTab === "profile"
                    ? "bg-white text-brand-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                onClick={() => setManageTab("profile")}
              >
                1. 학원 정보
              </button>
              <button
                type="button"
                className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                  manageTab === "admins"
                    ? "bg-white text-brand-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                onClick={() => setManageTab("admins")}
              >
                2. 관리자
              </button>
            </div>
          </div>

          {manageTab === "profile" && (
            <div className="mt-4 space-y-4">
              <p className="text-xs text-slate-500">
                학원명·로고는 인쇄물·학부모 리포트에 사용됩니다. 로고는 이미지
                파일을 업로드하세요 (PNG/JPG/WEBP, 2MB 이하).
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-xs text-slate-600 sm:col-span-2">
                  학원명
                  <input
                    className="ui-input mt-1"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </label>
                <div className="sm:col-span-2 space-y-2">
                  <p className="text-xs text-slate-600">로고</p>
                  <div className="flex flex-wrap items-center gap-3">
                    {editLogo.trim() ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={editLogo.trim()}
                        alt="로고 미리보기"
                        className="h-14 w-auto max-w-[180px] rounded border border-slate-200 bg-white p-1 object-contain"
                      />
                    ) : (
                      <div className="flex h-14 w-28 items-center justify-center rounded border border-dashed border-slate-300 bg-slate-50 text-[11px] text-slate-400">
                        없음
                      </div>
                    )}
                    <div className="flex flex-col gap-1.5">
                      <label className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 hover:bg-slate-50">
                        {logoUploading ? "업로드 중…" : "이미지 선택"}
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                          className="hidden"
                          disabled={logoUploading || busy}
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            e.target.value = "";
                            if (f) void uploadLogo(f);
                          }}
                        />
                      </label>
                      {editLogo.trim() ? (
                        <button
                          type="button"
                          className="text-left text-[11px] text-slate-500 hover:text-red-700 hover:underline"
                          disabled={busy || logoUploading}
                          onClick={() => setEditLogo("")}
                        >
                          로고 제거 (저장 시 반영)
                        </button>
                      ) : null}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="text-[11px] text-slate-500 hover:underline"
                    onClick={() => setShowLogoUrl((v) => !v)}
                  >
                    {showLogoUrl
                      ? "URL 직접 입력 숨기기"
                      : "또는 URL 직접 입력"}
                  </button>
                  {showLogoUrl ? (
                    <input
                      className="ui-input font-mono text-xs"
                      value={editLogo}
                      onChange={(e) => setEditLogo(e.target.value)}
                      placeholder="/image/logo-xxx.png 또는 https://…"
                    />
                  ) : null}
                </div>
                <label className="block text-xs text-slate-600">
                  대표 색상
                  <input
                    type="color"
                    className="mt-1 h-10 w-full cursor-pointer rounded border border-slate-200"
                    value={editPrimary}
                    onChange={(e) => setEditPrimary(e.target.value)}
                  />
                </label>
                <label className="block text-xs text-slate-600">
                  보조 색상
                  <input
                    type="color"
                    className="mt-1 h-10 w-full cursor-pointer rounded border border-slate-200"
                    value={editSecondary}
                    onChange={(e) => setEditSecondary(e.target.value)}
                  />
                </label>
                <label className="block text-xs text-slate-600 sm:col-span-2">
                  소개
                  <textarea
                    className="ui-input mt-1 min-h-[72px]"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="학원 한 줄 소개"
                  />
                </label>
                <label className="block text-xs text-slate-600">
                  전화
                  <input
                    className="ui-input mt-1"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="02-0000-0000"
                  />
                </label>
                <label className="block text-xs text-slate-600">
                  주소
                  <input
                    className="ui-input mt-1"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    placeholder="서울시 …"
                  />
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  disabled={busy || !editName.trim()}
                  onClick={() => void saveAcademyProfile()}
                >
                  {busy ? "저장 중…" : "학원 정보 저장"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setManageTab("admins")}
                >
                  다음: 관리자 연결 →
                </Button>
                {managed.slug ? (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={async () => {
                      const url = academyLoginAbsoluteUrl(
                        managed.slug,
                        SITE_URL
                      );
                      try {
                        await navigator.clipboard.writeText(url);
                        setMessage(
                          `학원 로그인 링크를 복사했습니다: ${url}`
                        );
                      } catch {
                        setInviteHint(`로그인: ${url}`);
                        setMessage("아래 로그인 링크를 복사해 전달하세요.");
                      }
                    }}
                  >
                    로그인 링크 복사
                  </Button>
                ) : null}
              </div>
              {managed.slug ? (
                <p className="text-[11px] text-slate-500">
                  학원 전용 로그인:{" "}
                  <span className="font-mono text-slate-700">
                    {academyLoginAbsoluteUrl(managed.slug, SITE_URL)}
                  </span>
                  {managed.slug ? (
                    <>
                      {" "}
                      · 서브도메인(선택):{" "}
                      <span className="font-mono">
                        https://{managed.slug}.engcore.co.kr/login
                      </span>
                    </>
                  ) : null}
                </p>
              ) : null}
            </div>
          )}

          {manageTab === "admins" && (
            <div className="mt-4 space-y-4">
              <p className="text-xs text-slate-500">
                이 학원의 EngCore Admin(
                <span className="font-mono">/admin</span>)으로 들어갈 계정을
                연결하거나 새로 만듭니다.
              </p>

              {inviteHint && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-emerald-900">
                      관리자 전달용 안내
                    </p>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => void copyInvite()}
                    >
                      복사
                    </Button>
                  </div>
                  <pre className="mt-2 whitespace-pre-wrap text-xs text-emerald-950">
                    {inviteHint}
                  </pre>
                </div>
              )}

              <div className="overflow-x-auto rounded-xl border border-slate-200">
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
                        <td
                          colSpan={3}
                          className="py-6 text-center text-slate-500"
                        >
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
                              <span className="text-xs text-emerald-700">
                                활성
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400">
                                비활성
                              </span>
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

              <div className="grid gap-4 lg:grid-cols-2">
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
                    아이디는 영문·숫자만. 생성 후 아래 안내를 복사해 전달하세요.
                  </p>
                  <div className="mt-3 grid gap-2">
                    <input
                      className="ui-input"
                      placeholder="이름"
                      value={createName}
                      onChange={(e) => setCreateName(e.target.value)}
                    />
                    <div>
                      <input
                        className="ui-input font-mono"
                        placeholder="예: jeongmin (영문·숫자)"
                        autoComplete="off"
                        spellCheck={false}
                        value={createUsername}
                        onChange={(e) => setCreateUsername(e.target.value)}
                        onBlur={() =>
                          setCreateUsername((v) =>
                            v.toLowerCase().replace(/[^a-z0-9]/g, "")
                          )
                        }
                      />
                      <p className="mt-1 text-[11px] text-slate-500">
                        영문 소문자·숫자만 (한글·특수문자 불가)
                      </p>
                    </div>
                    <input
                      className="ui-input"
                      type="password"
                      placeholder="비밀번호 (6자 이상)"
                      autoComplete="new-password"
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
                      createUsername.replace(/[^a-zA-Z0-9]/g, "").length <
                        3 ||
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
      )}
    </div>
  );
}
