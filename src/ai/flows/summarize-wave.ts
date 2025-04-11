// SummarizeWave is a Genkit flow that takes wave content and generates a summary.
// It exports a function summarizeWave that takes a SummarizeWaveInput and returns a SummarizeWaveOutput.
'use server';

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SummarizeWaveInputSchema = z.object({
  waveContent: z.string().describe('The content of the wave to summarize.'),
});
export type SummarizeWaveInput = z.infer<typeof SummarizeWaveInputSchema>;

const SummarizeWaveOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the wave content.'),
});
export type SummarizeWaveOutput = z.infer<typeof SummarizeWaveOutputSchema>;

export async function summarizeWave(input: SummarizeWaveInput): Promise<SummarizeWaveOutput> {
  return summarizeWaveFlow(input);
}

const summarizeWavePrompt = ai.definePrompt({
  name: 'summarizeWavePrompt',
  input: {
    schema: z.object({
      waveContent: z.string().describe('The content of the wave to summarize.'),
    }),
  },
  output: {
    schema: z.object({
      summary: z.string().describe('A concise summary of the wave content.'),
    }),
  },
  prompt: `Summarize the following wave content in a concise manner:\n\n{{{waveContent}}}`, 
});

const summarizeWaveFlow = ai.defineFlow<
  typeof SummarizeWaveInputSchema,
  typeof SummarizeWaveOutputSchema
>({
  name: 'summarizeWaveFlow',
  inputSchema: SummarizeWaveInputSchema,
  outputSchema: SummarizeWaveOutputSchema,
},
async input => {
  const {output} = await summarizeWavePrompt(input);
  return output!;
});
