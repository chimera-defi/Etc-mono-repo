from __future__ import annotations

from orbit_pilot.models import PlatformRecord


DEFAULT_GUIDANCE = {
    "checklist": [
        "Use the generated title and body as the starting point.",
        "Keep the submission aligned with the platform's expected format.",
        "Do not paste the exact same wording everywhere.",
        "Record the live URL after submission.",
    ],
    "best_practices": [
        "Lead with the specific product value, not generic hype.",
        "Prefer one strong link over multiple links.",
        "Keep claims factual and easy to verify.",
    ],
}


PLATFORM_GUIDANCE = {
    "crunchbase": {
        "best_practices": [
            "Use a company-description tone, not a launch-announcement tone.",
            "Keep the summary factual and investor-readable.",
            "Double-check company category, founding year, and website fields.",
        ]
    },
    "reddit": {
        "best_practices": [
            "Read subreddit rules before posting.",
            "Ask for feedback instead of hard-selling.",
            "Be ready to answer comments after posting.",
        ]
    },
    "product_hunt": {
        "best_practices": [
            "Prepare maker comment copy separately.",
            "Use the clearest hero image or product screenshot.",
            "Time the launch when the team can actively respond.",
        ]
    },
    "hacker_news": {
        "best_practices": [
            "Keep the title plain and concrete.",
            "Avoid marketing language in the title.",
            "Be ready for skeptical technical feedback.",
        ]
    },
    "betalist": {
        "best_practices": [
            "Keep the product description concise and concrete.",
            "Use a screenshot that explains the product quickly.",
        ]
    },
}


def build_guidance(record: PlatformRecord) -> dict[str, list[str]]:
    guidance = {
        "checklist": list(DEFAULT_GUIDANCE["checklist"]),
        "best_practices": list(DEFAULT_GUIDANCE["best_practices"]),
    }
    extra = PLATFORM_GUIDANCE.get(record.slug, {})
    for key in ("checklist", "best_practices"):
        guidance[key].extend(extra.get(key, []))
    return guidance
