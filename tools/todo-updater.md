---
name: todo-updater
description: Grabs all TODO comments in this repository(project) with `rg` or `grep`, and updates `TODO.md` file with latest todos
---

Step-by-step guide to use `todo-updater` tool:

- grep(`rg`, fallback to `grep` if ripgrep is not found) to search for `TODO` in this project root.
  - Use `-U -n` flag with ripgrep for line numbers
  - Exclude `TODO.md` from search results: `| grep -v "TODO.md"`
- Read `TODO.md` in project root. Create one if not found.
- Compare your grep results with `TODO.md` and update:
  - Standardize format: `- [ ] {file_relpath}:{line}: {content}`
    - `{file_relpath}`: relative path from project root. For directories, just the directory name with trailing slash.
    - `{line}`: line number of the TODO comment, or `-1` if the TODO is file-wide.
    - `{content}`: content of the TODO comment, excluding markers like `// TODO:` or `<!-- TODO:` and `-->` Do not uppercase or lowercase the content.
  - Remove markers from content (like `<!-- TODO:` and `-->`)
  - Append undocumented TODOs **at the top of the file**.
  - Check off any finished TODOs.
