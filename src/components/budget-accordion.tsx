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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  updatedCategories?: Set<string>;
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
  updatedCategories,
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
  const isUpdated = isTopLevel && updatedCategories ? updatedCategories.has(category.id) : false;
  const itemCount = countAllItems([category]);

  const itemClassName = cn(
    "group mb-4 rounded-lg border-b-0 shadow-sm overflow-hidden transition-colors duration-200",
    isTopLevel
      ? isOpen
        ? "bg-white dark:bg-zinc-900 border-l-[3px] border-l-teal-500"
        : isUpdated
          ? "bg-white dark:bg-zinc-900"
          : "bg-gray-50 dark:bg-zinc-950 pulse-border-teal"
      : "bg-card"
  );

  return (
    <div ref={setNodeRef} style={style}>
      <AccordionItem value={category.id} className={itemClassName}>
        <AccordionTrigger className="px-4 py-2 text-lg hover:no-underline [&>svg]:hidden">
          <div className="flex items-center w-full">
            {/* Delete button */}
            <div onClick={(e) => e.stopPropagation()} className="mr-3 shrink-0">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <X className="h-4 w-4" />
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

            {/* Chevron — points down when collapsed, up when expanded */}
            <ChevronDown className="h-5 w-5 text-primary transition-transform duration-200 mr-3 shrink-0 group-data-[state=open]:rotate-180" />

            {/* Category icon + name + item count */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {Icon && <Icon className="h-5 w-5 text-primary/70 shrink-0" />}
              <div className="flex flex-col items-start min-w-0">
                <span className="font-headline font-semibold text-base text-left leading-tight">{category.name}</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {isTopLevel && (
                    isUpdated ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
                        Updated
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                        Not updated
                      </span>
                    )
                  )}
                  <span className="text-xs text-muted-foreground group-data-[state=open]:hidden">
                    {isTopLevel ? '· ' : ''}{itemCount} {itemCount === 1 ? 'item' : 'items'}
                  </span>
                </div>
              </div>
            </div>

            {/* Total badge */}
            <Badge variant="secondary" className="font-mono ml-2 shrink-0 text-xs">{formatCurrency(category.total)}</Badge>
          </div>
        </AccordionTrigger>

        <AccordionContent className="bg-card">
          {(category.items && category.items.length > 0) && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"></TableHead>
                    <TableHead className="min-w-[150px]">Item</TableHead>
                    <TableHead>Metric</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="w-1/3">Comments</TableHead>
                    {onFindSupplier && <TableHead className="w-44"></TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {category.items.map((item, itemIndex) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                              <X className="h-4 w-4" />
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
                      </TableCell>
                      <TableCell className="font-medium">
                        <Input
                          type="text"
                          value={item.name}
                          onChange={(e) => onItemChange(currentPath, itemIndex, 'name', e.target.value)}
                          placeholder="Item name"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          value={item.metric}
                          onChange={(e) => onItemChange(currentPath, itemIndex, 'metric', e.target.value)}
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => onItemChange(currentPath, itemIndex, 'quantity', e.target.value)}
                          className="w-20"
                          min="0"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => onItemChange(currentPath, itemIndex, 'unitPrice', e.target.value)}
                          className="w-24"
                          min="0"
                          step="0.01"
                        />
                      </TableCell>
                      <TableCell className="font-mono">{formatCurrency(item.total)}</TableCell>
                      <TableCell>
                        <Textarea
                          value={item.comment}
                          onChange={(e) => onItemChange(currentPath, itemIndex, 'comment', e.target.value)}
                          rows={1}
                          className="min-h-[38px] text-sm"
                        />
                      </TableCell>
                      {onFindSupplier && (
                        <TableCell className="whitespace-nowrap">
                          {(() => {
                            if (!item.name) return null;
                            const req = supplierRequests?.[item.id];
                            if (!req) {
                              return (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-xs h-7 border-teal-600 text-teal-700 hover:bg-teal-50"
                                  onClick={() => onFindSupplier(item, item.total)}
                                >
                                  <Search className="h-3 w-3 mr-1" />
                                  Find Supplier
                                </Button>
                              );
                            }
                            if (req.status === 'closed') {
                              return (
                                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Supplier Found
                                </span>
                              );
                            }
                            return (
                              <div className="flex flex-col gap-1.5">
                                <span className="inline-flex items-center gap-1 rounded-full bg-teal-100 text-teal-800 text-xs font-medium px-2.5 py-1">
                                  <Search className="h-3 w-3" />
                                  Requested &middot; {req.matchedCount} notified
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-xs h-6 text-muted-foreground hover:text-foreground px-2"
                                  onClick={() => onMarkAsFound?.(item.id, req.leadId)}
                                >
                                  Mark as Found
                                </Button>
                              </div>
                            );
                          })()}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {(!category.items || category.items.length === 0) && (!category.subCategories || category.subCategories.length === 0) && (
            <p className="px-6 pb-4 text-muted-foreground">No items in this category.</p>
          )}

          <div className="px-6 pt-4 pb-4">
            <Button variant="outline" onClick={() => onAddItem(currentPath)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Item
            </Button>
          </div>

          {category.subCategories && category.subCategories.length > 0 && (
            <div className="px-6 pb-4">
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
                updatedCategories={updatedCategories}
              />
            </div>
          )}
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
  updatedCategories,
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
          updatedCategories={updatedCategories}
          openCategories={openCategories}
          onOpenChange={onOpenChange}
        />
      ))}
    </Accordion>
  );
}
