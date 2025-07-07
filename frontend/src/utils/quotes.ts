// Collection of inspirational wellness quotes that rotate on homepage
export interface Quote {
  text: string;
  author: string;
  emoji: string;
}

export const wellnessQuotes: Quote[] = [
  {
    text: "You yourself, as much as anybody in the entire universe, deserve your love and affection.",
    author: "Buddha",
    emoji: "💝"
  },
  {
    text: "Mental health is not a destination, but a process. It's about how you drive, not where you're going.",
    author: "Noam Shpancer",
    emoji: "🌈"
  },
  {
    text: "Your mind is a garden, your thoughts are the seeds. You can grow flowers or you can grow weeds.",
    author: "William Wordsworth",
    emoji: "🌸"
  },
  {
    text: "Healing isn't about forgetting or moving on. It's about learning to carry the weight with grace.",
    author: "Anonymous",
    emoji: "✨"
  },
  {
    text: "You are braver than you believe, stronger than you seem, and more loved than you'll ever know.",
    author: "A.A. Milne",
    emoji: "🦋"
  },
  {
    text: "Almost everything will work again if you unplug it for a few minutes, including you.",
    author: "Anne Lamott",
    emoji: "🔌"
  },
  {
    text: "Progress, not perfection, is the goal.",
    author: "Anonymous",
    emoji: "🎯"
  },
  {
    text: "Be gentle with yourself, you're doing the best you can.",
    author: "Anonymous",
    emoji: "🤗"
  },
  {
    text: "Your current situation is not your final destination. The best is yet to come.",
    author: "Anonymous",
    emoji: "🌅"
  },
  {
    text: "Mental health is just as important as physical health, and deserves the same quality of support.",
    author: "Kate Middleton",
    emoji: "🧠"
  },
  {
    text: "It's okay to not be okay, as long as you don't stay that way.",
    author: "Anonymous",
    emoji: "🌱"
  },
  {
    text: "Self-care is not selfish. You cannot serve from an empty vessel.",
    author: "Eleanor Brown",
    emoji: "🛡️"
  }
];

// Get a random quote from the collection
export const getRandomQuote = (): Quote => {
  const randomIndex = Math.floor(Math.random() * wellnessQuotes.length);
  return wellnessQuotes[randomIndex];
};

// Get a quote based on current date (changes daily)
export const getDailyQuote = (): Quote => {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const index = dayOfYear % wellnessQuotes.length;
  return wellnessQuotes[index];
};
