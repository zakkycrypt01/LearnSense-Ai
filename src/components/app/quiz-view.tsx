'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CheckCircle2, XCircle, Trophy, ArrowLeft, ArrowRight, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { QuizGenerationOutput } from '@/ai/flows/quiz-generation';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

type QuizQuestion = QuizGenerationOutput['quiz'][0];

interface QuizViewProps {
  quizData: QuizQuestion[];
}

export function QuizView({ quizData }: QuizViewProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionIndex]: answer }));
  };

  const handleSubmit = () => {
    let newScore = 0;
    quizData.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        newScore++;
      }
    });
    setScore(newScore);
    setIsSubmitted(true);
  };
  
  const handleReset = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setIsSubmitted(false);
    setScore(0);
  }

  const getOptionClass = (question: QuizQuestion, option: string, index: number) => {
    if (!isSubmitted) return '';
    const isCorrect = option === question.correctAnswer;
    const isSelected = option === selectedAnswers[index];
    if (isCorrect) return 'border-success ring-2 ring-success';
    if (isSelected && !isCorrect) return 'border-destructive ring-2 ring-destructive';
    return 'border-border';
  };

  const currentQuestion = quizData[currentQuestionIndex];
  const progressValue = ((currentQuestionIndex + 1) / quizData.length) * 100;

  if (isSubmitted) {
    return (
        <Card className="mt-6 animate-in fade-in duration-500">
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <Trophy className="text-accent" />
                    Quiz Complete!
                </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
                 <p className="text-2xl font-bold text-primary">
                    You scored {score} out of {quizData.length}
                </p>
                <p className="text-muted-foreground mt-2">
                    {score / quizData.length > 0.7 ? "Great job!" : "Review the answers below to improve."}
                </p>
                <Button onClick={handleReset} className="mt-6">
                    Try Again
                </Button>
            </CardContent>
             <CardContent>
                <Accordion type="multiple" className="w-full space-y-4">
                    {quizData.map((question, index) => {
                         const userAnswer = selectedAnswers[index];
                         const isCorrect = userAnswer === question.correctAnswer;
                         return (
                            <AccordionItem value={`item-${index}`} key={index} className="border rounded-lg px-4 bg-background/50">
                                <AccordionTrigger className="hover:no-underline text-left">
                                    <div className="flex items-center gap-3">
                                        {isCorrect ? <CheckCircle2 className="text-success"/> : <XCircle className="text-destructive"/>}
                                        <p className="flex-1">{question.question}</p>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                     <div className="space-y-3">
                                        <div className="space-y-2">
                                            {question.options.map((option, optIndex) => {
                                                const isUserAnswer = userAnswer === option;
                                                const isRealAnswer = question.correctAnswer === option;
                                                
                                                return (
                                                    <div key={optIndex} className={cn(
                                                        "flex items-center gap-4 p-3 rounded-md border-2",
                                                        getOptionClass(question, option, index)
                                                    )}>
                                                         <div className="flex items-center gap-2">
                                                            {isRealAnswer && <CheckCircle2 className="text-success"/>}
                                                            {!isRealAnswer && isUserAnswer && <XCircle className="text-destructive"/>}
                                                            <span>{option}</span>
                                                         </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <Card className="bg-muted/50">
                                            <CardHeader className="flex-row items-center gap-2 p-3">
                                                <BookOpen className="text-primary w-5 h-5"/>
                                                <CardTitle className="text-base font-headline">Explanation</CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-3 pt-0">
                                                <p className="text-sm text-muted-foreground">{question.explanation}</p>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                         )
                    })}
                </Accordion>
             </CardContent>
        </Card>
    )
  }

  return (
    <Card className="mt-6 animate-in fade-in duration-500">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
            <Trophy className="text-accent" />
            Test Your Knowledge
        </CardTitle>
        <CardDescription>
          Question {currentQuestionIndex + 1} of {quizData.length}
        </CardDescription>
        <Progress value={progressValue} className="mt-2" />
      </CardHeader>
      <CardContent>
            <div className="mb-6 min-h-[250px]">
                <h3 className="font-bold text-lg mb-4">{currentQuestion.question}</h3>
                <RadioGroup
                className="space-y-2"
                onValueChange={(value) => handleAnswerChange(currentQuestionIndex, value)}
                value={selectedAnswers[currentQuestionIndex]}
                >
                {currentQuestion.options.map((option, optIndex) => (
                    <Label
                    key={optIndex}
                    htmlFor={`q${currentQuestionIndex}-opt${optIndex}`}
                    className={cn(
                        'flex items-center gap-4 p-3 rounded-md border-2 transition-all cursor-pointer hover:bg-muted/80'
                    )}
                    >
                    <RadioGroupItem value={option} id={`q${currentQuestionIndex}-opt${optIndex}`} />
                    <span>{option}</span>
                    </Label>
                ))}
                </RadioGroup>
            </div>
            
            <div className="flex justify-between items-center mt-6">
                <Button 
                    variant="outline"
                    onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                    disabled={currentQuestionIndex === 0}
                >
                    <ArrowLeft className="mr-2"/>
                    Previous
                </Button>

                {currentQuestionIndex < quizData.length - 1 ? (
                     <Button 
                        onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                        disabled={!selectedAnswers[currentQuestionIndex]}
                    >
                        Next
                        <ArrowRight className="ml-2"/>
                    </Button>
                ) : (
                    <Button 
                        onClick={handleSubmit}
                        disabled={!selectedAnswers[currentQuestionIndex]}
                    >
                        Submit Quiz
                    </Button>
                )}
            </div>
      </CardContent>
    </Card>
  );
}
