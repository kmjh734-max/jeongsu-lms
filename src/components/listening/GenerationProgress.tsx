import { ProgressBar } from "@/components/ui/ProgressBar";

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
  pending: "기다리는 중",
  generating: "만드는 중",
  validating: "만드는 중",
  passed: "완료",
  review: "완료",
  saving: "저장 중",
  saved: "저장함",
  audio: "음성 만드는 중",
  done: "완료",
  error: "문제 있음",
};

function statusTone(status: ItemProgressStatus): string {
  if (status === "error") return "bg-rose-50 text-rose-700";
  if (status === "passed" || status === "review" || status === "saved" || status === "done") {
    return "bg-green-50 text-green-700";
  }
  if (status === "pending") return "bg-slate-100 text-slate-500";
  return "bg-brand-50 text-brand-700";
}

export function GenerationProgress({
  title,
  percent,
  detailMessage,
  items,
}: GenerationProgressProps) {
  return (
    <div className="rounded-lg border border-brand-100 bg-brand-50/50 p-4">
      <div className="mb-3">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        {detailMessage ? <p className="mt-0.5 text-xs text-slate-600">{detailMessage}</p> : null}
      </div>
      <ProgressBar percent={Math.round(percent)} label="전체" size="sm" />
      {items && items.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {items.map((item) => (
            <li
              key={item.orderIndex}
              title={item.message}
              className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium ${statusTone(item.status)}`}
            >
              <span className="font-semibold tabular-nums">{item.orderIndex}번</span>
              {STATUS_LABEL[item.status]}
            </li>
          ))}
        </ul>
      ) : null}
      {items?.some((i) => i.status === "error" && i.message) ? (
        <ul className="mt-2 space-y-0.5 text-xs text-rose-700">
          {items
            .filter((i) => i.status === "error" && i.message)
            .map((i) => (
              <li key={i.orderIndex}>
                {i.orderIndex}번: {i.message}
              </li>
            ))}
        </ul>
      ) : null}
    </div>
  );
}
