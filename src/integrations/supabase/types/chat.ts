import { Json } from './base';

export interface ChatConversation {
  Row: {
    id: number;
    created_at: string;
    user_session_id: string;
    context: Json | null;
    metadata: Json | null;
  };
  Insert: {
    id?: number;
    created_at?: string;
    user_session_id: string;
    context?: Json | null;
    metadata?: Json | null;
  };
  Update: {
    id?: number;
    created_at?: string;
    user_session_id?: string;
    context?: Json | null;
    metadata?: Json | null;
  };
}

export interface ChatMessage {
  Row: {
    id: number;
    conversation_id: number | null;
    created_at: string;
    role: string;
    content: string;
    tokens_used: number | null;
    metadata: Json | null;
  };
  Insert: {
    id?: number;
    conversation_id?: number | null;
    created_at?: string;
    role: string;
    content: string;
    tokens_used?: number | null;
    metadata?: Json | null;
  };
  Update: {
    id?: number;
    conversation_id?: number | null;
    created_at?: string;
    role?: string;
    content?: string;
    tokens_used?: number | null;
    metadata?: Json | null;
  };
}

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
}