
import React from 'react';

interface Props {
    steps: { number: number; title: string }[];
    currentStep: number;
}

export default function StepIndicator({ steps, currentStep }: Props) {
    return (
        <div className="flex justify-center items-center w-full mb-12">
            {steps.map((step, index) => {
                const isCompleted = step.number < currentStep;
                const isCurrent = step.number === currentStep;

                return (
                    <div key={step.number} className="flex items-center">
                        <div className="flex flex-col items-center relative">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2 z-10 ${isCompleted
                                        ? 'bg-purple-600 border-purple-600 text-white'
                                        : isCurrent
                                            ? 'bg-[#030014] border-purple-500 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.5)]'
                                            : 'bg-[#030014] border-gray-700 text-gray-600'
                                    }`}
                            >
                                {isCompleted ? '✓' : step.number}
                            </div>
                            <div className={`absolute -bottom-8 w-32 text-center text-xs font-medium transition-colors duration-300 ${isCurrent ? 'text-purple-400' : 'text-gray-500'
                                }`}>
                                {step.title}
                            </div>
                        </div>

                        {index < steps.length - 1 && (
                            <div className={`w-12 md:w-24 h-0.5 mx-2 transition-colors duration-300 ${isCompleted ? 'bg-purple-600' : 'bg-gray-800'
                                }`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
