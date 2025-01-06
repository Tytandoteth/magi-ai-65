export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

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