import React, { useState, useEffect, useMemo } from "react";
import { UserGuard } from "app/auth";
import { RichTextEditor } from "components/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import brain from "brain";
import { JournalList } from "components/JournalList";
import { JournalEntry } from "brain/data-contracts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, X, Lightbulb, RefreshCw, Plus, ArrowLeft, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CalendarWidget } from "components/CalendarWidget";

const moods = [
  { emoji: "😊", name: "Happy" },
  { emoji: "😌", name: "Calm" },
  { emoji: "😐", name: "Neutral" },
  { emoji: "😟", name: "Worried" },
  { emoji: "😢", name: "Sad" },
];

const therapeuticPrompts = [
  "What brought you joy today, no matter how small?",
  "Describe a moment when you felt truly peaceful.",
  "What are three things you're grateful for right now?",
  "How are you feeling in your body today?",
  "What would you tell a friend going through what you're experiencing?",
  "What's one thing you learned about yourself this week?",
  "Describe a place where you feel completely safe and calm.",
  "What emotions are you carrying today, and where do you feel them?",
  "What does self-compassion look like for you right now?",
  "If your current feelings were a weather pattern, what would they be?",
  "What boundaries do you need to set for your wellbeing?",
  "What would you like to release or let go of today?"
];

function JournalInternal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [content, setContent] = useState("");
  const [date, setDate] = useState<Date | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [moodFilter, setMoodFilter] = useState<string | null>(null);
  const [showPrompts, setShowPrompts] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [isMobileEditorOpen, setIsMobileEditorOpen] = useState(false);
  const [moodHistory, setMoodHistory] = useState<Array<{logged_at: string, mood: string | number, emoji: string}>>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await brain.get_journal_entries();
      const data = await response.json();
      setEntries(data);
    } catch (error) {
      toast.error("Failed to fetch journal entries.");
    }
  };

  const handleSelectEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setContent(entry.content);
    setSelectedMood(entry.mood_emoji || null);
    setIsMobileEditorOpen(true); // Open editor on mobile when selecting entry
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      if (selectedEntry) {
        await brain.update_journal_entry(
          { entryId: selectedEntry.id },
          { content, mood_emoji: selectedMood },
        );
        toast.success("Journal entry updated!");
      } else {
        const entryData = {
          content,
          mood_emoji: selectedMood,
          created_at: date ? date.toISOString() : new Date().toISOString(),
        };
        await brain.create_journal_entry(entryData);
        toast.success("Journal entry saved!");
      }
      setContent("");
      setSelectedMood(null);
      setSelectedEntry(null);
      setDate(null);
      fetchEntries();
    } catch (error) {
      toast.error("Failed to save entry. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateEntry = async (id: number) => {
    try {
      await brain.update_journal_entry(
        { entryId: id },
        { content: editingContent, mood_emoji: editingMood },
      );
      setEditingEntryId(null);
      await fetchEntries();
      toast.success("Journal entry updated!");
    } catch (error) {
      console.error("Error updating journal entry:", error);
      toast.error("Failed to update journal entry.");
    }
  };

  const handleDeleteEntry = async (id: number) => {
    try {
      await brain.delete_journal_entry({ entryId: id });
      await fetchEntries();
      toast.success("Journal entry deleted!");
    } catch (error) {
      console.error("Error deleting journal entry:", error);
      toast.error("Failed to delete journal entry.");
    }
  };

  const handleNewEntry = () => {
    setSelectedEntry(null);
    setContent("");
    setSelectedMood(null);
    setDate(new Date()); // Set current date for new entry
    setIsMobileEditorOpen(true); // Open editor on mobile for new entry
  };

  const handleBackToList = () => {
    setIsMobileEditorOpen(false);
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      const matchesSearch = searchTerm === "" || 
        entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        new Date(entry.created_at).toLocaleDateString().includes(searchTerm);
      
      const matchesMood = moodFilter === null || entry.mood_emoji === moodFilter;
      
      return matchesSearch && matchesMood;
    });
  }, [entries, searchTerm, moodFilter]);

  const clearFilters = () => {
    setSearchTerm("");
    setMoodFilter(null);
  };

  const getRandomPrompt = () => {
    const randomIndex = Math.floor(Math.random() * therapeuticPrompts.length);
    setCurrentPrompt(therapeuticPrompts[randomIndex]);
    setShowPrompts(true);
  };

  const usePrompt = (prompt: string) => {
    setContent(prompt + "\n\n");
    setShowPrompts(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/30 dark:bg-black/30 border-b border-white/20 dark:border-gray-800/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center space-x-3">
              {/* Back to Home Button - Always visible */}
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleBackToHome}
                className="p-2 hover:bg-white/20 dark:hover:bg-black/20 transition-colors duration-200"
                title="Back to Home"
              >
                <Home className="w-5 h-5" />
              </Button>
              
              {/* Mobile Editor Back Button */}
              {isMobileEditorOpen && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleBackToList}
                  className="lg:hidden p-2 hover:bg-white/20 dark:hover:bg-black/20 transition-colors duration-200"
                  title="Back to List"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              )}
              
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg sm:text-xl">M</span>
              </div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Journal
              </h1>
            </div>
            {!isMobileEditorOpen && (
              <Button 
                onClick={handleNewEntry} 
                className="lg:hidden bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                New
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto">
          <div className="lg:grid lg:grid-cols-5 lg:gap-8">
            {/* Sidebar - Entry List */}
            <div className={`lg:col-span-2 ${isMobileEditorOpen ? 'hidden lg:block' : 'block'}`}>
              <div className="sticky top-24">
                <Button 
                  onClick={handleNewEntry} 
                  className="hidden lg:flex w-full mb-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-12"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create New Entry
                </Button>
                
                {/* Search and Filter Section */}
                <div className="space-y-4 mb-6 p-4 sm:p-6 bg-white/70 dark:bg-black/40 backdrop-blur-xl rounded-3xl shadow-lg border border-white/50 dark:border-gray-800/50">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm uppercase tracking-wide">Find Entries</h3>
                  
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search your thoughts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/70 dark:bg-black/70 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 rounded-xl h-11 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  
                  <Select value={moodFilter || "all"} onValueChange={(value) => setMoodFilter(value === "all" ? null : value)}>
                    <SelectTrigger className="bg-white/70 dark:bg-black/70 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 rounded-xl h-11">
                      <SelectValue placeholder="Filter by mood" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All moods</SelectItem>
                      {moods.map((mood) => (
                        <SelectItem key={mood.emoji} value={mood.emoji}>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{mood.emoji}</span>
                            <span>{mood.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {(searchTerm || moodFilter) && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={clearFilters}
                      className="w-full text-gray-500 hover:text-gray-700 h-9"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Clear filters
                    </Button>
                  )}
                </div>
                
                <JournalList
                  entries={filteredEntries}
                  onSelectEntry={handleSelectEntry}
                  onDeleteEntry={handleDeleteEntry}
                />
              </div>
            </div>

            {/* Main Editor Area */}
            <div className={`lg:col-span-3 ${!isMobileEditorOpen ? 'hidden lg:block' : 'block'}`}>
              <div className="space-y-4 sm:space-y-6">
                {/* Therapeutic Prompts Section */}
                <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-50/80 to-purple-50/80 dark:from-blue-900/20 dark:to-purple-900/20 backdrop-blur-xl rounded-3xl border border-blue-200/50 dark:border-blue-800/50 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-blue-500/10">
                        <Lightbulb className="w-5 h-5 text-blue-500" />
                      </div>
                      <h3 className="font-semibold text-blue-700 dark:text-blue-300">Writing Inspiration</h3>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={getRandomPrompt}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:bg-blue-500/10"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      New Prompt
                    </Button>
                  </div>
                  
                  {showPrompts && currentPrompt && (
                    <div className="space-y-4">
                      <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 italic leading-relaxed">
                        "{currentPrompt}"
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => usePrompt(currentPrompt)}
                          className="bg-blue-500 hover:bg-blue-600 text-white flex-1 sm:flex-none"
                        >
                          Use This Prompt
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setShowPrompts(false)}
                          className="flex-1 sm:flex-none"
                        >
                          Maybe Later
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {!showPrompts && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      Need inspiration? Click "New Prompt" for a gentle writing suggestion to guide your reflection.
                    </p>
                  )}
                </div>

                {/* Mood Selector */}
                <div className="p-4 sm:p-6 bg-white/70 dark:bg-black/40 backdrop-blur-xl rounded-3xl shadow-lg border border-white/50 dark:border-gray-800/50">
                  <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">How are you feeling?</label>
                  <Select value={selectedMood || ""} onValueChange={setSelectedMood}>
                    <SelectTrigger className="bg-white/70 dark:bg-black/70 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 rounded-xl h-12">
                      <SelectValue placeholder="Select your current mood (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {moods.map((mood) => (
                        <SelectItem key={mood.emoji} value={mood.emoji}>
                          <div className="flex items-center gap-3 py-1">
                            <span className="text-xl">{mood.emoji}</span>
                            <span className="font-medium">{mood.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Rich Text Editor */}
                <div className="bg-white/70 dark:bg-black/40 backdrop-blur-xl rounded-3xl shadow-lg border border-white/50 dark:border-gray-800/50 overflow-hidden">
                  <RichTextEditor content={content} onChange={setContent} />
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                  <Button 
                    onClick={handleSave} 
                    disabled={isLoading || !content.trim()}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Saving..." : (selectedEntry ? "Update Entry" : "Save Entry")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Journal() {
  return (
    <UserGuard>
      <JournalInternal />
    </UserGuard>
  );
}



