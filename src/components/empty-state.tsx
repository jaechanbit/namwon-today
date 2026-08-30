export function EmptyState({ title = "아직 수집된 남원시 소식이 없습니다.", description = "새 소식이 들어오면 이곳에 바로 보여드릴게요." }: { title?: string; description?: string }) {
  return <div className="empty-state"><span>남</span><h2>{title}</h2><p>{description}</p></div>;
}
