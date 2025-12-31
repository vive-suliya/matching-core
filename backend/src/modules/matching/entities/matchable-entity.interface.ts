
export interface MatchableEntity {
    id: string;
    type: 'user' | 'team';
    profile: Record<string, any>;
}

export interface Match {
    entities: MatchableEntity[];
    score: number;
    status: 'proposed' | 'accepted' | 'rejected' | 'expired';
    metadata: Record<string, any>;
}
