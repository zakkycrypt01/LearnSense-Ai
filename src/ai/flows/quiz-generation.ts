'use server';

/**
 * @fileOverview Generates a personalized quiz from document content.
 *
 * - quizGenerationFlow - A function that takes document content and generates a quiz.
 * - QuizGenerationInput - The input type for the quizGenerationFlow function.
 * - QuizGenerationOutput - The return type for the quizGenerationFlow function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const QuizGenerationInputSchema = z.object({
  documentContent: z.string().describe('The content of the document to generate a quiz from.'),
  numberOfQuestions: z.number().optional().default(5).describe('The number of questions to generate.'),
});
export type QuizGenerationInput = z.infer<typeof QuizGenerationInputSchema>;

const QuizQuestionSchema = z.object({
  question: z.string().describe('The question text.'),
  options: z.array(z.string()).length(4).describe('An array of 4 possible answers.'),
  correctAnswer: z.string().describe('The correct answer from the options.'),
  explanation: z.string().describe('A brief explanation of why the answer is correct.'),
});

const QuizGenerationOutputSchema = z.object({
  quiz: z.array(QuizQuestionSchema).describe('An array of quiz questions.'),
});
export type QuizGenerationOutput = z.infer<typeof QuizGenerationOutputSchema>;

export async function quizGenerationFlow(input: QuizGenerationInput): Promise<QuizGenerationOutput> {
  return quizFlow(input);
}

const quizGenerationPrompt = ai.definePrompt({
  name: 'quizGenerationPrompt',
  input: { schema: QuizGenerationInputSchema },
  output: { schema: QuizGenerationOutputSchema },
  prompt: `You are an AI assistant that creates personalized quizzes from provided text. Based on the document content below, generate a multiple-choice quiz with {{{numberOfQuestions}}} questions to test understanding. Each question should have exactly 4 options, and you must clearly indicate the correct answer. For each question, also provide a concise explanation for why the answer is correct, referencing the source text where possible.

Document Content:
{{{documentContent}}}
`,
});

const quizFlow = ai.defineFlow(
  {
    name: 'quizGenerationFlow',
    inputSchema: QuizGenerationInputSchema,
    outputSchema: QuizGenerationOutputSchema,
  },
  async (input) => {
    const { output } = await quizGenerationPrompt(input);
    return output!;
  }
);
