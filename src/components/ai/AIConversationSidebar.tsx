import { useState } from 'react';
import { MessageSquare, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format, isToday, isYesterday, isThisWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { AIConversation } from '@/hooks/useAIConversations';

type Props = {
  conversations: AIConversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
};

function groupConversations(conversations: AIConversation[]) {
  const groups: { label: string; items: AIConversation[] }[] = [];
  const today: AIConversation[] = [];
  const yesterday: AIConversation[] = [];
  const thisWeek: AIConversation[] = [];
  const older: AIConversation[] = [];

  for (const c of conversations) {
    const d = new Date(c.updated_at);
    if (isToday(d)) today.push(c);
    else if (isYesterday(d)) yesterday.push(c);
    else if (isThisWeek(d)) thisWeek.push(c);
    else older.push(c);
  }

  if (today.length) groups.push({ label: "Aujourd'hui", items: today });
  if (yesterday.length) groups.push({ label: 'Hier', items: yesterday });
  if (thisWeek.length) groups.push({ label: 'Cette semaine', items: thisWeek });
  if (older.length) groups.push({ label: 'Plus ancien', items: older });

  return groups;
}

export function AIConversationSidebar({ conversations, activeId, onSelect, onNew, onDelete }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const groups = groupConversations(conversations);

  return (
    <div className="flex flex-col h-full w-64 border-r border-border bg-muted/30">
      <div className="p-3">
        <Button onClick={onNew} variant="outline" size="sm" className="w-full gap-1.5 text-xs">
          <Plus className="h-3.5 w-3.5" />
          Nouvelle conversation
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {groups.length === 0 && (
          <p className="text-xs text-muted-foreground text-center mt-8">Aucune conversation</p>
        )}
        {groups.map((group) => (
          <div key={group.label} className="mb-3">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-2 mb-1">
              {group.label}
            </p>
            {group.items.map((conv) => (
              <button
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                onMouseEnter={() => setHoveredId(conv.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-xs transition-colors group relative",
                  activeId === conv.id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent/50"
                )}
              >
                <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate flex-1">{conv.title}</span>
                {hoveredId === conv.id && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(conv.id); }}
                    className="shrink-0 p-0.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
