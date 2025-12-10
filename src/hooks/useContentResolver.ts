import { useState, useCallback } from "react";
import { getSelectedText, Clipboard } from "@raycast/api";

/**
 * Hook for resolving content from multiple sources with priority order.
 * Priority: 1. Initial content (form argument/selection) → 2. Selected text → 3. Clipboard
 *
 * @returns Object with content resolution function and loading states
 */
export function useContentResolver() {
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Resolve content from available sources in priority order.
   *
   * @param initialContent - Optional initial content from form arguments
   * @returns Resolved content string or null if no content available
   */
  const resolveContent = useCallback(async (initialContent?: string): Promise<string | null> => {
    // Priority 1: Use initial content if provided
    if (initialContent && initialContent.trim().length > 0) {
      return initialContent;
    }

    setIsLoading(true);

    try {
      // Priority 2: Try to get currently selected text
      try {
        const selectedText = await getSelectedText();
        if (selectedText && selectedText.trim().length > 0) {
          return selectedText;
        }
      } catch (error) {
        // Selection not available (no text highlighted), continue to clipboard
      }

      // Priority 3: Fallback to clipboard content
      try {
        const clipboardText = await Clipboard.readText();
        if (clipboardText && clipboardText.trim().length > 0) {
          return clipboardText;
        }
      } catch (error) {
        // Clipboard read failed or empty
      }

      // No content found from any source
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    resolveContent,
    isLoading,
  };
}
