import os
from pathlib import Path

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import declarative_base, sessionmaker

DATA_DIR = Path(os.environ.get("DATA_DIR", "/data"))
DATA_DIR.mkdir(parents=True, exist_ok=True)

DATABASE_URL = f"sqlite:///{DATA_DIR / 'assessments.db'}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def migrate_db() -> None:
    inspector = inspect(engine)
    if "assessments" not in inspector.get_table_names():
        return

    columns = {col["name"] for col in inspector.get_columns("assessments")}

    with engine.begin() as conn:
        if "start_date" not in columns:
            conn.execute(text("ALTER TABLE assessments ADD COLUMN start_date DATE"))
            if "assessment_date" in columns:
                conn.execute(
                    text("UPDATE assessments SET start_date = assessment_date")
                )
            else:
                conn.execute(
                    text("UPDATE assessments SET start_date = date('now')")
                )

        if "end_date" not in columns:
            conn.execute(text("ALTER TABLE assessments ADD COLUMN end_date DATE"))
            conn.execute(text("UPDATE assessments SET end_date = start_date"))

        if "progress_status" not in columns:
            conn.execute(
                text(
                    "ALTER TABLE assessments ADD COLUMN progress_status "
                    "VARCHAR(50) DEFAULT 'not_started' NOT NULL"
                )
            )

        if "completed_at" not in columns:
            conn.execute(
                text("ALTER TABLE assessments ADD COLUMN completed_at DATETIME")
            )

        if "assessment_type" not in columns:
            conn.execute(
                text(
                    "ALTER TABLE assessments ADD COLUMN assessment_type "
                    "VARCHAR(50) DEFAULT 'willow' NOT NULL"
                )
            )


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()