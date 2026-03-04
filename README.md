<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/baby.svg" width="80" alt="Chianote Logo" />
  <h1>✨ Chianote (치아노트) ✨</h1>
  <p><strong>우리가족 치아노트 — 우리 아이를 위한 맞춤형 치아 건강 관리 서비스</strong></p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-15.x-black?style=for-the-badge&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Prisma-7.4-2D3748?style=for-the-badge&logo=prisma" alt="Prisma" />
    <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase" alt="Supabase" />
    <img src="https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel" alt="Vercel" />
  </p>
</div>

<br />

## 🦷 프로젝트 소개 (Introduction)

**Chianote(치아노트)**는 부모님이 자녀의 유치 및 영구치 성장 과정을 손쉽게 기록하고 관리할 수 있도록 돕는 프리미엄 덴탈 케어 웹 어플리케이션입니다.
국제 치과 기준인 **FDI 표기법(Two-Digit System)**을 적용한 다이내믹 2D/3D 치아 지도(Dental Chart)를 통해 아이의 충치나 치료 상태를 시각적으로 한눈에 파악할 수 있으며, 양치 타이머와 포인트 시스템을 도입하여 아이들의 건강한 양치 습관 형성을 돕습니다.

<br />

## ✨ 주요 기능 (Key Features)

- 🗺️ **인터랙티브 치아 지도 (Dental Chart)**: FDI 표기법 기반의 UI로 영구치와 유치의 상태(정상, 충치, 치료 완료, 발치)를 직관적인 컬러와 아이콘으로 관리.
- 🍼 **구강 성장 리포트 (Age Growth Report)**: 월령/연령에 따른 평균 충치 경험 지수 차트 제공 및 다가오는 영구치 맹출 시기 예측.
- ⏰ **게이미피케이션 양치 타이머 (Brushing Timer)**: 3분 양치 타이머와 시각적인 프리미엄 애니메이션 제공. 양치 성공 시 포인트(보상) 획득 구조.
- 📅 **치과 진료 기록 (Dental History)**: 치과 방문 날짜, 상세 메모 및 처방 기록을 타임라인 UI로 통합 관리.
- 🔐 **멀티 프로필 관리 (Multi-Profile Support)**: 한 계정으로 여러 명의 자녀(형제/자매) 프로필을 독립적으로 생성 및 전환 가능.
- 📱 **PWA (Progressive Web App)**: 모바일 및 데스크탑 환경에서 앱처럼 설치하여 빠르고 쾌적하게 접근 가능.

<br />

## 🚀 특별한 아키텍처 (Architecture Highlights)

이 프로젝트는 최신 모던 웹 스택의 도입과 Vercel 배포 환경 최적화에 중점을 두었습니다.

- **Prisma V7 호환성 100% 최적화 & Serverless 지연 초기화 패턴**:
  - `prisma.config.ts`를 사용한 명시적인 Datasource 주입 방식 적용.
  - Vercel의 빌드 타임 사전 렌더링(Static Generation) 시 발생하는 DB 연결 에러를 방지하기 위해 `Proxy` 패턴을 활용한 `PrismaClient` 지연 초기화(Lazy Loading) 및 API 라우트 `force-dynamic` 렌더링을 선제적으로 구현했습니다.
- **Supabase Transaction/Session Pooler 대응**: 환경 변수 분리를 통해 빠르고 안정적인 PostgreSQL 엣지 연결을 제공합니다.

<br />

## 💻 로컬 설치 및 실행 방법 (Getting Started)

### 1. Repository 클론 및 의존성 설치
```bash
git clone https://github.com/your-username/chianote.git
cd chianote
npm install
```

### 2. 환경 변수 설정
프로젝트 루트 경로에 `.env` 파일을 생성하고 Supabase에서 발급받은 데이터베이스 주소를 입력합니다. (Auth Secret 포함)

```env
# .env
DATABASE_URL="postgresql://postgres.[ProjectRef]:[Password]@aws-0-[Region].pooler.supabase.com:6543/postgres"
AUTH_SECRET="your-next-auth-secret-key-min-32-chars"
```

### 3. 데이터베이스 마이그레이션 (Prisma 7 Edge 구성)
```bash
npm run postinstall # npx prisma generate
npx prisma db push
npx prisma db seed # (옵션) 테스트용 더미 데이터 삽입
```

### 4. 개발 서버 실행
```bash
npm run dev
```
브라우저에서 `http://localhost:3000` 으로 접속하여 Chianote를 시작하세요!

### 5. 초기 관리자 로그인 (Auto-Seed)
현재 Chianote는 별도의 공개 회원가입 폼을 제공하지 않는 프라이빗 서비스 구조입니다. 
처음 데이터베이스 마이그레이션을 마친 후, 로그인 화면에서 다음 기본 자격 증명을 입력하면 **자동으로 초기 관리자 계정이 생성되며 로그인**됩니다.

- **이메일**: `admin@chianote.com`
- **비밀번호**: `admin123`

*(보안을 위해 로그인 성공 후 즉시 계정 정보를 변경하시는 것을 권장합니다.)*

<br />

## 📜 라이선스 (License)

이 프로젝트는 [MIT 라이선스](LICENSE)를 따릅니다.
