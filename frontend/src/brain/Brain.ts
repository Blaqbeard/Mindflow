import {
  ActivityCompletion,
  ChatMessageRequest,
  CheckHealthData,
  ClearChatHistoryData,
  CompleteActivityData,
  CompleteActivityError,
  CompleteActivityParams,
  CreateJournalEntryData,
  CreateJournalEntryError,
  DeleteJournalEntryData,
  DeleteJournalEntryError,
  DeleteJournalEntryParams,
  GetAchievementsData,
  GetActivitiesData,
  GetActivitiesError,
  GetActivitiesParams,
  GetActivityData,
  GetActivityError,
  GetActivityParams,
  GetChatHistoryData,
  GetJournalEntriesData,
  GetJournalEntryData,
  GetJournalEntryError,
  GetJournalEntryParams,
  GetMoodHistoryData,
  GetMoodRecommendationsData,
  GetMoodRecommendationsError,
  GetMoodRecommendationsParams,
  GetUserProgressData,
  JournalEntryCreate,
  LogMood2Data,
  LogMood2Error,
  LogMoodData,
  LogMoodError,
  MoodEntry,
  MoodLogCreate,
  SendChatMessageData,
  SendChatMessageError,
  ToggleFavoriteData,
  ToggleFavoriteError,
  ToggleFavoriteParams,
  UpdateJournalEntryData,
  UpdateJournalEntryError,
  UpdateJournalEntryParams,
} from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Brain<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * @description Check health of application. Returns 200 when OK, 500 when not.
   *
   * @name check_health
   * @summary Check Health
   * @request GET:/_healthz
   */
  check_health = (params: RequestParams = {}) =>
    this.request<CheckHealthData, any>({
      path: `/_healthz`,
      method: "GET",
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:mood, dbtn/hasAuth
   * @name get_mood_history
   * @summary Get Mood History
   * @request GET:/routes/mood
   */
  get_mood_history = (params: RequestParams = {}) =>
    this.request<GetMoodHistoryData, any>({
      path: `/routes/mood`,
      method: "GET",
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:mood, dbtn/hasAuth
   * @name log_mood
   * @summary Log Mood
   * @request POST:/routes/mood
   */
  log_mood = (data: MoodEntry, params: RequestParams = {}) =>
    this.request<LogMoodData, LogMoodError>({
      path: `/routes/mood`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Send a message to the AI companion with streaming response
   *
   * @tags stream, dbtn/module:chat, dbtn/hasAuth
   * @name send_chat_message
   * @summary Send Chat Message
   * @request POST:/routes/send-message
   */
  send_chat_message = (data: ChatMessageRequest, params: RequestParams = {}) =>
    this.requestStream<SendChatMessageData, SendChatMessageError>({
      path: `/routes/send-message`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get chat history for the authenticated user
   *
   * @tags dbtn/module:chat, dbtn/hasAuth
   * @name get_chat_history
   * @summary Get Chat History
   * @request GET:/routes/history
   */
  get_chat_history = (params: RequestParams = {}) =>
    this.request<GetChatHistoryData, any>({
      path: `/routes/history`,
      method: "GET",
      ...params,
    });

  /**
   * @description Clear all chat history for the authenticated user
   *
   * @tags dbtn/module:chat, dbtn/hasAuth
   * @name clear_chat_history
   * @summary Clear Chat History
   * @request DELETE:/routes/history
   */
  clear_chat_history = (params: RequestParams = {}) =>
    this.request<ClearChatHistoryData, any>({
      path: `/routes/history`,
      method: "DELETE",
      ...params,
    });

  /**
   * @description Get user's achievements with progress and unlock status
   *
   * @tags dbtn/module:achievements, dbtn/hasAuth
   * @name get_achievements
   * @summary Get Achievements
   * @request GET:/routes/achievements
   */
  get_achievements = (params: RequestParams = {}) =>
    this.request<GetAchievementsData, any>({
      path: `/routes/achievements`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get all self-care activities, optionally filtered by category
   *
   * @tags dbtn/module:selfcare, dbtn/hasAuth
   * @name get_activities
   * @summary Get Activities
   * @request GET:/routes/activities
   */
  get_activities = (query: GetActivitiesParams, params: RequestParams = {}) =>
    this.request<GetActivitiesData, GetActivitiesError>({
      path: `/routes/activities`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Get a specific self-care activity with user progress
   *
   * @tags dbtn/module:selfcare, dbtn/hasAuth
   * @name get_activity
   * @summary Get Activity
   * @request GET:/routes/activities/{activity_id}
   */
  get_activity = ({ activityId, ...query }: GetActivityParams, params: RequestParams = {}) =>
    this.request<GetActivityData, GetActivityError>({
      path: `/routes/activities/${activityId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Mark an activity as completed and update user progress
   *
   * @tags dbtn/module:selfcare, dbtn/hasAuth
   * @name complete_activity
   * @summary Complete Activity
   * @request POST:/routes/activities/{activity_id}/complete
   */
  complete_activity = (
    { activityId, ...query }: CompleteActivityParams,
    data: ActivityCompletion,
    params: RequestParams = {},
  ) =>
    this.request<CompleteActivityData, CompleteActivityError>({
      path: `/routes/activities/${activityId}/complete`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Toggle favorite status for an activity
   *
   * @tags dbtn/module:selfcare, dbtn/hasAuth
   * @name toggle_favorite
   * @summary Toggle Favorite
   * @request POST:/routes/activities/{activity_id}/favorite
   */
  toggle_favorite = ({ activityId, ...query }: ToggleFavoriteParams, params: RequestParams = {}) =>
    this.request<ToggleFavoriteData, ToggleFavoriteError>({
      path: `/routes/activities/${activityId}/favorite`,
      method: "POST",
      ...params,
    });

  /**
   * @description Get activity recommendations based on current mood
   *
   * @tags dbtn/module:selfcare, dbtn/hasAuth
   * @name get_mood_recommendations
   * @summary Get Mood Recommendations
   * @request GET:/routes/recommendations
   */
  get_mood_recommendations = (query: GetMoodRecommendationsParams, params: RequestParams = {}) =>
    this.request<GetMoodRecommendationsData, GetMoodRecommendationsError>({
      path: `/routes/recommendations`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Get user's overall self-care progress and statistics
   *
   * @tags dbtn/module:selfcare, dbtn/hasAuth
   * @name get_user_progress
   * @summary Get User Progress
   * @request GET:/routes/progress
   */
  get_user_progress = (params: RequestParams = {}) =>
    this.request<GetUserProgressData, any>({
      path: `/routes/progress`,
      method: "GET",
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:journal, dbtn/hasAuth
   * @name get_journal_entries
   * @summary Get Journal Entries
   * @request GET:/routes/journal
   */
  get_journal_entries = (params: RequestParams = {}) =>
    this.request<GetJournalEntriesData, any>({
      path: `/routes/journal`,
      method: "GET",
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:journal, dbtn/hasAuth
   * @name create_journal_entry
   * @summary Create Journal Entry
   * @request POST:/routes/journal
   */
  create_journal_entry = (data: JournalEntryCreate, params: RequestParams = {}) =>
    this.request<CreateJournalEntryData, CreateJournalEntryError>({
      path: `/routes/journal`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:journal, dbtn/hasAuth
   * @name get_journal_entry
   * @summary Get Journal Entry
   * @request GET:/routes/journal/{entry_id}
   */
  get_journal_entry = ({ entryId, ...query }: GetJournalEntryParams, params: RequestParams = {}) =>
    this.request<GetJournalEntryData, GetJournalEntryError>({
      path: `/routes/journal/${entryId}`,
      method: "GET",
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:journal, dbtn/hasAuth
   * @name update_journal_entry
   * @summary Update Journal Entry
   * @request PUT:/routes/journal/{entry_id}
   */
  update_journal_entry = (
    { entryId, ...query }: UpdateJournalEntryParams,
    data: JournalEntryCreate,
    params: RequestParams = {},
  ) =>
    this.request<UpdateJournalEntryData, UpdateJournalEntryError>({
      path: `/routes/journal/${entryId}`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:journal, dbtn/hasAuth
   * @name delete_journal_entry
   * @summary Delete Journal Entry
   * @request DELETE:/routes/journal/{entry_id}
   */
  delete_journal_entry = ({ entryId, ...query }: DeleteJournalEntryParams, params: RequestParams = {}) =>
    this.request<DeleteJournalEntryData, DeleteJournalEntryError>({
      path: `/routes/journal/${entryId}`,
      method: "DELETE",
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:moods, dbtn/hasAuth
   * @name log_mood2
   * @summary Log Mood
   * @request POST:/routes/moods
   * @originalName log_mood
   * @duplicate
   */
  log_mood2 = (data: MoodLogCreate, params: RequestParams = {}) =>
    this.request<LogMood2Data, LogMood2Error>({
      path: `/routes/moods`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });
}
