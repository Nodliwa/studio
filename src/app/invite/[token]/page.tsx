"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFirebase } from "@/firebase";
import { doc, getDoc, collection, addDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, PartyPopper, XCircle, Clock } from "lucide-react";
import Image from "next/image";
import { onAuthStateChanged } from "firebase/auth";

export default function InvitePage({ params: { token } }: { params: { token: string } }) {
  const { firestore, auth } = useFirebase();
  const router = useRouter();
  const [tokenData, setTokenData] = useState<any>(null);
  const [tokenStatus, setTokenStatus] = useState<'loading' | 'valid' | 'used' | 'expired' | 'invalid'>('loading');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user && !user.isAnonymous) setCurrentUser(user);
    });
    return () => unsub();
  }, [auth]);

  useEffect(() => {
    if (!firestore || !token) return;
    const fetchToken = async () => {
      try {
        const tokenRef = doc(firestore, "invite_tokens", token);
        const tokenSnap = await getDoc(tokenRef);
        if (!tokenSnap.exists()) { setTokenStatus('invalid'); return; }
        const data = { id: tokenSnap.id, ...tokenSnap.data() };
        setTokenData(data);
        if (data.used) { setTokenStatus('used'); return; }
        if (data.expiresAt?.toDate() < new Date()) { setTokenStatus('expired'); return; }
        setTokenStatus('valid');
      } catch { setTokenStatus('invalid'); }
    };
    fetchToken();
  }, [firestore, token]);

  const handleSubmit = async () => {
    if (!name.trim() || !contact.trim()) return;
    if (!firestore || !currentUser) {
      localStorage.setItem('pendingInviteToken', token);
      localStorage.setItem('pendingInviteName', name);
      localStorage.setItem('pendingInviteContact', contact);
      router.push('/auth');
      return;
    }
    setIsSubmitting(true);
    try {
      await updateDoc(doc(firestore, "invite_tokens", token), { used: true, usedAt: serverTimestamp(), usedBy: currentUser.uid });
      await addDoc(collection(firestore, "notifications"), {
        userId: tokenData.ownerId,
        type: 'collaborator_request',
        budgetId: tokenData.budgetId,
        budgetName: tokenData.budgetName,
        inviteeName: name.trim(),
        inviteeContact: contact.trim(),
        inviteeUid: currentUser.uid,
        token,
        status: 'pending',
        createdAt: serverTimestamp(),
        read: false,
      });
      setSubmitted(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (tokenStatus === 'loading') return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  if (tokenStatus === 'invalid' || tokenStatus === 'expired' || tokenStatus === 'used') return (
    <div className="min-h-screen flex items-center justify-center bg-secondary p-4">
      <div className="bg-background rounded-2xl shadow-lg p-8 max-w-sm w-full text-center space-y-4">
        {tokenStatus === 'used' ? <XCircle className="h-12 w-12 text-destructive mx-auto" /> : <Clock className="h-12 w-12 text-amber-500 mx-auto" />}
        <h2 className="text-xl font-bold">{tokenStatus === 'used' ? 'Link already used' : tokenStatus === 'expired' ? 'Link expired' : 'Invalid link'}</h2>
        <p className="text-muted-foreground text-sm">
          {tokenStatus === 'used' ? 'This invite link has already been used. Ask the plan owner to generate a new one.' :
           tokenStatus === 'expired' ? 'This invite link has expired. Ask the plan owner to generate a new one.' :
           'This invite link is not valid. Please check the link and try again.'}
        </p>
      </div>
    </div>
  );

  if (submitted) return (
    <div className="min-h-screen flex items-center justify-center bg-secondary p-4">
      <div className="bg-background rounded-2xl shadow-lg p-8 max-w-sm w-full text-center space-y-4">
        <PartyPopper className="h-12 w-12 text-primary mx-auto" />
        <h2 className="text-xl font-bold">Request sent!</h2>
        <p className="text-muted-foreground text-sm">The plan owner has been notified and will approve your request shortly. You will receive a notification once approved.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary p-4">
      <div className="bg-background rounded-2xl shadow-lg p-8 max-w-sm w-full space-y-6">
        <div className="text-center space-y-2">
          <Image src="/images/brand2.png" alt="SimpliPlan" width={120} height={30} className="mx-auto" />
          <h2 className="text-xl font-bold mt-4">You have been invited!</h2>
          <p className="text-muted-foreground text-sm">
            You have been invited to collaborate on <span className="font-semibold text-primary">{tokenData?.budgetName}</span>.
          </p>
        </div>

        <div className="bg-muted/40 rounded-lg p-4 space-y-2 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">How this works:</p>
          <ol className="space-y-1 list-decimal list-inside">
            <li>Enter your name and contact details below</li>
            <li>Sign in or register if prompted</li>
            <li>The plan owner will approve your request</li>
            <li>Once approved you will get access to the plan</li>
          </ol>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Your name</Label>
            <Input placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Your phone or email</Label>
            <Input placeholder="0821234567 or you@email.com" value={contact} onChange={(e) => setContact(e.target.value)} />
          </div>
          <Button className="w-full font-bold" onClick={handleSubmit} disabled={isSubmitting || !name.trim() || !contact.trim()}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {currentUser ? 'Request Access' : 'Continue to Sign In'}
          </Button>
        </div>
      </div>
    </div>
  );
}
