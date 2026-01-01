
'use client';

import { useMatchingStore } from '@/stores/matching.store';

interface Props {
    onNext: () => void;
}

export default function MatchTypeSelector({ onNext }: Props) {
    const { matchType, setMatchType } = useMatchingStore();

    const types = [
        {
            value: 'USER_USER',
            id: 'U-U',
            title: '사용자 간 매칭',
            description: '1:1 또는 1:N 사용자 매칭. 개인간의 활동이나 교류에 최적화된 모드입니다.',
        },
        {
            value: 'USER_TEAM',
            id: 'U-T',
            title: '사용자-팀 매칭',
            description: '개인과 팀 간의 매칭. 팀원 모집이나 용병 시스템에 적합한 로직을 적용합니다.',
        },
        {
            value: 'TEAM_TEAM',
            id: 'T-T',
            title: '팀 간 매칭',
            description: '팀 간의 정기 교류 및 대항전 매칭. 대규모 엔티티 간의 관계를 설정합니다.',
        },
    ];

    return (
        <div className="space-y-12 h-full flex flex-col justify-between">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {types.map((type) => (
                    <button
                        key={type.value}
                        onClick={() => setMatchType(type.value as any)}
                        className={`
                            relative overflow-hidden group p-8 rounded-[2rem] text-left transition-all duration-700
                            ${matchType === type.value
                                ? 'bg-white text-black scale-[1.05] shadow-[0_30px_60px_-15px_rgba(255,255,255,0.2)]'
                                : 'bg-white/[0.02] border border-white/5 hover:border-white/20'
                            }
                        `}
                    >
                        <div className={`text-4xl font-black mb-10 transition-colors duration-500 ${matchType === type.value ? 'text-black/10' : 'text-white/10'}`}>
                            {type.id}
                        </div>
                        <h3 className={`text-xl font-black mb-3 tracking-tighter uppercase italic ${matchType === type.value ? 'text-black' : 'text-white'}`}>
                            {type.title}
                        </h3>
                        <p className={`text-xs font-semibold leading-relaxed ${matchType === type.value ? 'text-black/60' : 'text-gray-500'}`}>
                            {type.description}
                        </p>

                        {matchType === type.value && (
                            <div className="absolute top-8 right-8 w-2 h-2 rounded-full bg-purple-600 animate-pulse"></div>
                        )}
                    </button>
                ))}
            </div>

            <div className="flex justify-center mt-12 pb-4">
                <button
                    onClick={onNext}
                    disabled={!matchType}
                    className={`
                        w-full max-w-sm py-6 rounded-3xl font-black text-sm uppercase tracking-[0.3em] transition-all duration-500
                        ${matchType
                            ? 'bg-white text-black hover:scale-105 hover:shadow-[0_20px_40px_rgba(255,255,255,0.2)]'
                            : 'bg-white/5 text-gray-700 cursor-not-allowed border border-white/5'
                        }
                    `}
                >
                    {matchType ? '대상 확정 ⚡' : '매칭 유형을 선택하세요'}
                </button>
            </div>
        </div>
    );
}
