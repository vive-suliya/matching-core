
'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { Layers, Zap, Network, Code2, ArrowRight, Database, Cpu } from 'lucide-react';

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
    <div className="bg-[#030305] text-white selection:bg-indigo-500/30 overflow-x-hidden min-h-screen font-sans">

      {/* Background Grid - Engineering Feel */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20"
        style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      {/* Hero Section */}
      <section className="relative px-6 pt-32 pb-40 flex flex-col items-center justify-center min-h-[90vh] text-center z-10">

        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none animate-pulse"></div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm hover:bg-white/10 transition-colors cursor-default">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-xs font-mono text-gray-400 tracking-wider">v2.1 STABLE RELEASE</span>
        </div>

        <h1 className="text-5xl md:text-8xl font-black tracking-tight mb-8 leading-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 relative z-10 pb-2">
          Universal<br />
          Matching Kernel
        </h1>

        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-12 leading-relaxed relative z-10 break-keep">
          <span className="text-white font-semibold">"서비스를 위한 서비스"</span><br />
          팀 빌딩부터 데이팅 앱까지, 모든 연결을 위한 코어 엔진.<br />
          매칭의 바퀴를 다시 발명하지 마세요. 가져다 쓰세요.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center relative z-10">
          <Link
            href="/playground"
            className="group flex-1 py-4 bg-white text-black rounded-xl font-bold text-sm uppercase tracking-wide transition-all hover:bg-indigo-50 hover:text-white hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            Run Demo <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/docs"
            className="flex-1 py-4 bg-white/5 backdrop-blur-sm text-white border border-white/10 rounded-xl font-bold text-sm uppercase tracking-wide transition-all hover:bg-white/10 hover:border-white/20 flex items-center justify-center gap-2"
          >
            <Code2 className="w-4 h-4" /> API Docs
          </Link>
        </div>
      </section>

      {/* Conceptual Architecture - Clear & Simple */}
      <section className="py-24 px-6 relative z-10 border-y border-white/5 bg-[#030305]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 opacity-80">
            {/* User App */}
            <div className="flex flex-col items-center gap-4 group">
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center shadow-lg group-hover:-translate-y-2 transition-transform duration-500">
                <span className="text-2xl font-black text-gray-500 group-hover:text-white transition-colors">Your App</span>
              </div>
              <p className="text-sm text-gray-500 font-mono">Frontend / Client</p>
            </div>

            {/* Connection Lines */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex gap-1 animate-pulse">
                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                <div className="w-2 h-2 rounded-full bg-indigo-500 delay-75"></div>
                <div className="w-2 h-2 rounded-full bg-indigo-500 delay-150"></div>
              </div>
              <span className="text-xs font-mono text-indigo-400">REST API / JWT</span>
            </div>

            {/* Matching Engine */}
            <div className="flex flex-col items-center gap-4 group relative">
              <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="w-40 h-40 rounded-3xl bg-gradient-to-br from-indigo-900 to-black border border-indigo-500/30 flex items-center justify-center shadow-2xl relative z-10 group-hover:scale-105 transition-transform duration-500">
                <div className="text-center">
                  <Cpu className="w-12 h-12 mx-auto mb-2 text-indigo-400" />
                  <span className="text-xl font-black text-indigo-100">Core Engine</span>
                </div>
              </div>
              <p className="text-sm text-indigo-400 font-mono font-bold">Matching Kernel</p>
            </div>

            {/* Connection Lines */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex gap-1 animate-pulse">
                <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                <div className="w-2 h-2 rounded-full bg-gray-600 delay-75"></div>
                <div className="w-2 h-2 rounded-full bg-gray-600 delay-150"></div>
              </div>
              <span className="text-xs font-mono text-gray-500">PostGIS Query</span>
            </div>

            {/* DB */}
            <div className="flex flex-col items-center gap-4 group">
              <div className="w-24 h-24 rounded-full bg-gray-900 border border-white/10 flex items-center justify-center shadow-inner group-hover:border-white/30 transition-colors">
                <Database className="w-8 h-8 text-gray-600 group-hover:text-gray-300" />
              </div>
              <p className="text-sm text-gray-500 font-mono">Database</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="py-32 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6">Built for Logic, Designed for Scale.</h2>
            <p className="text-gray-400 max-w-xl mx-auto break-keep">
              단순한 리스트 정렬이 아닙니다. 비즈니스 로직에 최적화된 하이브리드 스코어링 시스템을 제공합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px]">
            {/* Feature 1: Distance */}
            <div className="bento-card group relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] p-8 transition-all hover:bg-white/[0.04]">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <Network className="w-10 h-10 mb-6 text-blue-400" />
              <h3 className="text-xl font-bold mb-2 text-white">Spatial Intelligence</h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-8 break-keep">
                PostGIS 기반의 초정밀 반경 검색.<br />
                단순 거리 계산을 넘어, 이동 편의성까지 고려한 지리 공간 분석을 수행합니다.
              </p>
            </div>

            {/* Feature 2: Preference */}
            <div className="bento-card group relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] p-8 transition-all hover:bg-white/[0.04]">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <Zap className="w-10 h-10 mb-6 text-pink-400" />
              <h3 className="text-xl font-bold mb-2 text-white">Hybrid Scoring</h3>
              <p className="text-sm text-gray-400 leading-relaxed break-keep">
                거리(70%) + 성향(30%) = 완벽한 매칭.<br />
                단일 기준으로 설명할 수 없는 복잡한 인간 관계를 수치화하여 랭킹을 매깁니다.
              </p>
            </div>

            {/* Feature 3: Control */}
            <div className="bento-card group relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] p-8 transition-all hover:bg-white/[0.04]">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <Layers className="w-10 h-10 mb-6 text-green-400" />
              <h3 className="text-xl font-bold mb-2 text-white">Full Control</h3>
              <p className="text-sm text-gray-400 leading-relaxed break-keep">
                블랙박스는 없습니다.<br />
                가중치, 필터, 검색 반경 등 모든 매칭 파라미터를 API로 직접 제어하세요.
              </p>
            </div>

            {/* Large Card: DX Code */}
            <div className="md:col-span-3 bg-black rounded-3xl border border-white/10 p-8 md:p-12 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity">
                <Code2 className="w-32 h-32" />
              </div>

              <div className="flex flex-col md:flex-row gap-12 items-center relative z-10">
                <div className="flex-1 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-mono">
                    DX FIRST
                  </div>
                  <h3 className="text-3xl font-bold">Just Plug & Play</h3>
                  <p className="text-gray-400 leading-relaxed break-keep">
                    복잡한 SQL 쿼리와 알고리즘은 잊으세요.<br />
                    단 하나의 REST API 엔드포인트로 당신의 서비스에 매칭 기능을 탑재할 수 있습니다.
                  </p>
                  <Link href="/docs" className="inline-flex items-center gap-2 text-white font-bold hover:text-indigo-400 transition-colors">
                    Read the Docs <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="w-full md:w-1/2 bg-[#0c0c0e] rounded-xl p-6 border border-white/5 font-mono text-xs md:text-sm shadow-2xl">
                  <div className="flex gap-2 mb-4 opacity-50">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <code className="block text-gray-300">
                    <span className="text-purple-400">POST</span> /matching/request HTTP/1.1<br />
                    <span className="text-blue-400">Content-Type</span>: application/json<br /><br />
                    &#123;<br />
                    &nbsp;&nbsp;<span className="text-green-400">"requesterId"</span>: "user_123",<br />
                    &nbsp;&nbsp;<span className="text-green-400">"strategy"</span>: "HYBRID",<br />
                    &nbsp;&nbsp;<span className="text-green-400">"filters"</span>: &#123;<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-green-400">"radius"</span>: 5000,<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-green-400">"categories"</span>: ["react", "nodejs"]<br />
                    &nbsp;&nbsp;&#125;<br />
                    &#125;
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 bg-black text-center text-gray-600 text-sm">
        <p className="font-mono">© 2026 MATCHING KERNEL. MIT LICENSE.</p>
      </footer>
    </div>
  );
}
