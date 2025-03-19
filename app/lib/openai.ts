import OpenAI from 'openai';

// Initialize the OpenAI client with API key
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true // Allow usage in browser environment
});

export type OpenAIModelType = 
  | 'gpt-4' 
  | 'gpt-4-turbo' 
  | 'gpt-4-turbo-preview'
  | 'gpt-4-1106-preview'
  | 'gpt-4-vision-preview'
  | 'gpt-4-32k'
  | 'gpt-3.5-turbo'
  | 'gpt-3.5-turbo-16k';

export interface OpenAIRequestParams {
  model: OpenAIModelType;
  prompt: string;
  temperature?: number;
  max_tokens?: number;
}

export async function generateOpenAIResponse({
  model = 'gpt-4-turbo',
  prompt,
  temperature = 0.7,
  max_tokens = 2000,
}: OpenAIRequestParams) {
  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature,
      max_tokens,
    });

    return {
      content: response.choices[0]?.message?.content || '',
      model: response.model,
      usage: response.usage,
    };
  } catch (error) {
    console.error('Error generating OpenAI response:', error);
    throw new Error(`Failed to generate response from OpenAI: ${error.message}`);
  }
}

export default openai; 