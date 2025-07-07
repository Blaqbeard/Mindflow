import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Heart, Check, MessageCircle } from 'lucide-react';
import brain from 'brain';
import type { MoodEntry } from 'types';

interface Props {
  onMoodLogged?: (moodValue: number) => void;
}

interface Mood {
  emoji: string;
  name: string;
  value: number;
  color: string;
}

const moods: Mood[] = [
  { emoji: '😊', name: 'Great', value: 5, color: 'from-green-400 to-emerald-500' },
  { emoji: '🙂', name: 'Good', value: 4, color: 'from-blue-400 to-cyan-500' },
  { emoji: '😐', name: 'Okay', value: 3, color: 'from-yellow-400 to-orange-500' },
  { emoji: '😔', name: 'Low', value: 2, color: 'from-orange-400 to-red-500' },
  { emoji: '😢', name: 'Sad', value: 1, color: 'from-red-400 to-pink-500' },
];

export const MoodSelector: React.FC<Props> = ({ onMoodLogged }) => {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [notes, setNotes] = useState('');
  const [isLogging, setIsLogging] = useState(false);
  const [justLogged, setJustLogged] = useState(false);

  const handleMoodSelect = (mood: Mood) => {
    if (isLogging || justLogged) return;
    setSelectedMood(mood);
  };

  const handleLogMood = async () => {
    if (!selectedMood || isLogging) return;

    setIsLogging(true);
    try {
      const request = {
        mood: selectedMood.value.toString(), // API expects string
        notes: notes.trim() || undefined,
      };
      await brain.log_mood(request);
      setJustLogged(true);
      if (onMoodLogged) {
        onMoodLogged(selectedMood.value);
      }
      setTimeout(() => {
        setSelectedMood(null);
        setNotes('');
        setJustLogged(false);
      }, 2000);
    } catch (error) {
      console.error('Error logging mood:', error);
      toast.error('Failed to log mood. Please try again.');
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg">
      <CardHeader className="text-center p-6 sm:p-8">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-pink-100 dark:bg-pink-900/30">
            <Heart className="w-6 h-6 text-pink-600 dark:text-pink-400" />
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">
            How are you feeling?
          </CardTitle>
        </div>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-md mx-auto">
          Take a moment to check in with yourself. Your feelings matter.
        </p>
      </CardHeader>
      
      <CardContent className="p-6 sm:p-8 pt-0">
        {/* Mood Selection Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {moods.map((mood) => {
            const isSelected = selectedMood?.emoji === mood.emoji;
            return (
              <button
                key={mood.emoji}
                onClick={() => handleMoodSelect(mood)}
                disabled={isLogging || justLogged}
                className={`group relative p-4 sm:p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isSelected 
                    ? 'bg-gradient-to-br ' + mood.color + ' shadow-lg scale-105 ring-4 ring-blue-200 dark:ring-blue-600' 
                    : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-md hover:shadow-lg border border-slate-200 dark:border-slate-600'
                }`}
              >
                <div className="text-center">
                  <div className={`text-3xl sm:text-4xl mb-2 sm:mb-3 transition-transform duration-300 ${
                    isSelected ? 'scale-110' : 'group-hover:scale-110'
                  }`}>
                    {mood.emoji}
                  </div>
                  <p className={`text-xs sm:text-sm font-medium transition-colors duration-300 ${
                    isSelected 
                      ? 'text-white' 
                      : 'text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-slate-100'
                  }`}>
                    {mood.name}
                  </p>
                </div>
                
                {isSelected && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-lg border-2 border-current">
                    <Check className="w-4 h-4 text-green-500" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Log Button */}
        {selectedMood && (
          <div className="space-y-4">
            <div className="relative">
              <MessageCircle className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Textarea
                placeholder="How are you feeling? (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="pl-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400"
                rows={3}
              />
            </div>
            
            <Button
              onClick={handleLogMood}
              disabled={isLogging || justLogged}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLogging ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Logging...
                </div>
              ) : justLogged ? (
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Mood Logged!
                </div>
              ) : (
                `Log ${selectedMood.name} Mood`
              )}
            </Button>
          </div>
        )}
        
        {!selectedMood && (
          <div className="text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Select a mood above to continue
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};







