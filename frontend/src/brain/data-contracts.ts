/** Achievement */
export interface Achievement {
  /** Id */
  id: string;
  /** Title */
  title: string;
  /** Description */
  description: string;
  /** Icon */
  icon: string;
  /** Category */
  category: string;
  /** Tier */
  tier: string;
  /** Requirement Type */
  requirement_type: string;
  /** Requirement Value */
  requirement_value: number;
  /** Is Unlocked */
  is_unlocked: boolean;
  /** Unlocked At */
  unlocked_at?: string | null;
  /**
   * Progress
   * @default 0
   */
  progress?: number;
  /**
   * Progress Total
   * @default 0
   */
  progress_total?: number;
}

/** AchievementsResponse */
export interface AchievementsResponse {
  /** Achievements */
  achievements: Achievement[];
  /** Total Unlocked */
  total_unlocked: number;
  /** Completion Percentage */
  completion_percentage: number;
}

/** ActivitiesResponse */
export interface ActivitiesResponse {
  /** Activities */
  activities: SelfCareActivity[];
  /** Categories */
  categories: string[];
}

/** ActivityCompletion */
export interface ActivityCompletion {
  /** Activity Id */
  activity_id: number;
  /** Rating */
  rating?: number | null;
  /** Notes */
  notes?: string | null;
}

/** ChatHistoryResponse */
export interface ChatHistoryResponse {
  /** Messages */
  messages: ChatMessage[];
}

/** ChatMessage */
export interface ChatMessage {
  /** Id */
  id: number;
  /** Message Text */
  message_text: string;
  /** Message Type */
  message_type: string;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
}

/** ChatMessageRequest */
export interface ChatMessageRequest {
  /** Message */
  message: string;
}

/** HTTPValidationError */
export interface HTTPValidationError {
  /** Detail */
  detail?: ValidationError[];
}

/** HealthResponse */
export interface HealthResponse {
  /** Status */
  status: string;
}

/** JournalEntry */
export interface JournalEntry {
  /** Id */
  id: number;
  /** Content */
  content: string;
  /** Mood Emoji */
  mood_emoji?: string | null;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /**
   * Updated At
   * @format date-time
   */
  updated_at: string;
}

/** JournalEntryCreate */
export interface JournalEntryCreate {
  /** Content */
  content: string;
  /** Mood Emoji */
  mood_emoji?: string | null;
  /** Created At */
  created_at?: string | null;
}

/** MoodEntry */
export interface MoodEntry {
  /** Mood */
  mood: string;
  /** Notes */
  notes?: string | null;
}

/** MoodLogCreate */
export interface MoodLogCreate {
  /** Mood */
  mood: string;
  /** Notes */
  notes?: string | null;
  /** Created At */
  created_at?: string | null;
}

/** RecommendationsResponse */
export interface RecommendationsResponse {
  /** Activities */
  activities: SelfCareActivity[];
  /** Reason */
  reason: string;
}

/** SelfCareActivity */
export interface SelfCareActivity {
  /** Id */
  id: number;
  /** Title */
  title: string;
  /** Description */
  description: string;
  /** Category */
  category: string;
  /** Duration Minutes */
  duration_minutes: number;
  /** Difficulty Level */
  difficulty_level: string;
  /** Instructions */
  instructions: string[];
  /** Benefits */
  benefits: string[];
  /** Mood Tags */
  mood_tags: string[];
  /** Icon Name */
  icon_name?: string | null;
  /** User Progress */
  user_progress?: Record<string, any> | null;
}

/** ValidationError */
export interface ValidationError {
  /** Location */
  loc: (string | number)[];
  /** Message */
  msg: string;
  /** Error Type */
  type: string;
}

/** MoodLog */
export interface AppApisMoodMoodLog {
  /** Id */
  id: number;
  /** Mood */
  mood: string;
  /** Notes */
  notes?: string | null;
  /** Created At */
  created_at: string;
}

/** MoodLog */
export interface AppApisMoodsMoodLog {
  /** Id */
  id: number;
  /** Mood */
  mood: string;
  /** Notes */
  notes?: string | null;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
}

/** MoodLog */
export interface MoodLog {
  /** Id */
  id: number;
  /** Mood */
  mood: string;
  /** Notes */
  notes?: string | null;
  /** Created At */
  created_at: string;
}

export type CheckHealthData = HealthResponse;

/** Response Get Mood History */
export type GetMoodHistoryData = AppApisMoodMoodLog[];

export type LogMoodData = AppApisMoodMoodLog;

export type LogMoodError = HTTPValidationError;

export type SendChatMessageData = any;

export type SendChatMessageError = HTTPValidationError;

export type GetChatHistoryData = ChatHistoryResponse;

export type ClearChatHistoryData = any;

export type GetAchievementsData = AchievementsResponse;

export interface GetActivitiesParams {
  /** Category */
  category?: string | null;
}

export type GetActivitiesData = ActivitiesResponse;

export type GetActivitiesError = HTTPValidationError;

export interface GetActivityParams {
  /** Activity Id */
  activityId: number;
}

export type GetActivityData = SelfCareActivity;

export type GetActivityError = HTTPValidationError;

export interface CompleteActivityParams {
  /** Activity Id */
  activityId: number;
}

export type CompleteActivityData = any;

export type CompleteActivityError = HTTPValidationError;

export interface ToggleFavoriteParams {
  /** Activity Id */
  activityId: number;
}

export type ToggleFavoriteData = any;

export type ToggleFavoriteError = HTTPValidationError;

export interface GetMoodRecommendationsParams {
  /** Mood */
  mood?: string | null;
}

export type GetMoodRecommendationsData = RecommendationsResponse;

export type GetMoodRecommendationsError = HTTPValidationError;

export type GetUserProgressData = any;

/** Response Get Journal Entries */
export type GetJournalEntriesData = JournalEntry[];

export type CreateJournalEntryData = JournalEntry;

export type CreateJournalEntryError = HTTPValidationError;

export interface GetJournalEntryParams {
  /** Entry Id */
  entryId: number;
}

export type GetJournalEntryData = JournalEntry;

export type GetJournalEntryError = HTTPValidationError;

export interface UpdateJournalEntryParams {
  /** Entry Id */
  entryId: number;
}

export type UpdateJournalEntryData = JournalEntry;

export type UpdateJournalEntryError = HTTPValidationError;

export interface DeleteJournalEntryParams {
  /** Entry Id */
  entryId: number;
}

export type DeleteJournalEntryData = any;

export type DeleteJournalEntryError = HTTPValidationError;

export type LogMood2Data = AppApisMoodsMoodLog;

export type LogMood2Error = HTTPValidationError;
