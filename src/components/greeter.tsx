
'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/firebase';

const Greeter = () => {
  const { user } = useUser();
  const [mainGreeting, setMainGreeting] = useState('');
  const [subGreeting, setSubGreeting] = useState('');

  useEffect(() => {
    const name = user?.displayName || 'there';
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
    <div className="mt-8">
      <h2 className="text-3xl font-bold font-headline text-foreground/90">
        {mainGreeting}
      </h2>
      {subGreeting && (
        <p className="mt-2 text-muted-foreground font-bold italic">{subGreeting}</p>
      )}
    </div>
  );
};

export default Greeter;
