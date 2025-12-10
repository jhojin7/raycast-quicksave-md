# Multi-Line Support Implementation Plan

## Overview

Add multi-line input capability to the Raycast Quick Markdown Note extension, allowing users to compose longer notes with proper formatting directly within Raycast.

## Current Limitations

- Single-line argument input only
- No line break support in content
- Limited to short text capture

## Implementation Strategy

### 1. UI Component Change

- **From**: `no-view` command with single text argument
- **To**: React Form component with multi-line textarea
- **File**: `src/save-note.tsx` → `src/save-note-form.tsx`

### 2. New Features to Add

#### A. Multi-line Text Input

- Replace argument with `<TextArea>` component
- Support for line breaks and proper formatting
- Auto-resize textarea for better UX

#### B. Enhanced Content Resolution

- Keep existing priority: form input → selection → clipboard
- Preserve line breaks from all sources
- Handle multi-line selections properly

#### C. Preview Mode (Optional Enhancement)

- Live markdown preview toggle
- Show formatted output before saving
- Help users verify their note formatting

#### D. Quick Actions

- "Save & Close" (default action)
- "Save & New" (clear form, keep directory)
- "Cancel" (close without saving)

### 3. Technical Changes Required

#### A. File Structure

```
src/
├── components/
│   ├── NoteForm.tsx          # New form component
│   └── PreviewPanel.tsx      # Optional preview component
├── save-note.tsx             # Modified to use form
└── hooks/
    └── useContentResolver.ts # Extract content resolution logic
```

#### B. Form Component (`NoteForm.tsx`)

```typescript
interface NoteFormProps {
  initialContent?: string;
  onSave: (content: string) => void;
  onCancel: () => void;
}

// Features:
- TextArea with auto-resize
- Content preview toggle
- Character/word count
- Save shortcuts (Cmd+Enter)
```

#### C. Content Resolution Hook

```typescript
// Extract existing logic into reusable hook
const useContentResolver = () => {
  // Priority: form → selection → clipboard
  // Preserve line breaks from all sources
};
```

#### D. Keyboard Shortcuts

- `Cmd+Enter`: Save and close
- `Cmd+Shift+Enter`: Save and new
- `Escape`: Cancel

### 4. Enhanced Preferences

#### A. Form Behavior Settings

```typescript
interface FormPreferences {
  /** Auto-focus textarea when form opens */
  autoFocus: boolean;
  /** Show character count */
  showCharCount: boolean;
  /** Enable preview mode by default */
  enablePreview: boolean;
  /** Default textarea height (rows) */
  defaultRows: number;
}
```

#### B. Quick Actions Settings

```typescript
interface QuickActionPreferences {
  /** Action to take after saving */
  afterSaveAction: "close" | "new" | "stay";
  /** Show save confirmation */
  showSaveConfirmation: boolean;
}
```

### 5. Migration Strategy

#### Phase 1: Core Multi-line Support

1. Create `NoteForm.tsx` component
2. Modify `save-note.tsx` to render form
3. Preserve existing content resolution logic
4. Add basic keyboard shortcuts

#### Phase 2: Enhanced UX

1. Add preview mode toggle
2. Implement character/word count
3. Add auto-resize textarea
4. Enhance error handling

#### Phase 3: Advanced Features

1. Add quick actions (Save & New)
2. Implement form preferences
3. Add templates support
4. Enhanced keyboard navigation

### 6. Backward Compatibility

- Keep existing argument-based command for power users
- Add new command "Save Note (Form)" alongside original
- Maintain all existing preferences
- Preserve content resolution priority

### 7. Testing Strategy

- Test multi-line content from all sources
- Verify line break preservation
- Test keyboard shortcuts
- Validate form preferences
- Test backward compatibility

### 8. File Changes Summary

#### New Files

- `src/components/NoteForm.tsx`
- `src/components/PreviewPanel.tsx` (optional)
- `src/hooks/useContentResolver.ts`

#### Modified Files

- `src/save-note.tsx` (main command)
- `package.json` (add new dependencies if needed)
- `PRD.md` (update documentation)

#### New Commands (in `package.json`)

- "Save Note (Form)" - new multi-line form command
- "Save Note" - existing single-line command (unchanged)

## Implementation Priority

1. **High**: Core multi-line form with basic save functionality
2. **Medium**: Preview mode and enhanced UX features
3. **Low**: Advanced preferences and quick actions

## Success Metrics

- Users can compose multi-line notes with proper formatting
- Line breaks are preserved from all content sources
- Form is intuitive and fast to use
- Backward compatibility maintained for existing users
