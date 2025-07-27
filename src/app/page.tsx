'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, BrainCircuit, FileText, Mic, MessageSquareQuote } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
      <header className="py-4 px-4 md:px-8 border-b bg-card/50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground font-headline">
              LearnSense AI
            </h1>
          </div>
          <div className="space-x-2">
            <Button asChild variant="ghost">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="container mx-auto text-center py-20 lg:py-32">
          <h2 className="text-4xl lg:text-6xl font-bold font-headline mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            Unlock Deeper Understanding
          </h2>
          <p className="text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
            LearnSense AI is your personal learning and research assistant. Upload documents, ask
            questions, summarize content, and create quizzes to master any subject.
          </p>
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
            <Button asChild size="lg">
              <Link href="/signup">Get Started for Free</Link>
            </Button>
          </div>
        </section>

        <section className="bg-muted/50 py-20">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold font-headline">Features</h3>
              <p className="text-muted-foreground">Everything you need to accelerate your learning.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard
                icon={<FileText className="w-8 h-8 text-primary" />}
                title="Document Summarization"
                description="Get concise summaries of long documents to quickly grasp the main points."
              />
              <FeatureCard
                icon={<MessageSquareQuote className="w-8 h-8 text-primary" />}
                title="Interactive Q&A"
                description="Ask specific questions about your documents and get instant, context-aware answers."
              />
              <FeatureCard
                icon={<BrainCircuit className="w-8 h-8 text-primary" />}
                title="Concept Explanation"
                description="Struggling with a complex topic? Get simplified explanations and analogies."
              />
              <FeatureCard
                icon={<Mic className="w-8 h-8 text-primary" />}
                title="Personalized Quizzes"
                description="Test your knowledge by generating quizzes based on your study materials."
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="py-6 border-t">
        <div className="container mx-auto text-center text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} LearnSense AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <Card className="text-center">
            <CardHeader>
                <div className="mx-auto bg-primary/10 p-3 rounded-lg w-fit mb-2">
                    {icon}
                </div>
                <CardTitle className="font-headline">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <CardDescription>{description}</CardDescription>
            </CardContent>
        </Card>
    )
}
