// Ollama API integration

const OLLAMA_BASE_URL = process.env.NEXT_PUBLIC_OLLAMA_BASE_URL || 'http://localhost:11434';

// Helper to determine if code is running in a browser environment
const isBrowser = typeof window !== 'undefined';

export interface OllamaRequestParams {
  model: string; // e.g., 'llama3', 'mistral', etc.
  prompt: string;
  temperature?: number;
  max_tokens?: number;
}

export async function generateOllamaResponse({
  model,
  prompt,
  temperature = 0.7,
  max_tokens = 2000,
}: OllamaRequestParams) {
  try {
    let data;
    
    // In the browser, use the API route
    if (isBrowser) {
      const origin = window.location.origin;
      const apiUrl = `${origin}/api/ollama`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          prompt,
          temperature,
          max_tokens,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      data = await response.json();
    } 
    // In server environments, call Ollama directly
    else {
      const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          prompt,
          temperature,
          max_tokens,
          stream: false,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }
      
      data = await response.json();
    }
    
    return {
      content: data.response || '',
      model,
      usage: {
        prompt_tokens: data.prompt_eval_count || 0,
        completion_tokens: data.eval_count || 0,
      },
    };
  } catch (error) {
    console.error('Error generating Ollama response:', error);
    throw new Error(`Failed to generate response from Ollama: ${error.message}`);
  }
}

// Function to get available models from Ollama
export async function getOllamaModels() {
  try {
    let data;
    
    // In the browser, use the API route
    if (isBrowser) {
      const origin = window.location.origin;
      const apiUrl = `${origin}/api/ollama/models`;
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }
      
      data = await response.json();
    } 
    // In server environments, call Ollama directly
    else {
      const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
      
      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }
      
      data = await response.json();
    }
    
    return data.models || [];
  } catch (error) {
    console.error('Error fetching Ollama models:', error);
    return [];
  }
} 