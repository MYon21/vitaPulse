"""Keep a scored reading in memory so a QR link can open it later.

The id is an unguessable token. Records live in this process only and are
not written to disk.
"""

from __future__ import annotations

import re
import secrets
from datetime import datetime, timezone

ID_PATTERN = re.compile(r"^[A-Za-z0-9_-]{16,64}$")
_shares: dict[str, dict] = {}


def save_share(score: float, inputs: dict) -> str:
    share_id = secrets.token_urlsafe(16)
    if not ID_PATTERN.fullmatch(share_id):
        raise RuntimeError("Could not create a share id.")
    _shares[share_id] = {
        "id": share_id,
        "score": round(score, 4),
        "source": "synthetic model, not a diagnosis",
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "inputs": dict(inputs),
    }
    return share_id


def load_share(share_id: str) -> dict | None:
    if not ID_PATTERN.fullmatch(share_id):
        return None
    record = _shares.get(share_id)
    return dict(record) if record is not None else None
