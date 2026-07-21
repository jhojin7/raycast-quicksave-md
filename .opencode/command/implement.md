---
description: Plan and implement a feature through structured Q&A
agent: general
---

I need to implement the following feature: $ARGUMENTS

Please use the **Feature Planner** skill located in `feature-planner/SKILL.md` to guide me through this implementation:

1. Ask me clarifying questions in YAML format (following the schema in `feature-planner/schemas/questions-schema.yaml`)
2. Start with core questions, then ask dynamic follow-up questions based on my responses
3. Always end each round with a question asking if I want to continue or proceed to the implementation plan
4. Save the Q&A session to `implementation-plans/{task-name}/requirements.yaml` using `feature-planner/scripts/save_requirements.py`
5. Generate a comprehensive technical implementation plan to `implementation-plans/{task-name}/plan.md` using `feature-planner/scripts/generate_plan.py`

Reference the skill documentation at `feature-planner/SKILL.md` for detailed instructions on:

- Question format and structure
- How to parse my responses (accept natural language, letter-based, or YAML format)
- Dynamic question generation based on repository context
- Template usage and plan generation

Let's start the feature planning process!
