
'use client';

import type { SuggestMustDosOutput } from '@/ai/flows/schemas';
import { Button } from './ui/button';
import { Plus, X } from 'lucide-react';

interface SuggestionListProps {
    suggestions: SuggestMustDosOutput['suggestions'];
    onAdd: (suggestion: SuggestMustDosOutput['suggestions'][number]) => void;
    onDismiss: (title: string) => void;
}

export function SuggestionList({ suggestions, onAdd, onDismiss }: SuggestionListProps) {
    if (suggestions.length === 0) {
        return null;
    }

    return (
        <div className="mt-4 space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground">AI Suggestions:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {suggestions.map((suggestion) => (
                    <div key={suggestion.title} className="bg-background/80 p-3 rounded-lg border border-border/50 shadow-sm flex flex-col justify-between">
                        <div>
                            <p className="font-semibold">{suggestion.title}</p>
                            <p className="text-sm text-muted-foreground mt-1">{suggestion.note}</p>
                        </div>
                        <div className="flex items-center justify-end gap-2 mt-3">
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => onDismiss(suggestion.title)}>
                                <X className="h-4 w-4"/>
                            </Button>
                            <Button size="sm" variant="outline" className="h-7" onClick={() => onAdd(suggestion)}>
                                <Plus className="mr-1 h-4 w-4" />
                                Add
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
