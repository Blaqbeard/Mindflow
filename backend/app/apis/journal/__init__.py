from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import databutton as db
import asyncpg
from typing import List, Optional
from app.auth import AuthorizedUser
from datetime import datetime

router = APIRouter()

class JournalEntryCreate(BaseModel):
    content: str
    mood_emoji: Optional[str] = None
    created_at: Optional[datetime] = None

class JournalEntry(BaseModel):
    id: int
    content: str
    mood_emoji: Optional[str] = None
    created_at: datetime
    updated_at: datetime

async def get_db_conn():
    try:
        conn = await asyncpg.connect(db.secrets.get("DATABASE_URL_DEV"))
        yield conn
    finally:
        await conn.close()

@router.post("/journal", response_model=JournalEntry)
async def create_journal_entry(
    entry: JournalEntryCreate,
    user: AuthorizedUser,
    conn: asyncpg.Connection = Depends(get_db_conn),
):
    try:
        now = datetime.utcnow()
        created_at = entry.created_at or now
        result = await conn.fetchrow(
            """
            INSERT INTO journal_entries (user_id, content, mood_emoji, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, content, mood_emoji, created_at, updated_at
            """,
            user.sub,
            entry.content,
            entry.mood_emoji,
            created_at,
            now,
        )
        return JournalEntry(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/journal", response_model=List[JournalEntry])
async def get_journal_entries(
    user: AuthorizedUser,
    conn: asyncpg.Connection = Depends(get_db_conn)
):
    try:
        rows = await conn.fetch(
            "SELECT id, content, mood_emoji, created_at, updated_at FROM journal_entries WHERE user_id = $1 ORDER BY updated_at DESC",
            user.sub,
        )
        return [JournalEntry(**row) for row in rows]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/journal/{entry_id}", response_model=JournalEntry)
async def get_journal_entry(
    entry_id: int,
    user: AuthorizedUser,
    conn: asyncpg.Connection = Depends(get_db_conn)
):
    try:
        row = await conn.fetchrow(
            "SELECT id, content, mood_emoji, created_at, updated_at FROM journal_entries WHERE id = $1 AND user_id = $2",
            entry_id,
            user.sub
        )
        if not row:
            raise HTTPException(status_code=404, detail="Journal entry not found")
        return JournalEntry(**row)
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/journal/{entry_id}", response_model=JournalEntry)
async def update_journal_entry(
    entry_id: int,
    entry: JournalEntryCreate,
    user: AuthorizedUser,
    conn: asyncpg.Connection = Depends(get_db_conn),
):
    try:
        now = datetime.utcnow()
        result = await conn.fetchrow(
            """
            UPDATE journal_entries
            SET content = $1, mood_emoji = $2, updated_at = $3
            WHERE id = $4 AND user_id = $5
            RETURNING id, content, mood_emoji, created_at, updated_at
            """,
            entry.content,
            entry.mood_emoji,
            now,
            entry_id,
            user.sub,
        )
        if not result:
            raise HTTPException(status_code=404, detail="Journal entry not found")
        return JournalEntry(**result)
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/journal/{entry_id}", status_code=204)
async def delete_journal_entry(
    entry_id: int,
    user: AuthorizedUser,
    conn: asyncpg.Connection = Depends(get_db_conn),
):
    try:
        result = await conn.execute(
            "DELETE FROM journal_entries WHERE id = $1 AND user_id = $2",
            entry_id,
            user.sub
        )
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail="Journal entry not found")
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))






