from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import databutton as db
import asyncpg
from typing import Optional
from app.auth import AuthorizedUser
from datetime import datetime

router = APIRouter()

class MoodLogCreate(BaseModel):
    mood: str
    notes: Optional[str] = None
    created_at: Optional[datetime] = None

class MoodLog(BaseModel):
    id: int
    mood: str
    notes: Optional[str] = None
    created_at: datetime

async def get_db_conn():
    try:
        conn = await asyncpg.connect(db.secrets.get("DATABASE_URL_DEV"))
        yield conn
    finally:
        await conn.close()

@router.post("/moods", response_model=MoodLog)
async def log_mood(
    log: MoodLogCreate,
    user: AuthorizedUser,
    conn: asyncpg.Connection = Depends(get_db_conn)
):
    try:
        now = datetime.utcnow()
        created_at = log.created_at or now
        result = await conn.fetchrow(
            """
            INSERT INTO mood_logs (user_id, mood, notes, created_at)
            VALUES ($1, $2, $3, $4)
            RETURNING id, mood, notes, created_at
            """,
            user.sub,
            log.mood,
            log.notes,
            created_at,
        )
        return MoodLog(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
