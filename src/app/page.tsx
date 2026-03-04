import Link from 'next/link';
import { ShieldAlert, ShieldCheck, Stethoscope } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-blue-50/50 flex flex-col items-center justify-center p-6 pb-20 gap-8 sm:p-14 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center text-center max-w-md w-full">
        <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-4">
          <div className="relative">
            <ShieldCheck className="w-12 h-12 text-blue-500" />
            <Stethoscope className="w-6 h-6 text-blue-400 absolute -bottom-1 -right-2 bg-white rounded-full p-0.5" />
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-2">치아노트</h1>
          <p className="text-gray-500 font-medium">우리아이 평생 구강건강의 시작</p>
        </div>

        <div className="w-full bg-white p-6 rounded-3xl shadow-sm text-left flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold">1</div>
            <p className="text-sm font-medium text-gray-700">시각적인 <span className="text-blue-500 font-bold">치아 지도</span>로 쉽게 기록하세요</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold">2</div>
            <p className="text-sm font-medium text-gray-700">연령별 <span className="text-blue-500 font-bold">맞춤형 성장 리포트</span>를 받아보세요</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold">3</div>
            <p className="text-sm font-medium text-gray-700">치과 <span className="text-blue-500 font-bold">진료 이력과 사진</span>을 안전하게 보관하세요</p>
          </div>
        </div>

        <div className="flex gap-4 items-center flex-col sm:flex-row w-full mt-4">
          <Link
            className="rounded-full shadow-md shadow-blue-500/20 border border-solid border-transparent transition-all hover:scale-105 hover:bg-blue-600 flex items-center justify-center bg-blue-500 text-white gap-2 font-bold text-sm h-14 px-8 w-full"
            href="/dashboard"
          >
            시작하기
          </Link>
        </div>
      </main>

      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center text-xs text-gray-400 font-medium">
        <p>© 2026 Chianote. All rights reserved.</p>
        <p>의료법 및 개인정보보호법 준수</p>
      </footer>
    </div>
  );
}
