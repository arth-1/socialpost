'use server';

/**
 * @fileOverview This file defines a Genkit flow for improving user-provided prompt suggestions.
 *
 * It takes an initial prompt as input and returns a refined, more detailed prompt that should generate better images.
 * - improvePromptSuggestion - The function to call to improve the prompt suggestion.
 * - ImprovePromptSuggestionInput - The input type for the improvePromptSuggestion function.
 * - ImprovePromptSuggestionOutput - The output type for the improvePromptSuggestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImprovePromptSuggestionInputSchema = z.object({
  prompt: z.string().describe('The initial prompt to be improved.'),
});


const ImprovePromptSuggestionOutputSchema = z.object({
  improvedPrompt: z
    .string()
    .describe('The improved prompt, with more detail and specificity.'),
});


export async function improvePromptSuggestion(input) {
  return improvePromptSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'improvePromptSuggestionPrompt',
  input: {schema: ImprovePromptSuggestionInputSchema},
  output: {schema: ImprovePromptSuggestionOutputSchema},
  prompt: `You are an AI prompt engineer. Your job is to take a user-provided prompt and improve it so that it is more likely to generate a high-quality image.

  The improved prompt should be more detailed and specific than the original prompt.

  Original prompt: {{{prompt}}}
  Improved prompt:`, 
});

const improvePromptSuggestionFlow = ai.defineFlow(
  {
    name: 'improvePromptSuggestionFlow',
    inputSchema: ImprovePromptSuggestionInputSchema,
    outputSchema: ImprovePromptSuggestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output;
  }
);
