// @ts-nocheck - React 18 types conflict with Raycast API components, disabling type checking for this file
import { useState, useCallback, useEffect } from "react";
import {
  Detail,
  ActionPanel,
  Action,
  showToast,
  Toast,
  getPreferenceValues,
  getSelectedText,
  Clipboard,
} from "@raycast/api";
import { useContentResolver } from "../hooks/useContentResolver";
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
  initialContent?: string;
}

/**
 * NoteForm component for multi-line note creation using Detail view
 * Features content resolution, markdown preview, and action-based saving
 */
export function NoteForm({ initialContent }: NoteFormProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { resolveContent, isLoading } = useContentResolver();
  const prefs = getPreferenceValues<Preferences>();

  /**
   * Initialize content from available sources when component mounts
   */
  useEffect(() => {
    const initializeContent = async () => {
      if (!initialContent) {
        const resolvedContent = await resolveContent();
        if (resolvedContent) {
          setContent(resolvedContent);
        }
      } else {
        setContent(initialContent);
      }
    };

    initializeContent();
  }, [initialContent, resolveContent]);

  /**
   * Handle form submission with error handling
   */
  const handleSubmit = useCallback(async () => {
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
      // Detail view will close automatically after successful submission
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to save note",
        message: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [content, prefs]);

  /**
   * Generate markdown content for display
   */
  const markdown = content || "No content yet. Start typing...";

  return (
    <Detail
      markdown={markdown}
      isLoading={isLoading || isSubmitting}
      actions={
        <ActionPanel>
          <Action
            title="Save Note"
            onAction={handleSubmit}
            shortcut={{ modifiers: ["cmd"], key: "enter" }}
          />
          <Action
            title="Clear Content"
            onAction={() => setContent("")}
            shortcut={{ modifiers: ["cmd"], key: "k" }}
          />
          <ActionPanel.Section title="Content Sources">
            <Action
              title="Use Selection"
              onAction={async () => {
                try {
                  const selectedText = await getSelectedText();
                  if (selectedText) {
                    setContent(selectedText);
                  }
                } catch (error) {
                  await showToast({
                    style: Toast.Style.Failure,
                    title: "No selection available",
                  });
                }
              }}
            />
            <Action
              title="Use Clipboard"
              onAction={async () => {
                try {
                  const clipboardText = await Clipboard.readText();
                  if (clipboardText) {
                    setContent(clipboardText);
                  }
                } catch (error) {
                  await showToast({
                    style: Toast.Style.Failure,
                    title: "Clipboard empty",
                  });
                }
              }}
            />
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
}
