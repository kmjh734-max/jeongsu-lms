"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
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

  async function setStatus(id: string, status: "active" | "suspended" | "inactive") {
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
                    e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9-]/g, "")
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
              <tr key={r.id}>
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
    </div>
  );
}
