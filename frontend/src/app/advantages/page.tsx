'use client';

import Header from '@/components/layout/Header';
import { Network, Zap, Layers, Cpu, Database, Lock, TrendingUp, BarChart } from 'lucide-react';

export default function AdvantagesPage() {
    return (
        <div className="bg-[#030305] text-white selection:bg-indigo-500/30 overflow-x-hidden min-h-screen font-sans">
            <Header />

            {/* Background Effect */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[100px]"></div>
            </div>

            <div className="pt-32 pb-20 px-6 relative z-10 max-w-7xl mx-auto">
                <div className="text-center mb-20 space-y-6">
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic">
                        Competitive <span className="text-gradient">Advantage</span>
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed break-keep">
                        왜 Matching Core인가요? <br />
                        단순한 기능 구현을 넘어, 비즈니스 성장을 견인하는 핵심 기술 경쟁력을 제공합니다.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                    {/* Card 1: PostGIS */}
                    <div className="col-span-1 md:col-span-2 lg:col-span-2 group relative overflow-hidden rounded-[2.5rem] bg-[#0c0c12] border border-white/5 p-12 transition-all hover:border-indigo-500/30">
                        <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-700">
                            <Database className="w-64 h-64 text-indigo-500" />
                        </div>
                        <div className="relative z-10 h-full flex flex-col justify-end">
                            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-8">
                                <Network className="w-8 h-8 text-indigo-400" />
                            </div>
                            <h3 className="text-3xl font-bold mb-4">Spatial Engine Powerhouse</h3>
                            <p className="text-gray-400 leading-relaxed max-w-md text-lg break-keep mb-8">
                                업계 표준 공간 데이터베이스인 PostGIS를 기반으로 구축되었습니다.
                                수백만 건의 위치 데이터 내에서도 수 밀리초(ms) 단위의 쿼리 응답 속도를 보장합니다.
                                단순 거리 계산뿐만 아니라 Polygon 포함 여부, K-NN 검색 등 고급 공간 연산을 지원합니다.
                            </p>
                            <div className="flex gap-3">
                                <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-gray-400">R-Tree Indexing</span>
                                <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-gray-400">GiST Optimization</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Logicless API */}
                    <div className="col-span-1 group relative overflow-hidden rounded-[2.5rem] bg-[#0c0c12] border border-white/5 p-10 hover:bg-[#11111a] transition-colors">
                        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                            <Cpu className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">Logic-less Integration</h3>
                        <p className="text-gray-400 leading-relaxed text-sm break-keep mb-6">
                            클라이언트는 복잡한 매칭 알고리즘을 알 필요가 없습니다.
                            단지 API에 필터 조건만 전달하면, 엔진이 모든 계산을 처리합니다.
                            프론트엔드 코드가 획기적으로 가벼워집니다.
                        </p>
                    </div>

                    {/* Card 3: Hybrid Scoring */}
                    <div className="col-span-1 group relative overflow-hidden rounded-[2.5rem] bg-[#0c0c12] border border-white/5 p-10 hover:bg-[#11111a] transition-colors">
                        <div className="w-14 h-14 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mb-6">
                            <Zap className="w-7 h-7 text-pink-400" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">Hybrid Scoring</h3>
                        <p className="text-gray-400 leading-relaxed text-sm break-keep mb-6">
                            [Distance Score] + [Affinity Score]. <br />
                            서로 다른 차원의 지표를 정규화하여 합산합니다.
                            단순히 가까운 사람이 아닌, '가까우면서도 나랑 잘 맞는' 최적의 상대를 찾아냅니다.
                        </p>
                    </div>

                    {/* Card 4: Security */}
                    <div className="col-span-1 md:col-span-2 group relative overflow-hidden rounded-[2.5rem] bg-[#0c0c12] border border-white/5 p-12 transition-all hover:border-green-500/30">
                        <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-700">
                            <Lock className="w-64 h-64 text-green-500" />
                        </div>
                        <div className="relative z-10">
                            <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-8">
                                <Lock className="w-8 h-8 text-green-400" />
                            </div>
                            <h3 className="text-3xl font-bold mb-4">Enterprise Grade Security</h3>
                            <p className="text-gray-400 leading-relaxed max-w-lg text-lg break-keep">
                                NestJS의 Guard와 Interceptor를 활용한 철저한 보안 계층.
                                Supabase Auth 연동을 통한 JWT 검증, Rate Limiting(Throttling)을 통한 DDoS 방지,
                                그리고 엄격한 Input Validation(DTO)을 기본 탑재했습니다.
                            </p>
                        </div>
                    </div>

                    {/* Card 5: Analytics */}
                    <div className="col-span-1 group relative overflow-hidden rounded-[2.5rem] bg-[#0c0c12] border border-white/5 p-10 hover:bg-[#11111a] transition-colors">
                        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6">
                            <BarChart className="w-7 h-7 text-blue-400" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">Real-time Analytics</h3>
                        <p className="text-gray-400 leading-relaxed text-sm break-keep mb-6">
                            매칭 성공률, 평균 응답 시간, 활성 사용자 분포 등
                            서비스 운영에 필수적인 핵심 지표를 실시간 통계 API를 통해 제공합니다.
                            데이터 기반의 의사결정을 돕습니다.
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}
