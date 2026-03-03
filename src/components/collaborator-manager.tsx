
'use client';

import { useState, useEffect } from 'react';
import { useFirestore, updateDocumentNonBlocking } from '@/firebase';
import { collection, query, where, getDocs, limit, doc, getDoc, type DocumentReference } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Users, UserPlus, X, Shield, Loader2 } from 'lucide-react';
import type { Budget, User as AppUser } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface CollaboratorManagerProps {
  budget: Budget;
  budgetRef: DocumentReference;
}

export function CollaboratorManager({ budget, budgetRef }: CollaboratorManagerProps) {
  const [email, setEmail] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [collaboratorProfiles, setCollaboratorProfiles] = useState<AppUser[]>([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfiles = async () => {
      if (!budget.collaboratorIds || budget.collaboratorIds.length === 0) {
        setCollaboratorProfiles([]);
        return;
      }

      setIsLoadingProfiles(true);
      try {
        const profiles: AppUser[] = [];
        for (const uid of budget.collaboratorIds) {
          const userDoc = await getDoc(doc(firestore, 'users', uid));
          if (userDoc.exists()) {
            profiles.push({ ...userDoc.data() as AppUser, id: userDoc.id });
          }
        }
        setCollaboratorProfiles(profiles);
      } catch (error) {
        console.error("Error fetching collaborator profiles:", error);
      } finally {
        setIsLoadingProfiles(false);
      }
    };

    fetchProfiles();
  }, [budget.collaboratorIds, firestore]);

  const handleAddCollaborator = async () => {
    if (!email.trim()) return;
    setIsAdding(true);

    try {
      // 1. Find user by email
      const usersRef = collection(firestore, 'users');
      const q = query(usersRef, where('email', '==', email.trim().toLowerCase()), limit(1));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast({
          variant: 'destructive',
          title: 'User not found',
          description: 'No user found with that email address. They must have an account first.',
        });
        return;
      }

      const newUser = querySnapshot.docs[0];
      const newUid = newUser.id;

      if (newUid === budget.userId) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'You are already the owner of this plan.',
        });
        return;
      }

      const currentCollaborators = budget.collaboratorIds || [];
      if (currentCollaborators.includes(newUid)) {
        toast({
          title: 'Already added',
          description: 'This user is already a collaborator.',
        });
        return;
      }

      // 2. Update budget
      await updateDocumentNonBlocking(budgetRef, {
        collaboratorIds: [...currentCollaborators, newUid]
      });

      toast({
        title: 'Collaborator added',
        description: `${email} has been granted access to this plan.`,
      });
      setEmail('');
    } catch (error) {
      console.error("Error adding collaborator:", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add collaborator. Please try again.',
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveCollaborator = async (uid: string) => {
    try {
      const currentCollaborators = budget.collaboratorIds || [];
      const updatedCollaborators = currentCollaborators.filter(id => id !== uid);
      
      await updateDocumentNonBlocking(budgetRef, {
        collaboratorIds: updatedCollaborators
      });

      toast({
        title: 'Collaborator removed',
        description: 'Access has been revoked.',
      });
    } catch (error) {
      console.error("Error removing collaborator:", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to remove collaborator.',
      });
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
          Invite others to view and edit this plan.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="friend@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isAdding}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCollaborator()}
          />
          <Button onClick={handleAddCollaborator} disabled={isAdding || !email}>
            {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
          </Button>
        </div>

        <div className="space-y-4">
          <div className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <Shield className="h-4 w-4" /> Current Access
          </div>
          
          {isLoadingProfiles ? (
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-2">
              {collaboratorProfiles.length === 0 ? (
                <p className="text-sm text-center py-4 text-muted-foreground italic">
                  No collaborators added yet.
                </p>
              ) : (
                collaboratorProfiles.map((profile) => (
                  <div key={profile.id} className="flex items-center justify-between p-2 rounded-lg bg-black/5">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profile.photoURL} />
                        <AvatarFallback>{profile.knownAs?.charAt(0) || '?'}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{profile.displayName}</span>
                        <span className="text-xs text-muted-foreground">{profile.email}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemoveCollaborator(profile.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
