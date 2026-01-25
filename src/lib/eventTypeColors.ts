// Centralized event type colors for consistent styling across calendar views

export const EVENT_TYPES = [
  { value: 'cours', label: 'Cours' },
  { value: 'travail', label: 'Travail' },
  { value: 'perso', label: 'Personnel' },
  { value: 'sport', label: 'Sport' },
  { value: 'revision_libre', label: 'Révision libre' },
  { value: 'visio', label: 'Visio', majorOnly: true },
  { value: 'autre', label: 'Autre' },
];

// Colors for each event type (Tailwind classes for monthly view)
export const getEventTypeColorClass = (eventType: string | null | undefined): string => {
  switch (eventType) {
    case 'exam': return 'bg-red-500';
    case 'cours': return 'bg-blue-500';
    case 'travail': return 'bg-amber-500';
    case 'perso': return 'bg-purple-500';
    case 'sport': return 'bg-green-500';
    case 'revision_libre': return 'bg-teal-500';
    case 'visio': return 'bg-violet-500';
    default: return 'bg-slate-500';
  }
};

// Colors for WeeklyHourGrid (light/dark mode with backgrounds and text)
export const getEventTypeStyles = (eventType: string | null | undefined): {
  bg: string;
  border: string;
  text: string;
  textSecondary: string;
  hoverBg: string;
} => {
  switch (eventType) {
    case 'cours':
      return {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        border: 'border-blue-200 dark:border-blue-800',
        text: 'text-blue-800 dark:text-blue-200',
        textSecondary: 'text-blue-600 dark:text-blue-300',
        hoverBg: 'hover:bg-blue-400/50',
      };
    case 'travail':
      return {
        bg: 'bg-amber-100 dark:bg-amber-900/30',
        border: 'border-amber-200 dark:border-amber-800',
        text: 'text-amber-800 dark:text-amber-200',
        textSecondary: 'text-amber-600 dark:text-amber-300',
        hoverBg: 'hover:bg-amber-400/50',
      };
    case 'perso':
      return {
        bg: 'bg-purple-100 dark:bg-purple-900/30',
        border: 'border-purple-200 dark:border-purple-800',
        text: 'text-purple-800 dark:text-purple-200',
        textSecondary: 'text-purple-600 dark:text-purple-300',
        hoverBg: 'hover:bg-purple-400/50',
      };
    case 'sport':
      return {
        bg: 'bg-green-100 dark:bg-green-900/30',
        border: 'border-green-200 dark:border-green-800',
        text: 'text-green-800 dark:text-green-200',
        textSecondary: 'text-green-600 dark:text-green-300',
        hoverBg: 'hover:bg-green-400/50',
      };
    case 'revision_libre':
      return {
        bg: 'bg-teal-100 dark:bg-teal-900/30',
        border: 'border-teal-200 dark:border-teal-800',
        text: 'text-teal-800 dark:text-teal-200',
        textSecondary: 'text-teal-600 dark:text-teal-300',
        hoverBg: 'hover:bg-teal-400/50',
      };
    case 'visio':
      return {
        bg: 'bg-violet-100 dark:bg-violet-900/30',
        border: 'border-violet-200 dark:border-violet-800',
        text: 'text-violet-800 dark:text-violet-200',
        textSecondary: 'text-violet-600 dark:text-violet-300',
        hoverBg: 'hover:bg-violet-400/50',
      };
    default:
      return {
        bg: 'bg-slate-100 dark:bg-slate-900/30',
        border: 'border-slate-200 dark:border-slate-800',
        text: 'text-slate-800 dark:text-slate-200',
        textSecondary: 'text-slate-600 dark:text-slate-300',
        hoverBg: 'hover:bg-slate-400/50',
      };
  }
};
