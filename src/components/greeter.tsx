
'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import MotivationalQuote from './motivational-quote';
import type { User as AppUser } from '@/lib/types';
import { doc } from 'firebase/firestore';

const Greeter = ({ quote }: { quote?: string }) => {
  const { user: authUser, isUserLoading: isAuthUserLoading } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => (
    firestore && authUser ? doc(firestore, 'users', authUser.uid) : null
  ), [firestore, authUser]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<AppUser>(userDocRef);

  const [mainGreeting, setMainGreeting] = useState('');
  const [subGreeting, setSubGreeting] = useState('');

  useEffect(() => {
    if (isAuthUserLoading || isProfileLoading) {
      setMainGreeting('Welcome!');
      setSubGreeting("Let's get your planning done.");
      return;
    }

    const name = userProfile?.knownAs
                 || userProfile?.displayName?.split(' ')[0]
                 || authUser?.displayName?.split(' ')[0]
                 || authUser?.email?.split('@')[0]
                 || 'there';
    
    const hour = new Date().getHours();
    let timeOfDayGreeting = '';

    if (hour >= 4 && hour < 12) {
      timeOfDayGreeting = 'Good Morning';
    } else if (hour >= 12 && hour < 18) {
      timeOfDayGreeting = 'Good Afternoon';
    } else {
      timeOfDayGreeting = 'Good Evening';
    }
    
    setMainGreeting(`${timeOfDayGreeting}, ${name}!`);
    setSubGreeting("Let's get your planning done.");

  }, [authUser, userProfile, isAuthUserLoading, isProfileLoading]);

  return (
    <div className="mt-8 text-center">
      <h2 className="text-3xl font-bold font-headline text-foreground/90">
        {mainGreeting}
      </h2>
      {subGreeting && (
        <p className="mt-2 text-muted-foreground font-bold italic">{subGreeting}</p>
      )}
      <MotivationalQuote quote={quote} />
    </div>
  );
};

export default Greeter;

    