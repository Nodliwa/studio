'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import Link from 'next/link';

export default function LandingFooter() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, you would handle form submission here.
    // For now, it just prevents the default form action.
  };
  
  return (
    <footer className="w-full mt-24 py-8 bg-secondary border-t">
        <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
                <div>
                     <Card>
                        <CardHeader className="text-center">
                            <CardTitle as="h2">Suggestions / Comments / Queries</CardTitle>
                            <CardDescription>We'd love to hear from you. Drop us a message below.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input id="name" placeholder="Your Name" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" type="email" placeholder="Your Email" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="message">Message</Label>
                                    <Textarea id="message" placeholder="Your message..." />
                                </div>
                                <Button type="submit" className="w-full">Send Message</Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
                <div className="text-center md:text-left">
                    <h3 className="text-2xl font-headline font-bold">Connect with Us</h3>
                    <p className="text-muted-foreground mt-2">Follow us on social media to stay updated.</p>
                    <div className="flex justify-center md:justify-start items-center gap-4 mt-4">
                        <Link href="#" className="text-muted-foreground hover:text-primary">
                            <Facebook className="h-6 w-6" />
                        </Link>
                        <Link href="#" className="text-muted-foreground hover:text-primary">
                            <Twitter className="h-6 w-6" />
                        </Link>
                         <Link href="#" className="text-muted-foreground hover:text-primary">
                            <Instagram className="h-6 w-6" />
                        </Link>
                         <Link href="#" className="text-muted-foreground hover:text-primary">
                            <Linkedin className="h-6 w-6" />
                        </Link>
                    </div>
                </div>
            </div>
            <div className="mt-12 text-center text-muted-foreground text-sm">
                <p>&copy; {new Date().getFullYear()} SimpliPlan. All rights reserved.</p>
            </div>
        </div>
    </footer>
  );
}
