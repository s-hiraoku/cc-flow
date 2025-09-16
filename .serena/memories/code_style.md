# CC-Flow Code Style and Conventions

## TypeScript Style
- **File naming**: PascalCase for classes (`UITheme.ts`), camelCase for utilities
- **Import style**: ESModules with .js extensions for compiled imports
- **Type definitions**: Explicit interfaces for public APIs
- **Access modifiers**: Use `private`, `protected`, `public` explicitly
- **Null handling**: Prefer strict null checks, use optional chaining

## UI/TUI Design Patterns
- **Component-based architecture**: BaseScreen, TUIComponents pattern
- **Responsive design**: Adapt to terminal width (40-120 chars)
- **Color consistency**: Use UITheme.colors palette throughout
- **Icon system**: Consistent emoji usage via UITheme.icons
- **Box drawing**: Modern rounded style (╭╮╰╯) vs sharp (┌┐└┘)

## File Organization
```
src/
├── ui/
│   ├── screens/        # Screen components (WelcomeScreen.ts)
│   ├── components/     # Reusable UI components
│   └── themes/         # Theme and styling
├── core/              # Business logic
├── services/          # External integrations
└── cli/               # Entry points
```

## Error Handling
- Use Japanese emoji patterns consistently (✅❌⚠️ℹ️)
- Graceful degradation for terminal compatibility
- Comprehensive error messages with suggested fixes

## Testing
- Vitest for unit testing
- Test files use `.test.ts` suffix
- Focus on public API testing and user workflows

## Documentation
- JSDoc for public methods and interfaces
- README files for major components
- Inline comments for complex logic only