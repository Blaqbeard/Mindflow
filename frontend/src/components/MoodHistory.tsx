import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import brain from 'brain';
import type { MoodLog } from 'types';

interface Props {
  refreshTrigger?: number;
}

export const MoodHistory: React.FC<Props> = ({ refreshTrigger }) => {
  const [moodEntries, setMoodEntries] = useState<MoodLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMoodHistory();
  }, [refreshTrigger]);

  const fetchMoodHistory = async () => {
    try {
      setIsLoading(true);
      const response = await brain.get_mood_history();
      const data = await response.json();
      // API returns array directly, not wrapped in entries property
      setMoodEntries(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching mood history:', error);
      setMoodEntries([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getMoodEmoji = (moodValue: string) => {
    // Handle both numeric (1-5) and text mood values
    const moodNum = parseInt(moodValue);
    if (!isNaN(moodNum)) {
      const emojiMap: { [key: number]: string } = {
        5: '😊',
        4: '🙂', 
        3: '😐',
        2: '😔',
        1: '😢'
      };
      return emojiMap[moodNum] || '😐';
    }
    
    // Handle text mood values
    const textMoodMap: { [key: string]: string } = {
      'happy': '😊',
      'good': '🙂',
      'okay': '😐',
      'neutral': '😐',
      'sad': '😔',
      'angry': '😠',
      'anxious': '😰',
      'excited': '🤩',
      'calm': '😌'
    };
    return textMoodMap[moodValue.toLowerCase()] || '😐';
  };

  const getMoodName = (moodValue: string) => {
    // Handle both numeric (1-5) and text mood values
    const moodNum = parseInt(moodValue);
    if (!isNaN(moodNum)) {
      const nameMap: { [key: number]: string } = {
        5: 'Great',
        4: 'Good',
        3: 'Okay', 
        2: 'Low',
        1: 'Sad'
      };
      return nameMap[moodNum] || 'Unknown';
    }
    
    // Capitalize text mood values
    return moodValue.charAt(0).toUpperCase() + moodValue.slice(1).toLowerCase();
  };

  const getMoodColor = (moodValue: string) => {
    // Handle both numeric (1-5) and text mood values
    const moodNum = parseInt(moodValue);
    if (!isNaN(moodNum)) {
      const colorMap: { [key: number]: string } = {
        5: 'from-green-400 to-emerald-500',
        4: 'from-blue-400 to-cyan-500',
        3: 'from-yellow-400 to-orange-500',
        2: 'from-orange-400 to-red-500',
        1: 'from-red-400 to-pink-500'
      };
      return colorMap[moodNum] || 'from-slate-400 to-slate-500';
    }
    
    // Handle text mood values with appropriate colors
    const textColorMap: { [key: string]: string } = {
      'happy': 'from-green-400 to-emerald-500',
      'good': 'from-blue-400 to-cyan-500',
      'okay': 'from-yellow-400 to-orange-500',
      'neutral': 'from-yellow-400 to-orange-500',
      'sad': 'from-red-400 to-pink-500',
      'angry': 'from-red-500 to-red-600',
      'anxious': 'from-orange-400 to-red-500',
      'excited': 'from-purple-400 to-pink-500',
      'calm': 'from-blue-400 to-green-500'
    };
    return textColorMap[moodValue.toLowerCase()] || 'from-slate-400 to-slate-500';
  };

  const getMoodNumericValue = (moodValue: string): number => {
    // Convert mood to numeric value for calculations
    const moodNum = parseInt(moodValue);
    if (!isNaN(moodNum)) {
      return moodNum;
    }
    
    // Convert text moods to numeric scale (1-5)
    const textMoodMap: { [key: string]: number } = {
      'happy': 5,
      'good': 4,
      'okay': 3,
      'neutral': 3,
      'sad': 2,
      'angry': 2,
      'anxious': 2,
      'excited': 5,
      'calm': 4
    };
    return textMoodMap[moodValue.toLowerCase()] || 3;
  };

  const getAverageMood = () => {
    if (moodEntries.length === 0) return "0.0";
    const validEntries = moodEntries.filter(entry => entry.mood && entry.mood.trim() !== '');
    if (validEntries.length === 0) return "0.0";
    const sum = validEntries.reduce((acc, entry) => acc + getMoodNumericValue(entry.mood), 0);
    return (sum / validEntries.length).toFixed(1);
  };

  const getRecentTrend = () => {
    if (moodEntries.length < 2) return 'stable';
    
    const validEntries = moodEntries.filter(entry => entry.mood && entry.mood.trim() !== '');
    if (validEntries.length < 2) return 'stable';
    
    const recent = validEntries.slice(0, 3);
    const older = validEntries.slice(3, 6);
    
    if (recent.length === 0 || older.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((acc, entry) => acc + getMoodNumericValue(entry.mood), 0) / recent.length;
    const olderAvg = older.reduce((acc, entry) => acc + getMoodNumericValue(entry.mood), 0) / older.length;
    
    if (recentAvg > olderAvg + 0.3) return 'improving';
    if (recentAvg < olderAvg - 0.3) return 'declining';
    return 'stable';
  };

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg">
        <CardContent className="p-6 sm:p-8">
          <div className="flex items-center justify-center h-32">
            <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const trend = getRecentTrend();
  const averageMood = getAverageMood();

  return (
    <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg overflow-hidden">
      <CardHeader className="p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30">
            <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">
            Your Mood Journey
          </CardTitle>
        </div>

        {moodEntries.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">{moodEntries.length}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Total Entries</div>
            </div>
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">{averageMood}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Average Mood</div>
            </div>
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <div className="flex items-center justify-center gap-2">
                {trend === 'improving' && <TrendingUp className="w-5 h-5 text-green-500" />}
                {trend === 'declining' && <TrendingDown className="w-5 h-5 text-red-500" />}
                {trend === 'stable' && <Minus className="w-5 h-5 text-slate-500" />}
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">{trend}</span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Recent Trend</div>
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-0">
        {moodEntries.length === 0 ? (
          <div className="text-center py-12 px-6">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-slate-600 dark:text-slate-400 text-lg mb-2">No mood entries yet</p>
            <p className="text-slate-500 dark:text-slate-500 text-sm">
              Start tracking your mood to see your journey over time
            </p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            <div className="space-y-1">
              {moodEntries.slice(0, 10).map((entry, index) => (
                <div 
                  key={entry.id} 
                  className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-100 dark:border-slate-700 last:border-b-0"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getMoodColor(entry.mood)} flex items-center justify-center shadow-md`}>
                      <span className="text-lg">{getMoodEmoji(entry.mood)}</span>
                    </div>
                    <div>
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {getMoodName(entry.mood)}
                      </div>
                      {entry.note && (
                        <div className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xs truncate">
                          {entry.note}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {formatDate(entry.created_at)}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {formatTime(entry.created_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {moodEntries.length > 10 && (
              <div className="p-4 text-center border-t border-slate-100 dark:border-slate-700">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Showing latest 10 entries • {moodEntries.length - 10} more entries
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};







