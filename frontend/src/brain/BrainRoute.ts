import {
  ActivityCompletion,
  ChatMessageRequest,
  CheckHealthData,
  ClearChatHistoryData,
  CompleteActivityData,
  CreateJournalEntryData,
  DeleteJournalEntryData,
  GetAchievementsData,
  GetActivitiesData,
  GetActivityData,
  GetChatHistoryData,
  GetJournalEntriesData,
  GetJournalEntryData,
  GetMoodHistoryData,
  GetMoodRecommendationsData,
  GetUserProgressData,
  JournalEntryCreate,
  LogMood2Data,
  LogMoodData,
  MoodEntry,
  MoodLogCreate,
  SendChatMessageData,
  ToggleFavoriteData,
  UpdateJournalEntryData,
} from "./data-contracts";

export namespace Brain {
  /**
   * @description Check health of application. Returns 200 when OK, 500 when not.
   * @name check_health
   * @summary Check Health
   * @request GET:/_healthz
   */
  export namespace check_health {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = CheckHealthData;
  }

  /**
   * No description
   * @tags dbtn/module:mood, dbtn/hasAuth
   * @name get_mood_history
   * @summary Get Mood History
   * @request GET:/routes/mood
   */
  export namespace get_mood_history {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetMoodHistoryData;
  }

  /**
   * No description
   * @tags dbtn/module:mood, dbtn/hasAuth
   * @name log_mood
   * @summary Log Mood
   * @request POST:/routes/mood
   */
  export namespace log_mood {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = MoodEntry;
    export type RequestHeaders = {};
    export type ResponseBody = LogMoodData;
  }

  /**
   * @description Send a message to the AI companion with streaming response
   * @tags stream, dbtn/module:chat, dbtn/hasAuth
   * @name send_chat_message
   * @summary Send Chat Message
   * @request POST:/routes/send-message
   */
  export namespace send_chat_message {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ChatMessageRequest;
    export type RequestHeaders = {};
    export type ResponseBody = SendChatMessageData;
  }

  /**
   * @description Get chat history for the authenticated user
   * @tags dbtn/module:chat, dbtn/hasAuth
   * @name get_chat_history
   * @summary Get Chat History
   * @request GET:/routes/history
   */
  export namespace get_chat_history {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetChatHistoryData;
  }

  /**
   * @description Clear all chat history for the authenticated user
   * @tags dbtn/module:chat, dbtn/hasAuth
   * @name clear_chat_history
   * @summary Clear Chat History
   * @request DELETE:/routes/history
   */
  export namespace clear_chat_history {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ClearChatHistoryData;
  }

  /**
   * @description Get user's achievements with progress and unlock status
   * @tags dbtn/module:achievements, dbtn/hasAuth
   * @name get_achievements
   * @summary Get Achievements
   * @request GET:/routes/achievements
   */
  export namespace get_achievements {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetAchievementsData;
  }

  /**
   * @description Get all self-care activities, optionally filtered by category
   * @tags dbtn/module:selfcare, dbtn/hasAuth
   * @name get_activities
   * @summary Get Activities
   * @request GET:/routes/activities
   */
  export namespace get_activities {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Category */
      category?: string | null;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetActivitiesData;
  }

  /**
   * @description Get a specific self-care activity with user progress
   * @tags dbtn/module:selfcare, dbtn/hasAuth
   * @name get_activity
   * @summary Get Activity
   * @request GET:/routes/activities/{activity_id}
   */
  export namespace get_activity {
    export type RequestParams = {
      /** Activity Id */
      activityId: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetActivityData;
  }

  /**
   * @description Mark an activity as completed and update user progress
   * @tags dbtn/module:selfcare, dbtn/hasAuth
   * @name complete_activity
   * @summary Complete Activity
   * @request POST:/routes/activities/{activity_id}/complete
   */
  export namespace complete_activity {
    export type RequestParams = {
      /** Activity Id */
      activityId: number;
    };
    export type RequestQuery = {};
    export type RequestBody = ActivityCompletion;
    export type RequestHeaders = {};
    export type ResponseBody = CompleteActivityData;
  }

  /**
   * @description Toggle favorite status for an activity
   * @tags dbtn/module:selfcare, dbtn/hasAuth
   * @name toggle_favorite
   * @summary Toggle Favorite
   * @request POST:/routes/activities/{activity_id}/favorite
   */
  export namespace toggle_favorite {
    export type RequestParams = {
      /** Activity Id */
      activityId: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ToggleFavoriteData;
  }

  /**
   * @description Get activity recommendations based on current mood
   * @tags dbtn/module:selfcare, dbtn/hasAuth
   * @name get_mood_recommendations
   * @summary Get Mood Recommendations
   * @request GET:/routes/recommendations
   */
  export namespace get_mood_recommendations {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Mood */
      mood?: string | null;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetMoodRecommendationsData;
  }

  /**
   * @description Get user's overall self-care progress and statistics
   * @tags dbtn/module:selfcare, dbtn/hasAuth
   * @name get_user_progress
   * @summary Get User Progress
   * @request GET:/routes/progress
   */
  export namespace get_user_progress {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetUserProgressData;
  }

  /**
   * No description
   * @tags dbtn/module:journal, dbtn/hasAuth
   * @name get_journal_entries
   * @summary Get Journal Entries
   * @request GET:/routes/journal
   */
  export namespace get_journal_entries {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetJournalEntriesData;
  }

  /**
   * No description
   * @tags dbtn/module:journal, dbtn/hasAuth
   * @name create_journal_entry
   * @summary Create Journal Entry
   * @request POST:/routes/journal
   */
  export namespace create_journal_entry {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = JournalEntryCreate;
    export type RequestHeaders = {};
    export type ResponseBody = CreateJournalEntryData;
  }

  /**
   * No description
   * @tags dbtn/module:journal, dbtn/hasAuth
   * @name get_journal_entry
   * @summary Get Journal Entry
   * @request GET:/routes/journal/{entry_id}
   */
  export namespace get_journal_entry {
    export type RequestParams = {
      /** Entry Id */
      entryId: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetJournalEntryData;
  }

  /**
   * No description
   * @tags dbtn/module:journal, dbtn/hasAuth
   * @name update_journal_entry
   * @summary Update Journal Entry
   * @request PUT:/routes/journal/{entry_id}
   */
  export namespace update_journal_entry {
    export type RequestParams = {
      /** Entry Id */
      entryId: number;
    };
    export type RequestQuery = {};
    export type RequestBody = JournalEntryCreate;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateJournalEntryData;
  }

  /**
   * No description
   * @tags dbtn/module:journal, dbtn/hasAuth
   * @name delete_journal_entry
   * @summary Delete Journal Entry
   * @request DELETE:/routes/journal/{entry_id}
   */
  export namespace delete_journal_entry {
    export type RequestParams = {
      /** Entry Id */
      entryId: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeleteJournalEntryData;
  }

  /**
   * No description
   * @tags dbtn/module:moods, dbtn/hasAuth
   * @name log_mood2
   * @summary Log Mood
   * @request POST:/routes/moods
   * @originalName log_mood
   * @duplicate
   */
  export namespace log_mood2 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = MoodLogCreate;
    export type RequestHeaders = {};
    export type ResponseBody = LogMood2Data;
  }
}
