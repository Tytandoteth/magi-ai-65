import { GameAgent } from "@virtuals-protocol/game";
import { magiWorker } from "./worker";

export class MagiGameAgent {
  private static instance: MagiGameAgent;
  private agent: GameAgent | null = null;

  private constructor() {}

  static getInstance(): MagiGameAgent {
    if (!MagiGameAgent.instance) {
      MagiGameAgent.instance = new MagiGameAgent();
    }
    return MagiGameAgent.instance;
  }

  async initialize() {
    if (this.agent) return;

    try {
      this.agent = new GameAgent({
        name: "Magi",
        goal: "Provide comprehensive DeFi insights and token analysis",
        description: "An AI agent specialized in DeFi market analysis and token information",
        workers: [magiWorker],
        getAgentState: async () => {
          const { data: marketStats } = await supabase
            .from('defi_market_data')
            .select('market_cap, total_volume')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          return {
            totalMarketCap: marketStats?.market_cap || 0,
            volume24h: marketStats?.total_volume || 0,
            lastUpdated: new Date().toISOString()
          };
        },
      });

      this.agent.setLogger((msg) => {
        console.log(`[Magi Agent] ${msg}`);
      });

      await this.agent.init();
      console.log('Magi Game Agent initialized successfully');
    } catch (error) {
      console.error('Error initializing Magi Game Agent:', error);
      throw error;
    }
  }

  async processMessage(content: string): Promise<string> {
    if (!this.agent) {
      throw new Error('Agent not initialized');
    }

    try {
      const worker = this.agent.getWorkerById(magiWorker.id);
      const response = await worker.runTask(content, { verbose: true });
      return response;
    } catch (error) {
      console.error('Error processing message with Game Agent:', error);
      throw error;
    }
  }
}