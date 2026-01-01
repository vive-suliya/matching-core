
'use client';

import { useMatchingStore } from '@/stores/matching.store';

interface Props {
    onNext: () => void;
    onBack: () => void;
}

export default function StrategySelector({ onNext, onBack }: Props) {
    const { strategy, setStrategy, settings, setSettings } = useMatchingStore();

    const strategies = [
        { id: 'distance', name: '거리 중심', desc: '지리적 인접성을 최우선 지표로 활용하여 가장 근거리의 대상을 정렬합니다.', tag: 'DISTANCE' },
        { id: 'preference', name: '성향 매칭', desc: '데이터의 특성 및 관심사 일치도를 분석하여 최적의 상대를 탐색합니다.', tag: 'PREFERENCE' },
        { id: 'hybrid', name: '하이브리드', desc: '물리적 거리와 데이터 속성을 통합 알고리즘으로 계산하여 순위를 도출합니다.', tag: 'HYBRID' },
    ];

    return (
        <div className="space-y-12 animate-fade-in-up flex flex-col justify-between h-full">
            <div className="space-y-12">
                {/* Mode Selector */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {strategies.map((strat) => (
                        <button
                            key={strat.id}
                            onClick={() => setStrategy(strat.id as any)}
                            className={`
                                relative p-8 rounded-3xl border text-left transition-all duration-700
                                ${strategy === strat.id
                                    ? 'bg-white text-black border-white shadow-[0_25px_50px_rgba(255,255,255,0.1)] scale-[1.03]'
                                    : 'bg-white/[0.01] border-white/5 text-gray-400 hover:border-white/20'
                                }
                            `}
                        >
                            <div className={`text-[10px] font-black tracking-widest mb-10 px-3 py-1 inline-block rounded-full border ${strategy === strat.id ? 'border-black/10' : 'border-white/10'}`}>
                                {strat.tag}
                            </div>
                            <h3 className="text-xl font-black mb-3 tracking-tighter uppercase italic">{strat.name}</h3>
                            <p className={`text-xs font-semibold leading-relaxed ${strategy === strat.id ? 'text-black/60' : 'text-gray-500'}`}>
                                {strat.desc}
                            </p>
                        </button>
                    ))}
                </div>

                {/* Detailed Configuration */}
                <div className="border-t border-white/5 pt-12 space-y-10">
                    <div className="flex items-center gap-4">
                        <div className="w-1.5 h-6 bg-purple-500 rounded-full"></div>
                        <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white">알고리즘 정밀 설정</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                        {/* Weight Slider */}
                        <div className="space-y-8">
                            <div className="flex justify-between items-end">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">거리 : 성향 비중</p>
                                    <p className="text-2xl font-black text-white">{Math.round(settings.distanceWeight * 100)} : {Math.round(settings.preferenceWeight * 100)}</p>
                                </div>
                                <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">가중치 합산</p>
                            </div>
                            <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className="absolute inset-y-0 left-0 bg-white transition-all duration-500"
                                    style={{ width: `${settings.distanceWeight * 100}%` }}
                                ></div>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={settings.distanceWeight}
                                    onChange={(e) => {
                                        const dw = parseFloat(e.target.value);
                                        setSettings({ distanceWeight: dw, preferenceWeight: 1 - dw });
                                    }}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                            </div>
                        </div>

                        {/* Functional Toggles */}
                        <div className="grid grid-cols-1 gap-4">
                            {[
                                { id: 'explanation', label: '매칭 사유 상세 제공', checked: settings.enableExplanation, setter: (val: boolean) => setSettings({ enableExplanation: val }) },
                                { id: 'negative', label: '거절한 상대 제외 필터', checked: settings.enableNegativeFilter, setter: (val: boolean) => setSettings({ enableNegativeFilter: val }) },
                            ].map((toggle) => (
                                <label key={toggle.id} className={`
                                    flex items-center justify-between p-6 rounded-2xl border transition-all duration-500 cursor-pointer
                                    ${toggle.checked ? 'bg-white/5 border-white/20' : 'bg-transparent border-white/5 hover:border-white/10'}
                                `}>
                                    <span className={`text-[11px] font-black uppercase tracking-widest ${toggle.checked ? 'text-white' : 'text-gray-500'}`}>
                                        {toggle.label}
                                    </span>
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={toggle.checked}
                                        onChange={(e) => toggle.setter(e.target.checked)}
                                    />
                                    <div className={`
                                        w-12 h-6 rounded-full relative transition-all duration-500
                                        ${toggle.checked ? 'bg-purple-600' : 'bg-white/10'}
                                    `}>
                                        <div className={`
                                            absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-500
                                            ${toggle.checked ? 'left-7' : 'left-1'}
                                         shadow-sm`}></div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center pt-12 border-t border-white/5">
                <button
                    onClick={onBack}
                    className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors flex items-center gap-2"
                >
                    <span className="text-lg">←</span> 이전으로
                </button>
                <button
                    onClick={onNext}
                    className="px-12 py-5 bg-white text-black rounded-3xl font-black text-sm uppercase tracking-[0.3em] transition-all hover:scale-105 hover:shadow-[0_20px_40px_rgba(255,255,255,0.2)]"
                >
                    엔진 가동 🚀
                </button>
            </div>
        </div>
    );
}
