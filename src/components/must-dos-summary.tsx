
'use client';

import { useMemo, useEffect, useRef, useState, ComponentType } from 'react';
import { useRouter } from 'next/navigation';
import type { MustDo } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ListChecks, Calendar, CheckCircle, ArrowDown, ArrowRight, ArrowUp, Flag } from 'lucide-react';
import { format } from 'date-fns';
import { Progress } from './ui/progress';
import { cn } from '@/lib/utils';

const TASK_ROW_PX = 44;   // p-2 row + space-y-2 gap
const OVERHEAD_PX = 210;  // header + progress section + "Upcoming Tasks" heading + padding

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
  return <Icon className={cn('h-4 w-4 shrink-0', color)} />;
};

interface MustDosSummaryProps {
  budgetId: string;
  mustDos: MustDo[] | null;
}

export function MustDosSummary({ budgetId, mustDos }: MustDosSummaryProps) {
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const [maxTasks, setMaxTasks] = useState(3);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const obs = new ResizeObserver(() => {
      const available = card.clientHeight - OVERHEAD_PX;
      setMaxTasks(Math.max(1, Math.floor(available / TASK_ROW_PX)));
    });
    obs.observe(card);
    return () => obs.disconnect();
  }, []);

  const { openTasks, completedCount, totalCount, progress, remainingOpen } = useMemo(() => {
    if (!mustDos) return { openTasks: [], completedCount: 0, totalCount: 0, progress: 0, remainingOpen: 0 };

    const allOpen = mustDos
      .filter(t => t.status === 'todo')
      .sort((a, b) => {
        // Tasks with deadlines first
        if (a.deadline && !b.deadline) return -1;
        if (!a.deadline && b.deadline) return 1;
        // Both have deadlines — sort ascending
        if (a.deadline && b.deadline) {
          const diff = new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
          if (diff !== 0) return diff;
        }
        // Same deadline bucket — sort by priority
        return priorityOrder[a.priority ?? 'medium'] - priorityOrder[b.priority ?? 'medium'];
      });

    const completed = mustDos.filter(t => t.status === 'done').length;
    const total = mustDos.length;

    return {
      openTasks: allOpen.slice(0, maxTasks),
      completedCount: completed,
      totalCount: total,
      progress: total > 0 ? (completed / total) * 100 : 0,
      remainingOpen: Math.max(0, allOpen.length - maxTasks),
    };
  }, [mustDos, maxTasks]);

  return (
    <Card
      ref={cardRef}
      onClick={() => router.push(`/planner/${budgetId}/must-dos`)}
      className="h-full bg-card/50 text-card-foreground shadow-lg backdrop-blur-xl border-white/20 cursor-pointer hover:border-primary/50 transition-colors"
    >
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Must-Do's</CardTitle>
        <CardDescription className="text-foreground/80">Your high-priority tasks at a glance.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1 text-sm font-medium text-foreground/90">
            <span>Progress</span>
            <span>{completedCount} / {totalCount} Completed</span>
          </div>
          <Progress value={progress} className="h-2 bg-white/20" />
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-foreground/90">Upcoming Tasks</h3>
          {openTasks.length > 0 ? (
            openTasks.map(task => (
              <div key={task.id} className="flex items-center justify-between p-2 rounded-md bg-black/10 text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <PriorityIcon priority={task.priority} />
                  <span className="font-medium truncate">{task.title}</span>
                </div>
                {task.deadline ? (
                  <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(task.deadline), 'dd-MMM')}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground italic">No deadline</span>
                )}
              </div>
            ))
          ) : (
            <div className="text-center p-4 rounded-md bg-black/10">
              <CheckCircle className="h-6 w-6 mx-auto text-green-500 mb-2" />
              <p className="text-sm text-muted-foreground">All tasks completed!</p>
            </div>
          )}
          {remainingOpen > 0 && (
            <p className="text-xs text-muted-foreground text-center pt-1">
              +{remainingOpen} more open task{remainingOpen > 1 ? 's' : ''}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
