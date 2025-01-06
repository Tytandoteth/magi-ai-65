import { Json } from './base';

/**
 * Represents a chat conversation
 */
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
  Relationships: {
    foreignKeyName: string;
    columns: string[];
    isOneToOne: boolean;
    referencedRelation: string;
    referencedColumns: string[];
  }[];
}

/**
 * Represents a chat message within a conversation
 */
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
  Relationships: {
    foreignKeyName: string;
    columns: string[];
    isOneToOne: boolean;
    referencedRelation: string;
    referencedColumns: string[];
  }[];
}