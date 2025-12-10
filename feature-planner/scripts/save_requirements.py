#!/usr/bin/env python3
"""
Save Q&A requirements to YAML format for feature implementation planning.
"""

import os
import yaml
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List


def save_requirements(data: Dict[str, Any], output_dir: str) -> str:
    """
    Save Q&A session data to YAML file.

    Args:
        data: Dictionary containing task_name, task_type, questions, responses, metadata
        output_dir: Directory path where requirements.yaml will be saved

    Returns:
        str: Path to saved requirements.yaml file

    Example:
        data = {
            'task_name': 'dark-mode-toggle',
            'task_type': 'feature',
            'complexity': 'medium',
            'questions': [...],
            'responses': {...},
            'metadata': {...}
        }
        save_requirements(data, 'implementation-plans/dark-mode-toggle/')
    """
    # Create output directory if it doesn't exist
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    # Add timestamp if not provided
    if "timestamp" not in data:
        data["timestamp"] = datetime.utcnow().isoformat() + "Z"

    # Prepare the requirements structure
    requirements = {
        "task_name": data.get("task_name", "unnamed-task"),
        "task_type": data.get("task_type", "feature"),
        "timestamp": data["timestamp"],
        "complexity": data.get("complexity", "unknown"),
        "questions": data.get("questions", []),
        "responses": data.get("responses", {}),
        "metadata": data.get("metadata", {}),
    }

    # Save to YAML file
    requirements_file = output_path / "requirements.yaml"

    with open(requirements_file, "w") as f:
        yaml.dump(
            requirements,
            f,
            default_flow_style=False,
            sort_keys=False,
            allow_unicode=True,
        )

    return str(requirements_file)


def load_requirements(requirements_path: str) -> Dict[str, Any]:
    """
    Load requirements from YAML file.

    Args:
        requirements_path: Path to requirements.yaml file

    Returns:
        Dict containing the requirements data
    """
    with open(requirements_path, "r") as f:
        return yaml.safe_load(f)


def format_response_summary(data: Dict[str, Any]) -> str:
    """
    Create a human-readable summary of Q&A responses.

    Args:
        data: Requirements data dictionary

    Returns:
        str: Formatted summary text
    """
    summary = []
    summary.append(f"# Q&A Summary: {data.get('task_name', 'Unknown')}")
    summary.append(f"Type: {data.get('task_type', 'Unknown')}")
    summary.append(f"Complexity: {data.get('complexity', 'Unknown')}")
    summary.append(f"Timestamp: {data.get('timestamp', 'Unknown')}")
    summary.append("")
    summary.append("## Responses:")

    questions = {q["id"]: q for q in data.get("questions", [])}
    responses = data.get("responses", {})

    for q_id, answer in responses.items():
        if q_id in questions:
            question = questions[q_id]
            summary.append(f"\n**{question['text']}**")

            if isinstance(answer, list):
                # Multiple choice
                option_map = {
                    opt["id"]: opt["text"] for opt in question.get("options", [])
                }
                for ans in answer:
                    summary.append(f"  - {option_map.get(ans, ans)}")
            else:
                # Single choice
                option_map = {
                    opt["id"]: opt["text"] for opt in question.get("options", [])
                }
                summary.append(f"  → {option_map.get(answer, answer)}")

    return "\n".join(summary)


if __name__ == "__main__":
    # Example usage
    example_data = {
        "task_name": "example-feature",
        "task_type": "feature",
        "complexity": "medium",
        "questions": [
            {
                "id": "q1",
                "text": "What is the primary goal?",
                "allow_multiple": False,
                "options": [
                    {"id": "improve_ux", "text": "Improve user experience"},
                    {"id": "fix_bug", "text": "Fix a bug"},
                ],
            }
        ],
        "responses": {"q1": "improve_ux"},
        "metadata": {
            "repository": "example-repo",
            "tech_stack": ["Python", "JavaScript"],
        },
    }

    # Save example
    output_file = save_requirements(
        example_data, "implementation-plans/example-feature/"
    )
    print(f"Requirements saved to: {output_file}")

    # Load and display summary
    loaded_data = load_requirements(output_file)
    print("\n" + format_response_summary(loaded_data))
