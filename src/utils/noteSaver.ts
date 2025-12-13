import { writeFile, mkdir, access } from "fs/promises";
import path from "path";
import { constants } from "fs";

/**
 * User preferences for the Quick Markdown Note extension.
 * These values are configured in Raycast Extension Preferences.
 */
export interface Preferences {
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
 * Generate filename using Moment.js-style template format
 *
 * @param format - Filename format template (e.g., "YYYY-MM-DD-HHmm-ss")
 * @returns Generated filename with .md extension
 */
export function generateFilename(format: string): string {
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

  let filename = format || "YYYY-MM-DD-HHmm-ss";

  // Replace tokens in order of length (longer first to avoid partial replacements)
  // Example: "YYYY" must be replaced before "YY" to avoid "20YY" instead of "2024"
  const tokens = Object.keys(formatMap).sort((a, b) => b.length - a.length);
  for (const token of tokens) {
    filename = filename.replace(new RegExp(token, "g"), formatMap[token]);
  }

  return `${filename}.md`;
}

/**
 * Format content with optional YAML frontmatter
 *
 * @param content - Raw note content
 * @param prefs - User preferences
 * @returns Formatted content with frontmatter if enabled
 */
export function formatContent(content: string, prefs: Preferences): string {
  let finalOutput = content;

  if (prefs.enableFrontmatter) {
    const now = new Date();
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
      const firstLine = content.split("\n")[0].trim();
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

${content}`;
    }
  }

  return finalOutput;
}

/**
 * Save note content to file with proper error handling
 *
 * @param content - Note content to save
 * @param prefs - User preferences
 * @returns Promise resolving to the filename that was saved
 * @throws Error if file operations fail
 */
export async function saveNoteContent(content: string, prefs: Preferences): Promise<string> {
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
      // Failed to create directory - throw error for caller to handle
      throw new Error("Cannot access or create notes directory. Please check settings.");
    }
  }

  // Step 2: Generate filename and format content
  const filename = generateFilename(prefs.filenameFormat);
  const filePath = path.join(notesDir, filename);
  const formattedContent = formatContent(content, prefs);

  // Step 3: Write file to disk
  try {
    await writeFile(filePath, formattedContent, "utf-8");
    return filename;
  } catch (error) {
    throw new Error(
      `Failed to write file: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
