# Multi-Line Form Implementation Plan

## Overview

Replace the current `Detail`-based multi-line note form with a proper `Form.TextArea` component that supports:

- Uncontrolled input with automatic draft persistence
- Markdown highlighting and shortcuts
- Empty start state (no auto-population)
- Non-empty validation before save
- Native newline support (Shift+Enter, Ctrl+J)

---

## File Changes

### **1. `src/components/NoteForm.tsx` - Complete Rewrite**

**Remove:**

- `useState` for content management
- `useContentResolver` hook and all content resolution logic
- `Detail` component
- Actions: "Clear Content", "Use Selection", "Use Clipboard"
- All manual state management for content

**Add:**

- `Form` component with `enableDrafts={true}`
- `Form.TextArea` with:
  - `id="content"`
  - `title="Note"`
  - `placeholder="Type your note here... (Shift+Enter or Ctrl+J for new lines)"`
  - `enableMarkdown={true}`
  - No `defaultValue` (empty on launch)
  - No `value`/`onChange` (uncontrolled)

**Update:**

- `handleSubmit` signature: accept `values: Form.Values` instead of manual content
- Validate `values.content` is non-empty before saving
- Keep error handling with `showToast`

**Keep:**

- `isSubmitting` state for loading indicator
- `showToast` for error/validation messages
- Preferences interface and `getPreferenceValues`
- `saveNoteContent` utility function call

### **2. `src/save-note-form.tsx` - Add Draft Support**

**Update:**

- Add `draftValues` to `LaunchProps` type:

  ```tsx
  interface DraftValues {
    content?: string;
  }

  LaunchProps<{
    arguments: Arguments;
    draftValues: DraftValues;
  }>;
  ```

- Pass `draftValues?.content` as `defaultValue` to `NoteForm`:

  ```tsx
  <NoteForm defaultContent={props.draftValues?.content} />
  ```

**Update NoteForm props:**

- Add `defaultContent?: string` to `NoteFormProps` interface
- Use in Form.TextArea as `defaultValue={defaultContent}`

### **3. `src/hooks/useContentResolver.ts` - DELETE FILE**

This hook is no longer needed since we're not auto-resolving content on launch.

---

## New Component Structure

```tsx
// src/components/NoteForm.tsx
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
```

---

## Validation Logic

```tsx
function handleSubmit(values: Form.Values) {
  const content = values.content as string;

  if (!content || content.trim().length === 0) {
    await showToast({
      style: Toast.Style.Failure,
      title: "No content to save",
      message: "Please enter some text before saving",
    });
    return;
  }

  // Proceed with save...
}
```

---

## Draft Lifecycle

1. **First launch**: Empty TextArea, no draft
2. **User types**: Raycast auto-saves draft in background
3. **User exits (Cmd+W)**: Draft persisted automatically
4. **User re-launches**: Raycast passes draft via `props.draftValues.content`
5. **Component receives**: Sets as `defaultValue` on Form.TextArea
6. **User submits**: Raycast auto-clears draft after successful `Action.SubmitForm`

---

## Behavior Changes

| Feature          | Before (Detail)         | After (Form.TextArea)         |
| ---------------- | ----------------------- | ----------------------------- |
| Input method     | Actions to load content | Direct typing                 |
| Multi-line       | N/A (display only)      | Shift+Enter, Ctrl+J           |
| Content source   | Selection → Clipboard   | Manual typing only            |
| Persistence      | None                    | Auto-draft                    |
| Markdown         | Preview only            | Live highlighting + shortcuts |
| Empty validation | Manual check            | Manual check (same)           |
| Size control     | N/A                     | Raycast auto-sizing           |

---

## Testing Checklist

After implementation, verify:

- [ ] Form renders with empty TextArea on first launch
- [ ] Typing updates the TextArea (uncontrolled still works)
- [ ] Shift+Enter creates new line
- [ ] Ctrl+J creates new line
- [ ] Cmd+B adds **bold** markdown
- [ ] Cmd+I adds _italic_ markdown
- [ ] Submitting empty content shows validation error toast
- [ ] Submitting valid content saves note successfully
- [ ] Exiting (Cmd+W) preserves draft
- [ ] Re-launching restores draft content
- [ ] Successful save clears draft
- [ ] isLoading shows during save operation

---

## Files Modified Summary

1. ✏️ **`src/components/NoteForm.tsx`** - Complete rewrite (Detail → Form)
2. ✏️ **`src/save-note-form.tsx`** - Add draftValues support
3. 🗑️ **`src/hooks/useContentResolver.ts`** - Delete (no longer used)

---

## Known Limitations (Raycast API Constraints)

- ❌ Cannot set custom width/height for TextArea
- ❌ Cannot center or position TextArea manually
- ❌ Cannot programmatically set value in uncontrolled mode
- ✅ TextArea auto-expands vertically with content
- ✅ Native Cmd+V paste works perfectly

---

## Implementation Result

This will result in:

- Simpler, cleaner code (~60 lines vs ~160 lines)
- Better UX (direct typing vs action-based input)
- Automatic draft persistence (Raycast handles it)
- Markdown editing with live highlighting
- Proper multi-line text input
