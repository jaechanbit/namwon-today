import type { Metadata } from "next";
import { Header } from "@/components/header";
import { PreferenceForm } from "@/components/preference-form";
export const metadata: Metadata = { title: "관심정보" };
export default function SettingsPage() { return <><Header compact/><main className="page settings-page"><div className="page-title"><span className="eyebrow">MY NAMWON</span><h1>관심정보</h1><p>내게 필요한 지역과 분야를 골라두세요.<br/>이 기기의 브라우저에만 안전하게 저장됩니다.</p></div><PreferenceForm/></main></>; }
