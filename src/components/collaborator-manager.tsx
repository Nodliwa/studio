
'use client';

import { useState } from 'react';
import { updateDocumentNonBlocking } from '@/firebase';
import { type DocumentReference } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Users, Loader2, Send, Trash2, Shield, ShieldCheck } from 'lucide-react';
import type { Budget, Collaborator } from '@/lib/types';
import { sendCollaboratorInvite } from '@/app/planner/actions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CollaboratorManagerProps {
  budget: Budget;
  budgetRef: DocumentReference;
  inviterName: string;
}

export function CollaboratorManager({ budget, budgetRef, inviterName }: CollaboratorManagerProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [rights, setRights] = useState<'read' | 'read/write'>('read/write');
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  const handleInvite = async () => {
    if (!email.trim() || !name.trim()) {
        toast({ variant: 'destructive', title: 'Missing information', description: 'Please provide both a name and an email.' });
        return;
    }
    
    setIsAdding(true);

    try {
      const currentCollaborators = budget.collaborators || [];
      if (currentCollaborators.some(c => c.email === email.trim().toLowerCase())) {
        toast({ title: 'Already added', description: 'This user is already a collaborator.' });
        setIsAdding(false);
        return;
      }

      // 1. Send Invitation Email
      const inviteResult = await sendCollaboratorInvite({
        collaboratorName: name.trim(),
        collaboratorEmail: email.trim().toLowerCase(),
        inviterName: inviterName,
        planName: budget.name || 'a Celebration Plan',
        planUrl: `${window.location.origin}/planner/${budget.id}`,
      });

      if (!inviteResult.success) {
          toast({
            variant: 'destructive',
            title: 'Email Failed',
            description: inviteResult.message || 'The invitation email could not be sent, but access was granted.',
          });
      }

      // 2. Update budget doc with new collaborator object
      const newCollaborator: Collaborator = {
        email: email.trim().toLowerCase(),
        name: name.trim(),
        rights: rights
      };

      updateDocumentNonBlocking(budgetRef, {
        collaborators: [...currentCollaborators, newCollaborator],
        // Maintain a list of emails for easier querying/rules if needed
        collaboratorEmails: [...(budget.collaboratorEmails || []), newCollaborator.email]
      });

      if (inviteResult.success) {
        toast({
          title: 'Invitation Sent',
          description: `An invite has been sent to ${name} (${email}) with ${rights} rights.`,
        });
      }
      
      setEmail('');
      setName('');
      setRights('read/write');
    } catch (error) {
      console.error("Error adding collaborator:", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleUpdateRights = (email: string, newRights: 'read' | 'read/write') => {
    const updated = (budget.collaborators || []).map(c => 
      c.email === email ? { ...c, rights: newRights } : c
    );
    updateDocumentNonBlocking(budgetRef, { collaborators: updated });
    toast({ title: 'Rights Updated', description: `Permissions changed to ${newRights}.` });
  };

  const handleDelete = (email: string) => {
    const updated = (budget.collaborators || []).filter(c => c.email !== email);
    const updatedEmails = (budget.collaboratorEmails || []).filter(e => e !== email);
    
    updateDocumentNonBlocking(budgetRef, { 
      collaborators: updated,
      collaboratorEmails: updatedEmails
    });
    
    toast({ title: 'Collaborator Removed', description: 'Access has been revoked.' });
  };

  return (
    <Card className="h-full bg-card/50 shadow-lg backdrop-blur-xl border-white/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline text-2xl">
          <Users className="h-6 w-6 text-primary" />
          Collaborators
        </CardTitle>
        <CardDescription>
          Invite others to help manage this celebration.
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
                className="flex-grow"
            />
            <Select value={rights} onValueChange={(val: any) => setRights(val)}>
              <SelectTrigger className="w-[110px] shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="read/write">Edit</SelectItem>
                <SelectItem value="read">View</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleInvite} disabled={isAdding || !email || !name} size="icon" className="shrink-0">
                {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="pt-2">
          <h4 className="text-sm font-semibold text-muted-foreground mb-2">Access List</h4>
          <div className="space-y-2">
            {budget.collaborators && budget.collaborators.length > 0 ? (
              budget.collaborators.map((collab) => (
                <div key={collab.email} className="group flex items-center justify-between p-2 rounded bg-black/5 hover:bg-black/10 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{collab.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{collab.email}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-[10px] font-bold uppercase gap-1">
                          {collab.rights === 'read/write' ? <ShieldCheck className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
                          {collab.rights === 'read/write' ? 'Edit' : 'View'}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleUpdateRights(collab.email, 'read/write')}>
                          Full Read/Write
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateRights(collab.email, 'read')}>
                          Read Only
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDelete(collab.email)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground italic">No collaborators added yet.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
