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


def _table_columns(conn) -> set[str]:
    rows = conn.execute(text("PRAGMA table_info(assessments)"))
    return {row[1] for row in rows}


def _rebuild_assessments_table(conn, columns: set[str]) -> None:
    conn.execute(
        text(
            """
            CREATE TABLE assessments_new (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(255) NOT NULL,
                customer VARCHAR(255) NOT NULL,
                certification_body VARCHAR(255) NOT NULL,
                company_size VARCHAR(50) NOT NULL,
                assessment_type VARCHAR(50) NOT NULL DEFAULT 'willow',
                start_date DATE NOT NULL,
                end_date DATE NOT NULL,
                progress_status VARCHAR(50) NOT NULL DEFAULT 'not_started',
                completed_at DATETIME,
                sample_sampled BOOLEAN NOT NULL DEFAULT 0,
                sample_agents BOOLEAN NOT NULL DEFAULT 0,
                sample_invites BOOLEAN NOT NULL DEFAULT 0,
                vsa_date DATE,
                show_sample_release BOOLEAN NOT NULL DEFAULT 1,
                show_ce_windows BOOLEAN NOT NULL DEFAULT 1,
                show_remediation_window BOOLEAN NOT NULL DEFAULT 1,
                notes TEXT,
                created_at DATETIME,
                updated_at DATETIME
            )
            """
        )
    )

    start_expr = (
        "COALESCE(start_date, assessment_date, date('now'))"
        if "assessment_date" in columns
        else "COALESCE(start_date, date('now'))"
    )
    end_expr = (
        f"COALESCE(end_date, {start_expr})"
        if "end_date" in columns
        else start_expr
    )
    assessment_type_expr = (
        "COALESCE(assessment_type, 'willow')"
        if "assessment_type" in columns
        else "'willow'"
    )
    progress_expr = (
        "COALESCE(progress_status, 'not_started')"
        if "progress_status" in columns
        else "'not_started'"
    )
    completed_expr = (
        "completed_at" if "completed_at" in columns else "NULL"
    )
    sampled_expr = (
        "COALESCE(sample_sampled, 0)" if "sample_sampled" in columns else "0"
    )
    agents_expr = (
        "COALESCE(sample_agents, 0)" if "sample_agents" in columns else "0"
    )
    invites_expr = (
        "COALESCE(sample_invites, 0)" if "sample_invites" in columns else "0"
    )
    vsa_expr = "vsa_date" if "vsa_date" in columns else "NULL"
    sample_pill_expr = (
        "COALESCE(show_sample_release, 1)"
        if "show_sample_release" in columns
        else "1"
    )
    ce_pill_expr = (
        "COALESCE(show_ce_windows, 1)" if "show_ce_windows" in columns else "1"
    )
    remediation_pill_expr = (
        "COALESCE(show_remediation_window, 1)"
        if "show_remediation_window" in columns
        else "1"
    )

    conn.execute(
        text(
            f"""
            INSERT INTO assessments_new (
                id, name, customer, certification_body, company_size,
                assessment_type, start_date, end_date, progress_status,
                completed_at, sample_sampled, sample_agents, sample_invites,
                vsa_date, show_sample_release, show_ce_windows,
                show_remediation_window, notes, created_at, updated_at
            )
            SELECT
                id, name, customer, certification_body, company_size,
                {assessment_type_expr},
                {start_expr},
                {end_expr},
                {progress_expr},
                {completed_expr},
                {sampled_expr},
                {agents_expr},
                {invites_expr},
                {vsa_expr},
                {sample_pill_expr},
                {ce_pill_expr},
                {remediation_pill_expr},
                notes, created_at, updated_at
            FROM assessments
            """
        )
    )
    conn.execute(text("DROP TABLE assessments"))
    conn.execute(text("ALTER TABLE assessments_new RENAME TO assessments"))


def migrate_db() -> None:
    inspector = inspect(engine)
    if "assessments" not in inspector.get_table_names():
        return

    with engine.begin() as conn:
        columns = _table_columns(conn)

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
            columns = _table_columns(conn)

        if "end_date" not in columns:
            conn.execute(text("ALTER TABLE assessments ADD COLUMN end_date DATE"))
            conn.execute(text("UPDATE assessments SET end_date = start_date"))
            columns = _table_columns(conn)

        conn.execute(
            text(
                "UPDATE assessments SET start_date = COALESCE(start_date, date('now')) "
                "WHERE start_date IS NULL"
            )
        )
        conn.execute(
            text(
                "UPDATE assessments SET end_date = COALESCE(end_date, start_date) "
                "WHERE end_date IS NULL"
            )
        )

        if "progress_status" not in columns:
            conn.execute(
                text(
                    "ALTER TABLE assessments ADD COLUMN progress_status "
                    "VARCHAR(50) DEFAULT 'not_started' NOT NULL"
                )
            )
            columns = _table_columns(conn)

        if "completed_at" not in columns:
            conn.execute(
                text("ALTER TABLE assessments ADD COLUMN completed_at DATETIME")
            )
            columns = _table_columns(conn)

        if "assessment_type" not in columns:
            conn.execute(
                text(
                    "ALTER TABLE assessments ADD COLUMN assessment_type "
                    "VARCHAR(50) DEFAULT 'willow' NOT NULL"
                )
            )
            columns = _table_columns(conn)

        for column in ("sample_sampled", "sample_agents", "sample_invites"):
            if column not in columns:
                conn.execute(
                    text(
                        f"ALTER TABLE assessments ADD COLUMN {column} "
                        "BOOLEAN DEFAULT 0 NOT NULL"
                    )
                )
                columns = _table_columns(conn)

        if "vsa_date" not in columns:
            conn.execute(text("ALTER TABLE assessments ADD COLUMN vsa_date DATE"))
            columns = _table_columns(conn)

        for column in (
            "show_sample_release",
            "show_ce_windows",
            "show_remediation_window",
        ):
            if column not in columns:
                conn.execute(
                    text(
                        f"ALTER TABLE assessments ADD COLUMN {column} "
                        "BOOLEAN DEFAULT 1 NOT NULL"
                    )
                )
                columns = _table_columns(conn)

        if "assessment_date" in columns and "start_date" in columns:
            conn.execute(
                text(
                    "UPDATE assessments SET start_date = assessment_date "
                    "WHERE start_date IS NULL AND assessment_date IS NOT NULL"
                )
            )
            try:
                conn.execute(
                    text("ALTER TABLE assessments DROP COLUMN assessment_date")
                )
            except Exception:
                _rebuild_assessments_table(conn, columns)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()