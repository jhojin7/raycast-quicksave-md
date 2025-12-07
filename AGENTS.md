# AGENTS.md - Raycast Quick Markdown Note Extension

## Build/Test Commands

- `npm install` - Install dependencies including @raycast/api
- `npm run build` - Build the extension
- `npm run dev` - Run in development mode
- `npm run lint` - Run ESLint checks
- `npm test` - Run tests (when implemented)
- `npm run publish` - Publish to Raycast Store

## Code Style Guidelines

- **Language**: TypeScript with strict mode enabled
- **Imports**: Use named imports from @raycast/api, group by external/internal
- **File naming**: kebab-case for files, PascalCase for components
- **Functions**: Async/await over promises, handle errors with try-catch
- **Error handling**: Always show user-friendly Toast messages on failure
- **Types**: Define interfaces for Preferences and LaunchProps arguments
- **Constants**: UPPER_SNAKE_CASE for config values
- **File paths**: Use path.join() for cross-platform compatibility
- **Raycast APIs**: Prefer no-view commands for background operations
- **Validation**: Check directory exists before file operations
- **User feedback**: Use showToast() with appropriate styles (Success/Failure)
- **Date formatting**: Customizable via Moment.js-style tokens (YYYY, MM, DD, HH, mm, ss, etc.)
- **Content resolution**: Follow priority: argument → selection → clipboard
- **TypeScript workarounds**: Use `// @ts-nocheck` for files with React 18 type conflicts
- **Frontmatter**: Dynamic YAML frontmatter based on user preferences
