'use client';

import { BookOpen, LogOut, User } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '../ui/button';
import Link from 'next/link';

export function Header() {
  const { user, loading, signOut } = useAuth();

  return (
    <header className="py-4 px-4 md:px-8 border-b bg-card/50">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-lg">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground font-headline">
            LearnSense AI
          </h1>
        </Link>
        <div>
          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground hidden sm:inline">Welcome, {user.email}</span>
                    <Button variant="ghost" size="icon" onClick={signOut}>
                        <LogOut />
                    </Button>
                </div>
              ) : (
                <div className="space-x-2">
                  <Button asChild variant="ghost">
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/signup">Sign Up</Link>
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
