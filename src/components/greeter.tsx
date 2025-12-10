"use client";

import { useState, useEffect } from 'react';

interface GreeterProps {
    name: string;
}

const Greeter = ({ name }: GreeterProps) => {
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return `Good Morning, ${name}!`;
      if (hour < 18) return `Good Afternoon, ${name}!`;
      return `Good Evening, ${name}! Let's pick up where we left off with our planning...`;
    };
    setGreeting(getGreeting());
  }, [name]);

  return (
    <h1 className="text-3xl font-bold font-headline text-foreground/90">
      {greeting}
    </h1>
  );
};

export default Greeter;
