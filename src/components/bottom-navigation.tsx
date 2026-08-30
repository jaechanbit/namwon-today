"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, NewsIcon, SettingsIcon } from "@/components/icons";
const items = [{ href: "/", label: "오늘", icon: HomeIcon }, { href: "/news", label: "전체소식", icon: NewsIcon }, { href: "/settings", label: "관심정보", icon: SettingsIcon }];
export function BottomNavigation() {
  const pathname = usePathname();
  return <nav className="bottom-nav" aria-label="주요 메뉴"><div className="bottom-nav-inner">{items.map((item) => {
    const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href); const ItemIcon = item.icon;
    return <Link key={item.href} href={item.href} className={`nav-item ${active ? "active" : ""}`} aria-current={active ? "page" : undefined}><ItemIcon className="nav-icon"/><span>{item.label}</span></Link>;
  })}</div></nav>;
}
