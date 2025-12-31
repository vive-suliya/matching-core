
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
            icon: '👥',
            title: 'User vs User',
            description: '1:1 또는 1:N 사용자 매칭 (중고거래, 동행 찾기 등)',
        },
        {
            value: 'USER_TEAM',
            icon: '👤➡️👥',
            title: 'User vs Team',
            description: '개인이 팀을 찾거나 팀이 개인을 찾는 매칭 (용병, 길드 가입 등)',
        },
        {
            value: 'TEAM_TEAM',
            icon: '👥⚔️👥',
            title: 'Team vs Team',
            description: '팀 간의 매칭 (스터디 그룹, 팀 대항전 등)',
        },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {types.map((type) => (
                    <button
                        key={type.value}
                        onClick={() => setMatchType(type.value as any)}
                        className={`glass-card p-6 rounded-xl text-left transition-all hover:scale-105 ${matchType === type.value
                                ? 'border-2 border-purple-500 bg-purple-500/20 shadow-[0_0_30px_rgba(168,85,247,0.3)]'
                                : 'border border-white/10 hover:border-purple-500/50'
                            }`}
                    >
                        <div className="text-4xl mb-4">{type.icon}</div>
                        <h3 className="text-xl font-bold mb-2 text-white">{type.title}</h3>
                        <p className="text-sm text-gray-400">{type.description}</p>
                    </button>
                ))}
            </div>

            <div className="flex justify-end mt-8">
                <button
                    onClick={onNext}
                    disabled={!matchType}
                    className={`px-8 py-3 rounded-lg font-bold transition-all ${matchType
                            ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-purple-500/50'
                            : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        }`}
                >
                    다음 단계 →
                </button>
            </div>
        </div>
    );
}
