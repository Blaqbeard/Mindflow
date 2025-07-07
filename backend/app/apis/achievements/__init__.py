from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from app.auth import AuthorizedUser
import databutton as db
import asyncpg
from datetime import datetime, timedelta

router = APIRouter()

class Achievement(BaseModel):
    id: str
    title: str
    description: str
    icon: str
    category: str
    tier: str  # bronze, silver, gold, master
    requirement_type: str  # completions, streak, favorites, journal_entries
    requirement_value: int
    is_unlocked: bool
    unlocked_at: Optional[datetime] = None
    progress: int = 0
    progress_total: int = 0

class AchievementsResponse(BaseModel):
    achievements: List[Achievement]
    total_unlocked: int
    completion_percentage: float

# Define all available achievements
ACHIEVEMENT_DEFINITIONS = [
    # Activity Completion Achievements
    {
        "id": "first_steps",
        "title": "First Steps",
        "description": "Complete your first self-care activity",
        "icon": "🌱",
        "category": "Activity",
        "tier": "bronze",
        "requirement_type": "completions",
        "requirement_value": 1
    },
    {
        "id": "getting_started",
        "title": "Getting Started",
        "description": "Complete 5 self-care activities",
        "icon": "🌿",
        "category": "Activity",
        "tier": "bronze",
        "requirement_type": "completions",
        "requirement_value": 5
    },
    {
        "id": "self_care_explorer",
        "title": "Self-Care Explorer",
        "description": "Complete 15 self-care activities",
        "icon": "🧭",
        "category": "Activity",
        "tier": "silver",
        "requirement_type": "completions",
        "requirement_value": 15
    },
    {
        "id": "wellness_warrior",
        "title": "Wellness Warrior",
        "description": "Complete 30 self-care activities",
        "icon": "⚔️",
        "category": "Activity",
        "tier": "gold",
        "requirement_type": "completions",
        "requirement_value": 30
    },
    {
        "id": "mindfulness_master",
        "title": "Mindfulness Master",
        "description": "Complete 50 self-care activities",
        "icon": "🏆",
        "category": "Activity",
        "tier": "master",
        "requirement_type": "completions",
        "requirement_value": 50
    },
    
    # Activity Variety Achievements
    {
        "id": "curious_mind",
        "title": "Curious Mind",
        "description": "Try 3 different self-care activities",
        "icon": "🤔",
        "category": "Variety",
        "tier": "bronze",
        "requirement_type": "activities_tried",
        "requirement_value": 3
    },
    {
        "id": "variety_seeker",
        "title": "Variety Seeker",
        "description": "Try 7 different self-care activities",
        "icon": "🎯",
        "category": "Variety",
        "tier": "silver",
        "requirement_type": "activities_tried",
        "requirement_value": 7
    },
    {
        "id": "well_rounded",
        "title": "Well-Rounded",
        "description": "Try 12 different self-care activities",
        "icon": "🌟",
        "category": "Variety",
        "tier": "gold",
        "requirement_type": "activities_tried",
        "requirement_value": 12
    },
    
    # Streak Achievements
    {
        "id": "consistent_carer",
        "title": "Consistent Carer",
        "description": "Complete activities 3 days this week",
        "icon": "📅",
        "category": "Consistency",
        "tier": "bronze",
        "requirement_type": "weekly_streak",
        "requirement_value": 3
    },
    {
        "id": "weekly_champion",
        "title": "Weekly Champion",
        "description": "Complete activities 5 days this week",
        "icon": "🗓️",
        "category": "Consistency",
        "tier": "silver",
        "requirement_type": "weekly_streak",
        "requirement_value": 5
    },
    {
        "id": "dedication_master",
        "title": "Dedication Master",
        "description": "Complete activities 7 days this week",
        "icon": "🎖️",
        "category": "Consistency",
        "tier": "gold",
        "requirement_type": "weekly_streak",
        "requirement_value": 7
    },
    
    # Journal Achievements
    {
        "id": "thought_recorder",
        "title": "Thought Recorder",
        "description": "Write your first journal entry",
        "icon": "📝",
        "category": "Journal",
        "tier": "bronze",
        "requirement_type": "journal_entries",
        "requirement_value": 1
    },
    {
        "id": "reflective_writer",
        "title": "Reflective Writer",
        "description": "Write 5 journal entries",
        "icon": "📖",
        "category": "Journal",
        "tier": "silver",
        "requirement_type": "journal_entries",
        "requirement_value": 5
    },
    {
        "id": "journaling_guru",
        "title": "Journaling Guru",
        "description": "Write 15 journal entries",
        "icon": "📚",
        "category": "Journal",
        "tier": "gold",
        "requirement_type": "journal_entries",
        "requirement_value": 15
    },
    
    # Favorite Achievements
    {
        "id": "favorite_finder",
        "title": "Favorite Finder",
        "description": "Mark 3 activities as favorites",
        "icon": "❤️",
        "category": "Engagement",
        "tier": "bronze",
        "requirement_type": "favorites",
        "requirement_value": 3
    },
    {
        "id": "preference_pro",
        "title": "Preference Pro",
        "description": "Mark 7 activities as favorites",
        "icon": "💖",
        "category": "Engagement",
        "tier": "silver",
        "requirement_type": "favorites",
        "requirement_value": 7
    }
]

async def get_user_stats(user_id: str):
    """Get comprehensive user statistics for achievement calculation"""
    conn = await asyncpg.connect(db.secrets.get("DATABASE_URL_DEV"))
    try:
        # Get activity completions from user_activity_completions
        completions_count = await conn.fetchval(
            "SELECT COUNT(*) FROM user_activity_completions WHERE user_id = $1",
            user_id
        )
        
        # Get activities tried (unique activities) from user_activity_completions
        activities_tried = await conn.fetchval(
            "SELECT COUNT(DISTINCT activity_id) FROM user_activity_completions WHERE user_id = $1",
            user_id
        )
        
        # Get weekly activity days (this week) from user_activity_completions
        week_start = datetime.now() - timedelta(days=datetime.now().weekday())
        weekly_days = await conn.fetchval(
            """SELECT COUNT(DISTINCT DATE(completed_at)) 
               FROM user_activity_completions 
               WHERE user_id = $1 AND completed_at >= $2""",
            user_id, week_start
        )
        
        # Get journal entries count
        journal_entries = await conn.fetchval(
            "SELECT COUNT(*) FROM journal_entries WHERE user_id = $1",
            user_id
        )
        
        # Get favorites count - check if we have a favorites table or if it's stored in user_activity_progress
        favorites_count = await conn.fetchval(
            """SELECT COUNT(*) FROM user_activity_progress 
               WHERE user_id = $1 AND is_favorite = true""",
            user_id
        )
        
        return {
            "completions": completions_count or 0,
            "activities_tried": activities_tried or 0,
            "weekly_streak": weekly_days or 0,
            "journal_entries": journal_entries or 0,
            "favorites": favorites_count or 0
        }
    finally:
        await conn.close()

async def get_user_achievements(user_id: str):
    """Get user's unlocked achievements from database"""
    conn = await asyncpg.connect(db.secrets.get("DATABASE_URL_DEV"))
    try:
        rows = await conn.fetch(
            "SELECT achievement_id, unlocked_at FROM user_achievements WHERE user_id = $1",
            user_id
        )
        return {row['achievement_id']: row['unlocked_at'] for row in rows}
    finally:
        await conn.close()

async def unlock_achievement(user_id: str, achievement_id: str):
    """Unlock an achievement for a user"""
    conn = await asyncpg.connect(db.secrets.get("DATABASE_URL_DEV"))
    try:
        await conn.execute(
            """INSERT INTO user_achievements (user_id, achievement_id, unlocked_at) 
               VALUES ($1, $2, $3) ON CONFLICT DO NOTHING""",
            user_id, achievement_id, datetime.now()
        )
    finally:
        await conn.close()

@router.get("/achievements")
async def get_achievements(user: AuthorizedUser) -> AchievementsResponse:
    """Get user's achievements with progress and unlock status"""
    
    # Get user statistics
    stats = await get_user_stats(user.sub)
    
    # Get user's unlocked achievements
    unlocked_achievements = await get_user_achievements(user.sub)
    
    achievements = []
    newly_unlocked = []
    
    for achievement_def in ACHIEVEMENT_DEFINITIONS:
        achievement_id = achievement_def["id"]
        requirement_type = achievement_def["requirement_type"]
        requirement_value = achievement_def["requirement_value"]
        
        # Calculate progress
        current_progress = stats.get(requirement_type, 0)
        is_unlocked = achievement_id in unlocked_achievements
        
        # Check if achievement should be unlocked
        if not is_unlocked and current_progress >= requirement_value:
            await unlock_achievement(user.sub, achievement_id)
            is_unlocked = True
            newly_unlocked.append(achievement_def["title"])
        
        achievement = Achievement(
            id=achievement_id,
            title=achievement_def["title"],
            description=achievement_def["description"],
            icon=achievement_def["icon"],
            category=achievement_def["category"],
            tier=achievement_def["tier"],
            requirement_type=requirement_type,
            requirement_value=requirement_value,
            is_unlocked=is_unlocked,
            unlocked_at=unlocked_achievements.get(achievement_id),
            progress=min(current_progress, requirement_value),
            progress_total=requirement_value
        )
        achievements.append(achievement)
    
    # Sort achievements: unlocked first, then by tier and requirement value
    tier_order = {"bronze": 1, "silver": 2, "gold": 3, "master": 4}
    achievements.sort(key=lambda a: (
        not a.is_unlocked,  # Unlocked first
        tier_order.get(a.tier, 0),
        a.requirement_value
    ))
    
    total_unlocked = len([a for a in achievements if a.is_unlocked])
    completion_percentage = (total_unlocked / len(achievements)) * 100 if achievements else 0
    
    return AchievementsResponse(
        achievements=achievements,
        total_unlocked=total_unlocked,
        completion_percentage=completion_percentage
    )

