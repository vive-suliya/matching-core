
'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';
import { useMatchingStore } from '@/stores/matching.store';
import { API_URL } from '@/lib/config';

interface Props {
    onBack: () => void;
}

export default function ResultsDisplay({ onBack }: Props) {
    const { results, isLoading, error, submitRequest, reset } = useMatchingStore();

    useEffect(() => {
        submitRequest();
    }, [submitRequest]);

    const handleAccept = async (matchId: string) => {
        try {
            await fetch(`${API_URL}/matching/${matchId}/accept`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ actorId: '11111111-1111-1111-1111-111111111111' }),
            });
            toast.success('매칭을 수락했습니다! 대화창으로 연결됩니다.');
        } catch (err) {
            toast.error('매칭 수락 중 오류가 발생했습니다.');
        }
    };

    const handleReject = async (matchId: string) => {
        try {
            await fetch(`${API_URL}/matching/${matchId}/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ actorId: '11111111-1111-1111-1111-111111111111' }),
            });
            toast.info('매칭을 거절했습니다.');
        } catch (err) {
            toast.error('거절 처리 중 오류가 발생했습니다.');
        }
    };

    const handleReset = () => {
        reset();
        onBack();
    };

    if (error) {
        return (
            <div className="glass-card p-12 rounded-xl text-center animate-fade-in border border-white/10">
                <div className="text-red-400 text-4xl mb-4">⚠️</div>
                <h3 className="text-xl font-bold text-white mb-2">오류 발생</h3>
                <p className="text-gray-400">{error}</p>
                <button
                    onClick={handleReset}
                    className="mt-6 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all"
                >
                    다시 시도
                </button>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="glass-card p-12 rounded-xl text-center animate-fade-in border border-white/10">
                <div className="relative w-20 h-20 mx-auto mb-8">
                    <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full animate-ping"></div>
                    <div className="absolute inset-0 border-4 border-t-purple-500 rounded-full animate-spin"></div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">AI 매칭 중...</h3>
                <p className="text-gray-400">최적의 상대를 분석하고 있습니다.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-slide-up">
            <div className="glass-card p-8 rounded-xl border border-white/10">
                <h2 className="text-2xl font-bold mb-6 text-white">
                    매칭 결과 <span className="text-purple-400 text-lg font-normal ml-2">({results.length}명 발견)</span>
                </h2>

                {results.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <p className="text-xl">조건에 맞는 매칭 후보가 없습니다.</p>
                        <p className="mt-2 text-sm">탐색 반경을 넓히거나 조건을 변경해보세요.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {results.map((match, index) => (
                            <div
                                key={match.id}
                                className="bg-white/5 p-6 rounded-xl border border-white/10 hover:border-purple-500/50 transition-all group"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-purple-900/50 text-purple-300 font-bold text-xl border border-purple-500/30">
                                            #{index + 1}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                                                {match.entityB.name}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-300 border border-green-500/30">
                                                    {match.score}점
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {match.metadata?.distance}km 이내
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleAccept(match.id)}
                                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium"
                                        >
                                            수락
                                        </button>
                                        <button
                                            onClick={() => handleReject(match.id)}
                                            className="px-4 py-2 border border-white/20 hover:bg-white/10 text-gray-300 rounded-lg text-sm"
                                        >
                                            거절
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex justify-center pt-8">
                <button
                    onClick={handleReset}
                    className="px-8 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-bold shadow-lg transition-all"
                >
                    ↻ 조건 다시 설정하기
                </button>
            </div>
        </div>
    );
}
