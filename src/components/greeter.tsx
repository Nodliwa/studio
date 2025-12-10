"use client";

import { useState, useEffect } from 'react';

interface GreeterProps {
    name: string;
}

const Greeter = ({ name }: GreeterProps) => {
  const [mainGreeting, setMainGreeting] = useState('');
  const [subGreeting, setSubGreeting] = useState('');

  useEffect(() => {
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
  }, [name]);

  return (
    <div>
      <h1 className="text-3xl font-bold font-headline text-foreground/90">
        {mainGreeting}
      </h1>
      {subGreeting && (
        <p className="mt-2 text-muted-foreground">{subGreeting}</p>
      )}
    </div>
  );
};

export default Greeter;
