# 오늘남원

> 나에게 필요한 남원시 소식만

남원시청 6개 행정정보 게시판을 안정적으로 수집하고, 시민이 모바일에서 쉽게 확인할 수 있도록 보여주는 서비스입니다. 원문 데이터와 AI 가공 데이터는 분리하며, 현재 버전에는 로그인·알림이 없습니다.

## 기술 스택

- Next.js 16 App Router, React 19, TypeScript
- Tailwind CSS 4 및 반응형 CSS
- Supabase PostgreSQL, Supabase JavaScript SDK
- Node.js `fetch`, Cheerio 수집기
- Node Test Runner 기반 fixture/DB 동기화 테스트

## 구현된 기능

- `/`: 최신 데이터를 정보원별로 섞은 주요 소식, 실제 collector 실행 현황
- `/news`: 30개 실제 행정정보 목록 및 6개 정보원 필터
- `/news/[id]`: 본문, 담당부서, 전화, 공연 정보, 첨부파일, 남원시 원문 링크
- `/settings`: 관심지역·관심분야 localStorage 저장
- 모바일 하단 내비게이션과 375/768/1280px 반응형 레이아웃
- 로딩, 오류, 빈 데이터, 404 상태
- 공지사항·읍면동소식·공연행사·시험채용·고시공고·보도자료 수집
- NEW/UPDATED/UNCHANGED 판별 및 Supabase upsert
- 신규·수정 게시물의 AI 핵심요약 및 핵심 포인트 생성

## 환경변수

```bash
cp .env.example .env.local
```

웹 읽기용 변수:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
# 레거시 anon key를 쓰는 프로젝트라면 아래 변수 사용
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

수집 CLI 전용 변수는 `.env`에 두며 브라우저 코드로 전달하지 않습니다.

```dotenv
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
# 선택사항 (기본값: gpt-5-nano)
OPENAI_SUMMARY_MODEL=
```

`.env`, `.env.local`, service role/secret key는 절대 Git에 커밋하지 않습니다. `NEXT_PUBLIC_*`에는 공개 가능한 publishable/anon key만 사용합니다.

## 로컬 실행

```bash
npm install
npm run dev
```

기본 주소는 [http://localhost:3000](http://localhost:3000)입니다. 3000번이 이미 사용 중이면 Next.js가 다음 빈 포트를 안내합니다.

Production 확인:

```bash
npm run build
npm start
```

## GitHub Pages 배포

`main` 브랜치에 push하면 GitHub Actions가 정적 사이트를 빌드해 Pages에 배포합니다. 저장소 Actions secret에 `NEXT_PUBLIC_SUPABASE_URL`과 `NEXT_PUBLIC_SUPABASE_ANON_KEY`가 필요합니다.

GitHub Pages에는 서버 런타임이 없으므로 배포 시점의 Supabase 데이터를 정적 HTML로 생성합니다. 수집 후 최신 데이터를 사이트에 반영하려면 `Deploy 오늘남원 to GitHub Pages` workflow를 다시 실행합니다. 수집기의 service role key는 Pages에 등록하거나 노출하지 않습니다.

## 자동 수집

`Collect 남원시 소식` workflow가 평일 한국시간 09:10, 12:10, 15:10, 18:10에 실행됩니다. 수집 결과를 Supabase에 저장한 뒤, 수집이 모두 성공한 경우에만 Pages를 다시 빌드하고 배포합니다. GitHub Actions 화면의 `Run workflow`로 수동 실행할 수도 있습니다.

저장소 Actions secrets에는 다음 값을 등록해야 합니다.

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
OPENAI_API_KEY
```

`SUPABASE_SERVICE_ROLE_KEY`는 수집 workflow에만 전달되며 Pages 빌드나 브라우저 번들에는 전달되지 않습니다. 일부 게시물이라도 수집 또는 저장에 실패하면 workflow가 실패하고, 이전에 정상 배포된 Pages는 그대로 유지됩니다.

## 수집기 실행

DB 저장 없이 JSON 수집:

```bash
npm run crawl
```

Supabase 저장 및 사람이 읽는 요약:

```bash
npm run collect
```

JSON 결과만 출력:

```bash
npm run collect:json
```

아직 요약되지 않았거나 원문이 변경된 게시물 요약:

```bash
npm run summarize
```

## DB migration

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

Migration은 `supabase/migrations/`에서 관리합니다. 원본 테이블은 `sources`, `articles`, `attachments`, `collector_runs`이며, 공개 웹에는 anon SELECT만 허용합니다. 쓰기는 서버 수집기의 service role만 담당합니다.

## 품질검사

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## 주요 구조

```text
src/app/                 Next.js 페이지와 상태 UI
src/components/          재사용 웹 컴포넌트
src/lib/                 웹 데이터 조회·추천 규칙·표시 형식
src/config/              6개 수집 정보원 설정
src/http/                안정적인 순차 HTTP client
src/parsers/             Cheerio parser
src/db/                  Supabase repository와 동기화 서비스
supabase/migrations/     재현 가능한 PostgreSQL schema/RLS
test/fixtures/           네트워크 없는 parser fixture
test/                    parser 및 DB 동기화 테스트
```

## 향후 구현 예정

- 관심정보 기반 개인화 추천
- 사용자 로그인과 기기간 관심정보 동기화
- 신규 중요소식 알림
- 첨부파일 내용 분석

AI 기능은 현재 상세페이지에 자리만 준비되어 있으며 가짜 AI 데이터를 저장하지 않습니다.
