# Quick Markdown Note

A lightweight Raycast extension to quickly capture thoughts, ideas, and snippets into Markdown files.

## Features

- **Multiple Input Methods**: Direct input, text selection, or clipboard
- **Customizable Filenames**: Use Moment.js-style tokens (e.g., `YYYY-MM-DD-HHmm-ss`)
- **Dynamic YAML Frontmatter**: Toggle metadata fields for your PKM workflow

## Installation

### Manual Installation

```bash
# Clone the repository
git clone https://github.com/jhojin7/raycast-quicksave-md.git
cd raycast-quicksave-md

# Install dependencies
npm install

# Build the extension
npm run build

# Import into Raycast
# Open Raycast → Extensions → Add Extension → Select the 'dist' folder
```

## Quick Start

1. **Set up keyboard shortcut** (recommended: ⌥⌘N)
   - Open Raycast Preferences (⌘,)
   - Navigate to **Extensions** → **Quick Markdown Note**
   - Click **Record Hotkey** and press your desired shortcut

2. **Configure notes directory**
   - Set your preferred location in Extension Preferences
   - Default: `~/Documents`
   <!-- TODO: set default as `~/Downloads`, not documents. -->

3. **Start capturing notes**
   - Highlight text anywhere and press your shortcut
   - Or type "Save Note" in Raycast and enter text directly

## Usage Examples

### Quick Capture from Selection

1. Highlight text in any application
2. Press your keyboard shortcut (e.g., ⌥⌘N)
3. Text is automatically saved to `~/Documents/2025-12-07-0000-00.md`

### Direct Input

<!-- TODO: add a feature later for: multi-line content, not a quick entry field. -->

```bash
# In Raycast
> Save Note Meeting notes: Discussed Q1 roadmap
```

### Clipboard Fallback

If no argument is provided and no text is selected, the extension automatically saves your clipboard content.

## Configuration

### Notes Directory

Set where your Markdown files will be saved:

```text
~/Documents              # Default
~/Notes
~/Obsidian/Inbox
~/Dropbox/Notes
```

### Filename Format

<!-- TODO: replace this for url to moment.js documentation. -->

Customize timestamp format using these tokens:

| Token  | Output | Description      |
| ------ | ------ | ---------------- |
| `YYYY` | 2024   | 4-digit year     |
| `YY`   | 24     | 2-digit year     |
| `MM`   | 12     | Month (01-12)    |
| `M`    | 12     | Month (1-12)     |
| `DD`   | 07     | Day (01-31)      |
| `D`    | 7      | Day (1-31)       |
| `HH`   | 14     | Hour 24h (00-23) |
| `H`    | 14     | Hour 24h (0-23)  |
| `hh`   | 02     | Hour 12h (01-12) |
| `h`    | 2      | Hour 12h (1-12)  |
| `mm`   | 30     | Minutes (00-59)  |
| `m`    | 30     | Minutes (0-59)   |
| `ss`   | 25     | Seconds (00-59)  |
| `s`    | 25     | Seconds (0-59)   |
| `A`    | PM     | AM/PM            |
| `a`    | pm     | am/pm            |

**Common Examples:**

- `YYYY-MM-DD-HHmm-ss` → `2024-12-07-1430-25.md` (default)
- `YYYY-MM-DD_HHmmss` → `2024-12-07_143025.md`
- `YYYYMMDD-HHmmss` → `20241207-143025.md`
- `YYYY-MM-DD` → `2024-12-07.md` (daily note)
- `YYYY-MM-DD-hh-mm-A` → `2024-12-07-02-30-PM.md`

### YAML Frontmatter

Enable structured metadata for PKM workflows:

#### Available Fields

| Field    | Description              | Example                     |
| -------- | ------------------------ | --------------------------- |
| `date`   | Auto-generated timestamp | `2024-12-07 14:30`          |
| `type`   | Note type                | `quick-note`                |
| `title`  | First line of content    | `Meeting Notes`             |
| `tags`   | Comma-separated tags     | `[meeting, product]`        |
| `author` | Your name                | `John Doe`                  |
| `source` | Reference URL or book    | Left empty for manual entry |

<!-- TODO: add a feature later for fetching source of entry. (e.g., `source` from raycast clipboard metadata) -->

## Content Resolution Priority

The extension resolves content in this order:

1. **Argument**: Text provided directly in Raycast
2. **Selection**: Currently highlighted text in any app
3. **Clipboard**: Current clipboard content

If all sources are empty, an error message is shown.

## Development

### Build Commands

```bash
npm install           # Install dependencies
npm run dev          # Run in development mode
npm run build        # Build the extension
npm run lint         # Run ESLint checks
npm run lint:fix     # Fix linting issues
npm run publish      # Publish to Raycast Store
```

### Project Structure

```text
raycast-quicksave-md/
├── src/
│   ├── save-note.tsx      # Main command logic
│   └── show-info.tsx      # Extension info view
├── assets/
│   └── command-icon.png   # Extension icon
├── package.json           # Extension manifest
├── PRD.md                 # Product requirements
├── AGENTS.md              # Development guidelines
└── README.md              # This file
```

### Code Style

- **Language**: TypeScript with strict mode
- **Imports**: Named imports from @raycast/api
- **File naming**: kebab-case for files, PascalCase for components
- **Functions**: Async/await over promises
- **Error handling**: Toast messages for errors, HUD for success
- **File paths**: Use `path.join()` for cross-platform compatibility

## Troubleshooting

### Notes not saving?

- **Check directory permissions**: Ensure the notes directory is writable
- **Verify path exists**: The extension will try to create it, but parent directories must exist
- **Check for invalid characters**: Avoid special characters in filename format

### Frontmatter not appearing?

- **Enable in preferences**: Check "Enable frontmatter" checkbox
- **Enable at least one field**: At least one frontmatter field must be toggled on
- **Check YAML syntax**: Ensure your default tags/author don't contain invalid YAML characters

### Invalid date format?

- **Use valid tokens**: See the filename format table above
- **Test with default**: Try `YYYY-MM-DD-HHmm-ss` first
- **Avoid conflicts**: Longer tokens (like `MM`) must be listed before shorter ones (`M`)

### No content to save error?

- **Verify source**: Check if you have text selected, in arguments, or in clipboard
- **Clipboard permissions**: Raycast needs clipboard access permissions
- **Selection timing**: Try selecting text and immediately pressing the shortcut

## Use Cases

### Personal Knowledge Management

- **Zettelkasten**: Quick capture for atomic notes with tags
- **Daily Notes**: Set filename to `YYYY-MM-DD` and append to same file
- **Inbox Processing**: Use `inbox` tag for later organization

### Research & Writing

- **Web Clipping**: Highlight quotes and save with source URL
- **Book Notes**: Configure author field for attribution
- **Meeting Notes**: Auto-timestamp every thought during meetings

### Development Workflow

- **Code Snippets**: Save useful code patterns with tags
- **Bug Reports**: Quick capture of error messages
- **Ideas**: Rapid ideation without context switching

## Keyboard Shortcuts Reference

Recommended shortcuts (set in Raycast Preferences):

- **Save Note**: ⌥⌘N (Option + Command + N)
- **Show Info**: ⌥⌘I (Option + Command + I)

## Resources

- [Raycast Extensions Documentation](https://developers.raycast.com/)
<!-- TODO: use github flavored markdown, not this... -->
- [Markdown Guide](https://www.markdownguide.org/)
- [YAML Frontmatter Spec](https://assemble.io/docs/YAML-front-matter.html)
