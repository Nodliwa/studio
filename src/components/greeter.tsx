
'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/firebase';
import MotivationalQuote from './motivational-quote';

const Greeter = ({ quote }: { quote?: string }) => {
  const { user, isUserLoading } = useUser();
  const [mainGreeting, setMainGreeting] = useState('');
  const [subGreeting, setSubGreeting] = useState('');

  useEffect(() => {
    if (isUserLoading) {
        setMainGreeting('Welcome!');
        setSubGreeting("Let's get your planning done.");
        return;
    }

    const name = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'there';
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

  }, [user, isUserLoading]);

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
