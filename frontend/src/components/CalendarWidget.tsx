import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from 'utils/cn';
import { format, isSameDay, parseISO } from 'date-fns';

interface MoodEntry {
  date: string;
  mood: number;
  emoji?: string;
}

interface Props {
  moodEntries?: MoodEntry[];
  journalEntries?: Array<{ created_at: string; id: number; }>;
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date;
  className?: string;
  showMoodIndicators?: boolean;
  showJournalIndicators?: boolean;
  compact?: boolean;
}

export const CalendarWidget: React.FC<Props> = ({
  moodEntries = [],
  journalEntries = [],
  onDateSelect,
  selectedDate,
  className,
  showMoodIndicators = true,
  showJournalIndicators = true,
  compact = false
}) => {
  const [date, setDate] = useState<Date | undefined>(selectedDate || new Date());
  const [isOpen, setIsOpen] = useState(false);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate && onDateSelect) {
      onDateSelect(selectedDate);
    }
  };

  const getMoodForDate = (date: Date) => {
    return moodEntries.find(entry => 
      isSameDay(parseISO(entry.date), date)
    );
  };

  const hasJournalForDate = (date: Date) => {
    return journalEntries.some(entry => 
      isSameDay(parseISO(entry.created_at), date)
    );
  };

  const getMoodColor = (mood: number) => {
    if (mood >= 8) return 'bg-green-500';
    if (mood >= 6) return 'bg-blue-500';
    if (mood >= 4) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const CalendarContent = () => (
    <Calendar
      mode="single"
      selected={date}
      onSelect={handleDateSelect}
      className={cn("w-full rounded-lg", className)}
      components={{
        DayContent: ({ date: dayDate }) => {
          const moodEntry = showMoodIndicators ? getMoodForDate(dayDate) : null;
          const hasJournal = showJournalIndicators ? hasJournalForDate(dayDate) : false;
          
          return (
            <div className="relative w-full h-full flex items-center justify-center">
              <span>{dayDate.getDate()}</span>
              
              {/* Mood indicator */}
              {moodEntry && (
                <div className={cn(
                  "absolute -top-1 -right-1 w-2 h-2 rounded-full",
                  getMoodColor(moodEntry.mood)
                )} />
              )}
              
              {/* Journal indicator */}
              {hasJournal && (
                <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-purple-500 rounded-full" />
              )}
            </div>
          );
        }
      }}
    />
  );

  if (compact) {
    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full sm:w-auto justify-start text-left font-normal",
              !date && "text-muted-foreground",
              className
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarContent />
          
          {/* Legend */}
          {(showMoodIndicators || showJournalIndicators) && (
            <div className="p-3 border-t space-y-2">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Legend:</p>
              <div className="flex flex-wrap gap-3 text-xs">
                {showMoodIndicators && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-gray-600 dark:text-gray-400">Mood tracked</span>
                  </div>
                )}
                {showJournalIndicators && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                    <span className="text-gray-600 dark:text-gray-400">Journal entry</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <CalendarIcon className="w-5 h-5" />
          Calendar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <CalendarContent />
        
        {/* Legend */}
        {(showMoodIndicators || showJournalIndicators) && (
          <div className="space-y-2 pt-4 border-t">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Legend:</p>
            <div className="space-y-1">
              {showMoodIndicators && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <div className="w-2 h-2 bg-amber-500 rounded-full" />
                    <div className="w-2 h-2 bg-rose-500 rounded-full" />
                  </div>
                  <span className="text-gray-600 dark:text-gray-400">Mood levels</span>
                </div>
              )}
              {showJournalIndicators && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  <span className="text-gray-600 dark:text-gray-400">Journal entries</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};