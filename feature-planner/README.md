# Feature Planner Skill

A Claude skill that helps systematically plan feature implementations through structured Q&A sessions and generates comprehensive technical implementation plans.

## What This Skill Does

When you request to implement a new feature, this skill will:

1. **Ask clarifying questions** in YAML format about your requirements
2. **Adapt dynamically** based on your responses (frontend vs backend, simple vs complex, etc.)
3. **Save Q&A sessions** programmatically to YAML files
4. **Generate technical plans** with all implementation details

## How to Use

### Automatic Activation

The skill automatically detects when you use keywords like:

- "implement"
- "add feature"
- "build"
- "create feature"
- "new feature"

**Example:**

```
"I want to implement a dark mode toggle for the app"
```

### Explicit Invocation

Use the `/implement` slash command:

```
/implement user authentication system
```

### Example Workflow

1. **You**: "I want to add a dark mode toggle"

2. **Claude**: Presents questions in YAML format:

   ```yaml
   questions:
     - id: q1
       text: "What is the primary goal or problem this feature solves?"
       allow_multiple: false
       options:
         - id: "improve_ux"
           text: "Improve user experience"
         - id: "user_request"
           text: "Direct user request or need"
   ```

3. **You**: Answer in any format:
   - "1: A, 2: B,C, 3: medium"
   - "For question 1, I choose improve_ux..."
   - YAML format

4. **Claude**: Asks follow-up questions based on your answers

5. **Claude**: Saves requirements and generates implementation plan:

   ```
   implementation-plans/dark-mode-toggle/
   ├── requirements.yaml
   └── plan.md
   ```

## Directory Structure

```
feature-planner/
├── SKILL.md                    # Main skill definition
├── templates/
│   └── TECHNICAL_PLAN.md       # Implementation plan template
├── schemas/
│   └── questions-schema.yaml   # Question format reference
└── scripts/
    ├── save_requirements.py    # Saves Q&A to YAML
    └── generate_plan.py        # Generates implementation plan
```

## Technical Plan Includes

The generated implementation plan covers:

1. **Problem Statement** - What & why
2. **Solution Approach** - Architecture & design decisions
3. **Implementation Steps** - Step-by-step checklist
4. **File Changes** - Files to create/modify/delete
5. **Dependencies** - New packages required
6. **API Changes** - Endpoints & formats
7. **Data Model Changes** - Schema changes & migrations
8. **Testing Strategy** - Unit, integration, manual tests
9. **Risk Assessment** - Blockers & mitigation
10. **Complexity Estimate** - Time & effort breakdown
11. **Rollback Strategy** - How to revert

## Output Files

All plans are saved to `implementation-plans/{task-name}/`:

- `requirements.yaml` - Structured Q&A data (programmatically parseable)
- `plan.md` - Technical implementation plan (human-readable)

## Installation (Claude Code)

This skill should be placed in your project's root directory. Claude Code will automatically detect it.

For other Claude environments (Gemini CLI, Coodex, OpenCode), refer to their skill installation documentation.

## Examples

### Simple Feature

```
User: "Add a loading spinner to the save button"
→ Quick Q&A → Simple implementation plan
```

### Complex Feature

```
User: "/implement OAuth authentication with Google and GitHub"
→ Multiple rounds of detailed questions
→ Comprehensive plan with security considerations
```

### Refactoring Task

```
User: "I want to refactor the file upload logic to use streams"
→ Tailored questions for refactoring
→ Risk-aware implementation plan
```

## Customization

You can customize:

- **Questions**: Edit core questions in `SKILL.md`
- **Template**: Modify `templates/TECHNICAL_PLAN.md` for different plan formats
- **Scripts**: Enhance Python scripts for additional functionality

## Testing

To test the scripts independently:

```bash
# Test save_requirements.py
python3 feature-planner/scripts/save_requirements.py

# Test generate_plan.py
python3 feature-planner/scripts/generate_plan.py \
  implementation-plans/example/requirements.yaml \
  implementation-plans/example/plan.md
```

## License

This skill follows the same license as the parent project.
