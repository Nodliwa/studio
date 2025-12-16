
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useUser, useFirestore, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocument } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import type { MustDo, Importance } from '@/lib/types';
import { ImportanceLevels } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { PlusCircle, Star, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';
import type { DocumentReference } from 'firebase/firestore';
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

interface MustDosProps {
  budgetId: string;
  budgetRef: DocumentReference | null;
  eventType?: string;
  isTemplateMode?: boolean;
  mustDos: MustDo[] | null;
}

function MustDoItem({ item, onUpdate, onDelete }: { item: MustDo, onUpdate: (id: string, data: Partial<MustDo>) => void, onDelete: (id: string) => void }) {
  const [title, setTitle] = useState(item.title);
  const [note, setNote] = useState(item.note || '');
  const [deadline, setDeadline] = useState(item.deadline ? new Date(item.deadline) : undefined);

  const handleBlur = (field: 'title' | 'note') => {
    const value = field === 'title' ? title : note;
    if (value !== item[field]) {
      onUpdate(item.id, { [field]: value });
    }
  };

  const handleDeadlineChange = (date: Date | undefined) => {
    setDeadline(date);
    onUpdate(item.id, { deadline: date ? date.toISOString().split('T')[0] : '' });
  };

  const ImportanceIcon = ({ importance }: { importance: Importance }) => {
    if (importance === 'none') return null;
    const level = ImportanceLevels[importance];
    return <Star className={cn("h-4 w-4", level.color, importance !== 'none' && 'fill-current')} />;
  };

  return (
    <div className="flex items-start gap-3 p-3 border-b border-border/20 last:border-b-0">
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
                        <ImportanceIcon importance={item.importance} />
                        <span>{ImportanceLevels[item.importance].label}</span>
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                    {Object.entries(ImportanceLevels).map(([key, { label }]) => (
                        <DropdownMenuItem key={key} onSelect={() => onUpdate(item.id, { importance: key as Importance })}>
                        {label}
                        </DropdownMenuItem>
                    ))}
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
  );
}

export function MustDos({ budgetId, budgetRef, eventType = 'other', isTemplateMode = false, mustDos }: MustDosProps) {
  const { user } = useUser();
  const [localMustDos, setLocalMustDos] = useState<MustDo[]>([]);
  const [isLoading, setIsLoading] = useState(!isTemplateMode && !mustDos);

  useEffect(() => {
    if (isTemplateMode && localMustDos.length === 0) {
      setLocalMustDos([
        {
          id: 'local-1',
          budgetId,
          userId: '',
          title: 'Confirm venue access time',
          note: 'Key collection is with security',
          status: 'todo',
          importance: 'important',
          deadline: new Date().toISOString().split('T')[0],
          createdAt: new Date(),
        },
        {
          id: 'local-2',
          budgetId,
          userId: '',
          title: 'Pick up decorations',
          note: '',
          status: 'todo',
          importance: 'none',
          deadline: '',
          createdAt: new Date(),
        }
      ]);
    }
  }, [isTemplateMode, budgetId, localMustDos.length]);

  useEffect(() => {
    if (mustDos !== null) {
      setIsLoading(false);
    }
  }, [mustDos]);


  const items = useMemo(() => {
    const serverItems = mustDos || [];
    const allItems = isTemplateMode ? localMustDos : serverItems;
    
    // Sort logic: 'critical' first, then 'important', then by creation date. 'done' items last.
    return [...allItems].sort((a, b) => {
      if (a.status === 'done' && b.status !== 'done') return 1;
      if (a.status !== 'done' && b.status === 'done') return -1;
      
      const importanceOrder = { critical: 0, important: 1, none: 2 };
      if (importanceOrder[a.importance] !== importanceOrder[b.importance]) {
        return importanceOrder[a.importance] - importanceOrder[b.importance];
      }

      const aTime = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
      const bTime = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;

      return bTime - aTime;
    });
  }, [mustDos, isTemplateMode, localMustDos]);

  const completedCount = useMemo(() => items.filter(item => item.status === 'done').length, [items]);
  const progress = items.length > 0 ? (completedCount / items.length) * 100 : 0;

  const handleAddItem = () => {
    const mustDosCollection = budgetRef ? collection(budgetRef, 'mustDos') : null;
    
    const newItemData = {
        title: '',
        note: '',
        importance: 'none' as Importance,
        deadline: '',
    };

    if (isTemplateMode || !user || !mustDosCollection) {
        const newItem: MustDo = {
            id: `local-${Date.now()}`,
            budgetId,
            userId: '',
            status: 'todo',
            createdAt: new Date(),
            ...newItemData
        };
        setLocalMustDos(prev => [newItem, ...prev]);
        return;
    };
    
    const newItem: Omit<MustDo, 'id' | 'timing'> & { deadline?: string } = {
      budgetId,
      userId: user.uid,
      status: 'todo',
      createdAt: serverTimestamp(),
      ...newItemData,
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
          
          <div className="flex flex-wrap gap-2">
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
