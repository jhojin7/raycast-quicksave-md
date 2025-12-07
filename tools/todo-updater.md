---
title: todo-updater
description: Grabs all TODO comments in this repository(project) with `rg` or `grep`, and updates `TODO.md` file with latest todos
---

Step-by-step guide to use `todo-updater` tool:

- grep(`rg`, fallback to `grep` if ripgrep is not found) to search for `TODO` in this project root.  
  - Use `-U` or `-C 5` flag with ripgrep for context  
- Read `TODO.md` in project root. Create one if not found.  
- Compare your grep results with `TODO.md` and update:  
  - Append undocumented TODOs **at the top of the file**.  
  - Check off any finished TODOs.  
