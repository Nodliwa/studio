'use client';

import { useState, useMemo, useEffect } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocument } from '@/firebase';
import { collection, doc, orderBy, query, serverTimestamp } from 'firebase/firestore';
import type { MustDo, Importance, Timing } from '@/lib/types';
import { ImportanceLevels, TimingOptions } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { PlusCircle, Star, Trash2, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';
import type { DocumentReference } from 'firebase/firestore';

interface MustDosProps {
  budgetId: string;
  budgetRef: DocumentReference | null;
  isTemplateMode?: boolean;
}

function MustDoItem({ item, onUpdate, onDelete }: { item: MustDo, onUpdate: (id: string, data: Partial<MustDo>) => void, onDelete: (id: string) => void }) {
  const [title, setTitle] = useState(item.title);
  const [note, setNote] = useState(item.note || '');

  const handleBlur = (field: 'title' | 'note') => {
    const value = field === 'title' ? title : note;
    if (value !== item[field]) {
      onUpdate(item.id, { [field]: value });
    }
  };

  const ImportanceIcon = ({ importance }: { importance: Importance }) => {
    if (importance === 'none') return null;
    const level = ImportanceLevels[importance];
    return <Star className={cn("h-4 w-4", level.color, importance !== 'none' && 'fill-current')} />;
  };

  return (
    <div className="flex items-start gap-3 p-3 border-b last:border-b-0">
      <Checkbox
        id={`mustdo-${item.id}`}
        checked={item.status === 'done'}
        onCheckedChange={(checked) => onUpdate(item.id, { status: checked ? 'done' : 'todo' })}
        className="mt-1"
      />
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
            <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => handleBlur('title')}
            className={cn(
                "h-auto p-0 border-0 focus-visible:ring-0 text-base bg-transparent flex-grow",
                item.status === 'done' && "line-through text-muted-foreground"
            )}
            readOnly={item.status === 'done'}
            placeholder="New must-do..."
            />
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-auto p-1 flex items-center gap-1">
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

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-auto p-1">{TimingOptions[item.timing]}</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                    {Object.entries(TimingOptions).map(([key, label]) => (
                        <DropdownMenuItem key={key} onSelect={() => onUpdate(item.id, { timing: key as Timing })}>
                        {label}
                        </DropdownMenuItem>
                    ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onBlur={() => handleBlur('note')}
          placeholder="Add a note..."
          rows={1}
          className={cn(
            "h-auto p-0 border-0 focus-visible:ring-0 text-sm text-muted-foreground min-h-[20px] bg-transparent",
            "read-only:cursor-default read-only:bg-transparent"
          )}
          readOnly={item.status === 'done'}
        />
      </div>
      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => onDelete(item.id)}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function MustDos({ budgetId, budgetRef, isTemplateMode = false }: MustDosProps) {
  const { user } = useUser();
  const firestore = useFirestore();

  const mustDosCollection = useMemoFirebase(() => (
    !isTemplateMode && user && budgetRef ? collection(budgetRef, 'mustDos') : null
  ), [isTemplateMode, user, budgetRef]);

  const mustDosQuery = useMemoFirebase(() => (
    mustDosCollection ? query(mustDosCollection, orderBy('createdAt', 'desc')) : null
  ), [mustDosCollection]);

  const { data: mustDos, isLoading } = useCollection<MustDo>(mustDosQuery);
  const [localMustDos, setLocalMustDos] = useState<MustDo[]>([]);

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
          timing: 'before-event',
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
          timing: 'on-the-day',
          createdAt: new Date(),
        }
      ]);
    }
  }, [isTemplateMode, budgetId, localMustDos.length]);


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
    if (!user || !mustDosCollection) {
        // Handle local update for template mode
        const newItem: MustDo = {
            id: `local-${Date.now()}`,
            budgetId,
            userId: '',
            title: '',
            note: '',
            status: 'todo',
            importance: 'none',
            timing: 'anytime',
            createdAt: new Date()
        };
        setLocalMustDos(prev => [newItem, ...prev]);
        return;
    };
    
    const newItem: Omit<MustDo, 'id'> = {
      budgetId,
      userId: user.uid,
      title: '',
      note: '',
      status: 'todo',
      importance: 'none',
      timing: 'anytime',
      createdAt: serverTimestamp()
    };
    addDocumentNonBlocking(mustDosCollection, newItem);
  };

  const handleUpdateItem = (id: string, data: Partial<MustDo>) => {
    if (isTemplateMode) {
      setLocalMustDos(prev => prev.map(item => item.id === id ? { ...item, ...data } : item));
      return;
    }
    if (!user || !mustDosCollection) return;
    const docRef = doc(mustDosCollection, id);
    updateDocumentNonBlocking(docRef, data);
  };

  const handleDeleteItem = (id: string) => {
    if (isTemplateMode) {
      setLocalMustDos(prev => prev.filter(item => item.id !== id));
      return;
    }
    if (!user || !mustDosCollection) return;
    const docRef = doc(mustDosCollection, id);
    deleteDocument(docRef);
  };

  return (
    <Card className="shadow-lg border-border/60 h-full">
      <CardHeader className="p-4">
        <CardTitle className="font-headline text-2xl">Must-Dos</CardTitle>
        <CardDescription>The things that make your event run smoothly. Add what matters most to you.</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-2">
          <div className="flex items-center gap-4 text-sm font-medium">
            <span>{completedCount} of {items.length} completed</span>
            <Progress value={progress} className="w-full h-2" />
          </div>

          <div className="border rounded-lg overflow-hidden">
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
          
          <Button variant="outline" onClick={handleAddItem} className="w-full">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add a Must-Do
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
