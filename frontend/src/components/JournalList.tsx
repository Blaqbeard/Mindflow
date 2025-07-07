import React from "react";
import { JournalEntry } from "brain/data-contracts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, Heart, Trash2 } from "lucide-react";

interface Props {
  entries: JournalEntry[];
  onSelectEntry: (entry: JournalEntry) => void;
  onDeleteEntry: (id: number) => void;
}

export const JournalList: React.FC<Props> = ({
  entries,
  onSelectEntry,
  onDeleteEntry,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const getPreviewText = (content: string) => {
    // Remove HTML tags and get first 120 characters
    const plainText = content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
    return plainText.length > 120 ? plainText.substring(0, 120) + '...' : plainText;
  };

  const getMoodColor = (moodEmoji: string | null) => {
    const colorMap: { [key: string]: string } = {
      "😊": "from-yellow-400 to-orange-400", // Happy
      "😌": "from-blue-400 to-cyan-400",     // Calm
      "😐": "from-gray-400 to-slate-400",    // Neutral
      "😔": "from-blue-500 to-indigo-500",   // Sad
      "😰": "from-red-400 to-pink-400",     // Anxious
    };
    return colorMap[moodEmoji || ""] || "from-gray-300 to-gray-400";
  };

  if (entries.length === 0) {
    return (
      <Card className="bg-white/70 dark:bg-black/40 backdrop-blur-xl rounded-3xl shadow-lg border border-white/50 dark:border-gray-800/50">
        <CardContent className="p-6 sm:p-8">
          <div className="text-center py-8 sm:py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
              No journal entries yet
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
              Start your journaling journey by creating your first entry. Click "Create New Entry" to begin.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm uppercase tracking-wide">
        Your Entries ({entries.length})
      </h3>
      
      <div className="space-y-2 sm:space-y-3 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
        {entries.map((entry) => {
          const previewText = getPreviewText(entry.content);
          const hasContent = previewText.length > 0;

          return (
            <div key={entry.id} className="relative group">
              <Card
                onClick={() => onSelectEntry(entry)}
                className="cursor-pointer bg-white/60 dark:bg-black/60 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-md hover:shadow-xl border border-white/50 dark:border-gray-800/50 hover:border-blue-200/50 dark:hover:border-blue-700/50 transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1"
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start gap-3 sm:gap-4">
                    {/* Mood Indicator */}
                    <div className="flex-shrink-0">
                      {entry.mood_emoji ? (
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br ${getMoodColor(entry.mood_emoji)} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                          <span className="text-lg sm:text-xl">{entry.mood_emoji}</span>
                        </div>
                      ) : (
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                          <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500 dark:text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                        <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">
                          {formatDate(entry.created_at)}
                        </span>
                        {entry.mood_emoji && (
                          <>
                            <span className="text-gray-300 dark:text-gray-600">•</span>
                            <div className="flex items-center gap-1">
                              <Heart className="w-3 h-3 text-pink-400" />
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                Mood tracked
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                      
                      {hasContent ? (
                        <div className="space-y-2">
                          <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300">
                            {previewText}
                          </p>
                          
                          {entry.content.length > 120 && (
                            <span className="inline-block text-xs text-blue-500 dark:text-blue-400 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors duration-300">
                              Read more →
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                          Empty entry
                        </p>
                      )}
                    </div>
                    
                    {/* Hover Indicator */}
                    <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    </div>
                  </div>
                </CardContent>

                {/* Last Updated */}
                {entry.updated_at &&
                  entry.updated_at !== entry.created_at && (
                    <div className="mt-3 pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        Updated {formatDate(entry.updated_at)}
                      </span>
                    </div>
                  )}
              </Card>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteEntry(entry.id);
                }}
                className="absolute top-2 right-2 p-1.5 h-auto rounded-full bg-black/5 dark:bg-white/10 text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-500 dark:hover:text-red-400 transition-all"
                aria-label="Delete entry"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          );
        })}
      </div>
      
      {entries.length > 5 && (
        <div className="text-center pt-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Scroll to see more entries
          </span>
        </div>
      )}
    </div>
  );
};




