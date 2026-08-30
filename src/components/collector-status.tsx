import { formatDateTime } from "@/lib/format";
import type { CollectorRun } from "@/lib/web-types";
export function CollectorStatus({ run, sourceCount }: { run: CollectorRun | null; sourceCount: number }) {
  return <section className="collector-status"><div><span className="eyebrow">오늘남원이 확인한 남원시 정보</span><strong>{run?.total ?? 0}건 확인</strong></div><dl><div><dt>정보원</dt><dd>{sourceCount}개</dd></div><div><dt>최근 수집</dt><dd>{run?.finished_at ? formatDateTime(run.finished_at) : "아직 없음"}</dd></div></dl></section>;
}
