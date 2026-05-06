'use client';

import { useState, useMemo } from 'react';
import type { Budget, RSVP } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Copy, 
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from '@/components/ui/scroll-area';

interface RsvpManagerProps {
  budget: Budget;
  rsvps: RSVP[] | null;
}

export function RsvpManager({ budget, rsvps }: RsvpManagerProps) {
  const { toast } = useToast();
  const [showGuestList, setShowGuestList] = useState(false);

  const inviteUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    // Standardized to [userId] to match standardized app/rsvp structure
    return `${window.location.origin}/rsvp/${budget.userId}/${budget.id}`;
  }, [budget.userId, budget.id]);

  const stats = useMemo(() => {
    const list = rsvps || [];
    const attending = list.filter(r => r.attending === 'yes');
    const totalGuests = attending.reduce((sum, r) => sum + (r.guests || 0), 0);
    return {
      confirmed: attending.length,
      declined: list.filter(r => r.attending === 'no').length,
      maybe: list.filter(r => r.attending === 'maybe').length,
      totalGuests: totalGuests + attending.length,
    };
  }, [rsvps]);

  const copyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    toast({ title: "Link Copied", description: "You can now share this with your guests." });
  };

  const openLink = () => {
    window.open(inviteUrl, '_blank');
  };

  return (
    <Card className="h-full bg-card/50 shadow-lg backdrop-blur-xl border-white/20">
      <CardHeader className="p-3 pb-0">
        <CardTitle className="flex items-center gap-1.5 font-headline text-base font-semibold">
          <Users className="h-4 w-4 text-primary" />
          Invites & Guest List
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 space-y-3">
        <div className="space-y-1">
          <h4 className="text-xs font-semibold text-muted-foreground">Your Invite Link</h4>
          <div className="flex gap-1.5">
            <Input value={inviteUrl} readOnly className="bg-black/5 border-dashed h-7 text-xs" />
            <Button variant="outline" size="icon" className="h-7 w-7 shrink-0" onClick={copyLink}>
              <Copy className="h-3 w-3" />
            </Button>
            <Button variant="outline" size="icon" className="h-7 w-7 shrink-0" onClick={openLink}>
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          <div className="py-1.5 px-2 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
            <p className="text-[9px] text-green-600 font-black uppercase tracking-wider">Going</p>
            <p className="text-base font-bold text-green-700">{stats.confirmed}</p>
          </div>
          <div className="py-1.5 px-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-center">
            <p className="text-[9px] text-blue-600 font-black uppercase tracking-wider">Guests</p>
            <p className="text-base font-bold text-blue-700">{stats.totalGuests}</p>
          </div>
          <div className="py-1.5 px-2 rounded-lg bg-red-500/10 border border-red-500/20 text-center">
            <p className="text-[9px] text-red-600 font-black uppercase tracking-wider">No</p>
            <p className="text-base font-bold text-red-700">{stats.declined}</p>
          </div>
          <div className="py-1.5 px-2 rounded-lg bg-gray-500/10 border border-gray-500/20 text-center">
            <p className="text-[9px] text-gray-600 font-black uppercase tracking-wider">Maybe</p>
            <p className="text-base font-bold text-gray-700">{stats.maybe}</p>
          </div>
        </div>

        <div className="pt-2">
          <Button 
            variant="ghost" 
            className="w-full justify-between" 
            onClick={() => setShowGuestList(!showGuestList)}
          >
            <span className="font-semibold">View Guest List</span>
            {showGuestList ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>

          {showGuestList && (
            <div className="mt-4 border rounded-md overflow-hidden bg-white/5">
              <ScrollArea className="h-[300px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Guest</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Guests</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rsvps && rsvps.length > 0 ? (
                      rsvps.map((rsvp) => (
                        <TableRow key={rsvp.id}>
                          <TableCell className="max-w-[120px]">
                            <p className="font-medium truncate">{rsvp.name}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{rsvp.email}</p>
                          </TableCell>
                          <TableCell className="text-center">
                            {rsvp.attending === 'yes' && <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" />}
                            {rsvp.attending === 'no' && <XCircle className="h-4 w-4 text-red-500 mx-auto" />}
                            {rsvp.attending === 'maybe' && <HelpCircle className="h-4 w-4 text-amber-500 mx-auto" />}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {rsvp.guests > 0 ? `+${rsvp.guests}` : '-'}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8 text-muted-foreground italic">
                          No responses yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
