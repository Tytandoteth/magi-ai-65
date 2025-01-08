import { createMagiAgent } from "./agent";
import { magiWorker } from "./worker";

export class MagiGameService {
  private static instance: MagiGameService;
  private agent: any;
  private initialized: boolean = false;

  private constructor() {}

  static getInstance(): MagiGameService {
    if (!MagiGameService.instance) {
      MagiGameService.instance = new MagiGameService();
    }
    return MagiGameService.instance;
  }

  async initialize(apiKey: string) {
    if (!this.initialized) {
      console.log('Initializing Magi Game Service');
      this.agent = createMagiAgent(apiKey);
      await this.agent.init();
      this.initialized = true;
    }
  }

  async processMessage(content: string): Promise<string> {
    if (!this.initialized) {
      throw new Error('MagiGameService not initialized');
    }

    console.log('Processing message with Game SDK:', content);
    
    try {
      const worker = this.agent.getWorkerById(magiWorker.id);
      const response = await worker.runTask(content, { verbose: true });
      return response;
    } catch (error) {
      console.error('Error processing message with Game SDK:', error);
      throw error;
    }
  }
}