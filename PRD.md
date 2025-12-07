Here is the Technical Product Requirements Document (PRD) based on your specifications.

# Technical PRD: Quick Markdown Note Extension

## 1. Overview

A Raycast extension designed for rapid text capture. It creates a new Markdown file in a specific local directory with a timestamped filename. The extension supports both direct text input (Quick Capture) and capturing the current system text selection.

## 2. User Stories

- **As a user**, I want to type "Save Note" followed by my thought so I can quickly offload ideas without opening an editor.
- **As a user**, I want to execute the command without arguments to instantly save the text I have currently highlighted in any app.
- **As a user**, I want the option to include or exclude YAML frontmatter so the notes fit my specific Personal Knowledge Management (PKM) schema.
- **As a user**, I want the file to be named automatically by the current time so I never have to think about naming conventions.

## 3. Configuration & Preferences

The extension exposes the following settings in the Raycast Preferences menu:

### Core Settings

| Preference Key      | Label              | Type               | Default              | Description                                               |
| :------------------ | :----------------- | :----------------- | :------------------- | :-------------------------------------------------------- |
| `notesDirectory`    | Notes Directory    | Directory Picker   | `~/Documents`        | The folder where `.md` files will be created.             |
| `filenameFormat`    | Filename Format    | Text Field         | `YYYY-MM-DD-HHmm-ss` | Template for filename using Moment.js-style tokens.       |
| `enableFrontmatter` | Enable Frontmatter | Checkbox (Boolean) | `true`               | If checked, adds YAML frontmatter to the top of the note. |

### Frontmatter Field Settings

| Preference Key             | Label          | Type               | Default | Description                                           |
| :------------------------- | :------------- | :----------------- | :------ | :---------------------------------------------------- |
| `frontmatterIncludeDate`   | Include date   | Checkbox (Boolean) | `true`  | Include 'date' field with auto-generated timestamp.   |
| `frontmatterIncludeType`   | Include type   | Checkbox (Boolean) | `true`  | Include 'type' field (always set to "quick-note").    |
| `frontmatterIncludeTitle`  | Include title  | Checkbox (Boolean) | `false` | Include 'title' field auto-extracted from first line. |
| `frontmatterIncludeTags`   | Include tags   | Checkbox (Boolean) | `false` | Include 'tags' field with default tags.               |
| `frontmatterDefaultTags`   | Default Tags   | Text Field         | `""`    | Comma-separated tags (e.g., "note, quick-capture").   |
| `frontmatterIncludeAuthor` | Include author | Checkbox (Boolean) | `false` | Include 'author' field with default author name.      |
| `frontmatterDefaultAuthor` | Default Author | Text Field         | `""`    | Your name to include in the author field.             |
| `frontmatterIncludeSource` | Include source | Checkbox (Boolean) | `false` | Include 'source' field (left empty for manual entry). |

## 4. Functional Requirements

### 4.1. Command: "Save Note"

- **Mode:** `no-view` (Background execution).
- **Arguments:**
  - `content` (Type: Text, Optional, Placeholder: "Text to save...").

### 4.2. Logic Flow

1. **Validation:**
   - Check if `notesDirectory` exists and is writable
   - Expand `~` to home directory path
   - If not accessible, attempt to create directory recursively
   - If creation fails, show error Toast and abort

2. **Content Resolution (Priority Order):**
   1. **Argument:** If the user provided text in the Raycast argument field, use it
   2. **Selection:** If argument is empty, attempt to fetch `getSelectedText()`
   3. **Clipboard (Fallback):** If selection is empty/unavailable, fetch clipboard text via `Clipboard.readText()`
   4. **Failure:** If all sources are empty, show Toast "No content to save" and abort

3. **Filename Generation:**
   - Use customizable `filenameFormat` template (default: `YYYY-MM-DD-HHmm-ss`)
   - Support Moment.js-style tokens: YYYY, YY, MM, M, DD, D, HH, H, hh, h, mm, m, ss, s, A, a
   - Replace tokens in order of length (longer first) to avoid partial replacements
   - Append `.md` extension
   - Example: `2024-12-07-1430-25.md`

4. **Content Formatting:**
   - **If `enableFrontmatter` is TRUE and at least one frontmatter field is enabled:**

     ```markdown
     ---
     date: 2024-12-07 14:30 # If frontmatterIncludeDate
     type: quick-note # If frontmatterIncludeType
     title: "First line of content" # If frontmatterIncludeTitle
     tags: [note, quick-capture] # If frontmatterIncludeTags
     author: "John Doe" # If frontmatterIncludeAuthor
     source: "" # If frontmatterIncludeSource
     ---

     [Resolved Content]
     ```

   - **If `enableFrontmatter` is FALSE or no fields enabled:**

     ```markdown
     [Resolved Content]
     ```

5. **File Operations:**
   - Write the formatted content to `notesDirectory/filename` with UTF-8 encoding
   - Use `path.join()` for cross-platform path compatibility

6. **Feedback:**
   - **Success:** Display HUD notification "Note Saved: [filename]" that appears outside Raycast window
   - Raycast automatically closes after `showHUD()` (combines notification + window closing)
   - **Error:** Display Toast with error message and keep Raycast open so user can read it

## 5. Technical Implementation Strategy

### 5.1. Tech Stack

- **Language:** TypeScript / Node.js (Raycast standard).
- **Core Libraries:**
  - `@raycast/api`: For UI (Toast), Preferences, Clipboard, and Selection.
  - `fs/promises`: For file system writing.
  - `path`: For handling directory paths safely.
  - `date-fns` (optional) or native `Date`: For timestamp formatting.

### 5.2. Code Skeleton (Conceptual)

```typescript
import {
  LaunchProps,
  getPreferenceValues,
  showToast,
  Toast,
  getSelectedText,
  Clipboard,
  showHUD,
} from "@raycast/api";
import fs from "fs/promises";
import path from "path";

interface Preferences {
  notesDirectory: string;
  enableFrontmatter: boolean;
}

export default async function Command(props: LaunchProps<{ arguments: { content?: string } }>) {
  const prefs = getPreferenceValues<Preferences>();

  // 1. Resolve Content
  let noteContent = props.arguments.content;

  if (!noteContent) {
    try {
      noteContent = await getSelectedText();
    } catch (e) {
      // If no selection, fall back to clipboard logic if desired, or skip
    }
  }

  // Fallback to Clipboard if specifically requested or if selection failed
  if (!noteContent) {
    const clipboardItem = await Clipboard.readText();
    noteContent = clipboardItem;
  }

  if (!noteContent || noteContent.trim().length === 0) {
    await showToast({ style: Toast.Style.Failure, title: "No content to save" });
    return;
  }

  // 2. Generate Filename
  const now = new Date();
  // Format: YYYY-MM-DD-HHmmss
  const filename = `${now.toISOString().replace(/[:.]/g, "-").slice(0, 19)}.md`;
  const filePath = path.join(prefs.notesDirectory, filename);

  // 3. Format Content
  let finalOutput = noteContent;
  if (prefs.enableFrontmatter) {
    finalOutput = `---\ndate: ${now.toISOString()}\n---\n\n${noteContent}`;
  }

  // 4. Write File
  try {
    await fs.writeFile(filePath, finalOutput);
    // Show HUD notification (appears outside Raycast) and automatically close Raycast
    await showHUD(`Note Saved: ${filename}`);
  } catch (error) {
    // Use toast for errors to keep Raycast open so user can see the error
    await showToast({
      style: Toast.Style.Failure,
      title: "Failed to save note",
      message: String(error),
    });
  }
}
```

## 6. Edge Cases & Error Handling

- **Directory Permissions:** If the extension cannot write to the folder (e.g., system protected), catch the error and display "Permission Denied" in the Toast
- **Empty Selection:** If the user runs the command with no arguments and no text is selected, the Toast should clearly say "No content to save" with details
- **Path Not Found:** If the configured directory doesn't exist, try to `mkdir` it recursively; if that fails, show error Toast
- **Invalid Filename Format:** If user provides invalid tokens in filename format, gracefully fall back to default format
- **Frontmatter Edge Cases:**
  - If `enableFrontmatter` is true but all field toggles are false, don't add frontmatter
  - If default tags contain commas, properly parse and clean them
  - If title extraction from first line is empty, use empty string
  - Properly escape YAML special characters in title and author fields
- **File Write Conflicts:** Seconds are included in default filename to prevent conflicts during rapid capture
- **Home Directory Expansion:** Always expand `~` to actual home directory path before file operations
- **Cross-platform Compatibility:** Use `path.join()` for all path operations to support Windows/Mac/Linux

## 7. Implementation Notes

### Filename Token Processing

The token replacement algorithm processes longer tokens first to avoid partial replacements:

- Example: `YYYY` (4 chars) is replaced before `YY` (2 chars)
- This prevents `YYYY` from becoming `20YY` if `YY` is processed first

### Frontmatter Field Generation

Each frontmatter field has:

1. A toggle to enable/include it (`frontmatterInclude*`)
2. Optional default value setting (`frontmatterDefault*`)
3. Auto-generation logic (date, type, title)

Fields are only added if:

- `enableFrontmatter` is true
- The specific field's include toggle is true
- At least one field is enabled (prevents empty frontmatter)

### User Feedback Strategy

- **HUD (`showHUD`)**: Used for success messages because it:
  - Appears outside Raycast window (less intrusive)
  - Automatically closes Raycast
  - Provides quick confirmation without requiring user interaction
- **Toast (`showToast`)**: Used for errors because it:
  - Keeps Raycast window open
  - Allows user to read the error message
  - Provides opportunity to correct the issue

### Content Source Priority

The three-tier content resolution ensures users always have multiple ways to provide input:

1. **Argument** (most explicit): Direct user input in Raycast
2. **Selection** (most common): Highlighted text in any app
3. **Clipboard** (fallback): Whatever was last copied

This design maximizes flexibility and reduces friction in the note-taking workflow.
