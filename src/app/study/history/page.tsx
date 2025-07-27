'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/app/header';
import { LoadingSpinner } from '@/components/app/loading-spinner';
import { getAllHistory, type DocumentHistory } from '@/services/historyService';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, BookText } from 'lucide-react';
import type { AIResult } from '@/app/study/page';
import { QuizView } from '@/components/app/quiz-view';
import { ScrollArea } from '@/components/ui/scroll-area';

const getResultTitle = (result: AIResult) => {
    switch (result.tool) {
        case 'summary': return 'Summary';
        case 'qa': return 'Answer';
        case 'concept': return 'Explanation';
        case 'quiz': return 'Quiz';
    }
}

const getResultContent = (result: AIResult) => {
    if (result.tool === 'quiz') {
        return <QuizView quizData={(result.data as any).quiz} />;
    }
    const data = result.data as any;
    return <div className="text-sm whitespace-pre-wrap leading-relaxed">{data.summary || data.answer || data.explanation}</div>;
}

export default function HistoryPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [history, setHistory] = useState<DocumentHistory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        } else if (user) {
            fetchHistory();
        }
    }, [user, authLoading, router]);

    const fetchHistory = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const userHistory = await getAllHistory(user.uid);
            setHistory(userHistory);
        } catch (error: any) {
            toast({
                title: 'Error Fetching History',
                description: error.message || 'Could not retrieve your history.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (authLoading || isLoading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <LoadingSpinner className="h-12 w-12" />
                    <p>Loading your history...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
            <Header />
            <main className="flex-1 container mx-auto py-8 px-4">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold font-headline">Your Learning History</h1>
                    <Button asChild variant="outline">
                        <Link href="/study">
                            <ArrowLeft className="mr-2" />
                            Back to Study
                        </Link>
                    </Button>
                </div>

                {history.length > 0 ? (
                     <Accordion type="multiple" className="w-full space-y-4">
                        {history.map((docHistory) => (
                             <Card key={docHistory.id}>
                                <AccordionItem value={docHistory.id} className="border-none">
                                    <AccordionTrigger className="p-6 hover:no-underline">
                                        <div className="flex items-center gap-3">
                                            <BookText className="text-primary w-6 h-6"/>
                                            <div className="text-left">
                                                <CardTitle className="font-headline text-xl">{docHistory.id}</CardTitle>
                                                <CardDescription>{docHistory.history.length} interaction(s)</CardDescription>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-6 pb-6">
                                        <ScrollArea className="h-[60vh] pr-4 border-t pt-4">
                                            <Accordion type="multiple" className="w-full space-y-4" defaultValue={docHistory.history.map(h => h.id)}>
                                                {docHistory.history.slice().reverse().map((result) => (
                                                    <AccordionItem value={result.id} key={result.id} className="border rounded-lg px-4 bg-background/50">
                                                        <AccordionTrigger className="hover:no-underline text-left">
                                                        <div className="flex items-center gap-3">
                                                            <span className="font-bold text-primary">{getResultTitle(result)}</span>
                                                            <p className="text-sm text-muted-foreground truncate">{new Date(result.id).toLocaleString()}</p>
                                                        </div>
                                                        </AccordionTrigger>
                                                        <AccordionContent>
                                                        {getResultContent(result)}
                                                        </AccordionContent>
                                                    </AccordionItem>
                                                ))}
                                            </Accordion>
                                        </ScrollArea>
                                    </AccordionContent>
                                </AccordionItem>
                            </Card>
                        ))}
                     </Accordion>
                ) : (
                    <Card className="text-center p-12">
                        <CardTitle className="font-headline">No History Found</CardTitle>
                        <CardDescription className="mt-2">
                            It looks like you haven&apos;t analyzed any documents yet.
                        </CardDescription>
                        <Button asChild className="mt-4">
                           <Link href="/study">Start Learning</Link>
                        </Button>
                    </Card>
                )}

            </main>
        </div>
    );
}
