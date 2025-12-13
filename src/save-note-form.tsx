// @ts-nocheck - React 18 types conflict with Raycast API components, disabling type checking for this file
import { LaunchProps } from "@raycast/api";
import { NoteForm } from "./components/NoteForm";

/**
 * Command arguments passed from Raycast for the form-based note command.
 */
interface Arguments {
  /** Optional initial text content to pre-populate the form */
  content?: string;
}

/**
 * Draft values automatically preserved by Raycast when drafts are enabled.
 */
interface DraftValues {
  /** The content of the note being drafted */
  content?: string;
}

/**
 * Form-based command for creating multi-line markdown notes.
 * Uses a Form.TextArea with markdown highlighting and automatic draft persistence.
 *
 * This command provides an interactive note-taking experience with:
 * - Direct typing into a multi-line text area
 * - Markdown syntax highlighting and shortcuts (Cmd+B, Cmd+I, etc.)
 * - Automatic draft saving and restoration
 * - Shift+Enter and Ctrl+J for newlines
 *
 * @param props - Launch properties containing optional initial content and draft values
 */
export default function Command(
  props: LaunchProps<{ arguments: Arguments; draftValues: DraftValues }>
) {
  // Priority: draftValues (restored draft) > arguments (passed content)
  const defaultContent = props.draftValues?.content || props.arguments.content;

  return <NoteForm defaultContent={defaultContent} />;
}
