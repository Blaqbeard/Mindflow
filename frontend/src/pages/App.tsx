import { UserButton } from "@stackframe/react";
import { UserGuard, useUserGuardContext } from "app/auth";
import React, { useState, useEffect, useMemo } from 'react';
import { MoodSelector } from "components/MoodSelector";
import { MoodHistory } from "components/MoodHistory";
import { Toaster } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, BookOpen, Activity, TrendingUp, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getRandomQuote, type Quote } from "utils/quotes";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { InstallAppSection } from 'components/InstallAppSection';
import { FeatureCard } from "components/FeatureCard";

function AppInternal() {
  const { user } = useUserGuardContext();
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [showMoodPrompt, setShowMoodPrompt] = useState(false);
  const navigate = useNavigate();

  const memoizedQuote = useMemo(() => {
    return getRandomQuote();
  }, []);

  useEffect(() => {
    setCurrentQuote(memoizedQuote);
  }, [memoizedQuote]);

  const handleMoodLogged = (moodValue: number) => {
    setRefreshKey((prevKey) => prevKey + 1);
    if (moodValue <= 3) {
      setShowMoodPrompt(true);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const userName = useMemo(() => {
    return user?.displayName?.split(" ")[0] || user?.primaryEmailAddress?.split("@")[0] || "there";
  }, [user?.displayName, user?.primaryEmailAddress]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100">
                  Mindflow
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Your wellness companion</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button 
                onClick={() => navigate('/settings')}
                className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                <Settings className="h-5 w-5" />
              </button>
              <UserButton />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-5xl">
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2 sm:mb-3">
            {getGreeting()}, {userName}! 👋
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
            How are you feeling today? Take a moment to check in with yourself.
          </p>
        </div>

        <div className="mb-8 sm:mb-10">
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl border border-slate-200/50 dark:border-slate-700/50">
            <MoodSelector onMoodLogged={handleMoodLogged} />
          </div>
        </div>

        <div className="mb-8 sm:mb-10">
          <InstallAppSection />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-10">
          <FeatureCard 
            title="AI Chat"
            description="Get support and guidance"
            icon={<MessageSquare />}
            onClick={() => navigate('/chat')}
            color="blue"
          />
          <FeatureCard 
            title="Journal"
            description="Reflect and write"
            icon={<BookOpen />}
            onClick={() => navigate('/journal')}
            color="green"
          />
          <FeatureCard 
            title="Self-Care"
            description="Mindfulness activities"
            icon={<Activity />}
            onClick={() => navigate('/self-care')}
            color="purple"
          />
          <FeatureCard 
            title="Progress"
            description="Visualize your journey"
            icon={<TrendingUp />}
            onClick={() => navigate('/progress')}
            color="orange"
          />
        </div>

        <div className="bg-white/70 dark:bg-slate-900/70 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden backdrop-blur-sm mb-8 sm:mb-10">
          <MoodHistory refreshTrigger={refreshKey} />
        </div>

        <div>
          <Card className="bg-gradient-to-r from-indigo-50/60 to-purple-50/60 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-200/50 dark:border-indigo-800/30 rounded-2xl backdrop-blur-sm">
            <CardContent className="text-center py-6 px-4">
              {currentQuote && (
                <>
                  <div className="text-3xl mb-3">{currentQuote.emoji}</div>
                  <blockquote className="text-base sm:text-lg text-slate-700 dark:text-slate-300 font-medium italic mb-2 leading-relaxed">
                    "{currentQuote.text}"
                  </blockquote>
                  <cite className="text-slate-500 dark:text-slate-400 text-sm">— {currentQuote.author}</cite>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Toaster />
      <AlertDialog open={showMoodPrompt} onOpenChange={setShowMoodPrompt}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Check in with yourself</AlertDialogTitle>
            <AlertDialogDescription>
              It looks like you're feeling a bit down. Would you like to talk to our AI assistant or write in your journal?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Maybe later</AlertDialogCancel>
            <AlertDialogAction onClick={() => navigate('/journal')}>Write in Journal</AlertDialogAction>
            <AlertDialogAction onClick={() => navigate('/chat')}>Talk to Assistant</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function App() {
  return (
    <UserGuard>
      <AppInternal />
    </UserGuard>
  );
}

