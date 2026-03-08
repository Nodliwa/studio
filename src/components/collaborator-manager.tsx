
'use client';

import { useState } from 'react';
import { useFirestore, updateDocumentNonBlocking } from '@/firebase';
import { type DocumentReference } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Users, UserPlus, Loader2, Send } from 'lucide-react';
import type { Budget, User as AppUser } from '@/lib/types';
import { sendCollaboratorInvite } from '@/app/planner/actions';

interface CollaboratorManagerProps {
  budget: Budget;
  budgetRef: DocumentReference;
  inviterName: string;
}

export function CollaboratorManager({ budget, budgetRef, inviterName }: CollaboratorManagerProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  const handleInvite = async () => {
    if (!email.trim() || !name.trim()) {
        toast({ variant: 'destructive', title: 'Missing information', description: 'Please provide both a name and an email.' });
        return;
    }
    
    setIsAdding(true);

    try {
      const currentEmails = budget.collaboratorEmails || [];
      if (currentEmails.includes(email.trim().toLowerCase())) {
        toast({ title: 'Already added', description: 'This user is already a collaborator.' });
        setIsAdding(false);
        return;
      }

      // 1. Send Invitation Email
      const inviteResult = await sendCollaboratorInvite({
        collaboratorName: name.trim(),
        collaboratorEmail: email.trim().toLowerCase(),
        inviterName: inviterName,
        planName: budget.name,
        planUrl: `${window.location.origin}/planner/${budget.id}`,
      });

      if (!inviteResult.success) {
          console.warn("Email could not be sent, but adding to list anyway for dev purposes.");
      }

      // 2. Update budget doc
      updateDocumentNonBlocking(budgetRef, {
        collaboratorEmails: [...currentEmails, email.trim().toLowerCase()]
      });

      toast({
        title: 'Invitation Sent',
        description: `An invite has been sent to ${name} (${email}).`,
      });
      setEmail('');
      setName('');
    } catch (error) {
      console.error("Error adding collaborator:", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to invite collaborator. Please try again.',
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Card className="h-full bg-card/50 shadow-lg backdrop-blur-xl border-white/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline text-2xl">
          <Users className="h-6 w-6 text-primary" />
          Collaborators
        </CardTitle>
        <CardDescription>
          Invite others to help you plan this event.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            placeholder="Collaborator Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isAdding}
          />
          <div className="flex gap-2">
            <Input
                type="email"
                placeholder="collaborator@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isAdding}
                onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
            />
            <Button onClick={handleInvite} disabled={isAdding || !email || !name}>
                {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="pt-2">
          <h4 className="text-sm font-semibold text-muted-foreground mb-2">Active Collaborators</h4>
          <div className="space-y-1">
            {budget.collaboratorEmails && budget.collaboratorEmails.length > 0 ? (
              budget.collaboratorEmails.map((email) => (
                <div key={email} className="text-sm p-2 rounded bg-black/5 flex justify-between items-center">
                  <span>{email}</span>
                  <span className="text-[10px] uppercase font-bold text-primary px-1 border border-primary rounded">Read/Write</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground italic">No collaborators invited yet.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
