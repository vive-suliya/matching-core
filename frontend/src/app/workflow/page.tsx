'use client';

import Header from '@/components/layout/Header';
import { ArrowRight, Database, Server, Smartphone, Globe, CloudLightning } from 'lucide-react';

export default function WorkflowPage() {
    return (
        <div className="bg-[#030305] text-white selection:bg-indigo-500/30 overflow-x-hidden min-h-screen font-sans">
            <Header />

            {/* Background Grid */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-10"
                style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
            </div>

            <div className="pt-32 pb-20 px-6 relative z-10 max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-20">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono mb-6">
                        SYSTEM ARCHITECTURE & ROADMAP
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-6">
                        Matching Process <span className="text-gradient">Workflow</span>
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed break-keep">
                        사용자의 요청이 매칭 엔진을 거쳐 최적의 결과로 반환되기까지의 여정을 시각화했습니다.
                        Matching Core는 고성능 비동기 처리와 실시간 데이터 동기화를 통해 즉각적인 응답성을 보장합니다.
                    </p>
                </div>

                {/* Workflow Diagram */}
                <div className="relative mb-32">
                    <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent rounded-[3rem] blur-3xl"></div>
                    <div className="bg-[#080815]/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-16 relative overflow-hidden">

                        {/* Flow */}
                        <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">

                            {/* Step 1: Request */}
                            <div className="flex flex-col items-center gap-6 group w-full md:w-auto">
                                <div className="w-24 h-24 rounded-3xl bg-[#111] border border-white/10 flex items-center justify-center relative shadow-2xl group-hover:scale-110 transition-transform duration-500">
                                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center font-black text-xs border-[3px] border-[#111]">1</div>
                                    <Smartphone className="w-10 h-10 text-gray-400 group-hover:text-white transition-colors" />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-lg font-bold mb-1">Client App</h3>
                                    <p className="text-xs text-gray-500 font-mono">REST API Request</p>
                                </div>
                            </div>

                            {/* Arrow */}
                            <div className="hidden md:flex flex-1 h-px bg-white/10 relative items-center justify-center">
                                <div className="absolute w-2 h-2 rounded-full bg-indigo-500 animate-ping"></div>
                                <span className="bg-[#080815] px-4 text-[10px] font-mono text-gray-500 uppercase">JSON Payload</span>
                            </div>

                            {/* Step 2: Gateway */}
                            <div className="flex flex-col items-center gap-6 group w-full md:w-auto">
                                <div className="w-24 h-24 rounded-3xl bg-[#111] border border-indigo-500/30 flex items-center justify-center relative shadow-[0_0_30px_rgba(79,70,229,0.2)] group-hover:shadow-[0_0_50px_rgba(79,70,229,0.4)] transition-all duration-500">
                                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center font-black text-xs border-[3px] border-[#111]">2</div>
                                    <Globe className="w-10 h-10 text-indigo-400" />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-lg font-bold mb-1 text-indigo-200">API Gateway</h3>
                                    <p className="text-xs text-gray-500 font-mono">Auth & Validation</p>
                                </div>
                            </div>

                            {/* Arrow */}
                            <div className="hidden md:flex flex-1 h-px bg-white/10 relative items-center justify-center">
                                <div className="absolute w-2 h-2 rounded-full bg-indigo-500 animate-ping delay-100"></div>
                                <span className="bg-[#080815] px-4 text-[10px] font-mono text-gray-500 uppercase">Async Queue</span>
                            </div>

                            {/* Step 3: Engine */}
                            <div className="flex flex-col items-center gap-6 group w-full md:w-auto">
                                <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-indigo-900 via-[#0a0a20] to-black border border-indigo-400/50 flex items-center justify-center relative shadow-2xl group-hover:scale-105 transition-transform duration-500">
                                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center font-black text-xs border-[3px] border-[#111]">3</div>
                                    <CloudLightning className="w-14 h-14 text-white animate-pulse" />
                                    <div className="absolute bottom-4 text-[10px] font-black uppercase tracking-widest text-indigo-300">Matching Kernel</div>
                                </div>
                                <div className="text-center">
                                    <h3 className="text-xl font-bold mb-1 text-white">Core Engine</h3>
                                    <p className="text-xs text-gray-500 font-mono">Scoring & Ranking</p>
                                </div>
                            </div>

                            {/* Arrow */}
                            <div className="hidden md:flex flex-1 h-px bg-white/10 relative items-center justify-center">
                                <div className="absolute w-2 h-2 rounded-full bg-indigo-500 animate-ping delay-200"></div>
                                <span className="bg-[#080815] px-4 text-[10px] font-mono text-gray-500 uppercase">SQL Query</span>
                            </div>

                            {/* Step 4: DB */}
                            <div className="flex flex-col items-center gap-6 group w-full md:w-auto">
                                <div className="w-24 h-24 rounded-3xl bg-[#111] border border-white/10 flex items-center justify-center relative shadow-2xl group-hover:border-white/30 transition-colors">
                                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center font-black text-xs border-[3px] border-[#111]">4</div>
                                    <Database className="w-10 h-10 text-gray-400" />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-lg font-bold mb-1">PostgreSQL</h3>
                                    <p className="text-xs text-gray-500 font-mono">PostGIS Spatial DB</p>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Detailed Explanation Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-[#0c0c12] border border-white/5 rounded-3xl p-10 hover:bg-[#11111a] transition-colors">
                        <div className="flex items-center gap-4 mb-6">
                            <span className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-black text-sm">01</span>
                            <h3 className="text-xl font-bold">Data Ingestion</h3>
                        </div>
                        <p className="text-gray-400 leading-relaxed text-sm break-keep">
                            클라이언트 앱으로부터 매칭 요청(사용자 위치, 선호도, 필터링 조건)을 수신합니다.
                            API Gateway는 요청의 유효성을 검사하고 JWT 토큰을 통해 사용자 인증을 수행합니다.
                            대량의 트래픽에도 안정적인 처리를 위해 Throttling이 적용됩니다.
                        </p>
                    </div>

                    <div className="bg-[#0c0c12] border border-white/5 rounded-3xl p-10 hover:bg-[#11111a] transition-colors">
                        <div className="flex items-center gap-4 mb-6">
                            <span className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black text-sm">02</span>
                            <h3 className="text-xl font-bold">Spatial Filtering</h3>
                        </div>
                        <p className="text-gray-400 leading-relaxed text-sm break-keep">
                            PostGIS의 <code className="text-indigo-400">ST_DWithin</code> 함수를 사용하여 검색 반경 내의 후보군을 초고속으로 1차 필터링합니다.
                            단순 반경 검색뿐만 아니라 다각형 영역(Polygon) 검색 등 복잡한 공간 쿼리도 지원합니다.
                        </p>
                    </div>

                    <div className="bg-[#0c0c12] border border-white/5 rounded-3xl p-10 hover:bg-[#11111a] transition-colors">
                        <div className="flex items-center gap-4 mb-6">
                            <span className="w-8 h-8 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center font-black text-sm">03</span>
                            <h3 className="text-xl font-bold">Hybrid Scoring</h3>
                        </div>
                        <p className="text-gray-400 leading-relaxed text-sm break-keep">
                            필터링된 후보군에 대해 거리 점수와 성향 일치 점수를 계산합니다.
                            이때 정규화(Normalization) 과정을 거쳐 서로 단위가 다른 데이터를 동일한 척도로 변환하고,
                            <code className="text-pink-400">Weighted Sum Model</code>을 적용하여 최종 랭킹을 산출합니다.
                        </p>
                    </div>

                    <div className="bg-[#0c0c12] border border-white/5 rounded-3xl p-10 hover:bg-[#11111a] transition-colors">
                        <div className="flex items-center gap-4 mb-6">
                            <span className="w-8 h-8 rounded-lg bg-green-500/20 text-green-400 flex items-center justify-center font-black text-sm">04</span>
                            <h3 className="text-xl font-bold">Candidate Response</h3>
                        </div>
                        <p className="text-gray-400 leading-relaxed text-sm break-keep">
                            상위 N개의 최적 매칭 후보(Top Candidates)를 선정하여 클라이언트에 응답합니다.
                            이 과정에서 이미 매칭된 사용자나 차단된 사용자는 자동으로 제외됩니다.
                            최종 결과는 JSON 포맷으로 제공되어 클라이언트에서 즉시 렌더링 가능합니다.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
