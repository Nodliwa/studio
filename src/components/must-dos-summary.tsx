
'use client';

import { useMemo, useState, ComponentType } from 'react';
import { useRouter } from 'next/navigation';
import type { MustDo } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, CheckCircle, ArrowDown, ArrowRight, ArrowUp, Flag, ArrowRight as Enter } from 'lucide-react';
import { format } from 'date-fns';
import { Progress } from './ui/progress';
import { cn } from '@/lib/utils';

const priorityOrder: Record<MustDo['priority'], number> = { high: 0, medium: 1, low: 2 };

const PriorityLevels: Record<MustDo['priority'], { icon: ComponentType<{className?: string}> }> = {
  low: { icon: ArrowDown },
  medium: { icon: ArrowRight },
  high: { icon: ArrowUp },
};

const PriorityIcon = ({ priority }: { priority: MustDo['priority'] }) => {
  const safe = priority || 'medium';
  const Icon = PriorityLevels[safe]?.icon || Flag;
  const color = { low: 'text-green-500', medium: 'text-yellow-500', high: 'text-red-500' }[safe];
  return <Icon className={cn('h-3 w-3 shrink-0', color)} />;
};

interface MustDosSummaryProps {
  budgetId: string;
  mustDos: MustDo[] | null;
}

export function MustDosSummary({ budgetId, mustDos }: MustDosSummaryProps) {
  const router = useRouter();
  const [showAll, setShowAll] = useState(false);

  const { openTasks, completedCount, totalCount, progress } = useMemo(() => {
    if (!mustDos) return { openTasks: [], completedCount: 0, totalCount: 0, progress: 0 };

    const allOpen = mustDos
      .filter(t => t.status === 'todo')
      .sort((a, b) => {
        if (a.deadline && !b.deadline) return -1;
        if (!a.deadline && b.deadline) return 1;
        if (a.deadline && b.deadline) {
          const diff = new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
          if (diff !== 0) return diff;
        }
        return priorityOrder[a.priority ?? 'medium'] - priorityOrder[b.priority ?? 'medium'];
      });

    const completed = mustDos.filter(t => t.status === 'done').length;
    const total = mustDos.length;

    return {
      openTasks: allOpen,
      completedCount: completed,
      totalCount: total,
      progress: total > 0 ? (completed / total) * 100 : 0,
    };
  }, [mustDos]);

  return (
    <Card className="bg-card/50 text-card-foreground shadow-lg backdrop-blur-xl border-white/20">
      <CardHeader className="p-3 pb-0">
        <div className="flex items-center justify-between">
          <CardTitle className="font-headline text-base font-semibold">Must-Do's</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs px-2 gap-1 text-primary"
            onClick={() => router.push(`/planner/${budgetId}/must-dos`)}
          >
            Enter
            <Enter className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-3 space-y-2">
        <div>
          <div className="flex justify-between items-center mb-0.5 text-xs font-medium text-foreground/90">
            <span>Progress</span>
            <span>{completedCount}/{totalCount} done</span>
          </div>
          <Progress value={progress} className="h-1.5 bg-white/20" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-xs font-semibold text-foreground/90">Upcoming Tasks</h3>
          {openTasks.length > 0 ? (
            <>
              {(showAll ? openTasks : openTasks.slice(0, 3)).map(task => (
                <div key={task.id} className="flex items-center justify-between px-2 py-1 rounded-md bg-black/10 text-xs">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <PriorityIcon priority={task.priority} />
                    <span className="font-medium truncate">{task.title}</span>
                  </div>
                  {task.deadline ? (
                    <span className="text-muted-foreground flex items-center gap-1 shrink-0">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(task.deadline), 'dd-MMM')}
                    </span>
                  ) : (
                    <span className="text-muted-foreground italic">No deadline</span>
                  )}
                </div>
              ))}
              {openTasks.length > 3 && (
                <button
                  onClick={() => setShowAll(v => !v)}
                  className="w-full text-xs text-primary font-medium text-center pt-0.5 hover:underline"
                >
                  {showAll ? 'Show less' : `+${openTasks.length - 3} more item${openTasks.length - 3 > 1 ? 's' : ''}`}
                </button>
              )}
            </>
          ) : (
            <div className="text-center p-4 rounded-md bg-black/10">
              <CheckCircle className="h-6 w-6 mx-auto text-green-500 mb-2" />
              <p className="text-sm text-muted-foreground">All tasks completed!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
