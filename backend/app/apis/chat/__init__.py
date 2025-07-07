from pydantic import BaseModel
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from app.auth import AuthorizedUser
from openai import OpenAI
import asyncio
import asyncpg
import databutton as db
from typing import List, Optional
from datetime import datetime

router = APIRouter()

# Initialize OpenAI client
client = OpenAI(api_key=db.secrets.get("OPENAI_API_KEY"))

class ChatMessageRequest(BaseModel):
    message: str

class ChatMessage(BaseModel):
    id: int
    message_text: str
    message_type: str  # 'user' or 'assistant'
    created_at: datetime

class ChatHistoryResponse(BaseModel):
    messages: List[ChatMessage]

# Mental health support system prompt
MENTAL_HEALTH_PROMPT = """
You are a compassionate and professional mental health companion AI. Your role is to provide supportive, empathetic responses while maintaining appropriate boundaries.

Guidelines:
- Respond naturally and appropriately to the user's actual message
- For simple greetings like "hello", respond warmly but don't assume distress
- Be especially supportive when users mention having a bad day or feeling down
- Validate emotions without being overly clinical
- Encourage professional help when appropriate
- Keep responses concise but caring (2-3 sentences typically)
- Use natural, conversational language
- Never provide medical advice or diagnoses

Special scenarios:
- "I'm having a bad day" or "I had a bad day": Show extra empathy, ask what made it difficult, offer to listen
- Crisis indicators: Immediately provide resources and encourage professional help
- General emotional expressions: Validate feelings and gently explore
- Casual conversation: Respond naturally while staying supportive in tone

Remember: Match your response to the user's actual message and emotional state.
"""

CRISIS_RESOURCES = """
🚨 **CRISIS RESOURCES - NIGERIA**:
• Emergency Services: 112
• Lagos Emergency: 767 or 08000787746 (Toll Free)
• National Suicide Prevention: 234-806-210-6493
• Mental Health Helpline: 234-818-886-0824
• Please reach out to emergency services (112) if you're in immediate danger
"""

async def get_db_connection():
    """Get database connection"""
    database_url = db.secrets.get("DATABASE_URL_DEV")
    return await asyncpg.connect(database_url)

async def save_chat_message(user_id: str, message_text: str, message_type: str):
    """Save a chat message to the database"""
    conn = await get_db_connection()
    try:
        await conn.execute(
            """
            INSERT INTO chat_messages (user_id, message_text, message_type)
            VALUES ($1, $2, $3)
            """,
            user_id, message_text, message_type
        )
    finally:
        await conn.close()

async def get_recent_mood_context(user_id: str) -> str:
    """Get user's recent mood data for context"""
    conn = await get_db_connection()
    try:
        # Get the most recent mood entry
        recent_mood = await conn.fetchrow(
            """
            SELECT mood, notes, created_at
            FROM mood_entries 
            WHERE user_id = $1 
            ORDER BY created_at DESC 
            LIMIT 1
            """,
            user_id
        )
        
        if recent_mood:
            mood_context = f"\n[USER'S RECENT MOOD: {recent_mood['mood']}"
            if recent_mood['notes']:
                mood_context += f". Notes: {recent_mood['notes']}"
            mood_context += f". Logged {recent_mood['created_at'].strftime('%Y-%m-%d')}]\n"
            return mood_context
        return ""
    finally:
        await conn.close()

async def get_ai_response_streaming(user_message: str, user_id: str):
    """Get streaming AI response using OpenAI with professional mental health support"""
    try:
        # Get mood context
        mood_context = await get_recent_mood_context(user_id)
        
        # Prepare messages for OpenAI
        system_content = MENTAL_HEALTH_PROMPT
        if mood_context:
            system_content += f"\n\nUser's recent mood context: {mood_context}"
        
        messages = [
            {
                "role": "system",
                "content": system_content
            },
            {
                "role": "user",
                "content": user_message
            }
        ]
        
        # Get streaming response from OpenAI
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            max_tokens=200,
            temperature=0.7,
            top_p=0.9,
            stream=True
        )
        
        full_response = ""
        for chunk in response:
            if chunk.choices[0].delta.content:
                content = chunk.choices[0].delta.content
                full_response += content
                yield content
        
        # Check for crisis keywords after getting full response
        crisis_keywords = ['suicide', 'kill myself', 'end it all', 'self-harm', 'hurt myself', 'die']
        if any(keyword in user_message.lower() for keyword in crisis_keywords):
            crisis_message = f"\n\n{CRISIS_RESOURCES}"
            yield crisis_message
            full_response += crisis_message
        
        # Save the complete response to database
        await save_chat_message(user_id, full_response, "assistant")
        
    except Exception as e:
        print(f"Error getting AI response: {e}")
        error_response = "I'm here for you. Would you like to share what's on your mind? I'm listening."
        yield error_response
        await save_chat_message(user_id, error_response, "assistant")

def generate_supportive_response(user_message: str, mood_context: str) -> str:
    """Generate a supportive response when AI models fail"""
    message_lower = user_message.lower()
    
    # Emotional keywords and appropriate responses
    if any(word in message_lower for word in ['sad', 'depressed', 'down', 'low']):
        return "I can hear that you're going through a really tough time right now. It's completely okay to feel sad - these feelings are valid and you don't have to face them alone. Would you like to talk about what's been weighing on your heart?"
    
    elif any(word in message_lower for word in ['anxious', 'worried', 'nervous', 'panic']):
        return "I understand that anxiety can feel overwhelming. It takes courage to reach out when you're feeling this way. You're not alone in this - anxiety is something many people experience. Would you like to share what's been making you feel anxious?"
    
    elif any(word in message_lower for word in ['stressed', 'overwhelmed', 'pressure']):
        return "It sounds like you're carrying a lot right now. Feeling overwhelmed is a sign that you're dealing with more than anyone should have to handle alone. You're being so strong by reaching out. What's been the most challenging part for you lately?"
    
    elif any(word in message_lower for word in ['angry', 'frustrated', 'mad']):
        return "I can sense your frustration, and those feelings are completely understandable. Sometimes anger is our way of protecting ourselves when we're hurt or feeling unheard. I'm here to listen without judgment. What's been triggering these feelings for you?"
    
    elif any(word in message_lower for word in ['lonely', 'alone', 'isolated']):
        return "Loneliness can be one of the hardest feelings to experience. I want you to know that reaching out here shows incredible strength, and you're not as alone as you might feel. I'm here with you right now. Would you like to share what's been making you feel this way?"
    
    else:
        return "Thank you for sharing with me. I can tell this took courage, and I want you to know that whatever you're feeling right now is valid. I'm here to listen and support you through this. How are you feeling in this moment?"

def make_response_supportive(response: str, user_message: str) -> str:
    """Make any response more supportive and empathetic"""
    if not response:
        return generate_supportive_response(user_message, "")
    
    # Add empathetic opening if response seems too clinical
    empathetic_openings = [
        "I hear you, and ",
        "Thank you for sharing that with me. ",
        "I can understand why you might feel that way. ",
        "That sounds really difficult. "
    ]
    
    # If response doesn't start empathetically, add an opening
    if not any(response.lower().startswith(opener.lower().strip()) for opener in empathetic_openings):
        if len(response) > 10:
            response = empathetic_openings[1] + response.lower()[0] + response[1:]
    
    # Ensure response ends supportively
    supportive_endings = [
        "I'm here for you.",
        "You don't have to go through this alone.",
        "Would you like to talk more about this?",
        "Your feelings are valid and important."
    ]
    
    if not any(ending.lower() in response.lower() for ending in supportive_endings):
        response += " " + supportive_endings[0]
    
    return response

async def generate_streaming_response(user_message: str, user_id: str):
    """Generate streaming response for natural conversation flow"""
    try:
        # Save user message first
        await save_chat_message(user_id, user_message, "user")
        
        # Stream AI response directly from OpenAI
        async for chunk in get_ai_response_streaming(user_message, user_id):
            yield chunk
            # Small delay for natural typing effect
            await asyncio.sleep(0.05)
            
    except Exception as e:
        print(f"Error in streaming response: {e}")
        error_response = "I apologize, but I'm having trouble responding right now. I'm still here to support you though."
        yield error_response
        await save_chat_message(user_id, error_response, "assistant")

@router.post("/send-message", tags=["stream"])
async def send_chat_message(request: ChatMessageRequest, user: AuthorizedUser):
    """Send a message to the AI companion with streaming response"""
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    
    return StreamingResponse(
        generate_streaming_response(request.message, user.sub),
        media_type="text/plain"
    )

@router.get("/history")
async def get_chat_history(user: AuthorizedUser) -> ChatHistoryResponse:
    """Get chat history for the authenticated user"""
    conn = await get_db_connection()
    try:
        rows = await conn.fetch(
            """
            SELECT id, message_text, message_type, created_at
            FROM chat_messages 
            WHERE user_id = $1 
            ORDER BY created_at ASC
            LIMIT 100
            """,
            user.sub
        )
        
        messages = [
            ChatMessage(
                id=row['id'],
                message_text=row['message_text'],
                message_type=row['message_type'],
                created_at=row['created_at']
            )
            for row in rows
        ]
        
        return ChatHistoryResponse(messages=messages)
    finally:
        await conn.close()

@router.delete("/history")
async def clear_chat_history(user: AuthorizedUser):
    """Clear all chat history for the authenticated user"""
    conn = await get_db_connection()
    try:
        await conn.execute(
            "DELETE FROM chat_messages WHERE user_id = $1",
            user.sub
        )
        return {"message": "Chat history cleared successfully"}
    finally:
        await conn.close()















