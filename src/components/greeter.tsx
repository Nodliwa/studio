
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
      setSubGreeting('');
    } else if (hour < 18) {
      setMainGreeting(`Good Afternoon, ${name}!`);
      setSubGreeting('');
    } else {
      setMainGreeting(`Good Evening, ${name}!`);
      setSubGreeting("Let's pick up where we left off with our planning...");
    }
  }, [user]);

  const name = user?.displayName || 'there';

  return (
    <div>
      <h1 className="text-3xl font-bold font-headline text-foreground/90">
        {mainGreeting}
      </h1>
      {subGreeting && name !== 'there' && (
        <p className="mt-2 text-muted-foreground font-bold italic">{subGreeting}</p>
      )}
    </div>
  );
};

export default Greeter;
