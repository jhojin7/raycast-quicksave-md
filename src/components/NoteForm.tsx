// @ts-nocheck - React 18 types conflict with Raycast API components, disabling type checking for this file
import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, showToast, Toast, getPreferenceValues } from "@raycast/api";
import { saveNoteContent } from "../utils/noteSaver";

/**
 * Preferences interface matching the main extension preferences
 */
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

/**
 * Props for the NoteForm component
 */
interface NoteFormProps {
  defaultContent?: string;
}

/**
 * NoteForm component for multi-line note creation using Form.TextArea
 * Features markdown highlighting, draft persistence, and validation
 */
export function NoteForm({ defaultContent }: NoteFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const prefs = getPreferenceValues<Preferences>();

  /**
   * Handle form submission with validation and error handling
   */
  const handleSubmit = useCallback(
    async (values: Form.Values) => {
      const content = values.content as string;

      // Validate non-empty content
      if (!content || content.trim().length === 0) {
        await showToast({
          style: Toast.Style.Failure,
          title: "No content to save",
          message: "Please enter some text before saving",
        });
        return;
      }

      setIsSubmitting(true);

      try {
        const filename = await saveNoteContent(content, prefs);
        await showToast({
          style: Toast.Style.Success,
          title: "Note saved",
          message: filename,
        });
        // Form will close automatically after successful submission
      } catch (error) {
        await showToast({
          style: Toast.Style.Failure,
          title: "Failed to save note",
          message: error instanceof Error ? error.message : String(error),
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [prefs]
  );

  return (
    <Form
      enableDrafts
      isLoading={isSubmitting}
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Save Note"
            onSubmit={handleSubmit}
            shortcut={{ modifiers: ["cmd"], key: "enter" }}
          />
        </ActionPanel>
      }
    >
      <Form.TextArea
        id="content"
        title="Note"
        placeholder="Type your note here... (Shift+Enter or Ctrl+J for new lines)"
        enableMarkdown={true}
        defaultValue={defaultContent}
      />
    </Form>
  );
}
