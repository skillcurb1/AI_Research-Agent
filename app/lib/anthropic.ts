import Anthropic from '@anthropic-ai/sdk';

// Initialize the Anthropic client with API key
const anthropic = new Anthropic({
  apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || '',
  dangerouslyAllowBrowser: true, // Allow usage in browser environment
});

export type AnthropicModelType = 'claude-3-5-sonnet-20240620' | 'claude-3-opus-20240229' | 'claude-3-sonnet-20240229' | 'claude-3-haiku-20240307';

export interface AnthropicRequestParams {
  model: AnthropicModelType;
  prompt: string;
  temperature?: number;
  max_tokens?: number;
}

export async function generateAnthropicResponse({
  model = 'claude-3-sonnet-20240229',
  prompt,
  temperature = 0.7,
  max_tokens = 2000,
}: AnthropicRequestParams) {
  if (!process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY) {
    throw new Error('Anthropic API key is not set');
  }
  
  try {
    const response = await anthropic.messages.create({
      model,
      max_tokens,
      temperature,
      messages: [{ role: 'user', content: prompt }],
    });

    return {
      content: response.content[0]?.text || '',
      model: response.model,
      usage: {
        prompt_tokens: response.usage?.input_tokens || 0,
        completion_tokens: response.usage?.output_tokens || 0,
      },
    };
  } catch (error) {
    console.error('Error generating Anthropic response:', error);
    throw new Error(`Failed to generate response from Anthropic: ${error.message}`);
  }
}

export default anthropic; 