import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, 
  Home,
  Search, 
  Filter, 
  Clock, 
  Heart, 
  Star,
  Users,
  Target
} from 'lucide-react';
import brain from 'brain';
import { toast } from 'sonner';
import { UserGuard, useUserGuardContext } from 'app/auth';
import type { SelfCareActivity } from 'types';

function SelfCareInternal() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useUserGuardContext();
  const [activities, setActivities] = useState<SelfCareActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  // Get initial filter from URL params
  useEffect(() => {
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    if (category) setSelectedCategory(category);
    if (difficulty) setSelectedDifficulty(difficulty);
  }, [searchParams]);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      const response = await brain.get_activities();
      const data = await response.json();
      setActivities(data.activities || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast.error('Failed to load activities');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = async (activityId: number) => {
    try {
      await brain.toggle_favorite({ activityId });
      // Refresh activities to get updated favorite status
      fetchActivities();
      toast.success('Favorite updated!');
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorite');
    }
  };

  const categories = [
    { id: 'all', name: 'All Categories', icon: '🌟' },
    { id: 'breathing', name: 'Breathing', icon: '🫁' },
    { id: 'meditation', name: 'Meditation', icon: '🧘' },
    { id: 'movement', name: 'Movement', icon: '🏃' },
    { id: 'mindfulness', name: 'Mindfulness', icon: '🎯' },
    { id: 'relaxation', name: 'Relaxation', icon: '😌' },
  ];

  const difficulties = [
    { id: 'all', name: 'All Levels' },
    { id: 'beginner', name: 'Beginner' },
    { id: 'intermediate', name: 'Intermediate' }, 
    { id: 'advanced', name: 'Advanced' },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'advanced': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find(c => c.id === category);
    return categoryData?.icon || '🌿';
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || activity.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || activity.difficulty_level === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const activityStats = {
    total: activities.length,
    beginner: activities.filter(a => a.difficulty_level === 'beginner').length,
    intermediate: activities.filter(a => a.difficulty_level === 'intermediate').length,
    advanced: activities.filter(a => a.difficulty_level === 'advanced').length,
    avgDuration: Math.round(activities.reduce((sum, a) => sum + a.duration_minutes, 0) / activities.length) || 0
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/')}
            className="text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100"
          >
            <Home className="h-4 w-4 mr-2" />
            Home
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-slate-100 mb-2">
              🌿 Self-Care Activities
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              Discover activities to nurture your mental wellbeing
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{activityStats.total}</div>
              <div className="text-sm text-slate-600 dark:text-slate-300">Total Activities</div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{activityStats.beginner}</div>
              <div className="text-sm text-slate-600 dark:text-slate-300">Beginner</div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{activityStats.intermediate}</div>
              <div className="text-sm text-slate-600 dark:text-slate-300">Intermediate</div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{activityStats.advanced}</div>
              <div className="text-sm text-slate-600 dark:text-slate-300">Advanced</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 mb-8">
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-600"
                />
              </div>

              {/* Category Filter */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Categories
                </h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                      className="text-xs"
                    >
                      <span className="mr-1">{category.icon}</span>
                      {category.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Difficulty Filter */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Difficulty Level
                </h3>
                <div className="flex flex-wrap gap-2">
                  {difficulties.map(difficulty => (
                    <Button
                      key={difficulty.id}
                      variant={selectedDifficulty === difficulty.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedDifficulty(difficulty.id)}
                      className="text-xs"
                    >
                      {difficulty.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="mb-6">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Showing {filteredActivities.length} of {activities.length} activities
          </p>
        </div>

        {/* Activities Grid */}
        {filteredActivities.length === 0 ? (
          <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
                No activities found
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Try adjusting your search or filter criteria
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredActivities.map((activity) => (
              <Card 
                key={activity.id} 
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                onClick={() => navigate(`/self-care-activity?id=${activity.id}`)}
              >
                <CardHeader className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-3xl group-hover:scale-110 transition-transform duration-300">
                      {getCategoryIcon(activity.category)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getDifficultyColor(activity.difficulty_level)}>
                        {activity.difficulty_level}
                      </Badge>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(activity.id);
                        }}
                        className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Heart className={`h-4 w-4 ${
                          activity.is_favorited 
                            ? 'fill-red-500 text-red-500' 
                            : 'text-slate-400 hover:text-red-500'
                        }`} />
                      </button>
                    </div>
                  </div>
                  
                  <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {activity.title}
                  </CardTitle>
                  
                  <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                    {activity.description}
                  </p>
                </CardHeader>
                
                <CardContent className="p-6 pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {activity.duration_minutes} min
                      </div>
                      {activity.benefits && activity.benefits.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          {activity.benefits.length} benefits
                        </div>
                      )}
                    </div>
                    
                    <Button size="sm" variant="ghost" className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30">
                      Start →
                    </Button>
                  </div>
                  
                  {activity.mood_tags && activity.mood_tags.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex flex-wrap gap-1">
                        {activity.mood_tags.slice(0, 3).map((tag, index) => (
                          <span 
                            key={index}
                            className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        {activity.mood_tags.length > 3 && (
                          <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full">
                            +{activity.mood_tags.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Self-Care Tips */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 border border-blue-200 dark:border-blue-800 mt-12">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-blue-800 dark:text-blue-200 flex items-center gap-2">
              💡 Self-Care Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">Getting Started</h4>
                <ul className="text-sm text-blue-600 dark:text-blue-300 space-y-1">
                  <li>• Start with beginner activities if you're new to self-care</li>
                  <li>• Set aside dedicated time each day for practice</li>
                  <li>• Be patient with yourself as you build new habits</li>
                  <li>• Track your progress and celebrate small wins</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">Building Consistency</h4>
                <ul className="text-sm text-blue-600 dark:text-blue-300 space-y-1">
                  <li>• Choose activities that match your current mood</li>
                  <li>• Create a peaceful environment for practice</li>
                  <li>• Mix different types of activities throughout the week</li>
                  <li>• Use reminders to maintain your routine</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SelfCare() {
  return (
    <UserGuard>
      <SelfCareInternal />
    </UserGuard>
  );
}



