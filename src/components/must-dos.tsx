
'use client';

import { useState, useMemo, useEffect, ComponentType, useTransition } from 'react';
import { useUser, useFirestore, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocument } from '@/firebase';
import { collection, doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import type { MustDo } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { PlusCircle, Star, Trash2, Bell, BellOff, Flag, ArrowDown, ArrowRight, ArrowUp, Mail, MessageSquare, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DocumentReference } from 'firebase/firestore';
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { suggestMustDos } from '@/ai/flows/suggest-must-dos-flow';
import { useToast } from '@/hooks/use-toast';

interface MustDosProps {
  budgetId: string;
  budgetRef: DocumentReference | null;
  isTemplateMode?: boolean;
  mustDos: MustDo[] | null;
  eventType?: string;
}

const PriorityLevels: Record<MustDo['priority'], { label: string; icon: ComponentType<{className?: string}>, order: number }> = {
    low: { label: 'Low', icon: ArrowDown, order: 3 },
    medium: { label: 'Medium', icon: ArrowRight, order: 2 },
    high: { label: 'High', icon: ArrowUp, order: 1 },
};

const PriorityIcon = ({ priority }: { priority: MustDo['priority'] }) => {
    const safePriority = priority || 'medium';
    const Icon = PriorityLevels[safePriority]?.icon || Flag;
    const colorClass = {
        low: 'text-green-500',
        medium: 'text-yellow-500',
        high: 'text-red-500',
    }[safePriority];
    return <Icon className={cn('h-4 w-4', colorClass)} />;
};

const WhatsappIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M16.75 13.96c.25.13.4.38.48.63.08.25.11.5.08.75-.03.25-.11.48-.25.7-.13.21-.3.38-.5.5-.2.13-.43.21-.68.25-.25.04-.5.03-.75-.03-.25-.06-.5-.18-.75-.33a10.66 10.66 0 01-3.6-2.04c-1.25-1.25-2.04-2.63-2.38-4.08-.03-.25-.03-.5.03-.75.05-.25.13-.48.25-.68.13-.2.3-.38.5-.5.2-.13.43-.21.68-.25.25-.04.5-.03.75.03.25.06.5.18.75.33.25.15.48.33.68.55.2.22.35.48.45.75.1.28.13.55.1.83-.03.28-.13.55-.28.8-.15.25-.35.48-.58.65-.23.18-.4.3-.5.38-.1.08-.15.14-.2.2-.05.06-.08.1-.08.13s0 .05.03.08c.03.03.05.05.08.08.25.25.5.5.75.75s.5.5.75.75c.03.03.05.05.08.08.03.03.05.05.08.08s.05.03.08.03.08-.03.13-.08c.05-.05.1-.13.2-.2.08-.08.2-.2.38-.5.18-.3.4-.55.65-.8.25-.25.5-.45.75-.58.28-.15.55-.25.83-.28.28-.03.55.03.8.1.28.08.53.2.75.35.22.15.4.35.55.55.15.2.28.43.33.68zM12 2a10 10 0 100 20 10 10 0 000-20zm0 18.13c-4.48 0-8.13-3.65-8.13-8.13S7.52 3.88 12 3.88c4.48 0 8.13 3.65 8.13 8.13s-3.65 8.12-8.13 8.12z" />
    </svg>
);


function MustDoItem({ item, onUpdate, onDelete }: { item: MustDo, onUpdate: (id: string, data: Partial<MustDo>) => void, onDelete: (id: string) => void }) {
  const [title, setTitle] = useState(item.title);
  const [note, setNote] = useState(item.note || '');
  const [deadline, setDeadline] = useState(item.deadline ? new Date(item.deadline) : undefined);
  const [reminderDays, setReminderDays] = useState(1);

  useEffect(() => {
    setReminderDays(item.reminderDaysBefore || 1)
  }, [item.reminderDaysBefore]);
  
  const priority = item.priority || 'medium';
  const reminderType = item.reminderType || 'none';

  const handleBlur = (field: 'title' | 'note') => {
    const value = field === 'title' ? title : note;
    if (value !== item[field]) {
      onUpdate(item.id, { [field]: value });
    }
  };
  
  const handleReminderDaysBlur = () => {
    const numericValue = Number.isFinite(reminderDays) ? reminderDays : 1;
    if (numericValue !== item.reminderDaysBefore) {
      onUpdate(item.id, { reminderDaysBefore: numericValue });
    }
  };

  const handleDeadlineChange = (date: Date | undefined) => {
    setDeadline(date);
    onUpdate(item.id, { deadline: date ? date.toISOString().split('T')[0] : '' });
  };
  
  const handleReminderTypeChange = (type: MustDo['reminderType']) => {
    onUpdate(item.id, { reminderType: type });
  };

  const handleReminderToggle = (checked: boolean) => {
    if (checked) {
        if (reminderType === 'none') {
            handleReminderTypeChange('email');
        }
    } else {
        handleReminderTypeChange('none');
    }
  }

  const ReminderIcon = {
      email: Mail,
      sms: MessageSquare,
      whatsapp: WhatsappIcon,
      none: BellOff,
  }[reminderType] || Bell;

  return (
    <div className="flex flex-col p-3 border-b border-border/20 last:border-b-0">
      <div className="flex items-start gap-3">
        <Checkbox
          id={`mustdo-${item.id}`}
          checked={item.status === 'done'}
          onCheckedChange={(checked) => onUpdate(item.id, { status: checked ? 'done' : 'todo' })}
          className="mt-1 border-foreground/50"
        />
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
              <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => handleBlur('title')}
              className={cn(
                  "h-auto p-0 border-0 focus-visible:ring-0 text-base bg-transparent flex-grow placeholder:text-foreground/60",
                  item.status === 'done' && "line-through text-muted-foreground"
              )}
              readOnly={item.status === 'done'}
              placeholder="New must-do..."
              />
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-auto p-1 flex items-center gap-1 text-foreground/80 hover:bg-white/10 hover:text-foreground">
                          <PriorityIcon priority={priority} />
                          <span>{PriorityLevels[priority].label}</span>
                      </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => onUpdate(item.id, { priority: 'low' })}>
                              <ArrowDown className="mr-2 h-4 w-4 text-green-500" /> Low
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onUpdate(item.id, { priority: 'medium' })}>
                              <ArrowRight className="mr-2 h-4 w-4 text-yellow-500" /> Medium
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onUpdate(item.id, { priority: 'high' })}>
                              <ArrowUp className="mr-2 h-4 w-4 text-red-500" /> High
                          </DropdownMenuItem>
                      </DropdownMenuContent>
                  </DropdownMenu>

                  <Popover>
                      <PopoverTrigger asChild>
                          <Button
                          variant={"ghost"}
                          size="sm"
                          className={cn(
                              "h-auto p-1 text-foreground/80 hover:bg-white/10 hover:text-foreground",
                              !deadline && "text-muted-foreground"
                          )}
                          >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {deadline ? format(deadline, "PPP") : <span>Set deadline</span>}
                          </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                          <Calendar
                          mode="single"
                          selected={deadline}
                          onSelect={handleDeadlineChange}
                          initialFocus
                          />
                      </PopoverContent>
                  </Popover>

              </div>
          </div>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onBlur={() => handleBlur('note')}
            placeholder="Add a note..."
            rows={1}
            className={cn(
              "h-auto p-0 border-0 focus-visible:ring-0 text-sm text-muted-foreground min-h-[20px] bg-transparent placeholder:text-foreground/50",
              "read-only:cursor-default read-only:bg-transparent"
            )}
            readOnly={item.status === 'done'}
          />
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-foreground/80 hover:bg-white/10 hover:text-foreground" onClick={() => onDelete(item.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      {deadline && (
        <div className="pl-8 pt-2 flex items-center gap-4">
             <div className="flex items-center space-x-2">
                <Switch 
                    id={`reminder-switch-${item.id}`}
                    checked={reminderType !== 'none'}
                    onCheckedChange={handleReminderToggle}
                />
                <Label htmlFor={`reminder-switch-${item.id}`} className="text-sm text-muted-foreground">Reminders</Label>
            </div>

            {reminderType !== 'none' && (
                <>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="flex items-center gap-2">
                            <ReminderIcon className="h-4 w-4" />
                            <span>{reminderType.charAt(0).toUpperCase() + reminderType.slice(1)}</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleReminderTypeChange('email')}>
                            <Mail className="mr-2 h-4 w-4" /> Email
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleReminderTypeChange('sms')}>
                            <MessageSquare className="mr-2 h-4 w-4" /> SMS
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleReminderTypeChange('whatsapp')}>
                            <WhatsappIcon className="mr-2 h-4 w-4" /> WhatsApp
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <div className="flex items-center gap-2">
                    <Input 
                        type="number" 
                        min="1"
                        value={reminderDays}
                        onChange={(e) => {
                            const value = parseInt(e.target.value, 10);
                            setReminderDays(Number.isFinite(value) ? value : 1);
                        }}
                        onBlur={handleReminderDaysBlur}
                        className="h-9 w-16 text-center"
                    />
                    <Label className="text-sm text-muted-foreground">days before</Label>
                </div>
                </>
            )}
        </div>
      )}
    </div>
  );
}

export function MustDos({ budgetId, budgetRef, isTemplateMode = false, mustDos, eventType }: MustDosProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const [localMustDos, setLocalMustDos] = useState<MustDo[]>([]);
  const [isLoading, setIsLoading] = useState(!isTemplateMode && !mustDos);
  const [isSuggesting, startSuggestionTransition] = useTransition();
  const { toast } = useToast();


  useEffect(() => {
    if (!isTemplateMode) return;
    
    setLocalMustDos(prev => {
        if (prev.length > 0) return prev; // Already initialized
        return [
            {
              id: 'local-1',
              budgetId,
              userId: '',
              title: 'Confirm venue access time',
              note: 'Key collection is with security',
              status: 'todo',
              priority: 'high',
              deadline: new Date().toISOString().split('T')[0],
              createdAt: new Date(),
              reminderType: 'email',
              reminderDaysBefore: 3,
            },
            {
              id: 'local-2',
              budgetId,
              userId: '',
              title: 'Pick up decorations',
              note: '',
              status: 'todo',
              priority: 'medium',
              deadline: '',
              createdAt: new Date(),
              reminderType: 'none',
              reminderDaysBefore: 1,
            }
        ];
    });
  }, [isTemplateMode, budgetId]);

  useEffect(() => {
    if (mustDos !== null) {
      setIsLoading(false);
    }
  }, [mustDos]);


  const items = useMemo(() => {
    const serverItems = mustDos || [];
    const allItems = isTemplateMode ? localMustDos : serverItems;
    
    return [...allItems].sort((a, b) => {
        // Primary sort: by priority
        const priorityA = a.priority || 'medium';
        const priorityB = b.priority || 'medium';
        if (PriorityLevels[priorityA].order < PriorityLevels[priorityB].order) return -1;
        if (PriorityLevels[priorityA].order > PriorityLevels[priorityB].order) return 1;

        // Secondary sort: by status (todo before done)
        if (a.status === 'todo' && b.status === 'done') return -1;
        if (a.status === 'done' && b.status === 'todo') return 1;
  
        // Tertiary sort: by deadline (earlier dates first)
        const dateA = a.deadline ? new Date(a.deadline).getTime() : Infinity;
        const dateB = b.deadline ? new Date(b.deadline).getTime() : Infinity;
        if (dateA < dateB) return -1;
        if (dateA > dateB) return 1;
  
        // Final sort: by creation time (newest first)
        const aTime = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
        const bTime = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
        return bTime - aTime;
      });
  }, [mustDos, isTemplateMode, localMustDos]);

  const completedCount = useMemo(() => items.filter(item => item.status === 'done').length, [items]);
  const progress = items.length > 0 ? (completedCount / items.length) * 100 : 0;

  const handleAddItem = () => {
    const mustDosCollection = budgetRef ? collection(budgetRef, 'mustDos') : null;

    if (isTemplateMode || !user || !mustDosCollection) {
        const newItem: MustDo = {
            id: `local-${Date.now()}`,
            budgetId,
            userId: '',
            title: '',
            status: 'todo',
            priority: 'medium',
            deadline: '',
            createdAt: new Date(),
            reminderType: 'none',
            reminderDaysBefore: 1,
        };
        setLocalMustDos(prev => [newItem, ...prev]);
        return;
    };
    
    const newItem: Omit<MustDo, 'id' > & { deadline?: string } = {
      budgetId,
      userId: user.uid,
      title: '',
      status: 'todo',
      priority: 'medium',
      createdAt: serverTimestamp(),
      reminderType: 'none',
      reminderDaysBefore: 1,
    };
    addDocumentNonBlocking(mustDosCollection, newItem);
  };

  const handleUpdateItem = (id: string, data: Partial<MustDo>) => {
     const mustDosCollection = budgetRef ? collection(budgetRef, 'mustDos') : null;
    if (isTemplateMode) {
      setLocalMustDos(prev => prev.map(item => item.id === id ? { ...item, ...data } : item));
      return;
    }
    if (!user || !mustDosCollection) return;
    const docRef = doc(mustDosCollection, id);
    updateDocumentNonBlocking(docRef, data);
  };

  const handleDeleteItem = (id: string) => {
    const mustDosCollection = budgetRef ? collection(budgetRef, 'mustDos') : null;
    if (isTemplateMode) {
      setLocalMustDos(prev => prev.filter(item => item.id !== id));
      return;
    }
    if (!user || !mustDosCollection) return;
    const docRef = doc(mustDosCollection, id);
    deleteDocument(docRef);
  };

  const handleSuggestMustDos = () => {
    if (!eventType) {
      toast({ variant: 'destructive', title: 'Cannot suggest tasks', description: 'Event type is not set.' });
      return;
    }
    if (isTemplateMode) {
        toast({ title: 'Sign up to use AI features', description: 'AI suggestions are available for saved plans.'});
        return;
    }

    startSuggestionTransition(async () => {
      try {
        const existingTitles = items.map(item => item.title);
        const result = await suggestMustDos({ eventType, existingTitles });
        
        if (result.suggestions.length > 0 && budgetRef && user && firestore) {
          const batch = writeBatch(firestore);
          result.suggestions.forEach(suggestion => {
            const docRef = doc(collection(budgetRef, 'mustDos'));
            const newMustDo: Omit<MustDo, 'id' | 'createdAt'> = {
              budgetId,
              userId: user.uid,
              title: suggestion.title,
              note: suggestion.note,
              status: 'todo',
              priority: 'medium',
              reminderType: 'none',
              reminderDaysBefore: 1,
            };
            batch.set(docRef, { ...newMustDo, createdAt: serverTimestamp() });
          });
          await batch.commit();
          toast({ title: 'AI Suggestions Added!', description: `${result.suggestions.length} new tasks have been added to your list.` });
        } else {
            toast({ title: 'No new suggestions', description: 'The AI could not find any new tasks to suggest at this time.' });
        }
      } catch (error) {
        console.error("Error getting AI suggestions:", error);
        toast({ variant: 'destructive', title: 'AI Suggestion Failed', description: 'Could not get suggestions from the AI. Please try again.' });
      }
    });
  };


  return (
    <Card className="h-full bg-card/50 text-card-foreground shadow-lg backdrop-blur-xl border-white/20">
      <CardHeader className="p-4">
        <CardTitle className="font-headline text-2xl">Must-Do's</CardTitle>
        <CardDescription className="text-foreground/80">The things that make your event run smoothly. Add what matters most to you.</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-2">
          <div className="flex items-center gap-4 text-sm font-medium text-foreground/90">
            <span>{completedCount} of {items.length} completed</span>
            <Progress value={progress} className="w-full h-2 bg-white/20" />
          </div>

          <div className="border border-border/20 rounded-lg overflow-hidden bg-white/5">
            {items.map(item => (
              <MustDoItem key={item.id} item={item} onUpdate={handleUpdateItem} onDelete={handleDeleteItem} />
            ))}
            {items.length === 0 && !isLoading && (
              <p className="text-muted-foreground text-center p-8">No must-dos yet. Add one to get started!</p>
            )}
            {isLoading && (
                 <p className="text-muted-foreground text-center p-8">Loading must-dos...</p>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2 pt-2">
            <Button variant="outline" onClick={() => handleAddItem()} className="bg-white/10 hover:bg-white/20 border-white/30">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add a Must-Do
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
