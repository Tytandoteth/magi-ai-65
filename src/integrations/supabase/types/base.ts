export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      [key: string]: {
        Row: Record<string, any>
        Insert: Record<string, any>
        Update: Record<string, any>
        Relationships: Array<{
          foreignKeyName: string
          columns: string[]
          isOneToOne: boolean
          referencedRelation: string
          referencedColumns: string[]
        }>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof any, U = never> = {
  [key: string]: any;
}

export type TablesInsert<T extends keyof any, U = never> = {
  [key: string]: any;
}

export type TablesUpdate<T extends keyof any, U = never> = {
  [key: string]: any;
}

export type Enums<T extends keyof any, U = never> = {
  [key: string]: any;
}

export type CompositeTypes<T extends keyof any, U = never> = {
  [key: string]: any;
}