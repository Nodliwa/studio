
'use client';

import { useState, useMemo, useEffect, ComponentType } from 'react';
import { useUser, useFirestore, addMustDo, addMustDosBatch, updateDocumentNonBlocking, deleteDocument } from '@/firebase';
import { collection, doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import type { MustDo } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { PlusCircle, Trash2, BellOff, Flag, ArrowDown, ArrowRight, ArrowUp, Mail, MessageSquare, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DocumentReference } from 'firebase/firestore';
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { suggestMustDos } from '@/ai/flows/suggest-must-dos-flow';
import { useToast } from '@/hooks/use-toast';
import { scoreSuggestions, type ScoredSuggestion } from '@/ai/flows/score-suggestions-flow';


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
  }[reminderType] || BellOff;

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
                          <PriorityIcon priority={priority} />
                          <span className="w-14 text-left">{PriorityLevels[priority].label}</span>
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
                    checked={reminderType !== 'none'} 
                    onCheckedChange={handleReminderToggle} 
                />
                <Label htmlFor={`reminder-switch-${item.id}`} className="text-sm text-muted-foreground">Reminders</Label>
            </div>
            {reminderType !== 'none' && (
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
                            onChange={(e) => {
                                const value = parseInt(e.target.value, 10);
                                setReminderDays(Number.isFinite(value) ? value : 1);
                            }}
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
  const [isLoading, setIsLoading] = useState(!isTemplateMode && !mustDos);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<ScoredSuggestion[] | null>(null);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  useEffect(() => {
    if (mustDos) {
      setIsLoading(false);
    }
  }, [mustDos]);


  const items = useMemo(() => {
    const serverItems = mustDos || [];
    const allItems = isTemplateMode ? localMustDos : serverItems;
    
    return [...allItems].sort((a, b) => {
        // Primary sort: status (todo before done)
        if (a.status === 'todo' && b.status === 'done') return -1;
        if (a.status === 'done' && b.status === 'todo') return 1;

        // Secondary sort: priority
        const priorityA = a.priority || 'medium';
        const priorityB = b.priority || 'medium';
        if (PriorityLevels[priorityA].order < PriorityLevels[priorityB].order) return -1;
        if (PriorityLevels[priorityA].order > PriorityLevels[priorityB].order) return 1;
  
        // Tertiary sort: deadline (earlier dates first)
        const dateA = a.deadline ? new Date(a.deadline).getTime() : Infinity;
        const dateB = b.deadline ? new Date(b.deadline).getTime() : Infinity;
        if (dateA < dateB) return -1;
        if (dateA > dateB) return 1;
  
        // Final sort: creation time (newest first)
        const aTime = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
        const bTime = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
        return bTime - aTime;
      });
  }, [mustDos, isTemplateMode, localMustDos]);

  const completedCount = useMemo(() => items.filter(item => item.status === 'done').length, [items]);
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
    if (!user || !budgetRef || !firestore) return;
    
    const mustDosCollection = collection(budgetRef, 'mustDos');
    const docRef = doc(mustDosCollection, id);
    updateDocumentNonBlocking(docRef, data);
  };

  const handleDeleteItem = (id: string) => {
    if (isTemplateMode) {
      setLocalMustDos(prev => prev.filter(item => item.id !== id));
      return;
    }
    if (!user || !budgetRef || !firestore) return;
    
    const mustDosCollection = collection(budgetRef, 'mustDos');
    const docRef = doc(mustDosCollection, id);
    deleteDocument(docRef);
  };

  const handleGetSuggestions = async () => {
    if (!eventType) {
      toast({
        variant: "destructive",
        title: "Cannot get suggestions",
        description: "Please set an event type first (e.g., Wedding, Funeral) in the event details.",
      });
      return;
    }
  
    setIsSuggesting(true);
    setSuggestions(null);
  
    try {
      const existingTitles = items.map(item => item.title);
      console.log(`Requesting suggestions for ${eventType} avoiding:`, existingTitles);
      
      const result = await suggestMustDos({ eventType, existingTitles });
  
      if (result.suggestions && result.suggestions.length > 0) {
        const titles = result.suggestions.map(s => s.title);
        const context = `Event type: ${eventType}. Existing tasks: ${existingTitles.join(', ')}`;
        const scored = await scoreSuggestions(titles, context);
        const sorted = scored.sort((a, b) => b.score - a.score);
  
        setSuggestions(sorted);
        setSelectedSuggestions({});
      } else {
        toast({
          title: "No new suggestions found",
          description: "The AI couldn't find any additional tasks for this celebration.",
        });
      }
    } catch (error) {
      console.error("AI Suggestion UI Error:", error);
      toast({
        variant: "destructive",
        title: "AI Error",
        description: "There was a problem communicating with the AI. Please try again.",
      });
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleAddSuggestions = () => {
    if (!suggestions || isTemplateMode || !user || !budgetRef || !firestore) {
      setSuggestions(null);
      return;
    }
  
    const selectedTitles = Object.keys(selectedSuggestions).filter(title => selectedSuggestions[title]);
    if (selectedTitles.length === 0) {
      toast({ title: "No items selected", description: "Please select at least one suggestion to add." });
      return;
    }
  
    const ownerId = budgetRef?.path.split('/')[1] || user.uid;
    
    try {
      addMustDosBatch(firestore, ownerId, budgetId, selectedTitles);
      toast({
        title: "Suggestions Added",
        description: `${selectedTitles.length} new Must-Do item(s) have been added.`,
      });
    } catch (error) {
      console.error("Error adding suggestions:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not add the selected suggestions.",
      });
    }
  
    setSuggestions(null);
  };

  const handleSuggestionSelectionChange = (title: string, isChecked: boolean) => {
    setSelectedSuggestions(prev => ({
      ...prev,
      [title]: isChecked,
    }));
  };

  return (
    <>
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
              {!isTemplateMode && (
                  <Button variant="outline" onClick={handleGetSuggestions} disabled={isSuggesting} className="bg-white/10 hover:bg-white/20 border-white/30 min-w-[160px]">
                      {isSuggesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                      {isSuggesting ? 'Thinking...' : 'Suggest with AI'}
                  </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!suggestions} onOpenChange={(open) => !open && setSuggestions(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ranked AI Suggestions</DialogTitle>
            <DialogDescription>
              Here are ranked suggestions for your {eventType?.toLowerCase()}. Select the ones you want to add.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {suggestions?.map((suggestion, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-md hover:bg-muted/50 border border-transparent hover:border-border transition-colors">
                <Checkbox
                  id={`suggestion-${index}`}
                  checked={!!selectedSuggestions[suggestion.title]}
                  onCheckedChange={(checked) => handleSuggestionSelectionChange(suggestion.title, !!checked)}
                  className="mt-1"
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor={`suggestion-${index}`}
                    className="text-sm font-medium leading-none flex items-center cursor-pointer"
                  >
                    {suggestion.title}
                    {suggestion.score > 0.8 && <span className="ml-2 text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full uppercase font-bold">🔥 Recommended</span>}
                  </label>
                  <p className="text-xs text-muted-foreground">Relevance: {Math.round(suggestion.score * 100)}%</p>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSuggestions(null)}>Cancel</Button>
            <Button onClick={handleAddSuggestions} className="font-bold">
              Add Selected ({Object.values(selectedSuggestions).filter(Boolean).length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
