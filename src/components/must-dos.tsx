
'use client';

import { useState, useMemo, useEffect, ComponentType } from 'react';
import { useUser, useFirestore, addMustDo, addMustDosBatch, updateDocumentNonBlocking, deleteDocument } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import type { MustDo } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { PlusCircle, Trash2, BellOff, Flag, ArrowDown, ArrowRight, ArrowUp, Mail, MessageSquare, Sparkles, Loader2, CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DocumentReference } from 'firebase/firestore';
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { format } from 'date-fns';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { suggestMustDos } from '@/ai/flows/suggest-must-dos-flow';
import { useToast } from '@/hooks/use-toast';
import { scoreByPriority, type ScoredSuggestion } from '@/ai/flows/score-suggestions-flow';

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
        <path d="M16.75 13.96c.25.13.4.38.48.63.08.25.11.5.08.75-.03.25-.11.48-.25.7-.13.21-.3.38-.5.5-.2.13-.43.21-.68.25-.25.04-.5.03-.75-.03-.25-.06-.5-.18-.75-.33a10.66 10.66 0 01-3.6-2.04c-1.25-1.25-2.04-2.63-2.38-4.08-.03-.25-.03-.5.03-.75.05-.25.13-.48.25-.68.13-.2.3-.38-.5.5.2-.13-.43-.21-.68-.25.25-.04.5-.03.75.03.25.06.5.18.75.33.25.15.48.33.68.55.2.22.35.48.45.75.1.28.13.55.1.83-.03.28-.13.55-.28.8-.15.25-.35.48-.58.65-.23.18-.4.3-.5.38-.1.08-.15.14-.2.2-.05.06-.08.1-.08.13s0 .05.03.08c.03.03.05.05.08.08.25.25.5.5.75.75s.5.5.75.75c.03.03.05.05.08.08.03.03.05.05.08.08s.05.03.08.03.08-.03.13-.08c.05-.05.1-.13.2-.2.08-.08.2-.2.38-.5.18-.3.4-.55.65-.8.25-.25.5-.45.75-.58.28-.15.55-.25.83-.28.28-.03.55.03.8.1.28.08.53.2.75.35.22.15.4.35.55.55.15.2.28.43.33.68zM12 2a10 10 0 100 20 10 10 0 000-20zm0 18.13c-4.48 0-8.13-3.65-8.13-8.13S7.52 3.88 12 3.88c4.48 0 8.13 3.65 8.13 8.13s-3.65 8.12-8.13 8.12z" />
    </svg>
);

function MustDoItem({ item, onUpdate, onDelete }: { item: MustDo, onUpdate: (id: string, data: Partial<MustDo>) => void, onDelete: (id: string) => void }) {
  const [title, setTitle] = useState(item.title);
  const [note, setNote] = useState(item.note || '');
  const [deadline, setDeadline] = useState(item.deadline ? new Date(item.deadline) : undefined);
  const [reminderDays, setReminderDays] = useState(item.reminderDaysBefore || 1);

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
    handleReminderTypeChange(checked ? (item.reminderType === 'none' ? 'email' : item.reminderType) : 'none');
  }

  const ReminderIcon = {
      email: Mail,
      sms: MessageSquare,
      whatsapp: WhatsappIcon,
      none: BellOff,
  }[item.reminderType || 'none'] || BellOff;

  return (
    <div className="flex flex-col p-3 border-b border-border/20 last:border-b-0">
      <div className="flex items-start gap-3">
        <Checkbox
          id={`mustdo-${item.id}`}
          checked={item.status === 'done'}
          onCheckedChange={(checked) => onUpdate(item.id, { status: checked ? 'done' : 'todo' })}
          className="mt-1 border-foreground/50"
        />
        <div className="flex-1 space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => handleBlur('title')}
              className={cn(
                  "h-auto p-0 border-0 focus-visible:ring-0 text-base bg-transparent flex-grow font-bold placeholder:font-bold placeholder:text-foreground/60 min-w-[120px]",
                  item.status === 'done' && "line-through text-muted-foreground"
              )}
              readOnly={item.status === 'done'}
              placeholder="New must-do..."
              />
              <div className="flex items-center gap-2 text-xs text-muted-foreground ml-auto">
                  <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-auto w-auto p-1 flex justify-start items-center gap-1 text-foreground/80 hover:bg-white/10 hover:text-foreground">
                          <PriorityIcon priority={item.priority || 'medium'} />
                          <span className="w-14 text-left">{PriorityLevels[item.priority || 'medium'].label}</span>
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
                          {deadline ? format(deadline, "dd-MMM-yyyy") : <span>Set deadline</span>}
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
                    checked={item.reminderType !== 'none'} 
                    onCheckedChange={handleReminderToggle} 
                />
                <Label htmlFor={`reminder-switch-${item.id}`} className="text-sm text-muted-foreground">Reminders</Label>
            </div>
            {item.reminderType !== 'none' && (
                <>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon" className="h-8 w-8">
                              <ReminderIcon className="h-4 w-4" />
                          </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="min-w-0 w-auto">
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
                            onChange={(e) => setReminderDays(parseInt(e.target.value, 10) || 1)}
                            onBlur={handleReminderDaysBlur}
                            className="h-9 w-16 text-center" />
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
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<ScoredSuggestion[] | null>(null);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const items = useMemo(() => {
    const allItems = isTemplateMode ? localMustDos : (mustDos || []);
    return [...allItems].sort((a, b) => {
        if (a.status === 'todo' && b.status === 'done') return -1;
        if (a.status === 'done' && b.status === 'todo') return 1;
        const priorityA = a.priority || 'medium';
        const priorityB = b.priority || 'medium';
        if (PriorityLevels[priorityA].order !== PriorityLevels[priorityB].order) {
            return PriorityLevels[priorityA].order - PriorityLevels[priorityB].order;
        }
        const aTime = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
        const bTime = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
        return bTime - aTime;
    });
  }, [mustDos, isTemplateMode, localMustDos]);

  const completedCount = items.filter(item => item.status === 'done').length;
  const progress = items.length > 0 ? (completedCount / items.length) * 100 : 0;

  const handleAddItem = () => {
    if (isTemplateMode || !user || !firestore) {
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
    const ownerId = budgetRef?.path.split('/')[1] || user.uid;
    addMustDo(firestore, ownerId, budgetId, '');
  };

  const handleUpdateItem = (id: string, data: Partial<MustDo>) => {
    if (isTemplateMode) {
      setLocalMustDos(prev => prev.map(item => item.id === id ? { ...item, ...data } : item));
      return;
    }
    if (!budgetRef) return;
    updateDocumentNonBlocking(doc(collection(budgetRef, 'mustDos'), id), data);
  };

  const handleDeleteItem = (id: string) => {
    if (isTemplateMode) {
      setLocalMustDos(prev => prev.filter(item => item.id !== id));
      return;
    }
    if (!budgetRef) return;
    deleteDocument(doc(collection(budgetRef, 'mustDos'), id));
  };

  const handleGetSuggestions = async () => {
    const effectiveEventType = eventType || 'Celebration';
    
    setIsSuggesting(true);
    try {
      const existingTitles = items.map(item => item.title);
      console.log('Requesting suggestions for event type:', effectiveEventType);
      
      const result = await suggestMustDos({ eventType: effectiveEventType, existingTitles });
      
      if (result.suggestions && result.suggestions.length > 0) {
        const scored = scoreByPriority(result.suggestions);
        setSuggestions(scored.sort((a, b) => b.score - a.score));
        setSelectedSuggestions({});
      } else {
        toast({ title: "No suggestions", description: "The AI couldn't find new relevant tasks right now." });
      }
    } catch (error) {
      console.error('AI Suggestion Error in UI:', error);
      toast({ variant: "destructive", title: "AI Error", description: "Failed to generate suggestions. Please try again." });
    } finally { 
      setIsSuggesting(false); 
    }
  };

  const handleAddSuggestions = () => {
    const titles = Object.keys(selectedSuggestions).filter(t => selectedSuggestions[t]);
    if (!titles.length) return;
    if (isTemplateMode) {
        titles.forEach(t => {
            const newItem: MustDo = { id: `ai-${Date.now()}-${t}`, budgetId, userId: '', title: t, status: 'todo', priority: 'medium', deadline: '', createdAt: new Date(), reminderType: 'none', reminderDaysBefore: 1 };
            setLocalMustDos(prev => [newItem, ...prev]);
        });
    } else if (user && budgetRef) {
        const ownerId = budgetRef.path.split('/')[1] || user.uid;
        addMustDosBatch(firestore, ownerId, budgetId, titles);
    }
    setSuggestions(null);
    toast({ title: "Tasks Added", description: `${titles.length} tasks added to your plan.` });
  };

  return (
    <>
      <Card className="h-full bg-card/50 text-card-foreground shadow-lg backdrop-blur-xl border-white/20">
        <CardHeader className="p-4">
          <CardTitle className="font-headline text-2xl">Must-Do's</CardTitle>
          <CardDescription className="text-foreground/80">Critical tasks to ensure your event runs smoothly.</CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-sm font-medium text-foreground/90">
              <span className="shrink-0">{completedCount} of {items.length} completed</span>
              <Progress value={progress} className="w-full h-2 bg-white/20" />
            </div>
            <div className="border border-border/20 rounded-lg overflow-hidden bg-white/5">
              {items.map(item => ( <MustDoItem key={item.id} item={item} onUpdate={handleUpdateItem} onDelete={handleDeleteItem} /> ))}
              {items.length === 0 && <p className="text-muted-foreground text-center p-8">Your list is empty.</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={handleAddItem} className="bg-white/10 hover:bg-white/20 border-white/30">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Task
              </Button>
              <Button variant="outline" onClick={handleGetSuggestions} disabled={isSuggesting} className="bg-white/10 hover:bg-white/20 border-white/30">
                  {isSuggesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Suggest with AI
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <Dialog open={!!suggestions} onOpenChange={(open) => !open && setSuggestions(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>AI Planning Assistant</DialogTitle>
            <DialogDescription>Select tasks to add to your {eventType?.toLowerCase() || 'celebration'} plan.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2 max-h-[400px] overflow-y-auto">
            {suggestions?.map((s, i) => (
              <div key={i} className="flex items-start space-x-3 p-3 rounded-md hover:bg-muted/50 border border-transparent hover:border-border transition-colors">
                <Checkbox id={`s-${i}`} checked={!!selectedSuggestions[s.title]} onCheckedChange={(c) => setSelectedSuggestions(p => ({...p, [s.title]: !!c}))} className="mt-1" />
                <label htmlFor={`s-${i}`} className="text-sm font-medium leading-none cursor-pointer flex-1">
                    {s.title} {s.score > 0.8 && <span className="ml-2 text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full uppercase font-bold">Highly Relevant</span>}
                </label>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSuggestions(null)}>Cancel</Button>
            <Button onClick={handleAddSuggestions} className="font-bold">Add Selected ({Object.values(selectedSuggestions).filter(Boolean).length})</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
