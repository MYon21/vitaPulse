"""Local scoring API for the VitaPulse try-it form.

Run from the backend folder:

    python app.py

POST /score accepts the same fields as the Your details card and returns
the trained model's chance from 0 to 1. The score comes from synthetic
training data and is not a diagnosis.
"""

from __future__ import annotations

import socket
import time
from collections import defaultdict, deque
from contextlib import asynccontextmanager
from typing import Literal

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ConfigDict, Field

from predict import load_model, score_person
from shares import load_share, save_share

MAX_BODY_BYTES = 4_096
RATE_LIMIT = 30
RATE_WINDOW_SECONDS = 60
ALLOWED_ORIGINS = (
    "http://localhost:3000",
    "http://127.0.0.1:3000",
)

@asynccontextmanager
async def lifespan(_app: FastAPI):
    load_model()
    yield


app = FastAPI(title="VitaPulse score", docs_url=None, redoc_url=None, lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(ALLOWED_ORIGINS),
    allow_methods=["POST", "GET"],
    allow_headers=["content-type"],
)

_visits: dict[str, deque[float]] = defaultdict(deque)


class ScoreRequest(BaseModel):
    model_config = ConfigDict(extra="ignore", str_strip_whitespace=True)

    sex: Literal["female", "male"]
    age: int = Field(ge=18, le=100)
    bmiCategory: Literal["underweight", "healthy", "overweight", "obesity"]
    bmi: float | None = Field(default=None, ge=10, le=80)
    familyHistory: Literal["yes", "no", "unknown"]
    alcohol: Literal["none", "occasional", "frequent", "regular"]
    smoking: Literal["never", "former", "current"]
    drugUse: Literal["none", "past", "current", "former"]
    systolic: int = Field(ge=70, le=250)
    diastolic: int = Field(ge=40, le=150)
    sugar: int = Field(ge=40, le=400)


@app.middleware("http")
async def guard_request(request: Request, call_next):
    if request.method == "POST":
        body = await request.body()
        if len(body) > MAX_BODY_BYTES:
            return JSONResponse(status_code=413, content={"detail": "Request is too large."})
        if not _allow(request.client.host if request.client else "unknown"):
            return JSONResponse(status_code=429, content={"detail": "Too many score requests. Try again shortly."})
    return await call_next(request)


def _allow(client: str) -> bool:
    now = time.monotonic()
    recent = _visits[client]
    while recent and now - recent[0] > RATE_WINDOW_SECONDS:
        recent.popleft()
    if len(recent) >= RATE_LIMIT:
        return False
    recent.append(now)
    return True


@app.get("/health")
def health() -> dict[str, bool]:
    return {"ok": True}


def _lan_ip() -> str | None:
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        sock.connect(("8.8.8.8", 80))
        ip = sock.getsockname()[0]
    except OSError:
        return None
    finally:
        sock.close()
    parts = ip.split(".")
    if len(parts) != 4 or not all(part.isdigit() and 0 <= int(part) <= 255 for part in parts):
        return None
    if ip.startswith("127."):
        return None
    return ip


@app.post("/score")
def score(body: ScoreRequest) -> dict[str, float | str | None]:
    payload = body.model_dump(exclude_none=True)
    payload["alcohol"] = "frequent" if payload.get("alcohol") == "regular" else payload.get("alcohol")
    payload["drugUse"] = "past" if payload.get("drugUse") == "former" else payload.get("drugUse")
    try:
        probability = score_person(payload)
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
    except FileNotFoundError as error:
        raise HTTPException(status_code=503, detail="The scoring model is not available.") from error
    rounded = round(probability, 4)
    share_id = save_share(rounded, payload)
    return {
        "id": share_id,
        "score": rounded,
        "source": "synthetic model, not a diagnosis",
        "lanIp": _lan_ip(),
    }


@app.get("/results/{share_id}")
def result(share_id: str) -> dict:
    record = load_share(share_id)
    if record is None:
        raise HTTPException(status_code=404, detail="This result is not available.")
    return record


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=False)
