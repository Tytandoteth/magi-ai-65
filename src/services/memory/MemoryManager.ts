import { supabase } from "@/integrations/supabase/client";

export class MemoryManager {
  private static instance: MemoryManager;
  private memory: Record<string, any> = {};

  private constructor() {}

  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  async storeData(key: string, value: any): Promise<void> {
    console.log(`Storing data for key: ${key}`, value);
    this.memory[key] = value;

    // Persist to Supabase if needed
    if (key.startsWith('persistent_')) {
      try {
        const { error } = await supabase
          .from('chat_conversations')
          .upsert({
            user_session_id: key,
            context: value,
          });

        if (error) throw error;
      } catch (error) {
        console.error('Error persisting data:', error);
      }
    }
  }

  retrieveData(key: string): any {
    console.log(`Retrieving data for key: ${key}`);
    return this.memory[key] || null;
  }

  async clearMemory(): Promise<void> {
    console.log('Clearing memory');
    this.memory = {};
  }
}