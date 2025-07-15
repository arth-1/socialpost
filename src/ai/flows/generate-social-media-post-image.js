'use server';
/**
 * @fileOverview Generates a social media post image based on a text prompt.
 *
 * - generateSocialMediaPostImage - A function that handles the social media post image generation process.
 * - GenerateSocialMediaPostImageInput - The input type for the generateSocialMediaPostImage function.
 * - GenerateSocialMediaPostImageOutput - The return type for the generateSocialMediaPostImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSocialMediaPostImageInputSchema = z.object({
  prompt: z.string().describe('The text prompt describing the desired social media post.'),
});


const GenerateSocialMediaPostImageOutputSchema = z.object({
  imageDataUri: z.string().describe('The generated image as a data URI.'),
});


export async function generateSocialMediaPostImage(input) {
  return generateSocialMediaPostImageFlow(input);
}

const generateSocialMediaPostImageFlow = ai.defineFlow(
  {
    name: 'generateSocialMediaPostImageFlow',
    inputSchema: GenerateSocialMediaPostImageInputSchema,
    outputSchema: GenerateSocialMediaPostImageOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      // IMPORTANT: ONLY the googleai/gemini-2.0-flash-preview-image-generation model is able to generate images. You MUST use exactly this model to generate images.
      model: 'googleai/gemini-2.0-flash-preview-image-generation',

      prompt: input.prompt,

      config: {
        responseModalities: ['TEXT', 'IMAGE'], // MUST provide both TEXT and IMAGE, IMAGE only won't work
      },
    });

    if (!media || !media.url) {
      throw new Error('No image was generated.');
    }

    return {imageDataUri: media.url};
  }
);
