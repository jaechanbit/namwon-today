"use client";
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <main className="page centered-page"><div className="error-symbol">!</div><h1>소식을 불러오지 못했어요.</h1><p>잠시 후 다시 시도해 주세요.</p><button type="button" className="primary-button" onClick={reset}>다시 불러오기</button></main>; }
