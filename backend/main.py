import logging
import os
from pathlib import Path

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import Base, engine, get_db, migrate_db
from models import REMOVED_ASSESSMENT_TYPES, Assessment
from schemas import AssessmentCreate, AssessmentResponse, AssessmentUpdate

logger = logging.getLogger("tracker")

Base.metadata.create_all(bind=engine)
migrate_db()

app = FastAPI(title="CE+ Assessment Tracker")

_SECURITY_CSP = (
    "default-src 'self'; "
    "script-src 'self'; "
    "style-src 'self' 'unsafe-inline'; "
    "img-src 'self' data:; "
    "connect-src 'self'; "
    "frame-ancestors 'none'; "
    "base-uri 'self'; "
    "form-action 'self'"
)


def _allowed_origins() -> list[str]:
    raw = os.environ.get("CORS_ORIGINS", "")
    origins = []
    for part in raw.split(","):
        origin = part.strip()
        if origin and origin != "*":
            origins.append(origin)
    return origins


_origins = _allowed_origins()
if _origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=_origins,
        allow_credentials=False,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type"],
    )


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    if not request.url.path.startswith(("/docs", "/redoc", "/openapi.json")):
        response.headers["Content-Security-Policy"] = _SECURITY_CSP
    return response


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(status_code=422, content={"detail": exc.errors()})


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    if isinstance(exc, HTTPException):
        raise exc
    logger.exception("Unhandled error on %s", request.url.path)
    if request.url.path.startswith("/api/"):
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error"},
        )
    raise exc


STATIC_DIR = Path(__file__).parent / "static"


def _visible(query):
    hidden = tuple(sorted(REMOVED_ASSESSMENT_TYPES))
    if not hidden:
        return query
    return query.filter(
        func.lower(func.trim(Assessment.assessment_type)).notin_(hidden)
    )


def _is_hidden(assessment: Assessment) -> bool:
    assessment_type = (assessment.assessment_type or "").strip().lower()
    return assessment_type in REMOVED_ASSESSMENT_TYPES


def _get_visible(assessment_id: int, db: Session) -> Assessment:
    assessment = db.get(Assessment, assessment_id)
    if not assessment or _is_hidden(assessment):
        raise HTTPException(status_code=404, detail="Assessment not found")
    return assessment


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/assessments", response_model=list[AssessmentResponse])
def list_assessments(
    certification_body: str | None = None,
    completed: bool | None = None,
    db: Session = Depends(get_db),
):
    query = _visible(db.query(Assessment))
    if certification_body:
        query = query.filter(Assessment.certification_body == certification_body)
    if completed is True:
        query = query.filter(Assessment.completed_at.isnot(None))
    elif completed is False:
        query = query.filter(Assessment.completed_at.is_(None))
    return query.order_by(Assessment.start_date.asc()).all()


@app.get("/api/assessments/{assessment_id}", response_model=AssessmentResponse)
def get_assessment(assessment_id: int, db: Session = Depends(get_db)):
    return _get_visible(assessment_id, db)


@app.post("/api/assessments", response_model=AssessmentResponse, status_code=201)
def create_assessment(payload: AssessmentCreate, db: Session = Depends(get_db)):
    assessment = Assessment(**payload.model_dump())
    db.add(assessment)
    try:
        db.commit()
    except Exception as exc:
        db.rollback()
        logger.exception("Failed to create assessment")
        raise HTTPException(status_code=500, detail="Internal server error") from exc
    db.refresh(assessment)
    return assessment


@app.put("/api/assessments/{assessment_id}", response_model=AssessmentResponse)
def update_assessment(
    assessment_id: int,
    payload: AssessmentUpdate,
    db: Session = Depends(get_db),
):
    assessment = _get_visible(assessment_id, db)

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(assessment, field, value)

    db.commit()
    db.refresh(assessment)
    return assessment


@app.delete("/api/assessments/{assessment_id}", status_code=204)
def delete_assessment(assessment_id: int, db: Session = Depends(get_db)):
    assessment = _get_visible(assessment_id, db)
    db.delete(assessment)
    db.commit()


@app.get("/api/certification-bodies")
def list_certification_bodies(db: Session = Depends(get_db)):
    rows = (
        _visible(db.query(Assessment.certification_body))
        .distinct()
        .order_by(Assessment.certification_body.asc())
        .all()
    )
    return [row[0] for row in rows]


def _resolve_static(full_path: str) -> Path | None:
    root = STATIC_DIR.resolve()
    relative = Path(full_path)
    if relative.is_absolute() or ".." in relative.parts:
        return None
    candidate = (root / relative).resolve()
    if not candidate.is_relative_to(root) or not candidate.is_file():
        return None
    return candidate


if STATIC_DIR.exists():
    assets_dir = STATIC_DIR / "assets"
    if assets_dir.is_dir():
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        if full_path.startswith("api"):
            raise HTTPException(status_code=404, detail="Not found")
        static_file = _resolve_static(full_path) if full_path else None
        if static_file is not None:
            return FileResponse(static_file)
        index = _resolve_static("index.html")
        if index is None:
            raise HTTPException(status_code=404, detail="Not found")
        return FileResponse(index)
