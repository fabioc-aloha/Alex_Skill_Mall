"""Configuration loader for org-report.

Resolution order (first source that exists wins, then deep-merged with DEFAULTS):
  1. explicit ``--config PATH`` argument passed to :func:`load_config`
  2. ``./config.json`` in the current working directory
  3. ``~/.copilot/extensions/org-directory/config.json``
  4. built-in DEFAULTS defined in this module

Config is a plain JSON object. Any subset of the DEFAULTS shape is valid; keys
that are omitted from the user's config fall back to the built-in default.
"""
import json
import os
from copy import deepcopy

DEFAULTS = {
    "byline": {
        # Set to null / omit to skip the byline paragraphs on the cover.
        "prepared_by": None,
        "prepared_by_org": None,
    },
    "cover_copy": {
        "methodology": (
            "This brief profiles the leadership chain, direct reports, extended teams, and "
            "vendor partners in the target executive's organization. The reporting structure "
            "comes from a corporate directory service, and each profile is synthesized by an "
            "AI agent from accessible communication signals (mail, calendar, chat, and "
            "documents), then typeset through a Python export pipeline. Treat it as a "
            "point-in-time working snapshot, not an authoritative HR record."
        ),
        "disclosure": (
            "Disclosure: Profiles draw only on the communication signals the author is "
            "authorized to see. Anything protected by information barriers, sensitivity "
            "labels, or data-loss-prevention policies is invisible to this report, so "
            "collaborations and areas of ownership may be under-represented. Summaries are "
            "AI-generated and can contain errors or misattributed activity, so verify before "
            "acting on any specific claim. This document contains confidential organizational "
            "information; handle it accordingly and do not redistribute."
        ),
    },
    "typography": {
        "base_font": "Aptos",
    },
    "vendor_detection": {
        # Emails starting with any of these prefixes are treated as vendors.
        "email_prefixes": [],
        # Display names of the form "First Last (Company)" are treated as vendors
        # unless the parenthetical matches one of these (case-insensitive substrings).
        "display_name_paren_excludes": [],
    },
    "labels": {
        "no_profile_available": "No enriched profile available.",
    },
    "photos": {
        # When true, render_profile embeds a thumbnail from `directory` if a
        # matching file exists. Silently skipped when no match.
        "enabled": True,
        # Where photo files live. ~ is expanded.
        "directory": "~/.copilot/extensions/org-directory/artifacts/photos",
        # "email" (or "upn") tries <email>.<ext>; "name" tries <name_key>.<ext>.
        # The renderer falls back to name_key if the email lookup misses.
        "key_by": "email",
        # Rendered photo width, in inches.
        "size_inches": 0.7,
    },
    "tenure": {
        # Render "N years <suffix>" under the contact line when `employeeHireDate` is present.
        "enabled": True,
        # Suffix printed after the year count. "" prints just "N years".
        "suffix": "",
    },
    "signal_density": {
        # Colored dot next to the displayName when profile.signalDensity is present.
        "enabled": True,
        "colors": {
            "high": "059669",
            "medium": "D97706",
            "low": "DC2626",
            "none": "9CA3AF",
        },
    },
    "deep_dive": {
        # Render a "DEEP DIVE" section when profile.deepDive has any of
        # strategicBets, recentDecisions, or crossTeamDependencies.
        "enabled": True,
        "label": "DEEP DIVE",
    },
    "attribution": {
        # Small footer per profile summarizing signalCounts.
        # e.g. "Grounded in 47 emails · 12 meetings · 3 docs (Jul-Aug 2026)"
        "enabled": True,
        "prefix": "Grounded in ",
    },
    "team_stats": {
        # Extra columns on the "Teams at a glance" index table.
        "enabled": True,
        # Show TOTAL (fte + vendor) column.
        "show_total": True,
        # Show DEPTH (max reporting depth from lead) column.
        "show_depth": True,
    },
    "cross_team": {
        # Render an aggregated cross-team collaboration table between the team
        # index and the profile pages. Uses profile.collaborators as edges.
        "enabled": True,
        "title": "Cross-team collaboration",
        # Show only the top N pairs by interaction count.
        "top_n": 15,
        # Skip pairs with fewer than this many interactions (noise floor).
        "min_edges": 2,
    },
}

_USER_CONFIG_PATH = os.path.expanduser(
    os.path.join("~", ".copilot", "extensions", "org-directory", "config.json")
)


def _deep_merge(base, override):
    result = deepcopy(base)
    for key, value in override.items():
        if isinstance(value, dict) and isinstance(result.get(key), dict):
            result[key] = _deep_merge(result[key], value)
        else:
            result[key] = deepcopy(value)
    return result


def _read_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def load_config(explicit_path=None):
    """Return ``(config, source_path)`` from the first available source.

    ``source_path`` is the path to the config file that was loaded, or the
    string ``"defaults"`` when none of the discovery locations matched.
    """
    candidates = [
        explicit_path,
        os.path.join(os.getcwd(), "config.json"),
        _USER_CONFIG_PATH,
    ]
    for candidate in candidates:
        if candidate and os.path.isfile(candidate):
            return _deep_merge(DEFAULTS, _read_json(candidate)), candidate
    return deepcopy(DEFAULTS), "defaults"
