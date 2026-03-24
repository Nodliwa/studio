"use client";

import type { BudgetItem, BudgetCategory } from "@/lib/types";
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
  ChevronRight
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
}

const iconMap: { [key: string]: React.ElementType } = {
  // Common
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
  // Funeral specific
  'cat-1': UtensilsCrossed, 
  'cat-2': Wheat, 
  'cat-3': Carrot, 
  'cat-4': Apple, 
  'cat-5': Coffee, 
  'cat-6': CrossIcon, 
  'cat-7': Handshake, 
  'cat-8': Truck, 
  // Wedding specific
  'venue': Gem,
  'attire': Shirt,
  'bride': Gem,
  'groom': Shirt,
  'bridesmaids': Drama,
  'desserts': Cake,
  // Umgidi / Umemulo specific
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


const SortableCategory = ({ 
  category, 
  onItemChange, 
  onAddItem, 
  onDeleteItem,
  onDeleteCategory,
  categoryPath = [] 
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

  return (
    <div ref={setNodeRef} style={style}>
      <AccordionItem value={category.id} key={category.id} className="mb-4 rounded-lg border-b-0 bg-card shadow-sm overflow-hidden">
        <AccordionTrigger className="px-6 py-2 text-lg hover:no-underline [&[data-state=open]>div>svg.dropdown-arrow]:rotate-90">
          <div className="flex items-center w-full mr-4">
            {/* Cancel Button */}
            <div onClick={(e) => e.stopPropagation()} className="mr-6">
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

            {/* Prominent Dropdown Arrow */}
            <ChevronRight className="dropdown-arrow h-6 w-6 text-primary transition-transform duration-200 mr-4 shrink-0" />

            {/* Category Icon & Name */}
            <div className="flex items-center gap-2">
              {Icon && <Icon className="h-6 w-6 text-primary/70 shrink-0" />}
              <span className="font-headline font-semibold text-left">{category.name}</span>
            </div>

            {/* Category Total Badge */}
            <Badge variant="secondary" className="font-mono ml-auto shrink-0">{formatCurrency(category.total)}</Badge>
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
  categoryPath = [] 
}: BudgetAccordionProps) {
  return (
    <Accordion type="multiple" className="w-full space-y-4">
      {categories.map((category) => (
        <SortableCategory 
          key={category.id} 
          category={category} 
          onItemChange={onItemChange} 
          onAddItem={onAddItem} 
          onDeleteItem={onDeleteItem}
          onDeleteCategory={onDeleteCategory}
          categoryPath={categoryPath}
        />
      ))}
    </Accordion>
  );
}
