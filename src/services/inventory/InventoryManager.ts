export class InventoryManager {
  private static instance: InventoryManager;
  private inventory: Record<string, any> = {};

  private constructor() {
    // Initialize with some default templates
    this.inventory = {
      tweetTemplates: {
        marketUpdate: "Current #DeFi Market Update:\n${metrics}\nStay informed with Magi AI",
        priceAlert: "🚨 Price Alert: ${token} has moved ${percentage}% in the last 24h",
      },
      mediaAssets: {
        logo: "/logo.png",
        defaultChart: "/placeholder-chart.png",
      }
    };
  }

  static getInstance(): InventoryManager {
    if (!InventoryManager.instance) {
      InventoryManager.instance = new InventoryManager();
    }
    return InventoryManager.instance;
  }

  addItem(itemName: string, itemData: any): void {
    console.log(`Adding item: ${itemName}`, itemData);
    this.inventory[itemName] = itemData;
  }

  getItem(itemName: string): any {
    console.log(`Getting item: ${itemName}`);
    return this.inventory[itemName] || null;
  }

  listItems(): string[] {
    return Object.keys(this.inventory);
  }
}