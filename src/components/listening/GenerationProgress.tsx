import { ProgressBar } from "@/components/common/ProgressBar";

export type ItemProgressStatus =
  | "pending"
  | "generating"
  | "validating"
  | "passed"
  | "review"
  | "error"
  | "saving"
  | "saved"
  | "audio"
  | "done";

export interface ItemProgressRow {
  orderIndex: number;
  status: ItemProgressStatus;
  message?: string;
}

interface GenerationProgressProps {
  title: string;
  percent: number;
  detailMessage?: string;
  items?: ItemProgressRow[];
}

const STATUS_LABEL: Record<ItemProgressStatus, string> = {
  pending: "대기",
  generating: "생성 중",
  validating: "검수 중",
  passed: "검수 통과",
  review: "검토 필요",
  saving: "저장 중",
  saved: "저장 완료",
  audio: "음원 생성 중",
  done: "완료",
  error: "오류",
};

export function GenerationProgress({
  title,
  percent,
  detailMessage,
  items,
}: GenerationProgressProps) {
  return (
    <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-4">
      <p className="text-sm font-semibold text-indigo-900">{title}</p>
      {detailMessage && (
        <p className="mt-1 text-xs text-indigo-800">{detailMessage}</p>
      )}
      <ProgressBar className="mt-3" percent={percent} label="전체 진행률" />
      {items && items.length > 0 && (
        <ul className="mt-3 space-y-1 text-xs text-slate-700">
          {items.map((item) => (
            <li key={item.orderIndex} className="flex flex-wrap gap-2">
              <span className="font-medium">{item.orderIndex}번</span>
              <span>{STATUS_LABEL[item.status]}</span>
              {item.message && (
                <span className="text-slate-500">— {item.message}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
