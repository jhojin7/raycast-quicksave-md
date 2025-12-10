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
 * Form-based command for creating multi-line markdown notes.
 * Uses a Detail view with markdown preview and action-based saving.
 *
 * This command provides a more interactive note-taking experience
 * compared to the quick-capture no-view command.
 *
 * @param props - Launch properties containing optional initial content
 */
export default async function Command(props: LaunchProps<{ arguments: Arguments }>) {
  return <NoteForm initialContent={props.arguments.content} />;
}
