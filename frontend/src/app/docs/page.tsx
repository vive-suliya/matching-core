
'use client';

import { useState, useEffect } from 'react';
import { API_URL } from '@/lib/config';

interface ApiEndpoint {
    method: 'GET' | 'POST';
    path: string;
    description: string;
    body?: string;
    params?: Record<string, string>;
    category: 'Matching' | 'Status' | 'Actions';
}

const ENDPOINTS: ApiEndpoint[] = [
    {
        category: 'Matching',
        method: 'POST',
        path: '/matching/request',
        description: '새로운 매칭 요청을 생성합니다. 비동기로 매칭이 시작됩니다.',
        body: JSON.stringify({
            requesterId: "11111111-1111-1111-1111-111111111111",
            requesterType: "user",
            targetType: "user",
            strategy: "hybrid",
            filters: {
                location: [37.5665, 126.9780],
                radius: 10000,
                categories: ["sports", "gaming"]
            },
            settings: {
                distanceWeight: 0.6,
                preferenceWeight: 0.4,
                enableExplanation: true
            }
        }, null, 2)
    },
    {
        category: 'Matching',
        method: 'GET',
        path: '/matching/results/{requestId}',
        description: '매칭 요청에 대한 결과 및 처리 상태를 실시간으로 조회합니다.',
        params: { requestId: 'mock-request-id' }
    },
    {
        category: 'Status',
        method: 'GET',
        path: '/matching/stats',
        description: '시스템 전체 매칭 통계 및 상태를 확인합니다.'
    },
    {
        category: 'Actions',
        method: 'POST',
        path: '/matching/{matchId}/accept',
        description: '추천된 매칭 후보를 수락합니다.',
        params: { matchId: 'match-0' },
        body: JSON.stringify({ actorId: "11111111-1111-1111-1111-111111111111" }, null, 2)
    },
    {
        category: 'Actions',
        method: 'POST',
        path: '/matching/{matchId}/reject',
        description: '추천된 매칭 후보를 거절합니다.',
        params: { matchId: 'match-0' },
        body: JSON.stringify({ actorId: "11111111-1111-1111-1111-111111111111" }, null, 2)
    }
];

export default function DocsPage() {
    const [activeTab, setActiveTab] = useState<'api' | 'logic'>('api');
    const [activeEndpoint, setActiveEndpoint] = useState<ApiEndpoint>(ENDPOINTS[0]);
    const [response, setResponse] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [customValues, setCustomValues] = useState<Record<string, string>>({
        requestId: 'mock-sample-id',
        matchId: 'match-0'
    });

    const handleTestApi = async () => {
        setIsLoading(true);
        try {
            let actualPath = activeEndpoint.path;
            Object.entries(customValues).forEach(([key, val]) => {
                actualPath = actualPath.replace(`{${key}}`, val);
            });

            const options: RequestInit = {
                method: activeEndpoint.method,
                headers: { 'Content-Type': 'application/json' },
            };

            if (activeEndpoint.method === 'POST' && activeEndpoint.body) {
                options.body = activeEndpoint.body;
            }

            const res = await fetch(`${API_URL}${actualPath}`, options);
            const data = await res.json();
            setResponse(data);

            if (activeEndpoint.path.includes('request') && data.id) {
                setCustomValues(prev => ({ ...prev, requestId: data.id }));
            }
        } catch (err) {
            setResponse({ error: 'API 요청 중 오류 발생', details: err });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#02000d] text-white pt-32 pb-20 selection:bg-indigo-500/30 overflow-x-hidden">
            {/* Background elements */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-indigo-600/5 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-purple-600/5 blur-[120px] rounded-full"></div>
            </div>

            <div className="max-w-[1400px] mx-auto px-8 relative">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-16">
                    <div className="space-y-4">
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic text-white flex flex-col">
                            Developer <span className="text-gradient">Portal</span>
                        </h1>
                        <p className="text-gray-500 font-medium max-w-xl text-lg">
                            Matching Core 엔진을 연동하고 비즈니스 매칭 로직을 설계하기 위한 개발자 가이드입니다.
                        </p>
                    </div>

                    {/* Tab Selector */}
                    <div className="flex bg-white/5 p-1.5 rounded-[2rem] border border-white/5 backdrop-blur-xl">
                        {[
                            { id: 'api', label: 'API Reference', icon: '📡' },
                            { id: 'logic', label: 'Engine Logic', icon: '🧬' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`
                                    px-10 py-5 rounded-[1.8rem] text-sm font-black uppercase tracking-widest transition-all duration-500 flex items-center gap-3
                                    ${activeTab === tab.id
                                        ? 'bg-white text-black shadow-2xl'
                                        : 'text-gray-500 hover:text-white'
                                    }
                                `}
                            >
                                <span className="text-lg">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {activeTab === 'api' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-8">
                        {/* API Sidebar */}
                        <div className="lg:col-span-3 space-y-12">
                            <div className="space-y-10">
                                {['Matching', 'Status', 'Actions'].map(cat => (
                                    <div key={cat} className="space-y-6">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600 px-4">{cat}</h3>
                                        <div className="space-y-2">
                                            {ENDPOINTS.filter(e => e.category === cat).map((ep) => (
                                                <button
                                                    key={ep.path}
                                                    onClick={() => { setActiveEndpoint(ep); setResponse(null); }}
                                                    className={`
                                                        w-full text-left px-6 py-5 rounded-2xl transition-all duration-500 flex flex-col gap-1 border
                                                        ${activeEndpoint.path === ep.path
                                                            ? 'bg-white/[0.05] border-white/20 shadow-xl'
                                                            : 'text-gray-500 hover:text-gray-300 border-transparent hover:bg-white/5'
                                                        }
                                                    `}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${ep.method === 'GET' ? 'bg-blue-500/10 text-blue-400' : 'bg-green-500/10 text-green-400'}`}>
                                                            {ep.method}
                                                        </span>
                                                        <span className={`text-xs font-black uppercase tracking-tight ${activeEndpoint.path === ep.path ? 'text-white' : ''}`}>
                                                            {ep.path.split('/').pop()?.replace('{', '').replace('}', '')}
                                                        </span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* API Detail Content */}
                        <div className="lg:col-span-9">
                            <div className="glass-panel p-1 rounded-[3rem] border border-white/5 shadow-2xl overflow-hidden min-h-[700px]">
                                <div className="bg-black/40 backdrop-blur-3xl rounded-[2.8rem] p-10 md:p-16 h-full flex flex-col">
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-12 mb-20 relative z-10">
                                        <div className="space-y-8">
                                            <div className="flex items-center gap-4">
                                                <span className={`px-4 py-1.5 rounded-full font-black text-[10px] tracking-widest uppercase border ${activeEndpoint.method === 'GET' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>
                                                    {activeEndpoint.method}
                                                </span>
                                                <div className="h-px w-8 bg-white/20"></div>
                                                <span className="font-mono text-sm text-gray-500 tracking-tighter">{activeEndpoint.path}</span>
                                            </div>
                                            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase italic max-w-2xl leading-[1.1]">
                                                {activeEndpoint.description}
                                            </h2>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-20 relative z-10 flex-1">
                                        {/* Left: Config */}
                                        <div className="space-y-12">
                                            <div className="space-y-8">
                                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Request Context</h3>

                                                {activeEndpoint.path.includes('{') && (
                                                    <div className="space-y-6">
                                                        {Object.keys(activeEndpoint.params || {}).map(param => (
                                                            <div key={param} className="space-y-3">
                                                                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-1">{param}</label>
                                                                <input
                                                                    type="text"
                                                                    value={customValues[param] || ''}
                                                                    onChange={(e) => setCustomValues({ ...customValues, [param]: e.target.value })}
                                                                    className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-6 py-5 text-sm font-mono text-white focus:border-indigo-500/50 outline-none transition-all shadow-inner"
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {activeEndpoint.body && (
                                                    <div className="space-y-4">
                                                        <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-1">JSON Payload</label>
                                                        <pre className="p-8 rounded-[2rem] bg-black border border-white/5 text-[11px] text-gray-500 font-mono leading-relaxed overflow-x-auto shadow-2xl">
                                                            {activeEndpoint.body}
                                                        </pre>
                                                    </div>
                                                )}
                                            </div>

                                            <button
                                                onClick={handleTestApi}
                                                disabled={isLoading}
                                                className="w-full py-6 bg-white text-black rounded-[2rem] text-sm font-black uppercase tracking-[0.2em] transition-all hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(255,255,255,0.1)] active:scale-95 disabled:opacity-50"
                                            >
                                                {isLoading ? 'Processing...' : 'Execute Request ⚡'}
                                            </button>
                                        </div>

                                        {/* Right: Response */}
                                        <div className="space-y-8 flex flex-col h-full">
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-green-400">Live Response</h3>
                                            <div className="relative flex-1 rounded-[2rem] bg-black/60 border border-white/5 p-10 overflow-hidden shadow-inner flex flex-col min-h-[400px]">
                                                {response ? (
                                                    <pre className="text-[11px] text-green-400/80 font-mono leading-relaxed overflow-y-auto scrollbar-hide py-4">
                                                        {JSON.stringify(response, null, 2)}
                                                    </pre>
                                                ) : (
                                                    <div className="flex-1 flex flex-col items-center justify-center text-gray-800 text-center">
                                                        <div className="text-6xl mb-6 opacity-10">📡</div>
                                                        <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Command</p>
                                                    </div>
                                                )}
                                                {isLoading && (
                                                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-20">
                                                        <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-32 animate-fade-in-up py-10">
                        {/* Logic Content */}
                        <div className="space-y-16">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[
                                    {
                                        id: '01',
                                        title: '공간 데이터 탐색',
                                        desc: 'PostGIS ST_DWithin 엔진을 통해 설정된 반경 내 모든 후보를 1차 필터링합니다. 공간 인덱싱을 통해 대량의 사용자 데이터 속에서도 10ms 이내에 검색을 완료합니다.',
                                        icon: '📍',
                                        color: 'border-blue-500/20 bg-blue-500/[0.02]'
                                    },
                                    {
                                        id: '02',
                                        title: '데이터 정규화',
                                        desc: '서로 다른 척도(물리적 거리 km vs 관심사 일치 수)를 가진 데이터를 0~1 사이의 표준 점수로 변환합니다. 이를 통해 가중치 계산 시 데이터 왜곡을 방지합니다.',
                                        icon: '⚙️',
                                        color: 'border-purple-500/20 bg-purple-500/[0.02]'
                                    },
                                    {
                                        id: '03',
                                        title: '가중치 합성 연산',
                                        desc: '사용자가 설정한 물리적 거리와 성향 일치 비중을 적용하여 최종 매칭 점수를 산출합니다. 비즈니스 목적에 따라 거리 우선 혹은 취향 우선 매칭이 가능합니다.',
                                        icon: '🧬',
                                        color: 'border-indigo-500/20 bg-indigo-600/[0.02]'
                                    },
                                    {
                                        id: '04',
                                        title: '최종 랭킹 합성',
                                        desc: '합산된 점수를 내림차순으로 정렬하여 TOP 5 후보를 확정합니다. 수락/거절 내역을 실시간으로 반영하여 필터링된 최적의 리스트를 최종 응답합니다.',
                                        icon: '🏆',
                                        color: 'border-green-500/20 bg-green-500/[0.02]'
                                    }
                                ].map(item => (
                                    <div key={item.id} className={`p-10 rounded-[3rem] border ${item.color} space-y-8 relative overflow-hidden group hover:scale-[1.02] transition-all duration-500 min-h-[320px] flex flex-col justify-end`}>
                                        <span className="text-sm font-black text-white/10 group-hover:text-white/20 transition-colors uppercase italic tracking-tighter absolute top-8 right-10 text-6xl">{item.id}</span>
                                        <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl shadow-inner mb-auto">{item.icon}</div>
                                        <div className="space-y-4">
                                            <h4 className="text-2xl font-black tracking-tight text-white">{item.title}</h4>
                                            <p className="text-xs text-gray-500 leading-relaxed font-bold uppercase tracking-tight">
                                                {item.desc}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Detailed Calculation Explanation */}
                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-16 border-t border-white/5 pt-24">
                                <div className="xl:col-span-1 space-y-8">
                                    <h3 className="text-5xl font-black tracking-tighter uppercase italic leading-[1] text-white">
                                        점수 산출 <br /><span className="text-gradient">메커니즘</span>
                                    </h3>
                                    <p className="text-lg text-gray-500 font-medium leading-relaxed">
                                        거리 점수와 성향 점수는 각각 독립적으로 계산된 후, 선호도 비율에 따라 합산됩니다.
                                    </p>
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl">💡</div>
                                        <p className="text-xs text-gray-600 font-bold uppercase leading-relaxed">
                                            Normalize: 0 ~ 1 정규화를 통해 <br />서로 다른 데이터 단위를 통합합니다.
                                        </p>
                                    </div>
                                </div>

                                <div className="xl:col-span-2">
                                    <div className="glass-panel p-1 rounded-[3.5rem] border border-white/5 h-full">
                                        <div className="bg-[#080815] rounded-[3.3rem] p-10 md:p-14 h-full flex flex-col space-y-12 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full"></div>

                                            {/* Top Row: Raw Scores */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">거리 점수 (Distance)</p>
                                                    </div>
                                                    <div className="p-6 rounded-[2rem] bg-black border border-white/5 font-mono text-[11px] text-indigo-300 shadow-inner">
                                                        Score_D = 1.0 - (Actual / Radius)
                                                    </div>
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                                        <p className="text-[10px] font-black text-purple-400 uppercase tracking-[0.3em]">성향 점수 (Preference)</p>
                                                    </div>
                                                    <div className="p-6 rounded-[2rem] bg-black border border-white/5 font-mono text-[11px] text-purple-300 shadow-inner">
                                                        Score_P = Matches / Total_Req
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Bottom Row: Integration Formula */}
                                            <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-12 text-center space-y-8 relative group">
                                                <div className="absolute inset-0 bg-indigo-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                <div className="space-y-2 relative z-10">
                                                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">Integrated Scoring Logic</p>
                                                    <h4 className="text-xl font-black text-white uppercase italic tracking-tighter">최종 통합 스코어 산출 공식</h4>
                                                </div>

                                                <div className="relative z-10 py-8">
                                                    <span className="text-2xl md:text-4xl lg:text-5xl font-black italic text-white tracking-[0.2em] leading-none">
                                                        (D × <span className="text-indigo-400">Wd</span>) + (P × <span className="text-purple-400">Wp</span>)
                                                    </span>
                                                </div>

                                                <div className="flex flex-wrap justify-center gap-10 pt-8 border-t border-white/5 relative z-10">
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-[11px] font-black text-indigo-400 uppercase tracking-widest">D / P</span>
                                                        <span className="text-[9px] font-black text-gray-600 uppercase">Normalized Scores</span>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-[11px] font-black text-purple-400 uppercase tracking-widest">Wd / Wp</span>
                                                        <span className="text-[9px] font-black text-gray-600 uppercase">Input Weights</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
