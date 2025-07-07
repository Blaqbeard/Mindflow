from pydantic import BaseModel
from fastapi import APIRouter, HTTPException
from app.auth import AuthorizedUser
import asyncpg
import databutton as db
import json
from typing import List, Optional, Dict, Any
from datetime import datetime

router = APIRouter()

# Database connection helper
async def get_db_connection():
    """Get database connection"""
    return await asyncpg.connect(db.secrets.get("DATABASE_URL_DEV"))

# Pydantic models
class SelfCareActivity(BaseModel):
    id: int
    title: str
    description: str
    category: str
    duration_minutes: int
    difficulty_level: str
    instructions: List[str]
    benefits: List[str]
    mood_tags: List[str]
    icon_name: Optional[str] = None
    user_progress: Optional[Dict[str, Any]] = None

class ActivityCompletion(BaseModel):
    activity_id: int
    rating: Optional[int] = None
    notes: Optional[str] = None

class UserProgress(BaseModel):
    activity_id: int
    total_completions: int
    last_completed_at: Optional[datetime] = None
    is_favorite: bool = False

class ActivitiesResponse(BaseModel):
    activities: List[SelfCareActivity]
    categories: List[str]

class RecommendationsResponse(BaseModel):
    activities: List[SelfCareActivity]
    reason: str

@router.get("/activities")
async def get_activities(user: AuthorizedUser, category: Optional[str] = None) -> ActivitiesResponse:
    """Get all self-care activities, optionally filtered by category"""
    conn = await get_db_connection()
    try:
        # Build query with optional category filter
        if category:
            activities_query = """
                SELECT * FROM selfcare_activities 
                WHERE category = $1 
                ORDER BY duration_minutes, title
            """
            activities = await conn.fetch(activities_query, category)
        else:
            activities_query = """
                SELECT * FROM selfcare_activities 
                ORDER BY category, duration_minutes, title
            """
            activities = await conn.fetch(activities_query)
        
        # Get user progress for all activities
        progress_query = """
            SELECT activity_id, total_completions, last_completed_at, is_favorite
            FROM user_activity_progress 
            WHERE user_id = $1
        """
        user_progress = await conn.fetch(progress_query, user.sub)
        progress_dict = {p['activity_id']: p for p in user_progress}
        
        # Convert to response format
        activity_list = []
        for activity in activities:
            progress = progress_dict.get(activity['id'])
            user_progress_data = None
            if progress:
                user_progress_data = {
                    "total_completions": progress['total_completions'],
                    "last_completed_at": progress['last_completed_at'],
                    "is_favorite": progress['is_favorite']
                }
            
            activity_list.append(SelfCareActivity(
                id=activity['id'],
                title=activity['title'],
                description=activity['description'],
                category=activity['category'],
                duration_minutes=activity['duration_minutes'],
                difficulty_level=activity['difficulty_level'],
                instructions=json.loads(activity['instructions']) if isinstance(activity['instructions'], str) else activity['instructions'],
                benefits=activity['benefits'],
                mood_tags=activity['mood_tags'],
                icon_name=activity['icon_name'],
                user_progress=user_progress_data
            ))
        
        # Get all categories
        categories_query = "SELECT DISTINCT category FROM selfcare_activities ORDER BY category"
        categories_result = await conn.fetch(categories_query)
        categories = [row['category'] for row in categories_result]
        
        return ActivitiesResponse(activities=activity_list, categories=categories)
        
    finally:
        await conn.close()

@router.get("/activities/{activity_id}")
async def get_activity(activity_id: int, user: AuthorizedUser) -> SelfCareActivity:
    """Get a specific self-care activity with user progress"""
    conn = await get_db_connection()
    try:
        # Get activity
        activity_query = "SELECT * FROM selfcare_activities WHERE id = $1"
        activity = await conn.fetchrow(activity_query, activity_id)
        
        if not activity:
            raise HTTPException(status_code=404, detail="Activity not found")
        
        # Get user progress
        progress_query = """
            SELECT total_completions, last_completed_at, is_favorite
            FROM user_activity_progress 
            WHERE user_id = $1 AND activity_id = $2
        """
        progress = await conn.fetchrow(progress_query, user.sub, activity_id)
        
        user_progress_data = None
        if progress:
            user_progress_data = {
                "total_completions": progress['total_completions'],
                "last_completed_at": progress['last_completed_at'],
                "is_favorite": progress['is_favorite']
            }
        
        return SelfCareActivity(
            id=activity['id'],
            title=activity['title'],
            description=activity['description'],
            category=activity['category'],
            duration_minutes=activity['duration_minutes'],
            difficulty_level=activity['difficulty_level'],
            instructions=json.loads(activity['instructions']) if isinstance(activity['instructions'], str) else activity['instructions'],
            benefits=activity['benefits'],
            mood_tags=activity['mood_tags'],
            icon_name=activity['icon_name'],
            user_progress=user_progress_data
        )
        
    finally:
        await conn.close()

@router.post("/activities/{activity_id}/complete")
async def complete_activity(activity_id: int, completion: ActivityCompletion, user: AuthorizedUser):
    """Mark an activity as completed and update user progress"""
    conn = await get_db_connection()
    try:
        # Verify activity exists
        activity_check = await conn.fetchrow("SELECT id FROM selfcare_activities WHERE id = $1", activity_id)
        if not activity_check:
            raise HTTPException(status_code=404, detail="Activity not found")
        
        # Record completion
        completion_query = """
            INSERT INTO user_activity_completions (user_id, activity_id, rating, notes)
            VALUES ($1, $2, $3, $4)
        """
        await conn.execute(completion_query, user.sub, activity_id, completion.rating, completion.notes)
        
        # Update or create progress record
        progress_query = """
            INSERT INTO user_activity_progress (user_id, activity_id, total_completions, last_completed_at)
            VALUES ($1, $2, 1, NOW())
            ON CONFLICT (user_id, activity_id) 
            DO UPDATE SET 
                total_completions = user_activity_progress.total_completions + 1,
                last_completed_at = NOW(),
                updated_at = NOW()
        """
        await conn.execute(progress_query, user.sub, activity_id)
        
        return {"message": "Activity completed successfully", "activity_id": activity_id}
        
    finally:
        await conn.close()

@router.post("/activities/{activity_id}/favorite")
async def toggle_favorite(activity_id: int, user: AuthorizedUser):
    """Toggle favorite status for an activity"""
    conn = await get_db_connection()
    try:
        # Check if progress record exists
        progress_check = await conn.fetchrow(
            "SELECT is_favorite FROM user_activity_progress WHERE user_id = $1 AND activity_id = $2",
            user.sub, activity_id
        )
        
        if progress_check:
            # Update existing record
            new_favorite_status = not progress_check['is_favorite']
            await conn.execute(
                "UPDATE user_activity_progress SET is_favorite = $3, updated_at = NOW() WHERE user_id = $1 AND activity_id = $2",
                user.sub, activity_id, new_favorite_status
            )
        else:
            # Create new progress record
            await conn.execute(
                "INSERT INTO user_activity_progress (user_id, activity_id, is_favorite) VALUES ($1, $2, TRUE)",
                user.sub, activity_id
            )
            new_favorite_status = True
        
        return {"is_favorite": new_favorite_status}
        
    finally:
        await conn.close()

@router.get("/recommendations")
async def get_mood_recommendations(user: AuthorizedUser, mood: Optional[str] = None) -> RecommendationsResponse:
    """Get activity recommendations based on current mood"""
    conn = await get_db_connection()
    try:
        # If no mood provided, try to get recent mood from mood tracking
        if not mood:
            mood_query = """
                SELECT mood FROM mood_entries 
                WHERE user_id = $1 
                ORDER BY created_at DESC 
                LIMIT 1
            """
            recent_mood = await conn.fetchrow(mood_query, user.sub)
            if recent_mood:
                mood = recent_mood['mood']
        
        if mood:
            # Get activities that match the mood
            activities_query = """
                SELECT * FROM selfcare_activities 
                WHERE $1 = ANY(mood_tags)
                ORDER BY duration_minutes, difficulty_level
                LIMIT 6
            """
            activities = await conn.fetch(activities_query, mood)
            reason = f"Based on your current mood: {mood}"
        else:
            # Fallback to beginner activities if no mood available
            activities_query = """
                SELECT * FROM selfcare_activities 
                WHERE difficulty_level = 'beginner'
                ORDER BY duration_minutes
                LIMIT 6
            """
            activities = await conn.fetch(activities_query)
            reason = "Recommended beginner-friendly activities"
        
        # Get user progress for recommended activities
        if activities:
            activity_ids = [a['id'] for a in activities]
            progress_query = """
                SELECT activity_id, total_completions, last_completed_at, is_favorite
                FROM user_activity_progress 
                WHERE user_id = $1 AND activity_id = ANY($2)
            """
            user_progress = await conn.fetch(progress_query, user.sub, activity_ids)
            progress_dict = {p['activity_id']: p for p in user_progress}
        else:
            progress_dict = {}
        
        # Convert to response format
        activity_list = []
        for activity in activities:
            progress = progress_dict.get(activity['id'])
            user_progress_data = None
            if progress:
                user_progress_data = {
                    "total_completions": progress['total_completions'],
                    "last_completed_at": progress['last_completed_at'],
                    "is_favorite": progress['is_favorite']
                }
            
            activity_list.append(SelfCareActivity(
                id=activity['id'],
                title=activity['title'],
                description=activity['description'],
                category=activity['category'],
                duration_minutes=activity['duration_minutes'],
                difficulty_level=activity['difficulty_level'],
                instructions=json.loads(activity['instructions']) if isinstance(activity['instructions'], str) else activity['instructions'],
                benefits=activity['benefits'],
                mood_tags=activity['mood_tags'],
                icon_name=activity['icon_name'],
                user_progress=user_progress_data
            ))
        
        return RecommendationsResponse(activities=activity_list, reason=reason)
        
    finally:
        await conn.close()

@router.get("/progress")
async def get_user_progress(user: AuthorizedUser):
    """Get user's overall self-care progress and statistics"""
    conn = await get_db_connection()
    try:
        # Get completion statistics
        stats_query = """
            SELECT 
                COUNT(DISTINCT activity_id) as activities_tried,
                COUNT(*) as total_completions,
                COUNT(CASE WHEN completed_at >= NOW() - INTERVAL '7 days' THEN 1 END) as completions_this_week,
                COUNT(CASE WHEN completed_at >= NOW() - INTERVAL '1 day' THEN 1 END) as completions_today
            FROM user_activity_completions 
            WHERE user_id = $1
        """
        stats = await conn.fetchrow(stats_query, user.sub)
        
        # Get favorite activities
        favorites_query = """
            SELECT sa.*, uap.total_completions, uap.last_completed_at
            FROM selfcare_activities sa
            JOIN user_activity_progress uap ON sa.id = uap.activity_id
            WHERE uap.user_id = $1 AND uap.is_favorite = TRUE
            ORDER BY uap.total_completions DESC
        """
        favorites = await conn.fetch(favorites_query, user.sub)
        
        # Get all activities with progress (not just favorites)
        all_progress_query = """
            SELECT sa.*, uap.total_completions, uap.last_completed_at, uap.is_favorite
            FROM selfcare_activities sa
            JOIN user_activity_progress uap ON sa.id = uap.activity_id
            WHERE uap.user_id = $1 AND uap.total_completions > 0
            ORDER BY uap.total_completions DESC, uap.last_completed_at DESC
        """
        all_activities_with_progress = await conn.fetch(all_progress_query, user.sub)
        
        # Get recent completions
        recent_query = """
            SELECT sa.title, sa.category, uac.completed_at, uac.rating
            FROM user_activity_completions uac
            JOIN selfcare_activities sa ON uac.activity_id = sa.id
            WHERE uac.user_id = $1
            ORDER BY uac.completed_at DESC
            LIMIT 10
        """
        recent_completions = await conn.fetch(recent_query, user.sub)
        
        return {
            "statistics": {
                "activities_tried": stats['activities_tried'] or 0,
                "total_completions": stats['total_completions'] or 0,
                "completions_this_week": stats['completions_this_week'] or 0,
                "completions_today": stats['completions_today'] or 0
            },
            "favorite_activities": [
                {
                    "id": fav['id'],
                    "title": fav['title'],
                    "category": fav['category'],
                    "total_completions": fav['total_completions'],
                    "last_completed_at": fav['last_completed_at']
                } for fav in favorites
            ],
            "all_activities_with_progress": [
                {
                    "id": act['id'],
                    "title": act['title'],
                    "category": act['category'],
                    "total_completions": act['total_completions'],
                    "last_completed_at": act['last_completed_at'],
                    "is_favorite": act['is_favorite']
                } for act in all_activities_with_progress
            ],
            "recent_completions": [
                {
                    "title": comp['title'],
                    "category": comp['category'],
                    "completed_at": comp['completed_at'],
                    "rating": comp['rating']
                } for comp in recent_completions
            ]
        }
        
    finally:
        await conn.close()



