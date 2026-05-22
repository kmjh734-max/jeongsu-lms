export interface VocabStageProgressRow {
  studentId: string;
  studentName: string;
  stage1Completed: boolean;
  stage2Completed: boolean;
  stage3Passed: boolean;
  stage3LastScore: number;
  stage3BestScore: number;
  stage3AttemptCount: number;
}

interface VocabStageProgressTableProps {
  rows: VocabStageProgressRow[];
}

function boolLabel(done: boolean) {
  return done ? "완료" : "미완료";
}

export function VocabStageProgressTable({ rows }: VocabStageProgressTableProps) {
  if (rows.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        배정된 학생이 없거나 아직 학습 기록이 없습니다.
      </p>
    );
  }

  return (
    <div className="ui-table-wrap">
      <table className="ui-table">
        <thead>
          <tr>
            <th>학생</th>
            <th>1단계</th>
            <th>2단계</th>
            <th>3단계 합격</th>
            <th>최근 점수</th>
            <th>최고 점수</th>
            <th>응시 횟수</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.studentId}>
              <td className="font-medium text-slate-900">{row.studentName}</td>
              <td>{boolLabel(row.stage1Completed)}</td>
              <td>{boolLabel(row.stage2Completed)}</td>
              <td>{row.stage3Passed ? "합격" : "—"}</td>
              <td>{row.stage3AttemptCount > 0 ? `${row.stage3LastScore}점` : "—"}</td>
              <td>{row.stage3BestScore > 0 ? `${row.stage3BestScore}점` : "—"}</td>
              <td>{row.stage3AttemptCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
