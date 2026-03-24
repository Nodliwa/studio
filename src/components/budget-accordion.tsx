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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "./ui/button";
import { PlusCircle, GripVertical, UtensilsCrossed, Wheat, Carrot, Apple, Coffee, Handshake, Truck, Gem, Cake, Shirt, Drama, Hammer, Zap, CrossIcon, User, Users, Heart } from "lucide-react";
import React from "react";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface BudgetAccordionProps {
  categories: BudgetCategory[];
  onItemChange: (categoryPath: string[], itemIndex: number, field: keyof BudgetItem, value: string | number) => void;
  onAddItem: (categoryPath: string[]) => void;
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


const SortableCategory = ({ category, onItemChange, onAddItem, categoryPath = [] }: { category: BudgetCategory } & Omit<BudgetAccordionProps, 'categories'>) => {
  const {
    attributes,
    listeners,
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
        <AccordionTrigger className="px-6 py-2 text-lg hover:no-underline [&[data-state=open]>svg]:text-primary">
          <div className="flex items-center gap-4 w-full">
            <div {...attributes} {...listeners} className="cursor-grab p-2">
              <GripVertical className="h-6 w-6 text-muted-foreground" />
            </div>
            {Icon && <Icon className="h-6 w-6 text-primary" />}
            <span className="font-headline font-semibold">{category.name}</span>
            <Badge variant="secondary" className="font-mono ml-auto">{formatCurrency(category.total)}</Badge>
          </div>
        </AccordionTrigger>
        <AccordionContent className="bg-card">
          {(category.items && category.items.length > 0) && (
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
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
           {(!category.items || category.items.length === 0) && (!category.subCategories) && (
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
                categoryPath={currentPath}
              />
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </div>
  );
};

export function BudgetAccordion({ categories, onItemChange, onAddItem, categoryPath = [] }: BudgetAccordionProps) {
  return (
    <Accordion type="multiple" className="w-full space-y-4">
      {categories.map((category) => (
        <SortableCategory 
          key={category.id} 
          category={category} 
          onItemChange={onItemChange} 
          onAddItem={onAddItem}
          categoryPath={categoryPath}
        />
      ))}
    </Accordion>
  );
}
