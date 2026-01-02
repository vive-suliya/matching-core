import { create } from 'zustand';
import { API_URL } from '@/lib/config';

export interface MatchResult {
    id: string;
    entityB: {
        id: string;
        name: string;
        avatarUrl?: string;
    };
    score: number;
    status: string;
    metadata?: {
        distance?: number;
        preferenceMatch?: number;
        explanation?: string;
        distanceScore?: number;
        preferenceScore?: number;
    };
}

export interface StrategySettings {
    useDistance: boolean;
    usePreference: boolean;
    distanceWeight: number;
    preferenceWeight: number;
    enableExplanation: boolean;
    enableNegativeFilter: boolean;
}

interface MatchingState {
    matchType: 'USER_USER' | 'USER_TEAM' | 'TEAM_TEAM' | null;
    profile: {
        location?: [number, number];
        radius?: number;
        categories?: string[];
        preferences?: Record<string, any>;
    };
    strategy: 'distance' | 'preference' | 'skill' | 'hybrid';
    settings: StrategySettings;
    results: MatchResult[];
    isLoading: boolean;
    error: string | null;
    acceptedMatches: MatchResult[];
    rejectedMatches: MatchResult[];

    // Actions
    setMatchType: (type: MatchingState['matchType']) => void;
    setProfile: (profile: Partial<MatchingState['profile']>) => void;
    setStrategy: (strategy: MatchingState['strategy']) => void;
    setSettings: (settings: Partial<StrategySettings>) => void;
    setError: (error: string | null) => void;

    // Match Actions
    addAcceptedMatch: (match: MatchResult) => void;
    addRejectedMatch: (match: MatchResult) => void;
    undoAccept: (matchId: string) => void;
    undoReject: (matchId: string) => void;

    submitRequest: () => Promise<void>;
    reset: () => void;
    clearResults: () => void;
}

export const useMatchingStore = create<MatchingState>((set, get) => ({
    matchType: null,
    profile: {},
    strategy: 'distance',
    settings: {
        useDistance: true,
        usePreference: true,
        distanceWeight: 0.7,
        preferenceWeight: 0.3,
        enableExplanation: true,
        enableNegativeFilter: true,
    },
    results: [],
    isLoading: false,
    error: null,
    acceptedMatches: [],
    rejectedMatches: [],

    setMatchType: (matchType) => set({ matchType }),

    setProfile: (profile) =>
        set((state) => ({ profile: { ...state.profile, ...profile } })),

    setStrategy: (strategy) => set({ strategy }),

    setSettings: (settings) =>
        set((state) => ({ settings: { ...state.settings, ...settings } })),

    setError: (error) => set({ error }),

    addAcceptedMatch: (match) => set((state) => ({
        results: state.results.filter(r => r.id !== match.id),
        acceptedMatches: [match, ...state.acceptedMatches]
    })),

    addRejectedMatch: (match) => set((state) => ({
        results: state.results.filter(r => r.id !== match.id),
        rejectedMatches: [match, ...state.rejectedMatches]
    })),

    undoAccept: (matchId) => set((state) => {
        const match = state.acceptedMatches.find(m => m.id === matchId);
        if (!match) return state;
        return {
            acceptedMatches: state.acceptedMatches.filter(m => m.id !== matchId),
            results: [match, ...state.results]
        };
    }),

    undoReject: (matchId) => set((state) => {
        const match = state.rejectedMatches.find(m => m.id === matchId);
        if (!match) return state;
        return {
            rejectedMatches: state.rejectedMatches.filter(m => m.id !== matchId),
            results: [match, ...state.results]
        };
    }),

    submitRequest: async () => {
        set({ isLoading: true, error: null });
        try {
            const { matchType, profile, strategy, settings } = get();

            // 1. Create Matching Request
            const requesterType = matchType?.split('_')[0].toLowerCase();
            const targetType = matchType?.split('_')[1].toLowerCase();

            // 시뮬레이션을 위한 동적 ID 할당
            // 유저 요청일 때는 Alice, 팀 요청일 때는 FC Seoul ID 사용
            const requesterId = requesterType === 'team'
                ? 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
                : '11111111-1111-1111-1111-111111111111';

            const response = await fetch(`${API_URL}/matching/request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    requesterId,
                    requesterType,
                    targetType,
                    strategy,
                    filters: profile,
                    settings,
                }),
            });

            if (!response.ok) {
                throw new Error('매칭 요청 실패');
            }

            const { id: requestId } = await response.json();

            // 2. Poll for results (max 6 seconds)
            let attempts = 0;
            const maxAttempts = 15;
            const pollInterval = 400; // 400ms for snappier feel

            const pollResults = async (): Promise<{ results: MatchResult[], status: string }> => {
                const res = await fetch(`${API_URL}/matching/results/${requestId}`);
                if (!res.ok) return { results: [], status: 'error' };
                return await res.json();
            };

            while (attempts < maxAttempts) {
                const { status, results } = await pollResults();

                if (results.length > 0) {
                    set({ results, isLoading: false });
                    return;
                }

                if (status === 'completed' || status === 'failed') {
                    set({ results: results || [], isLoading: false });
                    return;
                }

                await new Promise(resolve => setTimeout(resolve, pollInterval));
                attempts++;
            }

            // Timeout: no results found yet
            set({ results: [], isLoading: false });

        } catch (error: any) {
            console.error('Matching request failed:', error);
            set({ error: error.message || '매칭 요청 중 오류가 발생했습니다.', isLoading: false, results: [] });
        }
    },

    reset: () => set((state) => ({
        matchType: null,
        profile: {},
        strategy: 'distance',
        results: [],
        acceptedMatches: [],
        rejectedMatches: [],
        isLoading: false,
        error: null,
        settings: {
            ...state.settings,
            distanceWeight: 0.7,
            preferenceWeight: 0.3,
        }
    })),

    clearResults: () => set({
        results: [],
        acceptedMatches: [],
        rejectedMatches: [],
        isLoading: false,
        error: null,
    }),
}));
