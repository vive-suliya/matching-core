
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
        { number: 1, title: '매칭 유형', component: MatchTypeSelector },
        { number: 2, title: '조건 프로필', component: ProfileInput },
        { number: 3, title: '전략 선택', component: StrategySelector },
        { number: 4, title: '결과 확인', component: ResultsDisplay },
    ];

    const CurrentComponent = steps[currentStep - 1].component;

    return (
        <div className="min-h-screen bg-[#030014] text-white p-6 md:p-12 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10">
                <header className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Matching <span className="text-purple-500">Playground</span></h1>
                    <p className="text-gray-400">매칭 알고리즘 시뮬레이션을 통해 최적의 파트너를 찾아보세요.</p>
                </header>

                <StepIndicator steps={steps} currentStep={currentStep} />

                <div className="mt-12 transition-all duration-500 ease-in-out">
                    <CurrentComponent
                        onNext={() => setCurrentStep(prev => Math.min(prev + 1, steps.length))}
                        onBack={() => setCurrentStep(prev => Math.max(prev - 1, 1))}
                    />
                </div>
            </div>
        </div>
    );
}
