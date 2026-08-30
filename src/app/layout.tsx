import type { Metadata } from "next";
import { BottomNavigation } from "@/components/bottom-navigation";
import "./globals.css";
export const metadata: Metadata = { title: { default: "오늘남원", template: "%s | 오늘남원" }, description: "나에게 필요한 남원시 소식만" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko" suppressHydrationWarning><body><div className="app-shell">{children}</div><BottomNavigation/></body></html>;
}
