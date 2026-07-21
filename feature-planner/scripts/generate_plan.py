#!/usr/bin/env python3
"""
Generate technical implementation plan from requirements YAML and template.
"""

import os
import yaml
from pathlib import Path
from typing import Dict, Any, List, Optional
from datetime import datetime


def load_template(template_path: str) -> str:
    """Load the technical plan template."""
    with open(template_path, "r") as f:
        return f.read()


def load_requirements(requirements_path: str) -> Dict[str, Any]:
    """Load requirements from YAML file."""
    with open(requirements_path, "r") as f:
        return yaml.safe_load(f)


def extract_response_value(
    questions: List[Dict], responses: Dict, question_id: str
) -> Any:
    """
    Extract the human-readable text for a response.

    Args:
        questions: List of question dictionaries
        responses: Dictionary of responses
        question_id: ID of the question to extract

    Returns:
        Human-readable response text or list of texts
    """
    if question_id not in responses:
        return "Not specified"

    answer = responses[question_id]
    question = next((q for q in questions if q["id"] == question_id), None)

    if not question:
        return answer

    option_map = {opt["id"]: opt["text"] for opt in question.get("options", [])}

    if isinstance(answer, list):
        return [option_map.get(a, a) for a in answer]
    else:
        return option_map.get(answer, answer)


def generate_implementation_steps(requirements: Dict[str, Any]) -> List[str]:
    """
    Generate implementation steps based on requirements.

    Args:
        requirements: Requirements dictionary

    Returns:
        List of implementation step strings
    """
    steps = []
    responses = requirements.get("responses", {})
    questions = requirements.get("questions", [])

    # Extract key information
    change_types = extract_response_value(questions, responses, "q2")
    if not isinstance(change_types, list):
        change_types = [change_types]

    complexity = requirements.get("complexity", "medium")

    # Generate steps based on change types
    steps.append("Review requirements and design approach")

    if "UI/Frontend component" in change_types or "ui" in str(change_types).lower():
        steps.append("Design UI components and user flows")
        steps.append("Implement frontend components")
        steps.append("Add styling and responsive design")

    if "Backend/API logic" in change_types or "backend" in str(change_types).lower():
        steps.append("Design API endpoints and data contracts")
        steps.append("Implement backend logic")
        steps.append("Add error handling and validation")

    if (
        "Database schema or data model" in change_types
        or "database" in str(change_types).lower()
    ):
        steps.append("Design database schema changes")
        steps.append("Create migration scripts")
        steps.append("Test migration on development environment")

    steps.append("Write unit tests")
    steps.append("Write integration tests")
    steps.append("Manual testing and QA")

    if complexity in ["complex", "very_complex"]:
        steps.append("Performance testing and optimization")
        steps.append("Security review")

    steps.append("Update documentation")
    steps.append("Code review and address feedback")
    steps.append("Deploy to staging environment")
    steps.append("Final testing in staging")
    steps.append("Deploy to production")

    return steps


def fill_template(template: str, requirements: Dict[str, Any]) -> str:
    """
    Fill the template with data from requirements.

    Args:
        template: Template string with {{PLACEHOLDERS}}
        requirements: Requirements dictionary

    Returns:
        Filled template string
    """
    questions = requirements.get("questions", [])
    responses = requirements.get("responses", {})
    metadata = requirements.get("metadata", {})

    # Extract common information
    task_name = requirements.get("task_name", "Unknown Task")
    task_type = requirements.get("task_type", "feature")
    complexity = requirements.get("complexity", "medium")
    timestamp = requirements.get("timestamp", datetime.utcnow().isoformat() + "Z")

    # Extract specific responses
    goal = extract_response_value(questions, responses, "q1")
    change_types = extract_response_value(questions, responses, "q2")
    dependencies = extract_response_value(questions, responses, "q4")

    # Build replacement map
    replacements = {
        "{{TASK_NAME}}": task_name,
        "{{TASK_TYPE}}": task_type.title(),
        "{{COMPLEXITY}}": complexity.title(),
        "{{TIMESTAMP}}": timestamp,
        "{{PROBLEM_DESCRIPTION}}": f"Implement {task_name} to address: {goal}",
        "{{MOTIVATION}}": f"Primary goal: {goal}",
        "{{SUCCESS_CRITERIA}}": generate_success_criteria(requirements),
        "{{ARCHITECTURE_OVERVIEW}}": generate_architecture_overview(requirements),
        "{{DESIGN_DECISIONS}}": generate_design_decisions(requirements),
        "{{ALTERNATIVES}}": "To be documented during implementation",
        "{{ADDITIONAL_STEPS}}": generate_additional_steps(requirements),
        "{{FILES_TO_CREATE}}": generate_file_changes(requirements, "create"),
        "{{FILES_TO_MODIFY}}": generate_file_changes(requirements, "modify"),
        "{{FILES_TO_DELETE}}": "None specified",
        "{{NEW_DEPENDENCIES}}": generate_dependencies(requirements),
        "{{VERSION_REQUIREMENTS}}": generate_version_requirements(metadata),
        "{{INSTALL_COMMANDS}}": generate_install_commands(requirements),
        "{{NEW_ENDPOINTS}}": generate_endpoints(requirements, "new"),
        "{{MODIFIED_ENDPOINTS}}": generate_endpoints(requirements, "modified"),
        "{{API_FORMATS}}": "To be defined during implementation",
        "{{SCHEMA_CHANGES}}": generate_schema_changes(requirements),
        "{{MIGRATION_STRATEGY}}": generate_migration_strategy(requirements),
        "{{DATA_INTEGRITY}}": "Ensure referential integrity and data validation",
        "{{UNIT_TESTS}}": generate_test_strategy(requirements, "unit"),
        "{{INTEGRATION_TESTS}}": generate_test_strategy(requirements, "integration"),
        "{{MANUAL_TESTING}}": generate_manual_testing_steps(requirements),
        "{{EDGE_CASES}}": generate_edge_cases(requirements),
        "{{BLOCKERS}}": generate_blockers(requirements),
        "{{TECHNICAL_RISKS}}": generate_technical_risks(requirements),
        "{{MITIGATION}}": generate_mitigation_strategies(requirements),
        "{{TIME_ESTIMATE}}": generate_time_estimate(complexity),
        "{{EFFORT_BREAKDOWN}}": generate_effort_breakdown(requirements),
        "{{CRITICAL_PATH}}": generate_critical_path(requirements),
        "{{ROLLBACK_STEPS}}": generate_rollback_steps(requirements),
        "{{DB_ROLLBACK}}": generate_db_rollback(requirements),
        "{{MONITORING}}": "Add appropriate logging and monitoring for the new functionality",
        "{{ADDITIONAL_NOTES}}": generate_additional_notes(requirements),
    }

    # Generate implementation steps
    steps = generate_implementation_steps(requirements)
    steps_text = "\n".join(
        [f"- [ ] **Step {i + 1}**: {step}" for i, step in enumerate(steps[:5])]
    )

    if len(steps) > 5:
        additional_steps = "\n".join(
            [f"- [ ] **Step {i + 6}**: {step}" for i, step in enumerate(steps[5:])]
        )
        replacements["{{STEP_1}}"] = (
            steps[0] if len(steps) > 0 else "Define requirements"
        )
        replacements["{{STEP_2}}"] = steps[1] if len(steps) > 1 else "Design solution"
        replacements["{{STEP_3}}"] = steps[2] if len(steps) > 2 else "Implement"
        replacements["{{STEP_4}}"] = steps[3] if len(steps) > 3 else "Test"
        replacements["{{STEP_5}}"] = steps[4] if len(steps) > 4 else "Deploy"
        replacements["{{ADDITIONAL_STEPS}}"] = additional_steps
    else:
        replacements["{{STEP_1}}"] = (
            steps[0] if len(steps) > 0 else "Define requirements"
        )
        replacements["{{STEP_2}}"] = steps[1] if len(steps) > 1 else "Design solution"
        replacements["{{STEP_3}}"] = steps[2] if len(steps) > 2 else "Implement"
        replacements["{{STEP_4}}"] = steps[3] if len(steps) > 3 else "Test"
        replacements["{{STEP_5}}"] = steps[4] if len(steps) > 4 else "Deploy"
        replacements["{{ADDITIONAL_STEPS}}"] = ""

    # Apply replacements
    result = template
    for placeholder, value in replacements.items():
        result = result.replace(placeholder, str(value))

    return result


# Helper functions for generating specific sections


def generate_success_criteria(requirements: Dict[str, Any]) -> str:
    """Generate success criteria section."""
    return "- Feature functions as specified\n- All tests pass\n- Code reviewed and approved\n- Documentation updated\n- No performance degradation"


def generate_architecture_overview(requirements: Dict[str, Any]) -> str:
    """Generate architecture overview."""
    responses = requirements.get("responses", {})
    questions = requirements.get("questions", [])
    change_types = extract_response_value(questions, responses, "q2")

    if not isinstance(change_types, list):
        change_types = [change_types]

    overview_parts = []

    for change_type in change_types:
        if "ui" in str(change_type).lower():
            overview_parts.append("- Frontend: React/TypeScript components")
        if "backend" in str(change_type).lower():
            overview_parts.append("- Backend: API endpoints with proper error handling")
        if "database" in str(change_type).lower():
            overview_parts.append("- Database: Schema changes with migration strategy")

    return (
        "\n".join(overview_parts)
        if overview_parts
        else "To be defined during implementation"
    )


def generate_design_decisions(requirements: Dict[str, Any]) -> str:
    """Generate design decisions section."""
    return "Key design decisions will be documented as they are made during implementation."


def generate_additional_steps(requirements: Dict[str, Any]) -> str:
    """Generate additional implementation steps."""
    steps = generate_implementation_steps(requirements)
    if len(steps) > 5:
        return "\n".join(
            [f"- [ ] **Step {i + 6}**: {step}" for i, step in enumerate(steps[5:])]
        )
    return ""


def generate_file_changes(requirements: Dict[str, Any], change_type: str) -> str:
    """Generate file changes section."""
    return f"Files to {change_type} will be identified during implementation based on the specific requirements."


def generate_dependencies(requirements: Dict[str, Any]) -> str:
    """Generate dependencies section."""
    responses = requirements.get("responses", {})
    questions = requirements.get("questions", [])
    deps = extract_response_value(questions, responses, "q4")

    if isinstance(deps, list) and "Need to install new packages/libraries" in str(deps):
        return "New packages to be identified during implementation"
    elif "Need to install new packages/libraries" in str(deps):
        return "New packages to be identified during implementation"
    else:
        return "No new dependencies required"


def generate_version_requirements(metadata: Dict[str, Any]) -> str:
    """Generate version requirements."""
    tech_stack = metadata.get("tech_stack", [])
    if tech_stack:
        return "\n".join([f"- {tech}" for tech in tech_stack])
    return "Use versions specified in package.json / requirements.txt"


def generate_install_commands(requirements: Dict[str, Any]) -> str:
    """Generate installation commands."""
    return "# To be added when specific packages are identified\nnpm install <package-name>\n# or\npip install <package-name>"


def generate_endpoints(requirements: Dict[str, Any], endpoint_type: str) -> str:
    """Generate API endpoints section."""
    responses = requirements.get("responses", {})
    questions = requirements.get("questions", [])
    change_types = extract_response_value(questions, responses, "q2")

    if (
        "Backend/API logic" in str(change_types)
        or "backend" in str(change_types).lower()
    ):
        return f"API endpoints will be defined during implementation"
    return "N/A - No API changes"


def generate_schema_changes(requirements: Dict[str, Any]) -> str:
    """Generate schema changes section."""
    responses = requirements.get("responses", {})
    questions = requirements.get("questions", [])
    change_types = extract_response_value(questions, responses, "q2")

    if (
        "Database schema or data model" in str(change_types)
        or "database" in str(change_types).lower()
    ):
        return "Database schema changes will be defined during implementation"
    return "N/A - No database changes"


def generate_migration_strategy(requirements: Dict[str, Any]) -> str:
    """Generate migration strategy."""
    responses = requirements.get("responses", {})
    questions = requirements.get("questions", [])
    change_types = extract_response_value(questions, responses, "q2")

    if (
        "Database schema or data model" in str(change_types)
        or "database" in str(change_types).lower()
    ):
        return "1. Create migration script\n2. Test on development database\n3. Run on staging\n4. Backup production before migration\n5. Run on production with rollback plan ready"
    return "N/A - No database changes"


def generate_test_strategy(requirements: Dict[str, Any], test_type: str) -> str:
    """Generate test strategy section."""
    return f"Write comprehensive {test_type} tests for all new functionality"


def generate_manual_testing_steps(requirements: Dict[str, Any]) -> str:
    """Generate manual testing steps."""
    return "1. Test happy path scenarios\n2. Test error conditions\n3. Test edge cases\n4. Verify UI/UX meets requirements\n5. Cross-browser/device testing if applicable"


def generate_edge_cases(requirements: Dict[str, Any]) -> str:
    """Generate edge cases to test."""
    return "- Empty/null inputs\n- Maximum/minimum values\n- Concurrent operations\n- Network failures\n- Invalid data formats"


def generate_blockers(requirements: Dict[str, Any]) -> str:
    """Generate potential blockers."""
    responses = requirements.get("responses", {})
    questions = requirements.get("questions", [])
    deps = extract_response_value(questions, responses, "q4")

    blockers = []

    if "Depends on other features" in str(deps):
        blockers.append("- Dependent features must be completed first")

    if "Requires external service integration" in str(deps):
        blockers.append("- External service integration and approval needed")

    if not blockers:
        blockers.append("- No major blockers identified")

    return "\n".join(blockers)


def generate_technical_risks(requirements: Dict[str, Any]) -> str:
    """Generate technical risks."""
    complexity = requirements.get("complexity", "medium")

    if complexity in ["complex", "very_complex"]:
        return "- Complexity may lead to longer development time\n- Integration challenges with existing systems\n- Potential performance impact"
    else:
        return "- Minimal technical risk for this change"


def generate_mitigation_strategies(requirements: Dict[str, Any]) -> str:
    """Generate mitigation strategies."""
    return "- Thorough testing at each stage\n- Code review by experienced team members\n- Incremental rollout if possible\n- Monitor key metrics after deployment"


def generate_time_estimate(complexity: str) -> str:
    """Generate time estimate based on complexity."""
    estimates = {
        "simple": "1-2 hours",
        "medium": "4-8 hours (0.5-1 day)",
        "complex": "1-3 days",
        "very_complex": "1-2 weeks",
    }
    return estimates.get(complexity.lower(), "To be estimated")


def generate_effort_breakdown(requirements: Dict[str, Any]) -> str:
    """Generate effort breakdown."""
    return "- Design & Planning: 10%\n- Implementation: 50%\n- Testing: 25%\n- Documentation & Review: 15%"


def generate_critical_path(requirements: Dict[str, Any]) -> str:
    """Generate critical path items."""
    return "Critical path items will be identified during implementation"


def generate_rollback_steps(requirements: Dict[str, Any]) -> str:
    """Generate rollback steps."""
    return "1. Revert code changes via git\n2. Redeploy previous version\n3. Verify functionality restored\n4. Investigate and fix issues before retry"


def generate_db_rollback(requirements: Dict[str, Any]) -> str:
    """Generate database rollback strategy."""
    responses = requirements.get("responses", {})
    questions = requirements.get("questions", [])
    change_types = extract_response_value(questions, responses, "q2")

    if (
        "Database schema or data model" in str(change_types)
        or "database" in str(change_types).lower()
    ):
        return "1. Have rollback migration ready\n2. Test rollback on staging first\n3. Backup data before rollback\n4. Execute rollback migration\n5. Verify data integrity"
    return "N/A - No database changes"


def generate_additional_notes(requirements: Dict[str, Any]) -> str:
    """Generate additional notes."""
    metadata = requirements.get("metadata", {})
    notes = []

    if "tech_stack" in metadata:
        notes.append(f"**Tech Stack**: {', '.join(metadata['tech_stack'])}")

    if "detected_patterns" in metadata:
        notes.append(
            f"**Detected Patterns**: {', '.join(metadata['detected_patterns'])}"
        )

    return "\n\n".join(notes) if notes else "No additional notes"


def generate_plan(
    requirements_path: str, output_path: str, template_path: Optional[str] = None
) -> str:
    """
    Generate implementation plan from requirements and template.

    Args:
        requirements_path: Path to requirements.yaml
        output_path: Path where plan.md will be saved
        template_path: Path to template file (optional)

    Returns:
        str: Path to generated plan.md file
    """
    # Default template path
    if template_path is None:
        script_dir = Path(__file__).parent
        template_path = str(script_dir.parent / "templates" / "TECHNICAL_PLAN.md")

    # Load requirements and template
    requirements = load_requirements(requirements_path)
    template = load_template(template_path)

    # Fill template
    plan = fill_template(template, requirements)

    # Save plan
    output_file = Path(output_path)
    output_file.parent.mkdir(parents=True, exist_ok=True)

    with open(output_file, "w") as f:
        f.write(plan)

    return str(output_file)


if __name__ == "__main__":
    # Example usage
    import sys

    if len(sys.argv) < 2:
        print(
            "Usage: python generate_plan.py <requirements.yaml> [output.md] [template.md]"
        )
        sys.exit(1)

    requirements_path = sys.argv[1]
    output_path = sys.argv[2] if len(sys.argv) > 2 else "plan.md"
    template_path = sys.argv[3] if len(sys.argv) > 3 else None

    plan_file = generate_plan(requirements_path, output_path, template_path)
    print(f"Implementation plan generated: {plan_file}")
