'use client';

import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/app/header';
import { DocumentUploader } from '@/components/app/document-uploader';
import { AITools } from '@/components/app/ai-tools';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import {
  summarizeDocument,
  type SummarizeDocumentOutput,
} from '@/ai/flows/document-summarization';
import {
  interactiveQuestionAnswer,
  type InteractiveQuestionAnswerOutput,
} from '@/ai/flows/interactive-question-answer';
import {
  explainConcept,
  type ExplainConceptOutput,
} from '@/ai/flows/concept-explanation';
import { quizGenerationFlow, type QuizGenerationOutput } from '@/ai/flows/quiz-generation';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/app/loading-spinner';
import { getHistory, saveHistory, clearHistory } from '@/services/historyService';

export type AIResult = {
  id: string;
  tool: 'summary' | 'qa' | 'concept' | 'quiz';
  data:
    | SummarizeDocumentOutput
    | InteractiveQuestionAnswerOutput
    | ExplainConceptOutput
    | QuizGenerationOutput;
};

export default function StudyPage() {
  const [document, setDocument] = useState<{ name: string; content: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [aiResults, setAiResults] = useState<AIResult[]>([]);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleFileUpload = useCallback(async (file: { name: string; content: string }) => {
    if (!user) {
        toast({
            title: 'Not Logged In',
            description: 'You must be logged in to upload documents.',
            variant: 'destructive',
        });
        return;
    }
    
    setDocument(file);
    setAiResults([]); 
    setIsHistoryLoading(true);

    try {
      const history = await getHistory(user.uid, file.name);
      setAiResults(history);
    } catch (error: any) {
      console.error("Failed to get history:", error);
      toast({
        title: 'Could not load history',
        description: `An error occurred: ${error.message}`,
        variant: 'destructive'
      });
    } finally {
        setIsHistoryLoading(false);
    }
    toast({
      title: 'Document Uploaded',
      description: `${file.name} is ready for analysis.`,
    });
  }, [user, toast]);

  const handleClearHistory = useCallback(async () => {
    if (!document || !user) return;
    
    try {
        await clearHistory(user.uid, document.name);
        setAiResults([]);
        toast({
            title: 'History Cleared',
            description: `The history for ${document.name} has been cleared.`,
        });
    } catch (error: any) {
        toast({
            title: 'Error',
            description: error.message || 'Could not clear history. Please try again.',
            variant: 'destructive'
        });
    }
  }, [document, user, toast]);

  const handleAiAction = async (tool: 'summary' | 'qa' | 'concept' | 'quiz', params: any) => {
    if (!document || !user) {
      toast({
        title: 'No document uploaded',
        description: 'Please upload a document first.',
        variant: 'destructive',
      });
      return;
    }
    setIsProcessing(true);
    try {
      let result;
      switch (tool) {
        case 'summary':
          result = await summarizeDocument({ documentContent: document.content });
          break;
        case 'qa':
          result = await interactiveQuestionAnswer({
            documentContent: document.content,
            question: params.question,
          });
          break;
        case 'concept':
          result = await explainConcept({
            documentContent: document.content,
            concept: params.concept,
          });
          break;
        case 'quiz':
          result = await quizGenerationFlow({ documentContent: document.content, numberOfQuestions: 5 });
          break;
        default:
          throw new Error('Unknown tool');
      }
      const newResult: AIResult = { tool, data: result, id: new Date().toISOString() };
      
      setAiResults(prevResults => {
          const newHistory = [...prevResults, newResult];
          saveHistory(user.uid, document.name, newHistory).catch(e => {
            console.error("Failed to save history:", e);
             toast({
              title: 'Error Saving History',
              description: e.message || "Could not save the latest result to the database.",
              variant: 'destructive',
            });
          });
          return newHistory;
      });

    } catch (e: any) {
      const errorMessage = e.message || 'An unexpected error occurred.';
      toast({
        title: 'AI Error',
        description: `Could not generate a response: ${errorMessage}`,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  if (authLoading || !user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <LoadingSpinner className="h-12 w-12" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
      <Header />
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-6">
            <DocumentUploader onFileUpload={handleFileUpload} isProcessing={isProcessing} />
            {document && (
              <Card className="animate-in fade-in duration-500">
                <CardHeader>
                  <CardTitle className="font-headline">{document.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96 rounded-md border p-4 bg-muted/50">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {document.content}
                    </p>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>
          <div className="lg:col-span-7 sticky top-8">
            <AITools
              isProcessing={isProcessing}
              isHistoryLoading={isHistoryLoading}
              aiResults={aiResults}
              onAction={handleAiAction}
              onClearHistory={handleClearHistory}
              documentLoaded={!!document}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
