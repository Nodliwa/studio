"use client";

import type { BudgetItem, BudgetCategory, Budget } from "@/lib/types";
import { formatCurrency, cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "./ui/button";
import {
  PlusCircle,
  UtensilsCrossed,
  Wheat,
  Carrot,
  Apple,
  Coffee,
  Handshake,
  Truck,
  Gem,
  Cake,
  Shirt,
  Drama,
  Hammer,
  Zap,
  CrossIcon,
  User,
  Users,
  Heart,
  X,
  ChevronDown,
  Search,
  CheckCircle2,
  Minus,
  Plus,
} from "lucide-react";
import React from "react";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface BudgetAccordionProps {
  categories: BudgetCategory[];
  onItemChange: (categoryPath: string[], itemIndex: number, field: keyof BudgetItem, value: string | number) => void;
  onAddItem: (categoryPath: string[]) => void;
  onDeleteItem: (categoryPath: string[], itemIndex: number) => void;
  onDeleteCategory: (categoryPath: string[]) => void;
  categoryPath?: string[];
  supplierRequests?: Budget['supplierRequests'];
  onFindSupplier?: (item: BudgetItem, itemTotal: number) => void;
  onMarkAsFound?: (itemId: string, leadId: string) => void;
  categoryProgress?: Record<string, Set<number>>;
  openCategories?: string[];
  onOpenChange?: (value: string[]) => void;
}

const iconMap: { [key: string]: React.ElementType } = {
  'refreshments': Coffee,
  'ref-m': Coffee,
  'meat': UtensilsCrossed,
  'meat-m': UtensilsCrossed,
  'starch': Wheat,
  'starch-m': Wheat,
  'vegetables': Carrot,
  'veg-m': Carrot,
  'fruit': Apple,
  'fruit-m': Apple,
  'catering': UtensilsCrossed,
  'service': Handshake,
  'logistics': Truck,
  'implements': Hammer,
  'imp-m': Hammer,
  'clothing': Shirt,
  'attire-m': Shirt,
  'cat-1': UtensilsCrossed,
  'cat-2': Wheat,
  'cat-3': Carrot,
  'cat-4': Apple,
  'cat-5': Coffee,
  'cat-6': CrossIcon,
  'cat-7': Handshake,
  'cat-8': Truck,
  'venue': Gem,
  'attire': Shirt,
  'bride': Gem,
  'groom': Shirt,
  'bridesmaids': Drama,
  'desserts': Cake,
  'umkhwetha': User,
  'intombi': Heart,
  'ikrwala': Shirt,
  'umama': User,
  'ubaba': User,
  'izibanzana': Users,
  'abadala': Users,
  'abesimame': Users,
  'abesilisa': Users,
  'amantombazane': Users,
  'abafana': Users,
  'utata': Handshake,
  'event-execution': Zap,
  'exe-m': Zap,
};

function countAllItems(cats: BudgetCategory[]): number {
  return cats.reduce((sum, cat) => {
    const direct = (cat.items || []).length;
    const nested = countAllItems(cat.subCategories || []);
    return sum + direct + nested;
  }, 0);
}

function countPricedItems(cats: BudgetCategory[]): number {
  return cats.reduce((sum, cat) => {
    const direct = (cat.items || []).filter(item => (item.unitPrice ?? 0) > 0).length;
    const nested = countPricedItems(cat.subCategories || []);
    return sum + direct + nested;
  }, 0);
}

const SortableCategory = ({
  category,
  onItemChange,
  onAddItem,
  onDeleteItem,
  onDeleteCategory,
  categoryPath = [],
  supplierRequests,
  onFindSupplier,
  onMarkAsFound,
  categoryProgress,
  openCategories,
}: { category: BudgetCategory } & Omit<BudgetAccordionProps, 'categories'>) => {
  const {
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const currentPath = [...categoryPath, category.id];
  const Icon = iconMap[category.id] || UtensilsCrossed;

  const isTopLevel = categoryPath.length === 0;
  const isOpen = isTopLevel && openCategories ? openCategories.includes(category.id) : false;
  const totalCount = countAllItems([category]);
  const touchedCount = categoryProgress?.[category.id]?.size ?? 0;

  const isComplete = totalCount > 0 && touchedCount >= totalCount;
  const isStarted  = touchedCount > 0 && !isComplete;

  const itemClassName = cn(
    "group/item mb-4 rounded-lg border-b-0 shadow-sm overflow-hidden transition-colors duration-200",
    isOpen
      ? "bg-white dark:bg-zinc-900 border-l-[3px] border-l-teal-500"
      : isComplete
        ? "bg-white dark:bg-zinc-900"
        : "bg-gray-50 dark:bg-zinc-950 pulse-border-teal"
  );

  return (
    <div ref={setNodeRef} style={style}>
      <AccordionItem value={category.id} className={itemClassName}>
        <AccordionTrigger className="px-3 py-1 hover:no-underline [&>svg]:hidden">
          <div className="flex items-center gap-1.5 w-full min-w-0">
            {/* Cancel (delete) */}
            <div onClick={(e) => e.stopPropagation()} className="-ml-2 shrink-0">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Category?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently remove the category "{category.name}" and all of its items. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDeleteCategory(currentPath)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            {/* Expand chevron */}
            <ChevronDown className="h-4 w-4 text-primary transition-transform duration-200 shrink-0 group-data-[state=open]/item:rotate-180" />

            {/* Category icon */}
            {Icon && <Icon className="h-4 w-4 text-primary/70 shrink-0" />}

            {/* Category name — takes all remaining space, truncates */}
            <span className="font-semibold text-sm text-left leading-none truncate flex-1 min-w-0">{category.name}</span>

            {/* Progress counter */}
            <span className={cn(
              "text-xs font-semibold shrink-0 px-1 rounded-sm",
              isComplete
                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                : "animate-pulse bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
            )}>
              {touchedCount}/{totalCount}
            </span>

            {/* Total */}
            <Badge variant="secondary" className="font-mono shrink-0 text-xs ml-auto min-w-[5rem] justify-end rounded-sm font-bold px-0 py-0">{formatCurrency(category.total)}</Badge>
          </div>
        </AccordionTrigger>

        <AccordionContent className="bg-card">
          {(category.items && category.items.length > 0) && (
            <div className="px-2 pt-1 pb-2 space-y-1.5">
              {category.items.map((item, itemIndex) => (
                <div key={item.id} className="rounded-lg border bg-background p-2 space-y-1.5">

                  {/* Name + delete */}
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      value={item.name}
                      onChange={(e) => onItemChange(currentPath, itemIndex, 'name', e.target.value)}
                      placeholder="Item name"
                      className="flex-1 h-7 text-xs font-bold text-foreground"
                    />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Item?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove "{item.name || 'this item'}" from your plan?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDeleteItem(currentPath, itemIndex)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>

                  {/* Metric + Quantity */}
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="space-y-0">
                      <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Metric</p>
                      <Input
                        type="text"
                        value={item.metric}
                        onChange={(e) => onItemChange(currentPath, itemIndex, 'metric', e.target.value)}
                        className="h-7 text-xs"
                      />
                    </div>
                    <div className="space-y-0">
                      <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Quantity</p>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 shrink-0"
                          onClick={() => onItemChange(currentPath, itemIndex, 'quantity', Math.max(0, (item.quantity || 0) - 1))}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity || ''}
                          onChange={(e) => onItemChange(currentPath, itemIndex, 'quantity', e.target.value)}
                          onFocus={(e) => e.target.select()}
                          className="h-7 text-xs text-center flex-1 min-w-0"
                          min="0"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 shrink-0"
                          onClick={() => onItemChange(currentPath, itemIndex, 'quantity', (item.quantity || 0) + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Unit Price + Total */}
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="space-y-0">
                      <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Unit Price</p>
                      <Input
                        type="number"
                        value={item.unitPrice || ''}
                        onChange={(e) => onItemChange(currentPath, itemIndex, 'unitPrice', e.target.value)}
                        onFocus={(e) => e.target.select()}
                        className="h-7 text-xs"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="space-y-0">
                      <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Total</p>
                      <div className="h-7 flex items-center px-2 rounded-md border bg-muted/50">
                        <span className="text-xs font-mono font-semibold">{formatCurrency(item.total)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Comments */}
                  <div className="space-y-0">
                    <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Comments</p>
                    <Textarea
                      value={item.comment}
                      onChange={(e) => onItemChange(currentPath, itemIndex, 'comment', e.target.value)}
                      rows={1}
                      className="min-h-[28px] text-xs py-1 resize-none"
                    />
                  </div>

                  {/* Find Supplier */}
                  {onFindSupplier && item.name && (() => {
                    const req = supplierRequests?.[item.id];
                    if (!req) {
                      return (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full h-8 text-xs gap-1.5 border-teal-600 text-teal-700 hover:bg-teal-50"
                          onClick={() => onFindSupplier(item, item.total)}
                        >
                          <Search className="h-3.5 w-3.5" />
                          Find Supplier
                        </Button>
                      );
                    }
                    if (req.status === 'closed') {
                      return (
                        <div className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 rounded-md px-3 py-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Supplier Found
                        </div>
                      );
                    }
                    return (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-teal-700 bg-teal-50 rounded-md px-3 py-1.5">
                          <Search className="h-3.5 w-3.5" />
                          Requested · {req.matchedCount} notified
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full h-7 text-xs text-muted-foreground hover:text-foreground"
                          onClick={() => onMarkAsFound?.(item.id, req.leadId)}
                        >
                          Mark as Found
                        </Button>
                      </div>
                    );
                  })()}
                </div>
              ))}
            </div>
          )}
          {(!category.items || category.items.length === 0) && (!category.subCategories || category.subCategories.length === 0) && (
            <p className="px-6 pb-4 text-muted-foreground">No items in this category.</p>
          )}

          {category.subCategories && category.subCategories.length > 0 && (
            <div className="pl-2 pr-0 pb-2">
              <BudgetAccordion
                categories={category.subCategories}
                onItemChange={onItemChange}
                onAddItem={onAddItem}
                onDeleteItem={onDeleteItem}
                onDeleteCategory={onDeleteCategory}
                categoryPath={currentPath}
                supplierRequests={supplierRequests}
                onFindSupplier={onFindSupplier}
                onMarkAsFound={onMarkAsFound}
                categoryProgress={categoryProgress}
              />
            </div>
          )}

          <div className="px-3 pt-2 pb-3">
            <Button variant="outline" size="sm" className="h-7 text-xs px-2 gap-1.5" onClick={() => onAddItem(currentPath)}>
              <PlusCircle className="h-3 w-3" />
              Add New Item
            </Button>
          </div>
        </AccordionContent>
      </AccordionItem>
    </div>
  );
};

export function BudgetAccordion({
  categories,
  onItemChange,
  onAddItem,
  onDeleteItem,
  onDeleteCategory,
  categoryPath = [],
  supplierRequests,
  onFindSupplier,
  onMarkAsFound,
  categoryProgress,
  openCategories,
  onOpenChange,
}: BudgetAccordionProps) {
  const isTopLevel = categoryPath.length === 0;

  const controlledProps = isTopLevel && openCategories !== undefined && onOpenChange
    ? { value: openCategories, onValueChange: onOpenChange }
    : {};

  return (
    <Accordion type="multiple" {...controlledProps} className="w-full space-y-4">
      {categories.map((category) => (
        <SortableCategory
          key={category.id}
          category={category}
          onItemChange={onItemChange}
          onAddItem={onAddItem}
          onDeleteItem={onDeleteItem}
          onDeleteCategory={onDeleteCategory}
          categoryPath={categoryPath}
          supplierRequests={supplierRequests}
          onFindSupplier={onFindSupplier}
          onMarkAsFound={onMarkAsFound}
          categoryProgress={categoryProgress}
          openCategories={openCategories}
          onOpenChange={onOpenChange}
        />
      ))}
    </Accordion>
  );
}
