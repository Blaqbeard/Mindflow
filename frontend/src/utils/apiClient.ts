// Independent API client to replace Databutton's brain client

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiClient {
  private baseURL: string;
  private authToken: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<{ json: () => Promise<T> }> {
    const url = `${this.baseURL}/api${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return {
      json: () => response.json()
    };
  }

  // Health check
  async check_health() {
    return this.request('/_healthz');
  }

  // Mood endpoints
  async get_mood_history() {
    return this.request('/mood/history');
  }

  async log_mood(body: { mood: string; notes?: string }) {
    return this.request('/mood/log', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  // Journal endpoints
  async get_journal_entries() {
    return this.request('/journal/entries');
  }

  async create_journal_entry(body: { content: string; mood_emoji?: string }) {
    return this.request('/journal/entries', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async get_journal_entry(params: { entryId: string }) {
    return this.request(`/journal/entries/${params.entryId}`);
  }

  async update_journal_entry(
    params: { entryId: string }, 
    body: { content: string; mood_emoji?: string }
  ) {
    return this.request(`/journal/entries/${params.entryId}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async delete_journal_entry(params: { entryId: string }) {
    return this.request(`/journal/entries/${params.entryId}`, {
      method: 'DELETE',
    });
  }

  // Chat endpoints
  async send_chat_message(body: { message: string }) {
    return this.request('/chat/message', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async get_chat_history() {
    return this.request('/chat/history');
  }

  async clear_chat_history() {
    return this.request('/chat/clear', {
      method: 'DELETE',
    });
  }

  // Self-care endpoints
  async get_activities() {
    return this.request('/selfcare/activities');
  }

  async get_activity(params: { activityId: string }) {
    return this.request(`/selfcare/activities/${params.activityId}`);
  }

  async complete_activity(body: { activity_id: string }) {
    return this.request('/selfcare/complete', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async toggle_favorite(body: { activity_id: string; is_favorite: boolean }) {
    return this.request('/selfcare/favorite', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  // Progress endpoints
  async get_mood_recommendations() {
    return this.request('/progress/recommendations');
  }

  async get_user_progress() {
    return this.request('/progress/stats');
  }

  async get_achievements() {
    return this.request('/progress/achievements');
  }
}

// Export singleton instance
const apiClient = new ApiClient();
export default apiClient;

// Export types for compatibility
export interface MoodLogRequest {
  mood: string;
  notes?: string;
}

export interface JournalEntryRequest {
  content: string;
  mood_emoji?: string;
}

export interface ChatMessageRequest {
  message: string;
}

export interface ActivityCompletionRequest {
  activity_id: string;
}

export interface ActivityFavoriteRequest {
  activity_id: string;
  is_favorite: boolean;
}
