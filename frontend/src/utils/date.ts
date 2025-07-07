// A robust, reusable date formatting function
export const formatDate = (dateString?: string | null): string => {
  if (!dateString) {
    return "N/A";
  }
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    // Attempt to handle different date string formats if necessary
    // For now, return a clear indicator of invalid date
    return "Invalid Date";
  }

  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) { // Future date
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  if (diffDays === 0) {
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    return "Today";
  }
  if (diffDays === 1) {
    return "Yesterday";
  }
  if (diffDays <= 7) {
    return `${diffDays} days ago`;
  }
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};
