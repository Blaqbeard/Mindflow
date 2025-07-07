from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import databutton as db
import asyncpg
from typing import List, Optional
from app.auth import AuthorizedUser
import os

router = APIRouter()

class MoodEntry(BaseModel):
    mood: str
    notes: Optional[str] = None

class MoodLog(BaseModel):
    id: int
    mood: str
    notes: Optional[str] = None
    created_at: str

async def get_db_conn():
    try:
        conn = await asyncpg.connect(db.secrets.get("DATABASE_URL_DEV"))
        yield conn
    finally:
        await conn.close()

@router.post("/mood", response_model=MoodLog)
async def log_mood(
    mood_entry: MoodEntry,
    user: AuthorizedUser,
    conn: asyncpg.Connection = Depends(get_db_conn),
):
    try:
        result = await conn.fetchrow(
            "INSERT INTO mood_entries (user_id, mood, notes) VALUES ($1, $2, $3) RETURNING id, mood, notes, created_at",
            user.sub,
            mood_entry.mood,
            mood_entry.notes,
        )
        return MoodLog(
            id=result["id"],
            mood=result["mood"],
            notes=result["notes"],
            created_at=result["created_at"].isoformat(),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/mood", response_model=List[MoodLog])
async def get_mood_history(
    user: AuthorizedUser, conn: asyncpg.Connection = Depends(get_db_conn)
):
    try:
        rows = await conn.fetch(
            "SELECT id, mood, notes, created_at FROM mood_entries WHERE user_id = $1 ORDER BY created_at DESC",
            user.sub,
        )
        return [
            MoodLog(
                id=row["id"],
                mood=row["mood"],
                notes=row["notes"],
                created_at=row["created_at"].isoformat(),
            )
            for row in rows
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

