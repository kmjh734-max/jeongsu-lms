import { StageDots, StageLegend } from "@/components/vocab/VocabUi";
import { buildStageCell } from "@/lib/vocab/stage-cell";

export interface VocabStageProgressRow {
  studentId: string;
  studentName: string;
  /** 진행 기록이 있는지 */
  started: boolean;
  stage1Completed: boolean;
  stage2Completed: boolean;
  stage3Completed: boolean;
  stage4Passed: boolean;
  stage4LastScore: number;
  stage4BestScore: number;
  stage4AttemptCount: number;
}

/** 단어장 한 개의 학생별 진행 — 1·2·3·4단계 점, 최근·최고 점수, 응시 횟수 */
export function VocabStageProgressTable({ rows }: { rows: VocabStageProgressRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white px-6 py-14 text-center shadow-card">
        <p className="text-sm text-slate-500">
          아직 배정된 학생이 없어요. 배정하면 여기서 진행을 볼 수 있어요.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <div className="flex justify-end">
        <StageLegend />
      </div>
      <div className="ui-table-wrap">
        <table className="ui-table">
          <thead>
            <tr>
              <th>학생</th>
              <th>
                1·2·3·4단계
                <span className="ml-1.5 font-normal text-slate-400">카드 · 철자 · 예문 · 최종 시험</span>
              </th>
              <th className="text-right">최근</th>
              <th className="text-right">최고</th>
              <th className="text-right">응시</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const tookTest = row.stage4AttemptCount > 0 || row.stage4Passed;
              const cell = buildStageCell({
                started: row.started,
                stage1: row.stage1Completed,
                stage2: row.stage2Completed,
                stage3: row.stage3Completed,
                passed: row.stage4Passed,
                attempts: row.stage4AttemptCount,
                bestScore: row.stage4BestScore,
              });
              return (
                <tr key={row.studentId}>
                  <td className="font-semibold text-slate-900">{row.studentName}</td>
                  <td>
                    <span className="flex items-center gap-2">
                      <StageDots dots={cell.dots} />
                      <span
                        className={`text-xs font-semibold ${
                          cell.passed
                            ? "text-green-700"
                            : cell.failed
                              ? "text-rose-700"
                              : "font-normal text-slate-400"
                        }`}
                      >
                        {cell.passed ? "합격" : cell.failed ? "불합격" : cell.label}
                      </span>
                    </span>
                  </td>
                  <td className="text-right tabular-nums">
                    {row.stage4AttemptCount > 0 ? `${row.stage4LastScore}점` : "—"}
                  </td>
                  <td
                    className={`text-right font-semibold tabular-nums ${
                      !tookTest
                        ? "text-slate-400"
                        : row.stage4Passed
                          ? "text-green-700"
                          : "text-rose-700"
                    }`}
                  >
                    {tookTest ? `${row.stage4BestScore}점` : "—"}
                  </td>
                  <td className="text-right tabular-nums text-slate-500">
                    {row.stage4AttemptCount}회
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
