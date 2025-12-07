import {
  LaunchProps,
  getPreferenceValues,
  showToast,
  Toast,
  getSelectedText,
  Clipboard,
} from "@raycast/api";
import { writeFile, mkdir, access } from "fs/promises";
import path from "path";
import { constants } from "fs";

interface Preferences {
  notesDirectory: string;
  filenameFormat: string;
  enableFrontmatter: boolean;
  frontmatterIncludeDate: boolean;
  frontmatterIncludeType: boolean;
  frontmatterIncludeTitle: boolean;
  frontmatterIncludeTags: boolean;
  frontmatterDefaultTags: string;
  frontmatterIncludeAuthor: boolean;
  frontmatterDefaultAuthor: string;
  frontmatterIncludeSource: boolean;
}

interface Arguments {
  content?: string;
}

export default async function Command(props: LaunchProps<{ arguments: Arguments }>) {
  const prefs = getPreferenceValues<Preferences>();

  try {
    // 1. Validation: Check if notesDirectory exists
    const notesDir = prefs.notesDirectory.replace(/^~/, process.env.HOME || "");
    try {
      await access(notesDir, constants.W_OK);
    } catch (error) {
      // Try to create the directory if it doesn't exist
      try {
        await mkdir(notesDir, { recursive: true });
      } catch (mkdirError) {
        await showToast({
          style: Toast.Style.Failure,
          title: "Invalid directory",
          message: "Cannot access or create notes directory. Please check settings.",
        });
        return;
      }
    }

    // 2. Content Resolution (Priority Order)
    let noteContent = props.arguments.content;

    // Try to get selected text if no argument provided
    if (!noteContent) {
      try {
        noteContent = await getSelectedText();
      } catch (error) {
        // Selection not available, will try clipboard next
      }
    }

    // Fallback to clipboard if no selection
    if (!noteContent) {
      try {
        noteContent = await Clipboard.readText();
      } catch (error) {
        // Clipboard read failed
      }
    }

    // Check if we have any content
    if (!noteContent || noteContent.trim().length === 0) {
      await showToast({
        style: Toast.Style.Failure,
        title: "No content to save",
        message: "Please provide text via argument, selection, or clipboard",
      });
      return;
    }

    // 3. Filename Generation using template format
    const now = new Date();
    const formatMap: Record<string, string> = {
      YYYY: String(now.getFullYear()),
      YY: String(now.getFullYear()).slice(-2),
      MM: String(now.getMonth() + 1).padStart(2, "0"),
      M: String(now.getMonth() + 1),
      DD: String(now.getDate()).padStart(2, "0"),
      D: String(now.getDate()),
      HH: String(now.getHours()).padStart(2, "0"),
      H: String(now.getHours()),
      hh: String(now.getHours() % 12 || 12).padStart(2, "0"),
      h: String(now.getHours() % 12 || 12),
      mm: String(now.getMinutes()).padStart(2, "0"),
      m: String(now.getMinutes()),
      ss: String(now.getSeconds()).padStart(2, "0"),
      s: String(now.getSeconds()),
      A: now.getHours() >= 12 ? "PM" : "AM",
      a: now.getHours() >= 12 ? "pm" : "am",
    };

    let filename = prefs.filenameFormat || "YYYY-MM-DD-HHmm-ss";

    // Replace tokens in order of length (longer first to avoid partial replacements)
    const tokens = Object.keys(formatMap).sort((a, b) => b.length - a.length);
    for (const token of tokens) {
      filename = filename.replace(new RegExp(token, "g"), formatMap[token]);
    }

    filename = `${filename}.md`;
    const filePath = path.join(notesDir, filename);

    // 4. Content Formatting with dynamic frontmatter
    let finalOutput = noteContent;
    if (prefs.enableFrontmatter) {
      const frontmatterLines: string[] = [];

      // Date field
      if (prefs.frontmatterIncludeDate) {
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");
        const dateString = `${year}-${month}-${day} ${hours}:${minutes}`;
        frontmatterLines.push(`date: ${dateString}`);
      }

      // Type field
      if (prefs.frontmatterIncludeType) {
        frontmatterLines.push(`type: quick-note`);
      }

      // Title field (auto-generated from first line)
      if (prefs.frontmatterIncludeTitle) {
        const firstLine = noteContent.split("\n")[0].trim();
        const title = firstLine.replace(/^#+\s*/, "").substring(0, 100); // Remove markdown headers, limit length
        frontmatterLines.push(`title: "${title}"`);
      }

      // Tags field
      if (prefs.frontmatterIncludeTags) {
        const tags = prefs.frontmatterDefaultTags
          ? prefs.frontmatterDefaultTags
              .split(",")
              .map((t) => t.trim())
              .filter((t) => t)
          : [];
        if (tags.length > 0) {
          frontmatterLines.push(`tags: [${tags.join(", ")}]`);
        } else {
          frontmatterLines.push(`tags: []`);
        }
      }

      // Author field
      if (prefs.frontmatterIncludeAuthor) {
        const author = prefs.frontmatterDefaultAuthor || "";
        frontmatterLines.push(`author: "${author}"`);
      }

      // Source field
      if (prefs.frontmatterIncludeSource) {
        frontmatterLines.push(`source: ""`);
      }

      // Only add frontmatter if there are fields to include
      if (frontmatterLines.length > 0) {
        finalOutput = `---
${frontmatterLines.join("\n")}
---

${noteContent}`;
      }
    }

    // 5. Write File
    try {
      await writeFile(filePath, finalOutput, "utf-8");
      await showToast({
        style: Toast.Style.Success,
        title: "Note Saved",
        message: filename,
      });
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to save note",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  } catch (error) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Error",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
