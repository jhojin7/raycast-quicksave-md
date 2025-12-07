/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Note Location - The folder where .md files will be created */
  "notesDirectory": string,
  /** Add Metadata - If checked, adds YAML frontmatter to the top of the note */
  "enableFrontmatter": boolean
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `save-note` command */
  export type SaveNote = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `save-note` command */
  export type SaveNote = {
  /** Text to save... */
  "content": string
}
}

