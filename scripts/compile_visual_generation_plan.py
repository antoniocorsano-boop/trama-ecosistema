#!/usr/bin/env python3
"""Compile a Studio Atlas Visual Bible + Shot Plan into bounded visual-generation jobs.

Deterministic, provider-neutral, and fail-closed. It never performs inference.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any


def load_json(path: str) -> dict[str, Any]:
    return json.loads(Path(path).read_text(encoding="utf-8"))


def index_by(items: list[dict[str, Any]], key: str) -> dict[str, dict[str, Any]]:
    out: dict[str, dict[str, Any]] = {}
    for item in items:
        value = item.get(key)
        if not isinstance(value, str) or not value:
            raise ValueError(f"missing {key}")
        if value in out:
            raise ValueError(f"duplicate {key}: {value}")
        out[value] = item
    return out


def style_prompt(bible: dict[str, Any]) -> str:
    style = bible["styleDirection"]
    return (
        f"{style['family']}; {style['finish']}; palette: {style['palette']}; "
        f"lighting: {style['lighting']}; composition: {style['composition']}"
    )


def compile_reference_jobs(bible: dict[str, Any]) -> dict[str, Any]:
    jobs: list[dict[str, Any]] = []
    style = style_prompt(bible)
    forbidden = list(bible["styleDirection"].get("forbidden", []))
    workflow = bible["generationPolicy"]["draftWorkflowFamily"]
    max_variants = int(bible["generationPolicy"]["maxVariants"])

    for character in bible.get("characters", []):
        if character.get("referenceStatus") == "LOCKED":
            continue
        jobs.append(
            {
                "jobId": f"reference-character-{character['characterId']}",
                "purpose": "CHARACTER_REFERENCE",
                "subjectRef": character["characterId"],
                "workflowFamily": workflow,
                "prompt": (
                    f"{style}. Character reference sheet for {character['name']}, "
                    f"{character['role']}. {character['description']}. "
                    f"Continuity anchors: {', '.join(character['continuityAnchors'])}. "
                    "Create a coherent adult character identity suitable for repeated wide and medium shots."
                ),
                "negativeConstraints": forbidden
                + ["floating avatar head", "mascot", "character collage with inconsistent identities"],
                "maxVariants": max_variants,
                "referenceInputs": [],
            }
        )

    for environment in bible.get("environments", []):
        if environment.get("referenceStatus") == "LOCKED":
            continue
        jobs.append(
            {
                "jobId": f"reference-environment-{environment['environmentId']}",
                "purpose": "ENVIRONMENT_REFERENCE",
                "subjectRef": environment["environmentId"],
                "workflowFamily": workflow,
                "prompt": (
                    f"{style}. Environment master for {environment['name']}. "
                    f"{environment['description']}. "
                    f"Continuity anchors: {', '.join(environment['continuityAnchors'])}. "
                    "Produce one spatially coherent master that can anchor later scene generations."
                ),
                "negativeConstraints": forbidden
                + ["website mockup", "dashboard", "standalone technical diagram"],
                "maxVariants": max_variants,
                "referenceInputs": [],
            }
        )

    return {
        "schemaVersion": "atlas.visual-generation-plan/v0.1",
        "pathwayId": bible["pathwayId"],
        "visualBibleId": bible["visualBibleId"],
        "planType": "REFERENCE_GENERATION",
        "decision": "REFERENCE_GENERATION_READY" if jobs else "NO_REFERENCE_GENERATION_REQUIRED",
        "jobs": jobs,
        "paidComputeAuthorized": False,
        "allowQualityDowngrade": False,
        "runtimeAuthorized": False,
        "publicationAuthorityGranted": False,
    }


def compile_shot_jobs(bible: dict[str, Any], shot_plan: dict[str, Any]) -> dict[str, Any]:
    characters = index_by(bible.get("characters", []), "characterId")
    environments = index_by(bible.get("environments", []), "environmentId")
    style = style_prompt(bible)
    forbidden = list(bible["styleDirection"].get("forbidden", []))
    workflow = bible["generationPolicy"]["productionWorkflowFamily"]
    max_variants = int(bible["generationPolicy"]["maxVariants"])

    if bible["generationPolicy"].get("promptOnlyProductionAllowed") is not False:
        raise ValueError("prompt-only production must remain disabled")

    blockers: list[dict[str, Any]] = []
    jobs: list[dict[str, Any]] = []

    for shot in shot_plan.get("shots", []):
        shot_id = shot["shotId"]
        environment = environments.get(shot["environmentRef"])
        if environment is None:
            blockers.append({"shotId": shot_id, "reason": "UNKNOWN_ENVIRONMENT_REF"})
            continue

        refs: list[str] = []
        if shot.get("referenceRequired"):
            if environment.get("referenceStatus") != "LOCKED" or not environment.get("referenceAssetRefs"):
                blockers.append({"shotId": shot_id, "reason": "ENVIRONMENT_REFERENCE_NOT_LOCKED"})
                continue
            refs.extend(environment["referenceAssetRefs"])

        missing_character = False
        for character_id in shot.get("characterRefs", []):
            character = characters.get(character_id)
            if character is None:
                blockers.append({"shotId": shot_id, "reason": f"UNKNOWN_CHARACTER_REF:{character_id}"})
                missing_character = True
                break
            if shot.get("referenceRequired"):
                if character.get("referenceStatus") != "LOCKED" or not character.get("referenceAssetRefs"):
                    blockers.append({"shotId": shot_id, "reason": f"CHARACTER_REFERENCE_NOT_LOCKED:{character_id}"})
                    missing_character = True
                    break
                refs.extend(character["referenceAssetRefs"])
        if missing_character:
            continue

        prompt = (
            f"{style}. Narrative beat: {shot['narrativeBeat']}. "
            f"Camera: {shot['camera']}. Scene instruction: {shot['promptCore']}."
        )
        if shot.get("continuityRefs"):
            prompt += f" Preserve continuity: {', '.join(shot['continuityRefs'])}."

        jobs.append(
            {
                "jobId": f"shot-{shot_id}",
                "purpose": "SCENE_FRAME",
                "shotId": shot_id,
                "sceneRef": shot["sceneRef"],
                "workflowFamily": workflow,
                "prompt": prompt,
                "negativeConstraints": forbidden + list(shot.get("negativeConstraints", [])),
                "referenceInputs": refs,
                "poseControlRef": shot.get("poseControlRef"),
                "compositionControlRef": shot.get("compositionControlRef"),
                "aspectRatio": shot["aspectRatio"],
                "maxVariants": max_variants,
            }
        )

    decision = "SHOT_GENERATION_READY" if not blockers and jobs else "STOP_REFERENCE_LOCK_REQUIRED"
    return {
        "schemaVersion": "atlas.visual-generation-plan/v0.1",
        "pathwayId": bible["pathwayId"],
        "visualBibleId": bible["visualBibleId"],
        "planType": "SHOT_GENERATION",
        "decision": decision,
        "jobs": jobs if decision == "SHOT_GENERATION_READY" else [],
        "blockers": blockers,
        "paidComputeAuthorized": False,
        "allowQualityDowngrade": False,
        "runtimeAuthorized": False,
        "publicationAuthorityGranted": False,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--visual-bible", required=True)
    parser.add_argument("--mode", choices=("references", "shots"), required=True)
    parser.add_argument("--shot-plan")
    parser.add_argument("--output", required=True)
    args = parser.parse_args()

    bible = load_json(args.visual_bible)
    if bible.get("schemaVersion") != "atlas.visual-bible/v0.1":
        raise ValueError("unsupported visual bible schema")

    if args.mode == "references":
        plan = compile_reference_jobs(bible)
    else:
        if not args.shot_plan:
            raise ValueError("--shot-plan is required for shots mode")
        shot_plan = load_json(args.shot_plan)
        if shot_plan.get("schemaVersion") != "atlas.visual-shot-plan/v0.1":
            raise ValueError("unsupported shot plan schema")
        if shot_plan.get("visualBibleRef") != bible.get("visualBibleId"):
            raise ValueError("shot plan visualBibleRef mismatch")
        plan = compile_shot_jobs(bible, shot_plan)

    Path(args.output).write_text(json.dumps(plan, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(plan, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
