
'use client';

import { useState, useMemo } from 'react';
import type { RSVP } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Clipboard, Check, Users, UserCheck, UserX, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';

interface RsvpManagerProps {
  budgetId: string;
  ownerId: string | null | undefined;
  rsvps: RSVP[] | null;
}

export function RsvpManager({ budgetId, ownerId, rsvps }: RsvpManagerProps) {
  const [copied, setCopied] = useState(false);

  // Using the official production domain for sharing
  const baseUrl = 'https://www.simpliplan.co.za';
  const rsvpLink = (ownerId && ownerId !== 'undefined') ? `${baseUrl}/rsvp/${ownerId}/${budgetId}` : '';

  const copyToClipboard = () => {
    if (!rsvpLink) return;
    navigator.clipboard.writeText(rsvpLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const { attendingCount, notAttendingCount, totalGuests } = useMemo(() => {
    if (!rsvps) {
      return { attendingCount: 0, notAttendingCount: 0, totalGuests: 0 };
    }
    const attending = rsvps.filter(r => r.status === 'attending');
    const notAttending = rsvps.filter(r => r.status === 'not_attending');
    const totalPlusOnes = attending.reduce((sum, r) => sum + r.additionalGuests, 0);
    
    return {
      attendingCount: attending.length,
      notAttendingCount: notAttending.length,
      totalGuests: attending.length + totalPlusOnes,
    };
  }, [rsvps]);

  return (
    <Card className="h-full bg-card/50 text-card-foreground shadow-lg backdrop-blur-xl border-white/20">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Invites & Guest List</CardTitle>
        <CardDescription className="text-foreground/80">Share the link below and watch your guest list grow.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="text-sm font-medium text-foreground/90">Your Sharable RSVP Link</label>
          <div className="flex gap-2 mt-1">
            <div className="relative flex-grow">
                <Input 
                    value={rsvpLink || 'Generating link...'} 
                    readOnly 
                    className={cn("bg-white/10 pr-10", !rsvpLink && "text-muted-foreground italic")} 
                />
                {!rsvpLink && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />}
            </div>
            <Button 
                variant="outline" 
                size="icon" 
                onClick={copyToClipboard} 
                disabled={!rsvpLink}
                className="bg-white/10 hover:bg-white/20 border-white/30 shrink-0"
            >
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Clipboard className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1 text-center">Guests will use this link to respond to your invitation.</p>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 rounded-lg bg-black/10">
                <Users className="h-6 w-6 mx-auto text-primary" />
                <p className="text-2xl font-bold mt-1">{totalGuests}</p>
                <p className="text-xs text-muted-foreground">Total Guests</p>
            </div>
            <div className="p-3 rounded-lg bg-black/10">
                <UserCheck className="h-6 w-6 mx-auto text-green-500" />
                <p className="text-2xl font-bold mt-1">{attendingCount}</p>
                <p className="text-xs text-muted-foreground">Attending</p>
            </div>
             <div className="p-3 rounded-lg bg-black/10">
                <UserX className="h-6 w-6 mx-auto text-red-500" />
                <p className="text-2xl font-bold mt-1">{notAttendingCount}</p>
                <p className="text-xs text-muted-foreground">Not Attending</p>
            </div>
        </div>

        <div>
           <h3 className="font-semibold text-foreground/90 mb-2">Guest Responses</h3>
           <ScrollArea className="h-[200px] border border-white/20 rounded-lg">
             <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Guests</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                {rsvps && rsvps.length > 0 ? (
                    rsvps.map(rsvp => (
                    <TableRow key={rsvp.id}>
                        <TableCell className="font-medium">{rsvp.guestName}</TableCell>
                        <TableCell>
                            <Badge variant={rsvp.status === 'attending' ? 'default' : 'destructive'} className={cn(rsvp.status === 'attending' ? 'bg-green-600/80' : 'bg-red-600/80')}>
                                {rsvp.status === 'attending' ? 'Attending' : 'Not Attending'}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">{rsvp.status === 'attending' ? `1 + ${rsvp.additionalGuests}` : '-'}</TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                            No responses yet.
                        </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
           </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
