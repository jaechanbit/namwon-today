"use client";
import { useEffect, useState } from "react";
const regions = ["남원시 전체","운봉읍","주천면","수지면","송동면","주생면","금지면","대강면","대산면","사매면","덕과면","보절면","산동면","이백면","인월면","아영면","산내면","동충동","죽항동","노암동","금동","왕정동","향교동","도통동"];
const topics = ["지원금·혜택","육아·교육","모집·교육","농업","교통","행사","채용","안전·재난"];
const storageKey = "today-namwon-preferences";
export function PreferenceForm() {
  const [selectedRegions, setSelectedRegions] = useState<string[]>(["남원시 전체"]); const [selectedTopics, setSelectedTopics] = useState<string[]>([]); const [saved, setSaved] = useState(false);
  useEffect(() => { const frame = window.requestAnimationFrame(() => { try { const value = localStorage.getItem(storageKey); if (value) { const parsed = JSON.parse(value) as { regions?: string[]; topics?: string[] }; setSelectedRegions(parsed.regions ?? ["남원시 전체"]); setSelectedTopics(parsed.topics ?? []); } } catch {} }); return () => window.cancelAnimationFrame(frame); }, []);
  const toggle = (value: string, selected: string[], update: (items: string[]) => void) => update(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]);
  const save = () => { localStorage.setItem(storageKey, JSON.stringify({ regions: selectedRegions, topics: selectedTopics })); setSaved(true); window.setTimeout(() => setSaved(false), 2200); };
  return <div className="preference-form"><section><div className="preference-heading"><span>01</span><div><h2>관심지역</h2><p>여러 지역을 선택할 수 있어요.</p></div></div><div className="choice-grid regions">{regions.map((region) => <button type="button" key={region} className={selectedRegions.includes(region) ? "selected" : ""} onClick={() => toggle(region, selectedRegions, setSelectedRegions)}>{region}</button>)}</div></section><section><div className="preference-heading"><span>02</span><div><h2>관심분야</h2><p>놓치고 싶지 않은 분야를 골라주세요.</p></div></div><div className="choice-grid">{topics.map((topic) => <button type="button" key={topic} className={selectedTopics.includes(topic) ? "selected" : ""} onClick={() => toggle(topic, selectedTopics, setSelectedTopics)}>{topic}</button>)}</div></section><button type="button" className="save-button" onClick={save}>{saved ? "저장했어요 ✓" : "관심정보 저장"}</button><p className="privacy-note">로그인 없이 이 브라우저에만 저장됩니다.</p></div>;
}
