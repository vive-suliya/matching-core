import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-[#030014]">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[128px] pointer-events-none" />

      {/* Hero Section */}
      <main className="z-10 container mx-auto px-4 py-20 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border border-white/10 mb-8 animate-fade-in-up">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-xs font-medium text-gray-300 tracking-wide uppercase">System Operational</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-white drop-shadow-lg">
          <span className="text-gradient">Matching Core</span>
          <br />
          <span className="text-3xl md:text-5xl text-gray-400 font-normal">Universal Connection Engine</span>
        </h1>

        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-10 leading-relaxed">
          User vs User, Team vs Team. <br />
          모든 플랫폼을 위한 강력하고 유연한 매칭 시스템의 표준을 제시합니다.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link
            href="/playground"
            className="group relative px-8 py-4 bg-white text-black rounded-lg font-bold text-lg overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]"
          >
            <span className="relative z-10 flex items-center gap-2">
              Playground 시작하기
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
            </span>
          </Link>
          <Link
            href="/docs"
            className="px-8 py-4 glass text-white rounded-lg font-bold text-lg border border-white/10 hover:bg-white/10 transition-all hover:scale-105"
          >
            API 개발 문서
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 w-full max-w-6xl">
          <FeatureCard
            icon="⚡"
            title="Fast & Scalable"
            desc="Redis 기반의 초고속 캐싱과 NestJS 아키텍처로 대규모 트래픽을 안정적으로 처리합니다."
          />
          <FeatureCard
            icon="🎯"
            title="Precise Matching"
            desc="위치, 선호도, 스킬 등 다차원 데이터를 분석하여 최적의 상대를 찾아냅니다."
          />
          <FeatureCard
            icon="🛠️"
            title="Easy Integration"
            desc="어떤 플랫폼이든 REST API 한 줄로 강력한 매칭 시스템을 도입할 수 있습니다."
          />
        </div>
      </main>

      <footer className="w-full text-center py-8 text-gray-600 text-sm z-10">
        © 2025 Matching Core. Powered by Antigravity & Claude.
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="glass-card p-8 rounded-2xl text-left hover:border-purple-500/30">
      <div className="text-4xl mb-4 bg-gradient-to-br from-purple-500 to-indigo-500 w-12 h-12 flex items-center justify-center rounded-lg bg-clip-text text-transparent">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
