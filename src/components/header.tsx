import Link from "next/link";
export function Header({ compact = false }: { compact?: boolean }) {
  return <header className={`site-header ${compact ? "compact" : ""}`}><Link href="/" className="brand"><span className="brand-mark">오</span><span>오늘남원</span></Link>{!compact && <span className="tagline">나에게 필요한 남원시 소식만</span>}</header>;
}
