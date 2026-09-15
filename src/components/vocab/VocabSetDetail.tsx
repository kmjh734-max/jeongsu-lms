"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import * as adminActions from "@/app/admin/vocab/actions";
import * as teacherActions from "@/app/teacher/vocab/actions";
import { Icon } from "@/components/layout/NavIcon";
import { Button } from "@/components/ui/Button";
import { VocabAssignModal } from "@/components/vocab/VocabAssignModal";
import { VocabSetManagePanel } from "@/components/vocab/VocabSetManagePanel";
import {
  VocabStageProgressTable,
  type VocabStageProgressRow,
} from "@/components/vocab/VocabStageProgressTable";
import { VocabTableEditor } from "@/components/vocab/VocabTableEditor";
import { Pill, useToast } from "@/components/vocab/VocabUi";
import {
  vocabBasePath,
  type VocabRole,
  type VocabSetStats,
  type VocabTeacherOption,
} from "@/lib/vocab/module-types";
import type { VocabItem, VocabSet } from "@/types/database";

export type VocabSetTab = "words" | "progress" | "settings";

export function VocabSetDetail({
  role,
  set,
  items,
  stats,
  progressRows,
  teachers,
  folders,
  backHref,
  backLabel,
  initialTab,
  initialImportOpen,
}: {
  role: VocabRole;
  set: VocabSet;
  items: VocabItem[];
  stats: VocabSetStats;
  progressRows: VocabStageProgressRow[];
  teachers: VocabTeacherOption[];
  folders: { id: string; name: string }[];
  backHref: string;
  backLabel: string;
  initialTab: VocabSetTab;
  initialImportOpen: boolean;
}) {
  const router = useRouter();
  const base = vocabBasePath(role);
  const actions = role === "admin" ? adminActions : teacherActions;
  const [tab, setTab] = useState<VocabSetTab>(initialTab);
  const [assignOpen, setAssignOpen] = useState(false);
  const [copying, setCopying] = useState(false);
  const [toast, showToast] = useToast();
  const wordsDirtyRef = useRef(false);

  const locked = Boolean(set.is_locked);
  // 학원 교재는 강사에게는 읽기 전용. 관리자는 교재를 고칠 수 있게 둔다(교재를 만드는 학원).
  const readOnly = locked && role === "teacher";

  function switchTab(next: VocabSetTab) {
    setTab(next);
    const url = new URL(window.location.href);
    if (next === "words") url.searchParams.delete("tab");
    else url.searchParams.set("tab", next);
    window.history.replaceState(null, "", url.pathname + url.search);
  }

  async function copyToMine() {
    setCopying(true);
    const result = await actions.copyVocabSet(set.id, null);
    setCopying(false);
    if (!result.ok || !result.setId) {
      showToast(result.message, "bad");
      return;
    }
    router.push(`${base}/set/${result.setId}`);
  }

  const tabs: { key: VocabSetTab; label: string; count?: number }[] = [
    { key: "words", label: "단어", count: items.length },
    { key: "progress", label: "학생 진행", count: progressRows.length },
    { key: "settings", label: "설정" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2.5">
        <Link
          href={backHref}
          onClick={(e) => {
            if (
              wordsDirtyRef.current &&
              !window.confirm("저장하지 않은 단어가 있어요. 저장하지 않고 나갈까요?")
            ) {
              e.preventDefault();
            }
          }}
          className="inline-flex items-center gap-1 self-start text-[13px] font-medium text-slate-500 hover:text-slate-900"
        >
          <Icon name="left" size={16} />
          {backLabel}
        </Link>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex min-w-0 flex-col gap-1.5">
            <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900 sm:text-[22px]">
              {locked ? <Icon name="lock" size={18} className="text-slate-400" /> : null}
              <span className="min-w-0 break-words">{set.title}</span>
            </h1>
            <div className="flex flex-wrap gap-1.5">
              <Pill>{items.length}단어</Pill>
              {stats.assignLabel ? (
                <Pill tone="brand">
                  <Icon name="users" size={12} strokeWidth={2} />
                  {stats.assignLabel.replace(/(\d)$/, "$1명")}
                </Pill>
              ) : (
                <Pill>배정 안 됨</Pill>
              )}
              {stats.avgProgress !== null ? <Pill>평균 진행 {stats.avgProgress}%</Pill> : null}
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() =>
                window.open(`${base}/set/${set.id}/print`, "_blank", "noopener,noreferrer")
              }
            >
              <Icon name="print" size={16} strokeWidth={2} />
              시험지·단어장 인쇄
            </Button>
            <Button onClick={() => setAssignOpen(true)}>
              <Icon name="users" size={16} strokeWidth={2} />
              배정
            </Button>
          </div>
        </div>
      </div>

      {locked ? (
        <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2 text-sm text-slate-700">
            <Icon name="lock" size={16} className="mt-0.5 text-slate-500" />
            {readOnly
              ? "학원 교재라 수정할 수 없어요. 복사해서 내 세트로 쓸 수 있어요."
              : "학원 교재예요. 지울 수는 없고, 고치면 이 교재를 쓰는 반에 바로 반영돼요."}
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => void copyToMine()}
            disabled={copying}
            className="self-start sm:self-auto"
          >
            <Icon name="copy" size={15} strokeWidth={2} />
            {copying ? "복사 중…" : "내 세트로 복사"}
          </Button>
        </div>
      ) : null}

      <nav className="flex gap-6 overflow-x-auto border-b border-slate-200" aria-label="단어장 메뉴">
        {tabs.map((t) => {
          const on = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => switchTab(t.key)}
              aria-current={on ? "page" : undefined}
              className={`-mb-px flex h-10 shrink-0 items-center gap-1.5 border-b-2 text-sm transition ${
                on
                  ? "border-brand-600 font-bold text-slate-900"
                  : "border-transparent font-medium text-slate-500 hover:text-slate-900"
              }`}
            >
              {t.label}
              {t.count !== undefined ? (
                <span
                  className={`text-xs font-semibold tabular-nums ${
                    on ? "text-brand-700" : "text-slate-400"
                  }`}
                >
                  {t.count}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* 탭을 바꿔도 고치던 단어가 사라지지 않게 셋 다 그려 두고 숨긴다 */}
      <div hidden={tab !== "words"}>
        <VocabTableEditor
          setId={set.id}
          initialItems={items}
          initialImportOpen={initialImportOpen}
          readOnly={readOnly}
          onSave={actions.saveVocabItems}
          onMessage={showToast}
          onDirtyChange={(d) => {
            wordsDirtyRef.current = d;
          }}
        />
      </div>
      <div hidden={tab !== "progress"}>
        <VocabStageProgressTable rows={progressRows} />
      </div>
      <div hidden={tab !== "settings"}>
        <VocabSetManagePanel
          set={set}
          role={role}
          teachers={teachers}
          folders={folders}
          readOnly={readOnly}
          listHref={backHref}
          onMessage={showToast}
        />
      </div>

      <VocabAssignModal
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        role={role}
        setIds={[set.id]}
        fallbackTitle={set.title}
      />
      {toast}
    </div>
  );
}
