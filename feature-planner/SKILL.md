---
name: feature-planner
description: Guides users through a structured feature implementation planning process by asking clarifying questions in YAML format, then generating comprehensive technical implementation plans. Automatically activates when users request to implement, add, build, or create features, or can be explicitly invoked with /implement command.
---

# Feature Planner

A skill that helps systematically plan feature implementations through structured Q&A sessions and generates comprehensive technical implementation plans.

## When to Use This Skill

This skill automatically activates when the user:

- Uses keywords: "implement", "add feature", "build", "create feature", "new feature"
- Explicitly invokes: `/implement <feature description>`
- Requests planning or design for a new capability

When detected, confirm with the user before starting the Q&A process unless they've explicitly used `/implement`.

## Workflow

### Phase 1: Initial Detection & Confirmation

1. Detect feature request from user message
2. If auto-detected (not via `/implement`), ask: "I've detected a feature request. Would you like me to help you plan this implementation systematically?"
3. If user confirms or used `/implement`, proceed to Phase 2

### Phase 2: Clarifying Questions

1. **Generate questions in YAML format** following the schema in `schemas/questions-schema.yaml`
2. **Always ask core questions first** (see Core Questions section below)
3. **After receiving answers**, analyze responses to determine if dynamic questions are needed
4. **Always end each round** with a continue/stop question
5. **Parse user responses** flexibly - accept natural language, option letters, or structured YAML
6. **Continue rounds** until user chooses to proceed to implementation plan

### Phase 3: Save Requirements

1. Use `scripts/save_requirements.py` to save all Q&A data to YAML
2. Ask user for a descriptive name for this task (default to feature name if not provided)
3. Create directory: `implementation-plans/{task-name}/`
4. Save as: `implementation-plans/{task-name}/requirements.yaml`

### Phase 4: Generate Technical Plan

1. Use `scripts/generate_plan.py` with the template from `templates/TECHNICAL_PLAN.md`
2. Fill in all sections based on Q&A responses and repository context
3. Save as: `implementation-plans/{task-name}/plan.md`
4. Present summary to user with file locations

## Core Questions (Round 1)

Always ask these questions in the first round:

```yaml
questions:
  - id: q1
    text: "What is the primary goal or problem this feature solves?"
    allow_multiple: false
    options:
      - id: "user_request"
        text: "Direct user request or need"
      - id: "improve_ux"
        text: "Improve user experience"
      - id: "fix_limitation"
        text: "Fix current limitation or bug"
      - id: "technical_debt"
        text: "Address technical debt"
      - id: "performance"
        text: "Improve performance"
      - id: "other"
        text: "Other (please specify)"

  - id: q2
    text: "What type of change is this?"
    allow_multiple: true
    options:
      - id: "ui"
        text: "UI/Frontend component"
      - id: "backend"
        text: "Backend/API logic"
      - id: "database"
        text: "Database schema or data model"
      - id: "infrastructure"
        text: "Infrastructure or deployment"
      - id: "testing"
        text: "Testing or quality assurance"
      - id: "documentation"
        text: "Documentation"

  - id: q3
    text: "What is the expected complexity?"
    allow_multiple: false
    options:
      - id: "simple"
        text: "Simple (single file, < 1 hour)"
      - id: "medium"
        text: "Medium (2-5 files, 1-4 hours)"
      - id: "complex"
        text: "Complex (5+ files, 4+ hours)"
      - id: "very_complex"
        text: "Very Complex (multiple systems, days of work)"

  - id: q4
    text: "Are there any dependencies or prerequisites?"
    allow_multiple: true
    options:
      - id: "none"
        text: "None"
      - id: "new_packages"
        text: "Need to install new packages/libraries"
      - id: "api_changes"
        text: "Depends on API changes"
      - id: "data_migration"
        text: "Requires data migration"
      - id: "external_service"
        text: "Requires external service integration"
      - id: "other_features"
        text: "Depends on other features being completed first"

  - id: q5
    text: "Do you want to continue with more detailed questions, or proceed to creating the implementation plan?"
    allow_multiple: false
    options:
      - id: "continue"
        text: "Ask more questions to refine the plan"
      - id: "proceed"
        text: "Proceed to implementation plan"
```

## Dynamic Questions (Round 2+)

Based on Round 1 responses, ask follow-up questions. Examples:

**If q2 includes "ui":**

- What UI framework/library? (React, Vue, vanilla JS, etc.)
- Is this a new component or modifying existing?
- Any specific design requirements?

**If q2 includes "backend":**

- What's the API pattern? (REST, GraphQL, etc.)
- Is this a new endpoint or modifying existing?
- Any authentication/authorization requirements?

**If q2 includes "database":**

- What type of schema changes? (new tables, alter existing, indexes)
- Is migration strategy needed?
- Any data integrity concerns?

**If q4 includes "new_packages":**

- Which packages are needed?
- Are there licensing or security considerations?

**If q3 is "complex" or "very_complex":**

- Should this be broken into smaller phases?
- What's the MVP scope vs. future enhancements?

**Always end with continue/stop question:**

```yaml
- id: continue
  text: "Do you want to continue with more questions, or proceed to implementation plan?"
  allow_multiple: false
  options:
    - id: "continue"
      text: "Ask more questions"
    - id: "proceed"
      text: "Create the implementation plan now"
```

## Response Parsing

Accept responses in any of these formats:

1. **Letter-based**: "1: A, 2: B,C, 3: D"
2. **Natural language**: "For question 1, I choose 'Direct user request'. For question 2, it's both UI and Backend..."
3. **YAML format**:

```yaml
responses:
  q1: user_request
  q2: [ui, backend]
  q3: medium
```

Extract the user's choices and map them back to the question IDs and option IDs.

## Repository Context Analysis

When generating dynamic questions, analyze:

- `package.json` for tech stack (if exists)
- File structure for architecture patterns
- Recent git commits for development patterns
- Existing similar features for consistency

## Scripts Usage

### save_requirements.py

Saves Q&A session data to YAML format.

**Usage:**

```python
from scripts.save_requirements import save_requirements

data = {
    'task_name': 'dark-mode-toggle',
    'task_type': 'feature',
    'timestamp': '2025-12-10T10:30:00',
    'questions': [...],
    'responses': {...},
    'metadata': {...}
}

save_requirements(data, 'implementation-plans/dark-mode-toggle/')
```

### generate_plan.py

Generates implementation plan from template.

**Usage:**

```python
from scripts.generate_plan import generate_plan

requirements_path = 'implementation-plans/dark-mode-toggle/requirements.yaml'
output_path = 'implementation-plans/dark-mode-toggle/plan.md'

generate_plan(requirements_path, output_path, template='templates/TECHNICAL_PLAN.md')
```

## Best Practices

1. **Be conversational**: While using structured YAML for questions, maintain friendly, helpful tone
2. **Stay focused**: Don't ask unnecessary questions - adapt to user's responses
3. **Provide context**: When asking questions, briefly explain why the information is needed
4. **Validate responses**: If user's answer is unclear, ask for clarification
5. **Reference files**: When generating plans, include specific file paths and line numbers when possible
6. **Be iterative**: Plans can be refined - don't try to get everything perfect in one go

## Examples

### Example 1: Simple Feature Request

**User**: "I want to add a dark mode toggle"

**Assistant**: "I've detected a feature request. Would you like me to help you plan this implementation systematically?"

**User**: "Yes"

**Assistant**: _Presents Round 1 questions in YAML format_

**User**: "1: improve_ux, 2: ui, 3: medium, 4: none, 5: proceed"

**Assistant**: _Saves requirements, generates plan, presents summary_

### Example 2: Complex Feature with Multiple Rounds

**User**: "/implement user authentication system"

**Assistant**: _Presents Round 1 questions_

**User**: _Answers indicating complex, backend+database, with external service_

**Assistant**: _Presents Round 2 with specific auth-related questions_

**User**: _Provides details about OAuth, JWT, etc._

**Assistant**: "Do you want more questions or proceed to plan?"

**User**: "Proceed"

**Assistant**: _Saves requirements, generates comprehensive plan_

## Error Handling

- If `scripts/` fail, fall back to manual creation of files
- If template is missing, use a simplified inline template
- If user provides ambiguous answers, ask for clarification before proceeding
- If repository context can't be analyzed, rely solely on Q&A responses

## File Locations

- Questions saved to: `implementation-plans/{task-name}/requirements.yaml`
- Plans saved to: `implementation-plans/{task-name}/plan.md`
- Both files are git-committable and programmatically parseable
