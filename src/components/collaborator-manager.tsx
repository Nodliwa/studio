'use client';

import { useState } from 'react';
import { updateDocumentNonBlocking } from '@/firebase';
import { useFirebase } from '@/firebase';
import { type DocumentReference } from 'firebase/firestore';
import { doc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Users, Loader2, Send, Trash2, Shield, ShieldCheck, Link2, Copy, MessageCircle, Info } from 'lucide-react';
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
import { v4 as uuidv4 } from 'uuid';

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
  const [generatedLink, setGeneratedLink] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { firestore } = useFirebase();

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
      const inviteResult = await sendCollaboratorInvite({
        collaboratorName: name.trim(),
        collaboratorEmail: email.trim().toLowerCase(),
        inviterName,
        planName: budget.name || 'a Celebration Plan',
        planUrl: window.location.origin + '/planner/' + budget.id,
      });
      if (!inviteResult.success) {
        toast({ variant: 'destructive', title: 'Email Failed', description: inviteResult.message || 'Invite email could not be sent.' });
      }
      const newCollaborator: Collaborator = { email: email.trim().toLowerCase(), name: name.trim(), rights };
      updateDocumentNonBlocking(budgetRef, {
        collaborators: [...currentCollaborators, newCollaborator],
        collaboratorEmails: [...(budget.collaboratorEmails || []), newCollaborator.email]
      });
      if (inviteResult.success) {
        toast({ title: 'Invitation Sent', description: 'An invite has been sent to ' + name + '.' });
      }
      setEmail(''); setName(''); setRights('read/write');
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'An unexpected error occurred.' });
    } finally {
      setIsAdding(false);
    }
  };

  const handleGenerateLink = async () => {
    if (!firestore) return;
    setIsGenerating(true);
    try {
      const token = uuidv4();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      await setDoc(doc(firestore, "invite_tokens", token), {
        budgetId: budget.id,
        budgetName: budget.name,
        ownerId: budget.userId,
        createdAt: serverTimestamp(),
        expiresAt: Timestamp.fromDate(expiresAt),
        used: false,
        usedAt: null,
        usedBy: null,
      });
      const link = window.location.origin + '/invite/' + token;
      setGeneratedLink(link);
    } catch (e) {
      toast({ variant: 'destructive', title: 'Could not generate link' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    toast({ title: 'Link copied!' });
  };

  const handleWhatsAppShare = () => {
    const message = 'Hi! I would like you to collaborate on my ' + (budget.name || 'celebration') + ' plan on SimpliPlan. Use this link to request access (valid for 7 days, one use only): ' + generatedLink;
    window.open('https://wa.me/?text=' + encodeURIComponent(message), '_blank');
  };

  const handleUpdateRights = (email: string, newRights: 'read' | 'read/write') => {
    const updated = (budget.collaborators || []).map(c => c.email === email ? { ...c, rights: newRights } : c);
    updateDocumentNonBlocking(budgetRef, { collaborators: updated });
    toast({ title: 'Rights Updated' });
  };

  const handleDelete = (email: string) => {
    const updated = (budget.collaborators || []).filter(c => c.email !== email);
    const updatedEmails = (budget.collaboratorEmails || []).filter(e => e !== email);
    updateDocumentNonBlocking(budgetRef, { collaborators: updated, collaboratorEmails: updatedEmails });
    toast({ title: 'Collaborator Removed' });
  };

  return (
    <Card className="h-full bg-card/50 shadow-lg backdrop-blur-xl border-white/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline text-2xl">
          <Users className="h-6 w-6 text-primary" />
          Collaborators
        </CardTitle>
        <CardDescription>Invite others to help manage this celebration.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">

        <div className="bg-muted/40 rounded-lg p-3 space-y-1 text-xs text-muted-foreground border">
          <p className="font-semibold text-foreground flex items-center gap-1"><Info className="h-3 w-3" /> How to invite collaborators</p>
          <ol className="space-y-0.5 list-decimal list-inside">
            <li>Generate a one-time invite link below</li>
            <li>Share it via your own WhatsApp</li>
            <li>Invitee fills in their name and contact</li>
            <li>You approve or reject their request</li>
            <li>Once approved they can access the plan</li>
          </ol>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold">Generate Invite Link</p>
          {!generatedLink ? (
            <Button variant="outline" className="w-full gap-2" onClick={handleGenerateLink} disabled={isGenerating}>
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
              Generate One-Time Link
            </Button>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input value={generatedLink} readOnly className="text-xs" />
                <Button size="icon" variant="outline" onClick={handleCopyLink}><Copy className="h-4 w-4" /></Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button className="gap-2 bg-green-600 hover:bg-green-700 text-white" onClick={handleWhatsAppShare}>
                  <MessageCircle className="h-4 w-4" /> Share via WhatsApp
                </Button>
                <Button variant="outline" className="gap-2" onClick={() => { setGeneratedLink(''); }}>
                  Generate New Link
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center">This link expires in 7 days and can only be used once.</p>
            </div>
          )}
        </div>

        <div className="space-y-2 border-t pt-4">
          <p className="text-sm font-semibold">Or invite directly by email</p>
          <Input placeholder="Collaborator Name" value={name} onChange={(e) => setName(e.target.value)} disabled={isAdding} />
          <div className="flex gap-2">
            <Input type="email" placeholder="collaborator@email.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isAdding} className="flex-grow" />
            <Select value={rights} onValueChange={(val: any) => setRights(val)}>
              <SelectTrigger className="w-[110px] shrink-0"><SelectValue /></SelectTrigger>
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

        <div className="border-t pt-4">
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
                        <DropdownMenuItem onClick={() => handleUpdateRights(collab.email, 'read/write')}>Full Read/Write</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateRights(collab.email, 'read')}>Read Only</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDelete(collab.email)}>
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
