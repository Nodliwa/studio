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

interface BudgetAccordionProps {
  categories: BudgetCategory[];
  onItemChange: (categoryPath: number[], itemIndex: number, field: keyof BudgetItem, value: string | number) => void;
  categoryPath?: number[];
}

export function BudgetAccordion({ categories, onItemChange, categoryPath = [] }: BudgetAccordionProps) {
  return (
    <Accordion type="multiple" defaultValue={categories.map(c => c.id)} className="w-full">
      {categories.map((category, catIndex) => {
        const currentPath = [...categoryPath, catIndex];
        return (
          <AccordionItem value={category.id} key={category.id} className="mb-4 rounded-lg border-b-0 bg-card shadow-sm overflow-hidden">
            <AccordionTrigger className="px-6 py-4 text-lg hover:no-underline [&[data-state=open]>svg]:text-primary">
              <div className="flex items-center gap-4">
                <category.icon className="h-6 w-6 text-primary" />
                <span className="font-headline font-semibold">{category.name}</span>
                <Badge variant="secondary" className="font-mono">{formatCurrency(category.total)}</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="bg-card">
              {(category.items && category.items.length > 0) && (
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead className="w-1/4">Item</TableHead>
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
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell>{item.metric}</TableCell>
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

              {category.subCategories && category.subCategories.length > 0 && (
                <div className="px-6 pb-4">
                  <BudgetAccordion 
                    categories={category.subCategories}
                    onItemChange={onItemChange}
                    categoryPath={currentPath}
                  />
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
