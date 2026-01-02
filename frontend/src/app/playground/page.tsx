
'use client';

import { useState } from 'react';
import StepIndicator from '@/components/playground/StepIndicator';
import MatchTypeSelector from '@/components/playground/MatchTypeSelector';
import ProfileInput from '@/components/playground/ProfileInput';
import StrategySelector from '@/components/playground/StrategySelector';
import ResultsDisplay from '@/components/playground/ResultsDisplay';

export default function PlaygroundPage() {
    const [currentStep, setCurrentStep] = useState(1);

    const steps = [
        { number: 1, title: '유형 설정', description: '매칭 대상을 정의합니다', component: MatchTypeSelector },
        { number: 2, title: '조건 입력', description: '기준 데이터를 입력합니다', component: ProfileInput },
        { number: 3, title: '엔진 설정', description: '알고리즘 가중치를 설정합니다', component: StrategySelector },
        { number: 4, title: '결과 합성', description: '최적 정렬 결과를 확인합니다', component: ResultsDisplay },
    ];

    const CurrentComponent = steps[currentStep - 1].component;

    return (
        <div className="min-h-screen bg-[#02000d] text-white pt-32 pb-20 selection:bg-purple-500/30 overflow-x-hidden">

            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[140px] animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.1] mix-blend-overlay"></div>
            </div>

            <div className="max-w-5xl mx-auto px-8 relative z-10">
                <header className="text-center mb-20 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black tracking-widest uppercase text-purple-400">
                        시뮬레이션 모드 활성화됨
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic">
                        Matching <span className="text-gradient">Sandbox</span>
                    </h1>
                    <p className="text-gray-500 font-medium max-w-xl mx-auto leading-relaxed">
                        실시간 공간 데이터와 성향 가중치를 결합하여 비즈니스에 최적화된 매칭 시나리오를 설계하고 시뮬레이션 하세요.
                    </p>
                </header>

                {/* Step Indicator with refined style */}
                <div className="mb-20">
                    <StepIndicator steps={steps} currentStep={currentStep} />
                </div>

                <div className="relative animate-fade-in-up">
                    <div className="glass-panel p-1 rounded-[3rem] border border-white/5 shadow-2xl overflow-hidden min-h-[500px] flex items-stretch">
                        <div className="w-full bg-black/40 backdrop-blur-3xl rounded-[2.8rem] p-10 md:p-16 flex flex-col items-stretch">
                            <CurrentComponent
                                onNext={() => setCurrentStep(prev => Math.min(prev + 1, steps.length))}
                                onBack={() => setCurrentStep(prev => Math.max(prev - 1, 1))}
                            />
                        </div>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute -top-6 -left-6 w-12 h-12 border-t-2 border-l-2 border-white/10 rounded-tl-3xl pointer-events-none"></div>
                    <div className="absolute -bottom-6 -right-6 w-12 h-12 border-b-2 border-r-2 border-white/10 rounded-br-3xl pointer-events-none"></div>
                </div>

                {/* Footer Insight */}
                <div className="mt-16 flex flex-col md:flex-row items-center justify-between gap-10 px-10">
                    <div className="flex items-center gap-6">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl">💡</div>
                        <div className="space-y-1">
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Efficiency Tip</p>
                            <p className="text-sm text-gray-500 font-medium italic">가중치 합산 방식은 Pareto Frontier를 자동으로 탐색하여 최적의 균형점을 찾습니다.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-4 py-2 rounded-xl bg-white/5 border border-white/5">POSTGIS V3</div>
                        <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-4 py-2 rounded-xl bg-white/5 border border-white/5">HYBRID v2</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
