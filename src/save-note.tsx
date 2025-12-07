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
  enableFrontmatter: boolean;
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

    // 3. Filename Generation
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    const filename = `${year}-${month}-${day}-${hours}${minutes}-${seconds}.md`;
    const filePath = path.join(notesDir, filename);

    // 4. Content Formatting
    let finalOutput = noteContent;
    if (prefs.enableFrontmatter) {
      const dateString = `${year}-${month}-${day} ${hours}:${minutes}`;
      finalOutput = `---
date: ${dateString}
type: quick-note
---

${noteContent}`;
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
