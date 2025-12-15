
'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/firebase';
import MotivationalQuote from './motivational-quote';

const Greeter = ({ quote }: { quote?: string }) => {
  const { user } = useUser();
  const [mainGreeting, setMainGreeting] = useState('');
  const [subGreeting, setSubGreeting] = useState('');

  useEffect(() => {
    const name = user?.displayName?.split(' ')[0] || 'there';
    const hour = new Date().getHours();
    
    if (hour < 12) {
      setMainGreeting(`Good Morning, ${name}!`);
      setSubGreeting("Let's get your day planned out.");
    } else if (hour < 18) {
      setMainGreeting(`Good Afternoon, ${name}!`);
      setSubGreeting("Ready to continue planning?");
    } else {
      setMainGreeting(`Good Evening, ${name}!`);
      setSubGreeting("Let's pick up where we left off with our planning...");
    }
  }, [user]);

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
