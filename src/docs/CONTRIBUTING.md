# Contributing to Magi AI

## Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and fill in required values
4. Start development server: `npm run dev`

## Code Structure

```
src/
├── components/     # React components
├── hooks/         # Custom React hooks
├── services/      # Business logic and API calls
├── types/         # TypeScript type definitions
└── utils/         # Utility functions
```

## Coding Standards

1. **TypeScript**
   - Use strict type checking
   - Define interfaces for all props
   - Avoid using `any` type

2. **Components**
   - Keep components small and focused
   - Use functional components with hooks
   - Document props with JSDoc comments

3. **State Management**
   - Use React Query for server state
   - Use local state for UI-only state
   - Document state shape and usage

4. **Error Handling**
   - Use error boundaries for component errors
   - Log errors appropriately
   - Provide user-friendly error messages

5. **Testing**
   - Write unit tests for utilities
   - Write integration tests for components
   - Test error cases and edge cases

## Pull Request Process

1. Create a feature branch
2. Update documentation
3. Add tests if needed
4. Submit PR with clear description
5. Address review comments

## Documentation

- Add JSDoc comments to components and functions
- Update README.md for major changes
- Keep ARCHITECTURE.md up to date