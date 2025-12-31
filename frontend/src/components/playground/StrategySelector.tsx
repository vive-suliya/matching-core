
'use client';

import { useMatchingStore } from '@/stores/matching.store';

interface Props {
    onNext: () => void;
    onBack: () => void;
}

export default function StrategySelector({ onNext, onBack }: Props) {
    const { strategy, setStrategy } = useMatchingStore();

    const strategies = [
        { id: 'distance', name: '거리 우선', desc: '가까운 상대를 최우선으로 찾습니다.' },
        { id: 'preference', name: '성향 우선', desc: '관심사와 성향이 맞는 상대를 찾습니다.' },
        { id: 'hybrid', name: '균형 매칭', desc: '거리와 성향을 종합적으로 고려합니다.' },
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="glass-card p-8 rounded-xl border border-white/10">
                <h2 className="text-2xl font-bold mb-6 text-white">매칭 전략 선택</h2>
                <div className="space-y-4">
                    {strategies.map((strat) => (
                        <label
                            key={strat.id}
                            className={`flex items-center p-6 rounded-xl border cursor-pointer transition-all ${strategy === strat.id
                                    ? 'border-purple-500 bg-purple-500/20'
                                    : 'border-white/10 hover:bg-white/5'
                                }`}
                            onClick={() => setStrategy(strat.id as any)}
                        >
                            <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${strategy === strat.id ? 'border-purple-400' : 'border-gray-500'
                                }`}>
                                {strategy === strat.id && <div className="w-3 h-3 rounded-full bg-purple-400" />}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">{strat.name}</h3>
                                <p className="text-sm text-gray-400">{strat.desc}</p>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            <div className="flex justify-between pt-4">
                <button
                    onClick={onBack}
                    className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
                >
                    ← 이전 단계
                </button>
                <button
                    onClick={onNext}
                    className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold shadow-lg hover:shadow-purple-500/50 transition-all"
                >
                    매칭 시작 →
                </button>
            </div>
        </div>
    );
}
