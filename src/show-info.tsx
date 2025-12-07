// @ts-nocheck
import { Detail, ActionPanel, Action, openExtensionPreferences } from "@raycast/api";

export default function Command() {
  const markdown = `
# Quick Markdown Note

A lightweight personal knowledge management tool for rapid note-taking in Raycast.

## 🎯 About

This extension helps you quickly capture thoughts, ideas, and snippets into timestamped Markdown files. Perfect for building a personal knowledge base or Zettelkasten system.

**GitHub:** [Placeholder - Add your repository URL here]

## ⌨️ Keyboard Shortcuts

To set up keyboard shortcuts for this extension:

1. Open Raycast Preferences (⌘,)
2. Navigate to **Extensions** → **Quick Markdown Note**
3. Click on **Save Note** command
4. Click **Record Hotkey** and press your desired shortcut

**Recommended shortcuts:**
- Save Note: ⌥⌘N (Option + Command + N)
- Show Info: ⌥⌘I (Option + Command + I)

## 📝 Usage Examples

### Quick Capture
1. Highlight text in any application
2. Press your keyboard shortcut
3. Text is automatically saved to a timestamped file

### Direct Input
1. Open Raycast and type "Save Note"
2. Enter your text directly
3. Press Enter to save

### Clipboard Fallback
If no text is selected and no argument is provided, the extension will save whatever is currently in your clipboard.

## 🗂️ Filename Format

You can customize the filename format using Moment.js-style tokens in Extension Preferences.

**Default:** \`YYYY-MM-DD-HHmm-ss\` → \`2024-03-15-1430-25.md\`

**Available Tokens:**

| Token | Output | Description |
|-------|--------|-------------|
| YYYY | 2024 | 4-digit year |
| YY | 24 | 2-digit year |
| MM | 03 | Month (01-12) |
| M | 3 | Month (1-12) |
| DD | 15 | Day (01-31) |
| D | 15 | Day (1-31) |
| HH | 14 | Hour 24h (00-23) |
| H | 14 | Hour 24h (0-23) |
| hh | 02 | Hour 12h (01-12) |
| h | 2 | Hour 12h (1-12) |
| mm | 30 | Minutes (00-59) |
| m | 30 | Minutes (0-59) |
| ss | 25 | Seconds (00-59) |
| s | 25 | Seconds (0-59) |
| A | PM | AM/PM |
| a | pm | am/pm |

**Common Examples:**
- \`YYYY-MM-DD_HHmmss\` → \`2024-03-15_143025.md\`
- \`YYYYMMDD-HHmmss\` → \`20240315-143025.md\`
- \`YYYY-MM-DD\` → \`2024-03-15.md\` (daily note)
- \`YYYY-MM-DD-hh-mm-A\` → \`2024-03-15-02-30-PM.md\`

## 🏷️ YAML Frontmatter

Enable frontmatter in preferences to add structured metadata to your notes.

**Available Fields:**
- **date** - Auto-generated timestamp
- **type** - Always set to "quick-note"
- **title** - Auto-extracted from first line of content
- **tags** - Comma-separated tags (configure defaults in preferences)
- **author** - Your name (configure in preferences)
- **source** - Left empty for manual entry

**Example Output:**
\`\`\`markdown
---
date: 2024-03-15 14:30
type: quick-note
title: "Meeting Notes with Product Team"
tags: [meeting, product, notes]
author: "John Doe"
source: ""
---

Discussed the new feature roadmap...
\`\`\`

## ⚙️ Configuration

All settings can be configured in Extension Preferences:

1. **Notes Directory** - Where files are saved
2. **Filename Format** - Customize timestamp format
3. **Frontmatter Options** - Toggle metadata fields
4. **Default Values** - Set author name and default tags

## 💡 Tips

- **Zettelkasten Integration:** Use consistent tags and link notes with \`[[wiki-links]]\`
- **Daily Notes:** Set filename format to \`YYYY-MM-DD\` (overwrites same-day notes)
- **Quick Tags:** Configure default tags like \`inbox, unsorted\` for later processing
- **Obsidian/Logseq Compatible:** YAML frontmatter works with popular PKM tools

## 🐛 Troubleshooting

**Notes not saving?**
- Check that the Notes Directory exists and is writable
- Verify the path doesn't contain invalid characters

**Frontmatter not appearing?**
- Ensure "Enable frontmatter" is checked in preferences
- At least one frontmatter field must be enabled

**Invalid date format?**
- Verify your filename format uses valid tokens
- Test with the default format first

## 📚 Resources

- [Markdown Guide](https://www.markdownguide.org/)
- [YAML Frontmatter Spec](https://assemble.io/docs/YAML-front-matter.html)
- [Zettelkasten Method](https://zettelkasten.de/introduction/)
`;

  return (
    <Detail
      markdown={markdown}
      actions={
        <ActionPanel>
          <Action title="Open Extension Preferences" onAction={openExtensionPreferences} />
        </ActionPanel>
      }
    />
  );
}
