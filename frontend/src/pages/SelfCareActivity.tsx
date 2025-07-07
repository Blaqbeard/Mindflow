import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  Heart, 
  Clock, 
  ArrowLeft,
  Star
} from 'lucide-react';
import brain from 'brain';
import type { SelfCareActivity } from 'types';
import { toast } from 'sonner';

const SelfCareActivity = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const activityId = searchParams.get('id');
  
  const [activity, setActivity] = useState<SelfCareActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState('');
  const [showCompletion, setShowCompletion] = useState(false);

  useEffect(() => {
    if (activityId) {
      loadActivity();
    }
  }, [activityId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            toast.success('Activity completed! Great job! 🎉');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeRemaining]);

  const loadActivity = async () => {
    try {
      setLoading(true);
      const response = await brain.get_activity({ activityId: Number(activityId) });
      const data: SelfCareActivity = await response.json();
      setActivity(data);
      setTimeRemaining(data.duration_minutes * 60); // Convert to seconds
    } catch (error) {
      console.error('Failed to load activity:', error);
      toast.error('Failed to load activity');
      navigate('/self-care');
    } finally {
      setLoading(false);
    }
  };

  const startTimer = () => {
    setIsTimerRunning(true);
  };

  const pauseTimer = () => {
    setIsTimerRunning(false);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimeRemaining(activity ? activity.duration_minutes * 60 : 0);
    setCurrentStep(0);
  };

  const nextStep = () => {
    if (activity && currentStep < activity.instructions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeActivity = async () => {
    if (!activity) return;
    
    try {
      await brain.complete_activity(
        { activityId: activity.id },
        { 
          activity_id: activity.id,
          rating: rating > 0 ? rating : undefined,
          notes: notes.trim() || undefined
        }
      );
      setIsCompleted(true);
      toast.success('Activity completed and logged! 🌟');
    } catch (error) {
      console.error('Failed to complete activity:', error);
      toast.error('Failed to log completion');
    }
  };

  const toggleFavorite = async () => {
    if (!activity) return;
    
    try {
      const response = await brain.toggle_favorite({ activityId: activity.id });
      const data = await response.json();
      setActivity({
        ...activity,
        user_progress: {
          ...activity.user_progress,
          is_favorite: data.is_favorite
        }
      });
      toast.success(data.is_favorite ? 'Added to favorites!' : 'Removed from favorites');
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      toast.error('Failed to update favorite');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = activity ? ((currentStep + 1) / activity.instructions.length) * 100 : 0;
  const timerProgress = activity ? ((activity.duration_minutes * 60 - timeRemaining) / (activity.duration_minutes * 60)) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Activity Not Found</h1>
          <Button onClick={() => navigate('/self-care')}>Back to Activities</Button>
        </div>
      </div>
    );
  }

  if (showCompletion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">Activity Completed!</CardTitle>
              <p className="text-slate-600 dark:text-slate-400">How was your experience with {activity.title}?</p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Rate your experience (optional)
                </label>
                <div className="flex gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Button
                      key={star}
                      variant="ghost"
                      size="sm"
                      onClick={() => setRating(star)}
                      className={`p-1 ${rating >= star ? 'text-yellow-500' : 'text-slate-300 dark:text-slate-600'}`}
                    >
                      <Star className={`h-6 w-6 ${rating >= star ? 'fill-current' : ''}`} />
                    </Button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Notes or reflections (optional)
                </label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="How do you feel? Any insights or observations?"
                  className="min-h-20 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button 
                  onClick={completeActivity}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                  disabled={isCompleted}
                >
                  {isCompleted ? (
                    <><CheckCircle className="h-4 w-4 mr-2" /> Logged!</>
                  ) : (
                    'Log Completion'
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/self-care')}
                  className="flex-1"
                >
                  Back to Activities
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/self-care')}
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Activities
          </Button>
          <div className="flex-1" />
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleFavorite}
            className={activity.user_progress?.is_favorite ? 'text-red-500' : 'text-slate-400 dark:text-slate-500'}
          >
            <Heart className={`h-5 w-5 ${activity.user_progress?.is_favorite ? 'fill-current' : ''}`} />
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Activity Info */}
            <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {activity.title}
                    </CardTitle>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">{activity.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 mt-4">
                  <Badge variant="outline" className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300">
                    <Clock className="h-3 w-3 mr-1" />
                    {activity.duration_minutes} minutes
                  </Badge>
                  <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700">
                    {activity.difficulty_level}
                  </Badge>
                  <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {activity.category}
                  </Badge>
                </div>
              </CardHeader>
            </Card>

            {/* Instructions */}
            <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200">Instructions</CardTitle>
                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Step {currentStep + 1} of {activity.instructions.length}
                  </p>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-lg mb-6 border border-indigo-200 dark:border-indigo-800">
                  <p className="text-lg text-slate-800 dark:text-slate-200 leading-relaxed">
                    {activity.instructions[currentStep]}
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={prevStep}
                    disabled={currentStep === 0}
                  >
                    Previous
                  </Button>
                  <Button 
                    onClick={nextStep}
                    disabled={currentStep === activity.instructions.length - 1}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    Next Step
                  </Button>
                  {currentStep === activity.instructions.length - 1 && (
                    <Button 
                      onClick={() => setShowCompletion(true)}
                      className="bg-green-600 hover:bg-green-700 text-white ml-auto"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Complete Activity
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Timer */}
            <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-center text-slate-800 dark:text-slate-200">Timer</CardTitle>
              </CardHeader>
              
              <CardContent className="text-center space-y-4">
                <div className="text-4xl font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {formatTime(timeRemaining)}
                </div>
                
                <Progress value={timerProgress} className="h-3" />
                
                <div className="flex gap-2 justify-center">
                  {!isTimerRunning ? (
                    <Button onClick={startTimer} size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                      <Play className="h-4 w-4 mr-2" />
                      Start
                    </Button>
                  ) : (
                    <Button onClick={pauseTimer} size="sm" variant="outline" className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300">
                      <Pause className="h-4 w-4 mr-2" />
                      Pause
                    </Button>
                  )}
                  <Button onClick={resetTimer} size="sm" variant="outline" className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200">Benefits</CardTitle>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-2">
                  {activity.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <div className="w-2 h-2 bg-indigo-500 dark:bg-indigo-400 rounded-full" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Progress */}
            {activity.user_progress && activity.user_progress.total_completions > 0 && (
              <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200">Your Progress</CardTitle>
                </CardHeader>
                
                <CardContent>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                      {activity.user_progress.total_completions}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">times completed</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelfCareActivity;




