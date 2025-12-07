Here is the Technical Product Requirements Document (PRD) based on your specifications.

# Technical PRD: Quick Markdown Note Extension

## 1. Overview
A Raycast extension designed for rapid text capture. It creates a new Markdown file in a specific local directory with a timestamped filename. The extension supports both direct text input (Quick Capture) and capturing the current system text selection.

## 2. User Stories
*   **As a user**, I want to type "Save Note" followed by my thought so I can quickly offload ideas without opening an editor.
*   **As a user**, I want to execute the command without arguments to instantly save the text I have currently highlighted in any app.
*   **As a user**, I want the option to include or exclude YAML frontmatter so the notes fit my specific Personal Knowledge Management (PKM) schema.
*   **As a user**, I want the file to be named automatically by the current time so I never have to think about naming conventions.

## 3. Configuration & Preferences
The extension will expose the following settings in the Raycast Preferences menu:

| Preference Key | Label | Type | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `notesDirectory` | Note Location | Directory Picker | `~/Documents` | The folder where `.md` files will be created. |
| `enableFrontmatter`| Add Metadata | Checkbox (Boolean) | `true` | If checked, adds YAML frontmatter to the top of the note. |

## 4. Functional Requirements

### 4.1. Command: "Save Note"
*   **Mode:** `no-view` (Background execution).
*   **Arguments:**
    *   `content` (Type: Text, Optional, Placeholder: "Text to save...").

### 4.2. Logic Flow
1.  **Validation:**
    *   Check if `notesDirectory` exists. If not, throw an error HUD prompting the user to fix the path.
2.  **Content Resolution (Priority Order):**
    1.  **Argument:** If the user provided text in the Raycast argument field, use it.
    2.  **Selection:** If argument is empty, attempt to fetch `getSelectedText()`.
    3.  **Clipboard (Fallback):** If selection is empty/unavailable, fetch `getClipboard()`.
    4.  **Failure:** If all sources are empty, show a HUD "No text to save" and abort.
3.  **Filename Generation:**
    *   Format: `YYYY-MM-DD-HHmm-ss.md` (Seconds included to prevent conflicts during rapid capture).
4.  **Content Formatting:**
    *   **If `enableFrontmatter` is TRUE:**
        ```markdown
        ---
        date: YYYY-MM-DD HH:mm
        type: quick-note
        ---

        [Resolved Content]
        ```
    *   **If `enableFrontmatter` is FALSE:**
        ```markdown
        [Resolved Content]
        ```
5.  **File Operations:**
    *   Write the formatted content to `notesDirectory/filename`.
6.  **Feedback:**
    *   Display a HUD (Toast) with the message "Note Saved" and style `Success`.

## 5. Technical Implementation Strategy

### 5.1. Tech Stack
*   **Language:** TypeScript / Node.js (Raycast standard).
*   **Core Libraries:**
    *   `@raycast/api`: For UI (Toast), Preferences, Clipboard, and Selection.
    *   `fs/promises`: For file system writing.
    *   `path`: For handling directory paths safely.
    *   `date-fns` (optional) or native `Date`: For timestamp formatting.

### 5.2. Code Skeleton (Conceptual)

```typescript
import { LaunchProps, getPreferenceValues, showToast, Toast, getSelectedText, Clipboard } from "@raycast/api";
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
    await showToast({ style: Toast.Style.Success, title: "Note Saved", message: filename });
  } catch (error) {
    await showToast({ 
      style: Toast.Style.Failure, 
      title: "Failed to save note", 
      message: String(error) 
    });
  }
}
```

## 6. Edge Cases & Error Handling
*   **Directory Permissions:** If the extension cannot write to the folder (e.g., system protected), catch the error and display "Permission Denied" in the Toast.
*   **Empty Selection:** If the user runs the command with no arguments and no text is selected, the Toast should clearly say "No text selected or provided."
*   **Path Not Found:** If the configured directory doesn't exist, try to `mkdir` it recursively or fail gracefully asking the user to check settings.
