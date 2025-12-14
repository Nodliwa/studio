
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Facebook, Instagram, Send } from 'lucide-react';
import Link from 'next/link';

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 1200 1227" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.163 519.284ZM569.165 687.828L521.697 619.934L144.011 79.6902H306.615L596.021 389.542L643.489 457.436L1029.51 1142.1H866.905L569.165 687.828Z" />
    </svg>
);


const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
     <svg fill="currentColor" viewBox="0 0 24 24" aria-hidden="true" {...props}>
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-1.06-.6-1.97-1.46-2.65-2.49-.86-1.28-1.3-2.78-1.3-4.29 0-1.51.52-3.02 1.47-4.25 1.11-1.44 2.65-2.39 4.3-2.73.05-1.07.01-2.14-.02-3.21-1.22-.26-2.39-.75-3.36-1.52-1.26-1.02-2.08-2.45-2.34-4.04h4.03c.14 1.09.64 2.14 1.45 2.94.05.06.1.12.16.18z" />
    </svg>
);


export default function LandingFooter() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const fromEmail = formData.get('email') as string;
    const message = formData.get('message') as string;

    const subject = `Message from ${name} (${fromEmail})`;
    const body = encodeURIComponent(message);
    
    window.location.href = `mailto:hello@simpliplan.co.za?subject=${encodeURIComponent(subject)}&body=${body}`;
  };
  
  return (
    <footer className="w-full mt-24 py-8 bg-secondary border-t">
        <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto items-start">
                <div>
                     <Card>
                        <CardHeader className="text-center">
                            <CardTitle as="h3">We'd love to hear from you...</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Input id="name" name="name" placeholder="Your Name" />
                                    </div>
                                    <div className="space-y-2">
                                        <Input id="email" name="email" type="email" placeholder="Your Email" />
                                    </div>
                                </div>
                                <div className="relative">
                                    <Textarea id="message" name="message" placeholder="Your message..." className="pr-20 min-h-[120px]" />
                                    <Button type="submit" size="sm" className="absolute" style={{ bottom: '0.5rem', right: '0.5rem' }}>
                                        Send
                                        <Send className="ml-2 h-4 w-4"/>
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
                <div className="text-center md:text-center">
                    <h3 className="text-2xl font-headline font-bold">Connect with Us</h3>
                    <div className="flex justify-center items-center gap-4 mt-4">
                        <Link href="#" className="text-muted-foreground hover:text-primary">
                            <Facebook className="h-6 w-6" />
                        </Link>
                        <Link href="#" className="text-muted-foreground hover:text-primary">
                            <XIcon className="h-6 w-6" />
                        </Link>
                         <Link href="#" className="text-muted-foreground hover:text-primary">
                            <Instagram className="h-6 w-6" />
                        </Link>
                         <Link href="#" className="text-muted-foreground hover:text-primary">
                            <TikTokIcon className="h-6 w-6" />
                        </Link>
                    </div>
                </div>
            </div>
            <div className="mt-12 text-center text-muted-foreground text-sm">
                <p>&copy; {new Date().getFullYear()} SimpliPlan. All rights reserved.</p>
                <div className="flex justify-center gap-4 mt-2">
                    <Link href="/terms" className="hover:text-primary underline">
                        Terms of Service
                    </Link>
                    <Link href="/privacy" className="hover:text-primary underline">
                        Privacy Policy
                    </Link>
                </div>
            </div>
        </div>
    </footer>
  );
}
