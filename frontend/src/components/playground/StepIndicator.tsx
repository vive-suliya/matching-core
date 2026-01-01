
import React from 'react';

interface Props {
    steps: { number: number; title: string; description?: string }[];
    currentStep: number;
}

export default function StepIndicator({ steps, currentStep }: Props) {
    return (
        <div className="flex justify-between items-start w-full relative">
            {/* Background Line */}
            <div className="absolute top-5 left-0 w-full h-px bg-white/5 z-0 hidden md:block" />

            {steps.map((step, index) => {
                const isCompleted = step.number < currentStep;
                const isCurrent = step.number === currentStep;

                return (
                    <div key={step.number} className="flex flex-col items-center relative z-10 group flex-1">
                        <div
                            className={`
                                w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs transition-all duration-700 border
                                ${isCompleted
                                    ? 'bg-purple-600 border-purple-600 text-white shadow-[0_10px_20px_rgba(168,85,247,0.3)]'
                                    : isCurrent
                                        ? 'bg-white border-white text-black shadow-[0_0_30px_rgba(255,255,255,0.2)] scale-110'
                                        : 'bg-black border-white/10 text-gray-600 group-hover:border-white/20'
                                }
                            `}
                        >
                            {isCompleted ? '✓' : `0${step.number}`}
                        </div>

                        <div className="mt-6 flex flex-col items-center gap-1">
                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-500 ${isCurrent ? 'text-white' : 'text-gray-600'}`}>
                                {step.title}
                            </span>
                            {step.description && (
                                <span className="text-[9px] font-bold text-gray-700 uppercase tracking-tighter hidden md:block">
                                    {step.description}
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
