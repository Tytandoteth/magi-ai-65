import { Database } from './database';

type PublicSchema = Database['public'];

export type CompositeTypes<T extends keyof PublicSchema['CompositeTypes']> = 
  PublicSchema['CompositeTypes'][T];