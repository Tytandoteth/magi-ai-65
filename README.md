# 🌟 Magi AI - Your Gateway to DeFAI

Magi AI is the official AI agent for Magnify.cash, pioneering the concept of DeFAI (Decentralized Finance Augmented by Artificial Intelligence). Our mission is to simplify decentralized finance, empower users with real-time insights, and provide seamless interactions with the MAG token ecosystem and Smart Banks.

## 🎯 Core Features

- Real-time DeFi insights and analytics
- MAG token ecosystem integration
- Smart Bank management
- AI-powered financial guidance
- Market trend analysis

## 🏗 Architecture Overview

### Components Structure

#### Core Components

1. **ChatContainer (`src/components/ChatContainer.tsx`)**
   - Main container for the chat interface
   - Manages message display and scrolling
   - Integrates chat input and typing indicators
   - Props: `chatState`, `onSendMessage`

2. **ChatMessage (`src/components/ChatMessage.tsx`)**
   - Renders individual chat messages
   - Handles message formatting
   - Displays user/AI attribution
   - Includes feedback buttons for AI responses
   - Props: `message`

3. **ChatInput (`src/components/ChatInput.tsx`)**
   - Handles user message input
   - Manages message submission
   - Supports keyboard shortcuts
   - Props: `onSend`, `disabled`

4. **TypingIndicator (`src/components/TypingIndicator.tsx`)**
   - Shows AI typing animation
   - Provides visual feedback during AI response generation

#### Service Layer

1. **HighLevelPlanner (`src/services/planners/HighLevelPlanner.ts`)**
   - Determines appropriate actions based on user input
   - Manages conversation context
   - Handles feedback processing

2. **LowLevelPlanner (`src/services/planners/LowLevelPlanner.ts`)**
   - Executes specific tasks based on HLP decisions
   - Manages token information retrieval
   - Handles market data processing

3. **MemoryManager (`src/services/memory/MemoryManager.ts`)**
   - Manages conversation state
   - Handles data persistence
   - Provides context retrieval

### Custom Hooks

1. **useChat (`src/hooks/use-chat.tsx`)**
   - Manages chat state and interactions
   - Handles message processing
   - Integrates with API services

2. **useChatMessages (`src/hooks/use-chat-messages.tsx`)**
   - Manages message state
   - Handles message updates
   - Controls loading states

3. **useMagi (`src/hooks/use-magi.tsx`)**
   - Coordinates AI processing
   - Manages HLP and LLP interactions
   - Handles response generation

## 🔄 Data Flow

1. User inputs message via ChatInput
2. useChat hook processes the input
3. Message is sent to HighLevelPlanner
4. HLP determines appropriate action
5. LowLevelPlanner executes specific tasks
6. Response is generated and displayed
7. Feedback is collected and processed

## 🗄️ Database Structure

The application uses Supabase for data persistence with the following key tables:
- `chat_conversations`: Stores conversation contexts
- `chat_messages`: Individual message storage
- `ai_agent_metrics`: Performance tracking
- `market_data`: Financial metrics storage

## 🔗 Quick Links

- **Live Project**: [Magi AI on Lovable](https://lovable.dev/projects/32bcb589-0e15-42c0-b72a-cfbb05f87477)
- **Documentation**: [Custom Domains](https://docs.lovable.dev/tips-tricks/custom-domain/)

## 🚀 Getting Started

### 1. Using Lovable (Recommended)

Simply visit the [Magi AI Project](https://lovable.dev/projects/32bcb589-0e15-42c0-b72a-cfbb05f87477) and start interacting with the AI. Changes made via Lovable are automatically committed to the repository.

### 2. Local Development

Prerequisites:
- Node.js & npm - [Install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🛠 Technology Stack

Our platform leverages modern technologies for optimal performance:

- **Vite** - Lightning-fast build tool
- **TypeScript** - Enhanced code reliability
- **React** - Dynamic UI components
- **shadcn-ui** - Accessible component library
- **Tailwind CSS** - Utility-first styling
- **Supabase** - Backend and database management

## 📦 Deployment

### Quick Deploy
1. Open [Lovable](https://lovable.dev/projects/32bcb589-0e15-42c0-b72a-cfbb05f87477)
2. Click Share → Publish

### Custom Domain
While Lovable doesn't currently support custom domains, you can deploy to platforms like Netlify for custom domain support. See our [Custom Domains Documentation](https://docs.lovable.dev/tips-tricks/custom-domain/) for details.

## 🤝 Contributing

We welcome contributions! Please feel free to submit pull requests or open issues for any improvements you'd like to suggest.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Built with ❤️ by the Magnify.cash team