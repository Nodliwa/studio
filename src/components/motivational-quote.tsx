
'use client';

import { useState, useEffect } from 'react';

const motivationalQuotes = [
  "Believe you can and you're halfway there. - Theodore Roosevelt",
  "The only way to do great work is to love what you do. - Steve Jobs",
  "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
  "Don't watch the clock; do what it does. Keep going. - Sam Levenson",
  "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
  "The secret of getting ahead is getting started. - Mark Twain",
  "It does not matter how slowly you go as long as you do not stop. - Confucius",
  "Your limitation—it's only your imagination.",
  "Push yourself, because no one else is going to do it for you.",
  "Great things never come from comfort zones."
];

const MotivationalQuote = ({ quote: propQuote }: { quote?: string }) => {
  const [quote, setQuote] = useState('');

  useEffect(() => {
    if (propQuote) {
        setQuote(propQuote);
    } else {
        // This code runs only on the client, after hydration
        const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
        setQuote(motivationalQuotes[randomIndex]);
    }
  }, [propQuote]); // Rerun if the prop changes

  if (!quote) {
    // Render a placeholder or nothing on the server and during initial client render
    return <p className="mt-4 italic text-muted-foreground">&nbsp;</p>;
  }

  return (
    <p className="mt-4 text-base italic text-muted-foreground">
      {`"${quote}"`}
    </p>
  );
};

export default MotivationalQuote;

    