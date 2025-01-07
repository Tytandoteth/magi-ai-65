# 🌟 Magi AI - Your Gateway to DeFAI

Magi AI is the official AI agent for Magnify.cash, pioneering DeFAI (Decentralized Finance Augmented by Artificial Intelligence). Our mission is to simplify DeFi, provide real-time insights, and enable seamless interactions with the MAG token ecosystem.

## 🚀 Quick Start

```bash
# Clone repository
git clone <repository-url>

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🏗 Architecture

### Core Components

1. **Chat Interface**
   - `ChatContainer`: Main chat interface container
   - `ChatMessage`: Individual message renderer
   - `ChatInput`: User input handler
   - `TypingIndicator`: AI response indicator

2. **Token Services**
   - `TokenInfoService`: Token data management
   - `TokenRepository`: Data persistence layer
   - `TokenFormatter`: Response formatting
   - `TokenResolver`: Token identification

3. **Planners**
   - `HighLevelPlanner`: Strategic decision making
   - `LowLevelPlanner`: Task execution
   - `MemoryManager`: Context management

### Data Flow

1. User Input → ChatInput
2. Message Processing → TokenInfoService
3. Data Fetching → TokenRepository
4. Response Formatting → TokenFormatter
5. UI Update → ChatContainer

## 📊 Data Management

### Supabase Tables

- `chat_conversations`: Conversation tracking
- `chat_messages`: Message storage
- `token_metadata`: Token information
- `defi_market_data`: Market metrics
- `mag_token_analytics`: MAG token data

### API Integrations

- CoinGecko: Token prices
- DefiLlama: Protocol TVL
- Etherscan: On-chain data
- Twitter: Social metrics

## 🛠 Development

### Prerequisites

- Node.js 18+
- npm 9+
- Supabase account

### Environment Setup

1. Copy `.env.example` to `.env`
2. Fill required API keys:
   - SUPABASE_URL
   - SUPABASE_ANON_KEY
   - COINGECKO_API_KEY
   - ETHERSCAN_API_KEY

### Key Features

1. **Real-time Market Data**
   - Token prices
   - TVL tracking
   - Market trends

2. **AI Analysis**
   - Market insights
   - Trend analysis
   - Risk assessment

3. **User Experience**
   - Responsive design
   - Error handling
   - Loading states

### Testing

```bash
# Run unit tests
npm test

# Run specific test suite
npm test TokenInfoService
```

## 📚 Documentation

- [API Documentation](./src/docs/API.md)
- [Architecture Overview](./src/docs/ARCHITECTURE.md)
- [Contributing Guide](./src/docs/CONTRIBUTING.md)

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License - see LICENSE file

## 🆘 Support

- GitHub Issues
- Discord Community
- Documentation Wiki

---

Built with ❤️ by the Magnify.cash team