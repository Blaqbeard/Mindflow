import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress as ProgressBar } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Calendar, 
  Award, 
  Star,
  ArrowLeft,
  Clock,
  Target,
  BarChart3,
  Activity as ActivityIcon,
  Trophy,
  Lock,
  CheckCircle,
  TrendingDown,
  Minus,
  BrainIcon,
  Heart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import brain from 'brain';
import { toast } from 'sonner';
import type { Achievement } from 'types';
import { formatDate } from 'utils/date';

// Helper function to get mood emoji
const getMoodEmoji = (moodValue: number | string): string => {
  const value = typeof moodValue === 'string' ? parseInt(moodValue, 10) : moodValue;
  if (isNaN(value)) return "😐";
  if (value <= 2) return "😔";
  if (value <= 4) return "😟";
  if (value <= 6) return "😐";
  if (value <= 8) return "🙂";
  return "😄";
};

// Helper function to get mood color
const getMoodColor = (moodValue: number | string): string => {
  const value = typeof moodValue === 'string' ? parseInt(moodValue, 10) : moodValue;
  if (isNaN(value)) return "text-slate-500 dark:text-slate-400";
  if (value <= 2) return "text-red-500";
  if (value <= 4) return "text-orange-500";
  if (value <= 6) return "text-yellow-500";
  if (value <= 8) return "text-green-500";
  return "text-teal-500";
};

// Helper function to get mood background color
const getMoodBgColor = (moodValue: number | string): string => {
  const value = typeof moodValue === 'string' ? parseInt(moodValue, 10) : moodValue;
  if (isNaN(value)) return "bg-slate-100 dark:bg-slate-800";
  if (value <= 2) return "bg-red-50 dark:bg-red-900/20";
  if (value <= 4) return "bg-orange-50 dark:bg-orange-900/20";
  if (value <= 6) return "bg-yellow-50 dark:bg-yellow-900/20";
  if (value <= 8) return "bg-green-50 dark:bg-green-900/20";
  return "bg-teal-50 dark:bg-teal-900/20";
};

interface ProgressStats {
  activities_tried: number;
  total_completions: number;
  completions_this_week: number;
  completions_today: number;
  favorite_activities: Array<{
    id: number;
    title: string;
    category: string;
    total_completions: number;
    last_completed_at: string;
  }>;
  all_activities_with_progress: Array<{
    id: number;
    title: string;
    category: string;
    total_completions: number;
    last_completed_at: string;
    is_favorite: boolean;
  }>;
  recent_completions: Array<{
    title: string;
    category: string;
    completed_at: string;
    rating?: number;
  }>;
}

interface AchievementsData {
  achievements: Achievement[];
  total_unlocked: number;
  completion_percentage: number;
}

interface MoodData {
  id: number;
  mood: string | number;
  notes?: string;
  created_at: string;
}

const Progress = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [achievements, setAchievements] = useState<AchievementsData | null>(null);
  const [moodHistory, setMoodHistory] = useState<MoodData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = async () => {
    try {
      setLoading(true);
      const [progressResponse, achievementsResponse, moodResponse] = await Promise.all([
        brain.get_user_progress(),
        brain.get_achievements(),
        brain.get_mood_history()
      ]);
      
      const progressData = await progressResponse.json();
      const achievementsData = await achievementsResponse.json();
      const moodData = await moodResponse.json();
      
      setStats(progressData);
      setAchievements(achievementsData);
      setMoodHistory(Array.isArray(moodData) ? moodData : []);
    } catch (error) {
      console.error('Failed to load progress data:', error);
      toast.error('Failed to load progress data');
    } finally {
      setLoading(false);
    }
  };

  const getStreakMessage = (completions: number) => {
    if (completions === 0) return "Let's start your wellness journey! 🌱";
    if (completions < 5) return "Great start! Keep it up! 💪";
    if (completions < 15) return "You're building momentum! 🚀";
    if (completions < 30) return "Fantastic progress! 🌟";
    return "Wellness champion! 🏆";
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'from-amber-400 to-amber-600';
      case 'silver': return 'from-gray-400 to-gray-600';
      case 'gold': return 'from-yellow-400 to-yellow-600';
      case 'master': return 'from-purple-400 to-purple-600';
      default: return 'from-gray-300 to-gray-500';
    }
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300';
      case 'silver': return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300';
      case 'gold': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'master': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
      default: return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300';
    }
  };

  const getMoodAnalytics = (history: MoodData[]) => {
    if (!history || history.length === 0) {
      return {
        averageMood: 0,
        bestDay: null,
        suggestions: [],
        streakDays: 0,
        weeklyAverage: 0,
        moodTrend: "stable",
      };
    }

    const moodByDate: { [key: string]: number[] } = {};
    let totalMood = 0;
    let moodCount = 0;

    history.forEach((entry) => {
      if (!entry || !entry.created_at) return;
      const date = new Date(entry.created_at);
      if (isNaN(date.getTime())) return;

      const dateString = date.toISOString().split('T')[0];
      const moodValue = typeof entry.mood === 'string' ? parseInt(entry.mood, 10) : Number(entry.mood);

      if (!isNaN(moodValue) && moodValue > 0) {
        if (!moodByDate[dateString]) {
          moodByDate[dateString] = [];
        }
        moodByDate[dateString].push(moodValue);
        totalMood += moodValue;
        moodCount++;
      }
    });

    let bestDay: string | null = null;
    let maxAvg = -1;

    Object.entries(moodByDate).forEach(([date, moods]) => {
      if (moods.length > 0) {
        const avg = moods.reduce((a, b) => a + b, 0) / moods.length;
        if (avg > maxAvg) {
          maxAvg = avg;
          bestDay = date;
        }
      }
    });

    const averageMood = moodCount > 0 ? totalMood / moodCount : 0;
    const suggestions: string[] = [];
    if (averageMood < 6 && averageMood > 0) {
      suggestions.push("Consider trying our guided meditation activities.");
      suggestions.push("Regular journaling can help process emotions.");
    }

    return {
      averageMood,
      bestDay,
      suggestions,
      streakDays: 0, // Placeholder
      weeklyAverage: 0, // Placeholder
      moodTrend: "stable", // Placeholder
    };
  };

  const moodAnalytics = useMemo(() => getMoodAnalytics(moodHistory), [moodHistory]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-32 bg-slate-200 dark:bg-slate-700 rounded-2xl"
                ></div>
              ))}
            </div>
            <div className="h-96 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Unable to Load Progress
          </h1>
          <Button
            onClick={() => navigate("/self-care")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Back to Self-Care
          </Button>
        </div>
      </div>
    );
  }

  // Removed levelInfo variable - no longer needed

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 sm:mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          >
            <ArrowLeft className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Home</span>
          </Button>
          <div className="flex-1" />
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 hidden sm:block">
            Your Wellness Journey
          </h1>
          <div className="flex-1" />
          <div className="text-3xl sm:text-4xl">📊</div>
        </div>

        {/* Welcome Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 dark:text-slate-100 mb-3 sm:mb-4 sm:hidden">
            Your Wellness Journey
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Track your progress and celebrate your commitment to mental health.
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <TabsTrigger
              value="overview"
              className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-all duration-200"
            >
              <BarChart3 className="h-5 w-5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger
              value="mood"
              className="flex items-center gap-2 data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all duration-200"
            >
              <Heart className="h-5 w-5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Mood</span>
            </TabsTrigger>
            <TabsTrigger
              value="achievements"
              className="flex items-center gap-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white transition-all duration-200"
            >
              <Trophy className="h-5 w-5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Achievements</span>
              {achievements && (
                <Badge variant="secondary" className="ml-1 hidden sm:block">
                  {achievements.total_unlocked}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 sm:space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              <Card className="bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-green-100 dark:bg-green-900/30">
                      <Target className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                        Activities Tried
                      </p>
                      <p className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">
                        {stats?.activities_tried || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                      <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                        Total Done
                      </p>
                      <p className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">
                        {stats?.total_completions || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                      <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                        This Week
                      </p>
                      <p className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">
                        {stats?.completions_this_week || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-900/30">
                      <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                        Today
                      </p>
                      <p className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">
                        {stats?.completions_today || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Individual Activity Progress */}
            <Card className="bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
                    <Target className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100">
                    Activity Progress
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {stats?.all_activities_with_progress &&
                  stats.all_activities_with_progress.length > 0 ? (
                    stats.all_activities_with_progress.map((activity) => {
                      // Calculate progress percentage based on completions (max 10 for visual purposes)
                      const maxCompletions = 10;
                      const progressPercentage = Math.min(
                        (activity.total_completions / maxCompletions) * 100,
                        100,
                      );

                      return (
                        <div key={activity.id} className="space-y-3">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                            <div className="flex-1 mb-2 sm:mb-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-slate-800 dark:text-slate-200">
                                  {activity.title}
                                </h4>
                                {activity.is_favorite && (
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                )}
                              </div>
                              <p className="text-sm text-slate-600 dark:text-slate-400 capitalize">
                                {activity.category}
                              </p>
                            </div>
                            <div className="text-right mt-2 sm:mt-0">
                              <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                                {activity.total_completions}/{maxCompletions}
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400">completions</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <ProgressBar
                              value={progressPercentage}
                              className="h-2"
                            />
                            <div className="flex flex-col sm:flex-row justify-between text-xs text-slate-600 dark:text-slate-400">
                              <span>
                                Progress: {Math.round(progressPercentage)}%
                              </span>
                              <span>
                                Last: {formatDate(activity.last_completed_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">🎯</div>
                      <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">
                        Start Your Journey
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 mb-4">
                        Complete some self-care activities to see your progress
                        here!
                      </p>
                      <Button
                        onClick={() => navigate("/selfcare")}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                      >
                        Explore Activities
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Calendar Widget and Activity Calendar */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Weekly Overview */}
              <Card className="bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                      <BarChart3 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100">
                      This Week's Goals
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800">
                      <div className="flex items-center gap-3 mb-2 sm:mb-0">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          Self-care activities
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {stats?.completions_this_week || 0}/7
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          target
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <ProgressBar
                        value={Math.min(
                          ((stats?.completions_this_week || 0) / 7) * 100,
                          100,
                        )}
                        className="h-2"
                      />
                      <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                        <span>Weekly Progress</span>
                        <span>
                          {Math.round(
                            Math.min(
                              ((stats?.completions_this_week || 0) / 7) * 100,
                              100,
                            ),
                          )}
                          %
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20">
                      <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium mb-1">
                        💡 Weekly Tip
                      </p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">
                        Consistency is key! Try to complete at least one self-care activity each day.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Existing favorite activities and recent activity sections... */}
            {/* Continue with existing grid layout for favorites and recent activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Favorite Activities */}
              {stats?.favorite_activities && stats.favorite_activities.length > 0 && (
                <Card className="bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-red-100 dark:bg-red-900/30">
                        <Star className="w-6 h-6 text-red-600 dark:text-red-400" />
                      </div>
                      <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100">
                        Favorite Activities
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stats.favorite_activities.map((activity, index) => (
                        <div
                          key={activity.id}
                          className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                          <div className="flex-1 mb-2 sm:mb-0">
                            <h4 className="font-medium text-slate-800 dark:text-slate-200">
                              {activity.title}
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {activity.category}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                              {activity.total_completions}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">completions</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent Activity */}
              {stats?.recent_completions && stats.recent_completions.length > 0 && (
                <Card className="bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
                        <ActivityIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100">
                        Recent Activity
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stats.recent_completions
                        .slice(0, 5)
                        .map((completion, index) => (
                          <div
                            key={index}
                            className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800"
                          >
                            <div className="flex-1 mb-2 sm:mb-0">
                              <h4 className="font-medium text-slate-800 dark:text-slate-200">
                                {completion.title}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="text-xs">
                                  {completion.category}
                                </Badge>
                                {completion.rating && (
                                  <div className="flex items-center gap-1">
                                    {[...Array(completion.rating)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className="w-3 h-3 fill-yellow-400 text-yellow-400"
                                      />
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                {formatDate(completion.completed_at)}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="mood" className="space-y-8">
            {/* Mood Insights Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              <Card className="bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                    {moodAnalytics.averageMood.toFixed(1)}/10
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    Overall Average
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                    {moodAnalytics.streakDays}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    Good Days Streak
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                    {moodAnalytics.weeklyAverage.toFixed(1)}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    This Week
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center gap-1 text-base sm:text-lg font-bold mb-1">
                    {moodAnalytics.moodTrend === "improving" && (
                      <>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="text-green-600 dark:text-green-400">
                          Improving
                        </span>
                      </>
                    )}
                    {moodAnalytics.moodTrend === "declining" && (
                      <>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                        <span className="text-red-600 dark:text-red-400">
                          Declining
                        </span>
                      </>
                    )}
                    {moodAnalytics.moodTrend === "stable" && (
                      <>
                        <Minus className="h-4 w-4 text-blue-500" />
                        <span className="text-blue-600 dark:text-blue-400">
                          Stable
                        </span>
                      </>
                    )}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    Trend
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Mood Insights Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Best Day & Patterns */}
              <Card className="bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-cyan-100 dark:bg-cyan-900/30">
                      <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <CardTitle className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100">
                      Your Best Day
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {moodAnalytics.bestDay ? (
                    <div className="text-center py-4 sm:py-6">
                      <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">📅</div>
                      <p className="text-base sm:text-lg font-medium text-cyan-600 dark:text-cyan-400 mb-1 sm:mb-2">
                        {formatDate(moodAnalytics.bestDay)}
                      </p>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xs mx-auto">
                        This was your best-feeling day so far!
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-4 sm:py-6">
                      <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">🤔</div>
                      <p className="text-base sm:text-lg font-medium text-slate-600 dark:text-slate-400 mb-1 sm:mb-2">
                        Not enough data yet
                      </p>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                        Log your mood for a few days to see your best day here.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Recommended Tips */}
              <Card className="bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                      <BrainIcon className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <CardTitle className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100">
                      Recommended Tips
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      "Try a 5-minute meditation today.",
                      "Go for a short walk to clear your head.",
                      "Jot down three things you're grateful for.",
                      "Reach out to a friend or loved one."
                    ].map(
                      (tip, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20"
                        >
                          <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></div>
                          <p className="text-sm text-emerald-700 dark:text-emerald-300">
                            {tip}
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Mood Entries */}
            {moodHistory.length > 0 ? (
              <Card className="bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
                      <Heart className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100">
                      Recent Mood Entries
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {moodHistory
                      .slice(0, 5)
                      .map((entry, index) => {
                        if (!entry || typeof entry.mood === 'undefined' || typeof entry.created_at === 'undefined') {
                          return null;
                        }
                        
                        const mood = parseInt(String(entry.mood), 10);
                        const moodColor = getMoodColor(mood);
                        const bgColor = getMoodBgColor(mood);

                        return (
                          <div
                            key={entry.id || index}
                            className={`p-4 rounded-xl ${bgColor} transition-colors`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-slate-500 dark:text-slate-400">
                                {formatDate(entry.created_at)}
                              </span>
                              <div className="flex items-center gap-2">
                                <Heart className="w-4 h-4 text-rose-500" />
                                <span className={`font-bold ${moodColor}`}>
                                  {isNaN(mood) ? 'N/A' : `${mood}/10`}
                                </span>
                              </div>
                            </div>
                            {entry.notes && (
                              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 italic">
                                "{entry.notes}"
                              </p>
                            )}
                          </div>
                        );
                      })}
                  </div>
                  <div className="mt-6 text-center">
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/')}
                      className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
                    >
                      Track Today's Mood
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Recent Mood Entries</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-500 dark:text-slate-400">
                    No mood entries found. Start logging your mood to see your
                    history here.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="achievements" className="space-y-8">
            {/* Achievements Overview */}
            <Card className="bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Trophy className="w-10 h-10 text-yellow-500" />
                    <div>
                      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                        Achievements Unlocked
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400">
                        You've unlocked{" "}
                        <span className="font-bold text-yellow-600 dark:text-yellow-400">
                          {achievements?.total_unlocked || 0}
                        </span>{" "}
                        out of{" "}
                        <span className="font-bold">
                          {achievements?.achievements.length || 0}
                        </span>{" "}
                        achievements.
                      </p>
                    </div>
                  </div>
                  <div className="w-full sm:w-auto text-center sm:text-right">
                    <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400 mb-1">
                      {Math.round(
                        achievements?.completion_percentage || 0,
                      )}
                      % Complete
                    </div>
                    <ProgressBar
                      value={achievements?.completion_percentage || 0}
                      className="h-2 w-full sm:w-48"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Achievements List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements?.achievements.map((achievement) => (
                <Card
                  key={achievement.id}
                  className={`bg-white/70 dark:bg-slate-900/70 border backdrop-blur-sm transition-all duration-300 ${
                    achievement.unlocked
                      ? "border-yellow-400/50 dark:border-yellow-600/50 shadow-lg"
                      : "border-slate-200/50 dark:border-slate-700/50"
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center">
                      <div
                        className={`relative w-24 h-24 mb-4 rounded-full flex items-center justify-center bg-gradient-to-br ${getTierColor(
                          achievement.tier,
                        )}`}
                      >
                        <Award
                          className={`w-12 h-12 text-white/80 ${
                            !achievement.unlocked && "opacity-30"
                          }`}
                        />
                        {achievement.unlocked && (
                          <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center border-4 border-white dark:border-slate-900">
                            <CheckCircle className="w-5 h-5 text-white" />
                          </div>
                        )}
                        {!achievement.unlocked && (
                          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                            <Lock className="w-8 h-8 text-white/50" />
                          </div>
                        )}
                      </div>

                      <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">
                        {achievement.name}
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 h-10">
                        {achievement.description}
                      </p>

                      <Badge
                        className={`mb-4 ${getTierBadgeColor(
                          achievement.tier,
                        )}`}
                      >
                        {achievement.tier} Tier
                      </Badge>

                      {achievement.unlocked ? (
                        <div className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>
                            Unlocked on{" "}
                            {new Date(
                              achievement.unlocked_at,
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      ) : (
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          Locked
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Empty State or Continue Journey */}
        {stats && (
          <>
            {stats.total_completions === 0 ? (
              <Card className="bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm mt-8">
                <CardContent className="text-center py-12">
                  <div className="text-6xl mb-4">🌱</div>
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
                    Start Your Wellness Journey
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    Complete your first self-care activity to begin tracking your progress!
                  </p>
                  <Button 
                    onClick={() => navigate('/self-care')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    Explore Activities
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center mt-12">
                <Button 
                  onClick={() => navigate('/self-care')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 text-lg"
                >
                  Continue Your Journey
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Progress;










