'use server';

/**
 * @fileOverview Implements the interactive question answering flow for document content.
 *
 * - interactiveQuestionAnswer - A function that takes a document and a question, and returns an answer with citations.
 * - InteractiveQuestionAnswerInput - The input type for the interactiveQuestionAnswer function.
 * - InteractiveQuestionAnswerOutput - The return type for the interactiveQuestionAnswer function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InteractiveQuestionAnswerInputSchema = z.object({
  documentContent: z.string().describe('The content of the document to ask questions about.'),
  question: z.string().describe('The question to ask about the document.'),
});
export type InteractiveQuestionAnswerInput = z.infer<
  typeof InteractiveQuestionAnswerInputSchema
>;

const InteractiveQuestionAnswerOutputSchema = z.object({
  answer: z.string().describe('The answer to the question, with citations.'),
});
export type InteractiveQuestionAnswerOutput = z.infer<
  typeof InteractiveQuestionAnswerOutputSchema
>;

export async function interactiveQuestionAnswer(
  input: InteractiveQuestionAnswerInput
): Promise<InteractiveQuestionAnswerOutput> {
  return interactiveQuestionAnswerFlow(input);
}

const interactiveQuestionAnswerPrompt = ai.definePrompt({
  name: 'interactiveQuestionAnswerPrompt',
  input: {schema: InteractiveQuestionAnswerInputSchema},
  output: {schema: InteractiveQuestionAnswerOutputSchema},
  prompt: `You are a helpful AI assistant that answers questions about a given document.  You should cite the specific parts of the document that you used to answer the question.

Document Content: {{{documentContent}}}

Question: {{{question}}}

Answer:`, // citing references from the source document.
});

const interactiveQuestionAnswerFlow = ai.defineFlow(
  {
    name: 'interactiveQuestionAnswerFlow',
    inputSchema: InteractiveQuestionAnswerInputSchema,
    outputSchema: InteractiveQuestionAnswerOutputSchema,
  },
  async input => {
    const {output} = await interactiveQuestionAnswerPrompt(input);
    return output!;
  }
);
