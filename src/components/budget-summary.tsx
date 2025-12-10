"use client";

import type { BudgetCategory } from "@/lib/types";
import { formatCurrency, cn } from "@/lib/utils";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronRight } from "lucide-react";

interface BudgetSummaryProps {
  categories: BudgetCategory[];
  grandTotal: number;
}

const SummaryRow = ({ category }: { category: BudgetCategory }) => {
  const hasSubCategories = category.subCategories && category.subCategories.length > 0;

  if (!hasSubCategories) {
    return (
      <TableRow>
        <TableCell className="font-medium">{category.name}</TableCell>
        <TableCell className="text-right font-mono">{formatCurrency(category.total)}</TableCell>
      </TableRow>
    );
  }

  return (
    <Collapsible asChild>
      <>
        <TableRow>
          <TableCell colSpan={2}>
            <CollapsibleTrigger className="flex w-full items-center justify-between text-left">
              <span className="flex items-center gap-2 font-medium">
                <ChevronRight className="h-4 w-4 transition-transform [&[data-state=open]]:rotate-90" />
                {category.name}
              </span>
              <span className="font-mono">{formatCurrency(category.total)}</span>
            </CollapsibleTrigger>
          </TableCell>
        </TableRow>
        <CollapsibleContent asChild>
          <>
            {category.subCategories?.map((subCategory) => (
                <TableRow key={subCategory.id} className="bg-muted/50 hover:bg-muted/80">
                    <TableCell className="pl-12 font-normal text-muted-foreground">{subCategory.name}</TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">{formatCurrency(subCategory.total)}</TableCell>
                </TableRow>
            ))}
          </>
        </CollapsibleContent>
      </>
    </Collapsible>
  );
};


export function BudgetSummary({ categories, grandTotal }: BudgetSummaryProps) {
  return (
    <Card className="sticky top-8">
      <CardHeader>
        <CardTitle className="font-headline">Budget Summary</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableBody>
            {categories.map((category) => (
              <SummaryRow key={category.id} category={category} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="flex-col items-stretch p-6">
        <div className="flex justify-between items-center text-xl font-bold">
          <span>Grand Total</span>
          <span className="font-mono text-primary">{formatCurrency(grandTotal)}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
