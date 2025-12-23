
'use client';

import { useMemo, ComponentType } from 'react';
import { useRouter } from 'next/navigation';
import type { MustDo } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ListChecks, Calendar, CheckCircle, ArrowDown, ArrowRight, ArrowUp, Flag } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Progress } from './ui/progress';
import { cn } from '@/lib/utils';


const PriorityLevels: Record<MustDo['priority'], { icon: ComponentType<{className?: string}> }> = {
    low: { icon: ArrowDown },
    medium: { icon: ArrowRight },
    high: { icon: ArrowUp },
};

const PriorityIcon = ({ priority }: { priority: MustDo['priority'] }) => {
    const safePriority = priority || 'medium';
    const Icon = PriorityLevels[safePriority]?.icon || Flag;
    const colorClass = {
        low: 'text-green-500',
        medium: 'text-yellow-500',
        high: 'text-red-500',
    }[safePriority];
    return <Icon className={cn('h-4 w-4 shrink-0', colorClass)} />;
};

interface MustDosSummaryProps {
  budgetId: string;
  mustDos: MustDo[] | null;
}

export function MustDosSummary({ budgetId, mustDos }: MustDosSummaryProps) {
  const router = useRouter();

  const { openTasks, completedCount, totalCount, progress } = useMemo(() => {
    if (!mustDos) {
      return { openTasks: [], completedCount: 0, totalCount: 0, progress: 0 };
    }
    const open = mustDos.filter(task => task.status === 'todo').slice(0, 3); // show top 3
    const completed = mustDos.filter(task => task.status === 'done').length;
    const total = mustDos.length;
    const prog = total > 0 ? (completed / total) * 100 : 0;
    return { openTasks: open, completedCount: completed, totalCount: total, progress: prog };
  }, [mustDos]);

  const handleCardClick = () => {
    router.push(`/planner/${budgetId}/must-dos`);
  };

  return (
    <Card 
      onClick={handleCardClick}
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
             {totalCount > openTasks.length && openTasks.length > 0 && (
                <p className="text-xs text-muted-foreground text-center pt-1">
                    ...and {totalCount - openTasks.length - completedCount} more open tasks.
                </p>
            )}
        </div>
      </CardContent>
    </Card>
  );
}

    