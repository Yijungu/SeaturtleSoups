# SeaTurtleSoups

AI 기반 “바다거북수프” (Lateral Thinking Puzzle) 게임 프로젝트의 모노레포입니다.

---

## 📚 프로젝트 소개

SeaTurtleSoups는 사용자가 매일 새로운 스토리를 바탕으로 질문하고 답을 제출하며 추리하는 “바다거북수프” 게임입니다.  
서버는 PostgreSQL에 스토리와 사용자 응답을 저장하고, OpenAI API를 호출하여 질문/답변의 적절성을 판별합니다.

---

## 📁 저장소 구조

```
SeaTurtleSoups/
├── README.md (이 문서)
├── turtle-backend/ Rust 기반 API 서버
├── turtle-frontend/ Next.js 프론트엔드
└── openai_test/ OpenAI 프롬프트 테스트용 CLI
```


| 폴더명             | 설명                                               |
| ------------------ | -------------------------------------------------- |
| `turtle-backend`    | Rust + Actix Web 기반 REST API 서버               |
| `turtle-frontend`   | Next.js 14 프론트엔드 (TypeScript + TailwindCSS)  |
| `openai_test`       | OpenAI 프롬프트 테스트용 Rust CLI 도구            |

---

## 🐢 Backend (`turtle-backend`)

- **Actix Web** 사용 (CORS 활성화)
- `RUST_ENV` 환경변수에 따라 `.env.local` 또는 `.env.production` 로드
- **PostgreSQL** 데이터베이스 연결 (sqlx 사용)
- DB 마이그레이션: `turtle-backend/migrations/`
- **OpenAI API 키**: AWS Secrets Manager (`OPENAI_API_KEY`) 사용
- **JWT 기반 인증**: 네이버 로그인 지원
- **백그라운드 작업**: 매일 스토리 자동 갱신 및 배경 정보 수집

### 📌 주요 라우트 (`src/routes/`)

| 라우트              | 설명                                     |
| ------------------- | ---------------------------------------- |
| 스토리 CRUD         | 매일의 이야기 조회, 힌트 제공            |
| OpenAI 연동         | 질문/답변 판별 요청                      |
| 평점/불만 접수      | 사용자 평가, 피드백 제출                 |
| 인증                | JWT 기반 로그인                          |
| 헬스체크 `/`        | 서비스 상태 확인                         |

- 서버 진입점: `src/main.rs`
- OpenAI 응답을 DB에 배치 저장하는 작업 포함

---

## 🌐 Frontend (`turtle-frontend`)

- **Next.js 14**
- **TypeScript**
- **TailwindCSS**
- **Axios** 기반 API 호출 (`NEXT_PUBLIC_API_URL` 환경변수, 기본값: `http://localhost:8080`)
- **로컬 스토리지**: 스토리 데이터 캐시로 반복 API 호출 최소화

### 📌 주요 페이지

| 경로        | 설명                           |
| ----------- | ------------------------------ |
| `/problem`  | 메인 게임 화면 (질문/답변)     |
| `/thanks`   | 문제 해결 후 평가/피드백 화면  |

---

## 🛠 CLI Prompt Tester (`openai_test`)

- 별도의 Rust CLI 애플리케이션
- `openai_test/story_data*.txt` 파일에서 스토리와 프롬프트 목록 로드
- OpenAI에 테스트 요청 후 성공/실패 결과 출력
- 신규 스토리 또는 프롬프트 변경 시 유용

---

## 🗄 데이터베이스 스키마

초기 마이그레이션(`20241014073117_init_schema.sql`)에서는 다음 테이블을 생성합니다:

| 테이블명     | 설명                              |
| ----------- | --------------------------------- |
| `stories`    | 매일의 문제, 힌트, 평점 정보      |
| `responses`  | OpenAI 응답 로그                  |
| `complaints` | 사용자 피드백 및 불만 접수        |

---

## 🚀 시작하기

### ✅ 필수 요구사항

- Rust Toolchain
- Node.js
- PostgreSQL
- AWS Secrets Manager (`OPENAI_API_KEY` 등록 필수)

---

### 🖥 Backend 실행 방법

```bash
cd turtle-backend
# .env.local 또는 .env.production에 DATABASE_URL, JWT_SECRET 등 설정
cargo run
```

### 🖥 Frontend 실행 방법

```bash
cd turtle-frontend
npm install
npm run dev
```
---
필요한 경우 자유롭게 수정하거나 문의 주세요!
