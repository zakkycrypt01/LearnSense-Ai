'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LoadingSpinner } from './loading-spinner';
import { QuizView } from './quiz-view';
import type { AIResult } from '@/app/study/page';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { History, Trash2 } from 'lucide-react';
import Link from 'next/link';


interface AIToolsProps {
  isProcessing: boolean;
  isHistoryLoading: boolean;
  aiResults: AIResult[];
  onAction: (tool: 'summary' | 'qa' | 'concept' | 'quiz', params?: any) => void;
  onClearHistory: () => void;
  documentLoaded: boolean;
}

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
    // For non-quiz results, wrap them in a scroll area directly
    return (
        <ScrollArea className="h-auto max-h-[60vh] pr-4">
            <div className="text-sm whitespace-pre-wrap leading-relaxed">{data.summary || data.answer || data.explanation}</div>
        </ScrollArea>
    );
}

export function AITools({ isProcessing, isHistoryLoading, aiResults, onAction, onClearHistory, documentLoaded }: AIToolsProps) {
  const [qaQuestion, setQaQuestion] = useState('');
  const [concept, setConcept] = useState('');
  const [activeTab, setActiveTab] = useState('summary');
  
  const latestResultForTab = (tab: string) => {
    const resultsForTab = aiResults.filter(r => r.tool === tab);
    return resultsForTab.length > 0 ? resultsForTab[resultsForTab.length - 1] : null;
  }

  const renderResult = (result: AIResult | null) => {
    if (!result) return null;
    
    // QuizView now manages its own Card and scrolling, so we just return it.
    if (result.tool === 'quiz') {
      return getResultContent(result);
    }
    
    // Other results are wrapped in a Card.
    return (
       <Card className="mt-6">
        <CardHeader>
          <CardTitle className="font-headline">{getResultTitle(result)}</CardTitle>
        </CardHeader>
        <CardContent>
          {getResultContent(result)}
        </CardContent>
      </Card>
    );
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">AI Learning Tools</CardTitle>
        <CardDescription>
          {!documentLoaded 
            ? 'Upload a document to activate these tools.'
            : 'Select a tool to analyze your document or view your history.'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="summary" disabled={!documentLoaded || isProcessing}>Summary</TabsTrigger>
            <TabsTrigger value="qa" disabled={!documentLoaded || isProcessing}>Q&A</TabsTrigger>
            <TabsTrigger value="concept" disabled={!documentLoaded || isProcessing}>Concept</TabsTrigger>
            <TabsTrigger value="quiz" disabled={!documentLoaded || isProcessing}>Quiz</TabsTrigger>
            <TabsTrigger value="history" asChild>
                <Link href="/study/history">History</Link>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary" className="py-4">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Get a concise summary of your document's key points.
              </p>
              <Button onClick={() => { onAction('summary'); }} disabled={!documentLoaded || isProcessing}>
                {isProcessing && activeTab === 'summary' ? <LoadingSpinner /> : null}
                Generate Summary
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="qa" className="py-4">
            <form onSubmit={(e) => { e.preventDefault(); onAction('qa', { question: qaQuestion }); }} className="space-y-4">
              <Label htmlFor="qa-question">Ask a question about the document:</Label>
              <Textarea
                id="qa-question"
                placeholder="e.g., What is the main argument of the author?"
                value={qaQuestion}
                onChange={(e) => setQaQuestion(e.target.value)}
                disabled={!documentLoaded || isProcessing}
              />
              <Button type="submit" disabled={!documentLoaded || isProcessing || !qaQuestion}>
                 {isProcessing && activeTab === 'qa' ? <LoadingSpinner /> : null}
                Get Answer
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="concept" className="py-4">
             <form onSubmit={(e) => { e.preventDefault(); onAction('concept', { concept }); }} className="space-y-4">
              <Label htmlFor="concept">Explain a concept from the document:</Label>
              <Input
                id="concept"
                placeholder="e.g., Photosynthesis"
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                disabled={!documentLoaded || isProcessing}
              />
              <Button type="submit" disabled={!documentLoaded || isProcessing || !concept}>
                {isProcessing && activeTab === 'concept' ? <LoadingSpinner /> : null}
                Explain Concept
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="quiz" className="py-4">
            <div className="space-y-4">
               <p className="text-sm text-muted-foreground">
                Test your knowledge with a personalized quiz based on the document.
              </p>
              <Button onClick={() => { onAction('quiz'); }} disabled={!documentLoaded || isProcessing}>
                {isProcessing && activeTab === 'quiz' ? <LoadingSpinner /> : null}
                Generate Quiz
              </Button>
            </div>
          </TabsContent>

           <TabsContent value="history" className="py-4">
             <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <History className="text-muted-foreground"/>
                    <h3 className="text-lg font-headline">History for Current Document</h3>
                </div>
                <Button variant="outline" size="sm" onClick={onClearHistory} disabled={!documentLoaded || aiResults.length === 0 || isProcessing || isHistoryLoading}>
                    <Trash2 className="mr-2 h-4 w-4"/>
                    Clear
                </Button>
             </div>
              {isHistoryLoading ? (
                 <div className="flex flex-col items-center gap-2 text-muted-foreground min-h-[10rem] justify-center">
                    <LoadingSpinner />
                    <p>Loading history...</p>
                 </div>
              ) : aiResults.length > 0 ? (
                <ScrollArea className="h-[60vh] pr-4">
                  <Accordion type="multiple" className="w-full space-y-4" defaultValue={aiResults.map(r => r.id)}>
                    {aiResults.slice().reverse().map((result) => (
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
              ) : (
                <div className="text-center text-muted-foreground p-8 rounded-lg bg-muted/30">
                  {documentLoaded ? (
                    <>
                        <p>Your history for this document is empty.</p>
                        <p className="text-sm">Generated results will appear here.</p>
                    </>
                  ) : (
                     <>
                        <p>Upload a document to see its history.</p>
                     </>
                  )}
                </div>
              )}
          </TabsContent>
        </Tabs>

        {activeTab !== 'history' && (
             <div className="mt-6 min-h-[10rem] rounded-lg bg-muted/30 flex items-center justify-center data-[state=open]:animate-in fade-in-50 duration-500">
                {isProcessing ? (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <LoadingSpinner />
                    <p>Your AI companion is thinking...</p>
                    </div>
                ) : latestResultForTab(activeTab) ? (
                    <div className="w-full">{renderResult(latestResultForTab(activeTab))}</div>
                ) : (
                    <div className="text-center text-muted-foreground p-8">
                      {documentLoaded ? 
                        <p>Your AI-generated results will appear here.</p> :
                        <p>Upload a document to get started.</p>
                      }
                    </div>
                )}
            </div>
        )}
      </CardContent>
    </Card>
  );
}
