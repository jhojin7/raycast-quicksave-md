/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Notes Directory - The folder where .md files will be created */
  "notesDirectory": string,
  /** Filename Format - Template for filename using Moment.js tokens (e.g., YYYY-MM-DD-HHmm-ss). See extension info for examples. */
  "filenameFormat": string,
  /** YAML Frontmatter - Enable YAML frontmatter at the top of notes */
  "enableFrontmatter": boolean,
  /**  - Include 'date' field in frontmatter */
  "frontmatterIncludeDate": boolean,
  /**  - Include 'type' field in frontmatter */
  "frontmatterIncludeType": boolean,
  /**  - Include 'title' field (auto-generated from first line) */
  "frontmatterIncludeTitle": boolean,
  /**  - Include 'tags' field in frontmatter */
  "frontmatterIncludeTags": boolean,
  /** Default Tags - Comma-separated tags to include by default (e.g., note, quick-capture) */
  "frontmatterDefaultTags": string,
  /**  - Include 'author' field in frontmatter */
  "frontmatterIncludeAuthor": boolean,
  /** Default Author - Your name to include in the 'author' field */
  "frontmatterDefaultAuthor": string,
  /**  - Include 'source' field (left empty for manual entry) */
  "frontmatterIncludeSource": boolean
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `save-note` command */
  export type SaveNote = ExtensionPreferences & {}
  /** Preferences accessible in the `save-note-form` command */
  export type SaveNoteForm = ExtensionPreferences & {}
  /** Preferences accessible in the `show-info` command */
  export type ShowInfo = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `save-note` command */
  export type SaveNote = {
  /** Text to save... */
  "content": string
}
  /** Arguments passed to the `save-note-form` command */
  export type SaveNoteForm = {
  /** Initial content (optional)... */
  "content": string
}
  /** Arguments passed to the `show-info` command */
  export type ShowInfo = {}
}

