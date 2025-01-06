import { Json } from './base';

/**
 * Represents a chat conversation in the system
 * @property Row - The data structure for reading conversation records
 * @property Insert - The data structure for inserting new conversations
 * @property Update - The data structure for updating existing conversations
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
 * Represents an individual message within a chat conversation
 * @property Row - The data structure for reading message records
 * @property Insert - The data structure for inserting new messages
 * @property Update - The data structure for updating existing messages
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