
"use client";

import type { BudgetCategory } from "@/lib/types";
import { formatCurrency, cn } from "@/lib/utils";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronRight } from "lucide-react";
import React from "react";

interface BudgetSummaryProps {
  categories: BudgetCategory[];
  grandTotal: number;
}

const SummaryRow = ({ category }: { category: BudgetCategory }) => {
  const hasSubCategories = category.subCategories && category.subCategories.length > 0;

  if (!hasSubCategories) {
    return (
      <TableRow>
        <TableCell className="font-medium py-2">{category.name}</TableCell>
        <TableCell className="text-right font-mono py-2">{formatCurrency(category.total)}</TableCell>
      </TableRow>
    );
  }

  return (
    <Collapsible asChild>
      <React.Fragment>
        <TableRow>
          <TableCell colSpan={2} className="p-0">
            <CollapsibleTrigger className="flex w-full items-center justify-between text-left px-4 py-2">
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
                    <TableCell className="pl-12 font-normal text-muted-foreground py-2">{subCategory.name}</TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground py-2">{formatCurrency(subCategory.total)}</TableCell>
                </TableRow>
            ))}
          </>
        </CollapsibleContent>
      </React.Fragment>
    </Collapsible>
  );
};


export function BudgetSummary({ categories, grandTotal }: BudgetSummaryProps) {
  return (
    <Card className="sticky top-8 shadow-lg border-border/60">
      <CardHeader className="p-4">
        <CardTitle className="font-headline text-2xl">Dashboard</CardTitle>
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
      <CardFooter className="flex-col items-stretch p-4 bg-muted/50 rounded-b-lg">
        <div className="flex justify-between items-center text-xl font-bold">
          <span>Grand Total</span>
          <span className="font-mono text-primary">{formatCurrency(grandTotal)}</span>
        </div>
      </CardFooter>
    </Card>
  );
}

