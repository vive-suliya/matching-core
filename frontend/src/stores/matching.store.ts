import { create } from 'zustand';
import { API_URL } from '@/lib/config';

export interface MatchResult {
    id: string;
    entityB: {
        name: string;
        avatarUrl?: string;
    };
    score: number;
    status: string;
    metadata?: {
        distance?: number;
        preferenceMatch?: number;
    };
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
    results: MatchResult[];
    isLoading: boolean;
    error: string | null;

    // Actions
    setMatchType: (type: MatchingState['matchType']) => void;
    setProfile: (profile: Partial<MatchingState['profile']>) => void;
    setStrategy: (strategy: MatchingState['strategy']) => void;
    setError: (error: string | null) => void;
    submitRequest: () => Promise<void>;
    reset: () => void;
}

export const useMatchingStore = create<MatchingState>((set, get) => ({
    matchType: null,
    profile: {},
    strategy: 'distance',
    results: [],
    isLoading: false,
    error: null,

    setMatchType: (matchType) => set({ matchType }),

    setProfile: (profile) =>
        set((state) => ({ profile: { ...state.profile, ...profile } })),

    setStrategy: (strategy) => set({ strategy }),

    setError: (error) => set({ error }),

    submitRequest: async () => {
        set({ isLoading: true, error: null });
        try {
            const { matchType, profile, strategy } = get();

            // 1. Create Matching Request
            const response = await fetch(`${API_URL}/matching/request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    requesterId: '11111111-1111-1111-1111-111111111111', // Test user Alice
                    requesterType: matchType?.split('_')[0].toLowerCase(),
                    targetType: matchType?.split('_')[1].toLowerCase(),
                    strategy,
                    filters: profile,
                }),
            });

            if (!response.ok) {
                throw new Error('매칭 요청 실패');
            }

            const { id: requestId } = await response.json();

            // 2. Poll for results (max 10 seconds)
            let attempts = 0;
            const maxAttempts = 10;
            const pollInterval = 1000; // 1 second

            const pollResults = async (): Promise<MatchResult[]> => {
                const res = await fetch(`${API_URL}/matching/results/${requestId}`);
                if (!res.ok) return [];
                const data = await res.json();
                return data.map((match: any) => ({
                    id: match.id,
                    entityB: {
                        name: match.entityB.name,
                        avatarUrl: match.entityB.avatarUrl,
                    },
                    score: Math.round(match.score),
                    status: match.status,
                    metadata: match.metadata,
                }));
            };

            while (attempts < maxAttempts) {
                const results = await pollResults();
                if (results.length > 0) {
                    set({ results, isLoading: false });
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

    reset: () => set({
        matchType: null,
        profile: {},
        strategy: 'distance',
        results: [],
        isLoading: false,
        error: null,
    }),
}));
