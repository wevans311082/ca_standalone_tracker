from pathlib import Path

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from database import Base, engine, get_db
from models import Assessment
from schemas import AssessmentCreate, AssessmentResponse, AssessmentUpdate

Base.metadata.create_all(bind=engine)

app = FastAPI(title="CE+ Assessment Tracker")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

STATIC_DIR = Path(__file__).parent / "static"


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/assessments", response_model=list[AssessmentResponse])
def list_assessments(
    certification_body: str | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(Assessment)
    if certification_body:
        query = query.filter(Assessment.certification_body == certification_body)
    return query.order_by(Assessment.assessment_date.asc()).all()


@app.get("/api/assessments/{assessment_id}", response_model=AssessmentResponse)
def get_assessment(assessment_id: int, db: Session = Depends(get_db)):
    assessment = db.get(Assessment, assessment_id)
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return assessment


@app.post("/api/assessments", response_model=AssessmentResponse, status_code=201)
def create_assessment(payload: AssessmentCreate, db: Session = Depends(get_db)):
    assessment = Assessment(**payload.model_dump())
    db.add(assessment)
    db.commit()
    db.refresh(assessment)
    return assessment


@app.put("/api/assessments/{assessment_id}", response_model=AssessmentResponse)
def update_assessment(
    assessment_id: int,
    payload: AssessmentUpdate,
    db: Session = Depends(get_db),
):
    assessment = db.get(Assessment, assessment_id)
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(assessment, field, value)

    db.commit()
    db.refresh(assessment)
    return assessment


@app.delete("/api/assessments/{assessment_id}", status_code=204)
def delete_assessment(assessment_id: int, db: Session = Depends(get_db)):
    assessment = db.get(Assessment, assessment_id)
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    db.delete(assessment)
    db.commit()


@app.get("/api/certification-bodies")
def list_certification_bodies(db: Session = Depends(get_db)):
    rows = (
        db.query(Assessment.certification_body)
        .distinct()
        .order_by(Assessment.certification_body.asc())
        .all()
    )
    return [row[0] for row in rows]


if STATIC_DIR.exists():
    app.mount("/assets", StaticFiles(directory=STATIC_DIR / "assets"), name="assets")

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        if full_path.startswith("api"):
            raise HTTPException(status_code=404, detail="Not found")
        file_path = STATIC_DIR / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(STATIC_DIR / "index.html")