import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
export default function NotFound() { return <main className="page centered-page"><EmptyState title="소식을 찾을 수 없습니다." description="삭제되었거나 주소가 변경되었을 수 있어요."/><Link href="/news" className="primary-button">전체소식으로 돌아가기</Link></main>; }
