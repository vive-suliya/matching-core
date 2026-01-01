
'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const cards = document.querySelectorAll('.bento-card');
      cards.forEach((card) => {
        const rect = (card as HTMLElement).getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        (card as HTMLElement).style.setProperty('--mouse-x', `${x}px`);
        (card as HTMLElement).style.setProperty('--mouse-y', `${y}px`);
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="bg-[#02000d] text-white selection:bg-purple-500/30 overflow-x-hidden transition-opacity duration-1000">

      {/* Hero Section - Solid 100vh for a clean first view */}
      <section className="relative px-8 flex flex-col items-center justify-center h-screen text-center z-10 overflow-hidden bg-gradient-to-b from-[#050510] via-[#02000d] to-[#08081a]">
        {/* Intense Radial Glows for Deep Space Feel */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-indigo-500/15 blur-[160px] rounded-full pointer-events-none"></div>

        <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/[0.03] border border-white/10 mb-8 animate-fade-in-up shadow-2xl backdrop-blur-md relative z-10">
          <div className="flex -space-x-2">
            {[1, 2, 3].map(i => (
              <div key={i} className={`w-5 h-5 rounded-full border-2 border-[#02000d] ${i === 1 ? 'bg-purple-500' : i === 2 ? 'bg-indigo-500' : 'bg-blue-500'}`} />
            ))}
          </div>
          <span className="text-[10px] font-black tracking-[0.25em] text-gray-400 uppercase">200명 이상의 개발자가 선택한 엔진</span>
        </div>

        <h1 className="text-[clamp(2.5rem,10vw,7.5rem)] font-black tracking-tighter mb-8 leading-[0.85] text-white relative z-10 transition-all duration-700">
          Matching<br />
          <span className="text-gradient italic">Engine.</span>
        </h1>

        <p className="text-base md:text-lg text-gray-400 max-w-2xl mb-12 font-medium leading-relaxed opacity-70 relative z-10">
          가장 직관적인 인터페이스로 고도화된 매칭 시스템을 경험하고<br className="hidden md:block" />
          당신의 비즈니스에 최적화된 로직을 실시간으로 핸들링하세요.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 w-full max-w-md justify-center animate-slide-up relative z-10" style={{ animationDelay: '0.4s' }}>
          <Link
            href="/playground"
            className="flex-1 py-4.5 bg-white text-black rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:scale-105 hover:shadow-[0_20px_40px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3 active:scale-95 shadow-2xl shadow-white/10"
          >
            시작하기
          </Link>
          <Link
            href="/docs"
            className="flex-1 py-4.5 bg-white/5 backdrop-blur-md text-white border border-white/10 rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:bg-white/10 hover:scale-105 flex items-center justify-center gap-3"
          >
            API 문서
          </Link>
        </div>

        {/* Seamless Glow Transition at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#050510] to-transparent z-20"></div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent rounded-full blur-sm opacity-50"></div>
      </section>

      {/* Features Grid - Starts with a subtle dark backdrop to bridge the transition */}
      <section id="advantages" className="py-40 px-8 relative z-10 bg-[#050510]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[300px]">

            {/* Huge Featured Card */}
            <div className="md:col-span-8 md:row-span-2 bento-card p-12 flex flex-col justify-end group overflow-hidden">
              <div className="absolute inset-0 z-0">
                <img
                  src="/images/advantage-spatial.jpg"
                  className="w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-all duration-1000 scale-110 group-hover:scale-100 mix-blend-luminosity group-hover:mix-blend-normal"
                  alt="Spatial Navigation"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050510] via-[#050510]/60 to-transparent"></div>
              </div>
              <div className="max-w-md relative z-10">
                <h3 className="text-4xl font-black mb-6 tracking-tighter text-white">PostGIS Powered Navigation</h3>
                <p className="text-gray-400 font-medium leading-relaxed">
                  반경 내 검색을 단순 거리가 아닌 고수준 구면 좌표계 연산으로 처리합니다.
                  수천 건의 데이터를 밀리초 단위로 정확하게 매칭하는 하이엔드 공간 엔진입니다.
                </p>
              </div>
            </div>

            {/* Small Card 1 - Hybrid */}
            <div className="md:col-span-4 bento-card overflow-hidden group">
              <img
                src="/images/advantage-hybrid.jpg"
                className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-40 transition-all duration-1000 scale-125 group-hover:scale-110"
                alt="Hybrid Scoring"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#050510]"></div>
              <div className="relative z-10 p-10 h-full flex flex-col justify-between">
                <div className="text-4xl transition-transform group-hover:rotate-12 duration-500">🧠</div>
                <div>
                  <h4 className="text-lg font-black mb-2 text-white/90 uppercase tracking-tighter">Hybrid Scoring</h4>
                  <p className="text-sm text-gray-500 leading-relaxed font-semibold">거리와 성향의 완벽한 밸런스.</p>
                </div>
              </div>
            </div>

            {/* Small Card 2 - Universal */}
            <div className="md:col-span-4 bento-card overflow-hidden group">
              <img
                src="/images/advantage-universal.jpg"
                className="absolute inset-0 w-full h-full object-cover opacity-10 group-hover:opacity-30 transition-all duration-1000 scale-150 group-hover:scale-125"
                alt="Universal Interface"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050510] to-transparent"></div>
              <div className="relative z-10 p-10 h-full flex flex-col justify-between">
                <div className="text-4xl transition-transform group-hover:scale-110 duration-500">♾️</div>
                <div>
                  <h4 className="text-lg font-black mb-2 text-white/90 uppercase tracking-tighter">Universal Interface</h4>
                  <p className="text-sm text-gray-500 leading-relaxed font-semibold">어떤 엔티티든 즉시 연동 가능.</p>
                </div>
              </div>
            </div>

            {/* Medium Card 1 - High Performance */}
            <div className="md:col-span-6 bento-card group overflow-hidden">
              <img
                src="/images/advantage-core.jpg"
                className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-40 transition-all duration-1000 scale-110 group-hover:scale-100"
                alt="High Performance"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#050510] via-[#050510]/40 to-transparent"></div>
              <div className="relative z-10 p-12 h-full flex flex-col justify-center">
                <h4 className="text-2xl font-black mb-4 text-white uppercase tracking-tighter flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                  High Performance
                </h4>
                <p className="text-gray-400 font-medium leading-relaxed max-w-sm">
                  NestJS와 Redis 기반의 아키텍처로 대규모 동시 요청을 안정적으로 처리하며 응답 지연을 최소화했습니다.
                </p>
              </div>
            </div>

            {/* Medium Card 2 - DX */}
            <div className="md:col-span-6 bento-card overflow-hidden group">
              <img
                src="/images/advantage-dx.jpg"
                className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-40 transition-all duration-1000 scale-110 group-hover:scale-100"
                alt="Developer Experience"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-[#050510] via-[#050510]/40 to-transparent"></div>
              <div className="relative z-10 p-12 h-full flex flex-col justify-center">
                <h4 className="text-2xl font-black mb-4 text-white uppercase tracking-tighter group-hover:text-purple-400 transition-colors">Developer Experience</h4>
                <p className="text-gray-400 font-medium leading-relaxed max-w-sm">
                  직관적인 API와 인터랙티브 문서를 제공합니다.
                  코드 한 줄로 비즈니스 모델에 매칭 기술력을 더하세요.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section - More Trendy style */}
      <section id="how-it-works" className="py-40 px-8 relative z-10 bg-[#02000d]">
        <div className="max-w-7xl mx-auto border border-white/5 rounded-[4rem] p-12 md:p-24 bg-white/[0.01] backdrop-blur-3xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-indigo-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
          <div className="flex flex-col lg:flex-row gap-24 items-center relative z-10">
            <div className="lg:w-1/2 space-y-12">
              <div className="space-y-4">
                <h2 className="text-xs font-black tracking-[0.4em] text-indigo-500 uppercase">Architecture</h2>
                <h3 className="text-5xl md:text-6xl font-black tracking-tighter text-white uppercase">How it flows.</h3>
              </div>

              <div className="space-y-16">
                {[
                  { step: '01', title: 'Data Ingestion', desc: 'PostGIS 데이터베이스에 지리적 위치와 카테고리를 동기화합니다.' },
                  { step: '02', title: 'Strategy Setup', desc: '비즈니스 모델에 맞는 가중치와 매칭 전략을 구성합니다.' },
                  { step: '03', title: 'Live Ranking', desc: '실시간 가중치 합산 랭킹과 상세 매칭 리포트를 수신합니다.' }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-10 group/item">
                    <div className="text-4xl font-black text-white/5 group-hover/item:text-indigo-500/20 transition-all duration-500 italic">{item.step}</div>
                    <div className="space-y-3">
                      <h4 className="text-2xl font-black text-white uppercase tracking-tighter">{item.title}</h4>
                      <p className="text-gray-500 font-medium leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:w-1/2 w-full relative">
              <div className="absolute -inset-10 bg-indigo-500/20 rounded-full blur-[100px] opacity-20 animate-pulse"></div>
              <pre className="relative p-10 rounded-[3rem] bg-black/80 border border-white/10 text-[13px] font-mono leading-relaxed shadow-3xl text-indigo-300/80 overflow-x-auto">
                <code className="block">
                  <span className="text-purple-400">async</span> <span className="text-blue-400">processMatching</span>(requestId) &#123; <br />
                  &nbsp;&nbsp;<span className="text-gray-500">// 1. Parallel Fetching</span><br />
                  &nbsp;&nbsp;<span className="text-purple-400">const</span> [req, candidates] = <span className="text-purple-400">await</span> Promise.all([<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;this.getEntity(), this.getCandidates()<br />
                  &nbsp;&nbsp;]);<br /><br />
                  &nbsp;&nbsp;<span className="text-gray-500">// 2. Dynamic Strategy Execution</span><br />
                  &nbsp;&nbsp;<span className="text-purple-400">const</span> results = <span className="text-blue-400">strategy</span>.execute(req, candidates);<br /><br />
                  &nbsp;&nbsp;<span className="text-gray-500">// 3. Hybrid Ranking (Distance + Preference)</span><br />
                  &nbsp;&nbsp;<span className="text-purple-400">return</span> results.sort((a,b) =&gt; b.score - a.score);<br />
                  &#125;
                </code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-60 px-8 text-center relative z-10">
        <div className="max-w-4xl mx-auto space-y-16">
          <div className="space-y-6">
            <h2 className="text-xs font-black tracking-[0.5em] text-indigo-500 uppercase animate-pulse">Ultimate Control</h2>
            <h3 className="text-5xl md:text-8xl font-black tracking-tighter text-white uppercase leading-[0.9]">
              매칭 시스템의 모든 권한을<br />
              <span className="text-gradient">직접 핸들링하세요.</span>
            </h3>
            <p className="text-gray-500 font-bold text-lg">복잡한 로직 설계부터 실시간 시뮬레이션까지, 지금 바로 매칭 엔진을 경험해보세요.</p>
          </div>

          <Link
            href="/playground"
            className="inline-flex px-16 py-8 bg-white text-black rounded-full font-black text-xl tracking-tighter uppercase transition-all hover:scale-110 hover:shadow-[0_0_80px_rgba(255,255,255,0.2)] active:scale-95 shadow-2xl"
          >
            Launch Playground
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-8 border-t border-white/5 bg-black/40 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-black text-sm">M</div>
              <span className="font-black text-lg tracking-tighter uppercase whitespace-nowrap">Matching Core</span>
            </div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-[0.3em]">Protocol for the Next Web</p>
          </div>
          <div className="flex gap-12 text-xs font-black text-gray-400 uppercase tracking-widest">
            <Link href="/playground" className="hover:text-white transition-colors">App</Link>
            <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
            <Link href="https://github.com" className="hover:text-white transition-colors">GitHub</Link>
          </div>
          <p className="text-[10px] text-gray-600 font-black tracking-tighter">© 2026 ALPHA PROJECT. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>
    </div>
  );
}
