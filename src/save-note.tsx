import {
  LaunchProps,
  getPreferenceValues,
  showToast,
  Toast,
  getSelectedText,
  Clipboard,
  showHUD,
} from "@raycast/api";
import { writeFile, mkdir, access } from "fs/promises";
import path from "path";
import { constants } from "fs";

/**
 * @file save-note.tsx
 * @description Main command for Quick Markdown Note extension.
 * Handles content capture (args/selection/clipboard), file creation,
 * and dynamic frontmatter generation.
 * @author jhojin7
 */

/**
 * User preferences for the Quick Markdown Note extension.
 * These values are configured in Raycast Extension Preferences.
 */
interface Preferences {
  /** Directory path where markdown files will be saved */
  notesDirectory: string;
  /** Filename template using Moment.js-style tokens (e.g., YYYY-MM-DD-HHmm-ss) */
  filenameFormat: string;
  /** Whether to include YAML frontmatter in generated notes */
  enableFrontmatter: boolean;
  /** Include 'date' field in frontmatter */
  frontmatterIncludeDate: boolean;
  /** Include 'type' field in frontmatter (always set to "quick-note") */
  frontmatterIncludeType: boolean;
  /** Include 'title' field in frontmatter (auto-extracted from first line) */
  frontmatterIncludeTitle: boolean;
  /** Include 'tags' field in frontmatter */
  frontmatterIncludeTags: boolean;
  /** Comma-separated default tags to include */
  frontmatterDefaultTags: string;
  /** Include 'author' field in frontmatter */
  frontmatterIncludeAuthor: boolean;
  /** Default author name to use in frontmatter */
  frontmatterDefaultAuthor: string;
  /** Include 'source' field in frontmatter (left empty for manual entry) */
  frontmatterIncludeSource: boolean;
}

/**
 * Command arguments passed from Raycast.
 */
interface Arguments {
  /** Optional text content to save (can be empty to use selection/clipboard) */
  content?: string;
}

/**
 * Main command function for saving quick markdown notes.
 *
 * Content resolution priority:
 * 1. Argument: Text provided in Raycast command
 * 2. Selection: Currently highlighted text in any application
 * 3. Clipboard: Current clipboard content
 *
 * @param props - Launch properties containing command arguments
 * @returns Promise that resolves when the note is saved or an error is handled
 */
export default async function Command(props: LaunchProps<{ arguments: Arguments }>) {
  const prefs = getPreferenceValues<Preferences>();

  try {
    // Step 1: Validation - Check if notesDirectory exists and is writable
    // Expand ~ to home directory path manually as Node.js fs module doesn't handle shell expansions
    const notesDir = prefs.notesDirectory.replace(/^~/, process.env.HOME || "");
    try {
      // Check if directory exists and is writable
      await access(notesDir, constants.W_OK);
    } catch (error) {
      // Directory doesn't exist or isn't writable - try to create it
      try {
        await mkdir(notesDir, { recursive: true });
      } catch (mkdirError) {
        // Failed to create directory - show error and abort
        await showToast({
          style: Toast.Style.Failure,
          title: "Invalid directory",
          message: "Cannot access or create notes directory. Please check settings.",
        });
        return;
      }
    }

    // Step 2: Content Resolution (Priority Order)
    // Priority 1: Use argument text if provided
    let noteContent = props.arguments.content;

    // Priority 2: Try to get currently selected text if no argument
    if (!noteContent) {
      try {
        noteContent = await getSelectedText();
      } catch (error) {
        // Selection not available (no text highlighted), will try clipboard next
      }
    }

    // Priority 3: Fallback to clipboard content
    if (!noteContent) {
      try {
        noteContent = await Clipboard.readText();
      } catch (error) {
        // Clipboard read failed or empty
      }
    }

    // Validate that we have content from at least one source
    if (!noteContent || noteContent.trim().length === 0) {
      await showToast({
        style: Toast.Style.Failure,
        title: "No content to save",
        message: "Please provide text via argument, selection, or clipboard",
      });
      return;
    }

    // Step 3: Filename Generation using Moment.js-style template format
    // TODO: use moment.js, do not use javascript default datetime formatting.
    const now = new Date();

    /**
     * Token map for filename formatting.
     * Supports Moment.js-style tokens like YYYY, MM, DD, HH, mm, ss, etc.
     */
    const formatMap: Record<string, string> = {
      YYYY: String(now.getFullYear()), // 2024
      YY: String(now.getFullYear()).slice(-2), // 24
      MM: String(now.getMonth() + 1).padStart(2, "0"), // 01-12
      M: String(now.getMonth() + 1), // 1-12
      DD: String(now.getDate()).padStart(2, "0"), // 01-31
      D: String(now.getDate()), // 1-31
      HH: String(now.getHours()).padStart(2, "0"), // 00-23
      H: String(now.getHours()), // 0-23
      hh: String(now.getHours() % 12 || 12).padStart(2, "0"), // 01-12
      h: String(now.getHours() % 12 || 12), // 1-12
      mm: String(now.getMinutes()).padStart(2, "0"), // 00-59
      m: String(now.getMinutes()), // 0-59
      ss: String(now.getSeconds()).padStart(2, "0"), // 00-59
      s: String(now.getSeconds()), // 0-59
      A: now.getHours() >= 12 ? "PM" : "AM", // AM/PM
      a: now.getHours() >= 12 ? "pm" : "am", // am/pm
    };

    let filename = prefs.filenameFormat || "YYYY-MM-DD-HHmm-ss";

    // Replace tokens in order of length (longer first to avoid partial replacements)
    // Example: "YYYY" must be replaced before "YY" to avoid "20YY" instead of "2024"
    const tokens = Object.keys(formatMap).sort((a, b) => b.length - a.length);
    for (const token of tokens) {
      filename = filename.replace(new RegExp(token, "g"), formatMap[token]);
    }

    filename = `${filename}.md`;
    const filePath = path.join(notesDir, filename);

    // Step 4: Content Formatting with dynamic YAML frontmatter
    let finalOutput = noteContent;
    if (prefs.enableFrontmatter) {
      const frontmatterLines: string[] = [];

      // Add 'date' field (YYYY-MM-DD HH:mm format)
      if (prefs.frontmatterIncludeDate) {
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");
        const dateString = `${year}-${month}-${day} ${hours}:${minutes}`;
        frontmatterLines.push(`date: ${dateString}`);
      }

      // Add 'type' field (always set to "quick-note")
      if (prefs.frontmatterIncludeType) {
        frontmatterLines.push(`type: quick-note`);
      }

      // Add 'title' field (auto-generated from first line of content)
      if (prefs.frontmatterIncludeTitle) {
        const firstLine = noteContent.split("\n")[0].trim();
        // Remove markdown headers (# ## ###) and limit length to 100 characters
        const title = firstLine.replace(/^#+\s*/, "").substring(0, 100);
        frontmatterLines.push(`title: "${title}"`);
      }

      // Add 'tags' field (from user-configured default tags)
      if (prefs.frontmatterIncludeTags) {
        // Parse comma-separated tags and clean whitespace
        const tags = prefs.frontmatterDefaultTags
          ? prefs.frontmatterDefaultTags
              .split(",")
              .map((t) => t.trim())
              .filter((t) => t) // Remove empty strings
          : [];
        if (tags.length > 0) {
          frontmatterLines.push(`tags: [${tags.join(", ")}]`);
        } else {
          frontmatterLines.push(`tags: []`);
        }
      }

      // Add 'author' field (from user-configured default author)
      if (prefs.frontmatterIncludeAuthor) {
        const author = prefs.frontmatterDefaultAuthor || "";
        frontmatterLines.push(`author: "${author}"`);
      }

      // Add 'source' field (left empty for manual entry)
      if (prefs.frontmatterIncludeSource) {
        frontmatterLines.push(`source: ""`);
      }

      // Only add frontmatter if at least one field is enabled
      if (frontmatterLines.length > 0) {
        finalOutput = `---
${frontmatterLines.join("\n")}
---

${noteContent}`;
      }
    }

    // Step 5: Write File to disk
    try {
      await writeFile(filePath, finalOutput, "utf-8");

      // Show HUD notification (appears outside Raycast window)
      // This automatically closes Raycast after showing the success message
      await showHUD(`Note Saved: ${filename}`);
    } catch (error) {
      // Use Toast for errors to keep Raycast open so user can read the error message
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to save note",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  } catch (error) {
    // Catch-all error handler for unexpected errors
    await showToast({
      style: Toast.Style.Failure,
      title: "Error",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
