import { Database } from './database';

type PublicSchema = Database['public'];

export type Enums<T extends keyof PublicSchema['Enums']> = PublicSchema['Enums'][T];