import { generateOpenAIResponse, OpenAIModelType } from './openai';
import { generateAnthropicResponse, AnthropicModelType } from './anthropic';
import { generateOllamaResponse, getOllamaModels } from './ollama';

export type ModelProvider = 'openai' | 'anthropic' | 'ollama';

// Helper to determine if code is running in a browser environment
const isBrowser = typeof window !== 'undefined';

export interface AIRequestParams {
  provider: ModelProvider;
  model: string;
  prompt: string;
  temperature?: number;
  max_tokens?: number;
  isServerSide?: boolean; // Flag to indicate server-side execution
}

export interface AIResponse {
  content: string;
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens?: number;
  };
  provider: ModelProvider;
}

export async function generateAIResponse({
  provider,
  model,
  prompt,
  temperature = 0.7,
  max_tokens = 2000,
  isServerSide = false,
}: AIRequestParams): Promise<AIResponse> {
  try {
    // If we're in a browser environment and not explicitly set to run server-side
    // use the API routes instead of direct API calls
    if (isBrowser && !isServerSide) {
      const origin = window.location.origin;
      const apiUrl = `${origin}/api/completion`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider,
          model,
          prompt,
          temperature,
          max_tokens,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`AI API error: ${response.status}`);
      }
      
      return await response.json();
    }
    
    // Server-side or explicitly set to use direct API calls
    switch (provider) {
      case 'openai': {
        const response = await generateOpenAIResponse({
          model: model as OpenAIModelType,
          prompt,
          temperature,
          max_tokens,
        });
        
        return {
          ...response,
          provider,
          usage: {
            ...response.usage,
            total_tokens: (response.usage?.prompt_tokens || 0) + (response.usage?.completion_tokens || 0),
          },
        };
      }
      
      case 'anthropic': {
        const response = await generateAnthropicResponse({
          model: model as AnthropicModelType,
          prompt,
          temperature,
          max_tokens,
        });
        
        return {
          ...response,
          provider,
          usage: {
            ...response.usage,
            total_tokens: (response.usage?.prompt_tokens || 0) + (response.usage?.completion_tokens || 0),
          },
        };
      }
      
      case 'ollama': {
        const response = await generateOllamaResponse({
          model,
          prompt,
          temperature,
          max_tokens,
        });
        
        return {
          ...response,
          provider,
          usage: {
            ...response.usage,
            total_tokens: (response.usage?.prompt_tokens || 0) + (response.usage?.completion_tokens || 0),
          },
        };
      }
      
      default:
        throw new Error(`Unsupported AI provider: ${provider}`);
    }
  } catch (error) {
    console.error(`Error generating AI response from ${provider}:`, error);
    throw new Error(`Failed to generate AI response: ${error.message}`);
  }
}

// Available models by provider
export const availableModels = {
  openai: [
    { id: 'gpt-4-turbo-preview', name: 'GPT-4 Turbo Preview (128K)' },
    { id: 'gpt-4-1106-preview', name: 'GPT-4 Turbo 1106 (128K)' },
    { id: 'gpt-4-vision-preview', name: 'GPT-4 Vision (128K)' },
    { id: 'gpt-4-32k', name: 'GPT-4 32K' },
    { id: 'gpt-4', name: 'GPT-4 (8K)' },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo (128K)' },
    { id: 'gpt-3.5-turbo-16k', name: 'GPT-3.5 Turbo 16K' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo (4K)' },
  ],
  anthropic: [
    { id: 'claude-3-5-sonnet-20240620', name: 'Claude 3.5 Sonnet (200K)' },
    { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus (200K)' },
    { id: 'claude-3-sonnet-20240229', name: 'Claude 3.0 Sonnet (200K)' },
    { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku (200K)' },
  ],
  ollama: async () => {
    const ollamaModels = await getOllamaModels();
    return ollamaModels.map(model => ({
      id: model.name,
      name: model.name,
    }));
  },
}; 