
'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import { useMatchingStore, MatchResult } from '@/stores/matching.store';
import { API_URL } from '@/lib/config';

interface Props {
    onBack: () => void;
}

export default function ResultsDisplay({ onBack }: Props) {
    const {
        results,
        acceptedMatches,
        rejectedMatches,
        profile,
        settings,
        isLoading,
        error,
        submitRequest,
        clearResults,
        addAcceptedMatch,
        addRejectedMatch,
        undoAccept,
        undoReject
    } = useMatchingStore();

    const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
    const [confirmingMatch, setConfirmingMatch] = useState<MatchResult | null>(null);
    const [hasAttempted, setHasAttempted] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (!isLoading && !hasAttempted && !error && results.length === 0 && acceptedMatches.length === 0 && rejectedMatches.length === 0) {
            setHasAttempted(true);
            submitRequest();
        }
    }, [submitRequest, isLoading, hasAttempted, error, results.length, acceptedMatches.length, rejectedMatches.length]);

    const handleAccept = async (match: MatchResult) => {
        setProcessingIds(prev => new Set(prev).add(match.id + '_acc'));
        setTimeout(async () => {
            try {
                await fetch(`${API_URL}/matching/${match.id}/accept`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ actorId: '11111111-1111-1111-1111-111111111111' }),
                });
                addAcceptedMatch(match);
                toast.success(`${match.entityB.name}님을 수락했습니다!`);
            } catch (err) {
                toast.error('수락 처리 중 오류가 발생했습니다.');
            } finally {
                setProcessingIds(prev => {
                    const next = new Set(prev);
                    next.delete(match.id + '_acc');
                    return next;
                });
            }
        }, 800);
    };

    const handleReject = async (match: MatchResult) => {
        setConfirmingMatch(null);
        setProcessingIds(prev => new Set(prev).add(match.id + '_rej'));
        setTimeout(async () => {
            try {
                await fetch(`${API_URL}/matching/${match.id}/reject`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ actorId: '11111111-1111-1111-1111-111111111111' }),
                });
                addRejectedMatch(match);
                toast.info(`${match.entityB.name}님을 거절했습니다.`);
            } catch (err) {
                toast.error('거절 처리 중 오류가 발생했습니다.');
            } finally {
                setProcessingIds(prev => {
                    const next = new Set(prev);
                    next.delete(match.id + '_rej');
                    return next;
                });
            }
        }, 800);
    };

    const handleReset = () => {
        clearResults();
        onBack();
    };

    const emptyState = profile.radius && profile.radius < 10000
        ? { title: "탐색 범위를 넓혀보세요", desc: "반경이 너무 좁아 매칭 대상을 찾기 어려울 수 있습니다.", icon: "📍" }
        : { title: "매칭 대상을 찾지 못했습니다", desc: "조건을 수정하거나 잠시 후 다시 시도해 주세요.", icon: "🔍" };

    if (error) {
        return (
            <div className="p-20 text-center animate-fade-in-up">
                <div className="text-6xl mb-10">⚠️</div>
                <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-4 text-white">엔진 오류 발생</h3>
                <p className="text-gray-500 mb-12 font-medium">데이터 프로세싱 중 예기치 못한 오류가 발생했습니다.</p>
                <div className="flex gap-4 justify-center">
                    <button onClick={handleReset} className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all">조건 수정</button>
                    <button onClick={() => submitRequest()} className="px-8 py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all">다시 시도 ↻</button>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="p-32 text-center animate-fade-in-up relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-purple-500/20 blur-[60px] rounded-full animate-pulse"></div>
                <div className="w-20 h-20 mx-auto mb-12 relative">
                    <div className="absolute inset-0 border-[3px] border-white/5 rounded-full"></div>
                    <div className="absolute inset-0 border-[3px] border-t-white rounded-full animate-spin"></div>
                </div>
                <h3 className="text-2xl font-black italic uppercase tracking-[0.2em] text-white animate-pulse">분석 중...</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600 mt-6">데이터 가중치 합산 및 최적 대상 정렬 중</p>
            </div>
        );
    }

    return (
        <>
            {/* Fullscreen Rejection Modal - Using Portal for Viewport Fixed Position */}
            {mounted && confirmingMatch && createPortal(
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-6 bg-black/90 backdrop-blur-2xl animate-fade-in outline-none">
                    <div
                        className="p-12 max-w-sm w-full bg-[#080815] border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.9)] rounded-[3rem] relative z-[99999]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="text-4xl mb-10 text-center">👎</div>
                        <h3 className="text-2xl font-black text-white mb-4 text-center tracking-tighter uppercase italic">거절 확인</h3>
                        <p className="text-gray-500 text-xs mb-12 text-center leading-relaxed font-bold uppercase tracking-tight">
                            {confirmingMatch.entityB.name}님을 추천 목록에서 <br />영구적으로 제외할까요?
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setConfirmingMatch(null)}
                                className="flex-1 py-5 bg-white/5 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all border border-white/5 active:scale-95"
                            >
                                취소
                            </button>
                            <button
                                onClick={() => handleReject(confirmingMatch)}
                                className="flex-1 py-5 bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 transition-all shadow-xl shadow-red-500/20 active:scale-95"
                            >
                                거절 확정
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            <div className="space-y-16 animate-fade-in-up pb-12">
                <div className="flex flex-col md:flex-row justify-between items-end gap-8">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                            <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">최적 추천 목록</h2>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-600 italic">
                            현재 {results.length}명의 후보자가 대기열에 있습니다
                        </p>
                    </div>
                    <button onClick={handleReset} className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-all px-6 py-3 rounded-2xl border border-white/5 hover:bg-white/5">
                        검색 조건 재설정
                    </button>
                </div>

                {results.length === 0 && acceptedMatches.length === 0 && rejectedMatches.length === 0 ? (
                    <div className="text-center py-32 bg-white/[0.01] rounded-[3rem] border border-dashed border-white/5">
                        <div className="text-7xl mb-10 opacity-10">{emptyState.icon}</div>
                        <h3 className="text-2xl font-black uppercase italic text-white tracking-widest mb-4">{emptyState.title}</h3>
                        <p className="text-xs text-gray-600 font-bold tracking-tight uppercase">{emptyState.desc}</p>
                    </div>
                ) : results.length === 0 ? (
                    <div className="text-center py-20 bg-white/[0.01] rounded-[3rem] border border-dashed border-white/5">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-400 mb-2">대기열 처리 완료</p>
                        <p className="text-xs text-gray-600 font-bold uppercase tracking-tight">모든 후보자에 대한 분석 및 정렬이 완료되었습니다.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {results.slice(0, 5).map((match, index) => {
                            const isAccAnimating = processingIds.has(match.id + '_acc');
                            const isRejAnimating = processingIds.has(match.id + '_rej');
                            const isProcessing = isAccAnimating || isRejAnimating;

                            return (
                                <div
                                    key={match.id}
                                    className={`
                                        relative group overflow-hidden p-1 rounded-[2.5rem] transition-all duration-700
                                        ${isAccAnimating ? 'animate-fly-accepted' : isRejAnimating ? 'animate-fly-rejected' : 'hover:scale-[1.01]'}
                                    `}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="relative bg-[#050510] border border-white/5 rounded-[2.4rem] p-10 flex flex-col md:flex-row items-center gap-10">
                                        <div className="w-24 h-24 shrink-0 rounded-2xl bg-white text-black flex flex-col items-center justify-center shadow-2xl">
                                            <span className="text-xs font-black uppercase tracking-tighter mb-1 opacity-50 text-[8px]">스코어</span>
                                            <span className="text-3xl font-black italic">{match.score}</span>
                                        </div>

                                        <div className="flex-1 space-y-6 w-full text-center md:text-left">
                                            <div className="flex flex-col md:flex-row md:items-center gap-4">
                                                <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">{match.entityB.name}</h3>
                                                <div className="flex items-center justify-center gap-3">
                                                    <span className="text-[9px] font-black px-2 py-0.5 border border-purple-500/20 text-purple-400 rounded-full bg-purple-500/5 uppercase tracking-widest">#{match.entityB.id.slice(0, 4)}</span>
                                                    <span className="text-[9px] font-black px-2 py-0.5 border border-indigo-500/20 text-indigo-400 rounded-full bg-indigo-500/5 uppercase tracking-widest">{(match.metadata?.distance ? (match.metadata.distance / 1000).toFixed(1) : '0')}KM</span>
                                                </div>
                                            </div>

                                            {match.metadata?.explanation && (
                                                <p className="text-xs font-semibold text-gray-500 leading-relaxed italic border-l-2 border-white/10 pl-6 text-left">
                                                    "{match.metadata.explanation}"
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex gap-4 shrink-0">
                                            <button
                                                onClick={() => setConfirmingMatch(match)}
                                                className="w-16 h-16 flex items-center justify-center border border-white/5 rounded-2xl text-gray-700 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/20 transition-all duration-500 active:scale-95"
                                            >
                                                ✖
                                            </button>
                                            <button
                                                onClick={() => handleAccept(match)}
                                                className="px-10 py-5 bg-white text-black rounded-3xl font-black text-sm uppercase tracking-widest shadow-xl shadow-white/5 hover:scale-105 transition-all duration-500 active:scale-95"
                                            >
                                                수락 ⚡
                                            </button>
                                        </div>

                                        {isProcessing && !isAccAnimating && !isRejAnimating && (
                                            <div className="absolute inset-0 bg-black/40 backdrop-blur-md rounded-[2.4rem] flex items-center justify-center z-10">
                                                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Status Panels */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[
                        { title: '승인된 파트너', count: acceptedMatches.length, list: acceptedMatches, color: 'bg-green-500', undo: undoAccept, label: 'accepted', action: '복구' },
                        { title: '제외된 파트너', count: rejectedMatches.length, list: rejectedMatches, color: 'bg-red-500', undo: undoReject, label: 'rejected', action: '복구' }
                    ].map((panel) => (
                        <div key={panel.title} className="bg-white/[0.01] border border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col h-[280px]">
                            <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                                <div className="flex items-center gap-3">
                                    <div className={`w-1.5 h-1.5 rounded-full ${panel.color} shadow-[0_0_8px_rgba(0,0,0,0.5)]`}></div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{panel.title}</span>
                                </div>
                                <span className="text-[10px] font-black text-white px-2 py-0.5 rounded-md bg-white/5 border border-white/10">{panel.count}</span>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 space-y-2 scrollbar-hide">
                                {panel.list.length === 0 ? (
                                    <div className="h-full flex items-center justify-center text-[9px] font-black uppercase tracking-widest text-gray-800 italic">데이터 로드 대기 중</div>
                                ) : (
                                    panel.list.map(match => (
                                        <div key={match.id} className="group bg-black/40 border border-white/[0.03] p-4 rounded-2xl flex items-center justify-between hover:border-white/10 transition-all duration-500">
                                            <span className="text-[11px] font-black uppercase tracking-tighter text-gray-400">{match.entityB.name}</span>
                                            <button onClick={() => panel.undo(match.id)} className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-700 hover:text-white transition-colors">{panel.action}</button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
