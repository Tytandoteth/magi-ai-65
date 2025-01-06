import { Json } from './base';

/**
 * Represents metrics and analytics data for AI agent interactions
 */
export interface AIAgentMetrics {
  Row: {
    id: number;
    created_at: string;
    message_id: number | null;
    response_time_ms: number | null;
    tokens_total: number | null;
    context_tokens: number | null;
    completion_tokens: number | null;
    market_context: Json | null;
    effectiveness_score: number | null;
    feedback: Json | null;
  };
  Insert: {
    id?: number;
    created_at?: string;
    message_id?: number | null;
    response_time_ms?: number | null;
    tokens_total?: number | null;
    context_tokens?: number | null;
    completion_tokens?: number | null;
    market_context?: Json | null;
    effectiveness_score?: number | null;
    feedback?: Json | null;
  };
  Update: {
    id?: number;
    created_at?: string;
    message_id?: number | null;
    response_time_ms?: number | null;
    tokens_total?: number | null;
    context_tokens?: number | null;
    completion_tokens?: number | null;
    market_context?: Json | null;
    effectiveness_score?: number | null;
    feedback?: Json | null;
  };
  Relationships: {
    foreignKeyName: string;
    columns: string[];
    isOneToOne: boolean;
    referencedRelation: string;
    referencedColumns: string[];
  }[];
}