from __future__ import annotations

from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse


def canonicalize_url(url: str) -> str:
    """Strip fragments and normalize for stable UTM and dedupe (spec: link canonicalization)."""
    parsed = urlparse(url.strip())
    return urlunparse(parsed._replace(fragment=""))


def append_utm(url: str, source: str, medium: str, campaign: str, content: str) -> str:
    parsed = urlparse(url)
    query = dict(parse_qsl(parsed.query, keep_blank_values=True))
    query["utm_source"] = source
    query["utm_medium"] = medium
    query["utm_campaign"] = campaign
    query["utm_content"] = content
    return urlunparse(parsed._replace(query=urlencode(query)))
